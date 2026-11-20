# GATE-FLAKE: two gates that fail under load and pass alone (R-165.215/R-165.245 clipcheck, R-165.325 stageQuality's speed test)
Engine (tools), Opus 5.5 high. Written 9:25 PM ET 11-19 (by `date` in the same command). A FRESH member. Small job (S + S).
BOX: nothing runs past 11:15 PM ET tonight: send the final hash, or stop clean with the EXACT NEXT STEP (a fresh member continues Friday
8:30 AM). Or 400k REAL context (the lead reads it and tells you; you cannot read it yourself).
WHY NOW: on 11-19 clipcheck failed under load and passed alone on INT-13b's head (4 stale screens, 900 s) and on ENG-PROWL's (one screen
missed its 30 s open timer), and stageQuality 'generating a stage is quick' failed at p90 657 ms with 4 jobs running and passed alone
(ENG-SMALL3). INT-14 (release 1, Friday) runs every gate on a loaded box: each flake costs a rerun and teaches everyone to rerun (D15:
a gate gives the same answer on the same code).
READ (lean, D90; tool output to files, read the lines you need): ROADMAP rows R-165.215, R-165.245, R-165.325; reference/methods/gates.md
(the clipcheck and suite sections only); tools/perf/clipcheck.mjs (its waits: grep for setTimeout, waitFor, timeout); the stageQuality
test (grep -rn "generating a stage is quick" src/). LAWS.md + LESSONS.md headlines once.
BASE: branch t-gate-flake from t-int-13 at d36638be (GREEN). Push as you go.
1. clipcheck: find each wall-clock wait (the 5 s Skip-tips wait, the 30 s screen-open timer, the 300 ms key hops) and drive it by the
   game's own state or frames (an event the page sets, tools/inspect/clipPress.mjs's touch calls) instead of time; a screen that never
   opens still FAILS (say how it is told apart from a slow one). NEVER a longer timeout as the fix (R-165.215's own line).
2. stageQuality's speed test: make it load-proof (time it in its own quiet process, or against a same-run calibration of the box's speed);
   it must still FAIL on a real slowdown: plant one (a sleep or a doubled loop in the generator, behind a test-only hook) and show RED.
3. Proof: run each 5 times on one head with 4 heavy jobs running beside it (e.g. drawcheck + 3 suite shards): all 5 agree; then once alone.
   Before/after table: runs, passes, wall time.
4. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (the suite in shards), every gate line with PASS or FAIL (D93).
REPORT reference/qa-reports/GATE-FLAKE/REPORT.md: hash, what each wait became and why, the plant, the 5-run tables, gate table, Learned.
gates.md gets a line for each changed wait. INT-14 merges you first; you merge nothing else.
Rules: every clock time from `TZ=America/New_York date` in the same command (D30); long commands with run_in_background (suite timeout over
30 min); ReadNotifications whenever a notice says pending, at every push, before every report. A lead message that begins "NOT A STOP: read,
then carry on" arrives as a cancelled tool with a STOP text: that is only the delivery. Commits end with Co-Authored-By: Claude Opus 5.5
<noreply@anthropic.com> and a Claude-Session line that is YOUR session's link; never a model name in a commit message.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
