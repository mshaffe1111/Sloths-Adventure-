"""Round 3 of the boss art batch (hf-art-bosses, 2026-10-29): Venom Fang's painted body strip (AN-7), from venomstart.py's start.
    python3 tools/art/hfbosses/make_spec3.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
P = ('slothadv style, a long straight horizontal strip of a giant cartoon jungle snake\'s body seen from the side, filling the strip from '
     'the left edge to the right edge with no head and no tail: glossy teal-green scales on its back with a lighter highlight, a row of '
     'pale jagged markings along the top, a smooth cream belly with brown-edged belly plates along the bottom, a thin dark outline along '
     'the top and the bottom. Soft cel shading, light from the upper left, painted storybook illustration. Evenly lit, on one flat plain '
     'pure magenta background, no shadow, no text.')
NEG = 'head, eyes, tail, coil, curve, text, letters, watermark, frame, border, photo, 3d render, blurry, gradient background, shadow'
items = [{'name': f'venombody-s{round(s * 100)}-{sd}', 'start': 'start-venombody.webp', 'prompt': P, 'neg': NEG, 'strength': s, 'seed': sd,
          'w': 1536, 'h': 256} for s in (0.5, 0.62) for sd in (7, 23)]
spec = {'note': 'hfboss-venom: Venom Fang body strip, hf-art-bosses, 2026-10-29', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfboss-venom.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
