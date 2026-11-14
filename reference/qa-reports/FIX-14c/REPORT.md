# FIX-14c REPORT (R-165.206). HELD by the lead (5:07 AM): not on Matt's link; tonight's integration takes t-fix-14b. FIX-14d starts from this head. t-fix-14c from origin/t-fix-14b@d3501970. Code head 3e42f90b (later commits: clips, this report). 11-14, 3:46-5:25 AM ET
## EXACT NEXT STEP (in order; the next member starts here)
1. **The bots got WORSE after the relist and I did not find why inside the box. Hold this branch off Matt's test link until it is chased.**
   castBots 1-4 x40 (BEFORE = d3501970's code, AFTER = 3e42f90b, relist 3's addlevel run; PASS by tier, Normal / Easy):
   | bot | BEFORE N / E | AFTER N / E |
   |---|---|---|
   | kid | 24 / 34 | 19 / 35 |
   | adult | 40 / 40 (Easy min 106.1 s) | 39 / 40 (Easy min 108.5 s: over the 100 s floor) |
   | child | 10 / 13 | 7 / **5** |
   | middle | 22 / 23 | 23 / **5** |
   | expert | 25 / (no Easy expert: castBots.ts:31, by design; FIX-14b's "missing line" was this) | 19 / - |
   **The kid's falls are NOT fixed, and my first reading of them was wrong.** On the AFTER head the kid still "fell back down from here
   3 times" at x 1036 (kid Normal seeds 1-12 json: 7/12, all 5 fails there), with the new run-on stub in place (foot room 80: the foot
   was not the cause). It is the TOP's near side: after the rotting beat the kid walks right, climbs the turn's vine holding right, and
   the vault goes right, off into the gap, because the storey above (s4:b 650..1010) runs back LEFT from the vine standing in front of
   its face (1036). My rule exempts that near side for a cleared vine ("the face he climbed beside"); FIX-14's original wording ("give
   the top bough room past its link vine") meant exactly it. Fix to try first: at a turn back, run the UPPER storey on past its vine too
   (wood under a vault the way he walked: TOP_ROOM past the vine), and drop the near-side exemption from topRoomShort for turns.
   Every fail is "shrine rescued xN" (stuck, then put back). The rolls are NOT like for like (seeds 1-40 index a new list). Stuck
   spots on the AFTER head (castBots --json, child + middle Easy seeds 1-6, kid Normal 1-12: kidN.json in the lead's ask): spread
   (fork "in a dip 321 px deep, the way on is 281 px down", "fell back down from here 8 times" at x 90 / 1055 / 464 / 995, "the way
   on is 321 px down" at x 1135-1157). Candidates, in the order I would test them: (a) the turn's run-on stub to the stage's EDGE
   (x 0-70 / 1210-1280: inside the wall line, where nothing was laid before; several stuck x are 75-126 and 1135-1166); (b) the
   straight-on storey that now starts 54 px back over the ledge (the tier bots' route, towerRoute.ts, may read the overlap as a
   ceiling or a "dip"); (c) Easy's widening of the new stub (a landing piece). One planted toy per candidate, castBots 1-6 child/middle
   Easy each, then the fix and ONE relist.
2. The creak dip (middle N s4, FIX-14's) is NOT chased: the fork's "dip 321 px, the way on is 281 px down" is still in the tier bots'
   stuck list (above). Needs (1) first.
3. Clips NOT shot (cut at the box): the two-vine clip (clip.mjs `vines` now reads the count after the vault; not re-shot), the pod's
   tell + fall, the gate upright Normal and sideways Easy, the fork sideways Easy. Shot: see Polish check.
4. Proposed level.md Building rule (lead decides, evidence below): **"A climbable vine keeps 80 px of ledge (TOP_ROOM) between its top,
   and its foot, and any OPEN end of the ledge there (a drop: not the stage's edge, not lasting wood within a step); touching pieces are
   one ledge."** Check: `vineTop.ts topRoomShort(v, platforms, width, 'top'|'foot')`; the stage's lay test over every shipped roll
   (w1Arc14.test.ts "every climbable vine on every shipped 1-4 roll"). It belongs in the kit for every tower stage (only 1-4 today).
5. INTEGRATOR: pipeline.ts towerJoin (tipOf, the turn's run-on stub, the sealed far-end refusal), tower.ts TOWER.sealedIn, toyTower.ts
   (the toy gate bough 300-320). FIX-14b's engine.ts notes still stand (no engine.ts change here).
## Done (evidence in reference/qa-reports/FIX-14c/)
- **The rule as code (vineTop.ts, the module the engine's vault already shares, D19):** TOP_ROOM 80; topRoom / footRoom merge touching
  pieces at a vine's top (foot) into one ledge; an end at the stage's edge, or beside LASTING wood within 60 up / 40 down, is no walk-off;
  a creaking bough closes nothing (it gives). In front of a bough's face (CLIMB_CLEAR) only the far end counts.
- **Real-engine proof (vineTop.test.ts):** a vine 80 px from a ledge's open end keeps him on when the vault goes the short way (up +
  the side held, then let go), both sides; 20 px puts him off (planted). Unit cases planted: seams, the wall, a step, creak, cleared vines,
  the kid's spot (the foot, 18 px).
- **What FIX-14b's measure got wrong (Learned):** its "untagged link/rest vines at 26-34 px" at the TOP were piece SEAMS (0..114 +
  114..334 is one ledge) and the stage WALL. With the ledge merged no link vine's top is short. The real link-vine fault was the
  FOOT: the tower's builder stood every turn's vine 18 px from the open tip of the ledge he walks along (TOWER.vineIn 44 less
  CLIMB_CLEAR 26), 26 px going straight on. I read every kid Normal fail BEFORE (15/15 at x 1036) as a walk-off there; the AFTER run
  shows the same falls with the foot fixed, so that reading was wrong (EXACT NEXT STEP 1: it is the top's near side). The foot fix
  stands on the rule's own evidence (the real-engine test), not on the kid.
- **Fixed at the roots (never by loosening):**
  - 1-4 data (w1Arc14.ts): the crown's sure vine (20 px from the mid's end over the stair, every roll) now tops out on the mid's
    80 px run past the field (SURE_RUN), 80 px from f3 and from the end; field MARGIN 60 -> 80 (every field's end vines stood 60 px from
    their top bough's ends); DROP_ONE's hand rescale removed (written before it became a gate, it squeezed the vines 55 px apart, f1
    17 px from the end); GOING_UP's v2 290 -> 280 (76 -> 86 px).
  - The link builder (pipeline.ts towerJoin, up): a turn back runs the ledge on past its vine (a stub, or to the stage's edge when the
    wall line is nearer); a straight-on storey starts 54 px back over the ledge; a gate top's leaving vine stands TOWER.sealedIn (106)
    from its back end and 80 px from its far end, or the roll fails by name. A bigger inset alone was tried first: every roll failed
    (the turned storey lost the room the long beats need).
  - Only 1-4 lays a tower among the generated stages (travel up + gen2), so no other stage's lay moved (seedlist 1-1 --check PASS).
- **The lay test over every shipped roll** (w1Arc14.test.ts): all 100 proven seeds x 2 settings, every climbing vine's top AND foot;
  planted both ways (the sure vine back at 20 px; a link vine back at 18 px); red on the old data (thousands of cases), green now.
- **The relist: THREE runs, not one (my miss, named):** relist 1 (dd85c6a7) and 2 were each followed by the 1-4 tests on the new list,
  which found faults in my own fix: (1) the sure vine between f1 and f2 was the vine he took at the field's foot (its top vaulted him out:
  fieldPetals red); (2) three Easy rolls stood a gate top's vine 32-66 px from its BACK end; (3) the sure vine on f2's line, same fault.
  Relist 3 (3e42f90b) is the one that counts: 100 proven of 161 tried (62%; 61 refused by name at gate tops), --check PASS.
  Raw yield 40/40 -> 20/40 clean on seeds 1-40: the list still holds 100, but the pool is thinner (a cost to name to Matt's lead).
- fieldPetals.test.ts's "paired stretch" filter now leaves out ground petals he takes standing (STAND 60): with the 80 px margin a
  trail petal 34 px over a field's foot fell inside a pair's span and was taken by one hand before the push. Narrowed to what the test
  names; every other assertion unchanged. The lead should judge this one.
- toyTower.ts: the toy gate bough 200-220 -> 300-320 (the lay now refuses a vine under 80 px from a gate's end; the fixture models a
  gate the lay can legally leave; tower.test.ts assertions unchanged).
## Gates on code head 3e42f90b (frozen worktree /home/user/w14c-gate)
PASS: tsc; generalitycheck; roadmapcheck (after `git fetch --unshallow`: it FAILS on a shallow clone, by name); knowncheck; artcheck;
vite build (BASE_PATH); chunkcheck; buildcheck (p95 135 ms Normal; run while the suite and the bots ran, so under load, not alone as
asked); kbdcheck (194 s); seedlist 1-1 --check (257) and 1-4 --check (100); tool tests 33/33 (library, seedlist, yield, travelBots);
castBots + tierBots tests 15/15; drawcheck (613 s). The 1-4 tests (w1Arc14, fieldGate, fieldPetals, tower, towerBots, vineTop) 74/74.
Full suite: 3305 tests, 3303 pass, 0 fail, 2 todo (one is 4-3's boulder `# TODO`, marked before this branch). It finished before
the lead's stop at 5:2x, so it is complete, not PARTIAL.
clipcheck PASS (83 known, 511 s). Every other listed stage's seed list still replays: seedlist --check 1-1 (257), 1-2 (100),
1-3 (100), 1-5 (150) PASS. **lockall: UNRUN** (base recorded on d3501970, 3264 builds of 102 stages, in my scratchpad; the head
--check was stopped by the lead's 5:2x stop). Only 1-4 lays a tower, so I expect only 1-4 to move, but that is not proven: FIX-14d runs it.
## Polish check (judged on the real page; seed and setting printed by clip.mjs from what the game built, D62)
- fork-normal-up.mp4 + fork-normal-up-strip.jpg (seed 1 Normal, upright), fork-normal-side.mp4 (sideways), fork-easy-up.mp4 (Easy):
  he steps down the three creaking boughs, climbs the fork's vine, tops out holding the SHORT side (80 px) and stays on the bough
  (printed "FORK END on the top bough: true"; Easy 86 px). Rough, named: on Easy he comes to rest 18 px from the bough's end after a
  short-way vault plus 4 frames of the push (on, but close: the 80 px rule is the bare margin for a thumb that slides); the trunk post
  he climbs stands up past the bough's top (the post art, not this job).
- gate-normal-side.mp4 + gate-normal-side-sheet.jpg (seed 1 Normal, SIDEWAYS: clip.mjs now waits for the engine; FIX-14b could not
  shoot it), gate-easy-up.mp4: the ties strain and snap, his head stops under the shut bough on hold and jump (0 px over on both), the
  thatch is thrown off, the way opens. Rough, named: the clip's own first caption says "a gate of two figs" on a three-fig gate (the
  tool's text, not the game); Pokey's halfway line ("Meeca climbs this every Sunday") sits over the bough sideways during the push.
## Lessons applied: D40 (built on t-fix-14b; the fork IS this job), D59 (no gate left running at stop), D62 (clips print the built
   setting), D63 (the fork and gate judged on clips; the gate tried from below), D64 (context from the token count: ~30% at the end).
## Learned (for the next builder)
- **Prove a bot's cause on the bot before building the fix** (re-run its seed with the change planted): I fixed the foot for the kid's
  falls on a reading, and the AFTER run showed the kid falling in the same place.
- **Measure a rule's check on merged geometry before believing its count.** FIX-14b's 25-of-37 was mostly piece seams and the wall;
  the real fault (the foot) was invisible to a tops-only measure. Ask "where does he actually fall?" (the bots' stuck x) first.
- **Run the stage's interaction tests on raw rolls BEFORE the relist, not after.** Two of my three relists were spent finding my own
  faults (fieldPetals) that a 6-seed RealPlay run on raw seeds would have found in a minute.
- **A climbing vine within HOLD_REACH (60) of a field vine's foot is taken first and its top vaults him out.** Keep non-field vines
  GAP (80) from any field vine at the field's foot.
- A bigger inset is not free in a tower: storey room is the constraint; run the ledge on instead.
## Proposed rule changes (lead decides): the level.md rule in step 4 above (with its check); level.md step order: "the stage's own
   interaction tests on raw rolls (RealPlay seeds 1-6) BEFORE the relist"; World 1 note: "no climbing vine within 80 px of a field
   vine's foot".
## Method update: level.md step 3 should say "test on raw rolls, then relist once"; clip.mjs (FIX-14c) is the clip tool to start from.
