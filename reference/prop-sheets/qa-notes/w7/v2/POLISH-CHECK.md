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

## Round 3: the Hugging Face World 7 art wired in (stills in `../v3/`)

| Piece | Where | State | Proof |
|---|---|---|---|
| Ring of chairs (`chairs-ring.webp`) | 7-3's courtyard, behind the floor, 1000 px wide, its carved strip under the floor's lip | Wired. The chairs stand on the courtyard, each one its own, the plain eleventh set apart | `v3/7-3-chairs-*.png` |
| Stone Sentry | 7-5's hall guards | Wired (round 2) | `v3/7-5-sentry-*.png` |
| Vine anchors (`vine-anchors.webp`) | every World 7 swinging liana: the lintel fixed at its top, the anchor's own liana run down its length, turning with the swing; no leaf clump | Wired. On upright the lintel and knot show at the top; sideways the top is above the screen | `v3/7-5-liana-*.png`, `v3/7-9-liana-*.png` |
| Spare liana runs | the brown vines down the old walls (14 px stems, each thinning away at its foot, no cut ends) | Wired | `v3/7-3-wall-*.png`, `v3/7-7-wall-*.png` |
| Temple walls (`temple-walls.webp`) | the face of every high ledge (a run of banks standing 90 px or more over the floor beside it), in place of the plain stacked bricks and the kit's root wall | Wired: one grid of strips through the stage, so a run of banks is one wall and its columns carry on across the banks' 40 px steps | `v3/7-5-high-*.png`, `v3/7-7-wall-sideways.png` |

Rules kept (tested, `src/game/w7TempleArt.test.ts`):
- never the same strip twice side by side;
- the sloth face (wall-3) at least 8 columns (1,760 px) from the next, never twice down its column;
- wall-4 only on a lone ledge one strip wide. Its root runs off **both** edges, the left at y 830-858 and the right at y 571-604 (measured), so it can't sit beside any strip, mirrored or not.

**Rough spot, named:** with the face kept rare and wall-4 kept alone, a wall alternates wall-1 and wall-2, so wall-1's root comes back every 440 px. Mirroring and a different height per column soften it, but a wide wall shows it two or three times (`v3/7-5-high-sideways.png`). The fix is one more plain strip without a root (220 x 900, the same stone).

## Round 4: the lead's review of round 3 (stills in `../v4/`, one device per orientation, the stages in order)

| # | Item | State | Proof |
|---|---|---|---|
| 1 | "Brown vines..." on every stage | Fixed. A lesson line (tiles, brown vines, dirty water, sentry) is said once per save, in the first stage that reaches it (`StageHint.firstOf`, kept on the device under `tipMemory` FIRST_OF_STAGE; tested on every shipped roll, and in the real game: heard in 7-1, silent in 7-9). The shrine lines say why the exit is shut, so they stay every stage. Under the polish-dot rule "a room's first line names the problem", the Normal entry lines no longer give the answer: "Sealed. This old door won't budge." (7-3) and "Another sealed door. How does this one open?" (7-7); Easy keeps its nudge (Help) | `v4/7-7-wall-sideways.png` (no line: 7-3 said it), `v4/7-3-wall-*.png` (said once) |
| 2 | Patchwork bank faces | Fixed. hf-art-ground merged into this branch: every World 7 bank is the one painted soil (`groundPaint.ts`, `src/assets/ground/w7.webp`), no panels. The temple wall faces only high ledges, its strips cross-faded into each other (no straight joint), and it ends 150 px under the floor beside it, fading into the same soil, so no seam runs down the screen. The statues sit in the soil in a soft dark hollow; the fig roots hang from the lip; every piece sits wholly inside its bank (one was cut off at a bank's edge) | `v4/7-5-start-*.png`, `v4/7-3-start-upright.png`, `v4/7-7-wall-upright.png` |
| 3 | Floating slabs | Fixed. They were the fallen-column pieces set into the old earth faces; out of `w7FaceArt.ts` | `v4/7-5-start-sideways.png`, `v4/7-3-start-sideways.png` |
| 4 | wall-1's root every other column | Fixed. wall-5, a plain root-free strip made on Hugging Face (hfb-w7wall5, 1.3 min, ~$0.06, two takes; s58-17 kept, s58-29 too brown), cut to repeat top to bottom and graded to the kit. It takes two of three of wall-1's columns: the root is on under a fifth of all columns (tested) | `v4/7-5-high-sideways.png` |
| 5 | 7-5's first sentry met mid-fight | Fixed. No other animal from Pokey's line to 260 px past the first sentry (`w7Finish`; tested on every shipped roll); 7-5 re-curated: 16 shipped, variety 0.53 | `v4/7-5-sentry-upright.png` |

**Rough spot, named (not mine to fix under its owner):** hf-art-ground's step ends. Where a bank stands one plinth step (30-40 px) over its neighbour, the painted bank end fades out over the lower bank's lip, and on so short a drop its whole face comes out see-through: a pale ghost box at each plinth's ends (`v4/7-5-sentry-upright.png`, left of Pokey). It needs its fade to end at the lower bank's top on a short step (`groundPaint.ts drawEnd` / `protoArt.ts` `step + 26`).
