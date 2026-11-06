"""Join two finished middle strips A|B into one tile (art-1-1-sunrise, 2026-11-05; the lead's send-back: one tree cluster then ~40% open
ground per 2113 px tile stamped the same three trunks every two screens sideways). Each strip is a cluster between ground-only clearings
(cut.py mid's join check), so the tile is A's cluster, a clearing, B's cluster, a clearing, and wraps: each clearing is trimmed to
CLEAR px and the two strips meet in ground-only columns, crossfaded over the ground band (nothing else is in those columns).
    python3 -I tools/art/sunrise11/join.py <A.webp> <B.webp> <out.webp> [clear px, 420]
Checks, printed: width under 4096 (artcheck), each seam column band holds no paint above the ground band (the cut-trunk defect).
"""
import sys

import numpy as np
from PIL import Image

a_p, b_p, out = sys.argv[1:4]
CLEAR = int(sys.argv[4]) if len(sys.argv) > 4 else 420
FADE = 120


def load(p):
    return np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)


def cluster(im):
    al = im[..., 3] > 60
    h = al.shape[0]
    up = al[: int(h * 0.88)]  # (above the ground band)
    cols = np.where(up.any(0))[0]
    return int(cols.min()), int(cols.max())


A, B = load(a_p), load(b_p)
assert A.shape[0] == B.shape[0], 'same height'
parts = []
for im in (A, B):
    c0, c1 = cluster(im)
    # half the clearing on each side of the cluster, taken from the strip's own ground
    half = CLEAR // 2 + FADE // 2
    x0, x1 = max(0, c0 - half), min(im.shape[1], c1 + 1 + half)
    part = im[:, x0:x1]
    # a side whose own clearing is shorter than half (the repaint grew the crowns toward the end) is padded with this strip's own
    # bare ground from its other clearing, so every crossfade falls on ground only (a crown tip in the fade ghosts)
    left, right = c0 - x0, x1 - 1 - c1
    ground = im[:, max(0, c0 - half):max(0, c0 - half) + half]  # (the left clearing: ground band only)
    if right < half:
        part = np.concatenate([part, ground[:, :half - right]], axis=1)
    if left < half:
        g2 = im[:, c1 + 1:c1 + 1 + half]
        part = np.concatenate([g2[:, -(half - left):], part], axis=1)
    parts.append(part)
    print('cluster', c0, c1, 'kept', x0, x1, 'clearing left', left, 'right', right, '-> part', part.shape[1])


def fuse(L, R):
    """L then R, overlapping FADE columns of ground, crossfaded"""
    t = np.linspace(0, 1, FADE)[None, :, None]
    mid = L[:, -FADE:] * (1 - t) + R[:, :FADE] * t
    return np.concatenate([L[:, :-FADE], mid, R[:, FADE:]], axis=1)


tile = fuse(parts[0], parts[1])
# the wrap: the tile's last FADE columns crossfaded into its first, so B's right clearing runs into A's left
t = np.linspace(0, 1, FADE)[None, :, None]
head = tile[:, -FADE:] * (1 - t) + tile[:, :FADE] * t
tile = np.concatenate([head, tile[:, FADE:-FADE]], axis=1)
W = tile.shape[1]
print('tile width', W, 'OK' if W <= 4096 else 'OVER 4096')
# the seam check: the columns where pieces meet (the wrap at 0, and A|B) hold nothing above the ground band
al = tile[..., 3] > 60
h = al.shape[0]
up = al[: int(h * 0.88)]
seams = [0, parts[0].shape[1] - FADE]
for s in seams:
    band = up[:, max(0, s - 8):s + FADE + 8]
    print('seam at', s, 'paint above the ground band:', round(float(band.mean()), 4))
im = Image.fromarray(tile.clip(0, 255).astype(np.uint8), 'RGBA')
import os
for q in (88, 84, 80, 76, 72, 68):  # (each strip under 250 KB: hf-backdrops.md step 1)
    im.save(out, 'WEBP', quality=q, method=6)
    if os.path.getsize(out) < 250_000:
        break
print('quality', q, os.path.getsize(out) // 1024, 'KB')
print(out)
