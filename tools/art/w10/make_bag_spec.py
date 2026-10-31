"""Write tools/art/w10/spec-w10-bag.json (2026-10-31): World 10's grab-bag art in ONE img2img batch (hfbatch/fungusgpu.py: takes come back
as B64 in the job log) from the two start canvases bagstarts.py makes (read from GitHub raw on w10-pieces). Two strengths x two seeds.
    python3 tools/art/w10/make_bag_spec.py
"""
import json
from pathlib import Path

STY = 'Soft cel shading, thin dark outline, light from the upper left, evenly lit'
A = ('slothadv style, painted storybook illustration for a side-scrolling platform game, a sheet of separate props for a stormy stone '
     'fortress, each seen exactly from the side, dark wet iron, old timber and grey storm stone: an iron pulley wheel on a wall bracket '
     'with a chain over it, a riveted iron counterweight on a hook, a great iron cog wheel with a bronze hub, a stone block on a toothed '
     'iron rack, a stone gatehouse arch with battlements and a raised iron portcullis, an iron floor grate swung open on its hinge, two '
     'wooden barrels with iron hoops, two timber winches with a chain drum and a ratchet wheel. ' + STY +
     ', on one flat plain pure magenta background, no sky, no shadow, no text')
B = ('slothadv style, painted storybook illustration, game effect sprites on a plain pure black background: two soft warm lantern light '
     'beams fanning down, and three frames of storm rainwater gushing out of a carved stone gargoyle spout in a thick curving stream and '
     'splashing, cold blue-white water, hand-painted, no text')
NEGM = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
        '3d render, blurry, gradient background, sky, cast shadow, people, sloth, animal')
NEGB = ('text, letters, numbers, watermark, frame, border, photo, 3d render, sky, clouds, ground, landscape, people, animal, vector art, '
        'flat neon')
items = [{'name': f'w10bag-a-s{round(s * 100)}-{sd}', 'start': 'start-w10bag-a.webp', 'prompt': A, 'neg': NEGM, 'strength': s, 'seed': sd,
          'w': 1536, 'h': 1536} for s in (0.5, 0.62) for sd in (7, 23)]
items += [{'name': f'w10bag-b-s{round(s * 100)}-{sd}', 'start': 'start-w10bag-b.webp', 'prompt': B, 'neg': NEGB, 'strength': s, 'seed': sd,
           'w': 1536, 'h': 512} for s in (0.5, 0.65) for sd in (7, 23)]
spec = {'note': 'World 10 grab bag, one batch, 2026-10-31',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]},
        'base': 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/w10-pieces/tools/art/hfbatch/starts/w10bag/',
        'neg': NEGM, 'items': items}
p = Path(__file__).resolve().parent / 'spec-w10-bag.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
