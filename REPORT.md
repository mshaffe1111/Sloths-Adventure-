# F12: 1-2 judged on its own real jumps. Branch `t-12-fly` (base origin/t-int-engine @d0276817), 2026-11-12 ET. No PR.
INT-E's report moved to reference/qa-reports/INT-E/REPORT.md. Everything below: reference/qa-reports/F12/.

## THE REAL NUMBER: `npx tsx tools/engine/library.ts --seeds 120 --par 3`, NO `--flown` (1-2 filed as 1-2)
| | Normal | Easy |
|---|---|---|
| strictly CLEAN (not thrown, no error and no refusing verdict) | **118 of 120 (98%)** | **118 of 120 (98%)** |
| thrown | 0 (EN-W on the base: 59) | 0 |
- **Judged for real this time:** `tools/engine/library-judged.ts`: 240 of 240 rolls carry their own setting's verdicts with no
  `reach.unflown`. The only verdicts not run: `first-run.drift` (1-1's fixed first run) and, on Easy, the two double-gap teach checks
  (Easy lays no double gap). My first version of that check read the wrong field and counted nothing. I caught it, fixed it, and on the
  base commit the same rolls throw at the unflown 230 px double.
- **The two refused** (same on both settings): seed 31, an untyped, unmarked 1,391 px floorless gap (`drop.untyped`, `floor.unmarked`);
  seed 54, pool short at a descent slot (no climb section left), then a 139 px single rise over the band's 80. No rule was loosened.

## 1. 1-2 FLOWN (step 1)
- Flown in the real engine at 30 fps on this base with the Designer's tool (`reference/specs/sims/flight.ts`, brought over from
  t-design-1-2, plus a one-line fix to this base's `pressKeep(easy)`), `FLIGHT_STAGE=1-2`, on both settings: apex, rise, dist, ddist,
  bdist and the chain. Every 1-2 table matches the Designer's saved runs (chain.md §1) to the pixel. Outputs: F12/fly/.
- 1-2's Normal help is `easeAssist(2)` = 0.958 of 1-1's. The double and the bounce plus air jump climb 1-2 px less, the bounce's level
  gap is 1 px less (178), and no other gap moved. Easy on 1-2 equals `easy-any`. Chain bands (chain.md §3) are flown on 1-2 already.
- **As data:** the flown table moved to `src/game/gen2/worlds/flownArcs.ts` (world data, since a Normal scope names its stage) with 8
  `normal-1-2` rows. `ReachScope` is `` `normal-${string}` | 'easy-any' ``, and the stage table's 1-2 row has `judged: 'normal-1-2'`.
  The generality gate PASSES with 27 known entries (it was 29: reach.ts and verdicts.types.ts no longer name 1-1).
- APEX (headroom) stays 1-1's figures, which are 0-1 px higher than 1-2's. That is the stricter way for headroom.

## 3. THE EMPTY RINGS: two causes, both fixed with no new art, each red then green
- **The ring was the bounce mushroom's gold rim, not a pickup.** `engine.ts` drew it 2 px under the cap's top with a 30 px
  half-height. The painted cap filled only its lower half, and the upper half was an empty dark pool with the white cue in it.
  Now the rim takes the cap's own box from its atlas frame (`bounceArt.ts capBox/bounceAuraBox`, every world, and World 8's leaf by
  `w8LeafBox`). No rim is drawn while the cap's picture is not in. Test: `bounceAura.test.ts`.
- **A petal without its picture drew as another flower.** Petal 2 of seed 2 stood in its rim as a red painted passion flower: the
  petal picture loads on its first draw, and until then `drawCollectible` fell through to a World flower or a vector hibiscus. I
  proved it with `flowers=classic` (stills/petal2-before-painted-vs-classic.png). Now a petal-stage flower draws nothing until
  `pickupReady('petal')`. World 8's night blooms are unchanged. Test: `petalDraw.test.ts`.

## 4. Stills: F12/stills/, seed 2 Normal, upright and sideways, sent to the lead before this report
How they were taken: `stills-at.mjs`'s method, with a LOCAL, uncommitted hook (lib12-hook.diff.txt: `?lib12=<seed>` plays the library
roll as 1-2). The game does not build 1-2 from gen2 yet.

## Polish check (I looked at every still as a player on a phone)
- Good: each mushroom glows about its own cap, with the cue above it (x30400, x30823, x31254). Petals read as Meeca's loose pink petals,
  low, and none hangs over a cap or a hollow (x700, x7450).
- **Rough 1:** the checkpoint (x 30602) is laid ON the chain's floor mushroom. Its tall rim around a thin post overlaps the cap's rim
  and still reads mostly empty. This is placement, not done here.
- **Rough 2:** the 80-96 px thorn hollows between pillars read as root columns, not holes (EN-W rough 1, the ground painter). Only
  the first hollow reads as a pit with thorns.
- **Rough 3:** `bloomSprite` (f76) was never built. In my rig, the off-road `fruit` arrive as petals.
- Remaining: a petal may appear a few frames after the stage starts, since it is not in the stage preload (stageSheets keys).

## Checks (final head)
CHECKS_PLACEHOLDER
