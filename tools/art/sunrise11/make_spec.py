"""1-1's new sunrise far + sky and middle strips (art-1-1-sunrise, 2026-11-05). The old w1sunrise far was asked for "a flowering branch
with white orchids at one edge" (hfbackdrops/spec-F6.json) and came back with big pale orchids in its lower corners; its middle strip
kept a cut trunk at its join. These replace both.
    python3 tools/art/sunrise11/make_spec.py specs <commit>     -> spec-F.json (text to image) and spec-M.json (img2img), + hf_jobs args
    python3 tools/art/sunrise11/make_spec.py hd <commit> <name>...   -> spec-hd.json (the native pass from keyed/ at <commit>) + args
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
REPO = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{c}/'
S = 'slothadv style, painted storybook illustration, soft cel shading, thin dark outline, '
FAR = (S + 'a very wide side-scrolling game background, the far distance seen straight from the side: sunrise over the rainforest: '
       'dark silhouetted rainforest trees and tall emergent crowns standing in the middle distance, layered ridges of green canopy and '
       'soft blue-green hills fading behind them, a low warm sun just above the far hills, a gold and pink sunrise sky with bold '
       'soft-edged pink clouds, morning mist only in the far valleys, the bottom of the picture a dark band of distant treetops, '
       'rich saturated sunrise colour, strong contrast, deep green shadows. The upper third of the picture is open sky, the lower two '
       'thirds the far scenery, rich painted texture like a storybook, soft atmospheric depth')
FARNEG = ('foreground, ground in front, close-up plants, close-up leaves, branch in front, flowers, orchids, blossoms, petals, white '
          'flowers, rain, rain streaks, falling drops, vignette, frame, border, panel, text, letters, watermark, people, animal, bird, '
          'sloth, face, creature, character, blurry, photo, 3d render')
MID = (S + 'a very wide side-scrolling game background layer of the middle distance seen straight from the side, rainforest trees at '
       'sunrise: big old rainforest trees with broad rounded leafy crowns, a strangler fig, lianas hanging from the branches, mossy '
       'buttress roots, standing on a low strip of ground along the bottom edge, every tree crown and every top whole and rounded inside '
       'the picture with flat magenta above it, low warm pink-gold sunrise light from the left, warm rim light on the left edges, rich '
       'painted texture like a storybook. On one flat plain pure magenta background, no sky, no clouds, no fog, no text, no characters')
MIDNEG = ('sky, clouds, fog, haze, gradient background, scenery behind, horizon, perspective, flowers, orchids, blossoms, white flowers, '
          'text, letters, watermark, frame, border, photo, 3d render, blurry, people, animals, sloth, magenta objects, pink plants')
LORA = ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']


def args(spec, sha, script, tag):
    gh = REPO.format(c=sha)
    fetch = f'mkdir -p /out/sunrise11 && curl -sSfL {gh}tools/art/sunrise11/{spec} -o /out/sunrise11/{spec} && '
    return {'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
            'command': ['bash', '-lc', fetch + f'curl -sSfL {gh}tools/art/{script} -o /tmp/g.py && SPEC=sunrise11/{spec} '
                        f'SUB=sunrise11/{tag} TAG={tag} python /tmp/g.py'],
            'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}


def specs(sha):
    far = {'tag': 'sun11-F', 'loras': {'style': LORA + [0.8]}, 'neg': FARNEG,
           'items': [{'name': f'w1sun2-tall-{sd}', 'prompt': FAR, 'neg': FARNEG, 'seed': sd, 'w': 1792, 'h': 1200, 'steps': 30}
                     for sd in (7, 23, 41, 59)]}
    rows = [('A', 0.68, 7), ('A', 0.76, 7), ('A', 0.68, 23), ('A', 0.76, 23), ('B', 0.68, 7), ('B', 0.76, 7), ('C', 0.68, 7), ('C', 0.76, 7)]
    mid = {'tag': 'sun11-M', 'loras': {'style': LORA + [1.0]}, 'neg': MIDNEG,
           'base': REPO.format(c=sha) + 'reference/prop-sheets/qa-notes/art-1-1-sunrise/starts/',
           'items': [{'name': f'w1sun2-mid{k}-s{round(st * 100)}-{sd}', 'start': f'start-w1sun2-mid{k}.webp', 'prompt': MID,
                      'strength': st, 'seed': sd, 'w': 2048, 'h': 1104} for k, st, sd in rows]}
    (H / 'spec-F.json').write_text(json.dumps(far, indent=1))
    (H / 'spec-M.json').write_text(json.dumps(mid, indent=1))


def specs2(sha):
    # round M2: starts.py's starts with open ground at both ends (all 8 of round M failed cut.py's join check)
    mid = {'tag': 'sun11-M2', 'loras': {'style': LORA + [1.0]}, 'neg': MIDNEG,
           'base': REPO.format(c=sha) + 'reference/prop-sheets/qa-notes/art-1-1-sunrise/starts/',
           'items': [{'name': f'w1sun2-mid{k}-s{round(st * 100)}-{sd}', 'start': f'start-w1sun2-mid{k}.webp', 'prompt': MID,
                      'strength': st, 'seed': sd, 'w': 2048, 'h': 1104} for k in 'EFG' for st in (0.68, 0.76) for sd in (7, 23)]}
    (H / 'spec-M2.json').write_text(json.dumps(mid, indent=1))


def hd(sha, names):
    style = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin dark '
             'outline, crisp clean hand-painted gouache brushwork with fine leaf, bark and stone detail')
    items = []
    for n in names:
        tall = '-tall' in n
        items.append({'name': f'{n}-hd', 'pre': 'esrgan', 'h': 1760 if tall else 1302, 'strength': 0.25, 'seed': 7,
                      'src': REPO.format(c=sha) + f'reference/prop-sheets/qa-notes/art-1-1-sunrise/keyed/{n}.webp',
                      'prompt': style + '. ' + (FAR[len(S):] if tall else MID[len(S):].split('. On one')[0] + ', evenly lit, on one flat plain grey background, no text'),
                      'bg': [0, 0, 0] if tall else [128, 128, 128],
                      'neg': 'frame, border, panel, text, letters, watermark, people, animal, sloth, face, blurry, seam, flowers, orchids, rain'})
    (H / 'spec-hd.json').write_text(json.dumps({'tag': 'sun11-hd', 'loras': {'style': LORA + [0.8]}, 'tw': 1024, 'items': items}, indent=1))


if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'specs':
        specs(sys.argv[2])
    elif c == 'specs2':
        specs2(sys.argv[2])
    elif c == 'hd':
        hd(sys.argv[2], sys.argv[3:])
    elif c == 'args':
        print(json.dumps(args(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])))
