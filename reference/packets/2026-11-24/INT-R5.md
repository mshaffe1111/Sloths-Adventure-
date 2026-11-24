# INT-R5: release 4 (0.10.3) candidate: main + t-build-26 (base, green) + t-build-27e (2-7) + t-eng-27 (WARN-412, 2-7's engine) [+ TEACH-11 if landed]
Integration, Opus 5.5 xhigh. A FRESH member. **RELEASE 4 (target: the PR TONIGHT, on Matt's "push"; Matt merges). NO PR from you: the lead
opens it.** Usage: 9 percent of the week at 1:59 PM until the reset (about 2 AM): run each gate once on the exact head, no repeats without a
reason. **BUDGET 2.5 h across sessions; REPORT BY the time the lead names; HARD STOP start + 4 h.**
BOX: hand over at 320k REAL context OR 28 minutes, whichever comes first (D111; the lead may extend under 250k for a running gate), with the
EXACT NEXT STEP. Every long run with run_in_background AND a fitting timeout (at most 7,200,000 ms; THE FULL SET in TWO runs:
tools/fullset.sh without the suite, then the suite alone), NEVER a shell '&' (four slips 11-24); every run on a FROZEN worktree (D115; keep
src/game/gen2/proven writable); no heredoc in a commit chain (D119).
READ LEAN: this packet; packets/2026-11-22/INT-R4.md (the shape that shipped release 3); reference/methods/release.md "Before the PR" steps 0-6
and step 4b (per-list sums, D124); methods/gates.md "THE FULL SET"; PLAY-STORE-RULES §6; LAWS headlines; LESSONS D92, D102, D111-D131.
**Run ReadNotifications at every step boundary. Messages to the lead carry NO clock times (D109).**
WHAT SHIPS (the lead's ruling): 2-7 'The Mailman's Route' (t-build-27e 801cae9e8: listed, 29/40, list 69/100, every gate clean on 312ce33a0;
on Matt's test link v269 since 11-23); WARN-412 (t-eng-27 90552d3ec: every warning and story line shows on Normal's defaults; storyTipScan a
gate); today's bot/river fixes and 1-4's relist (t-build-26 e8e99d167: green; 1-4 96/100 until FILL-14 fills slots 26/45/66/69 in place);
TEACH-11 ONLY if it has landed on t-eng-27 when the lead says so. NOT 2-6 (46/100, under the 60 bar: release 5): 2-6 stays as on main.
1. BASE: a new branch release-0.10.3 from main. Merge t-build-26 (the base: main is already merged in it), then t-eng-27, then t-build-27e;
   the t-eng-27 + main conflicts are expected (about 10 files incl. engine.ts and gates.yml; ENG-28 met them): resolve keeping BOTH sides'
   intent, name every conflict and its resolution in the REPORT. tsc + the CI tool line right after (D92). 2-6 must stay as on main: if any
   merge brings 2-6's new list or lay, revert that part and name it.
2. The version bump (package.json -> 0.10.3) and What's New: at most 4 short lines in PLAYER words (2-7 The Mailman's Route: post the letters
   and race the mail boat home; Dot warns before deep water on every setting; smoother rivers), SEND THE WORDS TO THE LEAD before committing.
3. **THE FULL SET on that exact head:** `git fetch --unshallow` first; fullset.sh without the suite, then the suite alone (shards); funcheck
   (fundiff.sh); lockall vs main --intended 2-7 (and 1-4's relist; hint-line moves from WARN-412 named); castBots 2-7 vs BUILD-27g's rows and
   1-4 vs ENG-26u's rows; seedlist --check on every listed stage; storyTipScan --check; drawcheck + clipcheck; the slot confirm; release.md 4b
   per-list sums. Gate table in the REPORT.
4. When the lead sends FILL-14's hash: merge it (1-4's slots filled in place), seedlist 1-4 --check, castBots 1-4 100/100, the suite's list
   tests; when the lead says TEACH-11 is in: merge it, its gate, lockall's hint moves named.
5. Hand the lead the final head and its gate table; the lead builds Matt's test link from it, asks Matt for "push", and opens the PR.
REPORT: reference/qa-reports/INT-R5/REPORT.md on release-0.10.3 (EXACT NEXT STEP first; merges, conflicts, the gate table). Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.
