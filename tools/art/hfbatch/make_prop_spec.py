"""Write tools/art/hfbatch/spec-hfb-props.json (2026-10-29): World 8's roost branch and seed pods, img2img (w6to10/img2imggpu.py) from
the start sheet propstart.py makes, two strengths x two seeds. The start is kept in git (tools/art/hfbatch/starts/, force-added) and read from GitHub raw.
    python3 tools/art/hfbatch/make_prop_spec.py
"""
import json
from pathlib import Path

BASE = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/hf-batch-w7w8/tools/art/hfbatch/starts/'
P = ("slothadv style, painted storybook illustration, a sheet of six separate game props in a 3 by 2 grid for a side-scrolling platform "
     "game: a short mossy tree branch, a short mossy tree branch, a seed pod, a pile of seed pods, an open seed pod with seeds inside, a "
     "small pile of seed pods. Each prop seen straight from the side, a flat front view like a cross-section, soft painted brush texture, "
     "thin dark outline, light from the upper left, a calm deep-blue night high in the treetops, silver moonlight, blue-violet bark with "
     "soft green moss, dark plum seed pods with a soft sheen. Every prop alone in its own cell with clear space around it, on one flat "
     "plain pure magenta background, no floor, no shadow, no text")
items = [{'name': f'w8roost-s{round(st * 100)}-{sd}', 'start': 'start-w8roost.webp', 'prompt': P, 'strength': st, 'seed': sd,
          'w': 1536, 'h': 1024} for st in (0.55, 0.72) for sd in (5, 17)]
spec = {'note': 'World 8 roost branch and seed pods by img2img from tools/art/hfbatch/propstart.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
        'base': BASE, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfb-props.json'
p.write_text(json.dumps(spec, indent=1))
print(p)
