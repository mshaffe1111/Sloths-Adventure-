#!/bin/bash
# run.sh NAME CMD... : runs one gate alone, logs output to logs/NAME.log, appends "name|exit|seconds|ET end|cmd" to logs/table.txt
cd /home/user/Sloths-Adventure-
name=$1; shift
d=reference/qa-reports/PROOF-1/logs
s=$(date +%s)
"$@" > $d/$name.log 2>&1
e=$?
t=$(( $(date +%s) - s ))
echo "$name|$e|$t|$(TZ=America/New_York date +%H:%M:%S)|$*" >> $d/table.txt
echo "$name exit=$e ${t}s"
