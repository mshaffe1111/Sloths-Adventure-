"""ART-W3: write (or rewrite) the ART-W3 cut rows (part W3A: World 3's shaft wall, wall shelves, wide shelves, root curtains, roof root;
2-9's court bell and throne-island far layer) in reference/art/CATALOG-MASTER.csv, modelled on World 3's shelf (w3-new#shelf-short) and
tools/art/hfnext/catalog2.py; then run `python3 tools/art/catalog_master.py --emit`.
    python3 -I tools/art/hfw3/catalog3.py
Reads reference/art/hfw3/cut/picks.json (file, cpu = cut px a world px, walk) and META below. The cuts are not packed or placed:
file = 'origin/t-art-w3:reference/art/hfw3/cut/<n>.png'; tools/art/hfw3/pack.py packs the World 3 ones with BUILD-31's first draw sites.
Sizes against Pokey's DRAWN 89.1 px.
"""
import csv, io, json, os
from PIL import Image
import importlib.util, sys
sys.path.insert(0, 'tools/art')
from catalog_master import SCALE_RANGE, TILED, TERRAIN
P = 'reference/art/CATALOG-MASTER.csv'
C = 'reference/art/hfw3/cut/'
PU = 89.1
picks = json.load(open(C + 'picks.json'))
raw = open(P, newline='').read()
rows = list(csv.reader(io.StringIO(raw)))
h = rows[0]; ix = {k: i for i, k in enumerate(h)}
rows = [r for r in rows if not r[0].startswith('w3-w3a#')]
tl = next(r for r in rows if r[0] == 'w3-new#shelf-short')
SRC = ('ART-W3 2026-11-25 (R-165.449; HF Qwen-Image-Edit-2511 from paste-ups, tools/art/hfw3/starts3.py + starts4.py, spec-w3a/-w3b; '
       'cut tools/art/hfw3/cut3.py)')
STONEFIT = ("1 the home forest's stones are its own (World 1 kit); 2 the river's rocks are warm brown (World 2 kit); 5 flower garden; "
            "7 sand-stone ruins: warm stone; 9 lava and ash world: black rock, red glow; 10 stone-and-iron fortress: dressed stone")
ROOTFIT = ("2 sunlit river: its climbs are reeds and posts; 5 flower garden: flowering vines; 7 sand-stone ruins: temple vines; "
           "9 lava and ash: no living roots; 10 stone-and-iron fortress: chains and ladders")
STATUS = 'cut, not placed (ART-W3): tools/art/hfw3/pack.py packs it with BUILD-31\'s first draw sites'
DRAW = 'one drawImage of an atlas cell (w3-grotto.webp when packed: tools/art/hfw3/pack.py)'
THORNFIT = ("1 the home forest has its own brambles (w1-thorn-row); 2 sunlit river: snappers, not thorns; 5 flower garden: rose briars; "
            "7 sand-stone ruins: spike traps (made); 9 lava and ash: no living thorns; 10 stone-and-iron fortress: iron spikes")
