import sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

def srgb_to_lab(rgb):
    c = rgb.astype(np.float32) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]], np.float32)
    xyz = c @ M.T
    xyz /= np.array([0.95047, 1.0, 1.08883], np.float32)
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], -1)

def border_mask(h, w, p=6):
    m = np.zeros((h, w), bool); m[:p] = m[-p:] = True; m[:, :p] = m[:, -p:] = True
    return m

def connected_to(mask, seed):
    lab, n = ndi.label(mask)
    ids = np.unique(lab[seed & mask]); ids = ids[ids > 0]
    return np.isin(lab, ids)

def tile_bg(img, seed, tile=48, sigma=2.5):
    """Local background estimate from seed pixels: tile means, normalised-conv fill, upsample."""
    h, w, _ = img.shape
    th, tw = (h + tile - 1) // tile, (w + tile - 1) // tile
    H, W = th * tile, tw * tile
    pad = np.zeros((H, W, 3), np.float32); pad[:h, :w] = img
    sp = np.zeros((H, W), np.float32); sp[:h, :w] = seed
    cnt = sp.reshape(th, tile, tw, tile).sum((1, 3))
    sm = (pad * sp[..., None]).reshape(th, tile, tw, tile, 3).sum((1, 3))
    valid = cnt > tile * tile * 0.2
    col = np.where(valid[..., None], sm / np.maximum(cnt, 1)[..., None], 0)
    wgt = valid.astype(np.float32)
    out = np.zeros_like(col)
    # normalised convolution, growing sigma until everything is covered
    s = sigma
    filled = np.zeros(valid.shape, bool)
    while True:
        num = np.stack([ndi.gaussian_filter(col[..., k] * wgt, s, mode='nearest') for k in range(3)], -1)
        den = ndi.gaussian_filter(wgt, s, mode='nearest')
        ok = den > 1e-4
        newfill = ok & ~filled
        out[newfill] = (num[newfill] / den[newfill][..., None])
        filled |= ok
        if filled.all() or s > 200: break
        s *= 2
    out[valid] = col[valid] * 0.5 + out[valid] * 0.5
    # smooth upsample
    up = np.stack([np.asarray(Image.fromarray(out[..., k].astype(np.float32)).resize((W, H), Image.BILINEAR)) for k in range(3)], -1)
    return up[:h, :w]

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r
