# AF: the PROOF-1 violations, fixed test-first. Branch t-audit-fixes (base t-int-engine @d0276817), 2026-11-12 ET
Each fix: the failing test first (seen red), then the fix (seen green). Logs: logs/. Every gate below was run here on the final tree.
## Violations
1. **FIXED** AudioFocus and KeepAwake never reached Android (audioFocus.ts:12, appShell.ts:34). Cause: a Capacitor plugin is a Proxy that
   answers `then`, so a promise resolving to it never settles. Fix: the plugin is held in a wrapper (`{ plugin }`). Test:
   src/game/capPlugins.test.ts drives the REAL keepScreenOn / wantAudioFocus through Capacitor's real native bridge (from
   @capacitor/android, not a copy): red before ('"KeepAwake.then()" is not implemented on android', same for AudioFocus), 4/4 after; plus a
   guard: no file in src resolves a promise to a bare registerPlugin. In the browser too: back/backcards.log shows AudioFocus.want and
   KeepAwake.set reaching the bridge. (PROOF-1's capThen.test.ts tests the pattern inline, not the code, so it was replaced, not copied.)
2. **FIXED** Stage Cleared cut off (index.css:510). Wider than reported: at 915x412 and on EVERY upright phone under 915 px tall the
   bottom row also started off the screen (the card scrolled; named, not fixed, in f59e72e0c). Fix (src/components/hud/cleared.css):
   sideways 361-440 px tall, Next sits beside Previous / Play again / World map; under 760 px wide those three drop their pictures;
   upright, three tighter tiers (900 / 760 / 660 px). Measured with nothing scrolled, 13 sizes (shots/probe.cjs): 915x412, 844x390,
   800x360, 740x360, 667x375, 412x915, 390x844, 375x812, 360x780, 360x740, 375x667, 360x640: every button inside the safe area, 44 px+,
   the card never scrolls. Before/after: shots/before-*.jpg, shots/after-sheet-up.jpg, after-sheet-side.jpg. Gate: clipcheck judges this
   card with nothing scrolled (a scroll box gives it no pass, a button off the screen counts) at the walk's size and at 390x844 / 844x390,
   and plants a 200 px taller card every run (fails closed). Old CSS planted: **FAIL** at 915x412, 844x390, 390x844
   (logs/clipcheck-plant-oldcss.log). Fixed: full clipcheck **PASS** (83 known, every screen opened, plant caught on all 6 walks).
3. **FIXED** Save / Load words (SaveLoadDialog.tsx:157). The story keeper's three lines, verbatim (STORY-LINES.md @fdce7348; old -> new in
   player-strings.md): the finds version, because src/components/saveLoadWords.test.ts proves on a real buildSave -> parseSave ->
   applySave round trip that stages, stories and sloth_finds travel and music, effects and mute do not. Red before, 3/3 after. clipcheck on
   the dialog both ways, 3 saves: PASS (2 known: its 39 px tabs). Old wording updated in two test comments.
4. **FIXED** Generality gate blind to the new engine files. ENGINE_FILES gains clock, stageModes, ride, stillness, noise, heroNoise,
   saveFile; ENGINE_DIRS gains src/game/predators/. Test (gen2/generality.test.ts): a stage id planted in each of the 12 files fails it
   (14 red before, 36/36 after); a new file in predators/ is checked; a listed engine file that is gone now FAILS the gate (was skipped
   quietly). CLI plants in clock.ts and predators/core.ts: FAIL. Judgment call: predators/roster.ts is EXEMPT by name as world data (each
   world's cast; it names 8-4's moth cast), since the known list cannot grow. Gate today: 32 files, 29 known, PASS.
5. **FIXED** 4 tools tests CI never ran. gates.yml `rolled` job runs them (17 pass, 3 s; logs/ci-tools-tests.log ran the line pulled
   verbatim from gates.yml). Countermeasure: src/game/ciTests.test.ts (in the suite) reads every workflow's `tsx --test` line, expands
   its globs as bash does, and fails on any test file no workflow runs (red on exactly these 4 before). The 17 older files outside CI are
   on its NOT_IN_CI list with a reason; it only shrinks. gates.md and CLAUDE.md Checks updated.
## Unproven items
- **Back on the guardian card and the victory card** (Capacitor's real bridge, up and sideways): guardian card -> map; victory card ->
  map -> title; 0 page errors (back/backcards.log).
- **Venom Fang (1-10) to its end in the browser, Easy and Normal**: 58 s of fight through all 3 phases, defeat, its story (Skip),
  the victory card; 0 page errors, 0 console errors (boss/bossend.log). Honest limit: no scripted player drives the live page, so the
  harness kept Pokey's hearts up and lowered the guardian's health in steps, ending through the engine's own startBossDeath.
- **30 fps at CPU x4 on a quiet run**: could not get a clean 30. Each run started at load < 1 (its own Chromium lifts it to 1.4-1.7);
  shipped build, 4-1: 29.5, 25.9, 29.4, 28.6 fps drawn; game time true (0.9988-1.0005). Needs a real phone (logs/fps-cpu4.log).
## Checks (final tree)
tsc 0 | touched tests 139/139 | clipcheck full PASS (83 known) | generality PASS | build + chunkcheck PASS | knowncheck, artcheck,
roadmapcheck PASS | stage lock vs 0.9.6: 102/102 stages unchanged | seedlist 1-1 --check PASS (355 seeds, 0 refused).
## Named, not fixed (for the lead)
- The 360 px tall sideways card (the older compact layout, untouched): Dot sits on a star and "Splendid!" overlaps a medal
  (shots/after-sheet-side.jpg, bottom). The Game Over card scrolls 13 px at 360x640 (its buttons are inside the safe area).
- ciTests.test.ts NOT_IN_CI (17 files) is debt with no R-id yet; 4-1's console error (w4Grit drawBack) seen again, as PROOF-1 noted.
