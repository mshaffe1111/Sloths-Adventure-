# P batch (Matt's 11 sheets of 11-11 from the lead's prompts; 1024 px sheets): (label, kind, world, float, notes).
# 'ground strip' is a kind the packet's list predates (first ground pieces). No 600 px floor this batch (the lead, 11-11).
G, F, A = 'grounded', 'may float', 'attached'
ANG = 'FLAG: angled, not side view (drawn at a 3/4 angle, the top shows). '
SMALL = 'Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone. '
NT = 'Ends are rounded and outlined, so it does not tile end to end without overlapping the next piece by about 15 px. '
K = {
 'P-01-a': ('leaf-litter ground strip', 'ground strip', '', G, 'Straight ends but the colours differ across the wrap (mean 25 levels): a visible seam if tiled; blend or overlap.'),
 'P-01-b': ('mossy earth block with roots', 'block', '', G, 'Square earth block, moss top.'),
 'P-01-c': ('mossy earth block with roots', 'block', '', G, 'Twin of P-01-b.'),
 'P-01-d': ('narrow pit between two earth lips', 'danger-looking', '', G, 'A one-piece narrow pit: the lips are square blocks (not separate left and right caps). The pit inside was painted in the ground\'s hue; it is now a near-black shaft (cutter/pitfix.py) so the drop reads as deep. A thin dark line crosses the top of the gap as painted.'),
 'P-02-a': ('grassy earth slab', 'block', '', G, ANG),
 'P-02-b': ('gravel earth slab', 'block', '', G, ANG),
 'P-02-c': ('plank-topped earth slab', 'block', '', G, ANG + 'The plank top is a made thing.'),
 'P-02-d': ('pebbled earth slab', 'block', '', G, ANG),
 'P-03-a': ('moss-root ground strip', 'ground strip', '', G, NT + 'Side view, flat top.'),
 'P-03-b': ('moss-root strip with leaf litter', 'ground strip', '', G, NT),
 'P-03-c': ('rounded end cap', 'ground strip', '', G, 'The end of a ground run.'),
 'P-03-d': ('step up with roots', 'ground strip', '', G, 'A one-step rise in the ground line.'),
 'P-04-a': ('moss-root ground strip', 'ground strip', '', G, NT + 'Near-twin of P-03-a.'),
 'P-04-b': ('moss-root strip with leaf litter', 'ground strip', '', G, NT + 'Near-twin of P-03-b.'),
 'P-04-c': ('long strip', 'ground strip', '', G, 'The long strip (965 px): ' + NT.lower() + 'Checked by placing two copies end to end.'),
 'P-04-d': ('rounded end cap', 'ground strip', '', G, 'Near-twin of P-03-c.'),
 'P-04-e': ('end cap and step joined', 'ground strip', '', G, 'Cap, run and a step up in one piece.'),
 'P-05-a': ('short moss help step', 'block', '', G, 'Rounded-end moss block: a low help step.'),
 'P-05-b': ('moss help step, tall', 'block', '', G, 'Taller moss block with roots.'),
 'P-05-c': ('moss help step, tallest', 'block', '', G, 'Tall moss block; a ledge or wall step.'),
 'P-05-d': ('moss block with a flat top band', 'block', '', G, 'Long low moss ledge with a flat band on top.'),
 'P-06-a': ('mossy fallen log, flat top', 'walkable log or plank', '', F, 'Natural fallen log with a flat top; no sawn ends.'),
 'P-06-b': ('sawn ring-top stump', 'block', '', G, 'Sawn (a made thing): not World 1 (the lead).'),
 'P-06-c': ('sawn ring-top stump', 'block', '', G, 'Sawn: not World 1.'),
 'P-06-d': ('tall sawn ring-top stump', 'block', '', G, 'Sawn: not World 1.'),
 'P-07-a': ('thorn bramble', 'danger-looking', '', G, 'Reads as danger: a painted thorn hazard.'),
 'P-07-b': ('snapping plant', 'danger-looking', '', G, 'Venus-trap jaws: reads as danger.'),
 'P-07-c': ('thorn-covered log', 'danger-looking', '', G, 'A log bristling with thorns: a hazard, never a landing.'),
 'P-07-d': ('glowing nettles', 'danger-looking', '', G, 'The glow was blended into the magenta; unmixed (cutter/softfix.py). A warm pink-orange glow remains around the tips, as painted.'),
 'P-08-a': ('carved block with thorny vines', 'danger-looking', '', G, 'The thorns on top make it a hazard, not a step (the lead).'),
 'P-08-b': ('ruin column', 'block', '', G, 'Broken fluted column: a standable pillar top.'),
 'P-08-c': ('ruin stairs', 'step set piece', '', G, ANG + SMALL),
 'P-08-d': ('ruin arch', 'den or hide spot', '', G, 'Carved stone arch with a dark doorway. ' + SMALL),
 'P-09-a': ('basalt slab', 'rock', '', G, 'Dark basalt slab, flat-ish top.'),
 'P-09-b': ('lava-veined steps', 'step set piece', '', G, 'Basalt steps with glowing lava cracks: reads hot; decide if the veins hurt.'),
 'P-09-c': ('glowing lava crust', 'danger-looking', '', G, 'A painted lava hazard.'),
 'P-09-d': ('steaming stone vent', 'danger-looking', '', G, 'Stone-block vent with steam; the steam was unmixed from the magenta (softfix.py) and is now see-through grey.'),
 'P-10-a': ('dripping cliff ledge', 'rock', '', G, 'Overhanging mossy cliff ledge with drips. ' + SMALL),
 'P-10-b': ('stone with a waterfall', 'rock', '', G, 'The waterfall\'s soft edges were unmixed from the magenta, and its leftover violet cast moved back to blue (softfix.py, waterfix.py); clean on dark and light.'),
 'P-10-c': ('pillar in mist', 'rock', '', G, 'The mist was unmixed from the magenta: now see-through grey, no pink halo.'),
 'P-10-d': ('root curtain', 'plant or dressing', '', A, 'A hanging curtain of roots: hide behind it, or a climb. ' + SMALL),
 'P-11-a': ('scaffold', 'step set piece', '', G, 'Lashed pole scaffold: a made thing. ' + SMALL),
 'P-11-b': ('rope bridge', 'walkable log or plank', '', A, 'Rope-and-plank bridge: tie both ends.'),
 'P-11-c': ('palisade', 'plant or dressing', '', G, 'FLAG: angled, not side view. Sharpened stakes: the points can read as danger. ' + SMALL),
 'P-11-d': ('dock with water', 'walkable log or plank', '', G, 'Plank dock on posts over a strip of painted water. ' + SMALL),
}
R = {}; LABELTEXT = {}; SMALL_OK = set(K)
STAND = {'walkable log or plank', 'block', 'lily pad', 'soft landing', 'rock', 'puzzle piece', 'ground strip'}
HAND = {'step set piece'}
