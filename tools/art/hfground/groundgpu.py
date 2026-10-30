"""The painted ground by img2img (hf-art-ground, 2026-10-29; polish report VI-8). One GPU job on Hugging Face: Qwen-Image with the style
model repaints each world's start (starts.py), then the seams are taken out between two passes (seam.py), results to the bucket
mshaffe111/w5-xfer under <SUB>/ (every picture as PNG, carriers of WebP q92 for hf_fs attach, w5/unpack_carrier.py).

Item kinds (env SPEC = the spec's bucket path; {"loras", "base", "items"}):
  tile   pass 1 at strength s1 (seed), made brick-periodic (seam.brick) -> <name>-base; then one pass 2 per seed in seeds2 at strength
         s2, its middle kept and the base's edges kept (seam.keep_border band), so every variant from one base shares its edges and any
         of them lays next to any other with no seam -> <name>-v<seed>
  strip  the same, periodic left to right only (seam.wrap_x), on the key colour -> <name>-base, <name>-v<seed>
  plain  one img2img (strength, seed) -> <name>
  vary / varystrip  pass 2 only, on the start itself (a texture already in the game): <name>-v<seed>, keeping the start's edges
The token reaches the job only as the secret HF_TOKEN.
"""
import io, json, os, sys, time, urllib.request
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from huggingface_hub import hf_hub_download

sys.path.insert(0, '/tmp')
import seam  # noqa: E402  (fetched next to this script)

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / os.environ['SUB']
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
TAG = os.environ.get('TAG', 'g')
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


from diffusers import QwenImageImg2ImgPipeline as P  # noqa: E402
pipe = P.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
repo, fn, scale = SPEC['loras']['style']
path = hf_hub_download(repo, fn, token=tok)
try:
    pipe.load_lora_weights(path, adapter_name='style')
except Exception as e:  # ai-toolkit key names
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
    pipe.load_lora_weights(sd2, adapter_name='style')
pipe.set_adapters(['style'], adapter_weights=[scale])
NEG = SPEC['neg']

starts = {}


def start(n):
    if n not in starts:
        with urllib.request.urlopen(SPEC['base'] + n, timeout=60) as r:
            starts[n] = Image.open(io.BytesIO(r.read())).convert('RGB')
    return starts[n]


def run(img, prompt, neg, strength, seed, w, h, steps=30):
    return pipe(prompt=prompt, negative_prompt=neg, image=img.resize((w, h), Image.LANCZOS), strength=strength, width=w, height=h,
                num_inference_steps=steps, true_cfg_scale=4.0, generator=torch.Generator('cuda').manual_seed(seed)).images[0].convert('RGB')


done = []


def keep(name, img):
    b = io.BytesIO(); img.save(b, 'PNG')
    put(f'{name}.png', b.getvalue())
    done.append((name, img))


for it in SPEC['items']:
    t1 = time.time()
    try:
        kind = it.get('kind', 'plain')
        w, h = it['w'], it['h']
        neg = it.get('neg', NEG)
        if kind == 'plain':
            keep(it['name'], run(start(it['start']), it['prompt'], neg, it['strength'], it['seed'], w, h))
        elif kind in ('vary', 'varystrip'):
            # (more variants of a texture already in the game: its own picture is the base, so each new one keeps its edges and lays
            # next to the old ones with no seam; 'varystrip' keeps only the left and right edges)
            base = start(it['start']).convert('RGB').resize((w, h), Image.LANCZOS)
            for sd in it['seeds2']:
                p2 = run(base, it['prompt'], neg, it['s2'], sd, w, h)
                keep(f"{it['name']}-v{sd}", seam.keep_border(base, p2, it.get('band', 72), x_only=(kind == 'varystrip')))
        else:
            p1 = run(start(it['start']), it['prompt'], neg, it['s1'], it['seed'], w, h)
            base = seam.brick(p1) if kind == 'tile' else seam.wrap_x(p1)
            keep(f"{it['name']}-base", base)
            for sd in it['seeds2']:
                p2 = run(base, it.get('prompt2', it['prompt']), neg, it['s2'], sd, w, h)
                keep(f"{it['name']}-v{sd}", seam.keep_border(base, p2, it.get('band', 72), x_only=(kind == 'strip')))
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', it['name'], repr(e)[:300], flush=True)


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    W = 2048
    H = (len(data) + W - 1) // W
    arr = np.zeros(W * H, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(H, W), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


chunk, size, k = [], 0, 0
for n, im in done:
    b = io.BytesIO(); im.save(b, 'WEBP', quality=92, method=4)
    x = b.getvalue()
    if chunk and size + len(x) > 5_500_000:
        put(f'carrier-{TAG}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
    chunk.append((f'{n}.webp', x)); size += len(x)
if chunk:
    put(f'carrier-{TAG}-{k}.png', carrier(chunk))
print('ALL_DONE', len(done), round(time.time() - t0), flush=True)
