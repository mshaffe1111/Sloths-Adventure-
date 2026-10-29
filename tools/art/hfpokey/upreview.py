"""Upscale check for the 7-4 sheets (hf-art-pokey, 2026-10-29): Matt's sheet blown up plainly (Lanczos 2x) next to the Real-ESRGAN anime
2x, close up on every face (the upscale must not change him) and the whole sheet side by side; plus the fur colour before and after.

    python3 -I tools/art/hfpokey/upreview.py <original jpg dir> <2x dir> <review dir>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

O, U, R = (Path(a) for a in sys.argv[1:4])
R.mkdir(parents=True, exist_ok=True)
# close-ups, in the original sheet's px: (sheet, box, label)
CLOSE = [('sheet6-pokey-falling', (240, 100, 360, 200), 'fallOh face'),
         ('sheet6-pokey-falling', (700, 210, 850, 300), 'fallCurl face'),
         ('sheet5-pokey-behind', (820, 320, 940, 400), 'cheer face'),
         ('sheet5-pokey-behind', (560, 300, 720, 430), 'hurt (arms up) paws'),
         ('sheet1-flume', (40, 20, 230, 140), 'flume bed')]
tiles = []
for n, box, lab in CLOSE:
    o = Image.open(O / f'{n}.jpg').convert('RGB')
    u = Image.open(U / f'{n}.jpg').convert('RGB')
    w, h = box[2] - box[0], box[3] - box[1]
    a = o.crop(box).resize((w * 3, h * 3), Image.LANCZOS)
    b = u.crop(tuple(v * 2 for v in box)).resize((w * 3, h * 3), Image.LANCZOS)
    tiles.append((lab, a, b))
W = max(a.width * 2 + 30 for _, a, _ in tiles)
H = sum(a.height + 24 for _, a, _ in tiles) + 30
S = Image.new('RGB', (W, H), (14, 14, 18)); d = ImageDraw.Draw(S)
d.text((6, 6), 'left: Matt\'s sheet blown up plainly (Lanczos)   right: Real-ESRGAN anime x4, brought to 2x (what the builder gets)', fill=(255, 255, 255))
y = 26
for lab, a, b in tiles:
    d.text((6, y), lab, fill=(255, 220, 0)); y += 16
    S.paste(a, (5, y)); S.paste(b, (a.width + 20, y)); y += a.height + 8
S.save(R / 'upscale-faces.jpg', quality=90)
lines = []
for n in ('sheet5-pokey-behind', 'sheet6-pokey-falling', 'sheet1-flume'):
    o = np.asarray(Image.open(O / f'{n}.jpg').convert('RGB')).astype(float)
    u = np.asarray(Image.open(U / f'{n}.jpg').convert('RGB').resize((o.shape[1], o.shape[0]), Image.LANCZOS)).astype(float)
    m = ~((o[..., 0] > 180) & (o[..., 2] > 150) & (o[..., 1] < 120)) & ~((u[..., 0] > 180) & (u[..., 2] > 150) & (u[..., 1] < 120))  # figure in both (the poles are gone after)
    lines.append(f'{n}: figure median RGB before {np.median(o[m], 0).astype(int).tolist()} after {np.median(u[m], 0).astype(int).tolist()}')
(R / 'upscale-colour.txt').write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))
