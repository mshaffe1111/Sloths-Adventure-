"""ART-678b, the lead's FAIL on the underlayer (11-14): the grass lip made the band read as a FLOOR he could land on (he falls through
it: Matt's complaint, R-165.224). This makes it read as deep and out of reach: the grass top is cut away below the grass mat along a
ragged earth/root edge (a periodic profile, so the band still tiles end to end), the cut edge gets a dark under-lip, and the band
darkens and hazes toward the bottom (depth).

    python3 tools/art/hf678/underdeep.py <band.webp> <out.webp> [cut row] [haze r,g,b]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1:3]
CUT = int(sys.argv[3]) if len(sys.argv) > 3 else 170
HAZE = np.array([float(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '34,40,42').split(',')])
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
H, W = a.shape[:2]
x = np.arange(W)
# a ragged edge: sums of sines with whole periods across the width (so the two ends meet), plus short root tips hanging lower
prof = (14 * np.sin(2 * np.pi * 3 * x / W + 0.7) + 9 * np.sin(2 * np.pi * 7 * x / W + 2.1) + 5 * np.sin(2 * np.pi * 17 * x / W + 4.0)
        + 7 * np.sin(2 * np.pi * 41 * x / W + 1.3) + 5 * np.sin(2 * np.pi * 89 * x / W + 0.4) + 4 * np.sin(2 * np.pi * 157 * x / W + 2.6))
edge = CUT + prof
y = np.arange(H)[:, None]
al = np.clip(y - edge[None, :] + 1.0, 0, 1)  # a 1 px anti-aliased edge
o = a.copy()
o[..., 3] = np.minimum(a[..., 3], al * 255)
# the under-lip: the first ~22 px below the edge darken (a cut earth face in shadow, so it never reads as a lit top)
d = y - edge[None, :]
lip = np.clip(1 - d / 22, 0, 1) * (d >= 0)
o[..., :3] *= (1 - 0.55 * lip)[..., None]
o[..., :3] = np.where((d >= 0)[..., None] & (d < 3)[..., None], o[..., :3] * 0.35, o[..., :3])  # a thin dark line at the edge
# depth: from the edge down, darker and hazier (60% toward the haze colour at the bottom, brightness to 45%)
t = np.clip((y - CUT) / (H - CUT), 0, 1)[..., None] * np.ones((1, W, 1))
o[..., :3] = o[..., :3] * (1 - 0.55 * t) * (1 - 0.6 * t) + HAZE * 0.6 * t
o = o[max(0, int(edge.min()) - 2):]
o[o[..., 3] == 0, :3] = 0
Image.fromarray(o.clip(0, 255).astype(np.uint8)).save(dst, 'WEBP', lossless=True, method=6)
op = o[..., 3] > 128; r = op[:, 0] & op[:, -1]
print(dst, o.shape[1], 'x', o.shape[0], 'wrap diff %.1f' % float(np.abs(o[r, 0, :3] - o[r, -1, :3]).mean()))
