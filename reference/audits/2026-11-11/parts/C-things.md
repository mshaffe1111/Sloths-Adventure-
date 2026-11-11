# Engine audit C: "things" (creatures, pickups, keepsakes, goals and the records they write)

Branch `t-audit-engine-c`, 2026-11-11. 12 findings, most severe first. Tests are in `reference/audits/2026-11-11/tests-c/things-*.test.ts`
(8 files, each run alone with `npx tsx --test <file>`; each fails today for the reason stated, in under 2 s).

Guards read before writing: `engine.ts` (start/stop, update order, loseLife/stepDown/respawnAtCheckpoint/softFall/heartFall/
chaseCaught/continueFromCheckpoint, the pickup loop, the goal check, buildStats, lessonTick/safeToStop, updateWatch, updateRing,
knockOut), `App.tsx` (the stage-end effect, onFind, onVictory, onDefeat, continueRun, onSaveLoaded, onNewGame, the pause menu's exits),
`saveFile.ts`, `badges.ts`, `badgeStore.ts`, `playRecords.ts`, `pokeyJournal.ts`, `finds.ts`, `difficulty.ts`, `flagResume.ts`.

Checked and found sound (no finding): counters and collected/defeated state are kept, never reset, on a respawn and on Continue, so a
goal cannot go backwards after a death; 4-9's blown-off guards count once each (`w4Play.ts:518`); power-up and invulnerability timers
are game-time and do not run under pause, a help offer or the life-lost beat; the creature modules (`creatures`, `predators`,
`predatorAI`, `enemyBrain`, `capuchin`, `eaglet`, `goldSnake`, `watcher`) hold no frame counts or wall clocks; every stage id has a
journal line and every find a Dot hint; D5's "Defeated x0" fix holds on all three card kinds (`CreaturesTab.tsx:26`, `:56`).

---

## 1. HIGH, CONFIRMED (test): a Game Over then Continue counts the whole run twice in every lifetime record

- **Where:** `src/game/engine.ts:4989-4991` (stepDown sends `buildStats(false, 0)` at Game Over), `:5029-5040`
  (continueFromCheckpoint resets no counter), `:4469-4505` (buildStats is the run so far, from the stage's start);
  `src/App.tsx:386-396` (the effect folds every report in with `recordStage` on `game_over` and again on `victory`), `:1090-1094`
  (continueRun keeps the engine); `src/game/badges.ts:471-508`; `src/game/playRecords.ts:82-85`.
- **Wrong:** the engine reports cumulative totals at every ending of one run, and the app adds each report to the saved counters.
- **Scenario:** on 1-3 he beats 12 snakes, picks 40 petals, loses his lives (Game Over), taps Continue, beats 4 more, clears. Saved:
  28 predators (12 + 16), 80+ petals, the first stretch's play time, punches, kicks, stomps, swings, friends freed twice; `falls`
  (which the General reads, `storyNotice.ts`) 3 + 6. Two Game Overs: three times. The journal's record counts 2 or 3 plays for one.
  Predator Patrol, Petal Basket, Long Road, Stomper, Haymaker, High Kick, Vine Swinger and Friends Freed all fill early.
- **Proof:** `things-continue-double-count.test.ts` (real engine: one petal, Game Over, Continue, Game Over):
  `petals picked: 1 in the run, 2 kept` / `2 !== 1`.
- **Roadmap:** not tracked. R-5.23 (stars and continues) asks "check whether a continue resets statLivesLost": it does not, which is
  right for stars and is what makes this double-count. Not being replaced.
- **Root fix (S-M):** one report per run. Hold the Game Over report; if Continue is taken, drop it (the later report replaces it); if
  the run is left, record it then. Same change as finding 4 (one "the run ended" path).

## 2. HIGH (Android app only), CONFIRMED (test): the flag resume brings back the place and nothing else

- **Where:** `src/game/flagResume.ts:12-17` (`SavedFlag { id, x, y, at }`), `src/game/engine.ts:1158-1160` (start), `:5222-5236`
  (startAtFlag), `:5230-5231` (`this.mc?.resumeAt(flag.x)`: Meeca's stage alone gets its progress put back), `:2585` (saveFlag).
- **Wrong:** a run the phone cut off restarts at its last flag with nothing picked up, beaten or freed, a clock at 0 and no lives
  lost. The exclusions are keyed to three run types (`!slideRun && !dotRun && !tide`) and one stage gets a patch (Meeca); the rule
  the other cases miss is "a resume restores the run, or it does not resume".
- **Scenario:** 1-2 (gather 98). Android closes the app at the last flag. Next start: "Back at your flag" at x 30,127 of 32,900,
  0 of 98 petals, 7 petals ahead, 105 behind, the door sealed. Same on beat/free/find stages (measured on 1 roll each: 1-3 all 21
  animals behind, 2-3 all 5 cages behind). On a timed stage (1-8, limit 280 s) the resumed run finishes on a fresh clock with
  `statLivesLost` 0: 3 stars and a best time of the last stretch only (`engine.ts:3201-3213`), which also walks round R-5.23's cap.
- **Proof:** `things-flag-resume-quota.test.ts`: `at the last flag (x 30127 of 32900) he owes 98 petals and 7 lie ahead: 105 are
  behind him`.
- **Roadmap:** not tracked; Play Store job code (2026-10-30), not being replaced.
- **Root fix (M):** save with the flag what the run holds (collected ids, beaten ids, the four counters, clock, lives and hearts
  lost) and restore it in startAtFlag; until then, resume at a flag only on stages with no goal count and no time limit.

## 3. MED, CONFIRMED (line pair): a medal that pops in play is not kept if the stage is left

- **Where:** `src/App.tsx:414-415` ("nothing is saved here: the stage's end files the medals"), `:420-433` (the 2 s check pops it),
  `:386-390` (medals are filed only on `victory` / `game_over` / `boss_defeat`), `:1566-1577` (the pause menu's map, title and story
  exits call `engine.stop()` and send no report), `:1085-1087` (Restart); `src/game/engine.ts:1239-1276` (stop sends no stats).
- **Wrong:** the pop says "medal earned"; the only things that would make it true (this run's counters) are thrown away when the
  stage is left by the menu, restarted, or closed by the phone.
- **Scenario:** his 25th stomp lands mid-stage: "Stomper I" pops with the chime. He pauses and goes to the map (or restarts). The
  Trophy Room does not have it, the 25th stomp is not counted, and it pops again some later day. Same for Bouncy, Sky Stomper,
  Combo King, Naturalist and every counted family.
- **Proof:** the pair `App.tsx:415` and `App.tsx:1566-1569` (`onOpenMap={() => { engineRef.current?.stop(); setScreen('world_map'); }}`).
- **Roadmap:** not tracked.
- **Root fix (S-M):** when a stage is left any way, take `liveStats()` and record it as a run that did not win (with finding 1's
  one-report rule), so what popped is filed.

## 4. MED, CONFIRMED (test): the stage's report reads the menu's mode at the end, not the mode it was played on

- **Where:** `src/game/engine.ts:4501-4502` (`difficulty: difficulty()`, `quiet: dotHelp() === 'quiet'`), against
  `src/game/difficulty.ts:118-126` (startRun / runDifficulty: "the run keeps this one"), `src/App.tsx:1012` (the best result uses
  runDifficulty) and `src/components/menuParts.tsx:384` ("It starts from the next stage"). Trusted by `src/game/badges.ts:218`, `:505`.
  The engine also re-reads the live mode mid-run at `engine.ts:3482-3483` (boss tell and opening lengths), `:5090`, `:6229`
  (assistNow), `:7004`, `:8152`.
- **Wrong:** two answers to "which mode is this run": the stage is built for one, the report and several live rules follow the switch.
- **Scenario:** 10-10 on Easy (fewer boss hits, set at build). Before the last hit: pause, switch to Normal, resume. The report says
  Normal: `finishedNormal = 1`, Jungle Hero (gold) and the Platinum's "Finish on Normal". Quiet Wings the same way (Quiet switched on
  at the door). Mid-fight, a switch also changes the boss's tells at once.
- **Proof:** `things-mode-switch-midrun.test.ts`: `the stage's report says the mode it was played on` / `'normal' !== 'easy'`.
- **Roadmap:** not tracked.
- **Root fix (S):** the engine keeps the mode (and Dot's help setting) it was built with in one field and every later read uses it.

## 5. MED, CONFIRMED (line pair): New Game and Load Save leave the old adventure's journal records in memory, then write them back

- **Where:** `src/App.tsx:346` (`playRecords` state, loaded once), `:204-218` (onSaveLoaded) and `:224-237` (onNewGame) reload levels,
  secret, hearts, medals, coat, finds and skills but not `playRecords`; `:401-403` (`withRun(playRecords[stats.id] ?? null, ...)`
  then `savePlayRecord`); `:1425` (`records={playRecords}` to the Satchel).
- **Wrong:** storage is wiped or replaced (`saveFile.ts:178-182`, `:196-198`), the React copy is not.
- **Scenario:** finish some stages, New Game (no page reload). The new journal shows the old adventure's notes for every stage as
  it is cleared. On the first clear of 1-1 the stale record already has `first`, so the new first clear is not written
  (`playRecords.ts:90`), and the old one is saved into the new game for good. Load Save: the file's own record for a stage is
  overwritten by the previous game's the next time that stage is cleared. This is D1's family (journal built from the wrong records).
- **Proof:** the pair `App.tsx:213-217` (five reloads, no `setPlayRecords`) and `App.tsx:401-402`.
- **Roadmap:** not tracked.
- **Root fix (S):** one "re-read everything kept in storage" function used by both, with `setPlayRecords(loadPlayRecords())` in it.

## 6. MED, CONFIRMED (test): a find shown as found is dropped if the run ends before a "safe moment"

- **Where:** `src/game/engine.ts:1175-1189` (collectFind: gone from the stage, "FOUND", +300, then queued in `findsWaiting`),
  `:5817-5826` (handed over only when `safeToStop()`, and never while `isGameOver` or in Meeca's stage), `:3210-3211` (only the win
  flushes the queue), `:2907-2915` (the thorn gate ends the stage without flushing); the save is `src/App.tsx:897-903`.
- **Wrong:** shown at pickup, saved later, and four of the five ways a run ends skip the save. Also `engine.ts:5995`
  (`hurt: p.invincibleTimer > 0`) holds the hand-over for the whole 8 s star power-up, which keeps that timer above 0
  (`:1732-1733`); `:5927` already makes that exception for Dot's view.
- **Scenario:** hit by a snake, blinking, he touches Meeca's note on his last life and falls: Game Over, "Start over". The note is
  not in the satchel. Also: pause then Restart/map inside the window; 7-7's gate; Android closing the app. He can find it again.
- **Proof:** `things-find-shown-not-kept.test.ts`: `+ actual - expected / + [] / - [ 'w1_note' ]` (a control run confirmed the
  hand-over does happen after 3 s standing safe).
- **Roadmap:** not tracked.
- **Root fix (S):** save at pickup (a callback that only keeps it), and queue only the reader card for the safe moment.

## 7. MED, CONFIRMED (test): on 1-8's collapsing branch, a life lost to a snake also costs a heart and a second respawn

- **Where:** `src/game/engine.ts:7596-7611` (chaseCaught: puts the branch back from the flag and restarts the collapse) against
  `:5238-5305` (respawnAtCheckpoint: restores crumbled planks, the tide, the jar run, not the chase), `:7410`.
- **Wrong:** two set-back paths for one stage; the chase's repair lives in only one of them.
- **Scenario:** on the branch (five snakes on this roll) a snake takes his last heart 650 px past his flag, the collapse already past
  it. He is stood on the fallen flag with the front ahead of him; next frame he is "caught": one heart gone, respawn sound and
  "lives left" twice. The stage's report shows a hit he never took (Untouchable, the journal's "not a scratch").
- **Proof:** `things-chase-respawn-double.test.ts`: `no heart lost on top of the life (lost 1)` / `1 !== 0`.
- **Roadmap:** not tracked. 1-8 is hand-built; R-142.2 (World 1 onto gen2) is held until after launch, so it ships as is.
- **Root fix (S):** move the chase's repair (`pl.broken = false` from the flag, `restartAt`) into respawnAtCheckpoint; chaseCaught
  then only takes the heart.

## 8. MED, CONFIRMED (test): 1-9's ring animals count for the goal but never as predators beaten

- **Where:** `src/game/engine.ts:4511` (`if (e.id < 9000 ...) statKills`), `:7236` (ring animals get `id: 9500 + ...`), against
  `:3595` and `:3473` (boss minions from 9000), `:3518`, `:4454` (`id >= 9000` means "a minion"); `src/game/goals.ts:54-58`.
- **Wrong:** two systems share the id range that means "boss minion, do not count".
- **Scenario:** 1-9, the fight stage: the 7 ring snakes and prowlers (of 27 animals) add to the goal counter and to nothing else:
  not Predator Patrol, not Pest Control ("10 in a single stage"), not the creature card's "Defeated xN", not the journal's foes note.
- **Proof:** `things-ring-kills-uncounted.test.ts`: `the goal counted 3 beaten, the stage's report (medals, cards, journal) counts 0`.
- **Roadmap:** not tracked; 1-9 ships as is (R-142.2 held).
- **Root fix (S):** mark a boss's minions with a field (`minion: true`) and test that, not the id.

## 9. MED, CONFIRMED (test): the watcher's words are picked by world number; 8-1's bat run gets World 1's bush line

- **Where:** `src/game/engine.ts:7708-7713` (`grotto = worldIndex === 3`, `cliffs = worldIndex === 4`, else the eagle and "bush"),
  `:7720-7725` (the bat run's own warning, patched in), `:7745-7749` (the "seen" cry and line, not patched).
- **Wrong:** the watcher's kind lives in the engine as world tests, not in the stage's watch data, so each new watcher needs every
  branch patched; World 8's missed one. General rule: the watch zone carries its kind (cry, hiding word, lines).
- **Scenario:** 8-1, first time caught on the bat bough: Dot says "Sleeping bats. Nowhere to hide: go while they doze.", then
  "They're stirring! Wait till they doze off again", then, with an eagle's screech, "It saw you! Get into a bush before its shadow
  reaches you". World 8's roost stretches also get the eagle's "Here it comes!" words by the same default.
- **Proof:** `things-watcher-world-keyed.test.ts`: `no line on a bat run sends him to a bush` /
  `+ 'It saw you! Get into a bush before its shadow reaches you'`.
- **Roadmap:** not tracked; 8-1 is a shipped gen2 stage.
- **Root fix (S-M):** `WatchZone.kind` (eagle, eyes, sovereign, bats, roost) with its cry and three lines; updateWatch reads it.

## 10. LOW today, CONFIRMED (test): a soft fall leaves the crumbled platform broken (the rule says whole on respawn)

- **Where:** `src/game/engine.ts:5180-5218` (softFall: no platform reset) against `:5252-5265` (respawnAtCheckpoint: "planks that
  crumbled since the checkpoint come back, or a respawn could leave a gap nobody can cross"); `src/game/regrow.ts:1-6` and
  `engine.ts:2605-2606` still say "no stage needs one"; Matt's rule (2026-11-02, CLAUDE.md, STAGE-RULES §1): required anywhere, whole
  again when he respawns.
- **Wrong:** softFall is how he is set back on Easy on every old-generator stage, on both modes on a softFalls stage (1-1), at World
  8's heart falls and in 8-4; it is the one set-back that does not mend the platform, which then returns only after 30-35 s and only
  off screen while he stands beside it.
- **Scenario:** latent on today's stages (no roll found with a crumbling platform over a soft pit). The day R-150.5 lays a required
  crumbling run over a soft pit, an Easy player who breaks it is put back at a gap he cannot cross without walking away for 30 s.
- **Proof:** `things-softfall-crumble.test.ts`: `the plank is whole again after the set-back` / `true !== false` (the contrast test,
  a life lost and a flag respawn, passes).
- **Roadmap:** R-150.5 (blocked) says "keep whole again on respawn" and does not name softFall. Fix it inside R-150.5.
- **Root fix (S):** one "mend what he broke" step shared by respawnAtCheckpoint and softFall (and the regrow.ts header corrected).

## 11. LOW, CONFIRMED (line pairs): journal totals built from records that are missing

- **Where (a):** `src/game/pokeyJournal.ts:525-535` (`if (!f) continue;` then time, falls and petals are summed) against
  `src/components/satchel/JournalBook.tsx:150-154` (shown beside `cleared/total stages`).
  **(b):** `src/components/Satchel.tsx:88` (`...?.stars || 3`) against `src/App.tsx:931-937` (the secret stage returns before
  `saveLevelProgress`, so `sloth_lvl_S-1` is never written).
- **Wrong:** (a) D1's fix covered a save with no records (the row hides when time is 0); a save with some (every save older than
  2026-10-31 that kept playing) shows "10/10 stages, 4:10 walking, 1 falls" where the time, falls and petals are of the 3 stages
  that have a record. (b) the Hollow's journal entry always shows 3 stars, whatever the fight earned.
- **Proof:** the pairs above.
- **Roadmap:** not tracked (D1's "Yokoten" lists creature cards, medal text and What's New, not the review row).
- **Root fix (S):** worldReview returns how many cleared stages have a record; the row shows the three totals only when all do (or
  says "of N stages"). Save the secret stage's result like any stage and drop the `|| 3`.

## 12. LOW, CONFIRMED (line pairs): two rules that do not check what their words say

- **Where (a):** `src/game/badges.ts:379` (Untouchable: `won && heartsLost === 0`) against `:380-381` and `:503` (Ghost Walk counts
  the same feat only when `heartsLost === 0 && livesLost === 0`). Falls and water take a life, not a heart (`engine.ts:4959-4965`),
  so a stage cleared after drowning three times earns "without taking a single hit" and shows Ghost Walk 0 of 10. Untouched
  Guardian (`:403-404`) the same.
  **(b):** `src/game/rules.ts:171-173` (third star on an untimed stage: "nearly everything collected", `>= 0.85`) against
  `src/game/engine.ts:3205` (the caller passes goal progress over the goal) and `:3106`, `:3178` (a win needs progress >= goal): the
  ratio is always 1 or more at a win, so the check can never fail. Third star on an untimed stage is "no life lost and 75% hearts".
- **Roadmap:** (b) sits beside R-5.23 (open, Matt decided the lives cap); fix together. (a) not tracked.
- **Root fix (S):** (a) one helper `noHit(stats)` used by all three medals. (b) pass petals picked over petals held, or delete the
  dead condition and its comment when R-5.23 rewrites the rule.

---

## Smaller notes (not in the 12)

- `sloth_seed_<stage>_<n>` (golden seeds, `protoStage.ts:6835-6845`) and `sloth_journal_told` / `sloth_journal_looked`
  (`movesJournal.ts:394-395`) are in neither the save file's list (`saveFile.ts:26-48`) nor what New Game clears (`:196-198`): after
  New Game seeds read "found before" (200, not 1,000) and no new journal page is announced; a loaded save carries neither.
- `easyMode.ts:414` (`worldIndex === 2 && style === 'moss_stone' && height === 110`) and `:425` (`worldIndex <= 5`) are world-keyed
  patches on the old generator's stages: wait for replacement (R-142).
- `easyMode.ts:472-475` halves a gen2 ring's waves after `goals.ts` set the Easy goal from the full ring, with no cap like the
  old path's `Math.min(have, ...)` at `:462`. No gen2 stage has a ring today.
- `App.tsx:914` (`window.setTimeout(() => startLevel(THORNBARK_LEVEL), 1100)`) is never cleared: leaving 7-7 by the menu inside
  1.1 s of the gate still starts the Hollow.
- `skills.ts:60-63` (`missionOf`) returns 0 for `4-D`, `5-M`, `S-1`, so `learnedSkills(stageId)` grants those stages nothing by
  position; only the tester's unlock switch reaches them without the skills cleared.
- Assist speed (`engine.ts:721`, `:1310`) scales the stage clock too: at 0.8 a timed stage's limit is 25% longer in real time and
  the best time is kept in slowed seconds, with no mark on the record (`stageBest.ts` marks only Easy/Normal).
- Outside this slice: `bossPlay.ts:136-138` calls `localStorage.clear()` in its constructor (a test harness; make sure nothing in
  the app bundle imports it).
