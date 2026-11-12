# W1C: World 1's creatures and traps in the real engine, and 1-3 designed and built. `t-w1-creatures` from t-int-engine @d0276817, 2026-11-12 ET
No PR (the lead's brief). INT-E's report is at reference/qa-reports/INT-E/REPORT.md. Times are pasted from `date`.

## EXACT NEXT STEP (kept current at every push; a builder can carry on from here with nothing lost)
1. **Read first:** `reference/design/1-3.md` (the level as designed, and at its foot what is built and what is not yet) and
   `reference/design/LEVEL-BAR.md` (1-3 scored: two 0s left, the painted traps and a bot with its own flown rows).
2. **See it:** `git worktree add --detach <wt> HEAD`, link node_modules, `python3 tools/engine/runs/page13.py <wt>`, `npx vite` there;
   stills with `tools/engine/runs/trap-stills.mjs` (predator-kit.md has the lines). Never run page13.py on the work checkout.
3. **Mine, next (W1C):** move 1-3 from `tools/engine/library13.ts` into World 1's shipped kit so the real game builds it: the seven
   beat bricks into a `gen2/worlds/w1Arc13.ts`, `BRIEF_13` + `PURGE_13` into `W1_KIT.graphs`; in `w1World()` `creatures:
   W1_CAST_CREATURES, props: W1_TRAP_PROPS, pairs: W1_TRAP_PAIRS` and `armedTraps()` spread into the kit; a row in `stageTable.ts`;
   hand-built 1-3 deleted (new replaces old). It needs P13's flown rows and seed list first: until then it rolls on 1-1's rows.
4. **P13's (not mine):** bots that punch a set handle; 1-3's own JUDGED rows; its seed list; "excuse me" moved from the halfway mark
   (wayside.ts:67, DotGuide.tsx:1321) to the first PUNCH glide (put its words in `W1_CAST_SAID.punch`: the engine already says it once).
5. **Then:** flags and hearts by the design's table (today the generator's and the game's own passes); the first-trap line comes
   through the TIP banner ("Skip tips") and is remembered by `first-of` once shown; re-roll under t-11-pass (all of this ran on the
   BASE); the painted traps (`reference/art/W1-TRAPS-LIST.md`, with ART-W1) replace `castArt.ts`'s stand-ins.

## What was built (each rule from a planted failing test)
- **The kit in the engine, by data.** A brief names its cast (`GraphBrief.cast`) -> `proto.cast` -> the engine's `startCast()` ->
  `castPlay.ts` steps those animals on the fixed step with his stillness, cover and (from World 2 on, by the move ladder) his landing
  noise; `predatorAI.ts` never does. No cast named: nothing changes.
- **The snake** (Matt, R-165.141): shy, rears 0.5 s (0.65 s Easy) before it strikes. EVERY ending is the glide, gone for good,
  counted for the purge: a punch at its branch end, a stomp, a kick, a trap. A punch mid-branch only shoves it 70 px and dazes it.
- **Drop traps as bricks** (`dropTrap.ts`; a prop pair in `w1Cast.ts`): a vine or a tendril, a hive or a stone; 0.3 s of creak, the
  fall, every cast animal on that ground within 170 px glides off, away from him. Armed by the snake that stays; the load hung over
  the middle of its patch. The builder refuses a trap with no handle, over nothing, not 140-190 px from its handle, or behind a pickup.
- **Dot** (story keeper): "Off he glides, not a scratch, just very offended!" once, on the first trap; never for a punch.
- **1-3, designed and built** (`library13.ts`): ONE graph `A T P M R X R W R S R C E`, one brick a beat (lesson, again, the stone
  stair, the other way, the perch, the gallery, the finale), World 1's library only the quiet between. `GraphBrief.dealExact`: a
  designed graph's deal has no jitter and a node takes its only brick's type (acts only for a brief that sets it).

<<<<<<<< HEAD:reference/qa-reports/INT-E/REPORT.md
## The gate, run 2 on the final head f8f467f5 (BASE_PATH=/Sloths-Adventure-/; seconds, ET end)
| gate | exit | s | ET | result |
|---|---|---|---|---|
| tsc | 0 | 2 | 08:37 | clean |
| vite build | 0 | 4 | 08:37 | no asset over 4 MiB |
| chunkcheck | 0 | 0 | 08:37 | **main 662,675 B, 3,331,629 spare**; 40 JS files, 22 at the start, no loop |
| artcheck / knowncheck | 0 / 0 | 0 | 08:37 | PASS / PASS (generality list new on main: 29) |
| roadmapcheck (full history) | 0 | 2 | 08:38 | PASS; again PASS after the R-165.139 row |
| generality | 0 | 0 | 08:38 | PASS, 29 literals, 29 known |
| lockall --check vs 0.9.6 | 0 | 545 | 08:47 | **102/102 unchanged** |
| core suite (CLAUDE.md glob) | 0 | 1531 | 09:03 | 2,965 tests: 2,963 pass, **0 fail**, 2 todo (known) |
| tools + mixer tests | 1 | 41 | 09:04 | 144: 135 pass, 8 fail **same on main** (R-165.139), 1 skipped |
| tierBots | 0 | 16 | 09:04 | 7/7 |
| funcheck | 1 | 39 | 09:04 | FAIL, **identical to main** (every flag and count; 12 worse/new, 26 to lower) |
| seedlist 1-1 --check | 0 | 203 | 09:07 | PASS, 355 seeds |
| drawcheck | 0 | 270 | 09:12 | PASS |
| clipcheck | 0 | 234 | 09:15 | PASS (83 known) |
| kbdcheck | 0 | 109 | 09:17 | PASS (its rewritten stills not committed) |
| buildcheck | 2 | 121 | 09:19 | could not start its page in 120 s right after kbdcheck; **alone at once: PASS** p95 89 / 83 ms |
Run 1 (3616dfd9) found the three defects fixed above. Its drawcheck lost 2-6 to a reload when I edited w1.ts under its dev server.
**Open, next session:** buildcheck fails to start in sequence after kbdcheck (twice, both runs; alone it passes in 5 s, twice): the tool's
cold dev server, not the game, but unproven. **Same on main (R-165.139):** mixer/stumps.test 'a log on a stump is thin...'; validate.test
route x3 and beats; world1.test 'everything feels the same', 'nothing bites, the truer rule', 'padding' (main run: --test-concurrency=1).
========
## Numbers (final code; times ET)
| what | result |
|---|---|
| 1-3 rolls, flown, seeds 1-120 and 50001-50120 | **CLEAN 480 of 480** (Normal and Easy, both ranges), 0 thrown; every roll the same 13 beats in order |
| a roll | Normal 13 snakes (7 asleep), 9 traps; Easy 8 (4 asleep), 5 traps; 198 s typical (193-202), 155 s fast (the time model) |
| tests | castPlay 15, castEngine 10 (real engine), library13 9, the kit 78: all pass |
| planted faults | the wiring 34 of 34 caught, the kit 40 of 40 (12:17 PM) |
| lock, 16 layouts vs 0.9.6 | **102 of 102 unchanged** (12:35 PM, after the last builder change) |
| seedlist 1-1 --check / gen2 + worlds | PASS 355 seeds (12:28 PM) / 431 of 431 (12:38 PM) |
| drawcheck | PASS 293 s (12:11 PM); nothing that draws changed after it |
| tsc / generality / artcheck / knowncheck / chunkcheck | clean / PASS 29 of 29 / PASS / PASS / PASS on this head: main JS 665,829 B (base 662,675: +3,154, the engine's glue); the kit, castPlay, castArt, dropTrap in `stagekit` (741,546 B); w1Cast.ts in no built file yet |
Not run: the whole `src/game/*.test.ts` suite (25 min), clipcheck, kbdcheck, buildcheck, tierBots, roadmapcheck (shallow clone);
artcheck and knowncheck last ran at f742ccf0 (no art and no known-list file has changed since).
>>>>>>>> 26f72b31:REPORT.md

## Polish check (the designed arc, seed 1 Normal, real page: reference/qa-reports/W1C/stills/arc-seed1-*, upright and sideways)
- **Looked at, reads:** the lesson sideways (trap0-1-before: vine, link, hive and the sleeping snake all clear of the goal sign);
  the perch upright (trap3-1-before: he is up at the tendril, the stone over the snake a step below); the gallery sideways
  (trap5-1-before: clear of the sign since the branches were laid level); a bare branch upright (bare-x11640).
- **Found on these stills and fixed:** the gallery's stone behind the goal sign (trapped branches now level); bare stills that
  showed no snake (my placement; re-shot from on the branch).
- **NOT at the bar:** the trap art is a STAND-IN (the lead: clumps like lamp posts, a grey egg, a plain hive, a handle that says
  "punch me" only by its ring). On an upright phone a bare branch's snake is at the screen's edge until he is on the branch. A
  snake punched awake shows its waking head while dazed. No trap sound of its own. Seven of 13 snakes asleep on Normal is the
  threat budget's doing: it may play too gently.
- **Not looked at yet:** of the 48 stills I have judged 5; the rest (again, the stone stair, the finale, every "after") are unjudged.
- **Unverified:** nothing was PLAYED flag to totem by hand or by a bot; hearts were not seen on this stage; old saves not looked at.

## Method update
`reference/methods/predator-kit.md`: "Wiring a cast into a stage" and 3 pitfalls. New today: a level is DESIGNED first
(`reference/design/<stage>.md`, scored on LEVEL-BAR.md), then built as one graph with one brick a beat. What failed and why: the
first lay dropped trap bricks into World 1's rolled sections (119 of 120 "clean", and not a level); and a `node:` tool script is
outside tsc, so a stale name in library13.ts's print crashed two background runs before I saw it. Run the tool once after an edit.
