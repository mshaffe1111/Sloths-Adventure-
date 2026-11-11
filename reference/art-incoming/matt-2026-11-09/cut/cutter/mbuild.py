# Build the M batch: kept PNGs (full size), rejected JPEGs (q85, long side <= 1400), catalog.csv, contact sheets by kind
# (cyan line = measured flat walkable top) on dark and light grounds.  Usage: python3 mbuild.py ROOT OUTDIR KEPTDIR
import sys, os, json, csv, shutil
ROOT, OUT, KEPT = sys.argv[1:4]; sys.path.insert(0, ROOT + '/pylib'); sys.path.insert(0, ROOT + '/cutcode')
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import importlib
T = importlib.import_module(os.environ.get('TABLE', 'mtable'))
K, R, LABELTEXT, STAND, HAND, SMALL_OK = T.K, T.R, T.LABELTEXT, T.STAND, T.HAND, T.SMALL_OK
EXTRA_REJ = getattr(T, 'EXTRA_REJ', {})
from walk import walk_top
# attempt 2 (the critic, 11-10): side-on lily pads have no flat top (the rim curves away at both ends): by hand.
WALK_HAND = {'M-03-a', 'M-03-b', 'M-03-c', 'M-03-d'}
# domed boulder: the flat crown only (columns whose top is within 4 px of the highest)
WALK_SET = {'M-13-b': (3, 355, 604)}
info = json.load(open(ROOT + '/artcut/_cutinfo.json'))
for d in ('rejected', 'sheets'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
os.makedirs(KEPT, exist_ok=True)
rows = []
for r in info:
    for p in r['pieces']:
        pid = p['id']; src = f"{ROOT}/artcut/pieces/{pid}.png"; ls = max(p['w'], p['h'])
        if pid in LABELTEXT: print('label text dropped', pid); continue
        if pid not in K: print('UNCLASSIFIED', pid); continue
        label, kind, world, flt, notes = K[pid]
        row = dict(id=pid, sheet=r['sheet'].split('-')[1], label=label, kind=kind, w=p['w'], h=p['h'],
                   walk_y='', walk_x0='', walk_x1='', flat='', world=world, float_class=flt, status='kept', reason='', notes=notes)
        if pid in R: row['status'] = 'rejected'; row['reason'] = R[pid]
        elif ls < 600 and pid not in SMALL_OK: row['status'] = 'rejected'; row['reason'] = f'under 600 px on its long side ({ls} px): re-roll larger'
        im = Image.open(src); row['w'], row['h'] = im.size; ls = max(im.size)
        if row['status'] == 'kept':
            shutil.copy(src, f'{KEPT}/{pid}.png')
            if kind in STAND:
                al = np.asarray(im)[..., 3]
                res = walk_top(al)
                if pid in WALK_HAND: row['walk_y'] = 'by hand'
                elif pid in WALK_SET: row['walk_y'], row['walk_x0'], row['walk_x1'] = WALK_SET[pid]
                elif res: row['walk_y'], row['walk_x0'], row['walk_x1'] = res[0], res[1], res[2]
                if isinstance(row['walk_y'], int):   # flatness check: share of the span within 3 px of the line
                    op = al > 128; top = np.where(op.any(0), op.argmax(0), 99999)[row['walk_x0']:row['walk_x1'] + 1]
                    row['flat'] = round(float((np.abs(top - row['walk_y']) <= 3).mean()), 2)
                    print('walk', pid, row['walk_y'], row['walk_x0'], row['walk_x1'], 'flat', row['flat'])
                    if row['flat'] < 0.5:   # the critic's test: not a flat top, so no auto line; the reading goes in the notes
                        row['notes'] = (row['notes'] + f" No flat top: the silhouette top near y {row['walk_y']} (x {row['walk_x0']}-{row['walk_x1']}) is only {int(row['flat'] * 100)}% within 3 px of level; stand line by hand.").strip()
                        row['walk_y'], row['walk_x0'], row['walk_x1'] = 'by hand', '', ''
            elif kind in HAND:
                row['walk_y'] = 'by hand'
        else:
            j = Image.new('RGB', im.size, (48, 48, 52)); j.paste(im, (0, 0), im); j.thumbnail((1400, 1400))
            j.save(f'{OUT}/rejected/{pid}.jpg', quality=85)
        rows.append(row)
for pid, (label, kind, world, flt, reason, crop, w_, h_) in EXTRA_REJ.items():
    j = Image.open(f'{ROOT}/{crop}'); j.thumbnail((1400, 1400)); j.save(f'{OUT}/rejected/{pid}.jpg', quality=85)
    rows.append(dict(id=pid, sheet=pid.split('-')[1], label=label, kind=kind, w=w_, h=h_, walk_y='', walk_x0='', walk_x1='', flat='',
                     world=world, float_class=flt, status='rejected', reason=reason, notes='raw sheet crop (not keyed)', src=f'{ROOT}/{crop}'))
cols = ['id', 'sheet', 'label', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'world', 'float_class', 'status', 'reason', 'notes']
with open(f'{OUT}/catalog.csv', 'w', newline='') as f:
    wr = csv.DictWriter(f, cols, extrasaction='ignore'); wr.writeheader(); [wr.writerow(x) for x in rows]
font = ImageFont.load_default(size=22)
def sheet(items, name, cell=420, cols=4, rejected=False):
    n = len(items); rws = (n + cols - 1) // cols; lh = 58
    out = Image.new('RGB', (cols * cell * 2 + 30, rws * (cell + lh) + 10), (20, 20, 20))
    d = ImageDraw.Draw(out)
    for gi, ground in enumerate([(44, 44, 50), (222, 228, 212)]):
        ox = gi * (cols * cell + 30)
        for i, row in enumerate(items):
            x = ox + (i % cols) * cell; y = 10 + (i // cols) * (cell + lh)
            d.rectangle([x + 4, y, x + cell - 4, y + cell], fill=ground)
            im = Image.open(row.get('src') or f"{ROOT}/artcut/pieces/{row['id']}.png").convert('RGBA'); s = min((cell - 20) / im.width, (cell - 20) / im.height)
            t = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
            px, py = x + (cell - t.width) // 2, y + (cell - t.height) // 2
            out.paste(t, (px, py), t)
            if isinstance(row['walk_y'], int):
                yy = py + row['walk_y'] * s
                d.line([px + row['walk_x0'] * s, yy, px + row['walk_x1'] * s, yy], fill=(0, 255, 255), width=3)
            col = (255, 255, 255) if gi == 0 else (20, 20, 20)
            d.text((x + 6, y + cell + 4), f"{row['id']} {row['w']}x{row['h']} {row['float_class']}", fill=(255, 255, 255), font=font)
            d.text((x + 6, y + cell + 28), (row['reason'] if rejected else row['label'])[:38], fill=(200, 200, 200), font=font)
    out.thumbnail((2800, 2800)); out.save(f'{OUT}/sheets/{name}.jpg', quality=85)
kinds = sorted({x['kind'] for x in rows if x['status'] == 'kept'})
for k in kinds:
    it = [x for x in rows if x['kind'] == k and x['status'] == 'kept']
    sheet(it, k.replace(' ', '-'), cols=min(4, len(it)))
sheet([x for x in rows if x['status'] == 'rejected'], 'rejected', cols=4, rejected=True)
kept = [x for x in rows if x['status'] == 'kept']
print('kept', len(kept), 'rejected', len(rows) - len(kept))
for k in kinds: print(' ', k, sum(1 for x in kept if x['kind'] == k), '/', sum(1 for x in rows if x['kind'] == k))
