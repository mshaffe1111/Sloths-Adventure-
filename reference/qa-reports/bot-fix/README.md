# The first-timer bot fixed, and an honest re-baseline (2026-11-01, branch bot-fix)

Branch `bot-fix`, from `main` (a8b1f244). The bot and its test, plus one data change the lead asked for (5-9's Easy goal).

- `75ee59f7`: the defect the fix-petals helper found (the "stopped dead" check read 0 every frame).
- `877a819b`: three bot gaps that the hopping had been hiding, plus the re-baseline runner.
- `7b9b9bcc`: 5-9 Easy goal 9 → 5 of 18, from the fixed kid's runs (the lead's decision, 2026-11-01 1:42 PM ET; section 4).
- `d9a8e640`: one self-test case per gap fix.
- Self-test: `src/game/firstTimerBot.test.ts`, 11 cases, in the gate's `src/game/*.test.ts` glob.

The gap fixes are in one commit (`877a819b`), not one commit each as the lead later asked. It was already pushed and named to the
w8-rope2 and fix-petals helpers as the bot to measure with, so rewriting it would have left them on a commit that no longer exists. The
separation is in the tests instead: each gap fix has its own case, and taking out that fix alone fails that case (section 3).

**Use `877a819b` (or later) for every first-timer number from now on.**

## 1. The defect, and the fix

`tools/inspect/firsttimer.ts` (on main, line 1259) worked out how far he moved this frame as `Math.abs(p.x - this.lastX)`. But `after()`,
at the end of every frame, had already set `lastX = p.x`, so in `intend()` the move always read 0. The rule "stopped dead against
something: a plain jump" then fired after every 0.3 s (0.4 s for the kid) of walking. The same mistake was made with `lastY` on trunks in
round 5 (2026-10-29), and fixed only there.

- The fix: `Math.abs(this.moveX)`, the frame's own move, which `after()` keeps for exactly this purpose (as the trunk check uses `moveY`).
- Spread: no other `lastX`/`lastY` read in `firsttimer.ts`. The kid (Easy) and the adult (Normal) are two profiles of the same class, so
  both are fixed. `meecaBot.ts`, `bossBot.ts`, `jumps.ts` (the curation bot) and `meecaPlay.ts` don't have the pattern (`meecaPlay`'s
  `lastX` is a true previous-frame value).

On a bare world:

| | buggy (main) | fixed |
|---|---|---|
| hops in 10 s of flat ground, adult / kid | 9 / 7 | 0 / 0 |
| first take-off before a ledge's end, adult | 1097 px (then 831, 554, 259) | presses 19 px before the end |
| first take-off before a ledge's end, kid | 959 px | presses 12 px past the end (a late thumb; coyote time lets it go) |
| "stopped dead" at a real 60 px step | adult yes; kid never (he had hopped it) | both, at the step's face |

## 2. The gaps the hops were hiding (`877a819b`)

The hops had been carrying the bot past three gaps of its own. With the fix alone, 6-3 (kid) went from ✓✓✓ to T T T, and 6-6
(Normal) the same.

1. **Put past a puzzle room, he walked back into it.**
   - Cause: his place on the route was the point nearest where he was put. That can be a point the route traces through the room's far
     wall, behind him, and the tracker could also follow him up to 25 points back.
   - Now: he is placed at the first route point past the room that is not inside a solid piece, and the way back is floored there until a
     respawn or rescue.
   - Seen on: 6-3's seesaw, until the cap.
2. **The room "started again" while he stood on its top.**
   - Cause: 1-4's lift puts him on its own top, inside its box, and the way on crosses back over it. 12 s later he was "back in the room",
     every 12 s, and his stuck clock was wound back each time.
   - Now: a room starts again only when he has fallen back down into it, under the spot he is put at.
3. **Falls back down a climb never led to a rescue.**
   - Cause: each fall moved his place back down the route, so climbing back up counted as progress, and the 20 s "no progress" clock
     never ran out. 1-4 looped every 24 s until the cap.
   - Now: the same fall three times from one best point is a loop. It is reported ("fell back down from here 3 times") and he is put past
     it, as the same death three times already was.
   - Also: a rescue from no further on than the last rescue now puts him a little further on. Before, he was put back on the spot he had
     just failed, four times running.

