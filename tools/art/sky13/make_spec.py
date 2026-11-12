"""1-3's sunrise far repaint (ART-W1B, 2026-11-12): img2img of start.py's cleaned, half-rolled old far, then the native pass round the
strip as a circle (the wrap comes out seamless). Prints the hf_jobs args.
    python3 tools/art/sky13/make_spec.py i2i <commit>          -> spec-F13.json (2 strengths x 2 seeds)
    python3 tools/art/sky13/make_spec.py hd <commit> <name>    -> spec-hdF13.json (native pass of reference/qa-reports/ART-W1B/sky/<name>.webp)
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
REPO = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{c}/'
LORA = ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']
FAR = ('slothadv style, painted storybook illustration, soft cel shading, thin dark outline, a very wide side-scrolling game '
       'background, the far distance seen straight from the side: sunrise over a deep rainforest valley: tall emergent rainforest trees '
       'with umbrella crowns and palms standing on the near ridges, layered ridges of green canopy and soft blue-green hills fading into '
       'the valley, a low warm sun just above the far hills, a gold and pink sunrise sky with soft pink clouds, morning mist in the '
       'valley, the bottom of the picture a dark band of rounded treetops, rich saturated sunrise colour, deep green shadows, rich '
       'painted texture like a storybook, soft atmospheric depth')
NEG = ('flowers, orchids, blossoms, petals, white flowers, white shapes, foreground, branch in front, fallen log, log, close-up leaves, '
       'close-up plants, rain, rain streaks, falling drops, vignette, frame, border, panel, seam, split, text, letters, watermark, people, '
       'animal, bird, sloth, face, creature, character, blurry, photo, 3d render')


def args(spec, sha, script, tag):
    gh = REPO.format(c=sha)
    fetch = f'mkdir -p /out/sky13 && curl -sSfL {gh}tools/art/sky13/{spec} -o /out/sky13/{spec} && '
    return {'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
            'command': ['bash', '-lc', fetch + f'curl -sSfL {gh}tools/art/{script} -o /tmp/g.py && SPEC=sky13/{spec} '
                        f'SUB=sky13/{tag} TAG={tag} python /tmp/g.py'],
            'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}


if __name__ == '__main__':
    mode, sha = sys.argv[1], sys.argv[2]
    if mode == 'i2i':
        spec = {'tag': 'sky13-F', 'loras': {'style': LORA + [1.0]}, 'neg': NEG,
                'base': REPO.format(c=sha) + 'reference/qa-reports/ART-W1B/sky/',
                'items': [{'name': f'far13-s{round(st * 100)}-{sd}', 'start': 'start-far13.webp', 'prompt': FAR, 'neg': NEG,
                           'strength': st, 'seed': sd, 'w': 2048, 'h': 1232} for st in (0.6, 0.7) for sd in (7, 23)]}
        (H / 'spec-F13.json').write_text(json.dumps(spec, indent=1))
        print(json.dumps(args('spec-F13.json', sha, 'w6to10/img2imggpu.py', 'sky13-F')))
    else:
        name = sys.argv[3]
        spec = {'tag': 'sky13-hdF', 'loras': {'style': LORA + [0.8]}, 'tw': 1024, 'neg': NEG,
                'items': [{'name': f'{name}-hd', 'pre': 'esrgan', 'h': 1302, 'strength': 0.25, 'seed': 7, 'bg': [0, 0, 0],
                           'src': REPO.format(c=sha) + f'reference/qa-reports/ART-W1B/sky/{name}.webp', 'prompt': FAR}]}
        (H / 'spec-hdF13.json').write_text(json.dumps(spec, indent=1))
        print(json.dumps(args('spec-hdF13.json', sha, 'hfbatch/striphdgpu.py', 'sky13-hdF')))
