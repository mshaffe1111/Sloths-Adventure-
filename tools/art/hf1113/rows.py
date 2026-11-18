"""ART 11-13: catalog rows for every piece this task ships (reference/art/catalog-rows-hf1113.csv), appended to CATALOG-MASTER.csv
(replacing its own earlier rows) and emitted to src/game/art/inventory/ by `python3 tools/art/catalog_master.py --emit`.

    python3 -I tools/art/hf1113/rows.py

Sizes from the shipped files; game units from propspicks.json (the height a set piece is drawn at; a pickup's long side); walk lines for
the standable pieces measured from the cut (the first row whose longest solid run is >= 50% of the width, narrowed 6% each end, as
w1keepers/footing.py), in the shipped file's px. Scale vs Pokey = drawn height / 89.1 (D41).
"""
import csv, json, sys
from pathlib import Path
import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
H = Path(__file__).resolve().parent
COLS = ['id', 'source', 'file', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'float_class', 'world_best', 'worlds', 'no_fit',
        'made_thing', 'engine_slot', 'footing', 'layer', 'on_screen_px', 'ship_px', 'file_kb', 'file_kb_ship', 'draw_cost', 'used_in',
        'status', 'notes', 'part', 'pokey_scale', 'scale_ok', 'scale_basis']
POKEY = 89.1
W1 = '1 Emerald Canopy: living green wood, moss and earth'
NOFIT_WOOD = ('7 Ancient Ruins: carved stone; 9 Volcanic Jungle: charred rock; 10 Stormy Highlands Fortress: stone and iron; '
              '4 Mist Cascades: bare wet cliff rock')
