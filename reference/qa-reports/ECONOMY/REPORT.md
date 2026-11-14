# ECONOMY REPORT (R-165.194), Designer, branch t-economy. Design only: nothing in src/ touched (git diff --stat: reference/ only).
## Done-items
1. Research: ECONOMY.md §1, 8 lines (Super Mario Run, 3D Land, Odyssey, DKC/Returns, Rayman Legends, Celeste, phones/children, our take).
2. Measured: 5 bots (child/middle Easy+Normal, expert Normal) x 1-1, 1-2, 1-3, 3-4, 6-3 x 12 seeds = 300 runs, flown 3 times (baseline,
   fruit, score) + 3 and 4 hearts on Normal (180 runs). Real engine, real loseLife and Continue (firsttimer.ts:981-998, :2140-2144).
   summary.txt, summary-h3/h4.txt, summary-stars.txt, summary-target.txt; rerun line at the top of ECONOMY.md.
   Headline: World 1 has 0 lives lost in 180 runs and at most 2 hearts lost; Game Over costs nothing (Continue, unlimited, engine.ts:5299).
3. Design: ECONOMY.md §3 table (score kept, 4 stars, basket fruit, finds, hearts 3 Normal/5 Easy, lives, Game Over to the rest flag, star use),
   no-word display per row, §4 what it moves (shipped stages, meter, medals, old saves). Built on Matt's 11:55 AM direction.
4. Ranked packets with WRITE files and deletions: ECONOMY.md §5 (7 packets; deleted: the speed and heart-share star rules, timeLimit's star use,
   extra lives as a reward).
5. Fast gates on the head: tsc PASS, roadmapcheck PASS (after unshallow), knowncheck PASS, generalitycheck PASS (27 known, 27 literals).
## Polish check: design only, no screen changed, no stills; BASKET-ART and STARS-4 carry upright + sideways stills for Matt first (show first).
## Pushback
- The packet's fact "score shown nowhere" was wrong (VineHud.tsx:551-566, StageCleared.tsx:241, GameOverCard.tsx:52); the lead agreed.
- Basket = 5 placed fruits, not a share of everyday fruit: route-only bots get 58-97% of it (raw/f-*.jsonl).
- Hidden find as a 5th star: refused with evidence (finds on under half the stages, finds.ts:45; ~60 new finds with words to fill).
- Finds as hidden-stage keys: refused (one gate, one count). Hidden stages do not exist yet except Thornbark's (secret.ts): the door ships with 1-H.
- Hearts are not why losing is hard in World 1 (0 lives at 5 or 3 hearts): it is the layouts plus a free Continue. 1-4/1-5 must carry the bite.
- 3-4/6-3 numbers lean on weak bots (rescues 7-18 a run on 3-4; water 5-11 lives a run on 6-3): direction only.
## Left / unresolved
Score par is proven only with the expert bot as a stand-in; Easy's 0.7 is a starting value. Basket placement rules need a spec (packet 3).
## Method used / Lessons applied / Method update
Designer card (fly the real engine, never a formula); D3/D7/D24 (facts from code, whole tree), D25 (sizes named as estimates), D37 (real
loseLife: the bot calls the real one), D39 (a change flown over seeds and both settings), D40 (order: hearts, par, basket, stars), D49 (no
flag/heart rule changed), D52 (cites re-checked last), D53 (fast gates before push). Method update: a design that changes a player number
flies it in the engine by patching RealPlay at run time from the design folder (measure.ts --hearts), so no src/ edit is needed to test it.
## Learned: measure a reward before naming it: every intuitive rule here (fruit share, flat score, hearts) failed or moved nothing once flown.
Turnover note: reference/handoffs/designer.md rewritten (economy rows), same commit as this report.
