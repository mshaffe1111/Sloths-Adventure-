# World 7 swing and climb sections: Polish check (2026-10-29)

These are the liana and brown-vine sections in `src/game/gen2/worlds/w7Swing.ts`, for 7-5 Stone Sentries and 7-9 The Golem's Hall.
They were checked against STAGE-RULES §5b at phone size, upright 390x844 and sideways 844x390, on a development build.
For the pictures, the sections were added to `w7GameKit` locally; adding them for real is the main builder's step in `w7Game.ts`.
Stage 7-5 is layout 0 (a first swing, a three-swing chain, then the first brown vine). Stage 7-9 is layout 3 (two walls). There are no
puzzle rooms in this work: World 7's two rooms are the main builder's, with their own proofs.

| # | Item | Result | Shots |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** Everything on screen is painted art: the carved stone ledges, the root-covered wall faces, the lianas, the climbing vines and the backdrops. Nothing in these sections is drawn in code. | all |
| 2 | Nothing copy-pasted | **Pass for the sections; one art gap named.** Ledge widths and heights vary across perches, plinths and knees, and the wall tops step up and down. **Rough spot (not this work's code):** a tall bank body under a high ledge is drawn as plain stacked cream bricks, the same block repeated down the column. Prompt B below. | 03, 05, 07 sideways |
| 3 | Art matches what it is | **Pass for the sections; one art gap named.** Pokey stands on the ledge tops, the vine climbs the wall's face, and the swing's arc stays clear of the walls. **Rough spot:** a liana hangs from a leafy clump floating in the open sky. That's the game's liana art in every world; in the ruins it should hang from stone. Prompt A below. | 02 upright, 01 |
| 4 | Light fits the place | **Pass.** Day and dusk ruins; the ledges, animals and petals all read clearly. | all |
| 5 | Pokey on model | **Pass.** The game's own frames (climb, hang, stand); nothing new was drawn. | 01, 04, 06 |
| 6 | Framing both ways | **Pass.** Sideways shows the liana and its perch together. Upright shows Pokey on the liana with the perch ahead (02), and the wall's top while he climbs (04). | 01, 02, 04 |
| 7 | Text out of the way | **Fixed (3 things).** (a) The first-liana lesson card was said by **Dot** in World 7, against Matt's rule: lesson cards now go to whoever is with Pokey, his own thought while Dot is away (`lessons.ts` `lessonSaidBy`, tested). (b) Pokey's bubble sat over the vine or liana he was holding: while he holds on, it now hangs under his feet. (c) Swinging, he carried himself into a bubble placed at the grab: it now moves off him, at most every 0.7 s so it doesn't jitter. **Rough spot (not this work):** two of the stage's story lines run long ("I'm the loudest thing in these ruins. That has never happened before." is 12 words). | 01, 02, 04, 06 |
| 8 | Every move needed | **Pass, proven.** On 20 rolls of each stage, Normal and Easy, the quick route swings on every liana and climbs every brown vine (`w7SwingRoute.test.ts`). A missed grab lands softly in the pit, whose steps go back up only to the swing's own ledge. | 02b |
| 9 | Moments feel like moments | **Pass.** The first brown vine gets Pokey's line ("Brown vines. Still strong enough to climb."). Swinging and climbing were taught back in Worlds 1 and 4, so there is no other first-time beat. | 06 |
| 10 | Motion is smooth | **Pass.** Each liana swings by itself (the engine's swing). The climb is smooth and the camera follows him up onto the wall top. A plinth on the wall top stops a plain walk until he hops: that's the planned beat (40 px, one hop, like World 6's root knees). | first-swing-sideways.mp4, first-climb-sideways.mp4 |

## Missing art (Gemini prompts for Matt)

**A. Liana anchors for the ruins** (attach `reference/prop-sheets/gemini-batch-2026-10-28/w7a-puzzle-take2.jpg` for the style):
> Side-view 2D game prop sheet, hand-painted storybook style matching the attached image, solid magenta background, no shadows on the
> background. Four variants of the broken end of a carved stone temple lintel, seen from the side and a little below, with a thick brown
> liana knotted around it and hanging straight down out of the frame. Moss, dry brown leaves and small cracks. The top edge of each piece
> is cut off, as if the lintel runs on above the screen. About 300 x 220 px each, evenly spaced, nothing touching.

**B. Tall temple wall bodies** (attach `05-wall-top-sideways.jpg` from this folder for the style and scale):
> Side-view 2D game tile sheet, the same hand-painted ruined-temple style as the attached screenshot's carved ledges, solid magenta
> background. Four vertical strips of ruined temple wall, each 220 px wide and 900 px tall: weathered stone blocks of mixed sizes,
> carved meander bands, cracks, dry brown roots and moss creeping down, one strip with a worn carved face. The top and bottom edges of
> each strip must tile when stacked, and the strips must sit side by side without a visible repeat.
