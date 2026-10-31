"""New middle and near backdrop strips for a second (and third) look per world (hf-backdrops, Matt 2026-10-31: spend the Hugging Face
budget on backgrounds he will see). Text to image with the style model (tools/art/w6to10/stillsgpu.py), each strip a row of separate
landmarks on flat magenta, every crown whole inside the picture (so upright, where the view runs taller than the strip, nothing is cut
off at a fade line), cut and made seamless afterwards (cut.py, tools/art/edges).
    python3 tools/art/hfbackdrops/make_spec.py <set> [out.json]      sets: pilot
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
S = 'slothadv style, painted storybook illustration, soft cel shading, thin dark outline, '
MID = ('a very wide side-scrolling game background layer of the middle distance, seen straight from the side, {d}. The pieces stand '
       'apart in a row along the bottom edge on a low strip of ground, of different heights and widths and none alike, each one whole '
       'inside the picture with plain background above it, nothing touching the top edge, {l}. On one flat plain pure magenta '
       'background, no sky, no clouds, no fog, no text, no characters, no animals')
NEAR = ('a very wide side-scrolling game foreground layer, seen straight from the side, a low band of {d} along the bottom of the '
        'picture, no taller than a quarter of the picture, uneven top edge, {l}. On one flat plain pure magenta background, no sky, no '
        'text, no characters, no animals')
NEG = ('sky, clouds, fog, haze, gradient background, scenery behind, horizon, perspective, text, letters, watermark, frame, border, '
       'photo, 3d render, blurry, people, animals, sloth, magenta objects, pink plants')
LORAS = {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}

PILOT = [
    ('w7dusk-mid', MID, 'overgrown jungle temple ruins: a broken stepped shrine, a toppled carved stone archway, a leaning tower with '
     'a worn carved face, a row of broken columns wrapped in strangler fig roots, dry brown vines hanging',
     'dim green-grey dusk light, the last warm light on their right edges'),
    ('w10b-mid', MID, 'storm mountain crags: jagged black rock spires, a broken black iron watchtower, the stub of a rope bridge on two '
     'posts, a crooked iron lamp post, heavy chains hanging between rocks',
     'cold blue-grey storm light, wet rock with pale highlights'),
    ('w1kapok-mid', MID, 'rainforest trees: one giant kapok tree with huge flared buttress roots and a broad rounded crown, a strangler '
     'fig, a slim palm, a tree fern, a mossy dead snag with orchids',
     'fresh green morning light from the upper left'),
    ('w3cavern-mid', MID, 'a cave interior seen from the side: tall stalagmites, a natural rock arch, a mossy boulder pile, curtains '
     'of glowing blue-green glowworm threads hanging from rock ledges, clusters of softly glowing teal mushrooms',
     'very dark blue-teal shadow, the only light from the glowing threads and mushrooms'),
    ('w7dusk-near', NEAR, 'temple rubble: fallen carved stone blocks, a broken carved stone head half buried, ferns, roots and dry '
     'leaves', 'dim green-grey dusk light'),
]


# img2img from starts.py's paste-ups (text to image does not keep the key: pilot 1, jobs.txt)
R2 = ('a very wide side-scrolling game background layer of the middle distance seen straight from the side, {d}, standing on a low '
      'strip of ground along the bottom edge, every tree crown and every top whole and rounded inside the picture with flat magenta '
      'above it, {l}, rich painted texture like a storybook. On one flat plain pure magenta background, no sky, no clouds, no fog, no '
      'text, no characters')
PILOT2 = [
    ('w7dusk-mid', 'overgrown jungle temple ruins: broken stone archways, a stepped shrine with a carved stone face wrapped in '
     'strangler fig roots, broken columns and fallen carved blocks, dry brown vines hanging', 'dim green-grey dusk light'),
    ('w1kapok-mid', 'rainforest trees: a giant kapok tree with flared buttress roots and a broad rounded crown, a tall strangler fig '
     'with bromeliads, slim palms and a tree fern', 'fresh green morning light from the upper left'),
    ('w10after-mid', 'bare mountain crags after a storm: jagged dark rock spires, wet stone steps, old iron lamp posts with chains '
     'hanging between them', 'clearing dawn light, wet rock glinting gold on the left edges'),
    ('w3cavern-mid', 'a dark cave interior: a natural rock arch, stalagmites and mossy boulders, curtains of glowing blue-green '
     'glowworm threads hanging from the rock, small glowing teal mushrooms', 'very dark blue-teal, lit only by the glowing threads'),
    ('w6dusk-mid', 'mangrove trees on tall arching roots standing in still black water, spanish moss hanging from the branches',
     'deep blue-green dusk light, a few fireflies'),
]


def items2(rows, strengths, seeds, W=2048, H=1104):
    return [{'name': f'{n}-s{round(st * 100)}-{sd}', 'start': f'start-{n}.webp', 'prompt': S + R2.format(d=d, l=l), 'strength': st,
             'seed': sd, 'w': W, 'h': H} for n, d, l in rows for st in strengths for sd in seeds]


def items(rows, seeds):
    return [{'name': f'{n}-{sd}', 'prompt': S + t.format(d=d, l=l), 'seed': sd, 'w': 2048, 'h': 896, 'steps': 30}
            for n, t, d, l in rows for sd in seeds]


if __name__ == '__main__':
    which = sys.argv[1]
    it = {'pilot': lambda: items(PILOT, [7]), 'pilot2': lambda: items2(PILOT2, [0.6, 0.72], [7])}[which]()
    spec = {'tag': f'hfbd-{which}', 'loras': LORAS, 'neg': NEG, 'items': it}
    if len(sys.argv) > 3:  # the commit holding the starts
        spec['base'] = (f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[3]}/reference/prop-sheets/qa-notes/'
                        'hf-backdrops/starts/')
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else H / f'spec-{which}.json'
    out.write_text(json.dumps(spec, indent=1))
    print(out, len(it))
