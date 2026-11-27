# KIT-W3a: World 3's TOWER bricks (R-165.504; content/kit, Opus 5.5 high). Branch t-kit-w3a, cut from t-eng-w3 13135bf6b

## ENG-CATCH-b repro (R-165.534; the lead's ruling, box 3: the storey's hole under a brick piece's fall line is tower wood)
Branch t-kit-w3a 88b0a0304 (= 610ef2e63 + t-eng-catch 8a204af87; cap-steps back in W3_DOWN_TOWER, all four tower bricks in the kit).
Repro: `GEN2_DRAFT=3-1 KEEP=w3-root-down,w3-two-roots,w3-cap-down,w3-cap-steps VERBOSE=1 npx tsx reference/qa-reports/KIT-W3a/probe/patch.mts`
-> 10/12, reds easy 2 and easy 4 (each brick alone 12/12; root-down + two-roots + cap-down 12/12).
- EASY seed 2: "tower: a blind drop off the piece at x 650-919, y 7121: 481 px to its landing (in view: within 300)". The piece is plat 46,
  w3-cap-steps' cap shelf b (section s15 w3-cap-steps@n5, laid LEFTWARD, x 182-1256: s plat 45 x 919-1109 y 6991, b 46, cap 47 x 702-772
  y 7091, lip 48 x 456-650 y 6946, exit shelf c 49 x 182-456 y 7096). Next: s16 w3-ledge@n6 (a rest) plat 50 x 136-554 y 7377; the
  tower's floor on that storey starts at plat 100 x 654-716 y 7377 (then 101 x 716-1033). THE HOLE: x 554-654 at y 7377, under b's far
  end (x 650); a walk off b falls through it 481 px to the storey after.
- EASY seed 4: the same shape, plat 44 (b) x 610-896 y 7021 (s15 w3-cap-steps@n5, x 142-1256), cap 45 x 666-736 y 6991; next s16
  w3-ledge@n6 plat 48 x 96-511 y 7273; tower floor plat 105 x 611-676 y 7273. THE HOLE: x 511-611 at y 7273 under b's far end (x 610);
  the fall 477 px.
- The shape is general (cap-down too): a bounce brick's cap shelf b runs on under the lip, and its exit shelf c (150 px under the lip)
  lies ABOVE b; a walk off b's far end is caught only by the storey below. Diag: `GEN2_DRAFT=3-1 D=easy S=2 Y=7121 npx tsx reference/qa-reports/KIT-W3a/probe/diag.mts` ( the sections in order and
  every platform within 200/520 px of y) is the probe's x-y read; the same lines come from the probe's VERBOSE output.

## ENG-CATCH repro (R-165.526; the lead's ruling 11-27: the engine lane starts here)
Branch t-kit-w3a, the head that carries this line (base 13135bf6b t-eng-w3). The 3-1 DRAFT (stageTable DRAFT_TABLE '3-1', World 3's kit,
travel down), readied as tools/engine/draft.ts readies it. Repro: `GEN2_DRAFT=3-1 KEEP=<id> VERBOSE=1 npx tsx
reference/qa-reports/KIT-W3a/probe/patch.mts` (seeds 1-6 x both, only that brick of W3_DOWN_TOWER / W3_PARKED in the kit).
- w3-cap-down, EASY seed 1: the tower's catch bough x 934-1114, y 6996 (catchW 180, platform id 180), laid under the open end of the
  tower's own bridge x 608-1000, y 6863; the brick's exit shelf is x 750-1069, y 7193; the bough's right end drops 370 px to the next
  storey (x 1003-1183, y 7366), TOWER.see 300: "a blind drop off the piece at x 934-1114, y 6996: 370 px".
- w3-cap-steps (PARKED), NORMAL and EASY seed 5: the tower's run-on of the lip, x 718-934, y 9346 (id 174, level with the lip 564-718),
  over the exit shelf x 718-952, y 9496; its end's fall line misses the shelf and drops 323 px to y 9669.
- w3-cap-steps, NORMAL and EASY seed 3: "a catch passes its storey": the catch x 799-1280, y 8659, where the vine at x 824 stops, runs wall
  to wall and hands him past his storey at y 8944.

