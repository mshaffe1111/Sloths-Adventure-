# Edge de-magenta pass (attempt 2, the critic's 11-10 finds): within 8 px of a piece's edge, pixels in the ground's hue
# (r>g+45, b>g+25) are JPEG fringe or keyed-in ground: fade them out by how magenta they are, and pull the spill out of
# the rest of the band. Pieces whose edges are painted pink/red-purple (Victoria rims, lotus flowers) are listed in SKIP.
import sys, glob, os
ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
SKIP = {'M-02-a', 'M-03-a'}
# pieces with painted pink (lotus flowers and buds): edge pass only, no whole-piece pass
PINK = {'M-02-b', 'M-03-b', 'M-02-e', 'M-03-d'}
for f in sorted(glob.glob(f'{ROOT}/artcut/pieces/' + (sys.argv[2] if len(sys.argv) > 2 else 'M-*') + '.png')):
    pid = os.path.basename(f)[:-4]
    if pid in SKIP: continue
    a = np.asarray(Image.open(f)).astype(np.float32).copy()
    for _ in range(4):
        r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
        op = al > 20
        band = op & ~ndi.binary_erosion(op, iterations=8)
        s = np.minimum(r - g, b - g)
        mag = band & (r - g > 45) & (b - g > 25)
        n = int(mag.sum())
        if not n: break
        k = np.clip(1 - (s - 12) / 14, 0, 1)
        a[..., 3] = np.where(mag, al * k, al)
        sp = band & (s > 0)
        a[..., 0] = np.where(sp, r - s * 0.85, r); a[..., 2] = np.where(sp, b - s * 0.85, b)
    if pid not in PINK:
        # whole piece: ground-hued pockets between leaves (blue share at least half the red share: magenta, not red or pink)
        r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
        rg = r - g; bg_ = b - g
        mg = (al > 0) & (rg > 35) & (bg_ > 0.5 * rg)
        kk = np.clip(1 - (np.minimum(rg, 2 * bg_) - 30) / 20, 0, 1)
        a[..., 3] = np.where(mg, al * kk, al)
        # last: spill out of the 8 px edge band (same test as pinkscan), so dark mauve rims turn to the art's own dark brown
        r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
        op = al > 60; band = op & ~ndi.binary_erosion(op, iterations=8)
        s2 = np.clip(np.minimum(r - g, b - g), 0, None)
        hit = band & (r - g > 40) & (b - g > 20)
        a[..., 0] = np.where(hit, r - s2, r); a[..., 2] = np.where(hit, b - s2, b)
    out = Image.fromarray(np.clip(a + .5, 0, 255).astype(np.uint8), 'RGBA')
    bb = out.getbbox(); out = out.crop(bb) if bb else out
    out.save(f, compress_level=6)
