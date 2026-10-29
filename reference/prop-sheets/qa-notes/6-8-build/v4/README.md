# 6-8 Stilt Climb, v4 (the lead's third review, 2026-10-29)

Stills at the same beats as v3, upright (390x844) and sideways (844x390), real game, roll 1, tips off for clear frames, plus
`7-crown-exit-*` (Pokey at the shrine at the end of the pull-back). v3's README has the earlier changes.

## What changed from v3

1. **Nothing floats** (`w6Stages.ts`, the ledge pass; `w6StiltArt.ts`).
   - **What grows out of the ground stands on something.** This covers the stump, the root arch, the den, and w6var's second plank,
     which is a slab on spreading roots and read as a stump too. Each goes only where something holds it:
     - its own roots stand on the ledge under it (sized so its feet land on that ledge's top), or
     - it stands on stilt posts (two under it, never one balanced pole) that reach the ledge under it.
     Any one of these is laid once on a ledge, never twice side by side.
   - **Every stretch of every hanging ledge is held up** (planks, logs and the kit's plank), within 300 px. The holds are, in order:
     - a climbing root that tops out under it or stands on it;
     - a short stilt post (w6balt's gauge post) standing on the ledge under it;
     - a brace slanting down to a climbing root's trunk beside it;
     - lashed ropes (the game's painted rope) up to the ledge over it;
     - a longer post as a last resort.
     The crown has nothing under it, so it stands on long posts at its ends and middle.
   - Posts never pass through a ledge or skim one's end. Posts stay clear of the climbing roots, so they don't read as one.
   - A test checks every ledge, every stretch and every hold on 12 rolls (`6-8 nothing floats`).
   - The first try put a post under every plank all the way down to the water, about 90 poles a stage. Every screen read as a
     cage, so that was replaced by the rule above.
2. **The start bank is painted.** The soil is w6var's bank piece, drawn as one piece so there are no tile seams. It ends in w6var's
   bank edge, mud and roots breaking off into the water, and the soil fades out over the edge's cut side, so there is no line. The
   square knee is now w6var's stump standing in the mud, sized so its roots reach the mud.
3. **The crown is not one strip.**
   - Four heights:
     - a drop behind the root;
     - the piece the root tops out on;
     - two hops up to the shrine.
   - Pieces that meet end to end never share a look: plank, logs, plank, a big log under the shrine.
   - Long posts hold it at both ends and in the middle.
   - At the end of the pull-back:
     - the view pulls back less sideways (0.8, was 0.72), so Pokey is bigger;
     - a warm light glows behind him so he stands out against the dusk.
4. **The wayside line on the upright crown** is left for the Dot helper, as the lead said.

## Polish check (STAGE-RULES §5b), v4

| # | Item | Verdict | Shown in |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** Ledges, posts, braces, the bank and its edge, the stump knee and the ropes are all painted pieces (World 6's sheets and the game's rope). The code adds only the tide's foam flare, the reveal's golden light and the warm glow behind Pokey on the crown. | all |
| 2 | Nothing looks copy-pasted | **Pass, with a limit named.** No ledge shows the same piece twice side by side, and pieces that meet end to end differ. Over 12 rolls, about 1 near pair in 7 matches (12-17%; v3 was 1-9%), and no piece is over 40% of the ledges. The cost of the support rule is that a log or the kit's plank fits almost anywhere, while a stump, arch or den only fits where its stilts can stand. Matt's World 6 ledge set (in his prompt queue) adds pieces that can hang. | `3-first-liana-*`, `5-tide-surge-*`, `6-crown-reveal-sideways` |
| 3 | Art matches what it is | **Pass (fixed).** Nothing floats: every stump, arch, den and slab stands on its ledge or on stilts, and every plank and log is held. The tests check each hold's ends. | `2-tide-turns-*`, `3-first-liana-*`, `5-tide-surge-*` |
| 4 | Light fits the place | **Pass.** Mangrove dusk, then gold over the ruins, with a warm light behind Pokey at the top. | `1-start-*`, `7-crown-exit-*` |
| 5 | Pokey on model | **Pass.** The game's sprites. | all |
| 6 | Framing works both ways | **Pass.** The tide is in frame on the climb and drains for the reveal. Upright, the crown holds Pokey mid-screen, and sideways he is larger at the end of the pull-back. | `6-crown-reveal-*`, `7-crown-exit-*` |
| 7 | Text stays out of the way | **Pass, with notes.** 6-8's own lines are short. The wayside story box on the upright crown is the Dot helper's (the lead's call). The generic flag and shrine lines still show under Dot's name, although Dot is away from 6-6 on (shared UI). | `6-crown-reveal-upright` |
| 8 | Every move it teaches is needed | **Pass.** Each liana and the roots are needed (tests). The crown adds two plain hops to the shrine. | tests |
| 9 | Moments feel like moments | **Pass.** The tide turns with a rumble, a shake, churn and a line. The reveal has the fade, the gold, the pull-back, the chime and the warm light. | v3 video |
| 10 | Motion is smooth | **Pass.** No change from v3. | v3 video |

## Fix by fix (the lead's list)

1. Floating stumps, dens and logs: fixed by the support rule. See `2-tide-turns-*` (the stumps stand on stilts, logs on a root),
   `3-first-liana-*` (dens and stumps on stilts, logs on roots and posts), `5-tide-surge-*` (the den on two posts, the stump on its
   root) and upright `4` and `5`.
2. The start bank: `1-start-*` shows the painted soil in one piece, the mud edge into the water, and the knee as a stump.
3. The crown: `6-crown-reveal-sideways` and `7-crown-exit-*` show four heights, mixed pieces, posts at the ends and middle, and
   Pokey larger with a warm light behind him.
4. The wayside line: left for the Dot helper.
