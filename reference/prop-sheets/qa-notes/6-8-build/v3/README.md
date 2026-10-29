# 6-8 Stilt Climb, v3 (the lead's second review, 2026-10-29)

Stills at each beat, upright (390x844) and sideways (844x390), real game, roll 1 (tips off for clear frames), and a 36 s run
(`run-sideways-36s.mp4`, real inputs, cut between the beats, no lives lost). Retaken after the last round below; `7-crown-exit-*` is new. v2's README has the earlier changes and the first polish check.

What changed from v2:

1. **No two ledges alike on one screen.** Every ledge now takes one of World 6's painted pieces (`w6StiltArt.ts`, ledge art 'stilt'), chosen so
   the ledges near it don't share it, as far as the pieces that fit allow (the test compares every two pieces within 300 px of each other and holds them to 10% alike or less; on 12 rolls it is 1-9%):
   - the kit's root plank;
   - the second plank (props-made/w6var `branch-b`);
   - the flat-topped mossy root arch and root den (props-made/w6d);
   - a mossy log (w6d, laid as a raft of logs where room under it is short);
   - a stump (w6var `stump-b`, at most two side by side).
   Any ledge over 520 px is laid in segments of different pieces, each narrow enough for one arch or den, so a ledge never shows
   the same piece twice side by side (a test checks it). The root arch and the den count as one look: in the game the dark behind shows
   through the arch and it reads as the den. Each piece's walkable top sits on its ledge's top (measured from the
   pictures), and a tall piece only goes where its roots don't hang onto a ledge under it. More dressing came with it: props-made/w6c's
   cattails, mooring posts, glow mushrooms and lantern flowers on the shelves, and its moss curtain under some plain planks, beside
   Matt's Gemini hides and arches.
2. **Upright, Pokey is never small at the top of an empty screen.** The crown sits 900 px under the stage's top (was 600), so the view
   can hold him in its middle, and upright the crown only pulls back a little (0.9; sideways 0.72).
3. **The crown has no dead walk.** The walk from the last root to the shrine is capped at 1000 px (3.1-3.3 s, was 4.3-5.4 s), with a
   45 px step up halfway and a petal on it, so the shrine stands on a raised end.
4. **The tide drains away once he is on the last root** (it was still in frame under the reveal), so the ruins have the screen.

Still missing (name it plainly): a stilt-house deck and a broken boardwalk. No World 6 art exists for either. The v2 README's Gemini
prompt for a World 6 ledge set covers both (row 1, piece 2 is a stilt-house plank deck; a broken boardwalk could be a 5th piece).

## Polish check (STAGE-RULES §5b), v3

| # | Item | Verdict | Shown in |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** All ledges, dressing and the tide are Matt's painted pieces. The code adds only the foam flare and the reveal's golden light. | all |
| 2 | Nothing looks copy-pasted | **Pass (fixed).** Pieces near each other differ, no ledge repeats a piece side by side, and sizes and heights are mixed. Dressing stands on the shelves and hangs under them. A plank or log can still be laid as two copies (16% of painted ledges; read as one long raft). | `3-first-liana-*`, `4-animals-*`, `6-crown-reveal-*` |
| 3 | Art matches what it is | **Pass.** Each piece's top is its ledge's top, and nothing hangs onto the ledge below (a test checks both). The tide reads as dangerous. | `4-animals-*` |
| 4 | Light fits the place | **Pass.** Mangrove dusk, then gold over the ruins. | `1-start-*`, `6-crown-reveal-*` |
| 5 | Pokey on model | **Pass.** The game's sprites. | all |
| 6 | Framing works both ways | **Pass (fixed).** The tide is in frame both ways on the climb and drains away for the reveal. Upright, the crown holds Pokey mid-screen. | `5-tide-surge-*`, `6-crown-reveal-upright`, `7-crown-exit-upright` |
| 7 | Text stays out of the way | **Pass, with notes.** 6-8's own lines are short, and on the upright crown the wayside story line now sits above Pokey. Shared-UI notes, not this stage: (a) the generic flag and shrine lines ("A flag! Fall, and you start again here.", "Reach the shrine to finish the stage.") show under Dot's name although Dot is away from 6-6 on; (b) in one scripted take, the "The tide! Keep climbing" bubble is clipped at the right edge for a moment, because it was placed where Pokey stood before a teleport cut (in real play there is no cut). | `6-crown-reveal-upright` |
| 8 | Every move it teaches is needed | **Pass.** Each liana and the roots are needed (tests). | tests |
| 9 | Moments feel like moments | **Pass.** The tide turning (rumble, shake, churn, line). The reveal (fade, gold, pull-back, chime). | video |
| 10 | Motion is smooth | **Pass.** The surges swell and ease, the pull-back is eased, and the tide drains smoothly at the top. | video, last 8 s |
