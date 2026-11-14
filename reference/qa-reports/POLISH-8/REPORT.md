# POLISH-8 REPORT (t-polish-8 from origin/t-polish-7@38d5596 = 81a13bf + REPORT/gate-log commits only; lead session_01FhBbYNzGRJBDMzn6XbtQK2)
Opus 5.5 high. 4:41-5:3x AM ET 11-14. Context at report: about 20% of 1M (my own estimate; D64).

**NOT GREEN.** The packet's lever (the teach rise) is done, but it is not where the Normal rescues are. 1-1 still does not meet "no rescue"
on Normal for first-timers (kid 9/10, adult 4/10). Both follow-up levers the lead ruled ((A), then (B)) collide with verdict-enforced
rules; neither is committed. Details and evidence below.

## EXACT NEXT STEP (POLISH-9)
**The lead's ruling, 5:23 AM ET:** the rules hold; 1-1 Normal keeps its one double test. In order:
0. **(F) as EVIDENCE first:** the first-timer bots' (castBots kid, adult) double success at 250-256 px against the testers' data (bands.md
   §2-3's flown shares; reference/qa-reports/R-165.59/calibration-main.jsonl). If the bot under-performs the testers, it is a bot artifact:
   fix it in the bot (tools/inspect/firsttimer.ts), with a toy test, never in the stage. Then step 2 below (the 17 re-pins, the first-run
   lock once, the full suite and every gate). (G) goes to Matt with numbers after he plays the new 1-1 (the lead's, not a builder's).
1. **Background for (F): why the stage itself was not changed.** Every Normal
   rescue is at the double teach's TEST gap (beat `d`, DOUBLE_TEST 253-256 px, a level block: a miss is put back on the take-off), not the
   rise (castBots' own `rescueXs`, below). What was tried and why it is refused:
   - (A) soft miss with a step back up (`climbBack` place flag; patch `climbback-attempt.patch`): **blockBreaches** refuses every teach:
     "double block at dg0 (x 7885) is reached by a single jump from the platform at x 7630, y 1235 (68 px under, 155 px across; flown)".
     Any stair inside a 253-256 px level gap is within one jump's reach of the far lip (the 11-06 ruling A: a level block gap has no stair).
     World 1 has no climbing vines to climb out by instead.
   - (B) the teach ends at the practice (no `d`): **promises11 teach.double-no-gap-after** refuses it: "no gap only the second jump
     crosses within 1,500 px of the teach (x 6573)". The practice pit's floor is 70 px down, so the promise's route walks through it.
   - Open: (F) check the first-timer bots against tester data at a 255 px double (the put-back already returns him at once, nothing lost;
     bands.md: a double flick lands 67-72% per try at 250-256; 6/10 adults rescued looks like the bot's stuck timer); (G) a promise change
     (the practice gap read as the test when it is the teach's only double gap): a rule owner's call, never a builder's (law 22).
2. Then, ONCE on the final list (the lead's order, 4:55 AM message): the ruled change + ONE relist (`--merge <list order> --in-order`);
   re-record the first-run lock (seed 9652, variant 10; today `seedlist --check 1-1` is RED: `first-run.drift: the first run (seed 9652)
   builds faba40c194f515f7 on easy, recorded be691a05e81a5b46`: the teach rise moved Easy 132 -> 129-131); re-pin POLISH-7's 17 unit-suite
   pins with reasons (origin/t-polish-7@f8ced0e gates/gates-summary.txt + its REPORT step 0; merge f8ced0e's reference/ files first);
   castBots 1-1 L1-10 kid+adult both settings; tierBots calibration + recommit; the full CLAUDE.md checks (buildcheck alone); stills.

## Done (heads named)
- **Item 1 (0a5fea5): the double teach's rise in Easy's band, both settings.** w1.ts `TEACH_RISE` [-131,-129] (the lead's 128-132, laid
  1 px inside, the bands' convention) for the teach's OWN first rise only: beat `T` (w1-dip-double-teach, w1-bank-double-teach) and
  w1-double-teach's head. Every later D face, the practice and the test gaps unchanged. exitDy -138/-138/-276 -> -130/-130/-268.
  **The judge**: every double rise block was one row, 'double-teach-rise' (Normal 136-140), so a 130 teach would be band.out. Not loosened:
  a teach node's FIRST double rise is its own row, `double-teach-first` 128-132 both settings (reach.ts BANDS + BAND_SOURCE, verdicts
  TAUGHT + lesserOf, pipeline judged11 picks the first by x without reordering the asks; bands.md §2 row). Measured: all 167 listed
  layouts, both settings, 129-131 px (was Normal 137-140, Easy 132).
- **Tests.** verdicts.test: 128/130/132 clean both settings; **Normal 136 band.out (planted)**, 127 band.out, 126 spare-thin; a later D at
  138 in the same teach stays clean. **src/game/w1DoubleTeach.test.ts** (new): every listed 1-1 layout, both settings, the game's own build
  (RealPlay), each double-teach section's first face 100+ px straight off the floor measured 128-132. **Red at Normal's old band** two
  ways: TEACH_RISE = D_RISE -> the judge refuses ("double-teach-first at x 6798 (s3): 138 px, over the band's 132",
  gates/teach-rise-red-at-136.txt); and with the judge's band loosened too, the test alone: "167 of 334 teach rises out of 128-132",
  Normal 137-140 (gates/teach-rise-red-at-136-test-alone.txt). Both restored and checked (0 PLANTED lines).
- **Item 2: ONE relist** (0a5fea5): `seedlist 1-1 --merge <the 169 in list order> --in-order --count 169`: **167 kept** (24554, 60334
  dropped; gates/relist-1-1.txt). Seed **9652 stays variant 10**; the first 12 unchanged in order. seedlist --check 1-2, 1-3, 1-4 PASS
  (1-5 was cut off when I stopped the stale run; unrun on this head).
- **Lock** (lockall --layouts 16, base saved on 38d5596 first): **101/102 stages unchanged; only 1-1 moved (intended)** (gates/lock-check.txt).
- **tierBots calibration** re-run (child, middle, expert; 1-40; both settings) and recommitted (8d305e8); tierBots.test 7/7. Child Normal
  rescues **17 -> 10**; p50 s: child N/E 458.6/305.9 (was 464/304), middle N/E 205.2/193.9 (204/194), expert N 175.5 (174).

## castBots 1-1 layouts 1-10 (item 3; gates/castbots-1-1-kid-adult.txt, head 0a5fea5)
| | kid Normal | kid Easy | adult Normal | adult Easy |
|---|---|---|---|---|
| POLISH-7 (teach rise 136-140) | 8/10 | 10/10 | 6/10 | 10/10 |
| **POLISH-8 (teach rise 129-131)** | **9/10** | **10/10** | **4/10** | **10/10** |
Every Normal rescue located by the bot's own `rescueXs` (firsttimer.ts) and the built geometry: kid 10, adult 3, 4, 5, 6, 9, 10, all
at +941..+1012 px into a double-teach section. Layout 3: floor 0-286 (y 1298), T face 286 (y 1167, rise 131), practice pit 570-825,
practice bank 825-1057, **TEST gap 1057 -> 1312 (255 px, put-back)**: he is rescued standing on the practice bank, failing the test.
POLISH-7's "at the rise" was a misread of the same x (corrected with the lead, 4:56 AM). Adult 6 -> 4 is the bots' own spread at a
67-72% jump (seeds 5 and 9 newly rescued at the same test gap), not the rise.

## Gates on 8d305e8 (gates/): tsc PASS; roadmapcheck PASS (after unshallowing the clone; the first run failed only on 'shallow clone');
knowncheck PASS; generalitycheck PASS; verdicts + w1DoubleTeach + w1BounceTeach 35/35; tierBots.test 7/7; lock 1-1 only; seedlist --check
1-1 **RED (first-run.drift, next step 2)**, 1-2/1-3/1-4 PASS. **UNRUN on this head (named, not hidden):** the full unit suite (RED on the
base with POLISH-7's 17 pins; the lead's order: re-pin once on the final list), roll-pinned tests (stopped: stale once (A) was ruled),
seedlist --check 1-5, the build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck, tool tests. Nothing left running.

## Polish check: stills/teach-{before,after}-1-1-L3-{normal,easy}-*-{upright,sideways}.jpg, 2x, BUILT printed by the game
(seed 5033, rerolls 0, built normal / easy as named). Before Normal 140 px, after 131; Easy 132 -> 131. After: the bank reads about one
and a half Pokey-heights over the floor, the face, lip, petals and the practice pit's mossy step on screen upright and sideways; a teach a
first-timer can see is doable. Named, not changed: in the after upright the floor's grass ends ~25 px short of the bank face, showing a
dark notch of earth at the join (the floor/face seam, not this change's height; worth a look on the test link); a faint horizontal line
crosses the background at Pokey's chest height in the after frames (backdrop, not the teach).

## Pushback: the lead's first ruling rested on POLISH-7's misattribution; the data says the test gap, not the rise. The rise change still
stands on its own reason (a comfortably doable teach; kid +1). (A) and (B) are each refused by a rule I may not move (law 22).
## Method used: level.md (rules 3, 12, 14, 18), gates.md, bands.md, BOTS.md, firstRun11.ts header. Lessons applied: D29 (no relist
without its pins: named as next step), D57 (queue read at every push: 3 rulings read and acted on), D59 (no background job at stop), D62
(stills carry BUILT), D63 (the rescue judged on the bot's own positions, not a summary), D64 (context against 1M).
## Method update (level.md, proposed): "Before acting on a bot's 'rescued at X', print its rescueXs against the section's built pieces
(the 20-line geo script in this report's gates is enough): which piece he stands on and which gap is next." Proof: POLISH-7 and the
lead's packet both aimed at the rise; one printout showed the test gap in 2 minutes.
## Learned (for the next builder): in a level block gap of 253-256 px, any stair or floor a hop under the lip is one jump's way across
(68 under, 155 across is reached); and a pit floor 70 px down makes promises11's route walk through a practice gap, so only a put-back
test keeps the teach promise. A first-stage double test that never strands needs a rule owner's decision, not a builder's trick.
