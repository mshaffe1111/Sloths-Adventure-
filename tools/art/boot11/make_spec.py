"""The remade 1-1 bootprint (boot11, 2026-11-05): img2img with the style model (tools/art/hfbatch/fungusgpu.py, unchanged; it reads the
spec and the starts from GitHub raw at a pushed commit) from start.py's two starts (reference/prop-sheets/qa-notes/boot11/starts/).
    python3 tools/art/boot11/make_spec.py <commit>        -> tools/art/boot11/spec-1.json, then the hf_jobs args are printed
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
sha = sys.argv[1]
REPO = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/'
P = ('slothadv style, painted storybook illustration, soft cel shading, thin dark outline, light from the upper left. One single deep '
     'footprint of a heavy soldier\'s army boot pressed hard into a bed of soft green forest moss, seen low from the side and a little '
     'above, the toe of the print pointing to the right, a big heavy square heel pressed in deepest at the left, the moss pushed up in a '
     'torn ridge all round the edge with a dark shadow inside the rim, the far inside wall of the print showing bare dark wet earth, '
     'thick chunky chevron tread lugs on the forefoot and heavy bars across the heel, the rest of the picture plain moss. Rich painted '
     'texture, World of a rainforest floor at dawn, no text')
NEG = ('bare foot, toes, paw print, animal track, claw marks, hoof, shoe, a boot standing, a whole boot, leg, person, soldier, two prints, '
       'several footprints, flowers, stones, mushrooms, text, letters, watermark, frame, border, photo, 3d render, blurry')
RND = sys.argv[2] if len(sys.argv) > 2 else '1'
# round 1: the flat starts a/b (came back as flat dark stickers: not used); round 2: the relief starts c/d at lighter strengths, so the
# repaint keeps the modelled depth and only paints it
KS, SS = {'1': ('ab', (0.5, 0.62)), '2': ('cd', (0.45, 0.56))}[RND]
items = [{'name': f'boot{k}-s{round(s * 100)}-{sd}', 'start': f'start-boot-{k}.png', 'prompt': P, 'strength': s, 'seed': sd, 'w': 1024,
          'h': 384} for k in KS for s in SS for sd in (5, 11)]
spec = {'note': f'1-1 bootprint remake (boot11), round {RND}, 2026-11-05', 'tag': f'boot11-{RND}',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.9]},
        'base': REPO + 'reference/prop-sheets/qa-notes/boot11/starts/', 'neg': NEG, 'items': items}
(H / f'spec-{RND}.json').write_text(json.dumps(spec, indent=1))
print(len(items))
