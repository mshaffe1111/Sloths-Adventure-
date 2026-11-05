"""Write tools/art/hfbatch/spec-hfb-rotwood-<round>.json (2026-11-05): World 1's rotten wood, a ground breakable, by img2img
(fungusgpu.py, unchanged) from the starts rotwoodstarts.py makes (tools/art/hfbatch/starts/w1rot/, read from GitHub raw at the
branch art-w1-rotwood).
    python3 tools/art/hfbatch/make_rotwood_spec.py <round>
"""
import json, sys
from pathlib import Path

STYLE = 'slothadv style, painted storybook illustration, '
TAIL = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no '
        'shadow, no text')
WHOLE = (STYLE + 'one short rotten log lying on the forest floor, seen exactly from the side for a side-scrolling platform game, '
         'clearly decayed and soft: sagging a little in the middle, dark cracks along the grain, torn bark with pale crumbly punk wood '
         'showing through in patches, a few flecks of green moss on top, a lush green rainforest. ' + TAIL)
CREAK = WHOLE.replace('a few flecks of green moss on top,', 'a few flecks of green moss on top, a wide fresh split across the '
                      'middle with pale splinters sticking up, about to snap in two,')
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, ground, grass, '
       'perspective, seen from above, flowers, mushrooms, two logs, stack')
rnd = sys.argv[1] if len(sys.argv) > 1 else '1'
items = []
if rnd == '1':
    items += [{'name': f'{k}-s{round(s * 100)}-{sd}', 'start': f'rot-{k}.png', 'prompt': WHOLE if k == 'whole' else CREAK,
               'strength': s, 'seed': sd, 'w': 1024, 'h': 512} for k in ('whole', 'creak') for s in (0.55, 0.65) for sd in (5, 11)]
spec = {'note': f'W1 rotten wood, round {rnd}, 2026-11-05',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]},
        'base': 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/art-w1-rotwood/tools/art/hfbatch/starts/w1rot/',
        'neg': NEG, 'items': items}
p = Path(__file__).resolve().parent / f'spec-hfb-rotwood-{rnd}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
