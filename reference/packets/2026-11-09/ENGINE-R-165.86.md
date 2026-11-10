# TASK R-165.86   to: Engine   model: claude-fable-5-2   effort: medium (Matt, 11-09, R-165.84)   due: <date at dispatch + about 2 h>
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
- The rule is for 1-1 only, stated as stage data (a flag on the stage's manifest or plan), never a hard-coded stage name inside the
  engine loop. Water stays water. Lives, hearts and scoring elsewhere are untouched.
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
- WRITE: src/game/gen2/pipeline.ts, src/game/gen2/worlds/w1.ts, the gen2 manifest type file if the flag lives there, src/game/engine.ts
  only if the set-back spot needs it, tests beside each file you touch, reference/handoffs/engine-core.md (your turnover note).
## Definition of done (the Critic checks each)
1. A test that lays 1-1 on Normal and on Easy over at least these seeds from the window (3747, 15458, 19582, 26871, 35286, 23436, 1769,
   25908, 29944, 172, 21537, 30782, 1589, 14194, 30947, 12727) and proves every gap that is not water is covered by a soft put-back
   zone. It fails on origin/main (show the failing run) and passes on your branch.
2. A flight in realPlay over w1-log-chain-rise on Normal (seed 3747) that walks Pokey off a rising gap: he is set back on the ledge he
   left, lives unchanged, `softFall` recorded, no `lostLife`.
3. A test that one stage outside 1-1 (1-2, and a World 8 Normal stage with heartFalls) lays the same gaps and heartFalls as on
   origin/main (same output, byte for byte, for 3 seeds each).
4. `npx tsc --noEmit -p .` clean; `npx tsx --test` on the test files you touched and src/game/gen2/*.test.ts green;
   `npx tsx tools/engine/seedlist.ts 1-1 --check` green (every proven 1-1 seed still passes), or the exact seeds that changed and why.
5. Polish check (LAWS 1): one still, upright and sideways, of Pokey being set back at w1-log-chain-rise: he lands standing on the
   ledge, the camera does not jump, nothing flashes. Name anything rough plainly.
6. The turnover note rewritten.
## Return
Branch t-engine-putback from origin/main, pushed (git ls-remote). REPORT.md with "Method used" and "Lessons applied" first, then the 7
sections of roles/README.md, 60 lines or fewer. Then ONE send_message to the lead's session, 10 lines or fewer. Then stop.
## Attempt
1
