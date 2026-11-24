#!/bin/bash
# buildcheck: the release head (0077c62c6) vs main (cdffdc627) alternately, 3 rounds, alone on the box (after the bisect)
until grep -q "BISECT DONE" /tmp/claude-0/-home-user-Sloths-Adventure-/40f5929c-81cd-5301-ace1-89d8ef8fe963/scratchpad/logs/bisect.log 2>/dev/null; do sleep 5; done
for r in 1 2 3; do for t in 0077 main; do cd /tmp/claude-0/-home-user-Sloths-Adventure-/40f5929c-81cd-5301-ace1-89d8ef8fe963/scratchpad/wt-$t || exit 9; echo "=== round $r $t $(git rev-parse --short=9 HEAD)"; node tools/perf/buildcheck.mjs 2>&1 | grep -E "normal:|easy:|PASS|FAIL"; done; done
echo "=== BCMP DONE"
