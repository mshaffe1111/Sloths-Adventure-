#!/usr/bin/env python3
"""
ART-CAT PART B1 (2026-11-11): the master catalog's rows for every World 1-4 prop, dressing, hazard and kit image the game ships, the
shared stage sheets (stage-art, bounce, puzzle kit, rope kit, Dot's flight props, flora) and the 18 pieces of 1-1's atlas (w1-cut).

  B1_SCRATCH=<dir with frames.json, misc.json, inv.json, artuse.json>  python3 reference/art/master-sheets/b1/build_b1.py

Inputs (all read from the game, never typed): frames.json (dump_frames.mts: every atlas frame list), misc.json (stage ids, the flora
lists per world), inv.json (tools/engine/inventory.ts run today: which stage lays which key), artuse.json (tools/art/artuse.mjs: frames
with no draw site), the art-director manifest (git show origin/art-director:reference/art/cut/manifest.json > manifest.json).
Writes reference/art/catalog-game-B1.csv, the per-world-and-layer contact sheets in this folder, and b1-checks.json (the automatic
looks: pink key left in, cut off at the cell edge, duplicate frames).
"""
import csv, hashlib, io, json, math, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b1_frames import rows as FRAMES, R, S
from PIL import Image

OUT = f'{R}/reference/art/catalog-game-B1.csv'
SHEETS = f'{R}/reference/art/master-sheets/b1'
MISC = json.load(open(f'{S}/misc.json'))
INV = json.load(open(f'{S}/inv.json'))
UNUSED = {(os.path.basename(x['file']), x['key']) for x in json.load(open(f'{S}/artuse.json'))}
MAN = {p['file'].rsplit('.', 1)[0]: p for p in json.load(open(f'{S}/manifest.json'))['pieces']}
STAGES = MISC['stages']
WN = {1: 'Emerald Canopy', 2: 'Sunlit Riverbank', 3: 'Mossy Grotto', 4: 'Mist Cascades', 5: 'Orchid Sanctuary', 6: 'Deep Mangrove',
      7: 'Ancient Ruins', 8: 'Twilight Treetops', 9: 'Volcanic Jungle', 10: 'Stormy Highlands Fortress'}
COLS = ['id', 'source', 'file', 'kind', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'flat', 'float_class', 'world_best', 'worlds', 'no_fit',
        'made_thing', 'engine_slot', 'footing', 'layer', 'on_screen_px', 'ship_px', 'file_kb', 'file_kb_ship', 'draw_cost', 'used_in', 'status']

# ---------------------------------------------------------------- world fit by material (best first, each "N reason")
FIT = {
    'mossrock': [(1, 'green moss on grey stone: the home forest floor'), (3, '~cool-dark: grotto stone re-tinted'), (4, '~slate: cliff stone of the cascades'),
                 (6, '~grey-wet: mangrove root rock'), (7, '~sand-stone: ruin rubble'), (2, 'river-bank boulder, moss trimmed')],
    'greyrock': [(4, 'slate-blue cliff rock: the cascades'), (10, 'grey highland rock under the fortress'), (3, '~cool-dark: grotto rock'),
                 (7, '~sand-stone: ruin rubble'), (6, '~grey-wet: wet mangrove rock')],
    'glowstone': [(3, 'teal glow seams: the grotto'), (8, '~blue-night: glow stone in the night canopy')],
    'wood': [(1, 'bark, moss and roots: the home forest'), (6, '~grey-wet: mangrove wood'), (8, '~blue-night: night canopy wood'),
             (2, 'driftwood on the river bank'), (5, '~orchid: garden wood with blooms'), (3, '~cool-dark: roots in the grotto')],
    'made_wood': [(2, 'the river village: built from boards, rope and wicker'), (10, 'the fortress camp: built timber'),
                  (6, '~grey-wet: stilt-village boards'), (7, 'old scaffolding in the ruins'), (8, '~blue-night: canopy walkways')],
    'made_stone': [(7, 'carved stone: the ancient ruins'), (3, 'old carved stone in the grotto'), (10, 'fortress masonry'), (4, 'cut stone by the falls')],
    'river': [(2, 'reeds, lilies and river water: the riverbank'), (6, 'swamp water and reeds of the mangrove'), (5, 'garden pond')],
    'cave': [(3, 'glow life of the grotto'), (8, 'glow life of the night canopy')],
    'forest_plant': [(1, 'green rainforest growth: the home forest'), (5, 'lush garden growth'), (8, '~blue-night: canopy growth'), (6, 'wet green growth'),
                     (2, 'bank-side growth'), (3, '~cool-dark: grotto ferns')],
    'flower': [(5, 'bright blooms: the orchid sanctuary'), (1, 'rainforest blooms'), (8, 'night blooms'), (2, 'bank flowers')],
    'highland': [(4, 'mist, wind, feathers and slate: the cascades'), (10, 'wind-swept highland'), (9, '~ash: volcanic slope'), (7, 'wind-worn ruin top')],
    'water_fall': [(4, 'falling water and mist: the cascades'), (3, 'grotto trickle and pool'), (6, 'mangrove water'), (2, 'river water')],
    'soil': [],  # per world: the world's own tinted soil
    'stage_ui': [(n, 'the same piece in every stage (one look game-wide)') for n in range(1, 11)],
    'pokey': [(n, 'Pokey himself: every world') for n in range(1, 11)],
    'dot_flight': [(4, '4-D Dot\'s flight: the bridge and netting gauntlet'), (5, 'blooms and silk: the orchid sanctuary (5 webs use dot-props)'),
                   (8, 'night canopy blooms'), (10, 'chains and netting: the fortress')],
}
NOFIT_WHY = {
    'mossrock': 'warm green moss reads wrong there', 'greyrock': 'cold slate reads wrong there', 'glowstone': 'teal glow belongs underground or at night',
    'wood': 'its bark and moss read wrong there', 'made_wood': 'built wood', 'made_stone': 'carved stone has no place there',
    'river': 'no river life there', 'cave': 'glow life belongs in the dark', 'forest_plant': 'green forest growth reads wrong there',
    'flower': 'bright blooms read wrong there', 'highland': 'mist and slate read wrong there', 'water_fall': 'no falling water there',
    'dot_flight': 'made for Dot\'s flight set', 'soil': 'each world has its own soil',
}
NOFIT_SPECIAL = {9: 'lava and ash world: black rock, red glow', 10: 'stone-and-iron fortress', 7: 'sand-stone ruins', 3: 'dark grotto',
                 5: 'flower garden', 2: 'river village', 6: 'grey-wet mangrove', 8: 'blue night', 4: 'slate and mist', 1: 'green home forest'}


def worlds_for(mat, used, made, own=None, extra=None):
    """worlds text (USED ... | COULD ...), world_best, no_fit; a made thing never fits W1 (Matt, 11-11)"""
    fit = list(FIT.get(mat, []))
    if own:
        why = dict(fit).get(own, f'painted for World {own}')
        fit = [(own, why)] + [x for x in fit if x[0] != own]
    if extra:
        fit = [x for x in extra] + [x for x in fit if x[0] not in {e[0] for e in extra}]
    if made:
        fit = [x for x in fit if x[0] != 1]
    used = sorted(set(used))
    fitd = dict(fit)
    order = [w for w in used] + [w for w, _ in fit if w not in used]
    best = next((w for w in order if not (made and w == 1)), '')  # (a made thing's best world is never W1, even where it is laid there today)
    u = '; '.join(f'{w} {fitd.get(w, "laid there today")}' for w in used)
    c = '; '.join(f'{w} {why}' for w, why in fit if w not in used)
    txt = (f'USED {u}' if u else 'USED none') + (f' | COULD {c}' if c else '')
    nf = []
    for w in range(1, 11):
        if w in fitd or w in used:
            continue
        if made and w == 1:
            nf.append('1 made thing: never W1 (Matt, 11-11)')
        else:
            nf.append(f'{w} {NOFIT_WHY.get(mat, "does not belong")} ({NOFIT_SPECIAL[w]})')
    return txt, best, '; '.join(nf)


# ---------------------------------------------------------------- used_in from today's stages
def inv_stages(arrs, key):
    out = set()
    for r in INV['rows']:
        if r['arr'] in arrs and r['key'] == key:
            out |= set(r['stageList'])
    return sorted(out, key=lambda s: (int(s.split('-')[0]), s))


def world_stages(w):
    return [s for s in STAGES if s.split('-')[0] == str(w)]


def wsets(st):
    return sorted({int(s.split('-')[0]) for s in st})


def fmt_stages(st):
    return ' '.join(st) if st else 'none'


# ---------------------------------------------------------------- the picture: footing, checks
CACHE = {}


def crop(r):
    if r['file'] not in CACHE:
        CACHE[r['file']] = Image.open(f"{R}/{r['file']}").convert('RGBA')
    f = r['rect']
    return CACHE[r['file']].crop((int(f['x']), int(f['y']), int(f['x'] + f['w']), int(f['y'] + f['h'])))


