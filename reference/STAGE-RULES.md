# How to build a stage: the rulebook

**Read this before building, rebuilding or checking any stage, puzzle room or generator rule.** It brings together Matt's rules,
what we took from his Gemini research (`reference/GEMINI-PCG-RESEARCH.md`, the full notes; `reference/GEMINI-LEDGER.md`, every
recommendation with its status in the game and what is next), and every mistake we have already paid
for, so nobody repeats them. If a brief from the lead session disagrees with this file, ask; if you learn a new lesson the hard way,
add it to section 6 in the same commit.

Last updated 2026-10-28.

---

## 1. Matt's fixed rules (never break these)

- **Phone only.** Touch controls only. Every stage plays upright and sideways. The loop is locked at 30 fps on purpose.
- **Length.** Every stage takes at least 2 minutes for a quick player, **on every roll** (5+ minutes is fine). Climbs count 20 s short.
- **Crumbling platforms** are never needed to finish. A broken one grows back after 30-35 s, only when it is off screen.
- **Climbing.** On a vine or trunk, straight up or down always climbs; only a diagonal slide jumps off.
- **Teaching.** The first appearance of every mechanic is taught, in a safe spot, before it can hurt.
- **Locked exits.** Dot (or Flicker while Dot is away) explains any locked exit; the stage shows what it requires.
- **Carrying.** Slower walk, no jump, no climb, no swing; a flick throws (up throws up, toward throws forward); a tap sets down.
  A puzzle room must give a walkable carry path (steps and ramps, no required jump), and the validator checks it.
- **Difficulty.** Easy is for kids about 7-12: 1-2 step puzzles, wider margins, a silent sparkle on the key piece once the player is
  clearly stuck. Normal is for older kids to adults: 2-3+ step puzzles, tighter timing, nothing automatic. Hints only when asked,
  in steps, never the answer. Normal goals: 87.5% of reachable petals, all rescues, 75% of predators (goals.ts).
- **New replaces old.** A rebuilt stage replaces the old one outright: no switch, the old code is deleted.
- **Show first.** Big screen changes are shown to Matt (screenshots, mock-ups) before they are built in.
- **Story.** Stage names, story beats and goal text stay as approved. Any new line is marked "(new, needs Matt's approval)".

## 2. The numbers a stage must meet (from the Gemini research, tuned for us)

| What | Rule | How it is checked |
|---|---|---|
| Dead time | No quiet stretch over about 4 s (deliberate rest before a set piece aside); aim ~2 s gaps on Normal, ~3 s on Easy. Only jumps, timing choices, enemies, vines and puzzle steps count as action; petals on flat ground never do (a petal arc over a gap counts half). | inspector `deadTime` |
| Rests | A short safe rest after every burst of action. | inspector `restCheck` |
| Sameness | No two stages of a world alike: cosine of weighted action 3-grams under ~0.78, and no matching 20-second stretch. | inspector `similar` |
| Variety across rolls | Two rolls of the same stage must really differ: diversity (mean 1 - cosine between rolls) about 0.35 or more. Today most hand stages are 0.87-1.00 alike between rolls: that is the next big job. | `tools/inspect/era.ts` over 200 rolls |
| Opening seconds | Nothing can hurt in the first ~3-5 s of plain walking; the first tip comes before the first hazard it teaches. | first-timer bot |
| Plain walk | No step, lip or dip that stops a plain walk dead; every dip has a one-jump way out; a jump into a face carries over its lip. | first-timer bot, kid bot |
| Jump forgiveness (30 fps) | Coyote time ~133 ms Normal / 167 ms Easy; jump buffer ~133 / 200 ms; ledge-landing forgiveness; head-bonk and shin-mantle corner correction. | engine; first-timer bot |
| Hotspots | No jump the kid bot (Easy, noisy thumb ~N(+90 ms, 65 ms) reaction) makes under 85% of the time, or the adult bot (Normal) under 70%. | inspector bots |
| Goals | Enough reachable pickups and enemies that Normal's goal is fair, not a perfect run. | inspector `goal` |
| Assets | No file over 4 MiB (the offline cache limit). | `npx vite build` |

