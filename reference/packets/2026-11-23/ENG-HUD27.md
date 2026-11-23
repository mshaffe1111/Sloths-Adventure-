# ENG-HUD27: the HUD progress bar measured along the route's legs + a 'post:letter' play moment (general; 2-7 TONIGHT)
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 1 h; REPORT BY the time the lead names; HARD STOP 2 h.** Each session hands over at 320k REAL
context or 28 minutes with an EXACT NEXT STEP (D111, D129). Long runs with run_in_background (a suite: timeout 7200000), never '&', never a
foreground wait; at most TWO heavy runs; every run on a chattr-frozen worktree (D115); no heredoc in a commit chain (D119); candidates on
t-eng-27-wip-hud; a landing runs the suite AND the CI tool line (D126; inherited reds named with base evidence). Technical forks inside this
scope are yours: decide, one line why. No stage id or x in engine code (generalitycheck).
BASE: t-eng-27 (its newest head: ENG-JETTY's landing, fetch it by name).
FOUND BY BUILD-27b (2-7, adult, seed 1): (1) the HUD's distance ratio is a run's x from start to exit (engine.ts:3732, mode.progress(startAt,
exitAt, bestAt)); 2-7 starts at x about 4500 going RIGHT and exits at x about 1000, so the bar does not move for the whole out leg (about 53 s
of 134) and reaches half 9 s before the end: Matt would see a stuck bar for half the stage. (2) a wayside line is placed by WHEN (wayside.ts
StageWay.at: start / half / near / on a named moment; the only named moments are 'cast:*', engine.ts:4878); nothing fires when a letter is
posted, so 2-7's mailman joke cannot sit on the walk out.
1. **Progress along the route:** the bar measures distance along the laid route's legs (gen2 legs: out, then back), monotonic, 0 at the start
   and 1 at the exit, for ANY stage that lays a leg back; a stage with one leg reads exactly as today (lockall/stills unchanged elsewhere).
   A toy: an out-and-back row, the bar rises through the out leg; RED on today's measure.
2. **A 'post:letter' moment** (general: any post stage), fired when the post takes its first (or Nth) letter, usable as StageWay.at 'on'.
   A toy, RED with the moment off.
3. Land on t-eng-27 and send the lead the hash; BUILD-27b/c sets way.2-7 to dotOn('post:letter', the same words verbatim) and checks the bar.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.
