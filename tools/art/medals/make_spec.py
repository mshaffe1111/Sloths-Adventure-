"""Write the medal art job's spec (tools/art/gen/spec-medals.json): the four tier medallions and the emblems that sit on them.

    python3 -I tools/art/medals/make_spec.py

(The predator emblem's second try, the claws, is gen/spec-medals2.json.) Then put medals_gpu.py and the spec in the bucket (hf_fs_write: hf://buckets/mshaffe111/w5-xfer/jobs/<name>) and run the job with the
connector (image ostris/aitoolkit:latest, flavor rtx-pro-6000, the bucket mounted at /out, HF_TOKEN only as a job secret).
"""
import json
from pathlib import Path

STYLE = 'slothadv style, painted storybook illustration'
BG = 'centred, isolated on a flat plain mid grey background, no text, no letters'

MEDALLIONS = {
    'bronze': 'warm burnished bronze with a coppery glow',
    'silver': 'polished cool silver with soft blue-white highlights',
    'gold': 'rich shining gold with warm yellow highlights',
    'platinum': 'pale gleaming platinum with an iridescent mother-of-pearl sheen and tiny emerald gems set around the rim',
}

EMBLEMS = {
    'paw': 'a pair of small sloth paw prints with three claws each, warm brown',
    'fang': 'a single curved white predator fang tooth crossed with a jungle leaf',
    'boot': 'a sturdy little brown leather boot stomping down, with a puff of dust under it',
    'flower': 'a bright pink hibiscus flower with a yellow centre and two green leaves',
    'star': 'a single plump glowing golden five-pointed star',
    'stars3': 'three glowing golden five-pointed stars in an arc, the middle one bigger',
    'leaf': 'a big green jungle leaf curled like a surfboard, riding a swirl of wind',
    'rope': 'a coiled brown jungle rope tied in a knot',
    'vine': 'a green liana vine hanging in a swinging loop with small leaves, motion lines showing the swing',
    'flame': 'a bright orange and yellow flame',
    'burst': 'a bright yellow comic impact burst, a jagged star of energy',
    'hourglass': 'an old wooden hourglass with golden sand running through it',
    'crown': 'a small golden crown with red jewels',
    'locket': 'a small silver heart-shaped locket on a fine chain, a pressed pink petal peeking out',
    'cage': 'an open woven reed cage with its little door swung open and a tiny bird flying out',
    'compass': 'an old brass explorer compass with a red needle',
    'fist': 'a furry brown sloth fist punching forward, with a small white impact flash',
    'kick': 'a furry brown sloth foot with long curved claws kicking forward, with a swoosh of motion',
    'cake': 'a small fancy pink frosted layer cake with a cherry on top',
    'orchid': 'a single purple and white orchid flower in bloom',
    'web': 'a round silver spider web glistening with dew drops',
    'shield': 'a sturdy wooden shield painted green with a leaf on it',
    'feather': 'a single soft white feather drifting',
    'book': 'an old green leather field guide book, open, with a painted jaguar on one page',
    'key': 'an old iron key twisted with a thorny bramble vine',
    'thornheart': 'a red heart wrapped in a thorny dark green bramble vine, glowing softly',
    'bird': 'a tiny emerald green hummingbird in flight, wings blurred, long thin beak',
    'moon': 'a pale crescent moon with two small stars, quiet and calm',
    'carving': 'a short section of tree trunk with a letter M carved deep into the bark, wood chips falling',
    'map': 'a rolled-open old treasure map with a dotted trail and a red X',
    'flag': 'a small red pennant flag on a wooden pole planted on a hill top, at sunrise',
    'trophy': 'a shining golden trophy cup with two handles and a leaf wreath',
    'gem': 'a large glowing emerald gem with green light shining from it',
}


def main():
    kinds = {
        'md': {'seeds': [11, 22, 33, 44], 'what': MEDALLIONS, 'tpl': (
            f'{STYLE}, a single round medal seen straight on, a thick raised rim of {{what}}, the rim embossed with a ring of small leaves '
            f'and vines, a smooth plain dark green enamel centre with nothing on it, soft painted highlights and a gentle shadow, '
            f'a game achievement medal, {BG}, no ribbon')},
        'em': {'seeds': [11, 22], 'what': EMBLEMS, 'tpl': (
            f'{STYLE}, a game icon of {{what}}, bold simple readable shape, chunky and clear, rich colours, {BG}, no circle, no badge, '
            'no frame')},
    }
    spec = {'tag': 'medals', 'lora': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0], 'kinds': kinds}
    out = Path(__file__).resolve().parents[1] / 'gen/spec-medals.json'
    out.write_text(json.dumps(spec, separators=(',', ':')) + '\n')
    print(out, sum(len(k['what']) * len(k['seeds']) for k in kinds.values()), 'pictures')


if __name__ == '__main__':
    main()
