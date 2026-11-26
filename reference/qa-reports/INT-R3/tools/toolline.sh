#!/bin/bash
# usage: toolline.sh <frozen-worktree> <label>
D=$(dirname "$0")
cd "$1" || exit 9
TL=$(grep -m1 'run: npx tsx --test tools/engine/library.test.ts' .github/workflows/gates.yml | sed 's/^ *- run: //')
echo "== $2 head $(git rev-parse --short=9 HEAD)"
npx tsc --noEmit -p . > "$D/tsc-$2.log" 2>&1; T=$?; tail -5 "$D/tsc-$2.log"; echo "TSC_EXIT $T"
eval "$TL" > "$D/tool-$2.log" 2>&1; C=$?
grep -E "^# (tests|pass|fail)" "$D/tool-$2.log"; echo "TOOLLINE_EXIT $C"
