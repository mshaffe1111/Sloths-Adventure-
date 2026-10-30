"""The join of a strip with itself (VI-2, 2026-10-29): the last `w` columns then the first `w`, as the game tiles it, on a dusky sky,
old (scaled to the new size) above and new below, a red tick at the join.
    python3 -I tools/art/hfbatch/striphdseam.py <old.webp> <new.webp> <out.jpg> [w=500]"""
import sys
from PIL import Image, ImageDraw

old_p, new_p, out_p = sys.argv[1:4]
w = int(sys.argv[4]) if len(sys.argv) > 4 else 500
new = Image.open(new_p).convert('RGBA')
old = Image.open(old_p).convert('RGBA').resize(new.size, Image.LANCZOS)
rows = []
for im in (old, new):
    j = Image.new('RGBA', (2 * w, im.height), (58, 70, 86, 255))
    j.alpha_composite(im.crop((im.width - w, 0, im.width, im.height)), (0, 0))
    j.alpha_composite(im.crop((0, 0, w, im.height)), (w, 0))
    rows.append(j.convert('RGB'))
out = Image.new('RGB', (2 * w, rows[0].height * 2 + 12), (0, 0, 0))
out.paste(rows[0], (0, 0)); out.paste(rows[1], (0, rows[0].height + 12))
d = ImageDraw.Draw(out)
for y in (0, rows[0].height + 12):
    d.line((w, y, w, y + 30), fill=(255, 0, 0), width=3)
out.save(out_p, quality=88)
print(out_p, out.size)
