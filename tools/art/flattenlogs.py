"""PAINT-292: level the top of World 1's two thick painted log planks (w1-log-plank-a/b) in the cut atlas, in place.

  python3 tools/art/flattenlogs.py            -> rewrites those two frames of src/assets/w1to4art/w1-cut.webp and their w1-cut.json rows
  python3 tools/art/flattenlogs.py --check    -> exit 1 unless both frames' tops are already level (it ran)

Matt's painted planks were cut from a Gemini sheet as drawn: plank-a bows (its top 2 px at the left, 12 in the middle, 7 at the right) and
plank-b tilts (13 px at the left to 1 at the right), so a plank laid as a 50-89 px log floated over or sank under Pokey's feet by up to 20
game px (PAINT-292's bar 1: the art's top is the floor). Each column of the painting is moved up or down by a smooth amount (sub-pixel,
linear in y) so the wood's top runs level at the frame's footing line; moss tufts on top stay above it, the ends keep their own rounding.
No pixel is drawn by code: the painting is only re-seated column by column. The frame grows downward into the atlas's empty space under
it (checked empty before writing); fy, fx0, fx1 are measured from the result: fx0..fx1 is where the top is level and the log is whole; fb (the row the body reaches)
is what cutBox scales a thick log by (w1CutArt.ts).
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parents[2]
IMG = GAME / 'src/assets/w1to4art/w1-cut.webp'
JSN = GAME / 'src/assets/w1to4art/w1-cut.json'
NAMES = ['w1-log-plank-a', 'w1-log-plank-b']
MAX_H = 82  # the most a frame may grow to (rows under it are empty to 444, the slabs' shelf ends there)


def tops(alpha):
    h, w = alpha.shape
    t = np.full(w, np.nan)
    for x in range(w):
        ys = np.nonzero(alpha[:, x] > 128)[0]
        if len(ys):
            t[x] = ys[0]
    return t


def wood_top(alpha):
    """the wood's top per column, smoothed: a running median (moss tufts and splinters out) then a running mean"""
    t = tops(alpha)
    w = len(t)
    med = np.array([np.nanmedian(t[max(0, x - 12):x + 13]) if not np.all(np.isnan(t[max(0, x - 12):x + 13])) else np.nan for x in range(w)])
    return np.array([np.nanmean(med[max(0, x - 8):x + 9]) if not np.all(np.isnan(med[max(0, x - 8):x + 9])) else np.nan for x in range(w)]), t


def level(frame):
    """the frame with its wood top level; returns (image array, footing y)"""
    a = frame.astype(np.float32)
    alpha = frame[:, :, 3]
    smooth, raw = wood_top(alpha)
    h, w = alpha.shape
    solid = np.nonzero(~np.isnan(raw))[0]
    # (the whole log's columns: those at least 70% as deep as the median, so the thin tips keep the shift of the log next to them)
    depth = np.array([np.count_nonzero(alpha[:, x] > 128) for x in range(w)])
    whole = np.nonzero(depth >= 0.7 * np.median(depth[solid]))[0]
    lo, hi = whole[0], whole[-1]
    target = float(np.median(smooth[lo:hi + 1]))
    shift = np.zeros(w, np.float32)
    for x in range(w):
        xx = min(max(x, lo), hi)
        shift[x] = target - smooth[xx]
    up = max(0.0, -shift.min())
    down = max(0.0, shift.max())
    pad_top, pad_bot = int(np.ceil(up)) + 1, int(np.ceil(down)) + 1
    H = h + pad_top + pad_bot
    # premultiplied, so a moved edge never drags a dark fringe
    pm = a.copy()
    pm[:, :, :3] *= pm[:, :, 3:4] / 255.0
    out = np.zeros((H, w, 4), np.float32)
    ys = np.arange(H, dtype=np.float32)
    for x in range(w):
        src = ys - pad_top - shift[x]
        i0 = np.floor(src).astype(int)
        f = (src - i0)[:, None]
        ok0 = (i0 >= 0) & (i0 < h)
        ok1 = (i0 + 1 >= 0) & (i0 + 1 < h)
        c0 = np.where(ok0[:, None], pm[np.clip(i0, 0, h - 1), x], 0)
        c1 = np.where(ok1[:, None], pm[np.clip(i0 + 1, 0, h - 1), x], 0)
        out[:, x] = c0 * (1 - f) + c1 * f
    al = out[:, :, 3:4]
    rgb = np.where(al > 0, out[:, :, :3] * 255.0 / np.maximum(al, 1e-3), 0)
    res = np.concatenate([np.clip(rgb, 0, 255), np.clip(al, 0, 255)], axis=2).round().astype(np.uint8)
    # trim empty rows
    rows = np.nonzero(res[:, :, 3].max(axis=1) > 0)[0]
    res = res[rows[0]:rows[-1] + 1]
    return res, target + pad_top - rows[0]


