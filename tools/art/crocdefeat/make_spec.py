"""spec + hf_jobs args for Crocus Rex's defeat still (img2img with his character model, w6to10/img2imggpu.py).
  python3 tools/art/crocdefeat/make_spec.py <commit>      -> spec-cd1.json, then prints the run args"""
import json, sys
from pathlib import Path
H = Path(__file__).resolve().parent
sha = sys.argv[1]
P = ('crocusrex, the crocodile king, a huge dark olive-green crocodile with rows of spiked scales, knocked out and lying flat on his '
     'back in the mud, upside down, his pale cream striped belly facing up, his four short legs sticking up in the air, his long tail '
     'flopped out, his head tipped back with his eyes shut and a dizzy little smile, his crooked crown of pink petals fallen on the '
     'ground beside his snout, one whole solid body, side view, painted storybook illustration, thick dark outline, rich colour, soft '
     'light from the upper left, on a flat plain magenta background')
NEG = ('see-through, transparent, holes, sketch, unfinished, pencil lines, white scratches, grey wash, ghost, two crocodiles, '
       'background scenery, grass, water, text, letters, frame, border, photo, 3d render, blurry, cast shadow')
spec = {'tag': 'cd1', 'loras': {'style': ['mshaffe111/croc-qwen-lora', 'croc_qwen_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/reference/prop-sheets/qa-notes/croc-defeat/starts/',
        'items': [{'name': f'{s}-s{round(st * 100)}-{sd}', 'start': f'{s}.png', 'prompt': P, 'strength': st, 'seed': sd, 'w': 1536, 'h': 768}
                  for s in ('back-from-idle', 'side-from-defeat') for st in (0.62, 0.74) for sd in (7, 23)]}
(H / 'spec-cd1.json').write_text(json.dumps(spec, indent=1))
# round 2: the picked round-1 take (round2.png) repainted in place with the game's style model, low strength (hf-art.md: s52/s60
# keeps the layout; lower here because the body is already right and only the paint should change)
P2 = ('slothadv style, painted storybook illustration, a big dark olive-green crocodile king knocked out, lying on his back with his '
      'pale cream striped belly up and his short legs in the air, eyes shut with a dizzy little smile, his crown of pink petals fallen '
      'on the ground by his snout, lying in a small patch of dark brown mud, rich painterly texture on every scale, thick dark outline, '
      'soft light from the upper left, one solid body, side view, on a flat plain magenta background')
spec2 = {'tag': 'cd2', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
         'base': spec['base'], 'items': [{'name': f'round2-s{round(st * 100)}-{sd}', 'start': 'round2.png', 'prompt': P2, 'strength': st,
                                          'seed': sd, 'w': 1536, 'h': 768} for st in (0.40, 0.52) for sd in (7, 23)]}
(H / 'spec-cd2.json').write_text(json.dumps(spec2, indent=1))
gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/'
cmd = (f'mkdir -p /out/crocdefeat && curl -sSfL {gh}crocdefeat/spec-cd1.json -o /out/crocdefeat/spec-cd1.json && '
       f'curl -sSfL {gh}w6to10/img2imggpu.py -o /tmp/g.py && SPEC=crocdefeat/spec-cd1.json SUB=crocdefeat/cd1 TAG=cd1 python /tmp/g.py')
TAGN = sys.argv[2] if len(sys.argv) > 2 else 'cd1'
cmd = cmd.replace('cd1', TAGN)
print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True, 'command': ['bash', '-lc', cmd],
                  'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': TAGN}))
