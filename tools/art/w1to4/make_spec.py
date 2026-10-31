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


if __name__ == '__main__' and sys.argv[1] == 'round2':
    pass
elif __name__ == '__main__':
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


# ---------------------------------------------------------------- round 2 (2026-10-31): what round 1 missed, all four worlds in one job
END = ' The whole body fully in the picture with space all round. Solid flat pure bright magenta (#FF00FF) background, nothing else.'
SQ = ('Keep this exact same squirrel character: the same chubby red-brown squirrel with a cream belly, big fluffy tail, round head, '
      'small ears and friendly face, same colours and proportions, drawn as a clean game sprite seen from the side. ')
SQPOSE = {'sit': 'Change only his pose: sitting calmly upright on his haunches, paws together at his chest, tail curled up behind.',
          'wave': 'Change only his pose: standing on his hind legs, waving one front paw high above his head, smiling.',
          'haul': 'Change only his pose: pulling down hard with both front paws on a thick vertical rope that hangs from above, leaning back.',
          'tip': 'Change only his pose: pushing a big brown acorn forward with both front paws, leaning into it.',
          'run': 'Change only his pose: running fast on all four legs, side view, tail streaming out behind.'}
BAT = ('Keep this exact same small brown fruit bat, same fur colours, leathery dark brown wings, big ears and short fox-like snout, same '
       'painted style. ')
BATPOSE = {'asleep': 'Show it hanging upside down by its feet, asleep, wings wrapped round its body, eyes shut.',
           'stir': 'Show it hanging upside down by its feet, just woken, eyes wide open, wings starting to unfold.',
           'flap1': 'Show it flying, seen from the side, both wings raised high.',
           'flap2': 'Show it flying, seen from the side, both wings swept down.'}
IMG2 = {'w1-knots': ('magenta #FF00FF', 'two bark shelf fungi that stick out of a rainforest tree trunk like little steps, flat mossy tops, '
                     'warm browns, and a mossy tree stump.', (0.62, 0.74)),
        'w2-gate': ('green #00FF00', 'a gate of lashed tan dry reeds tied with rope in a weathered wooden frame, shut, and the same wooden '
                    'frame open and empty, and a cattail reed clump. Riverside fishing village.', (0.62, 0.74)),
        'w4-veil': (None, 'two thin falling waterfall curtains of white and pale aqua water, the second one parted in the middle so you can '
                    'see through it.', (0.5, 0.62)),
        'w4-mist': (None, 'three soft drifting banks of white mountain mist, thick in the middle and feathered at the edges.', (0.45, 0.6)),
        'w4-shadow': ('white #FFFFFF', 'the soft blurred dark blue-grey shadow of a huge eagle with spread wings, seen from below, a shadow '
                      'only, no bird.', (0.35, 0.5))}


def items2(world):
    out = []
    if world == 1:
        for p, txt in SQPOSE.items():
            for sd in (2, 6):
                out.append({'name': f'sq-{p}-{sd}', 'start': 'w1-squirrel-ref.png', 'edit': True, 'prompt': SQ + txt + END, 'seed': sd,
                            'w': 1024, 'h': 1024, 'neg': 'text, watermark, two squirrels, extra limbs, scenery, background'})
                out.append({'name': f'sq-{p}-{sd}p', 'then': f'sq-{p}-{sd}', 'strength': 0.32, 'seed': 7, 'w': 1024, 'h': 1024,
                            'loras': [['style', 0.8]], 'prompt': 'slothadv style, a chubby red-brown squirrel with a cream belly and a big '
                            'fluffy tail, game sprite, thin dark ink outline, soft cel shading, on a flat magenta background.'})
    if world == 3:
        for p, txt in BATPOSE.items():
            for sd in (2, 6):
                out.append({'name': f'bat-{p}-{sd}', 'start': 'w3-bat-ref.png', 'edit': True, 'prompt': BAT + txt + END, 'seed': sd,
                            'w': 1024, 'h': 1024, 'neg': 'text, watermark, two bats, sloth, mask, scenery, background'})
    for name, (key, body, strengths) in IMG2.items():
        if not name.startswith(f'w{world}-'):
            continue
        prompt = STYLE + body + ' ' + (TAIL.format(key=key) if key else FX_TAIL)
        if key and key.startswith('white'):
            prompt = 'slothadv style, ' + body + ' Soft painted shadow on a plain pure white background, no text.'
        w, h = {'w1-knots': (1024, 512), 'w2-gate': (1024, 768), 'w4-veil': (1024, 1024), 'w4-mist': (1536, 1024),
                'w4-shadow': (1536, 640)}[name]
        for s in strengths:
            for sd in (5, 17):
                out.append({'name': f'{name}-s{round(s * 100)}-{sd}', 'start': f'{name}.png', 'prompt': prompt, 'strength': s, 'seed': sd,
                            'w': w, 'h': h, 'loras': [['style', 0.8]], 'neg': NEG if key else NEG + ', outline, solid shapes'})
    return out


def round2(ref):
    its = [it for w in (1, 2, 3, 4) for it in items2(w)]
    spec = {'note': 'World 1-4 round 2 (squirrels on the story model, cave bats on the W8 bat, knots, reed gate, veil, mist, shadow)',
            'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{ref}/reference/prop-sheets/qa-notes/w1-4-art/starts/',
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': its}
    p = HERE / 'spec-w1to4-2.json'
    p.write_text(json.dumps(spec, indent=1))
    print(p, len(its), 'takes')


if __name__ == '__main__' and sys.argv[1] == 'round2':
    round2(sys.argv[2] if len(sys.argv) > 2 else 'w1-4-sheets')
