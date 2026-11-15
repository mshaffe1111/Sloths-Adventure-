# VARIETY-2 REPORT (R-165.197/.198/.200). Engine, Opus 5.5 max. t-nodes. 2:47 - 4:22 PM ET, 11-13. Code head 6d7819de.
**EXACT NEXT STEP** (World 1 mix on 6d7819de: clean 1/60, unchanged; the kills are the painter's ruler and the pool, not the asks)
1. **READY PACKET, the per-gap ruler (the lead's rulings 3:21 + 3:27 PM; one whole job, Opus max, t-nodes):** findW1Pits (w1Pits.ts
   findOpenPits) judges each gap by its OWN two lips, never the stage's widest bank top G (w1Pits.ts:146-149): ground, the floor
   window (SOFT_BELOW..FALL_BELOW) and SOFT_FLOOR read from the gap's lips; stricter and consistent, never looser (LAWS 22). Planted
   first: ruler/perGapGround.repro.ts becomes the test in src/game/ (RED.txt: the log chain's fall 37548..38002 vanishes when ground is
   laid 5,000 px away). Settle with the lead: is a 24 px log ground only on earth; is a hole between two banks judged at any width
   (today 24-1600 px, w1Pits.ts:164)? Then (a) a scan, old ruler (git show d8d6a97) vs new, 102 stages x 16 layouts, every changed
   fall/water/drop; (b) sideways stills of each changed gap, before/after, in ruler/; (c) seedlist 1-1 --check PASS, lockall vs d8d6a97
   with any moved stage named and re-judged; (d) mixlist.ts again (floor.unmarked 36 today) and the full Checks.
2. **Pool short (item 2, left by the lead's ruling), its two causes:** the deal gives a test node bounce that W1's two bounce tests
   cannot lay (string 8 seed 9: every reroll `pool short at slot 9`); late climb sections leave the corridor out the TOP (twists
   -365..-585, signature -390..-607). Measure both with tools/repairs.ts over the 60 strings first.
3. **'_' in World 1 (21 named misses):** no flow, combine, twist or signature section of W1 falls: content (B15) if Matt wants them.
   Unchanged: find '+' (Content), s v p t x, beat, points (B14/B15), toy kit sections.
## Done
0. **Full Checks on 4b9a6419:** tsc, artcheck, knowncheck, generality, roadmapcheck (re-run on the full clone) PASS; suite 3,197 pass,
   0 fail, 2 todo; build + chunkcheck, tool tests, seedlist 1-1 (257, 0 refused), tierBots, kbdcheck, clipcheck, drawcheck PASS;
   buildcheck FAIL beside the other run's 3 shards (Normal p95 172 ms): its 1-1 build code is 6d7819de's, which passes alone 3/3 (Gates).
3. **6d7819de, item 3 (accepted):** askRefusal (pipeline.ts): a '_' asked of the node V19 makes climb (mustRise, after a late descent
   on an up stage) throws at graph time by V19's name. Planted gen2/askRefusal.test.ts: red before (pipeline.ts stashed: 1/2 fail),
   green after; a '_' V19 does not bind is never refused. A pool-based refusal was built and REMOVED: 12 of its 35 refusals were asks the
   lay kept (net fall from joins: string 59's combine). Shipped graphs ask nothing.
4. **nodeMix:** W1 clean 1/60 (string 32), legs fixture 3/60 (24 V-rule refusals, 36 built), unchanged (no mix string asks a
   descent). mixlist.ts: fair (every ask W1's kit lays) 8, fair clean 1; VARIETY's "12 fair" had no written rule.
5. **Lock + seed list on 6d7819de:** lockall --layouts 16 vs main d8d6a97: 102/102 stages unchanged; seedlist 1-1 PASS (257, 0 refused).
## Gates on 6d7819de
tsc, artcheck, knowncheck, generality, roadmapcheck PASS; suite 3,201: 3,199 pass, 0 fail, 2 todo (+2 = askRefusal.test); build
(BASE_PATH) + chunkcheck, tool tests, seedlist 1-1, tierBots, kbdcheck, clipcheck, drawcheck PASS. **buildcheck:** in sequence FAIL
(Normal p95 169 ms > 150, load 1.85 just after the shards); alone x3, interleaved with main (the lead's 4:15 PM ask), 4:21 PM:
branch 136 / 130 / 125 ms PASS 3/3; main d8d6a97 121 / 151 FAIL / 121. Not a t-nodes slowdown (p50 61-71 vs 63-69): the gate's p95
(2nd-slowest of 30 builds) sits at its budget on this container, main included. Suggestion (Critic's tools/perf): more builds per run.
## Polish check
Nothing drawn changed: the refusal fires only on designed graphs that ask; no shipped stage asks. No stills apply.
## Method, lessons, Learned
ENGINE.md day one (main's lock first, planted failure first), level.md 12, gates.md. Lessons: D15 ("fair" re-measured), D19, D40, D52
(cites re-grepped after the planner edit moved them), D53, D55, D57. Method update: measure a new refusal against the old lay's named
misses before keeping it (mixlist.ts askMiss caught 12 false ones); time a timing gate alone on main beside the branch before calling it.
**Learned:** a kill that also hits the bare frame on other seeds belongs to the ruler or the kit, not the ask: count the bare frame's
own failures first. Refuse at graph time only what fails on every seed. Park a red case as a repro script, never a red test.
