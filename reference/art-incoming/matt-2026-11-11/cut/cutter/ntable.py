# N batch (Matt's 13 sheets, 2026-11-11): (label, kind, world, float class, notes). Sheet 10 has Matt's own labels (spelled as
# printed); the other sheets are unlabelled, so the label is the lead's README name in brackets.
G, F, A = 'grounded', 'may float', 'attached'
L = 'later world'
K = {
 'N-01-a': ('unlabelled (big mossy boulder)', 'rock', 'both', G, 'Sits on its own painted dirt pad (part of the piece): lay the pad on the ground line.'),
 'N-01-b': ('unlabelled (three-rock cluster)', 'rock', 'both', G, 'Three rocks on one dirt pad; uneven top.'),
 'N-01-c': ('unlabelled (rock spire with crystals)', 'rock', 'W1', G, 'Tall pointed spire with small white crystals at its foot. The spire tip is sharp but reads as rock, not a hazard; decor, never a landing.'),
 'N-01-d': ('unlabelled (stacked cairn stones)', 'rock', 'both', G, 'A cairn (three stacked stones) on a dirt pad: fills the cairn on the W2 prop list. Rounded top stone.'),
 'N-02-a': ('unlabelled (root-bound boulder)', 'rock', 'W1', G, 'Boulder caged in roots.'),
 'N-02-b': ('unlabelled (rock steps with chanterelles and blueberries)', 'step set piece', 'W1', G, 'Low stepped rock with a chanterelle cluster on top (the mushrooms block the top step).'),
 'N-02-c': ('unlabelled (vine-wrapped block)', 'block', 'W1', G, 'Square stone block wrapped in roots and vines, ferns at its foot.'),
 'N-02-d': ('unlabelled (root-bound boulder)', 'rock', 'W1', G, 'Second root-bound boulder, a leaf and small purple mushrooms on it; twin of N-02-a.'),
 'N-02-e': ('unlabelled (floating earth island with hanging roots)', 'walkable log or plank', 'W1', F, 'Earth island platform (not a log): mossy top, roots hanging under it. Platform-looking, so it may float (Matt 11-07).'),
 'N-02-f': ('unlabelled (mossy pillar)', 'rock', 'W1', G, 'Tall stone pillar under moss and roots.'),
 'N-03-a': ('unlabelled (tall grey rock)', 'rock', 'both', G, 'Tall grey boulder on a dirt pad; domed top.'),
 'N-03-b': ('unlabelled (dark smooth boulders)', 'rock', 'both', G, 'Two dark blue-grey boulders on a dirt pad.'),
 'N-03-c': ('unlabelled (stacked river stones)', 'rock', 'both', G, 'Stacked river stones on a dirt pad: a second cairn.'),
 'N-03-d': ('unlabelled (white jagged rock)', 'danger-looking', L, G, 'FLAG: white jagged spikes read as sharp (ice or crystal spikes): treat as danger or keep it off landings. Reads more like a cave or ice world than the W1 rainforest.'),
 'N-04-a': ('unlabelled (basalt column cluster)', 'rock', L, G, 'Dark hexagonal basalt columns: a volcanic look, a later world more than W1.'),
 'N-04-b': ('unlabelled (red sandstone arch)', 'den or hide spot', L, G, 'Wind-carved red sandstone arch: a desert or canyon look, not the rainforest. A walk-through arch.'),
 'N-04-c': ('unlabelled (amethyst geode)', 'plant or dressing', L, G, 'Purple crystal geode: decor for a cave or crystal world. Not danger-looking, but the crystals are sharp.'),
 'N-04-d': ('unlabelled (black glossy spheres)', 'rock', L, G, 'Glossy black spheres on a dirt pad: can read as bombs or eggs to a child. Judge before use; a later world.'),
 'N-05-a': ('unlabelled (rock spire with roots)', 'rock', 'W1', G, 'Pointed rock spire with roots at its foot; decor, never a landing.'),
 'N-05-b': ('unlabelled (boulder cave)', 'den or hide spot', 'both', G, 'A dark cave mouth in a boulder mound, a small purple crystal inside.'),
 'N-05-c': ('unlabelled (stacked stone slabs with vines)', 'step set piece', 'W1', G, 'Three stacked slabs, vine-tied: a short climb or a block.'),
 'N-05-d': ('unlabelled (long cliff ledge with a tree)', 'rock', 'W1', G, 'A long rock ledge, moss along the top, a root-tree at the right end: a big grounded ledge.'),
 'N-05-e': ('unlabelled (boulder den)', 'den or hide spot', 'both', G, 'Low boulder den with a dark doorway.'),
 'N-05-f': ('unlabelled (standing stone with runes)', 'plant or dressing', 'W1', G, 'Mossy standing stone; the carved marks are faint and are not words.'),
 'N-06-a': ('unlabelled (vine-wrapped snag)', 'tree', 'W1', G, 'Broken trunk wrapped in vines with bromeliads: backdrop or a climb.'),
 'N-06-b': ('unlabelled (long mossy broken log)', 'walkable log or plank', 'W1', F, 'Long broken log, mossy, splintered right end; ragged top.'),
 'N-06-c': ('unlabelled (big broken stump)', 'tree', 'W1', G, 'Big broken stump with spreading roots and a jagged top: decor, not a stand.'),
 'N-06-d': ('unlabelled (burnt stump)', 'tree', 'W1', G, 'Charred jagged stump with a fern.'),
 'N-06-e': ('unlabelled (palm-trunk snag)', 'tree', 'W1', G, 'Broken palm trunk. Matt painted a smeared ledge across its top; the ledge was cut away (see rejected) and a few px of its smear may remain in the notches of the broken top.'),
 'N-06-f': ('unlabelled (hollow stump)', 'den or hide spot', 'W1', G, 'Dark hollow stump with a fern inside.'),
 'N-07-a': ('unlabelled (cut stump with ring top)', 'block', 'W1', G, 'Stump step: sawn ring top in three-quarter view.'),
 'N-07-b': ('unlabelled (cut log)', 'walkable log or plank', 'W1', F, 'Sawn log on a diagonal with its end grain showing: three-quarter view, not side-on.'),
 'N-07-c': ('unlabelled (cut stump, small)', 'block', 'W1', G, 'Small stump step with a fern; ring top in three-quarter view.'),
 'N-07-d': ('unlabelled (cut stump on roots)', 'block', 'W1', G, 'Wide stump step on spreading roots and a mud pad.'),
 'N-08-a': ('unlabelled (fern tree with a fungus pad)', 'tree', 'W1', G, 'Bushy fern crown on a twisted trunk, a bright fungus pad on its side. Grey-ground sheet: checked for a grey halo, none.'),
 'N-08-b': ('unlabelled (shelf fungus steps on a trunk)', 'step set piece', 'W1', G, 'Three bright fungus pads on a twisted trunk: a climb in three steps.'),
 'N-08-c': ('unlabelled (moss block)', 'soft landing', 'W1', G, 'Square moss-covered block: a soft landing.'),
 'N-08-d': ('unlabelled (vine nest with fungus)', 'soft landing', 'W1', G, 'Vine nest, a fungus pad on top; hanging vines underneath.'),
 'N-09-a': ('unlabelled (three-tier root-stepped tree platform)', 'step set piece', 'W1', G, 'Four mossy tiers on a root trunk: a big climb set piece. Matt\'s prompt text on the sheet is not in it.'),
 'N-09-b': ('unlabelled (two root-trunk platforms joined by a root)', 'step set piece', 'W1', G, 'Two root-trunk platforms joined by a root bridge; leaves on top.'),
 'N-10-a': ('Springy moss coltton cushion mound', 'soft landing', 'W1', G, 'Big moss cushion (label as printed).'),
 'N-10-b': ('Large elastic layered shelf fungus trampolirre platform', 'soft landing', 'W1', A, 'Shelf fungus stack with a moss top (label as printed); bracket fungus attaches to a trunk, like M-07-a.'),
 'N-10-c': ('Large pluβweed Leaf Nest', 'soft landing', 'W1', G, 'Leaf pile (label as printed); same family as M-07-c.'),
 'N-10-d': ('Large coiledd Vine trampoine mat', 'soft landing', 'W1', G, 'Coiled vine mat on a frond base (label as printed); same family as M-07-b.'),
 'N-11-a': ('unlabelled (hollow stump)', 'den or hide spot', 'W1', G, 'Hollow stump with elephant-ear leaves around it.'),
 'N-11-b': ('unlabelled (cut stump with a flower)', 'block', 'W1', G, 'Stump step; a dark flower sits on the top and berries on the side, so the flower blocks the middle of the top.'),
 'N-11-c': ('unlabelled (dark scaled stump)', 'block', 'W1', G, 'Dark bark-scaled stump step, a small blue patch on its top.'),
 'N-11-d': ('unlabelled (cut stump with a mushroom)', 'block', 'W1', G, 'Stump step, an orange mushroom on its side.'),
 'N-12-a': ('unlabelled (vine ladder)', 'step set piece', 'both', A, 'A climb: vine rails, wooden rungs. Hang it from a ledge or trunk.'),
 'N-12-b': ('unlabelled (mossy wood block)', 'block', 'W1', G, 'Side-on wooden block, moss on top: flat top.'),
 'N-13-a': ('unlabelled (mossy wood block)', 'block', 'W1', G, 'A shorter twin of N-12-b.'),
 'N-13-b': ('unlabelled (vine ladder)', 'step set piece', 'both', A, 'A climb: vine rails, wooden rungs; a shorter twin of N-12-a.'),
 'N-13-c': ('unlabelled (wooden vine-wrapped ladder)', 'step set piece', 'both', A, 'A climb: red wooden rails wrapped in vine.'),
 'N-13-d': ('unlabelled (short horizontal vine ladder)', 'walkable log or plank', 'both', A, 'A rope-and-rung bridge piece: tie both ends to posts or ledges (never free-floating).'),
}
R = {}
LABELTEXT = {}
STAND = {'walkable log or plank', 'block', 'lily pad', 'soft landing', 'rock', 'puzzle piece'}
HAND = {'step set piece'}
SMALL_OK = set()
# A reject that is not a keyed piece: the lead ruled it out, so it was cleared from the sheet before keying; rejected/ holds the
# raw sheet crop as the record.
EXTRA_REJ = {'N-06-ledge': ('unlabelled (pink-smeared floating ledge)', 'walkable log or plank', 'both', F,
             'the lead ruled it out: Matt painted it fading into the magenta ground on its right half, so it cannot be keyed clean',
             'N-06-ledge-raw.jpg', 470, 210)}