## 3. Puzzle rooms (the kit: `puzzleKit.ts`, `puzzlePlay.ts`, `puzzleCheck.ts`, `puzzleCamera.ts`)

- A room is data: pieces placed on a platform id + 0..1 along its top + offset, wired like switches (all / any / not).
- **First lesson rooms:** no enemies, no deadly fall, can't be skipped, the room shows the idea by itself first (e.g. a log already
  holding the seesaw down). Then the player does it; then a twist.
- 1-2 steps on Easy, 2-3 on Normal. Puzzles never cost a life. Every room has a reset post. Lost items respawn from their source.
- **Narrow and tall,** so it fits upright and sideways. The camera fits the active piece and what it acts on (keyBox), zooms out
  upright only, never shrinks Pokey below the sideways scale (~0.5 screen px per world px on a 360-wide phone).
- A far switch and its gate are connected by something visible (a rope, a root, a trough) and the camera pans to the gate once.
- "Stuck" means back and forth with no progress, or two failed tries, not a clock. Hints under 10 words, concrete, never the answer.
- **Proof:** the validator proves each room (fails without its key piece, can't be skipped), and a real-engine test plays it through.
- Don't make every stage a puzzle stage: 2-3 puzzle moments per world, among real platforming.

## 4. Using the art (so each world and each replay looks fresh)

- **Use what Matt made.** Every prop, state frame and backdrop from his sheets has a place in the game. A piece packed but never
  drawn is a bug (check with a grep over `puzzleAtlasData.ts` keys and the stage atlases).
- **State frames matter:** a pressed plate shows pressed, a rung bell swings, a struck vine shows tangled, a lit lantern glows.
- **Rotate looks by the roll:** where a world has several props or decor sets for one job, the layout roll picks among them (a retry
  keeps the look, a fresh roll changes it), with a cooldown so the same set isn't used in two stages in a row.
- Each world goes through the day: its far backdrops change across its stages (`stageBackdrops.ts`).
- New art comes from Matt's Gemini sheets: give him copy-paste prompts with the reference to attach (key colour: magenta, or green
  when the subject wears pink), then cut with `tools/art/w5puzzle/cut.py` and check the cuts on a dark background.

## 5. The checks, in order, before anything goes to Matt or the QA testers

The lead session runs these itself on every helper's branch before merging it. A helper's report is not proof: nothing reaches the
test link, the QA testers or a release until the lead has re-run them, on more than one roll, and read the screenshots.

1. `npx tsc --noEmit -p .`
2. The stage inspector on the worlds you changed: `npx tsx tools/inspect/inspect.ts --worlds N` (dead time, rests, sameness, goals,
   length, kid and adult bots). **Check more than one roll** (`--seed 1/2/3`), and the 200-roll tool `tools/inspect/era.ts` when a
   stage's layout code changed: a fix that only holds on seed 1 is not a fix.
3. The first-timer bot (`--firsttimer`, Easy and Normal): opening seconds, tips before hazards, stuck spots, Dot pacing.
4. The puzzle validator and the real-engine play-through tests for every room.
5. The full suite: `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts`.
6. `npx vite build` (nothing over 4 MiB). Before committing: `git checkout -- dev-dist; rm -f dev-dist/registerSW.js`.
7. Screenshots of what changed, upright 390x844 and sideways 844x390 (a dev-hooks build, `NODE_ENV=development npx vite build`,
   lets you place Pokey in a room). Then the test link (HANDOFF §6), then the QA testers.

## 6. Mistakes we already paid for (don't repeat them)

- **2-2 drowned you 0.9 s in** (2026-10-28, live): walking right off into water before Dot's tip. Our bots only proved the stage
  could be finished. Rule: nothing hurts in the opening seconds; the tip comes before the hazard; test it with the first-timer bot.
