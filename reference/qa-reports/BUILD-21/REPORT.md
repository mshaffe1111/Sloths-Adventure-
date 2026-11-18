# BUILD-21 REPORT: 2-1 "Down to the River" built as designed, its engine remainder first. Opus 5.5 xhigh. 12:24 PM ET 11-15 on
Branch t-build-21 from t-eng-w2b@19537789 (+ t-art-w2@171831cf merged). STEP 0 GO: the lead 12:36 PM ET ("GO on the plan as written").
Method: reference/methods/level.md (rules 1-29), stage-fix.md. Lessons applied: D19 (tests call the game's build), D36 (frozen worktrees),
D40/D70 (no level-data workaround for an engine gap: the liana and drop-look gaps went to the lead at once), D46 (plain-fall landings),
D50 (teach lines are teachTips), D59 (no job left running), D62 (stills print the BUILT seed/setting), D67, D69 (plants proven RED), D79.

## EXACT NEXT STEP (integration)
1. BOTS on cbe6979c (relist 100/100, --check PASS; castBots 1-40 both settings; every run of every tier ends at the shrine, none
   stranded, no run under the 120 s floor): expert N 40/40 (median 186 s); middle N 40/40 (206 s), E 38/40; child N 32/40 (398 s),
   E 32/40 (290 s); kid N 0/40, E 0/40; adult N 0/40, E 0/40 (castBots' summary did not print for expert Easy). KID AND ADULT DO NOT
   CLEAR BEAT 7: traced seeds 4 and 12, both settings, the first-timer bots are rescued at the high bank's bounce (x 22,241-23,033:
   'a 237-239 px wall ahead, in a dip 30 px deep, an open drop ahead'), at 30 px as at 62 px; the tier bots climb it. World 1's
   bounceWall (w1.ts gBounceWall: mushroom on the floor at 0.7-0.75, wall 225-240) is the same shape, so the next step is a trace of
   the first-timer's bounce read at this wall vs 1-1's (firsttimer.ts), an engine-member job; the other rescues (child 8, middle 2)
   are untraced. Rule 28 not met for those: named, not GREEN.
2. The whole unit suite and the lock on the final head: my suite run on 1b20c78e was STOPPED when the bounce pad changed (UNRUN on the
   final head); `lockall --layouts 16 --check` vs 58182e9a's lock (expect 2-1 moved by this branch, 2-2 by ENG-W2b only).
3. Stills of the final head at the bounce (x~22,300 on seed 2) and a 20-30 s clip of the first deep river (x~14,300): NOT SHOT (context).
4. Merge with t-eng-22: both added to w2.ts and riverArt.ts (its W2_PADS, drawPad): keep both.
5. NOT SHOWABLE until fixed (the lead's judgement 1:36 PM of the stills): (a) THE SAFE LOOK IS TINTED DARK (Easy x14200, Normal x8330,
   x30100 read as deep): engine.ts drawRivers' `over` pass fills every river, surface to screen bottom, with the deep gradient
   rgba(96,160,152,0.3) -> rgba(38,66,71,0.75) after the platforms. Fix: a `safe` river gets no deep sheet (a short band at the log
   line in the shallow's light colours at most); re-shoot a safe river beside a deep one, upright and sideways. (b) World 2's backdrop
   mist panels show hard rectangle edges (x14180 ~570 px, x30100 ~1050 px top ~965, Easy x14200 ~1465 px): feather the layer's edges
   at the art strip, as ART-18 did for w1rain. (c) x2300: a darker vertical band on the far bank's face (~600-640 px): a bank-face seam.

## Done (heads named)
- Step 0 (on 19537789 vs 58182e9a): lock 100/102 unchanged (2-1, 2-2 moved: ENG-W2b's verdict/petal commits); seedlist --check 1-1..1-5,
  1-7 PASS (1-6 not listed on this base); carry sweep, castBots 1-6 middle+child both settings, base vs head: no stage ends worse.
- The knock (84b8848f): river.ts logKnocks; engine plays it near the view; -9 dB Normal / -3 dB Easy. logKnock.test.ts 5/5, planted 3 ways.
- Bots (e5b63a18): SKILLS.upstream, SKILLS.handed; riverRide.test.ts 16/16. Plants: back river child Easy 4 lives off / 0 on; long log
  lives 2 on / 7 off, handed 4/4 on / 1/4 off.
- World 2's liana row (w2.ts W2_LIANA, w2Liana, w2Perch). 2-1 laid by data (w2Arc21.ts), the keeper's lines verbatim (lines-2-1.md brought
  from t-story unchanged; a test holds them). Easy: every river splash-back, logs 20-30 px longer. The village at the gate (finish21).
- The safe river's own look (ART-W2's w2-shallow; drops record safe-water-art). Relist (37945a39): 100 proven of 100, quiet <= 3.8 s,
  modelled 194-205 s, outro 920-940 px. w2Arc21.test.ts 6/6 on cbe6979c. Old rows hint.2-1.deep/open deleted.
- The meter: 2-1's rides are not priced until METER-2a merges; no number reported, none tuned to.

## Polish check (seed 2, stills in the session; the comparison sheet is reference/qa-reports/BUILD-21/bounce-E-vs-C.jpg)
- Every river upright + sideways, Normal + Easy (1b20c78e, river geometry unchanged since): safe rivers read shallow (the bed's stones),
  deep ones dark; painted logs; reeds. Whole screen (D79): banks, boulders, backdrop, HUD all painted; no code-drawn piece seen.
- Gate (5daa688e): round doors dug into the bank, PLEASE BE PATIENT, mailbox, washing: reads as the village, both orientations.
- Named: 4 petals in one view at the bounce ('few' lays what 'low' does until ENG-PETAL lands: W2b item 2). The long log is 240 px with
  the 4:1 log art (w2-loglong is for 300+; 300 breaks the 4 s beat at 80 px/s).

## Pushback / design changes (the lead's rulings)
- 2-1.md's string fails V5: R added after X (12:52). Lianas: perches rise (glide guaranteed), bank steps down after (12:52; R-165.274).
- The bounce: E (bamboo, 62 px pad) read as a sprout; C (World 2's lily) ruled 1:21; the 62 px pad then stranded the first-timer bots
  (rescued at x~22,500 on every seed, kid + adult, both settings, 37945a39), so the pad is back at 30 px (cbe6979c).

## ENGINE-WORTHY
1. R-165.274: a liana a guaranteed glide also crosses (World 2+) may be optional, so its perch may sit level or lower.
2. Not built (named): the camera leading to the village on the long log; the keeper's road page `river` (no road-page data on this base);
   the World 2 arrival scene moved to 2-1's gate (storyWorlds.ts).

## Suggestions
- ART-W2: re-cut the bamboo with a flat, broad tuft that reads as a landing on a 30 px pad (the keeper's nature check: bamboo or frond,
  never a mushroom). Then bounceArt draws it for World 2 (BUILD-21 had it wired at 37945a39: a 25-line drop-in).

## Learned / proposed level.md rules
- Run the list's own judge (`libstage` = buildGen2Stage + quietJudge) from the first roll, not a bare build: my clean direct rolls threw
  'pool spent' under the quiet judge. Proposed rule: "roll with libstage from the first brick".
- Proposed rule: "a bounce pad stays at its world's standard height; a piece's art is drawn to the pad, never the pad to the art" (the
  62 px pad cost a relist and stranded two bot tiers).
- A verdict that refuses a new kind of piece is usually right: read it as the truth about the screen (drop.look-lies was).

## Method update
level.md step 3: "addlevel from a frozen worktree (`git worktree add --detach`), so the bricks can be edited while it runs".

## Turnover note
reference/handoffs/engine-core.md §0ze (37b25171).
