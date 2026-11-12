# F12: 1-2 judged on its own real jumps. `t-12-fly` (base origin/t-int-engine @d0276817), 2026-11-12 ET. No PR.
INT-E's report is now at reference/qa-reports/INT-E/REPORT.md. Proofs: reference/qa-reports/F12/.

## THE REAL NUMBER: `library.ts --seeds 120 --par 3`, NO --flown: **118 of 120 strictly clean (98%) on Normal AND Easy**, 0 thrown
- Counted strictly: not thrown, no error and no refusing verdict. Every roll is judged on its own setting's verdicts (`library-judged.ts`:
  240 of 240 with no `reach.unflown`). The same rolls throw on the base, at the unflown 230 px double. My first version of that check read
  the wrong field and counted nothing; I caught it and fixed it. It still reads 118 after `chain.mount` was added.
- Refused, the same on both settings: seed 31 (an untyped, unmarked 1,391 px floorless gap) and seed 54 (pool short at a descent
  slot, then a 139 px single rise over the band's 80). No rule was loosened.

## 1. Flown
- Flown in the real engine at 30 fps on this base with the Designer's `reference/specs/sims/flight.ts` (`FLIGHT_STAGE=1-2`, both
  settings: apex, rise, dist, ddist, bdist, chain). Every 1-2 table matches chain.md §1 to the pixel (F12/fly/).
- 1-2's Normal help is `easeAssist(2)` = 0.958 of 1-1's. The double and the bounce plus air jump climb 1-2 px less, and the bounce's
  level gap is 178 (1 px less). No other gap moved. Easy on 1-2 equals `easy-any`.
- **DATA:** the flown table moved to `src/game/gen2/worlds/flownArcs.ts` (world data) with 8 `normal-1-2` rows. `ReachScope` is
  `` `normal-${string}` | 'easy-any' ``, and the stage table's 1-2 row has `judged`. The generality gate: 29 known entries became 27.
- The tests that used 1-2 as "never flown" now use 1-4. `builtOnArcs.test` now proves the real case: the old builder still lays the
  shipped 1-2, and it stays on the closed form.

## R-165.138 (the lead): `chain.mount`, red then green
A bounce cap with no cap before it within a chain hop (270 px) is a mount. Its top may stand no more than the single-rise band's top
over the ground ending within 120 px before it (80 px Normal, 63 Easy). With no ground there it is a pole out of a pit, and refused.
It is a promise on every judged stage, both settings. Planted test: a 180 px tall stem is refused by name. 1-2's library chains pass
(the floor mushroom stands 30 px up on its bank, and the pillar caps are flush).

## 3. The empty rings: two causes, each fixed with a test that was red then green (no new art)
- **Not a pickup.** Every bounce mushroom's gold rim was drawn 2 px under the cap's top with a 30 px half-height, so its upper half was an
  empty dark pool around the white cue. It now takes the painted cap's own box from the atlas frame, in every world (`bounceArt.ts
  bounceAuraBox`). No rim is drawn while the cap isn't in. Test: `bounceAura.test.ts`.
- **A petal without its picture drew as another flower** (a red passion flower inside its rim; proved with `flowers=classic`). It now
  draws nothing until `pickupReady('petal')`. Test: `petalDraw.test.ts`.

## 4. Stills (F12/stills/, seed 2 Normal, upright and sideways; the paths went to the lead first)
Taken with stills-at.mjs's method and a LOCAL, uncommitted hook (lib12-hook.diff.txt: `?lib12=` plays the library roll as 1-2).
**Polish check:** each mushroom now glows about its own cap with the cue above, and the petals sit low and read as petals. Rough spots,
named and not fixed:
- **NEXT ITEM:** the checkpoint (x 30602) is laid ON the chain's first mushroom. A checkpoint belongs on solid ground just before the
  hard part (R-165.126). Its tall rim around a thin post also reads mostly empty.
- Dot's line card sits mid-screen sideways over the landing path. The placement code is the same as live, so live does this too:
  ROADMAP R-165.140 (the id is mine; renumber if the lead's ledger has it).
- The narrow thorn hollows read as root columns (the pit polish is not on this base). `bloomSprite` was never built. A petal may pop in a
  few frames late at the stage start (it is not in the stage preload).

## Checks (final head)
CHECKS
