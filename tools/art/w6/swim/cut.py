"""Cut Pokey's chosen swim frames out of the clips (2026-10-27): keyed off the flat grey with the hero clip cutter's key()
(train/clips.py), scaled to the standard hero (his standing height = 200 sheet px, as train/clips.py STAND_H), one shared box per move.

    python3 -I tools/art/w6/swim/cut.py            (reads picks.json beside this file)

raw/<clip>/<clip>_NNN.webp   the clip frames (unpack a clip's carrier PNG with w5/unpack_carrier.py into raw/<clip>/)
picks.json                   {move: {"clip", "frames": [...], "head_px": width of his head in the clip's px, "loop": bool,
                              "water": the waterline's y in the clip's own px (surface moves) or null (underwater),
                              "flip"?: bool, "bob"?: px of a hand-made up-and-down bob, "fps"?}}
frames/<move>/<move>_NN.png  the cut-out frames, RGBA
frames/<move>.webp           the frames as one sheet in the hero clip layout (8 across), not wired into the game
frames/meta.json             per move: n, cols, w, h, ax, ay (ax = middle of his torso, ay = the waterline, or the middle of his
                             body underwater), fps, loop, frames used

Scale: no clip has him standing, so it comes from his head. In the standing side-view still (pokey-stand-side-33) his head, back of
the skull to the tip of the nose, is HEAD_SHARE of his standing height; head_px in a clip therefore gives his standing height there.
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H.parents[1] / 'train'))
from clips import key  # noqa: E402

STAND_H = 200
HEAD_SHARE = 0.40  # head width at eye level / standing height in pokey-stand-side-33 (327 / 818 px)
COLS = 8
FPS = 10


def bbox(a):
    ys, xs = np.nonzero(a > 128)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def torso_x(a):
    x0, y0, x1, y1 = bbox(a)
    band = a[y0 + (y1 - y0) // 3: y0 + 2 * (y1 - y0) // 3] > 128
    return float(np.median(np.nonzero(band)[1]))


def cut(move, p):
    src = sorted((H / 'raw' / p['clip']).glob(f"{p['clip']}_*.webp"))
    frames = [np.asarray(Image.open(src[i]).convert('RGB')) for i in p['frames']]
    if p.get('flip'):
        frames = [np.ascontiguousarray(f[:, ::-1]) for f in frames]
    alphas = [key(f) for f in frames]
    if p.get('bob'):  # a gentle bob added by hand (the clip stands still): frame i rides bob px (clip px) up on a sine
        n = len(frames)
        sh = [int(round(-p['bob'] * np.sin(2 * np.pi * i / n))) for i in range(n)]
        frames = [np.roll(f, d, axis=0) for f, d in zip(frames, sh)]
        alphas = [np.roll(a, d, axis=0) for a, d in zip(alphas, sh)]
    boxes = [bbox(a) for a in alphas]
    x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
    x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
    k = STAND_H / (p['head_px'] / HEAD_SHARE)
    pad = 2
    w, h = int(round((x1 - x0) * k)) + pad * 2, int(round((y1 - y0) * k)) + pad * 2
    out = H / 'frames' / move
    out.mkdir(parents=True, exist_ok=True)
    for f in out.glob('*.png'):
        f.unlink()
    rows = (len(frames) + COLS - 1) // COLS
    sheet = Image.new('RGBA', (w * COLS, h * rows), (0, 0, 0, 0))
    for i, (f, a) in enumerate(zip(frames, alphas)):
        im = Image.fromarray(np.dstack([f, a]), 'RGBA').crop((x0, y0, x1, y1)).resize((w - pad * 2, h - pad * 2), Image.LANCZOS)
        fr = Image.new('RGBA', (w, h), (0, 0, 0, 0)); fr.paste(im, (pad, pad))
        fr.save(out / f'{move}_{i:02d}.png')
        sheet.paste(fr, ((i % COLS) * w, (i // COLS) * h))
    sheet.save(H / 'frames' / f'{move}.webp', 'WEBP', quality=86, method=6)
    ax = (np.mean([torso_x(a) for a in alphas]) - x0) * k + pad
    wy = p['water'] if p.get('water') is not None else (y0 + y1) / 2  # raw-frame y of the waterline, or his middle underwater
    ay = (wy - y0) * k + pad
    meta = dict(n=len(frames), cols=COLS, w=w, h=h, ax=round(float(ax), 1), ay=round(float(ay), 1), fps=p.get('fps', FPS),
                loop=p['loop'], clip=p['clip'], frames=p['frames'], water=p.get('water'), k=round(k, 4))
    print(move, meta)
    return meta


if __name__ == '__main__':
    picks = json.loads((H / 'picks.json').read_text())
    only = sys.argv[1:] or list(picks)
    mp = H / 'frames' / 'meta.json'
    meta = json.loads(mp.read_text()) if mp.exists() else {}
    for m in only:
        meta[m] = cut(m, picks[m])
    mp.write_text(json.dumps(meta, indent=1))
