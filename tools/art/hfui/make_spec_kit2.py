"""hfui2 (2026-10-30): the start screen's own painted pieces from kit2starts.py (hanging trail signs, round tokens, a vine strand, a tag),
0.7/0.8 x 2 seeds with the style model. Run by tools/art/hfdrake/storygpu.py.
    python3 tools/art/hfui/make_spec_kit2.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
P = ('slothadv style, hand-painted game interface pieces for a cozy rainforest adventure game, each separate on a flat magenta background: '
     'a big blank wooden trail sign board of warm honey-coloured planks hanging from two twisted green jungle vines, three smaller blank '
     'wooden signs each hanging from two short vines, a blank round wooden token with a carved rim, a round token made of one big glossy '
     'green jungle leaf, a long thin hanging jungle vine with small leaves, and a small blank wooden tag hanging from a string. No text, '
     'no letters. Rich painted wood grain, soft shading, thick dark outline, slothadv style.')
items = [{'name': f'kit2-s{round(s * 100)}-{sd}', 'start': 'start-kit2.webp', 'prompt': P, 'strength': s, 'seed': sd, 'w': 2048, 'h': 1024,
          'loras': [['style', 1.0]], 'neg': 'text, letters, words, numbers, watermark, photo, 3d render, blurry'} for s in (0.7, 0.8) for sd in (7, 23)]
spec = {'note': 'hfui2: the start screen pieces, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfui2.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
