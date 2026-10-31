"""Round 2 starts for World 10 (2026-10-29), made from the round-1 picks so every state shares the picked painting:
  start-w10-rodcharge  the picked rods (w10rods-s68-7) with their tips (spear) / prongs and coil (crown) lit pale blue-white, the glow kept
                       inside the iron's own outline so the magenta key stays clean (the halo outside is a separate additive sprite)
  start-w10-rodspent   the same with only a faint blue on the tips and a dark scorch where the strike landed
  start-w10-rodfx      on black: a crackling halo for each tip, a faint after-glow, two thin smoke wisps (additive sprites)
  start-w10-rampcrack  the picked rampart (w10rampart-s55-23) with dark cracks across the slab and chips out of its top edge
    python3 -I tools/art/w10/starts2.py <takes dir> <out dir>
"""
import math, random, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from w10lib import key_magenta  # noqa: E402
from starts import glow_line  # noqa: E402

T, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)


def save(im, name):
    p = OUT / f'start-w10-{name}.webp'
    im.convert('RGB').save(p, 'WEBP', quality=95)
    print(p, im.size)


rods = Image.open(T / 'w10rods-s68-7.webp').convert('RGB')
mask = np.asarray(key_magenta(rods))[..., 3] > 128
inside = ndimage.binary_erosion(mask, iterations=2)


def lit(region_boxes, strength):
    """brighten the iron toward pale blue-white inside the given boxes, strongest at each box's hot point"""
    a = np.asarray(rods).astype(np.float32)
    H, W = mask.shape
    yy, xx = np.mgrid[0:H, 0:W]
    heat = np.zeros((H, W), np.float32)
    for (x0, y0, x1, y1, hx, hy, r) in region_boxes:
        box = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
        d = np.sqrt((xx - hx) ** 2 + (yy - hy) ** 2)
        heat = np.maximum(heat, box * np.clip(1 - d / r, 0, 1))
    heat = ndimage.gaussian_filter(heat, 3) * inside * strength
    h = heat[..., None]
    col = np.array([110, 195, 255], np.float32) * (1 - h ** 2) + np.array([235, 250, 255], np.float32) * h ** 2  # cyan, white-hot at the tip
    a = a * (1 - h) + col * h
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# spear: tip 65-300 (hot point at the very tip); crown: prongs 100-250 and the coil 290-570
HOT = [(200, 55, 312, 320, 256, 70, 260), (640, 90, 900, 260, 768, 110, 220), (700, 280, 840, 580, 768, 300, 330)]
save(lit(HOT, 0.85), 'rodcharge')
spent = np.asarray(lit([(200, 55, 312, 200, 256, 70, 120), (640, 90, 900, 200, 768, 110, 110)], 0.35)).astype(np.float32)
# scorch: the tip's iron darkened under the faint glow
H, W = mask.shape
yy, xx = np.mgrid[0:H, 0:W]
for hx, hy in ((256, 80), (768, 120)):
    d = np.sqrt((xx - hx) ** 2 + ((yy - hy) * 0.7) ** 2)
    k = np.clip(1 - d / 160, 0, 1) * inside * 0.45
    spent = spent * (1 - k[..., None]) + np.array([20, 18, 20]) * k[..., None]
save(Image.fromarray(np.clip(spent, 0, 255).astype(np.uint8)), 'rodspent')

# additive fx on black, 1024 x 512: [spear halo | crown halo | after-glow | smoke | smoke]
rng = random.Random(5)
fx = Image.new('RGB', (1024, 512), (0, 0, 0))


def halo(img, cx, cy, rx, ry, col, amt, blur):
    g = Image.new('L', img.size, 0)
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    g = g.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(img).astype(np.float32) + np.asarray(g)[..., None].astype(np.float32) / 255 * np.array(col) * amt
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


for cx, cy, spread in ((128, 150, 1.0), (384, 150, 1.4)):
    fx = halo(fx, cx, cy, 70 * spread, 90, (140, 210, 255), 0.9, 30)
    fx = halo(fx, cx, cy, 22 * spread, 30, (230, 245, 255), 1.0, 10)
    for k in range(7):
        ang = rng.uniform(0, 2 * math.pi)
        pts = [(cx, cy)]
        x, y = cx, cy
        for _ in range(4):
            ang += rng.uniform(-0.7, 0.7)
            x += math.cos(ang) * rng.uniform(14, 26) * spread; y += math.sin(ang) * rng.uniform(14, 26)
            pts.append((x, y))
        fx = glow_line(fx, pts, 3, 10)
fx = halo(fx, 640, 150, 60, 70, (90, 150, 210), 0.55, 26)  # after-glow
for cx in (800, 940):  # smoke wisps rising from a tip at the bottom
    sm = Image.new('L', fx.size, 0)
    sd = ImageDraw.Draw(sm)
    ph = rng.uniform(0, 3)
    for k in range(22):
        y = 470 - k * 19
        x = cx + math.sin(k * 0.45 + ph) * (8 + k * 1.6)
        r = 9 + k * 1.1
        sd.ellipse((x - r, y - r * 0.8, x + r, y + r * 0.8), fill=int(120 - k * 4))
    sm = sm.filter(ImageFilter.GaussianBlur(7))
    a = np.asarray(fx).astype(np.float32) + np.asarray(sm)[..., None].astype(np.float32) / 255 * np.array([150, 152, 160])
    fx = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
save(fx, 'rodfx')

# rampart cracks: dark branching cracks across the slab face, two chips out of the top
ram = Image.open(T / 'w10rampart-s55-23.webp').convert('RGB')
d = ImageDraw.Draw(ram)
rng = random.Random(11)
for sx, sy in ((200, 42), (430, 42), (560, 320)):
    x, y = sx, sy
    down = 1 if sy < 100 else -1
    pts = [(x, y)]
    for _ in range(7):
        x += rng.uniform(-28, 28); y += down * rng.uniform(22, 40)
        pts.append((x, y))
        if rng.random() < 0.4:  # a short branch
            d.line([(x, y), (x + rng.uniform(-40, 40), y + down * rng.uniform(15, 30))], fill=(16, 14, 16), width=4)
    d.line(pts, fill=(16, 14, 16), width=7, joint='curve')
    d.line([(px + 2, py + 1) for px, py in pts], fill=(150, 148, 152), width=2)
for cx in (205, 433):  # chips out of the top edge: back to magenta
    d.polygon([(cx - 26, 38), (cx + 22, 38), (cx + 6, 58), (cx - 12, 54)], fill=(255, 0, 255))
save(ram, 'rampcrack')
