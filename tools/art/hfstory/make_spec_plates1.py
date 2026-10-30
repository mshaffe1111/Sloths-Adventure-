"""HF shopping list row 9 (2026-10-30): story plates #19 (the raft) and #20 (Dot at the gorge) from platestarts.py, 2 strengths x
2 seeds, painted at 1600 x 1696 (the plate shape), with the style model.
    python3 tools/art/hfstory/make_spec_plates1.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = ' Soft painted storybook illustration, soft cel shading, thin dark outline, slothadv style.'
NEG = ('text, letters, words, watermark, frame, border, photo, 3d render, blurry, extra limbs, extra arms, two sloths, two birds, '
       'smiling, laughing, open mouth')
P = {
    'plate-gorge': ('start-plate-gorge.webp', (0.45, 0.58),
        'slothadv style, an emotional storybook illustration: a deep misty gorge at dusk, the broken edge of a dark rocky cliff ledge '
        'above, and from it one long green vine. At the very end of the vine a friendly orange-brown three-toed sloth with a brown '
        'leather satchel hangs by one arm over the long white mist, looking down, scared but calm. A tiny emerald-green hummingbird has '
        'hold of one of his claws in her feet and pulls upward with her wings beating so hard they blur, far too small to lift him, '
        'trying anyway. Long white mist below, far rock spires in a purple and orange sky.' + STYLE),
    'plate-raft': ('start-plate-raft.webp', (0.45, 0.55),
        'slothadv style, a wide storybook scene with no characters in it: the muddy bank of a slow brown river in warm afternoon light, '
        'a sloth village dug into the bank with little round wooden doors, thatched huts and a big tree; on the bank a raft that is '
        'barely started, two logs lashed together with green vine rope, a pile of logs waiting beside it, a coil of vine rope, a stone '
        'hammer resting on a stump, a few wood shavings. The lower third open and calm. No people, no animals.' + STYLE),
}
items = [{'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p, 'neg': NEG if n == 'plate-gorge' else NEG + ', sloth, bird',
          'strength': s, 'seed': sd, 'w': 1600, 'h': 1696} for n, (st, ss, p) in P.items() for s in ss for sd in (7, 23)]
spec = {'note': 'hfstory1: story plates #19 and #20, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfstory1.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
