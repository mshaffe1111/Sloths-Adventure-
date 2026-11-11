# TASK E1 (R-165.58: the recorder counts uses)   to: Engine   model: claude-opus-5-5   effort: medium (R-165.91)   due: <dispatch + about 1.5 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-w11-analyst t-r165-61-verdicts`. Read with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md (D37). Read
`git show origin/t-r165-61-verdicts:reference/architecture/PACKETS.md` (section E1: your file list) and
`git show origin/t-w11-analyst:reference/qa-reports/window-2026-11-10/WINDOW.md` §2 (the recorder findings).
## Objective
The play recorder logs every use of the double jump and the bounce, not only the first per stage, so the next play window can measure
how often players use the moves the help teaches.
## Why it matters
The window's analyst found `move double` counts runs, not uses (playRecorder.ts:409-416, logged once per stage by design), so the data
can't say whether a player who got help then used the move.
## Frozen inputs (do not change)
- The format: the first use per stage stays `move <kind> <x>` (old readers' counts unchanged); every later use is `use <kind> <x>`.
- Old logs read exactly as before in report.py (a test with an old-format row).
- Nothing in engine.ts (the calls exist). Fix A2 (t-engine-help) logs `help` and `helpOffer` through `recorder.event` and does not
  change playRecorder.ts: keep `event(what, detail)` as it is.
- Tester privacy: no tester name, code or survey text in the repo or the report.
## Files
- WRITE: src/game/playRecorder.ts, NEW src/game/playRecorder.test.ts, src/game/recorderMoments.test.ts (its :43-70 asserts once per
  stage and must change), tools/playtesters/report.py (reads `use` rows; old logs as before) with a NEW --self-test (today it crashes:
  FileNotFoundError on '--self-test'; name its fixture rows and the exact line it prints). NOT LOG_EVENTS.md (A2 edits it): the new
  row goes in REPORT.md and lands after A2 merges. Your turnover note goes in REPORT.md (E0a writes engine-core.md).
## Definition of done (the Critic checks each)
1. A test drives three double jumps and two bounces in one stage (RealPlay): one `move double` and two `use double`, one `move
   bounce` and one `use bounce`. Red on origin/main shown (today: 2 events for 5 uses).
2. report.py --self-test green, with an old-format row read as before and a new-format row counted by uses.
3. tsc clean; the playRecorder and report tests green; the full suite in 3 shards green.
## Return
Branch t-engine-e1 from origin/main, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons applied"), 40
lines or fewer. Then ONE send_message to the lead, 6 lines or fewer. Then stop.
## Attempt
1
