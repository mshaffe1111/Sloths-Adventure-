# ENG-BOT27b REPORT: SKILLS.reAim as the CHILD bot's skill only, re-measured (started 2:30 PM ET 11-23 by `date`, 14:30:25)
Branch t-eng-27-wip-bot27-aim. Code 3d90c4977 (child-only gate + toy), t-eng-27 e2f3855cf merged in (2334a3948), then 09c23c1b0 (9aff7f86f, item 7). LANDED on t-eng-27 by fast-forward (no force) at this commit; the hash is in the lead's message and t-eng-27's log.
## 1. Done-items
1. **reAim is the child's alone** (the lead's ruling (3)): `FirstTimer.reAim` (firsttimer.ts, a profile field like letSnap) is set on
   FT_CHILD and FT_CHILD_EASY only and read with SKILLS.reAim at the upstream gate (`SKILLS.reAim && who.reAim && t - aim.since > stopReact`).
   Middle, expert, adult and kid hold the refused aim exactly as on base. No stage id, seed or x. No src/ file changed (tools/inspect only),
   so the stage lock and the proven seed lists cannot move.
2. **Toys** (tools/inspect/riverRide.test.ts; the planted river hoisted into one helper, plantedRide(who, on)): the two ENG-BOT27 toys
   hold on FT_CHILD (GREEN; their REDs as ENG-BOT27 showed); NEW 'SKILLS.reAim is the CHILD bot's alone': both child profiles carry it, no
   other cast bot does, and every other cast bot flies the planted river frame for frame the same with SKILLS.reAim on and off. **RED** with
   the gate planted to read SKILLS.reAim alone: 'middle normal: the switch moved a bot that is not the child' (seen, then restored). 3/3 GREEN.
3. **2-7's ship number** (t-build-27-wip 32dd1236c, GEN2_DRAFT-free, ENG-JETTY's finish fix in, + this change; frozen tree; x40 every bot
   both settings; base = the same tree with SKILLS.reAim off, the gate being its only reader): **bar 23/40 -> 29/40 (bar 24: PASS)**.
   Proven: 1,2,4,5,6,7,12,13,15,17,18,19,21,23,24,25,26,27,28,29,31,32,34,35,36,37,38,39,40. Out: 3, 30 (adult N rx1); 8 (child E rx1);
   9, 10, 20 (middle N rx1); 22 (middle E rx1); 11 (adult N + child N rx1); 14, 16, 33 (child N rx1). Table: bot27b-table-2-7.txt.
   kid N/E, adult N/E, middle N/E, expert N: IDENTICAL to base row for row (40/40 each). child N 27->36 pass, lives 150->124, rescues
   16->4; child E 39->39 (10 rows moved, times only): ENG-BOT27's child rows seed for seed (pass, lives, rescues; a time
   ending .5 s prints 1 s higher here: this table rounds, his floored). 0 pass -> fail. Against ENG-BOT27's all-bots 33/40,
   the four seeds 9, 10, 20, 22 are the middle's own refused-aim stalls, held now for the race's ruling (R-165.413).
4. **Rule 28 on 2-1, 2-2, 2-4, 2-5, both settings, x40 every bot** (t-eng-27-wip-bot27-aim 2334a3948, frozen; base = the same tree with
   SKILLS.reAim off): every kid, adult, middle and expert row **IDENTICAL to base row for row** on all four (40/40 each; the files
   bot27b-table-2-1/2-2/2-4/2-5.txt). Child: 2-1 N 38->39 (seed 26 F->P; 18 rows moved, lives 71->74, rescues 2->1), E 40->40 (7 rows
   moved, times only): ENG-BOT27's child rows seed for seed (the same .5 s rounding only). 2-2, 2-4, 2-5: child unmoved row for row (no re-aim). **0 pass -> fail anywhere.**
   ENG-BOT27's all-bots moves that are now gone, as ruled: 2-1 middle E seed 24 (39 stays 39), 2-5 kid N seed 21 (unmoved).
   tierBots: 1-1 has no river, so the child calibration cannot move; tierBots.test.ts result in item 6.
