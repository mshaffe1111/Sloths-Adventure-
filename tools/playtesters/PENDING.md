# Pending for the coding team

QA's running list from Matt's test-link sessions (Matt, 2026-10-26: Matt plays, QA reads the logs; send to the coders in one
batch only when Matt says "send").

## 1. Game froze at the start of a stage (Matt reported it as a crash) [blocker]
- Session `Matt 20261026-1558-mpcz`, build 2026-10-26T15:52:40, Android 498x1034 upright, control-test stage (mix: Bounce,
  Push the log, Snakes, Snapping turtles, Hide from the eagle, Lily pads), help "reminders".
- What the log shows:
  - Stage start fine: sheets loaded by 0.4 s (props 146 ms, hud 187 ms, turtle 149 ms, leaves 5 ms, w2-props 129 ms);
    section "Run and stop" at 0.25 s.
  - At 1.3 s a `blank` event: "wait w2-props-DHWljPtC, wait leaves-atlas-M2igYnqZ x140", though both sheets had already
    loaded (at 0.35 and 0.44 s).
  - Pokey's position lines stop at 2.27 s, at x 140 (where he spawned). The only `fps` line is at 5.3 s
    (28.4 fps, max frame 99 ms). Nothing from the game after that: no fps, no sections, no position.
  - The page stayed alive: `mem` kept logging every 5 s for 2.5 minutes, but with the same numbers each time
    ("18/36MB parts 0 foes 5 items 58"), so the game wasn't updating. Matt's touches from 167 to 189 s were read as
    gestures (47 duck, 39 jumpUp, 18 move, 9 punch, 8 jump), and nothing moved. One `long` 106 ms task at 158 s ("menu").
    He left at 191.7 s (`hidden`).
- So the game loop stopped (or the stage never came out of a "waiting for art" state) about 2 s in, while the page, its
  timers and touch input kept running. No `err` line was logged.
- The session before it (`20261026-1540-5dmf`, build 15:23) also logged a `blank` "wait w2-props, wait leaves-atlas x140"
  at 2.0 s, but recovered and played on (16 sections, 2 finishes). Same wait, different outcome: a race in the
  "wait for sheet" path?
- To check: what clears the blank/wait state, and can it miss a sheet that finished loading before the wait began?
