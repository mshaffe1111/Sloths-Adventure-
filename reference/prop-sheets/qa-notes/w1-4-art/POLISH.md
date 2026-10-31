# World 1-4 new art: polish check (2026-10-31, w1-4-sheets helper)

Made as one batch per world on Hugging Face. Each world had one canvas with two of its approved pieces painted alongside as anchors
(`tools/art/w1to4/starts.py`), plus a fix round (r2) for the misses. Cut with `tools/art/w1to4/cut.py`:
- key, un-mixing the key colour from edge pixels;
- `tools/art/edges/defringe.py --despill --keep-line`, the fixed edge pipeline, unchanged;
- packed into `src/assets/w1to4art/w<N>-new.webp` + `.json`.

Nothing in `src/game` draws these yet. The gen2 builder of each world places them, and each piece is on the art-use allow-list under
that builder's name. `artcheck` passes. The four atlases come to 1.4 MB, none over 2128 px.

How the stills are made (`tools/art/w1to4/stills.py`):
- phone size: upright 390 x 844 and sideways 844 x 390, at 2x;
- the world's own far, mid and near strips and painted ground;
- Pokey's standing frame at the game's 66 units for scale;
- each piece at the size its grab-bag section plays it.

They're composites to judge how the art reads, not game screenshots.

Spend: r1 ~$1.0 (four jobs of 4-6 min) + r2 ~$1.0 (22 min) = **~$2.0** of the $10 cap. Log: `tools/art/w1to4/jobs.txt`.

## World 1 (15 pieces): `w1-sideways-*.jpg`, `w1-upright-*.jpg`

| Piece | Verdict |
|---|---|
| squirrel sit, wave, haul, tip, run | **Pass.** On the story squirrel's model (edits of `story18-squirrels` "laughing", then a 0.32 pass with the style model): same chubby red-brown body, cream belly, round face. All face right, and they read at 34-40 units next to Pokey. |
| acorn slope | **Pass.** Matt's branch at a slope, with the acorn stash at the high end. |
| vine rope | **Pass.** Tiles left to right (one twist per tile). |
| log hide | **Pass.** Reads as "crouch under here" at 190 units. |
| root gate shut / open | **Pass**, but they're the busiest pieces in W1. At 110 units the lattice reads as a gate; check it again in play. |
| Matt's 3 hollow logs (cut from his own sheet, no HF) | **Pass.** Upscaled 2x (Lanczos) to the props atlas's scale, a touch softer than the atlas's own log. |
| knot-a, knot-b | **Weakest piece in the set (named, not hidden).** Shelf-fungus bowls with a mossy rim. They read as steps at 44 units, but they're flatter than Matt's paint. Two rounds tried. If the builder doesn't like them, `trunkPlain`'s own knots are the fallback. |
| Thrown | HF boughs and stumps (softer than Matt's `branch` and `stump`, which are used instead) and round 1's off-model squirrels. |

## World 2 (20 pieces): `w2-*.jpg`

| Piece | Verdict |
|---|---|
| river stones a-c, reed islands a-b, sandbar | **Pass.** Wet grey stones with moss tops; mud islands with reeds. The sandbar is pale: it reads against teal water, less so against sand-coloured ground. |
| mooring post | **Pass.** Weathered post with rope wraps and a plank shelf. |
| barrels, crates (up and tilted) | **Pass.** |
| round cage (`cage-whole`) | **Pass.** A candidate for the cageA redraw (Matt picks). cageA itself is placed as a second look. |
| net empty / full | **Pass.** Painted on green, so the rose cords keep their colour (the old net lost it on magenta). |
| reed gate shut / open | **Pass with a note.** Tan reeds lashed with rope. A slight green cast shows between the reeds up close (the green key). At phone size it reads as reeds. |
| foam 1-3, waterline | **Pass.** White foam streaks, cut by brightness. |
| Thrown | sinking-pad frames (violet ripples; code sinks the existing `lily`); W2 pit water (the river strip already does the job). |

## World 3 (18 pieces): `w3-*.jpg`

| Piece | Verdict |
|---|---|
| stones a-c, shelves short and long | **Pass.** Evenly lit cool stone. The stones carry a thin cyan glow line, so each gap has its own lit rim (STAGE-RULES §4 underground rule). |
| crack-whole / crack-cracking | **Pass.** Glowing cracks; "gone" is the shards. |
| stalactite, shards | **Pass.** The stalactite reads at 60 units up in the dark. |
| root basket, counterweight | **Pass.** |
| bats asleep, stir, flap1, flap2 | **Pass.** Edits of World 8's painted fruit bat, so it's one bat design in both worlds. Fox snout, big ears, no sloth mask (round 1's had one: thrown). The flying pair face right. |
| spores 0-2 | **Pass.** Lavender puffs: swell, puff, burst. The code glow stays on top as a small touch. |

## World 4 (16 pieces): `w4-*.jpg`

| Piece | Verdict |
|---|---|
| Dot's knot, peg | **Pass.** A fat green vine knot on a peg (replaces the code knot). |
| slung log, rope anchor | **Pass.** |
| slate ledge whole / cracking / gone | **Pass.** Matches the W4 kit's blue slate and grass. |
| veil closed / parting | **Pass.** White-blue falling water on black (round 1's lavender veils, made on magenta, were thrown). |
| mist 1-3 | **Pass.** Soft banks that read over the cliffs. The cutter now takes the model's faint grey box off. |
| Sovereign shadow | **Pass.** A soft blue-grey eagle shadow from the Sovereign's own silhouette, painted on white and cut by darkness. |
| updraft 1-3 | **Faint (named).** Pale air with leaves. On the bright W4 sky they read as a hint, not a lane. The builder should draw them at full strength over the code leaf streaks, or ask for a round 3 at higher contrast (about $0.3). |

## Shared tools

- `tools/art/artuse.mjs` (new)
- `src/game/artUse.test.ts` + `artUse.allow.json` (new)
- `tools/art/w1to4/*` (new)

`tools/art/hfdrake/storygpu.py` and `tools/art/edges/defringe.py` are used unchanged.
