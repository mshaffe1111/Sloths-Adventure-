# ENG-HUD27 REPORT

## ENG-HUD27b (the successor session): one route-order helper, easyMode + verdicts.ts 'first water', the x-pick sweep, landed
Started 2:20 PM ET (`TZ=America/New_York date`: Mon Nov 23 14:20:22 EST 2026). Packet: reference/packets/2026-11-23/ENG-HUD27b.md.
Base: t-eng-27-wip-hud e4568241f, with t-eng-27 e2f3855cf (ENG-JETTY's landing) merged in first (315caa0ef; one conflict in engine.ts
after stepPieces: both kept, the post moments and then the race-end line; tsc PASS).

### Landed
t-eng-27 fast-forwarded from e2f3855cf to this REPORT's commit (the gated engine code is e4c4d3de8; later commits are REPORT only).

### Done-items
1. **ONE helper** (src/game/gen2/tower.ts, beside routeOf/routeAt/flagFurther): `alongOf(stage)` (the px along the laid route on a
   stage with `gen2.tower.route`, routeAt; x itself on every other stage), and `firstMet` / `lastMet` / `inMetOrder(stage, items, at)`.
   `at` gives a thing's place, or the places it spans (a drop's two lips: met at the one he reaches first, which is x0 on a stage with no
   route). With no route they are exactly `.sort(by x)[0]` / `.at(-1)` / the sorted list, ties kept (proven on 200 random lists).
   easyMode's flag fill now reads `alongOf(stage)` in place of its local measure (90b9fbccc's `along`; same numbers).
2. **verdicts.ts dropVerdicts' first water** = `firstMet(laid, waters, lips)`. Fork, decided: dropVerdicts takes an optional second
   argument `laid` (the built stage; none: x order), and judgeRoll hands it `built`, which judged11 already sets (promises11 reads it the
   same way). Why: the Architect's JudgedStage type stays as it is, and every existing caller and test reads exactly as before.
2b. **The fourth site (the lead's add, found by BUILD-27d): the water LAY.** pipeline.ts fillSockets laid WATER_WARN's line and sign at
   the least-x wet gap (`[...wet].sort((a, b) => a.x0 - b.x0)`), always left of x0, so on 2-7 Normal's one line went to the way home's
   last river and was clamped to the spawn, and the first river he meets had none (a real play bug: Dot warned at the wrong river).
   Now (pipeline.ts:3814-3842): the wet gaps in the order he meets them (`inMetOrder(met, wet, lips)`), each line WATER_WARN.lead px of
   route before the lip he reaches first and never before the spawn; a gap he meets at x1 (running left) gets `x: x1, beforeX: x1 + lead`
   (the engine says a line once he is past x and not past beforeX) and its sign at x1 + 40; Easy's spacing is along the route; on a stage
   with a route each line carries its section's height band (tipBand), so a storey passing over the river does not say it. dropsOf
   (pipeline.ts:4613-4622) matches a line to its fall the same way (leftward: beforeX, the sign right of x1). A stage with no route takes
   the old path exactly: x order, no band, the same hint keys, the same match.
3. **The sweep** (below): 20 sort-then-pick sites and the min-of-x "first" picks in src/game, each classified.
4. lockall, suite and CI tool line: Gates, below.

### Proofs (planted RED first, each on its own chattr-frozen worktree)
- **src/game/gen2/firstMet.test.ts**, plant 462c9a8b4 (the test and the helper, verdicts.ts still on the x pick): **RED 1 of 2**,
  "home seed 1: Dot's line on the way out's first river is the warning owed": `'the first water at x 1231..1927 has no Dot line'`.
  1231..1927 is the way home's LAST river (route px 23113). The first river he meets is at x 13500 (route px 1346, on the way out).
  Test 2 (no route: x order exactly, and dropVerdicts with no stage or a run picks the least x0) is GREEN on the plant.
- Fix 64831cbe1, frozen: firstMet.test.ts + easyRouted.test.ts + hudRoute.test.ts **6 of 6 GREEN**. The toy test proves 3 things on
  every laid roll, home and post codes, seeds 1-4: Dot's line on the first river met is enough; with it missing, that river and only it
  is named; and judgeRoll with `built` gives no drop.unwarned. judgeRoll is the path pipeline applyVerdicts takes for a judged stage, so
  it covers BUILD-27c's `judged: 'normal-2-7'`.
- **The lay, src/game/gen2/waterWarnRouted.test.ts**, plant 9c3e6fb15 (the test, the old lay), frozen: **RED 2 of 2**. Normal: "home
  seed 1 normal: the line starts 2734 px of route before the first wet gap he meets (x 14930..15470), within 960" (it stood at the spawn,
  laid for the home leg's last gap). Easy: "the line at x 12591 starts before a warned river's near lip" (the home leg's lines all stood
  at the spawn). Fix e4c4d3de8, frozen: waterWarnRouted + firstMet + easyRouted + hudRoute **8 of 8 GREEN**.
