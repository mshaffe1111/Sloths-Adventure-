# tester-page status (the lead reads this; no send_message until further notice)

## CORRECTION (5:37 PM ET): my "FAIL" below is WRONG. It came from my test method, not the game

- My runs put Pokey 450 px before the teach (a teleport). With that, Dot's bubbles never show; the guide gets the lines and drops them.
- **Walked from the start instead, as a tester does** (engine-chunks 25d2d115, fresh save, sideways, seed 3917):
  - the coach lines show;
  - "Jump the little gaps" shows;
  - **the double line SHOWS: "Flick up again midair to jump twice."** (the new words), at the teach's entry, x 4469 (teach 4440).
- So the 4:16 answer and the 4:45 baseline (both teleported) are unreliable too. Their "nothing shown" is the same artefact.
- **Result, walked from the start: PASS, 6 of 6.**
  - Setup: engine-chunks 25d2d115, a fresh save each run, 3 sideways and 3 upright. A real thumb slide, a real flick at each step.
  - Dot's bubble showed "Flick up again midair to jump twice." at the teach's entry in every run, and stayed up:

    | run | seed | line shown at x | teach starts | first double gap (edge, 227 px wide) |
    |---|---|---|---|---|
    | side | 2827 | 4382 | 4344 | none: a bank teach, a tall step, no gap |
    | side | 358 | 5580 | 5549 | 5858 |
    | side | 1295 | 6451 | 6418 | 6693 |
    | up | 1555 | 6618 | 6579 | 6930 |
    | up | 2454 | 4535 | 4498 | 4847 |
    | up | 2857 | 5400 | 5359 | 5701 |

  - So the line comes 240 to 310 px before the first gap that needs the double.
  - Stills: `reference/qa/tester-page-1106/dbl2/walked-{side,up}-run*-seed*.png`.
- **Two more walked runs (5:44 PM): both PASS.** The double line was shown at the teach's entry, before the first double gap:
  - sideways, seed 3576: said at x 5443, teach 5407, first gap 5695;
  - upright, seed 3834: said at x 5326, teach 5293, first gap 5619.
  - In all, **8 of 8 walked runs pass.**
- **Seed 158: NOT run.** I tried to force the page's seed draw to the list's index 7 (seed 158), but the page drew 3576 and 3834
  instead. My override doesn't reach the real draw, and I ran out of time to find it. Seed 158 is still owed.
- **Stuck 20 s at the step, walked (these two runs): Dot said NOTHING** in both, upright and sideways. He stood just before the teach's
  first step: x 5388 against an entry of 5407, and x 5274 against 5293. This is now a walked result, not the teleport artefact: a real
  stuck first-timer gets no help line there (the roadmap item).
- (Older note, kept:) **Stuck 20 s at the step, the first 6 walked runs: not measured.** My walking script jumps at the first stall, so it never stood
  there. The earlier "Dot said nothing" came from the teleported runs, so it may be the same artefact. It needs a re-check.
- **Lesson** (for CONTINUOUS-IMPROVEMENT): a real-page check must reach the spot the way a player does. A teleport left Dot's guide
  dropping every bubble, and I reported that as the game's fault for an hour. Countermeasure: walk from the start, or at least
  cross-check one teleported result with a walked run before reporting it.
- **Full suite with the pocket fix in: 2,445 tests, 12 fail, the same list as before** (all of them also fail on clean engine-core).


## 5:35 PM ET (WITHDRAWN, see the correction above): Dot re-check AFTER the planner's fix (engine-chunks 25d2d115)

Method:
- The real testers' page (#ctest) built from a worktree of engine-chunks 25d2d115, on a fresh save each run.
- A real thumb slide, and a real flick up and forward at each step.
- 6 runs, 3 sideways and 3 upright, seeds 3112, 2640, 866, 1348, 4064 and 1769, plus 1 diagnostic run on seed 1201.

Results:
- **"Flick up again in the air to jump twice" was on screen in 0 of 6 runs. No Dot bubble showed at all.**
- **The engine side now works.** I wrapped the engine's guide() in the page on seed 1201. It called "Jump the little gaps" at x 4782,
  then **"Flick up again in the air to jump twice" at x 5265**, which is the teach's entry (5232) plus 33 px, so after its first step.
  - Note: that is NOT 450 px before the first double gap. I haven't measured where the first double gap is.
- **The display drops it.** After the line was called, he stood still for 8 s and no `.dg-bub` existed in the page. Dot herself is on
  screen, top right, with no bubble. Still: `reference/qa/tester-page-1106/dbl2/after-line-side-seed1201.png`.
- So the loss is in DotGuide's queue or display (src/components/dot/DotGuide.tsx), not the engine.
  - Before the fix, no bubble showed either, so this is not new.
  - Its likely suspects, not yet checked: the queue waits for "calm"; the line is classed as a coach/move tip that the help setting
    hides; or the first-run coach is still holding the queue.
