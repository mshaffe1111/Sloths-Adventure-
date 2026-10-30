"""hfboss910b (2026-10-30): the new 9-10 and 10-10 set pieces (reference/boss-design/9-10-and-10-10.md §6 on boss-design-9-10) from
boss910starts.py, 2 strengths x 2 seeds each with the style model; the council hall (wide and tall) and the wall break as edits of the
warroom story plate by Qwen-Image-Edit-2509. Run by tools/art/hfdrake/storygpu.py.
    python3 tools/art/hfdrake/make_spec_boss910b.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = ' Soft painted storybook illustration, soft cel shading, thick dark outline, evenly lit, slothadv style.'
SHEET = 'slothadv style, a sprite sheet of separate side-view platformer props on a flat magenta background, each piece separate: '
P = {
    '910-ledges': ((0.55, 0.68), SHEET + 'six black volcanic basalt rock shelves, each standing on its own thick rock column down to the '
                   'bottom edge, heaped with shiny gold coins, rusty tin mugs, a dented old teapot and a battered wooden treasure chest.'),
    '910-ribs': ((0.55, 0.68), SHEET + 'three tall narrow jagged black basalt rock spires standing on the ground, cracked, faint warm '
                 'light on their edges.'),
    '910-crust': ((0.5, 0.62), SHEET + 'long thin flat strips of cooling volcanic crust floating on lava, five rows: glowing molten '
                  'orange; orange with dark cooling patches; dark grey-black with thin glowing orange cracks; cold matte black basalt; '
                  'broken into black plates with glowing orange gaps between.'),
    '910-lava': ((0.45, 0.58), 'slothadv style, a side view of a lava surface filling the lower part of the picture, a bright glowing '
                 'yellow-orange top edge with slow swirls and a few bubbles, deepening to dark red at the bottom, above it flat magenta.'),
    '1010-table': ((0.55, 0.68), SHEET + 'a very long, heavy, plain old bare-oak council table with thick legs and scratches; the same '
                   'table tipped up on one end as a tall wooden wall; the table splintered into three broken pieces.'),
    '1010-chairs': ((0.55, 0.68), SHEET + 'ten heavy old wooden council chairs with tall backs, each back carved with a different sign '
                    '(a fang, a crown, an eye, a feather, a spider web, reeds, a stone block, a moth, a flame, a thorn), one taller grander '
                    'dark head chair with iron studs, one chair tumbling through the air, one fallen on its side, one broken in pieces.'),
    '1010-net': ((0.5, 0.62), SHEET + 'black wrought-iron diamond lattice netting panels between square grey stone pillars topped with '
                 'iron spikes, wet with rain, and one netting panel bent and torn open; the magenta shows through the holes of the lattice.'),
    '1010-hedge': ((0.5, 0.62), SHEET + 'a low hedge of black twisted thorny iron vines with long sharp thorns, clearly dangerous, and '
                   'its tapering end piece on the right.'),
    '1010-rubble': ((0.5, 0.62), SHEET + 'three heaps of broken grey castle stones, wet with rain, and a grey stone battlement wall with '
                    'merlons on top, its right half broken off in a jagged edge.'),
}
items = []
for n, (ss, p) in P.items():
    for s in ss:
        for sd in (7, 23):
            items.append({'name': f'{n}-s{round(s * 100)}-{sd}', 'start': f'start-{n}.webp', 'prompt': p + STYLE, 'strength': s, 'seed': sd,
                          'w': 2048, 'h': 512 if n in ('910-lava', '1010-hedge') else 1024, 'loras': [['style', 1.0]]})
HALL = ('Turn this room into the great council hall of the same dark stone fortress at night in a storm: a long, high vaulted stone '
        'hall seen from the side, tall arched windows with rain and lightning outside, long red banners with a black paw crest, iron '
        'candle stands, one lantern hanging on a long chain, cold blue-grey light with warm lamplight. Remove the round table and the map: '
        'the stone floor along the bottom is empty and flat. Same painted style and colours.')
BREAK = ('Show only the far stone end wall of this same hall, filling the picture, with a huge jagged hole burst through it, broken stones '
         'flying outward, and through the hole a rainy night courtyard with lightning. Solid flat magenta (#FF00FF) everywhere outside the '
         'wall. Same painted style and colours.')
CRACK = ('Show only a section of this same stone wall, filling the picture: big cracks spreading across the stones from the middle, '
         'dust puffing from the cracks, a few stones starting to bulge out. Solid flat magenta (#FF00FF) everywhere outside the wall. '
         'Same painted style and colours.')
for sd in (2, 6):
    items.append({'name': f'hall-wide-{sd}', 'start': 'start-warroom.webp', 'edit': True, 'prompt': HALL + ' A very wide view.',
                  'seed': sd, 'w': 2048, 'h': 880})
    items.append({'name': f'hall-tall-{sd}', 'start': 'start-warroom.webp', 'edit': True, 'prompt': HALL, 'seed': sd,
                  'w': 1024, 'h': 1792})
    items.append({'name': f'break-open-{sd}', 'start': 'start-warroom.webp', 'edit': True, 'prompt': BREAK, 'seed': sd,
                  'w': 1024, 'h': 1024})
    items.append({'name': f'break-crack-{sd}', 'start': 'start-warroom.webp', 'edit': True, 'prompt': CRACK, 'seed': sd,
                  'w': 1024, 'h': 1024})
spec = {'note': 'hfboss910b: 9-10 and 10-10 set pieces, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfboss910b.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
