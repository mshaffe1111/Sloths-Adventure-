# Handoff: the planner (gen2 rolled stages, 1-1), written 6:57 PM ET, 2026-11-07

This covers the planner's own work on `engine-chunks`: the pipeline's verdicts, the reach numbers, the two plans left open and the traps.
Last code commit 25d2d115 (the Dot teach fix); 00bd44e8 is notes only. Live status: `reference/notes/planner-status.md`. Work saved but
not live: `reference/notes/planner-wip/`.

## 1. The verdicts (what makes a roll fail by name)

A roll with any error never reaches the proven list or a player. `provenGen2Stage` walks `seed + k x 7919` for 24 tries, catching throws;
`buildPlayStage` replays a listed seed's packed plan (`gen2/seedList.ts`). Every verdict below is folded by `rollErrors()` in
`src/game/gen2/pipeline.ts`.

| Verdict | Enforces | Where | Planted test |
|---|---|---|---|
| loosened slot | Law 22: a slot its rules could not fill fails as "pool short at slot N (...)", never a looser rule | `layStage` `last.loose`, `rollErrors` | proven.test |
| missing required | a required section with no node | `layStage` `missing` | required.test |
| node code V1-V20 | the realised node code breaks a V-rule | `realisedCode` -> `codeErrors` | proven.test (fold) |
| unsaid tip | a tip id the kit has no Dot words for | `fillSockets` `unsaid` | tips.test |
| V19 late rise | on an up stage, the node after a late descent (or the signature, `endHigh`) ends 20 px above the window start and the descent | `layStage` `riseTo` / `needsRise`, `gen2.rise` | v19.test |
| V19b window | the end log is above the route where the bough window begins: the gate's own `storyChecks.endAboveWindow`, one definition | `applyVerdicts` -> `gen2.windowMiss` | v19.test |
| rolled flags | `ROLLED_FLAGS`: a flag within 2400 px before each hard node (teach, test, twist, combine, signature, finale) and at least `clear` 1500 px ahead of it; 900-4000 px apart (2300 where a life can be lost); first at least 700 px on; last within 2000 px of the exit | `fillSockets` (placement), `rolledFlagBreaches`, `applyVerdicts` -> `gen2.flagMiss` | rolledFlags.test |
| Easy = Normal | Easy lays Normal's plan and carries Normal's errors, including Normal's verdicts (`applyVerdicts` runs on Easy's Normal build too) | `buildRolled` easy branch | proven.test ("Easy is Normal's stage") |
| quiet line | a listed seed's longest quiet stretch on Normal, the outro excluded, at most `QUIET_MAX` 4 s (binds in the list builder, not per roll) | `tools/engine/seedlist.ts`, `seedList.ts` `QUIET_MAX` | seedlist --check |

Also in the lay, not verdicts but rules: no-mirror (an exit over 25 px off level, any climb or hanging piece, any block); no two forks side by
side (graph roll); a corridor-stray section is re-laid with its other versions before the template is banned (`versionCombos`); `gapPx`
lays a pixel band exactly and throws by name past the jump's reach; Easy twin versions (`easy`, `easyOnly`); an `over` piece past its
base's end records its gap (so a catch goes under it). Each has its planted test in `src/game/gen2/` (mirror, forks11, versionRelay, gapPx,
easyTwin).

