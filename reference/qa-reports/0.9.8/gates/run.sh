#!/bin/bash
# REL-098: every gate of release.md step 4 + every CI step, ONCE on the candidate head, in a detached worktree; one line per gate to RESULTS.txt
# as it ends. CI=1 FORCE_COLOR=1 (D31). Timing gate (buildcheck) runs alone; build:store last (it overwrites dist).
S=/tmp/claude-0/-home-user-Sloths-Adventure-/309e4a07-c25e-5071-9988-b792b76b1219/scratchpad; cd $S/wt-cand; O=$S/cand-gates; R=$O/RESULTS.txt
export CI=1 FORCE_COLOR=1
echo "head $(git rev-parse HEAD) start $(TZ=America/New_York date +'%-I:%M %p')" > $R
g() { local n=$1; shift; "$@" > $O/$n.log 2>&1; echo "$n $? $(TZ=America/New_York date +'%-I:%M %p')" >> $R; }
g tsc npx tsc --noEmit -p .
for i in 1 2 3; do (npx tsx --test --test-shard=$i/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts > $O/unit$i.log 2>&1; echo "unit$i $? $(TZ=America/New_York date +'%-I:%M %p')" >> $R) & done
g build env BASE_PATH=/Sloths-Adventure-/ npx vite build
g assetsize bash -c 'find dist -type f -size +4194304c | tee /dev/stderr | wc -l | grep -qx 0'
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
g pinned bash -c 'npx tsx --test $(grep -rln "setPick11\|roll11Seed\|provenSeedFor" src --include=*.test.ts)'
g todocount bash -c 'echo "main $(git grep -n "todo:" origin/main -- "src/*.test.ts" | wc -l) cand $(git grep -n "todo:" HEAD -- "src/*.test.ts" | wc -l)"; [ $(git grep -n "todo:" HEAD -- "src/*.test.ts" | wc -l) -le $(git grep -n "todo:" origin/main -- "src/*.test.ts" | wc -l) ]'
wait
g lockall npx tsx tools/engine/lockall.ts --layouts 16 --intended 1-4,1-5 --check $S/main-gates/lockall-main-0.9.7.json
g funcheck npx tsx tools/validate/funcheck.ts
g drawcheck node tools/perf/drawcheck.mjs
g clipcheck node tools/perf/clipcheck.mjs
g buildcheck node tools/perf/buildcheck.mjs
g buildstore npm run build:store
echo "done $(TZ=America/New_York date +'%-I:%M %p')" >> $R
