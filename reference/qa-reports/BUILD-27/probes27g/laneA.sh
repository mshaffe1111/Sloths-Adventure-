#!/bin/bash
# BUILD-27g lane A on frozen tree $1, logs to $2: tsc, seedlist 2-7, suite 1/2, the CI 'rolled' tool line (read live from gates.yml), tipwalk, tierBots
cd "$1" || exit 9; O=$2; mkdir -p $O
r() { local n=$1; shift; local t0=$(date +%s); "$@" > $O/$n.txt 2>&1; echo "$n exit=$? $(( $(date +%s)-t0 ))s" >> $O/lines.txt; }
CITOOL=$(grep -m1 -E "^\s+- run: npx tsx --test tools/engine/library.test.ts" .github/workflows/gates.yml | sed -E 's/^\s+- run: //')
r tsc npx tsc --noEmit -p .
r seedlist27 npx tsx tools/engine/seedlist.ts 2-7 --check
r suite1 npx tsx --test --test-shard=1/2 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts
r citool bash -c "$CITOOL"
r tipwalk npx tsx tools/engine/tipwalk.ts --layouts 4
r tierBots npx tsx --test tools/inspect/tierBots.test.ts
echo LANE-A-DONE >> $O/lines.txt
