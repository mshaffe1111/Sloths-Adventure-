"""Starts for the painted ground (hf-art-ground, 2026-10-29; polish report VI-8): img2img starts built from each world's own kit pieces
(src/assets/kits/w<N>.webp fill/bank/bankEnd/mossStrip; World 1: proto/props-atlas.webp bank/bankEnd/mossStrip), so the repaint keeps
each world's look. Written to tools/art/hfground/starts/ (force-added; the GPU job reads them from GitHub raw at a pinned commit).

  fill-w<N>.webp  1024x1024: the world's fill (World 1: the soil under its bank top) with its lit bevel and dark bands cut away, laid
                  as a loose collage of flipped patches, its light flattened (no band, no lit edge), made brick-periodic (seam.brick)
  lip-w<N>.webp   1536x240 on magenta: the world's moss strip along the top, sketched roots hanging under it
  end-w<N>.webp   512x768 on magenta: a bank's right end, the soil face undercut and sloping in as it goes down, the moss lip rounding
                  over the corner, no stone slab
    python3 tools/art/hfground/starts.py
"""
import json, math, random, re, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import seam  # noqa: E402

ROOT = HERE.parents[2]
OUT = HERE / 'starts'
OUT.mkdir(exist_ok=True)
MAG = (255, 0, 255)

kit = json.loads(re.search(r'= (\{.*\});?\s*$', (ROOT / 'src/game/kitAtlasData.ts').read_text(), re.S).group(1))
p1 = (ROOT / 'src/game/protoAtlasData.ts').read_text()
w1 = {}
for n in ('bank', 'bankEnd', 'mossStrip'):
    m = re.search(n + r': \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', p1)
    w1[n] = dict(zip('xywh', map(int, m.groups())))
kit['1'] = w1


def piece(w, n):
    src = ROOT / ('src/assets/proto/props-atlas.webp' if w == 1 else f'src/assets/kits/w{w}.webp')
    f = kit[str(w)][n]
    return Image.open(src).convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


# the part of each fill that is plain soil: rows (and for World 1 columns) from its picture, measured on the row brightness profile
FILL_CROP = {1: ('bank', (16, 150, 548, 335)), 2: ('fill', (0, 30, 390, 250)), 3: ('fill', (0, 10, 393, 250)),
             4: ('fill', (0, 0, 366, 294)), 5: ('fill', (0, 8, 227, 152)), 6: ('fill', (0, 40, 397, 150)),
             7: ('fill', (0, 34, 306, 205)), 8: ('fill', (0, 0, 222, 295)),
             9: ('fill', None), 10: ('fill', None)}
# how big the patches go in (source px per start px), so the features keep about their size in the game
FILL_SCALE = {1: 1.6, 2: 1.5, 3: 1.5, 4: 1.4, 5: 2.2, 6: 1.6, 7: 1.7, 8: 1.5, 9: 1.5, 10: 1.6}


def flatten(img, sigma=110, keep=0.25):
    """take out the large-scale light (bands, lit edges, vignettes), keeping a little of it"""
    a = np.asarray(img.convert('RGB'), np.float32)
    lum = a.mean(2)
    blur = np.asarray(Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma)), np.float32)
    k = (lum.mean() / np.maximum(blur, 8)) ** (1 - keep)
    return Image.fromarray(np.clip(a * k[..., None], 0, 255).astype(np.uint8))


