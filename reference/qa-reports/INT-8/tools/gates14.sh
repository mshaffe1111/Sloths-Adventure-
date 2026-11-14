#!/bin/bash
# INT-8: the four 1-4 fig-gate clips re-shot with INT-8's clip.mjs (real touch presses, lift checked); INT-7's tool's versions moved to
# stills/1-4/int7tool/ (their "Jump: still under" frame never jumped: R-165.240).
OUT=$1; PORT=3218; ROOT=/home/user/Sloths-Adventure-; export PW=/opt/node-tools/node_modules/playwright/index.mjs
for d in normal easy; do for o in up side; do
  node $ROOT/reference/qa-reports/INT-8/tools/clip.mjs $PORT $OUT/1-4/gate-$d-$o gate $d $o 0 > $OUT/1-4/gate-$d-$o.txt 2>&1
  echo "1-4 gate $d $o $? $(TZ=America/New_York date +'%-I:%M %p')"
  ffmpeg -loglevel error -y -framerate 15 -i $OUT/1-4/gate-$d-$o/f%04d.jpg -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx264 -pix_fmt yuv420p $OUT/1-4/gate-$d-$o.mp4
done; done
echo "gates14 done $(TZ=America/New_York date +'%-I:%M %p')"
