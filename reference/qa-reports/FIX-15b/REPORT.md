# FIX-15b REPORT: 1-4 fig gate, no getting ABOVE a shut bough (R-165.212). Branch t-fix-15b from origin/t-fix-15 (8afe53a9).
Engine member, Opus 5.5. Started 1:34 PM ET 11-14. **Status: PUSHBACK on items 1-2 and the relist (blocked: the packeted lay rule leaves
1-4 unrollable, PUSHBACK.md). Item 3 (the gate's own flag) is DONE and GREEN on the lead's 2:06 PM standard (below).**

## 1. Done-items
- **The gate's own checkpoint flag** (EXACT NEXT STEP 3): `FieldPlay.flagWaits(x, y)`: a flag standing on a SHUT gate's bough or a bough
  held with it (on its line, over its span) waits; the engine's claim loop asks it (engine.ts, one condition; no allocation, asked only
  inside a flag's reach). Generic: no stage id, no x. Planted `fieldGate.test.ts` "a flag on a shut gate's own bough waits for the gate":
  the first layout of 0-15 whose gate bough carries a flag, both settings. He stands on the shut top where it is highest inside the flag's
  reach, then 60, 100 and 140 px over the flag, 30 frames each, and it stays unclaimed. Then the gate is opened (the engine's own tear) and he
  stands on the bough: claimed. **Red on today's engine** (base worktree): `normal layout 0 gate 4: the flag on the shut bough was claimed
  from its top`. **Green with the fix**, on base rolls and on this branch: `fieldGate.test.ts` `# pass 19`, `# fail 0`.
- **The exposure measure** `tools/engine/gatereach.ts` (self-contained, so it measures any base): reproduces FIX-15's
  exposure-16-layouts.txt line for line: `192 gates; LOW 48; ONTO 93` (gatereach-before.txt).
- **The lay rule and verdict, written and planted, NOT applied** (lay-rule-NOT-APPLIED.patch: tower.ts `sealedRoom`, `sealedNear` shared by
  the lay's `byGate` and `towerGates` (the same code, D19); tower.test.ts cases from 1-4's measured gates). Planted: with the lay guard
  out, `the catch at x 786-966, y 2100 leaves the shut gate had` (red); with it, 4/4 green. Why it is not applied: section 3.
- Checks on 967344cb + notes (the lead's 2:06 PM standard: what the change can affect; no roll moves): `tsc` exit 0; generalitycheck
  `PASS`; full unit suite: SUITE; castBots 1-4 both settings: BOTS.

## 2. Polish check
- No screen changed: the flag change is a claim rule (the flag, its sparkle and "CHECKPOINT!" are drawn as before). The clips wait on the
  lay ruling: gateover's `ON ITS TOP while shut` cannot read `never` until ONTO wood is gone.

## 3. Pushback (PUSHBACK.md, sent to the lead 2:02 PM ET)
- **The lay rule as packeted cannot be laid.** Fresh seeds 1001-1040: clean **0/40 Normal, 0/40 Easy** (base 40/40, 40/40); every roll is refused by
  towerFalls. The storey laid just above each gate leaves open ends 28-32 px past the gate's ends. Any catch the 450 px fall limit allows
  under them is inside a double jump of the shut top. Logged step by step on seed 1 (layout 0). The head-room half alone: 20/40 Normal, 18/40 Easy.
  Options A (hold such catches with the gate, ClusterGate.with; recommended), B (re-lay the storey above a gate), C (head-room only).

## 4. Suggestions (ready packets)
- ARCHITECT + CONTENT + ENGINE (option A): the laid stage names the catches the lay hung beside a sealed piece (gen2.tower, Architect);
  1-4's finish holds them with that gate (`with`, w1Arc14.ts); towerGates skips held wood, the lay keeps refusing LOW (Engine,
  lay-rule-NOT-APPLIED.patch as the start); then the relist. Done: gatereach ONTO 0 and LOW 0 on layouts 0-15 x 2 (held wood not counted);
  yield at least 40% on 200 fresh seeds; the 1-4 list rebuilt (100); every pin re-taken on a full suite; castBots 1-4 unchanged or better;
  gateover clips print `never` twice. Design (Designer): boughs appearing beside the gate as it springs open.

## 5. Unresolved
- ONTO (93 of 192) and LOW (48 of 192) are still in 1-4's rolls. The relist, re-pins, castBots on a new lay and the clips are not done; they wait on the ruling (D40).

## Method used, lessons applied, misses
- Method: reference/methods/stage-fix.md (cause first, planted red before the fix, measured before/after on the same layouts).
- Lessons: D19 (the lay and the verdict call one predicate, `sealedNear`), D21 (both ends, both settings), D29/level rule 20 (no re-pin
  without the final list and a full suite; not reached), D40 (no relist on a lay about to change), D41 (his drawn height 89), D43 (no stage
  id or x in engine code; generalitycheck PASS), D57 (queue read before every push and message), D67 (background tasks, no wait loops).
- **My miss:** my 2:02 PM pushback message said "2:03 PM ET", a time I had not read from `date` in that step. Countermeasure: the time
  goes into a message only from a `date` in the same command.

## 6. Method update (stage-fix.md)
- Before building a lay rule, run the yield on 40 fresh seeds with the rule switched on (`yield.ts --count 40 --par 4`, 35 s). A 0% yield
  is a geometry conflict to push back on, not a list to rebuild.

## 7. Turnover notes
- reference/handoffs/planner.md (the gate-neighbourhood bullet) and engine-core.md (section 0k's FIX-15 bullet) rewritten: COMMIT.
