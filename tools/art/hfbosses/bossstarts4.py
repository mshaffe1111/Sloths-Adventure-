"""Starts for round 4 of the boss art batch (hf-art-bosses, 2026-10-29): plain shapes (and the kit's own painted sign) on a key colour,
for img2img with the style model (make_spec4.py):
  start-fg-moss.webp     2048 x 384  the Mire's hanging moss: a mangrove branch along the top with ragged curtains of Spanish moss (the
                                     round-1 fringe read as teal icicles)
  start-croc-props.webp  2048 x 1024 Crocus Rex's bank props: a half-sunk rowboat with a broken oar, the water sign with a red "no" ring
                                     and a bite out of its corner, a heap of old helmets with a bucket and bones, two cattail clumps
  start-fx3.webp         2048 x 1024 three pale pennant cloths (tinted in the game), a pennant pole, the Sky Sovereign's screech wave,
                                     the weak-point ring
    python3 -I tools/art/hfbosses/bossstarts4.py <game checkout> <out dir>
"""
import math, random, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
rnd = random.Random(4)

# ───── the hanging moss ─────
W, H = 2048, 384
m = Image.new('RGB', (W, H), MAG)
d = ImageDraw.Draw(m)
# the branch: a gnarled limb along the top, thicker and thinner, with knots
pts = [(x, 18 + 10 * math.sin(x / 170) + 6 * math.sin(x / 47)) for x in range(-20, W + 40, 20)]
for i in range(len(pts) - 1):
    (x0, y0), (x1, y1) = pts[i], pts[i + 1]
    th = 22 + 8 * math.sin(x0 / 260)
    d.polygon([(x0, y0 - th / 2), (x1, y1 - th / 2), (x1, y1 + th / 2), (x0, y0 + th / 2)], fill=(52, 40, 34))
    d.line((x0, y0 - th / 2 + 4, x1, y1 - th / 2 + 4), fill=(92, 78, 64), width=3)
d.rectangle((0, 0, W, 8), fill=(52, 40, 34))
# moss curtains: bunches of thin wavy strands, ragged bottoms, grey-green with lighter tips; never a point
x = 10
while x < W - 10:
    cw = rnd.uniform(60, 150)
    ln = rnd.uniform(90, 300)
    base = 18 + 10 * math.sin(x / 170)
    for s in range(int(cw / 5)):
        sx = x + s * 5 + rnd.uniform(-2, 2)
        sl = ln * (0.55 + 0.45 * math.sin(math.pi * (s * 5) / cw)) * rnd.uniform(0.75, 1.1)
        col = rnd.choice([(74, 98, 84), (92, 118, 98), (60, 84, 74), (110, 134, 110)])
        prev = (sx, base + 8)
        for k in range(1, 12):
            u = k / 11
            p = (sx + 6 * math.sin(u * 7 + s) + u * 8, base + 8 + u * sl)
            d.line((prev, p), fill=col, width=max(2, round(5 * (1 - u * 0.7))))
            prev = p
    # a few leaves at the branch
    for k in range(3):
        lx = x + rnd.uniform(0, cw)
        d.ellipse((lx - 16, base + 6, lx + 16, base + 22), fill=(36, 70, 52))
    x += cw * rnd.uniform(0.7, 1.3) + rnd.uniform(10, 70)
m.filter(ImageFilter.GaussianBlur(0.6)).save(OUT / 'start-fg-moss.webp', quality=92)

# ───── Crocus Rex's bank props ─────
P = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(P)
# a rowboat half sunk, tilted, a split plank, a broken oar sticking up (box 0..1024 x 0..512)
cx, cy = 480, 330
hull = [(cx - 330, cy - 120), (cx - 250, cy + 40), (cx, cy + 70), (cx + 260, cy + 40), (cx + 360, cy - 150), (cx + 300, cy - 150),
        (cx + 210, cy - 40), (cx, cy - 30), (cx - 220, cy - 40), (cx - 280, cy - 125)]
d.polygon(hull, fill=(96, 64, 40), outline=(30, 20, 12))
for k in range(3):
    yy = cy - 10 + k * 26
    d.line((cx - 260 + k * 20, yy - 40, cx + 260 - k * 10, yy - 40), fill=(64, 42, 26), width=5)
