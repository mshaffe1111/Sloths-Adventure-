# Story delivery: the direction sheet

Written by `npx tsx tools/story-delivery/sheet.ts` from `src/game/storyDirect.ts`, the code the scene player runs, so this sheet and the game
cannot disagree. The rules give every line its delivery; the 54 hand-directed lines (OVERRIDES) are the big moments.
Story-delivery helper, 2026-10-30.

## What's below the bar today (from the recordings, upright and sideways)

Recorded 2026-10-30 from acc02e55: every scene, upright 390x844 and sideways 844x390, played as a reader would (each line typed out,
held a reading time, then Next). Recorder: `tools/story-delivery/record.mjs`.

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

**Totals:** 59 scenes, 806 pictures. 49 had a camera move of their own (6%); every other picture had the
same slow push. 95 lines were walls of text. Directed: 171 lines get a beat of 0.6 s or more before them, 12 get silence under them.

**Reading the tables.** *In*: how the picture arrives (cut, soft = a quick half-dark dip for a new place, dip = the full dip from dark
for a new chapter). *Beat*: silence before the first letter. *Type*: ms a letter. *Camera*: the shot, zoom from→to, over how long
(single = framed on the speaker, push = slow in, slowPush = slower and further on an emotional line, reveal = pull back, drift = a slow
pan on narration, still = held). *Voice*: the speaker's babble, its pitch and level on their own. *Music*: keep, under (half), silence,
swell.

## Prologue (`prologue`, 58 pictures)

**What's flat**

- Every one of the 58 pictures dips in from black today; directed, 49 become cuts inside one setup.
- 55 of 58 pictures have only the shared 4% push (3 have a camera move of their own).
- 4 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

**Direction**

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

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Morning came down through the canopy one branch at a time. Pokey's br… | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 1 | Dot | I'm sorry, I'm so sorry I'm late. I have letters. Important letters.… (2 pages) | cut | 180 ms | 22 ms | single 1.34→1.40 5.9s | +0.5 st, 0 dB | keep |  |
| 2 | Pokey | Well. It seems to me that it's still morning. | cut | 180 ms | 40 ms | single 1.34→1.40 3.8s | +0.5 st, 0 dB | keep |  |
| 3 | Dot | Yesterday morning. I meant yesterday morning. | cut | 180 ms | 22 ms | single 1.34→1.40 3.0s | +0.5 st, 0 dB | keep |  |
| 4 | Pokey | Oh. Well, you're really late then. | cut | 180 ms | 40 ms | single 1.34→1.40 3.4s | +0.5 st, 0 dB | keep |  |
| 5 | Dot | There was a headwind over the river, I hit it head on, and then there… (2 pages) | cut | 180 ms | 22 ms | single 1.34→1.40 6.3s | +0.5 st, 0 dB | keep |  |
| 6 | Narrator | She stopped and looked at him properly. | cut | 180 ms | 35 ms | drift 1.24→1.26 10.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Dot | You look thin. Have you lost weight? Have you been eating? | cut | 180 ms | 25 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep |  |
| 8 | Meeca | Dot. If I've told you once, I've told you twice. It's fine. It's just… | cut | 430 ms | 37 ms | slowPush 1.20→1.37 9.9s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 9 | Pokey | I'm looking. I'm looking. | cut | 630 ms | 46 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 10 | Meeca | It's never opened for me. Not once. Not since Grandma. Everybody sit… | cut | 180 ms | 37 ms | slowPush 1.20→1.37 9.9s | -0.5 st, -1.5 dB | keep |  |
| 11 | Narrator | The Heartbloom is older than the oldest tree here. While it stays ope… | soft | 320 ms | 30 ms | authored move | own | keep |  |
| 12 | Narrator | It opens for one keeper at a time. For fifty years that was Meeca's g… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 13 | Pokey | How long are we gonna sit here and watch it? | soft | 320 ms | 40 ms | single 1.34→1.40 3.8s | own | keep |  |
| 14 | Meeca | All day, if it takes all day. | cut | 430 ms | 32 ms | single 1.34→1.40 3.0s | own | keep | an answer: a thinking beat |
| 15 | Pokey | I'm happy for you. I really am. But sitting here staring at it isn't… | cut | 180 ms | 40 ms | single 1.34→1.40 6.1s | own | keep |  |
| 16 | Meeca | You once sat and watched a snail win a race. | cut | 180 ms | 37 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep |  |
| 17 | Pokey | Of course I did. He trained for it. | cut | 180 ms | 46 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep |  |
| 18 | Dot | Well, you can't watch a flower all day on an empty stomach. I'll go g… | cut | 180 ms | 22 ms | single 1.34→1.40 4.6s | +0.5 st, 0 dB | keep |  |
| 19 | Narrator | She was already lifting off the branch when the birds went quiet. Eve… | soft | 900 ms | 30 ms | still 1.20→1.22 12.0s | -0.5 st, -1 dB | silence | the birds stop and the music stops with them |
| 20 | Narrator | Dot stopped in the air. And way off in the distance, up in the Highla… | cut | 700 ms | 30 ms | drift 1.24→1.26 10.0s | -0.5 st, -1 dB | silence | still no music: the thunder is the first sound back |
| 21 | Pokey | Did I just hear thunder? You know how I feel about thunder. | cut | 180 ms | 40 ms | single 1.34→1.40 4.4s | -0.5 st, -1 dB | keep |  |
| 22 | Narrator | His hands were already on the branch. Both of them. | cut | 180 ms | 30 ms | drift 1.24→1.26 10.0s | -0.5 st, -1 dB | keep |  |
| 23 | Pokey | It's only weather. It's only weather. | cut | 180 ms | 40 ms | single 1.34→1.40 3.5s | -0.5 st, -1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 24 | Narrator | Meeca looked at his hands. Then, to be kind, she looked at the sky. D… | cut | 180 ms | 30 ms | drift 1.24→1.26 10.0s | -0.5 st, -1 dB | keep |  |
| 25 | Dot | That's not weather. Inside. Both of you, inside, right now. Meeca, le… | soft | 320 ms | 22 ms | single 1.34→1.40 5.5s | -0.5 st, -1 dB | keep |  |
| 26 | Narrator | The Heartbloom closed up, petal over petal, and its light went out. | cut | 600 ms | 30 ms | slowPush 1.30→1.48 6.3s | -0.5 st, -1 dB | keep | the light going out is a moment: hold on the flower |
| 27 | Narrator | Soldiers came, in two straight lines. The one in front was bigger tha… | cut | 300 ms | 26 ms | reveal 1.33→1.12 2.4s | 0 st, +1 dB | keep | a hard cut and a pull back to show the lines |
| 28 | General Iron-Claw | The General does not knock. | cut | 800 ms | 31 ms | slowPush 1.35→1.54 6.0s | 0 st, +1 dB | keep | his first words: a beat of nothing, then slow |
| 29 | Meeca | It's a garden. There's no door. | cut | 250 ms | 27 ms | single 1.51→1.58 3.0s | 0 st, +1 dB | keep | her comeback lands fast |
| 30 | General Iron-Claw | That one. She's the keeper. Bring her to me. | cut | 180 ms | 31 ms | single 1.51→1.58 3.6s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 31 | Meeca | Excuse me? You're blocking my flower. | cut | 180 ms | 27 ms | single 1.51→1.58 3.0s | 0 st, +1 dB | keep |  |
| 32 | General Iron-Claw | Come, little bloom. You're coming with me. | cut | 180 ms | 36 ms | single 1.51→1.58 3.5s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 33 | Meeca | Who told you that? | cut | 180 ms | 32 ms | single 1.51→1.58 3.0s | -0.5 st, -1 dB | keep |  |
| 34 | General Iron-Claw | Grab her. We're leaving. | cut | 430 ms | 31 ms | single 1.51→1.58 3.0s | 0 st, +1 dB | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 35 | Pokey | Excuse me, sir? I think there's been some kind of misunderstanding he… | cut | 180 ms | 34 ms | single 1.51→1.58 4.5s | 0 st, +1 dB | keep |  |
| 36 | Pokey | Are you feeling okay? You seem a little grumpy. | cut | 180 ms | 34 ms | push 1.58→1.65 3.6s | 0 st, +1 dB | keep |  |
| 37 | General Iron-Claw | The General has flattened forts for less. | cut | 180 ms | 31 ms | single 1.51→1.58 3.1s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 38 | General Iron-Claw | One. | cut | 1000 ms | 31 ms | push 1.58→1.65 3.0s | 0 st, +1 dB | under | the count over almost nothing |
| 39 | Narrator | Pokey looked over at Meeca, and he moved faster than he had ever move… | cut | 120 ms | 20 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep | the fastest he has ever moved: so is the cut |
| 40 | General Iron-Claw | Two. | cut | 900 ms | 31 ms | push 1.37→1.43 3.0s | 0 st, +1 dB | under | the count |
| 41 | Narrator | He threw his arms out toward her, reaching for her hand. | cut | 180 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 42 | General Iron-Claw | Three. | cut | 900 ms | 31 ms | push 1.37→1.43 3.0s | 0 st, +1 dB | under | the count |
| 43 | Meeca | Pokey! Pokey, help me! Follow the petals! Follow the petals, Pokey! | cut | 180 ms | 27 ms | single 1.68→1.75 4.2s | 0 st, +1 dB | keep |  |
| 44 | General Iron-Claw | Him? Save you? He's too slow. He was always too slow. He'll never mak… | cut | 180 ms | 31 ms | single 1.34→1.40 6.3s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 45 | Dot | Pokey. Pokey, look at me. Look at me. I'm the fast one. I'll follow t… (2 pages) | cut | 180 ms | 19 ms | single 1.34→1.40 6.7s | 0 st, +1 dB | keep |  |
| 46 | Narrator | And she was gone. | cut | 1300 ms | 35 ms | still 1.30→1.32 12.0s | -1 st, -3 dB | silence | the big silence: nothing under it |
| 47 | Narrator | Pokey ran. | cut | 100 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep | the music crashes back in on the cut |
| 48 | Narrator | The soldiers weren't even hurrying, and they pulled away from him any… | cut | 180 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 49 | Narrator | He tripped over the old root he said good morning to every day, and t… | cut | 180 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 50 | Narrator | When he looked up, they were a line along the ridge. Then they were o… | cut | 700 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | the chase music drains away |
| 51 | Narrator | He stood there alone in the rain. And for a second, by the closed-up… (2 pages) | dip | 450 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 52 | Grandma | Follow the petals, Pokey. | cut | 1000 ms | 44 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | under | a ghost: slow in, quiet |
| 53 | Narrator | He blinked the rain out of his eyes. There was nobody there. | soft | 800 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | let it be empty |
| 54 | Pokey | Was that Meeca's grandma? | cut | 680 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 55 | Narrator | On his wrist, the faded petal Meeca had tied there years ago began to… | soft | 320 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 56 | Pokey | Hang on, Meeca. I'm coming. I'm slow, but I'm coming. | cut | 700 ms | 40 ms | authored move | own | swell | the vow: the theme rises under it |
| 57 | Narrator | Ten realms lay between Pokey and the Highland Fortress. Each one had… | dip | 450 ms | 30 ms | drift 1.29→1.31 10.0s | own | keep |  |

## World 1 arrival (`w1-arrival`, 30 pictures)

**What's flat**

- Every one of the 30 pictures dips in from black today; directed, 29 become cuts inside one setup.
- 28 of 30 pictures have only the shared 4% push (2 have a camera move of their own).
- 9 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The squirrels who lived under the old vine had put up a sign years ag… (2 pages) | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 1 | Narrator | They'd been watching him leave for two days now. He was almost out of… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 2 | Squirrel | Hey! Sloth! Where are you going? | cut | 180 ms | 22 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 3 | Pokey | North. | cut | 430 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep | an answer: a thinking beat |
| 4 | Squirrel | North! At that speed? See you next year! | cut | 180 ms | 22 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 5 | Narrator | Somewhere behind the squirrel, a lot of smaller squirrels laughed. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 6 | Pokey | I'll write. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |
| 7 | Narrator | The first petal was stuck to the bark of a kapok tree, pressed flat,… (2 pages) | cut | 180 ms | 30 ms | authored move | own | keep |  |
| 8 | Pokey | She pressed it flat. With a soldier on each arm. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.2s | -0.5 st, -1.5 dB | keep |  |
| 9 | Dot | Pokey! Pokey, there you are, oh, thank goodness. Don't move. Don't yo… | cut | 180 ms | 22 ms | single 1.68→1.75 4.0s | +0.5 st, 0 dB | keep |  |
| 10 | Pokey | Historically, not a problem. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 11 | Dot | Do you know how many pink things there are in this forest? Do you hav… (3 pages) | cut | 180 ms | 22 ms | single 1.68→1.75 7.5s | +0.5 st, 0 dB | keep |  |
| 12 | Pokey | You said you'd be straight back. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 13 | Narrator | Dot's wing went to the pouch at her side. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 14 | Dot | I know what I said, I know, and I also said don't you go anywhere wit… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 8.3s | -1 st, -3 dB | keep |  |
| 15 | Pokey | Not very fast. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 16 | Pokey | Did you see her? Is she okay? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 17 | Dot | She's okay. She's okay. They took her all the way up to the Highlands… (3 pages) | cut | 430 ms | 25 ms | slowPush 1.50→1.71 11.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 18 | Pokey | Did they see you? | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 19 | Dot | One of them looked right at me and said, "Is that a hummingbird?" And… (2 pages) | cut | 430 ms | 25 ms | slowPush 1.50→1.71 9.5s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 20 | Dot | Okay. Now listen. They put her in a tower. And there's this netting,… (3 pages) | cut | 180 ms | 22 ms | push 1.71→1.80 7.3s | -0.5 st, -1 dB | keep |  |
| 21 | Dot | Notes go out. Nothing goes in. I tried to carry one in. Twice. Same t… | cut | 180 ms | 22 ms | push 1.80→1.83 4.4s | -0.5 st, -1 dB | keep |  |
| 22 | Pokey | So I can't tell her I'm coming. | cut | 180 ms | 40 ms | single 1.68→1.75 3.1s | -0.5 st, -1 dB | keep |  |
| 23 | Dot | She knows you're coming. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 24 | Dot | She's already gotten two notes out through it. I've got both. This is… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.3s | -0.5 st, -1.5 dB | keep |  |
| 25 | Dot | "Pokey. If you have this, you found the petal. I put it low so you wo… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 11.0s | -0.5 st, -1.5 dB | keep |  |
| 26 | Narrator | Pokey read it again himself, slowly, the part about running. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 27 | Pokey | Which way? | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |
| 28 | Dot | North. Everything's north. The petals go north. | cut | 430 ms | 22 ms | single 1.68→1.75 3.5s | own | keep | an answer: a thinking beat |
| 29 | Narrator | On a branch above them, something long shifted its weight. It had bee… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |

## World 1 midpoint (`w1-mid`, 10 pictures)

**What's flat**

