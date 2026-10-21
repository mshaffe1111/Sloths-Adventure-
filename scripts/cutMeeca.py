#!/usr/bin/env python3
"""
Cuts Meeca out of the six standard-set sheets Matt drew (reference/animation-sheets/jennifur/standard-set/0N_*.jpg) and packs the frames the game uses
into src/assets/characters/meeca-standard.webp and src/game/meecaStandardData.ts. Modelled on cutStandard.py (Pokey's cutter), whose cutting helpers it uses.

  python3 scripts/cutMeeca.py              # pack the atlas and the data file
  python3 scripts/cutMeeca.py --preview D  # write them into folder D instead (with a numbered contact sheet of every frame and its anchors)
  python3 scripts/cutMeeca.py --library D  # also write every one of the 96 figures as a transparent PNG

The sheets are the standard format: 1024x1024, a 4x4 grid on one flat grey, no borders and no numbers, 16 figures in reading order (frame 1..16).
The grey reachable from the sheet's edge is the background and the figures are the 16 connected groups; the 2 px around the cut take their colour from
the nearest solid pixel inside, so there is no grey halo. All six sheets are drawn at one standing height (about 232 px, head circle about 50 px), so
every figure is scaled by the same amount; the head circle is measured on each sheet as a check and the sheet is corrected when it is off by more than 3% (raised arms make the measure unreliable below that).

What the sheets hold (frame numbers are reading order):
  1  turnaround (front, 3/4, side, back), idle breathing, blinks, head tilts
  2  walk, side view, 1-8 (the second four repeat the first: one leg phase only); run, three-quarter view, 9-16 (the same again, the head turned the other way)
  3  jump: crouch, rise, tuck, fall, landing 1-8; climb seen from behind 9-16
  4  climb, side view, hands overhead 1-8; dive 9-12; swing and leap 13-16
  5  guard and punches, kick, finisher; pick up, lift, pull, push
  6  hit recoil, knockback, tumble, get up, lying, kneeling, face down (defeat)
There is no sad, sob, scared, wave or cheer sheet yet. Those poses keep coming from the first atlas (the Gemini emotion cards), whose frames are kept in
reference/animation-sheets/jennifur/old-atlas/ and are cleaned (white patches between the legs, baked-in speech bubbles, dust and sparkles) and brought to the
same standing height here, so the two sets blend. Ask for sheets 7, 8, 10, 11 and 12 (see reference/animation-sheets/jennifur/NEXT_SHEETS.md) and they can go.

Anchors (all in atlas pixels of the packed frame, "ground" = the line the feet stand on):
  ax  x of the middle of the lowest part of the body (the feet)
  ay  the ground line: one past the lowest solid row. For a frame that shows her in the air this is where the lowest part of her is, and the animation lifts
      or drops the frame as a whole with dy (a jump arc), so the shadow and the landing stay on the real ground. `air: 1` marks those frames.
  hx  x of the middle of her head: what a walk or a run is lined up on, so the body travels smoothly and the feet swing under it
"""
import argparse
import json
import re
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cutStandard as cs  # noqa: E402  (the cutting helpers: cut_sheet, anchors, pack)
import spriteMeasure as sm  # noqa: E402  (head_x, planted_foot)

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'reference' / 'animation-sheets' / 'jennifur' / 'standard-set'
OLD = ROOT / 'reference' / 'animation-sheets' / 'jennifur' / 'old-atlas'
FILES = {
    1: '01_turnaround-idle-blinks-tilts.jpg', 2: '02_walk-and-run.jpg', 3: '03_jump-fall-land-climb.jpg',
    4: '04_vine-crossing-branch-crawl-swing.jpg', 5: '05_attacks-and-object-interactions.jpg', 6: '06_hit-knockback-tumble-defeat.jpg',
}

# the frame the standing height is measured on (the game scales every frame by the same amount, so this one is MEECA_UNITS tall)
STAND = 'idle'
STAND_PX = 206  # standing height in atlas pixels: the sheets are 232, so the atlas keeps 89% of the drawn resolution
REF_HEAD = 50.8  # head circle radius (px) the six sheets are drawn at; a sheet that measures off by more than 3% is corrected

