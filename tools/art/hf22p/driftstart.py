"""ART-22P (b): the img2img start for World 2's drifting petals: lavender and white pieces only, pasted up on flat grey 128 in a 4x3
grid of 384 px cells (one piece a cell, never touching, so the cutter finds each by itself). From the game's own painted art: 2-2's
hyacinth pickup and the white lily take (reference/art/hf22p/takes/), and the lavender/white petals of flora/petals.webp.

    python3 -I tools/art/hf22p/driftstart.py <repo root>    -> reference/art/hf22p/starts/drift-w2.png
"""
import json, re, sys
from pathlib import Path
from PIL import Image

root = Path(sys.argv[1])
cut = lambda p: Image.open(root / p).convert('RGBA')
hy = cut('src/assets/pickups/petal-hyacinth.webp')
sheet = cut('src/assets/flora/petals.webp')
frames = json.loads(re.search(r'PETALS: PetalFrame\[\] = (\[.*?\]);', (root / 'src/game/petalData.ts').read_text()).group(1))
fr = lambda i: sheet.crop((frames[i]['x'], frames[i]['y'], frames[i]['x'] + frames[i]['w'], frames[i]['y'] + frames[i]['h']))
# the white lily take, keyed by the same cutter as the pickup (cut.py writes a 96 px piece)
wl = cut('reference/art/hf22p/starts/white-lily-cut.webp')
pieces = [(hy, 0), (hy, 75), (hy, 200), (wl, 30), (wl, 250), (fr(1), 0), (fr(4), 20), (fr(7), 300), (fr(13), 40), (fr(15), 0),
          (fr(2), 10), (fr(3), 0)]
C = 384
out = Image.new('RGB', (C * 4, C * 3), (128, 128, 128))
for k, (im, rot) in enumerate(pieces):
    s = 250 / max(im.size)
    p = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS).rotate(rot, expand=True, resample=Image.BICUBIC)
    a = p.split()[3].point(lambda v: 255 if v > 128 else 0)  # no half-clear px (hf-art.md: starts are solid)
    cx, cy = (k % 4) * C + C // 2, (k // 4) * C + C // 2
    out.paste(p.convert('RGB'), (cx - p.width // 2, cy - p.height // 2), a)
out.save(root / 'reference/art/hf22p/starts/drift-w2.png')
print('drift-w2.png', out.size, len(pieces), 'pieces')
