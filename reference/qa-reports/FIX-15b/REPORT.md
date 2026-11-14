# FIX-15b REPORT: 1-4 fig gate, no getting ABOVE a shut bough (R-165.212). Branch t-fix-15b from origin/t-fix-15 (8afe53a9).
Engine member, Opus 5.5. 1:34 PM to 2:37 PM ET 11-14. **GREEN for what the lead's ruling ships (message queued 2:02 PM ET): the gate's own
flag waits for the gate, on FIX-15's solid bough.** The lay rule is NOT applied (PUSHBACK.md: it leaves 1-4 unrollable). Option A is the
EXACT NEXT STEP, shown first in two mock stills. Code head 967344cb (later commits are the report, the notes, the mock tool and the stills).

## 1. Done-items
- **The gate's own checkpoint flag** (FIX-15 next step 3): `FieldPlay.flagWaits(x, y)` says a flag standing on a SHUT gate's bough, or on a
  bough held with it (on its line, over its span), waits. The engine's claim loop asks it (engine.ts, one condition, asked only inside a
  flag's reach; no allocation). No stage id, no x. Planted `fieldGate.test.ts` "a flag on a shut gate's own bough waits for the gate", both
  settings, the first layout of 0-15 with a flag on a gate. He stands on the shut top where it is highest inside the flag's reach, then 60,
  100 and 140 px over the flag, 30 frames each: unclaimed. Then the engine's own tear opens the gate and he stands on the bough: claimed.
  **Red on today's engine:** `normal layout 0 gate 4: the flag on the shut bough was claimed from its top`. **Green with the fix.**
- **The scoped gates on 967344cb** (the lead's standard, message queued 1:54 PM ET): `tsc` exit 0. Full unit suite `# tests 3407`,
  `# pass 3405`, `# fail 0`, `# todo 2` (both already in the suite before this change). generalitycheck `PASS`. `seedlist 1-4 --check`: `PASS (100 seeds, each clean on
  both settings)`, verdicts refuse 0 of 100. castBots 1-4 `--seeds 1-12 --setting both`: the 9 summary lines are IDENTICAL to base
  8afe53a9 (`diff` empty; castbots-*.txt): kid 9/12 N, 10/12 E; adult 12/12 both; child 2/12, 4/12; middle 6/12, 7/12; expert 7/12 N.
  No roll moves (tower.ts untouched), so there is no relist and no re-pin.
- `tools/engine/gatereach.ts` (the exposure measure) reproduces FIX-15's `192 gates; LOW 48; ONTO 93`. The lay rule is kept NOT applied
  (lay-rule-NOT-APPLIED.patch: `sealedRoom`/`sealedNear`, one predicate for lay and verdict; planted red: `the catch at x 786-966, y 2100 ...`).
- **Option A, shown first** (mockA.mjs, the real page, 1-4 layout 1 Normal, gate 196-716 y 2300, its catch 942-1122 y 2339; the engine's own
  `with` hold and its own tear): **mockA-side.jpg** (shut above, open below) and **mockA-up.jpg** (shut left, open right).

## 2. Polish check
- mockA-side: shut, the thatch and figs on the gate, nothing on the right. Open, the thatch is off and the bough is back at the right. Reads at a glance.
- mockA-up: shut, the gate's end with a fig, Pokey on the foot, empty air to the right. Open, the bough comes in at the right edge (cut by
  the 440 px view; it is 180 px long). Pokey's halfway story card is hidden in the mock (`.dg-bub`), because the stand-in placing set it off.
- **Found on the first shot:** a bough held with a gate is `broken` (no footing) but the ground painter STILL draws it: wood he would fall
  through. The mock hides it the way the gate's own bough is hidden (`art: 'hidden'`). Option A needs the same in the engine.

## 3. Pushback (PUSHBACK.md; sent about 2:02 PM ET)
- The packeted lay rule: fresh seeds 1001-1040 clean **0/40 Normal, 0/40 Easy** (base 40/40); every roll is refused by towerFalls. The storey above
  each gate hangs open ends 28-32 px past the gate's ends, and every catch the 450 px fall limit allows under them is inside a double jump
  of the shut top. The head-room half alone rolls 20/40, 18/40.

## EXACT NEXT STEP: option A (the lead puts it to Matt first)
1. ARCHITECT: the laid stage names each catch the lay hung beside a sealed piece (gen2.tower, e.g. `held: [catchId, gateId][]`).
2. ENGINE (tower.ts, from lay-rule-NOT-APPLIED.patch): the lay keeps refusing LOW wood (under the span with less room than `sealedRoom`); it
   records the ONTO catches instead of refusing them, and towerGates skips held wood. The painter skips a held bough while its gate is shut
   (the finding above), with a planted still.
3. CONTENT or the level builder (w1Arc14.ts finish14): add those ids to the gate's `with`.
4. ENGINE: yield first (`yield.ts 1-4 --count 40`, expect about the head-room half's 45-50%). Then `seedlist.ts 1-4` (100 seeds), the
   full suite, and every pin re-taken once against the final list (level.md rule 20). gatereach shows ONTO 0 and LOW 0 (held wood not
   counted). castBots 1-4 both settings. The `gateover` clips print `never` twice.

## 5. Unresolved: ONTO (93 of 192 gates) and LOW (48) stay in 1-4's rolls until A ships (he cannot go on from the shut top; its flag waits).

## Method used, lessons applied, misses
- Method: stage-fix.md (cause first, planted red before the fix, the same layouts measured before and after).
- Lessons: D19 (one predicate for the lay and the verdict), D21 (both settings, both orientations), D29 and level rule 20 (no re-pin: no
  roll moved), D40 (no relist on a lay about to change), D41 (drawn height 89), D43 (generalitycheck PASS), D57 (queue read before every
  push and send), D63/D69 (the mock judged on its own frames: the first shot was wrong twice, fixed), D67 (background tasks, no wait loops).
- **Misses:** (1) my pushback said "2:03 PM ET", not read from `date` in that step (countermeasure: a time in a message only from `date`
  in the same command). (2) An "after" exposure run before the relist replayed old seeds through the search fallback; stopped.

## 6. Method update (stage-fix.md)
- Before building a lay rule, run `yield.ts --count 40 --par 4` (35 s) with it on: 0% is a geometry conflict to push back on. Mock stills on
  a paused page: aim, then `e.render()` before the shot (a paused page redraws only when stepped).

## 7. Turnover notes
- planner.md (gate-neighbourhood bullet, with the painter trap) and engine-core.md (0k's FIX-15 bullet) rewritten: 57482169 and this report's commit.
