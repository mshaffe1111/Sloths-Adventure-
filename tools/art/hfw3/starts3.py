"""ART-W3 batch 1 (R-165.449): paste-up starts for World 3's MISSING standing and climbing pieces, 3-1 first, then 3-2, on flat grey,
plus a root style reference cut from the game's own painted roots and grotto moss. Run from the repo root:
    python3 -I tools/art/hfw3/starts3.py   -> reference/art/hfw3/starts3/*.png + starts3-sheet.jpg
Geometry and colours only; Qwen-Image-Edit-2511 repaints in the painter's hand (the ART-NEXT-b method: tools/art/hfnext/starts2.py,
whose grotto takes passed). Pokey is 89.1 px drawn. The list: reference/qa-reports/ART-W3/REPORT.md.
  3-1  shelfL     a 320-unit grotto shelf (3 canvas px a unit)                          M3
  3-1  wallR      a shaft wall face: the rock's left face, tiles top to bottom          M1
  3-1  wallShelf  a shelf growing out of a wall stub (the shelf-in-wall end)            M1
  3-1  rootTall   a root curtain to climb, 4 Pokey tall (cut to 4 and 3)                M2
  3-1  rootShort  a root curtain to climb, 2-2.5 Pokey tall                             M2
  3-2  roofRoot   a roof root to hang under, tiles left to right                        (3-2)
  3-2  roofEnd    the roof root growing out of the cave roof's rock                     (3-2)
"""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

