"""Write tools/art/hfbatch/spec-hfb-fungus-<round>.json (2026-10-31): World 8's fungus steps by img2img (fungusgpu.py) from the starts
fungusstarts.py makes (in the repo under tools/art/hfbatch/starts/w8fungus/, read from GitHub raw at w8-merge).
    python3 tools/art/hfbatch/make_fungus_spec.py <round>
"""
import json, sys
from pathlib import Path

STYLE = 'slothadv style, painted storybook illustration, '
TAIL = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no '
        'shadow, no text')
BRACKET = (STYLE + 'a single shelf bracket fungus seen exactly from the side for a side-scrolling platform game, a flat top surface to '
           'stand on, a rounded underside with soft layered growth rings in cream, rust brown and dusky violet, a few small softly '
           'glowing pale blue spots, a twilight forest at night. ' + TAIL)
MOSS = BRACKET.replace('a flat top surface to stand on,', 'a flat top surface to stand on with a thin edge of dark green moss and two '
                       'tiny glowing blue mushrooms on it,')
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, tree trunk, wall, '
       'perspective, seen from above, top-down, several fungi, stack')
rnd = sys.argv[1] if len(sys.argv) > 1 else '1'
items = []
if rnd == '1':
    items += [{'name': f'{k}-s{round(s * 100)}-{sd}', 'start': f'{k}.png', 'prompt': BRACKET if k == 'bracket' else MOSS, 'strength': s,
               'seed': sd, 'w': 512, 'h': 512} for k in ('bracket', 'bracket-moss') for s in (0.62, 0.76) for sd in (5, 17)]
spec = {'note': f'World 8 fungus steps, round {rnd}, 2026-10-31',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]},
        'base': 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/w8-merge/tools/art/hfbatch/starts/w8fungus/',
        'neg': NEG, 'items': items}
p = Path(__file__).resolve().parent / f'spec-hfb-fungus-{rnd}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
