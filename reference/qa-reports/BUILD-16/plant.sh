#!/bin/bash
# BUILD-16 planted faults: each a one-line break of w1Arc16.ts in a SIDE worktree ($1), the 1-6 tests run, the file restored. Each must go RED.
WT=$1; F=$WT/src/game/gen2/worlds/w1Arc16.ts; cp $F $F.orig
plant() { cp $F.orig $F; sed -i "$2" $F; grep -q "$3" $F || { echo "$1 NOT PLANTED"; return; }; r=$(cd $WT && timeout 900 npx tsx --test src/game/gen2/worlds/w1Arc16.test.ts 2>&1 | grep -E '^# fail' ); echo "$1 $r $( [ "$r" != '# fail 0' ] && echo RED || echo GREEN-MISSED)"; }
plant "M1 the snake from the anchor too quick to be seen (trip 7 s -> 4 s: the view verdict refuses, finish16 throws)" "s/'w16-snake-down': { period: 14, tell: 0.6, on: 7,/'w16-snake-down': { period: 14, tell: 0.6, on: 4,/" "tell: 0.6, on: 4,"
plant "M2 risers on Easy (their easy none dropped)" "s/reach: 0.7, easy: 'none' }, { liana: 'l3'/reach: 0.7 }, { liana: 'l3'/" "reach: 0.7 }, { liana: 'l3'"
plant "M3 Easy keeps the creaky limb" "s/const c = easy ? 'sound' as const : 'creak' as const;/const c = 'creak' as const;/" "const c = 'creak' as const;"
plant "M4 the arc's order (risers before the creaky landing)" "s/'A T P R M X R C R W R S R L E'/'A T P R M X R W R C R S R L E'/" "R W R C R"
plant "M5 the false liana a full-length vine" "s/const FALSE_LEN: R2 = \[150, 170\];/const FALSE_LEN: R2 = [420, 420];/" "FALSE_LEN: R2 = \[420"
plant "M6 the stage cut to under 2 minutes (the gorge's last three lianas gone)" "s/{ gap: 'long', perch: easy ? 'sound' : 'creak' }, { gap: 'long', w: 260 }, { gap: 'long', w: 280 }/{ gap: 'long', perch: easy ? 'sound' : 'creak' }/" "perch: easy ? 'sound' : 'creak' }\]"
cp $F.orig $F; rm $F.orig; echo restored
