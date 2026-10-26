"""Pack the picked medal pictures into the game's medal sheet (2026-10-26).

    python3 -I tools/art/medals/pack.py <dir of unpacked pictures> [picks.json]

The pictures come from medals_gpu.py's carriers (tools/art/w5/unpack_carrier.py <carrier.png> <dir>), 512 px on flat grey. picks.json
(beside this file) names the take used for each tier medallion and each emblem. Each is cut from its grey (the grey that reaches the
picture's edge), cropped, and packed into src/assets/medals/medals.webp, with its place in src/game/medalAtlasData.ts. For a
medallion the data also gives the middle and radius of its green enamel (fractions of the frame), where the emblem goes.
Also writes a close-up sheet of every piece to tools/art/medals/sheet.png (git ignores pictures).
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SRC = Path(sys.argv[1])
PICKS = json.loads((Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / 'picks.json').read_text())
MED_PX = 288   # a medallion frame (3x a 96 css px medal)
EMB_PX = 192   # an emblem frame


def cut(rgb: np.ndarray, tol: int = 22, round_piece: bool = False) -> np.ndarray:
    """alpha: everything but the flat grey that reaches the edge, specks dropped, a soft one-pixel edge. A medallion (`round_piece`) is
    filled solid; an emblem's shut-in pockets of the plain grey (the hole of a coiled rope, a key's bow) are cut out too"""
    a = rgb.astype(np.int16)
    border = np.concatenate([a[:3].reshape(-1, 3), a[-3:].reshape(-1, 3), a[:, :3].reshape(-1, 3), a[:, -3:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.abs(a - bg).max(axis=2)
    lab, _ = ndimage.label(d < tol)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fig = ~np.isin(lab, edge[edge > 0])
    lab2, n = ndimage.label(fig)
    if n > 1:
        sizes = ndimage.sum(fig, lab2, range(1, n + 1))
        fig = np.isin(lab2, 1 + np.flatnonzero(sizes > max(60, sizes.max() * 0.015)))
    if round_piece:
        fig = ndimage.binary_fill_holes(fig)
    else:
        lab3, n3 = ndimage.label((d < tol - 6) & fig)
        if n3:
            sizes = ndimage.sum(np.ones_like(d), lab3, range(1, n3 + 1))
            fig &= ~np.isin(lab3, 1 + np.flatnonzero(sizes > 120))
    inner = ndimage.binary_erosion(fig, iterations=1)
    return np.where(inner, 255, np.where(fig, np.clip((d - 6) * 10, 0, 255), 0)).astype(np.uint8)


def crop_square(im: Image.Image, alpha: np.ndarray, px: int, pad: float = 0.03) -> Image.Image:
    ys, xs = np.nonzero(alpha > 16)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    side = int(max(x1 - x0, y1 - y0) * (1 + 2 * pad))
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    rgba = np.dstack([np.asarray(im.convert('RGB')), alpha])
    big = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    big.paste(Image.fromarray(rgba, 'RGBA'), (int(round(side / 2 - cx)), int(round(side / 2 - cy))))
    return big.resize((px, px), Image.LANCZOS)


def enamel(fr: Image.Image):
    """the green enamel at the medallion's middle: its centre and radius as fractions of the frame"""
    a = np.asarray(fr).astype(np.int16)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    green = (g > r + 8) & (g >= b) & (al > 200) & (a[..., :3].max(axis=2) < 150)
    lab, n = ndimage.label(green)
    h, w = green.shape
    # the piece nearest the middle (leaves round the rim are green too)
    best, bd = 0, 1e9
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if len(xs) < 400:
            continue
        dd = (xs.mean() - w / 2) ** 2 + (ys.mean() - h / 2) ** 2
        if dd < bd:
            best, bd = i, dd
    m = ndimage.binary_fill_holes(lab == best)
    ys, xs = np.nonzero(m)
    return xs.mean() / w, ys.mean() / h, float(np.sqrt(m.sum() / np.pi) / w)


def load(name: str) -> Image.Image:
    for ext in ('.webp', '.png'):
        p = SRC / f'{name}{ext}'
        if p.exists():
            return Image.open(p).convert('RGB')
    raise SystemExit(f'missing picture {name} in {SRC}')


