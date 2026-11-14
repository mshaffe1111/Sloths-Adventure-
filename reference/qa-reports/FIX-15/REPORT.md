# FIX-15 REPORT: 1-4 fig gate, no way over or through a shut bough (R-165.212). Branch t-fix-15 from origin/t-int-8-clip (315548d1).
Engine member, Opus 5.5. Started 11:49 AM ET 11-14. Status: **item 1 (engine) GREEN** (the lead's ruling 12:24 PM ET: push GREEN for
item 1 only); **"over" stays RED until FIX-15b's lay rule** (93 of 192 gates have wood from which a side jump lands him ON the shut top).

## The lead's question: from the shut top, can he carry on past the gate without locking it? **No.**
Real engine (RealPlay, the figs held), standing on every shut gate's drawn top at 10%, 50% and 90% of its span, each of: hold up, a
held jump, a double, a double left, a double right, walk left, walk right, hold down; 60 frames each; 1-4 layouts 0-3, Normal and Easy:
**0 of 1152 tries** stood or climbed anywhere higher than 30 px over the gate's line; no gate opened. (Why: its ways up are `off`
while shut, and towerSkips refuses a roll where a jump from the gate's level reaches the next storey.) His only ways off it are its
ends, back to the field. **One thing it does give him:** a checkpoint flag stands on the gate's own bough on 49 of 96 gates (layouts
0-7, both settings), and a flag is claimed within 70 px across and from 150 px over it down to 40 px under (engine.ts:2847). So a side
jump onto the shut top claims the gate's flag before the gate is locked. Not new: the same arc claimed it before this change while he
passed over and fell through. A respawn there puts him on the shut top, where he can only walk off its ends and solve it.

## EXACT NEXT STEP (in order; the next member starts here)
1. **FIX-15b (the lead: starts right after this; no rebuild in this box).** Matt's words: "it let me go above the platform". With a
   shut bough now footing from above, the side jump that used to fall through it ends STANDING on it (`STOP ... LANDED ON` in the
   clips), on 93 of 192 gates by a generous read. FIX-15b makes the lay keep wood out of that reach, then the verdict, then the relist.
