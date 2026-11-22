# INT-R4: release 3's FINAL candidate: the fallback first (2-3 + art, without t-build-26), then t-build-26 merged in when the lead says
Integration, Opus 5.5 xhigh. Written 2:04 PM ET 11-22 (by `date` in the same command). A FRESH member. **RELEASE 3 (target Mon 11-23). NO PR:
the PR waits for Matt's "push".** Matt (11-21 wrap): release 3 only, at most 2 members; the account's WEEKLY limit is in warning: run each
gate once on the exact head, no repeats without a reason.
BOX: hand over at 320k REAL context OR 28 minutes after your start (from `date`), whichever comes FIRST (D111), with the EXACT NEXT STEP;
a long gate run may carry past the box when its verdict carries (D114: you wake to append it). **A question to the lead never ends your
box (D120). Every long run with run_in_background AND a fitting timeout (D122: at most 7,200,000 ms; THE FULL SET in TWO runs: tools/fullset.sh
without the suite, then the suite alone), NEVER a shell '&' (D113); every run on a FROZEN worktree never touched while a run reads it (D115);
no heredoc in a commit chain (D119).**
READ LEAN (D102): this packet; `git show origin/release-0.10.2:reference/qa-reports/INT-R3/REPORT.md` (its EXACT NEXT STEP, the gate table,
the conflict table); reference/methods/release.md "Before the PR" steps 0-6; methods/gates.md "THE FULL SET"; PLAY-STORE-RULES §6 (the check
before a merge); LAWS headlines; LESSONS D40, D42, D92, D102, D111-D122.
**Run ReadNotifications at EVERY step boundary, at every push and between long tool rounds. Messages to the lead carry NO clock times (D109).**
BASE: release-0.10.2 at aa27fcf80 (code e5eecab9a: main 2a87f4cda + t-ui-372 01cc35139 (2-3 + the edge marker) + t-art-next 4f0853b96).
1. MERGE origin/t-art-next at **8feca1123** (the lead's ruling, not 4f0853b96), carrying R-165.386's ROADMAP row (copy it verbatim from the
   lead branch origin/ccr-ea739a2f-dfcee4's reference/ROADMAP.md) in that merge commit, as GATE-292 carried R-165.292. Expect the catalog
   conflicts INT-R3 met (re-run catalogclips.py on all clips + catalog_master.py --emit; re-measure inventory.test's pinned count). tsc + the CI
   tool line right after (D92).
2. The version bump (package.json 0.10.1 -> 0.10.2) and What's New: draft its top entry in PLAYER words (what a child notices: the new stage
   2-3, Pokey looking the same in every move with no ghostly double when he cheers, the edge marker), at most 4 short lines, and SEND IT TO
   THE LEAD before committing (lead-approved words, release.md step 3). A test fails if package.json and whatsNew differ.
3. **THE FULL SET on that exact head (the FALLBACK release 3, without 2-6):** `git fetch --unshallow` first; tools/fullset.sh (INT-R3's
   tools/) without the suite, then the suite alone; funcheck through fundiff.sh (22/22 identical, else a red); castBots 2-3 vs BUILD-23e with
   castcmp.py (0 of 360); lockall vs main --intended 2-3; the slot confirm (slotconfirm.mjs), with one more look: the otter's 'spooked' face in
   the 'gone' frames is the stage's own state at that frame, not the marker's. Gate table in your REPORT.
4. When the lead says t-build-26 is FINAL (its bot candidate landed and both relists done): MERGE origin/t-build-26 (tsc + the CI tool line),
   What's New updated (2-6 and 1-4 in player words, to the lead first), then THE FULL SET again on THAT head (+ lockall --intended 2-3, 2-6,
   1-4; castBots 2-6 and 1-4 rows vs t-build-26's final rows; seedlist --check on every listed stage). If the lead says the checkpoint is
   missed, the fallback from step 3 IS release 3.
5. Hand the lead the final head and its gate table: the lead builds Matt's EnK5 test link from it and asks Matt for "push". No PR from you.
REPORT: reference/qa-reports/INT-R4/REPORT.md on release-0.10.2 (EXACT NEXT STEP first; what merged, conflicts, the gate table). Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next'.
