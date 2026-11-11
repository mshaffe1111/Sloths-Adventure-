# R-165.59: the child, middle and expert bots (11-11, Critic as builder)

Code: `tools/inspect/firsttimer.ts` (FT_CHILD, FT_MIDDLE, FT_EXPERT play Normal; FT_MIDDLE_EASY, FT_CHILD_EASY the same players on Easy),
`tools/inspect/tierBots.ts` (the CLI and the checks), pinned by `tools/inspect/tierBots.test.ts`.
Source: `tools/playtesters/profiles/` copied unchanged from t-w11-analyst@437a3a13 (P-numbers only). Every profile number below is
`tiers/<tier>.json` → `all.<setting>.<field>` unless named; a distribution `[p10, p25, p50, p75, p90]` is sampled (firsttimer.ts `drawQ`:
piecewise linear through the five points, tails carried on at the last span's slope). Times are the profile's ms / 1000.
Run: `npx tsx tools/inspect/tierBots.ts --stage 1-1 --tiers child,middle,expert --seeds 1-40 --setting both --calibrate`.

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
(child [0, 0.75]): across a gap, the second press between these quantiles. `readAim` 0.5 (child none): at a gap that needs a double, a
press distance past aimQ p50 is drawn again up to p50 (aimQ holds every moving press near an edge, hops on flat ground among them).
`retryHold` unset. Tier-bot rules (no field): sees a pit under an edge; a step over 90 px up gets a double; hops onto a bounce mushroom
when the way on is 100+ px up, doubles off its top; never steers to land on one; a way on straight overhead is jumped for; the put-back's
stillness is not "stopped dead"; the late lift-off arms once per let-go; 8 tries at a spot before the put-past (KID/ADULT: 3); 20 min cap.

**Profile fields the bots do not use, and why.** finishSeconds, livesPerRun, putbacksPerRun, leftMidStage, pieces, stretchSeconds:
outcomes, the calibration targets. pausesPerRun: game time stops in the pause. punchesPerMinute, punchTakenBackShare, misread*: 1-1 has
nothing to punch, a taken-back punch is no punch (D38), and the harness never reads a jump press as a punch. latePressPastLipPx: follows
from lateQ and run speed. reversalShare, reversalGapMs: the bot steers by the route; their time is inside the fitted gapShare.
dragToMovePx: the pad is the move itself. duckMs, climbMs, climbSpeedPxPerS: nothing to duck under or climb on 1-1 (null). touch.* other
than jumpFlickOffVerticalDeg and twoFingerShare, touch.play, touchCurve, steeringAllStages: screen-level gestures and whole sessions; the
bot plays at the intent level. firstRun, laterRuns, perPlayer: the bots play the pooled `all` numbers.

## Calibration on origin/main 1-1 (0.9.5, layout list e03e9c8c, 138 seeds), variants 1-40 every tier and setting
Variant n → provenSeedFor('1-1', n − 1). Tier n (played runs): expert Normal 46, middle Easy 15, middle Normal 27, child Normal 5, child
Easy 1 (P27, the outlier). Bot runs: `calibration-main.jsonl` (one line a run, the table at its end). Tolerances: finish p50 12%; lives,
put-backs (means) max(30%, 0.3); second press p50 25%; pieces 2 of top 3 (5+ runs both sides); rescues 0 (middle, expert).

| tier setting | runs/finished | finish p50 s | lives/run | put-backs/run | 2nd press p50 ms | top 3 pieces (bot vs tier) | rescues | |
|---|---|---|---|---|---|---|---|---|
| expert Normal | 40/40 | 177.2 vs 167 | 0.18 vs 0.28 | 0.15 vs 0.2 | 467 vs 441 | log-chain-rise, mushroom-chain-back, double-teach vs mushroom-chain-back, canopy-rungs-level, log-chain-rise: 2 of 3 | **1** (v30 w1-backstep-twist) | MISS (rescue) |
| middle Easy | 40/40 | 208.6 vs 187 | 0 vs 0 | 1.25 vs 1.2 | 433 vs 383 | double-teach, dip-double-teach, mushroom-chain-back: 3 of 3 | **2** (v16 w1-twin-mushroom-fork, v30 w1-backstep-twist) | MISS (rescues) |
| middle Normal | 40/40 | 219.4 vs 213 | 0.57 vs 0.63 | 0.63 vs 0.7 | 433 vs 416 | log-chain-rise, double-teach, mushroom-chain-back vs canopy-rungs-level, log-chain-rise, mushroom-chain-back: 2 of 3 | 0 | PASS |
| child Normal (thin) | 40/40 | 460.3 vs 444 | 1.55 vs 1.2 | 3.08 vs 3.4 | 367 vs 406 | only w1-seed-perch has 5+ tier runs: vacuous | 12 (printed) | PASS |
| child Easy (outlier) | 40/40 | 341.6 vs 2231 | 0 vs 0 | 4.47 vs 187 | 433 vs 543 | none eligible | 10 | printed only |

Child rescues (no player has one; they hide stuck time): w1-fern-bank ×2, w1-root-stair-fork ×2, w1-hollow-twoway ×2, w1-twin-bounce ×2,
w1-bank-stair-fork, w1-fallen-trunk, w1-learn, w1-log-walk (variants 6, 10, 15 ×3, 17, 19 ×3, 25, 31, 37).

## The same bots on A1 (t-engine-putback@41c2e248, my two tools/inspect files copied into a worktree), variants 1-40
`calibration-a1.jsonl`. Normal lives a run: **0 for every tier** (expert 0/40 runs, middle 0, child 0). Put-backs a run: expert 0.33,
middle Normal 1.83, middle Easy 1.25, child Normal 4.03. Rescues: expert 1, middle Normal 3, middle Easy 2, child 12. All 160 runs finished.
Middle Normal's 3 new rescues are put-back loops (8 tries at one spot, then put past): v4 w1-mushroom-chain 9 put-backs, v28
w1-mushroom-chain-back 8, v32 w1-log-chain-rise 10. On main the same misses were lives (back to the flag); A1's put-back returns him to the
same take-off, so a player who misses that jump the same way can loop there. Worth a look before C1.
