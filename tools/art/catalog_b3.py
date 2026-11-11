"""catalog_b3: the art catalog's part B3, every painted backdrop the game ships (2026-11-11, packet CONTENT-ART-DIRECTOR-catalog).

Rows: every file in src/assets/backdrops (strip sets: sky, far, mid, near; the canopy and far-only variants; the Hollow, the council
garden, Dot's flight) and src/assets/lairs (the four lair plates of Worlds 1-4 and their foreground strips). World 5-10 lair plates
(src/assets/w6to10/lairs) and the 7-slide chute are part B2's.
Engine facts are read from the code: which stages draw a set comes from tools/art/backdrop_usage.ts (stageBackdrops.ts FAR_BY_STAGE,
w5Backdrop.ts, stageUsesCanopy, generateAllLevels); a lair that owns its scene (lairArt.ts lairOwnsScene) hides the world's strips, so
stage N-10 is left off its world's strips except World 9 (the Drake re-lights them). The tile-join check is tools/art/backdrop_seams.py.
  npx tsx tools/art/backdrop_usage.ts > /tmp/usage.json && python3 tools/art/catalog_b3.py /tmp/usage.json
"""
import csv, glob, json, os, re, subprocess, sys
from PIL import Image

USAGE = json.load(open(sys.argv[1]))['usage']
OUT = 'reference/art/catalog-game-B3.csv'
COLS = ['id', 'source', 'file', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'float_class', 'world_best', 'worlds', 'no_fit',
        'made_thing', 'engine_slot', 'footing', 'layer', 'on_screen_px', 'ship_px', 'file_kb', 'ship_kb', 'draw_cost', 'used_in', 'status']

WORLD = {1: 'Emerald Canopy (green jungle)', 2: 'Sunlit Riverbank (river village)', 3: 'Mossy Grotto (glowing caves)',
         4: 'Mist Cascades (cliffs, falls)', 5: 'Orchid Sanctuary (giant orchids)', 6: 'Deep Mangrove (swamp)',
         7: 'Ancient Ruins (stone temples)', 8: 'Twilight Treetops (night canopy)', 9: 'Volcanic Jungle (lava, ash)',
         10: 'Stormy Highlands (rain, fortress)'}
# what each world's backdrop must carry, so a painting without it does not fit there
NEEDS = {1: 'needs dense green jungle and no made things', 2: 'needs the river and its village', 3: 'needs a cave roof and glow',
         4: 'needs cliffs, falls and sea of mist', 5: 'needs giant orchids', 6: 'needs mangrove roots in still water',
         7: 'needs carved stone ruins', 8: 'needs high canopy in twilight or night', 9: 'needs lava, ash or a volcano',
         10: 'needs storm, rain and the fortress highlands'}