- **Stuck 20 s at the first step: Dot said nothing in all 6 runs** (the separate roadmap item).
- The bot won't catch this. A check that walks the real page and reads the DOM bubble, as `scratchpad/dbl2.cjs` does, would.


## 4:33 PM ET: art round 2

- **Pit-pocket pane: FIXED.**
  - Cause: the pocket's soil was clipped to its outline, and its end pieces are wider than it and see-through below their rims.
  - Fix (`protoArt.ts`): `isPocket` finds a piece under 140 px wide that has ownLook and a higher bank touching each side. It is drawn
    bare, then painted soil runs edge to edge under its lip, 40 px under the banks' curved faces. Only gen2 World 1 sets ownLook.
  - Proof that nothing else changes: `src/game/pitPocket.test.ts` builds every old-generator stage in Worlds 1 to 4 (no ownLook piece,
    no pocket), finds Roll B's pockets, and has a planted pair: the same piece without ownLook is not a pocket.
  - Pixel before/after on an old stage: two runs of the SAME code already differ (weather, leaves), so a byte compare can't prove it.
    The test above is the proof instead.
  - Stills: `art/pitpocket-FIXED-rollB-x3600-{side,up}.png` and `x4000-{side,up}`. Before: `pitpocket-NOT-FIXED-*`.
  - drawcheck: PASS with the fix in.
- **End log: DONE.** It's the plank pieces end to end (`art/endlog-rollB-x35100-*`); see below.
- **Boulders: DONE, passed** by the lead.
- **Dot check, BEFORE the planner's fix (baseline, 4:45 PM, tester-page = engine-core):**
  - Setup: the real page on a fresh save, a real thumb slide, and a real flick up and forward at each step (the script is at
    `scratchpad/dbl2.cjs`; I can share it).
  - 6 runs, 3 sideways and 3 upright, seeds 664, 535, 637, 27, 8 and 564.
  - With jumps, he gets past the first step and on into the teach in 5 of the 6 runs, and out past its end in 4.
  - **"Flick up again in the air to jump twice" was shown in 0 of 6 runs. Dot showed no line at all** while he went through the teach.
  - **Stuck 20 s at the first step: Dot said nothing in every run.**
  - The same runs on engine-chunks follow once the planner's fix lands.

## ANSWER (4:16 PM ET): does Dot teach the double on the real page? NO, not in any run I tried

Method:
- The real testers' page (#ctest), gen2 1-1, a FRESH save (localStorage cleared, then a reload).
- Pokey stood 250 px before the double-jump teach section, then a real touch slide was held right (CDP touch, as a thumb does).
- Every line Dot showed was polled for 20 s.
- 5 runs, both orientations, seeds 218, 118, 158, 113, 111, 113, 454, 100, 171, 158 and 286 (a fresh seed each Start).

What I saw:
- Both lines are in every stage: "Nice jump! In the air, flick up again for a double jump." at the teach start +27 to +30 px, and
  "Flick up again in the air to jump twice" at +80 to +500 px.
- **Most runs: he walks up to the teach section's first step and stops.** The step is 70 to 75 px up (w1-double-teach,
  w1-bank-double-teach, w1-dip-double-teach), and both trigger points are PAST it. A first-timer who can't get up never reaches them, so
  Dot says NOTHING (20 s+ standing there; no "still stuck" line either).
  - Example: seed 171, x 4553 against a 75 px step at x 4572.
  - Example: seed 286, x 6548 against a 70 px step at x 6567.
  - Still: `reference/qa/tester-page-1106/dbl/dblteach-stuck-side-run0.png`.
- **One run, seed 158 upright: he got past BOTH trigger points (x 6680 and 7129) and Dot still showed neither line within 20 s.**
  Not yet explained: it isn't tip memory (fresh save) and the lines have no below/above/before limits. It needs the engine owner.
  - Stills: `dbl/dblteach-up-run0.png`, `dbl/dblteach-stuck-up-run0.png`.
- The bot jumps the step, so it never sees this.

My recommendation: move "Nice jump! ..." to just BEFORE the first step (with `beforeX` so it isn't said late). Then find out why the
lines don't show once he is past them (seed 158).

Not yet done: a still exactly at the first teach gap in every run, because he never got there by walking. The stills show where he
stops.


## Tester code (the lead's ~3:10 PM job): DONE

- `testerId()` in `src/game/playRecorder.ts`: 6 letters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O, 1/I), made once and kept
  under `sloth_qa_tester_id`. It's random only: no hardware or advertising id. If storage is blocked (or a store keeps nothing), the
  code is for this visit only and starts with `~`.
