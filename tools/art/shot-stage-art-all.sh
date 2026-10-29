#!/bin/sh
# hf-art-stage: every before/after shot. sh tools/art/shot-stage-art-all.sh <port> <out dir> <before|after>
P=$1; O=$2; T=$3
mkdir -p "$O"
S="$(dirname "$0")/shot-stage-art.mjs"
for spec in "1-2 flag" "1-2 flaglit" "1-2 exit" "1-2 exitopen" "3-5 exit" "7-3 exitopen" "1-5 water" "3-5 water" "4-4 water" "5-6 water" \
  "1-2 heart" "1-2 super_heart" "1-2 powerup_speed" "1-2 powerup_invincible" "1-2 powerup_magnet" "7-7 thorn" "1-2 fern" "1-2 bell" \
  "4-8 nest" "4-8 nesttorn"; do
  set -- $spec
  node "$S" "$P" "$O/$T-$1-$2" "$1" "$2" || echo "FAILED $spec"
done
