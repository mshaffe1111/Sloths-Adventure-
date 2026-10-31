"""Cut a World 1-4 batch's picked takes into pieces, clean the edges, pack each world's new art into one atlas (2026-10-31, w1-4-sheets).

    python3 tools/art/w1to4/cut.py <world> <takes dir>

picks-w<world>.json: {canvas: take name} or {canvas: {piece: take name}} when two takes split the wins. Each take's cells come from the
starts' cells.json (reference/prop-sheets/qa-notes/w1-4-art/starts/), with a margin so a piece the model grew a little is not clipped.
  key colour magenta/green: alpha from the distance to the key, spill pulled out of the edge, the largest blob kept (plus any blob over
                            8% of it: a gate's two posts, shards), then tools/art/edges/defringe.py --scale 1 --despill --keep-line
                            (the fixed edge pipeline, unchanged)
  black (see-through fx):   alpha = brightness, colour un-premultiplied; no ink line (soft light, STAGE-RULES §4 code-glow rule)
Writes src/assets/w1to4art/w<world>-new.webp + .json (frames {x, y, w, h}) and a review sheet
reference/prop-sheets/qa-notes/w1-4-art/w<world>-pieces.jpg. Nothing in src/game reads the atlas yet (no stage-code change in this pass).
"""
import json, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
STARTS = ROOT / 'reference/prop-sheets/qa-notes/w1-4-art/starts'
OUTD = ROOT / 'src/assets/w1to4art'
MARGIN = 14


def key_alpha(a, key):
    """alpha from how far each pixel is toward the key colour, then the key un-mixed from every part-see-through pixel
    (observed = alpha * paint + (1 - alpha) * key), so thin grass tips and holes in a lattice keep their own colour, not purple"""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    K = np.array(key, np.float32)
    if key == [255, 0, 255]:
        d = np.minimum(r, b) - g
    else:
        d = g - np.maximum(r, b)
    alpha = np.clip(1 - (d - 40) / 140, 0, 1)
    al = alpha[..., None]
    paint = np.where(al > 0.02, (a - (1 - al) * K) / np.maximum(al, 0.02), 0)
    out = np.where(al < 0.999, paint, a)
    # what is left of the key's hue in the paint itself near the cut (a magenta cast on pale water): pulled to neutral
    near = ndimage.binary_dilation(alpha < 0.98, iterations=4)
    if key == [255, 0, 255]:
        cast = np.clip(np.minimum(out[..., 0], out[..., 2]) - out[..., 1], 0, None)
        out[..., 0] -= np.where(near, cast * 0.8, 0); out[..., 2] -= np.where(near, cast * 0.8, 0)
    else:
        cast = np.clip(out[..., 1] - np.maximum(out[..., 0], out[..., 2]), 0, None)
        out[..., 1] -= np.where(near, cast * 0.8, 0)
    return out.clip(0, 255), alpha * 255


def keep_blobs(alpha):
    lab, n = ndimage.label(alpha > 40)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= 0.08 * sizes.max()]
    mask = np.isin(lab, keep)
    mask = ndimage.binary_dilation(mask, iterations=3)
    return np.where(mask, alpha, 0)


def cut_piece(img, box, key):
    x, y, w, h = box
    W, H = img.size
    c = img.crop((max(0, x - MARGIN), max(0, y - MARGIN), min(W, x + w + MARGIN), min(H, y + h + MARGIN)))
    a = np.asarray(c.convert('RGB')).astype(np.float32)
    if key == [0, 0, 0]:
        al = a.max(-1)
        rgb = np.where(al[..., None] > 0, a * 255 / np.maximum(al[..., None], 1), 0)
        im = Image.fromarray(np.dstack([rgb.clip(0, 255), np.where(al < 12, 0, al)]).astype(np.uint8), 'RGBA')
        return im.crop(im.getbbox()) if im.getbbox() else im, False
    rgb, al = key_alpha(a, key)
    al = keep_blobs(al)
    im = Image.fromarray(np.dstack([rgb.clip(0, 255), al]).astype(np.uint8), 'RGBA')
    return (im.crop(im.getbbox()) if im.getbbox() else im), True


