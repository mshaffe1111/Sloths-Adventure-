#!/bin/bash
# INT-6 stills on the gated head, from a FROZEN worktree of that commit and its own vite port (POLISH-2 Learned: never shoot from the tree
# you edit). 1-4 (layout 1): the fig gate of one (climbing under the bunch), the gate of three (hollow), a vine grab (4 frames), the crown;
# 1-5: B15's one-spot-a-beat set and a vine grab. Normal and Easy (localStorage, the game's own way), upright and sideways, 2x.
#   bash stills.sh <gated sha> <out dir>
set -u
SHA=$1; OUT=$2; S=/tmp/claude-0/-home-user-Sloths-Adventure-/a97f1558-1ff2-548e-b9b5-2fd11c3eef09/scratchpad; WT=$S/wt-$SHA; PORT=3207
ROOT=/home/user/Sloths-Adventure-
[ -d $WT ] || git -C $ROOT worktree add -f $WT $SHA >/dev/null 2>&1; ln -sfn $ROOT/node_modules $WT/node_modules
(cd $WT && npx vite --port $PORT --strictPort > $S/vite-stills.log 2>&1 &) ; until curl -s -o /dev/null http://127.0.0.1:$PORT/; do sleep 1; done
export PW=/opt/node-tools/node_modules/playwright/index.mjs
T=$ROOT/reference/qa-reports/INT-6/tools
node $T/shoot.mjs $PORT $OUT 14 1-4 1 normal 706,6990,climb 620,2363,stand 450,8383,grab,6,2 580,360,stand
node $T/shoot.mjs $PORT $OUT 14 1-4 1 easy 257,7420,climb 520,2740,stand 577,8816,grab,6,2 690,737,stand
node $T/shoot.mjs $PORT $OUT 15 1-5 1 normal 5500,582,grab,6,2
node $T/shoot.mjs $PORT $OUT 15 1-5 1 easy 5500,582,grab,6,2
node $ROOT/reference/qa-reports/B15/shoot.mjs $PORT $OUT/15-beats normal 1
node $ROOT/reference/qa-reports/B15/shoot.mjs $PORT $OUT/15-beats easy 1
pkill -f "vite --port $PORT" ; echo "stills done $(TZ=America/New_York date +'%-I:%M %p')"
