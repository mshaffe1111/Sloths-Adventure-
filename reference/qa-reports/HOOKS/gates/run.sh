#!/bin/bash
# HOOKS: every CLAUDE.md Check and every CI step ONCE on the head (ENG-INT5 run.sh), each result to RESULTS.txt as it ends; then the
# lock vs the base 204e3dec (= f9671e3b, ENG-INT5 102/102). Timing gate (buildcheck) last and alone. Foreground, waited for (D59).
cd "$(dirname "$0")/../../../.."
O=reference/qa-reports/HOOKS/gates; R=$O/RESULTS.txt; L=${LOCKDIR:?set LOCKDIR to the folder holding lock-base.json (lockall on the base 204e3dec)}
echo "head $(git rev-parse --short HEAD) start $(TZ=America/New_York date +'%-I:%M %p')" > $R
g() { local n=$1; shift; "$@" > $O/$n.log 2>&1; echo "$n $? $(TZ=America/New_York date +'%-I:%M %p')" >> $R; }
g tsc npx tsc --noEmit -p .
for i in 1 2 3; do (npx tsx --test --test-shard=$i/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $O/unit$i.log 2>&1; echo "unit$i $? $(TZ=America/New_York date +'%-I:%M %p')" >> $R) & done
g build env BASE_PATH=/Sloths-Adventure-/ npx vite build
g chunkcheck node tools/perf/chunkcheck.mjs
g artcheck node tools/perf/artcheck.mjs
g knowncheck node tools/perf/knowncheck.mjs
g generality npx tsx tools/engine/generalitycheck.ts
g roadmap node tools/roadmapcheck.mjs
g kbdcheck node tools/perf/kbdcheck.mjs
git checkout -- reference/qa/tester-page-1106/ 2>/dev/null
g seedlists bash -c 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
g registry npx tsx tools/engine/registrycheck.ts
g tooltests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/routeHumps.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts
g tierBots npx tsx --test tools/inspect/tierBots.test.ts
wait
g lockall npx tsx tools/engine/lockall.ts --layouts 16 --out $L/lock-head.json --check $L/lock-base.json
g drawcheck node tools/perf/drawcheck.mjs
g clipcheck node tools/perf/clipcheck.mjs
g buildcheck node tools/perf/buildcheck.mjs
echo "done $(TZ=America/New_York date +'%-I:%M %p')" >> $R
