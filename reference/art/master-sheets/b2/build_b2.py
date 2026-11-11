#!/usr/bin/env python3
"""ART-CAT part B2: every image the game holds for Worlds 5-10 (src/assets w6to10, w6, w7, w7slide, w8, the W5-W10 kits, ground,
gates, pit water, water strips, the W5-W10 dress frames, faces810, meeca-night, boss-910/1010/fx) as one row per piece:
one row per atlas frame (the atlas's own frame list: its .json or the src/game *Data.ts that draws it), one row per animation clip
(a move of a creature or boss sheet: frames inherit everything, the row says how many), one row per single image.

Run from the repo root:  python3 reference/art/master-sheets/b2/build_b2.py <frames.json> <meeca.json> <anim.json>
(frames.json/meeca.json/anim.json: the dump of the src/game data modules, made by dump.mts / dump2.mts / dump3.mts beside this file with npx tsx.)
Writes reference/art/catalog-game-B2.csv. Reads only; changes nothing under src/.

Units: on_screen_px is the piece's longest side as drawn in world units at play scale (the world view is 540 units tall,
engine.ts:221 WORLD_VIEW_H: one unit is one CSS px on a phone held sideways); ship_px = min(native longest side, 2 x on_screen_px).
"""
import csv, json, os, re, subprocess, sys
from PIL import Image

ROOT = os.getcwd()
A = 'src/assets/'
FR = json.load(open(sys.argv[1]))
MEECA = json.load(open(sys.argv[2]))['NIGHT_ART']
OUT = 'reference/art/catalog-game-B2.csv'
COLS = ['id', 'source', 'file', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'float_class', 'world_best', 'worlds',
        'no_fit', 'made_thing', 'engine_slot', 'footing', 'layer', 'on_screen_px', 'ship_px', 'file_kb_now', 'file_kb_ship',
        'draw_cost', 'used_in', 'status']

# ---------------------------------------------------------------- code lookups (D37: read from the code, file:line)
def git_grep(pat):
    r = subprocess.run(['git', 'grep', '-n', '-E', pat, '--', 'src/*.ts', 'src/*.tsx', ':!*.test.ts'], capture_output=True, text=True)
    return [l for l in r.stdout.splitlines()]

def first_ref(pat, skip_data=False):
    for l in git_grep(pat):
        f = l.split(':')[0]
        if skip_data and re.search(r'(Data|Atlas)\.ts$', f):
            continue
        return ':'.join(l.split(':')[:2])
    return ''

_NAME_CACHE = {}
def name_drawn(name, data_files=()):
    """the frame name quoted in a src file that is not its own data file (how a draw path asks for it)"""
    key = (name, data_files)
    if key not in _NAME_CACHE:
        hits = [l for l in git_grep(r"""['"]%s['"]""" % re.escape(name)) if l.split(':')[0] not in data_files]
        m = re.match(r'^(\D+?)(\d+)$', name)
        if not hits and m:  # a numbered frame asked for by a template (`spark${i}`, `mp${n}`) or a second take ('x' + '2')
            hits = [l for l in git_grep(r"""[`'"]%s(\$\{|['"] *\+)""" % re.escape(m.group(1))) if l.split(':')[0] not in data_files]
        _NAME_CACHE[key] = ':'.join(hits[0].split(':')[:2]) if hits else ''
    return _NAME_CACHE[key]

# ---------------------------------------------------------------- world fit (Matt's ten worlds; badges.ts:30 WORLD_NAMES)
WN = {1: 'Emerald Canopy', 2: 'Sunlit Riverbank', 3: 'Mossy Grotto', 4: 'Mist Cascades', 5: 'Orchid Sanctuary', 6: 'Deep Mangrove',
      7: 'Ancient Ruins', 8: 'Twilight Treetops', 9: 'Volcanic Jungle', 10: 'Stormy Highlands Fortress'}
# family -> (best-first [(world, reason)], no_fit {world: why}); every world is either in fit or in no_fit
FIT = {
    'w5garden': ([(5, 'its own: Meeca\'s orchid garden, painted in its palette'), (8, 'night garden, tinted dusk'), (1, 'green canopy plant, needs a greener tint')],
                 {}),
    'w5tea': ([(5, 'its own: the Queen\'s tea party and Meeca\'s sanctuary')], {}),
    'w5silk': ([(5, 'its own: the silk and the Queen\'s brood'), (8, 'night roost: webs read as eerie'), (3, 'grotto corners: cobweb')], {}),
    'w6swamp': ([(6, 'its own: mangrove mud, stilts and water'), (2, 'riverbank water edge, warmer tint'), (8, 'night wetland, darker tint')], {}),
    'w6built': ([(6, 'its own: stilt village wood'), (2, 'riverbank jetty and moorings'), (8, 'treetop walkways at night')], {}),
    'w7ruin': ([(7, 'its own: carved temple stone'), (3, 'grotto ruin, cool tint'), (9, 'buried ruins in ash, warm tint'), (10, 'old stone under the fortress')], {}),
    'w8night': ([(8, 'its own: twilight canopy, glow and roosts'), (5, 'garden after dark'), (1, 'canopy plant, needs a day tint'), (6, 'night swamp')], {}),
    'w9volcano': ([(9, 'its own: lava, obsidian and ash'), (10, 'scorched fortress approach'), (4, 'dark cliff rock, cooled tint')], {}),
    'w10fort': ([(10, 'its own: iron, banners and the storm fortress'), (7, 'old military stone, tinted'), (9, 'forge near lava')], {}),
    'kit': ([], {}),  # filled per world below
    'story': ([], {}),  # shown only where its story is
}
MADE_NOFIT = 'a made thing, and World 1 has none (Matt\'s rule)'

def fit_cols(fam, home, made, extra=None):
    """worlds (best first, 'N reason'), no_fit ('N why') and world_best"""
    if fam == 'kit':
        fit = [(home, 'its own world kit, painted in its palette')]
        near = {5: [(1, 'green bank and bough, tinted'), (8, 'canopy bough, darker tint')], 6: [(2, 'river mud and roots, tinted'), (8, 'roots and boughs at dusk')],
                7: [(3, 'stone banks, cool tint'), (10, 'old stone, grey tint')], 8: [(5, 'garden boughs, lighter tint'), (1, 'canopy bough, day tint')],
                9: [(4, 'dark rock, cooled tint'), (10, 'scorched ground')], 10: [(7, 'cut stone, warmer tint'), (9, 'burnt ground')]}
        fit += near.get(home, [])
    elif fam == 'story' or fam == 'only':
        fit = [(home, 'shown only where its story or fight is')]
    else:
        fit = list(FIT[fam][0])
    if extra:
        fit = extra + [f for f in fit if f[0] not in [e[0] for e in extra]]
    if made:
        fit = [f for f in fit if f[0] != 1]
    seen = [f[0] for f in fit]
    nof = []
    for w in range(1, 11):
        if w in seen:
            continue
        if made and w == 1:
            nof.append('1 ' + MADE_NOFIT)
        elif fam in ('story', 'only'):
            nof.append(f'{w} not its story (shown only at its own stage)')
        else:
            nof.append(f'{w} {WN[w]}: palette and subject clash')
    return str(fit[0][0]), '; '.join(f'{w} {r}' for w, r in fit), '; '.join(nof)

# ---------------------------------------------------------------- pixels: footing by alpha scan
_IMG = {}
def img(path):
    if path not in _IMG:
        _IMG[path] = Image.open(path).convert('RGBA')
    return _IMG[path]

