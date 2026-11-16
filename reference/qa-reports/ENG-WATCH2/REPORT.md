# ENG-WATCH2 REPORT: the eagle's fix green, the re-check, 1-7 tuned (R-165.267, R-165.266). t-eng-watch2 from origin/t-eng-watch 76a81ad2
**STATUS: GREEN on the scoped gates the lead set at 11:54 AM ET (tsc, kit/eagle tests, seedlist 1-7, castBots 1-7). The suite and the clips go
to the integration head.** Code head c9c8dbc9. Packet: reference/packets/2026-11-15/ENG-WATCH2.md; the lead's rulings A (11:12) and B (11:49).

## EXACT NEXT STEP (integration onto INT-10's head, origin/t-int-10 9d8c9fda; xhigh)
1. Merge t-eng-watch2. The dry run (`git merge-tree`) conflicts in 4 files, all ADDITIVE (1-8's still fork beside the glance); keep both sides:
   predators/types.ts Post `passes`/`glance`; types.ts Enemy `kitPasses`/`kitGlance`; castPlay.ts newPredator passes both; core.ts
   newPredator `passesLeft`/`...glanceOf`; core.ts endPass keeps both lines (spend the pass budget, then `recheckAway`).
2. On the merged head: tsc; eagleGlance, eagleKit, predator*, w1Arc17 and 1-8's tests; castBots 1-40 both settings on 1-7 AND 1-8 (the
   still-fork eagle now re-checks), every miss traced; seedlist 1-7 and 1-8 --check; lock 1-7, 1-8, W6, W8; drawcheck; the suite ALONE. Relist 1-7 only from the full-suite head (rule 20; ENG-PETAL may move petals). Then the clips once (§4).

## 1. Done (evidence in this folder)
- **F1 gated by data** (b2a0ef55): `PredatorDef.passAt: 'far'` (EAGLE); the caiman keeps there-and-back (in this build only 1-7 hands a
  sweeper to the kit). 3 eagle kit tests restated to F1, old asserts kept for a sweeper without passAt; caiman test untouched. Plants A/B.
- **finish17 dropped the perched eagle's glance** when it rebuilt it on its snag: fixed, planted (C).
- **The re-check** (ruling B, c9c8dbc9): `Glance.recheck`, REQUIRED. After a look that saw nobody and after every pass the head comes round
  in 0.6-1.2 s, always a real look (never a fake-out), then a full away; Easy x1.5. Plants D (off: 2 red), E (may fake: 3 red).
- **Restated:** eagleGlance:168 over seeds 1-8 (Normal caught >= 7/8; base 3/8, v1 5/8; Easy >= 1 and <= Normal; every catch told first);
  the fake share over turns after a full away; eagleKit 'own cool' measures the cool alone (glance off). Flagged to the lead.
- **Gates:** suite ALONE on b2a0ef55: 3556 pass, 5 fail, all red on the base too (suite.txt); on c9c8dbc9 UNRUN, stopped 12:10 PM (1090 ok,
  0 not ok) by the lead's ruling. Lock 20/21 watcher stages unchanged + 1-7 enemies intended; seedlist 1-7 PASS (100); castBots,
  firsttimer, tierBots tests 27/27; generality, knowncheck, roadmapcheck PASS. Not run (integration runs them): drawcheck (no draw code
  changed), build, clip, kbd, buildcheck.

## 2. The dials 1-7 ships: WATCH_17 (w1Arc17.ts) over EAGLE's (world1.ts), Normal; Easy: away and re-check x1.5, the tell x1.3, no fake-outs
away 1.0-3.5 s (EAGLE 1.2-4.5), re-check 0.5-1.0 (0.6-1.2), look 1.0-2.4 (0.9-2.2), fake 0.3 (0.25), reach 240 px, passAt far; calm unchanged (5.1-5.6 s, floor 5).

