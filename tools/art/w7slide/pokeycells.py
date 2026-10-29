"""World 7-4 "The Slide" (2026-10-29): cut Pokey's from-behind poses out of reference/animation-sheets/slomatt/02_sliding-from-behind-
seated-jump.jpg, lift him off the parchment and the drawn slope, and lay him on the flat grey (200) the Pokey model's starts use.

    python3 -I tools/art/w7slide/pokeycells.py <out dir>

The satchel check (hero-standard.webp / hero-story.webp): the strap crosses his LEFT shoulder and the bag rides on his RIGHT hip, so seen
from behind the strap runs from the viewer's upper left down to a bag on the viewer's right. Cells 1-8 and 16 have it mirrored (strap
from the upper right, bag on the left); cells 9-15 are right. A mirrored copy of a wrong straight-on cell (1, 4) is right again (both
wrists are wrapped and the face is hidden), so the straight slide comes from 1 and 4 flipped; the left lean from 10 and 9 as drawn.
No right lean is right as drawn (5-8 are wrong; 9-12 flipped would be wrong too).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

REPO = Path(__file__).resolve().parents[3]
SHEET = REPO / 'reference/animation-sheets/slomatt/02_sliding-from-behind-seated-jump.jpg'
ROWS = {1: (51, 173), 2: (220, 344), 3: (390, 515)}
CELLS = {1: (1, 42, 193), 4: (1, 630, 793), 9: (2, 630, 795), 10: (2, 828, 983), 14: (3, 528, 656), 13: (3, 383, 508)}
SATCHEL_OK = {1: False, 2: False, 3: False, 4: False, 5: False, 6: False, 7: False, 8: False,
              9: True, 10: True, 11: True, 12: True, 13: True, 14: True, 15: True, 16: False}
# name: (cell, mirrored)
TAKES = {'straight-a': (1, True), 'straight-b': (4, True), 'lean-left': (10, False), 'prep-left': (9, False), 'jump': (14, False)}
GREY = (200, 200, 200)
# the drawn slope under him, as a line in the cell's own px (y at its left edge, y at its right edge); he keeps what is above it
GROUND = {1: (109, 109), 9: (93, 124), 10: (101, 104)}


def lift(cell):
    """his body: the warm orange-brown fur and his darker outline, the biggest piece; parchment, slope and dust drop out"""
    a = np.asarray(cell.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    fur = (sat > 0.42) & (mx < 235) & (r > b + 40)
    wrap = (mx > 200) & (sat < 0.3) & (r > b)  # pale wrist wraps
    m = ndimage.binary_closing(fur, iterations=3)
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    m = lab == 1 + int(np.argmax(sizes))
    m = ndimage.binary_fill_holes(ndimage.binary_closing(m | (wrap & ndimage.binary_dilation(m, iterations=6)), iterations=4))
    m = ndimage.binary_dilation(m, iterations=1)
    return m


def start(cellno, mirror, size=1024):
    y0, y1 = ROWS[CELLS[cellno][0]]
    _, x0, x1 = CELLS[cellno]
    cell = Image.open(SHEET).convert('RGB').crop((x0, y0, x1, y1))
    cell = cell.resize((cell.width * 4, cell.height * 4), Image.LANCZOS)
    m = lift(cell)
    if cellno in GROUND:
        ya, yb = GROUND[cellno]
        h, w = m.shape
        yy, xx = np.mgrid[0:h, 0:w]
        m &= yy < 4 * (ya + (yb - ya) * xx / w)
        lab, n = ndimage.label(m)
        m = lab == 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1))))
    ys, xs = np.nonzero(m)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fig = cell.crop(box)
    alpha = Image.fromarray((m[box[1]:box[3], box[0]:box[2]] * 255).astype(np.uint8)).filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(1.2))
    if mirror:
        fig, alpha = ImageOps.mirror(fig), ImageOps.mirror(alpha)
    k = size * 0.72 / max(fig.size)
    fig = fig.resize((round(fig.width * k), round(fig.height * k)), Image.LANCZOS)
    alpha = alpha.resize(fig.size, Image.LANCZOS)
    c = Image.new('RGB', (size, size), GREY)
    c.paste(fig, ((size - fig.width) // 2, (size - fig.height) // 2), alpha)
    return c


if __name__ == '__main__':
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    for name, (cn, mir) in TAKES.items():
        start(cn, mir).save(out / f'pokey-{name}.png')
        print(name, cn, 'mirrored' if mir else 'as drawn')
