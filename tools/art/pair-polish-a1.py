"""polish-a1: put a before and an after shot side by side (optionally a crop, scaled up) with labels.
python3 tools/art/pair-polish-a1.py before.png after.png out.png [x y w h scale]"""
import sys
from PIL import Image, ImageDraw
a, b, out = sys.argv[1:4]
A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
if len(sys.argv) > 4:
    x, y, w, h = map(int, sys.argv[4:8]); s = float(sys.argv[8]) if len(sys.argv) > 8 else 1
    A, B = (im.crop((x, y, x + w, y + h)).resize((int(w * s), int(h * s)), Image.NEAREST) for im in (A, B))
W = A.width + B.width + 12
im = Image.new('RGB', (W, max(A.height, B.height) + 40), (20, 20, 20))
im.paste(A, (0, 40)); im.paste(B, (A.width + 12, 40))
d = ImageDraw.Draw(im)
d.text((8, 10), 'BEFORE', fill=(255, 200, 120)); d.text((A.width + 20, 10), 'AFTER', fill=(150, 255, 150))
im.save(out)
