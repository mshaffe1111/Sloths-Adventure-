"""Cut World 9's new piece art (2026-10-31, GRAB-BAG.md §6; takes from tools/art/w9/make_piece_spec.py, unpacked from the job's carrier PNG
into RAW) into src/assets/w9/pieces.webp + src/game/w9PiecesData.ts (frames anchored at the middle of the foot):
  flarecool       w9flarecool-s55-7: the flare slab resting, cut from the start's own box and scaled to the hot platform's cell (434 x 211),
                  so the two lie exactly over each other (w9HeatArt.ts bleeds the hot one in over it)
  lavafall0..2    w9lavafall-s86-23's three pours (a loop), half size
  surge0..2       w9surge-s86-23's three moments of the rolling front, half size
  steam0..2       w9steam-s84-23's three moments of the jet off its vent rock, half size
  chunk0..1       w9chunk-s80-7: the obsidian chunk resting and turned, half size
  gust0..3        w9gust-s70-23's four streak frames, half size
Keying as tools/art/w9/cut.py (alpha from magenta-ness, despilled fringe); nothing is upscaled.
    python3 -I tools/art/w9/piececut.py RAW
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
RAW = Path(sys.argv[1])
OUT = ROOT / 'src/assets/w9'


def keyed(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    alpha = np.clip((0.42 - mag) / 0.22, 0, 1)
    fringe = (alpha < 1) & (alpha > 0)
    a[..., 0] = np.where(fringe, np.minimum(r, g + (r - g) * alpha), r)
    a[..., 2] = np.where(fringe, np.minimum(b, g + (b - g) * alpha * 0.5), b)
    pink = (a[..., 2] > a[..., 1] + 8) & (a[..., 0] > a[..., 1])
    a[..., 2] = np.where(pink, a[..., 1], a[..., 2])
    return Image.fromarray(np.dstack([a, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA')


def trim(im, minpx=300):
    al = np.asarray(im)[..., 3] > 40
    lab, n = ndimage.label(al)
    sizes = ndimage.sum(al, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i in range(n) if sizes[i] >= minpx])
    arr = np.asarray(im).copy()
    arr[..., 3] = np.where(keep | (arr[..., 3] < 40), arr[..., 3], 0)
    ys, xs = np.nonzero(arr[..., 3] > 10)
    return Image.fromarray(arr).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def take(name):
    return Image.open(RAW / f'{name}.webp').convert('RGB')


def cells(name, n, axis='x', k=0.5):
    im = keyed(take(name))
    out = []
    for i in range(n):
        box = (im.width * i // n, 0, im.width * (i + 1) // n, im.height) if axis == 'x' else (0, im.height * i // n, im.width, im.height * (i + 1) // n)
        c = trim(im.crop(box))
        out.append(c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS))
    return out


pieces = []
cool = keyed(take('w9flarecool-s55-7')).crop((78, 45, 78 + 868, 45 + 422)).resize((434, 211), Image.LANCZOS)
pieces.append(('flarecool', cool, False))
for i, c in enumerate(cells('w9lavafall-s86-23', 3)):
    pieces.append((f'lavafall{i}', c, True))
for i, c in enumerate(cells('w9surge-s86-23', 3)):
    pieces.append((f'surge{i}', c, True))
for i, c in enumerate(cells('w9steam-s84-23', 3)):
    pieces.append((f'steam{i}', c, True))
for i, c in enumerate(cells('w9chunk-s80-7', 2)):
    pieces.append((f'chunk{i}', c, True))
for i, c in enumerate(cells('w9gust-s70-23', 4)):
    pieces.append((f'gust{i}', c, False))

frames = {}
x = y = rowh = 0
for n, im, anchor in sorted(pieces, key=lambda p: -p[1].height):
    if x + im.width > 2048:
        x, y, rowh = 0, y + rowh + 2, 0
    frames[n] = {'x': x, 'y': y, 'w': im.width, 'h': im.height, **({'ax': im.width / 2, 'ay': im.height} if anchor else {})}
    x += im.width + 2
    rowh = max(rowh, im.height)
sheet = Image.new('RGBA', (2048, y + rowh), (0, 0, 0, 0))
for n, im, _ in pieces:
    sheet.alpha_composite(im, (frames[n]['x'], frames[n]['y']))
sheet.save(OUT / 'pieces.webp', 'WEBP', quality=90, method=6)
(ROOT / 'src/game/w9PiecesData.ts').write_text('\n'.join([
    "/** World 9's new piece art (tools/art/w9/piececut.py, from the HF takes of tools/art/w9/make_piece_spec.py, 2026-10-31): frames in",
    " *  src/assets/w9/pieces.webp, anchored at the middle of the foot where `ax`/`ay` are given. Generated: do not edit. */",
    f"export const W9_PIECE_FRAMES = {json.dumps(frames)} as const;", '']))
print(sheet.size, (OUT / 'pieces.webp').stat().st_size, {n: (f['w'], f['h']) for n, f in frames.items()})
