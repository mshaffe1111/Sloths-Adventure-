# ART-678b REPORT (t-art-678b from t-art-678@273d8b4), 12:47 AM ET 11-14. CPU only: no Hugging Face job, $0 spent.
**Done (5/5 FAILS, in order; sheets in reference/qa-reports/ART-678b/, each prints piece, size, backdrop, source):**
1. Underlayer (round 2, the lead's FAIL: band b's grass lip read as a floor he falls through). w1-underlayer-deep (tools/art/hf678/
   underdeep.py, from under-53): grass cut away along a ragged periodic earth edge, dark under-lip, darker and hazier with depth; wrap 1.1.
   under-deep-before-after.jpg: the real 1-1 upright frame (POLISH-3 still, Normal, 412x915 at 2x) / round-1 grass band (FAILED) / deep
   band with its top at y 1540, ~48 u below the lowest ledge, foreground leaves and berry kept whole (no scraps). under-deep-tiled3.jpg:
   3x on LIGHT + DARK, no seam. The grass-lipped a/b assets are deleted (new replaces old; raws + recut.json regenerate them).
2. Drape split: w17-moss-drape now moss-37's drape (hand box, the tree's area dropped); the little moss tree is w17-moss-fork (own hand box).
   The old moss-11 drape kept as w17-moss-drape-b with both twig ends rounded (variety). before-after.jpg row 7, all-after-2.jpg.
3. Beak: all 4 harpy perch-feet re-cut; a grey take is keyed by distance only (no haze rule: it ate the white crest) and a `protect` box
   keeps the beak (its fill is 119-130 grey on a 129 take: colour can't save it). The grey gap between the legs is cleared (pocket rule).
4. Halo: root cause found: the model's line is dark MAROON (30,5,18), inside key_own's hue window, so the old cut ate parts of the line and
   left dashes floating outside (the "halo"); plus the take's pink haze kept by distance. New tools/art/hf678/recut.py: border flood, line
   kept (hue rule only above value 100), 1 px in + 0.8 px blur, rim takes the nearest solid colour, key-hue cast cut 75% on the outer 3 px.
   Every cut redone; clean on LIGHT, DARK, green and the real 1-1 frame (before-after.jpg; all-after-1/2.jpg). The old cannonball was broken.
5. Beside Pokey at 89.1 u: beside-1..5.jpg (planned ship sizes, 3 px/unit). Posts (round 2, the lead's ruling): layer **support**, no cap
   (added to inventory.ts Layer + LEVEL_LAYERS and catalog_master.py, with a test). w1-livepole (hi-res livepost-tall, 370 u) replaces
   the 1-4 square plank pole at its own height and width: pole-1-4-before-after.jpg (t-int-4 GATES-4 still, Normal, landscape at 2x).
   Taller poles: tools/art/hf678/polebuild.py tiles one vine turn (rows 380/726, best-match search); cap and foot joins are the original
   picture, tile joins blend: pole-tiles.jpg (x1/x2/x3, LIGHT + DARK, no ghosting). 27 catalog rows -> CATALOG-MASTER.csv -> --emit.
   Snake: a -28 deg hue shift reads vine-brown (beside-2), but the game's climb vines are yellow-green: olive matches them; lead's pick.
   w1NutPod (an open pod, 49 u) vs the palm nut (whole, 28 u): different things, same painted style (beside-4).
**Gates:** artcheck PASS, knowncheck PASS, generality PASS, tsc 0, art tests 10/10, BASE_PATH build 0, chunkcheck PASS; full suite: SUITE.
roadmapcheck: "shallow clone, proofs cannot be checked": FAIL (no ROADMAP line changed). drawcheck/clipcheck not run (nothing wired).
**Pushback:** the frame is POLISH-3's shot (its labels from the shooter's file name), not reshot by me; Pokey's px in each frame measured
by eye (148 / 117 px). The inventory test fails any 1-piece new slot not on CATALOG-MASTER.md's gap line, and only --merge rewrites the .md.
**Unresolved:** nothing wired. The deep band is 223 u tall: a taller phone needs the engine to fill below it (its haze colour).
In the pole mock one old vine leaf peeks at the trunk's right edge (the old pole is still drawn under it; gone once it is replaced).
**Lessons applied:** D41 (89.1), D61 (pass/fail stills), D62 (every sheet prints what it shows), D64 (context vs 1M), D57 (queue at each push), D52 (cites last).
**Method update (hf-art.md "Cutting"):** cut pink/grey takes with recut.py: border flood + line kept + rim despill; never a key by hue on dark
px (outlines are maroon); a part whose fill is the key's grey gets a protect box; catalog rows: one slot a family, never a 1-piece slot.
**Turnover:** reference/handoffs/art-director.md §0e rewritten (this commit).
**EXACT NEXT STEP:** the lead judges under-deep-before-after.jpg, pole-1-4-before-after.jpg, pole-tiles.jpg, beside-2 (snake hue);
an Engine packet wires w1-underlayer-deep (R-165.224), w1-livepole (1-4's plank poles) and the pieces into 1-6..1-8.
## Learned
Find the cause of a halo before despilling it: here the "halo" was the line itself, cut to dashes by a hue key. A border flood that the
line stops keeps every colour inside it (beaks, crests, bellies); judge each cut on light AND dark, at 1:1 zoom on one bad edge first.
