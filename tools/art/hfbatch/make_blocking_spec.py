"""Write tools/art/hfbatch/spec-hfb-blocking.json (2026-10-29, branch hf-art-blocking): the four sheets of the blocking batch by img2img
(w6to10/img2imggpu.py, Qwen-Image + mshaffe111/slothadv-style-lora) from the starts tools/art/hfbatch/blockstart.py makes, two strengths
x two seeds each. The starts are force-added under tools/art/hfbatch/starts/ and read from GitHub raw at a pinned commit, so the branch
is pushed first and the commit passed here:
    python3 tools/art/hfbatch/make_blocking_spec.py <commit> [round]
"""
import json, sys
from pathlib import Path

COMMIT = sys.argv[1]
ROUND = sys.argv[2] if len(sys.argv) > 2 else 'a'
BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{COMMIT}/tools/art/hfbatch/starts/'
END = ("Soft cel shading, thin dark outline, light from the upper left, evenly lit, side-on view for a 2D platform game, on one flat "
       "plain pure magenta background, no sky, no ground, no cast shadow, no text")
P = {
    'w7anchors': ("slothadv style, painted storybook illustration, a 2D game prop sheet: four separate broken ends of carved stone temple "
                  "lintels from an ancient ruined jungle temple, each a heavy grey-green weathered stone beam with a carved key pattern "
                  "band, its top edge cut off flat as if it runs on above the screen, one end broken off rough and jagged with chips "
                  "and cracks, soft green moss and a few dry brown leaves on it. A thick brown liana is knotted round each beam in "
                  "several tight wraps with a big knot under the beam and a short loose end, then hangs straight down out of the "
                  "bottom of the frame. " + END),
    'w7walls': ("slothadv style, painted storybook illustration, four tall vertical strips of ruined jungle temple wall for a 2D "
                "platform game, each strip filled edge to edge: weathered grey-green stone blocks of mixed sizes with dark mortar "
                "joints, carved key-pattern meander bands, cracks and chipped corners, a thin dry brown fig root creeping down, soft "
                "green moss creeping down over the block edges; the third strip has an old worn carved stone face of a sloth in the "
                "stone, eroded and mossy. Flat front-on wall texture. " + END.replace('side-on view for a 2D platform game, ', '')),
    'w4falls': ("slothadv style, painted storybook illustration, a 2D game sprite sheet of waterfall pieces for a misty mountain "
                "world: three tall falling water sheets of different widths, soft white water with soft blue-grey shadow streaks "
                "running straight down, misty and slightly see-through, ragged uneven edges with thin side streams peeling off and "
                "little spray; a tall wet dark blue-grey stone pillar with a trickle of water and a fern; three mossy blue-grey rock "
                "lips with white water curling over the front edge in a thick pour that thins as it drops; two wide strips of "
                "churned white foam and spray, bubbly and uneven; two soft white mist clouds and a tall spray plume. Soft white and "
                "pale blue-grey water, never turquoise, never cyan, no straight edges. " + END),
    'w6ledges': ("slothadv style, painted storybook illustration, a 2D game prop sheet for a mangrove swamp world, four separate "
                 "ledges to stand on, each with a flat walkable top and visibly held up: a twisted grey-green mangrove root bent into a "
                 "flat mossy shelf with prop roots curling down under it; an old stilt-house plank deck lashed with rope to two "
                 "wooden posts running down out of the bottom; a broken old boardwalk, planks missing, on two leaning posts; a mossy "
                 "fallen branch wedged between two arching stilt roots. Grey-green weathered mangrove wood, soft moss, pale shelf "
                 "fungus, dark outlines. " + END),
}
P['w6perches'] = P['w6ledges'].replace('four separate ledges to stand on', 'four separate short narrow perches to stand on')
NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
       '3d render, blurry, gradient background, sky, cast shadow, people, character, animal, sloth character')
NEG_W = NEG.replace(', sloth character', '') + ', turquoise water, cyan, bright blue, glass, ice, straight edges'
P['w7lianas'] = ("slothadv style, painted storybook illustration, six separate thick brown jungle lianas hanging straight down from top "
                 "to bottom for a 2D platform game, each a woody vine with soft brown bark, a darker shadow side and a light edge, a few "
                 "small dry leaves and thorn stubs, two of them made of two strands twisted together. " + END)
P['w4mist'] = ("slothadv style, painted storybook illustration, soft white waterfall mist for a 2D platform game: two wide low drifting "
               "mist clouds and one tall rising spray plume, airbrushed soft wispy edges that fade out, misty and see-through, pale "
               "white with soft blue-grey shading, no outline, not cartoon clouds. On one flat plain pure magenta background, no sky, "
               "no text")
P['w6wedge'] = ("slothadv style, painted storybook illustration, a 2D game prop sheet for a mangrove swamp world: a round fallen mossy "
                "branch log with bark and a broken end, wedged in the crotch between two arching grey-green mangrove stilt roots that "
                "rise past its ends, a flat walkable top on the log, pale shelf fungus on the roots; one wide version and two narrow "
                "versions with long roots running down. Grey-green weathered wood, soft moss, dark outlines. " + END)
if ROUND == 'a':
    SIZES = {'w7anchors': (1216, 896), 'w7walls': (1280, 1216), 'w4falls': (1536, 1152), 'w6ledges': (1536, 896), 'w6perches': (1536, 768)}
    STR = {'w7anchors': (0.55, 0.68), 'w7walls': (0.55, 0.68), 'w4falls': (0.62, 0.76), 'w6ledges': (0.55, 0.68), 'w6perches': (0.55, 0.68)}
    SEEDS = (5, 17)
else:  # round b (after the review of round a): thicker anchors, matching liana runs, walls with fewer roots, soft mist, a real log
    SIZES = {'w7anchors': (1216, 896), 'w7lianas': (1216, 896), 'w7walls': (1280, 1216), 'w4mist': (1216, 640), 'w6wedge': (1536, 768)}
    STR = {'w7anchors': (0.55, 0.62), 'w7lianas': (0.55, 0.65), 'w7walls': (0.62, 0.68), 'w4mist': (0.6, 0.75), 'w6wedge': (0.58, 0.68)}
    SEEDS = (17, 29)
NEG_MIST = ('text, letters, watermark, frame, border, photo, 3d render, gradient background, sky, people, animal, hard outline, '
            'cartoon cloud, cotton ball, solid shape')
items = []
for n, (w, h) in SIZES.items():
    for st in STR[n]:
        for sd in SEEDS:
            it = {'name': f'{n}-{ROUND}-s{round(st * 100)}-{sd}', 'start': f'start-{n}.webp', 'prompt': P[n], 'strength': st, 'seed': sd,
                  'w': w, 'h': h}
            if n == 'w4falls':
                it['neg'] = NEG_W
            if n == 'w4mist':
                it['neg'] = NEG_MIST
            if n == 'w7walls':
                it['neg'] = NEG.replace(', sloth character', '') + ', living animal'
            items.append(it)
spec = {'note': 'hf-art-blocking batch (W7 anchors and walls, W4 falls, W6 ledges) by img2img from blockstart.py, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE,
        'items': items}
p = Path(__file__).resolve().parent / f'spec-hfb-blocking-{ROUND}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
