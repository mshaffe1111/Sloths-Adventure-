"""ART-W2B: paste-up starts for 2-6's noria (rim + 6 spokes), its bucket trough and the millrace lip, on flat grey, plus the World 2
style reference (the jetty, ladder and lashed swing frame cut from src/assets/props/w2-props.webp). Run from the repo root:
    python3 -I tools/art/hfw2b/starts.py      -> reference/art/hfw2b/starts/*.png
Geometry is exact (the engine's: 6 spokes at 60 deg, the rim through the bucket floors; the trough 120 x 34 walls + 16 floor at 7x),
the colours are World 2's jetty wood; Qwen-Image-Edit repaints it in the painter's hand."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path('reference/art/hfw2b/starts'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
DARK, MID, LIGHT, PALE = (52, 36, 22), (95, 74, 56), (126, 102, 80), (148, 124, 102)
LINE = (38, 24, 14)

# --- the style reference: World 2's own wood pieces on grey
props = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
ref = Image.new('RGBA', (1024, 1024), GREY + (255,))
for box, at, sc in [((0, 958, 560, 1258), (20, 40), 0.9), ((0, 0, 190, 620), (560, 20), 0.75), ((676, 0, 1024, 380), (20, 380), 1.0),
                    ((1251, 624, 1611, 928), (420, 560), 1.2)]:
    c = props.crop(box)
    c = c.resize((round(c.width * sc), round(c.height * sc)), Image.LANCZOS)
    ref.alpha_composite(c, at)
ref.convert('RGB').save(OUT / 'ref-w2wood.png')

# --- the wheel: rim (two rings of plank felloes), 6 spoke boards, a hub; 1024 px, R (to the bucket floors) = 400 px
S = 1024; C = S / 2; R = 400; RIM = 34
im = Image.new('RGB', (S, S), GREY); d = ImageDraw.Draw(im)
def ring(r0, r1, col, n, seam):
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
        pts = [(C + r * math.cos(a), C + r * math.sin(a)) for r in (r1,) for a in [a0 + (a1 - a0) * t / 12 for t in range(13)]]
        pts += [(C + r0 * math.cos(a), C + r0 * math.sin(a)) for a in [a1 - (a1 - a0) * t / 12 for t in range(13)]]
        d.polygon(pts, fill=col[k % len(col)], outline=LINE)
for k in range(6):  # spokes: a board from the hub to past the rim, pointing at each bucket floor (60 deg apart; bucket 0 at the bottom)
    a = math.pi / 2 + 2 * math.pi * k / 6
    ux, uy = math.cos(a), math.sin(a); px, py = -uy, ux
    w0, w1 = 16, 11
    q = [(C + px * w0, C + py * w0), (C + ux * (R + 8) + px * w1, C + uy * (R + 8) + py * w1),
         (C + ux * (R + 8) - px * w1, C + uy * (R + 8) - py * w1), (C - px * w0, C - py * w0)]
    d.polygon(q, fill=MID, outline=LINE)
    d.line([(C + px * 4, C + py * 4), (C + ux * R + px * 3, C + uy * R + py * 3)], fill=LIGHT, width=3)
ring(R - RIM / 2, R + RIM / 2, [MID, LIGHT, MID, (105, 84, 64)], 12, True)
ring(R - RIM / 2 - 26, R - RIM / 2 - 8, [DARK, MID], 12, True)  # an inner felloe ring
for k in range(6):  # rope lashings where each spoke meets the rim
    a = math.pi / 2 + 2 * math.pi * k / 6
    x, y = C + R * math.cos(a), C + R * math.sin(a)
    d.ellipse([x - 16, y - 16, x + 16, y + 16], fill=(150, 128, 92), outline=LINE)
d.ellipse([C - 46, C - 46, C + 46, C + 46], fill=DARK, outline=LINE, width=3)
d.ellipse([C - 22, C - 22, C + 22, C + 22], fill=(78, 60, 44), outline=LINE, width=3)
im.save(OUT / 'wheel.png')

# --- the bucket trough, side on: 120 px floor x 34 px walls + 16 px floor at 7x (840 x 350), centred on a 1024 x 512 grey canvas
B = Image.new('RGB', (1024, 512), GREY); d = ImageDraw.Draw(B)
x0, x1 = 92, 932; top, floor, bot = 160, 160 + 34 * 7, 160 + 50 * 7  # floor = the platform top (y 398 on the start)
d.rectangle([x0, top, x1, floor], fill=MID, outline=LINE, width=3)  # the back panel (planks)
for k in range(1, 4):
    yy = top + (floor - top) * k / 4
    d.line([(x0, yy), (x1, yy)], fill=LINE, width=3)
d.rectangle([x0 - 6, floor, x1 + 6, bot], fill=DARK, outline=LINE, width=3)  # the floor board, 16 px thick at ship size
d.rectangle([x0 - 10, top - 10, x0 + 52, bot], fill=LIGHT, outline=LINE, width=3)  # end walls
d.rectangle([x1 - 52, top - 10, x1 + 10, bot], fill=LIGHT, outline=LINE, width=3)
for xx in (x0 + 21, x1 - 21):
    for yy in (top + 30, bot - 40):
        d.ellipse([xx - 7, yy - 7, xx + 7, yy + 7], fill=DARK)
d.rectangle([x0 - 14, top + 40, x1 + 14, top + 64], fill=(150, 128, 92), outline=LINE, width=2)  # a rope band round it
B.save(OUT / 'bucket.png')

# --- the millrace lip: a wooden plank channel edge, side on, 1024 x 384 (ship ~ 400 x 150): a plank coping on posts, water behind
M = Image.new('RGB', (1024, 384), GREY); d = ImageDraw.Draw(M)
d.rectangle([0, 150, 1023, 240], fill=(70, 110, 112))  # water in the channel (behind the coping)
d.rectangle([0, 120, 1023, 160], fill=LIGHT, outline=LINE, width=3)  # the coping board
d.rectangle([0, 160, 1023, 300], fill=MID, outline=LINE, width=3)  # the planked side
for k in range(1, 3):
    d.line([(0, 160 + 140 * k / 3), (1023, 160 + 140 * k / 3)], fill=LINE, width=3)
for xx in range(60, 1024, 300):
    d.rectangle([xx, 100, xx + 46, 340], fill=DARK, outline=LINE, width=3)
M.save(OUT / 'lip.png')
print('ok', sorted(p.name for p in OUT.iterdir()))
