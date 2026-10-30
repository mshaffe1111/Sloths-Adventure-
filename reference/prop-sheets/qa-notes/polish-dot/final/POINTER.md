# The pointer is gone (Matt, 2026-10-29, about 8:10 PM ET)

"dot just telling me the same tips over and over again and putting that horrible blue pointer, the helper, I want that out. I still see
it everywhere."

## Why he still saw it

The **live site** (main, last release PR #49) is older than the Dot rework: its DotGuide still draws the teal ring and the arrow (11
ring and arrow rules in its CSS). The work branch has had no ring or arrow since the rework merged (8d684792), so the live site loses
them with the next release. What the work branch still drew on a puzzle piece was smaller: Dot's twinkle on the thing when she pointed
after struggle, and Easy's sparkle on the important piece when he was stuck. Both are deleted now.

## What is gone, for good (no switch)

- The teal ring and the arrow (gone since the rework; a test keeps them out).
- Dot's twinkle on the thing (DotGuide.tsx: its element, its code, its CSS).
- Easy's sparkle on the puzzle piece (puzzlePlay.ts drawSparkle and its call). The stuck count it rode on stays, renamed `easyHelped`:
  it decides when Dot's next step is due, and draws nothing.
- The unused gesture-picture CSS (`.dg-glyph`).

A test checks that no ring, arrow, twinkle or sparkle is left in Dot's guide or the puzzle rooms.

After struggle Dot still flies to the piece and perches beside it as she says her nudge. Nothing is drawn on it.

## Before and after (live site above or left, this branch below or right; Easy, standing in each room, then walking back and forth)

| Where | Sideways | Upright |
|---|---|---|
| 1-6, the second seesaw room, walking in | shots/pointer-1-6-r1-enter-sideways.jpg | shots/pointer-1-6-r1-enter-upright.jpg |
| 1-6, the second seesaw room, stuck | shots/pointer-1-6-r1-stuck-sideways.jpg | shots/pointer-1-6-r1-stuck-upright.jpg |
| 1-6, the twist room, stuck | shots/pointer-1-6-r2-stuck-sideways.jpg | shots/pointer-1-6-r2-stuck-upright.jpg |
| 3-2, the root plate room, stuck | shots/pointer-3-2-r1-stuck-sideways.jpg | shots/pointer-3-2-r1-stuck-upright.jpg |

The live site's ring sits on the log in 1-6 and on the plate's gate in 3-2; this branch shows nothing there.

## Polish check

- Rooms checked in 1-6, 2-3 and 3-2, Easy (Help), upright and sideways: no ring, arrow, twinkle or sparkle anywhere.
- The room positions differ a little between the live site and this branch (the stages were rebuilt since), so each pair shows the same
  room, not the same pixel.
- Not shot tonight: World 9's rooms (not on the work branch yet; the same code draws Dot there, so nothing is drawn there either once
  it is).
