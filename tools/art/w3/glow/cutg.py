"""cut a 4x4 glowworm sheet's cells: python3 cutg.py g1 -> cells/g1_<r><c>.png (magenta unmixed, the biggest piece and what touches it)"""
import sys, numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage
H = Path(__file__).resolve().parent
(H / 'cells').mkdir(exist_ok=True)
for name in sys.argv[1:]:
    im = np.asarray(Image.open(H / f'{name}.jpg').convert('RGB')).astype(np.float32)
    S = im.shape[0] // 4
    for r in range(4):
        for c in range(4):
            a = im[r * S + 6:(r + 1) * S - 6, c * S + 6:(c + 1) * S - 6]
            R, G, B = a[..., 0], a[..., 1], a[..., 2]
            k = np.clip((np.minimum(R, B) - G) / np.maximum(1.0, 255.0 - G), 0, 1)
            k = np.clip((k - 0.1) / 0.9, 0, 1)
            al = 1 - k
            fig = al > 0.55
            fig = ndimage.binary_opening(fig, iterations=1)
            lab, n = ndimage.label(fig)
            if n == 0: continue
            sizes = ndimage.sum(fig, lab, range(1, n + 1))
            keep = np.isin(lab, 1 + np.flatnonzero(sizes > sizes.max() * 0.03))
            near = ndimage.binary_dilation(keep, iterations=6)
            al = np.where(near, al, 0)
            M = np.array([255.0, 0, 255.0])
            rgb = np.clip((a - (1 - al[..., None]) * M) / np.maximum(al, 1e-3)[..., None], 0, 255)
            # the glowworm is all teal: no red above its green, and blue only a little above it (kills the pink fringe the mix leaves)
            rgb[..., 0] = np.minimum(rgb[..., 0], rgb[..., 1])
            rgb[..., 2] = np.minimum(rgb[..., 2], rgb[..., 1] * 1.25 + 10)
            al = np.where(al < 0.9, al * al, al)
            out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')
            out = out.crop(out.getbbox())
            out.save(H / f'cells/{name}_{r}{c}.png')
