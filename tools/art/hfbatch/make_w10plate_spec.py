"""Write tools/art/hfbatch/spec-w10plate.json (2026-10-29, branch gen2-w10-swing): World 10's pressure plate, img2img
(w6to10/img2imggpu.py, read from commit a1592ee) from starts/start-w10plate.webp (w10platestart.py): raised and pressed, side by side,
two strengths x two seeds at 1024 x 384, the style model. The start is read from GitHub raw at the commit given (push first):
    python3 tools/art/hfbatch/make_w10plate_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
P = ("slothadv style, painted storybook illustration, side view for a side-scrolling platform game: two copies of the same heavy "
     "fortress pressure plate, a thick square slab of worn grey stone set in a low dark riveted iron frame, a carved arrow mark pointing "
     "down on the slab's front edge. On the left the slab stands raised well above the frame; on the right the same plate pressed down, "
     "the slab sunk level with the iron frame's lip. Weathered, rain-darkened, a little moss in the cracks. Soft cel shading, thin dark "
     "outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no floor, no shadow, no text")
NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
       '3d render, blurry, gradient background, sky, cast shadow, people, animal, sloth, floor tiles, button, glowing')
items = [{'name': f'w10plate-s{round(st * 100)}-{sd}', 'start': 'start-w10plate.webp', 'prompt': P, 'neg': NEG, 'strength': st,
          'seed': sd, 'w': 1024, 'h': 384} for st in (0.6, 0.72) for sd in (7, 23)]
spec = {'note': "World 10's pressure plate by img2img from tools/art/hfbatch/w10platestart.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-w10plate.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
