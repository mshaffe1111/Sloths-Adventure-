# Allowed files for the next packets (R-165.61 done-item 3, 2026-11-10)

All branch from main **after A1 (t-engine-putback@41c2e248) merges**, or from A1's branch: A1 touches engine.ts, pipeline.ts,
types.ts and w1.ts, and every packet below is written on top of it. A packet may READ anything; it WRITES only its list. Tests a
packet adds (`*.test.ts` beside a file it owns) are in its list. A file outside the list is a PUSHBACK to the PM, never a quiet edit.

## Order (the shared files, and who goes first)
| Shared file | First | Then | Why |
|---|---|---|---|
| src/game/gen2/provenSeeds.ts, tools/engine/lockall-main-0.9.4.json (or its successor) | E0 (code that judges) | C1 (regenerates the data) | the seeds are proven by E0's verdicts; E0 and C1 ship in ONE PR |
| src/game/gen2/worlds/w1.ts | C1 (numbers, sections) | C2 (only the `props` / `decor` / sheet entries) | the re-lay moves sections; art places onto the moved ones |
| src/game/playRecorder.ts | E1 (uses, not runs) | E2 (the help events, help.md §5) | E2 logs through the event shape E1 fixes |
| src/game/engine.ts | E2 (put-back hook, grown step) | E3 (the draw-loop hunk only) | test link A ships E2; WebGL is its own lane and rebases |
No other file is in two lists. **Parallel:** E0 + C1 (one integration branch, E0 commits first), E1, C2's cutting, E3 all start at
once; E2 starts at once and rebases onto E1 before it touches playRecorder.ts.

## E0, Engine: the verdicts, the reach data, the first-run picker (ADR-001, ADR-002) (not one of the four asked for: added, because
C1's re-lay must be judged by the new verdicts and someone must write them; the Architect writes types only)
- NEW src/game/gen2/reach.ts (the FlownArc rows and BandTable, each row's `source` naming reach.md / bands.md), src/game/gen2/verdicts.ts
  (the checks, one per VerdictName), src/game/gen2/verdicts.test.ts (a planted roll that fails by EACH name, and one that passes).
- src/game/gen2/pipeline.ts (maxGap, riseLimit, BOUNCE_REACH, reachJump read reach.ts; `falls` become Drop records; Gen2Meta filled),
  src/game/gen2/types.ts (Gen2Meta gains `verdicts: Record<Difficulty, RollVerdict>` and `drops`; `errors` stays, derived),
  src/game/gen2/promises11.ts and src/game/gen2/seedList.ts (both read one PromiseRegistry; no substring filter),
  src/game/levelCheck.ts (jumpOK and heldMaxGap read the arcs; nothing else moves), src/game/physics.ts (comments only: which
  constants are now closed-form ballistics, not reach; no value changes, other stages read them).
- The first-run picker: src/game/testlink1_1.ts, src/game/stageGenerator.ts (the gen2Roll11 branch only), src/game/saveFile.ts
  (`oneOneFinished`, read from old saves' progress).
- Tools: tools/engine/seedlist.ts (checks firstRun11.ts too), tools/engine/rulers.ts (the reach figures it judges by).
- Done-items the Critic runs: tsc; the full test list; `tools/engine/lockall.ts --check` against main's lock: only 1-1 may move.

## C1, Content: the 1-1 re-lay and the first-run layout (R-165.72, R-165.52 data)
- src/game/gen2/worlds/w1.ts (every row of bands.md §5: DOUBLE_TEACH / DOUBLE_TEST, the D/E rise blocks on Easy 128-132, bounce lips
  232-246 with the mushroom 20-60 px out, U/V 236-250; the three chains inside the single band or with a catch road; a practice gap
  before each double gap; fewer or shorter bounce pieces; the post at w1.ts:519 checked), src/game/gen2/worlds/w1.test.ts.
- NEW src/game/gen2/firstRun11.ts (the one FirstRunLayout and its lock).
- Data after E0: src/game/gen2/provenSeeds.ts, the lockall record, tools/engine/seedlist.ts's output files.
- reference/specs/ is READ-ONLY (the Designer's); a band C1 can't meet is a PUSHBACK, not a new number.

## E1, Engine: the recorder (R-165.58; what is left: `move double` counts runs, not uses)
- src/game/playRecorder.ts (each use of the double and bounce logged, the first per stage still marked as first), its test,
  tools/playtesters/report.py (reads uses; old logs read as before). Nothing in engine.ts: the calls exist already.

## E2, Engine: escalating help (R-165.62; ONE-ONE-FIX-PLAN A2 and the 11-09 ruling: 3 / 5 / 8 Easy, 3 / 12 Normal in 1-1)
- NEW src/game/helpLadder.ts (+ test): failures per piece (a put-back OR a life lost), kept through a lost life and a game over and
  retry of the same stage, reset past the piece or on leaving for the map; the long count for 1-1 only; past 1-1 a game over at a
  piece goes straight to Normal's offer. It is the ONE place that decides help, so a player is never offered two helps at once.
- src/game/assist.ts (+ test): shouldOfferHelp becomes a reader of helpLadder (the extra-lives offer is one rung, not a second system).
- src/components/GameOverCard.tsx (asks the ladder), NEW src/components/HelpOffer.tsx (Normal's "want a step here?" yes/no; Play
  Store §6 and clipcheck apply), src/game/stuckHelper.ts (STUCK_TRIES becomes the ladder's first rung), src/game/padControl.ts (Easy's
  tap-is-a-full-jump at that piece), src/game/engine.ts (the put-back calls the ladder; the grown step, kept for the run),
  src/game/playRecorder.ts after E1 (help.md §5's events), the Dot lines file the story keeper names (lines only).
- The ghost (help.md step at 8) is NOT in E2 (cut from test link A).

## E3, Engine: WebGL stage 0 (R-3.1; port of warmup-5m 65b6c33a, never on main)
- package.json, bun.lock (PixiJS v8 pinned; warmup-5m measured 435 KB of Pixi chunks: they ship as their own lazy chunks,
  never in the main chunk, whose 31 KB room they would break; buildcheck's sizes named in the report), NEW src/game/gpuLayer.ts (+ test), src/App.tsx, src/game/engine.ts (the draw-loop hunk
  only, after E2), NEW tools/qa/gpuLayer.cjs, tools/qa/gpuLook.cjs, reference/methods/webgl.md.

## C2, Content: Matt's art (R-165.85: the 15 sheets in reference/art-incoming/matt-2026-11-09/ on ccr-ca657d3c-n09zty, the 91 pieces
on art-raw-2026-11-07 under cut/, W1/, W2/)
- NEW only, any time: the cut pieces under src/assets/ (a new folder per sheet set, each piece under 4096 px, the 4 MiB rule per
  asset), NEW src/game/w1Art1109.ts (their atlas data, as w1NewArt.ts does), a catalogue and the mock-up sheet for Matt's yes in
  reference/art-incoming/.
- After Matt's yes AND C1's merge: src/game/stageSheets.ts (the sheet's entry), src/game/gen2/worlds/w1.ts (props / decor / looks
  entries only). **Shares w1.ts with C1: C1 first.** A piece that needs a new draw path is an Engine request, not a C2 edit of engine.ts.
- The drops' looks (ADR-001 SoftLook / LethalLook): any new pit-floor or water art is C2's; E0's `drop.look-lies` names the look keys.
