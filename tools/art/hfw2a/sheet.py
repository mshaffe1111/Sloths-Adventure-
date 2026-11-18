"""ART-W2A show-first sheet: each cut take beside Matt's Happy pose (2x sheet size), then the same row at GAME size on 2-3's own still
(ENG-23 1-walk-land, dsf 2: 1.40 px per unit, a little one 33 units wide), and an upright-size crop.
    python3 -I tools/art/hfw2a/sheet.py <out.jpg> <title> <ref.png> <cut.png>...
"""
import sys
from PIL import Image, ImageDraw
out, title, ref, cuts = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
ims = [(p.split('/')[-1][:-4], Image.open(p).convert('RGBA')) for p in [ref] + cuts]
BG = Image.open('reference/qa-reports/ENG-23/stills/1-walk-land.webp').convert('RGBA')
PXU, W = 1.40, 33
refw = ims[0][1].width
# row 1: sheet size (each at its own sheet px, the same scale), on a mid backdrop tone
H1 = max(im.height for _, im in ims) + 30
row1 = Image.new('RGBA', (sum(im.width + 20 for _, im in ims) + 20, H1), (150, 168, 132, 255))
d = ImageDraw.Draw(row1); x = 20
for n, im in ims:
    row1.alpha_composite(im, (x, H1 - im.height - 4)); d.text((x, 2), n, fill=(0, 0, 0)); x += im.width + 20
# row 2: game size on the real 2-3 still (ground line y 478), each scaled as the Happy pose is drawn (33 units wide)
k = W * PXU / refw
strip = BG.crop((120, 330, 120 + max(900, len(ims) * 80 + 60), 500)).copy()
x = 40
for n, im in ims:
    t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    strip.alpha_composite(t, (x, 478 - 330 - t.height)); x += 80
strip3 = strip.resize((strip.width * 2, strip.height * 2), Image.NEAREST)
Wd = max(row1.width, strip3.width)
S = Image.new('RGB', (Wd, 26 + H1 + strip.height + strip3.height + 20), (30, 30, 30))
dd = ImageDraw.Draw(S); dd.text((8, 6), title + '  | row 1: sheet px (Happy ref first)  row 2: game size on 2-3 (dsf 2)  row 3: row 2 at 2x', fill=(255, 255, 0))
S.paste(row1.convert('RGB'), (0, 26)); S.paste(strip.convert('RGB'), (0, 26 + H1 + 6)); S.paste(strip3.convert('RGB'), (0, 26 + H1 + strip.height + 14))
S.save(out, quality=88)
print(out, S.size)
