#!/bin/bash
# ENG-GROUND-b gate runner (from ENG-27c's): run-gates-b.sh <chain> ; H the head worktree, G the log dir (each gate's log, a verdict line
# to summary.txt). The commands are CI's own (.github/workflows/gates.yml, deploy.yml's 6 suite shards).
G=${G:?}; H=${H:?}; S=$G/summary.txt
g() { local name=$1 dir=$2; shift 2; local t0=$(date +%s); (cd "$dir" && bash -c "$*") > $G/$name.log 2>&1; local rc=$?; local t1=$(date +%s);
  local tail=$(grep -E '^# (tests|pass|fail|todo) ' $G/$name.log | tr '\n' ' '); [ -z "$tail" ] && tail=$(tail -1 $G/$name.log | cut -c1-160);
  echo "$name $([ $rc = 0 ] && echo PASS || echo "FAIL($rc)") $((t1-t0))s | $tail" >> $S; }
SUITE='src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts'
case $1 in
a)
  g tsc $H npx tsc --noEmit -p .
  for i in 1 2 3 4 5 6; do g suite$i $H "npx tsx --test --test-shard=$i/6 $SUITE"; done
  g tooltests $H "$(cat $G/../tooltests.cmd)"
  g tierBots $H npx tsx --test tools/inspect/tierBots.test.ts
  g tipwalk $H npx tsx tools/engine/tipwalk.ts --layouts 4
  g coveragecheck $H npx tsx tools/difficulty/coveragecheck.ts
  g registrycheck $H npx tsx tools/engine/registrycheck.ts
  g generalitycheck $H npx tsx tools/engine/generalitycheck.ts
  g knowncheck $H node tools/perf/knowncheck.mjs
  g roadmapcheck $H node tools/roadmapcheck.mjs
  g timecheck $H node tools/timecheck.mjs
  g artcheck $H node tools/perf/artcheck.mjs
  echo "chain a DONE" >> $S ;;
b)
  g seedlists $H 'L=$(npx tsx tools/engine/registrycheck.ts --lists) || exit 1; for s in $L; do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
  for p in 0 1 2; do g paint$p $H npx tsx tools/engine/paintcheck.ts --part $p/3; done
  g build $H 'BASE_PATH=/Sloths-Adventure-/ npx vite build'
  g chunkcheck $H node tools/perf/chunkcheck.mjs
  g clipcheck $H node tools/perf/clipcheck.mjs
  g kbdcheck $H node tools/perf/kbdcheck.mjs
  g drawcheck $H node tools/perf/drawcheck.mjs
  g buildcheck $H node tools/perf/buildcheck.mjs
  echo "chain b DONE" >> $S ;;
lock)
  g lock-head $H npx tsx tools/engine/lockall.ts --layouts 16 --check $G/../lock-base.json
  echo "chain lock DONE" >> $S ;;
esac