## 3. The self-test (new in the gate)

`src/game/firstTimerBot.test.ts`, in the real engine on bare worlds unless named, about 18 s in all:

| case | main (a8b1f244) | 75ee59f7 | now | fails with only this fix taken out |
|---|---|---|---|---|
| flat ground: no hops, no "stops", walks on (adult, kid; seeds 1-3) | fail | pass | pass | the lastX fix |
| a ledge: the press is within edgeAim of the end, no hops on the way, across unhurt (gaps 140/200) | fail | pass | pass | the lastX fix |
| a 60 px step: the only stop is at its face, its height read right, then over | fail | pass | pass | the lastX fix |
| a climb with an uncrossable gap: put past after the third fall, the loop reported | fail | fail | pass | the fall loop |
| put past a room, not back into it: 6-3's seesaw reaches the shrine (kid, seeds 1-3) | fail | fail | pass | the room put-past (also the fall loop) |
| a room starts again only when he has fallen back into it: 1-4's lifts, kid and adult, seeds 1-3 | — | — | pass | the re-entry rule (also the fall loop) |
| three rescues from the same spot land further on each time | — | — | pass | the rescue step-on |
| 5-9's kid runs re-measured equal `KID_RUNS_59` | — | — | pass | any change to the bot or 5-9 that moves them |

The lastX cases come in an adult and a kid version each, so there are 11 cases. "Taken out" was checked by editing the one fix out and
running the file: only the named case failed.

## 4. Where the bot's numbers feed the game (step 3)

Nothing here was changed on my own call. The lead decided the 5-9 goal (changed in `7b9b9bcc`); the rest is listed for the lead.

| what | where | from the first-timer bot? | would the fix change a shipped stage if re-run? |
|---|---|---|---|
| 5-9 Easy goal: was 9 of 18 spiders, **now 5** | `src/game/gen2/game.ts:78-86` (`KID_RUNS_59`); applied in `src/game/stageGenerator.ts:2853-2855`, `goals.ts:88-100` | yes, the kid's recorded runs | **Yes, and changed** (`7b9b9bcc`, the lead's call). Same rule as before: `kidMedian`, the lower middle of the kid's six runs (seeds 1-3, trials 0-1, Easy's goal at the 65% floor so the shrine does not stop him early), capped by the 65% floor in `gen2EasyGoal`. The fixed kid, through `firstTimer()`, beats 5, 6, 4, 6, 6, 5 → sorted 4 5 5 6 6 6 → **5**. The old 5, 5, 9, 10, 10, 10 came from the hopping bot's stomps (re-measured on main today: 6-11). Pinned in `goalsEasy.test.ts`, and re-measured live in `firstTimerBot.test.ts`. Caveat: the bot never hunts, so this is "what a kid passing through beats", the same thing the 9 measured. One of the six runs (seed 2, trial 0) gets 4, so the bot still meets the sealed door there. |
| Curation picks and seeds (`seeds.ts`) | `tools/gen2/curate.ts:42-48, 255-280` | **no**: `jumps.ts` (the noisy jump bots) and `stageScore` with the first-timer parts set to null | No. `jumps.ts` has no lastX pattern. |
| Difficulty bands | `tools/inspect/bands.ts:40-88` (lives, stress, window, pressure parts), `inspect.ts --firsttimer --gate` | yes | Not shipped data, but every band and band flag from a first-timer pass before today is suspect: see "Bands to re-run" below. |
| A gate test on the bot | `src/game/w6Stages.test.ts:299-305` (6-8: no harm before 10 s, at most 3 lives a minute) | yes | It passes on 877a819b (see checks). |
| Tunings made from first-timer findings (comments) | `src/game/w8Lantern.ts:131-133` (hop cap 165 px, hops up 130 px); `gen2/worlds/w8Branch.ts:46`; `gen2/worlds/w8.ts:308` (Easy fights softer); `gen2/worlds/w7.ts:22` and `w4Normal.ts:3` (bands); `easyMode.ts:246`; `w2Sections.ts:871,1126,1134`; `waterTeach.ts:3`; `gen2/worlds/w6Ground.ts:129` | yes, all from the bot before today | Mostly no. Spot check of the biggest one, World 8's 165 px cap: the fixed adult's first try onto a 120 px pad after a 1400 px walk-up lands 11/12 at 140 px, 5/12 at 165 px, 1/12 at 185 px, and 6/12 at 140 px rising 50. The cap still holds. The tip-timing and respawn fixes (`waterTeach.ts`, `w2Sections.ts:1126,1134`, `w6Ground.ts:129`) fixed real engine or stage faults the bot only pointed at; they stand. The band-based ones (`w7.ts:22`, `w4Normal.ts`) move with the bands (row above). |

