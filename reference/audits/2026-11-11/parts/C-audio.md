# Engine audit C: audio slice (sound, music, voice, haptics)

Branch `t-audit-engine-c` at `ccfbd8ac`. 11 findings, most severe first. Tests are in `reference/audits/2026-11-11/tests-c/` (prefix `audio-`); each asserts the correct behaviour and fails today. None of these is on `reference/ROADMAP.md` (R-145.1..6 cover levels, phone ambience, an iPhone fallback, effect family, more loops; grep for heartbeat / focus / sting / muted found nothing).

What was checked and is fine (so nobody re-derives it): no `<audio>`/`<video>`/speech synthesis anywhere, all sound goes through the one `AudioContext`; `visibilitychange` suspends it and the Capacitor `pause` event does the same in the app (`conductor.ts:220-236`, `App.tsx:585-590`); the recorded music has no JS scheduler (looping buffer sources), `fx()`/`sting()`/`speak()` all drop sounds while the context is not running, so there is no burst on return; the low-health heartbeat is cleared on stage stop and stage end (`engine.ts:1272`, `3375`); every asset URL comes from `import.meta.glob` (nothing remote); `LoopPlayer.play` dedupes a piece that is still loading.

---

## 1. Android audio focus: taken even when the game is muted, and a permanent loss never comes back while the game is in front
- **Where:** `android/app/src/main/java/com/mshaffe1111/slothadventure/MainActivity.java:53-75` (onResume), `:44-50` (listener); `src/App.tsx:596-600`; `src/audio/conductor.ts:194`, `:220-224`.
- **Wrong:** (a) `onResume` always calls `requestAudioFocus(AUDIOFOCUS_GAIN)`; the page never tells native whether sound is on. A muted game still stops the player's own music or podcast every time it comes to the front. (b) `AUDIOFOCUS_LOSS` (permanent) is mapped to `"lost"`, which sets `appAway` and suspends the context; Android sends no gain after a permanent loss, and the only re-request is the next `onResume`. `unlock()` refuses to resume while `appAway` (`conductor.ts:194`), so no tap brings sound back. (c) when the request is not granted (a call in progress) nothing is sent (`:74` has no else), so the page believes it holds focus and plays over the call.
- **Scenario:** (a) player mutes the game to listen to a podcast, opens the game: podcast stops. (b) player pulls the shade down mid-stage and presses play on a music app (the activity stays resumed): game goes silent; they stop the music: game stays silent until they leave the app and return; the Sound setting still reads on.
- **Proof (line pair, a):** `reference/PLAY-STORE-RULES.md:60` "Ask for it when sound starts, let go when it stops" vs `MainActivity.java:69` `granted = audio.requestAudioFocus(focusRequest);` in an unconditional `onResume`. (b) and (c) are read from the Android contract, not run.
- **Status:** (a) CONFIRMED (line pair); (b), (c) SUSPECT (needs a device).
- **Roadmap:** not tracked. Not being replaced.
- **Root fix:** one native plugin call `setWantsSound(on)` driven from the conductor (not muted and context wanted): request focus when it turns on and on resume only if on, abandon when off; on a permanent loss, re-request on the next tap (the existing `unlock(fromTap)` path) and send `"lost"` when a request is refused. **M.**
- **Severity:** MED (Play §4 audio focus; hits exactly the players who play with their own audio).

