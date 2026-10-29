"""Round-2 starts for the boss art batch (hf-art-bosses, 2026-10-29), after the first takes kept the plain start shapes too closely:
the storm clouds came back as four smooth blobs, the mud wave as a dome, the splash as a ring of beads and the dust as tan eggs. These
starts give the model the real silhouettes (a lumpy cloud bank, a breaking wave with its lip curled over, a crown splash, billowing
puffs that break into wisps) and are run at higher strengths.

    python3 -I tools/art/hfbosses/bossstarts2.py <out dir>
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
GRN = (0, 255, 0)
rnd = random.Random(11)


def puff(d, cx, cy, r, base, light, line, n=9, spread=1.0):
    """a lumpy cloud/dust shape: overlapping round lobes, a lighter top-left on each"""
    lobes = []
    for i in range(n):
        a = i / n * math.tau
        rr = r * rnd.uniform(0.45, 0.7)
        lobes.append((cx + math.cos(a) * r * 0.62 * spread, cy + math.sin(a) * r * 0.36, rr))
    lobes.append((cx, cy - r * 0.1, r * 0.75))
    for x, y, rr in lobes:
        d.ellipse((x - rr - 5, y - rr - 5, x + rr + 5, y + rr + 5), fill=line)
    for x, y, rr in lobes:
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=base)
    for x, y, rr in lobes:
        if y < cy + r * 0.1:
            d.ellipse((x - rr * 0.75, y - rr * 0.85, x + rr * 0.35, y + rr * 0.1), fill=light)


# the storm bank (sheet on green): three different thunderclouds, wide and low, each its own shape
sv = Image.new('RGB', (1536, 1024), GRN)
d = ImageDraw.Draw(sv)
for i, (cx, cy, r) in enumerate(((260, 260, 150), (760, 250, 180), (1270, 270, 140))):
    puff(d, cx, cy, r, (52, 40, 92), (104, 86, 160), (16, 8, 34), n=11, spread=1.25)
# and a second row: two long low banks for the floor-level storm strip
for cx in (420, 1120):
    for k in range(6):
        puff(d, cx - 250 + k * 100, 700 + (k % 2) * 14, 90, (52, 40, 92), (104, 86, 160), (16, 8, 34), n=8)
sv.save(OUT / 'start-fx-storm.webp', quality=92)

# the mud wave and the splash (sheet on magenta)
cr = Image.new('RGB', (1536, 1024), MAG)
d = ImageDraw.Draw(cr)
# a breaking wave of thick mud, moving right: a wall rising from the ground with its lip curled over forward, clods flying off the top
x0, y0 = 120, 700
pts = [(x0, y0)]
for i in range(41):
    u = i / 40
    pts.append((x0 + u * 520, y0 - 380 * math.sin(u * math.pi * 0.62) ** 1.4))
pts += [(x0 + 600, y0 - 300), (x0 + 640, y0 - 210), (x0 + 580, y0 - 230), (x0 + 560, y0 - 140), (x0 + 600, y0)]
d.polygon(pts, fill=(120, 88, 48), outline=(36, 22, 8), width=10)
d.polygon([(x0 + 60, y0 - 40), (x0 + 380, y0 - 330), (x0 + 520, y0 - 340), (x0 + 300, y0 - 200), (x0 + 120, y0 - 20)], fill=(162, 124, 72))
for i in range(9):
    cx, cy, r = x0 + 420 + rnd.uniform(0, 260), y0 - 380 - rnd.uniform(0, 140), rnd.uniform(14, 30)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(120, 88, 48), outline=(36, 22, 8), width=6)
d.rectangle((x0 - 20, y0 - 10, x0 + 640, y0 + 30), fill=(96, 68, 36))
# a crown splash of river water: a ring of spikes thrown up, droplets flying off each tip
sx, sy = 1130, 780
for i in range(9):
    a = math.pi * (0.08 + 0.84 * i / 8)
    tip = (sx + math.cos(a) * 300, sy - math.sin(a) * 330 * (0.8 + 0.4 * rnd.random()))
    d.polygon([(sx + math.cos(a) * 110 - 26, sy), (tip[0], tip[1]), (sx + math.cos(a) * 110 + 26, sy)], fill=(150, 214, 214), outline=(20, 60, 70))
    d.ellipse((tip[0] - 22, tip[1] - 46, tip[0] + 22, tip[1] - 2), fill=(200, 240, 236), outline=(20, 60, 70), width=5)
d.ellipse((sx - 330, sy - 40, sx + 330, sy + 40), fill=(60, 140, 140), outline=(20, 60, 70), width=8)
cr.save(OUT / 'start-fx-mud.webp', quality=92)

# the dust puff, eight frames of 256 x 256 on magenta: a burst from the ground, billowing out, breaking up into wisps and thinning
du = Image.new('RGB', (2048, 256), MAG)
d = ImageDraw.Draw(du)
for f in range(8):
    u = f / 7
    cx = f * 256 + 128
    r = 34 + 62 * u ** 0.6
    base = (int(206 - 20 * u), int(184 - 18 * u), int(146 - 14 * u))
    light = (236, 222, 192)
    line = (122, 100, 70)
    if u < 0.7:
        puff(d, cx, 220 - r * 0.55, r, base, light, line, n=7)
    else:
        for k in range(5):  # broken into separate wisps drifting apart
            a = k / 5 * math.pi + 0.3
            wx, wy = cx + math.cos(a) * r * 0.9, 200 - math.sin(a) * r * 0.7
            rr = r * (0.3 - 0.1 * (u - 0.7) / 0.3)
            d.ellipse((wx - rr - 4, wy - rr * 0.7 - 4, wx + rr + 4, wy + rr * 0.7 + 4), fill=line)
            d.ellipse((wx - rr, wy - rr * 0.7, wx + rr, wy + rr * 0.7), fill=base)
du.save(OUT / 'start-dust2.webp', quality=92)
print('ok')