# name -> (sheet, frame, air, mirror). air=1: the frame shows her off the ground, so its ground anchor is only "where the lowest part is" and the animation lifts it.
# mirror=1: the frame is drawn running to the LEFT, so it is turned to face right (the sheet's second run take faces the other way: its legs are the toe-off
# half of the stride that the first take lacks); the number on the bib is flipped back so it still reads 07.
NEW = {
    # standing: idle front, wide-eyed front, eyes closed (the blink), breathing in, singing, glad, sleepy, tilted look, looking aside, looking up
    'idle': (1, 1, 0, 0), 'idle_b': (1, 9, 0, 0), 'blink': (1, 12, 0, 0), 'breathe': (1, 10, 0, 0), 'sing': (1, 11, 0, 0), 'glad': (1, 13, 0, 0),
    'sleepy': (1, 14, 0, 0), 'tilt': (1, 16, 0, 0), 'look_a': (1, 2, 0, 0), 'look_up': (1, 8, 0, 0),
    # walk, side view (the second four frames repeat the first four's leg phase; all eight are kept, the gait picks them by where the planted foot is)
    **{f'walk_{i}': (2, i + 1, 0, 0) for i in range(8)},
    # run, three-quarter view: the first take, and the second take turned to face right (13, 14)
    'run_0': (2, 9, 0, 0), 'run_1': (2, 10, 0, 0), 'run_2': (2, 11, 0, 0), 'run_3': (2, 12, 0, 0), 'run_4': (2, 16, 0, 0), 'run_5': (2, 13, 0, 1), 'run_6': (2, 14, 0, 1),
    # jump: crouch, rise, tuck, fall, squash on landing, rise from it
    'crouch': (3, 1, 0, 0), 'jump_up': (3, 2, 1, 0), 'jump_tuck': (3, 3, 1, 0), 'jump_fall': (3, 4, 1, 0), 'land_b': (3, 6, 0, 0), 'land_c': (3, 7, 0, 0),
    # climb (side view, hands overhead), leap
    'climb_0': (4, 1, 0, 0), 'climb_1': (4, 2, 0, 0), 'climb_2': (4, 3, 0, 0), 'climb_3': (4, 5, 0, 0), 'climb_4': (4, 6, 0, 0), 'climb_5': (4, 8, 0, 0),
    'leap': (4, 15, 1, 0),
    # bending to pick something up (looking at what is on the ground)
    'pickup': (5, 13, 0, 0),
    # hurt, knocked back, down
    'hurt_a': (6, 1, 0, 0), 'hurt_b': (6, 2, 0, 0), 'knock_a': (6, 5, 1, 0), 'knock_b': (6, 6, 1, 0), 'lie': (6, 12, 0, 0), 'kneel_a': (6, 13, 0, 0), 'prone_a': (6, 15, 0, 0),
}
# the frames a walk or a run is built from: the gait keeps a stance foot still on the ground, so these carry the planted foot's place (`fx`)
GAIT = [n for n in NEW if n.startswith('walk_') or n.startswith('run_')]
# frames where both feet are down and the weight is on the rear one (the push-off at the end of a step): the silhouette cannot say, the sheet's order does
REAR = {'walk_7': 'rear'}
# frames kept from the first atlas (no new sheet has them yet): name -> (old frame name, air)
OLD_USED = {
    'scared': ('scared', 0), 'shiver': ('shiver', 0), 'look_l': ('lookL', 0), 'lament': ('lament', 0),
    'alarm': ('wave2', 0), 'panic_up': ('hopup', 1),
    'sad': ('sad', 0), 'sob': ('sob', 0), 'wipe': ('wipe', 0), 'slump': ('slump', 0), 'dwalk_a': ('dwalk1', 0), 'dwalk_b': ('dwalk2', 0),
    'wave': ('wave', 0),
}
OLD_STAND_H = 199  # the first atlas's standing frames ('sad', 'scared') were 199 px tall


OUTLINE = np.array([54, 35, 26], np.uint8)  # the dark brown the new sheets outline her in