def edge_clean(im):
    with tempfile.TemporaryDirectory() as td:
        s, d = Path(td) / 'a.png', Path(td) / 'b.webp'
        im.save(s)
        r = subprocess.run([sys.executable, '-I', str(ROOT / 'tools/art/edges/defringe.py'), str(s), str(d), '--scale', '1', '--despill',
                            '--keep-line', '--q', '95'], capture_output=True, text=True)
        if r.returncode != 0:
            print('defringe failed, kept the keyed cut:', r.stderr[-300:])
            return im
        return Image.open(d).convert('RGBA')


def pack(pieces, maxw=2048, pad=4):
    order = sorted(pieces, key=lambda kv: -kv[1].height)
    x = y = rowh = 0
    pos = {}
    for n, im in order:
        if x + im.width > maxw:
            x, y, rowh = 0, y + rowh + pad, 0
        pos[n] = (x, y, im.width, im.height)
        x += im.width + pad
        rowh = max(rowh, im.height)
    W = min(maxw, max(p[0] + p[2] for p in pos.values()))
    H = max(p[1] + p[3] for p in pos.values())
    sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for n, im in pieces:
        sheet.paste(im, pos[n][:2])
    return sheet, pos


def review(pieces, world, path):
    bd = {1: 'w1-near', 2: 'w2-near', 3: 'w3-near', 4: 'w4-near'}[world]
    back = Image.open(ROOT / f'src/assets/backdrops/{bd}.webp').convert('RGBA')
    tw = 1600
    rows, x, y, rowh = [], 0, 0, 0
    lay = []
    for n, im in pieces:
        s = min(1.0, 300 / max(im.width, im.height))
        t = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if x + t.width + 20 > tw:
            x, y, rowh = 0, y + rowh + 40, 0
        lay.append((n, t, x + 10, y + 30))
        x += t.width + 20
        rowh = max(rowh, t.height)
    H = y + rowh + 50
    S = back.resize((tw, round(tw * back.height / back.width))).crop((0, 0, tw, H)) if back.height * tw / back.width >= H else back.resize((tw, H))
    S = S.convert('RGBA')
    d = ImageDraw.Draw(S)
    for n, t, px, py in lay:
        S.alpha_composite(t, (px, py))
        d.text((px, py - 16), n, fill=(255, 255, 210))
    S.convert('RGB').save(path, quality=86)


def main():
    world, takes = int(sys.argv[1]), Path(sys.argv[2])
    cells = json.loads((STARTS / 'cells.json').read_text())
    picks = json.loads((HERE / f'picks-w{world}.json').read_text())
    pieces = []
    for canvas, pick in picks.items():
        info = cells[canvas]
        for pname, box in info['cells'].items():
            take = pick if isinstance(pick, str) else pick.get(pname, pick.get('*'))
            if take is None:
                continue
            img = Image.open(takes / f'{take}.png').convert('RGB')
            sx, sy = img.width / info['size'][0], img.height / info['size'][1]
            b = [round(box[0] * sx), round(box[1] * sy), round(box[2] * sx), round(box[3] * sy)]
            im, solid = cut_piece(img, b, info['key'])
            if solid:
                im = edge_clean(im)
            pieces.append((pname, im))
            print(canvas, pname, im.size, take)
    OUTD.mkdir(parents=True, exist_ok=True)
    sheet, pos = pack(pieces)
    dst = OUTD / f'w{world}-new.webp'
    sheet.save(dst, 'WEBP', quality=90, method=6)
    (OUTD / f'w{world}-new.json').write_text(json.dumps({n: dict(zip('xywh', p)) for n, p in pos.items()}, indent=1))
    review(pieces, world, ROOT / f'reference/prop-sheets/qa-notes/w1-4-art/w{world}-pieces.jpg')
    print(dst, sheet.size, len(pieces), 'pieces')


if __name__ == '__main__':
    main()
