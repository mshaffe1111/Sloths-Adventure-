"""Put the w5-rebuild repaints into src/assets/props/w5-props.webp in place (as hfground/packw5props.py: each pick keyed off the magenta,
its dark key spill browned on the edge only, fitted inside the piece's own frame bottom-centred, the old piece cleared first), clear the
12 frames the game never draws, and write the before/after sheet to reference/prop-sheets/qa-notes/w5-rebuild/w5-props-after.jpg.
    python3 tools/art/w5rebuild/pack.py <raw dir>      (run it on a fresh `git checkout src/assets/props/w5-props.webp`)
"""
import re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hfground'))
from keying import depurple, key  # noqa: E402
from starts2 import deline  # noqa: E402
sys.path.insert(0, str(HERE))
from art import REPAINT, UNUSED  # noqa: E402
ROOT = HERE.parents[2]
raw = Path(sys.argv[1])
# the pick for each piece (s55 unless named); 'start': the outline-removed start itself (both takes failed: the thread broke into
# beads, the doily lost its lace), a piece of the sheet's own painting with its black outline painted out (starts2.py deline)
PICK = {'fern': 's65-19', 'cocoonHangingTorn': 's65-19', 'cocoonTorn': 's65-19', 'lantern': 's65-19', 'mossRoot': 's65-19',
        'orchidRow': 's65-19', 'orchidRow2': 's65-19', 'silkSheet': 's65-19', 'totem': 's65-19', 'wrappedChair': 's65-19',
        'wrappedArmchair2': 's65-19', 'doily': 'start', 'silkThread': 'start'}
# (stray specks the key leaves round a piece, by area: the fern's take has a few pink dots beside it)
SPECK = {'fern': 900}
F = {m.group(1): tuple(map(int, m.groups()[1:])) for m in re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', (ROOT / 'src/game/w5PropsData.ts').read_text())}
path = ROOT / 'src/assets/props/w5-props.webp'
sheet = Image.open(path).convert('RGBA')
before = sheet.copy()
a = np.asarray(sheet).copy()
for n in [*REPAINT, *UNUSED]:
    x, y, w, h = F[n]
    a[y:y + h, x:x + w] = 0
sheet = Image.fromarray(a, 'RGBA')
for n in REPAINT:
    x, y, w, h = F[n]
    t = PICK.get(n, 's55-7')
    if t == 'start':
        x0, y0, w0, h0 = F[n]
        im = deline(before.crop((x0, y0, x0 + w0, y0 + h0)))
    else:
        im = depurple(key(Image.open(raw / f'w5r-{n}-{t}.webp'), speck=SPECK.get(n, 80)), lum_max=256, edge_only=3)
    im = im.crop(im.getbbox())
    k = min(w / im.width, h / im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    sheet.alpha_composite(im, (x + (w - im.width) // 2, y + h - im.height))
sheet.save(path, 'WEBP', quality=90, method=6)
print(path, path.stat().st_size)
T = 130
out = ROOT / 'reference/prop-sheets/qa-notes/w5-rebuild'
out.mkdir(parents=True, exist_ok=True)
names = list(REPAINT)
cols = 3
S = Image.new('RGB', (cols * (T * 4 + 10), ((len(names) + cols - 1) // cols) * (T + 14)), (16, 16, 16)); d = ImageDraw.Draw(S)
for i, n in enumerate(names):
    x, y, w, h = F[n]
    X, Y = (i % cols) * (T * 4 + 10), (i // cols) * (T + 14)
    d.text((X + 2, Y + 1), f'{n}: before | after', fill=(255, 255, 0))
    for k, (src, bg) in enumerate(((before, (30, 30, 34)), (before, (128, 128, 128)), (sheet, (30, 30, 34)), (sheet, (128, 128, 128)))):
        p = src.crop((x, y, x + w, y + h)); p.thumbnail((T - 6, T - 6))
        c = Image.new('RGBA', (T, T), bg + (255,)); c.alpha_composite(p, ((T - p.width) // 2, (T - p.height) // 2))
        S.paste(c.convert('RGB'), (X + k * T, Y + 14))
S.save(out / 'w5-props-after.jpg', quality=85)
