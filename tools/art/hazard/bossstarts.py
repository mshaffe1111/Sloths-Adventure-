"""Start sheets for the bosses' code-drawn attacks (2026-10-29, hazard-anim round 3; Matt: repeating effects are painted): plain shapes in
each attack's own colours on flat magenta, for img2img with the style model (tools/art/w6to10/img2imggpu.py), which repaints them.
  cols   1536 x 768, six tall cells: a lava geyser, a thorn thicket, stone spikes, a crystal cluster, silk strands, a scaly tail
  bits   1024 x 1024, a 4 x 4 grid: stalactite spike, bat, wooden club, thorn dart, lava glob, mud glob, lava puddle, mud puddle,
         spike 2, bat 2, club 2, thorn dart 2, glob 3 (venom-green), puddle 3, ember cluster, small rock
  strips 1536 x 1152, nine wide strips: flame jet, vine whip, energy beam, spear jab streak, rock wave, lava wave, thorn wave, ground fire,
         lava strip
    python3 -I tools/art/hazard/bossstarts.py <out dir>
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
KEY = (255, 0, 255)
INK = (34, 26, 30)
random.seed(7)


def poly(d, pts, fill, ink=INK, w=4):
    d.polygon(pts, fill=fill)
    d.line(pts + [pts[0]], fill=ink, width=w, joint='curve')


def blob(d, cx, cy, rx, ry, fill, n=14, jit=0.18):
    pts = []
    for i in range(n):
        a = i / n * math.tau
        k = 1 + (random.random() - 0.5) * jit * 2
        pts.append((cx + math.cos(a) * rx * k, cy + math.sin(a) * ry * k))
    poly(d, pts, fill)


# ---- columns
C = Image.new('RGB', (1536, 768), KEY)
d = ImageDraw.Draw(C)
foot = 740
# lava geyser: a tapering spout of molten rock, gold at the top
cx = 128
for k, (col, wid) in enumerate((((178, 34, 12), 70), ((234, 88, 12), 52), ((253, 186, 60), 30))):
    pts = [(cx - wid, foot)]
    for i in range(1, 9):
        y = foot - i * 78
        pts.append((cx - wid * (1 - i / 12) + math.sin(i * 1.7 + k) * 10, y))
    pts.append((cx, foot - 690 + k * 20))
    for i in range(8, 0, -1):
        y = foot - i * 78
        pts.append((cx + wid * (1 - i / 12) + math.sin(i * 2.3 + k) * 10, y))
    pts.append((cx + wid, foot))
    poly(d, pts, col, w=4 if k == 0 else 0)
for i in range(7):
    blob(d, cx + random.randint(-60, 60), foot - 600 - random.randint(0, 120), 12, 10, (253, 186, 60))
# thorn thicket: dark woody stems with hooked thorns
cx = 384
for i in range(-2, 3):
    hh = 640 * (1 - abs(i) * 0.15)
    x = cx + i * 34
    poly(d, [(x - 22, foot), (x - 8 + i * 6, foot - hh * 0.6), (x + i * 10, foot - hh), (x + 8 + i * 6, foot - hh * 0.6), (x + 22, foot)], (92, 58, 34))
    for k in range(5):
        y = foot - hh * (0.15 + k * 0.16)
        s = 1 if k % 2 else -1
        poly(d, [(x + s * 6, y), (x + s * 34, y - 18), (x + s * 8, y - 14)], (150, 104, 60), w=3)
# stone spikes
cx = 640
for i, (dx, hh, wd) in enumerate(((-58, 420, 46), (52, 500, 50), (0, 660, 62))):
    poly(d, [(cx + dx - wd, foot), (cx + dx - wd * 0.3, foot - hh), (cx + dx + wd * 0.2, foot - hh * 0.93), (cx + dx + wd, foot)], (120, 112, 104) if i < 2 else (150, 142, 132))
# crystal cluster
cx = 896
for dx, hh, wd, lean in ((-62, 400, 40, -26), (66, 450, 40, 30), (0, 650, 54, 6)):
    poly(d, [(cx + dx - wd, foot), (cx + dx - wd * 0.7 + lean, foot - hh * 0.78), (cx + dx + lean, foot - hh), (cx + dx + wd * 0.72 + lean, foot - hh * 0.74), (cx + dx + wd, foot)], (96, 186, 240))
    d.line([(cx + dx - wd * 0.2, foot), (cx + dx + lean * 0.8, foot - hh * 0.9)], fill=(224, 247, 255), width=6)
# silk strands rising from a web splat
cx = 1152
blob(d, cx, foot - 10, 110, 22, (236, 236, 244), jit=0.1)
for i in range(-2, 3):
    d.line([(cx + i * 18, foot - 20), (cx + i * 30, foot - 680)], fill=(240, 240, 250), width=8)
for k in range(1, 8):
    y = foot - 20 - k * 90
    d.arc([cx - 70, y - 20, cx + 70, y + 20], 0, 180, fill=(240, 240, 250), width=5)
# scaly tail bursting up
cx = 1408
pts = [(cx - 70, foot), (cx - 60, foot - 420), (cx - 20, foot - 640), (cx + 30, foot - 680), (cx + 50, foot - 620), (cx + 40, foot - 420), (cx + 70, foot)]
poly(d, pts, (74, 110, 48))
for k in range(1, 9):
    y = foot - k * 70
    w = 56 - k * 4
    d.line([(cx - w, y), (cx + w - 10, y - 6)], fill=(46, 72, 30), width=5)
C.save(OUT / 'start-bosscols.webp', quality=95)

# ---- bits
B = Image.new('RGB', (1024, 1024), KEY)
d = ImageDraw.Draw(B)


def cell(i):
    return (i % 4) * 256 + 128, (i // 4) * 256 + 128


def spike(i, col):
    x, y = cell(i)
    poly(d, [(x - 40, y - 90), (x + 40, y - 90), (x + 6, y + 100), (x - 6, y + 100)], col)


def bat(i):
    x, y = cell(i)
    for s in (-1, 1):
        poly(d, [(x, y), (x + s * 110, y - 50), (x + s * 90, y - 10), (x + s * 70, y + 20), (x + s * 40, y + 10)], (58, 42, 70))
    blob(d, x, y, 22, 30, (70, 52, 84))


def club(i, rot):
    x, y = cell(i)
    pts = [(-90, -10), (40, -18), (90, -34), (100, 0), (90, 34), (40, 18), (-90, 10)]
    r = math.radians(rot)
    poly(d, [(x + px * math.cos(r) - py * math.sin(r), y + px * math.sin(r) + py * math.cos(r)) for px, py in pts], (130, 84, 46))


def dart(i, rot):
    x, y = cell(i)
    pts = [(-90, -6), (60, -8), (100, 0), (60, 8), (-90, 6)]
    r = math.radians(rot)
    poly(d, [(x + px * math.cos(r) - py * math.sin(r), y + px * math.sin(r) + py * math.cos(r)) for px, py in pts], (96, 70, 40))


def glob(i, col):
    x, y = cell(i)
    blob(d, x, y, 70, 60, col, jit=0.25)


def puddle(i, col):
    x, y = cell(i)
    blob(d, x, y + 40, 115, 34, col, n=18, jit=0.15)


spike(0, (128, 120, 112)); bat(1); club(2, -20); dart(3, 10)
glob(4, (234, 88, 12)); glob(5, (110, 80, 48)); puddle(6, (220, 70, 14)); puddle(7, (104, 76, 46))
spike(8, (96, 104, 112)); bat(9); club(10, 30); dart(11, -30)
glob(12, (120, 190, 40)); puddle(13, (120, 190, 40))
x, y = cell(14)
for k in range(9):
    blob(d, x + random.randint(-70, 70), y + random.randint(-70, 70), 12, 12, (253, 160, 50))
x, y = cell(15)
blob(d, x, y, 70, 55, (128, 120, 112))
B.save(OUT / 'start-bossbits.webp', quality=95)

# ---- strips
S = Image.new('RGB', (1536, 1152), KEY)
d = ImageDraw.Draw(S)
for k in range(9):
    y0 = k * 128
    m = y0 + 64
    if k == 0:  # flame jet
        poly(d, [(40, m - 18), (900, m - 50), (1450, m - 10), (1500, m), (1450, m + 10), (900, m + 50), (40, m + 18)], (240, 100, 20))
        poly(d, [(40, m - 8), (800, m - 24), (1350, m), (800, m + 24), (40, m + 8)], (253, 210, 80), w=0)
    elif k == 1:  # vine whip
        pts = [(40 + i * 30, m + math.sin(i * 0.5) * 20) for i in range(49)]
        d.line(pts, fill=(60, 120, 40), width=22, joint='curve')
        for i in range(2, 48, 6):
            x, yy = pts[i]
            poly(d, [(x, yy), (x + 30, yy - 30), (x + 10, yy - 4)], (90, 160, 60), w=3)
    elif k == 2:  # energy beam
        d.rectangle([40, m - 30, 1500, m + 30], fill=(190, 80, 230))
        d.rectangle([40, m - 12, 1500, m + 12], fill=(250, 230, 255))
    elif k == 3:  # spear jab streak
        poly(d, [(40, m - 4), (1300, m - 16), (1500, m), (1300, m + 16), (40, m + 4)], (230, 230, 240))
    elif k in (4, 5, 6):  # waves along the ground
        col = {4: (130, 122, 112), 5: (234, 88, 12), 6: (92, 58, 34)}[k]
        pts = [(40, y0 + 120)]
        for i in range(15):
            x = 40 + i * 100
            pts += [(x + 30, y0 + 120 - (90 if i % 2 == 0 else 50) - random.randint(0, 20)), (x + 60, y0 + 120)]
        pts.append((1500, y0 + 120))
        poly(d, pts, col)
    elif k == 7:  # ground fire
        for i in range(24):
            x = 60 + i * 60
            poly(d, [(x - 34, y0 + 120), (x - 10 + random.randint(-8, 8), y0 + 20 + random.randint(0, 40)), (x + 34, y0 + 120)], (240, 110, 20))
            poly(d, [(x - 16, y0 + 120), (x, y0 + 60 + random.randint(0, 20)), (x + 16, y0 + 120)], (253, 210, 80), w=0)
    else:  # lava strip
        d.rectangle([40, y0 + 40, 1500, y0 + 120], fill=(200, 50, 10))
        for i in range(30):
            blob(d, 60 + i * 48, y0 + 60 + random.randint(0, 40), 14, 8, (253, 170, 50), jit=0.3)
S.save(OUT / 'start-bossstrips.webp', quality=95)
print('ok')
