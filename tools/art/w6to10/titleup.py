"""Sharpen and enlarge the chosen title clips (2026-10-28): the new title shows the pair ~280 CSS px tall (~560 device px), so the frames
must be packed at 600+ px a character, but Wan draws Pokey ~520 px tall. Each chosen frame is upscaled 4x with Real-ESRGAN anime 6B
on the GPU (the same model as the starts, so line weight and colour match across both characters) and brought down to UP x the clip
size, still on the flat grey (titlepack.py keys it on this machine). One GPU job on Hugging Face, bucket mshaffe111/w5-xfer at /out.

env PICKS = JSON {clip: [first, last]} (frames to keep, inclusive); UP (default 1.25); SUB (w6to10).
Writes <SUB>/title/<clip>.carrier.png (frames <clip>_NNN.webp, q92) for tools/art/w5/unpack_carrier.py.
"""
import io, json, os, urllib.request, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from spandrel import ModelLoader

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = os.environ.get('SUB', 'w6to10')
UP = float(os.environ.get('UP', '1.25'))
PICKS = json.loads(os.environ['PICKS'])
pth = Path('/tmp/anime6b.pth')
urllib.request.urlretrieve('https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth', pth)
model = ModelLoader().load_from_file(str(pth)).eval().cuda()


def up(im):
    t = torch.from_numpy(np.asarray(im.convert('RGB')).astype(np.float32) / 255.0).permute(2, 0, 1).unsqueeze(0).cuda()
    with torch.no_grad():
        o = model(t).float().cpu()
    big = Image.fromarray((o.squeeze(0).permute(1, 2, 0).clamp(0, 1).numpy() * 255).round().astype(np.uint8))
    return big.resize((round(im.width * UP), round(im.height * UP)), Image.LANCZOS)


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


out = ROOT / SUB / 'title'
out.mkdir(parents=True, exist_ok=True)
for clip, (a, b) in PICKS.items():
    with zipfile.ZipFile(ROOT / SUB / 'clips' / f'{clip}.zip') as z:
        names = sorted(z.namelist())
        files = []
        for n in names[a:b + 1]:
            im = up(Image.open(io.BytesIO(z.read(n))))
            wb = io.BytesIO(); im.save(wb, 'WEBP', quality=92, method=4)
            files.append((n.replace('.png', '.webp'), wb.getvalue()))
    c = carrier(files)
    (out / f'{clip}.carrier.png').write_bytes(c)
    print('DONE', clip, len(files), len(c), flush=True)
print('ALL_DONE', flush=True)
