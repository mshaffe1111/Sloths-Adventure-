"""ART-18: where each cut palm's nut cluster is (the point the rolling nut drops from), as fractions of the picture, and a check sheet
with a cross on each point. The densest 40 px cell of nut pixels (warm, saturated, not bright, opaque, in the top 60%), then the centroid
of the nut pixels within 120 px of it (a dry frond or the trunk's browns elsewhere never pull it off the cluster).
    python nutpt.py <sheet.jpg> <cut.webp>...
"""
import sys
import numpy as np
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
tiles = []
for f in files:
    im = Image.open(f).convert('RGBA')
    a = np.asarray(im)[..., 3].astype(np.float32)
    hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, w = a.shape
    nut = (a > 230) & ((hsv[..., 0] < 26) | (hsv[..., 0] > 236)) & (hsv[..., 1] > 70) & (hsv[..., 2] < 170)
    nut[int(h * 0.6):] = False
    C = 40
    gh, gw = h // C + 1, w // C + 1
    g = np.zeros((gh, gw))
    ys, xs = np.where(nut)
    np.add.at(g, (ys // C, xs // C), 1)
    k = np.ones((3, 3))
    gs = sum(np.roll(np.roll(g, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1))
    py, px = np.unravel_index(np.argmax(gs), gs.shape)
    cy0, cx0 = (py + 0.5) * C, (px + 0.5) * C
    near = (ys - cy0) ** 2 + (xs - cx0) ** 2 < 120 ** 2
    cx, cy = xs[near].mean(), ys[near].mean()
    print(f'{f}: nut {cx / w:.3f} {cy / h:.3f}  ({w}x{h}, {int(near.sum())} px)')
    t = Image.new('RGBA', im.size, (172, 190, 180, 255)); t.alpha_composite(im)
    d = ImageDraw.Draw(t)
    d.line([cx - 40, cy, cx + 40, cy], fill=(255, 0, 0, 255), width=5); d.line([cx, cy - 40, cx, cy + 40], fill=(255, 0, 0, 255), width=5)
    tiles.append(t.convert('RGB').resize((w * 360 // h, 360)))
S = Image.new('RGB', (sum(t.width + 6 for t in tiles), 360))
x = 0
for t in tiles:
    S.paste(t, (x, 0)); x += t.width + 6
S.save(out, quality=80)
