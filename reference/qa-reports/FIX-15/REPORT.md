# FIX-15 REPORT: 1-4 fig gate, no way over or through a shut bough (R-165.212). Branch t-fix-15 from origin/t-int-8-clip (315548d1).
Engine member, Opus 5.5. Started 11:49 AM ET 11-14. Status: **RED on "over"** (the engine cannot close it; the lay must), GREEN on "through" and "into".

## EXACT NEXT STEP (in order; the next member starts here)
1. **Do not put this branch on Matt's link alone.** With a shut bough now footing from above, the side jump that used to fall through
   it now ends STANDING on it, and 49 of 96 gates (1-4 layouts 0-7, both settings) have a checkpoint flag standing on the gate's own
   bough (`STOP ... LANDED ON` in the clips; the drop clip's last frame shows "CHECKPOINT!"). The lay fix (step 2) must land with it.
2. **Planner packet: keep wood out of a shut gate's jump reach from beside it** (tower.ts). Root: towerCatches' `byGate` band and
   towerGates only guard wood LEVEL with a sealed piece (GATE_LEVEL 30 px); a ledge 39-99 px under it, beside or partly under its end, is
   laid freely (layout 0 gate 6: ledge 876-1056 y 2022, 99 px under a bough whose drawn far end sags to 1979). Measured
   (exposure-16-layouts.txt, 16 layouts x 2 settings, 192 gates): 48 gates have wood under them with less room than his drawn height
   (head room), 93 have wood from which a generous jump (tower.ts leaps) reaches the shut top. The verdict half is written and NOT
   applied (lay-rules-NOT-APPLIED.patch: `sealedRoom` in `cramped` + two towerGates checks). Applied alone, the head-room half builds
   every layout tried (0-7 Normal, 0.5-8.5 s each) but moves 1-4's rolls (layout 0's seed 1 is refused); the gate-top half refuses every
   seed of layout 0 ("no seed of 24 builds"), so the LAY must first stop laying such wood (towerCatches: extend byGate down a double
   jump under the gate's sagged top, beside its span), then the verdict, then **rebuild 1-4's proven list** (`npx tsx
   tools/engine/seedlist.ts 1-4`, 100 seeds, version 6b772e6e today) and every test that pins a roll or seed (release.md item 6).
3. Re-shoot `node tools/inspect/clip.mjs <port> <out> gateover <normal|easy> <side|up> 0` on the new lay: `ON ITS TOP while shut` and
   `THROUGH while shut` must both print `never`.

## 1. Done-items
- **Item 1, engine (every stage that lays a gate; no stage id, no x):** a shut gate's bough is wood from every approach.
  `src/game/fieldPlay.ts` `lid(p, dt, x0)`: BESIDE: a move across that would put his body into the bough's drawn wood (span and
  GATE.lidSide past its ends; feet under the drawn top, drawn head over the drawn underside) is stopped at its end, a wall. FROM BELOW:
  the head stop as before, but "started under" now needs feet more than `GATE.stand` (4 px) under the drawn top. FROM ABOVE: new
  `footings(x)` hands the engine's floors the gate's own bough at its drawn sagged top (`src/game/engine.ts`, the platform collisions:
  `onFloor` over `this.platforms` plus `field.footings`). New `overShut(v, x, y)`: a field vine under a shut bough is not taken by a body
  on or over it (`engine.ts`, the tree-vine search). Kept objects, no allocation a frame.
  Two holes found on the way, both closed and both in the planted cases: (a) standing on the shut bough, the jump's up-intent grabbed the
  field vine under it and put him THROUGH the wood onto the vine; (b) jumping off it while walking up its sagged slope read his start as
  1.2 px "under" the top, and the lid pulled him DOWN through it (145 px).
- **Item 3, planted tests** (`src/game/fieldGate.test.ts`, "a shut fig gate is wood from every approach", 6 tests: layouts 0, 1, 2 x
  Normal, Easy; layout 0 is INT-8's build). INT-8's TRY lines laid against each gate's own drawn wood, at BOTH ends of every gate:
  a ledge 45 px under the drawn end at 52, 96 and 140 px out, a flick and a held jump, each with and without a second flick, the gate's
  way held; dropped onto its middle from 120 px over it; the end vine's top: leap out past the end with a second flick at frame 9, 14 or
  18, then steer back; walked in from a ledge whose top is 40 px under the drawn underside. Each frame his middle is over the drawn
  bough: over / under / IN; bad = IN, or over then under on two frames in a row. Fixed: 0 bad on every case (>= 180 cases a test).
  Planted (today's lid restored in the test: from below only, no footing): red on every kind (flick, flick + second, held jump, held
  jump + second, dropped onto, walked in). `tsx --test src/game/fieldGate.test.ts`: 18/18 pass, 22 s.
  **Not red today: the vine-top leap.** Today's lid already held it (INT-8's own TRY lines: head -1 and -4, never over; here at three
  second-flick frames too). It stays as a case that must stay green now that the bough is footing from above.
