"""hf-backdrops2 (2026-11-01) specs: the redo of last night's rejects, the crown-top fixes, a new W5 gold middle strip (round R), then
the third and fourth moods (round M). img2img from starts2.py's paste-ups with the style model (tools/art/w6to10/img2imggpu.py).
    python3 tools/art/hfbackdrops/make_spec2.py starts <out dir>              the round R starts
    python3 tools/art/hfbackdrops/make_spec2.py R <commit> <k> <n>           part k of n of round R -> spec-R<k>.json
    python3 tools/art/hfbackdrops/make_spec2.py args <spec> <commit>         the hf_jobs run args
"""
import json, subprocess, sys
from pathlib import Path

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H))
from make_spec import LORAS, MOODS, NEG, R2, R2N, S  # noqa: E402

BASE = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{c}/reference/prop-sheets/qa-notes/hf-backdrops2/starts/'
MOOD = {m[0]: m for m in MOODS}
CROWN = 'every tree with its whole broad rounded leafy crown inside the picture, nothing cut flat at the top'
# (name, src stem, part, grade, seed, mode, trim, description, light, strengths)
R = [
    ('w8sunset-mid', 'w8', 'mid', 'dusk', 201, 'remix', 0.25, None, None, (0.7, 0.76)),
    ('w8night-mid', 'w8', 'mid', 'night', 202, 'remix', 0.25, None, None, (0.7, 0.76)),
    ('w2rapids-near', 'w2', 'near', 'day', 203, 'remix', 0, None, None, (0.62, 0.68)),
    ('w2evening-near', 'w2', 'near', 'dusk', 204, 'remix', 0, None, None, (0.62, 0.68)),
    ('w4terraces-near', 'w4', 'near', 'day', 205, 'remix', 0, None, None, (0.62, 0.68)),
    ('w6dawn-near', 'w6', 'near', 'dawn', 206, 'remix', 0, None, None, (0.62, 0.68)),
    ('w3sinkhole-mid', 'w3', 'mid', 'night', 207, 'remix', 0, None, None, (0.64, 0.7)),
    ('w3sinkhole-near', 'w3', 'near', 'night', 208, 'remix', 0, None, None, (0.62, 0.68)),
    ('w6dawn-mid', 'w6', 'mid', 'dawn', 209, 'remix', 0, None, None, (0.64, 0.7)),
    ('w9dawn-mid', 'w9', 'mid', 'dawn', 210, 'remix', 0, None, None, (0.64, 0.7)),
    ('w5-mid', 'w5gold2', 'mid', 'day', 211, 'remix', 0,
     'an orchid forest: big old trees of different shapes with broad rounded leafy crowns, white and pink orchids blooming on the trunks, '
     'ferns and mossy roots', 'warm golden afternoon light', (0.66, 0.72)),
    ('w1-mid', 'w1', 'mid', 'day', 212, 'crown', 0, 'rainforest trees: a great buttressed tree, tall straight trunks with lianas',
     'soft green morning light', (0.52, 0.6)),
    ('w1c-mid', 'w1c', 'mid', 'day', 213, 'crown', 0, 'high rainforest canopy trees: broad branches, tall straight trunks, lianas and bromeliads',
     'soft green morning light', (0.52, 0.6)),
    ('w3-mid', 'w3', 'mid', 'day', 214, 'crown', 0, 'a mossy jungle grotto: rock arches overgrown with ferns and vines, glowing drops of water',
     'cool green-teal shade', (0.52, 0.6)),
    ('w6-mid', 'w6', 'mid', 'day', 215, 'crown', 0, 'mangrove trees on tall arching roots standing in still water, spanish moss',
     'soft grey-green swamp light', (0.52, 0.6)),
    ('w7-mid', 'w7', 'mid', 'day', 216, 'crown', 0, 'overgrown jungle temple ruins: a stepped shrine with a carved stone face, stone archways and broken columns',
     'soft grey-green jungle light', (0.52, 0.6)),
]


