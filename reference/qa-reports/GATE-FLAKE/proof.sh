#!/bin/bash
# 5 clipcheck runs + 5 stageQuality speed-test runs on one head, under load.sh's 4 jobs; then stops the load
S=/tmp/claude-0/-home-user-Sloths-Adventure-/a0959451-3679-52bc-b531-cd87c8d23fb5/scratchpad
cd /home/user/Sloths-Adventure-
N=${N:-5}; TAG=${TAG:-load}
for i in $(seq 1 $N); do
  t0=$(date +%s)
  CLIPCHECK_OUT=$S/cc-$TAG-$i node tools/perf/clipcheck.mjs > $S/cc-$TAG-$i.log 2>&1; c=$?
  t1=$(date +%s)
  echo "clip $TAG run $i exit $c $((t1-t0)) s at $(TZ=America/New_York date +%r) : $(grep -E '^(PASS|FAIL)' $S/cc-$TAG-$i.log)" >> $S/proof-$TAG.txt
  t0=$(date +%s)
  npx tsx --test --test-name-pattern="generating a stage|speed test" src/game/stageQuality.test.ts > $S/sq-$TAG-$i.log 2>&1; c=$?
  t1=$(date +%s)
  echo "speed $TAG run $i exit $c $((t1-t0)) s at $(TZ=America/New_York date +%r) : $(grep -E '^# (pass|fail)' $S/sq-$TAG-$i.log | tr '\n' ' ') $(grep -oE "speed: thread CPU.*|p90 [0-9]+ ms" $S/sq-$TAG-$i.log | head -1 | cut -c1-80)" >> $S/proof-$TAG.txt
done
touch $S/stop-load
