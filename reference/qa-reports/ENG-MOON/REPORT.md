# ENG-MOON: 3-4's moving moonbeam and the moonflower step (R-165.503 / R-165.449; Engine, Opus 5.5 high). Branch t-eng-moon-wip, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 1, written 10:00 AM ET Fri 11-27 by `date`)
1. Box 2: `git fetch origin t-eng-moon-wip t-eng-w3 && git checkout -B t-eng-moon-wip origin/t-eng-moon-wip`; `npm ci --legacy-peer-deps`
   (run_in_background). ReadNotifications FIRST.
2. **Re-lay the storey so the steps are EXACT (the open fault below):** in `src/game/gen2/types.ts` SectionZone 'moon', replace
   `steps: string[]` with `{ on: string /* the foot stone */; n: number; rise: number; step: number; w: number }` (data: 3, 100, 120, 120).
   In `src/game/moon.ts` layMoon, LAY the n flowers itself (the moon's own step emitter): step i at x = foot's far lip + i x step
   (mirrored: from its near lip, going left), y = foot.y - (i + 1) x rise, width w, `moonflower: true`, through the pipeline's own `mk`
   (pipeline.ts the zone branch at `z.kind === 'moon'`: pass mk / nextPlatformId in, push onto `platforms` and `placed` like the gap
   catches at pipeline.ts ~2926). The toy section (src/game/gen2/moonLay.test.ts moonStorey) becomes: foot 'stone' w [600, 620] 'start'
   (the walkable floor under the stair: the TEACH's 'first try cannot fail', and 'every flower over its own storey's stone'), top 'stone'
   w [240, 260] placed `{ kind: 'over', on: 'foot', at: [1.0, 1.0], dy: [-400, -400] }` (an 'over' dy is NOT scaled by the tempo,
   pipeline.ts:1646-1649), exitDy -400. Re-run `npx tsx --test src/game/gen2/moonLay.test.ts` and the probe
   (reference/qa-reports/ENG-MOON/probe.mts, run from the repo root with absolute imports fixed up: prints each roll's errors and flower x,y): rises must read exactly 100, steps 120 apart, errors 0.
3. **One beam (swing):** the up tower's storeys do not stand 600 px apart on two walls (probe seed 1: stair centres 550 and 610), so a
   per-section `far` makes two beams. Add a pass after the tower is laid (pipeline.ts, beside the zone shifts at ~3116): every swing moon
   zone of the stage gets the SAME walls [min, max of the swing stairs' centres] and offset 0 (moon.ts `oneBeam(zones)`), then
   moonFlowers reads each flower's windows off the one band (a stair between the walls is lit twice a period: litWindows handles it).
   Drop `far` from the zone. Test: every swing zone's band equal; planted: walls left per-section -> the test is red.
4. Item 3 verdicts (moon.ts + a gen2 verdict wired where darkGaps is read, pipeline.ts): 'every flower's open window >= the flown stair
   time of a 0.5 s reader + margin' (Normal 5.0 s, Easy 6.8 s: read `flowerLeft` at the moment the band reaches the storey's first flower)
   and 'every flower over its own storey's stone' (the foot under it). Planted tests: droop 0 -> red; the beam stopped away -> no flower
   opens -> red; a flower off its stone -> red.
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
- The steps rise 84, not 100: a 'jump' piece's dy is scaled by the roll's tempo (pipeline.ts:1413 `dy *= T.rise`). Step 2 fixes it.
- Swing `far` makes one beam per storey: step 3.
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
