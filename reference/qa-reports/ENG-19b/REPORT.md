# ENG-19b REPORT (t-eng-19b from origin/t-eng-19@141529cc; started 11:04 AM ET 11-15)

## EXACT NEXT STEP
**0. Finish ENG-19b's proof (a fresh member, ~40 min of machine time):**
   `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts` (alone), then
   `npx tsx tools/engine/seedlist.ts 1-1 --check`; then `npx vite --port 5199` and
   `PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/runs/boaClip.mjs 5199 reference/qa-reports/ENG-19b/clips/roost-up roost up` (and `... roost-side roost side`) for the roost stills;
   `npx tsx tools/engine/runs/boaBotPads.ts /tmp/pads.json middle 1` (prints hits 0, beaten still) then
   `BOT_PADS=/tmp/pads.json PW=... node tools/engine/runs/boaClip.mjs 5199 reference/qa-reports/ENG-19b/clips/bot-up bot up` for the middle bot's freeze clip; name the frames from frames.txt.
**Then the 1-9 builder (STEP 0 plan for the lead's GO, level.md rule 25):**
Everything 1-9.md's "Building blocks" names is now in the engine (1-6) except the build itself (7). The builder:
1. **Writes w1Arc19.ts** from 1-9.md's node string, with the brief `{ cast: ['boa', 'eagle'], teaches: ['traps', 'still', ...] }`:
   `teaches` holding **'still'** is what makes beat 2's freeze the slow-motion moment wherever he stands (CastData.teachStill, written by
   pipeline castOf). Its stageTable row, its own rests, arrival, exit; the hand-built 1-9 deleted (castEngine.test.ts:45 names it).
2. **Beat 2 geometry**: the boa's post 140 px from the edge he stops at is now inside BOTH settings' engage (150 Normal, 195 Easy) and
   outside the strike (128 px): it rears there on both. On Easy the rear starts 195 px out, so a boa nearer than 195 px to where he
   enters a screen rears on arrival: place every boa with that in mind (the phone check: 195 + its 58 px coil <= 270 px ahead).
3. **Beat 7 (the roost)**: a `boa-roost` row (w1Cast.ts W1_BOAS) beside a section's `l` lure socket (W1_LURE 'w1-roost', reach 150);
   the roost is drawn from proto.gen2.roosts. The creaky limb under it: bots pause their thumb on a 1.1 s limb (14/30 runs dropped to
   the bough below in boaBots.test's toy, with or without the roost): keep the bough below (1-9.md: "never a pit"), and read the bots'
   drops on the built stage before tuning the limb's width.
4. **Dot's beat-2 line must say "freeze" or "don't move"** (the bots learn the freeze only from those words: firsttimer.ts takeIn; never
   "hold still", 1-7's hide words). Ask the story keeper for it with that constraint.
5. Roll, register (addlevel.ts), bots 1-40 both settings (castBots.ts), and read: the child bot on Normal (see Unresolved 1).

## Done-items
1. **The roost art** (packet 1): ONE Hugging Face run, sandbox 6af9d8d329dd05ff0368e5a2, 11:08-11:16 AM ET, spec-roost2.json, 6 takes,
   ~$0.37 (HF-SPEND.md; ENG-19 a+b ~$0.83 of the $2 cap). Judged at 190 px tiles (clips/roost-takes-190.jpg): **roostb-101** picked
   (whole piece in frame, nest and feather read; 113 and 97 run their bough off the edge, 71 reads as a little tree on a mound, 83 a cut
   stump, 127's nest too small at 145 units). Cut (hf1113/cutprops.py, 145 units): src/assets/w1-19/w1-roost.webp 593x435, 75 KB,
   **1.63 of Pokey** (catalog row hf19/w1-roost, scale_ok y; rows.py now writes LF, it had re-written all 9,454 CATALOG-MASTER rows as
   CRLF). **Drawn**: w19Art.ts drawEagleRoost at every proto.gen2.roosts post (nest over the post, bough piece on its ground), behind
   him and the animals; preloaded only on a stage that lays one (stageManifest 'w19'). w19Art.test: 3 tests; PLANTED: the preload hook
   removed -> red.
2. **The stage's first freeze, wherever he stands, by data** (the lead's ruling on ENG-19a Pushback 2): CastData.teachStill (a cast brief
   whose `teaches` holds 'still'); CastPlay reports the first animal beaten by stillness as `froze` wherever he stands, later ones only
   inside the strike's reach. castFreeze.test +2; PLANTED: kit half red before the code, pipeline half red with the clause removed. No
   brief teaches 'still' today: nothing moves.
3. **The kit boa's coil hurts on touch** (the lead's ruling 11:20 AM ET, on my question: a bot that never froze ran PAST a kit boa unhurt,
   the strike aims where he was and the body neither blocked nor hurt): PredatorDef.coil (BOA 58x26). boaCoil.test (real engine): a
   walk-through costs a heart on Normal and Easy; PLANTED coil off -> 0; never through a dazed, fleeing or gone boa.
   **The fairness gate, exact wording (predators/fixtures.ts, approved by the lead 11:31 AM ET):** "outside its strike the ONLY hurt is
   its own body on touch, where its data gives one (PredatorDef.coil): exactly its coil at its post, while it watches or rears, never
   moving, never bigger. Anything else fails." PLANTED: the coil hurting in recover -> 4 tests red.
