# CRITIC: a pre-mortem of the four engine options and the lead's sketch (engine critic, 2026-11-04 evening)

**Premise (a fixed fact for this exercise, not a question).** It is Friday 2026-12-04. The engine we chose shipped and failed. Matt
played World 2 rebuilt on it and said it feels the same as World 1, the stages are easy and samey, and a stage still costs about 1.5%
of his week and most of a day. This file says why, for each spec, and runs every cause a tool can check against our real code.

Specs judged: `reference/engine/DESIGNER.md` (head 82a543df: A Proven Rooms, the designer's pick; B Beat Grammar Solver; C Bot-Judged
Archive; D The One Who Went Ahead), and `reference/engine/LEAD-SKETCH.md` (called SKETCH below). Evidence: R1-R4 on
`ccr-0d59a91c-oy3imz` (`reference/research/engine-2026-11-05/`). Code runs were made in a worktree of `ccr-0d59a91c-oy3imz` at
46f2d990, the branch that has `beatTrace.ts` and `w1Rhythm.ts`. Short names: BT = `src/game/beatTrace.ts`, WR = `src/game/w1Rhythm.ts`,
PH = `src/game/physics.ts`, D = DESIGNER.md, SK = LEAD-SKETCH.md, SR = `reference/STAGE-RULES.md`.

---

## 0. Planned vs actual time

