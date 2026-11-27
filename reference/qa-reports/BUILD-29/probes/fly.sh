#!/bin/bash
# usage: fly.sh <tag>  -> flown/quiet-<tag>.txt, one line per stretch over 4 s (Normal, seeds 1-6), shrine share applied
cd /home/user/Sloths-Adventure-
O=reference/qa-reports/BUILD-29/flown/quiet-$1.txt; : > $O
for s in 1 2 3 4 5 6; do
  timeout 300 npx tsx reference/qa-reports/BUILD-29/probes/parts.ts 2-9 $s 4 normal > /tmp/claude-0/p.txt 2>&1 || { echo "s$s ERR $(grep -m1 -iE 'error|throw' /tmp/claude-0/p.txt | cut -c1-160)" >> $O; continue; }
  awk -v s=$s '/^[0-9.]+ s x/{sec=$4; t=$1} /quietOf share/{print "s" s " " sec " " t " counts " $(NF-1)} /SUM/{print "   " $0}' /tmp/claude-0/p.txt >> $O
  grep -m1 "total" /tmp/claude-0/p.txt | sed "s/^/s$s /" >> $O
done
cat $O
