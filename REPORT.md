# W1C: World 1's creatures and traps in the real engine, and 1-3 designed, built and in the game. `t-w1-creatures`, 2026-11-12 ET
No PR (the lead's brief). INT-E's report is at reference/qa-reports/INT-E/REPORT.md. Times are pasted from `date`.

## EXACT NEXT STEP (kept current at every push; a builder can carry on from here with nothing lost)
1. **Read first:** `reference/design/1-3.md` (the level as designed and built, its rules, and what is not at the bar) and
   `reference/design/LEVEL-BAR.md` (1-3 scored; "Found while making 1-3").
2. **See it:** it is the real stage now. `npx vite --port 5199`, then
   `PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/runs/trap-stills.mjs 5199 <out> game 1-3 1 <trap 0-8>` and
   `tools/engine/runs/stills-at.mjs 5199 <out> game 1-3 1 <x>:low`. Bots: `npx tsx tools/inspect/castBots.ts --stage 1-3 --seeds 1-6`.
3. **NEVER check out ec0a4712..7d9efa0d** (they carry a tracked `node_modules` symlink, my mistake: it replaces the real folder with
   a link to itself; `rm node_modules && bun install --frozen-lockfile` mends it). 8e8ba364 and later are clean.
4. **Owed by P13:** the first-timer bots' stop at a trap handle (they decide at the vine and walk on about 220 px; trace sent);
   1-3's `judged: 'normal-1-3'` in `stageTable.ts` and its seed list; "excuse me" on the first punch-glide (`W1_CAST_SAID.punch`).
5. **Owed by the lead / Matt:** the story keeper's eye on the survey chip names (ctestStretches.ts, 7 phrases); a moves-journal
   page for drop traps (new player words); the ruling-1 engine change (a socket names its own Easy kind) so Easy's own sleepers show.
6. **Owed by ART-W1:** the painted traps (`reference/art/W1-TRAPS-LIST.md`); told at 1:53 PM what moved under them.
7. **Re-roll under t-11-pass** when the lead says it has passed (all of this ran on t-int-engine @d0276817 + P13's t-13-proof).

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
| a roll | Normal 13 snakes (4 asleep), 9 traps, 203 s typical / 159 s fast. Easy 11 snakes (3 asleep), 9 traps, 197 s / 155 s |
| bots (P13's castBots), seeds 1-6, aa98fbc3 | every tier PASS 6 of 6 on both settings. First trap sprung: child 6+6, middle 6+6, expert 6; adult 1+2, kid 0+0 (the bot's stop, P13). Fastest run: adult Easy 126.2 s, adult Normal 131.8 s: no tier under 2:00 |
| funcheck, 1-3 | "looks like an earlier stage" 0 of 16 layouts (was 6), "looks like the stage before" 0 (was 16), padding 0 (16), repeat 0 (11). "Nothing bites" 16 (known 13): it counts what a missed jump costs; this level's risk is the strike |
| whole suite on 26f72b31 (the move) | 2987 tests, 8 red, all from the move, all fixed at cause (2 were real bugs: a second visit to a cleared 1-3 threw; the journal's Sleeping snakes page waited on a deleted line) |
| lock, 16 layouts vs 0.9.6, aef439d1 | **101 of 102 unchanged; only 1-3 changed** (intended: it is the new stage) |
| gates on the FINAL head | see "Gates on the final head" below |

## Gates on the final head
GATES_PLACEHOLDER

## Polish check (the real game, stage 1-3, layout 1, Normal: reference/qa-reports/W1C/stills/, upright and sideways)
POLISH_PLACEHOLDER

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
