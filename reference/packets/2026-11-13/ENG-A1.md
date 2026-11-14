# ENG-A1: A1 SWING-W1 (ENGINE-678 W1). Opus 5.5 xhigh (engine). Written 11:15 PM ET by the lead.
Plan: reference/plans/ENGINE-678.md (origin/t-engine-678) §1-4, its A1 SWING-W1 row; designs 1-6.md (origin/t-16-design), 1-7.md / 1-8.md
(origin/t-1718-design). Branch t-a1-swing from origin/t-hooks@994ea4e7 (HOOKS: StagePiece + one engine loop + one letter grammar; method
reference/methods/stage-piece.md). The two W1 lanes (A1, B1) never share a file.
## Done
1. W1 liana rows (swing in World 1's moves, w1.ts:1616 is ['double']), grips by data in the reach checks (pressWindow takes grips, physics.ts:729; lianaRelease never passes them, gen2/pipeline.ts:245; a 'hold high' gap), the FAR landing camera measured first (1-6's FAR landings ~740 px out vs ~425 upright, 1-6.md:33-34): if off screen, fix it here.
2. General for every world (D43, R-165.198): by data, a later world reuses it; no stage id/seed/x in engine code; planted tests.
3. lockall 102/102 unchanged vs f9671e3b; full CLAUDE.md Checks on your head in a live session (D59); stills/clip of the piece both ways
   with the built setting printed (D62) for the lead's pass/fail (D61).
WRITE: gen2/worlds/w1Swing.ts, pipeline.ts (lianaRelease only, by token), cameraFollow.test.ts (+ your qa-reports folder). Anything else: ask the lead. BOX: 90 minutes or 40% context: push, REPORT (30 lines + Learned)
with EXACT NEXT STEP, stop. Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
