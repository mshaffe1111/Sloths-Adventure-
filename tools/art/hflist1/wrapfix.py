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
# RGB is blended; alpha is NOT (attempt 2, the critic: a blended alpha leaves see-through ghosts where the two ends' tops differ).
# In the fade zone the alpha follows the outline of the end it is joining (ramped, so the outline morphs with no step where the zone
# ends; the lead's min(end, start) left a notch there), then anything under 200 snaps to 0 (no see-through band), then a 1 px rim.
E, B = a[:, W - FADE:], a[:, :FADE]
ae, ab = E[..., 3:] / 255, B[..., 3:] / 255
wt_e = t * ae; wt_b = (1 - t) * ab; ws = np.maximum(wt_e + wt_b, 1e-6)
rgb_h = (E[..., :3] * wt_e + B[..., :3] * wt_b) / ws
al_h = E[..., 3:] * t + B[..., 3:] * (1 - t)
al_h = np.where(al_h < 200, 0, al_h)
# a 1 px anti-aliased rim like the rest of the strip's edge (a hard snap alone reads jagged at 2x)
from PIL import ImageFilter
al_h = np.asarray(Image.fromarray(al_h[..., 0].astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)[..., None]
head = np.concatenate([rgb_h, al_h], 2)
o = np.concatenate([head, a[:, FADE:W - FADE]], 1)
o[o[..., 3] == 0, :3] = 0
op = o[..., 3] > 128; w = o.shape[1]; r = op[:, 0] & op[:, w - 1]
wrap = float(np.abs(o[r, 0, :3] - o[r, w - 1, :3]).mean())
inner = float(np.median([np.abs(o[op[:, x] & op[:, x + 1], x, :3] - o[op[:, x] & op[:, x + 1], x + 1, :3]).mean() for x in range(100, w - 100, 97)]))
Image.fromarray(np.clip(o + .5, 0, 255).astype(np.uint8), 'RGBA').save(dst, compress_level=6)
print(dst.rsplit('/', 1)[-1], 'size', (w, o.shape[0]), 'wrap diff %.1f' % wrap, 'interior neighbour diff %.1f' % inner)
im = Image.fromarray(np.clip(o + .5, 0, 255).astype(np.uint8), 'RGBA'); h = im.height
pair = Image.new('RGBA', (w * 2, h)); pair.paste(im, (0, 0)); pair.paste(im, (w, 0))
crop = pair.crop((w - 200, 0, w + 200, h)); crop = crop.resize((800, h * 2), Image.NEAREST)
sheet = Image.new('RGB', (800 * 2 + 20, h * 2), (0, 0, 0))
for j, c in enumerate([(40, 40, 44, 255), (225, 232, 215, 255)]):
    bg = Image.new('RGBA', crop.size, c); bg.alpha_composite(crop); sheet.paste(bg.convert('RGB'), (j * 820, 0))
sheet.thumbnail((1640, 1200)); sheet.save(still, quality=88)  # LIGHT ground is the right half


def ghosts(o, x0, x1):  # mean count per column of semi-clear px (0 < alpha < 200) above and below the solid band
    al = o[:, x0:x1, 3]; up = dn = 0
    for c in range(al.shape[1]):
        col = al[:, c]; solid = np.nonzero(col >= 200)[0]
        if not len(solid): continue
        semi = (col > 0) & (col < 200); up += semi[:solid[0]].sum(); dn += semi[solid[-1] + 1:].sum()
    n = al.shape[1]; return up / n, dn / n


u0, d0 = ghosts(o, 0, FADE); um, dm = ghosts(o, W // 2 - 80, W // 2 + 80)
print('  semi-clear px per column above/below: first %d px %.1f/%.1f, mid-strip %.1f/%.1f' % (FADE, u0, d0, um, dm))
