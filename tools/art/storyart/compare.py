"""Before/after sheets of story stills (shots.mjs output): one row per shot, before and after, upright and sideways.

    python3 -I tools/art/storyart/compare.py <before dir> <after dir> <out.jpg> <tag> [title]
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

b, a, out, tag = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3], sys.argv[4]
title = sys.argv[5] if len(sys.argv) > 5 else tag
shots = sorted({p.name.rsplit('-', 1)[0] for p in a.glob(f'{tag}-*-up.jpg')})
UW, UH = 300, 650
SW, SH = 700, 323
rowh = UH + 30
S = Image.new("RGB", (2 * UW + SW + 90, 40 + rowh * len(shots)), (18, 20, 22))
d = ImageDraw.Draw(S)
d.text((10, 10), f'{title}: before | after (upright 390x844, sideways 844x390, phone pixel ratio 3)', fill=(255, 230, 0))
for i, s in enumerate(shots):
    y = 40 + i * rowh
    d.text((10, y), s, fill=(220, 220, 220))
    x = 10
    for src in (b, a):
        f = src / f'{s}-up.jpg'
        if f.exists():
            S.paste(Image.open(f).resize((UW, UH)), (x, y + 18))
        x += UW + 10
    for j, src in enumerate((b, a)):
        f = src / f'{s}-side.jpg'
        if f.exists():
            S.paste(Image.open(f).resize((SW, SH)), (x, y + 18 + j * (SH + 6)))
    d.text((x + SW + 4, y + 20), 'before', fill=(160, 160, 160))
    d.text((x + SW + 4, y + 26 + SH), 'after', fill=(160, 160, 160))
S.save(out, quality=82)
print(out, len(shots))
