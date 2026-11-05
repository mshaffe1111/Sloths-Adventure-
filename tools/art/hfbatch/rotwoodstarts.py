"""Starts for World 1's rotten wood, a ground breakable (2026-11-05, the lead's go: 1-5's low roads and any W1 ground route): pasted up
from the W1 kit's own painted log (src/assets/proto/props-atlas.webp, PROTO_FRAMES.branch: the long mossy limb), on magenta, for
fungusgpu.py to repaint by img2img (make_rotwood_spec.py).
    python3 -I tools/art/hfbatch/rotwoodstarts.py <out dir>
  rot-whole.png  a short rotten log lying on the floor: the kit limb cut to about 3:1, sagging a little in the middle, pale punk wood
                 showing through torn bark in patches, dark cracks along the grain, moss flecks: it should read "this will break" whole
  rot-creak.png  the same, with a wide pale split across the middle and splinters sticking up: the creaking state (W1's crumble draw,
                 protoArt.ts drawBranchArt, has whole / creak / snapped; the snapped halves are cut from the creak take by rotwoodcut.py)
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
W, H = 1024, 512
A = Image.open(ROOT / 'src/assets/proto/props-atlas.webp').convert('RGBA')
LIMB = A.crop((381, 1583, 381 + 598, 1583 + 180))   # PROTO_FRAMES.branch
# (the kit limb's bromeliad off: its slice is replaced by the bark beside it, mirrored)
_patch = LIMB.crop((250, 0, 330, 180)).transpose(Image.FLIP_LEFT_RIGHT)
LIMB.paste(_patch, (330, 0)); LIMB.paste(LIMB.crop((250, 0, 330, 180)), (410, 0))


def sag(im, depth):
    """bend a piece down in the middle by `depth` px (a column shift that follows a sine)"""
    a = np.asarray(im)
    out = np.zeros((a.shape[0] + depth, a.shape[1], 4), np.uint8)
    for x in range(a.shape[1]):
        dy = int(round(depth * np.sin(np.pi * x / (a.shape[1] - 1))))
        out[dy:dy + a.shape[0], x] = a[:, x]
    return Image.fromarray(out, 'RGBA')


def base():
    # (about 3:1: the kit limb is 3.3:1; trimmed and made a touch thicker, a log not a twig)
    log = LIMB.resize((820, 300), Image.LANCZOS)
    log = sag(log, 26)
    canvas = Image.new('RGBA', (W, H), MAG + (255,))
    ox, oy = (W - log.width) // 2, 120
    canvas.alpha_composite(log, (ox, oy))
    rng = np.random.default_rng(7)
    d = ImageDraw.Draw(canvas)
    # pale punk wood showing through the bark in torn patches along the side
    for _ in range(9):
        cx = ox + rng.uniform(80, log.width - 80)
        cy = oy + 150 + rng.uniform(-30, 70) + 26 * np.sin(np.pi * (cx - ox) / log.width)
        rx, ry = rng.uniform(26, 60), rng.uniform(12, 24)
        pts = [(cx + rx * np.cos(t) * rng.uniform(0.7, 1.1), cy + ry * np.sin(t) * rng.uniform(0.7, 1.1)) for t in np.linspace(0, 2 * np.pi, 11)]
        d.polygon(pts, fill=(214, 186, 140), outline=(60, 40, 30))
        for _k in range(3):
            fx = cx + rng.uniform(-rx * 0.6, rx * 0.6)
            d.line([(fx, cy - ry * 0.6), (fx + rng.uniform(-6, 6), cy + ry * 0.6)], fill=(170, 140, 100), width=2)
    # dark cracks along the grain
    for _ in range(7):
        x0 = ox + rng.uniform(40, log.width - 200)
        y0 = oy + rng.uniform(110, 230) + 26 * np.sin(np.pi * (x0 - ox) / log.width)
        pts = [(x0, y0)]
        for _k in range(6):
            pts.append((pts[-1][0] + rng.uniform(16, 30), pts[-1][1] + rng.uniform(-5, 5)))
        d.line(pts, fill=(40, 26, 20), width=4)
    # moss flecks on the top
    for _ in range(22):
        fx = ox + rng.uniform(30, log.width - 30)
        fy = oy + 92 + 26 * np.sin(np.pi * (fx - ox) / log.width) + rng.uniform(-10, 14)
        r = rng.uniform(5, 11)
        d.ellipse((fx - r, fy - r * 0.7, fx + r, fy + r * 0.7), fill=(112, 140, 70))
    return canvas, (ox, oy, log.width, log.height)


def creak(canvas, box):
    ox, oy, lw, lh = box
    c = canvas.copy()
    d = ImageDraw.Draw(c)
    mx = ox + lw * 0.52
    top = oy + 50 + 26
    # a wide pale split across the middle, jagged, with splinters sticking up
    xs = [mx + dx for dx in (-14, 10, -8, 14, -10, 8, -6)]
    ys = np.linspace(top, oy + lh - 10, len(xs))
    left = [(x - 16, y) for x, y in zip(xs, ys)]
    right = [(x + 16, y) for x, y in zip(xs, ys)][::-1]
    d.polygon(left + right, fill=(222, 196, 150), outline=(40, 26, 20))
    d.line(list(zip(xs, ys)), fill=(50, 32, 24), width=6)
    for k, (sx, ang) in enumerate([(-22, -0.5), (-6, -0.2), (12, 0.3), (26, 0.6)]):
        x0, y0 = mx + sx, top + 6
        x1, y1 = x0 + 46 * np.sin(ang), y0 - 46 * np.cos(ang)
        d.polygon([(x0 - 5, y0), (x1, y1), (x0 + 5, y0)], fill=(230, 204, 160), outline=(50, 32, 24))
    return c


cv, box = base()
cv.convert('RGB').filter(ImageFilter.GaussianBlur(0.6)).save(OUT / 'rot-whole.png')
creak(cv, box).convert('RGB').filter(ImageFilter.GaussianBlur(0.6)).save(OUT / 'rot-creak.png')
print('ok', OUT, box)
