"""backdrop_seams: the tile join of every painted strip, measured (art catalog part B3, 2026-11-11).

Strips repeat side by side unflipped (paintedBackdrops.ts), so the last column of a strip meets its first. For each strip this prints
  alpha_mismatch  the share of rows where one edge column is paint (alpha > 128) and the other is see-through: a tree or canopy cut off
                  in a straight vertical line at every repeat (the box edge a player sees)
  colour_step     the mean RGB difference across the join on rows that are paint on both sides: a visible seam in the paint
Prints CSV: file,alpha_mismatch,colour_step
"""
import glob, os, sys
from PIL import Image

files = sys.argv[1:] or sorted(glob.glob('src/assets/backdrops/w*-*.webp'))
print('file,alpha_mismatch,colour_step')
for f in files:
    im = Image.open(f).convert('RGBA')
    w, h = im.size
    px = im.load()
    mis = both = 0
    step = 0.0
    for y in range(h):
        a, b = px[w - 1, y], px[0, y]
        oa, ob = a[3] > 128, b[3] > 128
        if oa != ob:
            mis += 1
        elif oa:
            both += 1
            step += sum(abs(a[i] - b[i]) for i in range(3)) / 3
    print(f'{os.path.basename(f)},{mis / h:.3f},{(step / both) if both else 0:.1f}')
