"""ART-W2A: cut an edit take off its flat grey (flood from the border, so a grey otter is never keyed inside its outline), keep the
biggest piece, un-mix the rim from the grey, crop, and scale by K (edit px per sheet px: the starts put Matt's 260 px Happy pose at 737 px,
so K 2.835 keeps every frame at the Happy pose's scale; the heron 405/471 px).
    python3 -I tools/art/hfw2a/cut.py <take.png> <out.png> <K> [tol 26]
Prints the box and the share of holes inside the piece (a fail over ~0.10: hf-art.md 11-02).
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

src, out, K = sys.argv[1], sys.argv[2], float(sys.argv[3])
tol = float(sys.argv[4]) if len(sys.argv) > 4 else 26
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32)
bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
near = np.abs(a - bg).max(axis=2) <= tol
lab, n = nd.label(near)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgm = np.isin(lab, list(edge))
fg = ~bgm
lab2, n2 = nd.label(fg)
sizes = nd.sum(fg, lab2, range(1, n2 + 1))
keep = lab2 == (1 + int(np.argmax(sizes)))
keep = nd.binary_fill_holes(keep) & ~(bgm & ~nd.binary_fill_holes(keep))
holes = (nd.binary_fill_holes(keep) & ~keep).sum() / max(1, nd.binary_fill_holes(keep).sum())
# soft rim: alpha from distance to the grey over the outermost 2 px, colour un-mixed from the grey there
dist = np.abs(a - bg).max(axis=2)
alpha = keep.astype(np.float32)
rim = keep & ~nd.binary_erosion(keep, iterations=2)
alpha[rim] = np.clip(dist[rim] / 60.0, 0, 1)
al = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255
al[~nd.binary_dilation(keep)] = 0
k3 = np.maximum(al, 1e-3)[..., None]
rgb = np.where(al[..., None] > 0.02, np.clip((a - bg * (1 - k3)) / k3, 0, 255), 0)
rgba = np.dstack([rgb, al * 255]).astype(np.uint8)
ys, xs = np.nonzero(al > 0.02)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
c = Image.fromarray(rgba, 'RGBA').crop(box)
c = c.resize((max(1, round(c.width / K)), max(1, round(c.height / K))), Image.LANCZOS)
c.save(out)
print(out, 'box', box, 'size', c.size, 'holes %.3f' % holes)
