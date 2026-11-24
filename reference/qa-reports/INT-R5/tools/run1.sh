#!/bin/bash
# INT-R5 THE FULL SET run 1 (no suite) on a FROZEN worktree $1 (main base worktree $2); one gate at a time; PASS/FAIL lines to $S/fullset.txt
# (adapted from INT-R4's run1.sh: lockall --intended 2-7,1-4; castBots 2-7 and 1-4 on their lists; storyTipScan --check; the 'rolled' job's six steps)
S=$(cd "$(dirname "$0")" && pwd); W=$1; M=$2; O=${3:-$S/out}; mkdir -p $O; SUM=$O/fullset.txt
cd "$W" || exit 9
echo "== FULL SET run 1 on $(git rev-parse --short=9 HEAD) (main base $(git -C $M rev-parse --short=9 HEAD))" >> $SUM
g() { local name=$1; shift; local t0=$SECONDS; ( eval "$@" ) > "$O/g-$name.log" 2>&1; local rc=$?
  if [ $rc -eq 0 ]; then v=PASS; else v=FAIL; fi; echo "$name $v (exit $rc, $((SECONDS-t0)) s)" >> $SUM; }
TL=$(grep -m1 'run: npx tsx --test tools/engine/library.test.ts' .github/workflows/gates.yml | sed 's/^ *- run: //')
g tsc "npx tsc --noEmit -p ."
g toolline "$TL"
g tipwalk "npx tsx tools/engine/tipwalk.ts --layouts 4"
g storytipscan "npx tsx tools/engine/storyTipScan.ts --check"
g teachfirst "npx tsx tools/engine/teachFirstScan.ts --check"
g registrycheck "npx tsx tools/engine/registrycheck.ts"
g artcheck "node tools/perf/artcheck.mjs"
g vitebuild "BASE_PATH=/Sloths-Adventure-/ npx vite build"
g chunkcheck "node tools/perf/chunkcheck.mjs"
g knowncheck "node tools/perf/knowncheck.mjs"
g generalitycheck "npx tsx tools/engine/generalitycheck.ts"
g coveragecheck "npx tsx tools/difficulty/coveragecheck.ts"
g unshallow "git fetch -q --unshallow origin || git fetch -q origin"
g roadmapcheck "node tools/roadmapcheck.mjs"
g timecheck "node tools/timecheck.mjs"
g drawcheck "node tools/perf/drawcheck.mjs"
g clipcheck "node tools/perf/clipcheck.mjs"
g kbdcheck "node tools/perf/kbdcheck.mjs"
g lockbase "cd $M && npx tsx tools/engine/lockall.ts --layouts 4 --out $O/lock-main.json"
g lockall "npx tsx tools/engine/lockall.ts --layouts 4 --check $O/lock-main.json --intended 2-7,1-4,1-1,1-2,1-7,1-8,1-9,2-1,2-2,2-4,2-5,5-9,6-1,6-2,6-3,6-4,6-5,6-6,6-7,6-9,7-1,7-3,7-5,7-6,7-7,7-9,8-1,8-2,8-5,8-6,8-8,8-9"
g lockhints "python3 $S/lockhints.py $O/g-lockall.log"
g seedlists 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s $(date +%s)"; npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done'
g shardplan 'P=$(npx tsx tools/engine/registrycheck.ts --shards --print); echo "plan $P"; N=$(echo "$P" | tr -d "[] " | tr "," "\n" | wc -l); for k in $(seq 1 $N); do echo "shard $k/$N: $(npx tsx tools/engine/registrycheck.ts --lists --shard $k/$N 2>&1 | tr "\n" " ")"; done'
g paint0 "npx tsx tools/engine/paintcheck.ts --part 0/3"
g paint1 "npx tsx tools/engine/paintcheck.ts --part 1/3"
g paint2 "npx tsx tools/engine/paintcheck.ts --part 2/3"
g castbots27 "npx tsx tools/inspect/castBots.ts --stage 2-7 --seeds 1-100 --bots adult,child,middle,expert --setting both --par 4 --rows $O/cast27-rows.jsonl --proven $O/proven27.json"
g castbots14 "npx tsx tools/inspect/castBots.ts --stage 1-4 --seeds 1-100 --bots adult,child,middle,expert --setting both --par 4 --rows $O/cast14-rows.jsonl --proven $O/proven14.json"
g funcheck "npx tsx tools/validate/funcheck.ts"
g fundiff "bash $S/fundiff.sh $O/g-funcheck.log $W"
g buildstore "npm run build:store"
g slotconfirm "node $S/slotconfirm.mjs $W $O/slot"
g tierbots "npx tsx --test tools/inspect/tierBots.test.ts"
g buildcheck "node tools/perf/buildcheck.mjs"
echo "== FULL SET run 1 done" >> $SUM
