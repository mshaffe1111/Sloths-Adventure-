# World 9 (gen2-w9): where it stopped, 2026-10-29 ~11:30 PM ET

Stopped for the night (Matt). Nothing running; no HF jobs.

## Done on the branch
- World 9 kit, ground and hazard sections, hook-up, painted lava/geysers/haze/splash (HF $0.40), the swing helper's chains and rooms
  merged (up to ad5165a), the base ccr merged (c50cd469), STAGE-RULES §6 lessons.
- Each stage keeps its own hazards for the look-alike check (w9Ground.ts W9_STAGE_ONLY); 9-9 reshaped as the hoard's ground.
- World 9 has NO shipped seeds yet (seeds.ts has none for 9-x): the game's World 9 tests fail until curation lands.

## The last 300-roll curation (stopped before it wrote seeds)
9-5 shipped 16 (diversity 0.50), 9-4 16 (0.37), 9-3 16 (0.30, low), 9-9 16 (0.12, before its reshape), 9-6 0 (matched 9-9).

## Exact next step
1. Merge origin/gen2-w9-swing at a3b4d97 or later (9-3's themes; it edits w9Game.ts: drop its `w9-pillar-hop` line, the pillars are
   9-9's now).
2. Curate, narrow stages first:
   `npx tsx tools/gen2/curate.ts --stages 9-5,9-4,9-3,9-9,9-6,9-8,9-1 --rolls 300 --keep 16 --apart` (about 90 min).
   Check 9-6 against 9-9 (apart) and diversity >= 0.35 on each.
3. Band on the shipped rolls, seeds 1-3 averaged (`inspect.ts --worlds 9 --firsttimer`); targets: gen2 median 43-44, none under 40.
4. Easy goals for 9-6 and 9-9 (firsttimer FT_KID), the walk (polish-clean's walk.mjs), the full gate, stills, the report.
