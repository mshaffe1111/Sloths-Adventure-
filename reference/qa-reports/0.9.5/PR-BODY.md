# Release 0.9.5: a brand-new first stage (gen2 1-1)

**Candidate:** `release-0.9.5` @ `bf3684ec147b888714fc71be9ec25c6afcd361fc` (the commit Matt played on the test link). Later commits on the
branch are notes only.
**Matt played it five times, said it felt great, and asked for it to be released and merged** (relayed by the lead, 6:20 PM ET 11-06).

## What changed, in plain words
- **1-1, Into the Canopy, is built all over again** by the new stage engine (gen2), from World 1's kit. Each press of Play takes a
  different stage from a list of proven layouts, so it's laid out a little differently every time, and no layout repeats until the whole
  list has been played on that phone. A restart or a respawn keeps the same layout.
- Dot's new lines on 1-1 (Matt's approved words), and the double jump taught by Dot at the teach.
- Gen2 1-1's own art and touches: pit pockets drawn as soil hollows, the end log as one painted log, squirrels.
- **Old 1-1's builder is deleted** (new replaces old), with Matt's test-link picker (Old 1-1 / Roll A-C). There is no switch back.
- Nothing else in the game changes: the lock proves every other stage identical to 0.9.4 (below). 1-5 stays exactly as it is live
  (its rework waits, R-165.45); 4-9 is untouched.
- What's New (top entry, 0.9.5): "A brand-new first stage": "Into the Canopy, the very first stage, is built all over again." /
  "It’s laid out a little differently every time you play." / "Dot has new things to say as you climb."
- The testers' page (#ctest) now plays gen2 1-1 with its recorder and survey; it opens only in QA builds, never in the shipped game.

## Merged into this branch
- origin/main 68b31e66 (0.9.4)
- engine-core 94a31ca0 (its final), which contains engine-chunks 25d2d115
- tester-page 4320a9b25 (the lead passed it 11-06 5:01 PM ET)
- the old-1-1 deletion (`reference/qa-reports/0.9.5/old11-delete.py`) and the release prep (version, What's New, funcheck's list from
  main: `release-prep.py`)

## The gate, on bf3684ec
| # | Gate | Result |
|---|---|---|
| 1 | `npx tsc --noEmit -p .` | PASS |
| 2 | the test suite, 3 shards | GATE-2 |
| 3 | `npx vite build`, no asset over 4 MiB | PASS: main JS 4,162,883 B (31.4 KB under 4 MiB), no file over 4 MiB |
| 4 | `npm run build:store` | PASS: "Store build check passed: dist has no tracking, ads, collector, service worker or outside addresses." |
| 5 | `node tools/perf/artcheck.mjs` | PASS |
| 6 | `node tools/perf/knowncheck.mjs` | PASS (vs 68b31e66: clipknown 44, playerText.known 4, limits 14, artUse.allow 210, 66 fewer than main) |
| 7 | `node tools/perf/clipcheck.mjs` | GATE-7 |
| 8 | `node tools/perf/drawcheck.mjs` | GATE-8 |
| 9 | `node tools/roadmapcheck.mjs` | PASS |
| 10 | `npx tsx tools/validate/funcheck.ts` | **FAIL, named and accepted** (below) |
| 11 | `npx tsx tools/engine/lockall.ts --layouts 16 --check tools/engine/lockall-main-0.9.4.json` | GATE-11 |

### funcheck: a named, accepted fail (Matt's acceptance; the lead's ruling 6:20 PM ET)
`FAIL (12 worse or new, 26 to lower or delete; 144 known, 1872 stage-layout flags; 60 s)`. The known list was recorded from main's own
World 1 (R-165.44) and is **not** lowered or re-recorded to pass (Law 5). Gen2 1-1 against live 1-1, 16 layouts each:
1. **No gentle intro** ("pacing"): Normal 13 layouts (live 8), Easy 11 (live 2); e.g. "the first 15 s already ask for more than 0.8 moves
   a second". A real open question: **next week's first fix, R-165.48**; tonight's tester data answers it.