# name: (kind, layer, engine_slot, footing, float_class, worlds, no_fit, used_in, notes)
META = {
    'w15-rottentrunk': ('fallen rotten trunk, hollow end (1-1\'s hollow log grown)', 'platform',
                        'new slot: 1-5 set piece fallen trunk (walk top; he enters the hollow end; rotten in spans, 1-5.md:13,19)',
                        'walk top measured', 'grounded (lies on the floor)', f'{W1} | COULD 3 Mossy Grotto: a mossy log; 6 Deep Mangrove: a sunk log; 8 Twilight Treetops: a fallen bough',
                        NOFIT_WOOD, '1-5 beats 1, 8', 'its hollow end is taller than Pokey (he walks in)'),
    'w15-roottunnel': ('root tunnel mouth over a flat earth floor', 'platform',
                       'new slot: 1-5 set piece root tunnel (the under road; floor walkable, dark inside; 1-5.md:15,18)',
                       'floor measured', 'grounded (its floor is the ground line)', f'{W1} | COULD 3 Mossy Grotto: a root cave mouth; 6 Deep Mangrove: mangrove roots',
                       NOFIT_WOOD, '1-5 beats 4, 7', 'opening about 1.3 Pokeys tall; enclosed dark filled solid (cutprops fill)'),
    'w15-leafcurtain': ('leaf curtain hanging from a mossy branch', 'decor near', 'new slot: 1-5 the big sign\'s leaf curtain (1-5.md:17)',
                        'none (not stood on)', 'hangs from a bough above', f'{W1} | COULD 5 Orchid Sanctuary: a garden screen; 8 Twilight Treetops',
                        NOFIT_WOOD, '1-5 beat 6', ''),
    'w15-leafsign-up': ('squirrels\' leaf-sign, berry-juice arrow up and over', 'decor near', 'new slot: 1-5 leaf-sign THAT WAY (over) (1-5.md:13,17)',
                        'none (not stood on)', 'grounded (its moss tuft on the floor)', W1, NOFIT_WOOD, '1-5 beats 1, 6', 'a living leaf, berry juice'),
    'w15-leafsign-right': ('squirrels\' leaf-sign, berry-juice arrow right', 'decor near', 'new slot: 1-5 leaf-sign THIS WAY (along) (1-5.md:13,17)',
                           'none (not stood on)', 'grounded (its moss tuft on the floor)', W1, NOFIT_WOOD, '1-5 beats 1, 6', 'mirror it for left'),
    'w15-leafsign-down': ('squirrels\' leaf-sign, berry-juice arrow down and under', 'decor near', 'new slot: 1-5 leaf-sign THIS WAY (under) (1-5.md:13,17)',
                          'none (not stood on)', 'grounded (its moss tuft on the floor)', W1, NOFIT_WOOD, '1-5 beats 1, 6', ''),
    'w15-mark-right': ('Meeca\'s mark: M and arrow cut in living bark (patch)', 'decor near', 'new slot: 1-5 her mark on a trunk (the goal; 1-5.md:12,47)',
                       'none (on a trunk)', 'on a living trunk at marching height', W1, NOFIT_WOOD, '1-5 every mark', 'soft oval bark patch; mirror for left'),
    'w15-mark-up': ('Meeca\'s mark: M and up-arrow cut in living bark (patch)', 'decor near', 'new slot: 1-5 her mark pointing up (the finale, 1-5.md:19)',
                    'none (on a trunk)', 'on a living trunk at marching height', W1, NOFIT_WOOD, '1-5 beat 8', 'fresh pale cuts (beat 9)'),
    'w14-roughbough': ('rotting bough: bracket fungus, notched sagging underside', 'platform',
                       'new slot: 1-4/1-5 rotting (creaky) bough: gives way at 1.1 s (1-4.md:30, 1-5.md:14)', 'walk top measured',
                       'may float (a bough out from the kapok)', f'{W1} | COULD 8 Twilight Treetops: a rotten bough; 3 Mossy Grotto',
                       NOFIT_WOOD, '1-4 beat 2; 1-5 beats 2, 7, 8', 'the danger reads by its rot and fungus'),
    'w14-figcluster': ('cluster of small orange-red wild figs', 'decor near', 'new slot: 1-4 vine cluster (stage.clusters, t-lattice vineField.ts)',
                       'none (rides a vine)', 'on a field vine', f'{W1} | COULD 3 Mossy Grotto; 8 Twilight Treetops', NOFIT_WOOD, '1-4 beats 3+', 'the story keeper 11-13: wild figs, never purple'),
    'w14-passiontangle': ('passion-vine tangle with fruit and flower', 'decor near', 'new slot: 1-4 vine cluster (alt look)', 'none (rides a vine)',
                          'on a field vine', f'{W1} | COULD 5 Orchid Sanctuary', NOFIT_WOOD, '1-4 beats 3+', ''),
    'w14-kapokpod': ('closed kapok seed pod on its twig', 'danger look', 'new slot: 1-4 falling pod (1-4.md:23 beat 4)', 'none (falls)',
                     'hangs from a kapok bough', W1, NOFIT_WOOD, '1-4 beat 4+', 'creaks, drops, bursts'),
    'w14-kapokpod-burst': ('kapok pod burst open, silk spilling', 'decor near', 'new slot: 1-4 burst pod (after it lands; heap at the foot, beat 0)',
                           'none (not stood on)', 'grounded', W1, NOFIT_WOOD, '1-4 beats 0, 4', ''),
}
FRUIT_W = {'banana': '1,2,4,7', 'mango': '1,2,5', 'papaya': '1,2', 'passionfruit': '1,5', 'wildfig': '1,3,8', 'cacao': '1,3,7',
           'pineapple': '2,9', 'coconut': '2,6', 'dragonfruit': '5,9'}
WN = {1: 'Emerald Canopy', 2: 'Sunlit Riverbank', 3: 'Mossy Grotto', 4: 'Mist Cascades', 5: 'Orchid Sanctuary', 6: 'Deep Mangrove',
      7: 'Ancient Ruins', 8: 'Twilight Treetops', 9: 'Volcanic Jungle', 10: 'Stormy Highlands Fortress'}


def walk(path):
    a = np.asarray(Image.open(path).convert('RGBA'))[..., 3] > 128
    Hh, W = a.shape
    for y in range(Hh):
        row = a[y]
        best, run, s0, bs = 0, 0, 0, 0
        for x in range(W):
            if row[x]:
                if run == 0: s0 = x
                run += 1
                if run > best: best, bs = run, s0
            else:
                run = 0
        if best >= 0.5 * W:
            cut = round(best * 0.06)
            return y, bs + cut, bs + best - cut
    return None


