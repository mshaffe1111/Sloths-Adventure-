#!/bin/bash
# POLISH-2: the gates re-read on the final head after 76dd013 (engine.ts fieldSfx: comments + one sound call dropped), lead 7:20 PM
cd "$(dirname "$0")/../../../.."
O=reference/qa-reports/POLISH-2/gates; R=$O/RESULTS.txt; echo "--- re-run on head $(git rev-parse --short HEAD) (src as 76dd013) $(TZ=America/New_York date +'%-I:%M %p')" >> $R
g() { local n=$1; shift; "$@" > $O/re-$n.log 2>&1; echo "$n $?" >> $R; }
g tsc npx tsc --noEmit -p .
g generality npx tsx tools/engine/generalitycheck.ts
for i in 1 2 3; do (npx tsx --test --test-shard=$i/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $O/re-unit$i.log 2>&1; echo "unit$i $?" >> $R) & done
wait
g build env BASE_PATH=/Sloths-Adventure-/ npx vite build
g chunkcheck node tools/perf/chunkcheck.mjs
g kbdcheck node tools/perf/kbdcheck.mjs
git checkout -- reference/qa/tester-page-1106/keyboard 2>/dev/null
echo "re-run done $(TZ=America/New_York date +'%-I:%M %p')" >> $R
