#!/bin/bash
# INT-7 stills + clips on the gated head, from a FROZEN worktree of that commit on its own vite port (never the tree being edited).
# Built setting printed by the game (D62): stills-at-setting.mjs prints BUILT {stage, seed, built difficulty}; clip.mjs prints BUILT.
#   bash stills.sh <gated sha> <out dir>
set -u
SHA=$1; OUT=$2; S=/tmp/claude-0/-home-user-Sloths-Adventure-/e680496d-7b4c-577d-ba36-9385127e9f11/scratchpad; WT=$S/wt-$SHA; PORT=3217
ROOT=/home/user/Sloths-Adventure-; mkdir -p $OUT
[ -d $WT ] || git -C $ROOT worktree add -f $WT $SHA >/dev/null 2>&1; ln -sfn $ROOT/node_modules $WT/node_modules
(cd $WT && npx vite --port $PORT --strictPort > $S/vite-stills.log 2>&1 &) ; until curl -s -o /dev/null http://127.0.0.1:$PORT/; do sleep 1; done
export PW=/opt/node-tools/node_modules/playwright/index.mjs
ST=$ROOT/tools/engine/runs/stills-at-setting.mjs; T=$ROOT/reference/qa-reports/INT-7/tools
# 1-1: the first-run layout (list index 17 = seed 9800, firstRun11.ts), start, mid and Matt's spot (x 21050); a hole (layout 1, POLISH-3's)
for d in normal easy; do
  DIFF=$d node $ST $PORT $OUT/1-1 first 1-1 17 600:low 9000:low 21050:low > $OUT/1-1/first-$d.txt 2>&1
  DIFF=$d node $ST $PORT $OUT/1-1 hole 1-1 1 25600:low 26600:low 27600:low 27900:high > $OUT/1-1/hole-$d.txt 2>&1
done
# 1-4 clips: the fig gate (push, snap, try over), two vines, a pod's tell and fall, the fork; Normal and Easy, upright and sideways
for m in gate vines pods fork; do for d in normal easy; do for o in up side; do
  node $T/clip.mjs $PORT $OUT/1-4/$m-$d-$o $m $d $o 0 > $OUT/1-4/$m-$d-$o.txt 2>&1
  ffmpeg -loglevel error -y -framerate 15 -i $OUT/1-4/$m-$d-$o/f%04d.jpg -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx264 -pix_fmt yuv420p $OUT/1-4/$m-$d-$o.mp4 2>/dev/null
done; done; done
pkill -f "vite --port $PORT" ; echo "stills done $(TZ=America/New_York date +'%-I:%M %p')"
