# ENG-PETAL REPORT: one walked-path model for every petal; a LOW brief gets no fill; a wall at every joined pit floor (R-165.246, R-165.263, R-165.265)
Branch t-eng-petal from t-build-16@cecbb948 (git ls-remote at start), t-build-16@7d9f81b3 (ENG-16I final, reports only) merged at c302f27d.
Packet: reference/packets/2026-11-14/ENG-PETAL.md (origin/ccr-ea739a2f-dfcee4). Times below are pasted from `TZ=America/New_York date`.

## Verdict
**1-6 is NOT GREEN; nothing here is ready for Matt's link.** The three rules are built for every stage, each planted (7/7 plants
RED, restored GREEN): the one walked-path model (read by the socket lay, the fill and a pass on the built stage), the LOW brief (no
fill), and the wall at every joined pair of soft-pit floors (plus a proof that every 1-6 soft pit climbs back to its take-off on the
rescue layouts). 1-6's expert Normal went from 7/40 to 33/40 through the door; 7 seals remain, each 1-2 petals short, and the stage
now holds about 23 petals a layout (was 112): that count needs the lead's ruling before any more tuning.

## Before / after (castBots 1-6 seeds 1-40, both settings; the petal counts built as the game builds them, generateStage + withGoals)
Petals held / the door, Normal, castBots layouts 1-10 (petals-held-*.txt; the door is goals.ts' 0.875, untouched):
| stage | before cecbb948: held (mean) | door (layout 1) | after ddbcd55c: held (mean) | door (layout 1) |
|---|---|---|---|---|
| 1-6 | 104-122 (112.3) | 105 of 120 | 21-24 (23.1) | 20 of 23 |
| 1-7 | 95-108 (102.8) | 1 (its goal is not petals) | 37 every layout | 1 |

**Petals per upright screen** (the lead's 10:21 PM ruling; a 440 px wide view, cameraFollow.test VIEWS.upright; Normal layouts 1-5;
reference/qa-reports/ENG-PETAL/screens.mts): **1-6 reads EMPTY**: 0.22 a screen, 85% of upright screens with no petal (before: 1.03,
33%). 1-5: 1.04, 48% (before 1.42, 21%). 1-7: 0.44, 66% (before 1.23, 25%). The fix is more sockets ON the walked pieces (the lead's
ruling), never a petal moved past a trap.

castBots 1-6 seeds 1-40 (PASS = shrine reached with the goal met; files castBots-1-6-*.txt):
| bot / setting | before cecbb948 | 7e9fe4d8 (moves to next piece) | f4896466 (own piece; drop) | ddbcd55c (+ the wall; FINAL) |
|---|---|---|---|---|
| expert Normal | 7/40 (33 sealed, got 80-107 of 91-109 needed) | 33/40 | 33/40 | **33/40** (7 sealed, got 17-21 of 18-22) |
| middle Normal | 13/40 | 35/40 | 34/40 | **35/40** (4 sealed, 1 rescue s34) |
| middle Easy | 40/40 | 40/40 | 40/40 | **40/40** |
| child Normal | 21/40 | 38/40 | 38/40 | **32/40** (7 sealed, 1 rescue s2) |
| child Easy | 39/40 | 39/40 | 39/40 | **39/40** (1 rescue s2) |
castBots 1-7 expert Normal 1-40: 40/40 before and 40/40 after (castBots-1-7-expert-*.txt; 1-7's door is not a petal count, so the
petals do not gate it; median 223.4 s both).
The child's Normal drop with the wall (38 -> 32): his misses (trace-child-normal-ddbcd55c.txt, seeds 4, 8) are on hang-low:b1,
false-liana:sb1, rest-stumps:s1/s2, none by a wall. With about 22 petals and a door of 19-21, one moved petal decides a run: the stage
has no margin, which is the count ruling in Pushback, not a fault of the wall (not proven either way: two seeds traced).

## Done-items (each planted: `python3 reference/qa-reports/ENG-PETAL/planted.py`; planted.out.txt: every plant RED, restored GREEN)
1. **ONE walked-path model** (src/game/gen2/walkedSpan.ts; every stage of every world). Besides ENG-16H's lianas and asks, the PLAIN
   jumps a fluid run takes from piece to piece: set down by a full run's jump held off the end of any piece behind (the farthest his
   flight carries him), left no earlier than TAKEOFF_FAR = 131 px before the edge (the testers' far aim, FT_EXPERT aimQ, R-165.59) or the
   earliest take-off that still lands; a seam is walked; a piece he stands on only after a miss (`away`: a soft pit's floor or stair
   below its lower lip, a hurt floor, a catch; petals.ts missPiece) is never a way on, a way off or a cleared piece's next.
   Read by (a) gen2 fillSockets (pipeline.ts: a socket's petals inside its own piece's walked span, at its take-off end), (b) petals.ts
   fillGaps (ledge trails only inside walked spans, never on a miss piece), (c) petals.ts walkPetals, the pass on the BUILT stage
   (level.md rule 27) at the gen2 build and in petalPass: a standing petal outside its piece's span moves inside it; one on a piece
   every run does not walk goes. Tests src/game/gen2/walkedPath.test.ts: A (a rest he flies over: no span), B (a ledge: set down by
   the full jump, left at the far take-off; seams walked), C (a pit floor never next, never walked), D (the PLAYED stage of 1-6
   layouts 1-3, 1-1 x2, 1-7, 6-1, 7-3, 8-2, both settings: every standing petal inside its piece's walked span, none on a miss piece),
   E (the brief). Plants plain-jumps (A, B RED), away (C RED), walk-pass (D RED: 1-6 petal 9687 outside 9602-9682), fill-span (D RED:
   1-1 petal 32375 outside 32408-32625).
2. **R-165.263: the petal brief is honoured** (petalPass.ts): a stage whose GraphBrief says `petals: 'low'` (data: 1-2, 1-6, 1-7; the
   type's own doc: "pickups come only from the sections' pickup sockets") gets no fill after the lay, the fill's arcs over jumps among
   them. Test E: 1-6 and 1-7 stripped bare, no fill under their brief; the same stage with no brief is filled. Plant brief-fill RED.
   Found: jumpTrails.ts routeGaps finds 0 gaps on every gen2 stage measured (1-1, 1-3, 1-4: platforms judged "odd" or out of range),
   so the arcs R-165.263 counted were fillGaps' own jump tier; no gate was added to addJumpTrails (it would be untested, LAWS 7).
3. **R-165.265: a wall where two soft pits' floors are joined** (pipeline.ts pitJoinWall, laid in the pit-floor pass; every stage): a
   24 px post at the earlier floor's end (the earlier pit's far lip), its face PIT.face more than a double jump over the floor (the
   pits' own rule: the hoist over a lip is 26 px, physics FORGIVE.mantle), its top never over the lip. A miss in the earlier pit climbs
   only its own stair, back to the beat's take-off; a fall off the perch over the join lands in the later pit, whose stair leads back
   to that perch. Test src/game/gen2/pitJoinWall.test.ts (the rule; 1-6 rolls 1-4 both settings: every joined pair has its wall).
   Plant wall RED ("the floor joined under 27933..28090 (y 1133) has no wall").
4. Merged t-build-16@7d9f81b3 (c302f27d).

## The petals 1-6's expert still leaves (traces: reference/qa-reports/ENG-PETAL/trace-*.txt, ENG-16I's petals.ts)
Raw: trace-expert-normal-f4896466.txt (ENG-16I's petals.ts, seeds 29, 34, 7, 37, 20; the code then = this head's petal lay, before
the wall). 22 petals left over 5 seeds, every door sealed 1-2 short (got/need 19/21, 19/21, 19/20, 16/18, 17/18). By why:
| why (counted line by line) | count | the raw lines (piece: walked span / where he stood) |
|---|---|---|
| set down past the span's END on hang-low:b1/b2, creaky-landing:b2, false-liana:sb1 (the arrival the model under-reaches: up to 150 px) | 13 | hang-low:b2 7965..8079 / 8115..8169 (s29); creaky-landing:b2 28539..28650 / 28716..28741 (s34, x2); false-liana:sb1 38985..39123 / 39166..39208 (s7) |
| rest-hump:m: the socket's petal clamped to the span's near end, he set down 90-110 px past it | 5 | 16400..16553 / 16511..16682 (s29); every one of the 5 seeds |
| rest-log:f: set down past the span's end | 2 | 40626..40706 / 40728..40792 (s29); 30265..30345 / 30357..30428 (s37) |
| never stood on it (snake-on-vine:out, rest-stumps:s1) | 2 | 25115..25152 (s29); 16437..16498 (s20) |
Putting each socket's petals at the span's take-off end instead (b2083de4) did not lower the expert's seals (33/40) and raised the
child's (38 -> 32/40 sealed+rescued): reverted (ddbcd55c). The fix that remains is the arrival model (lianas, doubles).

## Gates on the head
Code heads: ddbcd55c (the petal/wall code every bot number above was measured on), e10a86e2 (+ the build-cost fixes, output proved
identical by lockall: 102/102 stages unchanged, lockall --layouts 2 both settings, lockall-ddbcd55c-vs-e10a86e2.txt). Logs: gates-ddbcd55c.txt, seedcheck, suite below.
- tsc PASS (e10a86e2). knowncheck PASS. generalitycheck PASS (26 literals, 26 known). roadmapcheck: could not run ("shallow clone,
  proofs cannot be checked"; as ENG-16H).
- `BASE_PATH=/Sloths-Adventure-/ npx vite build` PASS; chunkcheck PASS; artcheck PASS (ddbcd55c).
- engine tools' tests 34/34 PASS; tierBots.test 7/7 PASS (1-1's petals moved, its tier calibration still matches); kbdcheck PASS.
- **buildcheck: OVER on ddbcd55c** (Normal p95 194 ms against 150, measured while the suite and a list check loaded all 4 cores; Easy
  p95 121). A same-load A/B in node showed the head's 1-1 build 25-40 ms slower at the median: the walked path's cost, real. Fixed in
  e10a86e2 (profile: fallSpans rebuilt per candidate call, `away` scanning every fall for every piece, spans recomputed): 1-1 p50
  88/93 ms vs base 87/92 ms, same load (bt.mts). buildcheck NOT re-run alone on e10a86e2: the first gate for the morning.
- Planted faults: 7/7 RED, restored GREEN (planted.out.txt, on 9983514f's code = ddbcd55c's).
- **seedlist --check**: 1-6 FAILS ("seed 80 normal/easy: its replay differs from its search (platforms, vines, collectibles, spawnY):
  rebuild the list": the wall changes 1-6's platforms). Relist __RELIST__. Others: __SEEDS__
- **The whole suite** (on ddbcd55c): __SUITE__
- drawcheck, clipcheck: NOT run (about 10 min of the whole machine; the suite, lists and relist held it until the cutoff).

## Polish check
None shot: the bots are not green (level.md rule 29: no stills of a stage whose bots are red). Named, not hidden: the R-165.265 post is a
24 px moss-stone pillar under the near end of the perch over the join (1-6's creaky limb, the gorge's creaky limb); its top is flush with
or 15 px under the limb's top, so on 1-6 the limb's near 24 px no longer gives way. It has not been looked at on a phone.

## Pushback
- **The petal count** (ACCEPTED for tonight by the lead, 10:21 PM; the morning line is the per-screen measure above). Honouring "every run walks it" on 1-6, a stage of short pieces, drops most of its sockets' petals: about 112
  held a layout before, about 23 now (the lay's 58-60, less the pieces a fluid run flies over or lands past). A door of 87.5% of 23 lets
  him miss 2-3. Moving those petals to the next walked piece kept more (about 36) but broke 1-5's lists on every seed (trap.hidden: a
  moved petal stood in front of a section's trap) and still sealed 7/40. The count and where 1-6's petals should stand is a Designer /
  lead call (LAWS 22: Matt's 0.875 was not touched).
- **The arc.** The packet asked for petals "on the arc over a piece he clears in the air". No single arc is every run's: the expert's
  holds run 84-701 ms and he doubles 24% of his jumps, so a petal on one arc is missed by the runs on the others. Not built; the petals
  stay where every run walks.
- **The liana let-go is under-modelled** (ENG-16H's lianaTouchdown): the expert lands up to 150 px past the modelled set-down after a
  liana (hang-low, creaky-landing:b2, false-liana, rest-log). That is the remaining cause of most seals (trace table).
- R-165.265's wall at 1-6's pits: the pits are exactly a double jump + 40 deep, so a face he cannot climb reaches the lip; a post 10 px
  under the lip would leave 4.5 px of margin over the hoist. Deepening joined pits by 15 px would let the post hide under the limb:
  a Designer call.

## ENGINE-WORTHY (for the bot member)
- tools/inspect/firsttimer.ts: the middle and child bots' way out of 1-6's gorge pit (layout 34: floor 43613..43916 y 1072, its stair
  at the take-off side, rises of 68 px, to s1-1): they stand at the far wall and jump at it 8 times, never walking back to the stair
  (ENG-16I rescues-9380bc5d.txt; my castBots ddbcd55c s34 middle N and s2 child). The pit's way back is proved (pitJoinWall.test
  "climbs back", the rescue layouts both settings): the bot's stair skill, not the stage.

## Suggestions
- ENGINE packet: model the liana let-go as the bots and testers fly it (the release at the swing's forward speed; ENG-16I's
  rescues and these traces carry the frames), then re-run castBots 1-6; most of the remaining seals are there.
- DESIGNER packet: 1-6's petal plan for a stage of short pieces (where the petals stand, how many), now that the lay drops what no
  fluid run walks.

## Unresolved
- **1-6 is NOT green**: expert Normal still meets a sealed door on 7/40 (castBots table); middle and child have seals and
  the s34/s2 rescues (bot-side: the pit's way back exists, proved by pitJoinWall.test "climbs back" on the rescue layouts).
- **1-6's petal count** (about 23 a layout) is a ruling, not a fix; the lead's and the Designer's.
- **Every stage's petals moved** where the fill ran (lockall 2 layouts both settings, lockall-cecbb948-vs-ddbcd55c.txt: 71 of 102 stages
  changed, nearly all in `collectibles`; 1-6 also `platforms` (the wall); 1-2, 2-2, 8-2 goals or size). 8-2 moved wholesale on at
  least one of its 4 builds (layout 1 Normal is the same roll, attempt 753230): not traced.
- **8-3 (softFalls11.test:128)**: the revert proof is done (softfalls83/revert-proof.txt: with pitHoleFill off all three layouts equal
  main's pins byte for byte). The move is ENG-16H's pit-floor pass alone: +56 pieces on L2, +53 on L3, 72-86 px moss-stone fills 160 px
  tall. Too large to call intended without looking at it: NOT re-pinned (a lead call after stills).
- **gen2Pits.test:61** (1-6 seed 1: "bank at x 28090 ends 0 px over the floor at x 27933"): pre-existing on cecbb948 (ENG-16I's list).
  The later pit's first stair step stands flush against the joined floor's end, its foot on the floor's top. Not fixed.
- 2-1 (R-165.263): a hand-built World 2 stage with no petal brief in data; its fill now keeps to walked spans (lockall: collectibles
  moved) but "few" needs a brief field and a number from the story keeper / Designer. Not done.

## EXACT NEXT STEP
In order (engine tier unless named):
1. **1-6 reads empty** (0.22 petals an upright screen, 85% of screens empty; the count was accepted for tonight, the lead 10:21 PM):
   more pickup sockets ON the pieces every run walks (banks, the wide rests), a section-data packet for the 1-6 builder / Designer,
   then castBots again (more petals also give the door its margin back).
2. **Model the liana let-go and the double in the arrival** (walkedSpan.ts lianaTouchdown and the plain-jump arrival): 13 of the 22
   petals the expert left are set-downs past the modelled span after hang-low, creaky-landing:b2 and false-liana
   (trace-expert-normal-f4896466.txt); plant it on those pieces; then `npx tsx tools/inspect/castBots.ts --stage 1-6 --seeds 1-40
   --bots expert,middle,child --setting both --par 2` until 0 sealed (the s34/s2 rescues are the bot's stair skill: the pit's way
   back is proved).
3. **Lists**: `npx tsx tools/engine/seedlist.ts <id> --check` for 1-1..1-7 on the head (results in Gates; relist any that fails, in
   order, with `npx tsx tools/engine/addlevel.ts <id> --relist --no-bots` as ENG-16H did, and commit only that run's lists).
4. **The suite reds** (Gates): gen2Pits.test:61 (the later pit's first stair step flush against the joined floor's end; pre-existing),
   softFalls11.test:128 (8-3: revert proof done, look at the 56 fills on a phone before re-pinning), and any pin the moved petals
   broke (lockall: 71 stages' collectibles moved).
5. 2-1's petal brief: a data field and the keeper's number (R-165.263's 'few'), then its fill honours it.
6. Stills and clips only on the GREEN head (rule 29).

## Learned
- A background run gets its timeout set to the job's length: I left the default 30 minutes on the whole suite and the list checks,
  started them on a 4-core machine already full (castBots, lockall), and both were stopped unfinished at 10:48 PM. Run the suite alone.
- A model that is "every run walks it" must be tried against the count it leaves before it is called a fix: 1-6 went 112 -> 23.
- Moving a pickup off its piece crosses into another piece's clearances (traps, Dot spots): keep a section's pickups on its own pieces.
- A test must judge the stage the game plays (D19): libstage buildStage is the raw roll, without finishStage's petalPass; my first D
  and E passed on it for the wrong reason.
- A stacked piece under a petal: pick the top one (the walked span of the piece under it is the one it stands on).

## Method used / Lessons applied / Method update
Method: reference/methods/level.md rules 21-29 (the packet's), the ENG-16H planted-faults form. Lessons applied: D19 (tests on the
played stage), D29 (seedlist --check after the lay moved), D30 (times pasted from `date`; my 10:14 PM progress message said 10:17,
typed: a miss, logged here), D36 (worktrees for every run, `git ls-remote` equals HEAD after each push), D55 (context % in every
message), D57 (queue read before the progress message). Method update (proposed for level.md): "A petal goes where every run walks
(gen2/walkedSpan.ts): a socket's petals on its own piece, at the take-off end of its walked span; check walkedPath.test D".

## Turnover note
reference/handoffs/engine-core.md section 0ze, written in commit 9983514f (t-eng-petal).
