# ENG-SMALL3: three small engine fixes found on 11-19, one commit and one plant each: R-165.319 (threat dial ids), R-165.321 (find names repeat), R-165.317 (tierBots checks all 200 runs).
Engine, Opus 5.5 xhigh. Written 7:36 PM ET 11-19 (by `date` in the same command); started tonight in a free slot. A FRESH member.
BOX: final hash within 2.5 h of start, nothing past 11:15 PM ET, or 400k REAL context (the lead reads it); then the EXACT NEXT STEP pushed.
Role card reference/roles/ENGINE.md. Read: reference/LAWS.md + LESSONS.md once (D30, D57/D87, D59, D86 the FULL list, D88, D90 lean reads),
reference/qa-reports/R-165.59/BOTS.md (the calibration), and the three ROADMAP rows R-165.317, R-165.319, R-165.321 (on this branch).
BASE: branch t-eng-small3 from origin/t-int-13 at its head (pull fresh). Two other members work tonight on castPlay.ts/heroNoise.ts (ENG-NOISE)
and predators/*.ts/core.ts (ENG-PROWL): stay out of those files.
1. R-165.319: the node-string threat dial refuses camelCase creature ids such as thornVine (nodeCode.ts:91): let it take the kit's ids as
   written (or one agreed spelling, said); planted (thornVine RED today); every listed stage's node string re-checked (checkCode).
2. R-165.321: protoStage.ts picks the names of Grandma's things by the shared id counter, so a relic hunt repeats names: index by things
   placed; planted (a hunt with N finds names N different things); say which stages' text changes (seed lists / locks that move: text only).
3. R-165.317: tierBots.test (or a CI step) diffs ALL 200 calibration runs against calibration-main.jsonl, not 15; planted (one moved run fails
   it); time it (about 3 min) and wire it where CI runs the tool tests (gates.yml), with the CLAUDE.md line if the command changes.
4. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (the suite in shards, background, timeout over 30 min), plus every list
   --check, lockall vs main (text-only moves from item 2 named; any layout move = stop and tell the lead), tierBots, funcheck. A gate
   running at report is UNRUN.
REPORT reference/qa-reports/ENG-SMALL3/REPORT.md: hash, each fix with its plant red/green, gate table, Learned. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
A lead message that begins "NOT A STOP: read, then carry on" arrives as a cancelled tool with a STOP text: that is only the delivery.
