"""ART-MATT: catalog rows for the pieces cut from Matt's 11-14 sheets (reference/art/catalog-rows-hfmatt.csv), merged into
CATALOG-MASTER.csv (its own earlier hfmatt/ rows replaced), then `python3 tools/art/catalog_master.py --emit` writes the engine copy
(R-165.104). Pattern: hf678/rows.py.

    python3 -I tools/art/hfmatt/rows.py

Sizes from the shipped files (src/assets/w1-matt/, 3 px a game unit); on_screen_px 'W x H (units)' is what catalog_master.py's scale
check (R-165.107) reads against Pokey's drawn 89.1 units (heroSprite.ts:30,32; D41). One slot a family, never a 1-piece slot.
Nothing is placed: status says so.
"""
import csv, runpy
from pathlib import Path
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
R13 = runpy.run_path(str(GAME / 'tools/art/hf1113/rows.py'))
COLS, walk, W1, NOFIT_WOOD = R13['COLS'], R13['walk'], R13['W1'], R13['NOFIT_WOOD']
PX = 3.0
SRC = "Matt's sheet 2026-11-14 ({}), upscaled 4x (Real-ESRGAN anime6b, CPU) and cut by tools/art/hfmatt/cut.py"
PIT = 'new slot: painted pit pieces (1-1: floor, left and right lips, the boulder that sits beside a pit; R-165.226)'
TIE = 'new slot: fig gate tie (1-4 sealed bough: the vine tie taut / straining / snapped, and the leaf lid; R-165.212)'
POD = 'new slot: falling seed pod and its warning (1-4: pod hanging, falling; dust puff and bark chips before a drop; R-165.227)'
COULD_EARTH = '3 Mossy Grotto: mossy earth and stone; 6 Deep Mangrove: a mud pit (a grey-wet tint)'
COULD_VINE = '6 Deep Mangrove: a vine tie on a root; 8 Twilight Treetops: a vine on a bough'
TIE_NOTE = ('the three states share ONE canvas: anchor px (78, 277) = the knot centre on the bough centre line (cut.py sizes.json), '
            'sized for a 22 u bough (vineFieldArt.ts drawGate thick 16-26, default 22); the coils wrap the game bough (the sawn log is cut away: W1 has no made things)')
# name: (kind, layer, slot, footing, float_class, worlds, notes, sheet)
META = {
    'w1m-pit-floor': ('pit floor: soft dark mud and fallen leaves, rounded mossy ends both sides, dead-flat top', 'platform', PIT,
                      'walk top measured', 'grounded (lies in the pit bottom)', f'{W1} | COULD {COULD_EARTH}',
                      'replaces the hard-edged moss box Matt saw (R-165.226); its mossy ends tuck under the lips', 'sheet3-pits'),
    'w1m-pit-boulder': ('mossy boulder with orange mushrooms, wide flat bottom', 'decor near', PIT, 'none (not stood on)',
                        'grounded (its whole flat bottom on the floor: never over a lip, R-165.226)', f'{W1} | COULD {COULD_EARTH}',
                        'beside a pit, on solid ground: its footprint never past a lip', 'sheet3-pits'),
    'w1m-pit-lip-l': ('left pit lip: mossy earth with roots, its right side a clean vertical cut into the pit', 'platform', PIT,
                      'walk top measured', 'grounded (the bank)', f'{W1} | COULD {COULD_EARTH}',
                      'its LEFT edge is the sheet edge (straight): it joins the bank, so the bank must cover it; the cut face is the pit wall', 'sheet3-pits'),
    'w1m-pit-lip-r': ('right pit lip: mossy earth with roots, its left side a clean vertical cut into the pit', 'platform', PIT,
                      'walk top measured', 'grounded (the bank)', f'{W1} | COULD {COULD_EARTH}',
                      'its RIGHT edge is the sheet edge (straight): it joins the bank, so the bank must cover it', 'sheet3-pits'),
    'w1m-tie-taut': ('vine tie, at rest: a twisted green vine loop knotted round a bough', 'decor near', TIE, 'none (on a bough)',
                     'on a bough (its knot wraps it)', f'{W1} | COULD {COULD_VINE}', TIE_NOTE, 'sheet1-vine-tie-leaf-lid'),
    'w1m-tie-strain': ('vine tie, straining: the same loop pulled thin and pale, fibres fraying', 'decor near', TIE, 'none (on a bough)',
                       'on a bough (its knot wraps it)', f'{W1} | COULD {COULD_VINE}', TIE_NOTE, 'sheet1-vine-tie-leaf-lid'),
    'w1m-tie-snap': ('vine tie, snapped: two frayed ends curling apart, loose fibres', 'decor near', TIE, 'none (on a bough)',
                     'on a bough (its knot wraps it)', f'{W1} | COULD {COULD_VINE}', TIE_NOTE, 'sheet1-vine-tie-leaf-lid'),
    'w1m-leaf-lid': ('leaf lid: big jungle leaves hanging from a green pole along a bough (stretch along the bough)', 'decor near', TIE,
                     'none (hangs from a bough)', 'hangs from a bough (its pole on the bough)', f'{W1} | COULD {COULD_VINE}',
                     'stretch to the bough length (about 0.8-1.25x keeps the leaves round), or two side by side; the log stubs under it are cut away',
                     'sheet1-vine-tie-leaf-lid'),
    'w1m-pod-hang': ('seed pod, hanging: a ridged tan-brown pod with a husk, darker stripes, bold outline, a short green stem', 'danger look', POD,
                     'none (hangs)', 'hangs from a bough by its stem', f'{W1} | COULD {COULD_VINE}',
                     "Matt's pod repainted (Hugging Face img2img s68 seed 11, style LoRA): his shape, the game's line; drawPod POD_H is 0.45 Pokey",
                     'pod-hang-s68-11'),
    'w1m-pod-fall': ('seed pod, falling: the same pod tilted, its stem snapped short', 'danger look', POD, 'none (falls)', 'falls',
                     f'{W1} | COULD {COULD_VINE}', 'pairs with w1m-pod-hang (same seed and strength)', 'pod-fall-s68-11'),
    'w1m-dust-puff': ('dust puff: soft light-brown dust and grit drifting down (soft alpha)', 'danger look', POD, 'none (falls)',
                      'drifts down from the bough a pod will leave', f'{W1} | COULD {COULD_VINE}',
                      'the warning before a drop (R-165.227); soft: alpha unmixed from white, reads on dark green, faint on light', 'sheet2-pods-dust'),
    'w1m-bark-chips': ('falling bark chips and dried leaf bits (a cluster of 7)', 'danger look', POD, 'none (falls)',
                       'falls from the bough a pod will leave', f'{W1} | COULD {COULD_VINE}',
                       'the warning before a drop; each chip also ships alone (w1m-bark-chips-1..7) for a particle burst', 'sheet2-pods-dust'),
}


