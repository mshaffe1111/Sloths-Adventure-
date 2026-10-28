"""Cut Matt's Gemini sheets for Meeca's puzzle stage into one transparent PNG per cell.

    python3 tools/art/w5puzzle/cut.py [w5puzzle|w6|w1to4]   -> tools/art/<folder>/cut/<sheet>-NN.png and cut/contact.png

Matt's sheets are kept in git under reference/prop-sheets/<folder>/ (tools/ ignores pictures); the cuts are rebuilt.

Each sheet is a fixed grid on a flat key colour (magenta, or green for the tea sheet). A cell is cropped with a small inset
(Gemini draws thin grid lines on some sheets), the key colour is removed with a soft edge and de-spilled, specks are dropped,
and the cut is trimmed to its pixels.
"""
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

ART = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(os.path.dirname(os.path.dirname(ART)), 'reference', 'prop-sheets')
FOLDERS = {}
FOLDERS['w5puzzle'] = SHEETS = {  # name: (cols, rows, key)
    'flicker': (4, 4, 'magenta'),  # these two have nothing pink on them, so pink tint is removed (see cut_cell)
    'pieces': (4, 4, 'magenta'),
    'tea': (3, 3, 'green'),
    'beetle': (4, 4, 'magenta'),
    'meeca-carry': (4, 4, 'magenta'),
    'butler': (4, 4, 'green'),
    'camp': (4, 4, 'magenta'),
    # Meeca's stage (2026-10-28): her new poses on green (she wears pink), and the stage's props (nothing pink on them)
    'meeca-poses': (4, 4, 'green'),
    'meeca-props': (4, 4, 'magenta'),
}
# World 6: nothing in the swamp is pink, so every sheet has the pink tint removed (it shows in the dark openings)
FOLDERS['w6'] = {'kit': (4, 4, 'magenta'), 'water': (4, 4, 'magenta'), 'caiman-items': (4, 4, 'magenta'),
                 'runners': (4, 4, 'magenta')}
# Worlds 1-4 puzzle upgrades (w3-puzzle came back as 4 x 5 cells; Pokey's sheet is de-pinked for his fur edges, which greys
# his small blush; the fishing net on w2-puzzle is pink and loses its colour: it is not used by a puzzle)
FOLDERS['w1to4'] = {'pokey-carry': (4, 4, 'magenta'), 'w1-puzzle': (4, 4, 'magenta'), 'w2-puzzle': (4, 4, 'magenta'),
                    'w3-puzzle': (4, 5, 'magenta'), 'w4-puzzle': (4, 4, 'magenta')}
INSET = 6
DEPINK = {'flicker', 'pieces', 'meeca-props', 'kit', 'water', 'caiman-items', 'runners', 'pokey-carry', 'w1-puzzle', 'w2-puzzle', 'w3-puzzle', 'w4-puzzle'}


def keyness(rgb, key):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if key == 'magenta':
        return np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    return np.clip((g - np.maximum(r, b)) / 255.0, 0, 1)


def cut_cell(rgb, key, depink=False):
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
        # green spills onto thin dark parts (the Butler's legs): never let green rise far above the other two channels
        cap = np.maximum(out[..., 0], out[..., 2]) + 6
        out[..., 1] = np.minimum(out[..., 1], cap)
    if depink:
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
    if len(ys) == 0:
        return None
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else 'w5puzzle'
    D = os.path.join(ART, folder)
    os.makedirs(os.path.join(D, 'cut'), exist_ok=True)
    tiles = []
    for name, (cols, rows, key) in FOLDERS[folder].items():
        im = np.asarray(Image.open(os.path.join(REF, folder, name + '.jpg')).convert('RGB')).astype(np.float32)
        h, w = im.shape[:2]
        cw, ch = w / cols, h / rows
        for r in range(rows):
            for c in range(cols):
                x0, y0 = int(c * cw) + INSET, int(r * ch) + INSET
                x1, y1 = int((c + 1) * cw) - INSET, int((r + 1) * ch) - INSET
                cell = cut_cell(im[y0:y1, x0:x1], key, depink=name in DEPINK)
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
