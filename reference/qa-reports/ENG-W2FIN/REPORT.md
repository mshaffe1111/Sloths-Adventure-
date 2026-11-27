# ENG-W2FIN REPORT: a wheel's fall takes its own pond as its river (R-165.431, release 4's CI line)
Member: ENG-W2FIN (engine, Opus 5.5 xhigh). Base: release-0.10.3 0077c62c6. Fix: 78bf17d60 (branch eng-w2fin). Landed on release-0.10.3: merge 150e6e161 (tsc PASS, the 2 plants + wheelChannel 4/4 GREEN on it).

## The fork (packet item 1)
**A fall over a wheel's sweep takes that wheel's own pond as its river** (w2.ts w2Finish, `wheelPond` inside `hasRiver`), not banks()
accepting the street. Why: the far end of a wheel's fall has no bank by design (the street reaches in over the top; the fall runs to the
sweep's far end), so any bank rule would have to invent one, and a splash river at the street's height would stand over the wheel.
The wheel is found by its OWN jetty lip at the fall's end and its OWN street at the fall's height (Wheel.lay ids), the pond by its surface
under that wheel (WHEEL.pond) and its span; every other fall keeps 2-7's height rule and needs a bank at each end. No stage id, seed or x.
Root, read in code: t-build-26 passed only because its hasRiver matched any river by x alone; the merged height rule (ENG-GROUND-b)
looked for water at the fall's lip, and the pond is a wheel's height under it (toys: lip y 8836, pond 9328).

## Done-items
1. Fork decided and fixed at the root, general: above. PASS.
2. Planted (each RED before):
   - w2.test 'a fall over a water wheel's sweep takes the wheel's pond as its river' (4 rows x 2 settings x 2 ways): RED on 0077c62c6
     (16 throws, red.txt), GREEN on 78bf17d60. Asserts no new river over the sweep, nothing taken out, wheelFaults clean.
   - w2.test 'another storey's fall over a wheel's pond is still held to its own height and its own banks': GREEN on the fix; RED (64
     faults) on a planted loosened variant (any wheelPond in x counts): loosened.txt. The 2-7 out-and-back test (ENG-GROUND-b) also GREEN.
   - wheelChannel.test 4/4: RED on base (wheelChannel-red.txt), GREEN on the fix. towerWater's draft case ('2-6's draft row ... the
     first frames keep him at the spawn'): GREEN on the fix, RED on base (the throw, x=274-670: towerWater-red.txt). w2Arc26.test: the module loads and its wheel cases pass
     (beat for beat; every wheel with jetty, street, pond, both ways), 3 of 5; **2 stay RED, neither the wheel's fall** (Pushback).
3. lockall --layouts 16 (base 0077c62c6 recorded, fix checked, both frozen): **102/102 stages unchanged** (3,264 builds, 2-7 included; lock-summary.txt) PASS. tsc PASS. generalitycheck PASS (26 literals, 26 known).
   World 2 / wheel / tower src tests (23 files) on the frozen fix: 160 tests, 158 pass, 2 FAIL (both w2Arc26, Pushback): suite-w2-summary.txt.
   CI tool line (gates.yml:157) on the frozen fix: 386 tests, 378 pass, 7 FAIL, 1 todo (ciline-summary.txt); base had 17 FAIL (INT-R5b).
   0 'no bank' throws. Of the 11 throw reds: 10 GREEN (wheelChannel x4, wheelRide x2, rowWheels :23 :50 :65 :81); rowWheels :91 runs
   now and fails its own plant (2-6 draft seed 28: 0 rescues with trunkCatch off; the draft's roll moved, as ENG-26u's seed 1 did). The
   other 6 are INT-R5b's classes (B) riverRide x5 and (C) firsttimer :184 (ENG-PLANT's), unchanged.
## Polish check
No draw code changed. No listed stage's build moved (lockall above), so no screen Matt sees changes; the wheel toys (a dev fixture) now
finish with the pond as their only water, as on t-build-26. No still shot: nothing visible changed to judge.

## Pushback
**w2Arc26.test cannot go fully green from the finish without breaking a law** (2-6 draft, which ruling B takes out of release 4):
- 'one millrace' (5 != 1): the draft's four porch gaps (seed 1: x 714-800 y 5546; 674-753, 953-1042, 1242-1333 y 3740) lie over a
  wheel's pond IN X on another storey. t-build-26's x-only match skipped them (no water); 2-7's height rule (ENG-GROUND-b: every water
  fall has its river at its height) now gives each its own soft splash river. All five wheel falls ARE recognised (none got a river).
  Making the test pass means skipping those falls again: the loosening my guard test exists to stop (LAWS 22). 2-6's design call for
  release 5: water in the porch gaps, or open gaps (as 2-7's ruling B leaves soft gaps over a lower floor).
- 'nothing on Normal 2-6 costs a heart' (1 != 0): snakes on Normal (seed 1: one at x 2084; seeds 2-4: two or three), the cast, not
  the finish (no unsafe river, pit or fall). Release 5's 2-6 packet.
- rowWheels :91 (2-6 draft, rowWheels.test leaves the line with ruling B): its planted seed 28 no longer meets the flick. Release 5's
  2-6 packet re-picks the seed (ENG-26u did the same for seed 1).
Note: INT-R5's root named banks(); the deciding line was hasRiver (t-build-26 never reached banks()
for a wheel's fall: it skipped it on the x-only river match).
## Suggestions
- Architect packet: carry `wheel` on the gen2 fall record (types.ts falls; pipeline.ts ~4216 drops g.wheel) so finishes read the mark,
  not the geometry. Done-items: the mark set for place `wheel`; w2Finish reads it; the two planted tests unchanged and green.

## Unresolved
w2Arc26 2 of 5 and rowWheels :91 RED on the 2-6 draft (Pushback; ruling B removes them). riverRide x5, firsttimer :184: ENG-PLANT's.
## Method used / Lessons applied / Method update
- Method: methods/stage-fix.md shape: reproduce, planted red, fix at the root, lock on frozen trees, CI line.
- Lessons: D115 (both runs on chattr-frozen trees), D119 (no heredoc in a commit chain), D121 (the guard checks the principle: a
  loosened fix goes RED), D126/D96 (the CI tool line run, not only src), D22 law (no test loosened), D36 (own worktree, git status -sb).
- Method update: a fix to a shared finish rule plants BOTH sides: the case it must now allow, and a toy of the case the old rule existed
  for, proven RED on a deliberately loosened variant (the loosened log committed).

Turnover note: reference/handoffs/engine-core.md §0zr-W2FIN (460b87929).
