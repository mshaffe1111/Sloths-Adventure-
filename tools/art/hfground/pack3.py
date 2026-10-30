"""Add the bank ends redone on a green key (HF job hfg-pm-1030, 2026-10-30; the magenta ones bled purple into the paint) to each world's
ground sheet, in the two free end slots pack2.py left, keeping its fills and lips as they are.
    python3 tools/art/hfground/pack3.py <raw dir> [worlds]      (picks from picks3.json: {"<w>": [end name, end name]})
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from keying import gkey  # noqa: E402

ROOT = HERE.parents[2]
# pack2.py's end_piece (and surf_row), without running pack2's own packing
_p2 = (HERE / 'pack2.py').read_text()
exec(_p2[_p2.index('def surf_row'):_p2.index('\nfor w in worlds')], globals())
raw = Path(sys.argv[1])
picks = json.loads((HERE / 'picks3.json').read_text())
worlds = sys.argv[2:] or list(picks)
TS = ROOT / 'src/game/groundAtlasData.ts'
src = TS.read_text()
G = json.loads(re.search(r'GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', src, re.S).group(1))
EPOS = [(1408, 2208), (0, 2368)]
for w in worlds:
    g = G[w]
    S = Image.open(ROOT / f'src/assets/ground/w{w}.webp').convert('RGBA')
    ends = [g['end']]
    for n, p in zip(picks[w], EPOS):
        im, meta = end_piece(gkey(Image.open(raw / f'{n}.webp')))
        # (these takes fade out toward their foot, where end_piece finds no face and reads the middle, 0.5: the soil's outline then cut
        # in under the end and showed the pit through it; the face carries on down from the last row it did find)
        f = meta['face']
        while len(f) > 2 and f[-1] == 0.5:
            f.pop()
        meta['face'] = f + [f[-1]] * (9 - len(f))
        S.paste(Image.new('RGBA', (384, 576), (0, 0, 0, 0)), p)
        S.alpha_composite(im, p)
        ends.append({'x': p[0], 'y': p[1], 'w': 384, 'h': 576, **meta})
    g['ends'] = ends
    out = ROOT / f'src/assets/ground/w{w}.webp'
    S.save(out, 'WEBP', quality=82, method=6)
    print(w, out.stat().st_size, [e['cx'] for e in ends])
TS.write_text(re.sub(r'(GROUND_FRAMES: Record<number, GroundSheet> = )\{.*\};', lambda m: m.group(1) + json.dumps(G) + ';', src, flags=re.S))
