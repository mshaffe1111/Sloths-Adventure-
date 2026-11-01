"""Painted icons (icons-painted, 2026-11-01): text-to-image specs in the satchel's own recipe (tools/art/gen/spec-satchel.json:
slothadv style model at 1.0, one real object from Pokey's world, flat mid grey, 1024 square), for tools/art/w6to10/stillsgpu.py.

  python3 tools/art/icons/make_spec.py <group> [parts]      -> tools/art/icons/spec-<group><k>.json
  python3 tools/art/icons/make_spec.py args <spec> <sha>    -> the hf_jobs run args (script + spec fetched from GitHub at <sha>)
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
LORAS = {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}
HEAD = 'slothadv style, painted storybook illustration, a game icon of '
TAIL = (', bold simple readable shape, chunky and clear, thick dark outline, rich warm colours, soft light from the upper left, '
        'seen from the front slightly from above, centred, isolated on a flat plain mid grey background, no text, no letters, '
        'no numbers, no circle, no badge, no frame')
NEG = 'text, letters, words, numbers, watermark, frame, circle, badge, border, photo, 3d render, blurry, cropped, cut off, many objects'
SEEDS = (11, 23, 37, 53)
SEEDS6 = (11, 23, 37, 53, 71, 89)

# name -> list of (variant, object description, extra negative)
GROUPS = {
    'A': {
        'map': [('a', 'a small parchment jungle map half unrolled, a dotted trail winding past a tiny tree to a little red X, the rolled ends '
                      'tied with a green vine cord, a jungle leaf tucked under the cord', 'book, bag'),
                ('b', 'a folded old parchment map opened out, wrinkled and stained, a dotted path and a little red X drawn on it, a green '
                      'vine wrapped round one corner with a small leaf', 'book, bag')],
        'story': [('a', "Grandma's thick old storybook, closed, a worn green cloth cover with brass corners and a carved leaf on the front, "
                        'a red ribbon bookmark and a pink pressed flower peeking out of the pages', 'bag, open book, map'),
                  ('b', 'a thick old storybook lying slightly open, cream pages fanned, a worn warm brown leather cover with brass corners, '
                        'a pink pressed flower lying on the pages, a red ribbon bookmark', 'bag, map')],
        'howto': [('a', 'a little glass jar lantern with a glowing yellow firefly inside, a carved wooden lid, a twine handle looped over '
                        'the top, warm golden glow, a green leaf tied to the handle', 'bag, light bulb'),
                  ('b', 'a round seed-pod lantern of woven brown fibres with warm golden light glowing through its gaps, a twine loop on '
                        'top, a green leaf hanging from it', 'bag, light bulb')],
        'sound': [('a', 'a little wooden hand drum with a pale stretched leather top laced down with green vine cords, a carved wooden '
                        'body, a green leaf tucked in the lacing', 'bag, speaker'),
                  ('b', 'a dried seed-pod rattle shaker on a short carved wooden handle, brown and orange pod, bound with green vine, a '
                        'small leaf on the handle', 'bag, speaker, microphone')],
        'gear': [('a', 'a chunky carved wooden cog wheel with eight round teeth and a hole in the middle with a brass bolt, wood grain, a '
                       'green vine curled round one tooth with a small leaf', 'bag, sun, flower'),
                 ('b', 'a chunky carved wooden cog wheel with fat teeth, a brass ring in the middle, wood grain and little nicks, a '
                       'small green leaf tucked behind it', 'bag, sun, flower')],
        'play': [('a', 'a chunky carved wooden triangle arrow pointing to the right, rounded corners, warm wood grain, a thin brass edge',
                  'bag, leaf, flower')],
    },
    # groups B, C, D: one strong prompt each, six seeds (SEEDS6)
    'BCD': {
        'home': [('a', 'a cosy little round wooden door set in the base of a mossy tree trunk, warm light in a tiny round window, a '
                       'green leaf over the door', 'bag, house, castle')],
        'trophy': [('a', 'a small golden trophy cup with two curled handles on a carved wooden base, a green vine with a leaf wound '
                         'round its stem', 'bag, text')],
        'cards': [('a', 'a small fanned stack of three playing cards with painted jungle animals on them, tied with a twine bow',
                   'bag, text, letters, numbers')],
        'heart': [('a', 'a glossy plump red heart shaped berry with a tiny green leaf stem on top, a soft white shine', 'bag, face')],
        'heartEmpty': [('a', 'an empty dry pale brown heart shaped seed husk, hollow and papery, a tiny dry stem', 'bag, face')],
        'thornHeart': [('a', 'a glossy plump red heart shaped berry wrapped in a dark green thorny bramble vine with sharp thorns',
                        'bag, face')],
        'seed': [('a', 'a glowing golden seed with little bright sparks around it, warm magical glow', 'bag, face, sun')],
        'leaf': [('a', 'a single big glossy green jungle leaf with a curled tip and clear veins', 'bag, flower')],
        'paw': [('a', 'a sloth paw print pressed into a round flat disc of brown clay, three long claw marks', 'bag, dog, cat')],
        'save': [('a', 'a small wooden keepsake box with a rounded lid and a shiny brass clasp, a green leaf on the lid', 'bag, book')],
        'compass': [('a', 'an old brass explorer compass, round, with a red and white needle, a green vine strap', 'bag, clock, text')],
        'crown': [('a', 'a little crown woven of green leaves and small golden flowers', 'bag, face, text')],
        'clubs': [('a', 'two short carved wooden clubs crossed in an X, lashed together with green vine', 'bag, sword, metal')],
        'key': [('a', 'an old iron key with a round bow, a little paper tag tied on with twine', 'bag, text, lock')],
        'medal': [('a', 'a round gold medal with a carved leaf on it, hanging from a short green vine ribbon', 'bag, text, numbers')],
        'journal': [('a', 'a small worn brown leather journal, closed, tied round with a twine cord, a feather tucked under the cord',
                     'bag, satchel, strap, text')],
        'scenes': [('a', 'a little wooden toy puppet theatre stage with red curtains drawn open, a painted jungle scene inside',
                    'bag, text, people')],
        'sparkle': [('a', 'a glowing firefly with a bright golden light and little four pointed sparkles around it', 'bag, star, face')],
        'flower': [('a', 'a single pink jungle flower with five round petals and a yellow middle', 'bag, face')],
        'shield': [('a', 'a small round shield made of a big tough green leaf over a wooden frame, lashed with vine', 'bag, metal, text')],
        'pouch': [('a', 'a small embroidered green cloth drawstring pouch with a shiny emerald hummingbird feather tucked in it',
                   'bag, satchel, bird')],
        'about': [('a', 'a little blank carved wooden plaque hanging from a vine, a small green leaf on its corner', 'bag, text, letters')],
        'sprint': [('a', 'a green leaf with small swept back wings, fast, speed lines', 'bag, text, bird')],
        'petal': [('a', 'a single big curled pink flower petal with a dew drop', 'bag, face')],
        'bramble': [('a', 'a round tangled ball of dark green thorny bramble with sharp thorns', 'bag, face')],
        'ascent': [('a', 'a green vine climbing straight up, curling at the top with a leaf, with a small upward arrow shape of leaves',
                    'bag, text')],
        'fern': [('a', 'a single curled green fern frond', 'bag, face')],
        'liana': [('a', 'a thick brown jungle liana vine hanging in a loop, a few leaves', 'bag, snake')],
        'idol': [('a', 'a small carved grey stone idol with a round friendly face, moss on its head', 'bag, text')],
        'cage': [('a', 'a small cage made of tied wooden sticks with a little door, empty', 'bag, bird, metal')],
    },
    'F': {
        'expand': [('a', 'four chunky carved wooden corner brackets arranged at the four corners of an empty square, each an L shape '
                         'pointing outward, warm wood with a brass edge', 'bag, frame, picture, text'),
                   ('b', 'four short chunky carved wooden arrows pointing out diagonally to the four corners from the middle, warm wood '
                         'grain, a small green leaf in the middle', 'bag, text, star, flower')],
        'shrink': [('a', 'four short chunky carved wooden arrows pointing in diagonally from the four corners toward the middle, warm '
                         'wood grain, a small green leaf in the middle', 'bag, text, star, flower')],
        'checkmark': [('a', 'a chunky tick check mark shape made of a bent green vine stem with a small leaf, bold', 'bag, text, letter v')],
    },
    'G': {
        'spyglass': [('a', "a small brass explorer's spyglass telescope, extended, with a wrapped leather grip and a little green leaf "
                           'tied on with twine', 'bag, gun, text'),
                     ('b', 'a short brass spyglass lying slightly diagonal, glinting lens, a twine strap and a small green leaf',
                      'bag, gun, text')],
        'notebook': [('a', "Pokey's own small pocket notebook of soft tan leather, held shut with an elastic band, a stubby yellow pencil "
                           'tucked under the band, a little doodle of a leaf scratched on the cover', 'book with brass corners, big book, '
                           'satchel, text'),
                     ('b', 'a small spiral-free pocket notebook of worn tan leather with a short yellow pencil lying across it, a few '
                           'loose paper scraps sticking out', 'book with brass corners, big book, satchel, text')],
    },
    'H': {
        'shake': [('a', 'a short leafy jungle branch shaking hard, three green leaves flying off it, little curved motion lines on '
                        'both sides of the branch showing it wobble', 'bag, text, bird'),
                  ('b', 'a round brown nut bouncing off a short wooden branch, the branch bent and wobbling, a small leaf falling, '
                        'little curved motion lines', 'bag, text, face')],
        'cards': [('a', 'a small fanned stack of three picture cards with painted jungle animals on them (a sloth, a snake, a toucan), '
                        'plain picture cards with no corner marks, tied with a twine bow', 'text, letters, numbers, A, K, Q, playing '
                        'card symbols, spades, hearts, bag')],
    },
    'E': {
        'playc': [('a', 'a chunky rounded triangle play button shape pointing right, carved from pale cream birch wood, a warm golden '
                        'brass rim round its edge, smooth and glossy', 'bag, leaf, flower, arrow shaft'),
                  ('b', 'a chunky rounded triangle pointing right, polished bright golden brass with a soft shine, a thin dark outline',
                   'bag, leaf, flower, arrow shaft')],
        'restart': [('a', 'a chunky circular arrow made of a curled green vine stem, the arrow head a pointed leaf, curling round in a '
                          'nearly full circle', 'bag, snake, flower'),
                    ('b', 'a chunky circular arrow carved from warm wood, curling round in a nearly full circle, a pointed arrow head, '
                          'a small green leaf on it', 'bag, snake, flower')],
        'close': [('a', 'a chunky X cross made of two crossed carved wooden sticks lashed in the middle with green vine', 'bag, sword, flower'),
                  ('b', 'a chunky X cross made of two rounded cream birch sticks crossed, tied in the middle with a twine knot',
                   'bag, sword, flower')],
        'lock': [('a', 'a chunky old brass padlock with a rounded body and a thick shackle, a dark keyhole, a little green leaf tucked at '
                       'the shackle', 'bag, key, heart'),
                 ('b', 'a chunky round padlock of dark iron and brass with a thick shackle, a dark keyhole, a tiny vine wrapped on the shackle',
                  'bag, key, heart')],
        'star': [('a', 'a chunky five pointed star of shining gold, rounded points, a soft highlight, a thick dark outline', 'bag, flower, face'),
                 ('b', 'a chunky five pointed star carved from golden amber, glowing warmly, rounded points', 'bag, flower, face')],
        'back': [('a', 'a chunky carved wooden arrow pointing left, rounded, warm wood grain, a thin brass edge', 'bag, leaf, flower')],
    },
}


def items(group):
    out = []
    for name, vs in GROUPS[group].items():
        for v, desc, neg in vs:
            for sd in (SEEDS6 if group == 'BCD' else SEEDS):
                out.append({'name': f'{name}-{v}{sd}', 'prompt': HEAD + desc + TAIL, 'seed': sd, 'w': 1024, 'h': 1024,
                            'neg': NEG + ', ' + neg})
    return out


def args(spec, sha):
    gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/'
    n = Path(spec).name
    tag = json.loads(Path(spec).read_text())['tag']
    cmd = (f'mkdir -p /out/icons && curl -sSfL {gh}icons/{n} -o /out/icons/{n} && curl -sSfL {gh}w6to10/stillsgpu.py -o /tmp/g.py && '
           f'SPEC=icons/{n} SUB=icons/{tag} TAG={tag} python /tmp/g.py')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', cmd], 'secrets': {'HF_TOKEN': '$HF_TOKEN'},
                      'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}))


if __name__ == '__main__':
    if sys.argv[1] == 'args':
        args(sys.argv[2], sys.argv[3])
    else:
        g = sys.argv[1]; parts = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        it = items(g)
        for k in range(parts):
            spec = {'tag': f'ic{g}{k}', 'loras': LORAS, 'neg': NEG, 'items': it[k::parts]}
            (H / f'spec-{g}{k}.json').write_text(json.dumps(spec, indent=1))
            print(f'spec-{g}{k}.json', len(spec['items']))
