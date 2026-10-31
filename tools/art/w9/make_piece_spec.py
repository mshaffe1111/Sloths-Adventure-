"""Write tools/art/hfbatch/spec-w9-pieces.json (2026-10-31, GRAB-BAG.md §6): World 9's new pieces by img2img (w6to10/img2imggpu.py) from
tools/art/w9/piecestart.py's starts (force-added under tools/art/hfbatch/starts/, read from GitHub raw at a pinned commit of w9-pieces).
    python3 tools/art/w9/make_piece_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = 'Soft cel shading, thin dark outline, light from the upper left, on one flat plain pure magenta background, no sky, no text'
P = {
    'flarecool': ('slothadv style, painted storybook illustration, a side-on game prop: a thick flat slab of dark volcanic basalt rock, its '
                  'top crossed by cooled cracks that are dark grey-brown with only a faint dull red ember deep inside them, a cooled lava '
                  'drip hardened down one side, rough rock edges. ' + STYLE),
    'lavafall': ('slothadv style, painted storybook illustration, three side-on game sprites side by side on magenta: a narrow fall of '
                 'molten lava pouring straight down from the top edge, a bright yellow-white core and orange skin, ropes and drops of '
                 'liquid lava, landing at the bottom in a glowing splash with flung drops. Liquid, glowing, flowing, not solid. ' + STYLE),
    'gust': ('slothadv style, painted storybook illustration, four side-on game effect sprites in a row on magenta: a gust of hot wind '
             'streaking from left to right, pale grey ash streaks and swirls, loose dark ash flakes and a few glowing orange embers '
             'carried along, soft painted edges. ' + STYLE),
    'chunk': ('slothadv style, painted storybook illustration, two side-on game prop sprites on magenta: a chunk of black volcanic '
              'obsidian glass the size of a melon, glossy, sharp curved fractured faces, a cool purple sheen on its facets; the same '
              'chunk a little turned. ' + STYLE),
    'surge': ('slothadv style, painted storybook illustration, three side-on game effect sprites in a row on magenta: the rolling front '
              'of a surge of molten lava flowing to the right, a tall bright yellow-orange curling wave head with glowing drops, '
              'darker red lava trailing behind it. Liquid, glowing. ' + STYLE),
    'steam': ('slothadv style, painted storybook illustration, three side-on game effect sprites in a row on magenta: a low dark '
              'volcanic vent rock puffing a jet of white steam straight up in three moments: a short puff, a tall billowing column, '
              'the column breaking up and drifting. Soft round painted billows. ' + STYLE),
}
NEG = ('perspective, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, '
       'gradient background, sky, cast shadow, people, sloth, animal, grass, trees')
SIZE = {'flarecool': (1024, 512), 'lavafall': (768, 1536), 'gust': (1536, 512), 'chunk': (1024, 512), 'surge': (1536, 512), 'steam': (1536, 768)}
ST = {'flarecool': (0.4, 0.55), 'lavafall': (0.72, 0.86), 'gust': (0.7, 0.84), 'chunk': (0.65, 0.8), 'surge': (0.72, 0.86), 'steam': (0.7, 0.84)}
items = []
for n in P:
    for st in ST[n]:
        for sd in (7, 23):
            w, h = SIZE[n]
            items.append({'name': f'w9{n}-s{round(st * 100)}-{sd}', 'start': f'start-w9{n}.webp', 'prompt': P[n], 'strength': st, 'seed': sd, 'w': w, 'h': h})
spec = {'note': "World 9's new pieces by img2img from tools/art/w9/piecestart.py, 2026-10-31",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parents[1] / 'hfbatch/spec-w9-pieces.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
