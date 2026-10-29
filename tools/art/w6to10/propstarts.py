"""Side-on start sheets for the prop run (2026-10-29): each sheet is a 3 x 2 grid of props pasted up from the world's own kit pieces
(src/assets/kits/wN.webp), Matt's Gemini sprites and plain painted shapes, flat side-on, on one flat key colour. The style model
then repaints a whole sheet at once by img2img (tools/art/w6to10/img2imggpu.py), so the six props come out in one paint and keep the
start's flat side view; geminicut.py-style keying cuts them out again.

    python3 -I tools/art/w6to10/propstarts.py <game checkout> <gemini cut dir> <kit frames json> <out dir>
"""
import json, math, random, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

GAME, GEM, KF, OUT = Path(sys.argv[1]), Path(sys.argv[2]), json.loads(Path(sys.argv[3]).read_text()), Path(sys.argv[4])
OUT.mkdir(parents=True, exist_ok=True)
CW, CH = 512, 512
INK = (34, 28, 30, 255)
KITS = {}


def kit(w, name, box=None):
    if w not in KITS:
        KITS[w] = Image.open(GAME / f'src/assets/kits/w{w}.webp').convert('RGBA')
    f = KF[str(w)][name]
    p = KITS[w].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return p.crop(box) if box else p


def gem(sheet, name):
    j = json.loads((GEM / f'{sheet}.json').read_text())
    f = j['frames'][name]
    im = Image.open(GEM / j['sheet']).convert('RGBA')
    return im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def trim(im):
    bb = im.getchannel('A').getbbox()
    return im.crop(bb) if bb else im


def fit(im, w=None, h=None):
    im = trim(im)
    k = min((w or 1e9) / im.width, (h or 1e9) / im.height)
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


def texture(src, size):
    """a texture the size asked, tiled from a piece's opaque middle"""
    src = trim(src)
    a = np.asarray(src.getchannel('A'))
    ys, xs = np.nonzero(a > 250)
    x0, x1, y0, y1 = np.percentile(xs, 20), np.percentile(xs, 80), np.percentile(ys, 20), np.percentile(ys, 80)
    t = src.crop((int(x0), int(y0), max(int(x0) + 8, int(x1)), max(int(y0) + 8, int(y1)))).convert('RGBA')
    out = Image.new('RGBA', size)
    for yy in range(0, size[1], t.height):
        for xx in range(0, size[0], t.width):
            out.paste(t, (xx, yy))
    return out


class _Mask:
    """ImageDraw for a mask: every shape filled white unless told otherwise"""
    def __init__(self, m):
        self.d = ImageDraw.Draw(m)

    def __getattr__(self, n):
        f = getattr(self.d, n)
        return lambda *a, **k: f(*a, **({'fill': 255} | k)) if n in ('polygon', 'ellipse', 'rectangle', 'chord', 'rounded_rectangle', 'pieslice') else f(*a, **k)


def shape(size, draw_fn, fill):
    m = Image.new('L', size, 0)
    draw_fn(_Mask(m))
    if isinstance(fill, Image.Image):
        layer = texture(fill, size)
    else:
        layer = Image.new('RGBA', size, fill)
    layer.putalpha(ImageChops.multiply(m, layer.getchannel('A')))
    return layer


def outline(im, px=3, col=INK):
    a = im.getchannel('A')
    grown = a.filter(ImageFilter.MaxFilter(px * 2 + 1))
    base = Image.new('RGBA', im.size, col)
    base.putalpha(grown)
    pad = Image.new('RGBA', (im.width, im.height))
    pad.alpha_composite(base)
    pad.alpha_composite(im)
    return pad


def canvas(w=CW, h=CH):
    return Image.new('RGBA', (w, h))


def tint(im, rgb, k=0.6):
    a = np.asarray(im).astype(np.float32)
    g = a[..., :3].mean(axis=2, keepdims=True) / 255
    col = np.array(rgb, np.float32) * (0.35 + g * 1.1)
    a[..., :3] = a[..., :3] * (1 - k) + col * k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def glow(size, c, r, rgb, a=160):
    """a lit patch: solid light paint with a short soft edge (a haze would bleed into the key colour and spoil the cut)"""
    g = Image.new('RGBA', size)
    d = ImageDraw.Draw(g)
    r = r * 0.55
    d.ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=rgb + (min(255, a + 60),))
    return g.filter(ImageFilter.GaussianBlur(2))


def ground_strip(w, piece, h=40):
    s = texture(piece, (w, h))
    m = Image.new('L', (w, h), 255)
    for x in range(w):
        e = min(x, w - 1 - x)
        if e < 24:
            for y in range(h):
                m.putpixel((x, y), int(255 * e / 24))
    s.putalpha(ImageChops.multiply(m, s.getchannel('A')))
    return s


R = random.Random(7)

# ───────────────────────── the props, each a function giving a 512 x 512 cell ─────────────────────────


def cattails():
    c = canvas()
    d = ImageDraw.Draw(c)
    for i in range(9):
        x = 150 + i * 26 + R.randint(-8, 8); top = R.randint(70, 170)
        d.line((x, 470, x + R.randint(-14, 14), top), fill=(88, 102, 58, 255), width=7)
        if i % 2 == 0:
            d.rounded_rectangle((x - 13, top + 10, x + 13, top + 92), 13, fill=(104, 70, 42, 255))
    for i in range(10):
        x = 130 + i * 28; tip = (x + R.randint(-40, 40), R.randint(120, 260))
        d.polygon([(x - 6, 470), (x + 6, 470), tip], fill=(110, 128, 72, 255))
    d.ellipse((110, 448, 410, 492), fill=(60, 52, 40, 255))
    return outline(c)


