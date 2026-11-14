# ART-678b REPORT (t-art-678b from t-art-678@273d8b4), 12:47 AM ET 11-14. CPU only: no Hugging Face job, $0 spent.
**Done (5/5 FAILS, in order; sheets in reference/qa-reports/ART-678b/, each prints piece, size, backdrop, source):**
1. Underlayer: under-11 -> w1-underlayer-a, under-53 -> -b: key_top (only key joined to the top goes clear; band opaque), wrap closed by
   hflist1/wrapfix.py: join diff 2.8 / 2.5 (method limit 6). under-{a,b}-tiled3.jpg: 3x side by side, LIGHT + DARK, no seam at the ticks.
   under-{a,b}-frame.jpg: in the real 1-1 upright frame (POLISH-3 still, Normal, 824x1830 = 412x915 at 2x, t-polish-3@a9d6b1bc), band behind the
   lowest strip at 0.55x (Pokey 148 px = 1.66 px/unit): fog gone, the ground reads as earth and roots under the climb; join at x 412 unseen.
   Pick: **b** (darker, cleaner); a has light rain-streak marks in the soil.
2. Drape split: w17-moss-drape now moss-37's drape (hand box, the tree's area dropped); the little moss tree is w17-moss-fork (own hand box).
   The old moss-11 drape kept as w17-moss-drape-b with both twig ends rounded (variety). before-after.jpg row 7, all-after-2.jpg.
3. Beak: all 4 harpy perch-feet re-cut; a grey take is keyed by distance only (no haze rule: it ate the white crest) and a `protect` box
   keeps the beak (its fill is 119-130 grey on a 129 take: colour can't save it). The grey gap between the legs is cleared (pocket rule).
4. Halo: root cause found: the model's line is dark MAROON (30,5,18), inside key_own's hue window, so the old cut ate parts of the line and
   left dashes floating outside (the "halo"); plus the take's pink haze kept by distance. New tools/art/hf678/recut.py: border flood, line
   kept (hue rule only above value 100), 1 px in + 0.8 px blur, rim takes the nearest solid colour, key-hue cast cut 75% on the outer 3 px.
   Every cut redone; clean on LIGHT, DARK, green and the real 1-1 frame (before-after.jpg; all-after-1/2.jpg). The old cannonball was broken.
5. Beside Pokey at 89.1 u: beside-1..4.jpg (each at its planned ship size, 3 px/unit). Posts in the real 1-4 start frame beside Pokey and the
   old square post (posts-1-4-frame.jpg, t-int-4@2136fa9b). 26 catalog rows (tools/art/hf678/rows.py) -> CATALOG-MASTER.csv -> --emit (w1.json
   +24, cast.json +2 bands). Scale (R-165.107): **livepost-mid/-tall 1.23 Pokeys = FLAGGED n** (platform cap 1.0); short 0.90 ok.
   Snake: a -28 deg hue shift reads vine-brown at ship size (beside-2), but the game's climb vines are yellow-green: olive matches them; lead's pick.
   w1NutPod (an open pod, 49 u) vs the palm nut (whole, 28 u): different things, same painted style (beside-4).
**Gates:** artcheck PASS, knowncheck PASS, generality PASS, tsc 0, art tests 9/9, BASE_PATH build 0, chunkcheck PASS; full suite: SUITE.
roadmapcheck: "shallow clone, proofs cannot be checked": FAIL (no ROADMAP line changed). drawcheck/clipcheck not run (nothing wired).
**Pushback:** the frame is POLISH-3's shot (its labels from the shooter's file name), not reshot by me; Pokey's px in each frame measured
by eye (148 / 117 px). The inventory test fails any 1-piece new slot not on CATALOG-MASTER.md's gap line, and only --merge rewrites the .md.
**Unresolved:** nothing wired; the mid/tall post scale flag needs a ruling (ship at <= 89 u or use as poles); band height (266 u) ends
above the bottom on a tall phone: the engine must extend or tile it down.
**Lessons applied:** D41 (89.1), D61 (pass/fail stills), D62 (every sheet prints what it shows), D64 (context vs 1M), D57 (queue at each push), D52 (cites last).
**Method update (hf-art.md "Cutting"):** cut pink/grey takes with recut.py: border flood + line kept + rim despill; never a key by hue on dark
px (outlines are maroon); a part whose fill is the key's grey gets a protect box; catalog rows: one slot a family, never a 1-piece slot.
**Turnover:** reference/handoffs/art-director.md §0e rewritten (this commit).
**EXACT NEXT STEP:** the lead judges before-after.jpg, under-b-frame.jpg, posts-1-4-frame.jpg, beside-2 (snake hue); rules on the post
scale; an Engine packet wires band b (R-165.224) and the pieces into 1-6..1-8.
## Learned
Find the cause of a halo before despilling it: here the "halo" was the line itself, cut to dashes by a hue key. A border flood that the
line stops keeps every colour inside it (beaks, crests, bellies); judge each cut on light AND dark, at 1:1 zoom on one bad edge first.