## EXACT NEXT STEP (box 2, written 9:21 AM ET Fri 11-27 by `date`; box 1's step is done to its item 2)
1. Box 3: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`;
   `npm ci --legacy-peer-deps` in the background. ReadNotifications FIRST: the lead's ruling on cap-down (asked in box 2, see below).
2. Where b stands (the lead's ruling 1, 11-27): w3-cap-steps PARKED (W3_PARKED in w3.ts, out of the kit; 8/12, its 4 reds are above,
   all tower wood; variety cost: ONE bounce shape in the down tower until it returns). NO landing until ENG-CATCH merges and cap-down
   and cap-steps re-probe clean; then the down kit lands ONCE, cap-steps back in W3_DOWN_TOWER. w3-cap-down kept, ledge 290-310 (shuts the double: a double flick from 70 px reaches 283-287 px, reach.ts), 11/12: easy
   seed 1 is a blind drop off the TOWER'S OWN catch bough (towerCatches, x 934-1114 y 6996, under its bridge 608-1000 y 6863; its right end
   overhangs the exit shelf and drops 370 px, TOWER.see 300): ENG-CATCH's (ruled). 13 data variants tried (probe/patch.mts,
   PATCH='b.w=290,310;exitDy=..'): none clean but ledge 240-260, REJECTED (opens the double past the bounce). 290-310 APPROVED.
   Three bricks together (root-down, two-roots, cap-down): see "Probes" below.
3. The counting test (new src/game/gen2/worlds/w3Tower.test.ts): W3_DOWN (w3Ledge/w3Drops/w3Walk) are UNTYPED in w3.ts (no content /
   jobs); type them in the test the audit kit's way (origin/t-audit-w3 reference/qa-reports/AUDIT-W3/scratch.patch, w3Audit.ts
   w3AuditBricks + auditKit: drops 'ground', walk 'floating', ledge as arrive/rest/exit) with W3_DOWN_TOWER as is; readyDraft('3-1') then
   buildGen2Stage({config, kit, seed, difficulty}) with kit = LISTED['3-1'].kit() whose manifest graphs.list is ONE graph of 3-1's
   trimmed code `A Tg1 D_ Pf1< Xg1> R Dc1_ Wf1> R Pb1< Cg1> R Sf1_< E` and briefs['3-1'] dealExact. Assert each c / b node's section is
   a W3_DOWN_TOWER id. Planted red: W3_DOWN_TOWER emptied -> the c/b asks refuse.
   Fact (box 2): w3.ts's manifest has NO graphs; the test's kit sets manifest.graphs = { list: [{ id, archetype, code }], briefs:
   { '3-1': brief }, maxPerStage } as auditKit does (brief: ends 'quiet', trend 'level', branching 'none', deal from parseCode +
   TYPE_OF_LETTER, dealExact true). Each built section carries `node` (st.gen2.sections[].node) to match against the code's c / b nodes.
   cap-down's easy-1 red is ENG-CATCH's: the test asserts the bricks are DEALT (counted), not that the roll is clean.
4. 3-1's AFTER-roll, then the gates, then the landing: box 1's items 4-5 (below, unchanged).
## Box 1's step (items 1-3 done in box 2; 4-5 still to do; box 1's fixes (a)-(f): `git show 782df622e:reference/qa-reports/KIT-W3a/REPORT.md`)
4. AFTER roll: worktree on the candidate + `git apply` origin/t-audit-w3:reference/qa-reports/AUDIT-W3/scratch.patch, add W3_DOWN_TOWER to
   w3AuditBricks (maxPerStage cap), then `AUDIT_CAP=20 ./tools/audit/roll.sh 3-1 w3 "<code>" down down` and the same with `wide`.
   BEFORE (this box, base 13135bf6b, 4 seeds x both): before-31-wide.txt and before-31-w3.txt here: clean 0/8 on each; 180 refusal lines
   on each, 108 of them the c / b gap ("pool short ... no climb/bounce section left", "content 'c'/'b': ... sections are ground").
   Send the lead before/after; if 3-1 rolls CLEAN, say so at once (BUILD-31 starts on it).
5. Gates on the candidate (frozen, D115, src/game/gen2/proven/ writable): tsc; CI tool line; lockall --check (ONE run); suite in 6 shards;
   generalitycheck; artcheck. Land on t-eng-w3 (fast-forward; merge + re-gate if it moved). Then 3-4's rising bricks, then 3-5's sockets.

## Probes (box 2, head = this commit; 3-1 draft, seeds 1-6 x both)
- root-down + two-roots + cap-down together: 11/12, 1 blind drop (the tower catch above). cap-down alone, 290-310: 11/12 (easy 1).

## Art (STAGE-RULES §4-5b; inventory w3.json)
- climb: the tower's own climbing vine (the one every turn of 3-1's draft hangs): drawn from the World 1 vine columns, which the inventory
  marks "needs fix: under 1.5x its play size" (2.24 Pokey): an OPEN rough spot the audit named (scale check), not new with these bricks.
- bounce: World 3's own cap and stalk, bounce#cap-w3 / bounce#stalk-w3 (in game, 0.55 Pokey, scale ok): named in W3_ART.bounce.
- shelves: World 3's branch shelf w3#branch (in game). Every shelf 140 px or wider (1.6 Pokeys and more).
- Not used (no draw path, NAMED not stretched): w3-next#mat-s23 (the fungus mat), w3-next#rim*-s11/-s23 (lit rims): "cut, not placed".
