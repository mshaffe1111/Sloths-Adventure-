#!/usr/bin/env python3
"""
Cuts Slomatt out of the eight standard-set sheets (reference/animation-sheets/slomatt/standard-set/0N_*.jpg) and packs the frames the game uses.

  python3 scripts/cutStandard.py            # packs src/assets/hero/hero-standard.webp and src/game/heroStandardData.ts
  python3 scripts/cutStandard.py --library  # also writes every one of the 128 figures as a transparent PNG to the folder given by --out

The standard set is the format new sheets follow: 1024x1024, a 4x4 grid on one flat grey, no borders and no numbers. That is what makes this
cutter simple: the grey that can be reached from the sheet's edge is the background, everything else is a figure, and the figures are the
16 connected groups (each pose, even with a raised arm, is one group). Reading order (left to right, top to bottom) is the frame number, 1..16.

Edges: the outline's own pixels are kept; the 2 px around the cut take their colour from the nearest solid pixel inside, so there is no grey halo.
"""
import argparse
import json
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'reference' / 'animation-sheets' / 'slomatt' / 'standard-set'
FILES = [
    '01_turnaround-idle-blinks-tilts.jpg', '02_walk-and-run.jpg', '03_jump-fall-land-climb.jpg', '04_vine-crossing-branch-crawl-swing.jpg',
    '05_attacks-and-object-interactions.jpg', '06_hit-knockback-tumble-defeat.jpg', '07_slide-roll-ledge.jpg', '08_victory-anger-relief-stun.jpg',
]

# the frames the game uses: name -> (sheet, frame). Names say what the pose is for, not where it came from.
USED = {
    # standing
    'idle': (1, 6), 'blink': (1, 11),
    # moving: a slow walk, and the longer stride the hero runs in
    **{f'walk_{i}': (2, i + 1) for i in range(8)},
    **{f'run_{i}': (2, i + 9) for i in range(8)},
    # a jump, from the crouch to the landing
    'launch': (3, 1), 'rise': (3, 2), 'rise_fast': (3, 3), 'apex': (3, 4), 'fall_a': (3, 5), 'fall_b': (3, 6), 'land': (3, 7), 'recover': (3, 8),
    # climbing, hand over hand
    **{f'climb_{i}': (3, i + 9) for i in range(8)},
    # hanging from a rope, and swinging on a vine
    'hang_a': (4, 1), 'hang_b': (4, 6), 'hang_c': (4, 8),
    'swing_grip': (4, 3), 'swing_back': (4, 2), 'swing_pull': (4, 7), 'swing_top': (4, 4),
    # the double-jump flip
    'tuck': (7, 5), 'tumble': (7, 6),
    # ducking
    'duck': (7, 7),
    # punch (wind-up to full reach), kick, mega
    'punch_0': (5, 5), 'punch_1': (5, 1), 'punch_2': (5, 3), 'punch_3': (5, 7), 'punch_4': (5, 2),
    'kick_0': (5, 9), 'kick_1': (5, 10), 'kick_2': (5, 11), 'kick_3': (5, 12),
    'mega_0': (5, 13), 'mega_1': (5, 14), 'mega_2': (5, 15), 'mega_3': (5, 16),
    # hurt, and knocked out
    'hurt_a': (6, 3), 'hurt_b': (6, 5), 'hurt_c': (6, 6), 'ko': (6, 15),
    # celebrating
    'cheer_a': (8, 1), 'cheer_b': (8, 2),
}
# head portraits for the HUD and dialogue: name -> (sheet, frame)
FACES = {
    'face_calm': (1, 6), 'face_calm_closed': (1, 11), 'face_happy': (1, 14), 'face_wink': (1, 15), 'face_cheer': (8, 2), 'face_surprised': (8, 14),
    'face_hurt': (6, 3), 'face_angry': (8, 5), 'face_laugh': (8, 11), 'face_dizzy': (8, 13), 'face_worried': (8, 15), 'face_tired': (8, 16),
}
# the frame the standing height is measured on (the game scales every frame by the same amount, so this one is HERO_UNITS tall)
STAND = 'idle'
ATLAS_W = 1536
GAP = 4


