"""Starts for the boss art batch (hf-art-bosses, 2026-10-29), for img2img (tools/art/w6to10/img2imggpu.py) with the style model.

  lairs   Crocus Rex's Moonlit Mire and the Sky Sovereign's Cloud Aerie, calm and phase 3, 2048 x 1152: each world's own painted far
          backdrop (w2-far, w4mist-far) re-lit for the lair and laid over the code-drawn lair's own layout (rendered from the game by
          tools/art/hfbosses/lairrender.mjs: the moon, the mangroves, the spires sit where the fight expects them), so the model only
          repaints. The tea table queen lair (Silk Hollow) already has Matt's painted plates (w6to10/lairs/lair-queen-*), so none here.
  fg      a foreground strip per new lair, 2048 x 512 on magenta: hanging moss on top and reeds below (Mire); wind-bent grass, stones and
          feathers below (Aerie).
  marker  the one warning marker every boss uses, 1536 x 1024 on green: a ground ring, a "get out" arrow, a "lands here" arrow and the
          Prowler's dash trail.
  fx-*    an effects sheet per boss that throws something (Crocus Rex, the Sky Sovereign, the Tarantula Queen), 1536 x 1024.
  dust, spark  AN-5's two small strips: an 8-frame dust puff and a 6-frame hit spark, 2048 x 256 / 1536 x 256 on magenta.

    python3 -I tools/art/hfbosses/bossstarts.py <game checkout> <code lair renders dir> <out dir>
"""
import math, random, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GAME, REN, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
OUT.mkdir(parents=True, exist_ok=True)
BD = GAME / 'src/assets/backdrops'
MAG = (255, 0, 255)
GRN = (0, 255, 0)
W, H = 2048, 1152


def grade(im, mul, add=(0, 0, 0)):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    a = a * np.array(mul) + np.array(add)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def plate(far, mul, add, sky_top, code, mix):
    """the painted far backdrop scaled to the plate's width and set at its bottom, the sky above it carried up from its own top rows,
    re-lit, then the code lair laid over at `mix`"""
    f = Image.open(BD / far).convert('RGB')
    f = f.resize((W, round(f.height * W / f.width)), Image.LANCZOS)
    base = Image.new('RGB', (W, H), sky_top)
    top = H - f.height
    # the sky: a stretch of the painting's own top band, so it has its clouds' texture
    band = f.crop((0, 0, W, 120)).resize((W, top + 120), Image.LANCZOS)
    base.paste(band, (0, 0))
    base.paste(f, (0, top))
    base = grade(base, mul, add)
    c = Image.open(REN / code).convert('RGB').resize((W, H))
    return Image.blend(base, c, mix)


def moon(im, x, y, r):
    d = ImageDraw.Draw(im)
    for k in range(10, 0, -1):
        rr = r * (1 + k * 0.35)
        col = (30 + 6 * (10 - k), 60 + 8 * (10 - k), 90 + 10 * (10 - k))
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=col)
    d.ellipse((x - r, y - r, x + r, y + r), fill=(236, 240, 228))
    for dx, dy, rr in ((-14, -10, 10), (16, 8, 7), (-4, 18, 6)):
        d.ellipse((x + dx - rr, y + dy - rr, x + dx + rr, y + dy + rr), fill=(200, 208, 200))


# ───── lairs ─────
calm = plate('w2-far.webp', (0.22, 0.36, 0.55), (4, 10, 22), (6, 12, 28), 'code-croc-p1.png', 0.35)
moon(calm, 1500, 210, 62)
d = ImageDraw.Draw(calm)
rnd = random.Random(3)
for i in range(70):  # the moon's road on the river
    x = 1500 + rnd.uniform(-160, 160) * (0.4 + i / 70)
    y = 760 + i * 3.2
    d.rectangle((x - 18, y, x + 18, y + 2), fill=(170, 205, 215))
d.ellipse((560, 610, 600, 650), fill=(255, 210, 110))  # one warm lantern on a far post
calm.save(OUT / 'start-lair-croc-calm.webp', quality=92)

rage = grade(calm, (0.8, 0.85, 0.95))
d = ImageDraw.Draw(rage)
for i in range(16):  # pairs of eyes on the water
    x, y = rnd.uniform(120, 1920), rnd.uniform(800, 900)
    for dx in (-9, 9):
        d.ellipse((x + dx - 5, y - 3, x + dx + 5, y + 3), fill=(255, 196, 40))
for i in range(90):  # the river churning white where it floods
    x, y = rnd.uniform(0, W), rnd.uniform(790, 940)
    d.arc((x - 40, y - 10, x + 40, y + 10), 200, 340, fill=(200, 235, 235), width=3)
rage.save(OUT / 'start-lair-croc-rage.webp', quality=92)

