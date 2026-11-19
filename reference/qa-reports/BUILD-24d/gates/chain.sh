#!/bin/bash
cd /home/user/Sloths-Adventure-
G=reference/qa-reports/BUILD-24d/gates
run() { local name="$1"; shift; { echo "== $* (head $(git rev-parse --short HEAD), src d8d70797) start $(TZ=America/New_York date +'%-I:%M %p')"; "$@" 2>&1 | tail -${TAILN:-25}; echo "exit ${PIPESTATUS[0]} end $(TZ=America/New_York date +'%-I:%M %p')"; } > $G/$name.txt 2>&1; }
run toolTests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts
run tierBots npx tsx --test tools/inspect/tierBots.test.ts
TAILN=40 run castBots npx tsx tools/inspect/castBots.ts --stage 2-4 --seeds 1-40 --bots kid,adult,child,middle,expert --setting both --par 3
run kbdcheck node tools/perf/kbdcheck.mjs
run seedlist11 npx tsx tools/engine/seedlist.ts 1-1 --check
run seedlist24 npx tsx tools/engine/seedlist.ts 2-4 --check
TAILN=60 run registry npx tsx tools/engine/registrycheck.ts --lists
run tipwalk npx tsx tools/engine/tipwalk.ts --layouts 4
TAILN=40 run coverage npx tsx tools/difficulty/coveragecheck.ts
TAILN=60 run funcheck npx tsx tools/validate/funcheck.ts
TAILN=40 run meter npx tsx tools/difficulty/score.ts --stages 2-4 --seeds 1-4 --settings normal,easy
TAILN=40 run clipcheck node tools/perf/clipcheck.mjs
TAILN=40 run drawcheck node tools/perf/drawcheck.mjs
echo CHAIN DONE $(TZ=America/New_York date +'%-I:%M %p')
