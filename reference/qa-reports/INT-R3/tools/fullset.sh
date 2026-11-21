#!/bin/bash
# INT-R3 THE FULL SET on a frozen worktree; one gate at a time; PASS/FAIL lines to $S/fullset.txt
S=$(dirname "$0"); W=$1; M=$2; SUM=$S/fullset.txt
cd "$W" || exit 9
echo "== FULL SET on $(git rev-parse --short=9 HEAD) (main base $M)" >> $SUM
g() { local name=$1; shift; local t0=$SECONDS; ( eval "$@" ) > "$S/g-$name.log" 2>&1; local rc=$?
  if [ $rc -eq 0 ]; then v=PASS; else v=FAIL; fi; echo "$name $v (exit $rc, $((SECONDS-t0)) s)" >> $SUM; }
TL=$(grep -m1 'run: npx tsx --test tools/engine/library.test.ts' .github/workflows/gates.yml | sed 's/^ *- run: //')
g tsc "npx tsc --noEmit -p ."
g toolline "$TL"
g artcheck "node tools/perf/artcheck.mjs"
g vitebuild "BASE_PATH=/Sloths-Adventure-/ npx vite build"
g chunkcheck "node tools/perf/chunkcheck.mjs"
g knowncheck "node tools/perf/knowncheck.mjs"
g generalitycheck "npx tsx tools/engine/generalitycheck.ts"
g coveragecheck "npx tsx tools/difficulty/coveragecheck.ts"
g roadmapcheck "node tools/roadmapcheck.mjs"
g unshallow "git fetch -q --unshallow origin || git fetch -q origin"
g timecheck "node tools/timecheck.mjs"
g registrycheck "npx tsx tools/engine/registrycheck.ts"
g drawcheck "node tools/perf/drawcheck.mjs"
g clipcheck "node tools/perf/clipcheck.mjs"
g kbdcheck "node tools/perf/kbdcheck.mjs"
g lockbase "cd $M && npx tsx tools/engine/lockall.ts --layouts 4 --out $S/lock-main.json"
g lockall "npx tsx tools/engine/lockall.ts --layouts 4 --check $S/lock-main.json --intended 2-3"
g castbots23 "npx tsx tools/inspect/castBots.ts --stage 2-3 --seeds 1-40 --setting both --rows $S/cast23-rows.jsonl"
g tipwalk "npx tsx tools/engine/tipwalk.ts --layouts 4"
g seedlists 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
g paint0 "npx tsx tools/engine/paintcheck.ts --part 0/3"
g paint1 "npx tsx tools/engine/paintcheck.ts --part 1/3"
g paint2 "npx tsx tools/engine/paintcheck.ts --part 2/3"
g tierbots "npx tsx --test tools/inspect/tierBots.test.ts"
g funcheck "npx tsx tools/validate/funcheck.ts"
g buildcheck "node tools/perf/buildcheck.mjs"
g suite "npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
echo "== FULL SET done" >> $SUM