def footing_scan(path, x, y, w, h):
    """walk line in piece px: per column the first opaque row, over the middle 70%; the walk span is where it stays within 10% of h"""
    im = img(path).crop((x, y, x + w, y + h))
    a = im.split()[3]
    px = a.load()
    tops = []
    for cx in range(w):
        t = None
        for cy in range(h):
            if px[cx, cy] > 128:
                t = cy
                break
        tops.append(t)
    mid = [t for t in tops[int(w * 0.15):int(w * 0.85) + 1] if t is not None]
    if not mid:
        return '', '', '', ''
    mid.sort()
    wy = mid[len(mid) // 2]
    tol = max(4, h * 0.10)
    ok = [i for i, t in enumerate(tops) if t is not None and abs(t - wy) <= tol]
    x0, x1 = (ok[0], ok[-1]) if ok else ('', '')
    spread = (mid[int(len(mid) * 0.9) - 1] - mid[int(len(mid) * 0.1)]) if len(mid) > 4 else 0
    flat = 'y' if spread <= max(6, h * 0.08) else 'n'
    return wy, x0, x1, flat

def edge_check(path, x, y, w, h):
    """a rough-cut test: magenta/blue key left in the fringe, or a box edge (opaque pixels touching all four frame edges)"""
    im = img(path).crop((x, y, x + w, y + h))
    px = im.load()
    key = 0
    n = 0
    for cy in range(0, h, max(1, h // 60)):
        for cx in range(0, w, max(1, w // 60)):
            r, g, b, al = px[cx, cy]
            if 20 < al < 250:
                n += 1
                if (r > 170 and b > 170 and g < 110) or (b > 170 and r < 80 and g < 80):
                    key += 1
    return key, n

def white_rim(path, x, y, w, h):
    """share of the outline (opaque px with a clear neighbour) that is near-white: a die-cut sticker border reads as a halo"""
    im = img(path).crop((x, y, x + w, y + h))
    px = im.load()
    step = max(1, min(w, h) // 120)
    rim = white = 0
    lum = lambda q: (q[0] + q[1] + q[2]) / 3 if q[3] > 120 else 0
    for cy in range(3, h - 3, step):
        for cx in range(3, w - 3, step):
            al = px[cx, cy][3]
            if al < 120:
                continue
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                if px[cx + dx, cy + dy][3] < 40:
                    rim += 1
                    if max(lum(px[cx - dx * i, cy - dy * i]) for i in (0, 1, 2)) > 232:
                        white += 1
                    break
    return white, rim

KB = {}
def kb(path):
    if path not in KB:
        KB[path] = os.path.getsize(path) / 1024
    return KB[path]

# ---------------------------------------------------------------- the sheets in B2's scope
SHIPPED = {}
def ships(rel):
    if rel not in SHIPPED:
        p = rel.replace('src/assets/', '')
        ref = first_ref(re.escape(p))
        if not ref:
            d, f = os.path.split(p)
            m = re.match(r'w(\d+)\.webp$', f)
            if m and d in ('kits', 'ground'):
                ref = {'kits': 'src/game/protoArt.ts:93', 'ground': 'src/game/groundPaint.ts:39'}[d]
            if d == 'w7slide':
                stem = f.rsplit('.', 1)[0]
                ref = first_ref(r"""U\(['"]%s""" % re.escape(f)) or first_ref(re.escape(stem) + r"\.webp")
        SHIPPED[rel] = ref
    return SHIPPED[rel]

rows = []
RECT = {}
# the rim test also fires on pieces that are white all through (teacups, doilies, silk, cake icing); flagged only where a look at the
# contact sheet confirmed a die-cut white border (the 33 hits were each looked at; these are the real ones)
STICKER = r'(grandma-things|collar\.webp|w5-props\.webp#orchidIcon|props\.webp#w8-bough-5)'
def area_kb(path, w, h):
    W, H = img(path).size
    return kb(path) * (w * h) / max(1, W * H)

def add(path, frame, w, h, *, kind, layer, fam, home, made=False, slot, footing='none', on=None, cost=None, used='', status=None,
        fx=None, float_class='', extra=None, scan=None, note_fix='', draw_ref=''):
    rel = path
    ship_ref = ships(rel)
    longest = max(w, h)
    on = on if on is not None else longest
    on = int(round(on))
    ship = min(longest, 2 * on)
    kn = area_kb(path, w, h) if frame else kb(path)
    ks = kn * (ship / longest) ** 2 if longest else kn
    wy = x0 = x1 = fl = ''
    if scan is not None and fx is not None:
        wy, x0, x1, fl = footing_scan(path, fx[0], fx[1], w, h)
        if isinstance(scan, (int, float)) and scan is not True:
            wy = int(scan)
        if footing == 'scan':
            footing = f'walk line y={wy} px from the frame top, x {x0}-{x1} (alpha scan of the painted top)'
    fixes = []
    if fx is not None:
        k, n = edge_check(path, fx[0], fx[1], w, h)
        if n and k / n > 0.25 and k >= 6:
            fixes.append(f'key colour left in the fringe ({k} of {n} sampled edge px)')
        wh, rim = white_rim(path, fx[0], fx[1], w, h)
        if rim >= 20 and wh / rim > 0.35 and re.search(STICKER, rel + '#' + frame):
            fixes.append(f'white sticker outline round the piece (halo: {round(100 * wh / rim)}% of its rim is white)')
    if note_fix:
        fixes.append(note_fix)
    if status is None:
        if not ship_ref:
            status = 'ready (in src/assets, not imported: does not ship)'
        elif draw_ref is None:
            status = 'ships, frame not drawn (no draw path names it)'
        else:
            status = 'in game'
    if fixes:
        status = 'needs fix: ' + '; '.join(fixes) + ' [' + status + ']'
    wb, wl, nf = fit_cols(fam, home, made, extra)
    if cost is None:
        cost = (f'1 blit, part of atlas {os.path.basename(path)}' if frame else f'1 blit, own image {os.path.basename(path)}')
    RECT['game/' + rel.replace('src/assets/', '').rsplit('.', 1)[0] + (('#' + frame) if frame else '')] = [path] + list(fx or (0, 0)) + [w, h]
    rows.append({
        'id': 'game/' + rel.replace('src/assets/', '').rsplit('.', 1)[0] + (('#' + frame) if frame else ''),
        'source': 'game:B2', 'file': rel + (('#' + frame) if frame else ''), 'kind': kind, 'w': w, 'h': h,
        'walk_y': wy, 'walk_x0': x0, 'walk_x1': x1, 'flat': fl, 'float_class': float_class,
        'world_best': wb, 'worlds': wl, 'no_fit': nf, 'made_thing': 'y' if made else 'n', 'engine_slot': slot, 'footing': footing,
        'layer': layer, 'on_screen_px': on, 'ship_px': ship, 'file_kb_now': round(kn, 1), 'file_kb_ship': round(ks, 1), 'draw_cost': cost,
        'used_in': used or ('W%d (draw path %s)' % (home, ship_ref) if ship_ref else 'none (not imported)'), 'status': status})

def fxy(f):
    if isinstance(f, list):
        return f[0], f[1], f[2], f[3]
    return f['x'], f['y'], f['w'], f['h']

# ---- 1. World kits (kits/w5..w10.webp, kitAtlasData.ts KIT_FRAMES; drawn by protoArt.ts once setKitWorld(w) picks the world)
KIT = {  # name -> (layer, kind, slot, footing, on_screen units, float, draw ref)
    'liana': ('climb', 'climbing liana', 'climbable vines/tree_climb (catalog-map) via protoArt.ts:954 drawn down its length', 'none: hangs from its anchor', 330, 'hangs', 'src/game/protoArt.ts:954'),
    'wall': ('platform', 'bank wall face', 'landing platforms solid (bank sides) via protoArt.ts:807', 'none: a face, drawn top-14 to bottom+30 of the bank', 300, 'grounded', 'src/game/protoArt.ts:807'),
    'trunk': ('climb', 'tree trunk', 'other trees + climbable tree_climb via protoArt.ts:909 / :1241 (tiled up the trunk)', 'none: stands on the floor', 200, 'grounded', 'src/game/protoArt.ts:909'),
    'buttress': ('decor mid', 'buttress root', 'W8 only: w8DecorArt.ts:138 (useKit) trunk foot; other worlds no draw path', 'foot = frame bottom', 200, 'grounded', None),
    'perch': ('platform', 'trunk perch shelf', 'landing platforms solid branch on a trunk via protoArt.ts:539-543', 'top at perchY: drawn perchY - 0.42 h (protoArt.ts:543)', 160, 'needs a trunk', 'src/game/protoArt.ts:543'),
    'bankEnd': ('decor near', 'bank end post', 'W8 only: w8DecorArt.ts:74 mossy-post; other worlds no draw path', 'foot = frame bottom', 160, 'grounded', None),
    'bank': ('platform', 'bank top', 'no draw path found (kit slot unused: the painted ground draws banks, groundPaint.ts)', 'scan', 220, 'grounded', None),
    'snapL': ('platform', 'snapped bough, left half', 'landing platforms fragile branch, snapped state via protoArt.ts:509', 'drawn from the snap point, falls (protoArt.ts:509)', 120, 'falls', 'src/game/protoArt.ts:509'),
    'snapR': ('platform', 'snapped bough, right half', 'landing platforms fragile branch, snapped state via protoArt.ts:515', 'drawn from the snap point, falls (protoArt.ts:515)', 120, 'falls', 'src/game/protoArt.ts:515'),
    'branchCreak': ('platform', 'creaking bough', 'landing platforms fragile branch (creak state) via protoArt.ts:499', 'measured bark top on p.y+2 (protoArt.ts:500 solidTop)', 240, 'needs a trunk or floats where ruled', 'src/game/protoArt.ts:499'),
    'branch': ('platform', 'bough', 'landing platforms solid branch (height<50) via protoArt.ts:495-500', 'measured bark top on p.y+2 (protoArt.ts:500 solidTop)', 240, 'may float (catalog-map branch mayFloat yes)', 'src/game/protoArt.ts:495'),
    'stump': ('step', 'stump', 'journal scenes only (journalScenes.ts:232 drawKitPiece); same rect as boulder', 'scan', 90, 'grounded', 'src/game/journalScenes.ts:232'),
    'boulder': ('platform', 'mossy boulder', 'landing platforms solid moss_stone (h 50) / art rock via protoArt.ts:367-368', 'stand(): foot at p.y+p.height+3, top = the stone top (protoArt.ts:368)', 140, 'never floats (rock)', 'src/game/protoArt.ts:368'),
    'fill': ('platform', 'bank fill tile', 'no draw path found (the painted ground fills banks: groundPaint.ts)', 'none: fill', 200, 'grounded', None),
    'mossStrip': ('step', 'moss strip along a top', 'moss along a platform top via protoArt.ts:569-576 (tiled)', 'drawn at p.y-14 over the walk line (protoArt.ts:576)', 120, 'rides a platform', 'src/game/protoArt.ts:576'),
}
for w in range(5, 11):
    path = f'{A}kits/w{w}.webp'
    for n, f in FR['kitAtlasData.KIT_FRAMES'].get(str(w), {}).items():
        x, y, fw, fh = fxy(f)
        lay, kind, slot, foot, on, fc, ref = KIT.get(n, ('decor mid', n, 'no draw path found', 'none', 150, '', None))
        if w == 8 and n in ('buttress', 'bankEnd'):
            ref = 'src/game/w8DecorArt.ts:138' if n == 'buttress' else 'src/game/w8DecorArt.ts:74'
        if w == 8 and n in ('wall', 'liana'):
            slot += '; also 8-4 lantern run trunks (w8LanternRun.ts:33)'
        sc = True if lay in ('platform', 'step', 'soft landing') and 'none' not in foot else None
        add(path, n, fw, fh, kind=f'W{w} kit {kind}', layer=lay, fam='kit', home=w, made=(w in (7, 10) and n in ('wall', 'bank', 'fill', 'bankEnd')),
            slot=f'kit/{n}: ' + slot, footing=foot, on=on, fx=(x, y), scan=sc, float_class=fc, draw_ref=ref,
            used=f'every W{w} stage that paints its kit (setKitWorld, protoArt.ts:44; stageSheets.ts:189)' if ref else 'none (no draw path)',
            cost=f'1 blit, part of atlas kits/w{w}.webp' + (' (tiled: one blit per tile)' if n in ('trunk', 'mossStrip', 'liana') else ''))

# ---- 2. Painted ground (ground/w5..w10.webp, groundAtlasData.ts; groundPaint.ts:219)
for w in range(5, 11):
    path = f'{A}ground/w{w}.webp'
    g = FR['groundAtlasData.GROUND_FRAMES'][str(w)]
    for key, val in g.items():
        items = val if isinstance(val, list) else [val]
        if not isinstance(items[0], dict) or 'x' not in items[0]:
            continue
        for i, f in enumerate(items):
            x, y, fw, fh = fxy(f)
            nm = f'{key}{i}' if isinstance(val, list) else key
            is_lip = key.startswith('lip')
            surf = f.get('surf')
            add(path, nm, fw, fh, kind=f'W{w} ground ' + ('lip (the bank top edge)' if is_lip else ('deep soil fill' if key == 'deep' else 'soil fill tile')),
                layer='platform', fam='kit', home=w, slot=f'painted ground {key} (groundPaint.ts:219 GROUND_FRAMES[w].{key}); banks height>=90 or soil (protoArt.ts:70 bankPainted)',
                footing=(f'walk line at surf {surf} of the lip height = y {round(surf * fh) if surf is not None else ""} px (groundAtlasData.ts surf)' if is_lip else 'none: fill under the lip'),
                on=512 if not is_lip else 512, fx=(x, y), scan=(round(surf * fh) if (is_lip and surf is not None) else None),
                float_class='grounded (the floor)', draw_ref='src/game/groundPaint.ts:219',
                used=f'every W{w} stage with painted banks (engine.ts paintKit)', cost=f'1 blit per tile, part of atlas ground/w{w}.webp (tiled along every bank)')

# ---- 3. Exit gates and pit water (stageArtData.ts; stageArt.ts:23-34)
for w in range(5, 11):
    path = f'{A}props/gates/w{w}.webp'
    for st, f in FR['stageArtData.GATE_FRAMES'][str(w)].items():
        x, y, fw, fh = fxy(f)
        add(path, st, fw, fh, kind=f'W{w} exit gate, {st}', layer='decor near', fam='only' if False else ('w5garden' if w == 5 else 'w6built' if w == 6 else 'w7ruin' if w == 7 else 'w8night' if w == 8 else 'w9volcano' if w == 9 else 'w10fort'),
            home=w, made=True, slot=f'exit gate GATE_FRAMES[{w}].{st} (stageArt.ts:{22 + w - 4}; stageArtData.ts:11); pickup collectibles exit_totem stands at it',
            footing=f'foot anchor ax {f["ax"]}, ay {f["ay"]} (the gate stands on the floor)', on=170, fx=(x, y), float_class='grounded',
            draw_ref=f'src/game/stageArt.ts:{22 + w - 4}', used=f'every W{w} stage exit')
path = f'{A}props/pitwater/w5.webp'
for st in ('strip', 'shine'):
    f = FR['stageArtData.PIT_WATER']['5'][st]
    add(path, st, f['w'], f['h'], kind=f'W5 pit water {st}', layer='danger look', fam='w5garden', home=5, slot='pit water PIT_WATER[5] (stageArt.ts:34; stageArtData.ts:13): deadly pit',
        footing='none: deadly; surface at 0.324 of the strip', on=512, fx=(f['x'], f['y']), float_class='water surface', draw_ref='src/game/stageArt.ts:34',
        cost='1 blit per tile, part of atlas pitwater/w5.webp (tiled along the pit)', used='W5 stages with water pits')

# ---- 4. Water strips (badWaterArt.ts, calmWaterArt.ts) and single set pieces
SINGLE = [
    ('props/w6-water.webp', 'deadly fast water strip (W6, used by Worlds 6-10 without their own)', 'danger look', 'w6swamp', 6, False, 'deadly water (badWaterArt.ts:12 BAD_WATER_URL)', 'none: deadly; Pokey cannot stand or swim', 512, 'W6-W7 deadly water (badWaterArt.ts:12)'),
    ('props/w8-water.webp', 'deadly water strip W8', 'danger look', 'w8night', 8, False, 'deadly water BAD water by world (badWaterArt.ts:19)', 'none: deadly', 512, 'W8 deadly water'),
    ('props/w9-water.webp', 'deadly water strip W9 (hot)', 'danger look', 'w9volcano', 9, False, 'deadly water (badWaterArt.ts:20)', 'none: deadly', 512, 'W9 deadly water'),
    ('props/w10-water.webp', 'deadly water strip W10 (storm)', 'danger look', 'w10fort', 10, False, 'deadly water (badWaterArt.ts:21)', 'none: deadly', 512, 'W10 deadly water'),
    ('props/w6-calm-water.webp', 'calm swimmable water strips, ring and bubbles', 'soft landing', 'w6swamp', 6, False, 'calm water body, swim.ts (calmWaterArt.ts:17)', 'none: he swims in it (no walk line)', 512, 'W6 swim water (calmWaterArt.ts:17)'),
    ('w7/chairs-ring.webp', 'ring of ten stone chairs (7-3 set piece)', 'decor mid', 'w7ruin', 7, True, 'W7_PROP.chairs set piece (w7ChairsArt.ts:12, drawn CHAIRS_W=1000 wide, nothing solid)', 'bottom sunk CHAIRS_SINK under the floor top (w7ChairsArt.ts)', 1000, '7-3 Ten Chairs'),
    ('w7/temple-run.webp', 'temple wall run, three variants sharing edges', 'decor mid', 'w7ruin', 7, True, 'faces every W7 high ledge (w7TempleArt.ts:17 HIGH_LEDGE)', 'hung from the run top, tiled across', 540, 'W7 stages with high ledges'),
    ('w7/crumble.webp', 'crumbling ruin slab: whole, cracked, breaking, falling', 'platform', 'w7ruin', 7, True, 'landing platforms fragile ruin / zone crumble (crumbleArt.ts:17, drawn a tile wide)', 'scan', 120, 'W7 crumbling floors (catalog-map zone crumble: 28 W7)'),
    ('w8/pokey-jar.webp', 'Pokey holding the firefly jar (stand, walk x4, air)', 'character', 'only', 8, False, 'hero frames for 8-4 (w8LanternRun.ts:45; w8LanternAtlas.ts POKEY_JAR_FRAMES)', 'feet ax, ay (StdFrame)', 70, '8-4 lantern run'),
    ('props/w5-sway.webp', 'W5 swaying silk/orchid strip', 'decor near', 'w5silk', 5, False, 'w5Look.ts:624 SWAY_URL', 'none', 200, 'W5 stages'),
    ('w6to10/props-made/w8glowcaps.webp', 'glow-mushroom cluster', 'decor near', 'w8night', 8, False, 'W8 decor W8GLOW (w8DecorData.ts:14) fungus scenery socket (w8.ts:122)', 'foot = frame bottom (ax, ay)', 100, 'W8 stages, fungus socket'),
]
for rel, kind, lay, fam, home, made, slot, foot, on, used in SINGLE:
    p = A + rel
    W, H = img(p).size
    sc = True if foot == 'scan' else None
    add(p, '', W, H, kind=kind, layer=lay, fam=fam, home=home, made=made, slot=slot, footing=foot, on=on, fx=(0, 0), scan=sc,
        float_class='water surface' if 'water' in rel else ('grounded' if lay != 'character' else ''), used=used,
        cost=('1 blit per tile, own image (tiled)' if lay in ('danger look', 'soft landing') or 'temple' in rel else None))

# ---- 5. Atlases with frame lists
def sheet_rows(rel, frames, *, fam, home, data_file, layer_of, slot, used, made_of=lambda n: False, on_of=None, foot_of=None, drawn=True, extra=None, kind_pre=''):
    p = A + rel
    for n, f in frames.items():
        x, y, fw, fh = fxy(f)
        lay = layer_of(n)
        foot = foot_of(n, f) if foot_of else ('scan' if lay in ('platform', 'step', 'soft landing') else 'foot = frame bottom' if lay.startswith('decor') else 'none')
        if isinstance(f, dict) and 'ax' in f and 'ay' in f and foot.startswith('foot'):
            foot = f'foot anchor ax {f["ax"]}, ay {f["ay"]}'
        ref = name_drawn(n, data_file) if drawn else None
        if drawn == 'sheet':
            ref = ships(p) or None
        add(p, n, fw, fh, kind=(kind_pre + n), layer=lay, fam=fam(n) if callable(fam) else fam, home=home, made=made_of(n), slot=slot(n) if callable(slot) else slot,
            footing=foot, on=(on_of(n, f) if on_of else None), fx=(x, y), scan=(True if foot == 'scan' else None),
            float_class=('may float' if lay in ('platform', 'step') else ''), draw_ref=(ref or None), used=used)

PLAT = re.compile(r'(snapL|ledge|perch|branch|bank|bridge|slab|raft|plank|stone|lily|roost-branch|shelf-fungus|knot-perch|branch-fork|hot-platform|scaffold|balcony|stair|steps|hanging-platform|push-block|stump|fill|mossStrip|tunnel-floor|wall-shelf|stump-pillar|charred-log|crust|shelf\d|rib\d|beam|bough|burl|grate|block|column|post|capital|table\b|^table|battlement|moss-log|^log$|root-arch|root-den|hex-column|pumice|seesaw|canoe|mossy-log)')
DANGER = re.compile(r'(lava|vent|smoke-crack|spout|hedge|thorn|bolt|storm|venom|scorch|warn|piranha|spark|mudWave|flood|gust|screech|webSplat|silkBall|splash|spike|crack-|net[SMLT]|cage|weakRing)')
SOFT = re.compile(r'(hammock|bouncy-leaf|^web$|slack|billow|snap$|lily-pads|silkSheet|silkBridge)')
PUZ = re.compile(r'(lever|plate|door|gate-|portcullis)')
CHAR = re.compile(r'^(mp\d+|mc\d+|fl\d+|bu\d+|guard\d|guardStump|stand|bow|offer|hand-on-heart|eyes-shut|sit|laugh|open-arms|wave|settle|look-|hop|rest|proud|flustered|surprised|shocked|laughing|hammering|kids|puff|sneeze|sulk|climb-\d|slideA|slideB|lean[LR]|launch|air|land|impact|grip2?|jump|duck|hold|walk_\d)$')

def layer_generic(n):
    if CHAR.match(n):
        return 'character'
    if PUZ.search(n):
        return 'step' if 'plate' in n else 'decor near'
    if SOFT.search(n):
        return 'soft landing'
    if DANGER.search(n):
        return 'danger look'
    if PLAT.search(n):
        return 'platform'
    return 'decor near'

MADE = re.compile(r'(lever|plate|door|gate|portcullis|bridge|plank|scaffold|balcony|stair|steps|crate|banner|rack|brazier|cage|spout|chain|post|grate|netting|net[SMLT]|table|chair|teacup|teapot|cake|cup|doily|armchair|stool|lantern|bell|flag|totem|mug|pot|tin|statue|urn|column|capital|archway|block|beam|slab|tablet|altar|idol|censer|coins|offering|ladder|trough|basket|tent|bedroll|packs|tray|bench|pots|spool|thimble|button|sugar|ribbon|book|wheelbarrow|watering|birdbath|medal|spectacles|wool|pouch|sign|helmets|rowboat|pennant|pole|rod|canoe|mooring|raft|seesaw|sluice|gauge|battlement|wall|tunnel|stake|collar|weapon|hanging-iron|iron|chime|tile)', re.I)
made = lambda n: bool(MADE.search(n))

def slot_generic(world, sheetname):
    def s(n):
        lay = layer_generic(n)
        if PUZ.search(n):
            return f'puzzle room {n.split("-")[0]} (puzzleKit.ts room piece; W{world} rooms draw it over the kit art: {sheetname})'
        if lay == 'platform':
            return f'landing platforms solid (new slot: W{world} {n} look for a log/branch/ruin collider)'
        if lay == 'step':
            return f'landing platforms solid, low step (new slot: W{world} {n})'
        if lay == 'soft landing':
            return f'landing platforms bouncy / catch (new slot: W{world} {n})'
        if lay == 'danger look':
            return f'hazard look (new slot: W{world} {n})'
        if lay == 'character':
            return f'character/story pose (story or cutscene code; {sheetname})'
        return f'prop dress (new slot: W{world} {n} in the world\'s decor sets)'
    return s

# 5a. the W5-W10 frames of the shared dress atlases (dressAtlasData.ts props/dress.webp; dressNewData.ts props/dressnew-w5..7)
FAMW = {5: 'w5garden', 6: 'w6swamp', 7: 'w7ruin', 8: 'w8night', 9: 'w9volcano', 10: 'w10fort'}
CM = {}
for e in json.load(open('tools/engine/catalog-map.json')):
    if e['cat'] == 'prop' and e['arr'] in ('dress', 'proto.dress'):
        k = e['key']
        CM.setdefault(k, set()).update(e['stageList'])
        CM.setdefault(k + '@at', set()).add(e['at'])
for src, key, data in (('props/dress.webp', 'dressAtlasData.DRESS_FRAMES', 'src/game/dressAtlasData.ts'),):
    for n, f in FR[key].items():
        m = re.match(r'w(\d+)', n)
        if not m or int(m.group(1)) < 5:
            continue
        w = int(m.group(1))
        lay = 'danger look' if 'Smoke' in n else 'decor near'
        st = sorted(CM.get(n, []))
        add(A + src, n, f['w'], f['h'], kind=f'W{w} dress {n}', layer=lay, fam=FAMW[w], home=w, made=made(n), slot=f'prop dress {n} (artDress.ts dressSets: bank/hang/clutter; catalog-map {"; ".join(sorted(CM.get(n + "@at", []))) or "not laid"})',
            footing='foot = frame bottom, drawn units wide (dressArt.ts:62 dressSize)', on=f.get('units', 100), fx=(f['x'], f['y']),
            draw_ref=(name_drawn(n, (data,)) or None), used=(', '.join(st) if st else 'no stage lays it (catalog-map count 0)'),
            note_fix=('' if True else ''))
for n, f in FR['dressNewData.DRESS_NEW_FRAMES'].items():
    m = re.match(r'w(\d+)', n)
    if not m or int(m.group(1)) < 5:
        continue
    w = int(m.group(1))
    st = sorted(CM.get(n, []))
    add(A + f'props/dressnew-w{w}.webp', n, f['w'], f['h'], kind=f'W{w} dress {n}', layer='decor near', fam=FAMW[w], home=w, made=made(n),
        slot=f'prop dress {n} (artDress.ts + dressNewLooks.ts looks; catalog-map {"; ".join(sorted(CM.get(n + "@at", []))) or "not laid"})',
        footing='foot = frame bottom, drawn units wide (dressArt.ts:62 dressSize)', on=f.get('units', 100), fx=(f['x'], f['y']),
        draw_ref=(name_drawn(n, ('src/game/dressNewData.ts',)) or None), used=(', '.join(st) if st else 'no stage lays it (catalog-map count 0)'))

# 5b. World 5 painted props (props/w5-props.webp, w5PropsData.ts; w5Art.ts drawW5)
def w5fam(n):
    return 'w5silk' if re.search('silk|cocoon|wrapped', n) else ('w5tea' if re.search('tea|cake|cup|doily|armchair|chair|stool|flag|bell|lantern|totem|arch', n) else 'w5garden')
def w5layer(n):
    if re.search('silkBridge|silkSpan', n): return 'platform'
    if re.search('silkSheet', n): return 'soft landing'
    if re.search('teaTable|doilyStool|armchair|wrappedArmchair|wrappedChair|wrappedStool|fernStump', n): return 'step'
    if re.search('trunk', n): return 'decor mid'  # the carved trunk behind Meeca's words (w5Look.ts:524), not a climb
    return 'decor near'
sheet_rows('props/w5-props.webp', FR['w5PropsData.W5_FRAMES'], fam=w5fam, home=5, data_file=('src/game/w5PropsData.ts',), layer_of=w5layer,
           slot=lambda n: f'W5 piece {n} (w5Look.ts PAINTED -> w5Art.ts:38 drawW5){"; soft: armchairs tug (w5Kit)" if "armchair" in n else ""}',
           used='W5 stages 5-1..5-10 (w5Stages.ts / w5Play.ts draw by look name)', made_of=made, on_of=lambda n, f: max(f['w'], f['h']) * 0.45, kind_pre='W5 ')
# 5c. Meeca's stage sheet (props/meeca-night.webp, meecaNightData.ts; 5-M)
def mlayer(n):
    if CHAR.match(n): return 'character'
    if re.search('ladder', n): return 'climb'
    if re.search('trough|basket|guardStump|leafPlate$', n): return 'step'
    return 'decor near'
sheet_rows('props/meeca-night.webp', MEECA, fam=lambda n: 'only' if CHAR.match(n) else 'w5garden', home=5, data_file=('src/game/meecaNightData.ts',), layer_of=mlayer,
           slot=lambda n: f'5-M piece {n} (meecaNightArt.ts drawNightPiece; meecaStage.ts)', used='5-M On the March North', made_of=made,
           on_of=lambda n, f: max(f['w'], f['h']) * 0.5, kind_pre='5-M ')

# 5d. World 6
sheet_rows('w6/ledges.json'.replace('.json', '.webp'), json.load(open(A + 'w6/ledges.json'))['frames'], fam='w6built', home=6, data_file=('src/game/w6StiltArt.ts',),
           layer_of=lambda n: 'platform', slot=lambda n: f'other proto.stiltLedges (catalog-map W6 src/game/w6Stages.ts:656) look {n} (w6StiltArt.ts:55 SET_FRAMES/SET_FEET)',
           used='6-8 Stilt Climb (proto.stiltLedges: 56+4+4+1 W6)', made_of=lambda n: 'root' not in n,
           foot_of=lambda n, f: f'walkable top: ax {f.get("ax")}, ay {f.get("ay")} (ledges.json anchor = middle of the walkable top; SET_FEET)', on_of=lambda n, f: 300 if 'ledge' in n else 130,
           drawn='sheet')
gem = lambda rel: json.load(open(A + rel))['frames']
sheet_rows('w6to10/gemini/w6-hides-arches.webp', gem('w6to10/gemini/w6-hides-arches.json'), fam='w6swamp', home=6, data_file=('src/game/w6StiltArt.ts',),
           layer_of=lambda n: 'decor near', slot=lambda n: f'other proto.stilt {n} (catalog-map W6 src/game/w6Stages.ts:748; w6StiltArt.ts:18 STILT_FRAMES)', used='6-8 Stilt Climb',
           drawn='sheet', on_of=lambda n, f: 150)
for rel, nm in (('w6to10/props-made/w6var.webp', 'w6var'), ('w6to10/props-made/w6d.webp', 'w6d'), ('w6to10/props-made/w6c.webp', 'w6c')):
    fr = gem(rel.replace('.webp', '.json'))
    sheet_rows(rel, fr, fam='w6swamp', home=6, data_file=('src/game/w6StiltArt.ts',),
               layer_of=lambda n: ('platform' if re.search('branch|stump|bank|perch|arch|den|moss-log|^log', n) else 'step' if 'snapL' in n else 'decor near'),
               slot=lambda n, nm=nm: (f'W6 ledge look {n} (w6StiltArt.ts LEDGE_LOOKS: {nm}); proto.stiltLedges' if re.search('branch-b|stump-b|bank-b|root-arch|root-den|moss-log', n) else f'other proto.stilt {n} dressing (w6StiltArt.ts STILT_PROP_FRAMES)' if nm == 'w6c' else f'W6 {n} ({nm}; new slot if no draw)'),
               used='6-8 Stilt Climb (w6StiltArt.ts)', made_of=made, on_of=lambda n, f: 260 if re.search('bank|arch|den|log', n) else 160)
for rel in ('w6to10/props-made/w6balt.webp', 'w6to10/props-made/w6c-b.webp'):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam='w6swamp', home=6, data_file=('src/game/w6StiltArt.ts', 'src/game/w6PropsData.ts'), layer_of=layer_generic,
               slot=slot_generic(6, rel), used='', made_of=made, on_of=lambda n, f: 180)
sheet_rows('w6to10/gemini/w6a-puzzle.webp', FR['w6PropsData.W6_PUZZLE_FRAMES'], fam='w6built', home=6, data_file=('src/game/w6PropsData.ts',), layer_of=layer_generic,
           slot=slot_generic(6, 'w6a-puzzle (w6PropsData.ts:6)'), used='W6 puzzle rooms', made_of=made, on_of=lambda n, f: 110, drawn='sheet')
sheet_rows('w6to10/gemini/w6b-water-room-take2.webp', FR['w6PropsData.W6_WATER_FRAMES'], fam='w6built', home=6, data_file=('src/game/w6PropsData.ts',),
           layer_of=lambda n: 'platform' if n in ('raft', 'stone', 'seesaw') else 'soft landing' if n == 'lily-pads' else 'decor near',
           slot=lambda n: f'W6 water room {n} (w6PropsData.ts:9 W6_WATER_FRAMES)' + ('; drift log / lily pad collider' if n in ('raft', 'lily-pads') else ''),
           used='W6 water puzzle rooms', made_of=made, on_of=lambda n, f: 140, drawn='sheet')

# 5e. World 7
sheet_rows('w7/vine-anchors.webp', json.load(open(A + 'w7/vine-anchors.json'))['frames'], fam='w7ruin', home=7, data_file=('src/game/w7TempleArt.ts',),
           layer_of=lambda n: 'climb' if 'liana' in n else 'decor near', slot=lambda n: f'climbable vines swing_liana: W7 lintel/liana {n} (w7TempleArt.ts:17 drawW7SwingLiana)',
           used='W7 stages with swinging lianas (catalog-map swing_liana W7: 15)', made_of=lambda n: 'anchor' in n, drawn='sheet', on_of=lambda n, f: 140 if 'anchor' in n else 300)
sheet_rows('w7/temple-walls.webp', json.load(open(A + 'w7/temple-walls.json'))['frames'], fam='w7ruin', home=7, data_file=(), layer_of=lambda n: 'decor mid',
           slot=lambda n: 'W7 temple wall strip (temple-walls.json; replaced by temple-run.webp in w7TempleArt.ts:17)', used='', made_of=lambda n: True, on_of=lambda n, f: 540, drawn='sheet')
for rel, refs in (('w6to10/gemini/w7a-puzzle-take2.webp', 'w7PuzzleArt.ts:11'), ('w6to10/props-made/w7-plates.webp', 'w7PuzzleArt.ts:11')):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam='w7ruin', home=7, data_file=(), layer_of=layer_generic, slot=slot_generic(7, refs),
               used='W7 puzzle rooms (w7PuzzleArt.ts drawW7Piece)', made_of=lambda n: True, on_of=lambda n, f: 120, drawn='sheet')
for rel in ('w6to10/props-made/w7c.webp', 'w6to10/props-made/w7c-b.webp'):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam='w7ruin', home=7, data_file=(), layer_of=lambda n: 'decor mid' if n in ('fig-roots', 'sloth-statue') else 'decor near',
               slot=lambda n: f'W7 bank face dressing {n} (w7FaceArt.ts:13 drawW7Face) and gen2 w7 extras (gen2/worlds/w7.ts:17)', used='W7 stages (bank faces)',
               made_of=lambda n: n != 'fig-roots', on_of=lambda n, f: 180, drawn='sheet')
for rel in ('w6to10/props-made/w7b.webp', 'w6to10/props-made/w7var.webp'):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam='w7ruin', home=7, data_file=(), layer_of=layer_generic, slot=slot_generic(7, rel), used='',
               made_of=lambda n: not re.search('branch|stump|perch|snapL|bank', n), on_of=lambda n, f: 220)
# 7-4 flume (w7slide, flume-atlas.json via w7SlideAtlas.ts) and the slide's single images
for sh, v in FR['w7SlideAtlas.FLUME_SHEETS'].items():
    rel = f'w7slide/{sh}.webp'
    sheet_rows(rel, v, fam=lambda n: 'only' if sh == 'flume-pokey' else 'w7ruin', home=7, data_file=('src/game/w7SlideAtlas.ts',),
               layer_of=lambda n, sh=sh: 'character' if sh == 'flume-pokey' else ('danger look' if re.search('thorn|eyes|sign|stalac|spike|skull', n) else 'backdrop' if sh == 'flume-cave' else 'decor near'),
               slot=lambda n, sh=sh: f'7-4 flume {sh}.{n} (w7SlideArt.ts drawSlide)', used='7-4 slide', made_of=lambda n: bool(re.search('torch|lantern|sign|scaffold|rope', n)),
               on_of=lambda n, f: max(fxy(f)[2], fxy(f)[3]) * 0.6, drawn='sheet')
for f in sorted(os.listdir(A + 'w7slide')):
    if not f.endswith('.webp') or f.startswith('flume-'):
        continue
    p = A + 'w7slide/' + f
    W, H = img(p).size
    stem = f[:-5]
    lay = 'character' if 'pokey' in stem else 'danger look' if stem in ('obstacles', 'crumble') else 'backdrop'
    add(p, '', W, H, kind=f'7-4 slide {stem}', layer=lay, fam='only' if 'pokey' in stem else 'w7ruin', home=7, made=('chute' in stem or 'chamber' in stem),
        slot=f'7-4 slide piece {stem} (w7SlideArt.ts:27 U("{f}"))', footing='none (the chute floor is drawn under the slide line)' if 'floor' in stem else 'none',
        on=540, fx=(0, 0), used='7-4 slide')

# 5f. World 8
for nm, rel, ref in (('W8B', 'w6to10/props-made/w8b.webp', 'w8DecorData.ts:3'), ('W8C_A', 'w6to10/props-made/w8c.webp', 'w8DecorData.ts:5'),
                     ('W8C_B', 'w6to10/props-made/w8c-b.webp', 'w8DecorData.ts:7'), ('W8VAR', 'w6to10/props-made/w8var.webp', 'w8DecorData.ts:9'),
                     ('W8ROOST_B', 'w6to10/props-made/w8roost-b.webp', 'w8DecorData.ts:11')):
    sheet_rows(rel, FR['w8DecorData.' + nm], fam='w8night', home=8, data_file=('src/game/w8DecorData.ts',), layer_of=layer_generic,
               slot=lambda n, ref=ref: f'W8 decor {n} ({ref}; gen2/worlds/w8.ts:122-134 scenery sockets fungus/nest and W8_DECOR sets; drawn behind the boughs, w8DecorArt.ts)' + ('; roost_branch / fungus_shelf look' if re.search('roost|shelf-fungus', n) else ''),
               used='W8 gen2 stages (w8.ts scenery + decor)', made_of=made, on_of=lambda n, f: 120)
sheet_rows('w6to10/props-made/w8roost.webp', gem('w6to10/props-made/w8roost.json'), fam='w8night', home=8, data_file=('src/game/fruitbatAnimData.ts',), layer_of=layer_generic,
           slot=lambda n: f'W8 roost {n} (fruitbatAnimData.ts:13 W8ROOST: the fruit bat roost)', used='W8 stages with fruit bats', made_of=made, on_of=lambda n, f: 120)
sheet_rows('w6to10/props-made/w8fungus.webp', FR['w8FungusData.W8_FUNGUS_FRAMES'], fam='w8night', home=8, data_file=('src/game/w8FungusData.ts',),
           layer_of=lambda n: 'step', slot=lambda n: 'landing platforms solid fungus_shelf (catalog-map W8 src/game/gen2/pipeline.ts:728; w8FungusData.ts:2)',
           foot_of=lambda n, f: f'walkTop {f["walkTop"]} px from the frame top (w8FungusData.ts)', used='W8 fungus steps', on_of=lambda n, f: 110, drawn='sheet')
sheet_rows('w6to10/gemini/w8a-puzzle.webp', gem('w6to10/gemini/w8a-puzzle.json'), fam='w8night', home=8, data_file=(), layer_of=layer_generic,
           slot=slot_generic(8, 'w8RoomArt.ts:9 (gen2/worlds/w8Rooms.ts)'), used='W8 puzzle rooms', made_of=made, on_of=lambda n, f: 115, drawn='sheet')
sheet_rows('w8/lantern.webp', FR['w8LanternAtlas.LANTERN_FRAMES'], fam='w8night', home=8, data_file=('src/game/w8LanternAtlas.ts',),
           layer_of=lambda n: 'decor near', slot=lambda n: f'8-4 lantern run {n} (w8LanternRun.ts:21)', used='8-4', made_of=lambda n: 'jar' in n or 'gauge' in n, on_of=lambda n, f: 60, drawn='sheet')
sheet_rows('w8/pokey-jar.webp', FR['w8LanternAtlas.POKEY_JAR_FRAMES'], fam='only', home=8, data_file=('src/game/w8LanternAtlas.ts',), layer_of=lambda n: 'character',
           slot=lambda n: f'hero frame {n} with the jar (w8LanternRun.ts:45)', used='8-4', on_of=lambda n, f: 70, drawn='sheet')
rows[:] = [r for r in rows if not (r['file'] == A + 'w8/pokey-jar.webp')]  # the per-frame rows above replace the whole-image row

# 5g. Worlds 8-10 bank faces (props/faces810.webp, w810FaceData.ts)
for w, lst in FR['w810FaceData.FACE810_FRAMES'].items():
    for i, f in enumerate(lst):
        add(A + 'props/faces810.webp', f'w{w}-{i}', f['w'], f['h'], kind=f'W{w} bank face piece {i}', layer='decor mid', fam=FAMW[int(w)], home=int(w),
            slot=f'bank face (w810FaceArt.ts, FACE810_FRAMES[{w}][{i}])', footing='none: painted into the bank face, clipped to it', on=180, fx=(f['x'], f['y']),
            draw_ref='src/game/w810FaceArt.ts', used=f'W{w} stages (bank faces)')
for i, f in enumerate(FR['w810FaceData.FACE810_STONES']):
    add(A + 'props/faces810.webp', f'stone-{i}', f['w'], f['h'], kind=f'W8-10 face stone {i}', layer='decor mid', fam='w9volcano', home=9,
        slot=f'bank face stone (w810FaceArt.ts, FACE810_STONES[{i}])', footing='none: in the bank face', on=150, fx=(f['x'], f['y']), draw_ref='src/game/w810FaceArt.ts',
        used='W8-W10 stages (bank faces)')

# 5h. Worlds 9 and 10 (props-made, gemini) and the boss set pieces
for rel in ('w6to10/props-made/w9b.webp', 'w6to10/props-made/w9c.webp', 'w6to10/props-made/w9c-b.webp', 'w6to10/props-made/w9var.webp', 'w6to10/gemini/w9a-puzzle.webp'):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam='w9volcano', home=9, data_file=(), layer_of=layer_generic, slot=slot_generic(9, rel), used='',
               made_of=made, on_of=lambda n, f: 200)
sheet_rows('w6to10/gemini/w9w10-bridges.webp', gem('w6to10/gemini/w9w10-bridges.json'), fam='w10fort', home=10, data_file=(), layer_of=lambda n: 'platform',
           slot=lambda n: f'landing platforms solid canopy_bridge / log look: {n} (new slot)', used='', made_of=lambda n: n != 'charred-log', on_of=lambda n, f: 220,
           extra=[(9, 'ember slab and charred log for the volcano crossings'), (10, 'chain and ring planks for the fortress')])
for rel in ('w6to10/props-made/w10a.webp', 'w6to10/props-made/w10alt.webp', 'w6to10/props-made/w10b.webp', 'w6to10/props-made/w10var.webp', 'w6to10/gemini/w10c-set-dressing.webp'):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam='w10fort', home=10, data_file=(), layer_of=lambda n: 'decor near' if re.search('cage|spout', n) and 'w10alt' in rel or re.search('cage|spout', n) else layer_generic(n),
               slot=slot_generic(10, rel), used='', made_of=lambda n: not re.search('branch|stump|perch|bank|fill|buttress', n), on_of=lambda n, f: 200)
