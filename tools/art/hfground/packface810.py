"""Add Worlds 8-10's bank-face pieces (HF job hfg-face-810: each painted into its world's own soil) to the dressing sheet
src/assets/props/dress.webp and src/game/dressAtlasData.ts as w<N>Face<i> (hf-art-ground, 2026-10-30; W8-10 inventory item 3). Each
piece keeps its middle and is feathered out to nothing at its edges (an ellipse, solid inside 42%, gone by 96%), so it sinks into the
bank's soil with no pasted edge.
    python3 tools/art/hfground/packface810.py <raw dir>      (picks: picks-face.json {"<w>": [name, ...]})
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
raw = Path(sys.argv[1])
picks = json.loads((HERE / 'picks-face.json').read_text())
UNITS, PX = 190, 400
ts = ROOT / 'src/game/dressAtlasData.ts'
src = ts.read_text()
m = re.search(r'export const DRESS_FRAMES = (\{.*?\n\})', src, re.S)
frames = json.loads(m.group(1))
for n in [n for n in frames if 'Face' in n]:
    del frames[n]
sheet = Image.open(ROOT / 'src/assets/props/dress.webp').convert('RGBA')
top0 = max(f['y'] + f['h'] for f in frames.values()) + 4
yy, xx = np.mgrid[0:PX, 0:PX].astype(np.float32)
r = np.hypot((xx + 0.5 - PX / 2) / (PX / 2), (yy + 0.5 - PX / 2) / (PX / 2))
t = np.clip((0.96 - r) / (0.96 - 0.42), 0, 1)
mask = (t * t * (3 - 2 * t) * 255).astype(np.uint8)
cuts = []
for w, names in picks.items():
    for i, n in enumerate(names):
        im = Image.open(raw / f'{n}.webp').convert('RGB').resize((PX, PX), Image.LANCZOS).convert('RGBA')
        im.putalpha(Image.fromarray(mask))
        cuts.append((f'w{w}Face{i}', im))
x, y = 0, top0
H = y + PX
out = Image.new('RGBA', (1024, max(sheet.height, top0 + 2 * (PX + 2))), (0, 0, 0, 0))
out.alpha_composite(sheet.crop((0, 0, 1024, min(sheet.height, top0))), (0, 0))
for n, im in cuts:
    if x + PX > 1024:
        x, y = 0, y + PX + 2
    out.alpha_composite(im, (x, y))
    frames[n] = {'x': x, 'y': y, 'w': PX, 'h': PX, 'units': UNITS}
    x += PX + 2
out = out.crop((0, 0, 1024, y + PX))
out.save(ROOT / 'src/assets/props/dress.webp', 'WEBP', quality=88, method=6)
ts.write_text(src[:m.start(1)] + json.dumps(frames, indent=1) + src[m.end(1):])
print(out.size, (ROOT / 'src/assets/props/dress.webp').stat().st_size)
