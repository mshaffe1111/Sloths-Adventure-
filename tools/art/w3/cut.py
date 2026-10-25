"""Cut Matt's two World 3 sheets (grotto pieces, ferns and hiding places) into pieces: w3/cut/<name>.png.

Each sheet is a 3 x 2 grid on magenta with black grid lines; some cells carry a grey band (a strip of cave roof along the top of the top
row of the grotto sheet, a strip of floor along the bottom of its bottom row). The band is cut off where the magenta starts, the grid
lines are trimmed off each cell, then the magenta is keyed out with a soft edge and the biggest piece (plus anything big touching it)
is kept.
"""
import numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage

H = Path(__file__).resolve().parent
OUT = H / 'cut'
OUT.mkdir(exist_ok=True)
SHEETS = {
    'grotto': ['glowLit', 'glowDim', 'stalactite', 'stalagmites', 'mushrooms', 'grottoMouth'],
    'ferns': ['fern', 'fernRustle', 'mossCurtain', 'hollowLog', 'pawprint', 'clawRock'],
}
# which edge of a cell has a grey band to cut off (the band is not magenta and not the prop)
BAND = {('grotto', 0): 'top', ('grotto', 1): 'top', ('grotto', 2): 'top',
        ('grotto', 3): 'bottom', ('grotto', 4): 'bottom', ('grotto', 5): 'bottom'}


def magenta(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)


for sheet, names in SHEETS.items():
    im = np.asarray(Image.open(H / f'src/{sheet}-4x.png').convert('RGB')).astype(np.float32)
    Hh, Ww = im.shape[:2]
    m = magenta(im)
    globals().pop('floorTop', None)
    for k, name in enumerate(names):
        cx, cy = k % 3, k // 3
        x0, x1 = round(Ww * cx / 3) + 18, round(Ww * (cx + 1) / 3) - 18
        y0, y1 = round(Hh * cy / 2) + 18, round(Hh * (cy + 1) / 2) - 18
        a = im[y0:y1, x0:x1]
        mm = m[y0:y1, x0:x1]
        frac = (mm > 0.38).mean(axis=1)
        band = BAND.get((sheet, k))
        if band == 'top':
            first = int(np.argmax(frac > 0.35))
            a, mm = a[first + 6:], mm[first + 6:]
        elif band == 'bottom':
            # the floor strip runs along the whole row: find its top in the stalagmite cell (open magenta above it) and use it for all three
            if 'floorTop' not in globals():
                gx0, gx1 = 18, round(Ww / 3) - 18
                gm = m[y0:y1, gx0:gx1]
                rows = np.nonzero((gm > 0.38).mean(axis=1) > 0.35)[0]
                globals()['floorTop'] = int(rows.max()) - 4
            a, mm = a[:floorTop], mm[:floorTop]
        fig = mm < 0.38
        fig = ndimage.binary_opening(fig, iterations=2)
        lab, n = ndimage.label(fig)
        if n > 1:
            sizes = ndimage.sum(fig, lab, range(1, n + 1))
            fig = np.isin(lab, 1 + np.flatnonzero(sizes > max(3000, sizes.max() * 0.004)))
        # unmix the magenta: a pixel is alpha * colour + (1 - alpha) * magenta. How much magenta is in it is how far its red and blue
        # stand above its green (all the way for pure magenta), so a glow's halo on the magenta keeps its glow and loses the pink
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        k = np.clip((np.minimum(r, b) - g) / np.maximum(1.0, 255.0 - g), 0, 1)
        k = np.clip((k - 0.06) / 0.94, 0, 1)
        alpha = (1 - k)
        alpha = np.where(fig | (alpha > 0.15), alpha, 0)
        # keep only what touches the kept figure (drops stray specks of halo far from it)
        near = ndimage.binary_dilation(fig, iterations=24)
        alpha = np.where(near, alpha, 0)
        safe = np.maximum(alpha, 1e-3)[..., None]
        M = np.array([255.0, 0.0, 255.0])
        rgb = np.clip((a - (1 - alpha[..., None]) * M) / safe, 0, 255)
        out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)]), 'RGBA')
        out = out.crop(out.getbbox())
        out.save(OUT / f'{name}.png')
        print(name, out.size)