for rel in ('w6to10/props-made/w5a.webp', 'w6to10/props-made/w5a-b.webp', 'w6to10/props-made/w5b.webp', 'w6to10/props-made/w5var.webp', 'w6to10/props-made/w5web.webp'):
    sheet_rows(rel, gem(rel.replace('.webp', '.json')), fam=lambda n: 'w5silk' if re.search('web|cocoon|slack|billow|snap', n) else 'w5garden', home=5, data_file=(),
               layer_of=layer_generic, slot=slot_generic(5, rel), used='', made_of=made, on_of=lambda n, f: 400 if 'w5web' in rel else 200)
sheet_rows('w6to10/props/props.webp', json.load(open(A + 'w6to10/props/props.json'))['_atlas']['frames'],
           fam=lambda n: FAMW[int(re.match(r'w(\d+)', n).group(1))], home=7, data_file=(), layer_of=lambda n: 'climb' if re.search('vine|liana|chain', n) else 'platform',
           slot=lambda n: f'W{re.match(r"w(\d+)", n).group(1)} kit piece {n} (new slot: column/beam/bough/grate as a platform look)', used='',
           made_of=lambda n: not re.search('vine|liana|bough|burl|stump', n), on_of=lambda n, f: 220)
# fix home world per frame for props.webp (the frame names carry it)
for r in rows:
    if '/w6to10/props/props.webp#' in r['file']:
        w = int(re.match(r'w(\d+)', r['file'].split('#')[1]).group(1))
        made_t = r['made_thing'] == 'y'
        r['world_best'], r['worlds'], r['no_fit'] = fit_cols(FAMW[w], w, made_t)
        r['used_in'] = 'none (not imported)'
