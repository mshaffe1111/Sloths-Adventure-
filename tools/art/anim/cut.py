"""Cut the chosen frames of the Gemini characters' clips (2026-10-28), and of the older crab and piranha clips, out of the flat grey.

    python3 -I tools/art/anim/cut.py [name ...]        (reads picks.json beside this file; all names when none are given)

raw/<clip>/<clip>_NNN.webp   the clip frames (unpack a clip's carrier PNG with w5/unpack_carrier.py into raw/<clip>/)
picks.json                   {name: {"up": sheet px per px of Matt's Gemini cell, or "k": sheet px per clip px (clips with no cell),
                              "key": "tight"? (grey-skinned: the caiman), "moves": {move: {"clip", "frames": [...], "loop": bool,
                              "fps", "anchor": "ground" | "middle" | "water", "water"?: the waterline's y in clip px,
                              "largest"?: keep only the biggest piece (drops a splash), "steady"?: line every frame's body up
                              on the mean, which takes out a clip's sideways drift}}}}
frames/<name>/<move>/<move>_NN.png   the cut-out frames, RGBA, one shared box per move
frames/<name>/meta.json      per move: n, w, h, ax, ay (ax = middle of the body; ay = the ground under the feet, the middle of a flier,
                              or the waterline), fps, loop, clip, frames used, k (sheet px per clip px), anchor

Scale: a clip's start picture is Matt's cell scaled by s into the clip's frame (prep_starts.py), so k = up / s and every move of a
character comes out at the scale of his sheet ("up" sheet px per cell px), whatever cell it started from. A move whose start picture
is another move's names it with "start".
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H.parents[0] / 'train'))
sys.path.insert(0, str(H))
from clips import key as key_default  # noqa: E402
from prep_starts import STARTS  # noqa: E402

CUT = {'w5': H.parent / 'w5puzzle' / 'cut', 'w6': H.parent / 'w6' / 'cut'}
PAD = 2


def key_tight(rgb):
    """as reanim/pack.py: only grey that reaches the edge, or a shut-in pocket of almost exactly the background grey, is background"""
    a = rgb.astype(np.int16)
    border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.abs(a - bg).max(axis=2)
    lab, _ = ndimage.label(d < 22)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fig = ~np.isin(lab, edge[edge > 0])
    lab2, n = ndimage.label(fig)
    if n > 1:
        sizes = ndimage.sum(fig, lab2, range(1, n + 1))
        fig = np.isin(lab2, 1 + np.flatnonzero(sizes > max(400, sizes.max() * 0.02)))
    lab3, n3 = ndimage.label((d < 7) & fig)
    if n3:
        sizes = ndimage.sum(np.ones_like(d), lab3, range(1, n3 + 1))
        fig &= ~np.isin(lab3, 1 + np.flatnonzero(sizes > 60))
    inner = ndimage.binary_erosion(fig, iterations=1)
    return np.where(inner, 255, np.where(fig, np.clip((d - 8) * 9, 0, 255), 0)).astype(np.uint8)


def largest(a):
    lab, n = ndimage.label(a > 0)
    if n < 2:
        return a
    sizes = ndimage.sum(a > 0, lab, range(1, n + 1))
    return np.where(lab == 1 + int(np.argmax(sizes)), a, 0).astype(np.uint8)


def bbox(a):
    ys, xs = np.nonzero(a > 128)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def body_x(a):
    """median x of the middle third of the figure's rows (its body, not a reaching arm or a tail)"""
    x0, y0, x1, y1 = bbox(a)
    band = a[y0 + (y1 - y0) // 3: y0 + 2 * (y1 - y0) // 3] > 128
    return float(np.median(np.nonzero(band)[1]))


def frames_of(clip):
    fs = sorted((H / 'raw' / clip).glob(f'{clip}_*.webp'))
    if not fs:
        raise SystemExit(f'no frames in raw/{clip}: unpack its carrier first')
    return fs


def cut(name, ch, move, p):
    keyf = key_tight if ch.get('key') == 'tight' else key_default
    src = frames_of(p['clip'])
    rgb = [np.asarray(Image.open(src[i]).convert('RGB')) for i in p['frames']]
    alphas = [keyf(f) for f in rgb]
    if p.get('largest'):
        alphas = [largest(a) for a in alphas]
    if 'k' in ch:
        k = ch['k']
    else:  # from the start cell: prep_starts scaled the cell by s into the clip's frame, so a clip px is 1/s cell px
        cell, flip, wh, share = STARTS[p.get('start', f'{name}-{move}')]
        d, n = cell.split(':')
        cim = Image.open(CUT[d] / f'{n}.png').convert('RGBA')
        cb = cim.getbbox()
        cw, chh = cb[2] - cb[0], cb[3] - cb[1]
        s = min(share * wh[1] / chh, 0.8 * wh[0] / cw)
        k = ch['up'] / s
    if p.get('steady'):  # line the bodies up on their mean x
        xs = [body_x(a) for a in alphas]
        m = np.mean(xs)
        sh = [int(round(m - x)) for x in xs]
        rgb = [np.roll(f, s, axis=1) for f, s in zip(rgb, sh)]
        alphas = [np.roll(a, s, axis=1) for a, s in zip(alphas, sh)]
    boxes = [bbox(a) for a in alphas]
    x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
    x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
    w, h = int(round((x1 - x0) * k)) + PAD * 2, int(round((y1 - y0) * k)) + PAD * 2
    out = H / 'frames' / name / move
    out.mkdir(parents=True, exist_ok=True)
    for f in out.glob('*.png'):
        f.unlink()
    for i, (f, a) in enumerate(zip(rgb, alphas)):
        im = Image.fromarray(np.dstack([f, a]), 'RGBA').crop((x0, y0, x1, y1)).resize((w - PAD * 2, h - PAD * 2), Image.LANCZOS)
        fr = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        fr.paste(im, (PAD, PAD))
        fr.save(out / f'{move}_{i:02d}.png', optimize=True)
    ax = (np.mean([body_x(a) for a in alphas]) - x0) * k + PAD
    anc = p.get('anchor', 'ground')
    if anc == 'ground':  # the ground: where the lowest feet are in most frames
        gy = float(np.percentile([b[3] for b in boxes], 75))
    elif anc == 'water':
        gy = p['water']
    else:  # a flier's middle
        gy = float(np.mean([(b[1] + b[3]) / 2 for b in boxes]))
    ay = (gy - y0) * k + PAD
    meta = dict(n=len(rgb), w=w, h=h, ax=round(float(ax), 1), ay=round(float(ay), 1), anchor=anc, fps=p.get('fps', 10),
                loop=p['loop'], clip=p['clip'], frames=p['frames'], k=round(float(k), 4))
    if anc == 'water':
        meta['water'] = p['water']
    print(name, move, meta)
    return meta


if __name__ == '__main__':
    picks = json.loads((H / 'picks.json').read_text())
    for name in sys.argv[1:] or list(picks):
        ch = picks[name]
        mp = H / 'frames' / name / 'meta.json'
        mp.parent.mkdir(parents=True, exist_ok=True)
        meta = {mv: cut(name, ch, mv, p) for mv, p in ch['moves'].items()}
        mp.write_text(json.dumps(meta, indent=1) + '\n')
