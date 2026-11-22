"""ART-NEXT-d (R-165.354, R-165.370): one contact sheet per Wan take, every frame keyed and placed at game sheet scale exactly as
bridgebake.py places it (its own key and anchor, run from its source), light row over dark row, the exact PLAIN frame first (and, for a
bridge, the clip's frame 0 last), 8 tiles a row. Prints per frame the feet (left, right, bottom) and the silhouette xor against the
plain frame, so a slide or drift reads as numbers before anyone looks.
    python3 -I tools/art/hfnext/takesheet.py <take dir> <out.jpg> [<clip for the last tile>]
"""
import glob, sys
import numpy as np
from PIL import Image, ImageDraw

take, out = sys.argv[1], sys.argv[2]
clip = sys.argv[3] if len(sys.argv) > 3 else None
src = open('tools/art/hfnext/bridgebake.py').read().split('\nplain = ')[0]       # its imports, key(), on_anchor(), clip_frames()
sys.argv = ['bridgebake.py', take, clip or 'idle-yawn']
g = {'__name__': 'bake_lib'}; exec(compile(src, 'bridgebake.py', 'exec'), g)
plain = g['on_anchor'](g['STD'].crop((674, 478, 674 + 127, 478 + 209)), 57.0, 205.0)
wan = [g['key'](f) for f in sorted(glob.glob(take + '/*.webp'))]
ims = [plain] + wan[1:-1] + ([g['clip_frames'](clip)[0]] if clip else [plain])
P = np.asarray(plain)[..., 3] > 128
AX, AY = g['AX'], g['AY']
rows = []
for i, im in enumerate(ims):
    m = np.asarray(im)[..., 3] > 128; ys = np.nonzero(m.any(1))[0]; b = ys.max(); fx = np.nonzero(m[b - 11:b + 1].any(0))[0]
    rows.append((i, int(fx.min()), int(fx.max()), int(b), round(float((m ^ P).sum()) / P.sum(), 3)))
print('frame, feet L, feet R, bottom, xor vs plain:'); print(rows)
tw, th, cols = 170, 230, 8
n = len(ims); R = (n + cols - 1) // cols
sh = Image.new('RGB', (cols * tw, R * (2 * th + 16)), (0, 0, 0)); d = ImageDraw.Draw(sh)
for i, im in enumerate(ims):
    cr = im.crop((AX - 80, AY - 220, AX + 90, AY + 10)); x, y = (i % cols) * tw, (i // cols) * (2 * th + 16)
    for r, bgc in enumerate([(226, 230, 214, 255), (26, 30, 42, 255)]):
        bb = Image.new('RGBA', cr.size, bgc); bb.alpha_composite(cr); sh.paste(bb.convert('RGB'), (x, y + 16 + r * th))
    d.line([(x, y + 16 + 220), (x + tw, y + 16 + 220)], fill=(255, 60, 60))
    d.line([(x + 80 - 10, y + 16), (x + 80 - 10, y + 16 + 2 * th)], fill=(60, 160, 255))
    d.text((x + 3, y + 2), 'PLAIN' if i == 0 else ('END ' + (clip or 'PLAIN') if i == n - 1 else str(i)), fill=(255, 230, 90))
sh.save(out, quality=84); print('sheet', out, sh.size)
