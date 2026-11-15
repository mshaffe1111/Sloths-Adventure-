# B2 plan (ENG-B2, written 1:01 AM ET 11-14, branch t-b2-chase from origin/t-b1-chase@a951fdfb; packet reference/packets/2026-11-14/ENG-B2.md)
1. CLIPS (B1 steps 1-3, D63: judged on clips): reference/qa-reports/B2/shoot.mjs on the dev server, a RealPlay.bare-equivalent world
   in the real page (the same steps as realPlay.ts:328-340: zones, waterY, rivers, checkpoints cleared, proto null, walls and pieces
   started again; NO stage river or prop under the branch), each stage's own backdrop. Camera framed by the front
   (camera.x = front - 0.25*vw, him <= 0.55*vw ahead), caption printed from what the game BUILT (D62: e.easy, viewport, stage).
   Per setting x orientation: stills (crack opening under/behind him, a section mid-collapse with debris, the fork both ways) and a
   6 s webm (front closes to ~60 px, he runs off and pulls away). Normal + Easy, upright 412x915 + sideways 915x412, on 1-2 and 2-1.
   Contact sheet, judged by me first (law 1), then sent to the lead: pass/fail.
2. TINT (B1 step 4): chasePiece.ts drawEdge: dark core + warm rim, alpha up to ~0.75 by gap; contrast measured (tool, numbers in
   the report) on 1-2, 2-1 and a dark World 3 backdrop; a planted test for the alpha-by-gap rule.
3. After the lead's pass: B5 CHASE-LAY per ENGINE-678 (gen2/chaseLay.ts; K out of LATER in nodeCode.ts; pipeline.ts hook; fills
   GeneratedStage.chase, refuses by chaseLayProblems; an in-play draw check). Planted red first; proven on 2+ worlds.
Not mine: engine.ts:1247 camera cap / FAR swing camera (R-165.225), 1-1/1-4, art.
WRITE: reference/qa-reports/B2/, src/game/pieces/chasePiece.ts (+ its tests), then for B5: src/game/gen2/chaseLay.ts (+test),
src/game/gen2/nodeCode.ts, src/game/gen2/pipeline.ts (asked of the lead before touching a shared file).
Gates: full CLAUDE.md Checks + lockall 102/102 vs the base before the report; never stop with a gate running (D59).
