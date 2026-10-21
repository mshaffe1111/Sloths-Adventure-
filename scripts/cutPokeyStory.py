#!/usr/bin/env python3
"""
Cuts the cutscene poses of Slomatt (Pokey) out of the library sheets and packs them into src/assets/hero/hero-story.webp + src/game/heroStoryData.ts.
The game's own poses (idle, walk, run, jump, hurt, ko...) stay in hero-standard.webp; this atlas holds only what a story needs on top of them: sneaking,
shock, pointing and shouting, sulking, exhaustion, resolve, thinking, sleeping, the view from behind, and the faces. Modelled on cutStandard.py, whose
cutting helpers it uses.

  python3 scripts/cutPokeyStory.py              # pack the atlas and the data file
  python3 scripts/cutPokeyStory.py --preview D  # write them into folder D instead (with a numbered contact sheet)

Sheets (reference/animation-sheets/slomatt/standard-set, all four are 1024x1024 4x4 grids, 16 figures in reading order):
  09_behind-the-back.jpg      back views (a walk away, a run away, a slide). The satchel strap is drawn on the wrong diagonal from behind, so every back view
                              is mirrored (NOTES.md, cutStandard.MIRROR) except frame 9
  10_cutscene-acting.jpg      sneak, shock, point, shout, stop, impatient, sad, wiping tears, exhausted, slumped, determined, arms crossed, thumbs up
  11_dialogue-faces.jpg       head-and-shoulders portraits: mouth shapes and expressions
  12_cinematic-vignettes.jpg  falling, lying, sitting, searching the satchel, waving from behind, panic, hands on head, curled asleep
  12b_gestures-and-reactions.jpg  looking about, waving, hands on hips, pointing, cheering, puzzled
A figure is scaled so its head circle matches the head of the game's standing frame (the hero's idle in hero-standard.webp), so every frame stands at the same
size as the rest of him, whatever size the sheet drew it at.

Anchors, in atlas pixels of the packed frame: ax = x of the middle of the feet, ay = the ground line (one past the lowest solid row), hx = x of the middle of
the head. A walk is lined up on the head (the body travels smoothly, the feet swing under it), a pose on the feet.

The data file also carries `STD_HEAD` (head x of every body frame of the standard atlas) and `STD_FOOT` (for its walk and run frames: where the planted foot is
relative to the head). The story's gait picks the walk or run frame whose planted foot is where the ground says it should be, so the feet do not skate.
"""
import argparse
import re
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cutStandard as cs  # noqa: E402
import spriteMeasure as sm  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'reference' / 'animation-sheets' / 'slomatt' / 'standard-set'
FILES = {
    '09': '09_behind-the-back.jpg', '10': '10_cutscene-acting.jpg', '11': '11_dialogue-faces.jpg', '12': '12_cinematic-vignettes.jpg',
    '12b': '12b_gestures-and-reactions.jpg',
}
STD_ATLAS = ROOT / 'src' / 'assets' / 'hero' / 'hero-standard.webp'
STD_DATA = ROOT / 'src' / 'game' / 'heroStandardData.ts'
MIRROR_ALL_BUT = {'09': 9}  # back views: every frame but this one

# name -> (sheet, frame). Names say what the pose is for.
BODY = {
    # looking about, talking with the hands, thinking
    'look_a': ('12b', 1), 'talk_a': ('12b', 3), 'talk_b': ('12b', 4), 'look_up': ('12b', 9), 'look_down': ('12b', 10), 'think': ('12b', 14),
    # sneaking, shock, pointing and shouting
    'sneak_a': ('10', 1), 'sneak_b': ('10', 4), 'shock': ('10', 2), 'point_a': ('10', 3), 'shout_up': ('10', 5), 'point_b': ('10', 7), 'impatient': ('10', 8),
    # sad, crying, exhausted
    'sad_a': ('10', 9), 'wipe': ('10', 10), 'tired': ('10', 11), 'slump': ('10', 12),
    # determined, thumbs up
    'resolve': ('10', 13), 'crossed': ('10', 14), 'thumbs': ('10', 15), 'stance': ('10', 16),
    # alarm, cheering, worry, fear, sleep
    'alarm': ('12b', 8), 'cheer_c': ('12b', 13), 'worried': ('12', 15), 'scared': ('12', 14), 'sleep': ('12', 10),
    # from behind: standing, a walk away (frames 2-4), waving goodbye
    'away': ('09', 1), 'away_a': ('09', 2), 'away_b': ('09', 3), 'away_c': ('09', 4), 'farewell': ('12', 6),
}
# head-and-shoulders portraits from the dialogue sheet
FACES = {
    'face_neutral': ('11', 1), 'face_oh': ('11', 2), 'face_ah': ('11', 3), 'face_smile': ('11', 4), 'face_gasp': ('11', 5), 'face_scowl': ('11', 6),
    'face_smirk': ('11', 7), 'face_shout': ('11', 9), 'face_cry': ('11', 10), 'face_rage': ('11', 11), 'face_stars': ('11', 13),
    'face_sleep': ('11', 16),
}
FACE_PX = 188  # portraits are saved this many px square (the sheet's are about 200)