d.polygon([(cx - 60, cy - 30), (cx - 20, cy + 60), (cx + 10, cy - 30)], fill=(40, 26, 16))  # the split
d.line((cx + 120, cy - 30, cx + 300, cy - 300), fill=(120, 86, 52), width=22)  # the oar, snapped
d.polygon([(cx + 290, cy - 290), (cx + 320, cy - 330), (cx + 300, cy - 270)], fill=(120, 86, 52))
d.rectangle((cx - 380, cy + 50, cx + 400, cy + 120), fill=(58, 44, 34))  # the mud it sits in
for k in range(10):
    mx = cx - 360 + k * 80
    d.ellipse((mx - 50, cy + 30, mx + 50, cy + 80), fill=(66, 50, 38))

# the sign: the water kit's own wooden wave sign, with a red "no" ring over the wave and a bite out of its corner (box 1024..1536 x 0..512)
ws = Image.open(GAME / 'src/assets/props/water-signs.webp').convert('RGBA')
sign = ws.crop((520, 0, 790, 360))
sign = sign.resize((sign.width * 13 // 10, sign.height * 13 // 10), Image.LANCZOS)
holes = ndimage.binary_fill_holes(np.asarray(sign)[..., 3] > 128) & (np.asarray(sign)[..., 3] <= 128)  # the wave's open spots
sign.paste((236, 246, 250, 255), mask=Image.fromarray((holes * 255).astype(np.uint8)))
sx, sy = 1120, 20
P.paste(sign, (sx, sy), sign)
d.ellipse((sx + 75, sy + 75, sx + 275, sy + 260), outline=(200, 30, 30), width=20)
d.line((sx + 105, sy + 105, sx + 245, sy + 235), fill=(200, 30, 30), width=20)
d.ellipse((sx + 300, sy + 20, sx + 380, sy + 100), fill=MAG)  # the bite
for k in range(4):
    d.polygon([(sx + 304 + k * 18, sy + 64), (sx + 313 + k * 18, sy + 40), (sx + 322 + k * 18, sy + 64)], fill=MAG)

# a heap of old helmets with a rusty bucket and two bones (box 0..1024 x 512..1024)
hx, hy = 470, 930
d.ellipse((hx - 380, hy - 40, hx + 380, hy + 40), fill=(66, 50, 38))
for i, (ox, oy, col) in enumerate([(-250, 0, (120, 120, 128)), (-120, -10, (140, 116, 84)), (10, 0, (110, 114, 122)),
                                     (140, -6, (132, 108, 80)), (-60, -90, (128, 128, 136)), (80, -84, (118, 98, 74))]):
    x0, y0 = hx + ox, hy + oy
    d.chord((x0 - 70, y0 - 110, x0 + 70, y0 + 10), 180, 360, fill=col, outline=(30, 30, 34), width=5)
    d.rectangle((x0 - 74, y0 - 52, x0 + 74, y0 - 40), fill=tuple(c - 30 for c in col))
    d.rectangle((x0 - 30, y0 - 34, x0 + 30, y0 - 26), fill=(30, 30, 34))
d.polygon([(hx + 230, hy - 150), (hx + 360, hy - 150), (hx + 340, hy + 10), (hx + 250, hy + 10)], fill=(150, 84, 46), outline=(40, 24, 14))
d.ellipse((hx + 230, hy - 168, hx + 360, hy - 134), fill=(90, 50, 28), outline=(40, 24, 14), width=4)
for bx, by, rot in [(-330, -30, 0.2), (300, 20, -0.15)]:
    x0, y0 = hx + bx, hy + by
    dx, dy = 70 * math.cos(rot), 70 * math.sin(rot)
    d.line((x0 - dx, y0 - dy, x0 + dx, y0 + dy), fill=(232, 226, 210), width=16)
    for e in (-1, 1):
        d.ellipse((x0 + e * dx - 16, y0 + e * dy - 16, x0 + e * dx + 16, y0 + e * dy + 16), fill=(232, 226, 210))

# two cattail clumps (boxes 1024..1536 and 1536..2048 x 512..1024)
for k, ox in enumerate((1280, 1790)):
    gy = 1000
    for i in range(9 + k * 3):
        bx = ox + rnd.uniform(-150, 150)
        h = rnd.uniform(220, 440)
        lean = rnd.uniform(-50, 50)
        d.line((bx, gy, bx + lean, gy - h), fill=(32, 70, 50), width=8)
        if i % 2 == 0:
            d.rounded_rectangle((bx + lean - 13, gy - h - 6, bx + lean + 13, gy - h + 70), 12, fill=(110, 66, 36))
    for i in range(16):
        bx = ox + rnd.uniform(-170, 170)
        h = rnd.uniform(100, 260)
        lean = rnd.uniform(-90, 90)
        d.polygon([(bx - 10, gy), (bx + 10, gy), (bx + lean, gy - h)], fill=(44, 92, 62))
P.save(OUT / 'start-croc-props.webp', quality=92)

# ───── pennants, pole, screech wave, weak-point ring ─────
F = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(F)
# three pale cloth pennants, three tails each, streaming right with a ripple (rows at y 20..300)
for k in range(3):
    x0, y0 = 40 + k * 610, 50
    for t in range(3):
        ty = y0 + t * 70
        ln = 470 + rnd.uniform(-40, 40) - t * 30
        top = [(x0 + u * ln, ty + 16 * math.sin(u * 6 + k + t) * u + u * 20) for u in [i / 20 for i in range(21)]]
        bot = [(x0 + u * ln, ty + 64 * (1 - u * 0.75) + 16 * math.sin(u * 6 + k + t) * u + u * 20) for u in [i / 20 for i in range(20, -1, -1)]]
        d.polygon(top + bot, fill=(236, 226, 206), outline=(70, 56, 46))
        for u in (0.3, 0.6):
            px = x0 + u * ln
            d.line((px, ty + 20, px - 6, ty + 50), fill=(196, 182, 160), width=4)
    d.rectangle((x0 - 14, y0 - 10, x0 + 6, y0 + 220), fill=(196, 160, 90))  # the hem the pole goes through
# the pole: a tall wooden staff with a gold knob, standing at the right (x 1940..2000, y 20..1000)
d.rectangle((1956, 70, 1984, 1000), fill=(92, 62, 40), outline=(30, 20, 12), width=4)
d.ellipse((1944, 24, 1996, 80), fill=(232, 190, 90), outline=(80, 56, 20), width=4)
for yy in range(160, 1000, 180):
    d.line((1956, yy, 1984, yy + 10), fill=(60, 40, 24), width=4)
# the screech wave: a curved band of white-cyan sound and wind, tapered at both ends, with swirls (y 360..560, x 40..1480)
for i in range(60):
    u = i / 59
    x = 40 + u * 1440
    th = 90 * math.sin(math.pi * u) ** 0.7 + 4
    yc = 470
    d.ellipse((x - 18, yc - th / 2, x + 18, yc + th / 2), fill=(170, 226, 248))
for i in range(40):
    u = i / 39
    x = 40 + u * 1440
    th = 46 * math.sin(math.pi * u) ** 0.7 + 2
    d.ellipse((x - 12, 470 - th / 2 - 8, x + 12, 470 + th / 2 - 8), fill=(244, 252, 255))
for k in range(9):
    x = 160 + k * 150
    d.arc((x - 50, 420, x + 50, 520), 200, 340, fill=(120, 196, 236), width=8)
# the weak-point ring: a golden glowing ring of light with four short rays pointing in (x 560..940, y 620..1000)
rx, ry, rr = 760, 810, 170
d.ellipse((rx - rr, ry - rr, rx + rr, ry + rr), outline=(255, 214, 90), width=34)
d.ellipse((rx - rr + 10, ry - rr + 10, rx + rr - 10, ry + rr - 10), outline=(255, 250, 220), width=12)
for a in range(4):
    ang = a * math.pi / 2
    c, s = math.cos(ang), math.sin(ang)
    tip = (rx + c * 70, ry + s * 70)
    b1 = (rx + c * 200 - s * 26, ry + s * 200 + c * 26)
    b2 = (rx + c * 200 + s * 26, ry + s * 200 - c * 26)
    d.polygon([tip, b1, b2], fill=(255, 236, 150), outline=(200, 120, 30))
F.save(OUT / 'start-fx3.webp', quality=92)
print('ok')
