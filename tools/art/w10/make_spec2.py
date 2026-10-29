"""Write tools/art/w10/spec-w10-props2.json (2026-10-29): round 2 by img2img from the round-1 picks (starts2.py), low strengths so the
painting stays and only the state changes: the rods charged and spent, the rods' additive fx (tip halos, after-glow, smoke), and the
cracked rampart. Two strengths x two seeds each.
    python3 -I tools/art/w10/make_spec2.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/w10/'
STY = 'Soft cel shading, thin dark outline, light from the upper left'
KEYM = ', on one flat plain pure magenta background, no sky, no shadow, no text'
ROD = ('slothadv style, painted storybook illustration for a side-scrolling platform game, two tall iron lightning rods seen from the '
       'side on riveted stone footings, left a spear-tipped rod, right a rod with a spiked crown and a copper coil, ')
SH = {
    'rodcharge': (ROD + 'both CHARGED with electricity: the spear tip, the crown prongs and the coil glow bright pale blue-white, '
                  'white-hot at the very tips, the glow painted on the metal. ' + STY + KEYM, (0.35, 0.45), 'm'),
    'rodspent': (ROD + 'just struck by lightning: the tips faintly glowing pale blue and blackened with soot. ' + STY + KEYM,
                 (0.35, 0.45), 'm'),
    'rodfx': ('slothadv style, painted storybook illustration, game effect sprites on a plain pure black background: two balls of '
              'crackling blue-white electricity with small jagged sparks, a soft dim blue after-glow, and two thin curls of grey smoke '
              'rising, hand-painted glowing light, no text', (0.45, 0.6), 'b'),
    'rampcrack': ('slothadv style, painted storybook illustration for a side-scrolling platform game, seen straight from the side: a '
                  'fortress battlement slab of dark grey dressed storm stone with a riveted rusty iron band, CRACKED: deep dark cracks '
                  'running through the stones and chips broken out of its top edge, about to crumble; four loose broken chunks of the '
                  'same stone; a patch of grey stone with a soot scorch mark. ' + STY + ', evenly lit' + KEYM, (0.35, 0.45), 'm'),
}
NEGM = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, '
        'photo, 3d render, blurry, gradient background, sky, cast shadow, people, sloth, animal')
NEGB = ('text, letters, numbers, watermark, frame, border, photo, 3d render, sky, clouds, ground, landscape, people, animal, '
        'vector art, flat neon, straight ruler lines')
items = [{'name': f'w10{n}-s{round(st * 100)}-{sd}', 'start': f'start-w10-{n}.webp', 'prompt': p, 'neg': NEGM if k == 'm' else NEGB,
          'strength': st, 'seed': sd} for n, (p, sts, k) in SH.items() for st in sts for sd in (7, 23)]
spec = {'note': 'World 10 round 2 (states) by img2img from tools/art/w10/starts2.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-w10-props2.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