for nm, key, w, ref in (('boss-910', 'boss910Data.BOSS910', 9, 'boss910Data.ts'), ('boss-1010', 'boss1010Data.BOSS1010', 10, 'boss1010Data.ts')):
    p = A + f'bosses/{nm}.webp'
    for n, f in FR[key].items():
        x, y, fw, fh = fxy(f)
        lay = 'platform' if re.search('shelf|rib|crust|table$|battlement', n) else 'danger look' if re.search('lava|net|hedge', n) else 'decor near'
        add(p, n, fw, fh, kind=f'{nm} set piece {n}', layer=lay, fam='only', home=w, made=made(n), slot=f'{w}-10 boss set piece {n} ({ref} frame list)',
            footing='scan' if lay == 'platform' else 'none', on=max(fw, fh) * 0.5, fx=(x, y), scan=(True if lay == 'platform' else None),
            used=f'{w}-10 lair (frame list only)', status='needs fix: frame list in ' + ref + ' but no draw path imports ' + nm + '.webp (it does not ship): wire it or drop it [ready (in src/assets, not imported: does not ship)]')
p = A + 'bosses/boss-fx.webp'
for n, f in FR['bossFxData.BOSS_FX'].items():
    x, y, fw, fh = fxy(f)
    lay = 'danger look' if DANGER.search(n) or re.search('dust|cocoon|cattail|pole|rod', n) is None and DANGER.search(n) else ('danger look' if re.search('lava|bolt|storm|warn|spark|venom|vent|gust|flood|mudWave|screech|scorch|webSplat|silkBall|piranha|splash', n) else 'decor near')
    add(p, n, fw, fh, kind=f'boss/zone effect {n}', layer=lay, fam='only', home=9 if re.search('lava|vent|scorch', n) else 10 if re.search('bolt|storm|rod|pole|gust', n) else 9,
        made=made(n), slot=f'boss effect / W9-W10 zone piece {n} (bossFx.ts:15; bossFxData.ts BOSS_FX)', footing='none', on=max(fw, fh) * 0.4, fx=(x, y),
        draw_ref=(name_drawn(n, ('src/game/bossFxData.ts',)) or None), used='boss fights and W9/W10 zones (geyser, bolt)')

