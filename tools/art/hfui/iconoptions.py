"""The app icon options (hficon2 takes, the lead's notes: a front-facing face filling ~70% of the 66 dp safe zone, a bold single-colour
field, strong at 48 px, optional Meeca petal): each take's head scaled so it spans 0.6 of the 108 dp icon (the safe zone is 0.61) and
centred a touch high, on its own field colour; 512 px PNGs in reference/store/icon-options/ and a launcher check (circle and rounded
square at 96 and 48 px, on dark and light) in qa-notes.
    python3 -I tools/art/hfui/iconoptions.py <game checkout> A=<take png> B=<take png> C=<take png>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

GAME = Path(sys.argv[1])
SRC = dict(a.split('=', 1) for a in sys.argv[2:])
NAMES = {'A': 'A-gold', 'B': 'B-green-petal', 'C': 'C-green'}
# the head in each 1024 take, from the ear tips to the chin (B's flower is outside it)
FACE = {'A': (250, 240, 770, 690), 'B': (262, 245, 772, 665), 'C': (255, 245, 770, 665)}
OUT = GAME / 'reference/store/icon-options'
OUT.mkdir(parents=True, exist_ok=True)
L = Image.new('RGB', (3 * 430, 520), (30, 30, 30))
d = ImageDraw.Draw(L)
for i, (k, f) in enumerate(sorted(SRC.items())):
    im = Image.open(f).convert('RGB')
    x0, y0, x1, y1 = FACE[k]
    s = 0.6 * 1024 / (x1 - x0)
    big = im.resize((round(1024 * s), round(1024 * s)), Image.LANCZOS)
    cx, cy = (x0 + x1) / 2 * s, (y0 + y1) / 2 * s
    can = Image.new('RGB', (1024, 1024), im.getpixel((16, 16)))
    can.paste(big, (round(512 - cx), round(470 - cy)))
    can.resize((512, 512), Image.LANCZOS).save(OUT / f'{NAMES[k]}-512.png')
    x = i * 430 + 8
    d.text((x, 4), NAMES[k], fill=(255, 230, 0))
    L.paste(can.resize((200, 200), Image.LANCZOS), (x, 20))
    # the launcher shows the middle of the adaptive icon (72 of 108 dp) masked
    mid = can.crop((146, 146, 878, 878))
    for j, sz in enumerate((96, 48)):
        for n, (sh, bg) in enumerate((('circle', None), ('sq', None), ('circle', (235, 235, 235)))):
            m = Image.new('L', (sz, sz), 0)
            md = ImageDraw.Draw(m)
            if sh == 'circle':
                md.ellipse((0, 0, sz - 1, sz - 1), fill=255)
            else:
                md.rounded_rectangle((0, 0, sz - 1, sz - 1), sz // 4, fill=255)
            px, py = x + n * 140, 240 + j * 130
            if bg:
                L.paste(bg, (px - 10, py - 10, px + 116, py + 116))
            L.paste(mid.resize((sz, sz), Image.LANCZOS), (px + (96 - sz) // 2, py + (96 - sz) // 2), m)
L.save(GAME / 'reference/prop-sheets/qa-notes/hf-ui/icon-options-launcher.jpg', quality=90)
print('ok')
