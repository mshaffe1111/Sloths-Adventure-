"""ART-18: cut palms side by side on 1-8's mist (left half light mist, right half the backdrop's dark teal), to judge keys and grade.
    python preview.py <out.jpg> <tile h> <cut.webp>...
"""
import sys
from PIL import Image, ImageDraw
out, th, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGBA') for f in files]
ims = [im.resize((round(im.width * th / im.height), th), Image.LANCZOS) for im in ims]
W = sum(i.width + 10 for i in ims) + 10
S = Image.new('RGBA', (W, th + 30), (172, 190, 180, 255))
d = ImageDraw.Draw(S)
d.rectangle([0, (th + 30) // 2, W, th + 30], fill=(92, 113, 106, 255))
x = 10
for f, im in zip(files, ims):
    S.alpha_composite(im, (x, 20)); d.text((x, 4), f.split('/')[-1], fill=(0, 0, 0, 255)); x += im.width + 10
S.convert('RGB').save(out, quality=82)
