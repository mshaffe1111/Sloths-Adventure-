"""Cut Matt's Gemini sheets for Meeca's puzzle stage into one transparent PNG per cell.

    python3 tools/art/w5puzzle/cut.py   -> tools/art/w5puzzle/cut/<sheet>-NN.png and cut/contact.png

Each sheet is a fixed grid on a flat key colour (magenta, or green for the tea sheet). A cell is cropped with a small inset
(Gemini draws thin grid lines on some sheets), the key colour is removed with a soft edge and de-spilled, specks are dropped,
and the cut is trimmed to its pixels.
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

D = os.path.dirname(os.path.abspath(__file__))
SHEETS = {  # name: (cols, rows, key)
    'flicker': (4, 4, 'magenta'),
    'pieces': (4, 4, 'magenta'),
    'tea': (3, 3, 'green'),
    'beetle': (4, 4, 'magenta'),
    'meeca-carry': (4, 4, 'magenta'),
}
INSET = 6


def keyness(rgb, key):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if key == 'magenta':
        return np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    return np.clip((g - np.maximum(r, b)) / 255.0, 0, 1)


def cut_cell(rgb, key):
    k = keyness(rgb, key)
    alpha = np.clip((0.42 - k) / 0.22, 0, 1)  # soft edge between "clearly key" and "clearly object"
    solid = alpha > 0.5
    solid = ndimage.binary_opening(solid, iterations=1)
    lab, n = ndimage.label(solid)
    if n == 0:
        return None
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i in range(n) if sizes[i] >= max(80, sizes.max() * 0.02)])
    keep = ndimage.binary_dilation(keep, iterations=2)
    alpha = alpha * keep
    out = rgb.copy()
    # de-spill: pull the key colour's excess channel back on the soft edge
    if key == 'magenta':
        cap = out[..., 1] + 30
        out[..., 0] = np.minimum(out[..., 0], np.maximum(cap, out[..., 0] * (1 - (1 - alpha) * 0.6)))
        out[..., 2] = np.minimum(out[..., 2], np.maximum(cap, out[..., 2] * (1 - (1 - alpha) * 0.6)))
    else:
        cap = np.maximum(out[..., 0], out[..., 2]) + 30
        out[..., 1] = np.minimum(out[..., 1], cap)
    if key == 'magenta':
        # magenta shows through Flicker's clear wings and the soft glows as a pink tint: turn pink-tinted pixels
        # into a pale neutral (nothing on these sheets is meant to be pink), and fade the faint ones into the glow edge
        r, g, b = out[..., 0], out[..., 1], out[..., 2]
        pink = (r > g + 25) & (b > g + 10)
        grey = (r + g + b) / 3
        for ch, tint in ((0, 8), (1, 4), (2, -6)):
            out[..., ch] = np.where(pink, np.clip(grey + tint, 0, 255), out[..., ch])
        alpha = np.where(pink & (alpha < 0.9), alpha * 0.5, alpha)
    rgba = np.dstack([out, alpha * 255]).astype(np.uint8)
    ys, xs = np.nonzero(alpha > 0.02)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def main():
    os.makedirs(os.path.join(D, 'cut'), exist_ok=True)
    tiles = []
    for name, (cols, rows, key) in SHEETS.items():
        im = np.asarray(Image.open(os.path.join(D, 'raw', name + '.jpg')).convert('RGB')).astype(np.float32)
        h, w = im.shape[:2]
        cw, ch = w / cols, h / rows
        for r in range(rows):
            for c in range(cols):
                x0, y0 = int(c * cw) + INSET, int(r * ch) + INSET
                x1, y1 = int((c + 1) * cw) - INSET, int((r + 1) * ch) - INSET
                cell = cut_cell(im[y0:y1, x0:x1], key)
                idx = r * cols + c + 1
                if cell is None:
                    print('empty', name, idx)
                    continue
                cell.save(os.path.join(D, 'cut', f'{name}-{idx:02d}.png'))
                tiles.append((f'{name}-{idx:02d}', cell))
    # contact sheet on a dark dusk colour, so leftover key fringe shows up
    S, per = 200, 10
    rows = (len(tiles) + per - 1) // per
    sheet = Image.new('RGBA', (per * S, rows * S), (38, 34, 52, 255))
    for i, (_, t) in enumerate(tiles):
        t = t.copy()
        t.thumbnail((S - 16, S - 16))
        sheet.alpha_composite(t, ((i % per) * S + (S - t.width) // 2, (i // per) * S + (S - t.height) // 2))
    sheet.convert('RGB').save(os.path.join(D, 'cut', 'contact.png'))
    print(len(tiles), 'cuts')


if __name__ == '__main__':
    main()
