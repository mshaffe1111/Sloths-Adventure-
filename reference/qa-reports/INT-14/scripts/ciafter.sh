#!/bin/bash
# usage: ciafter.sh <commit> ; runs tsc + CI tool line (exactly gates.yml) in a pinned worktree
C=$(git -C /home/user/Sloths-Adventure- rev-parse --short=8 $1)
S=${S:?set S to your scratchpad dir}
W=${WT:-/home/user/wt/$C}
[ -d $W ] || git -C /home/user/Sloths-Adventure- worktree add -q --detach $W $C
ln -sfn /home/user/Sloths-Adventure-/node_modules $W/node_modules
cd $W
echo "start $(TZ=America/New_York date +'%-I:%M %p')" > $S/ci-$C.log
npx tsc --noEmit -p . > $S/tsc-$C.log 2>&1; echo "tsc exit $?" >> $S/ci-$C.log
LINE=$(grep -m1 -- '- run: npx tsx --test tools/engine/library.test.ts' .github/workflows/gates.yml | sed 's/^ *- run: //')
echo "$LINE" > $S/toolline-$C.txt
CI=1 FORCE_COLOR=1 bash -c "$LINE" > $S/tool-$C.log 2>&1; echo "toolline exit $?" >> $S/ci-$C.log
sed 's/\x1b\[[0-9;]*m//g' $S/tool-$C.log | grep -E "^(ℹ|#) (tests|pass|fail|todo|skipped|cancelled)" >> $S/ci-$C.log
echo "end $(TZ=America/New_York date +'%-I:%M %p')" >> $S/ci-$C.log
