# Pending for the coding team

QA's running list from Matt's test-link sessions (Matt, 2026-10-26: Matt plays, QA reads the logs; send to the coders in one
batch only when Matt says "send").

## 1. Game froze, then the site crashed, after leaving the pause menu's Trophies / Jungle Cards [blocker]
Matt's account: he opened the menu early in the stage, looked at the new medals (trophies), the Jungle Cards and so on, left the
menu, and the game froze and then the site crashed. The log fits that: the game paused about 2 s in (no position or fps lines from
then on, `mem` frozen at the same numbers, as a paused stage would be); about 2.5 minutes later a 106 ms long task tagged "menu"
(158 s, leaving the menu); then 22 s of touches read as gestures (167 to 189 s) with Pokey not moving; then the page went
away (`hidden` at 191.7 s). So the stage never came back from the pause after the Trophies / Jungle Cards screens.
Repro to try: start a stage, open the Menu, open Trophies, then Jungle Cards (go back and forth), close the menu, and steer.
Matt's fuller steps: Menu → Trophies; looked at all three tabs, scrolling (kill counts); opened a memory to watch again
("Tap to watch again"), skipped it; back up; Resume → froze.
**Likely root cause (QA read of the code, build 17145ea):** App.tsx's effect (about line 345) stops the engine and sets
`engineRef.current = null` whenever the screen becomes one of the story screens, including `'memory'` ("letting go of the engine
frees that stage's world"). TrophyRoom's `onReplayMemory` (App.tsx about line 1040) sets the screen to `'memory'` even when the
Trophy Room was opened from the PAUSE menu (`trophyFrom === 'paused'`). After the memory (finish or skip) it returns to the
Trophy Room, whose Back goes to `'paused'`, but the stage's engine is gone, so Resume resumes nothing. That's a frozen screen
whose touches are still read by the input layer, which is exactly the log. The page closing afterwards may be the browser
killing a stuck tab, or Matt leaving.
Skipping doesn't matter (Matt, confirmed in the code): the stage is released the moment the memory starts, so watching it to
the end breaks it the same way. The real bug: playing any memory or scene while a stage is open unloads that stage, and the
game later goes back to it as if it were still there.
Fix ideas: don't free the engine for a memory replayed from the pause menu (play it over the paused stage), or have Back
restart the stage from its last flag when the engine was released. Repro: start a stage, Menu → Trophies → Library → a seen
memory "Tap to watch again" → Skip → Back → Resume.
QA couldn't reproduce it in a quick headless pass (current dev build, 1-1 upright: Menu, Trophies, Jungle Journal, Library, Badges,
Back, Jungle Cards, Back, Resume, then steering: the game resumed and Pokey ran). Differences from Matt's case: a real Android
phone, about 2.5 minutes inside those screens, the control-test stage, the 15:52 build. A guess worth checking: the Trophy Room
and Jungle Cards pull in many card pictures, and on a phone that could run out of graphics memory and get the page killed (the
log's `mem` only counts script memory, 18 MB, so it wouldn't show). Do those screens release their pictures when closed?

Earlier read of the same log, kept for the details:
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
