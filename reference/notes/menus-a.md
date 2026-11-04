# menus A notes (keep short and current)

## PICKUP POINT (paused by the lead at 2026-11-04 12:51 ET to save Matt's tokens for the World 1 release; resume tomorrow on R-6.40)
- **Done**: mocks + plan on the merged base (lead 2c8e3932, main 0.9.4), branch menus-nav. Review page v2:
  https://claude.ai/artifact/F5nhNaUC5uRtz5oN7rZhHi. 64 stills in reference/menus/save-slots/mock/. PLAN.md, methods/save-slots.md.
- **Gates on the merged base so far**: tsc pass; saveSlots tests 10/10; components 75/75; slots.mjs shots all ok (no clip or tap
  flags, 4 saves x 4 sizes); slotsFlow 9/9 (34 of 34 keys back). Clipcheck PASSED on the OLD base (83 known, new screens walked), and
  has NOT been re-run on the merged base. The full test globs (audio+game, gen2), build, artcheck, knowncheck, clipcheck and drawcheck
  on the merged base were started and then stopped for the pause. **Next: run them all (/tmp is gone, so re-create the script: the
  three shards in parallel, then build, artcheck, knowncheck, clipcheck, drawcheck), then send the lead the mocks report.**
- **Next after that**: the lead and the supervisor review the mocks and the plan; Matt answers Q1 (per-explorer vs per-phone play
  settings) and Q2 (after a new explorer: title vs straight into the story). Build only after his OK. Build-stage to-dos: the backup
  list gaps (seeds, silk, story_b, journal flags, dot_skip_offered) into saveFile ALLOWED, and New Game clearing seeds and silk; the
  Android share-sheet path for the erase-question backup; a real-phone kill test (Play Store section 6 item 8); log the defects
  (backup gaps; small-phone title; clipcheck has no small sizes).
- **Planned vs actual**: R-6.40 planned 5.5 h from ~11:37 ET. Mocks + plan took ~1 h (to 12:34); then ~20 min to redo them on the
  merged base after the D23 catch. The remaining gate run is ~15 min. On track.

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
