# BUILD-26p: R-165.390, 2-6's climb loop traced frame by frame: a level fact or a bot aiming fault; the toy, then the fix
Level build (bots), Opus 5.5 high. Written 5:45 PM ET 11-22 (by `date` in the same command). A FRESH member. Release 4's critical path
for 2-6 (D125: 2-6's castBots --proven yield is 29 of 100, the bar is 60; this is cause A, the biggest lever).
**BUDGET (Matt, 11-22 5:44 PM ET, R-165.397): about 10% of the weekly limit for the rest of today. AT MOST TWO BOXES; the lead stops
you sooner if the meter says so. Each run once, on the exact head.**
BOX: hand over at 320k REAL context OR 28 minutes after your start (from `date`), whichever comes FIRST (D111), with the EXACT NEXT STEP;
a long run may carry past the box when its verdict carries (D114). **A question to the lead never ends your box (D120). Every long run
with run_in_background AND `timeout: 7200000` for a suite or drawcheck, a fitting one otherwise (D122, D123), NEVER a shell '&' (D113);
at most TWO heavy runs (suite, drawcheck, lockall, castBots, stills each count), watching free -m AND df; every run on a FROZEN worktree
(`chattr -R +i <tree>/src <tree>/tools && chattr -i <tree>/src/game/gen2/proven` right after its node_modules link; `chattr -R -i`
before removal; D115). No heredoc in a commit chain (D119). Candidates on t-build-26-wip-26p, never on t-build-26 until the lead rules (D117).**
READ LEAN (D102): this packet; `git show origin/t-build-26-wip-26o:reference/qa-reports/BUILD-26/REPORT.md` BUILD-26o's top section
ONLY (its EXACT NEXT STEP and its rule-28 cause A); ROADMAP rows R-165.390 and R-165.393; level.md rules 4, 21, 28, 29; LAWS headlines;
LESSONS D96, D102, D107, D109, D111-D125.
**Run ReadNotifications at EVERY step boundary, at every push and between long tool rounds. Messages to the lead carry NO clock times (D109).**
BASE: t-build-26 at 9e1e30b27 (ENG-26r's 2-6 draw fix landed as a fast-forward; its suite on the same code, 3ecb87eaa, was GREEN alone on
a frozen tree, and only REPORT files changed since, so that verdict carries: NO step-0 suite, D118). BUILD-26o's trees died with its
container; its tools are in reference/qa-reports/BUILD-26/b26o/ (rescuelog.mts.txt: copy to a .mts; `WT=<frozen tree> STAGE=2-6
SET=normal BOT=FT_KID npx tsx rescuelog.mts <seed>`: each rescue with the 3 s before it) and b26m/k22wrap.mts.txt.
1. **Trace cause A frame by frame** on 2-6, the rows BUILD-26o named: kid N 14, 17, 29, 32 (y about 5560); kid N 34 and adult N 23
   (y about 3739, identical frames); kid E 16 (the jump left near x 1080-1180 at y about 3962). For each: where he takes off, his aim,
   his hold, the landing he expects (the route's own target) against the landing he gets, and the gap and height of that jump.
2. **Decide which it is, with numbers:**
   (a) **a LEVEL fact:** the gap or height is beyond the kid's (or the adult's) real jump on that setting (tools/inspect/jumps.ts ADULT/KID,
       and the engine's own jump). Then STOP and send the lead the measurements against the jump tables. A content change is the lead's GO.
   (b) **a bot AIMING fault:** the jump is within his real reach, and the route picks a take-off or a target he cannot make from his
       run-up. Then a TOY that is RED on 9e1e30b27, the GENERAL fix (no stage id, no x position: generalitycheck), and the toy GREEN.
   It may be both on different rows; name each row's verdict.
3. **If (b): rule 28** on the candidate. castBots seeds 1-40, every tier, both settings, on 2-1..2-6 and 1-4, a row-for-row diff against
   t-build-26's rows: no pass flips from a wrong read, no tier drops, every moved row explained. Then the suite (D118: tools changed, so
   src tests that import the bot run again) and tierBots on a frozen candidate.
4. **Then 2-6's yield again:** castBots --proven over the 100 listed rolls, every bot, both settings. Report the gain against 29, per bot and
   per cause. No list writes and no fill: the lead rules the list after causes B, C and the floor.
5. Send the lead: each traced row's verdict (a or b) with its numbers, the toy, the candidate hash, the rule-28 table, the new yield.
   The lead rules before anything lands on t-build-26.
REPORT: a new top section of reference/qa-reports/BUILD-26/REPORT.md on t-build-26-wip-26p (EXACT NEXT STEP first). Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next'.
