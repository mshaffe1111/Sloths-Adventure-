"""Write tools/art/hfbatch/spec-w10banner.json (2026-10-29, branch gen2-w10-swing): World 10's swing banner, img2img
(w6to10/img2imggpu.py, read from commit a1592ee) from starts/start-w10banner.webp (w10bannerstart.py), two strengths x two seeds at
1024 x 1024, the style model. The start is read from GitHub raw at the commit given (push first):
    python3 tools/art/hfbatch/make_w10banner_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
P = ("slothadv style, painted storybook illustration, three tall narrow tattered war banners for a side-scrolling platform game, each "
     "hanging straight down from a round black iron ring on a short dark wooden crossbar, no pole below the cloth. Heavy dark red wool "
     "cloth, worn and rain-soaked, soft folds running down its length, the bottom torn into ragged points, a few small holes and frayed "
     "edges, each banner torn differently. A grim mountain fortress in a storm. Soft cel shading, thin dark outline, light from the upper "
     "left, evenly lit, on one flat plain pure magenta background, no sky, no shadow, no text, no emblem")
NEG = ('pole, stick, flagpole, staff, spear, perspective, three-quarter view, isometric, text, letters, numbers, emblem, logo, symbol, '
       'watermark, frame, border, photo, 3d render, blurry, gradient background, sky, cast shadow, people, animal, sloth, pink cloth')
items = [{'name': f'w10banner-s{round(st * 100)}-{sd}', 'start': 'start-w10banner.webp', 'prompt': P, 'neg': NEG, 'strength': st,
          'seed': sd, 'w': 1024, 'h': 1024} for st in (0.5, 0.65) for sd in (7, 23)]
spec = {'note': "World 10's swing banner by img2img from tools/art/hfbatch/w10bannerstart.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-w10banner.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
