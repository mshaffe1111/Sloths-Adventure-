# World 5: where it stands, and how the next helper starts (2026-10-31, ~11:40 AM ET)

Branch `w5-pieces` (not merged). Base for the next helper: its head. The day's earlier plan and art list: `GRAB-BAG.md` (same folder).

## 1. The numbers now (era, 80 rolls; dead time median against the budget, 0.2 x the played time)

| Stage | Built | Variety (main -> now) | Dead / budget | Plays over budget | Longest quiet |
|---|---|---|---|---|---|
| 5-1 | hand (`w5Stages.ts`) | 0.019 -> 0.486 | 34.7 / 38.5 s | 23 of 80 | 4.1 s |
| 5-2 | hand | 0.018 -> 0.569 | 40.4 / 46.1 s | 18 of 80 | 3.9 s |
| 5-3 | hand | 0.032 -> 0.295 | 30.1 / 41.1 s | 3 of 80 | 2.8 s |
| 5-4 | hand (`w5Stage54.ts`) | 0.16 -> 0.542 | 39.0 / 38.7 s | 39 of 80 | 3.7 s |
| 5-5 | hand | 0.021 -> 0.442 | 41.2 / 46.3 s | 9 of 80 | 3.9 s |
| **5-6** | **old generator** | **0.395 (untouched)** | **48.1 / 29.2 s** | **80 of 80** | **8.5 s** |
| 5-7 | gen2 | 0.50 (untouched) | 13.6 / 30.8 s | 0 | 2.1 s |
| **5-8** | **old generator** | **0.115 (untouched)** | 3.2 / 23.5 s | 0 (but 4 of 80 under 2 min) | 4.2 s |
| 5-9 | gen2 | 0.53 (untouched) | 10.4 / 36.3 s | 0 | 1.9 s |

Open on the hand stages: 5-3 is under the lead's 0.35 floor (Matt chose the swaying orchid, built today; the rest of the gap is what
every play shares: the fixed lesson, the stage test's 6+ orchid rows, the cups). 5-4 sits at its budget's median, half the plays a
second or two over. All World 5 test files are green at the branch head.

## 2. What today built (so you don't redo it)

