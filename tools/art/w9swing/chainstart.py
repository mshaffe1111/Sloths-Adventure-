"""Start sheet for World 9's swing chains and room irons (2026-10-29), 1024 x 1024 on flat magenta, for img2img
(tools/art/w6to10/img2imggpu.py, spec from make_spec.py): three long hanging iron chains (each its own link: round, long, heavy), an
iron ore bucket with riveted bands and a bail handle (the chain-lift room's counterweight), an iron pulley in its bracket (the top of
the lift's chain) and an eye bolt (the ring a swing chain hangs from). Plain shapes in the world's iron and basalt greys, lit from the
upper left, so the style model only paints them.
    python3 -I tools/art/w9swing/chainstart.py <out.webp>
"""
import sys
from PIL import Image, ImageDraw

W = H = 1024
S = Image.new('RGB', (W, H), (255, 0, 255))
d = ImageDraw.Draw(S)
INK = (30, 26, 32)
IRON = (74, 69, 82)
HI = (138, 132, 148)
LO = (48, 44, 54)


def link_face(cx, cy, w, h, t):
    """a link seen face on: an oval ring `t` thick"""
    d.ellipse((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill=IRON, outline=INK, width=3)
    d.arc((cx - w / 2 + 3, cy - h / 2 + 3, cx + w / 2 - 3, cy + h / 2 - 3), 150, 260, fill=HI, width=4)
    d.ellipse((cx - w / 2 + t, cy - h / 2 + t, cx + w / 2 - t, cy + h / 2 - t), fill=(255, 0, 255), outline=INK, width=3)


def link_edge(cx, cy, w, h):
    """a link seen edge on: a rounded bar"""
    d.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=w // 2, fill=IRON, outline=INK, width=3)
    d.line((cx - w / 2 + 4, cy - h / 2 + 8, cx - w / 2 + 4, cy + h / 2 - 8), fill=HI, width=3)


def chain(cx, w, h, t, ew):
    y = 30
    k = 0
    while y < H - 40:
        if k % 2 == 0:
            link_face(cx, y + h / 2, w, h, t)
        else:
            link_edge(cx, y + h / 2, ew, h)
        y += h - t - 4
        k += 1


chain(110, 54, 86, 15, 18)
chain(270, 46, 104, 13, 16)
chain(430, 66, 92, 19, 22)

# the ore bucket: a tapered pail, two riveted bands, a bail handle
bx, by = 720, 120
d.arc((bx - 120, by - 70, bx + 120, by + 170), 190, 350, fill=INK, width=12)
d.arc((bx - 120, by - 70, bx + 120, by + 170), 190, 350, fill=IRON, width=7)
d.polygon([(bx - 120, by + 60), (bx + 120, by + 60), (bx + 96, by + 330), (bx - 96, by + 330)], fill=IRON, outline=INK)
d.polygon([(bx - 120, by + 60), (bx - 60, by + 60), (bx - 54, by + 330), (bx - 96, by + 330)], fill=HI)
d.polygon([(bx + 60, by + 60), (bx + 120, by + 60), (bx + 96, by + 330), (bx + 54, by + 330)], fill=LO)
d.ellipse((bx - 122, by + 42, bx + 122, by + 82), fill=LO, outline=INK, width=4)
for yy in (by + 110, by + 280):
    k = (yy - by - 60) / 270
    hw = 120 - 24 * k
    d.rectangle((bx - hw, yy - 9, bx + hw, yy + 9), fill=LO, outline=INK, width=3)
    for xx in range(int(bx - hw + 16), int(bx + hw - 8), 34):
        d.ellipse((xx - 4, yy - 4, xx + 4, yy + 4), fill=HI, outline=INK)
d.ellipse((bx - 130, by + 50, bx - 106, by + 74), fill=IRON, outline=INK, width=3)
d.ellipse((bx + 106, by + 50, bx + 130, by + 74), fill=IRON, outline=INK, width=3)

# the pulley: a spoked wheel in a forked bracket, a hook under it
px, py = 720, 690
d.rectangle((px - 18, py - 190, px + 18, py - 120), fill=IRON, outline=INK, width=3)
d.polygon([(px - 100, py - 120), (px + 100, py - 120), (px + 86, py + 20), (px + 60, py + 20), (px + 60, py - 90), (px - 60, py - 90), (px - 60, py + 20), (px - 86, py + 20)], fill=IRON, outline=INK)
d.ellipse((px - 92, py - 80, px + 92, py + 104), fill=LO, outline=INK, width=4)
d.ellipse((px - 70, py - 58, px + 70, py + 82), fill=IRON, outline=INK, width=3)
for a in range(6):
    import math
    ang = a * math.pi / 3
    d.line((px, py + 12, px + 62 * math.cos(ang), py + 12 + 62 * math.sin(ang)), fill=INK, width=9)
    d.line((px, py + 12, px + 62 * math.cos(ang), py + 12 + 62 * math.sin(ang)), fill=HI, width=4)
d.ellipse((px - 18, py - 6, px + 18, py + 30), fill=HI, outline=INK, width=3)

# the eye bolt: a ring on a short iron plate
ex, ey = 900, 880
d.rectangle((ex - 60, ey - 80, ex + 60, ey - 50), fill=IRON, outline=INK, width=3)
for xx in (ex - 44, ex + 44):
    d.ellipse((xx - 6, ey - 71, xx + 6, ey - 59), fill=HI, outline=INK)
d.rectangle((ex - 10, ey - 50, ex + 10, ey - 20), fill=IRON, outline=INK, width=3)
link_face(ex, ey + 20, 76, 80, 18)
S.save(sys.argv[1], 'WEBP', quality=92)
print(sys.argv[1])
