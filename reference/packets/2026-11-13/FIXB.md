# FIX-B: 0.9.8's play fixes (Opus 5.5 high, engine). Written 12:00 PM ET by the lead. Branch t-fixb from origin/ccr-ea739a2f-dfcee4.
Why: Matt 12:00 PM: "the rocks that you can go through..." tonight's release carries the open play fixes. Built on: main 0.9.7; replaced this
sprint by: none. Each item: verify on the REAL build first (D37: one pasted run), fix at the root, a planted test, never a rule loosened.
1. R-165.122 hop rocks walked straight through on 1-1 (Matt 11-11): check main first (P11's 1-1 pass may have fixed it; the roadmap says
   "in progress"); if fixed, prove it with a run + the commit and mark it; if not, fix (a hop rock is a wall or a hop, never walk-through).
2. R-165.174 1-2's mushroom bounce chains: a steady beat on the teaching chains, exactly like the end chains (Matt: "if they were all like the
   last ones"); then they grow a little harder. A cadence check (planted). 1-2's seed list rebuilt with the normal filter only if it must.
3. R-165.150 a stump under 50 px that reads walkable but blocks: every W1 piece under a hop's height is walk-over or reads as a wall.
   W1 world data is B14's token today: put the data edit in a patch (reference/qa-reports/FIXB/w1.patch) and tell the lead.
4. R-165.151 delete the old control course (stageGenerator.ts CTEST_STAGE_ID='1-2', ctestMixDraws, stagePreload.ts); #ctest 1-1 unchanged.
5. R-165.157 the testers' #ctest link plays 1-3 instead of 1-1 (App.tsx ctestLevel), its first-play coaching checked.
WRITE: stageGenerator.ts (FA has one line at :2913, merge origin/t-fa first), stageSheets.ts, stagePreload.ts, App.tsx (ctest only), 1-2's
data + seed list. Full Checks on your head (seedlist --check every list). REPORT 30 lines. Stop line 7:30 PM ET.
