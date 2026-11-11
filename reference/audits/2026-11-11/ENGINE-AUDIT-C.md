# Engine audit C: gameplay systems and UI. PARTIAL, stopped by Matt's scope

**Status: PARTIAL.** Stopped by the lead on Matt's word (the audit was narrowed to the gen2 engine for token budget) about 20 minutes
in. Nothing here is a full sweep of area C. What is below is what was found and proved before the stop, nothing after it.

- Base audited: `t-int-1-1` @ `fa5ad9d1` (86 commits ahead of `origin/main` 181d2846). Branch: `t-audit-engine-c`. No game code changed.
- Tests: `reference/audits/2026-11-11/tests-c/` (38 files, outside the CI glob on purpose, so they never redden the suite). Each
  asserts the correct behaviour and fails today. Run one with `npx tsx --test reference/audits/2026-11-11/tests-c/<file>`.
- How it was done: the lead auditor took Dot, the help helpers, App.tsx and the HUD; six sub-auditors took puzzles, bosses, world
  modules, creatures/pickups, audio and saves/menus/story. Three of the six (puzzles, bosses, worlds) were cut off before writing their
  findings: only their test files survive.
- **What "verified" means here** (do not read more into it):
  - Section 1 (C-01 to C-13): found and proved by the lead auditor.
  - Audio: the sub-auditor's write-up, every test re-run by the lead auditor, two line pairs re-read.
  - Things, Saves: the sub-auditor's write-up; the lead auditor re-ran every test file (all fail as claimed) but did NOT re-read the
    line-pair findings. Treat those as the sub-auditor's claim until someone opens the lines.
  - Puzzles, Bosses, Worlds: test files only, each run once by the lead auditor (all fail). No write-up, no severity, no roadmap check,
    no "is it guarded elsewhere" check by a second reader. Leads, not findings.
