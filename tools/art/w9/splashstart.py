"""Start sheet for World 9's lava splash (2026-10-29): what plays where Pokey falls into the lava, in place of the "TOO HOT!" words (the
lead: no words in the world). 1536 x 512 on magenta, three frames side by side, for img2img (w6to10/img2imggpu.py, make_spec.py round 3):
  1) the lava bursting up in a crown of molten splashes and drops, 2) the crown falling back with a puff of steam rising,
  3) the steam alone, rising and thinning, a few embers in it
    python3 tools/art/w9/splashstart.py
"""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parents[3] / 'tools/art/hfbatch/starts'
KEY = (255, 0, 255)
rnd = random.Random(29)
im = Image.new('RGB', (1536, 512), KEY)
d = ImageDraw.Draw(im)


def blob(x, y, r, col):
    pts = [(x + r * (0.8 + 0.3 * rnd.random()) * math.cos(a), y + r * (0.8 + 0.3 * rnd.random()) * math.sin(a)) for a in [i * math.pi / 6 for i in range(12)]]
    d.polygon(pts, fill=col)


base = 470
for i, cx in enumerate((256, 768, 1280)):
    # the lava's surface at the foot of each frame
    d.ellipse([cx - 210, base - 30, cx + 210, base + 30], fill=(250, 140, 30))
    if i < 2:
        h = 300 if i == 0 else 200
        for k in range(14):
            a = -math.pi / 2 + (k - 6.5) * 0.16
            rr = h * (0.6 + 0.4 * rnd.random())
            x, y = cx + rr * math.cos(a) * (1.4 if i == 1 else 1), base - 20 + rr * math.sin(a) * (0.7 if i == 1 else 1)
            d.line([(cx + (x - cx) * 0.3, base - 20), (x, y)], fill=(255, 150, 35), width=22)
            blob(x, y, 16, (255, 200, 80))
    if i > 0:
        for k in range(6):
            blob(cx + rnd.uniform(-60, 60), base - 140 - 55 * k * (1.3 if i == 2 else 0.9), 40 + 6 * k, (214, 206, 202))
im.filter(ImageFilter.SMOOTH_MORE).save(OUT / 'start-w9splash.webp', quality=92)
print('ok')
