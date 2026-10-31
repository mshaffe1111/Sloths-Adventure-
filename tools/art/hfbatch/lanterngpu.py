"""8-4 Lantern Run's art (2026-10-29; a copy of w6to10/img2imggpu.py): as that file, but the starts are read from the bucket
(GitHub raw, SPEC['base'] + start) and each item names its LoRAs ("loras": ["style"] or ["style", "pokey"], from SPEC["loras"]).

Props by img2img (2026-10-29): Qwen-Image with the style model repaints side-on start sheets (tools/art/w6to10/propstarts.py: the
world kits' own pieces, Matt's Gemini sprites and plain shapes, pasted up flat on a key colour), so the props keep the start's flat
side view and only the paint changes. Never a bare text prompt. One GPU job on Hugging Face; results to the bucket mshaffe111/w5-xfer:
  <SUB>/props/<name>.png          every picture at full size
  <SUB>/props/sheet-<tag>-<k>.jpg contact sheets (hf_fs attach)
  <SUB>/props/carrier-<tag>-<k>.png the pictures as WebP q92 packed byte for byte into greyscale PNGs under 6 MB (w5/unpack_carrier.py)
env SPEC = the spec's bucket path: {"loras": {"style": [repo, file, scale]}, "base": url prefix of the starts, "items": [{"name", "start",
"prompt", "strength", "seed", "w"?, "h"?, "steps"?}]}; SUB. The token reaches the job only as the secret HF_TOKEN.
"""
import io, json, os, time, urllib.request
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / os.environ['SUB']
def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


# (the spec and the starts from GitHub raw at the pushed branch: env SPEC is the spec's URL, the spec's "base" the starts' URL prefix)
SPEC = json.loads(fetch(os.environ['SPEC']))
TAG = os.environ.get('TAG', 'pr')
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


try:
    from diffusers import QwenImageImg2ImgPipeline as P
except Exception as e:
    print('no QwenImageImg2ImgPipeline:', repr(e)[:200], flush=True)
    from diffusers import AutoPipelineForImage2Image as P
pipe = P.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', type(pipe).__name__, round(time.time() - t0), flush=True)

def load(name):
    repo, fn, scale = SPEC['loras'][name]
    path = hf_hub_download(repo, fn, token=tok)
    try:
        pipe.load_lora_weights(path, adapter_name=name)
    except Exception as e:  # ai-toolkit key names, as stillsgpu.py
        print('LORA direct failed:', str(e)[:200], flush=True)
        from safetensors.torch import load_file
        sd2 = {}
        for k, v in load_file(path).items():
            k2 = k
            for pre in ('diffusion_model.', 'model.diffusion_model.', 'base_model.model.'):
                if k2.startswith(pre):
                    k2 = 'transformer.' + k2[len(pre):]
            if not k2.startswith('transformer.'):
                k2 = 'transformer.' + k2
            sd2[k2] = v
        pipe.load_lora_weights(sd2, adapter_name=name)
    return scale


SCALES = {n: load(n) for n in SPEC['loras']}

NEG = SPEC.get('neg', 'perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, floor, cast shadow')
# (a compact spec: each sheet tried at every strength and seed)
items = SPEC.get('items') or [{'name': f"{sh['name']}-s{round(st * 100)}-{sd}", 'start': sh['start'], 'prompt': sh['prompt'], 'strength': st, 'seed': sd,
                               'w': SPEC.get('w', 1536), 'h': SPEC.get('h', 1024)}
                              for sh in SPEC['sheets'] for st in SPEC['strengths'] for sd in SPEC['seeds']]
starts = {}
done = []
for it in items:
    t1 = time.time()
    try:
        if it['start'] not in starts:
            starts[it['start']] = Image.open(io.BytesIO(fetch(SPEC['base'] + it['start']))).convert('RGB')
        start = starts[it['start']]
        w, h = it.get('w', start.width), it.get('h', start.height)
        names = it.get('loras', ['style'])
        pipe.set_adapters(names, adapter_weights=[it.get('scales', {}).get(n, SCALES[n]) for n in names])
        img = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), image=start.resize((w, h), Image.LANCZOS),
                   strength=it['strength'], width=w, height=h, num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                   generator=torch.Generator('cuda').manual_seed(it.get('seed', 42))).images[0].convert('RGB')
        b = io.BytesIO(); img.save(b, 'PNG')
        put(f"props/{it['name']}.png", b.getvalue())
        done.append((it['name'], img))
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', it['name'], repr(e)[:300], flush=True)

for s in range(0, len(done), 12):
    part = done[s:s + 12]
    tw, cols = 480, 3
    th = max(round(tw * im.height / im.width) for _, im in part)
    rows = (len(part) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16)), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (n, im) in enumerate(part):
        x, y = (i % cols) * tw, (i // cols) * (th + 16)
        S.paste(im.resize((tw, round(tw * im.height / im.width)), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), n, fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=85)
    put(f'props/sheet-{TAG}-{s // 12}.jpg', b.getvalue())


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


chunk, size, k = [], 0, 0
for n, im in done:
    b = io.BytesIO(); im.save(b, 'WEBP', quality=92, method=4)
    x = b.getvalue()
    if chunk and size + len(x) > 5_800_000:
        put(f'props/carrier-{TAG}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
    chunk.append((f'{n}.webp', x)); size += len(x)
if chunk:
    put(f'props/carrier-{TAG}-{k}.png', carrier(chunk))
print('ALL_DONE', len(done), round(time.time() - t0), flush=True)
