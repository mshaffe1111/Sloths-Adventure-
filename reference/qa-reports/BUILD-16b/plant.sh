#!/bin/bash
# BUILD-16b planted faults (BUILD-16's, re-pointed at the cut-down 1-6, plus the meter's): each a one-line break in a SIDE worktree ($1),
# the 1-6 tests run, the file restored. Each must go RED. Usage: bash plant.sh <worktree>
WT=$1
plant() { F=$WT/$4; cp $F $F.orig; sed -i "$2" $F; if ! grep -q "$3" $F; then echo "$1 NOT PLANTED"; cp $F.orig $F; rm $F.orig; return; fi
  r=$(cd $WT && timeout 1500 npx tsx --test $5 2>&1 | grep -E '^# fail'); cp $F.orig $F; rm $F.orig
  echo "$1 $r $( [ "$r" != '# fail 0' ] && echo RED || echo GREEN-MISSED)"; }
A=src/game/gen2/worlds/w1Arc16.ts; T=src/game/gen2/worlds/w1Arc16.test.ts
plant "M1 the snake from the anchor too quick to be seen (trip 7 s -> 4 s: the view verdict refuses, finish16 throws)" "s/'w16-snake-down': { period: 14, tell: 0.6, on: 7,/'w16-snake-down': { period: 14, tell: 0.6, on: 4,/" "tell: 0.6, on: 4," $A $T
plant "M2 a riser on Easy (the first riser's easy none dropped)" "s/{ liana: 'l1', route: 'up', beat: 'w16-snake-up', reach: 0.7, easy: 'none' }/{ liana: 'l1', route: 'up', beat: 'w16-snake-up', reach: 0.7 }/" "{ liana: 'l1', route: 'up', beat: 'w16-snake-up', reach: 0.7 }" $A $T
plant "M3 Easy keeps the creaky limb" "s/const c = easy ? 'sound' as const : 'creak' as const;/const c = 'creak' as const;/" "const c = 'creak' as const;" $A $T
plant "M4 the arc's order (risers before the creaky landing)" "s/'A T P R M X R C R W R S R L E'/'A T P R M X R W R C R S R L E'/" "R W R C R" $A $T
plant "M5 the false liana a full-length vine" "s/const FALSE_LEN: R2 = \[150, 170\];/const FALSE_LEN: R2 = [420, 420];/" "FALSE_LEN: R2 = \[420" $A $T
plant "M6 Easy lays Normal's lianas (every Easy twin given Normal's pieces: the meter's Easy bound)" 's/...(v.easy ? \[{ id: `${v.id}-easy`, pieces: ren(v.easy.pieces)/...(v.easy ? [{ id: `${v.id}-easy`, pieces: ren(v.lay.pieces)/' 'pieces: ren(v.lay.pieces).slice(1), sockets: sk(v.easy.pieces' $A $T
plant "M7 the stage under 2 minutes (no walked ground: every hop gone)" "s/for (let i = 1; i <= n; i++) {/for (let i = 1; i <= 0; i++) {/" "i <= 0; i++" $A $T
plant "M8 the seal predicate forced false for a stage that gathers (goals.ts)" "s/  return cfg.objectiveType === 'harvest' || stageSpec(cfg.worldIndex, cfg.miniIndex)?.gathers === 'petals';/  return cfg.objectiveType === 'harvest' \&\& !!stageSpec;/" "&& !!stageSpec" src/game/goals.ts src/game/goalsGathers.test.ts
echo restored
