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

## 1b. The game gets harder as it goes (Matt, 2026-10-28)

- **Each world sits in its own difficulty band, and the bands climb world by world.** Inside a world, stages can go up and down
  (a breather after a hard stage is fine, a world's last stages are usually its hardest), but no stage may leave its world's band:
  World 2's stage 8 must never be as hard as a World 4 stage. Bands may overlap their neighbours a little, never by a whole world.
  Later on, players are expected to lose lives and replay stages several times: that is how games are. Never flatten the climb.
- **Easy is gentler, never empty.** Easy still asks for double jumps, timing, enemies and the tougher moves at some point; they are
  just easier versions: wider landings, more forgiving timing, longer warnings, fewer enemies at once. Don't remove a move from
  Easy; soften it.
- **"Too hard" from QA is checked, not obeyed.** Sort each report into one of two:
  - **Unfair (fix it):** hurt in the opening seconds; hurt before the tip that teaches it; a hit from off screen with no tell; a
    jump that needs a timing window under 167 ms on Normal / 300 ms on Easy, or a full-hold jump on Easy; a plain walk that gets
    stuck; a ledge reached but slid off; the controls not doing what the thumb did; a puzzle that costs a life; a goal that can't
    be met fairly.
  - **Hard but fair (keep it):** a move that was taught, now asked with tighter timing, in combination, or with an enemy, later in
    the game. Report it to Matt as intended difficulty, with the numbers, instead of changing it.
- **The bands are measured:** per stage, the first-timer bot's lives lost and the noisy bots' hardest-jump success; each world's
  spread is its band. A world whose band sits below the one before it, or a stage outside its world's band (above the next world's
  middle, or below the previous world's), is a bug. Gemini's floor still holds for every stage: the Normal bot clears each jump at
  least 70% of the time in Worlds 1-5 and 50% in Worlds 6-10; the Easy kid at least 85% everywhere.

## 2. The numbers a stage must meet (from the Gemini research, tuned for us)

| What | Rule | How it is checked |
|---|---|---|
| Dead time | No quiet stretch over about 4 s (deliberate rest before a set piece aside); aim ~2 s gaps on Normal, ~3 s on Easy. Only jumps, timing choices, enemies, vines and puzzle steps count as action; petals on flat ground never do (a petal arc over a gap counts half). | inspector `deadTime` |
| Rests | A short safe rest after every burst of action. | inspector `restCheck` |
| Pacing | Gemini's density table (Part 2 §4), per difficulty. Action density 0.75-1.15 actions/s Normal, 0.35-0.55 Easy, 1.1-1.4 a chase; bursts (rhythm groups) 10-14 s with 8-12 actions Normal, 6-8 s with 3-4 Easy, 15-20 s a chase; rest pads between bursts 1.0-1.2 s Normal, 2.0-2.5 s Easy, 0.8 s a chase; no walk with no action over 2.0 s Normal, 3.0 s Easy, 1.2 s a chase. | inspector `pacing.ts` (each card's pacing block) |
| Tension | Aim: a sawtooth across the stage (Part 1 §4): build, a breather in the middle, the climax near the end, an easy walk out. Not flat, not front-loaded. | inspector `pacing.ts` (tension in 9 parts) |
| Difficulty bands | §1b, measured: a 0-100 score per stage and setting (first-timer lives lost a minute, the noisy bot's hardest jumps, peak stress, the narrowest input window, dead time, length); each world's spread is its band. | inspector `bands.ts` (the band chart) |
| Sameness | No two stages of a world alike: cosine of weighted action 3-grams under ~0.78, and no matching 20-second stretch. | inspector `similar` |
| Variety across rolls | Two rolls of the same stage must really differ: diversity (mean 1 - cosine between rolls) about 0.35 or more. Today most hand stages are 0.87-1.00 alike between rolls: that is the next big job. | `tools/inspect/era.ts` over 200 rolls |
| Opening seconds | Nothing can hurt in the first ~3-5 s of plain walking; the first tip comes before the first hazard it teaches. | first-timer bot |
| Plain walk | No step, lip or dip that stops a plain walk dead; every dip has a one-jump way out; a jump into a face carries over its lip. | first-timer bot, kid bot |
| Jump forgiveness (30 fps) | Coyote time ~133 ms Normal / 167 ms Easy; jump buffer ~133 / 200 ms; ledge-landing forgiveness; head-bonk and shin-mantle corner correction. | engine; first-timer bot |
| Easy jumps | No Easy jump needs a full hold: every Easy stage is finishable with a ~70% hold (Gemini G8). Easy softens the place, it doesn't remove the jump: a wider landing, a step halfway up, or a catch ledge (`easyMode.ts easyHoldSoften`). | validator `easyHoldCheck`; gate `easyMode.test.ts`, rolls 1-3 |
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
  keeps the look, a fresh roll changes it), with a cooldown so the same set isn't used in two stages in a row. `artRoll.ts`
  `rollLook` does it (stages take turns between two halves of the looks, the roll picks within the half); `artDress.ts` is the
  dressing from Matt's puzzle sheets in World 1's rooms and Worlds 3-4 (pictures only: no platform, pickup or piece moves).
  `artDress.test.ts` fails on any kit atlas piece that is not drawn.
