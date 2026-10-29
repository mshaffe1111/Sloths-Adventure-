"""Write tools/art/hfbatch/spec-hfb-clips.json (2026-10-29): the World 8 bat asleep, the missing moves of the W6-10 creatures whose
other clips already exist (crab defeat, sentry hurt, beetle defeat, piranha defeat) and the owl defeat redo. Each clip starts from frame
0 of the creature's own existing clip (frame 48 of the packed roost clip for the bat), so it matches that clip's canvas and scale.
    python3 tools/art/hfbatch/make_specs.py
"""
import json
from pathlib import Path

C = 'w6to10/clips/'
M = ('slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, ')
MID = ', side view facing right the whole time, it stays in the middle of the frame'
moves = [
    ('hfb-bat-sleep', [C + 'nc-fruitbat-roost-s17.zip', 48], False,
     'the small brown fruit bat hangs upside down by its feet with its wings wrapped tight around its body like a little cloak, it slowly '
     'closes its eyes and falls fast asleep, then it only breathes slowly and gently, its wrapped body swelling and settling a little, it '
     'keeps its eyes shut and its wings wrapped, it does not move from its spot, side view the whole time', [5, 17]),
    ('hfb-crab-defeat', [C + 'cr-crab-idle-s21.zip', 0], False,
     'the red cartoon crab is knocked out: it tips over onto its back with its legs curled up in the air, its eyes shut tight, and it lies '
     'still on the ground' + MID, [5, 17]),
    ('hfb-sentry-hurt', [C + 'cr-sentry-idle-s21.zip', 0], True,
     'the small mossy stone sentry holding a spear is struck: it rocks back a step, chips of stone fly off it and its glowing blue eyes '
     'flicker, then it steadies itself and stands upright again holding its spear' + MID, [5, 17]),
    ('hfb-beetle-defeat', [C + 'cr-beetle-idle-s21.zip', 0], False,
     'the orange and black beetle is knocked out: it flips over onto its back, its legs curl up and twitch, then it lies still on its back '
     'on the ground' + MID, [5, 17]),
    ('hfb-piranha-defeat', [C + 'cr-piranha-hurt-s21.zip', 0], False,
     'the red-bellied piranha fish is knocked out in mid-leap: it goes limp, rolls belly-up and drops down to the bottom of the frame and '
     'lies still on its side with its eyes shut and its mouth open' + MID, [5, 17]),
]
clips = []
for name, zs, pin, what, seeds in moves:
    for s in seeds:
        c = {'name': f'{name}-s{s}', 'zipsrc': zs, 'prompt': M + what, 'seed': s, 'w': 832, 'h': 480}
        if pin:
            c['pin'] = True
        clips.append(c)
OWL = ('the small brown owl is knocked out of the air: its wings fold, it tumbles to the ground and ends lying on its side with its eyes '
       'shut as swirly X\'s' + MID)
for s in [5, 11, 23]:
    clips.append({'name': f'hfb-owl-defeat-s{s}', 'src': 'w6to10/newstills/new-owl-505.png', 'prompt': M + OWL, 'seed': s, 'w': 832, 'h': 480})
# creaturegpu reads src under <SUB>; hfbgpu writes zip starts under <SUB>/starts, so the owl's still is given relative to SUB=hfbatch
for c in clips:
    if c.get('src', '').startswith('w6to10/'):
        c['src'] = '../' + c['src']
spec = {'tag': 'hfb-clips', 'motion': {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
                                       'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'],
                                       'scale': 0.5}, 'clips': clips}
p = Path(__file__).resolve().parent / 'spec-hfb-clips.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(clips))
