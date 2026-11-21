# UI-372 stills: the setting each was BUILT on, as the page reported it (D62/D108)
All 2-3 layout 1, 2x, upright 412x915 and sideways 915x412, on the dev server (vite, port 5181), the engine's own draw (code 6f43157d5 +
the shadow swap in the next commit). Shooter: `node reference/qa-reports/UI-372/stills372.mjs <dir> [easy]`; it prints `built {easy, cages}`
read from the engine (e.easy) before any shot.
- **normal** (`ui372-normal-*`): built `{"easy":false,"cages":5}`; the HUD shows 5 slots.
- **easy** (`ui372-easy-*`, localStorage sloth_difficulty=easy only, no URL switch): built `{"easy":true,"cages":5}`; the HUD shows 3 slots
  and the goal card read "Easy, free 3 animals".
- Three freed (the stage's first three cages, e.freeCritter), him in the first reed bed; the otter (line[1]) set spooked and hiding where it
  ran to (follow.ts's own state: spooked, back), 330 world px off the screen:
  - `*-left-*`: off the left edge: the marker at x 45, at its height (upright y 559, sideways y 204 css px).
  - `*-right-*`: off the right edge: x 367 upright / 870 sideways.
  - `*-nearing-*`: he walks back toward it; it is still about 56 px off the edge: the marker still up.
  - `*-gone-*`: the first frame its body is on the screen: spookMarks n = 0, the marker gone (the otter crouched in its reed tuft at the edge).
- `ui372-mock-normal-*`: the SHOW FIRST mock-up (drawn over the frame, Happy face, before the build), kept as the record of what was approved.
- `sad-heads.png`: the three Sad paintings cut from w2-props, the faces the marker uses.