sc = plate('w4mist-far.webp', (1.0, 0.95, 0.98), (0, 0, 0), (60, 40, 90), 'code-sovereign-p1.png', 0.25)
sc.save(OUT / 'start-lair-sov-calm.webp', quality=92)
sr = plate('w4mist-far.webp', (0.42, 0.36, 0.62), (14, 6, 30), (30, 18, 50), 'code-sovereign-p3.png', 0.3)
d = ImageDraw.Draw(sr)
for bx in (520, 1380):  # lightning behind the spires
    pts = [(bx, 0)]
    x, y = bx, 0
    while y < 620:
        x += rnd.uniform(-60, 60); y += rnd.uniform(50, 90)
        pts.append((x, y))
    d.line(pts, fill=(240, 236, 255), width=9)
for i in range(260):  # slanting rain
    x, y = rnd.uniform(0, W + 200), rnd.uniform(0, H)
    d.line((x, y, x - 22, y + 60), fill=(150, 150, 200), width=2)
sr.save(OUT / 'start-lair-sov-rage.webp', quality=92)

# ───── foreground strips ─────
fg = Image.new('RGB', (W, 512), MAG)
d = ImageDraw.Draw(fg)
for i in range(30):  # hanging moss and mangrove leaves along the top
    x = i * 70 + rnd.uniform(-20, 20)
    ln = rnd.uniform(60, 190)
    d.polygon([(x - 26, 0), (x + 26, 0), (x + 8, ln * 0.6), (x + rnd.uniform(-10, 10), ln), (x - 8, ln * 0.6)], fill=(16, 44, 52))
    d.polygon([(x - 14, 0), (x + 10, 0), (x, ln * 0.7)], fill=(40, 84, 86))
d.rectangle((0, 0, W, 26), fill=(10, 30, 36))
for i in range(60):  # reeds and a few cattails along the bottom
    x = i * 35 + rnd.uniform(-12, 12)
    hh = rnd.uniform(60, 150)
    lean = rnd.uniform(-18, 18)
    d.polygon([(x - 7, 512), (x + 7, 512), (x + lean, 512 - hh)], fill=(14, 40, 44))
    if i % 7 == 0:
        d.ellipse((x + lean - 6, 512 - hh - 4, x + lean + 6, 512 - hh + 34), fill=(70, 46, 30))
for i in range(5):  # lily pads
    x = 150 + i * 420 + rnd.uniform(-60, 60)
    d.ellipse((x - 50, 488, x + 50, 508), fill=(36, 86, 70))
fg.save(OUT / 'start-fg-croc.webp', quality=92)

fs = Image.new('RGB', (W, 512), MAG)
d = ImageDraw.Draw(fs)
for i in range(10):  # cliff-edge stones
    x = i * 220 + rnd.uniform(-40, 40)
    r = rnd.uniform(40, 80)
    d.ellipse((x - r, 512 - r * 1.2, x + r, 512 + r * 0.6), fill=(96, 80, 96))
    d.ellipse((x - r * 0.7, 512 - r * 1.15, x + r * 0.3, 512 - r * 0.5), fill=(140, 116, 124))
for i in range(80):  # grass blown to the left by the wind
    x = i * 26 + rnd.uniform(-10, 10)
    hh = rnd.uniform(50, 150)
    d.polygon([(x - 5, 512), (x + 5, 512), (x - hh * 0.45, 512 - hh)], fill=(150, 120, 70) if i % 3 else (110, 120, 70))
for i in range(4):  # loose feathers caught in the grass
    x, y = 300 + i * 480, 400 + rnd.uniform(-20, 20)
    d.ellipse((x - 40, y - 9, x + 40, y + 9), fill=(70, 66, 80))
    d.line((x - 44, y, x + 44, y), fill=(200, 196, 210), width=3)
fs.save(OUT / 'start-fg-sov.webp', quality=92)

# ───── the warning marker (green key: it is red) ─────
mk = Image.new('RGB', (1536, 1024), GRN)
d = ImageDraw.Draw(mk)
cx, cy = 768, 260  # the ground ring, seen low from the side: a wide ellipse of glowing red cracks
d.ellipse((cx - 640, cy - 150, cx + 640, cy + 150), fill=(150, 30, 26))
for k, col in ((0, (110, 16, 16)), (1, (210, 40, 30)), (2, (255, 120, 40)), (3, (255, 210, 120))):
    rx, ry = 640 - k * 60, 150 - k * 16
    d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline=col, width=34 - k * 6)
d.ellipse((cx - 420, cy - 84, cx + 420, cy + 84), fill=(150, 30, 26))
for i in range(14):  # cracks out from the middle
    a = i / 14 * math.tau
    d.line((cx, cy, cx + math.cos(a) * 560, cy + math.sin(a) * 130), fill=(255, 170, 70), width=7)
