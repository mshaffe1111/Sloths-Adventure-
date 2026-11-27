# KIT-W3a: World 3's TOWER bricks (R-165.504; content/kit, Opus 5.5 high). Branch t-kit-w3a, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 2, written 9:21 AM ET Fri 11-27 by `date`; box 1's step is done to its item 2)
1. Box 3: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`;
   `npm ci --legacy-peer-deps` in the background. ReadNotifications FIRST: the lead's ruling on cap-down (asked in box 2, see below).
2. Where b stands: w3-cap-steps DROPPED (ruling 1; 8/12, its comment in w3.ts names why and the variety cost: ONE bounce shape in the
   down tower). w3-cap-down kept, ledge 290-310 (shuts the double: a double flick from 70 px reaches 283-287 px, reach.ts), 11/12: easy
   seed 1 is a blind drop off the TOWER'S OWN catch bough (towerCatches, x 934-1114 y 6996, under its bridge 608-1000 y 6863; its right end
   overhangs the exit shelf and drops 370 px, TOWER.see 300): ENGINE-WORTHY, sent to the lead. 13 data variants tried (probe/patch.mts,
   PATCH='b.w=290,310;exitDy=..'): none clean but ledge 240-260, REJECTED (opens the double past the bounce). If no ruling in 20 min of
   it being asked: my recommendation stands (cap-down in, NOT landed while easy-1 is red; the counting test and after-roll go on).
   Three bricks together (root-down, two-roots, cap-down): see "Probes" below.
3. The counting test (new src/game/gen2/worlds/w3Tower.test.ts): W3_DOWN (w3Ledge/w3Drops/w3Walk) are UNTYPED in w3.ts (no content /
   jobs); type them in the test the audit kit's way (origin/t-audit-w3 reference/qa-reports/AUDIT-W3/scratch.patch, w3Audit.ts
   w3AuditBricks + auditKit: drops 'ground', walk 'floating', ledge as arrive/rest/exit) with W3_DOWN_TOWER as is; readyDraft('3-1') then
   buildGen2Stage({config, kit, seed, difficulty}) with kit = LISTED['3-1'].kit() whose manifest graphs.list is ONE graph of 3-1's
   trimmed code `A Tg1 D_ Pf1< Xg1> R Dc1_ Wf1> R Pb1< Cg1> R Sf1_< E` and briefs['3-1'] dealExact. Assert each c / b node's section is
   a W3_DOWN_TOWER id. Planted red: W3_DOWN_TOWER emptied -> the c/b asks refuse.
4. 3-1's AFTER-roll, then the gates, then the landing: box 1's items 4-5 (below, unchanged).
## Box 1's step (hand-over, 9:06 AM ET Fri 11-27 by `date`)
1. Box 2: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`; `npm ci --legacy-peer-deps`
   in the background. The four DOWN-tower bricks are in src/game/gen2/worlds/w3.ts (W3_DOWN_TOWER, in w3Manifest().sections): c =
   w3-root-down, w3-two-roots (CLEAN on the 3-1 draft, 12/12 rolls each, probe below); b = w3-cap-down (11/12: 1 blind drop), w3-cap-steps
   (8/12: 2 'catch passes its storey', 2 blind drops). NOT yet gated, NOT yet landed.
2. Finish b: probe each alone: `GEN2_DRAFT=3-1 KEEP=<id> npx tsx reference/qa-reports/KIT-W3a/probe/one.mts` (rolls the 3-1 draft, seeds
   1-6 x both, with only that one new brick in the kit; `vine.mts` with SEED= D= dumps the pieces at the first refusal). What fixed each
   cause so far (keep it): (a) a `jump`'s dy is scaled by the roll's tempo (pipeline.ts:1412 `dy *= T.rise`), a vine's h is not: every drop
   in these bricks is a `walk` (unscaled); (b) NOTHING may rise over a brick's entry: a down tower hangs the turn's catch in the band over
   the entry, and a lip 180 px over it was laid level with that catch; (c) thin branch shelves, never `bank` (its soil body moved the
   tower's catch heights); (d) the exit shelf wide (260-300): a narrow exit before a turn left the catch no fair height; (e) the root drop
   235, not 260 (a catch stands up to 287 px over the next storey; 260 left 324 px, past TOWER.see 300); (f) the c/b bricks are LIT (no
   darkEnds): 3-1's and 3-5's codes ask #dark on every beat but c and b, and a flag never stands in a dark zone. If cap-steps will not go
   clean, drop it and name the variety cost; do NOT code round a tower catch fault: it is ENGINE-WORTHY (rule 26) -> the lead.
3. Then: the w3.test / w3Noise.test files (the draft rolls change with the new bricks: run them), a counting test (new file
   src/game/gen2/worlds/w3Tower.test.ts: 3-1's trimmed code `A Tg1 D_ Pf1< Xg1> R Dc1_ Wf1> R Pb1< Cg1> R Sf1_< E` rolled in a DOWN tower
   on World 3's kit with the bricks typed (the audit kit's way, scratch.patch w3Audit.ts, but World 3 bricks only), each c / b node's
   sections are the new bricks; planted red: W3_DOWN_TOWER emptied -> the c/b asks refuse).
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
