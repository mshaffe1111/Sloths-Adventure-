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
- FT_KID and FT_ADULT keep their exact behaviour: botBaseline's output for kid and adult on 1-1..1-5, seeds 1-3, is identical before
  and after your change once the wall-clock field is dropped on both sides (`jq -c 'del(.ms)'`; firsttimer.ts:1743 prints Date.now()).
- jumpHoldMs is press to RELEASE (`i jump` to `i jumpUp`, TouchController.tsx:49-50); punches the jab rule took back are not punches
  (D38). Every number you map, name its source file and field.
- Calibrate on origin/main (0.9.5, what the testers played), on layout list e03e9c8c (138 seeds). The bot's seed argument is a VARIANT
  index (play11Seed -> provenSeedFor(n-1)), not a gen2 seed, and the profiles keep no per-run seeds: name the variants you use (e.g.
  1-40) in BOTS.md. Each tier on the setting(s) its runs were on. n per tier and setting (state them in BOTS.md): expert normal 46;
  middle easy 15, middle normal 27 played; child normal 5, child easy 1 (P27, an outlier no bot should match).
- The bot's rescue (stuck 20 s -> put further on, firsttimer.ts:1567) has no player equivalent and hides stuck time: report rescues
  per run; a rescue in a middle or expert run counts as a calibration miss. The bot's soft falls are the players' put-backs.
- No tester name, code or survey text anywhere (P-numbers only). The persona files in tools/playtesters/personas/ are not inputs here.
## Files
- WRITE: tools/inspect/firsttimer.ts (add FT_CHILD, FT_MIDDLE, FT_EXPERT and only the fields the profiles need; widen `name`), NEW
  tools/inspect/tierBots.ts (the CLI: `--stage 1-1 --tiers child,middle,expert --seeds <list> --setting easy|normal|both`, one JSON line a
  run), NEW tools/inspect/tierBots.test.ts (pins the calibration table so a later change can't drift it), NEW
  reference/qa-reports/R-165.59/BOTS.md (the mapping table and the calibration table), tools/playtesters/profiles/ (the copy only).
## Definition of done (the auditing Critic checks each)
1. BOTS.md mapping table: every FirstTimer field of each tier bot -> its value -> its source (profiles file:field and percentile, or
   "kept from FT_KID/FT_ADULT: no profile measures it", named). Fields the profiles measure and the bot ignores are listed with why.
2. Calibration on origin/main 1-1, at least 40 runs per tier per setting it played (about 7 min in all): finishSeconds p50 within 12%
   of the tier's p50; livesPerRun and putbacksPerRun bot MEAN vs the tier's mean (the profiles hold means, not distributions) within
   max(30%, 0.3); secondPressDelayMs p50 within 25% (doubleUsedShare is 1.0 in every tier, so it is not a check); pieces: per-run rate
   of lives+put-backs in a piece (runs that entered the piece as the base), only pieces with 5+ runs on both sides, top three by rate,
   ties broken by piece id, at least two of three the same. Add piece attribution from stage.gen2.sections x0..x1 (present on main).
   Child: check normal only (5 runs) and name misses without failing (thin); print child easy as an outlier. A miss on middle or expert
   is fixed by tuning a field and saying which, never by changing the tolerance.
3. The same bots on t-engine-putback@41c2e248 (fix A1), run from a worktree of that commit with your two tools/inspect files copied in:
   Normal livesPerRun is 0 for every tier (A1's promise), put-backs and rescues printed.
4. tierBots.test.ts green and red-proved (break one mapped number and it fails); botBaseline kid/adult diff empty after del(.ms); tsc
   clean.
5. Polish check: a still of one middle-bot run's stuck spot on 1-1 (upright and sideways) with the piece named, so the lead can see
   what the bot sees.
## Return
Branch t-bots-tiers from origin/main, pushed (git ls-remote). REPORT.md (the 7 sections plus "Method used" and "Lessons applied"), 50
lines or fewer. Then ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 8 lines or fewer. Then stop.
## Attempt
1 (packet revised 11-11 5:33 AM ET on its Critic's six findings)