def measure(frame):
    """fy: the level wood top; fx0..fx1: the columns where the smoothed top is within 1.5 px of it and the log is whole"""
    alpha = frame[:, :, 3]
    smooth, raw = wood_top(alpha)
    w = alpha.shape[1]
    depth = np.array([np.count_nonzero(alpha[:, x] > 128) for x in range(w)])
    solid = ~np.isnan(raw)
    med = np.median(depth[solid])
    whole = np.nonzero(depth >= 0.7 * med)[0]
    fy = float(np.median(smooth[whole[0]:whole[-1] + 1]))
    okc = [x for x in range(w) if solid[x] and depth[x] >= 0.7 * med and abs(raw[x] - fy) <= 3 and abs(smooth[x] - fy) <= 1.5]
    return fy, float(okc[0]), float(okc[-1] + 1), float(np.nanmax(np.abs(smooth[okc[0]:okc[-1] + 1] - fy)))


def main():
    data = json.loads(JSN.read_text())
    sheet = np.array(Image.open(IMG).convert('RGBA'))
    if '--check' in sys.argv:
        bad = 0
        for n in NAMES:
            c = data[n]
            fr = sheet[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']]
            fy, x0, x1, dev = measure(fr)
            print(f'{n}: top level within {dev:.2f} px over {x0:.0f}..{x1:.0f} (fy {fy:.1f})')
            bad += dev > 1.5 or (x1 - x0) < 0.6 * c['w']
        sys.exit(1 if bad else 0)
    for n in NAMES:
        c = data[n]
        fr = sheet[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']].copy()
        res, _ = level(fr)
        assert res.shape[0] <= MAX_H, (n, res.shape)
        # the rows it grows into must be empty (the frame's own rect is cleared first)
        region = sheet[c['y']:c['y'] + MAX_H, c['x']:c['x'] + c['w']].copy()
        region[:c['h']] = 0
        assert region[:, :, 3].max() == 0, f'{n}: atlas space under the frame is not empty'
        sheet[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']] = 0
        sheet[c['y']:c['y'] + res.shape[0], c['x']:c['x'] + res.shape[1]] = res
        fy, x0, x1, dev = measure(res)
        # fb: the row the log's body reaches under 80% of its stand span (the 20th-percentile bottom): cutBox scales it so that row is at
        # the platform's foot + SINK, so the round underside is in the ground with no air under it, and only its lowest bulge is cut off
        al = res[:, :, 3]
        bots = [np.nonzero(al[:, x] > 128)[0][-1] + 1 for x in range(int(x0), int(x1))]
        fb = float(np.percentile(bots, 20))
        data[n].update({'h': int(res.shape[0]), 'fy': round(fy, 1), 'fx0': round(x0, 1), 'fx1': round(x1, 1), 'fb': round(fb, 1)})
        print(f'{n}: {res.shape[1]}x{res.shape[0]}, fy {fy:.1f}, fb {fb:.1f}, stand {x0:.0f}..{x1:.0f}, top within {dev:.2f} px')
    # (quality 95, not packcut's 88: re-encoding the sheet at 88 moved 642 visible pixels of the OTHER pieces more than 8/255; at 95 it moves
    #  75 of ~1.2 million, +30 KiB; lossless was 759 KiB)
    Image.fromarray(sheet).save(IMG, 'WEBP', quality=95, method=6, exact=True)
    JSN.write_text(json.dumps(data, indent=1) + '\n')


if __name__ == '__main__':
    main()
