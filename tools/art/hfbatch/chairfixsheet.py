"""Before/after close-ups of the chairs touch-ups (2026-10-29): the eleventh chair and the rock clump, v2 cut against the fixed cut,
each on dark and mid-grey, 2x.
    python3 -I tools/art/hfbatch/chairfixsheet.py <v2 cut.webp> <fixed cut.webp> <out.jpg>
"""
import sys
from PIL import Image, ImageDraw

A, B = Image.open(sys.argv[1]).convert('RGBA'), Image.open(sys.argv[2]).convert('RGBA')
assert A.size == B.size
k = A.width / 1536  # the cut is the take trimmed and scaled to 1600 wide; boxes are in cut pixels
boxes = {'eleventh chair': (1360, 120, 1600, A.height), 'rock clump (right of centre)': (900, 230, 1140, A.height)}
tiles = []
for name, bx in boxes.items():
    for label, im in (('before (v2)', A), ('after', B)):
        for bg in ((20, 16, 24), (128, 128, 128)):
            c = im.crop(bx)
            t = Image.new('RGBA', c.size, bg + (255,))
            t.alpha_composite(c)
            tiles.append((f'{name}: {label}', t.resize((c.width * 2, c.height * 2), Image.LANCZOS)))
tw, th = tiles[0][1].size
cols = 4
rows = (len(tiles) + cols - 1) // cols
S = Image.new('RGB', (cols * (tw + 8), rows * (th + 24)), (24, 24, 24))
d = ImageDraw.Draw(S)
for i, (n, t) in enumerate(tiles):
    x, y = (i % cols) * (tw + 8), (i // cols) * (th + 24)
    S.paste(t.convert('RGB').resize((tw, th)), (x, y + 20))
    d.text((x + 4, y + 4), n, fill=(255, 230, 0))
S.save(sys.argv[3], 'JPEG', quality=88)
print(sys.argv[3], S.size)
