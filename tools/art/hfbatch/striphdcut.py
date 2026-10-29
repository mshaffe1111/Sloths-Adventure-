"""Key a native-resolution strip from striphdgpu.py (VI-2, 2026-10-29) and make the side-by-side phone crops.

    python3 -I tools/art/hfbatch/striphdcut.py cut2 <old strip.webp> <new on grey.webp> <alpha-<stem>.webp> <out.webp>   (the one used)
    python3 -I tools/art/hfbatch/striphdcut.py cut <old strip.webp> <new on magenta.webp> <out.webp>   (the first try: keyed)
    python3 -I tools/art/hfbatch/striphdcut.py crops <old strip.webp> <new strip.webp> <near|mid> <out.jpg> [x0 fraction ...]
    python3 -I tools/art/hfbatch/striphdcut.py seam <strip.webp>

cut: the shape comes from the old strip (its alpha, Lanczos-scaled), so the repaint can add no new object in the clear sky: the
alpha is the repaint's own key (how far from magenta each pixel is) but never more than the old shape grown by a few pixels, and
never less than the old shape shrunk by a few (the inside stays solid). The colour on the soft rim is unmixed from the magenta
(c = (p - (1 - a) m) / a), then the left-over spill on the rim (r and b both above g) is pulled toward g. WebP q82.
crops: the upright phone view (390x844 css px, drawn as scenery.ts drawStrip does: k, a, at of STRIP_FIT, design height 720) at
device scale 3, old on the left and new on the right, each strip drawn with high-quality smoothing (Lanczos), on a dusky sky.
seam: scripts/strip-seamless.py join_score (the wrap from the last column to the first, against the picture's own column change)."""
import importlib.util, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

MAG = np.array([255, 0, 255], np.float32)
FIT = {'far': (1.2, 0.72, 0.6), 'mid': (1.0, 0.69, 0.58), 'near': (1.05, 0.72, 0.63)}


