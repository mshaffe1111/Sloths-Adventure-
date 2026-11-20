# ENG-NOISE report: one noise channel the cast hears (World 3's first engine foundation)
Branch t-eng-noise from t-int-13 8efb1bba. Code head (gates ran on it): b85e5aee0. Final hash: in the lead message (this file's commit).
**The channel as built.** castPlay.ts `noise(n)` takes any heroNoise.ts Sound; each cast step hears his landing first, then every noise
made since the last step, in order, each reaching every animal through core.ts `hear` (`CastStep.heard` lists them). Three makers:
- **His hard landing** (as before, castPlay.ts step) except on QUIET ground: `Platform.quiet` (one field; gen2 `SectionPiece.quiet`),
  read by `heroNoise.landingNoise(x, y, t, fell, ground)` -> null; the engine fills `CastHero.quiet` from the platform he stands on.
- **His punch** (engine.ts `blowNoise`): `punchNoise` at his place, once a swing, when its strike window closes (a kick and a mega the
  same; a taken-back jab none). Heard only from `TAUGHT.noise` (World 3): no World 1-2 cast hears a blow.
- **A struck object** (`CastData.sounds: SoundPost[]`, laid by new gen2/soundLay.ts from a prop socket tagged 'sounding'): a blow that
  reaches one rings it (`ring`: its bellNoise at its place; sound + 0.04 s hitstop) and makes ONLY that sound (`atk.rang` stops the
  punch's). The stage may fire one too (`CastPlay.ring(i, t)`, the same noise). No stage id, world number or x in engine code.
## Done-items
1. One channel, the three makers, the quiet field: above; generality PASS (26 literals, 26 known: none new).
2. Toys on gen2-laid rows (gen2/noiseRow.test.ts; toy World 3 kit, rows laid by buildGen2Stage, played in RealPlay at 30 fps):
| Toy | Green (b85e5aee0) | Plant on the REAL code (piece broken, run, restored) |
|---|---|---|
| struck stone calls a kit ocelot | drawn 0.07 s after the press, goal = the stone's x, from 588 px, under it at 5.67 s (closest 5 px); channel heard [bell] only | stone's ring call removed: RED (never drawn). "Only its sound" off (punch heard too): RED |
| punch wakes a sleeper in 240 px | 200 px: woke; 300 px: slept; heard [punch] once | punch noise removed: RED (sleeps on) |
| 400 px drop: moss vs stone, sleeper 300 px off | moss: heard [], slept; stone: heard [landing] (r 360), woke | landingNoise ignores the ground: RED (moss wakes) |
The test file also keeps each plant as a stubbed case (ring off -> never drawn; punch off -> sleeps on; quiet ignored -> wakes).
castNoise.test.ts (no engine): the ladder (worlds 1-2 hear no blow, 3-4 do), order (landing, punch, bell), a stage-fired ring draws an
ocelot, soundAt's box edges, quiet ground silent for any fall, a flag clears the queue.
3. Gates: the table below, every item once on b85e5aee0 (suite in 3 shards, background).
## Gates on b85e5aee0
GATE_TABLE
## Lockall
`lockall --layouts 16` (3,264 builds, 102 stages) on main 6e7b85f8, the base 8efb1bba and b85e5aee0: mine == base, every build
(IDENTICAL); mine vs main = base vs main exactly (the same 17 stages, int-13's own: 1-6 1-7 1-8 1-9 2-1 2-2 2-4 3-8 4-4 6-1 6-3 6-6 6-7
7-5 7-9 8-3 8-5). Nothing shipped moved: no shipped stage lays a sounding thing or a quiet piece, and no World 1-2 cast hears a blow.
## Polish check
Nothing drawn changed: no new art, sprite, screen or text; nothing to shoot upright or sideways (drawcheck/clipcheck PASS). ROUGH,
NAMED: a struck stone has no look yet, and its ring is a STAND-IN sound, `sound.playShrineUnlocked()` (the puzzle bell's ring) plus a
0.04 s hitstop, until the chime's own sound and look (ENG-LURE). The toy rows exist only inside the test.
## Pushback
- "lockall vs main": t-int-13 itself already differs from main on 17 stages (its own merges, listed above), so the lock was taken on
  main AND on the base: mine equals the base exactly, and mine vs main equals base vs main.
- "His punch" = every blow (punch, kick, mega): one noise a swing. The lead ruled: kept (every blow is heard from World 3 on).
- "Fired by the stage as data": built as the API (`ring`), not a clock-fired SoundPost: no design names its timing yet (D40).
## What the 3-3/3-5 builders need
- A sounding thing: a world row in its kit (`soundProps({ chime: { w, h, looks } })`, `emit: soundEmitters(rows, note)` for the look),
  a section socket `soundSocket(id, piece, t)`. Its box (w, h) is what a blow must reach: size it to Pokey (his drawn height 89.1).
- Moss: `quiet: true` on the section piece; give it a moss look by style/slot (quiet draws nothing). A brief must still name the cast.
- Numbers: punch r 240, bell r 680, landing soft 200 / min 180 / 0.9 per px / max 560 (heroNoise.ts LOUD); hearY 360 up or down.
- Bots: firsttimer.ts has no skill for any of this yet (3-3 ring-to-call, 3-5 quiet-route are their own packets).
## Unresolved
UNRESOLVED_LINE
## Suggestions
- ENG-LURE packet as written in 3-3.md NEW 1, plus: a recorder event for a ring and a punch noise (castStep.heard has them), with a
  counting test (D38). The puzzle kit's thrown/bell noises (puzzlePlay.ts) could join this channel when a stage holds both (none does).
## Method used / Lessons applied / Method update
Method: predator-kit.md "Wiring a cast into a stage" + the toy-row pattern of w2Cast.test.ts (withTestStage + RealPlay). Lessons: D30
(every time from date), D40 (no clock-fired sounder ahead of its design), D57/D87 (inbox at each push), D59 (no gate left running),
D75 (toys on gen2 rows, not fixtures), D86 (the full list), D88 (plants on the real code), D90 (output to files), D19 (tests call the
engine's own path). Method update (predator-kit.md, proposed): add step 7 "A noise into the cast: castPlay.noise / a SoundPost via
soundLay.ts / SectionPiece.quiet; prove it on a toy row (noiseRow.test.ts); judge 'it came' by s.drawn and goalX, never distance (an
ocelot patrols at 55 px/s)".
## Learned
- The kit's patrol makes "it came near" a false proof; read the kit's own state (drawn, goalX, asleep) at the step.
- A blow's noise must wait for its strike window to close, or a later frame of the same swing could ring a stone after the punch spoke.
## Turnover note
reference/handoffs/engine-core.md §0zq-NOISE (this commit).
