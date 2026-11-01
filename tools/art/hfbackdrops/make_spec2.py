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
    raw = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/w6to10/img2imggpu.py'
    tag = json.loads(Path(spec).read_text())['tag']
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', f'curl -sSfL {raw} -o /tmp/g.py && SPEC=hfbackdrops2/{Path(spec).name} '
                                  f'SUB=hfbackdrops2/{tag} TAG={tag} python /tmp/g.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}))


if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'starts':
        starts(sys.argv[2], R)
    elif c == 'args':
        args(sys.argv[2], sys.argv[3])
    else:
        rows = {'R': R}[c]
        commit, k, n = sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
        it = items(rows)
        part = it[k::n]
        spec = {'tag': f'hfbd2-{c}{k}', 'loras': LORAS, 'neg': NEG, 'base': BASE.format(c=commit), 'items': part}
        out = H / f'spec-{c}{k}.json'
        out.write_text(json.dumps(spec, indent=1))
        print(out, len(part))
