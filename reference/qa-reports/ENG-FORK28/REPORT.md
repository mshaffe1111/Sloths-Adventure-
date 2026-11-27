# ENG-FORK28 REPORT (rule 26: the engine piece 2-8's build found missing). Started 6:17 PM ET 2026-11-26 (from the session hook date).

## EXACT NEXT STEP (rewritten 6:58 PM ET from `date`; candidate 408679c3d is RED BY ME, the fix is the next session's (D138))
FOUND (on 408679c3d's gates, checked on the base e878b1f45): a TOY wrote a fork it never meant. `src/game/gen2/toyHome.ts:59`
POST_CODE = 'A Pg1> Xw1> R Fg1> R /D ...' (its comment: "a flow of ground"; F is the FORK letter, M is flow, nodeLetters.ts:42/45).
Its brief is designed (dealExact, branching 'none'), so on e878b1f45 'none' turned that F into a practise; on 408679c3d the F is a
fork, the toy's pool has no fork section, and every POST_CODE roll fails ("seedList: a proven plan has a loosened slot (n5 fork: no
section for the job left ...)" / "the toy lays on most rolls (4 of 8)"). RED on 408679c3d, GREEN on the base: firstMet, postLay x2,
easyRouted, pacerRespawn, hopJudged (2-7's post tests on the toy). PROVEN: with POST_CODE's 'Fg1>' written 'Pg1>' (what the base laid
it as), firstMet 2/2, postLay 3/3, easyRouted 1/1, pacerRespawn 2/2 pass (a scratch edit in the main tree, restored, not committed).
STEP 1: on t-eng-fork28, write POST_CODE's 'Fg1>' as 'Pg1>' (one letter; the toy then lays what it laid before, as it was laid:
prove it by hashing buildGen2Stage(homeKit(id, POST_CODE)) seeds 1-12 x both settings on e878b1f45 vs the new head, equal).
Fix the comment ("a practise of ground"). Grep every other code for an F with no roads (`/(^| )F[a-z]/`) under a dealExact brief
(none found in src/game/gen2/worlds; toyHome's is the one). STEP 2: the new candidate's gates in full, unfrozen src this time
(the chattr +i freeze made seedListChunk.test's mkdtemp fail EPERM: a harness fault of mine, not a red of the code; freeze only the
files the gates must not change, or none). Inherited reds (red on the base too: name, never fix here): 2-8 itself (no seed of 24
builds cleanly; storyTipScan, registrycheck, chaseRespawnReal, pitPocket, stageSheets, registrycheck.test, easyMode x4, levels x3,
stageStart x2, harpy, artUse, w1NewArt in shard 2 all throw on 2-8), KID_RUNS_59 (R-165.473). Then the landing to the lead only.

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
- lockall --check vs e878b1f45: 101/102 stages unchanged. 2-8 moved, and only in its refusal text: on both settings and both heads no seed of 24
  builds cleanly; the first error's x is 6401 on the base and 6433 on the candidate (its fork is now laid). No other stage moved.
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
