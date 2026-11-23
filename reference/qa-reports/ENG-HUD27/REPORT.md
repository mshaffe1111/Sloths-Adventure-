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

3. **Easy's flags on a stage with a route** (the lead's item 3; easyMode.ts, the flag fill). The fill put a flag into every gap of
   FLAG_EVERY or more between the flags and then sorted them, measuring both by x. On a stacked out-and-back the two legs share x, so
   an x gap ran across both legs, and sorting by x broke the route's order. levelCheck's routed check and the engine (tower.ts
   flagFurther) take flags in route order. Now, on a stage with `gen2.tower.route`, the gaps, the ledge nearest the middle and the
   order are all measured in route px (routeAt). Every stage without a route keeps x exactly (`along` is x).
   Fork, decided: fill by the route rather than skip the fill on routed stages, because skipping would drop Easy's denser flags on 2-7
   (16 instead of 11), and the route is the measure the engine already uses for flag order.

## Proofs (planted RED first)
- **Item 3, src/game/gen2/easyRouted.test.ts**: plant c06f051d7 (the test, old fill), frozen: **RED**, "home seed 1: flag 1 at x
  3399 (route 22315) is further along the way than flag 0 at x 2055 (route 23659)". On the x measure the home leg's flags come out in
  reverse route order. Fix 90b9fbccc, frozen: **GREEN** (with hudRoute.test.ts: 4 of 4).
  Toy probe, all 15 laid rolls (home and post codes, seeds 1-8): old fill 15 of 15 out of order; new fill 0 of 15, adding 3-4 flags.
- **Item 3 on the real 2-7** (scratch tree: t-build-27-wip plus my commits, frozen per run), Easy, layouts 1-4: before the fix,
  OUT-OF-ORDER on all 4 (v1 route px 29839,27866,26308,24342,3046,...). After it, in order on all 4: 11 flags become 16, strictly
  increasing (v1: 1936,3916,5350,7513,9173,11279,12726,14554,16544,17576,19093,20897,24342,26308,27866,29839).
- **Item 3, listed stages:** 1-4, the one listed stage with a route, is a climb ('ascent'), so the fill never runs there. Its Easy
  flags are identical old and new over 16 layouts. Every other listed stage has no route, so it runs exactly the old code.
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

## Gates (frozen worktrees; the landing head is 90b9fbccc plus this REPORT)
- tsc: PASS. generalitycheck: PASS (26 literals, 26 known). knowncheck: PASS.
- roadmapcheck: "shallow clone, proofs cannot be checked (fetch-depth 0): FAIL", the same on base d9425f091 (environmental:
  `git rev-parse --is-shallow-repository` = true; this branch does not touch ROADMAP).
