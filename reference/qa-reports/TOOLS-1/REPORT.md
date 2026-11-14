# TOOLS-1 REPORT: the three tool faults that slow every level (R-165.239, R-165.244, R-165.245)

Branch `t-tools-1` from `origin/t-int-9@fb409960`. Commits: f3312155c (item 2), d0a79b119 (item 1), 56d074c46 (item 3), b8df4a365
(turnover note), then this report. Started 4:17 PM ET. Times below come from `TZ=America/New_York date`.

## Done-items (each with its evidence)
1. **R-165.244, the castBots "state leak": the cause was an engine cache, fixed at its root** (f3312155c). Found by bisection on
   t-build-16, where BUILD-16c saw it: the same 1-6 seed builds a different stage depending on the setting built before it in the process
   (Normal then Easy: Easy needs 73 petals and has 113 pickups; Easy alone: 82 and 127). Bypassing `RELEASE_CACHE` (pipeline.ts) or
   `chainCache` (physics.ts) left the leak in place. Bypassing `FLIGHTS` (src/game/levelCheck.ts, swingLandingsIn) removed it. That cache
   keyed a liana flight's landings by geometry alone, but the flight reads the setting's swing (physics `setTimedSwing`: period, grab
   reach, sweet spot; Easy differs). Its two neighbours (heldCached, chainLines) already keyed on those four numbers. Fix: one key helper,
   `swingSettingKey()`, used by all three; the held and chain keys are byte-identical to before.
   - Planted: `src/game/flightSetting.test.ts`: Easy asked after Normal must equal Easy asked alone (in a fresh child process), and the
     planted liana must land differently on the two settings. RED without the fix ("Easy asked after Normal is Easy alone"), GREEN with it.
   - On t-build-16 with the patch: 1-6 seeds 1-6, full layout hash (every ledge, liana, pickup, flag, section), both orders, both
     settings: **12 of 12 builds order-dependent before, 0 of 12 after.** castBots kid Easy seed 1 is need 82, got 123, 192.3 s alone,
     after a kid Normal run, and after a child Normal+Easy pair (it was 73/111/212.1 s after a Normal run).
   - On t-int-9 (my base) no stage showed it (1-1..1-7, seeds 1-3, Normal then Easy, by goal and pickup count). The lock: `lockall
     --layouts 16 --check` against base: **102/102 stages unchanged**. The meter: base and branch print identical scores on 1-1..1-7.
2. **R-165.239, the meter scores each liana once** (d0a79b119). `tools/difficulty/score.ts` `swingChallenges`: a liana is scored at
   its release (the let-go, the leap to the next liana of a chain, or a ledge-to-ledge swing the check linked whole). The grab off a
   bank (route.ts plat -> liana) is the same liana's start, not a second challenge. A missed swing's cost now comes from `costAt`, using
   the jump inspector's own pit rule (jumps.ts inspectJumps: nothing within 220 px under the span): soft moss gives a set-back, a thorn
   floor a heart, a floorless pit a life, ground close under only another go. Each swing keeps its beat's clock and words.
   - Planted: `tools/difficulty/score.test.ts` (4 tests: one liana is one swing; a chain is two; costs with and without soft moss,
     thorns, ground; and the real 1-1..1-7, where swings = lianas reached + linked swings, and no swing is charged a life on a soft-pit
     stage). With the old behaviour planted back: **4 of 4 RED** (real 1-6: "16 swings for 9 lianas reached"). With the fix: 4 of 4 GREEN.
     Added to gates.yml's tool-test line (ciTests.test.ts: 3 pass).
   - Re-score, 1-1..1-7, 4 layouts, both settings (`reference/qa-reports/TOOLS-1/meter-table.md`, JSONs beside it): 1-1..1-5 and SCALE
     (0.28194) unchanged; **1-6 Normal 9.5 -> 6.4, Easy 9.1 -> 5.5** (16 -> 9 swings, the double count gone; base's 1-6 has no soft
     pits); **1-7 Normal 3.6 -> 2.4, Easy 1.8 -> 1.5** (its 4 swings over soft pits are set-backs, no longer lives).
   - tierBots: no calibrated number can move. Nothing in tools/inspect imports score.ts (grep), and the bots read no meter number.
     `tierBots.test.ts` result below.
