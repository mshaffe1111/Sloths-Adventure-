import sys, os, json, csv, shutil
ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib'); sys.path.insert(0, ROOT + '/cutcode')
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from table import K, R, SMALLNAMES
from walk import walk_top
OUT = ROOT + '/artcut'
info = json.load(open(OUT + '/_cutinfo.json'))
for d in ['kept', 'rejected', 'sheets', 'checks']:
    os.makedirs(f'{OUT}/{d}', exist_ok=True)
WALK = {'walkable log', 'plank', 'bough', 'stump-step', 'floating earth island (FLOAT CANDIDATE)', 'pit wall or lip', 'rock (grounded)', 'ground band'}
kept, rej = [], []
for r in info:
    for p in r['pieces']:
        pid = p['id']; ls = max(p['w'], p['h'])
        src = f"{OUT}/pieces/{pid}.png"
        row = dict(id=pid, sheet=r['sheet'], w=p['w'], h=p['h'], sharp=p['sharp'], touch=' '.join(p['touch']))
        if r['sheet'] in R:
            row['reason'] = R[r['sheet']]; rej.append(row)
        elif pid in R:
            row['reason'] = R[pid]; rej.append(row)
        elif pid in K and ls >= 600:
            row['kind'], row['world'], row['notes'] = K[pid]; kept.append(row)
        elif pid in K or pid in SMALLNAMES:
            nm = SMALLNAMES.get(pid) or K.get(pid, ('',))[0]
            row['reason'] = f're-roll larger: {nm}, {ls} px on its long side (under 600)'; rej.append(row)
        else:
            print('UNCLASSIFIED', pid, p['w'], p['h'])
            continue
        shutil.copy(src, f"{OUT}/{'kept' if 'kind' in row else 'rejected'}/{pid}.png")
# walkable tops
for row in kept:
    row['walk_y'] = row['walk_x0'] = row['walk_x1'] = ''
    if row['kind'] in WALK:
        a = np.asarray(Image.open(f"{OUT}/kept/{row['id']}.png"))[..., 3]
        res = walk_top(a)
        if res:
            row['walk_y'], row['walk_x0'], row['walk_x1'], row['walk_frac'] = res
HAND = {'W2-08-a': 'peaked top, no flat surface; set colliders by hand',
        'W2-20-b': 'diagonal ramp; set a sloped collider by hand',
        'W1-04-a': 'uneven lumpy top (leaf and mushroom clumps); set by hand',
        'W1-07-a': 'auto line hit the chanterelle tops; moss surface is lower and domed; set by hand',
        'W1-08-a': 'auto line hit the chanterelle tops; moss surface is lower and domed; set by hand'}
for row in kept:
    if row['id'] in HAND:
        row['walk_y'] = row['walk_x0'] = row['walk_x1'] = ''
        row['notes'] += ' Walk top: ' + HAND[row['id']] + '.'
json.dump(dict(kept=kept, rej=rej), open(OUT + '/_build.json', 'w'), indent=1)
print('kept', len(kept), 'rejected', len(rej))

# ---- contact sheets per group ----
GROUPS = [
 ('logs', 'Logs, planks and boughs', {'walkable log', 'plank', 'bough'}),
 ('steps', 'Stumps and steps', {'stump-step'}),
 ('rocks', 'Rocks (grounded)', {'rock (grounded)'}),
 ('float', 'Float candidates (rate: can it float?)', {'floating earth island (FLOAT CANDIDATE)'}),
 ('bushes-decor', 'Bushes, ferns, vines and decor', {'bush', 'fern', 'vine', 'decor', 'other'}),
 ('hazards', 'Thorn hazards', {'thorn hazard'}),
 ('bands', 'Water, ground bands and pit walls', {'water band', 'ground band', 'pit wall or lip'}),
 ('hide', 'Hide spots and caves', {'hide spot', 'cave'}),
]
fbig = ImageFont.load_default(size=34); fsm = ImageFont.load_default(size=22)
def checker(w, h, a=(58, 58, 58), b=(70, 70, 70), s=24):
    im = Image.new('RGB', (w, h), a); d = ImageDraw.Draw(im)
    for y in range(0, h, s):
        for x in range((y // s) % 2 * s, w, 2 * s): d.rectangle([x, y, x + s - 1, y + s - 1], fill=b)
    return im
def make_sheet(rows, title, path, tile=520, cols=4, show_reason=False):
    tiles = []
    for row in rows:
        d = 'kept' if not show_reason else 'rejected'
        im = Image.open(f"{OUT}/{d}/{row['id']}.png")
        s = min(tile / im.width, tile / im.height)
        t = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        cell = checker(tile + 20, tile + 90)
        ox, oy = 10 + (tile - t.width) // 2, 50 + (tile - t.height) // 2
        cell.paste(t, (ox, oy), t)
        dr = ImageDraw.Draw(cell)
        if not show_reason and row.get('walk_y', '') != '':
            y = oy + row['walk_y'] * s
            dr.line([ox + row['walk_x0'] * s, y, ox + row['walk_x1'] * s, y], fill=(0, 230, 255), width=3)
        dr.rectangle([0, 0, cell.width, 44], fill=(20, 20, 20))
        dr.text((8, 6), row['id'], fill=(255, 220, 60), font=fbig)
        dr.text((8, tile + 58), f"{row['w']}x{row['h']}  " + (row.get('kind', '')[:34] if not show_reason else row['reason'][:46]), fill=(230, 230, 230), font=fsm)
        tiles.append(cell)
    if not tiles: return
    cw, ch = tiles[0].size
    n = len(tiles); rws = (n + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (cw + 8) + 8, 70 + rws * (ch + 8) + 8), (25, 25, 25))
    ImageDraw.Draw(sheet).text((12, 14), title + f'  ({n})' + ('' if show_reason else '   cyan line = measured flat walkable top'), fill=(255, 255, 255), font=fbig)
    for i, t in enumerate(tiles):
        sheet.paste(t, (8 + (i % cols) * (cw + 8), 70 + (i // cols) * (ch + 8)))
    sheet.save(path, quality=88)
for key, title, kinds in GROUPS:
    make_sheet([r for r in kept if r['kind'] in kinds], title, f'{OUT}/sheets/{key}.jpg')
make_sheet(rej, 'Rejected cuts (reason under each)', f'{OUT}/sheets/rejected.jpg', tile=300, cols=6, show_reason=True)