d.ellipse((cx - 120, cy - 26, cx + 120, cy + 26), fill=(255, 230, 160))
# the "get out this way" arrow, pointing right
ax, ay = 380, 720
d.polygon([(ax - 220, ay - 50), (ax + 40, ay - 50), (ax + 40, ay - 120), (ax + 220, ay), (ax + 40, ay + 120), (ax + 40, ay + 50),
           (ax - 220, ay + 50)], fill=(240, 60, 40), outline=(60, 10, 10), width=12)
d.polygon([(ax - 200, ay - 36), (ax + 50, ay - 36), (ax + 50, ay - 90), (ax + 180, ay - 8)], fill=(255, 190, 120))
# the "lands here" arrow, pointing down
bx, by = 1130, 700
d.polygon([(bx - 60, by - 240), (bx + 60, by - 240), (bx + 60, by - 40), (bx + 140, by - 40), (bx, by + 120), (bx - 140, by - 40),
           (bx - 60, by - 40)], fill=(240, 60, 40), outline=(60, 10, 10), width=12)
d.polygon([(bx - 46, by - 226), (bx - 10, by - 226), (bx - 10, by - 30), (bx - 110, by - 30)], fill=(255, 190, 120))
# the Prowler's dash trail: claw-scratch streaks glowing along the ground
for k in range(3):
    y = 930 + k * 22
    d.polygon([(60, y + 6), (1480, y - 8), (1480, y + 4), (60, y + 12)], fill=(255, 90, 60) if k != 1 else (255, 210, 140))
mk.save(OUT / 'start-marker.webp', quality=92)

# ───── effects sheets ─────
cr = Image.new('RGB', (1536, 1024), MAG)
d = ImageDraw.Draw(cr)
# (a) the flood: a long band of dark river water with a foam crest (cut into a strip that tiles)
for x in range(0, 1536, 4):
    y = 150 + 10 * math.sin(x * 0.03) + 6 * math.sin(x * 0.011)
    d.line((x, y, x, 330), fill=(40, 110, 108), width=5)
    d.line((x, y, x, y + 14), fill=(200, 240, 230), width=5)
d.rectangle((0, 300, 1536, 330), fill=(16, 48, 50))
# (b) a piranha, side on, facing right
px, py = 330, 600
d.ellipse((px - 150, py - 90, px + 150, py + 90), fill=(96, 110, 130), outline=(20, 24, 30), width=8)
d.chord((px - 140, py - 20, px + 140, py + 90), 0, 180, fill=(220, 70, 60))
d.polygon([(px - 140, py), (px - 260, py - 90), (px - 260, py + 90)], fill=(70, 80, 100), outline=(20, 24, 30), width=8)
d.ellipse((px + 60, py - 40, px + 96, py - 4), fill=(250, 240, 180))
d.polygon([(px + 90, py + 30), (px + 150, py + 20), (px + 140, py + 50)], fill=(250, 250, 250))
# (c) the mud wave the death roll throws: a curling wall of brown mud
wx, wy = 1050, 760
d.pieslice((wx - 260, wy - 320, wx + 260, wy + 200), 180, 360, fill=(122, 92, 52), outline=(40, 26, 10), width=8)
d.pieslice((wx - 180, wy - 240, wx + 120, wy + 40), 200, 340, fill=(160, 122, 72))
d.rectangle((wx - 300, wy - 60, wx + 300, wy + 10), fill=(100, 72, 40))
# (d) a splash
for i in range(9):
    a = math.pi * (0.1 + 0.8 * i / 8)
    d.ellipse((520 + math.cos(a) * 150 - 24, 920 - math.sin(a) * 160 - 24, 520 + math.cos(a) * 150 + 24, 920 - math.sin(a) * 160 + 24),
              fill=(180, 230, 225))
cr.save(OUT / 'start-fx-croc.webp', quality=92)

sv = Image.new('RGB', (1536, 1024), GRN)
d = ImageDraw.Draw(sv)
for i in range(4):  # (a) a bank of storm cloud, low and long
    x = 200 + i * 300
    d.ellipse((x - 190, 90, x + 190, 330), fill=(52, 40, 92), outline=(14, 8, 30), width=8)
    d.ellipse((x - 120, 100, x + 80, 220), fill=(110, 92, 168))
# (b) a fork of lightning
pts = [(330, 430), (290, 560), (360, 590), (300, 760), (380, 790), (320, 960)]
d.line(pts, fill=(246, 240, 255), width=26)
d.line(pts, fill=(190, 170, 255), width=8)
# (c) a golden feather, flying right
fx, fy = 900, 600
d.ellipse((fx - 230, fy - 60, fx + 230, fy + 60), fill=(240, 190, 80), outline=(90, 50, 10), width=8)
d.line((fx - 260, fy, fx + 230, fy), fill=(120, 60, 10), width=8)
# (d) a gust: swept streaks of wind
for k in range(5):
    y = 830 + k * 30
    d.arc((560 + k * 30, y - 60, 1460 - k * 40, y + 60), 200, 340, fill=(230, 246, 255), width=14 - k)
