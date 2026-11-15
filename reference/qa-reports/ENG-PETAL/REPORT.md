# ENG-PETAL REPORT: one walked-path model for every petal; a LOW brief gets no fill; a wall at every joined pit floor (R-165.246, R-165.263, R-165.265)
Branch t-eng-petal from t-build-16@cecbb948 (git ls-remote at start), t-build-16@7d9f81b3 (ENG-16I final, reports only) merged at c302f27d.
Packet: reference/packets/2026-11-14/ENG-PETAL.md (origin/ccr-ea739a2f-dfcee4). Times below are pasted from `TZ=America/New_York date`.

## Verdict
__VERDICT__

## Before / after (castBots 1-6 seeds 1-40, both settings; the petal counts built as the game builds them, generateStage + withGoals)
__TABLE__

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
__TRACE__

## Gates on the head
__GATES__

## Polish check
None shot: the bots are not green (level.md rule 29: no stills of a stage whose bots are red). Named, not hidden: the R-165.265 post is a
24 px moss-stone pillar under the near end of the perch over the join (1-6's creaky limb, the gorge's creaky limb); its top is flush with
or 15 px under the limb's top, so on 1-6 the limb's near 24 px no longer gives way. It has not been looked at on a phone.

## Pushback
- **The petal count.** Honouring "every run walks it" on 1-6, a stage of short pieces, drops most of its sockets' petals: about 112
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

## Suggestions
- ENGINE packet: model the liana let-go as the bots and testers fly it (the release at the swing's forward speed; ENG-16I's
  rescues and these traces carry the frames), then re-run castBots 1-6; most of the remaining seals are there.
- DESIGNER packet: 1-6's petal plan for a stage of short pieces (where the petals stand, how many), now that the lay drops what no
  fluid run walks.

## Unresolved
__UNRESOLVED__

## EXACT NEXT STEP
__NEXT__

## Learned
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
reference/handoffs/engine-core.md section 0ze, __TURNOVER__.
