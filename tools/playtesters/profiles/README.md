# Player-bot inputs: anonymized profiles from the control-test sheet (W11-ANALYST, 11-11)

Built from the WHOLE "Sloths control tests" Sessions tab (4,589 rows, pulled 11-11 3:56 AM ET), so the sheet can be purged (Matt, 11-11).
Everything here is an aggregate: players are P-numbers (order of first arrival, P1 to P33). There are no names, tester codes, device
models, session ids or survey free text. The persona files in ../personas/ are the Critic's. These are their inputs.

**Rebuild (one command, needs the sheet export and `npx tsx`):**
`python3 -I tools/playtesters/report.py <folder of Sessions!A2:H exports> --profiles tools/playtesters/profiles`
The layouts are rebuilt by `tools/playtesters/layouts.ts`, the game's own build (stageGenerator.ts:2892), for list `e03e9c8c` only.
report.py refuses the lip measures if the runs' `list` differs.

## Files
- `index.json`: the tier rule, the thin rule, the layout list version, `groundCheck` (below), per tier its players, `runs` and
  `thin`, and per player its side (before / since / other 0.9.5), tier, sessions, `gen2Runs` and `runs` (both: the gen2 1-1 runs),
  `thin`, `thinWhy` and `touchPlacedShare`. `thinRule` (here and in each tier file) states the thin rule in words.
- `players/P<n>.json`: one player. `touch`, `touchCurve` and `steeringAllStages` for everyone (all sessions, every stage). `gen2_1_1` and `survey` only for
  the 10 players with gen2 1-1 runs (P24 to P33, all since 0.9.5).
- `tiers/<child|middle|expert|unrated>.json`: the gen2 1-1 players pooled by tier. `all` is per setting. `firstRun` is each player's first run,
  and `laterRuns` is the rest. `perPlayer` holds each player's medians, so one player's many runs don't read as many players. `touch` and
  `steeringAllStages` cover the tier's players over every stage. `runs` and `thin` are machine-readable.

**Thin** (`"thin": true`, reason in `thinWhy`): a tier with under 10 gen2 runs; a player with under 5 gen2 runs, or with
`touchPlacedShare` under 0.8 (their touch numbers rest on few placed strokes). Sample from it, but don't trust its tails. The child tier is thin
(6 runs: P26 4, P27 1, P32 1). Thin players: P26, P27, P31, P32 (runs); P8, P9, P10, P11, P13, P17, P19 (placement); P33 (both).
`touchPlacedShare`: placed strokes ÷ all strokes. A stroke is unplaced when no logged screen size fits it (none in the device line or
any `start`/`screen` line, or it falls outside both orientations of the size in force). It is counted, never placed on a guessed size.
P30 is 0.87 and P5 0.868: kept, but noted.

**perPlayer** (tier files): `runs` (gen2 1-1 runs), `finishMedianS` (median finish, s; null with no finish), `jumpHoldMsP50` (median
jump press hold, ms), `groundPressToLipPxP50` (median press distance before the lip, px).

## Tiers (from play, never asked)
child: median finish >= 380 s on any setting, or >= 20 put-backs a run on Easy. expert: median finish <= 190 s and <= 1.0 lives + put-backs
a run. middle: everyone else with a finished run. unrated: no finished run.
Result: expert P24, P30 (48 runs). middle P25, P28, P29, P31 (44). child P26, P27, P32 (6 runs: **thin**, and P27's single 37-minute Easy run
carries most of its put-backs). unrated P33 (1 unfinished run). The 22 "before" players have touch numbers only (they played the older stages).

## Distributions
Every distribution is `{n, p10, p25, p50, p75, p90}`, nearest-rank, rounded to 0.1. Shares (touchStartX/Y) and flickPxPerMs keep 3
decimals (0.1 of a screen would be up to 40 px). A bot samples from them. Small `n` (under about 20) is a hint, not a law.

