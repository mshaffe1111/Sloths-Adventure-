#!/bin/bash
# INT-9: 1-4's tips in REAL TIME on the head served on :3218 (TIPS's tipsclip.mjs: a fresh save on the default setting, Dot's own
# bubble, every engine tip named the frame it fires; BUILT printed). The start floor must fire nothing; the fig gate's line fires at its foot.
#   bash tips.sh <out dir>
set -u
OUT=$1; ROOT=/home/user/Sloths-Adventure-
for d in normal easy; do for o in up side; do
  node $ROOT/reference/qa-reports/INT-9/tools/tipsclip.mjs 3218 $OUT/tips-$d-$o $d $o 0 > $OUT/tips-$d-$o.txt 2>&1
  echo "1-4 tips $d $o $? $(TZ=America/New_York date +'%-I:%M %p')"
done; done
