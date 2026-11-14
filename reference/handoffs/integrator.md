# Handoff: the integrator (merges the GREEN branches into the next test link). Rewritten by INT-9b, 11-14 5:41 PM ET.

No role card yet (INT-7/8/9/9b's suggestion: reference/roles/INTEGRATOR.md). Until then: the packet, gates.md, release.md (test
link part), this note, and the last INT-n REPORT (reference/qa-reports/INT-9b/REPORT.md, then INT-9/REPORT.md).

## Open now
- origin/t-int-9@09f44c30 = link #3 GREEN (1-7 + everything INT-9 merged, OLD 1-6). Every gate once on b288b3fa; 09f44c30 adds only
  the softFalls11 8-3 re-pin (the lead's rulings) + reference/. Its game build is byte-identical to fb409960's but for the build stamp.
- PHASE B (packet reference/packets/2026-11-14/INT-9b.md on the lead's branch; waits for the lead's word that t-build-16 is GREEN):
  merge origin/t-build-16 (dry run: 10 conflicts, listed in INT-9b REPORT), take its tools commits with it (8f429a6a, e4322053 not on
  t-int-9 yet), delete the old 1-6 (ENG-16F did it on t-build-16: af672cc1..b89dee5d, so it comes with the merge; grep proves
  nothing reads it), re-run the 1-1 calibration ON THE MERGED HEAD (never pick either side's calibration-main.jsonl), D70 review
  (BUILD-16b seal done: one FAIL, DotGuide.tsx:1430 goal.done reads objectiveType, fix with countedGoal + planted test; BUILD-16c/16d
  bot code in firsttimer.ts still to review), every list --check, castBots 1-6/1-7, tierBots, every gate once, 1-6 stills + clips.

## How INT-9/9b ran (copy it)
1. Read every branch's REPORT top lines; skip a branch that is not GREEN on its own head and say so.
2. Worktrees: the main checkout for merges and edits; a FROZEN worktree (`git worktree add --detach`, node_modules symlinked) for the
   gate run; a scratch worktree for bisects and dry merges. Never edit a tree a run is reading. Unshallow first (`git fetch --unshallow`):
   roadmapcheck refuses a shallow clone.
3. Conflicts: a resolver script, every choice written in the merge commit. Generated files re-made, never hand-merged.
4. Right after the merges: libstage --seeds 8 on every listed stage and every seedlist --check.
5. A bot or harness change (tools/inspect/firsttimer.ts, src/game/realPlay.ts) moves tierBots: re-run BOTS.md's calibration on the
   LINK's 1-1 (`npx tsx tools/inspect/tierBots.ts --stage 1-1 --tiers child,middle,expert --seeds 1-40 --setting both --calibrate`,
   3 min), compare tables (pass/fail flips = 0), recommit. Another branch's jsonl only replays on that branch's 1-1.
6. The full gate script (qa-reports/INT-9b/gates/run.sh) ONCE on the final head, run_in_background, nothing else heavy beside it;
   buildcheck last and ALONE (stop your own shooters first). If the head must change mid-run, stop the run (TaskStop) and restart once.
7. A red: bisect (scratch worktree), measure what moved, show it on the game, then fix at the root or ask the lead with options.
   A loop test stops at its first failing item: after a fix, run the WHOLE file and confirm every item is reached.
8. Prove "screens unchanged" with a dist diff (build both heads with BASE_PATH, normalize vite hashes + the build stamp).

## Traps hit
- `?layout=N` plays variant N+1 (stageGenerator.ts rollLayoutVariant); a test's setLayoutVariant(v) is `window.__play(id, v)`.
- tsx scripts with top-level await must be .mts. Shooters: INT-9b/softfalls83/shoot83.mjs (vite in any tree, playwright from main).
- `rm -f $VAR/*` is refused by the safety check: use a literal absolute path.
- Times: paste from `date` in the same step, messages too (INT-9b typed three, D30).
- ENG-16F and other members may message you directly with commits to take: the lead decides scope; say so to both.
