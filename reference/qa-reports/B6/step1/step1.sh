#!/bin/bash
# ENG-B6 step 1 proof on the merge commit (frozen worktree): the whole suite (CLAUDE.md glob, 3 shards as INT-9b), lock vs t-int-9, chaseBots, tierBots
O=/home/user/b6logs; R=$O/RESULTS.txt; M=/home/user/wt-b6-merge; I=/home/user/wt-b6-int9
echo "merge head $(git -C $M rev-parse --short HEAD) int9 $(git -C $I rev-parse --short HEAD) start $(TZ=America/New_York date +'%-I:%M %p')" > $R
g() { local n=$1; shift; "$@" > $O/$n.log 2>&1; echo "$n $? $(TZ=America/New_York date +'%-I:%M %p')" >> $R; }
(cd $I && g lock-int9-out npx tsx tools/engine/lockall.ts --layouts 16 --out $O/lock-int9.json) &
cd $M
for i in 1 2 3; do (npx tsx --test --test-shard=$i/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $O/unit$i.log 2>&1; echo "unit$i $? $(TZ=America/New_York date +'%-I:%M %p')" >> $R) & done
g tsc npx tsc --noEmit -p .
g chaseBots npx tsx --test tools/inspect/chaseBots.test.ts
g tierBots npx tsx --test tools/inspect/tierBots.test.ts
wait
g lock-check npx tsx tools/engine/lockall.ts --layouts 16 --check $O/lock-int9.json
echo "done $(TZ=America/New_York date +'%-I:%M %p')" >> $R
