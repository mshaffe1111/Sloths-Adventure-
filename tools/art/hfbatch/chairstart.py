"""Start strip for 7-3's "ring of chairs" set piece (2026-10-29), for img2img (tools/art/w6to10/img2imggpu.py): 1536 x 416 on flat
magenta. Ten carved stone chairs in a shallow arc (the middle ones a touch smaller, as if further back, every one standing on the floor line), the fourth one
knocked over on its back, each chair side-on and facing the middle of the ring, and an eleventh chair at the right end, plain and smaller. Every chair is pasted up from the World 7 kit's own
stone (the carved 'wall' panel for the backs, the carved 'branch' ledge for the seats and caps, the carved 'wall' panel again for the block legs, 'perch' for the
plain chair) and the kit's 'mossStrip' for a low floor line, so the style model only has to repaint it.
    python3 -I tools/art/hfbatch/chairstart.py <game checkout> <out.webp>
"""
import json, re, sys
from pathlib import Path
from PIL import Image

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
t = (GAME / 'src/game/kitAtlasData.ts').read_text()
F = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', t, re.S).group(1))['7']
KIT = Image.open(GAME / 'src/assets/kits/w7.webp').convert('RGBA')


def piece(n, box=None):
    f = F[n]
    im = KIT.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return im.crop(box) if box else im


def trim(im):
    return im.crop(im.getchannel('A').getbbox())


def rs(im, w, h):
    return im.resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)


W, H = 1536, 416
MAG = (255, 0, 255, 255)
S = Image.new('RGBA', (W, H), MAG)


def chair(k=1.0, plain=False):
    """A carved stone chair seen side-on, facing right, about 116 x 270 px at k=1: a tall carved back slab on the left with a
    capstone, a carved seat ledge, a stone block leg under the front of the seat; feet at the bottom."""
    w, h = round(116 * k), round(270 * k)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    bw = w * 0.3
    if plain:
        back = rs(piece('perch', (20, 200, 140, 460)), bw * 0.9, h * 0.9)
        im.alpha_composite(back, (0, h - back.height))
        seat = rs(trim(piece('boulder')), w, h * 0.12)
    else:
        back = rs(piece('wall', (40, 40, 160, 430)), bw, h * 0.94)
        im.alpha_composite(back, (round(w * 0.02), h - back.height))
        cap = rs(piece('branch', (0, 0, 110, 95)), bw * 1.4, h * 0.06)
        im.alpha_composite(cap, (0, 0))
        seat = rs(piece('branch', (0, 0, 220, 95)), w, h * 0.1)
    sy = round(h * 0.52)
    leg = rs(piece('wall', (250, 250, 400, 430)), w * 0.3, h - sy - seat.height + 8)
    im.alpha_composite(leg, (w - leg.width - round(w * 0.04), h - leg.height))
    im.alpha_composite(seat, (0, sy))
    return im


# floor line: the kit's mossy temple floor edge, across the whole strip
floor = trim(piece('mossStrip'))
fh = 36
fl = rs(floor, floor.width * fh / floor.height, fh)
x = 0
while x < W:
    S.alpha_composite(fl, (x, H - fh))
    x += fl.width - 4
GROUND = H - fh + 12

n = 10
x0, x1 = 72, 1300
for i in range(n):
    u = i / (n - 1)
    arc = 1 - (2 * u - 1) ** 2  # 0 at the ends, 1 in the middle
    k = 1.0 - 0.16 * arc
    cx = x0 + (x1 - x0) * u
    foot = GROUND  # every chair stands on the floor line (a lifted foot reads as floating); the arc is in the sizes only
    c = chair(k)
    if i == 3:  # knocked over backwards: the back slab flat on the floor, seat and leg sticking up
        c = trim(c.rotate(90, expand=True, resample=Image.BICUBIC))
        fallen = (c, (round(cx - 6 - c.width / 2), round(GROUND + 4 - c.height)))  # drawn last, in front of its neighbours
        continue
    elif u > 0.5:  # the right half of the ring faces back to the left, towards the middle
        c = c.transpose(Image.FLIP_LEFT_RIGHT)
    S.alpha_composite(c, (round(cx - c.width / 2), round(foot - c.height)))
S.alpha_composite(*fallen)
c = chair(0.66, plain=True).transpose(Image.FLIP_LEFT_RIGHT)
S.alpha_composite(c, (1430 - c.width // 2, GROUND - c.height))
S.convert('RGB').save(OUT, 'WEBP', quality=92)
print(OUT)