4. **Easy notices him 1.3x as far off** (the lead's ruling 11:31 AM ET; the coil alone had collapsed Easy's window to Normal's): easy.engage
   (>= 1) and engageOf() in core.ts; BOA's Easy row 1.3. **Flown (boaFreeze.test, real engine, from a full run, frames after the rear
   starts that the thumb lifts): Normal STILL to 13, HIT 14 (unchanged); Easy STILL to 18 (0.60 s), HIT 19.** Not the ~26 hoped for:
   26 needs the rear ~255 px out, which puts the coil 255-313 px ahead, past the 270 px an upright phone shows; x1.3 (195-253 px) is the
   most that keeps the whole boa on one upright screen (asserted). PLANTED: Easy engage off -> 2 red.
5. **The bots freeze** (packet 2, rule 21, toys first): firsttimer.ts freezePlan. boaBots.test (in CI, gates.yml): middle Normal, middle
   Easy, child Easy and expert unhurt on 6/6 seeds, the boa beaten by stillness; **PLANTED noFreeze: hit 5/6, 6/6, 3/6, 6/6**. The roost:
   every tier (child Normal too) on every seed never hit, the boa chased off by the lure; **PLANTED roost removed: every run stops for
   it or is hit**. Calibration (BOTS.md: no tester profile measures reaction, so KID's and ADULT's are kept): reaction = stopReact + the
   thumb's lag, middle/expert ~0.33 s, child ~0.49 s. A coiled animal is no longer hopped as if it walked at him (castBots.test #4 caught
   my first, wider version, which also stopped 1-3's snakes being hopped; fixed to `def.coil` only, green).
6. **topUpFoes on no-cast stages** (packet 3): does NOT touch 1-9 (it reads castRows: a cast stage tops up only its own kinds; 1-9 gets
   bare boas, the eagle is an air row). Owner of the rest named in Unresolved 4.
7. Gates: **lockall 102/102 stages unchanged** (16 layouts, the head at aca73b761 checked against origin/t-eng-19@141529cc, EXIT 0, 11:54 AM ET). **NOT RUN (the lead's stop, 11:54 AM ET: Matt's tokens go to deploying built levels): the whole suite, seedlist 1-1 --check, build, perf gates.** Run instead: the 62 kit/cast/boa test files (657/657 on 155623ea8), boaBots + castBots + firsttimer (25/25 on aca73b761). tsc 0; generality PASS; knowncheck PASS; artcheck PASS; roadmapcheck PASS (after
   unshallowing the clone). Bot suites: castBots, chaseBots (its TODO as before), firsttimer, tierBots, boaBots green.

## Polish check
- The roost judged at phone size on the takes sheet (clips/roost-takes-190.jpg, 190 px tiles) and the pick sheet (clips/roost-pick-101-127.jpg); the cut checked on dark purple and green (clean key, no magenta fringe).
- **NOT SHOT (stopped by the lead): the roost in the game upright + sideways, and the clip of the middle bot freezing.** Both are one command each once the suite is green (EXACT NEXT STEP 0).

