"""Copy the cut World 8 roost props (propcut.py output) into src/assets/w6to10/props-made/ and list them in the manifest (2026-10-29).
    python3 -I tools/art/hfbatch/addprops.py <propcut out dir> <game checkout>
"""
import json, shutil, sys
from pathlib import Path

SRC, GAME = Path(sys.argv[1]), Path(sys.argv[2])
dst = GAME / 'src/assets/w6to10/props-made'
man_p = GAME / 'src/assets/w6to10/manifest.json'
man = json.loads(man_p.read_text())
TITLES = {'w8roost': "World 8 bat roost: two short mossy roost branches (draw about 260 x 60), a seed pod, a pile, an open pod, a small pile "
                     "(pods about 60 px)",
          'w8roost-b': 'World 8 bat roost, second look (the other img2img take of the same pieces)'}
for n, title in TITLES.items():
    shutil.copy(SRC / f'{n}.webp', dst / f'{n}.webp')
    d = json.loads((SRC / f'{n}.json').read_text())
    d['method'] = 'img2img (Qwen-Image + the style model) from a start sheet built from the World 8 kit (tools/art/hfbatch/propstart.py)'
    (dst / f'{n}.json').write_text(json.dumps(d, indent=1))
    man['propsMade']['sheets'][n] = {'title': title, 'data': f'props-made/{n}.json', 'sheet': f'props-made/{n}.webp',
                                     'frames': {k: [f['w'], f['h']] for k, f in d['frames'].items()}, 'pairs': d['pairs']}
    print(n, (dst / f'{n}.webp').stat().st_size)
man_p.write_text(json.dumps(man, indent=1))