def measure_footing(im):
    """the walk line: the first row where most of the middle half is solid; its solid span a few px lower; and how flat the top is"""
    a = im.getchannel('A')
    w, h = im.size
    px = a.load()
    x0, x1 = w // 4, 3 * w // 4
    walk = None
    for y in range(h):
        n = sum(1 for x in range(x0, x1) if px[x, y] > 128)
        if n >= 0.55 * (x1 - x0):
            walk = y
            break
    if walk is None:
        return None
    yy = min(h - 1, walk + 4)
    xs = [x for x in range(w) if px[x, yy] > 128]
    # (flatness: the spread of the top edge over the solid span, as a share of the span)
    tops = []
    for x in range(xs[0], xs[-1] + 1, max(1, (xs[-1] - xs[0]) // 40 or 1)):
        for y in range(h):
            if px[x, y] > 128:
                tops.append(y)
                break
    m = sum(tops) / len(tops)
    sd = math.sqrt(sum((t - m) ** 2 for t in tops) / len(tops))
    return walk, xs[0], xs[-1], round(sd / max(1, xs[-1] - xs[0]), 3)


def checks(im):
    """automatic looks: pink key left in (bright magenta pixels), cut off at the cell edge (solid pixels along an edge)"""
    w, h = im.size
    d = im.load()
    pink = 0
    step = max(1, int(math.sqrt(w * h / 40000)))
    tot = 0
    for y in range(0, h, step):
        for x in range(0, w, step):
            r, g, b, a = d[x, y]
            if a > 200:
                tot += 1
                if r > 200 and b > 170 and g < 90:
                    pink += 1
    edges = {}
    for name, coords in (('top', [(x, 0) for x in range(w)]), ('bottom', [(x, h - 1) for x in range(w)]),
                         ('left', [(0, y) for y in range(h)]), ('right', [(w - 1, y) for y in range(h)])):
        n = sum(1 for p in coords if d[p][3] > 200)
        edges[name] = round(n / len(coords), 2)
    return round(pink / max(1, tot), 4), edges


def phash(im):
    return hashlib.md5(im.resize((24, 24)).tobytes()).hexdigest()


# ---------------------------------------------------------------- per-atlas rules (read from the code that draws each sheet)
K = lambda **k: k
RULE = {
    'w1-cut': K(src='w1-cut atlas (art-director manifest gemini-2026-11-05)', layer='platform', mat='mossrock', draw='src/game/w1CutArt.ts:120 drawCutArt',
                slot='landing platforms solid moss_stone (pickCut stone: h 30-140, w<=260; stump: h>90 and w<150) w1CutArt.ts:105-106', fl='grounded',
                used=['1-1'], note='gen2 1-1 only (Platform.cut, gen2/worlds/w1.ts w1Finish)'),
    'w1-new': K(src='w1-new atlas (W1-4 art rounds, cut 2026-11-01)', layer='decor near', mat='wood', draw='src/game/w1NewArt.ts:104 drawW1Dress (one blit, behind Pokey)',
                slot='proto.mixDress (1-1 start: the squirrels) w1NewArt.ts:104', fl='grounded'),
    'w2-new': K(src='w2-new atlas (W1-4 art rounds, cut 2026-11-01)', layer='decor near', mat='made_wood', own=2, draw='none: no code loads w2-new.webp (not in the build)',
                slot='new slot: World 2 river props (no loader)', fl='grounded'),
    'w3-new': K(src='w3-new atlas (W1-4 art rounds, cut 2026-11-01)', layer='decor near', mat='glowstone', own=3, draw='none: no code loads w3-new.webp (not in the build)',
                slot='new slot: World 3 grotto props (no loader)', fl='grounded'),
    'w4-new': K(src='w4-new atlas (W1-4 art rounds, cut 2026-11-01)', layer='decor near', mat='highland', own=4, draw='none: no code loads w4-new.webp (not in the build)',
                slot='new slot: World 4 cascades props (no loader)', fl='grounded'),
    'proto': K(src='World 1 kit (proto/props-atlas, Matt\'s W1 prop sheet)', layer='platform', mat='wood', own=1, draw='src/game/protoArt.ts:259 blit (part of proto/props-atlas)',
               slot='kit:1 (protoArt.ts kitUrl:93; every World 1 stage, and the borrowed liana)', fl='may float'),
    'proto2': K(src='World 1 second sheet (proto/props2-atlas)', layer='decor near', mat='forest_plant', own=1, draw='src/game/protoArt.ts:106 PROTO2_URL (blit2)',
                slot='props2: proto.bushes / proto.hollows / proto.trunks (stageSheets.ts STAGE_DRAWS)', fl='grounded'),
    'proto3': K(src='World 1 chase sheet (proto/props3-atlas)', layer='danger look', mat='wood', own=1, draw='src/game/protoArt.ts:193 drawChaseSection (props3, the falling branch of 1-8)',
                slot='platforms solid chase / chaseTip (protoStage.ts:6779, 1-8\'s long branch)', fl='may float'),
    'crown': K(src='World 1 crown (proto/crown.webp)', layer='platform', mat='wood', own=1, draw='src/game/protoArt.ts:218 drawCrownArt (one blit)',
               slot='platforms solid crown (protoStage.ts:6800)', fl='may float'),
    'kit2': K(src='World 2 kit (kits/w2.webp, Matt\'s per-world prop sheet)', layer='platform', mat='made_wood', own=2, draw='src/game/protoArt.ts:259 blit (part of kits/w2)',
              slot='kit:2 (protoArt.ts kitUrl:93)', fl='may float'),
    'kit3': K(src='World 3 kit (kits/w3.webp)', layer='platform', mat='glowstone', own=3, draw='src/game/protoArt.ts:259 blit (part of kits/w3)',
              slot='kit:3 (protoArt.ts kitUrl:93)', fl='may float'),
    'kit4': K(src='World 4 kit (kits/w4.webp)', layer='platform', mat='greyrock', own=4, draw='src/game/protoArt.ts:259 blit (part of kits/w4)',
              slot='kit:4 (protoArt.ts kitUrl:93)', fl='may float'),
    'w2props': K(src='World 2 props (props/w2-props.webp, HF)', layer='decor near', mat='made_wood', own=2, draw='src/game/riverArt.ts:59 drawW2Piece (part of w2-props)',
                 slot='proto.decor (W2 hand-built stages, riverArt.ts:191 drawW2Decor)', fl='grounded'),
    'w3props': K(src='World 3 props (props/w3-props.webp, HF)', layer='decor near', mat='glowstone', own=3, draw='src/game/w3Art.ts:82 drawW3Decor (part of w3-props)',
                 slot='proto.w3decor (W3 stages, w3Art.ts:82)', fl='grounded'),
    'w4props': K(src='World 4 props (props/w4-props.webp, HF)', layer='decor near', mat='highland', own=4, draw='src/game/w4Art.ts:41 drawW4 (part of w4-props)',
                 slot='W4 set pieces (w4Play.ts, w4Nests.ts, sovereignArt.ts call drawW4)', fl='grounded'),
    'w4grit': K(src='World 4 grit (props/w4-grit.webp, HF img2img of W4 rocks)', layer='danger look', mat='greyrock', own=4, draw='src/game/w4Grit.ts:418 drawGritBit / :176 drawRockFx',
                slot='W4 falling-rock effects (w4Grit.ts RockDrop)', fl='falls'),
    'w4falls': K(src='World 4 waterfall set (w4/falls.webp, HF)', layer='decor mid', mat='water_fall', own=4, draw='src/game/w4FallsArt.ts:132-258 (part of w4/falls)',
                 slot='falls43 / fallZones (W4_FALL_STAGES)', fl='water'),
    'dressnew1': K(src='World 1 new dressing (props/dressnew-w1.webp, hf-props 2026-10-31)', layer='decor near', mat='forest_plant', own=1,
                   draw='src/game/dressArt.ts:68 drawDress (part of dressnew-w1)', slot='proto.dress (artDress.ts:232 dressSets)', fl='grounded'),
    'dressnew2': K(src='World 2 new dressing (props/dressnew-w2.webp, hf-props 2026-10-31)', layer='decor near', mat='made_wood', own=2,
                   draw='src/game/dressArt.ts:68 drawDress (part of dressnew-w2)', slot='proto.dress (artDress.ts:232 dressSets)', fl='grounded'),
    'dressnew3': K(src='World 3 new dressing (props/dressnew-w3.webp, hf-props 2026-10-31)', layer='decor near', mat='cave', own=3,
                   draw='src/game/dressArt.ts:68 drawDress (part of dressnew-w3)', slot='proto.dress (artDress.ts:232 dressSets)', fl='grounded'),
    'dressnew4': K(src='World 4 new dressing (props/dressnew-w4.webp, hf-props 2026-10-31)', layer='decor near', mat='highland', own=4,
                   draw='src/game/dressArt.ts:68 drawDress (part of dressnew-w4)', slot='proto.dress (artDress.ts:232 dressSets)', fl='grounded'),
    'dress': K(src='first dressing sheet (props/dress.webp, hf-art-ground 2026-10-29)', layer='decor near', mat='forest_plant',
               draw='src/game/dressArt.ts:68 drawDress (part of dress.webp)', slot='dress (artDress.ts:232 dressSets)', fl='grounded'),
    'stageart': K(src='every-stage pieces (props/stage-art.webp, hf-art-stage 2026-10-29)', layer='ui', mat='stage_ui',
                  draw='src/game/stageArt.ts:96 (part of stage-art; the flag baked once :184)', slot='checkpoints (drawCheckpointArt stageArt.ts:141) / heart and power-up collectibles (drawPickupArt :224) / Thorn Gate (:240) / story fern (:251) / story bell (:271) / nest net (drawNetArt :293)', fl='grounded'),
    'bounce': K(src='bounce plants (props/bounce.webp, HF 2026-10-29)', layer='soft landing', mat='forest_plant', draw='src/game/bounceArt.ts:69 drawBounce (baked per variant)',
                slot='platforms bouncy (W1 mixer/w1mix.ts:175 mushroom; hand-built protoStage.ts:1157/1175/1283/1355/1409/1498/1542/1572; stageGenerator.ts:808/1199/2478/2616/2995; mixer/post.ts:96)', fl='grounded'),
    'watersigns': K(src='water warning signs (props/water-signs.webp)', layer='danger look', mat='made_wood', draw='src/game/waterSign.ts:40 drawWaterSign (one blit)',
                    slot='waterSigns (a gen2 stage\'s water and every stage\'s first water)', fl='grounded'),
    'puzzlekit': K(src='puzzle kit (props/puzzle-kit.webp)', layer='decor near', mat='made_wood', draw='src/game/puzzleArt.ts:47 drawKitArt (part of puzzle-kit)',
                   slot='puzzle rooms: proto.kitDecor + puzzleKit.ts pieces (kit-pieces sheet)', fl='grounded'),
    'ropekit': K(src='rope kit (props/rope-kit.webp)', layer='platform', mat='made_wood', draw='src/game/ropeArt.ts:141 drawRopes (tile slices along the rope)',
                 slot='ropes: shimmy ropes, drawn by drawRopes (ropeArt.ts:141, called at engine.ts:6240)', fl='hangs'),
    'dotprops': K(src='Dot\'s flight props (props/dot-props.webp)', layer='decor near', mat='dot_flight', draw='src/game/dotFlightArt.ts:139 drawPiece (part of dot-props)',
                  slot='4-D Dot\'s flight set + W5 web patches (zoneArt.ts)', fl='hangs'),
    'dotbridges': K(src='Dot\'s flight far bridges (props/dot-bridges.webp)', layer='backdrop', mat='dot_flight', draw='src/game/dotFlightArt.ts:269 drawDotBackdrop',
                    slot='4-D backdrop bridges (dotFlightArt.ts:106)', fl='n/a'),
    'plants': K(src='painted plants (flora/plants-atlas.webp)', layer='decor near', mat='forest_plant', draw='src/game/plantSprites.ts:91 drawPlantSprite (28 px)',
                slot='stage plants (plantSprites.ts WORLD_PLANTS, 12 a world)', fl='grounded'),
    'flowers': K(src='painted flowers (flora/flowers-atlas.webp)', layer='decor near', mat='flower', draw='src/game/flowerSprites.ts:87 drawFlowerSprite (25 px)',
                 slot='stage flowers (flowerSprites.ts WORLD_FLOWERS, 12 a world)', fl='grounded'),
    'leaves': K(src='painted leaves (flora/leaves-atlas.webp)', layer='decor near', mat='forest_plant', draw='src/game/leafSprites.ts:69 drawPaintedLeaf / :96 glide / :119 bits',
                slot='falling leaves, the glide leaf, leaf bits (leafSprites.ts)', fl='drifts'),
    'petals': K(src='painted petals (flora/petals.webp)', layer='decor near', mat='flower', draw='src/game/petalSprites.ts:30 drawPetal',
                slot='drifting petals (petalSprites.ts)', fl='drifts'),
}
for w in (1, 2, 3, 4):
    RULE[f'ground{w}'] = K(src=f'World {w} ground (ground/w{w}.webp, HF from the world\'s kit)', layer='platform', mat='soil', own=w,
                           draw=f'src/game/groundPaint.ts:132 drawSoil / :197 drawLip (tiled; baked into ground squares)',
                           slot=f'banks of World {w} (protoArt.ts drawBankArt:563; groundPaint.ts)', fl='grounded')
    RULE[f'gate{w}'] = K(src=f'World {w} exit gate (props/gates/w{w}.webp)', layer='decor near', mat='made_wood' if w in (2,) else ('glowstone' if w == 3 else ('greyrock' if w == 4 else 'wood')), own=w,
                         draw='src/game/stageArt.ts:318 blitAt (GATE_H 250)', slot=f'exit gate, every World {w} stage (stageSheets gate:{w})', fl='grounded')
for w in (1, 3, 4):
    RULE[f'pitwater{w}'] = K(src=f'World {w} pit water (props/pitwater/w{w}.webp)', layer='danger look', mat='water_fall', own=w,
                             draw='src/game/stageArt.ts:379 (strip tiled across the pit)', slot=f'pit water, every World {w} stage (stageSheets pit-water:{w})', fl='water')
RULE['w1-creek'] = K(src='World 1 deadly creek (HF)', layer='danger look', mat='water_fall', own=1, draw='src/game/w1Creek.ts:55 (tiled)', slot='zones water (creek:1, 1-5)', fl='water')
RULE['w1-mud-splash'] = K(src='World 1 mud splash (HF)', layer='danger look', mat='water_fall', own=1, draw='src/game/w1Creek.ts:66 (one blit)', slot='creek splash (creek:1)', fl='n/a')
RULE['w1-drop'] = K(src='World 1 painted drop (pits)', layer='danger look', mat='soil', own=1, draw='src/game/w1Pits.ts:315 (tiled 256)', slot='platform pit=drop (pit-art:1)', fl='n/a')
RULE['w1-lip'] = K(src='World 1 pit lip (pits)', layer='danger look', mat='soil', own=1, draw='src/game/w1Pits.ts:420 (84 wide)', slot='platform pit=drop lip (pit-art:1)', fl='grounded')
RULE['w1-bed'] = K(src='World 1 pit bed (pits)', layer='soft landing', mat='forest_plant', own=1, draw='src/game/w1Pits.ts:355 (220 tile)', slot='pit floor soft landing (w1Pits.ts SOFT_FLOOR)', fl='grounded')
RULE['w1-bootprint'] = K(src='1-1 clue (HF from W1 bank art)', layer='decor near', mat='forest_plant', own=1, draw='src/game/w1NewArt.ts:63 drawW1Clue (110x28)', slot='proto.mixDress bootprint (1-1)', fl='flush decal')

# ---------------------------------------------------------------- per-name overrides: kind, layer, material, made, slot key, footing source
def classify(r):
    a, n = r['atlas'], r['frame']
    rule = RULE[a]
    o = dict(kind='', layer=rule['layer'], mat=rule['mat'], made='n', key=None, stand=False, fl=rule['fl'])
    if a == 'w1-cut':
        c = r['rect']
        o['kind'] = {'stone': 'standable stone / step', 'stump': 'standable stump', 'perch': 'hide stump (perch top)', 'log': 'log plank (floats)'}[c['kind']]
        o['stand'] = True
        if c['kind'] == 'log':
            o['mat'] = 'wood'; o['fl'] = 'may float'
        if c['kind'] in ('stump', 'perch'):
            o['mat'] = 'wood'
        if n.startswith('w1-plank-ledge') or n in ('w1-stump-wide', 'w1-hide-stump-hollow'):
            o['made'] = 'y'
        if n.startswith('w1-rock-slabs-low') or n.endswith('grey-moss-b'):
            o['layer'] = 'step'
    elif a in ('proto', 'kit2', 'kit3', 'kit4'):
        kinds = {'log': 'push log (hollow)', 'logPush': 'push log moving', 'boulder': 'low rock (log stop / hop rock)', 'seed': 'seed pickup',
                 'curtain': 'leaf curtain (hide)', 'curtainOpen': 'leaf curtain open', 'branch': 'branch / plank platform', 'branchCreak': 'creaking branch (crumbles)',
                 'snapL': 'snapped half (falls)', 'snapR': 'snapped half (falls)', 'perch': 'perch at a climb top', 'liana': 'liana (swing)',
                 'trunk': 'climb trunk', 'bank': 'bank top strip', 'bankEnd': 'bank end face', 'mossStrip': 'moss floor strip', 'wall': 'root wall',
                 'buttress': 'buttress roots', 'stump': 'stump', 'fill': 'soil fill tile'}
        o['kind'] = kinds.get(n, n)
        if n in ('branch', 'perch', 'bank', 'mossStrip', 'stump', 'boulder', 'log', 'logPush'):
            o['stand'] = True
        if n in ('boulder', 'stump'):
            o['layer'] = 'step'; o['fl'] = 'grounded'
        if n in ('branchCreak', 'snapL', 'snapR'):
            o['layer'] = 'danger look'
        if n in ('wall', 'buttress', 'fill', 'bankEnd'):
            o['layer'] = 'decor mid'; o['fl'] = 'grounded'
        if n in ('trunk', 'liana'):
            o['fl'] = 'hangs' if n == 'liana' else 'grounded'
        if n == 'seed':
            o['layer'] = 'ui'; o['mat'] = 'stage_ui'
        if n.startswith('curtain'):
            o['mat'] = 'forest_plant'; o['layer'] = 'decor near'
        if a == 'proto' and n in ('wall', 'buttress', 'bank', 'bankEnd', 'fill', 'mossStrip'):
            o['mat'] = 'soil'
        if a == 'kit2':
            o['made'] = 'y' if n in ('perch', 'branch', 'branchCreak', 'snapL', 'snapR', 'liana') else 'n'
            if n in ('wall', 'buttress', 'fill', 'bank', 'bankEnd', 'mossStrip'):
                o['mat'] = 'soil'
            if n in ('stump', 'boulder'):
                o['mat'] = 'mossrock'
            if n == 'trunk':
                o['mat'] = 'river'; o['kind'] = 'bamboo pole (climb)'
        if a == 'proto' and n in ('perch', 'trunk'):
            o['made'] = 'n'
    elif a == 'proto2':
        o['kind'] = {'hollowGlow': 'trunk hollow (glowing: a find)', 'hollow': 'trunk hollow', 'trunkPlain': 'plain trunk', 'bushTall': 'tall bush (hide)',
                     'fernClump': 'fern clump', 'bushWide': 'wide bush (hide)'}[n]
        if n.startswith(('hollow', 'trunk')):
            o['mat'] = 'wood'; o['layer'] = 'decor mid'
    elif a == 'proto3':
        o['kind'] = 'chase branch ' + n.replace('chase', '').lower()
        if n == 'chaseSeg' or n == 'chaseTip':
            o['stand'] = True; o['layer'] = 'platform'
    elif a == 'crown':
        o['kind'] = 'canopy crown (top of the reach climb)'; o['stand'] = True
    elif a.startswith('ground'):
        o['kind'] = {'fill': 'soil fill tile', 'lip': 'grass lip strip (walk top)', 'end': 'bank end face'}[re.sub(r'\d', '', n)]
        if n.startswith('lip'):
            o['stand'] = True
        else:
            o['layer'] = 'decor mid'
    elif a == 'w2props':
        made = {'archway', 'banner', 'bell', 'cageA', 'cageB', 'cageC', 'chimney', 'dais', 'door', 'doorRoof', 'gong', 'jetty', 'ladder', 'lantern',
                'laundry', 'lift', 'mailbox', 'pole', 'porch', 'rooftop', 'sign', 'steps', 'swingFrame', 'throne', 'window'}
        o['made'] = 'y' if n in made else 'n'
        o['key'] = ('proto.decor', n)
        if n.startswith(('capy', 'duck', 'otter')):
            o['kind'] = 'villager (caged friend pose)'; o['mat'] = 'river'
        elif n in ('reedLean', 'reedShort', 'reedTall', 'lily', 'lilyCarpet', 'canopy'):
            o['mat'] = 'river'; o['kind'] = 'river plant'
        elif n in ('logLong', 'logShort', 'limbShort'):
            o['mat'] = 'wood'; o['kind'] = 'log / limb'
        elif n == 'water':
            o['mat'] = 'river'; o['kind'] = 'river water body'; o['layer'] = 'danger look'; o['fl'] = 'water'
        else:
            o['kind'] = 'village prop'
        if n in ('jetty', 'porch', 'steps', 'lift', 'logLong', 'lily'):
            o['stand'] = True; o['layer'] = 'platform' if n != 'lily' else 'soft landing'
        if n in ('ladder',):
            o['kind'] = 'ladder (climb)'
    elif a == 'w3props':
        o['key'] = ('proto.w3decor', n)
        if n.startswith('thorn'):
            o['kind'] = 'thorn vine (sleeping / waking bud)'; o['layer'] = 'danger look'; o['mat'] = 'forest_plant'; o['fl'] = 'hangs'
        elif n.startswith('glow') and n not in ('glowLit', 'glowDim'):
            o['kind'] = 'glow-worm friend pose'; o['mat'] = 'cave'; o['fl'] = 'hangs'
        elif n in ('glowLit', 'glowDim', 'mushrooms'):
            o['kind'] = 'glow lamp / glow mushrooms'; o['mat'] = 'cave'
        elif n in ('fern', 'fernRustle', 'mossCurtain'):
            o['kind'] = 'grotto fern / moss (hide)'; o['mat'] = 'forest_plant'
        elif n in ('pillar', 'pillarBroken', 'pillarCracked', 'ringWall', 'rim', 'wallTile'):
            o['kind'] = 'carved / ring stone'; o['mat'] = 'made_stone'; o['made'] = 'y' if n != 'wallTile' else 'n'
        elif n in ('ledge', 'clawRock', 'stalactite', 'stalagmites', 'grottoMouth'):
            o['kind'] = 'grotto rock'; o['mat'] = 'glowstone'
        elif n in ('rootBridge', 'rootLadder', 'hollowLog'):
            o['kind'] = 'root bridge / ladder / hollow log'; o['mat'] = 'wood'
        else:
            o['kind'] = 'grotto prop'
        if n == 'stalactite':
            o['layer'] = 'danger look'; o['fl'] = 'hangs'
        if n in ('ledge', 'rootBridge', 'hollowLog', 'rim'):
            o['stand'] = True; o['layer'] = 'platform'
        if n == 'trickle':
            o['mat'] = 'water_fall'; o['kind'] = 'grotto trickle'
        if n in ('catEyes', 'pawprint', 'pawStrip', 'bones'):
            o['kind'] = 'jaguar sign (danger look)'; o['layer'] = 'danger look'
    elif a == 'w4props':
        if n.startswith('cap'):
            o['kind'] = 'capuchin (friend / thief pose)'; o['mat'] = 'forest_plant'
        elif n.startswith(('boulder', 'rock', 'shard', 'pillar', 'nestPillar')):
            o['kind'] = 'cascades rock'; o['mat'] = 'greyrock'
        elif n.startswith(('fall', 'lip', 'channel', 'basin', 'pool', 'cave', 'ledgeTrickle', 'logJam', 'overhang')):
            o['kind'] = 'water set piece'; o['mat'] = 'water_fall'
        elif n.startswith(('frond', 'fruit', 'orange', 'grassCliff', 'cover')):
            o['kind'] = 'cascades plant / cover'; o['mat'] = 'forest_plant'
        elif n.startswith(('nest', 'eaglet')):
            o['kind'] = 'eagle nest'; o['mat'] = 'highland'
        elif n.startswith(('chimes', 'ribbon', 'wetSteps')):
            o['kind'] = 'made piece (chimes / ribbon / carved steps)'; o['made'] = 'y'; o['mat'] = 'made_stone' if n.startswith('wet') else 'made_wood'
        else:
            o['kind'] = 'cascades prop'
        if n in ('boulderBig', 'boulderMoss', 'boulderRound', 'boulderSmall', 'rock', 'rockMoss', 'ledgeA', 'ledgeB', 'floatLedge', 'wetSteps', 'wetSteps2', 'fallLedge', 'ledgeTrickle'):
            o['stand'] = True; o['layer'] = 'step'
        if n in ('frondBridge', 'rockPillar', 'pillarSnap', 'poolLog', 'logJam', 'nestPillar', 'fruitCliff', 'grassCliff', 'fallCliff', 'overhang'):
            o['stand'] = True; o['layer'] = 'platform'
        if n.startswith('shard'):
            o['layer'] = 'danger look'; o['fl'] = 'falls'
        if n.startswith('cover'):
            o['kind'] = 'hide cover'
        if n == 'floatLedge':
            o['fl'] = 'may float'
    elif a == 'w4grit':
        o['kind'] = 'falling pebble' if n.startswith('pebble') else 'grit chip'
    elif a == 'w4falls':
        o['kind'] = {'pillar': 'falls pillar (climb)', 'plume': 'spray plume'}.get(n, re.sub(r'\d', '', n).replace('fall', 'fall body ').replace('lip', 'falls lip ').replace('splash', 'splash ').replace('mist', 'mist '))
        if n == 'pillar':
            o['stand'] = False
    elif a.startswith('dressnew') or a == 'dress':
        f = r['rect']
        o['key'] = ('proto.dress', n) if a.startswith('dressnew') else ('dress', n)
        hang = f.get('hang')
        o['kind'] = 'hanging dressing' if hang else 'standing dressing'
        o['fl'] = 'hangs' if hang else 'grounded'
        animal = re.search(r'(Toucan|Coati|Morpho|Snail|TreeFrog|Beetle|Heron|CattailFly|Otter|Turtle|Crab|Frog|Cricket|Totem|Marmot|Lizard|Kingfisher)', n)
        if animal:
            o['kind'] = 'animal dressing'
        if re.search(r'(SignPost|BasketHang|Canoe|GourdHang|KingfisherPost|ReedBundle|Raft|FishTrap|LilyBucket|WaterJar|NetHang|TrailPost|RopePost|Totem|Cairn)', n):
            o['made'] = 'y'; o['mat'] = 'made_wood'
        if n.startswith('w1'):
            o['mat'] = 'forest_plant' if not re.search(r'(Stump|FallenLog|MossBoulder|Stones|Pebble)', n) else ('wood' if re.search('Stump|Log', n) else 'mossrock')
            if n == 'w1TrailPost':
                o['made'] = 'y'; o['mat'] = 'made_wood'
        if n.startswith('w2') and not o['made'] == 'y':
            o['mat'] = 'river' if not re.search('Stone|Log|Driftwood', n) else ('mossrock' if 'Stone' in n else 'wood')
        if n.startswith('w3'):
            o['mat'] = 'cave' if re.search('Glow|Crystal|Shard|Geode|Bead|Cricket', n) else 'glowstone'
        if n.startswith('w4') and o['made'] != 'y':
            o['mat'] = 'highland' if not re.search('Boulder|Stones|Slate', n) else 'greyrock'
    elif a == 'stageart':
        o['kind'] = {'flagUnlit': 'checkpoint post (unlit)', 'flagLit': 'checkpoint post (lit)', 'heart': 'heart pickup', 'superHeart': 'crowned heart pickup',
                     'speed': 'speed power-up', 'shield': 'shield power-up', 'magnet': 'magnet power-up', 'thornShut': 'Thorn Gate shut', 'thornOpen': 'Thorn Gate open',
                     'fern': 'story-find fern', 'fernLit': 'story-find fern (lit)', 'bell': 'story bell', 'bellLit': 'story bell (lit)', 'netWhole': 'nest net (catch)',
                     'netTorn': 'nest net torn'}[n]
        if n.startswith('thorn'):
            o['layer'] = 'danger look'
        if n.startswith('net'):
            o['layer'] = 'soft landing'; o['stand'] = True
        if n.startswith(('flag', 'fern', 'bell')):
            o['layer'] = 'decor near'
    elif a == 'bounce':
        o['kind'] = 'bounce cap (springs him)' if n.startswith('cap') else 'bounce stalk'
        if 'stalk' in n:
            o['layer'] = 'decor mid'
        o['stand'] = n.startswith('cap')
        w = int(n.split('-w')[1])
        o['mat'] = {1: 'forest_plant', 2: 'river', 3: 'cave', 4: 'highland'}[w]
    elif a == 'watersigns':
        o['kind'] = 'water warning sign' + (' (rattling)' if 'rattle' in n else '')
    elif a == 'puzzlekit':
        if re.fullmatch(r'p\d+|e\d+', n):
            o['kind'] = 'Pokey carry pose'; o['layer'] = 'character'; o['mat'] = 'pokey'
        elif re.fullmatch(r'b\d+', n):
            o['kind'] = 'puzzle beetle pose'; o['layer'] = 'character'; o['mat'] = 'forest_plant'
        else:
            o['kind'] = 'puzzle piece'
            nat = {'acorn', 'acornPile', 'stone', 'stonePile', 'pinecone', 'riverStone', 'mushroom', 'mushroomDim', 'pebble', 'fern1', 'fern2', 'fern3', 'fern4',
                   'thornTangle', 'thornLoose', 'crystal', 'steppingStones', 'pool', 'slabStones', 'slab', 'basin', 'mango', 'petalBundle', 'acornTree', 'gustCrack', 'tradeStump'}
            o['made'] = 'n' if n in nat else 'y'
            o['mat'] = 'forest_plant' if n in nat else 'made_wood'
            if n in ('stonePlate', 'stonePlateDown', 'fernStone', 'fernDoorShut', 'fernDoorOpen', 'leverOff', 'leverOn'):
                o['mat'] = 'made_stone'
            if n in ('crystal', 'pool', 'steppingStones', 'slabStones', 'slab', 'basin', 'stone', 'stonePile', 'riverStone', 'pebble', 'gustCrack'):
                o['mat'] = 'mossrock'
            if n in ('liftPlank', 'plate', 'platePressed', 'seesawLevel', 'seesawUpR', 'seesawUpL', 'raft', 'bridge', 'stonePlate', 'stonePlateDown', 'slab', 'steppingStones', 'slabStones', 'ropeLift', 'tradeStump'):
                o['stand'] = True; o['layer'] = 'platform'
            if n == 'cake':
                o['kind'] = 'cake (story treat)'
            o['key'] = ('proto.kitDecor', n)
    elif a == 'ropekit':
        o['kind'] = 'rope tile' if n == 'tile' else 'rope post'
    elif a == 'dotprops':
        o['kind'] = 'Dot\'s flight piece'
        if n in ('thorn', 'thornStick', 'chain', 'chainHook', 'panel', 'panelTorn', 'ring', 'strandHook'):
            o['layer'] = 'danger look'
        if n in ('letter', 'note', 'dew', 'dew2', 'feather', 'feather2'):
            o['layer'] = 'ui'
        if n in ('chain', 'chainHook', 'ring', 'panel', 'panelTorn', 'letter', 'note', 'strandHook'):
            o['made'] = 'y'
    elif a == 'dotbridges':
        o['kind'] = 'far rope bridge' + (' shadow' if 'shadow' in n else ''); o['made'] = 'y'
    elif a in ('plants', 'flowers'):
        o['kind'] = 'painted plant' if a == 'plants' else 'painted flower'
    elif a == 'leaves':
        o['kind'] = {'green': 'falling leaf (green)', 'warm': 'falling leaf (warm)', 'big': 'big leaf (glide / bits)'}[r['rect']['set']]
    elif a == 'petals':
        o['kind'] = 'drifting petal'
    elif a in ('w1-new', 'w2-new', 'w3-new', 'w4-new'):
        o['kind'] = n
        if n.startswith('squirrel'):
            o['kind'] = 'squirrel (1-1 send-off)'; o['mat'] = 'forest_plant'
        if n.startswith(('hollowlog',)):
            o['kind'] = 'hollow log (walk on top, walk through)'; o['layer'] = 'platform'; o['stand'] = True
        if n in ('log-moss-shut', 'log-hide', 'acorn-slope'):
            o['kind'] = 'log piece'; o['layer'] = 'platform'; o['stand'] = True
        if n.startswith(('root-gate', 'knot')):
            o['kind'] = 'root gate / knot'; o['made'] = 'y' if n.startswith('root-gate') else 'n'
        if n == 'vine-rope':
            o['kind'] = 'vine rope'; o['fl'] = 'hangs'
        if a == 'w2-new':
            if n.startswith(('stone', 'sandbar', 'reed-isle')):
                o['mat'] = 'river' if 'reed' in n else 'mossrock'; o['made'] = 'n'; o['stand'] = True; o['layer'] = 'step'
            elif n.startswith(('foam', 'waterline')):
                o['mat'] = 'river'; o['made'] = 'n'; o['layer'] = 'decor near'; o['fl'] = 'water'
            else:
                o['made'] = 'y'
                if n.startswith(('crate', 'barrel')):
                    o['stand'] = True; o['layer'] = 'step'; o['fl'] = 'water'
        if a == 'w3-new':
            if n.startswith('bat'):
                o['mat'] = 'cave'; o['kind'] = 'bat pose'; o['layer'] = 'danger look'
            elif n.startswith('spore'):
                o['mat'] = 'cave'; o['kind'] = 'spore cloud'; o['layer'] = 'danger look'
            elif n.startswith(('shelf', 'stone', 'crack', 'counterweight')):
                o['stand'] = True; o['layer'] = 'platform' if n.startswith(('shelf', 'crack')) else 'step'
                if n == 'crack-cracking':
                    o['layer'] = 'danger look'
                if n.startswith('shelf'):
                    o['fl'] = 'may float'
            elif n.startswith('stalactite'):
                o['layer'] = 'danger look'; o['fl'] = 'falls'
            elif n == 'root-basket':
                o['mat'] = 'made_wood'; o['made'] = 'y'
        if a == 'w4-new':
            if n.startswith(('veil', 'mist')):
                o['mat'] = 'water_fall'; o['layer'] = 'decor near'
            elif n.startswith('updraft'):
                o['kind'] = 'updraft (glide)'; o['layer'] = 'decor near'
            elif n == 'sov-shadow':
                o['layer'] = 'backdrop'; o['kind'] = 'Sovereign\'s passing shadow'
            elif n.startswith('ledge'):
                o['stand'] = True; o['layer'] = 'platform' if n == 'ledge-whole' else 'danger look'; o['mat'] = 'greyrock'
            else:
                o['made'] = 'y'; o['mat'] = 'made_wood'
                if n == 'slung-log':
                    o['stand'] = True; o['layer'] = 'platform'; o['fl'] = 'hangs'
    elif a.startswith('gate'):
        o['kind'] = 'exit gate ' + n; o['made'] = 'y'
    elif a.startswith('pitwater'):
        o['kind'] = 'pit water ' + n
    elif a in ('w1-creek', 'w1-mud-splash', 'w1-drop', 'w1-lip', 'w1-bed', 'w1-bootprint'):
        o['kind'] = {'w1-creek': 'deadly creek body', 'w1-mud-splash': 'mud splash', 'w1-drop': 'pit drop (dark soil)', 'w1-lip': 'pit lip (bank edge)',
                     'w1-bed': 'pit bed (leaf landing)', 'w1-bootprint': 'soldier bootprint clue (decal)'}[a]
        if a == 'w1-bed':
            o['stand'] = True
    if (a, n) in MADE_BY_EYE:
        o['made'] = 'y'
        if o['mat'] in ('wood', 'forest_plant', 'mossrock', 'stage_ui', 'water_fall'):
            o['mat'] = 'made_wood'
    return o


# what is made, judged by eye on the contact sheets (attempt 2): sawn ends or tops with rings, carved or forged posts, nailed boards,
# twisted rope, woven netting, lashed poles. A made thing is never World 1 (Matt, 11-11).
MADE_BY_EYE = {
    ('watersigns', 'sign-jungle'): 'nailed plank sign', ('watersigns', 'sign-jungle-rattle'): 'nailed plank sign',
    ('stageart', 'flagUnlit'): 'forged checkpoint post', ('stageart', 'flagLit'): 'forged checkpoint post',
    ('stageart', 'netWhole'): 'woven rope net on pegs', ('stageart', 'netTorn'): 'woven rope net on pegs',
    ('ropekit', 'post'): 'lashed, carved post', ('ropekit', 'tile'): 'twisted rope',
    ('dressnew1', 'w1FallenLog'): 'sawn end with rings', ('dressnew1', 'w1WoodStump'): 'sawn top with rings',
    ('dressnew1', 'w1Toucan'): 'perched on a sawn stump with rings',
    ('proto', 'perch'): 'sawn trunk top', ('proto', 'trunk'): 'sawn top',
    ('w1-new', 'log-moss-shut'): 'flat sawn end faces', ('w1-new', 'hollowlog-plain'): 'flat sawn end faces',
    ('puzzlekit', 'acornTree'): 'sawn trunk top', ('puzzlekit', 'tradeStump'): 'sawn stump top',
    ('kit2', 'trunk'): 'cut bamboo pole',
    ('w2props', 'logLong'): 'sawn ends with rings', ('w2props', 'logShort'): 'sawn end with rings', ('dress', 'w2Log'): 'sawn end with rings',
    ('dressnew2', 'w2Driftwood'): 'driftwood lashed with rope',
    ('w4props', 'poolLog'): 'sawn end with rings', ('w4props', 'ribbonLog'): 'sawn ends tied with a ribbon', ('w4props', 'logJam'): 'sawn ends with rings',
    ('w4props', 'brokenLog'): 'log wrapped in ribbon',
}


# ---------------------------------------------------------------- drawn size at play scale (world px: WORLD_VIEW_H 540, engine.ts:221)
def on_screen(r, o):
    """(w, h, how): the size the code draws the piece, in world px, at its largest ordinary use"""
    a, n, f = r['atlas'], r['frame'], r['rect']
    fw, fh = f['w'], f['h']
    if a == 'w1-cut':
        span = max(1, f['fx1'] - f['fx0'])
        if f['kind'] == 'log':
            k = 360 / span  # PLANK_MAX 360 (w1CutArt.ts:80)
            return fw * k, fh * k, 'stand span = plank part <=360 (w1CutArt.ts:87 PLANK_MAX)'
        k = 260 / span  # pickCut's widest stone 260 (w1CutArt.ts:110)
        return fw * k, fh * k, 'stand span = platform <=260 (w1CutArt.ts:106)'
    if a.startswith('dressnew') or a == 'dress':
        return f['units'], f['units'] * fh / fw, 'units (dressArt.ts:62 dressSize)'
    if a in ('plants',):
        return 28 * 1.4, 28 * 1.4 * fh / fw, 'PLANT_SIZE 28 x sway (plantSprites.ts:81)'
    if a in ('flowers',):
        return 25 * 1.4, 25 * 1.4 * fh / fw, 'FLOWER_SIZE 25 (flowerSprites.ts:84)'
    if a == 'leaves':
        s = 60 if r['rect']['set'] == 'big' else 38
        return s, s * fh / fw, 'leaf size <=38, glide leaf ~60 (leafSprites.ts:78)'
    if a == 'petals':
        return 24, 24, 'petal ~24 (petalSprites.ts:30)'
    if a == 'w4grit':
        return (40, 40, 'pebble ~40 (w4Grit.ts)') if n.startswith('pebble') else (16, 16, 'chip 16 (w4Grit.ts:418)')
    if a == 'stageart':
        if n.startswith('flag'):
            return 122 * fw / fh, 122, 'FLAG_H 122 (stageArt.ts:131)'
        if n.startswith('net'):
            return 150, 150 * fh / fw, 'nest net ~150 wide'
        return 48 * fw / max(fw, fh), 48 * fh / max(fw, fh), 'pickup ~48 (stageArt.ts:224)'
    if a.startswith('gate'):
        return 250 * fw / fh, 250, 'GATE_H 250 (stageArt.ts:307)'
    if a.startswith('pitwater') or a == 'w1-creek':
        return 256, 256 * fh / fw, 'strip tiles ~256 wide'
    if a == 'w1-drop':
        return 256, 256 * fh / fw, 'PIT_SIZE.dropTile 256 (w1Pits.ts:50)'
    if a == 'w1-lip':
        return 84, 84 * fh / fw, 'PIT_SIZE.lipW 84 (w1Pits.ts:50)'
    if a == 'w1-bed':
        return 220, 220 * fh / fw, 'PIT_SIZE.bedTile 220 (w1Pits.ts:50)'
    if a == 'w1-bootprint':
        return 110, 28, 'CLUE 110x28 (w1NewArt.ts:49)'
    if a == 'w1-mud-splash':
        return 90, 90 * fh / fw, 'splash ~90'
    if a.startswith('ground'):
        if n.startswith('fill'):
            return 600, 600, 'SOIL_TILE 600 (groundPaint.ts:22)'
        if n.startswith('lip'):
            return 700, 700 * fh / fw, 'LIP_W 700 (groundPaint.ts:24)'
        return 300 * fw / fh, 300, 'END_H 300 (groundPaint.ts:26)'
    if a == 'bounce':
        return 110, 110 * fh / fw, 'bounce plant ~110 wide (bounceArt.ts)'
    if a == 'watersigns':
        return 96 * fw / fh, 96, 'WATER_SIGN_H 96 (waterSign.ts:13)'
    if a == 'ropekit':
        return (9 * fw / fh, 9, 'ROPE_THICK 9 (ropeArt.ts:30)') if n == 'tile' else (24, 24 * fh / fw, 'post ~24 wide')
    if a in ('proto', 'kit2', 'kit3', 'kit4'):
        if n in ('branch', 'branchCreak'):
            return 54 * fw / fh, 54, 'branch h<=54, middle stretched (protoArt.ts:497)'
        if n in ('snapL', 'snapR'):
            return 150, 70, 'snapped half: half the branch (protoArt.ts:509)'
        if n == 'mossStrip':
            return 46 * fw / fh, 46, 'th 46 tiled (protoArt.ts:570)'
        if n in ('trunk', 'liana'):
            return 40, 40 * fh / fw, 'trunk / liana ~40 wide, tiled up'
        if n == 'perch':
            return 260, 260 * fh / fw, 'perch w = reach + 70 (protoArt.ts:541)'
        if n in ('boulder', 'stump'):
            return 160, 160 * fh / fw, 'platform x1.15 (protoArt.ts:367)'
        if n in ('log', 'logPush'):
            return 170, 170 * fh / fw, 'push log width x1.08 (protoArt.ts:351)'
        if n == 'seed':
            return 30, 30 * fh / fw, 'stand 30 (protoArt.ts:383)'
        if n in ('wall', 'buttress', 'fill', 'bank', 'bankEnd'):
            return 300, 300 * fh / fw, 'bank / wall face ~300'
        return 200, 200 * fh / fw, 'curtain ~200'
    if a == 'proto2':
        return 140, 140 * fh / fw, 'bush / hollow ~140'
    if a == 'proto3':
        return 180, 180 * fh / fw, 'chase branch ~180'
    if a == 'crown':
        return 300, 300 * fh / fw, 'crown ~300'
    if a == 'puzzlekit':
        k = r['rect'].get('k', 1)
        return fw * k, fh * k, f'KIT_ART k={k} (puzzleArt.ts:30 kitSize)'
    if a == 'dotbridges':
        return 768, 512, 'far layer, drawn near its own size'
    if a in ('w2props', 'w3props', 'w4props', 'dotprops', 'w4falls', 'w1-new', 'w2-new', 'w3-new', 'w4-new'):
        big = max(fw, fh)
        if a == 'w1-new':
            hh = {'squirrel': 62, 'root-gate': 120, 'knot': 70, 'acorn-slope': 80, 'log-hide': 90}
            h = next((v for k2, v in hh.items() if n.startswith(k2)), 70)
            if n.startswith('hollowlog'):
                return 380 * 1.06, 380 * 1.06 * fh / fw, 'hollow log 310-380 wide x1.06 (w1NewArt.ts:129 hollowLogSize)'
            return h * fw / fh, h, 'DRESS_H (w1NewArt.ts:71)'
        if a == 'w4falls' and n.startswith('fall'):
            return 160, 160 * fh / fw, 'falls body ~160 wide (w4FallsArt.ts:132)'
        s = 220 if big > 500 else (130 if big > 250 else 70)
        return s * fw / big, s * fh / big, '~ typical draw (no fixed size in code)'
    return fw, fh, 'own size'


def kb_of(r):
    path = f"{R}/{r['file']}"
    kb = os.path.getsize(path) / 1024
    im = CACHE.get(r['file']) or Image.open(path)
    W, H = im.size
    f = r['rect']
    return kb * (f['w'] * f['h']) / (W * H)


# ---------------------------------------------------------------- build
def main():
    out = []
    looks = {}
    seen = {}
    for r in FRAMES:
        a, n, f = r['atlas'], r['frame'], r['rect']
        rule = RULE[a]
        o = classify(r)
        im = crop(r)
        pink, edges = checks(im)
        h = phash(im)
        dup = seen.get((a, h))
        seen.setdefault((a, h), n)
        fixes = []
        if a == 'w1-cut':
            rid, src = n, rule['src']
        else:
            rid, src = f"{os.path.basename(r['file']).rsplit('.', 1)[0]}#{n}", rule['src']
        # (footing)
        walk = ('', '', '', '')
        foot = 'none (decor)'
        if a == 'w1-cut':
            walk = (f['fy'], f['fx0'], f['fx1'], measure_footing(im)[3] if measure_footing(im) else '')
            foot = f"code: fy {f['fy']} fx0 {f['fx0']} fx1 {f['fx1']} (w1-cut.json; drawn by cutBox w1CutArt.ts:40: footing on the platform top, stand span = width, sunk 3)"
        elif a.startswith('ground') and n.startswith('lip'):
            g = MISC_G[a]
            walk = (round(g['surf'] * f['h'], 1), 0, f['w'], 0.0)
            foot = f"code: surf {g['surf']} of the strip (groundAtlasData.ts; groundPaint.ts:197 drawLip)"
        elif a == 'bounce' and o['stand']:
            rim = f.get('rim', 0)
            walk = (0, round(f.get('cx', .5) * f['w'] - f.get('cw', 1) * f['w'] / 2, 1), round(f.get('cx', .5) * f['w'] + f.get('cw', 1) * f['w'] / 2, 1), '')
            foot = f"code: the cap's top row is the collision line; rim {rim}, cw {f.get('cw')} (bounceArt.ts:5)"
        elif a in ('proto', 'kit2', 'kit3', 'kit4') and n in ('branch', 'branchCreak'):
            m = measure_footing(im)
            walk = m if m else walk
            foot = f'code: measured painted top (protoArt.ts:434 measure / :458 solidTop, fallback 0.29 of h) set 2 px over the walk top (protoArt.ts:500); measured here {walk[0]}'
        elif n in ('trunk', 'liana', 'tile', 'post') and a in ('proto', 'kit2', 'kit3', 'kit4', 'ropekit'):
            walk = ('', round(f['w'] / 2, 1), round(f['w'] / 2, 1), '')
            foot = 'none: climbed or hung from, never stood on; grip line = its centre x, the whole height (protoArt.ts:909 / :954; ropeArt.ts:141)'
        elif o['stand']:
            m = measure_footing(im)
            if m:
                walk = m
                foot = f'measured from alpha (first row with 55% of the middle half solid): y {m[0]}, x {m[1]}-{m[2]}'
                if a in ('proto', 'kit2', 'kit3', 'kit4'):
                    foot += ' ; drawn by protoArt.ts stand()/blit (box bottom on the platform foot, protoArt.ts:264)'
            else:
                foot = 'measured: no solid top found'
                fixes.append('no clear walk line in the picture')
        # (worlds)
        used_st = []
        puzzle_rooms = ''
        if o['key']:
            used_st = inv_stages({o['key'][0]}, o['key'][1])
        if a == 'w1-cut':
            from_laid = n in LAID
            used_st = ['1-1'] if from_laid else []
        elif a == 'w1-new':
            used_st = inv_stages({'proto.mixDress'}, n) or (inv_stages({'proto.hollows'}, '') if n.startswith('hollowlog') else [])
        elif a == 'w1-bootprint':
            used_st = inv_stages({'proto.mixDress'}, 'bootprint')
        elif a in ('w2-new', 'w3-new', 'w4-new'):
            used_st = []
        elif a in ('proto',):
            used_st = world_stages(1)
        elif a in ('kit2', 'kit3', 'kit4'):
            used_st = world_stages(int(a[-1]))
        elif a.startswith(('ground', 'gate', 'pitwater')):
            used_st = world_stages(int(re.sub(r'\D', '', a)))
        elif a == 'proto2':
            k = {'bushTall': 'tall', 'bushWide': 'wide', 'fernClump': 'fern'}.get(n)
            used_st = inv_stages({'proto.bushes'}, k) if k else (inv_stages({'proto.hollows'}, '') if n.startswith('hollow') else inv_stages({'proto.trunks'}, ''))
        elif a in ('proto3',):
            used_st = sorted({s for r2 in INV['rows'] if r2['arr'] == 'platforms' and 'chase' in r2['key'] for s in r2['stageList']})
        elif a == 'crown':
            used_st = sorted({s for r2 in INV['rows'] if r2['arr'] == 'platforms' and 'crown' in r2['key'] for s in r2['stageList']})
        elif a == 'stageart':
            used_st = list(STAGES) if not n.startswith(('net', 'fern', 'bell', 'thorn')) else []
        elif a == 'bounce':
            w = int(n.split('-w')[1])
            used_st = [s for r2 in INV['rows'] if r2['arr'] == 'platforms' and r2['key'].startswith('bouncy') for s in r2['stageList'] if s.split('-')[0] == str(w)]
        elif a == 'watersigns':
            used_st = sorted({s for r2 in INV['rows'] if r2['arr'] == 'waterSigns' for s in r2['stageList']} | ({'1-5'}))
        elif a == 'w1-creek' or a == 'w1-mud-splash':
            used_st = ['1-5']
        elif a in ('w1-drop', 'w1-lip', 'w1-bed'):
            used_st = sorted({s for r2 in INV['rows'] if r2['arr'] == 'platforms' and 'pit=drop' in r2['key'] for s in r2['stageList'] if s.startswith('1-')})
        elif a == 'w4falls':
            used_st = sorted({s for r2 in INV['rows'] if r2['arr'] in ('falls43', 'fallZones') for s in r2['stageList']})
        elif a == 'w4props':
            used_st = [s for s in world_stages(4)]
        elif a == 'w4grit':
            used_st = [s for s in world_stages(4)]
        elif a in ('dotprops', 'dotbridges'):
            used_st = ['4-D'] + (['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-7', '5-8', '5-9'] if a == 'dotprops' and n in ('silk', 'silkWide', 'strandHook') else [])
        elif a == 'plants':
            num = int(n[1:])
            used_st = [s for w, l in MISC['WORLD_PLANTS'].items() if num in l for s in world_stages(int(w))]
        elif a == 'flowers':
            num = int(n[1:])
            used_st = [s for w, l in MISC['WORLD_FLOWERS'].items() if num in l for s in world_stages(int(w))]
        elif a in ('leaves', 'petals'):
            used_st = list(STAGES)
        elif a == 'ropekit':
            used_st = sorted({s for r2 in INV['rows'] if r2['arr'] == 'ropes' for s in r2['stageList']})
        elif a == 'puzzlekit' and not used_st:
            # (the rooms' stages are known, which piece each room lays is not measured per piece: listed as the rooms, worlds left open)
            rooms = sorted({s for r2 in INV['rows'] if r2['key'].startswith('solid - art=kit') for s in r2['stageList']}, key=lambda s: (int(s.split('-')[0]), s))
            puzzle_rooms = 'puzzle rooms (which room lays this piece is not measured per piece): ' + ' '.join(rooms)
        elif a in ('w2props', 'w3props') and not used_st:
            used_st = []
        unused = (os.path.basename(r['data']), n) in UNUSED or (a in ('w2-new', 'w3-new', 'w4-new'))
        if unused:
            used_st = []
        used_w = wsets(used_st)
        own = rule.get('own')
        mat = o['mat']
        if mat == 'soil':
            ow = own or 1
            extra = [(ow, f'World {ow}\'s own soil and lip')]
            txt, best, nf = worlds_for('soil', used_w, o['made'] == 'y', own=ow, extra=extra)
        else:
            txt, best, nf = worlds_for(mat, used_w, o['made'] == 'y', own=own)
        if a == 'w1-cut' and n in MAN:
            txt += f" | manifest tag (11-05): {' '.join(MAN[n]['worlds'])}"
        # (size, ship)
        sw, sh, how = on_screen(r, o)
        big_on = max(sw, sh)
        native = max(f['w'], f['h'])
        ship = int(min(native, math.ceil(2 * big_on)))
        kb = kb_of(r)
        kb_ship = kb * (ship / native) ** 2
        # (looks)
        # (pink: only where pink is not the subject: flowers, petals, Dot's blooms and the capuchin's petal are painted pink on purpose)
        pink_subject = o['mat'] in ('flower', 'dot_flight') or a in ('petals', 'flowers') or 'Petal' in n
        if pink > 0.002 and not pink_subject:
            fixes.append(f'pink key left in ({pink * 100:.1f}% of its pixels bright magenta)')
        # (an edge is cut only where the piece should not meet it: a standing piece's foot sits in the ground, a hanging piece's top on
        #  its bough, a tile or strip meets its cell on purpose, a flora icon is a square tile drawn 25-38 px)
        ok_edges = set()
        if o['fl'] in ('grounded', 'falls', 'may float', 'water') or o['layer'] in ('platform', 'step', 'soft landing'):
            ok_edges.add('bottom')
        if o['fl'] == 'hangs':
            ok_edges.add('top')
        if a in ('plants', 'flowers') or n in ('trunk', 'trunkPlain', 'hollow', 'hollowGlow', 'chaseSeg', 'chaseCrack') or (a == 'bounce' and 'stalk' in n):
            ok_edges |= {'top', 'bottom', 'left', 'right'}  # (tiles: they meet their cell on purpose)
        if n in ('glowDim', 'glowLit', 'mossCurtain', 'lipPour', 'fallLedge', 'overhang') or a == 'w1-mud-splash':
            ok_edges |= {'top', 'left', 'right', 'bottom'}  # (hung from a ceiling or set against a cliff face: the cut edge sits on it)
        cut = [e for e, v in edges.items() if v > 0.25 and e not in ok_edges]
        tiles = a.startswith(('ground', 'pitwater')) or a in ('w1-creek', 'w1-drop', 'w2props') and n in ('fill0', 'water') or n in ('fill', 'bank', 'mossStrip', 'wallTile', 'tile', 'fill0', 'fill1', 'fill2', 'fill3')
        if cut and not tiles and a not in ('w1-creek', 'w1-drop', 'w1-bed', 'w4falls', 'dotbridges') and not (a == 'w2props' and n == 'water'):
            fixes.append('solid along the cell\'s ' + '/'.join(cut) + ' edge: likely cut off')
        if dup and dup != n:
            fixes.append(f'same picture as {dup} (duplicate frame)')
        if (a, n) in LOOKED:
            fixes.append(LOOKED[(a, n)])
        rulecheck = 'W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lead\'s call: keep, re-paint natural, or move)' if o['made'] == 'y' and 1 in used_w else ''
        status = 'in game' if ((used_st or puzzle_rooms) and not unused) else ('ready (packed, never drawn: no draw site / no loader)' if not used_st else 'in game')
        if a == 'w1-cut':
            status = 'in game' if n in LAID else 'in game (packed in 1-1\'s atlas, not laid: w1CutArt.ts:69 LAID)'
        if a in ('w2-new', 'w3-new', 'w4-new'):
            status = 'ready (not in the build: no code loads the sheet)'
        if fixes:
            status += '; needs fix: ' + '; '.join(dict.fromkeys(fixes))
        if rulecheck:
            status += '; ' + rulecheck
        slot = rule['slot']
        if o['key']:
            slot = f"{o['key'][0]} key {o['key'][1]} ; " + slot
        if a in ('proto', 'kit2', 'kit3', 'kit4'):
            slot = f'kit frame {n} ; ' + slot
            if n in ('branch', 'branchCreak'):
                slot += ' ; platforms solid branch (drawBranchArt protoArt.ts:493)'
            if n in ('log', 'logPush'):
                slot += ' ; platforms solid log push (drawLogArt protoArt.ts:347)'
            if n == 'boulder':
                slot += ' ; platforms moss_stone art=rock (drawRockArt protoArt.ts:364)'
            if n == 'mossStrip':
                slot += ' ; moss floors (drawBankArt protoArt.ts:568)'
            if n == 'perch':
                slot += ' ; perch at a climb top (drawPerchArt protoArt.ts:537)'
        if a == 'w1-cut':
            slot = (('pickCut kind ' + f['kind'] + ('; LAID as ' + LAID[n] if n in LAID else '; not in LAID')) + ' ; ' +
                    ('landing platforms solid log h<50 (pickCut log, w1CutArt.ts:105; plank parts <=360 :87)' if f['kind'] == 'log' else rule['slot']))
        draw = rule['draw']
        if a in ('w2-new', 'w3-new', 'w4-new'):
            draw = 'none today (sheet not loaded); would be one blit of an atlas part'
        elif not draw.startswith('none'):
            draw = 'one drawImage of an atlas part: ' + draw if os.path.getsize(f"{R}/{r['file']}") and len([x for x in FRAMES if x['file'] == r['file']]) > 1 else 'one blit: ' + draw
        out.append(dict(id=rid, source=src, file=r['file'] + ('' if len([x for x in FRAMES if x['file'] == r['file']]) == 1 else f"#{n} ({f['x']},{f['y']} {f['w']}x{f['h']})"),
                        kind=o['kind'], w=f['w'], h=f['h'], walk_y=walk[0], walk_x0=walk[1], walk_x1=walk[2], flat=walk[3], float_class=o['fl'],
                        world_best=best, worlds=txt, no_fit=nf, made_thing=o['made'], engine_slot=slot, footing=foot, layer=o['layer'],
                        on_screen_px=f'{round(sw)}x{round(sh)} ({how})', ship_px=ship, file_kb=round(kb, 1), file_kb_ship=round(kb_ship, 1),
                        draw_cost=draw, used_in=(puzzle_rooms or fmt_stages(used_st)) if not unused else 'none (no draw site: tools/art/artuse.mjs)' if a not in ('w2-new', 'w3-new', 'w4-new') else 'none (sheet not in the build)',
                        status=status))
        looks[rid] = dict(pink=pink, edges=edges, atlas=a, frame=n)
    with open(OUT, 'w', newline='') as fh:
        wr = csv.DictWriter(fh, fieldnames=COLS)
        wr.writeheader()
        wr.writerows(out)
    json.dump(looks, open(f'{SHEETS}/b1-checks.json', 'w'), indent=0)
    return out


LAID = {'w1-rock-slabs-low': 'stone', 'w1-rock-slabs-stacked': 'stone', 'w1-rock-slabs-stacked-big': 'stone', 'w1-rock-block-big': 'stone',
        'w1-rock-root-block': 'stone', 'w1-rock-roots': 'stone', 'w1-rock-boulder-moss': 'boulder', 'w1-rock-boulder-moss-big': 'boulder',
        'w1-boulder-grey-moss': 'boulder', 'w1-boulder-grey-moss-b': 'boulder', 'w1-stump-wide': 'stump', 'w1-plank-ledge-a': 'plank',
        'w1-plank-ledge-b': 'plank', 'w1-plank-ledge-c': 'plank'}  # (w1CutArt.ts:69-84, copied by the test below: check_laid)
MISC_G = {}
# what the art director saw on the contact sheets (2026-11-11), beyond the automatic checks
LOOKED = {
    ('w1-cut', 'w1-boulder-grey-moss'): 'see-through holes in the rock face (dark crevices keyed out: the backdrop shows through)',
    ('w1-cut', 'w1-boulder-grey-moss-b'): 'see-through holes in the rock face (dark crevices keyed out)',
    ('w1-cut', 'w1-plank-ledge-a'): 'reads as a sawn board, square ends (a made thing laid in 1-1)',
    ('w1-cut', 'w1-plank-ledge-b'): 'reads as a sawn board, square ends (a made thing laid in 1-1)',
    ('w1-cut', 'w1-plank-ledge-c'): 'reads as a sawn board, square ends (a made thing laid in 1-1)',
    ('w1-cut', 'w1-stump-wide'): 'sawn flat top with rings and pegged steps (a made thing laid in 1-1)',
    ('w1-cut', 'w1-hide-stump-hollow'): 'sawn flat top with rings (made: keep out of W1)',
    ('w1-new', 'knot-a'): 'a flat lime bar floats over the knot (reads as a strip, not moss)',
    ('w1-new', 'knot-b'): 'a flat lime bar floats over the knot (reads as a strip, not moss)',
    ('kit3', 'liana'): 'cut off down its right side (half a liana)',
    ('kit3', 'trunk'): 'grey square in its top-right corner; flat cut edges',
    ('kit2', 'snapL'): 'pink cord trailing (de-pink leftover?)',
    ('kit3', 'branchCreak'): 'pink puff under the crack (magenta key leftover)',
    ('kit4', 'branchCreak'): 'pink blob under the crack (magenta key leftover)',
    ('proto', 'perch'): 'sawn trunk top (reads made in W1)',
    ('proto', 'trunk'): 'sawn top (reads made in W1)',
    ('w4props', 'overhang'): 'straight cut along its top-left edge',
    ('flowers', 'f96'): 'pink fleck in the top-right corner of the cell',
    ('plants', 'p18'): 'pink fleck in the top-right corner of the cell',
    ('w2props', 'water'): 'a flat water slab with square ends (fine as a tiled body, never as a prop)',
}

if __name__ == '__main__':
    D = json.load(open(f'{S}/frames.json'))
    for w in (1, 2, 3, 4):
        MISC_G[f'ground{w}'] = D['groundAtlasData']['GROUND_FRAMES'][str(w)]['lip']
    rows = main()
    c = collections.Counter(r['layer'] for r in rows)
    print(len(rows), dict(c))
    print(collections.Counter(r['status'].split(';')[0] for r in rows))
    print('needs fix', sum('needs fix' in r['status'] for r in rows))
