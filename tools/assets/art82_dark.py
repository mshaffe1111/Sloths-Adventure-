"""AS-2 step 2: how dark each shipped WebP is, on visible pixels only (alpha > 0, weighted by alpha).
Luma is Rec.709 on sRGB 0-255. near_black = share of visible pixels with luma < 48 (the range where WebP's 8x8/16x16 blocks and
banding show on a phone: near-black has few code values, so each quantizer step is a visible jump)."""
import csv, json, sys
import numpy as np
from PIL import Image

def stats(path):
    a = np.asarray(Image.open(path).convert('RGBA'), dtype=np.float32)
    al = a[..., 3] / 255.0
    y = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    vis = al > 0
    w = al[vis]
    if w.sum() == 0:
        return dict(mean_luma=0, near_black=0, vis=0)
    yv = y[vis]
    return dict(mean_luma=round(float((yv * w).sum() / w.sum()), 1),
                near_black=round(float((w * (yv < 48)).sum() / w.sum()), 3),
                vis=round(float(vis.mean()), 3))

if __name__ == '__main__':
    rows = [r for r in csv.DictReader(open('reference/art/compress-trials/inventory.csv')) if r['src'].endswith('.webp')]
    out = []
    for r in rows:
        s = stats(r['src']); s.update(src=r['src'], q_est=int(r['q_est']), bytes=int(r['bytes'])); out.append(s)
    json.dump(out, open(sys.argv[1], 'w'), indent=0)

def smooth_dark(path, T=16):
    """Share of visible area in smooth dark 16x16 tiles (WebP's macroblock): tile luma mean < 48 and luma std < 3 (no texture to
    hide blocking or banding), tile at least half visible. This is what made w10-far break at q82."""
    a = np.asarray(Image.open(path).convert('RGBA'), dtype=np.float32)
    y = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    vis = a[..., 3] > 0
    h, w = y.shape; H, W = h // T, w // T
    yt = y[:H * T, :W * T].reshape(H, T, W, T); vt = vis[:H * T, :W * T].reshape(H, T, W, T)
    n = vt.sum((1, 3)); s = np.where(vt, yt, 0).sum((1, 3)); s2 = np.where(vt, yt * yt, 0).sum((1, 3))
    m = s / np.maximum(n, 1); sd = np.sqrt(np.maximum(s2 / np.maximum(n, 1) - m * m, 0))
    good = n >= T * T / 2
    sm = good & (m < 48) & (sd < 3)
    return round(float(n[sm].sum() / max(1, vis.sum())), 3)
