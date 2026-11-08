# CP3 round 2: polish, Easy pacing, re-checks (planner, 11-05 ~5 AM ET)

Build: branch `engine-mixer` 839ef9eb (`src/game/mixer/w1mix.ts`), built the way the engine builds it, 16 rolls x 2 settings unless a
line says otherwise. Stills: `stills-v5/` (6 places, upright and sideways, layout 1 Normal).

**Verdict: two misses, both waiting on the designer: Easy pacing (and Normal against main), and the adult bot's marks.** Every other
line passes.

## Pass lines

| Line | Result | |
|---|---|---|
| Level check + Easy's 70% hold | 32/32, 0 rerolls; quick clock Normal 193-202 s, Easy 231-240 s | PASS |
| Variety gate, 9 lines x 2 settings | 18/18. Easy longest with nothing new 1,392 px (line 1,516; was 1,585 on layout 10) | PASS |
| Creaky + crumbling share, top 3 kinds | Normal 18.5-23.1%, Easy 15.5-18.8% (was 14.6% min); top 3 on 16/16 both | PASS |
| Splits (180 px rule), at least 19 | 23-26 Normal, 25-26 Easy | PASS |
| Two roads side by side, at least 40% | 44-50% | PASS |
| Biggest idea share, cap about 40% | 26-34% | PASS |
| Per-jump floors (§1b) | Easy: 2,106 route jumps, none under (worst 98%). Normal: 1,988, one under (below) | PASS but 1 |
| Kid bot on Easy, layouts 1-4 | shrine 4/4, 187-202 s, marks 9-11 of goal 8, no harms | PASS |
| Adult bot on Normal, layouts 1-4 | sealed door 4/4, marks 7-8 of goal 10 (below) | **MISS** |
| Easy pacing (ruling (b), 16 rolls) | actions a second median 0.66 (line 0.35-0.55) | **MISS** |
| Normal no worse than main's 1-5 | actions a second 0.80 vs 0.57; longest run 41.6 s vs 29.3 s | **MISS** |
| Tests on the shared files touched | 87/87 (protoStage, easyMode, flagSpan, goalsEasy, petals, flowerReach, levels, layoutMemory, bankCull, tools/inspect) | PASS |
| tsc | clean | PASS |
| Draw check on 1-5 | 6 gradients a frame at the n4 fork (limit 2), from terrain.ts earthBody and drawSlab: engine-render's | waiting |

## Fixed in round 2

- **Easy nothing-new (layout 10, 1,585 px).** The finished Easy stage is read the way the gate reads it (`padLogs`). Where more than
  1,400 px pass with nothing new, a breather pad in that stretch becomes a long log. Laying every pad as a log pushed creaky out of
  Easy's top 3 kinds on 13 of 16 rolls, so only the pads that need it change.
- **Creaky on Easy.** Easy's creaky boughs and bridge spans now lay the creaky limbs first: 2 of 3 creaky, with no piece added.
- **Marks off the main road.** 8 of the 9 main-way marks were on floor pieces under a canopy. A first timer on the boughs jumped over
  them, so the kid bot met the sealed door on 2 of 4 layouts. Each node's mark now goes on a piece with no bough within 250 px that is
  too wide to jump over (the gap, the piece and the gap after it, 380 px or more). Hearts never share a mark's piece.
- **Trees on long banks** (S-7, P-6). They keep clear of flags, the start and the shrine: in v5's first take, the start tree hid the
  first flag.
- Crowns smaller and raised (400-460 px over the trunk's foot, no two within 360 px). Stems under lily pads and reeds (S-2).

## Misses, for the designer

1. **Easy pacing.** Sent at 3:40 AM with options A (a calmer Easy: about 300 px landings on Easy's own size bands, one fewer burst a
   node), B (Normal rests after every second burst) and C (the density band stays provisional, as the draft's §0 row 2 says).
   - Easy dead time: on roll 16, both stretches over 5 s are the bot's fork stall (it walks off the high road's breather at n4 and n10
     and waits).
   - Longest Easy run: median 19.8 s (pass), worst 27.5 s.
2. **The adult bot's marks: 7-8 of the goal's 10 on Normal.**
   - The bot does not look for marks. It takes the main route to the shrine (`tools/inspect/route.ts`, no targets) and picks up what
     lies on it.
   - On canopy nodes whose canopy covers the whole node, no piece meets the rule above, so the mark falls back to a floor piece under
     the boughs.
   - A second try that let boughs behind a mark in (a canopy's end) made it worse (5-7 of 10), and was reverted.
   - Ways out, each one run:
     - (a) a mark on each road in such canopies, as the forks have (the count changes from 13);
     - (b) the goal at 9 of 13 on Normal;
     - (c) the mixer places marks on the route the tracer finds (it needs `route.ts` moved into `src/`).
   - My pick is (c), because it is the only one that makes "on the main way" true by construction.
3. **Adult layout 3 at n10 loses 3 lives at one spot.**
   - The high road's crumbling ledge drops him 390 px onto the low road (a hit, the high road's risk under ruling 5).
   - The low-road branch there sits 43 px under the next log's top, with nothing under the gap but the stage bottom. The bot, off its
     route, walks off instead of hopping up, three times over.
   - A person hops, but the fall is to the stage bottom. Proposed: a catch branch under fork low roads' gaps, as the opening has.
4. **One Normal route jump under the floor** (layout 4, x 9,415): the jump tool's route drops from a high-road branch straight onto a
   lily pad 340 px below, instead of taking the step-down crossing 200 px further on. This is the route's choice, not a jump a player is
   asked to make.

## Polish check (stills-v5)

- **Start, sideways:** the start flag shows, and there is a tree on the start bank.
- **Upright, top half:** the trunks reach the top of the screen. The crowns sit above the frame at the stills' camera, so the top half is
  the painted backdrop. That is better than v2, but the designer should judge S-7.
- **Fork, creek, creaky, bank end:** every bough and log stands on a trunk, and the bridge ends have posts. Neighbouring trunks
  alternate the bare and the vine-wrapped kapok.
- **Still rough, and not mine:**
  - the dark pit columns between banks (S-1) and the hard darkness (S-6), which are engine-render's;
  - the water and pit painting (P-8).
- **Bank ends (P-3) and foliage edges (P-4):** no new build. They look as they did in v4; the designer should judge.

## Cost

There is no meter in this session. My estimate for round 2 is about 2-3% of the week.
