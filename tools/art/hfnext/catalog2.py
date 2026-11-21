"""ART-NEXT-c: write (or rewrite) the batch 2 cut rows (part NEXT2: World 3's grotto floor kit + the reeds redo) in
reference/art/CATALOG-MASTER.csv, modelled on World 3's shelf (w3-new#shelf-short) and tools/art/hfnext/catalog.py; then run
`python3 tools/art/catalog_master.py --emit`.
    python3 -I tools/art/hfnext/catalog2.py
The cuts are not packed or placed: file = 'origin/t-art-next:reference/art/hfnext/cut/<n>.png'. Scale: every cut is 3 cut px a world px
(K = the start's canvas px a unit / 3) except the floor lips, 2.2 (K 1: their 880 px start was 400 units). Sizes against Pokey's DRAWN
89.1 px. Walk lines measured from alpha (the median first solid row, alpha > 160, over the right half: the tufts sit on the left), in cut
px. Sizes here and in contact2.py's SIZE go together.
"""
import csv, io, os
from PIL import Image
P = 'reference/art/CATALOG-MASTER.csv'
C = 'reference/art/hfnext/cut/'
PU = 89.1
raw = open(P, newline='').read()
rows = list(csv.reader(io.StringIO(raw)))
h = rows[0]; ix = {k: i for i, k in enumerate(h)}
rows = [r for r in rows if not r[0].startswith('w3-next#')]
tl = next(r for r in rows if r[0] == 'w3-new#shelf-short')
SRC = ('World 3 batch 2 (ART-NEXT-b 2026-11-20, HF Qwen-Image-Edit-2511 from paste-ups of the World 3 shelves; the reeds redo ART-NEXT-c '
       '11-21; cut ART-NEXT-c: tools/art/hfnext/cut.py, the lit pieces with its glow un-mix)')
GLOWFIT = ("1 teal glow belongs underground or at night (green home forest); 2 teal glow: underground or night (river village); 4 teal glow "
           "(slate and mist); 5 teal glow (flower garden); 6 teal glow (grey-wet mangrove); 7 teal glow (sand-stone ruins); 9 lava and ash "
           "world: black rock, red glow; 10 stone-and-iron fortress")
STONEFIT = ("1 the home forest's stones are its own (World 1 kit); 2 the river's rocks are warm brown (World 2 kit); 5 flower garden; "
            "7 sand-stone ruins: warm stone; 9 lava and ash world: black rock, red glow; 10 stone-and-iron fortress: dressed stone")
STATUS = 'cut, not placed (ART-NEXT-c): a level builder wires it'
DRAW = 'one drawImage of a cut png (pack into a World 3 atlas when wired)'
WALK = {  # cut px: walk_y, x0, x1 (measured: see the docstring)
    'lipA-s11': (88, 20, 860), 'lipA-s23': (71, 20, 935), 'lipA-s37': (91, 20, 895), 'lipB-s23': (63, 30, 930), 'lipB-s37': (79, 30, 860),
    'rimLong-s11': (66, 10, 645), 'rimS-s11': (38, 6, 330), 'rimS-s23': (54, 6, 458), 'rimShort-s11': (59, 6, 389),
    'shelfS-s37': (48, 8, 410), 'sleepy-s23': (135, 222, 649), 'sleepy-s37': (131, 197, 643), 'mat-s23': (11, 69, 272)}
def row(n, kind, cpu=3.0, **v):
    r = list(tl); im = Image.open(C + n + '.png'); W, H = im.width / cpu, im.height / cpu
    wy, x0, x1 = WALK.get(n, ('', '', ''))
    base = dict(id=f'w3-next#{n}', source=SRC, file=f'origin/t-art-next:{C}{n}.png', kind=kind, w=im.width, h=im.height, walk_y=wy,
                walk_x0=x0, walk_x1=x1, flat='y' if wy != '' else '', world_best=3, made_thing='n', ship_px=im.height,
                file_kb=f'{os.path.getsize(C + n + ".png") / 1024:.1f}', file_kb_ship='', draw_cost=DRAW, used_in='none (not placed)',
                status=STATUS, part='NEXT2', layer='platform', float_class='may float',
                on_screen_px=f'{W:.0f}x{H:.0f} (world px: {cpu} cut px a unit)', pokey_scale=f'{H / PU:.2f}', scale_ok='y', scale_basis='drawn',
                footing=(f'the top face: walk line y {wy} from x {x0} to {x1} (cut px; {wy / cpu:.0f} world px under the top of the box)'
                         if wy != '' else 'none (decor)'))
    base.update(v)
    for k, val in base.items(): r[ix[k]] = str(val)
    return r
