"""Contact sheet of shots.mjs's 1-1 stills, one row per tag: start, low, high upright, then the same three sideways (two above, one
below), each labelled.
    python3 -I tools/art/sunrise11/sheet.py <shots dir> <out.jpg> <tag>[=label] ...
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

d, out, tags = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
UW, UH, SW, SH = 300, 666, 666, 300
rowh = UH + 40
X0 = UW * 3 + 20
sheet = Image.new('RGB', (X0 + SW * 2 + 10, rowh * len(tags) + 10), (24, 24, 24))
dr = ImageDraw.Draw(sheet)
for r, t in enumerate(tags):
    tag, _, label = t.partition('=')
    y = r * rowh + 34
    dr.text((8, r * rowh + 10), f'{label or tag}  |  upright: start, low (x 8992), high (x 34571)  |  sideways: start, low / high', fill=(240, 220, 120))
    for i, spot in enumerate(('start', 'low', 'high')):
        sheet.paste(Image.open(d / f'{tag}-{spot}-up.png').convert('RGB').resize((UW, UH), Image.LANCZOS), (i * UW, y))
        pos = [(X0, y), (X0 + SW + 10, y), (X0, y + SH + 10)][i]
        sheet.paste(Image.open(d / f'{tag}-{spot}-side.png').convert('RGB').resize((SW, SH), Image.LANCZOS), pos)
sheet.save(out, quality=88)
print(out)