The bot came into this repo whole (commit 4e20d06c, 2026-10-31) with the bug already in it, so every first-timer number before today was
made with the buggy bot.

### Bands to re-run

**All 20** (10 worlds × Easy and Normal). Four of a band score's seven parts come from the first-timer: lives a minute (weight 0.3), peak
stress, the narrowest input window, and timing pressure. So no world's band survives the fix unchanged. Lives a minute by world, seeds
1-3, main's bot → 877a819b:

| world | Easy (kid) | Normal (adult) |
|---|---|---|
| 1 | 0.41 → 0.29 (−30%) | 0.57 → 0.48 (−16%) |
| 2 | 2.33 → 2.92 (**+25%**) | 2.66 → 2.14 (−19%) |
| 3 | 0.64 → 0.34 (**−48%**) | 1.67 → 1.02 (**−39%**) |
| 4 | 0.57 → 0.49 (−14%) | 1.22 → 1.30 (+7%) |
| 5 | 0.09 → 0.05 (−42%) | 0.21 → 0.22 (+6%) |
| 6 | 1.30 → 1.17 (−10%) | 2.43 → 1.85 (−24%) |
| 7 | 0.72 → 0.31 (**−57%**) | 2.26 → 1.45 (**−36%**) |
| 8 | 0.03 → 0.05 | 1.10 → 0.59 (**−47%**) |
| 9 | 2.01 → 1.05 (**−48%**) | 2.54 → 1.69 (**−33%**) |
| 10 | 1.22 → 0.72 (−41%) | 1.49 → 1.35 (−9%) |

