"""Before/after pictures for the hf-art-ground report: for each stage, the upright and sideways shots of each tag side by side, a tag per
row, labelled.
    python3 tools/art/hfground/combine.py <shots dir> <out.jpg> <stage> <tag>...
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

d, out, stage, *tags = sys.argv[1:]
d = Path(d)
rows = []
for t in tags:
    up = Image.open(d / f'{t}-{stage}-up.jpg')
    sd = Image.open(d / f'{t}-{stage}-side.jpg')
    k = 0.4
    up = up.resize((round(up.width * k), round(up.height * k)))
    sd = sd.resize((round(sd.width * k * up.height / (sd.height * k) * 0.5), round(up.height * 0.5)))
    R = Image.new('RGB', (up.width + sd.width + 8, up.height), (18, 18, 18))
    R.paste(up, (0, 0))
    R.paste(sd, (up.width + 8, 0))
    dr = ImageDraw.Draw(R)
    dr.rectangle((up.width + 8, sd.height + 6, up.width + 300, sd.height + 30), fill=(0, 0, 0))
    dr.text((up.width + 14, sd.height + 10), f'{stage} {t}', fill=(255, 255, 0))
    rows.append(R)
W = max(r.width for r in rows)
O = Image.new('RGB', (W, sum(r.height + 6 for r in rows)), (18, 18, 18))
y = 0
for r in rows:
    O.paste(r, (0, y))
    y += r.height + 6
O.save(out, quality=82)
print(out)
