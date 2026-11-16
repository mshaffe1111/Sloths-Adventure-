# HOOKS: the piece hook + one letter grammar (ENGINE-678 W0, the foundation every 1-6..1-8 piece plugs into). Opus 5.5 xhigh (engine).
Written 9:49 PM ET by the lead. Plan: reference/plans/ENGINE-678.md on origin/t-engine-678 (read §1-4; HOOKS row; lead
approved HOOKS in W0). Branch t-hooks from origin/t-eng-base@204e3dec (GREEN). You hold engine.ts and nodeCode.ts (no one else this round;
POLISH-3 touches level data only and asks before engine.ts).
## Done
1. `StagePiece` (start, step, draw by layer, respawn, hurts) in stagePiece.types.ts + pieces/index.ts and ONE engine loop that runs every
   registered piece, so later runtime pieces (sweeper draw, roll hazard, chase, cover tint, vine snake) never hand-wire engine.ts again
   (engine.ts:637, :646, :657, :1014-1031, :4530 today). Move NO existing runtime into it unless trivial; prove with ONE real piece
   (pick the smallest from t-pieces: STILL/RIDE) that it starts, steps, draws on its layer, respawns and hurts through the hook.
2. One letter grammar: one table feeds nodeCode.ts AND NODE-KEY.html (code says liana = s, the key puts it under r and lacks s v p t x;
   ENGINE-678 §1 "one letter grammar"); add m (cover) and h (rolling hazard) as LATER letters with their dials named; K's row says 1-8.
3. Planted tests (a piece registered and run through the loop; the grammar table and the key never disagree). lockall 102/102 unchanged
   vs f9671e3b; drawcheck within limits; full CLAUDE.md Checks on your head (D59).
No stage id/seed/x in engine code (generality). BOX: 90 minutes or 40% context. Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
