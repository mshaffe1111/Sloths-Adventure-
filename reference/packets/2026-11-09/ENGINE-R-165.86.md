# TASK R-165.86   to: Engine   model: claude-opus-5-5 (Matt, 11-09 9:05 PM ET)   effort: medium (Matt, 11-09, R-165.84)   due: <date at dispatch + about 2 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-w11-analyst`. Read ALL of these with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/ENGINE.md and its pack, reference/LAWS.md, reference/ONE-ONE-FIX-PLAN.md. Push back,
suggest, go beyond inside your WRITE files.
## Objective
In gen2 stage 1-1, on Easy and on Normal, no fall costs a life: a fall into any gap that is not water sets Pokey back on the ledge
he left, soft, nothing lost. Every other stage plays exactly as it does on origin/main.
## Why it matters
All 36 lives lost in 1-1 on Normal in the 11-10 play window were pits under raised pieces, 7 of 8 players, and practice did not cure
it (origin/t-w11-analyst:reference/qa-reports/window-2026-11-10/WINDOW.md §3). 1-1 is where the controls are learned (R-165.53).
## Frozen inputs (do not change)
- The put-back that exists: pipeline.ts:854 sets `putBack` only for a block piece's gap that is level within 20 px
  (`!!pc.block && !pl.water && dy >= -20`); pipeline.ts:1503-1505 turns it into `heartFalls.push({ ..., soft: true })`. Any other fall
  drops past levelHeight + 120 and reaches `loseLife('pit')` unless `heartFall()` or `softFall()` takes it (engine.ts:2518-2523).
- The three worst pieces are in src/game/gen2/worlds/w1.ts: w1-log-chain (:1122), w1-mushroom-chain-back (:1221), w1-log-chain-rise
  (:1289), BOUGH_WINDOW chains whose gaps mostly rise 136-140 px.
- "No fall" means EVERY fall, not only a fall into a laid gap: heartFall matches only within 160 px of a zone (engine.ts:7257), so
  a fall off a piece's back edge or into a void that is not in `gaps` would still reach loseLife('pit'). The whole-stage mechanism
  already exists: `softOn` (engine.ts:833), which leaves gen2 out today. Turn it on from the stage's data for gen2 1-1 on both
  settings; you may edit engine.ts:833 for that.
- The brief field must reach the built stage the engine reads (pipeline.ts about :2466, where `heartFalls` is passed on); the engine
  never reads w1's brief itself.
- The rule is for 1-1 only, stated as stage data: a per-stage brief field (src/game/gen2/worlds/w1.ts:47, `briefs['1-1']`; its type
  in src/game/gen2/types.ts), NOT a WorldManifest flag (types.ts:103; `heartFalls` at :181 is per world and would hit all of World 1),
  and never a hard-coded stage name inside the engine loop.
- A check is not loosened by this: `seedlist --check` runs promiseBreaches11 -> floorlessGaps (promises11.ts:17-19), which exempts
  every gap inside a soft zone. floorlessGaps must keep judging 1-1 against the level-block put-back zones only (pipeline.ts:1503),
  exactly as on origin/main, so the 0.9.5 ruling "any roll with an unmarked floorless gap is dropped" still bites. Prove it: the set
  of rolls it drops is the same as on origin/main.
- Done-item 1 does fail on origin/main, on Normal (only level block gaps get zones) and on Easy (softOn is false on gen2). Water stays water. Lives, hearts and scoring elsewhere are untouched.
- The set-back spot is the ledge he left: where he last stood before the fall. He must never be set back onto a ledge he cannot
  stand on, into a hazard, or ahead of where he fell.
- The recorder still writes `softFall` for each set-back (the analyst's report counts them); in 1-1 `lostLife pit` is never written.
- Frame budget: design to 8 ms of our own work per frame (GPU-RENDERER-PLAN.md:52-59; PERFORMANCE-RULES §1's text still reads 12 ms).
  This change adds no per-frame work.
- New replaces old (CLAUDE.md): no on/off switch. LEAN (Matt, 11-09): run only the tests for the files you touch plus the checks in
  done-item 4; not the full suite, not drawcheck or clipcheck (the Critic and the promote run those).
## Files
- READ: src/game/gen2/pipeline.ts, src/game/gen2/worlds/w1.ts, src/game/engine.ts (the fall handling and softFall/heartFall),
  src/game/realPlay.ts, the gen2 tests beside them.
- WRITE: src/game/gen2/pipeline.ts, src/game/gen2/worlds/w1.ts, src/game/gen2/types.ts, src/game/gen2/promises11.ts only to keep
  floorlessGaps as it is, src/game/engine.ts (line 833's softOn and the set-back spot only), tests beside each file you touch, reference/handoffs/engine-core.md (your turnover note).
## Definition of done (the Critic checks each)
1. A test that lays 1-1 on Normal and on Easy over at least these seeds from the window (3747, 15458, 19582, 26871, 35286, 23436, 1769,
   25908, 29944, 172, 21537, 30782, 1589, 14194, 30947, 12727) and proves a fall into every gap that is not water is a soft set-back on that
   setting (softOn from the 1-1 brief, or a soft zone; no new zone is needed on every gap). It fails on origin/main (show the failing run) and passes on your branch. And a realPlay sweep: on 3 of those seeds, on
   each setting, walk Pokey off the right edge of every solid piece; lives never change and `lostLife` is never written.
2. A flight in realPlay over w1-log-chain-rise on Normal (seed 3747) that walks Pokey off a rising gap: he is set back on the ledge he
   left, lives unchanged, `softFall` recorded, no `lostLife`.
3. A test that one stage outside 1-1 (1-2, and a World 8 Normal stage with heartFalls) lays the same gaps and heartFalls as on
   origin/main (same output, byte for byte, for 3 seeds each).
4. `npx tsc --noEmit -p .` clean; `npx tsx --test` on the test files you touched and src/game/gen2/*.test.ts green;
   `npx tsx tools/engine/seedlist.ts 1-1 --check` green (every proven 1-1 seed still passes), or the exact seeds that changed and why.
5. Polish check (LAWS 1): one still, upright and sideways, of Pokey being set back at w1-log-chain-rise: he lands standing on the
   ledge; the camera cuts once behind the iris, as softFall does today (engine.ts:5021), with no second jump and no flash. Name anything rough plainly.
6. The turnover note rewritten.
## Return
Branch t-engine-putback from origin/main, pushed (git ls-remote). REPORT.md with "Method used" and "Lessons applied" first, then the 7
sections of roles/README.md, 60 lines or fewer. Then ONE send_message to the lead's session, 10 lines or fewer. Then stop.
## Attempt
1
