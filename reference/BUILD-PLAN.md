# Build plan: five lanes, measured times (R-7, R-10, R-11, R-12)

Matt, 2026-11-01:
- R-7: "figure out how to get the most out of our builds... using our continuous improvement, how to ensure that we're efficient with
  tokens... trying to match things that work in tandem..."
- R-10: "prioritize the biggest things and what brings the most and what are niceties... Things can go in after the launch." Tiers:
  **Day 1** (in at launch), **Important** (wanted, not required), **Parking lot** (after launch).
- R-11: "mark what we get out of it, how long it would take estimated, and the value it brings A to F."
- R-12: "Some of the estimated time frame seems way off. We've done everything we've done so far was within 3 weeks. And it's talking
  about 3 months of work." He is right: my day sizes were 2-4x padded. Every time below is measured from a past job.
- Decided: **five helpers at a time** (engine/WebGL, story, menus, World 9/10, tuning/fairness), files never shared; Worlds 1-5 onto the
  new generator is Parking lot.

Written by the roadmap keeper, 2026-11-01 10:30 PM ET (Matt's launch calls: R-149.1, .9, .15-.17, R-4.8) (time from `TZ=America/New_York date`), from reference/ROADMAP.md; phases rewritten 2026-11-04 2:33 AM ET for PLAN-TO-80. The lead decides
who starts.

## How the times were measured (R-12)

Each item's Time names the past job it is measured from. Two sources, both checked on 2026-11-01:
- **git:** a helper branch's first own commit to the merge that took it (84 merges since 10-28). For example: gen2-w7 (a whole World 7
  build) 9 h; w7-slide (a special stage) 5.5 h; menus-nav 2.2 h; journal-voice 1.5 h; dot-box 1.7 h; perf-fx 1.5 h; swim 1.5 h;
  polish-audio 3.6 h; polish-sfx 4.7 h; hf-art-ground 4.5 h; hf-cutscenes 2.6 h; w8-merge 2.6 h; gen2-ascent 3.4 h; w5-rebuild 5 h.
- **STATUS start and accept lines** (git under-counts a helper merged more than once): whatsnew 11:35 AM to 1:15 PM (about 2.5 h with its
  follow-ups); bot-fix 1:25 PM to its merge into the release at 2:50 PM (about 1.5 h); fix-petals about 2 h; menus A and B 8:32 AM to about 12:30 PM (about 4 h,
  mock-ups and Matt's approval included); icons-painted 12:45 PM (Matt's ask) to 5:25 PM (4.5 h for groups A-E, two redo rounds).
- **No history** (said so on the item, with a range): PixiJS stages, a boss rebuild, the story slot plumbing, Play Asset Delivery, input
  latency, 16 KB checks, a secret level, playable story moments.
