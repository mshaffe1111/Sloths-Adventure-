# How to build a stage: the rulebook

**Read this before building, rebuilding or checking any stage, puzzle room or generator rule.** It brings together Matt's rules,
what we took from his Gemini research (`reference/GEMINI-PCG-RESEARCH.md`, the full notes; `reference/GEMINI-LEDGER.md`, every
recommendation with its status in the game and what is next), and every mistake we have already paid
for, so nobody repeats them. If a brief from the lead session disagrees with this file, ask; if you learn a new lesson the hard way,
add it to section 6 in the same commit.

Last updated 2026-10-29 (6-8's lessons: the climb with water, nothing floats).

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

- **World 7: Pokey teaches himself (Matt, 2026-10-29).** Dot is gone for all of World 7 (the story's "Alone" chapter; she comes back in
  World 8). Pokey says the teaching lines and explains any locked exit himself, in his own voice, under 10 words ("Cracked tiles.
  Don't stand still."). No Dot perch, no Dot lines in World 7 stages.

- **Dot is a guide, not a narrator (Matt, 2026-10-29: "it feels like she's constantly nagging me... we give away the puzzle").** On Tips she
  speaks only for a first-time mechanic, creature or hazard (once per save), the water warning, a locked exit, and real struggle (two deaths
  in one spot, two failed tries); at least 30 s between non-urgent lines. Puzzle rooms never give the answer on entry; nudges escalate only
  on struggle. No code-drawn highlight boxes, rings or arrows: to point, Dot flies to the actual object.

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
| Variety across rolls | Two rolls of the same stage must really differ: diversity (mean 1 - cosine between rolls) about 0.35 or more. Today most hand stages are 0.87-1.00 alike between rolls: that is the next big job. Set pieces with no variety target (the lead, 2026-10-28): 4-3 Waterfall Steps and 4-7 The Long Drop; every other rule still holds for them. Accepted below the target (the lead, 2026-10-29): 4-6 Mist Kapok at about 0.20 (its mist, nest and pinwheel lessons are a fixed spine, and most wide ledges sit in the mist or by a flag or a nest, so a flavour has little room of its own) and 4-9 The Aerie at about 0.27 (World 4's finale reprises every idea, each taught part on every roll, so about half the stage is shared); the taught spine stays. | `tools/inspect/era.ts` over 200 rolls |
| Opening seconds | Nothing can hurt in the first ~3-5 s of plain walking; the first tip comes before the first hazard it teaches. | first-timer bot |
| Plain walk | No step, lip or dip that stops a plain walk dead; every dip has a one-jump way out; a jump into a face carries over its lip. | first-timer bot, kid bot |
| Jump forgiveness (30 fps) | Coyote time ~133 ms Normal / 167 ms Easy; jump buffer ~133 / 200 ms; ledge-landing forgiveness; head-bonk and shin-mantle corner correction. | engine; first-timer bot |
| Falls in climbs | A miss at a hop gap of a climb falls at most about one trunk section (450 px at the most): a catch branch under the gap, a double jump back up to its lower plank, or the gap closed into a step (Matt: catch ledges under high planks in tall climbs). A catch is never a shortcut: the level check's way is no shorter with it. | `w4Catch.test.ts` (4-1, 4-6, 4-3, 4-9, 50 rolls) |
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

- **Painted art for the big things (Matt, 2026-10-29).** Anything that sets the look of a stage, and above all anything that hurts
  Pokey when he touches it (water, pits, thorns, spikes, the main surfaces he moves on), is painted art from Matt's Gemini sheets or
  the Hugging Face pipeline, so it feels like the rest of the game. Small touches drawn in code are fine: a glow on a firefly, a
  sparkle, a highlight that makes something pop, a minor tweak. The line: if the change would alter how a major part of the screen
  looks, it needs a sheet. Then give Matt the Gemini prompt straight away instead of drawing it in code first; code drawing is only
  the stand-in while the picture loads or until the sheet arrives. His words, after the World 6 water went from a code-drawn murky
  fill to his painted sheet: "Sometimes quick fixes just don't work. That's the difference between a good game and a bad game. It
  takes the immersion out of the game if what you're looking at doesn't really feel like the rest of the game."
  (Before and after: `reference/prop-sheets/qa-notes/water-w6-painted.png`.)
- **Light underground and in the dark comes from sources (Matt, 2026-10-29: "if he's underground, it's not going to be bright").**
  Ambient is low and cool (deep blue-teal to near black); only torches/lanterns (warm, flickering), glowing fungi (small green or purple
  pools), glowworms and the way out give light; depth fades INTO darkness, never into haze. Fairness first: every obstacle and gap carries
  its own light or a lit rim and reads at least 1 s ahead on Normal (1.6 s Easy); Pokey never vanishes (a warm key from the light he passes,
  a cool rim, a contact shadow, never under ~60% brightness). Props are painted evenly lit so the game can light them; light sources are
  painted bright and separate so they can glow. Code glow (pre-rendered radial light sprites, additive) is a small touch and allowed.
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

## 5b. The polish bar (Matt, 2026-10-29: "it's not just getting it done, but it should have polish")

Working is the floor, not the finish. Before any report, the helper reviews its own upright (390x844) and sideways (844x390) screenshots
and a short video, at phone size, against every line below, and writes a **Polish check** in the report: each item, pass or fixed, with
the screenshot that shows it. The lead checks it again before Matt sees anything. Compare against the best of the game (Matt's Gemini
sheets, World 2's painted river, the painted dirty water, the painted rope) and his reference pictures.

1. **Painted, not drawn.** No major look or hazard drawn in code (§4): no flat rectangles, see-through panes, gradient blobs, dashed lines
   or placeholder boxes on screen. Code is only for small touches (glow, sparkle, dust).
2. **Nothing looks copy-pasted.** No visible tile seams, no texture stretched in strips, no single piece repeated until it reads as a
   pattern. Mix pieces, sizes and heights; set dressing in front and behind.
3. **Art matches what it is.** A web looks like web, water like water, a hazard looks dangerous, a safe thing looks safe. Art lines up
   with its collider: nobody stands in the air, sinks into a ledge or clips through a wall.
4. **Light fits the place** (§4): underground and night scenes are dark with light from sources; every obstacle stays readable.
5. **Pokey and the cast on model.** Right size, right colours, satchel on the correct side (strap over his left shoulder, bag on his right
   hip), wrist wraps; no off-model frames, no popping between frames. Big enough to read on a phone.
6. **Framing works both ways.** Upright and sideways each show the action, not half a screen of empty backdrop; the camera leads where
   the player needs to look.
7. **Text stays out of the way.** Speech boxes are short (under 10 words), don't cover the jump or the hazard, and the right character
   speaks (Dot where she's present; Pokey only in World 7).
8. **Every move it teaches is needed.** An obstacle you can just walk or steer round doesn't teach a jump.
9. **Moments feel like moments.** A first time (first swim, a reveal, a crumble) gets a beat: sound, a pause, the camera, an animation, not
   only a caption.
10. **Motion is smooth.** No jitter, snapping, frozen poses where something should move, or animations playing at the wrong speed.

If something can't meet the bar with the art that exists, say exactly what art is missing and give the Gemini prompt (or the Hugging Face
plan); never ship the rough version as finished.

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
- **The first-timer drowns where the inspector's bots never miss** (World 3's variety pass, 2026-10-28): real gaps over water at half a
  jump's reach, a stone a little lower and close by, a second-jump gap, and every liana chain over water cost the first-timer 2-12 lives a
  minute, while the noisy route bots cleared the same jumps 98% of the time. It plays short flicks, never a run-up, and tries the second
  jump only where the first has failed (a death over water). Over water: gaps a third of a jump, never a lower stone, no second-jump gaps
  (put those over soft moss), one liana chain a stage outside the vine stages; and measure the band with `--firsttimer`, not the bots.
- **A gap in the dark over water is a blind jump**: before the glowworms wake the gap cannot be seen. Gaps in a dark zone keep soft moss
  below (the first-timer drowned six times running in one).
- **Variety is a different mix of actions, not a different order.** The 200-roll tool scores rolls by their bag of action 3-grams: two
  versions of a section that use the same moves (hops and the dark, in another order) read 90-95% alike. A version has to lean on a move
  the others don't (lianas or roots, real jumps, prowlers, the eyes), and the roll's sections should lean the same way (a theme), or the
  stage still reads ~0.7 alike. A fixed piece in every roll (a climax, a teaching room) pulls the rolls back together.
- **A climb detour is invisible**: a tree to climb up and back down beside the path was walked past by the quick route (quiet stretches,
  short stages). Climbing counts only where the way on goes up it (a root up a wall too high to jump, `rootClimb`).
- **A high way the floor walks under is scenery** (Meeca's stage, 2026-10-28, Matt: "climbing is unneeded because you can just run
  straight across the bottom"): her trees, logs and stepping stumps all had the path going on under them. A climb, a branch or a log
  only counts when the floor beneath it goes nowhere: a gully deeper than a second jump (260 px) with stairs back at its near end, or a
  wall. Prove it per section: with everything above the path taken away and the trunks off, the validator must not reach the end, and in
  the engine a plain walk must stop (`tools/inspect/meecaPace.ts`, `meecaStage.test.ts`, `meecaReal.test.ts`).
- **Skills come from the save, not the hero** (2026-10-28): Meeca ran on Pokey's skill set, so anyone who had cleared 4-1 could open
  Pokey's leaf as her and glide over her gullies, and the validator (World 5: glide guaranteed) agreed. She has no leaf now
  (`meecaPlay.ts` filter) and her check walks her as at 4-6 (`meecaCheckStage`). Any stage played as someone else: check what it inherits.
- **"The vines swing wildly"** (iPhone tester, 2026-10-28). Not the frame rate: through the engine's 30 fps gate at 120 Hz, 60 Hz,
  uneven 8-50 ms frames and 100-250 ms stalls, with a thumb pumping, flicking or climbing, the old swing held 0.83-0.84 rad every time.
  Two real causes. (1) While he swung, the engine took the first vine in its list within reach as his own, so on a long grip near the
  next liana of a chain (1-6's gorge pair) it threw him between the two vines' pivots: on the old engine every chain of 1-6 gave 80-170
  jumps of 60-1000 px in 20 s of hanging on. His own vine now stays his. (2) The swing itself: ±47° at 1.9 s, pushed back up to full
  size after every catch. Now every liana swings on its own (Matt: Donkey Kong Country), from the vines' clock (`physics.ts`
  `vineAngle`), never from forces: up and down climb, left and right only turn him, letting go is the only choice; slower (2.85 s, Easy
  3.3 s) and calmer (at most 0.45 rad). `swingSetup` gives each vine its swing when a stage starts: no bigger than keeps it clear of the
  vines beside it with Pokey's body and a margin (`swingClearance`), and its own phase (the next liana of a chain `chainPhase` ahead, the
  widest leap window, never in step). Rules for anything with lianas: a leap from one vine to the next carries the swing's clock through
  the flight (`canGrabSwing(x, y, v, t)`); a jump from a ledge can wait for the vine; the sweet spot and the let-go are shares of each
  vine's own swing; measure release windows with `pressWindow` (the engine's early/late forgiveness included). Proof:
  `vineSelfSwing.test.ts` (no overlap; every liana-to-liana and liana-to-ledge jump at least 167 ms a swing on Normal, 300 ms on Easy).
- **Taking a control away can take a move with it** (Meeca's stage, QA 2026-10-29: "level with the lip and drops back"): to stop her
  gliding (she has no leaf) the stage let go of the jump hold whenever she was falling, and so on the frame a second flick came just past
  the top of the first jump, the engine's variable-height cut stopped the second jump dead (it gave 0 px). A second jump past the top was
  impossible on every second-jump bank. A filter on the controls keeps the frame of a new press whole; measure moves in the real engine
  with the stage's own filters on (`meecaQA.test.ts` 8: a 70% hold, the second flick anywhere in about 0.4 s).
- **A trap that holds you must let go of any thumb** (Meeca's chair): wiggling counted only left-right changes, so a thumb held one
  way, or tapping, sat her frozen in it for a minute with its line long gone. Count every new input (a change, a fresh slide, a tap, a
  steady push for a moment), keep its line up while it holds, and let go in the end whatever the thumb does (`CHAIR.giveUp`).
- **A trap that lets go must not catch again at once** (Meeca's silk line): free after shaking it off, she stood right on it, and a
  thumb sliding a little up as she walked on caught her again, over and over ("stuck at room 3's entrance"). It stays out of reach until
  she has stepped away (`SILK.away`).
- **Nobody is left stuck in silence** (Meeca's stage, the lead's QA brief 2026-10-29, an exception to §1's "hints only when asked" and
  §3's "not a clock", in Meeca's stage only; Matt confirmed it on both settings, 2026-10-28): QA stood 32 s in a room and nothing was said. Flicker nudges after about 20 s with
  nothing new done in a room (or at a trunk not carved), and more strongly at about 40 s; anything the room has not seen yet starts
  the clock again; the nudges point at the piece, never the whole answer (`meecaPlay.ts stepNudge`, `FLICKER_NUDGES`).
- **What a counter counts needs its word** ("M. 1/5" read as "my mark didn't count"): Meeca's HUD says "Warnings 1/5" (`goalInfo.word`).
- **World 6 on gen2: what the swing and creek stages taught** (2026-10-28/29; carry every one of these into Worlds 7-10, the checklist
  is `src/game/gen2/DESIGN.md` "Building a new world on gen2"):
  - *A pit or a floor under a liana makes the swing optional* (2026-10-28). A soft pit under the swing let him walk under it, climb out
    the far side and never swing. Under a liana either black water (a section piece's `water: true`) or a soft pit whose climb goes
    back to the swing's own ledge, never on to the perch (`pipeline.ts` `backPit`, ab64871); proof: the quick route swings every liana
    (`w6Game.test.ts`).
  - *The leaf glide crosses swing gaps* (2026-10-28). From World 5 on the glide reaches 457 px on the flat, so a perch inside that was
    reached without the liana. A perch lies past every jump and the glide from the ledge and from each step of the pit under it
    (`pipeline.ts` `jumpLinkGap`, the `land` placement's `minFor`).
  - *A level perch fails once the vines swing by themselves* (2026-10-29, vine-fix). A level perch past the glide's 477 px is out of
    the calmer swing's reach (the check links 480-510 px at most). Perches sit about 80 px above the swing's ledge and step back down
    after (`w6Swing.ts` `RAISE`, 460df03); the pipeline moves a perch the window can't reach (raised or lowered, then levelled).
  - *gen2's copy of the swing drifted from the engine's* (2026-10-29). The mirror of vine-fix's numbers missed 22ffd1b's stronger
    leap, so gen2 counted 1.40 s windows where the engine gives 1.27 s. gen2 now calls `physics.ts` `pressWindow` itself (`lianaRelease`,
    d533039). Never mirror an engine rule; import it.
  - *Liana-heavy stages ran short* (2026-10-29). The time model gave each liana a flat 2.5 s, so 6-1 with 17 lianas came out at 0.68 of
    what the model promised. A liana costs (period - window) / 2 + period / 2 (`pipeline.ts` `lianaSeconds`, 639df5d).
  - *Flags can't stand in the dark* (2026-10-29). Flags keep out of zones, so four dark stretches in a row left 6-6 with up to 9,000 px
    and no flag. Each dark stretch goes lit root, dark, lit root, and is never mirrored, so Dot's dark line on the first lit root
    comes before the dark (`w6Swing.ts` dark sections, 8334899). Proof: the flag-span test in `game.test.ts` on 30 raw rolls of every
    stage, Normal and Easy.
  - *Rooms dropped out of rolls* (2026-10-29). A puzzle room picked by weight was swapped or trimmed away on some rolls. A stage's room
    is `WorldManifest.required` (placed by the plan, never swapped or trimmed: f443b11); proof: the room once in every shipped roll.
  - *The swing and ground stages had to keep their sections apart* (2026-10-29). 6-4 and 6-6 are both sprints and 6-2 shared filler
    sections with the swing stages; curation's look-alike check (`--apart`: no 20 s stretch alike between a world's stages) then
    threw out most of 6-2's rolls (0.26 left). Which stage takes which sections is decided per stage (`w6Game.ts` `forStage`).
  - *A short bank between two creeks is a glide trap* (2026-10-28). Under 340 px the route glides over both creeks and the first-timer
    drowns. Banks between water gaps are 360 px or more (`w6Ground.ts` header).
  - *A watcher has to watch its own piece* (2026-10-29). Reeds whose watch zone spread to the next flat read the same in every roll
    and stacked with the pool's own watcher. `watchHere*` sockets watch only their piece (`w6.ts` `watch`).
  - *Easy's fewer animals leave long flats quiet* (2026-10-29). With the animals gone, three long flats in a row read 4.2 s quiet on
    6-5 Easy. Long flats carry a root knee (a hop) whatever stands on them (`w6Ground.ts` sunken yard, caiman pair, pools).
  - *Sections have a size*: 600 to 1700 px plus 370 px a liana (`w6Swing.test.ts`). Adding lit roots to the dark stretches meant
    trimming them back inside that.
  - *Animals stood on the take-offs* (2026-10-29). 82 hops on 6-2, 6-5 and 6-9 took off or landed within 120 px of an animal: a patrol
    covered its whole piece, and World 6's knee flats are short. gen2 missed it three ways: the pipeline didn't know the rule (it kept
    animals off the safe spots only), curation didn't measure it (its filters were levelCheck, the §2 numbers and the jump bots), and the
    rule lived only in the old generator's `stageQuality.test.ts`, which 5-7 and 5-9 passed by luck (wide flats). Now the pipeline keeps
    every patrol `JUMP_CLEAR` (120 px) from each take-off and landing, using the same jumps the check finds (`stageMetrics.ts`
    `jumpEdges`), and curation drops any roll with an animal by a jump (7770de7). The lesson: every rule a full-suite test holds a stage
    to belongs in the generator and in curation's filters too, not only in a test that runs after. And CLAUDE.md's suite command does not
    reach `src/game/gen2/`, so run both: the full suite and `npx tsx --test src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts`.

- **A vertical climb with water under it: every fall is the water** (6-8 Stilt Climb, 2026-10-29). The first build kept the rising tide
  about 240 px under Pokey, and the first-timer bot drowned 2-6 times a minute: not the tide catching a still player, but missed hops and
  lianas falling a row or two into it, plus walking off the outer end of a shelf past its root. What fixed it (World 6's band, 0.2 lives a
  minute on Easy, 1.2-1.7 on Normal): the water waits more than a row below him and only creeps when close (`risingTide.ts`); a catch
  under every hop's gap and every liana (a root back up to the liana's own ledge, never a short cut: `w6Stages.test.ts`); shelves run on
  past the root at their end, to the stage's edge when it is near. And two placement traps a 2-D zig-zag sets that a left-to-right stage
  never does: a liana's anchor at the height of a shelf above (pressing up there for a root grabs the liana instead), and two roots in
  line (holding up runs on past the shelf into the next one). The stage's tests check both, and play every root and hop in the real
  engine. The first-timer bot doesn't climb back out of a catch, so on climbs (4-1 too) it runs out its 6 minutes: read its lives a minute
  and its stuck spots, not whether it finished.
- **Ledges in the air: nothing floats** (6-8 v4, the lead's review, 2026-10-29). A stump, root arch or den (and any slab on spreading
  roots) grows out of the ground: hung in mid-air it looks wrong, however varied the pieces. It goes only where its own roots stand on
  the ledge under it or it stands on stilt posts (two, never one balanced pole); every stretch of a plank or log is held by a climbing
  root, a post, a brace to a trunk or a rope. Don't run a post from every plank down to the water: about 90 poles a stage read as a
  cage. Short holds to what is near, long posts only where nothing is (the crown). Check it in `w6Stages.test.ts` ("nothing floats").

## 7. Where things are

- Stage code: World 1, 3, 4 and 5-1..5-5 in `src/game/protoStage.ts` (`HAND_STAGES`), World 2 in `src/game/w2Stages.ts`, Meeca's
  stage (`5-M`) via `extraStages.ts`; 6-8 Stilt Climb in `src/game/w6Stages.ts` (its rising tide: `risingTide.ts`); 5-7 and 5-9 from the new generator (`src/game/gen2/`, its 16 curated rolls each: `gen2/game.ts`); 5-6, 5-8 and
  Worlds 6-10 from the old `stageGenerator.ts` (to be replaced by the new generator). Stage names and goals: `stagePlan.ts`. The validator: `levelCheck.ts`. Stage length: `stageTime.ts`.
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

