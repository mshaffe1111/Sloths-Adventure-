"""Write tools/art/hfbatch/spec-hfb-lantern-<round>.json (2026-10-29): 8-4 Lantern Run's art by img2img (lanterngpu.py) from the starts
lanternstarts.py makes (uploaded to the bucket under hfbatch/w8lantern/starts/).
    python3 tools/art/hfbatch/make_lantern_spec.py <round>
"""
import json, sys
from pathlib import Path

STYLE = 'slothadv style, painted storybook illustration, '
TAIL = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit, on one flat plain pure magenta background, no '
        'shadow, no text')
JAR = (STYLE + 'a small round glass jar full of glowing yellow fireflies, a cork stopper, brown twine tied round the neck and a twine '
       'loop handle, the fireflies glowing warm golden yellow inside the clear glass, a soft highlight on the glass, side view. ' + TAIL)
JAR_DIM = (STYLE + 'a small round empty glass jar, only two faint fireflies left glowing dimly inside, a cork stopper, brown twine tied '
           'round the neck and a twine loop handle, clear pale blue glass, side view. ' + TAIL)
MOTH = (STYLE + 'a pale night moth seen from above, soft fuzzy cream and lilac wings spread wide with darker veins and a round eye spot '
        'on each forewing, a fuzzy brown body, feathery antennae, a cute storybook forest creature. ' + TAIL)
MOTH_UP = (STYLE + 'a pale night moth in flight, its soft fuzzy cream and lilac wings raised high above its body mid flap, darker veins '
           'and a round eye spot on each forewing, a fuzzy brown body, feathery antennae, a cute storybook forest creature. ' + TAIL)
POKEY = ('slothadv style, pokeysloth, a cute brown three-toed sloth cub with a cream belly and a dark eye mask, a brown leather satchel '
         'on a strap across his body, cream wrist wraps, side view facing right, carefully hugging a small glowing glass jar of '
         'fireflies against his belly with both arms, both paws wrapped round the jar, nothing else in his paws. ' + TAIL)
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, extra arms, extra '
       'limbs, extra fingers, two jars, lantern, candle, flame, fire')
rnd = sys.argv[1] if len(sys.argv) > 1 else '1'
items = []
if rnd == '1':
    items += [{'name': f'jar-s{round(s * 100)}-{sd}', 'start': 'jar.png', 'prompt': JAR, 'strength': s, 'seed': sd, 'w': 512, 'h': 512}
              for s in (0.6, 0.75) for sd in (5, 17)]
    items += [{'name': f'jardim-s70-{sd}', 'start': 'jar-dim.png', 'prompt': JAR_DIM, 'strength': 0.7, 'seed': sd, 'w': 512, 'h': 512}
              for sd in (5, 17)]
    items += [{'name': f'moth-{k}-s72-{sd}', 'start': f'moth-{k}.png', 'prompt': MOTH if k == 'open' else MOTH_UP, 'strength': 0.72,
               'seed': sd, 'w': 512, 'h': 512} for k in ('open', 'up') for sd in (5, 17)]
    items += [{'name': f'pokey-{f}-s{round(s * 100)}', 'start': f'pokey-{f}.png', 'prompt': POKEY, 'strength': s, 'seed': 7, 'w': 768,
               'h': 768, 'loras': ['style', 'pokey']} for f in ('idle', 'run_1', 'apex') for s in (0.45, 0.6)]
if rnd == '2':
    # (round 1's arms did not move: the jar sat on his belly. From the carry poses instead, his paws already round a held thing)
    items += [{'name': f'carry-{f}-s{round(s * 100)}', 'start': f'carry-{f}.png', 'prompt': POKEY, 'strength': s, 'seed': 7, 'w': 768,
               'h': 768, 'loras': ['style', 'pokey']} for f in ('p3', 'p5', 'p6', 'p7', 'p8') for s in (0.45, 0.6)]
    AIR = POKEY.replace('side view facing right, ', 'side view facing right, jumping up in the air, his legs tucked up under him, ')
    items += [{'name': f'air-p3-s70-{sd}', 'start': 'carry-p3.png', 'prompt': AIR, 'strength': 0.7, 'seed': sd, 'w': 768, 'h': 768,
               'loras': ['style', 'pokey']} for sd in (7, 19)]
if rnd == '3':
    GAUGE = (STYLE + 'a small game HUD icon: a glass jar of glowing fireflies with a cork and a twine handle, standing on a round carved '
             'wooden plate, hanging from a curly green vine tendril with a small leaf, cartoon wooden game interface piece. ' + TAIL)
    GAUGE_DIM = GAUGE.replace('a glass jar of glowing fireflies', 'an empty pale blue glass jar with only two faint fireflies left')
    items += [{'name': f'gauge-{k}-s{round(s * 100)}', 'start': f'gauge-{k}.png', 'prompt': GAUGE if k == 'lit' else GAUGE_DIM,
               'strength': s, 'seed': 11, 'w': 512, 'h': 640, 'loras': ['style']} for k in ('lit', 'dim') for s in (0.4, 0.55)]
    TREE = (STYLE + 'a huge ancient night forest tree seen from the side for a side-scrolling platform game: a tall thick blue-grey trunk '
            'with mossy bark and a dark hollow, under a wide round crown of dense dark blue and violet leaves with gaps and small '
            'branches, the leaves clumped in soft rounded masses, a twilight treetops forest. ' + TAIL)
    items += [{'name': f'tree-s{round(s * 100)}-{sd}', 'start': 'tree.png', 'prompt': TREE, 'strength': s, 'seed': sd, 'w': 1024,
               'h': 1536, 'loras': ['style']} for s in (0.72, 0.85) for sd in (5, 17)]
    TUCK = POKEY.replace('side view facing right, ', 'side view facing right, jumping in the air curled up with his knees tucked to his chest, ')
    items += [{'name': f'tuck-s{round(s * 100)}', 'start': 'pokey-tuck.png', 'prompt': TUCK, 'strength': s, 'seed': 7, 'w': 768,
               'h': 768, 'loras': ['style', 'pokey']} for s in (0.5, 0.62)]
spec = {'note': f'8-4 Lantern Run art, round {rnd}, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8],
                  'pokey': ['mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors', 1.0]},
        'base': 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/w8-lantern/tools/art/hfbatch/starts/w8lantern/',
        'neg': NEG, 'items': items}
p = Path(__file__).resolve().parent / f'spec-hfb-lantern-{rnd}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