def moss_curtain():
    c = canvas()
    braid = trim(kit(6, 'liana'))
    for i, x in enumerate(range(60, 452, 56)):
        L = R.randint(300, 470)
        s = fit(braid.crop((0, 0, braid.width, int(braid.height * L / 470))), w=70)
        c.alpha_composite(s, (x - s.width // 2, 6))
    d = ImageDraw.Draw(c)
    d.rectangle((30, 0, 482, 16), fill=(92, 84, 70, 255))
    return outline(c)


def lantern_flower():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((256, 480, 250, 190), fill=(78, 98, 60, 255), width=12)
    for s in (-1, 1):
        d.polygon([(254, 430), (254 + s * 120, 330), (254 + s * 30, 400)], fill=(90, 116, 66, 255))
    c.alpha_composite(glow(c.size, (250, 150), 110, (214, 255, 150)))
    d.ellipse((205, 90, 295, 210), fill=(220, 236, 140, 255))
    d.polygon([(205, 170), (250, 230), (295, 170)], fill=(120, 140, 70, 255))
    return outline(c)


def canoe():
    c = canvas()
    wood = kit(6, 'branch')
    hull = shape(c.size, lambda d: d.polygon([(70, 400), (440, 250), (470, 238), (455, 300), (150, 470), (95, 460)]), wood)
    c.alpha_composite(tint(hull, (120, 92, 60), 0.5))
    d = ImageDraw.Draw(c)
    d.line((90, 405, 450, 258), fill=(70, 50, 36, 255), width=6)
    d.ellipse((20, 400, 330, 500), fill=(62, 54, 44, 255))
    return outline(c)


def mooring_post():
    c = canvas()
    post = shape(c.size, lambda d: d.polygon([(210, 490), (300, 490), (296, 140), (282, 120), (268, 150), (248, 108), (232, 150), (214, 132)]), kit(6, 'trunk'))
    c.alpha_composite(tint(post, (118, 104, 84), 0.4))
    d = ImageDraw.Draw(c)
    for y in (250, 268):
        d.ellipse((196, y - 14, 314, y + 14), outline=(170, 146, 98, 255), width=9)
    d.line((300, 270, 360, 330, 352, 380), fill=(170, 146, 98, 255), width=8, joint='curve')
    d.ellipse((170, 470, 340, 505), fill=(60, 52, 40, 255))
    return outline(c)


def mushrooms_root():
    c = canvas()
    root = shape(c.size, lambda d: d.chord((40, 280, 480, 640), 190, 350, fill=255), kit(6, 'bankEnd'))
    c.alpha_composite(tint(root, (92, 72, 54), 0.4))
    d = ImageDraw.Draw(c)
    for x, y, r in ((150, 330, 30), (205, 308, 40), (265, 300, 26), (320, 312, 34), (372, 336, 22)):
        c.alpha_composite(glow(c.size, (x, y - r), r * 2, (190, 255, 210), 120))
        d.rectangle((x - 6, y - r // 2, x + 6, y + 18), fill=(230, 226, 200, 255))
        d.chord((x - r, y - r * 1.4, x + r, y + r * 0.4), 180, 360, fill=(220, 240, 220, 255))
    return outline(c)


def slab(w, h, world=7, piece='branch'):
    s = trim(kit(world, piece))
    k = h / s.height
    s = s.resize((round(s.width * k), h), Image.LANCZOS)
    if s.width >= w:
        m = (s.width - w) // 2
        return Image.composite(s.crop((0, 0, w, h)), s.crop((0, 0, w, h)), Image.new('L', (w, h), 255)) if False else \
            Image.fromarray(np.concatenate([np.asarray(s)[:, :w // 2], np.asarray(s)[:, s.width - (w - w // 2):]], axis=1))
    end = 30
    mid = np.asarray(s)[:, end:s.width - end]
    reps = math.ceil((w - 2 * end) / mid.shape[1])
    body = np.concatenate([mid] * reps, axis=1)[:, :w - 2 * end]
    return Image.fromarray(np.concatenate([np.asarray(s)[:, :end], body, np.asarray(s)[:, s.width - end:]], axis=1))


def bridge_span():
    c = canvas()
    s = slab(480, 60)
    c.alpha_composite(s, (16, 260))
    return c


def steps3():
    c = canvas()
    wall = kit(7, 'wall')
    for i in range(3):
        blk = shape((150, 110 * (i + 1)), lambda d: d.rectangle((0, 0, 150, 400), fill=255), wall)
        c.alpha_composite(outline(blk), (40 + i * 145, 470 - 110 * (i + 1)))
        c.alpha_composite(slab(150, 24), (40 + i * 145, 470 - 110 * (i + 1)))
    return c


def hanging_platform():
    c = canvas()
    vine = trim(kit(7, 'liana'))
    v = fit(vine, h=300)
    for x in (110, 400):
        c.alpha_composite(v, (x - v.width // 2, 0))
    c.alpha_composite(slab(360, 56), (76, 290))
    return c


def capital():
    c = canvas()
    stone = kit(7, 'wall')
    cap = shape(c.size, lambda d: d.polygon([(120, 260), (392, 260), (360, 330), (330, 330), (330, 470), (182, 470), (182, 330), (152, 330)]), stone)
    c.alpha_composite(outline(cap))
    c.alpha_composite(slab(300, 40), (106, 230))
    d = ImageDraw.Draw(c)
    for x in range(200, 330, 26):
        d.line((x, 340, x, 465), fill=(96, 98, 92, 255), width=4)
    return c


def cracked_ledge():
    c = canvas()
    s = slab(420, 90, piece='branchCreak')
    m = Image.new('L', s.size, 255)
    ImageDraw.Draw(m).polygon([(s.width - 70, s.height), (s.width, s.height - 50), (s.width, s.height)], fill=0)
    s.putalpha(ImageChops.multiply(m, s.getchannel('A')))
    c.alpha_composite(outline(s), (46, 250))
    return c


def push_block():
    c = canvas()
    b = fit(kit(7, 'boulder'), w=300)
    c.alpha_composite(b, (106, 470 - b.height))
    d = ImageDraw.Draw(c)
    for x in (130, 382):
        for y in range(470 - b.height + 40, 450, 34):
            d.line((x - 14, y, x + 14, y), fill=(40, 38, 36, 255), width=8)
    return c


def iron(im):
    return tint(im, (58, 60, 66), 0.85)


def lever10(up):
    c = canvas()
    lv = fit(iron(gem('w9a-puzzle', 'lever-up' if up else 'lever-down')), w=260)
    c.alpha_composite(lv, (126, 470 - lv.height))
    d = ImageDraw.Draw(c)
    # (a ring handle at the end of the arm)
    a = np.asarray(lv.getchannel('A')) > 128
    ys, xs = np.nonzero(a)
    tip = (126 + xs[np.argmin(ys)], 470 - lv.height + ys.min()) if up else (126 + xs.max(), 470 - lv.height + ys[np.argmax(xs)])
    d.ellipse((tip[0] - 26, tip[1] - 26, tip[0] + 26, tip[1] + 26), outline=(40, 42, 48, 255), width=10)
    return c


def plate_pair(world, plate_piece, strip_piece, raised):
    c = canvas()
    st = ground_strip(420, strip_piece, 44)
    c.alpha_composite(st, (46, 426))
    p = plate_piece
    if raised:
        c.alpha_composite(p, (256 - p.width // 2, 426 - p.height + 8))
    else:
        c.alpha_composite(p.crop((0, 0, p.width, 44)), (256 - p.width // 2, 426))
    return c


def iron_plate():
    g = trim(kit(10, 'branch'))
    g = g.resize((300, 50), Image.LANCZOS)
    plate = shape(g.size, lambda d: d.rectangle((0, 0, 300, 50), fill=255), (64, 66, 72, 255))
    plate.alpha_composite(Image.fromarray(np.dstack([np.asarray(g)[..., :3], (np.asarray(g)[..., 3] * 0.35).astype(np.uint8)]), 'RGBA'))
    d = ImageDraw.Draw(plate)
    for x in range(16, 300, 44):
        d.ellipse((x - 5, 8, x + 5, 18), fill=(120, 124, 130, 255))
    return outline(plate)


def portcullis(down):
    c = canvas()
    rock = kit(10, 'fill')
    for x in (70, 376):
        p = shape((66, 420), lambda d: d.rectangle((0, 0, 66, 420), fill=255), rock)
        c.alpha_composite(outline(p), (x, 50))
    lintel = shape((372, 60), lambda d: d.rectangle((0, 0, 372, 60), fill=255), rock)
    c.alpha_composite(outline(lintel), (70, 40))
    d = ImageDraw.Draw(c)
    d.rectangle((136, 100, 376, 470), fill=(22, 22, 26, 255))
    bars = Image.new('RGBA', c.size)
    bd = ImageDraw.Draw(bars)
    y1 = 470 if down else 150
    for x in range(150, 370, 30):
        bd.rectangle((x, 100, x + 10, y1 - 20), fill=(52, 54, 60, 255))
        bd.polygon([(x - 4, y1 - 20), (x + 14, y1 - 20), (x + 5, y1)], fill=(52, 54, 60, 255))
    for y in (140, 260, 380):
        if y < y1 - 30:
            bd.rectangle((140, y, 372, y + 12), fill=(60, 62, 68, 255))
    c.alpha_composite(outline(bars, 2))
    return c


def shelf_fungus():
    c = canvas()
    f = shape(c.size, lambda d: d.chord((60, 230, 452, 400), 180, 360, fill=255), kit(6, 'snapL'))
    c.alpha_composite(outline(tint(f, (190, 180, 150), 0.4)))
    c.alpha_composite(glow(c.size, (256, 238), 60, (120, 200, 255), 110))
    d = ImageDraw.Draw(c)
    d.arc((60, 230, 452, 400), 190, 350, fill=(140, 210, 255, 255), width=6)
    bark = shape((80, 220), lambda d: d.rectangle((0, 0, 80, 220), fill=255), kit(8, 'fill'))
    c.alpha_composite(outline(bark), (0, 220))
    return c


def leaf_hammock():
    c = canvas()
    d = ImageDraw.Draw(c)
    for x in (60, 452):
        d.line((x, 160, x + (20 if x < 256 else -20), 470), fill=(84, 70, 92, 255), width=12)
    d.chord((60, 120, 452, 380), 0, 180, fill=(70, 120, 120, 255))
    d.line((60, 250, 452, 250), fill=(54, 92, 96, 255), width=5)
    for x in range(110, 420, 60):
        d.line((x, 250, x + 20, 360), fill=(54, 92, 96, 255), width=3)
    return outline(c)


def rope_bridge():
    c = canvas()
    log = kit(8, 'branch')
    for i, x in enumerate(range(20, 492, 52)):
        sag = int(30 * math.sin(math.pi * (x - 20) / 472))
        pl = shape((44, 28), lambda d: d.rectangle((0, 0, 44, 28), fill=255), log)
        c.alpha_composite(outline(tint(pl, (130, 104, 80), 0.5), 2), (x, 300 + sag))
    d = ImageDraw.Draw(c)
    pts = [(x, 300 + int(30 * math.sin(math.pi * (x - 20) / 472)) + 2) for x in range(20, 493, 8)]
    d.line(pts, fill=(170, 146, 98, 255), width=6)
    d.line([(x, y - 70) for x, y in pts], fill=(170, 146, 98, 255), width=6)
    for x, y in pts[::8]:
        d.line((x, y, x, y - 70), fill=(170, 146, 98, 255), width=3)
    return c


def bouncy_leaf():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((256, 480, 250, 300), fill=(70, 96, 80, 255), width=14)
    d.chord((70, 230, 450, 360), 180, 360, fill=(64, 124, 112, 255))
    d.line((80, 296, 440, 296), fill=(40, 86, 80, 255), width=5)
    return outline(c)


def knot_perch():
    c = canvas()
    s = fit(kit(8, 'stump'), w=360)
    c.alpha_composite(s, (76, 470 - s.height))
    return c


def branch_fork():
    c = canvas()
    log = kit(8, 'branch')
    f = shape(c.size, lambda d: (d.polygon([(30, 330), (300, 300), (300, 360), (30, 380)], fill=255),
                                  d.polygon([(280, 300), (490, 220), (500, 262), (300, 352)], fill=255),
                                  d.polygon([(280, 320), (490, 330), (490, 376), (300, 360)], fill=255)), log)
    c.alpha_composite(outline(f))
    c.alpha_composite(fit(kit(8, 'mossStrip'), w=440), (40, 290))
    return c


def night_flowers():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((256, 480, 256, 300), fill=(60, 86, 88, 255), width=10)
    for cx, cy in ((190, 260), (256, 210), (322, 262), (230, 320), (296, 318)):
        for a in range(5):
            t = a * 2 * math.pi / 5
            x, y = cx + 34 * math.cos(t), cy + 34 * math.sin(t)
            d.ellipse((x - 24, y - 24, x + 24, y + 24), fill=(240, 232, 204, 255))
        d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=(236, 200, 120, 255))
    return outline(c)


def bark_fungus():
    c = canvas()
    b = shape((420, 160), lambda d: d.rectangle((0, 0, 420, 160), fill=255), kit(8, 'fill'))
    c.alpha_composite(outline(b), (46, 290))
    for x in range(90, 440, 70):
        c.alpha_composite(glow(c.size, (x, 300), 40, (120, 200, 255), 140))
    d = ImageDraw.Draw(c)
    for x in range(90, 440, 70):
        d.chord((x - 34, 280, x + 34, 330), 180, 360, fill=(140, 210, 250, 255))
    return c


def firefly_leaf():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((256, 60, 256, 180), fill=(70, 96, 80, 255), width=8)
    d.chord((140, 160, 372, 420), 300, 240, fill=(64, 120, 104, 255))
    for x, y in ((220, 290), (262, 320), (300, 280), (250, 260)):
        c.alpha_composite(glow(c.size, (x, y), 30, (230, 255, 140), 200))
        d.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(250, 255, 190, 255))
    return outline(c)


def bird_nest():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.chord((110, 300, 402, 470), 0, 180, fill=(122, 96, 66, 255))
    for i in range(40):
        x = R.randint(120, 390); y = R.randint(390, 450)
        d.line((x - 40, y + R.randint(-10, 10), x + 40, y), fill=(92, 70, 50, 255), width=4)
    d.chord((150, 350, 362, 420), 0, 180, fill=(70, 54, 40, 255))
    d.ellipse((280, 320, 380, 360), fill=(236, 232, 226, 255))
    return outline(c)


def leaf_curtain():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.rectangle((30, 0, 482, 14), fill=(84, 70, 92, 255))
    for x in range(50, 470, 40):
        L = R.randint(260, 470)
        d.line((x, 10, x + R.randint(-12, 12), L), fill=(60, 96, 100, 255), width=6)
        for y in range(60, L, 60):
            d.ellipse((x - 18, y, x + 18, y + 44), fill=(70, 124, 128, 255))
    return outline(c)


def tree_hollow():
    c = canvas()
    t = fit(kit(8, 'wall'), h=470)
    c.alpha_composite(t, (256 - t.width // 2, 20))
    c.alpha_composite(glow(c.size, (256, 260), 90, (255, 200, 120), 200))
    d = ImageDraw.Draw(c)
    d.ellipse((196, 190, 316, 330), fill=(60, 34, 20, 255))
    c.alpha_composite(glow(c.size, (256, 270), 50, (255, 190, 110), 230))
    return c


def pumice_raft():
    c = canvas()
    r = shape(c.size, lambda d: d.polygon([(50, 300), (120, 270), (400, 268), (470, 300), (440, 350), (80, 352)]), (150, 146, 140, 255))
    c.alpha_composite(outline(r))
    d = ImageDraw.Draw(c)
    for i in range(50):
        x, y = R.randint(90, 430), R.randint(285, 340)
        d.ellipse((x - 4, y - 3, x + 4, y + 3), fill=(110, 106, 100, 255))
    d.line((80, 352, 440, 352), fill=(255, 140, 50, 255), width=6)
    return c


def hex_column():
    c = canvas()
    col = fit(kit(9, 'bankEnd'), h=400)
    c.alpha_composite(col, (256 - col.width // 2, 470 - col.height))
    return c


def hot_platform():
    c = canvas()
    s = fit(kit(9, 'snapL'), w=440)
    c.alpha_composite(s, (36, 300))
    return c


def scorched_bridge():
    c = canvas()
    log = kit(9, 'trunk')
    for x in range(20, 492, 52):
        pl = shape((44, 30), lambda d: d.rectangle((0, 0, 44, 30), fill=255), log)
        c.alpha_composite(outline(pl, 2), (x, 300))
    d = ImageDraw.Draw(c)
    d.line((20, 302, 492, 302), fill=(70, 80, 50, 255), width=6)
    d.line((20, 232, 492, 232), fill=(70, 80, 50, 255), width=6)
    for x in range(30, 492, 66):
        d.line((x, 232, x, 302), fill=(70, 80, 50, 255), width=4)
    return c


def lava_dome():
    c = canvas()
    s = fit(kit(9, 'boulder'), w=380)
    c.alpha_composite(s, (66, 470 - s.height))
    return c


def vent_rock():
    c = canvas()
    s = fit(kit(10, 'boulder'), w=380)
    c.alpha_composite(tint(s, (40, 38, 40), 0.5), (66, 470 - s.height))
    d = ImageDraw.Draw(c)
    top = 470 - s.height
    d.ellipse((216, top + 6, 296, top + 40), fill=(20, 16, 16, 255))
    c.alpha_composite(glow(c.size, (256, top + 24), 26, (255, 120, 40), 120))
    return c


def young_tree():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((256, 480, 250, 180), fill=(84, 110, 60, 255), width=12)
    for x, y in ((250, 260), (250, 200)):
        for s in (-1, 1):
            d.line((x, y, x + s * 90, y - 50), fill=(84, 110, 60, 255), width=7)
    for x, y in ((160, 210), (340, 210), (165, 150), (335, 150), (250, 140)):
        d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=(90, 140, 70, 255))
        d.ellipse((x - 12, y - 12, x + 12, y + 12), fill=(220, 50, 50, 255))
    return outline(c)


def smoke_crack():
    c = canvas()
    g = ground_strip(440, kit(9, 'fill'), 70)
    c.alpha_composite(g, (36, 400))
    d = ImageDraw.Draw(c)
    d.line((180, 400, 230, 440, 260, 410, 320, 450), fill=(16, 12, 12, 255), width=10)
    for i in range(6):
        c.alpha_composite(glow(c.size, (256 + int(12 * math.sin(i)), 360 - i * 44), 26 + i * 4, (230, 230, 230), 110))
    return c


def obsidian():
    c = canvas()
    d = ImageDraw.Draw(c)
    for x, h, w in ((180, 200, 60), (240, 280, 70), (300, 180, 56), (210, 120, 50), (330, 110, 44)):
        d.polygon([(x - w // 2, 470), (x + w // 2, 470), (x + 6, 470 - h)], fill=(22, 20, 30, 255))
        d.line((x - 6, 460, x + 2, 470 - h + 30), fill=(120, 110, 150, 255), width=4)
    return outline(c)


def charred_log():
    c = canvas()
    s = fit(kit(9, 'perch'), h=420).rotate(90, expand=True)
    s = fit(s, w=440)
    c.alpha_composite(s, (36, 470 - s.height))
    for i in range(7):
        c.alpha_composite(glow(c.size, (R.randint(80, 430), R.randint(470 - s.height + 10, 460)), 12, (255, 110, 30), 230))
    return c


def ash_fern():
    c = canvas()
    d = ImageDraw.Draw(c)
    for i, a in enumerate(range(-60, 61, 20)):
        t = math.radians(a - 90)
        x1, y1 = 256 + 220 * math.cos(t), 470 + 300 * math.sin(t)
        col = (90, 140, 70, 255) if i == 3 else (150, 150, 146, 255)
        d.line((256, 470, x1, y1), fill=col, width=8)
        for k in range(1, 8):
            px, py = 256 + (x1 - 256) * k / 8, 470 + (y1 - 470) * k / 8
            d.line((px, py, px + 30, py - 10), fill=col, width=5)
            d.line((px, py, px - 30, py - 10), fill=col, width=5)
    return outline(c)


def lava_pool():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.ellipse((30, 380, 482, 480), fill=(40, 34, 34, 255))
    c.alpha_composite(glow(c.size, (256, 420), 150, (255, 120, 40), 140))
    d.ellipse((80, 396, 432, 460), fill=(255, 120, 30, 255))
    d.ellipse((150, 410, 360, 444), fill=(255, 200, 90, 255))
    return outline(c)


def scaffold():
    c = canvas()
    g = trim(kit(10, 'branch')).resize((470, 50), Image.LANCZOS)
    c.alpha_composite(g, (21, 300))
    d = ImageDraw.Draw(c)
    d.line((21, 230, 491, 230), fill=(50, 52, 58, 255), width=10)
    for x in range(30, 492, 78):
        d.line((x, 230, x, 300), fill=(50, 52, 58, 255), width=8)
    return outline(c, 2)


def crate():
    c = canvas()
    cr = gem('w10c-set-dressing', 'crates')
    one = trim(cr.crop((0, cr.height // 2 - 10, cr.width // 2 + 20, cr.height)))
    one = fit(one, w=300)
    c.alpha_composite(one, (106, 470 - one.height))
    d = ImageDraw.Draw(c)
    x0, y0 = 106, 470 - one.height
    for cx, cy in ((x0, y0), (x0 + one.width - 30, y0), (x0, 440), (x0 + one.width - 30, 440)):
        d.rectangle((cx, cy, cx + 30, cy + 30), fill=(60, 62, 68, 255))
    return c


def balcony():
    c = canvas()
    s = fit(kit(10, 'buttress'), w=420)
    top = s.crop((0, 0, s.width, 90))
    c.alpha_composite(top, (46, 250))
    br = shape((60, 140), lambda d: d.polygon([(0, 0), (60, 0), (60, 20), (10, 140), (0, 140)], fill=255), kit(10, 'fill'))
    for x in (80, 372):
        c.alpha_composite(outline(br), (x, 336))
    return c


def drawbridge():
    c = canvas()
    p = shape((470, 60), lambda d: d.rectangle((0, 0, 470, 60), fill=255), kit(6, 'branch'))
    p = tint(p, (110, 80, 56), 0.5)
    d = ImageDraw.Draw(p)
    for x in range(40, 470, 100):
        d.rectangle((x, 0, x + 16, 60), fill=(56, 58, 64, 255))
    c.alpha_composite(outline(p), (21, 290))
    return c


def hanging_iron():
    c = canvas()
    ch = fit(kit(10, 'liana'), h=280)
    for x in (90, 420):
        c.alpha_composite(ch, (x - ch.width // 2, 0))
    g = trim(kit(10, 'branch')).resize((400, 50), Image.LANCZOS)
    c.alpha_composite(g, (56, 270))
    return c


def iron_stair():
    c = canvas()
    d = ImageDraw.Draw(c)
    for i in range(3):
        x, y = 70 + i * 120, 400 - i * 100
        d.rectangle((x, y, x + 140, y + 24), fill=(56, 58, 64, 255))
        d.line((x, y + 24, x, 470), fill=(50, 52, 58, 255), width=8)
    d.line((70, 470, 430, 170), fill=(50, 52, 58, 255), width=12)
    d.line((450, 170, 450, 470), fill=(50, 52, 58, 255), width=10)
    return outline(c, 2)


def orchid_cluster():
    c = canvas()
    st = kit(5, 'stump')
    top = trim(st.crop((st.width // 3, 0, st.width * 2 // 3, st.height // 3)))
    for x, y, s in ((200, 170, 140), (300, 150, 150), (250, 240, 130)):
        f = fit(top, w=s)
        c.alpha_composite(f, (x - f.width // 2, y - f.height // 2))
    d = ImageDraw.Draw(c)
    d.line((256, 470, 240, 300, 256, 220), fill=(80, 100, 64, 255), width=10, joint='curve')
    return c


def cocoon():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((120, 40, 400, 60), fill=(110, 90, 70, 255), width=12)
    d.line((256, 50, 256, 220), fill=(230, 230, 240, 255), width=3)
    d.ellipse((206, 210, 306, 400), fill=(236, 234, 240, 255))
    for y in range(230, 390, 18):
        d.arc((206, y - 10, 306, y + 10), 0, 180, fill=(200, 200, 214, 255), width=3)
    return outline(c)


def web_twigs():
    c = canvas()
    d = ImageDraw.Draw(c)
    d.line((80, 60, 110, 470), fill=(110, 90, 70, 255), width=12)
    d.line((430, 70, 400, 470), fill=(110, 90, 70, 255), width=12)
    cx, cy = 256, 260
    for a in range(0, 360, 30):
        t = math.radians(a)
        d.line((cx, cy, cx + 150 * math.cos(t), cy + 150 * math.sin(t)), fill=(236, 236, 250, 255), width=3)
    for r in range(30, 160, 26):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(236, 236, 250, 255), width=2)
    return c


def mossy_log5():
    c = canvas()
    log = trim(kit(8, 'branch'))
    log = fit(tint(log, (120, 100, 80), 0.6), w=420)
    c.alpha_composite(log, (46, 470 - log.height))
    d = ImageDraw.Draw(c)
    for x in range(120, 400, 60):
        y = 470 - log.height
        d.rectangle((x - 4, y - 24, x + 4, y), fill=(220, 210, 230, 255))
        d.chord((x - 22, y - 44, x + 22, y - 10), 180, 360, fill=(150, 110, 190, 255))
    return outline(c)


def ferns5():
    c = canvas()
    f = trim(kit(5, 'mossStrip'))
    f = f.crop((0, 0, f.width, f.height * 2 // 3))
    f = fit(f, w=430)
    c.alpha_composite(f.resize((430, 260)), (41, 210))
    return c


def bromeliad():
    c = canvas()
    d = ImageDraw.Draw(c)
    for a in range(-70, 71, 20):
        t = math.radians(a - 90)
        d.polygon([(246, 470), (266, 470), (256 + 220 * math.cos(t), 470 + 260 * math.sin(t))], fill=(80, 130, 84, 255))
    d.ellipse((206, 330, 306, 370), fill=(140, 190, 220, 255))
    return outline(c)


def lever5(up):
    c = canvas()
    st = fit(kit(5, 'stump'), w=240)
    st = st.crop((0, st.height // 4, st.width, st.height))
    c.alpha_composite(st, (136, 470 - st.height))
    d = ImageDraw.Draw(c)
    y0 = 470 - st.height + 20
    end = (330, y0 - 150) if up else (400, y0 + 60)
    d.line((256, y0 + 10, *end), fill=(120, 92, 64, 255), width=22)
    d.line((256 + (end[0] - 256) * 0.6, y0 + 10 + (end[1] - y0 - 10) * 0.6, *end), fill=(238, 238, 246, 255), width=26)
    return outline(c)


def stone_plate5():
    p = shape((260, 46), lambda d: d.ellipse((0, 0, 260, 46), fill=255), (150, 146, 156, 255))
    d = ImageDraw.Draw(p)
    for x in range(20, 250, 26):
        d.ellipse((x - 5, 16, x + 5, 26), fill=(236, 200, 220, 255))
    return outline(p)


def silk_door(closed):
    c = canvas()
    post = kit(5, 'wall')
    for x in (80, 380):
        p = shape((56, 420), lambda d: d.rectangle((0, 0, 56, 420), fill=255), post)
        c.alpha_composite(outline(p), (x, 50))
    d = ImageDraw.Draw(c)
    if closed:
        for x in range(146, 376, 16):
            d.line((x, 70, x + R.randint(-6, 6), 470), fill=(240, 240, 250, 255), width=5)
        for y in range(120, 470, 70):
            d.line((140, y, 380, y + R.randint(-10, 10)), fill=(240, 240, 250, 255), width=3)
    else:
        for s, x0 in ((1, 140), (-1, 380)):
            for k in range(5):
                d.line((x0, 70 + k * 10, x0 + s * (20 + k * 6), 300 + k * 30), fill=(240, 240, 250, 255), width=5)
    return c


def sloth_statue():
    c = canvas()
    stone = kit(7, 'wall')
    body = shape(c.size, lambda d: (d.ellipse((150, 180, 362, 470), fill=255), d.ellipse((186, 70, 326, 210), fill=255),
                                     d.rectangle((130, 440, 382, 480), fill=255)), stone)
    c.alpha_composite(outline(body))
    d = ImageDraw.Draw(c)
    d.ellipse((206, 110, 306, 180), fill=(150, 150, 140, 255))
    d.arc((170, 220, 340, 400), 20, 160, fill=(80, 82, 76, 255), width=8)
    d.chord((150, 180, 362, 260), 200, 340, fill=(96, 130, 70, 255))
    return c


def urn():
    c = canvas()
    u = shape(c.size, lambda d: (d.ellipse((150, 160, 362, 440), fill=255), d.rectangle((200, 90, 312, 200), fill=255),
                                  d.rectangle((180, 80, 332, 110), fill=255), d.rectangle((210, 430, 302, 470), fill=255)), kit(7, 'wall'))
    c.alpha_composite(outline(u))
    d = ImageDraw.Draw(c)
    d.polygon([(300, 80), (332, 80), (318, 104)], fill=(0, 0, 0, 0))
    d.line((200, 100, 180, 300, 240, 460), fill=(110, 80, 56, 255), width=12, joint='curve')
    return c


def fallen_column():
    c = canvas()
    col = trim(kit(7, 'trunk')).rotate(90, expand=True)
    col = fit(col, w=440)
    c.alpha_composite(col, (36, 470 - col.height))
    return c


def archway():
    c = canvas()
    col = fit(kit(7, 'trunk'), h=380)
    for x in (70, 442 - col.width):
        c.alpha_composite(col, (x, 470 - col.height))
    c.alpha_composite(slab(400, 60), (56, 60))
    d = ImageDraw.Draw(c)
    d.line((60, 70, 200, 30, 330, 70, 460, 140), fill=(112, 84, 58, 255), width=18, joint='curve')
    return c


def stone_brazier():
    c = canvas()
    b = gem('w10c-set-dressing', 'brazier')
    b = trim(b.crop((0, b.height // 3, b.width, b.height)))
    b = fit(tint(b, (130, 130, 124), 0.85), h=300)
    c.alpha_composite(b, (256 - b.width // 2, 470 - b.height))
    return c


def fig_roots():
    c = canvas()
    v = trim(kit(7, 'liana'))
    for i, (x, a) in enumerate(((150, -30), (256, 10), (350, 40), (200, 70), (320, -60))):
        r = fit(v, h=380).rotate(a, expand=True, resample=Image.BICUBIC)
        c.alpha_composite(r, (x - r.width // 2, 470 - r.height))
    d = ImageDraw.Draw(c)
    for x, y in ((180, 200), (300, 260), (240, 330)):
        d.ellipse((x - 16, y - 8, x + 16, y + 8), fill=(150, 110, 70, 255))
    return c


def place(im, mode='ground'):
    """a prop into a 512 x 512 cell: fitted to 440 x 440, standing on y 470 or hanging from the top, centred across"""
    im = trim(im)
    im = fit(im, w=440, h=440) if im.width > 440 or im.height > 440 else im
    c = canvas()
    y = 20 if mode == 'top' else 470 - im.height
    c.alpha_composite(im, ((CW - im.width) // 2, max(10, y)))
    return c


def raw(im):
    return im


def root_arch(hole=True, den=False):
    c = canvas()
    p = trim(kit(6, 'branch')).resize((470, 300), Image.LANCZOS)
    m = Image.new('L', p.size, 0)
    ImageDraw.Draw(m).ellipse((140, 110, 330, 470), fill=255)
    if hole:
        a = ImageChops.subtract(p.getchannel('A'), m)
        p.putalpha(a)
    if den:
        dk = Image.new('RGBA', p.size, (30, 22, 18, 255)); dk.putalpha(m)
        p.alpha_composite(dk)
    c.alpha_composite(outline(p) if hole else p, (21, 470 - p.height))
    return c


def root_hide():
    c = canvas()
    tex = kit(6, 'wall')
    b = shape(c.size, lambda d: (d.ellipse((40, 220, 300, 520)), d.ellipse((180, 180, 470, 520)), d.rectangle((60, 380, 450, 470))), tex)
    b = b.crop((0, 0, CW, 470)); b = b.crop((0, 0, CW, CH)) if False else b
    c2 = canvas(); c2.alpha_composite(b, (0, 0)); b = c2
    c.alpha_composite(outline(b))
    return c


def reed_hide():
    c = canvas()
    for k in range(2):
        r = cattails()
        c.alpha_composite(r, (-90 + k * 170, 0))
    return c


def log_lying(moss):
    c = canvas()
    t = trim(kit(6, 'trunk')).rotate(90, expand=True)
    t = t.resize((340, 110), Image.LANCZOS)
    c.alpha_composite(t, (40, 360))
    end = fit(kit(6, 'stump'), h=120)
    end = end.crop((0, 0, end.width // 2, end.height))
    c.alpha_composite(end, (360, 350))
    if moss:
        m = trim(kit(6, 'mossStrip')).resize((340, 36), Image.LANCZOS)
        c.alpha_composite(m, (40, 344))
    return c


VAR = {5: ['bank', 'fill', 'buttress', 'stump', 'mossStrip', 'bankEnd'],
       6: ['branch', 'snapL', 'stump', 'bank', 'buttress', 'perch'],
       7: ['branch', 'bank', 'perch', 'buttress', 'stump', 'snapL'],
       8: ['branch', 'bank', 'perch', 'stump', 'buttress', 'fill'],
       9: ['bank', 'snapL', 'stump', 'perch', 'buttress', 'fill'],
       10: ['bank', 'perch', 'stump', 'buttress', 'branch', 'fill']}


def var_cell(w, n):
    return place(fit(kit(w, n), w=440, h=420))


W7S = trim(kit(7, 'mossStrip'))
SHEETS = {
    'w6d': ('magenta', 'a grey misty mangrove swamp, pale grey-green mangrove roots, weathered wood, dark mud, grey hanging moss and reeds', [
        ('root-arch', root_arch(), 'raw'), ('root-den', root_arch(hole=False, den=True), 'raw'), ('root-hide', root_hide(), 'raw'),
        ('reed-hide', reed_hide(), 'raw'), ('moss-log', log_lying(True), 'raw'), ('log', log_lying(False), 'raw')]),
    # (key colour, prompt words, cells as (name, picture, how to place))
    'w6c': ('magenta', 'a grey misty mangrove swamp, muted grey-green, weathered wood, dark mud and grey hanging moss', [
        ('cattails', cattails(), 'ground'), ('moss-curtain', moss_curtain(), 'top'), ('lantern-flower', lantern_flower(), 'ground'),
        ('canoe', canoe(), 'ground'), ('mooring-post', mooring_post(), 'ground'), ('glow-mushrooms', mushrooms_root(), 'ground')]),
    'w7b': ('magenta', 'ancient overgrown temple ruins, carved grey stone with worn geometric patterns, moss and roots', [
        ('bridge-span', bridge_span(), 'raw'), ('steps', steps3(), 'raw'), ('hanging-platform', hanging_platform(), 'raw'),
        ('capital', capital(), 'raw'), ('cracked-ledge', cracked_ledge(), 'raw'), ('push-block', push_block(), 'raw')]),
    'w10a': ('magenta', 'a dark mountain fortress at night, wet dark stone and black iron, rain-shiny', [
        ('lever-up', lever10(True), 'raw'), ('lever-down', lever10(False), 'raw'),
        ('plate-up', plate_pair(10, iron_plate(), kit(10, 'mossStrip'), True), 'raw'), ('plate-down', plate_pair(10, iron_plate(), kit(10, 'mossStrip'), False), 'raw'),
        ('portcullis-down', portcullis(True), 'raw'), ('portcullis-up', portcullis(False), 'raw')]),
    'w8b': ('magenta', 'a calm deep-blue night high in the treetops, silver moonlight, soft glowing blue fungus', [
        ('shelf-fungus', shelf_fungus(), 'raw'), ('leaf-hammock', leaf_hammock(), 'raw'), ('rope-bridge', rope_bridge(), 'raw'),
        ('bouncy-leaf', bouncy_leaf(), 'raw'), ('knot-perch', knot_perch(), 'raw'), ('branch-fork', branch_fork(), 'raw')]),
    'w8c': ('magenta', 'a calm deep-blue night high in the treetops, silver moonlight, glowing fungus and fireflies, pale cream flowers', [
        ('night-flowers', night_flowers(), 'raw'), ('bark-fungus', bark_fungus(), 'raw'), ('firefly-leaf', firefly_leaf(), 'raw'),
        ('bird-nest', bird_nest(), 'raw'), ('leaf-curtain', leaf_curtain(), 'raw'), ('tree-hollow', tree_hollow(), 'raw')]),
    'w9b': ('magenta', 'a scorched black volcanic valley lit by glowing orange lava, black basalt, ash', [
        ('pumice-raft', pumice_raft(), 'raw'), ('hex-column', hex_column(), 'raw'), ('hot-platform', hot_platform(), 'raw'),
        ('scorched-bridge', scorched_bridge(), 'raw'), ('lava-dome', lava_dome(), 'raw'), ('vent-rock', vent_rock(), 'raw')]),
    'w9c': ('magenta', 'a scorched black volcanic valley lit by glowing orange lava, black basalt, ash, young green trees with red pompom flowers', [
        ('young-tree', young_tree(), 'raw'), ('smoke-crack', smoke_crack(), 'raw'), ('obsidian', obsidian(), 'raw'),
        ('charred-log', charred_log(), 'raw'), ('ash-fern', ash_fern(), 'raw'), ('lava-pool', lava_pool(), 'raw')]),
    'w10b': ('magenta', 'a dark mountain fortress at night, wet dark stone, black iron and heavy wood, rain-shiny', [
        ('scaffold', scaffold(), 'raw'), ('crate', crate(), 'raw'), ('balcony', balcony(), 'raw'),
        ('drawbridge', drawbridge(), 'raw'), ('hanging-iron', hanging_iron(), 'raw'), ('iron-stair', iron_stair(), 'raw')]),
    'w5a': ('yellow', 'a deep violet-blue orchid forest at dusk, silver spider webs, white and pale pink orchids', [
        ('orchids', orchid_cluster(), 'raw'), ('cocoon', cocoon(), 'raw'), ('web', web_twigs(), 'raw'),
        ('mossy-log', mossy_log5(), 'raw'), ('ferns', ferns5(), 'raw'), ('bromeliad', bromeliad(), 'raw')]),
    'w5b': ('yellow', 'a deep violet-blue orchid forest at dusk, white spider silk, mossy wood and stone', [
        ('lever-up', lever5(True), 'raw'), ('lever-down', lever5(False), 'raw'),
        ('plate-up', plate_pair(5, stone_plate5(), kit(5, 'mossStrip'), True), 'raw'), ('plate-down', plate_pair(5, stone_plate5(), kit(5, 'mossStrip'), False), 'raw'),
        ('door-closed', silk_door(True), 'raw'), ('door-open', silk_door(False), 'raw')]),
    'w7c': ('magenta', 'ancient overgrown temple ruins, carved grey stone with worn geometric patterns, moss, strangler-fig roots, dry brown leaves', [
        ('sloth-statue', sloth_statue(), 'raw'), ('urn', urn(), 'raw'), ('fallen-column', fallen_column(), 'raw'),
        ('archway', archway(), 'raw'), ('stone-brazier', stone_brazier(), 'raw'), ('fig-roots', fig_roots(), 'raw')]),
}
LOOK = {5: 'a deep violet-blue orchid forest at dusk, silver spider webs, mossy earth', 6: 'a grey misty mangrove swamp, pale grey-green roots, dark mud',
        7: 'ancient overgrown temple ruins, carved grey stone, moss and roots', 8: 'a calm deep-blue night in the treetops, moonlit bark, glowing fungus',
        9: 'a scorched black volcanic valley, black basalt, glowing lava cracks, red pompom flowers', 10: 'a dark mountain fortress at night, wet stone and black iron'}
for w, ns in VAR.items():
    SHEETS[f'w{w}var'] = ('yellow' if w == 5 else 'magenta', LOOK[w] + ', a second painted version of each piece (platform variants)', [(f'{n}-b', var_cell(w, n), 'raw') for n in ns])
KEYS = {'magenta': (255, 0, 255), 'yellow': (255, 255, 0)}
index = {}
for name, (key, words, cells) in SHEETS.items():
    S = Image.new('RGBA', (CW * 3, CH * 2), KEYS[key] + (255,))
    for i, (cn, im, mode) in enumerate(cells):
        cell = im if mode == 'raw' else place(im, mode)
        S.alpha_composite(cell, ((i % 3) * CW, (i // 3) * CH))
    S.convert('RGB').save(OUT / f'start-{name}.png')
    index[name] = {'key': key, 'words': words, 'cells': [c[0] for c in cells]}
(OUT / 'starts.json').write_text(json.dumps(index, indent=1))
print('starts', list(index))
