# Petals: one pickup, spread out (2026-10-30, branch `petals`)

Matt: "getting the petals in, replacing the flowers, and getting this spread out better."

## What is in

- **Merged `origin/polish-levels`** (never rebased): one pickup, Meeca's petal (`petals.ts`, `petalPass.ts`, pickupCheck,
  `petals.test.ts`), the goal counter's petal icon (`hud/goalInfo.ts`, which VineHud already reads: **no VineHud patch needed**), and
  Dot's three petal lines. One clash: the Stage Cleared chips (today's list kept, Flowers renamed Petals).
- **Spread** (`petals.ts` fillGaps, run by `petalPass.ts`): where the route runs more than 1050 px with no petal, a 2-3 petal trail
  goes in where it leads somewhere, in this order: up a climbing vine, over a jump on its natural arc, along a raised ledge or one by
  a goal item or heart, along the walking floor, any ledge. The layout's own number picks which and where, so each generated roll
  differs.
- **Fair reach**: a new petal stays only if the level check reaches it for certain (nothing excused over a stand-in liana bridge),
  the swing checks (`flowerReach.ts`) reach it, and it is not below or just above a jump's arc. Where the level check cannot walk
  a stage (World 1's hand-built puzzle rooms), only walking-floor trails go in.
- **No clumps**: of two petals closer than 50 px, one stays (W5-W10 had dozens of stacked pairs). Arc trails only go over jumps wide
  enough to space them at least 70 px.
- **Bug fixed**: World 1/3/4 dressing was picked before the petal pass changed the pickups (artDress test failed). The pass now runs
  first (`protoStage.ts`).
- **Tests**: the stale goal-icon test (World 2's harvest now shows the petal; World 8 keeps its night bloom), a clump rule in
  pickupCheck and the petal test, and a new spread test (no stage runs more than 2 screens + 400 px without a petal, except 4-D,
  8-2 and 1-7).

## Numbers (roll 1, Normal; `npx tsx tools/inspect/petalSpread.ts`)

Before = today's game (1841b385). Gap = longest petal-free stretch along the route (px; a sideways phone shows about 840).

| World | petals (med) | most on a screen | gap med / max | trails that lead somewhere | clump pairs |
|---|---|---|---|---|---|
| W1 | 120 -> 87 | 13 -> 6 | 1432/2629 -> 1046/4076* | 54/90 -> 47/95 | 15 -> 0 |
| W2 | 93 -> 77 | 13 -> 6 | 1198/3383 -> 914/1970 | 98/148 -> 76/130 | 13 -> 0 |
| W3 | 87 -> 82 | 12 -> 6 | 1361/3391 -> 995/1038 | 84/137 -> 60/113 | 8 -> 0 |
| W4 | 141 -> 134 | 14 -> 6 | 1322 -> 991 (4-D: no petals) | 163/228 -> 142/214 | 23 -> 0 |
| W5 | 163 -> 145 | 13 -> 6 | 1349/2637 -> 870/938 | 66/185 -> 66/188 | 96 -> 0 |
| W6 | 73 -> 73 | 7 -> 6 | 1384/2853 -> 1006/1287 | 55/91 -> 51/87 | 30 -> 0 |
| W7 | 68 -> 68 | 9 -> 6 | 1564/2770 -> 993/1330 | 59/72 -> 54/71 | 38 -> 0 |
| W8 | 101 -> 92 | 15 -> 6 | 2323 -> 1675 (8-2: night blooms) | 95/119 -> 90/119 | 93 -> 0 |
| W9 | 86 -> 92 | 12 -> 6 | 2320/4703 -> 1010/1995 | 93/111 -> 94/120 | 69 -> 0 |
| W10 | 80 -> 90 | 11 -> 6 | 1841/3062 -> 993/1370 | 69/86 -> 71/93 | 51 -> 0 |

\* 1-7's long liana run (4076 px): petals along a swing are left to the swing checks, so none goes in there yet.

Where trails land each roll (`spotMemory.ts` trailSpot, 6 rolls): 0.39-0.66 before, 0.42-0.67 after. That is already about what a
fully fresh layout scores at this trail density (2 x 1% x 20-35 trails), so the base layouts, not the petals, decide it. A slide-
along-the-ledge pass did not move it and was dropped.

## Patches for the lead (owned files)

- `qa-notes/petals/levelCheck-petals.patch`: `validateStage(stage, { petals: true })` adds the petal rules (screen cap, rows, clumps,
  arc). Opt-in, because gen2's pipeline validates before the petal pass runs.
- `stageGenerator.ts` finishStage's call to petalPass came in with the polish-levels merge (2 lines, from 0e4feb1c): flagging it
  since build1-play owns the file tonight.

## Not done / to watch

- Goals: harvest targets are shares of the petals a stage holds (goals.ts), so they follow the new counts; the test checks a harvest
  holds at least its goal on Normal and Easy. I have not read the new gen2 Easy goals (after 11:45 PM ET).
- Stage build cost: the pass adds two to four level checks per stage build (about 50 ms per stage on desktop); worth a look on
  Matt's Pixel.
- 1-7's liana stretch; 2-8, 8-4, 8-8 and 9-1 still have one stretch of 1.8-2 k px.
