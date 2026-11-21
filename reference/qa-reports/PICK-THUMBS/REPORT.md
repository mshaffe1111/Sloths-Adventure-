# PICK-THUMBS: the testers' World 1 page, Matt's layout (R-165.368)

Member: PICK-THUMBS (UI, Opus 5.5 high). Branch `t-pick-thumbs` from `origin/t-keeper-pick` @ 599c4d5b3.
Final head: __HEAD__ (written __TIME__ ET by `date`).

Matt, 11-21 10:28 AM ET: "smaller pictures of the ... 9 different levels, letting somebody pick which level they want to play. And then also
have some of the controls like we have. And then a brief explanation of how to start it." + "a brief explanation of what the game is about".

## What changed (src/components/ControlTestGate.tsx, src/index.css, src/components/ctestPicker.test.ts)
The page, top to bottom (upright and sideways):
1. **Title**: the kicker, the "Pokey's World 1" plaque with the NEW tag beside it.
2. **About** (`CTEST_ABOUT`): one line in two sentences, Pokey cheering on its right.
3. **How to start** (`CTEST_HOW`): three numbered steps in the page's own order (Refresh, a picture, name + setting + Start).
4. **Refresh** box: unchanged, in the same place (right under the intro, where testers find it).
5. **Pick a level**: nine PICTURE tiles, each the stage's own still (`src/assets/ui/ctest-<id>.webp`, via the existing `ctestStill`; no new
   image files, sized with CSS), the number and name under it. Upright 3x3, pictures cropped to 16:10 so Pokey stays in; sideways 5 over 4
   with the 4 centred, pictures at the still's own 880:425 shape. The picked tile: a thick gold frame with a glow, lifted 2 px, its label
   gold. The played tick kept (now with a white ring so it reads over a picture). `loading="lazy"` on the tile pictures.
6. **The moves** for the picked level: as today.
7. **Get started**: name, How hard?, Start, as today, but WITHOUT its 1/2/3 number tokens (the lead's ruling 11-21: one numbered list).

The big single still at the top is GONE (my call in the mock-up, approved by the lead): the tiles replace it. Its CSS (`.ct-hero*`) is
deleted (new replaces old). `CtestPage.alt` (the still's words for a screen reader) stays in the data and its test; the tile pictures are
`alt=""` because each tile button already carries its aria-label ("1-4, Up the Kapok, played").

Kept: the recorder's stage field (`ctestBegin`), the survey naming the stage, the played tick, the Refresh behaviour, every ctest test
green, clipcheck's picker walk (`.ct-pick[data-stage="1-5"]`).

## DRAFT words for the story keeper (approved by the lead 11-21 as drafted, against STORY-KEEPER.md:58-59)
- ABOUT: "Pokey is a little sloth with a long way to go. Meeca has been taken, and she left him one job: follow the petals through the rainforest!"
- HOW TO START: 1 "Tap Refresh, just below." 2 "Tap a picture to pick a level." 3 "Type your name, choose Easy or Normal, then tap Start."
Built from the game's own lines: 1-2's letter "Follow the petals" (storyWorlds.ts:74), Meeca's "Follow the petals!" (STORY-KEEPER §2).

## New test (ctestPicker.test.ts, "the front page (R-165.368 ...)")
Pins: the about line on the page, names Pokey, at most two sentences; three how-to steps (Refresh / pick a level / name, Easy or Normal,
Start); the page order about < how < Refresh < tiles < moves < name box; nine `ct-pick-pic` and nine `ct-pick-t`; exactly three `ct-step`
tokens (one numbered list); no `ct-hero`. Planted: on the base 599c4d5b3 the imports `CTEST_ABOUT`/`CTEST_HOW` do not exist and the file fails.

## Mock-up (shown first, 10:45 AM ET; the lead APPROVED at 2x)
reference/qa-reports/PICK-THUMBS/mockup/: mockold-up-full, mockold-side-full, mock-up-full, mock-side-full, mockold-up-grid,
mockold-side-grid (2x tile crops), before-up-full (the page before).

## Gates on the final head
__GATES__

## Polish check (law 1; every still at deviceScaleFactor 2; reference/qa-reports/PICK-THUMBS/final/)
- final-up-full / final-side-full (fresh save: 1-1 picked, no ticks), finalold-up-full / finalold-side-full (old save: 1-4 picked, 1-1/1-2/1-4
  ticked, name "Sam" kept, Start green), finalold-up-grid / finalold-side-grid / final-up-grid (2x crops of the tile grid), small-sup-full
  (360x640) and small-sside-grid (640x360).
- Every picture reads as its own stage at phone size: Pokey visible in each (upright crop 16:10 keeps 1-4's Pokey, at 74% of the still's width).
- The picked tile is unmistakable both ways; the tick reads over a picture (white ring); names wrap to two lines at most and never cut.
- 360x640 upright: the NEW tag sits close to the card's inner edge but inside it; no cut, clipcheck clean.
- Sideways: the about line runs wide with Pokey at the far right; it reads, but a lot of air sits under the two lines. Left as is.
- The full-page stills are stitched from screen-height shots (the page scrolls inside its scene); the backdrop's bands in the margins are the
  stitch (the backdrop is `fixed`), not the page.

## Notes for the lead
- The test-link build is 479 files against its 480 limit (build.py). This job adds no files (the nine stills were already in the bundle via
  `ctestStill`'s glob), but the next job that adds any file will hit the limit.

## Lessons applied
- D79 (judge the whole screen): every still judged top to bottom, both saves, both ways, two phone sizes, not just the grid.
- D86 (the CLAUDE.md list, every item): every CLAUDE.md check run, not only the packet's, each with its verdict above.
- D102 (read lean): ControlTestGate.tsx and index.css read by line ranges; no whole design docs.
- D105 / D57 / D87 (inbox): ReadNotifications at every step and push; the lead's 10:46 ruling read at 10:46 and done in the next commit.
