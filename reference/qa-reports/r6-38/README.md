# R-6.38: World 1's pits read as pits (fix-petals, fun-validator)

The lead moved R-6.38 from w8-rope2 to fix-petals on 2026-11-04 (the keeper's estimate: 3 h). The art comes from the R-159.1 pit list,
which Matt approved and the lead accepted: the drop s52-7, the lip s55-7 and the bed s60-7. The high drop s65-23 is no longer used (see
1-8 below). **No new painting and no spend.** The takes came from `hf://buckets/mshaffe111/w5-xfer/r159/r159-pits/props/`.

**Planned vs actual:**
- Planned: 3 h.
- First cut: 11:46 AM to 12:55 PM ET (103d7f47).
- The redo (the lead's and the QS's notes) ran to 1:38 PM ET (a90c542f), so the look took about 1 h 50 min.
- The gates and this report come on top of that; the end time is in the message to the lead.

## Sheets (layout 1, Normal, the real game, upright 412x915 and sideways 915x412)
- `pits-sideways-before-after.jpg` and `pits-upright-before-after.jpg` cover 1-3, 1-5, 1-9, 1-6, 1-7 and 1-8. Before is the base
  (6dc4dab8), after is this build (a90c542f).
- Close-ups: `closeup-soft-pit-1-3.jpg` (a soft pit) and `closeup-drop-1-8.jpg` (1-8's drop).
- `dot-bubble-over-pit-1-9-sideways.jpg` and `-upright.jpg`: Dot's bubble sits solid on top of the pit. It is page text over the game
  screen, so no pit paint can reach it.
- `demo-marked-drop-1-6.jpg`: a builder's marked drop (`pit: 'drop'`). 1-6's water was tagged in the page only, stamped DEMO, and nothing
  ships tagged.

## The redo, item by item (the lead's five)
1. **Soft pits, top edge and lips.**
   - Under a torn, uneven line, the backdrop fades to dark over 70 px. The fade is front-loaded: 62% dark a third of the way down.
   - Below that comes the drop's dark earth.
   - The torn root lips hang down both bank faces.
2. **The leaf bed.**
   - Each tile is scaled 0.75-1.25, flipped at random and offset, with gaps here and there.
   - It sits low on the floor, so it reads as a bed, not a hedge.
3. **1-8, no grey box.**
   - The canopy below the branch goes dark fast: 50% a fifth of the way down, 84% by halfway, then black.
   - The darkness is drawn over the ground layer and feathered in from inside the gap. The understory under each section of branch ends
     square at the gap, so an outward feather was hidden and the sides read as cut lines (seen on the first redo still, fixed).
   - Torn bark ends at both banks come from 1-8's own breaking-branch art (`chaseBrokenL` and `chaseBrokenR`).
   - **The high take is dropped, and the drop take doesn't fit 1-8 either.** Both are earth, and 1-8 is a branch high in the canopy. The
     existing art does the job, at $0.
4. **1-5's soil step.** The step at the pit's wall is shaded to match the drop around it.
5. **Dot's bubble.** See the two 1-9 stills above.

The calls on the leaf bed (every soft pit) and on 1-6 (stays water) are approved. The rules are unchanged: the redo touched only the
look, and no platform moved.

## What was built (unchanged from the first cut)
- **The pits** (`src/game/w1Pits.ts`, found once per stage from its platforms):
  - a soft pit has a floor 100-200 px under the ground line. 1-1's 75 px sunk steps are steps;
  - a fall has no floor;
  - 1-8's gaps are the holes between the chase's sections;
  - a tall stump on the ground is ground, and a breaking branch over a gap is not a floor;
  - an unmarked fall is water (only 1-6 has one), and a bank marked `pit: 'drop'` is a painted drop.
- **The draw** (`protoArt.ts` drawProtoScene, World 1 only):
  - the drop is drawn under the ground;
  - the lips, bed, step shade and 1-8's darkness and ends are drawn over the ground;
  - each pit's pictures are baked once into its own canvas.
- **Loading.** 'pit-art:1' is on every World 1 stage's sheet list, and stagePreload loads the three pictures.
- engine.ts is untouched.

## Proof (gate lines pasted from output)
Each line is pasted from the output for this tree (a90c542f plus the validator items).
- `npx tsc --noEmit -p .`: clean.
- `npx tsx --test src/game/w1Pits.test.ts src/game/stageSheets.test.ts`: `# tests 13`, `# pass 13`, `# fail 0`. The w1Pits fixtures
  cover:
  - a soft pit and its step;
  - a sunk step that is not a pit;
  - a fall;
  - a stump on the ground;
  - a breaking branch over a gap;
  - 1-8's chase gaps;
  - World 1 layout 1's real counts;
  - a builder's `pit: 'drop'`.
- `npx vite build`: `files generated`, nothing over 4 MiB (`find dist -size +4M`: none).
- `node tools/perf/artcheck.mjs`: `PASS`.
- `node tools/perf/drawcheck.mjs`: `PASS (391 s; raw results in /tmp/drawcheck-6FbR7v)`. Its fixed set holds only one World 1 stage,
  1-4, and 1-4 has no pits.
- So the same check was also run on the pit stages (`PIT_SCEN=1-3,1-8,1-9,1-5`, a scratch copy of drawcheck.mjs that only swaps the
  stage list): `PASS (338 s; raw results in /tmp/drawcheck-KKd0FD)`. Per frame, upright:
  - 1-3: gradients 0.00 (limit 2), drawImageScreens 5.44 (limit 7.5);
  - 1-8: gradients 1.00, drawImageScreens 5.20;
  - 1-9: gradients 0.00, drawImageScreens 5.67;
  - 1-5: gradients 1.00, drawImageScreens 5.49.
  Sideways, the highest drawImageScreens is 1-9's 6.58.
- `node tools/perf/clipcheck.mjs`: `PASS (83 known) (215 s; contact sheet and breaches.json in /tmp/clipcheck-gO5IC1)`. A first run
  beside the pit drawcheck could not open some screens (exit 2), so it was re-run on its own.
- `node tools/perf/knowncheck.mjs`: `PASS`. `node tools/roadmapcheck.mjs`: `PASS`.
- `npx tsx tools/validate/funcheck.ts`: `PASS (152 known, 2072 stage-layout flags, World 1, 16 layouts, Normal and Easy; 45 s)`.
- The full suite (`npx tsx --test src/audio/*.test.ts src/game/*.test.ts …`, the CLAUDE.md list): `# tests 2309`, `# pass 2307`, `# fail 0`, `# todo 2`. `npx tsx --test tools/validate/*.test.ts`: `# tests 39`, `# pass 39`, `# fail 0`.

## Method used
- Shot the real game at fixed spots in both orientations, before and after.
- Zoomed crops to judge edges (the 1-8 side cut showed only at 2x).

## Lessons applied
- I look at my own stills before reporting. That is how the 1-8 cut line was found and fixed.
- Times are read from `date` right before writing them.

## Method update
A dev build for stills needs `NODE_ENV=development`, because `window.__play` exists only in dev. Also, after `--emptyOutDir`, restart the
static server: its folder is deleted under it. Added to the notes.

## Polish check (both ways up)
- Soft pits (1-3, 1-5, 1-9, 1-7):
  - they read as pits at a glance: the backdrop fades into dark under a torn top line;
  - roots hang at the banks;
  - a low leaf bed sits on the floor.
  - Close-up: `closeup-soft-pit-1-3.jpg`.
- 1-8 reads as a hole into deep canopy: dark, soft-sided, with torn ends at both banks (`closeup-drop-1-8.jpg`, upright on the sheet).
- 1-6's water looks as before, as approved.
- Rough spot, named: on 1-8, the understory panel under each branch section still ends square at the gap. The darkness now fades into
  it, but a square leafy corner shows at each gap's top. Closing it means drawing after the chase (engine.ts, w8-rope2's) or a painted
  branch end, which is not on the approved list.
- Rough spot, named: the leaf bed is brighter than the dark around it. That is on purpose: the pit is soft, and a miss costs nothing.
  Say if it should sit darker.
