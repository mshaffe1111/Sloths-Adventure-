# ENG-PLANT-g: release 4's bot fix, session 5 (rebuild the run-up judge; the 2-1 landing walk-off; wide sample; full rows) (release 4, Wednesday)
Engine (bots), Opus 5.5 xhigh. A FRESH member. **HARD STOP 9:30 PM ET tonight (release 4 moved to Wednesday: get it right, not fast).**
Hand over at 320k REAL context or 28 minutes with an EXACT NEXT STEP, **pushed and confirmed with `git ls-remote` BEFORE you tell the lead
you are handing over** (D134: session 4's candidate 13 was never pushed and was lost when it was archived).
READ: the top of reference/qa-reports/ENG-PLANT/REPORT.md on release-0.10.3-wip-plant-c-report (896f7e19b: session 3's EXACT NEXT STEP,
the tools in data/ and tools/*.txt); level.md building rule 28; dispatch-packet.md's D132 section (known flips, then a WIDE SAMPLE, then the
full table: D133); LAWS headlines; LESSONS D111-D134.
BASE: origin/release-0.10.3-wip-plant-c at c12 db9ef7073. Main's rows: data/c/main-*.jsonl (never re-run main).

## What session 4 (ENG-PLANT-f) found; its code was NOT pushed, so this is the record
1. **c12's full rows vs main:** 2-1 FAILS badly: 360 rows, 234 differ, PASS -> FAIL 60 (BAR 18: adult E 9, adult N 7, child E 1, expert N 1;
   kid E 28, kid N 14), fail -> pass 8; passes 329 -> 277; nearly all 'set down here 3 times' at 2-1's rivers (x 14,700-15,100: 24 rows;
   25,200-25,800: 23; 9,000: 6; 31,100-31,300: 11; 19,700). 2-2: PASS -> FAIL 12 (BAR 1: adult E 23, set down 3x at 20,927), fail -> pass
   14, passes 330 -> 332. 2-4: not finished. c4 is row-for-row 3b on 2-1, so c5..c12 moved 2-1.
2. **The 2-1 fault, traced on c12, adult E 5** (main L0 R0; c12 R1, set down 3x at 14,800): t 73.77 he lands on log #65 running his way;
   the landing stop (c5/c9: 'landed on a log running his way, stops pressing', stopMeant) holds only 0.1 s (4 frames); at 73.90 intend
   falls to its LAST line, the default walk `return side(dir)`, and walks him along the log at a full run for 11 frames; the river block's
   handed stand comes only at 74.23, 62 px from #65's front (14,684 on 14,556-14,746), and his thumb's let-go carries the press on: off the
   front at 14,766, splash-back to 14,349; three times, rescued. The run-out look (c6/c7: runOut = PHYS.maxRun x (releaseMax[1]+3) frames
   + 24) does not give the stand in time: its `past` needs wetBetween(lip, look). Same signature on 57 of the 60 flips.
3. **2-4 adult N 6/24 are a GENERAL fault, not luck:** vineFromLog judged only standing jumps ([p.vx, 0]); from a stand, a PERFECT thumb
   catches the liana 0 of ~560 frames; a RUNNING jump off the same logs catches it (N6 52 of 541 frames; e.g. t 56.33 x 10,699: 3 frames
   of run, take-off 10,747 on log 10,621-10,771, tail x1 10,766, liana 10,856; N24 t 56.47-56.60 x 10,815-10,823, take-off 10,832-10,842,
   x1 10,878, liana 10,968). Main crossed by an UNJUDGED full-run leap.
4. **Candidate 13 (LOST, rebuild it):** c12 + SKILLS.runUp: vineFromLog also judges a run-up: standing on a log under a liana ahead, if a
   run along the log (groundStep, his own thumb lag and spread on the run press and the jump press, take-off still on the log and before a
   tailed river's x1 - 10) then a jump catches it at all three lags, he runs; while running he keeps the run through the lag (no
   pending.still) and the press is judged at his running speed; if no run-up catches, the stand and hop-back stay. On c13 ALL 10 known flips
   passed (rescues 0), but it carried c12's 2-1 fault (item 2).

## The lead's rulings for this session
1. Rebuild c13's run-up judge exactly as item 4 (approved: a general fault fixed by judging the hop he can make; no perfect thumb; no
   stage rule; no easier liana). Toy each way.
2. The 2-1 fault (item 2), general: on a log running his way, after a landing, he holds the stand (rides) while no judged hop or handed
   bank is ahead, instead of intend's default walk; the stand never rides him into a rescue (c4's handed check: a floor within 80 px of the
   run's end, else step back). Toy each way (2-1 adult E 5: RED on c12, GREEN on the fix). If the bisect is cheaper than the trace says,
   check whether c5's one-gate check also refuses hops the judge cannot weigh (D133): refuse only the traced bad case (an unjudged hop onto
   a log that goes under before it hands him on).
3. Between candidates (D133): the 10 known flips; then the WIDE SAMPLE (every bot, both settings, seeds 1-10 on 2-1, 2-2 and 2-4); then the
   full rows (2-1, 2-2, 2-4, then 2-5, 2-7 with its own bar x40 29/40 and the list 69/100, 1-4). The bar: ZERO bar-relevant PASS -> FAIL vs
   main on every shipped stage, every moved row traced (law 22). pacerLay and hopJudged (2-7) on any shared-gate change.
4. On a clean table: the toys, the plants (same bars or retire per R-165.432), riverRide + firsttimer tests, the CI tool line at 0 fail,
   tierBots 9/9, timecheck + roadmapcheck; merge into release-0.10.3 (no force); hash + table to the lead.
REPORT: a new top section in reference/qa-reports/ENG-PLANT/REPORT.md on release-0.10.3-wip-plant-c-report. Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.
