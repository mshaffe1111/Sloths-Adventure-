"""Starts for World 10's grab-bag art (qa-notes/w10/GRAB-BAG.md, 2026-10-31): ONE img2img batch (the lead: all of it on one canvas, so it
shares one painting style), pasted up flat and side-on from the world's own painted pieces where they exist, plain shapes where not.
    python3 -I tools/art/w10/bagstarts.py <out dir>
  start-w10bag-a.webp on magenta, a 3 x 3 grid of 512 px cells:
      0 pulley    a wall bracket with an iron pulley wheel, a chain over it (A chain lifts, B counterweights; 10-8's lift)
      1 weight    an iron counterweight block on a hook (B; 10-8)
      2 cog       a great iron cog wheel, face on, bronze hub (C gear lifts; 10-8's gears)
      3 rack      a dressed stone block on a toothed iron rack (C)
      4 gatehouse Matt's portcullis arch (w10a) with a crenellated top and a little roof of slabs (D drop gates)
      5 grate     the iron floor grate (w10var) swung down open from its hinge (F trapdoors)
      6 barrels   a barrel on its side and one tipping over a bounce (K rolling barrels)
      7 winch     a timber winch drum on an A-frame, chain wound on it, a ratchet wheel with its pawl (the Winch House)
      8 winch-jam the same with a stone jammed in the ratchet
  start-w10bag-b.webp on black (additive light): two lantern beam cones (L) and a gush of storm water from a gargoyle spout, 3 frames (E)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
INK = (24, 22, 30)
IRON = (62, 64, 74)
IRON2 = (96, 98, 110)
BRONZE = (150, 108, 56)
WOOD = (120, 84, 52)
WOOD2 = (150, 110, 70)
STONE = (110, 112, 120)

A = Image.new('RGB', (1536, 1536), MAG)
d = ImageDraw.Draw(A)
cell = lambda i: ((i % 3) * 512, (i // 3) * 512)
w10a = Image.open(ROOT / 'src/assets/w6to10/props-made/w10a.webp').convert('RGBA')
w10b = Image.open(ROOT / 'src/assets/w6to10/props-made/w10b.webp').convert('RGBA')
w10v = Image.open(ROOT / 'src/assets/w6to10/props-made/w10var.webp').convert('RGBA')


def chain(x, y0, y1, w=14):
    y = y0
    k = 0
    while y < y1:
        if k % 2 == 0:
            d.ellipse((x - w // 2, y, x + w // 2, y + 2 * w), outline=INK, width=4, fill=None)
            d.ellipse((x - w // 2 + 3, y + 3, x + w // 2 - 3, y + 2 * w - 3), outline=IRON2, width=2)
        else:
            d.rectangle((x - 2, y - 2, x + 2, y + 2 * w + 2), fill=IRON)
        y += int(1.6 * w)
        k += 1


def wheel(cx, cy, r, spokes=6, teeth=0, rim=IRON, hub=BRONZE):
    if teeth:
        for t in range(teeth):
            a = 2 * math.pi * t / teeth
            pts = []
            for da, rr in ((-0.11, r), (-0.07, r + r * 0.16), (0.07, r + r * 0.16), (0.11, r)):
                pts.append((cx + rr * math.cos(a + da), cy + rr * math.sin(a + da)))
            d.polygon(pts, fill=rim, outline=INK, width=3)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rim, outline=INK, width=5)
    d.ellipse((cx - r * 0.78, cy - r * 0.78, cx + r * 0.78, cy + r * 0.78), fill=(40, 40, 48), outline=INK, width=3)
    for s in range(spokes):
        a = 2 * math.pi * s / spokes + 0.3
        d.line((cx, cy, cx + r * 0.8 * math.cos(a), cy + r * 0.8 * math.sin(a)), fill=rim, width=max(6, int(r * 0.12)))
    d.ellipse((cx - r * 0.22, cy - r * 0.22, cx + r * 0.22, cy + r * 0.22), fill=hub, outline=INK, width=4)
    for b in range(6):
        a = 2 * math.pi * b / 6
        d.ellipse((cx + r * 0.88 * math.cos(a) - 4, cy + r * 0.88 * math.sin(a) - 4, cx + r * 0.88 * math.cos(a) + 4, cy + r * 0.88 * math.sin(a) + 4), fill=IRON2)


def rivets(x0, y0, x1, y1, n=4):
    for i in range(n):
        for (yy) in (y0 + 10, y1 - 10):
            x = x0 + 14 + i * (x1 - x0 - 28) / max(1, n - 1)
            d.ellipse((x - 5, yy - 5, x + 5, yy + 5), fill=IRON2, outline=INK, width=2)


# 0 pulley: a stone corbel on the left, an iron bracket, the wheel, a chain over it down both sides
x, y = cell(0)
d.rectangle((x + 40, y + 70, x + 150, y + 170), fill=STONE, outline=INK, width=5)
d.polygon([(x + 150, y + 100), (x + 290, y + 100), (x + 290, y + 130), (x + 150, y + 150)], fill=IRON, outline=INK)
wheel(x + 300, y + 190, 92, spokes=6)
chain(x + 212, y + 190, y + 500)
chain(x + 388, y + 190, y + 470)
# 1 weight: a riveted iron block on a hook and a short chain
x, y = cell(1)
chain(x + 256, y + 20, y + 170)
d.arc((x + 226, y + 160, x + 286, y + 220), 0, 200, fill=INK, width=10)
d.rounded_rectangle((x + 136, y + 220, x + 376, y + 470), 18, fill=IRON, outline=INK, width=6)
d.rectangle((x + 136, y + 300, x + 376, y + 330), fill=BRONZE, outline=INK, width=3)
rivets(x + 136, y + 220, x + 376, y + 470, 5)
# 2 cog: a great iron cog, face on
x, y = cell(2)
wheel(x + 256, y + 256, 190, spokes=8, teeth=16)
# 3 rack: a stone block on a toothed iron rack running down
x, y = cell(3)
blk = w10v.crop((0, 0, 446, 200)).resize((330, 148))
A.paste(blk, (x + 90, y + 60), blk)
d.rectangle((x + 220, y + 200, x + 292, y + 500), fill=IRON, outline=INK, width=5)
for k in range(10):
    yy = y + 214 + k * 29
    d.polygon([(x + 292, yy), (x + 320, yy + 6), (x + 320, yy + 16), (x + 292, yy + 22)], fill=IRON2, outline=INK)
# 4 gatehouse: Matt's portcullis arch with merlons on top
x, y = cell(4)
arch = w10a.crop((0, 438, 374, 872)).resize((300, 348))
A.paste(arch, (x + 106, y + 150), arch)
stone = w10v.crop((10, 60, 430, 190))
for k in range(4):
    m = stone.resize((70, 70))
    A.paste(m, (x + 106 + k * 77, y + 84), m)
d.rectangle((x + 100, y + 146, x + 412, y + 160), fill=(80, 82, 90), outline=INK, width=3)
# 5 grate: the floor grate swung down from its hinge (left)
x, y = cell(5)
g = w10v.crop((1552, 0, 1990, 83)).resize((360, 68))
d.rectangle((x + 40, y + 150, x + 120, y + 190), fill=STONE, outline=INK, width=4)
gr = g.rotate(-78, expand=True)
A.paste(gr, (x + 108, y + 170), gr)
d.ellipse((x + 106, y + 160, x + 132, y + 186), fill=IRON2, outline=INK, width=3)
# 6 barrels: one on its side, one tipped
x, y = cell(6)
def barrel(cx, cy, w, h, ang):
    im = Image.new('RGBA', (w + 20, h + 20), (0, 0, 0, 0))
    dd = ImageDraw.Draw(im)
    dd.rounded_rectangle((10, 10, w + 10, h + 10), int(h * 0.35), fill=WOOD, outline=INK, width=5)
    for k in range(1, 6):
        xx = 10 + k * w / 6
        dd.line((xx, 14, xx, h + 6), fill=WOOD2, width=3)
    for xx in (10 + w * 0.18, 10 + w * 0.82):
        dd.rectangle((xx - 7, 10, xx + 7, h + 10), fill=IRON, outline=INK, width=2)
    im = im.rotate(ang, expand=True, resample=Image.BICUBIC)
    A.paste(im, (int(cx - im.width / 2), int(cy - im.height / 2)), im)
barrel(x + 150, y + 170, 200, 140, 0)
barrel(x + 350, y + 370, 200, 140, -38)
# 7, 8 winch: an A-frame, a drum with chain, a ratchet wheel and its pawl (8: a stone jammed in the teeth)
for i in (7, 8):
    x, y = cell(i)
    d.polygon([(x + 90, y + 470), (x + 200, y + 150), (x + 230, y + 150), (x + 130, y + 470)], fill=WOOD, outline=INK)
    d.polygon([(x + 420, y + 470), (x + 310, y + 150), (x + 280, y + 150), (x + 380, y + 470)], fill=WOOD, outline=INK)
    d.rectangle((x + 70, y + 460, x + 440, y + 490), fill=WOOD2, outline=INK, width=4)
    d.rounded_rectangle((x + 150, y + 190, x + 360, y + 290), 30, fill=WOOD2, outline=INK, width=5)
    for k in range(7):
        chain(x + 170 + k * 28, y + 196, y + 284, w=10)
    wheel(x + 255, y + 240, 70, spokes=0, teeth=14, rim=IRON, hub=BRONZE)
    d.polygon([(x + 330, y + 120), (x + 350, y + 112), (x + 300, y + 182), (x + 290, y + 172)], fill=IRON2, outline=INK)
    d.line((x + 330, y + 300, x + 420, y + 380), fill=WOOD, width=16)
    d.ellipse((x + 410, y + 370, x + 440, y + 400), fill=WOOD2, outline=INK, width=3)
    if i == 8:
        d.polygon([(x + 300, y + 166), (x + 336, y + 156), (x + 346, y + 186), (x + 312, y + 198)], fill=STONE, outline=INK)
A.save(OUT / 'start-w10bag-a.webp', 'WEBP', quality=95)

# b: on black, additive light: two lantern beams; storm water gushing from a gargoyle spout, three frames
B = Image.new('RGB', (1536, 512), (0, 0, 0))
db = ImageDraw.Draw(B, 'RGBA')
for k, (x0, ang) in enumerate([(30, 0.32), (400, 0.42)]):
    L = Image.new('RGBA', (360, 480), (0, 0, 0, 0))
    dl = ImageDraw.Draw(L)
    for r in range(12, 0, -1):
        a = int(18 + 14 * (12 - r))
        dl.polygon([(40, 30), (40 + 300 * r / 12, 470), (40 - 30 * r / 12, 470)], fill=(255, 214, 140, min(255, a)))
    L = L.filter(ImageFilter.GaussianBlur(10))
    B.paste(L, (x0, 10), L)
spout = Image.open(ROOT / 'src/assets/w6to10/props-made/w10alt.webp').convert('RGBA')
import json
fr = json.loads((ROOT / 'src/assets/w6to10/props-made/w10alt.json').read_text())['frames']['spout-b']
sp = spout.crop((fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h']))
sp.thumbnail((150, 150))
for k in range(3):
    x0 = 780 + k * 250
    B.paste(sp, (x0, 20), sp)
    for s in range(26):
        t = s / 25
        xx = x0 + 120 + 70 * t + 6 * math.sin(s * 1.7 + k)
        yy = 90 + 380 * t * t + 20 * t
        rr = 10 + 22 * t
        db.ellipse((xx - rr, yy - rr * 0.6, xx + rr, yy + rr * 0.6), fill=(180, 210, 235, 150 + int(60 * (1 - t))))
    for s in range(8):
        db.ellipse((x0 + 150 + s * 10 - 30, 470 - (s % 3) * 10, x0 + 190 + s * 10 - 30, 490), fill=(210, 230, 245, 170))
B.save(OUT / 'start-w10bag-b.webp', 'WEBP', quality=95)
print('ok')
