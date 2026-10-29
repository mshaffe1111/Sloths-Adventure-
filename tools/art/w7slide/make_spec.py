"""Write the 7-4 slide job specs (2026-10-29) into tools/art/w7slide/:

    python3 -I tools/art/w7slide/make_spec.py img <commit holding the starts>-> spec-img.json   (all the stills, one GPU job)
    python3 -I tools/art/w7slide/make_spec.py clips '<json [[still name, kind], ...]>'   -> spec-clips.json
    python3 -I tools/art/w7slide/make_spec.py args <spec> <commit>   -> the hf_jobs run args
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
BASE = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/reference/prop-sheets/qa-notes/7-4-slide-art/starts/'
ST = 'slothadv style, painted storybook illustration, soft painted brush texture, thin dark outline, '
W7 = 'ancient overgrown temple ruins in warm golden light, amber and grey carved stone with worn geometric patterns, green moss, strangler-fig roots'
TEX = ', a flat seamless repeating texture seen straight on, evenly lit, fills the whole picture edge to edge, no horizon, no perspective'
POKEY = ('pokeysloth seen from directly behind, the back of his round brown furry head and back, a dark brown leather satchel strap running '
         'diagonally across his back from his upper left shoulder down to a small brown leather satchel bag on his right hip, cream cloth '
         'wraps on both wrists, light tan fur on his arms, ')
PNEG = 'face, eyes, front view, side view, ground, floor, slope, dust, shadow, scenery, text, watermark, blurry, photo, 3d render, extra limbs, extra arms, extra animals, two bags, strap on the right shoulder'

JOBS = [
    ('floor', 'floor.png', 'style', [0.55, 0.7], ST + 'a smooth worn carved stone slide floor seen from directly above: large flagstones of pale amber '
     'stone polished smooth by water, a shallow carved groove running straight down the middle, green moss in the cracks between the stones, '
     + W7 + TEX),
    ('wall-roots', 'wall-roots.png', 'style', [0.45, 0.6], ST + 'a carved ancient temple wall seen straight on, carved geometric meander '
     'patterns and glyphs in the stone blocks, brown strangler-fig roots creeping over it, patches of moss, ' + W7 + TEX),
    ('wall-glyph', 'wall-glyph.png', 'style', [0.55, 0.7], ST + 'a carved ancient temple wall seen straight on, carved stone tablets of maze '
     'glyphs set into fitted amber stone blocks, a carved band of geometric pattern, a little moss, ' + W7 + TEX),
    ('mouth', 'mouth.png', 'style', [0.6, 0.75], ST + 'looking straight down a long ancient stone slide chute inside a temple, the smooth '
     'stone floor and carved walls with fig roots running away from us toward a dark tunnel mouth in the middle, two flickering torches on '
     'the walls lighting the stone gold and orange, deep shadow beyond, ' + W7 + ', the view from just behind someone sliding down it, no '
     'people, no characters'),
    ('obstacles', 'obstacles.png', 'style', [0.5, 0.65], ST + 'a sheet of six separate game obstacles in a 3 by 2 grid for a slide game, '
     'each seen from the front: a fallen stone column lying sideways, a toppled giant stone statue head lying on its side, a low carved stone '
     'beam on two stone blocks, a broken gap across a stone floor with a raised broken lip, a small pile of stone rubble and roots, a tangle '
     'of strangler-fig roots. ' + W7 + '. Every obstacle alone in its own cell with clear space around it, on one flat plain pure magenta '
     'background, no floor, no shadow, no text'),
    ('chamber', 'chamber.png', 'style', [0.5, 0.65], ST + 'a wide side-on view of a great underground temple chamber, carved stone walls with '
     'fig roots, ruined shrines, stone stairs and arches, giant carved stone faces, shafts of golden sunlight falling from openings in the roof, '
     'a flat stone floor along the bottom, ' + W7 + ', a game background, no people, no characters'),
]
PJOBS = [
    ('pokey-straight-a', 'sitting and sliding straight ahead down a slide on his bottom, both arms held low at his sides for balance'),
    ('pokey-straight-b', 'sitting and sliding straight ahead fast on his bottom, leaning slightly back, arms low at his sides'),
    ('pokey-lean-left', 'sliding on his bottom and leaning hard to the left into a turn, his left arm reaching down and his right arm out to the side'),
    ('pokey-prep-left', 'sliding on his bottom, starting to lean to the left, looking left over his shoulder, his left arm reaching out low'),
    ('pokey-jump', 'jumping in the air in a seated position with both arms thrown up and out, feet tucked under him'),
]


def img(sha):
    global BASE
    BASE = BASE.format(sha=sha)
    items = []
    for name, start, lora, strengths, prompt in JOBS:
        wh = {'obstacles': (1536, 1024), 'chamber': (1792, 768)}.get(name, (1024, 1024))
        for st in strengths:
            for sd in (5, 17):
                items.append({'name': f'{name}-s{round(st * 100)}-{sd}', 'start': start.replace('.png', '.jpg'), 'lora': lora, 'prompt': prompt, 'strength': st,
                              'seed': sd, 'w': wh[0], 'h': wh[1]})
    for name, what in PJOBS:
        for st in (0.45, 0.6):
            items.append({'name': f'{name}-s{round(st * 100)}', 'start': f'{name}.jpg', 'lora': 'pokey', 'seed': 5, 'strength': st,
                          'w': 1024, 'h': 1024, 'neg': PNEG,
                          'prompt': POKEY + what + ', full body in frame with space around him, painted storybook illustration, plain flat grey background'})
    spec = {'tag': 'w7slide-img', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0],
                                             'pokey': ['mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors', 1.0]}, 'items': items, 'base': BASE}
    (H / 'spec-img.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'items')


def seam(sha):
    """repaint the rolled textures (seamstarts.py) at a low strength; cut.py keeps the repaint only over the seam lines"""
    base = BASE.format(sha=sha)
    prompts = {n: p for n, _, _, _, p in JOBS}
    items = [{'name': f'seam-{k}-s{round(st * 100)}', 'start': f'roll-{k}.jpg', 'lora': 'style', 'prompt': prompts[k], 'strength': st,
              'seed': 5, 'w': 1024, 'h': 1024} for k in ('floor', 'wall-roots', 'wall-glyph') for st in (0.4, 0.5)]
    spec = {'tag': 'w7slide-seam', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'items': items, 'base': base}
    (H / 'spec-seam.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'items')


JOBS2 = [
    ('floor2', 'floor2.jpg', (1024, 1024), [0.55, 0.7], ST + 'a smooth worn carved stone slide floor seen from directly above: large '
     'flagstones of pale amber stone polished smooth, two shallow carved grooves running straight down it dividing it into three lanes, '
     'green moss in the cracks between the stones, ' + W7 + TEX),
    ('ceiling', 'ceiling.jpg', (1024, 1024), [0.55, 0.7], ST + 'a dark stone temple ceiling seen from directly below: big dark fitted '
     'stone slabs in shadow, brown strangler-fig roots running across them and hanging down, a little moss in the joints, dim warm light, '
     'ancient overgrown temple ruins, dark brown and grey stone' + TEX),
    ('mouth-bright', 'mouth-bright.jpg', (1024, 1024), [0.6, 0.72], ST + 'looking straight down a long ancient stone slide chute inside a '
     'temple toward its end: the smooth stone floor with two grooves and carved walls with fig roots running away to a bright opening of '
     'daylight, green jungle leaves hanging round the bright opening, warm sunlight pouring in along the floor and walls, ' + W7 +
     ', no people, no characters'),
    ('obstacles2', 'obstacles2.jpg', (1536, 1024), [0.5, 0.65], ST + 'a sheet of six separate game obstacles in a 3 by 2 grid for a slide '
     'game, each seen from the front: two carved stone lintels held up on two stone posts wrapped in fig vines, with open space under them, '
     'two low wide heaps of broken stone blocks with moss, the broken edge of a stone floor with darkness beyond it, and the broken front '
     'face of a stone floor slab above a dark drop. ' + W7 + '. Every obstacle alone in its own cell with clear space around it, on one '
     'flat plain pure magenta background, no floor, no shadow, no text'),
    ('crumble', 'crumble.jpg', (1536, 512), [0.45, 0.6], ST + 'four frames side by side of the same section of carved temple floor seen '
     'from the side: whole, then cracked, then breaking into three chunks, then the chunks falling with small stones, ' + W7 + ', a game '
     'sprite sheet, each frame alone with space around it, on one flat plain pure magenta background, no ground, no shadow, no text'),
    ('chamber2', 'chamber2.jpg', (1792, 768), [0.5, 0.62], ST + 'a wide side-on view of a great underground temple chamber: high in the left '
     'wall the round dark mouth of a stone slide chute with a carved stone spout under it, carved stone walls with fig roots, ruined '
     'shrines, stone stairs and arches, giant carved stone faces, shafts of golden sunlight falling from the roof, a flat stone floor along '
     'the bottom, ' + W7 + ', a game background, no people, no characters'),
]


def img2(sha):
    base = BASE.format(sha=sha)
    items = []
    for name, start, wh, strengths, prompt in JOBS2:
        for st in strengths:
            for sd in (5, 17):
                items.append({'name': f'{name}-s{round(st * 100)}-{sd}', 'start': start, 'lora': 'style', 'prompt': prompt, 'strength': st,
                              'seed': sd, 'w': wh[0], 'h': wh[1]})
    roots = [p for n, _, _, _, p in JOBS if n == 'wall-roots'][0]
    for st in (0.65, 0.8):  # the roots wall's seams survived a 0.5 repaint
        items.append({'name': f'seam-wall-roots-s{round(st * 100)}', 'start': 'roll-wall-roots.jpg', 'lora': 'style', 'prompt': roots,
                      'strength': st, 'seed': 5, 'w': 1024, 'h': 1024})
    spec = {'tag': 'w7slide-img2', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'items': items, 'base': base}
    (H / 'spec-img2.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'items')


MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
M = ('slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, a friendly brown '
     'three-toed sloth seen from behind, his satchel strap and bag stay fixed on his back, ')
KIND = {'loop': 'he slides away down a smooth slide sitting on his bottom, his body swaying gently left and right and bobbing a little over '
                'bumps, arms low for balance, a smooth repeating sliding motion, he stays in the middle of the frame at the same size',
        'lean': 'he slides sitting on his bottom and leans his whole body to the left into a turn, then leans back upright, arms out for '
                'balance, he stays in the middle of the frame at the same size'}


def clips(picks):
    cl = []
    for still, kind in picks:
        for sd in (3, 11):
            cl.append({'name': f'{still}-{kind}-s{sd}', 'src': f'img/{still}.png', 'prompt': M + KIND[kind], 'seed': sd, 'w': 704, 'h': 704})
    (H / 'spec-clips.json').write_text(json.dumps({'tag': 'w7slide-clips', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


def args(spec, sha):
    """the job reads this script and the spec straight from the repo at commit sha (pushed to w7-slide-art), writes to the bucket"""
    raw = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/w7slide/'
    name = Path(spec).name
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', f'curl -sSfL {raw}slidegpu.py -o /tmp/slidegpu.py && sha256sum /tmp/slidegpu.py && '
                                  f'SPEC={raw}{name} python /tmp/slidegpu.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'],
                      'name': json.loads(Path(spec).read_text())['tag']}, indent=1))


if __name__ == '__main__':
    {'img': lambda: img(sys.argv[2]), 'seam': lambda: seam(sys.argv[2]), 'img2': lambda: img2(sys.argv[2]), 'clips': lambda: clips(json.loads(sys.argv[2])), 'args': lambda: args(sys.argv[2], sys.argv[3])}[sys.argv[1]]()