# stem: (what is painted, light, made_thing, [(other world, why it could be used there)])
S = {
 'w1': ('green rainforest, flat-topped trees, red mushrooms', 'day', 'n', [(8, 'a darker grade could pass as a lower canopy'), (6, 'jungle edge before the swamp')]),
 'w1b': ('green jungle with a long misty valley view', 'dawn', 'n', [(4, 'misty valley reads as the climb toward the cascades'), (2, 'valley before the river')]),
 'w1c': ('canopy: tall trunks with vines (mid), leafy crowns (near)', 'day', 'n', [(8, 'high canopy, regraded to dusk'), (5, 'canopy under the orchids')]),
 'w1kapok': ('kapok giant, green hills, rain haze', 'day', 'n', [(2, 'green hills toward the river'), (4, 'hill country under the falls')]),
 'w1rain': ('grey rain over giant trees', 'rain', 'n', [(10, 'grey rain is the highlands weather'), (6, 'wet grey swamp edge')]),
 'w1sun2': ('sunrise over teal hills, palms, sawn logs', 'dawn', 'n', [(2, 'dawn over the hills before the river'), (8, 'warm sky above the treetops')]),
 'w1sunrise': ('sunrise over green valley, logs, mushrooms', 'dawn', 'n', [(2, 'dawn valley'), (6, 'dim green floor')]),
 'w2': ('river village: treehouses, rope bridge, cattails', 'day', 'y', [(6, 'stilt huts read as the swamp edge'), (5, 'a village Dot passes')]),
 'w2evening': ('river village at sunset, lit windows', 'sunset', 'y', [(6, 'stilt village at dusk in the swamp'), (8, 'lit huts under the twilight')]),
 'w2mist': ('pink misty river, lily pads, cattails', 'sunset', 'n', [(6, 'still water and reeds'), (5, 'pink light suits the orchids')]),
 'w2rapids': ('waterfall and rapids, rocks', 'day', 'n', [(4, 'falls and rocks are the cascades'), (3, 'river into the grotto')]),
 'w3': ('glowing cave, dripping teal lights', 'cave', 'n', [(8, 'teal glow reads as fireflies at night'), (9, 'lava tube with a warmer grade')]),
 'w3cavern': ('deep cavern, root arches, teal glow', 'cave', 'n', [(8, 'glowing roots at night')]),
 'w3crystal': ('purple crystal cave', 'cave', 'n', [(5, 'violet light of the orchid twilight'), (9, 'obsidian crystals near the lava')]),
 'w3sinkhole': ('open sinkhole: blue sky over a cave mouth', 'day', 'n', [(4, 'cliff walls and sky'), (6, 'sunken swamp hole')]),
 'w4': ('grey cliffs, falls, mist sea', 'day', 'n', [(10, 'grey cliffs read as the highlands'), (7, 'cliffs around the ruins')]),
 'w4mist': ('sunset cliffs over a sea of mist, rock spire', 'sunset', 'n', [(9, 'red sky and dark spire read as volcanic'), (10, 'crag country')]),
 'w4storm': ('storm and lightning over cliffs and pines', 'storm', 'n', [(10, 'storm is the highlands weather')]),
 'w4terraces': ('sunny cliff terraces, rope bridge', 'day', 'y', [(7, 'terraced stone near the ruins'), (2, 'rope bridge like the village')]),
 'w5': ('gold light, giant orchids on trees', 'day', 'n', []),
 'w5dusk1': ('orchid trunks at pink dusk, spider silk', 'dusk', 'n', [(8, 'dusk canopy')]),
 'w5dusk2': ('orchid trunks, purple hills at dusk', 'dusk', 'n', [(8, 'purple dusk canopy')]),
 'w5gold2': ('golden orchid grove, path', 'day', 'n', [(1, 'gold forest floor; orchids too large for W1 rules on bloom size')]),
 'w5night': ('blue night orchids, moon, campfire', 'night', 'n', [(8, 'blue night trees')]),
 'w5twi1': ('violet twilight, orchids, silk', 'twilight', 'n', [(8, 'violet twilight canopy')]),
 'w5twi2': ('purple twilight, pale trees, orchids', 'twilight', 'n', [(8, 'purple twilight canopy')]),
 'w6': ('grey mangrove swamp, roots in water', 'overcast', 'n', [(1, 'dark wet jungle floor'), (10, 'grey wet light')]),
 'w6dawn': ('pink dawn over mangroves, stilt hut', 'dawn', 'y', [(2, 'stilt hut and still water')]),
 'w6dusk': ('teal dusk mangroves, lit hut, fireflies', 'dusk', 'y', [(8, 'night canopy with fireflies')]),
 'w6moon': ('blue moonlit mangroves', 'night', 'n', [(8, 'blue night treetops')]),
 'w7': ('ruins: stone head, temple, fallen columns', 'overcast', 'y', [(4, 'ruins on the cliffs'), (10, 'old stone below the fortress')]),
 'w7court': ('sunlit temple court, jungle', 'day', 'y', [(2, 'temple seen from the river'), (5, 'old garden stone')]),
 'w7dawn': ('ruins under a sunrise, tree roots', 'dawn', 'y', [(9, 'dark ruins with a hot sky')]),
 'w7dusk': ('ruins at green-gold dusk, columns', 'dusk', 'y', [(6, 'the 6-8 reveal already shows it from the swamp')]),
 'w8': ('moonlit giant treetops, white flowers', 'night', 'n', [(5, 'night flowers on big trees'), (6, 'night trees')]),
 'w8dawn': ('purple-orange sunrise over flat canopy', 'dawn', 'n', [(5, 'purple dusk palette'), (1, 'canopy top, if regraded green')]),
 'w8night': ('starry blue canopy, full moon', 'night', 'n', [(5, 'blue night like 5-M'), (6, 'moonlit trees')]),
 'w8sunset': ('sunset canopy with rock stacks', 'sunset', 'n', [(4, 'rock stacks over mist'), (9, 'rock stacks and red sky')]),
 'w9': ('volcanic ruins, smoke, lava cracks', 'smoke', 'y', [(7, 'burnt ruins'), (10, 'scorched highland')]),
 'w9ash': ('ash cloud, erupting volcano, dead trees', 'ash', 'n', [(10, 'grey sky and bare rock')]),
 'w9dawn': ('pink sky, volcano, lava field', 'dawn', 'n', [(4, 'distant peak over the mist')]),
 'w9night': ('red night eruption, lava', 'night', 'n', []),
 'w10': ('night storm, fortress ruins, broken fences', 'storm', 'y', [(4, 'stormy cliffs'), (9, 'burnt rock under rain')]),
 'w10after': ('the storm clearing (painted 11-01, waits for the rain to end)', 'clearing', 'y', [(4, 'clearing sky over crags')]),
 'w10dusk': ('gold dusk, fortress tower, fences', 'dusk', 'y', [(4, 'cliffs in gold light')]),
 'w10gale': ('blue gale over a chasm and rope bridge', 'storm', 'y', [(4, 'chasm and rope bridge over mist')]),
 'w10night': ('snow peak under clear stars (waits for the rain to end)', 'night', 'y', [(4, 'night peak over the mist')]),
 'w10storm': ('purple thunderstorm, mountains', 'storm', 'y', [(4, 'storm over peaks')]),
}
LIGHT_SKY = {}  # light -> worlds whose sets share that light (a sky alone moves more freely than its ground)
for st, (_, light, _, _) in S.items():
    LIGHT_SKY.setdefault(light, set()).add(int(re.match(r'w(\d+)', st).group(1)))

