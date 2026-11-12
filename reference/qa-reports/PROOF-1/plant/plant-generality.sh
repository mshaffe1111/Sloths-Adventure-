#!/bin/bash
# Plants one literal at a time into a scratch worktree of the head (/home/user/plant-wt) and runs the generality gate.
# A plant PASSES this proof only if the gate exits non-zero; the worktree is reset after each plant.
W=/home/user/plant-wt
cd $W
plant() { # name file text
  name=$1; f=$2; txt=$3
  git -C $W checkout -q -- . ; git -C $W clean -qfd src >/dev/null
  printf '%s\n' "$txt" >> $W/$f
  out=$(npx tsx tools/engine/generalitycheck.ts 2>&1); e=$?
  echo "PLANT $name | $f | exit=$e | $(echo "$out" | grep -E 'FAIL|PASS|new|literal' | head -3 | tr '\n' ' ')"
}
plant stage-id-physics src/game/physics.ts "export const __p1 = (id: string) => id === '1-1';"
plant world-key-engine src/game/engine.ts "export const __p2 = (worldIndex: number) => worldIndex === 9;"
plant seed-gen2 src/game/gen2/pipeline.ts "export const __p3 = (seed: number) => seed === 4106;"
plant xpos-camera src/game/cameraFollow.ts "export const __p4 = (p: {x:number}) => p.x > 30784;"
plant world-prefix-help src/game/helpLadder.ts "export const __p5 = (id: string) => id.startsWith('5-');"
plant newfile-gen2 src/game/gen2/plantNew.ts "export const __p6 = (stageId: string) => stageId === '7-3';"
plant template-gen2 src/game/gen2/pipeline.ts 'export const __p7 = (w: number) => `${w}-1` === "4-1";'
# outside ENGINE_FILES/ENGINE_DIRS: new runtime modules this merge made live (expect PASS = blind spot, reported not as a gate failure but as scope)
for f in src/game/stageModes.ts src/game/clock.ts src/game/ride.ts src/game/stillness.ts src/game/noise.ts src/game/heroNoise.ts src/game/saveFile.ts src/game/predators/core.ts src/game/predators/casts.ts; do
  [ -f $W/$f ] && plant "outside-scope:$(basename $f)" $f "export const __p8 = (stageId: string) => stageId === '1-1';"
done
git -C $W checkout -q -- . ; git -C $W clean -qfd src >/dev/null
echo "clean: $(git -C $W status --short | wc -l) changes left"
