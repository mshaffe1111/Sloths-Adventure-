#!/bin/sh
# hf-art-stage round 3 (lead review): the lit open gates in several worlds, 4-8's netting, World 4's water.
#   sh tools/art/shot-stage-art-r3.sh <port> <out dir> <before|after>
P=$1; O=$2; T=$3
mkdir -p "$O"
S="$(dirname "$0")/shot-stage-art.mjs"
for spec in "1-2 exitopen" "3-5 exitopen" "4-4 exitopen" "7-3 exitopen" "5-8 exitopen" "4-8 nest" "4-8 nesttorn" "4-4 water"; do
  set -- $spec
  node "$S" "$P" "$O/$T-$1-$2" "$1" "$2" || echo "FAILED $spec"
done
