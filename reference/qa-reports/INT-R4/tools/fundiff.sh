#!/bin/bash
# usage: fundiff.sh <funcheck output> <repo dir>   : diff funcheck's worse/new flags vs INT-14's ruled debt table (main 2a87f4cda), flag for flag
T=$(mktemp -d)
grep -E "^✗ (worse|new):" "$1" | sed -E 's/^✗ (worse|new): ([0-9]-[0-9]+) (normal|easy) "([^"]+)" on ([0-9]+)( of 16)? layouts(, known ([0-9]+))?.*/\2|\3|\4|\5|\8/' | sort > $T/mine
git -C "$2" show 2a87f4cda:reference/qa-reports/INT-14/REPORT.md | sed -n 59,90p | grep -E "^\| [0-9]+ \|" | awk -F'|' '{gsub(/ /,"",$3); s=tolower($4); gsub(/^ +| +$/,"",s); r=$5; gsub(/^ +| +$/,"",r); sub(/ \(.*/,"",r); l=$6; gsub(/ /,"",l); split(l,a,"("); k=a[2]; sub(/\)/,"",k); if(k=="new")k=""; print $3"|"s"|"r"|"a[1]"|"k}' | sort > $T/int14
echo "mine $(wc -l < $T/mine), INT-14 $(wc -l < $T/int14)"; diff $T/int14 $T/mine && echo "IDENTICAL 22/22"
