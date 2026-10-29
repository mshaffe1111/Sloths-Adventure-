"""The keying and review helpers the boss art cuts share (bosscut.py, bosscut4.py): the key flooded in from the piece's own box border,
a soft rim from how much key a pixel holds, the key's spill clamped off the rim, crumbs dropped, then trimmed; and the review sheets.
Imported with sys.argv = [script, <takes dir>, <game checkout>].
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

GAME = Path(sys.argv[2])
QA = GAME / 'reference/prop-sheets/qa-notes/hf-art-bosses'
QA.mkdir(parents=True, exist_ok=True)


def keyness(a, key):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.minimum(r, b) - g if key == 'magenta' else g - np.maximum(r, b)


def cut(im, key, box=None, crumbs=60, mainOnly=False, trim=True):
    if box:
        im = im.crop(box)
    a = np.asarray(im).astype(np.float32)
    k = keyness(a, key)
    bg_like = k > 90
    lab, n = ndimage.label(bg_like)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)) | (k > 150)
    alpha = np.where(bg, 0.0, 1.0)
    rim = ndimage.binary_dilation(alpha == 0, iterations=2) & (alpha > 0)
    alpha = np.where(rim, np.minimum(alpha, np.clip((140 - k) / 110, 0, 1)), alpha)
    alpha = np.minimum(alpha, np.clip((160 - k) / 100, 0, 1))
    band = ndimage.binary_dilation(alpha < 0.5, iterations=4) | (k > 20)
    if key == 'magenta':
        ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 8, 0, None) * band
        a[..., 0] -= ex; a[..., 2] -= ex
    else:
        ex = np.clip(a[..., 1] - np.maximum(a[..., 0], a[..., 2]) - 8, 0, None) * band
        a[..., 1] -= ex
    lab, n = ndimage.label(alpha > 0.5)
    if n:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
        biggest = int(np.argmax(sizes)) + 1
        for i, s in enumerate(sizes, 1):
            if s < crumbs or (mainOnly and i != biggest):
                alpha[lab == i] = 0
    o = Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
    if not trim:
        return o
    bb = o.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    return o.crop(bb) if bb else o


def review(name, pieces, game_h=None):
    """each piece on dark and on mid-grey, full size (scaled to fit) and at about game size"""
    rows = []
    for label, p in pieces:
        s = min(1.0, 700 / p.width, 300 / p.height)
        big = p.resize((max(1, round(p.width * s)), max(1, round(p.height * s))), Image.LANCZOS)
        gs = (game_h / p.height) if game_h else 0.3
        small = p.resize((max(1, round(p.width * gs)), max(1, round(p.height * gs))), Image.LANCZOS)
        rows.append((label, big, small))
    W = 2 * 720 + 2 * 260
    H = sum(max(r[1].height, r[2].height) + 30 for r in rows) + 10
    S = Image.new('RGB', (W, H), (30, 30, 30))
    d = ImageDraw.Draw(S)
    y = 6
    for label, big, small in rows:
        h = max(big.height, small.height) + 24
        for i, (bg, im, w) in enumerate((((20, 16, 24), big, 720), ((128, 128, 128), big, 720), ((20, 16, 24), small, 260), ((128, 128, 128), small, 260))):
            x = [0, 720, 1440, 1700][i]
            tile = Image.new('RGBA', (w, h - 20), bg + (255,))
            tile.alpha_composite(im, (max(0, (w - im.width) // 2), max(0, (h - 20 - im.height) // 2)))
            S.paste(tile.convert('RGB'), (x, y + 20))
        d.text((4, y + 4), label, fill=(255, 230, 0))
        y += h + 6
    S.save(QA / f'review-{name}.jpg', quality=86)
