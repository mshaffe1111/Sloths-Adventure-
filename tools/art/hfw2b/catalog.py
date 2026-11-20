"""ART-W2B: write (or rewrite) the 5 catalog rows for 2-6's painted noria in reference/art/CATALOG-MASTER.csv from the packed frames
(src/game/w2WheelData.ts), modelled on World 2's jetty row (w2-props#jetty); then run `python3 tools/art/catalog_master.py --emit`.
    python3 -I tools/art/hfw2b/catalog.py
Sizes against Pokey's DRAWN 89.1 px (heroSprite.ts:30): the sheet is 3 px a world px.
"""
import csv, io, re
P = 'reference/art/CATALOG-MASTER.csv'
raw = open(P, newline='').read()
rows = list(csv.reader(io.StringIO(raw)))
h = rows[0]; ix = {k: i for i, k in enumerate(h)}
F = {m[0]: dict(re.findall(r'(\w+): ([\d.]+)', m[1])) for m in re.findall(r'  (\w+): \{ ([^}]*) \}', open('src/game/w2WheelData.ts').read())}
MINE = {f'w2-wheel#{k}' for k in F}
rows = [r for r in rows if r[0] not in MINE]
tl = next(r for r in rows if r[0] == 'w2-props#jetty')
SRC = 'World 2 wheel (props/w2-wheel.webp; ART-W2B 2026-11-18, HF Qwen-Image-Edit from geometry paste-ups, World 2 jetty/ladder as the style)'
WORLDS = ('USED 2 Sunlit Riverbank: the bank village\'s norias lift him to the next street (2-6 Up the Bank Houses) | '
          'COULD 6 Deep Mangrove: a swamp mill; 5 Orchid Sanctuary: a garden water wheel')
DRAW = 'one drawImage of an atlas part from w2-wheel.webp (wheelDraw.ts paintWheel; the noria turned: 1 save/rotate/restore a wheel)'
P_ = 89.1
def row(n, kind, slot, footing, layer, uw, uh, notes):
    f = F[n]; r = list(tl)
    vals = dict(id=f'w2-wheel#{n}', source=SRC, file=f"src/assets/props/w2-wheel.webp#{n} ({f['x']},{f['y']} {f['w']}x{f['h']})", kind=kind,
                w=f['w'], h=f['h'], worlds=WORLDS, engine_slot=slot, footing=footing, layer=layer,
                on_screen_px=f'{uw:.0f}x{uh:.0f} (world px; 3 sheet px a unit)', ship_px=f['h'], file_kb='', file_kb_ship='', draw_cost=DRAW,
                used_in='2-6 (the wheel; ?fixture=wheel)', status='in game', notes=notes, part='W2B', pokey_scale=f'{uh / P_:.2f}', scale_ok='y',
                scale_basis='drawn')
    f = F[n]
    # the walk line: a bucket's is its floor top (ay) over the floor's width (ax .. ax + floorW, 360 sheet px); the noria and the lip carry none
    if 'ay' in f:
        vals.update(walk_y=round(float(f['ay'])), walk_x0=round(float(f['ax'])), walk_x1=round(float(f['ax'])) + 360)
    else:
        vals.update(walk_y='', walk_x0='', walk_x1='')
    for k, v in vals.items(): r[ix[k]] = str(v)
    return r
nr = float(F['noria']['w']) / 3
new = [row('noria', 'set piece (water wheel: rim + 6 spokes, turned with the wheel)', 'piece wheel, layer back (pieces/wheelPiece.ts -> wheelDraw.ts: '
           'centred on the axle, turned so a spoke meets every bucket floor, scaled to R / r: one frame for R160-200)',
           'none (behind: the buckets are the footing)', 'back (behind the jetty, the street and him)', nr * 180 / 200, nr * 180 / 200,
           'drawn at R180 = 4.0 Pokeys across the bucket floors (R160 3.6, R200 4.5); spokes and rim only, no drips (they would turn)')]
for n, what in (('bucket', 'dry, on the way up'), ('bucketSpillR', 'spilling over its right end, near the top'), ('bucketSpillL', 'spilling over its left end, near the top (bucketSpillR mirrored)')):
    f = F[n]
    new.append(row(n, f'set piece (a noria bucket, {what})', 'piece wheel bucket (wheelDraw.ts paintWheel: frame (ax, ay) = the floor\'s left end, top, ON the '
                   'bucket platform: art = collider)', 'the floor board top = the bucket platform top (120 px wide, 16 thick: WHEEL.bucketW/H)',
                   'back (behind him: he stands in the trough at the floor line)', float(f['w']) / 3, float(f['h']) / 3,
                   'trough 120 px floor (1.35 Pokeys), walls ~34 px (0.38) over the floor; spill frames are edits of the dry take (one cell)'))
f = F['lip']
new.append(row('lip', 'set piece (the millrace\'s wooden wall)', 'piece wheel (wheelDraw.ts paintWheel: two halves end to end across the wheel\'s pond, '
               'its coping LIP_UP 34 px over the water, the water drawn over its foot)', 'none (stands in the pond; the pond is the footing)',
               'back (behind the water and him)', 400, 104, 'drawn 2 x (pond width / 2): 400 x 104 px at R180 (1.17 Pokeys tall, the water over its foot)'))
last = max(i for i, r in enumerate(rows) if r[0].startswith('w2-props#'))
rows = rows[:last + 1] + new + rows[last + 1:]
b = io.StringIO(); csv.writer(b, lineterminator='\r\n' if '\r\n' in raw[:2000] else '\n').writerows(rows)
open(P, 'w', newline='').write(b.getvalue())
print('rows written', len(new))
