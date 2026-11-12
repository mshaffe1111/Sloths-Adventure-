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
       'background trees, sky, pink on the object, magenta on the object, sloth, face, eyes, creature, animal, insect swarm, wasp, water, '
       'rain, light rays, sun beams, grass, moss ground, earth, dirt')
# (round 1 proved the hf-props rule: without these the style model paints a bough and a pool round every hanging piece)
ISOLATE = ', tree branch, bough, tree trunk, ceiling, hanging scenery, leaves above it'

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


# round 2 (after round 1's sheet): the landed hive whole, the cut peg a single stake, the clump a clump, the link a loose length
P2 = [
    ('hiveDown', 1024, 1024,
     'a wild papery bees\' nest lying tipped over on its side, completely whole and intact and closed, not broken, not cracked, not '
     'open, no honey spilling, a rounded teardrop with soft wavy bands of honey, amber and warm cream, one small dark round doorway, a '
     'short twig stem at its top end, friendly and cosy', 'one single object floating on its own, nothing under it, nothing around it'),
    ('hiveHang', 1024, 1024,
     'a wild bees\' nest: a rounded papery teardrop hive with soft wavy bands of honey, amber and warm cream, one small dark round '
     'doorway low on its side, a short loop of twisted vine tied to its top, friendly and cosy, not a wasp nest',
     'one single object floating on its own, nothing above it, nothing around it'),
    ('stoneHang', 1024, 1024,
     'a round heavy grey river stone with a soft cap of green moss on top, held in a loose sling of twisted green jungle vine that '
     'wraps under it and ties into one short loop above it', 'one single object floating on its own, nothing above the loop'),
    ('stoneDown', 1024, 1024,
     'a round heavy grey river stone with a soft cap of green moss on top, smooth with no sharp edges, a slack loop of green vine '
     'lying loose around it', 'one single object floating on its own, nothing under it, nothing around it'),
    ('tendrilCut', 768, 768,
     'one single short upright wooden stake, round and stout, with a chunky knot of green creeper vine tied round it near the top and '
     'a short cut end of the creeper curling up out of the knot', 'one single object floating on its own, nothing under it'),
    ('handleSprung', 640, 1024,
     'a short length of thick twisted green jungle vine, its top end clean, its lower end snapped and frayed and curling up into a '
     'loose spiral, two small leaves', 'one single object floating on its own, nothing above it, nothing around it'),
    ('leafClump', 1024, 640,
     'a dense wide clump of broad glossy rainforest leaves fanning out sideways from one short twig, wider than tall, the leafy tip '
     'of a bough cut off on its own', 'one single object floating on its own, no trunk, no plant pot, nothing under it'),
    ('vineLink', 1536, 640,
     'one loose length of thick twisted green jungle liana lying in a gentle shallow sag from left to right, each of its two ends '
     'finishing in a small tuft of leaves, three small leaves along it', 'one single object floating on its own, nothing above it, nothing around it'),
    ('handleSet', 640, 1536,
     'one long thick twisted green jungle vine hanging straight down, its top end a clean cut, its bottom end tied in a big chunky '
     'knot with a loop and a small tuft of fresh leaves, the knot plainly something to grab and pull',
     'one single object floating on its own, nothing above it, nothing around it'),
    ('anchor', 1536, 1024,
     'a slender leaning young rainforest tree trunk with mossy warm brown bark on the left, one long branch arm reaching out level to '
     'the right across the picture, clumps of broad green leaves along the branch and at its tip, the trunk cut off clean at the bottom',
     'one single object floating on its own, no ground, no roots spreading, nothing else'),
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
R2 = '--r2' in sys.argv
sys.argv = [a for a in sys.argv if a != '--r2']
tag, sha = sys.argv[1], sys.argv[2]
seeds = [int(s) for s in (sys.argv[3] if len(sys.argv) > 3 else '5,17,29').split(',')]
only = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
items = [{'name': f'{n}-{sd}', 'start': 'plain-mag.png', 'prompt': prompt(d, wh), 'strength': 1.0, 'seed': sd, 'w': w, 'h': h,
          'steps': 26, 'loras': [['style', 0.8]], 'neg': NEG + ('' if n == 'anchor' else ISOLATE)}
         for (n, w, h, d, wh) in (P2 if R2 else P) if not only or n in only for sd in seeds]
spec = {'note': f'ART-W1 trap pieces {tag}, 2026-11-12', 'q': 92,
        'base': f'{RAW}{sha}/reference/prop-sheets/qa-notes/hf-props/starts/',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
(HERE / f'spec-{tag}.json').write_text(json.dumps(spec, indent=1))
print(tag, len(items), 'takes')
