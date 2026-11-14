"""ART-678b: re-cut the ART-678 pieces from the kept raws (reference/art/hf678/raw/, q95) on this machine, no Hugging Face.

    python3 tools/art/hf678/recut.py <recut.json> <raw dir> <out dir>

Why a new cutter (the lead's FAILS 3 and 4 on the first cut, key_own): (a) a soft dark halo outside every line: key_own's alpha ramps
over ~80 colour units, so the take's grey/pink haze beside a piece survives as a half-clear rim, and the un-mixed rim pixels go dark;
(b) a grey beak on the grey harpy take went clear (key by distance alone). Here the background is what is CONNECTED TO THE BORDER
through background-like pixels: the take's key (row/column map from the ring, as key_own), plus the haze between the key and white
and the soft shadow between the key and black (pixels on those lines, near them, up to a set fraction). The piece's dark outline
stops the flood, so a grey beak, a white crest or a cream belly inside the line stays solid whatever its colour. Enclosed pockets
are cleared only when they are the key's own colour (close match, and on a magenta key the key's hue). The edge is then 1 px in from
the flood, anti-aliased with a 0.8 px blur, and every rim pixel takes the colour of the nearest solid pixel (no key colour, no dark
un-mixed fringe): the despill. Bands (opaque: true) keep key_top's rule: only key joined to the top edge goes clear.

recut.json: {"<take stem>": [{"name", "units", "side": "h"|"w", "box": [x0, y0, x1, y1] fractions of the take, "dest",
"opaque"?: true, "round"?: [["l"|"r", px]] round a square-cut end over px (raw px), "drop"?: [[x0,y0,x1,y1]] take fractions painted as the key,
"protect"?: [[x0,y0,x1,y1]] take fractions where the closed line's inside is kept whatever its colour}]}
Writes <out>/<dest>/<name>.webp (lossless, 3 px per game unit, colour zeroed under clear pixels) and <out>/sizes.json.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

PX = 3.0


def bgmap(a):
    H, W, _ = a.shape
    ring = np.concatenate([a[:12].reshape(-1, 3), a[-12:].reshape(-1, 3), a[:, :12].reshape(-1, 3), a[:, -12:].reshape(-1, 3)])
    bg0 = np.median(ring, 0)
    near = np.linalg.norm(a - bg0, axis=-1) < 70
    sm = lambda x: np.asarray(Image.fromarray(ndi.gaussian_filter(
        np.asarray(Image.fromarray(x).resize((max(1, W // 8), max(1, H // 8)), Image.BILINEAR)), 5)).resize((W, H), Image.BILINEAR))
    w = sm(near.astype(np.float32))
    bgm = np.dstack([sm(np.where(near, a[..., c], 0).astype(np.float32)) for c in range(3)]) / np.maximum(w[..., None], 1e-3)
    return np.where(w[..., None] > 0.02, bgm, bg0), bg0


def hue_sat(x):
    r, g, b = x[..., 0] / 255, x[..., 1] / 255, x[..., 2] / 255
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / np.maximum(mx, 1e-6)


def on_line(a, bgm, end, tmax, resid):
    """pixels near the straight line from the key colour toward `end`, no further than tmax along it"""
    v = end - bgm; vv = np.maximum((v * v).sum(-1), 1e-3)
    t = ((a - bgm) * v).sum(-1) / vv
    r = np.linalg.norm(a - bgm - t[..., None] * v, axis=-1)
    return (t >= -0.05) & (t <= tmax) & (r < resid)


def cut_piece(a, protect=()):
    bgm, bg0 = bgmap(a)
    d = np.linalg.norm(a - bgm, axis=-1)
    white = np.full_like(bgm, 255.0); black = np.zeros_like(bgm)
    magenta = bg0[1] < bg0[0] and bg0[1] < bg0[2]
    bgish = d < 52
    if magenta:  # (on a grey take the key-to-white line IS the grey axis: a white crest would flood away)
        bgish |= on_line(a, bgm, white, 0.9, 30) | on_line(a, bgm, black, 0.45, 26)
    keyhue = np.zeros_like(d, bool)
    if magenta:  # the key's own hue (glows the model painted in it, a loop's pink shadow) is background too, as key_own
        h, s = hue_sat(a); hk, _ = hue_sat(bg0[None, None, :])
        # (only pixels brighter than a line: the model's outline is a dark maroon, (30,5,18) on snake-37, in the key's own hue;
        # key_own ate it, leaving the line as dashes floating outside the piece: the 'dark halo' of FAIL 4)
        keyhue = (np.abs((h - hk[0, 0] + 180) % 360 - 180) < 14) & (s > 0.2) & (a.max(-1) > 100)
        bgish |= keyhue
    bgish = ndi.binary_opening(bgish, iterations=1)
    lab, n = ndi.label(bgish)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    back = np.isin(lab, edge[edge > 0])
    # enclosed pockets: cleared only if they are the key itself (tight match), never on a grey take (a grey beak is a pocket there)
    # on a grey take only the key itself (d < 14: a beak is lighter) and only a pocket bigger than 150 px (the gap between legs)
    tight = ((d < 30) | keyhue if magenta else d < 14) & ~back
    pl, pn = ndi.label(ndi.binary_opening(tight, iterations=1))
    if pn:
        sizes = ndi.sum(np.ones_like(d), pl, range(1, pn + 1))
        pocket = np.isin(pl, 1 + np.nonzero(sizes > (40 if magenta else 150))[0])
        back |= ndi.binary_dilation(pocket, iterations=2) & bgish | pocket
    # smooth the line's ragged outward specks (the model's sketchy rim): open with a 2 px disk
    disk = ndi.generate_binary_structure(2, 1); disk = ndi.iterate_structure(disk, 2)
    inside = ndi.binary_opening(~back, structure=disk)
    # protect boxes (crop px): a part whose fill is the key's own grey (a beak on a grey take, the Crocus lesson) is everything
    # inside its closed line: the line (d > 40) closed with an 8 px disk, holes filled
    big = ndi.iterate_structure(ndi.generate_binary_structure(2, 1), 8)
    for x0, y0, x1, y1 in protect:
        sub = ndi.binary_fill_holes(ndi.binary_closing(d[y0:y1, x0:x1] > 40, structure=big, border_value=0))
        inside[y0:y1, x0:x1] |= sub
    return inside


def finish(a, inside, keep_all=False, key=None):
    # the biggest blob plus any blob at least 15% of it (a split piece's parts), specks dropped
    lab, n = ndi.label(inside)
    if n > 1:
        sz = ndi.sum(inside, lab, range(1, n + 1)); big = sz.max()
        inside = np.isin(lab, 1 + np.nonzero(sz >= (0.0005 * big if keep_all else 0.15 * big))[0])
    core = ndi.binary_erosion(inside, iterations=1)
    al = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
    al = np.where(core, 255, al)
    al = np.where(ndi.binary_dilation(core, iterations=2), al, 0)
    # despill: every pixel that is not solid core takes the colour of its nearest core pixel
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    rgb = np.where(core[..., None], a, a[iy, ix])
    if key is not None:  # the line's own key-hue cast (a maroon rim reads red on green): the outer 3 px lose 75% of it
        rim = core & ~ndi.binary_erosion(core, iterations=3)
        h, sat = hue_sat(rgb); hk, _ = hue_sat(key[None, None, :])
        cast = rim & (np.abs((h - hk[0, 0] + 180) % 360 - 180) < 30)
        lum = (rgb * [0.3, 0.59, 0.11]).sum(-1, keepdims=True)
        rgb = np.where(cast[..., None], lum + (rgb - lum) * 0.25, rgb)
    rgb[al == 0] = 0
    return np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)


def key_top(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = (r > g + 60) & (b > g + 40)
    lab, n = ndi.label(mag)
    top = set(np.unique(lab[0])) - {0}
    clear = np.isin(lab, list(top))
    # the haze line just under the grass tips (key mixed into the tips' rim): also clear when it touches the cleared key
    inside = ~clear
    core = ndi.binary_erosion(inside, iterations=1, border_value=1)
    al = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
    al = np.where(core, 255, al); al = np.where(ndi.binary_dilation(core, iterations=2), al, 0)
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    rgb = np.where(core[..., None], a, a[iy, ix]); rgb[al == 0] = 0
    return np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)


def round_end(rgba, side, px):
    """soften a square-cut end of a twig: alpha fades along an elliptical cap over px columns"""
    al = rgba[..., 3].astype(np.float32); H, W = al.shape
    cols = np.nonzero((al > 128).any(0))[0]
    if not len(cols): return rgba
    x0 = cols[0] if side == 'l' else cols[-1]
    rng = range(x0, min(W, x0 + px)) if side == 'l' else range(max(0, x0 - px + 1), x0 + 1)
    for x in rng:
        col = np.nonzero(al[:, x] > 128)[0]
        if not len(col): continue
        f = (abs(x - x0) + 0.5) / px  # 0 at the end, 1 px columns in
        keep = np.sqrt(max(0.0, 1 - (1 - f) ** 2))  # an elliptical cap
        top, bot = col[0], col[-1]; mid = (top + bot) / 2; half = (bot - top) / 2 * keep
        ys = np.arange(H)
        m = np.clip(half + 0.7 - np.abs(ys - mid), 0, 1)
        al[:, x] = np.minimum(al[:, x], m * 255)
    out = rgba.copy(); out[..., 3] = al.astype(np.uint8); out[out[..., 3] == 0, :3] = 0
    return out


def blobs(a):
    """the take's separate pieces (cutsheet.py's rule): far from the ring colour, opened/closed, specks under 0.4% dropped"""
    ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    fg = np.sqrt(((a - np.median(ring, 0)) ** 2).sum(-1)) > 60
    fg = ndi.binary_closing(ndi.binary_opening(fg, iterations=2), iterations=6)
    lab, n = ndi.label(fg); H, W = fg.shape; out = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        if (lab[sl] == i).sum() >= 0.004 * H * W:
            out.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
    return out


def main(pp, raw, od):
    picks = json.loads(Path(pp).read_text()); od = Path(od); sizes = {}
    for stem, pieces in picks.items():
        im = Image.open(Path(raw) / f'{stem}.webp').convert('RGB'); W, H = im.size
        A = np.asarray(im).astype(np.float32)
        for p in pieces:
            if 'box' in p or p.get('opaque'):
                bx = p.get('box', [0, 0, 1, 1]); x0, y0, x1, y1 = round(bx[0] * W), round(bx[1] * H), round(bx[2] * W), round(bx[3] * H)
            else:  # the blob holding the piece's point `at` (fractions), padded 24 px, as cutsheet.py
                px, py = p['at'][0] * W, p['at'][1] * H; bs = blobs(A)
                ins = [b for b in bs if b[0] <= px <= b[2] and b[1] <= py <= b[3]]
                b = min(ins or bs, key=lambda b: ((b[0] + b[2]) / 2 - px) ** 2 + ((b[1] + b[3]) / 2 - py) ** 2)
                x0, y0, x1, y1 = max(0, b[0] - 24), max(0, b[1] - 24), min(W, b[2] + 24), min(H, b[3] + 24)
                bx = [round(x0 / W, 4), round(y0 / H, 4), round(x1 / W, 4), round(y1 / H, 4)]
            a = A[y0:y1, x0:x1].copy()
            for dr in p.get('drop', []):  # areas of the take that belong to another piece: painted as the key
                dx0, dy0, dx1, dy1 = round(dr[0] * W) - x0, round(dr[1] * H) - y0, round(dr[2] * W) - x0, round(dr[3] * H) - y0
                a[max(0, dy0):max(0, dy1), max(0, dx0):max(0, dx1)] = np.median(np.concatenate([a[:6].reshape(-1, 3), a[:, :6].reshape(-1, 3)]), 0)
            if p.get('opaque'):
                rgba = key_top(a)
            else:
                prot = [(round(q[0] * W) - x0, round(q[1] * H) - y0, round(q[2] * W) - x0, round(q[3] * H) - y0) for q in p.get('protect', [])]
                ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
                k0 = np.median(ring, 0)
                rgba = finish(a, cut_piece(a, prot), p.get('keep_all', False), k0 if (k0[1] < k0[0] and k0[1] < k0[2]) else None)
            for side, px in p.get('round', []):
                rgba = round_end(rgba, side, px)
            cut = Image.fromarray(rgba, 'RGBA')
            bb = cut.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); cut = cut.crop(bb)
            side = cut.width if p.get('side') == 'w' else cut.height
            k = min(1.0, p['units'] * PX / side)
            if k < 1:
                cut = cut.resize((round(cut.width * k), round(cut.height * k)), Image.LANCZOS)
            o = np.asarray(cut).copy(); o[o[..., 3] == 0, :3] = 0
            f = od / p['dest'] / f"{p['name']}.webp"; f.parent.mkdir(parents=True, exist_ok=True)
            Image.fromarray(o).save(f, 'WEBP', lossless=True, method=6)
            sizes[p['name']] = {'take': stem, 'box': bx, 'w': cut.width, 'h': cut.height, 'units': p['units'], 'side': p.get('side', 'h')}
            print(p['name'], cut.size, flush=True)
    (od / 'sizes.json').write_text(json.dumps(sizes, indent=1))


if __name__ == '__main__':
    main(*sys.argv[1:4])
