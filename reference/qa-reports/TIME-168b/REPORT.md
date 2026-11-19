# TIME-168b REPORT: timecheck's stage-id false positive (R-165.168) + the sweep of every branch INT-13 merges
Branch t-time-168b from origin/t-time-168@7cfb9c2c. Fix commit 9510b3c9; head: the commit that adds this file (hash in the lead
message, pasted from git). Engine member (tools half). Written 7:52 PM ET 11-18 (from `date` in the same command).

## 1. The rule as coded
- tools/timecheck.mjs:120-121 `DATE_BEFORE_DAYS = 7`, `DATE_AFTER_DAYS = 1`; :130-143 `readDate`: a month-day token's nearest reading
  (year picked around the commit) is a **date** only if its calendar day is 7 days before .. 1 day after the commit's own ET day (:141).
  Was: any reading within 45 days (old `plausibleDay`): "1-2" in an 11-18 commit read as 2027-01-02, 45 days out, so "1-2 at 2:10 PM" was
  64,749 min ahead.
- Outside the window (:142, :123): a **stage id** (no year, both numbers 1..10: 1-1..10-10) is no date at all. Its time is then judged as
  an undated time, by the same tests as any other undated time: AM/PM written, ET or no zone, not a plan (isPlan: no plan word, "~",
  or "checkpoint" etc. around it), on the commit's own day (the night rule: the day before if that is over 1 h ahead). That is how "the
  time itself reads as a stamp": "the lead accepted 1-2 at 2:10 PM" is the record of 2:10 PM today, and a stage id does not hide a time
  typed ahead ("1-2 at 3:20 PM" in a 3:00 PM commit still fails, planted).
- Outside the window, a **real day** that is not a stage id ("11-02", "2026-10-25", "12-25") is `far` (:171): a time written on it, next to
  it or after it at a ledger line's head, is not judged. Why not "no date" like a stage id (my one change to the packet's wording, for the
  lead to rule): an older day's time is earlier than its commit anyway, a later day's is a plan, and reading it as the commit's own day
  would cry wolf on an old LESSONS line re-committed ("REPEAT 11-12 6:35-6:45 PM ET" edited 11-25 6:40 PM would read as 6:45 PM that day).
- Header doc updated (:20-22).

