# Handoff: the testers' page (#ctest), its recorder and survey

Written 2026-11-07 by the tester-page helper. That helper's branch is `tester-page`; its live status note is
`reference/notes/tester-page-status.md` (newest at the top). Read this first, then that note.

## 1. The page

**Where testers play**
- The testers' link: https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest. It is the LIVE site plus `#ctest`.
- Testers see a change only after it merges to main and deploys.
- Matt's Claude page (EnK5) does not record; see methods/release.md.
- `ctestEnabled()` (`src/game/playRecorder.ts`) is true for `#ctest` or `?ctest=1`, in any web build. It is never true in the store
  build (`VITE_STORE_BUILD`): the recorder and collector are stripped there (PLAY-STORE-RULES §3).

**The screens** (`src/components/ControlTestGate.tsx`; styles are the `ct-*` rules in `src/index.css`)
- **Front page (`ControlTestGate`)**, in the game's menu kit:
  - a painted card, with World 1's sunrise (w1sun2-far) behind it;
  - the hero: Pokey cheering in front of a still of gen2 1-1 (`src/assets/ui/ctest-1-1.webp`), with a carved NEW tag;
  - one line of text, then Refresh;
  - four move cards (Run, Jump, Double jump, Mushroom bounce), each a pose from `hero-standard.webp`, listed in `MOVES`;
  - name (required), Easy/Normal, Start;
  - the privacy line, the tester code, and "Test round · build".
- **End questions (`ControlTestDone`)**: shown at the shrine, or after "I'm done", which asks twice.
- **Sent screen.**
- **`RecordingBadge`**: the REC dot and "I'm done" over play. Its tap area is 44 px.

