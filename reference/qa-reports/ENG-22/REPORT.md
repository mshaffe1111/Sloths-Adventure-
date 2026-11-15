# ENG-22 REPORT: sinking pads in play, laid by gen2, bot pad skills. STOPPED on the lead's 12:52 PM ET priority (Matt at 80%; 2-2's engine paused to Wed)
Branch t-eng-22 from origin/t-eng-w2b (19537789) + merge of origin/t-meter-2a (084ddf20: its clock read, ride channel, coveragecheck;
conflicts: gates.yml took both tool-test lists; engine-core.md kept both 0zd sections, METER-1's as 0zd-m). Worked 12:24 to 12:48 PM ET.
Method used: level.md Building rules 21-29 (toys first), stage-fix.md. Lessons applied: D19 (the toys roll through gen2 and the game's listed
path, the real engine), D43 (nothing names a stage: the pad piece and lay read data only), D53, D57, D59 (no job left running), D69 (each
toy's no-skill run measured RED before any skill), D75 (proven on a gen2 row, not a fixture page).

## Done (heads named)
1. **Pads in play** (commit "ENG-22 (1a)", the branch's first after the merge c475f0f0): ride.ts `Pad` (data: weight or beat, its clock, its look slot); `stepPad` now
   LATCHES a pad that sinks under him (planted red first: ride.test.ts "a pad that sinks under him stays down RIDE.padRise", was 0.03 s: the
   pad popped back up under his falling feet; green after). pieces/padPiece.ts (PAD_PIECE on the piece hook, run beside the carriers): broken
   while down (no floor; a riding petal hidden with it via ridePickups rideHidden), draws through riverArt.ts `drawPad(look, ...)` (the look
   slot: today the painted lily with a shiver, a dip and a faint under-water state; ART-W2 fills 'small'/'big'/'beat'), every pad up on a
   respawn. engine.ts: two one-line skips (the sine loop, the lily loop). types.ts: `Platform.pad` (an Architect-owned type: added because the
   packet asks for pads by data; flag for the Architect).
2. **Laid by gen2** (e8edca1f): place `pads` (gen2 types; WorldManifest.pads) lays still water + a row of pads and stones between two level
   banks (rideLay.ts `layPads`, `PAD_SIZES` small 130 px 1.0 s / big 260 px 2.0 s, shiver from 0.5 / 1.2 s; a beat row's own breath; Easy x1.5),
   clocks listed with the stage's, petals ride pads (Collectible.rides). `padFaults` in checkStage: hold >= 1.0 s, shiver >= 0.4 s, whole again
   within 4 s, every water a hop (<= 160 px) and >= 20 px, no floor under 124 px, a beat run crossed inside one breath at 230 px/s + 0.3 s.
   It caught my own 120 px stone (now 136). w2.ts `W2_PADS` (first, hop, back, breath, deep) from 2-2.md: data, NOT yet in World 2's manifest.
3. **Bot skills** (0d7520b4 + this commit): firsttimer.ts `PAD_SKILL` {keepHopping, waitRise, breath} and `padRead` (a pond hop pressed where
   any hold lands; keep-hopping: no pause, stand or thumb gap on a pad, go on its shiver; wait-for-the-rise; cross-on-the-breath read at the
   rise and committed through his reaction). Toys: tools/inspect/padToys.ts + padRide.test.ts (keep, rise, breath ponds over deep water).
   Measured (seed 1, lives at the pond, bar <= 1): with NO pad skill all 12 runs RED (5-23 lives). Last run with skills on (12:47 PM):
   keep 0/0/0/0 GREEN, breath 0/0/0/0 GREEN, rise middle-N 0, child-N 1 GREEN, **middle-Easy 2, child-Easy 4 RED**.

## Known reds / half-built (UNRUN on the lead's stop)
- rise toy on Easy (above): the trace shows the child walking onto a big beat pad already shivering (started late on a stretched breath) and
  once walking off the stone's far end; not fixed.
- Each skill's own plant (skill off -> red) is UNMEASURED with the final code (only the all-off run is). padRide.test.ts has the plants.
- No unit test for place `pads` / padFaults plants / padPiece in the real engine (planned: src/game/gen2/padSection.test.ts, modelled on
  riverSection.test.ts). padRide.test.ts and ride.test.ts are not in gates.yml yet (ciTests.test.ts will name padRide.test.ts).
- Gates UNRUN: full suite, lockall, seedlist --check, coveragecheck (pads are a new piece: meter-coverage.json needs 'pad'), no stills.
- Not built: a pad row in a leg laid LEFT (throws by name, as rivers do): 2-2 beat 4's there-and-back needs it; no reeds at pad ponds
  (w2Finish skips still water it did not make).

## EXACT NEXT STEP (engine member, at the reset)
1. `npx tsc --noEmit -p .`; `npx tsx --test src/game/ride.test.ts`; probe: `npx tsx --test tools/inspect/padRide.test.ts` (~40 s); fix the
   rise toy on Easy in firsttimer.ts padRead (re-read the breath left at the step onto the pad; stop at the stone: a stone is `next` too).
2. Measure each plant (padRide.test.ts runs them); paste on/off numbers here (level.md rule 21).
3. Write src/game/gen2/padSection.test.ts (place width/level/ask 'ride'; pads + clocks laid; each padFaults rule planted; a pad sinks and a
   beat row breathes in RealPlay); add padRide.test.ts to gates.yml's tool-test line; 'pad' to reference/design/meter-coverage.json.
4. Gates once: full suite, `npx tsx tools/engine/lockall.ts --layouts 16 --check <lock of 19537789>` (expect no stage moved: no stage lays
   pads yet), `npx tsx tools/engine/seedlist.ts 2-1 --check` and 2-2.
5. Then the 2-2 builder (data only): `pads: W2_PADS` in World 2's manifest; sections with `place: { kind: 'pads', after, row }` per 2-2.md's
   node string; ART-W2's pad art (origin/t-art-w2) into drawPad's look slots.

## Polish check
None shot (stopped before stills). The pad's sinking look is code-moved painted lily until ART-W2's art is wired: named, not judged.

## Learned
- A bot's look-ahead (80 px) is wider than a pond's water (70 px): it walked off pads into the water seeing "ground ahead". Narrow-gap hops
  need a flown press point (press where a tap AND a full hold both land), not the edge read.
- A fairness rule and the bot must share one number: the bot added his walk to the edge to the run padFaults passed and waited forever.

## Turnover note
reference/handoffs/engine-core.md NOT rewritten (stop order); this REPORT stands in for it.
