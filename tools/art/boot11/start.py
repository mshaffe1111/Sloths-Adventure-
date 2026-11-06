"""Starts for the remade 1-1 bootprint (boot11, 2026-11-05; the lead: "one deep bootprint in the moss", the SOLDIERS' boot, a big heavy
heel, pressed in, toe east, flush in the end's moss, judged at phone size). The approved option B (hfbatch/bootcut.py east) read as a flat
sole outline laid on the band; this start is drawn in the game's own view instead: World 1's bank moss seen from the side and a little
above, and pressed into it one heavy boot, so the repaint paints depth that already reads at 80 x 22 game px:
  - the moss bed is the W1 ground strip's own moss band (src/assets/ground/w1.webp, rows 2078-2118), stacked low and foreshortened;
  - the print is the sole outline squashed to the band's angle (height = SQUASH x length), toe to the RIGHT (east, onward), the heel
    the widest part (a soldier's boot heel, not a paw or a bare foot);
  - depth: the far inner wall shows (we look in from above and in front), thick at the heel and thin at the toe (the heel pressed
    deepest), lit from the upper left; the floor is dark wet W1 earth with chunky chevron lugs on the forefoot and heavy bars on the heel;
  - the moss is pushed up in a ridge round the rim, highest along the near edge, with a lit top and a shadow line inside it.
    python3 -I tools/art/boot11/start.py <out dir>      -> start-boot-a.png (a long heavy print), start-boot-b.png (shorter, deeper)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1024, 384
G = Image.open(ROOT / 'src/assets/ground/w1.webp').convert('RGB')
MOSS = G.crop((0, 2078, 2048, 2118))
EARTH = G.crop((0, 0, 2048, 1600))


def moss_bed(seed):
    """a moss bed seen low from the side: soft clumps cut from the bank's moss band, scattered in rows that get smaller toward the far
    (top) side, over a moss-green ground (as hfbatch/bootstart.py moss_tex, foreshortened)"""
    rng = np.random.default_rng(seed)
    bed = Image.new('RGB', (W, H), (88, 112, 46))
    blob = Image.new('L', (120, 40), 0)
    ImageDraw.Draw(blob).ellipse((4, 4, 116, 36), fill=255)
    blob = blob.filter(ImageFilter.GaussianBlur(6))
    for _ in range(1400):
        y = float(rng.uniform(-20, H))
        s = 0.45 + 0.75 * max(0.0, y) / H
        x0 = int(rng.integers(0, MOSS.width - 120))
        c = MOSS.crop((x0, 6, x0 + 120, 30)).resize((round(120 * s), max(6, round(34 * s))))
        mk = blob.resize(c.size)
        bed.paste(c, (int(rng.uniform(-60, W)), int(y)), mk)
    return bed.filter(ImageFilter.GaussianBlur(0.8))


def sole(cx, cy, L, squash, heel=1.0):
    """the outline, toe at the right, as points: a broad square-ish heel block (a soldier's boot heel, `heel` its width), a short
    instep only a little narrower, a wide forefoot, a round toe (never a paw's lobes or a bare foot's toes)"""
    pts = []
    n = 90
    for side in (-1, 1):
        rng = range(n + 1) if side == -1 else range(n, -1, -1)
        for i in rng:
            v = i / n  # 0 heel (left) .. 1 toe (right)
            if v < 0.05:
                hw = 0.9 * heel * (0.55 + 0.45 * np.sqrt(max(0.0, 1 - ((0.05 - v) / 0.05) ** 2)))
            elif v < 0.3:
                hw = 0.9 * heel
            elif v < 0.42:
                hw = 0.9 * heel - (0.9 * heel - 0.78) * np.sin((v - 0.3) / 0.12 * np.pi / 2)
            elif v < 0.55:
                hw = 0.78 + 0.22 * np.sin((v - 0.42) / 0.13 * np.pi / 2)
            elif v < 0.85:
                hw = 1.0
            else:
                hw = np.sqrt(max(0.0, 1 - ((v - 0.85) / 0.15) ** 2))
            x = cx - L / 2 + v * L
            y = cy + side * hw * L * 0.2 * squash
            pts.append((x, y))
    return pts


def build(name, L, squash, heel, seed):
    bed = moss_bed(seed)
    cx, cy = W / 2, H * 0.56
    outline = sole(cx, cy, L, squash, heel)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(outline, fill=255)
    m = np.asarray(mask).astype(np.float32) / 255
    # the floor: dark wet earth, darker toward the heel (pressed deepest)
    earth = np.asarray(EARTH.crop((300, 200, 300 + W, 200 + H))).astype(np.float32) * 0.42
    xx = np.linspace(0, 1, W)[None, :, None]
    earth *= 0.78 + 0.32 * np.clip((xx - 0.3) / 0.6, 0, 1)
    out = np.asarray(bed).astype(np.float32)
    # the moss ridge pushed up round the rim (a dilated band), lit on top, highest along the near (lower) edge
    ridge = np.asarray(mask.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
    ridge = np.clip(ridge - m, 0, 1)
    ys = np.linspace(0, 1, H)[:, None]
    # (lit a little, and greener, not paler: a raised moss lip, not a glow)
    lit = np.clip(1.0 + 0.22 * ridge * (1.2 - ys * 0.6), 0, 1.3)
    out = out * lit[..., None]
    out[..., 1] += 10 * ridge
    # a darker line just inside the ridge's top (the lip's shadow) and the far inner wall: a brown earth face along the TOP of the
    # outline, thick at the heel (left) and thin at the toe
    wall = np.zeros((H, W), np.float32)
    top = np.full(W, H, np.float32)
    for x, y in outline:
        xi = int(round(x))
        if 0 <= xi < W:
            top[xi] = min(top[xi], y)
    for xi in range(W):
        if top[xi] >= H:
            continue
        t = (xi - (cx - L / 2)) / L
        thick = (L * 0.2 * squash * 0.9) * (1.2 - 0.75 * np.clip(t, 0, 1))
        y0 = int(top[xi])
        wall[y0:int(y0 + thick), xi] = 1
    # (smoothed along the print: the column-by-column fill left stripes)
    wall = np.asarray(Image.fromarray((wall * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
    wall = np.clip(wall * 1.6, 0, 1) * m
    floor = m * (1 - wall)
    face = np.asarray(EARTH.crop((900, 600, 900 + W, 600 + H))).astype(np.float32) * 0.95 + np.array([26, 14, 2], np.float32)
    out = out * (1 - m[..., None]) + earth * floor[..., None] + face * wall[..., None]
    # tread on the floor: chunky chevrons on the forefoot (right), heavy bars on the heel (left), each a dark groove with a lit edge
    im = Image.fromarray(out.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    fl = Image.fromarray((floor * 255).astype(np.uint8))
    tread = Image.new('L', (W, H), 0)
    td = ImageDraw.Draw(tread)
    h = L * 0.19 * squash
    for k in range(5):
        x = cx + L * (0.12 + k * 0.075)
        td.line([(x - h * 0.55, cy - h * 0.7), (x + h * 0.35, cy), (x - h * 0.55, cy + h * 0.7)], fill=255, width=max(4, int(L * 0.018)))
    for k in range(3):
        x = cx - L * (0.42 - k * 0.07)
        td.line([(x, cy - h * 0.7), (x, cy + h * 0.7)], fill=255, width=max(5, int(L * 0.026)))
    tread = Image.fromarray((np.asarray(tread).astype(np.float32) * np.asarray(fl).astype(np.float32) / 255).astype(np.uint8))
    groove = Image.new('RGB', (W, H), (22, 14, 10))
    im.paste(groove, (0, 0), tread)
    lite = tread.transform(tread.size, Image.AFFINE, (1, 0, 2, 0, 1, 2)).filter(ImageFilter.GaussianBlur(0.8))
    im.paste(Image.new('RGB', (W, H), (98, 70, 48)), (0, 0), Image.fromarray((np.asarray(lite) * 0.5).astype(np.uint8)))
    # a thin dark ink line round the outline, as World 1's art has
    d.line(outline + [outline[0]], fill=(30, 24, 16), width=3)
    im = im.filter(ImageFilter.GaussianBlur(0.7))
    p = OUT / f'start-{name}.png'
    im.save(p)
    print(p, im.size)


def build_relief(name, L, squash, heel, seed, depth=26.0):
    """round 2 (the lead's bar: a DEEP pressed print, shadowed rim, moss pushed up, heel deeper than the toe): round 1's flat starts came
    back as flat dark stickers at s50-s62, so here the depth is modelled: a height map (moss at 0, a torn moss ridge round the rim, the
    print sunk in with walls, the heel deepest, the lugs standing up off its floor), lit from the upper left and a little toward us, the
    floor darkened by depth (it is shadowed in there). The repaint then only has to paint it."""
    rng = np.random.default_rng(seed)
    bed = np.asarray(moss_bed(seed)).astype(np.float32)
    cx, cy = W / 2, H * 0.56
    outline = sole(cx, cy, L, squash, heel)
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(outline, fill=255)
    m = np.asarray(mask) > 127
    from scipy import ndimage
    din = ndimage.distance_transform_edt(m)
    dout = ndimage.distance_transform_edt(~m)
    xx = (np.arange(W)[None, :] - (cx - L / 2)) / L  # 0 heel .. 1 toe
    D = depth * (1.45 - 0.6 * np.clip(xx, 0, 1))      # the heel pressed deepest
    wallw = L * 0.035
    t = np.clip(din / wallw, 0, 1)
    h = np.where(m, -D * (t * t * (3 - 2 * t)), 0.0)
    # the torn moss ridge: pushed up round the rim, ragged, highest along the near (lower) edge and the heel
    noise = ndimage.gaussian_filter(rng.uniform(0, 1, (H, W)), 6)
    noise = (noise - noise.min()) / (noise.max() - noise.min() + 1e-6)
    rw = L * 0.045
    ys = np.linspace(0, 1, H)[:, None]
    ridge = depth * 1.0 * np.exp(-(dout / rw) ** 2) * (0.6 + 0.8 * noise) * (0.8 + 0.5 * ys)
    h = h + np.where(m, 0.0, ridge)
    # the lugs: chunky chevrons on the forefoot, heavy bars across the heel, standing up off the floor
    lug = Image.new('L', (W, H), 0)
    ld = ImageDraw.Draw(lug)
    hh = L * 0.2 * squash
    for k in range(5):
        x = cx + L * (0.1 + k * 0.075)
        ld.line([(x - hh * 0.5, cy - hh * 0.72), (x + hh * 0.32, cy), (x - hh * 0.5, cy + hh * 0.72)], fill=255, width=int(L * 0.028))
    for k in range(3):
        x = cx - L * (0.4 - k * 0.085)
        ld.line([(x, cy - hh * 0.75), (x, cy + hh * 0.75)], fill=255, width=int(L * 0.04))
    lugm = ndimage.gaussian_filter(np.asarray(lug).astype(np.float32) / 255, 2.0) * (t > 0.9)
    h = h + lugm * D * 0.45
    h = ndimage.gaussian_filter(h, 1.2)
    # light: from the upper left and toward us; the picture is seen low, so slopes facing down the picture face us
    gy, gx = np.gradient(h)
    n = np.dstack([-gx, -gy * 1.3, np.ones_like(h) * 1.6])
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    Lv = np.array([-0.55, -0.62, 0.56]); Lv /= np.linalg.norm(Lv)
    shade = np.clip(0.42 + 0.95 * (n @ Lv), 0.15, 1.35)
    # colour: the moss bed outside (the ridge's inner face torn to show earth), wet dark earth inside, darker the deeper
    earth = np.asarray(EARTH.crop((300, 200, 300 + W, 200 + H))).astype(np.float32) * 0.62
    torn = np.clip(1 - dout / (rw * 0.55), 0, 1) * (noise > 0.45) * (~m)
    alb = bed * (1 - torn[..., None]) + earth * 1.1 * torn[..., None]
    dn = np.clip(-h / (depth * 1.45), 0, 1)
    inside = earth * (1 - 0.55 * dn)[..., None]
    alb = np.where(m[..., None], inside, alb)
    rgb = alb * shade[..., None]
    im = Image.fromarray(rgb.clip(0, 255).astype(np.uint8))
    # World 1's thin dark ink line, round the lip only
    ImageDraw.Draw(im).line(outline + [outline[0]], fill=(28, 22, 14), width=2)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    p = OUT / f'start-{name}.png'
    im.save(p)
    print(p, im.size)


# (the game draws it about 80 x 22 px: 3.6 to 1, so squash 0.7; b a shorter, deeper print with a heavier heel)
if '--relief' not in sys.argv:
    build('boot-a', L=720, squash=0.7, heel=1.08, seed=3)
    build('boot-b', L=600, squash=0.85, heel=1.18, seed=7)
# round 2: the depth modelled (c the long heavy print, d shorter, deeper, a heavier heel)
build_relief('boot-c', L=700, squash=0.72, heel=1.1, seed=3, depth=30)
build_relief('boot-d', L=600, squash=0.85, heel=1.2, seed=7, depth=36)
