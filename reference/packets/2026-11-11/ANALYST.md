# TASK W11-ANALYST   to: Analyst   effort: high (the lead's call, Matt 11-07: small-sample judgement needs room)   due: <date at dispatch + about 3 h>
## First, before any tool call
Read reference/roles/README.md, then your card reference/roles/DATA-ANALYST.md (both, and the card's pack, with `git show origin/ccr-ca657d3c-n09zty:<path>` after the fetch in the packets
README). Your card has no knowledge-pack section; read these, in order: reference/LAWS.md, tools/playtesters/LOG_EVENTS.md,
tools/playtesters/report.py, reference/consultant/BENCHMARKS.md. Push back, suggest, go beyond inside your WRITE files.
## Objective
The ranked fix list for the play window that ends Tuesday 11-10 (live 0.9.5, gen2 1-1), aggregates only. Matt, 11-09 evening: "pull the test data and make a plan on starting fixes" (R-165.77): read every row up to your pull, state the pull time and that the window is still open at the top of WINDOW.md, and write the list so the closing rows can be added as a delta.
## Why it matters
The 11-07 outside review ranked an Easy child stuck 37 minutes, all 21 lives lost in the treetop sections, and several recorder numbers
that can't be right. This window says whether those hold beyond one or two players.
## Frozen inputs (do not change)
- Distrusted recorder fields (reference/consultant/responses.md, our finding 3; R-165.58), each judged as follows:
  - per-section median times in long sections (a 4,000 px section logged a 5 s median) and End-section times (0 s): possible only if
    section length / time is at or under the engine's top horizontal speed: 430 px/s is the highest set speed found on 11-07 (vine
    swat, engine.ts:7810; run is 285, physics.ts:9); confirm none is higher (grep the `vx =` assignments). Show the arithmetic.
  - the double-jump count: `move` logs first use per stage only, by design; judge it against the recorder code (playRecorder.ts), not
    arithmetic.
- The 0.9.5 boundary: release-0.9.5 merged as PR #63 (e92bdcdb), 2026-11-06 6:32 PM ET. A run's `gen2` moment names its build commit
  only on builds after 11-06 (LOG_EVENTS.md:97, :192). Rows without a commit: side by the sheet's build-time column against 6:32 PM ET
  11-06. `dev` builds and test-link branch commits: their own "other" row, never folded into either side.
## Files
- READ: the files above; the sheet "Sloths control tests", tab Sessions (the Google Sheets connector).
- WRITE: tools/playtesters/report.py (grow it); reference/qa-reports/window-2026-11-10/WINDOW.md (the window report) and REPORT.md (the
  task report); reference/handoffs/analyst.md (your turnover note; create it). Not personas/ or profile.py: the Critic builds the bots
  from your PASSED report.
- Raw sheet exports (names, codes, finger logs) stay OUTSIDE the repo, in your scratch directory, and are deleted when you finish.
## Definition of done (the Critic checks each)
1. WINDOW.md has the card's six sections for 1-1 Normal and Easy; every claim with its count, players and layouts; outliers marked.
2. A "Before 0.9.5 / since / other" table: rows, sessions and players per side (counts only), so the lead can delete the pre-0.9.5
   data (R-165.59).
3. The distrusted fields judged as the frozen inputs say, with the arithmetic or the code line shown.
4. A top 10 in WINDOW.md, scored players affected x severity, each with the seeds to reproduce it.
5. No tester name, code or survey sentence in the branch's DIFF from origin/main. Before every commit run both and hand-check each
   hit: `git diff origin/main | grep -nE -i '<the four first names that are the file names in tools/playtesters/personas/, joined by |>'`
   and `git diff origin/main | grep -nE '\b~?[A-HJ-NP-Z2-9]{6}\b'` (the 6-letter code shape, LOG_EVENTS.md:96).
6. The delta: report.py reruns with ONE command on a later pull, and WINDOW.md names that command at its top. The read after the
   window closes is attempt 2 of this packet, sent by the lead as a delta packet.
## Return
Branch t-w11-analyst from origin/main, pushed (git ls-remote). REPORT.md in the 7 sections of roles/README.md, 60 lines or fewer.
Last message 10 lines.
## Attempt
1
