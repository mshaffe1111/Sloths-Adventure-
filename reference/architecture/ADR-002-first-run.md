# ADR-002: the fixed first run of 1-1, and how replays roll (R-165.52, R-165.61, 2026-11-10)

**Types:** `FirstRunLayout`, `RunPick`, `FirstRunSave` in `src/game/gen2/verdicts.types.ts`.

## Context
- Today every 1-1 Play draws a seed from the proven list in a shuffled order kept in localStorage (testlink1_1.ts drawNext /
  newPlay11, stageGenerator.ts gen2Roll11 -> buildPlayStage). The first-ever run is whatever the order puts first: no two first-timers
  meet the same lesson, and no fix can be checked against "the layout a child meets first".
- R-165.52: the first-ever 1-1 run is one fixed layout; replays roll.

## Decision
1. **Where it lives:** one data file, `src/game/gen2/firstRun11.ts` (new, Content owns the data), holding one `FirstRunLayout`: the
   seed, its proven plan in the seed list's own shape (BuildRequest.replay), and `lock`, the stage-parts hash per setting
   (seedList.ts stageParts). It is built by the same `buildPlayStage` replay path as every proven seed; no second builder.
2. **It is judged like every roll:** both settings `accepted: true` under ADR-001, plus `first-run.drift` when its built parts' hash
   differs from `lock`. `tools/engine/seedlist.ts 1-1 --check` checks it with the proven seeds (CI already runs it).
3. **Which run plays it:** `RunPick` 'first' until the save records a finish of 1-1 on any setting (`FirstRunSave.oneOneFinished`);
   then 'replay' from the proven list in its shuffled order. An old save that has finished 1-1 reads as finished from its progress;
   it never sees the first run again. A quit or game over before the finish replays the SAME first layout (the lesson is learned on one
   map; the help ladder, R-165.62, handles a player stuck in it).
   **The lead's ruling, 2026-11-10 (R-165.61 attempt 2): CONFIRMED.** The first-ever run is not complete until the player finishes 1-1,
   so a quit or a game over before the first finish replays the same fixed layout. R-165.52's "replays roll" means every run AFTER the
   first finish rolls; a retry before it is still the first run, not a replay.
4. **The fixed seed is not a replay draw** for the run right after the first (no "new" run that is the same map).
5. The test link's picker (A/B/C rolls, `?seed`) stays above this: a QA override, never in the shipped path.

## What it rules out
- Two first-timers meeting different lessons; a re-lay changing the first run without the lock telling the Critic.
- A second build path for the first run (it is a replay entry, judged by the same verdicts).
- A finished player stuck on the first map forever, or an old save sent back to it.

## Consequences
- Engine packet E0 writes the picker (testlink1_1.ts, saveFile.ts, stageGenerator.ts) and the type plumbing; Content's re-lay (C1)
  chooses the layout and fills firstRun11.ts. C1 cannot finish before E0's picker exists; it can choose and prove the seed in parallel.
- The save gains one boolean (Play Store rules: local only, no personal data).
