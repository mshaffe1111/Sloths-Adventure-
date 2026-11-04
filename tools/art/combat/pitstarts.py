"""R-159.1 pit starts (w8-rope2, 2026-11-04), Matt-approved pit list: img2img starts from World 1's own painted pieces (hf-art.md §5).
  pit-drop.webp   W1's earth texture, darkening down into black: the fill of a vault pit (opaque, so on black)
  pit-lip.webp    W1's own ground-edge piece (the lip with hanging roots), lengthened down into the dark, on magenta
  pit-bed.webp    W1's big leaves heaped into a soft bed, on magenta (1-3's soft pit)
  pit-high.webp   the drop seen from branch height: W1's far canopy band, a mist band, then the dark (1-8)
    python3 -I tools/art/combat/pitstarts.py
"""
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'starts'
OUT.mkdir(exist_ok=True)
MAG = (255, 0, 255, 255)
G = Image.open(ROOT / 'src/assets/ground/w1.webp').convert('RGBA')


def fade_to_black(im, start=0.0, power=1.0):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    h = a.shape[0]
    t = np.clip((np.arange(h) / h - start) / (1 - start), 0, 1) ** power
    a *= (1 - 0.94 * t)[:, None, None]
    return Image.fromarray(a.astype(np.uint8))


def solid(im):
    im.putalpha(im.getchannel('A').point(lambda v: 255 if v >= 128 else 0))
    return im


# 1. the drop: the earth texture (the ground atlas's top square), darkening down into black
earth = G.crop((0, 0, 1024, 1024))
fade_to_black(earth, 0.05, 0.8).save(OUT / 'pit-drop.webp', quality=95)

# 2. the lip: the atlas's ground-edge piece, on magenta, the earth below it darkening
# (the edge piece sits right of the short grass strip and below the long one: this box holds only it)
reg = G.crop((1080, 2200, 1500, 2944))
edge = solid(reg.crop(reg.getchannel('A').point(lambda v: 255 if v >= 128 else 0).getbbox()))
lip = Image.new('RGBA', (768, 1024), MAG)
k = 700 / edge.height
e2 = edge.resize((int(edge.width * k), 700), Image.LANCZOS)
lip.alpha_composite(solid(e2), ((768 - e2.width) // 2, 80))
lip.convert('RGB').save(OUT / 'pit-lip.webp', quality=95)

# 3. the soft bed: the big green leaves heaped into a mound
L = Image.open(ROOT / 'src/assets/flora/leaves-atlas.webp').convert('RGBA')
A = np.asarray(L.getchannel('A')) > 128
leaves = []
boxes = []
for y0, y1 in ((0, 72), (72, 157), (157, L.height)):  # the atlas's three rows; leaves split by empty columns
    col = A[y0:y1].any(axis=0)
    x = 0
    while x < len(col):
        if col[x]:
            x0 = x
            while x < len(col) and col[x]:
                x += 1
            boxes.append((x0, y0, x, y1))
        x += 1
for b in boxes:
    if (b[2] - b[0]) * (b[3] - b[1]) > 2500:
        c = L.crop(b)
        c = c.crop(c.getbbox())
        r, g, b = [np.asarray(c.convert('RGB'))[..., i].mean() for i in range(3)]
        if g > r:  # the green ones (no autumn leaves in a soft bed)
            leaves.append(c)
bed = Image.new('RGBA', (1024, 512), MAG)
rnd = random.Random(5)
for i in range(70):
    lf = rnd.choice(leaves)
    s = rnd.uniform(1.2, 2.0)
    lf = lf.resize((int(lf.width * s), int(lf.height * s)), Image.LANCZOS).rotate(rnd.uniform(-40, 40), expand=True, resample=Image.BICUBIC)
    x = rnd.randint(40, 1024 - 40 - lf.width)
    # a mound: higher in the middle
    top = 300 - int(120 * (1 - abs((x + lf.width / 2) / 1024 - 0.5) * 2))
    y = rnd.randint(top, 470 - lf.height // 2)
    bed.alpha_composite(solid(lf), (x, max(0, min(512 - lf.height, y))))
bed.convert('RGB').save(OUT / 'pit-bed.webp', quality=95)

# 4. the high drop: the W1 far backdrop's lower band, a mist band, then the dark
far = Image.open(ROOT / 'src/assets/backdrops/w1-far.webp').convert('RGB')
band = far.crop((0, int(far.height * 0.45), min(far.width, int(far.height * 0.55 * 1024 / 1024)), far.height)).resize((1024, 400), Image.LANCZOS)
high = Image.new('RGB', (1024, 1024), (0, 0, 0))
high.paste(band, (0, 0))
mist = Image.new('RGB', (1024, 1024), (205, 215, 205))
m = np.zeros((1024, 1024), np.uint8)
for y in range(1024):
    m[y] = int(200 * np.exp(-((y - 400) / 90) ** 2))
high = Image.composite(mist, high, Image.fromarray(m))
high = fade_to_black(high, 0.42, 0.9)
high.save(OUT / 'pit-high.webp', quality=95)
print(sorted(p.name for p in OUT.iterdir()), 'leaves', len(leaves))
