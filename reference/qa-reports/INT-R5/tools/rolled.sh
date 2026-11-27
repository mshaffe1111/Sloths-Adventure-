#!/bin/bash
# the gates.yml 'rolled' job, every step, continuing past a red to get the full list
cd /tmp/claude-0/-home-user-Sloths-Adventure-/40f5929c-81cd-5301-ace1-89d8ef8fe963/scratchpad/wt-0077 || exit 9
echo "HEAD $(git rev-parse --short=9 HEAD)"; TZ=America/New_York date
run() { echo "=== STEP: $*"; TZ=America/New_York date +%T; "$@"; echo "=== EXIT $? : $1 $2 $3"; }
run npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/inspect/sweeper.test.ts tools/inspect/chaseBots.test.ts tools/inspect/boaBots.test.ts tools/inspect/riverRide.test.ts tools/inspect/padRide.test.ts tools/inspect/lianaRide.test.ts tools/difficulty/coveragecheck.test.ts tools/difficulty/rideChannel.test.ts tools/inspect/clockRide.test.ts tools/engine/library13.test.ts tools/inspect/castBots.test.ts tools/inspect/firsttimer.test.ts tools/inspect/pacerRespawn.test.ts tools/inspect/clip.test.ts tools/inspect/routeHumps.test.ts tools/inspect/pitClimb.test.ts tools/engine/libstage.test.ts tools/engine/registrycheck.test.ts tools/engine/tipwalk.test.ts tools/engine/storyTipScan.test.ts tools/difficulty/score.test.ts tools/testlink/build.test.ts tools/engine/paintFall.test.ts tools/timecheck.test.mjs tools/inspect/lineBot.test.ts tools/inspect/snapRide.test.ts tools/inspect/snapperBonk.test.ts tools/difficulty/snapChannel.test.ts tools/inspect/wheelRide.test.ts tools/difficulty/lianaChannel.test.ts tools/difficulty/wheelChannel.test.ts tools/difficulty/lineChannel.test.ts tools/inspect/posted.test.ts tools/engine/paintcheck.test.ts tools/inspect/snapperTaught.test.ts tools/inspect/rowWheels.test.ts tools/inspect/hopJudged.test.ts tools/inspect/cageBot.test.ts tools/difficulty/cageChannel.test.ts
run npx tsx tools/engine/tipwalk.ts --layouts 4
run npx tsx tools/engine/storyTipScan.ts --check
run npx tsx tools/engine/registrycheck.ts
run npx tsx --test tools/inspect/tierBots.test.ts
run node tools/perf/buildcheck.mjs
echo "=== DONE"; TZ=America/New_York date
