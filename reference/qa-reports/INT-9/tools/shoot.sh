#!/bin/bash
# INT-9 stills + clips for the lead (1-4 and 1-1; 1-7's beats are tools/shoot17.mjs) against the FROZEN worktree of the head served on
# :3218 (vite dev). Built setting printed by the game (D62). Every press through the one clip tool, tools/inspect/clip.mjs (R-165.240:
# the touch pad's own calls, each press lift-checked); 1-1's double through INT-8's clip11.mjs (the same touch-pad presses).
#   1-4 layout 0: start stills (no tip on the floor), the fig gate 'gate' (Dot's fig line left live: TEACH, the tie strains and snaps, the
#   head stop) and 'gateover' (the wall at its end, a leap and a double over it), Normal + Easy, upright + sideways.
#   1-1 first run (layout 10 = seed 9652): the first double, Normal + Easy, upright + sideways.
#   bash shoot.sh <out dir> <sha>
set -u
OUT=$1; SHA=$2; PORT=3218; ROOT=/home/user/Sloths-Adventure-; export PW=/opt/node-tools/node_modules/playwright/index.mjs
ST=$ROOT/tools/engine/runs/stills-at-setting.mjs; CL=$ROOT/tools/inspect/clip.mjs; C11=$ROOT/reference/qa-reports/INT-9/tools/clip11.mjs
mkdir -p $OUT/1-1 $OUT/1-4
t() { TZ=America/New_York date +'%-I:%M %p'; }
for d in normal easy; do DIFF=$d node $ST $PORT $OUT/1-4 start 1-4 0 140:low > $OUT/1-4/start-$d.txt 2>&1; echo "1-4 start $d $? $(t)"; done
for d in normal easy; do for o in up side; do
  for m in gate gateover; do
    TEACH='under the figs' node $CL $PORT $OUT/1-4/$m-$d-$o $m $d $o 0 > $OUT/1-4/$m-$d-$o.txt 2>&1
    echo "1-4 $m $d $o $? $(t)"
    ffmpeg -loglevel error -y -framerate 15 -i $OUT/1-4/$m-$d-$o/f%04d.jpg -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx264 -pix_fmt yuv420p $OUT/1-4/$m-$d-$o.mp4
  done
done; done
for d in normal easy; do for o in up side; do
  node $C11 $PORT $OUT/1-1/double-$d-$o $d $o 10 > $OUT/1-1/double-$d-$o.txt 2>&1
  echo "1-1 double $d $o $? $(t)"
  ffmpeg -loglevel error -y -framerate 15 -i $OUT/1-1/double-$d-$o/f%04d.jpg -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx264 -pix_fmt yuv420p $OUT/1-1/double-$d-$o.mp4
done; done
echo "shoot done $SHA $(t)"
