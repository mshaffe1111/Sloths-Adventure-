# ENG-BOT27 REPORT: 2-7's child river faults in the bot (started 1:16 PM ET 11-23 by `date`; report-by moved to 2:50 PM by the lead)
Landing: t-eng-27-wip-bot27-aim (SKILLS.reAim) -> t-eng-27, see section 5. Parked, unlanded (the lead's ruling): t-eng-27-wip-bot27 be6aa1825
(SKILLS.meetLog, SKILLS.logEnd). Lessons applied: frozen trees for every run (D115), two heavy runs (D123), trace before fixing (rule 28),
test the measuring tool (D15: every toy shown RED on its plant), the hop judged is the hop flown, no foresight (D121).
## 1. Done-items
1. **The packet's two faults, re-traced on the draft (aede72157) and fixed in the bot (PARKED by the lead's ruling):** (a) seed 14 x 13898,
   a walk off the lip onto 48 px of an at-him log's tail -> SKILLS.meetLog (walkOntoTail/stepLandsOn); (b) seed 13 x 8700, the landing
   pause's unjudged flick from 64 px behind a log's front -> SKILLS.logEnd. Toys RED/GREEN on that branch. Deaths fell on every tier
   (2-7 adult N 49->2, middle N 92->32) but passes did not rise (2-7 child N 27->25) and shipped 2-1 child Easy fell 40->38: parked.
2. **What held 2-7's yield, traced on two runs and fixed (the lead's pivot; (A) approved with two conditions):** child Normal's 'water
   ahead' stall. Seeds 6 x 9412 and 8 x 8702 (draft + ENG-JETTY's band hunk, no bot change): at an at-him log's FRONT end the upstream
   gate held one drawn aim (a 0.033 / 0.093 s tap) the gate never saw reach the next log 80 px off; on a river every log runs at one speed,
   so the wait never ended; he rode back to the bank and boarded again until the 20 s rescue. **SKILLS.reAim**: at the upstream gate a held
   aim refused for his tier's stopReact ends its wait and is drawn again (firsttimer.ts, WaitAim.since). The race and edge gates unchanged.
3. **Toys** (riverRide.test.ts): 'a held hop the upstream gate refuses is aimed again' (bare at-him river, first on-log draw planted as the
   traced tap; on: a hop off the first log 6/6 phases; RED off: back to the bank 5/6). D121 toy: on-log re-draws never inside stopReact
   (RED on a 0 s plant: 0.067 s) and the first upstream press identical with the drawn thumb and a loud one (RED on a gate planted to read
   the thumb).
4. **Rule 28 x40**, every bot, both settings, row for row: section 4. **tierBots** 9/9 PASS (candidate 3; reAim is not on 1-1's path: re-run
   on the landing, section 5).
## 2. Polish check
No screen changed (bot code only). Every fall and stall named here was read frame by frame (probes: frame ring, HOP_TRACE rows).
## 3. Pushback
- **A third 2-7 fault, not the bot's** (sent at once): the draft's home-leg lower river had no bank at its end (w2.ts:372 deleted the low
  leg's bank under the out leg's soft pit); seed 14 lost 8 of 13 lives there; every castBots run on aede72157 alone is 'rescued x1'. ENG-JETTY's
  band fix restores it; 2-7 is measured here with that exact hunk applied (scratch, nothing of it lands).
- BUILD-27b's yield ran on an uncommitted scratch fix: a yield is measured on a committed head only (LESSONS candidate).
- The packet's faults were real but were not what held the yield: rescues (stalls), not deaths, decide child Normal's pass on 2-7.
## 4. Rule 28 table (pass / lives / rescues, before -> after; tables in this folder)
2-7 (draft aede72157 + ENG-JETTY's w2.ts hunk): child N 27->36 / 150->124 / 16->4; middle N 37->40 / 92->105 / 3->0; middle E 39->40;
adult N 37->37, expert 40->40, child E 39->39, adult E 40->40; kid N 5->5, kid E 24->24 (kid rows unmoved: 0). No pass flips to fail.
2-7 child N in full (seed: before > after, pass/lives/rescues): table-2-7.txt; after, the 4 fails are seeds 11, 14, 16, 33 (1 rescue each);
11 F->P (6, 8, 9, 10, 12, 18, 21, 36, 37 among them), 0 P->F.
2-1: no pass flips to fail; child N 38->39 (seed 26 F->P), middle E 39->40 (seed 24 F->P). 2-2: unmoved, row for row (no at-him river).
2-4: unmoved, row for row. 2-5: one row moved, kid N seed 21 F/5/9 -> F/4/7 (2 re-aims; still a kid fail, as on base).
**Every moved row:** reAim acts only by ending a refused upstream wait; a run with no re-aim is identical by construction. Checked with a
counter: 2-1's 6 sampled moved rows had 1-4 re-aims each, 3 unmoved rows 0; 2-5 seed 21 had 2, its unmoved neighbour 0. After the first
re-aim the run's later random draws shift, so the rest of that row moves. Stages with no river flowing at him (2-2, 2-4) never re-aim.
## 5. Gates (on frozen 11ee2d0ca = the landing's code)
(filled at landing)
## 6. Unresolved
- 2-7 child N still 4 rescues (seeds 11, 14, 16, 33). Seed 11 traced once: not a river; on the solid planks x 10244-12505 he is set back
  to ~10500 again and again, rescued at x 10474 (the next trace; needs a second run). Kid rows unmoved (the kid's moving-log weakness).
- 2-7 adult N: one run under 2:00 on the parked branch only; the builder's length data (lead).
- The parked branch's commit 270f53977 names the lead's session in its trailer by mistake (a force push to fix it was refused).
- roadmapcheck cannot run in this container (shallow clone): FAIL 'proofs cannot be checked', the same on any head here.
## 7. Suggestions
- ENG packet: seed 15 x 13590 (draft): an upstream row judged a double and landed lost (its no-steer beat). Judged-vs-flown gap.
- The parked meetLog/logEnd go on the World 2 river bot list with R-165.413 (the lead).
## 8. Method update
methods (bots), rule 28: 'a take-off with no HopRow is an unjudged press; a gate that holds an aim on a river must be able to end its wait:
on a river the gap to the next log never changes'. And: trace the rescues first; deaths and rescues are different yields.
## 9. Turnover note
reference/handoffs/engine-core.md §0zq-BOT27 (this branch).