## 3. Numbers (base 76a81ad2 vs the final head; same harness; castbots-1-7-*.txt, botcross.txt, probe-recheck.txt)
| castBots 1-40 (pass, eagle hits) | kid N | kid E | adult N | adult E | child N | child E | middle N / E | expert N |
|---|---|---|---|---|---|---|---|---|
| base | 38/40, 305 | 37/40, 37 | 39/40, 71 | 40/40, 31 | 39/40, 98 | 40/40, 29 | 40/40: 69 / 24 | 40/40, 59 |
| final | 37/40, 407 | **40/40**, 69 | 40/40, 180 | 40/40, 68 | 39/40, 125 | 40/40, 52 | 40/40: 113 / 40 | 40/40, 123 |
- Every Normal rescue is a pit way-back, traced: kid 1 x23424, kid 28 x23048, kid 5 x34977, child 37 x34795 (8 falls, 3 hits): ENGINE-WORTHY,
  owner ENG-PETAL. Easy takes fewer hits than Normal for every bot. Walker probe, seeds 1-4 Normal: >= 1 heart at all 7 eagles past the lesson.
- botcross (METER-1's formula, seeds 1-4, Normal): tier bots 0.29 -> 0.61 misses a minute (1-5: 1.83); first-timers 1.60 -> 2.55 (1-5: 1.26).
- **METER-1: 2.250 / 1.385, unchanged.** Caveat: its watch term reads neither the calm nor the glance (METER-2a); the tier bots never lapse (METER-2b).

## 4. Polish check: none shot here (the lead's lean ruling; rule 29: once, on the head going to Matt). Shoot list with `eagleClip.mjs` (its caption now names
  the screech at either end and a re-check), upright and sideways: #7 glance Normal and Easy (a freeze; Easy's tell), #5 glance (a fake-out),
  #2 walk (caught in the open), #7 sneak (the re-check). Named from ENG-WATCH's frames: the flying eagle's head-cock reads as "coming in"
  (a painted head-turn frame is needed); sideways, the perched eagle's lift-off passes under the sign.

## 5. Pushback, suggestions, unresolved
- Pushback: the tier-bot ruler can't see the glance (ruling A); a one-seed test pins one roll of a seeded rhythm (use seeds and a rate). Packets: ENG-PETAL the pit way-back (above; kid Easy 29 on v1, 0 hits); the lead: writtenKeys red on the base (1-7's seed key has no find
  id); METER-2a/2b; art: the flying harpy's head-turn frame; tools: eagleProbe marks a stuck run (at #6 a never-freezing Easy sneaker stuck
  at the liana gap lost 2 hearts to Normal's 1, seed 4; the bots' Easy is lower everywhere).
- Unresolved: the suite and the clips on c9c8dbc9; drawcheck; every item above. Turnover: engine-core.md §0ze (97166f5c).

## 6. Learned, and proposed level.md changes
- A dial a stage can override is REQUIRED in its type (finish17's dropped glance was this class: a stage's dials vanishing silently).
- A quick second look must be a real look: a fake-out inside the re-check made it a 3 s green light (found with --frames, fixed).
- Judge a watcher with the probes (a walker who never hides, an instant sneaker); a calibrated freezer pays in time, not hearts.
- Proposed rule 30: "A watched stage passes the probes on Normal: a walker loses >= 1 heart at every watcher past the lesson; the perched one
  catches the instant sneaker on 7 of seeds 1-8; Easy never more. Check: eagleGlance.test." World 1 note: 1-7's dials are WATCH_17.

## 7. Method, lessons, my misses, turnover
- Method: stage-fix.md, gates.md, the card's day one (lock base 76a81ad2). Lessons applied: D15 (ruler reproduced 1-5's 1.83), D19, D43, law 22, D59.
- Miss 1 (D30 again): "11:58" typed when the clock read ~11:49 (the lead caught it); now every header is pasted from `date` in the same step.
- Miss 2 (D57 again): no ReadNotifications at the 12:05 push: the suite ran 12:06-12:10 after the lead's "skip it"; now the queue is read with every push.
- Method update (gates.md): a watcher change runs eagleProbe walk and sneak, seeds 1-4, both settings; the perched sneak over seeds 1-8.
