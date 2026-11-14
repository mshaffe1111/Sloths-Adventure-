"""ART-678b: catalog rows for every ART-678 piece (reference/art/catalog-rows-hf678.csv), merged into CATALOG-MASTER.csv (its own
earlier hf678/ rows replaced), then `python3 tools/art/catalog_master.py --emit` writes the engine copy (R-165.104). Pattern: hf1113/rows.py.

    python3 -I tools/art/hf678/rows.py

Sizes from the shipped files (src/assets/w1-678/, 3 px a game unit, so drawn units = px / 3); on_screen_px 'W x H (units)' is what
catalog_master.py's scale check (R-165.107) reads: drawn height / Pokey's drawn 89.1 units (heroSprite.ts:30,32; D41). Walk lines for
the pieces he may stand on, measured as hf1113/rows.py walk(). Nothing is placed: status says so.
"""
import csv, json, runpy
from pathlib import Path
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
H = Path(__file__).resolve().parent
R13 = runpy.run_path(str(GAME / 'tools/art/hf1113/rows.py'))
COLS, walk, W1, NOFIT_WOOD = R13['COLS'], R13['walk'], R13['W1'], R13['NOFIT_WOOD']
PX = 3.0
SET = '1-6..1-8 set (ART-678 picture list)'
# one slot a family (a creature's poses, a hazard's states), so a family is one slot with all its pieces, never a 1-piece 'gap'
POST = 'new slot: live post (a support: the 1-4 plank pole holding a bough, the gen2 post that holds a log, hopRocks.test.ts:66)'
SNAKE = 'new slot: vine snake (1-6, IDEAS-1-6: lianas and the vine snakes; four poses)'
HARPY = 'new slot: harpy eagle perch (1-7 the watch, PREDATORS.md:40; four frames)'
NUT = 'new slot: rolling nut (1-8, IDEAS-1-7-8:17: two heights; whole, then broken)'
COULD_WOOD = '3 Mossy Grotto: mossy wood; 6 Deep Mangrove: wet wood; 8 Twilight Treetops: boughs'
# name: (kind, layer, engine_slot, footing, float_class, worlds, notes, take)
META = {
    'w1-livepost-short': ('live post, short: a broken stump post wrapped in a vine, on its own mossy root pad', 'support',
                          POST,
                          'its root pad on the floor (a support: not stood on)', 'grounded (its root pad on the floor)', f'{W1} | COULD {COULD_WOOD}', '', 'post-53'),
    'w1-livepost-mid': ('live post, mid: a split stump post wrapped in a vine, fern at its foot', 'support',
                        POST, 'its root pad on the floor (a support: not stood on)',
                        'grounded (its root pad on the floor)', f'{W1} | COULD {COULD_WOOD}', 'its top is split: a perch, not a flat top', 'post-53'),
    'w1-livepost-tall': ('live post, tall: a sawn post wrapped in a vine, moss cap, fern at its foot', 'support',
                         POST, 'its root pad on the floor (a support: not stood on)',
                         'grounded (its root pad on the floor)', f'{W1} | COULD {COULD_WOOD}', 'flat moss cap; the pole cap of w1-livepole', 'post-53'),
    'w17-snag-a': ('dead snag tree, broken top, vine round its foot, on a root pad', 'decor mid', 'new slot: mid-layer dressing (a dead tree)',
                   'none (not stood on)', 'grounded (root pad)', f'{W1} | COULD 6 Deep Mangrove: a drowned snag; 8 Twilight Treetops',
                   'a tall background tree: no step range', 'snag-23'),
    'w17-snag-b': ('dead snag tree, bare branching top, vine round its foot, on a root pad', 'decor mid', 'new slot: mid-layer dressing (a dead tree)',
                   'none (not stood on)', 'grounded (root pad)', f'{W1} | COULD 6 Deep Mangrove: a drowned snag; 8 Twilight Treetops', '', 'snag-23'),
    'w17-moss-carpet': ('moss carpet strip with two fern tufts', 'decor near', 'new slot: dressing tiled along a platform top (tiled)',
                        'sits on a platform top', 'on a platform top', f'{W1} | COULD 3 Mossy Grotto', '', 'moss-37'),
    'w17-moss-patch': ('moss mound with grass tufts', 'decor near', 'new slot: floor dressing (a mound)', 'none (not stood on)',
                       'grounded (on the floor)', f'{W1} | COULD 3 Mossy Grotto', '', 'moss-37'),
    'w17-moss-liana': ('moss-capped trunk segment with a liana wound round it (a tree_climb trunk look, tiled up; not wired)', 'climb', 'climbable/vines tree_climb',
                       'none (climbed)', 'grounded (a trunk)', f'{W1} | COULD 3 Mossy Grotto', '', 'moss-37'),
    'w17-moss-fork': ('little moss tree: a round moss crown on a forked stump with leaves', 'decor near', 'new slot: floor dressing (a little tree)',
                      'none (not stood on)', 'grounded (stump on the floor)', f'{W1} | COULD 3 Mossy Grotto',
                      'split from the drape (ART-678b FAIL 2): its own hand box', 'moss-37'),
    'w17-moss-drape': ('hanging moss draped over a mossy branch (long strands left, loops right)', 'decor near',
                       'new slot: hanging dressing under a bough', 'none (not stood on)', 'hangs from a bough above',
                       f'{W1} | COULD 6 Deep Mangrove: hanging moss; 8 Twilight Treetops', 'split from the little moss tree (ART-678b FAIL 2)', 'moss-37'),
    'w17-moss-drape-b': ('hanging moss curtain over a short twig, ends rounded', 'decor near', 'new slot: hanging dressing under a bough',
                         'none (not stood on)', 'hangs from a bough above', f'{W1} | COULD 6 Deep Mangrove: hanging moss',
                         'the first drape (moss-11), twig ends rounded (ART-678b)', 'moss-11'),
    'w16-vinesnake-hang': ('vine snake hanging head-down from a loop (a vine look-alike)', 'danger look', SNAKE,
                           'none (hangs)', 'hangs from a bough above', W1, 'reads olive at ship size; a brown shift is on beside-2 (lead picks)', 'snake-37'),
    'w16-vinesnake-slide': ('vine snake sliding, head raised', 'danger look', SNAKE,
                            'belly on a bough', 'on a bough', W1, 'tail smear in the take dropped and the end rounded (ART-678b)', 'snake-37'),
    'w16-vinesnake-liana': ('vine snake coiled along a mossy liana', 'danger look', SNAKE,
                            'belly on a liana', 'on a liana', W1, '', 'snake-37'),
    'w16-vinesnake-hiss': ('vine snake reared, mouth open (the warning)', 'danger look', SNAKE,
                           'coil on the floor or a bough', 'on a floor or bough', W1, '', 'snake-37'),
    'w17-harpy-perchfeet-ahead': ('harpy eagle perched on a branch, looking ahead', 'danger look', HARPY,
                                  'feet grip its own branch', 'perched (its branch)', W1, 'beak kept by a protect box (ART-678b FAIL 3)', 'harpy-ahead-perch-s1'),
    'w17-harpy-perchfeet-blink': ('harpy eagle perched, eye shut (blink)', 'danger look', HARPY,
                                  'feet grip its own branch', 'perched (its branch)', W1, 'beak kept by a protect box (ART-678b FAIL 3)', 'harpy-blink-perch-s1'),
    'w17-harpy-perchfeet-down': ('harpy eagle perched, looking down', 'danger look', HARPY,
                                 'feet grip its own branch', 'perched (its branch)', W1, '', 'harpy-down-perch-s1'),
    'w17-harpy-perchfeet-turn': ('harpy eagle perched, facing out', 'danger look', HARPY,
                                 'feet grip its own branch', 'perched (its branch)', W1, '', 'harpy-turn-perch-s1'),
    'w18-palmnut': ('palm nut, whole', 'danger look', NUT, 'none (not stood on)', 'grounded (on the floor)',
                    W1, 'w1NutPod (shipped, 52 u wide, an open pod) is a different thing: beside-4', 'nuts-53'),
    'w18-nut-cracked': ('nut, cracked shell', 'danger look', NUT, 'none (not stood on)',
                        'grounded (on the floor)', W1, '', 'nuts-53'),
    'w18-cannonball': ('cannonball-tree fruit, whole', 'danger look', NUT, 'none (falls)',
                       'falls (a hazard)', W1, '', 'nuts-53'),
    'w18-cannonball-split': ('cannonball-tree fruit split open', 'danger look', NUT, 'none (not stood on)',
                             'grounded (on the floor)', W1, '', 'nuts-53'),
    'w18-squirreltracks': ('squirrel paw tracks in a moss strip', 'decor near', 'new slot: floor marks along a platform top (tiled)',
                           'sits on a floor', 'on a floor', W1, '', 'nuts-53'),
    'w1-underlayer-deep': ('deep earth and root underlayer band: no grass top, a ragged earth edge with a dark lip, darker and hazier with depth (tiles end to end)',
                           'backdrop', 'new slot: the band along the bottom, well below the lowest walkable (R-165.224)', 'none (behind the ground)',
                           'band along the bottom', f'{W1} | COULD 3 Mossy Grotto',
                           'from under-53 by hf678/underdeep.py (the grass-lipped a/b read as a floor: the lead FAILED them 11-14); wrap 1.1', 'under-53'),
    'w1-livepole': ('live pole: w1-livepost-tall at a bough-holding height (cap + trunk + vine foot, hi-res cut)', 'support',
                    POST, 'its root pad on the floor (a support: not stood on)', 'grounded (its root pad on the floor)', f'{W1} | COULD {COULD_WOOD}',
                    'replaces the 1-4 square plank pole (pole-1-4-before-after.jpg); taller: hf678/polebuild.py tiles one vine turn (rows 380/726 of the 1200 px cut)',
                    'post-53'),
}


