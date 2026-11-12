#!/usr/bin/env python3
"""Image trial encodes (task AS-1, test-side only: nothing here touches src/).

    python3 tools/assets/trial.py <inventory.json> <out dir> [top N | all]

For each shipped .webp: a resize factor if the probe saw it drawn at under half its stored size (stored > 2x the largest drawn
size): to the smallest of 0.75 / 0.5 that still keeps 2x the largest drawn size (sheet frame grids stay whole at these steps when a
frame is a multiple of 4 px), resampled in premultiplied alpha so edges don't fringe; then WebP at quality 90 / 82 / 75 (method 6,
lossless alpha). A file already at or below a setting's quality and not resized is kept as it is for that setting (re-encoding it
only adds a generation of loss for no saving). Writes <out dir>/trial.json and the encodes for the first N under <out dir>/files.
"""
import json, math, os, sys
from multiprocessing import Pool

from PIL import Image

QS = (90, 82, 75)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
outdir = None


def factor(r):
    s = r.get('drawn_scale') or 0
    if not r.get('seen') or s <= 0 or s >= 0.5:
        return 1.0
    need = 2 * s
    return 0.5 if need <= 0.5 else 0.75


def resized(im, f):
    if f == 1.0:
        return im
    w, h = max(1, round(im.width * f)), max(1, round(im.height * f))
    if im.mode == 'RGBA':
        return im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    return im.resize((w, h), Image.LANCZOS)


def one(args):
    r, keep, outdir = args
    p = os.path.join(ROOT, r['src'])
    im = Image.open(p)
    im.load()
    f = factor(r)
    im2 = resized(im, f)
    res = dict(src=r['src'], bytes=r['bytes'], factor=f, w=im2.width, h=im2.height, q_est=r.get('q_est'), out={})
    for q in QS:
        if f == 1.0 and (r.get('q_est') or 100) <= q + 1:
            res['out'][q] = r['bytes']
            continue
        o = os.path.join(outdir, 'files', f"{r['src'].replace('/', '__')}.q{q}.webp")
        im2.save(o, 'WEBP', quality=q, method=6, alpha_quality=100)
        res['out'][q] = min(os.path.getsize(o), r['bytes']) if f == 1.0 else os.path.getsize(o)
        if not keep:
            os.remove(o)
    return res


if __name__ == '__main__':
    inv, outdir = sys.argv[1], sys.argv[2]
    mode = sys.argv[3] if len(sys.argv) > 3 else '20'
    os.makedirs(os.path.join(outdir, 'files'), exist_ok=True)
    rows = [r for r in json.load(open(inv)) if r['dist'].endswith('.webp')]
    n = len(rows) if mode == 'all' else int(mode)
    jobs = [(r, i < 20, outdir) for i, r in enumerate(rows[:n])]
    with Pool(3) as pool:
        out = pool.map(one, jobs, chunksize=1)
    json.dump(out, open(os.path.join(outdir, 'trial.json'), 'w'), indent=1)
    tot = sum(r['bytes'] for r in out)
    print(f'{len(out)} files, {tot / 2**20:.1f} MB now')
    for q in QS:
        t = sum(r['out'][q] for r in out)
        print(f'q{q}: {t / 2**20:.1f} MB ({(tot - t) / 2**20:.1f} MB saved, {100 * (tot - t) / tot:.0f}%)')