- **1-7's eagle** hit from off screen every ~3 s before the hide tip: the first swoop must be a harmless warning, swoops come from
  on screen or with a clear tell, and "hide" must work the way a thumb naturally does it (a held down into a bush).
- **Waist-high steps and dips** stopped a plain walk dead (1-7, 1-9): only perfect up-and-over flicks got out. World 5 had already
  solved this (a jump into a face carries over; one-jump steps out of dips) and the rule wasn't carried to other worlds. Rules
  learned in one world apply to every world: put them in this file.
- **The push-log wall floated** with open air under it, so walking up to it carried Pokey into the water (a drowning loop). Walls
  reach the ground.
- **Dot was repetitive and came in too soon.** A minimum gap between her lines (~10-12 s, except a warning just before a danger and a
  locked-exit explanation), no repeating a tip once the player has done it, no re-teaching moves already used, under 10 words.
- **Numbers from one roll.** Every before/after table until 2026-10-28 was measured on layout seed 1 only. Check several rolls.
- **Rolls barely differ** (0.87-1.00 alike): "the details roll" is not variety. Variety needs real alternative section versions.
- **Art made but never drawn** (22 pieces of the World 1-4 sheets, found 2026-10-28). Check every sheet cell has a home.
- **The camera cut puzzle rooms off upright** (the level-height clamp). Fixed by keyBox framing; check upright screenshots of every room.
- **Two helpers both added the same thing** (puzzle rooms counted twice in the inspector). When working in parallel, say which
  shared files you touch; the lead session merges and checks.
- **Small-phone slowness** was the browser (an in-app browser drawing in software), not our code; the recordings now name the
  browser and graphics chip (`deviceInfo.ts`). Look there first.

## 7. Where things are

- Stage code: World 1, 3, 4 and 5-1..5-5 in `src/game/protoStage.ts` (`HAND_STAGES`), World 2 in `src/game/w2Stages.ts`, Meeca's
  stage (`5-M`) via `extraStages.ts`; 5-6..5-9 and Worlds 6-10 from `stageGenerator.ts` (to be replaced by the new generator,
  starting with 5-7..5-9). Stage names and goals: `stagePlan.ts`. The validator: `levelCheck.ts`. Stage length: `stageTime.ts`.
- The inspector: `tools/inspect/` (README in `tools/README.md`). Matt's art sheets: `reference/prop-sheets/`. Story:
  `reference/STORY-REVIEW-2026-10-27.md`, `reference/VOICE.md`. Everything else: `reference/HANDOFF.md`.

## 8. Quick start for a stage helper (so you don't have to hunt)

1. `git merge ccr-0d59a91c-oy3imz` in your worktree. Read this file, then the ledger rows your brief names.
2. Baseline: `npx tsx tools/inspect/inspect.ts --worlds N --seed 1 --json /tmp/before1.json` (and `--seed 2`, `--seed 3`).
3. The stage you change: its builder in `protoStage.ts` (search `plan === 'N-M'` or `HAND_STAGES`), or `w2Stages.ts` for World 2;
   its tests: `src/game/stage*.test.ts`, `w2Stages.test.ts`, `w3Puzzles.test.ts`, `w4Puzzles.test.ts`, `protoStage.test.ts`.
4. A puzzle room: copy the shape of an existing one (1-6 seesaw in protoStage.ts, 2-3 cage lift in w2Stages.ts, 4-6 shutter) and
   its proof test (validator + real engine).
5. Screenshots: `NODE_ENV=development npx vite build`, `npx vite preview --port 4301`, then Playwright with `window.__play(id, layout)`
   and `window.__engine()` to place Pokey (see `tools/art/w1to4/shots.mjs`).
6. Before reporting: the checks in §5, on seeds 1-3; update the ledger rows you changed; add any lesson to §6.

