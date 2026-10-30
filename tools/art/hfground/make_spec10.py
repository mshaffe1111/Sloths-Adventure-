"""Write spec-pm-1030.json (hf-art-ground, the lead's 2026-10-30 afternoon list): (a) the bank ends again on a pure green key, two seeds a
world; (b) World 8's rounded mossy stones for the ledges, in place of the white stalagmites; (c) more World 10 bank-face pieces, none of
them square, so the masonry block can go.
    python3 tools/art/hfground/make_spec10.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1]
_src = (Path(__file__).parent / 'make_spec.py').read_text().split('\nitems = {}')[0]
_ns = {'__file__': str(Path(__file__).parent / 'make_spec.py')}
exec(compile(_src.replace("REF = sys.argv[1] if len(sys.argv) > 1 else 'hf-art-ground'", "REF = ''"), 'make_spec.py', 'exec'), _ns)
SOIL, LIP, LIGHT, STYLE = (_ns[k] for k in ('SOIL', 'LIP', 'LIGHT', 'STYLE'))
SOIL[10] = 'broken dark grey-brown volcanic rock, irregular angular chunks wider than tall, deep dark jagged cracks, a few dull rusty patches'
SOIL[5] = 'rich warm brown garden soil, thin pale tangled roots, scattered grey-brown pebbles and small stones'
NEG = 'text, letters, watermark, frame, border, photo, 3d render, blurry, sky, sloth, animal, people, magenta, pink, purple'
items = []
for w in range(1, 11):
    for seed in (51, 53):
        items.append({'kind': 'plain', 'name': f'gend-w{w}-s{seed}', 'start': f'gend-w{w}.webp', 'strength': 0.55, 'seed': seed, 'w': 384,
                      'h': 576, 'neg': NEG,
                      'prompt': f'{STYLE}, a game piece for a side-scrolling platform game: the right-hand end of a ground bank where it drops '
                                f'away, seen from the side, the top lip of {LIP[w]} rounding over the corner, below it the soil face of '
                                f'{SOIL[w]} sloping back in with roots hanging down, on one flat plain pure bright green background, thin '
                                f'dark outline, {LIGHT}, no text'})
for st in (0.6, 0.72):
    for seed in (61, 63):
        items.append({'kind': 'plain', 'name': f'stones-w8-{int(st * 100)}-s{seed}', 'start': 'stones-w8.webp', 'strength': st, 'seed': seed,
                      'w': 512, 'h': 384, 'neg': NEG + ', spikes, thorns, sharp points, crystals',
                      'prompt': f'{STYLE}, a small game prop for a night-time rainforest platform game, seen from the side: a low cluster of '
                                'three smooth rounded slate-blue river stones with soft glowing teal moss on their tops and a few tiny pale '
                                'blue moss flowers, sitting on the ground, on one flat plain pure bright green background, thin dark '
                                'outline, soft cel shading, moonlit, no text'})
FACE10 = ['a big rusted iron ring bolted into a cracked boulder set in the rocky earth wall',
          'a heavy rusted iron chain looping out of the rocky earth wall and back in',
          'a round rusted iron porthole grate set into the rocky earth wall with darkness behind it',
          'an old dented round iron shield half buried in the rocky earth wall']
for i, d in enumerate(FACE10):
    for seed in (15, 17):
        items.append({'kind': 'plain', 'name': f'face3-w10-{i}-s{seed}', 'start': 'face-w10.webp', 'strength': 0.86, 'seed': seed,
                      'w': 512, 'h': 512, 'neg': NEG + ', bricks, masonry, square blocks, grass',
                      'prompt': f'{STYLE}, a cross-section of the ground under a side-scrolling platform game level, seen from the side: {d}, '
                                'large and clear in the middle of the picture, thin dark outline, soft cel shading, evenly lit, no text'})
spec = {'note': 'hf-art-ground: green-key bank ends, W8 stones, W10 faces, 2026-10-30 afternoon',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/', 'items': items}
(Path(__file__).parent / 'spec-pm-1030.json').write_text(json.dumps(spec, indent=1))
print(len(items), 'items')