**The level**
- `#ctest` plays gen2 1-1. The App.tsx route belongs to engine-core: `setPick11('play')` and `newPlay11()` at Start and at Play again.
- `newPlay11()` draws a proven seed from the device's shuffled order, stored in localStorage `sloth_play11_order`. To force a seed,
  write that order (entry index = the seed's place in `provenSeeds('1-1')`).

## 2. The recorder (`src/game/playRecorder.ts`)

**Lines** (the full list is in `tools/playtesters/LOG_EVENTS.md`, the QA team's guide)
- `d`, `m`, `u`, `c`: fingers.
- `i`: what the touch rules decided.
- `p`: Pokey's position and state.
- `e`: moments.

**Moments added on 11-06**
- `tester <CODE>`: at Start.
- `env ... | build <commit> list <hash> round <label>`: once a run.
- `gen2 <stage> seed <n> <easy|normal> build ... list ... round ...`: every gen2 stage start. The survey's `run` field is this same line.
- `section <plain words> | <id>:<phase>`: the gen2 stretch he entered. The words come from `src/components/ctestStretches.ts`
  `sectionLabel`.
- `pickup <kind> <x>`.
- `dot <review id>`: a Dot line really shown. `src/game/recorderLabels.ts` `dotLogId` looks up the id by its old or new words, once.
- `move double|bounce <x>`: the first use of each in a stage, reset by `recorder.stageStart()`.
- `pause`, and `restart menu`.
- `softFall <x>`: this was already logged on every put-back.

**Hooks in engine.ts / App.tsx** (engine-core's files; it approved them)
- `stageStart`, `moveOnce` (double jump and bounce), and `pickup` (seed and general) in engine.ts.
- `dot` in `guide()`, in engine.ts.
- `pause` and `restart` in App.tsx.
- Planted tests: `src/game/recorderMoments.test.ts`. The move, pickup and dot tests fail with the hooks removed.

**Versions** (`src/game/testRound.ts`)
- `GIT_COMMIT` is stamped as `__GIT_COMMIT__` by vite.config.ts and by the test link's config.
- `seedListVersion(stage)` is an FNV hash of the proven list.
- `TEST_ROUND` is BUMPED BY HAND each test round. It is shown in small print on the front page.

**The tester code**
- `testerId()`: 6 letters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, made once and kept in `sloth_qa_tester_id`.
- It is random only, never a device id.
- If storage is blocked, the code lasts the visit only and has a `~` prefix.
- It is shown on the front page.
- The sheet's Player cell is `Name · CODE`. Join a tester's runs by the code, not the name.
- Test: `src/game/testerId.test.ts`.

**Read from the log, never asked**
- Which hand, and how the phone was held: see LOG_EVENTS.md, "Read from the log, never asked".
- Skill from play: same section. No age is asked.

## 3. The sheet and its collector

- Every 20 s, and on pagehide or hidden, the log so far is gzipped, base64'd and POSTed to `COLLECTOR`.
- `COLLECTOR` is an Apps Script web app in playRecorder.ts, keyed by `KEY`. It only appends rows, and it is Matt's.
- **Never change the URL or the script.** New data rides in the log as new moments, never as new columns.
- One row per part: arrival time, Player (`Name · CODE`), session, part number, device line, build time, seconds, data.
- Data is at most 47 000 characters a cell; a part over that is halved until it fits.
- **Our cloud containers can't reach script.google.com.** A row can't be tested from here; a real phone on the live #ctest page is the
  proof.
- In every browser script, block `script.google.com` (`ctx.route(/script\.google\.com/, r => r.abort())`).
  - On 11-06 two of my early local runs may have sent "QA" rows before I did. Filter "QA", "qa-*" and "clipcheck" names out of the
    sheet.

## 4. The survey (`ControlTestDone`)

**What it asks**
- Matt's rule: only what the log can't tell.
- **Required, 3 taps:** fun (5 faces, saved as 1 to 5), how long it felt, and whether they knew what to do. Send waits for all three.
- **Optional:**
  - "What felt hardest?": this run's own stretches in plain words (`ctestStretches.ts` `STRETCH_WORDS`; a test fails when World 1
    gains a section the table doesn't name);
  - Dot's tips;
  - looked wrong, with a note;
  - next level;
  - "Anything else?".
- Hand, held and age were cut.

**The row**
- It goes in the `survey` moment as JSON with `v: 2`. Old keys keep their old shapes.
- `surveyRow()` builds it. Tests: `src/components/ctestSurvey.test.ts`.

**The survey fix: on main** (PR #65, 6aa29496; the lead's 11-07 update to this note)
- The notes are 3-row boxes capped at 600 (looked wrong) and 1000 (the note), with a live count.
- `useAboveKeyboard` keeps the focused box and its count 24 px above the phone keyboard.
- Keys typed in a text box no longer reach the game: Space, P and R were eaten.
- Merged in PR #65; kbdcheck's colour fix in PR #66. Nothing left to apply.

## 5. The checks

- **clipcheck** (`tools/perf/clipcheck.mjs`):
  - walks `?ctest=1` on the fresh save: the front page, the "I'm done" badge, the end questions (scoped to the card) and the sent
    screen, with a planted 26 px button that must be caught;
  - Pause over a live stage (`?autostart=1&level=1-1`), with a plant. This is a production build, where `window.__play` doesn't exist;
  - Dot's first tip, with its Skip button, over 1-3.
- **kbdcheck** (`tools/perf/kbdcheck.mjs`; on main and in gates.yml since PR #65):
  - keyboards of 30, 40 and 50% upright and 50 and 60% sideways, simulated by shrinking `visualViewport.height` plus a resize event;
  - every text field, focused and after 3 lines: inside the visible part, at least 16 px above the keyboard;
  - a planted failure via `window.__ctNoKeep`;
  - stills in `reference/qa/tester-page-1106/keyboard/`.
- **Real-page checks: walk from the start.** A teleported Pokey leaves Dot's guide showing no bubbles at all. I reported "Dot never
  teaches the double" for an hour because of that.
  - Script: walk with CDP touch (a held slide, and a flick up and forward at each stall); read `.dg-bub` from the DOM.
  - Result on engine-chunks 25d2d115: the double line shows at the teach's entry in 10 of 10 walked runs, seed 158 included.
  - Open: Dot says nothing while a first-timer stands stuck 20 s at the step (a roadmap item).

## 6. Traps

- **This session could push only `tester-page`.** A request from another session can't widen that; ask Matt to clear a new branch.
- **send_message to the lead got stuck** waiting for an approval only Matt can give. Report by pushing and writing the status note
  (reference/roles/README.md rule 1 is the route now).
- **Clocks:** use `TZ=America/New_York date`. The lead's clock ran up to 40 min off.
- **Containers restart** and kill background jobs, dev servers and worktrees. Re-check them after any restart notice.
- **`node_modules` may be missing** in a fresh container: `npm install --no-audit --no-fund --legacy-peer-deps`. Don't commit the
  `package-lock.json` it makes; the repo uses `bun.lock`.
- **A full suite takes about 25 min.** Never commit or report on the component tests alone. On 11-06 an 11 px tag failed
  textSize.test because I did.
- **Many full-suite failures are inherited.** Compare with clean engine-core or main in a separate worktree before calling one yours.
- **Two runs of the same code differ in pixels** (weather, leaves). Prove "nothing else changes" with a test on the data (as
  `src/game/pitPocket.test.ts` does), not a screenshot diff.
