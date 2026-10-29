"""Write the ground job specs (hf-art-ground, 2026-10-29): tools/art/hfground/spec-ground-<part>.json for groundgpu.py.
    python3 tools/art/hfground/make_spec.py <branch-or-commit>
Per world: the soil texture (two pass-1 seeds, three pass-2 variants each), the top-lip strip (two seeds, one pass-2 each), the bank's
end piece (two seeds). Starts from starts.py, read from GitHub raw at the commit given.
"""
import json, sys
from pathlib import Path

REF = sys.argv[1] if len(sys.argv) > 1 else 'hf-art-ground'
BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/'
STYLE = 'slothadv style, painted storybook illustration'
LIGHT = 'soft cel shading, evenly lit, flat even light, no highlight band, no shadow band'

SOIL = {
    1: 'rich warm brown forest soil with tangled thin pale roots, small grey pebbles and earthy clumps',
    2: 'riverbank earth in soft ochre, orange and tan layers, thin dark roots and small smooth pebbles',
    3: 'cool teal-grey grotto stone with soft moss in the cracks and a few thin faint glowing blue-green water seeps',
    4: 'blue-grey slate cliff rock with deep long cracks, a few small patches of moss',
    5: 'soft brown garden soil with fine dark root lines and tiny pebbles',
    6: 'dark brown swamp soil packed with thick tangled brown mangrove roots, small stones',
    7: 'old weathered grey-green temple stone blocks with worn carved key-pattern bands, thick brown tree roots growing over them',
    8: 'deep blue night-forest rock like old bark, long dark cracks, small specks of green moss',
    9: 'dark grey basalt rock in tall six-sided columns packed side by side, worn tops and fine cracks',
    10: 'dark grey-brown volcanic rock with deep jagged cracks and a few dull rusty patches',
}
LIP = {
    1: 'soft green moss and short grass with small ferns and tiny pink flowers',
    2: 'yellow-green riverside grass and moss with a few small pebbles',
    3: 'dark green grotto moss with a few tiny pale glowing mushrooms',
    4: 'blue-green mountain grass tufts and moss',
    5: 'fresh green moss with small ferns and tiny white petals',
    6: 'dark swamp grass and moss tufts',
    7: 'a worn mossy grey stone ledge edge with fallen orange leaves',
    8: 'dark blue-green night moss with tiny pale flowers',
    9: 'a worn grey stone top with a few small round red flowers and thin green leaves',
    10: 'a dusty rust-brown ash crust edge with small pebbles',
}
NEG_TILE = ('border, frame, edge, horizon, sky, grass, plants on top, highlight band, horizontal stripe, bright band, vignette, '
            'gradient, seam, text, letters, watermark, perspective, 3d render, photo, blurry, sloth, animal')
NEG_KEY = ('text, letters, watermark, frame, border, photo, 3d render, blurry, gradient background, sky, cast shadow, sloth, animal, '
           'stone slab, brick base, plinth')

items = {}
for w in range(1, 11):
    tex = (f'{STYLE}, a seamless tileable square texture for a side-scrolling platform game, a cross-section of the ground deep under the '
           f'surface: {SOIL[w]}. The same density all over, no top, no bottom, no border, no horizon, no grass on top, {LIGHT}, must '
           f'tile seamlessly in all four directions')
    lip = (f'{STYLE}, a long horizontal strip for a side-scrolling platform game, the top edge of a ground bank seen from the side: '
           f'{LIP[w]} along the top, thin roots and moss strands hanging down from its underside, on one flat plain pure magenta '
           f'background, the left and right ends continue seamlessly, thin dark outline, {LIGHT}, no text')
    end = (f'{STYLE}, the right-hand end of a ground bank for a side-scrolling platform game, seen from the side: the mossy top lip '
           f'({LIP[w]}) rounding over the corner, below it the bank face of {SOIL[w]}, crumbling and sloping back in as it goes down '
           f'toward water, roots poking out of the face and hanging, on one flat plain pure magenta background on the right, thin dark '
           f'outline, {LIGHT}, no stone slab, no base, no text')
    items[w] = [
        {'kind': 'tile', 'name': f'fill-w{w}-a', 'start': f'fill-w{w}.webp', 'prompt': tex, 'neg': NEG_TILE, 's1': 0.62, 'seed': 11,
         's2': 0.45, 'seeds2': [3, 5, 7], 'w': 1024, 'h': 1024, 'band': 80},
        {'kind': 'tile', 'name': f'fill-w{w}-b', 'start': f'fill-w{w}.webp', 'prompt': tex, 'neg': NEG_TILE, 's1': 0.72, 'seed': 23,
         's2': 0.45, 'seeds2': [3, 5, 7], 'w': 1024, 'h': 1024, 'band': 80},
        {'kind': 'strip', 'name': f'lip-w{w}-a', 'start': f'lip-w{w}.webp', 'prompt': lip, 'neg': NEG_KEY, 's1': 0.66, 'seed': 5,
         's2': 0.4, 'seeds2': [9], 'w': 1536, 'h': 240, 'band': 96},
        {'kind': 'strip', 'name': f'lip-w{w}-b', 'start': f'lip-w{w}.webp', 'prompt': lip, 'neg': NEG_KEY, 's1': 0.76, 'seed': 17,
         's2': 0.4, 'seeds2': [9], 'w': 1536, 'h': 240, 'band': 96},
        {'kind': 'plain', 'name': f'end-w{w}-a', 'start': f'end-w{w}.webp', 'prompt': end, 'neg': NEG_KEY, 'strength': 0.6, 'seed': 5,
         'w': 512, 'h': 768},
        {'kind': 'plain', 'name': f'end-w{w}-b', 'start': f'end-w{w}.webp', 'prompt': end, 'neg': NEG_KEY, 'strength': 0.7, 'seed': 29,
         'w': 512, 'h': 768},
    ]

common = {'note': 'hf-art-ground: soil textures, top lips, bank ends (VI-8), 2026-10-29',
          'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
          'neg': NEG_TILE, 'base': BASE}
here = Path(__file__).resolve().parent
for part, ws in (('a', [6, 7, 1, 2]), ('b', [3, 4, 5, 8]), ('c', [9, 10])):
    p = here / f'spec-ground-{part}.json'
    p.write_text(json.dumps({**common, 'items': [i for w in ws for i in items[w]]}, indent=1))
    print(p)
