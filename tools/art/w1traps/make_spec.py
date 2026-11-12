"""World 1 drop-trap pieces (ART-W1, 2026-11-12): the hive, the stone, the handles, the anchor bough, the link vine and the leaf clump
for 1-3's traps (src/game/castArt.ts stand-ins). The proven World 1 prop method (hf-props, 10-31, tools/art/hfprops/jobs.txt): one piece
per picture, painted from a plain magenta canvas at strength 1.0 with the style model at 0.8, by tools/art/hfdrake/storygpu.py
(unchanged). Cut with tools/art/hfprops/cut.py's key_own (the take's own background).

    python3 tools/art/w1traps/make_spec.py <tag> <commit with plain-mag.png> [seeds, e.g. 5,17,29] [only, e.g. hiveHang,stoneHang]
writes tools/art/w1traps/spec-<tag>.json; commit and push it, then
    python3 tools/art/w1traps/make_spec.py args <tag> <pushed commit with the spec>
prints the hf_jobs run args.
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAW = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/'
LOOK = 'a sunny rainforest canopy trail, warm bark browns, mossy yellow-greens, honey and amber'
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, floor, ground, '
       'grass ground strip, landscape, scenery, background, perspective, three-quarter view, seen from above, two objects, cropped, '
       'cut off, vignette, pedestal, plinth, base slab, platform under it, display stand, ground patch, puddle, shadow under it, '
       'background trees, sky, pink on the object, magenta on the object, sloth, face, eyes, creature, animal, insect swarm, wasp')

# (name, w, h, what to paint, where it sits)
P = [
    ('hiveHang', 1024, 1024,
     'a wild bees\' nest hanging from a short twig stem at its top: a rounded papery teardrop hive with soft wavy bands of honey, amber '
     'and warm cream, one small dark round doorway low on its side, friendly and cosy, not a wasp nest',
     'one single hanging piece, only the short stem above it, nothing else'),
    ('hiveDown', 1024, 1024,
     'a wild papery bees\' nest lying tipped on its side, whole and unbroken, rounded teardrop with soft wavy bands of honey, amber and '
     'warm cream, one small dark round doorway, a short twig stem at its end, friendly and cosy',
     'lying on its own, nothing under it at all'),
    ('stoneHang', 1024, 1024,
     'a round heavy grey river stone with a soft cap of green moss on top, held in a loose sling of twisted green jungle vine that '
     'wraps under it and ties into one short loop above it',
     'one single hanging piece, only the vine loop above it, nothing else'),
    ('stoneDown', 1024, 1024,
     'a round heavy grey river stone with a soft cap of green moss on top, smooth with no sharp edges, a loose twist of green vine '
     'lying slack around it',
     'resting on its own, nothing under it at all'),
    ('handleSet', 640, 1536,
     'a thick twisted green jungle vine hanging straight down, ending at the bottom in a big chunky tied knot with a loop and a '
     'small tuft of fresh leaves, the knot plainly something to grab and pull',
     'one single hanging piece filling the picture from top to bottom'),
    ('handleSprung', 640, 1024,
     'the snapped end of a thick twisted green jungle vine curling up in a short spiral, frayed fibres at the break, a few leaves',
     'one single hanging piece, nothing else'),
    ('tendrilSet', 640, 1536,
     'a thin taut green creeper vine running straight up, tied at its bottom with a big chunky knot around a short stout wooden peg',
     'the peg at the very bottom, nothing under it'),
    ('tendrilCut', 768, 768,
     'a short stout wooden peg with a big chunky knot of green creeper tied round it and a cut end of creeper curling up from the knot',
     'standing on its own, nothing under it at all'),
    ('anchor', 1536, 1024,
     'a slender leaning young rainforest tree trunk with mossy warm brown bark on the left, one long branch arm reaching out level to '
     'the right across the picture, clumps of broad green leaves along the branch and at its tip',
     'one single piece, nothing else'),
    ('vineLink', 1536, 640,
     'one length of thick twisted green jungle liana sagging in a gentle shallow curve from left to right, three small leaves on it, '
     'both ends tucked into small clumps of broad leaves',
     'one single piece, nothing else'),
    ('leafClump', 1024, 640,
     'a clump of broad glossy rainforest leaves seen from the side and a little from below, like the underside of a bough\'s foliage, '
     'a short twig in the middle',
     'one single piece, nothing else'),
]


def prompt(desc, where):
    return (f'slothadv style, one single game prop for a side-scrolling platform game: {desc}, {where}, for {LOOK}. Hand-painted '
            f'storybook game art with painted texture, soft cel shading, thin dark ink outline, light from the upper left, seen exactly '
            f'from the side, the whole object fully in the picture with space all round, on one flat plain pure magenta #FF00FF '
            f'background, nothing else, no cast shadow, no ground, no water, no puddle, no scenery, no text.')


if sys.argv[1] == 'args':
    tag, sha = sys.argv[2], sys.argv[3]
    cmd = (f'set -e; mkdir -p /out/w1traps/{tag}; curl -fsSL {RAW}{sha}/tools/art/hfdrake/storygpu.py -o /tmp/storygpu.py; '
           f'curl -fsSL {RAW}{sha}/tools/art/w1traps/spec-{tag}.json -o /out/w1traps/{tag}/spec.json; '
           f'SPEC=w1traps/{tag}/spec.json SUB=w1traps/{tag} TAG={tag} python /tmp/storygpu.py')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'name': f'w1traps-{tag}', 'secrets': {'HF_TOKEN': '$HF_TOKEN'},
                      'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'command': ['bash', '-lc', cmd]}))
    sys.exit()
tag, sha = sys.argv[1], sys.argv[2]
seeds = [int(s) for s in (sys.argv[3] if len(sys.argv) > 3 else '5,17,29').split(',')]
only = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
items = [{'name': f'{n}-{sd}', 'start': 'plain-mag.png', 'prompt': prompt(d, wh), 'strength': 1.0, 'seed': sd, 'w': w, 'h': h,
          'steps': 26, 'loras': [['style', 0.8]], 'neg': NEG}
         for (n, w, h, d, wh) in P if not only or n in only for sd in seeds]
spec = {'note': f'ART-W1 trap pieces {tag}, 2026-11-12', 'q': 92,
        'base': f'{RAW}{sha}/reference/prop-sheets/qa-notes/hf-props/starts/',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
(HERE / f'spec-{tag}.json').write_text(json.dumps(spec, indent=1))
print(tag, len(items), 'takes')
