# B1 CHASE-CORE plan (ENG-B1, written 11:21 PM ET, on t-hooks@994ea4e7; packet reference/packets/2026-11-13/ENG-B1.md)
1. chase.ts: ChaseLay = stretches [{start, end, last?}] (data, any world). The front sets off `behind` back when he passes a stretch's
   start, stops at its end (the living fork: whole, never catches him there), the next stretch cracks anew when he passes its start.
   Easy row: the front at most 200 px/s and never over PHYS.maxRun (no final burst); Normal keeps today's numbers (old 1-8 unchanged).
2. pieces/chasePiece.ts: CHASE_PIECE reads stage.chase; steps the front, breaks `chase` sections behind it (debris), draws sections
   whole/cracked/fallen + the screen edge; respawn = branch whole from the flag, front held behind it; caught/off = a heart + the flag.
3. chase.test.ts (pure: stretches, forks stop it, Easy cap, restart) + chasePiece tests through RealPlay on 2 worlds' stages (bare()).
4. Stills upright + sideways with the built setting printed; full CLAUDE.md Checks; lockall 102/102 vs f9671e3b.
WRITE: src/game/chase.ts, src/game/chase.test.ts, src/game/pieces/chasePiece.ts, reference/qa-reports/B1/.
ASKED (outside WRITE, waiting on the lead): pieces/index.ts (register), stageGenerator.ts GeneratedStage.chase field, and the hook's
"heart + back to the flag" hurt (stagePiece.types.ts PieceHurt.toFlag + engine.ts:2906 one line) so Matt's chase rule holds.
