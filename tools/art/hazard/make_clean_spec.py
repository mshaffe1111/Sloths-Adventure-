"""Write tools/art/hazard/spec-hfb-clean.json (2026-10-29 evening, CLEAN-SWEEP S1, S2, S4): img2img (w6to10/img2imggpu.py) from
cleanstarts.py's starts, two strengths x two seeds each. Read from GitHub raw at a pushed commit of hazard-anim.
    python3 tools/art/hazard/make_clean_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = 'Soft cel shading, light from the upper left, evenly lit, no text'
P = {
    'deep2': ('slothadv style, painted storybook illustration, a square seamless texture of deep clear jungle river water seen from the '
              'side underwater, deep teal-green, soft pale shafts of sunlight slanting down, tiny drifting specks of silt, faint darker '
              'shapes of stones far below, gentle, calm, no fish, no surface, ' + STYLE, 'deep2', (1024, 1024), (0.45, 0.6)),
    'deep6': ('slothadv style, painted storybook illustration, a square seamless texture of deep murky swamp water seen from the side '
              'underwater, dark olive brown and grey-green, cloudy with silt, faint drifting specks and sediment swirls, dim, '
              'unpleasant, no fish, no surface, ' + STYLE, 'deep6', (1024, 1024), (0.45, 0.6)),
    'chop': ('slothadv style, painted storybook illustration, a wide side-on strip of fast dirty choppy river water, murky olive-brown, '
             'white foamy crests along the top, bubbles and churning silt, rushing current, on one flat plain pure magenta background '
             'above the water, ' + STYLE, 'chop', (1024, 528), (0.3, 0.42)),
    'debris': ('slothadv style, painted storybook illustration, a 2D game sprite sheet in a 4 by 4 grid of things floating in dirty swamp '
               'water, each separate with space around it: soggy clumps of dead brown and green leaves, a rotten broken log chunk, a '
               'mossy stone, patches of dirty yellowish foam scum, tangles of dead twigs with leaves. Thin dark outline, on one flat '
               'plain pure magenta background, no water, ' + STYLE, 'debris', (1024, 1024), (0.62, 0.75)),
    'rubble': ('slothadv style, painted storybook illustration, a 2D game sprite sheet in a 4 by 4 grid of small ground clutter, side '
               'view, each separate: in the top two rows low lumps of glossy black volcanic obsidian rock, rounded chunky stones with '
               'violet glints, lying on the ground; in the bottom two rows old rusty broken iron spikes lying flat on grey slate, half '
               'buried, bent, harmless junk. Thin dark outline, on one flat plain pure magenta background, ' + STYLE, 'rubble',
               (1024, 1024), (0.62, 0.75)),
}
NEG = ('perspective, isometric, text, letters, numbers, watermark, frame, border, grid lines, photo, 3d render, blurry, gradient '
       'background, people, sloth, animal, fish, sky')
items = [{'name': f'{k}-s{round(st * 100)}-{sd}', 'start': f'start-{v[1]}.webp', 'prompt': v[0], 'neg': NEG, 'strength': st, 'seed': sd,
          'w': v[2][0], 'h': v[2][1]} for k, v in P.items() for st in v[3] for sd in (7, 23)]
spec = {'note': 'clean-sweep S1/S2/S4 by img2img from tools/art/hazard/cleanstarts.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfb-clean.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