- Every one of the 10 pictures dips in from black today; directed, 7 become cuts inside one setup.
- 10 of 10 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Dot | I've got another one. I was saving it. You looked like you needed it. | dip | 450 ms | 25 ms | slowPush 1.50→1.71 6.2s | -0.5 st, -1.5 dB | keep |  |
| 1 | Dot | "Pokey. I'm fine. I have a window, a chair, a blanket that smells lik… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 9.5s | -0.5 st, -1.5 dB | keep |  |
| 2 | Narrator | Far away, in a tower, a sloth sat up straight at a desk by a window.… | soft | 320 ms | 35 ms | drift 1.39→1.42 10.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Pokey | Let me see it. | soft | 770 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 4 | Narrator | He ran a claw under the writing. The words sat on the line, evenly, f… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 5 | Pokey | She falls off the end of the line. Always. She runs out of room and w… | cut | 180 ms | 46 ms | slowPush 1.50→1.71 8.6s | -1 st, -3 dB | keep |  |
| 6 | Dot | Look, she even left margins. She had room for— | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 7 | Narrator | Dot stopped. | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 8 | Pokey | Yeah. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 9 | Narrator | He folded the note along its own creases and put it in the satchel wi… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |

## World 1 guardian intro (`w1-boss-intro`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Venom Fang | Ssloth. What are you doing on my branch? | dip | 450 ms | 34 ms | push 1.50→1.58 3.6s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I'm going to get Meeca back. | cut | 430 ms | 40 ms | single 1.68→1.75 3.2s | own | keep | an answer: a thinking beat |
| 2 | Venom Fang | You're going to take her from him? From the General. Up there. I was… (2 pages) | cut | 180 ms | 34 ms | single 1.68→1.75 8.5s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Venom Fang | You'll have to get through me, ssloth. Take all the time you need. | cut | 180 ms | 34 ms | push 1.75→1.83 4.3s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | I usually do. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |

## World 1 guardian defeat (`w1-boss-defeat`, 9 pictures)

**What's flat**

