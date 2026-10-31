"""Starts for World 9's new pieces (2026-10-31, GRAB-BAG.md §6, branch w9-pieces), on flat magenta, for w6to10/img2imggpu.py:
  start-w9flarecool.webp  the W9 props sheet's hot platform (props-made/w9b 'hot-platform') with its lava cracks pulled dark: the flare
                          slab resting (N5), repainted as cooled rock with a faint ember in the deepest cracks
  start-w9lavafall.webp   768 x 1536: three frames of lava pouring straight down from the top edge onto a splash at the foot (N9)
  start-w9gust.webp       1536 x 512: four frames of a hot ash gust streaking left to right, loose ash flakes and embers (N7)
  start-w9chunk.webp      1024 x 512: an obsidian chunk to carry, resting and lifted (N12, the raft lock)
  start-w9surge.webp      1536 x 512: three frames of the bright front of a lava surge rolling down a channel (N6)
  start-w9steam.webp      1536 x 768: three frames of a steam jet bursting up off a vent rock (N10)
    python3 tools/art/w9/piecestart.py
"""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'tools/art/hfbatch/starts'
KEY = (255, 0, 255)
rnd = random.Random(31)


def blob(d, x, y, r, col):
    pts = [(x + r * (0.8 + 0.3 * rnd.random()) * math.cos(a), y + r * (0.8 + 0.3 * rnd.random()) * math.sin(a)) for a in [i * math.pi / 6 for i in range(12)]]
    d.polygon(pts, fill=col)


# the cool slab: the painted hot platform, its glowing pixels pulled toward cooled basalt
src = Image.open(ROOT / 'src/assets/w6to10/props-made/w9b.webp').convert('RGBA').crop((567, 0, 567 + 434, 211))
px = src.load()
for y in range(src.height):
    for x in range(src.width):
        r, g, b, a = px[x, y]
        hot = max(0.0, min(1.0, (r - b - 40) / 120))
        if hot > 0:
            k = hot * 0.86
            px[x, y] = (int(r * (1 - k) + 70 * k), int(g * (1 - k) + 42 * k), int(b * (1 - k) + 40 * k), a)
cool = Image.new('RGB', (1024, 512), KEY)
big = src.resize((868, 422), Image.LANCZOS)
cool.paste(big, (78, 45), big)
cool.save(OUT / 'start-w9flarecool.webp', quality=92)

# the lavafall: three pours side by side, each a column of blobs from the top edge to a splash at the foot
lf = Image.new('RGB', (768, 1536), KEY)
d = ImageDraw.Draw(lf)
for i in range(3):
    cx = 128 + i * 256
    for y in range(-20, 1380, 14):
        wob = 10 * math.sin(y * 0.02 + i * 2)
        r = 34 + 8 * math.sin(y * 0.05 + i)
        blob(d, cx + wob, y, r + 6, (220, 80, 20))
        blob(d, cx + wob, y, r, (255, 150, 35))
        blob(d, cx + wob * 0.6, y, r * 0.5, (255, 228, 140))
    for k in range(14):
        a = math.pi * (0.1 + 0.8 * k / 13)
        blob(d, cx + 110 * math.cos(a) * rnd.uniform(0.6, 1), 1430 - 80 * math.sin(a) * rnd.uniform(0.5, 1), rnd.uniform(14, 26), (255, 130, 30))
    blob(d, cx, 1460, 70, (255, 170, 50))
lf.filter(ImageFilter.SMOOTH_MORE).save(OUT / 'start-w9lavafall.webp', quality=92)

# the gust: four frames of streaks with flakes, each frame a little further along so the four loop
gu = Image.new('RGB', (1536, 512), KEY)
d = ImageDraw.Draw(gu)
for f in range(4):
    x0 = f * 384
    for s in range(9):
        y = 60 + s * 46 + rnd.uniform(-10, 10)
        a = x0 + 20 + ((s * 53 + f * 40) % 120)
        d.rounded_rectangle([a, y, a + rnd.uniform(160, 300), y + rnd.uniform(6, 14)], 6, fill=(196, 180, 176))
    for k in range(14):
        x, y = x0 + rnd.uniform(20, 360), rnd.uniform(40, 470)
        blob(d, x, y, rnd.uniform(4, 8), (90, 80, 84) if k % 3 else (255, 140, 40))
gu.filter(ImageFilter.GaussianBlur(2)).save(OUT / 'start-w9gust.webp', quality=92)

# the obsidian chunk: resting, and the same chunk a little turned (held)
ch = Image.new('RGB', (1024, 512), KEY)
d = ImageDraw.Draw(ch)
for i, rot in enumerate((0.0, 0.35)):
    cx, cy = 256 + i * 512, 290
    pts = [(cx + 150 * math.cos(a + rot) * (0.75 + 0.25 * math.sin(3 * a)), cy + 110 * math.sin(a + rot) * (0.8 + 0.2 * math.cos(2 * a))) for a in [k * math.pi / 5 for k in range(10)]]
    d.polygon(pts, fill=(28, 26, 34))
    d.polygon([(cx - 60, cy - 50), (cx + 20, cy - 80), (cx + 70, cy - 30), (cx - 10, cy - 10)], fill=(70, 66, 92))
ch.filter(ImageFilter.SMOOTH).save(OUT / 'start-w9chunk.webp', quality=92)

# the surge: a rolling bright front, three moments
su = Image.new('RGB', (1536, 512), KEY)
d = ImageDraw.Draw(su)
for f in range(3):
    x0 = f * 512
    front = x0 + 330 + f * 30
    for x in range(x0 + 10, front, 10):
        u = (x - x0) / (front - x0)
        h = 120 + 140 * u * u
        blob(d, x, 470 - h * 0.5, h * 0.5, (200, 60, 20) if u < 0.6 else (255, 140, 30))
    for k in range(16):
        blob(d, front + rnd.uniform(-40, 30), 470 - rnd.uniform(160, 300), rnd.uniform(10, 26), (255, 220, 120))
su.filter(ImageFilter.SMOOTH_MORE).save(OUT / 'start-w9surge.webp', quality=92)

# the steam jet: a vent rock and a column of soft puffs, three moments
st = Image.new('RGB', (1536, 768), KEY)
d = ImageDraw.Draw(st)
for f, hgt in enumerate((240, 520, 380)):
    cx = 256 + f * 512
    d.polygon([(cx - 150, 740), (cx - 90, 660), (cx + 80, 650), (cx + 160, 740)], fill=(52, 48, 54))
    for k in range(18):
        u = k / 17
        if f == 2 and u < 0.3:
            continue
        blob(d, cx + rnd.uniform(-20, 20) * u, 660 - u * hgt, 34 + 50 * u, (232, 226, 222))
st.filter(ImageFilter.GaussianBlur(3)).save(OUT / 'start-w9steam.webp', quality=92)
print('ok')
