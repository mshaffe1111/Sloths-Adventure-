"""Starts for the start screen's own painted pieces (Matt, 2026-10-30: "a real polished feel... not just slapping paint on what we
already have"), on magenta, for img2img with the style model (hfui2):

  start-kit2.webp  2048 x 1024
    signBig     a big hanging trail sign (the PLAY board): a thick warm plank, two vine ropes rising from its ends   (40, 20)-(1000, 520)
    signSm0-2   three smaller hanging signs, each on two short vines                                                 row at y 560-1000
    token       a round wooden token, blank (an icon goes on it in the game)                                        (1100, 40)-(1340, 280)
    leafToken   a round token made of a big glossy leaf                                                             (1400, 40)-(1640, 280)
    vine        a long hanging vine strand with a few leaves (the logo hangs from two)                               (1720, 0)-(1860, 1024)
    tag         a small wooden tag on a string (for "10 Worlds")                                                    (1100, 340)-(1600, 500)
    python3 -I tools/art/hfui/kit2starts.py <out dir>
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
EDGE = (42, 24, 10)
rnd = random.Random(5)
im = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(im)


def vine(x0, y0, x1, y1, w=14):
    pts = [(x0 + (x1 - x0) * t / 20 + 6 * math.sin(t), y0 + (y1 - y0) * t / 20) for t in range(21)]
    d.line(pts, fill=(30, 56, 22), width=w + 6)
    d.line(pts, fill=(84, 140, 52), width=w)
    for k in range(2, 20, 5):
        px, py = pts[k]
        d.ellipse((px - 4, py - 10, px + 26, py + 6), fill=(72, 150, 60))


def board(x0, y0, x1, y1, hi=(214, 150, 80), mid=(170, 104, 48), lo=(120, 70, 30)):
    d.rounded_rectangle((x0, y0, x1, y1), 22, fill=EDGE)
    d.rounded_rectangle((x0 + 8, y0 + 8, x1 - 8, y1 - 8), 16, fill=mid)
    d.rounded_rectangle((x0 + 8, y0 + 8, x1 - 8, y0 + (y1 - y0) * 0.35), 16, fill=hi)
    d.rounded_rectangle((x0 + 8, y1 - (y1 - y0) * 0.25, x1 - 8, y1 - 8), 16, fill=lo)
    for k in range(4):
        yy = y0 + 30 + k * (y1 - y0 - 60) / 3
        d.line([(x + 0, yy + 4 * math.sin(x / 50 + k)) for x in range(int(x0 + 30), int(x1 - 30), 10)], fill=lo, width=3)
    for nx in (x0 + 40, x1 - 40):
        d.ellipse((nx - 12, y0 + 30, nx + 12, y0 + 54), fill=(80, 70, 66))


# the big PLAY sign, hanging on two vines
vine(200, 20, 200, 250, 18)
vine(840, 20, 840, 250, 18)
board(40, 240, 1000, 500)
# three small signs
for k in range(3):
    x = 60 + k * 330
    vine(x + 50, 560, x + 50, 700)
    vine(x + 230, 560, x + 230, 700)
    board(x, 690, x + 280, 860, hi=(196, 140, 78), mid=(150, 96, 46), lo=(104, 62, 28))
# a blank round wooden token
d.ellipse((1100, 40, 1340, 280), fill=EDGE)
d.ellipse((1112, 52, 1328, 268), fill=(150, 96, 46))
d.ellipse((1124, 60, 1316, 190), fill=(190, 130, 70))
d.ellipse((1140, 76, 1300, 252), outline=(110, 66, 30), width=6)
# a round leaf token
d.ellipse((1400, 40, 1640, 280), fill=(26, 60, 24))
d.ellipse((1410, 50, 1630, 270), fill=(70, 150, 60))
d.line([(1420, 250), (1620, 70)], fill=(40, 100, 36), width=8)
for k in range(5):
    t = 0.2 + k * 0.14
    px, py = 1420 + 200 * t, 250 - 180 * t
    d.line([(px, py), (px - 40, py - 30)], fill=(40, 100, 36), width=4)
    d.line([(px, py), (px + 30, py + 40)], fill=(40, 100, 36), width=4)
# a long vine strand
vine(1790, 0, 1790, 1000, 16)
# a small tag on a string
d.line([(1350, 340), (1300, 380)], fill=EDGE, width=6)
d.line([(1350, 340), (1400, 380)], fill=EDGE, width=6)
board(1100, 380, 1600, 500, hi=(206, 160, 100), mid=(166, 118, 64), lo=(122, 82, 40))
im.save(OUT / 'start-kit2.webp', quality=94)
print('ok')
