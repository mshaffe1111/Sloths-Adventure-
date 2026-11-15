#!/bin/bash
# ENG-B6 final gates (INT-9b's runner, tool line = gates.yml on t-eng-b6): every CLAUDE.md Check and every CI step ONCE on the head in a
# frozen worktree, each result line to RESULTS.txt as it ends. Timing gate (buildcheck) last and alone.
W=/home/user/wt-b6-final; O=/home/user/b6final; R=$O/RESULTS.txt
cd $W
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
g seedlists bash -c 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
g registry npx tsx tools/engine/registrycheck.ts
g tooltests npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/inspect/chaseBots.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/firsttimer.test.ts tools/inspect/clip.test.ts tools/inspect/routeHumps.test.ts tools/inspect/pitClimb.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts tools/engine/tipwalk.test.ts
g tipwalk npx tsx tools/engine/tipwalk.ts --layouts 4
g modelgate node tools/team/modelgate.mjs --self-test
g tierBots npx tsx --test tools/inspect/tierBots.test.ts
wait
g lock npx tsx tools/engine/lockall.ts --layouts 16 --check /home/user/b6logs/lock-int9.json
g drawcheck node tools/perf/drawcheck.mjs
g clipcheck node tools/perf/clipcheck.mjs
g kbdcheck node tools/perf/kbdcheck.mjs
git checkout -- reference/qa/tester-page-1106/ 2>/dev/null
g buildcheck node tools/perf/buildcheck.mjs
echo "done $(TZ=America/New_York date +'%-I:%M %p')" >> $R
