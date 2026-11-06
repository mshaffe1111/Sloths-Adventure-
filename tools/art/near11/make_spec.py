"""1-1's new near strip, img2img from tools/art/near11/starts.py (art director, 2026-11-06; lead's OK 9:35 AM ET, cap $1).
Same job shape as tools/art/sunrise11/make_spec.py (img2imggpu.py, style LoRA 1.0, near strengths s62/s68 per hf-backdrops.md).
    python3 tools/art/near11/make_spec.py spec <commit>            -> spec-N.json
    python3 tools/art/near11/make_spec.py hd <commit> <name>...    -> spec-hd.json (native pass to 1736 tall on grey, from keyed/)
    python3 tools/art/near11/make_spec.py args <spec> <commit> <script> <tag>
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
REPO = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{c}/'
S = 'slothadv style, painted storybook illustration, soft cel shading, thin dark outline, '
NEAR = (S + 'a very wide side-scrolling game background layer of the near ground seen straight from the side, the rainforest floor at '
        'sunrise: big round moss-covered boulders, a low arch of tangled tree roots, round leafy monstera and fern bushes, a pointed mossy '
        'rock, all standing on a continuous strip of earthy forest floor along the bottom edge, every top soft and rounded, no flat tops, '
        'low warm pink-gold sunrise light from the left, rich painted texture like a storybook. On one flat plain pure magenta '
        'background, no sky, no text, no characters')
NEARNEG = ('mushrooms, toadstools, logs, fallen logs, log ends, tree stumps, planks, flat tops, ledges, platforms, sky, clouds, fog, '
           'haze, gradient background, scenery behind, horizon, perspective, flowers, text, letters, watermark, frame, border, photo, '
           '3d render, blurry, people, animals, sloth, magenta objects, pink plants')
LORA = ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']


def args(spec, sha, script, tag):
    gh = REPO.format(c=sha)
    fetch = f'mkdir -p /out/near11 && curl -sSfL {gh}tools/art/near11/{spec} -o /out/near11/{spec} && '
    return {'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
            'command': ['bash', '-lc', fetch + f'curl -sSfL {gh}tools/art/{script} -o /tmp/g.py && SPEC=near11/{spec} '
                        f'SUB=near11/{tag} TAG={tag} python /tmp/g.py'],
            'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}


def spec(sha):
    near = {'tag': 'near11-N', 'loras': {'style': LORA + [1.0]}, 'neg': NEARNEG,
            'base': REPO.format(c=sha) + 'reference/prop-sheets/qa-notes/near11/starts/',
            'items': [{'name': f'w1sun3-near{k}-s{round(st * 100)}-{sd}', 'start': f'start-w1sun3-near{k}.webp', 'prompt': NEAR,
                       'strength': st, 'seed': sd, 'w': 2048, 'h': 1104} for k in 'AB' for st in (0.62, 0.68) for sd in (7, 23)]}
    (H / 'spec-N.json').write_text(json.dumps(near, indent=1))


def hd(sha, names):
    style = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin dark '
             'outline, crisp clean hand-painted gouache brushwork with fine leaf, bark and stone detail')
    items = [{'name': f'{n}-hd', 'pre': 'esrgan', 'h': 1736, 'strength': 0.25, 'seed': 7,
              'src': REPO.format(c=sha) + f'reference/prop-sheets/qa-notes/near11/keyed/{n}.webp',
              'prompt': style + '. ' + NEAR[len(S):].split('. On one')[0] + ', evenly lit, on one flat plain grey background, no text',
              'bg': [128, 128, 128], 'neg': 'frame, border, panel, text, letters, watermark, people, animal, sloth, face, blurry, seam, mushrooms'}
             for n in names]
    (H / 'spec-hd.json').write_text(json.dumps({'tag': 'near11-hd', 'loras': {'style': LORA + [0.8]}, 'tw': 1024, 'items': items}, indent=1))


if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'spec':
        spec(sys.argv[2])
    elif c == 'hd':
        hd(sys.argv[2], sys.argv[3:])
    elif c == 'args':
        print(json.dumps(args(*sys.argv[2:6])))
