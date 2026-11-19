"""ART-W2A show-first sheet: each cut take beside Matt's Happy pose (2x sheet size), then the same row at GAME size on 2-3's own still
(ENG-23 1-walk-land, dsf 2: 1.40 px per unit, a little one 33 units wide), and an upright-size crop.
    python3 -I tools/art/hfw2a/sheet.py <out.jpg> <title> <ref.png> <cut.png>...
"""
import sys
from PIL import Image, ImageDraw
out, title, ref, cuts = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
ims = [(p.split('/')[-1][:-4], Image.open(p).convert('RGBA')) for p in [ref] + cuts]
W = 33
refw = ims[0][1].width
# row 1: sheet size (each at its own sheet px, the same scale), on a mid backdrop tone
H1 = max(im.height for _, im in ims) + 30
row1 = Image.new('RGBA', (sum(im.width + 20 for _, im in ims) + 20, H1), (150, 168, 132, 255))
d = ImageDraw.Draw(row1); x = 20
for n, im in ims:
    row1.alpha_composite(im, (x, H1 - im.height - 4)); d.text((x, 2), n, fill=(0, 0, 0)); x += im.width + 20
# rows 2-3: game size on the real 2-3 stills, each scaled as the Happy pose is drawn (33 units wide): sideways (915x412 dsf 2: 540 units
# tall, 1.526 px a unit; ground y 478) and upright (412x915 dsf 2: 440 units wide, 1.873 px a unit; ground y 1132)
def strip(still, pxu, box, ground):
    bg = Image.open(still).convert('RGBA')
    st = bg.crop(box).copy()
    k = W * pxu / refw; x = 24
    for n, im in ims:
        t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        st.alpha_composite(t, (x, ground - box[1] - t.height)); x += round(t.width + 14)
    return st.convert('RGB')
land = strip('reference/qa-reports/ENG-23/stills/1-walk-land.webp', 1.526, (800, 330, 1330, 500), 478)
port = strip('reference/qa-reports/ENG-23/stills/1-walk-port.webp', 1.873, (300, 980, 824, 1170), 1132)
Wd = max(row1.width, land.width + port.width + 10)
S = Image.new('RGB', (Wd, 26 + H1 + max(land.height, port.height) + 10), (30, 30, 30))
dd = ImageDraw.Draw(S); dd.text((8, 6), title + '  | top: sheet px (Happy ref first), same scale  | bottom: game size on 2-3, sideways (left) and upright (right), dsf 2', fill=(255, 255, 0))
S.paste(row1.convert('RGB'), (0, 26)); S.paste(land, (0, 26 + H1 + 6)); S.paste(port, (land.width + 10, 26 + H1 + 6))
S.save(out, quality=90)
print(out, S.size)
