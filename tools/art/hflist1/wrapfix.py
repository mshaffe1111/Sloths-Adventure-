"""Picture list 1, item 2: make a keyed ground strip tile end to end. The circular native pass (striphdgpu.py) repaints the paint but
keeps the input's seam, so cross-fade the last FADE px into the first FADE px (colour and alpha), then report the mean colour
difference across the wrap column (0-255, opaque rows) and two copies side by side for a 2x look.
usage: python3 wrapfix.py <in.png> <out.png> <still.jpg> [fade]"""
import sys
import numpy as np
from PIL import Image
src, dst, still = sys.argv[1:4]; FADE = int(sys.argv[4]) if len(sys.argv) > 4 else 160
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32); W = a.shape[1]
t = np.linspace(1, 0, FADE)[None, :, None]
# premultiplied blend so a transparent column never drags dark colour in
pa = np.concatenate([a[..., :3] * a[..., 3:] / 255, a[..., 3:]], 2)
head = pa[:, W - FADE:] * t + pa[:, :FADE] * (1 - t)
out = np.concatenate([head, pa[:, FADE:W - FADE]], 1)
al = out[..., 3:]; rgb = np.where(al > 0, out[..., :3] * 255 / np.maximum(al, 1e-3), 0)
o = np.concatenate([rgb, al], 2)
Image.fromarray(np.clip(o + .5, 0, 255).astype(np.uint8), 'RGBA').save(dst, compress_level=6)
op = o[..., 3] > 128; w = o.shape[1]; r = op[:, 0] & op[:, w - 1]
wrap = float(np.abs(o[r, 0, :3] - o[r, w - 1, :3]).mean())
inner = float(np.median([np.abs(o[op[:, x] & op[:, x + 1], x, :3] - o[op[:, x] & op[:, x + 1], x + 1, :3]).mean() for x in range(100, w - 100, 97)]))
print(dst.rsplit('/', 1)[-1], 'size', (w, o.shape[0]), 'wrap diff %.1f' % wrap, 'interior neighbour diff %.1f' % inner)
im = Image.fromarray(np.clip(o + .5, 0, 255).astype(np.uint8), 'RGBA'); h = im.height
pair = Image.new('RGBA', (w * 2, h)); pair.paste(im, (0, 0)); pair.paste(im, (w, 0))
crop = pair.crop((w - 200, 0, w + 200, h)); crop = crop.resize((800, h * 2), Image.NEAREST)
sheet = Image.new('RGB', (800 * 2 + 20, h * 2), (0, 0, 0))
for j, c in enumerate([(40, 40, 44, 255), (225, 232, 215, 255)]):
    bg = Image.new('RGBA', crop.size, c); bg.alpha_composite(crop); sheet.paste(bg.convert('RGB'), (j * 820, 0))
sheet.thumbnail((1640, 1200)); sheet.save(still, quality=88)
