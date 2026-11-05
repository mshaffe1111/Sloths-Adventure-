"""Write tools/art/hfbatch/spec-hfb-boot-<round>.json (2026-11-05): 1-1's Stage Cleared clue, the soldier's bootprint, by img2img
(fungusgpu.py, unchanged) from the start bootstart.py makes (in the repo under tools/art/hfbatch/starts/w1boot/, read from GitHub raw at
art-bootprint).
    python3 tools/art/hfbatch/make_boot_spec.py <round>
"""
import json, sys
from pathlib import Path

STYLE = 'slothadv style, painted storybook illustration, '
TAIL = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no '
        'shadow, no text')
BOOT = (STYLE + 'one single deep bootprint of a heavy military boot pressed into a small mound of soft green forest moss, the print '
        'showing the dark wet earth under the moss, seen from slightly above, the toe of the print pointing up toward the top of the '
        'picture, chunky chevron tread lugs on the ball of the sole and thick bars on the heel, a raised rim of torn moss around it, a '
        'rainforest floor. ' + TAIL)
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, a shoe, a boot '
       'standing, foot, toes, leg, person, soldier, animal tracks, paw print, two prints, several footprints, flowers, stones')
rnd = sys.argv[1] if len(sys.argv) > 1 else '1'
items = []
if rnd == '1':
    items += [{'name': f'boot-s{round(s * 100)}-{sd}', 'start': 'bootprint.png', 'prompt': BOOT, 'strength': s, 'seed': sd, 'w': 768,
               'h': 512} for s in (0.55, 0.68, 0.8) for sd in (5, 17)]
if rnd == '2':
    # round 2 (2026-11-05): round 1's pick (boot-s68-5) stood up like a disc on the shrine's log in the side view; the start laid down
    # (bootstart.py build_low: the face squashed, an earth edge under its front lip); seed 17 dropped (it drew a bear paw in round 1)
    LOW = (STYLE + 'one single deep bootprint of a heavy military boot pressed into a small flat bed of soft green forest moss lying on '
           'the ground, seen from slightly above and in front, the toe of the print pointing away from us, the print showing the dark '
           'wet earth under the moss, chunky chevron tread lugs on the ball of the sole and thick bars on the heel, the bed\'s front '
           'edge showing a thin band of dark earth with little roots, a rainforest floor. ' + TAIL)
    items += [{'name': f'low-s{round(s * 100)}-{sd}', 'start': 'bootprint-low.png', 'prompt': LOW, 'strength': s, 'seed': sd, 'w': 768,
               'h': 512} for s in (0.62, 0.7) for sd in (5, 11)]
spec = {'note': f'1-1 bootprint clue, round {rnd}, 2026-11-05',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]},
        'base': 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/art-bootprint/tools/art/hfbatch/starts/w1boot/',
        'neg': NEG, 'items': items}
p = Path(__file__).resolve().parent / f'spec-hfb-boot-{rnd}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
