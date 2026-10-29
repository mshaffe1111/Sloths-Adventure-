"""Cut Matt's Gemini prop sheets (reference/prop-sheets/gemini-batch-2026-10-28/: 3x2 grids on a key colour, magenta or cyan for W9,
with thin black cell lines) into sprites, and the General's armour-off poses (4x2 on grey) like the other story frames.

    python3 -I tools/art/w6to10/geminicut.py <sheets dir> <out dir>

Per cell: the cell's edge trimmed (the grid lines), the key colour flooded out from the cell's border (so a dark doorway that fades into
the key inside a frame stays painted), enclosed pockets of pure key keyed too (a cage's bars, a rack), long thin horizontal ground
lines removed, the key's spill taken off the edges, then trimmed. Paired states (lever up/down, plate up/down, door closed/open) are put
on one shared canvas, lined up on the middle of their feet, so they swap in place. Out: <name>.webp per sheet group (an atlas, frames
anchored at the middle of the foot) + <name>.json, and a contact sheet per group on a checker.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

# sheet: (key, cells in reading order (None skips a cell), pairs, options per cell)
SHEETS = {
    'w6a-puzzle': ('magenta', ['lever-up', 'lever-down', 'plate-up', 'plate-down', 'door-closed', 'door-open'],
                   [('lever-up', 'lever-down'), ('plate-up', 'plate-down'), ('door-closed', 'door-open')], {}),
    'w6b-water-room-take2': ('magenta', ['raft', 'sluice-wheel', 'gauge-post', 'seesaw', 'stone', 'lily-pads'], [], {}),
    'w7a-puzzle-take2': ('magenta', ['lever-up', 'lever-down', None, None, 'door-closed', 'door-open'],
                         [('lever-up', 'lever-down'), ('door-closed', 'door-open')], {}),
    'w8a-puzzle': ('magenta', ['lever-up', 'lever-down', 'plate-up', 'plate-down', 'door-closed', 'door-open'],
                   [('lever-up', 'lever-down'), ('plate-up', 'plate-down'), ('door-closed', 'door-open')], {}),
    'w9a-puzzle': ('cyan', ['lever-up', 'lever-down', 'plate-up', 'plate-down', 'gate-closed', 'gate-open'],
                   [('lever-up', 'lever-down'), ('plate-up', 'plate-down'), ('gate-closed', 'gate-open')],
                   {'gate-open': {'pockets': False}}),
    'w10c-set-dressing': ('magenta', ['banner', 'weapon-rack', 'brazier', 'cage', 'crates', 'spout'], [], {}),
}
KEYS = {'magenta': (255, 0, 255), 'cyan': (0, 255, 255)}


def keyness(rgb, key):
    r, g, b = [rgb[..., i].astype(np.float32) for i in range(3)]
    return (np.minimum(r, b) - g) if key == 'magenta' else (np.minimum(g, b) - r)


def cut_cell(cell, key, opts):
    a = np.asarray(cell.convert('RGB')).astype(np.float32)
    H, W = a.shape[:2]
    k = keyness(a, key)
    bg_like = k > 110
    # (the key flooded in from the border: what it reaches is background)
    lab, n = ndimage.label(bg_like)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    if opts.get('pockets', True):
        # (pockets of near-pure key shut in by the object: the gaps between a cage's bars)
        pure = k > 140
        plab, pn = ndimage.label(pure & ~bg)
        sizes = ndimage.sum(np.ones_like(k), plab, range(1, pn + 1))
        for i, s in enumerate(sizes, 1):
            if s >= 6:
                bg |= ndimage.binary_dilation(plab == i, iterations=1) & bg_like
    # (thin dark horizontal lines across the cell: the grid's ground lines)
    lum = a.mean(axis=2)
    dark = lum < 70
    up = np.zeros_like(dark); dn = np.zeros_like(dark)
    up[4:] = bg[:-4] | (k[:-4] > 110); dn[:-4] = bg[4:] | (k[4:] > 110)
    thin = dark & up & dn
    run = ndimage.uniform_filter1d(thin.astype(np.float32), 41, axis=1) > 0.85
    line = ndimage.binary_dilation(run & thin, structure=np.ones((5, 3)))
    alpha = np.where(bg | line, 0.0, 1.0)
    # (a soft edge: the pixels next to the background take their alpha from how much key is in them)
    rim = ndimage.binary_dilation(alpha == 0, iterations=2) & (alpha > 0)
    soft = np.clip((150 - k) / 110, 0, 1)
    alpha = np.where(rim, np.minimum(alpha, soft), alpha)
    if opts.get('pockets', True):
        # (and key showing through anywhere else, between bars and leaves: as much alpha as it has key, and the spill below)
        alpha = np.minimum(alpha, np.clip((170 - k) / 110, 0, 1))
        rim = rim | (k > 30)
    # (the key's spill off the painted pixels)
    if key == 'magenta':
        m = np.minimum(a[..., 0], a[..., 2]); ex = np.clip(m - a[..., 1] - 20, 0, None) * rim
        a[..., 0] -= ex; a[..., 2] -= ex
    else:
        m = np.minimum(a[..., 1], a[..., 2]); ex = np.clip(m - a[..., 0] - 20, 0, None) * rim
        a[..., 1] -= ex; a[..., 2] -= ex
    # (specks: keep the parts of any size, drop crumbs under 40 px)
    lab, n = ndimage.label(alpha > 0.5)
    if n:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
        for i, s in enumerate(sizes, 1):
            if s < 40:
                alpha[lab == i] = 0
    rgba = np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return im.crop(bb) if bb else None


def foot_x(im):
    a = np.asarray(im.getchannel('A')) > 128
    ys = np.nonzero(a.any(axis=1))[0]
    rows = a[ys[-1] - max(2, len(ys) // 10): ys[-1] + 1]
    xs = np.nonzero(rows.any(axis=0))[0]
    return (xs[0] + xs[-1] + 1) / 2


def pack(sprites, width=2048, pad=4):
    x = y = row = 0
    place = {}
    for n, im in sprites.items():
        if x + im.width > width:
            x, y, row = 0, y + row + pad, 0
        place[n] = (x, y)
        x, row = x + im.width + pad, max(row, im.height)
    sheet = Image.new('RGBA', (width, y + row))
    for n, im in sprites.items():
        sheet.paste(im, place[n])
    return sheet, place


def checker(im):
    yy, xx = np.mgrid[0:im.height, 0:im.width]
    g = np.where(((xx // 16 + yy // 16) % 2)[..., None] == 1, 150, 200).astype(np.uint8)
    c = Image.fromarray(np.concatenate([np.repeat(g, 3, axis=2), np.full(g.shape, 255, np.uint8)], axis=2), 'RGBA')
    c.alpha_composite(im)
    return c.convert('RGB')


report = {}
for name, (key, cells, pairs, opts) in SHEETS.items():
    sheet = Image.open(SRC / f'{name}.jpg').convert('RGB')
    W, H = sheet.size
    cw, ch = W / 3, H / 2
    sprites, anchors = {}, {}
    for i, cn in enumerate(cells):
        if not cn:
            continue
        cx, cy = i % 3, i // 3
        m = 7
        cell = sheet.crop((round(cx * cw) + m, round(cy * ch) + m, round((cx + 1) * cw) - m, round((cy + 1) * ch) - m))
        im = cut_cell(cell, key, opts.get(cn, {}))
        if im is None:
            print('EMPTY', name, cn); continue
        sprites[cn] = im
        anchors[cn] = (foot_x(im), im.height)
    # (paired states on one shared canvas, feet lined up)
    for a_, b_ in pairs:
        A, B = sprites[a_], sprites[b_]
        fa, fb = anchors[a_][0], anchors[b_][0]
        left = max(fa, fb); right = max(A.width - fa, B.width - fb)
        h = max(A.height, B.height)
        w = int(np.ceil(left + right))
        for n, im, f in ((a_, A, fa), (b_, B, fb)):
            c = Image.new('RGBA', (w, h))
            c.paste(im, (round(left - f), h - im.height))
            sprites[n] = c
            anchors[n] = (round(left, 1), h)
    atlas, place = pack(sprites)
    atlas.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    frames = {n: {'x': place[n][0], 'y': place[n][1], 'w': im.width, 'h': im.height, 'ax': round(float(anchors[n][0]), 1), 'ay': anchors[n][1]}
              for n, im in sprites.items()}
    (OUT / f'{name}.json').write_text(json.dumps({'sheet': f'{name}.webp', 'size': {'w': atlas.width, 'h': atlas.height},
                                                  'anchor': 'middle of the foot', 'pairs': pairs, 'frames': frames}, indent=1))
    checker(atlas).save(OUT / f'check-{name}.jpg', quality=85)
    report[name] = {'size': atlas.size, 'bytes': (OUT / f'{name}.webp').stat().st_size, 'frames': {n: (f['w'], f['h']) for n, f in frames.items()}}
    print(name, atlas.size, (OUT / f'{name}.webp').stat().st_size, {n: (f['w'], f['h']) for n, f in frames.items()})

# ── the General with his armour off, 8 poses (4 x 2 on grey): keyed off the grey, trimmed, at one scale, feet at the bottom middle ──
g = Image.open(SRC / 'general-armour-off.jpg').convert('RGB')
a = np.asarray(g).astype(np.float32)
bgc = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)]), axis=0)
names = ['stand', 'bow', 'offer', 'hand-on-heart', 'eyes-shut', 'sit', 'laugh', 'open-arms']
W, H = g.size
poses = {}
for i, n in enumerate(names):
    cx, cy = i % 4, i // 4
    c = a[round(cy * H / 2): round((cy + 1) * H / 2), round(cx * W / 4): round((cx + 1) * W / 4)]
    d = np.sqrt(((c - bgc) ** 2).sum(axis=2))
    # (his fur is grey-brown, near the grey: flood from the border only, a gentle threshold, then a soft rim)
    near = d < 16
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    bg = ndimage.binary_opening(bg, iterations=1) | (bg & (d < 8))
    alpha = (~bg).astype(np.float32)
    rim = ndimage.binary_dilation(bg, iterations=1) & ~bg
    alpha = np.where(rim, np.clip((d - 8) / 20, 0, 1), alpha)
    lab, k = ndimage.label(alpha > 0.5)
    if k > 1:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, k + 1))
        keep = 1 + int(np.argmax(sizes))
        alpha[(lab != keep) & (lab > 0)] = 0
    im = Image.fromarray(np.dstack([c, alpha * 255]).astype(np.uint8), 'RGBA')
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
    poses[n] = im
fx = {n: foot_x(im) for n, im in poses.items()}
atlas, place = pack(poses)
atlas.save(OUT / 'general-armour-off.webp', 'WEBP', quality=90, method=6)
frames = {n: {'x': place[n][0], 'y': place[n][1], 'w': im.width, 'h': im.height, 'ax': round(float(fx[n]), 1), 'ay': im.height} for n, im in poses.items()}
(OUT / 'general-armour-off.json').write_text(json.dumps({'sheet': 'general-armour-off.webp', 'size': {'w': atlas.width, 'h': atlas.height},
                                                        'anchor': 'middle of the feet', 'scale': 'one scale for all eight (as painted)', 'frames': frames}, indent=1))
checker(atlas).save(OUT / 'check-general-armour-off.jpg', quality=85)
print('general-armour-off', atlas.size, (OUT / 'general-armour-off.webp').stat().st_size, {n: (f['w'], f['h']) for n, f in frames.items()})
