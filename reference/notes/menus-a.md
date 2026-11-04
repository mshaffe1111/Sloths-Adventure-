# menus A notes (keep short and current)

## Job (from the lead, 2026-11-04 ~11:30 ET): New game + 3 named explorer slots
- Matt decided: New game on the title next to Continue, and 3 named slots ("Who's playing?").
- Lead OK'd my read-back. Note from the lead: write save-slots.md as I go; the plan must include a rollback.
- SHOW FIRST: plan + mocks to the lead and the quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi). Build only after Matt's OK.

## Done (mocks stage)
- src/game/saveSlots.ts (swap model, journal, keyClass) + saveSlots.test.ts (10 pass, 48 cut points). slotBoot.ts runs first in
  main.tsx.
- UI: components/slots/WhoPlays.tsx + slots.css; title row in TitleScreen.tsx + index.css.
- Small-phone title fixed (it was already cut on main).
- Shots: tools/qa/menushots/slots.mjs; real-game loop: slotsFlow.mjs (9/9 PASS, 34/34 keys).
- PLAN.md (reference/menus/save-slots/), methods/save-slots.md.

## 12:34-12:50 ET
- First push 4ed3dce2. The supervisor (session_01FhBbYMRX9oghoTKPdqrnL9) caught a stale base (D23). Merged the lead branch 2c8e3932
  (main 0.9.4); icons are painted only now, so my screens moved to PaintedIcon; "sloth" maps to the home stump, so I used Pokey's
  face there.
- Owned to the supervisor: src was written before Matt's OK (the mocks are real screens). It stays unmerged until he says yes.
- Review page: https://claude.ai/artifact/F5nhNaUC5uRtz5oN7rZhHi (v2, merged base).

## Open
- Matt Q1 (per-explorer vs per-phone play settings); Q2 (after a new explorer: title vs straight into the story).
- Defects to log: the backup file misses seeds/silk/story_b/journal flags; New Game doesn't clear seeds/silk; clipcheck has no
  small-phone sizes.
- Android: downloadBackup (the erase question) uses a browser download, so it needs the share-sheet path (SaveLoadDialog
  doShareFile) at build.

## My pitfalls
- CSS for the title goes in index.css (load order).
- Times and commit ids from command output only.
