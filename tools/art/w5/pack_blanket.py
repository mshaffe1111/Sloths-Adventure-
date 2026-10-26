"""The blanket stills for the end of Meeca's stage (World 5, 2026-10-26): Lieutenant Pell's olive army blanket with its badly darned
patch (folded, a prop), and Meeca with it round her shoulders, from model-free on-model edits (tools/art/w5/make_pell_specs.py).
Writes src/assets/characters/meeca-blanket.webp + src/game/meecaBlanketData.ts. Not used by any scene yet.

    python3 -I tools/art/w5/pack_blanket.py <blanket edit.png> <meeca edit.png> [<pell offer edit.png> '<json fix>' <work dir>]

The fix gives both blankets the one patch on Pell's blanket in his offer edit (the edits drew three different patches): the edit's own
patch is painted out and Pell's square brown patch with its crooked X stitches is warped over the spot.
  {"src_box": [x0, y0, x1, y1], "src_quad": [4 corners of Pell's patch], "prop_quad": [4 corners of the prop's patch], "prop_grow": px,
   "meeca_disc": [cx, cy, r, y max], "meeca_side": px, "meeca_deg": deg}   (picture px of each edit, corners clockwise from top left)

Each picture is keyed off its own background (w5lib.sheet_mask, as pack_poses.py does), its ground shadow cut (w5gpu.clean_start's
rule, done here on the cut-out: a dark neutral fringe at the bottom), and sized: Meeca to her standard sheet's standing height
(MEECA_STAND_H px) and the blanket to BLANKET_UNITS world units wide at that scale, both stored UP (2) times larger (about 44 world units,
the size it is in Pell's arms). Anchors: Meeca the middle of her feet on the ground line; the blanket the middle of its width, on its bottom edge.
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parent))
from w5lib import sheet_mask  # noqa: E402

G = Path(__file__).resolve().parents[3]
STAND_H = float(re.search(r'MEECA_STAND_H = ([\d.]+)', (G / 'src/game/meecaStandardData.ts').read_text()).group(1))
MEECA_UNITS = 90  # jennifurSprite.ts
BLANKET_UNITS = 44
UP = 2  # stored at twice meeca-standard's pixel size, so a close ending shot stays sharp
BLANKET_W = round(UP * BLANKET_UNITS * STAND_H / MEECA_UNITS)


def cut(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    d = sheet_mask(a)
    fig = ndimage.binary_opening(d > 30, iterations=1)
    lab, n = ndimage.label(ndimage.binary_dilation(fig, iterations=6))
    sizes = ndimage.sum(fig, lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.flatnonzero(sizes > sizes.max() * 0.03)) & fig
    keep = ndimage.binary_fill_holes(keep) | keep
    # the edit's soft ground shadow: dark, grey, low in the picture, joined to the outside
    lum, sat = a.mean(-1), a.max(-1) - a.min(-1)
    ys = np.nonzero(keep.any(1))[0]
    band = np.zeros(keep.shape, bool); band[int(ys.max() - 0.15 * (ys.max() - ys.min())):] = True
    shadow_like = band & (sat < 22) & (lum > 60)
    lab2, _ = ndimage.label(shadow_like | ~keep)
    out = np.unique(lab2[~keep])
    keep &= ~(np.isin(lab2, out[out > 0]) & shadow_like)
    alpha = np.clip((d - 18) / 26, 0, 1) * ndimage.binary_dilation(keep, iterations=2) * keep.astype(float).clip(0, 1)
    alpha = np.maximum(alpha, ndimage.binary_erosion(keep, iterations=2))
    ys, xs = np.nonzero(alpha > 0.5)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    return Image.fromarray(np.dstack([a[y0:y1, x0:x1], alpha[y0:y1, x0:x1] * 255]).astype(np.uint8), 'RGBA')


def persp(dst, src):
    """PIL PERSPECTIVE coefficients mapping output points dst[i] to input points src[i] (four of each)"""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        b += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(b, float))


def inpaint(a, region, iters=400):
    """fill region with the colours around it, smoothly (repeated averaging of the four neighbours)"""
    ys, xs = np.nonzero(region)
    y0, y1, x0, x1 = max(0, ys.min() - 2), ys.max() + 3, max(0, xs.min() - 2), xs.max() + 3
    sub, m = a[y0:y1, x0:x1].copy(), region[y0:y1, x0:x1]
    ring = ndimage.binary_dilation(m, iterations=3) & ~m
    sub[m] = sub[ring].mean(0)
    for _ in range(iters):
        avg = (np.roll(sub, 1, 0) + np.roll(sub, -1, 0) + np.roll(sub, 1, 1) + np.roll(sub, -1, 1)) / 4
        sub[m] = avg[m]
    a[y0:y1, x0:x1] = sub


def pell_patch(path, box, quad):
    """the darned patch on Pell's blanket in his offer edit: the brown square, its outline and its crooked stitches (everything in box
    that is not the blanket's olive), as RGBA, with its four corners (quad, picture px) to warp it by"""
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    x0, y0, x1, y1 = box
    sub = a[y0:y1, x0:x1]
    edge = np.concatenate([sub[:3].reshape(-1, 3), sub[-3:].reshape(-1, 3), sub[:, :3].reshape(-1, 3), sub[:, -3:].reshape(-1, 3)])
    olive = np.median(edge, 0)
    m = np.sqrt(((sub - olive) ** 2).sum(-1)) > 28
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, 1 + np.flatnonzero(sizes > sizes.max() * 0.01))
    al = ndimage.gaussian_filter(ndimage.binary_dilation(m, iterations=1).astype(float), 0.7)
    return Image.fromarray(np.dstack([sub, al * 255]).clip(0, 255).astype(np.uint8), 'RGBA'), [(u - x0, v - y0) for u, v in quad]