2. **The lay rule: keep wood out of a shut gate's jump reach from beside it** (tower.ts). Root: towerCatches' `byGate` band and
   towerGates only guard wood LEVEL with a sealed piece (GATE_LEVEL 30 px); a ledge 39-99 px under it, beside or partly under its end, is
   laid freely (layout 0 gate 6: ledge 876-1056 y 2022, 99 px under a bough whose drawn far end sags to 1979). Measured
   (exposure-16-layouts.txt, 16 layouts x 2 settings, 192 gates): 48 gates have wood under them with less room than his drawn height
   (head room), 93 have wood from which a generous jump (tower.ts leaps) reaches the shut top. The verdict half is written and NOT
   applied (lay-rules-NOT-APPLIED.patch: `sealedRoom` in `cramped` + two towerGates checks). Applied alone, the head-room half builds
   every layout tried (0-7 Normal, 0.5-8.5 s each) but moves 1-4's rolls (layout 0's seed 1 is refused); the gate-top half refuses every
   seed of layout 0 ("no seed of 24 builds"), so the LAY must first stop laying such wood (towerCatches: extend byGate down a double
   jump under the gate's sagged top, beside its span), then the verdict, then **rebuild 1-4's proven list** (`npx tsx
   tools/engine/seedlist.ts 1-4`, 100 seeds, version 6b772e6e today) and every test that pins a roll or seed (release.md item 6),
   on the FULL suite. Where the lay cannot keep a piece out, it is not laid and the open end is caught lower (towerCatches step 4);
   a roll that cannot is refused, and the yield is measured (seeds tried per accepted roll, before and after) in the report.
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
- **Item 5, checks:** section 8 (pasted from the commands). **castBots 1-4** (`--seeds 1-12 --setting both --par 2`, base
  origin/t-int-8-clip vs this branch): every bot's PASS line IDENTICAL (`diff` of the PASS lines: no difference): kid 9/12 N, 10/12 E;
  adult 12/12 both; child 2/12 N, 4/12 E; middle 6/12 N, 7/12 E; expert 7/12 N. The bots solve the gates the fair way exactly as before.
- **Item 2, lay rule:** NOT done (pushback below; patch + measurement on the branch).

## 2. Polish check (what I looked at)
- sheets/gateover-normal-side.jpg (18 frames, 915x412 at 2x, layout 0 Normal): head stops read as his head at the leaf thatch's
  underside on the vine; the walk-in stops with his shoulder at the sagged end of the thatch (reads as bumping the low end); the
  landings show him standing ON the leaf thatch, which is exactly what Matt called "above the platform": RED, named in step 1.
- The drop clip's last frame shows "CHECKPOINT!" over him on the shut bough: the flag-on-gate finding (step 1).
- sheets/gateover-normal-up.jpg (upright 412x915): his head meets the thatch's underside on the vine (head -1/0 px); on the walk-in
  he stands at the sagged end with his shoulder at the leaves, never under them; after the far-ledge flicks he stands ON the thatch
  (FIX-15b's); the drop's frames show "CHECKPOINT!" and the flag rising on the gate's own bough. Easy (side + up): layout 0 Easy lays
  no far-end ledge; head stops, THROUGH never; ON ITS TOP only the planted drop.

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

## Method used, lessons applied, my misses
- Method: reference/methods/stage-fix.md (opened late, at the checks: steps 4-6 and 9 were followed in substance: smallest true cause in
  the engine, fail-before/pass-after on the real engine, other stages proven unchanged by lockall (section 8), filmed frame by frame
  with the touch-pad clip tool). Step 1's first-timer sweep was castBots (the same bots, the stage's cast).
- Lessons: D19 (the test reads the DRAWN wood the screen draws, drawGateLock's topAt), D21 (both ends of every gate, both settings,
  both orientations), D41 (his drawn height 89, not the collider), D43 (no stage id or x in engine code; tests take every gate's
  geometry from the roll), D63/D69 (judged on clips, each STOP frame named; a try that silently opened the gate was caught and fixed),
  D67 (no wait loops: background tasks and their notices), D40 (the lay rule NOT built on a list about to be rebuilt in this box).
- **My miss (D57 again):** the lead's ruling sent 12:17 PM ET reached me at 12:36 PM: I sent my 12:21 message without reading my queue
  first. Countermeasure I will keep: ReadNotifications before every send_message, not only at a push.

## 6. Method update (for reference/methods/stage-fix.md)
- A collision rule on a sloped (sagged) surface needs a "standing on it" tolerance in every from-below test: a jump off its own top
  while walking up the slope starts 1-2 px under the line at the new x. Test a jump off the top, walking both ways.
- Making a no-footing piece footing from above changes what every NEIGHBOUR does: the vines under it became grabbable through it. After
  any footing change, fly "stand on it, then every input" (up, down, jump, walk off both ends) on every piece under it.
- A cheat clip must hold the puzzle's state fixed for its cheat tries (or check it each try): a try that changes the state silently
  turns every later try into a test of a different stage.

## 7. Turnover note
reference/handoffs/engine-core.md: header line + section 0k's gate bullet rewritten (commit in section 8).

## 8. Checks (pasted from the commands; code head 1d50e45a, unchanged since: later commits are the clip tool, docs and clips)
- `npx tsc --noEmit -p .`: TSC-OK.
- Full unit suite (CLAUDE.md's line): `# pass 3404`, `# fail 0`, EXIT 0 (the one `not ok` printed is the existing 4-3 `# TODO`).
- `src/game/fieldGate.test.ts` alone: 18/18 pass (12 old + 6 new).
- `BASE_PATH=/Sloths-Adventure-/ npx vite build`: exit 0. `node tools/perf/chunkcheck.mjs`: `chunkcheck: PASS`.
- `node tools/perf/artcheck.mjs`: PASS. `node tools/perf/knowncheck.mjs`: PASS. `npx tsx tools/engine/generalitycheck.ts`: `27 literals,
  27 known`, PASS. `node tools/roadmapcheck.mjs`: PASS (after `git fetch --unshallow`: this container's clone was shallow and the gate
  correctly FAILS on a shallow clone: "proofs cannot be checked").
- CI's engine-tool tests (gates.yml line 94, clip.test.ts and castBots.test.ts included): `# pass 87`, `# fail 0`.
- `lockall --layouts 16 --stages 1-4,1-1,1-3` (base origin/t-int-8-clip recorded in a worktree, this branch checked): `lock: 3/3 stages
  unchanged` (96 builds). No generator file is touched (src diff: engine.ts, fieldPlay.ts, vineField.ts GATE.stand, the test).
- castBots 1-4, 12 seeds, both settings: PASS lines identical to base (section 1).
- `node tools/perf/drawcheck.mjs` (CI=1): every scenario ✓ (1-4 both orientations, its gate lock's draw at 0.25/frame) EXCEPT
  `ctest-mix14 port/land: could not be played (window.__play is not a function)`, its FIRST scenario, started while the unit suite,
  a lock run and drawcheck's own two dev servers shared 4 cores ("Cannot read properties of null (reading 'quality')" then the
  missing dev hook: the page was not up). Re-run on a quiet machine: see below.
