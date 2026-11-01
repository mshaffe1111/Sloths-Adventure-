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


# ---- batch A+B: a middle and a near strip for each of a world's two other moods (Worlds 1-4, 6-10) ----
# (stem, world, start grade, middle: what stands there, near: the low band, light)
MOODS = [
    ('w1sunrise', 1, 'dawn', 'rainforest trees at sunrise: a tall emergent tree with a flat-topped crown, a strangler fig, slim palms, a tree fern',
     'ferns, fallen logs with moss and small mushrooms, broad leaves', 'low warm pink-gold sunrise light from the left'),
    ('w1kapok', 1, 'day', 'rainforest giants: a huge kapok tree with tall flared buttress roots and a broad rounded crown, a strangler fig with bromeliads, palms',
     'buttress roots, ferns, red heliconia flowers, mossy stones', 'fresh green morning light from the upper left'),
    ('w2rapids', 2, 'day', 'a jungle riverbank by rapids: big wet boulders, a fallen tree trunk bridging rocks, palms and reeds, a small waterfall step',
     'wet river stones, reeds and cattails, splashes of white water', 'bright misty daylight'),
    ('w2evening', 2, 'dusk', 'a sloth riverside village in the evening: stilt huts with thatched roofs and lit round windows, rope bridges between palms, lanterns',
     'reeds, a little jetty post, baskets and lanterns', 'warm orange evening light, glowing windows'),
    ('w3sinkhole', 3, 'night', 'the bottom of a moonlit sinkhole: tall rock walls with hanging roots and vines, a big mossy boulder pile, ferns',
     'mossy rocks, ferns and roots, a few pale glowing mushrooms', 'cool blue moonlight from above'),
    ('w3cavern', 3, 'cave', 'a dark cave interior: a natural rock arch, stalagmites and mossy boulders, curtains of glowing blue-green glowworm threads, glowing teal mushrooms',
     'cave rocks and puddles, small glowing teal mushrooms', 'very dark blue-teal, lit only by the glowing threads and mushrooms'),
    ('w4terraces', 4, 'day', 'grey cliff terraces: stepped rock ledges with small trees and ferns growing out, a thin waterfall falling down the steps',
     'grey rocks, ferns and a little stream', 'clear daylight'),
    ('w4mist', 4, 'dawn', 'tall grey rock pinnacles rising out of mist, twisted pines clinging to their tops, a broken stone bridge between two pinnacles',
     'mossy grey rocks and ferns at the edge of a drop', 'soft pale dawn light, mist below'),
    ('w6dawn', 6, 'dawn', 'mangrove trees on tall arching roots standing in still water, spanish moss, an old wooden stilt hut on posts',
     'mangrove roots in shallow water, reeds, lily pads', 'pale pink-grey misty dawn light'),
    ('w6dusk', 6, 'dusk', 'mangrove trees on tall arching roots standing in still black water, spanish moss hanging from the branches, a broken jetty',
     'mangrove roots, reeds and floating leaves', 'deep blue-green dusk light, a few fireflies'),
    ('w7dawn', 7, 'dawn', 'overgrown jungle temple ruins: a tall stepped tower, carved stone gateways, a row of statues wrapped in strangler fig roots',
     'fallen carved blocks, ferns, roots and moss', 'pale gold dawn light through mist'),
    ('w7dusk', 7, 'dusk', 'overgrown jungle temple ruins: broken stone archways, a stepped shrine with a carved stone face wrapped in strangler fig roots, broken columns',
     'fallen carved blocks, a toppled column, roots and dry leaves', 'dim green-grey dusk light'),
    ('w8sunset', 8, 'dusk', 'the high jungle canopy: great round treetops on huge branches, hanging lianas, a giant flowering tree',
     'broad leaves, branch ends and night flowers', 'violet and orange sunset light'),
    ('w8night', 8, 'night', 'the high jungle canopy at night: great dark treetops on huge branches, hanging lianas, pale glowing night flowers',
     'broad dark leaves and pale night flowers, a few fireflies', 'silver moonlight'),
    ('w9dawn', 9, 'dawn', 'a scorched volcanic valley: black basalt columns, charred trees with young green shoots, cooled lava rocks',
     'black lava rock, ash, small green shoots and red flowers', 'pink-grey ash dawn light'),
    ('w9night', 9, 'ember', 'a volcanic valley at night: black basalt columns and rock spires, charred trees, glowing lava cracks in the rocks',
     'black rocks with glowing orange lava cracks, embers', 'red-orange lava glow from below'),
    ('w10dusk', 10, 'storm', 'bare mountain crags before a storm: jagged dark rock spires, an old stone watchtower, iron lamp posts with chains between them',
     'dark wet rocks and stone steps', 'heavy purple storm light'),
    ('w10after', 10, 'dawn', 'bare mountain crags after a storm: jagged dark rock spires, wet stone steps, old iron lamp posts with chains hanging between them',
     'wet dark rocks with puddles and stone steps', 'clearing gold dawn light, wet rock glinting'),
]
R2N = ('a very wide side-scrolling game foreground layer seen straight from the side, a low band of {d} along the bottom of the picture, '
       'uneven top edge, {l}, rich painted texture like a storybook. On one flat plain pure magenta background, no sky, no text, '
       'no characters')


def batch(strengths=(0.6, 0.66), seeds=(7, 23)):
    it = []
    for stem, w, g, mid, near, l in MOODS:
        for part, t, d, H in (('mid', R2, mid, 1104), ('near', R2N, near, 1072)):
            for st in strengths:
                for sd in seeds:
                    it.append({'name': f'{stem}-{part}-s{round(st * 100)}-{sd}', 'start': f'start-{stem}-{part}.webp',
                               'prompt': S + t.format(d=d, l=l), 'strength': st, 'seed': sd, 'w': 2048, 'h': H})
    return it


def batch_starts(out):
    import subprocess
    for k, (stem, w, g, *_r) in enumerate(MOODS):
        for j, part in enumerate(('mid', 'near')):
            subprocess.run([sys.executable, '-I', str(H / 'starts.py'), out, f'{stem}-{part}', str(w), part, g, str(100 + 2 * k + j),
                            '2048', '1104' if part == 'mid' else '1072'], check=True)


if __name__ == '__main__' and sys.argv[1] == 'starts':
    batch_starts(sys.argv[2])
    sys.exit()
if __name__ == '__main__':
    which = sys.argv[1]
    it = {'pilot': lambda: items(PILOT, [7]), 'pilot2': lambda: items2(PILOT2, [0.6, 0.72], [7]), 'batch': batch}[which]()
    spec = {'tag': f'hfbd-{which}', 'loras': LORAS, 'neg': NEG, 'items': it}
    if len(sys.argv) > 3:  # the commit holding the starts
        spec['base'] = (f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[3]}/reference/prop-sheets/qa-notes/'
                        'hf-backdrops/starts/')
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else H / f'spec-{which}.json'
    out.write_text(json.dumps(spec, indent=1))
    print(out, len(it))
