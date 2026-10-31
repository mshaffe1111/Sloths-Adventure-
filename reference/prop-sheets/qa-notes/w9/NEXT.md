# World 9 pieces: where it stopped (2026-10-31, ~5:55 PM ET, paused by the lead)

Branch `w9-pieces`, last commit before this note `cfd7cdf8`. Nothing is curated: `src/game/gen2/seeds.ts` has no World 9 entries yet
(STAGE-RULES §1c: curation comes once, after every piece is built and checked). The plan and status table are in `GRAB-BAG.md`.

## Done

- **Merges.** origin/gen2-w9 and gen2-w9-swing (without w9-pillar-hop), then origin/w8-merge (ca2257d6, clean).
- **Pieces built.** Each has its own gate and sections, and its stills are in `bob/`, `heat/`, `pieces2/` and `pieces3/`.
  - rafts (9-1)
  - charred logs (9-5 with the glide, 9-9)
  - pistons (9-5, 9-8)
  - sinking slabs (9-3, 9-6, 9-9)
  - flare slabs (9-3, which is its sixth theme; 9-5; 9-8)
  - lava surges (9-4, 9-6), with tapered ends
  - lavafalls (9-4, 9-6, 9-9), with a lava pool at the foot as a tell
  - hot ash headwind (9-1)
  - ropes over the lava (9-3, 9-8)
  - ash caps (9-1, 9-6, and 9-4's coils: an ash cap over the coiled boa, which replaced the boas between geysers)
- **Teaching.** Every stage teaches its own new pieces. The roll picks an earlier stage's theme, so a piece can be new on a later
  stage. Each teaching section is `calm`: a purge's or gauntlet's top-up lays no animal on it. Checked on 420 rolls: no piece is used
  before it is taught. The logs got their own lesson and Dot line.
- **Unused art placed.** The w9b vent rock, lava dome and scorched bridge are bank dressing ('w9-ruin'). The w9c and w9c-b lava pool
  marks each lavafall's foot. Only the HF obsidian chunk is left, for the raft lock in the Drake pass.
- **Look-alike.**

  | Pair | Before | After |
  |---|---|---|
  | 9-3 vs 9-1 | 10/16 | 2/16 |
  | 9-9 vs 9-6 | 13/16 | 0/16 |
  | 9-5 vs 9-1 | 11/16 | 3/16 |
  | 9-4 vs 9-1 | 3/16 | 0/16 (the coils cap) |

- **Variety.** Measured at 5:00 PM ET (60 rolls each), before the 9-3 flares, the coils cap and the teaching change:

  | Stage | Variety (shipped set) | Passing every check |
  |---|---|---|
  | 9-1 | 0.46 | 85% |
  | 9-3 | 0.44 | 63% |
  | 9-4 | 0.39 | 85% |
  | 9-5 | 0.54 | 70% |
  | 9-6 | 0.56 | 77% |
  | 9-8 | 0.59 | 47% |
  | 9-9 | 0.50 | 85% |

- **Glide-pit bug: the shared fix.** In `pipeline.ts` pitUnder `deepen` and bobFoot. It fills a bank down only where its foot leaves a
  hole Pokey fits through (more than 48 px, banks 40 px tall or more). It moves the death line only for a floor that sits under it.
  World 9 keeps its full fill.
  - 731 of 736 shipped World 5-8 builds come out identical.
  - The other 5 are 8-6 Normal rolls (528649, 821391, 383441, 702828, 321196). Each had a real hole under a bank's foot over its dark
    glide floor. Stills are in `pits/8-6-hole-pair.jpg`.
  - The new `gen2Pits.test.ts` covers it. The lead is porting the hunk to World 8 for tonight's release.
- **World 10's riser.** The shared hunks are in `riser-shared.patch`, and the lead passed them on.

## Left (in order)

1. **Re-run the full suite on a quiet tree.**
   - Tonight's run is NOT valid. While it ran, I appended probe seeds to `seeds.ts` and temporarily edited `pipeline.ts` for the still
     builds, so test files that loaded in those windows saw a broken tree. It showed about 50 failures, many in "every shipped roll" tests.
   - Run it with nothing else touching the tree. Then sort real failures from the known ones: the World 9 "ships 16 rolls" test, which
     waits on curation, and 1215, the 8-2 shelf at 97%, which also fails on plain ccr.
   - Tests passing in isolation after the last changes:
     - the World 9 tests: w9, w9Game, w9Swing and w9Rooms (25/26; the one failure is the curation test);
     - gen2Pits (3/3) and seeds.test (4/4).
   - tsc is clean, `vite build` passes (no asset over 4 MiB), and artcheck passes.
2. **The perf draw check** (`node tools/perf/drawcheck.mjs`, about 6 minutes). Not run yet. Covers the new draws: the surge's tapered clip,
   the lavafall pool and the ruin dressing.
3. **Merge origin/w8-merge again.** That brings in World 8's additions to MY rope rule (it stays the shared one): the rope gap's
   `back: { lips }`, as a liana's (on Easy a soft pit that climbs back; on Normal World 8's heart fall), and `soft?: boolean` on the
   rule. Keep World 9's ropes working with both. Known gap: hangsNeed doesn't ask for the 'rope' move, which is fine for Worlds 8-9.
4. **Merge World 10's piston timing** (route.ts times a bob piston at its own speed). Then re-measure 9-5 and 9-8, whose Easy pistons
   (95 px/s) will read slower. Keep the basalt-knob hook general: World 10 uses it.
5. **Re-measure variety** after the 9-3 flares, the 9-4 coils cap and the teaching change. Each stage now opens its themed roll with a
   teaching section, which may lower diversity a little. Use `--rolls 60 --out <scratch>` and never write the real `seeds.ts`.
6. **HF ($12 cap, about $0.30 spent).** The lead wants World 9's stand-in drawing painted where HF can paint it. Candidates:
   - the ash cap's vent base for 9-4's coils cap;
   - a painted "cool" flare frame matched to the slab's light (only if a still shows it standing out);
   - the pale stone floor of the soft pits and surge channels (it reads as a pale band in the sink and surge stills).

   Cost each one before running; tell the lead before any job over $3. Backdrops belong to the backdrop helper: send any World 9 backdrop
   need to the lead.
7. **Curate once,** in neighbour order (1|3, 3|4, 4|5, 5|6, 6|8, 8|9), with `--apart-near`. Keep the full suite green after each
   stage's seeds.
8. **Band items for curation** (GRAB-BAG §Band items):
   - adult lives near the 9-1 rafts (drop rolls over 5);
   - 9-3's chains: the adult bot loses 7-22 lives on plain 9-3 too, which comes from the swing builder;
   - surge hits on 9-6 (about 25 against a baseline of 15).
9. **Not this pass:** the Drake (9-10), the 9-2 canopy special stage, and the raft lock room (Drake pass; its HF chunk must be placed then).

## Open items with the lead or Matt

- Dot's lines, now 13 with the logs' line, are in GRAB-BAG's table, waiting on Matt.
- The glide-pit stills for Worlds 5, 6 and 7 aren't needed: those builds are identical. The 8-6 pair is the proof, and the lead
  accepted it at 6:35 PM ET.

## HF spend

About $0.30 in one job (6ae633040e0338d1bb7d39e3): the flare, lavafall, surge, ash and chunk frames, all on one canvas. The cap is now
$12. No other jobs were run.
