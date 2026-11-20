#!/usr/bin/env bash
# VAR-19d planted fault for w1Arc19.test.ts's 'each rest laid once' assert (test 2, added VAR-19b). The test reads the LISTED layouts
# (the lead's ruling 11-19), so the fault is the generator's guard taken off AND the list rebuilt from it, as a real regression would
# ship: link()'s maxPerStage 1 -> 5, `seedlist 1-9 --count 4`, the test run; every file restored (trap) and checked clean.
# Run from the repo root: bash reference/qa-reports/VAR-19d/plant-rest-once.sh
set -u
ARC=src/game/gen2/worlds/w1Arc19.ts; LIST=src/game/gen2/proven/seeds-1-9.ts; IX=src/game/gen2/provenIndex.ts
T=$(mktemp -d); cp $ARC $LIST $IX "$T"/
restore() { cp "$T"/w1Arc19.ts $ARC; cp "$T"/seeds-1-9.ts $LIST; cp "$T"/provenIndex.ts $IX; }
trap restore EXIT
grep -q "terrain: 'floor-stones', maxPerStage: 1," $ARC || { echo "the line to plant on is gone"; exit 2; }
sed -i "s/terrain: 'floor-stones', maxPerStage: 1,/terrain: 'floor-stones', maxPerStage: 5,/" $ARC
npx tsx tools/engine/seedlist.ts 1-9 --count 4 > "$T/relist.txt" 2>&1 || { echo "relist failed"; tail -3 "$T/relist.txt"; }
npx tsx --test src/game/gen2/worlds/w1Arc19.test.ts > "$T/test.txt" 2>&1
grep -E "^not ok|each rest laid once" "$T/test.txt" | head -6
if grep -q "each rest laid once" "$T/test.txt"; then echo "PLANT RED: caught"; else echo "PLANT NOT CAUGHT"; fi
restore; trap - EXIT
git diff --quiet -- $ARC $LIST $IX && echo "restored clean" || echo "NOT RESTORED"
