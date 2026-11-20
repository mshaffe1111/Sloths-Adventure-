#!/bin/bash
# 4 heavy jobs, each looped until $S/stop-load exists: drawcheck + suite shards 1/6, 2/6, 3/6
S=/tmp/claude-0/-home-user-Sloths-Adventure-/a0959451-3679-52bc-b531-cd87c8d23fb5/scratchpad
cd /home/user/Sloths-Adventure-
rm -f $S/stop-load
GLOB="src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
( while [ ! -f $S/stop-load ]; do node tools/perf/drawcheck.mjs > $S/load-draw.log 2>&1; echo "draw $(date +%T) $?" >> $S/load-rounds.log; done ) &
for k in 1 2 3; do
  ( while [ ! -f $S/stop-load ]; do npx tsx --test --test-shard=$k/6 $GLOB > $S/load-shard$k.log 2>&1; echo "shard$k $(date +%T) $?" >> $S/load-rounds.log; done ) &
done
wait
