"""HF shopping list rows 1 and 4 (2026-10-30): the store icon (full, adaptive foreground and background) and the painted menu kit
(buttons, panels and badges, icons), from kitstarts.py's starts, 2 strengths x 2 seeds each, with the style model.
    python3 tools/art/hfui/make_spec_ui1.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = ' Soft cel shading, thin dark outline, light from the upper left, painted storybook illustration, slothadv style.'
KEY = ' Evenly lit, every piece separate on one flat plain pure magenta background, no shadow, no text, no letters.'
NEG = 'text, letters, numbers, words, watermark, frame, photo, 3d render, blurry, gradient background, scenery, cast shadow, people'
NEG_P = ('extra limbs, extra arms, extra eyes, different face, open mouth, teeth, text, letters, watermark, photo, 3d render, blurry, '
         'two sloths, backpack')
SHEETS = {
    'kit-buttons': ('start-kit-buttons.webp', 2048, 1024, (0.5, 0.62), NEG,
        'slothadv style, a sheet of separate painted wooden game buttons with no writing on them: long horizontal planks of carved wood '
        'with softly rounded ends, a lighter worn top edge, a darker lower edge, visible wood grain and two little iron nails near the '
        'ends; in warm brown wood, leaf-green painted wood and golden-orange painted wood, and some shorter planks of the same woods.'
        + STYLE + KEY),
    'kit-panels': ('start-kit-panels.webp', 2048, 1024, (0.5, 0.62), NEG,
        'slothadv style, a sheet of separate painted game menu pieces with no writing: a big blank sheet of cream parchment paper '
        'held in a carved brown wooden frame; a wide dark green-black text box framed in bark with a few small leaves along its top; a '
        'small dark wooden tile; a carved wooden slider groove with a green fill and a round orange wooden knob; a round wooden badge '
        'with a golden padlock; an empty dark carved wooden star and a shiny golden star.' + STYLE + KEY),
    'kit-icons': ('start-kit-icons.webp', 2048, 1376, (0.4, 0.52), NEG,
        'slothadv style, a sheet of twenty-four separate painted game icons in a neat grid, each keeping exactly the shape and colours '
        'in the picture: play, restart, map, trophy, cards, book, save, gear, speaker, mute, close, arrow, tick, padlock, star, heart, '
        'medal, scroll, leaf, light bulb, paw, crossed swords, expand, sloth face. Chunky painted cartoon icons with a thin dark brown '
        'outline, soft shading and a small highlight.' + STYLE + KEY),
    'icon-full': ('start-icon-full.webp', 1024, 1024, (0.3, 0.42), NEG_P,
        'slothadv style, a mobile game app icon: the head and shoulders of a friendly cartoon brown three-toed sloth, smiling with his '
        'mouth closed, big dark eye patches, a thin brown leather satchel strap across his chest, in front of a softly glowing '
        'rainforest with sunlight through the leaves. Centred, bold and clear, painted storybook illustration, no text.' + STYLE),
    'icon-fg': ('start-icon-fg.webp', 1024, 1024, (0.25, 0.35), NEG_P,
        'slothadv style, the head and shoulders of a friendly cartoon brown three-toed sloth, smiling with his mouth closed, big dark '
        'eye patches, a thin brown leather satchel strap across his chest, on one flat plain pure magenta background, no shadow, no '
        'text.' + STYLE),
    'icon-bg': ('start-icon-bg.webp', 1024, 1024, (0.45, 0.6), NEG,
        'slothadv style, a soft painted rainforest canopy backdrop, warm morning light glowing through the leaves, a misty valley, '
        'tall mossy trunks at the sides, no characters, no text.' + STYLE),
}
items = [{'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p, 'neg': ng, 'strength': s, 'seed': sd, 'w': w, 'h': h}
         for n, (st, w, h, ss, ng, p) in SHEETS.items() for s in ss for sd in (7, 23)]
spec = {'note': 'hfui1: store icon and the painted menu kit, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfui1.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
