# BUILD-27g: bottom-band numbers for upright stills: per band of the bottom 30% (6 bands), mean luminance and a vertical-streak score
# (mean |column - next column| of the band's column means; streaks show as a high score with a low row-to-row change)
import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f).convert('L'); w, h = im.size; px = im.load()
    out = []
    top = int(h * 0.70); bh = (h - top) // 6
    for b in range(6):
        y0 = top + b * bh; ys = range(y0, y0 + bh, 2)
        cols = [sum(px[x, y] for y in ys) / len(ys) for x in range(0, w, 2)]
        mean = sum(cols) / len(cols)
        streak = sum(abs(cols[i] - cols[i + 1]) for i in range(len(cols) - 1)) / (len(cols) - 1)
        out.append(f'{mean:5.1f}/{streak:4.1f}')
    last = [sum(px[x, y] for x in range(0, w, 2)) / (w // 2) for y in range(h - 12, h)]
    print(f.split('/')[-1], 'bands lum/streak:', ' '.join(out), '| last 12 rows min lum', round(min(last), 1))
