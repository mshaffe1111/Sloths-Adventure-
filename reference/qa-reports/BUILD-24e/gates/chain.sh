#!/bin/bash
# BUILD-24e: BUILD-24d's chain on t-build-24c's head (logs in BUILD-24e/gates). paintcheck runs in a scratch worktree of this head with
# t-gate-292 and t-time-168b merged in (their tools are not on this branch yet; their src/ diff vs this head is empty). buildcheck: LAST, ALONE, separately.
cd /home/user/Sloths-Adventure-
G=reference/qa-reports/BUILD-24e/gates
GM=/tmp/claude-0/-home-user-Sloths-Adventure-/fc777c24-8159-584e-896d-b7b975706a63/scratchpad/gm
H=$(git rev-parse --short HEAD)
run() { local name="$1"; shift; { echo "== $* (head $H) start $(TZ=America/New_York date +'%-I:%M %p')"; "$@" 2>&1 | tail -${TAILN:-25}; echo "exit ${PIPESTATUS[0]} end $(TZ=America/New_York date +'%-I:%M %p')"; } > $G/$name.txt 2>&1; }
run tsc npx tsc --noEmit -p .
run build bash -c "BASE_PATH=/Sloths-Adventure-/ npx vite build && node tools/perf/chunkcheck.mjs"
run artcheck node tools/perf/artcheck.mjs
run knowncheck node tools/perf/knowncheck.mjs
run generality npx tsx tools/engine/generalitycheck.ts
run roadmapcheck node tools/roadmapcheck.mjs
run toolTests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts
run tierBots npx tsx --test tools/inspect/tierBots.test.ts
TAILN=40 run castBots npx tsx tools/inspect/castBots.ts --stage 2-4 --seeds 1-40 --bots kid,adult,child,middle,expert --setting both --par 3
run kbdcheck node tools/perf/kbdcheck.mjs
run seedlist11 npx tsx tools/engine/seedlist.ts 1-1 --check
run seedlist24 npx tsx tools/engine/seedlist.ts 2-4 --check
TAILN=60 run registry npx tsx tools/engine/registrycheck.ts --lists
run tipwalk npx tsx tools/engine/tipwalk.ts --layouts 4
TAILN=40 run coverage npx tsx tools/difficulty/coveragecheck.ts
TAILN=80 run funcheck npx tsx tools/validate/funcheck.ts
TAILN=40 run meter npx tsx tools/difficulty/score.ts --stages 2-4 --seeds 1-4 --settings normal,easy
TAILN=40 run clipcheck node tools/perf/clipcheck.mjs
TAILN=40 run drawcheck node tools/perf/drawcheck.mjs
TAILN=60 run paintcheck bash -c "cd $GM && npx tsx tools/engine/paintcheck.ts"
TAILN=30 run timecheck node $GM/tools/timecheck.mjs --repo /home/user/Sloths-Adventure-
echo CHAIN DONE $(TZ=America/New_York date +'%-I:%M %p')
