"""Write tools/art/hfbatch/spec-hfb-sidebranch-<round>.json (2026-11-05): World 1's side branch, a short limb out of a kapok trunk's side,
by img2img (fungusgpu.py, unchanged) from sidebranchstarts.py's start (tools/art/hfbatch/starts/w1side/, GitHub raw at the branch
art-w1-sidebranch).
    python3 tools/art/hfbatch/make_sidebranch_spec.py <round>
"""
import json, sys
from pathlib import Path

STYLE = 'slothadv style, painted storybook illustration, '
TAIL = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no '
        'shadow, no text')
SIDE = (STYLE + 'a straight kapok tree trunk with a green vine wound round it, and one short sturdy branch growing out of the right side '
        'of the trunk, seen exactly from the side for a side-scrolling platform game: the branch joins the trunk with a swollen bark collar '
        'and no gap, runs out nearly level with moss along its top, and ends in a flat sawn-off end, a lush green rainforest. ' + TAIL)
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, ground, '
       'perspective, seen from above, leaves on the branch tip, two branches, a broken branch, flowers')
rnd = sys.argv[1] if len(sys.argv) > 1 else '1'
items = []
if rnd == '1':
    items += [{'name': f'side-s{round(s * 100)}-{sd}', 'start': 'side.png', 'prompt': SIDE, 'strength': s, 'seed': sd, 'w': 1024,
               'h': 768} for s in (0.5, 0.62) for sd in (5, 11)]
spec = {'note': f'W1 side branch, round {rnd}, 2026-11-05',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]},
        'base': 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/art-w1-sidebranch/tools/art/hfbatch/starts/w1side/',
        'neg': NEG, 'items': items}
p = Path(__file__).resolve().parent / f'spec-hfb-sidebranch-{rnd}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