- Every one of the 9 pictures dips in from black today; directed, 8 become cuts inside one setup.
- 0 of 9 pictures have only the shared 4% push (9 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | One last swing, and Venom Fang goes down in a tangle of his own coils. | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 1 | Venom Fang | Beaten. By a sloth. Not even a fast one. The slowest sloth in the who… | cut | 180 ms | 34 ms | authored move | own | keep |  |
| 2 | Pokey | Wait till the neighbors hear. | cut | 180 ms | 40 ms | authored move | own | keep |  |
| 3 | Venom Fang | If anyone asks, I tied myself in this knot on purpose. | cut | 180 ms | 34 ms | authored move | own | keep |  |
| 4 | Pokey | Sure you did. | cut | 180 ms | 40 ms | authored move | own | keep |  |
| 5 | Venom Fang | Don't look at the collar. It itches. It always itches. She thanked me… (2 pages) | cut | 180 ms | 34 ms | authored move | own | keep |  |
| 6 | Pokey | May I go past now? | cut | 630 ms | 40 ms | authored move | own | keep | a short line after a long one: give it room |
| 7 | Venom Fang | You asked. Nobody asks. | cut | 430 ms | 34 ms | authored move | own | keep | an answer: a thinking beat |
| 8 | Narrator | The great serpent unwinds, grumbles, and slithers away. Past the bend… | cut | 180 ms | 30 ms | authored move | own | keep |  |

## World 2 arrival (`w2-arrival`, 13 pictures)

**What's flat**

- Every one of the 13 pictures dips in from black today; directed, 12 become cuts inside one setup.
- 12 of 13 pictures have only the shared 4% push (1 have a camera move of their own).
- 3 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Sunlit Riverbank was wide, brown, and in no hurry. A village of s… (2 pages) | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 1 | Pokey | Huh. I could live here. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 2 | Dot | Don't you dare. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | own | keep |  |
| 3 | Narrator | At the top of the bank, the village crier, Gruntlewick, was reading o… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 4 | Dot | And that's the mailman. With the package. He's been taking that packa… (2 pages) | cut | 180 ms | 22 ms | single 1.51→1.58 7.5s | +0.5 st, 0 dB | keep |  |
| 5 | Narrator | The mailman and Pokey passed each other on the path. They nodded. It… | cut | 180 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 6 | Gruntlewick | Young man. You've come a long way. Are your folks behind you? They'll… | cut | 180 ms | 53 ms | slowPush 1.50→1.71 10.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 7 | Pokey | Somewhere back there. I think they stopped for lunch. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.5s | -0.5 st, -1.5 dB | keep |  |
| 8 | Gruntlewick | Ah. Then they'll catch up. | cut | 180 ms | 53 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 9 | Pokey | Any day now. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 10 | Narrator | Dot had been in the middle of a sentence. She left it there and went… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 11 | Narrator | Pokey touched the petal on his wrist. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 12 | Narrator | Out on the water, a log was drifting toward the bank, against the cur… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |

## World 2 midpoint (`w2-mid`, 17 pictures)

**What's flat**

- Every one of the 17 pictures dips in from black today; directed, 16 become cuts inside one setup.
- 17 of 17 pictures have only the shared 4% push (0 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The village had promised Pokey a raft. They started building it the m… | dip | 450 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 1 | Narrator | Pokey sat on the bank and watched them. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 2 | Dot | Pokey. Your foot's tapping. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 3 | Pokey | It is not. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 4 | Dot | It is. Look at it. I've known you your whole life, and I have never o… | cut | 180 ms | 22 ms | single 1.68→1.75 4.5s | +0.5 st, 0 dB | keep |  |
| 5 | Narrator | Pokey looked down at his foot. He put his hand on it. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 6 | Pokey | Is this what it's like for everybody else? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Dot | Every single day. | cut | 430 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 8 | Dot | I went back to the netting last night. There was a new one. It's not… (2 pages) | cut | 180 ms | 22 ms | push 1.71→1.80 6.5s | -0.5 st, -1 dB | keep |  |
| 9 | Dot | "Every guardian wears an iron collar with thorns on the inside. They… (2 pages) | cut | 180 ms | 22 ms | push 1.80→1.83 6.9s | own | keep |  |
| 10 | Pokey | The snake kept scratching at his. I thought he had fleas. | cut | 180 ms | 40 ms | single 1.68→1.75 4.3s | own | keep |  |
| 11 | Dot | Snakes don't get fleas, Pokey. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep |  |
| 12 | Narrator | Down on the bank, a sloth carefully fitted the first log of the raft… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 13 | Pokey | She wants me to be nice to the snake. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 14 | Dot | She was nice to a wasp once. Now it visits. It brings friends. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 15 | Pokey | What's in the pouch? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 16 | Dot | It's a thing. It isn't for you. | cut | 430 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | an answer: a thinking beat |

## World 2 guardian intro (`w2-boss-intro`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Crocus Rex | HALT! You stand on the bank of Crocus Rex, King of the Sunlit Riverba… (2 pages) | dip | 450 ms | 36 ms | push 1.50→1.58 9.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | Nice crown. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room |
| 2 | Crocus Rex | Don't look at it. It's crooked. The little keeper made it for me on t… (2 pages) | cut | 180 ms | 36 ms | single 1.68→1.75 7.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | It suits you. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room |
| 4 | Crocus Rex | Does it? No. NO. Nice try. It is a matter of professional pride that… | cut | 180 ms | 36 ms | single 1.68→1.75 5.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 2 guardian defeat (`w2-boss-defeat`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Crocus Rex | Upside down! I, Crocus Rex, King of the Sunlit Riverbank, upside down… (2 pages) | dip | 450 ms | 36 ms | push 1.50→1.58 8.2s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | They're pretty slow. You've got a few years. | cut | 180 ms | 40 ms | single 1.68→1.75 3.8s | own | keep |  |
| 2 | Crocus Rex | My crown! Where is my... oh. There. Fine. You may have the river. The… | cut | 180 ms | 41 ms | slowPush 1.50→1.71 11.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | I'll tell her. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 4 | Crocus Rex | Now go. Before I'm ordered to be unreasonable. | cut | 180 ms | 41 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 3 arrival (`w3-arrival`, 11 pictures)

**What's flat**

- Every one of the 11 pictures dips in from black today; directed, 10 become cuts inside one setup.
- 10 of 11 pictures have only the shared 4% push (1 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Mossy Grotto was lit from above by glowworms. They hung from the… | dip | 450 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |
| 1 | Dot | I don't do dark, Pokey. I do daylight. I'll do a little dusk if I hav… | cut | 180 ms | 22 ms | single 1.68→1.75 5.2s | +0.5 st, 0 dB | keep |  |
| 2 | Pokey | Stay close. I'm dim, but I'm steady. | cut | 180 ms | 40 ms | single 1.68→1.75 3.5s | +0.5 st, 0 dB | keep |  |
| 3 | Dot | Dim and steady. Fine. Don't let go of me. | cut | 180 ms | 22 ms | single 1.68→1.75 3.1s | +0.5 st, 0 dB | keep |  |
| 4 | Dot | Have you got everything? Petal? Satchel? Ears? | cut | 180 ms | 22 ms | push 1.75→1.83 3.4s | +0.5 st, 0 dB | keep |  |
| 5 | Narrator | Pokey stopped to listen to the glowworms, and the glowworms noticed.… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 6 | Narrator | Between the stalactites hung the old thorn vines that Meeca's grandma… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 7 | Narrator | On the floor, in the mud, were footprints. Each one was as wide as Po… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 8 | Dot | I'm looking at them with my eyes closed. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep |  |
| 9 | Pokey | That doesn't make them smaller. | cut | 180 ms | 40 ms | single 1.68→1.75 3.1s | -0.5 st, -1 dB | keep |  |
| 10 | Narrator | Far back in the dark, two eyes opened, and didn't blink. Whatever it… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |

## World 3 midpoint (`w3-mid`, 9 pictures)

**What's flat**

- Every one of the 9 pictures dips in from black today; directed, 8 become cuts inside one setup.
- 9 of 9 pictures have only the shared 4% push (0 have a camera move of their own).
- 3 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Dot | Okay. I have to tell you something, and I need you to not look at me… | dip | 450 ms | 22 ms | push 1.50→1.58 4.0s | +0.5 st, 0 dB | keep |  |
| 1 | Pokey | Like what? | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 2 | Dot | Like that. Remember my bush? When they marched her past it, she empti… (2 pages) | cut | 430 ms | 25 ms | slowPush 1.50→1.71 10.3s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 3 | Dot | And then there were boots everywhere, so I hid them. In ferns. A lot… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 7.7s | -0.5 st, -1.5 dB | keep |  |
| 4 | Pokey | In ferns. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 5 | Dot | It was a good plan. The ferns were the problem. All ferns look alike. | cut | 180 ms | 22 ms | single 1.68→1.75 3.7s | +0.5 st, 0 dB | keep |  |
| 6 | Pokey | Which ferns? | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 7 | Dot | Ferny ones. Around here, ish. If you crouch down next to the right on… (2 pages) | cut | 430 ms | 22 ms | single 1.68→1.75 6.9s | own | keep | an answer: a thinking beat |
| 8 | Narrator | So the search for Meeca's grandma's things began. A sloth crouched be… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |

## World 3 guardian intro (`w3-boss-intro`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Shadow Prowler | Word came down the river that the snake lost to a sloth. I did not be… | dip | 450 ms | 36 ms | push 1.50→1.58 5.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Shadow Prowler | You will not hit what you cannot find, little sloth. I am the dark be… | cut | 180 ms | 36 ms | push 1.58→1.65 5.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Pokey | I can wait. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room |
| 3 | Shadow Prowler | Everyone says that. Then they hurry. Everyone hurries. Not one has la… | cut | 180 ms | 36 ms | single 1.68→1.75 5.9s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | I never learned how to hurry. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |

## World 3 guardian defeat (`w3-boss-defeat`, 3 pictures)

**What's flat**

- Every one of the 3 pictures dips in from black today; directed, 2 become cuts inside one setup.
- 3 of 3 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Shadow Prowler | Two hours, and you did not look at the sky once. I got tired first. T… | dip | 450 ms | 36 ms | push 1.50→1.58 6.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | Two hours? Try two days on a vine sometime. | cut | 180 ms | 40 ms | single 1.68→1.75 3.7s | own | keep |  |
| 2 | Shadow Prowler | Meeca went north, toward the clouds. The thorns on our necks are call… | cut | 180 ms | 36 ms | single 1.68→1.75 7.5s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 4 arrival (`w4-arrival`, 17 pictures)

**What's flat**

- Every one of the 17 pictures dips in from black today; directed, 15 become cuts inside one setup.
- 15 of 17 pictures have only the shared 4% push (2 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The vine held. Pokey hung from the end of it, turning a little, over… | dip | 1100 ms | 30 ms | authored move | -0.5 st, -1 dB | keep | a beat before the cliffhanger |
| 1 | Pokey | I'm looking down. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep | a short line after a long one: give it room |
| 2 | Dot | Don't look at the down! Look at the up! The up is nice! Hold on, I've… | cut | 180 ms | 19 ms | single 1.68→1.75 3.9s | 0 st, +1 dB | keep |  |
| 3 | Narrator | She had hold of one of his claws and was pulling with everything she… | cut | 180 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 4 | Pokey | Dot. Let go. If I fall, I'm not taking you with me. | cut | 680 ms | 46 ms | slowPush 1.50→1.71 7.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 5 | Dot | Don't you dare say that. Don't you dare. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 6 | Narrator | She didn't let go. It took Pokey the better part of an hour to climb… (3 pages) | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Pokey | That wasn't the Prowler. That was the General. He used the Prowler li… | cut | 180 ms | 40 ms | single 1.68→1.75 5.3s | -0.5 st, -1 dB | keep |  |
| 8 | Dot | I know. | cut | 680 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 9 | Pokey | The Prowler said sorry. He was still saying it when the ledge went. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 7.1s | -1 st, -3 dB | keep |  |
| 10 | Pokey | That was a loud horn. | cut | 180 ms | 40 ms | push 1.71→1.80 3.0s | -0.5 st, -1 dB | keep |  |
| 11 | Dot | It was a horn, Pokey. A horn has somebody on the other end. I always… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.6s | -0.5 st, -1.5 dB | keep |  |
| 12 | Narrator | Waterfalls as tall as the sky. The water ran cloudy, which the old sl… | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 13 | Narrator | A feather drifted down out of the mist, as long as Pokey's whole arm. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 14 | Dot | That's Her Majesty the Sky Sovereign, so please, please be polite. Sh… | cut | 180 ms | 22 ms | single 1.68→1.75 4.6s | own | keep |  |
| 15 | Pokey | I'll wait till she's done. | cut | 630 ms | 40 ms | single 1.68→1.75 3.3s | own | keep | a short line after a long one: give it room |
| 16 | Dot | She started it this morning. It's a very long way down. | cut | 180 ms | 22 ms | single 1.68→1.75 3.2s | own | keep |  |

## World 4 midpoint (`w4-mid`, 11 pictures)

**What's flat**

- Every one of the 11 pictures dips in from black today; directed, 10 become cuts inside one setup.
- 11 of 11 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Dot | Okay. The note. Don't be alarmed. It's short. | dip | 450 ms | 22 ms | push 1.50→1.58 3.6s | -0.5 st, -1 dB | keep |  |
| 1 | Pokey | Short. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep |  |
| 2 | Narrator | Today's note said, "Still here." That was all of it. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 3 | Narrator | Dot kept turning so Pokey would only see one side of her. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 4 | Pokey | Dot. Turn around. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 5 | Narrator | She didn't, and then she did. There was a bare patch on her tail the… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 6 | Dot | It's nothing. It's the netting. It's a scratch. It's nine scratches.… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.5s | -1 st, -3 dB | keep |  |
| 7 | Pokey | Why do you keep bringing them? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 8 | Dot | Two words weigh nothing. I checked. I weighed it against a berry, and… | cut | 430 ms | 25 ms | slowPush 1.50→1.71 7.5s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 9 | Pokey | Oh, Dot. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 10 | Dot | Don't. I'll cry, and I can't afford the water weight. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |

## World 4 guardian intro (`w4-boss-intro`, 6 pictures)

**What's flat**

- Every one of the 6 pictures dips in from black today; directed, 5 become cuts inside one setup.
- 6 of 6 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Sky Sovereign | Nothing climbs my cliffs. State your business, sloth, and keep it sho… | dip | 450 ms | 30 ms | push 1.50→1.58 5.1s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I'm going to get Meeca back. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 2 | Sky Sovereign | I saw her. She waved. I have orders concerning whatever follows her.… (2 pages) | cut | 180 ms | 30 ms | single 1.68→1.75 7.5s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | Slowly. | cut | 880 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room; an answer: a thinking beat |
| 4 | Dot | He's very polite, he gets that from me, I mean he doesn't, I'm a bird… | cut | 180 ms | 22 ms | single 1.68→1.75 3.9s | own | keep |  |
| 5 | Sky Sovereign | The cat says you outwaited him. Cats lie. | cut | 180 ms | 30 ms | single 1.68→1.75 3.3s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 4 guardian defeat (`w4-boss-defeat`, 6 pictures)

**What's flat**

- Every one of the 6 pictures dips in from black today; directed, 5 become cuts inside one setup.
- 6 of 6 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Sky Sovereign | Enough. I am on the ground. I am never on the ground. The owls will b… | dip | 450 ms | 30 ms | push 1.50→1.58 5.7s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I won't tell anybody. | cut | 630 ms | 40 ms | single 1.68→1.75 3.1s | own | keep | a short line after a long one: give it room |
| 2 | Dot | I'm telling everybody. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | own | keep |  |
| 3 | Sky Sovereign | The cat did not lie, then. The cliff is yours. I am relieved, if you… (2 pages) | cut | 180 ms | 30 ms | single 1.68→1.75 7.6s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | I know. I heard who did. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 5 | Sky Sovereign | Good. Watch the next collar. The General's hand is on every one of th… | cut | 180 ms | 30 ms | single 1.68→1.75 5.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 5 arrival (`w5-arrival`, 14 pictures)

**What's flat**

- Every one of the 14 pictures dips in from black today; directed, 13 become cuts inside one setup.
- 13 of 14 pictures have only the shared 4% push (1 have a camera move of their own).
- 3 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Orchid Sanctuary was the loveliest place on the whole road, and P… | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 1 | Narrator | It was barely afternoon, and the orchids were already closing, a few… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 2 | Narrator | On the trunk of the first tree, someone had carved a message with som… (2 pages) | cut | 180 ms | 35 ms | drift 1.54→1.58 10.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Pokey | She got away from them. | cut | 630 ms | 46 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 4 | Dot | She what? No. I followed that column the whole way up. She walked the… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.7s | -0.5 st, -1.5 dB | keep |  |
| 5 | Narrator | Dot stopped and looked at the letters again. | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 6 | Dot | With a hairpin. She's so resourceful. She's the most resourceful pers… (3 pages) | cut | 180 ms | 22 ms | single 1.68→1.75 8.1s | +0.5 st, 0 dB | keep |  |
| 7 | Dot | If she carved one, she carved more. She never leaves just one of anyt… | cut | 180 ms | 22 ms | push 1.75→1.83 4.2s | +0.5 st, 0 dB | keep |  |
| 8 | Narrator | A little table stood in the middle of the path, set for two: china cu… (3 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 9 | Pokey | That's very polite. | cut | 630 ms | 40 ms | single 1.68→1.75 3.1s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 10 | Dot | That's what makes it scary. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 11 | Narrator | Pokey looked at the chairs. They looked back. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 12 | Pokey | Dot. Be honest. How bad would it be if I just sat for one minute? | cut | 180 ms | 40 ms | single 1.68→1.75 4.8s | +0.5 st, 0 dB | keep |  |
| 13 | Dot | You'd be a chair, Pokey. You'd be, forever, a very still chair. | cut | 430 ms | 22 ms | single 1.68→1.75 3.7s | -0.5 st, -1 dB | keep | an answer: a thinking beat |

## World 5 midpoint (`w5-mid`, 13 pictures)

**What's flat**

- Every one of the 13 pictures dips in from black today; directed, 12 become cuts inside one setup.
- 13 of 13 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | They stopped to rest on a branch where the orchids hung in rows. Poke… (2 pages) | dip | 450 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 1 | Pokey | You're still checking that pouch. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 2 | Dot | It's a thing. It isn't for you. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 3 | Pokey | Who's it for? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 4 | Dot | Somebody I'm scared of. | cut | 430 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | an answer: a thinking beat |
| 5 | Pokey | The General? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 6 | Dot | Not of him. Of what it says, and what he does when he reads it, and t… | cut | 430 ms | 25 ms | slowPush 1.50→1.71 7.5s | -1 st, -3 dB | keep | an answer: a thinking beat |
| 7 | Narrator | She stopped. | cut | 630 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 8 | Pokey | Then give it to him when you're ready. Not before. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.3s | -1 st, -3 dB | keep |  |
| 9 | Dot | And what if it's too late by then? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 10 | Pokey | Slow isn't stopped. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 11 | Dot | Is that true, or is that just something you say? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 12 | Pokey | I don't know yet. It hasn't been wrong. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.1s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |

## World 5 guardian intro (`w5-boss-intro`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Tarantula Queen | Welcome, darling. Do stay awhile. Everyone does. Eventually. | dip | 450 ms | 33 ms | push 1.50→1.58 4.6s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I can't stay. My friend's in a tower. | cut | 180 ms | 40 ms | single 1.68→1.75 3.5s | own | keep |  |
| 2 | Dot | There's a doily, Pokey. Nothing good has ever had a doily. | cut | 180 ms | 22 ms | single 1.68→1.75 3.3s | own | keep |  |
| 3 | Tarantula Queen | The eagle sent word a sloth was coming, so I set the table. A week ag… (2 pages) | cut | 180 ms | 33 ms | single 1.68→1.75 7.7s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | Sorry I'm late. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room |

## World 5 guardian defeat (`w5-boss-defeat`, 3 pictures)

**What's flat**

- Every one of the 3 pictures dips in from black today; directed, 2 become cuts inside one setup.
- 3 of 3 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Tarantula Queen | My webs. All that silk, and a sloth walks straight through it. Well.… | dip | 450 ms | 33 ms | push 1.50→1.58 5.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I'll send a thank-you note. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 2 | Tarantula Queen | Don't go yet. The pot's still warm. The cat told you to ask how it be… | cut | 180 ms | 38 ms | slowPush 1.50→1.71 8.5s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 6 arrival (`w6-arrival`, 9 pictures)

**What's flat**

- Every one of the 9 pictures dips in from black today; directed, 8 become cuts inside one setup.
- 8 of 9 pictures have only the shared 4% push (1 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The roots of the Deep Mangrove stood up out of the water in a maze, a… (2 pages) | dip | 450 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |
| 1 | Pokey | Water that flat has something under it. | cut | 180 ms | 40 ms | single 1.68→1.75 3.4s | -0.5 st, -1 dB | keep |  |
| 2 | Narrator | Out of the black water, a spear rose, slowly. It turned to look at th… | cut | 830 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep | a beat before the darkness |
| 3 | Dot | Did the water just look at us? | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 4 | Pokey | Somebody's holding it. | cut | 430 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep | an answer: a thinking beat |
| 5 | Dot | That's worse, that's so much worse, I'm fine, I've backed up about ni… | cut | 180 ms | 22 ms | single 1.68→1.75 4.8s | +0.5 st, 0 dB | keep |  |
| 6 | Dot | "Pokey, the Reaver eats lunch at noon. Do NOT meet him at noon." That… | cut | 180 ms | 22 ms | push 1.75→1.83 5.3s | +0.5 st, 0 dB | keep |  |
| 7 | Pokey | What time is it? | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 8 | Dot | Noon. It's noon. I can see the sun, right there, straight down throug… | cut | 1080 ms | 22 ms | reveal 1.74→1.46 2.4s | -0.5 st, -1 dB | keep | a beat before the cliffhanger; an answer: a thinking beat |

## World 6 midpoint (`w6-mid`, 26 pictures)

**What's flat**

- Every one of the 26 pictures dips in from black today; directed, 25 become cuts inside one setup.
- 26 of 26 pictures have only the shared 4% push (0 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

**Direction**

The gap closing is the one time being slow costs Pokey something, so it has to hurt. Today it is the same close shot of Pokey and
Dot for 15 pictures, with the music going on under "We stopped for tea."

- **Dot's confession** opens on a breath (0.8 s) with a slow push on her. She has rehearsed a joke and can't do it.
- **"We stopped for tea."** Total silence: the music fades out under Pokey's line and stays out for Dot's echo. A held frame, no push.
  1.5 s before Pokey's line, 1.1 s before Dot's. This is the moment that earns "slow is not stopped".
- **"He'll know. He'll have stopped."** Quiet, a slow push, the music under.
- **The leaf shivering after she goes** holds still with the music under: it is the loneliest picture in the game until Flicker's
  light comes down.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Dot | Pokey. I have to tell you something. I tried to make it funny the who… | dip | 800 ms | 25 ms | slowPush 1.50→1.71 8.2s | -1 st, -3 dB | keep | she has been rehearsing this: let her breathe first |
| 1 | Pokey | Go on. | cut | 700 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | he already knows |
| 2 | Dot | That was the last note I can get out. They sewed the gap shut the nig… | cut | 180 ms | 22 ms | slowPush 1.50→1.71 6.6s | -0.5 st, -1 dB | keep | slow in on Dot |
| 3 | Pokey | We stopped for tea. | cut | 1500 ms | 46 ms | still 1.20→1.22 12.0s | -1 st, -3 dB | silence | the cost of being slow: total silence |
| 4 | Dot | We stopped for tea. | cut | 1100 ms | 25 ms | still 1.50→1.52 12.0s | -1 st, -3 dB | silence | she says it back: still nothing |
| 5 | Dot | I've been all the way around twice looking for another way in. I chec… | cut | 180 ms | 22 ms | push 1.52→1.60 4.0s | -0.5 st, -1 dB | keep |  |
| 6 | Dot | She gave me three at the end. The lunch one was the silly one. There'… (2 pages) | cut | 180 ms | 22 ms | push 1.60→1.68 6.7s | -0.5 st, -1 dB | keep |  |
| 7 | Dot | She wrote it on a really bad day, and she made me swear to give it to… | cut | 180 ms | 22 ms | push 1.68→1.76 4.0s | -0.5 st, -1 dB | keep |  |
| 8 | Pokey | How will I know when I need it? | cut | 180 ms | 40 ms | single 1.68→1.75 3.1s | -0.5 st, -1 dB | keep |  |
| 9 | Dot | She said, "He'll know. He'll have stopped." | cut | 900 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | under | the sealed note: quiet |
| 10 | Narrator | Dot had three tail feathers left. The rest were in the net. Pokey saw… | cut | 700 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep | the cost on her body, seen not said |
| 11 | Narrator | Dot tucked the sealed note into the satchel with both feet, gently, a… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 12 | Dot | I'm going around. There's always a seam. I'll find the one that's ope… (2 pages) | cut | 180 ms | 22 ms | single 1.68→1.75 6.3s | own | keep |  |
| 13 | Pokey | We never agreed on a time. | cut | 700 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | his gift to her: a pause, then warmth |
| 14 | Narrator | Dot went up through the roots. One leaf kept shivering after she was… | cut | 800 ms | 35 ms | still 1.30→1.32 12.0s | -1 st, -3 dB | under | alone: hold on the shivering leaf |
| 15 | Narrator | The leaf kept shivering. Then a small light came down through the roo… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 16 | Flicker | You're Pokey. | cut | 630 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 17 | Pokey | Most days. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 18 | Flicker | Your name's on a tree back in the orchids. I've been behind you ever… | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.1s | -0.5 st, -1.5 dB | keep |  |
| 19 | Pokey | Can you get a note to her? Over the net? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 20 | Flicker | I tried. It hums when anything touches it. They come running. | cut | 430 ms | 28 ms | slowPush 1.50→1.71 6.1s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 21 | Pokey | Who are you? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 22 | Flicker | Flicker. Just passing. | cut | 430 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 23 | Pokey | You've been passing since the orchids. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 24 | Flicker | Somebody who owes her. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 25 | Narrator | He didn't say any more. He came and sat on the satchel strap. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |

## World 6 guardian intro (`w6-boss-intro`, 4 pictures)

**What's flat**

- Every one of the 4 pictures dips in from black today; directed, 3 become cuts inside one setup.
- 4 of 4 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Marsh Reaver | Who wades into the blackwater at noon? Nobody wades at noon. It is LU… | dip | 450 ms | 36 ms | push 1.50→1.58 5.1s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I know what time it is. I'm not waiting. | cut | 180 ms | 40 ms | single 1.68→1.75 3.6s | own | keep |  |
| 2 | Marsh Reaver | Wait. You're the sloth. The runners talk about you when they bring my… (2 pages) | cut | 180 ms | 36 ms | single 1.68→1.75 9.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | I'm taller upside down. | cut | 630 ms | 40 ms | single 1.68→1.75 3.2s | own | keep | a short line after a long one: give it room |

## World 6 guardian defeat (`w6-boss-defeat`, 4 pictures)

**What's flat**

- Every one of the 4 pictures dips in from black today; directed, 3 become cuts inside one setup.
- 4 of 4 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Marsh Reaver | You waded in at LUNCH and won. Lunch has never lost. The runners are… | dip | 450 ms | 36 ms | push 1.50→1.58 5.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | Your lunch is getting cold. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 2 | Marsh Reaver | It is cold now. Hrmph. Go. | cut | 180 ms | 36 ms | single 1.68→1.75 3.1s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Narrator | When Pokey looked back, the Reaver had left half his lunch on a root,… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |

## World 7 arrival (`w7-arrival`, 7 pictures)

**What's flat**

- Every one of the 7 pictures dips in from black today; directed, 6 become cuts inside one setup.
- 6 of 7 pictures have only the shared 4% push (1 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The temple door stood slightly open. Meeca had come through here. So,… | dip | 450 ms | 30 ms | authored move | own | keep |  |
| 1 | Narrator | The vines on the old walls hung brown. When he touched one, it didn't… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 2 | Narrator | He turned to say something to Dot. There was only Flicker, which wasn… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 3 | Narrator | In the first courtyard, ten stone chairs stood in a ring around a cra… (2 pages) | cut | 180 ms | 30 ms | drift 1.54→1.58 10.0s | own | keep |  |
| 4 | Narrator | An eleventh chair stood a little apart from the ring, plain, with no… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 5 | Pokey | Ten, and him. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 6 | Narrator | From the shadows, something very large began to speak. It took four m… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |

## World 7 midpoint (`w7-mid`, 7 pictures)

**What's flat**

- Every one of the 7 pictures dips in from black today; directed, 6 become cuts inside one setup.
- 7 of 7 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Pokey | Excuse me. Do you know the way up? | dip | 450 ms | 40 ms | push 1.50→1.58 3.6s | +0.5 st, 0 dB | keep |  |
| 1 | Narrator | The statue said nothing. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 2 | Pokey | Thanks for not interrupting. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 3 | Narrator | Further in, he stopped to listen to the quiet. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 4 | Pokey | Dot would say this place is older than the river, and she'd have a nu… | cut | 180 ms | 46 ms | slowPush 1.50→1.71 8.7s | -0.5 st, -1.5 dB | keep |  |
| 5 | Narrator | He left a gap after it, for the answer. Flicker didn't fill it. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 6 | Narrator | He hummed to fill it, badly. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |

## World 7 guardian intro (`w7-boss-intro`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Stone Idol Golem | I... heard... you were... coming. Three... weeks... ago. You... are..… | dip | 450 ms | 44 ms | push 1.50→1.58 9.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | First time for everything. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |
| 2 | Stone Idol Golem | I... am... the guardian... of this... temple. None... may... pass. | cut | 180 ms | 44 ms | single 1.68→1.75 8.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | Finally. Somebody I can keep up with. | cut | 180 ms | 40 ms | single 1.68→1.75 3.5s | own | keep |  |
| 4 | Stone Idol Golem | I... have... waited... a thousand... years. For... | cut | 180 ms | 44 ms | single 1.68→1.75 6.6s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 7 guardian defeat (`w7-boss-defeat`, 6 pictures)

**What's flat**

- Every one of the 6 pictures dips in from black today; directed, 5 become cuts inside one setup.
- 6 of 6 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Stone Idol Golem | In... under... an hour. You are... so... fast. | dip | 450 ms | 44 ms | push 1.50→1.58 6.4s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | Say that again. Slower. I want to enjoy it. | cut | 180 ms | 40 ms | single 1.68→1.75 3.9s | own | keep |  |
| 2 | Stone Idol Golem | The rune... is broken. The way up... is open. Behind... the rune... | cut | 180 ms | 44 ms | single 1.68→1.75 7.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | Take your time. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |
| 4 | Stone Idol Golem | I... always... do. | cut | 180 ms | 44 ms | single 1.68→1.75 3.7s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 5 | Stone Idol Golem | There is... a photograph. The General asked me... to keep it... from… | cut | 180 ms | 44 ms | push 1.75→1.83 9.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 8 arrival (`w8-arrival`, 38 pictures)

**What's flat**

- Every one of the 38 pictures dips in from black today; directed, 34 become cuts inside one setup.
- 35 of 38 pictures have only the shared 4% push (3 have a camera move of their own).
- 6 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Seven guardians lay behind him. No note had come since the mangrove,… | dip | 450 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |
| 1 | Pokey | Seven. Two more, and then him. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 2 | Narrator | Flicker went on ahead, and the fireflies came out to meet him as the… (2 pages) | dip | 450 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |
| 3 | Narrator | He sat down on a branch to rest his eyes. He was asleep before he'd f… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 4 | Narrator | Pokey dreamed of the old nest, and the stars over it. | dip | 450 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 5 | Meeca | Hold out your wrist. I'm tying a petal on it. It's off the Heartbloom… | cut | 180 ms | 37 ms | slowPush 1.50→1.71 7.6s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 6 | Pokey | A petal will wilt. | cut | 630 ms | 46 ms | slowPush 1.35→1.54 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 7 | Meeca | Not this one. Grandma says it lasts exactly as long as somebody is th… | cut | 180 ms | 37 ms | slowPush 1.00→1.14 8.0s | -0.5 st, -1.5 dB | keep |  |
| 8 | Pokey | Then it'll last. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 9 | Meeca | Keep it on. Even if I go somewhere you can't follow. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 10 | Pokey | Especially then. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 11 | Narrator | In the dream, the petal began to glow. It pointed out of the dark, an… | cut | 180 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |
| 12 | Dot | Wake up, wake up, wake up. You were mumbling, mostly about a petal. I… (2 pages) | dip | 450 ms | 25 ms | slowPush 1.50→1.71 9.8s | -0.5 st, -1.5 dB | keep |  |
| 13 | Narrator | Dot stopped. There was a light on Pokey's satchel strap, and it was l… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 14 | Dot | Pokey. There's a bug on you. A glowing one. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 15 | Flicker | Flicker. Hello. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 16 | Dot | How long has it been glowing at you? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 17 | Flicker | Since the mangrove. And I'm a he. | cut | 430 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 18 | Dot | Since the mangrove. That's a long time to be glowing at somebody. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 19 | Dot | I've been doing this his whole life. You've been doing it since a man… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 20 | Flicker | Then you'll know where he keeps the snacks. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 21 | Pokey | Dot. You came back. You're bleeding. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 22 | Dot | Never mind me, look at you, you've lost weight, have you been eating,… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.5s | -0.5 st, -1.5 dB | keep |  |
| 23 | Dot | And don't tell me it's the soup, I read the note, everybody's read th… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.6s | -0.5 st, -1.5 dB | keep |  |
| 24 | Dot | I found a seam in the net, behind some kind of cookhouse, that was ju… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 9.9s | -0.5 st, -1.5 dB | keep |  |
| 25 | Dot | "Pokey, I bet you're asleep right now. It's fine. I would be too. Kee… (2 pages) | cut | 180 ms | 22 ms | push 1.71→1.80 6.5s | own | keep |  |
| 26 | Pokey | She knows. Meeca knows. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 27 | Dot | She worked it out by herself, up there, in the dark. She said she tri… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 10.6s | -1 st, -3 dB | keep |  |
| 28 | Pokey | Dot, sit down. I have to tell you something. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 29 | Dot | I'm sitting. It's hover-sitting. It takes core. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 30 | Pokey | The General is her grandfather. I found the photograph in the ruins. | cut | 180 ms | 40 ms | single 1.68→1.75 4.7s | own | keep |  |
| 31 | Dot | I know. I've known since the morning he left. I saw which way he went… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 7.2s | -1 st, -3 dB | keep |  |
| 32 | Narrator | Dot landed on the branch. Pokey couldn't remember the last time he'd… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 33 | Pokey | You never said. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 34 | Dot | I can't tell you half of it. Grandma gave me a letter for him that ni… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 8.1s | -1 st, -3 dB | keep |  |
| 35 | Pokey | She's been up there by herself with all of it. | cut | 180 ms | 40 ms | single 1.68→1.75 3.7s | own | keep |  |
| 36 | Dot | Yes. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 37 | Pokey | Then we should go. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |

## World 8 midpoint (`w8-mid`, 13 pictures)

**What's flat**

- Every one of the 13 pictures dips in from black today; directed, 12 become cuts inside one setup.
- 13 of 13 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Flicker lit the branch ahead before Dot could say which one. | dip | 450 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 1 | Dot | I was going to say that one. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 2 | Flicker | You can say the next one. | cut | 180 ms | 24 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 3 | Pokey | Dot, you're humming. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 4 | Dot | I'm not humming. I'm vibrating. Humming is on purpose. | cut | 180 ms | 22 ms | single 1.68→1.75 3.4s | +0.5 st, 0 dB | keep |  |
| 5 | Dot | Pokey. A question. It's the middle of the night, I'm asking it out lo… | cut | 180 ms | 22 ms | push 1.75→1.83 4.5s | +0.5 st, 0 dB | keep |  |
| 6 | Pokey | Okay. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 7 | Dot | It's about a bird. Not me. A bird who's nearly somewhere, and also a… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 7.3s | -1 st, -3 dB | keep |  |
| 8 | Pokey | Next branch. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 9 | Dot | That's it? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 10 | Pokey | That's all I ever do. Then the one after. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.2s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 11 | Dot | Huh. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 12 | Narrator | Dot stopped vibrating somewhere around the next branch. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |

## World 8 guardian intro (`w8-boss-intro`, 4 pictures)

**What's flat**

- Every one of the 4 pictures dips in from black today; directed, 3 become cuts inside one setup.
- 4 of 4 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Night-Wing Monarch | Good evening, little climber. They say you have beaten seven of us. I… | dip | 450 ms | 36 ms | push 1.50→1.58 6.9s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | I'm going to get Meeca back. | cut | 630 ms | 40 ms | single 1.68→1.75 3.4s | own | keep | a short line after a long one: give it room |
| 2 | Night-Wing Monarch | I am told to stop you. I will try to do it softly. You talk in your s… (2 pages) | cut | 180 ms | 36 ms | single 1.68→1.75 9.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | I hope I said something nice. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |

## World 8 guardian defeat (`w8-boss-defeat`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Night-Wing Monarch | Hm. I was asked to stop you softly. I am not sure that counts. | dip | 450 ms | 36 ms | push 1.50→1.58 4.7s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | You were very soft about it. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |
| 2 | Night-Wing Monarch | Will you tell me how it ends? The dream. The bird woke you before the… | cut | 180 ms | 36 ms | single 1.68→1.75 5.4s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | It ends with me getting there. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep |  |
| 4 | Night-Wing Monarch | Ah. A good ending. The Drake is next. He is bad at visitors. Be patie… | cut | 180 ms | 36 ms | single 1.68→1.75 5.6s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 9 arrival (`w9-arrival`, 6 pictures)

**What's flat**

- Every one of the 6 pictures dips in from black today; directed, 5 become cuts inside one setup.
- 4 of 6 pictures have only the shared 4% push (2 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Volcanic Jungle glowed from underneath. The air tasted like peppe… | dip | 450 ms | 30 ms | authored move | +0.5 st, 0 dB | keep |  |
| 1 | Narrator | A voice boomed, "A visitor!" There was a pause. Then, much smaller, i… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 2 | Dot | "It's cold. I'm fine. He sent up another blanket. Please don't tell h… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 9.3s | -0.5 st, -1.5 dB | keep |  |
| 3 | Pokey | She said thank you to him? | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 4 | Dot | She says thank you to everybody. She said it to a thorn once. It had… | cut | 430 ms | 25 ms | slowPush 1.50→1.71 7.5s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 5 | Narrator | Behind the smoke, the fortress stood up out of the thunder. | cut | 180 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |

## World 9 midpoint (`w9-mid`, 14 pictures)

**What's flat**

- Every one of the 14 pictures dips in from black today; directed, 13 become cuts inside one setup.
- 14 of 14 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The lantern was back, held low to the ground, which hadn't fooled any… | dip | 450 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 1 | Lieutenant Pell | I am so sorry. It is me again. I told the kitchen I was out buying th… (2 pages) | cut | 180 ms | 27 ms | single 1.68→1.75 8.9s | +0.5 st, 0 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Dot | Pell! I forgive you for the seam. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 3 | Lieutenant Pell | Miss Meeca asked me to tell you one thing. She says, "Tell Pokey I'm… | cut | 180 ms | 31 ms | slowPush 1.50→1.71 8.9s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | Tell her I'll wear it. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 5 | Lieutenant Pell | I shall. Sir. Everyone. I am so sorry. I really must go. | cut | 180 ms | 31 ms | slowPush 1.50→1.71 6.3s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 6 | Dot | Pokey, you've been quiet since the lava, which is long even for you,… | cut | 180 ms | 22 ms | single 1.68→1.75 4.4s | +0.5 st, 0 dB | keep |  |
| 7 | Pokey | I'm thinking about Meeca's grandfather. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 8 | Dot | What about him? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 9 | Pokey | Do you think he sleeps? | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 10 | Dot | No. | cut | 430 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | an answer: a thinking beat |
| 11 | Pokey | He ate four bowls of the wrong soup. Somebody who does that isn't sle… | cut | 180 ms | 46 ms | slowPush 1.50→1.71 7.5s | -1 st, -3 dB | keep |  |
| 12 | Dot | You're going to go up there and ask him, aren't you? Nicely. With you… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 7.0s | -0.5 st, -1.5 dB | keep |  |
| 13 | Pokey | I thought I'd start there. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |

## World 9 guardian intro (`w9-boss-intro`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Magma Drake | You came. Eight of them said you would, and I did not tidy. I am to b… | dip | 450 ms | 34 ms | push 1.50→1.58 7.4s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | It starts with "I am to burn you." You did that part. | cut | 180 ms | 40 ms | single 1.68→1.75 4.1s | own | keep |  |
| 2 | Magma Drake | Don't be... What is that? On your wrist. It glows. Is it for me? | cut | 180 ms | 34 ms | single 1.68→1.75 5.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | No. | cut | 430 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | an answer: a thinking beat |
| 4 | Magma Drake | No. Of course not. Then we will see what it can do. | cut | 180 ms | 34 ms | single 1.68→1.75 3.9s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 9 guardian defeat (`w9-boss-defeat`, 5 pictures)

**What's flat**

- Every one of the 5 pictures dips in from black today; directed, 4 become cuts inside one setup.
- 5 of 5 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Magma Drake | My fire. A hundred years I kept that going, and the first visitor put… | dip | 450 ms | 34 ms | push 1.50→1.58 4.9s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | You sound terrible. Have some water. Actually, don't. | cut | 180 ms | 40 ms | single 1.68→1.75 4.3s | own | keep |  |
| 2 | Magma Drake | Will you come back? After. Bring tea. Two cups. | cut | 180 ms | 39 ms | slowPush 1.50→1.71 6.2s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | Maybe. If you tidy. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 4 | Magma Drake | Go. Now. Before I say something nice. | cut | 180 ms | 39 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 10 arrival (`w10-arrival`, 24 pictures)

**What's flat**

- Every one of the 24 pictures dips in from black today; directed, 23 become cuts inside one setup.
- 22 of 24 pictures have only the shared 4% push (2 have a camera move of their own).
- 5 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Stormy Highlands began where the trees stopped, and after that th… (2 pages) | dip | 450 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |
| 1 | Narrator | The netting was back at the foot of the mountain. Iron thorns, floor… (2 pages) | cut | 830 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep | a beat before the door |
| 2 | Dot | He measured you. | cut | 630 ms | 22 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep | a short line after a long one: give it room |
| 3 | Pokey | Dot. This is where you go home. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 4 | Dot | No. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | own | keep |  |
| 5 | Pokey | The door fits one. You heard the Lieutenant. They've probably sewn th… | cut | 180 ms | 40 ms | single 1.68→1.75 5.7s | own | keep |  |
| 6 | Dot | He said he'd sew it badly. He was a tailor's apprentice, and he was t… | cut | 180 ms | 22 ms | single 1.68→1.75 4.8s | own | keep |  |
| 7 | Pokey | He's been practicing. | cut | 630 ms | 40 ms | single 1.68→1.75 3.1s | own | keep | a short line after a long one: give it room |
| 8 | Narrator | Thunder came down the mountain, long and low. Pokey took hold of the… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 9 | Pokey | It's only weather. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep | a short line after a long one: give it room |
| 10 | Narrator | The thunder came again. His hands stayed where they were. | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 11 | Pokey | I'm afraid of thunder. | cut | 180 ms | 40 ms | single 1.34→1.40 3.0s | own | keep |  |
| 12 | Dot | I know. Everybody knows. You hold things. You held a teacup for forty… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 8.6s | -0.5 st, -1.5 dB | keep |  |
| 13 | Narrator | Dot waited for him to laugh. He didn't, and neither did she. She put… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 14 | Narrator | Flicker, on the rock beside them, didn't look away. | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 15 | Dot | Pokey. The night your parents went out. There was a warning to give.… (3 pages) | cut | 830 ms | 25 ms | reveal 1.74→1.46 2.4s | -1 st, -3 dB | keep | a beat before the reveal |
| 16 | Dot | They were already out on the far branches. I've never told anybody. I… (2 pages) | cut | 680 ms | 25 ms | slowPush 1.50→1.71 11.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 17 | Narrator | Pokey didn't say anything. He looked at his hands on the rock, and th… | cut | 680 ms | 35 ms | drift 1.24→1.26 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 18 | Dot | You don't have to answer. I need a minute. Don't wait for me. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 19 | Pokey | Dot— | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 20 | Narrator | Dot pushed three folded notes into the satchel with one foot, and the… | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 21 | Pokey | Dot? | cut | 1130 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | under | hush: let it be quiet first; a short line after a long one: give it room |
| 22 | Narrator | The thorns hummed in the wind. Pokey stood in the rain. Then he went… | cut | 180 ms | 30 ms | authored move | own | keep |  |
| 23 | Narrator | Flicker came and sat on his wrist, next to the petal, and lit the fir… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |

## World 10 midpoint (`w10-mid`, 12 pictures)

**What's flat**

- Every one of the 12 pictures dips in from black today; directed, 11 become cuts inside one setup.
- 11 of 12 pictures have only the shared 4% push (1 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Halfway up the mountain, the thunder stopped for a while. In the gap,… | dip | 950 ms | 35 ms | authored move | -1 st, -3 dB | under | hush: let it be quiet first |
| 1 | Narrator | It was a voice, singing softly, and the tune was one he knew. | cut | 180 ms | 35 ms | drift 1.24→1.26 10.0s | -0.5 st, -1.5 dB | keep |  |
| 2 | Narrator | At a barred window at the top of the mountain, Meeca was singing with… (2 pages) | cut | 180 ms | 35 ms | drift 1.24→1.26 10.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Pokey | Meeca. | cut | 630 ms | 46 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 4 | Narrator | He couldn't make out the words from this far away. He took the next s… (2 pages) | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 5 | Narrator | Something small came down out of the rain and landed on the step in f… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 6 | Flicker | You said not to let you stop halfway. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Dot | I know what I said. I know what I said. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 8 | Dot | I got as far as the ridge. I sat there. I'm not doing that again. I'm… | cut | 180 ms | 22 ms | push 1.71→1.80 4.6s | own | keep |  |
| 9 | Narrator | Flicker's light had gone dim in the rain. Dot moved over and held a w… | cut | 180 ms | 35 ms | drift 1.54→1.58 10.0s | -0.5 st, -1.5 dB | keep |  |
| 10 | Pokey | Next step. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room |
| 11 | Dot | Next step. | cut | 180 ms | 22 ms | single 1.68→1.75 3.0s | own | keep |  |

## World 10 gate (`w10-gate`, 6 pictures)

**What's flat**

- Every one of the 6 pictures dips in from black today; directed, 5 become cuts inside one setup.
- 6 of 6 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Dot | This is where I go around. The cookhouse seam. I'm going to be at her… | dip | 450 ms | 22 ms | push 1.50→1.58 5.7s | own | keep |  |
| 1 | Pokey | Dot. | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 2 | Dot | Don't. Go in the front. Flicker, stay with him. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 3 | Flicker | I will. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 4 | Narrator | Then she was gone along the wall. Up above, a flash, and a clang like… | cut | 1330 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | a beat before the darkness; hush: let it be quiet first |
| 5 | Pokey | Dot? | cut | 1130 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | under | hush: let it be quiet first; a short line after a long one: give it room |

## World 10 guardian intro (`w10-boss-intro`, 9 pictures)

**What's flat**

- Every one of the 9 pictures dips in from black today; directed, 8 become cuts inside one setup.
- 9 of 9 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | General Iron-Claw | Nine hundred and ninety-nine steps. One more. The General has broken… | dip | 450 ms | 36 ms | push 1.50→1.58 6.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | Still here, sir. I've come for Meeca. Where's Dot? | cut | 180 ms | 40 ms | single 1.68→1.75 4.2s | own | keep |  |
| 2 | General Iron-Claw | I do not know where your bird is, and I find that I mind. You stopped… | cut | 430 ms | 31 ms | single 1.68→1.75 5.7s | 0 st, +1 dB | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | It was very good tea, sir. | cut | 630 ms | 34 ms | single 1.68→1.75 3.2s | 0 st, +1 dB | keep | a short line after a long one: give it room |
| 4 | General Iron-Claw | Slow gets people killed. | cut | 180 ms | 31 ms | single 1.68→1.75 3.0s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 5 | Pokey | I know it does, sir. My folks went out in a storm when I was little.… | cut | 680 ms | 46 ms | slowPush 1.50→1.71 10.3s | -1 st, -3 dB | under | hush: let it be quiet first |
| 6 | General Iron-Claw | Then you know what it costs. I buried her because help was late. Not… | cut | 680 ms | 41 ms | slowPush 1.50→1.71 7.8s | -1 st, -3 dB | under | hush: let it be quiet first; framed chest-up: lifting the feet clear would cut off the head |
| 7 | Pokey | I've had a long time to work out who to blame, sir. It was a storm. | cut | 680 ms | 46 ms | slowPush 1.50→1.71 7.6s | -1 st, -3 dB | under | hush: let it be quiet first |
| 8 | General Iron-Claw | The General does not lose twice. | cut | 180 ms | 31 ms | single 1.68→1.75 3.0s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |

## World 10 guardian defeat (`w10-boss-defeat`, 4 pictures)

**What's flat**

- Every one of the 4 pictures dips in from black today; directed, 3 become cuts inside one setup.
- 4 of 4 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | General Iron-Claw | You climbed every step. Why did you not turn back? | dip | 950 ms | 41 ms | slowPush 1.50→1.71 6.8s | -1 st, -3 dB | under | hush: let it be quiet first; framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | She was at the top, sir. | cut | 930 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | under | hush: let it be quiet first; an answer: a thinking beat |
| 2 | General Iron-Claw | I left the door open. I told myself it was a trap. | cut | 180 ms | 41 ms | slowPush 1.50→1.71 6.1s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 3 | Pokey | It was a good door, sir. It fit. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |

## Thornbark intro (`thornbark-intro`, 4 pictures)

**What's flat**

- Every one of the 4 pictures dips in from black today; directed, 3 become cuts inside one setup.
- 4 of 4 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Thornbark | Leave my hollow, little sloth. The thorns do not like visitors. Today… | dip | 450 ms | 40 ms | push 1.50→1.58 5.8s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Pokey | Meeca's grandma told me about you. The thorns did this, didn't they? | cut | 180 ms | 40 ms | single 1.68→1.75 4.7s | own | keep |  |
| 2 | Thornbark | I would not kneel. The others did. So the thorns came to teach me how. | cut | 430 ms | 40 ms | single 1.68→1.75 5.2s | own | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 3 | Thornbark | I cannot hold them much longer. Run. Please. | cut | 180 ms | 40 ms | push 1.75→1.83 4.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## Thornbark defeat (`thornbark-defeat`, 6 pictures)

**What's flat**

- Every one of the 6 pictures dips in from black today; directed, 5 become cuts inside one setup.
- 6 of 6 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Thornbark | They are gone. I can hear myself think. It is very loud in here. | dip | 450 ms | 40 ms | push 1.50→1.58 5.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 1 | Thornbark | A sloth. They sent a sloth? No. Nobody sent you. | cut | 180 ms | 40 ms | push 1.58→1.65 4.3s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Pokey | I didn't beat them. I just kept coming back until they got tired of m… | cut | 180 ms | 40 ms | single 1.68→1.75 4.9s | own | keep |  |
| 3 | Pokey | You were right, you know. Not to kneel. | cut | 180 ms | 40 ms | push 1.75→1.83 3.6s | own | keep |  |
| 4 | Thornbark | I have not heard that since the Pact. The keeper before her sat in my… (2 pages) | cut | 180 ms | 40 ms | single 1.68→1.75 9.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 5 | Thornbark | Take this Thorn Heart. Go and bring your Meeca home. | cut | 180 ms | 40 ms | push 1.75→1.83 4.1s | own | keep | framed chest-up: lifting the feet clear would cut off the head |

## Memory: The Waiting (`memory-waiting`, 13 pictures)

**What's flat**

- Every one of the 13 pictures dips in from black today; directed, 12 become cuts inside one setup.
- 13 of 13 pictures have only the shared 4% push (0 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Pokey remembered the day they met. He'd been crossing a single vine f… | dip | 450 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 1 | Narrator | Below him, a squirrel was nailing up a sign. It said THE SLOTH. | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 2 | Meeca | You've been on this vine two days. Is it a good vine? | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Pokey | Very good. I'm nearly halfway. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 4 | Meeca | Halfway to what? | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 5 | Pokey | The other side. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 6 | Meeca | And what's on the other side? | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Pokey | I've lost track. It's still a good vine. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.1s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 8 | Narrator | Every other cub who came along that branch had said "Hurry up" or "Ca… (2 pages) | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 9 | Meeca | Then I'll wait. I brought breakfast. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 10 | Pokey | Won't you be bored? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 11 | Meeca | Nobody's ever let me look at anything this long. | cut | 430 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 12 | Narrator | She waited six hours. When he got to the end of the vine, she was sti… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |

## Memory: The Horn (`memory-horn`, 16 pictures)

**What's flat**

- Every one of the 16 pictures dips in from black today; directed, 14 become cuts inside one setup.
- 14 of 16 pictures have only the shared 4% push (2 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | They came out of the Grotto at dawn, the way you come out of a long s… | dip | 450 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |
| 1 | Dot | We did it. You did it. I was there, and I was loud. | cut | 180 ms | 22 ms | single 1.68→1.75 3.3s | +0.5 st, 0 dB | keep |  |
| 2 | Pokey | You were really loud. It helped. | cut | 180 ms | 40 ms | single 1.68→1.75 3.3s | +0.5 st, 0 dB | keep |  |
| 3 | Narrator | To the north, past the last of the trees, a dark point stood on the h… (2 pages) | cut | 180 ms | 30 ms | authored move | own | keep |  |
| 4 | Pokey | She's up there. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room |
| 5 | Dot | And the weather lives up there too. I've been trying not to say it. | cut | 180 ms | 22 ms | single 1.68→1.75 3.5s | own | keep |  |
| 6 | Shadow Prowler | North, past the falls. Follow the wind, not the path. And, sloth. Whe… | cut | 180 ms | 36 ms | single 1.68→1.75 6.3s | -0.5 st, -1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 7 | Pokey | What horn? | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep | a short line after a long one: give it room |
| 8 | Narrator | The note came down out of the north. It was so low he felt it in his… (2 pages) | soft | 970 ms | 30 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep | a beat before the darkness |
| 9 | Narrator | It rolled on and on, like thunder. Pokey grabbed the ledge. | cut | 180 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 10 | Narrator | The collar on the Prowler's neck turned the red of a coal. His eyes w… | cut | 180 ms | 26 ms | drift 1.54→1.58 10.0s | 0 st, +1 dB | keep |  |
| 11 | Shadow Prowler | Run. Run, little one. I cannot— | cut | 180 ms | 31 ms | single 1.68→1.75 3.0s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 12 | General Iron-Claw | Prowler. The ledge. | cut | 180 ms | 31 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 13 | Narrator | The Prowler's claws came down on the ledge. He fought them every inch… | cut | 180 ms | 26 ms | drift 1.34→1.37 10.0s | 0 st, +1 dB | keep |  |
| 14 | Shadow Prowler | Forgive me, little one. Forgive me. | cut | 180 ms | 31 ms | single 1.68→1.75 3.1s | 0 st, +1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 15 | Narrator | The ledge went the way a dropped plate goes. Dot screamed Pokey's nam… | cut | 1330 ms | 35 ms | reveal 1.51→1.26 2.4s | -1 st, -3 dB | under | a beat before the cliffhanger; hush: let it be quiet first |

## Memory: The Map (`memory-map`, 18 pictures)

**What's flat**

- Every one of the 18 pictures dips in from black today; directed, 17 become cuts inside one setup.
- 15 of 18 pictures have only the shared 4% push (3 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The General had started with a box of forty pins, one for every night… (2 pages) | dip | 450 ms | 30 ms | authored move | 0 st, +1 dB | keep |  |
| 1 | Narrator | The pins had run out the week before. Now there were forks standing i… | cut | 180 ms | 30 ms | authored move | 0 st, +1 dB | keep |  |
| 2 | General Iron-Claw | Forty-four. | cut | 630 ms | 36 ms | single 1.34→1.40 3.0s | -0.5 st, -1 dB | keep | a short line after a long one: give it room |
| 3 | Lieutenant Pell | Sir, I am sorry to interrupt. I am also sorry to report that the mess… | cut | 180 ms | 27 ms | single 1.12→1.17 4.5s | -0.5 st, -1 dB | keep |  |
| 4 | General Iron-Claw | Spoons. | cut | 630 ms | 36 ms | single 1.12→1.17 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 5 | Lieutenant Pell | Sir, the spoons are for the soup. I am sorry. People will notice. Sir… | cut | 180 ms | 27 ms | single 1.12→1.17 5.0s | +0.5 st, 0 dB | keep |  |
| 6 | Narrator | Pell went away and came back with a tray of spoons. | cut | 180 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |
| 7 | Narrator | The General laid his paw flat on the map. The last fork stood four fi… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 8 | General Iron-Claw | He has not gone around anything. Not the river. Not the Grotto. He wa… | cut | 180 ms | 36 ms | single 1.46→1.52 5.6s | -0.5 st, -1 dB | keep |  |
| 9 | Lieutenant Pell | That is very foolish of him, sir. | cut | 180 ms | 27 ms | single 1.12→1.17 3.0s | -0.5 st, -1 dB | keep |  |
| 10 | General Iron-Claw | Yes. | cut | 180 ms | 41 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | keep |  |
| 11 | General Iron-Claw | Lieutenant. The prisoner will have a blanket. That is an order. It is… | cut | 180 ms | 41 ms | slowPush 1.20→1.37 7.7s | -1 st, -3 dB | keep |  |
| 12 | Lieutenant Pell | Yes, sir. Not from you, sir. | cut | 630 ms | 31 ms | slowPush 1.00→1.14 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 13 | General Iron-Claw | Go to bed, Lieutenant. Leave the lantern. | cut | 180 ms | 41 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | keep |  |
| 14 | Lieutenant Pell | Yes, sir. Good night, sir. I am sorry about the spoons. | cut | 180 ms | 31 ms | slowPush 1.00→1.14 6.0s | -1 st, -3 dB | keep |  |
| 15 | Narrator | When the door had closed, the General took a spoon from the tray and… | cut | 680 ms | 35 ms | drift 1.44→1.47 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 16 | General Iron-Claw | I used to walk straight through. | cut | 180 ms | 41 ms | slowPush 1.40→1.60 6.0s | -1 st, -3 dB | keep |  |
| 17 | General Iron-Claw | Forty-five. | cut | 680 ms | 41 ms | slowPush 1.40→1.60 6.0s | -1 st, -3 dB | under | hush: let it be quiet first |

## Memory: Grandma's Garden (`memory-garden`, 11 pictures)

**What's flat**

- Every one of the 11 pictures dips in from black today; directed, 10 become cuts inside one setup.
- 11 of 11 pictures have only the shared 4% push (0 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Heartbloom garden, years ago. Meeca's grandma was teaching her ho… | dip | 450 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 1 | Grandma | Don't fuss at it, dear. Sit. | cut | 630 ms | 44 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 2 | Meeca | But how will I know it's happy? | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Grandma | When it opens. Until then, you bring a chair, and you sit with it, an… | cut | 430 ms | 44 ms | slowPush 1.50→1.71 10.1s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 4 | Narrator | Young Pokey, all elbows, was watering the wrong plant, very carefully. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 5 | Pokey | I think I watered the fern. | cut | 180 ms | 46 ms | slowPush 1.35→1.54 6.0s | -0.5 st, -1.5 dB | keep |  |
| 6 | Meeca | You watered the fern, the snail, and my sandal. | cut | 180 ms | 37 ms | slowPush 1.35→1.54 6.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Grandma | Thank you for watering it anyway, Pokey. The fern never gets any. Tha… | cut | 180 ms | 44 ms | slowPush 1.35→1.54 10.1s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 8 | Pokey | It's Monday. | cut | 630 ms | 40 ms | single 1.51→1.58 3.0s | own | keep | a short line after a long one: give it room |
| 9 | Grandma | You're staying for supper, Pokey. You always are. | cut | 180 ms | 44 ms | slowPush 1.35→1.54 6.2s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 10 | Narrator | The frond unrolled another inch while they argued about the sandal. | cut | 180 ms | 35 ms | drift 1.18→1.21 10.0s | -0.5 st, -1.5 dB | keep |  |

## Memory: Tea with the Queen (`memory-tea`, 20 pictures)

**What's flat**

- Every one of the 20 pictures dips in from black today; directed, 19 become cuts inside one setup.
- 19 of 20 pictures have only the shared 4% push (1 have a camera move of their own).
- 3 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Tarantula Queen didn't bow. She laid out four cups, a plate of sm… (2 pages) | dip | 450 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 1 | Tarantula Queen | Sit. I know you're in a hurry. Sit anyway. I haven't poured for anyon… | cut | 180 ms | 33 ms | single 1.68→1.75 6.5s | +0.5 st, 0 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Dot | Pokey, it's a trap. | cut | 630 ms | 22 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 3 | Pokey | It's a tea. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep |  |
| 4 | Dot | It's a trap with cookies, which is the worst kind. I'm not drinking a… | cut | 180 ms | 22 ms | single 1.68→1.75 4.6s | +0.5 st, 0 dB | keep |  |
| 5 | Narrator | Pokey drank the whole cup, down to the leaves. The Queen watched ever… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 6 | Dot | Sip. Don't gulp. She's watching you gulp. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 7 | Tarantula Queen | You'll forgive an old queen for asking. It's a long road, and the Hig… | cut | 180 ms | 38 ms | slowPush 1.50→1.71 8.3s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 8 | Pokey | Because she waited for me once. | cut | 430 ms | 46 ms | slowPush 1.20→1.37 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 9 | Tarantula Queen | Ah. | cut | 180 ms | 38 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 10 | Tarantula Queen | Mind that chair. I dust it every morning. He always put his feet up o… (2 pages) | cut | 180 ms | 38 ms | slowPush 1.50→1.71 11.0s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 11 | Pokey | Who sat there? | cut | 630 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 12 | Tarantula Queen | Iron-Claw. Before he was anyone's General. Then came the storm. His w… (3 pages) | cut | 1080 ms | 33 ms | reveal 1.74→1.46 2.4s | own | keep | a beat before the reveal; an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 13 | Tarantula Queen | We said yes. All but one of us. That's all the Pact is. I poured him… | cut | 180 ms | 33 ms | push 1.46→1.53 7.1s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 14 | Tarantula Queen | Her flower puts our thorns to sleep, darling. The morning it opened,… | cut | 180 ms | 33 ms | push 1.53→1.60 5.3s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 15 | Pokey | In a storm. | cut | 630 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 16 | Narrator | Pokey held the cup until it went cold. | cut | 680 ms | 35 ms | drift 1.24→1.26 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 17 | Tarantula Queen | Have another cake, darling. | cut | 180 ms | 38 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 18 | Narrator | Dot had been quiet the whole time. Her wing rested on the little pouc… | cut | 180 ms | 35 ms | drift 1.65→1.68 10.0s | -1 st, -3 dB | keep |  |
| 19 | Narrator | When Pokey stood to leave, the cup at the head of the table was still… | cut | 180 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |

## Memory: The Sealed Note (`memory-sealed`, 13 pictures)

**What's flat**

- Every one of the 13 pictures dips in from black today; directed, 10 become cuts inside one setup.
- 12 of 13 pictures have only the shared 4% push (1 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Past the Reaver's water, the ground went up in steps of root, and Pok… | dip | 450 ms | 35 ms | authored move | -1 st, -3 dB | keep |  |
| 1 | Narrator | He'd been walking for months. Under the satchel strap, his fur had wo… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 2 | Narrator | A snail overtook him on the left. Pokey tipped his head to it. It did… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 3 | Pokey | I'm tired. | cut | 630 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 4 | Narrator | Flicker had gone ahead to light the next root. He said it again anywa… | cut | 680 ms | 35 ms | drift 1.24→1.26 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 5 | Narrator | The petal on his wrist kept pointing north. He turned his wrist over… | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 6 | Narrator | Then he sat down on a root and didn't look at the next one. | cut | 1330 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | a beat before the heartbreak; hush: let it be quiet first |
| 7 | Narrator | He took the sealed note out of the satchel. The last word of every li… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 8 | Meeca | Pokey. If you're reading this, you've stopped. Good. Take the satchel… | soft | 320 ms | 37 ms | slowPush 1.50→1.71 9.2s | -0.5 st, -1.5 dB | keep |  |
| 9 | Meeca | I'm not going to tell you to hurry. This is what I sing to the Heartb… | soft | 320 ms | 37 ms | slowPush 1.50→1.71 7.6s | -0.5 st, -1.5 dB | keep |  |
| 10 | Meeca | ♪ Slow the rain, slow the thunder. Slow the thorn that holds you unde… | cut | 1200 ms | 63 ms | slowPush 1.50→1.71 11.0s | silent (sung) | swell | the lullaby: sung slowly, the music carries it, no babble |
| 11 | Meeca | That's the whole spell. I know it isn't much. I'm not counting, Pokey… | cut | 180 ms | 37 ms | slowPush 1.50→1.71 7.7s | -0.5 st, -1.5 dB | keep |  |
| 12 | Narrator | Pokey read it three times. He put it back in the satchel, took the sa… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |

## Memory: The Singing Storm (`memory-storm`, 15 pictures)

**What's flat**

- Every one of the 15 pictures dips in from black today; directed, 11 become cuts inside one setup.
- 15 of 15 pictures have only the shared 4% push (0 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | A storm, in the old nest. Pokey was small, and the nest was bigger th… | dip | 450 ms | 30 ms | drift 1.34→1.37 10.0s | -0.5 st, -1 dB | keep |  |
| 1 | Pokey | It's only weather. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep |  |
| 2 | Meeca | You're holding the nest with both hands. | cut | 180 ms | 32 ms | single 1.68→1.75 3.1s | -0.5 st, -1 dB | keep |  |
| 3 | Pokey | It's a very good nest. I want it to stay. | cut | 180 ms | 40 ms | single 1.68→1.75 3.7s | -0.5 st, -1 dB | keep |  |
| 4 | Narrator | It had been his parents' nest. He remembered a few small things about… (2 pages) | soft | 320 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 5 | Narrator | On a night like this one they'd gone out along the far branches, and… (3 pages) | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | keep |  |
| 6 | Meeca | Can I sit? | soft | 770 ms | 37 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 7 | Pokey | It's small. | cut | 430 ms | 46 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | an answer: a thinking beat |
| 8 | Meeca | I'm small. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 9 | Narrator | She put one hand over both of his on the rim of the nest. She didn't… | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 10 | Meeca | ♪ Slow the rain... slow the thunder... ♪ | soft | 1200 ms | 63 ms | slowPush 1.50→1.71 8.2s | silent (sung) | swell | the lullaby: sung slowly, the music carries it, no babble |
| 11 | Narrator | The thunder kept coming. After a while, he could hear her over it. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 12 | Pokey | Who taught you that? | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 13 | Meeca | Grandma. It was her song first. She has a music box that plays it, wi… | cut | 430 ms | 37 ms | slowPush 1.35→1.54 9.3s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 14 | Narrator | Down in the house, the music box ran down. She went on without it, an… | cut | 180 ms | 30 ms | drift 1.18→1.21 10.0s | own | keep |  |

## Memory: The Tally (`memory-tally`, 15 pictures)

**What's flat**

- Every one of the 15 pictures dips in from black today; directed, 14 become cuts inside one setup.
- 13 of 15 pictures have only the shared 4% push (2 have a camera move of their own).
- 3 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | There were a hundred and twelve marks on the wall behind the bed, in… (2 pages) | dip | 450 ms | 35 ms | authored move | -1 st, -3 dB | keep |  |
| 1 | Narrator | Her handwriting was very steady. It always was when she lied. | cut | 680 ms | 35 ms | drift 1.54→1.58 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 2 | Meeca | Dear Pokey. Don't hurry. I'm not counting. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Narrator | There was no way to send it now. She wrote it anyway. | cut | 680 ms | 35 ms | drift 1.54→1.58 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 4 | Lieutenant Pell | Miss Meeca? It is Lieutenant Pell. I am knocking. I am sorry about th… | cut | 1330 ms | 31 ms | slowPush 1.00→1.14 8.0s | -1 st, -3 dB | under | a beat before the door; hush: let it be quiet first |
| 5 | Meeca | You don't have to knock, Pell. You're the one with the key. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.2s | -0.5 st, -1.5 dB | keep |  |
| 6 | Lieutenant Pell | It is the General's key, Miss. I only carry it. I have brought a pill… | cut | 180 ms | 31 ms | slowPush 1.50→1.71 7.7s | -0.5 st, -1.5 dB | keep |  |
| 7 | Meeca | Thank you. It looks soft. Why am I here, Pell? | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 8 | Lieutenant Pell | For your safety, Miss. He says so every morning. I think he says it t… | cut | 430 ms | 31 ms | slowPush 1.50→1.71 7.2s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat |
| 9 | Meeca | Who told him to call me that? Little bloom. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 10 | Narrator | Pell looked at the pillow for a while. | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 11 | Lieutenant Pell | I could not say, Miss. I am sorry that I could not say. And if there… (2 pages) | cut | 180 ms | 31 ms | slowPush 1.50→1.71 9.1s | -1 st, -3 dB | keep |  |
| 12 | Meeca | It isn't finished. | cut | 630 ms | 37 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 13 | Narrator | Pell closed the door softly and turned the key softly. Somebody had t… | cut | 180 ms | 35 ms | drift 1.24→1.26 10.0s | -1 st, -3 dB | keep |  |
| 14 | Narrator | Meeca finished the letter and put it under the new pillow. Then she p… (2 pages) | cut | 680 ms | 35 ms | authored move | -1 st, -3 dB | under | hush: let it be quiet first |

## Memory: The Photograph (`memory-photograph`, 10 pictures)

**What's flat**

- Every one of the 10 pictures dips in from black today; directed, 8 become cuts inside one setup.
- 8 of 10 pictures have only the shared 4% push (2 have a camera move of their own).
- 1 line is over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Behind the broken rune there was a hollow in the stone. Inside it, wr… | dip | 450 ms | 30 ms | drift 1.44→1.47 10.0s | own | keep |  |
| 1 | Pokey | A baby. And whoever's holding her. I know him. I stood at his door on… | cut | 180 ms | 40 ms | single 1.68→1.75 5.2s | own | keep |  |
| 2 | Narrator | He turned it over. There was pencil on the back, in a hand he'd seen… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 3 | Pokey | Grandpa. | cut | 1280 ms | 46 ms | reveal 1.39→1.16 2.4s | -1 st, -3 dB | keep | a beat before the reveal; a short line after a long one: give it room |
| 4 | Narrator | Before the cape and the club and the red eyes, General Iron-Claw had… | cut | 180 ms | 30 ms | drift 1.24→1.26 10.0s | own | keep |  |
| 5 | Narrator | Pokey sat down on the stone. He took hold of the satchel strap and di… | cut | 180 ms | 35 ms | drift 1.39→1.42 10.0s | -1 st, -3 dB | keep |  |
| 6 | Pokey | She thinks he walked out on her. | cut | 180 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | keep |  |
| 7 | Pokey | He came and took her himself. | cut | 680 ms | 46 ms | slowPush 1.20→1.37 6.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 8 | Narrator | Pokey sat in the ruins until the last of the light was gone. Then he… (2 pages) | soft | 320 ms | 30 ms | authored move | own | keep |  |
| 9 | Narrator | The petal on his wrist turned north and held there. He got up. | cut | 180 ms | 30 ms | authored move | own | keep |  |

## Memory: The Promise (`memory-promise`, 8 pictures)

**What's flat**

- Every one of the 8 pictures dips in from black today; directed, 7 become cuts inside one setup.
- 7 of 8 pictures have only the shared 4% push (1 have a camera move of their own).
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Pokey dreamed of the old nest, and the stars over it. | dip | 450 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 1 | Meeca | Hold out your wrist. I'm tying a petal on it. It's off the Heartbloom… | cut | 180 ms | 37 ms | slowPush 1.50→1.71 7.6s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Pokey | A petal will wilt. | cut | 630 ms | 46 ms | slowPush 1.35→1.54 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 3 | Meeca | Not this one. Grandma says it lasts exactly as long as somebody is th… | cut | 180 ms | 37 ms | slowPush 1.00→1.14 8.0s | -0.5 st, -1.5 dB | keep |  |
| 4 | Pokey | Then it'll last. | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 5 | Meeca | Keep it on. Even if I go somewhere you can't follow. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 6 | Pokey | Especially then. | cut | 180 ms | 40 ms | single 1.68→1.75 3.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 7 | Narrator | In the dream, the petal began to glow. It pointed out of the dark, an… | cut | 180 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |

## Memory: The Lieutenant (`memory-seam`, 15 pictures)

**What's flat**

- Every one of the 15 pictures dips in from black today; directed, 14 become cuts inside one setup.
- 14 of 15 pictures have only the shared 4% push (1 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The Monarch was gone, and the fireflies came back one at a time. In t… (2 pages) | dip | 450 ms | 30 ms | authored move | +0.5 st, 0 dB | keep |  |
| 1 | Lieutenant Pell | I am so sorry, but would you mind not looking at me? | cut | 180 ms | 27 ms | single 1.68→1.75 3.3s | +0.5 st, 0 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Dot | Soldier! Pokey, there's a soldier! I'll distract him. I'm extremely d… | cut | 430 ms | 22 ms | single 1.68→1.75 5.1s | +0.5 st, 0 dB | keep | an answer: a thinking beat |
| 3 | Lieutenant Pell | I am so sorry, but please do not scream. Everyone screams. I am Lieut… | cut | 180 ms | 27 ms | single 1.68→1.75 5.4s | +0.5 st, 0 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | Is she okay? | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 5 | Lieutenant Pell | She is very polite to me. I do not deserve it. I am sorry. Yes. | cut | 430 ms | 31 ms | slowPush 1.50→1.71 6.6s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 6 | Lieutenant Pell | I am not supposed to be here. I have come to tell you two things, and… | cut | 180 ms | 31 ms | slowPush 1.50→1.71 7.8s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 7 | Lieutenant Pell | The first. The General has asked the cook for the soup Miss Meeca lik… | cut | 180 ms | 31 ms | slowPush 1.50→1.71 8.8s | -1 st, -3 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 8 | Lieutenant Pell | The second. There is a seam in the net behind the cookhouse. The bird… (2 pages) | cut | 180 ms | 31 ms | slowPush 1.50→1.71 10.3s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 9 | Lieutenant Pell | If I am ordered to sew it shut, I shall do it badly. I was a tailor's… | cut | 180 ms | 31 ms | slowPush 1.50→1.71 8.9s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 10 | Dot | On purpose? Do you know what that seam did to me? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 11 | Lieutenant Pell | I am so sorry about the seam. | cut | 430 ms | 31 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 12 | Pokey | Thanks, Lieutenant. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 13 | Lieutenant Pell | Oh, I am sorry. Please do not thank me. It is embarrassing. | cut | 180 ms | 31 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 14 | Narrator | The lantern bobbed away into the dark. From somewhere down the slope,… | cut | 180 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |

## Memory: The Blessing (`memory-blessing`, 10 pictures)

**What's flat**

- Every one of the 10 pictures dips in from black today; directed, 8 become cuts inside one setup.
- 10 of 10 pictures have only the shared 4% push (0 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | Ten years ago, a few weeks before the storm, Pokey knocked on a door. | dip | 450 ms | 30 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 1 | Grandma | Don't loom in the doorway, dear. Come in. Sit. He doesn't bite. Often. | cut | 180 ms | 38 ms | single 1.51→1.58 5.2s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 2 | Pokey | Sir, I'd like your blessing. I'd like to walk beside Meeca for as lon… | cut | 180 ms | 40 ms | single 1.68→1.75 5.6s | own | keep |  |
| 3 | Grandfather | Boy. It took you fourteen minutes to come up my path. I timed it. | cut | 180 ms | 36 ms | single 1.68→1.75 4.5s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 4 | Pokey | Yes, sir. I stopped to look at your fern. | cut | 180 ms | 40 ms | single 1.74→1.81 3.7s | own | keep |  |
| 5 | Narrator | The old soldier looked at him for a long time. The kettle in the next… (2 pages) | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 6 | Grandfather | Come back when you can protect her. | cut | 180 ms | 36 ms | single 1.68→1.75 3.1s | -0.5 st, -1 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 7 | Pokey | I will. Slowly. | cut | 180 ms | 40 ms | single 1.74→1.81 3.0s | own | keep |  |
| 8 | Narrator | Pokey went down the path with one hand on his satchel strap. The kett… | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -1 st, -3 dB | keep |  |
| 9 | Narrator | Then the storm came, and took Meeca's grandma. For a year after, the… (2 pages) | soft | 1470 ms | 35 ms | drift 1.29→1.31 10.0s | -1 st, -3 dB | under | a beat before the darkness; hush: let it be quiet first |

## Memory: The Open Gates (`memory-gates`, 31 pictures)

**What's flat**

- Every one of the 31 pictures dips in from black today; directed, 29 become cuts inside one setup.
- 29 of 31 pictures have only the shared 4% push (2 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The night before the mountain, Pokey fell asleep against a warm rock… (2 pages) | dip | 450 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |
| 1 | Dot | You can turn that off, you know, I don't need it, I can see fine, I c… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.1s | -0.5 st, -1.5 dB | keep |  |
| 2 | Flicker | You flew into a rock an hour ago. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 3 | Dot | I was checking the rock. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 4 | Flicker | She got out, you know. Meeca. In the orchids. She was nearly all the… | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.5s | -1 st, -3 dB | keep |  |
| 5 | Dot | I saw the carvings. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 6 | Flicker | She didn't know the way, so I lit it for her. Every tree. I was the o… | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.9s | -1 st, -3 dB | keep |  |
| 7 | Flicker | They followed my light. | cut | 1130 ms | 28 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | under | hush: let it be quiet first; a short line after a long one: give it room |
| 8 | Narrator | Dot didn't say anything for a while. | cut | 680 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 9 | Dot | How far did she get? | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 10 | Flicker | One more tree. | cut | 430 ms | 28 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | an answer: a thinking beat |
| 11 | Dot | And now you go over it. Every night. Which tree. What if you'd been s… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.4s | -1 st, -3 dB | keep |  |
| 12 | Flicker | How do you know that? | cut | 630 ms | 28 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 13 | Narrator | Dot's wing went to the pouch at her side. She looked at Pokey, asleep… | cut | 680 ms | 35 ms | drift 1.49→1.52 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 14 | Dot | Lucky guess. | cut | 630 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep | a short line after a long one: give it room |
| 15 | Dot | Tomorrow, at the bottom of the mountain, I might say something to him… | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.6s | -1 st, -3 dB | keep |  |
| 16 | Flicker | I won't. | cut | 630 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 17 | Narrator | She sat down on the stone next to him. She didn't take up much room.… | cut | 180 ms | 35 ms | drift 1.54→1.58 10.0s | -0.5 st, -1.5 dB | keep |  |
| 18 | Narrator | The lava road ended where the mountain began. Above him, the fortress… | dip | 450 ms | 30 ms | authored move | -0.5 st, -1 dB | keep |  |
| 19 | Dot | Pokey. Pokey! The front door is open. The big one, up there. Wide ope… (2 pages) | cut | 180 ms | 22 ms | single 1.68→1.75 6.9s | -0.5 st, -1 dB | keep |  |
| 20 | Pokey | Is that bad? | cut | 630 ms | 40 ms | single 1.68→1.75 3.0s | -0.5 st, -1 dB | keep | a short line after a long one: give it room |
| 21 | Dot | Pokey. The last thing that was this nice to us had a doily. | cut | 430 ms | 22 ms | single 1.68→1.75 3.6s | -0.5 st, -1 dB | keep | an answer: a thinking beat |
| 22 | Narrator | Two soldiers stood at the foot of the steps, the same two from the ga… | cut | 180 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 23 | Soldier | Is that a hummingbird? | cut | 630 ms | 30 ms | single 1.51→1.58 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 24 | Soldier | Where? | cut | 180 ms | 30 ms | push 1.58→1.65 3.0s | +0.5 st, 0 dB | keep |  |
| 25 | Narrator | Dot was already behind Pokey's ear. | cut | 180 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 26 | Narrator | Along the great wall, one by one, the guardians took their places. Th… | cut | 180 ms | 30 ms | drift 1.03→1.05 10.0s | -0.5 st, -1 dB | keep |  |
| 27 | Narrator | Above them, the great gates of the Highland Fortress groaned on their… | cut | 830 ms | 26 ms | drift 1.03→1.05 10.0s | 0 st, +1 dB | keep | a beat before the door |
| 28 | General Iron-Claw | Come up, sloth. The General has counted every step you took. There ar… | cut | 180 ms | 31 ms | single 1.12→1.17 6.9s | 0 st, +1 dB | keep |  |
| 29 | Dot | He counted your steps, Pokey. That's... I don't know what that is. Th… | cut | 180 ms | 22 ms | single 1.12→1.17 5.4s | +0.5 st, 0 dB | keep |  |
| 30 | Narrator | Pokey looked up the thousand steps. Then he looked at the petal on hi… | cut | 830 ms | 30 ms | reveal 1.16→0.97 2.4s | own | keep | a beat before the cliffhanger |

## Memory: The Door (`memory-door`, 9 pictures)

**What's flat**

- Every one of the 9 pictures dips in from black today; directed, 7 become cuts inside one setup.
- 7 of 9 pictures have only the shared 4% push (2 have a camera move of their own).
- 2 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The soup was the fifth try, and it had been hot when he left the kitc… | dip | 950 ms | 35 ms | authored move | -1 st, -3 dB | under | hush: let it be quiet first |
| 1 | Narrator | Her door was oak, banded in iron, with a peephole at the height of a… (2 pages) | soft | 320 ms | 30 ms | drift 1.18→1.21 10.0s | -0.5 st, -1 dB | keep |  |
| 2 | General Iron-Claw | One. | cut | 1000 ms | 36 ms | push 1.21→1.27 3.0s | -0.5 st, -1 dB | under | the count over almost nothing |
| 3 | Narrator | His paw came up as far as the wood and stayed there. | cut | 180 ms | 30 ms | drift 1.39→1.42 10.0s | -0.5 st, -1 dB | keep |  |
| 4 | General Iron-Claw | Two. | cut | 900 ms | 36 ms | push 1.42→1.49 3.0s | -0.5 st, -1 dB | under | the count |
| 5 | Meeca | ♪ Slow the rain, slow the thunder. Slow the thorn that holds you unde… | cut | 1200 ms | 63 ms | drift 1.39→1.42 10.0s | silent (sung) | swell | the lullaby: sung slowly, the music carries it, no babble |
| 6 | Narrator | His wife had hummed it over the kettle for forty years, always a litt… | cut | 180 ms | 35 ms | drift 1.39→1.42 10.0s | -1 st, -3 dB | keep |  |
| 7 | Narrator | He didn't say three. | cut | 1130 ms | 35 ms | drift 1.39→1.42 10.0s | -1 st, -3 dB | under | hush: let it be quiet first; a short line after a long one: give it room |
| 8 | Narrator | He set the bowl on the stool and moved it an inch, so it sat square t… (2 pages) | cut | 180 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |

## Ending (finale) (`ending`, 124 pictures)

**What's flat**

- Every one of the 124 pictures dips in from black today; directed, 106 become cuts inside one setup.
- 121 of 124 pictures have only the shared 4% push (3 have a camera move of their own).
- 14 lines are over 150 letters, a wall of text on an upright phone: split into pages.
- No line has a beat before it: the words start the moment the picture lands.

**Direction**

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

| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Narrator | The General lay in the rubble in the middle of the courtyard. The thu… | dip | 900 ms | 35 ms | authored move | -1 st, -3 dB | silence | after the fight: only the storm |
| 1 | Narrator | Pokey had hold of the nearest wall with both hands. He always held so… | cut | 500 ms | 35 ms | drift 1.39→1.42 10.0s | -1 st, -3 dB | silence | his fear of thunder, back |
| 2 | Narrator | He let go with one hand. | cut | 1300 ms | 35 ms | slowPush 1.45→1.65 6.0s | -0.5 st, -1.5 dB | silence | the peak of the game: slow, silent |
| 3 | Narrator | He held it out across the wet stones. Thunder broke over the wall, an… | cut | 600 ms | 35 ms | drift 1.60→1.63 10.0s | -0.5 st, -1.5 dB | under | the first note comes back under the held-out hand |
| 4 | Narrator | The General looked at the hand. From the lit window high in the tower… | cut | 900 ms | 35 ms | authored move | -0.5 st, -1.5 dB | under | then the song |
| 5 | Meeca | ♪ Slow the rain, slow the thunder. Slow the thorn that holds you unde… | cut | 1200 ms | 63 ms | slowPush 1.60→1.82 11.0s | silent (sung) | swell | the lullaby: sung slowly, the music carries it, no babble |
| 6 | Narrator | Along the walls, the iron thorns of the Pact went still. The guardian… | soft | 320 ms | 35 ms | authored move | -0.5 st, -1.5 dB | keep |  |
| 7 | Venom Fang | Sso. That's the song. | cut | 630 ms | 39 ms | slowPush 2.40→2.60 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 8 | Crocus Rex | Everyone look. I kept the crown. | cut | 180 ms | 41 ms | slowPush 2.40→2.60 6.0s | -0.5 st, -1.5 dB | keep |  |
| 9 | Shadow Prowler | Again, keeper. The thorn line. | cut | 180 ms | 36 ms | single 2.60→2.60 3.1s | own | keep |  |
| 10 | Tarantula Queen | Tea is at four, dears. Everyone is invited. Even you, General. | cut | 180 ms | 38 ms | slowPush 2.40→2.60 6.5s | -0.5 st, -1.5 dB | keep |  |
| 11 | Stone Idol Golem | I have waited a thousand years for— | cut | 180 ms | 51 ms | slowPush 2.40→2.60 6.0s | -0.5 st, -1.5 dB | keep |  |
| 12 | Night-Wing Monarch | Once more, please. I slept through the middle. | cut | 180 ms | 36 ms | single 2.60→2.60 3.7s | own | keep |  |
| 13 | Narrator | Far away, down in his hollow, the old tree Thornbark lifted his branc… | soft | 320 ms | 35 ms | drift 1.34→1.37 10.0s | own | keep |  |
| 14 | Narrator | The iron collars cracked and fell. They rang on the stones, and kept… | cut | 180 ms | 35 ms | drift 1.13→1.16 10.0s | own | keep |  |
| 15 | Narrator | In the courtyard, the General got to his feet. He did it slowly and w… | soft | 320 ms | 35 ms | drift 1.08→1.10 10.0s | -0.5 st, -1.5 dB | keep |  |
| 16 | Narrator | Up in the window, Meeca began the verse again. The red in his eyes we… | cut | 180 ms | 35 ms | drift 1.13→1.16 10.0s | -0.5 st, -1.5 dB | keep |  |
| 17 | Narrator | The club went first. Then the cape, and the spikes on his shoulder. N… (2 pages) | cut | 180 ms | 35 ms | drift 1.18→1.21 10.0s | -0.5 st, -1.5 dB | keep |  |
| 18 | Lieutenant Pell | The door is open, Miss. I am sorry it was ever shut. | cut | 180 ms | 31 ms | slowPush 1.00→1.14 6.0s | -1 st, -3 dB | keep |  |
| 19 | Narrator | Meeca came down the steps and stopped ten paces away. Her back was ve… | cut | 700 ms | 35 ms | still 1.15→1.17 12.0s | -1 st, -3 dB | silence | ten paces of nothing |
| 20 | Meeca | Hello, Grandpa. | cut | 1300 ms | 37 ms | slowPush 1.35→1.54 6.0s | -1 st, -3 dB | keep | two words, a long time coming |
| 21 | Grandfather | Little bloom. | cut | 900 ms | 41 ms | slowPush 1.15→1.31 6.0s | -0.5 st, -1.5 dB | keep | he tries |
| 22 | Meeca | No. You don't get to say that yet. | cut | 250 ms | 32 ms | single 1.46→1.52 3.2s | -0.5 st, -1 dB | keep | she cuts him off |
| 23 | Meeca | You left. You sat in her chair for a whole year, and I kept the kettl… (3 pages) | cut | 180 ms | 37 ms | slowPush 1.30→1.48 11.0s | -1 st, -3 dB | keep |  |
| 24 | Meeca | Then you put me in a room with a lock and sent me soup. I ate all of… (2 pages) | cut | 180 ms | 37 ms | slowPush 1.30→1.48 11.0s | -1 st, -3 dB | keep |  |
| 25 | Meeca | And every night, somebody stood outside my door and never knocked. El… | cut | 830 ms | 32 ms | push 1.48→1.56 7.3s | -0.5 st, -1 dB | keep | a beat before the heartbreak |
| 26 | Narrator | The General looked down at his empty hands. He had held a club in the… | cut | 900 ms | 35 ms | drift 1.34→1.37 10.0s | -1 st, -3 dB | under | hold on the hands |
| 27 | Grandfather | She waited for help, and it came late. So I put you somewhere nobody… | cut | 700 ms | 41 ms | slowPush 1.35→1.54 8.5s | -1 st, -3 dB | keep | the truth, at last, slow in |
| 28 | Grandfather | I should have knocked. | cut | 1500 ms | 41 ms | still 1.45→1.47 12.0s | -1 st, -3 dB | silence | the line the whole story answers: nothing under it |
| 29 | Narrator | Meeca didn't say it was all right. She crossed the stones and took hi… | cut | 800 ms | 35 ms | drift 1.54→1.58 10.0s | -0.5 st, -1.5 dB | under | the music finds its way back as she takes his hand |
| 30 | Grandfather | One. Two. | cut | 630 ms | 41 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 31 | Meeca | Grandpa. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 32 | Grandfather | I have lost count. | cut | 1000 ms | 41 ms | slowPush 1.50→1.71 6.0s | own | swell | the mercy: the march melting into the lullaby |
| 33 | Grandfather | Boy. | cut | 180 ms | 36 ms | push 1.71→1.40 3.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 34 | Pokey | Sir? | cut | 180 ms | 40 ms | single 1.51→1.58 3.0s | own | keep |  |
| 35 | Grandfather | Come back when you can protect her, I said. You protected her from me… | cut | 430 ms | 36 ms | single 1.29→1.35 5.8s | own | keep | an answer: a thinking beat; framed chest-up: lifting the feet clear would cut off the head |
| 36 | Grandfather | You may. Walk. With her. | cut | 630 ms | 41 ms | slowPush 1.15→1.31 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 37 | Grandfather | Sometimes. | cut | 180 ms | 41 ms | slowPush 1.15→1.31 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 38 | Meeca | Grandpa! | cut | 180 ms | 32 ms | single 1.51→1.58 3.0s | own | keep |  |
| 39 | Grandfather | Mostly. | cut | 180 ms | 36 ms | single 1.29→1.35 3.0s | own | keep | framed chest-up: lifting the feet clear would cut off the head |
| 40 | Narrator | Meeca turned around. Pokey was standing where he'd stopped, soaked, i… | cut | 900 ms | 35 ms | reveal 1.51→1.26 2.4s | -1 st, -3 dB | silence | pull back: him, alone, soaked |
| 41 | Meeca | You came. | cut | 1300 ms | 37 ms | slowPush 1.40→1.60 6.0s | -0.5 st, -1.5 dB | under | the reunion: two words |
| 42 | Pokey | I was in the neighborhood. Slowly. | cut | 900 ms | 46 ms | slowPush 1.50→1.71 6.3s | -0.5 st, -1.5 dB | keep | his joke, after a breath |
| 43 | Narrator | She laughed. Then her back stopped being straight. | cut | 500 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | swell | the swell: the reunion lands here |
| 44 | Pokey | You can sit down now. | cut | 800 ms | 46 ms | slowPush 1.35→1.54 6.0s | -0.5 st, -1.5 dB | keep | the kindest line in the game |
| 45 | Narrator | They sat on the wet steps. Neither of them said much. It was the best… | soft | 320 ms | 35 ms | drift 1.24→1.26 10.0s | -0.5 st, -1.5 dB | swell | her theme, full |
| 46 | Meeca | There you are. I wondered where my light went. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 47 | Flicker | I'm sorry. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 48 | Meeca | You got me a whole night out. Come here. | cut | 180 ms | 37 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 49 | Narrator | The sun was just coming up over the wall when a small, white, very du… (2 pages) | dip | 450 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 50 | Dot | Hello! Everybody stay calm. I'm alive! I fell into the cookhouse. Int… | cut | 180 ms | 22 ms | single 1.51→1.58 4.7s | +0.5 st, 0 dB | keep |  |
| 51 | Lieutenant Pell | She has been no trouble at all, Miss. Sir. Everyone. I apologize. | cut | 180 ms | 27 ms | drift 1.03→1.05 10.0s | +0.5 st, 0 dB | keep |  |
| 52 | Pokey | Dot! | cut | 180 ms | 40 ms | single 1.51→1.58 3.0s | own | keep |  |
| 53 | Dot | I'm so sorry I'm late! I know. I know. The seam was tiny, and I went… (3 pages) | cut | 180 ms | 22 ms | single 1.51→1.58 7.8s | own | keep |  |
| 54 | Pokey | Seems to me it's still morning. | cut | 180 ms | 46 ms | slowPush 1.35→1.54 6.0s | -0.5 st, -1.5 dB | keep |  |
| 55 | Narrator | Dot stopped. Then she took the pouch off her side and held it out in… | cut | 180 ms | 35 ms | drift 1.54→1.58 10.0s | -1 st, -3 dB | keep |  |
| 56 | Dot | General. I have something I should have given you a long time ago. | cut | 180 ms | 25 ms | slowPush 1.35→1.54 6.0s | -1 st, -3 dB | keep |  |
| 57 | Narrator | It was a letter, yellow at the edges, sealed with one faded petal. | cut | 180 ms | 35 ms | drift 1.18→1.21 10.0s | -0.5 st, -1.5 dB | keep |  |
| 58 | Dot | She gave it to me the night she died, in the storm. "Give him this wh… (3 pages) | cut | 180 ms | 25 ms | slowPush 1.35→1.54 11.0s | -1 st, -3 dB | keep |  |
| 59 | Grandfather | Give it here, little courier. | cut | 180 ms | 41 ms | slowPush 1.15→1.31 6.0s | -0.5 st, -1.5 dB | keep | framed chest-up: lifting the feet clear would cut off the head |
| 60 | Grandma | My dearest. If you're reading this, you're sitting down, which means… (2 pages) | soft | 320 ms | 44 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 61 | Grandma | It isn't anybody's fault, my love. It was only weather. Don't build a… (2 pages) | cut | 180 ms | 44 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 62 | Dot | She always had the kettle on when I got there. Every time. However la… | soft | 320 ms | 25 ms | slowPush 1.50→1.71 7.2s | -1 st, -3 dB | keep |  |
| 63 | Grandfather | Courier. Sit. | soft | 770 ms | 41 ms | slowPush 1.15→1.31 6.0s | own | keep | a short line after a long one: give it room; framed chest-up: lifting the feet clear would cut off the head |
| 64 | Narrator | Pokey stood very still. After a while, Dot landed on his head. | cut | 180 ms | 35 ms | drift 1.34→1.37 10.0s | -0.5 st, -1.5 dB | keep |  |
| 65 | Pokey | I thought you came around because you liked me. | cut | 180 ms | 46 ms | slowPush 1.30→1.48 6.0s | -0.5 st, -1.5 dB | keep |  |
| 66 | Dot | I did! I do! It was both. I came because I owed you, and I stayed bec… (2 pages) | cut | 180 ms | 25 ms | slowPush 1.50→1.71 9.8s | -1 st, -3 dB | keep |  |
| 67 | Pokey | You were late every time, you know. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 68 | Dot | I know. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -1 st, -3 dB | keep |  |
| 69 | Pokey | And you came back every time. I was counting. | cut | 180 ms | 46 ms | slowPush 1.50→1.71 6.1s | -0.5 st, -1.5 dB | keep |  |
| 70 | Narrator | Dot's wing went to the pouch at her side, which was empty, and she le… | cut | 680 ms | 35 ms | drift 1.65→1.68 10.0s | -1 st, -3 dB | under | hush: let it be quiet first |
| 71 | Narrator | Down at the Sunlit Riverbank, Gruntlewick the crier reached the end o… (3 pages) | dip | 450 ms | 30 ms | drift 1.13→1.16 10.0s | +0.5 st, 0 dB | keep |  |
| 72 | Narrator | In the ruins, the Stone Idol Golem finally finished his sentence. "..… | soft | 320 ms | 35 ms | drift 1.13→1.16 10.0s | -0.5 st, -1.5 dB | keep |  |
| 73 | Narrator | Lieutenant Pell left the army that week and opened a tailor's shop at… (2 pages) | soft | 320 ms | 30 ms | drift 1.34→1.37 10.0s | +0.5 st, 0 dB | keep |  |
| 74 | Flicker | I'm staying, if that's all right. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 75 | Dot | He's all right. Don't tell him. | cut | 180 ms | 25 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 76 | Flicker | I'm right here. | cut | 180 ms | 28 ms | slowPush 1.50→1.71 6.0s | -0.5 st, -1.5 dB | keep |  |
| 77 | Narrator | On the first cold morning, Pokey walked the lava road with a pot of t… | soft | 320 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 78 | Narrator | The Drake had tidied. Everything he owned was in one corner of the ca… | soft | 320 ms | 30 ms | drift 1.15→1.18 10.0s | +0.5 st, 0 dB | keep |  |
| 79 | Magma Drake | You came. | cut | 630 ms | 34 ms | single 1.25→1.31 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 80 | Pokey | You asked. | cut | 180 ms | 40 ms | single 1.25→1.31 3.0s | +0.5 st, 0 dB | keep |  |
| 81 | Magma Drake | There is nothing behind the rock. | cut | 180 ms | 34 ms | single 1.25→1.31 3.0s | +0.5 st, 0 dB | keep |  |
| 82 | Dot | There's a sock behind the rock, I can see it from here, it's an enorm… | cut | 180 ms | 22 ms | single 1.25→1.31 5.1s | +0.5 st, 0 dB | keep |  |
| 83 | Magma Drake | It is a tea cosy. I made it. It did not go well. | cut | 180 ms | 34 ms | single 1.25→1.31 3.8s | +0.5 st, 0 dB | keep |  |
| 84 | Narrator | Pokey poured. The Drake held his cup in both claws and looked at it f… | cut | 180 ms | 35 ms | drift 1.26→1.28 10.0s | -0.5 st, -1.5 dB | keep |  |
| 85 | Magma Drake | It is too hot. | cut | 630 ms | 39 ms | slowPush 1.12→1.28 6.0s | -0.5 st, -1.5 dB | keep | a short line after a long one: give it room |
| 86 | Pokey | You breathe fire. | cut | 180 ms | 46 ms | slowPush 1.12→1.28 6.0s | -0.5 st, -1.5 dB | keep |  |
| 87 | Magma Drake | Not any more. A visitor put it out. | cut | 180 ms | 39 ms | slowPush 1.12→1.28 6.0s | -0.5 st, -1.5 dB | keep |  |
| 88 | Narrator | He drank it anyway, and held the cup out, very carefully, for another. | cut | 180 ms | 35 ms | drift 1.15→1.18 10.0s | own | keep |  |
| 89 | Magma Drake | Wednesday? | cut | 180 ms | 39 ms | slowPush 1.12→1.28 6.0s | own | keep |  |
| 90 | Pokey | If you tidy. | cut | 430 ms | 46 ms | slowPush 1.12→1.28 6.0s | own | keep | an answer: a thinking beat |
| 91 | Narrator | The Drake looked at the rock for a while. | cut | 180 ms | 35 ms | drift 1.18→1.21 10.0s | own | keep |  |
| 92 | Narrator | On the first fine afternoon, at four o'clock exactly, the Tarantula Q… (2 pages) | soft | 320 ms | 35 ms | drift 1.18→1.21 10.0s | -0.5 st, -1.5 dB | keep |  |
| 93 | Narrator | He sat down in it, put his feet up, and finished the whole cup. | cut | 900 ms | 35 ms | drift 1.18→1.21 10.0s | own | swell | the chair, at last |
| 94 | Dot | It's a trap with cookies. I've had four. | cut | 300 ms | 25 ms | slowPush 1.35→1.54 6.0s | own | keep | the laugh, fast |
| 95 | Narrator | Meeca had finished the scarf. It went around Pokey four times and sti… | cut | 180 ms | 30 ms | drift 1.18→1.21 10.0s | +0.5 st, 0 dB | keep |  |
| 96 | Meeca | Was it a nice bush? | cut | 630 ms | 32 ms | single 1.51→1.58 3.0s | +0.5 st, 0 dB | keep | a short line after a long one: give it room |
| 97 | Dot | It was the best bush, it was a really excellent bush, I've been back,… | cut | 430 ms | 22 ms | single 1.51→1.58 4.5s | +0.5 st, 0 dB | keep | an answer: a thinking beat |
| 98 | Narrator | She also gave him the letters from under her pillow, all of them, eve… (2 pages) | cut | 180 ms | 35 ms | drift 1.18→1.21 10.0s | -0.5 st, -1.5 dB | keep |  |
| 99 | Narrator | Far off in the east, the last of the storm said something. Pokey was… | cut | 700 ms | 35 ms | drift 1.44→1.47 10.0s | -0.5 st, -1.5 dB | under | a held breath: does he grab? |
| 100 | Lieutenant Pell | Shall I tell the General, sir? | cut | 180 ms | 27 ms | single 1.51→1.58 3.0s | +0.5 st, 0 dB | keep |  |
| 101 | Grandfather | Tell him he has retired. | cut | 700 ms | 36 ms | single 1.29→1.35 3.2s | +0.5 st, 0 dB | keep | the pause before the punchline |
| 102 | Narrator | Pokey stops by on Thursdays. He always asks first. | soft | 320 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 103 | Narrator | He ferries the village across, three at a time. The crown is still cr… | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 104 | Narrator | He still sits on the ledge. Now somebody sits with him. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 105 | Narrator | She lets the wind lane run where it likes. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 106 | Narrator | Tea at four, every day. A guest always stays to the bottom of the cup. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 107 | Narrator | Lunch at noon, on a root by the path. He leaves half. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 108 | Narrator | He talks the slowest at the council now. The others wait. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 109 | Narrator | Pokey told her how the dream ended. She wrote it down. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 110 | Narrator | Two cups. Both used. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 111 | Narrator | Every spring he plants a tree by the river. He takes his time. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 112 | Narrator | Pell took their measurements. They didn't need new coats. They just w… | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 113 | Narrator | They put up a new sign. It says BACK ALREADY? | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 114 | Narrator | He has started a new warning. It is about Tuesday. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 115 | Narrator | His new package says NO HURRY. He is taking it very seriously. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 116 | Narrator | The sign still hangs crooked. The shop is never empty. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 117 | Narrator | He stays at Pell's shop. The light over the counter is steady. | cut | 180 ms | 35 ms | drift 1.29→1.31 10.0s | -0.5 st, -1.5 dB | keep |  |
| 118 | Narrator | That evening, they climbed the hill to the old tree, where Meeca's gr… | dip | 450 ms | 35 ms | drift 1.18→1.21 10.0s | -0.5 st, -1.5 dB | keep |  |
| 119 | Grandfather | Hello, love. I'm late. I brought the whole family. | cut | 1400 ms | 41 ms | slowPush 1.50→1.71 7.5s | -0.5 st, -1.5 dB | silence | at her tree: nothing under it |
| 120 | Narrator | Home was exactly the way they'd left it, except that the Heartbloom w… (2 pages) | dip | 450 ms | 35 ms | drift 1.24→1.26 10.0s | -0.5 st, -1.5 dB | swell | home: the theme comes in full |
| 121 | Pokey | He's gonna make it. He trained for it. | cut | 800 ms | 46 ms | slowPush 1.50→1.71 6.4s | -0.5 st, -1.5 dB | keep | the callback, after a breath |
| 122 | Narrator | Meeca sat down on the garden path beside the snail. After a while, Po… | cut | 900 ms | 30 ms | drift 1.24→1.26 10.0s | own | swell | the last picture: slow, full |
| 123 | Narrator | Dot went to get snacks. She was back before they'd finished sitting d… | cut | 180 ms | 30 ms | drift 1.18→1.21 10.0s | own | keep |  |
