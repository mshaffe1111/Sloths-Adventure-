# ENG-WATCH REPORT: the watcher is a real red light, green light (R-165.267, R-165.266)

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
(filled in below as each run finishes)

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
