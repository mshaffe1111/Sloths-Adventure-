# ENG-S2 REPORT (t-eng-s2 from origin/t-eng-s1@a1739b43; packet reference/packets/2026-11-14/ENG-S2.md on the lead's branch)
Code head **1901d33f** (every gate below ran on it, in its own worktree); later commits are reference/ only (this folder, engine-core.md,
stage-piece.md). Box: 3:55 AM ET start. Context at the end: GATES_CONTEXT.

## Done: packet items 1 (the vine snake) and 2 (the false liana) + the lead's letGo ruling. Item 3 (chains) NOT started: EXACT NEXT STEP.
1. **host.letGo()** (lead ruling 3:55 AM): one method on PieceHost (stagePiece.types.ts:38-42), engine.ts letGoOfLiana, physics.ts LET_GO
   (hop -220 px/s, keeps 0.3 of his swing's vx, cooldown 0.5 s). He lets go of the liana he swings on with a startle hop, never a bite and
   never a heart; jumps 2 (as the deliberate drop); `swungOff` holds that liana until he is down, so he cannot fall back onto it. False,
   doing nothing, when he swings on none. Documented in reference/methods/stage-piece.md step 3. Tested (test 7).
2. **The vine snake** (1-6.md NEW 2), by data, on any liana of any stage (no stage literal: generality PASS):
   - Data: `Vine.snake` (types.ts, lead ruling "Vine.snake, go", the Platform.ride precedent): `{ route, clock, shift?, reach? }`.
   - src/game/vineSnake.ts (pure): routes 'down-off' (anchor to off the foot), 'down-back' (to `reach`, waits, back into the bough),
     'up' (foot to `reach`, waits, back off the foot). Every trip starts and ends with all of it off the vine (no blink-out).
     Its beat is a stage clock (beat.ts beatDef: off, **warn = the tell**, on = the trip): Easy stretches it, never shortens.
     `snakeBeatFaults` refuses a tell under **0.5 s** (PREDATORS §2; the lead asked for the floor as a test: test 2) or none.
   - src/game/pieces/vineSnakePiece.ts on the piece hook (PIECE_KINDS after RIDE; engine.ts not edited for it): rides the liana's
     grip line at the liana's live swing angle; the tell is the HISS pose reared at its start end (on the bough at the anchor, or at the
     foot), facing him; the trip is the HANG pose laid along the liana, head first. If any of its body reaches his HANDS (swingLength -
     VINE_HANG, the glint's own offset) while it travels, `host.letGo()`. No hurts().
   - Art: ART-678b's **green** cuts (a93e335, identical blobs: the art branch merges clean) per the lead's GREEN ruling; vineSnakeArt.ts
     (trackAtlas: re-loads on canvas loss, D6), preload key 'vine-snake' (stageManifest.ts, stagePreload.ts).
3. **The false liana** (1-6.md NEW 3): `Vine.snake.route 'still'` on a liana with swingAmp 0. Drawn by the piece as the **brown** snake
   (lead: "keep the brown recolour: it's exactly what the FALSE liana wants") the vine's length, head at its foot. The engine catches it
   like any liana; the next step it startles: letGo (the hop), `v.off = true`, it falls onto the highest platform under it, slithers off
   AWAY from where he is when it lands, at its hanging pose's own scale, fades, gone; respawn() hangs it again.
   Engine: a liana catch now honours `Vine.off` (engine.ts:2056; protoArt.ts:1341 already left an off liana undrawn while it stayed
   catchable: a latent bug fixed at its root), and false lianas are left out of the engine's own liana drawing (drawnVines/plainVines/
   swingVines).
