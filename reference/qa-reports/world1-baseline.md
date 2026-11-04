# World 1 baseline: played in order, judged like a player (quality supervisor)

**Status: DRAFT.** 1-1 to 1-8 are judged in both orientations. 1-9 and Venom Fang (1-10) are filled in below as their clips land
(see "Open"). Started 2026-11-04 2:32 AM ET.

**Base.** Game code at b8c4a7c5 (`src/` is identical to origin/ccr-0d59a91c at 2c1f6b46 and to origin/main: `git diff --stat` on
`src` is empty). Layout roll 1 (seed 1) for every stage. Normal for the first-timer bot ("adult" thumbs); Easy not judged here.

## How this was watched (method: reference/methods/quality-review.md)

- **Real play, real game.** `tools/quality/botlog.ts` runs the first-timer bot (`tools/inspect/firsttimer.ts`, the real engine through
  `realPlay.ts`) and logs every frame: the pad pressed and Pokey's state. `tools/quality/botrec.mjs` replays that log in the real
  game in a browser (dev server). Pokey is put back on the logged run each frame, and everything else runs and draws as on a phone:
  the camera, Dot, the HUD, the art. Sideways is 844x390 at 15 fps; upright is 390x844 at 10 fps. Venom Fang uses
  `tools/quality/bosslog.ts` (the boss bot in `bossBot.ts`, as `bossFair.test.ts` plays it).
- **Clips:** `world1-baseline/clips/<stage>-side.mp4` and `-up.mp4`. These are 640 px, 10 fps review copies. Full-size ones can be
  rebuilt: `npx tsx tools/quality/botlog.ts <stage> 1 adult run.json`, then `node tools/quality/botrec.mjs <port> run.json <dir>`.
  Captions show the stage, the clock, lives lost and the bot's stuck spots.
- **Stills:** `world1-baseline/stills/sheets-<stage>-<side|up>-N.jpg`. These are contact sheets with a frame every 5-22 s, each
  frame captioned with its clock. Every time quoted below can be checked on them.
- **The bot is a tool with known limits (D15), not a player.** It cannot climb the mushroom bounce walls (it stands about 9 s and is
  put further on: 10 rescues on 1-1, 3+ on 1-3, 19 on 1-7). It can't do the squirrel lift on 1-4. It times out on 1-4 and 1-7. So
  this report judges what the stages *contain and show*, which the clips prove. It does not judge how hard they are for a person;
  that waits for the bot fix (lead: fix-petals after the restart).
- **My own tool's slips, named.** The 1-1 to 1-3 clips were recorded as a desktop browser, so Dot's tips there read "Press Space",
  "press J". The recorder now emulates a phone (touch, coarse pointer, `botrec.mjs`), and 1-3 sideways onward show the touch words
  ("Flick up onto the mushroom to bounce"). The "Tips off" toast at the start of some clips comes from the tool's own click on
  "Skip tips".

## The world in one paragraph

Played in order, World 1 is one stage played six times with a different counter on top. 1-1, 1-2, 1-3 and 1-5 open on the same
shot: the same hop stones, the same petal row, the same dirt banks. Each fills its second half with the same piece, a mushroom,
a tall earth pillar and a plank of three petals, laid again and again until the two-minute clock is met: about 10 times in 1-1,
9 times in 1-5, and 6-7 times in 1-3. 1-6 and 1-7 fill their middles with the same pieces too. This is by design: every World 1 finish is
`fillTo()` in `src/game/w1Sections.ts`, a shuffle bag of three pieces drawn until the quick player's clock says two minutes. The
validator (fun-validator, fix-petals) measures 1-1, 1-2, 1-5 and 1-6 as 84-99% alike. Nothing in 1-1 to 1-5 costs anything when
you miss: a missed jump lands on soft ground, and the bot lost 0 lives in 1-1, 1-2 and 1-5. The stages that break the pattern are
1-4 (a vertical climb), 1-6's opening and closing lianas over water that takes a life, and 1-8 (a run along one long branch with
real pits). Those are the best of the world, and they are short islands in it. Matt's words fit what the clips show: "plain,
repetitive... a sludge."

## Stage by stage (played in order; "same as before" means against the stages before it)

