# 6-8 Stilt Climb, v4 (the lead's third review, 2026-10-29, with World 6's new ledge set)

Stills at the same beats as v3, upright (390x844) and sideways (844x390), real game, roll 1, tips off for clear frames, plus
`7-crown-exit-*` (Pokey at the shrine at the end of the pull-back). v3's README has the earlier changes.

## What changed from v3

1. **World 6's ledge set on every ledge it fits** (`src/assets/w6/ledges.webp`, from Hugging Face). The set has four kinds: root shelf,
   stilt deck, boardwalk and wedged branch. Each comes as a ledge and a perch (under 330 px), and each has its own painted supports.
   - Each ledge takes the tall piece, cut off where its supports reach the ledge under it. The cut ends stand on that ledge's top,
     the way the set's short pieces are cut, so one picture fits any drop. A table measured from the pictures gives where the
     supports are at each depth (`SET_ROWS`), and every support must land on a ledge.
   - Where the drop is longer than the whole piece, its supports are carried on down to the ledge under them by posts.
   - The kinds are mixed so neighbours differ. Over 12 rolls, nearby pieces match only 3-6% of the time, and no piece is over 30%
     of the ledges.
   - The set takes about 40% of the ledges. The rest are where none of it can stand. Those get a stump, arch or den, or a log or the
     kit's plank, under the support rule below.
2. **Nothing floats** (the support rule, `w6Stages.ts`).
   - A stump, root arch or den (or w6var's slab on spreading roots) goes only where its own roots stand on the ledge under it, or on
     stilt posts reaching that ledge (two, never one balanced pole). Each is laid once on a ledge, never twice side by side.
   - Every stretch of a log or the kit's plank is held within 300 px. The holds are, in order:
     - a climbing root under it or standing on it;
     - a short gauge post (w6balt) on the ledge under it;
     - a brace to a root's trunk;
     - lashed ropes (the game's painted rope) up to the ledge above;
     - a longer post as a last resort.
   - Posts never pass through a ledge or skim one's end, and stay clear of the climbing roots.
   - A test checks every ledge, support and hold on 12 rolls (`6-8 nothing floats`, and the ledges test for the set's feet).
   - The first try ran a post from every plank down to the water: about 90 poles a stage, which read as a cage. It was replaced.
3. **The start bank is painted.** w6var's soil is drawn as one piece, so there are no tile seams. It ends in w6var's bank edge, mud
   and roots breaking off into the water, and the soil fades over the edge's cut side, so there is no line. The square knee is now
   w6var's stump, sized so its roots reach the mud.
4. **The crown is not one strip.**
   - Four heights:
     - a drop behind the root;
     - the piece the root tops out on;
     - two plain hops up to the shrine.
   - Pieces meeting end to end never share a look. On roll 1: a root-shelf perch, a stilt deck, a root shelf (where the root tops
     out), a log, and the kit's plank under the shrine.
   - Each stands on its own long supports or posts, at both ends and in the middle.
   - At the end of the pull-back:
     - the view pulls back less sideways (0.8, was 0.72), so Pokey is bigger;
     - a warm light glows behind him.
5. **The wayside line on the upright crown** is left for the Dot helper, as the lead said.

## Polish check (STAGE-RULES §5b), v4

| # | Item | Verdict | Shown in |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** Every ledge is a painted piece: the ledge set, World 6's props and the game's rope. The bank and its edge, the stump knee, the posts and the braces are painted too. The code adds only the tide's foam flare, the reveal's golden light and the warm glow behind Pokey. | all |
| 2 | Nothing looks copy-pasted | **Pass (fixed).** The set's four kinds are mixed, so neighbours differ: nearby pieces match 3-6% of the time over 12 rolls. No piece repeats side by side, and pieces meeting end to end differ. | `2-tide-turns-*`, `3-first-liana-*`, `6-crown-reveal-sideways` |
| 3 | Art matches what it is | **Pass (fixed).** Nothing floats. Each set piece's supports stand on the ledge under it, or posts carry them on. Stumps, arches and dens stand on a ledge or on stilts, and every log and plank is held. Tests check every support's feet. | `2-tide-turns-*`, `3-first-liana-*`, `5-tide-surge-*` |
| 4 | Light fits the place | **Pass.** Mangrove dusk, then gold over the ruins, with a warm light behind Pokey at the top. | `1-start-*`, `7-crown-exit-*` |
| 5 | Pokey on model | **Pass.** The game's sprites. | all |
| 6 | Framing works both ways | **Pass.** The tide is in frame on the climb and drains for the reveal. Upright, the crown holds Pokey mid-screen; sideways he is larger at the end of the pull-back. | `6-crown-reveal-*`, `7-crown-exit-*` |
| 7 | Text stays out of the way | **Pass, with notes.** 6-8's own lines are short. The wayside story box on the upright crown is the Dot helper's (the lead's call). The generic flag and shrine lines still show under Dot's name, although Dot is away from 6-6 on (shared UI). | `6-crown-reveal-upright` |
| 8 | Every move it teaches is needed | **Pass.** Each liana and the roots are needed (tests). The crown adds two plain hops to the shrine. | tests |
| 9 | Moments feel like moments | **Pass.** The tide turns with a rumble, a shake, churn and a line. The reveal has the fade, the gold, the pull-back, the chime and the warm light. | v3 video |
| 10 | Motion is smooth | **Pass.** No change from v3. | v3 video |

## Fix by fix (the lead's list)

1. Floating pieces: the ledge set's own supports, plus the support rule.
   - `2-tide-turns-*`: a boardwalk perch on its legs, logs on a root.
   - `3-first-liana-*`: a wedged branch and a deck on their legs, a root shelf at the water.
   - `5-tide-surge-*`: a slab on posts, a boardwalk and a root shelf at the water.
2. The start bank: `1-start-*` shows the painted soil in one piece, the mud edge into the water, and the knee as a stump.
3. The crown: `6-crown-reveal-sideways` and `7-crown-exit-*` show four heights, five different pieces each on its own supports, and
   Pokey larger with a warm light behind him.
4. The wayside line: left for the Dot helper.