# 5i. w6to10 unwired Gemini sheets: story poses and secret-area kits
for rel, lay, fam, home in (('gemini/general-armour-off', 'character', 'only', 10), ('gemini/queen-collar-off', 'character', 'only', 5), ('gemini/river-king-peek', 'character', 'only', 6),
                            ('gemini/story18-squirrels', 'character', 'only', 6), ('gemini/story21-dot-flour', 'character', 'only', 7), ('gemini/pokey-climb-back', 'character', 'only', 8),
                            ('gemini/grandma-things', 'decor near', 'only', 10), ('gemini/w2-cages', 'danger look', 'only', 2),
                            ('gemini/secret-cracks', None, 'w7ruin', 7), ('gemini/secret-roots-glow-water', None, 'w8night', 8), ('gemini/secret-tunnel-kit', None, 'w7ruin', 7)):
    sheet_rows('w6to10/' + rel + '.webp', gem('w6to10/' + rel + '.json'), fam=fam, home=home, data_file=(),
               layer_of=(lambda n, lay=lay: lay) if lay else (lambda n: 'platform' if re.search('floor|ledge|shelf|pillar|stone', n) else 'danger look' if 'flooded' in n else 'decor near'),
               slot=(lambda n, rel=rel: f'story/cutscene pose (new slot: {rel})') if lay in ('character',) else slot_generic(home, rel),
               used='', made_of=made, on_of=lambda n, f: 150)
