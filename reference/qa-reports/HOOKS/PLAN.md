# HOOKS plan (ENGINE-678 W0), written 9:55 PM ET, on t-hooks from t-eng-base@204e3dec
1. stagePiece.types.ts (NEW): StagePiece { id, layers, step(dt, host), draw(ctx, layer, host), respawn(host), hurts(host) } and
   PieceKind { id, start(stage, host) } -> one piece or none per stage; layers 'world' (with the traps, behind him), 'front' (over him,
   with the bushes), 'screen' (after the world transform, with the chase/watch edges). Host = the engine's live reads (t, easy, player,
   platforms, clock, standingOnId); a hurt is { amount, fromX } and goes through the engine's ONE damagePlayer.
2. pieces/index.ts (NEW): the registry (PIECE_KINDS) + startPieces/stepPieces/drawPieces/respawnPieces/piecesHurt. pieces/ridePiece.ts (NEW):
   RIDE (t-pieces) moved off engine.ts's moving-platform branch into the hook (no shipped stage lays a ride: lock cannot move).
3. engine.ts (token: HOOKS only): one field, one start (startCast's neighbour), one step (where the ride branch was), one hurt check,
   three draw calls, one respawn call; the ride branch deleted (new replaces old). No stage id/seed/x.
4. Grammar: gen2/nodeLetters.ts (NEW): ONE table of every job and content letter (name, key status, rule, plain words, MUST/MAY/NEVER,
   dials, built by). nodeCode.ts derives CONTENT_OF and JOB_OF from it; m (cover) and h (rolling hazard) named LATER with dials
   (plan §2); s v p t x get key rows; r = rope only; K's row says 1-8. tools/engine/nodekey.ts writes NODE-KEY.html's JOBS/CONTENT/PIECES.
5. Tests (planted first): pieces/hook.test.ts (a piece registered and run through the loop: start, step, draw on its layer only,
   respawn, hurt; RIDE on a real-engine stage); gen2/nodeLetters.test.ts (key == table; code LATER jobs never 'now'; m/h dials named).
WRITE: src/game/stagePiece.types.ts, src/game/pieces/{index,ridePiece,hook.test}.ts, src/game/engine.ts, src/game/gen2/nodeCode.ts,
  src/game/gen2/nodeLetters{,.test}.ts, reference/engine/NODE-KEY.html, tools/engine/nodekey.ts, reference/qa-reports/HOOKS/.
ASK: gen2/nodeAsks.ts (LATER_CONTENT must name m, one line, else an 'm' ask says "no such letter").
Checks: lockall 102/102 vs f9671e3b, drawcheck, full CLAUDE.md Checks on the head.
