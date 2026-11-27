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
- NORMAL and EASY seed 8 (SEEDS=12; probe12.txt: all four 20/24, reds n8 e2 e4 e8): "a blind drop off the piece at x 1039-1219, y 7936:
  389 px". Plat 163 is TOWER wood (a catch bough, 180 wide, tower ids 113-185 around it), over s18 w3-cap-steps@n7 / s19 w3-cap-down@n7;
  under it at y 8325 plats 118 (652-832) and 119 (918-1098); its right end x 1098-1219 has nothing within 300 px (wall plat 185 at
  1219). `GEN2_DRAFT=3-1 D=normal S=8 Y=7936 npx tsx reference/qa-reports/KIT-W3a/probe/diag.mts`.
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

## EXACT NEXT STEP (box 3, written 10:09 AM ET Fri 11-27 by `date`; box 2's step below is DONE to its item 3)
The lead's ruling (box 3): cap-steps stays IN; the storey hole under a brick piece's fall line is ENG-CATCH-b's (R-165.534, tower wood,
rule 26); NO landing until all four bricks roll 12/12 together (Law 7). Head: t-kit-w3a 0785b486e + this commit (merge of t-eng-catch
8a204af87 in; cap-steps back, W3_PARKED gone; w3Tower.test; the repro above). tsc 0 on 0785b486e.
1. Box 4: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a && git checkout -B t-kit-w3a origin/t-kit-w3a`; npm ci
   (--legacy-peer-deps) in the background; ReadNotifications FIRST (ENG-CATCH-b's frozen candidate hash comes from the lead).
2. w3.test / w3Noise.test on 0785b486e: 8 pass, 9 FAIL (the base t-eng-w3 f79963053 was 0 fail: these are the four bricks'). By cause:
   - ENG-CATCH-b's (tower wood, wait for its merge): w3.test:108 'every roll clean' (easy 2, the repro); :129 head room "normal 1: x 340-575,
     y 2844 lies 30 px under x 462-532, y 2814" (462-532 is a 70 px CAP, 30 px up on its shelf: read it first, it may be the test not
     knowing a cap (CAP_UP 30, stood on, not walked under); if so the test learns caps with a planted case, never a skip); :143 'a catch
     crosses a vine' "normal 8: a blind drop off x 1039-1219, y 7936: 389 px" (seed 8: past the probe's 1-6; the 1-12 probe is
     probe12.txt here: 20/24, seed 8 is a tower catch bough, in the repro; ENG-CATCH-b has every line).
   - THE KIT'S OWN (box 4's work, no engine): w3.test:170 "piece 14 is drawn as bounce": W3_DRAWN lacks 'bounce'; World 3's cap is
     bounce#cap-w3 (W3_ART.bounce): teach the test the cap is World 3's own (assert the art row is bounce#cap-w3, planted: World 1's
     mushroom -> red), never just add 'bounce' to the set. w3Noise.test:188/227/.../planted (5 tests): "no roll of 3-1's draft lays the
     call toy" and "he walked off the top and landed on the toy floor": the toy section is crowded out of the draft's rolls by the tower
     bricks (the draft's deal changed). Find how w3Noise picks its roll (a seed that laid the toy before) and re-pick by property from
     the new rolls (D151: by property, never by number); if NO roll of the draft lays the toy now, that is the kit's deal: name it to the lead.
3. When ENG-CATCH-b's frozen hash comes: merge it (named), re-probe all four (each alone and together, seeds 1-6 x both, AND SEEDS=12),
   re-run w3Tower / w3 / w3Noise, then 3-1's after-roll again (below), then GATES ONCE (packet item 5: tsc; CI tool line; suite in 6
   shards; lockall --check ONE run, 102 stages, NO listed stage moves; seedlist --check: no World 3 list exists, the lists the merge
   touches only; generalitycheck; freeze per D115 with src/game/gen2/proven/ writable), then LAND once on origin/t-eng-w3 (merge, never
   rebase, no force; re-run tsc + lockall after), and send the lead the hash, each shard's totals, the four counts and the after-roll.
4. 3-1's AFTER-ROLL (box 3, 4 seeds x both, `AUDIT_CAP=20 ./tools/audit/roll.sh 3-1 w3|wide "<code>" down down` in a scratch worktree
   of the head + origin/t-audit-w3's scratch.patch + W3_DOWN_TOWER in w3AuditBricks): after-31-w3.txt / after-31-wide.txt here.
   BEFORE 180 refusal lines each, 0/8 clean. AFTER 24 lines each (w3 and wide the same), 0/8 clean: every c / b gap line is GONE
   (108 before). The 24 left, named:
   - 12x "pool short at slot 5/6 (n3 descent: no bounce section left)": the letterless D_ (n3) is DEALT a bounce (the graph's n3 content
     'bounce', n13 none: the deal does not follow the code's letters); no bounce brick serves 'descent'. Tried in scratch only: 'descent'
     in W3_BOUNCE_JOBS clears all 12 (exp: 2 tower blind drops 319/321 px appear instead, ENG-CATCH-b's class) -> THE LEAD'S CALL: a
     bounce brick that serves a descent (data, a missing job) or the deal placing letters (engine, ENG-ASKS's lane). Not landed.
   - 12x "ask: node n13 'Sg1_<': content 'f' (floating): 3 of 3 sections are ground": n13 (Sf1_<) asks f and gets ground: the same deal
     (it is left no content). ENG-ASKS's lane / the lead's call (BUILD-31's own brief may set it).
## Box 2's step (DONE to item 3; written 9:21 AM ET Fri 11-27 by `date`; box 1's step is done to its item 2)
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

## Probes (box 3, head 88b0a0304 = 610ef2e63 + t-eng-catch 8a204af87; 3-1 draft, seeds 1-6 x both)
- root-down 12/12; two-roots 12/12; cap-down 12/12; cap-steps 12/12 (each alone). root-down + two-roots + cap-down 12/12.
- ALL FOUR: 10/12 (easy 2, easy 4: the ENG-CATCH-b repro at the top). Seeds 1-12: probe12.txt.
- w3Tower.test (the counting test): 5/5 pass; plants caught (a brick out -> 0 and its twin lays the beat; cap-down ledge 240-260 -> the
  lip within a double's 287 px). Counts are by section over 4 seeds x both of 3-1's trimmed code; every brick laid at least once.

## Probes (box 2, head = this commit; 3-1 draft, seeds 1-6 x both)
- root-down + two-roots + cap-down together: 11/12, 1 blind drop (the tower catch above). cap-down alone, 290-310: 11/12 (easy 1).

## Art (STAGE-RULES §4-5b; inventory w3.json)
- climb: the tower's own climbing vine (the one every turn of 3-1's draft hangs): drawn from the World 1 vine columns, which the inventory
  marks "needs fix: under 1.5x its play size" (2.24 Pokey): an OPEN rough spot the audit named (scale check), not new with these bricks.
- bounce: World 3's own cap and stalk, bounce#cap-w3 / bounce#stalk-w3 (in game, 0.55 Pokey, scale ok): named in W3_ART.bounce.
- shelves: World 3's branch shelf w3#branch (in game). Every shelf 140 px or wider (1.6 Pokeys and more).
- Not used (no draw path, NAMED not stretched): w3-next#mat-s23 (the fungus mat), w3-next#rim*-s11/-s23 (lit rims): "cut, not placed".

## Learned (box 3)
- A brick set that is clean one by one and three together can still fail four together: the deal moves which brick meets which turn.
  Probe the WHOLE kit together, and on the test's seed range (w3.test rolls 12 seeds; the probe defaulted to 6 and missed seed 8).
- Lessons applied: D119/D152 (no heredoc in a commit call), D128 (stamps from `date`; I caught a stamp 3 min ahead before commit),
  D134 (next step pushed and ls-remote checked before the hand-over), D138 (hand-over ends new work), D140 (notifications at each step).
- Proposed rule (level.md, kit bricks): "A kit's probe runs every brick together on the same seed range as the world's own test file,
  never only one by one." Check: the probe's SEEDS default reads the test's seed count.
