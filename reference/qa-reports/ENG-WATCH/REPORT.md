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
