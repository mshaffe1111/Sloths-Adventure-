"""A numbered strip of raw clip frames, to choose a loop by eye.
    python3 -I tools/art/w6/swim/strip.py <clip> <f,f,...> <out.png> [crop x0,y0,x1,y1] [cols]"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAW = Path(__file__).resolve().parent / 'raw'
clip, frames, out = sys.argv[1], [int(x) for x in sys.argv[2].split(',')], sys.argv[3]
crop = tuple(int(v) for v in sys.argv[4].split(',')) if len(sys.argv) > 4 and sys.argv[4] != '-' else None
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 4
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