# ---- round M: the third and fourth moods. (stem, world, grade, far + sky, middle, near, light, mid trim) ----
MOODS2 = [
    ('w1rain', 1, 'storm', 'a rain-soaked rainforest afternoon: layers of misty jungle hills and giant emergent trees fading into soft grey rain, low rain clouds',
     'rainforest trees in the rain: a giant tree with a broad dripping crown, palms bent under rain, a tree fern, a waterfall of rain off the leaves',
     'wet ferns, dripping broad leaves, puddles and mossy stones', 'soft grey-green rainy light, everything wet and glistening', 0),
    ('w2mist', 2, 'dawn', 'a misty dawn on a wide jungle river: still pale water, far banks of palms and big trees fading into morning mist, a pale pink-gold sun low over the river',
     'a misty riverbank at dawn: big mossy boulders, palms and a leaning tree over the water, a little wooden fishing jetty on posts, reeds',
     'reeds, cattails, wet river stones and lily pads', 'pale pink-gold dawn light through river mist', 0),
    ('w3crystal', 3, 'cave', 'a vast crystal grotto: far cave walls lined with huge glowing blue and violet crystal clusters, an underground lake reflecting them, a high dark cave roof',
     'a crystal grotto seen from the side: rock pillars studded with big glowing violet and blue crystals, a natural rock arch, crystal clusters on mossy boulders',
     'cave rocks with small glowing crystals and puddles', 'deep blue-violet cave light, glowing crystals', 0),
    ('w4storm', 4, 'storm', 'a thunderstorm over grey cliffs: tall grey rock cliffs and pinnacles under dark rolling storm clouds, a far lightning bolt, grey rain curtains',
     'grey cliff pinnacles in a storm: wind-bent pines clinging to the rocks, a rope bridge between two rocks, rocks wet with rain',
     'wet grey rocks, wind-bent grass and ferns', 'dark blue-grey storm light, wet rock with pale highlights', 0),
    ('w6moon', 6, 'night', 'a moonlit swamp: a big full moon over still black water, far mangrove trees and hanging moss in silhouette, silver reflections, a starry sky',
     'mangrove trees at night on tall arching roots in still black water, hanging spanish moss, a few fireflies, pale glowing swamp flowers',
     'mangrove roots, reeds and lily pads with pale glowing flowers', 'silver blue moonlight', 0),
    ('w7court', 7, 'day', 'a sunlit jungle temple courtyard at noon: tall stepped stone temples and carved towers, jungle trees behind, a bright blue sky with white clouds',
     'a temple courtyard at noon: carved stone pillars, a stone stairway, big stone statues and flower urns, palms and jungle vines',
     'carved paving stones, broken pillars, ferns and flowers', 'bright warm noon sunlight, clear shadows', 0),
    ('w8dawn', 8, 'dawn', 'dawn over the high jungle canopy: a sea of round treetops seen from above, mist between them, a soft pink-gold sun rising, a few birds far away',
     'the high jungle canopy at dawn: great round treetops on huge branches, hanging lianas, a giant flowering tree, mist in the gaps',
     'broad leaves, branch ends and morning flowers with dew', 'soft pink and gold dawn light', 0.25),
    ('w9ash', 9, 'storm', 'an ash storm in a volcanic valley: a smoking volcano far away, grey ash clouds rolling across the sky, black basalt ridges, dim orange glow under the ash',
     'a volcanic valley in an ash storm: black basalt columns and rock spires, charred dead trees, ash drifting',
     'black rocks covered in grey ash, embers', 'dim grey-orange light through falling ash', 0),
    ('w10night', 10, 'night', 'the mountain summit at night: snowy jagged peaks under a huge starry night sky with a band of the milky way and a crescent moon',
     'bare mountain crags at night: jagged dark rock spires with snow on the ledges, an old stone watchtower with a lit window, iron lamp posts',
     'dark rocks with snow and frost, stone steps', 'cold blue night light, starlight on the snow', 0),
]
FAR = ('a very wide side-scrolling game background, the far distance seen straight from the side: {d}. The upper third of the picture is '
       'open sky, the lower two thirds the far scenery, rich painted texture like a storybook, soft atmospheric depth')
