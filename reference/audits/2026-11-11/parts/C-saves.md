# Engine audit C, slice "saves": the save shape, the menus, the story player

Branch t-audit-engine-c, 2026-11-11. 12 findings, most severe first. Tests are in `reference/audits/2026-11-11/tests-c/saves-*.test.ts`
(7 assertions, all failing today for the reason stated). None of the 12 is on `reference/ROADMAP.md` (grepped: save file, damaged, carved,
New Game, guardian's card, medal row, first note, Back, pause/load, install); where an R-item will replace the code it is named.

Storage keys, for reference (grep of `localStorage` / `sessionStorage` in src, tests left out):

| Class | Keys | Writers | In save file | Cleared by New Game |
|---|---|---|---|---|
| Adventure, on the allow-list (saveFile.ts:26-48) | `sloth_lvl_<id>` (App.tsx:1013), `sloth_play_<id>` (playRecords.ts:135), `sloth_layout_<id>` (layoutMemory.ts:66,89), `sloth_story_w/m/n/g<n>` (App.tsx:79,96,119,124,152), `sloth_way_<w>-<m>` (wayside.ts:392), `sloth_secret_gate`, `sloth_thorn_heart` (secret.ts:41), `sloth_badges`, `sloth_cosmetic` (badgeStore.ts:43,67), `sloth_finds` (finds.ts:396), `sloth_memories` (storyChapters.ts:88), `sloth_difficulty`, `sloth_ease_in` (difficulty.ts:43,55,95), `sloth_w5_cakes` (w5Kit.ts), `sloth_w5_carved` (meecaCarved.ts) | one writer each | yes | yes |
| Sound, on the allow-list but kept by New Game (saveFile.ts:190) | `sloth_music_vol`, `sloth_sfx_vol`, `sloth_game_muted` (conductor.ts:57) | conductor | yes | no |
| Dot's memory (dotMemory.ts:8) | `sloth_tips_<id>`, `sloth_lessons`, `sloth_dot_seen`, `sloth_dot_moves`, plus `sloth_dot_help` | tipMemory, lessons, dotGuideHelp | no | yes |
| Adventure, on NO list (finding 8) | `sloth_story_b<w>` (App.tsx:138), `sloth_seed_<stage>_<n>` (protoStage.ts:6845), `sloth_dot_silk` (dotFlightRun.ts:41), `sloth_flag_resume` (flagResume.ts:29), `sloth_dot_skip_offered`, `sloth_journal_told/looked` (movesJournal.ts:409), `sloth_play11_order` (testlink1_1.ts:56) | one writer each | no | no |
| Device | `sloth_ctl_*`, `sloth_assist_*`, `sloth_jump_help`, `sloth_shake`, `sloth_haptics`, `sloth_show_touches`, `sloth_wayside_off`, `sloth_fullscreen`, `sloth_fs_tip`, `sloth_howto_seen`, `sloth_coach_done`, `sloth_slowtip_shown`, `sloth_perf`, `sloth_polish`, `sloth_rim`, `sloth_test_unlock`, `sloth_ctest_name`, `sloth_qa_tester_id`, `story_reader_pos`; session: `sloth_update_applied_at` | one writer each | no | no |
| Read, never written | `sloth_lvl_S-1` (Satchel.tsx:88; finding 12) | none | - | - |

Store build: the recorder's upload is stripped and checked (playRecorder.ts:33-38, 87-88, 458; main.tsx:22; updates.ts:44; UpdateControls.tsx:20,83;
newLookSoon.ts:11; tools/store/checkStoreBuild.mjs bans the collector address, `sendBeacon` and any outside address). No finding there.

---

## 1. HIGH, CONFIRMED (test): the game's own save file is refused on load once Meeca's stage is cleared, or at 34 finds

- `src/game/saveFile.ts:19` `const MAX_ENTRY_CHARS = 400;`, `:23` (only `sloth_badges` and `sloth_play_*` get more), `:152`
  `if (typeof v !== 'string' || v.length > entryLimit(k)) return { ok: false, reason: 'The save contains damaged entries.' };`
