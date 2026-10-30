# Story gaps: every new beat on screen (Oct 30, 2026)

Each new line from GAP-MAP.md, caught in play on story-gaps e2e263ef, sideways (844x390) and upright (400x760). Files are in `shots/`, named `<stage>-<bubble>-<side|up>.webp`. Exchanges have one file per bubble, in order.

| Stage | Line | Sideways | Upright |
|---|---|---|---|
| 1-7 | Dot: "Low, like me in my bush, Meeca says she saw me, fibs." | 1-7-1-side | 1-7-1-up |
| 2-5 | Petal: Gruntlewick's warning reaches "however." | 2-5-1-side | 2-5-1-up |
| 2-8 | Petal: the river's rising, and Gruntlewick just reached that part | 2-8-1-side | 2-8-1-up |
| 3-6 | Pokey: "Grandma rang a bell when somebody was coming home. Mostly me." | 3-6-1-side | 3-6-1-up |
| 3-7 | Dot: "Find the bell, don't ring it, it's for coming home, not now." | 3-7-1-side | 3-7-1-up |
| 6-6 | Flicker: "Don't look at me. Look where I'm lighting." | 6-6-1-side | 6-6-1-up |
| 6-8 | Petal: "He saves Dot's spot. Flicker takes it. Roomy, for a firefly." | 6-8-1-side | 6-8-1-up |
| 7-6 | Pokey: "Flicker's quiet. When I say Meeca's name, his light goes funny." | 7-6-1-side | 7-6-1-up |
| 8-3 | Dot / Flicker / Dot / Flicker: safe branch, faster, resting, hovering | 8-3-1..4-side | 8-3-1..4-up |
| 8-6 | Petal: "Flicker's family blinks on along the branch ahead, one by one." | 8-6-1-side | (see the lead's note) |
| 9-5 | Dot: "Leaf up, I didn't raise you to wobble. I didn't raise you." | 9-5-1-side | 9-5-1-up |
| 9-9 | Dot / Flicker / Dot / Flicker: the plan, "What do I do?", "Glow quietly.", "I don't have a quiet setting." | 9-9-1..4-side | 9-9-1..3-up |
| 10-3 | Flicker: "Hold on. I'm keeping my light up, so she can find us." | 10-3-1-side | 10-3-1-up |
| 10-6 | Dot / Flicker / Dot: "Left vine, Flicker, I said left, the left one." / "His left." / "Fine. His left." | 10-6-1..3-side | 10-6-1..2-up |

**The bubble fix (e2e263ef):** `before-1-7-1-side` and `before-3-7-1-side` show the bubble over the lives medallion, with Dot's tag under its edge. `1-7-1-side` and `3-7-1-side` show it after the fix, clear of the medallion with the tag in full view. Upright (`before-1-7-1-up` and every `-up` taken after the fix) nothing moved.

Polish check, against STAGE-RULES §5b:
- Every line reads in one glance, both ways up.
- No bubble covers Pokey.
- Each bubble shows its speaker's tag: Dot green, Pokey orange, Flicker night blue with yellow, and the Petal with no tag, in italics.
- Since e2e263ef, no bubble sits on the lives medallion.

Known, not fixed today (code freeze):
- **An exchange's replies wait for its first bubble to be read.** If a fall or an urgent tip cuts that bubble short, the replies don't come. My first 10-6 run lost its replies that way (the script moved Pokey to the next checkpoint mid-line). With nothing cutting it, all three bubbles came, as shown here.
- **Flicker is not drawn beside Pokey in play.** His lines come with his tag, but you can't see him. That needs art, so the lead routes it.
- **Some missing upright shots.** The dev server stopped twice in this run, so 9-9's fourth bubble, 10-6's third and 8-6 are missing upright. Their sideways shots show them working, but none of the three was caught upright.
