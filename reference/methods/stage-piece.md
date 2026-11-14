# Method: a runtime stage piece (HOOKS, ENGINE-678 W0, 11-13; R-165.198: every piece is a node building block)

A runtime piece is anything a stage's data lays that the engine runs while he plays (a ride, a rolling nut, a sweeper's shadow, a
chase, a cover's tint, a vine snake). It plugs into the one hook; engine.ts is not edited for it.

1. **Data first.** The piece is laid by a world's table (gen2 `<piece>Lay.ts`, the RIDE / STILL pattern) and named by a letter or
   dial in gen2/nodeLetters.ts (the one letter table). New letter: add it there, run `npx tsx tools/engine/nodekey.ts`, commit the key.
2. **The kind.** `src/game/pieces/<piece>Piece.ts` exports a `PieceKind` (stagePiece.types.ts): `start(stage, host)` reads the stage's
   data and returns one `StagePiece` or null. Add it to `PIECE_KINDS` (pieces/index.ts) in the order it must step and draw.
3. **The piece.** `step(dt, host)` each fixed step; `draw(ctx, layer, host)` only on the `layers` it names ('world' behind him,
   'front' over him, 'screen' in screen px); `respawn(host)` puts back what his run changed (a required piece is whole again);
   `hurts(host)` returns `{ amount, fromX }` or null (the engine's one damagePlayer deals it). Read the engine only through `host`.
   No stage id, world number, seed or x in the piece (generalitycheck).
4. **Planted test first** (src/game/<piece>Piece.test.ts, a glob CI runs): red without the piece, green with it, through RealPlay on
   2+ worlds' stages (pieceHook.test.ts is the template: `bare()` the stage, set `e.clock`, call `e.startPieces()`).
5. **Look at it:** a still upright and sideways of each layer it draws (the headless canvas cannot paint; shoot in the browser).
6. **Gates:** the full CLAUDE.md Checks on the head; the lock shows only the stages the packet names; drawcheck within limits. Run
   the gate script in its own worktree or wait for it: never edit the tree while it runs.
