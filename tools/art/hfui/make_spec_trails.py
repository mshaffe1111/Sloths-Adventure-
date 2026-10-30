"""hftrails1 (2026-10-30): the ten world-map trails from trailstarts.py, 2 strengths x 2 seeds per sheet, with the style model, at high
strength (the 9-10 set pieces at 0.55-0.68 stayed as flat as their starts). Run by tools/art/hfdrake/storygpu.py.
    python3 tools/art/hfui/make_spec_trails.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = (' Hand-painted storybook game art, rich painted texture and soft shading, thick dark outline, each piece separate on a flat '
         'magenta background, side view, slothadv style.')
P = {
    'trails-a': 'slothadv style, five rows of trail pieces for a jungle adventure map, four pieces per row: row 1 thick twisted green '
                'jungle vine rope; row 2 smooth wet grey river stepping stones; row 3 gnarled brown tree roots dotted with tiny glowing '
                'green glowworms; row 4 fluffy white cloud puffs; row 5 green orchid stems with leaves and a pink orchid flower.',
    'trails-b': 'slothadv style, five rows of trail pieces for a jungle adventure map, four pieces per row: row 1 old wooden boardwalk '
                'planks with nails; row 2 ancient carved sandstone temple steps with moss; row 3 dark blue moonlit tree roots with a '
                'silver sheen; row 4 cooled black lava stones with glowing orange cracks; row 5 heavy dark iron chain links.',
}
items = [{'name': f'{n}-s{round(s * 100)}-{sd}', 'start': f'start-{n}.webp', 'prompt': p + STYLE, 'strength': s, 'seed': sd,
          'w': 2048, 'h': 1024, 'loras': [['style', 1.0]]} for n, p in P.items() for s in (0.7, 0.8) for sd in (7, 23)]
spec = {'note': 'hftrails1: the ten world-map trails, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hftrails1.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
