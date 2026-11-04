# Method: quality review (is it the right work, and is it fun?) — quality supervisor

Role: reference/roles/QUALITY-SUPERVISOR.md. First written 2026-11-04 for the World 1 baseline. Proposed edits go in each report's
"Method update"; the lead merges proven ones.

## 1. Watch the real game, in order
1. Stamp the base: `git diff --stat <clip base> origin/main -- src` must be empty, or re-record.
2. Log the bot's run of every stage of the world, in order: `npx tsx tools/quality/botlog.ts <stage> <layout> adult <run.json>`
   (boss: `tools/quality/bosslog.ts <stage> <seed> normal <side|up> <run.json>`).
3. Replay it in the real game as a phone (touch + coarse pointer are built in): dev server
   `npx vite --port=4301 --host=127.0.0.1 --strictPort`, then `node tools/quality/botrec.mjs 4301 <run.json> <out> both 2`
   (upright `up 3` saves time). Three at a time on 4 cores: a world of ten stages takes about an hour.
4. Contact sheets: one frame every 5-22 s, captioned with the clock (see `world1-baseline/stills`). Look at every sheet, both
   orientations. Where a claim hangs on a moment (a twist, a hazard, a chase), go frame by frame every 2 s.
5. Review copies for git: 640 px, 10 fps, crf 35 (about 2 MB per 3-minute clip).

## 1b. In-build quality check on any helper's branch (STANDARD WORK, lead 2026-11-04: the method for every in-build check)
Don't wait for the helper's stills. Record its branch's real play yourself, then press the buttons a kid would.
1. `git worktree add /tmp/<dir> origin/<branch>`; copy `tools/quality/` in if the branch lacks it. Run `npm install --legacy-peer-deps`
   in the worktree. Do it there, not with a symlinked node_modules: a branch with new deps (pixi.js) fails to load otherwise.
2. Dev server from the worktree on a free port (`npx vite --port=4302 --host=127.0.0.1 --strictPort`). Check that the page loads
   (`window.__play` is a function) before recording.
3. `npx tsx tools/quality/botlog.ts <stage> 1 adult run.json` from the worktree (the branch's own engine and bot), then
   `node tools/quality/botrec.mjs 4302 run.json <out> side 2`. Cut `frames` to the stretch you need for a quick look.
4. Find the moment from the log (e.g. frames whose pad has `punch` or `kick`), then crop strips around it at full resolution.
5. Also run `npx tsx tools/inspect/botBaseline.ts --worlds <w> --seeds 1 --who adult --stages ...` on the branch vs the base
   (goal counts, lives, rescues), for regressions such as a goal the route no longer delivers.
**Measured (2026-11-04, R-159.1 check on w8-rope2 9ec60be2):** worktree + install 40 s; botlog about 3 s a stage; two 90 s sideways clips
(1350 shots each) about 6 min in a row on 4 cores; crops and verdict 15 min. About 25 min in all from the helper's push to a verdict
with proof. It caught two rule failures the branch's own tests passed: the coiled boa dying to punch-mashing, and a stun killed by
the next jab before its stars show.
**Caveat to state in the verdict:** Pokey follows the logged run, while the animals and hits are the browser engine's own response.
A divergence from the headless run is possible, so the proof is the frames, not the bot's numbers.

## 2. Judge each stage against the ones before it
For every stage, write:
- what it is, with clock times;
- what is the same as before (opening, units, backdrop, goal);
- what is missing against STAGE-RULES §0/§0b (shape and rests, hazards that bite, enemy jobs, a moment, escalation, tempo, pairs);
- the best moment.

Then, for the world:
- what feels the same;
- what is missing;
- the best moment and the weakest stage;
- a score out of 100 by area (variety 25, challenge 20, toolbox 15, moments 15, shape and escalation 15, polish 10), each with its
  proof.

## 3. Cross-check, never lean
- The validator (tools/validate, fix-petals) and the inspector give structure: likeness, repeats, padding, miss cost. Use their
  numbers as proof beside your eyes. Where they disagree with a clip, both of you look at the clip; nobody tunes a number to agree.
- The builder code tells you why (e.g. `fillTo()` in w1Sections.ts). Quote it.
- The bot is a tool (D15). Name its rescues and time-outs. Don't judge difficulty from a run it didn't really play.

## 4. Pitfalls already paid for
- Desktop recording shows keyboard tips; record as a phone.
- `pkill -f <pattern>` kills your own shell when the pattern is on your command line; use a small stop script.
- Wait for `window.__engine` with a guard (`typeof ... === 'function'`); a busy machine loads the page late.
- Report the score's arithmetic once and correctly (the areas must add up to the total).
