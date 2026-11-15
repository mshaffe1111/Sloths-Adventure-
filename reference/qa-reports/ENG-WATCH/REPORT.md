# ENG-WATCH REPORT: the watcher is a real red light, green light (R-165.267, R-165.266)

**STATUS: NOT GREEN. Do not integrate yet.**
- F1-F4 are built, planted, accepted by the lead and pushed.
- The full suite did not finish by the cutoff. 4 kit tests it reached are red because of F1 (§9).
- castBots 1-7 has 7 rescues, traced to 1-7's layout and the late pits (§4).
- castBots 1-8: 40/40 on every row.

## EXACT NEXT STEP (the next engine member, xhigh, from t-eng-watch's head)
1. Settle the 4 red kit tests (§9), one at a time, reading each first.
   - Where a test pins the old START END or the old "next pass comes back the other way", re-state it as F1's rule: the pass starts at the end of its stretch farther from him. Keep every other assertion: the warn shows at the edge before the eye moves, Easy longer, two empty passes and it gives up. That is the lead-accepted rule replacing the old one, never a loosening.
   - Where it pins a glance-free rest (predatorWorld1 "the screech"), pass `glance: false` on that Post only if the test is about the pass alone. Otherwise assert the pass waits for the head to turn away.
   - The caiman food-chain test: decide with the lead whether F1 applies to the caiman (it rides a river on a clock). If not, gate F1 by data (PredatorDef `passAt: 'far'`, the eagle's default) rather than special-casing a kind.
   - Planted: each re-stated test must be red with F1 reverted.
2. Run the FULL suite to the end on the head (about 45 min on 4 shared cores; alone it is faster). Then: build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, seedlist --check, the tool tests, tierBots.
3. Then the lead integrates t-eng-watch with t-build-18. The cherry-pick conflicts are additive (Post.passes and Post.glance side by side; §4 castBots 1-8).
4. TUNE-17 and ENG-PETAL take §4's 7 rescues; TUNE-17 takes §6.

Branch t-eng-watch from origin/t-build-16 9de5e4aa. Packet: reference/packets/2026-11-14/ENG-WATCH.md (origin/ccr-ea739a2f-dfcee4).
Role card ENGINE.md. Times are pasted from `TZ=America/New_York date`.

## 1. PROOF (sent to the lead at 9:53 PM ET; proof/PROOF.md)
A player who keeps walking forward was never caught. Measured on 1-7 seed 1, real engine, real damage: **0 hearts at 8 of 9 eagles on Normal and 9 of 9 on Easy**. Standing in the open cost 2-3 hearts on Normal.
Seven causes, each read in the code (PROOF.md):
1. The pass started at the near end, behind him.
2. It was blind through its 2 s warn.
3. Its eye moves 320 px/s against his 246-265 px/s walk, and its stretch ended before the eye reached him.
4. Nothing followed him out of the stretch.
5. Rest looked at nothing for its whole 5.4 s cool. That is the head-away window Matt walked through; at f204 he is under the perched eagle's post with 5 hearts.
6. 1-8's still-fork eagle looks once ever (cool Infinity after its one pass).
7. Easy spares every eagle's first pass.

## 2. What changed (every sweeper, every stage: predators/core.ts, by data)
- **F1, its pass comes AT him.** In rest the eye waits at the end of its stretch FARTHER from him, and the pass crosses toward him (core.ts rest, `end`). A walker meets it.
- **F2, the glance (red light, green light).** Between passes the head turns on an uneven rhythm, seeded by its post (the same every run of a seed):
  - away a rolled while (the green light);
  - a head-cock, its tell: tellOf, 0.75 s Normal and 0.975 s Easy, never under TELL_MIN 0.5;
  - a look of a rolled while: MOVING in its view starts its dive's tell, and hiding before that tell ends calls it off, as a pass's dive does;
  - a still sloth is NOT seen by a glance, in the open too: freezing answers a glance, cover answers a pass;
  - a share of turns are fake-outs: a half-turn of 0.4-0.7 of the tell that never looks;
  - a perched one sees only within its reach of its post (280 px: what an upright phone shows past him);
  - **Easy**: away x easy.cool (1.5), the tell x easy.tell (1.3), never a fake-out;
  - **at a flag** its head stands down past the calm, so the first thing after a respawn is its warned pass (eagleKit.test "back at a flag" holds).
- **F3, the perched watcher is never a free pass.** It keeps glancing between passes, and on 1-8 after its one pass is spent (passesLeft only stops passes). Its glance is drawn with the four painted perched frames: away = profile looking AWAY from him; head-cock and fake-out = 'turn' (full face); look = 'down' toward him with its gaze shadow on his spot. The flying eagle breaks its far circle and turns in over him through its tell, then hangs over his spot with its shadow there for the look (sweepPose.ts; no new art).
- **One act, one heart** (core.ts landed; castPlay struck; engine stepCast). A dive that took a heart pulls up. Before this, a 3 s dive that aims at him took 2 hearts 1.2 s apart, the second with no tell.
- **Bots (4).** Every bot freezes on the head-cock after its own calibrated stopReact (0.3-0.4 s) and holds until the head is away; it can't in the air or on a liana. `FirstTimer.freeze: false` is the plant.
- **A counter fixed.** The bots' hit log named most eagle dives `other`: its nearest-foe rule looks within 160 px of where the foe is drawn, and the dive's box arrives from the eye or the post. causeNow now reads the kit's acting box first. eagleGlance.test holds that every 1-7 hit is named.

### The dials and their defaults (data: PredatorDef.glance; a stage's own over it: WatchRow.glance, WatchRow.glanceLesson)
| dial | default (EAGLE) | Easy | where a designer sets it |
|---|---|---|---|
| away (s), rolled each turn | 1.2-4.5 | x1.5 (easy.cool) | WatchRow.glance.away (the stage's still row, e.g. W1_STILL['w1-eagle']) |
| look (s), rolled each look | 0.9-2.2 | same | WatchRow.glance.look |
| fake-out share | 0.25 | 0 (never) | WatchRow.glance.fake |
| reach of a perched one (px) | 280 | same | WatchRow.glance.reach |
| head-cock (the tell) | EAGLE.tell 0.75 s | x1.3 = 0.975 s | the kind's tell (never under TELL_MIN) |
| glance on a lesson stretch | off (the lesson teaches the pass first) | off | WatchRow.glanceLesson: true turns it on |
| a stretch with none | | | WatchRow.glance: false |
The calm between passes stays the zone's (W1_STILL calm bands; kitCool).

## 3. Planted (reference/qa-reports/ENG-WATCH/plants.txt: each rule removed, its test goes red)
src/game/eagleGlance.test.ts (8 tests):
- F1 off: tests 1, 6, 7 red.
- glance off: 2, 3, 4, 5, 7, 8 red.
- landed off: 5 red.
- Easy fake-outs on: 3 red.
- The bot freeze plant is in the toy itself (freeze: false loses more hearts).

## 4. Numbers
### castBots 1-7, seeds 1-40, both settings, on ba6ba46d's code (castbots-1-7.txt)
| bot | Normal: pass, eagle hits | Easy: pass, eagle hits |
|---|---|---|
| kid | 38/40, 305 (lives 5) | 37/40, 37 |
| adult | 39/40, 71 | 40/40, 31 |
| child | 39/40, 98 (lives 1) | 40/40, 29 |
| middle | 40/40, 69 | 40/40, 24 |
| expert | 40/40, 59 | (Normal only) |
- No run fell under the 120 s floor.
- Before this branch (INT-9's 12-seed run on an earlier head, castbots-1-7.txt there) Easy took 0 hearts for kid, adult and middle. Normal's hits were filed 'other', and per run they were lower: kid 7.7, adult 1.9, middle 0.7, expert 0.4.
- The lead's note (10:31 PM ET): kid Normal at ~7.6 eagle hits a run is the walker paying. TUNE-17 checks the tier bots against the testers (BOTS.md) with the dials, so it is hard but fair.

**The 7 rescues, traced** (two runs per cause; every one PASSES on the base, origin/t-build-16; NOT GREEN):
| bot, seed | rescued at (x, t) | what | cause | owner |
|---|---|---|---|---|
| kid Easy 3 | 23104, t121.6 | a dip 54 px deep, the way on 161 px up, 5 fall-backs in 8.6 s | the screech catches him in the dip; the nearest cover is BEHIND him over the climb. F1 alone on the base reproduces seed 18 | TUNE-17 (1-7 layout: cover past the dip) |
| kid Easy 18 | 23330, t121.4 | the same dip | same | TUNE-17 |
| kid Easy 40 | 23215 | the same dip | same | TUNE-17 |
| adult Normal 24 | 23057, t150.2 | fell into this pit 3 times (far wall 202 px up), same stretch | stops for the glance and the pass at the lip, then a jump from standstill | TUNE-17 + ENG-PETAL (pit way-back) |
| kid Normal 16 | 35408 (stuck 20 s at 35891) | nothing in the way the bot sees, after the last eagle | not traced to its frame (time) | ENG-PETAL |
| kid Normal 40 | 34908 | fell into this pit 3 times (far wall 193 px up) | late pit, after the last eagle | ENG-PETAL |
| child Normal 13 | 35298, t645.9 | fell into this pit 8 times (far wall 190 px up) | late pit | ENG-PETAL |
- I fixed the bots' stuck clock to HOLD (not restart) while he waits still for a watcher. That removed every false "stuck: nothing in the way" line at the freezes; the 7 rescues stand.

### castBots 1-8, seeds 1-40, both settings (castbots-1-8.txt): this branch cherry-picked onto origin/t-build-18 ccdf2bf3 in a local worktree
- Conflicts were additive: t-build-18's Post.passes / kitPasses beside my Post.glance / kitGlance, kept both. The integration itself is not pushed: it is INT's job.
- **All 9 rows PASS 40/40**, none under the floor.
- The still fork's eagle now costs a Normal walker one heart a run (kid 40, adult 40 eagle hits). Before this, the proof shows it never looked again after its one pass, and on Easy it never hurt.
- Easy: 0 eagle hits, with its first pass spared (the lead's ruling); child 1.
- 1-8 Normal's 160-314 'other' hits per bot are the chase's hazards (rolling nut, fruit), not the eagle. The bots' attribution names only kit animals' boxes; ENG-PETAL or the 1-8 builder can name those.

### Lock (lock-watchers.txt): the 21 stages that lay a watcher (1-7, 6-1..6-10, 8-1..8-10), 16 layouts x both settings, base origin/t-build-16 vs this branch
- 20/21 unchanged.
- **1-7: enemies**, intended: its lesson eagles carry kitGlance false.
- The kit's runtime changes (F1, F2, one act one heart) are not in a built-stage lock by design; every stage with a kit sweeper plays them: World 1's eagle (1-7, 1-8), World 2/6's caiman (pass direction only: it has no glance dial).
- **Not run:** the whole-game lock. lockall on every stage took ~36 s a stage under tonight's load. My change can move built data only through the watch rows, which are the 21 stages locked here.

## 5. Clips and polish check (clips/: real page, every frame through the real touch pad, 1-7 seed 1 Normal; captions name f, its phase, eye vs him, hearts)
| clip | frames named | what it shows |
|---|---|---|
| 17-normal-glance-up.mp4 (+ -side) | f210 head away, f226 head-cock, f250 look, f297 away | the perched eagle's glance; he is frozen in the moss and not seen |
| 17-normal-caught-up.mp4 + 17-normal-caught-side.mp4 | f225 head-cock begins and he walks on, f248 look, f249 its dive's tell (0.77 s), f282 ONE heart, f374 out | a caught walk, told first, one act one heart |
| 17-normal-fakeout-up.mp4 (+ -side) | f765 a turn begins, f780 it turns away without looking (the fake-out), f847 a real head-cock, f870 its look | the flying eagle (#5) fakes, then looks; he is frozen in cover |
| 17-normal-sneak-up.mp4 | f164 he leaves cover as its pass ends, f204 under its post, f225 head-cock with him 196 px past it, f248 look with him 409 px past (out of its reach: unseen) | the reach rule: a head behind him, off his screen, cannot see him |
Named stills: 17-normal-glance-up_f210/f226/f250, 17-normal-caught-up_f226/f250/f282.

**Polish check (judged on the frames, upright and sideways):**
- Perched glance: PASS. Away = profile looking away from him; head-cock = full face; look = down at him. Sideways too: the bird is on screen below the sign.
- Reach: was a FAIL at 280 px (the bird half off the right edge, upright). Fixed: 240 px.
- Flying glance: passable, not polished. Its head-cock swings it in over him, larger and darker, and the look hangs it over his spot under the HUD. Its ground shadow during the look (alpha 0.35) cannot be seen on these frames. My first upright clip had the caption over the sky and hid the bird; the clips here have the caption at the bottom.
- Sideways, the perched eagle's TELL (wings up as it lifts off) passes under the progress sign. That is the existing tell pose (sweepPose perchedPose 'tell', BUILD-17), not new, but named.
- Every upright frame of 1-7 on this path carries the story note "A whole hour in that bush..." until it is tapped; the clip tool taps it away as a player does.
- The far-circling pose at rest is faint by design (SKY.far alpha 0.55). A player sees the flying eagle's head-cock as it "coming in", not as a head turning: an art question for the lead (a painted head-turn frame for the flying harpy, Hugging Face), not done tonight.

## 9. Gates (on the code of 7fb37e19 = ba6ba46d's src and tools; later commits are reference/ only)
| gate | result |
|---|---|
| tsc | PASS |
| full suite (the CLAUDE.md glob) | **NOT FINISHED**: 3091 ok, 8 not ok when I stopped it at 11:09 PM ET for the 11:25 cutoff (it had run ~44 min on 4 shared cores). Of the 8: **4 are MINE** (below), 4 are red on the base too |
| eagleGlance.test.ts (new) + eagleKit.test.ts | 14/14 PASS |
| build (BASE_PATH=/Sloths-Adventure-/) | PASS |
| chunkcheck | PASS |
| artcheck | PASS |
| drawcheck (1-7 among its stages) | PASS (650 s) |
| clipcheck | PASS (83 known) |
| knowncheck | PASS |
| generalitycheck | PASS (26 known, none new) |
| roadmapcheck | PASS (after unshallowing the clone; on the shallow clone it refuses: "proofs cannot be checked") |
| kbdcheck | PASS |
| buildcheck | FAIL, red on the base too: run alone, 1-1 Normal p95 152 ms against its 150 ms budget; the base alone 156 ms. 1-1 has no watcher; not this branch's |
| seedlist 1-1 --check | PASS (161 seeds) |
| tool tests (library, seedlist, yield, travelBots) | 34/34 PASS |
| tierBots.test (the bots still match the testers on 1-1) | 7/7 PASS |
| firsttimer.test + castBots.test (I changed the bot) | 20/20 PASS |
| lock, the 21 watcher stages | 20/21 unchanged, 1-7 enemies intended |
**RED AND MINE: 4 kit tests that pass on the base and fail here** (the old pass rule is pinned in them; F1 is the rule the lead accepted at 9:57 PM; they were NOT updated tonight):
- predatorHabits.test.ts:173 "sweep: no pass while he is outside its stretch; inside, the eye shows at the edge for the warn": expects its eye at the stretch's near end (200), gets the far end (1000), F1's rule;
- predatorHabits.test.ts:206 "sweep: in cover and still ... two empty passes and it gives up": its line "the next comes back the other way" pins the old alternation (F1 picks the end farther from him);
- predatorWorld1.test.ts:111 "eagle, the tell and the attack: a screech, two seconds of shadow at the edge": fails at "the screech" (the eye's start end, or the glance holding a pass while its head is turned);
- predatorCasts.test.ts:136 "the food chain past World 1: a tayra whose line ends at the caiman is chased off": the caiman's eye now starts from the other end, so it is not over the tayra when the test looks.
**This branch is not ready to integrate until these four are settled.**
**Red on the BASE too** (origin/t-build-16 9de5e4aa, run there alone tonight; not this branch's; owner ENG-16I or the lead):
- w1Arc16.test.ts:124 "1-6 on the difficulty meter ... Normal in DIFFICULTY.md:61's band";
- stageSheets.test.ts:63 "every sheet a built stage draws is in its preload list" (W1_ROOMS);
- gen2Pits.test "a bank beside a pit reaches past its floor": 1-6 seed 1 Normal, "bank at x 28090 ends 0 px over the floor at x 27933";
- softFalls11.test "8-3 Normal ... byte for byte as origin/main": layout 2's hash d8dfbb7e1484be3a, expected 7ffc517f0fbb583c.

## 6. EXACT NEXT STEP for TUNE-17 (the 1-7 tuner, data only, no engine)
1. Read this REPORT §2's dial table. The dials live in `W1_STILL['w1-eagle']` (src/game/gen2/worlds/w1Cast.ts), the stage's still row.
   - Add `glance: { away: [a, b], look: [c, d], fake: f, reach: r }` to 1-7's row to override the kind's default (predators/world1.ts EAGLE.glance).
   - Set `glanceLesson: true` only once the story keeper's teach line for the freeze exists (see 4).
2. Raise 1-7 toward its 5.5 band (R-165.266) with these, and with the tools it already has: the calm bands (W1_STILL calm teach/early/late) and cover spacing (minApart).
   - Shorter `away` gives quicker re-checks. A higher `fake` makes him freeze for nothing more often. Never raise `fake` on Easy: the kit forbids it.
   - Score each change on METER-1's ruler, with the caveat in 5.
   - Prove each change with `npx tsx tools/inspect/castBots.ts --stage 1-7 --seeds 1-40 --setting both --par 4`. The kid tier on Easy must clear 40/40 with honest misses only (the lead's ruling).
3. Check a walker on every stretch with `npx tsx tools/inspect/eagleProbe.ts --stage 1-7 --setting normal --modes walk,sneak`:
   - every stretch past the lesson must cost a walker at least 1 heart;
   - eagleGlance.test.ts "walking forward ... costs hearts" holds it.
4. ASK THE LEAD for the story keeper's line that teaches the freeze, a Dot line at the first glance (LAWS: the first appearance is taught; "no player words but the story keeper's"). Until it exists the glance is OFF on the lesson stretches (`glanceLesson` unset), so 1-7's first three eagles teach only the pass.
5. METER-1 (not mine): `tools/difficulty/score.ts` counts 1-7's eagles as 9 static creature beats. It reads neither the pass direction nor the glance: points 21.4 Normal, 14.15 Easy, the same before and after this branch. Its score is NaN on one stage, because SCALE needs the full set. For the watch term to read the rhythm it needs:
   - a glance's expected tells a minute: 60 / (mean away + tell + mean look), x (1 - fake) for real looks;
   - and the pass's crossing toward him.
   That is METER-1's packet, before TUNE-17 trusts the meter on 1-7.

## 7a. My own miss tonight (law zero)
- My 10:28 PM status message to the lead carried a TYPED time; the clock read 10:22-10:23 PM ET. That is lesson D30 repeated.
- Root cause: I wrote the time from my sense of elapsed work instead of from `date` in the same step.
- Countermeasure: every time I write now comes from `TZ=America/New_York date` in the same command, as LESSONS D30 says. Proposed method line: a member's message header is built by a command (`echo "ENG-X $(TZ=America/New_York date +'%-I:%M %p') ET"`), never typed.

## 7. Learned (what I would tell the next engine member)
- **Prove a threat with what the player DOES, not with the case the test was written for.** eagleFair.test proved "standing in the open is hit" and stayed green while every forward walker went through 1-7 untouched. The probe that found it walks forward, never hides, on the real engine, with real damage and the game's own shield (tools/inspect/eagleProbe.ts).
- **A watcher's direction is part of its fairness.** An eye that starts behind a walker and is barely faster than him is no threat at all. Measure the closing speed (eye - walk) against the stretch, not the eye speed alone.
- **A one-off pass rule becomes a statue** (1-8's Post.passes 1): after its last look, something must still watch, or it must leave.
- **The bots' hit log looked within 160 px of where a foe is drawn**, so a kit dive arriving from its eye was 'other'. A counter that does not count what its name says hid the eagle's real hits (D15 again: test the measuring tool).
- **A dev server reloads the page on any file change**, and a clip running on it dies or lies. Shoot clips on a server with watch and hot reload off (the clip server config is in Method update).

## 8. Method used, lessons applied, method update
- **Method used:** reference/methods/stage-fix.md and gates.md; the role card's day one. One exception: the base lock was taken on the base head for the 21 stages that lay a watcher (1-7, W6, W8), not on main for every stage (see §5).
- **Lessons applied:**
  - D7/D24: every cause is cited in code (PROOF.md).
  - D15: the bot's attribution was tested and fixed before its numbers were used.
  - D19: probe and clips call the same code the game runs (RealPlay; the real page through pressFrame).
  - D43: kit-wide, by data; generality PASS.
  - Law 22: eagleKit's respawn rule went red, and the CODE was fixed, never the test.
  - D55: context % in every message.
  - D57: the queue was read at every push.
  - level.md 21: a planted bot toy before anyone lists a stage on it.
  - level.md 28: castBots 1-40.
- **Method update** (proposed for stage-fix.md and gates.md):
  - (a) Every watcher or hazard change runs `eagleProbe.ts --modes walk,back,stand,sneak` on each stage it touches. "A walker who never hides loses hearts past the lesson" is a check, held by eagleGlance.test.
  - (b) Clips are shot on a dev server with `server.watch.ignored: ['**/*']` and `hmr: false` (a local config that imports vite.config.ts and is never committed). Two of mine died mid-run from a reload.

## 10. Not done tonight (named, never hidden)
- The 4 red kit tests (above): not settled.
- The suite did not run to its end (stopped at 3091 ok / 8 not ok).
- reference/handoffs/engine-core.md is not rewritten for the glance. This REPORT is the turnover until it is.
- METER-1 does not read the glance (section 6, item 5).
- No flying-harpy head-turn art (section 5).
- The whole-game lock was not run (section 4).
- A teach line for the freeze from the story keeper (section 6, item 4).
- Context at stop: ~33%, estimated.
