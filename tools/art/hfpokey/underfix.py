"""Fill the dark pocket the under clip leaves under his chin in under_03..05 (hf-art-pokey, 2026-10-29): the near-black patch between his
chest and the pulling arm, recoloured to his chest's shadow brown; the outline at the silhouette's edge (2 px) is kept.
    python3 -I tools/art/hfpokey/underfix.py"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

D = Path(__file__).resolve().parents[3] / 'reference/animation-sheets/pokey-swim/under'
for f in sorted(D.glob('under_*.png')):
    a = np.asarray(Image.open(f).convert('RGBA')).astype(np.float32)
    dark = (a[..., :3].max(-1) < 45) & (a[..., 3] > 200)
    blob = ndimage.binary_opening(dark, iterations=2)
    lab, n = ndimage.label(blob)
    keep = np.zeros_like(blob)
    for k in range(1, n + 1):
        m = lab == k
        if m.sum() > 15:
            keep |= m
    if not keep.any():
        continue
    region = ndimage.binary_dilation(keep, iterations=3) & (a[..., :3].max(-1) < 90)
    inside = ndimage.distance_transform_edt(a[..., 3] > 128) > 2
    region &= inside
    a[region, :3] = (118, 78, 48)
    # soften the seam into the fur round it
    soft = ndimage.binary_dilation(region, iterations=1) & ~region & inside
    blur = ndimage.uniform_filter(a[..., :3], size=(3, 3, 1))
    a[soft, :3] = blur[soft]
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(f)
    print(f.name, int(region.sum()), 'px')
