# INT-R5: release 5 (Friday): 2-6, 2-7, the bot fix and the stalk fix on main, every gate green, the test link pre-built (Matt: A, R-165.495)
Integration, Opus 5.5 high. A FRESH member each box. **The full set GREEN by about 2 PM ET Friday 11-27, so the lead can ask Matt to play it and
open the PR on his "push" the same evening.** Hand over on the 28-minute clock or at 300k with the EXACT NEXT STEP pushed and
ls-remote-confirmed first (D134). A hand-over ends new work (D138); only the gates of the SAME frozen candidate may finish past the box. NEVER a
shell '&'; long runs with run_in_background AND timeout 7200000; no heredoc in a commit chain (D119); stamps from `date` (D128); NEVER a
force-push. Freeze per D115 but leave src/game/gen2/proven/ writable (seedListChunk.test.ts:50; R-165.494). A wait for a ruling times out at 20
minutes on your own reversible recommendation (CI #89). The CI tool line and tsc after EVERY merge (release.md step 0); each ruling request
and hand-over carries each shard's totals for THAT hash (CI #93). The day stops 11:30 PM ET Thursday; Friday from 8:30 AM ET.
READ FIRST: reference/methods/release.md (the whole method: steps 0-8; you stop BEFORE the PR); reference/PLAY-STORE-RULES.md §6;
PERFORMANCE-RULES §1; LESSONS D125-D142 (and D29, D31, D40, D42, D92, D99 as release.md cites them).
WHAT SHIPS (Matt 11-26 7:29 PM ET: A):
- origin/main (it holds release 4, PR #79).
- release-0.10.3 c73cb9766: what of the release line is not yet on main (2-7 among it; name every commit range you take).
- t-eng-thumb-wip 35d5252c2: the bot root fix C14 (Rule 28 vs main: 0 PASS->FAIL; calibration recommitted).
- t-land-26 2f681402e (code 800bcda5b): 2-6, the stalk fix (R-165.474), boardWatch/stepOff (R-165.478), the depthSteps gate and its
  shrink-only known list of 2-7's 108 lines (R-165.487).
NOT in it: 2-8, 2-9, anything World 3, t-eng-sim, t-amp-hook (it may join Friday only if the lead says so before the full set).
THE 5-9 EASY GOAL (Matt 11-26 7:30 PM ET, R-165.496: "Keep it at 5"): Easy stays 5 of 18. Re-record KID_RUNS_59 to the bot's runs on the
merged head (expected [14,13,17,18,5,5]; say what it reads). Change firstTimerBot.test.ts:177 so the goal only has to be REACHABLE by the kid
bot (at or under the kid runs' lower median), and the goal is data that no bot run can raise. A planted RED each way: a goal above the kid's
reach fails, and a re-record that would lift the goal does not move it. Then check whether any OTHER stage's Easy goal is derived from a bot's
runs and moved with C14. Name each one; none may rise.
STEPS: (1) cut release-<version> from origin/main per release.md step 1; merge the four in the order above, conflicts NAMED (the protoArt
conflicts are expected); after each merge tsc + the CI tool line. (2) The 5-9 goal as above. (3) Version + What's New (player words; the lead
approves the entry before the full set). (4) THE FULL SET on the exact head, every gate by name (release.md step 4 and CLAUDE.md Checks:
the suite in 6 shards, the deploy build + chunkcheck, build:store, artcheck, knowncheck, clipcheck, drawcheck, roadmapcheck, funcheck,
lockall --check against main's lock (only the intended stages move: 2-6, 2-7 and what C14 moves, each named), kbdcheck, buildcheck,
seedlist 1-1, the tools tests, tierBots), and the CI time limits (step 4b). ALSO `seedlist <stage> --check` for EVERY listed stage that has a
proven list (1-1..1-9, 2-1..2-7) on the merged head: 2-7's list was found stale on t-build-28-wip (ENG-FORK28-b, 11-26: "replay differs
from its search", 10 seeds x both); a stale list on the release line is rebuilt (release.md step 6) and every test that pins its seeds re-run. (5) PLAY-STORE §6 table. (6) The test link PRE-BUILT
(python3 tools/testlink/build.py) but NOT published: the lead publishes it. STOP before the PR.
REPORT reference/qa-reports/INT-R5/REPORT.md: EXACT NEXT STEP first, each merge and its conflicts, the gate table with each shard's totals,
the §6 table. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times. Never a model name in a commit beyond the standard
attribution line.
