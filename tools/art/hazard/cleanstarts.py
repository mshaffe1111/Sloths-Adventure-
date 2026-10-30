"""Starts for the cleanness-sweep batch (2026-10-29 evening, CLEAN-SWEEP S1, S2, S4 on polish-clean), for img2img with the style model
(tools/art/w6to10/img2imggpu.py). Each is built from the game's own painted pieces so the model only repaints:
  start-deep2.webp     1024 x 1024  World 2's river below its painted strip (S1): the strip's own deep rows, stretched down and darkened,
                                     with soft light shafts and drifting silt marked in, for a deep river texture
  start-deep6.webp     1024 x 1024  the dirty water's deep rows (w6-water chop), the same way, for the murky deep under it (S4 / G5)
  start-chop.webp      1024 x 528   the dirty water's choppy strip itself, for variants (S4)
  start-debris.webp    1024 x 1024  4 x 4 cells of things riding dirty water (S4): the sheet's leaf clump turned and resized, twigs and log
                                     bits from World 4's broken log and boulders, pale foam blobs
  start-rubble.webp    1024 x 1024  4 x 4 cells (S2): W9 obsidian (glassy black rock lumps, rounded, lying low, not spikes) in rows 0-1 and
                                     W10 rusted iron thorns broken off the General's netting, lying flat and half buried, in rows 2-3
    python3 -I tools/art/hazard/cleanstarts.py <game checkout> <out dir>
"""
import random, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
random.seed(11)
KEY = (255, 0, 255)


def deep_from(strip, out, tint, rays):
    W = 1024
    s = strip.convert('RGB')
    band = s.crop((0, int(s.height * 0.62), s.width, s.height))
    band = band.resize((W, 1024), Image.BICUBIC)
    # darken toward the bottom and shift toward the tint
    px = band.load()
    for y in range(1024):
        k = 1 - 0.45 * (y / 1023)
        for x in range(W):
            r, g, b = px[x, y]
            px[x, y] = (int((r * 0.7 + tint[0] * 0.3) * k), int((g * 0.7 + tint[1] * 0.3) * k), int((b * 0.7 + tint[2] * 0.3) * k))
    d = ImageDraw.Draw(band, 'RGBA')
    if rays:
        for i in range(5):
            x = random.randint(60, 960)
            d.polygon([(x - 30, 0), (x + 30, 0), (x + 110, 1024), (x - 10, 1024)], fill=(255, 255, 230, 22))
    for i in range(160):
        x, y, r = random.randint(0, W), random.randint(0, 1024), random.choice((2, 2, 3, 4))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(220, 220, 190, 70))
    for i in range(10):
        x, y = random.randint(0, W), random.randint(600, 1000)
        d.ellipse([x - 60, y - 14, x + 60, y + 14], fill=(0, 0, 0, 40))
    band.filter(ImageFilter.GaussianBlur(1.2)).save(OUT / out, quality=95)


t = (GAME / 'src/game/w2PropsData.ts').read_text()
m = re.search(r'water: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', t)
x, y, w, h = map(int, m.groups())
w2 = Image.open(GAME / 'src/assets/props/w2-props.webp').crop((x, y, x + w, y + h))
deep_from(w2, 'start-deep2.webp', (30, 66, 71), True)
w6 = Image.open(GAME / 'src/assets/props/w6-water.webp').convert('RGBA')
chop = w6.crop((0, 0, 1024, 528))
deep_from(chop, 'start-deep6.webp', (48, 49, 44), False)
bg = Image.new('RGBA', chop.size, KEY + (255,))
bg.alpha_composite(chop)
bg.convert('RGB').save(OUT / 'start-chop.webp', quality=95)

