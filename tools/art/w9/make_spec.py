"""Write tools/art/hfbatch/spec-w9-hazards.json (2026-10-29): World 9's lava surface, geyser and heat haze by img2img
(w6to10/img2imggpu.py) from tools/art/w9/lavastart.py's starts, two strengths x two seeds each. The starts are force-added under
tools/art/hfbatch/starts/ and read from GitHub raw at a pinned commit of gen2-w9 (BASE, set by the caller).
    python3 tools/art/w9/make_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = 'Soft cel shading, thin dark outline, light from the upper left, on one flat plain pure magenta background, no sky, no text'
P = {
    'lava': ('slothadv style, painted storybook illustration, a wide side-on strip for a side-scrolling platform game: the surface of a '
             'river of molten lava seen exactly from the side, a bright yellow-orange glowing surface line along the top with small '
             'rolling bubbles and a few dark cooled crust plates floating on it, glowing orange cracks in the crust, the lava '
             'deepening to dark red and almost black at the bottom, no banks, no rocks at the ends, the same all the way along so it '
             'can repeat. ' + STYLE),
    'geyser': ('slothadv style, painted storybook illustration, four side-on game sprites in a row on magenta: 1) a low mound of dark '
               'basalt rock with a dark cracked vent mouth on top and a faint red glow in the cracks; 2) the same vent rock glowing '
               'bright orange in its mouth with a puff of pale grey steam rising; 3) the same vent rock erupting, a tall narrow '
               'fountain of molten lava and fire shooting straight up, bright yellow-white at its core, orange at its edges, ragged '
               'flaming top, glowing blobs of lava flung out; 4) the same eruption a moment later, the column leaning a little, '
               'blobs falling. ' + STYLE),
    'haze': ('slothadv style, painted storybook illustration, side-on game effect sprites on magenta: six soft separate columns of pale '
             'grey-pink heat haze and thin smoke rising and curling, each different, a few tiny glowing orange embers drifting among '
             'them, soft painted edges. ' + STYLE),
}
NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
       '3d render, blurry, gradient background, sky, cast shadow, people, sloth, animal, grass, trees')
items = []
for n, sts in (('lava', (0.62, 0.78)), ('geyser', (0.55, 0.7)), ('haze', (0.6, 0.75))):
    for st in sts:
        for sd in (7, 23):
            w, h = (1536, 768) if n == 'geyser' else (1536, 416)
            items.append({'name': f'w9{n}-s{round(st * 100)}-{sd}', 'start': f'start-w9{n}.webp', 'prompt': P[n], 'strength': st, 'seed': sd, 'w': w, 'h': h})
spec = {'note': "World 9's hazard art by img2img from tools/art/w9/lavastart.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parents[1] / 'hfbatch/spec-w9-hazards.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
