# 1-6 First Lianas: the player lines, approved by the story keeper (KEEPER-16, 10:22 AM ET 11-14)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-16).
Read for this: reference/story/STORY-KEEPER.md, reference/design/1-6.md (on t-16-design c99917f1, beats 1-16), 1-5's LINES_15 /
MISSION_15 (src/game/gen2/worlds/w1Arc15.ts:36-52), wayside.ts:78 (1-6's halfway line, Pokey), the letter before 1-6
(reference/story-rewrite/pilot-prologue-w1-v2.md:445-470) and the scene before it (:439), the banned words (whatsNew.test.ts:28, playerText.test.ts:35).

## The lines (verbatim; the builder copies these, a test holds them equal)

| # | Key | Who, where | Line |
|---|---|---|---|
| 1 | `liana` | Dot, teach, 800+ px before beat 1's first liana | Lianas! Grab one from the edge, and let go when you glow. |
| 2 | `low` | Dot, teach, 800+ px before beat 2 (at most this one line; the petal at the liana's foot does the teaching, so the builder may leave it out if the bots and stills show the petal alone teaches it) | Hang low, fly far! |
| 3 | `snakes` | Dot, teach, 800+ px before beat 6 (the safe meeting), and it covers beat 7 | Vine snakes only pass by. If one heads down your liana, climb down ahead of it. |
| 4 | `rise` | Dot, teach, 800+ px before beat 11 (the twist; not on Easy, where none rise) | Snakes coming UP the lianas now! Climb high, ahead of them. |
| 5 | `still` | Dot, teach, 800+ px before beat 13 (the false liana) | Watch for a vine that doesn't swing. It has a face! |
| 6 | `mark` | Dot, at her mark on the far bank (beat 16, exit) | Her mark, right where she used to wait for you! |
| 6b | `sealed` | Dot, at a LOCKED exit (only if the build gives 1-6 a petal count; SEALED_LINES '1:<type>', stagePlan.ts:198) | Some of her petals are still on the lianas. Back we go! |
| 7 | MISSION_16 | the stage's mission line (stagePlan.ts:50, replaces "Swing on the hanging lianas across the gaps in the canopy.") | They took her over the gorge. Swing after her, and gather her petals. |

## Why each one (the keeper's checks, STORY-KEEPER.md §7)

1. **liana.** Names the thing, then the two moves in order: grab at the edge (the press waits for the vine, physics.ts:425) and let go on
   the gold glow round him in the sweet spot (engine.ts sweetGlow, "the golden glow round him while he is in the sweet spot"). "go/glow"
   is easy for a child to keep. No control word: the game has two schemes (flick gestures and the pad's Jump button, PadController.tsx:46),
   so no line says tap, flick, press or button; "grab" and "let go" are the game's own words (lesson.swing.grab, lesson.swing.intro).
2. **low.** Four words, one idea: lower grip, longer flight (1-6.md "grip decides distance"). "Hang", not "climb down", so it reads as
   where he holds, which is the dial. Optional by design (beat 2 is "taught by a petal, not words").
3. **snakes.** Reassures first (nobody is hurt in World 1; the snake only passes, beat 6), then the one move for beat 7 (slide down ahead
   of a snake coming down from the anchor). "Climb down" is the game's move (straight down on a vine climbs). Two sentences.
4. **rise.** The twist flips line 3: below pushes him high. "UP" in capitals is the surprise, Dot's voice winding up; same shape as
   line 3's ending so the player hears the dial turn ("ahead of it" / "ahead of them").
5. **still.** Teaches the tell (never sweeps an arc) and gives away the joke without spoiling it on screen: the player's own "WAIT. That
   vine has a FACE" (1-6.md beat 13) still lands when he sees it. Grabbing it is safe (it startles, drops with him to the moss), so the
   line warns without frightening.
6. **mark.** Pays off Pokey's halfway line (wayside.ts:78, "She'd wait at the end with a snack"): the end of the crossing is where Meeca
   used to wait, and now her mark is there instead. True (a past habit, she is not here); warm; the player feels proud and a little
   sad. Worded off "She always waited." (the halfway line's short form, dotLinesData.ts:153) so it is a callback, not a repeat.
   Dot says it because in-play lines are Dot's and 1-6's one Pokey slot (wayside) is his halfway line.
6b. **sealed.** Only if 1-6 locks its exit on a petal count (1-6.md "Goal petals"; today vine_runner has no count in goals.ts:70-80 and
   goalLine returns '' for it, stagePlan.ts:200-213, so a locked 1-6 would have NO words from Dot: "Dot explains any locked exit" would
   break). Distinct from 1-5's "We missed some of her marks. They're back there!".
7. **MISSION.** The old line could sit on any vine stage (2-4, 10-6 say the same). The new one carries the story (they took her this way,
   1-5's "She marked the way they took her") and names the goal, as 1-3 and 1-5's missions do. It follows World 1's halfway scene, which
   ends on Meeca's "I've got a pocketful of petals left. Don't you dare stop for anything." (pilot-prologue-w1-v2.md:439), and the letter. If the build keeps 1-6 with no petal count, use
   "They took her over the gorge. Swing after her." (the same line with the goal clause cut; the keeper approves that form too).

## Checked against the rules

- Banned words (whatsNew.test.ts:28; playerText BANNED): none. No numbers, so playerText's number masking cannot pair them.
- Repeats: grepped src/ for every phrase ("pass by", "doesn't swing", "has a face", "when you glow", "fly far", "always waited", "over the
  gorge", "Back we go"); the only near-hit was the halfway line's "She always waited", reworded off. "ahead of it/them" appear only in
  code comments.
- Length: every line one or two short sentences, 4 to 15 words, readable at a glance on a phone.
- World 1 has no made things (no iron, no tools in a line); nobody is hurt (snakes pass, startle, slither off).
- Dot is she; Meeca is never a damsel (her mark, her petals: she is leading him).

## Nature check (1-6.md "left for the story keeper"): PASS

The brown vine snake (Oxybelis aeneus) ranges from southern Arizona through Mexico and Central America into northern South America; thin,
brown-grey, it hangs and sways like a vine and is taken for one; it flicks its tongue slowly; it hunts lizards, not sloths. Calling it
"shy" and having it slide away is fair for a storybook; it never bites in the game. Lianas off a giant (strangler) fig over a creek gorge
fit a Central/South American lowland canopy. No change asked of the design.

## For the builder and the lead

- The old 1-6 lines in dotLinesData.ts:110-114, 129-131, 141, 144 (hint.1-6.grabVine "Flick up into the vine to grab it", leapVine,
  log, logWall, trunk, canopy, tooHigh, fell, double) belong to the stage this one replaces. New replaces old: they go when 1-6 ships,
  or the walk-in can show two teach lines for one move.
- The lines live in one object (LINES_16, MISSION_16) in 1-6's world file with a verbatim test, the way w1Arc15.test.ts:55-66 holds 1-5's.
