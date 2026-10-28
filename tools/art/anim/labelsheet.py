"""A labelled contact sheet of cut-out cells, to choose start pictures by name.
    python3 -I tools/art/anim/labelsheet.py <out.png> <cell.png> ...   (each cell is shown on flat grey with its file name)"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
T, cols = 200, 8
rows = (len(files) + cols - 1) // cols
S = Image.new('RGB', (cols * T, rows * (T + 14)), (40, 40, 40))
d = ImageDraw.Draw(S)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGBA')
    im.thumbnail((T - 8, T - 8))
    tile = Image.new('RGBA', (T, T), (200, 200, 200, 255))
    tile.alpha_composite(im, ((T - im.width) // 2, (T - im.height) // 2))
    x, y = (i % cols) * T, (i // cols) * (T + 14)
    S.paste(tile.convert('RGB'), (x, y + 14))
    d.text((x + 3, y + 1), Path(f).stem, fill=(255, 255, 0))
S.save(out)
