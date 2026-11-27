#!/bin/bash
# INT-R5 THE FULL SET run 2: the unit suite alone on the FROZEN worktree $1, in 3 shards one after another
S=$(cd "$(dirname "$0")" && pwd); W=$1; O=${2:-$S/out}; mkdir -p $O; SUM=$O/fullset.txt
cd "$W" || exit 9
echo "== SUITE on $(git rev-parse --short=9 HEAD)" >> $SUM
for k in 1 2 3; do t0=$SECONDS
  npx tsx --test --test-shard=$k/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $O/g-suite$k.log 2>&1; rc=$?
  [ $rc -eq 0 ] && v=PASS || v=FAIL; echo "suite $k/3 $v (exit $rc, $((SECONDS-t0)) s) $(grep -E '^# (pass|fail)' $O/g-suite$k.log | tr '\n' ' ')" >> $SUM
done
echo "== SUITE done" >> $SUM
