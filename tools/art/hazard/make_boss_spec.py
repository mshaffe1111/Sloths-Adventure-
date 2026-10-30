"""Write tools/art/hazard/spec-hfb-bossatk.json (2026-10-29, hazard-anim round 3): the bosses' code-drawn attacks repainted by img2img
(w6to10/img2imggpu.py) from bossstarts.py's plain shapes: three sheets, two strengths x two seeds. The starts are read from GitHub raw at
a pushed commit of hazard-anim.
    python3 tools/art/hazard/make_boss_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
TAIL = ("Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no ground, "
        "no shadow, no text")
P = {
    'cols': ("slothadv style, painted storybook illustration, a 2D game effects sheet of six tall boss attacks erupting straight up out of "
             "the ground, side view, in a row, each separate: a roaring geyser of molten lava with glowing gold spray at its top, a "
             "thicket of dark brown thorny bramble stems with hooked thorns, three jagged grey stone spikes, a cluster of glowing pale "
             "blue crystals, white spider silk strands rising from a web, a green scaly crocodile tail bursting upward. " + TAIL),
    'bits': ("slothadv style, painted storybook illustration, a 2D game sprite sheet in a 4 by 4 grid of boss attack pieces, side view, each "
             "separate: a hanging grey stone stalactite spike, a small purple bat with wings spread, a thrown wooden club, a thorn dart, "
             "a glob of molten lava, a glob of brown mud, a puddle of lava, a puddle of mud, a slate-blue stalactite spike, a second "
             "bat, a second club, a second thorn dart, a glob of green venom, a puddle of green venom, a cluster of glowing embers, a "
             "grey rock. " + TAIL),
    'strips': ("slothadv style, painted storybook illustration, a 2D game effects sheet of nine long horizontal strips stacked, side view, "
               "each separate: a roaring jet of fire, a thorny green vine whip, a glowing violet magic energy beam, a white spear-thrust "
               "streak, a wave of jagged grey rock spikes rising from the ground, a wave of molten lava spikes, a wave of brown thorns, "
               "a row of flames burning along the ground, a strip of bubbling molten lava. " + TAIL),
}
NEG = ('perspective, isometric, seen from above, text, letters, numbers, watermark, frame, border, grid lines, photo, 3d render, blurry, '
       'gradient background, sky, scenery, ground plane, cast shadow, people, sloth')
SIZE = {'cols': (1536, 768), 'bits': (1024, 1024), 'strips': (1536, 1152)}
items = [{'name': f'boss{k}-s{round(st * 100)}-{sd}', 'start': f'start-boss{k}.webp', 'prompt': P[k], 'neg': NEG, 'strength': st,
          'seed': sd, 'w': SIZE[k][0], 'h': SIZE[k][1]} for k in P for st in (0.7, 0.82) for sd in (7, 23)]
spec = {'note': "the bosses' attacks by img2img from tools/art/hazard/bossstarts.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfb-bossatk.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
