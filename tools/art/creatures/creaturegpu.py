"""(tools/art/creatures/creaturegpu.py, 2026-10-29: animgpu.py with a per-clip "pin": the last frame held to the first, for loops)
Wan 2.2 clips of the new Gemini characters with the motion model (2026-10-27), as GPU jobs on Hugging Face; the same clip
step as gen/gen_clips.py and w6/swim/swimgpu.py, reading start pictures from and writing results to the bucket
mshaffe111/w5-xfer mounted read-write at /out (this machine cannot reach huggingface.co; the connector cannot write the game repos):
  <SUB>/starts/<name>.webp      start pictures (tools/art/anim/prep_starts.py, put there with hf_fs_write)
  <SUB>/clips/<name>.zip        49 PNG frames
  <SUB>/clips/sheet-<name>.jpg  numbered contact sheet
  <SUB>/clips/<name>.carrier.png the frames as WebP q95 packed into one greyscale PNG (w5/unpack_carrier.py)
env SPEC = <SUB>/jobs/<spec>.json: {"tag", "motion": {...}, "clips": [{"name", "src" (path under <SUB>), "prompt", "neg"?, "seed",
"w", "h"}]}; SUB; PART, PARTS split the clips. The token reaches the job only as the job secret HF_TOKEN.
"""
import io, json, os, time, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / os.environ['SUB']
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
PART, PARTS = int(os.environ.get('PART', '0')), int(os.environ.get('PARTS', '1'))
t0 = time.time()
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, changing art style, leaving the frame')


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def sheet(ims, tw, cols, title):
    th = round(ims[0].height * tw / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16) + 22), (40, 40, 40))
    d = ImageDraw.Draw(S)
    d.text((6, 4), title, fill=(255, 255, 255))
    for i, im in enumerate(ims):
        x, y = (i % cols) * tw, 22 + (i // cols) * (th + 16)
        S.paste(im.convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), str(i), fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=84)
    return b.getvalue()


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def prep(im, w, h):
    if abs(im.width / im.height - w / h) > 0.02:
        tw = max(im.width, round(im.height * w / h)); th = max(im.height, round(im.width * h / w))
        c = Image.new('RGB', (tw, th), im.getpixel((2, 2))); c.paste(im, ((tw - im.width) // 2, (th - im.height) // 2)); im = c
    return im.resize((w, h), Image.LANCZOS)


from diffusers import WanImageToVideoPipeline  # noqa: E402
pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
print('WAN LOADED', round(time.time() - t0), flush=True)
mo = SPEC.get('motion')
if mo:
    pipe.load_lora_weights(hf_hub_download(*mo['high'], token=tok), adapter_name='mhigh')
    pipe.load_lora_weights(hf_hub_download(*mo['low'], token=tok), adapter_name='mlow', load_into_transformer_2=True)
    pipe.set_adapters(['mhigh', 'mlow'], adapter_weights=[mo.get('scale', 1.0)] * 2)
    print('MOTION LORA ok', flush=True)
for c in SPEC['clips'][PART::PARTS]:
    name, w, h = c['name'], c.get('w', 832), c.get('h', 480)
    t1 = time.time()
    try:
        src = Image.open(OUT / c['src']).convert('RGB')
        if c.get('flip') == 'v':
            src = src.transpose(Image.FLIP_TOP_BOTTOM)
        img = prep(src, w, h)
        kw = {'last_image': img} if c.get('pin') else {}
        frames = pipe(image=img, **kw, prompt=c['prompt'], negative_prompt=c.get('neg', NEG), height=h, width=w,
                      num_frames=c.get('frames', 49), guidance_scale=3.5, num_inference_steps=30,
                      generator=torch.Generator('cuda').manual_seed(c.get('seed', 7))).frames[0]
        pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
        b = io.BytesIO()
        with zipfile.ZipFile(b, 'w') as z:
            for k, f in enumerate(pil):
                z.writestr(f'{name}_{k:03d}.png', png(f))
        put(f'clips/{name}.zip', b.getvalue())
        put(f'clips/sheet-{name}.jpg', sheet(pil, 200, 7, name))
        files = []
        for k, f in enumerate(pil):
            wb = io.BytesIO(); f.save(wb, 'WEBP', quality=95, method=4); files.append((f'{name}_{k:03d}.webp', wb.getvalue()))
        put(f'clips/{name}.carrier.png', carrier(files))
        print('DONE', name, round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', name, repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
