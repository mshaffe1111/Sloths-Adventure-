#!/bin/bash
# INT-R4 THE FULL SET run 2: the suite alone on the frozen worktree
S=$(dirname "$0"); W=$1; SUM=$S/fullset.txt
cd "$W" || exit 9
echo "== SUITE on $(git rev-parse --short=9 HEAD)" >> $SUM
t0=$SECONDS; npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $S/g-suite.log 2>&1; rc=$?
[ $rc -eq 0 ] && v=PASS || v=FAIL; echo "suite $v (exit $rc, $((SECONDS-t0)) s)" >> $SUM
