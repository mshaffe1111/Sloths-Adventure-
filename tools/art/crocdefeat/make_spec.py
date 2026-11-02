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
gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/'
cmd = (f'mkdir -p /out/crocdefeat && curl -sSfL {gh}crocdefeat/spec-cd1.json -o /out/crocdefeat/spec-cd1.json && '
       f'curl -sSfL {gh}w6to10/img2imggpu.py -o /tmp/g.py && SPEC=crocdefeat/spec-cd1.json SUB=crocdefeat/cd1 TAG=cd1 python /tmp/g.py')
print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True, 'command': ['bash', '-lc', cmd],
                  'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': 'cd1'}))
