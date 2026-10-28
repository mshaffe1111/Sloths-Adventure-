"""A numbered strip of raw clip frames (as w6/swim/strip.py, on raw/ beside this file), to choose frames by eye.
    python3 -I tools/art/anim/strip.py <clip> <f,f,... | a-b[:step]> <out.png> [crop x0,y0,x1,y1 | -] [cols]"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAW = Path(__file__).resolve().parent / 'raw'
clip, spec, out = sys.argv[1], sys.argv[2], sys.argv[3]
if '-' in spec and ',' not in spec:
    rng, _, step = spec.partition(':')
    a, b = map(int, rng.split('-'))
    frames = list(range(a, b + 1, int(step or 1)))
else:
    frames = [int(x) for x in spec.split(',')]
crop = tuple(int(v) for v in sys.argv[4].split(',')) if len(sys.argv) > 4 and sys.argv[4] != '-' else None
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 6
ims = []
for f in frames:
    im = Image.open(RAW / clip / f'{clip}_{f:03d}.webp').convert('RGB')
    ims.append(im.crop(crop) if crop else im)
w, h = ims[0].size
S = Image.new('RGB', (w * cols, (h + 14) * ((len(ims) + cols - 1) // cols)), (30, 30, 30))
d = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(frames, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 14)
    S.paste(im, (x, y + 14))
    d.text((x + 3, y + 1), str(f), fill=(255, 255, 0))
S.save(out)
