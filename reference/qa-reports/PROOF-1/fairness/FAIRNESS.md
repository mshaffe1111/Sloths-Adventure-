# PROOF-1 item 3: no fairness rule loosened (head d0276817 vs main 585ef376 / 0.9.6)

Method: `git diff origin/main HEAD` over every place a fairness number lives (gen2 reach/bands/verdicts/promises/pipeline, levelCheck,
the engine's timers and forgiveness, the bots and the seed-list tool, every known list, STAGE-RULES/PERFORMANCE-RULES), each changed
number or condition read in context, its commit and report found; three runs where reading was not enough (scripts in this folder).
Full lists: `changed-files.txt` (285 source files), `pipeline.diff`, `engine.diff`, `runtime-diffs.txt`.

## Unchanged (diff empty vs main)
STAGE-RULES.md; physics.ts; difficulty.ts (FORGIVE, coyote, buffer); tools/validate/* (funcheck and its funknown.json); tools/inspect
analyze/bands/c1judge/pacing; limits.json; clipknown.json; playerText.known.json; artUse.allow.json; e3known/neighbourknown; helpLadder
RUNGS {move 3, pad 5, step 8, offer 12, reaskAfter 8}; seedList QUIET_MAX and SEED_LIST_MIN; the seed tool's quiet measure (moved to
tools/engine/listRules.ts, the same arithmetic: worst = max(counted x share), outro excluded). No test file deleted; no .skip/.only/todo
added; every removed assert in a modified test is the same assert with the new signature (stageId / Mark) or replaced by a stricter one.

## Every changed fairness number or condition
| # | file:line (head) | rule | main -> head | verdict | source |
|---|---|---|---|---|---|
| 1 | src/game/gen2/reach.ts:73-80 | chain-hop bands by step (CHAIN_BANDS, chainBand) | none -> level S 205-220; up 24-36 S 195-210; up 54-66 S 185-200; down 24-36 S 215-225; other steps 'none' | NEW, inert (no section lays a chain-hop: 1d41d831c says so; grep finds no layer) | 1d41d831c (E12 item 3). Numbers match chain.md §3 word for word, but **chain.md is not in the tree** (only on origin/t-design-1-2 @a9cbadd2e): cited source missing |
| 2 | src/game/gen2/verdicts.ts:25 | chain-hop with no `step` | - -> chainBand(q.step ?? 0) = the level band | NEW, inert; a step-less chain ask is judged as level, not refused | 1d41d831c |
| 3 | src/game/gen2/promises11.ts:113 + verdicts.types.ts:97 | hazard.untaught (hurt drop before its lesson's showing piece, or within clearStart of spawn) | none -> on, all stages, both settings | NEW, stricter; inert (no world sets hurtFloor) | E12 item 2 (EN-W REPORT §2) |
| 4 | src/game/gen2/verdicts.ts:125,135 | drop.look-lies | lethal vs soft looks -> also a heart drop must be 'hurt-art' | STRICTER | E12 item 2 |
| 5 | src/game/gen2/promises11.ts (teach.double-*) | the double's promises | stages ['1-1'] -> 'all', run where gen2.brief.teaches has 'double' | SAME on 1-1 (briefcheck.ts: 82/82 1-1 builds, first run + 40 proven seeds x 2 settings, carry teaches 'double'); wider elsewhere | E12 item 3 |
| 6 | src/game/gen2/promises11.ts (floor.unmarked) | floor.unmarked | ['1-1'] -> 'all' (every JUDGED stage) | STRICTER (wider scope) | E12 item 3 |
| 7 | src/game/gen2/reach.ts:94-110, stageTable.ts | which stages are judged on the flown arcs | `id === '1-1'` -> JUDGED table from STAGE_TABLE; only '1-1' has `judged` | SAME | INT-E e4874223 (the lead's 7:40 AM ruling) |
| 8 | src/game/levelCheck.ts:386, stageGenerator.ts:2952, petalPass.ts:22 | arcs vs closed form | judgedOnArcs(id) -> builtOnArcs(stage): a stage gen2 did NOT build under id 1-1 now gets the closed form | NARROWER scope, no shipped stage affected: every 1-1 Play builds is gen2 (builtOnArcs.test test 2); the control course is 1-2 (CTEST_STAGE_ID), never judged | aadeafe7d (lead 11-11 8:30 PM, "stream B's trap") |
| 9 | src/game/levelCheck.ts:136, pipeline.ts:297 | doubleAllowed | + `doubleTaught` (world's `lessons.double` at an EARLIER stage, only where the old rule says no) | NEW, inert: the old rule allows the double from mission 6, so only 1-1..1-5 could gain it and World 1 has no `lessons` row (w5's double:'5-1' is already allowed) | E12 item 5 (EN-W REPORT §3) |
| 10 | src/game/gen2/nodeCode.ts (V3) | "uses the double / bounce before its teach" | taught in this stage only -> or the world's `lessons` name an earlier stage | LOOSER in letter: W5 (double '5-1') and W8 ('w8:bounce' 8-5) code checks stop flagging. Consistent with STAGE-RULES ("the first appearance of a mechanic is taught": both moves are taught in 1-1). INERT on every shipped stage: V3 runs only in realisedCode, only for a rolled graph (pipeline.ts:2787 `graph.id`), which needs `M.graphs.briefs[stage]` (pipeline.ts:420-423); only w1.ts has `graphs`, and w1 has no `lessons`, so `known` is empty wherever V3 runs | 021775cf0, E12 item 5 |
| 11 | src/game/levelCheck.ts (walk) | a standable surface | broken skipped -> broken or `pit === 'hurt'` skipped | STRICTER (a hurt floor never counts as ground) | E12 item 2 |
| 12 | src/game/gen2/pipeline.ts:2336,2476,2490 | pickups by brief (pick.refuse, petals 'low', offRoad 'fruit', top-up not inside a piece) | none -> per brief | NEW, inert for 1-1 (its brief sets none of pick/petals/offRoad) ; the top-up's "clear" test only removes petals levelCheck would refuse | E12 (brief) |
| 13 | src/game/gen2/pipeline.ts:2977 | LEVEL_SWING 110 (trend 'level') | none -> 110 px | NEW, inert (1-1 trend 'up') | E12 |
| 14 | src/game/stageModes.ts + engine.ts | the walls, "which flag is further", the progress bar | per-objective branches -> travel modes | SAME numbers (EDGE 20, RUN_START 140, SHRINE_STOP); 4-7 (travel down): shrine x 19470 > spawn x 220, so walls(0) = minX 20, maxX shrine+STOP, as main (longdrop.ts) | EN-T, "travel as a mode" |
| 15 | src/game/clock.ts cycle3/cyclePos, 10 hazard files | hazard warn/on windows | hand arithmetic -> one walk | SAME by construction (same operations in the same order: 0+first, c-first-second); clockMove.test.ts asserts bit-identity | "the one clock" |
| 16 | src/game/clock.ts:117 checkClock | a clock's 'on' needs a 'warn' right before; Easy stretch >= 1 | none -> on | NEW, stricter; no stage declares a clock yet | EN-W §5 |
| 17 | src/game/bossHits.ts:11 | boss bar segments floor | max(6, hits) -> max(1, hits) | NOT a fairness number: the HUD's bar only (BossHud.tsx:51, the floating "N hits"); boss HP unchanged. Truer (Easy 4-hit fight showed 6) | 6016013bf EN-F B-easybar |
| 18 | src/game/engine.ts ~2560 | a crumbling tile under a buffered jump | skipped (bug) -> always starts its 1.1 s | STRICTER, per design (crumbleAfter ?? 1.1 unchanged) | audit A-04 |
| 19 | src/game/engine.ts ~5384 | a required plank after a soft fall | stayed gone 30-35 s -> whole again at every set-back | MORE FORGIVING, Matt's rule ("whole again when he respawns", CLAUDE.md) | audit A-03 |
| 20 | src/game/inputEngine.ts pressKeep, engine.ts:744 | Easy's jump buffer / drift catch / boss tell | isEasy() read live -> the run's mode, fixed at its start | SAME per run (a pause-menu switch now applies next run) | EN-F modeKeptByRun |
| 21 | src/game/stuckHelper.ts, puzzlePlay.ts | Dot's stuck help | told at send -> told once shown; a line never shown asks again after 3 more fails; a room's help on every run (P-05); one lost throw counts once (P-06) | MORE help, counts as designed | audit C-03, P-05, P-06 |
| 22 | src/game/chase.ts | a chase resumed from a flag before its start | left half-set -> reset | FAIRER | EN-F (chaseRespawn tests) |
| 23 | src/game/saveFile.ts:27 | one save entry's max size | 400 chars (stage), 1,000 (play), 12,000 (badges) -> 16,000 for every key | LOOSER, not a fairness rule (refused the game's own file at 5-M / 34 finds) | R-165.117 |
| 24 | src/game/flagResume.ts | resume at a flag | a flag alone -> only with the run it held | a 0.9.6 player's mid-stage flag no longer resumes (starts at the stage start) - item 4's to judge | EN-F |
| 25 | tools/perf/knowncheck.mjs, tools/roadmapcheck.mjs | known lists checked | + generality.known.json; lists under tools/ too | STRICTER | R-165.123 |
| 26 | tools/inspect/tierBots.ts pieceAt | which piece a spot belongs to | last x0 <= x in array order -> greatest entry reached along the travel | SAME for x-sorted pieces in a run right | EN-T |

## Conclusion
- **No fairness rule is looser on any stage a player can play today.** Every changed rule is stricter, new, or the same; the one rule
  looser in its letter (#10, V3) cannot fire on a shipped stage (proof in the row) and is sourced (021775cf0, packet E12 item 5, EN-W
  REPORT §3). It becomes live the day a world with a `lessons` row gets `graphs`: that world's code check then trusts its lessons table.
- **Source gap (#1):** CHAIN_BANDS cite `chain.md §3`, which is not in this tree (reference/specs/ holds only README.md; `bands.md` and
  `reach.md`, cited by reach.ts since before this branch, are missing on main too). The numbers match chain.md §3 on
  origin/t-design-1-2 @a9cbadd2e exactly. Inert today.
- Not fairness but player-facing, for item 4: #24 (a 0.9.6 save's mid-stage flag no longer resumes) and #23 (save entry limit 16,000).

## Evidence scripts (run on head; read-only)
- `briefcheck.ts`: 82 of 82 1-1 builds (first run + 40 proven seeds, both settings) carry gen2.brief.teaches 'double' (#5).
- `longdrop.ts`: 4-7 Normal and Easy: travel down, shrine x 19470, spawn x 220, width 19750 (#14).

## Not covered here (and why)
- The lock, seedlist, funcheck, tierBots and first-timer runs (item 2, the lead auditor's runs): the empirical proof that no shipped
  stage's layout or verdicts moved. My reading says only inert or same-number changes reach them; the lock is the proof.
- Byte identity of every timer (item 4): I proved cycle3/cyclePos do the same operations in the same order, not ran them vs main.
- engine.ts (664 changed lines): every removed line with a number was matched to its replacement (engine.diff), not every behaviour.
- UI/audio/save code: not fairness numbers (sound curve and limiter are item 4's).
