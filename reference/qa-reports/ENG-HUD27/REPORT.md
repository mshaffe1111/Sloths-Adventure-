# ENG-HUD27 REPORT: the HUD bar along the route's legs + a 'post:letter' moment

Started 1:22 PM ET (`TZ=America/New_York date`: Mon Nov 23 13:22:51 EST 2026). Packet: reference/packets/2026-11-23/ENG-HUD27.md.
BASE: t-eng-27 d9425f091 (ENG-27w's landing). Candidates on t-eng-27-wip-hud.

## What was built (general: no stage id, seed or x in engine code; generalitycheck PASS)
1. **The bar along the route** (src/game/routeBar.ts, wired in engine.ts travelStart and the progress step). On a stage laid as MORE
   THAN ONE LEG (gen2 `tower.flow === 'legs'`, two legs or more), the HUD's distance ratio is the best route px so far over the route's
   whole length: gen2/tower.ts `routeOf`/`routeAt` (the same route the lay already measures its flags by), plus the tail from the last
   section to the totem (`routeDone`), so it reads 0 at the spawn and 1 at the totem. It never goes back, and it counts only frames where
   he stands or climbs (`p.grounded || p.climbing`).
   Fork, decided: no air frames, because the race leg is laid UNDER the out leg (legs.ts stackedUnder). A mid-air frame over the gap can
   sit nearer the lower leg's height, and a best-so-far bar would keep that false jump after the respawn.
   A stage of ONE leg (every run, every tower, one leg laid left) gets no route bar (`routeBarOf` returns null), so the travel mode's
   own measure (stageModes.ts) runs exactly as before. The meeca camera's `mc.ratio()` still comes first.
2. **'post:letter' moments** (post.ts `postMoments`, wired in engine.ts after `stepPieces`). Read from the post piece's own door state
   (pieces/postPiece.ts `open`: it opens a door at the same reach the engine takes the letter with). The first letter posted pushes
   'post:letter' and 'post:letter:1'; the nth pushes 'post:letter:<n>'. Each is named once onto `engine.moments` (the GuideView.moments
   that wayside.ts dueLine reads for `at: 'on'`). Any post stage; no post, no moment.
   Fork, decided: the engine reads the piece's `open` (the way it already reads the pacer's verdict, engine.ts `pieces.find(kind)`),
   because adding a moment call to PieceHost would change an interface, which is the Architect's.

## Proofs (planted RED first)
- **src/game/gen2/hudRoute.test.ts**, plant 6c7aeccbd (helpers and tests, engine not wired), on a frozen tree: **RED 2 of 3**.
  - "the bar rises through the out leg: 0.000 at its end (today's measure: 0, a stuck bar for the whole way out)". This is the
    out-and-back toy (toyHome HOME_CODE, seed 1), the middle bot on the real engine, reading the ratio the engine sends the HUD. The
    first plant (02093fe04) failed on "the bar never goes back (0.400 to 0.399)": today's leftward bar also follows him back.
  - "the first letter posted is the moment 'post:letter' (moments: [])". This is the post toy (POST_CODE, seed 1), real engine, him put
    at the first slot.
- The same file on the fix, 2ca3de9b5, frozen: **GREEN 3 of 3** (the out leg rises; the bar is monotonic over the whole run, starts
  under 0.05 and reads 0.98 or more at the totem; 'post:letter', ':1', then ':2'; 'post:letter' named once).
- **The real 2-7** (t-build-27-wip 481203add with my two commits cherry-picked, a scratch tree, not pushed; the middle bot, Normal,
  seed 1): route bar ON (legs right, down, left). Per tenth: 0.10 at t17.1 (x6829), 0.21 at t39.4, 0.31 at t54.0 (end of the way
  out), 0.41 at t158.0, 0.51 at t171.5, 0.61 at t191.2, 0.70 at t323.3, 0.80 at t358.5, 0.91 at t375.0. Last read 0.999. It went back
  0 times in 11,980 frames; the run ended at the shrine in 389.4 s.
  For comparison: BUILD-27b measured today's bar on the adult bot. It was stuck at 0 for the whole way out (about 53 s) and reached half
  9 s before the end.
- **Every listed stage on t-eng-27** (1-1 to 1-9, 2-1, 2-2, 2-4, 2-5), each built in RealPlay: routeBar none on all 13 (1-4 is a
  one-leg tower; the rest are runs). Their bars are the mode's measure, unchanged. No stage on t-eng-27 lays legs except the toys;
  2-7 lays them on the builder's branch.

## Gates (fix head 2ca3de9b5, frozen worktrees)
- tsc: PASS. generalitycheck: PASS (26 literals, 26 known). knowncheck: PASS.
- roadmapcheck: "shallow clone, proofs cannot be checked (fetch-depth 0): FAIL", the same on base d9425f091 (environmental:
  `git rev-parse --is-shallow-repository` = true; this branch does not touch ROADMAP).
- Unit suite + CI tool line, base d9425f091 and fix 2ca3de9b5: RUNNING at this writing (see EXACT NEXT STEP; verdicts are filled in
  below when they end).
- lockall: not run. Neither change touches the lay (routeBar reads the stage; postMoments reads a piece), so no layout can move.
  drawcheck/clipcheck: not run (no drawing changed; the HUD draws the same bar from a different number).

## Polish check
Nothing new is drawn: the HUD bar's art and place are unchanged; only the number it shows changes, and only on a stage laid as legs.
On 2-7 the bar now moves from the first step (0.10 at 17 s), so Matt no longer sees a stuck bar for the first 53 s. The 2-7 stills
with the bar, and the mailman line on 'post:letter', are BUILD-27c's (packet item 3).

## Method used
reference/methods/dispatch-packet.md: base suite first in the background, frozen worktrees (chattr), a planted RED then GREEN, the CI
tool line at the landing, the candidate safe-kept on -wip. reference/roles/ENGINE.md day one: planted failure first; proved on a real
stage row (D75).

## Lessons applied
D114 (the base suite first), D115 (frozen trees; my first unfreeze stopped on the node_modules link, so I unfroze src and tools only),
D118 (the base suite and CI tool line re-run on d9425f091 itself, not carried from ENG-27w's d794dcda1: tools/ changed after it), D119 (no heredoc inside a
commit chain), D122/D123 (7200000 ms timeouts, at most two heavy runs), D75/D101 (proved on the real 2-7 row, not only toys),
D43 (works for any stage: no stage id in engine code), D109 (no clock times in messages), D117 (a candidate on -wip first).

## Method update
- dispatch-packet.md D115: `chattr -R -i <tree>` fails on the node_modules symlink ("Operation not supported"), and a && chain stops
  there. The unfreeze line should read `chattr -R -i <tree>/src <tree>/tools` (the same two folders the freeze names).

## Learned (for the next engine member)
- gen2 already measures a route along legs (tower.ts routeOf/routeAt, used for flags). Anything that needs "how far along" on a legs
  stage should read `stage.gen2.tower.route`, never x.
- A moment a story line can wait on is just a name pushed onto `engine.moments` once (wayside.ts dueLine reads it). A piece's state the
  engine reads after `stepPieces` gives one without touching PieceHost.

## Suggestions (outside my WRITE files)
- BUILD-27c: way.2-7 `dotOn('post:letter', <the same words>)` (packet item 3). 'post:letter:<n>' can also place a line at a later
  letter.

## EXACT NEXT STEP
(written at hand-over; see below)
