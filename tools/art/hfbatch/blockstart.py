"""Start sheets for the hf-art-blocking batch (2026-10-29), on flat magenta, for img2img (tools/art/w6to10/img2imggpu.py):
  start-w7anchors.webp  1216 x 896   four broken carved lintel ends (W7 kit 'branch' / 'mossStrip'), a liana knotted round each and
                                     hanging down past the bottom of its cell (cut straight later)
  start-w7walls.webp    1280 x 1216  four 260 x 1160 temple wall strips: stacked blocks of mixed sizes cut from the W7 kit's wall
                                     stone, a carved band, fig roots and moss hanging down, one with the sloth statue's worn face
  start-w4falls.webp    1536 x 1152  three fall bodies, a wet stone pillar (W4 kit 'wall', the trickle column), three mossy rock
                                     lips (W4 kit 'bank') with a pour, two splash strips, two mist clouds and a spray plume; the
                                     water painted procedurally in the backdrop falls' white and blue-grey
  start-w6ledges.webp   1536 x 896   2 x 2 ledges, each held up (W6 kit 'branch' root shelf, mooring-post wood planks and posts,
                                     w6d root-arch legs and moss-log)
  start-w6perches.webp  1536 x 768   the same four as short perches
Every piece of stone, wood and root is the world kits' own painting, so the style model only repaints it.
    python3 -I tools/art/hfbatch/blockstart.py <game checkout> <out dir>
"""
import json, math, random, re, sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'w6to10'))
from PIL import Image, ImageDraw, ImageFilter

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
KF = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', (GAME / 'src/game/kitAtlasData.ts').read_text(), re.S).group(1))
MAG = (255, 0, 255, 255)
INK = (34, 32, 34, 255)


def kit(w, n):
    im = Image.open(GAME / f'src/assets/kits/w{w}.webp').convert('RGBA')
    f = KF[str(w)][n]
    return im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def prop(sheet, n):
    im = Image.open(GAME / f'src/assets/w6to10/props-made/{sheet}.webp').convert('RGBA')
    f = json.loads((GAME / f'src/assets/w6to10/props-made/{sheet}.json').read_text())['frames'][n]
    return im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def trim(im):
    return im.crop(im.getchannel('A').getbbox())


def rs(im, w, h):
    return im.resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)


def opaque(im):
    a = im.copy(); a.putalpha(255); return a


def outline(im, r=2, col=INK):
    """a thin dark outline round a cut-out, like the kit pieces have"""
    a = im.getchannel('A').point(lambda v: 255 if v > 100 else 0)
    big = a.filter(ImageFilter.MaxFilter(2 * r + 1))
    o = Image.new('RGBA', im.size, col); o.putalpha(big)
    o.alpha_composite(im)
    return o


def jag_mask(w, h, side, depth, seed):
    """a mask that is the full box except a ragged broken end on one side"""
    rnd = random.Random(seed)
    pts = []
    n = 9
    for i in range(n + 1):
        y = h * i / n
        d = rnd.uniform(0.15, 1.0) * depth
        pts.append((w - d if side == 'r' else d, y))
    m = Image.new('L', (w, h), 0)
    poly = ([(0, 0)] + pts + [(0, h)]) if side == 'r' else ([(w, 0)] + pts + [(w, h)])
    ImageDraw.Draw(m).polygon(poly, fill=255)
    return m


