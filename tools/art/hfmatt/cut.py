"""ART-MATT (R-165.230): cut Matt's 11-14 sheets (reference/art/matt/2026-11-14/, 1024 px on WHITE) at 3 px a game unit.

    python3 -I tools/art/hfmatt/cut.py <up dir> <out dir>

<up dir> holds sheet1.png, sheet2.png, sheet3.png: each WHOLE sheet upscaled 4x by Real-ESRGAN anime6b on this machine
(tools/art/upscale/up.py: the sheet is opaque, so no transparent-edge smear; $0), so every piece is cut from 1000-1900 px of paint;
and the Hugging Face pod takes (reference/art/hfmatt/raw/<take>.webp) upscaled the same way as <up dir>/<take>.png (the 600 px floor:
the takes alone gave 512-595 px pods). A take missing from <up dir> is read from raw/ as is.
Modes per piece (cut.json):
  flood  hf678/recut.py's cut: background = white flooded in from the border, stopped by the line; 1 px in, 0.8 px blur, despill.
  wood   flood, then every bark-brown pixel (the sawn log under a tie, the stubs under the leaf lid) is cleared and so is the log's
         line where it is not the vine's (dark px more than `reach` px from vine colour): World 1 has no made things (the lead's rule).
  soft   dust: alpha unmixed from white (alpha = darkness / the 99th percentile, colour un-mixed), no hard edge.
`align` (the tie): all states are scaled by their own log's thickness to `bough` units and placed on ONE canvas with the knot centre
and the log's centre line on the same pixel, so taut / straining / snapped swap with no jump. The anchor goes in sizes.json.
`parts` (chips): each separate chip is also written alone (<name>-<i>), for a particle burst.
"""
import json, runpy, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

G = Path(__file__).resolve().parents[3]
R = runpy.run_path(str(G / 'tools/art/hf678/recut.py'))
cut_piece, finish, hue_sat = R['cut_piece'], R['finish'], R['hue_sat']
PX = 3.0
WHITE = np.array([255.0, 255.0, 255.0])


def wood_mask(a):
    h, s = hue_sat(a)
    v = a.max(-1) / 255
    return (h >= 12) & (h <= 45) & (s > 0.28) & (v > 0.22)


def vine_mask(a):
    h, s = hue_sat(a)
    return (h > 48) & (h < 170) & (s > 0.12) & (a.max(-1) > 60)


def unwood(a, rgba, reach):
    """clear the bark (log) and the log's own line; keep the vine and the vine's line"""
    vine = ndi.binary_opening(vine_mask(a), iterations=1)
    near = ndi.distance_transform_edt(~vine) <= reach
    wood = ndi.binary_dilation(wood_mask(a), iterations=2) & ~vine
    dark = a.max(-1) < 90
    keep = (rgba[..., 3] > 0) & ~wood & (vine | (dark & near) | (~dark & near))
    keep = ndi.binary_opening(keep, iterations=2)
    lab, n = ndi.label(keep)
    if n:
        sz = ndi.sum(keep, lab, range(1, n + 1))
        keep = np.isin(lab, 1 + np.nonzero(sz >= 0.002 * sz.max())[0])
    inside = keep
    core = ndi.binary_erosion(inside, iterations=1)
    from PIL import ImageFilter
    al = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
    al = np.where(core, 255, al); al = np.where(ndi.binary_dilation(core, iterations=2), al, 0)
    al = np.minimum(al, rgba[..., 3])
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    rgb = np.where(core[..., None], rgba[..., :3], rgba[..., :3][iy, ix]).astype(np.float32)
    rgb[al == 0] = 0
    return np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)


def soft(a):
    d = 255 - a.min(-1)
    dmax = np.percentile(d[d > 12], 99) if (d > 12).any() else 255
    al = np.clip((d - 6) / max(dmax - 6, 1), 0, 1)
    al = ndi.gaussian_filter(al, 1.0)
    F = (a - (1 - al[..., None]) * WHITE) / np.maximum(al[..., None], 1e-3)
    F = np.clip(F, 0, 255)
    F[al < 0.02] = 0
    return np.dstack([F, al * 255]).clip(0, 255).astype(np.uint8)


def crop_box(A, bx):
    H, W, _ = A.shape
    x0, y0, x1, y1 = round(bx[0] * W), round(bx[1] * H), round(bx[2] * W), round(bx[3] * H)
    return A[y0:y1, x0:x1], (x0, y0, x1, y1)


def save(rgba, f):
    o = rgba.copy(); o[o[..., 3] == 0, :3] = 0
    f.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(o).save(f, 'WEBP', lossless=True, method=6)


def to_units(img, units, side):
    bb = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); img = img.crop(bb)
    s = img.width if side == 'w' else img.height
    k = units * PX / s
    return img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS), k, s


