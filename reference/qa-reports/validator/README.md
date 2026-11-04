# The fun validator, World 1: report (fix-petals, fun-validator)

Gates run on **3495372a** (2026-11-04, finished 10:20 AM ET). Each line below is pasted from the command's own output.
3495372a is later than 14777165 (the gate's code commit); the commits after it change only docs and notes.

## Gates
| Gate | Line from its output |
|---|---|
| `npx tsc --noEmit -p .` | exit 0, no output (no errors) |
| test globs (CLAUDE.md, one run here; CI runs them in shards in deploy.yml) | `# tests 2295;# pass 2293;# fail 0;# cancelled 0;# skipped 0;# todo 2` (exit 0; #1949 is an existing TODO: 4-3's boulder fixer) |
| `npx vite build` | `✓ built in 21.27s`, exit 0; files in dist over 4 MiB: 0 |
| `node tools/perf/artcheck.mjs` | `PASS` |
| `node tools/perf/knowncheck.mjs` | `PASS` (lines below) |
| `npx tsx tools/validate/funcheck.ts` | `PASS (152 known, 2072 stage-layout flags, World 1, 16 layouts, Normal and Easy; 51 s)` |
| `node tools/perf/clipcheck.mjs` | `PASS (83 known) (234 s; contact sheet and breaches.json in /tmp/clipcheck-V9FYCP)` |
| `node tools/perf/drawcheck.mjs` | `PASS (380 s; raw results in /tmp/drawcheck-9kmj1b)` |
| `npx tsx --test tools/validate/validate.test.ts tools/validate/world1.test.ts` | `# tests 29;# pass 29;# fail 0` |
| roadmapcheck | not on this branch (`ls tools/roadmapcheck.mjs`: No such file or directory) |
| CI | Gates workflow run 41848331105 on 14777165: conclusion **success** (artcheck, knowncheck, funcheck "PASS (152 known, 2072 stage-layout flags, World 1, 16 layouts, Normal and Easy; 38 s)", clipcheck "PASS (83 known) (238 s ...)", drawcheck) |

knowncheck's output:
```
known-list check against 1dc39cd7
✓ tools/perf/clipknown.json: 44 entries
✓ src/game/playerText.known.json: 4 entries
✓ tools/perf/limits.json: 14 entries
  tools/validate/funknown.json: new list (2072 entries), not on the base yet
✓ src/game/artUse.allow.json: 276 entries
PASS
```

## What this job delivered
- The validator (tools/validate/) and its pages here: one per World 1 stage, the overview (index.html), the mechanics-in-use table (mechanics-world1.md, R-150.4), stills per flag. Accepted by the quality supervisor (7909cf11, PASS) and the lead.
- The first-timer bot's mushroom bounce (tools/inspect/firsttimer.ts, route.ts): World 1, seeds 1-3, kid and adult, rescues 418 -> 194, shrines 31 -> 35 of 54; Worlds 2-10 flat (1,844 -> 1,812). Fixtures in src/game/firstTimerBot.test.ts fail on the old bot (0 of 5 up without a rescue) and pass on the new.
- 5-9's kid runs re-measured (src/game/gen2/game.ts KID_RUNS_59: 8, 3, 3, 5, 7, 5; median 5, the Easy goal unchanged; the lead accepted it).
- The fun gate (tools/validate/funcheck.ts + funknown.json): World 1's structure flags may only shrink; in gates.yml, CLAUDE.md, gates.md, tools/README.md.

## Method used
reference/methods/validator.md (D15: every check gets a world built to fail it and one built to pass it before it scores a real stage; D19: the real engine and builders); reference/methods/gates.md "Adding a new check" for the gate (run twice and compared, baseline frozen as a shrink-only known list, knowncheck entry, proven on a real CI runner); D23 (re-merged the lead branch before judging).

## Lessons applied
- D15: four of the supervisor's REDOs were bugs in the ruler (climb time counted as walking, the chase sharing a letter, a "bites" label on a run never crossed, backward hops counted as missed jumps); each was fixed in the tool with a failing fixture, never by moving a threshold.
- D20: every number and id here was pasted from output.
- Law 5: the gate starts with World 1's debt only as a shrink-only list with an owner (D26, the World 1 rebuild).

## Method update
validator.md: step 5 (the gate); six pitfalls (a step is a start, not a duration; outrun or unseen is decoration; one letter, one thing; moves alike vs looks alike; name a number by what the code computes; re-run every play number after a bot change); "to try" (carry every taught move between stages; Worlds 2-10 in the gate; the play checks in the gate once the bot's step-down rule is fixed). gates.md: row 10, how to read a funcheck breach, funknown.json among the known lists.

## Rough spots, named
- The bot counts a step down from a stump top to the floor (76 px) as a missed jump ("ended over 60 px under the take-off"): it drives the clumsy-thumb flags at 1-1 x 1380 and 1-2 x 15435 (bot-fix's).
- 1-1, kid, seed 1: the bot misses a double between the branches and cannot walk back to the mushroom (15 rescues); 1-4's rescues (58) are climbs, unchanged.
- World 2 lives lost rose 414 -> 464 with the bot fix (it doubles more, so more river falls); named, not chased.
- 1-2's sunk step shows a pale rectangle at its edges, upright and sideways (game art; passed to the lead's defect log by the quality supervisor).
- Stills place Pokey by hand, so a moving hazard (1-8's collapse) has no still; its on-screen share is measured from the run's own camera.
- The gate holds structure checks only; the play checks (hold-right probes, first-timer and clumsy bots) stay on the pages.
