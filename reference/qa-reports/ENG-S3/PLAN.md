# ENG-S3 PLAN (t-eng-s3 from origin/t-eng-s2@9809f11c; packet reference/packets/2026-11-14/ENG-S3.md on the lead's branch)
Start 5:12 AM ET 11-14. Box: 90 min (to 6:42 AM ET) or 40% context (400k of 1M), whichever first. Opus 5.5 xhigh.
Base lock: lockall --layouts 16 recorded on 9809f11c (its own worktree) before any change.

## Order (dependency first, D40), each with its planted test before the fix
1. **CAM-THREAT** (the sideways tell, 0/6 today):
   - PieceHost.focus(box, threatAbove): one method like letGo (stagePiece.types.ts), a request good for ONE step; the engine clears it.
   - cameraFollow.ts focusY (pure): keeps the box between the HUD band and his feet (+pad) where it fits; where it can't, keeps HIM and
     shows as much of the threat's end as fits (feet at the bottom when the threat is above; head under the HUD when it is below).
   - engine.ts updateCamera applies it after the HUD hold, before the ease (no snap: the ease moves it).
   - vineSnakePiece asks while he swings on ITS liana and its snake is coming (off and due), in its tell, or travelling on his side of his
     hands; the box = his body + the tell pose at its start end (anchor - hiss height, or the foot) + its body on the vine.
     The request starts BEFORE the tell (lead time = the ease's settle), so the tell is in view from its first frame.
   - gen2 verdict (pure, from the lay alone): a snake coming at his grip is in view >= 1 s before it reaches it (1-6.md:43), at the
     LOWEST hold (the liana's foot) on the smallest sideways view the game frames; refuses the lay otherwise. Planted on hand-built lays.
   - Tests: RealPlay camera test both ways on 3 phone sizes (swingCam.test.ts pattern): tell in view >= 90% of tell frames, no step over
     the ease's own; planted red without the focus. Clips sideways + upright (D63), tell in view printed per frame from the game.
2. **False liana's landing** (lead, false-upright-3-slither): it drops and slithers off from a spot CLEAR of his box (never through it),
   sized as drawn on the liana. Test: its slither box never overlaps his box on 2 worlds; stills/clip both ways.
3. **SNAKE-LAY**: gen2 lay (the RIDE pattern) + a NODE letter (nodeLetters.ts, nodekey.ts) for vine snakes and false lianas; snakeBeatFaults
   in the builder's faults; Easy: none rise; levelCheck leaves a false liana out of the route (isFalseLiana). Catalog rows for the 2
   brown cuts.
4. **Chains / LIANA length per row / LONG dial inside SWING_SEEN 414**: only if 1-3 are green with time left; otherwise EXACT NEXT STEP.

## Gates
Full CLAUDE.md Checks + CI lists in a separate worktree on the code head (never editing the tree while they run), lockall --check vs the
base (only stages the packet names may move: none lays a snake yet, so expected 102/102 unchanged unless item 3 lays one).
Nothing left running at the stop (D59). Queue read at every push (D57). Context % in every message (D64).

## Lessons applied going in
D40 (no stopgap: the camera, not a patch), D57, D59, D61 (no code-drawn primitive: the tongue waits for art), D62 (stills labelled
by what the game built), D63 (clips of the whole action), D64, D65 (green travelling snake, brown false liana only).
