"""Write tools/art/hfbatch/spec-hfb-w4pebbles.json (2026-10-29): World 4's falling-rock grit, img2img (w6to10/img2imggpu.py) from the
start pebblestart.py makes (16 bits of the world's own rock), two strengths x two seeds at 1024 x 1024. The start is read from GitHub raw
at a pushed commit of hazard-anim.
    python3 tools/art/hfbatch/make_pebbles_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
P = ("slothadv style, painted storybook illustration, a 2D game sprite sheet in a 4 by 4 grid: sixteen small loose stones and pebbles "
     "broken off a mossy grey cliff, each one separate with space around it, every one a different shape: round river pebbles, flat "
     "chips, sharp angular shards, a cracked chunk, a few with a little green moss, and in the bottom row four small scatters of gravel. "
     "Weathered grey and warm tan stone, mostly bare, soft cel shading, thin dark outline, light from the upper left, evenly lit, on "
     "one flat plain pure magenta background, no ground, no shadow, no text")
NEG = ('perspective, isometric, text, letters, numbers, watermark, frame, border, grid lines, photo, 3d render, blurry, gradient '
       'background, ground, floor, cast shadow, drop shadow, gems, crystals, eggs, leaves, animals, faces')
items = [{'name': f'w4pebbles-s{round(st * 100)}-{sd}', 'start': 'start-w4pebbles.webp', 'prompt': P, 'neg': NEG, 'strength': st,
          'seed': sd, 'w': 1024, 'h': 1024} for st in (0.5, 0.66) for sd in (7, 23)]
spec = {'note': "World 4 falling-rock grit by img2img from tools/art/hfbatch/pebblestart.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfb-w4pebbles.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
