#!/bin/bash
# BUILD-27g lane B: drawcheck, clipcheck, kbdcheck, registrycheck, knowncheck, generality, coveragecheck, suite 2/2
cd "$1" || exit 9; O=$2; mkdir -p $O
r() { local n=$1; shift; local t0=$(date +%s); "$@" > $O/$n.txt 2>&1; echo "$n exit=$? $(( $(date +%s)-t0 ))s" >> $O/lines.txt; }
r drawcheck node tools/perf/drawcheck.mjs
r clipcheck node tools/perf/clipcheck.mjs
r kbdcheck node tools/perf/kbdcheck.mjs
r registrycheck npx tsx tools/engine/registrycheck.ts
r knowncheck node tools/perf/knowncheck.mjs
r generality npx tsx tools/engine/generalitycheck.ts
r coveragecheck npx tsx tools/difficulty/coveragecheck.ts
r suite2 npx tsx --test --test-shard=2/2 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts
echo LANE-B-DONE >> $O/lines.txt