| | |
|---|---|
| Planned | 90 minutes (due about 11:50 PM ET) |
| Started | 10:23 PM ET (`TZ=America/New_York date`), 2026-11-04 |
| Finished | about 10:45 PM ET, so about 22 minutes, measured by the shell clock (the container's `/proc/uptime` agrees: 831 s at 10:33 PM, about 10 minutes after the start) |
| Red flag | **Under half the plan. The lead should check this report with that in mind.** |
| Where it went | I read all of D (1,111 lines), SK, R1-R4 (2,807 lines, every line, in parts), SR (650 lines), LAWS, PERFORMANCE-RULES (by search), research-ledger.md and LEAD-PLAYBOOK §8k. Three persona subagents ran in parallel, each reading all of it; they used about 970k tokens and 4-6 minutes of wall time each. I wrote and ran 4 scripts against the real tracer and gen2 seeds, plus the fun gate (64 s) and the first-timer bot on 1-2 and 1-5, and I re-counted the cost persona's git figure myself. |
| Why it is short | Runs are fast here (a node traces in ms, the fun gate in about a minute), and the three personas read in parallel. I stopped once every tool-checkable top cause had a run. I did not pad. |
| Cut, plainly | I did not run levelCheck on its own: no ranked cause turns on it, and the fun gate and first-timer runs go through it. No phone timing (the at-load cause, A-9, needs Matt's Pixel). I fetched only two outside sources (§7). The rest of the external evidence is R1-R4, which the lead has already checked. |

---

## 1. The top causes, ranked (damage x likelihood), with what the runs showed

Each cause has a falsifier. "Run" lines are measured; numbers I worked out by arithmetic are marked as estimates. The raw cause lines
from the three personas (51 in all) are in `reference/engine/critic-runs/personas.md`. Clustering merged their duplicates without
rebuttal. Scripts and outputs are in `reference/engine/critic-runs/` (`critic-exp1..4.ts.txt`, `*.out`).

### #1. The proof's alphabet is World 1's, so World 2 comes out as World 1 painted as a river (A; also B, SKETCH). All three personas.
- **Where.** D §5.1 step 2 (a room enters the library only if traced and proven); D §5.6 row "a room's moves on the music's beat... traced by the one tracer"; D §11.3 step 5 (tracer growth: "vines..., ropes, mushrooms, wind, 12-time bars"); the 2-4 sample spec, D §5.2 (current, logs, raft, swing onto a moving log).
- **Run (code).** The tracer knows `Move = 'hop' | 'jump' | 'double'` (BT:48) and `Surface = 'bank' | 'branch' | 'stump' | 'crumble'` (BT:50). Its marks are `x o h .` only, and any other mark throws (BT:200-221). Nothing in it moves or floats. World 2's own vocabulary in `src/game/w2Stages.ts` (word counts): water 39, river 34, log/logs 26, reed 13, stone 12, raft 9, rope 8, sluice 6, lily 6. None of these is a tracer surface, and step 5's growth list leaves out water, moving logs, rafts, currents and moving platforms (SR §0.4 asks for moving platforms "from World 2").
- **Mechanism.** A World 2 room can be proven only if it is built from 3 moves x 4 static surfaces x up/flat/down, which is World 1's alphabet. The rooms that do use World 2's things sit outside the proof, the way WR's vine chains already do ("rolled until", WR:438-470), and then the "right by construction" claim is gone. This is R2's lesson 1 (the sameness is in the vocabulary) carried into the next world.
- **Falsifier.** The kind strings of room-built World 2 stages (R2 exp. 2 tokens) hold at least 4 landing kinds that World 1's 8-9 do not, and at least half of World 2's rooms have a proof trace with a moving or floating surface.
- **Status: CONFIRMED by the type definitions and the word count.**

### #2. Proof makes every jump safe for a clumsy thumb, so nothing bites on Normal (A; also C, SKETCH). All three personas.
- **Where.** D §2.3 "Risk budget" (spike 0.2-0.4, climax 0.3-0.6 expected falls); D §5.1 step 2 (proof = `traceNode` + `checkTrace`); D §11.2 `rate.ts` ("once calibrated").
- **Run (code).** Every pad is widened until every one of the `TRIES` flights lands (BT:330-343, checked in `checkTrace`, BT:603-634). `hazardSpots` puts a hazard only where it clears **every** safe try's path by `HAZARD_CLEAR` 24 px (BT:566-590). So by construction, no thumb inside the tracer's clumsy model ever meets a hazard or misses a landing.
- **Run (real engine, `inspect.ts --stages 1-2,1-5 --firsttimer`, `critic-runs/exp5-firsttimer.out`).** 1-2 Normal adult: shrine, 0 lives a minute, 0 hits, 0 harms. 1-5 Normal adult: 1 harm, 0.3 lives a minute. This matches R4 §5.4 (0.00-0.03 expected falls at Isaksen's σ) and §5.7. The fun gate at 46f2d990 PASSes but carries "nothing bites" as known debt on 1-7 and 1-9 for all 16 layouts in both settings (`critic-runs/funcheck.out`).
- **Mechanism.** In A the risk budget is only a ceiling. The only thing that sets risk, the proof, is pinned to zero for anyone inside the clumsy model, and the bots that would rate a room's risk are not fitted to people (R3 W6, R4 §2.7). So every proven node lands near 0, and every proven stage is "easy". The risk that does survive is the kid's late thumb on Easy short hops (R4 §5.4: 0.98-1.58 expected falls on 1-2 Easy), which is the wrong setting. This breaks SR §0.5 ("sloppiness has a consequence... World 2 included").
- **Falsifier.** On room-built World 2 Normal, with only tracer-proven jumps, the first-timer adult loses a median of at least 1 life a stage and spike nodes measure at least 0.2 expected falls.
- **Status: CONFIRMED by the code path and the runs.**

### #3. "The same room plays differently in every world, for free" is longer walks between the same jumps (A, B; the frame of every beat option). ENGINE and PLAYER.
- **Where.** D §2.2 consequence 1; D §5.3 ("a tempo half as fast... a slow, weighty stride").
- **Run (`critic-exp1`, `critic-exp3`).** Six of the designer's own pieces, traced at W1 128.2, W2 94/98/102 and W7 68 BPM. **The gaps are identical at every tempo** (march: 82/82/82/73 px at all five). What grows is the ledges: march 184 px at W1, 266 at W2 98, 420 at W7 68. The share of the room spent in the air falls from 22% to 18% to 13%, and density falls from 1.07 to 0.82 to 0.57 take-offs a second. On "sparse", the W7 tempo makes 3 dead walks over 2.5 s that are not there at W1. The kind string of an 8-room roll is the same at both tempos, so its NCD is 0.07, the self level (R3 F7 calibration: self about 0.09, shuffle about 0.62; my shuffle control 0.52).
- **Mechanism.** One physics set serves every world (PH), so a jump spans the same pixels everywhere and tempo only stretches the run between jumps. A slower world plays World 1's jumps with more walking: emptier and easier, not different. World 2's whole band is 94-102 BPM, ±4%, so its nine stages also share one pulse (SR §0b.6: neighbours "must not share a tempo").
- **Falsifier.** In 4-choice pairwise play (R3 F15), Matt or QA calls a World 1 room re-traced at World 2 tempo "different" in over half the pairs.
- **Status: CONFIRMED by the run (identical gaps, longer ledges, lower density).**

### #4. No spec budgets the judging, and judging is where the day goes (all specs; A's numbers worst). COST, backed by ENGINE.
- **Where.** D §5.8 (a stage costs spec 15 min + hero room 45 + gates 15 = about 1.25 h); SK line 18 (0.2-0.4% a stage).
- **Run (git, my own count).** In the World 1 rebuild night (`git log --all --since=2026-11-04T17:00Z --until=2026-11-05T04:00Z --no-merges`), **169 of 308 commits touch only `reference/`** (status, QA reports, rulings): 55%. Of the 33 commits on WR, at least 8 are petal-goal tuning, 5 are art and look fixes (floats, faces, posts) and 4 are first-timer fixes (from the subjects, my reading). The persona counted 4 send-backs of 1-1 on 11-04 (STATUS.md:903, 933, 937, 943), all for look or petals.
- **Arithmetic (estimate, on D's own numbers).** A world's room library is 50-70 rooms x 20-30 min = 17-35 h, plus 9 hero rooms x 45 min = 6.75 h. Spread over 9 stages that is 2.6-4.6 h a stage, plus 0.5 h of spec and gates: **3.1-5.1 h a stage, against 3.8 h measured today** (R1 §3.13). The cost does not move.
- **Mechanism.** Every spec moves where geometry comes from. None cuts the stills both ways, the save states, the 30-minute quality check-ins, the quality supervisor's in-order play or the send-backs (LAWS 1-2, 9, 16; SR §5b). R1 L7 and R4 §5.2 both say the machine is fast (0.1-0.4 s a stage) and judging is slow.
- **Falsifier.** Room-built World 2 stages show under 25% review-only commits each, and at most 1 send-back a stage.
- **Status: CONFIRMED (git count; the arithmetic is on the spec's own estimates).**

### #5. The seam maths holds only at World 1's tempo, in Normal, going right (A). ENGINE and PLAYER, run by me.
- **Where.** D §5.7: "Doors at different bands never meet... the aprons are shared... cannot fail".
- **Run (`critic-exp2`).** I chained proven rooms on one shared 200 px apron, which is 0.702 s at 285 px/s, and measured how far each next room's first take-off sits from the stage-wide eighth grid:
  - 128.2 BPM: 2-6 ms off. **0.702 s is 3.00 eighths at World 1's tempo, a coincidence.**
  - W2 94/98/102 BPM: 41-132 ms off (13-45% of an eighth).
  - W7 68 BPM: 78-153 ms off.
  - One 30 fps frame is 33 ms, so at every non-World-1 tempo the rhythm stumbles at the seams.
- **Run (`critic-exp4`).** The same room on Easy exits 12-48 px lower than on Normal (stair +40 x3 then -120: Normal 600, Easy 648). `easyNode` cuts rises but not drops (BT:664-668). So a room's door band depends on the setting, and the Easy deck filter and seams differ from Normal's.
- **Code.** WR shares an apron only when `dir === 1` and the y is exactly equal (WR:303). So a mirrored or left-running room never shares one, and WR's own comment says two aprons read as 2.8 s of walking, over DEAD_WALK 2.5 (BT:170).
- **Mechanism.** A's "joins cannot fail" is true for safety: it is flat ground. It is false for the beat and for Easy. The cheap fix is in §5, alternative 4.
- **Falsifier.** At every W2 BPM, every joined room's first take-off lands within one 30 fps frame of the grid, and Easy and Normal exit at the same band.
- **Status: CONFIRMED by the run.**

### #6. The pool runs dry inside the first pass of a world, and the art money cannot dress it (A). COST and PLAYER, with arithmetic.
- **Where.** D §2.6 and §5.1 step 3 (50-70 rooms a world); D §5.1.6 "save-wide: no room the player has seen in this save is drawn again until the world's pool is spent"; CLAUDE.md HF line ($72 total, about $15 reserve).
- **Arithmetic (estimate).** The 2-4 sample (D §5.2) has 9 non-hero draws a stage (8 nodes plus the second road of the split), so 81 draws a world on a first pass. A pool of 50, 60 or 70 runs dry after 5.6, 6.7 or 7.8 stages, with 31, 21 or 11 repeats before the world ends, all in its climax stages. Every replay after a clear re-rolls and repeats. SMBF's 10:1 would be about 810 rooms a world. HF money: $57 usable over 9 worlds is $6.33 a world, about $0.11 a room at 60 rooms. One small World 8 picture list cost $2.32 (STATUS.md:848).
- **Mechanism.** The save-wide rule and the pool size disagree by D's own numbers. And rooms can only share one art kit per world, which SR:381-382 already says leaves stages that "look alike". R3 W11 puts the felt sameness in tempo and look, not in move order.
- **Falsifier.** World 2 ships with at least 81 rooms, or with fewer and no repeat on a first pass; and with 3 or more distinct surface and dressing families for $7 or less.
- **Status: CONFIRMED as arithmetic on the spec's numbers.**

### #7. Room-alone proofs do not hold for lianas (A), and a liana is World 2's first new move. ENGINE.
- **Code.** `swingSetup` gives each vine its phase from the vine before it in stage order. A chain link takes `chainPhase`, and anything else takes `(base + 0.618034) % 1` (PH:537-541). The period is one global value, 2.85 s Normal or 3.3 s Easy (PH: `TIMED.period = easy ? 3.3 : 2.85`).
- **Mechanism.** A liana's release windows depend on every room laid before it, so the proof of a room alone does not survive the roll. Locking the period to the beat (D §2.3) means changing a global engine clock per stage. 2.85 s is 6.08 beats at 128 BPM and 4.65 at 98 (estimate), so the swing is not on the beat either.
- **Falsifier.** On 16 rolls with different rooms before it, a liana room's `pressWindow`s match its proof within one frame.
- **Status: CONFIRMED by the code. Not run end to end.**

### #8. SKETCH: shared formulas check themselves, and its named templates are not tracer moves. All three personas.
- **Where.** SK 1 ("Builder and checker both read it"); SK 4-5 (vine chain, split road, "climb with waits" placed by beatTrace).
- **Code.** Not one of the named templates is a tracer move. There is no vine, climb or wait mark, and `gridHits` throws on any other mark (BT:217). So they get placed by pixel rules, as gen2 does.
- **Run (`critic-exp4`, gen2's shipped seeds).** Every roll of 6-2, 8-6 and 8-9 uses one section 3 or more times, and 15 of 16 rolls of 7-3 do. The worst are 14x (8-9, `w8-guard-night`), 9x (8-6) and 5x (6-2, 7-3), against SR §0c.2's "no more than twice". This confirms R1 Run C on the base the sketch would reuse.
- **Mechanism.** A wrong number in the shared formula file (the density band contradicts its own rest pad, R3 F13; "gap share as difficulty" was overturned, R4 §5.4) is built to and then passed by the same file, so CI stays green on easy stages. Parameterized templates vary numbers, not kinds (R2 §3.9, Dahlskog).
- **Falsifier.** A known-bad number injected into the formula file is caught by an independent gate in CI; and World 2 from the sketch passes "no template more than twice" on 16/16 rolls.
- **Status: CONFIRMED (code and gen2 run). The injection test was not run.**

### Lower-ranked causes, per spec (kept, each with its falsifier in personas.md)
- **A-9, at-load roll on the phone (D §5.1 "in milliseconds").** A full `generateStage` takes 327-389 ms median and 942 ms max on a desktop container (R4 §5.2). The phone is untested. Falsifier: Pixel, 16 seeds, under 1 s load, no frame over 120 ms (PERF §1). Status: not run (needs the device).
- **A-10, kind gate thresholds.** "No two kinds over 50%" passes 1-2 (48%) and 1-5 (39%), the stages Matt calls samey (R2 exp. 2). The zigzag cap (45%) does catch 1-2 (66%) but passes 1-5 (39%). Status: confirmed by arithmetic on R2's measured numbers. The gate is half-tuned.
- **A-11, limited agent "or pay a set cost".** A no-hide bot finishes 9 of 9 layouts, faster on 7 (R2 exp. 4), and `noHide` is the bot's only move switch. Status: confirmed in R2. A's clause lets an optional lesson pass.
- **B.** The hard no-3-move-repeat rule forbids the "same thing, now harder" teaching repeat (D §3 BIT.TRIP row; SR §0b.2 Part 2). 1-2 bar motifs (2.4-2.6 s at W2) are smaller than a 5-20 s rhythm group, so nothing authored can carry a problem and its solution. A solver with quotas drifts to the simplest answer (R2 §3.13), and UNSAT debugging is opaque (R4 §2.2). Judgment and solver logs; not run.
- **C.** The fitness is all floors (input window at least 167 ms, completion), and tracer-built candidates max it out (Wmin at least 400 ms on 7 of 9 World 1 stages, R3 §4.1). So "best of cell" is picked by bot noise and the archive fills with the easiest candidates. Already demoted by D itself (§7, §10.0).
- **D.** The pacer gives the answer away two beats early (a Dot-style spoiler, SR §1). Two beats at 68 BPM is about 503 px of run against a 400 px upright view (BT:185) (arithmetic). A deed changes the ground over time, which the static tracer cannot prove. Each deed adds a round trip to Matt and HF art on top of A's or B's cost.
- **SKETCH.** "Pace per curve part" in one formula gives every stage the same sawtooth at the same shares; D §10.3 rejects this itself (LEG:442-444). Its art and pickups run as passes after geometry, which is the root of failures 1-2 in D §1.

---

## 2. Causes the runs refuted (dropped)
- **"Two dense rooms on a shared apron merge into a phrase over 20 s" (my own hypothesis).** `critic-exp1c` chained 4 rooms at 128.2 and 98 BPM, Normal and Easy. The seams are 1.64-3.15 s and register as rests on Normal. The longest phrase is 7.0-13.6 s, under 20. Refuted on these pieces, so dropped.
- **"Easy changes the kinds a room speaks, so Easy proofs are separate content."** Easy flattens some rises to F (`exp1a`, "kinds≠"), but the beats are identical and the density is the same (1.07 = 1.07). The real Easy cause is density, which is D's own diagnosis (V4 below), not kinds.

## 3. Pair checks (two pieces fine alone, bad side by side)
| Pair | Where | Run / check | Result |
|---|---|---|---|
| Room k's last take-off, then room k+1's first take-off, across a shared apron | D §5.7 | `critic-exp2` | **Bad at every non-World-1 tempo**: 41-153 ms off the grid (#5) |
| A right-running room, then a mirrored room | D §2.6 "half mirrored" + WR:303 | code | **Bad**: no shared apron, 400 px of plain run, about 2.8 s, over DEAD_WALK (#5) |
| A liana-chain ending, then a liana-chain start | PH:537-541 | code | **Bad**: room k+1's first vine becomes room k's next chain link and its phase moves (#7) |
| Easy room exiting low, then a room whose door is that band on Normal | BT:664-668 | `critic-exp4` | **Bad**: 12-48 px drift a room, so the bands differ by setting (#5) |
| A drift hazard block pushing the landing long, then a patrol slot near that landing | D §5.1 steps 2 and 5 | not run (no drift block exists) | Plausible. The 150 px enemy rule is measured at the planned landing (mechanics.ts:247). Falsifier: proving every slot *combination* fails no pair whose single blocks pass |
| Two heavy-art hazard blocks in neighbouring rooms, rolled at load | PERF §8; drawcheck runs one roll a world | not run | Plausible. Falsifier: drawcheck over the worst-case adjacency passes |
| Easy soft hall under a tile run, plus the tile-run teach | D §6.2 (B) | not run | Plausible: the kid walks the hall and Easy loses the move (SR §1b). Falsifier: a never-step-on-tile bot fails 7-6 Easy |

## 4. VERIFICATION_PASSED (parts I tried to break and could not)
- **V1. D §2.4, a piece written as beat data stays traceable over a tempo range.** In `exp1a`, 5 of 6 pieces trace and check clean at 128.2, 94, 98, 102 and 68 BPM on both settings. "Half notes" throws only at 128.2 Normal, exactly as D reports. **VERIFICATION_PASSED** for static surfaces. #1 and #3 are about what the proof can express and what a player feels, not about whether it holds.
- **V2. D §5.7, seams are physically safe.** A join is flat apron and cannot be missed. Nothing in the runs contradicts it, and Barrett's page supports it ("the filling algorithm is trivial"). **VERIFICATION_PASSED** for safety. The same page warns that an edge contract alone gives output "too homogenously connected to be interesting" (`critic-sources/barrett-herringbone.md`).
- **V3. D §1 / §0 #1, gen2 breaks its own repeat cap.** Re-run on the shipped seeds (#8): **VERIFICATION_PASSED**.
- **V4. D §2.5 finding 1, Easy keeps Normal's beats.** `exp1a` gives the same density Normal and Easy at every tempo, and `easyNode` keeps "the same beats and moves" (BT:661-668). **VERIFICATION_PASSED**.
- **V5. D §6.6 / §10.0, B buys no speed until constraints are tight; C's judge is not ready.** I found nothing against either. **VERIFICATION_PASSED**.
- **V6. D §10.3 "the music's score as the layout" stays rejected.** D left this open: "Whether a stage's theme is fixed needs a check". Checked: on a beat stage "the session's salt still picks the piece, so the music changes between sessions" and only the BPM is held (`src/audio/scenes.ts:179-197`). So take-offs on one theme's onsets would not match the piece that plays. **The rejection stands (VERIFICATION_PASSED for D's original rejection)**, unless Matt agrees to pin one piece per stage, which costs music variety.

---

## 5. Better, faster or cheaper routes (with evidence)

1. **Fix the proof before writing rooms ("A, reordered"): grow the tracer's alphabet to World 2's mechanics and give it a risk dial first.**
   - The alphabet: time-indexed surfaces (moving logs, rafts, sinking lilies) and water as the avoided line. The tracer already carries `t` on every landing (BT:88-107), so a surface's position at landing time is a natural extension.
   - The risk dial: a per-tension `TRIES` set, so a Normal spike is proven only against the on-time and short-flick tries, and `hazardSpots` may sit on the 100 ms-late path. Score it with R4's survival model (Isaksen σ 36-61 ms).
   - Evidence: #1 and #2 (BT:48, 50, 330-343, 566-590); R4 §5.4 shows the late thumb is the only risk the model finds.
   - Cost: unmeasured. It replaces D §11.3 step 5's list, which leaves out World 2's mechanics. Without it, every option ships World 1's alphabet.
2. **Prove three World 2 rooms end to end and time it, before committing to 50-70.** D §11.5 measures 1-2's rooms, not World 2's. The drop rule in D §10.2 (30 min a room) can only fire on a world whose mechanics the tracer cannot prove yet. Evidence: #4's arithmetic, which puts A at 3.1-5.1 h a stage on its own estimates.
3. **Cut the judging, not the generation.** Approve layouts in grey from a text catalog diff (Brogue CE, R4 §4 and idea 11) plus a strip image of where the bots end (R4 idea 6). Then judge art once per world kit (Ori's "design approved", Hollow Knight's grey tiles, R1 L7).
   - Evidence: 55% of the rebuild night's commits were review-only, and all 4 of 1-1's send-backs were look or petals (#4).
   - Leap Day's own words: the cost of a chunk pool was "every member of the team... building level chunks and play testing... much more time than we budgeted" (`critic-sources/leapday-pocketgamerbiz.md`).
   - This is the only lever on the measured slow part.
4. **Tempo-correct aprons: a one-line fix to A's seams.** Set the apron length to a whole number of eighths at the stage's BPM (k x 30/BPM x 285 px, with k chosen near 0.7 s), not a fixed 200 px. Share aprons in both directions, and seam on the Easy exit when Easy is played. Evidence: `exp2` (0.702 s is exactly 3 eighths only at about 128 BPM).
5. **Variety per dollar: themed pools and decoration over shared rooms, not art per room.**
   - Leap Day: 700-800 chunks, each able to "decorate to any one of 10 themes", with enemy slots refilled daily.
   - D §2.6: 8 hazard blocks cut alike neighbours from 22% to 9%.
   - Add R4's "same ground, second goal" replay. With $57 of HF left, look variety has to be decoration families per world, not rooms.
   - Evidence: #6; `critic-sources/leapday-pocketgamerbiz.md`.
6. **Hours, not days, on what already exists** (the cost persona's alternative 1):
   - D's step 0: one reach predicate, the rejection and coverage report, a cap-of-2 refusal that prints the missing pieces.
   - Shipping the 28 World 8 and 7 World 6 sections that no curated roll uses (R4 §5.6).
   - This is cheap, and every option needs it anyway.
7. **Steal from D without D:** "skill carried by level objects" (Super Mario Run's special blocks, R1 idea 8; R4 lesson 5). A World 2 log that launches is a new verb the static tracer can model as a fixed impulse at a mark. It is cheaper than a second simulated body, and it gives the alphabet a new kind that #1 needs.

**Does the designer's pick survive?** Partly. A's shape survives: big authored units, a small dumb roll, proof before use, gen2's assembly. V1-V3 hold. **As specced for World 2 it does not.** Its proof cannot express World 2 (#1), cannot carry risk (#2), its "variety by tempo" is longer walks (#3), its seams are on the beat only at World 1's tempo (#5), its pool runs dry inside a world (#6), and its cost leaves out the judging (#4). Survival needs alternatives 1, 2 and 4 *before* the room library, and alternative 3 alongside it.

**Best alternative:** "A, reordered". Grow the tracer to World 2's moving and water surfaces with a per-tension risk dial. Fix aprons to the beat grid. Prove and time 3 World 2 rooms. Only then size the library, judged in grey from a catalog diff.

---

## 6. Method used / Lessons applied / Method update

**Method used.** Read every spec and evidence line first. Three blind personas as parallel subagents (PLAYER, ENGINE, COST), each given only the specs, the evidence, the rules and the premise, in a fixed pipe format with a falsifier on every line. Merge without rebuttal, cluster, rank. Run every tool-checkable cause against 46f2d990: the tracer (4 scripts), the fun gate, the first-timer bot, gen2's shipped seeds, and git. Pair checks, then VERIFICATION_PASSED, then alternatives.

**Lessons applied.** LEAD-PLAYBOOK §8k: planned vs actual time first; every number marked; key idea run on real stages. research-ledger.md step 4: every claim about our game checked in code, including the personas' claims (I re-counted COST's git figure: 169/308 reference-only, against its 177/324, which included merges) and the designer's own open question (V6). Sources fetched with TinyFish and saved with URL and date (`critic-sources/`).

**Method update (proposed edit to `reference/methods/research-ledger.md`, or a new `reference/methods/critic.md`):**
- *Worked better, with proof:* the most damaging cause (#3) came from my own script, not from the personas' reading. A persona *named* it, and only a run showed that the gaps were identical to the pixel while the ledges doubled. Add a step: "for each spec claim of the form 'X gives variety/difficulty for free', trace one piece both ways and diff the geometry pixel by pixel".
- *Worked better:* checking each claim about a constant against more than one parameter value. The apron's 0.702 s being exactly 3 eighths at 128 BPM looked like a design until it was run at 98 BPM. Add: "a magic number that works on the one stage it was tuned on is a hypothesis until it is run at the other worlds' values".
- *Failed, and why:* the brief's 90 minutes assumed serial reading. Parallel personas and fast runs finished in about 22 minutes of wall time with no step skipped. Proposed edit to LEAD-PLAYBOOK §8k: "for a parallel-subagent job, plan in tokens and steps as well as minutes; judge a short wall time by its step list, not the clock". This report lists every step it did and every one it cut (§0).
- *Failed:* the personas cited `tools/validate/play.ts:303`, `mechanics.ts:247` and STATUS.md lines from the evidence without opening them all. I re-checked the ones I ranked (BT, WR, PH, scenes.ts, the seeds, git) but not every line in personas.md. A critic brief should say "personas must open every file:line they cite".
