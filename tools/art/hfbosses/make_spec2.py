"""Round 2 of the boss art batch (hf-art-bosses, 2026-10-29): the storm clouds, the mud wave and splash, and the dust puff again, from
bossstarts2.py's starts at higher strengths (the first round kept the plain start shapes). Same pipeline as make_spec.py.
    python3 tools/art/hfbosses/make_spec2.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = 'Soft cel shading, thin dark outline, light from the upper left, painted storybook illustration, slothadv style'
KEYED = ' Evenly lit, on one flat plain pure {key} background, no shadow, no text.'
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, scenery, sky, landscape, '
       'cast shadow, people, sloth, character, face, eyes')
SHEETS = {
    'fx-storm': ('start-fx-storm.webp', 'bright green', (1536, 1024),
        'slothadv style, a sheet of game effect pieces, each separate on the background: along the top three different dark violet '
        'thunderclouds, billowing and lumpy with rounded puffs, lilac highlights on their tops, deep indigo underneath; below them two '
        'long low banks of the same storm cloud lying flat. ' + STYLE),
    'fx-mud': ('start-fx-mud.webp', 'magenta', (1536, 1024),
        'slothadv style, a sheet of game effect pieces, each separate on the background: on the left a breaking wave of thick wet brown '
        'river mud rolling to the right, its crest curling over at the top, clods of mud flying off it; on the right a crown splash of '
        'cyan-white river water thrown up in spikes with droplets flying off their tips, over a small dark teal pool. ' + STYLE),
    'dust2': ('start-dust2.webp', 'magenta', (2048, 256),
        'slothadv style, an animation strip of eight frames left to right, each separate on the background: a soft cartoon puff of tan '
        'jungle dust kicked up from the ground, small at first, billowing out round and fluffy, then breaking apart into little wisps '
        'and fading. ' + STYLE),
}
items = []
for n, (st, key, (w, h), p) in SHEETS.items():
    for s in (0.8, 0.88):
        for sd in (7, 23):
            items.append({'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p + KEYED.format(key=key), 'neg': NEG, 'strength': s,
                          'seed': sd, 'w': w, 'h': h})
spec = {'note': 'hfboss-fx2: boss art batch round 2, hf-art-bosses, 2026-10-29', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfboss-fx2.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