5. **pacerLay GREEN** on the frozen candidate: every race row passes, 'the careful middle player (SKILLS.race) beats it, normal seed 2'
   among them (RED under all-bots reAim). The two planted rows (pacerLay.test.ts:254 home Easy seed 1, :280 the bank 28 px up) are red
   as on the base: ENG-JETTY's suite on 1b2897cfb and d9425f091 named the same two, inherited (ENG-27w).
6. **Gates on the frozen candidate 2334a3948** (chattr +i on src, tools; src/game/gen2/proven unlocked, D115): tsc PASS; generalitycheck
   PASS (26 literals, 26 known); knowncheck PASS; reAim toys 3/3 (riverRide.test.ts). Unit suite: 4,073 tests / 4,068 pass / 2 fail / 3 todo (re-run alone after a container restart lost the first
   run): the 2 are pacerLay.test.ts:254 and :280, inherited: ENG-JETTY's suite on 1b2897cfb (code-identical to e2f3855cf) had the same
   4,073 / 4,068 / 2 / 3 and the same two. CI tool line (gates.yml
   'rolled', D126): 348 tests / 336 pass / 11 fail / 1 todo; the 11 = the base's 11, each run on the frozen bare base
   e2f3855cf: wheelChannel.test.ts :40 :56 :79 :92 and wheelRide.test.ts :26 :42 (the w2Finish throw, w2.ts:326, 'the fall at x=335-731
   has no bank at one end': the lead says named on t-eng-27 by ENG-27w and on ENG-26t's list), firsttimer.test.ts:184, riverRide.test.ts
   :107 :145 :203 :219 (:106 :144 :202 :218 on the base: my import line shifts them one). No new red. tierBots: 9/9 PASS (1-1's child calibration unmoved). roadmapcheck: cannot run here (shallow clone; no roadmap file changed).
   Not run, by reason: lockall and the seed-list checks (no src/ file changed: the diff to t-eng-27 is tools/inspect and reference only).
7. **t-eng-27 moved to 09c23c1b0 (ENG-HUD27b) and is merged in (9aff7f86f, no force; only engine-core.md conflicted, both sections
   kept); tsc PASS on it.** The lead's check on the merged head: t-build-27-wip 51ff9c43f + 9aff7f86f, frozen, 2-7 child seeds 1-10, both
   settings, reAim on and off: **20/20 identical** to the 32dd1236c tree's rows (on and off). The suite and the CI tool line above ran on
   2334a3948 (my code on e2f3855cf); ENG-HUD27b's own suite and tool line ran on e4c4d3de8 (its REPORT); the merge joins disjoint files
   (mine: tools/inspect, reference). timecheck and roadmapcheck cannot run here (shallow clone); my stamps predate their commits.
## 2. Polish check
No screen changed (bot code only). Every table row read; every moved row is a child row (2-1, 2-7) and every other bot's row is identical.
## 3. Pushback
- None on the ruling. A note for the lead's race ruling (R-165.413): child-only costs 2-7's bar 4 seeds against all-bots (33 -> 29/40);
  the four (9, 10, 20 middle N; 22 middle E) are the middle's 'water ahead' stall, the same refused held aim the child had.
## 4. Suggestions
- ENG packet (R-165.413, after the race ruling): give the middle reAim with pacerLay re-flown on the race legs only; measure whether the
  careful middle still beats the boat on normal seed 2 (116.5 vs 114.04 s under all-bots) by tuning the re-draw, not the race.
- The x40 runner here (bot27b-run.mts: SKILLS switch on/off in one tree, the off flight as the base) halves a rule-28 run's set-up (no
  second worktree, no base checkout): a candidate for tools/inspect/castBots.ts as `--skill reAim=off`.