pieces = []  # (kind, key, frame image, extra)
for tier, name in PICKS['medallions'].items():
    im = load(name)
    fr = crop_square(im, cut(np.asarray(im), round_piece=True), MED_PX, 0.01)
    pieces.append(('m', tier, fr, enamel(fr)))
for key, name in PICKS['emblems'].items():
    im = load(name)
    # ("solid": emblems whose own grey must stay, like the silver locket's face)
    fr = crop_square(im, cut(np.asarray(im), round_piece=key in PICKS.get('solid', [])), EMB_PX, 0.02)
    pieces.append(('e', key, fr, None))

# shelf packing: the medallions in the first row, the emblems after, 4 px apart
W = 1536
x = y = 0
row_h = 0
place = []
for kind, key, fr, extra in pieces:
    if x + fr.width > W:
        x, y, row_h = 0, y + row_h + 4, 0
    place.append((kind, key, fr, extra, x, y))
    x += fr.width + 4
    row_h = max(row_h, fr.height)
H = y + row_h
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for kind, key, fr, extra, px, py in place:
    sheet.paste(fr, (px, py))
out = ROOT / 'src/assets/medals/medals.webp'
out.parent.mkdir(parents=True, exist_ok=True)
sheet.save(out, 'WEBP', quality=88, method=6, alpha_quality=90)
print(out, sheet.size, out.stat().st_size, 'bytes')

med = {k: {'x': px, 'y': py, 'w': fr.width, 'h': fr.height, 'cx': round(e[0], 4), 'cy': round(e[1], 4), 'r': round(e[2], 4)}
       for kind, k, fr, e, px, py in place if kind == 'm'}
emb = {k: {'x': px, 'y': py, 'w': fr.width, 'h': fr.height} for kind, k, fr, e, px, py in place if kind == 'e'}
ts = f'''/**
 * Generated by tools/art/medals/pack.py from the painted medals (Qwen-Image and the game's style model, jobs medals-0 and medals2-0 (the claws, a second try at the predator emblem), 2026-10-26; the
 * takes picked in tools/art/medals/picks.json). One sheet, src/assets/medals/medals.webp: the four tier medallions ({MED_PX} px) and the
 * emblems ({EMB_PX} px) that sit on them. A medallion's cx, cy and r are its green enamel's middle and radius, as fractions of its frame.
 */
import type {{ Emblem, Tier }} from './badges.ts';

export interface MedalFrame {{ x: number; y: number; w: number; h: number }}
export const MEDAL_ATLAS_SIZE = {{ w: {W}, h: {H} }};
export const MEDALLION_FRAMES: Record<Tier, MedalFrame & {{ cx: number; cy: number; r: number }}> = {json.dumps(med)};
export const EMBLEM_FRAMES: Record<Emblem, MedalFrame> = {json.dumps(emb)};
'''
(ROOT / 'src/game/medalAtlasData.ts').write_text(ts)
print('wrote src/game/medalAtlasData.ts', len(med), 'medallions', len(emb), 'emblems')

# the close-up sheet: every medallion, every emblem, and each medallion with an emblem on it
cell = 200
cols = 8
items = [(f'{k}', fr) for kind, k, fr, e, px, py in place]
combos = []
for kind, k, fr, e, px, py in place:
    if kind != 'm':
        continue
    em = next(f for kd, kk, f, *_ in place if kd == 'e' and kk == {'bronze': 'paw', 'silver': 'feather', 'gold': 'trophy', 'platinum': 'gem'}[k])
    c = fr.copy()
    side = int(2 * e[2] * fr.width * 1.08)
    c.alpha_composite(em.resize((side, side), Image.LANCZOS), (int(e[0] * fr.width - side / 2), int(e[1] * fr.height - side / 2)))
    combos.append((f'{k} + emblem', c))
allv = combos + items
rows = (len(allv) + cols - 1) // cols
S = Image.new('RGB', (cols * cell, rows * (cell + 18)), (52, 32, 16))
d = ImageDraw.Draw(S)
for i, (lab, fr) in enumerate(allv):
    cx, cy = (i % cols) * cell, (i // cols) * (cell + 18)
    t = fr.resize((cell - 16, cell - 16), Image.LANCZOS)
    S.paste(t, (cx + 8, cy + 18), t)
    d.text((cx + 6, cy + 3), lab, fill=(255, 225, 150))
S.save(HERE / 'sheet.png')
print('sheet', HERE / 'sheet.png')
