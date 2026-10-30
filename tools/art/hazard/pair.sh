#!/bin/sh
# Before and after side by side, one video per scene and orientation (sideways stacked top/bottom, upright side by side), each half
# labelled: tools/art/hazard/pair.sh <dir with before-*/after-* mp4s> <out dir>
set -e
IN=$1; OUT=$2; mkdir -p "$OUT"
for b in "$IN"/before-*.mp4; do
  n=$(basename "$b" .mp4); n=${n#before-}; a="$IN/after-$n.mp4"
  [ -f "$a" ] || continue
  case "$n" in *-side) stack=vstack;; *) stack=hstack;; esac
  ffmpeg -loglevel error -y -i "$b" -i "$a" -filter_complex \
    "[0]drawtext=text='BEFORE':x=8:y=8:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.5[l];[1]drawtext=text='AFTER':x=8:y=8:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.5[r];[l][r]$stack,format=yuv420p" \
    -r 30 -c:v libx264 -crf 27 "$OUT/$n.mp4"
  echo "$OUT/$n.mp4"
done