- **The real 2-7** (a scratch tree: t-build-27-wip 51ff9c43f merged with this fix's engine code, judged flipped as BUILD-27d's 3 lines
  say (stageTable '2-7' judged 'normal-2-7'); not pushed): every roll 1-12, both settings, **0 drop.unwarned, 0 other verdict lines**.
  Normal's one line now stands 480 px before the first river he meets on every roll (seed 1: line x 12468, river 12948..13508 warned;
  seed 4: 12183, river 12663..13223). Easy 2-7 has no lethal water at all (its rivers splash back): no line is owed, none laid, the same
  as before. BUILD-27d measured every roll failing on 64831cbe1 (the verdict fix without the lay fix). w2Arc27.test.ts on that tree:
  8 of 8. (My probe: reference/qa-reports/ENG-HUD27/errs27.ts; BUILD-27d's probes27d/errs.mts is not pushed on t-build-27-wip.)
- easyMode's plant still RED on the old fill: easyRouted.test.ts on c06f051d7, frozen: **fail 1 of 1**. On the fix: GREEN (above).
- **No listed stage's verdict can move.** 1-4 is the only listed stage with a route. A probe on the frozen fix tree built every listed
  stage on 16 layouts x 2 settings (reference/qa-reports/ENG-HUD27/firstWaterListed.ts). The result: 32 routed builds, 0 painted lethal waters on them,
  so the first water differs on 0. Every other listed stage runs x order exactly (test 2).

### The x-pick sweep (list only; the Lane 2 job, R-165.414). src/game, not tests, on 64831cbe1
"Stacked" = a stage laid as legs (gen2 tower flow 'legs': 2-7 and the toys today). "Lay-time" = runs inside one leg's lay, before
legs.ts mirrors a left leg, so it reads rightward x correctly.
| file:line | what it picks by x | can a stacked stage reach it |
|---|---|---|
| gen2/verdicts.ts:146 (was :142) | the first painted water (Dot's line) | FIXED here (firstMet) |
| gen2/pipeline.ts:3826 (was :3818) | the wet gap Normal's one water line goes to, and Easy's order | FIXED here (inMetOrder; BUILD-27d's find) |
| gen2/pipeline.ts:4616 (dropsOf) | a water line matched to its fall (assumed he runs right) | FIXED here (either way) |
| easyMode.ts:522-546 | Easy's flag gaps, middles, order | FIXED (90b9fbccc, now alongOf) |
| gen2/worlds/w2.ts:314 (the lead's :372) | falls in x order; the plank join's 'next fall' | already y-banded (`|o.y - f.y| <= LIP_RISE`, ENG-JETTY's under-leg band): safe |
| gen2/walkedSpan.ts:193 | the first swinging vine AHEAD (rightward) of a ledge | YES: petals' walked path runs on the built stage, so on a left leg 'ahead' is the wrong way (y-banded) |
| storyChecks.ts:71 (teachOrder) | a node's pieces by x; the first piece needing the move; `Math.min(...said)` the first line | YES if run on a legs stage: a node's x span takes in the other leg's pieces (no y band). No caller in src; tests and tools only |
| gen2/stillLay.ts:277 | the first bush inside a still zone (`inside[0]`) | YES if a legs stage lays a still zone (w2.ts imports stillLay; no y band) |
| levelCheck.ts:1137 | a zone's solids by x, the reach chain from the first | YES if a legs stage lays a tide or spore zone (no y band). World 4/5 kinds |
| jumpTrails.ts:43 (routeGaps) | the reach chain from the least-x solid, whole stage | old builder (stageGenerator addJumpTrails); reaches a legs stage only if that path runs on gen2 stages. Not checked |
| gen2/rideLay.ts:95 | the next level platform ahead of a ride | lay-time and y-banded: safe |
| enemyBrain.ts:117 | the level piece under him (`find`, at his feet's y) | containment at one height, not a first pick: safe |
| petals.ts:146 | runs of petals on one line (grouped by y first) | y-grouped: safe |
| gen2/w8Harness.ts:24,33,64; gen2/worlds/w8.ts:296,312 | the first dark zone, the first void drop, the first meet | World 8 only; reaches a stacked stage only if World 8 lays legs |
| gen2/worlds/w1Arc18.ts:380 | the last flag before a spot | 1-8 (a run): no |
| chaseTestKit.ts:36,44 | the last flag before a chase stretch | a test kit, chase runs: no |
| dotFlightPilot.ts:19, dotFlightStage.ts:861-870 | Dot's flight: the first wall, flower, puff, gust | the flight stage type (one way): no |
| mixer/w1mix.ts:1243, protoArt.ts:1449, w7TempleArt.ts:110-111, artDress.ts:302,308 | art and the old mixer's placement | old builder or art only: no |
Spans (`Math.min/max(...x)` as an extent, e.g. pipeline.ts:1119, 2654, 4256; chaseLay.ts:118) are not first/last picks and are left out.
Found by a script (reference/qa-reports/ENG-HUD27/xpickSweep.mjs: a sort by x/x0/x1/start/cx then [0], at(-1), [length - 1], pop, shift or find,
directly or through the sorted list within 25 lines), plus a grep of min/max of x named first/last.

### Gates (frozen worktrees)
- tsc PASS; generalitycheck PASS (26 literals, 26 known); knowncheck PASS (e4c4d3de8).
- **lockall** (every stage, 102, x 16 layouts x 2 settings, 3,264 builds): base e2f3855cf recorded, head e4c4d3de8 checked:
  **102/102 unchanged**, none intended. (Verdicts and drops are not hashed; the probe above covers the first water on every listed
  stage, and a run takes the old lay and match path line for line.)
- **CI tool line** (gates.yml 'rolled', 345 tests): base e2f3855cf **333 pass / 11 fail / 1 todo**; my first head 64831cbe1 the same
  11; landing head e4c4d3de8: 345 / 332 / 12 fail / 1 todo: the same 11, plus seedlist.test.ts:15, whose own `git worktree add` hit
  my full disk ('unable to write file', seven worktrees); with the disk freed it re-ran on the same frozen tree 10 of 10 GREEN. The 11 inherited reds, all red on the base itself: wheelChannel.test.ts:40, :56, :79, :92 (World 2
  finish: 'the fall at x=335-731 has no bank at one end'; also red on d9425f091, before ENG-JETTY), wheelRide.test.ts:26, :42,
  firsttimer.test.ts:184, riverRide.test.ts:106, :144, :202, :218; the todo is chaseBots.test.ts:110.
- **Unit suite**: base 4,073 / 4,068 pass / 2 fail / 3 todo (ENG-JETTY on 1b2897cfb, the same src and tools as e2f3855cf: the two reds
  pacerLay.test.ts:254, :280). Landing head e4c4d3de8: **4,081 / 4,076 pass / 2 fail / 3 todo**: the same two inherited reds
  (pacerLay.test.ts:254, :280) and the same 3 todo; the 8 new tests are this job's toys. (A first run on 64831cbe1 was stopped at 1,250 results, no red, when
  the lead's fourth site changed src.)

### Polish check
Nothing drawn changes. On 2-7 the change is which river Dot's 'water' line is owed at: the first one Pokey meets on the way out, not
the way home's last river, where a line would come about 5 minutes too late. Easy's flags are unchanged from 90b9fbccc (same measure).
The stills and the line itself are BUILD-27c's (its judged flip and yield).

### Pushback
- The packet and the hand-over said "a Drop has no y". It has one: `lipY` (verdicts.types.ts:77-80). So only the route had to be
  handed over, and no type was widened (the hand-over's "a Pick widening is the Architect's" never came up).
- The toy's first water he meets is the way out's river crossing, a ride (a narrow fall inside the river, drawn as deep water). The
  verdict asks Dot's line at the FIRST painted water, but the water lay has never covered a river (its line, "Flick up and over", is
  for a wet gap he jumps). So on a stage whose first water is a ridden river with no wet gap before it, drop.unwarned would stand. Not
  on 2-7 (12 rolls clean) and not on any listed stage. It is a design question, not the x-order trap: does a ridden river owe Dot's
  water line? Lead / Designer call; the toy test checks the first WET GAP met and names this.
- t-eng-27 carries 11 CI tool-line reds, not the 5 ENG-JETTY's REPORT named: wheelChannel.test.ts x4 and wheelRide.test.ts x2 are red
  on e2f3855cf itself (and wheelChannel on d9425f091). ENG-JETTY's line ran 225 tests; it is 345 now. The lead's list of inherited reds
  should carry all 11 (D126).

### Suggestions (outside this packet: the Lane 2 job, ready to dispatch)
- **ENG-XPICK (R-165.414 part 2):** move walkedSpan.ts:193, storyChecks.ts:71 (teachOrder), stillLay.ts:277 and levelCheck.ts:1137
  onto alongOf / firstMet / inMetOrder, and check whether jumpTrails.ts:43 runs on gen2 stages. Each gets an out-and-back toy case
  (toyHome HOME_CODE), RED on x first. Files: those four, their tests. Done: each toy RED then GREEN; lockall unchanged; the sweep
  table above re-run with those rows gone.
- **The gate (D130's countermeasure):** grow xpickSweep.mjs into tools/engine/xpickcheck.mjs, with a known list that only shrinks
  (the non-safe rows above). It fails on a NEW sort-by-x pick in engine rule code. Add it to gates.yml beside generalitycheck.

### Unresolved
- The river-first question above (no code change made for it).
- A leftward water line has no `passX`: the engine takes a line down once he is grounded at x >= passX (engine.ts passTips), a
  rightward rule, so a line said running left stays its full time (TIP_SAY_S) instead of going once he is over the river. Small;
  making passTips two-way is an engine change for the Lane 2 job.
- tipReach (pipeline.ts, read by tools and tests) models a tip as said "at the first step past its x"; it does not read beforeX, so its
  'early' figure for a leftward water line is not exact. No gate reads it for water lines that I found; not changed.

### Method update
- level.md / engine-core: "first" and "last" on any stage mean firstMet / lastMet (gen2/tower.ts). A rule that sorts by x and takes [0]
  or the end is the D130 trap. The test for such a rule includes the out-and-back toy.
- dispatch-packet.md D118 held again: the base's CI tool line, re-run here on the base itself, named 6 reds the last landing's report did not (above). A base count carried from an older run under-counts once the
  line grows: the report gives the line's test count with its reds.

### Lessons applied
D130 (this job: one helper, the sweep, an out-and-back toy per rule), D115 (each proof on its own chattr-frozen tree: plant, the
old fill, the fix, the base; node_modules linked first), D118 (the base's CI tool line re-run on e2f3855cf itself), D122/D123 (7200000 ms,
at most two heavy runs at a time), D126 (the CI tool line with the suite), D113 (no foreground wait; no shell '&'), D119 (no heredoc
in a commit chain), D80/D101 (measured against the old pick on every listed stage it could touch), D43 (no stage id, seed or x:
generalitycheck PASS), D109 (no clock times in messages).

### Own miss
None found. My working runs of the new test (before the proofs) ran in the edit tree with nothing editing it; every RED/GREEN
proof and every gate ran on a frozen tree.

### Learned (for the next engine member)
- A drop's height is `lipY`. A judged stage's built stage is `built` (judged11 sets it; promises11 reads it). So a verdict that needs
  the laid stage can take it without a type change.
- On the out-and-back toy, x and the route disagree on every roll (the way home's last river has the least x), so it is the ready RED
  for any "first/last" rule.

## ENG-HUD27 (first session): the HUD bar along the route's legs + a 'post:letter' moment

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