### 1-1 Into the Canopy (sprint) · clips 1-1-side / 1-1-up · bot: shrine 3:34, 0 lives, 10 rescues
- **What it is.** 0:00-0:40: hop stones and low stumps, with petals in arcs. 0:40-0:55: Dot teaches the double jump. 0:55-1:15:
  the first mushroom bounce. Then 1:06-3:29 is the finish: mushroom + earth pillar + plank unit at 1:06, 1:17, 1:39, 1:50, 2:12,
  2:23, 2:45, 2:56, 3:07 and 3:29 (sheets-1-1-side-1).
- **Missing against §0/§0b.** No shape: there is no rest between groups, and the validator finds 100 s without one. No twist. It
  never gets tight. Nothing bites: 100% of beats after 30 s cost nothing. Padding: the finish is 52% of the stage. Only one tempo.
- **Name vs stage.** "Run the high branches of the kapok trees", and the whole stage is ground-level dirt banks.
- **Best moment.** The first mushroom bounce (0:55-1:15): a new move, taught, with a good arc.
- **Upright.** The action sits in a band at 30-55% of the screen height, and the lower ~45% is dirt cross-section
  (sheets-1-1-up-1 to -3). That is a lot of screen with nothing to read.

### 1-2 The Petal Trail (harvest 98) · bot: shrine, 102/98, 0 lives
- **Same as before.** The same ground, mushrooms and pillars as 1-1. The opening is the same shot. A "3 mushrooms under 2 planks"
  unit comes at 0:40, 1:10, 1:50, 2:10 and 2:20 (sheets-1-2-side-1). No enemy and no hazard in three minutes. The misty backdrop
  never changes.
- **Missing.** Only the goal differs from 1-1 (a petal count). Nothing to escalate: the validator finds "nothing new" on 10 of 16
  layouts.
- **Best moment.** Dot: "She said don't stop to smell the flowers. Picking's different." It is in her voice and in the story.
- **Upright.** Same framing as 1-1; only about 1.5 platforms of look-ahead.

### 1-3 Branch Snakes (purge 16) · bot: sealed door 15/16, 1 life, 9 hits
- **Same as before.** The third identical opening in a row (sheets-1-3-side-1, 0:00). The pillar + mushroom wall unit comes at
  0:15, 0:45, 1:00, 1:30, 1:59 and 2:29.
- **What's new.** Snakes and the punch (Dot teaches the sleeping snake at 0:10), plus ropes over dips (1:20, 1:49).
- **Missing: enemies with no job.** Every snake is a roadblock: walk up, punch once, walk on. None does anything else. Snakes only
  ever ask for the punch, so the triangle (stomp, punch, kick) is never used (PLAN-TO-80 §3).
- **Goal not on the natural path (D8).** The shrine is sealed "1 more" at 2:59 because the adult bot found 15 of 16 snakes (kid:
  1 of 8, botBaseline).
- **Best moment.** The first punched snake (a burst, +100).

### 1-4 Up the Kapok (ascent) · bot: time-out at 6:00, 84% height, 11 rescues
- **The first real change.** It is a vertical climb with a new sky-and-canopy look (sheets-1-4-up-1): trunks with vines, plank
  zigzags, rope shimmies (3:00, 3:36), a squirrel-lift puzzle (0:36-1:48), and a golden seed secret at 0:18.
