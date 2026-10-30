"""Write spec-art6.json (hf-art-ground, 2026-10-29; Matt: each world its own bounce plant, painted): per world its cap (two seeds) and its
stalk, img2img from starts5.py's tinted starts.
    python3 tools/art/hfground/make_spec6.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1]
STYLE = 'slothadv style, painted storybook illustration'
NEG = ('thick black outline, sticker, comic, flat vector, clip art, text, letters, watermark, frame, border, photo, 3d render, blurry, '
       'gradient background, cast shadow, ground, grass, sparkles, sloth, animal, people, umbrella handle')
CAP = {1: 'a big bouncy rainforest canopy mushroom, a domed warm tan-brown cap with pale cream freckles and a little moss on it',
       2: 'a big bouncy river flower, a broad round green lily pad cupping a pale pink water lily with soft petals',
       3: 'a big bouncy grotto mushroom, a domed deep teal cap with round softly glowing cyan spots, pale glowing gills',
       4: 'a big bouncy fern bud, a wide fan of curled pale blue-green fern fronds unrolling like a parasol, misty and dewy',
       5: 'a big bouncy golden orchid seen from the side, wide golden petals and a soft pink lip, a garden flower',
       6: 'a big bouncy swamp pitcher plant, a wide open pitcher mouth with a red-veined rim and green-yellow lid',
       7: 'a big bouncy stone lotus, broad pale weathered stone-white lotus petals with moss in the cracks, a temple carving come alive',
       8: 'a big bouncy moon flower, a wide pale silver-blue bell bloom glowing softly at night',
       9: 'a big bouncy volcanic mushroom, a domed ash-grey cap with thin glowing ember-orange cracks',
       10: 'a big bouncy iron thistle, a wide spiky dark purple-grey thistle head with steel-blue bracts'}
STALK = {1: 'a thick pale cream mushroom stem', 2: 'a green lily stalk', 3: 'a pale teal glowing mushroom stem',
         4: 'a blue-green fern stalk', 5: 'a green orchid stalk', 6: 'an olive green swamp plant stalk', 7: 'a mossy pale stone stalk',
         8: 'a slender silver-blue flower stalk', 9: 'an ash-grey mushroom stem', 10: 'a dark grey-purple thistle stalk'}
items = []
for w, d in CAP.items():
    for seed in (5, 9):
        items.append({'kind': 'plain', 'name': f'bounce-w{w}-s{seed}', 'start': f'bounce-w{w}.webp', 'strength': 0.72, 'seed': seed,
                      'w': 512, 'h': 512, 'neg': NEG,
                      'prompt': f'{STYLE}, a game prop for a side-scrolling platform game, side-on: {d}, the top of its stem below, richly '
                                'painted like a storybook, painterly texture, soft highlights and deep shade, thin dark outline, soft cel '
                                'shading, light from the upper left, evenly lit, on one flat plain pure magenta background, no shadow, no text'})
    items.append({'kind': 'strip', 'name': f'stalkw-w{w}', 'start': f'stalkw-w{w}.webp', 'neg': NEG, 's1': 0.5, 'seed': 5, 's2': 0.38,
                  'seeds2': [9], 'w': 1024, 'h': 160, 'band': 96,
                  'prompt': f'{STYLE}, a long straight horizontal strip for a side-scrolling platform game, lying on its side: {STALK[w]} with '
                            'faint lines along it, the left and right ends continue seamlessly, thin dark outline, soft cel shading, light '
                            'from the top, evenly lit, on one flat plain pure magenta background, no shadow, no text'})
spec = {'note': 'hf-art-ground: each world its own bounce plant, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/', 'items': items}
(Path(__file__).parent / 'spec-art6.json').write_text(json.dumps(spec, indent=1))
print(len(items), 'items')
