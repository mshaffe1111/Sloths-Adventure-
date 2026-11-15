"""ART-W2: make the shallow backwater take tile end to end without ghosting a stone.

    python3 -I tools/art/hfw2/wrap.py <take> <out.webp> <check.jpg> [fade]

A plain cross-fade (hflist1/wrapfix.py) over the riverbed would double-expose the stones, so the tile is cut where BOTH ends are open
water and sand: columns with no stone (stones are the low-saturation grey/moss pixels under the surface band) are found, the widest cut
[a, b) whose first and last FADE px are stone-free is kept, and only those stone-free zones are cross-faded (RGB; the strip is opaque).
Prints the wrap column's mean colour difference (target under 6) and writes two copies side by side as the check still.
"""
import sys
import numpy as np
from PIL import Image

src, out, chk = sys.argv[1:4]
F = int(sys.argv[4]) if len(sys.argv) > 4 else 48
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
hsv = np.asarray(Image.open(src).convert('HSV')).astype(np.float32)
low = hsv[int(H * 0.45):]
# a stone: grey (sat < 60) or moss (hue 40-70 with dark value) below the surface band; the sand is yellow-olive, high-ish value
stone = ((low[..., 1] < 40) & (low[..., 2] < 175)) | (low[..., 2] < 80)
free = stone.sum(0) < 3
# free runs of at least F
ok = np.array([free[x:x + F].all() for x in range(W - F + 1)])
starts = [x for x in range(W // 3) if ok[x]]
ends = [x + F for x in range(W - F + 1) if ok[x] and x + F > 2 * W // 3]
best = max(((s, e) for s in starts for e in ends), key=lambda p: p[1] - p[0])
s, e = best
t = a[:, s:e].copy()
w = t.shape[1]
k = np.linspace(0, 1, F)[None, :, None]
# the tile is t[:w-F] with its first F px cross-faded from the cut-off tail t[w-F:] (k 0 -> 1) into its own start: the tile's first
# column is then the natural next column after its last (both zones are stone-free, so nothing is double-exposed)
tile = t[:, :w - F].copy()
tile[:, :F] = t[:, w - F:] * (1 - k) + t[:, :F] * k
# the bed deepens toward the bottom: the last 22% of rows grade into BED (the fill the engine draws under the strip, as RIVER_DEEP under
# the deep one), so the strip ends on its own fill colour with no edge
BED = np.array([112, 108, 78], np.float32)
g = np.clip((np.arange(H) - H * 0.78) / (H * 0.22), 0, 1)[:, None, None] ** 1.3
tile = tile * (1 - g) + BED * g
# the join: last column vs the first
d = np.abs(tile[:, -1] - tile[:, 0]).mean()
# the top edge: the deep tile (w2-props#water) is clear above its wave crests (alpha 0 at row 0, solid by ~6% down), so this one is
# too, read from its own crest line: per column the first bright crest row in the top quarter (median-smoothed along x), clear above
# it with a 10 px soft ramp, and the paint above the crest replaced by the crest's own colour (no dark rim through the ramp)
lum = tile.mean(2)
top = lum[:H // 4] > 175
yc = np.where(top.any(0), top.argmax(0), H // 8).astype(np.float32)
pad = np.concatenate([yc[-15:], yc, yc[:15]])
yc = np.array([np.median(pad[i:i + 31]) for i in range(tile.shape[1])])
ys = np.arange(H)[:, None]
alpha = np.clip((ys - (yc[None, :] - 11)) / 10, 0, 1)
cols = np.arange(tile.shape[1])
crest = tile[yc.astype(int), cols]
tile = np.where((ys < yc[None, :])[..., None], crest[None, :, :], tile)
rgba = np.dstack([tile, alpha * 255]).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(out, 'WEBP', quality=94)
print('crest row', int(yc.min()), '-', int(yc.max()), 'of', H)
bgc = np.zeros_like(tile); bgc[:] = (90, 120, 80)
comp = tile * alpha[..., None] + bgc * (1 - alpha[..., None])
two = np.concatenate([comp, comp], 1).astype(np.uint8)
Image.fromarray(two).save(chk, quality=85)
print(f'cut [{s},{e}) fade {F}: tile {tile.shape[1]}x{H}, wrap diff {d:.2f}')
