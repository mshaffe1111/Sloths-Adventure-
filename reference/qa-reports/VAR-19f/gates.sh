#!/bin/bash
# VAR-19f: THE CLAUDE.md CHECK LIST once, plus CI's extra gates (gates.yml), on one head, each to its own file, a PASS/FAIL line each.
cd /home/user/Sloths-Adventure-
O=reference/qa-reports/VAR-19f/gates; mkdir -p $O
S=$O/summary.txt; echo "head $(git rev-parse --short HEAD) started $(TZ=America/New_York date)" > $S
g() { local n=$1; shift; local t0=$(date +%s); bash -c "$*" > $O/$n.txt 2>&1; local r=$?; echo "$n: $([ $r = 0 ] && echo PASS || echo FAIL) (exit $r, $(( $(date +%s)-t0 )) s, done $(TZ=America/New_York date +%H:%M))" >> $S; }
g tsc "npx tsc --noEmit -p ."
g build "BASE_PATH=/Sloths-Adventure-/ npx vite build"
g chunkcheck "node tools/perf/chunkcheck.mjs"
g artcheck "node tools/perf/artcheck.mjs"
g knowncheck "node tools/perf/knowncheck.mjs"
g generalitycheck "npx tsx tools/engine/generalitycheck.ts"
g roadmapcheck "node tools/roadmapcheck.mjs"
g coveragecheck "npx tsx tools/difficulty/coveragecheck.ts"
g registrycheck "npx tsx tools/engine/registrycheck.ts"
g lists-check 'L=$(npx tsx tools/engine/registrycheck.ts --lists) || exit 1; f=0; for s in $L; do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || { echo "LIST FAIL $s"; f=1; }; done; exit $f'
g engine-tool-tests "npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/inspect/sweeper.test.ts tools/inspect/posted.test.ts tools/inspect/chaseBots.test.ts tools/inspect/boaBots.test.ts tools/inspect/riverRide.test.ts tools/inspect/padRide.test.ts tools/inspect/lianaRide.test.ts tools/difficulty/coveragecheck.test.ts tools/difficulty/rideChannel.test.ts tools/inspect/clockRide.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/firsttimer.test.ts tools/inspect/clip.test.ts tools/inspect/routeHumps.test.ts tools/inspect/pitClimb.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts tools/engine/tipwalk.test.ts tools/difficulty/score.test.ts tools/testlink/build.test.ts"
g tipwalk "npx tsx tools/engine/tipwalk.ts --layouts 4"
g tierBots "npx tsx --test tools/inspect/tierBots.test.ts"
g funcheck "npx tsx tools/validate/funcheck.ts"
g kbdcheck "node tools/perf/kbdcheck.mjs"
g buildcheck "node tools/perf/buildcheck.mjs"
g clipcheck "node tools/perf/clipcheck.mjs"
g drawcheck "node tools/perf/drawcheck.mjs"
echo "ended $(TZ=America/New_York date)" >> $S