- **Drawn layouts** (`w5Stages.ts`, `w5Stage54.ts`): only the lessons are fixed; the rest is `deck(all, keep, core, once)`: `keep`
  pieces come back (the play's theme), `once` more are drawn a single time. 5-1, 5-2, 5-5 use 2 + 2, 5-4 uses 2 + 2.
- **5-3**: one orchid style a play (plain, tall ones the second jump climbs, teapot islands, spider islands, **swaying orchids**),
  and a per-play seasoning between them. Teapot steam taught alone after the first row.
- **The swaying orchid** (Matt, 10:15 AM): `w5Kit.ts` SwayBloom/SWAY, `w5Stages.ts` swayRow, `w5Play.ts` (tip + draw), `w5Look.ts`
  drawSwayOrchid, art `src/assets/props/w5-sway.webp` (HF job `hfg-w5sway`, ~$0.07, `tools/art/hfground/jobs.txt`). Real-engine check:
  `src/game/w5Sway.test.ts`. Stills and video: `sway/`. **New Dot line waiting for Matt**: "This orchid sways. Hop on as it swings
  near." (old look: "This orchid sways on its stem. Wait till it swings close, then flick up onto it").
- **5-5**: silk sheets in the finish, Develop drawn, the thread and the high web in either order.
- **The line-room rule** (`fresh()` in `w5Stages.ts`): a first-time line gets ~4 s after the one before (5-5's calm queue: ~8 s),
  after any chase, and after the stage's story aside's return (it steps aside for the first lesson and comes back after 8 s of quiet,
  `dotGuide.ts` storyGapMs). The one-time lines a hold-right player brings on (steam, cake eaten, hum) count. The room is filled with
  plain stumps and pits (`room()`), never empty walk. Keep this rule when adding pieces: the w5Order line checks depend on it.
- **Per-stage caps** (`MOST`, `POTS_MAX`): a theme can't stack 27 spiders in one play.

## 3. Shared files changed (list for the lead)

- `tools/inspect/beats.ts`: silk-wrapped chairs are no longer actions (they never pull); a swaying orchid is a timed beat (Z).
- `tools/inspect/route.ts`: dropping or letting go into a pit, or onto a catch ledge, with lianas or silk lines hung just ahead is
  weighed as the miss it is (route choice only, not its time). **This shifts era numbers in Worlds 1-4 and 8 wherever soft pits sit
  under lianas: re-measure World 8 after merging.**
- `tools/inspect/eraRoll.ts` exports `silkLight`; new `deadProbe.ts` (where the quiet stretches are), `tokProbe.ts` (a play's beat
  string). `tools/art/w5shots.mjs` (World 5 stills and video in the real game).
- `src/game/w5Lines.ts`, `src/game/dotTips.ts`: the swaying orchid's line. No engine.ts change.

## 4. 5-6 "Where She Ran": move it onto gen2

Today it is the **old generator** (stageGenerator.ts; not in `HAND_STAGES`, not in `W5_GEN2_STAGES`). Its problem is dead time (48 s
against 29, quiet stretches up to 8.5 s on every roll); variety is 0.395.

How to start:
1. Read `src/game/gen2/worlds/w5.ts` (W5_MANIFEST, W5_GEN2_STAGES = ['5-7', '5-9'], which pieces each stage first teaches) and
   `w5Sections.ts` (the World 5 sections), and how 5-7 is entered in `src/game/gen2/game.ts` GEN2_STAGES and `seeds.ts`.
2. Add '5-6' to W5_GEN2_STAGES with its own archetype and story (5-6 is a dusk stage, "Where She Ran": check
   `reference/STORY-REWRITE.md` World 5 and `stageSpecs`). Its pieces: only what 5-1 to 5-5 teach (the pot is taught in 5-3 now, the
   swaying orchid is 5-3's own; the manifest says 5-7 teaches the pot: change that, 5-3 teaches it first).
3. Curate 16 shipped rolls with `tools/gen2/curate.ts` (the W8 helper's workflow; `--apart-near`), aim 0.45+, dead time in budget.
4. Gates: `src/game/gen2/*.test.ts`, `src/game/gen2/worlds/*.test.ts`, the W5 tests, then era and `tools/inspect/spotMemory.ts`.

## 5. 5-8 "Up the Bloom Trees": stays hand-built (Matt, 2026-10-28)

Today it is the **old generator's ascent** (variety 0.115, 4 of 80 rolls under 2 minutes). Matt: "5-8 stays hand-built; the generator
does 5-7 and 5-9". The lead (2026-10-31): give it the 5-1/5-2/5-5 treatment.

How to start:
1. Write it as a hand stage like `w5Stage54.ts` (its own builder file), registered in `protoStage.ts` HAND_STAGES and
   STAGE_SECONDS (at least 2:00 for a quick player: a climb counts 20 s short, era RULES).
2. Fixed lessons (what is new in 5-8: check the old stage's first appearances), then pieces dealt per play with a `deck()` as in
   `w5Stages.ts`, the line-room rule (`fresh()`), caps, and `room()` filler. A climb's pieces: bloom-tree trunks to climb (V), silk
   lines (V, taught 5-4), swaying orchids as stepping blooms (Z, taught 5-3), sheets on ledges (Z), spiders on branches (C).
3. Climbs: a miss falls at most one trunk section (STAGE-RULES §2 "Falls in climbs", catch branches).
4. Its tests: copy the shape of `w5Stage54.test.ts` (every roll finishable, flags every 45 s, lines before things, real-thumb crossings).

## 6. Also not started (from the morning's brief)

- The World 5 lever/plate/door room from the unused `w6to10/props-made/w5b` kit (needs `puzzlePlay.ts` for W5).
- The billowing web (`w6to10/props-made/w5web.webp`, not polish-ready: dashed strands, pink cast, fringe; re-roll on HF).
- Re-curating 5-7 and 5-9 (both above 0.45 already; era's "nearest 1.00" there is its 80 draws over 16 shipped rolls).

## 7. Checks

`npx tsc --noEmit -p .`; the full suite (CLAUDE.md, with the gen2 globs); `npx vite build`; `node tools/perf/artcheck.mjs`;
`node tools/perf/drawcheck.mjs` (passed today at 6bdf19a3). Measuring: `npx tsx tools/inspect/era.ts --worlds 5 --stages 5-6
--rolls 80 --bots 0 --look 0 --json out.json --html /dev/null`, then `tools/inspect/deadProbe.ts --stage 5-6 --variants 1,2,3`.
The extended line-order run: `W5_ORDER_SEEDS=16 npx tsx --test --test-name-pattern="holding right" src/game/w5Order.test.ts`
(at the branch head: 5-1, 5-2, 5-4 clean; 5-5 seeds 186 (it failed the same way on main) and 223; 5-3 seeds 260, 334, 371, all the soft
chairs' line held behind something; the 4-seed gate is clean).
