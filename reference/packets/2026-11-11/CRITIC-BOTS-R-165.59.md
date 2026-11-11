# TASK BOTS (R-165.59: the child, middle and expert bots, from the testers' saved numbers)   to: Critic (as builder, CRITIC.md: the
# bots are yours to build)   model: claude-opus-5-5   effort: high   due: <dispatch + about 3 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-w11-analyst t-engine-putback`. Read with `git show origin/ccr-ca657d3c-n09zty:<path>`:
reference/roles/README.md, reference/roles/CRITIC.md, reference/LAWS.md, reference/LESSONS.md (D37, D38, D39). Read
`git show origin/t-w11-analyst:tools/playtesters/profiles/README.md` (every field, how it was computed) and tiers/*.json beside it.
Read tools/inspect/firsttimer.ts (the FirstTimer fields at :71-122, FT_KID and FT_ADULT) and tools/inspect/botBaseline.ts.
## Objective
Three bots that play 1-1 the way our real testers did, child, middle and expert, built from tools/playtesters/profiles/ (P-numbers only),
and proved by calibration: run on the 1-1 the testers played, each bot's results land near its tier's real results. The Critic then uses
them on every 1-1 change (A1, A2, the re-lay C1) instead of guessing how a child plays.
## Why it matters
Matt may now purge the tester sheet: these numbers are all we keep. The old KID/ADULT bots were hand-tuned guesses; a bot that matches
real players is how we judge the re-lay before Matt plays it.
## Frozen inputs (do not change)
- The source: tools/playtesters/profiles/ at t-w11-analyst@437a3a13 (copy it onto your branch with `git checkout origin/t-w11-analyst --
  tools/playtesters/profiles`; do not edit it). Tiers: expert P24+P30 (48 runs), middle P25+P28+P29+P31 (44), child P26+P27+P32 (6 runs,
  THIN: a hint, not a law). The 22 "before" players have touch numbers only.
- FT_KID and FT_ADULT keep their exact behaviour: botBaseline's output for kid and adult on 1-1..1-5, seeds 1-3, is byte-identical
  before and after your change (diff it).
- jumpHoldMs is press to RELEASE (`i jump` to `i jumpUp`, TouchController.tsx:49-50); punches the jab rule took back are not punches
  (D38). Every number you map, name its source file and field.
- Calibrate on origin/main (0.9.5, what the testers played), on the seeds of layout list e03e9c8c (tools/playtesters/layouts.ts),
  each tier on the setting(s) its runs were on.
- No tester name, code or survey text anywhere (P-numbers only). The persona files in tools/playtesters/personas/ are not inputs here.
## Files
- WRITE: tools/inspect/firsttimer.ts (add FT_CHILD, FT_MIDDLE, FT_EXPERT and only the fields the profiles need; widen `name`), NEW
  tools/inspect/tierBots.ts (the CLI: `--stage 1-1 --tiers child,middle,expert --seeds <list> --setting easy|normal|both`, one JSON line a
  run), NEW tools/inspect/tierBots.test.ts (pins the calibration table so a later change can't drift it), NEW
  reference/qa-reports/R-165.59/BOTS.md (the mapping table and the calibration table), tools/playtesters/profiles/ (the copy only).
## Definition of done (the auditing Critic checks each)
1. BOTS.md mapping table: every FirstTimer field of each tier bot -> its value -> its source (profiles file:field and percentile, or
   "kept from FT_KID/FT_ADULT: no profile measures it", named). Fields the profiles measure and the bot ignores are listed with why.
2. Calibration on origin/main 1-1, at least 40 runs per tier per setting it played: bot vs tier p50 for finishSeconds (within 25%),
   livesPerRun and putbacksPerRun (within 30% or 1.0, whichever is larger), doubleUsedShare (within 0.15), and the top three pieces by
   lives+put-backs (at least two of three the same ids). Child is checked and printed but its misses are named, not failed (thin).
   A miss on middle or expert is fixed by tuning a field and saying which, never by changing the tolerance.
3. The same bots on t-engine-putback@41c2e248 (fix A1): Normal livesPerRun is 0 for every tier (A1's promise), put-backs printed.
4. tierBots.test.ts green and red-proved (break one mapped number and it fails); botBaseline kid/adult diff empty; tsc clean.
5. Polish check: a still of one middle-bot run's stuck spot on 1-1 (upright and sideways) with the piece named, so the lead can see
   what the bot sees.
## Return
Branch t-bots-tiers from origin/main, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons applied"), 50
lines or fewer. Then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 8 lines or fewer. Then stop.
## Attempt
1
