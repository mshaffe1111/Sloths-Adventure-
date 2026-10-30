"""Write spec-water-810.json (hf-art-ground, 2026-10-30; W8-10 inventory item 1): each world's pit water, the choppy strip (wrapping left to
right, two strengths) and its floating bits (two seeds), from starts7.py.
    python3 tools/art/hfground/make_spec8.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1]
STYLE = 'slothadv style, painted storybook illustration'
NEG = ('text, letters, watermark, frame, border, photo, 3d render, blurry, gradient background, sky, cast shadow, sloth, animal, people, '
       'boat, island, plants, trees')
WATER = {8: 'dark still moonlit swamp blackwater, deep navy and black, thin silver moonlight glints and soft ripples along the top',
         9: 'a pit of glowing molten lava, bright orange and yellow magma with floating dark cooled crust plates and glowing cracks, a '
            'bubbling rim along the top',
         10: 'a cold grey stormy surge of rough water, slate grey and dark teal, white foam crests and spray along the top'}
BITS = {8: 'a small raft of floating pale silver moon-lily petals and dark leaves',
        9: 'a floating chunk of cooled black volcanic crust with glowing orange cracks',
        10: 'a tangle of floating broken grey driftwood planks and frayed rope'}
items = []
for w in (8, 9, 10):
    for t, s1 in (('a', 0.62 if w != 9 else 0.74), ('b', 0.7 if w != 9 else 0.82)):
        items.append({'kind': 'strip', 'name': f'water-w{w}-chop-{t}', 'start': f'water-w{w}-chop.webp', 'neg': NEG, 's1': s1, 'seed': 7,
                      's2': 0.38, 'seeds2': [11], 'w': 1024, 'h': 528, 'band': 96,
                      'prompt': f'{STYLE}, a long horizontal strip for a side-scrolling platform game, a side view of dangerous deep water '
                                f'filling a pit: {WATER[w]}, the water fills the strip below its top edge, on one flat plain pure magenta '
                                'background above it, the left and right ends continue seamlessly, soft cel shading, evenly lit, no text'})
    for seed in (5, 9):
        items.append({'kind': 'plain', 'name': f'water-w{w}-bits-s{seed}', 'start': f'water-w{w}-bits.webp', 'strength': 0.7, 'seed': seed,
                      'w': 512, 'h': 224, 'neg': NEG,
                      'prompt': f'{STYLE}, a game prop for a side-scrolling platform game, side-on: {BITS[w]}, thin dark outline, soft cel '
                                'shading, light from the upper left, evenly lit, on one flat plain pure magenta background, no shadow, no text'})
spec = {'note': 'hf-art-ground: Worlds 8-10 pit water, 2026-10-30',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/', 'items': items}
(Path(__file__).parent / 'spec-water-810.json').write_text(json.dumps(spec, indent=1))
print(len(items), 'items')
