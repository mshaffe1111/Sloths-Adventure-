#!/bin/bash
# INT-10d: every gate but the unit suite, once, on the head (CLAUDE.md "Checks"; methods/gates.md), each to its own file with its exit code.
cd /home/user/Sloths-Adventure-
G=/home/user/Sloths-Adventure-/reference/qa-reports/INT-10d/gates
t() { TZ=America/New_York date +'%-I:%M %p'; }
run() { n=$1; shift; echo "start $(t) head $(git rev-parse --short=9 HEAD): $*" > $G/$n.txt; CI=1 FORCE_COLOR=1 "$@" >> $G/$n.txt 2>&1; echo "exit $? end $(t)" >> $G/$n.txt; echo "$n $(tail -n 1 $G/$n.txt)"; }
run tsc npx tsc --noEmit -p .
run build env BASE_PATH=/Sloths-Adventure-/ npx vite build
run chunkcheck node tools/perf/chunkcheck.mjs
run artcheck node tools/perf/artcheck.mjs
run knowncheck node tools/perf/knowncheck.mjs
run generality npx tsx tools/engine/generalitycheck.ts
run roadmap node tools/roadmapcheck.mjs
run tooltests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts
run seedlist11 npx tsx tools/engine/seedlist.ts 1-1 --check
run kbdcheck node tools/perf/kbdcheck.mjs
run buildcheck node tools/perf/buildcheck.mjs
run drawcheck node tools/perf/drawcheck.mjs
run clipcheck node tools/perf/clipcheck.mjs
echo "rest done $(t)"
