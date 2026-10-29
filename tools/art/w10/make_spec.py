"""Write tools/art/w10/spec-w10-props.json (2026-10-29): World 10's painted pieces by img2img (tools/art/w6to10/img2imggpu.py, Qwen-Image
+ mshaffe111/slothadv-style-lora) from the starts tools/art/w10/starts.py makes (pushed on branch gen2-w10-artstarts, read from GitHub raw
at a pinned commit), two strengths x two seeds each.
    python3 -I tools/art/w10/make_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/w10/'
STY = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit')
KEYM = ', on one flat plain pure magenta background, no sky, no shadow, no text'
KEYB = ', on a plain pure black background, no sky, no ground, no text'
SH = {
    'rods': ('slothadv style, painted storybook illustration for a side-scrolling platform game, two tall iron lightning rods seen from '
             'the side, each standing on a small square riveted grey stone footing with an iron collar plate. Left: a plain rusty iron '
             'rod with iron bands and a sharp spear tip with two barbs. Right: a rusty iron rod with a crown of four sharp prongs on top '
             'and a thick coil of copper wire wound around its upper part. Dark weathered iron with orange-brown rust, grey storm stone. '
             + STY + KEYM, (0.55, 0.68), 'magenta'),
    'bolts': ('slothadv style, painted storybook illustration, four tall jagged forked lightning bolts striking straight down, each one '
              'different, a bright white-blue core with a soft cyan glow around it, hand-painted glowing light with soft painted edges, '
              'game effect sprites' + KEYB, (0.5, 0.65), 'black'),
    'bursts': ('slothadv style, painted storybook illustration, three game effect sprites of a lightning strike hitting the ground: a '
               'bright white-blue flash bursting up from the ground, then crackling blue electric arcs and sparks along the ground, then '
               'a fading blue glow with a few sparks and a thin curl of grey smoke, hand-painted glowing light' + KEYB, (0.5, 0.65),
               'black'),
    'spikes': ('slothadv style, painted storybook illustration for a side-scrolling platform game, a long row of sharp rusty iron '
               'spikes set in a heavy dark riveted iron base bar, seen from the side, the spikes of slightly different heights, some '
               'leaning a little, dangerous, sharp points, dark iron with orange-brown rust, and two short end pieces of the same bar '
               'with bolted iron end brackets. ' + STY + KEYM, (0.5, 0.62), 'magenta'),
    'rampart': ('slothadv style, painted storybook illustration for a side-scrolling platform game, seen straight from the side: a '
                'fortress battlement slab of dark grey dressed storm stone blocks with a worn flat top and a riveted rusty iron band '
                'across it; four loose broken chunks of the same stone; and below, a patch of grey stone with a black soot scorch mark '
                'burnt onto it with a few glowing orange embers. ' + STY + KEYM, (0.55, 0.68), 'magenta'),
    'wind': ('slothadv style, painted storybook illustration, game effect sprites: three bands of storm wind blowing driving rain '
             'sideways, many thin slanted pale blue-white streaks of wind-driven rain of different lengths, gusting, a few small leaves '
             'and a torn scrap of red cloth tumbling in the wind, hand-painted soft streaks' + KEYB, (0.5, 0.65), 'black'),
}
NEGM = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, '
        'photo, 3d render, blurry, gradient background, sky, cast shadow, people, sloth, animal')
NEGB = ('text, letters, numbers, watermark, frame, border, photo, 3d render, sky, clouds, ground, landscape, people, animal, '
        'vector art, flat neon, straight ruler lines')
items = []
for name, (prompt, strengths, key) in SH.items():
    for st in strengths:
        for sd in (7, 23):
            items.append({'name': f'w10{name}-s{round(st * 100)}-{sd}', 'start': f'start-w10-{name}.webp', 'prompt': prompt,
                          'neg': NEGM if key == 'magenta' else NEGB, 'strength': st, 'seed': sd})
spec = {'note': 'World 10 painted pieces by img2img from tools/art/w10/starts.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-w10-props.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