# debris
leaves = w6.crop((0, 541, 512, 754))
leaves = leaves.crop(leaves.getchannel('A').getbbox())
t4 = (GAME / 'src/game/w4PropsData.ts').read_text()
F4 = {m[0]: tuple(map(int, m[1:])) for m in re.findall(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', t4)}
w4 = Image.open(GAME / 'src/assets/props/w4-props.webp').convert('RGBA')


def p4(n):
    a, b, c, d = F4[n]
    im = w4.crop((a, b, a + c, b + d))
    return im.crop(im.getchannel('A').getbbox())


D = Image.new('RGBA', (1024, 1024), KEY + (255,))
dd = ImageDraw.Draw(D)


def place(i, im, w, rot=0):
    im = im.rotate(rot, Image.BICUBIC, expand=True)
    im = im.crop(im.getchannel('A').getbbox())
    k = w / im.width
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    cx, cy = (i % 4) * 256 + 128, (i // 4) * 256 + 150
    D.alpha_composite(im, (cx - im.width // 2, cy - im.height // 2))


for i, (w_, r_) in enumerate([(220, 0), (170, 12), (200, -8), (150, 25)]):
    place(i, leaves, w_, r_)
place(4, p4('brokenLog'), 200, 80)
place(5, p4('brokenLog'), 160, 95)
for i, n in ((6, 'boulderSmall'), (7, 'rockMoss')):
    place(i, p4(n), 120)
for i in range(8, 12):
    cx, cy = (i % 4) * 256 + 128, (i // 4) * 256 + 150
    for k in range(random.randint(5, 9)):
        r = random.randint(12, 34)
        x, y = cx + random.randint(-80, 80), cy + random.randint(-30, 30)
        dd.ellipse([x - r, y - r * 0.55, x + r, y + r * 0.55], fill=(226, 222, 196), outline=(60, 56, 44), width=3)
for i in range(12, 16):
    cx, cy = (i % 4) * 256 + 128, (i // 4) * 256 + 150
    for k in range(random.randint(3, 5)):
        x0 = cx + random.randint(-90, 40)
        y0 = cy + random.randint(-30, 30)
        dd.line([(x0, y0), (x0 + random.randint(60, 120), y0 + random.randint(-20, 20))], fill=(92, 66, 40), width=random.randint(5, 9))
    place(i, leaves, 90, random.randint(-30, 30))
D.convert('RGB').save(OUT / 'start-debris.webp', quality=95)

# rubble
R = Image.new('RGB', (1024, 1024), KEY)
d = ImageDraw.Draw(R)
INK = (20, 16, 24)
for i in range(8):
    cx, cy = (i % 4) * 256 + 128, (i // 4) * 256 + 170
    for k in range(random.randint(2, 4)):
        rx, ry = random.randint(30, 70), random.randint(20, 45)
        x, y = cx + random.randint(-60, 60), cy - ry + random.randint(0, 10)
        pts = []
        n = random.randint(6, 8)
        for j in range(n):
            a = j / n * 6.283 + random.random() * 0.4
            import math
            pts.append((x + math.cos(a) * rx * (0.8 + random.random() * 0.3), min(cy, y + math.sin(a) * ry * (0.8 + random.random() * 0.3))))
        d.polygon(pts, fill=(28, 24, 40), outline=INK, width=4)
        d.line([pts[1], pts[2]], fill=(150, 140, 210), width=5)
    d.rectangle([cx - 110, cy, cx + 110, cy + 8], fill=(70, 50, 40))
for i in range(8, 16):
    cx, cy = (i % 4) * 256 + 128, (i // 4) * 256 + 170
    import math
    for k in range(random.randint(1, 2)):
        ang = random.choice((-1, 1)) * random.uniform(0.15, 0.45)
        L = random.randint(110, 170)
        x0 = cx - L / 2 + random.randint(-20, 20)
        y0 = cy - random.randint(4, 16)
        tip = (x0 + math.cos(ang) * L, y0 - abs(math.sin(ang)) * L * 0.35)
        d.polygon([(x0, y0 - 9), tip, (x0, y0 + 9)], fill=(70, 62, 66), outline=INK, width=4)
        for s in range(2, 5):
            px_ = x0 + (tip[0] - x0) * s / 6
            py_ = y0 + (tip[1] - y0) * s / 6
            d.line([(px_, py_), (px_ + 6, py_ - 6)], fill=(150, 80, 40), width=4)
    d.rectangle([cx - 110, cy, cx + 110, cy + 10], fill=(84, 88, 98))
R.save(OUT / 'start-rubble.webp', quality=95)
print('ok')
