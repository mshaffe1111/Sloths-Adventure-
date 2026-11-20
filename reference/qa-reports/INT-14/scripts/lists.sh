#!/bin/bash
# usage: lists.sh <worktree dir> <tag>; every proven list --check (registrycheck --lists), one after another
W=$1; T=$2; S=${S:?set S to your scratchpad dir}
cd $W
L=${3:-$(npx tsx tools/engine/registrycheck.ts --lists)}
echo "start $(TZ=America/New_York date +'%-I:%M %p') lists: $L" > $S/lists-$T.log
for s in $L; do
  npx tsx tools/engine/seedlist.ts "$s" --check > $S/list-$T-$s.log 2>&1; e=$?
  echo "$s exit $e $(tail -n 1 $S/list-$T-$s.log | cut -c1-200) [$(TZ=America/New_York date +'%-I:%M %p')]" >> $S/lists-$T.log
done
echo "end $(TZ=America/New_York date +'%-I:%M %p')" >> $S/lists-$T.log
