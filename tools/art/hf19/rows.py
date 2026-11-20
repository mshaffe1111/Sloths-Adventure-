"""ENG-19a NEW 3: the catalog row for the eagle's roost (reference/art/catalog-rows-hf19.csv), merged into CATALOG-MASTER.csv (its own
earlier hf19/ rows replaced), then `python3 tools/art/catalog_master.py --emit` writes the engine copy (R-165.104). Pattern: hf678/rows.py.

    python3 -I tools/art/hf19/rows.py

Size from the shipped file (src/assets/w1-19/, 3 px a game unit, so drawn units = px / 3, hf1113/cutprops.py); on_screen_px 'W x H (units)'
is what catalog_master.py's scale check (R-165.107) reads: drawn height / Pokey's drawn 89.1 units (heroSprite.ts:30,32; D41). Not placed:
the lure post is laid by World 1's kit (w1.ts W1_LURE, kept in proto.gen2.roosts), and its draw is the 1-9 builder's (status says so).
"""
import csv, runpy
from pathlib import Path
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
R13 = runpy.run_path(str(GAME / 'tools/art/hf1113/rows.py'))
COLS, W1, NOFIT_WOOD = R13['COLS'], R13['W1'], R13['NOFIT_WOOD']
PX = 3.0
# name: (kind, layer, engine_slot, footing, float_class, worlds, notes, take)
META = {
    'w1-roost': ("the harpy eagle's roost: a big stick nest lined with leaves, one white feather, in the V fork of two living kapok limbs "
                 'that end in leaf tufts, on a short mossy bough piece', 'decor near',
                 "new slot: lure post (gen2/lureLay.ts; World 1: the eagle's roost the boa fears, w1.ts W1_LURE)",
                 'none (not stood on): its bough piece sits on the boa\'s bough top', 'on a platform top (its bough piece)',
                 f'{W1} | COULD 8 Twilight Treetops: a canopy nest',
                 "the story keeper 11-14 7:44 PM: a LIVING giant's fork, never a dead snag; World 8's roost props are another world's look",
                 ''),
}


def main(take: str):
    rows = []
    for name, (kind, layer, slot, foot, fl, worlds, notes, _) in META.items():
        f = GAME / 'src/assets/w1-19' / f'{name}.webp'
        w, h = Image.open(f).size
        kb = round(f.stat().st_size / 1024, 1)
        r = {c: '' for c in COLS}
        r.update(id=f'hf19/{name}', source=f'ENG-19a Hugging Face 2026-11-14 (take {take}; tools/art/hf19 spec-roost2.json, cut by hf1113/cutprops.py)',
                 file=f'src/assets/w1-19/{name}.webp', kind=kind, w=w, h=h, layer=layer, engine_slot=slot, footing=foot, float_class=fl,
                 world_best=1, worlds=worlds, no_fit=NOFIT_WOOD, made_thing='n', on_screen_px=f'{w / PX:.0f}x{h / PX:.0f} (units)',
                 ship_px=f'{w}x{h}', file_kb=kb, file_kb_ship=kb, draw_cost='one drawImage of a whole file', used_in='1-9 (the roost beats 7, 9, 13)',
                 status='cut, not placed (ENG-19a): the 1-9 builder draws it where proto.gen2.roosts says', notes=notes, part='H19')
        rows.append(r)
    runpy.run_path(str(GAME / 'tools/art/catalog_master.py'))['add_scale'](rows)
    out = GAME / 'reference/art/catalog-rows-hf19.csv'
    with open(out, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS, lineterminator="\n"); wr.writeheader(); wr.writerows(rows)
    master = GAME / 'reference/art/CATALOG-MASTER.csv'
    old = [x for x in csv.DictReader(open(master)) if not x['id'].startswith('hf19/')]
    with open(master, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS, lineterminator="\n"); wr.writeheader(); wr.writerows(old + rows)
    print(len(rows), 'rows ->', out.name, '+ CATALOG-MASTER.csv;', [(r['id'], r['pokey_scale'], r['scale_ok']) for r in rows])


if __name__ == '__main__':
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else '?')
