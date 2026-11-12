# W1C: World 1's creatures and traps run in the real engine, and 1-3 is laid test-side. `t-w1-creatures` from t-int-engine @d0276817, 2026-11-12 ET
No PR (the lead's brief). INT-E's report moved to reference/qa-reports/INT-E/REPORT.md. Times below are pasted from `date`.

## EXACT NEXT STEP (kept current at every push, for whoever picks this branch up)
1. **Make 1-3 real:** `tools/engine/library13.ts` is 1-3 laid TEST-SIDE (brief, 3 purge graphs, 12 drop-trap bricks). Move it into
   World 1's shipped kit: the bricks into `gen2/worlds/w1*` sections, `BRIEF_13` + `PURGE_13` into `W1_KIT.graphs`, and in `w1World()`
   set `creatures: W1_CAST_CREATURES, props: W1_TRAP_PROPS, pairs: W1_TRAP_PAIRS` and spread `armedTraps()` (emit + spawn) into the
   kit (all four are in `gen2/worlds/w1Cast.ts`, ready). Add 1-3 to `stageTable.ts`, give it JUDGED rows of its own (today it rolls on
   1-1's with `--flown`), build its seed list (`reference/methods/seed-list.md`), delete hand-built 1-3 (new replaces old).
2. **Before that, re-roll under t-11-pass** (dead-zone and bounce-purpose rules): everything here ran on the BASE (the lead, 10:50 AM).
3. **Story keeper:** the old first-knockout Dot line fires when a trap clears a snake (stills, trap2 "after"): rule a line or silence.
4. **Matt:** approve the picture list `reference/art/W1-TRAPS-LIST.md` (6 pictures); the trap art is a code-drawn stand-in.
To see it: `python3 tools/engine/runs/page13.py <a worktree>` then `tools/engine/runs/trap-stills.mjs` (predator-kit.md has both).

## What was built (every rule from a planted failing test)
1. **The kit in the engine, by data.** A stage's BRIEF names its cast (`GraphBrief.cast`); the builder writes `proto.cast`; the engine's
   `startCast()` hands those animals to `castPlay.ts`, which steps them on the fixed step with Pokey's stillness, cover and landing
   noise. `predatorAI.ts` never steps a cast animal; a stage with no cast is untouched. Punch, kick, stomp and trap call the kit's
   `beat`. The snake: shy, rears 0.5 s (0.65 s Easy) before it strikes; a punch shoves it 70 px and knocks it off its branch end
   (new kit rule, `Outcome.knock`); a stomp vaults it (it goes home 5 s, not counted); chased off, it glides AWAY from him and counts
   toward the purge.
2. **Drop traps as bricks** (`dropTrap.ts`, a prop PAIR in `w1Cast.ts`): a vine he shakes or a tendril he cuts (a blow on the handle),
   a hive or a stone; 0.3 s of creak, the fall, everything on that ground within 170 px is chased off. The load never hurts him. A
   trap is ARMED by the snake that stays under it, so Easy's cut leaves no hive over an empty branch. The builder refuses a roll whose
   trap has no handle, hangs over nothing, is not 140-190 px from its handle, or has a pickup in front of it (`trapFaults`).
3. **Landing noise** from the engine into heroNoise: a fall over 200 px carries 180-560 px and wakes sleepers; a jump is silent.
4. **1-3 laid** (the helper's `library13.ts`, merged): first snake asleep under the first hive on both settings; the approved line.

## Numbers
| what | result |
|---|---|
| 1-3 rolls, flown rows, seeds 1-120 | **CLEAN 119 of 120 (99%) Normal, 119 of 120 (99%) Easy**, 0 thrown, 0 pool short (on the final code, the plain-view rule in the builder) |
| 1-3 rolls, fresh seeds 50001-50120 | CLEAN 117 of 120 (98%) Normal, 117 of 120 (98%) Easy, 0 thrown (a range nothing was tuned on) |
| unflown (no JUDGED row yet) | 88 of 120 (73%) both settings, 32 thrown: World 1's 253-256 px doubles past the unflown 230 (engine-core 0f) |
| what refuses | World 1's own bounce sections (band.out, block.*, floor.unmarked, drop.untyped), one seed/flower overlap; no trap brick |
| a clean roll holds | Normal 12.2 snakes (5 asleep), 7.6 traps; Easy 8 snakes, 4.4 traps (min 2); 196 s typical, 154 s fast (the time model) |
| tests | castPlay.test 15, castEngine.test 9 (real engine), library13.test 8, kit 78: 132 of 132 with heroNoise, stillness and library.test, on the final code |
| planted faults | the wiring 23 of 23 caught, the kit 40 of 40 (11:20 AM); RE-RUNNING with 5 more faults for the later rules as this is pushed |
| stage lock, 16 layouts vs 0.9.6 | **102 of 102 stages unchanged** (run twice: after the wiring, and again on the final code, 11:44 AM) |
| seedlist 1-1 --check | PASS, 355 seeds clean on both settings (twice; the second on the final code, 11:40 AM) |
| gen2 + worlds tests | 431 of 431 (twice; the second on the final code, 11:48 AM) |
| drawcheck | PASS, 424 s (11:14 AM, after the wiring); RE-RUNNING on the final code as this is pushed |
| tsc / generality / artcheck / knowncheck / chunkcheck | clean / PASS 29 of 29 known / PASS / PASS / PASS |
| main JS | 665,676 B (base 662,675: +3,001, the engine's glue). castPlay, castArt, dropTrap, the kit, stillness, heroNoise: `stagekit` chunk (741,507 B). w1Cast.ts is in no built file yet (nothing shipped imports it) |
Not run: the whole `src/game/*.test.ts` suite (25 min), clipcheck, kbdcheck, buildcheck, tierBots, roadmapcheck (shallow clone here).

## Polish check (stills of a real roll, seed 1 Normal: reference/qa-reports/W1C/stills/, 24 files, upright 412x915 and sideways 915x412)
- **Reads:** `roll-seed1-1-3-L1-trap2-1-before-*`: he is at the vine, one vine runs up and over to the hive, the hive hangs over the
  snake, all on screen both ways. `-2-trap-*` the hive mid-fall. `-3-glide-*` the snake stretched out, leaving away from him.
  `-4-after-*` the hive on the branch, 1/9, 5 hearts. trap0 = the sleeping lesson; trap1 = tendril and stone.
- **Found on stills and fixed:** a handle 230 px from its load put the hive off an upright phone; the hive at 210 px up sat behind the
  goal sign sideways; the snake stood 122 px beside its hive; it fled toward him; the cords ran to the top of the screen.
- **ROUGH, not fixed:** (a) the trap is STAND-IN art: the leaf clumps read like green umbrellas, the vine is a plain stroke.
  (b) Sideways, on a branch a step up, the vine's top passes behind the goal sign (the hive is clear). (c) At the far end of its patch
  the snake's tail touches an upright phone's right edge. (d) A snake punched awake shows its waking head while dazed. (e) The hive
  falls behind a snake that stands in front of it. (f) No sound of its own: the trap uses the whoosh and a hit thud.
- **Unverified:** nothing was PLAYED by hand or by a bot: the stills step the real engine, but no run from flag to totem was made, and
  the purge's quota against stomp-only play (a stomp never counts) is untested. Old saves and the HUD's other states were not looked at.

## Decisions for the lead
- The lay keeps an animal 120 px from any prop, so a snake cannot be laid UNDER its own load's socket. I did not touch that rule:
  the load's socket sits at the patch's near end and `armedTraps` hangs the load over the patch's middle. If you would rather the
  lay knew "this prop hangs overhead", that is an engine change with a lock run.
- A stomp does not clear a snake (the design's "he vaults it"), so a purge needs a punch or a trap for each: say if that is wrong.
- Landing noise is wired; his PUNCH's noise (heroNoise has it) is not: a punch on a vine beside a sleeper does not wake it.

## Method update
`reference/methods/predator-kit.md`: a new section "Wiring a cast into a stage" (5 steps) and 3 pitfalls paid for today (the phone's
190 px; a page punch needs `triggerTouchPunch`; 2 of 23 planted faults survived 8 green tests). What worked: shooting stills of the
REAL roll before calling it done changed five things in data. What failed: I tuned the first geometry on a planted example on
shipped 1-3, where the snake's patch and the ground were not the roll's; the roll's stills overturned it.
