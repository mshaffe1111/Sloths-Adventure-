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
SHEETS_V2 = ROOT / 'reference' / 'animation-sheets' / 'slomatt' / 'standard-set-v2'
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
# ---------------------------------------------------------------------------------------------------------------------------------------------
# The second round of sheets (standard-set-v2, 2026-10-20 evening). Not every sheet is better than its first-round twin, so this set takes each state from
# whichever sheet draws it best, and the sheets are named by key: a number is a first-round sheet, 'vN' a second-round one.
# Build it with:  python3 scripts/cutStandard.py --set v2
# ---------------------------------------------------------------------------------------------------------------------------------------------
V2_FILES = {
    'v1': '01_turnaround-idle-blinks-tilts.jpg', 'v2a': '02a_walk-and-run.jpg', 'v2b': '02b_walk-and-run-second-take.jpg', 'v3': '03_jump-fall-land-climb.jpg',
    'v4': '04_vine-crossing-branch-crawl-swing.jpg', 'v5': '05_attacks-and-object-interactions.jpg', 'v6': '06_hit-knockback-tumble-defeat.jpg',
    'v13': '13_swim-dive-glide.jpg', 'v14': '14_aim-items-wall-and-air-moves.jpg', 'v15': '15_air-attacks-stomp-bounce-spring.jpg',
}
PATHS = {**{n: SHEETS / f for n, f in enumerate(FILES, 1)}, **{k: SHEETS_V2 / f for k, f in V2_FILES.items()}}
# every sheet was drawn at its own size (the character is 181 px tall on one and 211 on another), so each sheet is scaled to the same standing height before
# packing. The reference is a few plain standing frames (a walk's frames for a walk sheet): their median height is "standing height" on that sheet.
STAND_TARGET = 200
STAND_REF = {
    'v1': [9, 10, 11, 12], 'v2a': [1, 2, 3, 4, 5, 6, 7, 8], 'v2b': [1, 2, 5, 6], 'v3': [5, 6, 9, 11, 13, 15], 'v4': [2, 5, 6], 'v5': [1, 4, 7, 8], 'v6': [3, 4, 5, 8],
    'v13': [1, 2, 4], 'v14': [1, 2, 5, 6],
    3: [8],  # first-round jump sheet (only its climb is used)
}
# a sheet with no plain standing frame to measure (every pose on it is an attack, a stomp or a spring) takes another sheet's scale: the heads match
STAND_LIKE = {'v15': 'v14'}
# sheets whose figures hang on or swing from a line: the line is drawn into the picture, but the game draws its own, so thin long strokes are cut away
STRIP_LINES = {'v4'}
V2_USED = {
    'idle': ('v1', 9), 'blink': ('v1', 10),
    # the walk is the second take (more movement between frames), the run the first (an even spacing between frames)
    **{f'walk_{i}': ('v2b', i + 1) for i in range(8)},
    **{f'run_{i}': ('v2a', i + 9) for i in range(8)},
    # a jump: stretch at take-off, the rise, arms out at the top, then two falling frames and the crouched landing
    'launch': ('v3', 2), 'rise_fast': ('v3', 3), 'rise': ('v3', 3), 'apex': ('v3', 4), 'fall_a': ('v3', 5), 'fall_b': ('v3', 6), 'land': ('v3', 7), 'recover': ('v3', 1),
    # climbing: the first-round sheet's reach-and-step frames (the new sheet's climb frames let go of the rope every other frame)
    **{f'climb_{i}': (3, i + 9) for i in range(8)},
    'hang_a': ('v4', 1), 'hang_b': ('v4', 4), 'hang_c': ('v4', 8),
    'swing_grip': ('v4', 4), 'swing_back': ('v4', 14), 'swing_pull': ('v4', 15), 'swing_top': ('v4', 16),
    'tuck': ('v14', 13), 'tumble': ('v14', 14),
    'duck': ('v3', 8),
    'punch_0': ('v5', 1), 'punch_1': ('v5', 4), 'punch_2': ('v5', 2), 'punch_3': ('v5', 3), 'punch_4': ('v5', 3),
    'kick_0': ('v5', 9), 'kick_1': ('v5', 11), 'kick_2': ('v5', 10), 'kick_3': ('v5', 9),
    'mega_0': ('v5', 5), 'mega_1': ('v5', 6), 'mega_2': ('v5', 7), 'mega_3': ('v5', 16),
    'hurt_a': ('v6', 2), 'hurt_b': ('v6', 1), 'hurt_c': ('v6', 6), 'ko': ('v6', 15),
    'cheer_a': ('v14', 7), 'cheer_b': ('v14', 8),
    # in the air: a punch and a kick (wind-up, hit, recovery), the stomp dive, the rebound off an enemy's head, and the mushroom spring
    **{f'air_punch_{i}': ('v15', i + 1) for i in range(3)},
    **{f'air_kick_{i}': ('v15', i + 4) for i in range(3)},
    'stomp_start': ('v15', 7), 'stomp_plunge': ('v15', 8), 'stomp_impact': ('v15', 9), 'stomp_rebound': ('v15', 10),
    'bounce_squash': ('v15', 11), 'bounce_rise': ('v15', 12), 'bounce_top': ('v15', 13),
    'spring_squash': ('v15', 14), 'spring_launch': ('v15', 15), 'spring_rise': ('v15', 16),
}


