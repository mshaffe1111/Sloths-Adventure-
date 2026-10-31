"""Write tools/art/w9swing/spec-w9chains.json (2026-10-29): World 9's swing chains, the chain lift's ore bucket, its pulley and the
eye bolt, img2img (w6to10/img2imggpu.py, Qwen-Image + mshaffe111/slothadv-style-lora) from chainstart.py's sheet, two strengths x two
seeds at 1024 x 1024. The start is force-added under tools/art/w9swing/starts/ and read from GitHub raw at the pushed commit `sha`.
    python3 tools/art/w9swing/make_spec.py <sha>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/w9swing/starts/'
P = ("slothadv style, painted storybook illustration, game props for a side-scrolling platform game in a volcanic jungle, each seen "
     "straight from the side and standing apart on the background: on the left three long iron chains hanging straight down, heavy old "
     "wrought-iron links, dark charcoal iron with worn grey edges and a little rust, each chain different; top right an old iron ore "
     "bucket with two riveted bands and a curved iron bail handle; under it a heavy iron pulley wheel with spokes in a forked iron "
     "bracket; bottom right a small iron eye bolt ring on a riveted plate. Soft cel shading, thin dark outline, light from the upper "
     "left, evenly lit, on one flat plain pure magenta background, no shadow, no text")
NEG = ('perspective, three-quarter view, isometric, seen from above, text, letters, numbers, watermark, frame, border, photo, 3d render, '
       'blurry, gradient background, sky, ground, floor, cast shadow, fire, lava, glow, people, animal, chrome, shiny metal')
items = [{'name': f'w9chains-s{round(st * 100)}-{sd}', 'start': 'start-w9chains.webp', 'prompt': P, 'neg': NEG, 'strength': st, 'seed': sd,
          'w': 1024, 'h': 1024} for st in (0.55, 0.7) for sd in (11, 29)]
spec = {'note': "World 9's swing chains and room irons by img2img from tools/art/w9swing/chainstart.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-w9chains.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
