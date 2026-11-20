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
1. One channel, the three makers, the quiet field: above; generality PASS (26 literals, 26 known: none new). 2. Toys on gen2-laid rows (gen2/noiseRow.test.ts; toy World 3 kit, rows laid by buildGen2Stage, played in RealPlay at 30 fps):
| Toy | Green (b85e5aee0) | Plant on the REAL code (piece broken, run, restored) |
|---|---|---|
| struck stone calls a kit ocelot | drawn 0.07 s after the press, goal = the stone's x, from 588 px, under it at 5.67 s (closest 5 px); channel heard [bell] only | stone's ring call removed: RED (never drawn). "Only its sound" off (punch heard too): RED |
| punch wakes a sleeper in 240 px | 200 px: woke; 300 px: slept; heard [punch] once | punch noise removed: RED (sleeps on) |
| 400 px drop: moss vs stone, sleeper 300 px off | moss: heard [], slept; stone: heard [landing] (r 360), woke | landingNoise ignores the ground: RED (moss wakes) |
Each plant is also kept in the file as a stubbed case. castNoise.test.ts (no engine): the ladder (worlds 1-2 hear no blow, 3-4 do), the
order (landing, punch, bell), a stage-fired ring draws an ocelot, soundAt's edges, quiet ground silent for any fall, a flag clears it.
3. Gates, every CLAUDE.md item once on b85e5aee0 (long runs in the background, output to files; nothing left running):
| Gate | Result |
|---|---|
| tsc; build (BASE_PATH) + chunkcheck; artcheck; knowncheck; generality; roadmapcheck | PASS each |
| suite, 3 shards | 3,948 tests: 3,946 pass, 0 fail, 2 TODO (already there: 4-3's boulder wall); noiseRow + castNoise in it, green |
| drawcheck (706 s); clipcheck (365 s, 83 known); kbdcheck; buildcheck | PASS each |
| engine tool tests; tierBots | 37 pass; 7 pass (identical: nothing recommitted, no 1-1 change) |
| seedlist --check, EVERY list (registrycheck --lists: 12) | 12 of 12 PASS (1-1..1-9, 2-1, 2-2, 2-4; each list clean on both settings) |
| funcheck | FAIL 30 worse/new, 41 to lower: BYTE-IDENTICAL on the base 8efb1bba (run there, diffed): none new or worse from this branch |
| lockall --layouts 16 (3,264 builds) | mine == base 8efb1bba, every build; vs main 6e7b85f8 = base vs main exactly (int-13's 17 stages: 1-6..1-9, 2-1, 2-2, 2-4, 3-8, 4-4, 6-1, 6-3, 6-6, 6-7, 7-5, 7-9, 8-3, 8-5) |
Nothing shipped moved: no shipped stage lays a sounding thing or a quiet piece, and no World 1-2 cast hears a blow.
## Polish check
Nothing drawn changed: no new art, sprite, screen or text; nothing to shoot upright or sideways (drawcheck/clipcheck PASS). ROUGH,
NAMED: a struck stone has no look yet, and its ring is a STAND-IN sound, `sound.playShrineUnlocked()` (the puzzle bell's ring) plus a
0.04 s hitstop, until the chime's own sound and look (ENG-LURE).
## Pushback
- "lockall vs main": t-int-13 already differs from main on 17 stages, so the lock was taken on main AND the base (table).
- "His punch" = every blow (punch, kick, mega): one noise a swing. The lead ruled: kept (every blow is heard from World 3 on).
- "Fired by the stage as data": built as the API (`ring`), not a clock-fired SoundPost: no design names its timing yet (D40).
## What the 3-3/3-5 builders need
- A sounding thing: a world row in its kit (`soundProps({ chime: { w, h, looks } })`, `emit: soundEmitters(rows, note)` for the look),
  a section socket `soundSocket(id, piece, t)`. Its box (w, h) is what a blow must reach: size it to Pokey (his drawn height 89.1).
- Moss: `quiet: true` on the section piece; give it a moss look by style/slot (quiet draws nothing). A brief must still name the cast.
- Numbers: punch r 240, bell r 680, landing soft 200 / min 180 / 0.9 per px / max 560 (heroNoise.ts LOUD); hearY 360 up or down.
- Bots: firsttimer.ts has no skill for any of this yet (3-3 ring-to-call, 3-5 quiet-route are their own packets).
## Unresolved
- funcheck is red on t-int-13 itself (above): the integration's, not this branch's; the lead's to route.
## Suggestions
- ENG-LURE as in 3-3.md NEW 1, plus a recorder event for a ring and a punch noise (CastStep.heard has them) with a counting test (D38).
## Method used / Lessons applied / Method update
Method: predator-kit.md "Wiring a cast into a stage" + w2Cast.test.ts's toy row (withTestStage + RealPlay). Lessons: D19, D30, D40 (no
clock-fired sounder ahead of its design), D57/D87, D59, D75, D86, D88 (plants on the real code), D90. Method update (predator-kit.md,
proposed step 7): "A noise into the cast: castPlay.noise / a SoundPost via soundLay.ts / SectionPiece.quiet; prove it on a toy row
(noiseRow.test.ts); judge 'it came' by s.drawn and goalX, never distance (an ocelot patrols at 55 px/s)".
## Learned
- The kit's patrol makes "it came near" a false proof; read the kit's own state (drawn, goalX, asleep) at the step.
- A blow's noise waits for its strike window to close, or a later frame of the same swing could ring a stone after the punch spoke.
- `registrycheck.ts --lists` only PRINTS the lists (my chain ran it as the check: 0 s, caught on reading the time); the check is the
  CI loop, `seedlist.ts <id> --check` per printed id. gates.md row 8 could show the loop as one copyable line.
Turnover note: reference/handoffs/engine-core.md §0zq-NOISE.
