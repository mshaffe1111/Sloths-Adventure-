# gen2-water: deadly water out of the calm well's screen (6-7), and the water gate on every stage

Branch `gen2-water` (from `engine-mixer` 021ef4e9). The water rule W3 (ENGINE-SPEC.md on `engine-spec` da0e5ba4): calm and deadly
water never share one screen. The research (`research-water-swim` f549a124, WATER-SWIM.md M10) measured 6-7 failing it on all 16
rolls: deadly dirty water 483-634 px from the calm well.

## Root cause (file:line on engine-mixer 021ef4e9)

- The swing perch past each liana is laid with black water under it: `src/game/gen2/worlds/w6Swing.ts:178` (`perch`, `water: true`),
  and the pipeline lays nothing under a water gap: `src/game/gen2/pipeline.ts:565` (the `land` gap pushed with `water`) and `:951`
  (`if (g.pit && !g.water)`: no pit). That open column is what `waterY` (`pipeline.ts:1731`) shows and kills in.
- The well is 6-7's required room (`w6Rooms.ts:324` `W6R_STAGE`); the only rule the pipeline had near a room was a quiet join into it
  (`pipeline.ts:869`). Nothing kept the swing sections either side of the room from laying their water gaps within a screen of it.
- So on every roll the first swing after the room (and on 9 of 16 the last one before it) put black water 483-634 px from the well.

## The fix (in the builder; no stage hand edits)

- `src/game/waterRule.ts`: one measure for every builder. Calm pools from the room specs (swim.ts kitPools' rule); deadly = an open
  column over `waterY` or a river that is not a teaching one; `W3_SCREEN` = 1,203 world px.
- **Why 1,203 and not 844 (stricter than the brief; the designer should ratify):** 844 is the phone's width in CSS px. The engine shows
  a world 540 px tall sideways (`engine.ts:224` `WORLD_VIEW_H`, `applyZoom` :1103), so an 844 x 390 phone shows 1,169 world px across
  (measured in the stills: screen x 6918-8087, zoom 0.72) and Matt's Pixel (998 x 448) 1,203. At 844 the two waters would still be on
  one screen. 1,203 also keeps the spec's > 844. It is one constant if the designer rules otherwise.
- `src/game/gen2/pipeline.ts` `layDry` (:1679): the stage is laid; each gap with an open column within a screen of a room's calm pool
  is laid again dry (`LayLocalOptions.dry`, :456): soft mud, the swing's pit climbing back to its own ledge (`backPit`: the swing stays
  required). Repeated until none is left. The plan, the versions and every other gap stay the roll's. `checkStage` (:1797) names any
  miss left, so a roll it cannot mend is repaired or rerolled, never shipped.