- **Something bites.** 1:48 "fell back down from here 3 times": a fall costs height, the first real setback in the world.
- **Missing.** After about 2:00 the climb repeats one unit (trunk, plank, trunk, rope) to the top. There is no second mechanic and
  no moment near the top. (The bot can't judge the length: it timed out on the squirrel lift and the trunk tops.)
- **Sideways is cramped.** Pokey sits mid-screen and only about one ledge above is in view, so the next handhold is often off the
  top (sheets-1-4-side-1, 2:00-5:00). Upright is right for this stage. Sideways needs the camera to look up on a climb.
- **Best moment.** The squirrel lift and the golden seed: the first puzzle and the first secret.

### 1-5 Where She Walked (harvest 96) · bot: sealed door 46/96, 0 lives
- **Same as before.** It is the second petal hunt in four stages, in 1-2's misty backdrop. The pillar + mushroom + plank unit comes
  9 times from 1:12 to 3:12, the same unit as 1-1's finish. The validator measures 1-1 vs 1-5 as 0.998 alike.
- **The twist is skippable (§0.2).** "Twist: creaking branches." Frame by frame from 0:36 to 1:06 (every 2 s), the high planks with
  a snake and petals (0:38-0:40) and the petal rows overhead (0:44-0:58) are all passed underneath on the ground route. In this run
  Pokey never stands on a creaking branch, and the validator says both branch runs are outrun by holding right. The world's only
  breaking-branch beat is decoration.
- **Goal half off the path (D8).** The shrine is sealed "50 more" at 3:24 (bot 46/96, kid 42/77). Most petals sit on the planks the
  ground route skips.
- **Best moment.** None I can name. This is the weakest stage of the world (see below).

### 1-6 First Lianas (vine runner) · bot: shrine 5:34, 8 lives to water, 2 game overs, 12 rescues
- **New look.** An open canopy, a distant forest and a bright sky: the best change of scene since 1-4. Lianas at 0:00-0:41 and
  4:49-5:10, a log-push puzzle (2:13) and a seesaw (2:47; Dot: "See? The log holds that end down.").
- **Something bites at last.** The water under the lianas takes a life (8 for the bot, which swings badly; a person's number is not
  judged).
- **Same as before.** "First Lianas" is mostly not lianas. 1:00-4:29 is the mushroom/plank pool again (seed 1 picks the 'bounces'
  develop and finish, the same pool as 1-1 and 1-5). The validator measures it as 84-99% alike to 1-1, 1-2 and 1-5.
- **Polish.** At 0:41 Dot's "Flick up at the trunk, then slide up" plays while Pokey splashes into the water (a tip during a death).
- **Best moment.** The first liana swing over the gorge (0:21).

### 1-7 A Very Good Bush (stealth) · bot: time-out at 6:00, 1 hit, 19 rescues
- **What's new.** Bushes and the eagle. Dot teaches "Slide down in a bush to hide" (0:04), and the bot hides ("PHEW", 0:12). Bright
  valley art with purple flora.
- **The eagle doesn't threaten (§0.2, R-158).** It is a tiny dark shape at the top edge (sideways 1:00, 1:28). Upright it sits under
  the HUD's timber bar, about 60% of the screen above Pokey, with no shadow on the ground (sheets 1-7 up, 1:20-1:30). It reads as
  scenery. The validator finds holding right outruns it on 7 of 13 stretches. Matt: "you can outrun them every time. You don't even
  have to hide."
- **Same as before.** From 0:24 to 5:30 the mushroom wall + pillar unit returns 2-3 times per 22 s still (seed 1 picks the 'rope'
  develop and finish, which are bounceWall repeats). The bushes are mostly in the first 1:30.
- **Polish.** Dot's tip box sits low over the ground at 0:04 and top-left at 0:08: it jumps position. To confirm on the clip.
- **Best moment.** The first hide: Dot's "Low, like me in my bush. Meeca says she saw me, fibs." and then "PHEW".

### 1-8 The Long Branch (sprint/chase) · bot: shrine 4:16, 6 lives (pits, a snake), 2 game overs
- **A real change of shape.** One long branch high in the canopy, with gaps over real pits (lives lost at 2:36 and 3:56), snakes on
  the branch, a liana at 1:00 and a climb at 1:04. It is the first stage that feels like a run.
- **The chase isn't on screen.** Dot says "It's breaking behind us! Keep moving!" (0:14-0:16). In every frame from 0:10 to 1:04
  (every 2 s), the branch behind Pokey is whole and nothing chases him. The validator's nearest approach was 134 px on one Normal run.
  Either way, the player doesn't see the threat, so the stage's moment is a line of text.
- **Upright.** No collapse visible either (sheets-1-8-up-1, 0:00-3:50). The branch fills a band with sky above and canopy below,
  and gaps show only about one screen-width ahead.
- **Best moment.** The first gap over a real pit with the branch running on: the closest World 1 comes to tension.

### 1-9 The Boa's Branches (gauntlet) · bot: sealed door 15/20, 3 lives (boa), 16 hits
- **Same as before.** It is the fifth stage to open on the same hop stones and petal row (sheets-1-9-side-1, 0:00), in 1-7's valley
  backdrop. It plays as 1-3 with more snakes: on the ground, on planks, and a sleeping coiled guard (0:27). The validator measures it
  as 62% alike to 1-3 and "nothing new" on 15 of 16 layouts.
- **Something bites.** The boa's guards take lives (1:19, 1:46), the first World 1 stage where enemies cost anything. But there is
  still one answer: walk up and punch.
- **Slot role missed (§0b.6).** X-9 is the run-up to the boss, and nothing here builds toward Venom Fang (no boa set piece, no
  escalation of the guards).
- **Goal off the path (D8).** It ends at 2:03 at a sealed shrine with 15 of 20 guards.
- **Best moment.** Dot: "Too small to be worth chasing. Best thing about me, honestly."

### 1-10 Venom Fang (boss) · boss bot: won on Normal in 20.1 s (sideways, 1 hit) and 20.0 s (upright, 0 hits)
- *Clip recording.* The fight as the boss bot plays it lasts 20 seconds. PLAN-TO-80 §5 calls the bosses "wait for the glow": one way
  to hurt each. Judged when the clip lands.

## What feels the same (the whole world)
1. **One unit as filler.** The mushroom + earth pillar + plank unit is the second half of 1-1, 1-3, 1-5 and 1-7 and the middle of
   1-6. It is what Matt plays for most of World 1. Source: `fillTo()` finishes in `w1Sections.ts` and the shared POOL bodies.
2. **One opening.** 1-1, 1-2, 1-3 and 1-5 start on the same shot.
3. **One backdrop per stretch.** 1-1 to 1-3 use one forest, and 1-2 and 1-5 one misty forest. A stage never changes scenery
   partway through.
4. **One answer to every animal.** Snakes are punched and nothing else.
5. **One tempo.** No stage asks you to hurry or to wait (the validator flags it on every layout of every stage).

## What's missing against STAGE-RULES §0 and §0b
- **§0.2 hazards that matter:** no pits or water that take a life until 1-6. Creaking branches are skippable (1-5). The eagle
  doesn't threaten (1-7). The chase isn't shown (1-8).
- **§0.3 no beat repeated to fill time:** the finish unit, 6-10 times a stage.
- **§0b.1-2 rhythm and four parts:** no rests between groups. The "twist" sections are not twists: in 1-5 it can be skipped, and in
  1-1 it is the double jump on more pillars.
- **§0b.3 tempo:** nothing in hurry or patience form.
- **§0b.5 pairs:** run+jump is the only pair in 1-1. Branches + vines (the research's own World 1 pairing) never happens.
- **§0b.6 slot roles:** 1-5 (the mid-world spike) is the weakest and easiest-looking stage of the world, not a spike.
- **Enemy jobs (R-159):** none.
- **Memorable moments:** 1-4 (squirrel lift, golden seed), 1-6 (the first liana over the gorge) and 1-8 (the long branch). Four
  stages have no moment I can name: 1-1's finish, 1-2, 1-3 and 1-5.

## The best moment of the world
**1-8's long branch**: the camera up in the canopy, real gaps over real drops, snakes in the way and a liana at the end. It is the
only stretch that asks you to keep moving and punishes a slip. Runner-up: **1-4's climb**, the first time the camera turns
upward, with a puzzle and a secret.

## The weakest stage
**1-5 Where She Walked.** It is the second petal hunt in four stages, in the same misty backdrop as 1-2. It is 0.998 alike to 1-1.
Its one new mechanic (creaking branches) is passed underneath. The goal is half off the path, and the bot reaches a sealed shrine
"50 more". It sits in the world's mid-world spike slot (§0b.6).

## Score: 38 / 100 for World 1 as it stands (draft until 1-9 and 1-10 are judged; checked against the clips above)
| Area (weight) | Score | Why (the proof) |
|---|---|---|
| Variety in sequence (25) | 7 | Four stages open on one shot; one unit fills the second half of four stages and the middle of a fifth (1-1, 1-3, 1-5, 1-6, 1-7); 84-99% alike (validator). The 7 is 1-4, 1-6's lianas and 1-8. |
| Challenge, hazards that bite (20) | 5 | 0 lives lost in 1-1, 1-2, 1-5; soft ground under misses; branches skippable, eagle outrun, chase invisible. Credit for 1-6's water and 1-8's pits. |
| Toolbox used, mechanics building (15) | 6 | Double jump, bounce, punch, rope, climb, puzzle, bush, liana are all taught; few come back combined (no pair beyond run+jump in 1-1; branches + vines never). |
| Moments (15) | 7 | 1-4, 1-6 and 1-8 have one each; 1-2, 1-3 and 1-5 have none. |
| Shape and escalation (15) | 5 | No rests, no four-part arc, finish = padding (52% of 1-1); 1-5 is a dip, not a spike; 1-8 then 1-9 is the only real climb. |
| Polish on the phone (10) | 8 | The art is good and Dot's lines are in voice. Against it: the upright dirt band (~45% of the screen), the cramped sideways climb (1-4), Dot's tip during a death (1-6), and the jumping tip box (1-7). |
| **Total** | **38** | |

38 is under Matt's 55. I'm judging the world
in sequence against our own bar, while Matt rated the whole game, including a fresh first impression of 1-1. Where we agree: World 1
is plain and repetitive, and its best parts (1-4, 1-6's lianas, 1-8) are short islands.

## What I'd change first (for the lead and the World 1 plan review)
1. **Kill the `fillTo()` finishes.** Each finish becomes a designed part 4 (§0b.2) built from the stage's own mechanic plus one from
   an earlier stage. The 2-minute rule is met by content, not by drawing the same three pieces until the clock is full (Matt,
   10-30: "more pieces").
2. **Give the twist a cost.** 1-5's creaking branches must carry the only route over a drop (crumbling may be required once taught,
   Matt 11-02). 1-7's eagle needs a ground shadow and a dive you can't outrun (R-158). 1-8's collapse must be on screen behind him
   the whole run.
3. **Real pits, taught early.** Water or a fall that costs a life by 1-2 or 1-3, after a soft-moss lesson (§0.5 "once taught,
   sloppiness costs something").
4. **Different openings and scenery per stage**, and a scenery change inside the longer stages.
5. **1-2 and 1-5 must not both be petal hunts** in the same backdrop. Give 1-5 the mid-world spike it is meant to be.
6. **Snakes get a second trick** (a strike with a 0.5 s warning, or a snake on a branch end you must stomp from above) so the punch
   is a choice, not the only key (R-159).
7. **Upright framing:** the camera's ground line should sit lower on flat stages (less dirt, more look-ahead); on climbs sideways,
   the camera should look up.

## Polish check (this report's own screens)
- Every time and claim above was read off a still sheet I opened (stills/), in both orientations for 1-1 to 1-8. 1-1, 1-3 and 1-5
  have an extra frame-by-frame check where a claim needed it (1-5 twist 0:36-1:06; 1-7 eagle 0:04-1:04; 1-8 chase 0:10-1:04).
- Rough spots in my own material, named: the keyboard wording in the 1-1 to 1-3 clips (tool; fixed for later clips). The "Tips off"
  toast (tool). Long "bot stuck" captions are cut off upright (tool caption, not the game). Clips are review copies (640 px, 10 fps).

## Open (before this is final)
- 1-9 and 1-10 judged from their clips; the score revisited after them.
- Re-record 1-1 to 1-3 with phone wording (tool fix in).
- After the bot's bounce-wall fix: re-run, and judge challenge from a bot that plays the stages through.
- Easy not judged (Easy should cruise, §0.5).

## Method used / Lessons applied / Method update
- **Method used:** reference/methods/quality-review.md (written for this job; first version). Watch each stage after the one before;
  stills every 5-22 s; frame-by-frame where a claim hangs on a moment; cross-check every structural claim with the validator and
  the builder code.
- **Lessons applied:** D26 (in order, never alone). D15 (the bot's limits are named, and its numbers are not used for challenge).
  D8 (goal off the natural path, 1-3/1-5/1-9). D23 (base stamped; `src` unchanged since the clips). D20 (commit ids pasted after the
  push only). Law 1 (my tool's rough spots named).
- **Method update (proposed):** (1) a recorder that replays the bot in the real game (`tools/quality/`) is cheaper and truer than
  stills from teleported shots: it shows what a player passes on the natural route. It should be the standard input for every
  world baseline. (2) Record as a phone from the start (touch + coarse pointer), or tip wording is wrong. (3) Never `pkill -f` a
  pattern that appears in your own command line (it killed my shell three times).
