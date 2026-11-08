# CP3 checkpoint: the mixed 1-5 (planner, 11-05 ~1:35 AM ET)

Build: branch `engine-mixer`, `src/game/mixer/w1mix.ts`, built the way the engine builds it (`generateStage`, then `easyStage` on Easy),
16 rolls x 2 settings. Started about 00:35 ET; about 1 hour so far.

**Verdict: MISS, so the work stops here for a ruling.** The variety gate, the splits and the level check all pass. The miss is the
idea-share cap: canopy over floor is 59-65% of the length, over the cap of about 40%. Under today's rules no tuning fixes both
(below). Two smaller items also need the designer.

## Pass lines

| Line | Result (16/16 rolls, Normal and Easy) | |
|---|---|---|
| Level check (`validateStage`) + Easy's 70% hold | 32/32 pass, 0 rerolls ("can't reach" rejections = 0) | PASS |
| Fast clock >= 2:00 | Normal 242-259 s, Easy 233-250 s | PASS |
| Same piece in a row <= 9 | max 5 | PASS |
| Kind x size in a row <= 7 | max 2 Normal, 3 Easy | PASS |
| Something new every <= 572 px (mean) | max 245 / 230 | PASS |
| Never more than 1,516 px with nothing new | max 1,161 / 1,099 | PASS |
| Flat stretch <= 1,351 px | max 639 / 619 | PASS |
| Up + down share >= old 1-1 (median 0.949) | min 0.960 / 0.961 | PASS |
| Kinds >= old 1-1 (5) | min 10 | PASS |
| Commonest piece share <= old 1-1 (0.468) | max 0.246 | PASS |
| Climb range >= old 1-1 (415 px) | min 759 / 899 | PASS |
| Splits, 180 px rule, >= 19 (1-3) on 16/16; target 34 (old 1-1) | 23 on every roll, both settings | PASS (target not met: 23 vs 34) |
| **No idea over the old 1-1's top share (about 40%)** | **canopy over floor 59-65% of length** | **MISS** |
| Fork share, n4 + n10, 30-40% | 11-13% (two-road share incl. canopies: 38-46%; old 1-1: 61%) | MISS on the plan's number (see 2) |
| Hearts: only after a risky node, fewer than risky nodes (Normal) | 2 per roll, after n6 and n10 | PASS |
| Checkpoints: start, before n6, before n10 only (Normal) | 11-14 per roll | MISS on the plan's rule (see 3) |
| P3: no life lost on a drop onto a standable ledge | no such loss found; every long-fall hit traced (below) | PASS |

Files: `cp3-lines.txt`, `cp3-splits.txt`, `cp3-forks.txt`, `cp3-ideashare.txt`, `cp3-table.txt`, `cp3-check.out`, `cp3-ft.out`, and the
scripts (`lines.py`, `split180.py`, `zones.py`, `where.py`, run from the planner's scratch folder next to `cp1/`).

## First-timer bots (real engine, layouts 1-4)

- **Kid on Easy:** reaches the shrine 4/4, 243-320 s, 0 harms, goal met every time.
- **Adult on Normal:** hits the bot's 6-minute cap 4/4, marks 7-11 of 11, 0-2 lives lost (mean 0.75 against the dial's 0.7).
  - The lives are real misses: pits at the n4 fork and the n7 rotten-branch drop.
  - **Stuck 7-11 times a run, all at canopies.** The bot's route runs along the floor. The mushroom sits on the floor's only lane, so
    walking forward bounces it into the boughs. Its target is then below and behind, so it walks back off the bough's left end, lands
    on the mushroom, and bounces again.
  - A person would carry on along the boughs, so part of this is the bot. But it shows a design fact: **under a canopy the low road is
    not a choice**, because walking forward always bounces you up. See ruling 4.

## Fixed during CP3 (each one found by a run)

- **Long fall on a canopy.** The hits were long falls, not the mushroom: a jump off a bough 230 px up, about 180 px high, then down to
  the floor is 402 px, just over `LONG_FALL` (400). Boughs now sit 140-200 px over the floor.
- **The fork's high road.** Its pieces are 260-420 px over the low road, so slipping off costs a heart on Normal (two traced hits,
  410 and 566 px). That is the high road's risk, and it is left as is; see ruling 5.
- Mixer fixes:
  - the rotten-branch drop was flipped into a climb deep in the stage;
  - a bough sat over the mushroom's bounce;
  - fixed pieces were laid flat with the piece before them;
  - the dial's gap share (Normal 0.58, Easy 0.48 of the gate's widest) replaces the 70-90 px stand-in;
  - the dial's 2 bursts per node at d = 0.09.

## Rulings the designer needs (one run each is ready)

1. **Splits >= 19 vs the 40% idea cap vs the dial's 2 bursts per node.**
   - With 2 bursts a node, the stage has 6 canopy bursts. At "2-5 pieces" each, that is about 8 splits.
   - Reaching 19 needed 3 short canopies per canopy burst, and those take 59-65% of the length.
   - Shorter canopies (1-2 boughs, the other bursts at 5-6 pieces) still take 54-58%.
   - Ways out, each one run away:
     - (a) a canopy laid over another idea's floor, so the boughs ride above bank hops or stump hops (the old 1-1's own shape) and the
       share is shared;
     - (b) 3 bursts per node on 1-5, above the dial;
     - (c) a lower split floor for 1-5.
2. **Fork share 30-40%.** That number came before canopies counted as splits. The two big forks are now 11-13% of the stage, while two
   roads run side by side for 38-46% of it in all. Keep 30-40% for the forks alone, or judge the two-road share?
3. **Checkpoints.** LV-9 (`easyMode.ts capFlagSpans`, at most 4,000 px between flags) adds about 10 flags on a 45,000 px stage. The
   plan says "start, before n6, before n10 only". LV-9 is a shipped rule, so it needs the designer and the lead.
4. **The canopy's low road.** Should the mushroom sit off the floor's lane (on a stump, so bouncing up is chosen), so that both roads
   are real?
5. **A slip off the high road costs a heart** (long fall to the low road, 260+ px under it). Keep it as the high road's risk, or bring
   the roads within 220 px of each other?
6. **The n8 creek.** With each fork road now laying both of its deck's ideas, n8's "not n4" leaves it only stump hop (lily and reed
   were used at n4).

## Not done yet (waiting on the rulings, since they change the layout)

- The labelled strip map (old 1-1 / today's 1-5 / new 1-5) and the grey-box test link.
- The fun gate, which has not been run on this build.
- The n9 glint, which needs new draw code (cost to be sized).

## Cost

There is no meter in this session. My estimate for CP3 so far is about 2-3% of the week, over the spec's 1.5-2%. Matt's meter is the
real number (base 39%, ceiling about 47%).
