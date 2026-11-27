# ENG-29-e (G3): repack World 2's next sheet from its cut PNGs (reference/art/hfnext/cut/), as ENG-27c packed it
# (reference/qa-reports/ENG-27/pack-w2-next.py) plus 2-6's weir and 2-9's King's Barge (ART-W3-b, w2-next#barge: take s41, 1275x357 cut px).
# Row 0 keeps ENG-27c's seven frames and the weir, 4 px apart, native size; the barge goes on row 1 (one row would be 4583 px, over the
# 4096 px artcheck cap). Lossy WebP with full alpha, from the PNG cuts (never a re-encode of the shipped WebP).
# usage: python3 reference/qa-reports/ENG-29/pack-w2-next.py reference/art/hfnext/cut
import json, sys
from PIL import Image
src = sys.argv[1]
rows = [[('mailBoat', 'boat'), ('mailBoatB', 'boatB'), ('doorOpen', 'door-open'), ('letter', 'letter'), ('letterB', 'letterB'),
         ('reply', 'reply'), ('replyB', 'replyB'), ('weir', 'weir')], [('barge', 'barge')]]
GAP = 4
ims = [[(k, Image.open(f'{src}/{f}.png').convert('RGBA')) for k, f in r] for r in rows]
W = max(sum(im.width for _, im in r) + GAP * (len(r) - 1) for r in ims)
H = sum(max(im.height for _, im in r) for r in ims) + GAP * (len(ims) - 1)
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
frames, y = {}, 0
for r in ims:
    x = 0
    for k, im in r:
        sheet.paste(im, (x, y))
        frames[k] = {'x': x, 'y': y, 'w': im.width, 'h': im.height}
        x += im.width + GAP
    y += max(im.height for _, im in r) + GAP
sheet.save('src/assets/w2-next/w2-next.webp', 'WEBP', quality=90, alpha_quality=100, method=6)
json.dump(frames, open('src/assets/w2-next/w2-next.json', 'w'), indent=1)
print(W, H, frames)