## gen2_1_1 fields (per setting, firstRun, laterRuns, and tiers)
| Field | What it is | How it was computed |
|---|---|---|
| runs, runsPlayed, finished | runs started / runs with play (a section line) / finished | `gen2` line to the next `gen2` or session end |
| finishSeconds | game time at `finish` | the `finish` event |
| livesPerRun, putbacksPerRun, pausesPerRun | per run with play | `lostLife`, `softFall`, `pause` inside the run's section slices |
| leftMidStage | {piece: count} where a played run stopped without finishing | the last section of an unfinished run |
| doubleUsedShare | share of runs that used the double jump at all | `move double` (first use per stage start, playRecorder.ts:409-416) |
| jumpHoldMs | the jump press held, ms | `i jump` (the press) to the next `i jumpUp` (the release; TouchController.tsx:49-50), under 5 s |
| groundPressToLipPx | how far before the edge a ground jump is pressed, px (+ = before it) | a press on the ground while moving (|vx| >= 30); the distance from Pokey's middle (p.x is his middle, p.y his feet) to the end of the walkable surface he is heading for (platform tops merged where they touch at one height). Only presses within 300 px of that end. The layouts are checked by report.py --profiles, which prints: `98922 of 98923 ground lines sit on a rebuilt platform top (same y, x within 60 px of its ends)` (also `groundCheck` in index.json) |
| groundPressFromStandstillShare | share of ground presses made standing still (|vx| < 30) | the same presses |
| latePressAfterLeavingLedgeMs, latePressPastLipPx | a late (coyote) press: ms after he walked off, and px his middle was past the edge | an air press within 400 ms of a walk-off (his last ground line within 60 px of the edge he moved toward, no jump since). The coyote window is 214 ms on Normal 1-1 and 248 ms on Easy (BENCHMARKS.md §1), so presses later than that were too late |
| latePressShareOfLipJumps | late presses ÷ (late + lip presses) | |
| secondPressDelayMs | the double jump's second press after the first, ms | the next press in the same air spell after a ground or late press |
| airPressWithoutFirstJump | air presses that were neither (falling off a bounce, a vine, a drop) | count |
| punchesPerMinute, punchTakenBackShare | taps read as punches; the share the jab rule took back (a flick within 100 ms, touchGestures.ts:91, CT-17) | `i punch`, `i punchCancel` among the next 5 intents within 150 ms |
| misreadPerMinute, misreadShareOfKeptPunches | a kept punch followed by a jump press within 0.6 s (the player meant to jump; 1-1 has nothing to punch) | the next 5 intents |
| pieces | per gen2 piece id: runs in it, lives, put-backs, seconds in it per run | section slices; time away (hidden..shown) removed |
| stretchSeconds | per survey stretch (plain words): seconds per run | the same, by the section's words |
| finishTrend (players) | finish times in run order: the learning curve | |
| steering (in every gen2 block) and steeringAllStages | see "Steering" below | |

## touch fields (per player and per tier, split by orientation)
`touch.portrait` and `touch.landscape`: each stroke is placed on the screen size IN FORCE when the finger went down. That size comes from
the device line, then every `start` and `screen` moment. If a stroke fits only the turned size (the turn's `screen` line settles 0.4 s late),
it is placed on the turned size. If it fits neither, it is counted in `unplacedStrokes`, not guessed: 1,431 of 53,815 strokes overall.
report.py asserts that every share is between 0 and 1.
| Field | Unit | What |
|---|---|---|
| strokes | count | finger down..up strokes placed in this orientation |
| minutes | min | time spent in this orientation (start to end of each session, split at each turn) |
| mix | share | tap (path < 12 px, < 300 ms), hold (path < 12 px, longer), flick (< 300 ms, over 0.25 px/ms), drag (the rest) |
| tapMs, holdMs, flickMs, dragMs | ms | how long each kind lasted |
| flickPx, flickPxPerMs | CSS px; px/ms | a flick's straight-line length and speed |
| jumpFlickOffVerticalDeg | degrees | how far an upward flick leans off straight up |
| touchStartX, touchStartY | share of the screen, 0..1 | where strokes start (0 = left / top) |
| leftHalfShare, twoFingerShare | share | strokes starting on the left half; finger-downs made while another finger was down |
| touchSizePx | px | the reported touch size (phones that report one) |
| gapBetweenTouchesMs | ms | from all fingers up to the next finger down |
| screenWidthPx, screenHeightPx | CSS px | the screen size each stroke was placed on (sizes as aggregates; no device names) |
`touch.play` (whole sessions, every stage): `minutes` (min, first to last moment), `starts` (stage starts), `finishes`, `quits` (the
end-of-stage Quit choice), `stuckHelp` (Dot's wall-jump help shown: counts), `hurtPerMinute` and `livesLostPerMinute` (per minute of
session), `intentsPerMinute` (each touch intent per minute). `touchCurve`: per session (oldest first) and orientation with 50+ strokes,
the same stroke numbers: how a player's touch changed.

## Steering (the game's steering is digital: `i move left|right|none`)
| Field | Unit | What |
|---|---|---|
| moveHoldMs | ms | how long one direction is held (a move to the next move intent) |
| moveGapMs | ms | how long steering is let go (`none`) before the next move: the stop-start rhythm on the thumb |
| reversalShare, reversalGapMs | share; ms | moves that go the other way from the last direction held, straight across or after letting go (left -> none -> right), per move; and the time with no direction held between them (0 when straight across). Later runs: child 0.03, middle 0.20, expert 0.32 |
| dragToMovePx | CSS px | the steering finger's sideways travel from touch-down when the move fires: the drag that becomes a run (about 17-25 px; speed is then the run speed, there is no partial speed) |
| standStillMs | ms | Pokey standing still on the ground (|vx| < 10) for 100 ms or more, before moving again: the stop-start rhythm in the world |
| duckMs | ms | a duck held (`i duck 1` to `i duck 0`) |
| climbMs, climbSpeedPxPerS | ms; px/s | a climb spell (state `c`) and the climb speed. 1-1 has no vines, so these are null in every gen2 block and every tier. They exist only in `steeringAllStages` of the 17 players who played the old vine stages |

## survey (counts only)
`<question>=<answer>`: the v2 survey's fixed choices (fun, long, knew, tips, next, hard). The free text (`note`, `lookedNote`) was never read out.
