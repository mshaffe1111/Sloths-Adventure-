"""Cut the art for Dot's netting flight (Hugging Face, 2026-10-25) into pieces. Same approach as tools/art/w4/cut.py.

    python3 -I tools/art/dotstage/cut.py <dir with the dotst-* sheets> <dir with the w4p-netting-* sheets> [--names names.json]

The sheets sit on a hot pink, not a pure magenta, and the flowers on them are pink and red too, so a plain distance key would eat
petals. The background is therefore only what is near the border's colour AND joined to the border; inside a piece nothing is keyed.
Its edge is then softened over a few pixels by how close each edge pixel is to the background, and unmixed so it keeps its own colour.
Without --names it writes every piece numbered in reading order plus a labelled preview per sheet (to choose names); with --names
({sheet: {name: index}}) it writes only the named pieces as <name>.png, ready for pack.py."""
import json, sys
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw
from scipy import ndimage

H = Path(__file__).resolve().parent
SRC = [Path(sys.argv[1]), Path(sys.argv[2])]
NAMES = json.loads(Path(sys.argv[sys.argv.index('--names') + 1]).read_text()) if '--names' in sys.argv else None
OUT = H / ('cut' if NAMES else 'blobs')
OUT.mkdir(exist_ok=True)

# pieces with holes the backdrop shows through (the web's gaps, the iron mesh): any pixel that is clearly pink is keyed out, not only
# what joins the border. (Not for the flowers: their petals are pink.)
HOLES = {'silk', 'silkWide', 'panel', 'panelTorn', 'ring', 'chain', 'chainHook', 'strandHook', 'blueCluster', 'blueCluster2', 'vine', 'trumpet'}

SHEETS = ['dotst-nectar-11', 'dotst-nectar-33', 'dotst-bits-11', 'dotst-bits-33', 'w4p-netting-11', 'w4p-netting-33']


def find(sheet):
    for d in SRC:
        if (d / f'{sheet}.png').exists():
            return d / f'{sheet}.png'
    raise FileNotFoundError(sheet)


def border_bg(im):
    b = np.concatenate([im[:10].reshape(-1, 3), im[-10:].reshape(-1, 3), im[:, :10].reshape(-1, 3), im[:, -10:].reshape(-1, 3)])
    return np.median(b, axis=0)


def key(a, bg):
    """alpha: 1 = figure, 0 = background"""
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    # the backdrop has soft shading (the netting sheet even has darker tiles), so "near" is generous, but only where it joins the border
    near = d < 70
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgm = np.isin(lab, list(edge))
    bgm = ndimage.binary_opening(bgm, iterations=1)
    fig = ~bgm
    # a soft edge: within 3 px of the background, alpha follows the distance from the backdrop colour
    band = fig & ~ndimage.binary_erosion(fig, iterations=3)
    soft = np.clip((d - 25) / 70, 0, 1)
    alpha = np.where(band, np.maximum(soft, 0.15), fig.astype(np.float32))
    return alpha.astype(np.float32), fig


def unmix(a, alpha, bg):
    safe = np.maximum(alpha, 1e-3)[..., None]
    return np.clip((a - (1 - alpha[..., None]) * bg) / safe, 0, 255)


for sheet in SHEETS:
    if NAMES is not None and sheet not in NAMES:
        continue
    im = np.asarray(Image.open(find(sheet)).convert('RGB')).astype(np.float32)
    bg = border_bg(im)
    alpha, fig = key(im, bg)
    fig = ndimage.binary_opening(fig, iterations=2)
    lab, n = ndimage.label(ndimage.binary_closing(fig, iterations=4))
    sizes = ndimage.sum(fig, lab, range(1, n + 1))
    objs = ndimage.find_objects(lab)
    keep = [i for i in range(n) if sizes[i] > fig.size * 0.002]
    items = sorted(((i, objs[i]) for i in keep), key=lambda t: ((t[1][0].start + t[1][0].stop) / 2))
    rows = []
    for it in items:
        cy = (it[1][0].start + it[1][0].stop) / 2
        if rows and abs(cy - rows[-1][0]) < im.shape[0] * 0.18:
            rows[-1][1].append(it)
        else:
            rows.append([cy, [it]])
    ordered = [it for _, r in rows for it in sorted(r, key=lambda t: t[1][1].start)]
    print(sheet, 'bg', bg.round(), 'pieces', len(ordered))
    want = NAMES[sheet] if NAMES is not None else {f'{sheet}_{k}': k for k in range(len(ordered))}
    prev = Image.fromarray(im.astype(np.uint8)).convert('RGB')
    dr = ImageDraw.Draw(prev)
    for name, k in want.items():
        li, sl = ordered[k]
        m = lab == li + 1
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        y0, x0 = max(0, y0 - 6), max(0, x0 - 6)
        y1, x1 = min(im.shape[0], y1 + 6), min(im.shape[1], x1 + 6)
        a2 = im[y0:y1, x0:x1]
        al2 = np.where(m[y0:y1, x0:x1], alpha[y0:y1, x0:x1], 0)
        if name in HOLES:
            pink = np.minimum(a2[..., 0], a2[..., 2]) - a2[..., 1]
            d2 = np.sqrt(((a2 - bg) ** 2).sum(-1))
            hole = np.maximum(np.clip((pink - 45) / 40, 0, 1), np.clip(1 - (d2 - 40) / 40, 0, 1))
            al2 = al2 * (1 - hole)
        rgb = unmix(a2, al2, bg)
        out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al2 * 255).astype(np.uint8)]), 'RGBA')
        out.crop(out.getbbox()).save(OUT / f'{name}.png')
        dr.rectangle([x0, y0, x1, y1], outline=(255, 255, 0), width=3)
        dr.text((x0 + 6, y0 + 4), str(k), fill=(255, 255, 0))
    if NAMES is None:
        prev.thumbnail((900, 900))
        prev.save(OUT / f'preview-{sheet}.jpg', quality=80)
