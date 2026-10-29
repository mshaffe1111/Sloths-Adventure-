"""Write spec-art4.json (hf-art-ground round 3, 2026-10-29): World 5's soil retake and the painted bounce plants (caps and stalks).
    python3 tools/art/hfground/make_spec4.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1]
STYLE = 'slothadv style, painted storybook illustration'
LIGHT = 'soft cel shading, evenly lit, flat even light, no highlight band, no shadow band'
NEG_TILE = ('border, frame, edge, horizon, sky, grass, plants on top, highlight band, horizontal stripe, bright band, vignette, '
            'gradient, seam, text, letters, watermark, perspective, 3d render, photo, blurry, sloth, animal')
NEG_KEY = ('thick black outline, sticker, comic, text, letters, watermark, frame, border, photo, 3d render, blurry, gradient background, '
           'cast shadow, ground, grass, sloth, animal, people')
items = []
soil = (f'{STYLE}, a seamless tileable square texture for a side-scrolling platform game, a cross-section of the ground deep under the '
        'surface: rich warm brown garden soil, thin pale tangled roots, scattered grey-brown pebbles and a few small stones, little '
        'earthy clumps. The same density all over, no top, no bottom, no border, no horizon, no grass on top, '
        f'{LIGHT}, must tile seamlessly in all four directions')
for name, s1, seed in (('fill-w5-r', 0.58, 11), ('fill-w5-s', 0.66, 23)):
    items.append({'kind': 'tile', 'name': name, 'start': 'fill-w5r.webp', 'prompt': soil, 'neg': NEG_TILE, 's1': s1, 'seed': seed,
                  's2': 0.45, 'seeds2': [3, 5, 7], 'w': 1024, 'h': 1024, 'band': 80})
CAP = {'toad': 'a big bouncy toadstool mushroom, a domed glossy red cap with round cream spots and a pale cream rim underneath, the top of '
               'its thick cream stem',
       'parasol': 'a big bouncy parasol mushroom, a wide frilled pink umbrella cap with fine ribs underneath, the top of its slender pale '
                  'green stem',
       'bloom': 'a big bouncy jungle flower seen from the side, a flat golden pollen disc ringed by drooping orange petals, the top of its '
                'green stalk with two leaves'}
for sp, d in CAP.items():
    for seed in (3, 7):
        items.append({'kind': 'plain', 'name': f'bounce-{sp}-s{seed}', 'start': f'bounce-{sp}.webp', 'strength': 0.62, 'seed': seed,
                      'w': 512, 'h': 512, 'neg': NEG_KEY,
                      'prompt': f'{STYLE}, a game prop for a side-scrolling platform game, side-on: {d}, thin dark outline, soft cel '
                                f'shading, light from the upper left, evenly lit, on one flat plain pure magenta background, no shadow, '
                                'no text'})
STALK = {'toad': 'a thick pale cream mushroom stem with fine fibrous lines along it',
         'parasol': 'a slender pale green mushroom stem with faint lines along it',
         'bloom': 'a green flower stalk with faint lines along it'}
for sp, d in STALK.items():
    items.append({'kind': 'strip', 'name': f'stalk-{sp}', 'start': f'stalk-{sp}.webp', 'neg': NEG_KEY, 's1': 0.5, 'seed': 5, 's2': 0.38,
                  'seeds2': [9], 'w': 1024, 'h': 160, 'band': 96,
                  'prompt': f'{STYLE}, a long straight horizontal strip for a side-scrolling platform game, lying on its side: {d}, the '
                            'left and right ends continue seamlessly, thin dark outline, soft cel shading, light from the top, evenly '
                            'lit, on one flat plain pure magenta background, no shadow, no text'})
spec = {'note': 'hf-art-ground round 3: World 5 soil retake, painted bounce plants, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG_KEY,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/', 'items': items}
(Path(__file__).parent / 'spec-art4.json').write_text(json.dumps(spec, indent=1))
print(len(items), 'items')
