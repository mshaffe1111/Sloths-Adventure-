# REPORT: R-165.86, no fall in 1-1 costs a life (Engine, attempt 1), 2026-11-09 9:32 PM ET
Branch t-engine-putback from origin/main 181d2846. PUSHBACK.md (accepted by the lead) is on the branch.

## Method used
reference/methods/stage-fix.md's order (planted failure first, prove nothing else moved); the packet. No method file covers an engine
rule read from stage data: see Method update.

## Lessons applied
- Check a fact in code before acting (D7): the frozen input "Easy has no soft falls in 1-1" was measured on main and was wrong.
- A gate must call the same code the screen calls (D19): the tests ask `softFallStage`, the function the engine asks.
- Test the measuring tool (D15): RealPlay stubs loseLife; the sweep deletes the stub (softFall11.test.ts `real()`). Critic: fly it the same way.
- Times from `date`, hashes from git (D20, D30).

## 1. Done-items
1. PASS. `src/game/gen2/softFalls11.test.ts`: 1-1 laid on all 16 window seeds, Normal and Easy: no gap that is not water costs a
   life (softFallStage, or a soft zone). `src/game/softFall11.test.ts`: seeds 3747, 15458, 19582 on each setting, off the right edge
   of every solid piece with the REAL loseLife: no lostLife, lives unchanged, every set-back standing on a solid ledge behind the fall.
   Red on origin/main: reference/qa-reports/R-165.86/red-on-main.txt (6 fail: both lay tests, the 3 Normal sweeps, the flight; the 3
   Easy sweeps pass on main, as the pushback said). Both files also hold a planted test (the stage without the brief's word).
2. PASS. softFall11.test.ts "w1-log-chain-rise": Normal seed 3747, walked off the first rise: one `softFall`, no `lostLife`, lives
   and hearts unchanged, standing on the ledge he left, clear of its edge.
3. PASS. softFalls11.test.ts: 1-2 and 8-3 Normal (8-3 has heart falls), layouts 1-3: platforms, heartFalls and gen2.falls hash the
   same as origin/main (pins made on a worktree of 181d2846). Also: 1-1's ground, zones, gaps and floorlessGaps verdicts are the same
   with and without the word, on 4 listed seeds and raw rolls 1-6, both settings; floorlessGaps ignores the word (planted).
4. PASS. `npx tsc --noEmit -p .` clean. `npx tsx --test src/game/gen2/*.test.ts`: 264 pass, 0 fail. Touched and 1-1-hosted tests
   (softFall, softFall11, plainWalk, vineFollowUps, recorderMoments, w1NewArt, stage11, realPlay, firsttimer, gen2/worlds/*): 98 + 18
   pass, 0 fail. `npx tsx tools/engine/seedlist.ts 1-1 --check`: PASS (138 seeds, each clean on both settings). No seed changed.
5. PASS, one thing named. reference/qa-reports/R-165.86/setback-sideways.png and setback-upright.png (contact sheets, dev build,
   Normal, seed 3747): he lands standing on the log, 150 px back from its edge; hearts and lives as before. The frame log
   (camera-*.json) shows ONE camera jump, on the frame the iris starts (0.45), then only the usual settle; no flash.
   Rough: Dot's "Flick up and forward to jump." comes up after the set-back in these stills; it is the stage's own hint at that spot
   (lessons were off), not new, but after every set-back it will read as nagging. A2 (R-165.62) should own what is said there.
6. PASS. reference/handoffs/engine-core.md rewritten (§0 rulings, the open rows, traps 9-12).

## 2. Polish check
The two sheets above, judged upright and sideways. Nothing fixed: softFall's own picture is used unchanged.

## 3. Pushback
PUSHBACK.md, accepted: 1-1 is not in GEN2_STAGES, so Easy already had softOn on main. Only Normal changes for the player.

## 4. Suggestions (outside my walls)
- RealPlay notes soft set-backs. Objective: `RealPlay.setBacks` counts softFall, so tools that read `died` on 1-1 (realReach.ts,
  plainWalk.test.ts, tools/inspect/firsttimer.ts, tools/validate/play.ts) can tell a failed jump from a made one now that no fall in
  1-1 dies on either setting. Files: src/game/realPlay.ts and those readers. Done: a planted fall in 1-1 Normal is counted.
- softFall.test.ts's two zone tests are hosted in 1-1; I set the toy's `softOn = false` (3 lines, assertion kept). A plain host stage
  for toys would be cleaner.

## 5. Unresolved
- NOT run (the lean ruling; the Critic and the promote run them): the full suite, vite build, drawcheck, clipcheck, artcheck, the
  other gates, and lockall. Expect the lock to show 1-1 changed in its gen2 record only (`softFalls`, and the brief copy).
- softFall.test.ts was edited though the packet's file list names only "tests beside each file you touch": it is engine.ts's test.
- Evidence files sit in reference/qa-reports/R-165.86/ (not in the packet's WRITE list; delete at will).
- Under a rise he can be set back on the low catch branch if he touched it on the way down (read from the layout and softAt's rule, not shot; as Easy does today).

## 6. Method update
Propose for methods/stage-fix.md: "A no-life-lost test in RealPlay must delete the harness's loseLife stub and carry a planted run
that loses lives." Proof: on origin/main the sweep with the stub passes; without it, 9 lives go on seed 3747.

## 7. Turnover note
reference/handoffs/engine-core.md rewritten in this commit.