new = []
for n, t in (('lipA-s11', 'A (rounded ends)'), ('lipA-s23', 'A (rounded ends)'), ('lipA-s37', 'A (rounded ends)'),
             ('lipB-s23', 'B (broken ends)'), ('lipB-s37', 'B (broken ends)')):
    new.append(row(n, f'floor lip {t}: a long grey-green grotto slab, moss and a fern tuft at its back end, a short rock skirt under it', 2.2,
                   worlds='USED none | COULD 3 Glow Grotto: the floor lip at a pit edge or a long ledge (WORLD-3-PLAN §2 lips); 4 Misty Mountain: the slate shelf (grey stone, no glow); 6 Deep Mangrove: a mossy stone ledge',
                   no_fit=STONEFIT, engine_slot='new slot: World 3 floor lip (a pit edge / long ledge: 400 units, the top face the walk line)',
                   float_class='grounded (a floor edge: from the floor up)',
                   notes=f'Take {n} (the lead picked it 11-20). {"Rounded ends." if n.startswith("lipA") else "Broken ends: the pit side reads as a snapped edge."} The skirt under the top is rock: lay the piece from the floor up or at a pit edge, never floating (rocks never float).'))
new.append(row('shelfS-s37', 'small grotto shelf: a thick grey-green slab seen a little from above, a fern tuft and moss on top, a tapering rock underside',
               worlds='USED none | COULD 3 Glow Grotto: the small step shelf (120 units, WORLD-3-PLAN §2); 4 Misty Mountain: a slate step; 6 Deep Mangrove: a mossy stone step',
               no_fit=STONEFIT, engine_slot='new slot: World 3 small shelf (120 units; the top face the walk line)',
               notes='Take shelfS-s37: the only take that kept the start\'s thickness (s11/s23 thinned to ~0.17 Pokey). The top face is seen from a little above: the walk line (walk_y 48) is the middle of the top face, between its back edge (y 34) and its front edge (about y 63).'))
for n, t, w_ in (('rimShort-s11', 'short', 130), ('rimLong-s11', 'long', 220), ('rimS-s11', 'small', 120), ('rimS-s23', 'small (longer take)', 120)):
    new.append(row(n, f'lit-rim grotto shelf ({t}): the World 3 shelf with a glowing teal rim along its top edge, a fern tuft at its back end',
                   worlds='USED none | COULD 3 Glow Grotto: the lit shelf that marks a safe step in the dark (WORLD-3-PLAN §2 lit rims); 8 Blue Night: a glow-stone ledge in the night canopy',
                   no_fit=GLOWFIT, engine_slot=f'new slot: World 3 lit shelf ({t}; about {w_} units; the top face the walk line, the glow drawn over the edge)',
                   notes=f'Take {n} (the lead picked it 11-20). The glow is cut as see-through teal light (cut.py glow: no grey halo on dark). On a light backdrop the glow is faint by design: World 3 is dark.'))
new.append(row('mat-s23', 'soft fungus mat: a low purple ringed cushion with a glowing teal skirt, moss at its rim',
               worlds='USED none | COULD 3 Glow Grotto: the soft fungus mat (WORLD-3-PLAN §2: a soft landing / bounce pad); 5 Orchid Sanctuary: a purple flower cushion; 8 Blue Night: a glow cushion',
               no_fit=GLOWFIT, engine_slot='new slot: World 3 fungus mat (about 130 units; its domed top the walk line, centre highest)',
               flat='n', float_class='grounded',
               notes='Take mat-s23 (the lead picked it 11-20: the look is a purple ringed cushion). Domed: the walk line is the centre top; the ends fall about 8 world px. The glowing skirt is see-through (cut.py glow).'))
for n in ('sleepy-s23', 'sleepy-s37'):
    new.append(row(n, 'sleepy-mushroom shelf: a 200-unit grotto slab, a clump of glowing teal mushrooms with drooping caps and closed eyes at its back end',
                   worlds='USED none | COULD 3 Glow Grotto: the sleepy-mushroom shelf (WORLD-3-PLAN §2: the caps that nod off); 8 Blue Night: a night glade shelf',
                   no_fit=GLOWFIT, engine_slot='new slot: World 3 sleepy shelf (200 units; the slab top right of the clump the walk line)',
                   notes=f'Take {n} (the lead picked it 11-20). The clump stands on the slab\'s left 30%: the walk line runs right of it (walk_x0). The caps\' glow is see-through (cut.py glow).'))
REEDS = [f[:-4] for f in sorted(os.listdir(C)) if f.startswith('reedsR-')]
for n in REEDS:
    new.append(row(n, 'river reeds (the redo): two clumps of reeds and bulrushes, green above a wavy flood line, soaked dark wet brown with silt below it',
                   world_best=2, layer='decor near', float_class='grounded', flat='',
                   worlds='USED none | COULD 2 Sunlit Riverbank: the flood-line reeds at the water\'s edge (the river rose and fell); 6 Deep Mangrove: swamp reeds',
                   no_fit='1 the home forest has no river bank; 3 dark grotto; 4 slate and mist; 7 sand-stone ruins; 8 blue night; 9 lava and ash; 10 stone-and-iron fortress',
                   engine_slot='new slot: World 2 river-edge reeds (decor at the bank, the flood line about level with the river\'s high mark)',
                   footing='none (decor)', notes=f'Take {n} (the lead picks; the start was fixed so no clump touches the frame).'))
last = max(i for i, r in enumerate(rows) if r[0].startswith('w3-new#'))
rows = rows[:last + 1] + new + rows[last + 1:]
b = io.StringIO(); csv.writer(b, lineterminator='\r\n' if '\r\n' in raw[:2000] else '\n').writerows(rows)
open(P, 'w', newline='').write(b.getvalue())
print('rows written', len(new))
