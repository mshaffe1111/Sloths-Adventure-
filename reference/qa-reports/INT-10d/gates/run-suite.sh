#!/bin/bash
# INT-10d: the full unit suite, once, on the head (CLAUDE.md "Checks" step 2)
cd /home/user/Sloths-Adventure-
G=/home/user/Sloths-Adventure-/reference/qa-reports/INT-10d/gates
echo "start $(TZ=America/New_York date +'%-I:%M %p') head $(git rev-parse --short=9 HEAD)" > $G/suite.txt
npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts >> $G/suite.txt 2>&1
echo "exit $? end $(TZ=America/New_York date +'%-I:%M %p')" >> $G/suite.txt
grep -E "^# (tests|pass|fail)" $G/suite.txt