# the planted foot, where a silhouette cannot say. The standard hero's own sheet is the one measured; see spriteMeasure.planted_foot. (None needed yet.)
FOOT_OVERRIDE: dict[str, float] = {}


def head_radius(a):
    m = (a > 128).astype(np.uint8)
    ys, xs = np.where(m > 0)
    y0, y1 = ys.min(), ys.max()
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    dt[y0 + int((y1 - y0) * 0.5):] = 0
    return float(dt.max())


def std_head_radius():
    """the head circle of the standing frame of hero-standard.webp: what every figure here is matched to"""
    A = np.array(Image.open(STD_ATLAS).convert('RGBA'))
    d = STD_DATA.read_text()
    m = re.search(r'  idle: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', d)
    x, y, w, h = map(int, m.groups())
    return head_radius(A[y:y + h, x:x + w, 3])


def resized(rgb, a, k):
    if abs(k - 1) < 0.004:
        return np.ascontiguousarray(rgb), np.ascontiguousarray(a)
    h, w = a.shape
    size = (max(1, round(w * k)), max(1, round(h * k)))
    interp = cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC
    return np.ascontiguousarray(cv2.resize(rgb, size, interpolation=interp)), np.ascontiguousarray(cv2.resize(a, size, interpolation=interp))


def std_measure():
    """head x of every body frame of the standard atlas, and the planted foot of its walk and run frames, measured on the packed pixels"""
    A = np.array(Image.open(STD_ATLAS).convert('RGBA'))
    head, foot = {}, {}
    for m in re.finditer(r'  (\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+), ax', STD_DATA.read_text()):
        name = m.group(1)
        if name.startswith('face_'):
            continue
        x, y, w, h = map(int, m.groups()[1:])
        a = A[y:y + h, x:x + w, 3]
        head[name] = sm.head_x(a)
        if name.startswith('walk_') or name.startswith('run_'):
            foot[name] = FOOT_OVERRIDE.get(name, sm.planted_foot(a)[0])
    return head, foot


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', default=None, help='folder: write the atlas, the data and a contact sheet there instead of over the game files')
    ap.add_argument('--quality', type=int, default=66)
    args = ap.parse_args()

    ref = std_head_radius()
    figs = {k: cs.cut_sheet(SHEETS / f, open_gaps=True) for k, f in FILES.items()}
    scale = {k: ref / float(np.percentile([head_radius(a) for _, a in figs[k]], 75)) for k in figs}
    print('head circle of the standing frame', round(ref, 1), '; scale per sheet', {k: round(v, 3) for k, v in scale.items()})

    items, meta = [], {}
    for name, (s, j) in BODY.items():
        rgb, a = figs[s][j - 1]
        if s in MIRROR_ALL_BUT and j != MIRROR_ALL_BUT[s]:
            rgb, a = cs.mirrored(rgb, a)
        rgb, a = resized(rgb, a, scale[s])
        ax, ay, _, bb = cs.anchors(a)
        items.append((name, rgb, a))
        meta[name] = dict(ax=ax, ay=ay, hx=sm.head_x(a), w=a.shape[1], h=a.shape[0], src=f'{s}:{j}')
    for name, (s, j) in FACES.items():
        rgb, a = figs[s][j - 1]
        hr, ha = cs.head_square(rgb, a)
        ha = cs.fade_bottom(ha)
        hr, ha = cv2.resize(hr, (FACE_PX, FACE_PX), interpolation=cv2.INTER_AREA), cv2.resize(ha, (FACE_PX, FACE_PX), interpolation=cv2.INTER_AREA)
        items.append((name, np.ascontiguousarray(hr), np.ascontiguousarray(ha)))
        meta[name] = dict(ax=FACE_PX / 2, ay=FACE_PX, hx=FACE_PX / 2, w=FACE_PX, h=FACE_PX, src=f'{s}:{j}')

    cs.ATLAS_W = 1024
    atlas, pos = cs.pack(items)
    img = Image.fromarray(atlas, 'RGBA')
    if args.preview:
        odir = Path(args.preview)
        odir.mkdir(parents=True, exist_ok=True)
        dst, data_dst = odir / 'hero-story.webp', odir / 'heroStoryData.ts'
    else:
        dst, data_dst = ROOT / 'src' / 'assets' / 'hero' / 'hero-story.webp', ROOT / 'src' / 'game' / 'heroStoryData.ts'
    img.save(dst, 'WEBP', quality=args.quality, alpha_quality=80, method=6)
    print(f'atlas {img.size[0]}x{img.size[1]}  {len(items)} pictures  {dst.stat().st_size / 1024:.0f} KB')

    head, foot = std_measure()
    L = [
        '/** Generated by scripts/cutPokeyStory.py from the cutscene sheets in reference/animation-sheets/slomatt/standard-set. Do not edit by hand. */',
        '/** a frame of hero-story.webp, in atlas pixels: its rect, the middle of the feet (ax), the ground line (ay) and the middle of the head (hx) */',
        'export interface StoryFrame { x: number; y: number; w: number; h: number; ax: number; ay: number; hx: number }',
        f'export const STORY_ATLAS_SIZE = {{ w: {img.size[0]}, h: {img.size[1]} }};',
        'export const STORY_FRAMES: Record<string, StoryFrame> = {',
    ]
    for name in list(BODY) + list(FACES):
        m, (x, y) = meta[name], pos[name]
        L.append(f"  {name}: {{ x: {x}, y: {y}, w: {m['w']}, h: {m['h']}, ax: {m['ax']:.1f}, ay: {m['ay']:.1f}, hx: {m['hx']:.1f} }},")
    L.append('};')
    L.append('/** x of the middle of the head in each body frame of hero-standard.webp (atlas pixels of the frame) */')
    L.append('export const STD_HEAD: Record<string, number> = {')
    L.append('  ' + ', '.join(f'{n}: {v:.1f}' for n, v in head.items()) + ',')
    L.append('};')
    L.append("/** the planted foot of the standard walk and run frames: pixels ahead (+) or behind (-) of the middle of the head */")
    L.append('export const STD_FOOT: Record<string, number> = {')
    L.append('  ' + ', '.join(f'{n}: {v:.1f}' for n, v in foot.items()) + ',')
    L.append('};')
    data_dst.write_text('\n'.join(L) + '\n')
    print('wrote', data_dst)

    if args.preview:
        cell, cols = (230, 280), 8
        names = list(BODY) + list(FACES)
        rows = (len(names) + cols - 1) // cols
        S = Image.new('RGB', (cell[0] * cols, cell[1] * rows), (70, 90, 110))
        d = ImageDraw.Draw(S)
        for i, name in enumerate(names):
            m, (x, y) = meta[name], pos[name]
            im = img.crop((x, y, x + m['w'], y + m['h']))
            c, r = i % cols, i // cols
            gx, gy = c * cell[0] + cell[0] // 2, r * cell[1] + cell[1] - 14
            S.paste(im, (round(gx - m['ax']), round(gy - m['ay'])), im)
            d.line([(c * cell[0] + 4, gy), (c * cell[0] + cell[0] - 4, gy)], fill=(255, 0, 255))
            d.line([(round(gx - m['ax'] + m['hx']), gy - 12), (round(gx - m['ax'] + m['hx']), gy)], fill=(255, 255, 0))
            d.text((c * cell[0] + 3, r * cell[1] + 3), f"{name} {m['src']}", fill=(255, 255, 0))
        S.save(odir / 'story-contact.png')


if __name__ == '__main__':
    main()
