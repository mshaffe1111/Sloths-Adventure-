# Method: primary-source research for a design question (first written 2026-11-05, moves research)

Last proven: 2026-11-05, branch research-moves, MOVES.md. Owner of the last update: the moves researcher.

Use for any "what do shipped games actually do" question (TRIAGE R rows, ENGINE-SPEC numbers). Example at the bar:
`reference/research/moves-2026-11-05/MOVES.md`.

1. **Read the question's own "Search:" line** and write down, per question, the number you must come back with (a count, a share, a
   time) and what would count as "no source".
2. **Test the fetch tool first** (TinyFish `fetch_content` on one known page). curl is proxy-blocked on most hosts;
   raw.githubusercontent.com works; YouTube, image hosts, Fandom and RayWiki are blocked (bot or proxy). Plan around video: nothing
   that needs a longplay can be timed here, so say so early.
3. **Save every page you read** as text under the job's folder (`sources/<series>-<slug>.txt`) with `URL:`, `Read: <date> by <who>
   (<tool>)`, `Title:`, `---`, then the text verbatim. An excerpt is allowed only when the header says EXCERPT and says what was left out.
   Every failure goes in `sources/BLOCKED-<series>.txt` with the URL and the error.
4. **Helpers fetch; you read.** Give each helper at most about 12 pages and ask for the file list first and the report second (three
   helpers that fetched 15-20 pages ended without a report on 11-05; their files were complete). Effort: medium for fetching with
   judgment, low for a fixed list of pages.
5. **Build tables with scripts from the saved files** (never by hand): the script names the files and lines it reads, prints a
   markdown table, and its output is committed beside it (`ours-*.txt`). A wrong parse then shows: the first SMB stair count dropped
   every row starting with "-" and found 3 stairs instead of 25.
6. **Measure our side on our code** the same way (the ladder json, mechtable, a scan script), at a named commit, and run the proposed
   rule against it: show pass/fail per item.
7. **Only after the first source list,** cross-check with our earlier research (ledgers, GEMINI files, R1-R4): mark agree / contradict /
   new for each overlap.
8. **Report per question:** the number, the saved file and line, the URL; or "no source" with what was searched. Then the rule it
   supports (a proposal: the designer rules) and the spec lines it contradicts. Mark every number measured / dev-reported / wiki /
   estimate. Wiki enemy lists are floors.
9. **Before reporting, run an adversarial checker** (a helper at high effort, given the report and the files only): it re-opens every
   cited line and re-runs every script. On 11-05 it found 16 defects in the first draft, one a regex bug that changed a whole-game table.
10. Start the report with planned vs actual time; finishing under half the planned time is a red flag the lead checks.
