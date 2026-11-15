# METER-COVERAGE: can the meter measure every mechanic the game map plans? (METER-2 step 0, R-165.272; written 11:03 AM ET 11-15)

**The most important finding: the meter never refuses a piece it doesn't know; it guesses.** METER-1's score.ts:638-639 (t-meter-1
cfa9019a) prices every hazard beat it has no rule for at a flat 2 bits, because the timing note it looks for is written by no beat, so
every timed piece in Worlds 2-10 (and 1-4's boughs today) already gets a number and nothing complains. §3's gate turns that default
into a failure.

Matt, 11-15 12:17 AM ET: "we're not at a point where we're like, oh, we don't know how to measure this because we don't have a bot."
12:18 AM: "we don't know what we don't know... but we know the pieces, so we should be able to factor that in."
No game code. Base: t-meter-2 from 798be7be. Sources read: GAME-MAP (origin/t-design-game-map 6909c3c9) §3, §4, §10 B/C;
DIFFICULTY-MODEL.md (origin/t-diff-research b8705922); DIFFICULTY-SYNTHESIS.md (origin/t-diff-synth 0e6d1ba3);
MATT-RANKING-2026-11-14.md (this branch); METER-1's meter (origin/t-meter-1 cfa9019a: tools/difficulty/score.ts, DIFFICULTY.md §1);
the bots on this branch (tools/inspect/firsttimer.ts, tierBots.ts, castBots.ts; R-165.59 BOTS.md); the testers' profiles
(tools/playtesters/profiles/). Every "bot plays it" and "meter prices it" below is a file:line I opened; "none" means I grepped the
file for the piece's words and found no handling (the words tried are named where it matters).

## 0. The answer in plain words

- **FIRST: the meter has a silent default, so a new piece is never refused, only guessed.** It prices World 1's pieces and gives everything else a flat guess. METER-1's score.ts prices jumps (moveOf :531-544),
  creatures (:620-633), lianas (swingChallenges :304), the vine snake (:373), the chase (:419), rolling nuts (:446) and the watched
  stretch (:473). Every other hazard beat ('Z' in beats.ts) reaches score.ts:638-639, which looks for a "safe Xs of Ys" note that **no
  beat in beats.ts:128-314 writes**, so it scores a flat **2 bits** whatever the piece is: a gust, a spore puff, a rock, the dark, a
  river, a web, a crumbling branch. Every 'V' beat that isn't a liana (rope, basket lift, warm air) scores as a **0.25-bit climb**
  (:640-643). A hop onto a moving log is priced as a jump onto still ground (moveOf has no timing term; beats.ts:116 calls it
  'timedHop'). Nothing fails when a new piece arrives: it is silently priced as "2".
- **The bots play World 1's pieces and almost nothing after it.** The tier bots (child / middle / expert, tierBots.ts:19-23) are the
  first-timer class with tester numbers (firsttimer.ts:184-207). Its behaviour code knows: run and jump, the double (only after a single
  failed, :1100), punch (:1738), drop traps (:1764), climb (:1459, :1634), rope (:1496-1503), the liana release (:1483-1492), hiding from
  the eagle (:1384-1399), a still spot (:1402-1409), glide once told (:1454, :1515), hopping a foe (:1734) and waiting at an edge for a
  drifting log or moving platform (:1679-1688). It reads **no stage clock**: grepping firsttimer.ts for brick, clock, zone, wind, spore,
  tide, swim, noise, dark, chase, lane finds only its own Dot-queue clock (:397-465) and a rock's blame after a hit (:1080). So every
  piece on a beat (sinking pads, snap-jaws, spores, gusts, rocks, crust, lightning, falling tiles) is walked through blind: the bot
  neither waits for the safe beat nor fails the way a person does.
- **Tester data covers one stage.** The tier profiles are the gen2 1-1 runs of 10 players (P24-P33; profiles/README.md:16-20): jump
  holds, press-to-lip, late presses, the double's second press, standing, steering, punches and misreads. Climbing has an all-stages
  touch figure (steeringAllStages.climbMs). Matt's play adds World 1 rankings (1-1 to 1-5, 1-7). Everything else: no data.
- **What that means for World 2.** 2-1 (river rides) and 2-2 (sinking pads) are the first stages where most of the difficulty is a
  clock. Today the meter would call both "a few 2-bit hazards plus jumps" and the bots would ride/stand without reading the beat. The
  fix is small and general because the engine already has the base: beatBrick.ts (a brick names a ClockDef with warn/on; :1-39) and
  ride.ts (rideAt on a ClockRead; :45). Price the clock from the ClockDef, teach the bot to read the clock, and make the meter refuse
  an unpriced piece (§3). That is METER-2a's World 2 slice (§4), about 7.5-11 h.

## 1. The channels (how a piece is priced) and the codes used in the table

Each channel is a term of DIFFICULTY-MODEL §1 / SYNTHESIS §2; nothing here is new maths, it is which term owns which piece.
| Code | Channel | What decides failure | Model term | Tier numbers it needs |
|---|---|---|---|---|
| SP | **self-paced** | margin of the move against the tier's spread; he picks the moment | p_prec (margin m vs s_x) | aimQ, holdQ, lateQ (have, 1-1) |
| RW | **reactive window (wait-and-go)** | a clock he watches and may wait out; failure is misjudging the opening; waiting costs only seconds | p_read on the cue + p_time with a self-chosen cycle | reaction RT, a "go" share (how often he goes on a bad gap: none measured) |
| FB | **forced beat** | the press must land in a window he cannot skip or wait out (he is standing on it, riding it, or carried into it) | p_time with W from the engine, unpressured -> pressured form | lateQ, dbl2Q (have); stakes-widened spread (Matt 12:00 AM) |
| WR | **watcher race (stop-signal)** | he must stop (or hold) before a look lands; the go must be cancelled | p_hold = 1 - exp(-lambda L) and S_watch (SSRT race) | slip rate lambda while told to wait: **not measured for any tier** (MODEL §1) |
| PC | **pursuer / chase** | his speed and stalls against a front behind or below him | fittsBits(front / run) once a stretch, x1.5 on every move inside (METER-1) | stall share (standQ, have), stop-on-stress (none) |
| EC | **endurance / count** | a budget spent over a stretch: a meter (stillness, heat, light), a clock, followers, breath | P_k = prod(1 - q) over the stretch; slack = budget / need | none |
| + RD | **reading** (on top of any channel) | seeing it in time in THAT orientation: dark, mist, off-screen, fake-outs | T_av vs RT (MODEL §1 reading, G5) | RT by tier (literature only) |
| + MR | **misread** (on top of any channel) | the likely WRONG input a newcomer tries (Matt's 1-2: steering mid-air on the bounce chain) | a misread tier's input, scored as its own route | none (R-165.269) |

"Reactive" (R) means he can wait and choose his moment; "forced" (F) means the moment is chosen for him. A frog-style crossing is two
rows (#18, #19): standing at a lane edge and picking a gap is RW; riding through lanes with no standing still is FB.

## 2. The coverage table: one row per mechanic on the map, all ten worlds

Bots: "tier" = the tier bots (firsttimer.ts class with FT_CHILD/MIDDLE/EXPERT, tierBots.ts:19-23; the KID/ADULT first-timers share the
same code). Meter = METER-1 score.ts at cfa9019a. Data: "1-1" = the testers' gen2 1-1 profiles; "Matt W1" = MATT-RANKING. Hours for
a channel are a range with no direct history (the nearest measured job: METER-1's view-rule packet, 1 h 35 m, LESSONS D78; the model's
own METER-2a+b estimate, 7-8 h, MODEL §5). Engine hours are GAME-MAP §10's, quoted, not mine. "Ready by" = the first stage that needs
the row whole (bot + channel), so that stage is built measured, not blind.

| # | Mechanic | First | Bots that play it today | Meter today | Channel | R/F | Tester data | GAP | Fix | h | Ready by |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | run, jump (gaps, steps) | 1-1 | tier: edge jump firsttimer.ts:1676-1690, press :1968 | moveOf :531-544 (bits of margin) | SP | R | 1-1 (holdQ, aimQ, lateQ) | none | (re-measure each play window) | 0 | done |
| 2 | double jump (second press) | 1-1 | tier: only where a single failed :1100; 2nd press :1446 (dbl2Q) | +1.32 bits flat (OTHER_BITS.second :95) | FB (the 2nd press is in the 1st jump's rise) | F | 1-1 secondPressDelayMs | channel is a constant, not fitted to failures; no posture spread (thumb / index / finger-on-Pokey, Matt 12:00 AM) | fit p_time of the 2nd press to 1-1 put-backs per double; posture tiers as spreads (R-165.270) | 1-2 | 1-1 re-score (now) |
| 3 | bounce (mushroom) | 1-1 | tier: hops back onto a mushroom (:729-734), never aims a landing at one (:1176-1177), runs a chain straight | moveOf bouncy :536-539, reach rows :44-45 | SP | R | 1-1 | **MR**: the bot never steers mid-air, Matt's family player did (1-2 ranked 3rd vs meter 5th) | misread tier: a first-timer that steers in the air on a bounce; scored as its own route (R-165.269) | 2-3 | 1-2 (now) |
| 4 | creature in reach (snake, boa, frogs) | 1-3 | tier: hop :1734 (hopFoe), punch :1738 | creatureBits(tell) :620-633 | RW (a tell, then act) | R | none (the 1-1 profiles hold punches and misread punches, not reactions to a tell) | data | first window with foes; until then literature RT | 0 bot / 0 ch | done (data at next window) |
| 5 | punch | 1-3 | tier :1738 (once taught) | inside the creature row | SP | R | 1-1 punchesPerMinute, misread share | none | - | 0 | done |
| 6 | drop traps (shake vine, cut tendril, knock stone; 1-3's lure, 3-3, 2-5, 7-5, 9-6) | 1-3 | tier :1764 (once taught) | trapped = choice 0.5 :620-633 | SP (choice) + RW (drop timing when the foe walks) | R | none | channel for a MOVING target under the drop (3-3's prowler, 2-5's snapper) is not priced; only "trapped or not" | windowBits on the foe's pass under the load (its walk speed / load width) | 1-2 | 2-5 |
| 7 | rope shimmy | 1-3 | tier :1496-1503 | 'V' -> 0.25-bit climb :640-643 | SP | R | none | priced as a climb (fine while ropes are safe); a rope over a pit with a let-go at its end is a release | price the end let-go as a jump from the rope (moveOf from its end) | 0.5-1 | 3-2 |
| 8 | climb trunk / vine | 1-4 | tier :1459, :1634 | 0.25 bits (OTHER_BITS.climb :95) | SP | R | steeringAllStages.climbMs (all stages) | none for plain climbs | - | 0 | done |
| 9 | rotting boughs / crumble (1-4, 7-1, 7-2 snapping vines, 9-3 smoulder, 9-7 crust) | 1-4 | tier: **none** (0 hits for crumbl/fragile in firsttimer.ts) | 'Z' crumbling branch beats.ts:128, crumble zone :298 -> **flat 2** (score.ts:639) | FB (a dwell deadline his own landing starts) | F | Matt W1 (1-4 hardest) | **no bot behaviour** (never waits on a bough), **no channel** | dwell channel from the piece's own time (regrow.ts / beatBrick ClockDef); bot leaves before 'gone' with its lateQ/standQ | 2-3 | 1-4 re-score; 2-2 |
| 10 | liana swing: catch off a bank | 1-6 | tier: jumps the edge (:1676-1690) | catch share (METER-1, DIFFICULTY.md §1) | RW (the liana comes back) | R | none | data; "wonky" feel (R-165.271) is not difficulty | first window on 1-6 | 0 | done |
| 11 | liana swing: release / chains | 1-6 | tier :1483-1492 (lets go when a > 0.4 forward) | swingChallenges :304 (engine-flown window) | single: RW (he can swing again); a chain with no ground (8-5): FB | R / F | none | the bot always waits for a good swing (no early panic release); chains: pressured form not used | bot: tier spread on the release angle (a lateQ draw); FB pricing for chains | 1-2 | 1-6 data; 8-3 |
| 12 | vine snake / false liana | 1-6 | tier: rides it (no snake-specific code) | snakeChallenges :373 | RW | R | none | bot does not react to the warn | bot leaves on the warn after its heed | 1 | 1-6 |
| 13 | hide in a bush (the eagle) | 1-7 | tier :1384-1399 (once taught, heed late) | watchChallenges :473 | WR | R | none | **PARTIAL channel**: watchChallenges reads only cover distance, the hero's calm-in, warn and cool (score.ts:476, :497-500); it ignores the stage's calm bands and the glance rhythm (uneven re-checks, fake-outs; ENG-WATCH2 measured, lead 11:12 AM). **lambda** (moving while told to wait) unmeasured (R-165.268) | price the stop-signal race on the glance's away / look / fake dials and the calm bands; slip lambda swept 0.02-0.2/s (MODEL §5 METER-2b); a hold-still moment logged at the next window | 3-4 (MODEL §5) | 1-7 re-score (now) |
| 14 | quiet feet / noise (1-7, 3-5 wakes thorn vines, sleepers 3-2) | 1-7 / 3-5 | tier: **none** (noise only in the header comment :67) | **none** | SP (choose a soft landing) + WR (a woken sleeper) | R | none | no bot, no channel | bot: a tier share of loud landings (drop height > NOISE threshold, noise.ts:16); channel: p(loud) x what waking costs | 2-3 | 1-7 if it uses noise, else 3-2 |
| 15 | eagle's shadow / gaze sweep (1-7, 4-5, 9-4 that remembers) | 1-7 | tier: hides on phase warn/pass :1389 | watched stretch :473 (PARTIAL, as #13) | WR + RW (move when it passes) | R | none | a sweep you must MOVE under (4-5) is a go-signal, not only a stop | RW on the sweep's pass window from watcher.ts shadowX | 1-2 | 4-5 |
| 16 | collapse chase (1-8, 7-6 left) | 1-8 | tier: runs the route; no chase code (only the danger flag :464) | chaseChallenges :419 | PC | F | none | bot never panics (no stress widening) | stakes-widened spread under a chase (Matt 12:00 AM) | 1 | 7-6 |
| 17 | rolling nuts / fruit | 1-8 | tier: hop a foe :1734 | rollingChallenges :446 | RW | R | none | none for the meter | - | 0 | done |
| 18 | **frog crossing, wait-and-go** (lanes of crossers on a branch; animals crossing; 2-9 log lanes from a bank) | 1-8 (Q1) / 2-9 | tier: waits at an edge only for floats near the edge (:1679-1688), not for gaps in a lane | **none** (no lane beat in beats.ts) | RW | R | none | **no bot that picks a gap, no channel** | bot: stand, watch the lane, go when the gap >= its need (tier RT + a "go on a bad gap" share); channel: p(go on a gap shorter than run time + RT spread), Hick on lanes | 4-6 | 2-9 (1-8 is the chase) |
| 19 | **frog crossing, forced beat** (riding a log through lanes; guards on rafts; crossing while carried) | 2-9 | tier: none | none | FB | F | none | no bot, no channel | the ride channel (#20) x the lane window: joint window, not a sum (§2b) | 2-3 | 2-9 |
| 20 | ride things that move (drifting logs 2-1, step off before the reeds) | 2-1 | tier: waits for a float and rides to the next (:1679-1690) | hop priced as a still jump (moveOf has no timing; beats.ts:116 'timedHop') | board: RW; step-off before it goes under: FB | R / F | none | **no channel for the board window or the step-off deadline**; bot never misses a step-off | ride channel from ride.ts rideAt + its ClockRead: board window, dwell to the reeds; bot step-off with lateQ | 2-3 | **2-1** |
| 21 | sinking pads (stand too long) | 2-2 | tier: none (no clock read) | none (a 'gone' brick has no beat yet) | FB (dwell deadline) | F | none | **no bot, no channel** (and a newcomer stops to pick petals: MR) | dwell channel from beatBrick ClockDef ('gone'); bot standQ on a pad; misread: stops to collect | 1-2 on #9's channel | **2-2** |
| 22 | followers come home (2-3, 2-8, 4-8, 5-5) | 2-3 | none (no engine yet: B6) | none | EC (a fall makes them wait at the flag) | - | none | piece not built | priced as stakes: a fall costs the walk back with them (t_back); bot follows its route | 1 (with B6) | 2-3 |
| 23 | swing onto a moving log | 2-4 | tier: release logic only (:1483) | swing window only | FB (two clocks) | F | none | pair, see §2b | joint window of the release and the log | 1 | 2-4 |
| 24 | snap-jaw stones on a beat (2-5), beat bricks 'bites' | 2-5 | none | none | RW (start) + FB (dwell) | R / F | none | no bot, no channel | beatBrick 'bites' on the dwell channel | 0.5 on #21 | 2-5 |
| 25 | lifts up and down (2-6) | 2-6 | partly: the float-wait (:1679-1688) only sees a 'moving' platform within 70 px of his height, so not a lift coming down | 'V' basket lift -> 0.25 climb (:640-643) | RW | R | none | mispriced as a climb | ride channel (#20) on upDown paths | 0.5 on #20 | 2-6 |
| 26 | run LEFT (2-7, 5-6, 7-6, 10-5, 10-6) | 2-7 | tier follows the route's way (header :8) | as any stage | (no new channel) | - | none | thumb posture for left is untested | posture tier note only | 0 | 2-7 |
| 27 | rising water / lava (2-8, 6-8, 9-2) | 2-8 | none (no tide/rising code in firsttimer.ts) | none (chaseChallenges reads chase.ts only) | PC (a front from below) | F | none | no bot awareness, no channel | chase channel generalised to a vertical front (risingTide.ts speed vs his climb) | 1-2 | 2-8 |
| 28 | the dark, light from sources (3-1, 6-6, 8-1) | 3-1 | tier sees everything (no view limit) | 'Z' darkness beats.ts:296 -> **flat 2** | + RD | R | none | bot is all-seeing; meter flat | bot: sight radius from the light; reading term T_av inside the lit circle, both orientations | 2-3 | 3-1 |
| 29 | hang under (roots, netting) | 3-2 | rope code (:1496) is the nearest; hang-under not built (B12) | 'V' -> 0.25 | SP (+ EC if grip ever runs out) | R | none | piece not built | with B12 | 1 | 3-2 |
| 30 | spores / puffs / steam on a beat (3-4, teapots) | 3-4 | none | 'Z' spore cloud :302, teapot :260 -> **flat 2** | RW | R | none | no bot wait, no channel | zone clock (zones.ts zoneEffect) on the RW channel; bot waits for the off beat | 1 on #18's RW | 3-4 |
| 31 | carried light / the jar / one meter (3-6, 8-4, 8-7, heat 9-1) | 3-6 | none (8-4 has its own runner, w8LanternRun.ts, not tiered; not opened) | none | EC | - | none | no channel for a draining budget | slack = budget / time needed on the tier's pace (finishSeconds spread) | 1-2 | 3-6 |
| 32 | search (which fern, relics, the temple machine 7-3) | 3-7 | put past puzzles (header :15-16) | puzzle 0.5 (:644-645) | SP (no failure; time only) | R | none | none: a search costs time, not failure | - | 0 | done |
| 33 | thorn vine pulse, swing on the quiet beat | 3-8 | none | 'Z' sleeping thorn vine :241 -> flat 2 | FB (pair: swing x beat) | F | none | pair | joint window (§2b) | 1 | 3-8 |
| 34 | leaf glide (hold to float) | 4-1 | tier glides once told (:1454, :1515) | 'J' leaf glide beats.ts:117; moveOf has **no glide reach** (REACH :42-45) | SP | R | none | glide priced as a jump or 'beyond' | glide reach rows flown (specs/reach.md) | 1 | 4-2 |
| 35 | wind gusts | 4-2 | none | 'Z' wind gust :302 -> **flat 2** | RW (wait for calm) / FB mid-glide | R / F | none | no bot, no channel | gust clock on RW; mid-glide: drift added to the landing spread | 2 | 4-2 |
| 36 | falling rocks on a beat | 4-3 | blame only (:1080) | 'Z' falling rock :233 -> **flat 2** | RW (read the shadow) | R | none | no bot wait, no channel | rockfall.ts beat on RW + RD (the shadow's lead time) | 1 | 4-3 |
| 37 | mist hides ledges | 4-6 | tier sees everything | none | + RD | R | none | bot all-seeing | sight distance on the reading term | 1 on #28 | 4-6 |
| 38 | updrafts / vents (warm air) | 4-8 / 9-5 | none | 'V' ride the warm air beats.ts:123 -> 0.25 climb | SP | R | none | mispriced as a climb | glide channel with the lift (glide.ts) | 1 on #34 | 4-8 |
| 39 | don't stop (stillness, drowsy) | 5-1 | none; tier stands often (standShare 0.52 middle) | 'Z' silk sheet: do not stop :312 -> flat 2 (score.ts:639) | EC (inverse watcher: a stop budget) | - | 1-1 standShare / standQ | no channel; the bot would trip it, which is right | stop budget vs the tier's stand durations (standQ have) | 1 | 5-1 |
| 40 | the clock (closing orchids, goal clock) | 5-3 | none | none | EC | - | 1-1 finishSeconds | no channel | slack = clock / the tier's time for the stretch | 1 | 5-3 |
| 41 | sticky webs (slow) | 5-4 | none | 'Z' web :297 -> flat 2 | SP (reach shrinks) | R | none | priced as a 2-bit hazard, it is a smaller reach | moveOf with web-scaled reach | 0.5 | 5-4 |
| 42 | the vine leash (tie-off posts) | 5-5 | none (B7 not built) | none | SP (reach changes) + EC | R | none | piece not built | reach rows re-flown with the leash (ADR-003 decision 5) | 1 (with B7) | 5-5 |
| 43 | humming silk (don't touch) | 5-7 | none | 'Z' humming thread :269 -> flat 2 | SP (clearance margin) + WR (spiders wake) | R | none | margin not priced | margin of the jump over the thread on p_prec | 0.5 | 5-7 |
| 44 | the tide (reach changes on the beat; comes in behind) | 6-3 | none | none (tide zone kind exists, zones.ts:22) | RW (6-3) / PC (6-4) | R / F | none | no bot, no channel | RW on the tide clock; PC as #27 | 1 on #27/#30 | 6-3 |
| 45 | something under flat water (ripples) | 6-2 | none | 'Z' river crossing :310 -> flat 2 | RW + RD | R | none | no bot, no channel | RW on its pass; RD on ripple lead | 1 | 6-2 |
| 46 | food chain (lure hunters to the caiman / owl) | 6-5 | none (B19 not built) | none | SP (choice) + RW | R | none | piece not built | as #6 with a lure | 1 (with B19) | 6-5 |
| 47 | swim and dive | 6-7 | **none** (0 hits for swim in firsttimer.ts; w6Swim.test.ts is scripted) | none | SP (+ EC if breath) | R | none | no bot, no channel | bot: swim steer on the route; channel: margins in water physics (swim.ts speeds) | 2-4 | 6-7 |
| 48 | falling floors (stand still and the tile drops) | 7-1 | none | crumble -> flat 2 | FB (dwell) | F | none | as #9 | #9's dwell channel | 0 on #9 | 7-1 |
| 49 | timed stone doors | 7-7 | none | none | RW (or FB when a door is far) | R / F | none | no channel | slack = door open time / the tier's run time + RT | 1 | 7-7 |
| 50 | push blocks, break stone, break the ceiling | 7-5 | punch :1738; push: none | puzzle / creature rows | SP | R | none | none (time, not failure) | - | 0 | done |
| 51 | the slide (7-4 set piece) | 7-4 | not opened (w7SlideRun.ts) | not opened | FB | F | none | UNCHECKED: I did not open the slide's runner | open w7SlideRun.ts in METER-2a | 0.5 | 7-4 |
| 52 | lit-only things on a beat (night blooms, moonlit branches) | 8-2 | none | none | FB (the branch fades under you) + RD | F | none | no bot, no channel | beatBrick 'gone' on #21's channel | 0 on #21 | 8-2 |
| 53 | swing and fling (let go at the top to fly far) | 8-3 | release code (:1483) | swing window | FB | F | none | fling reach not flown | fling arcs flown (B13) on the swing channel | 1 | 8-3 |
| 54 | heat (hot rock, shade) | 9-1 | none | none | EC | - | none | as #31 | #31 | 0 on #31 | 9-1 |
| 55 | geysers on a beat | 9-6 | none | geyser zone (zones.ts:22) -> flat 2 | RW | R | none | as #30 | #30 | 0 on #30 | 9-6 |
| 56 | lightning (rods charge, then strike) | 10-2 | none | bolt zone -> flat 2 | RW + RD (the charge tell) | R | none | as #30 | #30 | 0 on #30 | 10-2 |
| 57 | hold on (freeze on the flash) | 10-3 | none (hold not decided, R-165.81) | none | WR (stop on a signal) | R | none | no bot, no channel; hold undecided | WR channel with a flash cue (SSRT race) | 1 on #13 | 10-3 |
| 58 | bosses (ten guardians) | 1-B | bossBot.ts (one scripted bot, reaction-delayed; not tiered) | not scored by the stage meter | per attack: RW / FB | R / F | none | **no tiers** (one bot), no meter | bossBot with the tier spreads (holdQ, lateQ, RT) and a per-attack window table | 3-5 | World 2 boss (Crocus Rex) |
| 59 | two roads (over / under; forks) | 1-5 | the route bot takes one route (route.ts) | the route scored | (route choice) | - | Matt W1 (1-5 2nd hardest) | which road a tier takes is not chosen by loss | least-expected-loss road per tier (SYNTHESIS §2 step 1) | 1 | 1-5 re-score |
| 60 | **cross-cutting: input posture** (thumb / index / two hands / finger on Pokey) | all | one spread per tier | - | widens SP/FB spreads | - | 1-1 touch (landscape/portrait, touchPlacedShare) | no posture split | posture spreads from touch lines; UX reach check (R-165.270) | 1-2 | World 2 |
| 61 | **cross-cutting: stress widens timing** (a death pit, a chase, a watcher) | all | none | stakes x1.0-2.0 multiplies points, not the spread | widens FB/RW | - | none | stakes add setback but don't widen the spread | s' = s(1 + kappa_stakes) fitted on Matt's first World 2 ranking | 1 | World 2 |

Not rows: optional risk (golden finds, reward ledges, the zipline hidden stage) is never in the number (MODEL §1 scope). C-list pieces
(GAME-MAP §10 C1-C9) take the B row they fold into (C1 the boa -> #6 + #46; C4 auto-scroll -> #27; C5 rising ride -> #38).

**Counts (59 mechanics + 2 cross-cutting rows):** a bot that plays it AND a channel that prices it today: 19 (#1-8, 10-13, 15-17,
26, 32, 50, 59; most still carry a named gap). No bot behaviour for it: 31 (#9, 14, 18, 19, 21, 22, 24, 27, 29-31, 33, 35, 36, 39-49,
51, 52, 54-57). No real channel (none, the flat 2, the 0.25 climb, a jump with no timing, or not opened): 38 (#9, 14, 18-22, 24, 25,
27-31, 33-49, 51, 52, 54-58). Tester data beyond 1-1 and Matt's World 1 ranking: none.

### 2a. Sizing the bot fixes: a new SKILL, a new TIER, or a number (the lead's ask, 11:06 AM)

- **SKILL** = new behaviour code in firsttimer.ts that every tier then uses with its own numbers (e.g. read a stage clock).
- **TIER** = a new kind of player: different inputs, not only different spreads (e.g. the misread first-timer).
- **PARAM** = a new number on the existing tiers, measured or swept, no new code path (e.g. the slip rate lambda).
- **ENGINE FIRST** = the piece isn't built; its bot skill comes in the same engine packet (level.md / D75: proven on a real stage row).

**One SKILL covers 14 of the 31 no-bot rows and the 2 partial ones (#20, #25): "read a stage clock"** (wait at the edge for the safe beat, leave before the unsafe one,
with the tier's own RT, lateQ and standQ). It generalises the float-wait at firsttimer.ts:1679-1688 to any ClockRead / beatBrick /
zone clock. Rows: #9, 20, 21, 24, 25, 30, 33, 35, 36, 44, 45, 48, 49, 52, 55, 56.

| Row(s) | Fix kind | What exactly |
|---|---|---|
| #9, 48 (crumble, falling floors), #21, 24, 52 (pads, snap-jaws, lit-only) | SKILL (clock read: dwell) | leave before 'gone' / 'bites'; PARAM: none new (standQ, lateQ exist) |
| #20, 25 (rides, lifts) | SKILL (clock read: board + step-off) | the float-wait made vertical and given a step-off deadline |
| #30, 35, 36, 44, 45, 49, 55, 56 (spores, gusts, rocks, tide, ripples, doors, geysers, bolts) | SKILL (clock read: wait-and-go) | one RW skill on the zone clock (zones.ts zoneEffect) |
| #33 (swing on the thorn's quiet beat) | SKILL (clock read inside the swing) | release only on an open beat |
| #18, 19 (frog crossings) | SKILL (lane watch) + PARAM | pick a gap in a lane; PARAM "goes on a gap too short" share and RT per tier (no data: swept) |
| #14 (quiet feet / noise) | SKILL + PARAM | choose a short drop over a tall one when taught; PARAM loud-landing share per tier |
| #43 (humming silk) | SKILL | aim the jump over the thread with clearance |
| #47 (swim) | SKILL (largest: 2-4 h) | steer the route in water (swim.ts speeds) |
| #31, 54 (light jar, heat) | SKILL | detour to refill / shade when the meter runs low |
| #22, 29, 42, 46 (followers, hang under, leash, food chain) | ENGINE FIRST + SKILL | comes with B6 / B12 / B7 / B19 |
| #57 (hold on) | ENGINE FIRST + SKILL + PARAM | stop on the flash; PARAM stop-signal time by tier (SSRT, literature until measured) |
| #27, 39, 40, 41 (rising water, don't stop, the clock, webs) | none (the route at the tier's own pace already plays them) | the channel is the gap, not the bot; PARAM for #27: stalls under a front |
| #51 (the slide) | UNCHECKED | open w7SlideRun.ts first |
| #3, 21 (bounce chain steered mid-air; stopping on a pad for a petal) | **TIER: the misread first-timer** (R-165.269) | one tier with a per-piece list of the likely wrong input; scored as its own route, beside the middle tier |
| #60 (thumb / index / finger on Pokey) | TIER (posture variants) or PARAM | if the touch lines split by posture, spreads per posture (PARAM); a finger-on-Pokey runner that loses reach at the screen edge is a TIER (R-165.270) |
| #58 (bosses) | TIER (bossBot gets the tier spreads) | bossBot.ts is one scripted player; give it child/middle/expert holdQ, lateQ, RT |
| #13 (holding still under watch), #61 (stress), #2 (double) | PARAM | lambda swept 0.02-0.2/s (MODEL §5); kappa_stakes; the double's 2nd-press window fitted to 1-1 put-backs |

### 2b. Combinations: which pairs the map puts together, and how a pair is priced (not the sum)

The map ramps World 1-3 one thing, 4-6 pairs, 7-9 triples, 10 everything (GAME-MAP §3 "How it ramps"). The pairs it names:
| Pair (stage) | Kind | How priced |
|---|---|---|
| swing onto a moving log (2-4); swing on the thorn's quiet beat (3-8); swing over the tide (6-3) | two clocks | **joint window**: the release window intersected with the target's open window. For two clocks with open shares f1, f2 and unrelated periods the joint open share is about f1 x f2, and the WAIT for a joint window grows as 1/(f1 f2) swings: a sum of two 2-bit terms says 4 bits; the joint form says log2(1/(f1 f2)) plus the wait's cost. The bot plays the real phases. |
| ride a log through lanes (2-9); guards on rafts | ride x lanes | joint window as above (FB on the ride, RW on the lane, but the ride removes the waiting, so the RW becomes FB) |
| glide in wind (4-2); swing in wind (4-4); glide in the dark (8-6) | a move x a push / a view limit | **spread widening**: the gust's drift adds to the landing spread (s'^2 = s^2 + drift^2); the dark shortens T_av on the reading term |
| keep moving AND stay hidden (5-2); the gaze that remembers (9-4) | stop budget x stop-signal | **conflict**: the two channels ask opposite things; priced as the joint chance that a cover exists inside the stop budget's reach (the bot's run to cover under the drowsy clock) |
| chase LEFT (5-6, 7-6); chase over falling floors (7-6) | chase x dwell | the chase removes the choice of when to land: each dwell becomes FB, x1.5 inside the stretch (METER-1's chase rule) |
| dark + hang + quiet + prowlers (3-9); clock + silk + leash (5-9); swim + swing + tide + hunters (6-9); floors + doors + sentries (7-9); dark + fling + lit-only (8-9); heat + lava + vents (9-9); vents + hold + fling (10-8) | triples | pressure: k live demands within 1.5 s widen every spread, s' = s(1 + kappa k) (MODEL §1); the freeze-where-you-needed-a-run-up interaction only the bot sees (SYNTHESIS §3), so the bot number stands where it and the formula disagree |

**Checking a pair against Matt the first time it ships** (the method MATT-RANKING used, blind): before Matt plays the first stage with a
pair (2-4 is the first), the meter writes its per-beat prediction for that pair (p per tier, both orientations, with its interval)
and the stage's rank among the stages he has played, into the stage's report, committed BEFORE he plays. Matt rates it ("harder or
easier than its parts"; its place in his ranking). kappa and the joint-window form are fitted on that first pair; a miss outside the
interval is a defect with a root cause (LAWS 22), never a quiet refit to clear it. The second pair stage is the test of the fit.

## 3. The gate: no piece without a bot that plays it and a channel that prices it

**Pushback on the packet's wording:** "fails on any piece with no bot AND no channel" lets through a piece with only one of the two.
A piece priced by a formula with no bot can't be validated (MODEL §1: "where the bot and these channels disagree, the measured bot
number stands"), and a bot with no channel can't predict before play. The gate below fails on EITHER missing, for every piece a built
stage uses.

- **File:** tools/difficulty/coveragecheck.ts (seconds; read-only), with its own test coveragecheck.test.ts; added to gates.yml and
  to src/game/ciTests (so CI runs it) and to reference/methods/gates.md.
- **What it reads (the piece vocabulary, from the code, never a hand list):** the zone kinds (zones.ts:22 ZoneKind), the platform
  types (types.ts:292), the beat-brick kinds (beatBrick.ts:12 BrickOn), the creature and cast kinds (types.ts enemy types; castPlay.types.ts),
  the ride paths (ride.ts), the stage-kit modes and set pieces (stageKit.types.ts), the skills (skills.ts), and the beat families
  beats.ts emits (to make that readable, beats.ts exports its family keys: the off() names it already uses, :94-95).
- **The coverage table it checks against:** reference/design/meter-coverage.json, one entry per piece id: { bot: "file#symbol" | null,
  channel: "file#function" | null, rows: [this file's # ids] }. The gate resolves each symbol (it must exist in the named file).
- **It fails when:** (a) a piece in the vocabulary has no entry; (b) a piece that any built stage uses (the stage table, laid the way
  addlevel lays it) has bot or channel null and is not on the known list; (c) score.ts reaches a default (the flat 2 at :638-639, the
  0.25 'V' at :640-643, a 'timedHop' with no timing term) on any built stage: METER-2a turns those defaults into a thrown "unpriced
  piece <family>" so the fallback can't hide a new piece; (d) a known-list entry is now covered (shrink-only, the gate's own half).
- **Known list:** tools/difficulty/coverage.known.json, today's gaps for pieces on BUILT stages only (one id each, each with R-165.272
  and its owner), added to knowncheck.mjs LISTS so it can never grow (LAWS 5's one exception). Pieces not yet on any stage aren't
  listed: they fail the day a stage first uses them, which is the point.
- **Planted (each RED when the old behaviour is put back):** a new ZoneKind in a fixture with no entry; a channel symbol renamed; a
  'Z' beat with no family; a covered piece left on the known list; a known list with an added id (knowncheck).

## 4. Order: what METER-2a must have before World 2 builds, and what can wait

**Before 2-1 and 2-2 are built (METER-2a, World 2 slice; tools only, no game code).** Tags: **[2-1]** blocks the river rides,
**[2-2]** blocks the sinking pads, **[both]**, **[later]** blocks neither.
1. **[both]** The gate (§3) with its known list, so 2-1's first ride can't be priced silently. 2-3 h. First, because every step below
   is checked by it.
2. **[2-1]** The ride channel (#20): the log hop priced as a MOVING jump (the board window from ride.ts rideAt, not moveOf's still-ground
   jump, beats.ts:116 'timedHop') and the step-off deadline before the reeds (FB). Also covers #25 lifts for 2-6. 1-1.5 h.
3. **[2-2]** The dwell channel (#21, #9): the stand deadline from beatBrick's ClockDef ('gone') and the bough's own time. Re-prices 1-4's
   boughs (Matt's hardest) on the way. 1-1.5 h.
4. **[2-1]** Bot SKILL "read a stage clock", board + step-off half: wait at the bank for the log (exists, :1679-1688), step off before it
   goes under with the tier's lateQ. 1-1.5 h.
5. **[2-2]** The same SKILL, dwell half: leave a pad before 'gone' with the tier's standQ / lateQ. 0.5-1 h on step 4.
6. **[2-2]** The misread TIER's first entry: a newcomer stops on a pad to pick a petal (2-2's mission is petals on pads). 1-1.5 h; the
   tier's 1-2 entry (steering mid-air on the bounce) comes with it, which is World 1's open item R-165.269, not a World 2 blocker.
7. **[later]** Re-score 1-1..1-8 with the new channels and prove nothing moved but the pieces that changed (1-4's boughs). 1 h.
8. **[later, World 1 now]** The watcher channel made whole (#13, #15): the stop-signal race priced on the glance's away / look / fake
   dials and the stage's calm bands, not only warn and cool (score.ts:497-500); lambda swept. Needed for 1-7's re-score (R-165.268) and
   4-5, not for 2-1/2-2. 3-4 h (MODEL §5's METER-2b figure).
Total for steps 1-7 about 7.5-11 h (no direct history; the nearest measured jobs are named in §2's header). Built on: castBots / firsttimer / score.ts
as on t-meter-1 (D40: if a planned job this sprint replaces the tier bots' calibration, steps 4-6 wait for it).
**Not blocking the 2-1/2-2 BUILD, blocking their TESTER window:** the recorder lines for rides and pads (a game-code packet, below).

**Before the rest of World 2 (in stage order):** followers (#22) with B6 for 2-3; the joint window (§2b) for 2-4; drop traps on a moving
foe (#6) and bites (#24) for 2-5; lifts (#25) for 2-6; rising water (#27) for 2-8; both frog rows (#18, #19) for 2-9; the boss tiers
(#58) for Crocus Rex.

**Already owed in World 1 (not World 2, but open now):** the hold term lambda (#13, R-165.268) and the misread tier (#3, R-165.269),
both METER-2b in MODEL §5; posture spreads (#60, R-165.270).

**Can wait (by the world that needs it):** the dark and mist (#28, #37) to World 3/4; spores, gusts, rocks, geysers, lightning
(#30, #35, #36, #55, #56) share one RW-on-a-zone-clock channel, built once before 3-4; glide and vents (#34, #38) to World 4; the
budgets (#31, #39, #40, #54) to World 3/5; swim (#47) to 6-7; hold on (#57) to 10-3 once the hold is decided.

**Tester data plan:** the next play window on a World 2 build logs the board, step-off and pad moments (a recorder line per ride and
brick: id, on/off, x, t), so #20 and #21 are fitted to people, not only to the bots. That is a game-code change (playRecorder.ts):
its own packet, before World 2 goes to testers.

## 5. REPORT (METER-2 step 0)

**Done-items:** this file (the table, 61 rows across all ten worlds; the pairs; the gate spec; the order), each claim with its file:line.
**Polish check:** no screen (a design doc); read top to bottom for plain words and one meaning per code.
**Pushback:** the gate must fail on EITHER missing (bot or channel), not only both (§3).
**Method used:** reference/methods/difficulty.md is METER-1's (on t-meter-1, not this branch); this step had no method file of its own.
**Lessons applied:** check the fact in the code (D7, D24: every "plays it" is a line I opened, every "none" a grep with its words);
test the measuring tool before trusting its numbers (D15: the flat 2-bit fallback is exactly that kind of silent number);
estimates from history (D25, ranges where there is none); times pasted from `date` (D20, D30).
**Learned:** the meter's biggest blind spot is not a missing formula, it is a silent default: score.ts:638-639 looks for a timing note
no beat writes, so every timed hazard in Worlds 3-10 already "has a price" (2 bits) and nothing complains. A coverage gate has to
make the default a failure, or the table rots the day it is written.
**Unresolved:** #51 (the slide's runner) not opened; 8-4's lantern runner (#31) not opened; METER-1's beats on later worlds were not
run here (no game code, no runs in this step).
**The lead's 11:06 AM adds:** the silent default at the top (under the title and first in §0); §2a sizes every no-bot row as
SKILL / TIER / PARAM / ENGINE FIRST; §4's steps are tagged [2-1] / [2-2] / [both] / [later]. Pushback accepted by the lead. 11:12 AM: the watcher channel marked PARTIAL (#13, #15) with its fix as §4 step 8.
**Gates (law 5, docs-only branch, run 11:07 AM ET):** tsc PASS (after `npm install --legacy-peer-deps` as gates.yml:28 does; `npm ci` fails
ERESOLVE here), roadmapcheck PASS (needed `git fetch --unshallow`), knowncheck PASS, generalitycheck PASS.
**Turnover note:** reference/handoffs/analyst.md has the METER-2 step 0 section (same commit).
**Suggestion (ready packet):** METER-2a-gate: objective §3's gate; files tools/difficulty/coveragecheck.ts + test,
reference/design/meter-coverage.json, tools/difficulty/coverage.known.json, knowncheck.mjs LISTS, gates.yml; done-items: the five
planted cases red, today's built stages green with the known list, the score.ts defaults turned into a thrown 'unpriced piece'.
**EXACT NEXT STEP:** the lead approves or edits §4's METER-2a list; then METER-2a starts with the gate (§3) and its planted cases,
then the ride and dwell channels, then the bots' clock read, then the World 1 re-score.
