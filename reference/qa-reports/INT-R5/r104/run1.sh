#!/bin/bash
# INT-R5 (release-0.10.4: main + release-0.10.3 + t-eng-thumb-wip + t-land-26) THE FULL SET gate lines, run by lane.sh (one gate at a
# time per lane) on a FROZEN worktree $1 (main base worktree $2). Adapted from INT-R5L's run1.sh plus INT-R5's (release-0.10.3) storytipscan,
# teachfirst (every seed at release, gates.yml:169 note), castBots 2-6 and 2-7; lockall --check with NO --intended so every move is NAMED
# (lockmoves lists them) and judged against the packet (2-6, 2-7, C14's and release-0.10.3's own moves).
S=$(cd "$(dirname "$0")" && pwd); W=$1; M=$2; O=${3:-$S/out}; mkdir -p $O; SUM=$O/fullset.txt
cd "$W" || exit 9
g() { local name=$1; shift; local t0=$SECONDS; ( eval "$@" ) > "$O/g-$name.log" 2>&1; local rc=$?
  if [ $rc -eq 0 ]; then v=PASS; else v=FAIL; fi; echo "$name $v (exit $rc, $((SECONDS-t0)) s)" >> $SUM; }
TL=$(grep -m1 'run: npx tsx --test tools/engine/library.test.ts' .github/workflows/gates.yml | sed 's/^ *- run: //')
g tsc "npx tsc --noEmit -p ."
g suite1 "npx tsx --test --test-shard=1/6 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
g suite2 "npx tsx --test --test-shard=2/6 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
g suite3 "npx tsx --test --test-shard=3/6 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
g suite4 "npx tsx --test --test-shard=4/6 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
g suite5 "npx tsx --test --test-shard=5/6 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
g suite6 "npx tsx --test --test-shard=6/6 src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts"
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
g roadmapcheck "node tools/roadmapcheck.mjs"
g timecheck "node tools/timecheck.mjs"
g drawcheck "node tools/perf/drawcheck.mjs"
g clipcheck "node tools/perf/clipcheck.mjs"
g kbdcheck "CI=1 FORCE_COLOR=1 node tools/perf/kbdcheck.mjs"
g buildcheck "node tools/perf/buildcheck.mjs"
g lockbase "cd $M && npx tsx tools/engine/lockall.ts --layouts 4 --out $O/lock-main.json"
g lockall "npx tsx tools/engine/lockall.ts --layouts 4 --check $O/lock-main.json"
g seedlists 'for s in $(npx tsx tools/engine/registrycheck.ts --lists); do echo "== $s $(date +%s)"; npx tsx tools/engine/seedlist.ts "$s" --check; echo "== $s exit $?"; done; ! grep -q "exit [1-9]" '"$O"'/g-seedlists.log'
g seed11 "npx tsx tools/engine/seedlist.ts 1-1 --check"
g shardplan 'P=$(npx tsx tools/engine/registrycheck.ts --shards --print); echo "plan $P"; N=$(echo "$P" | tr -d "[] " | tr "," "\n" | wc -l); for k in $(seq 1 $N); do echo "shard $k/$N: $(npx tsx tools/engine/registrycheck.ts --lists --shard $k/$N 2>&1 | tr "\n" " ")"; done'
g lockpre "cd $PRE && npx tsx tools/engine/lockall.ts --layouts 4 --out $O/lock-pre.json"
g lockvspre "npx tsx tools/engine/lockall.ts --layouts 4 --check $O/lock-pre.json"
g paint0 "npx tsx tools/engine/paintcheck.ts --part 0/3"
g paint1 "npx tsx tools/engine/paintcheck.ts --part 1/3"
g paint2 "npx tsx tools/engine/paintcheck.ts --part 2/3"
g castbots26 "npx tsx tools/inspect/castBots.ts --stage 2-6 --seeds 1-100 --bots adult,child,middle,expert --setting both --par 4 --rows $O/cast26-rows.jsonl --proven $O/proven26.json"
g castbots27 "npx tsx tools/inspect/castBots.ts --stage 2-7 --seeds 1-100 --bots adult,child,middle,expert --setting both --par 4 --rows $O/cast27-rows.jsonl --proven $O/proven27.json"
g funcheck "npx tsx tools/validate/funcheck.ts"
g fundiff "bash $S/fundiff.sh $O/g-funcheck.log $W"
g pinwide 'npx tsx --test $(grep -rlE "setPick11|roll11Seed|provenSeedFor|firstTimer\(|castRun\(|RealPlay" src tools --include=*.test.ts)'
g validate "npx tsx --test tools/validate/validate.test.ts"
g world1 "npx tsx --test tools/validate/world1.test.ts"
g buildstore "npm run build:store"
g tierbots "npx tsx --test tools/inspect/tierBots.test.ts"
