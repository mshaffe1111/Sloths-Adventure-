# R-165.59: the child, middle and expert bots (11-11, Critic as builder; attempt 2)

Code: `tools/inspect/firsttimer.ts` (FT_CHILD, FT_MIDDLE, FT_EXPERT play Normal; FT_MIDDLE_EASY, FT_CHILD_EASY the same players on Easy),
`tools/inspect/tierBots.ts` (the CLI and the checks), pinned by `tools/inspect/tierBots.test.ts`.
Source: `tools/playtesters/profiles/` copied unchanged from t-w11-analyst@437a3a13 (P-numbers only). Every profile number below is
`tiers/<tier>.json` → `all.<setting>.<field>` unless named; a distribution `[p10, p25, p50, p75, p90]` is sampled (firsttimer.ts `drawQ`:
piecewise linear through the five points, tails carried on at the last span's slope). Times are the profile's ms / 1000.
Run: `npx tsx tools/inspect/tierBots.ts --stage 1-1 --tiers child,middle,expert --seeds 1-40 --setting both --calibrate`.

**The pin (enforced).** `tierBots.test.ts` runs in CLAUDE.md's checks and in CI (`.github/workflows/gates.yml`, job `rolled`). Any change to
1-1, the engine or the bots that moves a run fails it: re-run the calibration (the command above, all tiers, both settings, variants 1-40),
check the table, and recommit `calibration-main.jsonl` in the same change.
**11-11, INT-1-1 (C1's re-lay, A1, the help):** recommitted on the re-laid 1-1; the runs the bots were calibrated on (0.9.5's 1-1) are kept as
`calibration-0.9.5.jsonl`. On the new layout the table no longer matches the testers' profiles, by design (no life lost in 1-1; put-backs a
run 0.05-2.05 against the testers' 1.5-3.8): the bots stand as calibrated on 0.9.5 until a play window on the new 1-1 re-measures them.

## Mapping: every field, its value, its source

| Field | child N / child E | middle N / middle E | expert N | Source |
|---|---|---|---|---|
| holdQ (s) | [22,49,74,115,231] / [49,100,219,395,1108] ms | [50,82,118,181,329] / [51,91,135,202,467] ms | [84,125,180,278,701] ms | jumpHoldMs (press to release, `i jump` to `i jumpUp`); replaces `hold` and `short`; at least 1 frame, at most 1.5 s |
| short | 0 | 0 | 0 | the 2-frame taps are inside holdQ |
| aimQ (px before the lip) | [1,28,73,119,232] / [0,27,71,161,245] | [11,32,58,92,156] / [8,30,61,106,182] | [17,36,61,91,131] | groundPressToLipPx; the press comes at once (latency is inside the measure) |
| edgeAim | 73 / 71 | 58 / 61 | 61 | groundPressToLipPx.p50 (used by the "ledge just across" check) |
| lateShare, lateQ | 0.121, [18,46,83,113,129] / 0.25, [65,100,180,247,362] ms | 0.123, [16,37,99,152,234] / 0.11, [16,34,66,117,216] ms | 0.073, [17,41,92,157,259] ms | latePressShareOfLipJumps, latePressAfterLeavingLedgeMs (the engine's coyote decides) |
| standShare, standQ | 0.81, [237,394,560,740,1131] / 0.663, [132,263,631,1187,2371] ms | 0.524, [133,200,292,401,601] / 0.483, [115,158,235,335,468] ms | 0.206, [100,133,200,300,500] ms | groundPressFromStandstillShare, steering.standStillMs; he lets go at aimQ p25 + 31 px |
| dblShare | 0.234 / 0.3 | 0.262 / 0.255 | 0.236 | secondPressDelayMs.n / (jumpHoldMs.n − secondPressDelayMs.n − airPressWithoutFirstJump) |
| dbl2Q (s) | [291,323,406,530,710] / [361,413,543,724,1251] ms | [250,319,416,517,650] / [249,317,383,484,627] ms | [284,329,441,559,683] ms | secondPressDelayMs (replaces `dblAt`) |
| steerQ, gapQ (s) | moveHold [56,80,120,192,524], gap [268,420,630,1041,1489] / [64,132,231,444,931], [50,83,297,717,1708] ms | [104,164,333,712,1303], [164,266,473,719,1033] / [107,169,367,767,1401], [102,233,393,615,863] ms | [137,267,563,1128,1853], [50,230,328,469,763] ms | steering.moveHoldMs, steering.moveGapMs (open ground only) |
| knowsDouble | true | true | true | doubleUsedShare 1.0 in every tier |
| upOnly | 0.16 | 0.02 | 0.2 | touch.{portrait,landscape}.jumpFlickOffVerticalDeg: share of flicks under 10° off straight up, by flick count (twoFingerShare ≤ 0.09: one thumb) |
| look, heed, stopReact, thumb, upOnlyT, hopFoe, hesitate, swap, drift, thumbSpeed, slip, slipFrames, release, releaseMax, (hold, dblAt) | FT_KID's | FT_ADULT's | FT_ADULT's | kept: no profile measures reaction, thumb latency, drift or the lift-off; 1-1 has no animal or punch; hold/dblAt unused once holdQ/dbl2Q are set |

**Tuning fields** (no profile number; each fitted on 1-1 to the tolerances, never the reverse): `gapShare` 0.5 (middle, expert; child 1):
the share of moveGapMs spells taken on open ground (fitted to finishSeconds). `readHold` 0.5: at a gap or face he must clear, the hold is
drawn from holdQ's p50 up. `readDbl` 0.75 (child 0.5): up a step, the second press from dbl2Q's quantile ≤ this. `readGap` [0.4, 0.9]
(child [0, 0.9]): across a gap, the second press between these quantiles. `readAim` 0.5 (expert, middle Normal; none for middle Easy and
the child): at a gap that needs a double, a press distance past aimQ p50 is drawn again up to p50. `retryHold` unset.
**Tier-bot rules** (no field): sees a pit under an edge; a step over 90 px up gets a double; a bounce mushroom: hopped onto when the way on
is 100+ px up and it is ahead, or when the way on is over a double's reach (170 px) and it is within 220 px either side, on his floor or on
a block up to 110 px over it (a double when it sits 80+ px up), with a double off its top; never steered onto as a landing; off a ledge
100+ px over the way on, the end without a mushroom on it or under it, kept to until he stands on other ground (6 s at most); a way on
straight overhead (40 px; 80 px when the ledge spans over him) within a double's reach (175 px) is jumped for, steered to 30 px inside
that ledge; out of reach, he hops onto the nearest 20-100 px step within 160 px first; a late press needs a lip (at a face he jumps),
and a late plan that does not walk off within 1 s is drawn again; the put-back's stillness is not "stopped dead"; the late lift-off arms
once per let-go (KID and ADULT let go 8-17 frames late, past releaseMax: the audit Critic measured KID p50 4 max 17, cap 4; ADULT p50 8
max 16, cap 2); 8 tries at a spot before the put-past (KID/ADULT: 3); 20 min cap.

**Profile fields the bots do not use, and why.** finishSeconds, livesPerRun, putbacksPerRun, leftMidStage, pieces (lives, put-backs,
seconds), stretchSeconds: outcomes, the calibration targets (pieces.seconds is compared below). pausesPerRun: game time stops in the
pause. punchesPerMinute, punchTakenBackShare, misread*: 1-1 has nothing to punch, a taken-back punch is no punch (D38), and the harness
never reads a jump press as a punch. latePressPastLipPx: follows from lateQ and run speed. reversalShare, reversalGapMs: the bot steers by
the route; their time is inside the fitted gapShare. dragToMovePx: the pad is the move itself. duckMs, climbMs, climbSpeedPxPerS: nothing
to duck under or climb on 1-1 (null). touch.* other than jumpFlickOffVerticalDeg and twoFingerShare, touch.play, touchCurve,
steeringAllStages: screen-level gestures and whole sessions; the bot plays at the intent level. firstRun, laterRuns, perPlayer: the bots
play the pooled `all` numbers.

## Calibration on origin/main 1-1 (0.9.5, layout list e03e9c8c, 138 seeds), variants 1-40 every tier and setting
Variant n → provenSeedFor('1-1', n − 1). Tier n (played runs): expert Normal 46, middle Easy 15, middle Normal 27, child Normal 5, child
Easy 1 (P27, the outlier). Bot runs: `calibration-main.jsonl` (one line a run; the per-piece seconds and the table at its end).
Tolerances: finish p50 12%; lives, put-backs (means) max(30%, 0.3); second press p50 25%; pieces 2 of top 3 (5+ runs both sides);
rescues 0 (middle, expert).

| tier setting | runs/finished | finish p50 s | lives/run | put-backs/run | 2nd press p50 ms | top 3 pieces, bot (vs tier) | rescues | |
|---|---|---|---|---|---|---|---|---|
| expert Normal | 40/40 | 173.9 vs 167 | 0.35 vs 0.28 | 0.28 vs 0.2 | 467 vs 441 | log-stair-test, log-chain-rise, canopy-rungs-level (tier: mushroom-chain-back, canopy-rungs-level, log-chain-rise): 2 of 3 | 0 | PASS |
| middle Easy | 40/40 | 196.2 vs 187 | 0 vs 0 | 1.48 vs 1.2 | 433 vs 383 | double-teach, dip-double-teach, log-stair-test (tier: double-teach, dip-double-teach, mushroom-chain-back): 2 of 3 | 0 | PASS |
| middle Normal | 40/40 | 207 vs 213 | 0.57 vs 0.63 | 0.83 vs 0.7 | 433 vs 416 | log-chain-rise, canopy-rungs-level, double-teach (tier: canopy-rungs-level, log-chain-rise, mushroom-chain-back): 2 of 3 | 0 | PASS |
| child Normal (thin) | 40/40 | 429 vs 444 | 1.3 vs 1.2 | 2.93 vs 3.4 | 367 vs 406 | only w1-seed-perch has 5+ tier runs: vacuous | 8 (printed) | PASS |
| child Easy (outlier) | 40/40 | 301.4 vs 2231 | 0 vs 0 | 3.1 vs 187 | 433 vs 543 | none eligible | 1 | printed only |

Child rescues (no player has one; they hide stuck time): w1-hollow-twoway ×3, w1-fallen-trunk ×2, w1-log-walk, w1-learn, w1-meadow
(variants 5, 13, 19 ×3, 30 ×2, 32).

### Seconds in each piece, middle Normal (p50 over the runs that entered it; pieces with 5+ runs on both sides)
| piece | tier runs | tier s | bot runs | bot s |
|---|---|---|---|---|
| w1-canopy-rungs-level | 6 | 16.1 | 18 | 16.5 |
| w1-clearing | 5 | 5.8 | 10 | 8.5 |
| w1-dip-double-teach | 15 | 11.8 | 19 | 16 |
| w1-double-teach | 11 | 15.1 | 20 | 17 |
| w1-fern-bank | 12 | 4.8 | 18 | 6.5 |
| w1-forest-edge | 6 | 7.1 | 8 | 9 |
| w1-home-banks | 8 | 5.9 | 10 | 7.5 |
| w1-hop-bounce | 23 | 22.1 | 35 | 17.5 |
| w1-leap-stones | 5 | 27 | 11 | 28 |
| w1-learn | 18 | 16.4 | 25 | 19.5 |
| w1-log-chain-rise | 9 | 13.4 | 11 | 18 |
| w1-log-stair-test | 11 | 14.9 | 16 | 17.5 |
| w1-log-teach | 7 | 12.2 | 9 | 16.5 |
| w1-log-walk | 13 | 6.1 | 24 | 7 |
| w1-meadow | 17 | 12.8 | 24 | 15.5 |
| w1-morning-path | 9 | 6 | 10 | 7 |
| w1-mound-log | 5 | 19 | 11 | 25 |
| w1-mushroom-bank-teach | 7 | 13.5 | 7 | 15.5 |
| w1-mushroom-chain-back | 5 | 16.4 | 12 | 20 |
| w1-quiet-arrival | 17 | 6 | 23 | 7 |
| w1-root-stair-fork | 18 | 13.8 | 20 | 17 |
| w1-seed-perch | 26 | 18.3 | 40 | 18.5 |
| w1-stair-fork | 11 | 16.3 | 16 | 20 |
| w1-sunlit-log | 5 | 7.3 | 12 | 8 |
| w1-twin-mushroom-fork | 10 | 21.2 | 12 | 20.5 |

The bot is slower than the testers in 23 of 25 pieces (most by 0.2-4 s; log-teach, mound-log, dip-double-teach, log-chain-rise by 4-6 s)
and faster only at w1-hop-bounce (17.5 vs 22.1 s) and w1-twin-mushroom-fork (20.5 vs 21.2 s), yet its finish is 6 s faster (207 vs 213).
The two don't add up the same way: the profiles' piece seconds are slices between the game's section lines, and 26 of the tier's 53
pieces have fewer than 5 runs, so they are not in this table. A limit: gapShare fits the bot's whole-stage time, not each piece's.

## A1 baseline: today's 1-1 on t-engine-putback@41c2e248, the final bots, all tiers on both settings, variants 1-40
`calibration-a1.jsonl` (one line a run, per-piece lives, put-backs and seconds; each tier's table at its end). Run from a worktree of
41c2e248 with my two tools/inspect files copied in. **The 1-1 re-lay is judged against this file.** Expert has no Easy bot: the expert
testers played Normal only (0 Easy runs), so there is no profile to build one from.

| tier setting | runs/finished | finish p50 s | finish min s | lives (all runs) | put-backs/run | rescues |
|---|---|---|---|---|---|---|
| expert Normal | 40/40 | 172.5 | 152.9 | 0 | 0.6 | 0 |
| middle Easy | 40/40 | 196.2 | 169.4 | 0 | 1.48 | 0 |
| middle Normal | 40/40 | 204.8 | 172 | 0 | 1.53 | 0 |
| child Normal | 40/40 | 427.6 | 365.6 | 0 | 3.8 | 8 |
| child Easy | 40/40 | 301.4 | 280.9 | 0 | 3.1 | 1 |

Per piece: put-backs a run over the runs that entered it (runs in brackets), and rescues (R) at a stuck spot in that piece; only pieces
with a put-back or rescue in some row (every other piece is 0 in every row). Child Easy's 1 rescue is a put-past after 8 tries at one
spot, not a stuck spot, so it has no piece here.

| piece | expert N | middle E | middle N | child N | child E |
|---|---|---|---|---|---|
| w1-canopy-drop | 0 (2) | 0 (2) | 0 (2) | 0.5 (2) | 0 (2) |
| w1-canopy-rungs | 0 (1) | 0 (1) | 0 (1) | 2 (1) | 9 (1) |
| w1-canopy-rungs-level | 0.22 (18) | 1 (18) | 0.67 (18) | 3.67 (18) | 1.28 (18) |
| w1-dip-double-teach | 0.11 (19) | 0.42 (19) | 0.37 (19) | 0.79 (19) | 0.58 (19) |
| w1-double-teach | 0.1 (20) | 0.75 (20) | 0.55 (20) | 1.15 (20) | 2.65 (20) |
| w1-fallen-trunk | 0 (2) | 0 (2) | 0 (2) | 0 (2), 2R | 0 (2) |
| w1-high-walk-up | 0 (4) | 0 (4) | 0 (4) | 0.25 (4) | 0 (4) |
| w1-hollow-twoway | 0 (8) | 0 (8) | 0 (8) | 0 (8), 3R | 0 (8) |
| w1-last-step-up | 0 (5) | 0 (5) | 0 (5) | 0.2 (5) | 0 (5) |
| w1-leap-stones | 0.18 (11) | 1.18 (11) | 0.36 (11) | 0.73 (11) | 0.73 (11) |
| w1-learn | 0 (25) | 0 (25) | 0 (25) | 0 (25), 1R | 0 (25) |
| w1-log-chain | 0 (7) | 0.14 (7) | 0.86 (7) | 1.29 (7) | 0.43 (7) |
| w1-log-chain-rise | 0.36 (11) | 0 (11) | 1.18 (11) | 1 (11) | 0.27 (11) |
| w1-log-stair-test | 0.38 (16) | 0.06 (16) | 0.06 (16) | 0.06 (16) | 0.19 (16) |
| w1-log-walk | 0 (24) | 0 (24) | 0 (24) | 0 (24), 1R | 0 (24) |
| w1-meadow | 0 (24) | 0 (24) | 0 (24) | 0 (24), 1R | 0 (24) |
| w1-mushroom-chain | 0 (4) | 0 (4) | 0.25 (4) | 0.75 (4) | 0.25 (4) |
| w1-mushroom-chain-back | 0.17 (12) | 0 (12) | 0.42 (12) | 0.58 (12) | 0.33 (12) |
| w1-quiet-arrival | 0 (23) | 0 (23) | 0 (23) | 0 (23) | 0.09 (23) |
| w1-second-jump | 0.5 (2) | 1.5 (2) | 0 (2) | 0.5 (2) | 1.5 (2) |
| w1-sunlit-log | 0.08 (12) | 0 (12) | 0.08 (12) | 0.08 (12) | 0 (12) |
| w1-two-answers | 0 (1) | 0 (1) | 0 (1) | 2 (1) | 1 (1) |

**Which loseLife the bot run uses, and what counts as a life.** RealPlay stubs `e.loseLife` (realPlay.ts:141, `this.died = true`).
firsttimer.ts replaces that stub, in its constructor, with a wrapper that records a harm of kind `life` (with the reason: water, pit or
hurt) and then calls the engine's own `GameEngine.prototype.loseLife` (engine.ts:4912 on 41c2e248, which records the `lostLife`
event). So a life in these files is exactly one real engine loseLife call. A fall the engine turns into a put-back never reaches loseLife:
`softFall()` (or `heartFall()`'s soft zones calling it) returns true first (engine.ts:2523), and the bot counts it as a put-back
(`softFalls`). A hit (`damagePlayer`) is kind `hit`, never a life; 1-1 has nothing that hits. One pasted run, middle Normal variant 2, the
same bot on both builds (the pit at x 33653 is a life on main and a put-back on A1, where softFallStage turns softOn on for 1-1 Normal):
```
== main (origin/main), middle Normal v2
engine softOn false | e.loseLife is RealPlay stub: false | bot wrapper calls proto.loseLife: true | proto.loseLife records lostLife: true
{"variant":2,"end":"shrine","time":243.2,"lives":[[33653,1962,"pit"]],"hits":0,"softFalls":2,"softFallXs":[8155,26963],"rescues":0}
== A1 (41c2e248), middle Normal v2
engine softOn true | e.loseLife is RealPlay stub: false | bot wrapper calls proto.loseLife: true | proto.loseLife records lostLife: true
{"variant":2,"end":"shrine","time":237.1,"lives":[],"hits":0,"softFalls":3,"softFallXs":[8155,26963,33653],"rescues":0}
```

On the attempt-1 bots (164e4cf8) A1 showed put-back loops: v4 middle Normal, 9 standing doubles into the pit from 29758,864 because the
mushroom he needed sat on a 43 px block, 73 px over his floor, outside the 60 px window (fixed: the window now takes a block up to 110 px);
v7 middle Normal, 8 put-backs at w1-mushroom-chain-back and 0 rescues: one at 28176, then 7 standing doubles from 28665,717. The put-back
had set him on the lower 717 ledge he last stood still on, 223 px under the next ledge (494), past a double's reach (about 185 px), and the
8th try got him round. The 8-tries put-past counts tries at one spot, so 7 never fired it. The final bots no longer drop to that ledge
there. **For the lead:** on A1 a put-back returns a player to the last still ground, which can sit under the way on rather than beside it,
so a child who misses the same way can loop there.

## The stand at middle v3 (164e4cf8) and the stills
The 9.4 s stand at middle v3 (x 24316, w1-log-stair-test) was not the pit rule. The edge plan was "late press" (walk off, then press), a
70 px stump stood at the log's end so he could not walk off, and the plan re-armed every second: he held right against the stump, vx 0, for
9.4 s. Fixed: a late press needs a lip (at a face he jumps), and an unused late plan is drawn again. Middle Normal stops of 8 s+ (not
rescued): 164e4cf8 50 stops in 30 of 40 runs (46 at an open drop); now 2 stops in 2 runs (v2 w1-root-stair-fork, v16
w1-twin-mushroom-fork). Stills of the v16 stop: `middle-v16-stuck-sideways.jpg`, `-upright.jpg` (x 20873, 9.6 s, a mossy block in a
144 px dip under a ledge with a mushroom, the floor mushroom ahead). The attempt-1 stills of the v3 stand are kept: `middle-v3-stuck-*.jpg`.
