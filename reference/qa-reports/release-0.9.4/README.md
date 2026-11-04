# Release 0.9.4: the screen walk (release clerk)

What changed in this release: icons B-E (every menu, map, satchel, story and HUD icon painted) and R-1.1 (Crocus Rex's defeat).
Each screen below was shot upright (412x915) and sideways (915x412), on a fresh save, an old save and a finished save, at device scale 2.
Every still carries its base stamp; `BASE.txt` in each folder names the commit, and `node tools/art/icons/checkbase.mjs` passes on this folder.

| Folder | What | Tool | Saves |
|---|---|---|---|
| `after-screens/` | title, Settings (every tab), World Map (+ a stage picked), Satchel (every tab), How to Play, the in-play HUD, Pause (+ its tabs) | `tools/art/icons/shots.mjs` | fresh, old = `tools/art/satchel-seed.js` (half-played, with play records), done |
| `after-cards/` | Stage Cleared, a hurt HUD, Game Over, the boss fight's HUD (icon group B) | the steps of `tools/art/icons/shot-cards.mjs`, all three saves | fresh, old = no play records (clipcheck's), done |
| `after-story/` | the Story player and its hold-to-skip (icon group E) | the steps of `shot-story.mjs` | same |
| `after-crocus/` | Crocus Rex's defeat cutscene, all 7 panels (R-1.1) | the steps of `tools/art/crocdefeat/shot-defeats.mjs` | same |
| `after-fresh-extra/` | the fresh save's World Map (after "Who's exploring?") and map with a stage picked; hurt HUD and Game Over upright on the fresh save | re-shots: a fresh save opens "Who's exploring?" first, so `after-screens/map-fresh-*` shows that pop-up, and the first try at the fresh upright hurt HUD ran before the engine was up | fresh |
| `sheets/` | one contact sheet per screen (the six shots side by side), to judge quickly | | |

## Rough spots (named, not fixed: outside the release scope)
- **Boss fight HUD, upright: the boss's name is drawn over the lives badge** (the "x3" and paw show between the words: "VENOM₃FANG").
  It is the same on main (`boss-name-over-lives-main.png`) and in 0.9.4 (`boss-name-over-lives-0.9.4.png`), so it is not new in this
  release. For the lead to route.
- **Journal, upright, finished save: "WORLD 10" breaks onto two lines** beside the long name "Stormy Highlands Fortress"
  (`sheets/screens-satchel-journal.jpg`, done up). Minor; the same on main (`journal-world10-label-main-vs-0.9.4.png`: main left, 0.9.4 right), so not new.

Nothing else on these screens looked rough: painted icons read on every screen in both orientations, the brass padlocks show on locked
map stages and How to Play moves, and Crocus Rex lies whole (crown off) and clear of the words box on every defeat panel.