- **Where the World 1-4 sheets stand** (2026-10-28; `reference/prop-sheets/w1to4/`):
  - `pokey-carry`: all 16 poses used (carry, throw, set down, rope pull at a bell, crank at World 2's winch, lever push).
  - `w1-puzzle`: all 16 used. 1-4's squirrels' nest door opens as the lift tops out; a petal bundle rises as each 1-4, 1-6 and 1-7
    room's reward (a picture, not a pickup); 1-6's branch gate rises as the seesaw tips. Plates and the knot log are seen in the kit
    test room only (no World 1 stage has a weight plate).
  - `w2-puzzle`: 15 of 16 used, including 2-2's trough (dry while the sluice is shut, running once it opens). The fishing net is not:
    it is pink on the magenta key and lost its colour; it needs a re-paint on green.
  - `w3-puzzle`: all 20 used. The pressed stone plate is wired, but no World 3 room has a weight plate yet.
  - `w4-puzzle`: all 16 used.
  - The eight far backdrops: all assigned.
- Each world goes through the day: its far backdrops change across its stages (`stageBackdrops.ts`).
- New art comes from Matt's Gemini sheets: give him copy-paste prompts with the reference to attach (key colour: magenta, or green
  when the subject wears pink), then cut with `tools/art/w5puzzle/cut.py` and check the cuts on a dark background.

## 5. The checks, in order, before anything goes to Matt or the QA testers

The lead session runs these itself on every helper's branch before merging it. A helper's report is not proof: nothing reaches the
test link, the QA testers or a release until the lead has re-run them, on more than one roll, and read the screenshots.

1. `npx tsc --noEmit -p .`
2. The stage inspector on the worlds you changed: `npx tsx tools/inspect/inspect.ts --worlds N` (dead time, rests, sameness, goals,
   length, kid and adult bots). It also flags, per stage and setting, **pacing** off Gemini's table (§2 "Pacing": action density, burst
   length and actions per burst, slack rest pads, walks with no action over the limit; §2 "Tension": a flat, front-loaded or
   climax-less curve), and the **difficulty bands** (§1b): a world whose band sits below the one before, a stage above the next
   world's middle or below the previous world's, and Gemini's per-jump floors (Normal bot 70% in Worlds 1-5, 50% in 6-10; Easy kid
   85%). Run the bands with `--firsttimer` (step 3) and over the worlds either side of the one you changed: without the first-timer
   they score on the inspector's numbers alone, and a world is only judged against its neighbours in the same run. **Check more than one roll** (`--seed 1/2/3`), and when a stage's layout code changed, the 200-roll
   tool: `npx tsx tools/inspect/era.ts --worlds N --rolls 200` (add `--stages 1-4` for one stage; `--html`/`--json` for where the report
   goes). It counts the rolls that break the §2 numbers and lists the worst as `?layout=N`. A fix that only holds on seed 1 is not a fix.
3. The first-timer bot, Easy and Normal: `npx tsx tools/inspect/inspect.ts --worlds N --firsttimer` (`--stages 1-7,2-2` for a few
   stages). It checks §2's "Opening seconds" and "Plain walk" rows, §6's eagle and Dot-pacing lessons and the Gemini gates (survival
   per jump, minimum input window, peak stress, backtracking), and names the rule each finding breaks (HANDOFF §6, "Pre-QA pass").
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
- **A harmless lesson held a dangerous one back** (2026-10-28): no lesson comes before 2.5 s, and the petals' lesson at 2.6 s gave a
  six-second breather that kept the gap's lesson back past 1-8's first gap and 2-2's first river. A lesson fires only 340 px short of
  its thing, and Dot takes a moment to fly in: give the first hazard of a stage its own stage tip well before it, and prove the
  opening with `stageStart.test.ts` (real engine, real damage, both orientations).
