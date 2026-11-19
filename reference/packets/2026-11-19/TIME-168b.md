# TIME-168b: timecheck's false positive on stage ids ("1-2 at 2:10 PM" read as a date) + its sweep of every branch INT-13 will merge.
Tools, Opus 5.5 high. Written 7:44 PM ET 11-18 (by `date` in the same command). BOX: 60 min or 400k REAL context; cutoff 11:30 PM ET.
A FRESH member (not TIME-168's). Keep reads lean: only what is named here.
Read: LESSONS.md D30 (all repeats), TIME-168's REPORT (origin/t-time-168 reference/qa-reports/TIME-168/REPORT.md), tools/timecheck.mjs and
its tests on that branch.
FOUND BY THE LEAD (7:44 PM ET): `timecheck --range <base>..origin/t-meter-4` prints, besides two real breaches,
"reference/qa-reports/ENG-23/REPORT.md:38 '1-2 at 2:10 PM' is 64749:14 after its commit": a STAGE ID (1-2) followed by a time was read as
a month-day date. Stage ids 1-1..10-10 all look like dates. A gate that cries wolf gets loosened; fix it at the root.
BASE: branch t-time-168b from origin/t-time-168 (7cfb9c2c).
1. A stamp's date counts only if it is plausible for its commit: within 7 days before or 1 day after the commit's own ET date; otherwise the
   numbers are not a date (a stage id) and the line is judged as an undated time only if the time itself reads as a stamp (say how).
   Planted tests: "1-2 at 2:10 PM" in a line committed 11-18 3:00 PM is not a 64,749-minute breach; "11-18 3:15 PM ET" committed at 3:09 PM
   still fails; "10-10 boss" with no time is ignored; a real "11-17 9:00 PM ET" committed 11-18 passes. Every TIME-168 test still green.
2. The SWEEP (read-only, report only): run the fixed tool over merge-base(origin/main)..<branch> for every branch INT-13 merges: t-int-12
   (ce4ad461), t-eng-23, t-eng-25b, t-eng-26, t-meter-4, t-art-w2a, t-design-29, t-keeper-23-29 (if pushed), t-build-24, t-eng-24c,
   t-time-168b itself. List every breach (file:line, stamp, commit time, branch) in reference/qa-reports/TIME-168b/sweep.tsv. Do NOT edit
   other branches: INT-13 corrects them at merge to the commit clock (never by loosening the gate).
3. Checks (tools-only branch): tsc, roadmapcheck, knowncheck, generality, the tool's tests, ciTests, the CI tool line exactly as gates.yml
   has it, timecheck on its own range.
REPORT reference/qa-reports/TIME-168b/REPORT.md: hash, the rule as coded (file:line), planted results, the sweep table summary, Learned.
Call ReadNotifications whenever a notice says pending, at every push and before your report. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM;
every message carries REAL context % and a time from `date` run in the same command.