FIT = {'far': (1.2, 0.72, 0.6), 'mid': (1.0, 0.69, 0.58), 'near': (1.05, 0.72, 0.63)}
REF_VH = 1080  # a sideways phone, 1080 device rows (scenery.ts: strips are drawn at the sideways scale upright too)

seams = {}
for line in subprocess.run(['python3', 'tools/art/backdrop_seams.py'], capture_output=True, text=True, check=True).stdout.splitlines()[1:]:
    f, m, c = line.split(',')
    seams[f] = (float(m), float(c))

# what Matt sees, looked at on the contact sheets (reference/art/master-sheets/B3-*.webp), beyond the measured joins
LOOKED = {
    'w1sunrise-far.webp': 'needs fix: white blob fragments at the treeline (the old orchid remnants the 11-05 note named) and a 12.9 colour step at the tile join; 1-3 still plays it',
    'w1sunrise-mid.webp': 'needs fix: cut trunk named 11-05, plus a hard vertical cut at the tile join (19% of rows paint on one edge, clear on the other)',
    'w10after-far.webp': 'ready (unused): waits for the rain to end with the storm (stageBackdrops.ts note); far only, no sky/mid/near',
}


def kb(f):
    return round(os.path.getsize(f) / 1024)


def stages_for(stem):
    u = USAGE.get(stem, {})
    return [s for s in u.get('stem', []) if not (s.endswith('-10') and not s.startswith('9-'))]