## 5. Unresolved
- 2-7's 11 out seeds (section 1 item 3): middle 9, 10, 20, 22 (held for the ruling); adult 3, 11, 30 (BUILD-27c's traces); child 8 (E),
  11, 14, 16, 33 (N; not traced, R-165.413, ENG-BOT27's notes stand).
- roadmapcheck not run (shallow clone).
## 6. Method update
methods (bots), rule 28: a skill switched per bot is proven by flying the same frozen tree with the switch on and off, every bot: the
bots it must not touch are identical row for row (a table that says YES 40/40), not 'unmoved in total'.
## 7. Turnover note: reference/handoffs/engine-core.md §0zq-BOT27 rewritten (3abf15230). Lessons applied: D115 (frozen trees), D122/D123
(7200000 s timeouts, two heavy runs), D125 (the ship number measured first), D126 (CI tool line), D128 (clock from `date`), D129.

# ENG-BOT27 REPORT: 2-7's child river faults in the bot (started 1:16 PM ET 11-23 by `date`; stopped by the lead, context)
### EXACT NEXT STEP (for ENG-BOT27b; the lead's ruling (3): R1 is the CHILD bot's skill only tonight)
Branch t-eng-27-wip-bot27-aim (this commit; code = 11ee2d0ca, base t-eng-27 d9425f091). NOT landed.
1. Make reAim child-only: tools/inspect/firsttimer.ts:3281 `if (SKILLS.reAim && t - this.aim.since > who.stopReact) this.aim.end();`
   (upstream gate's refusal; WaitAim.since at ~1145; SKILLS line 710) is today on for EVERY bot. Gate it to the child tier (FT_CHILD and
   FT_CHILD_EASY, firsttimer.ts:305/312, name 'CHILD'), e.g. a FirstTimer field read there; adult, middle, expert, kid exactly as base.
2. Toys (riverRide.test.ts:233 'on a log flowing AT him, a held hop the upstream gate refuses is aimed again ... (SKILLS.reAim; RED with it
   off)' and :283 'SKILLS.reAim keeps the honest aim (D121 ...)') fly FT_CHILD: they hold; add a row that the middle never re-aims.
3. Gates seen on frozen 11ee2d0ca (all-bots reAim), unit shard 1/2: 2066 pass, 4 fail: 784 NEW pacerLay 'careful middle (SKILLS.race)
   beats it, normal seed 2': middle 116.5 s vs the boat's 114.04 s (GREEN on base 6/6; one re-aim at t 84.63 x 14775, then the stream
   shifts; child-only leaves it as base by construction); 800/801 pacerLay planted halves, inherited (ENG-27w); 847 seedListChunk:
   EPERM from MY chattr freeze (it writes a temp dir under src/; unfrozen 2/2 PASS: freeze src minus src/game/gen2/proven). Shard 2/2 and
   the CI tool line were stopped unfinished: run both.
4. Re-run rule 28 x40 (2-1, 2-2, 2-4, 2-5 base; 2-7 draft + ENG-JETTY's w2.ts hunk) and land on t-eng-27 (merge, no force); hash to the lead.
## 1. Done-items
1. **The packet's faults (a) seed 14 x 13898 and (b) seed 13 x 8700, fixed as SKILLS.meetLog / SKILLS.logEnd: PARKED** on t-eng-27-wip-bot27
   be6aa1825 (deaths fell on every tier, passes did not rise, shipped 2-1 child Easy 40->38; R-165.413).
2. **What held 2-7's yield, traced on two runs and fixed (the lead's pivot; (A) approved with two conditions):** child Normal's 'water
   ahead' stall. Seeds 6 x 9412 and 8 x 8702 (draft + ENG-JETTY's band hunk, no bot change): at an at-him log's FRONT end the upstream
   gate held one drawn aim (a 0.033 / 0.093 s tap) the gate never saw reach the next log 80 px off; on a river every log runs at one speed,
   so the wait never ended; he rode back to the bank and boarded again until the 20 s rescue. **SKILLS.reAim**: at the upstream gate a held
   aim refused for his tier's stopReact ends its wait and is drawn again (firsttimer.ts, WaitAim.since). The race and edge gates unchanged.
3. **Toys** (riverRide.test.ts:233, :283): on 6/6, RED off 5/6 back to the bank; D121: re-draw never inside stopReact (RED on a 0 s plant,
   0.067 s) and the press the same with a loud thumb (RED on a gate planted to read it). 4. **Rule 28 x40**: section 4; gates: section 5.
