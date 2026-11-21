"""ART-NEXT-c: clean the reeds cut (reedsR-s41) after cut.py, in place.
    python3 -I tools/art/hfnext/reedsfix.py <cut.png>
1. Trapped grey: the take's flat grey caught between stems (wedges too small or too shaded for cut.py's 150 px / tol 9 trapped rule)
   reads as pale grey slivers on dark. Low-saturation px near the take's grey (sat < 16, lum 100-160) in a region over 6 px -> clear,
   with a 1 px soft edge.
2. Base haze: the edit dusted the foot of each clump with a pale silt haze (light, low-saturation), which glows as a light ring on a dark
   ground (the lead, 11-21). In the lower 30% of the piece, pale low-saturation px are pulled to the clump's own wet dark brown (the
   median of the saturated brown px there), keeping their shading; the bright single-px silt specks on the stems stay.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
p = sys.argv[1]
im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
rgb, al = im[..., :3], im[..., 3]
lum = rgb.mean(axis=2); sat = rgb.max(axis=2) - rgb.min(axis=2)
solid = al > 40
# 1 trapped grey
g = solid & (sat < 16) & (lum > 100) & (lum < 160)
lab, n = nd.label(g)
sz = nd.sum(g, lab, range(1, n + 1))
grey = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s > 6])
a2 = al.copy(); a2[grey] = 0
soft = np.asarray(Image.fromarray(a2.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)
al = np.where(nd.binary_dilation(grey, iterations=1), np.minimum(al, soft), al); al[grey] = 0
# 2 base haze
H = rgb.shape[0]; low = np.zeros_like(solid); low[int(H * 0.70):] = True
brown = low & solid & (sat > 60) & (lum < 110)
tgt = np.median(rgb[brown], axis=0) if brown.any() else np.array([70, 42, 24], np.float32)
pale = low & solid & (al > 0) & (sat < 45) & (lum > 95)
speck = pale & (nd.uniform_filter(pale.astype(np.float32), 5) < 0.25)       # an isolated bright fleck: a silt speck, kept
haze = pale & ~speck
k = np.clip((lum - 95) / 70, 0, 1)[..., None]
shade = (lum / np.maximum(lum[haze].mean() if haze.any() else 1, 1))[..., None]
fixed = rgb * (1 - k) + (tgt * np.clip(shade, 0.55, 1.0)) * k
rgb = np.where(haze[..., None], fixed, rgb)
Image.fromarray(np.dstack([rgb, al]).clip(0, 255).astype(np.uint8), 'RGBA').save(p)
print(p, 'grey keyed px', int(grey.sum()), 'haze px', int(haze.sum()), 'kept specks', int(speck.sum()), 'brown', tgt.round())
