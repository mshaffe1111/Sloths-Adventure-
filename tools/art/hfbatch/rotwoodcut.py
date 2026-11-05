"""Cut World 1's rotten wood (2026-11-05; jobs.txt hfb-w1rot-r1, the pair whole-s65-5 / creak-s65-5, one seed so they match) into its
own sheet, src/assets/props/w1-rotwood.webp, with the four states W1's crumble draw uses (protoArt.ts drawBranchArt: whole, creak,
snapped as two falling halves): rotWood, rotWoodCreak, rotSnapL, rotSnapR. The snapped halves are the creak take split down its pale
split (each half keeps its side of the splintered wood), so the break is the crack the player was shown. The frames go to
tools/art/hfbatch/w1-rotwood-frames.json, not into src/game (no frame is packed into game data before it is drawn: artUse.test.ts);
engine-render folds them into the W1 kit when it wires them.
Key: magenta out with its spill (bootcut.py's despill), only the largest piece kept (the stray splinter marks the model drew above).
    python3 -I tools/art/hfbatch/rotwoodcut.py <whole take> <creak take>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
W_OUT = 600   # px wide (the kit branch frame is 598: drawn the same way, a platform wide)


def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    alpha = np.clip(255 - (((r - g) + (b - g)) - 140) * 3, 0, 255).astype(np.uint8)
    ex = np.clip(np.minimum(r, b) - g, 0, None)
    a2 = a.copy(); a2[..., 0] = r - np.clip(ex - 10, 0, None); a2[..., 2] = b - ex
    lab, n = ndimage.label(ndimage.binary_erosion(alpha > 40, iterations=2))
    if n > 1:
        big = 1 + int(np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))))
        alpha = np.where(ndimage.binary_dilation(lab == big, iterations=4), alpha, 0).astype(np.uint8)
    A = Image.fromarray(alpha, 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    return np.dstack([np.clip(a2, 0, 255).astype(np.uint8), np.asarray(A)])


whole, creak = key(sys.argv[1]), key(sys.argv[2])
# one box for both (the same log): the union of their pieces, so whole and creak line up frame for frame
bb = lambda x: ndimage.find_objects((x[..., 3] > 8).astype(int))[0]
b1, b2 = bb(whole), bb(creak)
y0, y1 = min(b1[0].start, b2[0].start), max(b1[0].stop, b2[0].stop)
x0, x1 = min(b1[1].start, b2[1].start), max(b1[1].stop, b2[1].stop)
whole, creak = whole[y0:y1, x0:x1], creak[y0:y1, x0:x1]
# the split: the pale splintered wood in the middle third of the creak take (light, warm, low green-blue gap)
c = creak[..., :3].astype(np.int16)
pale = (c.sum(-1) > 560) & (c[..., 0] > c[..., 2] + 20) & (creak[..., 3] > 200)
mid = np.zeros_like(pale); w = pale.shape[1]; mid[:, w // 3: 2 * w // 3] = True
pale &= mid
cols = np.nonzero(pale.any(0))[0]
split_x = int(np.median(np.nonzero(pale)[1])) if pale.any() else w // 2
# each row is split at the middle of its own pale run, so the break follows the jagged crack
cut = np.full(pale.shape[0], split_x)
for yy in range(pale.shape[0]):
    xs = np.nonzero(pale[yy])[0]
    if len(xs):
        cut[yy] = int(xs.mean())
cut = ndimage.median_filter(cut, size=9)
xx = np.arange(w)[None, :]
left = creak.copy(); left[..., 3] = np.where(xx < cut[:, None], creak[..., 3], 0)
right = creak.copy(); right[..., 3] = np.where(xx >= cut[:, None], creak[..., 3], 0)
# (each half keeps only its own piece: a splinter the row split left on the wrong side would fall as a loose shard)
for half in (left, right):
    lab, n = ndimage.label(half[..., 3] > 40)
    if n > 1:
        big = 1 + int(np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))))
        half[..., 3] = np.where(ndimage.binary_dilation(lab == big, iterations=2), half[..., 3], 0)

frames = {}
pieces = []
for name, arr in (('rotWood', whole), ('rotWoodCreak', creak), ('rotSnapL', left), ('rotSnapR', right)):
    im = Image.fromarray(arr, 'RGBA')
    if name.startswith('rotSnap'):
        im = im.crop(im.getbbox())
    pieces.append((name, im))
k = W_OUT / whole.shape[1]
sheet_w = W_OUT * 2 + 8
rows = []
scaled = [(n, im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)) for n, im in pieces]
h0 = max(scaled[0][1].height, scaled[1][1].height)
h1 = max(scaled[2][1].height, scaled[3][1].height)
S = Image.new('RGBA', (sheet_w, h0 + h1 + 8), (0, 0, 0, 0))
pos = {'rotWood': (0, 0), 'rotWoodCreak': (W_OUT + 8, 0), 'rotSnapL': (0, h0 + 8), 'rotSnapR': (scaled[2][1].width + 8, h0 + 8)}
for n, im in scaled:
    S.alpha_composite(im, pos[n])
    frames[n] = {'x': pos[n][0], 'y': pos[n][1], 'w': im.width, 'h': im.height}
dst = Path(__file__).resolve().parent / 'wip/w1rot/w1-rotwood.webp'   # (WIP until judged on a stage and wired; then src/assets/props/)
S.save(dst, 'WEBP', quality=90, method=6)
(Path(__file__).resolve().parent / 'wip/w1rot/w1-rotwood-frames.json').write_text(json.dumps({
    'note': 'W1 rotten wood (rotwoodcut.py, 2026-11-05): frames in src/assets/props/w1-rotwood.webp for protoArt.ts drawBranchArt '
            '(whole / creak / snapped halves), as PROTO_FRAMES.branch, branchCreak, snapL, snapR are; not wired yet (engine-render)',
    'frames': frames}, indent=1))
print(dst, S.size, frames)