META = {
    'shelfL': dict(kind='wide grotto shelf: a long grey-green stone slab, moss and a fern tuft at its back end, a short rock underside',
                   layer='platform', float_class='may float', engine_slot='new slot: World 3 wide shelf (about 310 units; the top face the walk line)',
                   worlds='USED none | COULD 3 Glow Grotto: the wide shelf down a shaft (3-1 beats 8-9, WORLD-3-PLAN §3 shelf L); 4 Misty Mountain: a slate ledge; 6 Deep Mangrove: a mossy stone ledge',
                   no_fit=STONEFIT, notes='The underside was shortened (tools/art/hfw3/squash.py, rows below the slab x0.45) so the box keeps under the platform cap; the slab is untouched.'),
    'wallR': dict(kind='grotto shaft wall (tile): the rock\'s left face, strata and moss drips, the rock running off top, bottom and right; tiles top to bottom',
                  layer='decor mid', float_class='grounded (a wall: tiled the shaft\'s height)', engine_slot='new slot: World 3 shaft wall (tiled up and down a shaft; the face on its left, mirror it for a left wall)',
                  worlds='USED none | COULD 3 Glow Grotto: the down shaft\'s walls (3-1 beats 3-8; 3-4\'s sinkhole); 4 Misty Mountain: a slate cliff face; 6 Deep Mangrove: a wet rock wall',
                  no_fit=STONEFIT, notes='Made to tile by tools/art/hfw3/walltile.py (a circular cross-fade with both faces lined up first: seam step 1.7 vs the rock\'s own 1.6 a row). Not stood on: shelves sit against it.'),
    'wallShelf': dict(kind='wall shelf: a grotto stone shelf growing out of the shaft wall, its underside bracing into the rock, a fern tuft',
                      layer='platform', float_class='grounded (lay its right end on a shaft wall\'s face)', engine_slot='new slot: World 3 wall shelf (about 165 units; the top face the walk line, its right end in the wall; mirror for a left wall)',
                      worlds='USED none | COULD 3 Glow Grotto: a shelf off the shaft wall (3-1 beats 2 and 8: shelves left and right down a shaft); 4 Misty Mountain: a cliff ledge',
                      no_fit=STONEFIT, notes='The wall stub is trimmed to a short root faded into the wall (tools/art/hfw3/stubtrim.py and the row window): its own rock never matched the wall tile and showed as a box. Lay it with walk_x1 on the wall tile\'s face.'),
    'rootTall': dict(kind='root curtain to climb (tall): three old roots braided into one column hanging from a grotto rock lip, knots for hands, tips tapering',
                     layer='climb', float_class='hangs (from a ledge or the roof)', engine_slot='new slot: World 3 climb root (a vine to climb: straight up and down always climbs)',
                     worlds='USED none | COULD 3 Glow Grotto: the root curtain to climb down (3-1 beat 5, 3-2 beat 4, 3-4\'s sinkhole); 6 Deep Mangrove: mangrove roots; 4 Misty Mountain: cliff roots; 1 home forest: a root under a bank',
                     no_fit=ROOTFIT, notes='The take\'s own rock slab is trimmed off (ART-W3-b: under a shelf it read as a second, standable ledge): the braid tucks up under a shelf\'s underside or the roof.'),
    'rootShort': dict(kind='root curtain to climb (short): three old roots braided into one column hanging from a grotto rock lip, knots for hands, tips tapering',
                      layer='climb', float_class='hangs (from a ledge or the roof)', engine_slot='new slot: World 3 climb root (a vine to climb: straight up and down always climbs)',
                      worlds='USED none | COULD 3 Glow Grotto: a short root climb (3-1 Easy\'s walk back up, 3-2 beat 4); 6 Deep Mangrove: mangrove roots; 4 Misty Mountain: cliff roots',
                      no_fit=ROOTFIT, notes='The take\'s own rock slab is trimmed off (ART-W3-b): the braid tucks up under a shelf\'s underside.'),
    'roofRoot': dict(kind='roof root (tile): one thick knobbly root running sideways under a cave roof, rootlets hanging, moss on top; tiles left to right',
                     layer='climb', float_class='hangs (under the roof)', engine_slot='new slot: World 3 roof root (a rope to hang and creep under: drawn along the rope\'s sag, rope.ts)',
                     worlds='USED none | COULD 3 Glow Grotto: the roots under the roof (3-2 beats 1, 3, 9, 10; 3-5, 3-7, 3-9); 6 Deep Mangrove: a root over black water',
                     no_fit=ROOTFIT, notes='LAY RULE (the lead 11-25): a roof root runs as this tile alone and ends INTO a wall or off-screen, never in the open (the end piece roofEnd-s23 was judged rough and is not catalogued: two roots at the join, a pale knob like an egg).'),
    'roofEnd': dict(kind='roof root end: the thick root growing out of a knob of grotto rock at the cave roof, rootlets gripping the stone',
                    layer='climb', float_class='hangs (from the roof)', engine_slot='new slot: World 3 roof root end (the rope\'s end in the rock; mirror for the other end)',
                    worlds='USED none | COULD 3 Glow Grotto: a roof root\'s end (3-2, 3-5, 3-7, 3-9); 6 Deep Mangrove: a root into a bank',
                    no_fit=ROOTFIT, notes=''),
    'thornBed': dict(kind='grotto thorn bed (long): pale-bone thorns, cold-blue shading, a red-orange danger rim at the tips, on a low dark rock mound with moss',
                     layer='danger look', float_class='grounded', engine_slot='new slot: World 3 thorns (proto.thorns: hurts; the hurt box is the engine\'s, the art 72 units tall over it)',
                     worlds='USED none | COULD 3 Glow Grotto: the thorn bed under a dark shelf (3-1 beat 8), any grotto pit; 6 Deep Mangrove: bone-thorn shoals; 8 blue night: pale thorns read in the dark',
                     no_fit=THORNFIT, notes='Made for the dark (the lead 11-25: the World 1 brambles read too small, brown and low-contrast in the grotto); judged in the DARK still (thornBed-*.jpg). Cut at 4.5 cut px a unit (0.8 Pokey tall).'),
    'thornClump': dict(kind='grotto thorn clump (short): a tight cluster of pale-bone thorns with red-orange danger tips on a dark rock base',
                       layer='danger look', float_class='grounded', engine_slot='new slot: World 3 thorns (proto.thorns: hurts; a short patch)',
                       worlds='USED none | COULD 3 Glow Grotto: a short thorn patch on a shelf or floor; 6 Deep Mangrove; 8 blue night',
                       no_fit=THORNFIT, notes='Judged in the DARK still (thornClump-s23.jpg). Cut at 4.5 cut px a unit.'),
    'bellSwing': dict(kind='court bell, SWUNG frame: the same arch, the bronze bell swung out to the left on its rope (the second frame of bell-s23)',
                      layer='decor near', float_class='grounded', world_best=2, engine_slot='new slot: World 2 court bell, frame 2 (swap with w3-w3a#bell-s23: the same 633x662 box, the arch within 3-5 levels)',
                      worlds='USED none | COULD 2 Sunlit Riverbank: the court bell rung (2-9); 7 Sand-stone Ruins: a temple bell',
                      no_fit='as w3-w3a#bell-s23', notes='Edited from bell-s23; cut to the still\'s box so the frames swap without a jump.'),
    'bell': dict(kind='court bell: a bronze bell hung on a carved wooden arch, crocodile-head beam ends, teal lashings, gold studs (96 px tall, 1.08 Pokey: the lead 11-25, the signature beat\'s landmark; 2-9.md\'s 70 read small upright)',
                 layer='decor near', float_class='grounded', world_best=2, engine_slot='new slot: World 2 court bell (2-9 beat 11: over the shrine steps\' landing; two frames, still and swung)',
                 worlds='USED none | COULD 2 Sunlit Riverbank: the River King\'s court bell (2-9, DESIGN-29 art 2); 7 Sand-stone Ruins: a temple bell',
                 no_fit='1 nothing made in the home forest; 3 dark grotto; 4 slate and mist; 5 flower garden; 6 mangrove; 8 blue night; 9 lava; 10 iron fortress (iron, not bronze and wood)',
                 notes=''),
    'courtFar': dict(kind='throne island far layer: World 2\'s dusk village far layer with a root throne on an island across the lake, a log drum, a crocodile tail, lanterns',
                     layer='backdrop', float_class='backdrop', world_best=2, engine_slot='new slot: World 2 far layer (2-9 the River King\'s Court; w2evening-far\'s size, tiles as it does)',
                     worlds='USED none | COULD 2 Sunlit Riverbank: 2-9\'s far layer (DESIGN-29 art 3)',
                     no_fit='every other world: the River King\'s court is World 2\'s', notes=''),
}


