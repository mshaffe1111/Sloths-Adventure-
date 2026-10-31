"""Turn Wan clips (flat grey background) into game sheets for the hero.

  python3 clips.py idle-yawn look-around ...   -> sloths-fixes/src/assets/hero/clips/<name>.webp and src/game/heroClipsData.ts

Every frame is keyed off the grey (a flood fill from the edges through grey-ish pixels, so the grey of his face or eyes inside him stays), the
frames of a clip share one box (the camera never moved, so his feet stay put), and he is scaled so his standing height is the standard hero's
200 atlas pixels (heroStandardData STD_STAND_H).
"""
import json, sys, re
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

S = Path((str(__import__('pathlib').Path(__file__).resolve().parents[1]) + '/train/vids'))
GAME = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[3]))
OUT = GAME / 'src/assets/hero/clips'
DATA = GAME / 'src/game/heroClipsData.ts'
STAND_H = 200
# the standing height of Pokey in each clip's own pixels, when the first frame is not him standing (else measured from frame 0)
STAND_PX = {'move-run': 380, 'move-jump': 250, 'move-flip': 300, 'move-climb': 300}
# a clip where he is not standing: his height there as a share of his standing height
STAND_RATIO = {'doze': 0.62, 'push': 0.8}
# clips whose paws (the right edge) must touch something: the feet anchor goes this many sheet px left of the paw tips
# (the hero's half-width, 19 world units, plus a hair, at 0.4455 world units a px)
PAW_ANCHOR = {'push': 45}
# clips drawn facing left: mirrored, since the game's frames face right
FLIP = {'doze'}
# frames to use (Wan gives 49 at 16 fps)
RANGE = {'hurt': (8, 49), 'cheer': (0, 30)}
COLS = 8


def key(rgb: np.ndarray) -> np.ndarray:
    """alpha 0..255: the background is whatever grey reaches the edge of the picture"""
    a = rgb.astype(np.int16)
    border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.abs(a - bg).max(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)
    v = a.max(axis=2)
    # grey-like: close to the background, or a neutral grey a little darker (his soft shadow on the floor)
    greyish = (d < 26) | ((sat < 14) & (v > 120) & (v < 215))
    lab, _ = ndimage.label(greyish)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bgmask = np.isin(lab, edge[edge > 0])
    fig = ~bgmask
    # drop specks, keep the figure (the biggest piece) and anything big touching it
    lab2, n = ndimage.label(fig)
    if n > 1:
        sizes = ndimage.sum(fig, lab2, range(1, n + 1))
        keep = np.isin(lab2, 1 + np.flatnonzero(sizes > max(400, sizes.max() * 0.02)))
        fig = keep
    # pockets of the plain grey shut in by his arms are background too
    lab3, n3 = ndimage.label(greyish & fig)
    if n3:
        sizes = ndimage.sum(np.ones_like(d), lab3, range(1, n3 + 1))
        fig &= ~np.isin(lab3, 1 + np.flatnonzero(sizes > 40))
    # a soft edge: one pixel in, ramped by how far the colour is from the grey
    inner = ndimage.binary_erosion(fig, iterations=1)
    alpha = np.where(inner, 255, np.where(fig, np.clip((d - 8) * 9, 0, 255), 0)).astype(np.uint8)
    return alpha


def bbox(alpha):
    ys, xs = np.nonzero(alpha > 128)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


# a sheet cut from part of another clip: sheet name -> (clip folder, first frame, end frame)
SOURCE = {
    'move-run': ('a-run-1', 29, 44),
    # the combo: a lead-arm jab, a rear-arm cross, a twisting lead-arm hook (a-punch-2)
    'move-jab': ('a-punch-2', [4, 5, 6, 6, 8, 9], None),
    'move-cross': ('a-punch-2', [34, 35, 36, 37, 37, 36, 35], None),
    'move-hook': ('a-punch-2', [30, 31, 32, 32, 32, 34, 35], None),
    # two kicks that take turns: a front snap kick (a-kick-1), then a high side kick (a-kick-2)
    'move-kick': ('a-kick-1', [1, 2, 3, 4, 5, 6, 7, 8, 2, 1], None),
    # the mega punch: crouch and pull both arms back, then a lunging two-paw shove (a-mega; frame 23 is a glitched turn, 24 a smeared paw)
    'move-mega': ('a-mega', [10, 11, 12, 13, 14, 25, 26, 27, 28, 30, 32, 34, 38, 41, 44, 46], None),
    'move-kick2': ('a-kick-2', [18, 19, 20, 22, 24, 26, 28, 29, 30, 31], None),
    # X-14, at a ledge's end (hfpokey/spec-x14-clips1.json): the step back is x14-stepback-s3's step, arms up for balance, the back foot
    # lifted and set down, then settling; the teeter is that step's own off-balance moment (both arms out wide, the back foot up),
    # played there and back, each end held a frame, so it loops with no jump (the lead's call: x14-teeter-s3's raised arm read as a
    # wave at game size)
    'teeter': ('x14-stepback-s3', [20, 20, 21, 22, 23, 24, 24, 23, 22, 21], None),
    'step-back': ('x14-stepback-s3', list(range(15, 31)), None),
    # the jump (pokey-anim, 2026-10-30, tools/art/pokeyanim/spec-anim1.json): pa-jump-s11's flight (12-21: 8 smears his face, 9-11 turn him toward the camera, 22 blurs his paws) from the take-off stretch through the
    # rise, the top (one leg kicked back) and the fall with his arms up; the game picks the frame by his vertical speed (heroClips jumpU)
    'move-jump': ('pa-jump-s11', list(range(12, 22)), None),
    # the climb (spec-anim2.json): pa-climb-s3's hand-over-hand on an invisible trunk, one full cycle (near paw up, far paw up) 12-32
    'move-climb': ('pa-climb-s3', list(range(12, 33)), None),
}
# sheets whose frames are re-centred on his torso one by one (a run or walk drifts a little in the clip; in the game the body must stay put)
RECENTER = {'move-run', 'move-walk', 'move-jump', 'move-flip', 'move-climb'}
# sheets whose frames are lined up one by one up and down too: on his feet (a jump: the clip's own rise and fall would add to the
# physics'), or on the middle of his body (the flip, which turns about it)
ALIGN_Y = {'move-jump': 'feet', 'move-flip': 'middle', 'move-climb': 'middle'}


