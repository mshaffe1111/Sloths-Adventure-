# Player-bot inputs: anonymized profiles from the control-test sheet (W11-ANALYST, 11-11)

Built from the WHOLE "Sloths control tests" Sessions tab (4,589 rows, pulled 11-11 3:41 AM ET), so the sheet can be purged (Matt, 11-11).
Everything here is an aggregate: players are P-numbers (order of first arrival, P1 to P33). There are no names, tester codes, device
models, session ids or survey free text. The persona files in ../personas/ are the Critic's. These are their inputs.

**Rebuild (one command, needs the sheet export and `npx tsx`):**
`python3 -I tools/playtesters/report.py <folder of Sessions!A2:H exports> --profiles tools/playtesters/profiles`
The layouts are rebuilt by `tools/playtesters/layouts.ts`, the game's own build (stageGenerator.ts:2892), for list `e03e9c8c` only.
report.py refuses the lip measures if the runs' `list` differs.

## Files
- `index.json`: the tier rule, the layout list version, and per player its side (before / since / other 0.9.5), tier, sessions and
  gen2 runs.
- `players/P<n>.json`: one player. `touch` and `touchCurve` for everyone (all sessions, every stage). `gen2_1_1` and `survey` only for
  the 10 players with gen2 1-1 runs (P24 to P33, all since 0.9.5).
- `tiers/<child|middle|expert|unrated>.json`: the gen2 1-1 players pooled by tier. `all` is per setting. `firstRun` is each player's first run,
  and `laterRuns` is the rest. `perPlayer` holds each player's medians, so one player's many runs don't read as many players. `touch` is the tier's touch numbers.

## Tiers (from play, never asked)
child: median finish >= 380 s on any setting, or >= 20 put-backs a run on Easy. expert: median finish <= 190 s and <= 1.0 lives + put-backs
a run. middle: everyone else with a finished run. unrated: no finished run.
Result: expert P24, P30 (48 runs). middle P25, P28, P29, P31 (44). child P26, P27, P32 (6 runs: **thin**, and P27's single 37-minute Easy run
carries most of its put-backs). unrated P33 (1 unfinished run). The 22 "before" players have touch numbers only (they played the older stages).

## Distributions
Every distribution is `{n, p10, p25, p50, p75, p90}`, nearest-rank. A bot samples from them. Small `n` (under about 20) is a hint, not a law.

## gen2_1_1 fields (per setting, firstRun, laterRuns, and tiers)
| Field | What it is | How it was computed |
|---|---|---|
| runs, runsPlayed, finished | runs started / runs with play (a section line) / finished | `gen2` line to the next `gen2` or session end |
| finishSeconds | game time at `finish` | the `finish` event |
| livesPerRun, putbacksPerRun, pausesPerRun | per run with play | `lostLife`, `softFall`, `pause` inside the run's section slices |
| leftMidStage | {piece: count} where a played run stopped without finishing | the last section of an unfinished run |
| doubleUsedShare | share of runs that used the double jump at all | `move double` (first use per stage start, playRecorder.ts:409-416) |
| jumpHoldMs | the jump press held, ms | `i jump` (the press) to the next `i jumpUp` (the release; TouchController.tsx:49-50), under 5 s |
| groundPressToLipPx | how far before the edge a ground jump is pressed, px (+ = before it) | a press on the ground while moving (|vx| >= 30); the distance from Pokey's middle (p.x is his middle; checked: 98,923 of 98,924 ground lines sit on a rebuilt platform top) to the end of the walkable surface he is heading for (platform tops merged where they touch at one height). Only presses within 300 px of that end |
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

## touch fields (profile.py's own numbers, per player and per tier)
`mix` (tap / hold / flick / drag shares), `tapMs`, `holdMs`, `flickPx`, `flickPxPerMs`, `flickMs`, `dragMs`, `jumpFlickOffVerticalDeg`,
`jumpHoldMs`, `gapBetweenTouchesMs`, `touchStartX`/`touchStartY` (share of the screen), `leftHalfShare`, `twoFingerShare`, `touchSizePx`,
`perMinute` (intents), lives and hurts per minute. Stroke rules: tools/playtesters/profile.py `profile()`. `secondsPerSection` there is the
old slice measure (WINDOW.md §2). Use `gen2_1_1.pieces` instead. `touchCurve`: the same per session of 50+ strokes, oldest first.

## survey (counts only)
`<question>=<answer>`: the v2 survey's fixed choices (fun, long, knew, tips, next, hard). The free text (`note`, `lookedNote`) was never read out.