def row(n, p):
    base_name = n.split('-')[0]
    m = dict(META[base_name])
    r = list(tl); im = Image.open(C + p['file']); cpu = p['cpu']; W, H = im.width / cpu, im.height / cpu
    wy, x0, x1 = p['walk'] if p.get('walk') else ('', '', '')
    d = dict(id=f'w3-w3a#{n}', source=SRC, file=f'origin/t-art-w3:{C}{p["file"]}', w=im.width, h=im.height, walk_y=wy, walk_x0=x0,
             walk_x1=x1, flat='y' if wy != '' else '', world_best=3, made_thing='n', ship_px=im.height,
             file_kb=f'{os.path.getsize(C + p["file"]) / 1024:.1f}', file_kb_ship='', draw_cost=DRAW, used_in='none (not placed)',
             status=STATUS, part='W3A', on_screen_px=f'{W:.0f}x{H:.0f} (world px: {cpu:g} cut px a unit)',
             pokey_scale=f'{H / PU:.2f}', scale_ok='', scale_basis='drawn',
             footing=(f'the top face: walk line y {wy} from x {x0} to {x1} (cut px; {wy / cpu:.0f} world px under the top of the box)'
                      if wy != '' else 'none (not stood on)'))
    if base_name == 'roofRoot': d['footing'] = ('none (hung from, not stood on). LAY RULE (the lead 11-25): runs as this tile alone and ends INTO a '
                                             'wall or off-screen, never in the open')
    if base_name in ('bell', 'bellSwing', 'courtFar', 'thornBed', 'thornClump'):
        d['made_thing'] = 'y' if base_name in ('bell', 'bellSwing') else 'n'
        if base_name in ('bell', 'bellSwing'): d['world_best'] = 2
    if base_name == 'courtFar': d.update(pokey_scale='', scale_basis='', on_screen_px=f'{im.width}x{im.height} (a far layer)')
    # the scale verdict by catalog_master.py's own rules (add_scale: SCALE_RANGE, TILED, TERRAIN), as catalog2.py writes it
    rng = SCALE_RANGE.get(m['layer']); ps = d.get('pokey_scale')
    if rng and ps:
        txt = ' '.join((m.get('engine_slot', ''), m.get('kind', ''), f'w3-w3a#{n}'))
        if TILED.search(' '.join((d['on_screen_px'], m.get('engine_slot', '')))): d['scale_basis'] = 'drawn (tiled: no verdict)'
        elif m['layer'] in ('platform', 'soft landing', 'step') and TERRAIN.search(txt): d['scale_basis'] = 'drawn (terrain: no cap)'
        else:
            lo, hi = rng; sc = float(ps)
            d['scale_ok'] = 'y' if (lo is None or sc >= lo) and (hi is None or sc <= hi) else 'n'
    m['notes'] = (f'Take {n} (ART-W3 picked it 11-25; the lead judges the stills: reference/qa-reports/ART-W3/stills/). ' + m.get('notes', '')).strip()
    d.update(m)
    for k, val in d.items():
        if k in ix: r[ix[k]] = str(val)
    return r


new = [row(n, p) for n, p in picks.items() if n.split('-')[0] in META]
last = max(i for i, r in enumerate(rows) if r[0].startswith(('w3-next#', 'w3-new#')))
rows = rows[:last + 1] + new + rows[last + 1:]
b = io.StringIO(); csv.writer(b, lineterminator='\r\n' if '\r\n' in raw[:2000] else '\n').writerows(rows)
open(P, 'w', newline='').write(b.getvalue())
print('rows written', len(new))
