#!/bin/bash
# usage: suite.sh <worktree dir> <tag> [K shards]; runs the CLAUDE.md suite in K shards in parallel, logs to scratchpad
W=$1; T=$2; K=${3:-3}; S=${S:?set S to your scratchpad dir}
cd $W
echo "start $(TZ=America/New_York date +'%-I:%M %p') shards $K" > $S/suite-$T.log
for i in $(seq 1 $K); do
  ( npx tsx --test --test-shard=$i/$K src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $S/suite-$T-$i.log 2>&1; echo "shard $i exit $? $(TZ=America/New_York date +'%-I:%M %p')" >> $S/suite-$T.log ) &
done
wait
for i in $(seq 1 $K); do sed 's/\x1b\[[0-9;]*m//g' $S/suite-$T-$i.log | grep -E '^# (tests|pass|fail|todo|cancelled)' | tr '\n' ' ' | sed "s/^/shard $i: /" >> $S/suite-$T.log; echo >> $S/suite-$T.log; done
echo "end $(TZ=America/New_York date +'%-I:%M %p')" >> $S/suite-$T.log
