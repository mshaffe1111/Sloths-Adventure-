# EN-Y report, Engine, 2026-11-11 (stop 9:20 PM ET). Branch t-engine-yield (base release-0.9.6@06bbd29f, main merged)
One branch holds four streams: A the yield, A2 the quiet line in the search, B any stage by data + hurt floors (helper), C travel
as a mode (helper). No rule, verdict threshold or STAGE-RULES number changed. All 200 proven 1-1 seeds lay the stage they laid
before (`seedlist 1-1 --check` PASS after every step; nothing re-recorded). No stage id, seed or x literal added to engine code.

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
4. **Main chunk: 3,995,019 B, 715 B OVER chunkcheck's limit** (base 3,982,950: A and A2 +7,754, B +3,198, C +1,117). Red until
   R-165.112 lands, as you ruled.
5. **Types touched:** `BuildRequest.also` (types.ts, optional) is mine; B added `hurt`, `hurtFloor`, `Platform.pit 'hurt'`; C added
   `LevelConfig.travel`. The Architect should read all three.
6. **Proven list held at a price:** pacing runs only after a refusal, and the climb line sits 80 px above its natural place (980)
   so two proven deals stay. Both go away at a list rebuild.
7. **buildcheck fails on the untouched base in this container too** (p95 163 ms base, 155 here, limit 150): run it once on CI.

## Your question: why 42 hand-authored sections, and what would make a stage take hours
A section today is a shape welded to one stage: its `feel` names stage ids, and its hazard, pickups and heights are baked in. 17
of the 42 are the SAME shapes re-cut for thorns and petals. Proof it is not the shapes: the Designer's 1-2 probe on the fixed
generator (stand-ins = copies of real sections) lays 720 of 720 rolls with no throw, 117 of 120 a graph refused only by V3.
To get to hours: (1) the hazard under a gap, the pickup kind and the trend become the BRIEF's, applied by the lay (B's `hurt`
flag as a brief-level swap), so own versions vanish; (2) sections are picked by what they need and teach, `feel` only excludes;
(3) each stage adds 5-8 twist bricks for its signature; (4) the list builds itself (33% listable now, was 1 in 300).

## Gates on the merged head
PASS: tsc; 110 of 110 tests in every file the three streams touched; seedlist 1-1 --check. A's code alone: gen2+worlds 350 of 350.
LOCK_AND_SUITE_PLACEHOLDER
FAIL: chunkcheck (above). Not run: drawcheck, clipcheck, the full suite outside gen2, stills (nothing new ships: Play draws the list).

## Exact next step
1. Land R-165.112, then re-run chunkcheck. 2. Decide pushback 2 (park the two test-backs, rebuild 1-1's list under `also`).
3. B's item 2 "drawn": w1Pits.ts reports a `pit === 'hurt'` floor and paints the manifest's art. 4. B's trap: levelCheck
validateFor, stageGenerator finishReach and petalPass ask `judgedOnArcs(config.id)`; make them ask the built stage BEFORE entering
1-2's JUDGED line. 5. Node code must read the manifest's `lessons` (V3) or 1-2 lays nothing. Turnover: engine-core.md §0d.
