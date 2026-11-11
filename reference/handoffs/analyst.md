# Turnover note: the data analyst (rewritten at the end of every task; last: W11-ANALYST attempt 5, the bot inputs (profiles/))

## Open
- The 11-10 window is CLOSED and fully read: attempt 1 (rows 2-4552) plus the attempt-3 delta (rows 4553-4592, pulled 11-11 2:09 AM
  ET). Next window: rerun on a full pull; a delta pull of only new rows works when every new session starts at part 1 (check it).
- Not built yet in report.py: fps and launch by device model, and the touch-style skill signals (LOG_EVENTS "Skill from play").

## Where things live
- The sheet "Sloths control tests", tab Sessions: A Arrived, B Player, C Session, D Part, E Device, F Version (build time ISO), G Seconds,
  H Data. About 5 KB per row, 4,552 rows on 11-09. The Drive export fails ("File too large"). Sheets get_values in 1,000-row ranges
  works: each result is saved to a tool-results file, so no row enters the conversation. Move those files to scratch, outside the repo.
- tools/playtesters/report.py takes a folder of those JSON files: `python3 -I tools/playtesters/report.py <folder>`, plus
  `--delta "<m/d/Y H:M:S ET>"` and `--self-test`.
- Window reports: reference/qa-reports/window-<date>/WINDOW.md, and REPORT.md (the task report).

## Rulings and facts to keep
- The Arrived column is Pacific time (the spreadsheet's timeZone). report.py adds 3 h to print ET.
- Players are joined by tester code (the `tester` event, or the Player cell after " · "), else by name. They print only as P-numbers in
  order of first arrival, so P-numbers stay stable across pulls as long as no older row appears. Before 11-06 there are no codes, so
  before-side player counts are counts of names.
- Sides: a gen2/env build commit on main at or after e92bdcdb = since; dev, an unknown commit or a commit not on main = other. With no
  commit, a build time before 2026-11-06 18:32:50 ET = before.
- The top horizontal speed is 520 px/s (SWING.leapMax, physics.ts:373), not 430. Any section time under length/520 is a counting bug.
- `move double` / `move bounce` = first use per stage start (playRecorder.ts:409-416). Count runs, never uses.
- On Easy, softFall stands in for a life, so it weighs 3. On Normal, softFall is the double-gap put-back and weighs 1.
- `skipOffer` is the "Skip tips" button on Dot's first tip (DotGuide.tsx:409-424): not a glitch, not help; report.py counts it
  under teaching. `stuckHelp` watches jumping at a wall only (engine.ts:4524-4548): it cannot fire on a put-back loop, and no
  help-after-put-backs exists.
- The tap-read-as-punch rule (corrected 11-11): a punch NOT taken back (no punchCancel within 150 ms) followed by a jump PRESS (`i jump`)
  within 0.6 s among the next 5 intents. `jumpUp` is the jump RELEASE (TouchController.tsx:50); the action finger jabs on landing and a
  flick takes it back by design (touchGestures.ts:487-499, CT-17). Window: 154 of 700.
- Bot inputs: `--profiles <dir>` writes players/, tiers/ and index.json (fields: profiles/README.md). Lip distances need the layouts:
  tools/playtesters/layouts.ts rebuilds them the game's way (npx tsx; list must match). p.x is Pokey's MIDDLE and p.y is his feet.
- 1-1 has nothing to punch (0 stomps and 0 hurts in 95 runs), so every punch intent there is a misread.

## Traps I hit
- Read the intent's source before counting it: `jumpUp` looked like a jump and was the release (11-11).
- Every hand-made table must sum to report.py's own total; quote that total beside it (V1, 11-09: a dropped 1-life row).
- The 11-07 report summed section time per slice, not per run, and never closed the last section. Both are fixed. Don't bring them back.
- Slices that hold a respawn span x far faster than the top speed. Exclude them from speed checks.
- Dot's hints show once per device, so judge teaching on each player's FIRST run only.
- Privacy: never print the Player cell, the device line or survey `note`/`lookedNote`. Grep the diff for the four persona names and the
  6-letter code shape before every commit.
