"""Write an hf-props batch spec for tools/art/hfdrake/storygpu.py (unchanged: Qwen-Image img2img + the style model) and print the
hf_jobs run args. The starts are read from GitHub raw at the pushed commit; the spec goes up with the same fetch.

    python3 tools/art/hfprops/make_spec.py <tag> <commit> <world>[,<world>...] [strengths, e.g. 0.82,0.9] [seeds, e.g. 5,17]
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RAW = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/'
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, floor, '
       'perspective, three-quarter view, seen from above, merged pieces, scenery, rounded rectangle, plain box, blank shape')

tag, sha, worlds = sys.argv[1], sys.argv[2], [int(w) for w in sys.argv[3].split(',')]
strengths = [float(s) for s in (sys.argv[4] if len(sys.argv) > 4 else '0.82,0.9').split(',')]
seeds = [int(s) for s in (sys.argv[5] if len(sys.argv) > 5 else '5,17').split(',')]
cells = json.loads((ROOT / 'reference/prop-sheets/qa-notes/hf-props/starts/cells.json').read_text())
items = []
for w in worlds:
    for s in strengths:
        for sd in seeds:
            items.append({'name': f'w{w}-s{round(s * 100)}-{sd}', 'start': f'w{w}.png', 'prompt': cells[f'w{w}']['prompt'], 'strength': s,
                          'seed': sd, 'w': 1536, 'h': 1024, 'loras': [['style', 0.8]], 'neg': NEG})
spec = {'note': f'hf-props batch {tag}, 2026-10-31', 'base': f'{RAW}{sha}/reference/prop-sheets/qa-notes/hf-props/starts/',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = HERE / f'spec-{tag}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items), 'takes')
cmd = (f'set -e; mkdir -p /out/hfprops/{tag}; curl -fsSL {RAW}{{SHA}}/tools/art/hfdrake/storygpu.py -o /tmp/storygpu.py; '
       f'curl -fsSL {RAW}{{SHA}}/tools/art/hfprops/spec-{tag}.json -o /out/hfprops/{tag}/spec.json; '
       f'SPEC=hfprops/{tag}/spec.json SUB=hfprops/{tag} TAG={tag} python /tmp/storygpu.py')
print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True, 'name': f'hfprops-{tag}',
                  'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'],
                  'command': ['bash', '-lc', cmd.replace('{SHA}', '<commit with the spec>')]}, indent=1))
