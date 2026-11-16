"""ART-W2: key one magenta take into a game piece.

    python3 -I tools/art/hfw2/cut.py <take> <out.webp> [--width W] [--keep N] [--box x0,y0,x1,y1]

The background is the magenta CONNECTED TO THE PICTURE'S EDGE (a flood from the border over strongly magenta pixels), so the lily's pink
blush, the crimson Victoria rim and a pink-tipped petal inside the piece are never keyed (a hue key ate them in the test). Soft edge from
how magenta the rim pixels are; the spill (min(R, B) over G) is pulled back to G in a 3 px band; specks not joined to the N biggest parts
are dropped (hf-art.md 2026-10-31: nothing floating). --box crops the take first (a sheet with several pieces). Writes lossless WebP,
cropped to the piece, W px wide (default: as cut). --clip y0,x0,x1 drops a take's ground strip outside the foot; --decal A
(0..1) makes a water decal's flat fill see-through down to alpha A. --match ref[@x,y,w,h] [--k K] grades the colours to an
existing piece.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image

a = sys.argv[1:]
src, out = a[0], a[1]
opt = {a[i]: a[i + 1] for i in range(2, len(a) - 1, 2)}
im = Image.open(src).convert('RGB')
if '--box' in opt:
    im = im.crop(tuple(int(v) for v in opt['--box'].split(',')))
px = np.asarray(im).astype(np.float32)
H, W, _ = px.shape
mg = np.minimum(px[..., 0], px[..., 2]) - px[..., 1]
# the takes' background is soft pink with gradients and sun rays, not flat magenta: 'background-like' is any bright pink-magenta pixel
# (PIL hue 205-250, saturation over 50, value over 130) or a strongly magenta one; the flood from the edge stops at the pieces' dark
# outlines, so the pink inside a petal or the Victoria's crimson rim is never reached
hsv = np.asarray(im.convert('HSV')).astype(np.float32)
pink = (hsv[..., 0] >= 200) & (hsv[..., 0] <= 252) & (hsv[..., 1] > 22) & (hsv[..., 2] > 140) & (mg > 4)  # (the lilac glint and pink halo too)
strong = ((mg > 70) & (px[..., 0] > 120) & (px[..., 2] > 120)) | pink
# flood from the border over 'strong' magenta
bg = np.zeros((H, W), bool)
q = deque()
for y in range(H):
    for x in (0, W - 1):
        if strong[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
for x in range(W):
    for y in (0, H - 1):
        if strong[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
        if 0 <= yy < H and 0 <= xx < W and strong[yy, xx] and not bg[yy, xx]:
            bg[yy, xx] = True; q.append((yy, xx))
# soft rim: pixels next to the background get alpha by how magenta they are
near = bg.copy()
for d in (1, 2):
    near[d:] |= bg[:-d]; near[:-d] |= bg[d:]; near[:, d:] |= bg[:, :-d]; near[:, :-d] |= bg[:, d:]
rim = near & ~bg
alpha = np.where(bg, 0.0, 1.0)
alpha[rim] = np.clip(1 - (mg[rim] - 10) / 40, 0, 1)
# spill back to G in a 3 px band inside the edge
band = near.copy()
band[1:] |= near[:-1]; band[:-1] |= near[1:]; band[:, 1:] |= near[:, :-1]; band[:, :-1] |= near[:, 1:]
sp = np.clip(mg, 0, None) * band
px[..., 0] -= sp; px[..., 2] -= sp
# --clip y0,x0,x1: below row y0 keep only columns x0..x1 (a take's ground strip runs the full width; the piece's own foot is narrow)
if '--clip' in opt:
    y0, x0, x1 = (int(v) for v in opt['--clip'].split(','))
    alpha[y0:, :x0] = 0; alpha[y0:, x1:] = 0
# --decal: a water-surface decal (the ripple over a sunk pad): its flat fill goes see-through, its rings, glints and the dark pad shape
# stay, by how far each pixel's lightness is from the fill's median (so it sits on deep or shallow water alike)
if '--decal' in opt:
    L = px.mean(2); inside = alpha > 0.9
    med = np.median(L[inside])
    alpha = np.minimum(alpha, np.clip(np.abs(L - med) / 38, float(opt['--decal']), 1))
# keep the N biggest parts (quarter-size labels)
N = int(opt.get('--keep', 1))
S = 4
m = alpha[::S, ::S] > 0.5
h4, w4 = m.shape
lab = np.zeros(m.shape, np.int32); sizes = [0]
for y0 in range(h4):
    for x0 in range(w4):
        if m[y0, x0] and not lab[y0, x0]:
            k = len(sizes); n = 0; q = deque([(y0, x0)]); lab[y0, x0] = k
            while q:
                y, x = q.popleft(); n += 1
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1), (y - 1, x - 1), (y + 1, x + 1), (y - 1, x + 1), (y + 1, x - 1)):
                    if 0 <= yy < h4 and 0 <= xx < w4 and m[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = k; q.append((yy, xx))
            sizes.append(n)
keep = set(np.argsort(sizes)[::-1][:N].tolist()) - {0}
km = np.isin(lab, list(keep))
km = np.repeat(np.repeat(km, S, 0), S, 1)[:H, :W]
# grow the kept mask 2 quarter-px so the soft rim survives
g = km.copy()
for d in range(1, 9):
    g[d:] |= km[:-d]; g[:-d] |= km[d:]; g[:, d:] |= km[:, :-d]; g[:, :-d] |= km[:, d:]
alpha *= g
# --match ref[@x,y,w,h]: grade the piece's colours to an existing World 2 piece (per-channel mean and spread over the opaque pixels), so
# a state swaps in without a colour jump (the big sunk pad against M-03-a, the small pads against w2-props#lily); K of the way (--k)
if '--match' in opt:
    ref, _, box = opt['--match'].partition('@')
    R = Image.open(ref).convert('RGBA')
    if box:
        bx, by, bw, bh = (int(v) for v in box.split(',')); R = R.crop((bx, by, bx + bw, by + bh))
    r = np.asarray(R).astype(np.float32); rm = r[..., 3] > 200
    sm = alpha > 0.8
    K = float(opt.get('--k', 0.85))
    for c in range(3):
        mu, sd = px[..., c][sm].mean(), px[..., c][sm].std() + 1e-3
        rmu, rsd = r[..., c][rm].mean(), r[..., c][rm].std()
        px[..., c] = px[..., c] * (1 - K) + ((px[..., c] - mu) * (rsd / sd) + rmu) * K
rgba = np.dstack([np.clip(px, 0, 255), alpha * 255]).astype(np.uint8)
ys, xs = np.nonzero(alpha > 0.02)
piece = Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
if '--width' in opt:
    w = int(opt['--width']); piece = piece.resize((w, round(piece.height * w / piece.width)), Image.LANCZOS)
piece.save(out, 'WEBP', lossless=True)
print(out, piece.size)
