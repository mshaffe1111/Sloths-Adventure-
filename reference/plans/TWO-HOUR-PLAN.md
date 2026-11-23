# TWO-HOUR-PLAN: how every level from here to World 10 becomes a 2-hour job, and stays one (the lead, 11-23; Matt R-165.409)

Matt, 11-23 11:43 AM ET: "I need to understand how you're planning the 2-hour level. Design and how you're starting to get the pieces in
to implement it. And that's big picture ... how to get a 2-hour level in and keep it holding in World 7."

## What a 2-hour level IS (the definition the whole plan serves)
A level job is ONLY: lay the designed node string on the stage's row (gen2), Dot's approved words verbatim, the seed list by the tool, the
bots, the stills and the gates. Everything else is done BEFORE it starts:
- every mechanic it uses is a GREEN engine piece (general gen2 lay, planted toy, proven on two worlds' kits);
- the bots already play every move it needs (a bot SKILL per piece, built with the piece; the bots were the biggest time sink in World 2:
  2-6's 35 sessions were mostly bot fidelity and engine found mid-level);
- its world's kit is on gen2 and its art is in the inventory at Pokey's scale;
- its design names only "Now" pieces (NODE-KEY) and its Normal meter number; its words are approved.
Measured today: 1-7 took ONE builder once its engine was ready (LEAD-PERSONA); 1-6 took four because the bots could not swing. That gap
is the whole plan.

## The machine that keeps it 2 hours (four lanes, always ahead)
1. **Pieces lane (engine + bot skill + meter channel), two worlds ahead.** One library of pieces for the whole game, built once in
   dependency order (reference/plans/ENGINE-NEEDS.md ranked list, refreshed below). A piece lands with its bot skill or it is not done.
2. **World kit day, one world ahead:** the world's kit on gen2 (as w2.ts), its cast rows, its art batch on Hugging Face cut at scale into
   the inventory (WORLD-3-PLAN §3 is the model), BEFORE its first stage is built.
3. **Design lane, one world ahead:** pitch -> pick -> design for a whole world in a day (World 3 did it on 11-19), from the library;
   at most ONE new piece per level, and that piece goes to the pieces lane first; the story keeper's words with the design.
4. **Build lane: the 2-hour level jobs,** one level per job, budget 2 h, hard stop 4 h; a missing piece found mid-build stops the
   build and goes to lane 1 (never built inside it).
And the time inside the level job comes down: addlevel/registrycheck do the registration in one step (built 11-13); the gates run in
parallel (stills while the suite runs); the full slow set (THE FULL SET) runs once per release on the combined head.

## Where it holds or breaks: the late worlds (the reason to plan now)
The common pieces (up, clock, ride, still, water, swing, follow, left) mostly exist after Worlds 1-2. The late worlds bring the rare,
hard ones (ENGINE-NEEDS §2 "later, by hand"): leash and drowsy (W5), the machine's timed door and relic chair (W7), heat (W9), hold
(W10), chase (7-6), dark at full strength (W6, W8: 17 stages), glide down a drop (4-7, 8-6), crumbling vine (7-5, 9-3), break/push (7-2).
World 7 holds 2 hours only if its pieces (machine, break/push, crumbling vine, chase) and their BOT SKILLS are green before its designs are
final; that is about two weeks before its builds. The bosses (R-1: 7-10 to complete) are their own lane, not level jobs.

## The order (made exact below: §The schedule, PLAN-2H 11-23)
Week of 11-23: World 2 done (2-7, 2-6, 2-8, 2-9), World 3 READY (kit, dark + light, prowlers, art batch 1, designs). Then each week: the
current world's builds at 2 h each, the next world's kit + designs, and the pieces for the world after it.

## What exists vs what is missing (PLAN-2H, an Architect job today in the first free slot)
ENGINE-NEEDS.md's truth table is from 11-13. PLAN-2H refreshes it against today's code: for EVERY remaining stage (2-8, 2-9, World 3 to
World 10, the hidden stages), each piece and each bot skill GREEN or MISSING with file:line, its size from measured history, the world it
first serves, and the wave order; plus each world's kit and art status. Output: this plan's exact schedule, one row per piece.

## The scoreboard line (every report to Matt)
Hours per level job vs 2 h (LEVEL-LOG); pieces landed ahead this week vs the plan; worlds READY ahead of their builds.

## The truth table (PLAN-2H, the Architect, 11-23; replaces ENGINE-NEEDS.md §1 of 11-13)
Read on main cdffdc627 and t-eng-27 cf7428424 (2-7's pieces) with `git show`/grep; bot and meter columns from
reference/design/meter-coverage.json on main (bot = tools/inspect/firsttimer.ts symbol, channel = tools/difficulty/score.ts symbol).
GREEN = gen2 lays it from a world's data on a stageTable row or toy, its bot plays it and the meter prices it. PART = the runtime exists
but gen2 does not lay it, or only one world's old kit does (World 5-8's old gen2 kits, gen2/game.ts:90-96, are not stageTable rows).
**PART counts as MISSING for READY**; it is named so the job is sized as a lift, not a build. Sizes: S 1 h, M 2 h, L 4 h (packet).
| # | Piece | Engine today (file:line) | Bot skill | Meter channel | First serves | Size |
|---|---|---|---|---|---|---|
| P1 | up (tower) | GREEN gen2/tower.ts:38 (1-4's row, stageTable.ts:41) | GREEN move:climb | GREEN OTHER_BITS.climb | done | - |
| P2 | down (tower) | PART: tower.ts lays it (legs.ts:16 upOrDown); no row travels down (old 4-7 maker only, stagePlan.ts:109); ENG-W3a running (t-eng-w3-wip-a 5dc8ec2d) | GREEN move:drop; "wait for the light" MISSING | GREEN MOVE_CHANNEL.drop | 3-1 | L (running) |
| P3 | left leg, out-and-back | GREEN on t-eng-27 only (legs.ts:54, toyHome.ts:39, river.ts:67 a river crossed right to left); main: legs.ts:70 `mixed` | GREEN walk; SKILLS.race (t-eng-27 firsttimer.ts:709) | GREEN MOVE_CHANNEL.walk | 2-7 | lands with 2-7 |
| P4 | a liana or a room in a left leg | MISSING: throws by name (legs.ts:151 liana, :165 room) | - | - | 10-6 (5-6 if it swings) | M |
| P5 | switchback (up + left) | PART: legs.ts:83 columnFrame takes a dir; no toy or row | GREEN climb | GREEN climb | 10-5 | S |
| P6 | swing (liana) | GREEN PlaceRule swing (gen2/types.ts:306; 1-6, 2-4) | GREEN lianaWait | GREEN swingChallenges | done | - |
| P7 | far fling | MISSING: only `land` past a swing (gen2/types.ts:311) | MISSING | PART swingChallenges | 8-3 | S + S bot |
| P8 | climb a vine | GREEN gen2/types.ts:312 | GREEN | GREEN | done | - |
| P9 | rope shimmy | GREEN gen2/types.ts:313 | GREEN move:rope | GREEN climb; skill:shimmy row null | 3-2 | in METER-W3 |
| P10 | hang under roof roots (ENG-ROOT) | MISSING: a rope hangs only over a gap, look 'vine' or unset (gen2/types.ts:313-318) | MISSING "creep under a watcher" | PART climb + watch | 3-2 | M + S |
| P11 | vine field (two hands) | PART: runtime on main (fieldPlay.ts:2, vineField.ts), laid only by 1-4's own finish (w1Arc14.ts); nodeLetters.ts:68 still says "not merged" | GREEN on 1-4 | - | only if a design asks (3-4, 7-5, 10-4) | S |
| P12 | glide over a pit | PART: pit jump 'glide' (gen2/types.ts:302), laid only by World 8's old kit (w8Sections.ts:114) | GREEN move:glide | MISSING (move:glide, skill:glide null) | 4-1 | S |
| P13 | glide down a drop | MISSING (needs P2) | MISSING | MISSING | 4-7, 8-6 | S + S |
| P14 | swim, a calm pool (+ ripples) | PART: the engine swims (engine.ts:97 SWIM, kitPools) in rooms; gen2 'pool' planned (stageKit.types.ts:64) | MISSING | MISSING (beat:pools) | 6-2 | M + M |
| P15 | dive, bubbles lift | MISSING | MISSING | MISSING | 6-7 | M + S |
| P16 | hold on (grip vs flash and gust) | MISSING | MISSING | MISSING | 10-3 | M + S |
| P17 | leash (tie on, tie off) | MISSING: planned type only (stageKit.types.ts:84) | MISSING | MISSING | 5-3 | L + M |
| P18 | drowsy (don't stop) | MISSING (story lines only, w5Lines.ts:121) | MISSING | MISSING | 5-1 | M + S |
| P19 | push block | PART: Platform.push (src/game/types.ts:346, old maker); no gen2 lay | MISSING (beat:push logs and boulders) | GREEN OTHER_BITS.puzzle | 7-8 | M + S |
| P20 | break (cracked pillar, ceiling, boulder) | MISSING: 'breakable' planned (stageKit.types.ts:64); Platform.pillar (src/game/types.ts:370) is the old maker's | MISSING | MISSING | 7-2 | M + S |
| P21 | river of logs | GREEN riverLay.ts:56 (2-1..2-5) | GREEN SKILLS.ride, upstream, dropOnLog, vineFromLog | GREEN rideChallenges, lianaChallenges | done | - |
| P22 | pads (weight, beat) | GREEN rideLay layPads (gen2/types.ts:335) | GREEN PAD_SKILL | GREEN rideTiming | done | - |
| P23 | snap stones | GREEN (2-5) | GREEN PAD_SKILL.offBefore4 | GREEN snapChallenges | done | - |
| P24 | water wheel | GREEN wheelLay.ts:44 (2-6) | GREEN SKILLS.rideWheel | GREEN wheelChallenges | done | - |
| P25 | lift, moving platform | GREEN lay rideLay.ts:26 | MISSING (move:lift, ride:up, ride:across, platform:moving bot null) | GREEN rideTiming | 9-2 | S bot |
| P26 | raft river | PART: riverLay skips rafts (3-hidden.md NEW 2) | GREEN ride | GREEN | 3-H | M |
| P27 | tide | PART: SectionZone tide (gen2/types.ts:493), World 6's old kit only (w6Ground.ts:155) | MISSING (zone:tide) | MISSING | 6-3 | M |
| P28 | rising water or lava (the flood clock) + followers wait | MISSING on gen2; runtime river.ts:116 floodLevel | MISSING (2-8 NEW 2) | MISSING | 2-8 | M + M |
| P29 | deadly water gaps | GREEN PitKind (gen2/types.ts:108) | GREEN | GREEN | done | - |
| P30 | beat bricks on one stage clock (bark, crust, fading branch) | PART: each keeps its own clock (stageKit.types.ts:43); snap stones and 1-4's pods only; nodeLetters.ts:69 'p' later | GREEN for snap stones | GREEN rideTiming | 4-6 | M |
| P31 | the court's tempo (2-9 NEW 1) | MISSING | - | - | 2-9 | M |
| P32 | the drum you hear (2-9 NEW 2) | MISSING (an audio cue, src/audio/cues.ts) | - | - | 2-9 | S |
| P33 | still: hide + watcher | GREEN stillLay.ts:21 (1-7) | GREEN stillCoverNear | GREEN watchChallenges | done | - |
| P34 | cover that moves with the breeze | MISSING | MISSING | PART watch | 5-2 | M |
| P35 | a gaze that remembers | MISSING | MISSING | PART watch | 9-4 | M |
| P36 | sounding things, noise | GREEN soundLay.ts:16 (ENG-NOISE, landed 11-20) | MISSING (no noise row) | MISSING | 3-3 | in METER-W3 |
| P37 | lure | GREEN lureLay.ts:19, World 1's rows only (w1.ts) | MISSING (3-3 NEW 2 ring-to-call) | MISSING (no lure row) | 3-3 | S + M |
| P38 | drop trap | GREEN World 1 (dropTrap.ts:42, w1Cast.ts) | GREEN trapWait (t-eng-27 firsttimer.ts:1278) | - | 3-3 (stalactite) | in P37 |
| P39 | prowlers never look up | GREEN predators/core.ts:265 upOf, world3.ts:17 `up: 40` (ENG-PROWL, landed 11-20); 'lit = seen' is the seam at core.ts:260-264, for ENG-DARK | MISSING creature:ocelot | MISSING | 3-2 | in P51 |
| P40 | thorn vine sleeper + deep sleep (ENG-VINE) | PART: thornVine.ts:15, engine.ts:2030 (old maker; hears the puzzle kit only); no PredatorDef | MISSING (beat:thorn vines) | MISSING | 3-5 | M + S |
| P41 | liana bound to a sleeper (ENG-SLEEPER) | MISSING | MISSING | MISSING | 3-8 | M |
| P42 | followers | GREEN follow.ts:21 (W2_FOLLOW, w2.ts:51), followPlay.ts:168 | GREEN LINE_SKILL | GREEN lineChallenges | done (2-3) | - |
| P43 | cages | GREEN on main (cagePlan, cageChallenges); null on t-eng-27 (behind main) | GREEN | GREEN | done | - |
| P44 | chase | GREEN chaseLay.ts:26 (1-8) | GREEN beat:chase | GREEN chaseChallenges | done | - |
| P45 | chase running left | MISSING: stretches laid left to right (chaseLay.ts:4, :125) | MISSING | GREEN | 7-6 | M |
| P46 | predator rows per world | GREEN W1-3, W5-8 (predators/registry.ts:9-15); MISSING W4, W9, W10 | - | - | 4-5 | S each (with the kit) |
| P47 | mimic bush | MISSING (roster.ts:26 names it, no def) | MISSING | MISSING | 8-8 | M |
| P48 | pacer (the race) | GREEN on t-eng-27 (pacerLay.ts:37) | GREEN SKILLS.race | MISSING (no row) | 2-7 | ENG-27w |
| P49 | post (letters, doors) | GREEN on t-eng-27 (postLay.ts:33) | - | MISSING | 2-7 | READY-27 |
| P50 | dark + light ring (ENG-DARK) | PART: darkZone only in World 6's old kit (w6Swing.ts:427) and kitStage.ts:356; SectionZone has tide and wind only (gen2/types.ts:493-494) | MISSING (zone:dark) | MISSING | 3-1 | M |
| P51 | glowworms wake below + 'lit = seen' | PART: GLOW_REACH by x only (zones.ts:81), engine.ts:2029 | MISSING wait-for-light | MISSING | 3-1 | S + S (inside ENG-DARK) |
| P52 | carried light, light as a lure (ENG-LIGHT + WAYS) | PART: World 8's jar only (w8Lantern.ts:42) | MISSING toss-light, set-down-to-climb, bait-and-slip | MISSING | 3-6 | M + S + S |
| P53 | moving light, moonflower step (ENG-MOON) | MISSING | MISSING | MISSING | 3-4 | M |
| P54 | lights that dim (ENG-DIM) | MISSING | - | - | 3-H | S |
| P55 | spore puffs (ENG-SPORE) | PART: zones.ts:281 sporeRecipes (old maker) | MISSING | MISSING (zone:spore) | 3-1 | M |
| P56 | wind gusts | PART: SectionZone wind (gen2/types.ts:494), World 8's old kit only (w8Sections.ts:1343) | MISSING (zone:wind) | MISSING | 4-2 | M |
| P57 | updraft, vent | PART: ventLift zones.ts:148 (old maker) | MISSING | MISSING | 4-8 | M + S |
| P58 | geyser | PART: ZoneKind (zones.ts:22) | MISSING | MISSING (zone:geyser) | 9-6 | M |
| P59 | sticky web | PART: ZoneKind (zones.ts:22) | MISSING | MISSING (zone:web) | 5-4 | M |
| P60 | lightning rods | PART: ZoneKind 'bolt' (zones.ts:22) | MISSING | MISSING (zone:bolt) | 10-2 | M |
| P61 | heat + shade | MISSING: no heat in ZoneKind (zones.ts:22) | MISSING | MISSING | 9-1 | M + S |
| P62 | falling floor tiles | PART: gen2 lays them for World 7's old kit (pipeline.ts:2071) | MISSING (platform:fragile, zone:crumble) | GREEN CRUMBLE_DY | 7-1 | S |
| P63 | creaky bough | GREEN creak.ts:26 (1-4, 1-5) | GREEN on its stages | - | done | - |
| P64 | crumbling vine (snaps, smoulders) | MISSING | MISSING | MISSING | 7-5 | S + S |
| P65 | mist hides ledges | MISSING | - | - | 4-6 | M |
| P66 | the machine: timed doors, relic chairs, seed-key gates | PART: hand-built (protoStage.ts:5770-5780); plates, gates, levers in rooms only (puzzleKit.ts:8-12) | GREEN pastRoom; chairs MISSING | GREEN OTHER_BITS.puzzle | 7-3 | L + M |
| P67 | the rustling fern (ENG-FERN) | MISSING | MISSING | - | 3-7 | S |
| P68 | the hidden-stage door table (ENG-SECRET) | MISSING: secret.ts:8 hard-codes '7-7' | - | - | 3-7, every hidden stage | M |
| P69 | the guardian preview V | MISSING: nodeLetters.ts:53 'later' | - | - | 3-9, every X-9 | S |
| P70 | World 5's flowers, threads, chairs | PART: run by the old kit (gen2/game.ts:91, protoStage.ts:187) | MISSING (beat:orchids, beat:humming threads) | MISSING | 5-5 | M |
| P71 | auto-scroll (rafts, falls, vent) | MISSING | MISSING | - | 2-H | L |
| P72 | the draft, a zipline | MISSING | MISSING (move:draft) | MISSING | 1-H | M |
| P73 | blooms where he steps | MISSING | - | - | 5-H | M |
| P74 | a swarm that lights the way | MISSING (from P42 + P52) | - | - | 8-H | M |
| P75 | cards at totems | MISSING | - | - | 10-H | L |
**Kits (gen2, a stageTable kit as w2.ts):** W1, W2 GREEN. W3 MISSING (ENG-W3a running). W4 MISSING (L). W5-W8 PART: old gen2 kits run
5-7, 5-9 and 21 stages of W6-W8 today (gen2/game.ts:90-96; w6Game.ts:17, w7Game.ts:16, w8Game.ts:18): a port, M each. W9, W10 MISSING
(L each; gen2-w9 and gen2-w10 are 10-30 branches never merged). **Art (best-fit pieces in src/game/art/inventory/wN.json, to stand / to
climb):** W3 10/0, W4 12/0, W5 15/3, W6 10/0, W7 22/14, W8 6/1, W9 14/0, W10 16/0 (W2, which ships, has 68/14). Climbing art is the gap
in W3, W4, W6, W9, W10 (13 ascents between them); the scale_ok column is unset for most standing pieces, so scale comes from the gate.

## Per stage: what each needs, and the wave that makes it READY (none past 2-7 is READY today)
Pieces from its design (2-8, 2-9, World 3) or its map idea (reference/qa-reports/ENGINE-NEEDS/map-tally.txt; World 4 on has no design).
A stage is READY when every piece is GREEN, its kit is in, its art is in the inventory and its words are approved. Missing in brackets.
- **2-8** up, followers, left leg (P3), [P28 flood + followers wait] -> Wave 1 (Tue 11-24). **2-9** river, pads, snap stones, lianas,
  wheel, bell, barge (rideLay) [P31 tempo, P32 drum] -> Wave 1 (Wed 11-25). **2-H The Rapids** [P71, P26, P68] -> Wave 2.
- **3-1** [K3, P2, P50, P51, P55]; **3-2** [K3, P10, P51 lit = seen, METER-W3]; **3-3** [K3, P37 + bots, P55; stalactite art]; **3-4** up
  [K3, P50, P53, wait-for-light]; **3-5** [K3, P40, P10, P50, P52, its bots]; **3-6** [K3, P50, P52 + bots]; **3-7** left (P3) [K3, P67,
  P68, P10, P55]; **3-8** swing [K3, P40, P41]; **3-9** [all of the above, P69, bait-and-slip]; **3-H** [K3, P26, P54, P50, P68] -> all Wave 1.
- **4-1** up [K4, P12]; **4-2** [K4, P56, P12]; **4-3** (the hand-built set piece: kept, or P30); **4-4** swing [K4, P56 on a swing];
  **4-5** still [K4, P46 eagle row]; **4-6** up [K4, P65, P30]; **4-7** (hand-built today) [P2, P13]; **4-8** up, followers [K4, P57];
  **4-9** [K4, P56 blows guards off, P46]; **4-H Up the Falls** [P71, P57] -> all Wave 2.
- **5-1** [K5, P18]; **5-2** still [K5, P18, P34]; **5-3** followers [K5, P17]; **5-4** swing [K5, P59]; **5-5** [K5, P70, P30]; **5-6** left
  [K5; P4 if it swings]; **5-7** still [K5, P70]; **5-8** up [K5, P17]; **5-9** [all]; **5-H The Wilted Garden** [P73] -> all Wave 2.
- **6-1** swing [K6, P10]; **6-2** still [K6, P14]; **6-3** swing [K6, P27]; **6-4** [K6, P27, P28]; **6-5** [K6, P37's W6 rows];
  **6-6** [K6, P50, P52]; **6-7** down [K6, P15]; **6-8** up [K6, P28]; **6-9** [all]; **6-H The Sunken Hollow** [P14, P15] -> Wave 3.
- **7-1** [K7, P62]; **7-2** [K7, P20]; **7-3** [K7, P66]; **7-4** (the built slide: kept, no level job); **7-5** up [K7, P64]; **7-6** left
  [K7, P45, P62]; **7-7** [K7, P66, P30]; **7-8** up [K7, P19, P20]; **7-9** [all]; **7-H Under the Ruins** [P50, P68] -> rare pieces
  Wave 3, the rest Wave 4.
- **8-1** [K8, P50]; **8-2** [K8, P53, P30]; **8-3**, **8-5** [K8, P7]; **8-4** (the built lantern run: kept); **8-6** down [K8, P13, P53];
  **8-7** up [K8, P52 + refill]; **8-8** still [K8, P37's owl row, P47]; **8-9** [all]; **8-H The Moth Lights** [P74] -> Wave 4.
- **9-1** [K9, P61]; **9-2** up [K9, P57, P12, P25]; **9-3** [K9, P64, P7]; **9-4** still [K9, P35]; **9-5** up [K9, P28, P57]; **9-6**
  [K9, P20, P58, P37]; **9-7** up [K9, P30]; **9-8** [K9, P57]; **9-9** [all]; **9-H Up the Vent** [P71, P57] -> Wave 5.
- **10-1** [K10]; **10-2** up [K10, P60]; **10-3** [K10, P16, P56]; **10-4** up [K10, P16]; **10-5** [K10, P5]; **10-6** left [K10, P4,
  P10]; **10-7** [K10, P20, P37, P19]; **10-8** up [K10, P57, P16, P7]; **10-9** [all] -> Wave 5. **10-H Pokey's Own Road** [P75] and
  **1-H Zipline Canopy** [P72, P68] -> Wave 6.

## The schedule (one row per piece; PLAN-2H 11-23). Builds: one world a week, each level a 2-hour job
Build weeks: W2 11-23, W3 11-30, W4 12-7, W5 12-14, W6 12-21, W7 12-28, W8 1-4, W9 1-11, W10 1-18 (the game's levels by Fri 1-22).
Each wave builds a world's kit FIRST (D40: the pieces' toys prove on their own world's row and on a World 1 or 2 row), then its pieces,
each landing WITH its bot skill and its meter channel, or it is not done. Two piece members side by side (disjoint WRITE lists; one
holder of gen2/pipeline.ts and types.ts at a time); the art batch on Hugging Face beside them. **With one piece member, every wave
takes twice as long and every world from W3 on slips a week (the lead's call, R5 below).**
| Wave (Mon-Fri) | Piece | Size | Needs first | First build it serves | GREEN by |
|---|---|---|---|---|---|
| 1 (11-23) | K3 World 3's kit + 3-1 down (ENG-W3a, running) | L | - | 3-1, Mon 11-30 | Mon 11-23 |
| 1 | P28 the flood clock + followers wait (2-8 NEW 1-2) | M + M | P3 (2-7's left leg) | 2-8, Wed 11-25 | Tue 11-24 |
| 1 | P31 the court's tempo, P32 the drum (2-9 NEW 1-2) | M + S | - | 2-9, Thu 11-26 | Wed 11-25 |
| 1 | P50 + P51 ENG-DARK: the dark brick, glow below, 'lit = seen', bot wait-for-light | M + S + S | K3 | 3-1 | Tue 11-24 |
| 1 | P55 ENG-SPORE | M | P50 | 3-1 | Wed 11-25 |
| 1 | P40 ENG-VINE + deep sleep | M + S | - | 3-5 | Tue 11-24 |
| 1 | P10 ENG-ROOT + bot creep under a watcher | M + S | K3 | 3-2 | Wed 11-25 |
| 1 | P37 ENG-LURE (stalactite drop) + bots ring-to-call | S + M | K3 | 3-3 | Wed 11-25 |
| 1 | P53 ENG-MOON | M | P50 | 3-4 | Thu 11-26 |
| 1 | P52 ENG-LIGHT + WAYS + bots toss-light, set-down-to-climb, bait-and-slip | M + S + S | P50 | 3-6 | Thu 11-26 |
| 1 | 3-5's bot skills | M | P40, P10 | 3-5 | Thu 11-26 |
| 1 | P41 ENG-SLEEPER | M | P40 | 3-8 | Thu 11-26 |
| 1 | P67 ENG-FERN, P68 ENG-SECRET, P69 V preview | S + M + S | K3; P3 | 3-7, 3-9 | Fri 11-27 |
| 1 | P26 ENG-RAFT3, P54 ENG-DIM | M + S | P50 | 3-H | Fri 11-27 |
| 1 | METER-W3: channels for dark, spore, ocelot, jaguar, shimmy, thorn vine, noise, lure | M | the above | all of W3 | Fri 11-27 |
| 1 | W3-ART-1 (stand + climb), W3-ART-2 (roots, rims, stalactite, cap) | M + M | - | all of W3 | Fri 11-27 |
| 2 (11-30) | K4 World 4's kit + its predator rows | L + S | - | 4-1, Mon 12-7 | Mon 11-30 |
| 2 | P12 glide's channel and skill row; P13 glide down a drop + bot | S + S + S | P2 | 4-1, 4-7 | Tue 12-1 |
| 2 | P56 wind: bot, channel, on a swing, blowing guards off | M + S + M | K4 | 4-2, 4-4, 4-9 | Wed 12-2 |
| 2 | P57 updraft lay + bot ride-the-updraft | M + S | K4 | 4-8 | Wed 12-2 |
| 2 | P30 beat bricks on one clock (bark first) | M | - | 4-6 (8-2, 9-7) | Tue 12-1 |
| 2 | P65 mist hides ledges | M | K4 | 4-6 | Wed 12-2 |
| 2 | P71 auto-scroll | L | - | 2-H, 4-H, 9-H | Thu 12-3 |
| 2 | K5 World 5's port to a stageTable kit | M | - | 5-1, Mon 12-14 | Tue 12-1 |
| 2 | P17 leash + its bot (tie on, tie off) | L + M | K5, P42 | 5-3, 5-8 | Thu 12-3 |
| 2 | P18 drowsy + bot keep-moving; P34 moving cover | M + S + M | K5 | 5-1, 5-2 | Thu 12-3 |
| 2 | P59 sticky web; P70 flowers, threads, chairs ported + bots | M + M | K5 | 5-4, 5-5, 5-7 | Fri 12-4 |
| 2 | P73 blooms where he steps | M | K5 | 5-H | Fri 12-4 |
| 2 | W4-ART, W5-ART (climbing art first for W4) | M + M | - | W4, W5 | Wed 12-2, Fri 12-4 |
| 3 (12-7) | K6 World 6's port; K7 World 7's port | M + M | - | 6-1, 7-1 | Tue 12-8 |
| 3 | P14 calm pool + swim + ripples + swim bot | M + M + S | K6 | 6-2 | Wed 12-9 |
| 3 | P27 tide (bot + channel), P28 reused for 6-4/6-8 | M | K6, P28 | 6-3 | Wed 12-9 |
| 3 | P15 dive, bubble lift + bot | M + S | K6, P2 | 6-7 | Thu 12-10 |
| 3 | P37's World 6 rows (the caiman's water) | S | K6 | 6-5 | Wed 12-9 |
| 3 | **P66 the machine** (timed door, relic chair, seed-key gate) + bot | L + M | K7, P30 | 7-3, 7-7 | Fri 12-11 |
| 3 | **P20 break** + bot; **P19 push** + bot | M + S + M + S | K7 | 7-2, 7-8 | Thu 12-10 |
| 3 | W6-ART | M | - | W6 | Thu 12-10 |
| 4 (12-14) | P62 falling floor tiles' bot; **P64 crumbling vine** + bot; **P45 chase running left** | S + S + S + M | K7 | 7-1, 7-5, 7-6 | Wed 12-16 |
| 4 | W7-ART, 7-H's dark tunnels (P50 reused) | M + S | - | W7 | Wed 12-16 |
| 4 | K8 World 8's port; P7 far fling + bot; P52's refill flowers | M + S + S + S | - | 8-3, 8-7 | Thu 12-17 |
| 4 | P47 mimic bush; P37's owl row; P74 the moth swarm | M + S + M | K8 | 8-8, 8-H | Fri 12-18 |
| 4 | W8-ART | M | - | W8 | Fri 12-18 |
| 5 (12-21) | K9 World 9's kit + predator rows; **P61 heat + shade** + bot | L + S + M + S | - | 9-1 | Tue 12-22 |
| 5 | P35 gaze that remembers; P58 geyser; P25 lift bot (vents) | M + M + S | K9 | 9-4, 9-6, 9-2 | Wed 12-23 |
| 5 | K10 World 10's kit + rows; **P16 hold on** + bot; P60 lightning rods | L + S + M + S + M | - | 10-2, 10-3 | Thu 12-24 |
| 5 | P5 switchback; P4 liana and room in a left leg | S + M | K10 | 10-5, 10-6 | Thu 12-24 |
| 5 | W9-ART, W10-ART | M + M | - | W9, W10 | Thu 12-24 |
| 6 (12-28) | P72 the draft (1-H); P75 cards at totems (10-H) | M + L | P68 | 1-H, 10-H | Fri 1-1 |
Hours per wave (sizes above): 1 about 45 (plus W3a's 4, running), 2 about 47, 3 about 30, 4 about 21, 5 about 31, 6 about 6: about
180 hours of pieces, front-loaded, then the late worlds are mostly reuse (W8 13 h, W9 17 h). **Lead time (GREEN by vs first build):**
W3 0-3 days and W4 5 days (the ramp: the rule "a week before" cannot hold for them; a piece late for a W3 build cuts the build to what
exists, LANES rule 2); W5 10 days; W6 11; **W7's rare pieces (machine, break, push) 17 days, its crumbling vine and left chase 12**; W8
17; W9 19; W10 25. World 7 holds the 2 hours on this order.

## The risks to the 2 hours (where the bots cost most, and what each piece must carry so the level job never inherits it)
- **R1 Moving carriers + a tight window.** 2-6's wheels: 35 sessions and not shipped (LANES "Measured so far"; the lip family on a
  moving bucket, R-165.398); 2-7's race: 23 engine sessions; 2-3's cages and followers: about 10. The same shape is ahead in P25 lifts,
  P26 rafts, P57 updrafts and vents, P53 moonflower steps, P27/P28 tide and rising water, P17 leash, P41 sleeper swing, P71 auto-scroll,
  P30 beat bricks. **Each lands with:** its bot skill played by the child, middle and expert bots on its toy row (tierBots), castBots
  --proven at the ship bar on the toy (D125), the Easy arc measured (child on Easy), its meter channel, and the contact model on a moving
  top tested (the lip). These are sized M + bot at least, never S.
- **R2 Followers meet a new hazard** (2-8 flood, 4-8 updrafts, 5-3 leash): the line skill (LINE_SKILL) learns the hazard in the piece's
  job (2-8 NEW 2's "deep water is a WAIT"), proven before the build.
- **R3 t-eng-27 is behind main** (main's cages and line skills are missing there: its coverage table has beat:cages null; LINE_SKILL
  lacks hopBack, fetchClock). Merge main into it before BUILD-27, or 2-7 lands without 2-3's bots (S, Lane 1).
- **R4 One spine.** gen2/pipeline.ts and types.ts take one holder at a time; each piece is a new gen2 file plus one hook, hooks in the
  wave's order (ENGINE-NEEDS §2's rule, kept). The two piece members of a wave take disjoint lists: lights and zones (P50-P60) vs the
  creature kit, finds and moves (P10-P20, P37-P47, P66-P68).
- **R5 Capacity.** Waves 1 and 2 need about 45 hours each: two piece members all week. With one, World 3 and World 4 each slip a week.
- **R6 The ramp.** World 3's pieces are GREEN 0-3 days before its builds; a late one blocks a build, never grows inside it.
- **R7 Holidays.** Waves 5-6 and the W6-W8 builds sit on 12-24 to 1-1; Matt's days are not known here.
- **R8 Stale signs.** nodeLetters.ts:68-71 still marks the vine field, beat pieces, gate and trap "not merged" though their runtime is on
  main (fieldPlay.ts, creak.ts): NODE-KEY tells designers they are 'later', so designs avoid pieces that exist (S fix, Engine).
