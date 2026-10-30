"""Swap one world's three soil fills into its ground sheet, keeping its lip and end (hf-art-ground, 2026-10-29: World 10's redo).
    python3 tools/art/hfground/packfill.py <raw dir> <world> <take>     e.g.  work/raw 10 fill-w10-c
Updates src/assets/ground/w<world>.webp, the world's `deep` colour in src/game/groundAtlasData.ts and picks.json.
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).parent
ROOT = HERE.parent.parent.parent
raw, w, take = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
sheet = ROOT / f'src/assets/ground/w{w}.webp'
S = Image.open(sheet).convert('RGBA')
fills = [Image.open(raw / f'{take}-v{s}.webp').convert('RGB') for s in (3, 5, 7)]
for im, (x, y) in zip(fills, [(0, 0), (1024, 0), (0, 1024)]):
    S.paste(im.resize((1024, 1024), Image.LANCZOS).convert('RGBA'), (x, y))
S.save(sheet, 'WEBP', quality=82, method=6)
deep = [int(c * 0.22) for c in np.asarray(fills[0], np.float32).mean((0, 1))]
ts = ROOT / 'src/game/groundAtlasData.ts'
src = ts.read_text()
# the world's entry: its `deep` array is the first after the key
m = re.search(rf'("{w}": \{{.*?"deep": \[)[^\]]*(\])', src)
assert m, 'world entry not found'
src = src[:m.start()] + m.group(1) + ', '.join(map(str, deep)) + m.group(2) + src[m.end():]
ts.write_text(src)
pk = json.loads((HERE / 'picks.json').read_text())
pk[w]['fill'] = take
(HERE / 'picks.json').write_text(json.dumps(pk, indent=1) + '\n')
print(sheet, sheet.stat().st_size, 'deep', deep)
