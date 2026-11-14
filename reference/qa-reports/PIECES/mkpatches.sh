#!/bin/sh
# PIECES: the hooks in files other members hold, as patches against the base (origin/ccr-ea739a2f-dfcee4). Re-run after each piece.
#   sh reference/qa-reports/PIECES/mkpatches.sh
BASE=origin/ccr-ea739a2f-dfcee4
D=reference/qa-reports/PIECES
git diff $BASE -- src/game/engine.ts > $D/engine.patch
git diff $BASE -- src/game/types.ts > $D/types.patch
git diff $BASE -- src/game/stageGenerator.ts > $D/stageGenerator.patch
git diff $BASE -- src/game/gen2/pipeline.ts > $D/pipeline.patch
git diff $BASE -- src/game/gen2/types.ts > $D/gen2.types.patch
git diff $BASE -- src/game/castPlay.ts > $D/castPlay.patch
git diff $BASE -- src/game/castPlay.types.ts > $D/castPlay.types.patch
wc -l $D/*.patch
