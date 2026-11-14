#!/bin/bash
cd /home/user/Sloths-Adventure-
R=gates-int4/RESULTS.txt
echo "GATES-4 on $(git rev-parse --short HEAD) (src = 2bb29f8d), started $(TZ=America/New_York date '+%I:%M %p ET')" > $R
run() { name=$1; shift; s=$(date +%s); "$@" > gates-int4/$name.log 2>&1; c=$?; echo "$name $c $(( $(date +%s)-s ))s" >> $R; }
run unit npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts
run tooltests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/routeHumps.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts
for s in $(npx tsx tools/engine/registrycheck.ts --lists 2>/dev/null | grep -E '^[0-9]+-[0-9]+$'); do run seedlist-$s npx tsx tools/engine/seedlist.ts $s --check; done
run registrycheck npx tsx tools/engine/registrycheck.ts
run tierBots npx tsx --test tools/inspect/tierBots.test.ts
run kbdcheck node tools/perf/kbdcheck.mjs
run clipcheck node tools/perf/clipcheck.mjs
run buildcheck node tools/perf/buildcheck.mjs
echo "DONE $(TZ=America/New_York date '+%I:%M %p ET')" >> $R
