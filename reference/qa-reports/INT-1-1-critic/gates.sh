#!/bin/bash
# The full gate chain on a detached worktree (the Critic, INT-1-1). No deletions. Usage: gates-h3.sh <worktree> <log prefix>
W="$1"
P="$2"
cd "$W" || exit 2
now() { TZ=America/New_York date +%H:%M; }
for i in 1 2 3; do
  (npx tsx --test --test-reporter=spec --test-shard=$i/3 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts > "$P-shard$i.log" 2>&1; echo "SHARD $i EXIT $?" >> "$P-shard$i.log") &
done
wait
echo "suite done $(now)" >> "$P.done"
for g in drawcheck clipcheck kbdcheck; do
  node tools/perf/$g.mjs > "$P-$g.log" 2>&1
  echo "$g exit $? $(now) :: $(grep -E 'PASS|FAIL|OVER' "$P-$g.log" | tail -2 | tr '\n' ' ' | cut -c1-200)" >> "$P.done"
done
git checkout -q -- reference/qa/tester-page-1106/keyboard/
npx tsx tools/engine/lockall.ts --layouts 16 --intended 1-1 --check tools/engine/lockall-main-0.9.5.json > "$P-lockall.log" 2>&1
echo "lockall exit $? $(now)" >> "$P.done"
npx tsx tools/inspect/helpSweep.ts --fly > "$P-help-sweep.log" 2>&1
echo "helpSweep exit $? $(now)" >> "$P.done"
npx tsx tools/inspect/c1judge.ts > "$P-c1judge.log" 2>&1
echo "c1judge exit $? $(now)" >> "$P.done"
npx tsx tools/engine/seedlist.ts 1-1 --check > "$P-seedlist.log" 2>&1
echo "seedlist exit $? $(now)" >> "$P.done"
npx tsx --test tools/inspect/tierBots.test.ts > "$P-tierbots.log" 2>&1
echo "tierBots exit $? $(now)" >> "$P.done"
node tools/perf/buildcheck.mjs > "$P-buildcheck.log" 2>&1
echo "buildcheck exit $? $(now) :: $(grep -E "PASS|FAIL|OVER" "$P-buildcheck.log" | tail -2 | tr "\n" " " | cut -c1-200)" >> "$P.done"
echo ALLDONE >> "$P.done"
