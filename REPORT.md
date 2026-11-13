# ENGINE-STUDY-678 REPORT (R-165.205). Architect, Opus 5.5 xhigh. t-engine-678 from t-int-3@31b8a742. Plan only; stamped 5:02 PM ET.
**Deliverable:** reference/plans/ENGINE-678.md (79 lines). Nothing under src/ changed.
## Done-items (packet 1-7)
1. Verified: 28 rows -> 24 (creaky limb EXISTS gen2/creak.ts:1-7; two camera rows merged, MEASURE first; four art rows -> one batch); 3 ADDED: piece
   hooks (engine.ts hand-wires each runtime, :637/:646/:657/:4530), one letter grammar (code s=liana vs key r), t-pieces + t-nodes NOT in t-int-3 (D48).
2. Grammar: `m` cover NEW; `s` dials grip/phase/moss; `h` roll/bounce/teach:nudge; `&` post/free1/cool/perch; K leaves LATER in B5; W-in-K = still fork.
3. Waves W0 (INT-5, BUILDTIME R-165.207, RULER, HOOKS) -> W1 -> W2 -> W3; replaces buildLongBranch, old 1-7 zones, the crouch hide (HIDE-ONE, deferred).
4. 16 packets, each 90 min or less a box, lanes A/B with disjoint WRITE lists; shared files by token in a fixed order; engine.ts held once (HOOKS).
5. ~32 h member time, ~$275 ($230-340) + integrations $40-70; ~16 h wall clock on two lanes (LEVEL-LOG median box $11.78; git hours).
6. Art: 4 sheets (vine snake, moss cover, perched harpy, branch hazards), sized to 89.1 px; ~$4 HF + ~$9 member. Reuse first: harpy-atlas crouch, w1NutPod.
7. Risks first-step: FAR swing camera (740 vs 425 px), fruit clearance over the drawn head, chase liana phase vs 655 px; RULER and R-165.207 in W0.
## Polish check
Docs only: no screen changed, no stills apply.
## Gates (docs branch, LAWS 5)
tsc PASS, roadmapcheck PASS (after `git fetch --unshallow` + full fetch: shallow clone FAILs it), knowncheck PASS, generality PASS.
## Pushback
- Defer HIDE-ONE: 1-7 is kit-only (1-7.md:6); but t-pieces' stillLay generalises the crouch hide it replaces: no NEW stage lays those hides till it lands.
- HOOKS before any runtime piece, or A2/B1/B2/B3/B6 queue on engine.ts. - NODE-KEY.html (t-nodes) lacks s v p t x; NODES.md:276 K row still says 1-5.
## Unresolved
The lead decides: HIDE-ONE deferral, HOOKS as a W0 packet, and the art list (approve before the sandbox). The levels' build cost is not in the total.
## Method used / Lessons applied / Method update
New method reference/methods/engine-study.md (none existed, LAWS 4), indexed in reference/methods/README.md:64 (roadmapcheck requires it).
Lessons: D7, D25, D34, D40, D41, D43, D48, D52 (cites re-grepped after the last edits), D53, D55, D57 (queue read at push), D59 (nothing left running).
**Learned:** count which packets need the same shared file before ordering waves: the bottleneck file decides the first packet, not the blocks.
## Turnover note: reference/handoffs/architect.md rewritten in this commit.