def main():
    rows = []
    for name, (kind, layer, slot, foot, fl, worlds, notes, take) in META.items():
        f = GAME / 'src/assets/w1-678' / f'{name}.webp'
        w, h = Image.open(f).size
        kb = round(f.stat().st_size / 1024, 1)
        r = {c: '' for c in COLS}
        tiled = (' (tiled up)' if 'tiled up' in kind else ' (tiled along a platform top)' if 'tiled' in slot
                 else ' (band along the bottom, tiled)' if layer == 'backdrop' else '')
        r.update(id=f'hf678/{name}', source=f'ART Hugging Face 2026-11-13 (take {take}); re-cut ART-678b (tools/art/hf678/recut.py)',
                 file=f'src/assets/w1-678/{name}.webp', kind=kind, w=w, h=h, layer=layer, engine_slot=slot, footing=foot, float_class=fl,
                 world_best=1, worlds=worlds, no_fit=NOFIT_WOOD, made_thing='n', on_screen_px=f'{w / PX:.0f}x{h / PX:.0f} (units){tiled}',
                 ship_px=f'{w}x{h}', file_kb=kb, file_kb_ship=kb, draw_cost='one drawImage of a whole file', used_in=SET,
                 status='cut, not placed (ART-678b): an Engine/level packet wires it', notes=notes, part='H678')
        if foot == 'walk top measured':
            wl = walk(f)
            if wl:
                r['walk_y'], r['walk_x0'], r['walk_x1'] = wl
                r['footing'] = f'walk line y={wl[0]} x {wl[1]}-{wl[2]} (shipped px)'
        rows.append(r)
    # the scale verdict (R-165.107) by the catalog's own rule, so the emit carries it
    runpy.run_path(str(GAME / 'tools/art/catalog_master.py'))['add_scale'](rows)
    out = GAME / 'reference/art/catalog-rows-hf678.csv'
    with open(out, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS); wr.writeheader(); wr.writerows(rows)
    master = GAME / 'reference/art/CATALOG-MASTER.csv'
    old = [x for x in csv.DictReader(open(master)) if not x['id'].startswith('hf678/')]
    with open(master, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, COLS); wr.writeheader(); wr.writerows(old + rows)
    print(len(rows), 'rows ->', out.name, '+ CATALOG-MASTER.csv')


if __name__ == '__main__':
    main()
