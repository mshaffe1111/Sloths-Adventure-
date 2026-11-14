"""Park a frame of a props-made atlas: take it out of the SHIPPED sheet (its pixels, its .json frame and take, the w6to10 manifest's
list) and keep it, cut losslessly, in src/game/art/parked/<sheet>-<frame>.png (under src/ for the inventory, never imported: it does not ship; outside src/assets, the shipped art artuse.mjs counts) with a note, so the art is not lost (ENG-16G, R-165.246:
W6's seesaw-b had no draw site once the old 1-6 left; the lead's ruling 11-14 5:08 PM ET: never an allow-list entry).

The rest of the sheet is packed again with Content's packer (geminicut.py pack: the frames in their .json order, 2048 wide, 4 px apart)
and saved as propcut.py saves it (WEBP quality 90, method 6), so a frame before the parked one keeps its place.

    python3 -I tools/art/w6to10/park.py <game checkout> <sheet> <frame> "<why>"
"""
import json, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from geminicut import pack  # noqa: E402

GAME, SHEET, FRAME, WHY = Path(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4]
D = GAME / 'src/assets/w6to10/props-made'
js = D / f'{SHEET}.json'
data = json.loads(js.read_text())
atlas = Image.open(D / data['sheet']).convert('RGBA')
crop = lambda f: atlas.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
if FRAME not in data['frames']:
    sys.exit(f'{SHEET} has no frame {FRAME}')
park = GAME / 'src/game/art/parked'
park.mkdir(parents=True, exist_ok=True)
f0 = data['frames'][FRAME]
crop(f0).save(park / f'{SHEET}-{FRAME}.png', optimize=True)
(park / f'{SHEET}-{FRAME}.json').write_text(json.dumps({'from': f'src/assets/w6to10/props-made/{SHEET}.webp#{FRAME}', 'frame': f0,
                                                        'take': data.get('takes', {}).get(FRAME), 'why': WHY}, indent=1) + '\n')
sprites = {n: crop(f) for n, f in data['frames'].items() if n != FRAME}
sheet, place = pack(sprites)
sheet.save(D / data['sheet'], 'WEBP', quality=90, method=6)
data['size'] = {'w': sheet.width, 'h': sheet.height}
data['frames'] = {n: {**data['frames'][n], 'x': place[n][0], 'y': place[n][1]} for n in sprites}
if isinstance(data.get('takes'), dict):
    data['takes'] = {n: t for n, t in data['takes'].items() if n != FRAME}
data['pairs'] = [p for p in data.get('pairs', []) if FRAME not in p]
js.write_text(json.dumps(data, indent=1))
mf = GAME / 'src/assets/w6to10/manifest.json'
m = json.loads(mf.read_text())
ent = m['propsMade']['sheets'][SHEET]
ent['frames'] = {n: v for n, v in ent['frames'].items() if n != FRAME}
ent['pairs'] = [p for p in ent.get('pairs', []) if FRAME not in p]
mf.write_text(json.dumps(m, indent=1))
print(SHEET, 'now', sheet.size, (D / data['sheet']).stat().st_size, 'bytes;', FRAME, 'parked in', park / f'{SHEET}-{FRAME}.png')
