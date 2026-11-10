# Turnover note: the data analyst (rewritten at the end of every task; first written 11-09 by W11-ANALYST attempt 1)

## Open
- The play window ending Tue 11-10 (gen2 1-1, live 0.9.5) was read up to the 11-09 8:39 PM ET pull (last row 7:25 PM ET).
  Attempt 2 is the delta at the close: rerun report.py on a fresh full pull, then compare against
  reference/qa-reports/window-2026-11-10/WINDOW.md.
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
- 1-1 has nothing to punch (0 stomps and 0 hurts in 95 runs), so every punch intent there is a misread.

## Traps I hit
- The 11-07 report summed section time per slice, not per run, and never closed the last section. Both are fixed. Don't bring them back.
- Slices that hold a respawn span x far faster than the top speed. Exclude them from speed checks.
- Dot's hints show once per device, so judge teaching on each player's FIRST run only.
- Privacy: never print the Player cell, the device line or survey `note`/`lookedNote`. Grep the diff for the four persona names and the
  6-letter code shape before every commit.
