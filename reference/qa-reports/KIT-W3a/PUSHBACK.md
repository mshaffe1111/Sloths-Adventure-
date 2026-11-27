# KIT-W3a box 6 PUSHBACK: the drop toys' ruling cannot be met as written on today's engine (step 2)

The ruling: lay w3Noise's drop toys (moss, stone: a 400 px drop) OUTSIDE a tower, on a level-stage row where the drop is in view,
picked by property (dropClear, planted). The 400 px number stays (3-5's design).

Evidence (probe: `reference/qa-reports/KIT-W3a/probe/drop.mts`, the toy exactly as w3Noise lays it, Normal; on the box 6 merge):
1. No World 3 level-stage row exists. DRAFT_TABLE (stageTable.ts:93-97) holds 3-1 alone (travel down); 3-2..3-9 are the live
   hand-built stages (protoStage.ts HAND_STAGES), and KIT-W3b's 3-2 tests roll their own kit (w3Level.test.ts rollKit), not a row.
2. 3-1's row laid ALONG (its config with travel right): 0 of 40 clean ("no section fits node n2 (ki)" 31 throws; checkpoint
   reach 81 lines). The way down's bricks are not a level stage's.
3. 3-2's config on World 3's REAL kit (w3World(), W3_LEVEL bricks in its pool) rolls clean 39 of 40, but the run lay NEVER lays the
   400 px toy: picked 0 of 40 (untyped) and 0 of 40 (typed ground, the level bricks' jobs). Same toy at a 0 px drop: picked and clean
   10 of 12; at 120 px: picked 6 of 12. The run lay refuses a section whose exit leaves World 3's corridor (pipeline.ts:2420 `endY`,
   the pick's corridor test; w3.ts manifest `corridor: { top: G - 260, bottom: G + 60, soft: 80 }`: 320 px, 400 with the soft band,
   and only from an entry at the very top). A corridor 480 px tall (probe CORR=480) still picked 0 of 12 (rest nodes then fail).
So on a World 3 level stage a 400 px drop is not laid by today's run lay; in a down tower it is past TOWER.see (300) and is caught.

Options (the lead's call; I recommend 1, then 2):
1. ENGINE-WORTHY (level.md rule 22/26): the run lay may lay a DESIGNED drop past its corridor (a section that names its drop, e.g.
   `place.drop: true`, lays its floor at its own depth and the run's ground follows it), proven by a toy on a real row. Then a 3-2
   DRAFT row (`'3-2': { kit: 'w3' }`, along) and the drop toys played on it in w3Noise (dropClear and its plant kept).
2. 3-5's own build lays the drop (its design owns the 400 px): a level leg (/R) of 3-5's arc where the drop is in view, and the toys
   move to 3-5's row when it exists. Until then the moss / stone tests stay red BY NAME ("no roll ... lays the moss toy") and are
   named as inherited debt of 3-5's design, not as a pass.
3. (ruled out by the lead: the drop number changes.)
What I did meanwhile: nothing laid or committed for step 2; the merge (step 1) is committed and pushed, and steps 3-7 go on.
