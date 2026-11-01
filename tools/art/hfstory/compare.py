"""Before/after sheets of story panels (hf-cutscenes): each panel upright and sideways, before above after.

    python3 -I tools/art/hfstory/compare.py <before dir> <after dir> <out.jpg> <tag-NNN> [tag-NNN ...]
(the dirs hold <tag-NNN>-up.jpg and <tag-NNN>-side.jpg, as the capture script writes them)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

B, A, out, names = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3], sys.argv[4:]
UW, UH, SW, SH = 260, 563, 600, 277
col = UW + SW + 30
S = Image.new('RGB', (col * len(names), 2 * (UH + 24)), (16, 16, 16))
d = ImageDraw.Draw(S)
for i, n in enumerate(names):
    for j, (lab, D) in enumerate((('before', B), ('after', A))):
        x, y = i * col, j * (UH + 24)
        d.text((x + 4, y + 4), f'{n} {lab}', fill=(255, 220, 0))
        S.paste(Image.open(D / f'{n}-up.jpg').convert('RGB').resize((UW, UH)), (x, y + 20))
        S.paste(Image.open(D / f'{n}-side.jpg').convert('RGB').resize((SW, SH)), (x + UW + 10, y + 20))
S.save(out, quality=84)
print(out, S.size)
