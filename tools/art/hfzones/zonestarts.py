"""Start for the World 9 and 10 hazard art (HF shopping list row 11, 2026-10-30): the lava vents and their eruptions (World 9's geyser
zones) and the lightning rods (World 10's bolt zones), which hurt Pokey and were code-drawn (zoneArt.ts drawVent / drawEruption /
drawRod). Plain shapes on magenta, for img2img with the style model (make_spec_zones.py).

  start-zones.webp  2048 x 1024: a lava vent cold-ish and glowing hot (wide crater mouths in black volcanic rock, cracks running out),
                    three frames of a lava fountain shooting up (narrow at the foot, flaring at the top), an iron lightning rod with a
                    dark glass orb and the same rod with its orb charged and crackling, a scorched ground mark
    python3 -I tools/art/hfzones/zonestarts.py <out dir>
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
rnd = random.Random(9)
im = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(im)


def vent(cx, cy, hot):
    # a low crater of black volcanic rock, a mouth of lava, cracks running out
    d.ellipse((cx - 200, cy - 60, cx + 200, cy + 50), fill=(46, 36, 38))
    d.ellipse((cx - 160, cy - 70, cx + 160, cy + 10), fill=(70, 56, 54))
    for k in range(9):
        a = rnd.uniform(-1, 1)
        x = cx + a * 150
        d.polygon([(x - 26, cy - 20), (x + 26, cy - 20), (x + 12, cy - 70 - rnd.uniform(0, 26)), (x - 14, cy - 64)], fill=(58, 46, 46))
    mouth = (255, 200, 80) if hot else (180, 60, 24)
    d.ellipse((cx - 100, cy - 52, cx + 100, cy - 12), fill=(30, 18, 16))
    d.ellipse((cx - 76, cy - 46, cx + 76, cy - 20), fill=mouth)
    for s in (-1, 1):
        d.line((cx + s * 80, cy - 30, cx + s * 150, cy - 8, cx + s * 196, cy - 20), fill=(255, 150, 50) if hot else (150, 50, 20), width=6)


vent(240, 250, False)
vent(720, 250, True)


def fountain(cx, base, h, k):
    # lava shooting up: bright yellow-white at the foot, orange then red flaring and breaking into blobs at the top
    for i in range(40):
        u = i / 39
        y = base - u * h
        w = 34 + 60 * u ** 1.4 + 10 * math.sin(u * 9 + k)
        col = (255, int(240 - 150 * u), int(170 - 160 * u)) if u < 0.9 else (220, 70, 20)
        d.ellipse((cx - w + 6 * math.sin(u * 7 + k), y - 22, cx + w + 6 * math.sin(u * 7 + k), y + 22), fill=col)
    for j in range(8):
        x = cx + rnd.uniform(-110, 110)
        y = base - h - rnd.uniform(0, 70)
        r = rnd.uniform(12, 26)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(240, 110, 30))


for k, cx in enumerate((1120, 1400, 1680)):
    fountain(cx, 980, 760 - k * 60, k)


def rod(cx, base, lit):
    d.rectangle((cx - 40, base - 24, cx + 40, base), fill=(52, 56, 66))           # its iron foot
    d.rectangle((cx - 12, base - 300, cx + 12, base - 20), fill=(96, 100, 112))    # the iron rod
    for y in range(base - 280, base - 30, 46):                                     # copper wire wound round it
        d.line((cx - 16, y, cx + 16, y + 14), fill=(176, 106, 60), width=6)
    d.ellipse((cx - 30, base - 360, cx + 30, base - 300), fill=(210, 240, 255) if lit else (60, 70, 90))
    d.ellipse((cx - 16, base - 350, cx + 4, base - 330), fill=(255, 255, 255) if lit else (120, 130, 150))
    if lit:
        for a in range(8):
            ang = a * math.pi / 4 + 0.3
            d.line((cx + 34 * math.cos(ang), base - 330 + 34 * math.sin(ang), cx + 70 * math.cos(ang + 0.2), base - 330 + 70 * math.sin(ang + 0.2)), fill=(170, 225, 255), width=5)


rod(160, 980, False)
rod(420, 980, True)
# a scorched ground mark where the bolt lands
d.ellipse((600, 900, 960, 990), fill=(40, 40, 50))
d.ellipse((660, 920, 900, 970), fill=(70, 74, 90))
for k in range(10):
    a = k * math.pi / 5
    d.line((780 + 60 * math.cos(a), 945 + 14 * math.sin(a), 780 + 170 * math.cos(a), 945 + 40 * math.sin(a)), fill=(30, 30, 38), width=7)
im.filter(ImageFilter.GaussianBlur(0.8)).save(OUT / 'start-zones.webp', quality=92)
print('ok')