- The rule's exception ("unless a bank divides them and both are taught, with Pokey's two-waters line") is not built: no stage has the
  line (it would need Matt's approval), so there is no case for it to pass.

## Proof

| Check | Result |
|---|---|
| 6-7, 16 rolls x Normal and Easy (`waterRule.test.ts`) | **32/32 pass**: nearest deadly water 1,931-4,325 px from the well (was 483-634); same plan and layout seed as curated on all 32; 0 levelCheck errors. Fails on the old builder (seed 186666 first) |
| W6-W8 regression lock (`tools/engine/gen2snap.ts`, 21 stages x 32 builds) | **640/672 unchanged**: every build of the other 20 stages identical. 6-7 32/32 changed, each explained below |
| Curation's filters and jump bots on the 16 shipped 6-7 rolls, base vs fix (`tools/gen2/curate.ts` measureRoll + botCheck) | 0 fails before and after; adult bot (Normal) unchanged on all 16 (worst 0.94); kid bot (Easy) worst 0.89 (floor 0.85), within ±0.02 of base per roll; every liana still swung; quick player, model time, dead time and quiet stretches identical on Normal |
| 60 fresh 6-7 rolls (seeds 1000-1059, Normal and Easy: what a future curation draws from) | fix: **0/120** builds miss W3, 0 levelCheck errors, 0 rerolls; base: 116/120 miss |
| W7, the teaching pool (`waterRule.test.ts`) | within a screen of the well on all 32 builds: no animal, no zone, no crumbling tile, only soft falls |
| The water gate (`tools/validate/watercheck.ts`), all 102 stages x 16 layouts x 2 settings | **PASS, 3,264 builds in 561 s**; on the base it fails 6-7 on 32/32 (483, 507, 511, 631 px ...: the research's numbers) |

**Every 6-7 fingerprint change, object by object** (full builds of base and fix diffed, `generateStage` + `withGoals`/`easyStage`):
- **Normal (16):** the 1-2 water gaps within a screen of the well become soft (`falls` kind water -> soft), and under each a mud floor
  (`moss_stone`, 90 px deep) and one step back up to the swing's ledge are added: +2 or +4 platforms, nothing else moved (every other
  platform identical, width identical). Downstream of that, the shared finish passes (`stageGenerator.ts` finishStage: petal arcs, finds,
  the heart by every second flag) re-place a few petals (+0..4 / -0..6) because the gaps under them changed; on one roll (layout 6) the
  first water warning sign (and its hint) moves from the old first creek (x 5236) to the first one now left (x 9088). Enemies, vines
  and flags unchanged on all 16; hints unchanged on the other 15. `kit` changes on the 9 rolls with a dried gap before the room: the
  pit's two blocks are numbered before it, so the room's anchors name platform ids +2 (every anchor's spot the same). `proto` changes
  are the dressing pass (`addDress`, run after the pickups): a few props re-placed where the petals moved, and the new pit floors
  dressed (wet leaves and a snail rock on the dried pit in layout 2: the rock in `sideways-x7354-after.jpg`).
- **Easy (16):** the same dried gaps (Easy's pit has two steps: +3 or +6 blocks), and the perch past each dried swing moves 6-14 px
  (Easy's wider perch is pushed clear of the pit's steps, `pipeline.ts` `minFor`, so a jump from a step can't skip the swing), so
  everything after it shifts by that much: every changed platform is a base platform shifted by 6-14 px (or -4 to -11 where the band
  moved it in), 0 unexplained. Pickups, enemies, flags, vines and the room shift with it.

## Polish check (stills at 390x844 and 844x390, dpr 2; layout 1 = seed 383373; `tools/qa/wellShots.cjs`)

| Shot | What holds each thing up / what it tells the player | Verdict |
|---|---|---|
| `sideways-x7354-before/after.jpg` (Pokey by the root door, the old first water after the well) | Before: the calm well (left) and the foaming dirty water (right) on one screen: two opposite meanings in one view. After: the swing's gap is a dip: the step (a moss-stone block) stands on the pit floor, the floor spans the gap, both banks reach down to it. It reads "a dry dip; the step goes back up to the ledge" | pass, with the note below |
| `sideways-x6369-before/after.jpg` (between the old water before the well and the well) | Before: dirty water bottom left, the well right. After: no dirty water; the perch bank now reaches down to the pit floor (squared face) | pass |
| `sideways-x5725-after.jpg`, `upright-x7840-after.jpg` (Pokey standing in each dried pit) | The floor holds him; the step at the take-off side leads back to the swing's ledge; the far wall is too high (the swing is still needed, bots: every liana swung) | pass |
| `easy-sideways-near-before/after.jpg`, `easy-upright-near-*` (Easy, the same spot +7 px) | Before: dirty water beside the well on one screen. After: the dried pit steps down in two painted steps (Easy's smaller hop) to a dressed floor (snail rock, stump); nothing deadly on screen | pass |
| `*-swim-*`, `*-bank-*` | The well itself and its banks: identical before and after (the room was not touched) | pass |

**Named rough spots (not hidden):**
- The pit's step is gen2's generic moss-stone block (`pitUnder`), the same piece every World 6 soft seam already uses, so it matches
  what ships, but a stone block in a mangrove is not the best fit. A painted root step would be better: an art ask for the lead (no HF
  spent).
- A dried perch's underside, which used to curve over the water, now reads as a squared column of root-earth down to the pit floor
  (`pitUnder` `deepen`, the shared rule that stops a fall slipping under a bank). It is the look every soft pit's banks already have.

## Not done / found on the way

- `src/game/artUse.test.ts` fails on this branch **and on its base engine-mixer 021ef4e9** (six unused World 1 pieces in
  `w1NewArt.ts`: squirrel-haul, squirrel-run, root-gate-open/-shut, knot-a/-b). Not from this change; not allow-listed (that would loosen
  the gate). Owner: the engine-mixer builder.
- The calm-drawn half of the gate (water drawn with the calm art that costs a life) has nothing to catch today: no builder on
  engine-mixer emits `proto.water` (1-1 builds with none). It is proven on a fixture, and will catch engine-render's 1-1 creek the day
  a builder emits it.
- No other stage in the game has calm water, so the known list starts empty (nothing outside W6 misses).

## PAUSED 2026-11-05 ~12:50 PM ET (the lead: Matt at 60% of his week; resume after 1-1 passes tonight)

Where it stopped, and what is left, in order:
1. **W3 fix and gate:** done and pushed (above). Gates not yet run on the final head: **drawcheck and clipcheck** (stopped mid-run
   for the pause; drawcheck had passed 1-4, 2-6, 3-3 with no breach printed). Run both before the report.
2. **The first-timer bot on 6-7**, base vs fix: script ready (seeds 1-3, kid Easy and adult Normal, trials 0-1), not run.
3. **The designer's rulings (engine-spec 2f4d708ad):** (1) W3_SCREEN from the engine's own zoom at the calm pool (room, swim and stage
   zoom) over the widest sideways shape the game supports, recorded in waterRule.ts; 1,203 is the floor, never lowered. (3) the dried
   pit's step drawn with W6's painted lowStump or hollowStump (w6.ts:143, :147) on the pit floor, not the generic moss-stone block;
   if neither can be a landing, say why (art ask). Then re-shoot stills, Normal and Easy, upright and sideways.
4. **The designer's floating slabs in 6-7's water room** (w6Rooms.ts:8-19, :108-110: the root shelf with Dot's stone pile reads as a
   grey slab in open air upright): find what draws it, fix in the kit or room placement, stills. Not started.
5. **The lead's swim speed: 1.25x the run** (swim.ts:35, data where the speed lives), then the W6-W8 lock and explanations, bank exits,
   W5 legs, no wall clipping, jump bots and swim behaviour, and clips of the well and a ~1,500 px scratch pool. Not started.
6. The 10-line report to the lead (planned vs actual: started 11:25 AM ET; paused at about 1 h 25 min).