The stage.ts rulers (`tools/engine/rulers.ts`, planted in rulers.test.ts): required move with the rescue gate (a run carried by the bot's
rescue or a soft fall did not pass; the full bot rescued in a TEACH is a breach), splits over reachable tops (1-1 against old 1-1's 7),
against-old distinctness (at least old 1-1's own spread 0.237, `old11-pieces.json`), length on the pipeline's own floors.

## 2. The reach numbers the pipeline uses, and where

| Number | Value | Where |
|---|---|---|
| `PHYS` jumpV 640, doubleV 540, bounceV 830, gravUp 1900, gravDown 2500, maxRun 285 | engine constants | `src/game/physics.ts` `PHYS` |
| `JUMP_RISE` | 107.8 px (closed-form apex, jumpV^2 / 2 gravUp) | `physics.ts` |
| `DOUBLE_RISE` | 184.5 px (JUMP_RISE + doubleV's apex) | `physics.ts` |
| `BOUNCE_REACH` | 258.0 px (bounceV's apex + the double's) | `gen2/pipeline.ts` |
| `reachJump(dy, dbl)` level | single 174.7, double 313.2 px | `physics.ts` `reachMin`: a stepped flight at each of `SIM_DTS` [1/30, 1/60], the smaller |
| `MARGIN` | Normal 0.82, Easy 0.65 | `gen2/types.ts` |
| `maxGap(dy, dbl, margin)` level | Normal single 143.3 / double 229.8; Easy single 113.6 / double 203.6 | `gen2/pipeline.ts`: min(margin x reachJump, reach x 0.97 - TAKEOFF_SLACK 70 - 4) |
| `riseLimit(dbl, share)` | Normal single 88.4 / double 151.3; Easy single 70.1 / double 119.9 (lays clamp at x0.9 single, x0.95 double: Easy's double rise 113.9) | `gen2/pipeline.ts` |
| levelCheck's link | `MARGIN` 0.97, `TAKEOFF_SLACK` 70, `LAND_HALF` 21 | `src/game/levelCheck.ts`, `physics.ts` |

**The outside review's finding, not yet checked by me:** the builder's reach does not match the 30 fps game: it rates the jump about +10 px
(rise) and the bounce about +14 px too high, and the distance 20-50 px short. The suspects: `JUMP_RISE`, `DOUBLE_RISE` and `BOUNCE_REACH`
are closed-form apexes (continuous), while the game steps at 30 fps; `reachJump` does step (`SIM_DTS`), but its take-off model and
`TAKEOFF_SLACK` may not match the engine's. First job for whoever owns reach: a planted test that flies `RealPlay` (the real engine, 30 fps)
over a bare gap and a bare rise and compares with these numbers; then fix the ruler, never the data. Everything in section 1 that sizes a
gap or a rise (gapPx guards, riseLimit, the designer's bands 195-205 / 205-228, Easy twins 110-114) depends on the answer.

## 3. Open plans

- **Floors** (the lead's 4:23 PM ruling, 11-06): `planner-status.md` "Next week, first". findW1Pits learns the put-back kind (planted: a
  put-back zone with its put-back removed must fail); the 6 spots get back pits toward the near lip; the blocker is findW1Pits' single
  ground line, which needs per-gap lips. Interim evidence: `planner-wip/floors-putback-drop.ts.txt` and `w1Floorless.test.ts.txt`.
- **Branch share** (Round 11, open): `planner-wip/branch-bar.patch` (W1 `branchMax` 0.3 passed through `w1World`, `catchStyles`
  ['log', 'branch'], the verdict, branchShare.test). Waits on the designer ruling what height is "thin": mine counts 60 px or less
  (median 24%, worst 29% with catchStyles), engine-core's 30 px or less (median 38%). Switch the filter, re-measure, report the yield.

## 4. Traps (each one cost time on 11-06)

1. **Never edit files while a check runs on them.** The suite, lock and seed list read the tree; a mid-run edit spoils the result. Use a
   second worktree for experiments.
2. **Never `git stash` during a merge.** It drops MERGE_HEAD; redo the merge and compare `git write-tree` with the tested tree.
3. **The lock reference must be the current engine-core's.** Re-record it on engine-core's head (`lockall.ts --out`) before checking a
   merge; an old reference shows engine-core's own changes as yours.
4. **Any change to the lay rebuilds the proven list** (`seedlist.ts 1-1`, about 6 min bound, then `--check`). A stale list breaks replay.
5. **w1World copies W1_KIT field by field.** A new manifest field does nothing until it is passed through (`branchMax` was missed once).
6. **Verdicts set in `buildGen2Stage` do not reach Easy's inner Normal build** unless `applyVerdicts` runs on it (seed 138).
7. **A calm Dot queue says nothing for its first 2.5 s and keeps 10 s between line starts**, and a move tip for a move already done is
   dropped unsaid. Teach lines need clear screen time before the first piece that needs the move; dotGuide's v198 rule (a move tip does not
   push an information line aside) is deliberate.
8. **Coach lines must go through Dot's word swap** (`dotLines.ts` SAID includes 'coach'). Old 1-1's CoachOverlay still has the old words
   (roadmap).
9. **Bots: rescues are not passes.** firsttimer's rescue puts the bot further on after three falls; count `rescueXs` and `softFallXs`
   inside the stretch. A stomp sets `p.bounce` too: count mushroom bounces with `Met.sprung`.
10. **findW1Pits is the painter's ruler** (water goes wherever it says fall), and it judges floors from one ground line.
11. **Easy's reach is smaller**: a Normal pixel band can be past it (195-205 is refused on Easy). gapPx throws by name; do not clamp.
12. **Shell heredocs**: quote them (`<<'EOF'`) or backticks in Markdown run as commands.
13. **Times**: every time in a message comes from `TZ=America/New_York date` run just before it.
14. **Two searches on a judged stage (Y2, 11-12).** `buildRolled` searches first exactly as before, with the landing repair OFF
    (`checkAndRepair(..., landings)`), so every seed the old search laid cleanly lays the same stage and the proven list never moves. Only a
    seed with no clean roll is searched again, on fresh rolls (`maxRerolls + 1` on), with the repair ON (`landings.ts repairLandings`: idle
    mushrooms taken up, dead-zone petal rows moved to a clean piece in their section). Every replay and Easy lay runs the repair ON; on a
    first-search stage it is a no-op (its verdicts were clean). Changing the repair moves only second-search seeds; changing anything the
    first search reads still moves the list (trap 4).
