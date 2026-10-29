# 6-8 Stilt Climb, v3 (the lead's second review, 2026-10-29)

Stills at each beat, upright (390x844) and sideways (844x390), real game, roll 1 (tips off for clear frames), and a 35 s run
(`run-sideways-35s.mp4`, real inputs, cut between the beats). v2's README has the earlier changes and the first polish check.

What changed from v2:

1. **No two ledges alike on one screen.** Every ledge now takes one of World 6's painted pieces (`w6StiltArt.ts`, ledge art 'stilt'), chosen so
   the ledges near it don't share it, as far as the pieces that fit allow (the test holds close pairs to 15% alike or less):
   - the kit's root plank;
   - the second plank (props-made/w6var `branch-b`);
   - the flat-topped mossy root arch and root den (props-made/w6d);
   - a mossy log (w6d, laid as a raft of logs where room under it is short);
   - a stump (w6var `stump-b`, at most two side by side).
   The very wide crown is laid in segments of different pieces. Each piece's walkable top sits on its ledge's top (measured from the
   pictures), and a tall piece only goes where its roots don't hang onto a ledge under it. More dressing came with it: props-made/w6c's
   cattails, mooring posts, glow mushrooms and lantern flowers on the shelves, and its moss curtain under some plain planks, beside
   Matt's Gemini hides and arches.
2. **Upright, Pokey is never small at the top of an empty screen.** The crown sits 900 px under the stage's top (was 600), so the view
   can hold him in its middle, and upright the crown only pulls back a little (0.9; sideways 0.72).

Still missing (name it plainly): a stilt-house deck and a broken boardwalk. No World 6 art exists for either. The v2 README's Gemini
prompt for a World 6 ledge set covers both (row 1, piece 2 is a stilt-house plank deck; a broken boardwalk could be a 5th piece).

## Polish check (STAGE-RULES §5b), v3

| # | Item | Verdict | Shown in |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** All ledges, dressing and the tide are Matt's painted pieces. The code adds only the foam flare and the reveal's golden light. | all |
| 2 | Nothing looks copy-pasted | **Pass (fixed).** Ledges near each other differ, and pieces are mixed in sizes and heights. Dressing stands on the shelves and hangs under them. | `3-first-liana-*`, `4-animals-*`, `5-tide-surge-*` |
| 3 | Art matches what it is | **Pass.** Each piece's top is its ledge's top, and nothing hangs onto the ledge below (a test checks both). The tide reads as dangerous. | `4-animals-*` |
| 4 | Light fits the place | **Pass.** Mangrove dusk, then gold over the ruins. | `1-start-*`, `6-crown-reveal-*` |
| 5 | Pokey on model | **Pass.** The game's sprites. | all |
| 6 | Framing works both ways | **Pass (fixed).** The tide is in frame both ways, and upright the crown holds Pokey mid-screen. | `6-crown-reveal-upright` |
| 7 | Text stays out of the way | **Pass, with one note.** 6-8's own lines are short. On the upright crown, the game's wayside story line ("Near the top he leaves room on the root beside him. Habit.") covers Pokey for its few seconds. That box is placed by the shared guide UI, not this stage. | `6-crown-reveal-upright` |
| 8 | Every move it teaches is needed | **Pass.** Each liana and the roots are needed (tests). | tests |
| 9 | Moments feel like moments | **Pass.** The tide turning (rumble, shake, churn, line). The reveal (fade, gold, pull-back, chime). | video |
| 10 | Motion is smooth | **Pass.** The surges swell and ease, and the pull-back is eased. | video |
