# TASK W11-ANALYST   to: Analyst   effort: high   due: <from date at dispatch, about 3 h>
## First, before any tool call
Read reference/roles/README.md, then reference/roles/DATA-ANALYST.md, then its knowledge pack in the card's order. You are on the team:
push back, suggest, go beyond inside your WRITE files (README rules 3-4).
## Objective
The ranked fix list for the play window that ended Tuesday 11-10 (live 0.9.5, gen2 1-1), aggregates only.
## Why it matters
The 11-07 outside review ranked an Easy child stuck 37 minutes, all 21 lives lost in the treetop sections, and several recorder numbers
that can't be right. This window says whether those hold beyond one or two players, and it feeds the player bots.
## Frozen inputs (do not change)
- Distrust these recorder fields until proven (reference/consultant/responses.md, finding 3, R-165.58): per-section median times in
  long sections (a 4,000 px section logged a 5 s median), End-section times (0 s), the double-jump count (`move` logs first use per
  stage only, by design). For each, say whether this window's values are physically possible (section length / max run speed 285 px/s).
- The 0.9.5 boundary: release-0.9.5 merged to main as PR #63 (e92bdcdb). Each run's `gen2` moment names its build commit.
## Files
- READ: tools/playtesters/LOG_EVENTS.md, report.py, profile.py, personas/; the sheet "Sloths control tests", Sessions tab (Google
  Sheets connector); reference/consultant/BENCHMARKS.md.
- WRITE: tools/playtesters/report.py (grow it), tools/playtesters/profile.py and personas/ (summary numbers only),
  reference/qa-reports/window-2026-11-10/REPORT.md, reference/handoffs/analyst.md (your turnover note; create it).
## Definition of done (the Critic checks each)
1. REPORT.md has the card's six sections for 1-1 Normal and Easy, every claim with its count, players and layouts, outliers marked.
2. A "Before 0.9.5 vs since" table: rows, sessions and players by build side of e92bdcdb (counts only), so the lead can delete the
   pre-0.9.5 data (R-165.59).
3. The distrusted fields judged with the arithmetic shown.
4. A top 10, scored players affected x severity, each with the seeds to reproduce it.
5. No tester name, code or survey sentence anywhere in the branch (grep the diff before every commit).
## Return
Branch t-w11-analyst from origin/main, pushed (git ls-remote). REPORT.md in the 7 sections of roles/README.md. Last message 10 lines.
## Attempt
1