def main():
    rows = []
    d = GAME / 'src/assets/w1-matt'
    chips = sorted(p.stem for p in d.glob('w1m-bark-chips-*.webp'))
    for c in chips:
        META[c] = ('one bark chip or leaf bit (a particle)', 'danger look', POD, 'none (falls)', 'falls', f'{W1} | COULD {COULD_VINE}',
                   'a piece of w1m-bark-chips', 'sheet2-pods-dust')
    for name, (kind, layer, slot, foot, fl, worlds, notes, sheet) in META.items():
        f = d / f'{name}.webp'
        w, h = Image.open(f).size
        kb = round(f.stat().st_size / 1024, 1)
        r = {c: '' for c in COLS}
        stretch = ' (stretch along the bough)' if 'stretch' in kind else ''
        src = SRC.format(sheet) if sheet.startswith('sheet') else f'ART-MATT Hugging Face img2img 2026-11-14 (take {sheet}), upscaled 4x (anime6b, CPU), cut by tools/art/hfmatt/cut.py'
        r.update(id=f'hfmatt/{name}', source=src, file=f'src/assets/w1-matt/{name}.webp', kind=kind, w=w, h=h, layer=layer,
                 engine_slot=slot, footing=foot, float_class=fl, world_best=1, worlds=worlds, no_fit=NOFIT_WOOD, made_thing='n',
                 on_screen_px=f'{w / PX:.0f}x{h / PX:.0f} (units){stretch}', ship_px=f'{w}x{h}', file_kb=kb, file_kb_ship=kb,
                 draw_cost='one drawImage of a whole file', used_in='1-1 pits (R-165.226) / 1-4 gate and pods (R-165.212, R-165.227)',
                 status='cut, not placed (ART-MATT): an Engine/level packet wires it', notes=notes, part='HMATT')
        if foot == 'walk top measured':
            wl = walk(f)
            if wl:
                r['walk_y'], r['walk_x0'], r['walk_x1'] = wl
                r['footing'] = f'walk line y={wl[0]} x {wl[1]}-{wl[2]} (shipped px)'
        rows.append(r)
    runpy.run_path(str(GAME / 'tools/art/catalog_master.py'))['add_scale'](rows)
    out = GAME / 'reference/art/catalog-rows-hfmatt.csv'
    with open(out, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS); wr.writeheader(); wr.writerows(rows)
    master = GAME / 'reference/art/CATALOG-MASTER.csv'
    old = [x for x in csv.DictReader(open(master)) if not x['id'].startswith('hfmatt/')]
    with open(master, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS); wr.writeheader(); wr.writerows(old + rows)
    print(len(rows), 'rows ->', out.name, '+ CATALOG-MASTER.csv')


if __name__ == '__main__':
    main()
