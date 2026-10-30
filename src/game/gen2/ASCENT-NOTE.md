# gen2's upward flow (piece C): where it stands

Written 2026-10-29, 8:40 PM ET. The work stopped here on the lead's word: Matt is redesigning Worlds 9 and 10, and most of the World 7-10
climbs may become other kinds of stage. Nothing here is hooked into the game. No stage uses it yet.

## What it does (built, `tsc` clean)

- **Branch base.** `gen2-ascent` sits on `origin/gen2-w9`, not on the base branch. The plan was to build World 9's climbs on its kit, and
  merging gen2-w9 into the base hits 24 conflicts in W9's art code. Merge it after gen2-w9.
- **`missionGraph`** no longer refuses an ascent. It returns the usual spine with `flow: 'up'`.
- **`layStage`, for `flow: 'up'`** (in `pipeline.ts`, with the helpers in `gen2/ascent.ts`). It keeps the same bags, cooldown, themes,
  sockets, repair loop and length loop. The climb zig-zags up a column (`ASCENT.column`, 2,400 px), the shape of 6-8 Stilt Climb:
  - **Rows.** Sections are laid across the column the way the row heads. On the way back each section is laid end to end turned
    (`worldX`), and its sockets read from the other end.
  - **Turns.** A section with `turn: true` sits at a row's end: a climb up to a shelf that runs back over it (`over` with `align: 'end'`).
    The next row starts from that shelf's far end and heads the other way.
  - **Clearance.** Every row is kept `ASCENT.clear` (250 px) clear of the rows under it, and of earlier lianas' ropes (`clearOf`). A
    turn lifts its climb until its shelf, plus `ASCENT.ahead` px on, is clear. A row's section that doesn't fit the column or the
    clearance is passed over at that slot. When nothing fits, the row turns.
  - **Catches.** There's a catch under every gap (`catchGaps`, STAGE-RULES §2 "Falls in climbs"): a ledge 90 px under a hop's gap, or a
    shelf 240 px under a liana with a vine back up to the swing's ledge. A gap with nothing within `ASCENT.maxFall` (450 px) under it is
    marked `deep`. Only a deep gap is deadly (`falls`, the water/lava warning).
  - **Easy.** Easy lays Normal's plan. Its wider landings reach back over their gaps (`padBack`), so the rows stay where Normal's are.
  - **No pits.** The stitcher lays no soft pits, and banks are their own depth: nothing runs down through the rows under them.
  - **Shift.** The climb is laid from y 0 upward, then moved to the bottom of a level just tall enough (`shiftAll`).
- **The later passes** read progress along the climb (`Laid.along`) where a horizontal stage reads x: flags (each one also higher than
  the last, as the engine needs), the opening seconds, the animals' spacing, the dead stretches and the warnings. Tips and warnings get
  a height band (`aboveY` / `belowY`), and on a row heading left they get `beforeX`.
- **Time model.** The climb's steps go to `meta.ascentChain`, which `stageTime.ts modelAscent` already reads. `gen2Model` leaves ascents
  to it.
- **Toy proof.** `gen2/toyClimb.ts` is a 5-section climb world. On it, seeds 1-12 pass levelCheck on Normal and Easy at 220-240 s
  typical (scratch runner, not yet a test).

## Not done

- No test file yet. The next one would be `ascent.test.ts` on the toy climb: levelCheck, the clock, rows clear of each other, a catch
  under each gap, and Easy laying Normal's plan.
- Not hooked into `game.ts`. There are no world climbing sections, no rising lava, no camera zoom, no curation and no screenshots.
- The inspector's `sections` view reads `proto.beats` by x, so it misplaces an ascent's sections. That is a report-only problem.
- Seen on the toy world: a narrow kit gives runs of turns in a row (a vine ladder). A real kit needs short sections (500-900 px) and a
  narrow rest.

## What it would take to apply it to a world (for example 7-8, 8-7, 10-8)

1. **Climbing sections** in `worlds/wNClimb.ts`, with `flow: 'up'` and archetype `ascent`.
   - About 15 of them, 500-900 px wide, each rising: shelves to hop up, a long shelf for the world's animals, a liana up to a perch, the
     world's hazards through its socket tags, and a narrow rest with a flag.
   - Plus 2-3 turns: a vine up to a shelf running back, and a stack of hops.
2. **What costs a life on Normal.** Catches make every miss a climb back. The danger has to come from the world: a rising hazard (6-8's
   `risingTide.ts`, with its lines and front drawing made world-aware), hazard props, and animals.
3. **A game entry** in `game.ts`, with the world's `Finish` (which moves a vine `CLIMB_CLEAR` out from a ledge's face). Then 6-8's camera
   zoom for climbs (`STILT_VIEW`), curation (`--apart-near`, the bands tool), and stills upright and sideways.