2. **Dead walk**: 16 of 16 on both settings (live 14); e.g. "2.6 s of walking with nothing to do". Inside the 4 s quiet line bound today
   from measured data (the proven list holds every seed to it): R-165.49.
3. **Nothing bites** after 30 s: Normal 12 (live 4), Easy 8 (live 4); e.g. "80% of the beats after the first 30 s cost nothing when
   missed". Ruling A: 1-1 is a forgiving teaching stage with put-back zones, by design: R-165.50.
4. On stages the lock proves identical to live: 1-3 Normal "repeat" 13 (11), 1-9 Normal "repeat" 15 (12), 1-9 Easy "nothing new" 16 (13),
   1-6 Easy "repeat" new on 1 layout; 1-2 "nothing new" 14 (10), judged against the stage before it (now gen2 1-1). The validator didn't
   change, so the bot's play changed on identical stages; the planner proves checker-only or fixes: R-165.51.
Better than live: "padding" and "template repeat" on 1-1 gone (16 -> 0 both settings), and 26 counts lower across World 1.

## Google Play: PLAY-STORE-RULES §6
| # | Item | Proof / not checked, and why |
|---|---|---|
| 1 | Nothing under the bars, notch, camera hole or nav bar, both ways, foldable size | Menus: clipcheck (gate 7: every menu screen and pop-up, 412x915 and 915x412, fresh/old/finished saves, insets set). In play: the HUD code is unchanged from 0.9.4. **Not checked:** a foldable size (clipcheck has none) and in-play stills on gen2 1-1 (the lead's test-link walk) |
| 2 | Back does something sensible on the new screen | No new screen in the player build: the only new screen (Matt's picker) is deleted. Back's code (backStack, backGuard) is unchanged from 0.9.4 |
| 3 | Nothing new sent off the phone | build:store PASS (no tracking, ads, collector, service worker or outside address). The testers' recorder and its 6-letter random tester code (no device id) are QA-build only |
| 4 | Nothing loads from the web; airplane mode | build:store found no outside address; no new fetch or URL in src. **Not checked:** airplane mode on a real phone (no phone in the container) |
| 5 | Sound stops in the background; nothing keeps the phone awake | src/audio unchanged from 0.9.4; no wake lock or visibility code added |
| 6 | Leaving and coming back (and rotating) keeps the place | 1-1's layout is kept until the next press of Play, so a restart or respawn rebuilds the same stage (testlink1_1.ts playSeed); the order is stored under `sloth_play11_order` (try/catch: blocked storage keeps it in memory). **Not checked:** rotation and leave-and-return mid-stage on a real phone |
| 7 | No dead ends or placeholder screens in the store build | The test-link picker is deleted (no "Old 1-1" or `wm-pick11` in any built file); clipcheck walks every menu |
| 8 | Saves survive everything | No save format change: no new save key (`sloth_play11_order` is not save data; `sloth_qa_tester_id` is QA-only). **Not checked:** kill-at-the-worst-moment on a real phone (due before the closed test) |

## Rough spots, named
- The pad's two first-stage coach lines ("Push the pad to run", "Press Jump") are the old words, the same as live today (not a
  regression); new words with Matt next release.
- The main JS file is 31 KB under the 4 MiB cache limit. A tested contingency (gen2's seed data as its own chunk, 301 KB freed, no slower
  start at CPU x4) is ready for the next release: `reference/qa-reports/0.9.5/lazy-seeds.py`.
- 1-1's proven list holds 138 layouts (target 300, R-165.47).

## After the merge
Check "Publish game to the gh-pages branch", "pages build and deployment" and the gates job; the APK on the Releases page as v0.9.5-<run>.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FhBbYNbiMMD4wtzGED2iUK
