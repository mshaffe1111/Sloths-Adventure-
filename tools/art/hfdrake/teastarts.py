"""Starts for the Drake's teacup ending (9-10, Matt approved 2026-10-30: "a cup, not a punch"; reference/boss-design/9-10-and-10-10.md
on boss-design-9-10, §6 items 4.4 and 7), on magenta, for img2img with the style model:

  start-tea-things.webp  2048 x 1024  his tea things, each separate: six rusty dented tin mugs, his own huge tin mug, a big battered
                                      teapot (top row); his one good china tea set, kept carefully: two cups on saucers and a small pot
                                      (bottom row). The colours are the lair's (lair-drake-calm): soot greys, rust, warm lamp light.
The sitting pose has no start here: it is an edit of his own idle painting (the bucket's stills/w9d-idle.png), in make_spec_drake1.py.
    python3 -I tools/art/hfdrake/teastarts.py <out dir>
"""
import random, sys
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
rnd = random.Random(9)
I = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(I)
EDGE = (34, 26, 22)


def mug(cx, by, w, h, body, hi, rust):
    """a tin mug standing on by: a body, a rim ellipse, a handle on the right, a dent, rust spots"""
    x0, x1, y0 = cx - w // 2, cx + w // 2, by - h
    d.rounded_rectangle((x1 - 8, y0 + h * 0.2, x1 + w * 0.38, y0 + h * 0.72), round(w * 0.16), outline=EDGE, width=max(6, w // 9))
    d.rectangle((x0, y0, x1, by), fill=EDGE)
    d.rectangle((x0 + 5, y0 + 5, x1 - 5, by - 5), fill=body)
    d.rectangle((x0 + 5, y0 + 5, x0 + w * 0.3, by - 5), fill=hi)
    d.ellipse((x0, y0 - h * 0.08, x1, y0 + h * 0.1), fill=EDGE)
    d.ellipse((x0 + 6, y0 - h * 0.06, x1 - 6, y0 + h * 0.07), fill=(60, 48, 40))
    d.ellipse((x0 + w * 0.45, y0 + h * 0.35, x0 + w * 0.75, y0 + h * 0.55), fill=tuple(int(c * 0.75) for c in body))  # a dent
    for _ in range(5):
        rx, ry = rnd.uniform(x0 + 8, x1 - 16), rnd.uniform(y0 + 10, by - 16)
        r = rnd.uniform(4, 10)
        d.ellipse((rx, ry, rx + r * 1.6, ry + r), fill=rust)


TIN = [((128, 122, 112), (170, 164, 150)), ((110, 104, 96), (150, 144, 132)), ((140, 120, 96), (178, 158, 128)),
       ((96, 98, 102), (140, 142, 146)), ((120, 110, 100), (160, 150, 136)), ((104, 96, 84), (146, 136, 118))]
for k, (body, hi) in enumerate(TIN):  # six tin mugs, top left, 190 apart
    cx = 110 + k * 190
    mug(cx, 400, rnd.randint(96, 120), rnd.randint(120, 150), body, hi, (150, 72, 34))
mug(1310, 440, 220, 260, (112, 104, 96), (156, 148, 136), (156, 74, 32))   # his own huge mug
# the battered teapot, top right
d.ellipse((1640, 200, 1960, 450), fill=EDGE)
d.ellipse((1650, 210, 1950, 440), fill=(118, 108, 98))
d.ellipse((1660, 220, 1760, 400), fill=(156, 146, 132))
d.polygon([(1650, 300), (1560, 210), (1575, 196), (1668, 270)], fill=EDGE)        # spout
d.arc((1900, 250, 2010, 400), 270, 90, fill=EDGE, width=16)                          # handle
d.ellipse((1760, 170, 1860, 215), fill=EDGE)                                         # lid
d.ellipse((1795, 150, 1825, 178), fill=EDGE)
d.ellipse((1700, 330, 1760, 370), fill=(88, 80, 72))                                 # a dent
for _ in range(8):
    rx, ry = rnd.uniform(1680, 1920), rnd.uniform(230, 420)
    d.ellipse((rx, ry, rx + 14, ry + 9), fill=(150, 72, 34))
# the good china: two cups on saucers and a small pot, white with a blue band and a gold rim
CH, BAND, GOLD = (244, 240, 230), (74, 104, 170), (214, 170, 70)
for cx in (360, 700):
    d.ellipse((cx - 150, 860, cx + 150, 910), fill=EDGE)
    d.ellipse((cx - 142, 864, cx + 142, 904), fill=CH)
    d.arc((cx - 142, 864, cx + 142, 904), 0, 180, fill=GOLD, width=5)
    d.chord((cx - 110, 700, cx + 110, 900), 0, 180, fill=EDGE)
    d.chord((cx - 102, 708, cx + 102, 892), 0, 180, fill=CH)
    d.rectangle((cx - 102, 780, cx + 102, 800), fill=EDGE)
    d.rectangle((cx - 100, 760, cx + 100, 800), fill=CH)
    d.rectangle((cx - 96, 812, cx + 96, 828), fill=BAND)
    d.ellipse((cx - 110, 744, cx + 110, 784), fill=EDGE)
    d.ellipse((cx - 104, 748, cx + 104, 780), fill=(120, 76, 40))                    # tea in it
    d.arc((cx - 104, 748, cx + 104, 780), 180, 360, fill=GOLD, width=5)
    d.arc((cx + 80, 776, cx + 160, 850), 270, 90, fill=EDGE, width=14)
# the small china pot
d.ellipse((1060, 680, 1340, 900), fill=EDGE)
d.ellipse((1068, 688, 1332, 892), fill=CH)
d.rectangle((1072, 780, 1328, 800), fill=BAND)
d.polygon([(1075, 760), (1000, 690), (1012, 678), (1095, 735)], fill=EDGE)
d.arc((1300, 720, 1390, 840), 270, 90, fill=EDGE, width=14)
d.ellipse((1150, 650, 1250, 695), fill=EDGE)
d.ellipse((1158, 655, 1242, 688), fill=CH)
d.ellipse((1188, 630, 1212, 655), fill=GOLD)
I.save(OUT / 'start-tea-things.webp', quality=94)
print('ok')