- **Item 4, clips** (`tools/inspect/clip.mjs gateover`, INT-8's touch-pad tool, every press lift-checked, layout 0, real dev page):
  clips/gateover-{normal,easy}-{side,up}.mp4 + .txt, sheets/gateover-normal-side.jpg. Every frame's caption prints the try, the step,
  vy (PRESS marked) and his head vs the drawn underside; STOP lines name the frame: Normal sideways and upright: head stop step 84 and 98
  (head 0 px), WALL step 119 (x 956: the drawn end + 22), LANDED ON the top steps 155, 170, 186, 215, 224. `THROUGH while shut: never`;
  `ON ITS TOP while shut:` every far-ledge try and the drop; `OVER while shut: YES`.
  Clip tool changes (needed to be honest): the ties left after the first snap are HELD for the cheat tries (first run: a far-ledge try
  grabbed the third fig's vine with up held, pushed it free and OPENED the gate mid-clip, so every later try ran on an open gate);
  the old "under its sagging end" try TELEPORTED him into the wood (no longer a place he can be): it now walks in from past the end;
  a drop-onto try; THROUGH / ON ITS TOP / OVER printed separately.
- **Item 5, checks:** see section 8 (filled from the commands' own output).
- **Item 2, lay rule:** NOT done (pushback below; patch + measurement on the branch).

## 2. Polish check (what I looked at)
- sheets/gateover-normal-side.jpg (18 frames, 915x412 at 2x, layout 0 Normal): head stops read as his head at the leaf thatch's
  underside on the vine; the walk-in stops with his shoulder at the sagged end of the thatch (reads as bumping the low end); the
  landings show him standing ON the leaf thatch, which is exactly what Matt called "above the platform": RED, named in step 1.
- The drop clip's last frame shows "CHECKPOINT!" over him on the shut bough: the flag-on-gate finding (step 1).
- Upright and Easy: same STOP lines (clips/*.txt).

## 3. Pushback
- **Item 2 as written is the wrong fix for what is left.** With the wall, his head can no longer enter the thatch on ANY roll (planted
  "walked in level" case, every gate both ends). The real remaining hole is a jump from wood BESIDE a shut gate onto its top, and the
  packet's own model ("side entry above: he lands on it") turns that into standing on the gate (and on its checkpoint). Only the lay
  can close it (step 2), and that means rebuilding 1-4's proven list: past this box.
- **Item 3, "each must go RED with today's lid":** the vine-top leap never was a way through (above).

## 4. Suggestions (ready packets)
- PLANNER (tower.ts, pipeline.ts verdicts, seedlist 1-4): step 2 above. Done: towerGates refuses (a) wood under a sealed piece's
  drawn wood with less room than GATE.head + margin, (b) wood not wholly under its lid from which `leaps` reaches its sagged top; the
  lay never lays either; 1-4's list rebuilt; the clip prints `never` twice; castBots 1-4 unchanged.
- DESIGNER: should a checkpoint flag stand on a gate's own bough at all? 49 of 96 gates have one. A flag a storey past the gate's ways
  would be claimed only after the gate opens, whatever the lay does.

## 5. Unresolved
- OVER while shut: YES from the far-end ledge on layout 0 (and wherever the lay puts wood in jump reach of a gate's top).
- Item 2 (lay rule) and the 1-4 list rebuild: not done.

## 6. Method update (for reference/methods/stage-fix.md)
- A collision rule on a sloped (sagged) surface needs a "standing on it" tolerance in every from-below test: a jump off its own top
  while walking up the slope starts 1-2 px under the line at the new x. Test a jump off the top, walking both ways.
- Making a no-footing piece footing from above changes what every NEIGHBOUR does: the vines under it became grabbable through it. After
  any footing change, fly "stand on it, then every input" (up, down, jump, walk off both ends) on every piece under it.
- A cheat clip must hold the puzzle's state fixed for its cheat tries (or check it each try): a try that changes the state silently
  turns every later try into a test of a different stage.

## 7. Turnover note
reference/handoffs/engine-core.md: header line + section 0k's gate bullet rewritten (commit in section 8).

## 8. Checks (pasted from the commands)
(filled below)
