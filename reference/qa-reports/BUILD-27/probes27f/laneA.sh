#!/bin/bash
# lane A on frozen tree $1, logs to $2
cd "$1" || exit 9; O=$2; mkdir -p $O
r() { local n=$1; shift; local t0=$(date +%s); "$@" > $O/$n.txt 2>&1; echo "$n exit=$? $(( $(date +%s)-t0 ))s" >> $O/lines.txt; }
r tsc npx tsc --noEmit -p .
r seedlist27 npx tsx tools/engine/seedlist.ts 2-7 --check
r suite1 npx tsx --test --test-shard=1/2 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts
r citool npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/inspect/sweeper.test.ts tools/inspect/chaseBots.test.ts tools/inspect/boaBots.test.ts tools/inspect/riverRide.test.ts tools/inspect/padRide.test.ts
r tierBots npx tsx --test tools/inspect/tierBots.test.ts
echo LANE-A-DONE >> $O/lines.txt