rows = []
files = sorted(glob.glob('src/assets/backdrops/*.webp')) + sorted(glob.glob('src/assets/lairs/*.webp'))
for f in files:
    base = os.path.basename(f)
    name = base[:-5]
    im = Image.open(f)
    w, h = im.size
    r = dict.fromkeys(COLS, '')
    r.update(id=f'B3-{name}', source='game:src/assets', file=f, w=w, h=h, walk_y='-', walk_x0='-', walk_x1='-', flat='-',
             float_class='backdrop (no collision)', file_kb=kb(f), ship_kb=kb(f))
    m = re.match(r'^(w\d+[a-z0-9]*)-(far|mid|near|sky)$', name)
    status = 'in game'
    if m:
        stem, part = m.groups()
        world = int(re.match(r'w(\d+)', stem).group(1))
        desc, light, made, could = S[stem]
        canopy = stem.endswith('c') and stem[:-1] == f'w{world}'
        kind_set = 'canopy set' if canopy else ('world set' if stem == f'w{world}' else 'stage set')
        r['kind'] = f'backdrop {part} strip ({kind_set}): {desc}'
        r['layer'] = 'backdrop'
        r['made_thing'] = made
        # where it can go: its own world first, then the worlds it could serve
        if part == 'sky':
            others = sorted(LIGHT_SKY.get(light, set()) - {world})
            could_w = [(o, f'{light} sky matches that world\'s {light} sets') for o in others]
            could_w += [(o, why) for o, why in could if o not in others]
        else:
            could_w = could
        if made == 'y':
            could_w = [(o, why) for o, why in could_w if o != 1]
        r['world_best'] = world
        r['worlds'] = '; '.join([f'{world} its own painting ({WORLD[world]})'] + [f'{o} {why}' for o, why in could_w])
        named = {world} | {o for o, _ in could_w}
        r['no_fit'] = '; '.join(f'{o} {"made thing, never W1" if (o == 1 and made == "y") else NEEDS[o]}' for o in range(1, 11) if o not in named)
        # engine slot and line, from the code
        src = ('paintedBackdrops.ts:257 canopyUrl (stageUsesCanopy, line 167)' if canopy else
               'paintedBackdrops.ts:55 urlFor, ' + ('world set' if stem == f'w{world}' else
               'World 5 light set, w5Backdrop.ts:21' if world == 5 else 'far-only set, stageBackdrops.ts:15 FAR_BY_STAGE'))
        if part == 'sky':
            r['engine_slot'] = f'paintedBackdrops.ts strip sky of set {stem} ({src}); drawn above the far strip upright only, scenery.ts:1849 drawStrip `above`, SKY_OVERLAP 0.05'
            r['footing'] = f'none (backdrop); its bottom {round(0.05 * 1302)} rows lie over the far strip top and fade into it (SKY_OVERLAP)'
            far_h = 1302
            dh = REF_VH * 1.2 * h / far_h
        else:
            k, a, at = FIT[part]
            grow = 1.75 if (world == 7 and part == 'near' and not canopy) else 1
            slot = {'far': 'far (par 0.05)', 'mid': 'mid (par 0.2)', 'near': 'near (par 0.42)'}[part]
            r['engine_slot'] = f'paintedBackdrops.ts strip {part} of set {stem} ({src}); scenery.ts:1849 drawStrip {slot}, STRIP_FIT {part} k={k} a={a} at={at}' + (', STRIP_GROW x1.75 (scenery.ts:1842)' if grow > 1 else '')
            r['footing'] = f'none (backdrop); land line row {round(a * h)} of {h} (STRIP_FIT.{part}.a={a}) set at {at} of view height, just above the ground Pokey runs on'
            dh = REF_VH * k * grow
        dw = w * dh / h
        r['on_screen_px'] = f'{round(dw)}x{round(dh)} per repeat @1080-row sideways phone ({dh / h:.2f}x file)'
        r['ship_px'] = f'{w}x{h} (keep: under 2x on screen' + (')' if h <= 2 * dh else '; over 2x, shrink)')
        r['draw_cost'] = 'one blit per repeat, resampled once to a device-size fit (scenery.ts makeFit, PERFORMANCE-RULES §2.1); decoded with its set, at most 2 worlds x 2 sets kept (KEEP_WORLDS)'
        # used in
        used = []
        if canopy:
            used = [s for s in USAGE.get(stem, {}).get('canopy', [])]
            if part == 'mid':
                used += ['HowToPlay journal tiles (HowToPlay.tsx:28)', 'journal scenes (journalScenes.ts:62)']
        else:
            used = stages_for(stem)
            if part in ('mid', 'near') and stem == f'w{world}':
                # a far-only set that has no strip of its own borrows the world's
                for st2 in S:
                    if st2 != stem and re.match(rf'w{world}[a-z]', st2) and not os.path.exists(f'src/assets/backdrops/{st2}-{part}.webp') \
                            and os.path.exists(f'src/assets/backdrops/{st2}-far.webp') and stages_for(st2):
                        used += [f'{s} (borrowed by {st2})' for s in stages_for(st2)]
            if stem == 'w7dusk' and part in ('far', 'sky') or (stem == 'w7' and part in ('mid', 'near')):
                used.append('6-8 reveal at the top of the climb (w6Stages.ts:818)')
            if stem == f'w{world}':
                used += ['title scene (TitleScene.tsx:35)'] if part != 'sky' else []
                used += ['world map vistas (scenery.ts paintedFor)']
                if part == 'far':
                    used.append('satchel creatures tab (CreaturesTab.tsx:18)')
            if stem == 'w5night':
                used = ['5-M Meeca\'s night (w5Backdrop.ts:52)']
        r['used_in'] = '; '.join(used) if used else 'none'
        if not used:
            status = 'ready (unused): ' + ('waits for the rain to end with the storm (stageBackdrops.ts:42-45 note)' if stem.startswith('w10') else 'no stage names it')
        mis, step = seams.get(base, (0, 0))
        if mis >= 0.06:
            status = f'needs fix: hard vertical cut at the tile join ({mis:.0%} of rows paint on one edge, clear on the other: a tree or canopy chopped off at every repeat; re-run strip-seamless with a wider crossfade or mask the edge)'
        if base in LOOKED:
            status = LOOKED[base] if not status.startswith('needs fix') or LOOKED[base].startswith('needs fix') else status + '; ' + LOOKED[base]
    else:
        r['layer'] = 'backdrop'
        r['ship_px'] = f'{w}x{h} (keep)'
        r['draw_cost'] = 'one blit per frame (screen-space plate), loaded with its stage (trackAtlas)'
        spec = {
            'dot-far-1': ('Dot flight far: misty chasm, tower, rope net', 4, 'y', 'dotFlightArt.ts:75 BACK_URL far1', 'Dot\'s flight (4-5 to 4-6 extra stage)', [(10, 'tower on a crag, chasm')]),
            'dot-far-2': ('Dot flight far: chasm, tower, iron netting bridge', 4, 'y', 'dotFlightArt.ts:76 BACK_URL far2', 'Dot\'s flight (4-5 to 4-6 extra stage)', [(10, 'tower on a crag, chasm')]),
            'dot-near-1': ('Dot flight near: heliconia, fuchsia, net, rainbow', 4, 'y', 'dotFlightArt.ts:77 BACK_URL near1', 'Dot\'s flight (4-5 to 4-6 extra stage)', [(5, 'big flowers')]),
            'dot-near-3': ('Dot flight near: flowers, net, sun rays', 4, 'y', 'dotFlightArt.ts:78 BACK_URL near3', 'Dot\'s flight (4-5 to 4-6 extra stage)', [(5, 'big flowers')]),
            'hollow': ('Venom Fang lair: inside a strangler fig, glowing mushrooms', 1, 'n', 'lairVenom.ts:18 HOLLOW_URL, floor at 0.82 (HOLLOW_FLOOR)', '1-10 (lair owns its scene)', [(3, 'glowing mushroom room'), (8, 'green twilight')]),
            'w5arena-table': ('council garden: lace table, Iron-Claw\'s chair', 5, 'y', 'w5Art.ts:255 W5_ARENA_URL.table, floor 0.84', '5-10 fight (Queen lair owns its scene)', []),
            'w5arena-webs': ('council court under the web canopy, tea', 5, 'y', 'w5Art.ts:256 W5_ARENA_URL.webs, floor 0.84', '5-10 intro and tea scene', []),
            'fg-croc': ('Croc lair foreground: Spanish moss above, reeds below', 2, 'n', 'lairCroc.ts:39 LairStrip split 288/570', '2-10 (lair owns its scene)', [(6, 'moss and reeds in the swamp')]),
            'fg-sov': ('Sovereign lair foreground: grass, rocks, feathers', 4, 'n', 'lairSovereign.ts:100 LairStrip', '4-10 (lair owns its scene)', [(10, 'wind-blown grass')]),
            'lair-croc-calm': ('Croc lair: moonlit river, lantern', 2, 'n', 'lairCroc.ts:27 LairPlate calm, floorAt 0.86', '2-10', [(6, 'night swamp river')]),
            'lair-croc-rage': ('Croc lair flooded: churning river, eyes', 2, 'n', 'lairCroc.ts:28 LairPlate rage, floorAt 0.86', '2-10 (from a third of his strength)', [(6, 'flooded swamp')]),
            'lair-sov-calm': ('Sovereign lair: sunset crags, falls, rope bridge', 4, 'y', 'lairSovereign.ts:92 LairPlate calm, floorAt 0.9', '4-10', [(10, 'crags at dusk')]),
            'lair-sov-rage': ('Sovereign lair in storm: lightning, rain', 4, 'y', 'lairSovereign.ts:93 LairPlate rage, floorAt 0.9', '4-10 (rage phase)', [(10, 'storm crags')]),
            'prowler-lair': ('Prowler lair: cave, light shafts, glowing mushrooms', 3, 'n', 'lairProwler.ts:21 LAIR_URL', '3-10 (lair owns its scene)', [(8, 'night glow')]),
        }[name]
        desc, world, made, slot, used, could = spec
        r['kind'] = f'backdrop plate: {desc}' if not name.startswith('fg-') else f'backdrop foreground strip: {desc}'
        r['world_best'] = world
        r['made_thing'] = made
        r['worlds'] = '; '.join([f'{world} its own scene ({WORLD[world]})'] + [f'{o} {why}' for o, why in could])
        named = {world} | {o for o, _ in could}
        r['no_fit'] = '; '.join(f'{o} {"made thing, never W1" if (o == 1 and made == "y") else "a one-off scene painted for " + str(world) + ", " + NEEDS[o]}' for o in range(1, 11) if o not in named)
        r['engine_slot'] = slot
        fl = re.search(r'(?:floor|floorAt) (?:at )?([0-9.]+)', slot)
        r['footing'] = f'none (backdrop); floor line row {round(float(fl.group(1)) * h)} of {h} set on the game floor' if fl else 'none (backdrop)'
        if name.startswith('fg-'):
            r['layer'] = 'decor near'
            r['on_screen_px'] = 'about 230 rows tall (lairCroc.ts:101) x its width' if name == 'fg-croc' else f'{w}x{h} band along the bottom'
        else:
            s = max(2400 / w, 1080 / h)
            r['on_screen_px'] = f'about {round(w * s)}x{round(h * s)} (cover-fit, 2400x1080 sideways view)'
        r['used_in'] = used
        if name.startswith('dot-') or name == 'hollow' or name == 'prowler-lair':
            r['ship_px'] += '; drawn above file size on a 2400-wide phone (soft): a bigger repaint would sharpen it' if 2400 / w > 1.3 else ''
    r['status'] = status
    rows.append(r)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', newline='') as fh:
    wr = csv.DictWriter(fh, COLS)
    wr.writeheader()
    wr.writerows(rows)
print(OUT, len(rows), 'rows')
