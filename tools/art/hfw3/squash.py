"""ART-W3: shorten a shelf's hanging rock underside (rows below y0 scaled by k) so the piece's box keeps under the platform cap
(catalog_master.py SCALE_RANGE platform <= 1.0 Pokey); the slab and its walk line above y0 are untouched.
    python3 -I tools/art/hfw3/squash.py <cut.png> <y0> <k>   (in place)"""
import sys
from PIL import Image
p, y0, k = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
im = Image.open(p).convert('RGBA'); W, H = im.size
low = im.crop((0, y0, W, H)).resize((W, max(1, round((H - y0) * k))), Image.LANCZOS)
o = Image.new('RGBA', (W, y0 + low.height), (0, 0, 0, 0)); o.paste(im.crop((0, 0, W, y0)), (0, 0)); o.alpha_composite(low, (0, y0))
o.save(p); print(p, (W, H), '->', o.size, f'{o.height / 3 / 89.1:.2f} Pokey at 3 cut px a unit')
