"""World 7's fifth temple wall strip (2026-10-29, the lead's round-4 review): a plain strip with no root, so a wide wall need not show
wall-1's root every other column. Start: the root-free parts of the kit's own strips (wall-1 rows 345-900 over wall-4 rows 0-345,
src/assets/w7/temple-walls.webp), at 2x; one img2img spec (w6to10/img2imggpu.py), one strength x two seeds. Cut with wall5cut.py.
    python3 tools/art/hfbatch/make_wall5.py <commit>
"""
import json, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sheet = Image.open(ROOT / 'src/assets/w7/temple-walls.webp').convert('RGB')
w1 = sheet.crop((0, 345, 220, 900))
w4 = sheet.crop((672, 0, 892, 345))
start = Image.new('RGB', (220, 900))
start.paste(w1, (0, 0))
start.paste(w4, (0, 555))
start = start.resize((448, 1824), Image.LANCZOS)
start.save(HERE / 'starts/start-w7wall5.webp', quality=95)
P = ("slothadv style, painted storybook illustration, one tall vertical strip of ruined jungle temple wall for a 2D platform game, "
     "filled edge to edge: weathered grey-green stone blocks of mixed sizes with dark mortar joints, one carved key-pattern meander "
     "band, cracks and chipped corners, soft green moss creeping down over a few block edges, no roots, no vines, no face. Flat "
     "front-on wall texture. Soft cel shading, thin dark outline, light from the upper left, evenly lit, no sky, no ground, no cast "
     "shadow, no text")
NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
       '3d render, blurry, gradient background, sky, cast shadow, people, character, animal, face, root, roots, vine, branch')
commit = sys.argv[1] if len(sys.argv) > 1 else 'gen2-w7'
spec = {'note': "World 7's plain temple wall strip (wall-5) by img2img from make_wall5.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/',
        'items': [{'name': f'w7wall5-s58-{sd}', 'start': 'start-w7wall5.webp', 'prompt': P, 'strength': 0.58, 'seed': sd, 'w': 448,
                   'h': 1824} for sd in (17, 29)]}
(HERE / 'spec-hfb-w7wall5.json').write_text(json.dumps(spec, indent=1))
print('ok')
