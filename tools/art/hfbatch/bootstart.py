"""Start for 1-1's Stage Cleared clue, the soldier's bootprint (2026-11-05; stageClue.ts '1-1': "One deep bootprint in the moss, pointing
north"): pasted up from World 1's own painted art on magenta, for bootgpu.py (fungusgpu.py) to repaint by img2img.
    python3 -I tools/art/hfbatch/bootstart.py <out dir>
  bootprint.png  768x512: a low mound of moss (tiles of the W1 ground strip's moss top, src/assets/ground/w1.webp) seen from slightly
                 above, and pressed into it one heavy military boot print, toe up the picture (north): dark earth from the W1 earth
                 texture, chevron lugs on the forefoot, bars on the heel, a shadowed upper-left inner wall (light from the upper left)
                 and a lit lower-right wall, a pushed-up rim. Foreshortened (the toe end narrower) so it reads as seen from above.
  bootprint-low.png  round 2: the same laid down for the side view (build_low): the face squashed and narrowed to the far side, a band
                 of W1 earth under its front lip, so it sits on the bank instead of standing up like a disc.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
W, H = 768, 512
G = Image.open(ROOT / 'src/assets/ground/w1.webp').convert('RGBA')
EARTH = G.crop((0, 0, 2048, 2000)).convert('RGB')        # the W1 earth texture (roots, stones)
MOSS = G.crop((0, 2058 + 20, 2048, 2058 + 60)).convert('RGB')  # the moss top of the W1 bank strip (below its leaves and flowers)


def moss_tex():
    # a moss bed seen from above: small soft-edged clumps cut from the moss band, scattered at random turns over a moss-green ground
    t = Image.new('RGB', (W, H), (92, 118, 50))
    rng = np.random.default_rng(3)
    blob = Image.new('L', (90, 40), 0)
    ImageDraw.Draw(blob).ellipse((4, 4, 86, 36), fill=255)
    blob = blob.filter(ImageFilter.GaussianBlur(5))
    for _ in range(900):
        x0 = int(rng.integers(0, MOSS.width - 90))
        c = MOSS.crop((x0, 0, x0 + 90, 40 if MOSS.height >= 40 else MOSS.height)).resize((90, 40))
        ang = float(rng.uniform(0, 360))
        cr = c.rotate(ang, expand=True)
        mr = blob.rotate(ang, expand=True)
        t.paste(cr, (int(rng.integers(-40, W)), int(rng.integers(-30, H))), mr)
    return t.filter(ImageFilter.GaussianBlur(1.0))


def sole(cx, top, length, width):
    """The boot sole outline, toe at `top`, foreshortened: the toe half is drawn a little narrower than the heel half."""
    pts = []
    n = 60
    for side in (1, -1):
        rng = range(n + 1) if side == 1 else range(n, -1, -1)
        for i in rng:
            v = i / n                      # 0 toe .. 1 heel
            if v < 0.12:                   # the round toe
                k = np.sqrt(max(0.0, 1 - ((0.12 - v) / 0.12) ** 2))
                hw = 0.80 * k
            elif v < 0.42:                 # the ball, widest
                hw = 0.80 + 0.20 * np.sin((v - 0.12) / 0.30 * np.pi / 2)
            elif v < 0.62:                 # the waist (instep)
                hw = 1.0 - 0.30 * np.sin((v - 0.42) / 0.20 * np.pi / 2)
            elif v < 0.9:                  # the heel
                hw = 0.70 + 0.08 * np.sin((v - 0.62) / 0.28 * np.pi / 2)
            else:                          # the round heel end
                k = np.sqrt(max(0.0, 1 - ((v - 0.9) / 0.1) ** 2))
                hw = 0.78 * k
            persp = 0.86 + 0.14 * v        # the far (toe) end a touch narrower
            x = cx + side * hw * width / 2 * persp
            pts.append((x, top + v * length))
    return pts


def build(L=372, Wd=196, top=70):
    base = Image.new('RGB', (W, H), MAG)
    # the moss mound: an irregular ellipse
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((40, 40, W - 40, H - 40), fill=255)
    rng = np.random.default_rng(11)
    for a in np.linspace(0, 2 * np.pi, 28, endpoint=False):
        r = 1 + rng.uniform(-0.05, 0.05)
        ex, ey = W / 2 + np.cos(a) * (W / 2 - 52) * r, H / 2 + np.sin(a) * (H / 2 - 52) * r
        d.ellipse((ex - 34, ey - 26, ex + 34, ey + 26), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(2))
    mt = moss_tex()
    # light from the upper left over the mound, the lower rim in shade
    yy, xx = np.mgrid[0:H, 0:W]
    shade = 1.08 - 0.30 * ((yy / H) * 0.7 + (xx / W) * 0.3)
    mt = Image.fromarray(np.clip(np.asarray(mt).astype(np.float32) * shade[..., None], 0, 255).astype(np.uint8))
    base.paste(mt, (0, 0), m)
    # a dark earth edge where the moss mound meets the ground (bottom side)
    edge = Image.new('L', (W, H), 0)
    ImageDraw.Draw(edge).ellipse((60, H * 0.55, W - 60, H - 34), fill=150)
    edge = ImageChops.subtract(edge.filter(ImageFilter.GaussianBlur(14)), ImageChops.invert(m))
    edge = ImageChops.subtract(edge, Image.new('L', (W, H), 0))
    ring = ImageChops.subtract(m, m.filter(ImageFilter.MinFilter(25)))
    base.paste(EARTH.crop((300, 300, 300 + W, 300 + H)), (0, 0), ImageChops.multiply(ring, edge.point(lambda v: min(255, v * 2))))

    cx = W / 2 + 6
    pts = sole(cx, top, L, Wd)
    # the pushed-up rim: a lighter moss ridge just outside the print
    rim = Image.new('L', (W, H), 0)
    ImageDraw.Draw(rim).polygon(pts, fill=255)
    rim_out = rim.filter(ImageFilter.MaxFilter(23)).filter(ImageFilter.GaussianBlur(6))
    lit = Image.fromarray(np.clip(np.asarray(mt).astype(np.float32) * 1.22 + 8, 0, 255).astype(np.uint8))
    base.paste(lit, (0, 0), ImageChops.subtract(rim_out, rim))
    # the print: dark earth
    earth = EARTH.crop((900, 700, 900 + W, 700 + H))
    earth = Image.fromarray((np.asarray(earth).astype(np.float32) * 0.62).astype(np.uint8))
    base.paste(earth, (0, 0), rim)
    # the inner walls: shadow on the upper-left inside, light on the lower-right inside
    sh = ImageChops.subtract(rim, ImageChops.offset(rim, 16, 14)).filter(ImageFilter.GaussianBlur(5))
    base.paste((34, 24, 20), (0, 0), sh)
    hl = ImageChops.subtract(rim, ImageChops.offset(rim, -12, -10)).filter(ImageFilter.GaussianBlur(3))
    base.paste((150, 112, 78), (0, 0), hl.point(lambda v: v * 0.8))
    # the tread: chevron lugs on the ball, bars on the heel, a plain instep
    tr = ImageDraw.Draw(base)
    lug_dark, lug_lit = (46, 32, 26), (124, 90, 64)
    for k in range(5):                       # forefoot chevrons, pointing to the toe
        y = top + 38 + k * 34
        hw = Wd * 0.36 * (0.86 + 0.14 * ((y - top) / L))
        for col, o in ((lug_lit, 5), (lug_dark, 0)):
            tr.line([(cx - hw, y + 18 + o), (cx, y + o), (cx + hw, y + 18 + o)], fill=col, width=14, joint='curve')
    for k in range(3):                       # the heel bars
        y = top + L * 0.70 + k * 30
        hw = Wd * 0.30
        tr.line([(cx - hw, y + 5), (cx + hw, y + 5)], fill=lug_lit, width=14)
        tr.line([(cx - hw, y), (cx + hw, y)], fill=lug_dark, width=14)
    # the outer stitch groove of the sole
    inset = rim.filter(ImageFilter.MinFilter(19))
    groove = ImageChops.subtract(inset, inset.filter(ImageFilter.MinFilter(5)))
    base.paste((52, 36, 28), (0, 0), groove)
    # a few torn moss crumbs flung onto the rim
    for _ in range(16):
        a = rng.uniform(0, 2 * np.pi)
        px, py = cx + np.cos(a) * Wd * 0.62, top + L / 2 + np.sin(a) * L * 0.56
        r = rng.uniform(4, 8)
        tr.ellipse((px - r, py - r * 0.7, px + r, py + r * 0.7), fill=(78, 104, 44))
    return base.filter(ImageFilter.GaussianBlur(0.7)), m


def build_low():
    """Round 2: the same moss bed and print laid down in the game's side view: the top face squashed to 0.62 of its height (the print drawn longer and narrower first, so it stays a boot) and narrowed
    at the far (toe) side, so the print lies flat and its toe runs away north; under its front edge a band of the W1 earth (the bed's
    side, with the texture's roots), so it reads as a slab of moss sitting on the bank."""
    top, m = build(L=410, Wd=150, top=52)
    hh = round(H * 0.62)
    # QUAD maps the output box to the source corners (upper left, lower left, lower right, upper right): the far edge drawn narrower
    quad = (-W * 0.10, 0, 0, H, W, H, W * 1.10, 0)
    face = top.transform((W, hh), Image.QUAD, quad, Image.BICUBIC)
    fm = m.transform((W, hh), Image.QUAD, quad, Image.BICUBIC)
    y0 = 60
    base = Image.new('RGB', (W, H), MAG)
    side = Image.new('L', (W, H), 0)
    for dy in range(0, 50, 2):
        side.paste(255, (0, y0 + dy), fm)
    earth = EARTH.crop((200, 1100, 200 + W, 1100 + H))
    yy = np.mgrid[0:H, 0:W][0]
    dark = np.clip(0.95 - (yy - (y0 + hh * 0.6)) / 260.0, 0.45, 0.95)
    earth = Image.fromarray(np.clip(np.asarray(earth).astype(np.float32) * dark[..., None], 0, 255).astype(np.uint8))
    base.paste(earth, (0, 0), side)
    # the outline under the side, as the kit's pieces have
    ol = ImageChops.subtract(side.filter(ImageFilter.MaxFilter(7)), side)
    base.paste((40, 26, 24), (0, 0), ol)
    # the face's own shadow line on the earth just under its front lip
    lip = Image.new('L', (W, H), 0); lip.paste(fm, (0, y0 + 10))
    base.paste((48, 32, 26), (0, 0), ImageChops.subtract(lip, ImageChops.offset(lip, 0, -10)).filter(ImageFilter.GaussianBlur(3)))
    full = Image.new('L', (W, H), 0); full.paste(fm, (0, y0))
    base.paste(face, (0, y0), fm)
    fo = ImageChops.subtract(full.filter(ImageFilter.MaxFilter(5)), full)
    base.paste((40, 26, 24), (0, 0), ImageChops.multiply(fo, ImageChops.invert(side)))
    return base.filter(ImageFilter.GaussianBlur(0.6))


build()[0].save(OUT / 'bootprint.png')
build_low().save(OUT / 'bootprint-low.png')
print('ok', OUT)