- **What Dot teaches must count** (2-5, 2026-10-28): "Kick the shell!" sent the snapper sliding, it came back out dizzy, and the goal
  stayed at 0/17. Every way a tip teaches to beat an animal has to count toward the goal; check it in the real engine.
- **Dot's queue repeated a cut tip** (1-7, 2026-10-28): every time the eagle's warning cut her move tip, the tip went back in the
  queue and was said again, about every 11 s for the whole stage. Count how often each line is said (`tools/inspect/dotPace.ts`).
- **Meeca's bank stopped at trail height** beside a pit, so she walked under it and fell out of the stage (2026-10-28). A wall
  beside a pit reaches the pit's floor, not just the trail.
- **Two walks of one stage compared by graph key** (G8, Easy): pouring water splits a ground into pieces, so a held walk's piece and
  the full walk's ground never matched. Compare by platform id; and a boulder only the full walk rolls into a fall's slot is frozen
  for both walks, or the full walk reaches places the held one never can (4-3).
- **Kit anchors slid** (Meeca's stage): pieces sit at 0..1 along a platform, so widening a platform after placing them moved every
  piece on it. Settle platform widths first, then anchor.
- **Words that cover the speaker**: a thought bubble with no room above fell back below her head and hid her. With no room above,
  a bubble goes beside the speaker; check upright screenshots with the bubble up.
- **Lines that queue fall behind**: a 4 s reading floor let story lines pile up until they described a room she had left. A line
  that is stale (she has walked on ~500 px) is dropped, not queued.
- **The inspector's quick route walks through things standing on a bank** (2026-10-28, World 1's variety pass): a rock or stump drawn as
  a block on top of one long bank is not in the quick route's way, so its hop never counts, and a stage read as quiet where it is busy
  (1-1's opening, 1-9's ring). World 1's rocks and stumps now stand down into the ground with the bank broken around them (logHop,
  lowStumps). And soft pits read as two hops (a drop in, a hop out), never a jump; ropes the same before Shimmy Rope. Variety (era's
  action 3-grams) only moves when the letters change: bounces up walls, branches 240 up (no floor within 200: a jump), climbs that are
  the only way on, snakes, the eagle. Rearranging hops among hops changes nothing it can see.
- **Variety one section at a time doesn't show** (World 2, 2026-10-28): three versions of each section, each picked on its own, still
  read 0.83-0.95 alike on the 200-roll tool, because it compares the mix of things to do (action 3-grams) and every water crossing
  reads the same (logs, pads, stones: a river and hops). What works: one version (a flavour) that carries through the whole stage, four
  of them, differing in the heavy beats (animals, climbs and swings, puzzles), not only in the kind of crossing. Measure with
  `tools/inspect/era.ts` while authoring, not after.
- **One length number lies**: the time model and a real-engine bot disagree by about a minute on Meeca's stage (model 5:09-5:17,
  bot 4:16-4:25; the bot never hesitates). Give both, and say which one the target is on.
- **What the 200-roll tool can't see** (World 4 variety pass, 2026-10-28): its route walks straight along a floor past a rock lying on
  it (only a separate floor piece, a dip or a step, makes a beat), and a falling rock that lands below the path (4-7's) is never met.
  So a glide stage is all J and V to it, and 4-7 stays 99.8% alike however its sections roll. Variety the tool counts needs versions
  with different kinds of action (vines, waits, puzzles, foes), not the same jumps in another order; a roll-wide "ground" theme (hops
  or second-jump leaps between pieces) moved World 4 more than any single section did. Round 2: a flavour carried through the whole
  stage, with heavy pieces of its own after each section, moved 4-2, 4-5 and 4-9 to about half alike between flavours; stages made
  of one move (4-3's wet steps, 4-7's glides) stay 0.93-0.99 whatever is added, because their many jumps dominate the 3-grams.
- **The level check follows a swing from a ledge to a ledge, never from vine to vine** (2026-10-28): a chain of lianas over a real
  drop reads as unfinishable (4-4 is not judged by the check for that reason). Where a stage is checked, a swing over a drop is one
  liana from bank to bank (World 4's `swings`, windChain with one vine), as many in a row as you like.

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

