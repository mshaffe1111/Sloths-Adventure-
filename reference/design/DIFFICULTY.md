# The hardness meter and the difficulty arc (DIFF-ALGO, R-165.172; written 2026-11-12, 9:10 PM ET). A plan and a measured prototype; no game code
Matt (11-12, 8:26-8:38 PM ET; STAGE-RULES §1 #5): Normal scored 0-100, World 10's hardest = 100, each world about its own tenth; "assign
points" to creatures, double jumps, jump distance, "how many things are going on at one time", "not guessing". His ratings after playing
on Normal: **1-1 = 4 (maybe 5), 1-2 = 2 (maybe 3), 1-3 = 1**; Easy "a casual playthrough", always lower. Prototype (read-only, tools only,
no play-time cost, PERFORMANCE-RULES §1): `npx tsx tools/difficulty/score.ts --check`, then `--stages 1-1,1-2,1-3 --seeds 1-4 --detail`.
## 1. What makes a stage hard: every challenge in BITS, then what a miss costs
A challenge is anything on the route the thumb must do or survive; its size is how precise the input must be, in BITS: Fitts's index
(MacKenzie 1992, log2(D/W + 1)) with the need as the distance and the reach LEFT OVER as the target, so bits = log2(1 / (1 - share)):
half a move's reach is 1 bit, 3/4 is 2, 7/8 is 3. No paper fits Fitts to platformer jumps (the research found none): the margin view
is Sorenson 2011's and Aramini 2018's, and Wehbe 2017 measured it.
| Element | Bits (the rule; numbers flown in the real engine) | Examples | Why |
|---|---|---|---|
| Jump across or up | share = need / reach of the EASIEST move he has: single 244 px across, 123 up; double 396 / 212; bounce 179 / 223 (specs/reach.md §1) | 50 px step 0.75; 156 px gap 1.47; 200 px gap 2.47 | margin for error is the challenge (Sorenson 2011; Aramini 2018) |
| Double jump | + 1.32 for the second press: any press 2-12 frames in climbs it, a 333 ms window in a 0.5 s rise | 139 px double rise 2.86 | a timed press in a window (Lee & Oulasvirta 2016) |
| Narrow landing | + log2(88 / width) under two bodies (88 px) | a 44 px cap +1 | smaller platforms: more errors, higher rated difficulty (Wehbe 2017; Mourato 2010) |
| Creature in reach | log2(1 + 1 s / its tell): the tell from its own def (predators/core.ts:37 tellOf; Easy x1.3) | W1 snake 0.5 s: 1.58 (Easy 1.34) | enemies are the best single predictor of rated difficulty, rho 0.72 (Summerville 2017), but only one that can reach him |
| Creature asleep or trapped | 0.5: a choice, no clock | 1-3's 12 trapped snakes | 1-3's design: "Pokey does not have to fight" |
| Timed hazard / crumble / swing | log2(1 + cycle / open window); a crumble +1 on the jump onto it; a liana release log2(1 + 1.6 / 0.4) = 2.32 | a gust open 1/3 of its cycle: 2 | Lee & Oulasvirta 2016; Rational Design grades each timing (McEntee 2012) |
| THE FREE BIT | the first bit of every move is free: only bits past it are CHALLENGE | a 50 px step: 0 | Matt: "simple things a 9-year-old can do"; a move with half its reach to spare is not aimed |
- **Three multipliers per challenge** (points = challenge bits x stakes x overlap x novelty):
- **Stakes** (a miss as the engine charges it: engine.ts:905 `softOn`, gen2 `budget.pit`, `heartFalls`, the flags): another go or a soft
  set-back 1.0, a heart 1.25, a life 1.5 + (seconds back to the flag) / 240, at most 2.0 (chance of dying x penalty: McMillen; a miss costs time: Juul 2010).
- **Overlap** (things at once): +50% for each other live threat within 1.5 s, at most x2.5. Our map plans it (GAME-MAP: Worlds 1-3 one thing,
  4-6 pairs, 7-9 triples, 10 everything). The 50% is a DESIGN VALUE to calibrate on World 2+: World 1 has no overlap (planted cases test it).
- **Novelty:** 1 + 0.5 / sqrt(1 + n), n = earlier times the move was asked, in game order (first x1.5, fourth x1.25): the practice curve.
## 2. One number, 0-100
- **Raw load** = 1/2 the mean points a minute (the typical player's time, stageTime.ts modelStage, never under the route's own clock) +
  1/2 the PEAK (the busiest 30 s, as points a minute). A stretch is judged by its peak, not its length (peak-end rule, duration neglect:
  Kahneman 1993); challenge is read over a window (Sorenson 2011) and in rhythm groups (Smith 2009).
- **Not a plain sum, on purpose:** the multipliers make a creature at a landing or a pit under a tight jump worth more than the two apart;
  the peak makes a 20 s gauntlet count in a long stage; the free bit stops "lots of easy things" adding up to "hard".
- **Meter = SCALE x raw**, SCALE set ONCE by 1-1 Normal reading Matt's 4 (median of 4 layouts): 1 meter point = 3.3 raw points a minute,
  so **100 = 326**: about 3 bits a move at the chase density (1.1-1.4 actions a second, STAGE-RULES §2), most over a life-costing fall
  with the flag a minute back and a threat at once on half of them, at the §1b floors. Linear in bits is a log scale of precision (log
  survival, Isaksen 2015; logit, Constant 2017). Re-check the top once World 10 is built to its targets.
## 3. Calibration on World 1 (no stage tuned; meter: 4 layouts a stage; bots: 8 layouts, put-backs a run; no World 1 bot lost a life)
| Stage | Matt, Normal | Meter Normal (median, range) | Meter Easy | Child bot N / E | Middle bot N / E | Expert N |
|---|---|---|---|---|---|---|
| 1-1 | 4 (maybe 5) | **4.0** (2.9-4.1), the anchor | 2.4 (1.3-3.1) | 3.0 / 1.25 | 0.62 / 1.0 | 0.38 |
| 1-2 | 2 (maybe 3) | **2.0** (1.6-2.2) | 0.9 (0.2-1.9) | 0 + 0.5 rescues / 0.25 + 0.12 | 0 / 0.38 + 0.12 | 0.5 |
| 1-3 | 1 | **1.1** (0.8-1.4) | 0.6 (0.5-0.6) | 0 / 0 | 0 / 0 | 0 |
- **Holds, untuned:** Matt's 4, 2, 1 on Normal; Easy 0.45-0.6 x Normal; the child and middle bots fail in the same order. The bots'
  Easy personas are other testers, so Easy is read from the meter (one reference thumb on both settings).
- **Disagrees a little:** 1-2 sits at the bottom of his 2-3. In its chain the hard thing is NOT pressing ("a mid-chain Jump falls in",
  design/1-2.md) and restraint has no bits yet (§6); the expert bot also loses more there (0.5 put-backs) than on 1-1 (0.38).
- **Sensitivity:** peak share 0.3 / 0.7, novelty off, overlap 0 / 1 move 1-2 and 1-3 by 0.2 at most. FREE is the one constant the
  anchors depend on (0.75: 2.8 / 1.7; 1.25: 1.3 / 0.7). FREE = 1 (half the reach) came after run 3 showed every stage carrying a floor
  of free steps, on principle, never fitted; the order holds in every variant.
- **How it got there (each a rule for every stage):** run 1 read 4.0 / 3.1 / 3.1. Then: the easiest move he has; a trapped or sleeping
  snake is a choice; World 1 pits are soft (w1.ts:66); the route artifacts below; the free bit; minutes never under the route's clock.
- **Two inspector defects (packets in REPORT.md):** routeJumps links two banks OVER a raised block or a dip (1-2's humps: a 231 px
  "pit" that is a 53 px hop); stages.ts cannot build 1-2 on Easy (stages.ts:92 calls easyStage on a stage built for Normal). The
  prototype corrects the first from the real platforms. Both get fixed in the inspector before the meter gates anything (D19).

## 4. The arc across the game (Normal targets; Easy at most 0.6 x Normal)
- **World band** [10w - 11, 10w + 1]: about its tenth, overlapping each neighbour by 2, never a whole world (STAGE-RULES §1b).
- **Slots:** target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]: gen2's own sawtooth (STAGE_HEAT,
  gen2/pipeline.ts:336) on the meter: a first stage just under the last world's end (GEMINI-LEDGER F2), a breather after each climb,
  the last the hardest; 10-9 = 100. Guardians are scored on their own (bands.ts skips them too).
