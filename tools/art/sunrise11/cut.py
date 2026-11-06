"""1-1's new sunrise strips (art-1-1-sunrise, 2026-11-05): from a picked take to the keyed working file the native pass reads, and from
the native pass to the game strips. The old w1sunrise-mid kept a cut trunk at its join (268 px tall at its left edge, empty at its
right): a tree stood in one end's join band and not the other's. `mid` here picks the crop whose two join bands both hold only ground,
and fails rather than join a tree to empty air.

    python3 -I tools/art/sunrise11/cut.py tall <take.png> <name>            far + sky take -> keyed/<name>.webp (joined end to end)
    python3 -I tools/art/sunrise11/cut.py mid <take.png> <name>             magenta take -> keyed/<name>.webp (keyed, clean join)
    python3 -I tools/art/sunrise11/cut.py bands <keyed.webp>                how much paint stands in each end's join band
    python3 -I tools/art/sunrise11/cut.py strip3 <img> <out.jpg> [bg]       three copies side by side, the seam check
"""
import importlib.util, sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
KEYED = ROOT / 'reference/prop-sheets/qa-notes/art-1-1-sunrise/keyed'
BAND = 256  # (the join band, as process.py keyfull)
MIDW = 1792  # (the take's width after the join: 2113 at 1302 tall, the shipped w1sunrise-mid's size)


def mod(p, name):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


bs = mod(ROOT / 'scripts/backdrop-strip.py', 'bs')


def tall(take, name):
    a = np.asarray(Image.open(take).convert('RGB')).astype(float)
    rgba = np.concatenate([a, np.ones(a.shape[:2] + (1,))], axis=-1)
    o = bs.seamless(rgba, 320)
    KEYED.mkdir(parents=True, exist_ok=True)
    out = KEYED / f'{name}.webp'
    Image.fromarray(np.clip(o[..., :3], 0, 255).astype(np.uint8)).save(out, 'WEBP', quality=92, method=6)
    print(out.name, a.shape[1], '->', o.shape[1])


def cover(al, ground=0.1):
    """per column, how much paint stands above the strip's ground band (0-1 of the height above it)"""
    h = al.shape[0]
    g = round(h * ground)
    return (al[: h - g] > 0.25).mean(0)


def mid(take, name):
    from scipy import ndimage
    a = np.asarray(Image.open(take).convert('RGB')).astype(float)
    rgb, al = bs.key_out(a, bs.key_colour(a))
    c = cover(al)
    W = a.shape[1]
    # every crop [x0, x0 + MIDW + BAND) that fits; the join takes its last BAND columns onto its first. Score: paint in either band.
    best = None
    for x0 in range(0, W - MIDW - BAND + 1, 4):
        s = max(c[x0:x0 + BAND].max(), c[x0 + MIDW:x0 + MIDW + BAND].max())
        if best is None or s < best[0]:
            best = (s, x0)
    s, x0 = best
    print(f'crop x0 {x0}, the most paint in a join band column {s:.3f} of the height above the ground')
    if s > 0.12:
        sys.exit(f'{name}: a tree stands in a join band ({s:.2f}); this take cannot join cleanly')
    rgba = np.concatenate([rgb, al[..., None]], axis=-1)[:, x0:x0 + MIDW + BAND]
    o = bs.seamless(rgba, BAND)
    lab, n = ndimage.label(o[..., 3] > 0.25)
    keep = np.isin(lab, list(set(np.unique(lab[-max(8, lab.shape[0] // 12):])) - {0}))
    o[..., 3] *= ndimage.binary_dilation(keep, iterations=3)
    KEYED.mkdir(parents=True, exist_ok=True)
    out = KEYED / f'{name}.webp'
    Image.fromarray(np.dstack([np.clip(o[..., :3], 0, 255), np.clip(o[..., 3] * 255, 0, 255)]).astype(np.uint8), 'RGBA').save(
        out, 'WEBP', quality=92, method=6)
    print(out.name, W, '->', o.shape[1])


def bands(p):
    im = np.asarray(Image.open(p).convert('RGBA')).astype(float) / 255
    c = cover(im[..., 3])
    print(Path(p).name, im.shape[1], 'x', im.shape[0], f'left 64 px {c[:64].max():.3f}  right 64 px {c[-64:].max():.3f}')


def strip3(p, out, bg='150,180,210'):
    im = Image.open(p).convert('RGBA')
    t = Image.new('RGBA', (im.width * 3, im.height), tuple(int(v) for v in bg.split(',')) + (255,))
    for i in range(3):
        t.alpha_composite(im, (i * im.width, 0))
    k = 2400 / t.width
    t.convert('RGB').resize((2400, round(t.height * k)), Image.LANCZOS).save(out, quality=88)


if __name__ == '__main__':
    c, a = sys.argv[1], sys.argv[2:]
    {'tall': lambda: tall(*a), 'mid': lambda: mid(*a), 'bands': lambda: bands(*a), 'strip3': lambda: strip3(*a)}[c]()
