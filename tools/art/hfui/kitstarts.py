"""Starts for the painted menu kit and the store icon (hf-art-bosses, HF shopping list rows 1 and 4, 2026-10-30): plain shapes in the
game's own CSS colours (index.css .gx-plank, .gx-plank-go, .gx-plank-gold, the parchment panel), the game's own icons (icons/index.tsx,
rendered by tools/art/hfui/iconpng.mjs), and Pokey's own standing picture, on a key colour, for img2img with the style model.

  start-kit-buttons.webp  2048 x 1024  brown, green and gold planks (the button family), a small plank, tab chips (off and on)
  start-kit-panels.webp   2048 x 1024  the parchment card in its wooden frame, the story text box, a stat tile, a slider and knob,
                                       the lock badge, an empty and a full star slot
  start-kit-icons.webp    2048 x 1376  24 icons, 6 x 4, cream glyphs with a dark outline
  start-icon-full.webp    1024 x 1024  the app icon: Pokey's head and shoulders (satchel strap showing) on the title's own forest and sky light
  start-icon-fg.webp      1024 x 1024  the same Pokey alone, on magenta (the adaptive icon's foreground layer)
  start-icon-bg.webp      1024 x 1024  the canopy light alone (the adaptive icon's background layer)
    python3 -I tools/art/hfui/kitstarts.py <game checkout> <icon pngs dir> <title feature render png> <out dir>
"""
import json, math, random, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GAME, ICONS, SQUARE, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4])
OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
rnd = random.Random(30)


def hexc(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


WOODS = {  # (hi, mid, lo, edge) from index.css
    'brown': ('#b5804a', '#8a5628', '#66401c', '#3a2210'),
    'green': ('#7cc35a', '#4f9a39', '#357525', '#1d4a1b'),
    'gold': ('#f0b04a', '#d9822b', '#a85a17', '#4a2208'),
}


def plank(d, x0, y0, x1, y1, wood, r=26):
    hi, mid, lo, edge = (hexc(c) for c in WOODS[wood])
    d.rounded_rectangle((x0, y0, x1, y1), r, fill=edge)
    d.rounded_rectangle((x0 + 8, y0 + 8, x1 - 8, y1 - 8), r - 6, fill=mid)
    d.rounded_rectangle((x0 + 8, y0 + 8, x1 - 8, y0 + 8 + (y1 - y0) * 0.28), r - 6, fill=hi)
    d.rounded_rectangle((x0 + 8, y1 - 8 - (y1 - y0) * 0.22, x1 - 8, y1 - 8), r - 6, fill=lo)
    for k in range(5):  # wood grain
        yy = y0 + 18 + k * (y1 - y0 - 36) / 4 + rnd.uniform(-4, 4)
        pts = [(x, yy + 3 * math.sin(x / 37 + k)) for x in range(int(x0 + 24), int(x1 - 24), 12)]
        d.line(pts, fill=lo, width=3)
    for nx in (x0 + 28, x1 - 28):  # two nails
        cy = (y0 + y1) / 2
        d.ellipse((nx - 9, cy - 9, nx + 9, cy + 9), fill=(70, 60, 55))
        d.ellipse((nx - 5, cy - 6, nx + 3, cy + 2), fill=(150, 140, 130))


# ───── buttons ─────
B = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(B)
plank(d, 40, 40, 960, 220, 'brown')
plank(d, 1080, 40, 2000, 220, 'green')
plank(d, 40, 300, 960, 480, 'gold')
plank(d, 1080, 300, 1560, 420, 'brown', 20)
plank(d, 1080, 470, 1400, 570, 'brown', 18)   # tab chip, off
plank(d, 1480, 470, 1800, 570, 'gold', 18)    # tab chip, on
plank(d, 40, 560, 960, 740, 'green')          # a second green (the pressed look is made in the game by a shade)
plank(d, 1080, 640, 1560, 760, 'green', 20)   # small green
plank(d, 40, 820, 520, 940, 'gold', 20)       # small gold
B.save(OUT / 'start-kit-buttons.webp', quality=92)

# ───── panels and badges ─────
P = Image.new('RGB', (2048, 1024), MAG)
d = ImageDraw.Draw(P)
d.rounded_rectangle((40, 40, 940, 980), 40, fill=hexc('#5a3618'))
d.rounded_rectangle((60, 60, 920, 960), 34, fill=hexc('#8a5628'))
d.rounded_rectangle((90, 90, 890, 930), 24, fill=hexc('#3a2210'))
d.rounded_rectangle((100, 100, 880, 920), 20, fill=hexc('#f3e2bd'))
par = Image.new('L', (780, 820), 0)
ImageDraw.Draw(par).rounded_rectangle((0, 0, 779, 819), 20, outline=255, width=60)
P.paste(hexc('#d9be8c'), (100, 100), par.filter(ImageFilter.GaussianBlur(24)))
for k in range(14):  # frame grain
    y = 70 + k * 64
    d.line((66, y, 84, y + 20), fill=hexc('#66401c'), width=3)
    d.line((896, y, 914, y + 20), fill=hexc('#66401c'), width=3)
# the story text box: dark bark frame round a deep green-black inside
d.rounded_rectangle((1000, 40, 2000, 340), 30, fill=hexc('#3a2210'))
d.rounded_rectangle((1016, 56, 1984, 324), 24, fill=hexc('#8a5628'))
d.rounded_rectangle((1040, 80, 1960, 300), 18, fill=hexc('#14231a'))
for k in range(6):  # a few leaves on its frame
    lx = 1060 + k * 170
    d.ellipse((lx, 30, lx + 60, 70), fill=hexc('#4f9a39'))
# a stat tile
d.rounded_rectangle((1000, 400, 1300, 620), 24, fill=hexc('#3a2210'))
d.rounded_rectangle((1012, 412, 1288, 608), 20, fill=hexc('#5a3618'))
d.rounded_rectangle((1012, 412, 1288, 470), 20, fill=hexc('#6e4522'))
# slider track and knob
d.rounded_rectangle((1000, 700, 1600, 760), 30, fill=hexc('#3a2210'))
d.rounded_rectangle((1010, 710, 1590, 750), 22, fill=hexc('#66401c'))
d.rounded_rectangle((1010, 710, 1350, 750), 22, fill=hexc('#7cc35a'))
d.ellipse((1660, 650, 1820, 810), fill=hexc('#3a2210'))
d.ellipse((1672, 662, 1808, 798), fill=hexc('#d9822b'))
d.ellipse((1690, 672, 1770, 730), fill=hexc('#f0b04a'))
# lock badge
d.ellipse((1360, 400, 1560, 600), fill=hexc('#3a2210'))
d.ellipse((1372, 412, 1548, 588), fill=hexc('#66401c'))
d.rounded_rectangle((1415, 485, 1505, 560), 10, fill=hexc('#d9b26a'))
d.arc((1425, 440, 1495, 520), 180, 360, fill=hexc('#d9b26a'), width=14)
d.ellipse((1452, 507, 1468, 523), fill=hexc('#3a2210'))


def star(cx, cy, r, fill, edge):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=edge)
    inner = [(cx + (x - cx) * 0.82, cy + (y - cy) * 0.82) for x, y in pts]
    d.polygon(inner, fill=fill)


