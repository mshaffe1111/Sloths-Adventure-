#!/bin/bash
# INT-7b: every still and clip of step 2 against the frozen worktree already served on :3217 (stills.sh's setup), with a guard so no shot
# runs beside the timing gate: once drawcheck has written its result line, wait for the runner's "done" (buildcheck runs last and ALONE).
#   bash shoot.sh <out dir> [extra modes...]
set -u
OUT=$1; shift; PORT=3217; ROOT=/home/user/Sloths-Adventure-; R=$ROOT/reference/qa-reports/INT-7/gates/RESULTS.txt
export PW=/opt/node-tools/node_modules/playwright/index.mjs
ST=$ROOT/tools/engine/runs/stills-at-setting.mjs; T=$ROOT/reference/qa-reports/INT-7/tools; mkdir -p $OUT/1-1 $OUT/1-4
guard() { if grep -q '^drawcheck ' $R && ! grep -q '^done ' $R; then echo "guard: waiting for buildcheck $(TZ=America/New_York date +'%-I:%M %p')"; until grep -q '^done ' $R; do sleep 10; done; fi; }
clip() { guard; local m=$1 d=$2 o=$3; node $T/clip.mjs $PORT $OUT/1-4/$m-$d-$o $m $d $o 0 > $OUT/1-4/$m-$d-$o.txt 2>&1
  ffmpeg -loglevel error -y -framerate 15 -i $OUT/1-4/$m-$d-$o/f%04d.jpg -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx264 -pix_fmt yuv420p $OUT/1-4/$m-$d-$o.mp4
  echo "$m-$d-$o $(grep -c . $OUT/1-4/$m-$d-$o.txt) lines $(TZ=America/New_York date +'%-I:%M %p')"; }
for m in gate vines pods; do for d in normal easy; do for o in up side; do clip $m $d $o; done; done; done
for d in normal easy; do guard
  DIFF=$d node $ST $PORT $OUT/1-1 first 1-1 17 600:low 9000:low 21050:low > $OUT/1-1/first-$d.txt 2>&1; guard
  DIFF=$d node $ST $PORT $OUT/1-1 hole 1-1 1 25600:low 26600:low 27600:low 27900:high > $OUT/1-1/hole-$d.txt 2>&1
  echo "1-1 $d $(TZ=America/New_York date +'%-I:%M %p')"
done
for m in "$@"; do for o in up side; do clip $m normal $o; done; done
echo "shoot done $(TZ=America/New_York date +'%-I:%M %p')"