def cut(old_p, new_p, out_p, grow=4):
    new = np.asarray(Image.open(new_p).convert('RGB')).astype(np.float32)
    H, W = new.shape[:2]
    oldim = Image.open(old_p).convert('RGBA')
    a0 = np.asarray(oldim.getchannel('A').resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    # the old colour, un-premultiplied and spread a little into the clear (so a rim pixel has an old colour to be judged against)
    o = np.asarray(oldim).astype(np.float32)
    oa = o[..., 3:4] / 255
    pm = o[..., :3] * oa
    k = lambda v: ndimage.uniform_filter(v, size=(5, 5, 1)[:v.ndim])
    oc = k(pm) / np.maximum(k(oa), 1e-3)
    oc = np.where(oa > 0.6, o[..., :3], oc)
    oc = np.asarray(Image.fromarray(np.clip(oc, 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32)
    r, g, b = new[..., 0], new[..., 1], new[..., 2]
    # magenta-ness: r and b high and alike, g low
    keyness = np.clip(np.minimum(r, b) - g - np.abs(r - b) * 0.5, 0, 255)
    ak = np.clip((200 - keyness) / 140, 0, 1)
    hi = ndimage.maximum_filter(a0, size=2 * grow + 1)
    lo = ndimage.minimum_filter(a0, size=2 * grow + 1)
    a = np.clip(np.maximum(np.minimum(ak, hi), lo), 0, 1)
    a[a < 0.02] = 0
    rim = (a < 0.995) | ndimage.binary_dilation(a < 0.5, iterations=3)
    am = np.maximum(a, 0.05)[..., None]
    c = np.clip((new - (1 - am) * MAG) / am, 0, 255)
    c = np.where(rim[..., None], c, new)
    # spill: how much more magenta (r and b both above g) the pixel has than the old strip had there; pink petals and orchids keep theirs
    mag = lambda v: np.minimum(v[..., 0], v[..., 2]) - v[..., 1]
    rim2 = ndimage.binary_dilation(rim, iterations=2)
    ex = np.clip(mag(c) - np.maximum(mag(oc), 0) - 4, 0, None) * rim2
    c[..., 0] -= ex; c[..., 2] -= ex
    # a rim pixel the unmix could not save (it is still far off the old colour and very faint) takes the old colour
    bad = rim & (a < 0.35) & (np.abs(c - oc).sum(-1) > 120)
    c[bad] = oc[bad]
    px = np.dstack([np.clip(c, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(px, 'RGBA').save(out_p, 'WEBP', quality=82, method=6, alpha_quality=90)
    print(out_p, W, H, round(os.path.getsize(out_p) / 1048576, 2), 'MiB')


def cut2(old_p, new_p, alpha_p, out_p, pre_p=None, mode='paint', bg=(128, 128, 128)):
    """the repaint was made on flat grey, and the shape is the old strip's alpha sharpened by Real-ESRGAN (striphdgpu.py alpha-*): no
    keying at all, so the repaint can neither add nor drop a shape. The colour on the soft rim is unmixed from the grey; a faint rim
    pixel the unmix cannot save takes the old colour.
    With pre_p (the Real-ESRGAN start the repaint was made from), the outline band (the outer 5 px of every shape) is the start's,
    because the repaint moves an edge a pixel or two off the sharpened alpha and the outline came out ragged; mode 'grain' also keeps
    the start's broad colour blocks inside (the repaint softened the cel-shaded leaf clumps) and adds only the repaint's brushwork:
    start + (repaint - blur(repaint))."""
    new = np.asarray(Image.open(new_p).convert('RGB')).astype(np.float32)
    H, W = new.shape[:2]
    if pre_p:
        pre = np.asarray(Image.open(pre_p).convert('RGB')).astype(np.float32)
        if mode.startswith('mix'):  # mix<k>: k tenths of the repaint, the rest the start (where the repaint washes out the inner lines)
            k = int(mode[3:] or 5) / 10
            new = new * k + pre * (1 - k)
        if mode == 'grain':
            blur = lambda v: ndimage.gaussian_filter(v, (2.5, 2.5, 0))
            new = np.clip(pre + (new - blur(new)), 0, 255)
        solid = np.asarray(Image.open(alpha_p).convert('L')).astype(np.float32) > 250
        dist = ndimage.distance_transform_edt(solid)
        w = np.clip((dist - 2) / 4, 0, 1)[..., None]
        new = new * w + pre * (1 - w)
    a = np.asarray(Image.open(alpha_p).convert('L').resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    # (the old shape at this size, to keep the sharpened one honest: never more than the old one grown by 2 px)
    oldim = Image.open(old_p).convert('RGBA')
    a0 = np.asarray(oldim.getchannel('A').resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    a = np.minimum(a, ndimage.maximum_filter(a0, size=5))
    a[a < 0.03] = 0
    o = np.asarray(oldim).astype(np.float32)
    oa = o[..., 3:4] / 255
    pm = o[..., :3] * oa
    k = lambda v: ndimage.uniform_filter(v, size=(5, 5, 1))
    oc = np.where(oa > 0.6, o[..., :3], k(pm) / np.maximum(k(oa), 1e-3))
    oc = np.asarray(Image.fromarray(np.clip(oc, 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32)
    B = np.array(bg, np.float32)
    # (the repaint moves an edge by a pixel or two, so on the rim the sharpened alpha can cover bare grey, a pale halo; and now and
    # then it paints a thin leaf tip over in grey. How much paint each rim pixel really holds: its colour projected onto the line from
    # the grey to the old colour there. Where there is less paint than the alpha says: off the old shape that is a halo, so the alpha
    # comes down; on the old shape (a0 high) it is a lost tip, so it keeps the old colour.)
    d = oc - B
    dd = (d * d).sum(-1)
    proj = np.where(dd > 1600, np.clip(((new - B) * d).sum(-1) / np.maximum(dd, 1), 0, 1), 1)
    proj = ndimage.uniform_filter(proj, 3)
    near_rim = ndimage.binary_dilation(a < 0.98, iterations=2)
    short = near_rim & (proj < a * 0.7)
    lost = short & (a0 >= 0.3)
    halo = short & ~lost
    a = np.where(halo, proj, np.where(lost, np.minimum(a, np.maximum(a0, proj)), a))
    new = np.where(lost[..., None], oc * a[..., None] + B * (1 - a[..., None]), new)
    am = np.maximum(a, 0.05)[..., None]
    c = np.clip((new - (1 - am) * B) / am, 0, 255)
    rim = a < 0.98
    c = np.where(rim[..., None], c, new)
    t = np.clip((0.45 - a) / 0.3, 0, 1)[..., None]  # the faintest rim leans on the old colour
    c = c * (1 - t) + oc * t
    px = np.dstack([np.clip(c, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(px, 'RGBA').save(out_p, 'WEBP', quality=82, method=6, alpha_quality=90)
    print(out_p, W, H, round(os.path.getsize(out_p) / 1048576, 2), 'MiB')


def view(strip, part, fx, vw=390, vh=844, dpr=3, sky=(58, 70, 86)):
    k, af, at = FIT[part]
    s = vh / 720
    dh = 720 * s * k
    top = vh * at - af * dh
    iw = strip.width * dh / strip.height  # css px per copy
    x0 = fx * iw
    cv = Image.new('RGBA', (vw * dpr, vh * dpr), sky + (255,))
    # the part of the strip under the view, scaled to device pixels with Lanczos (as close as PIL gets to 'high' smoothing)
    sc = strip.height / dh  # strip px per css px
    box = (x0 * sc, max(0, -top) * sc, (x0 + vw) * sc, min(strip.height, (vh - top) * sc))
    out_h = round((box[3] - box[1]) / sc * dpr)
    piece = strip.resize((vw * dpr, out_h), Image.LANCZOS, box=box)
    cv.alpha_composite(piece, (0, round(max(0, top) * dpr)))
    return cv.convert('RGB')


def crops(old_p, new_p, part, out_p, fxs):
    old, new = Image.open(old_p).convert('RGBA'), Image.open(new_p).convert('RGBA')
    tiles = []
    for fx in fxs:
        a, b = view(old, part, fx), view(new, part, fx)
        t = Image.new('RGB', (a.width * 2 + 24, a.height + 60), (20, 20, 20))
        t.paste(a, (0, 60)); t.paste(b, (a.width + 24, 60))
        d = ImageDraw.Draw(t)
        d.text((10, 10), f'OLD {os.path.basename(old_p)} {old.width}x{old.height}  x={fx:.2f}', fill=(255, 255, 0))
        d.text((a.width + 34, 10), f'NEW {new.width}x{new.height}', fill=(255, 255, 0))
        tiles.append(t)
    S = Image.new('RGB', (sum(t.width for t in tiles) + 40 * (len(tiles) - 1), tiles[0].height), (0, 0, 0))
    x = 0
    for t in tiles:
        S.paste(t, (x, 0)); x += t.width + 40
    S.save(out_p, 'JPEG', quality=86)
    print(out_p, S.size)


def seam(p):
    spec = importlib.util.spec_from_file_location('ss', os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../scripts/strip-seamless.py'))
    ss = importlib.util.module_from_spec(spec); spec.loader.exec_module(ss)
    a = np.asarray(Image.open(p).convert('RGBA')).astype(float)
    j, nb = ss.join_score(a)
    print(f'{os.path.basename(p)}: join {j:.2f}, columns {nb:.2f}', 'OK' if j <= nb * 1.5 else 'ROUGH')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'cut':
        cut(*sys.argv[2:5])
    elif cmd == 'cut2':  # old new alpha out [pre [mode]]
        cut2(*sys.argv[2:8])
    elif cmd == 'crops':
        crops(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], [float(x) for x in sys.argv[6:]] or [0.15, 0.6])
    elif cmd == 'seam':
        for p in sys.argv[2:]:
            seam(p)
