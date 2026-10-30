"""Write tools/art/hfbatch/spec-hfb-petals.json (2026-10-29, hazard-anim): drifting petals for the weather of Worlds 2 and 5 (and the
petals in Dot's flight), img2img (w6to10/img2imggpu.py) from petalstart.py's crops of the game's own painted flowers, on green (the petals
are pink), two strengths x two seeds at 1024 x 1024. The start is read from GitHub raw at a pushed commit of hazard-anim.
    python3 tools/art/hfbatch/make_petals_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
P = ("slothadv style, painted storybook illustration, a 2D game sprite sheet in a 4 by 4 grid: sixteen single loose flower petals "
     "drifting on the wind, each one separate with space around it, every one a different shape and colour: soft pink, white, rose, "
     "lilac, violet, peach, orange, yellow and red tropical petals, some curled, some flat, a few tiny whole blossoms, a pink cherry "
     "petal, an orchid petal. Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure green "
     "background, no stems, no leaves, no shadow, no text")
NEG = ('perspective, isometric, text, letters, numbers, watermark, frame, border, grid lines, photo, 3d render, blurry, gradient '
       'background, ground, cast shadow, drop shadow, leaves, stems, insects, faces, square edges, cut-off shapes')
items = [{'name': f'petals-s{round(st * 100)}-{sd}', 'start': 'start-petals.webp', 'prompt': P, 'neg': NEG, 'strength': st,
          'seed': sd, 'w': 1024, 'h': 1024} for st in (0.7, 0.82) for sd in (7, 23)]
spec = {'note': 'drifting petals by img2img from tools/art/hfbatch/petalstart.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfb-petals.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
