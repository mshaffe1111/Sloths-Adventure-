# Method: measuring a world's fun (the validator)
Last proven: 2026-11-04 (round 2, the supervisor's REDOs and the bot's bounce fix), branch fun-validator, World 1 (tools/validate; pages in reference/qa-reports/validator/). Owner of the last
update: fix-petals. Plan: PLAN-TO-80 Phase A.1 (R-150.1 grown into the research's validator, R-150.4 mechanics-in-use table).

## When to use it
Judging whether a world's stages are varied, paced and biting (STAGE-RULES §0, §0b; research 2026-11-04 §1, §7), before and after a
change to them; and as a gate later. Not for "is this spot fair" (that is stage-fix.md) or "can it be finished" (levelCheck, the tests).

## Steps
1. **Check the ruler first (D15).** `npx tsx --test tools/validate/validate.test.ts` (and `tools/validate/world1.test.ts`: the stick scores today's World 1 where Matt felt it): every check has a world built to fail it and one
   built to pass it, in the real engine. A new check gets its two fixtures before it scores a real stage. A fixture that fails is fixed in
   the probe, never by loosening the fixture (the walled-chase fixture caught the hold-right runner skipping past the wall it was stuck at).
2. **Run the world:** `npx tsx tools/validate/world1.ts [--stages 1-1] [--layouts 16] [--play 3] [--clumsy 20] [--out <dir>]`
   (World 1 on 4 CPUs: about 1 min for one stage's play, the structure of all nine on 16 layouts in about a minute).
   - Every stage comes from the real engine (D19): `RealPlay` builds it as the game does on entry (generateStage, withGoals, easyStage);
     the route is the inspector's goal route (eraRoll.ts pickRoute) and its beats (beats.ts), mapped one to one to move letters.
   - Structure checks (core.ts, mechanics.ts, evaluate.ts): move string, pacing strip, dead walks, repeats, similarity to the stage before
     (0.45) and any before (0.55), nothing new, miss cost, padding, tempo, enemy jobs; on every layout, Normal and Easy, the world in order.
   - Play checks (play.ts): a hold-right runner over breaking branches and the eagle's stretches (camera on, damage on, six starts in its
     rhythm, hits counted against the stretch whose pass saw him); the first-timer bot (fixed) for what he met, the chase gap and landings
     in view (the engine's camera at take-off, upright and sideways); the clumsy thumb (taps +-100 ms, 15% less air control) for each jump.
3. **Read the page, then the screen.** Every flag gives its x and its source rule. Before believing a flag, look at the spot (a still or
   the bot clip). Where the tool and the screen disagree, fix the tool; never tune a threshold to agree with an expectation.
4. **Report the bot's limits beside every play number.** A run with more than 3 rescues or no shrine is not counted, and a family with no
   counted run is "not judged" (neutral, marked on the page).

5. **The gate (CI, every change):** `npx tsx tools/validate/funcheck.ts` (about 45 s) judges the structure flags of every World 1 stage, 16
   layouts, Normal and Easy, against `tools/validate/funknown.json`: a (stage, setting, rule) on more layouts than known fails; one on fewer
   fails until it is lowered (`FUNCHECK_WRITE=1`, same commit). The play checks are not in it (minutes a stage, and they rest on the bot):
   run the pages for those. Accepted by the quality supervisor 2026-11-04 (7909cf11) as World 1's checklist for every rebuild.

## The bar
- Each check fails its bad fixture and passes its good one.
- Calibrated against what we already know: 1-1 vs 1-5 0.998 (inspector 0.979), 1-3 vs 1-9 0.789 (inspector 0.78); today's World 1 flagged
  where Matt felt it (all alike, nothing bites, branches and eagles outrun, padded finishes).
- One page per stage a person can read: the score by family, the move string, the pacing strip, each flag in plain words with x and source.

## Checks before reporting
The fixture test; the world run; open each page upright (412 wide) and wide; the CLAUDE.md gates if anything in src/ changed.

## Pitfalls we already paid for
- 2026-11-04: **RealPlay replaces losing a life with a `died` flag.** A probe that wraps loseLife counts every frame of a fall (5,738
  "lives" on 1-8) and a fallen runner walks on under the world to "reach" the end. Watch `sim.died`, count one fall, and either put him
  back (counted skip) or end the run.
- 2026-11-04: **the eagle's pass finishes after he leaves the stretch.** Hits landed just past each stretch; counted where they landed,
  12 of 13 of 1-7's stretches read as outrun. Count a hit against the stretch whose pass warned or saw him (7 of 13).
- 2026-11-04: **the level check's reach on the flat is 175 x 0.97 - 70 = 99.75 px.** A fixture with 100 px gaps reads as unreachable.
- 2026-11-04: **a safe hop and a jump are one move to a player.** Split for similarity, 1-1 vs 1-2 read 19% alike; merged, 99.9%. Keep
  the safety in the miss-cost check, not in the letters the similarity compares.
- 2026-11-04: **jumps the level check can't confirm** (mushroom walls) are a letter of their own (Q) and are not priced.

- 2026-11-04: **a hazard can be "not outrun" and still invisible.** 1-8's collapse came within 134 px of a first-timer, but the chase camera
  looks so far ahead that the front is on screen in 0-5% of its frames (the quality supervisor's clip: the branch behind him whole while
  Dot says it breaks). Measure on screen from the run's own camera, frame by frame; a still placed by hand can't show a moving hazard
  (placing Pokey froze the collapse and picked up a seed).

- 2026-11-04 (the supervisor's page review): **a step marks where a move starts, not how long it lasts.** 1-4's trunk climbs and rope
  shimmies read as 3.7-5.8 s "dead walks"; the time on a climb, rope, swing or glide is now taken off (core.ts busyBetween).
- 2026-11-04: **a hazard that is outrun or unseen is decoration, and so is a "new" move the route doesn't need.** 1-5 scored 5 for
  branches outrun on every run and 10 "new" for them; 1-8 5 for a chase on screen in 0-5% of frames. The rules now live in score.ts
  with their own fixtures: hazards matter = the share of tries each kind bites; new = needed by the way to the shrine, and biting.
- 2026-11-04: **one letter, one thing.** The chase's collapse shared B with breaking branches (1-8: 114 B's, "no breaking branches"). It
  is K now. Same for verdicts: a run the hold-right runner never got across is "not judged", not "bites".
- 2026-11-04: **moves alike and looks alike are two measures.** 1-7 read 10% like 1-1 by moves, 84% by pieces and art (look.ts); Matt
  judges by what he sees. The overview shows both.
- 2026-11-04: **"holding right alone" was not what the line measured.** It compared the goal route with the shortest way to the shrine;
  it says that now. Name a number by what the code computes, then check it against the code.
- 2026-11-04: **the bot's play numbers rest on the bot.** The first-timer never doubled off a mushroom's bounce and forgot 1-1's double
  on later stages (each run starts on a fresh phone): 1-1 and 1-5 were 10-21 rescues a run. Fixed (firsttimer.ts bounceJump, the
  double carried from 1-1's hint); re-run every play number after a bot change, and say which bot the page used.

## Tried and didn't work
- Pacing groups split at every 1.2 s gap: World 1's moves come every 3-4 s, so every group was one move. Read pacing in 5 s windows.
- The hold-right runner without a second flick: it fell into 1-8's first 212 px gap and judged nothing.

## To try
- Stills per flag from the quality supervisor's bot clips (tools/quality/botrec.mjs).
- Carry every taught move between stages (today only the double is carried; firsttimer.ts DOUBLE_TAUGHT), as a phone played in order.
- Finer piece names in the builders' meta (today "highrun" covers several pieces), so padding repeats name the actual piece.
- Worlds 2-10 in the gate, once the validator reads them (W1 in evaluate.ts; their builders' meta pieces).
- The play checks in the gate on one layout, once the bot's step-down miss rule is fixed (bot-fix).
