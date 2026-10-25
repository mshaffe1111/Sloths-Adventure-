"""Cut Matt's per-world prop sheets (a 3 x 2 grid on a flat key colour) into one atlas per world.

  python3 packkits.py 2 3 4 5 6   -> sloths-fixes/src/assets/kits/w<N>.webp and src/game/kitAtlasData.ts

Pieces are found by where they sit in the grid, not by counting, so dust, pebbles or a stray leaf never shift the order. The sheets are used
at 2x their original size (from the 4x upscale when it exists, halved).
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

D = Path((str(__import__('pathlib').Path(__file__).resolve().parents[0]) + '/kits'))
GAME = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
OUT = GAME / 'src/assets/kits'
DATA = GAME / 'src/game/kitAtlasData.ts'
KEY = {5: 'yellow', 9: 'cyan'}  # the rest are magenta
GROUND = ['bank', 'bankEnd', 'mossStrip', 'wall', 'buttress', 'stump']
CLIMB = ['branch', 'branchCreak', 'snap', 'perch', 'liana', 'trunk']
# sheets that came in another order (None: a cell that is not a piece the game uses)
ORDER = {
    'w9-climb': ['branch', 'branchCreak', 'snap', 'trunk', 'perch', 'liana'],
    'w10-ground': [None, 'stump', None, 'wall', 'mossStrip', 'buttress'],
}
# sheets with white lines round the cells
GRID = {'w9-climb'}
# sheets whose pieces are made of thin lines (an iron mesh): no speck cleaning, or the lines go too
THIN = {'w10-climb'}
# the climb piece's repeating middle, where it has caps at its ends
TRUNK_SPAN = {7: (0.12, 0.88)}


def keyness(a, key):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if key == 'yellow':
        k = np.minimum(r, g) - b
    elif key == 'cyan':
        k = np.minimum(g, b) - r
    else:
        k = np.minimum(r, b) - g
    return np.clip(k / 255.0, 0, 1)


def despill(crop, k, key):
    k = np.clip(k * 2.2, 0, 1)[..., None]
    r, g, b = crop[..., 0:1], crop[..., 1:2], crop[..., 2:3]
    if key == 'yellow':  # pull the yellow fringe toward blue
        crop[..., 0:1] = r - (r - np.minimum(r, b + 20)) * k
        crop[..., 1:2] = g - (g - np.minimum(g, b + 20)) * k
    elif key == 'cyan':
        crop[..., 1:2] = g - (g - np.minimum(g, r + 20)) * k
        crop[..., 2:3] = b - (b - np.minimum(b, r + 10)) * k
    else:
        crop[..., 0:1] = r - (r - np.minimum(r, g + 20)) * k
        crop[..., 2:3] = b - (b - np.minimum(b, g + 10)) * k
    return crop


def sheet_key(a):
    """which key colour a sheet was made on, and how strongly its background shows it (from the border)"""
    b = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    r, g, bl = np.median(b, axis=0)
    key = 'yellow' if bl < min(r, g) else 'cyan' if r < min(g, bl) else 'magenta'
    return key, max(0.2, float(keyness(np.array([[[r, g, bl]]], np.float32), key)[0, 0]))


def no_grid(a):
    """thin white cell lines some sheets come with: painted over in the background colour"""
    white = (a.min(axis=2) > 205) & (a.max(axis=2) - a.min(axis=2) < 30)
    lines = white & (ndimage.binary_opening(white, structure=np.ones((1, 25))) | ndimage.binary_opening(white, structure=np.ones((25, 1))))
    lines = ndimage.binary_dilation(lines, iterations=2)
    b = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3)])
    a = a.copy()
    a[lines] = np.median(b, axis=0)
    return a


def cut(path: Path, names, key=None):
    small = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    if path.stem in GRID:
        small = no_grid(small)
    key, kbg = sheet_key(small)
    kn = lambda a: np.clip(keyness(a, key) / kbg, 0, 1)
    h, w = small.shape[:2]
    obj = kn(small) <= 0.38
    if path.stem not in THIN:
        obj = ndimage.binary_opening(obj, iterations=2)
    lab, n = ndimage.label(obj)
    sizes = ndimage.sum(obj, lab, range(1, n + 1))
    coms = ndimage.center_of_mass(obj, lab, range(1, n + 1))
    boxes = ndimage.find_objects(lab)
    cells = {i: [] for i in range(6)}
    for i in range(n):
        if sizes[i] < 400:
            continue  # dust, pebbles, a falling chip
        cy, cx = coms[i]
        c = min(2, int(cx / (w / 3))) + 3 * min(1, int(cy / (h / 2)))
        cells[c].append(i + 1)
    big_p = path.with_name(path.stem + 'x4.png')
    if big_p.exists():
        big = Image.open(big_p).convert('RGB')
        big = big.resize((w * 2, h * 2), Image.LANCZOS)
        src = 'x4'
    else:
        big = Image.open(path).convert('RGB').resize((w * 2, h * 2), Image.LANCZOS)
        src = 'plain 2x'
    A = np.asarray(big).astype(np.float32)
    if path.stem in GRID:
        A = no_grid(A)
    K = kn(A)
    out = {}

    def take(name, labs):
        own = ndimage.binary_dilation(np.isin(lab, labs), iterations=3)
        ys, xs = np.nonzero(own)
        y0, y1 = max(0, ys.min() * 2 - 6), min(A.shape[0], ys.max() * 2 + 8)
        x0, x1 = max(0, xs.min() * 2 - 6), min(A.shape[1], xs.max() * 2 + 8)
        own_big = np.asarray(Image.fromarray((own * 255).astype(np.uint8)).resize((A.shape[1], A.shape[0]), Image.NEAREST))[y0:y1, x0:x1] > 0
        crop = despill(A[y0:y1, x0:x1].copy(), K[y0:y1, x0:x1], key)
        alpha = 1 - np.clip((K[y0:y1, x0:x1] - 0.18) / (0.42 - 0.18), 0, 1)
        alpha = np.where(own_big, alpha, 0)
        im = Image.fromarray(np.dstack([np.clip(crop, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
        out[name] = im.crop(im.getbbox())

    for c, name in enumerate(names):
        if name is None:
            continue
        labs = cells[c]
        if labs and name != 'snap':
            # loose bits beside the piece (a dust puff, a pebble) are left out: only pieces near the size of the biggest one stay
            top = max(sizes[l - 1] for l in labs)
            labs = [l for l in labs if sizes[l - 1] >= top * 0.12]
        if not labs:
            print('  missing', path.name, 'cell', c + 1, name)
            continue
        if name == 'snap':
            # the two halves: split the cell's pieces left and right of the middle of the whole group
            xs = [(boxes[l - 1][1].start + boxes[l - 1][1].stop) / 2 for l in labs]
            if len(labs) >= 2:
                mid = (min(xs) + max(xs)) / 2
                take('snapL', [l for l, x in zip(labs, xs) if x <= mid])
                take('snapR', [l for l, x in zip(labs, xs) if x > mid])
            else:  # one joined piece: cut it in half down the middle
                take('snap', labs)
                im = out.pop('snap')
                out['snapL'] = im.crop((0, 0, im.width // 2, im.height))
                out['snapR'] = im.crop((im.width // 2, 0, im.width, im.height))
            continue
        take(name, labs)
    print(' ', path.name, src, {k: v.size for k, v in out.items()})
    return out


def seamless(im, axis, lo, hi, blend=0.18):
    """the slice [lo, hi) of the piece along x (axis 0) or y (axis 1), its ends cross-faded into each other so copies repeat with no seam"""
    a = np.asarray(im).astype(np.float32)
    if axis == 1:
        a = a.transpose(1, 0, 2)
    n = a.shape[1]
    a = a[:, int(n * lo):int(n * hi)]
    w = a.shape[1]
    b = max(4, int(w * blend))
    ramp = np.linspace(0, 1, b)[None, :, None]
    head = a[:, :b] * ramp + a[:, w - b:] * (1 - ramp)
    out = np.concatenate([head, a[:, b:w - b]], axis=1)
    if axis == 1:
        out = out.transpose(1, 0, 2)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


# worlds whose ground block was drawn flat-on (it repeats as it is); the others drew a tilted box, so their ground is built from the wall's
# flat face with the top strip laid over it
FLAT_BANK = {6}
TW, TH = 560, 250


# where a world's ground face comes from, when not its wall: (piece, from, to) across its width
BODY_FROM = {5: ('buttress', 0.04, 0.58), 8: ('wall', 0.14, 0.86)}


def built_bank(wall, strip, span=(0.07, 0.93)):
    """a repeating stretch of ground: the wall's face below its lip, with the top strip along the top, both stretched to one period"""
    body = seamless(wall, 0, *span)
    bw, bh = body.size
    body = body.crop((0, int(bh * 0.16), bw, int(bh * 0.97)))
    top = seamless(strip, 0, 0.06, 0.94)
    tile = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    lip = int(TH * 0.13)  # the grass rises a little above the walking line
    tile.alpha_composite(body.resize((TW, TH - lip - 20), Image.LANCZOS), (0, lip + 20))
    th = int(TH * 0.32)
    tile.alpha_composite(top.resize((TW, th), Image.LANCZOS), (0, lip - int(th * 0.25)))
    return tile


