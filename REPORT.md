# W1C: World 1's creatures and traps run in the real engine, and 1-3 is laid test-side. `t-w1-creatures` from t-int-engine @d0276817, 2026-11-12 ET
No PR (the lead's brief). INT-E's report is at reference/qa-reports/INT-E/REPORT.md. Times are pasted from `date`.

## EXACT NEXT STEP (kept current at every push; an Opus builder can carry on from here)
1. **1-3 on Matt's test link (he wants it tonight):** `tools/engine/library13.ts` is 1-3 laid TEST-SIDE. To show it in a page today:
   `python3 tools/engine/runs/page13.py <a worktree>` (never the work checkout), then build the test link from that worktree.
   To make it real: move the 12 bricks into World 1's sections, `BRIEF_13` + `PURGE_13` into `W1_KIT.graphs`; in `w1World()` set
   `creatures: W1_CAST_CREATURES, props: W1_TRAP_PROPS, pairs: W1_TRAP_PAIRS` and spread `armedTraps()` into the kit (all in
   `gen2/worlds/w1Cast.ts`); a row in `stageTable.ts`; delete hand-built 1-3.
2. **Not done: bots and flown rows.** No bot knows a vine handle (teach `realPlay`/tierBots: punch a set handle in reach when a cast
   animal is ahead), and 1-3 has no JUDGED rows (reach.ts): it rolls clean only on 1-1's (`--flown`); unflown is 73%. Then its seed list.
3. **Re-roll under t-11-pass** (dead-zone, bounce-purpose): everything here ran on the BASE (the lead, 10:50 AM).
4. **Story/HUD lane:** "excuse me" is still 1-3's wayside line at the HALFWAY mark (wayside.ts:67, DotGuide.tsx:1321), so it can land
   just after a trap. The ruling wants it on the first PUNCH glide: let a wayside line wait on a moment, then put its words in
   `W1_CAST_SAID.punch` (the engine already says `said.punch` once). The first-trap line is said through the TIP banner (it shows
   "Skip tips") and is remembered by `first-of` once shown: check it against the ruling "once in World 1".
5. **Art:** `reference/art/W1-TRAPS-LIST.md` (6 pictures, each with its footing and castArt.ts file:line). ART-W1 has it.

## What was built (each rule from a planted failing test)
- **The kit in the engine, by data.** A brief names its cast (`GraphBrief.cast`) -> `proto.cast` -> the engine's `startCast()` ->
  `castPlay.ts` steps those animals on the fixed step with his stillness, cover and landing noise; `predatorAI.ts` never does. No
  cast named: nothing changes. Punch, kick, stomp and trap call the kit's `beat`.
- **The snake** (Matt, R-165.141, 11:42 AM): shy, rears 0.5 s (0.65 s Easy) before it strikes. EVERY ending is the glide to a lower
  tree, gone for good, counted for the purge: a punch at its branch end, a stomp (he vaults it), a kick, a trap. A punch mid-branch
  only shoves it 70 px and dazes it 2 s. It glides AWAY from him.
- **Drop traps as bricks** (`dropTrap.ts`; a prop pair in `w1Cast.ts`): a vine he shakes or a tendril he cuts, a hive or a stone;
  0.3 s of creak, the fall, every cast animal on that ground within 170 px glides off. It never hurts him. A trap is ARMED by the
  snake that stays (Easy's cut leaves no hive over an empty branch) and its load hangs over the middle of that snake's patch. The
  builder refuses a roll whose trap has no handle, hangs over nothing, is not 140-190 px from its handle, or has a pickup in front.
- **Landing noise** into heroNoise: a fall over 200 px carries 180-560 px and wakes sleepers; a jump is silent.
- **Dot** (story keeper, 11:50 AM): "Off he glides, not a scratch, just very offended!" once, on the first trap; never for a punch.

## Numbers (final code unless a time says otherwise)
| what | result |
|---|---|
| 1-3 rolls, flown, seeds 1-120 / fresh 50001-50120 | CLEAN 119 of 120 (99%) Normal and Easy / 117 of 120 (98%) both; 0 thrown. Rolled at f742ccf0, before the stomp change (data the lay does not read) |
| what refuses | World 1's own bounce sections (band.out, block.*, floor.unmarked, drop.untyped), one seed/flower overlap; no trap brick |
| a clean roll | Normal 12.2 snakes (5 asleep), 7.6 traps; Easy 8 snakes, 4.4 traps (min 2); 196 s typical, 154 s fast (the time model) |
| tests | castPlay 15, castEngine 10 (real engine), library13 8, the kit 78, with heroNoise, stillness, library: all pass (11:52 AM); the count is re-run at the end |
| planted faults | 23 of 23 on the wiring and 40 of 40 on the kit at 11:20 AM; 10 more faults added for the later rules, RE-RUNNING at this push |
| lock, 16 layouts vs 0.9.6 | 102 of 102 unchanged at 11:44 AM; RE-RUNNING on the final code at this push |
| seedlist 1-1 --check / gen2 + worlds | PASS 355 seeds at 11:40 AM, re-running / 431 of 431 at 11:48 AM, re-running |
| drawcheck | PASS 424 s at 11:14 AM (after the wiring); to re-run on the final code |
| tsc / generality / artcheck / knowncheck / chunkcheck | clean / PASS 29 of 29 / PASS / PASS / PASS |
| main JS | 665,676 B at f742ccf0 (base 662,675: +3,001, the engine's glue); the kit, castPlay, castArt, dropTrap, stillness, heroNoise in the `stagekit` chunk (741,507 B); w1Cast.ts in no built file (nothing shipped imports it). Re-measured at the end |
Not run: the whole `src/game/*.test.ts` suite (25 min), clipcheck, kbdcheck, buildcheck, tierBots, roadmapcheck (shallow clone).

## Polish check (a real roll, seed 1 Normal: reference/qa-reports/W1C/stills/, upright 412x915 and sideways 915x412)
- `roll-seed1-1-3-L1-trap0-*`: the FIRST snake (asleep) and the FIRST trap: 1-before, 2-trap (hive mid-fall), 3-glide (it leaves
  away from him), 4-after (Dot's line up, 1/9, 5 hearts). `trap2-*`: a hive over an AWAKE snake in the gallery, the hardest trap
  beat laid. `trap1-*`: tendril and stone. `roll-seed1-bare-1-3-L1-x8730-*`: a snake with no trap (the punch case).
- **Found on stills and fixed in data or code:** the hive off an upright phone at 230 px; the hive behind the goal sign sideways at
  210 px up; the snake 122 px beside its hive; the snake fleeing toward him; cords to the top of the screen; a stiff sprung vine.
- **NOT at the bar (the lead agrees, 11:45):** the trap is STAND-IN art: the clumps read as lamp posts, the stone as a grey egg, the
  hive is plain, the handle says "punch me" only by its ring. Sideways, on a branch a step up, the vine's top passes behind the
  goal sign. The snake's tail touches an upright phone's edge at the far end of its patch. A snake punched awake shows its waking
  head while dazed. The bare-snake still has him standing inside its patch (my placement), not a played approach. No trap sound of
  its own. **There is no noise teach in the lay**: landing noise works and nothing teaches it.
- **The soil seam (trap1 upright):** it lies at y 580, the World's floor line (`manifest.ground.y`); the ledges there stand at y 489,
  91 px above it, and every laid piece's body runs 568 px or more deep, so no piece of the lay ends there. It is the ground art
  drawing the floor line under banks that stand above it. Not fixed (ground art). I did not trace the painter's line.
- **Unverified:** nothing was PLAYED flag to totem by hand or by a bot. Old saves and the HUD's other states were not looked at.

## Decision for the lead
The lay keeps an animal 120 px from any prop, so a snake cannot be laid at its own load's socket: the socket sits at the patch's
near end and `armedTraps` hangs the load over the patch's middle. A lay that knew "this prop hangs overhead" is an engine change.

## Method update
`reference/methods/predator-kit.md`: "Wiring a cast into a stage" (5 steps) and 3 pitfalls. Worked: stills of the REAL roll before
calling it done changed five things. Failed: I tuned the first geometry on a planted example on shipped 1-3; the roll overturned it.