def main(up, od):
    cfg = json.loads((Path(__file__).parent / 'cut.json').read_text()); od = Path(od); sizes = {}
    for sheet, pieces in cfg.items():
        f = Path(up) / f'{sheet}.png'
        if not f.exists():  # a Hugging Face take not upscaled: reference/art/hfmatt/raw/<sheet>.webp as is
            f = G / 'reference/art/hfmatt/raw' / f'{sheet}.webp'
        A = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
        group = []
        for p in pieces:
            a, box = crop_box(A, p['box'])
            mode = p.get('mode', 'flood')
            if mode == 'soft':
                rgba = soft(a)
            else:
                ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
                k0 = np.median(ring, 0)  # a magenta take (the pods): recut.py's rim despill of the key's maroon cast
                rgba = finish(a, cut_piece(a), p.get('keep_all', False), k0 if (k0[1] < k0[0] and k0[1] < k0[2]) else None)
                if mode == 'wood':
                    rgba = unwood(a, rgba, p.get('reach', 14))
            src_px = max(np.ptp(np.nonzero(rgba[..., 3] > 8)[0]) + 1, np.ptp(np.nonzero(rgba[..., 3] > 8)[1]) + 1)
            if 'align' in p:
                log = ndi.binary_opening(wood_mask(a), iterations=3)
                rows = np.nonzero(log.sum(1) > 0.25 * log.sum(1).max())[0]
                ly0, ly1 = rows[0], rows[-1]
                vine = vine_mask(a) & (rgba[..., 3] > 128)
                band = vine[ly0:ly1 + 1]
                cols = np.nonzero(band.sum(0) > 0.3 * band.sum(0).max())[0]
                kx = (cols[0] + cols[-1]) / 2; ky = (ly0 + ly1) / 2
                group.append((p, rgba, kx, ky, ly1 - ly0, box, src_px))
                continue
            img, k, s = to_units(Image.fromarray(rgba, 'RGBA'), p['units'], p.get('side', 'h'))
            save(np.asarray(img), od / p['dest'] / f"{p['name']}.webp")
            sizes[p['name']] = dict(sheet=sheet, box=box, w=img.width, h=img.height, units=p['units'], side=p.get('side', 'h'),
                                    src_px=int(src_px), scale=round(k, 4), crisp=bool(k <= 1.0))
            print(p['name'], img.size, 'from', src_px, 'px', flush=True)
            if p.get('parts'):
                al = np.asarray(img)[..., 3] > 40
                lab, n = ndi.label(ndi.binary_dilation(al, iterations=2))
                arr = np.asarray(img); i = 0
                for sl in ndi.find_objects(lab):
                    sub = arr[sl].copy(); m = lab[sl] == (lab[sl][lab[sl] > 0][0])
                    sub[~m] = 0
                    if (sub[..., 3] > 40).sum() < 60: continue
                    i += 1; save(sub, od / p['dest'] / f"{p['name']}-{i}.webp")
                    sizes[f"{p['name']}-{i}"] = dict(sheet=sheet, part_of=p['name'], w=sub.shape[1], h=sub.shape[0], units=round(sub.shape[0] / PX, 1), side='h')
                print(p['name'], i, 'parts', flush=True)
        if group:
            bough = group[0][0]['bough']
            scaled = []
            for p, rgba, kx, ky, th, box, src_px in group:
                k = bough * PX / th
                img = Image.fromarray(rgba, 'RGBA').resize((round(rgba.shape[1] * k), round(rgba.shape[0] * k)), Image.LANCZOS)
                scaled.append((p, np.asarray(img), kx * k, ky * k, k, box, src_px))
            # one canvas: the union of every state's extent about its anchor (knot centre x, log centre y)
            ext = []
            for p, arr, ax, ay, k, box, sp in scaled:
                ys, xs = np.nonzero(arr[..., 3] > 8)
                ext.append((xs.min() - ax, ys.min() - ay, xs.max() + 1 - ax, ys.max() + 1 - ay))
            L = int(np.floor(min(e[0] for e in ext))) - 2; T = int(np.floor(min(e[1] for e in ext))) - 2
            Rr = int(np.ceil(max(e[2] for e in ext))) + 2; B = int(np.ceil(max(e[3] for e in ext))) + 2
            for p, arr, ax, ay, k, box, sp in scaled:
                can = Image.new('RGBA', (Rr - L, B - T), (0, 0, 0, 0))
                ox, oy = round(-L - ax), round(-T - ay)
                can.alpha_composite(Image.fromarray(arr, 'RGBA'), (ox, oy))
                save(np.asarray(can), od / p['dest'] / f"{p['name']}.webp")
                sizes[p['name']] = dict(sheet=sheet, box=box, w=can.width, h=can.height, units=round(can.height / PX, 1), side='h',
                                        src_px=int(sp), scale=round(k, 4), crisp=bool(k <= 1.0), anchor=[-L, -T],
                                        anchor_is='knot centre x, bough centre line y (px in the file): put it on the bough centre',
                                        bough_units=bough)
                print(p['name'], can.size, 'anchor', (-L, -T), 'scale', round(k, 3), flush=True)
    (od / 'sizes.json').write_text(json.dumps(sizes, indent=1))


if __name__ == '__main__':
    main(*sys.argv[1:3])