sheet_rows('w6to10/slide/pokey-slide-back.webp', json.load(open(A + 'w6to10/slide/pokey-slide-back.json'))['frames'], fam='only', home=7, data_file=(),
           layer_of=lambda n: 'character', slot=lambda n: 'slide pose from behind (new slot: 7-4 flume hero)', used='', on_of=lambda n, f: 70)
for rel in ('props/collar', 'props/guardiansfree'):
    sheet_rows('w6to10/' + rel + '.webp', json.load(open(A + 'w6to10/' + rel + '.json'))['_atlas']['frames'], fam='only', home=10, data_file=(),
               layer_of=lambda n: 'character' if 'free' in n else 'decor near', slot=lambda n, rel=rel: f'ending/boss-freed piece (new slot: {rel})', used='',
               made_of=lambda n: 'collar' in n, on_of=lambda n, f: 200)

# 5j. w6to10 lairs (backdrops of the W5-W10 boss fights) and lair plates
LJ = json.load(open(A + 'w6to10/lairs/lairs.json'))
for f in sorted(os.listdir(A + 'w6to10/lairs')):
    if not f.endswith('.webp'):
        continue
    p = A + 'w6to10/lairs/' + f
    W, H = img(p).size
    stem = f[:-5]
    boss = stem.split('-')[1] if '-' in stem else stem
    home = {'queen': 5, 'reaver': 6, 'golem': 7, 'monarch': 8, 'drake': 9, 'general': 10}.get(boss, 10)
    if stem.startswith('lairplates'):
        lp = json.load(open(A + 'w6to10/lairs/lairplates.json'))['seq'][boss]
        add(p, '', W, H, kind=f'lair plate clip {boss} ({lp["frames"]} frames, {lp["w"]}x{lp["h"]})', layer='backdrop', fam='only', home=home, slot=f'{home}-10 lair plate clip (lairplates.json; new slot)',
            on=540, used='', cost=f'1 blit a frame, {lp["frames"]}-frame clip sheet')
    else:
        add(p, '', W, H, kind=f'lair backdrop {stem}', layer='backdrop', fam='only', home=home, slot=f'{home}-10 lair back layer {stem} (lairArt.ts back; lairs.json)',
            footing='none: screen-space back layer', on=960, used=('5-10 Tarantula Queen (lairQueen.ts:48)' if boss == 'queen' else ''))