def fill_tile(src, span):
    """the deep ground below the top band: the face with no grass, repeating both across and down"""
    body = seamless(src, 0, *span)
    bw, bh = body.size
    body = body.crop((0, int(bh * 0.3), bw, int(bh * 0.95)))
    return seamless(body, 1, 0.0, 1.0, blend=0.25)


def tileable(frames, w):
    """the pieces the game repeats: the ground, the top strip and the climb"""
    if 'bankEnd' not in frames and 'buttress' in frames:
        frames['bankEnd'] = frames['buttress']
    if w not in FLAT_BANK and 'wall' in frames and 'mossStrip' in frames:
        src, lo, hi = BODY_FROM.get(w, ('wall', 0.07, 0.93))
        frames['bank'] = built_bank(frames[src], frames['mossStrip'], (lo, hi))
        frames['fill'] = fill_tile(frames[src], (lo, hi))
    elif 'bank' in frames:
        frames['fill'] = fill_tile(frames['bank'], (0.03, 0.97))
        frames['bank'] = seamless(frames['bank'], 0, 0.03, 0.97)
    if 'mossStrip' in frames:
        frames['mossStrip'] = seamless(frames['mossStrip'], 0, 0.06, 0.94)
    if 'trunk' in frames:
        frames['trunk'] = seamless(frames['trunk'], 1, *TRUNK_SPAN.get(w, (0.04, 0.96)))


