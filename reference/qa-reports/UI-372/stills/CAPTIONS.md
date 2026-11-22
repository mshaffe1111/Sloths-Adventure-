# UI-372 stills: the setting each was BUILT on, as the page reported it (D62/D108)
All 2-3 layout 1, 2x, upright 412x915 and sideways 915x412, on the dev server (vite, port 5181), the engine's own draw (code 7a638985c: the 48 px 'gone'
ruling; re-shot by UI-372b). Shooter: `node reference/qa-reports/UI-372/stills372.mjs <dir> [easy]`; it prints `built {easy, cages}`
read from the engine (e.easy) before any shot.
- **normal** (`ui372-normal-*`): built `{"easy":false,"cages":5}`; the HUD shows 5 slots.
- **easy** (`ui372-easy-*`, localStorage sloth_difficulty=easy only, no URL switch): built `{"easy":true,"cages":5}`; the HUD shows 3 slots
  and the goal card read "Easy, free 3 animals".
- Three freed (the stage's first three cages, e.freeCritter), him in the first reed bed; the otter (line[1]) set spooked and hiding where it
  ran to (follow.ts's own state: spooked, back), 330 world px off the screen:
  - `*-left-*`: off the left edge: the marker at x 45, at its height (upright y 559, sideways y 204 css px).
  - `*-right-*`: off the right edge: x 367 upright / 870 sideways.
  - `*-nearing-*`: he walks back toward it; its body is still off the left edge (otter x 80 world px left of the camera): the marker still up (n = 1).
  - `*-gone-*`: the shooter stops on the FIRST frame spookMarks().n === 0: the otter's left side is 75-76 world px inside the left edge
    (normal upright fx 5620 / cam 5545, sideways 5290 / 5214; easy 5660 / 5585, 5330 / 5254), past the 48 px ruling. The otter is on the
    screen, clear of the edge, crouched in its hiding pose in the green reed blades: visible but small; the HUD face keeps its '!'.
    In these frames the duck and capybara HUD slots show grey (not green-ringed) after his long walk back: seen, not explained here.
- `ui372-mock-normal-*`: the SHOW FIRST mock-up (drawn over the frame, Happy face, before the build), kept as the record of what was approved.
- `sad-heads.png`: the three Sad paintings cut from w2-props, the faces the marker uses.