- Re-run first: World 7 and World 8 Normal. Their tunings were made against bands: `w7.ts:22` (chasms set from "World 7 below World 6"),
  and `w8Lantern.ts` / `w8.ts:308` (World 8's band).
- Then: World 3, World 9, and World 2 Easy, the only one that rose.
- On lives alone, the honest Normal numbers don't climb world by world: World 2 at 2.14 is above Worlds 3-5, 7, 8 and 10. That is the
  thing for the band pass to confirm or refute, not a verdict from this table.

## 5. The re-baseline (step 4)

Every non-boss stage of Worlds 1-10 (92 ids, including 4-D and 5-M), the kid on Easy and the adult on Normal, seeds 1-3, one trial each:
1104 runs per bot version. Runner: `npx tsx tools/inspect/botBaseline.ts --worlds 1-10 [--detail]`.

Cell: one mark per seed, then lives lost (L) and rescues (R) over the 3 runs.
- ✓ shrine
- S got/need: a sealed door with the count
- T timeout
- X stranded

### Overall

| version | setting | shrine | sealed door | timeout | stranded | lives / min | rescues |
|---|---|---|---|---|---|---|---|
| buggy (main) | Easy | 134 | 74 | 59 | 9 | 0.89 | 773 |
| lastX fix (75ee59f7) | Easy | 125 | 78 | 64 | 9 | 0.61 | 824 |
| + gap fixes (877a819b) | Easy | 165 | 79 | 23 | 9 | 0.69 | 1038 |
| buggy (main) | Normal | 117 | 82 | 68 | 9 | 1.57 | 1366 |
| lastX fix (75ee59f7) | Normal | 125 | 77 | 65 | 9 | 1.05 | 983 |
| + gap fixes (877a819b) | Normal | 158 | 80 | 28 | 10 | 1.19 | 1223 |

(276 runs per row.)

### The flagged list: which are real with the fixed bot

The fix-petals helper's buggy-bot list: 1-3, 1-5, 1-9, 3-3, 3-6, 3-7, 3-9, 5-3, 5-5, 5-6, 1-4, 1-6, 1-7, 1-8, 3-4, 5-8.

| stage | type | Easy: buggy → 877a819b | Normal: buggy → 877a819b | real? |
|---|---|---|---|---|
| 1-4 | ascent | 3 T → 3 ✓ | 3 T → 2 ✓ 1 T | **No**: the bot's fall loop and the room re-start (§2). |
| 3-4 | ascent | 3 T → 3 ✓ | 3 T → 2 ✓ 1 T | **No**: the same climb gaps. |
| 5-8 | ascent | 3 T → 2 ✓ 1 T | 3 T → 3 ✓ | **No**: the same climb gaps. |
| 1-8 | sprint | 2 ✓ 1 T → 3 ✓ | 1 ✓ 2 T → 3 ✓ | **No** as a timeout. But it is on the next fix list for hurts no tip teaches (§6). |
| 1-6 | vine_runner | 2 ✓ 1 T → 2 ✓ 1 T | 2 ✓ 1 T → 3 ✓ | Timeout: not proven. Its stuck spots are "the way on is 240 px up" (gap 4 in §7) and 11 drownings, about 9 rescues a run. On the next fix list for a snake no tip teaches (§6). |
| 5-6 | relic_hunt | 2 ✓ 1 S → 3 ✓ | 1 ✓ 2 S → 3 ✓ | **No**: the hops made it miss messages. |
| 1-7 | stealth | 3 T → 1 ✓ 2 T | 3 T → 1 ✓ 2 T | Timeout: no (the bot walks under the step to the 230-245 px pillars and needs a rescue at each, as on 1-1). **The eagle is real**: §6, #2. |
| 1-3, 1-9, 3-3, 3-9 | purge / gauntlet | sealed, kid 0-1 of 7-10 | sealed, adult 4-15 of 14-21 | **Not proven.** The bot never hunts animals; it beats what walks into it on the way to the shrine. With the hops gone the kid beats fewer (1-9: 3,3,1 → 0,0,0), because the hops were stomps. A sealed door here means "passing through isn't enough", which a goal is allowed to be. |
| 1-5, 5-3 | harvest | sealed at 42-90% of the count | sealed at 37-82% | **Not proven.** Every petal is reachable (the inspector's route skips 0 goal stops, seeds 1-3). The bot grabs only what is in its way, and each rescue skips the pickups it jumps over (1-5: about 10 rescues a run, at the 230 px pillars). |
| 3-6, 3-7 | relic_hunt | 0/5, 0/6 every run | 0/5, 0/6 every run | **No: a bot gap.** World 3's keepsakes are hidden in ferns: you crouch beside one to search it (`engine.ts:2836`). The bot never crouch-searches. |
| 5-5 | rescue | 0/13-14 every run | 0/20-22 every run | **No: a bot gap.** Cages are puzzles (stones, baskets, lifts) and the bot "does not know puzzles". The same holds for 2-3, 2-8 and 4-8. |

So **no stage on the list is proven unfair by the bot's ends alone**. The really unfair spots come from the run flags against STAGE-RULES
§1b (section 6).

### Full table

The full per-stage table (both settings, all three versions) is `baseline-table.md` beside this file. The raw runs (one JSON line a run)
are `runs-*.jsonl`.

## 6. Really unfair to a first-timer: the next fix list

From the run flags (877a819b, seeds 1-3) against STAGE-RULES §1b's unfair list. "Runs" counts the 3 runs of that setting that showed it.
Each needs the stage-fix method (sweep the thumb, read the frames) before a fix. The bot points at the spot; it does not prove the cause.

Every run starts from a fresh save (`firstTimer`'s `freshPhone`). So "no tip teaches it" in a later stage can mean an earlier stage
taught it. Check that before fixing anything that isn't a world's first appearance.

**Ranked by how bad:**

1. **2-9 Easy: hit in the first 5 s by a turtle, 3 of 3 runs.**
   - The hit lands at 3.8-4.0 s, before Dot's turtle tip (on screen at 5.2-5.8 s).
   - §1b: "hurt in the opening seconds" and "hurt before the tip that teaches it". Normal: clean.
   - The clearest unfair spot in the game by the bot's measure.
2. **1-7 Easy and Normal: the watching eagle's first strike hurts with the nearest bush 700-990 px away, 3 of 3 runs on both
   settings.**
   - One strike came from off screen (Normal).
   - §1b: "a hit from off screen with no tell"; and hiding, the stage's own answer, is out of reach.
   - World 1's stealth stage, so a first appearance.
3. **1-8 Easy and Normal: a snake hits, and a fall costs a life, with no Dot tip teaching either, 3 of 3 runs on both settings.**
   - The snake comes at 19-42 s (kid) and 20-174 s (adult).
   - World 1: check whether an earlier World 1 stage teaches the snake. If it is 1-8's first, it is unfair.
4. **World 4's falling rocks: a rock hits with no tip teaching it.**
   - 4-1 Normal 3 of 3 (15-133 s), 4-1 Easy 3 of 3, 4-6 both settings, 4-3 Easy.
   - The first stage with rocks needs Dot's line or a tell.
5. **6-7: the eagle's first strike hurts with no bush anywhere near.**
   - Normal: nearest bush 5196-5574 px away, 2 of 3 runs.
   - Easy: "no bush at his level", 2 of 3 runs.
   - §1b: no way to answer the eagle.
6. **6-8 Easy: frogs and tayras hit with no tip teaching, 3 of 3 runs (187-233 s); Normal 2 of 3.**
   - Fresh-save caveat applies (World 6 animals may be taught earlier).
7. **7-4 Easy and Normal: "other" costs a life with no tip, 3 of 3 runs on both settings (40-73 s).**
   - It is also stranded on 5 of 6 runs.
   - The cause isn't one the bot can name: look at it in the engine first. It may be the stage's own hazard or a bot gap.
8. **Lives far above the band at concentrated spots:**
   - 4-7 Normal: 8.2 lives a minute, all pits; 106 over 3 runs while reaching the shrine every time.
   - 4-4 Normal: 7.0 a minute; Easy 5.2, water.
   - 7-9 Normal: 6.2 a minute, water.
   - 2-5 Easy: 5.7 a minute, water, in World 2.
   - 2-8 Easy: 8.2 a minute, drowning at the cage pools (gap 2 in §7).
   - Each needs the method's thumb sweep at its hottest spot to tell "unfair" from "hard but fair".
9. **The punch tip arrives after the first hit**, on Easy and Normal across Worlds 5-10: 10-1, 9-8, 10-6, 9-5, 7-2, 7-8, 7-9, 5-6 and
   others, typically 1-9 s late.
   - On a fresh save that is §1b's "hurt before the tip".
   - With World 1's punch lesson behind him it may not matter. Decide the rule once (a later-world first stage re-teaches the punch
     before its first animal, or not) rather than stage by stage.

Not on the list: the sealed doors and timeouts in section 5. They are the bot's blind spots (section 7), not proven unfairness.

## 7. Bot gaps that remain (the ruler's known blind spots)

Until these are closed, a sealed door or a timeout on these stage types is **not evidence** that a stage is unfair. Read it as "the bot
can't", not "a player can't". For each blind spot, the tool or bot mode that would measure it (each could be a job):

| blind spot | stages | what the bot does now | what would measure it |
|---|---|---|---|
| **Cages and other puzzles** | rescue: 2-3, 2-8, 4-8, 5-5 (0/N every run); every puzzle room | stands at a room 3 s, is put past; never works a cage | A **puzzle mode** that plays each room with its own solver: the real-engine room tests already solve many (e.g. the tea room in `gen2/w5Arena.test.ts`, the seesaw room in `gen2/w6Rooms.test.ts`), so a table of room id → solver steps the first-timer can call, with its thumb noise and reaction lag. It reports time per room and whether it was solved, instead of putting him past. On 2-8 Easy the kid drowns at each cage in the flooding river (x ≈ 3820 and 4210, every seed); a person who knows the cage lift may not. |
| **Fights: it never hunts** | purge and gauntlet (1-3, 1-9, 2-5, 2-9, 3-3, 3-9, 4-9, 5-9, 6-5, 6-9, 7-5, 7-9, 8-8, 8-9, 9-6, 9-9, 10-7, 10-9) | beats only what walks into it on the way to the shrine | A **hunter mode**: when the goal is short and an animal is on screen (or was passed), turn and go to it, punch or stomp as Dot taught, then carry on. Report animals beaten and time and lives per animal. The goal check becomes "a hunting first-timer meets it in N of 6 runs". Easy goals like 5-9's could then be set from a kid who tries, not one passing through. |
| **Harvest counts** | 1-2, 1-5, 2-2, 5-3, 8-2 | grabs what is on its line; rescues skip pickups | A **collector mode**: aim for the nearest unpicked petal within a reach budget (the inspector's goal stops already give a reachable order: `inspect.ts` stops asked/skipped), and backtrack once at the end if short. |
| **Fern keepsakes** | World 3 relic hunts 3-6, 3-7 (0 every run) | never crouches by a fern | Teach the bot the fern search: crouch beside a fern for `FIND_SEARCH_SECONDS` once Dot has said so (`engine.ts:2836`). Small; could go in the collector mode. |
| **Climbs** | 18 ascents: on main 17 never reached the shrine; now 2 never do (4-3, 6-8), and 7-4 strands, 8-7 and 10-5 time out on some runs | climbs straight up a trunk, flicks off at the top; loops are now caught | A **climb probe** in the style of `ropeProbe.ts`: stand him at each climb step and sweep the thumb (press distance × hold) to get each step's success window, as the stage-fix method does for jumps. That tells "the step is unfair" from "the bot's flick is odd". |
| **Backing up to a step** | 1-1, 1-7 (and 1-5, 1-6): the 220-259 px pillars and "the way on is 240 px up" | walks under the step to the face beyond (a full double jump rises about 186 px) and needs a rescue at each: 1-1 about 14 a run, 1-7 about 16 | Let him back up: when stopped at a face taller than his double jump and the route's next point is over a step behind him, walk back to that step and jump from it. |
| **Pushing** | 4-3 (T every run, 70+ rescues; 138 stuck spots "a thing to push") | doesn't push | Push when stopped at a pushable block and the route goes on past it. |
| **Not walk-to-the-shrine stages** | 4-D (Dot's flight), 5-M (Meeca) | strands at once | Their own bots: `meecaBot.ts` exists for 5-M; 4-D would need a flapping first-timer. |

## 8. Checks

Re-run on d9a8e640 (the bot, its 11-case test, the 5-9 goal), 2:57 PM ET:

| check | result |
|---|---|
| `npx tsc --noEmit -p .` | clean |
| full test globs, 3 shards in parallel | 679 + 709 + 776 = 2164 tests, **0 failures**. The 2 "not ok" are main's existing `todo` tests (the boulder wall check, 4-3 and 4-8), not failures. |
| `src/game/firstTimerBot.test.ts` alone | 11/11 pass (on main the 8 bot cases fail; on 75ee59f7 the gap cases fail) |
| `tools/inspect/*.test.ts` (the bot's own older tests, not in the gate globs) | 42/42 |
| `npx vite build` | built; no file in `dist` over 4 MiB |
| `node tools/perf/artcheck.mjs` | PASS |
| `node tools/perf/drawcheck.mjs` | PASS (311 s) |

No game code changed, so no screens to film; the polish bar for this job is the table's honesty. The known blind spots are named in
section 7, not hidden.

## 9. Method update (for `reference/methods/stage-fix.md`)

- **The ruler is checked first.** Before step 1 ("Reproduce with the first-timer"), run the bot's own self-test:
  `npx tsx --test src/game/firstTimerBot.test.ts` (about 6 s). Whenever the bot changes, it must pass, and a fix to the bot gets a case
  that fails before it.
- **Read the bot's ends by stage type.** A sealed door on a cage, fern-keepsake, fight or harvest stage, or a timeout on a climb, is
  **not evidence**: it is the bot's own blind spot (section 7's table, which also names the tool that would measure each). Class it
  before calling a stage unfair. The proof is the run flags (opening, before-tip, eagle) and the frames, never the end alone.
- Proof it matters: today's buggy-bot list of 16 "sealed or timed out" stages had **0** proven unfair once the ruler was fixed and the
  ends were classed. The real ones (section 6) came from the flags.
- Pitfall (2026-11-01): **a value the end of the frame has already overwritten reads 0 in the next frame's choices.** It bit `lastY`
  (round 5) and `lastX` (today): use `moveX` / `moveY`. The self-test's flat-ground case catches it coming back.
- Pitfall (2026-11-01): **one bug can hide others.** The hops carried the bot past its puzzle-room and climb gaps. After fixing the bot,
  re-run every stage and look at what got worse, not only what got better.