OUT = Path('reference/art/hfw3/starts3'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
LINE = (30, 34, 34)
w3n = Image.open('src/assets/w1to4art/w3-new.webp').convert('RGBA')
w3p = Image.open('src/assets/props/w3-props.webp').convert('RGBA')
kit = Image.open('src/assets/kits/w3.webp').convert('RGBA')
ROOTS = Image.open('src/assets/w1-1111b/P-10-d.png').convert('RGBA')      # P-10-d root curtain (World 4 best), the root look


def crop(im, x, y, w, h): return im.crop((x, y, x + w, y + h))


def fit(im, w=None, h=None):
    if w and h: return im.resize((w, h), Image.LANCZOS)
    s = (w / im.width) if w else (h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def canvas(w, h): return Image.new('RGBA', (w, h), GREY + (255,))


SH_S = crop(w3n, 1588, 614, 348, 168)       # w3-new#shelf-short, walk_y 53
SH_L = crop(w3n, 655, 614, 582, 178)        # w3-new#shelf-long, walk_y 58
WALL = crop(kit, 156, 0, 556, 542)          # w3#wall (grotto stone wall block)
MOSSC = crop(w3p, 640, 0, 471, 440)         # w3-props#mossCurtain
a = np.asarray(SH_S).astype(int)


def tone(arr, y0, y1, x0, x1):
    p = arr[y0:y1, x0:x1].reshape(-1, 4); p = p[p[:, 3] > 200][:, :3]; return tuple(int(v) for v in np.median(p, axis=0))


TOP, FRONT, UNDER = tone(a, 50, 58, 120, 300), tone(a, 64, 80, 120, 300), tone(a, 110, 140, 120, 300)
ra = np.asarray(ROOTS).astype(int)
ROOT_D, ROOT_L = tone(ra, 200, 420, 40, 380), tone(ra, 120, 200, 60, 360)
ROOT_L = tuple(min(255, int(v * 1.25)) for v in ROOT_L)
MOSS = tone(np.asarray(MOSSC).astype(int), 60, 160, 100, 380)

# --- style reference for the roots: the grotto shelves (left) + the game's root curtain + grotto moss, on grey
ref = canvas(1024, 1024)
ref.alpha_composite(fit(SH_L, w=600), (20, 30)); ref.alpha_composite(fit(WALL, w=380), (20, 280))
ref.alpha_composite(fit(ROOTS, h=560), (430, 260)); ref.alpha_composite(fit(MOSSC, w=420), (20, 680))
ref.alpha_composite(fit(SH_S, w=360), (640, 40))
ref.convert('RGB').save(OUT / 'ref-w3root.png')


def slab(w, thick, under, seed, ends='round'):
    """a grotto stone slab (starts2.py's): lit top face, a front face, a tapering rock underside, crack lines"""
    rnd = random.Random(seed)
    im = Image.new('RGBA', (w, thick + under + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    top = 10
    tip = (int(w * 0.42), thick + under)
    pts = [(6, thick)] + [(int(w * f), thick + int(under * (f / 0.42) ** 1.4)) for f in (0.12, 0.25, 0.36)] + [tip] + \
          [(int(w * f), thick + int(under * ((1 - f) / 0.58) ** 1.6)) for f in (0.55, 0.7, 0.85)] + [(w - 6, thick)]
    d.polygon(pts, fill=UNDER + (255,), outline=LINE)
    d.rounded_rectangle([2, top, w - 3, thick], radius=12 if ends == 'round' else 3, fill=FRONT + (255,), outline=LINE, width=3)
    d.rounded_rectangle([2, top, w - 3, top + max(8, thick // 4)], radius=10 if ends == 'round' else 2, fill=TOP + (255,), outline=LINE, width=2)
    for _ in range(max(2, w // 120)):
        x = rnd.randint(30, w - 30); d.line([(x, top + thick // 4), (x + rnd.randint(-12, 12), thick)], fill=LINE, width=2)
    return im


TUFT = fit(crop(SH_S, 0, 0, 120, 60), w=170)


def stone_body(w, h, seed, edge):
    """a block of grotto rock seen side-on, its LEFT face ragged by edge(y) (x of the face at row y); horizontal strata, cracks,
    moss streaks; returned RGBA, transparent left of the face"""
    rnd = random.Random(seed)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    poly = [(edge(y), y) for y in range(0, h + 1, 8)] + [(w, h), (w, 0)]
    d.polygon(poly, fill=FRONT + (255,))
    for y in range(0, h, 8):   # a lit strip along the face, darker deep in the rock
        x0 = edge(y)
        d.line([(x0 + 2, y), (x0 + 2, y + 8)], fill=TOP, width=10)
        d.rectangle([x0 + 150, y, w, y + 8], fill=UNDER)
    for y0 in range(60, h, 140):   # strata
        y = y0 + rnd.randint(-20, 20)
        d.line([(edge(y) + 4, y), (w, y + rnd.randint(-10, 10))], fill=LINE, width=3)
    for _ in range(h // 90):   # cracks
        y = rnd.randint(20, h - 40); x = edge(y) + rnd.randint(20, 120)
        d.line([(x, y), (x + rnd.randint(-15, 15), y + rnd.randint(30, 70))], fill=LINE, width=2)
    for _ in range(h // 220 + 1):   # moss streaks down the face
        y = rnd.randint(0, h - 120); x = edge(y)
        d.polygon([(x - 6, y), (x + 40, y), (x + 20, y + rnd.randint(60, 110)), (x - 4, y + 50)], fill=MOSS + (255,))
    d.line(poly[:-2], fill=LINE, width=3)
    return im


# 1 shelfL (3-1 M3): 320 x ~35 thick at 3 canvas px a unit (960 x 105), the underside below, a fern tuft at the back left
L = canvas(1024, 384); L.alpha_composite(slab(960, 105, 120, 5), (32, 90)); L.alpha_composite(TUFT, (60, 40))
L.alpha_composite(fit(crop(SH_S, 200, 0, 140, 60), w=150), (760, 48))
L.convert('RGB').save(OUT / 'shelfL.png')

# 2 wallR (3-1 M1): the shaft's right wall, its face on the left, the rock running off the right edge; the face's line repeats with
#   period 1024 so the cut can make it tile top to bottom
def face(y): return int(150 + 34 * math.sin(2 * math.pi * y / 1024) + 14 * math.sin(2 * math.pi * 3 * y / 1024 + 0.7))
W = canvas(512, 1024); W.alpha_composite(stone_body(512, 1024, 9, face), (0, 0))
W.convert('RGB').save(OUT / 'wallR.png')

# 3 wallShelf (3-1 M1): a wall stub on the right, a shelf growing out of it to the left (the shelf-in-wall end)
WS = canvas(768, 512)
WS.alpha_composite(stone_body(240, 512, 13, lambda y: int(20 + 10 * math.sin(y / 60))), (528, 0))
WS.alpha_composite(slab(560, 105, 110, 17), (0, 190))
WS.alpha_composite(TUFT, (40, 140))
WS.convert('RGB').save(OUT / 'wallShelf.png')


def curtain(w, h, top_h, seed, strands=3):
    """a root curtain: a grotto rock lip across the top, `strands` roots braided down from it to tapered tips, rootlets and moss"""
    rnd = random.Random(seed)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx = w // 2
    for s in range(strands):
        ph = s * 2 * math.pi / strands
        pts = []
        for y in range(top_h - 20, h - 30, 6):
            t = (y - top_h) / (h - top_h)
            x = cx + 46 * math.sin(y / 70 + ph) * (1 - 0.3 * t)
            pts.append((x, y))
        for i in range(len(pts) - 1):
            t = i / len(pts)
            wid = int(30 * (1 - 0.75 * t)) + 4
            d.line([pts[i], pts[i + 1]], fill=ROOT_D, width=wid + 6)
            d.line([pts[i], pts[i + 1]], fill=ROOT_L, width=wid)
    for _ in range(h // 70):   # rootlets
        y = rnd.randint(top_h + 20, h - 120); x = cx + rnd.choice((-1, 1)) * rnd.randint(30, 60)
        d.line([(x, y), (x + rnd.randint(-40, 40), y + rnd.randint(40, 90))], fill=ROOT_D, width=5)
    for _ in range(h // 200 + 1):   # moss clumps on the roots
        y = rnd.randint(top_h, h - 200); x = cx + rnd.randint(-40, 30)
        d.ellipse([x, y, x + 44, y + 30], fill=MOSS + (255,))
    lip = slab(w - 20, top_h - 30, 40, seed + 1)   # the rock the roots hang from
    im.alpha_composite(lip, (10, 0))
    return im


# 4 rootTall (3-1 M2): 1024 canvas = ~356 units (4 Pokey); the braid ~150 canvas px = ~52 units wide (a hand's width and a little)
RT = canvas(384, 1024); RT.alpha_composite(curtain(384, 1000, 110, 21), (0, 8)); RT.convert('RGB').save(OUT / 'rootTall.png')
# 5 rootShort (3-1 M2): 768 canvas, cut to 2 and 2.5 Pokey
RS = canvas(384, 768); RS.alpha_composite(curtain(384, 744, 110, 29), (0, 8)); RS.convert('RGB').save(OUT / 'rootShort.png')

# 6 roofRoot (3-2): one thick root along the roof, ~18 units thick at 3 px a unit, periodic in x (1024) so it tiles; rootlets hang
R = canvas(1024, 320); d = ImageDraw.Draw(R)
def ry(x): return 120 + 16 * math.sin(2 * math.pi * x / 1024) + 7 * math.sin(2 * math.pi * 2 * x / 1024 + 1.1)
pts = [(x, ry(x)) for x in range(-8, 1033, 8)]
d.line(pts, fill=ROOT_D, width=62); d.line(pts, fill=ROOT_L, width=50)
d.line([(x, y - 10) for x, y in pts], fill=tuple(min(255, v + 25) for v in ROOT_L), width=10)
rnd = random.Random(31)
for x0 in range(40, 1000, 110):
    x = x0 + rnd.randint(-20, 20); y = ry(x) + 22
    d.line([(x, y), (x + rnd.randint(-25, 25), y + rnd.randint(50, 130))], fill=ROOT_D, width=6)
for x0 in (180, 560, 860):
    d.ellipse([x0, ry(x0) - 34, x0 + 70, ry(x0) - 6], fill=MOSS)
R.convert('RGB').save(OUT / 'roofRoot.png')

# 7 roofEnd (3-2): the cave roof's rock across the top left, the root coming out of it and running off the right edge at roofRoot's
#   height, so the two join
E = canvas(512, 512)
E.alpha_composite(stone_body(512, 200, 37, lambda y: 0).transpose(Image.FLIP_TOP_BOTTOM).crop((0, 0, 300, 200)), (0, 0))
d = ImageDraw.Draw(E)
pts = [(150 + t * 362, 160 + 60 * math.sin(min(1, t * 1.6) * math.pi / 2) - 40 * t) for t in [i / 40 for i in range(41)]]
d.line(pts, fill=ROOT_D, width=62); d.line(pts, fill=ROOT_L, width=50)
for x in (230, 330, 420):
    d.line([(x, 200), (x + 10, 290)], fill=ROOT_D, width=6)
E.convert('RGB').save(OUT / 'roofEnd.png')

# contact sheet of the starts, to look at before any spend
names = ['shelfL', 'wallR', 'wallShelf', 'rootTall', 'rootShort', 'roofRoot', 'roofEnd', 'ref-w3root']
ims = [Image.open(OUT / f'{n}.png') for n in names]
sh = Image.new('RGB', (sum(min(400, i.width // 2) for i in ims) + 10 * len(ims), 520), (20, 20, 20)); x = 0
for i in ims:
    t = fit(i, w=min(400, i.width // 2)) if i.width // 2 <= 400 else fit(i, w=400)
    if t.height > 512: t = fit(t, h=512)
    sh.paste(t, (x, 4)); x += t.width + 10
sh.save(OUT.parent / 'starts3-sheet.jpg', quality=85)
print('ok', [n for n in names])