FARNEG = ('foreground, ground in front, close-up plants, frame, border, panel, text, letters, watermark, people, animal, sloth, face, '
          'creature, character, blurry, photo, 3d render')
M = [r for st, w, g, far, mid, near, l, trim in MOODS2 for r in (
    (f'{st}-mid', f'w{w}', 'mid', g, 300 + 2 * w, 'remix', trim, mid, l, (0.68, 0.76)),
    (f'{st}-near', f'w{w}', 'near', g, 301 + 2 * w, 'remix', 0, near, l, (0.62, 0.68)))]


def fars(seeds=(7, 23, 41)):
    return [{'name': f'{st}-tall-{sd}', 'prompt': S + FAR.format(d=far + ', ' + l), 'neg': FARNEG, 'seed': sd, 'w': 1792, 'h': 1200,
             'steps': 30} for st, w, g, far, mid, near, l, trim in MOODS2 for sd in seeds]


def what(name, d, l):
    if d:
        return d, l
    m = MOOD[name.rsplit('-', 1)[0]]
    return (m[3], m[5]) if name.endswith('-mid') else (m[4], m[5])


def items(rows, seeds=(7, 23)):
    it = []
    for name, src, part, g, sd0, mode, trim, d, l, sts in rows:
        d, l = what(name, d, l)
        t = R2 if part == 'mid' else R2N
        p = S + t.format(d=d + (', ' + CROWN if part == 'mid' else ''), l=l)
        for st in sts:
            for sd in seeds:
                it.append({'name': f'{name}-s{round(st * 100)}-{sd}', 'start': f'start-{name}.webp', 'prompt': p, 'strength': st,
                           'seed': sd, 'w': 2048, 'h': 1104 if part == 'mid' else 1072})
    return it


def starts(out, rows):
    for name, src, part, g, sd, mode, trim, *_ in rows:
        subprocess.run([sys.executable, '-I', str(H / 'starts2.py'), out, name, src, part, g, str(sd), mode, str(trim)], check=True)


def args(spec, sha):
    # (the job fetches the script and the spec from the repo at a pushed commit, so nothing has to be written to the bucket first)
    gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/'
    raw = gh + ('w6to10/stillsgpu.py' if 'spec-F' in spec else 'w6to10/img2imggpu.py')
    tag = json.loads(Path(spec).read_text())['tag']
    fetch = f'mkdir -p /out/hfbackdrops2 && curl -sSfL {gh}hfbackdrops/{Path(spec).name} -o /out/hfbackdrops2/{Path(spec).name} && '
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', fetch + f'curl -sSfL {raw} -o /tmp/g.py && SPEC=hfbackdrops2/{Path(spec).name} '
                                  f'SUB=hfbackdrops2/{tag} TAG={tag} python /tmp/g.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}))


if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'starts':
        starts(sys.argv[2], {'R': R, 'M': M}[sys.argv[3] if len(sys.argv) > 3 else 'R'])
    elif c == 'args':
        args(sys.argv[2], sys.argv[3])
    elif c == 'F':  # the far + sky pictures, text to image (tools/art/w6to10/stillsgpu.py)
        it = fars()
        spec = {'tag': 'hfbd2-F', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]},
                'neg': FARNEG, 'items': it}
        (H / 'spec-F.json').write_text(json.dumps(spec, indent=1))
        print('spec-F.json', len(it))
    else:
        rows = {'R': R, 'M': M}[c]
        commit, k, n = sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
        it = items(rows)
        part = it[k::n]
        spec = {'tag': f'hfbd2-{c}{k}', 'loras': LORAS, 'neg': NEG, 'base': BASE.format(c=commit), 'items': part}
        out = H / f'spec-{c}{k}.json'
        out.write_text(json.dumps(spec, indent=1))
        print(out, len(part))
