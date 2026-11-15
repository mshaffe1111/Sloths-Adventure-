# ENG-WATCH2 REPORT: the eagle's fix green, the re-check, 1-7 tuned (R-165.267, R-165.266). Branch t-eng-watch2 from origin/t-eng-watch 76a81ad2
**STATUS: SUITE_STATUS.** Code head c9c8dbc9. Packet reference/packets/2026-11-15/ENG-WATCH2.md + the lead's rulings A (11:12) and B (11:49 AM ET).

## EXACT NEXT STEP (integration onto INT-10's head, origin/t-int-10 9d8c9fda; xhigh)
1. `git merge t-eng-watch2` into t-int-10's head. The dry run (`git merge-tree`) conflicts in 4 files, all ADDITIVE: keep both sides.
   - predators/types.ts Post: `passes` (1-8's still fork) beside `glance`.
   - types.ts Enemy: `kitPasses` beside `kitGlance`.
   - castPlay.ts newPredator: pass both `passes` and `glance`.
   - core.ts newPredator: `passesLeft` beside `...glanceOf`.
   - core.ts endPass: keep BOTH lines (passesLeft spends the pass budget, then `recheckAway`). A spent still-fork eagle keeps glancing and re-checking (ENG-WATCH F3).
2. On the merged head:
   - tsc; eagleGlance, eagleKit, predator*, w1Arc17 and 1-8's tests;
   - castBots 1-40 both settings on 1-7 AND 1-8 (the still-fork eagle now re-checks), with every miss traced;
   - seedlist 1-7 and 1-8 --check; the lock of 1-7, 1-8, W6 and W8;
   - drawcheck (1-7, 1-8); the suite ALONE.
   - Expect 1-7's petals to move with ENG-PETAL: relist only from the full-suite head (rule 20).
3. Then the clips again on that head if 1-7 moved (rule 29).

## 1. Done (evidence in this folder)
- **F1 gated by data** (b2a0ef55): `PredatorDef.passAt: 'far'` (the eagle's). The caiman keeps there-and-back. Only 1-7 hands a sweeper to the kit in this build; no stage kit-plays the caiman.
  - The 3 eagle kit tests are restated to F1, with the old asserts kept for a sweeper without passAt. The caiman test passes untouched.
  - plants.txt A/B: F1 off -> 6 red; gate off -> 3 red.
- **finish17 dropped the perched eagle's glance** when it rebuilt it on the snag. Fixed; planted (C).
- **The re-check** (ruling B, c9c8dbc9): `Glance.recheck`. After a look that saw nobody, and after a pass, the head comes round in 0.6-1.2 s, always a real look, then a full away. Easy x1.5. The field is required, so a stage's dials cannot drop it. Planted D (off -> 2 red) and E (a re-check may fake -> 3 red).
- **Tests restated:**
  - eagleGlance:168 is now over seeds 1-8: Normal caught >= 7/8 (base 3/8, v1 5/8); Easy >= 1 and <= Normal; every catch told first.
  - The fake share is counted over turns after a full away.
  - eagleKit 'own cool' measures the cool alone (glance off). Flagged to the lead.
- **Gates:**
  - suite alone on b2a0ef55: 3556 pass, 5 fail, all base reds (suite.txt). On c9c8dbc9: SUITE2.
  - lock: 20/21 watcher stages unchanged, 1-7 enemies intended (lock-watchers-recheck.txt). seedlist 1-7 PASS (100).
  - castBots/firsttimer/tierBots tests 27/27; generality, knowncheck, roadmapcheck PASS.
  - Not run: drawcheck (no draw code changed; the glance poses are ENG-WATCH's, drawcheck PASS there). Build/clip/kbd/buildcheck: not touched by this branch; integration runs them.

## 2. The dials 1-7 ships (Easy derives: away and re-check x1.5, the tell x1.3, never a fake-out; calm unchanged, 5.1-5.6 s at 1-7)
| dial | EAGLE default | 1-7 WATCH_17 (w1Arc17.ts) |
|---|---|---|
| away / recheck / look (s) | 1.2-4.5 / 0.6-1.2 / 0.9-2.2 | 1.0-3.5 / 0.5-1.0 / 1.0-2.4 |
| fake share / reach | 0.25 / 240 px | 0.3 / 240 px |

## 3. Numbers (base 76a81ad2 -> v1 dials -> final with the re-check; same harness)
| castBots 1-40, eagle hits | kid N | kid E | adult N | adult E | child N | child E | middle N/E | expert N |
|---|---|---|---|---|---|---|---|---|
| base | 38/40, 305 | 37/40, 37 | 39/40, 71 | 40/40, 31 | 39/40, 98 | 40/40, 29 | 40/40 69 / 24 | 40/40, 59 |
| final | 37/40, 407 | **40/40**, 69 | 40/40, 180 | 40/40, 68 | 39/40, 125 | 40/40, 52 | 40/40 113 / 40 | 40/40, 123 |
- Every Normal rescue in the final run is a pit way-back, traced: kid 1 x23424; kid 28 x23048; kid 5 x34977; child 37 x34795 (8 falls, 3 hits). ENGINE-WORTHY, owner ENG-PETAL.
- Easy takes fewer hits than Normal for every bot.
- Walker probe (seeds 1-4 Normal): at least 1 heart at all 7 eagles past the lesson.
- botcross (METER-1's formula, seeds 1-4), Normal:
  - tier bots 0.29 -> 0.40 -> 0.61 misses a minute (1-5: 1.83);
  - first-timers 1.60 -> 1.69 -> 2.55 (1-5: 1.26).
- **METER-1: 2.250 / 1.385 in all three.** Caveat: its watch term reads neither the calm nor the glance (for METER-2a). The tier bots never lapse attention (METER-2b).

## 4. Polish check: POLISH_SECTION

## 5. Pushback / Suggestions (ready packets)
- The tier-bot ruler cannot see the glance: the bots freeze 0.3-0.4 s into a 0.75 s tell. Accepted (ruling A); METER-2b needs an attention-lapse term fitted to people.
- A one-seed scenario test pinned one roll of a seeded rhythm (168). State such rules over seeds 1-8 with a rate.
- ENG-PETAL: the pit way-back above (kid Easy 29 on v1 too, 0 hits: the finale's Easy soft pit, 54 px steps, the way on 161 px up).
- writtenKeys "every golden seed" is red on the base: 1-7's seed key has no find id. Owner: the lead (1-7 data vs the test's 1-7 assumption).
- eagleProbe stands stuck at a liana gap (walk < 150 px/s at #6). There, a never-freezing Easy sneaker lost 2 hearts to Normal's 1 (seed 4). Tools: mark stuck runs. Not a bot number: the bots' Easy is lower everywhere.

## 6. Unresolved: UNRESOLVED

## 7. Learned (for the next engine member) and proposed level.md changes
- A dial a stage can override is REQUIRED in its type. finish17's dropped glance was the same class of bug: a stage's own dials vanishing silently.
- A "quick second look" must be a real look. A fake-out inside the re-check made it a 3 s green light.
- Judge a watcher with the probes: a walker who never hides, and an instant sneaker. A calibrated freezer pays in time, not hearts.
- Proposed level.md rule 30: "A watched stage passes the probes on Normal: a walker loses at least 1 heart at every watcher past the lesson; a perched watcher catches the instant sneaker on 7 of seeds 1-8; Easy never more. Check: eagleGlance.test."
- World 1 note: 1-7's dials are WATCH_17 (w1Arc17.ts); tune by data there.

## 8. Method used, lessons applied, my own miss, method update, turnover
- **Method used:** stage-fix.md, gates.md, the card's day one. The lock base is 76a81ad2, not main: the packet's base.
- **Lessons applied:** D15 (the ruler checked first: 1-5 reproduced at 1.83); D19 (probe and bots on the real engine); D43 and law 22 (by data, every stage; no rule loosened); D57 (queue read at pushes); D59 (no run left in the background at stop).
- **My own miss:** an 11:58 typed in my message when the clock read ~11:49. D30, repeated, caught by the lead.
  - Root cause: a header typed from my sense of time.
  - Countermeasure: every message header pasted from a `date` call in the same step (done from 11:51 AM).
  - Method line proposed: `echo "ENG-X $(TZ=America/New_York date +'%-I:%M %p') ET"`, never typed.
- **Method update:** gates.md: a watcher change runs eagleProbe walk and sneak over seeds 1-4 (perched sneak over 1-8) on both settings.
- **Turnover:** reference/handoffs/engine-core.md §0ze rewritten (HANDOFF_COMMIT).
