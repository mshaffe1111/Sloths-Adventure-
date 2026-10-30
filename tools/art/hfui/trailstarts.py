"""Starts for the ten world-map trails (Matt, 2026-10-30: "each world's trail its own painted look"), for img2img with the style model:
each world's trail is four painted pieces the map stamps along its path, turned to follow it (WorldMap.tsx), on magenta.

  start-trails-a.webp  2048 x 1024  worlds 1-5, a row each: vine rope (1), river stepping stones (2), glowworm-lit roots (3),
                                    cloud bridge puffs (4), orchid stems with a bud (5)
  start-trails-b.webp  2048 x 1024  worlds 6-10: boardwalk planks (6), temple steps (7), moonlit roots (8), cooled lava stones (9),
                                    iron chain links (10)
Each row holds four pieces in 480 x 190 cells at x = 32 + k * 500; every piece runs left to right (the way the trail goes) and
fills most of its cell's width so pieces overlap a little when stamped.
    python3 -I tools/art/hfui/trailstarts.py <out dir>
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
EDGE = (30, 20, 14)
rnd = random.Random(11)


def cell(k, row):
    return 32 + k * 500, 12 + row * 202  # left, top of a 480 x 190 cell


def rope(d, x, y, col, hi, twist=8):
    cy = y + 95
    d.rounded_rectangle((x + 10, cy - 26, x + 470, cy + 26), 26, fill=EDGE)
    d.rounded_rectangle((x + 14, cy - 22, x + 466, cy + 22), 22, fill=col)
    for i in range(twist):
        sx = x + 30 + i * 56
        d.line([(sx, cy + 20), (sx + 34, cy - 20)], fill=hi, width=9)
        d.line([(sx, cy + 20), (sx + 34, cy - 20)], fill=EDGE, width=2)


def stone(d, x, y, col, hi, w=330, h=120, glow=None):
    cx, cy = x + 240, y + 100
    d.ellipse((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill=EDGE)
    d.ellipse((cx - w / 2 + 6, cy - h / 2 + 6, cx + w / 2 - 6, cy + h / 2 - 6), fill=col)
    d.ellipse((cx - w / 2 + 30, cy - h / 2 + 12, cx + w / 4, cy - 4), fill=hi)
    if glow:
        for _ in range(4):
            gx = rnd.uniform(cx - w / 3, cx + w / 3)
            d.line([(gx, cy - 10), (gx + rnd.uniform(-30, 30), cy + h / 3)], fill=glow, width=5)


def root(d, x, y, col, hi, dots=None):
    pts = [(x + 6 + t, y + 95 + 22 * math.sin(t / 70 + rnd.uniform(0, 1))) for t in range(0, 469, 12)]
    d.line(pts, fill=EDGE, width=46)
    d.line(pts, fill=col, width=36)
    d.line([(px, py - 9) for px, py in pts], fill=hi, width=8)
    if dots:
        for _ in range(6):
            px, py = pts[rnd.randrange(len(pts))]
            d.ellipse((px - 9, py - 30, px + 9, py - 12), fill=dots)


def cloud(d, x, y):
    for cx, cy, r in ((x + 90, y + 110, 70), (x + 200, y + 85, 90), (x + 320, y + 105, 75), (x + 410, y + 118, 55)):
        d.ellipse((cx - r - 5, cy - r * 0.7 - 5, cx + r + 5, cy + r * 0.7 + 5), fill=(120, 140, 175))
    for cx, cy, r in ((x + 90, y + 110, 70), (x + 200, y + 85, 90), (x + 320, y + 105, 75), (x + 410, y + 118, 55)):
        d.ellipse((cx - r, cy - r * 0.7, cx + r, cy + r * 0.7), fill=(244, 246, 255))
    d.rectangle((x + 40, y + 120, x + 460, y + 150), fill=(214, 222, 240))


def orchid(d, x, y, k):
    pts = [(x + 6 + t, y + 110 + 16 * math.sin(t / 60 + k)) for t in range(0, 469, 12)]
    d.line(pts, fill=EDGE, width=26)
    d.line(pts, fill=(96, 160, 70), width=18)
    for i in range(3):
        px, py = pts[6 + i * 13]
        d.ellipse((px - 30, py - 26, px + 10, py + 2), fill=(70, 130, 50))
    px, py = pts[20 + k * 3]
    for a in range(5):
        ang = a * 2 * math.pi / 5
        d.ellipse((px + 26 * math.cos(ang) - 20, py - 50 + 26 * math.sin(ang) - 14, px + 26 * math.cos(ang) + 20, py - 50 + 26 * math.sin(ang) + 14), fill=(236, 140, 200))
    d.ellipse((px - 10, py - 60, px + 10, py - 40), fill=(250, 220, 90))


def plank(d, x, y, k):
    col = [(150, 104, 62), (138, 94, 54), (160, 112, 68), (128, 88, 50)][k]
    d.rectangle((x + 30, y + 50, x + 450, y + 150), fill=EDGE)
    d.rectangle((x + 36, y + 56, x + 444, y + 144), fill=col)
    for j in range(3):
        yy = y + 76 + j * 24
        d.line([(x + 50, yy), (x + 430, yy + rnd.uniform(-3, 3))], fill=tuple(c - 30 for c in col), width=3)
    for nx in (x + 56, x + 424):
        for ny in (y + 72, y + 128):
            d.ellipse((nx - 6, ny - 6, nx + 6, ny + 6), fill=(80, 80, 84))


def step(d, x, y, k):
    d.rectangle((x + 40, y + 60, x + 440, y + 160), fill=EDGE)
    d.rectangle((x + 46, y + 66, x + 434, y + 154), fill=(168, 150, 116))
    d.rectangle((x + 46, y + 66, x + 434, y + 84), fill=(200, 184, 148))
    d.line([(x + 120 + k * 60, y + 66), (x + 150 + k * 60, y + 154)], fill=(110, 96, 70), width=4)
    for _ in range(3):
        mx = rnd.uniform(x + 60, x + 400)
        d.ellipse((mx, y + 130, mx + 50, y + 152), fill=(96, 140, 70))


def link(d, x, y, k):
    for i in range(3):
        cx = x + 90 + i * 150
        if (i + k) % 2 == 0:
            d.rounded_rectangle((cx - 80, y + 60, cx + 80, y + 130), 35, outline=EDGE, width=26)
            d.rounded_rectangle((cx - 80, y + 60, cx + 80, y + 130), 35, outline=(120, 124, 132), width=16)
        else:
            d.rounded_rectangle((cx - 80, y + 86, cx + 80, y + 104), 9, fill=EDGE)
            d.rounded_rectangle((cx - 76, y + 89, cx + 76, y + 101), 6, fill=(150, 154, 162))


for sheet, rows in (('a', range(1, 6)), ('b', range(6, 11))):
    im = Image.new('RGB', (2048, 1024), MAG)
    d = ImageDraw.Draw(im)
    for row, w in enumerate(rows):
        for k in range(4):
            x, y = cell(k, row)
            if w == 1:
                rope(d, x, y, (96, 140, 58), (140, 190, 90))
            elif w == 2:
                stone(d, x, y, (128, 120, 108), (170, 164, 150), w=300 + k * 20, h=110)
            elif w == 3:
                root(d, x, y, (92, 66, 46), (130, 98, 70), dots=(160, 255, 180))
            elif w == 4:
                cloud(d, x, y)
            elif w == 5:
                orchid(d, x, y, k)
            elif w == 6:
                plank(d, x, y, k)
            elif w == 7:
                step(d, x, y, k)
            elif w == 8:
                root(d, x, y, (58, 60, 86), (120, 130, 180))
            elif w == 9:
                stone(d, x, y, (46, 40, 40), (80, 70, 66), w=320, h=100, glow=(255, 130, 40))
            else:
                link(d, x, y, k)
    im.save(OUT / f'start-trails-{sheet}.webp', quality=94)
print('ok')
