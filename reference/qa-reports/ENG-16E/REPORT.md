# ENG-16E REPORT: 1-6's engine findings fixed for every stage (A the chain's last leap, B the shared petal fill, C World 1's FAR) (R-165.246)
t-build-16 from 67027823 (BUILD-16d's revert head); packet reference/packets/2026-11-14/ENG-16E.md (lead's branch ccr-ea739a2f-dfcee4).
Start 2:18 PM ET (`date`). DRAFT: being filled as the runs finish.

## Done-items (each with its evidence)

### A. The chain's last leap: two engine faults, both fixed for every stage
1. **The real fault (engine.ts sweetSnap, 9d002c76).** The kid's chain deaths traced frame by frame (kid Normal seed 2, `trace-kid-n2.txt`,
   FT_FRAMES 51.7-54.4): he decides at 0.75 of the swing out, his press lands at ~0.95 (the thumb's lag), a beat late, so the engine leaps
   from the sweet spot's snapshot. engine.ts kept that snapshot WITHOUT the vine's amp, so `timedLaunch` threw him as off the engine's
   full 0.45 swing: real leap vx 426 where `pressWindow` (gen2's lay and every release check) flies 520. Every liana narrowed by a
   neighbour (a chain's; swingSetup's, any world) was a third short on a late press; a full-swing liana is unchanged (its amp IS the
   fallback). Fix: the snapshot keeps `amp`. Planted: `src/game/swingLate.test.ts` (the real engine, RealPlay on a bare world), RED
   without it: leapt (432, -620), the checks fly (520, -760) (plant.sh A3).
2. **The lay's guard (pipeline lianaBand + physics FORWARD_END/forwardEndLands, 6fdfe160).** Why not the amp floor the packet offered:
   ENG-S5's whole-next-swing-in-view rule forbids it: a last liana at the full swing needs its far side (reach 183 px) in view as he
   presses on the one before, with the swings' clearance: 2 x 183 + 50 = 416 > SWING_SEEN 414, so no spacing lays it. So the perch is
   laid within the chain's own reach: a perch laid by what he sees (a grip dial, or a chain's last liana) is laid only where the testers'
   let-go (the press at FORWARD_END = 0.75 of the swing out, the bot's LET_GO_AT, held equal by a test; every hold the dial names; the
   jump held) lands his middle LAND_IN (16 px, STAGE-RULES §1 "lands with margin") inside it. Dial-free lianas (Worlds 6-8, World 1's
   LONG) are laid as before (test 4). Planted: `src/game/gen2/worlds/w1ForwardEnd.test.ts`, RED with the guard off: the chain's far end
   +340 px, FAR's +440 px past the testers' let-go (plant.sh A1, A2).
   1-6 (fwdend probe, every seed 1-6 both settings): the chain's last perch +337/+357 -> +317 px; the forward-end let-go now lands 19-37
   px in (was 8-17, two short). libstage 1-6: 24/24 CLEAN both settings (`libstage-1-6.out.txt`).

### B. The shared petal fill (petals.ts fillGaps, 6fdfe160)
- A fill trail is never picked off the walked and landed path: inside a fall (gen2 `falls`, every gen2 stage of any world; `heartFalls`)
  below its LOWER lip (a pit's floor, its stair, its hurt floor), a hurt floor (`pit: 'hurt'`), a catch (`catch`), a creaky limb
  (`fragile`), a jump that starts or ends on one, a climb standing in a pit. Judged as a trail is picked (the layout's random draws are
  unchanged), so a stage whose fill never picked one is laid exactly as before. Stages without a fall record (hand-built, no gen2) are
  judged by the pieces' own marks only (named in Unresolved).
- 1-6 Normal seeds 1-6: fill petals on a pit floor 22 -> 0 (where-petals probe); the fill now lays 3 more on the path; Easy unchanged.
- Planted: `src/game/petalFill.test.ts` (toy stages, no stage id: the creaky landing over a moss pit, a perch in the stretch, a thorn
  bed, a jump off a creaky limb, a heart-fall zone), RED with the guard off (plant.sh B1-B4).

### C. World 1's FAR
- FAR's reach was the same root as A: its perch at the far end of the foot's band (+412..437 px) fell 2-27 px short of the testers'
  let-go. The A guard lays every dialled perch where that press lands: FAR now +366..387, landing 18-39 px in. The row stays at
  BUILD-16d's 0.65-0.8 (the lead's ruling (a)), now of a band that ends at the testers' reach. Only 1-6 lays FAR (grep).

### D (part). The gorge loops: a BOT fault, fixed (tools/inspect/firsttimer.ts pitWayBack)
- My 2:58 PM diagnosis (a strand: the pit's stair leads back to the crumbled limb) was WRONG; corrected to the lead at 3:06 PM before
  any work was built on it. Frames (adult Normal seed 4, FT_FRAMES 236.8-240.4): after the fall past the creaky gb1 he climbs the pit's
  stair and IS caught by gl2 (its foot swings back over the stair, at 236.97), then holds LEFT and leaps left at 239.23, back over gb1
  into the pit before. The climb-back's direction (`climbBack.dir`, back) was kept while he swung: `pitWayBack` returned it whenever he
  was off the ground. Fix: on a liana the climb back is over and the route steers. Planted: pitClimb.test.ts test 6 (RED: -1, he steers
  back on the liana). The lead's global soft-pit strand check (2:54 PM ruling) is NOT needed for 1-6 (its pit has a way on: the catch
  from the stair); it stays a sound rule for its own packet (Suggestion 1).
- E2 (BUILD-16d's snake rule in the bot) reviewed line by line and KEPT: it reads the snake piece's own `now[i]` with the piece's own
  `handsAlong`, `head`/`tail` px from the anchor, `dir` +1 down (vineSnake.ts:90-146); with no snake piece it returns null, so 1-1's
  path is unchanged by construction; tierBots re-run (below).

## Where 1-6 stands (castBots 1-6 seeds 1-6, each bot+setting its own process, `cast-*.out.txt`; ran 2:47-2:50 PM on 9d002c76)
| bot | Normal 9d002c76 | Normal 6fdfe160 (A guard + B) | Normal BUILD-16d 0c277648 | Easy 9d002c76 | Easy BUILD-16d |
|---|---|---|---|---|---|
| kid | 2/6 (rescued s1, s5 x1; s3 x6; s6 x2) | 2/6 | 2/6 | 5/6 (s4 x1) | 5/6 |
| adult | 5/6 (s4 x6) | 4/6 | 4/6 | 6/6 | 5/6 |
| child | 4/6 (s2 x1, s6 x2) | 3/6 | 2/6 | 6/6 | 6/6 |
| middle | 5/6 (sealed 93/95 s1) | 5/6 | 4/6 | 6/6 | 6/6 |
| expert | 3/6 (sealed s1 93/95, s3 96/102, s5 86/90) | 2/6 | 1/6 | (Normal only) | |
- **The chain** at 9d002c76 (where.ts, every bot and setting, `where/`): one rescue, kid Normal seed 1 at chain:m; no life. At 6fdfe160
  (before the snapshot fix) the kid had RESCUE@chain:show x2 and LIFE@chain:m x1.
- **The pit petals: 0** (where-petals); the sealed doors left are BUILD-16d's (b): petals the expert hops over on perches and banks.
- **What is left is the gorge** (and singles elsewhere): the 6-rescue loops (kid s3, adult s4) are at gorge d2/gb1/gb2. Traced (adult
  s4, `trace-adult-n4.txt`): he lands on the creaky limb gb1 (gl1's perch, gl2's take-off), it gives way while he waits at its end for
  gl2, he drops into the soft pit, and the pit's stair leads back up to where gb1 WAS: a crumbled limb regrows only after 30-35 s and
  only off screen (regrow.ts), so he goes back through the pit before it to d2 and round again. The 1-6 lay strands him (level.md rule
  5). The snapshot fix did not cause it: only lianas under the full swing leap differently (the chain's, and the false liana's at 0,
  where omega is 0); the bots' draws upstream changed, which put these two seeds into a loop that was there.

## Polish check
(filled below)

## Pushback
- The packet's A named the amp floor first; it cannot keep ENG-S5's view rule (numbers above). And the amp was not the root: the engine
  threw a late press off the wrong swing. Fixing the snapshot fixes every narrowed liana in every world; the floor would have hidden it.

- C as data: with the engine guard FAR needs no more data move; its row stays at 0.65-0.8. And a finding for the Designer: with the
  testers' let-go as the limit, FAR (the foot) and LONG land about the same distance (+366..387 vs +365..383), and FAR also lands from
  the 0.7 hold now (fwdend GRIP=0.7: 9-21 px in). FAR's "foot only" lesson now rests on the snake coming down, not on the distance.
- Item 4 (BUILD-16c's per-beat socket petals): NOT needed any more to keep the fill off the pit floors (B does that for every stage).
  The ones added only for that: `pa` (take-off bank) on the snake on your vine, the false liana and the gorge, `pc` on the creaky limb
  (risers' and gorge's `pc` on r.perches[0] on Normal), `pg` on the gorge's last perch (w1Arc16.ts, 8002b130). The LANDED 0.88 moves are a
  separate reason (where he sets down) and stay. Removing them is a design call: 1-6's brief says `petals: 'low'` (types.ts: "pickups come
  only from the sections' pickup sockets"), so the sockets ARE the design's petals; without them those stretches go back to the fill (now
  on the path or nowhere). My recommendation: keep them (the lead decides).

## Suggestions (each a ready packet)
1. **ENGINE: a lay check that a creaky take-off over a soft pit never strands him** (any world). Objective: refuse (or re-lay) a fragile
   piece that is the take-off of a required leap or catch over a soft pit whose stair leads back up to it (the climb-out lands where the
   limb was; regrow.ts holds it gone 30-35 s and until off screen). Files: pipeline.ts (the lay, beside backPit), a planted toy test
   (RED: the gorge's gb1 -> gl2 shape). Done: 1-6 rerolled, castBots 1-6 gorge loops gone, every stage with fragile pieces re-checked.
   OR (a design packet): the crumbled limb comes back when he climbs out of the pit under it. Your call which.
2. **ENGINE/ARCHITECT: honour a brief's `petals: 'low'` in the fill** (BUILD-16c's suggestion, still open): types.ts:657-662 says a
   'low' stage's pickups come only from its sockets, yet fillGaps fills 1-2 and 1-6 like any stage. Either the fill skips a 'low' stage
   or types.ts says what the fill may add. Touches 1-2's list (relist).
3. **The fill for hand-built stages** (no gen2): they carry no record of their falls, so only the pieces' marks guard them. A geometry
   fall finder (findOpenPits-style, world-free) would cover them; they are to be rebuilt on gen2 (D40), so only if one ships first.

## Unresolved (named plainly)
- **1-6 is NOT green**: Normal kid 2/6, adult 5/6, child 4/6, middle 5/6, expert 3/6 (table above). Not done for D: the relist, bots 1-40
  both settings, stills and clips of every beat, the sealed/open exit shots. Reason: the gorge's strand (Suggestion 1) changes the stage
  again, so a relist and the 40-seed bots now would be redone (D40). The EXACT NEXT STEP below is in order.
- 1-1 kid and adult are rescued on every seed 1-6 on both settings, identical on main (73e7bed0), the start head and this head
  (`w1/at-main-*`, `w1/at-67027823-*`): pre-existing, not from this work, not looked into.
- The hand-built stages' fill (Suggestion 3).
- My misses: (1) the 9d002c76 commit's Claude-Session line names the lead's session, not mine; not rewritten (a shared branch).
  (2) I wrote "the chain: 0 rescues on every bot" into this draft before where.ts had run on every bot; caught and run before reporting.

## EXACT NEXT STEP (1-6, in order)
1. The gorge's strand: the lead rules Suggestion 1 (engine check) or a 1-6 data fix (gb1 not a creaky limb, or the pit's stair to the far
   side); then castBots 1-6 seeds 1-6 both settings (`xargs -P 3 < reference/qa-reports/ENG-16E/cast.jobs`, ~3 min) and where.ts.
2. The other single rescues at 9d002c76 (where/where-*.out.txt), each with `FT_TRACE=1 BOT=<bot> SEED=<n> npx tsx
   reference/qa-reports/BUILD-16d/stuck.ts` (fresh process).
3. Sealed doors (expert, middle): BUILD-16d's (b), the hopped-over perch petals; whether the tier bot's pickup on a hop is right.
4. Then: `npx tsx tools/engine/addlevel.ts 1-6 --par 4 --relist` (writes seeds-1-6, bots 1-40), the WHOLE suite,
   `bash reference/qa-reports/BUILD-16b/plant.sh <side worktree>`, stills + clips of every beat with
   `CLIP=1 node reference/qa-reports/ENG-16E/shoot.mjs <sha> normal|easy` (its press now waits for the forward end), CLAUDE.md Checks.

## Method update (what the method files should say; the lead decides)
- stage-fix.md / level.md: **trace a bot's death frame by frame (FT_FRAMES) before changing a number.** The chain looked like an amp
  problem for two builders; one 2-second frame trace showed the real leap (vx 426) differ from the model (520), which pointed at the code.
- gates.md: **a release model must be checked against the real engine's leap** (swingLate.test.ts is the pattern: RealPlay.bare, press,
  compare with the model's timedLaunch). The lay and the screen disagreed for a whole build round.

## Learned (proposed rule changes; the lead decides)
1. NEW engine rule: **a perch laid by what he sees is laid where the testers' let-go lands him** (physics FORWARD_END), not where the best
   press of the swing reaches. Check: w1ForwardEnd.test.ts.
2. NEW trap: **a creaky take-off over a soft pit strands him** (the stair back leads to a limb that is gone for 30 s). Until Suggestion 1
   lands: never lay a creaky limb as the take-off of a required leap over a soft pit.
3. Keep BUILD-16d's: never plant in the tree a measurement runs from (I planted in a side worktree, `plant.sh <worktree>`).

## Lessons applied
LAWS 3 (every number from a run or file:line; one claim caught before it shipped), 5 (every gate the packet scopes was run and is named;
the ones not run are listed), 18 (the amp guess replaced by a traced cause), 22 (no data workaround: the engine fixed, BUILD-16d's trial
stays reverted). LESSONS D15 (tested the measuring tool: the probe vs the real engine's leap), D19 (the gate and the screen called
different code: fixed and tested), D21 (spread: every narrowed liana in every world, every gen2 stage's falls), D29 (every list and pin
re-run after the change), D30 (times from `date`), D36 (status before commit, ls-remote after push), D40 (no relist on a stage the next
fix changes), D43 (no stage id in engine code: generalitycheck PASS), D57 (queue read at every push), D63/D69 (clips name the frame),
D67 (no wait loops: background runs and polls).

## Turnover note
reference/handoffs/engine-core.md section 0z (rewritten in this task's last commit).
