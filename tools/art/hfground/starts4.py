"""Starts for hf-art-ground round 3 (2026-10-29, the lead's review):
  fill-w5r      World 5's soil, retaken: World 1's soil (stones, roots) warmed toward World 5's gold light; the first World 5 soil was
                beige and flat, with no stones or roots to read
  bounce-<sp>   the three bounce plants' caps, sketched (toadstool, parasol, bloom) on magenta: they were drawn in code (spanArt.ts
                drawBounce), and in 10-1 the toadstool's pale code stalk read as a white bar standing in the water
  stalk-<sp>    each plant's stalk, lying on its side (a strip that wraps left to right; turned upright when packed, it tiles downward)
    python3 tools/art/hfground/starts4.py   ->  tools/art/hfground/starts/
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
ROOT = HERE.parent.parent.parent
OUT = HERE / 'starts'
MAG = (255, 0, 255)

# World 5's soil: World 1's first fill, warmer and a touch lighter (gold light), its stones kept grey-brown
s = Image.open(ROOT / 'src/assets/ground/w1.webp').convert('RGB').crop((0, 0, 1024, 1024))
a = np.asarray(s, np.float32)
a = a * np.array([1.22, 1.08, 0.86]) + np.array([10, 6, 0])
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(OUT / 'fill-w5r.webp', quality=92)


def cap_sketch(sp, W=512, H=512):
    can = Image.new('RGB', (W, H), MAG)
    d = ImageDraw.Draw(can)
    cx = W // 2
    if sp == 'toad':
        d.rectangle((cx - 34, 250, cx + 34, H - 10), fill=(226, 214, 190))
        d.rectangle((cx - 34, 250, cx - 14, H - 10), fill=(244, 236, 216))
        d.rectangle((cx + 16, 250, cx + 34, H - 10), fill=(196, 180, 152))
        d.chord((cx - 200, 90, cx + 200, 330), 180, 360, fill=(196, 52, 40))
        d.chord((cx - 190, 100, cx + 120, 300), 190, 300, fill=(226, 90, 64))
        d.ellipse((cx - 200, 196, cx + 200, 236), fill=(232, 220, 196))
        for x, y, r in ((-110, 160, 22), (-30, 120, 18), (60, 150, 24), (130, 190, 16), (-150, 195, 14), (10, 185, 14)):
            d.ellipse((cx + x - r, y - r, cx + x + r, y + r), fill=(246, 240, 228))
    elif sp == 'parasol':
        d.rectangle((cx - 14, 230, cx + 14, H - 10), fill=(170, 196, 140))
        d.rectangle((cx - 14, 230, cx - 4, H - 10), fill=(198, 220, 168))
        pts = [(cx - 230, 240)]
        for k in range(13):
            t = k / 12
            x = cx - 230 + 460 * t
            pts.append((x, 240 + (10 if k % 2 else -4)))
        pts += [(cx + 230, 240), (cx + 150, 150), (cx, 120), (cx - 150, 150)]
        d.polygon(pts, fill=(222, 112, 160))
        d.polygon([(cx - 200, 232), (cx - 120, 160), (cx, 130), (cx - 20, 230)], fill=(240, 150, 188))
        for k in range(7):
            x = cx - 190 + k * 63
            d.line((cx, 126, x, 238), fill=(186, 80, 128), width=4)
    else:
        d.rectangle((cx - 12, 240, cx + 12, H - 10), fill=(86, 140, 62))
        d.ellipse((cx - 100, 330, cx - 6, 360), fill=(96, 156, 70))
        d.ellipse((cx + 6, 380, cx + 100, 410), fill=(96, 156, 70))
        for k in range(14):
            ang = math.pi * (k / 13)
            x, y = cx - 190 * math.cos(ang), 220 + 30 * math.sin(ang)
            d.ellipse((x - 40, y - 26, x + 40, y + 34), fill=(236, 132, 52) if k % 2 else (246, 160, 70))
        d.ellipse((cx - 150, 170, cx + 150, 240), fill=(246, 206, 70))
        d.ellipse((cx - 120, 178, cx + 60, 214), fill=(252, 226, 120))
    return can.filter(ImageFilter.GaussianBlur(1.2))


def stalk_sketch(sp, W=1024, H=160):
    can = Image.new('RGB', (W, H), MAG)
    d = ImageDraw.Draw(can)
    th, cols = {'toad': (68, ((196, 180, 152), (226, 214, 190), (244, 236, 216))),
                'parasol': (30, ((140, 170, 112), (170, 196, 140), (198, 220, 168))),
                'bloom': (26, ((62, 112, 46), (86, 140, 62), (120, 176, 90)))}[sp]
    y0 = H // 2 - th // 2
    d.rectangle((0, y0, W, y0 + th), fill=cols[1])
    d.rectangle((0, y0, W, y0 + th // 3), fill=cols[2])
    d.rectangle((0, y0 + th * 2 // 3, W, y0 + th), fill=cols[0])
    for k in range(0, W, 64):
        d.line((k, y0 + 6, k + 40, y0 + th - 6), fill=cols[0], width=2)
    return can


for sp in ('toad', 'parasol', 'bloom'):
    cap_sketch(sp).save(OUT / f'bounce-{sp}.webp', quality=92)
    stalk_sketch(sp).save(OUT / f'stalk-{sp}.webp', quality=92)
print('ok')