def pack(frames):
    W = 2048
    pos, x, y, shelf = {}, 0, 0, 0
    for name, im in sorted(frames.items(), key=lambda kv: -kv[1].height):
        if x + im.width + 2 > W:
            x, y, shelf = 0, y + shelf + 2, 0
        pos[name] = (x, y, im.width, im.height)
        x += im.width + 2
        shelf = max(shelf, im.height)
    atlas = Image.new('RGBA', (W, y + shelf), (0, 0, 0, 0))
    for name, im in frames.items():
        atlas.paste(im, pos[name][:2])
    return atlas, pos


def main(worlds):
    old = {}
    if DATA.exists():
        m = re.search(r'KIT_FRAMES: Record<number, Record<string, KitFrame>> = (\{.*?\});', DATA.read_text(), re.S)
        if m:
            old = {int(k): v for k, v in json.loads(m.group(1)).items()}
    OUT.mkdir(parents=True, exist_ok=True)
    for w in worlds:
        frames = {}
        g, c = D / f'w{w}-ground.jpg', D / f'w{w}-climb.jpg'
        if g.exists():
            frames.update(cut(g, ORDER.get(g.stem, GROUND)))
            if 'stump' in frames:
                frames['boulder'] = frames['stump']  # the low step stands in for the rock the log stops against
        if c.exists():
            frames.update(cut(c, ORDER.get(c.stem, CLIMB)))
        tileable(frames, w)
        atlas, pos = pack(frames)
        atlas.save(OUT / f'w{w}.webp', 'WEBP', quality=86, method=6)
        old[w] = {k: dict(zip('xywh', v)) for k, v in pos.items()}
        print('world', w, atlas.size, (OUT / f'w{w}.webp').stat().st_size // 1024, 'KB', sorted(pos))
    DATA.write_text('''/** Generated by scratchpad/packkits.py from Matt's per-world prop sheets: where each piece sits in src/assets/kits/w<N>.webp. Do not edit by hand. */
export interface KitFrame { x: number; y: number; w: number; h: number }
export const KIT_FRAMES: Record<number, Record<string, KitFrame>> = ''' + json.dumps({str(k): old[k] for k in sorted(old)}, indent=1) + ';\n')


if __name__ == '__main__':
    main([int(a) for a in sys.argv[1:]])
