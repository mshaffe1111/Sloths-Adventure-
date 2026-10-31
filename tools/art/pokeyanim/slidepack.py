"""7-4's slide poses from behind (pokey-anim round 3, 2026-10-31, spec-anim7.json: Qwen-Edit of his flume grip pose): keyed off the grey,
brought back to the flume sheet's px (starts3.py drew the grip 560 px tall from 371), and added below the existing pieces of
src/assets/w7slide/flume-pokey.webp, their boxes into flume-atlas.json and src/game/w7SlideAtlas.ts (tools/art/slide74/cut.py makes
those; this adds to them in place, the existing pieces untouched).

    python3 -I tools/art/pokeyanim/slidepack.py ride=<png> leanR=<png> leanL=<png>
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
sys.path.insert(0, str(H.parent / 'train'))
from clips import key, bbox  # noqa: E402

SHEET = ROOT / 'src/assets/w7slide/flume-pokey.webp'
ATLAS = ROOT / 'src/assets/w7slide/flume-atlas.json'
TS = ROOT / 'src/game/w7SlideAtlas.ts'
K = 371 / 560
atlas = json.loads(ATLAS.read_text())
fr = atlas['sheets']['flume-pokey']['frames']
sheet = Image.open(SHEET).convert('RGBA')
y0 = max(b[1] + b[3] for b in fr.values()) + 4
pieces = []
for arg in sys.argv[1:]:
    name, path = arg.split('=', 1)
    rgb = np.asarray(Image.open(path).convert('RGB'))
    a = key(rgb)
    x0, t0, x1, t1 = bbox(a)
    im = Image.fromarray(np.dstack([rgb, a]), 'RGBA').crop((max(0, x0 - 3), max(0, t0 - 3), x1 + 3, t1 + 1))
    pieces.append((name, im.resize((round(im.width * K), round(im.height * K)), Image.LANCZOS)))
W = max(sheet.width, sum(p.width + 4 for _, p in pieces))
Hh = y0 + max(p.height for _, p in pieces)
out = Image.new('RGBA', (W, Hh), (0, 0, 0, 0))
out.alpha_composite(sheet, (0, 0))
x = 0
for name, im in pieces:
    out.alpha_composite(im, (x, y0))
    fr[name] = [x, y0, im.width, im.height]
    print(name, fr[name])
    x += im.width + 4
out.save(SHEET, 'WEBP', quality=88, method=6)
atlas['sheets']['flume-pokey'].update(w=W, h=Hh)
ATLAS.write_text(json.dumps(atlas, indent=1) + '\n')
ts = TS.read_text()
line = "  'flume-pokey': { " + ', '.join(f'{n}: [{b[0]}, {b[1]}, {b[2]}, {b[3]}]' for n, b in fr.items()) + ' },'
TS.write_text(re.sub(r"  'flume-pokey': \{.*?\},", line, ts))
print(SHEET, out.size, SHEET.stat().st_size // 1024, 'KB')
