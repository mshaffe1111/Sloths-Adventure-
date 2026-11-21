"""ART-UNDER (11-21): pack World 2's painted underside into its ground sheet, beside its lips (the ENG-GROUND hook, groundStack.ts
underFrames: the sheet's `unders`, ids w2#under0..2, each {x, y, w, h, edge}). Run AFTER tools/art/hfground/pack.py or packfill.py
(they rewrite the sheet and groundAtlasData.ts from their own picks and would drop these).
  strips  stacked at x 0 from y 2368 (under the lips), 4 px clear between, the sheet grown down as far as they need (to a multiple of 8)
  corner  at (1408, 2208), right of the end frame: `underCorner` {x, y, w, h, edge, cx} (edge: the share of its height where the soil's
          bottom edge runs; cx: the share of its width where its face runs, top quarter). A right-hand corner; mirrored for a left one.
Writes src/assets/ground/w2.webp (WEBP q82 method 6, as pack.py) and the "2" entry of src/game/groundAtlasData.ts.
    python3 -I tools/art/hfunder/pack.py <under0.png> <under1.png> <under2.png> <corner.png>
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SHEET = ROOT / 'src/assets/ground/w2.webp'
DATA = ROOT / 'src/game/groundAtlasData.ts'
strips = [Image.open(p).convert('RGBA') for p in sys.argv[1:4]]
corner = Image.open(sys.argv[4]).convert('RGBA')


def edge_share(im, x0=0, x1=None):
    al = np.asarray(im)[..., 3] > 128
    h, w = al.shape
    rows = []
    for x in range(x0, x1 or w):
        c = al[24:, x]
        rows.append(24 + (int(np.argmin(c)) if not c.all() else len(c)))
    return round(float(np.mean(rows)) / h, 4)


S = Image.open(SHEET).convert('RGBA')
old = S.size
y = 2368
frames = []
for im in strips:
    frames.append({'x': 0, 'y': y, 'w': im.width, 'h': im.height, 'edge': edge_share(im)})
    y += im.height + 4
H = max(old[1], int(np.ceil((y - 4) / 8) * 8))
N = Image.new('RGBA', (old[0], H), (0, 0, 0, 0))
N.paste(S, (0, 0))
# clear the areas first (the old sheet is transparent there; make sure)
for f, im in zip(frames, strips):
    N.paste(Image.new('RGBA', (f['w'], f['h']), (0, 0, 0, 0)), (f['x'], f['y']))
    N.paste(im, (f['x'], f['y']))
cx0, cy0 = 1408, 2208
N.paste(corner, (cx0, cy0))
al = np.asarray(corner)[..., 3] > 128
q = al[: al.shape[0] // 4]
face = [int(np.where(r)[0].max()) + 1 for r in q if r.any()]
cf = {'x': cx0, 'y': cy0, 'w': corner.width, 'h': corner.height, 'edge': edge_share(corner, 0, int(0.6 * corner.width)),
      'cx': round(float(np.mean(face)) / corner.width, 4)}
N.save(SHEET, 'WEBP', quality=82, method=6)

t = DATA.read_text()
m = re.search(r'export const GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', t)
data = json.loads(m.group(1))
data['2']['unders'] = frames
data['2']['underCorner'] = cf
t = t[:m.start(1)] + json.dumps(data) + t[m.end(1):]
note = (' *   unders       (World 2) the painted underside strips (ENG-GROUND, groundStack.ts underFrames); edge: the share of its height where\n'
        ' *                the soil\'s edge runs. underCorner: where it turns up into the end face (cx: where the face runs). Added by\n'
        ' *                tools/art/hfunder/pack.py: re-run it after pack.py / packfill.py\n')
if 'unders ' not in t:
    t = t.replace(" *   deep   the soil's darkest tone (the darkening with depth)\n", " *   deep   the soil's darkest tone (the darkening with depth)\n" + note)
if 'unders?:' not in t:
    t = t.replace("  deep: [number, number, number];\n}", "  deep: [number, number, number];\n"
                  "  unders?: Array<GroundFrame & { edge: number }>;\n  underCorner?: GroundFrame & { edge: number; cx: number };\n}")
DATA.write_text(t)
print('sheet', old, '->', N.size, f'decoded {old[0] * old[1] * 4 / 2**20:.1f} -> {N.size[0] * N.size[1] * 4 / 2**20:.1f} MiB',
      'file', SHEET.stat().st_size)
print(json.dumps({'unders': frames, 'underCorner': cf}))
