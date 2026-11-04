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
