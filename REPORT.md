# W1C: World 1's creatures and traps in the real engine, and 1-3 designed, built and in the game. `t-w1-creatures`, 2026-11-12 ET
No PR (the lead's brief). INT-E's report is at reference/qa-reports/INT-E/REPORT.md. Times are pasted from `date`.

## TURNOVER (W1C stopped at 2:23 PM ET on the lead's word, Fable at 98%; F13 takes over from this head)
**Done and pushed:** 1-3 is in World 1's shipped kit and the game rolls it (`src/game/gen2/worlds/w1Arc13.ts`, `w1Cast.ts`); hand-built
1-3 is deleted. 24 of 24 rolls clean on both settings; Normal 15 snakes / 11 traps (the goal comes to 11, every trap), Easy 13 / 11.
`reference/methods/level.md` (the method), `reference/design/1-3.md` (the level, its rules, what is not at the bar), LEVEL-BAR.md.
**NOT finished, plainly:**
1. **The gates on the final code (523affd6) did not finish.** I stopped them when told to stop: the whole suite had run 641 tests with
   0 red, the lock had not reported. Last COMPLETE runs: lock 101 of 102 unchanged, only 1-3 (fbb01511, BEFORE four later engine
   changes: `own`, the rope's end heights, `PIT.wade`, a sleeper's threat); planted faults 45 of 45 (fbb01511; the list has 51 now,
   the 6 newer ones each seen CAUGHT alone or not run: run it all); whole suite on fbb01511: 2 red when stopped at test 946,
   `firstTimerBot.test` "5-9's kid runs" (P13's bot change; P13 has the fix on t-13-proof) and `doubleTaught.test` (fixed since, by `own`).
   Run, in order: `npx tsc --noEmit -p .`; the whole suite (CLAUDE.md "Checks"); `npx tsx tools/engine/lockall.ts --layouts 16 --check
   tools/engine/lockall-main-0.9.6.json` (expect ONLY 1-3 changed); `npx tsx tools/engine/seedlist.ts 1-1 --check`;
   `python3 reference/qa-reports/W1C/planted-faults.py`; build, chunkcheck, drawcheck, clipcheck, kbdcheck, buildcheck, tierBots.
2. **Stills are a PART set on the final geometry:** 24 files, traps 0 (the lesson), 3 (beat 2's stone on a tendril) and 5 (the perch),
   each before / trap / glide / after, upright and sideways. NOT re-shot and NOT looked at on this geometry: the lesson's second
   sleeper (trap 1), traps 2, 4, 6-10, the bare logs, the hop, the rests, the arrival, the rope. I judged all of those one head
   earlier (219502e1: 9 traps); the two new logs I have seen only as numbers. Shoot: `npx vite --port 5199`, then
   `PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/runs/trap-stills.mjs 5199 reference/qa-reports/W1C/stills game 1-3 1 <0-10>`
   and `stills-at.mjs ... 1500:low 12250:low 13450:low 14300:low 15250:low 17750:low 21050:low 25900:low 28000:low 30300:low`
   (save no file in the repo while it shoots: the dev page reloads).
3. **Bots not re-flown on this head** (my last run, aa98fbc3, 9 traps: every tier PASS 6 of 6; fastest run 126.2 s). P13 has the
   head and re-flies 1-40; if a tier is under 120 s, add one more trapped log (a `core()` unit in a beat of `ARC_13`).
4. **P13's:** `judged: 'normal-1-3'` in stageTable.ts with judgedTable.test.ts (tried: 24 of 24 clean); the seed list; merge
   t-13-proof's bot fixes over this head. `library13.ts --flown` is retired (1-3's sections are `own`).
5. **F13 / ART-W1B:** the rope's posts are made things: a vine between two living trunks. **ART-W1:** the painted traps.
6. **The lead:** a 5-line brief for a drop-trap journal page was asked of me and is NOT written. Easy's own kind per socket (ruling 1).
**NEVER check out ec0a4712..7d9efa0d** (a tracked `node_modules` symlink, my mistake; 8e8ba364 and later are clean).

## What was built today (each rule from a planted failing test)
- **The kit in the engine, by data.** A brief names its cast -> `proto.cast` -> the engine's `startCast()` -> `castPlay.ts` steps
  those animals with his stillness, cover and (from World 2 on) landing noise. No cast named: nothing changes.
- **The snake** (Matt, R-165.141): shy, rears 0.5 s before it strikes where he WAS (a full run is never bitten). Every ending is
  the glide: a punch at its log's end, a stomp, a kick, a trap. A punch mid-log shoves it 70 px and dazes it.
- **Drop traps as bricks**: a vine or a tendril, a hive or a stone; 0.3 s of creak, the fall, every cast animal on that ground within
  170 px glides off, away from him. The builder refuses a trap with no handle, over nothing, out of reach, or behind a pickup.
- **1-3 is in World 1's SHIPPED kit** (`w1Arc13.ts`); hand-built 1-3, its section table and its test are deleted. ONE graph
  `A T P M R X R W R S R C E`, one piece a beat, EVERY piece its own (7 beats, an arrival, 4 rests, an exit): none of World 1's library.
- **This afternoon:** Dot's trap line is a TEACH line said 800-1,100 px before the first vine; Easy keeps every trap (new
  `Socket.easy 'stay'`); a rope before the totem that is never the way (new place option `free`: its hollow one hop deep); every
  snake on a real painted LOG, a sleeper right under its load; 1-3's own arrival and rests; the keeper's mission line in stagePlan.
- **Engine changes, all general and data-driven (no stage id):** `GraphBrief.cast`, `GraphBrief.dealExact`, `Socket.easy 'stay'`,
  rope place `free`, a spawn hook's re-seated animal carries its fill, `isW1Stage` asks the section tables.

## Numbers (head named in the last push; times ET)
| what | result |
|---|---|
| 1-3 rolls, shipped kit, seeds 1-24 | **CLEAN 24 of 24** on Normal and on Easy, 0 thrown; every roll the same 13 beats in order |
| a roll (523affd6) | Normal 15 snakes (5 asleep), 11 traps, 215 s typical / 168 s fast. Easy 13 snakes (4 asleep), 11 traps, 210 s / 165 s |
| bots (P13's castBots), seeds 1-6, aa98fbc3 | every tier PASS 6 of 6 on both settings. First trap sprung: child 6+6, middle 6+6, expert 6; adult 1+2, kid 0+0 (the bot's stop, P13). Fastest run: adult Easy 126.2 s, adult Normal 131.8 s: no tier under 2:00 |
| funcheck, 1-3 | "looks like an earlier stage" 0 of 16 layouts (was 6), "looks like the stage before" 0 (was 16), padding 0 (16), repeat 0 (11). "Nothing bites" 16 (known 13): it counts what a missed jump costs; this level's risk is the strike |
| whole suite on 26f72b31 (the move) | 2987 tests, 8 red, all from the move, all fixed at cause (2 were real bugs: a second visit to a cleared 1-3 threw; the journal's Sleeping snakes page waited on a deleted line) |
| lock, 16 layouts vs 0.9.6, aef439d1 | **101 of 102 unchanged; only 1-3 changed** (intended: it is the new stage) |
| gates on the FINAL code | **not finished: see the turnover, item 1** |

## Polish check
Judged by me on the real game, upright and sideways, at 219502e1 (9 traps): the lesson (vine at his hand, hive beside a snake asleep
on its log, one upright screen), the trap falling, the glide, after; the perch; the gallery; a bare log; the rests; the rope. On the
final geometry only traps 0, 3 and 5 were re-shot (the turnover, item 2) and I looked at none of those 24 before stopping.
**Rough, named:** stand-in trap art; sideways the trap's leaf clumps brush the goal sign's rim; an awake snake can be where its load
lands; the rope's wooden posts; the kid first-timer bot's long walk back (before the goal became every trap: not re-measured).

## Mistakes of mine today, and the standard each one changed
- **A tracked `node_modules` symlink** (ec0a4712..7d9efa0d): I worked in a second worktree with a linked node_modules and committed
  with `git add -A`. `.gitignore` now ignores the name as a folder or a link; I commit by path in a side worktree, or not at all.
- **Pushed 5e6873b5 with three red tests** (Easy had lost its sleepers): I ran the test and committed in one command without
  reading the result. Fixed at 87069d9d eleven minutes later. I read the test's count before `git commit`, not after.
- **A flag on a snake's log, a green hedge for a log, a one-way hollow before a purge's shrine:** each found by rolling, by a
  still and by a bot BEFORE the push, and each now a test or a planted fault (LEVEL-BAR "Found while making 1-3").

## Method update
`reference/methods/predator-kit.md`: wiring a cast, and today's pitfalls (a block ON a piece is `main` unless told; World 1 paints
a thin block as a log and a thick one as a hedge; a spawn hook that moves its animal must carry the fill; Easy takes Normal's kinds).
A level is DESIGNED first (`reference/design/<stage>.md`, scored on LEVEL-BAR.md), then built as one graph with one piece a beat,
then PLAYED by the bots and LOOKED AT on stills before anyone is told it is done.
