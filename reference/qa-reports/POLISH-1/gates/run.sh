#!/bin/bash
# POLISH-1: the CLAUDE.md Checks on the head, each result line to RESULTS.txt as it ends (the file is the record if the session stops)
cd "$(dirname "$0")/../../../.."
O=reference/qa-reports/POLISH-1/gates; R=$O/RESULTS.txt; echo "head $(git rev-parse --short HEAD) $(TZ=America/New_York date +'%-I:%M %p')" > $R
g() { local n=$1; shift; "$@" > $O/$n.log 2>&1; echo "$n $?" >> $R; }
g tsc npx tsc --noEmit -p .
for i in 1 2 3; do (npx tsx --test --test-shard=$i/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $O/unit$i.log 2>&1; echo "unit$i $?" >> $R) & done
g build env BASE_PATH=/Sloths-Adventure-/ npx vite build
g chunkcheck node tools/perf/chunkcheck.mjs
g artcheck node tools/perf/artcheck.mjs
g knowncheck node tools/perf/knowncheck.mjs
g generality npx tsx tools/engine/generalitycheck.ts
g roadmap node tools/roadmapcheck.mjs
g kbdcheck node tools/perf/kbdcheck.mjs
g seedlist11 npx tsx tools/engine/seedlist.ts 1-1 --check
g seedlist14 npx tsx tools/engine/seedlist.ts 1-4 --check
g tooltests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts
g tierBots npx tsx --test tools/inspect/tierBots.test.ts
wait
g drawcheck node tools/perf/drawcheck.mjs
g clipcheck node tools/perf/clipcheck.mjs
g buildcheck node tools/perf/buildcheck.mjs
echo "done $(TZ=America/New_York date +'%-I:%M %p')" >> $R