- Not done: ROADMAP cross-check for most items (only where a row names an R-id), the browser traces (cut off mid-run), every part of
  area C not named below (HUD internals, pause menu settings, touch controls, satchel pages, story player beyond the sub-auditor's read).

## Summary

| Slice | HIGH | MED | LOW | Proof | Where |
|---|---|---|---|---|---|
| 1. Dot, help helpers, App, HUD (lead auditor) | 0 | 8 | 5 | 9 by failing test, 4 by line pair (parts SUSPECT, marked) | below |
| 2. Audio | 0 | 6 | 5 | 6 by test, 4 by line pair, 1 mixed | `parts/C-audio.md` |
| 3. Creatures, pickups, records ("things") | 2 | 7 | 3 | 8 by test, 4 by line pair | `parts/C-things.md` |
| 4. Saves, menus, story | 1 | 10 | 1 | 3 by test, 8 by line pair, 1 SUSPECT | `parts/C-saves.md` |
| 5. Puzzles, bosses, worlds (cut off) | - | - | - | 17 failing test files, unrated | section 5 |

Slices overlap: saves #4 = C-01, saves #6 = C-08, saves #9 = C-05, saves #8 covers C-04, saves #3 = things #5. Counting each once:
**3 HIGH, 28 MED, 13 LOW**, plus the 17 unrated test files.

The three HIGH (all the sub-auditors', tests re-run, lines not re-read by the lead auditor):
1. **saves #1**: the game's own save file is refused on load once Meeca's stage is cleared, or at 34 finds (`saves-file-limits.test.ts`).
2. **things #1**: a Game Over then Continue counts the whole run twice in every lifetime record (`things-continue-double-count.test.ts`).
3. **things #2** (Android app only): the flag resume brings back the place and nothing else, so a goal stage can be resumed with its
   count gone (`things-flag-resume-quota.test.ts`).

The pattern behind most of section 1, worth more than any one fix: **Dot's guide decides what a line IS from its English words**
(`dotLines.ts:189` engineGuideLine, `dotGuide.ts:581` classifyLine, `helpLadder.ts:58` HELP_LINES, `engine.ts:915`, `tipMemory.ts` byText).
Every special case in C-02, C-03, C-06 and C-13 is a patch on that. The root fix is for the engine to send a line id and its kind, and
for words to be looked up from the id, never the reverse.

---

## 1. Dot, the help helpers, App.tsx, the HUD (lead auditor)

### C-01 MED, CONFIRMED (test): World 10's gate scene and the guardian's card share one storage key
- **Where:** `src/App.tsx:109` `guardianCardKey = (lvl) => \`sloth_story_g${lvl.secret ? 11 : lvl.worldIndex}\`` vs `src/App.tsx:142`
  `gateStoryKey = (w) => \`sloth_story_g${w}\``; read at `App.tsx:1283`, written at `App.tsx:1265`; `storyWorlds.ts:482` `WORLD_GATE = { 10: W10_GATE }`.
- **Scenario:** clear 10-9 the first time: the gate scene plays and writes `sloth_story_g10`. Enter 10-10: `hasSeenGuardianCard` reads
  the same key, so the final guardian's first-time card (UI-5, Dot's one line) is skipped. Every player. Reverse: a save that saw the
  card before the gate scene existed never gets the gate scene.
- **Proof:** `app-story-keys.test.ts` test 1 (also `boss-card-key-collides-with-gate-scene.test.ts`, found independently).
- **Replacement:** R-4.1 generalises WORLD_GATE (a before-a-stage slot at 17 stages): then the collision spreads to every world. Fix
  before R-4.1, not with it.
- **Root fix:** one exported key builder per flag in one module (with saveFile's allow-list built from it); give the gate scene its own
  letter and migrate `g10`. **S.**

### C-02 MED, CONFIRMED (tests): on the on-screen pad (and keys) 84 wordings of 301 stage hints are a different line from the touch one
- **Where:** `src/game/engine.ts:2866-2868` (`said = mode === 'pad' ? h.pad : mode === 'keys' ? h.keys : h.text; this.guide(said)`);
  `src/game/dotLines.ts:56-86` (the approved table is keyed by the OLD TOUCH words only) and `:189-195`; `src/game/dotGuide.ts:581-614`
  (the regex fallback); `src/game/stuckHelper.ts:52-58`; `src/game/dotLinesData.ts:74`; `src/game/w5Lines.ts:106-108,133`.
- **What is wrong:** a pad or keys wording misses Matt's approved table and is classified by regex instead. So for pad players: 17 hints
  Matt CUT are still said (34 wordings over pad and keys); others change kind (teach to info), lose their approved words, their id, and
  with the id every rule keyed on it (SAME_TIP pairs `dotGuide.ts:169`, PUZZLE_STEPS, firstOf). The stuck helper's wall line is
  `struggle` on touch but `teach` + move `double` on the pad, where the queue drops a move tip "for a move already done this stage"
  (`dotGuide.ts:428-431`): a pad player who double-jumped once earlier never hears it.
- **Proof:** `dot-pad-lines.test.ts` ("84 wordings of 301 stage hints are a different line off touch (34 of them: cut on touch, still
  said)", 102 stages, about 25 s); `dot-stuck-help.test.ts` tests 1-3.
- **Replacement:** none found. R-142 moves Worlds 1-5 to the new generator after launch; the lookup-by-words stays unless changed.
- **Root fix:** a hint carries its line id; `engineGuideLine` looks up by id and picks the wording for the controls AFTER it knows the
  line. Keep `dot-pad-lines.test.ts` as the gate. **M.**

### C-03 MED, CONFIRMED (test): the engine counts stuck help as given when Dot's setting dropped it
- **Where:** `src/game/engine.ts:4594-4598` (on `stuck.tick`: `guide(...)`, `w5.holdStill(STUCK_HOLD)` 7 s, `recorder.event('stuckHelp')`,
  and `told = true` inside `stuckHelper.ts:40`, once a stage); `src/game/dotGuideHelp.ts:128` (Tips: `if (l.kind === 'struggle') return
  l.source === 'struggle' && key.startsWith('struggle:death')`); `dotGuideHelp.ts:38` (Tips is Normal's default);
  `src/game/engine.ts:8378-8379` (`recorder.event('dot', ...)`, commented "which of Dot's lines was really shown", logged at SEND).
- **Scenario:** Normal, default settings, any stage but 1-1: three failed single jumps at a double-jump wall. The engine sends the line,
  marks the stage told, logs `stuckHelp` and `dot`; Dot's Tips setting drops it. Nothing is shown, it cannot fire again this stage, and
  in World 5 the stillness is held 7 s for a line nobody sees. The testers' "did Dot's tips help?" numbers count sends, not shows
  (the D15/D19 kind of miss: the measure is not what the player saw). In 1-1 the ladder's lines bypass the setting on Tips
  (`helpLadder.ts:66-73`), so the same struggle is helped in 1-1 and silently not in 1-2.
- **Proof:** `dot-stuck-help.test.ts` test 4.
- **Replacement:** the stuck helper is due to be replaced by the help ladder off 1-1 (R-165.62; the code says "off on every other stage
  until help.md §5 has passed"). **Wait for replacement** for the helper itself. NOT for the recorder: logging at send is wrong today
  and feeds the analyst now.
- **Root fix:** Dot's guide reports "shown" (as it already does for the ladder, `helpLineOnScreen`); the engine's told flag, the World 5
  hold and the recorder's `dot` / `stuckHelp` events hang off that report. **S** (recorder) + with the ladder (rest).

### C-04 MED, CONFIRMED (test): the "boss intro seen" flag is outside the save
- **Where:** `src/App.tsx:128` `bossIntroKey = (w) => \`sloth_story_b${w}\``; `src/game/saveFile.ts:30` `/^sloth_story_[wmng]\d{1,2}$/`;
  `saveFile.ts:198` (New Game clears save keys only); `src/game/storyBosses.ts:216` `RETRY_INTRO_LINES = { 10: 2 }`.
- **Scenario:** New Game on a phone that has met the General before: the new adventure's first meeting with him is the 2-line retry
  intro, not the nine-line scene. A save file moved to another phone loses the flag the other way.
- **Proof:** `app-story-keys.test.ts` tests 2 and 3 (also `boss-intro-seen-survives-new-game.test.ts`; saves #8 lists the other keys
  that are on no list).
- **Replacement:** R-4.1 turns retries into a line list; the key still has to be in the save.
- **Root fix:** as C-01: the allow-list is generated from the key builders, so a new flag cannot be left off. **S.**

### C-05 MED, CONFIRMED (line pair; the browser trace was cut off): a new player who opens the World Map first gets the after-1-1 scene before 1-1, and again after it
- **Where:** `src/App.tsx:677` `if (lvl.miniIndex === 1 && !hasSeenWorldStory(lvl.worldIndex)) setScreen('world_story')` vs `App.tsx:82-85`
  ("World 1's arrival scene ... plays once, after stage 1-1 is first cleared") and `App.tsx:948` (the after-clear special case).
  `sloth_story_w1` is only written by the prologue finishing (`App.tsx:1228`) or skip-story. The title's World Map button is there on a
  fresh save (`TitleScreen.tsx:246`).
- **Scenario:** fresh save, title, World Map, 1-1, Play: the reward scene (Dot's return, Meeca's first note) plays before the stage, the
  prologue never plays, and clearing 1-1 plays the same scene again (`hasSeenFirstNote` is a different key).
- **Proof:** the two quoted lines. Found independently as saves #9.
- **Replacement:** R-4 (the story rewrite) rebuilds this flow: R-4.1's "before-a-stage slot" should carry the rule. Small enough to fix now.
- **Root fix:** World 1 is not a special case of "first visit plays the world story": give the scene a slot ("after stage 1") in the
  same table as mid and gate scenes, and send a fresh save's first 1-1 through the prologue whichever door it came in by. **S.**

### C-06 MED, CONFIRMED (test): a stage tip that was sent but never shown stays silent for the whole session
- **Where:** `src/game/tipMemory.ts:14` (module-level `sent`), `:31-33` (`tipHeard` is true for anything sent), `:83` (cleared only by New
  Game or "Hear Dot's tips again"); `src/game/engine.ts:2861` (`if (tipHeard(stage, id)) continue;`) though `engine.ts:912` resets every
  hint's `shown` for the new run.
- **Scenario:** he falls as a tip is queued; it ages out of Dot's queue unseen (the DOT-1 fix rightly does not write it to the phone).
  He restarts the stage, five times: the tip is never sent again until the app is closed. In the Android app a session is the life of
  the process. Same for every `markTipHeard` id (boss phase warnings, watcher, chase, tide, lantern: about 30 call sites).
- **Proof:** `dot-tip-session.test.ts`.
- **Root fix:** the "sent" mark belongs to one run of a stage: clear a stage's unshown ids when its engine starts (or when Dot reports
  the line dropped). **S.**

### C-07 MED, CONFIRMED (test): the first-stage coach and the gap lesson are marked taught at the start, before a word is said
- **Where:** `src/game/engine.ts:1161-1167` (`markCoachDone(); // once per device: leaving halfway does not bring it back`,
  `markLessonSeen('gap')`) vs the DOT-1 rule in `src/game/dotSay.ts:72-80` (a lesson is marked only once its line has been up 1.5 s).
- **Scenario:** a brand-new player's first 1-1 is restarted, backed out of, or the app is closed in its first seconds (the coach's first
  step comes 1.1 s in): the coach never returns on that phone and Dot never says the gap lesson either.
- **Proof:** `dot-coach-marked-early.test.ts`.
- **Note:** the comment shows the early mark was on purpose (never nag). It still contradicts the rule the rest of Dot was moved to.
  The lead's call which wins.
- **Root fix:** mark each when its line has been shown (the coach's lines already go through Dot's queue, source `coach`). **S.**

### C-08 MED, CONFIRMED (line pair + test): Android Back does nothing on the guardian's card and on The End
- **Where:** `src/App.tsx:555-570` (androidBack: no branch for `boss_intro` with the card up or `story_ending`, so it falls to `esc()`);
  `App.tsx:613-659` (handleGlobalKey: no branch for either); `src/components/BossCards.tsx:57-65` and `StatusModals.tsx:134` (EndingCard):
  neither calls `useBack` nor listens for Escape.
- **Why it matters:** PLAY-STORE-RULES §6.2 "Back does something sensible on the new screen".
- **Proof:** `boss-card-android-back.test.ts` (fails); saves #6 the same by line pair.
- **Root fix:** both cards call `useBack` (the card: back to the map; The End: to the map), and a test walks every `GameScreen` value
  and fails on one with no Back owner. **S.**

### C-09 LOW, CONFIRMED (test): the pause menu's "Dot said" list survives a New Game, and calls Flicker "The petal"
- **Where:** `src/game/dotGuide.ts:564-572` (module-level `lastLines`, never emptied); `src/components/menuParts.tsx:63`
  (`s.who === 'Pokey' ? 'Pokey' : 'The petal'`, though `GuideWho` includes `'Flicker'`, `wayside.ts:53`).
- **Proof:** `dot-said-history.test.ts` (2 tests).
- **Root fix:** empty it in `forgetDotSession` and when a stage's guide run starts; label by `who`. **S.**

### C-10 LOW: 1-1's help offer can leave the stage frozen, or its card behind
- **CONFIRMED (line pair):** `src/game/engine.ts:5153` sets `isPaused = true`, then `:5054` `void import('../components/HelpOffer.tsx').then(...)`
  with no catch; `engine.ts:1217` `if (this.helpAsking) return;` means the pause menu's Resume cannot un-pause. If the chunk fails to
  load (web build after a deploy, a bad connection) the stage is frozen with no card; only Restart gets out.
- **SUSPECT:** `HelpOffer.tsx:131-145` mounts on `document.body` on its own root; `engine.stop()` (`engine.ts:1251`) forgets the offer but
  nothing takes the card down. Reachable today only by keyboard (P then R) or `onFatal`: the card (z-index 90) covers the pause menu (50).
- **Checked and fine:** the offer under a pause from outside (app hidden): `outerPause` holds, the card sits over the menu, an answer
  does not start play under the menu.
- **Root fix:** catch the import (answer no, resume); the engine owns a "take the card down" handle and calls it in `stop()`. **S.**

### C-11 LOW: the lesson card is a dead path that still gates Resume
- **CONFIRMED (grep):** `engine.ts:696` `lessonOpen` is never set true (4 uses: declared, two guards, one reset), so `lessonClosed()`
  (`engine.ts:6003-6009`) never resumes; `src/components/LessonCard.tsx` is a 13-line stub that calls `onClose` at once; yet
  `src/App.tsx:1081` still skips `engine.resume()` while `lessonId` is set and `App.tsx:1499` still mounts the card.
- **SUSPECT (a few-millisecond window):** a pause landing between `onLesson` and the stub's effect leaves `lessonId` set under the pause
  menu; Resume then returns early and the stub's `lessonClosed()` is a no-op: frozen until paused and resumed again.
- **Root fix:** "new replaces old": delete `lessonOpen`, `lessonClosed`, `LessonCard`, the `lessonId` guard; Dot's guide takes the
  lesson straight from the engine's callback. **S.**

### C-12 LOW, CONFIRMED (line pair): the screen is kept awake behind a find's reader and the help offer
- **Where:** `src/App.tsx:573` `keepScreenOn(screen === 'playing')` vs `App.tsx:905-908` (a find pauses the engine and opens the reader
  with the screen still `'playing'`) and `engine.ts:5153` (the offer).
- **Why:** PLAY-STORE-RULES §4/§6.5 "nothing keeps the phone awake behind a menu". A phone put down on a find's card never sleeps.
- **Root fix:** `keepScreenOn(screen === 'playing' && !reading && engine not held by a card)`. **S.**

### C-13 LOW: line-keyed and world-keyed patches left in Dot's path (each should be data)
- `src/game/engine.ts:915` marks a hint heard by its exact words (`h.text === 'No soft moss up here!'`) when the ladder is on. CONFIRMED
  (line). A wording change silently brings the false line back.
- `src/components/dot/DotGuide.tsx:386` `if (v.stageId.startsWith('2-')) return 'water';` an old guess the engine's `lostTo`
  (`DotGuide.tsx:377`, `engine.ts:4962`) replaced: a pit death in World 2 is called water. SUSPECT (not run).
- `src/game/wayside.ts:291` Dot's presence as hard-coded world/stage ranges. Wait for replacement: R-4.1 lists "Dot-present ranges".
- The code cites `reference/specs/help.md §5`, `reference/specs/help-lines.md` and `reference/ONE-ONE-FIX-PLAN.md` (9 places in `src/`);
  none is on this branch or on main (`reference/specs/` holds README.md only). CONFIRMED (ls). A later session told "help.md §5 owns
  the rest" cannot read it. Not checked: whether they sit on another branch.
- `src/App.tsx:914` `window.setTimeout(() => startLevel(THORNBARK_LEVEL), 1100)` is never cancelled: quitting or dying in that second
  still starts the secret stage. SUSPECT (not run).

### Looked at and found sound (so nobody re-derives it)
- Dot's "stuck" watch on 4-7, the one stage that goes down: simulated on the stage's own route, no false "This way, Pokey!" (the route
  also runs right).
- The goal card's `hudCard` flag that holds every Dot line: only set while the card is mounted; not mounted for boss or no-goal stages.
- The sealed-door line (`engine.ts:3165-3171`): retried every 1.2 s, never lost.
- The help ladder's line in Dot's queue against the coach, lessons and the stage's own tips: no case found where it is held for good.

### For the other areas (one line each, not chased)
- **Area B:** `src/game/testlink1_1.ts:27` `playSeed` is module state set only by the World Map's Play (`WorldMap.tsx:350`); Continue, New
  Game, Next stage and a restart reuse the last play's seed or fall back to the layout variant. Which seed a first-ever 1-1 gets depends
  on the door used.
- **Area A:** `engine.ts:460` `stageHint` is a second clock for "a line is up" (the engine's own seconds) beside Dot's queue; three
  senders gate on it (`engine.ts:3123, 3131, 3171`).

---

## 2. Audio: `parts/C-audio.md` (11 findings; all 8 tests re-run by the lead auditor and fail as claimed)
MED: (1) Android audio focus is taken even when muted, and a permanent loss never comes back while the game is in front (part a
CONFIRMED by line pair, b and c SUSPECT, need a device); (2) every screen change releases a sting's music duck: the Game Over card
brings the music up under a 12 s defeat sting; (3) the satchel opened from the pause menu un-pauses the sound (heartbeat, wrong tune on
return); (4) the story's storm rule is keyed to a chapter title no story has: no thunderstorm in 120 storm pictures, and 13 recordings
(12.3 MB) can never play; (5) App's screen effect overrides a story's first picture (the finale's directed silence is lost); (6) a
speaker's voice blips at the picture change. LOW: (7) Meeca's stage composes up to 600 pieces on the main thread to find a constant;
(8) a game started muted never suspends its audio context; (9) recorded effects have no fallback and a failed load is silent for the
session; (10) the story's thunder buzz ignores the haptics setting; (11) dead paths (the cue pipeline, `setTempo` a no-op, unused methods).

## 3. Creatures, pickups, records: `parts/C-things.md` (12 findings; 8 test files re-run and fail; line pairs NOT re-read)
HIGH: (1) Game Over then Continue counts the whole run twice in every lifetime record; (2) Android flag resume brings back the place
and nothing else. MED: (3) a medal that pops in play is not kept if the stage is left; (4) the stage's report reads the menu's mode at
the end, not the mode played; (5) New Game and Load Save leave the old journal records in memory and write them back; (6) a find shown
as found is dropped if the run ends before a "safe moment"; (7) on 1-8's collapsing branch a life lost to a snake also costs a heart and
a second respawn; (8) 1-9's ring animals count for the goal but never as predators beaten; (9) the watcher's words are picked by world
number (8-1's bat run gets World 1's bush line). LOW: (10) a soft fall leaves a crumbled platform broken (the rule says whole on
respawn); (11) journal totals from partial records; (12) two rules that do not check what their words say.

## 4. Saves, menus, story: `parts/C-saves.md` (12 findings; 3 test files re-run and fail; line pairs NOT re-read)
HIGH: (1) the game's own save file is refused on load once Meeca's stage is cleared, or at 34 finds. MED: (2) a pause that lands while
a stage is loading is forgotten and the stage runs behind the pause menu; (3) = things #5; (4) = C-01; (5) in the finale's two-thumb
picture no button can be tapped, and on Normal its prompt goes after one try; (6) = C-08; (7) SUSPECT: medals earned on a clear never
come in on the stage-cleared card (one real clear settles it); (8) the save allow-list is kept by hand and several per-adventure keys
are on no list; (9) = C-05; (10) on a full or failing storage the game drops progress and says it is saved; (11) clipcheck never opens
a story or any card of a run, and those hold tap targets under 44 px and outside the safe area. LOW: (12) old paths not deleted.

## 5. Puzzles, bosses, worlds: cut off. Failing tests only (leads, unrated, not second-read)
Each file's header comment states its claim with file:line. All were run once by the lead auditor on fa5ad9d1 (pass/fail counts as run).

| Test file | What it claims | Run |
|---|---|---|
| `puzzle-sapling-softlock.test.ts` | 5-M room 1: after the sapling bends, Meeca who drops back cannot get up again | 0/1 pass |
| `puzzle-log-softlock.test.ts` | 1-6's twist room: a log walked into from the left cannot be got back | 0/2 |
| `puzzle-gate-jump-twice.test.ts` | jumping at a room's shut gate brings the "jump twice" stuck line | 0/4 |
| `puzzle-lantern-resume.test.ts` | 8-4 resumed at a flag: the first fall sets him back further than that flag | 0/1 |
| `puzzle-stuck-watch.test.ts` | stuck in a room on a later run, Dot's nudge does not come again | 0/2 |
| `puzzle-ratchet-lift.test.ts` | 4-6's pinwheel lift cannot be ridden a second time | 0/1 |
| `boss-phase3-arena-lost-on-respawn.test.ts` | the phase-3 arena hazard is gone after a lost life | 0/4 |
| `boss-first-tell-and-easy-opening.test.ts` | a move Dot names for the first time does not wind up long enough to read her line | 2/11 |
| `boss-entrance-tap-fires-late.test.ts` | a tap during the entrance is played seconds later, when the fight starts | 1/4 |
| `boss-easy-bar-count.test.ts` | on Easy the bar shows more hits than the fight takes (Venom Fang: 6 for 4) | 9/10 |
| `boss-card-android-back.test.ts` | = C-08 | 0/1 |
| `boss-card-key-collides-with-gate-scene.test.ts` | = C-01 | 0/1 |
| `boss-intro-seen-survives-new-game.test.ts` | = C-04 | 0/2 |
| `worlds-chase-gameover-loop.test.ts` | 1-8: with the Game Over card up, defeats keep firing and lives go below 0 | 0/2 |
| `worlds-chase-other-death.test.ts` | 1-8: a life lost to a snake mid-chase does not bring him back whole | 0/1 |
| `worlds-w5-respawn-still.test.ts` | 5-2: back at a flag, standing untouched costs a heart every ~6 s (`calm()` is never called on respawn) | 0/1 |
| `worlds-slide-goal-text.test.ts` | 7-4's goal card says "climb to the top" for a slide down (the type is decided twice) | 0/1 |

A failing test proves the behaviour, not that it is a defect: each needs one reader to confirm the asserted behaviour is the wanted
one and that no rule elsewhere says otherwise, before it is given a size.
