"""Cut the img2img prop sheets (img2imggpu.py: 3 x 2 on a key colour, the cells of propstarts.py) into sprites, each cell from the take
picked for it, the paired states on one canvas and anchor (as geminicut.py). Out: <sheet>.webp atlas + <sheet>.json per world sheet,
and a check picture on a checker.

    python3 -I tools/art/w6to10/propcut.py <takes dir> <starts.json> <picks.json> <out dir>

picks.json: {"<sheet>" or "<sheet>@<tag>" (a second look, written <sheet>-<tag>): {"<cell>": "<take name>" | null (left out)}, ...}; a cell not named takes the sheet's "*" pick.
"""
import json, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from geminicut import cut_cell, foot_x, pack, checker, pair_up  # noqa: E402

TAKES, STARTS, PICKS, OUT = Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text()), json.loads(Path(sys.argv[3]).read_text()), Path(sys.argv[4])
OUT.mkdir(parents=True, exist_ok=True)
PAIRS = [('lever-up', 'lever-down'), ('plate-up', 'plate-down'), ('door-closed', 'door-open'), ('portcullis-down', 'portcullis-up'),
         ('gate-closed', 'gate-open')]
report = {}
for out_name, picks in PICKS.items():
    # ("w6c@b": a second look of sheet w6c, written as w6c-b)
    sheet = out_name.split('@')[0]
    st = STARTS[sheet]
    sprites, anchors, src = {}, {}, {}
    for i, cn in enumerate(st['cells']):
        take = picks.get(cn, picks.get('*'))
        if not take:
            continue
        f = next((p for p in (TAKES / f'{take}.webp', TAKES / f'{take}.png') if p.exists()), None)
        im = Image.open(f).convert('RGB')
        cw, ch = im.width / 3, im.height / 2
        cx, cy = i % 3, i // 3
        m = 4
        cell = im.crop((round(cx * cw) + m, round(cy * ch) + m, round((cx + 1) * cw) - m, round((cy + 1) * ch) - m))
        sp = cut_cell(cell, st['key'], {})
        if sp is None:
            print('EMPTY', sheet, cn, take); continue
        sprites[cn], anchors[cn], src[cn] = sp, (foot_x(sp), sp.height), take
    pair_up(sprites, anchors, PAIRS)
    name = out_name.replace('@', '-')
    atlas, place = pack(sprites)
    atlas.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    frames = {n: {'x': place[n][0], 'y': place[n][1], 'w': im.width, 'h': im.height, 'ax': round(float(anchors[n][0]), 1), 'ay': anchors[n][1]}
              for n, im in sprites.items()}
    (OUT / f'{name}.json').write_text(json.dumps({'sheet': f'{name}.webp', 'size': {'w': atlas.width, 'h': atlas.height}, 'anchor': 'middle of the foot',
                                                   'pairs': [p for p in PAIRS if p[0] in sprites and p[1] in sprites], 'takes': src,
                                                   'method': 'img2img (Qwen-Image + the style model) from side-on start sheets built from the world kit (propstarts.py)',
                                                   'frames': frames}, indent=1))
    checker(atlas).save(OUT / f'check-{name}.jpg', quality=85)
    report[name] = (atlas.size, (OUT / f'{name}.webp').stat().st_size, {n: (f['w'], f['h']) for n, f in frames.items()})
    print(name, *report[name])