- **World 1, from Matt's ratings:** 1-1 2.5 (R-165.173 moves its double rises to 1-4: they are 1-1's heaviest challenges), 1-2 2.5,
  1-3 1.5 (the breather), 1-4 4.5, 1-5 5.5, 1-6 6.5, 1-7 5.5 (the bush), 1-8 7.5 (the chase), 1-9 9.5. From 1-4 Normal climbs.
| World | Band | Today, Normal: median (range) | Easy / Normal | In its band today | Median stage short of its target by |
|---|---|---|---|---|---|
| 1 | -1..11 | 4.1 (0.4-32.2) | 0.92 | 8 of 9 (1-8 reads 32.2: check the chase's route first) | 0.5 (1-1 over by 1.6) |
| 2 | 9..21 | 7.0 (0.3-12.6) | 0.88 | 2 (2-3, 2-4) | 9.8 |
| 3 / 4 / 5 | 19..31 / 29..41 / 39..51 | 5.6 / 11.1 / 7.3 | 0.79 / 0.89 / 0.87 | 0 / 0 / 0 (4-1, 4-9: no route) | 18.7 / 24.9 / 37.5 |
| 6 / 7 / 8 | 49..61 / 59..71 / 69..81 | 5.7 / 5.2 / 4.8 | 0.90 / 0.67 / 0.98 | 0 / 0 / 0 | 50 / 57 / 70 |
| 9 / 10 | 79..91 / 89..100 | 7.4 / 17.0 (max 24.8) | 0.76 / 0.75 | 0 / 0 | 78 / 79 |
- **What it says (first read: 2 layouts, 44 of 90 routes partly traced, calibrated on World 1 alone):** on Normal the game does not climb.
  Worlds 2-9 read 5-11 at the median, nothing past World 2 is in its band, and Easy is barely softer than Normal past 1-3 (the meter does
  not yet see Easy's later first attacks, easyMode.ts:485). Were the meter to miss half of a late stage, World 5 would read 15, not 45:
  this arc is a REBUILD target, not a tune, in dependency order (N1 first: the builder takes the target, then the stages are laid to it).
- **Each world's new thing climbs the same way** (MAP-REVISIONS, GAME-MAP): W2 rides and lanes, W3 hanging and the dark, W4 glide and gusts
  (pairs begin), W5 don't-stop silk, W6 swim and tide, W7 falling floors and timed doors (triples), W8 swing chains and carried light, W9
  heat and rising lava, W10 everything at once. Its first stages teach it low in the band (novelty x1.5 carries it); its last combine it.
## 5. The engine's levers (to move a stage; today = file:line, NEW = a later packet)
| Lever | What it does on the meter | Today (Normal / Easy; file:line) |
|---|---|---|
| Gap and rise vs reach | share up = bits up (7/8 of reach = 3 bits) | builder margin 0.82 / 0.65 (gen2/types.ts:835); flown bands on 1-1..1-3 only (gen2/reach.ts:43); all else on the formula, 10 px high and 33-98 px short (physics.ts:142, :149; specs/reach.md) |
| Forgiveness | coyote, buffer, ledge catch widen every window | FORGIVE coyote 0.133 / 0.167 s (physics.ts:44); Normal's assist fades from 1-1 to 3-5 (physics.ts:54 easeAssist) |
| The double | +1.32 bits each | may be asked from stage 6, or once taught (levelCheck.ts:136; 1-1 by EARLY_DOUBLE, :132) |
| Landing width | +1 bit for each halving under 88 px | Easy +48 px (gen2/types.ts:837) |
| Creature tell | 0.5 s = 1.58 bits; 0.33 s = 2.0 | TELL_MIN 0.5 (predators/core.ts:19); Easy x1.3 (core.ts:37, world1.ts:11) |
| Creature count | each one in reach adds its bits; trapped or asleep 0.5 | gen2 threat budget 2 + 6 x heat (gen2/pipeline.ts:375, :2474); snake costs 2 (w1Cast.ts:27); Easy keeps 60% (gen2/types.ts:839) |
| Things at once | +50% per other threat within 1.5 s | gen2 spaces any two threats 120 px and one kind 420 px apart (pipeline.ts:2273-2274): overlap is rare by rule today |
| Cost of a miss | heart x1.25, life x1.5 plus replay | pit kind per world (pipeline.ts:380; W1 soft, w1.ts:66); whole-stage soft (engine.ts:905); hurt floors (pipeline.ts:1966); 5 hearts (secret.ts:55) |
| Flag spacing | replay seconds raise a life's stakes (to x2) | ROLLED_FLAGS first 700, min 900, max 4000, 2300 when lethal (pipeline.ts:1355) |
| Timed hazards, crumbles, swings | window / cycle in bits; a crumble +1 | gusts x1.25 on World 4 Normal (w4Normal.ts:19); fragile 1.1 s (engine.ts:2583); W7 tiles (zones.ts:234); liana window 167 / 300 ms (gen2/types.ts:857) |
| Time pressure, help | a chase times every move; help lowers it for the stuck | chase (chase.ts:21), tide (risingTide.ts:43); a time limit only sets stars (rules.ts:167); help ladder 1-1 only (engine.ts:910) |
| The stage dial | none yet on 0-100 | gen2's D band and STAGE_HEAT (gen2/pipeline.ts:330-340): its own units, gen2 stages only |
- **NEW (none exists today; grepped):** N1 a meter target in every stage's brief, read by the builder in place of D and heat (pipeline.ts:338);
  N2 a per-stage creature tell and speed scale on Normal; N3 a "threats at once" setting per job (pairs from World 4, triples from 7: GAME-MAP)
  that lifts the 120 / 420 px spacing where the target asks; N4 flag spacing from the target; N5 Easy timing on hazards (zones, rocks, thorn
  vines read no setting); N6 flown reach for every world (Normal past stage 25 never flown); N7 Easy help after repeated failure off 1-1.

## 6. How a designer uses it, and the gate (the later Opus packet's spec)
- **Design doc:** its header names "Normal target N (band), Easy about N/2"; its beat table carries each beat's points from `--detail`;
  the build is judged against the target the same day (reference/methods/difficulty.md, new; a step for methods/level.md).
- **UP** (1 meter point = 3.3 points a minute): gaps toward 7/8 of reach (+2 challenge bits each); landings under 88 px; a heart or life
  under the hard jumps (x1.25 / x1.5), flags further back; a live creature where he lands (+50%); a crumble under a take-off (+1); shorter
  tells (N2); the hard moves in one 30 s burst (six 7/8-reach jumps there lift a stage like 1-2 about 2.8). **DOWN:** trap or sleep a
  creature (1.58 to 0.5), soften a pit, a flag before the hard beat, wider landings, a double rise brought to a single's, a burst spread.
- **Gate:** G1 every stage, both settings, 4+ layouts, median and worst; G2 Normal median within its slot +-1.5 (World 1) / +-3 after, no
  layout over target + 3, each world's median 5+ over the last, Easy at most 0.6 x Normal and climbing; G3 the §1b floors stay (bots 70% /
  50%, kid 85%, windows 167 / 300 ms): the meter never overrides fairness; G4 meter and tier bots agree in rank (Spearman 0.7, the published
  bar: Summerville 2017, Fernandez 2018), and tester ratings when we have them; G5 the planted cases plus a fixture stage of known score; G6
  the inspector's two defects fixed first, then a known list that only shrinks, each entry an R-id (LAWS 5). Tools only, never on a phone.
  Next version: restraint (the chain's "don't press") and Easy's first-attack delay on hand-built stages, both measured by the bots.

## 7. Research (each source and what we took; found by web search 11-12, claims from abstracts or quoted extracts)
- The bit: MacKenzie 1992, "Fitts' law as a research and design tool in HCI", https://www.yorku.ca/mack/hci1992.html (ID = log2(D/W + 1)); Lee & Oulasvirta 2016, "Modelling error rates in temporal pointing", CHI, doi:10.1145/2858036.2858143 (a timed press is a window against timing noise).
- The jump's margin: Sorenson, Pasquier, DiPaola 2011, "A generic approach to challenge modeling...", http://ivizlab.sfu.ca/papers/tciaig2011.pdf (challenge = margin, read over a window); Aramini, Lanzi, Loiacono 2018, https://arxiv.org/abs/1804.09153 (success from noisy take-offs; a path multiplies).
- Landing size: Wehbe et al. 2017, "Testing incremental difficulty design in platformer games", CHI, https://rinawehbe.ca/wp-content/uploads/p5109-wehbe-1.pdf (smaller platforms: more errors, higher rated difficulty); Mourato & dos Santos 2010, "Measuring difficulty in platform videogames", https://comum.rcaap.pt/handle/10400.26/6087 (odds of losing per obstacle).
- Creatures: Summerville et al. 2017, "Understanding Mario", FDG, doi:10.1145/3102071.3102080 (enemies the best single predictor of rated difficulty, rho 0.72; check weights against ratings); Francillette et al. 2024, doi:10.1145/3705013 (creature coverage is its own term).
- Odds, not guesses: Aponte, Levieux, Natkin 2011, doi:10.1016/j.entcom.2011.04.001 (challenge = odds of losing, by synthetic players; falls as players learn); Isaksen, Gopstein, Nealen 2015, http://www.fdg2015.org/papers/fdg2015_paper_02.pdf (odds multiply; skill tiers as noise); Constant et al. 2017, doi:10.1007/978-3-319-67684-5_8 (a logit scale).
- The cost of a miss: Juul 2009, "Fear of failing?", https://jesperjuul.net/text/fearoffailing/ and 2010, "In search of lost time", https://jesperjuul.net/text/losttime/ (some failure is wanted; a miss costs time); McMillen, https://www.gamedeveloper.com/pc/-i-super-meat-boy-i-s-mcmillen-explains-why-so-hard- (chance of dying x penalty); Yacht Club 2014, "Check Point Design", https://www.yachtclubgames.com/blog/check-point-design/.
- Developers' method: McEntee 2012, "Rational Design: the core of Rayman Origins", https://www.gamedeveloper.com/design/rational-design-the-core-of-i-rayman-origins-i- (every parameter graded: the industry's points table); Hayashida 2012, "The structure of fun", https://www.gamedeveloper.com/design/the-structure-of-fun-learning-from-i-super-mario-3d-land-i-s-director (introduce, develop, twist, conclude).
- Peak and practice: Kahneman et al. 1993, doi:10.1111/j.1467-9280.1993.tb00589.x, and Fredrickson & Kahneman 1993, doi:10.1037/0022-3514.65.1.45 (peak and end, not length); Newell & Rosenbloom 1981, "Mechanisms of skill acquisition and the law of practice" (the practice curve).
- Forgiveness and help: Thorson, "Celeste & Forgiveness", https://maddymakesgames.com/articles/celeste_and_forgiveness/ (forgiveness widens margins: in the reach, never points); Gavin 2011, https://all-things-andy-gavin.com/2011/02/07/making-crash-bandicoot-part-6/, and the NSMB Wii Super Guide after 8 failures (N7).
- The points-table shape: Smith & Whitehead 2010, https://users.soe.ucsc.edu/~ejw/papers/smith-pcg-2010.pdf (leniency; its weights were "intuitive", ours are measured); Smith et al. 2009, https://expressiveintelligence.github.io/papers/smith-fdg-09.pdf (rhythm groups). Not taken: a Weber-Fechner law for felt difficulty (no game study found). Principles only: no level, layout or number of another game is copied.