## 2. Planted results (tools/timecheck.test.mjs, 14/14 pass: TIME-168's 10 + 4 new)
| Case | Result |
|---|---|
| "1-2 at 2:10 PM" committed 11-18 3:00 PM (full git repo, ENG-23's line) | no breach; read as 2:10 PM 11-18, undated |
| "1-2 at 3:20 PM" in a 3:00 PM commit | still 1 breach (the stage id hides nothing) |
| every stage id 1-1..10-10 in November; "- 1-2 cleared 2:10 PM" at a ledger head | no date; no breach |
| "11-18 3:15 PM ET" committed 3:09 PM (full repo, a line also naming 1-2 and 10-10) | fails, 6:00 ahead |
| "10-10 boss" with no time | no stamp |
| real "11-17 9:00 PM ET" committed 11-18 3:30 PM | passes (read as 11-17, dated) |
| window edges, 11-18 commit: 11-11 and 11-19 dates; 11-10, 11-20 far; "13-40" none; "11-19 9:00 AM ET" fails | as stated |
| "REPEAT 11-02 6:35-6:45 PM ET" and "- 11-02 (lead): MATT 6:45 PM" at 6:40 PM; "ship 12-25 9:00 AM ET" | not judged |
Mutation runs (each rule red without it): window back to 45 days: 2 fail; no stage-id rule: 2 fail (also TIME-168's shapes test);
no far skip: 1 fail.
Regression, old vs new tool on the lead branch (origin/ccr-ea739a2f-dfcee4@70890930): merge range 5 -> 0 (all 5 were lines quoting
"1-2 at 2:10 PM": LESSONS:111, STATE:1557, this packet x3); `--since 2026-11-08`: 81 -> 75, the 6 removed are those 5 plus STATE:72
"Wednesday 11-11 2:00 AM ET" (a plan TIME-168 already named false). The 75 real ones are unchanged: no real stamp lost.

## 3. The sweep (reference/qa-reports/TIME-168b/sweep.tsv; read-only, no other branch edited)
Range merge-base(origin/main)..head per branch, all on base 6e7b85f8; full history (unshallowed: blame needs it).
| Branch | Head | Commits | Breaches |
|---|---|---|---|
| t-int-12 | ce4ad461 | 85 | 1: VAR-1/REPORT.md:4 "3:50 PM ET" vs commit 7a8bc47d 3:45:03 PM 11-18 |
| t-eng-23 | 9e306581 | 9 | 2: ENG-23/REPORT.md:17 "3:15 PM ET", :99 "(the lead, 3:15 PM)" vs commit d729206e 3:09:05 PM 11-18 |
| t-meter-4 | 8dd661d0 | 13 | the same 2 (it carries d729206e) |
| t-art-w2a | 44e5884f | 19 | the same 2 (it carries d729206e) |
| t-eng-25b, t-eng-26, t-design-29, t-build-24, t-eng-24c, t-time-168b | 73318234, e5695a93, 562a8e71, 38f9b929, 1f5c4008, this head | 14, 16, 1, 31, 17, 3 | 0 |
| t-keeper-23-29 | not pushed (checked by fetch at the sweep) | - | not swept |
**3 unique breaches, 7 rows** (one commit's 2 on three branches). Each read by eye: real (both ENG-23 lines write the lead's 3:15 PM
into a 3:09 PM commit; VAR-1 stamps 3:50 PM in a 3:45 PM commit). The old tool also printed "1-2 at 2:10 PM" on t-eng-23, t-meter-4
and t-art-w2a; gone. INT-13 corrects ENG-23:17, :99 once (in the branch that lands d729206e first) and VAR-1:4, to the commit clock.

## 4. Checks (tools-only branch)
Deps installed as CI does (npm install --legacy-peer-deps); full history. tsc exit 0; roadmapcheck PASS; knowncheck PASS;
generality PASS (26/26 known); timecheck tests 14/14; ciTests 4/4; the gates.yml tools tsx line (line 103, run verbatim) 226 pass /
0 fail / 1 TODO (chaseBots ENG-B4, not mine, as in TIME-168); timecheck over this branch's own range (6e7b85f8..head) PASS, re-run
on the final head after this report's commit (result in the lead message).

## 5. Polish check: no screen. A sweep row was read as INT-13 will read it: branch, head, base, file, line, stamp as written, the stamp
in ET, the commit's ET time with seconds, the full commit hash (to find the line to correct).

## 6. Pushback / unresolved (named)
- **Known limit, January to October**: a stage id IS a plausible date in its own month (on 3-6, "3-5 at 2:10 PM" reads as March 5).
  It can only make an earlier stamp (passes) or, for the next day ("3-7" on 3-6), a breach a day ahead. The fix then is to write a stage
  as "stage 3-7" / "W3-7" and have the tool skip a token after "stage"/"W"; not done now (no such stamp exists, and it is not November's
  problem). Stated so it is not a surprise in March.
- The far-date skip (§1, 4th bullet) is wider than the packet's words; the lead rules it in or out.

## 7. Method update (gates.md "Adding a new check")
Add: "Before tightening or loosening a text gate's reading, diff the old and new tool's hits over the same 10-day range; every hit
removed is read by eye and named in the report (this one: 6 removed, all false; 75 kept)." It is how §2's "no real stamp lost" is proved.

## Learned / Lessons applied
D30 (every time here from `date`), D15 (tested the tool before trusting the sweep: the first sweep ran on a shallow clone and every
branch exited 2; unshallowed and re-ran), D31 (the CI tool line exactly as gates.yml has it), D57 (inbox at push and before report),
D87 (long runs in the background). Learned: a date window must be asymmetric and in days, not ms around the commit: a stamp is written
the day it happens or quoted from the past, never weeks ahead, so "how far ahead a date may be" is the whole fix.
Proposed rule for gates.md: none beyond §7.
