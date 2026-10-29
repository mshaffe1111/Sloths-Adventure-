"""Lay transparent atlases on a dark background, stacked, for the fringe check (2026-10-29).
    python3 -I tools/art/hfbatch/dark.py <out.jpg> <width> <atlas.webp> [...]
"""
import sys
from PIL import Image

OUT, W = sys.argv[1], int(sys.argv[2])
ims = []
for f in sys.argv[3:]:
    im = Image.open(f).convert('RGBA')
    bg = Image.new('RGBA', im.size, (22, 22, 30, 255)); bg.alpha_composite(im)
    k = min(1.0, W / im.width)
    ims.append(bg.convert('RGB').resize((round(im.width * k), round(im.height * k)), Image.LANCZOS))
S = Image.new('RGB', (max(i.width for i in ims), sum(i.height + 6 for i in ims)), (70, 70, 70)); y = 0
for i in ims:
    S.paste(i, (0, y)); y += i.height + 6
S.save(OUT, quality=88)
print(OUT, S.size)
