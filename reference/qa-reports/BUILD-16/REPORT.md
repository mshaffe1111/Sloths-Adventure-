# BUILD-16 REPORT: 1-6 First Lianas (R-165.203). IN PROGRESS (this file is rewritten at the stop)
t-build-16 from origin/t-eng-s4@4bafe110; packet reference/packets/2026-11-14/BUILD-16.md (lead's branch). Started 10:02 AM ET.

## EXACT NEXT STEP (for a second builder, if I stop here)
1. `npx tsx tools/engine/addlevel.ts 1-6 --par 2` (seed list, --check, castBots 1-40 both settings, registry); commit
   src/game/gen2/proven/seeds-1-6.ts + provenIndex.ts. 2. Stills + clips: `node reference/qa-reports/BUILD-16/shoot.mjs <sha> normal`
   and `... easy` (CLIP=1 for clips), judge both ways. 3. Full CLAUDE.md Checks on the head (buildcheck alone). 4. plant.sh on a side worktree.

## Done-items (heads named per number)
1. **w1Arc16.ts** (World 1 data; no engine line): graph `A T P R M X R C R W R S R L E` (1-6.md's arc less beat 4's chain: the graph keeps
   one teach a move, so 1-6.md's second T is P; the snakes-met beat is a flow node so the deal keeps the design's order); one brick a beat:
   first liana (2 SHORT), hang low (3 LONG), snakes met (2 SHORT: one passes down the next liana, one comes down his and turns back at 0.6),
   snake on your vine (FAR, LONG, FAR; snakes from the anchor on both FARs; Easy LONG), creaky landing (2 creaky limbs; Easy sound boughs),
   risers (3 SHORT, 2 risers; none on Easy), the false liana (a still snake 150-170 px from the canopy past the bank, the real LONG past
   it), the gorge (FAR + snake, SHORT + riser, the false liana, creaky, 2 LONG; Easy: four lianas, a rest ledge, no riser, a sound bough).
   Rests (5) and arrival/exit its own. Flags at the start of every hard beat and on every rest (STAGE-RULES:107-109, typed: a flag just
   before each hard part, none inside the finale); hearts by the flag pass. SHORT perches land 80 px up (the lay's own answer: level,
   a jump reaches them), a bank 80 down follows, so every exit is level.
2. **Snakes** (finish16 = snakeLay.laySnakes, W1_SNAKES_16): trips 7 s down-off / 7.5 s down-back (reach 0.6) / 4 s risers (reach 0.7),
   tell 0.6 s, Easy stretched 1.15; the verdict passes on every roll tried (it throws otherwise). Every anchor hangs 360+ px under the
   level's top on its own (24 seeds both settings), so no floor move was needed (the GORGE idea, my 10:0x note to the lead, was dropped).
3. **The keeper's lines** verbatim (LINES_16, MISSION_16 in stagePlan, SEALED_LINES '1:vine_runner'), each a teach tip 800+ px before its
   beat on every roll (test), the risers' line only on Normal.
4. **Rolls**: libstage 1-6 24 seeds: CLEAN 24/24 Normal, 24/24 Easy (2c857c18); modelled 191-199 s Normal, 206-213 s Easy.
5. **Flown + judged**: FLIGHT_STAGE=1-6 flight.ts normal/easy all (fly/), flownArcs normal-1-6, the row judged. drawcheck lists 1-6 (D51).
6. **Tests** w1Arc16.test.ts 7/7: the arc beat for beat, lianas 420 / the false one 150-170 and still, snakes on the named lianas and
   deep, Easy never harder (no riser, no creak, no FAR perch, beats stretched), the 2-minute model, lines verbatim, tips 800+ px.
   Planted (plant.sh, planted.out.txt): M2-M6 RED; M1 (re-planted as a too-quick snake) to re-run on the final head.

## Pushback
- Lead ruling (a) "give vine_runner/1-6 its petal count": goals.ts goalHave returns null for vine_runner (no goal count, no sealed exit);
  making it a share of the petals is an engine edit (my packet: none). Asked the lead 10:33 AM ET.
- (b) old 1-6 lines kept: protoStage.ts's seesaw plan (now dead for 1-6) and dotTips.ts still name them. Proposed: one cleanup packet.

## Unresolved (named plainly)
- Beat 4, the chain: not laid (ENG-S5). The false liana and the gorge use a perch between every two lianas until then.
- 1-6.md's petal at the liana's FOOT (beat 2): not laid (a socket stands on a platform, never on a vine); the keeper's "Hang low, fly far!"
  teaches it instead.

## Method used / Lessons applied
- Method: reference/methods/level.md (Building rules first; steps 2-4, 6), gates.md. 1-5's brick form copied, not imported (rule 9).
- Lessons: D49 (flags typed from STAGE-RULES:107-109, not the table), D51 (drawcheck lists 1-6 the day it is built), D57 (queue read at each
  push), D59 (nothing left running at a stop without naming it UNRUN), D62 (the shooter labels what the game built: localStorage +
  easyMode, seed), D63 (clips of the whole action), D64 (context % from the 1M base), D67 (no shell wait loops: background runs
  with completion notices), D40 (no chain stand-in: beat 4 waits for ENG-S5), D19 (tests build through the game's own builder + finish).

## Learned (proposed level.md rule changes; the lead decides)
1. NEW rule (after rule 3): **Roll the stage under the list's own judge from the first roll** (`libstage.ts` builds with quietJudge; a
   bare buildGen2Stage does not). Evidence: my first 12-seed roll was 8/12; the 4 throws read "no section fits node (ki)" and were the
   quiet line (a flat 660 px start) refusing and swapping the teach brick out; one root hop made it 24/24.
2. NEW World 1 note: **a SHORT liana perch lands 80 px over the bank he left** (level, a jump would reach it) and a FAR or LONG one level,
   so a liana section steps back down 80 after every SHORT perch or its exit drifts up (measured on 1-6's kit, both settings).
3. NEW trap: **the length loop's "pool is spent" at the last node** is the stage being under its fast floor (target 134 s < floor 143 s
   on 1-6), not a missing section: lengthen the bricks (more lianas a beat), never add a filler section.
4. NEW trap: **graph letters are rewritten**: a second T for a move already taught becomes P; `ends: 'quiet'` drops L; V11 caps any
   content type at 40% of the content nodes and forbids two neighbours alike (except T then P). Write the code with those in mind.
5. Rule 6's check (a tip 800+ px before) is a one-test pattern every level can copy (w1Arc16.test.ts "Dot teaches BEFORE").
