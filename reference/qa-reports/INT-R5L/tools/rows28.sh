#!/bin/bash
# INT-R5d-c: rule 28 vs MAIN (D132). rows28.sh <frozen tree> <outdir> <stages...>
# castBots rows, every bot, both settings, seeds 1-40 (ENG-PLANT's tools/rows.sh.txt, the same flags); progress to <outdir>/progress.txt.
# Compare with ENG-PLANT/tools/flips.py.txt <main dir> <head dir> (main first): any PASS -> FAIL is named.
T=$1; O=$2; shift 2; mkdir -p $O; cd $T || exit 9
echo "rows on $(git rev-parse --short=9 HEAD) $(TZ=America/New_York date '+%-I:%M %p ET')" >> $O/progress.txt
for st in "$@"; do t0=$SECONDS
  npx tsx tools/inspect/castBots.ts --stage $st --seeds 1-40 --bots kid,adult,child,middle,expert --setting both --par 2 --rows $O/$st.jsonl > $O/$st.log 2>&1
  echo "$st exit $? $(wc -l < $O/$st.jsonl) rows $((SECONDS-t0)) s" >> $O/progress.txt
done
echo "rows done $(TZ=America/New_York date '+%-I:%M %p ET')" >> $O/progress.txt
