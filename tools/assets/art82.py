"""AS-2: re-encode every shipped WebP stored above about q83 at q82 (libwebp method 6, lossless alpha), except dark images
(near_black >= 0.5, art82_dark.py), and measure each against its original on visible pixels only (alpha > 0).
Usage: python3 tools/assets/art82.py DARK_JSON OUTDIR [src ...]   -> OUTDIR/files/*.webp, OUTDIR/measure.json
Metrics (all on premultiplied colour, so a fully transparent pixel's hidden RGB never counts):
  ssim       mean SSIM of luma (Gaussian 7x7 sigma 1.5, Wang et al.) over visible pixels
  psnr       PSNR of RGB over visible pixels
  tile_ssim  the worst 32x32 tile (>= half visible) by mean SSIM, and where it is (x, y)
  dark_psnr  PSNR of luma over visible pixels whose original luma < 48 (where Matt saw w10-far break), None if < 2% of pixels
  dark_tile  the worst 32x32 tile among dark tiles by luma PSNR (blocking and banding in the dark show here)
  ssimu2     SSIMULACRA2 (pip ssimulacra2 0.3.0, a Python port; both composited over 50% grey first) at stored size; images over 3 MP: the 1024x1024 around tile_ssim"""
import io, json, os, sys
from multiprocessing import Pool
import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity

T = 32

def luma(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

def tiles(m, w):  # mean of m per T x T tile, weighted by w
    h, wd = m.shape
    H, W = h // T, wd // T
    mm = (m * w)[:H * T, :W * T].reshape(H, T, W, T).sum((1, 3))
    ww = w[:H * T, :W * T].reshape(H, T, W, T).sum((1, 3))
    return mm, ww

def measure(o, q):
    al = o[..., 3:4] / 255.0
    vis = o[..., 3] > 0
    po, pq = o[..., :3] * al, q[..., :3] * al
    yo, yq = luma(po), luma(pq)
    _, smap = structural_similarity(yo, yq, data_range=255, gaussian_weights=True, sigma=1.5, use_sample_covariance=False, full=True)
    v = vis.astype(np.float64)
    r = {}
    r['ssim'] = float((smap * v).sum() / v.sum())
    mse = float(((po - pq) ** 2)[vis].mean())
    r['psnr'] = 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse)
    ts, tw = tiles(smap, v)
    ok = tw >= T * T / 2
    if ok.any():
        tm = np.where(ok, ts / np.maximum(tw, 1), 9)
        i = np.unravel_index(np.argmin(tm), tm.shape)
        r['tile_ssim'] = float(tm[i]); r['tile_xy'] = [int(i[1] * T), int(i[0] * T)]
    else:
        r['tile_ssim'] = r['ssim']; r['tile_xy'] = [0, 0]
    dk = vis & (luma(o[..., :3].astype(np.float64)) < 48)
    r['dark_share'] = float(dk.sum() / max(1, vis.sum()))
    if r['dark_share'] >= 0.02:
        e = (yo - yq) ** 2
        dmse = float(e[dk].mean())
        r['dark_psnr'] = 99.0 if dmse == 0 else 10 * np.log10(255 ** 2 / dmse)
        es, ew = tiles(e, dk.astype(np.float64))
        okd = ew >= T * T / 2
        if okd.any():
            em = np.where(okd, es / np.maximum(ew, 1), -1)
            i = np.unravel_index(np.argmax(em), em.shape)
            r['dark_tile_psnr'] = 99.0 if em[i] == 0 else float(10 * np.log10(255 ** 2 / em[i]))
            r['dark_tile_xy'] = [int(i[1] * T), int(i[0] * T)]
    return r

def ssimu2(o, q, xy, tmp):
    import ssimulacra2
    h, w = o.shape[:2]
    if h * w > 3_000_000:
        x0 = max(0, min(w - 1024, xy[0] - 496)); y0 = max(0, min(h - 1024, xy[1] - 496))
        o, q = o[y0:y0 + 1024, x0:x0 + 1024], q[y0:y0 + 1024, x0:x0 + 1024]
    # the port calls .convert('RGB') before it looks for alpha, so it would score the hidden colour under transparent pixels:
    # composite both over 50% grey here (its documented background) and hand it plain RGB
    def comp(x):
        al = x[..., 3:4].astype(np.float64) / 255.0
        return np.round(x[..., :3] * al + 127.5 * (1 - al)).astype(np.uint8)
    a, b = tmp + '.o.png', tmp + '.q.png'
    Image.fromarray(comp(o)).save(a); Image.fromarray(comp(q)).save(b)
    s = ssimulacra2.compute_ssimulacra2(a, b)
    os.remove(a); os.remove(b)
    return float(s)

def one(args):
    src, outdir = args
    im = Image.open(src).convert('RGBA')
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=82, method=6, alpha_quality=100)
    data = buf.getvalue()
    orig = os.path.getsize(src)
    out = os.path.join(outdir, 'files', src.replace('/', '__'))
    open(out, 'wb').write(data)
    o = np.asarray(im)
    q = np.asarray(Image.open(io.BytesIO(data)).convert('RGBA'))
    assert (o[..., 3] == q[..., 3]).all(), src + ': alpha changed'
    r = measure(o.astype(np.float64), q.astype(np.float64))
    r['ssimu2'] = ssimu2(o, q, r['tile_xy'], out)
    r.update(src=src, w=im.width, h=im.height, orig_bytes=orig, q82_bytes=len(data))
    return r

def rescore(args):
    r, outdir = args
    o = np.asarray(Image.open(r['src']).convert('RGBA'))
    q = np.asarray(Image.open(os.path.join(outdir, 'files', r['src'].replace('/', '__'))).convert('RGBA'))
    r['ssimu2'] = ssimu2(o, q, r['tile_xy'], os.path.join(outdir, 'files', r['src'].replace('/', '__')))
    return r

if __name__ == '__main__' and sys.argv[1] == '--rescore':  # recompute ssimu2 only: --rescore MEASURE_JSON OUTDIR
    with Pool(4) as p:
        res = p.map(rescore, [(r, sys.argv[3]) for r in json.load(open(sys.argv[2]))])
    json.dump(res, open(sys.argv[2], 'w'), indent=1)
elif __name__ == '__main__':
    dark, outdir = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.join(outdir, 'files'), exist_ok=True)
    d = json.load(open(dark))
    srcs = sys.argv[3:] or [x['src'] for x in d if x['q_est'] >= 84 and x['near_black'] < 0.5]
    with Pool(4) as p:
        res = []
        for i, r in enumerate(p.imap_unordered(one, [(s, outdir) for s in srcs])):
            res.append(r)
            if i % 25 == 0: print(i, len(srcs), flush=True)
    json.dump(sorted(res, key=lambda r: r['ssim']), open(os.path.join(outdir, 'measure.json'), 'w'), indent=1)
