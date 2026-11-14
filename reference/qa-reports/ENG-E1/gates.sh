#!/usr/bin/env bash
# ENG-E1: the full CLAUDE.md Checks plus CI's own lists (gates.yml: every seed list, registrycheck, the engine tools' tests), in order, on one head, in its own worktree (D36, D59). Each gate's exit code and seconds go to the log.
#   bash reference/qa-reports/ENG-E1/gates.sh <log>
log="${1:-gates.log}"
run() { local name="$1"; shift; local t0=$(date +%s); "$@" > "$log.$name.txt" 2>&1; local rc=$?; echo "$name exit $rc $(( $(date +%s) - t0 ))s" | tee -a "$log"; }
export CI=1 FORCE_COLOR=1
echo "head $(git rev-parse HEAD) start $(TZ=America/New_York date +'%-I:%M %p')" | tee "$log"
run tsc npx tsc --noEmit -p .
run unit npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts
run build env BASE_PATH=/Sloths-Adventure-/ npx vite build
run chunkcheck node tools/perf/chunkcheck.mjs
run artcheck node tools/perf/artcheck.mjs
run knowncheck node tools/perf/knowncheck.mjs
run generality npx tsx tools/engine/generalitycheck.ts
run roadmap node tools/roadmapcheck.mjs
run seedlists bash -c 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
run registry npx tsx tools/engine/registrycheck.ts
run enginetools npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/routeHumps.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts
run tierbots npx tsx --test tools/inspect/tierBots.test.ts
run kbdcheck node tools/perf/kbdcheck.mjs
run buildcheck node tools/perf/buildcheck.mjs
run drawcheck node tools/perf/drawcheck.mjs
run clipcheck node tools/perf/clipcheck.mjs
echo "end $(TZ=America/New_York date +'%-I:%M %p')" | tee -a "$log"