# 5k. w6to10 story pictures
for f in sorted(os.listdir(A + 'w6to10/story')):
    p = A + 'w6to10/story/' + f
    W, H = img(p).size
    add(p, '', W, H, kind=f'story picture {f[:-5]}', layer='ui', fam='story', home=6 if 'raft' in f or 'gorge' in f else 8, slot='story picture (new slot: story screens; storyHd.ts reads story/hd only)',
        footing='none', on=720, used='')

# 5l. creature and boss clip sheets (w6to10/creatures, w6to10/bosses): one row per atlas frame, from the frame list the game draws from
# (fruitbatAnimData.ts, sentryAnimData.ts) where there is one, else the sheet's own .json; each row names the clip(s) it plays in
ANIM = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
CREATURE = {'beetle': (9, 'enemy'), 'capuchin': (7, 'character'), 'crab': (6, 'enemy'), 'fruitbat': (8, 'enemy'), 'fruitbat-fly': (8, 'enemy'), 'fruitbat-w8': (8, 'enemy'),
            'howler': (7, 'character'), 'lavalizard': (9, 'enemy'), 'owl': (8, 'character'), 'piranha': (6, 'enemy'), 'sentry': (7, 'enemy'), 'soldier': (10, 'enemy'),
            'drake': (9, 'enemy'), 'golem': (7, 'enemy'), 'ironclaw': (10, 'enemy'), 'monarch': (8, 'enemy'), 'reaver': (6, 'enemy'), 'thornbark': (10, 'enemy')}
for sub in ('creatures', 'bosses'):
    for jf in sorted(os.listdir(A + f'w6to10/{sub}')):
        if not jf.endswith('.json'):
            continue
        nm = jf[:-5]
        d = json.load(open(A + f'w6to10/{sub}/{jf}'))
        sheets = [s_['file'] if isinstance(s_, dict) else s_ for s_ in d['sheets']]
        frames, seq, lst = d['frames'], d.get('seq', {}), f'{nm}.json'
        if nm in ANIM:
            frames, seq, lst = ANIM[nm]['frames'], ANIM[nm]['seq'], ANIM[nm]['ref']
        home, lay = CREATURE.get(nm, (8, 'enemy'))
        clips = {}
        for mv, ks in seq.items():
            for k in ks:
                clips.setdefault(k, []).append(mv)
        code = {'sentry': 'sentrySprite.ts:15 (7-5 Stone Sentries)', 'fruitbat': 'fruitbatAnimData.ts:4', 'fruitbat-fly': 'fruitbatAnimData.ts:9'}.get(nm, 'new slot: no sprite code reads it')
        on = 260 if sub == 'bosses' else 90
        for fn, f in frames.items():
            p = A + f'w6to10/{sub}/' + sheets[f.get('s', 0)]
            W, H = f['w'], f['h']
            shipref = ships(p)
            kn = area_kb(p, W, H)
            ship = min(max(W, H), 2 * on)
            mvs = clips.get(fn, [])
            fid = f'game/w6to10/{sub}/{nm}#{fn}'
            RECT[fid] = [p, f['x'], f['y'], W, H]
            rows.append({'id': fid, 'source': 'game:B2', 'file': f'{p}#{fn}',
                         'kind': f'{nm} frame {fn} (clip {", ".join(mvs) if mvs else "none: in the atlas, in no clip"}; frame list {lst})',
                         'w': W, 'h': H, 'walk_y': '', 'walk_x0': '', 'walk_x1': '', 'flat': '', 'float_class': 'flies' if re.search('bat|owl|monarch|fly', nm) else 'grounded',
                         'world_best': str(home), 'worlds': f'{home} its own creature (where it lives in the story)', 'no_fit': '; '.join(f'{w} not where it lives' for w in range(1, 11) if w != home),
                         'made_thing': 'n', 'engine_slot': ('enemy sprite ' if lay == 'enemy' else 'animal sprite ') + code,
                         'footing': f'anchor ax {f.get("ax")}, ay {f.get("ay")} (' + (d.get('anchor') if isinstance(d.get('anchor'), str) and d.get('anchor') != 'meta' else 'the feet') + ')',
                         'layer': lay, 'on_screen_px': on, 'ship_px': ship, 'file_kb_now': round(kn, 1), 'file_kb_ship': round(kn * (ship / max(W, H)) ** 2, 1),
                         'draw_cost': f'1 blit a frame, part of clip sheet {os.path.basename(p)}', 'used_in': code if shipref else 'none (not imported)',
                         'status': 'in game' if shipref else 'ready (in src/assets, not imported: does not ship)'})

