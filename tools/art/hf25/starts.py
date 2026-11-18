"""ENG-25: the snap stone's img2img start (2-5.md "Art": SHUT, OPEN-1, OPEN-2, OPEN-3 on one sheet), from World 2's own shipped stone.

    python3 -I tools/art/hf25/starts.py      -> reference/art/hf25/starts/snapstone.png (1792x320, flat magenta)

Each of the four cells (448x320) holds the same stone: World 2's painted boulder (kits/w2.webp#boulder) recoloured toward the river stone's
grey-brown (props/dress.webp#w2RiverStone), cut to a flat walkable top (the lid) with moss along it, and a front seam. The lid never moves
(his walk line); the lower jaw drops a notch a frame (0, 14, 30, 50 px), the gap a dark stone mouth lined with blunt rounded ridges
(no teeth, no eyes). Ink outline in the kit's dark brown. Nothing floats; nothing half-transparent (hf-art.md step 5).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

OUT = Path('reference/art/hf25/starts'); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255, 255)
INK = (52, 36, 30, 255)
kit = Image.open('src/assets/kits/w2.webp').convert('RGBA')
bould = kit.crop((1307, 925, 1307 + 388, 925 + 179))
dress = Image.open('src/assets/props/dress.webp').convert('RGBA')
river = dress.crop((670, 829, 790, 901))

# the texture: the boulder's paint, pulled half way to the river stone's grey (its mean colour), so it reads grey-brown
tex = bould.resize((420, 194), Image.LANCZOS)
rv = river.convert('RGB').resize((1, 1), Image.LANCZOS).getpixel((0, 0))
grey = Image.new('RGBA', tex.size, rv + (255,))
a0 = tex.getchannel('A')
tex = Image.blend(tex, grey, 0.45)
tex.putalpha(a0)
BASE = tex.convert('RGB').resize((1, 1), Image.LANCZOS).getpixel((0, 0)) + (255,)

CW, CH = 448, 320
TOP, SEAM, W, X0 = 78, 150, 380, 34          # the flat top's y, the seam's y, the stone's width, its left in a cell
DROPS = [0, 14, 30, 50]
BOT = 238                                   # the jaw's bottom (shut)


def lid_mask():
    m = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle((X0, TOP, X0 + W, SEAM + 6), radius=30, fill=255)
    return m


def jaw_mask(dy):
    m = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(m)
    d.ellipse((X0 + 4, SEAM - (BOT - SEAM) + dy, X0 + W - 4, BOT + dy), fill=255)
    d.rectangle((X0, 0, X0 + W, SEAM - 6 + dy), fill=0)
    d.rounded_rectangle((X0 + 4, SEAM - 6 + dy, X0 + W - 4, SEAM + 24 + dy), radius=14, fill=255)
    return m


def shade(img, mask, light):
    """paint light from the upper left: a soft gradient over the masked part"""
    g = Image.linear_gradient('L').rotate(-35, expand=False).resize(img.size)
    lift = Image.new('RGBA', img.size, (255, 246, 226, 255)); dark = Image.new('RGBA', img.size, (40, 30, 28, 255))
    a = Image.blend(img, lift, 0.10 * light); b = Image.blend(img, dark, 0.22)
    out = Image.composite(b, a, g)
    return Image.composite(out, img, mask)


def ridges(d, y, up, x0, x1, n, r):
    """blunt rounded stone ridges along a lip: half-discs, ink-outlined (up: they rise from the jaw)"""
    step = (x1 - x0) / n
    for i in range(n):
        cx = x0 + step * (i + 0.5)
        box = (cx - r, y - r, cx + r, y + r)
        d.pieslice(box, 180 if up else 0, 360 if up else 180, fill=(150, 136, 118, 255), outline=INK, width=4)


def cell(k):
    c = Image.new('RGBA', (CW, CH), MAG)
    dy = DROPS[k]
    # the jaw first (behind the lid's lip), then the mouth, then the lid over
    jm = jaw_mask(dy)
    t = Image.new('RGBA', (CW, CH), BASE); t.alpha_composite(tex.resize((W + 30, BOT - SEAM + 60)), (X0 - 15, SEAM - 30 + dy))
    jaw = Image.composite(t, Image.new('RGBA', (CW, CH), (0, 0, 0, 0)), jm)
    jaw = shade(jaw, jm, 0.6)
    lm = lid_mask()
    t2 = Image.new('RGBA', (CW, CH), BASE); t2.alpha_composite(tex.resize((W + 30, 150)), (X0 - 15, TOP - 40))
    lid = Image.composite(t2, Image.new('RGBA', (CW, CH), (0, 0, 0, 0)), lm)
    lid = shade(lid, lm, 1.0)
    d = ImageDraw.Draw(c)
    # ink outline under each part (dilate the mask)
    for m in (jm, lm):
        o = m.filter(ImageFilter.MaxFilter(9))
        c.paste(Image.new('RGBA', (CW, CH), INK), (0, 0), o)
    c.alpha_composite(jaw)
    d = ImageDraw.Draw(c)
    if dy > 0:
        # the mouth: dark stone inside, a little lighter at the back, between the lid's lip and the jaw's
        d.rounded_rectangle((X0 + 18, SEAM - 2, X0 + W - 18, SEAM + dy + 4), radius=min(16, dy // 2 + 4), fill=(44, 30, 28, 255))
        d.rounded_rectangle((X0 + 60, SEAM + 2, X0 + W - 60, SEAM + max(4, dy - 6)), radius=6, fill=(70, 50, 44, 255))
        ridges(d, SEAM + dy + 3, True, X0 + 30, X0 + W - 30, 5, 9 + dy // 4)
    c.alpha_composite(lid)
    d = ImageDraw.Draw(c)
    if dy > 0:
        ridges(d, SEAM + 4, False, X0 + 60, X0 + W - 60, 4, 9 + dy // 4)
    else:
        # shut: the closed seam, a wavy ink line across the front where the ridges lock
        pts = [(X0 + 20 + i * 8, SEAM + 4 + (3 if (i // 3) % 2 else -2)) for i in range((W - 40) // 8 + 1)]
        d.line(pts, fill=INK, width=5, joint='curve')
    # the flat top: a lit band, and moss along it (World 2's moss green)
    d.line([(X0 + 22, TOP + 3), (X0 + W - 22, TOP + 3)], fill=(196, 186, 160, 255), width=6)
    moss = (112, 140, 64, 255); moss2 = (86, 116, 50, 255)
    for x, w_, h_ in [(X0 + 30, 70, 14), (X0 + 120, 46, 10), (X0 + 210, 88, 16), (X0 + 312, 50, 12)]:
        d.ellipse((x, TOP - h_ // 2, x + w_, TOP + h_), fill=moss, outline=INK, width=3)
        d.ellipse((x + 8, TOP + 2, x + w_ - 10, TOP + h_ - 2), fill=moss2)
    # nothing half-transparent: snap alpha
    a = c.getchannel('A').point(lambda v: 255)
    c.putalpha(a)
    return c


sheet = Image.new('RGBA', (CW * 4, CH), MAG)
for k in range(4):
    sheet.paste(cell(k), (k * CW, 0))
sheet.convert('RGB').save(OUT / 'snapstone.png')
print('wrote', OUT / 'snapstone.png', sheet.size)
