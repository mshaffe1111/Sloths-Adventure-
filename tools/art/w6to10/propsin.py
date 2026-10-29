"""Put the cut prop sheets (propcut.py's out dir) into the game: src/assets/w6to10/props-made/<sheet>.webp + .json, and their list in
src/assets/w6to10/manifest.json under "propsMade" (nothing imports them yet; each world's hook-up draws them).

    python3 -I tools/art/w6to10/propsin.py <cut dir> <game checkout>
"""
import json, shutil, sys
from pathlib import Path

CUT, GAME = Path(sys.argv[1]), Path(sys.argv[2])
D = GAME / 'src/assets/w6to10/props-made'
D.mkdir(parents=True, exist_ok=True)
TITLES = {
    'w5a': 'World 5 set dressing', 'w5b': 'World 5 puzzle pieces (silk lever, orchid plate, silk curtain door)',
    'w6c': 'World 6 set dressing', 'w6d': "World 6 sections' props (root arch, root den, hides, logs)",
    'w7b': 'World 7 platforms and blocks', 'w7c': 'World 7 set dressing', 'w7-plates': 'World 7 pressure plate',
    'w8b': 'World 8 platforms', 'w8c': 'World 8 set dressing', 'w9b': 'World 9 platforms', 'w9c': 'World 9 set dressing',
    'w10a': 'World 10 puzzle pieces (iron lever, iron plate, portcullis)', 'w10b': 'World 10 platforms',
    'w6c-b': 'World 6 set dressing, second look', 'w7c-b': 'World 7 set dressing, second look', 'w8c-b': 'World 8 set dressing, second look',
    'w9c-b': 'World 9 set dressing, second look', 'w5a-b': 'World 5 set dressing, second look',
    'w10alt': "World 10 set dressing, second look (Matt's Gemini set repainted)", 'w6balt': "World 6 water room, second look (Matt's Gemini set repainted)",
    **{f'w{w}var': f'World {w} platform variants (its kit pieces, painted again)' for w in range(5, 11)},
}
mf = GAME / 'src/assets/w6to10/manifest.json'
m = json.loads(mf.read_text())
m.setdefault('propsMade', {'note': 'Props made 2026-10-29 by img2img (Qwen-Image + the style model) over flat side-on start sheets built from '
                                   'each world kit (tools/art/w6to10/propstarts.py, img2imggpu.py, propcut.py); frames anchored at the middle '
                                   'of the foot, paired states on one canvas and anchor.', 'sheets': {}})
for j in sorted(CUT.glob('*.json')):
    data = json.loads(j.read_text())
    shutil.copy(j, D / j.name)
    shutil.copy(CUT / data['sheet'], D / data['sheet'])
    k = j.stem
    m['propsMade']['sheets'][k] = {'title': TITLES.get(k, k), 'data': f'props-made/{j.name}', 'sheet': f'props-made/{data["sheet"]}',
                                   'frames': {n: [f['w'], f['h']] for n, f in data['frames'].items()}, 'pairs': data.get('pairs', [])}
    for x in (D / j.name, D / data['sheet']):
        m['files'][f'props-made/{x.name}'] = x.stat().st_size
    print(k, (D / data['sheet']).stat().st_size, len(data['frames']))
mf.write_text(json.dumps(m, indent=1))
