# ENG-MOON: 3-4's moving moonbeam and the moonflower step (R-165.503 / R-165.449; Engine, Opus 5.5 high). Branch t-eng-moon-wip, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 2 hand-over, written 10:29 AM ET Fri 11-27 by `date`, refreshed 10:32 AM ET; box 3 starts at step 3, the draw)
1. Box 3: `git fetch origin t-eng-moon-wip t-eng-w3 && git checkout -B t-eng-moon-wip origin/t-eng-moon-wip`; `npm ci --legacy-peer-deps`
   (run_in_background). ReadNotifications FIRST: the lead may have ruled on the SWING GEOMETRY (below); its ruling wins.
2. DONE in box 2:
   - R-165.537 (3fb22a84d, sent to the lead on its own): WorldManifest.verdicts (gen2/types.ts) names a world's own judges from ONE registry,
     gen2/worldVerdicts.ts WORLD_VERDICTS (darkGaps, darkLandings, darkFlags, moon); pipeline.ts runs worldVerdictLines into gen2.errors in
     buildGen2StageOn (after `also`) and in Easy's Normal build (as `also`). w3Manifest declares all four. worldVerdicts.test 3/3: planted
     through the real pipeline (3-1 seed 1 with its glowworms lifted 3000 px: darkGaps lines refuse it on both settings, off the manifest
     they do not; a moon storey with steps 300 apart: 'stands over no stone' refuses it, off the manifest not; the 120 stair clean).
     NEWLY REFUSED (tools/inspect/worldVerdictScan.ts 3-1 1-60): NONE; counts: 117 clean both ways, 0 newly refused, 3 refused already.
   - Item 4 (b0701fd58): firsttimer.ts SKILLS.waitForLight + moonWait (after glowWait in the step: grounded, the flower one rise over his
     feet (MOON_UP 60-140) within MOON_REACH 260 on his way, he stands until it is open with flowerLeft >= steps-left x MOON_STEP_T 0.8 +
     stopReact; MOON_GIVEUP 20 s). moonBots.test 1/1 in the REAL engine on a RISING storey (up fixture '5-94', placed on the lowest
     storey's stone the frame its first step closes): skill on waits 47 frames, 0 steps into a closed flower, climbs past the storey;
     planted, skill off: falls through 1 (RED).
   - A FINDING sent to the lead (ruling asked; my reversible recommendation taken at 20 minutes): in a stacked shaft, oneBeam's walls (the
     stair middles) collapse to ~70 px, so a swing's flowers are open for good (len Infinity); the far-wall alternative leaves the stairs
     mid-shaft, lit 1.75-1.92 s, refused by the 5.0 s window. The geometry is the fault: a swing needs its storeys' stairs at OPPOSITE
     shaft walls >= ~520 px (Normal) / 720 (Easy) apart. RULED by the lead: oneBeam UNCHANGED (box 1's); the kit lays the stairs at
     opposite walls (KIT RULE M1, 'For the lead' below); the verdict 'a swing flower never closes' is MINE: DONE in box 2 (moon.ts
     moonVerdicts; moon.test 11/11, planted: the stacked swing RED by name on both settings, opposite walls clean on every verdict). The
     bot toy uses 'rise' because the fixture stacks its storeys.
3. THE DRAW (not started; scoped in box 2), engine.ts:
   - FOUND in box 2: litRing is NOT on t-eng-w3 (f79963053 has no litRing; it is on origin/t-eng-root-wip zones.ts:139): the lit read
     waits for ENG-ROOT-c's landing; do the draw first. PAINTED moon art EXISTS (the puzzle room's moonflower, puzzlePlay.ts:2655
     drawMoon): drawNightPiece 'moonBud' (60 x 187 sheet, k 0.600) and 'moonOpen' (168 x 190, k 0.620), meecaNightData.ts:43-44. Use
     THEM for the step's bud and open looks (one definition; check inventory.ts / the master catalog labels them for World 3 first,
     R-165.104) over the 120 x 22 tread; only the DROOP has no art (a tilt and dim of moonOpen: a code transform of painted art, NAMED;
     ART-W3 paints a real droop). The moonflower steps are 'stone' pieces drawn by the terrain painter today: decide whether the tread
     stays painted stone with the flower over it (paintcheck then unchanged) or the flower replaces it (paintcheck must stay green).
   - the lit read: in the dark lights loop (engine.ts ~8056, `for (const z of this.currentStage.zones ?? [])`), for z.kind 'moon' push
     bandAt(z.moon.band[setting], gameTime) as a light (x, the band's middle y, r = half). BUT check first whether ENG-ROOT-c has landed
     litRing (zones.ts) on t-eng-w3: if it has, merge t-eng-w3 and make litRing read moon bands through moon.ts bandCovers INSIDE litRing
     (ONE 'lit = seen' field, R-165.529); never a second read. The loop only runs while darkShow > 0.01 (dark zones only): a moon outside a
     dark zone needs its own glow (say so if 3-4's moon is not inside a dark zone).
   - the shaft: a code-drawn STAND-IN, NAMED as such: a soft slanted quad from moon.mouth to the band's top (gradient, alpha <= 0.25,
     one path; PERFORMANCE-RULES §1: no per-frame gradient creation, cache it).
   - the flower: code-drawn STAND-IN (no flower art in the inventory fits; 3-4.md Art: paint it): bud closed (a small shut bud on its
     stem), open (petals over a 120 x 22 tread), drooping by flowerDroop (petals fold down, colour dims). Find where a broken crumble is
     skipped/drawn (grep 'broken' in engine.ts draw) so a closed flower draws as the bud, not nothing.
   - Tell the lead what ART-W3 paints: moonflower 3 looks (bud / open / droop), each 120 x ~60 px at ship size (tread 120 wide, 22 deep,
     petals over it), and the beam's shaft (a tall soft light, ~440 wide at the band (2 x half), ~520 tall from the mouth), painted on HF.
4. STILLS (tools/art/kitaudit/shoot.mjs), upright and sideways: the beam over a storey, a drooping flower beside Pokey; each still names
   its draw path ('code-drawn stand-in').
5. GATES ONCE on the frozen candidate (D115, src/game/gen2/proven/ writable): tsc; the CI tool line; THE LOCK AS TWO RUNS (CI #100):
   `npx tsx tools/engine/lockall.ts --layouts 16 --out base.json` on origin/t-eng-w3's head (box 2's base.json was in its own container's
   scratchpad: re-run it), then `--check base.json` on the candidate, WITH its counts line; no listed stage moves (World 3 has no list);
   the suite in 6 shards; tierBots 9/9; generalitycheck. Then merge onto origin/t-eng-w3 (no force, never rebase), re-run tsc and the
   lock check after the merge; hash, shard totals, stills to the lead.

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
- Not yet run: lockall (base run started in box 2, not compared), the suite, tierBots, the CI line, generalitycheck. No stills yet.
- Box 2: the swing geometry in a stacked shaft (see the EXACT NEXT STEP, 2): a swing's flowers open for good when its storeys' stairs share a column; ruling asked.

## For the lead (rule 26: the piece is mine, its placement the kit's)
- KIT RULE M1 (the lead's ruling, box 2): 3-4's swing storeys (n4 Xc1^, n8 Cf1^) are laid with their stairs at OPPOSITE walls of the
  shaft, their stair middles at least 2 x half + 2 x 40 pad apart: 520 px on Normal (half 220), 720 px on Easy (half 320). Stacked in one
  column, the one beam never leaves them, and moonVerdicts refuses the roll by name ('never closes: its swing's beam never leaves it').
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
- Box 2: D153 (the lock gate spelled out as two runs with its counts line; not yet compared), D140 (ReadNotifications at each step), D128
  (every stamp from `date`; my sense of the clock ran ~5 minutes fast again), D145 (the swing's geometry judged by the flown window, not by
  a number from memory), D143 (a ruling asked with my own reversible recommendation and a 20-minute clock).
- D128 (stamps from `date`: my own sense of the clock ran ~10 minutes fast this box; every stamp here is from `date`), D134 (the next
  step pushed and ls-remote-confirmed first), D140 (ReadNotifications at step boundaries), D150 (the 'lit = seen' seam named for ENG-ROOT's
  litRing, step 6).