3. **R-165.245, clipcheck's "Dot's first tip" walks by game frames** (56d074c46). Cause: the step held right and pressed Space every
   300 ms of real time, while Dot's clock runs on the game's (DotGuide.tsx:940-944, at most 100 ms a screen frame). How far he got
   before each line depended on the machine's load. FIX-15's miss shot showed 1-3's snake/hive teach card, a card that waits to be read
   (it carries the tap hint, so no Skip), which no key ever tapped. My base runs also missed with Pokey still at the spawn (keys raced
   the page start). Now the step runs on the development build (its engine handle). The engine's loop is stopped as it starts (an
   init script gated on `clipHold=1`, so later steps are untouched), and the stage-start card is left to finish. Then the step walks one
   game frame per screen frame through the touch pad's own calls (`clipPress.mjs` pressFrame, as tools/inspect/clip.mjs does): right,
   a hop when blocked 6 frames, never hurt, and any card up 3 s of game time without a Skip is tapped, as a player taps a card that
   waits. The cap is 90 s of game time. It judges once the Skip is armed (its own 1.2 s real-time timer), not after a sleep. Each walk
   prints its frame, taps and tip.
   - **Proof, 10 runs each, side by side on one loaded machine** (CLIPCHECK_STEPS="pause,help offer,Dot's first tip", fresh save, up and
     sideways; the two steps that play before it are kept because they change the save). Base used its own step, with only the step
     filter patched into a scratch copy. **Base 8 of 10 PASS** (runs 3 and 6: "fresh up: Dot's first tip: waiting for .dg-skip" timed
     out; miss shot `clip-proof/base-run3-miss-fresh-up.png`, Pokey at the spawn). **Branch 10 of 10 PASS**, every walk the same tip
     ("No vine? Walk him to the end of his branch."), 1 card tapped, game frame 1600-1745 over the 20 walks (the spread is the few frames the engine runs
     before the init script stops it). Logs: `reference/qa-reports/TOOLS-1/clip-proof/`.
   - Stress at Chrome's 4x CPU throttle (stopped early to free the machine for the suite: a scope cut, said plainly): base 2 of 3
     (run 3 missed Dot's tip sideways), branch 1 of 1.
   - Harness switches for a step's own proof: `CLIPCHECK_STEPS`, `CLIPCHECK_CPU`, `CLIPCHECK_SHOTS` (header of clipcheck.mjs).

## Gates (LAWS 5, as scoped by the packet; head named per line)
GATES_PENDING

## Polish check
- `clip-proof/branch-seen-fresh-up.png` and `branch-seen-fresh-side.png`: Dot's first tip as the gate judges it. The card is
  readable, clear of the 48 px insets both ways up, and its Skip tips button is armed (solid, not faded) and inside the card. Nothing
  covers Pokey or the snake ahead sideways. No breach.
- The meter and the leak fix change no screen.

## Pushback
- **The packet framed R-165.244 as a castBots fault ("isolate each build"). It is an engine fault**, and isolating castBots (a process
  per run) would have hidden it from seedlist, lockall, the suite and a phone that builds the same seed on both settings in one session.
  I fixed the cache key in src/game/levelCheck.ts (Engine-owned code, one key) instead, under LAWS 22. That makes this branch a
  game-code branch, so it ran the full gates.
- The packet said "re-score 1-1..1-7": base's 1-6 is the old hand-built-era stage, so the BUILD-16b figure (1-6 Easy 4.3 vs ~3) is
  measured on t-build-16's 1-6, not here. It needs the same re-score once t-build-16 merges this.

## Suggestions (ready packets)
- **ENGINE/TOOLS: the tools build Easy stages with Normal's swing** (a D19 instance). Evidence: seedlist.ts, lockall.ts and every
  direct generateStage/buildGen2Stage caller never call `setTimedSwing`; only the engine does (engine.ts, just before generateStage). On
  t-build-16's 1-6, the same tool-style Easy build (easyStage(withGoals(generateStage))) hashes differently with Easy's swing set,
  3 of 3 seeds. So a seed list may prove an Easy stage a phone does not build. Objective: one build entry that sets the setting's swing
  (or the build sets it from `difficulty` itself, as lianaRelease does), used by the engine and every tool. Files: src/game/gen2/
  pipeline.ts or stageGenerator.ts, tools/engine/seedlist.ts, lockall.ts. Done: a test that builds an Easy liana stage via the tool path
  and the engine path and gets the same stage; the seed-list --check on every listed liana stage (1-6 next).
- **ENGINE (physics.ts chainCache)**: its key leaves out each vine's own `swingPeriod`, which the flight reads (`a.swingPeriod`,
  `b.swingPeriod`). It is harmless while every liana uses TIMED.period, and wrong the day one does not. Done: key it the way levelCheck's
  chainLines does (sw(v) includes swingPeriod); a planted pair differing only in period.
- **INSPECT (beats.ts)**: the let-go seg is labelled "swing on to the next liana" (no `from`), and a bank-to-bank liana still gives
  two V beats to every beat-based measure (pacing weights). This branch fixed only the meter. Done: a grab beat named as a grab, and
  its weight decided by the Designer.

## Unresolved
UNRESOLVED_PENDING

## Method used
reference/methods/difficulty.md (the meter), gates.md (clipcheck), the ENGINE card's day one (lock on base, planted failure first,
full suite before a non-safe push), D19/D57 from LESSONS.

## Lessons applied
- Check the fact in code (D7/D24): the "castBots leak" was traced to a line, not assumed to be the bots.
- Test the measuring tool before trusting its numbers (D15): the meter's double count, with a planted red.
- A gate must call the same code the screen calls (D19): clipcheck now drives the touch pad's own calls; the tools' Easy swing is a
  D19 finding.
- Spread every fix to its pair (D21): one key helper for all three flight caches.
- Times and ids pasted from commands (D20/D30); the queue read at every push (D57); context % from the transcript's own usage (D55/D64).

## Method update (proposed; the lead merges)
- gates.md, clipcheck row: "a step suspected of flaking is proven with `CLIPCHECK_STEPS=<step> [CLIPCHECK_CPU=4]` N runs on base and
  branch side by side (the steps that change the save before it included); `CLIPCHECK_SHOTS=1` keeps a shot of every judged screen".
  Also: no step drives play by wall-clock keys; play inside a step is stepped by game frames (pressFrame).
- engine (engine-core.md 0za, written): "a cache of an answer that reads module-level settings (TIMED, PHYS, difficulty) keys on
  them; its test is A-then-B equals B alone, in a fresh process".
- difficulty.md: "a liana is one challenge, at its release; a miss costs what lies under it (costAt), as a jump's".

## Turnover note
reference/handoffs/engine-core.md section 0za, commit b8df4a365.
