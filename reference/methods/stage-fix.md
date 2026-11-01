# Method: fixing an unfair spot in a stage
Last proven: 2026-11-01, branch w8-rope2 (57c8bf51..3bcfc1dc), 8-2's ropes: 0 heart falls at a rope in 40 first-timer runs (was 6 on one
roll), the rope rolls reaching the shrine 21 of 24 Normal runs. Owner of the last update: w8-rope2.

## When to use it
A first-timer bot, a QA tester or Matt loses lives, hearts or a goal at one kind of spot, and we have to decide whether the game is unfair
there and fix it. (Building a new stage is `stage-build.md`; the rules every stage meets are STAGE-RULES.md, read §1b's "unfair" list
first: it is the bar for "fix it" against "hard but fair, keep it".)

## Steps
1. **Reproduce with the first-timer, on several rolls.** `npx tsx tools/inspect/inspect.ts --worlds N --stages N-M --firsttimer --seed S`
   (12 s for one stage; `--json` for the runs). Seeds 1-3 at least, Easy and Normal; layout seed S plays shipped roll `S % 16`. Run the
   same thing on the base branch (a `git worktree add /tmp/base origin/<base>` with node_modules symlinked) so you know what is new.
2. **Log the spot, not the summary.** The run's `harms` give where; to see *why*, wrap `RealPlay.prototype.frame` and log what you need
   per frame (grabs, let-gos, hearts, position, velocity, the pad). `tools/inspect/ropeTrace.ts` is the pattern (a few lines); for one
   moment print every frame between two times (x, y, vx, vy, grounded, the pad) and read it.
3. **Sweep the thumb in the real engine.** Stand Pokey before the spot (`RealPlay.stand`), run in, press at a grid of distances before
   the edge and hold times, steer kept or dropped (`tools/inspect/ropeProbe.ts`: 8 x 6 x 2 = 96 thumbs a spot). This separates:
   - **the stage/engine's fault**: a thumb a person would use fails (and on screen it looks like it should have worked);
   - **the bot's fault**: every human-like thumb works, only the bot's odd one fails (fix the bot, or note it);
   - **hard but fair**: the window is narrow but over STAGE-RULES §1b's 167 ms Normal / 300 ms Easy.
   The rope case: the sweep said 94/96 thumbs catch every rope, so the grab window, ROPE_RISE and timing were fine; the frame log said the
   bot's flick ~150 px early topped out short of the rope's end and his hands fell back through it. On a phone that is "his hands went
   through the rope": the engine's fault, though the sweep looked clean. Read the frames; a sweep only covers the thumbs you put in it.
4. **Fix the smallest true cause**, in the engine or the stage, never by changing the bot to pass. Then ask what else the fix touches:
   find every stage with the thing (`new RealPlay(id, 1)` over all ids, count it) and run the first-timer on them before and after.
5. **Fail-before / pass-after test** in the real engine on a bare world (`RealPlay.bare([...platforms], vines, ropes)`): the exact
   thumb that failed, plus a guard for whatever the fix must not change. Copy the test into the base worktree and show it fails there
   (`src/game/ropeCatch.test.ts`: 3 of 5 fail on release-0.9.2; the guard fails on the too-broad first version).
6. **Keep the other stages byte-identical.** Hash every other stage's build (platforms, vines, ropes, collectibles, enemies, zones,
   checkpoints, heartFalls) over layouts 1-16, Normal and Easy, on base and on the branch, and diff (the script must load: a `.mts` with
   top-level await; a failed script prints nothing and "diff" says identical).
7. **Re-curate only the stage you changed**, with the same flags its last curation used (check `passed` comes out the same as before
   the change to the pieces, as proof the command matches). A theme that crowds out the rest gets a quota: `curate --theme-cap
   <theme>=<share>` (8-2: `w8:rope-blooms=0.5`, 11 of 16 rolls -> 8, variety 0.560 -> 0.620). Curation of one World 8 stage: ~25 min.
8. **Re-run the first-timer, several trials** (`firstTimer(id, seed, who, { trial })`, trials 0-2): one trial per roll hides noise.
9. **Film it frame by frame** (`tools/art/rope/rec-82-frames.mjs`: pause the engine, `update(1/30)` + `render()` + a screenshot each frame,
   real speed and quarter speed). Playwright's own video at deviceScaleFactor 2 switches frame scale mid-clip; record at 1.

## The bar
- 0 losses at the spot for the first-timer on every roll and trial tested, Easy and Normal; the stage's other numbers no worse than base.
- The fix's test fails on base and passes now; the guard test passes.
- Every other stage byte-identical; the full CLAUDE.md checks green.
- Stills and a frame-by-frame clip at phone size, upright and sideways, that show the moment reading right (example:
  `reference/qa-reports/w8-rope2/8-2-grab-slide-sideways-quarter-speed.mp4`, the README there).

## Checks before reporting
The CLAUDE.md checks (tsc, the full test globs in 3 shards, vite build, artcheck, drawcheck), the stage's build time (time
`buildGen2ForGame` over 16 layouts x 2 settings when the machine is idle: tests running beside it doubled the numbers), the bot table
(before/after, per roll and trial), the polish check against the clip.

## Pitfalls we already paid for
- 2026-11-01: **a fix that is right for one world can be wrong in another.** The falling rope catch, game-wide, caught Pokey on a lower
  rope in 1-4, 2-6, 3-4 and 4-1's zigzag climbs (first-timer rescues 0-2 -> 5-10). Narrowed to a rope jumped for from its own ledge.
  Always run step 4's every-stage before/after.
- 2026-11-01: **the goal can be the unfair spot.** After the rope fix, Normal runs still ended at the sealed door 1-5 blooms short: the
  bloom under every rope was out of reach while hanging (the reach measured from his feet), and blooms on short boughs sit where a hop
  takes off and lands (36-55 px under the flight, reach 34). Count what each run leaves and classify it (on a knot / bough / arc; passed
  over / under / never near) before blaming the bot.
- 2026-11-01: one bot trial per roll said "fixed"; three trials showed the same roll failing 2 of 3.
- 2026-11-01: the headless browser lags the game, so screenshots taken "at the grab" land seconds later; step the engine instead.

## Tried and didn't work
- Lowering ROPE_RISE or widening the grab window for the rope: not needed (the sweep showed the window was fine); would have changed how
  every rope looks and plays for nothing.
- The broad falling catch (every required rope): see Pitfalls.

## To try
- An "adult first-timer" goal measure, as Easy's kid bot sets gen2's Easy goal (goals.ts gen2EasyGoal), for harvest stages on Normal.
- Blooms on short boughs placed along the hop's arc (8-2; the petal pass for every gen2 world).
