# tester-page status (the lead reads this; no send_message until further notice)

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