def clean_old(rgb, a):
    """a first-atlas frame made fit to stand beside the new ones. The old cards were cut with a dotted dark fringe, holes and a white fill between the legs, and
    some carry a baked-in speech bubble, dust puff or star. So: only the largest solid group stays (the extras are separate groups); holes in the figure are
    filled; the white patch between the legs is cut away again; and the edge is redrawn as one clean dark outline (a few pixels in from the old fringe)."""
    solid = a > 128
    lb, n = ndi.label(solid)
    if n > 1:
        sizes = ndi.sum(solid, lb, range(1, n + 1))
        solid = lb == (1 + int(np.argmax(sizes)))
    ys, xs = np.where(solid)
    y0, y1 = ys.min(), ys.max()
    low = np.zeros_like(solid)
    low[int(y0 + 0.66 * (y1 - y0)):, :] = True
    white = (rgb.min(axis=2) > 238) & solid & low
    lw, nw = ndi.label(white)
    gap = np.zeros_like(solid)
    for k in range(1, nw + 1):
        if (lw == k).sum() >= 40:
            gap |= lw == k
    filled = ndi.binary_fill_holes(solid) & ~cv2.dilate(gap.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    # colour for everything that is not solid body (holes, gap edges) comes from the nearest solid pixel
    body = solid & ~gap
    _, idx = ndi.distance_transform_edt(~body, return_indices=True)
    rgb = rgb[idx[0], idx[1]]
    ell = lambda k: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    core = cv2.erode(filled.astype(np.uint8), ell(5)).astype(bool)
    outer = cv2.dilate(core.astype(np.uint8), ell(7)).astype(bool)
    rgb = rgb.copy()
    rgb[outer & ~core] = OUTLINE
    out = cv2.GaussianBlur(np.where(outer, 255, 0).astype(np.float32), (0, 0), 0.8).clip(0, 255).astype(np.uint8)
    return np.ascontiguousarray(rgb), out


def find_bib(rgb, a):
    """the cream race bib on her chest (x0, x1, y0, y1), or None when it is hidden or turned edge-on. The biggest cream blob in the middle of the body that is mostly cream
    (a bib is a rectangle) with a lot of dark in it, the digits and the border (the face is cream too, but its dark is only the eyes and the nose)."""
    ys, xs = np.where(a > 128)
    y0, y1 = ys.min(), ys.max()
    h = y1 - y0 + 1
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    cream = (r > 185) & (g > 165) & (b > 145) & ((r - b) < 80) & (a > 200)
    dark = (r + g + b < 360) & (a > 200)
    zone = np.zeros_like(cream)
    zone[int(y0 + 0.28 * h):int(y0 + 0.80 * h), :] = True
    cream &= zone
    lb, n = ndi.label(cv2.dilate(cream.astype(np.uint8), np.ones((3, 3), np.uint8)))
    best = None
    for k in range(1, n + 1):
        yy, xx = np.where((lb == k) & cream)
        if len(yy) < 80:
            continue
        bx0, bx1, by0, by1 = xx.min(), xx.max(), yy.min(), yy.max()
        bw, bh = bx1 - bx0 + 1, by1 - by0 + 1
        if bw < 14 or bh < 10 or bw > bh * 2.6 or bw < bh * 0.62:
            continue
        fill = len(yy) / float(bw * bh)
        digits = dark[by0:by1 + 1, bx0:bx1 + 1].mean()
        if not 0.25 < fill < 0.75 or not 0.15 < digits < 0.58:
            continue
        if best is None or len(yy) > best[0]:
            best = (len(yy), bx0, bx1, by0, by1)
    return None if best is None else best[1:]


# frames where the box the finder gives is not the bib (a muzzle, a bib half under an arm or turned edge-on): the number stays as drawn
NO_BIB = {'shiver', 'hurt_b', 'slump', 'climb_4', 'climb_5', 'land_b', 'pickup', 'lament', 'sob'}


def bib_readable(bb):
    """a bib seen square enough to read the number on it (turned edge-on, it is a sliver whose mirror image nobody can read, and its box is only part of the bib)"""
    return bool(bb) and (bb[1] - bb[0] + 1) >= 0.85 * (bb[3] - bb[2] + 1)


def mirror_fix(rgb, a):
    """a frame turned to face the other way, with the number on the bib turned back so it still reads 07 (a mirrored print would read backwards)"""
    rgb, a = cs.mirrored(rgb, a)
    bb = find_bib(rgb, a)
    if bb:
        x0, x1, y0, y1 = bb
        rgb = rgb.copy()
        rgb[y0:y1 + 1, x0:x1 + 1] = rgb[y0:y1 + 1, x0:x1 + 1][:, ::-1].copy()
    return rgb, a


def head_radius(a):
    m = (a > 128).astype(np.uint8)
    ys, xs = np.where(m > 0)
    y0, y1 = ys.min(), ys.max()
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    dt[y0 + int((y1 - y0) * 0.5):] = 0
    return float(dt.max())


def sheet_scale(figs):
    """the correction that brings this sheet's head circle to REF_HEAD (the upper quartile of the frames, which ignores heads that are tilted or hidden)"""
    rs = [head_radius(a) for _, a in figs]
    return float(REF_HEAD / np.percentile(rs, 75))


def resized(rgb, a, k):
    if abs(k - 1) < 0.004:
        return np.ascontiguousarray(rgb), np.ascontiguousarray(a)
    h, w = a.shape
    size = (max(1, round(w * k)), max(1, round(h * k)))
    interp = cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC
    return np.ascontiguousarray(cv2.resize(rgb, size, interpolation=interp)), np.ascontiguousarray(cv2.resize(a, size, interpolation=interp))


def anchors_of(a):
    ax, ay, _, bb = cs.anchors(a)
    return ax, ay, sm.head_x(a), bb


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', default=None, help='folder: write the atlas, the data and a contact sheet there instead of over the game files')
    ap.add_argument('--library', default=None, help='folder: also write every figure of the six sheets as a transparent PNG')
    ap.add_argument('--quality', type=int, default=66)
    ap.add_argument('--stand', type=int, default=STAND_PX)
    args = ap.parse_args()

    figs = {}
    for n, f in FILES.items():
        figs[n] = cs.cut_sheet(SHEETS / f, open_gaps=True)
    corr = {n: sheet_scale(figs[n]) for n in figs}
    print('head-circle correction per sheet', {n: round(v, 3) for n, v in corr.items()})
    for n, v in corr.items():
        if abs(v - 1) <= 0.03:
            corr[n] = 1.0
    if args.library:
        out = Path(args.library)
        out.mkdir(parents=True, exist_ok=True)
        for n, lst in figs.items():
            for j, (rgb, a) in enumerate(lst, 1):
                Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(out / f's{n}_{j:02d}.png')

    # one scale for everything: the standing frame comes out STAND_PX tall
    srgb, sa = figs[NEW[STAND][0]][NEW[STAND][1] - 1]
    stand_native = int((sa > 128).any(1).sum()) * corr[NEW[STAND][0]]
    g = args.stand / stand_native
    print(f'standing frame {stand_native:.0f} px on the sheet -> {args.stand} px in the atlas (x{g:.3f})')

    items, meta = [], {}
    for name, (sh, j, air, mir) in NEW.items():
        rgb, a = figs[sh][j - 1]
        if mir:
            rgb, a = mirror_fix(rgb, a)
        rgb, a = resized(rgb, a, g * corr[sh])
        ax, ay, hx, bb = anchors_of(a)
        fx = sm.planted_foot(a, REAR.get(name, 'front'))[0] if name in GAIT else 0.0
        bib = find_bib(rgb, a)
        items.append((name, rgb, a))
        meta[name] = dict(bib=bib, ax=ax, ay=ay, hx=hx, fx=fx, w=a.shape[1], h=a.shape[0], air=air, s=1.0, bh=bb[3] - bb[1] + 1, src=f's{sh}f{j}{"m" if mir else ""}')

    # the first atlas's frames, cleaned and given the draw scale that brings them to the same standing height as the new frames
    old_png = Image.open(OLD / 'jennifur-atlas.webp').convert('RGBA')
    old_json = json.loads((OLD / 'jennifur-atlas.json').read_text())
    old_s = args.stand / OLD_STAND_H
    for name, (oname, air) in OLD_USED.items():
        fr = old_json[oname]
        crop = np.array(old_png.crop((fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h'])))
        rgb, a = clean_old(crop[..., :3].copy(), crop[..., 3].copy())
        ax, ay, hx, bb = anchors_of(a)
        items.append((name, np.ascontiguousarray(rgb), np.ascontiguousarray(a)))
        meta[name] = dict(bib=find_bib(rgb, a), ax=ax, ay=ay, hx=hx, fx=0.0, w=a.shape[1], h=a.shape[0], air=air, s=old_s, bh=bb[3] - bb[1] + 1, src=f'old:{oname}')

    cs.ATLAS_W = 1280
    atlas, pos = cs.pack(items)
    img = Image.fromarray(atlas, 'RGBA')
    if args.preview:
        odir = Path(args.preview)
        odir.mkdir(parents=True, exist_ok=True)
        dst, data_dst = odir / 'meeca-standard.webp', odir / 'meecaStandardData.ts'
    else:
        dst, data_dst = ROOT / 'src' / 'assets' / 'characters' / 'meeca-standard.webp', ROOT / 'src' / 'game' / 'meecaStandardData.ts'
    img.save(dst, 'WEBP', quality=args.quality, alpha_quality=80, method=6)
    print(f'atlas {img.size[0]}x{img.size[1]}  {len(items)} frames  {dst.stat().st_size / 1024:.0f} KB')

    stand_h = meta[STAND]['bh']
    lines = [
        '/** Generated by scripts/cutMeeca.py from the standard-set sheets in reference/animation-sheets/jennifur. Frame rects and ground anchors, in atlas pixels. Do not edit by hand. */',
        'export interface MeecaFrame {',
        '  x: number; y: number; w: number; h: number;',
        '  /** x of the middle of the feet, and the ground line (one past the lowest solid row), in pixels of the frame */',
        '  ax: number; ay: number;',
        '  /** x of the middle of the head (what a walk or run is lined up on) */',
        '  hx: number;',
        '  /** walk and run frames only: x of the foot that is on the ground relative to the head centre (pixels of the frame), what the gait keeps still on the ground */',
        '  fx?: number;',
        '  /** the race bib on her chest [x, y, w, h] in pixels of the frame, when it shows: the number on it is turned back when she is drawn mirrored, so it never reads 70 */',
        '  bib?: [number, number, number, number];',
        '  /** 1 = the frame shows her off the ground: ay is where the lowest part of her is, and the animation lifts the frame with dy */',
        '  air: 0 | 1;',
        '  /** draw scale of this frame next to the others (the first-atlas frames were drawn smaller and are enlarged when drawn) */',
        '  s: number;',
        '}',
        f'export const MEECA_ATLAS_SIZE = {{ w: {img.size[0]}, h: {img.size[1]} }};',
        '/** height of the standing frame ("idle") in atlas pixels: it is MEECA_UNITS tall in the game */',
        f'export const MEECA_STAND_H = {stand_h};',
        'export const MEECA_FRAMES: Record<string, MeecaFrame> = {',
    ]
    for name in list(NEW) + list(OLD_USED):
        m, (x, y) = meta[name], pos[name]
        fxs = f", fx: {m['fx']:.1f}" if name in GAIT else ''
        if name not in NO_BIB and bib_readable(m['bib']):
            bx0, bx1, by0, by1 = m['bib']
            fxs += f", bib: [{bx0 - 1}, {by0 - 1}, {bx1 - bx0 + 3}, {by1 - by0 + 3}]"
        lines.append(f"  {name}: {{ x: {x}, y: {y}, w: {m['w']}, h: {m['h']}, ax: {m['ax']:.1f}, ay: {m['ay']:.1f}, hx: {m['hx']:.1f}{fxs}, air: {m['air']}, s: {m['s']:.4f} }},")
    lines.append('};')
    data_dst.write_text('\n'.join(lines) + '\n')
    print(f'wrote {data_dst}')

    if args.preview:
        cell = (200, 270)
        cols = 8
        names = list(NEW) + list(OLD_USED)
        rows = (len(names) + cols - 1) // cols
        S = Image.new('RGB', (cell[0] * cols, cell[1] * rows), (70, 90, 110))
        d = ImageDraw.Draw(S)
        for i, name in enumerate(names):
            m, (x, y) = meta[name], pos[name]
            im = img.crop((x, y, x + m['w'], y + m['h']))
            sc = m['s']
            if sc != 1:
                im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
            c, r = i % cols, i // cols
            gx, gy = c * cell[0] + cell[0] // 2, r * cell[1] + cell[1] - 14
            S.paste(im, (round(gx - m['ax'] * sc), round(gy - m['ay'] * sc)), im)
            d.line([(c * cell[0] + 4, gy), (c * cell[0] + cell[0] - 4, gy)], fill=(255, 0, 255))
            d.line([(gx, gy - 6), (gx, gy + 6)], fill=(0, 255, 255))
            d.line([(round(gx - m['ax'] * sc + m['hx'] * sc), gy - 12), (round(gx - m['ax'] * sc + m['hx'] * sc), gy)], fill=(255, 255, 0))
            if name not in NO_BIB and bib_readable(m['bib']):
                bx0, bx1, by0, by1 = m['bib']
                d.rectangle([gx + (bx0 - m['ax']) * sc, gy + (by0 - m['ay']) * sc, gx + (bx1 - m['ax']) * sc, gy + (by1 - m['ay']) * sc], outline=(255, 40, 40))
            d.text((c * cell[0] + 3, r * cell[1] + 3), f"{name} {m['src']}{' AIR' if m['air'] else ''}{' fx%+.0f' % m['fx'] if name in GAIT else ''}", fill=(255, 255, 0))
        S.save(odir / 'meeca-contact.png')


if __name__ == '__main__':
    main()
