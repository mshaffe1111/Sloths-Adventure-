# World 7 (gen2 stages 7-1, 7-3, 7-5, 7-6, 7-7, 7-9): Polish check, 2026-10-29

Every still here is layout 1 on Normal, upright 390 x 844 and sideways 844 x 390 at phone size (`tools/art/w7/shots.mjs`); Pokey's lines in
context are in `lines/` (`tools/art/w7/lines.mjs`, a fresh page for each line so each one shows as a first-timer sees it); the short videos are
in `video/` (the first crumbling tiles in 7-1, the first Stone Sentry in 7-5).

## The lead's QA items (2026-10-29)

| # | Item | State | Proof |
|---|---|---|---|
| 1 | The crumbling tiles didn't look fragile | Fixed: Matt's painted crumble frames (cracked at rest, the breaking frame for the last third of his hold, the pieces falling) replace the plank and the code cracks | `7-1-tiles-upright.png`, `7-6-tiles-sideways.png`, `video/7-1-tiles-*.webm` |
| 2 | Upright ground was one stone block repeated down half the screen | Fixed: the bank faces alternate carved blocks and earth with roots, and carry Matt's painted fig roots, fallen columns and buried statues (`w7FaceArt.ts`), rows down tall banks | `7-1-start-upright.png`, `7-3-chairs-upright.png` |
| 3 | The backdrop's landmark repeated on screen | Fixed: World 7's near strip is drawn 1.75 times as wide (`scenery.ts` STRIP_GROW), so one landmark per screen | `7-1-start-sideways.png` |
| 4 | Rib-like roots | Fixed: the code-drawn fig root is out of World 7's kit (`envKit.ts`). The earth faces still carry long pale roots: they read as roots, but Matt should judge | `7-1-start-sideways.png` (right half) |
| 5 | The pale pane on the 7-9 wall | Fixed: the wall's face is the kit's three painted lianas down carved stone, no trunk pane | `7-9-wall-upright.png`, `7-9-wall-sideways.png` |
| 6 | Pokey's lines in context | Shot, each line where it comes up, both ways | `lines/` |

## The polish bar (STAGE-RULES §5b)

1. **Painted, not drawn: pass.** Tiles, bank faces, stone door, lever and plate (`w7PuzzleArt.ts`), the Stone Sentry (Hugging Face, `sentrySprite.ts`), 7-3's
   ring of chairs (Hugging Face, `w7ChairsArt.ts`), the dirty water in the chasms (`badWaterArt.ts`) are all painted. Code adds only the sentry's soft
   cyan eye and rune glow. `7-3-room-sideways.png`, `7-5-sentry-sideways.png`, `7-3-chairs-sideways.png`.
2. **Nothing copy-pasted: pass.** Faces mix blocks, earth, roots, columns and statues by spot; the ring of chairs is one set piece, each chair its own. `7-3-chairs-b-sideways.png`.
3. **Art matches what it is: pass, one note.** Tiles look cracked, the door looks shut, the chasm's water is dirty. The chairs stand on the courtyard (their carved
   strip sinks under the floor's lip). Note: sideways, a deep chasm's water is below the screen, so the gap reads as a drop rather than as water; the warning
   sign (a wave) stands at the first one and Pokey says the line. `7-1-chasm-upright.png` (water shows), `7-1-chasm-sideways.png` (below the screen).
4. **Light fits the place: pass.** Dawn, day, dusk by stage number; the sentry's glow is its own light. No underground stage in this set.
5. **Pokey and the cast on model: pass.** Satchel on his right hip, the sentry a head taller than Pokey (96 px), the ring's chairs half again his height.
6. **Framing both ways: pass, one note.** Upright shows the floor and the hall under it; the bottom third is the deep bank face, now dressed (item 2).
7. **Text out of the way: pass.** Every World 7 line is Pokey's (Dot is away), all under 10 words. One game-wide line not from World 7 shows in 7-5 ("One of these plants isn't like the others.", the hidden fern), at the top.
8. **Every move it teaches is needed: pass.** The tiles are never needed (checkStage proves every shipped roll without them); 7-1 teaches them over a sunken hall.
9. **Moments feel like moments: pass for the tiles, a rough spot for the sentry.** The first tiles: Pokey's line, the tiles shake harder as his hold runs out, the breaking frame, the pieces falling. The first sentry: Pokey's line 520 px before it, and its eyes brighten as it winds up. `video/`.
   **Rough spot, named:** in 7-5's layout 1 a tayra patrols the floor where the sentry line comes up, so the first sentry is met mid-fight rather than on a quiet floor (`lines/7-5-a-stone-sentry-sideways.png`: the tayra on Pokey, the sentry at the right edge). The fix is a quiet floor before the first sentry (no other animal within MEET_LEAD), then a re-curation of 7-5; not done in this round.
   The line shots missed 7 of 40 lines (7-5 most), each where an animal hit Pokey as he was set down, which holds the line back; those shots show the spot without the bubble.
10. **Motion smooth: pass.** The crumble frames swap in place (one scale for all three); the sentry's walk follows its stride (`video/7-5-sentry-*.webm`).
