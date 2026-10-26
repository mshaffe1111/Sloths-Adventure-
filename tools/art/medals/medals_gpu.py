"""The Trophy Room's painted medals (2026-10-26): tier medallions and emblems in the game's painted look, as one GPU job on Hugging Face.

Qwen-Image with the style model (mshaffe111/slothadv-style-lora), like gen/gen_stills.py, but the results go to the bucket
mshaffe111/w5-xfer mounted read-write at /out (the connector's token cannot write the game's HF repos):
  medals/raw/<name>.png             every picture at 1024
  medals/sheet-<n>.jpg              numbered contact sheets, to pick from with hf_fs attach
  medals/carrier-<n>.png            the pictures at 512 (lossless WebP), packed byte for byte into carrier PNGs under 6 MB each
                                    (tools/art/w5/unpack_carrier.py unpacks them on the session machine)
env SPEC = jobs/<spec>.json in the bucket: {"lora": [repo, file, scale], "items": [{"name", "prompt", "seed", "w"?, "h"?, "steps"?}]},
or the compact form make_spec.py writes ("kinds": a prompt template per kind, the words for each picture, and the seeds)
The token reaches the job only as the job secret HF_TOKEN.
"""
import io, json, os, time
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from diffusers import DiffusionPipeline
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
OUT = Path(os.environ.get('OUT', '/out'))
SPEC = json.loads((OUT / os.environ['SPEC']).read_text())
if 'items' not in SPEC:
    # the compact form (make_spec.py): {"kinds": {"md": {"tpl": "... {what} ...", "what": {name: words}, "seeds": [...]}, ...}}
    SPEC['items'] = [{'name': f'{k}-{n}-{seed}', 'seed': seed, 'prompt': kd['tpl'].format(what=w)}
                     for k, kd in SPEC['kinds'].items() for n, w in kd['what'].items() for seed in kd['seeds']]
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


pipe = DiffusionPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
repo, fn, sc = SPEC['lora']
path = hf_hub_download(repo, fn, token=tok)
try:
    pipe.load_lora_weights(path, adapter_name='style')
except Exception as e:  # the ai-toolkit key names, as gen_stills.py
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
pipe.set_adapters(['style'], adapter_weights=[sc])
NEG = SPEC.get('neg', 'text, letters, words, numbers, watermark, signature, frame, border, photo, 3d render, blurry, cropped, cut off')

done = []
for it in SPEC['items']:
    t1 = time.time()
    try:
        img = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), width=it.get('w', 1024), height=it.get('h', 1024),
                   num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                   generator=torch.Generator('cuda').manual_seed(it.get('seed', 42))).images[0].convert('RGB')
        b = io.BytesIO(); img.save(b, 'PNG')
        put(f"medals/raw/{it['name']}.png", b.getvalue())
        done.append((it['name'], img))
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', it['name'], repr(e)[:300], flush=True)

# numbered contact sheets, 6 across, 40 to a sheet
for s in range(0, len(done), 40):
    part = done[s:s + 40]
    tw, cols = 200, 6
    rows = (len(part) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (tw + 16)), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (n, im) in enumerate(part):
        x, y = (i % cols) * tw, (i // cols) * (tw + 16)
        S.paste(im.resize((tw, tw), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), n, fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=85)
    put(f'medals/sheet-{s // 40}.jpg', b.getvalue())


def carrier(files):
    """files packed losslessly into one greyscale PNG: a JSON header line [[name, size], ...] then the bytes, one per pixel"""
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
    b = io.BytesIO(); im.resize((512, 512), Image.LANCZOS).save(b, 'WEBP', lossless=True, method=4)
    x = b.getvalue()
    if chunk and size + len(x) > 5_800_000:
        put(f'medals/carrier-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
    chunk.append((f'{n}.webp', x)); size += len(x)
if chunk:
    put(f'medals/carrier-{k}.png', carrier(chunk))
print('ALL_DONE', len(done), round(time.time() - t0), flush=True)
