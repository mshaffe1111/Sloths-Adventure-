# FA: the ascent lay, finished (R-165.170). Fable 5.2 high (engine-fable: core engine, models.json fable tier). Attempt 2 (fresh).
Frozen input: t-eng-ascent@7499d79f (the last Fable's WIP: gen2 lays a tower up or down, tower.ts + toyTower fixture; UP clean on 10
seeds both settings, DOWN seed 1 Normal clean; untested). Its packet: reference/packets/2026-11-13/ENG-ASCENT.md (pieces 1, 1b, 2, 3; read it).
Branch: t-fa from origin/ccr-ea739a2f-dfcee4, then merge origin/t-eng-ascent. Why: 1-4 "Up the Kapok" travels UP and is due on Matt's
link tonight; it cannot be laid until this lands (1-4.md:59 order: 1, 2, 5 first). Built on: main 0.9.7; replaced this sprint by: none.
## Done (in this order; push each piece whole)
1. Piece 1 (ascent lay) whole: tests + planted failures, the lock check, levelCheck flag order, stageTime, types, seedList join; bots fly a
   fixture tower; every existing stage's lock and seed list unchanged. LEFT list from the WIP: STATE.md:822.
2. Piece 2 (flags, hearts, clock measured along the climb; Matt's flag rule on the path, D49).
3. Piece 3 (the climb camera: feet lower climbing up, higher going down; both orientations; perf §1 holds).
4. Piece 1b (descent) ONLY if 1-3 are done and gated: 1-5 does not need it (1-5.md:58).
Send the lead a line when piece 1 lands: B14 (1-4's builder) starts its lay on it. Not yours: the card road (cut tonight), pods, art.
