"""Cut World 4's art (batches 1 and 2, Hugging Face, 2026-10-25) into pieces.

    python3 -I tools/art/w4/cut.py <dir with the picked sheets> [--names names.json]

Each sheet's background (magenta for the props, grey for the capuchin) is measured off its border and keyed out by how close a pixel
is to it, then unmixed so soft edges keep their own colour. Every separate blob is a piece. Without --names it writes every piece
numbered in reading order plus a labelled preview per sheet (to choose names); with --names ({sheet: {name: index}}) it writes only
the named pieces as <name>.png, ready for pack.py. A name can map to {"i": index, "rows": [top, bottom]} instead of a bare index to
keep only those pixel rows of the cut piece (a fall's top lip without the water column painted under it)."""
import json, sys
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw
from scipy import ndimage

H = Path(__file__).resolve().parent
SRC = Path(sys.argv[1])
NAMES = json.loads(Path(sys.argv[sys.argv.index('--names') + 1]).read_text()) if '--names' in sys.argv else None
OUT = H / ('cut' if NAMES else 'blobs')
OUT.mkdir(exist_ok=True)

SHEETS = ['w4p-cliff-11', 'w4p-cliff-33', 'w4p-fern-33', 'w4p-chimes-11', 'w4p-water-11', 'w4p-water-33', 'w4p-pools-11', 'w4p-pools-33',
          'w4-capuchin2-44', 'w4-capuchin2-11',
          # batch 2 (2026-10-25): 4-5's cover and fruit tree, the falls' lips, the eaglet's nests
          'w4p-cover-11', 'w4p-fruit-11', 'w4p-falllip-11', 'w4p-nests-11']


def border_bg(im):
    b = np.concatenate([im[:10].reshape(-1, 3), im[-10:].reshape(-1, 3), im[:, :10].reshape(-1, 3), im[:, -10:].reshape(-1, 3)])
    return np.median(b, axis=0)


def key(a, bg):
    """1 = figure, 0 = background. Magenta sheets also key anything strongly magenta (shading on the backdrop); grey sheets go by distance"""
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    near = np.clip(1 - (d - 30) / 60, 0, 1)
    bgmag = (min(bg[0], bg[2]) - bg[1]) / 255.0
    if bgmag > 0.3:
        mag = (np.minimum(a[..., 0], a[..., 2]) - a[..., 1]) / 255.0
        pink = np.clip((mag - 0.3) / max(0.05, bgmag - 0.3), 0, 1) * (mag > 0.3)
        near = np.maximum(near, pink)
    return 1 - near


# batch 2's sheets have a pale pink haze painted between leaves and strands: those sheets also get despilled
DESPILL = {'w4p-cover-11', 'w4p-fruit-11', 'w4p-falllip-11', 'w4p-nests-11'}


def despill(rgb, alpha):
    """Pull the magenta out: nothing the painter meant has red and blue both above green (foliage, rock, bark, orange, feathers),
    so that excess is spill. Light pink (haze lit by the backdrop) fades out; darker tints just lose the pink."""
    ex = np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]
    haze = np.clip((ex - 20) / 50, 0, 1) * np.clip((rgb[..., 0] - 140) / 60, 0, 1)
    alpha = alpha * (1 - haze)
    e = np.maximum(0, ex - 10)
    rgb = rgb.copy()
    rgb[..., 0] -= e
    rgb[..., 2] -= e
    return np.clip(rgb, 0, 255), alpha


def unmix(a, alpha, bg):
    safe = np.maximum(alpha, 1e-3)[..., None]
    return np.clip((a - (1 - alpha[..., None]) * bg) / safe, 0, 255)


for sheet in SHEETS:
    if NAMES is not None and sheet not in NAMES:
        continue
    if not (SRC / f'{sheet}.png').exists():
        # an earlier batch's sheet that isn't on disk: its cut pieces in cut/ stay as they are
        print(sheet, 'not in', SRC, '- skipped')
        continue
    im = np.asarray(Image.open(SRC / f'{sheet}.png').convert('RGB')).astype(np.float32)
    bg = border_bg(im)
    alpha = key(im, bg)
    fig = ndimage.binary_opening(alpha > 0.5, iterations=2)
    fig = ndimage.binary_closing(fig, iterations=5)
    lab, n = ndimage.label(fig)
    sizes = ndimage.sum(fig, lab, range(1, n + 1))
    objs = ndimage.find_objects(lab)
    keep = [i for i in range(n) if sizes[i] > fig.size * 0.0015]
    # reading order: rows by centre height, then left to right
    items = sorted(((i, objs[i]) for i in keep), key=lambda t: ((t[1][0].start + t[1][0].stop) / 2))
    rows = []
    for it in items:
        cy = (it[1][0].start + it[1][0].stop) / 2
        if rows and abs(cy - rows[-1][0]) < im.shape[0] * 0.15:
            rows[-1][1].append(it)
        else:
            rows.append([cy, [it]])
    ordered = [it for _, r in rows for it in sorted(r, key=lambda t: t[1][1].start)]
    print(sheet, 'bg', bg.round(), 'pieces', len(ordered))
    if NAMES is None:
        for k, (li, sl) in enumerate(ordered):
            print(f'  {k}: centre {((sl[1].start + sl[1].stop) / 2 / im.shape[1]):.2f},{((sl[0].start + sl[0].stop) / 2 / im.shape[0]):.2f} size {sl[1].stop - sl[1].start}x{sl[0].stop - sl[0].start}')
    want = NAMES[sheet] if NAMES is not None else {f'{sheet}_{k}': k for k in range(len(ordered))}
    prev = Image.fromarray(im.astype(np.uint8)).convert('RGB')
    dr = ImageDraw.Draw(prev)
    for name, k in want.items():
        rows_keep = k.get('rows') if isinstance(k, dict) else None
        k = k['i'] if isinstance(k, dict) else k
        li, sl = ordered[k]
        m = ndimage.binary_dilation(lab == li + 1, iterations=8)
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        y0, x0 = max(0, y0 - 12), max(0, x0 - 12)
        y1, x1 = min(im.shape[0], y1 + 12), min(im.shape[1], x1 + 12)
        a2 = im[y0:y1, x0:x1]
        al2 = np.where(m[y0:y1, x0:x1], alpha[y0:y1, x0:x1], 0)
        rgb = unmix(a2, al2, bg)
        if sheet in DESPILL:
            rgb, al2 = despill(rgb, al2)
        out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al2 * 255).astype(np.uint8)]), 'RGBA')
        out = out.crop(out.getbbox())
        if rows_keep:
            out = out.crop((0, rows_keep[0], out.width, min(out.height, rows_keep[1])))
            out = out.crop(out.getbbox())
        out.save(OUT / f'{name}.png')
        dr.rectangle([x0, y0, x1, y1], outline=(255, 255, 0), width=3)
        dr.text((x0 + 6, y0 + 4), str(k), fill=(255, 255, 0))
    if NAMES is None:
        prev.thumbnail((900, 900))
        prev.save(OUT / f'preview-{sheet}.jpg', quality=80)