## 2. Every screen change releases a sting's music duck: the Game Over card brings the music up under a 12 s defeat sting
- **Where:** `src/game/audio.ts:98` (`this.c.setPaused(screen === 'paused')`, on every screen change); `src/audio/conductor.ts:504-505` (pause writes `musicDuck`), `:360-368` and `:427` (the sting's duck writes the same gain); `src/game/engine.ts:4973`; `src/components/StatusModals.tsx:144`.
- **Wrong:** the pause level and the sting duck share one gain (`core.musicDuck`). `setPaused(false)` cancels its schedule and targets 1 in 0.12 s, and `screen()` calls it for every screen, paused or not. `core.ts:47` gave speech its own gain "so a sting's deeper duck is never undone by a line"; the screen change undoes it instead. Stings also cannot be stopped once started.
- **Scenario:** last life lost: `playDefeat()` ducks the music to 0.12 for 10.5 s (the sting is 12.1 s). 0.75 s later (`DOWN_SECS`) the Game Over card goes up, `sound.screen('game_over')` releases the duck and crossfades in `gameover~s` at full level under the remaining 11 s of the sting. Tap Continue and the stage tune plays at full under it too. Same for Victory (6.7 s sting) -> Next within 6 s, and the boss victory sting (9.2 s) -> the next screen.
- **Proof (test):** `audio-screen-change-clobbers.test.ts` test 1: `3 s into a 12 s sting the music is still ducked (it is at 1.00 of full)`.
- **Status:** CONFIRMED.
- **Roadmap:** not tracked (R-145.1 re-levels effects, a different thing). Not being replaced.
- **Root fix:** give the pause its own gain node (as speech and the story have), and call `setPaused` only when the paused state changes; let a screen change that picks a new piece fade the running sting's bus out. **S.**
- **Severity:** MED (every game over; two pieces of music at once for ~10 s).

## 3. "Paused" for the sound means the 'paused' screen only: the satchel opened from the pause menu un-pauses it
- **Where:** `src/game/audio.ts:93-98`; `src/components/screenFlow.ts:33-37` (`stageHeld`: the stage is only paused under 'satchel' and 'memory'); `src/audio/conductor.ts:642-645` (heartbeat), `:495-508`; `src/audio/scenes.ts:187-196`.
- **Wrong:** two definitions of "the stage is paused": the app's (`stageHeld`) and the sound's (`screen === 'paused'`). In the satchel over a paused stage the conductor is told `setPaused(false)` while the engine still holds `lowHealth = true`; and `'paused'` returns `null` ("keep what is playing"), which after the satchel is the satchel's loop.
- **Scenario:** last life, last heart -> Pause -> Satchel: the low-health heartbeat thumps every 1.15 s over the satchel (and over a replayed memory), the filter opens and the ambience returns to full. Back to the pause menu: it now plays the satchel's `menu` loop muffled, not the stage's tune (SN-6 says the stage's own tune goes on under the pause menu); on Resume the stage piece has to be decoded again (only two pieces are kept), so the menu loop plays into the stage for a second or more on a phone.
- **Proof (tests):** same file, test 2: `no heartbeat in the satchel over a paused stage: 1 !== 0`; test 4: `and still does after a look in the satchel: + 'menu' - 'gen-1-3795832631-r'`.
- **Status:** CONFIRMED.
- **Roadmap:** not tracked. Not being replaced.
- **Root fix:** pass the sound the same fact the app uses (`stageHeld(screen, hold)`), keep the conductor paused while it is true, and have `'paused'` restore the stage's piece rather than "keep what is playing". **S.**
- **Severity:** MED (uncommon state for the heartbeat; the wrong pause-menu tune is every satchel visit from pause).

## 4. The story's storm rule is keyed to a chapter title no story has: no thunderstorm in 120 storm pictures, and 13 recorded pieces (12.3 MB) can never play
- **Where:** `src/game/audio.ts:109` (`panel.chapter.toUpperCase().startsWith('THE STORM') ? 'thunderstorm' : 'gentle_breeze'`); `src/audio/scenes.ts:54-70` (the chapter-title table: PROLOGUE, MEMORY, THE SONG, THE REVEAL, THE MERCY, THE STORM, THE VOW, WORLD n...).
- **Wrong:** a special case on a title string. The storm scenes are now `THE CHASE` and `THE VOW` (`storyIntro.ts:81,89`, mood 'storm', rain) and `THE TOWER` (`storyFinale.ts:155`, rain, directed "after the fight: only the storm"); none starts "THE STORM", so the ambience rule always answers `gentle_breeze`. The title table is only read for a panel without a cue (86 of 939), and none of those has these titles, so `jennifur`, `storyDusk`, `storyStorm`, `score_triumph` and `world1..7,9,10~c` are packed and unreachable: 13 of 60 pieces, 12.25 of 56.2 MB of music.
- **General rule:** the ambience (and any fallback piece) should come from the panel's own scene data (`scene.mood === 'storm'`, `particles: 'rain'`, its world), never from its title.
- **Proof (tests):** `audio-story-storm-dead.test.ts` test 1: `of 120 storm pictures, the ambience asked for was [["gentle_breeze",120]]`; test 2 lists the 13 pieces nothing asks for.
- **Status:** CONFIRMED.
- **Roadmap:** not tracked. R-4 (story rewrite) will change titles and cues again: fix the rule (mood, not title) now, it is plumbing; decide the 13 pieces (wire or delete) with R-4 / R-145.5.
- **Root fix:** `storyPanel` picks the ambience from `panel.scene.mood`; delete the title table (every panel that needs a piece has a cue or a mood); drop or re-home the unreachable recordings; keep test 2 as a gate. **S** (rule) + **S** (assets).
- **Severity:** MED (the finale's "only the storm" has a gentle breeze; 12 MB of dead weight in the store build).

## 5. The screen-change effect overrides the story's first picture: its silence, its ambience and its held piece
- **Where:** `src/App.tsx:518-528` (effect on `[screen, activeLevel, musicSalt]`) -> `src/game/audio.ts:90-91` (`this.held = null; this.c.storyMusic('keep')`) and `App.tsx:525-527`; `src/components/StoryPlayer.tsx:165-168` (`sound.storyPanel(panel); sound.storyMusic(dir.music)`).
- **Wrong:** two writers of three slots (the story's music level, the ambience, the held story piece). On the commit that mounts a story the child's effect runs first and the parent's second, so App's `screen()` wins for the first picture; from the second picture on StoryPlayer wins (so `App.tsx:525`'s world ambience for `world_story`/`world_mid`/`world_gate`/`boss_intro`/`boss_defeat` lasts one picture and then becomes `gentle_breeze`, and on `ending_story` the first picture gets `setAmbient(null)`).
- **Scenario:** the finale opens on "The General lay in the rubble..." directed `music: 'silence'` (`storyDirect.ts:176`): the music is put back to full at once and plays through the picture. Five stories open on a picture that is not `keep`: the finale and the old ending (silence), World 10's mid scene, World 10's boss defeat and the `door` memory (under).
- **Proof (test):** `audio-screen-change-clobbers.test.ts` test 3, replaying the two calls in React's order (child effect, then parent): `5 s into the silent picture the story's music level is 1.00 (asked for 0)`. The order itself is React's rule (not run here: the repo has no DOM renderer); checked that StoryPlayer is imported statically (`App.tsx:29`), not lazily, so both effects are in one commit.
- **Status:** CONFIRMED (the override, by test); the commit order is by reading.
- **Roadmap:** not tracked. R-4 rewrites the script, not this plumbing.
- **Root fix:** `sound.screen()` leaves story screens alone (no `storyMusic('keep')`, no ambience, no `held = null` when the screen is a story screen); the story player owns all three while it is up and hands back on unmount. Delete `App.tsx:525-526`. **S.**
- **Severity:** MED (the two biggest directed silences in the game are the ones lost).

## 6. A speaker's voice sounds at the picture change, before the title card and the beat, and again when the words start
- **Where:** `src/components/StoryPlayer.tsx:147` (`setShown(0)` inside the typewriter effect) and `:188-198` (the voice effect); `src/audio/voiceLine.ts:85-93`.
- **Wrong:** on the render that changes the picture `shown` is still the last line's count (it is reset in an effect, unlike the page, which is derived: `:125-127`). The reset effect sets `spoken.current = 0`, then the voice effect runs `for (i = 0; i < shown(old); i++) sound.speak(newSpeaker, newText, i)`. `Speech.next` sees a new text, finds letter 0 due and plays it. Nothing in `conductor.speak` or `Speech` knows the letter is not on screen. When the text does start, letter 0 is due again (`syllableAt` only applies `lastAt` inside a word) and plays a second time.
- **Scenario:** "Pokey: We stopped for tea." is directed beat 1500 ms, music silence (`storyDirect.ts:169`): his voice blips at the cut, 1.5 s before the words, in the middle of the silence. On a chapter change the blip is under the title card, 2.6 s plus the beat early.
- **Proof (line pair):** `StoryPlayer.tsx:171` "(The first pass for a new panel still holds the last panel's card and typing state, so it never counts.)" (written for the sting, which guards it with `stingDue({ fresh })`) vs `:194-197` `const from = spoken.current; spoken.current = shown; ... for (let i = from; i < shown; i++) sound.speak(panel.speaker, text, i, dir.tone);` with no such guard.
- **Status:** CONFIRMED by line pair (not run: no DOM renderer in the repo to mount the component).
- **Roadmap:** not tracked. StoryPlayer survives R-4.
- **Root fix:** derive `shown` per picture the way `page` is (`shownAt.idx === idx && shownAt.page === page ? n : 0`), so no effect ever sees another line's count. **S.**
- **Severity:** MED/LOW (every voiced line that follows a typed line; one stray syllable).

## 7. Meeca's stage composes up to 600 pieces on the main thread to find a constant
- **Where:** `src/audio/scenes.ts:138-150` (`meecaStageMusic`), `:160` (`if (levelId === MEECA_MUSIC_STAGE)`); `src/audio/recordings.ts:23-29`; `src/assets/music/manifest.json` piece `gen-5-8-s`.
- **Wrong:** a stage-id special case left from the live-composed music. It runs `composeStageFull(5, seed, 'sneak')` for seed 1.. until a tune is 'lament' on clarinet, to build the id `gen-5-8-s`. The music is recorded now: the only thing that id does is name the one recording. If the composer ever changes its dice the id changes, `recordingFor` finds no such piece and silently plays World 5's ordinary loop (`loops.test.ts:79` would catch that; nothing catches the cost).
- **Scenario:** entering 5-M: `App.tsx:520` -> `sceneForScreen('playing', 5, false, '5-M')` blocks the main thread as the stage starts: 340-410 ms in Node on this machine, several times that on a phone (PERFORMANCE-RULES: no heavy work as play begins). Once per session.
- **Proof (test):** `audio-meeca-music-search.test.ts`: `Meeca's music took 341 ms on the main thread to pick (another stage: 0.3 ms)`.
- **Status:** CONFIRMED.
- **Roadmap:** not tracked.
- **Root fix:** a per-stage table in the manifest (`stageOverrides: { '5-M': 'gen-5-8-s' }`, the general rule for "this stage has its own recording") and delete the search; that also lets `scenes.ts` stop importing `composer.ts` into the game. **S.**
- **Severity:** LOW/MED (one stage, one hitch; fragile).

## 8. A game started muted never suspends its audio context (muting mid-session does)
- **Where:** `src/audio/conductor.ts:144-202` (`unlock`: only ever resumes, `:194-197`), `:514-522` (`setMuted` suspends after 350 ms), `:220-224`.
- **Wrong:** "muted means the context is suspended" is only applied on the mute tap. Where sound needs no tap (the Android app: Capacitor's `Bridge.java:592` `setMediaPlaybackRequiresUserGesture(false)`), a context created with the saved setting already muted starts `running` and stays running: master gain 0, but the stage music is still fetched, decoded (35 MB) and played, every stage, all session. The same hole lets a context created while the app is already away (`appAway` / `document.hidden`) start running.
- **Proof (test):** `audio-muted-launch-keeps-running.test.ts`: `muted from the start, the context is 'running' (suspend() called 0 times)`.
- **Status:** CONFIRMED.
- **Roadmap:** not tracked.
- **Root fix:** one `applyRunState()` (suspend if muted, hidden or away; else resume) called from `unlock`, `setMuted`, `onVisibility` and `appHidden`; and do not `loops.play` while muted (start the wanted piece on unmute, as the pre-unlock path already does). **S.**
- **Severity:** LOW (battery, memory and decode time for muted players in the app; no audible fault).

## 9. The recorded effects have no fallback and a failed load is remembered silently for the whole session
- **Where:** `src/audio/conductor.ts:170` and `:394-399`; `src/audio/sfxRecLoader.ts:76-101` (`started.set(core, job)` keeps a rejected job), `:128-141` (`beds`: a failed bed is stored as `null` for good); `src/audio/sampleLoader.ts:24` (`fetch` with no `res.ok` check).
- **Wrong:** the comment promises a fallback the code no longer has, and 44 of the game's 51 effect names live in one pack (`sfxrec/takes.mp3`, 1.1 MB). If that one fetch or its header parse fails, `loadRec` rejects, the conductor swallows it (`.catch(() => {})`), the rejected promise is memoised per core and every one of those effects is silent until the app is restarted, with nothing logged. Same shape for a world's ambience bed.
- **Proof (line pair):** `conductor.ts:170` "the recorded sounds load in the background; until they are ready the effects use their synthesized layers" vs `:396-399` `if (rec) { playRec(core, rec); return; }` (`playRec` returns false when the bank is empty; the result is ignored). `sfx.ts` now holds only 8 synthesized effects (roar, heartbeat, the five predator calls, levelStart).
- **Status:** CONFIRMED (the contradiction); the failure path is reasoned (files are packed in the store build, so it needs a bad fetch on the web build or a decode refusal).
- **Roadmap:** not tracked (R-145.4 "one effect family" touches the same files).
- **Root fix:** on failure delete the memoised job so the next `unlock` retries, check `res.ok` in `bytesOf`, and report a failed load once (the recorder / a console warning in tests); fix the comment. **S.**
- **Severity:** LOW (store build), MED on the web build.

## 10. The story's thunder buzz ignores the haptics setting
- **Where:** `src/components/StoryPlayer.tsx:289-293` vs `src/game/haptics.ts:51-53`.
- **Proof (line pair):** `haptics.ts:52` `if (!hapticsOn() || !canBuzz()) return;` (the setting is off unless turned on, `:24`) vs `StoryPlayer.tsx:290` `navigator.vibrate?.(140);` called directly.
- **Scenario:** a player who never turned haptics on (the default) or turned them off gets a 140 ms buzz at the finale's "let go" beat.
- **Status:** CONFIRMED (line pair). It is the only direct `navigator.vibrate` call outside `haptics.ts`.
- **Root fix:** `vibrate(140)` from `haptics.ts` (or a named `HAPTIC.thunder`). **S.**
- **Severity:** LOW.

## 11. Old paths "new replaces old" should have deleted (all reachable from `src/game/audio.ts`)
- `sound.cue()` (`audio.ts:135`) has no caller: the in-key cue pipeline (`src/audio/cues.ts`, `conductor.ts:320-329`, the `CUE_NAMES` loop in `warmEffects` `:286-289`) is dead; `STINGS.bossAppear` and `STINGS.worldReached` (`stingers.ts`) are never played (only victory, bossVictory, defeat and the story stings are).
- `setTempo` is a no-op (`conductor.ts:335`) still called for the boss enrage (`engine.ts:1169`, `3743`, `3746`): the enraged boss has no faster music, and nothing replaced it.
- `sound.scene()`, `startAmbient()`, `stopAmbient()`, `unlock()` (`audio.ts:84`, `199-200`, `71`): no callers.
- `scenes.ts` still imports `composer.ts`, `themes.ts`, `orchestrate.ts`, `styles.ts` into the game for id strings and finding 7.
- Note, not a defect: stings and voices play on the Effects bus (`stingers.ts:289`, `voiceBank.ts:28`), so Music at 0 still plays the victory fanfare and the story's musical stings, and Effects at 0 silences them; say so on the slider or route stings by the music volume.
- **Proof:** `grep -rn "sound\.cue\b\|sound\.scene\b\|sound\.startAmbient\|sound\.stopAmbient" src` (non-test) returns nothing; `conductor.ts:335` `setTempo(_scale: number) {}`.
- **Status:** CONFIRMED (grep). **Root fix:** delete. **S.** **Severity:** LOW.

---

## Seen outside this slice (one line each, not chased)
- `src/App.tsx:1377` `panels={finalePanels(foundIds)}` (and `:1386` `endTagPanels(...)`) build a new array on every App render, so StoryPlayer's `dirs` memo and every effect keyed on `dir`/`panel` re-run on any App re-render during the finale: the line retypes from 0 and a `swell` adds +0.2 intensity again (`conductor.ts:356`). SUSPECT, story slice.
- `src/game/jennifurSprite.ts:84-87`: a `?jennifur=sprite|classic` switch and a `sloth_jennifur` localStorage flag (the no-switches rule).
- `src/main.tsx:38-41`: the 5-minute `setInterval(check)` update fetch keeps running while the page is hidden and inside the app.
- `App.tsx:1066-1067` on hide: `pauseGame()` plays `pauseIn` just before the context suspends, so the pause sound is heard on coming back.
- Sound settings live in four separate localStorage keys (`sloth_music_vol`, `sloth_sfx_vol`, `sloth_game_muted`, `sloth_haptics`) outside the save: check they are covered by the save export / erase paths (saves slice).
