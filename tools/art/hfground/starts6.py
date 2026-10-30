"""Starts for the clean sweep's ground variants (hf-art-ground, 2026-10-30; CLEAN-SWEEP G1, G2): each world's soil, lip and bank end
as they are in the game (src/assets/ground/w<N>.webp), so the new variants (groundgpu.py 'vary', 'varystrip', 'plain') keep their edges
and lay next to the old ones with no seam. The lip and the end go on the magenta key.
    python3 tools/art/hfground/starts6.py   ->  tools/art/hfground/starts/vfill-w<N>.webp, vlip-w<N>.webp, vend-w<N>.webp
"""
import json, re
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / 'starts'
G = json.loads(re.search(r'GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', (ROOT / 'src/game/groundAtlasData.ts').read_text(), re.S).group(1))
for w, g in G.items():
    S = Image.open(ROOT / f'src/assets/ground/w{w}.webp').convert('RGBA')
    crop = lambda f: S.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    crop(g['fills'][0]).convert('RGB').save(OUT / f'vfill-w{w}.webp', quality=95)
    for n, f in (('vlip', g['lip']), ('vend', g['end'])):
        bg = Image.new('RGBA', (f['w'], f['h']), (255, 0, 255, 255))
        bg.alpha_composite(crop(f))
        bg.convert('RGB').save(OUT / f'{n}-w{w}.webp', quality=95)
print('ok')
