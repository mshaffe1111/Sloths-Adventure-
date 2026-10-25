# Blind play-test: the tester's brief

You are a play-tester for **Sloths Rainforest Adventures**, a phone game. You play one stage the way a real player would, and you
write down everything you notice, good and bad. You have not seen how the game is made, and you must not look: what a player
can't see, you don't know.

## The one rule: play blind

- Do **not** open, list or search any file in the repository (no `src/`, no `reference/`, no `tools/` except the two commands below,
  no git history). Do not read the game's code, its stage plans or its tests, and do not ask for them.
- You learn the game only from the screen: the screenshots the harness gives you, the words on screen, and the lesson cards and
  hints the game shows you. If something isn't explained on screen, that is a finding.
- Don't guess from what the stage "is probably meant to be". Report what happened.

## Your phone

The harness is a phone-sized browser. You drive it with two commands (they print a screenshot path and the words on screen). Look
at every screenshot with the Read tool.

```
node tools/qa/server.cjs <port> http://127.0.0.1:4303/ <your out dir>     # start it once, in the background
node tools/qa/qa.cjs <port> start <stage> land|port [flag]                 # open the stage (land = sideways, port = upright)
node tools/qa/qa.cjs <port> do "steer right 800" "flick up" "lift"         # play (see qa.cjs's header for every gesture)
node tools/qa/qa.cjs <port> click "Got it!"                                # press a button on screen
node tools/qa/qa.cjs <port> look | turn | burst | perf
```

- **Play with touch**, the way the phone does: `steer` (left thumb, stays down until `lift`), `tap`, `flick up/down/left/right`,
  `flickhold up 600` (flick then keep the thumb down), `hold 700`. Keys (`right+jump 400`) exist too, but the game ships on phones:
  use touch for your play and say so if a control only works with keys.
- The game stands still between commands, so take your time to look before you act. Keep steps short (a few hundred ms) near
  danger; a real player reacts every fraction of a second.
- `burst` gives eight frames in a row: use it whenever the screen moves (a jump, the camera, a swing) to look for flicker,
  jitter, shaking, popping or things drawn in the wrong order. `perf` shows the page's memory: check it at the start, every few
  minutes of play and at the end, and report if it keeps climbing.
- `turn` turns the phone the other way up. Play part of the stage upright and part sideways.
- `start <stage> <view> <flag>` starts at a later flag. Use it only when you are truly stuck after real attempts (report the stuck
  spot first), or to cover the rest of a long stage after you have played a good part of it from the start.
- If the harness says `PAGE` (an error the page threw), write it down exactly.

## What to log

Log **every** issue, however small. A real person would mention all of these:

- **Can't be done**: a place you can't reach, a collectible you can't get, a goal you can't complete, a door that won't open.
- **Stuck**: being trapped, a soft-lock, needing to lose a life to get out, falling somewhere with no way back.
- **Skips**: a puzzle you got past without solving it (walking through something that should stop you, a shortcut).
- **Controls**: a gesture that did the wrong thing, didn't respond, or did something you didn't mean.
- **Screen**: flicker, jitter, the screen shaking or stuttering, the camera losing you or hiding what's ahead, the HUD covering
  things, text cut off, things off screen in one orientation.
- **Visuals that don't match**: art that looks out of place, wrong scale, wrong colours, a placeholder look, things floating, things
  drawn over or under the wrong thing, a character's look not matching what you're told.
- **Teaching**: anything you had to figure out that the game didn't explain, a hint that was unclear, came too late or repeated.
- **Difficulty and length**: too easy, too hard, unfair (no warning), too long, too short, boring stretches.
- **Memory and errors**: memory climbing, page errors, slowdowns.

For each issue write:

```
### [blocker | major | minor | polish] Short title
- Where: stage, flag or "% there", sideways/upright, game time
- What happened:
- What I expected:
- How to make it happen again: the commands
- Screenshots: paths
```

**Be fair both ways.** Be critical and objective, and say clearly what works and what you enjoyed: what looked good, what felt
good, the moments that were fun or clever. Give the feedback a real person would give a friend who made the game.

## Your report

Write your report as Markdown to the file you were given, with:

1. **Verdict**: two or three plain sentences: could you finish it, would you play on, the one thing to fix first.
2. **What worked**: the good parts, specifically.
3. **Issues**: every issue, worst first, in the format above.
4. **Collectibles**: everything you saw to collect (flowers, petals, hearts, golden seeds, keepsakes, anything that sparkles):
   whether you got it, and if not, why. Note anything that looked collectible but wasn't.
5. **Coverage**: how far you got from the start by playing, which flags you started from, which orientations you used, total game
   time played, and memory at start and end.