def fill_start(w, size=1024, seed=1):
    n, box = FILL_CROP[w]
    src = (piece(w, n).crop(box) if box else piece(w, n)).convert('RGB')
    sc = FILL_SCALE[w]
    src = src.resize((round(src.width * sc), round(src.height * sc)), Image.LANCZOS)
    rnd = random.Random(seed * 100 + w)
    can = Image.new('RGB', (size, size))
    acc = np.zeros((size, size, 3), np.float32)
    wsum = np.zeros((size, size), np.float32)
    pw, ph = min(src.width, 420), min(src.height, 300)
    # soft-edged patches laid on a jittered grid, flipped at random, so no one painted piece shows twice side by side
    ys = list(range(-ph // 2, size, ph // 2))
    xs = list(range(-pw // 2, size, pw // 2))
    win = np.outer(np.hanning(ph + 2)[1:-1], np.hanning(pw + 2)[1:-1]).astype(np.float32) + 1e-3
    for y in ys:
        for x in xs:
            sx, sy = rnd.randrange(0, src.width - pw + 1), rnd.randrange(0, src.height - ph + 1)
            p = src.crop((sx, sy, sx + pw, sy + ph))
            if rnd.random() < 0.5:
                p = p.transpose(Image.FLIP_LEFT_RIGHT)
            a = np.asarray(p, np.float32)
            x0, y0 = x + rnd.randrange(-30, 31), y + rnd.randrange(-30, 31)
            ax0, ay0 = max(0, x0), max(0, y0)
            ax1, ay1 = min(size, x0 + pw), min(size, y0 + ph)
            if ax1 <= ax0 or ay1 <= ay0:
                continue
            sl = (slice(ay0 - y0, ay1 - y0), slice(ax0 - x0, ax1 - x0))
            acc[ay0:ay1, ax0:ax1] += a[sl] * win[sl][..., None]
            wsum[ay0:ay1, ax0:ax1] += win[sl]
    can = Image.fromarray(np.clip(acc / np.maximum(wsum, 1e-3)[..., None], 0, 255).astype(np.uint8))
    return seam.brick(flatten(can))


def on_mag(img):
    bg = Image.new('RGBA', img.size, MAG + (255,))
    bg.alpha_composite(img)
    return bg.convert('RGB')


def alpha_rows(a, thr=40):
    return np.where(a[..., 3].max(1) > thr)[0]


def lip_start(w, W=1536, H=240, seed=3):
    m = piece(w, 'mossStrip')
    a = np.asarray(m)
    rows = alpha_rows(a)
    m = m.crop((0, rows[0], m.width, rows[-1] + 1))
    # the moss strip's top part (grass and moss): about 62% of its height, laid 110 px tall, repeated with a flip to fill the width
    top = m.crop((0, 0, m.width, max(20, round(m.height * 0.62))))
    th = 112
    tw = round(top.width * th / top.height)
    top = top.resize((tw, th), Image.LANCZOS)
    can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    x, k = -40, 0
    while x < W:
        can.alpha_composite(top if k % 2 == 0 else top.transpose(Image.FLIP_LEFT_RIGHT), (x, 8))
        x += tw - 60
        k += 1
    # roots hanging from the underside (a sketch; the repaint makes them roots)
    rnd = random.Random(seed + w)
    d = ImageDraw.Draw(can)
    col = {1: (92, 64, 40), 2: (120, 82, 46), 3: (60, 80, 70), 4: (60, 78, 84), 5: (100, 74, 52), 6: (96, 66, 42), 7: (104, 74, 46),
           8: (50, 62, 86), 9: (52, 54, 58), 10: (70, 52, 44)}[w]
    for i in range(34):
        x0 = rnd.uniform(10, W - 10)
        y = 8 + th - 26
        L = rnd.uniform(30, 105)
        pts = [(x0, y)]
        for s in range(6):
            pts.append((pts[-1][0] + rnd.uniform(-7, 7), y + L * (s + 1) / 6))
        d.line(pts, fill=col + (255,), width=rnd.choice([3, 4, 5, 6]))
    can = seam.wrap_x(can)
    return on_mag(can)


def end_start(w, W=512, H=768, seed=5):
    soil = fill_start(w, 1024, seed=seed + 7).crop((0, 0, W, H))
    rnd = random.Random(seed * 7 + w)
    # the soil face: undercut, sloping in as it goes down, a wobble so it is not a ruled line, the top corner rounded
    mask = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(mask)
    pts = [(0, 70)]
    R = 70
    top_x = 430
    for i in range(0, 13):
        ang = math.pi / 2 * i / 12
        pts.append((top_x - R + R * math.sin(ang), 70 + R - R * math.cos(ang)))
    ph = rnd.uniform(0, 6)
    for y in range(70 + R, H + 1, 16):
        u = (y - 70) / (H - 70)
        x = top_x - 120 * u ** 0.85 + 14 * math.sin(y / 37 + ph) + 8 * math.sin(y / 13 + 2 * ph)
        pts.append((x, y))
    pts += [(0, H)]
    d.polygon(pts, fill=255)
    a = np.asarray(soil, np.float32)
    # a little shade toward the face, as the kit's end pieces have
    dist = np.asarray(mask.filter(ImageFilter.GaussianBlur(26)), np.float32) / 255
    a *= (0.62 + 0.38 * dist)[..., None]
    soil = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
    soil.putalpha(mask)
    can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    can.alpha_composite(soil)
    # the moss lip along the top, its end hanging over the rounded corner
    m = piece(w, 'mossStrip')
    rows = alpha_rows(np.asarray(m))
    m = m.crop((0, rows[0], m.width, rows[-1] + 1))
    top = m.crop((m.width // 2, 0, m.width, max(20, round(m.height * 0.62))))
    th = 100
    tw = round(top.width * th / top.height)
    top = top.resize((tw, th), Image.LANCZOS)
    can.alpha_composite(top, (top_x + 10 - tw, 22))
    corner = top.crop((tw - 120, 0, tw, th)).rotate(-38, expand=True, resample=Image.BICUBIC)
    can.alpha_composite(corner, (top_x - 70, 40))
    dr = ImageDraw.Draw(can)
    col = {1: (92, 64, 40), 2: (120, 82, 46), 3: (60, 80, 70), 4: (60, 78, 84), 5: (100, 74, 52), 6: (96, 66, 42), 7: (104, 74, 46),
           8: (50, 62, 86), 9: (52, 54, 58), 10: (70, 52, 44)}[w]
    for i in range(7):
        y0 = rnd.uniform(130, 520)
        u = (y0 - 70) / (H - 70)
        x0 = top_x - 120 * u ** 0.85 - 6
        pts = [(x0, y0)]
        for s in range(5):
            pts.append((pts[-1][0] + rnd.uniform(4, 14), pts[-1][1] + rnd.uniform(14, 30)))
        dr.line(pts, fill=col + (255,), width=rnd.choice([4, 5, 7]))
    return on_mag(can)


if __name__ == '__main__':
    worlds = [int(x) for x in sys.argv[1:]] or list(range(1, 11))
    for w in worlds:
        fill_start(w).save(OUT / f'fill-w{w}.webp', quality=90)
        lip_start(w).save(OUT / f'lip-w{w}.webp', quality=92)
        end_start(w).save(OUT / f'end-w{w}.webp', quality=92)
        print('world', w)
