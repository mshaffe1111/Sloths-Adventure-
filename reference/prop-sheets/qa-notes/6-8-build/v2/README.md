# 6-8 Stilt Climb, v2 (the lead's review, 2026-10-29)

Stills at each beat, upright (390x844) and sideways (844x390), from the real game on roll 1, plus a 35 s run (`run-sideways-35s.mp4`:
real inputs, cut between the beats). The stills have the tips switched off so the frames are clear; the video has them on.

| Beat | Files |
|---|---|
| The start: the mudflat at low tide | `1-start-*` |
| The tide turns (up the first root) | `2-tide-turns-*` |
| The first liana (the tide holds on its shelf) | `3-first-liana-*` |
| The animals (a frog under a moss arch) | `4-animals-*` |
| A surge of the spring tide | `5-tide-surge-*` |
| The crown and the reveal of the ruins | `6-crown-reveal-*` |

What changed from v1, point by point:

1. **The tide is the star.** It rises in surges (every 4 s on Normal, 5 s on Easy: a surge at twice its speed, slower between, the
   same average), each surge a flare of foam along its line, splashes and a rush. It is drawn twice: behind the climb, and again in front,
   a little see-through, so the roots it has swallowed show dimly under it. 6-8 shows more of the world (sideways 760 px tall, upright
   520 wide), it waits closer under him (Normal 400 px, Easy 460), and the camera drops so its line sits near the bottom of the screen.
2. **The reveal.** Up the last root the mangrove's middle and near strips fade out and World 7's ruins fade in (its dusk sky, its middle
   and near strips) in golden light; on the crown the camera pulls back. The crown now spans the top of the canopy, with the shrine at
   its far end, so he walks across it with the ruins opening up. Pokey's line: "Stone towers. Past the trees." *(new, needs Matt's
   approval)*. A painted far view of the ruins on the skyline is still the better picture (PLAN.md's Gemini prompt).
3. **Variety.** Matt's World 6 hides and arches sheet (reed hide, moss hide, hollow log, moss arch, root arch, root mound) stands on the
   wide shelves, clear of roots, flags and the fern; some shelves are short perches (the kit's perch art). The kit's root wall was tried
   in panels behind the climb and taken out: its square edges read as crates.
4. **Pickups.** One petal partway up every other root, one in the arc of each hop, one in each liana's leap: a trail up, not a stack.
5. **Who speaks.** Dot is away from 6-6 on (`wayside.ts dotPresent`: her last note is halfway through World 6), so 6-8's lines are
   Pokey's own thoughts, as in the other late World 6 stages. (STAGE-RULES §5b item 7 says "Pokey only in World 7": the code and the
   story put Dot away from 6-6 on, so that line and `dotPresent` disagree; the lead to settle which.) Under the new rule (Dot is a guide,
   not a narrator) two lines went: "The water stops at the flags. Breathe." (nagging) and "Wait for the swing. Let go at the top."
   (lianas are taught in 6-1). Left: the water warning (gen2's), the tide turning and the tide close (first time, once each), the spring
   tide (the hazard changes), and the reveal ("Stone towers. Past the trees.").

Also fixed on the way: 6-8 had lost World 6's story find (the book in a Hush Fern) when it left the old generator; it is back, on the
slack-water shelf.

## Polish check (STAGE-RULES §5b)

| # | Item | Verdict | Shown in |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass (fixed)**. The tide is Matt's painted dirty water, drawn behind the climb and again in front, see-through. The code-drawn bottom-edge darkening is gone (a gradient blob). Left in code: the foam flare along the waterline and the reveal's golden light, both small light touches. | `5-tide-surge-*`, `6-crown-reveal-*` |
| 2 | Nothing looks copy-pasted | **Fail, needs art.** Matt's hides and arches vary the shelves, and some shelves are short perches. But every ledge is still World 6's one grey root plank, and the crown's long plank shows it most. No other World 6 ledge art exists to mix in. Gemini prompt below. | `3-first-liana-sideways`, `6-crown-reveal-sideways` |
| 3 | Art matches what it is | **Pass.** The tide reads as dangerous water, the frog keeps its red danger ring, and the hides and arches stand on their shelves, never in the air. | `4-animals-*` |
| 4 | Light fits the place | **Pass.** Dusk in the mangrove, then golden light over the ruins at the top. | `1-start-*`, `6-crown-reveal-*` |
| 5 | Pokey on model | **Pass.** The game's own sprites. He reads small on the crown sideways while the view pulls back, which is on purpose for the reveal. | `6-crown-reveal-sideways` |
| 6 | Framing works both ways | **Pass (fixed).** The tide's line sits near the bottom of the screen in both views. On the crown, the reveal takes over the camera, so the tide no longer drags Pokey under the HUD. | all |
| 7 | Text stays out of the way | **Pass (fixed).** Lines are under 10 words except gen2's shared water line, which is exactly 10. Two nagging lines were cut. Speaker: see point 5. | video |
| 8 | Every move it teaches is needed | **Pass.** Tests take each liana away, and then all the roots, and the top can't be reached. Catches are never a short cut. | `w6Stages.test.ts` |
| 9 | Moments feel like moments | **Pass (fixed).** The tide turning gets a rumble, a shake, a churn of splashes and Pokey's line. The reveal gets the strips fading over, golden light, the camera pulling back and a chime of discovery the first time he steps onto the crown. | `2-tide-turns-*`, `6-crown-reveal-*`, video |
| 10 | Motion is smooth | **Pass (fixed).** The surges were a step change (twice its speed, then about half). Now they swell and ease on a curve (a test checks for no jerk). The camera's pull-back is eased. | video |

### The art that's missing (item 2): a World 6 ledge set (Gemini prompt for Matt)

Attach `reference/prop-sheets/w6/kit.jpg` (World 6's kit) as the style reference:

> A sprite sheet on a flat magenta (#FF00FF) background, 2 rows of 4, each piece separate with clear space around it, side-on view for a
> 2D platformer, in the exact painted style of the attached sheet (soft cel shading, dark outlines, grey-green mangrove wood with moss
> and pale fungus). Row 1, ledges to stand on, each about 3 times as wide as tall, flat walkable top: (1) a twisted mangrove root bent
> into a flat shelf with prop roots curling under it, (2) a plank deck from an old stilt house lashed with rope, (3) a knot of three
> roots grown together with barnacles and a little moss on top, (4) a fallen branch wedged between two stilt roots. Row 2, the same four
> as short perches about 1.3 times as wide as tall. No characters, no text.
