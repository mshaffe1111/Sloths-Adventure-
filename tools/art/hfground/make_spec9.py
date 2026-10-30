"""Write spec-face-810.json (hf-art-ground, 2026-10-30; W8-10 inventory item 3): four bank-face pieces per world painted into the world's
own soil (starts8.py), two seeds each, for feathering into the banks' faces like World 7's statues and World 6's roots.
    python3 tools/art/hfground/make_spec9.py <commit>
"""
import json, sys
from pathlib import Path

REF = sys.argv[1]
STYLE = 'slothadv style, painted storybook illustration'
NEG = 'text, letters, watermark, frame, border, photo, 3d render, blurry, sky, grass, sloth, animal, people, magenta, pink'
FACE = {8: ['a dark tree hollow in the earth wall with a faint blue glow inside', 'a cluster of softly glowing blue-green shelf fungus growing out of the earth wall',
            'thick pale moonlit roots breaking out of the earth wall and curling back in', 'an old owl nest hole in the earth wall with a few feathers and twigs'],
        9: ['a glowing orange ember vein cracking through the dark basalt rock', 'a shiny black obsidian outcrop set into the dark basalt rock',
            'fossil bones of an old creature half buried in the dark basalt rock', 'a small cave pocket in the dark basalt rock with red embers glowing inside'],
        10: ['a rusted iron girder half buried in the rocky earth wall', 'a heavy rusted iron chain hanging out of the rocky earth wall',
             'broken old fortress masonry blocks set into the rocky earth wall', 'a small barred iron grate in the rocky earth wall with darkness behind it']}
items = []
for w, ds in FACE.items():
    for i, d in enumerate(ds):
        for seed in (5, 9):
            items.append({'kind': 'plain', 'name': f'face-w{w}-{i}-s{seed}', 'start': f'face-w{w}.webp', 'strength': 0.72, 'seed': seed,
                          'w': 512, 'h': 512, 'neg': NEG,
                          'prompt': f'{STYLE}, a cross-section of the ground under a side-scrolling platform game level, seen from the side: '
                                    f'{d}, in the middle of the picture, the rest of the picture plain earth of the same colour, soft cel '
                                    'shading, evenly lit, no text'})
spec = {'note': 'hf-art-ground: Worlds 8-10 bank-face pieces, 2026-10-30',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/', 'items': items}
(Path(__file__).parent / 'spec-face-810.json').write_text(json.dumps(spec, indent=1))
print(len(items), 'items')