## 2. Polish check
No screen changed (bot code only); every fall and stall named was read frame by frame (frame ring, HOP_TRACE rows).
## 3. Pushback
- **A third 2-7 fault, not the bot's** (sent at once): the draft's home-leg lower river had no bank at its end (w2.ts:372 deleted the low
  leg's bank under the out leg's soft pit); seed 14 lost 8 of 13 lives there; every castBots run on aede72157 alone is 'rescued x1'. ENG-JETTY's
  band fix restores it; 2-7 is measured here with that exact hunk applied (scratch, nothing of it lands).
- BUILD-27b's yield ran on an uncommitted scratch fix (a yield on a committed head only: LESSONS candidate); the packet's faults were
  real but did not hold the yield: rescues (stalls), not deaths, decide child Normal's pass on 2-7.
## 4. Rule 28 table (pass / lives / rescues, before -> after; tables in this folder)
2-7 (draft aede72157 + ENG-JETTY's w2.ts hunk): child N 27->36 / 150->124 / 16->4; middle N 37->40 / 92->105 / 3->0; middle E 39->40;
adult N 37->37, expert 40->40, child E 39->39, adult E 40->40; kid N 5->5, kid E 24->24 (kid rows unmoved: 0). No pass flips to fail.
**2-7's bar** (adult, child, middle, expert; both settings; 0 rescues; none under 2:00): 23/40 before, **33/40** with reAim (bar 24). Out:
3, 30 (adult N), 8 (child E), 11 (adult N, child N), 14, 16, 33 (child N). Middle N and E now 0 rescues; adult N's 3 are BUILD-27c's traces.
2-7 child N in full (seed: before > after, pass/lives/rescues): table-2-7.txt; after, the 4 fails are seeds 11, 14, 16, 33 (1 rescue each);
11 F->P (6, 8, 9, 10, 12, 18, 21, 36, 37 among them), 0 P->F.
2-1: no pass flips to fail; child N 38->39 (seed 26 F->P), middle E 39->40 (seed 24 F->P). 2-2: unmoved, row for row (no at-him river).
2-4: unmoved, row for row. 2-5: one row moved, kid N seed 21 F/5/9 -> F/4/7 (2 re-aims; still a kid fail, as on base).
**Every moved row:** reAim acts only by ending a refused upstream wait; a run with no re-aim is identical by construction. Checked with a
counter: 2-1's 6 sampled moved rows had 1-4 re-aims each, 3 unmoved rows 0; 2-5 seed 21 had 2, its unmoved neighbour 0. After the first
re-aim the run's later random draws shift, so the rest of that row moves. Stages with no river flowing at him (2-2, 2-4) never re-aim.
## 5. Gates
See EXACT NEXT STEP item 3 (shard 1 on 11ee2d0ca). tsc PASS; generality PASS; knowncheck PASS; tierBots 9/9 (candidate 3). Not landed.
## 6. Unresolved
- **2-7 open rows (with reAim; R-165.413):** adult N 11, a step off an at-him log's far tail (BUILD-27c; rescued x 13245); adult N 3 and 30,
  aims at a drifting log's present place (BUILD-27c; set down at the stilts x 5868 / 5933). child N 11, 14, 16, 33: NOT TRACED, R-165.413
  (one run each, a note only: 14 set down 8x at x 13964 = fault (a), the parked meetLog's case; 16 'water ahead' x 12968; 11, 33 set back
  on solid planks, rescued x 10474 / 10417).
  Kid rows unmoved (the kid's moving-log weakness, the lead's item).
- Parked commit 270f53977's trailer names the lead's session by mistake (force push refused). roadmapcheck cannot run here (shallow clone).
## 7. Suggestions
- ENG packet: seed 15 x 13590 (draft): an upstream row judged a double and landed lost (its no-steer beat). Judged-vs-flown gap.
## 8. Method update
methods (bots), rule 28: 'a take-off with no HopRow is an unjudged press; a gate that holds an aim on a river must be able to end its wait:
on a river the gap to the next log never changes'. And: trace the rescues first; deaths and rescues are different yields.
## 9. Turnover note: reference/handoffs/engine-core.md §0zq-BOT27 (this branch).
