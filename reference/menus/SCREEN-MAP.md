# Screen map: every screen and pop-up, how you get in and out

Menus-nav job, 2026-11-01 (helper A). Matt, 2026-10-31: "there's no way to get back to the start screen... not a consistency with how you exit menus... some you hit an X... to get to the start you got to go to the world map."

## The rule (Matt approved)

1. **Every screen** has a **Back** button in the same top-left spot (round painted token + a wooden tag naming where it goes), and Android's Back does the same thing.
2. **Every pop-up** closes the same three ways: the **X** at its top-right, a **tap outside** it, and **Android Back**.
3. **The pause menu** always has **Resume, Restart, World Map, Start Screen**, and asks **"are you sure?"** when progress in the stage would be lost.
4. **The World Map and Settings** can always reach the **Start Screen**.

Built from one kit, `src/components/nav/Nav.tsx` (`BackButton`, `Popup`, `ConfirmDialog`, `useBack`, `LeafButton`, `CornerToken`) and one back stack, `src/components/nav/backStack.ts`: whatever is newest on screen owns Back. App.tsx asks the stack first (Android Back and Escape), then falls back to its per-screen rule (play pauses, the title asks "Leave the game?").

Kind: **S** = a screen (gets a top-left Back), **P** = a pop-up (X, tap outside, Back), **C** = a full-screen card that is a step in the flow (its own big buttons; Back does the sensible step), **F** = a story/film (Skip).

| # | Screen | Kind | Way in | Way out today | What changes | Owner |
|---|---|---|---|---|---|---|
| 1 | Title (start screen) | S (home) | app start; Start Screen from map, pause, end cards | Android Back: "Leave the game?" | none (it is home). Back = Leave dialog | A |
| 2 | Leave the game? | P | Android Back on the title | X, tap outside, Back, Keep playing / Leave | moves onto `ConfirmDialog` (same look as every confirm) | A |
| 3 | Settings (title) | P | gear token, title top-right | X, tap outside, Done, Escape; Android Back only through the `.ui-x` hack (it has `.st-x`, so Back did nothing) | onto `Popup` so Android Back closes it; same card when opened from the map, with a **Start Screen** row when not on the title | A |
| 4 | New Game confirm (inside Settings) | P | Settings > Saves > New | Keep my game / Yes, start over (no X, Back closed Settings under it) | onto `ConfirmDialog` | A |
| 5 | Save / Load | P | Settings > Saves; map's Save / Load chip | X (ui-x), tap outside | onto `Popup` look; the map's chip goes (Save / Load lives in Settings > Saves) | A |
| 6 | New Game dialog (mode, skip story) | P | after the New Game confirm | X, inner Back | X/Back via `useBack` | A |
| 7 | Mode pick ("Who's exploring?") | P | first Start / first map on a fresh game | Escape, its own close | `useBack` so Android Back closes it | A |
| 8 | How to Play | P (wide) | title leaf; pause tile | X (ui-x), tap outside; a page's inner back chip | onto `Popup`-style X token; Back closes a page first, then the book | A |
| 9 | About | tab | Settings > About | (Settings' X) | stays a tab | A |
| 10 | Update pop-ups (Check for updates / new version row) | row / toast | title, pause | none needed (rows) | if a pop-up is shown, it uses `Popup` | A |
| 11 | **World Map** | S | title leaf "World Map"; pause; end cards; Back from Satchel/Trophies opened there | tiny "Start" chip top-left; tiny trophy/book/stars/Save chips top-right ("you can barely even see them") | **redone** (below): Back "Start Screen" top-left, Settings token top-right, big world plaque with leaf arrows, big labelled leaf row (Worlds, Satchel, How to Play) | A |
| 12 | Stage card (on the map) | part of S | tap a stage | tap another stage | bigger painted card, big PLAY sign, clear locked reason | A |
| 13 | World picker | P (wide) | map "Worlds" leaf or the plaque | new | big labelled world tiles: picture, name, cleared x/10, lock reason | A |
| 14 | Locked world / stage message | toast | tap a locked one | times out | kept, larger | A |
| 15 | **Pause** | P | pause button, Android Back, back swipe, Escape/P | Resume, tiles (no X; Back = Resume) | renamed **Paused** (it said "Settings"); X top-right = Resume; Restart / World Map / Start Screen ask "are you sure?" | A |
| 16 | Leave-the-stage confirm | P | Restart, World Map, Start Screen on pause | new | `ConfirmDialog`: "Keep playing" is the big safe answer | A |
| 17 | Stage cleared (results) | C | clearing a stage | Next, Previous, Replay, Map | Back = Map (was the same); add a Start Screen way | A |
| 18 | New skill card | C | a stage that teaches a skill | Continue | Back = Continue (as today) | A |
| 19 | Out of lives (game over) | C | losing every heart | Continue, Take help, Map | Back = Map (as today) | A |
| 20 | Story ending card | C | after the ending | Map, Start Screen | unchanged | A |
| 21 | Story player (intro, world beats, mid, gate, boss intro/defeat, ending, memory) | F | Story leaf; new game; world/boss beats | Skip chip; Escape = skip | Back = Skip (as today); Skip chip stays top-right | A |
| 22 | Boss cards | C | before a boss | their buttons | Back = their main button | A |
| 23 | **Satchel hub** (finds, Journal, Scenes) | S | map leaf "Satchel"; pause tile | small `ui-x` "Back" | `BackButton` top-left naming where it returns (World Map / Paused / Start Screen) | **B** |
| 24 | **Trophy Room** (trophies, jungle cards) | S | Settings > Trophies; pause > Trophies tab | small `ui-x` "Back" | `BackButton` top-left; reached from the Satchel hub | **B** |
| 25 | Creature card / find reader | P | a card or a find | X / tap outside / Escape | onto `Popup` | **B** |
| 26 | Medal pop (toast on victory) | toast | earning a medal | times out | B's design | **B** |
| 27 | Lesson card / coach | P on stage | first time a mechanic shows | its button | Back = its button (stage stays paused) | A (check only) |
| 28 | Control test gate | C | tester link only | its buttons | unchanged (tester only) | none |

## Where every screen can reach

- **Start Screen**: from the map (Back), from pause (Start Screen, confirmed), from Settings opened on the map (Start Screen row), from the end cards.
- **World Map**: from the title (leaf), pause (confirmed), results, game over; Back from Satchel/Trophies opened there.
- **Satchel hub (B)**: from the map's leaf row and the pause tiles. Trophies and cards are inside it.
- **Settings**: the gear token at the top-right of the title and the map; on a stage, the pause card holds the same Sound / Game options.
- **How to Play**: title leaf, map leaf, pause tile.

## Android Back, screen by screen (after this job)

pop-up open → it closes · playing → pause · paused → resume · results / game over → map · Satchel / Trophies → where they were opened · map → Start Screen · story → skip · title → "Leave the game?"

## Status (2026-11-01, helper A, branch menus-nav)

Done: rows 1-8, 11-16 (Leave dialog, Settings, New Game confirm, Save / Load, New Game, Mode pick, How to Play, the map, stage card, Worlds pop-up, locked toast, pause and its confirm). Rows 17-22 keep their own big buttons; Back on them already does the sensible step through App.tsx's fallback.
Still on the old `.ui-x` hack in App.tsx's Android Back (until helper B moves them onto the kit): Trophy Room, Satchel, find reader. Once they use `BackButton` / `Popup`, the hack can be deleted.
Checked by a click-through (Escape drives the same back stack as Android Back): 17 of 17 paths pass, no page errors.
