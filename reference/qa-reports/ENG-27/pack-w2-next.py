# ENG-27c: pack 2-7's seven cut frames (ART-NEXT-b, origin/t-art-next:reference/art/hfnext/cut/) into one sheet, as ENG-ROCK packed
# w2-rocks (21af89b4e): one row, 4 px apart, native size (the catalog's ship_px), lossy WebP with full alpha.
# usage: python3 reference/qa-reports/ENG-27/pack-w2-next.py <dir holding the cut PNGs>
import json, sys
from PIL import Image
src = sys.argv[1]
order = [('mailBoat', 'boat'), ('mailBoatB', 'boatB'), ('doorOpen', 'door-open'), ('letter', 'letter'), ('letterB', 'letterB'), ('reply', 'reply'), ('replyB', 'replyB')]
ims = [(k, Image.open(f'{src}/{f}.png').convert('RGBA')) for k, f in order]
GAP = 4
W = sum(im.width for _, im in ims) + GAP * (len(ims) - 1)
H = max(im.height for _, im in ims)
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
frames, x = {}, 0
for k, im in ims:
    sheet.paste(im, (x, 0))
    frames[k] = {'x': x, 'y': 0, 'w': im.width, 'h': im.height}
    x += im.width + GAP
sheet.save('src/assets/w2-next/w2-next.webp', 'WEBP', quality=90, alpha_quality=100, method=6)
json.dump(frames, open('src/assets/w2-next/w2-next.json', 'w'), indent=1)
print(W, H, frames)
