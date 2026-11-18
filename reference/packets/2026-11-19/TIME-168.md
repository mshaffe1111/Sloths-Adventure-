# TIME-168: the time-stamp gate (R-165.168, open since 11-12): a dated ET time a commit adds may not be later than that commit's own time.
Tools, Opus 5.5 high. Written 5:38 PM ET 11-18 (by `date` in the same command). The FIRST free slot, before any other new job (LESSONS D30 REPEAT 3): tonight
if a slot frees before 8:30 PM ET, else Thu 11-19 first. Branch t-time-168 from origin/main; the lead branch is ccr-ea739a2f-dfcee4. BOX: 1 h 30 m, or 50% REAL context. Small, read-only tool + CI line; no game code.
Read FIRST: LESSONS.md D30 (all three repeats), reference/methods/gates.md ("Adding a new check"), the ROADMAP row R-165.168, how
tools/roadmapcheck.mjs and tools/perf/knowncheck.mjs read git and fail (copy their shape: plain node, seconds, clear breach lines).
WHY: the lead and members type clock times ahead of the real clock (11-12: up to 15 min; 11-15: 3-11 min; 11-18: 10-19 min, in STATE,
LESSONS and two packets, and one member message). A habit failed three times; a gate does not forget.
1. tools/timecheck.mjs: for each commit in a range (default: the merge base with origin/main ..HEAD; `--range A..B` to choose), read the
   ADDED lines of reference/STATE.md, reference/handoffs/*.md, reference/LESSONS.md, reference/packets/**/*.md and
   reference/qa-reports/**/REPORT.md; find dated ET stamps the repo really uses (look at STATE.md and LESSONS.md for the shapes, e.g.
   "11-18 5:31 PM ET", "(D87, 11-18 5:31 PM ET", "Written 5:37 PM ET 11-18"); a stamp later than the commit's own committer time (in ET,
   with a 2-minute grace for a commit made right after writing) is a breach: print file:line, the stamp, the commit time, the commit.
   Stamps with no date use the commit's date. Times in quotes of what someone else said ("Matt, 11-14 1:51 PM ET") count the same: a
   quote of the future is still wrong.
2. Planted tests (tools/timecheck.test.mjs or .ts on the CI tool line): a stamp 10 min ahead fails; on the minute passes; the grace
   holds; a stamp from an earlier day passes; a line only moved (not added) is not judged. Also run it over the last 3 days of the lead
   branch and report every breach it finds (the lead's 11-18 repeats were corrected in place with "first typed": the corrected stamps
   must pass, and the report names any stamp still wrong).
3. Wire it: gates.yml next to roadmapcheck; CLAUDE.md check list line and reference/methods/gates.md row (ONE line each; the lead reviews
   the CLAUDE.md wording before merge, it is Matt's file); ciTests.test.ts must see the test file on a workflow.
4. THE CLAUDE.md CHECK LIST for a no-game-code branch (gates.md "Scoped by what changed"): tsc, roadmapcheck, knowncheck, generality,
   the new tool's tests and its run over the range; plus the CI tool line exactly as gates.yml has it.
REPORT reference/qa-reports/TIME-168/REPORT.md: hash, the shapes it reads, planted results, breaches found on the last 3 days, gate lines,
Learned. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL context % and a time from `date` run in the same command.
