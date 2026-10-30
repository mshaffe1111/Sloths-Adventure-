// the hand-written part of the direction sheet (sheet.ts adds the per-line tables from src/game/storyDirect.ts)

export const PREAMBLE = `
## What's below the bar today (from the recordings, upright and sideways)

Recorded 2026-10-30 from acc02e55: every scene, upright 390x844 and sideways 844x390, played as a reader would (each line typed out,
held a reading time, then Next). Recorder: \`tools/story-delivery/record.mjs\`.

1. **It plays as a slideshow.** Every picture dips in from black, even when the next picture is the same two people in the same
   place. A conversation of twelve lines blinks to black twelve times. Good story games cut inside a scene and save the fade for a
   change of place or time.
2. **The camera never directs.** 94% of pictures have the same slow 4% push. Nobody gets a close-up when they speak, a reveal is framed
   the same as small talk, and "I should have knocked" has the same camera as "Was it a nice bush?".
3. **Upright, the speaker is often half off the screen.** The scene keeps its width, so a figure at the left of a wide picture (Pokey
   is usually at 0.3) is cut by the screen's edge, for instance most of World 1's arrival. The camera has to frame whoever is speaking.
4. **Walls of text.** 96 lines run over 150 letters; on an upright phone the longest of Dot's run under the Next button. Her run-ons
   are her character, but they need pages, not a smaller box.
5. **No timing.** The words start the instant the picture lands, and every line types at the same 26 ms a letter, Pokey and Dot alike.
   There is no beat before a big line: "And she was gone." arrives as fast as "I'll go get snacks."
6. **The music never stops.** There is a cue on almost every picture, but nothing ever goes silent: the biggest moments (the gap
   closing, the let-go, "I should have knocked") have the same bed under them as the jokes.
7. **The voices were beeps.** One oscillator blip every other letter, the same rhythm for everyone (replaced in phase 1: each speaker
   now has a babble of their own and types at their own pace, the sample page has both to compare).
8. **Dead space upright.** The words box keeps room for six lines, so a two-word line ("Go on.") sits in a box with a hand's width of
   dark below it. (Out of scope for this pass. Flagged for the lead: the box could size to its words while the picture stays put.)

## The rules (every line, unless a hand-directed line says otherwise)

- **How a picture arrives.** A new chapter: the dip from dark, as today. A new place or time in the same chapter: a quick half-dark dip
  (soft). The same place: a cut. A blow (the soldiers, a hit): always a hard cut.
- **The beat.** 180 ms after a cut, 320 after a soft dip, 450 after the full dip, so the picture lands before the words. Then add 650
  before a heartbreak, reveal, cliffhanger, door or darkness sting, 500 in a hush, 450 for a short line after a long one, and 250 for an
  answer to a question. 1.5 s at most.
- **The pace.** Each voice types at its own pace (Dot 22 ms a letter, Meeca 32, the General 36, Pokey 40, the Golem 44, the Narrator
  30), 15% slower on a sorrow, hush, tender, grandma, Meeca or mercy cue, 15% quicker in a fight or chase. A tap still finishes the line.
- **Pages.** A line over 150 letters is split at the sentence end nearest its middle (a sung line never is). The words are not changed.
- **The camera.**
  - A new speaker who is in the picture gets a *single*: a cut to them framed (zoom +12%, focus most of the way to them), easing in.
  - The same speaker again carries on pushing from where the last picture ended, so there is no jump.
  - An emotional line gets a *slow push* (+14% over six seconds or more).
  - A reveal or cliffhanger *pulls back* from close to wide.
  - Narration *drifts*: a slow pan, alternating direction.
  - Stillness (*still*) is used on purpose for the big silences.
  - A scene's own authored move or follow is always kept.
- **The voice.** Grief and hush: a semitone lower, 3 dB softer. Tender: half a semitone lower, 1.5 dB softer. A fight: 1 dB firmer.
  Comedy: half a semitone up. A sung line has no babble: the music sings it.
- **The music.** keep, or *under* (half) in a hush. The hand-directed lines add *silence* (the music fades out under that picture and
  comes back on the next) and *swell* (it rises a step).
`;

/** per scene: the direction in words, for the scenes that matter most (the tables carry every line) */
export const NOTES: Record<string, string> = {
  prologue: `
The kidnapping is the game's first impression, and today it plays at one pace from the snail joke to "And she was gone."

- **The birds go quiet, and so does the music.** On "the birds went quiet" the bed cuts to nothing, and stays out through "Dot
  stopped in the air". The thunder in the ambience is the first sound back. The dread cue comes in under Pokey's "Did I just hear
  thunder?"
- **The soldiers: a hard cut and a pull back** to show both lines, then a full second of nothing before "The General does not knock."
  Meeca's "It's a garden. There's no door." comes back fast: she is not afraid of him yet.
- **"One." "Two." "Three."** Each count gets a second of silence before it, with the music down to half, and a push on the General.
  Pokey's dash between them is cut quick, typing faster.
- **"And she was gone."** The big silence: 1.3 s of nothing, no music, a held frame. Then "Pokey ran." is a hard cut, and the chase
  music comes back on it.
- **Grandma's ghost** gets a slow push and the music under it, a ghost not a cameo. Then "Hang on, Meeca" swells.
`,
  'w6-mid': `
The gap closing is the one time being slow costs Pokey something, so it has to hurt. Today it is the same close shot of Pokey and
Dot for 15 pictures, with the music going on under "We stopped for tea."

- **Dot's confession** opens on a breath (0.8 s) with a slow push on her. She has rehearsed a joke and can't do it.
- **"We stopped for tea."** Total silence: the music fades out under Pokey's line and stays out for Dot's echo. A held frame, no push.
  1.5 s before Pokey's line, 1.1 s before Dot's. This is the moment that earns "slow is not stopped".
- **"He'll know. He'll have stopped."** Quiet, a slow push, the music under.
- **The leaf shivering after she goes** holds still with the music under: it is the loneliest picture in the game until Flicker's
  light comes down.
`,
  ending: `
The ending holds four of the five biggest moments: the let-go, the reunion with the General, Pokey and Meeca, and tea.

**The let-go (pictures 0-5).** After the fight the music goes out completely and only the storm is left. "He let go with one hand."
gets 1.3 s of silence and a slow push. That is the peak of the game, and the player does it with their thumb. The first note comes
back under "He held it out". The lullaby is sung slowly, with the music swelling and no babble over it.

**The General (19-39).** Ten paces of silence before "Hello, Grandpa." (1.3 s), then a slow push. Meeca cuts off "Little bloom." with
a hard cut. Her long speeches are paged, two pages each. "I should have knocked." is the line the whole story answers: 1.5 s, a
held frame, nothing under it. The music finds its way back as she takes his hand, and swells at "I have lost count."

**Pokey and Meeca (40-48).** A pull back to show him alone in the courtyard, soaked, in silence. "You came." (1.3 s, a slow push, the
music under), then his joke after a breath. The swell lands on "She laughed. Then her back stopped being straight." The scene on the
steps drifts with her theme full.

**Tea (77-92).** Comic timing for the cookies (a quick cut). A held breath on the last of the storm and the teacup. The pause before
"Tell him he has retired." Silence at Grandma's tree ("Hello, love. I'm late."), then home swells. The last picture drifts slowly with
the finale full.
`,
};
