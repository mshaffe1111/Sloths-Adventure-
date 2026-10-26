"""World 5's painted backdrops (Orchid Sanctuary concept art, Hugging Face mshaffe111/slothadv-w5art, approved by Matt 2026-10-26).

    python3 -I tools/art/w5/backdrops.py <w5art dir>

<w5art dir> holds the keyed layers (backdrops/w5b-<mood>-<far|mid|near>-g<take>.png, 2048x868, mid and near already cut out of
their key colour) and the arena paintings (arena/w5arena-<table|webs>-<take>.png). Writes src/assets/backdrops/:
  w5-far/mid/near.webp              golden afternoon, take A (also the world's face on the map, the title and the stories)
  w5gold2-*, w5dusk1-*, w5dusk2-*, w5twi1-*, w5twi2-*   the other takes (src/game/w5Backdrop.ts maps stages to them)
  w5arena-table.webp, w5arena-webs.webp                 the council's garden: the 5-10 fight, and the intro and tea scene
The far strips are opaque; mid and near keep their transparent tops. Dusk B's middle trees (g33) had the low sun's glow painted into
the cut-out: that glow is keyed out here (large lime-to-amber blobs in the top right only)."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parents[3] / 'src/assets/backdrops'

# (output name, far, mid, near): the layer takes picked in review.html, except dusk B's middle trees (see above)
SETS = [
    ('w5', 'gold-far-g11', 'gold-mid-g11', 'gold-near-g22'),
    ('w5gold2', 'gold-far-g22', 'gold-mid-g22', 'gold-near-g33'),
    ('w5dusk1', 'dusk-far-g11', 'dusk-mid-g11', 'dusk-near-g22'),
    ('w5dusk2', 'dusk-far-g22', 'dusk-mid-g33', 'dusk-near-g11'),
    ('w5twi1', 'twi-far-g11', 'twi-mid-g11', 'twi-near-g22'),
    ('w5twi2', 'twi-far-g22', 'twi-mid-g33', 'twi-near-g33'),
]
# arena A (the long lace table, Iron-Claw's head chair at the right end, the most open floor) and arena C (the grand court: drapes
# and the dewy web canopy)
ARENA = {'w5arena-table': 'w5arena-table-11', 'w5arena-webs': 'w5arena-webs-11'}


def hue_sat_val(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = np.maximum(mx - mn, 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / np.maximum(mx, 1e-6), mx


def unglow(a):
    """key out the sun's glow painted into a cut-out's top right (large blobs only, so orchid hearts and lit bark stay)"""
    h, s, v = hue_sat_val(a[..., :3] / 255.0)
    H, W = v.shape
    yy, xx = np.mgrid[0:H, 0:W]
    region = (xx > W * 0.62) & (yy < H * 0.62)
    m = region & (((h > 40) & (h < 120) & (s > 0.25) & (v > 0.55)) | ((h > 20) & (h < 60) & (v > 0.8) & (s > 0.2)))
    m = ndimage.binary_dilation(m, iterations=2) & region & (h > 20) & (h < 140)
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    big = np.isin(lab, 1 + np.flatnonzero(sizes > 2000))
    a = a.copy()
    a[..., 3] = np.where(big, 0, a[..., 3])
    return a


def save(im, name, q):
    p = OUT / f'{name}.webp'
    im.save(p, 'WEBP', quality=q, method=6)
    return p.stat().st_size


total = 0
for name, *layers in SETS:
    for part, src in zip(('far', 'mid', 'near'), layers):
        im = Image.open(SRC / 'backdrops' / f'w5b-{src}.png').convert('RGBA')
        if src == 'dusk-mid-g33':
            im = Image.fromarray(unglow(np.asarray(im)), 'RGBA')
        if part == 'far':
            im = im.convert('RGB')
        else:
            # clear pixels carry no colour, so the encoder spends nothing on them
            a = np.asarray(im).copy()
            a[a[..., 3] == 0, :3] = 0
            im = Image.fromarray(a, 'RGBA')
        n = save(im, f'{name}-{part}', 82)
        total += n
        print(f'{name}-{part}', im.size, n)
for name, src in ARENA.items():
    im = Image.open(SRC / 'arena' / f'{src}.png').convert('RGB')
    n = save(im, name, 84)
    total += n
    print(name, im.size, n)
print('total', total)