def torso_x(alpha):
    """the middle of his body: the median column of the band from a third to two thirds down his height"""
    x0, y0, x1, y1 = bbox(alpha)
    band = alpha[y0 + (y1 - y0) // 3: y0 + 2 * (y1 - y0) // 3] > 128
    xs = np.nonzero(band)[1]
    return float(np.median(xs))


def build(name: str):
    folder, lo, hi = SOURCE.get(name, (name, None, None))
    src = sorted((S / folder).glob(f'{folder}_*.png'))
    if isinstance(lo, list):
        src = [src[i] for i in lo]  # hand-picked frames, in order (a frame may repeat to hold a pose)
    else:
        if lo is None:
            lo, hi = RANGE.get(name, (0, len(src)))
        src = src[lo:hi]
    frames = [np.asarray(Image.open(f).convert('RGB')) for f in src]
    if name in FLIP:
        frames = [np.ascontiguousarray(f[:, ::-1]) for f in frames]
    alphas = [key(f) for f in frames]
    if name in RECENTER:
        # shift every frame so his torso sits where the first frame's does
        c0 = torso_x(alphas[0])
        sh = [int(round(torso_x(a) - c0)) for a in alphas]
        frames = [np.roll(f, -d, axis=1) for f, d in zip(frames, sh)]
        alphas = [np.roll(a, -d, axis=1) for a, d in zip(alphas, sh)]
    if name in ALIGN_Y:
        def ymark(a):
            x0_, y0_, x1_, y1_ = bbox(a)
            return y1_ if ALIGN_Y[name] == 'feet' else float(np.nonzero(a > 128)[0].mean())
        m0 = ymark(alphas[0])
        sh = [int(round(ymark(a) - m0)) for a in alphas]
        frames = [np.roll(f, -d, axis=0) for f, d in zip(frames, sh)]
        alphas = [np.roll(a, -d, axis=0) for a, d in zip(alphas, sh)]
    boxes = [bbox(a) for a in alphas]
    x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
    x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
    b0 = boxes[0]
    # the standing height from his first standing frame (for a clip trimmed at the start, the untrimmed first frame)
    f0 = np.asarray(Image.open(sorted((S / folder).glob(f'{folder}_*.png'))[0]).convert('RGB'))
    if name in FLIP:
        f0 = np.ascontiguousarray(f0[:, ::-1])
    bs = bbox(key(f0))
    stand = STAND_PX.get(name, (bs[3] - bs[1]) / STAND_RATIO.get(name, 1))
    k = STAND_H / stand
    # feet: the bottom of the first frame, x the middle of the lowest band of him
    a0 = alphas[0]
    band = a0[b0[3] - 12:b0[3]] > 128
    fx = np.nonzero(band.any(axis=0))[0].mean()
    # (a wider margin for the sheets cut since pokey-anim: at 2 px his soft outline was shaved where he touches the box)
    pad = 6 if name in ALIGN_Y else 2
    w, h = int(round((x1 - x0) * k)) + pad * 2, int(round((y1 - y0) * k)) + pad * 2
    rows = (len(frames) + COLS - 1) // COLS
    sheet = Image.new('RGBA', (w * COLS, h * rows), (0, 0, 0, 0))
    for i, (f, a) in enumerate(zip(frames, alphas)):
        im = Image.fromarray(np.dstack([f, a]), 'RGBA').crop((x0, y0, x1, y1)).resize((w - pad * 2, h - pad * 2), Image.LANCZOS)
        sheet.paste(im, ((i % COLS) * w + pad, (i // COLS) * h + pad))
    OUT.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT / f'{name}.webp', 'WEBP', quality=86, method=6)
    ax = (w - pad - PAW_ANCHOR[name]) if name in PAW_ANCHOR else ((torso_x(a0) if name in RECENTER else fx) - x0) * k + pad
    meta = dict(n=len(frames), cols=COLS, w=w, h=h, ax=round(ax, 1), ay=round((b0[3] - y0) * k + pad, 1), fps=16)
    print(name, meta, (OUT / f'{name}.webp').stat().st_size // 1024, 'KB')
    return meta


def write_data(clips: dict):
    old = {}
    if DATA.exists():
        m = re.search(r'HERO_CLIPS: Record<string, HeroClip> = (\{.*?\});', DATA.read_text(), re.S)
        if m:
            old = json.loads(m.group(1))
    old.update(clips)
    body = json.dumps(old, indent=1)
    DATA.write_text(f'''/** Generated by the clip cutter (Wan image-to-video clips of Pokey, keyed and scaled to the standard hero). Do not edit by hand. */
export interface HeroClip {{ n: number; cols: number; w: number; h: number; ax: number; ay: number; fps: number }}
export const HERO_CLIPS: Record<string, HeroClip> = {body};
''')


if __name__ == '__main__':
    write_data({n: build(n) for n in sys.argv[1:]})
