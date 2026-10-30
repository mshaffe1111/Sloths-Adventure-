"""hficon2 (2026-10-30, the lead's icon notes: "front-facing face filling ~70% of the 66 dp safe zone, a bold single-colour field, strong
contrast at 48 px, optional Meeca petal"): edits of Pokey's own standing painting by Qwen-Image-Edit-2509, three looks x 2 seeds, 1024.
Run by tools/art/hfdrake/storygpu.py.
    python3 tools/art/hfui/make_spec_icon2.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
KEEP = ('Keep this exact same character: the same cute orange-brown three-toed sloth with a cream face, dark brown eye patches, small dark '
        'nose, rosy cheeks, the same painted cartoon style and colours. ')
LOOKS = {
    'green': 'Make a mobile game app icon: only his head and the top of his shoulders, turned to face the viewer straight on, big friendly '
             'warm smile, eyes open and bright, filling most of the square, centred, on a solid flat bold leaf-green background, nothing '
             'else. Clean, simple, strong silhouette.',
    'gold': 'Make a mobile game app icon: only his head and the top of his shoulders, turned to face the viewer straight on, big friendly '
            'warm smile, eyes open and bright, filling most of the square, centred, on a solid flat warm golden-yellow background, nothing '
            'else. Clean, simple, strong silhouette.',
    'petal': 'Make a mobile game app icon: only his head and the top of his shoulders, turned to face the viewer straight on, big friendly '
             'warm smile, eyes open and bright, a single small pink flower petal tucked behind one ear, filling most of the square, centred, '
             'on a solid flat bold leaf-green background, nothing else. Clean, simple, strong silhouette.',
}
items = [{'name': f'icon-{k}-{sd}', 'start': 'start-pokey-ref.png', 'edit': True, 'prompt': KEEP + p, 'seed': sd, 'w': 1024, 'h': 1024,
          'neg': 'text, letters, watermark, border, frame, rounded corners, shadow, two sloths, body, legs, satchel strap'}
         for k, p in LOOKS.items() for sd in (2, 6)]
spec = {'note': 'hficon2: the app icon, front-facing, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hficon2.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
