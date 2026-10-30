"""Starts for the new 9-10 and 10-10 set pieces (reference/boss-design/9-10-and-10-10.md §6 on boss-design-9-10), plain shapes in the
lairs' own colours (lair-drake-calm, lair-general-calm, the warroom plate) on magenta, for img2img with the style model. Every piece is
evenly lit and separate; anything that stands reaches the bottom of its box (nothing floats).

  start-910-ledges.webp   2048 x 1024  six basalt hoard shelves on their own rock columns (coins, tin mugs, a teapot, a chest) + 3 ribs
  start-910-crust.webp    2048 x 1024  the lava crust in five states (rows), three strips each: molten, patchy, cracked, cooled, breaking
  start-910-lava.webp     2048 x 512   the rising lava surface, tileable left to right (top edge bright, dark red below)
  start-1010-table.webp   2048 x 1024  the bare-oak council table: standing (top), tipped up as a wall, splintered (bottom row)
  start-1010-chairs.webp  2048 x 1024  ten council chairs (a sign carved on each back) and the head chair; one chair tumbling, on its
                                       side, and broken
  start-1010-net.webp     2048 x 1024  wrought-iron diamond netting between square stone pillars (3 widths) and one bent, torn panel
  start-1010-hedge.webp   2048 x 512   a low hedge of black iron thorns, tileable, and its end piece (right)
  start-1010-rubble.webp  2048 x 1024  three rubble piles and a broken battlement with a jagged top
  start-1010-break.webp   2048 x 1024  the hall's end wall in three frames: cracking, bursting, the open hole onto the stormy courtyard
    python3 -I tools/art/hfdrake/boss910starts.py <game checkout> <out dir>
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

G, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
EDGE = (24, 18, 18)
rnd = random.Random(910)


def new(w=2048, h=1024):
    im = Image.new('RGB', (w, h), MAG)
    return im, ImageDraw.Draw(im)


def rock(d, box, fill=(46, 42, 44), hi=(78, 72, 72), jag=10):
    """a basalt block: a jagged outline, a lit top face, a few cracks"""
    x0, y0, x1, y1 = box
    pts = [(x0, y1)]
    n = max(3, int((x1 - x0) / 40))
    for i in range(n + 1):
        pts.append((x0 + (x1 - x0) * i / n, y0 + rnd.uniform(-jag, jag)))
    pts.append((x1, y1))
    d.polygon(pts, fill=EDGE)
    inner = [(x + (4 if x < (x0 + x1) / 2 else -4), y + 4) for x, y in pts]
    d.polygon(inner, fill=fill)
    d.polygon([(x, y + 4) for x, y in pts[1:-1]] + [(x1 - 6, y0 + 22), (x0 + 6, y0 + 22)], fill=hi)
    for _ in range(int((x1 - x0) / 60)):
        cx = rnd.uniform(x0 + 10, x1 - 10)
        d.line([(cx, y0 + 30), (cx + rnd.uniform(-20, 20), min(y1, y0 + rnd.uniform(60, 160)))], fill=EDGE, width=3)


def coins(d, x0, x1, y):
    for _ in range(int((x1 - x0) / 9)):
        cx, cy = rnd.uniform(x0, x1), y - abs(rnd.gauss(0, 14))
        d.ellipse((cx - 11, cy - 6, cx + 11, cy + 6), fill=(120, 80, 10))
        d.ellipse((cx - 9, cy - 5, cx + 9, cy + 4), fill=(236, 186, 60))


def tin(d, cx, by, w=44, h=52):
    d.rectangle((cx - w / 2, by - h, cx + w / 2, by), fill=EDGE)
    d.rectangle((cx - w / 2 + 4, by - h + 4, cx + w / 2 - 4, by - 4), fill=(126, 118, 108))
    d.arc((cx + w / 2 - 8, by - h * 0.8, cx + w / 2 + 16, by - h * 0.25), 270, 90, fill=EDGE, width=6)
    d.ellipse((cx - 6, by - h / 2, cx + 4, by - h / 2 + 8), fill=(150, 72, 34))


# ───── 9-10: hoard shelves ─────
im, d = new()
SHELVES = [(30, 520, 360), (400, 380, 300), (740, 600, 280), (1060, 300, 340), (1440, 470, 300), (1780, 560, 240)]
for k, (x, top, w) in enumerate(SHELVES):
    colw = w * 0.45
    rock(d, (x + (w - colw) / 2, top + 60, x + (w + colw) / 2, 1024), fill=(38, 34, 36), hi=(52, 48, 50), jag=6)  # its column
    rock(d, (x, top, x + w, top + 80))                                                                          # the shelf
    coins(d, x + 20, x + w - 20, top + 4)
    if k in (0, 3, 5):
        tin(d, x + w * 0.3, top + 2)
        tin(d, x + w * 0.62, top + 2, 38, 44)
    if k == 1:  # the dented teapot
        d.ellipse((x + 90, top - 110, x + 230, top + 4), fill=EDGE)
        d.ellipse((x + 96, top - 104, x + 224, top - 2), fill=(118, 108, 98))
        d.polygon([(x + 96, top - 60), (x + 50, top - 110), (x + 62, top - 116), (x + 110, top - 76)], fill=EDGE)
    if k == 4:  # a battered chest
        d.rectangle((x + 80, top - 110, x + 230, top + 2), fill=EDGE)
        d.rectangle((x + 86, top - 104, x + 224, top - 4), fill=(110, 66, 30))
        d.rectangle((x + 86, top - 70, x + 224, top - 62), fill=(70, 64, 60))
        coins(d, x + 90, x + 220, top - 104)
for x in (1290, 1350, 1410):  # three tall narrow ribs
    pass
for k, x in enumerate((1300, 1390, 1480)):
    pass
for k, (x, top) in enumerate(((660, 60), (1000, 40), (1340, 90))):
    pass
im2, d2 = new(2048, 1024)
im.save(OUT / 'start-910-ledges.webp', quality=94)
# (the ribs on their own sheet strip: three tall narrow basalt ribs, bottom right of the crust sheet below)

# ───── 9-10: lava crust, five states ─────
im, d = new()
ST = [((255, 120, 30), (255, 200, 80), None), ((210, 80, 26), (250, 150, 50), (60, 40, 36)), ((44, 38, 38), (64, 56, 54), (255, 120, 30)),
      ((30, 28, 30), (52, 48, 50), (70, 60, 56)), ((40, 34, 34), (60, 52, 50), (255, 140, 40))]
for r, (body, top, crack) in enumerate(ST):
    y = 30 + r * 196
    for c in range(3):
        x = 30 + c * 560
        w = rnd.randint(440, 520)
        if r == 4:  # breaking into plates with glowing gaps
            px = x
            while px < x + w - 40:
                pw = rnd.randint(70, 130)
                d.rounded_rectangle((px, y + 40, px + pw, y + 100), 10, fill=EDGE)
                d.rounded_rectangle((px + 3, y + 43, px + pw - 3, y + 97), 8, fill=body)
                d.rectangle((px + pw, y + 60, px + pw + 14, y + 90), fill=crack)
                px += pw + 14
            continue
        d.rounded_rectangle((x, y + 40, x + w, y + 100), 24, fill=EDGE)
        d.rounded_rectangle((x + 4, y + 44, x + w - 4, y + 96), 20, fill=body)
        d.rounded_rectangle((x + 8, y + 46, x + w - 8, y + 60), 8, fill=top)
        if crack:
            for _ in range(6 if r != 1 else 5):
                cx = rnd.uniform(x + 30, x + w - 60)
                if r == 1:
                    d.ellipse((cx, y + 56, cx + rnd.uniform(40, 90), y + 86), fill=crack)
                else:
                    d.line([(cx, y + 50), (cx + 14, y + 70), (cx + 4, y + 92)], fill=crack, width=4 if r == 2 else 2)
for k, x in enumerate((1740, 1840, 1940)):  # the three ribs, in the free corner (rows 1-2 end at 1600)
    pass
im.save(OUT / 'start-910-crust.webp', quality=94)

# ribs and shelves share the ledges sheet's free space? no: their own small sheet keeps the boxes simple
im, d = new(2048, 1024)
for k, x in enumerate((200, 700, 1200)):
    h = 620 + k * 90
    pts = [(x, 1024), (x + 10, 1024 - h * 0.5), (x + 40, 1024 - h), (x + 120, 1024 - h + 30), (x + 150, 1024 - h * 0.4), (x + 170, 1024)]
    d.polygon(pts, fill=EDGE)
    d.polygon([(px + (5 if px < x + 80 else -5), py + 5) for px, py in pts], fill=(40, 36, 38))
    d.polygon([(x + 30, 1024 - h + 14), (x + 60, 1024 - h + 10), (x + 52, 1024 - h * 0.3), (x + 24, 1024 - h * 0.3)], fill=(58, 54, 56))
im.save(OUT / 'start-910-ribs.webp', quality=94)

# ───── 9-10: the rising lava surface ─────
im = Image.new('RGB', (2048, 512), MAG)
d = ImageDraw.Draw(im)
for y in range(80, 512):
    t = (y - 80) / 432
    d.line([(0, y), (2048, y)], fill=(int(250 - 140 * t), int(150 - 130 * t), int(40 - 20 * t)))
for x in range(0, 2048, 4):
    yy = 80 + 10 * math.sin(x / 2048 * 2 * math.pi * 5) + 5 * math.sin(x / 2048 * 2 * math.pi * 13)
    d.line([(x, 0), (x, yy)], fill=MAG, width=4)
    d.line([(x, yy), (x, yy + 14)], fill=(255, 236, 150), width=4)
for _ in range(40):
    x, y = rnd.uniform(0, 2048), rnd.uniform(120, 460)
    d.arc((x, y, x + rnd.uniform(60, 180), y + rnd.uniform(14, 40)), 0, 180, fill=(255, 190, 70), width=3)
im.save(OUT / 'start-910-lava.webp', quality=94)

# ───── 10-10: the council table ─────
OAK, OAKHI, OAKLO = (122, 84, 50), (156, 112, 70), (84, 56, 32)
im, d = new()
d.rectangle((40, 60, 2008, 120), fill=EDGE)
d.rectangle((44, 64, 2004, 116), fill=OAK)
d.rectangle((44, 64, 2004, 78), fill=OAKHI)
for x in (90, 560, 1024, 1480, 1940):
    d.rectangle((x - 22, 116, x + 22, 300), fill=EDGE)
    d.rectangle((x - 18, 116, x + 18, 296), fill=OAKLO)
for _ in range(14):
    x = rnd.uniform(80, 1960)
    d.line([(x, 70), (x + rnd.uniform(20, 70), 74 + rnd.uniform(0, 8))], fill=OAKLO, width=2)
# tipped up as a tall wall: the tabletop facing us, legs out the back (their ends showing at the sides)
d.rectangle((120, 380, 520, 1010), fill=EDGE)
d.rectangle((126, 386, 514, 1004), fill=OAK)
for k in range(1, 6):
    d.line([(126 + k * 65, 386), (126 + k * 65, 1004)], fill=OAKLO, width=3)
d.rectangle((126, 386, 514, 410), fill=OAKHI)
for y in (450, 940):
    d.rectangle((514, y, 560, y + 34), fill=EDGE)
    d.rectangle((80, y, 126, y + 34), fill=EDGE)
# splintered and broken
for k, (x0, x1, ang) in enumerate(((700, 1150, -6), (1190, 1560, 9), (1600, 1990, -3))):
    y = 860 + k * 20
    d.polygon([(x0, y), (x1, y - 40 * math.sin(math.radians(ang)) * 6), (x1 - 20, y + 40), (x0 + 10, y + 50)], fill=EDGE)
    d.polygon([(x0 + 6, y + 6), (x1 - 8, y - 40 * math.sin(math.radians(ang)) * 6 + 6), (x1 - 24, y + 34), (x0 + 14, y + 44)], fill=OAK)
    for j in range(5):
        sx = x1 - 10 - j * 6
        d.polygon([(sx, y + 4), (sx + 40, y - 12 + j * 8), (sx + 4, y + 20)], fill=OAKHI)
    d.rectangle((x0 + 60, y + 50, x0 + 96, 1010), fill=EDGE)
    d.rectangle((x0 + 64, y + 50, x0 + 92, 1006), fill=OAKLO)
im.save(OUT / 'start-1010-table.webp', quality=94)


# ───── 10-10: the chairs ─────
def chair(d, x, by, w=120, back=230, seat=110, head=False, sign=0):
    """a heavy wooden chair, side-on but the back turned a little to us so its carving shows"""
    col, hi = ((92, 58, 34), (130, 88, 52)) if not head else ((70, 44, 26), (110, 74, 44))
    top = by - seat - back
    d.rectangle((x, top, x + w * 0.9, by - seat + 10), fill=EDGE)
    d.rectangle((x + 6, top + 6, x + w * 0.9 - 6, by - seat + 4), fill=col)
    if head:  # taller, a crest of iron studs
        d.polygon([(x, top), (x + w * 0.45, top - 60), (x + w * 0.9, top)], fill=EDGE)
        d.polygon([(x + 8, top), (x + w * 0.45, top - 50), (x + w * 0.9 - 8, top)], fill=col)
        for k in range(6):
            d.ellipse((x + 12 + k * 18, top + 14, x + 22 + k * 18, top + 24), fill=(170, 170, 176))
    cx, cy = x + w * 0.45, top + back * 0.45
    s = 26
    shapes = [  # a fang, a crown, an eye, a feather, a web, a reed, a block, a moth, a flame, a thorn
        lambda: d.polygon([(cx - s, cy - s), (cx + s, cy - s), (cx, cy + s)], fill=hi),
        lambda: d.polygon([(cx - s, cy + s * 0.6), (cx - s, cy - s * 0.4), (cx - s * 0.5, cy), (cx, cy - s), (cx + s * 0.5, cy), (cx + s, cy - s * 0.4), (cx + s, cy + s * 0.6)], fill=hi),
        lambda: (d.ellipse((cx - s, cy - s * 0.55, cx + s, cy + s * 0.55), fill=hi), d.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), fill=EDGE)),
        lambda: d.polygon([(cx, cy - s), (cx + s * 0.5, cy), (cx, cy + s), (cx - s * 0.5, cy)], fill=hi),
        lambda: [d.line([(cx, cy), (cx + s * math.cos(a), cy + s * math.sin(a))], fill=hi, width=4) for a in [i * math.pi / 4 for i in range(8)]],
        lambda: [d.line([(cx + o, cy + s), (cx + o * 1.5, cy - s)], fill=hi, width=6) for o in (-10, 0, 10)],
        lambda: d.rectangle((cx - s * 0.8, cy - s * 0.8, cx + s * 0.8, cy + s * 0.8), fill=hi),
        lambda: (d.ellipse((cx - s, cy - s * 0.8, cx, cy + s * 0.4), fill=hi), d.ellipse((cx, cy - s * 0.8, cx + s, cy + s * 0.4), fill=hi)),
        lambda: d.polygon([(cx, cy - s), (cx + s * 0.6, cy + s * 0.2), (cx, cy + s), (cx - s * 0.6, cy + s * 0.2)], fill=hi),
        lambda: d.polygon([(cx - 4, cy + s), (cx + 4, cy + s), (cx + 14, cy - s)], fill=hi),
    ]
    if not head:
        shapes[sign % 10]()
    d.rectangle((x - 4, by - seat - 4, x + w + 4, by - seat + 18), fill=EDGE)
    d.rectangle((x, by - seat, x + w, by - seat + 14), fill=hi)
    for lx in (x + 4, x + w - 18):
        d.rectangle((lx, by - seat + 14, lx + 16, by), fill=EDGE)
        d.rectangle((lx + 3, by - seat + 14, lx + 13, by - 3), fill=col)


im, d = new()
for k in range(10):
    chair(d, 30 + (k % 5) * 190, 440 if k < 5 else 960, sign=k)
chair(d, 1000, 440, w=150, back=290, head=True)
# one chair tumbling (rotated), on its side, and in pieces
for k, ang in enumerate((35, 90)):
    tmp = Image.new('RGBA', (420, 420), (0, 0, 0, 0))
    td = ImageDraw.Draw(tmp)
    chair(td, 150, 380, sign=3)
    tmp = tmp.rotate(ang, resample=Image.BICUBIC, expand=False)
    im.paste(tmp, (1200 + k * 420, 60 if k == 0 else 600), tmp)
tmp = Image.new('RGBA', (420, 420), (0, 0, 0, 0))
td = ImageDraw.Draw(tmp)
chair(td, 150, 380, sign=3)
for j, (bx, ang, dx, dy) in enumerate(((0, 0, 0, 0), (150, 60, 40, 140), (300, -30, 10, 200))):
    piece = tmp.crop((140 + j * 45, 100 + j * 80, 290, 380))
    piece = piece.rotate(ang, expand=True, resample=Image.BICUBIC)
    im.paste(piece, (1650 + dx + j * 20, 520 + dy), piece)
im.save(OUT / 'start-1010-chairs.webp', quality=94)

# ───── 10-10: iron netting between pillars ─────
im, d = new()
IRON, STONE, STONEHI = (30, 32, 38), (92, 98, 108), (124, 130, 140)


def pillar(x, top=120):
    d.rectangle((x, top, x + 80, 1024), fill=EDGE)
    d.rectangle((x + 5, top + 5, x + 75, 1024), fill=STONE)
    d.rectangle((x + 5, top + 5, x + 24, 1024), fill=STONEHI)
    for y in range(top + 70, 1024, 70):
        d.line([(x + 5, y), (x + 75, y)], fill=EDGE, width=3)
    d.polygon([(x - 6, top), (x + 40, top - 70), (x + 86, top)], fill=IRON)


def net(x0, x1, top=170, bend=False):
    for y in (top, 1000):
        d.rectangle((x0, y - 8, x1, y + 8), fill=IRON)
    step = 70
    for k in range(-20, 40):
        a = x0 + k * step
        pts1 = [(a + t, top + t) for t in (0, 1000 - top)]
        pts2 = [(a + t, 1000 - t + (top - top)) for t in (0, 1000 - top)]
        if bend:
            pts1 = [(px + 40 * math.sin((py - top) / 160), py) for px, py in pts1]
        d.line(pts1, fill=IRON, width=8)
        d.line([(a, 1000), (a + 1000 - top, top)], fill=IRON, width=8)
    # clear what ran outside the panel
    d.rectangle((0, 0, 2048, top - 9), fill=MAG)


x = 20
for w in (300, 480, 640):
    pillar(x)
    x += 80
    x += w
pillar(x)
im2 = im.copy()
# draw the lattice panel by panel into a mask so the lines stop at the pillars
lat = Image.new('L', im.size, 0)
ld = ImageDraw.Draw(lat)
for k in range(-30, 60):
    a = k * 70
    ld.line([(a, 170), (a + 830, 1000)], fill=255, width=8)
    ld.line([(a, 1000), (a + 830, 170)], fill=255, width=8)
ld.rectangle((0, 160, 2048, 178), fill=255)
ld.rectangle((0, 992, 2048, 1008), fill=255)
ld.rectangle((0, 0, 2048, 159), fill=0)
ld.rectangle((0, 1009, 2048, 1024), fill=0)
x = 20
spans = []
for w in (300, 480, 640):
    spans.append((x + 80, x + 80 + w))
    x += 80 + w
keep = Image.new('L', im.size, 0)
kd = ImageDraw.Draw(keep)
for a, b in spans:
    kd.rectangle((a, 0, b, 1024), fill=255)
lat = Image.composite(lat, Image.new('L', im.size, 0), keep)
im = Image.new('RGB', im.size, MAG)
im.paste(IRON, (0, 0), lat)
d = ImageDraw.Draw(im)
x = 20
for w in (300, 480, 640):
    pillar(x)
    x += 80 + w
pillar(x)
# the bent, torn panel (right): its own pillars, the lattice bowed in and broken open in the middle
bx0, bx1 = x + 100, 2028
lat = Image.new('L', im.size, 0)
ld = ImageDraw.Draw(lat)
for k in range(-20, 40):
    a = bx0 - 800 + k * 70
    p1 = [(a + t + 30 * math.sin(t / 120), 170 + t) for t in range(0, 831, 30)]
    p2 = [(a + t + 30 * math.sin(t / 120), 1000 - t) for t in range(0, 831, 30)]
    ld.line(p1, fill=255, width=8)
    ld.line(p2, fill=255, width=8)
ld.rectangle((0, 160, 2048, 178), fill=255)
ld.ellipse((bx0 + 20, 420, bx1 - 20, 760), fill=0)  # torn open
keep = Image.new('L', im.size, 0)
ImageDraw.Draw(keep).rectangle((bx0, 0, bx1, 1024), fill=255)
lat = Image.composite(lat, Image.new('L', im.size, 0), keep)
im.paste(IRON, (0, 0), lat)
im.save(OUT / 'start-1010-net.webp', quality=94)

# ───── 10-10: the thorn hedge ─────
im = Image.new('RGB', (2048, 512), MAG)
d = ImageDraw.Draw(im)
for k in range(26):
    x = k * 64 + rnd.uniform(-20, 20)
    pts = [(x + t, 470 - 260 * math.sin(math.pi * t / 300) - rnd.uniform(0, 30)) for t in range(0, 301, 20)]
    d.line(pts, fill=(18, 16, 20), width=18)
    d.line(pts, fill=(44, 40, 48), width=8)
    for px, py in pts[2:-2:3]:
        a = rnd.uniform(0, 2 * math.pi)
        d.polygon([(px - 8, py), (px + 8, py), (px + 40 * math.cos(a), py - abs(40 * math.sin(a)) - 10)], fill=(20, 18, 22))
d.rectangle((0, 470, 1600, 512), fill=(24, 22, 26))
d.rectangle((1600, 0, 2048, 512), fill=MAG)
for k in range(4):  # the end piece, tapering
    x = 1700 + k * 50
    h = 220 - k * 50
    pts = [(x + t, 470 - h * math.sin(math.pi * t / 160)) for t in range(0, 161, 16)]
    d.line(pts, fill=(18, 16, 20), width=16)
    d.line(pts, fill=(44, 40, 48), width=7)
d.rectangle((1690, 470, 1920, 512), fill=(24, 22, 26))
im.save(OUT / 'start-1010-hedge.webp', quality=94)

# ───── 10-10: rubble and the broken battlement ─────
im, d = new()
for k, (cx, w, h) in enumerate(((220, 360, 180), (640, 260, 120), (1000, 420, 260))):
    for _ in range(int(w * h / 1400)):
        bw, bh = rnd.uniform(40, 90), rnd.uniform(30, 60)
        u = rnd.random()
        x = cx + rnd.uniform(-w / 2, w / 2) * (1 - u * 0.6)
        y = 1000 - u * h
        g = rnd.randint(84, 128)
        d.rounded_rectangle((x - bw / 2, y - bh, x + bw / 2, y), 8, fill=EDGE)
        d.rounded_rectangle((x - bw / 2 + 4, y - bh + 4, x + bw / 2 - 4, y - 4), 6, fill=(g, g + 4, g + 12))
# the battlement: a wall with merlons, the right half broken off jagged
x0, x1, top = 1300, 2000, 420
d.rectangle((x0, top, x1, 1010), fill=EDGE)
d.rectangle((x0 + 6, top + 6, x1 - 6, 1004), fill=(96, 102, 112))
for k in range(4):
    mx = x0 + k * 160
    d.rectangle((mx, top - 110, mx + 100, top + 4), fill=EDGE)
    d.rectangle((mx + 6, top - 104, mx + 94, top + 4), fill=(110, 116, 126))
for y in range(top + 60, 1004, 60):
    off = 40 if (y // 60) % 2 else 0
    d.line([(x0 + 6, y), (x1 - 6, y)], fill=EDGE, width=3)
    for bx in range(x0 + 6 + off, x1, 120):
        d.line([(bx, y - 60), (bx, y)], fill=EDGE, width=3)
jag = [(1620, top - 120)] + [(1620 + k * 40, top - 110 + rnd.uniform(0, 260) + k * 30) for k in range(1, 10)] + [(2048, 700), (2048, 0), (1620, 0)]
d.polygon(jag, fill=MAG)
im.save(OUT / 'start-1010-rubble.webp', quality=94)
print('ok')