# ---------------------------------------------------------------- overrides read from the code
for r in rows:
    if r['file'].endswith('w6balt.webp#gauge-post-b'):
        r['status'] = 'in game'; r['layer'] = 'decor near'
        r['engine_slot'] = 'other proto.stilt stilt: the stilt post under every 6-8 ledge, drawn by rect (w6StiltArt.ts:159 POST, :263 cap, :271 shaft tiled)'
        r['used_in'] = '6-8 Stilt Climb (proto.stilt stilt: 69 W6)'; r['draw_cost'] = '2+ blits (cap + shaft tiles), part of atlas w6balt.webp'

    if re.search(r'boss-fx\.webp#(dust|spark)\d', r['file']):
        r['status'] = 'in game'; r['used_in'] = 'every boss fight (bossArt.ts:999 drawFx(fxFrame(...)))'
        r['engine_slot'] = r['engine_slot'] + '; picked by bossFx.ts:104 fxFrame(base, u)'

# ---- calls made by looking at the contact sheets (master-sheets/b2/w<N>-<layer>.webp), Matt's bar: what looks standable must be
# standable, danger must look like danger, nothing angled sold as side-on
def fix(r, what):
    st = r['status']
    base = st[st.index('[') + 1:-1] if st.startswith('needs fix') else st
    prev = st[len('needs fix: '):st.index(' [')] + '; ' if st.startswith('needs fix') else ''
    r['status'] = f'needs fix: {prev}{what} [{base}]'
def note(r, what):
    r['footing'] = (r['footing'] + '; ' if r['footing'] else '') + what
LOOK = [
    (r'boss-910#crust0\d', dict(layer='danger look', footing='none: reads as molten lava (all orange), never a floor'), None),
    (r'boss-910#crust1\d', {}, 'half molten: reads hot; only as a crust that burns or breaks'),
    (r'boss-910#rib\d', dict(layer='decor mid', footing='none: a tall spire, no top to stand on', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'boss-910#shelf\d', {}, 'the hoard (coins, pot, chest) sits on the walk top: feet would stand in it; a set-piece top only'),
    (r'kits/w9#wall$', {}, 'FIX:angled: hex columns seen from above (3/4 view), stretched as a side-on bank face'),
    (r'w9b#hex-column', {}, 'glowing top reads hot: use only as a hot step'),
    (r'w9b#hot-platform', {}, 'lava pours off it: reads hot, use only where it burns or is timed'),
    (r'props#w9-stump-5', {}, 'FIX:a red flower stands on the walk top: the walk line found is the flower'),
    (r'props#w9-stump-17', dict(layer='decor near', footing='none: a broken snag, no flat top', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'kits/w10#(branch|branchCreak|snapL|snapR)$', {}, 'FIX:angled: an iron grate seen from above (3/4 view), drawn as a side-on bough'),
    (r'w9w10-bridges#plank-hanging', dict(layer='decor near', footing='none: hangs tilted from its ring (a swinging plank state)', walk_y='', flat='n'), None),
    (r'(w10b#iron-stair|w7b#steps)', dict(flat='n'), 'a stair: one walk line per tread, not one line'),
    (r'props#w10-post-', dict(layer='decor near', footing='none: a post', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'props#w10-netting-', dict(layer='danger look', footing='none: spiked netting'), None),
    (r'props#w10-grate-', dict(layer='decor near', footing='none: side-on it reads as a railing, not a floor', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'props#w10-stair-', {}, 'FIX:angled: stone stairs drawn in 3/4 view'),
    (r'secret-cracks#floor-broken', dict(layer='danger look', footing='none: a black hole in the floor (a pit)'), None),
    (r'w7b#push-block', {}, 'FIX:3/4 view: the scan finds the back edge of the top; the front-top edge must be set by hand'),
    (r'props#w7-block-5', {}, 'FIX:angled: a stone block seen from above (3/4 view)'),
    (r'w6c(-b)?#canoe', dict(layer='decor near', footing='none: sunk and tilted', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'w6c(-b)?#mooring-post', dict(layer='decor near', footing='none: a post', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'w6d#log$', {}, 'FIX:the frame holds a second piece (a stump at its right end): cut it apart'),
    (r'w6d#moss-log', {}, 'the frame holds a stump at its right; w6StiltArt LEDGE_LOOKS cuts at 0.735 to draw the log only'),
    (r'props#w8-burl-', {}, 'FIX:a flower stands on the walk top: the walk line found is the flower'),
    (r'kits/w5#(boulder|stump)$', {}, 'FIX:an orchid stands on the stump top, drawn as the W5 moss_stone rock: Pokey stands in the flower'),
    (r'(w5var#stump-b|w5a-b#mossy-log)', {}, 'FIX:flowers stand on the walk top; fine as dressing, not as a step'),
    (r'w5-props#(armchair)', dict(layer='danger look', engine_slot='W5 soft chair that tugs him (w5Kit.ts:117 Chair, :139 chairPull): a lure, comfy on purpose'), None),
    (r'w5-props#(wrapped|teaTable|doilyStool|fernStump)', dict(layer='decor near', footing='foot = frame bottom', walk_y='', walk_x0='', walk_x1='', flat=''), None),
    (r'w5-props#silkSheet', dict(layer='danger look', engine_slot='W5 silk sheet: lingering in front wraps him faster (w5Kit.ts:39)'), None),
    (r'#(fill|fills\d|fill-b)$', dict(layer='decor mid', footing='none: a soil fill tile (the body under a bank top), nothing stands on it', walk_y='', walk_x0='', walk_x1='', flat='', float_class='grounded (fill)'), None),
    (r'w10b#(crate|hanging-iron)', dict(layer='platform', footing='scan'), None),
    (r'(w\d+)#(end|ends\d)$', dict(kind='ground bank end (the soil edge where a bank stops)'), None),
]
for r in rows:
    tail = r['id'].split('/', 1)[1]
    for pat, sets, msg in LOOK:
        if re.search(pat, tail):
            for k, v in sets.items():
                if k == 'kind':
                    r['kind'] = r['kind'].split(' ground')[0] + ' ' + v
                elif k == 'footing' and v == 'scan':
                    p_, x_, y_, w_, h_ = RECT[r['id']]
                    wy, x0, x1, fl = footing_scan(p_, x_, y_, w_, h_)
                    r.update(walk_y=wy, walk_x0=x0, walk_x1=x1, flat=fl, footing=f'walk line y={wy} px from the frame top, x {x0}-{x1} (alpha scan of the painted top)')
                else:
                    r[k] = v
            if msg:
                if msg.startswith('FIX:'):
                    fix(r, msg[4:])
                else:
                    note(r, msg)
    if tail == 'w6to10/props-made/w6d#log':  # 'log' is quoted all over src: no draw path asks w6d for it (LEDGE_LOOKS takes moss-log)
        r['status'] = r['status'].replace('[in game]', '[ships, frame not drawn (no draw path names it)]')
        r['used_in'] = 'none (ships with w6d.webp, not drawn)'
# boss-fx is every boss's shared effects sheet (B4's): B2 keeps only its World 9/10 zone and hazard pieces
rows[:] = [r for r in rows if '/bosses/boss-fx#' not in r['id'] or re.search(r'#(lava\d|pole|rod(Lit|Dark)|bolt|storm\d|vent(Hot|Cool)|scorch)$', r['id'])]
for r in rows:
    if '/bosses/boss-fx#' in r['id']:
        w = 10 if re.search('pole|rod|bolt|storm', r['id']) else 9
        r['world_best'], r['worlds'], r['no_fit'] = fit_cols('only', w, r['made_thing'] == 'y')
        r['layer'] = 'danger look' if re.search('lava|bolt|storm|ventHot|scorch', r['id']) else 'decor near'

# ---------------------------------------------------------------- write
seen = set()
dups = []
for r in rows:
    if r['id'] in seen:
        dups.append(r['id'])
    seen.add(r['id'])
assert not dups, dups[:10]
for r in rows:
    for c in ('world_best', 'engine_slot', 'layer'):
        assert r[c] not in ('', None), (r['id'], c)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', newline='') as fh:
    wr = csv.DictWriter(fh, fieldnames=COLS)
    wr.writeheader()
    for r in sorted(rows, key=lambda r: r['id']):
        wr.writerow(r)
json.dump(RECT, open(os.path.join(os.path.dirname(__file__), 'rects.json'), 'w'))
print(len(rows), 'rows ->', OUT)
