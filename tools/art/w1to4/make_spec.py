"""Write the World 1-4 batch specs for tools/art/hfdrake/storygpu.py (unchanged; Qwen-Image img2img with the style model).
    python3 tools/art/w1to4/make_spec.py <world> [round] [commit]
-> tools/art/w1to4/spec-w<world>-<round>.json. Starts are read from GitHub raw at the pushed commit:
reference/prop-sheets/qa-notes/w1-4-art/starts/<canvas>.png (starts.py writes them there: tools/ ignores pictures).

One canvas = one world kit painted in one pass (shared light). Each canvas runs at 2 strengths x 2 seeds; the takes are compared on
contact sheets and the best whole canvas is picked (per piece if two takes split the wins).
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STYLE = 'slothadv style, a sheet of separate game props painted in one consistent storybook style, '
TAIL = ('Soft cel shading, thin dark ink outline, light from the upper left on every piece, each piece seen exactly from the side '
        'for a side-scrolling platform game, every piece separate with space round it, on one flat plain pure {key} background, '
        'no cast shadow, no ground line, no text.')
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, floor, '
       'perspective, three-quarter view, seen from above, merged pieces, scenery')
FX_TAIL = ('Painted soft glowing translucent effects only, each separate, on a pure black background, no outlines, no scenery, no text.')

CANVAS = {
    'w1-props': ('magenta #FF00FF', 'a sunny rainforest canopy trail: a hollow log and a monstera leaf bush (top left), a long springy tree '
                 'bough with moss and a red bromeliad, the same bough dipped under weight, a sloping bough with a pile of acorns at its '
                 'high end, a twisted green vine rope, two bark knots that stick out of a trunk like steps, three short mossy tree '
                 'stumps with flat tops, a big fallen hollow log lying on monstera leaves with a dark gap under it to crouch in, a gate '
                 'of living tangled roots in a mossy wooden frame shut, and the same root frame open. Warm bark browns, mossy '
                 'yellow-greens.'),
    'w1-squirrels': ('magenta #FF00FF', 'the same cute cartoon red squirrel character drawn six times in different poses: sitting, '
                     'waving, pulling down on a rope with both paws, tipping an acorn forward, running on all fours, sitting; reddish '
                     'brown fur, cream white belly, big fluffy curled tail, small ears, big friendly dark eyes; a mossy tree stump and '
                     'a hollow log also on the sheet. Storybook animal design, consistent character.'),
    'w2-props': ('magenta #FF00FF', 'a riverside fishing village: a wooden jetty and tall cattail reeds (top left), three flat wet river '
                 'stones with moss on top, two muddy reed islands with cattails, a pale sandy sandbar with pebbles, a weathered wooden '
                 'mooring post with a plank shelf and rope wraps, a lily pad cluster half sunk in teal water, the same pads almost '
                 'under water, a floating wooden barrel upright and tilted, a wooden crate upright and tilted, a gate of lashed reeds '
                 'in a wooden frame shut and the frame open, a round woven reed cage tied with rope. Weathered grey-brown wood, tan '
                 'rope lashings, olive reeds.'),
    'w2-net': ('green #00FF00', 'a fishing net made of knotted tan and rose-pink cord hanging from a pole, empty, and the same net full '
               'of river stones and fish. Riverside fishing village.'),
    'w2-water': (None, 'four horizontal streaks of white river foam and spray on fast teal water currents, painted brushy foam.'),
    'w3-props': ('magenta #FF00FF', 'an underground glowworm grotto, evenly lit: a mossy cave mouth and a fern (top left), three cool '
                 'grey-green stepping stones with damp rims lit by a thin cyan glow, two flat limestone shelves with ferns, a mossy '
                 'stone ledge whole, the same ledge cracking, the same ledge broken to rubble, a hanging stalactite, the stalactite '
                 'falling, stalactite shards, a basket woven from roots on a rope, and a round mossy counterweight boulder. Cool '
                 'grey-green stone, deep moss greens, teal glow.'),
    'w3-bats': ('magenta #FF00FF', 'the same small cute cave bat drawn four times: hanging upside down asleep with wings wrapped, hanging '
                'and waking with open glowing eyes, flying with wings up, flying with wings down; grey-brown fur, big ears, leathery '
                'dark wings; a hollow mossy log and a stalactite also on the sheet. Underground, evenly lit.'),
    'w3-fx': (None, 'three soft lavender spore clouds: a small swelling puff, a big bursting puff, a thin fading puff, glowing purple '
              'spores.'),
    'w4-props': ('magenta #FF00FF', 'high misty waterfall cliffs: a mossy cliff with a waterfall and bamboo wind chimes (top left), a '
                 'thick green vine tied in a fat knot round a wooden peg, the bare wooden peg, a thin falling waterfall curtain, the '
                 'curtain parted in the middle, a log hung on two ropes as a swinging bridge, a wooden rope anchor post, a blue-grey '
                 'slate ledge with grass on top whole, the same ledge cracking, the same ledge broken. Slate blue-greys, moss greens, '
                 'pale aqua water, slightly warm light.'),
    'w4-fx': (None, 'three tall columns of rising warm air with leaves and petals swirling up, three soft white mist banks, and the soft '
              'dark shadow of a huge eagle with spread wings seen from below.'),
}


def items(world, rnd):
    out = []
    for name, (key, body) in CANVAS.items():
        if not name.startswith(f'w{world}-'):
            continue
        prompt = STYLE + body + ' ' + (TAIL.format(key=key) if key else FX_TAIL)
        strengths = (0.62, 0.74) if name.endswith(('props', 'net')) else (0.72, 0.84) if key else (0.55, 0.7)
        if name.endswith(('squirrels', 'bats')):
            strengths = (0.8, 0.88)
        for s in strengths:
            for sd in (5, 17):
                out.append({'name': f'{name}-s{round(s * 100)}-{sd}', 'start': f'{name}.png', 'prompt': prompt, 'strength': s,
                            'seed': sd, 'w': 1536, 'h': 1024 if name != 'w2-net' else 1024, 'loras': [['style', 0.8]],
                            'neg': NEG if key else NEG + ', outline, magenta, solid shapes'})
    return out


if __name__ == '__main__':
    world = int(sys.argv[1]); rnd = sys.argv[2] if len(sys.argv) > 2 else '1'; ref = sys.argv[3] if len(sys.argv) > 3 else 'w1-4-sheets'
    its = items(world, rnd)
    for it in its:
        if it['start'] == 'w2-net.png':
            it['w'] = it['h'] = 1024
    spec = {'note': f'World {world} kit batch, round {rnd}, 2026-10-31 (w1-4-sheets)',
            'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{ref}/reference/prop-sheets/qa-notes/w1-4-art/starts/',
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': its}
    p = HERE / f'spec-w{world}-{rnd}.json'
    p.write_text(json.dumps(spec, indent=1))
    print(p, len(its), 'takes')