sv.save(OUT / 'start-fx-sov.webp', quality=92)

qu = Image.new('RGB', (1536, 1024), MAG)
d = ImageDraw.Draw(qu)
cx, cy = 230, 230  # (a) a silk ball in flight
d.ellipse((cx - 160, cy - 160, cx + 160, cy + 160), fill=(228, 232, 240), outline=(60, 66, 84), width=8)
for i in range(8):
    a = i / 8 * math.tau
    d.line((cx, cy, cx + math.cos(a) * 190, cy + math.sin(a) * 190), fill=(150, 158, 180), width=6)
cx, cy = 760, 300  # (b) the web it leaves stuck on the floor: a flat splat of silk
d.ellipse((cx - 300, cy - 60, cx + 300, cy + 60), fill=(220, 226, 236), outline=(60, 66, 84), width=8)
for i in range(12):
    a = i / 12 * math.tau
    d.line((cx, cy, cx + math.cos(a) * 300, cy + math.sin(a) * 60), fill=(140, 148, 170), width=5)
cx, cy = 1300, 300  # (c) a cocoon on its thread
d.line((cx, 0, cx, cy - 170), fill=(220, 226, 236), width=5)
d.ellipse((cx - 90, cy - 170, cx + 90, cy + 170), fill=(200, 204, 214), outline=(40, 44, 60), width=8)
for k in range(-3, 4):
    d.arc((cx - 90, cy + k * 44 - 20, cx + 90, cy + k * 44 + 20), 0, 180, fill=(110, 116, 136), width=5)
# (d) her venom jet: a long spray of green venom, thick at her mouth (left), breaking into droplets at the end
for x in range(60, 1300, 6):
    th = 70 - x * 0.03 + 8 * math.sin(x * 0.05)
    d.line((x, 720 - th / 2, x, 720 + th / 2), fill=(150, 210, 50), width=7)
    d.line((x, 720 - th / 4, x, 720 - th / 8), fill=(220, 250, 150), width=7)
for i in range(14):
    x = 1300 + i * 16 + rnd.uniform(-10, 10)
    y = 720 + rnd.uniform(-50, 50)
    d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=(150, 210, 50))
# (e) a ripple of silk along the floor
for k in range(4):
    d.arc((200 + k * 60, 860, 1300 - k * 60, 1040), 190, 350, fill=(230, 232, 240), width=12)
qu.save(OUT / 'start-fx-queen.webp', quality=92)

# ───── AN-5 strips ─────
du = Image.new('RGB', (2048, 256), MAG)
d = ImageDraw.Draw(du)
for f in range(8):  # a puff of dust: a low burst, growing, thinning, breaking up
    u = f / 7
    x0 = f * 256 + 128
    for k in range(5):
        r = (24 + 52 * u ** 0.7) * (0.6 + 0.12 * k)
        dx = (k - 2) * (6 + 14 * u)
        y = 200 - r * 0.6 - k % 2 * 12 * u
        shade = (186, 160, 120) if k % 2 else (214, 192, 152)
        if u > 0.75 and k % 2:
            continue
        d.ellipse((x0 + dx - r, y - r * 0.8, x0 + dx + r, y + r * 0.8), fill=shade, outline=(110, 90, 60), width=4)
du.save(OUT / 'start-dust.webp', quality=92)

sp = Image.new('RGB', (1536, 256), MAG)
d = ImageDraw.Draw(sp)
for f in range(6):  # a hit spark: a star that bursts out, then breaks into rays and fades
    u = f / 5
    cx, cy = f * 256 + 128, 128
    R = 40 + 70 * min(1, u * 1.6)
    pts = []
    for i in range(16):
        a = i / 16 * math.tau
        r = R if i % 2 == 0 else R * (0.35 + 0.2 * u)
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    if u < 0.8:
        d.polygon(pts, fill=(255, 236, 140), outline=(200, 120, 20))
        d.ellipse((cx - R * 0.3, cy - R * 0.3, cx + R * 0.3, cy + R * 0.3), fill=(255, 255, 240))
    else:
        for i in range(0, 16, 2):
            a = i / 16 * math.tau
            d.line((cx + math.cos(a) * R * 0.6, cy + math.sin(a) * R * 0.6, cx + math.cos(a) * R, cy + math.sin(a) * R),
                   fill=(255, 220, 120), width=8)
sp.save(OUT / 'start-spark.webp', quality=92)
print('ok')
