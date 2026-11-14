# INT-9 REPORT (t-int-9 from origin/t-int-8@0a9be28c; link #3: 1-7 + tips by height + the solid fig gate + liana chains + the clip tool)
Integrator, Opus 5.5 xhigh. Started 3:03 PM ET 11-14. Lead session_01FhBbYNzGRJBDMzn6XbtQK2. DRAFT: results land below as they finish.

## STATUS: (pending)

## Merges (each branch's REPORT read first; all GREEN on their own heads)
| # | Branch@head | Merge | Conflicts, resolved by both sides' intent |
|---|---|---|---|
| 1 | t-int-8-clip@315548d1 | (in 7df7b8e3's history) | none |
| 2 | t-fix-15@8afe53a9 | yes | none ("over" stays red until FIX-15b's lay: named) |
| 3 | t-tips@a054e8e7 | 6fda20c0 | gates.yml tool line: clip.test + tipwalk.test both; the tipwalk step kept |
| 4 | t-eng-s5@a2743943 | 7f97d5fb | 23 (criss-cross, 4 bases): see the commit message, each file named |
| 5 | t-build-17@e6e64141 | 030045cd | 20: union tool line (+pitClimb), 1-7's list added to the link's 1-1..1-5, both preload keys, m cover now + n snake later, propTags + DropSite filter, CSV union 9452 rows, NODE-KEY re-written |
| 7 | t-fix-15b@2ed6a692 | 7df7b8e3 | engine-core handoff only |
| 6 | t-build-16 | WAITING for the lead's word (ENG-16E) | |

## The one semantic red the merge made, and its fix (3ad51f04)
- 1-7 did not roll on the merged head: libstage 3/8 clean (t-build-17 alone 24/24), `seedlist 1-7 --check` threw "no section fits node
  n10: the pool is spent". Probe-proven root: POLISH-6's settle (R-165.226) swaps a section whose stone it cannot keep on its ground;
  1-7's liana pits lay a pitSteps stair stone flush against a bank whose foot stops 0-7 px above the pit floor, because pipeline.ts
  deepen() filled a bank down only when the hole was over 48 px, and w1CutArt.ts groundRun counts a bank as the run's wall only 3+ px past
  the floor. With the settle off: 8/8; t-build-17 + t-eng-s5 alone: 8/8.
- Fix at the root geometry (lead's ruling 3:19 PM): a bank beside a pit always reaches past its floor (World 9's rule, every world).
  Not the gate's reading (that would loosen POLISH-6's rule: LAWS 22). 1-7: 24/24 clean both settings.
- Planted: gen2Pits.test.ts 'any slot' (every listed World 1 stage, seeds 1-2, both settings: builds, no bank foot 0-48 px over a floor
  it touches): RED with the exception back (1-7 seed 1 does not build), GREEN with the fix. generality debt: pipeline 'world === 9' 2 -> 1.
- Ripple (lockall 4 layouts, all 102 stages, vs the merged head): 83 unchanged; 1-3 and 5-7 5-9 6-1 6-5 6-6 6-7 7-3 7-5 7-6 7-7 7-9 8-1
  8-2 8-3 8-5 8-6 8-9 change platforms ONLY (bank heights); 1-7 builds where it threw.

## BUILD-17's ENGINE LINES, reviewed line by line (xhigh)
- sweepPose.ts:45 SNAG_PERCH 56: PASS. Equals w17Art.ts SNAG_PERCH_DRAWN = (snagB.foot 880 - perch 712) x 1/3 = 56; eaglePerch.test pins it.
- w17Art.ts:46 snagB.perch 712: PASS (the same measure, the drawn low branch).
- engine.ts (hero for the cast: holding includes p.hanging; h.hanging; h.rope = the swung or climbed vine id): PASS. A swing's own vx
  never counts as moving (hanging is false on a liana); hanging moss now hides a still hang (hangCover.test).
- stillness.ts:32 + :44 (hanging; moving = a creep along the rope): PASS. inCover's rope cover returns only for the held vine id.
- castPlay.ts CastHero.hanging / rope: PASS (fields, read by stillness.ts only).

## Tools
- modelgate self-test PASS 24/24 on Matt's 11-14 1:51 PM rule (models.json from the lead's branch; docs/engine/ideas medium-or-max now
  refused, the dead "max allowed" line gone, the never message names its source).
