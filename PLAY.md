# How to play

## Where

- **Live game:** https://mshaffe1111.github.io/Sloths-Adventure-/
- **Testers' page (stage 1-1 only):** https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest
  1. Type a name.
  2. Pick a setting under "How hard?":
     - **Easy**: "Gentler jumps and more help".
     - **Normal**: "The game as it is meant to be played".
  3. Tap **Start**. Stage 1-1 opens straight away.
  - Each run is a different layout. The page says "One level, about 3 minutes."
  - A short survey appears at the finish.

The game is built for a phone held upright (portrait) or sideways (landscape), with touch only. It runs at a fixed 30 frames per second. In a desktop browser, use the browser's phone emulation with touch turned on.

## Controls (touch only, no on-screen buttons)

The whole screen is the control surface.

- **Run:** slide your thumb sideways and keep it down to keep running. Lift it to stop.
- **Jump:** a quick flick up (and forward) with a finger. A slow drag upward does not jump.
- **Double jump:** flick up again while in the air.
- **Duck:** slide down.
- **Mushroom bounce:** land on a mushroom to spring up high, and steer in the air to aim.
- **Punch:** tap the screen with any finger, including while the other thumb steers. A tap in the air is a jump kick.
- **Mega punch:** hold a finger still on the screen.

These are the move cards shown on the testers' page before Start:

| Move | Card text |
|---|---|
| Run | "Slide your thumb sideways. Keep it down to keep running." |
| Jump | "A quick flick up and forward, close to the edge. Not a slow drag." |
| Double jump | "Flick up again in the air, for tall steps and wide gaps." |
| Mushroom bounce | "Land on a mushroom to spring up high. Steer to aim." |

The exact gesture thresholds are in FEEL.md.

## The stage

- The player is Pokey, a sloth.
- Dot, a bird, flies along and gives short tips.
- Petals and flowers are the pickups.
- Falling into some drops returns Pokey to the last safe spot. Falling into others costs a life.
- Checkpoints save progress along the way.
- See STAGES.md for how 1-1 is put together, and STRIPS/ for pictures of whole stages.

## Pictures in STRIPS/

- `1-1_strip-A/B/C.jpg`: three different 1-1 layouts (seeds 110, 2727 and 5858), each drawn end to end. Long stages wrap into rows: read the top row first, left to right.
- `1-1_a-start / b-mid / c-end.jpg`: in-play stills from layout A, phone sideways.
- `1-2_strip.jpg`, `1-3_strip.jpg`, `1-4_strip.jpg`: the next three stages, which have the same layout every play.
- The faint vertical seams in the strips come from the parallax backdrop. The platforms, props and creatures are drawn exactly as in the game.
