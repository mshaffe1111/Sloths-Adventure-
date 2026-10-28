"""Painted stills for Worlds 5-10 (2026-10-28): lairs, times of day, guardians, props, as one GPU job on Hugging Face.

Qwen-Image with the style model or a character model per picture (like tools/art/medals/medals_gpu.py), results to the bucket
mshaffe111/w5-xfer mounted read-write at /out:
  <SUB>/stills/<name>.png         every picture at full size
  <SUB>/stills/sheet-<k>.jpg      numbered contact sheets (hf_fs attach)
  <SUB>/stills/carrier-<k>.png    the pictures as WebP (long side <= 1280, q90) packed byte for byte into greyscale PNGs under 6 MB
                                  (tools/art/w5/unpack_carrier.py unpacks them)
env SPEC = the spec's bucket path: {"loras": {key: [repo, file, scale]}, "neg"?, "items": [{"name", "prompt", "seed", "w"?, "h"?,
"lora"? (a key, default "style"), "steps"?}]}; SUB; PART/PARTS split the items. The token reaches the job only as the secret HF_TOKEN.
"""
import io, json, os, time
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from diffusers import DiffusionPipeline
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / os.environ['SUB']
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
PART, PARTS = int(os.environ.get('PART', '0')), int(os.environ.get('PARTS', '1'))
TAG = os.environ.get('TAG', 'st') + f'{PART}'
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


pipe = DiffusionPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)


def load_lora(key):
    repo, fn, _ = SPEC['loras'][key]
    path = hf_hub_download(repo, fn, token=tok)
    try:
        pipe.load_lora_weights(path, adapter_name=key)
    except Exception as e:  # ai-toolkit key names, as gen_stills.py / medals_gpu.py
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
        pipe.load_lora_weights(sd2, adapter_name=key)


NEG = SPEC.get('neg', 'text, letters, words, numbers, watermark, signature, frame, border, photo, 3d render, blurry, cropped, cut off')
items = SPEC['items'][PART::PARTS]
items.sort(key=lambda it: it.get('lora', 'style'))
loaded, done = set(), []
for it in items:
    key = it.get('lora', 'style')
    t1 = time.time()
    try:
        if key not in loaded:
            load_lora(key); loaded.add(key)
        pipe.set_adapters([key], adapter_weights=[SPEC['loras'][key][2]])
        img = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), width=it.get('w', 1024), height=it.get('h', 1024),
                   num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                   generator=torch.Generator('cuda').manual_seed(it.get('seed', 42))).images[0].convert('RGB')
        b = io.BytesIO(); img.save(b, 'PNG')
        put(f"stills/{it['name']}.png", b.getvalue())
        done.append((it['name'], img))
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', it['name'], repr(e)[:300], flush=True)

for s in range(0, len(done), 24):
    part = done[s:s + 24]
    tw, cols = 300, 4
    th = max(round(tw * im.height / im.width) for _, im in part)
    rows = (len(part) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16)), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (n, im) in enumerate(part):
        x, y = (i % cols) * tw, (i // cols) * (th + 16)
        t = im.resize((tw, round(tw * im.height / im.width)), Image.LANCZOS)
        S.paste(t, (x, y + 16))
        d.text((x + 3, y + 2), n, fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=85)
    put(f'stills/sheet-{TAG}-{s // 24}.jpg', b.getvalue())


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
    s = min(1.0, 1280 / max(im.size))
    b = io.BytesIO(); im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS).save(b, 'WEBP', quality=90, method=4)
    x = b.getvalue()
    if chunk and size + len(x) > 5_800_000:
        put(f'stills/carrier-{TAG}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
    chunk.append((f'{n}.webp', x)); size += len(x)
if chunk:
    put(f'stills/carrier-{TAG}-{k}.png', carrier(chunk))
print('ALL_DONE', len(done), round(time.time() - t0), flush=True)
