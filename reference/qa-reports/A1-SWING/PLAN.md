# A1 SWING-W1 PLAN (ENG-A1, 11:18 PM ET; branch t-a1-swing from origin/t-hooks@994ea4e7)
1. MEASURE FIRST: the FAR landing camera (1-6.md:33-34: ~740 px out from the foot at the back of a swing vs ~425 upright). Planted test in
   cameraFollow.test.ts (landingAhead + showBoth, VIEWS upright + sideways, the 1-6 FAR geometry). Green as-is: a pin. Red: fix in A1 (camera is cameraFollow.ts: ask the lead for it).
2. Grips by data: lianaRelease passes the liana's grips to physics.ts pressWindow (today it never does, so only a LOW hold [0.7, 0.95] is
   checked). Dial grip: 'low' (foot only: FAR), 'high' (top: a "hold high" gap), absent = today's [0.7, 0.95] (every lock unchanged).
   Planted test: a high-grip window on a SHORT gap is not the default's; a FAR gap's window is 0 at the top grip.
3. W1 liana rows in gen2/worlds/w1Swing.ts: World 1's swing sections (liana, land, chain) + a kit add (as kitLib14 adds 'climb',
   w1Arc14.ts:286) that puts 'swing' in a stage's moves by data; w1.ts untouched, so 1-1..1-5 locks unchanged. Proven on W1 + W6's kit.
WRITE: src/game/gen2/worlds/w1Swing.ts (+ w1Swing.test.ts, new), src/game/gen2/pipeline.ts (lianaRelease only, token), src/game/cameraFollow.test.ts,
reference/qa-reports/A1-SWING/. ASK: the grip dial must ride the swing row to lianaRelease: gen2/types.ts (LianaSwing.grip?, swing
PlaceRule grip?) and pipeline.ts's swing lay (1 line, :1270) are outside my WRITE.
GATES: lockall 102/102 vs f9671e3b; full CLAUDE.md Checks on the head; stills both ways with the setting printed.
