"""Magenta key for the hf-art-ground takes: alpha from how far a pixel is from the key colour (soft between d0 and d1), the magenta spill
taken out of the fringe (r and b clamped toward g, as tools/art/cutprops.py does), specks under `speck` px dropped, and an optional
1 px pull-in of the silhouette.
"""
import numpy as np
from PIL import Image
from scipy import ndimage


def key(img, d0=70, d1=150, speck=60, erode=0, main_only=False):
    a = np.asarray(img.convert('RGB'), np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # magenta-ness: r and b high, g low
    mag = np.minimum(r, b) - g
    dist = 255 - np.clip(mag, 0, 255)
    al = np.clip((dist - (255 - d1)) / max(1, d1 - d0), 0, 1)
    # despill: wherever r and b both stand above g, bring them down to it (the pink cast a key leaves)
    spill = np.clip(np.minimum(r, b) - np.maximum(g, 0) - 18, 0, None) * (1 - al * 0.6)
    out = a.copy()
    out[..., 0] -= spill
    out[..., 2] -= spill
    solid = al > 0.5
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        if main_only:
            keepl = 1 + int(np.argmax(sizes))
            keepm = lab == keepl
        else:
            keepm = np.isin(lab, 1 + np.where(sizes >= speck)[0])
        grow = ndimage.binary_dilation(keepm, iterations=3)
        al = np.where(grow, al, 0)
    if erode:
        al = np.minimum(al, ndimage.binary_erosion(al > 0.5, iterations=erode).astype(np.float32) * 0.0 + al)
        inner = ndimage.binary_erosion(al > 0.5, iterations=erode)
        al = np.where(inner | (al < 0.5), al, al * 0.5)
    rgba = np.dstack([np.clip(out, 0, 255), al * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def depurple(im, lum_max=120, edge_only=0):
    """dark purple left by the key in thin roots and shadows: its blue brought down to its green, so it reads brown. `edge_only`: only
    within that many px of the silhouette (a prop whose own reds and pinks must stay)"""
    a = np.asarray(im, np.float32).copy()
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = (r + g + b) / 3
    p = (np.minimum(r, b) - g > 8) & (lum < lum_max) & (a[..., 3] > 0)
    if edge_only:
        p &= ndimage.binary_dilation(a[..., 3] < 200, iterations=edge_only)
    # (to a root brown: red a little over green, blue under it, at the pixel's own brightness)
    a[..., 0] = np.where(p, lum * 1.22, r)
    a[..., 1] = np.where(p, lum * 0.98, g)
    a[..., 2] = np.where(p, lum * 0.8, b)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def gkey(img, d0=40, d1=110, speck=60):
    """the green key (bank ends redone 2026-10-30: the magenta key bled into the paint): alpha from how far green stands over red and
    blue, the green spill taken out of the fringe, only the largest piece kept"""
    a = np.asarray(img.convert('RGB'), np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    gr = g - np.maximum(r, b)
    al = np.clip((d1 - gr) / max(1, d1 - d0), 0, 1)
    out = a.copy()
    out[..., 1] = np.minimum(g, np.maximum(r, b) + 6)
    solid = al > 0.5
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        keepm = lab == 1 + int(np.argmax(sizes))
        al = np.where(ndimage.binary_dilation(keepm, iterations=3), al, 0)
    return Image.fromarray(np.dstack([np.clip(out, 0, 255), al * 255]).astype(np.uint8), 'RGBA')