- Base d9425f091 unit suite: **tests 4064, pass 4059, fail 2, todo 3**. The 2 reds are the planted log-hop bot tests ('a log
  drifting his way ... boarded by a hop', 'the racing hop off a log lands where it was judged to'), as ENG-27w named.
- Fix 2ca3de9b5 (items 1-2) unit suite: STOPPED at 3,541 results once item 3 changed src. Up to there it had the same 2 reds and the
  same todo as the base, and nothing new. Its verdict is superseded by the landing head's run.
- Landing head 90b9fbccc unit suite + CI tool line, and the base CI tool line: see the verdict lines below (filled in at landing).
- lockall: not run. Items 1-2 do not touch the lay (routeBar reads the stage; postMoments reads a piece). Item 3 changes Easy's flags
  only on a stage with a route, and no listed stage is both routed and filled (1-4 measured identical, above).
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
D80/D101 (item 3 is measured against the old code on every listed stage it could touch, and on the real 2-7), D43 (works for any stage: no stage id in engine code), D109 (no clock times in messages), D117 (a candidate on -wip first).

## Own miss
- Packet rule broken once: I ran the old-code toy probe behind a shell `&` (the packet says never). Its output was lost, so I re-ran
  it in the foreground (about a minute). Nothing was built on it. Next time a side-by-side comparison runs as two sequential foreground
  commands, or as one run_in_background.

## Method update
- dispatch-packet.md D115: `chattr -R -i <tree>` fails on the node_modules symlink ("Operation not supported"), and a && chain stops
  there. The unfreeze line should read `chattr -R -i <tree>/src <tree>/tools` (the same two folders the freeze names).

## Learned (for the next engine member)
- gen2 already measures a route along legs (tower.ts routeOf/routeAt, used for flags). Anything that needs "how far along" on a legs
  stage should read `stage.gen2.tower.route`, never x.
- Any rule that measures "gaps" or "order" by x (Easy's flag fill, w2.ts:372) is wrong on a stacked stage. Grep for `.x - ` /
  `sort((a, b) => a.x - b.x)` near flags and checkpoints, and use routeAt when `gen2.tower.route` exists.
- A moment a story line can wait on is just a name pushed onto `engine.moments` once (wayside.ts dueLine reads it). A piece's state the
  engine reads after `stepPieces` gives one without touching PieceHost.

## Suggestions (outside my WRITE files)
- BUILD-27c: way.2-7 `dotOn('post:letter', <the same words>)` (packet item 3). 'post:letter:<n>' can also place a line at a later
  letter.

## EXACT NEXT STEP (hand-over at the lead's 300k line; the lead widened item 3)
State: t-eng-27-wip-hud holds items 1-2 (2ca3de9b5) and item 3's easyMode fix (90b9fbccc, a local `along` in easyMode.ts), each with
a toy RED then GREEN (above). NOT landed. This session's suites cannot reach a successor (they are in its container), and the code
below changes src again, so the successor runs its own suite on its landing head. The base verdict is above: unit 4064 / 4059 / 2 fail
inherited / 3 todo on d9425f091. ENG-27w named 12 inherited CI-tool reds on d794dcda1; the base CI tool line was still running here
at hand-over.
1. ONE general route-order helper (the lead's ruling) in src/game/gen2/tower.ts, next to flagFurther:
   `export const alongOf = (stage: object) => { const r = (stage as { gen2?: { tower?: { route?: Route } } }).gen2?.tower?.route; return (x: number, y: number) => (r ? routeAt(r, x, y) : x); }`
   plus `firstMet` / `lastMet(stage, items, at)` that pick by it. On a one-leg stage it is x order, so every listed stage reads the
   same. Replace easyMode.ts's local `along` (90b9fbccc, the flag-fill block) with alongOf(stage). easyRouted.test.ts must stay GREEN.
2. verdicts.ts:142 `firstWater = ...sort((a, b) => a.x0 - b.x0)[0]` becomes firstMet along the route. dropVerdicts takes
   `Pick<JudgedStage, 'setting'|'policy'|'drops'>` (called at verdicts.ts:186 with the judged stage `st`), so check whether the judged
   stage carries `gen2.tower.route` and a drop's height (a Drop has x0/x1; routeAt needs a y). If it does not, pass the route and
   take the drop's ground y from the stage; a Pick type widening is the Architect's, so name it if it is needed.
   Toy: the out-and-back toy (toyHome HOME_CODE; the out leg's river 'home-test-back' is the first water he meets, and the home leg's
   rivers lie at smaller x). Assert firstWater is the out leg's river: RED on x order (it picks the home leg's last river), GREEN on
   the route. BUILD-27c's case: 2-7 seed 2, drop.unwarned.
3. Grep sweep for the REPORT (list only; fix only these two; the rest is Lane 2, R-165.414): in src/game (not tests), every
   first/last picked by x: `sort((a, b) => a.x0 - b.x0)`, `sort((a, b) => a.x - b.x)` followed by [0] / at(-1) / the end,
   `Math.min(...x)` / `Math.max(...x)` used as "first". Name file:line and whether it can see a stacked stage. Known so far:
   easyMode.ts flag fill (fixed), verdicts.ts:142 (step 2), w2.ts:372 (the lead's note).
4. Gates on the landing head, frozen worktrees: tsc; the unit suite and gates.yml's 'rolled' test line (background, 7200000 ms);
   compare each `not ok` name with the base's; generalitycheck; knowncheck. lockall vs the base: no listed stage may move (1-4 is the
   only routed listed stage, an 'ascent', never filled; measured identical over 16 layouts for item 3).
5. Land: `git ls-remote origin t-eng-27`; if still d9425f091, fast-forward-push the wip head to t-eng-27, else merge it and re-run
   tsc + hudRoute.test.ts + easyRouted.test.ts + the verdicts toy. Then send the lead the landed hash and the suite lines. No clock times.