# back-view frames drawn with the satchel strap on the wrong diagonal (see slomatt/standard-set/NOTES.md). From behind the strap must run "\" with the
# bag at screen right; these run "/", so they are mirrored when packed. A back view is nearly symmetrical, so this only turns the lean the other way.
# Keyed by sheet file name -> frame numbers (reading order). Nothing here is packed yet: no back view is in USED until the sliding stage is built.
MIRROR = {
    '09_behind-the-back.jpg': [*range(1, 9), *range(10, 17)],  # every frame except 9, the hill butt-slide
    '09_back-views.jpg': [15, 16],
}


def mirrored(rgb, a):
    """The same figure turned left to right."""
    return np.ascontiguousarray(rgb[:, ::-1]), np.ascontiguousarray(a[:, ::-1])


def figure(figs, s, j, scale=1.0):
    """Frame j (1-16) of sheet s (a key of PATHS), with the strap fix applied when that frame is in MIRROR, and scaled to the standing height when asked."""
    rgb, a = figs[s][j - 1]
    if j in MIRROR.get(PATHS[s].name, ()):
        rgb, a = mirrored(rgb, a)
    if abs(scale - 1) > 0.004:
        h, w = a.shape
        size = (max(1, round(w * scale)), max(1, round(h * scale)))
        rgb = cv2.resize(rgb, size, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
        a = cv2.resize(a, size, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
    return np.ascontiguousarray(rgb), np.ascontiguousarray(a)


def stand_scale(figs, key):
    """the factor that brings this sheet's standing height to STAND_TARGET"""
    hs = [int((figs[key][j - 1][1] > 128).any(1).sum()) for j in STAND_REF[key]]
    return STAND_TARGET / float(np.median(hs))


# the frame the standing height is measured on (the game scales every frame by the same amount, so this one is HERO_UNITS tall)
STAND = 'idle'
ATLAS_W = 1536
GAP = 4


GAP_MIN = 55  # an enclosed patch of background at least this big is a gap (between an arm and the body, under a hand on a line), not an eye's white (~30 px)


def strip_lines(m, min_len=45):
    """cut away the long thin strokes (a rope or vine drawn into the picture): whatever an opening with a 7 px disc removes and that is at least min_len long"""
    body = cv2.dilate(cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))), np.ones((5, 5), np.uint8))
    thin = (m > 0) & (body == 0)
    lb, n = ndi.label(thin, structure=np.ones((3, 3)))
    for i in range(1, n + 1):
        ys, xs = np.where(lb == i)
        if max(np.ptp(ys), np.ptp(xs)) >= min_len:
            m[lb == i] = 0
    return m


