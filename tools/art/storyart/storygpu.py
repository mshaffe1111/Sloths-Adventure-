"""Story art on Hugging Face (2026-10-29, branch story-art): Qwen-Image img2img with the game's style model and the character models,
for the story cels (each old cel upscaled on flat key colour, repainted on its character's model) and the story plates (each old plate
upscaled, extended upward for upright phones, then a tiled low-strength pass at full size so the detail is painted, not stretched).

One GPU job; results go to the bucket mshaffe111/w5-xfer under <SUB>/out/:
  <name>.png                 every picture at full size
  sheet-<tag>-<k>.jpg        contact sheets (hf_fs attach)
  carrier-<tag>-<k>.png      the pictures as WebP packed byte for byte into greyscale PNGs under 6 MB (tools/art/w5/unpack_carrier.py)
env SPEC = the spec's bucket path; SUB; TAG. The token reaches the job only as the secret HF_TOKEN.

spec: {"loras": {name: [repo, file]}, "base": url prefix of the starts (GitHub raw at a pinned commit), "neg": default negative,
       "items": [{"name", "start", "prompt", "strength", "seed", "w", "h", "loras": [[name, scale], ...], "steps"?, "neg"?, "cfg"?,
                  "mask"?: a start-relative mask (white = paint, black = keep): the item runs the inpaint pipeline,
                  "tile"?: [size, overlap]: the item runs tile by tile at that size and the tiles are feathered together,
                  "then"?: the name of an earlier item whose result is this item's start (a later pass on the same picture),
                  "up"?: w x h the `then` picture is resized to first}]}
"""
import io, json, os, time, urllib.request
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFilter
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / os.environ['SUB'] / 'out'
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
TAG = os.environ.get('TAG', 'st')
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


from diffusers import QwenImageImg2ImgPipeline  # noqa: E402

pipe = QwenImageImg2ImgPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
inpaint = None
try:
    from diffusers import QwenImageInpaintPipeline
    inpaint = QwenImageInpaintPipeline(**pipe.components)
except Exception as e:
    print('no QwenImageInpaintPipeline:', repr(e)[:200], flush=True)
print('LOADED', round(time.time() - t0), flush=True)


def load_lora(name, repo, fn):
    path = hf_hub_download(repo, fn, token=tok)
    try:
        pipe.load_lora_weights(path, adapter_name=name)
    except Exception as e:  # ai-toolkit key names, as stillsgpu.py
        print('LORA direct failed:', name, str(e)[:160], flush=True)
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
    print('LORA', name, round(time.time() - t0), flush=True)


for n, (repo, fn) in SPEC['loras'].items():
    load_lora(n, repo, fn)

NEG = SPEC.get('neg', 'text, letters, watermark, frame, border, photo, 3d render, blurry, extra limbs, extra arms, extra fingers, deformed')
starts = {}
results = {}


def fetch(rel):
    if rel not in starts:
        with urllib.request.urlopen(SPEC['base'] + rel, timeout=90) as r:
            starts[rel] = Image.open(io.BytesIO(r.read()))
    return starts[rel]


def run_one(it, img, mask, w, h):
    gen = torch.Generator('cuda').manual_seed(it.get('seed', 42))
    kw = dict(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), image=img, strength=it['strength'], width=w, height=h,
              num_inference_steps=it.get('steps', 30), true_cfg_scale=it.get('cfg', 4.0), generator=gen)
    if mask is not None and inpaint is not None:
        return inpaint(mask_image=mask, **kw).images[0].convert('RGB')
    out = pipe(**kw).images[0].convert('RGB')
    if mask is not None:  # (no inpaint pipeline: paint the whole picture, keep the start where the mask is black)
        out = Image.composite(out, img, mask.convert('L').filter(ImageFilter.GaussianBlur(24)))
    return out


def tiled(it, img, size, ov):
    """the picture painted in overlapping tiles at full size, each tile feathered into the ones before it"""
    W, H = img.size
    acc = np.zeros((H, W, 3), np.float64)
    wsum = np.zeros((H, W, 1), np.float64)
    xs = list(range(0, max(1, W - size) + 1, size - ov))
    ys = list(range(0, max(1, H - size) + 1, size - ov))
    if xs[-1] + size < W:
        xs.append(W - size)
    if ys[-1] + size < H:
        ys.append(H - size)
    for y in ys:
        for x in xs:
            tw, th = min(size, W), min(size, H)
            tile = img.crop((x, y, x + tw, y + th))
            out = run_one(it, tile, None, tw, th)
            ramp = np.ones((th, tw), np.float64)
            f = np.minimum(np.arange(tw) + 1, np.arange(tw)[::-1] + 1) / ov
            g = np.minimum(np.arange(th) + 1, np.arange(th)[::-1] + 1) / ov
            ramp *= np.clip(f, 0.02, 1)[None, :] * np.clip(g, 0.02, 1)[:, None]
            acc[y:y + th, x:x + tw] += np.asarray(out, np.float64) * ramp[..., None]
            wsum[y:y + th, x:x + tw] += ramp[..., None]
            print('TILE', it['name'], x, y, round(time.time() - t0), flush=True)
    return Image.fromarray(np.clip(acc / np.maximum(wsum, 1e-6), 0, 255).astype(np.uint8))


done = []
for it in SPEC['items']:
    t1 = time.time()
    try:
        names = [n for n, _ in it.get('loras', [])]
        if names:
            pipe.set_adapters(names, adapter_weights=[s for _, s in it['loras']])
            pipe.enable_lora()
        else:
            pipe.disable_lora()
        if it.get('then'):
            start = results[it['then']]
        else:
            start = fetch(it['start']).convert('RGB')
        w, h = it.get('w', start.width), it.get('h', start.height)
        start = start.resize((w, h), Image.LANCZOS) if start.size != (w, h) else start
        if it.get('tile'):
            img = tiled(it, start, *it['tile'])
        else:
            mask = fetch(it['mask']).convert('L').resize((w, h), Image.LANCZOS) if it.get('mask') else None
            img = run_one(it, start, mask, w, h)
        results[it['name']] = img
        b = io.BytesIO(); img.save(b, 'PNG')
        put(f"{it['name']}.png", b.getvalue())
        done.append((it['name'], img))
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', it['name'], repr(e)[:300], flush=True)

for s in range(0, len(done), 12):
    part = done[s:s + 12]
    tw, cols = 420, 4
    th = max(round(tw * im.height / im.width) for _, im in part)
    rows = (len(part) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16)), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (n, im) in enumerate(part):
        x, y = (i % cols) * tw, (i // cols) * (th + 16)
        S.paste(im.resize((tw, round(tw * im.height / im.width)), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), n, fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=85)
    put(f'sheet-{TAG}-{s // 12}.jpg', b.getvalue())


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
    if SPEC.get('keep') and n not in SPEC['keep']:
        continue
    b = io.BytesIO(); im.save(b, 'WEBP', quality=SPEC.get('q', 93), method=4)
    x = b.getvalue()
    if chunk and size + len(x) > 5_800_000:
        put(f'carrier-{TAG}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
    chunk.append((f'{n}.webp', x)); size += len(x)
if chunk:
    put(f'carrier-{TAG}-{k}.png', carrier(chunk))
print('ALL_DONE', len(done), round(time.time() - t0), flush=True)
