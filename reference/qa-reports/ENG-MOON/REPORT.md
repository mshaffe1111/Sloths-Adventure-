# ENG-MOON: 3-4's moving moonbeam and the moonflower step (R-165.503 / R-165.449; Engine, Opus 5.5 high). Branch t-eng-moon-wip, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 1, written 10:00 AM ET Fri 11-27 by `date`; steps 2-3 done by 10:05 AM ET; box 2 starts at step 4's wiring)
1. Box 2: `git fetch origin t-eng-moon-wip t-eng-w3 && git checkout -B t-eng-moon-wip origin/t-eng-moon-wip`; `npm ci --legacy-peer-deps`
   (run_in_background). ReadNotifications FIRST.
2. DONE in box 1 (10:03 AM ET): the moon lays its own steps EXACTLY (SectionZone 'moon' `{ on, n, rise, step, w, band, far? }`;
   pipeline.ts zone branch lays them through `mk` over the far end of their stone; the toy storey is foot 600-620 + top 'over' at 1.0
   dy -400). moonLay.test asserts rises 100, steps on 120, 120 wide, each stair over its own stone, `st.gen2.errors` empty: 36/36 rolls.
3. DONE in box 1 (10:05 AM ET): moon.ts `oneBeam(zones)` (every swing moon of a stage the same band between the leftmost and rightmost
   stair middles, offset 0), called in pipeline.ts before the layout's shifts (they move it whole); moon.test 9/9 (planted: per
   storey, two beams), moonLay.test asserts one beam on every swing roll. `far` stays on the zone only as the lone storey's far wall.
   BOX 2 STARTS AT STEP 4.
4. Item 3 verdicts: WRITTEN in box 1 (10:05 AM ET), NOT YET WIRED. moon.ts `moonVerdicts(stage, setting)`: (1) every flower opens and
   every open window (BLOOM + its clock's len) >= MOON_WINDOW (Normal 5.0, Easy 6.8); (2) every flower over a stone of its storey (a
   solid non-flower piece under its whole width within 400 px). moon.test 10/10 with three planted reds (droop 0 -> 'open 4.x s, under
   5 s'; the beam stopped away -> 'never opens'; the stone moved off -> 'stands over no stone'). BOX 2 STARTS HERE: wire it where the
   roll's own errors are made on BOTH settings. darkGaps / darkLandings are NOT called from pipeline.ts (grep found only dark.ts and
   tests), so first find how World 3's dark verdicts reach `st.gen2.errors` (`grep -rn "darkFlags\|runOffRims\|litAhead" src tools`;
   the verdict registry, gen2/verdicts.ts or promises11.ts) and add moonVerdicts the same way; then moonLay.test's
   `st.gen2.errors` empty proves it kept, and a planted droop-0 roll proves it red through the pipeline.
5. Item 4 the bot skill `wait-for-light` (firsttimer.ts SKILLS, ~:726; read how tools/engine/towerFly.ts flies a tower): on stone, wait
   until `flowerOpen` of the next step and `flowerLeft` >= the stair time; jump only to an open flower. Then item 5's toys (towerFly in
   the real engine, the up fixture with the moon storey) and item 6's stills (tools/art/kitaudit/shoot.mjs).
6. Engine draw (not started): the beam as a slanted shaft from `moon.mouth` to `bandAt` (moon.ts), and a light in the dark mask
   (engine.ts ~8049, the dark lights loop: push the band's centre with r = half); the flower's three looks (bud closed, open, drooping
   by `flowerDroop`). No flower art in the inventory fits (3-4.md Art: paint it): code-drawn stand-in, NAMED as such, and tell ART-W3.
   'lit = seen': when ENG-ROOT's `litRing` (zones.ts, origin/t-eng-root-wip) lands on t-eng-w3, make it read moon bands through
   moon.ts `bandCovers` INSIDE litRing (one definition), never a second read.
7. Then GATES once on a frozen candidate (D115, src/game/gen2/proven/ writable): tsc; the CI tool line; lockall --check (102 stages,
   counts, no listed stage moves); the suite in 6 shards; tierBots 9/9; generalitycheck. Merge onto origin/t-eng-w3 (no force).

## Done (box 1)
- `src/game/moon.ts`: the band on one clock (clock.ts cyclePos): swing `{ walls, rest, slide, half, offset }` and rise
  `{ x, half, from, to, rise, h, rest, offset }`; `bandAt`, `bandCovers`; `litWindows` (exact: the motion is linear on each leg, windows
  joined across the period's end); `flowerClocks` (BLOOM 0.4 s after the band reaches it, open while lit, `droop` after it leaves, as
  zones.ts LightClocks, ENG-SPORE's ADR-004 type); `flowerOpen` / `flowerLeft` / `flowerDroop`; `MoonDef` (per setting: Easy is the
  design's own numbers, not a stretch); `MOON` (3-4.md's flown numbers); `layMoon`; `moonFlowers(stage, setting)`; move / mirror.
- zones.ts: ZoneKind 'moon', Zone.moon; isStatic includes 'moon' (its rhythm is the beam's, judged by its own verdicts; levelCheck's
  burst rules fired on it: 2 errors per zone, now 0). types.ts: Platform.moonflower. gen2/types.ts: SectionZone 'moon'.
- pipeline.ts: the zone branch lays a moon (and its beat 'S'); the x / y shifts move it; legs.ts mirrors it.
- engine.ts: `moonSteps` read at stage start for the setting; `stepMoon` every frame sets a flower `broken` while closed (he falls
  through, as a crumble).
- Tests: src/game/moon.test.ts 8/8 (the swing's rests and slides, a wall flower's window joined across the wrap, the bloom and the
  droop, a short touch and a stopped beam open nothing, the rise opens bottom to top, two opposite-wall swings are one motion, the
  teach's rest opens for good, a flower in no moon never opens); src/game/gen2/moonLay.test.ts 1/1 (the storey lays in the up fixture,
  rest / swing / rise x both settings x seeds 1-6).
- Pushes: 456bb1afc (core), then this box's head.

## Open faults (named plainly)
- FIXED: the steps rose 84, not 100 (a 'jump' piece's dy is scaled by the roll's tempo, pipeline.ts:1413 `dy *= T.rise`); the moon now lays them itself.
- FIXED: swing `far` made one beam per storey; oneBeam now sets one band.
- Not yet run: lockall, the suite, tierBots, the CI line, generalitycheck. No stills yet.

## For the lead (rule 26: the piece is mine, its placement the kit's)
- The KIND the kit asks for: a section zone `{ kind: 'moon', ... }` (gen2/types.ts SectionZone). It is what ENG-ASKS-b's registry row
  reads (w3.ts:150 `soft: { clocks: { moon: { zone: 'moon', zones: ['moon'] } } }`), so `:#soft@moon` is laid by any section that
  carries it. 3-4's code (AUDIT-W3 codes-trim) asks it on 5 nodes: n2 Tp1^ (rest: the teach), n4 Xc1^ (swing), n6 Wp1^ (rise), n8 Cf1^
  (swing + rise per the design; first cut: swing), n9 Sp1^ (rest, the whole wall). The p beats are mine (the moon storey brick); X c and
  C f are KIT-W3a's rising c / f with the moon zone on them.

## Polish check
- No stills yet (draw not started).

## Pushback
- none yet.

## Lessons applied
- D128 (stamps from `date`: my own sense of the clock ran ~10 minutes fast this box; every stamp here is from `date`), D134 (the next
  step pushed and ls-remote-confirmed first), D140 (ReadNotifications at step boundaries), D150 (the 'lit = seen' seam named for ENG-ROOT's
  litRing, step 6).
