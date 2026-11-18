# ENG-25 REPORT (Engine, t-eng-25 from origin/main 6e7b85f8; packet reference/packets/2026-11-18/ENG-25.md; started 12:45 PM ET 11-18)
**Head:** the commit carrying this line (code head ffc5c99a; this commit adds only REPORT/note text). **HF:** one sandbox, ~$0.18 of $3. **Pushback:** 3 (below). **Gates on ffc5c99a:** all green (4 below).

## Done-items
1. **NEW 1 snap stones in play.** pieces/padPiece.ts plays `on: 'bites'` (ride.ts Pad.on): solid always, hurts while 'on' and he stands on
   it, through a NEW `PieceHurt.hold` (stagePiece.types.ts; engine.ts damagePlayer vx 0: the side knock threw him off the 80 px stone into
   the river); the jaw drawn by its count (beatBrick.ts `brickCount`, snapStoneArt.ts). Row: gen2/rideLay.ts PadRow `by: 'snap'` (in step,
   or a wave each stone a count LATER; a second clock = a second row's own `count`), `snapClock`, `snapWindow`, `snapFaults` in the wet
   verdict (pipeline.ts) on SNAP_FAIR = 2-5.md's flown numbers (80 px, 30-40 px water, <=3 in step, wave ahead only, window >= 0.9 s Normal,
   Easy >= Normal). snapWindow vs the flight: 1.37/1.40, 0.90/0.93, 1.60/1.63, 0.97/1.00, Easy 3-wave 1.97/2.00 (always <= flown, <= 0.04 s).
   Bot: firsttimer.ts PAD_SKILL.offBefore4 (plans two bars ahead, waits on a stone that is not biting, taps near the lip).
   **Toys** tools/inspect/snapRide.test.ts (in gates.yml), fixtures gen2-laid on a listed row (snapToys.ts, padToys' pattern): 12/12.
   Skill ON, middle Normal+Easy and child Easy x 4 variants: **0 bites** on both rows. **RED with the skill off:** step 13 bites, wave 9
   (same runs). **RED with a stone that bites without its tell:** snapFaults "phase 2 is on with no warn right before it".
   src/game/gen2/snapRow.test.ts 7/7: bar, lay, window vs flight, each snapFaults rule planted by name, in play (bite on four, vx 0, one heart).
2. **NEW 2 World 2's snapper cast row.** FOUND: CastPlay was never handed the stage clock, so an onBeat kind in play never told nor acted
   (proven only on predators/fixtures.ts). Now Enemy.kitBeat (types.ts) names the clock; CastPlay runs that animal onBeat by data and reads
   the clock each step (engine.ts passes this.clock). gen2/worlds/w2Cast.ts: `w2Snappers(clock)` (awake; asleep first) + `w2CastSpawn`;
   `beatCastFaults` in the wet verdict. Toy src/game/gen2/w2Cast.test.ts 4/4 on a gen2-laid row: the sleeper kicked -> chasedOff, counted
   (enemiesDefeated 1), hp unchanged; the awake one's tell began only on 'warn', its snap only on 'on'; planted (clock withheld) -> no tell.
3. **ART** (one HF job, 12:54-12:57 PM ET, ~$0.18, HF-SPEND.md): compared first (w2#boulder, dress#w2RiverStone); img2img from World 2's
   boulder recoloured (ART-22P's lesson), 6 takes s50/58/66 x 2 seeds (reference/art/hf25/takes/). First ship (s50-11) REFUSED by the lead
   1:33 PM: its ridges were my start's flat shapes barely repainted (code-drawn in effect). **Shipped: s58-23** (shaded painted ridges, a
   painted mouth; s66 painted pointed teeth, refused). ship.py builds every frame from its pixels: OPEN-1/2/3 and SNAP from its open cell (one
   lid, no shimmer; each take's own cells drift 5-11 levels on the lid), SHUT from its shut cell (its painted seam) under that lid. 5 frames
   (SHUT, OPEN-1..3, SNAP): counts 1-3 a notch each, four = SNAP 40% then SHUT (snapRow.test.ts pins it). w2-1118/w2-snapstone.webp
   1200x140, walk line 7, 34.5 KB; catalog row + inventory emit (w2, w6). The lead ACCEPTED fb583ab4's sheet at 1:38 PM.
4. **Nothing shipped moved:** lockall vs main's lock: 102/102 stages unchanged. tsc 0. Suite (3 shards, 1:51-2:22 PM ET): 3,798 pass, 0 fail, 2 todo (main's own: w4RealReach/w4Runtime, unchanged). generality PASS, knowncheck PASS,
   roadmapcheck PASS (unshallowed), coveragecheck PASS after `pad:snap` (5), artcheck PASS, art tests 16/16 on the final emit. Bots: castBots +
   tierBots (1-1 calibration replay) + padRide 43/43. No shipped stage lays an onBeat animal in a cast (the frog's World 6 runs on predatorAI).
5. **coveragecheck:** `pad:snap` priced by score.ts rideTiming (its pad branch) **per stone**: each stone's own board window (bar less the
   bite, 2.25 s), NOT the run's window to leave the bank (0.9-1.6 s), so 2-5's in-step rows and waves read easier than they play.
   **Missing channel: the run window** (Suggestions 1). brick:bites now names the bot.
6. **Stills:** reference/qa-reports/ENG-25/snapstone-{upright-412x915,sideways-915x412}.jpg: a COMPOSITE at in-game size (80 u floors drawn
   1.08x, Pokey at 89.1 u, World 2's backdrop; water and bank flat fills), not an engine frame (no shooter reaches a toy row). In-play stills: 2-5's builder.

## Polish check
Sheet on light/dark ground at 2x and the phone stills: OPEN-1 (slit + painted ridge tips), OPEN-2, OPEN-3, SNAP (clamped, meshed) read as the count
and the bite; ink and moss match the backdrop's boulders. Named: SHUT's faint band at the lid's foot (the cells' join); the composite's flat fills.

## Pushback
1. Packet: frames "SHUT, OPEN-1, OPEN-2, SNAP"; 2-5.md :61-64: OPEN-1..3. Shipped both: 5 frames (the lead's review: SNAP reads as the bite).
2. damagePlayer's knock threw him into the river (2-5.md: "it still holds him"): added PieceHurt.hold, Enemy.kitBeat, Pad.on, art 'snapStone' (Architect's types; additive).
3. Child Normal is not held unbitten (step: 1 bite, 3 lives in 4 runs; wave: 4 bites, 4 lives): rule 4, Normal is not softened for the kid.

## Suggestions (ready packets)
1. METER (high): score.ts prices a snap run by its window (snapWindow) as log2(1 + cycle / window) (2-5.md); done = pad:snap's channel, a plant.
2. ENGINE (high): the snapper bot skill `bonk-after-the-snap` + toy (2-5.md NEW 2's bot line); fly the stomp's bounce height.
3. CONTENT: a clack on four (2-5.md "the clack is extra"). BOT: 3 of 24 held toy runs lost a life to water (the tap at a stone's lip).

**Unresolved:** no engine still of a snap row; the meter's run channel; the snapper's bot skill; drawcheck not run (no shipped stage draws one; 2-5 adds it, D51).

## Method used / Lessons applied / Method update
Used: ENGINE.md day one (main's lock first), hf-art.md (img2img from the shipped piece, one sandbox), level.md 21, 23, 24. Lessons: D23/D30 (times from date), D41 (Pokey 89.1), D75 (toy on a gen2-laid listed row), D80 (one model per rule: padFaults
leaves snap stones to snapFaults), D15 (snapWindow tested against the flight before use), D57 (queue read at each push), D59 (no job left
running), D64 (context named in messages), D65/D79 (judged on World 2's backdrop, whole screen).
**Method update (hf-art.md):** "Build an animation's frames from ONE painted take cell, never each cell's own (the static part drifts 5-11
levels, a shimmer); and judge a start's shapes after img2img: at s50 code-drawn shapes survive unpainted (the lead refused s50-11)."
**Learned (for the next engine member):** a beat on a kind is not a beat in play until the stage clock reaches it: grep the runtime for
the field (`sc.beat` was never set) before trusting "WIRED" in a design. Turnover note: reference/handoffs/engine-core.md §0zl.
