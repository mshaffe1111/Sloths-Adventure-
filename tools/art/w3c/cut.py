"""Cut Matt's four new World 3 sheets (2026-10-25): the thorn vine (4x4 grid), the Prowler's ring pieces and the sinkhole pieces (laid
out freely, found as separate blobs). The background is a magenta that is not quite pure, so it is measured off each sheet's border and
keyed out by how close a pixel is to it, then unmixed so soft edges keep their own colour."""
import sys, numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage
H = Path(__file__).resolve().parent
OUT = H / 'cut'; OUT.mkdir(exist_ok=True)

def key(a, bg):
    """alpha from a pixel's distance to the background colour, in a way that ignores brightness a little (shading on the magenta)"""
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    # magenta-ness: red and blue above green
    mag = (np.minimum(a[..., 0], a[..., 2]) - a[..., 1]) / 255.0
    bgmag = (min(bg[0], bg[2]) - bg[1]) / 255.0
    near = np.clip(1 - (d - 40) / 70, 0, 1)          # within ~40 of the bg: background
    pink = np.clip((mag - 0.25) / max(0.05, bgmag - 0.25), 0, 1)   # strongly magenta: background
    k = np.maximum(near, pink * (mag > 0.25))
    return 1 - k

def unmix(a, alpha, bg):
    safe = np.maximum(alpha, 1e-3)[..., None]
    return np.clip((a - (1 - alpha[..., None]) * bg) / safe, 0, 255)

def save(a, alpha, name, keep_one=True):
    fig = alpha > 0.5
    fig = ndimage.binary_opening(fig, iterations=2)
    lab, n = ndimage.label(fig)
    if n > 1 and keep_one:
        sizes = ndimage.sum(fig, lab, range(1, n + 1))
        fig = np.isin(lab, 1 + np.flatnonzero(sizes > sizes.max() * 0.02))
    near = ndimage.binary_dilation(fig, iterations=10)
    alpha = np.where(near, alpha, 0)
    return alpha

def border_bg(im):
    b = np.concatenate([im[:12].reshape(-1, 3), im[-12:].reshape(-1, 3), im[:, :12].reshape(-1, 3), im[:, -12:].reshape(-1, 3)])
    return np.median(b, axis=0)

def finish(a, alpha, bg, name):
    rgb = unmix(a, alpha, bg)
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)]), 'RGBA')
    bb = out.getbbox()
    out.crop(bb).save(OUT / f'{name}.png')
    return bb

# --- the thorn vine: 4 x 4 cells. Every frame keeps the same box (the top of the cell is where the vine is cut off), so frames line up
im = np.asarray(Image.open(H / 'src/thorn-4x.png').convert('RGB')).astype(np.float32)
bg = border_bg(im)
print('thorn bg', bg)
S = im.shape[0] // 4
boxes = {}
for i in range(16):
    cx, cy = i % 4, i // 4
    a = im[cy * S:(cy + 1) * S, cx * S:(cx + 1) * S]
    al = save(a, key(a, bg), f'thorn{i}')
    rgb = unmix(a, al, bg)
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')
    out.save(OUT / f'thornfull{i}.png')
    boxes[i] = out.getbbox()
print('thorn boxes', boxes)

# --- free layouts: each separate blob is a piece, named in reading order (top to bottom, then left to right)
def blobs(sheet, names, min_frac=0.01, where=None):
    im = np.asarray(Image.open(H / f'src/{sheet}-4x.png').convert('RGB')).astype(np.float32)
    bg = border_bg(im)
    alpha = key(im, bg)
    fig = ndimage.binary_opening(alpha > 0.5, iterations=3)
    fig = ndimage.binary_closing(fig, iterations=6)
    lab, n = ndimage.label(fig)
    sizes = ndimage.sum(fig, lab, range(1, n + 1))
    keep = [i + 1 for i in np.argsort(-sizes) if sizes[i] > fig.size * min_frac]
    objs = ndimage.find_objects(lab)
    items = []
    for li in keep:
        sl = objs[li - 1]
        cy = (sl[0].start + sl[0].stop) / 2; cx = (sl[1].start + sl[1].stop) / 2
        items.append((li, sl, cy, cx))
    # rows: group by centre height
    items.sort(key=lambda t: t[2])
    rows = []
    for it in items:
        if rows and abs(it[2] - np.mean([r[2] for r in rows[-1]])) < im.shape[0] * 0.18: rows[-1].append(it)
        else: rows.append([it])
    ordered = [it for r in rows for it in sorted(r, key=lambda t: t[3])]
    if where:
        # name each piece by the nearest expected centre (fractions of the sheet), biggest pieces first
        Hh, Ww = im.shape[:2]
        used = set(); named = {}
        for it in sorted(items, key=lambda t: -sizes[t[0] - 1]):
            best = min((n for n in where if n not in used), key=lambda n: (where[n][0] * Ww - it[3]) ** 2 + (where[n][1] * Hh - it[2]) ** 2, default=None)
            if best is None: break
            used.add(best); named[best] = it
        names = list(named); ordered = [named[n] for n in names]
    print(sheet, 'bg', bg, 'pieces', len(ordered))
    for name, (li, sl, cy, cx) in zip(names, ordered):
        m = ndimage.binary_dilation(lab == li, iterations=14)
        al = np.where(m, alpha, 0)
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        y0, x0 = max(0, y0 - 20), max(0, x0 - 20); y1, x1 = min(im.shape[0], y1 + 20), min(im.shape[1], x1 + 20)
        a2 = im[y0:y1, x0:x1]; al2 = al[y0:y1, x0:x1]
        # Gemini painted some dust and glow in magenta (the broken pillar, the trickle's splash, the eyes' haze): drop it
        pink = (np.minimum(a2[..., 0], a2[..., 2]) - a2[..., 1]) > 40
        al2 = np.where(pink, al2 * 0.0, al2)
        finish(a2, al2, bg, name)
        print(' ', name, (x1 - x0, y1 - y0))

blobs('ring', [], min_frac=0.002, where={'pillar': (0.16, 0.29), 'pillarCracked': (0.40, 0.29), 'pillarBroken': (0.75, 0.38), 'ringWall': (0.24, 0.73),
      'bones': (0.56, 0.67), 'catEyes': (0.84, 0.63), 'pawStrip': (0.72, 0.86)})
blobs('sinkhole', ['rim', 'wallTile', 'trickle', 'ledge', 'rootBridge', 'rootLadder'])
