"""Cut Pokey's rope traverse out of Matt's Gemini sheet (2026-10-29, reference/prop-sheets/gemini-batch-2026-10-29/
pokey-rope-hand-over-hand.jpg: 4x2 cells on flat grey, a rope drawn across the top of each).

    python3 -I tools/art/rope/cut.py [sheet.jpg] [out dir]

Per cell: the sheet's own rope is found (a thin beige band across the top), fitted as a curve, and painted back to the cell's grey
everywhere except under his paws (the claws curl over it there, so the paw stays whole); then the grey is keyed off with the hero clip
cutter's key() (train/clips.py). Each frame keeps where the rope runs through his grip (`gy`, the rope's middle at the paws) and the
middle of his torso (`ax`), so the game hangs the picture with his hands exactly on its own rope and the body glides level frame to
frame. `pawx`: the gripping paws' middles. Cell 8 (not holding the rope) gives only the scale: his standing height in sheet px.

Writes <out>/f<N>.png (RGBA, cropped) and <out>/meta.json.
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H.parents[0] / 'train'))
from clips import key  # noqa: E402

GAME = H.parents[2]
SHEET = GAME / 'reference/prop-sheets/gemini-batch-2026-10-29/pokey-rope-hand-over-hand.jpg'
BAND = 44  # the rope lies in the top rows of a cell


def rope_cut(rgb, band=BAND):
    """returns (rgb with the drawn rope painted out, rope curve y per column, paw columns)"""
    a = rgb.astype(np.int16)
    h, w, _ = a.shape
    bg = np.median(np.concatenate([a[-4:].reshape(-1, 3), a[band:, :3].reshape(-1, 3), a[band:, -3:].reshape(-1, 3)]), axis=0)
    d = np.abs(a - bg).max(axis=2)
    ink = d > 22
    # the rope's middle in each column where the only ink up top is the rope (a short run in the band, nothing just under it)
    xs, ys = [], []
    for x in range(w):
        col = np.flatnonzero(ink[:band, x])
        if len(col) and col.max() - col.min() <= 11 and not ink[col.max() + 3:col.max() + 12, x].any():
            xs.append(x); ys.append((col.min() + col.max()) / 2)
    co = np.polyfit(xs, ys, 2)
    yc = np.polyval(co, np.arange(w))
    # paw columns: ink above the rope's top edge (the claws curl over it), widened a little
    paw = np.zeros(w, bool)
    for x in range(w):
        top = int(round(yc[x])) - 5
        if top > 0 and ink[:top, x].sum() >= 2:
            paw[x] = True
    paw = ndimage.binary_dilation(paw, iterations=3)
    out = a.copy()
    for x in range(w):
        if paw[x]:
            continue
        y0, y1 = int(np.floor(yc[x] - 6)), int(np.ceil(yc[x] + 6))
        out[max(0, y0):y1 + 1, x] = bg
    return out.clip(0, 255).astype(np.uint8), yc, paw


def bbox(al):
    ys, xs = np.nonzero(al > 128)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def torso_x(al):
    x0, y0, x1, y1 = bbox(al)
    hh = y1 - y0
    band = al[y0 + int(hh * 0.45):y0 + int(hh * 0.7)] > 128
    cols = np.flatnonzero(band.sum(axis=0) > 0)
    # the widest solid run (the trunk, not a stray arm or leg)
    runs = np.split(cols, np.flatnonzero(np.diff(cols) > 1) + 1)
    r = max(runs, key=len)
    return float((r[0] + r[-1]) / 2)


def cut_cell(rgb, rope=True, band=BAND):
    if rope:
        clean, yc, paw = rope_cut(rgb, band)
    else:
        clean, yc, paw = rgb, None, None
    al = key(clean)
    x0, y0, x1, y1 = bbox(al)
    y0 = max(0, y0 - 1)
    rgba = np.dstack([clean, al])[y0:y1, x0:x1]
    m = {'w': int(x1 - x0), 'h': int(y1 - y0), 'ax': round(float(torso_x(al) - x0), 1)}
    if rope:
        pc = np.flatnonzero(paw[x0:x1])
        runs = [r for r in np.split(pc, np.flatnonzero(np.diff(pc) > 1) + 1) if len(r) >= 6]
        m['pawx'] = [round(float((r[0] + r[-1]) / 2), 1) for r in runs]
        if runs:
            px = np.concatenate(runs) + x0
            m['gy'] = round(float(np.mean(yc[px])) - y0, 1)
    return Image.fromarray(rgba.astype(np.uint8), 'RGBA'), m


if __name__ == '__main__':
    OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else H / 'frames'
    sh = np.asarray(Image.open(Path(sys.argv[1]) if len(sys.argv) > 1 else SHEET).convert('RGB'))
    ch, cw = sh.shape[0] // 2, sh.shape[1] // 4
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for i in range(8):
        r, c = divmod(i, 4)
        cell = sh[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
        n = i + 1
        im, m = cut_cell(cell)
        if n == 8:
            meta['stand_px'] = m['h']
            continue
        im.save(OUT / f'f{n}.png')
        meta[f'f{n}'] = m
        print(n, m)
    print('stand_px', meta['stand_px'])
    (OUT / 'meta.json').write_text(json.dumps(meta, indent=1))
