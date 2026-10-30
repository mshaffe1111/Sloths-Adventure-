"""Write spec-ground-v.json (hf-art-ground, 2026-10-30; CLEAN-SWEEP G1, G2): per world one more soil texture (two seeds; 'vary', its
edges kept so it lays next to the three in the game), two more top lips ('varystrip', their ends kept) and two more bank ends ('plain').
    python3 tools/art/hfground/make_spec7.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1] if len(sys.argv) > 1 else 'hf-art-ground'
# the prompt tables of make_spec.py (lines 1-42; importing it would write its own specs)
_src = (Path(__file__).parent / 'make_spec.py').read_text().split('\nitems = {}')[0]
_ns = {'__file__': str(Path(__file__).parent / 'make_spec.py')}
exec(compile(_src.replace("REF = sys.argv[1] if len(sys.argv) > 1 else 'hf-art-ground'", "REF = ''"), 'make_spec.py', 'exec'), _ns)
SOIL, LIP, LIGHT, STYLE, NEG_TILE, NEG_KEY = (_ns[k] for k in ('SOIL', 'LIP', 'LIGHT', 'STYLE', 'NEG_TILE', 'NEG_KEY'))
# (World 7's ground is the temple wall built in gen2-w7, e949275: its soil prompt is that round's)
SOIL[10] = 'broken dark grey-brown volcanic rock, irregular angular chunks wider than tall, deep dark jagged cracks, a few dull rusty patches'
SOIL[5] = 'rich warm brown garden soil, thin pale tangled roots, scattered grey-brown pebbles and small stones'
items = []
for w in range(1, 11):
    items.append({'kind': 'vary', 'name': f'vfill-w{w}', 'start': f'vfill-w{w}.webp', 's2': 0.5, 'seeds2': [21, 23], 'w': 1024, 'h': 1024,
                  'band': 96, 'neg': NEG_TILE,
                  'prompt': f'{STYLE}, a seamless tileable square texture for a side-scrolling platform game, a cross-section of the ground '
                            f'deep under the surface: {SOIL[w]}. The same density all over, no top, no bottom, no border, no horizon, no '
                            f'grass on top, {LIGHT}, must tile seamlessly in all four directions'})
    items.append({'kind': 'varystrip', 'name': f'vlip-w{w}', 'start': f'vlip-w{w}.webp', 's2': 0.45, 'seeds2': [31, 33], 'w': 1024, 'h': 160,
                  'band': 96, 'neg': NEG_KEY,
                  'prompt': f'{STYLE}, a long horizontal strip for a side-scrolling platform game, the top edge of a ground bank seen from the '
                            f'side: {LIP[w]}, thin roots and moss strands hanging down from its underside, on one flat plain pure magenta '
                            f'background, the left and right ends continue seamlessly, thin dark outline, {LIGHT}, no text'})
    for seed in (41, 43):
        items.append({'kind': 'plain', 'name': f'vend-w{w}-s{seed}', 'start': f'vend-w{w}.webp', 'strength': 0.55, 'seed': seed, 'w': 384,
                      'h': 576, 'neg': NEG_KEY,
                      'prompt': f'{STYLE}, a game piece for a side-scrolling platform game: the right-hand end of a ground bank where it drops '
                                f'away, seen from the side, the top lip of {LIP[w]} rounding over the corner, below it the soil face of '
                                f'{SOIL[w]} sloping back in with roots hanging down, on one flat plain pure magenta background, thin dark '
                                f'outline, {LIGHT}, no text'})
spec = {'note': 'hf-art-ground clean sweep G1/G2: soil, lip and end variants, 2026-10-30',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG_KEY,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/', 'items': items}
(Path(__file__).parent / 'spec-ground-v.json').write_text(json.dumps(spec, indent=1))
print(len(items), 'items')
