# Turnover note: the data analyst (rewritten at the end of every task; last: DATA-1125, the 11-24 afternoon runs vs the bots, 11-25)

## DATA-1125 (11-25, t-data-1125): rows 5997-6127
- **Last read row: 6127.** 131 rows, build 0.10.2 only, 2 players (P24 expert, P27 child), 6 runs: 1-4 Normal x4, 1-6 Normal x2.
  REPORT: reference/qa-reports/DATA-1125/REPORT.md; aggregates: tools/playtesters/profiles/window-1125.json (addendum).
- **The variant rule was wrong (fixed here):** castBots/RealPlay variant = the 0-based index of the logged gen2 seed among the list's
  plan keys, never the logged seed. Use `printf '<stage> <seed> <list>\n' | npx tsx tools/playtesters/variantOf.ts` (it proves each
  by building it). Re-rolled entries (24 of 1-4's 100) look like live rolls and ARE castable. DATA-1124/1124b's casts are one off.
- Open: re-cast DATA-1124/1124b (REPORT §6 EXACT NEXT STEP); 1-4 w1-14-under-fire for the child (3 lives, 30 min); castBots files
  pod hits as `other`; expert bot timeout on 1-4 #5 Normal.

## DATA-1124b (11-24, t-data-1124): the whole window since 0.10.1
- Last read row then: 5996. Window = Sessions rows 5388-5462 + 5500-5996 (F = 2026-11-21T14:37:27-05:00 for 0.10.1, first row 5388;
  2026-11-22T16:43:02-05:00 for 0.10.2; rows 5463-5499 are a 10-31 build). 3 players: P24 expert, P27 child, **P36 new (middle by the
  rule)**; 24 runs, 16 finishes. REPORT: the DATA-1124b section at the top of reference/qa-reports/DATA-1124/REPORT.md; aggregates in
  tools/playtesters/profiles/window-1124b.json (an addendum, same reason as window-1124.json).
- castBots for 0.10.1 runs: a worktree at origin/release-0.10.1 (4a8c1decd; the build's 2a87f4cd is not in a shallow clone), node
  deps by `npm install --no-audit --no-fund --legacy-peer-deps` (npm ci fails on peer deps; CI uses install). 1-6 and 1-7's lists differ
  on later bases. 1-1 logs the real seed: map it to a variant with LIST.seeds.indexOf(seed)+1 (0 = a live roll, not castable).
- Open: 1-7/1-8 for a middle player (3 runs, 0 finishes); 1-4's y 5000-5999 band (2 of 2 climbers); castBots' Easy stall at 1-2 #82
  x 18651; no survey is sent when a player leaves, so the stages they quit carry no rating.

## DATA-1124 (11-24, t-data-1124): what was read and what is open
- Window: Sessions rows 5700-5996 (build 0.10.2, main cdffdc627; F = 2026-11-22T16:43:02-05:00 from row 5700). 2 players: P24 (expert,
  1-2 and 1-5 Normal) and P27 (child, 1-4 Easy x3). No 1-1, no World 2. REPORT: reference/qa-reports/DATA-1124/REPORT.md.
- Aggregates: tools/playtesters/profiles/window-1124.json (an addendum). players/ and tiers/ were NOT rebuilt: --profiles rebuilds
  from the rows it is given, so a new-rows-only pull would wipe P1-P33. Fold the addendum in at the next whole-tab rebuild.
- Open for the lead: climb sections by height (ENG), a child climb mode for castBots (no Easy rescue; fall rate from the window),
  1-2 #83 at 115 s (under the 2-minute floor), more expert runs off 1-1 before any expert retune.
- METER-2 (11-15): reference/design/METER-COVERAGE.md is still the meter's coverage table; METER-2a waits on the lead.

## Where things live
- The sheet "Sloths control tests" (find it by title with Drive search_files), tab Sessions: A Arrived (Pacific), B Player,
  C Session, D Part, E Device, F Version (build time ISO), G Seconds, H Data. 5,996 rows on 11-24. Rows are NOT in build order
  (a 10-31 build sits at rows 5463-5499 between 11-21 rows): find a window's first row from column F alone (a cheap pull), then A:H.
- Sheets get_values results land in a tool-results file (about 3 KB a row): move it into the scratchpad, never the repo.
- Stable P-numbers without the whole tab: pull Sessions!A2:C<first-1> (arrived, player cell, session; about 340 KB) and rank keys by
  first arrival (code after " · ", else name); the window's own keys come from the `tester` event. 11-24: 36 keys before the window.
- tools/playtesters/report.py: `python3 -I tools/playtesters/report.py <folder>` (+ `--delta`, `--profiles`, `--self-test`). Its
  P-numbers are local to the rows it is given. The STAGES section (11-24) covers every stage but 1-1.
- Bots on a player's layout: `npx tsx tools/inspect/castBots.ts --stage <id> --seeds <variants> --bots kid,adult,child,middle,expert
  --setting both --par 6 --json`. WRONG until 11-25: the variant is NOT the logged seed: use tools/playtesters/variantOf.ts (DATA-1125). Check the run's `list` against src/game/gen2/provenIndex.ts first. About 2 min for 36.

## Rulings and facts to keep
- Arrived is Pacific; report.py adds 3 h. Players join by tester code, else name; print only P-numbers. Before 11-06: names only.
- Top horizontal speed 520 px/s (SWING.leapMax). `move double`/`move bounce` = first use per stage start: count runs, not uses.
- Easy softFall weighs 3, Normal 1. `skipOffer` is teaching, not a glitch. stuckHelp watches wall-jumping only.
- Tap read as punch: a kept punch then a jump PRESS (`i jump`) within 0.6 s among the next 5 intents. `jumpUp` is the release.
- 1-1 has nothing to punch. Climb speed is the engine's (about 220 px/s for P24 and P27): not a skill signal.
- **On a climb, section ids are wrong**: placed sections carry x0/x1 only, so 1-4 logs 3 ids over 11,000 px of height. Read climbs by
  height (y grows downward; 1-4 runs from y 11321 at the bottom to 342 at the top). report.py flags it.
- **Climb lines carry vy 0** (4,836 of 4,836): climb speed is dy/dt between climb lines (report.py fixed, self-test planted).
- A fall = a drop of 150 px or more from the highest point since the last footing to the next footing. On Easy climbs no softFall or
  lostLife line marks it: falls are the only cost the log shows.
- roadmapcheck needs full history: on a shallow clone it exits 2 with no verdict; say so, never call it a pass.

## Traps I hit
- I wrote a count into a code comment before measuring it (2,485; the measure was 4,836). Measure first, then write the number.
- A scratch script that parses states must use the first letter (`c/U` is a climb): exact matches dropped half the lines.
- Every hand-made table must sum to report.py's own total. Validate a counter against what it physically should be before reading it.
- Privacy: never print the Player cell, the device line or survey `note`/`lookedNote` (read survey chips by key only). Grep the diff
  for the four persona names and the 6-letter code shape before every commit.
