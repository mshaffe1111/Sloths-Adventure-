"""A frame strip of the standard hero, every frame at game scale on its feet line (pokey-anim review sheets).

    python3 -I tools/art/pokeyanim/strip.py <out.png> <frame,frame,...> [atlas dir (default src/)] [--flip i,j]   (a name 'name~' is mirrored)
"""
import re, sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
out, names = sys.argv[1], sys.argv[2].split(',')
d = Path(sys.argv[3]) if len(sys.argv) > 3 else None
data = ((d / 'heroStandardData.ts') if d else ROOT / 'src/game/heroStandardData.ts').read_text()
atlas = Image.open((d / 'hero-standard.webp') if d else ROOT / 'src/assets/hero/hero-standard.webp').convert('RGBA')
CW, CH, FEET = 230, 300, 260
sheet = Image.new('RGBA', (CW * len(names), CH), (214, 222, 206, 255))
dr = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    flip = n.endswith('~')
    n = n.rstrip('~')
    m = re.search(rf"\b{n}: \{{ x: (\d+), y: (\d+), w: (\d+), h: (\d+), ax: ([\d.]+), ay: ([\d.]+)", data)
    x, y, w, h = map(int, m.groups()[:4]); ax, ay = float(m.group(5)), float(m.group(6))
    im = atlas.crop((x, y, x + w, y + h))
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT); ax = w - ax
    sheet.alpha_composite(im, (round(i * CW + CW / 2 - ax), round(FEET - ay)))
    dr.line((i * CW, FEET, i * CW + CW, FEET), fill=(90, 110, 80, 255))
    dr.text((i * CW + 6, 6), n + (' (mirrored)' if flip else ''), fill=(20, 20, 20, 255))
sheet.convert('RGB').save(out)
