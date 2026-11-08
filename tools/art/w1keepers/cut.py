"""Cut Matt's World 1 keeper sheets (reference/art-incoming/gemini-2026-11-05, Gemini, scattered items, not a grid).

    python3 tools/art/w1keepers/cut.py segment <outDir>      -> every item found on each keeper sheet, numbered, plus <sheet>-map.jpg
    python3 tools/art/w1keepers/cut.py cut <outDir>          -> the pieces named in picks.json, into <outDir>/<name>.png + contact sheets

Magenta sheets (07-22): soft key on min(r,b)-g, then de-spill of the pink fringe (the excess red/blue on the soft edge is pulled
back to the green channel, as tools/art/w5puzzle/cut.py does), then any pink-tinted edge pixel is neutralised.
Grey sheets (36-42, flat ~88 grey): matte by colour distance from the sheet's own background, with a soft ramp, then the edge is
pulled in 1 px so no grey halo is left; nothing on these sheets is that exact flat grey, but grey stones are checked by eye.
Items are found as connected parts of the matte (parts closer than MERGE px are one item: leaves on a vine stay with the vine).
"""
import json
import os
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
SRC = os.path.join(ROOT, 'reference', 'art-incoming', 'gemini-2026-11-05')
SHEETS = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '36', '38', '39', '41', '42']
MERGE = 5


def sheet_path(n):
    return os.path.join(SRC, next(f for f in os.listdir(SRC) if f.startswith(n + '-')))


