"""ART-NEXT (copied from ART-W2B, unchanged but this line; W2B copied from ART-W2A's tools/art/hfw2a/cut.py, unchanged but this line): cut an edit take off its flat grey (flood from the border, so a grey otter is never keyed inside its outline), keep the
biggest piece, un-mix the rim from the grey, crop, and scale by K (edit px per sheet px: the starts put Matt's 260 px Happy pose at 737 px,
so K 2.835 keeps every frame at the Happy pose's scale; the heron 405/471 px).
    python3 -I tools/art/hfw2a/cut.py <take.png> <out.png> <K> [tol 26] [keep=x0,y0,x1,y1] [glow]
keep= (ART-NEXT-b): a trapped flat-grey region wholly inside that box (take px) is paint, not a gap, and is never keyed (11-20:
boatB's weathered grey hull planks came out as two holes, 208 and 245 px, at 739-827 x 457-487).
Prints the box and the share of holes inside the piece (a fail over ~0.10: hf-art.md 11-02).
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

src, out, K = sys.argv[1], sys.argv[2], float(sys.argv[3])
tol = float(sys.argv[4]) if len(sys.argv) > 4 and not sys.argv[4].startswith('keep=') and sys.argv[4] != 'glow' else 26
KEEP = [tuple(int(v) for v in x[5:].split(',')) for x in sys.argv[4:] if x.startswith('keep=')]
GLOW, GLOW_D = 'glow' in sys.argv[4:], 40   # glow (ART-NEXT-c): un-mix a painted glow halo from the grey (below)
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32)
bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
near = np.abs(a - bg).max(axis=2) <= tol
lab, n = nd.label(near)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgm = np.isin(lab, list(edge))
# (grey trapped inside the outline, e.g. between a duckling's legs: any enclosed region of the flat grey over HOLE px is keyed too. A
# region that size within tol of the grey is never paint: the darkest fur here, the otter's, sits over 40 off it)
# Only FLAT grey counts (within HOLE_TOL of it, the edit's untouched ground): grey paint such as the heron's weathered post is
# textured and sits further off, so it is never keyed (11-18: tol 26 here punched holes in the post's wood).
HOLE, HOLE_TOL = 150, 9
flat = np.abs(a - bg).max(axis=2) <= HOLE_TOL
labh, nh = nd.label(flat & ~bgm)
sizes0 = nd.sum(flat & ~bgm, labh, range(1, nh + 1))
def kept(i):
    ys, xs = np.nonzero(labh == i)
    return any(x0 <= xs.min() and xs.max() <= x1 and y0 <= ys.min() and ys.max() <= y1 for x0, y0, x1, y1 in KEEP)
trapped = [i + 1 for i, sz in enumerate(sizes0) if sz > HOLE and not kept(i + 1)]
bgm |= np.isin(labh, trapped)
fg = ~bgm
lab2, n2 = nd.label(fg)
sizes = nd.sum(fg, lab2, range(1, n2 + 1))
keep = lab2 == (1 + int(np.argmax(sizes)))
keep = keep & ~bgm
holes = (nd.binary_fill_holes(keep) & ~keep).sum() / max(1, nd.binary_fill_holes(keep).sum())
# soft rim: alpha from distance to the grey over the outermost 2 px, colour un-mixed from the grey there
dist = np.abs(a - bg).max(axis=2)
alpha = keep.astype(np.float32)
rim = keep & ~nd.binary_erosion(keep, iterations=2)
alpha[rim] = np.clip(dist[rim] / 60.0, 0, 1)
al = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255
al[~nd.binary_dilation(keep)] = 0
if GLOW:
    # ART-NEXT-c (11-21): a painted GLOW (lit rims, glowing caps, the mat's skirt) is the edit's cyan light over the flat grey; kept
    # opaque it cut as a grey-mint blob with a ragged outer edge. In the halo (kept px reached from the grey WITHOUT crossing a dark ink
    # line, through px LIGHTER than the grey only, within GLOW_D px), colour-to-alpha against the grey: alpha = the largest channel step
    # off the grey, ramped to 0 at the grey; ferns, moss, stone and the bright lit line itself (darker than the grey in some channel) keep
    # full alpha. A first pass that flooded through any non-ink px leaked into the grey stone faces (11-21: see-through triangles).
    ink = a.mean(axis=2) < 80
    core = nd.binary_fill_holes(nd.binary_closing(ink, iterations=4))   # inside the ink outline (gaps up to ~8 px closed): never halo
    haze = a.min(axis=2) >= bg.min() - 8                               # the glow's haze is LIGHTER than the grey; stone, moss, ink are not
    halo = np.zeros_like(keep); front = bgm.copy(); room = keep & ~core & haze
    for _ in range(GLOW_D):
        nxt = nd.binary_dilation(front) & room & ~halo
        if not nxt.any(): break
        halo |= nxt; front = nxt
    up = np.where(a > bg, (a - bg) / np.maximum(255 - bg, 1), (bg - a) / np.maximum(bg, 1)).max(axis=2).clip(0, 1)
    g = halo
    al[g] = np.minimum(al[g], ((up[g] - 0.12) / 0.88).clip(0, 1))   # ramps to 0 at the grey: no hard outer edge
    al = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
    al[~nd.binary_dilation(keep)] = 0
    print('glow halo px', int(g.sum()))
k3 = np.maximum(al, 1e-3)[..., None]
rgb = np.where(al[..., None] > 0.02, np.clip((a - bg * (1 - k3)) / k3, 0, 255), 0)
rgba = np.dstack([rgb, al * 255]).astype(np.uint8)
ys, xs = np.nonzero(al > 0.02)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
c = Image.fromarray(rgba, 'RGBA').crop(box)
c = c.resize((max(1, round(c.width / K)), max(1, round(c.height / K))), Image.LANCZOS)
c.save(out)
print(out, 'box', box, 'size', c.size, 'holes %.3f' % holes, 'trapped grey keyed', len(trapped))