def floor(path):
    """a tunnel on a raised earth slab: down the middle third, the floor's top runs from the bottom of the dark mouth (y1: the first
    lit row after the dark) to the slab's front face (y2: the last bright row before it darkens); the stand line is midway, so his feet
    sit on the floor with its front lip showing below, spanning the opaque slab at that row"""
    im = np.asarray(Image.open(path).convert('RGBA')).astype(np.float32)
    Hh, W = im.shape[:2]
    lum = im[..., :3] @ np.array([0.3, 0.59, 0.11])
    mids = []
    for x in range(int(W * 0.4), int(W * 0.6), 4):
        col, a = lum[:, x], im[:, x, 3] > 128
        dark = np.where((col < 35) & a)[0]
        if not len(dark):
            continue
        y1 = int(dark[dark < Hh * 0.9].max()) + 1
        lit = np.where((col[y1:] > 90) & a[y1:])[0]
        if len(lit):
            mids.append((y1 + y1 + int(lit.max())) // 2)
    y = int(np.median(mids))
    run = np.where(im[y, :, 3] > 128)[0]
    return y, int(run.min()), int(run.max())

def main():
    picks = json.loads((H / 'propspicks.json').read_text())
    rows = []
    for name, p in picks.items():
        dest = p['dest']
        f = GAME / 'src/assets' / dest / f'{name}.webp'
        if not f.exists():
            print('SKIP (not shipped yet)', name); continue
        im = Image.open(f); w, h = im.size
        kb = round(f.stat().st_size / 1024, 1)
        r = {c: '' for c in COLS}
        r.update(id=f'hf1113/{name}', source=f"ART Hugging Face 2026-11-13 (take {p['take']})", file=f'src/assets/{dest}/{name}.webp',
                 w=w, h=h, made_thing='n', file_kb=kb, file_kb_ship=kb, ship_px=f'{w}x{h}', part='H13',
                 draw_cost='one drawImage of a whole file', status='cut, not placed (ART 11-13): B14/B15 place it')
        u = p['units']
        if dest == 'pickups':
            k = u / max(w, h)
            r.update(kind=('golden guarana (1-5 hidden find)' if 'guarana' in name else 'folded petal (1-5)' if 'petal' in name
                           else f"fruit pickup: {name[6:]}"),
                     layer='pickup', engine_slot=f"pickupSprites.ts drawPickup('{name}')", footing='none (picked up)',
                     float_class='floats (a pickup)', on_screen_px=f'{round(w * k)}x{round(h * k)} (units, long side {u})',
                     used_in='1-5' if ('guarana' in name or 'petal' in name) else 'fruit pickups (the lead 11-13)')
            if name.startswith('fruit-'):
                ws = [int(x) for x in FRUIT_W[name[6:]].split(',')]
                r['world_best'] = ws[0]
                r['worlds'] = '; '.join(f'{n} {WN[n]}: where it really grows (the story keeper 11-13)' for n in ws)
                r['no_fit'] = '; '.join(f'{n} {WN[n]}' for n in WN if n not in ws)
            else:
                r['world_best'] = 1; r['worlds'] = W1; r['no_fit'] = NOFIT_WOOD
            r['notes'] = 'whole, never bitten; the halo is code-drawn like the other finds' if 'guarana' in name else ''
        else:
            kind, layer, slot, foot, fl, worlds, nofit, used, notes = META[name]
            k = u / h
            r.update(kind=kind, layer=layer, engine_slot=slot, float_class=fl, worlds=worlds, no_fit=nofit, used_in=used, notes=notes,
                     world_best=1, on_screen_px=f'{round(w * k)}x{u} (units)')
            r['pokey_scale'] = f'{u / POKEY:.2f}'
            r['scale_basis'] = f'drawn {u} units tall (propspicks.json)'
            if foot.endswith('measured'):
                wl = floor(f) if foot.startswith('floor') else walk(f)
                if wl:
                    r['walk_y'], r['walk_x0'], r['walk_x1'] = wl
                    r['footing'] = f'walk line y={wl[0]} x {wl[1]}-{wl[2]} (shipped px; ' + ('midway on the floor between the dark mouth and the slab face, middle third' if foot.startswith('floor') else 'first row with a 50% solid run, 6% in') + ')'
            else:
                r['footing'] = foot
        rows.append(r)
    # Pokey's two-hand climb
    cj = json.loads((GAME / 'src/assets/hero/hero-climb2.json').read_text())
    f = GAME / 'src/assets/hero/hero-climb2.webp'
    w, h = Image.open(f).size
    r = {c: '' for c in COLS}
    r.update(id='hero-climb2', source='ART Hugging Face 2026-11-13 (Qwen-Image-Edit-2511 + Pokey model; the lead\'s picks)',
             file='src/assets/hero/hero-climb2.webp', kind='Pokey two-hand vine climb: 4-frame cycle + rest (hero-climb2.json)', w=w, h=h,
             layer='character', engine_slot='new slot: the two-hand climb (R-165.178; vineField two hands, 1.6x)', footing='grips per frame (json)',
             made_thing='n', world_best=1, worlds='every world (Pokey)', ship_px=f'{w}x{h}', file_kb=round(f.stat().st_size / 1024, 1),
             part='H13', status='packed, not wired (engine)', notes=f"stand_px {cj['stand_px']} = 89.1 u; vine gap 269 px = 80 u",
             draw_cost='one drawImage of an atlas frame', used_in='1-4 vine field')
    r['file_kb_ship'] = r['file_kb']
    rows.append(r)
    # 1-5's dusk set (a far-only set: the sky and far repainted, World 1's own middle and near graded)
    for part, how in (('sky', 'img2img s0.42 from World 1\'s sky graded to dusk; rows matched to the far\'s top (the 5% overlap)'),
                      ('far', 'img2img s0.42 from World 1\'s far graded to dusk; wrap join 0.6 = its own column-to-column 0.6'),
                      ('mid', 'World 1\'s own middle strip, colour-graded to dusk (painting untouched)'),
                      ('near', 'World 1\'s own near strip, colour-graded to dusk (painting untouched)')):
        f = GAME / f'src/assets/backdrops/w1dusk-{part}.webp'
        if not f.exists():
            continue
        w, h = Image.open(f).size
        r = {c: '' for c in COLS}
        r.update(id=f'backdrops/w1dusk-{part}', source='ART Hugging Face 2026-11-13 (1-5 dusk)', file=f'src/assets/backdrops/w1dusk-{part}.webp',
                 kind=f'backdrop {part} strip: World 1 at dusk', w=w, h=h, layer='backdrop', world_best=1, worlds=W1 + ' (1-5 at dusk)',
                 no_fit=NOFIT_WOOD, made_thing='n', engine_slot='stageBackdrops.ts FAR_BY_STAGE set \'w1dusk\' (to wire: 1-5)',
                 footing='none (backdrop)', ship_px=f'{w}x{h}', file_kb=round(f.stat().st_size / 1024, 1), part='H13',
                 status='made, not wired (1-5.md:5 "dusk: limbs in last light, roots in shadow")', notes=how,
                 draw_cost='one strip (drawStrip)', used_in='1-5')
        r['file_kb_ship'] = r['file_kb']
        rows.append(r)
    # the creek hurt floor and the two creatures (attempt 3)
    cm = json.loads((GAME / 'src/assets/props/pitwater/w15-creek.json').read_text())
    f = GAME / 'src/assets/props/pitwater/w15-creek.webp'
    u = cm['units_per_px']
    r = {c: '' for c in COLS}
    r.update(id='hf1113/w15-creek', source='ART Hugging Face 2026-11-13 (take creek-53, join repainted: creek-53-band-s45-9)', file='src/assets/props/pitwater/w15-creek.webp',
             kind='fast shallow creek, side on: white riffles, foam at stones, stony bed (a hurt floor)', w=cm['w'], h=cm['h'],
             layer='danger look', world_best=1,
             worlds=W1 + ' (1-5 at dusk) | COULD 2 Sunlit Riverbank: its river, tinted to its daytime palette (see notes: TINT)',
             no_fit='9 Volcanic Jungle: lava, not water; 10 Stormy Highlands Fortress: stone and iron; 7 Ancient Ruins: carved channels',
             made_thing='n', engine_slot='new slot: 1-5 creek hurt floor (drawn as w1Creek.ts draws its tile: surface on the floor line, tiled, drifting; bed colour below)',
             footing=f"none (hurts): surface row {cm['surface']} px = the floor line; bed {cm['bed']} below the tile",
             float_class='grounded (fills a pit to the floor line)', on_screen_px=f"{round(cm['w'] * u)}x{round(cm['h'] * u)} (units, a tile)",
             ship_px=f"{cm['w']}x{cm['h']}", file_kb=round(f.stat().st_size / 1024, 1), part='H13', draw_cost='one drawImage per tile across the pit',
             used_in='1-5 (the creek)', status='cut, not wired (engine): B15 places it',
             notes=f"TINT: painted in 1-5's dusk (water #8a6fb8 violet with warm orange glints; bed {cm['bed']}): another world (W2's daytime river) reuses it regraded to its own palette (the lead 11-13); "
                   f"tiles sideways (wrap step {cm['wrap']} vs about 1.7 between any two columns); stones stay under the surface (nothing reads as a stepping stone); no lily pads, no petals",
             pokey_scale=f"{cm['h'] * u / POKEY:.2f}", scale_basis=f"3 px a unit (units_per_px {u}); stones about half Pokey's height")
    r['file_kb_ship'] = r['file_kb']
    rows.append(r)
    for nm, kind, used, basis in (
            ('oropendola', 'Montezuma oropendola flyer: 3 flap frames, 4-step cycle (oropendola.json)', '1-4 the daytime flyer (1-4.md:4)',
             'bill to tail 70 units (a 50 cm bird by a 60 cm sloth, drawn 89.1)'),
            ('leafcutter', 'leafcutter ant carrying a leaf bit: walk frames (leafcutter.json)', '1-4 the leafcutter ants (1-4.md:4)',
             'about 20 units tall with its leaf (the lead 11-13: 26 read as a giant ant); larger than life (a real one is about 2 units) so it reads on a phone')):
        f = GAME / f'src/assets/enemies/{nm}.webp'
        if not f.exists():
            continue
        j = json.loads((GAME / f'src/assets/enemies/{nm}.json').read_text())
        w, h = Image.open(f).size
        r = {c: '' for c in COLS}
        r.update(id=f'hf1113/{nm}', source='ART Hugging Face 2026-11-13 (' + ', '.join(Path(t).stem for t in j['source']['takes']) + ')',
                 file=f'src/assets/enemies/{nm}.webp', kind=kind, w=w, h=h, layer='decor near', world_best=1,
                 worlds=W1 + (' | COULD 2 Sunlit Riverbank; 5 Orchid Sanctuary' if nm == 'oropendola' else ' | COULD 3 Mossy Grotto; 6 Deep Mangrove'),
                 no_fit='9 Volcanic Jungle; 10 Stormy Highlands Fortress; 7 Ancient Ruins: none live there', made_thing='n',
                 engine_slot=f'new slot: ambient creature strip ({nm}.json: cells, order, mark ax/ay, fps {j["fps"]})', footing='none (flies)' if nm == 'oropendola' else 'feet on the cell bottom (walks a floor or bough)',
                 float_class='flies' if nm == 'oropendola' else 'grounded (walks)', on_screen_px=f"{j['units_w']}x{j['units_h']} (units, a cell)",
                 ship_px=f'{w}x{h}', file_kb=round(f.stat().st_size / 1024, 1), part='H13', draw_cost='one drawImage of a strip cell',
                 used_in=used, status='packed, not wired (engine)', pokey_scale=f"{j['units_h'] / POKEY:.2f}", scale_basis=basis)
        r['file_kb_ship'] = r['file_kb']
        rows.append(r)
    out = GAME / 'reference/art/catalog-rows-hf1113.csv'
    with open(out, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS); wr.writeheader(); wr.writerows(rows)
    master = GAME / 'reference/art/CATALOG-MASTER.csv'
    mine = {r['id'] for r in rows}  # (every id this writes is replaced, the dusk backdrops' included: they doubled on a rerun)
    old = [x for x in csv.DictReader(open(master)) if not (x['id'].startswith('hf1113/') or x['id'] in mine)]
    with open(master, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS); wr.writeheader(); wr.writerows(old + rows)
    print(len(rows), 'rows ->', out.name, '+ CATALOG-MASTER.csv')


if __name__ == '__main__':
    main()
