# C1 turnover note (R-165.72, the 1-1 re-lay): what the next Content member needs

## Where the bands live in w1.ts (bands.md §5 at t-designer-reach@e97542b4)
- One block of constants at the top of the helpers (`DOUBLE_TEST`, `D_RISE`, `THIN_RISE`, `BOUNCE_LIP`, `HOP_UP`, `faceAt`), each 1 px
  inside its band: a laid rise or gap rounds to the band's edge (136 asked laid 135.6 and failed `band.out`).
- `riseFace`: every double rise is a face at the END of a flat floor (gapPx 0, `block: 'double'` so the tempo's rise scale never shrinks
  it). The floor in front is the help's stair room. A double rise between two floating pieces is never laid (no ground for the stair).
- `practiceGap` (a 252-262 gap over a floored soft pit with a step out) comes before every `d`/`X` test gap (a level block gap: put-back).
- Easy twins: `section({ versions: [{ id, groups, easy }] })` and `rhythmic` versions' third string. The twin is laid on Easy in its
  version's place (`easyOnly`). Every version with a 252-262 gap has one.
- Mushrooms: `faceAt(floorW)` keeps the edge 25-45 px from the face on Normal; Easy's widened landings add 5-20 px (measured), so the
  60 px top of the band is left for them. A bough over a perch: `PAST_PERCH` over a fixed-width stump.

## Traps (each cost a rebuild)
- Mirroring turns a step DOWN into a rise. The canopy rests, cache stones, seed perch and mushroom forks are `mirrorable = false`.
- The tempo scales every non-block `dy` (×0.97-1.4): a single step written 78 can lay 109. Keep singles at `HOP_UP` and check the laid
  figure, not the written one.
- A floating thin log at the end of a floor leaves a hole under it that w1Pits reads as a floorless pit (`floor.unmarked`). The `E`
  beat is a ground-standing trunk for that reason.
- `n` (a bank step down) after a log lays earth floating in the air. Use `o` (a log down) and `F` (a floor a hop down) instead.
- `w1.relay.test.ts` replays the LISTED plans: any w1.ts change needs the list rebuilt before it means anything.

## Sections taken out of 1-1 (feel moved to 1-5 or 1-3; the code is kept)
high-leaps, hop-bounce, bounce-run, twin-bounce, bounce-double, long-bounce-twist (#59), bounce-over-dip (#63), mushroom-stair (#65),
log-stair-test (#41) and its back, bounce-stair-combine (#61) and its level, mushroom-chain (#45), mushroom-chain-back,
twin-mushroom-fork (#37), stair-fork (#38), root-stair-fork (#48). Each line in w1.ts says why.

## Open
- The relay test's (a) reading of "Easy's variant" (REPORT.md, Pushback).
- `THIN_RISE` is entered but laid nowhere today: no thin double rise from the ground survived (each left a hole under the log).
- The catch-bough chains (rungs, log chain) pass the verdicts only on some rolls (w1Pits holes under the rungs); the list keeps those.
