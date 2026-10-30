"""Where a native-resolution strip differs most from the old one (VI-2, 2026-10-29): both on mid-grey at the new size, blurred to
ignore the new brushwork, the 6 worst 256 px cells boxed on an overview (old above, new below), so a changed or lost shape is found
without hunting.
    python3 -I tools/art/hfbatch/striphddiff.py <old.webp> <new.webp> <out.jpg>"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

old_p, new_p, out_p = sys.argv[1:4]
new = Image.open(new_p).convert('RGBA')
old = Image.open(old_p).convert('RGBA').resize(new.size, Image.LANCZOS)


def on(im, c):
    bg = Image.new('RGBA', im.size, c + (255,)); bg.alpha_composite(im); return bg.convert('RGB')


A = np.asarray(on(old, (110, 110, 110)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32)
B = np.asarray(on(new, (110, 110, 110)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32)
d = np.abs(A - B).sum(-1)
C = 256
H, W = d.shape
cells = []
for y in range(0, H - C // 2, C // 2):
    for x in range(0, W - C // 2, C // 2):
        cells.append((d[y:y + C, x:x + C].mean(), x, y))
cells.sort(reverse=True)
pick = []
for s, x, y in cells:
    if all(abs(x - px) >= C or abs(y - py) >= C for _, px, py in pick):
        pick.append((s, x, y))
    if len(pick) == 6:
        break
sc = 1600 / W
ov = Image.new('RGB', (1600, round(H * sc) * 2 + 10), (0, 0, 0))
o1 = on(old, (40, 44, 52)).resize((1600, round(H * sc)), Image.LANCZOS)
o2 = on(new, (40, 44, 52)).resize((1600, round(H * sc)), Image.LANCZOS)
ov.paste(o1, (0, 0)); ov.paste(o2, (0, round(H * sc) + 10))
dr = ImageDraw.Draw(ov)
for s, x, y in pick:
    for oy in (0, round(H * sc) + 10):
        dr.rectangle((x * sc, oy + y * sc, (x + C) * sc, oy + (y + C) * sc), outline=(255, 0, 0), width=2)
        dr.text((x * sc + 3, oy + y * sc + 3), f'{s:.0f}', fill=(255, 255, 0))
ov.save(out_p, quality=85)
print(out_p, 'mean', round(float(d.mean()), 1), 'worst', [round(float(s)) for s, _, _ in pick])