def cut_sheet(path):
    """Returns the 16 figures of one sheet in reading order, each (rgb crop, alpha crop uint8) with a 3 px margin."""
    bgr = cv2.imread(str(path))
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    H, W, _ = rgb.shape
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    ring = np.concatenate([lab[:6].reshape(-1, 3), lab[-6:].reshape(-1, 3), lab[:, :6].reshape(-1, 3), lab[:, -6:].reshape(-1, 3)])
    bg = np.median(ring, 0)
    d = np.linalg.norm(lab - bg, axis=2)
    lab_n, _ = ndi.label(d < 14)
    edge_ids = set(np.unique(np.concatenate([lab_n[0], lab_n[-1], lab_n[:, 0], lab_n[:, -1]]))) - {0}
    fg = (~np.isin(lab_n, list(edge_ids))).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    grp, ng = ndi.label(cv2.dilate(fg, np.ones((9, 9), np.uint8)))
    comps = []
    for k in range(1, ng + 1):
        ys, xs = np.where((grp == k) & (fg > 0))
        if len(ys) < 4000:
            continue  # specks and sparkles
        comps.append((ys.min(), ys.max(), xs.min(), xs.max(), k))
    if len(comps) != 16:
        raise SystemExit(f'{path.name}: expected 16 figures, found {len(comps)}')
    comps.sort(key=lambda c: (round(((c[0] + c[1]) / 2) / (H / 4) - 0.5), (c[2] + c[3]) / 2))
    out = []
    for (y0, y1, x0, x1, k) in comps:
        m = ndi.binary_fill_holes(((grp == k) & (fg > 0))).astype(np.uint8)
        core = cv2.erode(m, np.ones((5, 5), np.uint8)).astype(bool)  # solid colour, 2 px in from the cut
        _, idx = ndi.distance_transform_edt(~core, return_indices=True)
        bleed = rgb[idx[0], idx[1]]
        rgb2 = np.where(core[..., None], rgb, bleed)
        a = cv2.GaussianBlur(cv2.erode(m, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 0.8)
        pad = 3
        ys0, ys1, xs0, xs1 = max(0, y0 - pad), min(H, y1 + pad + 1), max(0, x0 - pad), min(W, x1 + pad + 1)
        out.append((rgb2[ys0:ys1, xs0:xs1].copy(), (a[ys0:ys1, xs0:xs1] * 255).astype(np.uint8)))
    return out


def anchors(alpha):
    """feet x (the middle of the lowest part of the body), feet y (the lowest solid row), the x of the middle of the torso (what a climb or a hang
    is lined up on: the raised hand would jump from side to side as the arms change), and the bbox"""
    ys, xs = np.where(alpha > 128)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    h = y1 - y0 + 1
    low = ys > y1 - max(6, int(h * 0.1))
    ax = float(np.median(xs[low]))
    band = (ys > y0 + 0.25 * h) & (ys < y0 + 0.65 * h)
    hx = float(np.median(xs[band]))
    return ax, float(y1 + 1), hx, (x0, y0, x1, y1)


def head_square(rgb, alpha):
    """the head as a square crop: the biggest round blob in the upper half of the figure (a raised arm is thinner than a head)"""
    ys, xs = np.where(alpha > 128)
    y0, y1 = ys.min(), ys.max()
    dt = cv2.distanceTransform((alpha > 128).astype(np.uint8), cv2.DIST_L2, 5)
    lim = y0 + int((y1 - y0) * 0.5)
    sub = dt.copy()
    sub[lim:] = 0
    cy, cx = np.unravel_index(np.argmax(sub), sub.shape)
    r = sub[cy, cx]
    half = int(r * 1.45)
    # slightly above the blob's middle: the ears and tuft sit above it, the chin below
    cy = int(cy - r * 0.05)
    h, w = alpha.shape
    pad = half + 2
    rgbp = np.pad(rgb, ((pad, pad), (pad, pad), (0, 0)), mode='edge')
    ap = np.pad(alpha, ((pad, pad), (pad, pad)))
    ox, oy = cx + pad, cy + pad
    return rgbp[oy - half:oy + half, ox - half:ox + half], ap[oy - half:oy + half, ox - half:ox + half]


def fade_bottom(alpha, frac=0.18):
    """let the bottom of a head portrait fade out, so the square crop does not leave a hard edge across the shoulders"""
    h = alpha.shape[0]
    n = max(1, int(h * frac))
    ramp = np.ones(h, np.float32)
    ramp[h - n:] = np.linspace(1, 0, n)
    return (alpha.astype(np.float32) * ramp[:, None]).astype(np.uint8)


def pack(items):
    """shelf-pack [(name, rgb, alpha)] into one atlas. Returns the RGBA atlas and {name: (x, y)}"""
    order = sorted(items, key=lambda t: -t[1].shape[0])
    x = y = shelf_h = 0
    pos = {}
    for name, rgb, a in order:
        h, w = a.shape
        if x + w + GAP > ATLAS_W:
            x, y, shelf_h = 0, y + shelf_h + GAP, 0
        pos[name] = (x, y)
        x += w + GAP
        shelf_h = max(shelf_h, h)
    H = y + shelf_h + GAP
    atlas = np.zeros((H, ATLAS_W, 4), np.uint8)
    for name, rgb, a in order:
        px, py = pos[name]
        h, w = a.shape
        atlas[py:py + h, px:px + w, :3] = rgb
        atlas[py:py + h, px:px + w, 3] = a
    return atlas, pos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--library', action='store_true', help='also write all 128 figures as transparent PNGs')
    ap.add_argument('--out', default=None, help='folder for --library output')
    ap.add_argument('--quality', type=int, default=80)
    args = ap.parse_args()

    figs = {}
    for n, f in enumerate(FILES, 1):
        figs[n] = cut_sheet(SHEETS / f)
        print(f'sheet {n}: 16 figures')
    if args.library:
        out = Path(args.out or 'standard-cutouts')
        out.mkdir(parents=True, exist_ok=True)
        for n, lst in figs.items():
            for j, (rgb, a) in enumerate(lst, 1):
                Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(out / f's{n}_{j:02d}.png')
        print('library written to', out)

    items, meta = [], {}
    for name, (s, j) in USED.items():
        rgb, a = figs[s][j - 1]
        ax, ay, hx, bb = anchors(a)
        items.append((name, rgb, a))
        meta[name] = dict(ax=ax, ay=ay, hx=hx, w=a.shape[1], h=a.shape[0], bh=bb[3] - bb[1] + 1)
    for name, (s, j) in FACES.items():
        rgb, a = figs[s][j - 1]
        hr, ha = head_square(rgb, a)
        ha = fade_bottom(ha)
        items.append((name, hr, ha))
        meta[name] = dict(ax=ha.shape[1] / 2, ay=ha.shape[0], hx=ha.shape[1] / 2, w=ha.shape[1], h=ha.shape[0], bh=ha.shape[0])
    atlas, pos = pack(items)
    img = Image.fromarray(atlas, 'RGBA')
    dst = ROOT / 'src' / 'assets' / 'hero' / 'hero-standard.webp'
    img.save(dst, 'WEBP', quality=args.quality, alpha_quality=90, method=6)
    print(f'atlas {img.size[0]}x{img.size[1]}  {len(items)} frames  {dst.stat().st_size / 1024:.0f} KB')

    stand_h = meta[STAND]['bh']
    lines = [
        '/** Generated by scripts/cutStandard.py from the standard-set sheets. Frame rects and feet anchors, in atlas pixels. Do not edit by hand. */',
        'export interface StdFrame { x: number; y: number; w: number; h: number; ax: number; ay: number; /** x of the middle of the torso, for climbing and hanging */ hx: number }',
        f'export const STD_ATLAS_SIZE = {{ w: {img.size[0]}, h: {img.size[1]} }};',
        f'/** height of the standing frame, in atlas pixels (every frame is scaled by the same amount, so this one is HERO_UNITS tall) */',
        f'export const STD_STAND_H = {stand_h};',
        'export const STD_FRAMES: Record<string, StdFrame> = {',
    ]
    for name in list(USED) + list(FACES):
        m, (x, y) = meta[name], pos[name]
        lines.append(f"  {name}: {{ x: {x}, y: {y}, w: {m['w']}, h: {m['h']}, ax: {m['ax']:.1f}, ay: {m['ay']:.1f}, hx: {m['hx']:.1f} }},")
    lines.append('};')
    (ROOT / 'src' / 'game' / 'heroStandardData.ts').write_text('\n'.join(lines) + '\n')
    print('wrote src/game/heroStandardData.ts; standing frame', stand_h, 'px')


if __name__ == '__main__':
    main()
