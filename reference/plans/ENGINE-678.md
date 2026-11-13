# ENGINE-678: one engine plan for 1-6, 1-7 and 1-8 together (R-165.205). Architect, 2026-11-13, PLAN ONLY, read on t-int-3@31b8a742.
Source: THE COMBINED TABLE (1-8.md:62-93, t-1718-design), 1-6.md:37-43 (t-16-design), 1-7.md:38-41, ENGINE-NEEDS.md, NODES.md §8, hf-art.md §10.
Every row re-read in code (D7). NOT on t-int-3 (git merge-base, D48): **t-pieces@69dc3e26** (STILL, CAST-WORLDS, RIDE) and **t-nodes@1829470f** (VARIETY-2: CONTENT_OF, nodeAsks): W0 inputs.
## 1. The blocks, verified (28 rows -> 24: creaky limb EXISTS, two camera rows = one, four art rows = one batch; 3 added)
| # | Block | Truth in code (file:line) | General: how a later world reuses it | Pkt |
|---|---|---|---|---|
| + | Piece hooks in the engine (ADDED) | engine.ts is 9,218 lines; each runtime is a hand-wired field + start + step + draw (engine.ts:637, :646, :657, :1014-1031, :4530) | every later runtime piece registers; no packet holds engine.ts | W0-H |
| + | One letter grammar (ADDED) | code says liana = `s` (t-nodes nodeCode.ts:59-62); NODE-KEY puts liana under `r`, lacks s v p t x (t-nodes NODE-KEY.html:178); K row says "1-5's" (NODES.md:276) | one table feeds code and key | W0-H |
| 1 | `swing` in World 1 | NEW data. w1.ts:1616 `['double']`; W6/W7/W8 lay swing (w6.ts:182, w7.ts:166, w8.ts:174); per-arc move add w1Arc14.ts:264 | W1's liana rows in its own file; arcs add the move, 1-1..1-5 locks unchanged | A1 |
| 2 | Grips by data ("hold high") | PART: pressWindow takes grips (physics.ts:729, default [0.7, 0.95]); lianaRelease never passes them (gen2/pipeline.ts:245) | a liana row's `grip` dial in every world | A1 |
| 3 | gen2 creaky limb | **EXISTS** gen2/creak.ts:1-7 (B15, in t-int-3). Dropped | (any world with a `creak` row) | - |
| 4 | Swing + chase camera lead | EXISTS for a 330 px landing (cameraFollow.test.ts:111) and at a run (cameraFollow.ts:54-62). MEASURE 740 px FAR and the chase first; build only if off screen | every stage | A1/B4 |
| 5 | Vine snake rides a liana; false liana | NEW. The kit has no vine rider: `rides` is a sweeper's eye only (predators/types.ts:71, core.ts:74) | a kit habit `vine` + any world's snake row (W3, W6 by data) | A4 |
| 6 | Eagle as W1 cast row | NEW data. w1Cast.ts:28-29 lays snakes only; EAGLE exists (predators/world1.ts:78-97) | any world's sweeper row | A2 |
| 7 | Sweeper DRAWN (shadow at eye, screech, dive) | NEW. eyeOf (core.ts:103) has no draw site (engine.ts:7386 is the boss entrance's own eyeX); the old watcher shadow draws for proto.watch only (engine.ts:7154, :7212, :7277) | every `sweep` predator, any world | A2 |
| 8 | Free first pass; cool per stretch | NEW. freeFirst is the old watcher's (watcher.ts:110, :138), core.ts has none; cool is per def (world1.ts:91, coolOf core.ts:39) | Post dials `free1`, `cool` | A2 |
| 9 | Perch: body on a snag, head-turn tell | NEW S. sweep moves the eye, body rests at its post when `rides` unset (core.ts:314) | Post dial `perch` for any sweeper | A3 |
| 10 | Cover as gen2 content (bush, carpet, patch, hanging) | NEW. Cover + inCover EXIST (stillness.ts:71-87); CastPlay gets proto.bushes only (engine.ts:4530); no gen2 lay of Cover | letter `m`, world rows (t-pieces stillLay rows re-pointed) | B3 |
| 11 | Moss tint + calm sound | NEW S. calm() (stillness.ts:52) and CastPlay.isStill "for the art" (castPlay.ts:103) have no caller in engine.ts | any cover, any world's tint colour by row | B3 |
| 12 | Mossy liana is cover | NEW S. hanging Cover is a fixed x span (stillness.ts:84); needs the vine it rides | `s` dial `moss`, any world | B3 |
| 13 | One hide rule (crouch -> stillness) | NEW. Crouch hide watcher.ts:159 `hidden`, :171 `sees`; t-pieces stillLay.ts lays watcher Bushes for W6/W8 (crouch) | REPLACES watcher hidden/sees and the old shadow draw | DEFER |
| 14 | Chase in gen2: stretches, living forks, Easy row | NEW. One ChasePlan (chase.ts:13-19), no Easy (chase.ts:21-39); hand-built only (protoStage.ts:499, :6326); K is LATER (nodeCode.ts:40, V13 :163) | job `K`, any world's collapse look by row (7-6) | B1, B5 |
| 15 | Rolling nut / bouncing fruit | NEW M. No rolling hazard in src/game | `h` dial roll/bounce, any world's art row | B2 |
| 16 | Liana phased to a runner; the still fork; the tip | NEW S x3. Vine.swingPhase EXISTS (types.ts:431), gen2 lays 0 (pipeline.ts:244); tip art + slow motion EXIST (proto3AtlasData.ts:5, engine.ts:745-748) | `s` dial `phase:runner`; `W` inside `K` holds | B6 |
| 17 | Bots: still in cover; chase in stride, two heights | NEW M x2. castBots has no stillness; chase only marks danger (castBots.ts:469) | every stealth and chase stage | A5, B7 |
| 18 | Art: vine snake, moss cover, perched eagle, nut/fruit, tracks | no snake on a liana (goldsnake: prowl/rouse/strike), Spanish moss, head-turn harpy, rolling nut or tracks rows (w1.json, cast.json); harpy-atlas has crouch/tense, w1.json has w1NutPod (look first) | sheets cut to catalog rows | ART |
## 2. The grammar (NODES.md §8; one table: CONTENT_OF feeds NODE-KEY)
Content letters: `s` liana (dials `grip:low|high`, `phase:free|runner`, `moss`); **`m` cover NEW** (dials `kind:bush|carpet|patch|hanging`, `apart` px);
`h` the world's hazard (dials `roll:low|bounce`, `gap` s, `teach:nudge` = no heart); `k` crumble (exists). Marks: `&` names the cast row (eagle: `post:fly|perch`,
`free1`, `cool`; vine snake on an `s` node = rides it). Job `K` leaves LATER when B5 lays it (dials `len` <= 4,000 px, speed band by setting, ends at a fork).
`W` inside a K with `m&` = the still fork. The designs' `r` for lianas read `s` (1-6 string, 1-7 `Wr`, 1-8 `Sr`): the code wins (D7).
## 3. Waves (D40: what everything sits on first)
**W0 foundations:** INT-5 (t-pieces + t-nodes onto the head) -> BUILDTIME (R-165.207) || RULER (VARIETY-2's per-gap ruler) -> HOOKS (piece loop + grammar).
**W1:** lane A SWING-W1 -> EAGLE; lane B CHASE-CORE -> ROLL -> COVER. **W2:** lane A PERCH -> VINE-SNAKE; lane B CHASE-LAY -> CHASE-FINISH. **W3:** A STILL-BOTS, B CHASE-BOTS.
Levels start when their blocks are in: 1-6 after A1 + A4; 1-7 after A2, A3, B3, A5; 1-8 after B1-B7 (+ A2, B3 for the fork).
**New replaces old, no switches:** buildLongBranch (protoStage.ts:499, :6326-6567) deleted in 1-8's build PR; old 1-7's watcher zones (protoStage.ts:1851-1919) in 1-7's; crouch hide + old shadow draw in HIDE-ONE.
## 4. Packets (each 90 min or less a box; WRITE lists; A and B never share a file; at most 2 engine members, PM.md:21)
| Pkt | Job | WRITE (new unless *shared, by token) | h | $ |
|---|---|---|---|---|
| INT-5 | merge t-pieces, t-nodes; full Checks; lockall 102/102 | integration head | 1.5 | 12-24 |
| BUILDTIME | why 1-1's Play build went 105 -> 121-151 ms p95; fix the root | what it finds (measure first, report the file) | 1 | 8 |
| RULER | VARIETY-2 REPORT item 1 (w1Pits per-gap lips), Opus max | gen2/w1Pits.ts, its test, ruler/ | 2 | 20 |
| HOOKS | `StagePiece` (start, step, draw by layer, respawn, hurts) + one engine loop; letters m/h dials, NODE-KEY rows s v p t x m | stagePiece.types.ts, pieces/index.ts, *engine.ts, *nodeCode.ts, NODE-KEY.html | 1.5 | 12 |
| A1 SWING-W1 | W1 liana rows, grips data, FAR camera measured | gen2/worlds/w1Swing.ts, *pipeline.ts (lianaRelease), cameraFollow.test.ts | 1.5 | 12 |
| A2 EAGLE | cast row, sweeper draw piece, free1, cool by post, screech | gen2/worlds/w1Cast.ts, pieces/sweepDraw.ts, predators/core.ts, predators/types.ts | 3 | 24 |
| A3 PERCH | perch post, head-turn tell | predators/core.ts, predators/world1.ts | 1 | 8 |
| A4 VINE-SNAKE | kit habit `vine`, false liana pose, let-go on touch | predators/vine.ts, predators/core.ts, gen2/vineSnakeLay.ts | 2.5 | 20 |
| A5 STILL-BOTS | bots that go still in cover on the warn | tools/inspect/castBots.ts (+test) | 1.5 | 12 |
| B1 CHASE-CORE | stretches, living forks, Easy row (<= 200 px/s, never over his run) | chase.ts, chase.test.ts, pieces/chasePiece.ts | 1.5 | 12 |
| B2 ROLL | nut/fruit by his x: drop-in tell, thunk, shadow, nudge teach | rollHazard.ts (+test), pieces/rollPiece.ts, gen2/rollLay.ts, *pipeline.ts hook | 2.5 | 20 |
| B3 COVER | `m` lay, Cover into CastPlay, tint + calm sound, mossy liana | gen2/coverLay.ts, castPlay.ts, stillness.ts, pieces/calmTint.ts, *pipeline.ts hook | 3 | 24 |
| B5 CHASE-LAY | K lays stretches + forks; flags at forks by rule (STAGE-RULES:105-109) | gen2/chaseLay.ts, *nodeCode.ts (K out of LATER), *pipeline.ts hook | 3 | 24 |
| B6 CHASE-FINISH | runner-phased liana, still fork hold, tip fall, chase camera measured | chase.ts, gen2/chaseLay.ts, pieces/chasePiece.ts | 3 | 24 |
| B7 CHASE-BOTS | run in stride, read the two heights | tools/inspect/castBots.ts (after A5) | 1.5 | 12 |
| ART | one Hugging Face batch (section 6) | reference/art, inventory rows | 1 | 9 |
Shared by token, in this order: pipeline.ts A1, B2, B3, B5; nodeCode.ts HOOKS, B5; castBots.ts A5, B7; engine.ts HOOKS only, then nobody.
## 5. Estimates (D25: measured, not guessed)
Sizes: S ~1 h, M 2-4 h (ENGINE-NEEDS.md:36-37); PIECES laid 3 M pieces in ~1 h (t-pieces commits 12:02-1:02 PM ET). $ per 90-min box: median $11.78
of ADD-LEVEL 10.50, B14b 11.78, B14c 10.82, VARIETY-2 16.13, PIECES 15.83, INT-4 8.37, INT-3 24.03 (LEVEL-LOG.md:23-34): ~$8 an hour.
**Total engine: ~32 h of member time, ~$275 (range $230-340), + 3 integration rounds ~$40-70, + art ~$9 Claude and ~$4 HF.** Two lanes: ~16 h wall clock. Deferred HIDE-ONE: 2.5 h, ~$20.
## 6. Art: one batch for 1-6..1-8 (hf-art.md §10; sizes against his DRAWN 89.1 px, heroSprite.ts:30,32, D41)
| Sheet | Pieces (drawn size) | Layer / footing | Level |
|---|---|---|---|
| 1 Vine snake | hanging head-down ~115 px long, sliding, coiled on a bough as a "liana" ~130 px, hiss at his hands | play; on the liana's grip line | 1-6 |
| 2 Moss cover | carpet top tile ~28 px thick, patch ~180x40, Spanish-moss drape 130-150 px (hides his hanging body), mossy liana tile, fork moss | play floor / hanging | 1-7, 1-8 |
| 3 Perched harpy | perched ~130 px tall (1.45x him): look ahead, look down, head turned, blink (try harpy-atlas crouch as the body first); dead snag ~300 px | play / back | 1-7, 1-8 |
| 4 Branch hazards | palm nut ~26 px (hop it), cannonball fruit ~40 px (reads big; try w1NutPod at 40 px first), fruit split, cracked nut, squirrel tracks strip ~120 px | play / decal | 1-8 |
Cost (measured 11-13): ~$0.04 a take; 4 picking takes a sheet + native passes on picks = ~28 takes ~$1.1; one sandbox ~60 billed min ~$2.7 (ART's
day: ~$4.59 for ~100 billed min): **~$4 HF**, + a 60-min Opus high member ~$9 (ART3 $8.81). The lead approves the list before the sandbox starts.
## 7. Risks, measured first (each the first step of its packet, with a planted test)
- **Swing camera FAR (A1):** from the back of a swing a FAR landing is ~740 px out vs ~425 px upright (1-6.md:33-34); showBoth at 740 px, both ways. Off screen -> fix in A1.
- **The fruit vs his drawn head (B2):** each arc clears 89.1 px + 15 px as it passes him at a run (1-8.md:34; collider 38 px, fight.ts:260): min clearance over all phases.
- **Chase liana phase (B6):** a whole swing (2.85 s, physics.ts:471) is 655 px of collapse > the 520 px start (1-8.md:7): each chase liana keeps the front > catchAt 24 + margin for an on-arrival grab, both settings, or the lay refuses it by name.
- **RULER before B2/B5:** both lay over W1 gaps; laid on the old ruler they would be judged twice (D40). **R-165.207 first:** buildcheck sits at its budget
  on main (p95 121/151/121 vs 150), so a lay's added build ms is unreadable until fixed; every lay packet then reports its 1-1 build ms delta.
- Every packet: lockall 102/102 unchanged vs t-int-3 (ARCHITECT.md trap), proven on 2+ worlds' kits (R-165.198), no stage id/x in engine code.
## 8. Pushback (for the lead)
- **Defer HIDE-ONE** (lean): 1-7 is on the kit only (1-7.md:6); its users are W6/W8. t-pieces' stillLay generalised the crouch hide HIDE-ONE replaces: integrate it for its sockets; no NEW stage lays its hides until HIDE-ONE (D40).
- **HOOKS before any runtime piece:** without it, A2, B1, B2, B3, B6 each hold engine.ts in turn; with it, engine.ts is touched once.
