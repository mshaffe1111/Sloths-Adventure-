"""Bake the Seamstress's dark plum edge (w5Creatures.ts drew it round her stills at run time, QA: her pink vanished into the pink dusk)
into her clip sheet, so the game draws the clip frames as they are. Run after cutin.py:

    python3 -I tools/art/w6to10/seamedge.py <game checkout>

Each frame gets the edge spread round it (16 directions, the old stills' 5 source px times ANIM_UP), is re-packed with room for it,
and its anchor moves with the padding. Rewrites src/assets/enemies/seamstress-anim.webp and src/game/seamstressAnimData.ts.
"""
import json, math, re, sys
from pathlib import Path
from PIL import Image, ImageChops

GAME = Path(sys.argv[1])
ts_p = GAME / 'src/game/seamstressAnimData.ts'
img_p = GAME / 'src/assets/enemies/seamstress-anim.webp'
ts = ts_p.read_text()
up = float(re.search(r'SEAMSTRESS_ANIM_UP = ([\d.]+);', ts).group(1))
frames = json.loads(re.search(r'SEAMSTRESS_ANIM: Record<string, AnimFrame> = (.*);\n', ts).group(1))
sheet = Image.open(img_p).convert('RGBA')
e = round(5 * up)
pad = e + 1
ink = (0x2b, 0x14, 0x26)

cells, x, y, row = {}, 0, 0, 0
for n, f in frames.items():
    w, h = f['w'] + 2 * pad, f['h'] + 2 * pad
    if x + w > 2048:
        x, y, row = 0, y + row + 2, 0
    cells[n] = (x, y)
    x, row = x + w + 2, max(row, h)
out = Image.new('RGBA', (2048, y + row))
new = {}
for n, f in frames.items():
    fr = sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    w, h = f['w'] + 2 * pad, f['h'] + 2 * pad
    a = Image.new('L', (w, h))
    base = Image.new('L', (w, h))
    base.paste(fr.getchannel('A'), (pad, pad))
    for i in range(16):
        r = i * math.pi / 8
        a = ImageChops.lighter(a, ImageChops.offset(base, round(math.cos(r) * e), round(math.sin(r) * e)))
    a = a.point(lambda v: 255 if v > 40 else v * 6)
    cell = Image.new('RGBA', (w, h), ink + (0,))
    cell.putalpha(a)
    top = Image.new('RGBA', (w, h))
    top.paste(fr, (pad, pad))
    cell.alpha_composite(top)
    cx, cy = cells[n]
    out.paste(cell, (cx, cy))
    new[n] = {'x': cx, 'y': cy, 'w': w, 'h': h, 'ax': round(f['ax'] + pad, 1), 'ay': round(f['ay'] + pad, 1)}
q = 88
while True:
    out.save(img_p, 'WEBP', quality=q, method=6)
    if img_p.stat().st_size < 3.9e6 or q <= 60:
        break
    q -= 6
ts = re.sub(r'SEAMSTRESS_ANIM_SIZE = \{ w: \d+, h: \d+ \};', f'SEAMSTRESS_ANIM_SIZE = {{ w: {out.width}, h: {out.height} }};', ts)
ts = re.sub(r'(SEAMSTRESS_ANIM: Record<string, AnimFrame> = ).*;\n', lambda m: m.group(1) + json.dumps(new) + ';\n', ts)
ts = ts.replace('*/\nimport type', f' The dark plum edge ({e} px) is baked round every frame (tools/art/w6to10/seamedge.py). */\nimport type', 1)
ts_p.write_text(ts)
print('seamstress edged', out.size, img_p.stat().st_size, 'q', q, 'edge', e)