- Every row's Player cell is `Name · CODE`, and the data has a `tester` moment at Start.
- The front page shows "Your tester code: KKQUWP" above the round line. Stills: `reference/qa/tester-page-1106/code-{up,side}.png`.
- Tests (`src/game/testerId.test.ts`, 3 pass): the same code on a reread, the blocked case (`~`, the same all visit), and the code on
  every sent row.
- In a real browser, the same code came back after a reload, upright and sideways.
- clipcheck's testers walk PASSES upright and sideways.
- LOG_EVENTS.md has the `tester` row.

## 2026-11-06, the three gen2 1-1 art fixes (deadline 4:30 PM ET)

Full suite on these changes: 2,440 tests, 12 fail, plus the known TODOs, 16 lines in all.
- Every one of those 16 lines also fails on clean engine-core 5e221f9d. I re-ran their 10 files in a separate worktree and the failure
  lists were IDENTICAL.
- artUse is among them: on engine-core 8 cut pieces were unused; now only `w1-post-tall-vine` is.
- Also passing: tsc, components plus the recorder and cut tests (97 of 97), vite build, artcheck, knowncheck, and drawcheck (PASS).

1. **Boulders by fit, at least 6 kinds a roll: DONE.** `src/game/w1CutArt.ts`
   - A stone's stand span is now the platform's width (it was drawn at the platform's height, so a 160 px stone showed as a rock about
     50 px wide and Pokey stood on air beside it).
   - The piece is scaled evenly, stretched at most 1.5x, deep enough to reach the ground; what reaches deeper is left in the earth
     (drawn only down to its foot).
   - Every piece that fits about as well as the best takes its turn (it was a top three the slabs always filled).
   - `LAID` names the 14 pieces 1-1 lays.
   - Rolls now lay 11 to 13 kinds, all four boulders among them.
   - Tests: `src/game/w1CutArt.test.ts`. They check the stand span equals the width, the stretch is 1.5x or less, nothing is drawn below
     the foot, every roll lays 6 or more kinds, and the four boulders are laid.
   - Stills: `reference/qa/tester-page-1106/art/boulders-roll-x2700-{side,up}.png` (seed 3) and `boulder-rollB-x10050-{side,up}.png`.
2. **Pit-pocket panes: NOT FIXED.**
   - Diagnosis so far: they are the dips' pocket pieces, 80 to 115 wide and 120 tall, sitting 70 px below the banks (Roll B x 3671,
     4070, 9164, 10367...), with nothing under them. The see-through band is the pocket's lip over the backdrop, plus the pit shade over
     it.
   - Tried, did not help (reverted): drawing narrow closed banks `bare`; turning the pit shade off.
   - The pocket's soil is not painted below its lip. The next look is drawW1Pits / paintTile for a sunk step (SOFT_BELOW < 70 < SOFT_FLOOR).
   - Still of the problem: `art/pitpocket-NOT-FIXED-rollB-x3600-{side,up}.png`.
   - Later experiments (~3:45 PM): with the pocket platform removed, the dip is a clean open hole down, with no pane. So the pane is the
     pocket's own drawing: its lip strip is painted, its soil is not.
   - Making it deeper (300 px) changed nothing. Narrow-bank `bare` changed nothing. Shade off changed nothing.
   - The pocket goes through drawGroundChunks, then paintTile, then drawGround, then drawBankArt (sides closed, so the soil rect should
     be opaque). Why its soil doesn't show is still open: protoArt.ts belongs to the ground owner, and I ran out of time.
   - 4:20 PM: setting the pocket's `soil` or `hollow` flag, or its height to 400, changes nothing on screen, but removing the pocket
     removes the pane. So the pane is drawn by a path that ignores those fields. The green strip with root lines looks like the moss
     strip (drawBankArt `moss`) or a terrain.ts ledge, not the painted ground.
   - Also ruled out: w1Pits.ts. Its findW1Pits finds no pit on Roll B between x 3000 and 11000, so neither its soft-pit look nor its leaf
     bed draws these.
   - That is where the ground owner should look next.
   - **Slips past 5:00** (the art deadline moved to 5:00); the boulders and the end log are done.
3. **End log (686 px): DONE.**
   - A plank longer than 360 px is laid as plank-ledge pieces end to end (a, b, c in turn, 4 px overlap, no seams). The flat code log is
     gone.
   - Test: in `w1CutArt.test.ts`.
   - Stills: `art/endlog-rollB-x35100-{side,up}.png`.
   - Rough spot seen, not mine: upright, the backdrop's bottom edge shows a smeared band under the end stretch.

**artUse.test:** 7 of the 8 red cut pieces are now drawn. `w1-post-tall-vine` is still unused: 1-1 has no tall narrow post on the ground
for it (every 120 px narrow piece is a dip pocket). It was red before this work, and the allow-list can't grow.
