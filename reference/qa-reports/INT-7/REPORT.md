# INT-7 REPORT (t-int-7 from origin/main@73e7bed0; lead session_01FhBbYNzGRJBDMzn6XbtQK2). INT-7 5:24-5:32 AM ET (paused); INT-7b 7:58 AM ET to 8:53 AM, Opus 5.5 xhigh, context ~31% of 1M.
## STATUS: GREEN on cc015e7f (every gate; kbdcheck green re-run alone, below). Stills + clips shot, judged, pushed. Ready for the lead's pass/fail.
Code head 4fc09159 (both merges); gated head cc015e7f (+ docs/tools only); this report's commit adds docs, stills and tools only;
fast gates on the report tree (D53), 8:54 AM: tsc 0, roadmapcheck, knowncheck, generality PASS.
## Done (evidence)
- **Merges (INT-7, unchanged):** origin/t-polish-5@471bd000 (4be13fac: two merge bases, built as member tree + main's own 8-file delta, proved
  by `git diff --cached`), its tsc-red evidence script renamed .txt (f9f670e8); origin/t-fix-14b@d3501970 (4fc09159, one conflict provenIndex.ts,
  each side's own version line kept). Full detail: git log of those commits.
- **Step 1, every gate on cc015e7f** (gates/run.sh, results line by line in gates/RESULTS.txt; logs are gitignored, failures quoted below):
  tsc, build (BASE_PATH), chunkcheck, artcheck, knowncheck, generality, roadmap 0; unit shards 1/2/3 0 (one TODO: main's 4-3 boulder);
  every seed list PASS (1-1 257, 1-2 100, 1-3 100, 1-4 100, 1-5 150); registry, 9 tool tests, tierBots, drawcheck (463 s), clipcheck
  (83 known), buildcheck (p95 Normal 113 / Easy 65 ms of 150) 0. kbdcheck: red ONLY on its planted case under the runner at load 21 (the
  planted run timed out, which it reads as "stays green"); re-run ALONE 8:53 AM: PASS, planted goes red as it must. gates/gate-summaries.txt.
- **Step 2, stills + clips** from a frozen worktree of cc015e7f on :3217 (tools/stills.sh setup, tools/shoot.sh runs, tools/clip.mjs), 2x,
  upright 412x915 + sideways 915x412, Normal + Easy, every file's BUILT line printed by the game (D62) in the .txt beside it:
  - 1-4 seed 1, layout 0: stills/1-4/{gate,vines,pods,fork}-{normal,easy}-{up,side}.mp4 (15 fps) + stills/sheets/<same>.jpg (contact sheets).
    gate: Normal 3 figs / Easy 2; push, strain, SNAP, hold up (head stops under: worst 0 px over the shut underside on all 4), jump (still
    under), last fig throws the thatch off, way up open. vines: one vine 1.33 s 0/3 petals; two vines 0.87 s 2/3 (1.6x up, petals taken).
    pods: vine lights + shakes, dust, slow drop (300 px/s), long quiet. fork: three creaking boughs step down (Normal x 354/484/614,
    Easy 588/708/828 w148), each gives one branch down, sound wood below.
  - gate-teach-{normal,easy}-up: TEACH=fig (only the fig line live): it shows on both defaults (Normal: Dot, "I'll wait!";
    Easy: "Skip tips"), but only because the clip drops him past its x: in real play it fires at the spawn (TIPWALK, Polish check).
  - 1-1: first run (seed 9800, layout 18) x 600/9000/21050 and the hole (seed 769, layout 1) x 25600/26600/27600/27900, both settings,
    both orientations: stills/1-1/*.jpg. Unchanged gameplay (ruler only), reads as before; Easy fills the hole with earth at x 26600.
## Polish check (every clip judged on contact sheets + full-size frames; stills/sheets/)
- PRE-EXISTING TEACH DEFECT (no diff since main in w1Arc14.ts tips / pipeline.ts:3008 hints.push): 1-4's four teach tips fire by x alone
  (engine.ts:3124), and 1-4 climbs, so walking right from the spawn (x 140, y 11321) says all four in 3 s on the start floor: creak 0.5 s,
  two vines 1.7 s, figs 1.7 s, "Hear it creak?" 2.7 s; first creak bough y 10139, first fig gate y 7855. Easy the same.
  stills/1-4/TIPWALK-1-4-L0.txt (tools/tipwalk.mjs). Breaks "the first appearance of a mechanic is taught". Sent to the lead 8:40 AM: R-165.236.
- PRE-EXISTING, NOT in this diff (no backdrop/draw file changed since main): a hard VERTICAL SEAM in 1-4's backdrop canopy, sideways
  (stills/1-4/SEAM-gate-normal-side-f0050-crop.jpg): lighter hazy left half, darker right, a straight edge through the trees. Shipped in 0.9.8.
- The unlit flag's rim (the lead's 2:56 AM ruling: keep the gold rim, drop the pool) reads as a soft cream halo oval around the post on
  1-4's green (stills/1-4/RIM-flag-side-up-crop.jpg): for the lead's pass/fail (D61), not mine to rule.
- 1-1 hole upright: the lower third under the log bridge is a featureless dark murk (the hole's depth); sideways reads lush. Lead's call.
- Tool limits, not game: Easy's Dot find-hint ("One of these plants isn't like the others... I'll wait!") stays up through every Easy clip
  because the tool never taps it; the caption bar sits at the bottom and hides the lowest ~45 px sideways (in fork-*-side the next bough).
## Fixed in the tools (mine)
- stills.sh shot the "first run" at layout 17 = seed 9652: __play layout N builds list index N-1 (testlink1_1.ts:98-102 play11Seed);
  9800 is index 17, so layout 18 (BUILT now prints 9800). The L17 stills were deleted.
- clip.mjs: captions covered the game's own Pokey line (moved to the bottom); the gate caption said "two figs" on a 3-fig gate (now the
  real count); TEACH=<words> keeps only that beat's teach line live (D50/D63). shoot.sh: a guard so no shot runs beside buildcheck.
## Pushback: INT-7's "list index 17" first-run note was off by one (fixed above); the game's BUILT line caught it (D62 works).
## Suggestions
- R-165.236 (the lead's TIPS packet): tips carry the socket's height band + a gen2 verdict planted red on TIPWALK's numbers; sweep (D21).
- An integration role card + turnover note (none exists: roles/README.md rule 10 has nothing to rewrite for INT-n). Objective: card with
  the merge-base check, the runner, the frozen-worktree shoot, BUILT checks; files reference/roles/INTEGRATOR.md, handoffs/integrator.md.
- kbdcheck: print the planted run's own results, and fail by name when the planted run "could not run" (it now reads as STAYS GREEN).
## Unresolved
- Nothing running. R-165.236 (1-4 teach tips by x alone) is the lead's, packet to TIPS; the canopy seam the lead logs; the flag rim is the
  lead's pass/fail. Clips use tool placement (teleports), so they prove the pieces, not a start-to-finish run of 1-4.
## Method update (proposed: gates.md / release.md)
- A shooter that picks a 1-1 layout states the formula (layout N = list index N-1) and asserts the seed it wanted (STAGE_SEED-style).
- Heavy shoots may run beside the unit/seed-list phase, never beside buildcheck (or kbdcheck: its 7 s waits time out under load 21).
- Wait on a background job by its completion notice, never an until/sleep loop (not auto-approvable: a 14-min stall here; the lead's to log).
**Lessons applied:** D29, D36 (frozen worktree), D50/D63 (teach clip on defaults, whole action + cheat try), D53 (fast gates on the report
commit), D57 (queue read at each push), D59 (no gate left running; UNRUN named), D61 (rough spots named for the lead's pass/fail), D62 (BUILT
on every file: caught the wrong seed), D64 (context vs 1M). **Method used:** gates.md, INT-6/INT-7's runner and shoot layout.
**Turnover note:** none exists for integration (Suggestion 1).
