# EN-Y report, Engine, 2026-11-11 (stop 9:20 PM ET). Branch t-engine-yield (base release-0.9.6@06bbd29f, main merged)
Four streams on one branch: A the yield, A2 the quiet line in the search, B any stage by data + hurt floors, C travel as a mode
(B, C: helpers). No rule, verdict threshold or STAGE-RULES number changed. All 200 proven 1-1 seeds lay the stage they laid before
(`seedlist 1-1 --check` PASS after every step; nothing re-recorded). No stage id, seed or x literal added to engine code.
## The numbers (1-1, 200 fresh seeds a range; `npx tsx tools/engine/yield.ts 1-1 --par 4 [--list] [--from N]`)
| | 0.9.6 | now |
|---|---|---|
| CLEAN (no gen2.errors), 50001-50200, Normal / Easy | 9% / 2% | **57% / 55%** |
| CLEAN, 70001-70200 (held out, never tuned on) | 10% / 3% | **58% / 54%** |
| LISTABLE (clean + the list's quiet line 4 s + squirrels), 50001-50200 | 0 of 200 | **67 Normal / 65 both (33%)** |
| LISTABLE, 70001-70200 (held out) | not measured | **55 / 55 (28%)** |
A's target (50% clean) is met. **A2's target (50% listable) is NOT met: 33% / 28%.** What blocks it is named below.
## What was built
- **A (pipeline.ts):** the search judges every refusing rule before it takes a plan (`rollUnmet`) and repairs or re-rolls; the deal
  knows the pool (`supplyDeal`, `unfilled`, `poolFits`); the lay keeps scarce sections (`leftShort`); V19b is repaired from the gate's
  numbers (`windowFix`, `lift`); a roll after a refusal paces its climb (`pace`: reserve rise, steer the join's kind).
- **A2:** `BuildRequest.also`, rules a caller holds a roll to; `tools/engine/listRules.ts` is the quiet line as that rule (tool-side,
  0 bytes shipped). seedlist.ts builds AND checks under it; `yield.ts --list` measures listable. The deal also weighs the stage's
  least climb against the corridor; a late descent's rise is reserved; a rise that ended short is lifted by what it lacked.
- **B (helper, E12):** item 1 DONE (`gen2/listed.ts`, one table; seedlist and yield take any listed stage). Item 2 PARTLY: hurt floor
  typed, laid and hurting in the real engine (Normal a heart, Easy the blink), `hazard.untaught` verdict; NOT drawn (World 1's
  painter in w1Pits.ts), no still. Item 3 PARTLY: `reach.ts` JUDGED table, promises name no stage; 1-2's own rows not entered.
- **C (helper, EN-T):** DONE. `stageModes.ts` (right, left, up, down, stay); travel is data (`LevelConfig.travel`); the engine's exit
  wall, flags, bar and help ladder ask the mode. Camera lead not wired (it would change every stage's camera).
## What the numbers hide (pushback, read this)
1. **Listable is capped by the pool and the graphs, not by the search.** Listable by graph (50001-50200): sprint-A 36 of 55,
   sprint-B 19 of 51, sprint-C 10 of 51, **sprint-D 0 of 43**. More re-rolls buy nothing (6 vs 14 measured: the same).
2. **Two sections cap it:** w1-stair-test-back and w1-bank-stair-test-back always break the quiet line, so a test node dealt
   "climb" has only the two 416 px stairs, which do not fit the corridor. With those two out of 1-1's pool (measured test-side):
   **93 of 200 listable (46%)**, sprint-D 0 -> 17 of 43. That is Content's data and it needs the list rebuilt: your call.
3. **Graphs over the corridor by structure:** sprint-B with its climb node kept needs 1,127 px of climb in a 900 px corridor and
   the 40% cap leaves no legal re-typing (1 listable in 30). sprint-C's late descent needs a signature that climbs back 190-275 px
   and only two sections can. Designer: more rising signature pieces, or re-cut graph B. This is Matt's "more pieces" rule.
4. **Main chunk 3,995,414 B, 1,110 B OVER chunkcheck** (base 3,982,950; A+A2 +7,750, B +3,200, C +1,100, the rest 400): red until R-165.112.
5. **Types touched, for the Architect:** `BuildRequest.also`, `GraphBrief.pits`, `CodeRules.known` (mine); `hurt`, `hurtFloor`,
   `Platform.pit 'hurt'` (B); `LevelConfig.travel` (C). **Proven list held at a price:** pacing only after a refusal, and the
   climb line 80 px above its natural place (980) so two proven deals stay; both go at a list rebuild.
6. **buildcheck fails on the untouched base in this container too** (p95 163 ms base, 155 here, limit 150): run it once on CI.
## Your question (why 42 hand-authored sections) and the fix, STARTED at 8:30 PM on your word
A section is a shape welded to one stage: `feel` names stage ids, and its hazard, pickups and heights are baked in. 17 of the 42
are the SAME shapes re-cut for thorns and petals. It is not the shapes: the Designer's 1-2 probe on stand-in copies of real
sections lays 720 of 720 rolls with no throw, 117 of 120 a graph structurally clean.
- **DONE, the hazard is the brief's:** `GraphBrief.pits: 'hurt'` and the lay puts the world's hurt floor under every section pit
  past `clearStart`, no mark on any section. Proof, test-side (briefPits.test.ts): 1-1's OWN sections on 12 proven plans, same plan
  and pieces, a hollow under their pits. It found a bug in B's floor: the hurt line stayed behind when a rolled stage is moved
  down whole (every World 1 stage). Fixed.
- **NEXT for the Opus builder, in order:** (a) pickups by brief = packet E12 item 6 as written (`offRoad`, `petals: 'low'`,
  `bloomSprite`: three brief fields, its fixture test named there). (b) the seam's pit (`pitUnder` at a 'pit' join) and a `soft`
  jump under the same `pits` rule, each with a briefPits case. (c) `hazard.untaught` needs a showing piece: one small "see the
  thorns" section per world, the only authored brick the hazard needs. (d) `feel` as an exclusion list (stagePool).
## Gates on the head
PASS: tsc; seedlist 1-1 --check (200 seeds, after every step); **stage lock 102 of 102 unchanged** against main (`lockall --layouts
2`; its first run caught 1-1's graph record hashing differently by field order alone: fixed, tested); gen2+worlds 371 of 371 on
the merged head, and every test file touched since (builtOnArcs, briefPits, hurtFloor, nodeCode, verdicts, petals: all pass).
FAIL: chunkcheck (above). Not run: drawcheck, clipcheck, the suite outside gen2, stills (nothing new ships: Play draws the list).
## Exact next step
1. Land R-165.112, re-run chunkcheck. 2. Decide pushback 2 (park the two test-backs, rebuild 1-1's list under `also`). 3. B's item
2 "drawn": w1Pits.ts reports a `pit === 'hurt'` floor and paints the manifest's art. 4. E12 item 5's other half: the double
counted by the built stage (five readers of `doubleAllowed`); `builtOnArcs` (reach.ts, DONE: your step-4 trap) is the pattern.
5. Then 1-2's JUDGED line and rows. Done here for 1-2: V3 reads `lessons` (probe 0/13/0 -> 118/117/117 clean of 120).
