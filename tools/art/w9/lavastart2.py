"""Round 2 starts for World 9's hazard art (2026-10-29): round 1's eruption columns kept the start's straight slab and its haze kept the
start's stacked discs (the paint follows a start's shapes), so these starts draw the shapes we want, built from many soft blobs:
  start-w9burst.webp  1536 x 768: three eruption frames side by side: the burst leaving the vent (short, wide), the full fountain (tall,
                      curling over at the top, lava raining off its sides), the fountain falling back (broken, blobs dropping)
  start-w9haze2.webp  1536 x 416: six curling ribbons of heat haze and smoke, each a different S, soft-edged
    python3 tools/art/w9/lavastart2.py
"""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'tools/art/hfbatch/starts'
KEY = (255, 0, 255)
rnd = random.Random(19)


def blob(d, x, y, r, col):
    pts = [(x + r * (0.8 + 0.3 * rnd.random()) * math.cos(a), y + r * (0.8 + 0.3 * rnd.random()) * math.sin(a)) for a in [i * math.pi / 6 for i in range(12)]]
    d.polygon(pts, fill=col)


def fountain(d, cx, base, h, lean, spread, falling=False):
    # (the column: blobs up a curve, wide at the foot, bright core, orange skin, dark red licks at the edges)
    n = 40
    for i in range(n):
        u = i / (n - 1)
        x = cx + lean * u * u * h * 0.25
        y = base - u * h
        r = 46 - 18 * u + 10 * math.sin(u * 9)
        if falling and u > 0.55 and rnd.random() < 0.5:
            continue
        blob(d, x + rnd.uniform(-4, 4), y, r + 4, (230, 90, 25))
        blob(d, x + rnd.uniform(-3, 3), y, r, (255, 150, 35))
        blob(d, x, y, r * 0.62, (255, 230, 140))
    # (the top curls over and lava rains off both sides)
    tx, ty = cx + lean * h * 0.25, base - h
    for s in (-1, 1):
        for k in range(7):
            a = k / 6
            bx = tx + s * (30 + spread * a)
            by = ty + 40 * a * a * 6 - 30 * (1 - a)
            blob(d, bx, by, 18 - 8 * a, (255, 130, 30))
    for k in range(10):
        bx = cx + rnd.uniform(-spread, spread)
        by = base - rnd.uniform(0.2, 0.9) * h
        blob(d, bx, by, rnd.uniform(7, 14), (255, 120, 25))


im = Image.new('RGB', (1536, 768), KEY)
d = ImageDraw.Draw(im)
fountain(d, 256, 740, 260, 0.3, 120)
fountain(d, 768, 740, 600, 0.6, 170)
fountain(d, 1280, 740, 470, -0.5, 200, falling=True)
im.filter(ImageFilter.SMOOTH_MORE).save(OUT / 'start-w9burst.webp', quality=92)

hz = Image.new('RGB', (1536, 416), KEY)
hd = ImageDraw.Draw(hz)
for i in range(6):
    cx = 128 + i * 256
    ph = rnd.uniform(0, 6)
    pts = [(cx + 40 * math.sin(ph + y * 0.022) * (y / 400), 400 - y) for y in range(0, 380, 6)]
    for k, (x, y) in enumerate(pts):
        w = 10 + 22 * (k / len(pts))
        hd.ellipse([x - w, y - w * 0.6, x + w, y + w * 0.6], fill=(214, 196, 190))
hz = hz.filter(ImageFilter.GaussianBlur(5))
hz.save(OUT / 'start-w9haze2.webp', quality=92)
print('ok')