- The writers make longer entries: `src/game/meecaPlay.ts:752` + `meecaCarved.ts:77-90` (`sloth_w5_carved` is 385 characters after four
  warnings, 463-483 after the fifth); `src/game/finds.ts:393-396` (`sloth_finds` is 408 characters at the 34th of 47 finds, 554 with all).
- Failure: Meeca's stage 5-M sits between 4-10 and 5-1 (extraStages.ts:72-73) and must be cleared to open World 5. From then on
  "Save to file" and "Copy save code" still work, and every later "Load" of that file answers "The save contains damaged entries."
  The New Game card sends the player to make exactly this backup before it erases the game (NewGameDialog.tsx `onBackup`), so
  "back up, start over, change my mind" loses the adventure for good. Same for moving to a new phone.
- Proof: `saves-file-limits.test.ts`, both tests fail:
  `sloth_w5_carved is 481 characters: The save contains damaged entries.` /
  `sloth_finds is 554 characters with 47 finds: The save contains damaged entries.`
- Guards checked: `parseSave` is the only reader (SaveLoadDialog.tsx:91); `MAX_SAVE_BYTES` (200 KB) is not the limit that trips;
  `src/game/saveFile.test.ts` never builds a save through the real writers.
- Roadmap: not tracked. Not being replaced.
- Root fix: drop the per-key guesses: one generous per-entry limit (a few KB) under the 200 KB file cap, and a test that fills a store
  through every real writer at its largest (all finds, five carvings, every medal, 102 play records) and round-trips it. Size S.

## 2. MED, CONFIRMED (line pair): a pause that lands while a stage is loading is forgotten, and the stage then runs behind the pause menu

- `src/App.tsx:840` `setScreen('playing');` is set at the tap; the engine is only built at `:863` (after `readyToStart` and a 20 ms
  timer) and started at `:987` after `readyBuiltStage(... launchAt + READY_MS)` (stageReady.ts:45, up to 6.5 s).
- `src/App.tsx:1064-1068` `pauseGame`: `engineRef.current?.pause(); ... setScreen('paused');` With no engine yet, nothing is paused.
- `src/App.tsx:983-987` `go`: `if (seq !== launchSeq.current || engineRef.current !== engine) return; ... engine.start();` It never
  asks whether the pause menu came up meanwhile.
- Failure: during the load the player presses Android Back (App.tsx:559), locks the phone or switches apps (App.tsx:488-498,
  576-578), or a call comes in. The pause menu shows; when the sheets finish, `engine.start()` runs the stage live under it: the clock
  of a timed stage, a chase, the rising tide in 6-8 or a guardian plays on against a Pokey nobody is steering, and a Game Over card
  can replace the pause menu.
- Guards checked: `launchSeq` only moves in `launchEngine` and in the release effect (App.tsx:478-482), and 'paused' is not a
  releasing screen (screenFlow.ts `stageHeld`); `engine.start()` (engine.ts:1148-1171) has no paused or hidden check; `resumeAction`
  only decides what Resume does.
- Roadmap: not tracked. Root fix: keep "paused while loading" in a ref beside `launchSeq`, and have `go` start the engine paused
  (start, then pause before the first frame) when it is set. Add the case to `screenFlow.test.ts` as a pure rule. Size S.

## 3. MED, CONFIRMED (line pair): New Game and Load leave the old game's journal records and seen-memories in memory, and write them back

- `src/App.tsx:204-218` (`onSaveLoaded`) and `:224-237` (`onNewGame`) re-read levels, secret, hearts, badges, cosmetic, finds and
  skills from storage. Neither touches `playRecords` (`:346`) or `memoriesSeen` (`:352`), and there is no page reload.