def cut_sheet(path, open_gaps=False, lines=False):
    """Returns the 16 figures of one sheet in reading order, each (rgb crop, alpha crop uint8) with a 3 px margin.
    open_gaps: background enclosed by the figure (the gap between an arm and the body) becomes transparent instead of a patch of the sheet's colour (needed
    on a white sheet; the first-round grey sheets are cut without it so their atlas stays as it was). lines: cut away a rope or vine drawn into the picture."""
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
    gaps = np.zeros(fg.shape, bool)
    if open_gaps:
        sizes = ndi.sum(np.ones_like(lab_n), lab_n, range(1, lab_n.max() + 1))
        big = [k for k, sz in enumerate(sizes, 1) if sz >= GAP_MIN and k not in edge_ids]
        gaps = np.isin(lab_n, big)
        fg[gaps] = 0
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
        if open_gaps:
            m[gaps] = 0
        if lines:
            m = strip_lines(m)
            yy, xx = np.where(m > 0)
            y0, y1, x0, x1 = yy.min(), yy.max(), xx.min(), xx.max()  # the crop closes in on what is left
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
    ap.add_argument('--set', choices=['old', 'v2'], default='old', help="old: the first-round sheets 1-8 (what the game uses today); v2: the second round, each state from its best sheet")
    ap.add_argument('--library', action='store_true', help='also write all the figures as transparent PNGs')
    ap.add_argument('--out', default=None, help='folder for --library output; with --preview, where the atlas and data go instead of src/')
    ap.add_argument('--preview', action='store_true', help='write the atlas and data into --out instead of over the game files')
    ap.add_argument('--quality', type=int, default=80)
    args = ap.parse_args()

    if args.set == 'old':
        used, scaled = USED, False
        keys = list(range(1, len(FILES) + 1))
    else:
        used, scaled = V2_USED, True
        keys = sorted({s for s, _ in V2_USED.values()} | {s for s, _ in FACES.values()}, key=str)

    figs = {}
    for k in keys:
        v2sheet = isinstance(k, str)
        figs[k] = cut_sheet(PATHS[k], open_gaps=v2sheet, lines=(k in STRIP_LINES))
        print(f'sheet {k}: 16 figures')
    scale = {k: (stand_scale(figs, k) if scaled and k in STAND_REF else 1.0) for k in keys}
    for k, like in STAND_LIKE.items():
        if scaled and k in scale and like in scale:
            scale[k] = scale[like]
    if scaled:
        print('scale to standing height', {str(k): round(v, 3) for k, v in scale.items()})
    if args.library:
        out = Path(args.out or 'standard-cutouts')
        out.mkdir(parents=True, exist_ok=True)
        for n, lst in figs.items():
            for j, (rgb, a) in enumerate(lst, 1):
                Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(out / f's{n}_{j:02d}.png')
        print('library written to', out)

    # one picture per (sheet, frame): names that point at the same frame share it
    items, meta, home = [], {}, {}
    for name, (s, j) in used.items():
        if (s, j) in home:
            continue
        home[(s, j)] = name
        rgb, a = figure(figs, s, j, scale[s])
        ax, ay, hx, bb = anchors(a)
        items.append((name, rgb, a))
        meta[name] = dict(ax=ax, ay=ay, hx=hx, w=a.shape[1], h=a.shape[0], bh=bb[3] - bb[1] + 1)
    for name, (s, j) in FACES.items():
        rgb, a = figure(figs, s, j)
        hr, ha = head_square(rgb, a)
        ha = fade_bottom(ha)
        items.append((name, hr, ha))
        meta[name] = dict(ax=ha.shape[1] / 2, ay=ha.shape[0], hx=ha.shape[1] / 2, w=ha.shape[1], h=ha.shape[0], bh=ha.shape[0])
    atlas, pos = pack(items)
    img = Image.fromarray(atlas, 'RGBA')
    if args.preview:
        odir = Path(args.out or 'preview-out')
        odir.mkdir(parents=True, exist_ok=True)
        dst, data_dst = odir / 'hero-standard.webp', odir / 'heroStandardData.ts'
    else:
        dst, data_dst = ROOT / 'src' / 'assets' / 'hero' / 'hero-standard.webp', ROOT / 'src' / 'game' / 'heroStandardData.ts'
    img.save(dst, 'WEBP', quality=args.quality, alpha_quality=90, method=6)
    print(f'atlas {img.size[0]}x{img.size[1]}  {len(items)} pictures for {len(used) + len(FACES)} names  {dst.stat().st_size / 1024:.0f} KB')

    stand_h = meta[STAND]['bh']
    lines = [
        '/** Generated by scripts/cutStandard.py from the standard-set sheets. Frame rects and feet anchors, in atlas pixels. Do not edit by hand. */',
        'export interface StdFrame { x: number; y: number; w: number; h: number; ax: number; ay: number; /** x of the middle of the torso, for climbing and hanging */ hx: number }',
        f'export const STD_ATLAS_SIZE = {{ w: {img.size[0]}, h: {img.size[1]} }};',
        f'/** height of the standing frame, in atlas pixels (every frame is scaled by the same amount, so this one is HERO_UNITS tall) */',
        f'export const STD_STAND_H = {stand_h};',
        'export const STD_FRAMES: Record<string, StdFrame> = {',
    ]
    for name in list(used) + list(FACES):
        src = home[used[name]] if name in used else name
        m, (x, y) = meta[src], pos[src]
        lines.append(f"  {name}: {{ x: {x}, y: {y}, w: {m['w']}, h: {m['h']}, ax: {m['ax']:.1f}, ay: {m['ay']:.1f}, hx: {m['hx']:.1f} }},")
    lines.append('};')
    data_dst.write_text('\n'.join(lines) + '\n')
    print(f'wrote {data_dst}; standing frame', stand_h, 'px')


if __name__ == '__main__':
    main()