def repatch(path, region, quad, patch):
    """paint out the edit's own patch (region: a function of the picture array giving the pixels to fill) and lay Pell's patch over the
    spot, warped onto quad (its four corners, picture px, clockwise from top left)"""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    inpaint(a, region(a))
    base = Image.fromarray(a.clip(0, 255).astype(np.uint8)).convert('RGBA')
    p, src = patch
    warped = p.transform(base.size, Image.PERSPECTIVE, tuple(persp(quad, src)), Image.BICUBIC)
    base.alpha_composite(warped)
    return base.convert('RGB')


def disc_region(cx, cy, r, ymax):
    """Meeca's take: a round orange patch with stitches sticking out of it, above the blanket's hem"""
    def f(a):
        yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
        near = ((xx - cx) ** 2 + (yy - cy) ** 2 < r * r) & (yy < ymax)
        lum = a.mean(-1)
        hit = near & (((a[..., 0] - a[..., 1]) > 30) | (lum < 100))
        return ndimage.binary_dilation(hit, iterations=4) & near
    return f


def quad_region(quad, grow):
    """the prop's take: the stitched patch inside quad, its stitches and thread a little past it (grow px)"""
    def f(a):
        from PIL import ImageDraw
        mk = Image.new('L', (a.shape[1], a.shape[0]), 0)
        ImageDraw.Draw(mk).polygon([tuple(q) for q in quad], fill=255)
        return ndimage.binary_dilation(np.asarray(mk) > 0, iterations=grow)
    return f


def square(cx, cy, side, deg):
    t = np.radians(deg)
    c, s = np.cos(t), np.sin(t)
    return [(cx + c * dx - s * dy, cy + s * dx + c * dy) for dx, dy in ((-side / 2, -side / 2), (side / 2, -side / 2), (side / 2, side / 2), (-side / 2, side / 2))]