- `src/App.tsx:401-402` `const rec = withRun(playRecords[stats.id] ?? null, stats, ...); savePlayRecord(stats.id, rec);`
  `withRun` keeps an existing `first` (playRecords.ts:91) "as it happened".
- `src/App.tsx:1316` `nextAfterBoss(activeLevel.worldIndex, memoriesSeen)`; `:355-357` saves `withMemory(cur, id)` built on the stale list.
- Failure A: finish some stages, New Game, clear 1-1. The new game's journal entry for 1-1 is the OLD game's first clear (old time,
  old medals, old date, play count carried on), now written back into `sloth_play_1-1` for good. The Satchel also shows the old
  records for stages the new game has not reached, until the app restarts.
- Failure B: New Game (or Load of an earlier save) after a game that had seen the flashbacks: for the rest of the session no
  after-guardian flashback plays (the stale list says they were seen), and the first new memory saved writes the old list into the
  new save, so those scenes never auto-play in it.
- Guards checked: `resetProgress` does clear `sloth_play_*` and `sloth_memories` in storage (they are on the allow-list); the leak is
  only the React state. `setPlayRecords` / `setMemoriesSeen` have no other callers (grep).
- Roadmap: not tracked. Root fix: one `reloadFromStorage()` that both handlers call and that sets every storage-backed state (add
  `setPlayRecords(loadPlayRecords())`, `setMemoriesSeen(loadMemories())`, clear `lastStats`, `failsRef`, `freshBadges`), so a state
  added later cannot be forgotten in one of two hand-kept lists. Size S.

## 4. MED, CONFIRMED (line pair): the Fortress Gate scene and the guardian's card share one save key, so the last guardian's card never shows