star(1700, 500, 100, hexc('#5a3618'), hexc('#2a170a'))   # an empty star slot
star(1900, 500, 100, hexc('#ffc93c'), hexc('#7a4a0c'))   # a full star
P.save(OUT / 'start-kit-panels.webp', quality=92)

# ───── icons ─────
NAMES = ['play', 'restart', 'map', 'trophy', 'cards', 'book', 'save', 'gear', 'speaker', 'mute', 'cross', 'arrow', 'check', 'lock',
         'star', 'heart', 'medal', 'scroll', 'leaf', 'bulb', 'paw', 'swords', 'expand', 'sloth']
I = Image.new('RGB', (2048, 1376), MAG)
for k, n in enumerate(NAMES):
    ic = Image.open(ICONS / f'{n}.png').convert('RGB')
    I.paste(ic, (24 + (k % 6) * 340, 24 + (k // 6) * 340))
I.save(OUT / 'start-kit-icons.webp', quality=92)
(OUT / 'kit-icons.json').write_text(json.dumps(NAMES))

# ───── the store icon ─────
ref = Image.open(GAME / 'tools/art/hfpokey/starts/ref-stand-satchel.png').convert('RGB')
a = np.asarray(ref).astype(int)
bg = np.median(np.concatenate([a[:4].reshape(-1, 3), a[:, :4].reshape(-1, 3)]), axis=0)
fig = (np.abs(a - bg).max(axis=2) > 24)
from scipy import ndimage
lab, n = ndimage.label(fig)
sizes = ndimage.sum(fig, lab, range(1, n + 1))
fig = lab == (1 + int(np.argmax(sizes)))
fig = ndimage.binary_fill_holes(fig)
alpha = Image.fromarray((fig * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
pokey = ref.convert('RGBA')
pokey.putalpha(alpha)
head = pokey.crop((300, 110, 760, 640)).resize((920, 1060), Image.LANCZOS)  # head and chest, the strap across it
sq = Image.open(SQUARE).convert('RGB')
canopy = sq.crop((sq.width * 0.6, 0, sq.width * 0.98, sq.height * 0.75)).resize((1024, 1024), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6))
glow = Image.new('L', (1024, 1024), 0)
ImageDraw.Draw(glow).ellipse((150, 120, 874, 844), fill=150)
canopy.paste((255, 236, 180), (0, 0), glow.filter(ImageFilter.GaussianBlur(80)))
full = canopy.copy().convert('RGBA')
full.alpha_composite(head, (-30, 110))  # his face in the middle
full.convert('RGB').save(OUT / 'start-icon-full.webp', quality=94)
fg = Image.new('RGBA', (1024, 1024), MAG + (255,))
fg.alpha_composite(head.resize((690, 795), Image.LANCZOS), (100, 175))
fg.convert('RGB').save(OUT / 'start-icon-fg.webp', quality=94)
canopy.save(OUT / 'start-icon-bg.webp', quality=94)
print('ok')
