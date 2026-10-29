# Controls, Build 3 (polish report CT-14 to CT-18, CT-21 to CT-26, CT-28)

Build 2's notes are in `README.md`. CT-13, CT-19 and CT-27 wait for Matt, and CT-29 (tilt) comes later.

How each item was handled:
- reproduced headless, fixed, and kept as a regression test in `src/game/controlsB3.test.ts`;
- each test fails on the code before its fix and passes after;
- the replay judges each change against the testers' 30,063 recorded touches, before and after.

The recordings hold no Pad sessions. So the Pad items (CT-17's Pad half, CT-18, CT-25 and CT-26) are proven by tests against the real engine, and in a real browser.

## Replay, Build 2 → Build 3

Full tables: `replay-b3-before.md` and `replay-b3-after.md`.

| | Build 2 | Build 3 |
|---|---|---|
| every clear gesture misread | 2.8% (130/4647) | 2.7% (127/4647) |
| resting thumbs that threw a mega | 47.1% (16/34) | 38.2% (13/34) |
| second jumps that fired off a slow rise | 34.2% (80/234) | 30.5% (67/220) |
| flicks that punched instead | 0 | 8 of 3,758 (CT-17, below) |
| a second thumb's tap: when its punch comes | median 79 ms after it lands | as it lands |
| touches that jumped and also threw a jab | 0 | 40 of 15,497 (0.3%) |

By player, every clear gesture misread:
- Sally went from 9.2% to 8.3%.
- Every other player and grip is unchanged.
- Nobody got worse.

## Item by item

### CT-14: feedback in Screen mode
Screen mode drew nothing. Its only feedback was a buzz, and iPhones never buzz for a web page.

What it shows now (`touchMarks.ts`, `TouchFeedback.tsx`):
- a faint ring where the steering thumb is anchored, with a chevron the way he runs;
- every move flashes at the finger, a 150 ms burst plus its name: Jump, Punch, Kick, Mega! or Duck;
- the names are in the Pad buttons' colours, and fade by 450 ms;
- labels close together stack rather than overlap;
- a jab taken back (CT-17) leaves no mark.

The setting is *Show touches*: Auto, On or Off.
- Auto shows the marks in World 1, while the moves are new.
- On a phone that can't buzz, the note under it says the marks are its feedback. That is the iPhone vibration note.

Shots: `shots/ct14-marks-sideways.jpg` and `-upright.jpg` (steer, a second thumb's tap, a flick, a held mega) and `shots/ct28-settings-upright.jpg`.

### CT-15: the palm rule ate second-thumb taps
- palmPx is now 45 (it was 70).
- A finger 45-70 px from the steering thumb keeps the palm rule's lenient flick, and never throws the mega.
- The report's radius test isn't built: almost every recorded touch reports 24 px, palm or thumb.
- Replay: +4 punches and +2 jumps, nothing lost.

### CT-16: a gripping palm or a lost lift took over the steering
- A touch that starts within 6 px of a side edge waits until it moves 8 px.
- On every touchstart, fingers the browser no longer reports are let go.
- The radius test isn't built: 1,572 of the 1,630 touches of 25 px or more were moving fingers.
- Replay: 33 fewer punches (8-17 ms edge contacts), and resting thumbs that threw a mega fell from 47.1% to 38.2%.

### CT-17: punches waited for the finger to lift
- **Pad:** Punch punches as it's pressed. Held for 320 ms it upgrades to the mega (`PadInput.punchButton`).
- **Gestures:** a second thumb's jab starts as it lands.

How a jab is taken back:
- The report asked to take it back if the finger moves more than 22 px within 60 ms.
- Built that way, 8.3% of Steph's second-thumb jumps also threw a jab. Phones report a finger's first move 40-100 ms after it lands, so 60 ms sees nothing.
- **Built instead:** 12 px within 100 ms. The engine holds a touch jab in its wind-up for that window (`jabHold`), so a jab taken back never strikes or sounds. Only a couple of frames of wind-up show.
- Stray jabs fall to 0.3% of jumping touches (Steph 0.5%).
- **The honest limit:** a lone thumb can't be known as a tap until it lifts, so only a second thumb gains. Most players tap with one thumb, and their median wait (about 95 ms) is unchanged.

### CT-18: Pad buttons had no extra touch area
- Each button answers 1.3 times its size, as an invisible ring. That way Punch's reach works past the middle of an upright screen.
- The rest of the buttons' half goes to the nearest button by its edge.
- In a real browser, these touches did nothing before and press the nearest button now, upright and sideways: either side of the Jump–Kick gap, 6 px past Punch, and 10 px above Kick.
- Shots: `shots/ct18-pad-reach-*.jpg`, with the touches marked.

### CT-21: the rope hop ignored the flick's lean
- Hopping off a shimmy rope takes leapDir.
- There's no intent lock on a rope.
- The steering thumb's slower push-up jump carries its lean.

### CT-22: a still press of 421-460 ms did nothing
- tapMs is now 400.
- A still press that lifts before the mega's hold punches.
- The report's second half was built and dropped: a left-half finger held still throwing the mega added 283 megas on the replay (85 to 368), all from thumbs resting before they steer.

### CT-23: two "20 degree" constants
One lean now (leanSlant 0.364).

### CT-24: accidental double jumps
- The wiggle needs 0.25 px/ms.
- The other thumb's sink-and-flick-again needs 0.3 px/ms.
- The report's 16 px dip was dropped: it lost seven deliberate double jumps.
- Replay: slow-rise second jumps fell from 77 to 64, and quick ones went from 152 to 151.

### CT-25: the Pad re-rendered on every touchmove
- The knob moves through a ref and a CSS transform.
- In a browser, 10 moves changed no element.

### CT-26: Jump pressed while the pad is held up gave no press
Any press of the button is now a new jump press.

### CT-28: sensitivity and handedness
- **Sensitivity** (75-135%) divides every distance a move has to cover.
  - A quick flick needs 18 px at 100%, 14 px at 135% and 24 px at 75%.
  - The palm, the edge and the beside-the-thumb sizes belong to the hand, so they stay.
- **Replay at 135%:** short ground flicks missed 18.5% → 3.7%, and stray jumps went 2.0% → 2.1%.
- **Replay at 75%:** short flicks missed 55.6%, and stray jumps 1.8%.
- **Steer with: Left / Right.** Right mirrors the steering half for left-handers.
- **Either** is CT-8's single-finger behaviour, another helper's item. It gets added when CT-8 lands.

## Polish check
1. **Painted, not drawn:** the marks are on-screen UI (the HUD), not the world. They're drawn in code in the Pad buttons' colours and font weight, which STAGE-RULES §4 allows for small touches.
2. **Nothing copy-pasted:** n/a.
3. **Art lines up:** the Pad buttons' looks are unchanged (`shots/ct18-*`). Only where they answer grew.
4. **Light:** n/a.
5. **Pokey on model:** unchanged. A jab taken back shows at most a couple of frames of wind-up and never strikes.
6. **Framing:** the labels sit above the finger, so the thumb doesn't hide them. They're clamped inside the screen and stack rather than overlap (`shots/ct14-*`).
7. **Text:** the settings notes sit under the rows they explain (`shots/ct28-settings-upright.jpg`).
8. **Every move needed:** reach is untouched (the full suite).
9. **Moments:** n/a.
10. **Motion:**
    - The burst lasts 150 ms and the label fades by 450 ms.
    - **Rough spot, named plainly:** the steering ring is faint on bright backgrounds, as specified ("a faint ring"). If Matt finds it hard to see, it's one number.
