"""Write tools/art/hfbatch/spec-hfb-chairs.json (2026-10-29): 7-3's "ring of chairs" set piece, img2img (w6to10/img2imggpu.py) from the
start strip chairstart.py makes, two strengths x two seeds at 1536 x 416. The start is kept in git (tools/art/hfbatch/starts/,
force-added) and read from GitHub raw, so the branch is pushed before the job runs.
    python3 tools/art/hfbatch/make_chairs_spec.py
"""
import json
from pathlib import Path

BASE = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/hf-w7-chairs/tools/art/hfbatch/starts/'
P = ("slothadv style, painted storybook illustration, a wide side-on strip for a side-scrolling platform game: a ring of ten carved "
     "stone chairs in an ancient ruined jungle temple, standing in a shallow arc on a mossy stone floor ledge, each chair seen from the "
     "side with a tall carved back slab, a seat and a square stone leg, the chairs face the middle of the ring, one chair knocked over "
     "lying on the floor, and at the far right end an eleventh chair, plain, uncarved and smaller. Grey-green weathered temple stone "
     "with carved key patterns, soft green moss on the seats and capstones, thin dry brown roots creeping over the stone. Soft cel "
     "shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no sky, no "
     "shadow, no text")
items = [{'name': f'w7chairs-s{round(st * 100)}-{sd}', 'start': 'start-w7chairs.webp', 'prompt': P, 'strength': st, 'seed': sd,
          'w': 1536, 'h': 416} for st in (0.55, 0.72) for sd in (5, 17)]
spec = {'note': '7-3 ring of chairs by img2img from tools/art/hfbatch/chairstart.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
        'neg': ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, '
                'photo, 3d render, blurry, gradient background, sky, cast shadow, people, sloth, animal'),
        'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfb-chairs.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
