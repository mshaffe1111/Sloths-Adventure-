# Special-stage mock-ups: World 9 and World 10 (for Matt, nothing built)

2026-10-30. Show first: Matt approves these before either stage is built.

| Stage | Design | Best stills |
|---|---|---|
| **9-2 The Last Trees** (World 9's three-layer canopy, the new hang-under move) | `w9-last-trees/DESIGN.md` | `w9-2-shadow-sideways.jpg`, `w9-1-too-thin-upright.jpg`, `w9-4-tops-sideways.jpg` |
| **10-8 The Clockwork Gate** (the General's machinery, beaten by patience) | `w10-clockwork-gate/DESIGN.md` | `w10-4-hold-sideways.jpg`, `w10-2-weight-sideways.jpg`, `w10-1-gate-upright.jpg` |

Every still comes in upright (390x844) and sideways (844x390), saved at 2x. They're built from the game's own painted art. Code-drawn
stand-ins (World 9's ants; World 10's gears, pendulum and weights) are tagged on the picture, and each design lists the new art with a
ready-to-paste Gemini prompt.

`tools/` holds the throwaway scripts that made them (not game code): `cut.py` cuts sprites out of an atlas into `crops/`;
`compose.mjs <scene file> <out dir>` lays a scene out in world units and screenshots both orientations with the pre-installed
Playwright; `w9.mjs`, `w10.mjs` are the scenes. They expect the crops in the working folder they run from.
