#!/usr/bin/env python3
"""B4 cut-out checks on every whole image with alpha: fill (the painted part's longest side over the canvas's: under 0.6 it reads
small in its slot) and white fringe (share of soft-edge pixels, alpha 16-200, that are near white: over 0.25 is a light halo on dark
ground). Prints one line per image over a limit; writes b4/edgecheck.json for build_b4.py's status."""
import glob, json, os, sys
import numpy as np
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
A = os.path.join(ROOT, 'src/assets')
out = {}
pats = ['icons/*.webp', 'pickups/*.webp', 'ui/*.webp', 'title/log.webp', 'title/slab.webp', 'hero/title-idle.webp', 'enemies/goldsnake-*.webp',
        'enemies/*-atlas.webp', 'enemies/*-anim.webp', 'enemies/*-poses.webp', 'characters/*.webp', 'hero/*.webp', 'hero/clips/*.webp',
        'bosses/*.webp', 'flora/birds-atlas.webp', 'flora/butterflies-atlas.webp', 'flora/heartbloom-*.webp', 'w8/pokey-jar.webp', 'story/hd/*.webp', 'story/drake/*.webp']
for pat in pats:
    for p in sorted(glob.glob(os.path.join(A, pat))):
        rel = os.path.relpath(p, A)
        im = Image.open(p)
        if im.mode != 'RGBA':
            continue
        a = np.asarray(im.convert('RGBA')).astype(np.int32)
        al = a[..., 3]
        ys, xs = np.nonzero(al > 16)
        if not len(xs):
            continue
        fill = max(xs.max() - xs.min() + 1, ys.max() - ys.min() + 1) / max(im.size)
        soft = (al > 16) & (al < 200)
        lum = (a[..., 0] * 299 + a[..., 1] * 587 + a[..., 2] * 114) // 1000
        n = int(soft.sum())
        white = float(((lum > 225) & soft).sum()) / n if n > 50 else 0.0
        out[rel] = {'fill': round(fill, 2), 'white_edge': round(white, 3)}
        single = not any(s in rel for s in ('-atlas', '-anim', '-poses', 'cels-', 'clips/', 'hd/', 'boss-', 'hero-', 'pokey-', 'meeca-', 'dot-', 'flicker'))
        if (single and fill < 0.6) or white > 0.25:
            print(rel, out[rel])
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'edgecheck.json'), 'w'), indent=0)

# ---- per frame: white specks on the edge (opaque near-white pixels touching transparency), the key-out residue seen on Iron-Claw ----
rects = json.load(open(os.path.join(os.path.dirname(__file__), 'rects.json')))
sheets = {}
frames = {}
for key, (x, y, w, h) in rects.items():
    f = key.split('#')[0]
    if f not in sheets:
        im = Image.open(os.path.join(ROOT, f))
        sheets[f] = np.asarray(im.convert('RGBA')).astype(np.int32) if im.mode == 'RGBA' else None
    s = sheets[f]
    if s is None:
        continue
    a = s[y:y + h, x:x + w]
    al = a[..., 3]
    op = al > 200
    tr = al < 40
    near = np.zeros_like(tr)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            near |= np.roll(np.roll(tr, dy, 0), dx, 1)
    lum = (a[..., 0] * 299 + a[..., 1] * 587 + a[..., 2] * 114) // 1000
    edge = op & near
    nw = int((edge & (lum > 230)).sum())
    frames[key] = round(nw / max(1, int(edge.sum())), 3)
json.dump(frames, open(os.path.join(os.path.dirname(__file__), 'edgecheck-frames.json'), 'w'), separators=(',', ':'))
by = {}
for k, v in frames.items():
    by.setdefault(k.split('#')[0], []).append(v)
for f, vs in sorted(by.items(), key=lambda x: -max(x[1])):
    print('frames', f.replace('src/assets/', ''), 'max', max(vs), 'over0.05', sum(v > 0.05 for v in vs), 'of', len(vs))