def matte(rgb):
    """alpha 0..1 and the key kind for a sheet"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    corner = rgb[:8, :8].reshape(-1, 3).mean(0)
    if corner[0] - corner[1] > 100:  # magenta
        k = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
        return np.clip((0.42 - k) / 0.22, 0, 1), 'magenta', corner
    # grey: distance from the background grey, sampled along the border (it varies a little)
    border = np.concatenate([rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3), rgb[:, :4].reshape(-1, 3), rgb[:, -4:].reshape(-1, 3)])
    bg = np.median(border, 0)
    d = np.sqrt(((rgb - bg) ** 2).sum(-1))
    sat = rgb.max(-1) - rgb.min(-1)
    # a pixel is background when it is close to the grey AND unsaturated (the sheets' greys are neutral; stones are warm-tinted)
    a = np.clip((d - 9) / 14, 0, 1)
    a = np.maximum(a, np.clip((sat - 10) / 10, 0, 1) * (d > 5))
    return a, 'grey', bg


def items(rgb):
    alpha, kind, bg = matte(rgb)
    solid = ndimage.binary_opening(alpha > 0.5, iterations=1)
    grown = ndimage.binary_dilation(solid, iterations=MERGE)
    lab, n = ndimage.label(grown)
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        m = (lab[sl] == i + 1) & solid[sl]
        if m.sum() < 600:
            continue
        out.append((sl, i + 1))
    return alpha, kind, bg, lab, out


def cut_item(rgb, alpha, kind, lab, sl, idx, box=None, erase=()):
    pad = 3
    if box:  # a pick may clip its item to a box (sheet px): two pieces the matte joined
        sl = (slice(max(sl[0].start, box[1]), min(sl[0].stop, box[3])), slice(max(sl[1].start, box[0]), min(sl[1].stop, box[2])))
    y0, y1 = max(0, sl[0].start - pad), min(rgb.shape[0], sl[0].stop + pad)
    x0, x1 = max(0, sl[1].start - pad), min(rgb.shape[1], sl[1].stop + pad)
    own = ndimage.binary_dilation(lab[y0:y1, x0:x1] == idx, iterations=2)
    if box:
        yy, xx = np.mgrid[y0:y1, x0:x1]
        own &= (xx >= box[0]) & (xx < box[2]) & (yy >= box[1]) & (yy < box[3])
    for ex in erase:  # and erase what does not belong (a lantern hung on a trunk)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        own &= ~((xx >= ex[0]) & (xx < ex[2]) & (yy >= ex[1]) & (yy < ex[3]))
    a = alpha[y0:y1, x0:x1] * own
    c = rgb[y0:y1, x0:x1].copy()
    if kind == 'magenta':
        cap = c[..., 1] + 30
        for ch in (0, 2):
            c[..., ch] = np.minimum(c[..., ch], np.maximum(cap, c[..., ch] * (1 - (1 - a) * 0.6)))
        rr, gg, bb = c[..., 0], c[..., 1], c[..., 2]
        pink = (rr > gg + 12) & (bb > gg + 4)  # loose: browns have b < g, so only the key tint matches
        grey = (rr + gg + bb) / 3
        for ch, tint in ((0, 6), (1, 2), (2, -8)):
            c[..., ch] = np.where(pink, np.clip(grey + tint, 0, 255), c[..., ch])
        a = np.where(pink & (a < 0.95), a * 0.4, a)
    else:
        # pull the edge in by a pixel: the soft ramp otherwise keeps a thin grey line
        core = ndimage.binary_erosion(a > 0.5, iterations=1)
        a = np.minimum(a, ndimage.gaussian_filter(core.astype(np.float32), 0.7) * 1.2)
        a = np.clip(a, 0, 1)
    # drop specks: islands under 150 px left by a box split or the key (wall C's fleck beside its top-right ledge)
    lab2, n2 = ndimage.label(a > 0.03)
    if n2 > 1:
        sz = ndimage.sum(np.ones_like(a), lab2, range(1, n2 + 1))
        a = a * np.isin(lab2, [i + 1 for i in range(n2) if sz[i] >= 150])
    rgba = np.dstack([c, a * 255]).astype(np.uint8)
    ys, xs = np.nonzero(a > 0.03)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def load(n):
    return np.asarray(Image.open(sheet_path(n)).convert('RGB')).astype(np.float32)


def segment(out):
    os.makedirs(out, exist_ok=True)
    for n in SHEETS:
        rgb = load(n)
        alpha, kind, bg, lab, its = items(rgb)
        m = Image.open(sheet_path(n)).convert('RGB')
        d = ImageDraw.Draw(m)
        for j, (sl, idx) in enumerate(its):
            d.rectangle([sl[1].start, sl[0].start, sl[1].stop, sl[0].stop], outline=(255, 255, 0), width=2)
            d.rectangle([sl[1].start, sl[0].start, sl[1].start + 26, sl[0].start + 16], fill=(0, 0, 0))
            d.text((sl[1].start + 3, sl[0].start + 2), str(j + 1), fill=(255, 255, 0))
        m.save(os.path.join(out, f'{n}-map.jpg'), quality=80)
        print(n, kind, len(its), 'items')


def place(im, S):
    t = im.copy()
    t.thumbnail((S - 20, S - 34))
    return t


def cut(out):
    picks = json.load(open(os.path.join(HERE, 'picks.json')))
    os.makedirs(out, exist_ok=True)
    tiles = []
    manifest = []
    for n, entries in picks['sheets'].items():
        rgb = load(n)
        alpha, kind, bg, lab, its = items(rgb)
        for e in entries:
            sl, idx = its[e['item'] - 1]
            im = cut_item(rgb, alpha, kind, lab, sl, idx, e.get('box'), e.get('erase', ()))
            name = e['name']
            im.save(os.path.join(out, name + '.png'))
            manifest.append({'file': name + '.png', 'sheet': os.path.basename(sheet_path(n)), 'item': e['item'], 'size': list(im.size),
                             'job': e['job'], 'worlds': e['worlds'], 'status': e.get('status', 'keep'), 'note': e.get('note', '')})
            tiles.append((name, im, e))
    json.dump({'source': 'reference/art-incoming/gemini-2026-11-05', 'rule': picks['rule'], 'pieces': manifest},
              open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
    # contact sheets: dusk purple (shows a pink fringe) and leaf green (shows a grey halo), names and world tags under each
    S, per = 260, 8
    for bgname, col in (('dark', (38, 34, 52, 255)), ('green', (64, 98, 60, 255))):
        rows = (len(tiles) + per - 1) // per
        sheet = Image.new('RGBA', (per * S, rows * S), col)
        d = ImageDraw.Draw(sheet)
        for i, (name, im, e) in enumerate(tiles):
            t = place(im, S)
            x, y = (i % per) * S, (i // per) * S
            sheet.alpha_composite(t, (x + (S - t.width) // 2, y + 4 + (S - 34 - t.height) // 2))
            d.text((x + 4, y + S - 28), name[:40], fill=(255, 255, 255))
            d.text((x + 4, y + S - 15), ('HOLD ' if e.get('status') == 'hold' else '') + ' '.join(e['worlds']), fill=(255, 230, 90))
        sheet.convert('RGB').save(os.path.join(out, f'contact-{bgname}.jpg'), quality=82)
    print(len(tiles), 'pieces')


if __name__ == '__main__':
    {'segment': segment, 'cut': cut}[sys.argv[1]](sys.argv[2])
