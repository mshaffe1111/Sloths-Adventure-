#!/usr/bin/env bash
# ENG-S2: the full CLAUDE.md Checks plus CI's own lists (gates.yml), on one head, in its own worktree (D36), waited for (D59). ENG-S1's
# gates.sh in parallel lanes on a 4-core container: the unit glob in 3 shards (every file once, round-robin), the build-and-browser lane,
# the tools lane (with lockall --check against the base's lock); buildcheck (it times builds) runs alone after every lane is done.
#   bash reference/qa-reports/ENG-S2/gates.sh <log> <lock-base.json>
log="${1:-gates.log}"; lockbase="$2"
run() { local name="$1"; shift; local t0=$(date +%s); "$@" > "$log.$name.txt" 2>&1; local rc=$?; echo "$name exit $rc $(( $(date +%s) - t0 ))s" | tee -a "$log"; }
export CI=1 FORCE_COLOR=1
echo "head $(git rev-parse HEAD) start $(TZ=America/New_York date +'%-I:%M %p')" | tee "$log"
shopt -s globstar nullglob
files=(src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts)
mapfile -t files < <(printf '%s\n' "${files[@]}" | sort -u)
s0=(); s1=(); s2=(); i=0
for f in "${files[@]}"; do case $((i % 3)) in 0) s0+=("$f");; 1) s1+=("$f");; 2) s2+=("$f");; esac; i=$((i+1)); done
echo "unit files ${#files[@]}: shards ${#s0[@]} ${#s1[@]} ${#s2[@]}" | tee -a "$log"
( run unit0 npx tsx --test "${s0[@]}" ) &
( run unit1 npx tsx --test "${s1[@]}" ) &
( run unit2 npx tsx --test "${s2[@]}" ) &
( run build env BASE_PATH=/Sloths-Adventure-/ npx vite build
  run chunkcheck node tools/perf/chunkcheck.mjs
  run artcheck node tools/perf/artcheck.mjs
  run kbdcheck node tools/perf/kbdcheck.mjs
  run drawcheck node tools/perf/drawcheck.mjs
  run clipcheck node tools/perf/clipcheck.mjs ) &
( run tsc npx tsc --noEmit -p .
  run knowncheck node tools/perf/knowncheck.mjs
  run generality npx tsx tools/engine/generalitycheck.ts
  run roadmap node tools/roadmapcheck.mjs
  run registry npx tsx tools/engine/registrycheck.ts
  run enginetools npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/routeHumps.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts
  run tierbots npx tsx --test tools/inspect/tierBots.test.ts
  run seedlists bash -c 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
  [ -n "$lockbase" ] && run lockall npx tsx tools/engine/lockall.ts --layouts 16 --check "$lockbase" ) &
wait
run buildcheck node tools/perf/buildcheck.mjs
echo "end $(TZ=America/New_York date +'%-I:%M %p')" | tee -a "$log"
