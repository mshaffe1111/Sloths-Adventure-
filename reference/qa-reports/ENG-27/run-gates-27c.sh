#!/bin/bash
# ENG-27c gate runner: run <name> <dir> <cmd...> ; logs to /tmp/claude-0/gates/<name>.log, a verdict line to summary.txt
S=/tmp/claude-0/gates/summary.txt
g() { local name=$1 dir=$2; shift 2; local t0=$(date +%s); (cd "$dir" && bash -c "$*") > /tmp/claude-0/gates/$name.log 2>&1; local rc=$?; local t1=$(date +%s);
  local tail=$(grep -E '^# (tests|pass|fail|todo) ' /tmp/claude-0/gates/$name.log | tr '\n' ' '); [ -z "$tail" ] && tail=$(tail -1 /tmp/claude-0/gates/$name.log | cut -c1-160);
  echo "$name $([ $rc = 0 ] && echo PASS || echo "FAIL($rc)") $((t1-t0))s $(TZ=America/New_York date +'%-I:%M %p ET') | $tail" >> $S; }
H=/home/user/wt-g; B=/home/user/wt-base
SUITE='src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts'
case $1 in
chain1)
  g tsc $H npx tsc --noEmit -p .
  for i in 1 2 3 4 5 6; do g suite$i $H "npx tsx --test --test-shard=$i/6 $SUITE"; done
  g tooltests $H "$(cat /tmp/claude-0/g/tooltests.cmd)"
  g tierBots $H npx tsx --test tools/inspect/tierBots.test.ts
  g tipwalk $H npx tsx tools/engine/tipwalk.ts --layouts 4
  g funcheck $H npx tsx tools/validate/funcheck.ts
  g coveragecheck $H npx tsx tools/difficulty/coveragecheck.ts
  g registrycheck $H npx tsx tools/engine/registrycheck.ts
  g generalitycheck $H npx tsx tools/engine/generalitycheck.ts
  g knowncheck $H node tools/perf/knowncheck.mjs
  g roadmapcheck $H node tools/roadmapcheck.mjs
  g timecheck $H node tools/timecheck.mjs
  g artcheck $H node tools/perf/artcheck.mjs
  echo "chain1 DONE" >> $S ;;
chain2)
  g seedlists $H 'L=$(npx tsx tools/engine/registrycheck.ts --lists) || exit 1; for s in $L; do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
  for p in 0 1 2; do g paint$p $H npx tsx tools/engine/paintcheck.ts --part $p/3; done
  g build $H 'BASE_PATH=/Sloths-Adventure-/ npx vite build'
  g chunkcheck $H node tools/perf/chunkcheck.mjs
  g clipcheck $H node tools/perf/clipcheck.mjs
  g kbdcheck $H node tools/perf/kbdcheck.mjs
  g drawcheck $H node tools/perf/drawcheck.mjs
  g buildcheck $H node tools/perf/buildcheck.mjs
  echo "chain2 DONE" >> $S ;;
chain3)
  g lock-base $B npx tsx tools/engine/lockall.ts --layouts 16 --out /tmp/claude-0/gates/lock-base.json
  g lock-head $H npx tsx tools/engine/lockall.ts --layouts 16 --check /tmp/claude-0/gates/lock-base.json
  echo "chain3 DONE" >> $S ;;
esac