# ---------------------------------------------------------------------------------------------------------------- W7 anchors
def w7anchors():
    W, H = 1216, 896
    S = Image.new('RGBA', (W, H), MAG)
    branch, moss = opaque(kit(7, 'branch')), opaque(kit(7, 'mossStrip'))
    bank = opaque(kit(7, 'bank'))
    lia = trim(kit(7, 'liana'))
    body = lia.crop((0, 120, lia.width, 520))   # the liana's straight stretch
    # four lintels: (source, crop box, broken side, slot)
    specs = [(branch, (0, 0, 300, 95), 'r', 0, 0, 1.45), (moss, (40, 0, 340, 95), 'l', 1, 0, 1.4),
             (bank, (0, 0, 360, 120), 'r', 0, 1, 1.15), (branch, (250, 0, 560, 95), 'l', 1, 1, 1.35)]
    rnd = random.Random(7)
    for i, (src, box, side, cx, cy, k) in enumerate(specs):
        x0, y0 = cx * 608, cy * 448
        lin = rs(src.crop(box), (box[2] - box[0]) * k, (box[3] - box[1]) * k)
        lw, lh = lin.size
        lin.putalpha(jag_mask(lw, lh, side, 46, i))
        # (a darker broken face along the jagged end)
        a = np.asarray(lin).astype(np.float32)
        al = a[..., 3] > 0
        from scipy import ndimage
        edge = ndimage.binary_dilation(~al, iterations=14) & al
        if side == 'r':
            edge[:, :lw // 2] = False
        else:
            edge[:, lw // 2:] = False
        a[edge, :3] *= 0.72
        lin = outline(Image.fromarray(a.astype(np.uint8), 'RGBA'), 2)
        px = x0 + (608 - lw) // 2 + (30 if side == 'l' else -30)
        py = y0 + 0          # the top edge sits on the cell's top: the lintel runs on above
        # the hanging liana: from the knot near the broken end, straight down past the cell's foot
        ko = (95, 140, 75, 120)[i]
        kx = px + (lw - ko if side == 'r' else ko)
        lv = rs(body, body.width * 2.1, body.height * 1.6)
        hang_top = py + lh - 20
        L = Image.new('RGBA', (lv.width, 448 - 40 - (hang_top - y0)), (0, 0, 0, 0))
        y = 0
        while y < L.height:
            L.alpha_composite(lv, (0, y)); y += lv.height - 4
        S.alpha_composite(L, (kx - lv.width // 2, hang_top))
        S.alpha_composite(lin, (px, py))
        # the knot: three thick liana wraps round the beam, and a loose end
        d = ImageDraw.Draw(S)
        col = (128, 86, 66, 255); hi = (160, 112, 86, 255)
        for j in range(3):
            wx = kx - 40 + j * 30 + rnd.randint(-4, 4)
            pts = [(wx - 16 + 30 * t + 8 * math.sin(t * 3.1), py - 6 + (lh + 16) * t) for t in [q / 8 for q in range(9)]]
            d.line(pts, fill=INK, width=30, joint='curve')
            d.line(pts, fill=col, width=24, joint='curve')
            d.line([(x - 6, y) for x, y in pts], fill=hi, width=6, joint='curve')
        d.ellipse([kx - 36, py + lh - 30, kx + 36, py + lh + 30], fill=INK)
        d.ellipse([kx - 32, py + lh - 26, kx + 32, py + lh + 26], fill=col)
        d.arc([kx - 22, py + lh - 16, kx + 22, py + lh + 16], 200, 340, fill=hi, width=5)
        ex = kx + (40 if side == 'r' else -40)   # the knot's loose end, curling off to one side
        tail = [(kx, py + lh + 10), (ex, py + lh + 40), (ex + (14 if side == 'r' else -14), py + lh + 80)]
        d.line(tail, fill=INK, width=18, joint='curve'); d.line(tail, fill=col, width=12, joint='curve')
        # a few dry leaves on top of the break
        for j in range(3):
            lx = px + (lw - 60 if side == 'r' else 60) + rnd.randint(-40, 40)
            ly = py + rnd.randint(6, 30)
            d.ellipse([lx, ly, lx + 22, ly + 11], fill=(150, 98, 52, 255), outline=INK)
    S.convert('RGB').save(OUT / 'start-w7anchors.webp', 'WEBP', quality=92)


# ------------------------------------------------------------------------------------------------------------------ W7 walls
def w7walls():
    W, H = 1280, 1216
    SW, SH = 260, 1160
    S = Image.new('RGBA', (W, H), MAG)
    wall, butt, fill = opaque(kit(7, 'wall')), opaque(kit(7, 'buttress')), opaque(kit(7, 'fill'))
    branch = opaque(kit(7, 'branch'))
    roots = trim(prop('w7c', 'fig-roots'))
    statue = trim(prop('w7c', 'sloth-statue'))
    arch = trim(prop('w7c', 'archway'))
    srcs = [wall.crop((10, 60, 420, 330)), butt.crop((70, 120, 200, 330)), fill, wall.crop((30, 200, 400, 420)),
            arch.crop((20, 60, 120, 400))]
    for s in range(4):
        rnd = random.Random(100 + s)
        x0, y0 = 48 + s * (SW + 48), 28
        T = Image.new('RGBA', (SW, SH), (120, 118, 112, 255))
        y = 0
        face_row = 3 if s == 2 else -1
        row = 0
        while y < SH:
            if row == face_row:
                h = 300
            else:
                h = rnd.choice([110, 140, 170, 200, 230, 90])
            h = min(h, SH - y) if SH - y > 70 else SH - y
            # a carved meander band every so often
            if row in (1, 5) and s != 2 or (s == 2 and row == 6):
                band = rs(branch.crop((20, 30, 560, 80)), SW * 1.8, 64).crop((rnd.randint(0, 200), 0, rnd.randint(0, 200) + SW, 64))
                T.alpha_composite(band, (0, y)); ImageDraw.Draw(T).line([(0, y), (SW, y)], fill=INK, width=3)
                y += 64; row += 1; continue
            # split the row into one or two blocks, staggered
            cuts = [0, SW] if rnd.random() < 0.45 else [0, rnd.randint(80, 180), SW]
            for a, b in zip(cuts, cuts[1:]):
                dd = ImageDraw.Draw(T)
                base = np.array(rnd.choice([(126, 128, 118), (118, 120, 112), (134, 134, 124), (112, 114, 108)]), np.float32)
                bw, bh = b - a, h
                yy, xx = np.mgrid[0:bh, 0:bw]
                shade = 1.08 - 0.16 * (yy / max(1, bh)) - 0.06 * (xx / max(1, bw))   # light from the upper left
                rs_ = np.random.RandomState(rnd.randint(0, 9999))
                nz = np.asarray(Image.fromarray((rs_.rand(bh // 8 + 2, bw // 8 + 2) * 255).astype(np.uint8)).resize((bw, bh), Image.BICUBIC)).astype(np.float32) / 255
                px_ = base[None, None] * (shade * (0.92 + 0.12 * nz))[..., None]
                blk = Image.fromarray(np.clip(px_, 0, 255).astype(np.uint8)).convert('RGBA')
                if rnd.random() < 0.3:  # a carved meander panel from the kit wall
                    pn = rs(wall.crop((40, 80, 200, 200)), bw - 24, min(bh - 24, 110))
                    blk.alpha_composite(pn, (12, (bh - pn.height) // 2))
                T.alpha_composite(blk, (a, y))
                dd.rectangle([a, y, b - 1, y + h - 1], outline=INK, width=3)
                dd.line([(a + 4, y + 4), (b - 6, y + 4)], fill=(160, 160, 150, 255), width=2)   # a lit top edge
                if rnd.random() < 0.45:  # a crack
                    cx = rnd.randint(a + 10, max(a + 11, b - 10)); cy = y + rnd.randint(5, max(6, h // 3))
                    pts = [(cx, cy)]
                    for _ in range(4):
                        cx += rnd.randint(-14, 14); cy += rnd.randint(12, 28); pts.append((cx, cy))
                    dd.line(pts, fill=INK, width=3)
            if row == face_row:
                face = statue.crop((0, 0, statue.width, int(statue.height * 0.42)))
                face = rs(face, SW * 0.82, SW * 0.82 * face.height / face.width)
                fa = np.asarray(face).astype(np.float32)
                g = fa[..., :3].mean(axis=2, keepdims=True)
                fa[..., :3] = (g * 0.8 + fa[..., :3] * 0.2) * 0.92  # weathered: pulled toward the wall's grey
                T.alpha_composite(Image.fromarray(fa.astype(np.uint8)), ((SW - face.width) // 2, y + (h - face.height) // 2))
            y += h; row += 1
        # one dry root creeping down from the top, moss creeping down off block edges
        # (each strip its own root, kept off the top and bottom 12% so the stacked seam is stone only)
        rx0 = rnd.randint(0, roots.width // 3)
        r = roots.crop((rx0, rnd.randint(0, 60), rx0 + roots.width // 2, roots.height))
        if rnd.random() < 0.5:
            r = r.transpose(Image.FLIP_LEFT_RIGHT)
        r = rs(r, SW * rnd.uniform(0.6, 0.9), SH * rnd.uniform(0.3, 0.5))
        T.alpha_composite(r, (rnd.randint(-30, SW - r.width + 30), rnd.randint(int(SH * 0.12), int(SH * 0.88) - r.height)))
        dd = ImageDraw.Draw(T)
        for j in range(5):
            mx, my = rnd.randint(0, SW - 40), rnd.randint(int(SH * 0.12), int(SH * 0.85))
            for q in range(4):
                dd.ellipse([mx + q * 12, my + rnd.randint(-4, 8), mx + q * 12 + 26, my + 14 + rnd.randint(0, 6)],
                           fill=(104, 128, 64, 255))
                dd.line([(mx + q * 12 + 12, my + 10), (mx + q * 12 + 12 + rnd.randint(-3, 3), my + 22 + rnd.randint(0, 26))],
                        fill=(96, 120, 60, 255), width=5)
        dd.line([(0, 0), (0, SH)], fill=INK, width=3); dd.line([(SW - 1, 0), (SW - 1, SH)], fill=INK, width=3)
        S.alpha_composite(T, (x0, y0))
    S.convert('RGB').save(OUT / 'start-w7walls.webp', 'WEBP', quality=92)


# ------------------------------------------------------------------------------------------------------------------ W4 falls
WHITE = np.array([236, 240, 242], np.float32)
SHADE = np.array([150, 166, 178], np.float32)


def noise1(n, scale, rnd):
    v = np.array([rnd.random() for _ in range(n // scale + 3)])
    xs = np.arange(n) / scale
    i = xs.astype(int); f = xs - i; f = f * f * (3 - 2 * f)
    return v[i] * (1 - f) + v[i + 1] * f


def water(w, h, rnd, edge=0.16):
    """a falling sheet: white streaks, blue-grey gaps, ragged sides, a thin dark outline; returns RGBA"""
    xs = np.arange(w)
    st = 0.55 * noise1(w, 9, rnd) + 0.45 * noise1(w, 3, rnd)          # streak pattern across
    img = np.zeros((h, w, 4), np.float32)
    left = (noise1(h, 37, rnd) * 0.6 + noise1(h, 11, rnd) * 0.4) * w * edge
    right = (noise1(h, 41, rnd) * 0.6 + noise1(h, 13, rnd) * 0.4) * w * edge
    wob = noise1(h, 60, rnd) * 6
    for y in range(h):
        xx = xs + wob[y]
        s = np.interp(xx, xs, st)
        t = np.clip((s - 0.35) * 2.2, 0, 1)
        col = SHADE[None] * (1 - t[:, None]) + WHITE[None] * t[:, None]
        inside = (xs >= left[y]) & (xs <= w - 1 - right[y])
        img[y, :, :3] = col
        img[y, :, 3] = inside * 255
    im = Image.fromarray(img.astype(np.uint8), 'RGBA')
    im = im.filter(ImageFilter.GaussianBlur(0.8))
    return outline(im, 2, (70, 84, 92, 255))


def side_stream(d, x, y0, y1, rnd, dirn):
    pts = []
    for i in range(8):
        t = i / 7
        pts.append((x + dirn * (t ** 1.6) * rnd.randint(14, 30), y0 + (y1 - y0) * t))
    d.line(pts, fill=(70, 84, 92, 255), width=9)
    d.line(pts, fill=(226, 232, 236, 255), width=5)


def foam(w, h, rnd, base_col=(236, 240, 242)):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    tops = noise1(w, 40, rnd) * 0.6 + noise1(w, 12, rnd) * 0.4
    for x in range(0, w, 6):
        top = int(h * (0.15 + 0.55 * (1 - tops[min(x, w - 1)])))
        r = rnd.randint(14, 28)
        d.ellipse([x - r, top, x + r, top + 2 * r], fill=(70, 84, 92, 255))
    for x in range(0, w, 6):
        top = int(h * (0.15 + 0.55 * (1 - tops[min(x, w - 1)])))
        r = rnd.randint(12, 24)
        d.ellipse([x - r + 2, top + 2, x + r - 2, top + 2 * r - 2], fill=base_col + (255,))
        d.rectangle([x - 4, top + r, x + 4, h], fill=base_col + (255,))
    for _ in range(w // 10):  # blue-grey shading in the churn
        x, y = rnd.randint(0, w), rnd.randint(int(h * 0.45), h)
        d.ellipse([x - 9, y - 5, x + 9, y + 5], fill=(170, 184, 194, 255))
    for _ in range(w // 25):  # spray flecks above
        x, y = rnd.randint(0, w), rnd.randint(0, int(h * 0.35))
        d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(70, 84, 92, 255)); d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=base_col + (255,))
    return im


def cloud(w, h, rnd):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for _ in range(14):
        rx, ry = rnd.randint(w // 8, w // 4), rnd.randint(h // 5, h // 3)
        cx, cy = rnd.randint(rx, w - rx), rnd.randint(ry, h - ry)
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(232, 236, 240, 255))
    im = im.filter(ImageFilter.GaussianBlur(3))
    a = np.asarray(im).astype(np.float32)
    a[..., 3] = np.where(a[..., 3] > 100, 255, 0)
    im = Image.fromarray(a.astype(np.uint8))
    return outline(im, 2, (110, 122, 130, 255))


def w4falls():
    W, H = 1536, 1152
    S = Image.new('RGBA', (W, H), MAG)
    rnd = random.Random(4)
    d = ImageDraw.Draw(S)
    # 1. three bodies
    x = 40
    for w in (110, 190, 300):
        im = water(w, 720, rnd)
        S.alpha_composite(im, (x, 40))
        for _ in range(3):  # side streams peeling off both edges
            yy = rnd.randint(80, 600)
            side_stream(d, x + 6, 40 + yy, 40 + yy + rnd.randint(70, 130), rnd, -1)
            yy = rnd.randint(80, 600)
            side_stream(d, x + w - 6, 40 + yy, 40 + yy + rnd.randint(70, 130), rnd, 1)
        x += w + 60
    # 5. the wet stone pillar: the W4 kit wall's trickle column
    wall = opaque(kit(4, 'wall'))
    col = wall.crop((70, 100, 330, 600))
    col = rs(col, 190, 720)
    col = outline(col, 2)
    S.alpha_composite(col, (x, 40))
    x += 250
    # 2. three mossy rock lips with a pour over the front
    bank = opaque(kit(4, 'bank'))
    for i in range(3):
        lip = rs(bank.crop((i * 60, 0, i * 60 + 420, 150)), 360, 120)
        m = Image.new('L', lip.size, 0)
        md = ImageDraw.Draw(m)
        pts = [(0, 20)] + [(lip.width * t / 8, rnd.randint(0, 20)) for t in range(9)] + [(lip.width, 20)]
        md.polygon([(6, 30)] + pts[1:-1] + [(lip.width - 6, 30), (lip.width - 20, lip.height - 4), (20, lip.height - 8)], fill=255)
        lip.putalpha(m); lip = outline(lip, 2)
        lx, ly = x, 40 + i * 250
        pw = rnd.randint(230, 300)
        pour = water(pw, 130, rnd, edge=0.08)
        pa = np.asarray(pour).astype(np.float32)
        for yy in range(130):  # thins as it drops
            cut = int(yy / 130 * pw * 0.22)
            pa[yy, :cut, 3] = 0; pa[yy, pw - cut:, 3] = 0
        pour = outline(Image.fromarray(pa.astype(np.uint8)), 2, (70, 84, 92, 255))
        S.alpha_composite(lip, (lx, ly))
        px = lx + (360 - pw) // 2 + rnd.randint(-30, 30)
        S.alpha_composite(pour, (px, ly + 84))
        # the curl over the front edge
        d.chord([px - 6, ly + 58, px + pw + 6, ly + 112], 180, 360, fill=(70, 84, 92, 255))
        d.chord([px - 2, ly + 62, px + pw + 2, ly + 110], 180, 360, fill=(234, 238, 240, 255))
    # 3. two splash strips (4:1)
    for i in range(2):
        f = foam(620, 155, rnd)
        S.alpha_composite(f, (40 + i * 660, 800))
    # 4. two mist clouds and a spray plume
    S.alpha_composite(cloud(300, 140, rnd), (40, 985))
    S.alpha_composite(cloud(260, 120, rnd), (400, 1000))
    plume = Image.new('RGBA', (180, 300), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plume)
    for j in range(16):
        t = j / 15
        r = 20 + 50 * (1 - t)
        cx = 90 + rnd.randint(-25, 25) * t; cy = 300 - r - t * 210
        pd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(232, 236, 240, 255))
    plume = outline(plume.filter(ImageFilter.GaussianBlur(1)), 2, (110, 122, 130, 255))
    S.alpha_composite(plume, (1340, 830))
    S.convert('RGB').save(OUT / 'start-w4falls.webp', 'WEBP', quality=92)


# ------------------------------------------------------------------------------------------------------------------ W6 ledges
def w6set(short):
    W, H = (1536, 768) if short else (1536, 896)
    S = Image.new('RGBA', (W, H), MAG)
    rnd = random.Random(60 + short)
    shelf = trim(kit(6, 'branch'))           # the root-stump shelf: flat top, roots splaying
    perch = trim(kit(6, 'perch'))
    post = trim(prop('w6c', 'mooring-post'))
    arch = trim(prop('w6d', 'root-arch'))
    mlog = trim(prop('w6d', 'moss-log'))
    mlog = mlog.crop((0, 0, int(mlog.width * 0.72), mlog.height))   # (the log only, not the cut piece beside it)
    trunk = opaque(kit(6, 'trunk'))
    if short:
        cw, ch, cols = 384, 768, 4
        pw = 300
    else:
        cw, ch, cols = 768, 448, 2
        pw = 620
    th = round(pw / (1.3 if short else 3.0))   # the walkable part's footprint (width : height)

    def cell(i):
        return (i % cols) * cw, (i // cols) * ch

    def plank(w, h):
        p = trunk.rotate(90, expand=True)
        p = rs(p.crop((0, 20, p.width, p.height - 20)), max(w, 40), h)
        return outline(p, 2)

    # 1. a mangrove root bent into a shelf, prop roots curling down under it (the kit sheet's own root shelf on prop roots)
    x0, y0 = cell(0)
    top = 60 if not short else 200
    from geminicut import cut_cell
    ks = cut_cell(Image.open(GAME / 'reference/prop-sheets/w6/kit.jpg').convert('RGB').crop((520, 50, 760, 250)), 'magenta', {})
    sh = rs(ks, pw, ch - top - 4)
    S.alpha_composite(sh, (x0 + (cw - pw) // 2, y0 + top))
    # 2. a stilt-house plank deck lashed to two posts that run down out of the picture
    x0, y0 = cell(1)
    top = 70 if not short else 230
    px0 = x0 + (cw - pw) // 2
    pst = rs(post, post.width * (0.55 if short else 0.62), (ch - top) * 1.25)
    for fx in (0.16, 0.8):
        S.alpha_composite(pst, (round(px0 + pw * fx - pst.width * 0.35), y0 + top - 30))
    S.alpha_composite(plank(pw, 36), (px0, y0 + top))
    S.alpha_composite(plank(pw - 30, 30), (px0 + 15, y0 + top + 34))
    # 3. a broken boardwalk section, planks missing, on two leaning posts
    x0, y0 = cell(2)
    top = 80 if not short else 230
    px0 = x0 + (cw - pw) // 2
    pp = rs(post.crop((0, post.height // 3, post.width // 2, post.height)), post.width * 0.3, (ch - top) * 1.1)
    for fx, ang in ((0.22, 7), (0.7, -9)):
        q = pp.rotate(ang, expand=True, resample=Image.BICUBIC)
        S.alpha_composite(q, (round(px0 + pw * fx - q.width / 2), y0 + top + 10))
    S.alpha_composite(plank(pw, 32), (px0, y0 + top + 30))
    n = 7 if not short else 4
    bw = pw / n
    for j in range(n):
        if j in ((2, 5) if not short else (2,)):
            continue
        hb = 26 + rnd.randint(-3, 3)
        b = plank(bw - 6, hb).rotate(rnd.uniform(-2, 2), expand=True, resample=Image.BICUBIC)
        S.alpha_composite(b, (round(px0 + j * bw), y0 + top + 4 + rnd.randint(-2, 2)))
    # 4. a fallen branch wedged between two stilt roots (the kit's broken root arches, their tops leaning in)
    x0, y0 = cell(3)
    top = 70 if not short else 230
    px0 = x0 + (cw - pw) // 2
    lh = ch - top - 30
    for lg, fx in ((kit(6, 'snapL'), 0.1), (kit(6, 'snapR'), 0.9)):
        lg = trim(lg)
        q = rs(lg, pw * (0.42 if not short else 0.5), lh)
        S.alpha_composite(q, (round(px0 + pw * fx - q.width / 2), y0 + ch - q.height - 4))
    lg = rs(mlog, pw * 1.02, max(60, th * 0.5))
    S.alpha_composite(lg, (px0 - 6, y0 + top + 14))
    S.convert('RGB').save(OUT / ('start-w6perches.webp' if short else 'start-w6ledges.webp'), 'WEBP', quality=92)


w7anchors(); w7walls(); w4falls(); w6set(False); w6set(True)
print('ok', sorted(p.name for p in OUT.glob('start-*')))
