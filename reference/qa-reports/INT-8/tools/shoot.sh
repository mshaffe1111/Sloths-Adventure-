#!/bin/bash
# INT-8 stills (step 4 of the packet) against the frozen worktree of the gated head served on :3218. Built setting printed by the game
# (D62: stills-at-setting.mjs prints BUILT {stage, seed, rerolls, built difficulty}). Places read from the game's own build (spans.mts):
#   1-1 first run = layout 10 = seed 9652 (play11Seed: variant N builds list index N-1; firstRun11.ts FIRST_RUN_11.seed 9652)
#   Normal: start 600; double teach: the dip's 130 px bank 6900, the 254 px gap's lip 7650; bounce teach (mushroom 11614) 11450;
#           stone stair (steps 22288-23676) 22571
#   Easy:   start 600; the 130 px bank 7350, the gap (Easy: a 53 px filled dip at 7758) 7700; bounce (mushroom 12146) 11990; stair 23744
#   1-4 layout 0: start 140; the fig gate: INT-7's clip.mjs gate mode (frames are stills), Normal + Easy, upright + sideways
#   bash shoot.sh <out dir>
set -u
OUT=$1; PORT=3218; ROOT=/home/user/Sloths-Adventure-; export PW=/opt/node-tools/node_modules/playwright/index.mjs
ST=$ROOT/tools/engine/runs/stills-at-setting.mjs; mkdir -p $OUT/1-1 $OUT/1-4
DIFF=normal node $ST $PORT $OUT/1-1 first 1-1 10 600:low 6900:low 7650:low 11450:low 22571:low > $OUT/1-1/first-normal.txt 2>&1
echo "1-1 normal $? $(TZ=America/New_York date +'%-I:%M %p')"
DIFF=easy node $ST $PORT $OUT/1-1 first 1-1 10 600:low 7350:low 7700:low 11990:low 23744:low > $OUT/1-1/first-easy.txt 2>&1
echo "1-1 easy $? $(TZ=America/New_York date +'%-I:%M %p')"
for d in normal easy; do DIFF=$d node $ST $PORT $OUT/1-4 start 1-4 0 140:low > $OUT/1-4/start-$d.txt 2>&1; echo "1-4 start $d $? $(TZ=America/New_York date +'%-I:%M %p')"; done
for d in normal easy; do for o in up side; do
  node $ROOT/reference/qa-reports/INT-7/tools/clip.mjs $PORT $OUT/1-4/gate-$d-$o gate $d $o 0 > $OUT/1-4/gate-$d-$o.txt 2>&1
  echo "1-4 gate $d $o $? $(TZ=America/New_York date +'%-I:%M %p')"
  ffmpeg -loglevel error -y -framerate 15 -i $OUT/1-4/gate-$d-$o/f%04d.jpg -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx264 -pix_fmt yuv420p $OUT/1-4/gate-$d-$o.mp4
done; done
echo "shoot done $(TZ=America/New_York date +'%-I:%M %p')"
