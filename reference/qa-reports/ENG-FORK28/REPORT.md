# ENG-FORK28 REPORT (rule 26: the engine piece 2-8's build found missing). Started 6:17 PM ET 2026-11-26 (from the session hook date).

## EXACT NEXT STEP (written 6:24 PM ET from `date`; the frozen candidate is 408679c3d on t-eng-fork28)
The piece and its toys are DONE and pushed (408679c3d). The gates of THAT candidate are running in a frozen worktree (src chattr +i) at
the scratchpad's `cand/`: lockall (baseline recorded on e878b1f45 in `base/`, then `--check` on the candidate), the suite in 6 shards,
and the CI tool line (gates.yml's rolled job: the engine tools' tests, tipwalk, storyTipScan, teachFirstScan, registrycheck, tierBots,
buildcheck; kbdcheck; the seedlists matrix). NEXT: read each log as it lands and write its line in "Gates" below; any red that is not
KID_RUNS_59 (the release line's inherited red, R-165.473) is a stop: name it here with its log line, never re-run to green. All green:
the landing hash is 408679c3d (+ this report's commit), sent to the lead.

## The piece (pipeline.ts `rolledGraph`, the fork count)
- A DESIGNED graph (`GraphBrief.dealExact`, a level's arc) lays exactly the forks its code writes: its F nodes, at their places, every
  roll; no coin is drawn on that path. `branching` is a ROLLED graph's count only (none 0, some 1 + a coin, lots 3 + a coin), as before.
- A designed brief whose `branching` is not 'none' THROWS by name ("a designed graph's forks are its code's F nodes; the brief's
  branching 'some' is for a rolled graph (write 'none')"). Every designed brief in the game writes 'none' (grep: no file has dealExact
  with 'some' or 'lots'), and every designed arc before 2-8 has no F, so their count (0) and their stream are unchanged.
- General: no stage id, seed or x (generalitycheck PASS, 26 literals, 26 known).

## Toys (src/game/gen2/designedForks.test.ts), each way
1. 2-8's real code (one F[P+|P]) lays exactly one fork, at its written node (same written neighbours, same count of content nodes
   before it), on seeds 1-40 x Normal and Easy. RED on e878b1f45 (the F turned into a practise: 'none' = 0 forks), GREEN on 408679c3d.
2. A designed brief with branching 'some' is refused by name. RED on e878b1f45 (no throw), GREEN on 408679c3d.
3. 1-1 (rolled, branching 'some'): its fork counts on seeds 1-40, Normal and Easy, pinned from the pipeline at e878b1f45, unchanged.

## 2-8 seed 1's 'pool is spent' (libstage --stage 2-8 --seeds 4, both settings, on 408679c3d)
Thrown 0 of 4 on both settings: the 'pool is spent' throw is gone, and so are "the plan out of order", "pool short at slot 10/11/13
(practise)" and "flood: the high road breaks at x 8201" (all from the F laid as a practise). 2-8 is still CLEAN 0 of 4; what is left
is BUILD-28's to judge (none is the fork count): legs overlay (4), flags way apart / last px from the exit (4), the flood's low-road
tail-off vs the line's prompt (3), asks 'Pw#>' content 'p' no piece on a clock (2-3), '#water@flood laid soft' (2-3), the fork tip said
before its socket past TIP_NEAR (2), one finish throw (a fall with no bank at one end, Normal), and on Easy "could not lay Normal's
plan" (4).

## Gates (the frozen candidate 408679c3d)
- tsc: 0.
- generalitycheck: PASS.
- lockall --check vs e878b1f45: (running)
- the suite, 6 shards: (running)
- the CI tool line: (running)

## Polish check
Engine-only (the node count of a graph); no screen changes. The proof is the toy and libstage lines above.

## Lessons applied
D115 (frozen worktree for the gates), D119 (no heredoc in a commit chain), D128 (stamps from `date`), D134 (next step pushed and
ls-remote-confirmed before the hand-over), D138 (no new work after it), D140 (ReadNotifications at each step), D141 (the CI line on
this candidate, not left to the end).

## Learned / proposed rule changes
- The fork count rule lived only in the brief; a designed arc is the first case where the code, not the brief, owns a count. Any
  other count the brief rules impose (teach, finale, rests) is worth the same read for a designed arc: proposed for the Architect,
  not done (types.ts `branching`'s doc comment should say "a rolled graph's"; it is the Architect's file).
- needsFork on the laid code's check (pipeline.ts `checkCode` after the lay) still reads `branching !== 'none'`; a designed code's F is
  kept by construction, not by V17 there. Proposed: needsFork true when a designed code writes an F (a one-line change, its own test).
