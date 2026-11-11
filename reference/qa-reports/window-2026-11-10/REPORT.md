Method used: no analyst method file exists. Used DATA-ANALYST.md "The report" (six sections), applied by tools/playtesters/report.py. Proposed method below.
Lessons applied: LAWS 3 (checked each fact in code or git before using it: top speed, `move`, the boundary commits, the sheet time zone); LAWS 5 (no check cut); privacy (README rule 8).
# W11-ANALYST, attempt 1: report
## 1. Done-items
1. WINDOW.md §3 (Normal) and §4 (Easy) carry the card's six sections: sections, players, phones, glitches, teaching, ranking (§6). Every claim
   has its count, players and seeds. ONE/FEW/SKEWED mark outliers.
2. WINDOW.md §1 has the sides table: before 3,145 rows / 123 sessions / 22 players; since 1,403 / 40 / 9; other 1 / 1 / 1. Each
   commit side was checked with `git merge-base --is-ancestor` (a89564f, 1124252, 181d284 are on main after e92bdcdb).
3. WINDOW.md §2 covers the distrusted fields. Section times: 4242/520 = 8.2 s floor against the old 5.6 s median, an impossible value
   caused by re-entry slicing. End = 0 s was a report bug, now fixed. Double jump: playRecorder.ts:409-416 and engine.ts:864-867.
4. WINDOW.md §6 has the top 10, scored, with seeds (list e03e9c8c), plus one item added by judgment and marked as such.
5. Privacy: `git diff origin/main` was grepped with the four persona names and with the code shape `\b~?[A-HJ-NP-Z2-9]{6}\b`. Both
   hits were hand-checked (see the commit). Players appear only as P-numbers. No survey free text was ever decoded into output.
6. The delta command is at the top of WINDOW.md: `python3 -I tools/playtesters/report.py <export folder> [--delta "11/9/2026 19:25:00"]`.
   `--self-test` passes.
## 2. Polish check
No screens were changed. I checked report.py's output against the physics: 0 clean slices are over 520 px/s, and every lostLife and
finish sits inside a slice (lives total 36 = the sum of the per-section counts).
## 3. Pushback
- Frozen input "430 px/s is the highest set speed": wrong. The swing leap is capped at 520 (`SWING.leapMax`, physics.ts:373, `tarzanLaunch`
  :689). I used 520. The 11-07 verdict on the 5 s median still stands under both numbers.
- The score formula ranks a 22-minute loop as ONE player × 3. I added it by judgment instead of hiding it (WINDOW §6). The fix would be
  to scale "stuck" severity by minutes. Lead's call.
- The sheet's Arrived column is Pacific time, not ET (spreadsheet setting). report.py converts it now. Any ET reading of raw
  Arrived cells is 3 h early.
## 4. Suggestions (ready packets)
- ENGINE: "help after N put-backs". Objective: on Easy, after 8 put-backs in one gen2 piece, offer stuckHelp or a bridge. Files:
  engine.ts, sectionTrack.ts. Done-items: a planted test on seed 12727 `w1-log-chain`; `stuckHelp` is logged. Evidence: WINDOW §4.
- ENGINE: "tap then flick = jump". Objective: when nothing punchable is in reach, a tap followed by a jump flick within 0.6 s is read as
  the jump. Files: the touch rules (TouchController, input). Done-item: a replay of P24-style input shows 0 punch intents in 1-1.
  Evidence: 154 of 700 punches kept and followed by a jump press (9 of 10 players; corrected 11-11 from 475).
- DESIGNER then CONTENT: catch roads under the raised chains (`w1-log-chain-rise`, `w1-mushroom-chain-back`, `w1-log-chain`), or the
  put-back rule extended to them. Done-item: the bot replay on WINDOW §6 seeds shows 0 pit lives. Evidence: 24 of the 36 Normal lives.
- CRITIC: rebuild the child bot from WINDOW §4 (P27's put-back loop and punch rate).
## 5. Unresolved
- The window is open. Attempt 2 (the delta) reads the closing rows.
- Not built: fps and launch by DEVICE model (I grouped by orientation only), and touch-style skill signals (LOG_EVENTS "Skill from
  play"). Both are next for report.py.
- Why P27 never saw `hint.1-1.double` (tipMemory on a shared device?) is not proven.
- Raw exports sit in the scratch folder, outside the repo. I delete them as my last step.
## 6. Method update (proposed: reference/methods/playtest-window.md, new)
1. Pull Sessions!A2:H with the Sheets get_values in 1,000-row ranges. The connector saves each to a file. Move the files to scratch.
2. Run report.py, then `--self-test`. Read only its aggregates.
3. Validate before reading: the speed floor (520 px/s), the `move` semantics, slices closed at finish, and the sheet time zone.
4. Per player as well as per run. Mark any finding on 1-2 players. Top 10 by score, and name every judgment override.
5. Grep the diff for names and codes before every commit. Delete the raw exports at the end.
## 7. Turnover note
reference/handoffs/analyst.md was created in this commit (first analyst).
## Attempt 5 (11-11): the bot inputs, so the sheet can be purged
- tools/playtesters/profiles/ has 33 player files (P-numbers), 4 tier files and index.json, plus a README for every field.
  `report.py <full export> --profiles tools/playtesters/profiles` rebuilds them. The layouts come from the new tools/playtesters/layouts.ts.
- Tiers come from play: expert P24, P30; middle P25, P28, P29, P31; child P26, P27, P32 (6 runs: thin); unrated P33.
- Correction to #3: the true misread count is 154 of 700 punches (9 of 10 players), not 481. The old rule counted jump RELEASES and the jab rule's
  designed take-backs. The ranking is unchanged.
**Nothing in the sheet is needed after this commit, except:** (1) stroke-by-stroke finger paths, if a bot must replay exact
strokes rather than sample the distributions (none does today); (2) survey free text (`note`), never read by rule, if Matt wants it;
(3) the before-0.9.5 players' per-stage lives and section times on the old stages (only their touch numbers are kept; those stages
were replaced); (4) the name to P-number join, which is never in the repo. Once the sheet goes, the four personas in ../personas/
can't be rebuilt from it by name (profile.py reads names); their numbers are already in the repo.

