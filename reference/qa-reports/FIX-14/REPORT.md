# FIX-14 REPORT. t-fix-14 from origin/main@73e7bed0 (mock code on t-fix-14-mock, never to merge). Stopped at the box, 1:3x AM ET 11-14
## EXACT NEXT STEP (lead's ruling 1:26 AM)
1. The fork's "281 px down" in the LEVEL: on t-len-14's ROTTEN_FORK give the top bough room past its link vine (today the turn's vine
   stands 18 px from the bough's end; a person walks off too). Proposed level.md Building rule with its check: "a climbable vine at a
   ledge's end has at least 80 px of ledge past it" (his grab reach 54 + half his body 22 = 76, rounded up; the bots read an edge 80 px
   ahead); check: a lay test over every roll's vine feet (lead approves the rule).
2. The creak dip ("in a dip 50 px deep, the way on is 150 px up", middle N s4): re-chase on the committed route fix.
3. Steps 3-4 on Matt's pick, with the mock stand-ins swapped for his sheets (reference/art/PROMPTS-2026-11-14.md sheets 1-2) as they land.
4. ONE relist at the end, castBots 40 before/after, adult Easy >= 100 s.
## Done (evidence in reference/qa-reports/FIX-14/)
- Step 1: PLAN.md table: "rocks" are 1-4's pods (620 px/s, 1.0 s tell, tell drawn only on the pod); two hands 1.6x up but hit on either
  line, stop-to-step, petals 40 px out of a 38 px reach; 1-5 is plain 220 px/s climbs; air steer identical.
- Matt's "over the top" REPRODUCED (mock/before-over-the-top-0.9.8.mp4): a plain vine under a shut gate puts his feet on the bough's
  top (box 76 px over its underside); the climb stop and GATE.lid are on his feet; he is drawn 89 px on a 48 px box.
- Step 2 SHOW FIRST (lead PASS as mocks, sent to Matt): mockA (one vine 1.30 s 0/2 petals vs two 0.90 s 2/2; vine-glow tell 1.5 s,
  300 px/s drop), mockB (tied thatch strains and snaps; head held under the bough on hold and jump; thatch thrown off).
  HF pieces named in PLAN (tie x3 states, thatch, the vine's own tell, a lighter pod).
- Step 5 (A): towerRoute.ts: a sunk vine is reached by its foot (the route floated 200 px over the fork floor). Planted toy test red/green.
  World 1 on main 1-1..1-5 x 40 seeds, all bots: identical. tierBots 1-1 PASS 7/7. Fork 169 -> 209 of 360 (base 242).
## Gates on 3a86f616: tsc, CI tool tests 74/74, tierBots 7/7, roadmapcheck, knowncheck, generality, seedlist 1-1 --check: PASS.
   (No game code changed on t-fix-14: the full suite, build and perf gates were not run; they run on the integration head.)
## Rough spots, named: mock art is code-drawn (glow reads as a laser, tie as a paperclip: lead's notes); pod small and dark; expert
   18->15 and adult N 36->34 on the fork are runs diverging past it, one run each, not proven noise. Turnover notes: none touched.
## Lessons applied: D58, D59, D61, D62, D63, D40.
## Learned (for the next builder)
- Name the thing as the code names it before measuring ("rocks" are pods).
- Never edit a file in a tree a background bot run reads: I edited firsttimer.ts mid-run; caught it, killed it, re-ran clean.
- Playwright video here paints into a corner: step the engine and screenshot every 2nd frame, settle frames after a cut; ffmpeg reads
  a numbered sequence only without gaps (my first before-clip was ONE frame): use -pattern_type glob.
- A per-seed bot difference after a route change is often the run diverging far downstream: judge 40-seed totals, find the stuck y.
- Read context % from the session record, not an estimate (I said 45% at 24%).
- A shallow clone fails roadmapcheck: `git fetch --unshallow origin` first.
## Proposed rule changes (lead decides): level.md "a climbable vine at a ledge's end has >= 80 px of ledge past it" (above); method
   level.md step 5: clips are stepped frames, not recordVideo.
