"""Write tools/art/hfground/spec-art3.json (hf-art-ground, 2026-10-29): the water signs, round 2. The first takes (spec-art2.json) came
from the old comic sheet and kept its thick black outline and painted wave. These start from starts2.py sign_sketch: a plain board of
planks with the water lines cut in as grooves. Three strengths per look.
    python3 tools/art/hfground/make_spec3.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1]
HERE = Path(__file__).resolve().parent
BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/'
STYLE = 'slothadv style, painted storybook illustration'
NEG = ('thick black outline, black lines, sticker, comic, cartoon outline, painted picture, blue paint, blue water, words, letters, text, '
       'watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, people, sloth, animal')
LOOK = {'jungle': 'warm brown weathered wood, a green vine winding up the post',
        'w5': 'pale silver-grey weathered wood, a twist of white silk and one white orchid on the post, soft purple garden grass at its foot'}
items = []
for look, what in LOOK.items():
    for st, sd in ((0.62, 7), (0.72, 19), (0.8, 29)):
        items.append({'kind': 'plain', 'name': f'sign2-{look}-s{round(st * 100)}-{sd}', 'start': f'sign2-{look}.webp', 'strength': st,
                      'seed': sd, 'w': 448, 'h': 640, 'neg': NEG,
                      'prompt': f'{STYLE}, a hand-carved wooden warning sign on a post for a side-scrolling platform game, side-on: a board of '
                                f'three planks held by iron nails, three wavy water lines carved deep into the wood as grooves, the top one '
                                f'curling over, the grooves darker than the board with lit lower edges, {what}, painted in soft cel shading '
                                f'with no black outline, the edges drawn in a darker shade of the wood, light from the upper left, evenly '
                                f'lit, on one flat plain pure magenta background, no shadow, no text'})
spec = {'note': 'hf-art-ground job 3: carved water signs, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE, 'items': items}
p = HERE / 'spec-art3.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
