# FIX-14b REPORT. t-fix-14b (from t-fix-14@f35253ba + t-len-14@d56cd915). Stopped at the box, ~3:4x AM ET 11-14
## EXACT NEXT STEP (in order; the next member starts here)
1. Two vines (R-165.229, NOT STARTED): engine.ts ~2102: let a side push take the other hand WHILE up is held (today `!up && !down`
   only: the stop-start Matt calls wonky), latched once per push (sideLatch) so a drifting thumb steps once, never hops off a field
   vine; keep CT-4's trunk rule (touchGestures trunkSide) for plain vines. Measure 1.6x up two-handed, 2x slide down one-handed
   (FIELD_FEEL, exists). Petals: in finish14, a petal on a field stretch with a neighbour within FIELD_FEEL.reach goes to the pair's mid
   x (pickup reach 38 px from (x, y-20), engine.ts ~3215: a two-hand hang is 40 px off a vine's line), plus the reward pair (two petals
   side by side between two vines); planted test: every such petal inside the reach of a two-hand hang.
2. The pod tell as the vine itself (R-165.227, art part NOT STARTED): vineFieldArt.ts drawPod 'warn': redraw the pod's own field vine
   (vineTile, its painted strip) brightened ('lighter' pass, warm) and shaken along its length for the whole tell, w1m-dust-puff + chips
   sifting; swap the pod to w1m-pod-hang / w1m-pod-fall (already in src/assets/w1-matt with catalog rows). No flat bar, no code glow.
3. Fork (R-165.206, NOT STARTED): w1Arc14.ts ROTTEN_FORK (merged in here from t-len-14): >= 80 px of ledge past the link vine;
   proposed level.md rule + a lay test over every roll; the creak dip; castBots 40 before/after; adult Easy >= 100 s.
4. Then ONE relist (`npx tsx tools/engine/addlevel.ts 1-4 --relist`), the clips sideways (clip.mjs `side` threw: the engine was null
   sideways; give the landscape load longer or wait on __engine), and the full CLAUDE.md Checks on the head.
## Done (evidence in reference/qa-reports/FIX-14b/)
- Step 1, fig gate (R-165.212 + R-165.223's probe): his DRAWN head stops at the shut bough's DRAWN underside on the one-hand, two-hand
  and plain climb and the jump (FieldPlay.shutBoughAt/capY/lid; GATE.head 89 = heroSprite 66 x 1.35, tested; GATE.depth = the painted
  bough's measured underside). Found while testing: the old "from below" test was against the line, which falls toward the sagging end,
  so a leap along the bough slipped over it (now against the drawn top). A fig tears at full push with his head held under the wood
  ("just enough to get the fruit up"). Tests (fieldGate.test.ts, 4 settings x seeds): Matt's case (push full, hold up, jump, climb the
  rest: head never over the underside, never stood up there, fig still tears); the skip probe (every vine, up/jump/leaps/climb-then-leap,
  figs held on so every case is a SHUT gate, and the probe must meet the wood on half its cases); planted: the 0.9.8 feet rule puts his
  head 40+ px through (red).
- Step 1, the lock moment in Matt's own art (sheet 1 + 2 cuts brought from t-art-matt@11490e83 with their 14 catalog rows, inventory
  re-emitted): the leaf thatch along the shut bough, a vine tie at each fig: taut -> straining (pale, frayed, shivering by push %) ->
  SNAP (painted snap + bark chips), thatch shudders; on the last the thatch is thrown off. Replaces the thorn tangle (new replaces old).
  Clips: gate-normal-up.mp4, gate-easy-up.mp4 (+ sheet). Clip measure: his head most over the shut underside 0 px (never over).
- Step 3 numbers (R-165.227): PODS_14 in w1Arc14.ts is the ONE place: on / speed 300 (was 620) / tell 1.5 (was 1.0) / beats 4.6, 4.2,
  3.6 (was 3.6, 3.0, 2.3) / Easy 1.5x. `on: false` lays no pods (Matt's other choice, one line; planted on the real finish). POD.tellMin
  1.5. The relist (addlevel 1-4 --relist on this head): 24/24 clean both settings, 100/100 proven.
## Polish check (judged on the real page, stepped-frame clips; seed 1, built setting printed by clip.mjs)
- gate-normal-up-sheet.jpg: the ties read in three states at phone size (green loop; pale frayed loop; two whipping ends), the thatch
  reads as leaves over the bough; his head stays under the wood on hold and jump. Rough spots, named plainly: (1) the loops are small
  (49 x 108 px as ART-MATT sized them) and the strain shiver is subtle at 1x: the lead should judge the clip at phone size; (2) the old
  white-gold "pop" still flashes at the tear beside the new snap (two signals at once: drop the pop if the lead agrees); (3) the camera
  sits Pokey low on screen while he pushes (not this job's, but it hides the push); (4) NO sideways clip yet (clip.mjs failed sideways).
- Pods: numbers only. The tell is still drawn on the pod (fluff), NOT yet the vine itself: do not show Matt pods as final.
## Lessons applied: D40 (built on t-len-14 for the fork; nothing patched that a planned job replaces), D59 (no gate left running),
   D61 (no code-drawn primitive in the lock: all painted), D62 (clips print the built setting), D63 (judged on clips + a cheat probe),
   D64 (context from the token count).
## Learned (for the next builder)
- A "lid" line that slopes (a sagging bough) cannot be tested "from below the line": test against the wood's drawn top. Planted tests
  of a leap ALONG the slope found it.
- A gate probe must hold the figs on (or every case after the first fig opens the gate and probes nothing) and must prove it met the
  wood (`met >= half`), or it passes by never reaching the bough.
- "Stop at the drawn underside" and "the fig passes the drawn top" conflict on a thick painted bough (56 px at 440 wide): the fig tears
  at full push instead (Matt's "just enough to get the fruit up").
- Look a bough lookup up by x AND y: a gate 3000 px below shared the x and capped a climb at the top of the stage.
## Proposed rule changes (lead decides): level.md "every gate-type piece has a skip probe that holds its keys and proves it met the
   wood" (check: fieldGate.test.ts's probe shape); FIX-14's "a climbable vine at a ledge's end has >= 80 px of ledge past it" stands.