- `src/App.tsx:109` `const guardianCardKey = (lvl: LevelConfig) => \`sloth_story_g${lvl.secret ? 11 : lvl.worldIndex}\`;`
- `src/App.tsx:142` `const gateStoryKey = (w: number) => \`sloth_story_g${w}\`;`
- Failure: clearing 10-9 plays the gate scene, whose end writes `sloth_story_g10` (`:1265`). At 10-10 the intro ends with
  `if (hasSeenGuardianCard(activeLevel)) launchEngine(activeLevel); else setBossCard(true);` (`:1283-1284`): the key is already '1', so
  General Iron-Claw's card (his crest, Dot's line, "Let's go!") is skipped for every player who plays in order. The other way round
  (10-10 entered first with the tester's unlock) the gate scene never plays.
- Guards checked: `WORLD_GATE` has only World 10 today (storyWorlds.ts:482), so only World 10 collides.
- Overlap: the boss auditor proved the same collision (`tests-c/boss-card-key-collides-with-gate-scene.test.ts`); count it once.
- Roadmap: R-4.1 "generalise WORLD_GATE" to 17 stages. That makes this collide in every world it adds a gate to, and a slot before a
  stage other than 9 cannot be keyed by world at all. Fix it inside R-4.1 (wait for replacement), but it must be on R-4.1's list:
  a separate letter for the card, keys by stage id, and each new letter added to saveFile.ts ALLOWED (finding 8). Size S.

## 5. MED, CONFIRMED (line pair): in the finale's two-thumb picture no button can be tapped, and on Normal its prompt goes away after one try

- `src/components/StoryPlayer.tsx:259-262` on the story's root element, for every touch: `if (e.cancelable) e.preventDefault();`
  (a prevented touchstart makes no click). The Skip chip (`:487`) and Back (`:455`) are inside that root; Next is not drawn
  (`:459 {!hold && ...}`) and a tap does nothing (`:382 if (hold) return;`).
- `src/components/StoryPlayer.tsx:323` `const showPrompt = !!hold && phase !== 'reach' && (isEasy() || tries.current === 0);`
- Failure (the ending, storyFinale.ts:160-164, after the World 10 guardian; also its replay from the Satchel): a player on Normal
  puts two thumbs down, lifts one, then lets go of both before the 2.7 s are up (LETGO, storyHold.ts). `tries` is 1, the words
  "Hold on with both thumbs" fade out for good, and the screen is a still picture where Skip, Back and taps all do nothing. On the
  web and on an iPhone the only way out is to reload. In the Android app Back skips the whole rest of the ending (Escape,
  `:408-409`). A one-handed player can never pass it by touch.
- Guards checked: no pointer or key path reaches Skip on a touch screen; `touchy` (`:88`) only removes the hold where there is no
  touch screen at all; `storyHold.test.ts` covers `holdStep` only.
- Roadmap: R-4.6 rewrites the finale's words and R-4.8 (update 1.1) adds more played pictures on this same mechanism; the mechanism
  itself is not being replaced. Root fix: do not swallow touches that start on a button (`closest('button')`), keep the prompt up
  whenever the scene is waiting, and give a played picture a "Skip this" after N seconds. Size S.

## 6. MED, CONFIRMED (line pair): Android Back does nothing on the guardian's card and on the ending card

- `src/App.tsx:555-569`: Back asks the back stack, then handles playing, paused, victory, game_over, world_map and title, and for
  every other screen sends an Escape key (`else esc();`).
- `src/components/BossCards.tsx:57-97` (`BossIntroCard`, shown at `screen === 'boss_intro' && bossCard`, App.tsx:1289) and `:145-180`
  (`EndingCard`, `screen === 'story_ending'`): neither calls `useBack` nor listens for a key, and App's key handler
  (App.tsx:614-660) has no branch for either screen. The Escape goes nowhere.
- Failure: on "Guardian ahead" and on "The End" the phone's Back button and the back gesture are dead (PLAY-STORE-RULES §4 "Standard
  Back", §6.2). The comment at App.tsx:551 says "the end cards go to the map".
- Also on the guardian's card: `BossCards.tsx:94` prints "Space or Enter to start the fight" on a non-touch screen, and no code
  handles those keys there.
- Overlap: the boss auditor has the guardian's card half (`tests-c/boss-card-android-back.test.ts`); the ending card is only here.
- Guards checked: every `useBack` caller (FindReader, HowToPlay, MenuFrame, ModePick, NewGameDialog, SaveLoadDialog,
  TitleSettings, Nav's BackButton, Popup and ConfirmDialog); the story screens are covered by StoryPlayer's own Escape.
- Roadmap: not tracked (R-147.3/.6 do not name it). Root fix: the general rule is "a screen with no back-stack entry and no rule in
  `androidBack` is a bug": add `useBack` to both cards (card: start the fight or go back to the map; ending: to the map), and a
  test over `GameScreen` that every screen has a Back rule. Size S.

## 7. MED, SUSPECT (strong; one real stage clear confirms it): medals earned on a clear never come in on the stage-cleared card

- `src/components/StageCleared.tsx:120-146`: the card's clock effect runs once (`[]`), and reads `hasMedals` as it was when the
  card mounted: `const end = hasMedals ? medalsAtMs(stars) : Math.max(COUNT_START_MS + COUNT_MS, ...starTimes(stars));` and the
  medal chime is only scheduled `if (hasMedals)`. The loop stops at `end + 50` and sets `done.current = true`; `skip()` then
  returns at once (`:152 if (done.current) return;`).
- `src/App.tsx:386-409`: the medals are worked out in App's own effect on the render where `screen` becomes 'victory', and only then
  `setFreshBadges(...)`. A child's effect runs before its parent's, so the card has already started its clock with `medals` empty.
- `src/components/hud/cleared.css:77-78` `.clr-medals { ... opacity: 0; }` `.clr-medals.in { opacity: 1; }`; `in` needs
  `ms >= medalsAtMs(stars)` (StageCleared.tsx:184). With three stars the clock stops at 2200 ms and the medals are due at 2570
  (countUp.ts:12-20); with one star 1640 against 2010.
- Failure: clear a stage that earns a medal (the first clear of 1-1): the card keeps a blank 38 px row where the medals should
  land, no chime, and a tap after the count has ended does not bring them in. Leaving the card clears `freshBadges` (App.tsx:440-444)
  so no toast follows either: the medal is filed silently.
- Why QA would not see it: the dev hook sets the medals BEFORE the screen (`App.tsx:738-739`), and a stage that teaches a skill
  mounts the card later (App.tsx:1529), so both of those show the row.
- Roadmap: not tracked. Root fix: make the clock follow the medals (restart or extend it when `hasMedals` turns true), or award
  before the screen changes (in `onVictory`, not in an effect). Size S.

## 8. MED, CONFIRMED (test): the save allow-list is kept by hand, and keys that belong to one adventure are on no list

- `src/game/saveFile.ts:30` `/^sloth_story_[wmng]\d{1,2}$/` against `src/App.tsx:128` `const bossIntroKey = (w: number) => \`sloth_story_b${w}\`;`
  read at `:1277` to cut the intro to `RETRY_INTRO_LINES = { 10: 2 }` (storyBosses.ts:216, a one-world special).
- Failure A: a second adventure on the same phone (New Game after meeting the General once): his nine-line argument, the scene the
  whole story builds to, opens as two lines the FIRST time that player meets him.
- Failure B: `sloth_seed_<stage>_<n>` (protoStage.ts:6835-6849; engine.ts:2977-2984): after a New Game every golden seed reads
  "GOLDEN SEED (found before)" for 200 instead of "SECRET!" for 1000, and a save file carries none of them. Same shape, smaller:
  `sloth_dot_silk`, `sloth_dot_skip_offered`, `sloth_journal_told/looked`, `sloth_flag_resume`, `sloth_play11_order`.
- Failure C, the opposite mistake: `saveFile.ts:34-36` puts the three sound keys in the file and `applySave` (`:179`) deletes the
  phone's own before writing the file's, while `:189` says they "belong to the device, not to an adventure". A parent mutes the
  game, the child loads a save: the mute is gone at the next launch. And the conductor only reads them when it is made
  (`src/audio/conductor.ts:113-121`), so a loaded file's sound settings do nothing until the next launch, then change the sound
  with nobody touching it.
- Proof: `saves-newgame-leftovers.test.ts` (3 fail: `sloth_story_b10 is not on the save allow-list`, `sloth_story_b10 survived a
  New Game`, the golden seed `'1' !== null`) and `saves-load-apply.test.ts` test 2 (`null !== 'true'`).
- Overlap: Failure A is also the boss auditor's (`tests-c/boss-intro-seen-survives-new-game.test.ts`); B, C and the root fix are only here.
- Guards checked: `DOT_MEMORY` (dotMemory.ts:8) covers tips, lessons, dot_seen, dot_moves only; flag resume is safe against a wrong
  layout (engine.ts:5223-5225 needs a real flag within 2 px).
- Roadmap: R-4.1 replaces the retry rule ("retries as a line list"): for the `b` key, wait for replacement, but its new keys need
  the same care. Root fix: one table of every `sloth_` key with its class (adventure / Dot's memory / device), the allow-list and
  the New Game sweep built from it, and a test that greps src for `sloth_` literals and fails on one that is not in the table. Size M.

## 9. MED, CONFIRMED (line pair): a new player who opens the World Map first gets the after-1-1 scene before 1-1, never the prologue, and the same scene again after 1-1

- `src/App.tsx:83-85`: "World 1's arrival scene (Dot's return and Meeca's first note) plays once, after stage 1-1 is first cleared",
  done at `:948-951`.
- `src/App.tsx:677` `if (lvl.miniIndex === 1 && !hasSeenWorldStory(lvl.worldIndex)) { setScreen('world_story');` has no exception
  for World 1, whose seen-flag is only set by the prologue (`:1228`) or by this very scene (`:811`).
- Failure: fresh install, tap "World Map" (TitleScreen.tsx:246, allowed: `goOn(onOpenMap, true)`), pick Easy or Normal, tap 1-1.
  `startLevel` plays `WORLD_STORIES[1]` ("The First Note", listed in the Satchel as "Clear the first stage") as the opening; the
  prologue (who Pokey and Meeca are) never plays; after 1-1 `!hasSeenFirstNote()` is still true and the same scene plays again.
  tools/perf/clipcheck.mjs:493 already works around it ("a fresh save's autostart opens World 1's story first").
- Second door, keyboard only: `src/App.tsx:629-631` Space or Enter on the title calls `startLevel(resumeLevel)` directly, past the
  how-to, the Easy/Normal card (LV-19) and the prologue that the button's `goOn` gives (TitleScreen.tsx:183-191).
- Roadmap: R-4.1 re-plumbs the story slots ("a before-a-stage slot", "old-save unlocks"); fix it there, and list it. Root fix: one
  function `storyBefore(lvl, save)` / `storyAfter(lvl, save)` that every way into a stage goes through (title, map, key, autostart);
  for World 1 the before-slot is the prologue. Size S.

## 10. MED, CONFIRMED (test for the load; line pairs for the rest): on a full or failing storage the game deletes or drops progress and says it is saved

- `src/game/saveFile.ts:178-181` `applySave`: `for (const k of store.keys()) if (isSaveKey(k)) store.removeItem(k);` then the
  writes, with no copy kept. `saves-load-apply.test.ts` test 1 fails: after a write that throws, `sloth_lvl_2-5` is `null`
  ("the old game was deleted before the new one was safely written"). The card then says "Could not write the save into this
  browser." (SaveLoadDialog.tsx:122) while App still shows the old game from memory; at the next launch neither game is there.
- `src/App.tsx:1013` `localStorage.setItem(...)` inside `try { ... } catch { /* storage full or blocked: the stage still counts for
  this session */ }` (`:1017-1019`), then `:1022-1042` marks the stage cleared and the next one open in memory regardless. The same
  silent catch is in every writer (badgeStore.ts:44, finds.ts:397, storyChapters.ts:89, playRecords.ts:136, App.tsx:80,97,120,125,139,153).
- `src/App.tsx:1520` `body="Your progress is saved."` is said without checking.
- A third loss on a kill: `src/App.tsx:389` holds a clear's stats until the 'victory' screen, which comes AFTER the first-note,
  halfway and gate scenes (`:948-959`). The stage result is written before the scene (good), but a kill during the scene loses that
  run's journal entry and medal counters, and the scene's seen-flag, so the scene is not offered again until that stage is replayed.
- Failure: PLAY-STORE-RULES §6.8 ("Saves survive everything: ... a full phone"). A child plays a whole session on a phone whose
  storage is failing, every card says cleared, the leave card says saved, and the next launch is back where it started.
- Roadmap: not tracked (R-147.7 is the offline and low-memory test, blocked). Root fix: one `saveWrite(key, value)` that every
  writer uses, which records a failure; a small "Could not save" plaque on the stage-cleared card and an honest leave card;
  `applySave` writes first to a snapshot it can restore. Size M.

## 11. MED, CONFIRMED (line pairs): the clip gate never opens a story or any card of a run, and those screens hold tap targets under 44 px and outside the safe area

- `tools/perf/clipcheck.mjs:16-21` lists what it visits: start screen, Settings, About, How to Play, World Map, Satchel, Journal,
  Pause, Dot's first tip, the testers' link. Not visited: StoryPlayer (every cutscene, its title card, the two-thumb prompt, the
  closing plaque), StageCleared, GameOverCard and its extra-lives offer, SkillLearned, BossIntroCard, EndingCard, LessonCard,
  BadgeToast, the slow-phone tip, "Leave the game?", Save & Load's confirm and error states. The dev hooks to open most of them
  already exist (`__win`, `__kill`, `__story`, `__medals`: App.tsx:709-745).
- Story Skip: `src/components/StoryPlayer.tsx:485-487` `className="absolute inset-x-0 top-0 ... px-3 sm:px-5 pt-2.5"` with
  `.ui-chip { ... padding: 6px 13px; ... font-size: 12px; }` (`src/index.css:79`): about 32 px tall, 10 px from the top and 12 px from
  the side with no `env(safe-area-inset-*)` (the page is `viewport-fit=cover`, index.html:5). Sideways it sits in the notch band.
  PLAY-STORE-RULES §4 names this very button ("The story Skip under the Wi-Fi icon broke this").
- Story Back: `src/index.css:234` `.sp-back { ... padding: 6px 12px; ... font-size: 12px; }`, about 32 px.
- Game Over, sideways on a phone: `src/index.css:471` (`max-height: 520px`) `.clr-btn2 { min-height: 38px; }` and `:499`
  (`max-height: 400px`) `{ min-height: 32px; }`; only the WON card is put back to 44 (`src/components/hud/cleared.css:26`). The
  extra-lives offer: `src/index.css:439` `.clr-help .clr-btn2 { min-height: 40px; }`. The guardian's "Let's go!": `:495-500`
  `.clr-main .pm-go { min-height: 40px; }`.
- Roadmap: R-147.6 (48 dp hit areas, "verify") is the family, with no list of these. Root fix: add the missing screens to clipcheck
  through the dev hooks on the three seeded saves, both ways up, then fix what it prints (the list in clipknown.json may not grow,
  so fix in the same change). Size M.

## 12. LOW, CONFIRMED (line pairs): old paths that "new replaces old" should have deleted, one of which still acts

- `src/App.tsx:248-255` calls `usePWAInstall()` and uses none of the six things it returns (`isInstalled` and the rest appear
  nowhere else in App.tsx); TitleScreen is never given `onInstallDesktop`, so the Install row (`TitleSettings.tsx:163-170`) cannot
  show. But the hook still runs `src/utils/usePWAInstall.ts:24-26` `e.preventDefault(); setDeferredPrompt(...)` on
  `beforeinstallprompt`: on the web it swallows Chrome's own install offer and offers nothing in its place. It also carries a second,
  unreachable save exporter (`saveProgressToDesktop`, every `sloth_` key, no checksum) and `saveSnapshotToDesktop`. `showInstallGuide`
  (App.tsx:184) is never read.
- `src/App.tsx:1574-1577` passes `onViewStory` to StatusModals, which declares it (`StatusModals.tsx:47`) and never uses it.
- `src/components/Satchel.tsx:88` reads `sloth_lvl_S-1` `?.stars || 3`; nothing writes it (`src/App.tsx:931-938` returns for the secret
  stage before `saveLevelProgress`), so Thornbark's journal entry is always three stars whatever was earned, and his best time and
  score are never kept.
- `src/game/saveFile.ts:156-159`: an `if` with an empty body.
- Roadmap: not tracked. Root fix: delete the hook, the prop and the state; either save Thornbark's result or stop reading it. Size S.

---

## Outside this slice (one line each, not chased)

- `src/game/testlink1_1.ts` (`playSeed`, module memory) and `src/game/layoutMemory.ts` both decide 1-1's layout; a 1-1 run the
  phone killed cannot come back at its flag because the seed drawn at the map's Play is gone (engine.ts:5223-5225 then starts at the
  beginning). `WorldMap.tsx:350` and `App.tsx:758,925` carry `'1-1'` special cases for it. R-165 owner.
- `src/game/engine.ts:5222-5236` `startAtFlag` puts him at the flag but restores nothing collected before it (keys, flowers, freed
  friends): check flags that sit past a locked gate. Engine-internals auditor.
- `src/game/extraStages.ts:17` `newStagesOn()` is `typeof location !== 'undefined'`: the unit tests build 100 stages, the game 102.
- `src/game/saveFile.ts:110` `summarize` does not count the extra stages (4-D, 5-M) in "Stages cleared".
