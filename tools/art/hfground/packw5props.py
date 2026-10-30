"""Put World 5's repainted props (hf-art-ground, 2026-10-29; polish report VI-13: "pastel stickers with thick outlines") into
src/assets/props/w5-props.webp in place: each pick keyed off the magenta, its dark key spill browned, fitted inside the piece's own
frame (keeping its shape, bottom-centred, as the old piece stood), the old piece cleared first. The frames (w5PropsData.ts) do not move,
so every use of a piece keeps working. Writes a before/after sheet to reference/prop-sheets/qa-notes/hf-art-ground/w5-props-after.jpg.
    python3 tools/art/hfground/packw5props.py <raw dir>
"""
import re, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from keying import depurple, key  # noqa: E402

ROOT = HERE.parents[2]
raw = Path(sys.argv[1])
TAKE = 's60-19'
# (the tea tables' lace is fine work the stronger take keeps cleaner at the cloth's hem)
PICK = {'teaTable': 's50-7', 'teaTableNapkin': 's50-7'}
W5 = {m.group(1): tuple(map(int, m.groups()[1:])) for m in
      re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', (ROOT / 'src/game/w5PropsData.ts').read_text())}
PROPS = ['cupcake', 'cupcake2', 'cakeCherry', 'cakeSponge', 'cakeTier', 'cakeTier2', 'cakePlate', 'cakePlate2', 'teapot', 'teapot2',
         'teacup', 'teacup2', 'armchairRose', 'armchairRose2', 'armchairLilac', 'armchairLilac2', 'teaTable', 'teaTableNapkin']
path = ROOT / 'src/assets/props/w5-props.webp'
sheet = Image.open(path).convert('RGBA')
before = sheet.copy()
a = np.asarray(sheet).copy()
for n in PROPS:
    x, y, w, h = W5[n]
    a[y:y + h, x:x + w] = 0
sheet = Image.fromarray(a, 'RGBA')
for n in PROPS:
    x, y, w, h = W5[n]
    im = depurple(key(Image.open(raw / f'w5p-{n}-{PICK.get(n, TAKE)}.webp'), speck=80), lum_max=256, edge_only=3)
    im = im.crop(im.getbbox())
    k = min(w / im.width, h / im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    sheet.alpha_composite(im, (x + (w - im.width) // 2, y + h - im.height))
sheet.save(path, 'WEBP', quality=90, method=6)
print(path, path.stat().st_size)
# before / after, each piece on dark and mid-grey
T = 150
rows = []
for n in PROPS:
    x, y, w, h = W5[n]
    R = Image.new('RGB', (T * 4, T + 14), (20, 20, 20))
    d = ImageDraw.Draw(R)
    d.text((2, 1), n, fill=(255, 255, 0))
    for i, (src, bg) in enumerate(((before, (30, 30, 34)), (before, (128, 128, 128)), (sheet, (30, 30, 34)), (sheet, (128, 128, 128)))):
        p = src.crop((x, y, x + w, y + h))
        p.thumbnail((T - 6, T - 6))
        c = Image.new('RGBA', (T, T), bg + (255,))
        c.alpha_composite(p, ((T - p.width) // 2, (T - p.height) // 2))
        R.paste(c.convert('RGB'), (i * T, 14))
    rows.append(R)
cols = 2
S = Image.new('RGB', (cols * T * 4 + 10, ((len(rows) + 1) // 2) * (T + 14)), (20, 20, 20))
for i, r in enumerate(rows):
    S.paste(r, ((i % cols) * (T * 4 + 10), (i // cols) * (T + 14)))
S.save(ROOT / 'reference/prop-sheets/qa-notes/hf-art-ground/w5-props-after.jpg', quality=84)
