# 6-8 Stilt Climb, v5 (the lead's review of v4, 2026-10-29)

Stills at the same beats as v4, upright (390x844) and sideways (844x390), real game, roll 1, tips off for clear frames. v4's
README has the support rule, the start bank and the crown's heights, which all passed.

## What changed from v4

1. **No more gauge posts.** In v4 they read as thin, straight grey pipes, all the same width.
   - Every post is now the ledge set's own **lashed stilt**, cut from the stilt deck's tall picture: its rope lashing at the top,
     then its wooden shaft laid down to the foot. Two variants (the deck's left and right posts), each drawn a little wider or
     narrower, sometimes flipped.
   - Braces (slanted gauge posts) are gone. A test checks no gauge post or brace is left.
2. **World 6's ledge set on every ledge it fits** (`src/assets/w6/ledges.webp`). The set has four kinds: root shelf, stilt deck,
   boardwalk and wedged branch. Each comes as a ledge and a perch (under 330 px).
   - Each ledge takes the tall piece, cut off where its own painted supports reach the ledge under it. The supports are the deck's
     lashed posts, the boardwalk's leaning posts, the wedged branch's branches and the root shelf's prop roots. A table measured
     from the pictures (`SET_ROWS`) gives where the supports are at each depth, so one picture fits any drop, and a test checks
     every support's feet.
   - Where the drop is longer than the whole piece, lashed stilts carry its supports on down.
   - The set takes about 40% of the ledges. Where none of it can stand, a stump, arch or den goes on lashed stilts, or a log or the
     kit's plank is held by a root, lashed stilts or a rope.
3. **The crown stands on lashed wooden stilts.**
   - Its pieces are stilt decks and boardwalks, carried down on lashed stilts.
   - Where neither fits, a log or plank stands on lashed stilts placed close enough that there are two or more, never one
     balanced pole.
   - Pieces meeting end to end differ.
4. **Look-alike pairs are down.** Over 12 rolls, nearby pieces match only 3-7% of the time (v4 was 12-17%). No piece repeats side by
   side, and no look is over 30% of the ledges. The test limits are back to 10% and 30%.

## Polish check (STAGE-RULES §5b), v5

| # | Item | Verdict | Shown in |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** Every ledge and every support is painted: the ledge set and its own stilts, World 6's props and the game's rope. The code adds only the tide's foam flare, the reveal's golden light and the warm glow behind Pokey. | all |
| 2 | Nothing looks copy-pasted | **Pass (fixed).** Four kinds of ledge, mixed: nearby pieces match 3-7% of the time. The stilts vary in width and in which post they come from. | `2-tide-turns-*`, `3-first-liana-*`, `6-crown-reveal-sideways` |
| 3 | Art matches what it is | **Pass.** Nothing floats (v4's rule). Each support stands on a ledge or is carried by lashed stilts, and no grey pipes are left. | `3-first-liana-*`, `5-tide-surge-*` |
| 4 | Light fits the place | **Pass.** Mangrove dusk, then gold over the ruins, with a warm light behind Pokey at the top. | `1-start-*`, `7-crown-exit-*` |
| 5 | Pokey on model | **Pass.** The game's sprites. | all |
| 6 | Framing works both ways | **Pass.** As v4. | `6-crown-reveal-*`, `7-crown-exit-*` |
| 7 | Text stays out of the way | **Pass, with notes.** The wayside story box on the upright crown is the Dot helper's (the lead's call). The generic flag and shrine lines still show under Dot's name (shared UI). | `6-crown-reveal-upright` |
| 8 | Every move it teaches is needed | **Pass.** No change. | tests |
| 9 | Moments feel like moments | **Pass.** No change. | v3 video |
| 10 | Motion is smooth | **Pass.** No change. | v3 video |

## Fix by fix (the lead's list)

1. Gauge posts: none left. Every post is the set's lashed stilt. See `2-tide-turns-*` (a boardwalk perch on its own legs, lashed
   stilts under the logs), `3-first-liana-*` (lashed stilts, a wedged branch and a deck on their own supports) and `4-animals-*`.
2. The set's painted supports hold up every ledge they fit, cut to reach the ledge under them.
3. The crown: `6-crown-reveal-sideways` and `7-crown-exit-*`. Decks and boardwalks on lashed stilts, and the log under the shrine
   on two.
4. Look-alike pairs: 3-7% over 12 rolls (v4: 12-17%).