# one patch on both blankets: the brown square with crooked X stitches from Pell's offer (picture px of each edit; 2026-10-26 takes:
# w5p-offer-1, w5p-blanket-1, w5m-blanket-3)
FIX = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None
if FIX:
    patch = pell_patch(sys.argv[3], FIX['src_box'], FIX['src_quad'])
    pb = FIX['prop_quad']
    Path('/tmp').exists()
    fixed_b = repatch(sys.argv[1], quad_region(pb, FIX.get('prop_grow', 14)), pb, patch)
    cx, cy, r, ymax = FIX['meeca_disc']
    fixed_m = repatch(sys.argv[2], disc_region(cx, cy, r, ymax), square(cx, cy, FIX['meeca_side'], FIX.get('meeca_deg', -6)), patch)
    tmp = Path(sys.argv[5] if len(sys.argv) > 5 else '.')
    fixed_b.save(tmp / 'blanket-repatched.png'); fixed_m.save(tmp / 'meeca-repatched.png')
    sys.argv[1], sys.argv[2] = str(tmp / 'blanket-repatched.png'), str(tmp / 'meeca-repatched.png')
blanket, meeca = cut(sys.argv[1]), cut(sys.argv[2])
blanket = blanket.resize((BLANKET_W, round(blanket.height * BLANKET_W / blanket.width)), Image.LANCZOS)
meeca = meeca.resize((round(meeca.width * UP * STAND_H / meeca.height), round(UP * STAND_H)), Image.LANCZOS)
frames = {}
for n, im in (('meeca_blanket', meeca), ('blanket', blanket)):
    al = np.asarray(im.getchannel('A')) > 128
    low = np.nonzero(al.any(1))[0].max()
    cols = np.nonzero(al[max(0, low - 6):low + 1].any(0))[0]
    cx = float(cols.min() + cols.max()) / 2 if n == 'meeca_blanket' else im.width / 2  # the folded blanket's lowest corner is not its middle
    frames[n] = (im, round(cx, 1), float(low + 1))
pad = 2
W = meeca.width + pad + blanket.width
H = max(meeca.height, blanket.height)
S = Image.new('RGBA', (W, H), (0, 0, 0, 0))
pos = {'meeca_blanket': (0, 0), 'blanket': (meeca.width + pad, 0)}
for n, (im, _, _) in frames.items():
    S.paste(im, pos[n])
dst = G / 'src/assets/characters/meeca-blanket.webp'
S.save(dst, 'WEBP', quality=86, method=6)
data = {n: {'x': pos[n][0], 'y': pos[n][1], 'w': im.width, 'h': im.height, 'ax': ax, 'ay': ay} for n, (im, ax, ay) in frames.items()}
ts = ("/** Generated by tools/art/w5/pack_blanket.py: the end of Meeca's stage (World 5, 2026-10-26). Lieutenant Pell's olive army blanket\n"
      " * with its badly darned patch (`blanket`, a prop, the middle of its bottom edge on the ground) and Meeca wrapped in it (`meeca_blanket`,\n"
      " * the middle of her feet on the ground line, facing right), from model-free on-model edits. Both at meeca-standard.webp's scale\n"
      " * at MEECA_BLANKET_UP times its pixel size (draw at its K / MEECA_BLANKET_UP: MEECA_UNITS / MEECA_STAND_H / 2 world units per pixel).\n"
      " * Not used by any scene yet. */\n")
ts += 'export interface BlanketFrame { x: number; y: number; w: number; h: number; ax: number; ay: number }\n'
ts += "export const MEECA_BLANKET_URL = new URL('../assets/characters/meeca-blanket.webp', import.meta.url).href;\n"
ts += f'export const MEECA_BLANKET_SIZE = {{ w: {S.width}, h: {S.height} }};\n'
ts += f'export const MEECA_BLANKET_UP = {UP};\n'
ts += f'export const BLANKET_UNITS = {BLANKET_UNITS};\n'
ts += 'export const MEECA_BLANKET_FRAMES: Record<string, BlanketFrame> = ' + json.dumps(data) + ';\n'
(G / 'src/game/meecaBlanketData.ts').write_text(ts)
print(S.size, round(dst.stat().st_size / 1024), 'KB', data)
