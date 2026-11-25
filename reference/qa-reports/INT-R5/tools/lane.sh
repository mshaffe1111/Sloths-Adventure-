#!/bin/bash
# INT-R5d-c: THE FULL SET in lanes. lane.sh <frozen> <main worktree> <outdir> <lane> <gate names...>
# Runs run1.sh's OWN `g <name> ...` lines (read live from run1.sh, so the commands cannot drift) for the named gates, in the order
# given, one at a time. PASS/FAIL lines to <outdir>/fullset-<lane>.txt. Lanes exist because run1.sh in one line runs past the
# 7,200,000 ms background limit (INT-R4's run 1: about 7,000 s before teachFirstScan, castBots 2-7/1-4 and the bigger paintcheck).
S=$(cd "$(dirname "$0")" && pwd); W=$1; M=$2; O=$3; L=$4; shift 4; mkdir -p $O; SUM=$O/fullset-$L.txt
cd "$W" || exit 9
echo "== FULL SET lane $L on $(git rev-parse --short=9 HEAD) (main base $(git -C $M rev-parse --short=9 HEAD)) $(TZ=America/New_York date '+%-I:%M %p ET')" >> $SUM
g() { local name=$1; shift; local t0=$SECONDS; ( eval "$@" ) > "$O/g-$name.log" 2>&1; local rc=$?
  if [ $rc -eq 0 ]; then v=PASS; else v=FAIL; fi; echo "$name $v (exit $rc, $((SECONDS-t0)) s)" >> $SUM; }
TL=$(grep -m1 'run: npx tsx --test tools/engine/library.test.ts' .github/workflows/gates.yml | sed 's/^ *- run: //')
for n in "$@"; do
  line=$(grep -m1 "^g $n " "$S/run1.sh")
  if [ -z "$line" ]; then echo "$n MISSING from run1.sh" >> $SUM; continue; fi
  eval "$line"
done
echo "== lane $L done $(TZ=America/New_York date '+%-I:%M %p ET')" >> $SUM
