"""Before/after frame strips from two rec.mjs runs (pokey-anim): each moment's frames cropped round Pokey, before above, after below.

    python3 -I tools/art/pokeyanim/strips.py <rec dir> <out dir> <side|up> <zoom>   (zoom: the engine's e.zoom for that viewport)
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

rec, out, ori, zoom = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3], float(sys.argv[4])
out.mkdir(parents=True, exist_ok=True)
cam = {t: json.load(open(rec / f'{t}-{ori}-cam.json')) for t in ('before', 'after')}
tr = cam['before']
land = next(i for i in range(126, len(tr)) if tr[i][5] and not tr[i - 1][5])
MOMENTS = {
    'turn': range(14, 21),
    'runstart': range(34, 41),
    'skid': range(56, 66),
    'hardland': range(land - 1, land + 8),
    'doublejump': range(182, 196, 1),
}
# a wider crop where he leaves the ground a long way (css px round him)
WIDE = {'doublejump': 95, 'hardland': 70}
DPR = 2
HALF = 55  # css px round him
for name, rng in MOMENTS.items():
    half = WIDE.get(name, HALF)
    cells = []
    for t in ('before', 'after'):
        row = []
        for i in rng:
            x, y, *_r = cam[t][i]
            cx, cy = cam[t][i][6], cam[t][i][7]
            sx, sy = (x - cx) * zoom, (y - cy) * zoom - (40 if half == HALF else half * 0.9 / zoom) * zoom
            im = Image.open(rec / f'{t}-{ori}-frames' / f'f{i:05d}.png')
            box = [round((sx - half) * DPR), round((sy - half) * DPR), round((sx + half) * DPR), round((sy + half) * DPR)]
            row.append(im.crop(box).resize((HALF * 2 * DPR, HALF * 2 * DPR)))
        cells.append(row)
    n = len(cells[0]); c = HALF * 2 * DPR
    sheet = Image.new('RGB', (n * c, 2 * c + 40), (30, 30, 30))
    d = ImageDraw.Draw(sheet)
    for r, row in enumerate(cells):
        for k, im in enumerate(row):
            sheet.paste(im, (k * c, 20 + r * (c + 20) - (0 if r == 0 else 0)))
        d.text((6, r * (c + 20) + 4), ('BEFORE' if r == 0 else 'AFTER') + f'  {name}  {ori}  frames {rng.start}-{rng.stop - 1} (30 fps)', fill=(255, 255, 0))
    sheet.save(out / f'{name}-{ori}.jpg', quality=85)
    print(name, n, 'frames')
