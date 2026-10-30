"""Add Matt's painted World 8-10 set dressing (src/assets/w6to10/props-made: w8c, w8c-b, w9c, w9c-b, w10alt, w10b; packed but never
drawn) to the dressing sheet src/assets/props/dress.webp and src/game/dressAtlasData.ts (hf-art-ground, 2026-10-30; the W8-10 inventory).
Pieces that would read wrong are left out: World 9's lava pool (a safe picture that looks like a hazard), World 10's scaffold, balcony,
iron stair and hanging grate (pictures that look like ledges to stand on), World 8's flat bark strip.
    python3 tools/art/hfground/packdress810.py
"""
import json, re
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PM = ROOT / 'src/assets/w6to10/props-made'
# name: (sheet, frame, units drawn wide, hang)
P = {
    'w8Flowers': ('w8c', 'night-flowers', 32, 0), 'w8FlowersB': ('w8c-b', 'night-flowers', 33, 0),
    'w8Firefly': ('w8c', 'firefly-leaf', 50, 0), 'w8FireflyB': ('w8c-b', 'firefly-leaf', 50, 0),
    'w8Nest': ('w8c', 'bird-nest', 70, 0), 'w8NestB': ('w8c-b', 'bird-nest', 74, 0),
    'w8Fungus': ('w8c', 'bark-fungus', 104, 0), 'w8Hollow': ('w8c', 'tree-hollow', 96, 0), 'w8HollowB': ('w8c-b', 'tree-hollow', 92, 0),
    'w8Curtain': ('w8c', 'leaf-curtain', 104, 1), 'w8CurtainB': ('w8c-b', 'leaf-curtain', 100, 1),
    'w9Tree': ('w9c', 'young-tree', 86, 0), 'w9TreeB': ('w9c-b', 'young-tree', 82, 0),
    'w9Fern': ('w9c', 'ash-fern', 92, 0), 'w9FernB': ('w9c-b', 'ash-fern', 84, 0),
    'w9Obsidian': ('w9c', 'obsidian', 64, 0), 'w9ObsidianB': ('w9c-b', 'obsidian', 66, 0),
    'w9Log': ('w9c', 'charred-log', 124, 0), 'w9LogB': ('w9c-b', 'charred-log', 120, 0),
    'w9Smoke': ('w9c', 'smoke-crack', 110, 0), 'w9SmokeB': ('w9c-b', 'smoke-crack', 112, 0),
    'w10Banner': ('w10alt', 'banner-b', 56, 0), 'w10Rack': ('w10alt', 'weapon-rack-b', 96, 0), 'w10Brazier': ('w10alt', 'brazier-b', 58, 0),
    'w10Cage': ('w10alt', 'cage-b', 88, 0), 'w10Crates': ('w10alt', 'crates-b', 100, 0), 'w10Crate': ('w10b', 'crate', 70, 0),
}
DPX = 2.4  # sheet px per world unit
ts = ROOT / 'src/game/dressAtlasData.ts'
src = ts.read_text()
m = re.search(r'export const DRESS_FRAMES = (\{.*?\n\})', src, re.S)
frames = json.loads(m.group(1))
for n in list(frames):
    if n.startswith(('w8', 'w9', 'w10')):
        del frames[n]
sheet = Image.open(ROOT / 'src/assets/props/dress.webp').convert('RGBA')
top0 = max(f['y'] + f['h'] for f in frames.values()) + 4
cuts = []
for n, (sh, fr, units, hang) in P.items():
    meta = json.loads((PM / f'{sh}.json').read_text())
    f = meta.get('frames', meta)[fr]
    im = Image.open(PM / f'{sh}.webp').convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    im = im.crop(im.getbbox())
    k = units * DPX / im.width
    cuts.append((n, im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS), units, hang))
# shelf-pack under the old pieces, 1024 wide
x, y, rowh, place = 0, top0, 0, {}
for n, im, units, hang in sorted(cuts, key=lambda c: -c[1].height):
    if x + im.width > 1024:
        x, y, rowh = 0, y + rowh + 2, 0
    place[n] = (x, y)
    x += im.width + 2
    rowh = max(rowh, im.height)
H = y + rowh
out = Image.new('RGBA', (1024, max(sheet.height, H)), (0, 0, 0, 0))
out.alpha_composite(sheet.crop((0, 0, 1024, min(sheet.height, top0))), (0, 0))
for n, im, units, hang in cuts:
    out.alpha_composite(im, place[n])
    frames[n] = {'x': place[n][0], 'y': place[n][1], 'w': im.width, 'h': im.height, 'units': units, **({'hang': True} if hang else {})}
out.save(ROOT / 'src/assets/props/dress.webp', 'WEBP', quality=88, method=6)
src = src[:m.start(1)] + json.dumps(frames, indent=1) + src[m.end(1):]
src = src.replace('the stage dressing for Worlds 1, 2 and 5', 'the stage dressing for Worlds 1, 2, 5 and 8-10 (8-10: Matt\'s props-made sheets, packdress810.py)')
ts.write_text(src)
print(out.size, (ROOT / 'src/assets/props/dress.webp').stat().st_size)
