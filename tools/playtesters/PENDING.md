# Pending for the coding team

QA's running list from Matt's test-link sessions (Matt, 2026-10-26: Matt plays, QA reads the logs; send to the coders in one
batch only when Matt says "send").

## 0. The game ran at 1-3 frames a second for a whole 52-minute session (Sally, "Sasa") [blocker]
- Session `Sasa 20261026-1813-8brs`, build 15:52, Android 320x649 upright (dpr 3.375), control-test stage.
- Median frame rate by 5 minutes: 3.4, 1.5, 2.0, 1.5, 1.5, 2.2, 2.2, 1.6, 1.9, 1.6, 1.5 fps (frames 400-700 ms). The first `fps` line was
  already 24.9 fps with 490 ms spikes; `quality` dropped q0→1 at 0.4 min and q1→2 at 0.5 min, and it never recovered. 120 `stall` lines
  (all under 500 ms, because every frame was slow), 80 `long` tasks, both log kinds `capped` early.
- Memory was fine (18/25 MB → 20/23 MB), so not a leak. The canvas went from 640x1298 to 320x649 (quality 2) and was still at 1-2 fps.
- She spent 36 minutes on "Lily pads" (2.4 to 38.9 min), going back and forth to "Long jumps": at 2 fps it's nearly unplayable. She
  never reached the finish, so the log has no score. One life lost at 49 min.
- The same phone at 320x782 this morning (Sally jdg7/jz2z, build 09:50/11:16) ran at about 24 fps. So the 15:52 build, or this
  browser window (320x649 suggests an in-app browser or a split screen), is the difference. Something per frame got very expensive
  between 11:16 and 15:52 on this phone.

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

## 2. Boss 2-10 (the caiman) hurts by touch during its wind-ups [major]
- Session `Matt 20261026-1430-2up4` (build 11:16), from the new `bossHurt` log: 8 hearts in the fight. 6 were `body` (touching him),
  4 of those during a `tell`: `body tell deathRoll 0.50`, `body tell tailWhip 0.33`, `body tell tailWhip 0.32`,
  `body tell geysers 0.33`, plus `body act deathRoll 0.50/0.68`. Only one was a `strike` (tailWhip act 0.03) and one a geyser column.
- The "no touch damage, only attacks after their wind-up" fix was done for 1-10 and 3-10; 2-10 still hurts by contact, mostly while
  he is winding up, so the hit comes before the move it warns about.

## 3. Camera jumps back and forth about 130 px when Pokey turns [major, looks like shake]
- 55 `camjump` lines today, 47 on Matt's 498x1034 upright phone. Each is about 130 px sideways with no vertical change, and they
  come in back-and-forth pairs at the same spot, e.g. `dx-121 x13680`, `dx135 x13724`, `dx-131 x13729` (Sleeping snake).
- Worst: 21 in one section, `Twist: the swing frames` (Matt 2up4): every swing changes direction, and the camera's look-ahead flips
  with it, snapping the view about 130 px each way. Also 8 in `Develop again: higher and wider` and 3 in `Learn: swing over soft moss`.
- Suggest: ease the look-ahead when the facing flips (and hold it steady while swinging), instead of snapping it.

## 4. Sally drowned 12 times at "Push the log" and stopped there [major, teaching]
- Session `Sally 20261026-1150-jz2z` (320x782): the mix with Push the log (seed 571060) started twice; 12 lives lost to water in the
  "Push the log" section, then the session ended there. Matt also drowned twice at "Puzzle: the fallen log" (c3ho).
- By the "player or game" check she isn't a beginner (0.68 hits a section overall), so this spot is the game: what to do (push the log
  into the water first, then cross) isn't getting across, or the push is too fiddly on a small phone. Worth a Dot line before it,
  and a look at whether the log can be pushed from where a player stands.

## 5. Small phone (Sally, 320x782): many short freezes mid-stage [minor/perf]
- 45 mid-stage freezes over 100 ms on Sally's phone (worst 264 ms at River logs; 165 ms at Sleeping snake and Push the log),
  against 1 on Matt's upright phone. Her "Finish" section shows 42 choppy windows at about 24 fps (frames 57-67 ms).
- Memory is fine on every session (flat, or a slow climb to 30-32 MB over 20+ minutes).