## Pushback
- The packet's "they use the lure/roost ('be the bait') the way the design asks" as a bot SKILL: the kit's lure chases the boa off in its
  first rear frame, before any human reaction, so a "roost reading" in the bot would never change a run (filler). Built instead: the toy
  proves every tier walks on unhurt by a roost, planted with the roost removed.
- The lead's "~26 frames on Easy": the phone rule caps it at 18 (Done 4). Say if the screen rule should give way; I would not.

## Suggestions (ready packets)
- **BOT-HOP (meter)**: hopping a rearing coil is a legit expert move (the strike aims where he was, the lead 11:20 AM); no tier bot does
  it. Files tools/inspect/firsttimer.ts; done: the expert hops a boa's coil in its rear on a planted toy, the middle does not.
- **ENG-TOPUP (engine)**: Unresolved 4, with a planted test (a no-cast purge stage in a world whose manifest holds a kit-only kind).

## Unresolved
1. **The child bot on Normal is hit at 3 of 6 boas** (reaction ~0.49 s against Normal's 0.43 s). 1-9 is Normal 9.5, World 1's hardest:
   the lead or the designer reads whether the child tier should pass 1-9 on Normal (more teaching, the creep taught, or accept).
2. Bots pause on a 1.1 s creaky limb (14/30 drops in the roost toy). The limb's width on the built stage decides; not tuned here.
3. ENGINE-WORTHY (ENG-19a's rough, still open): the red danger glow stays under a boa beaten by stillness (it flees 4 s at its post).
4. ENGINE-WORTHY: topUpFoes on a NO-cast stage takes every 'topup' row of its world's manifest, now World 1's boa too (W1_BOAS 'boa' is
   cast+topup), and a boa on a no-cast stage plays the OLD brain. No World 1 stage tops up today (ENG-19a's lockall 102/102 unchanged
   after the row joined). Owner: the next engine member (pipeline.ts topUpFoes: a no-cast stage tops up only rows not tagged 'cast').
5. **Not done (stopped by the lead 11:54 AM ET):** the whole suite alone, seedlist 1-1 --check, the in-game roost stills, the middle-bot clip. No known red: every test file touched or near the change is green (Done 7), but the full suite is unproven on this head.

## Learned (for the next builder)
- Fly the WHOLE run, not the stop: a bot that never stops got past the boa unhurt, which no stop-timing flight could show. Every
  "the only door" claim needs a toy where the player does NOT do the move.
- A new hurt (the coil) changes every window measured without it: re-fly the timing after any change to what hurts.
- Check a skill's trigger words against every shipped line (1-7's "hold still" would have taught the freeze on the wrong stage).

## Proposed level.md changes (the lead decides)
- Rule 24 add: "and fly the player who does NOT do the move: the toy must show him failing (1-9: a run straight past the boa was free
  until its coil hurt)."
- World 1 notes add: "A kit boa rears 150 px out on Normal, 195 px on Easy; place none nearer than that to where he enters a screen."

## Method update
- engine-fix method: after a new hurt or a timing change, re-run the timing flights (boaFreeze) and the bot toys before the suite.
- hf-art: rows tools must write LF (csv's default CRLF re-wrote the whole master catalog); Content's hf678/hf1113 rows.py have the same
  writer (lineterminator unset): the same fix there (Content's tools).
- clip method: boaClip.mjs `bot` + boaBotPads.ts replays a tier bot's own thumb through the real pad, so a clip of "the bot does X" is
  the bot's run, not a script.

## Lessons applied
D19 (the tests fly the real engine and kit), D21 (the hop fix spread to every coiled kind, and only those), D37/D69 (each claim names its
run or frame), D40 (old-brain boas untouched), D41 (sizes against Pokey's 89.1), D43 (no stage id in engine code: generality PASS), D55
(context reported as an estimate), D57 (queue read before each push), D77/D78 (box), law 22 (the gate changed only by the lead's ruling,
its wording approved).

## Turnover
reference/handoffs/engine-core.md §0zd (this branch).
