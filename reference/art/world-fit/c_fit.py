# The 11-05 cuts (art-director reference/art/cut/manifest.json): best-first worlds by group, from each piece's name and job.
# The manifest's own "~tint" kin tags (same shape re-tinted for that world) are kept in the reason.
import json, os
M = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'm1105.json')))['pieces']
RULES = [  # (name test, worlds, reason)
 (lambda n: n.startswith('hold-w1-totem') or n.startswith('hold-w1-pole'), [7, 5], 'carved totem or pole: the ruins first, the garden second (on hold: story call)'),
 (lambda n: n.startswith('hold-') and 'rope' not in n, [1], 'on hold (design call); W1 if it comes back'),
 (lambda n: 'thorn-hang' in n, [1, 8, 3, 10], 'hanging thorns: canopy, the night treetops (fills 8 hazard), grotto ~cool-dark, fortress ~dead-grey'),
 (lambda n: 'thorn' in n or 'sticks-thorny' in n, [1, 10, 3, 9], 'thorn hazard: W1\'s own painted thorns; fortress ~dead-grey, grotto ~cool-dark, volcano scrub'),
 (lambda n: 'lashed' in n, [2], 'rope-lashed log: W2 only (the lead, 11-06: rope is a made thing, none in the home forest)'),
 (lambda n: n == 'hold-w1-rope-swing-log', [2], 'rope swing on a log: rope is a made thing, so W2 (lead, 11-11; on hold: design call)'),
 (lambda n: 'rope' in n or 'frame' in n, [2, 6], 'rope-lashed or rope (a made thing): the riverbank village, the mangrove; not W1 (lead, 11-11: no made things in the home forest)'),
 (lambda n: n.startswith('w1-post'), [2, 6, 8], 'the picture shows a sawn post with a flat cut top (set by people, a made thing): village, mangrove, night walkways; not W1'),
 (lambda n: 'plank-ledge' in n, [2, 6], 'a cut board (a made thing): village dock or boardwalk, mangrove; not W1'),
 (lambda n: n in ('w1-rock-arch', 'w1-hide-rock-arch-low'), [3, 4, 1], 'the picture shows a natural mossy rock arch, not masonry: grotto ~cool-dark first, cliffs ~slate'),
 (lambda n: 'rock-slabs' in n or 'slab-overhang' in n, [4, 3, 1], 'the picture shows natural layered rock slabs, not masonry: cliffs ~slate first, grotto'),
 (lambda n: False and ('rope' in n or 'frame' in n), [2, 1, 6], 'rope-lashed (a made thing): the riverbank village first; W2 only for the lashed log (lead 11-06)'),
 (lambda n: 'lantern' in n, [2, 7], 'a lantern is a made thing: the village; ruins torches second'),
 (lambda n: n.startswith('w1-post'), [1, 6, 8], 'climb post: canopy, swamp ~grey-wet, night ~blue-night'),
 (lambda n: 'vine-column' in n or 'vine-curtain' in n, [1, 6, 5], 'climb or curtain vine: canopy, swamp ~grey-wet, garden'),
 (lambda n: 'vine-monstera' in n or 'vine-flowering' in n or 'leaf-monstera' in n or 'garland' in n, [5, 1, 8], 'flowering or leafy vine: the orchid garden first (fills 5 liana)'),
 (lambda n: 'vine-fungus' in n, [8, 1, 3], 'fungus vine: night treetops ~blue-night'),
 (lambda n: 'bush-monstera' in n, [1, 5, 6], 'monstera hide bush: canopy, garden ~orchid, swamp ~grey-wet'),
 (lambda n: 'bush-hedge' in n, [5, 1], 'tall hedge: the orchid garden\'s clipped look first'),
 (lambda n: 'stump' in n, [1, 6, 8], 'stump: canopy floor, swamp ~grey-wet, night ~blue-night'),
 (lambda n: 'rock-arch' in n or 'hide-rock-arch' in n, [7, 3, 4, 1], 'stone arch: a ruin gateway ~sand-stone, grotto ~cool-dark, cliffs ~slate'),
 (lambda n: 'rock-slabs' in n or 'slab-overhang' in n, [7, 4, 3, 1], 'stacked slabs: ruin masonry ~sand-stone (fills 7 root-split slabs), cliff ~slate'),
 (lambda n: 'cave' in n, [3, 4, 1, 10], 'boulder cave: the grotto ~cool-dark first, cliffs ~slate, highlands'),
 (lambda n: 'rock-root' in n or 'rock-roots' in n, [1, 7, 3], 'rock gripped by roots: canopy, ruins swallowed by roots'),
 (lambda n: 'rock-spire' in n, [4, 10, 3], 'rock spire: cliffs ~slate, highlands'),
 (lambda n: 'rock-block' in n, [7, 3, 4, 1], 'squared rock block: ruin rubble ~sand-stone (fills 7), grotto, cliffs'),
 (lambda n: 'pebble' in n or 'mossrock' in n, [1, 3, 4, 2], 'small mossy stones: dressing for any rocky world; river pebbles'),
 (lambda n: 'boulder' in n, [3, 4, 1, 10], 'grey mossy boulder: grotto ~cool-dark, cliffs ~slate, canopy, highlands'),
 (lambda n: 'branch' in n or 'sticks' in n, [1, 8, 6, 5], 'branch dressing: canopy, night ~blue-night, swamp ~grey-wet; the garden has none (fills 5)'),
 (lambda n: 'hide-log-on-stump' in n, [1, 6, 8], 'leaning-log hide spot'),
 (lambda n: 'root-arch' in n, [1, 7, 6], 'root arch: canopy, temple roots, swamp'),
 (lambda n: 'trunk-twisted' in n, [1, 6], 'twisted trunk with rock'),
 (lambda n: 'wall-' in n or 'ground-chunk' in n or 'ledge-earth' in n or 'ledge-thin' in n or 'ledge-overhang' in n, [1, 3, 4], 'earth wall or ledge: canopy bank, grotto ~darker, cliffs'),
 (lambda n: 'roots-hang-glow' in n, [3, 8, 1], 'glowing hanging roots: grotto and night first'),
 (lambda n: 'roots-hang' in n, [1, 3, 6], 'hanging roots: canopy, grotto ~darker, swamp'),
 (lambda n: 'grass-tuft' in n, [1, 2, 5, 6, 8], 'grass tuft: dressing for any green world'),
 (lambda n: 'plank-ledge' in n, [2, 1, 6], 'cut plank ledge: village first, swamp boardwalk ~grey-wet'),
 (lambda n: 'trunk-fungus' in n or 'fungus' in n, [8, 1, 3], 'fungus trunk or shelf: night treetops ~blue-night, canopy, grotto'),
 (lambda n: 'log-plank' in n, [1, 6, 8, 5], 'log platform: canopy, swamp, night; the garden has no log (fills 5)'),
]
F = {}
for p in M:
    n = p['file'][:-4]
    for test, ws, why in RULES:
        if test(n): F[n] = (ws, why); break
    else: raise SystemExit('no rule: ' + n)