4. **Tests** (src/game/vineSnake.test.ts, 10, all green; CI's src/game glob runs it):
   1 route geometry; 2 the tell touches nothing at any hand position, and the 0.5 s floor; 3/5 the REAL engine on **6-3 and 2-4's own
   lianas** (two worlds): a snake coming down makes him let go exactly when it reaches his hands (head within 10 px), never during its
   tell (>= 17 tell frames held), a hop (vy < 0), **no heart** (damagePlayer spied), never re-caught in the air; 4/6 a snake turning above
   his hands never touches him, a rising snake takes a low hold and leaves a high one; 7 letGo itself; 8 registered, none on a plain
   stage; 9/10 the false liana on both worlds: startle, off, not caught again (also jumping at it from below), lands on the floor, slithers
   away from him, gone, whole on respawn.
   **Planted** (planted.out.txt): 10 mutations, **9 RED**, 1 an equivalent mutant (M3: the tell's body is off the vine by construction,
   so the `live` guard changes nothing; named, not hidden). M1-M7 ran on ef92a2b2, M8-M10 on the false liana before its polish commit
   (the mutated lines are unchanged in 1901d33f).
5. **Lock**: lockall --layouts 16 on the base (a1739b43, 3264 builds of 102 stages) and --check on 1901d33f: LOCK_RESULT.

## Gates (gates.sh: the full CLAUDE.md Checks + CI's lists, 5 parallel lanes on 1901d33f in its own worktree, CI=1 FORCE_COLOR=1; gates.log)
GATES_TABLE

## Polish check (real page, the engine's own loop, clock, catch and let-go; 6-3: no World 1 stage lays a liana until 1-6; Normal read from the game)
- **The recolour, first** (beside-liana-green-vs-brown.png, the game's own liana frame props-atlas#liana at 420 px): the liana is TAN-OLIVE;
  the brown snake hid on it, the green popped. Pushed back with the sheet; the lead ruled GREEN for the vine snake, brown for the false liana.
- **Snake, upright 412x915** (shots/upright-412x915-1..4, upright-412x915-clip.mp4, 19 fps): the hiss on the bough (tell in view 5/5
  frames), the snake coming down his liana a body above his hands, the moment it reaches them he hops off (vy -93), the snake slides on
  and off the foot, he lands on the moss, 6 hearts kept. Reads as one clean action.
- **Snake, sideways 915x412: FAILS the bar, named** (shots/sideways-915x412-*, sideways clip): the tell is in view **0/6** frames (0/22 in
  the clip pass): the anchor sits above the clear view (the camera keeps his head just under HUD_BAND), so the snake first shows ~1 body
  above his hands, ~0.9 s before it takes his hold, with no tell seen. Lead ruling (B), 4:13 AM: no stopgap (D40); the camera packet
  fixes it (EXACT NEXT STEP 1).
- **False liana** (shots/false-*-1..4, 150 px): upright the disguise beside a real liana (still, brown, head at its foot), the startle
  hop, the snake on the moss slithering off away from him, gone. **Fixed from my own first stills:** it slithered 2x too big (stretched to
  the vine's length) and toward him (direction fixed at the grab): now its pose's own scale, away from where he is when it lands.
  Named: (a) in my shot it hangs from open air (no bough): the 1-6 builder hangs it under a bough; (b) sideways it is above the view until
  he is under it (the same camera job); (c) its **tongue every 2.5 s** (1-6.md's tell) is NOT drawn: no cut has a tongue, and a
  code-drawn tongue is the primitive D61 forbids: an art need (a hang-brown frame with the tongue out), Hugging Face, the lead's call.
- Named, not mine: 6-3's own art seams show in the shots (ENG-S1 named them).

## Pushback
- The BROWN ruling (beside-liana sheet): the liana the snake rides is tan-olive, not green. Accepted by the lead (GREEN), owned there.
- The packet asked for "clips upright + sideways": shot; sideways shows a defect the packet's design (1-6.md "in view 1 s+") anticipated
  but no packet owned: the camera. Now the next packet's first item (lead ruling).
- `Vine.off` was ignored on a liana catch (an off liana was invisible yet catchable). Fixed at its root, not worked around in the piece.

## Suggestions (ready packets)
1. **CAM-THREAT** (engine, xhigh; lead-approved interface): PieceHost gains `focus(box)` (one method like letGo, documented, tested): while
   a snake on HIS liana is in its tell or above his hands, the camera keeps the box (anchor - 60 .. his feet) under HUD_BAND where it fits
   (sideways hands-high it does: ~370 of ~460 px). Where it cannot (a low hold sideways), a gen2 verdict refuses a lay that gives the snake
   < 1 s in view. Done-items: RealPlay camera test (swingCam.test.ts pattern) both ways on 3 phones; shoot.mjs sideways tell in view
   >= 90% of tell frames; the false liana in view before he can reach it.
2. **SNAKE-LAY** (engine): gen2 `snakeLay.ts` (the RIDE pattern) + a node letter in gen2/nodeLetters.ts + `nodekey.ts`: lays Vine.snake
   rows and their beats from a world table; snakeBeatFaults in the builder's faults; Easy: none rise (1-6.md); the level check leaves a
   false liana out of reach (levelCheck.ts:540 filters `kit`/`off`; add isFalseLiana).
3. **ART** (Content): a brown hang frame with the tongue out (the false liana's tell) and catalog rows for the two brown cuts.

## Unresolved (named plainly)
- Packet item 3 (liana-to-liana chains, LIANA length per row, LONG with a dial, inside SWING_SEEN): NOT started (box).
- The sideways tell (above): open, lead-ruled to the camera packet.
- The engine's false-liana draw filter (drawnVines etc.) is exercised by no test or shot: my shots add the vine after the stage starts,
  when those lists are already made. The 1-6 builder's first still must show no liana drawn under a false liana.
- The false liana's tongue (no art); no hiss SOUND (PieceHost has no sound; a one-line host.sound would be another interface).
- Catalog: the green hang/hiss rows come with t-art-678b (CATALOG-MASTER rows 9425/9428, "cut, not placed"): **integrate t-art-678b
  before t-eng-s2** and flip those two rows to in game / used in vineSnakePiece. The two brown cuts have no rows anywhere (Content).
  Unused here: the green slide and liana cuts (on the art branch only).
- tools/art/snakebrown.py lives in tools/art (Content's area): mine to make the ruled recolour; Content may move or own it.

## Method used / Lessons applied / Method update / Learned
- **Method used**: stage-piece.md (data first, the kind, the piece, planted test first on 2 worlds, look at it, gates), gates.md, D63 clips.
- **Lessons applied**: D40 (no stopgap on the camera; asked first), D59 (gates waited for), D61 (no code-drawn tongue: named as art),
  D62 (difficulty printed from the game's localStorage, the easy flag from the engine), D63 (clips of the whole action), D64 (context vs
  1M), D57 (queue read at each push), D36 (gates and lock in their own worktrees), D19 (tests call the engine's own catch and letGo),
  D41 (sizes against 89.1), D6 (trackAtlas re-load), D43 (no stage literal), law 3 (the liana's colour checked on its own frame before
  acting on the ruling).
- **Method update** (proposed, stage-piece.md): (a) step 5: shoot SIDEWAYS FIRST for anything that starts above or below him: the view is
  ~460 px tall there and the tell can be out of it; print "tell in view" per frame from the game. (b) A piece's art question (a colour, a
  pose) is judged on the GAME's own frame of the thing it sits on (the liana frame), not a guess of it. (c) Mutation runs edit the tree:
  never run a dev-server shot at the same time.
- **Learned**: 1. The real page found the defect the unit tests could not (the tell out of view): a fairness rule needs a real-page check.
  2. The colour ruling rested on "green vines": one composite on the real liana frame settled it in a minute. 3. A latent engine bug
  (off lianas catchable) surfaced only because a new piece needed the documented meaning.
- **Proposed rule** (level.md): "A threat's tell is in view, both ways round, for its whole length (shoot.mjs prints it); a lay that cannot
  frame it is refused."

## Turnover
reference/handoffs/engine-core.md §0v written (this branch). stage-piece.md step 3 documents letGo and Vine.off (lead ruling).

## EXACT NEXT STEP
1. CAM-THREAT (Suggestions 1), first: the sideways tell.
2. SNAKE-LAY (Suggestions 2), so the 1-6 builder can lay snakes and false lianas from a table.
3. Packet item 3: chains liana to liana (chainPhase, physics.ts), LIANA length per row, LONG with grip 'low' + share 0.5-0.7 re-laid
   under SWING_SEEN (ENG-S1 EXACT NEXT STEP 4: A1 pushbacks b/c/d), levelCheck's liana->liana link for 1-6 beat 4.
4. Integrate t-art-678b before this branch (catalog rows), and the art packet for the tongue frame + brown rows.
