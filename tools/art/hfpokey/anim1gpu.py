"""ANIM-NEXT job 1 (2026-11-20): run INSIDE one HF sandbox. Wan 2.2 I2V A14B + Matt's slothadv motion LoRA, one clip at a time from a
spec (tools/art/hfpokey/spec-anim1.json, the pokeygpu.py "clips" format). Each finished take is packed SMALL for the pull back by
hf_sandbox_fs (sbx.py parts): the 49 frames cropped to the union box of everything that is not the flat grey (+16 px), scaled by SCALE
(Pokey ~330 px tall in a 704 frame -> ~218, above the game's 200 px stand height), WebP q90, in one zip with box.json. A DONE-<name>
file marks each take; ALL_DONE ends the run. The token reaches the run only as the sandbox's forwarded HF_TOKEN.

    python anim1gpu.py <spec.json> <out dir> [only-name ...]
"""
import io, json, os, sys, time, urllib.request, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from huggingface_hub import hf_hub_download

SCALE = 0.66
GH = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/'
spec = json.loads(Path(sys.argv[1]).read_text())
OUT = Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
only = set(sys.argv[3:])
t0 = time.time()


def log(*a):
    print(round(time.time() - t0), *a, flush=True)


def load(src):
    _, commit, path = src.split(':', 2)
    data = urllib.request.urlopen(GH + commit + '/' + urllib.request.quote(path), timeout=60).read()
    return Image.open(io.BytesIO(data)).convert('RGB')


def prep(im, w, h):
    if abs(im.width / im.height - w / h) > 0.02:
        tw = max(im.width, round(im.height * w / h)); th = max(im.height, round(im.width * h / w))
        c = Image.new('RGB', (tw, th), im.getpixel((2, 2))); c.paste(im, ((tw - im.width) // 2, (th - im.height) // 2)); im = c
    return im.resize((w, h), Image.LANCZOS)


def pack(name, pil):
    a = np.stack([np.asarray(f, dtype=np.int16) for f in pil])
    bg = np.median(np.concatenate([a[:, :4, :, :].reshape(-1, 3), a[:, -4:, :, :].reshape(-1, 3)]), axis=0)
    m = (np.abs(a - bg).max(axis=3) > 28).any(axis=0)
    ys, xs = np.nonzero(m)
    H, W = m.shape
    x0, x1 = max(0, xs.min() - 16), min(W, xs.max() + 17)
    y0, y1 = max(0, ys.min() - 16), min(H, ys.max() + 17)
    sw, sh = round((x1 - x0) * SCALE), round((y1 - y0) * SCALE)
    b = io.BytesIO()
    with zipfile.ZipFile(b, 'w', zipfile.ZIP_STORED) as z:
        z.writestr('box.json', json.dumps({'box': [int(x0), int(y0), int(x1), int(y1)], 'scale': SCALE, 'frame': [W, H],
                                           'bg': [float(v) for v in bg], 'n': len(pil)}))
        for k, f in enumerate(pil):
            wb = io.BytesIO()
            f.crop((x0, y0, x1, y1)).resize((sw, sh), Image.LANCZOS).save(wb, 'WEBP', quality=90, method=6)
            z.writestr(f'{name}_{k:03d}.webp', wb.getvalue())
    (OUT / f'{name}.zip').write_bytes(b.getvalue())
    return len(b.getvalue())


from diffusers import WanImageToVideoPipeline
pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
log('WAN LOADED')
mo = spec.get('motion')
if mo:
    sc = mo.get('scale', 1.0)
    pipe.load_lora_weights(hf_hub_download(*mo['high']), adapter_name='mhigh')
    pipe.load_lora_weights(hf_hub_download(*mo['low']), adapter_name='mlow', load_into_transformer_2=True)
    pipe.set_adapters(['mhigh', 'mlow'], adapter_weights=[sc, sc])
    log('LORA LOADED')
for c in spec['clips']:
    name = c['name']
    if only and name not in only:
        continue
    t1 = time.time()
    try:
        img = prep(load(c['src']), c['w'], c['h'])
        fr = pipe(image=img, prompt=c['prompt'], negative_prompt=c['neg'], height=c['h'], width=c['w'], num_frames=c.get('frames', 49),
                  guidance_scale=3.5, num_inference_steps=30, generator=torch.Generator('cuda').manual_seed(c['seed'])).frames[0]
        pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in fr]
        n = pack(name, pil)
        (OUT / f'DONE-{name}').write_text(f'{n} bytes, {round(time.time() - t1)} s')
        log('DONE', name, n, round(time.time() - t1))
    except Exception as e:
        (OUT / f'FAILED-{name}').write_text(repr(e)[:500])
        log('FAILED', name, repr(e)[:300])
(OUT / 'ALL_DONE').write_text(str(round(time.time() - t0)))
log('ALL_DONE')
