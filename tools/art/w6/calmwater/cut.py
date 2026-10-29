"""Cut Matt's calm, clean World 6 water (2026-10-29) from his World 6 water sheet, reference/prop-sheets/w6/water.jpg, into the
calm-water atlas src/assets/props/w6-calm-water.webp (calmWaterArt.ts draws it: the water Pokey can swim in).

    python3 -I tools/art/w6/calmwater/cut.py

Row 1, cells 1 and 2: the still strip and the gently rippled strip (clean grey-teal). Each is keyed off the magenta, de-spilled, and its
ends cross-faded (the last OVERLAP px of the strip fade in over its first ones) so copies laid end to end meet with no seam.
Row 2, cells 1 and 2: the ripple ring and the rising bubbles, faint white on the magenta: un-mixed from the key colour (alpha from how
far each pixel is from the magenta toward white), so their soft edges keep no pink.
Prints the atlas boxes for calmWaterArt.ts FRAMES.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SRC = ROOT / 'reference/prop-sheets/w6/water.jpg'
OUT = ROOT / 'src/assets/props/w6-calm-water.webp'
OVERLAP = 48
# (x0, y0, x1, y1) in the sheet: measured from the key (keyness < 0.3), a few px inside the strips' ends to leave the soft edge out
STRIPS = {'calm': (13, 108, 241, 151), 'ripple': (269, 100, 498, 151)}
GLOWS = {'ring': (14, 368, 242, 412), 'bubbles': (356, 312, 412, 462)}


def keyness(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)


def strip(rgb):
    k = keyness(rgb)
    a = np.clip((0.42 - k) / 0.22, 0, 1)
    out = rgb.copy()
    # de-spill: the soft edge's extra red and blue pulled back toward its green
    # (the water is grey-teal: red never above its green, blue a little; on and near the soft edge the key's pink is clamped out)
    edge = a < 0.999
    near = np.zeros_like(edge)
    for dy in range(-3, 4):
        near |= np.roll(edge, dy, axis=0)
    out[..., 0] = np.where(near, np.minimum(out[..., 0], out[..., 1]), out[..., 0])
    out[..., 2] = np.where(near, np.minimum(out[..., 2], out[..., 1] + 10), out[..., 2])
    # the strips' sides are straight cuts: keep the full columns, key only the top and bottom edges
    w = out.shape[1]
    o = OVERLAP
    t = (np.arange(o) / (o - 1))[None, :, None]
    rgba = np.dstack([out, a * 255])
    seam = rgba[:, :o] * t + rgba[:, w - o:] * (1 - t)
    return np.concatenate([seam, rgba[:, o:w - o]], axis=1)


def glow(rgb):
    # the background magenta, and the white the ring and bubbles are painted in: alpha is how far toward white (by green, the channel
    # the magenta lacks)
    bg = np.median(rgb[:6].reshape(-1, 3), axis=0)
    white = np.array([236.0, 240.0, 244.0])
    a = np.clip((rgb[..., 1] - bg[1] - 6) / (white[1] - bg[1]), 0, 1)
    # (painted a pale blue-white: the un-mixed colour of a pixel this faint is mostly noise)
    col = np.broadcast_to(np.array([226.0, 238.0, 244.0]), rgb.shape)
    return np.dstack([col, a * 255])


def main():
    sheet = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
    parts = {}
    for n, (x0, y0, x1, y1) in STRIPS.items():
        parts[n] = strip(sheet[y0:y1, x0:x1])
    for n, (x0, y0, x1, y1) in GLOWS.items():
        parts[n] = glow(sheet[y0:y1, x0:x1])
    W = max(p.shape[1] for p in parts.values())
    H = sum(p.shape[0] + 2 for p in parts.values())
    atlas = np.zeros((H, W, 4), np.float32)
    y = 0
    for n, p in parts.items():
        h, w = p.shape[:2]
        atlas[y:y + h, :w] = p
        print(f'  {n}: {{ x: 0, y: {y}, w: {w}, h: {h} }},')
        y += h + 2
    img = Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8), 'RGBA')
    img.save(OUT, 'WEBP', quality=92, method=6)
    print(OUT, img.size)


if __name__ == '__main__':
    main()