Sizes follow the hours: S up to 2 h, M up to 6 h, L over 6 h. A lane runs about 6-8 helper hours a day (Nov 1: 8:30 AM to 5:30 PM,
with the lead's checks between jobs).

## One page for Matt

**Where we are (Matt, 2026-11-04 2:23 AM ET):** he rated the game 55 out of 100 ("a D if I was a kid": plain, repetitive, branches
and eagles you can outrun, enemies that don't matter, "a sludge" after five hours) and approved `reference/PLAN-TO-80.md`: rebuild World 1
to the new bar first, he plays it and rates it, and only then the method rolls out world by world. His rating of 80-90 is the gate.

**What launch needs (Day 1):** Worlds 1-10 rebuilt to that bar: hazards that bite (R-154, R-158), enemies with jobs (the stomp, punch and
kick triangle, R-159), stages with a shape (R-155, R-150), Pokey hanging under branches (R-160), every boss with three ways to win (R-161),
stage types and mechanics that build world to world (R-152, R-153), the swimming stage (R-5.22); Worlds 9 and 10 built and fair, with the
9-2 canopy and 10-8 Clockwork Gate showpieces; the Drake and the General finished, bosses 6-8 with their story-born third phases; the new
story start to finish, with the ledger and Wanted posters; the unfair spots fixed and Normal rising world by world; the blocking bugs;
painted icons B-E; the GPU change, so the app runs smooth on your three phones; and the Play Store gates. Every Day 1 item is graded A,
except the ones graded B for polish (R-2.4, R-2.8, R-4.3, R-1.15, R-6.25, R-6.27, R-1.16, R-6.28, R-5.23, R-6.30, R-156; each says why).

**Quality sets the date, not the other way round** (Matt, 2026-11-02 to the keeper: "even if it takes longer to get this thing pushed to a Google quality, we can't do it half-assed. It has to still be quality. And if that pushes the timetable, pushes the timetable. But right now, it would be a disaster. Because it just isn't fun."). The hours below are a plan, not a deadline: when a job needs more to be fun and polished, it gets more, and the date moves.

**The phases (PLAN-TO-80, Matt approved 2026-11-04).** Each item's lane row below says its phase. Hours are summed by script from §2's
rows (2026-11-04 2:33 AM ET); nothing was deleted to make them fit.

| Phase | What | Day 1 helper hours | How sure |
|---|---|---|---|
| Lane 1, all the way through | WebGL: GPU stages 0-6 and the big sheets (R-3.1 to R-3.7, R-3.12); then the gameplay it opens (Phase B and C rows in lane 1) | 21 h for the GPU stages | measured where a past job fits (perf-fx, warmup-5m), "no history" ranges for PixiJS (each row) |
| A: the World 1 slice | The measuring stick first (R-150.4 the mechanics table, then R-150.1 grown into the validator); hazards that bite in World 1 (R-158.1 the eagle's shadow lock, with R-5.10; R-154's branch part: snap twig, creaking limb, tipping root, about 2.5 h of its 12.5 h); the combat triangle and World 1's species (R-159.1); the four-part shape on World 1's nine stages (about 7 h of R-155's 30 h, at its 0.75 h a stage); hanging under branches (R-160.1); feel (R-152.7, R-156); Venom Fang three ways (R-161.1); World 1's open fairness items ride along (R-5.11, R-5.12); the bot that measures it (R-150.7, R-150.8 for 1-4) and the validator as a shrink-only gate (R-150.9); World 1's polish defects (R-6.31, R-6.33, R-6.34, R-6.37 1-2's pit edge), the camera (R-6.35 upright dirt band, R-6.36 cramped climbs) and painted pits (R-6.38), World 1 first. **Starting score (2026-11-04): World 1 38/100 (quality supervisor, reference/qa-reports/world1-baseline.md on origin/quality-supervisor); validator 18-62, average 41 (fix-petals, its overview page on origin/fun-validator)** | **68 h** (range about 52-94 h, from each item's own range) | sized for World 1 only, from measured history; every row names its past job |
| (Matt rates World 1) | 80+ rolls the method out; under 80, World 1 is fixed before anything else | not helper hours | not measured: Matt's play time and the fix rounds |
| B: Worlds 2-8, each rated | The same grammar in every world: R-150.2, R-150.3, R-150.5, R-152.1 to R-152.6, R-153, the rest of R-154 and R-155, R-158.2, R-159.2, R-160.2, R-161.2 (bosses 2-8 and Thornbark; R-1.15's third phases fold in), R-5.4 the difficulty climb, R-5.22 the swimming stage | 274 h on today's rows | **a guess: about 210-375 h.** Sized from Phase A's real hours: when World 1 is measured, these are re-sized by the same ratio |
| C: Worlds 9-10 new, the story wiring | World 9 and 10 built on the method (R-2.x, R-143.5, R-146.5 and R-2.7 the hold move, R-150.2's W9/W10 share), the Drake and the General (R-1.9, R-1.10), the story (R-4.x) | 114 h on today's rows | **a guess: about 90-155 h**, the same way |
| Alongside, any phase | Bugs, menus, the Play Store pieces, fairness outside World 1, boss endings and tips (R-6.x, R-147.x, R-5.x, R-1.2, R-1.6, R-1.7, R-1.16, R-151) | 62 h | measured (each row) |

**engine.ts in Phase A (the lead's call, 2026-11-04, PLAN-TO-80):** lane 1 keeps its GPU stage 0 change to engine.ts small and merges
first; then R-159.1 holds engine.ts, then R-160.1, one at a time, each merging the latest base before it starts and before it pushes.
Overlaps run as one job: R-158.1 with R-5.10, R-155 with R-150.3, R-161.2 inside R-1.9 / R-1.10 / R-1.15.
Phase A's calendar: the longest chains are GPU stage 0 (R-3.1, 3 h) then R-159.1 then R-160.1 or R-161.1 (about 18.5 h), and R-150.4
then R-150.1 then the World 1 shape pass (about 18 h), so **about 3 working days of building** at 6-8 h a lane a day (range 2-5), then
the quality supervisor's review, the test link and Matt's rating.

**The estimate, in three parts** (today's rows; Phases B and C are guesses until World 1 is measured):

| | What | How long |
|---|---|---|
| (a) Building | Day 1 about 559 helper hours (roadmapcheck prints 694.25 (11-09: R-165.77 added 4 h, R-165.84 1 h, R-165.85 4 h, R-165.86 2 h, R-165.87 3 h; 11-11: R-165.99 8 h, R-165.100 1 h, R-165.103 3 h, R-165.104 9 h, R-165.107 4 h, R-165.108 3 h, R-165.109 4 h): it also counts the keeper's own 8 h on R-7, R-10..R-12 and R-148.1; the lead added R-163, the level engine, 16 h, and R-164.1, 1-2's fall-to-ledge bug, 1 h, on 11-04 at 11:10 PM ET; R-164.6 and R-164.7, the pit column and HUD draw bugs, 3 h, on 11-05; R-164.11, the mixer's roll diversity, 3 h, and R-164.13, 4-7 under the floor, 1 h, and R-164.17, builder module state, 0.5 h, on 11-05; R-165.1-.34, the engine day's work (engine-core, footingOf, E3, the branches, W1 gameplay fixes, step 6, E4/E5, 1-1 and 1-2 as tests, specials, the whole-game variety baseline), 30.5 h of Day 1, on 11-05; R-165.36, the critic's four spec edits, 1 h, on 11-05, done at 1:26 PM ET; R-165.40, the cold-builder how-to, 1 h, and R-165.41, the approved 1-1 Dot lines onto engine-core, 0.25 h, done 2:47 PM ET, R-165.42, 1-2's W1 art gaps, 1 h, held, and R-165.43, old 1-2 measured, 0.75 h, done 1:33 PM ET, and R-165.45, the work held until 1-1 proves the engine, 3 h, on 11-05; R-165.48 to R-165.51, the funcheck findings 0.9.5 ships with as a named, accepted fail (1-1 gentle intro, dead walk, nothing bites; the lock-identical stage moves), 8.5 h, on 11-06 by the release clerk; R-165.58, the play recorder fix, 2 h, R-165.59, the tester-data deletion and the redacted review, 1 h, R-165.60 to R-165.62, the reach spec, the verdict schema and escalating help, 10 h, R-165.52 and R-165.53, the first 1-1 decisions Matt handed the lead, 2 h, R-165.66, building the team before Wednesday, 2 h, R-165.68, tester names out of main's files, 4 h, R-165.71, carrying who the game is for into the cards, 1.5 h, and R-165.54, Matt's float ruling applied, 0.25 h, on 11-07 by the new lead; R-165.72, Content's re-lay of 1-1 on the flown reach numbers, 10 h, on 11-09) + the Important I recommend about 60 h = about 619 h (the additions listed since 559 don't reconcile exactly to the printed Day 1; the printed number is the source) over five lanes. Since 2026-11-02 evening's 494 h: R-154 to R-157 (fun from what we have, 11-02) and Matt's PLAN-TO-80 (11-04): R-150.1 grown into the validator (+4 h), R-158 to R-161 (83.5 h, of which 26.5 h is Phase A and 57 h Phase B guesses); the lead's 11-04 morning batch: the bot fix (R-150.7) and six polish defects (R-6.31 to R-6.36), 9.5 h; then the icons tool fix (R-148.15), 0.5 h of recommended Important (D28's lesson line, R-148.16, was filed and closed the same morning: A-39); the lead's 11-04 mid-morning batch: the bot's 1-4 climbs (R-150.8), the validator gate (R-150.9), 1-2's pit edge and World 1's painted pits (R-6.37, R-6.38), 7.5 h, (the WebGL method's listing, R-148.17, was filed and closed the same morning: A-40). Lane loads, summed from §2's tables: 120.5 / 118.5 / 120.5 / 120.5 / 118 h | **about 15-20 working days** at 6-8 h a lane a day on today's rows; about 12-26 if Phases B and C land anywhere in their guessed ranges |
| (b) Fixed calendar | Your phone checks: Matt's rating of World 1 after Phase A and of each world in Phase B, five GPU checks on the three phones, then your final passes of Worlds 7-10 and every boss (about 9 h of your play) and one fix round after them (not measured yet; budget about a day). The Play closed test: 14 days with 12 testers. You decided (2026-11-01) the account, app ID, signing and test start later: when Day 1 lane work is about 80% done (R-149.9, R-147.1) | about 3-4 days after the build for the passes and fixes, plus your ratings (not measured); **14 days** for the closed test |
| (c) Critical path | The closed test. It starts when Day 1 lane work is about 80% done (about 431 of the 539 hours; about day 12-16 of building), so your passes and the fix round run inside its 14 days. If it waits until after your passes, it is building + passes + 14 days (15-20 + 3-4 + 14 = 32-38 days). Not measured, so not counted: the wait for your ratings between phases, Google's checks on a new developer account before the first upload, and Google's review of the production release after the test | **about 4-4.5 weeks** from now with the 80% trigger on today's rows; about 4.5-5.5 weeks if the test waits for your passes; the honest range is not known until World 1 is measured (PLAN-TO-80) |

So: about 4-4.5 weeks from now on today's rows, but that is not a promise: Phases B and C are guesses until World 1's real hours are in,
and quality sets the date. It was about 3.5-4 weeks on 2026-11-02; since then Matt rated the game 55 and approved the World 1 slice and
its rollout (R-158 to R-161), which is most of the growth. The widest numbers are R-153 (65 h, range 45-90) and R-161.2 (28 h, a guess,
range 20-45). Parking lot after launch: about 141 h (PLAN-TO-80's "Later" list is R-162), plus art round 2's money.

**The one thing that would make it slower:** the closed test's start. It waits for the 80% trigger (your call, 2026-11-01); every day it starts after that is a day later at the end. Google's checks on a new developer account aren't measured, so opening the account a few days before the trigger keeps them off the path.

**Wave 1 (the lead started it on Matt's go, 2026-11-04 2:28 AM ET; STATUS):** the release clerk (release-0.9.4), lane 1's GPU stage 0
(R-3.1), the World 1 validator and the mechanics table (R-150.1, R-150.4) and the quality supervisor's World 1 baseline (R-151). Next after
the first green round: Phase A's hazards and the combat triangle (R-158.1, R-154's branch part, R-159.1). The three-wave table of
2026-11-01 is replaced by the phases above (git history keeps it). The lead merges, runs the full gate once and sends you one test link
at the end of each wave.

## 1. The lanes and the files each owns

| Lane | Owns | Strong helper to reuse (HELPERS.md) |
|---|---|---|
| 1 Engine/WebGL | `src/game/engine.ts`, new `src/game/gpu/`, `package.json`, backdrop/ground drawing (`paintedBackdrops.ts`, `stageBackdrops.ts`, `groundArt.ts`), `dotTips.ts`, `dotLinesData.ts`, `src/audio/`, input (`inputEngine.ts`, `padControl.ts`) | none alive for GPU: fresh, high effort |
| 2 Story | `src/game/story*.ts`, `src/App.tsx`, `src/storyReader.tsx`, `src/components/StoryPlayer.tsx`, the boss coaching rows (by agreement with lane 1 for `dotLinesData.ts`) | fresh for plumbing (high); the story reviewers' notes |
| 3 Menus + art | `WorldMap.tsx`, `TitleSettings.tsx`, `HowToPlay.tsx`, `menuParts.tsx`, `src/components/satchel/`, `Satchel.tsx`; then lair art (`lair*.ts`) and the Drake (`bossDefs.ts`, `bossPlay.ts`, `boss910Data.ts`) | menus A, then menus B (top picks); icons-painted for lairs |
| 4 World 9/10 | `src/game/gen2/worlds/w9*`, `w10*`, `src/game/gen2/seeds.ts` (one file for every world's rolls: World 9 then World 10, never side by side), `boss1010Data.ts` for the General | the World 9 curator keeps World 10 |
| 5 Tuning/fairness | `tools/inspect/` (bands, bots), the stage files being fixed (`protoStage.ts`, `kitStage.ts`, `w*Stages.ts`), `goals.ts`, the stranded branches | bot-fix if alive |

`engine.ts` belongs to lane 1 only: a fix another lane needs in it goes to lane 1's queue (the 3-9 ring code is there, which is why
R-6.1 sits in lane 1).

## 2. Each lane's queue: Day 1 first, then value per day

Dependencies come first, whatever the value: the bands measure (R-5.1) before the re-run (R-5.2) before the curve (R-5.4); story
plumbing (R-4.1) before any text (R-4.2); GPU stage 0 before 1-6; World 9 before World 10; the hold (R-146.5, R-2.7) before the General
(R-1.10). Inside those limits each lane takes its next item by value per hour (A=6 ... F=1, over hours). Generated from ROADMAP.md.

R-150.2 and R-150.3 (Day 1 since Matt's 11-02 call) are split across lanes as shares (rows marked "share"), so no lane carries all 50 h; R-150.1 (lane 5) goes first because it blocks both. Lane loads are summed from these tables by script, never by hand (2026-11-02: hand tallies drifted 2 h in lane 5 and 1.5 h in lane 2).

### Lane 1: engine and WebGL (GPU, engine fixes, sound, controls)

| Group | Item | What we get | Value | Time |
|---|---|---|---|---|
| Day 1 | R-6.2 | 1-9's locked exit explained every time | A | 0.5 h (like qa-fix-meeca (20 min)) |
| Day 1 | R-6.4 | Picking up a stone never resets the room | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-6.1 | 3-9's ring can't be skipped; Dot explains the shut wall | A | 1.5 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-3.12 | The big animation sheets load on the GPU on every phone | A | 2 h (like perf-fx / perf-sprites (1.5 h each)) |
| Day 1 | R-3.2 | Skies and backdrops cost almost nothing to draw | A | 2 h (like perf-fx / perf-sprites (1.5 h each); the plan says half a day) |
| Day 1 | R-3.3 | The ground costs almost nothing to draw | A | 2 h (like perf-fx / perf-sprites (1.5 h each); the plan says half a day) |
| Day 1 | R-3.6 | Proof the game holds its frame rate | A | 2 h (like perf-fx / perf-sprites (1.5 h each)) |
| Day 1 | R-3.7 | The store app runs smooth and cool on real phones | A | 2 h (like warmup-5m (2.2 h), plus the phones) |
| Day 1 | R-3.1 | The base for smooth play on every phone | A | 3 h (no history for PixiJS: range 2-5 h; the plan says half a day) |
| Day 1 | R-3.4 | Pokey and the creatures stop dragging the frame rate | A | 4 h (no history: range 3-8 h; the plan says a day) |
| Day 1 | R-3.5 | Props and particles stop dragging the frame rate | A | 4 h (no history: range 3-8 h; the plan says a day) |
| Day 1 | R-6.26 | No player stranded in 4-3 | A | 2 h (no history: reproduce first (range 1-4 h)) |
| Day 1 | R-6.27 | The cave under the falls looks like shelter, as it plays | B | 2.5 h (like fix-petals (about 2 h start to accept), plus a check of every waterfall shelter) |
| Day 1 | R-6.33 | Dot never talks over a death | B | 1 h (like fix-petals (about 2 h start to accept)); Phase A (seen at 1-6); dotTips.ts is lane 1's |
| Day 1 | R-6.34 | Dot's box stays put | B | 1 h (like dot-box (1.7 h)); Phase A (1-7); verify on the clip first |
| Day 1 | R-6.38 | Pits that look like a fall | A | 3 h (like hf-art-ground (4.5 h) for a smaller set); Phase A; ground drawing is lane 1's (groundArt.ts); held by Matt's picture list |
| Day 1 | R-150.2 (W8 share) | Every generated stage plays differently, not run, jump, climb, repeat | A | 6 h of R-150.2's 34 h |
| Day 1 | R-150.3 (share) | Hand-built stages stop repeating themselves | A | 8 h of R-150.3's 20 h |
| Day 1 | R-152.1 | Wind changes where a jump lands | A | 2 h (like vine-fix (2 h)); after R-150.4 |
| Day 1 | R-152.6 | A difficulty arc Matt can review, measured world by world | A | 4 h (like the bot-fix re-baseline (inside its 2 h) + bot-fix + self-test (about 2 h)); after R-150.4; R-5.4 tunes to it |
| Day 1 | R-152.5 (new kinds share) | Moving platforms from World 2 on, in every world | A | 12.5 h of R-152.5's 18.5 h (five new kinds, about 2.5 h each: like swim (1.5 h) + art (30 min) + a teaching placement); after R-150.4 and R-152.7 |
| Day 1 | R-153 (share) | Each world has different kinds of stages, not ten start-to-goal runs | A | 1.5 h of R-153's 65 h (about 2.5 h a stage, like w5-rebuild; split by world when briefed); after R-150.4 |
| Day 1 | R-155 (share) | Every stage has a beginning, a build, a twist and a finale, with places to breathe | A | 7.5 h of R-155's 30 h (part of the hand-built pass, after wave 1; after R-150.1) |
| Day 1 | R-159.2 (share) | Every world's animals with a job | A | 10 h of R-159.2's 20 h (sized from Phase A's real hours; a guess for now); Phase B, after Matt rates World 1; lane 1 owns engine.ts |
| Day 1 | R-161.2 (share) | Every boss with choices | A | 7 h of R-161.2's 28 h (sized from Phase A's real hours; a guess for now); Phase B, split by boss when briefed |
| Important (recommended) | R-145.2 | Phones hear the jungle around them | B | 1 h (like polish-audio (3.6 h) / polish-sfx (4.7 h)) |
| Important (recommended) | R-6.19 | Dot's tips fit on narrow phones | B | 1 h (like fix-petals (about 2 h start to accept)) |
| Important (recommended) | R-145.3 | iPhone players hear the music | C | 1 h (like polish-audio (3.6 h) / polish-sfx (4.7 h)) |
| Important (recommended) | R-6.5 | High basket throws land | C | 1 h (like fix-petals (about 2 h start to accept)) |
| Important (recommended) | R-3.11 | A little smoother on slow phones | C | 1.5 h (like perf-fx / perf-sprites (1.5 h each)) |
| Important (recommended) | R-145.1 | Effects sit under the music instead of blasting | B | 2 h (like polish-audio (3.6 h) / polish-sfx (4.7 h)) |
| Important (recommended) | R-146.1 | Letting go of a liana does what the thumb meant | B | 2 h (like swim (1.5 h) / vine-fix (2 h)) |
| Important (recommended) | R-148.13 | Helpers can run drawcheck themselves instead of waiting for CI | B | 2 h (no history for a harness fix: range 1-4 h) |
| Important (recommended) | R-6.18 | Dot's tips never cover the way ahead | B | 2 h (like dot-box (1.7 h)) |
| Important (recommended) | R-146.2 | Touches respond on mid-range phones | B | 3 h (no history for input latency: range 2-5 h) |
| Important (recommended) | R-145.5 | Music changes with the moment, not one loop a world | B | 4 h (like polish-audio (3.6 h) / polish-sfx (4.7 h)) |
| Important (recommended) | R-150.6 | Vines that feel as good as they look | A | 4 h (like vine-fix (2 h) + pokey-anim (about 2 h); range 3-8 h); after R-150.4 |
| Important (recommended) | R-157 | Every hazard reads by its shape at a glance | B | 4 h (like polish-a1 (1.7 h) for each two of the four) |
| Important (if time) | R-146.4 | Proof every stage plays on every control setting | C | 2 h (like bot-fix + self-test (about 2 h)) |
| Important (if time) | R-148.6 | Dot's box can't cover the jump again | C | 2 h (like bot-fix + self-test (about 2 h)) |
| Important (if time) | R-6.23 | Approved Dot lines can't silently revert | C | 2 h (like fix-petals (about 2 h start to accept)) |
| Important (if time) | R-145.4 | Effects sound like one family | C | 3 h (like polish-audio (3.6 h) / polish-sfx (4.7 h)) |
| Important (if time) | R-3.9 | A smaller download and a faster first start on old phones | B | 6 h (no history for Play Asset Delivery: range 4-10 h) |
| Matt's call | R-146.6 | The control changes Matt already chose | C | 3 h (like swim (1.5 h) / vine-fix (2 h), four changes) |
| Parking lot | R-3.8 | We know how iPhones run it | D | 0.5 h (like qa-fix-meeca (20 min)) |
| Parking lot | R-3.13 | World 8 a little lighter to draw | D | 1 h (like perf-fx / perf-sprites (1.5 h each)) |
| Parking lot | R-146.3 | Better tester recordings | E | 1 h (like bot-fix + self-test (about 2 h)) |
| Parking lot | R-3.10 | Oversized art can't sneak back in | E | 1 h (like bot-fix + self-test (about 2 h)) |
| Parking lot | R-6.22 | Smoother slide and flip animation | E | 1 h (like pokey-anim (about 2 h)) |
| Parking lot | R-162.10 | A buzz in the hand on hits and chains | C | 1 h (no history: a guess, range 0.5-2 h) |
| Parking lot | R-162.4 | A stage that adjusts to how the player is doing | C | 4 h (no history: a guess, range 2-10 h) |
| Parking lot | R-162.3 | Depth: paths in front of and behind the main one | C | 4 h (no history: a guess, range 2-10 h) |

### Lane 2: story (rewrite, scenes, boss coaching lines; then 10-8 The Clockwork Gate, a self-contained special stage like w7-slide)

| Group | Item | What we get | Value | Time |
|---|---|---|---|---|
| Day 1 | R-4.11 | Two stage cards match the new story | B | 0.5 h (like qa-fix-meeca (20 min)) |
| Day 1 | R-4.9 | Matt's story calls show up in the game | A | 1 h (like journal-voice (about 2 h)) |
| Day 1 | R-1.7 | No cheap hit in the dark before the World 6 fight starts | A | 1.5 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-1.2 | No broken frame left in any boss ending | A | 2 h (like dot-box shots across 8 screens (1.7 h)) |
| Day 1 | R-1.6 | Players learn each late boss's tells instead of guessing | A | 2 h (like journal-voice (about 2 h) for the lines, plus banners) |
| Day 1 | R-4.10 | No story line contradicts the game or spoils a twist | A | 2 h (like story-gaps (2.5 h)) |
| Day 1 | R-4.13 | Nobody cut off at the waist in upright scenes | A | 2 h (like build1-ui (1.3 h) across every scene) |
| Day 1 | R-4.12 | Conversations play in order; Flicker is seen when he talks | A | 3 h (like dot-box (1.7 h) plus drawing Flicker in play) |
| Day 1 | R-4.6 | The ending lands and matches every ending card | A | 3 h (like story-gaps (2.5 h)) |
| Day 1 | R-4.7 | The scenes that need a real picture get one | A | 5 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h), about 30 pictures over several lists) |
| Day 1 | R-4.1 | The new story can be wired in at all | A | 6 h (no history for the slot plumbing: range 4-8 h; nearest story-delivery (3 h)) |
| Day 1 | R-2.8 | A showpiece clockwork stage in World 10 | B | 6.5 h (like w7-slide (5.5 h) + its art (w7-slide-art 1 h)) |
| Day 1 | R-4.2 | The story stops being skipped: the new words in every world | A | 9 h (like journal-voice (about 2 h), three acts at about 3 h each (story-delivery 3 h)) |
| Day 1 | R-150.2 (W5-W7 share) | Every generated stage plays differently, not run, jump, climb, repeat | A | 22 h of R-150.2's 34 h (the split path like gen2-ascent (3.4 h), plus about 6 h a world: two new section types like gen2-w6-swing (2.3 h) + one curation (about 1.5 h)) |
| Day 1 | R-150.5 | Crumbling ruins become a real route, not a side trap | A | 3.5 h (like vine-fix (2 h) + one 300-roll curation (about 1.5 h)); after R-150.4 |
| Day 1 | R-152.2 | Mistiming a sleepy mushroom costs a fall | A | 1.5 h (like swim (1.5 h)); after R-150.4 |
| Day 1 | R-152.3 | No stage makes him wait out the same monkeys fifteen times | A | 2 h (like fix-petals (about 2 h)); after R-150.4 |
| Day 1 | R-150.3 (share) | Hand-built stages stop repeating themselves | A | 3 h of R-150.3's 20 h (moved from lane 5 on 11-02 to balance) |
| Day 1 | R-153 (share) | Each world has different kinds of stages, not ten start-to-goal runs | A | 13 h of R-153's 65 h (about 2.5 h a stage, like w5-rebuild; split by world when briefed); after R-150.4 |
| Day 1 | R-154 (share) | More kinds of play from the mechanics we already built | A | 10.5 h of R-154's 12.5 h (variants and tempo inversion; after R-150.4) |
| Day 1 | R-159.1 | Stomp, punch and kick each do a different job | A | 9.5 h (each move like swim (1.5 h, one new mechanic): stomp vault about 1 h, punch stun and deflect 1.5 h, kick shield-break and bowling 2 h; World 1's three species tricks about 1 h each; the placement rule in World 1 about 2 h; range 7-14 h); Phase A, after R-150.4 and lane 1's GPU stage 0 merge; it holds engine.ts first (see Phases) |
| Day 1 | R-159.2 (share) | Every world's animals with a job | A | 10 h of R-159.2's 20 h (sized from Phase A's real hours; a guess for now); Phase B, after Matt rates World 1 |
| Important (if time) | R-4.14 | Old story asks either covered or closed | E | 0.5 h (a keeper check (about 30 min)) |
| Important (if time) | R-4.5 | Characters talk during play at key stages | C | 3 h (like story-delivery (3 h)) |
| Parking lot | R-144.4 | Small motion in cutscenes; the W8 moon in frame | D | 3 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Parking lot | R-4.8 | Story moments the player plays, not just watches | B | 12 h (no history for playable story moments: range 8-16 h; nearest w7-slide (5.5 h) each) |
| Parking lot | R-162.2 | A second game after the ending | C | 4 h (no history: a guess, range 2-10 h) |
| Parking lot | R-162.6 | Choices in one stage that change the next | C | 4 h (no history: a guess, range 2-10 h) |

### Lane 3: menus, art and the bosses (menus A/B first; then icons-painted for the lairs and art, and a boss builder for the Drake and bosses 6-8's third phases)

| Group | Item | What we get | Value | Time |
|---|---|---|---|---|
| Day 1 | R-6.10 | Satchel buttons big enough for a thumb | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.11 | How to Play usable sideways | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.12 | The New Game question reads in full | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.13 | About page tidy, buttons big enough | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.7 | Map nodes clear of the notch sideways | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.8 | Settings buttons big enough for a thumb | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.9 | World names read in full | A | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.17 | A story line that doesn't repeat | B | 0.5 h (like journal-voice (about 2 h)) |
| Day 1 | R-4.4 | Players can replay every new scene | A | 1 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Day 1 | R-6.6 | Stage and boss names read in full on the map | A | 1 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h), one batch with R-6.7..R-6.13) |
| Day 1 | R-6.25 | Painted icons everywhere, no flat ones | B | 1.5 h (icons B-E are painted; wiring like icons A) |
| Day 1 | R-6.31 | Every boss's name reads clean upright | B | 1 h (like fix-petals (about 2 h start to accept) for one layout fix, plus every boss shot both ways); Phase A (seen on Venom Fang) |
| Day 1 | R-6.32 | The Journal's world headings fit upright | B | 0.5 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h), as R-6.6..R-6.13); alongside |
| Day 1 | R-147.6 | Easier to use for everyone; Play's quality bar | A | 2 h (like polish-a1 (1.7 h)) |
| Day 1 | R-147.7 | The app survives cheap phones offline | A | 2 h (like warmup-5m (2.2 h)) |
| Day 1 | R-147.4 | A store page that sells the game | A | 2.5 h (like polish-a2 (2.3 h, store pieces)) |
| Day 1 | R-147.3 | The app passes Play's device checks | A | 3 h (no history for 16 KB and resizing: range 2-4 h) |
| Day 1 | R-4.3 | Two collections that give the story's hunt a reason to explore | B | 5 h (like menus-satchel (about 4 h with mock-ups)) |
| Day 1 | R-1.9 | World 9's boss becomes a real climax fight | A | 9 h (no history for a boss rebuild: range 6-12 h; nearest w7-slide (5.5 h) and the 5-M rebuild rounds) |
| Day 1 | R-1.15 | Bosses 6-8 each end with a fresh story-born phase | B | 8 h (no history: range 5-10 h for three phases; nearest w7-slide (5.5 h)) |
| Day 1 | R-1.16 | Every boss's defeat shows the boss he just beat | B | 2.5 h (like hf-art-bosses (30 min) per panel, plus wiring and review) |
| Day 1 | R-150.3 (share) | Hand-built stages stop repeating themselves | A | 6 h of R-150.3's 20 h |
| Day 1 | R-152.4 | Each world builds on the last instead of starting over | A | 9.5 h (like bot-fix + self-test (about 2 h) + about 2 h a hand-built world W2-W4 + swim (1.5 h) for swimming's bring-backs; range 7.5-15.5 h); after R-150.4 |
| Day 1 | R-153 (share) | Each world has different kinds of stages, not ten start-to-goal runs | A | 17 h of R-153's 65 h (about 2.5 h a stage, like w5-rebuild; split by world when briefed); after R-150.4 |
| Day 1 | R-152.7 | Jumping off a moving platform feels natural | A | 2 h (like vine-fix (2 h)) |
| Day 1 | R-156 | Jumps that feel springy and in control | B | 2 h (like vine-fix (2 h)); with R-152.7 |
| Day 1 | R-155 (share) | Every stage has a beginning, a build, a twist and a finale, with places to breathe | A | 5.5 h of R-155's 30 h (the generator template (like gen2-ascent, 3.4 h) and a start on the hand-built pass; after R-150.1) |
| Day 1 | R-161.1 | A boss fight with choices | A | 6 h (no history for adding win ways; nearest w7-slide (5.5 h) and the boss-rebuild range 6-12 h for a full rebuild; range 4-9 h); Phase A, after R-159.1 |
| Day 1 | R-161.2 (share) | Every boss with choices | A | 14 h of R-161.2's 28 h (sized from Phase A's real hours; a guess for now); Phase B, split by boss when briefed |
| Important (recommended) | R-6.14 | Dot never repeats herself word for word | C | 0.5 h (like journal-voice (about 2 h)) |
| Important (recommended) | R-6.15 | Every find has its own name | C | 0.5 h (like journal-voice (about 2 h)) |
| Important (recommended) | R-144.2 | Two backdrops no longer too bright | C | 1 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Important (recommended) | R-6.21 | A calmer win card; real italics | C | 1 h (like whatsnew (about 2.5 h) / menus-nav (2.2 h)) |
| Important (recommended) | R-1.14 | Bosses 6-8 fight in painted arenas, not code-drawn ones | B | 6 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h), three lairs) |
| Important (recommended) | R-144.7 | World 1, the first world, looks fully painted | B | 6 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h) plus the bank ends) |
| Important (recommended) | R-148.15 | The map shot shows the map on a fresh save | C | 0.5 h (like qa-fix-meeca (20 min)); alongside; kaizen-gates (tools/art is lane 3's art kit) |
| Important (if time) | R-6.16 | Every medal reads differently | D | 0.5 h (like journal-voice (about 2 h)) |
| Important (if time) | R-6.24 | Small Build 1 leftovers checked and closed | D | 0.5 h (a keeper check (about 30 min)) |
| Important (if time) | R-6.20 | Meeca drawn clear of the wall in room 5 | D | 1 h (like fix-petals (about 2 h start to accept)) |
| Important (if time) | R-1.8 | The World 6 boss looks clean and its weapon fits the story | C | 2 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Important (if time) | R-148.4 | No more judging work on a stale branch | E | 1 h (like bot-fix + self-test (about 2 h)) |
| Important (if time) | R-1.3 | The first boss fight looks as painted as its boss | C | 3 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Important (if time) | R-1.4 | World 3's boss arena matches its painted boss | C | 3 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Important (if time) | R-1.11 | The secret boss looks and talks as finished as the rest | D | 3 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Parking lot | R-1.12 | Every boss intro and defeat on its own painted arena | D | 1 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Parking lot | R-144.3 | World 1's middle trees stop repeating | D | 1 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Parking lot | R-144.5 | More varied props in W4, W6, W7 | D | 3 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Parking lot | R-162.7 | Hiding as a sloth really does | C | 4 h (no history: a guess, range 2-10 h) |
| Parking lot | R-162.8 | Plants that spring Pokey upward | C | 4 h (no history: a guess, range 2-10 h) |
| Parking lot | R-162.9 | Bounce shots off the spider silk | C | 4 h (no history: a guess, range 2-10 h) |

### Lane 4: World 9/10 (stages, the hold move, the General)

| Group | Item | What we get | Value | Time |
|---|---|---|---|---|
| Day 1 | R-2.13 | World 10's new tricks are taught | A | 1 h (like journal-voice (about 2 h)) |
| Day 1 | R-2.3 | World 9's new tricks are taught | A | 1 h (like journal-voice (about 2 h)) |
| Day 1 | R-2.12 | 10-9 stops killing first-timers 20+ times | A | 1.5 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-6.35 | More of the way ahead upright, less dirt | A | 2 h (no history for camera framing: range 1-4 h; nearest dot-box (1.7 h)); Phase A, then every world; lane 4 takes cameraFollow.ts (no lane owned it) |
| Day 1 | R-6.36 | The next handhold in view on every climb | A | 2 h (no history for camera framing: range 1-4 h; nearest dot-box (1.7 h)); Phase A (1-4), then every climb; cameraFollow.ts, after R-6.35 |
| Day 1 | R-143.5 | World 9 keeps its last changes | A | 2 h (like w8-merge (2.6 h for a big merge)) |
| Day 1 | R-146.5 | The hold move feels fair before World 10 needs it | A | 2 h (like swim (1.5 h) / vine-fix (2 h)) |
| Day 1 | R-2.2 | World 9 looks painted, no stand-ins | A | 3 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Day 1 | R-2.10 | World 10 has all its stages | A | 4 h (like w7-slide (5.5 h) for two plainer stages) |
| Day 1 | R-2.7 | The last world's new move, taught and fair | A | 4 h (like swim (1.5 h) / vine-fix (2 h), plus a prototype for Matt and two teaching stages) |
| Day 1 | R-2.4 | A showpiece canopy stage in World 9 | B | 6.5 h (like w7-slide (5.5 h) + its art (w7-slide-art 1 h)) |
| Day 1 | R-1.10 | The last fight flows straight into the ending | A | 10 h (no history for a boss rebuild: range 7-14 h (it also hands off to the finale); nearest w7-slide (5.5 h)) |
| Day 1 | R-2.1 | World 9 plays fair, varied, and on the new builder | A | 10 h (like gen2-w7 (9 h) + one 300-roll curation (about 1.5 h, w9 NEXT.md)) |
| Day 1 | R-2.6 | World 10 plays fair, varied, and on the new builder | A | 10 h (like gen2-w7 (9 h) + one 300-roll curation (about 1.5 h, w9 NEXT.md)) |
| Day 1 | R-150.2 (W9/W10 share) | Every generated stage plays differently, not run, jump, climb, repeat | A | 6 h of R-150.2's 34 h (about 3 h each on top of their builds) |
| Day 1 | R-150.3 (share) | Hand-built stages stop repeating themselves | A | 3 h of R-150.3's 20 h |
| Day 1 | R-152.5 (today's kinds) | Moving platforms from World 2 on, in every world | A | 6 h of R-152.5's 18.5 h (like gen2-w6-swing (2.3 h) + about 1 h a hand-built world W2-W4); after R-150.4 |
| Day 1 | R-153 (share) | Each world has different kinds of stages, not ten start-to-goal runs | A | 19 h of R-153's 65 h (about 2.5 h a stage, like w5-rebuild; split by world when briefed); after R-150.4 |
| Day 1 | R-154 (share) | More kinds of play from the mechanics we already built | A | 2 h of R-154's 12.5 h (the wind variants; after R-150.4) |
| Day 1 | R-155 (share) | Every stage has a beginning, a build, a twist and a finale, with places to breathe | A | 7.5 h of R-155's 30 h (part of the hand-built pass; after R-150.1) |
| Day 1 | R-160.1 | A move only a sloth has | A | 6 h (the move like vine-fix (2 h) + swim (1.5 h); its art like hf-art-bosses (30 min) plus the list; World 1 placements about 1.5 h; range 4-9 h); Phase A, after R-150.4; it holds engine.ts after R-159.1 lets go (see Phases) |
| Day 1 | R-160.2 | The sloth's own move all game long | A | 9 h (sized from Phase A's real hours; a guess for now): about 1 h a world, range 5-15 h; Phase B |
| Day 1 | R-161.2 (share) | Every boss with choices | A | 3 h of R-161.2's 28 h (sized from Phase A's real hours; a guess for now); Phase B |
| Important (if time) | R-2.11 | World 10's far sky isn't stretched | D | 1 h (like hf-art-ground (4.5 h) / hf-cutscenes (2.6 h)) |
| Important (if time) | R-2.5 | 9-7's climb matches the rebuilt world | C | 2.5 h (like gen2-w6-swing (2.3 h)) |
| Important (if time) | R-2.9 | World 10's climbs match the rebuilt world | C | 4 h (like gen2-ascent (3.4 h on 10-29, not finished)) |
| Parking lot | R-144.6 | Paid art finally on screen | C | 6 h (like w1-4-sheets (3.6 h) per batch of worlds) |
| Parking lot | R-162.5 | A surprise stage in each world | C | 4 h (no history: a guess, range 2-10 h) |

### Lane 5: tuning and fairness (bands, unfair spots, checkpoints, stranded branches)

| Group | Item | What we get | Value | Time |
|---|---|---|---|---|
| Day 1 | R-5.10 | 1-7's eagle can be answered | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.12 | Every World 1 wall can be climbed on every setting | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.13 | World 4's rocks are warned about first | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.14 | 4-2's jumps are survivable on Normal | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.18 | 6-7's eagle can be answered | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.19 | 6-8 and 6-9's animals are taught first | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.21 | 7-9 stops eating lives; first meetings are safe | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.8 | No hit before the punch is taught | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.9 | 2-9 stops hitting kids before Dot warns them | A | 1 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.1 | Difficulty numbers we can trust | A | 1.5 h (like bot-fix + self-test (about 2 h)) |
| Day 1 | R-5.11 | 1-8's snake and fall are taught; the jump is survivable | A | 1.5 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.15 | 4-7 and 4-4 stop eating lives; 4-7 lasts 2 minutes | A | 2 h (like fix-petals (about 2 h start to accept), two stages) |
| Day 1 | R-5.16 | 2-5 and 2-8 stop drowning Easy players | A | 2 h (like fix-petals (about 2 h start to accept), two stages) |
| Day 1 | R-5.2 | A true picture of how hard every stage is | A | 2 h (like the bot-fix re-baseline of 92 stages (inside its 2 h)) |
| Day 1 | R-5.20 | 7-4's slide never strands a player | A | 2 h (like fix-petals (about 2 h start to accept)) |
| Day 1 | R-5.7 | Every goal reachable on a natural first run | A | 2 h (like bot-fix + self-test (about 2 h)) |
| Day 1 | R-6.3 | No props floating in the air or sunk in the soil | A | 3 h (like bot-fix + self-test (about 2 h) for the grounding test, plus a walk of every world) |
| Day 1 | R-5.4 | Normal finally gets harder each world; Easy stays easy | A | 11 h (like polish-levels (3.4 h for W3-W5, about 1.1 h a world) across all ten worlds); tunes to R-152.6's arc |
| Day 1 | R-6.29 | A normal jump collects the petals over a gap; nothing tempts a death | A | 3 h (like fix-petals (about 2 h start to accept), plus the bot's arc measure across every world) |
| Day 1 | R-6.28 | Standing still on the glow always settles the mist | B | 2 h (like building 4-6 Above the Mist (about 1.9 h: 02109a34 to 4b2c8f93, 10-25)) |
| Day 1 | R-5.23 | Stars that match how the stage went | B | 1.5 h (like qa-fix-meeca (20 min), plus tests, the continue count through three callers and an old-save check) |
| Day 1 | R-6.30 | The mist fades in and out softly, no stripes | B | 1.5 h (like polish-a1 (1.7 h)) |
| Day 1 | R-150.4 | A table of every mechanic built and where it is actually used | A | 2 h (like the art-use audit (artuse.mjs + gate, 10-31), plus reading mechanics across stages: range 1-3 h); first, with R-150.1 it blocks R-150.2 and R-150.3 |
| Day 1 | R-150.1 | A ruler that flags a boring stage before Matt plays it | A | 9 h (grown into the validator, PLAN-TO-80 Phase A step 1: like bot-fix + self-test (about 2 h) for the move string, runs and dead walking; the clumsy-thumb bot like the bot-fix change (about 2 h); similarity and landing-in-view about 1 h each; pacing tags about 1-3 h; proving it on World 1 about 1 h; range 7-13 h); first, it blocks R-150.2, R-150.3 and R-155 |
| Day 1 | R-150.7 | Bot numbers for World 1 we can trust | A | 2 h (like bot-fix (about 1.5 h, the bot's lastX fix) plus the World 1 re-run); Phase A; in progress (fix-petals) |
| Day 1 | R-150.8 | Bot numbers for 1-4 we can trust | A | 1.5 h (like bot-fix (about 1.5 h, the bot's lastX fix)); Phase A |
| Day 1 | R-150.9 | A rebuilt world can't quietly get worse | A | 2 h (no history for this gate: range 1-3 h; nearest bot-fix + self-test (about 2 h)); Phase A; fix-petals |
| Day 1 | R-6.37 | 1-2's pit edge looks painted, not boxed | B | 1 h (like fix-petals (about 2 h start to accept)); Phase A; 1-2's stage file is lane 5's |
| Day 1 | R-5.22 | A stage where slow Pokey is suddenly fast | A | 8 h (like w7-slide (5.5 h) + its art (1 h), plus currents and bubbles like swim (1.5 h)); Matt put swimming in launch 2026-11-02 |
| Day 1 | R-153 (share) | Each world has different kinds of stages, not ten start-to-goal runs | A | 14.5 h of R-153's 65 h (about 2.5 h a stage, like w5-rebuild; split by world when briefed); after R-150.4 |
| Day 1 | R-155 (share) | Every stage has a beginning, a build, a twist and a finale, with places to breathe | A | 9.5 h of R-155's 30 h (part of the hand-built pass; after R-150.1) |
| Day 1 | R-158.1 | An eagle you have to hide from or time | A | 2 h (like fix-petals (about 2 h start to accept); watcher.ts is pure and tested); Phase A; one job with R-5.10 (1-7's eagle; the lead, 2026-11-04) |
| Day 1 | R-158.2 | The same bite in every watched stage | A | 3 h (sized from Phase A's real hours; a guess for now): range 2-6 h; Phase B |
| Day 1 | R-161.2 (share) | Every boss with choices | A | 4 h of R-161.2's 28 h (sized from Phase A's real hours; a guess for now); Phase B |
| Important (recommended) | R-143.8 | World 5's Normal work feeds the tuning | C | 0.5 h (a keeper check (about 30 min)) |
| Important (recommended) | R-5.6 | Falls hurt fairly: short ones sting, long ones cost a life | B | 1 h (like fix-petals (about 2 h start to accept)) |
| Important (recommended) | R-143.2 | Paid deep-water art used | C | 1 h (like w8-merge (2.6 h for a big merge)) |
| Important (recommended) | R-143.3 | Three small art fixes already made | C | 1 h (like w8-merge (2.6 h for a big merge)) |
| Important (recommended) | R-143.4 | Maybe no flat backdrop at a stage's start | C | 1 h (like w8-merge (2.6 h for a big merge)) |
| Important (recommended) | R-143.6 | One fewer stale branch | E | 0.5 h (a keeper check (about 30 min)) |
| Important (recommended) | R-143.7 | One fewer stale branch | E | 0.5 h (a keeper check (about 30 min)) |
| Important (recommended) | R-148.3 | Unfair spots caught before Matt sees them | B | 2 h (like bot-fix + self-test (about 2 h)) |
| Important (recommended) | R-141.2 | World 5 less padded | B | 2.5 h (like gen2-w5 (2 h)) |
| Important (recommended) | R-143.1 | Paid World 5 work not thrown away | B | 2.5 h (like w8-merge (2.6 h for a big merge)) |
| Important (recommended) | R-5.5 | Checkpoints where a player expects them | B | 3 h (like polish-levels (3.4 h)) |
| Important (if time) | R-1.5 | Proof the Queen's council table shows; the Sovereign's screech looks right | D | 0.5 h (a keeper check (about 30 min)) |
| Important (if time) | R-5.17 | 2-4 stops dragging on | C | 2 h (like fix-petals (about 2 h start to accept)) |
| Important (if time) | R-141.5 | 7-2, 7-8 and 8-7's climbs match the new builder | C | 6 h (like gen2-ascent (3.4 h on 10-29, not finished)) |
| Important (if time) | R-5.3 | We can measure puzzle and fight stages too | C | 6 h (like bot-fix + self-test (about 2 h), for six bot modes) |
| Parking lot | R-144.8 | Old art asks checked and closed | E | 0.5 h (a keeper check (about 30 min)) |
| Parking lot | R-148.7 | Dead stretches can't creep back | E | 1 h (like bot-fix + self-test (about 2 h)) |
| Parking lot | R-141.4 | 8-1 replays a little more differently | D | 2 h (like gen2-curate (2 h)) |
| Parking lot | R-142.6 | 6-5 and 6-9 stop looking alike | D | 2 h (like gen2-lookalike (6.5 h for all worlds)) |
| Parking lot | R-141.3 | One more puzzle room in World 5 | D | 3 h (like gen2-w5-arena (2 h) plus art) |
| Parking lot | R-142.1 | World 5 on the new builder: more variety, less padding | C | 6 h (like w5-rebuild (5 h on 10-29, then a review round)) |
| Parking lot | R-141.1 | Dot's flight becomes a showpiece | C | 6.5 h (like w7-slide (5.5 h) + its art (w7-slide-art 1 h)) |
| Parking lot | R-142.2 | World 1 replays differently each time | C | 10 h (like gen2-w7 (9 h) + one 300-roll curation (about 1.5 h, w9 NEXT.md)) |
| Parking lot | R-142.3 | World 2 replays differently each time | C | 10 h (like gen2-w7 (9 h) + one 300-roll curation (about 1.5 h, w9 NEXT.md)) |
| Parking lot | R-142.4 | World 3 replays differently each time | C | 10 h (like gen2-w7 (9 h) + one 300-roll curation (about 1.5 h, w9 NEXT.md)) |
| Parking lot | R-142.5 | World 4 replays differently; unused W4 art placed | C | 10 h (like gen2-w7 (9 h) + one 300-roll curation (about 1.5 h, w9 NEXT.md)) |
| Parking lot | R-141.6 | A secret level for players who hunt | C | 12 h (no history for a secret level: range 8-16 h) |
| Parking lot | R-162.1 | A reason to replay a friend's exact run | C | 4 h (no history: a guess, range 2-10 h) |

### Keeper and lead (no helper)

| Group | Item | What we get | Value | Time |
|---|---|---|---|---|
| Day 1 | R-151 | Work judged for fun and polish before Matt sees it | A | 0.5 h (the lead set it up: 7cc7e18d; the quality supervisor's running time is overhead on every build, not counted) |
| Important (recommended) | R-148.11 | No stale doc misleads a helper | E | 0.5 h (a keeper check (about 30 min)) |
| Important (if time) | R-148.9 | Old ticks proven or reopened | E | 0.5 h (a keeper check (about 30 min)) |
| Important (if time) | R-148.8 | World 8's gates checked | E | 1 h (a keeper check (about 30 min)) |
| Important (if time) | R-148.5 | Cheaper, faster helpers | E | 2 h (each next helper writes its own (about 30 min each)) |
| Parking lot | R-148.10 | Old asks proven or reopened | E | 0.5 h (a keeper check (about 30 min)) |

## 3. Spending tokens well: what our own history says

What wasted tokens before (CONTINUOUS-IMPROVEMENT.md D1-D24, the 0.9.3 debrief, methods/, HELPERS.md):

| Waste | Where it happened | What every wave does about it |
|---|---|---|
| Work on a stale base | D23 (icons shot on a branch without the release); W8-10 branches 365-1,400 commits behind (WIP-10) | Every helper starts from the latest main and merges main again before its report; the lead runs `git merge-base --is-ancestor` at each check-in (LEAD-PLAYBOOK 8). World 9 and 10 merge main FIRST, one branch at a time |
| A broken measuring tool | D15/D21 (the bot's lastX: every bot number suspect); bands.ts reads Easy harder than Normal | R-5.1 fixes the measure and adds a self-test before any re-run or tuning (stage-fix.md step 0, "check the ruler") |
| Approving from a list or the happy path, then redoing | D1, D18/D19 (journal lines; a gate testing the wrong builder) | Show-first sheets in fresh/old/finished saves, upright and sideways; acceptance waits on the shared gate |
| Art redos | hf-backdrops2: 4 redos, $59, the most of any helper | Matt approves each picture list first (R-149.6); the absolute floor (floor.py) before showing; small HF jobs go to icons-painted (strong, still alive, knows the method) |
| Two helpers in the same files | iconRegister breaches when two branches met (0.9.3 gate) | The lanes above |
| Long test runs repeated | the full suite takes 25+ min here | While working: only the touched tests and `--rolls 50`; the full suite once at the end; the lead's gate once per wave (LEAD-PLAYBOOK 7) |
| Fresh helpers re-learning | every new brief costs a read-in | Reuse strong helpers that are alive (HELPERS.md): menus A for the menu lane, menus B for the Satchel pieces, icons-painted for icons and small HF jobs. A fresh helper only where none fits (GPU, story plumbing) |
| Wrong clock | D20 (a helper stopped an hour early) | Every brief and check-in uses `TZ=America/New_York date` |

**Cheap enough to batch into one helper:** all eight menu clip groups and the win card (menus A, one run); the Satchel text duplicates
with the ledger (menus B); the bot's unfair spots one world at a time (one helper per batch, not one per stage); the stranded-branch
triage (R-143) as one read-only report, which the roadmap keeper can write without a new helper; the $0 art steps (R-144.2, the W8 moon,
the cutter pass) with the next icons-painted job.



## 4. Hugging Face per wave ($65.55 left on 11-07 per Matt, about $15 reserve, about $50 to spend; Matt approves each list first)

| Wave | Spend | Running total | What |
|---|---|---|---|
| 2 | about $0.50 | $0.50 | Crocus Rex panel (R-1.1) |
| 2-3 | about $5-15 | $5.50-15.50 | Act I and II story pictures (R-4.7) |
| 3 | about $3-5 | $8.50-20.50 | Drake (R-1.9) |
| 3-4 | about $5-17 | $13.50-37.50 | Act III pictures; World 9 stand-ins (cap $12) |
| 4 | about $4-6 | $17.50-43.50 | General (R-1.10), hold poses (about $1) |
| 4-5 | about $1-6 | $18.50-49.50 | World 10 stand-ins (cap $6), World 1 ledges (Important) |
| 4-5 | about $5 | $23.50-54.50 | 9-2 canopy (about $3), 10-8 (about $2): in for launch (Matt, 2026-11-01) |

The top of the range ($54.50) is $4.50 over the about $50 there is to spend; the low end ($23.50) fits. If the lists price toward the top, the
stand-in caps (World 9's $12, World 10's $6) shrink first, never the reserve. Matt approves each list before any spend.

Art round 2 (about $62) does not fit and stays Parking lot.

## 5. Fresh or reused helper

Every brief says: "your first-time gate result and redo count go on reference/HELPERS.md; strong helpers get the follow-on work."
Reuse first: menus A then menus B in lane 3, icons-painted for art, bot-fix (if alive) in lane 5, the World 9 curator for World 10.
Fresh only for the PixiJS work (lane 1) and the story plumbing (lane 2), where no strong helper has done the job.
