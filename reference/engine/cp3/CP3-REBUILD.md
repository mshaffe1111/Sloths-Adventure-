# CP3 rebuild: the mixed 1-5 after the designer's rulings (planner, 11-05 ~2:15 AM ET)

Build: branch `engine-mixer` 17710dc2 (`src/game/mixer/w1mix.ts`), built the way the engine builds it, 16 rolls x 2 settings. Rulings
applied: `ENGINE-SPEC.md` b1b5e849, 1-6. Matt's go came through the lead at about 1:35 AM ET. The rebuild took about 40 minutes; CP3 in
all has taken about 1 h 40 min, with 0 rerolls (the mixer never rerolls a stage).

**Verdict: PASS on every pass line the lead listed.** Seven items for the designer are listed below. None of them stops the work.

## Pass lines

| Line | Result | |
|---|---|---|
| Level check + Easy's 70% hold | 32/32, 0 rerolls | PASS |
| Variety gate (`cp3-lines.txt`), 9 lines x 2 settings | 18/18 pass on 16/16 rolls. Worst: same piece in a row 4; kind x size 3; nothing new for at most 1,412 px; flat stretch 832 px; up/down share 0.955 or more (old 1-1 0.949) | PASS |
| No idea over about 40% of the length | biggest idea 20-35% (bank hops), canopies counted with their floor idea (ruling 1) | PASS |
| Splits, 180 px rule, at least 19 on 16/16 | 26-29 Normal, 26-29 Easy (old 1-1's target is 34) | PASS |
| Two roads side by side, at least 40% (ruling 2) | 44-51% (old 1-1 61%) | PASS |
| Hearts: after a risky node only (Normal) | 2 a roll, after n6 and n10 | PASS |
| Flags (ruling 3): LV-9 spacing, before hard nodes, never two over only easy ground, never on a rest without a hard node after | 10-11 a roll; longest span 3,900 px; 0 pairs over easy ground only; 0 on a rest | PASS |
| P3: no life lost dropping onto a reachable ledge | holds by construction: the mixer lays no fall zones, so a fall that meets a ledge lands on it. The adult's one life (layout 2) was a fall to the stage bottom | PASS |
| Length: at least 2:00 on the quick clock and the adult's fastest run, both settings | quick clock Normal 3:14-3:29, Easy 3:08-3:22; adult fastest 2:18, kid fastest 2:09 | PASS |
| Per-jump floors (§1b): Normal at least 70%, Easy kid at least 85% | Normal: 1,602 route jumps, none under; Easy: 1,561, worst 96% | PASS |

## Bots (real engine, layouts 1-4, `cp3-ft.out`)

- **Kid on Easy:** reaches the shrine 4/4 in 2:09-2:33. No harms.
- **Adult on Normal:** reaches the shrine 3/4 in 2:18-2:47.
  - Layout 2 ends at the sealed door with 10 of 11 marks (item 2).
  - Lives lost: 1 in 4 runs, a mean of 0.25 against the dial's 0.7.
- **Canopy loops: 0** (were 7-11 a run).
- **Stalls left: 5 in 8 runs, all at a fork** (`cp3-stuck.out`).
  - The bot's route runs along one road, and it ends up on the other: it jumps at the fork bank's end, out of habit.
  - It then waits for a way up or down that isn't there, and is rescued after 13-20 s.
  - A person carries on along the road they're on, so this is a bot artifact. The fork gives no way to change roads, though, so it is
    also item 1.

## For the designer

1. **A crossing in each fork.** At present the only way off the high road is a 500 px long fall (a heart on Normal). Add a step-down
   halfway (high, middle ledge, low) and a climb up from the low road. That is the "crossings where the roads run apart" from the earlier
   plan. It ends the bots' fork stalls and gives a player who changes their mind a way back. Each crossing is one piece and about one run
   to build.
2. **Normal's goal leaves no slack.** There are 13 marks, 9 on the main way and 2 on each fork road, so a player who takes one road per
   fork can get exactly 11, which is the goal. One miss means the sealed door. Proposed: put the goal at 85% of the marks one route can
   reach (9 of 11 on one route), or put the fork marks where both roads meet.
3. **Warm-up laid as one burst** (like rest and cool down), so the first hard node starts inside LV-9's first 4,000 px and placement rule
   3 holds. With two bursts the warm-up ran 4,300-4,850 px and forced a flag over easy ground. Confirm, or rule another way.
4. **The bough stair has a bridge as its third kind**, for "something new". With branch and log alone, two sizes each, five pieces
   repeat. Confirm.
5. **The mushroom sits on a perch** (a short branch 46 px over the floor, the mushroom on top), because the engine has no "stump that
   isn't a floor". Walking passes under it. A hop lands on it and bounces him up. In grey-box this is a bracket; it needs a painted stump
   or root before it ships.
6. **Easy's typical landing is 218 px against the dial's 250.**
   - The engine's own Easy pass widens ledges by their jumps.
   - The mixer widening them as well pushed medium pieces into the long size band, which broke "something new", so the mixer no longer
     widens on Easy.
   - Normal's typical landing is 221 px (dial 210).
   - Either lower Easy's dial width or move the size bands for Easy.
7. **Length: 3:14-3:29 against the 2:30-3:00 aim.** Bursts are already at 4-5 pieces. To get to 3:00, drop a node from the plan, or lay
   the canopies in two stretches (splits would fall to about 19-21, at the floor). Your call.

## Not run, or known

- **Fun gate:** not run on this build.
- **Repo tests:** `src/game/w1Rhythm*` 1-5 tests, `dips` (two tests) and `stageSheets` (1-5's preload list is longer than what it draws)
  fail on `engine-mixer`, because the mixer replaces 1-5's rhythm builder. They are replaced in CP5 if Matt picks the mixer (new replaces
  old); nothing goes to `main` before then. The suite also hit its 25-minute cap once on this machine.
- **The test-link build:** it builds cleanly, but two of its JS files are over 4 MiB (index 7.4 MiB, orchLoader 4.1 MiB). The 4 MiB gate
  is for the production build. Lead: please check whether `main`'s test link is the same.
- **The n9 glint:** still to be drawn.

## Files

- Measure tables: `cp3-lines.txt`, `cp3-splits.txt`, `cp3-ideashare.txt`, `cp3-flags.txt`, `cp3-table.txt`.
- Run outputs: `cp3-check.out`, `cp3-ft.out`, `cp3-jumps.out`, `cp3-stuck.out`.
- The strip map, `strip-map.html` (published: https://claude.ai/artifact/6Kgs7TMxe7yUn9SBsxXAJB), and its generator, `make_strip.py` with
  `strip_tmpl.html`.
- Scripts on `engine-mixer`, under `tools/engine/`: `cp3-check`, `cp3-ft`, `cp3-ftwhere`, `cp3-stuck`, `cp3-jumps`, `cp3-lengths`.
