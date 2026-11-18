# DESIGN-24-25 REPORT (Designer, t-design-24; started 10:20 AM ET 11-18, packet reference/packets/2026-11-18/DESIGN-24-25.md)
**EXACT NEXT STEP (lead):** rule on the four flight rulings below (Pushback 1-4), then write the engine packets NEW 1-2 for 2-4 (first) and 2-5 from the designs' "Engine" paragraphs.

## Done-items (packet) and evidence
1. **reference/design/2-4.md and 2-5.md, built-ready**: one idea; tributes (loved, taught, ours, not copied; quotes as the pitches cite them); beats table (s, bits, there, does, feels);
   every first appearance taught with Dot 800 px+ before (asks for the story keeper, no lines); Normal + Easy targets PASTED (DIFFICULTY.md:61-63 on main: 13.5 / <= 8.1; 16.0 / <= 9.6).
2. **Node strings pass checkCode** (`npx tsx reference/specs/sims/nodes2425.ts`, out/nodes2425.txt): 2-4 `A Ts1<:#soft Pg1< Ps1>:#soft Xw1> R Pf1< Ws1>:#water R Pb1^< Cw1>:#water R Ss1< E`,
   2-5 `A Tp1<:#soft Pg1&<:&turtle*1z Pp1> Xw1&>:&turtle R Pr1< Wp1>:#water R Pg1&>:&turtle*3 Cw1&>:#water:&turtle*2 R Sw1< E`: 14 tokens each, no errors. Both pitch sketches FAILED it.
3. **Every number flown on the real engine** (origin/main 6e7b85f8, realPlay.ts at 30 fps): swingLog.ts (NEW: 2-4's let-go onto moving logs by row x grip x held/flick, both clocks' phases,
   and the catch from a log), snapClock.ts (NEW: 2-5's clock against the real tap hop through InputEngine, in-step rows, waves both ways, Easy x1.5). Outputs: reference/specs/sims/out/
   swingLog-{normal,easy}-all.txt, snapClock-{normal,easy}.txt. Relative imports (D83). Each design's flight table names its rows.
4. **Engine list exactly as the picks** (2 NEW each: name, file, size, the planted toy that proves it); **the hand build each replaces** (w2Stages.ts '2-4' :34/:496, '2-5' :35/:42-43/:1085)
   **and the tests that pin it** (w2Stages.test.ts, vineSnake.test.ts, stageBackdrops.test.ts; snapperCount.test.ts); **art** (2-5's snap stone: a 4-frame Hugging Face brief matched to
   dress#w2RiverStone / w2#boulder at 80 px); **flags by the live rule** (pipeline.ts:1748 ROLLED_FLAGS pasted).
5. **Gates:** sims tsc on main's tree: 0 errors (temp tsconfig extending the project's, lib ES2023 for findLast in nodeCode.ts; project tsc on main 0 errors). knowncheck: FAIL on this branch
   (2 entries this lead branch's old tree carries vs main: generality.known.json, ciTests.known.json; my diff touches neither), PASS in the main worktree with my files added.
   roadmapcheck: FAIL "shallow clone, proofs cannot be checked" (exit 2); an unshallow fetch is running; its result is in the message to the lead.

## Polish check
Docs only, no stills. Read both designs through against the flights' output files line by line: fixed a typed time (D30: header said 10:57 written at 10:38), an upright-view claim
(3 stones are ~400 px; upright shows ~270 px ahead), a dangling "high stone" (the stomp's bounce is unflown, so beat 4 lost it).

## Pushback (flight rulings for the lead)
1. **2-4: the picks' teach rule (log pass time >= swing period) is not what lands him.** Every W2 row lands 72-93% of let-go moments, 100% of swings hold a window, pass 1.4-5.0 s alike.
   The knob is the GAP between logs (gap 200: 51%, wait 1.2 s; gap 280: 41%, 2.7 s). "Shorter faster logs past the teach" became wider gaps. Fix the ruler, not the data.
2. **2-5: in-step rows hold 3 stones at most** (5 in step: 18-32% safe, under 0.6 s at count 0.6); **the wave runs ahead of him only** (back at him: 0-38%); **Easy's wave is 3 stones**
   (a stretched 5-wave reads 14% / 0.63 s on Easy vs Normal's 33% / 1.00 s, against rule 4).
3. **The real tap hop is 0.43 s, 106-119 px, 62 px up** (InputEngine's 80 ms hold). 2-2.md and rideLay.ts:260 carry 0.30 s / 83 px from hopAir.ts's FakeInput one-frame press (designer.md's
   own trap). 2-2's pads likely still hold (1.0 s > 0.43 s air), but the cited number is wrong: Suggestion 2.
4. **The picks' "trap/kick ending"**: the design needs no `trap` (A's log trap is not in the picks; TURTLE's kick -> chasedOff is wired). B's stomp-bounce to a high stone is UNFLOWN: out of beat 4.
5. **Doc branches carry a pre-0.9.9 src** (no riverLay.ts, w2.ts): a designer must fly on a main worktree (+3 min install, 2.5 GB); and the doc branch fails knowncheck by inheritance.

## Suggestions (outside my walls; ready packets)
1. ENGINE 2-4 (xhigh): designs/2-4.md "Engine" NEW 1-2 verbatim; done = toys RED with the skill/logs removed, a liana-over-river row on stageTable (rule 23), drop-share check from swingLog.ts.
2. DESIGNER (high, 20 min): fly hopAir.ts through InputEngine (snapClock.ts's hop()); correct 2-2.md and rideLay.ts:260's comment (an Engine one-line packet) and re-check 2-2's pad gaps.
3. ENGINE 2-5 NEW 2 packet adds: fly the turtle's stomp bounce height before any stone is laid above a snapper.

## Unresolved
The stomp bounce (unflown); bits per beat are estimates from the flown windows (the meter reads the built stage); the ride-the-wave bot leaves the bank at any moment (no bank wait),
so its 76% is a share of bank-leaves, not of skill; quotes not re-opened (taken from the pitches' cited pages); roadmapcheck pending the unshallow.

## Method used / Lessons applied / Method update
Used: methods/level.md rules 1-9, 21-24; DESIGNER.md. Lessons: D30/D42 (times from `date`; one typed time caught and fixed), D15 (tested the sims first: two sim bugs found, a per-swing
reset and inverted wave labels, before any number was written), D34 (cites read on main), D49 (flags by the live rule), D58, D41, D83, D53, D36, D59 (no job left running), D64.
**Method update (level.md rule 24, proposed):** "Fly with the game's InputEngine (its minimum hold), never a FakeInput one-frame press; fly every row on BOTH settings and compare beat for beat
(Easy's stretch can make a wave harder); put the node string through checkCode in the design (nodes2425.ts pattern)."
**Learned:** a let-go's landing spread makes log length nearly irrelevant: measure the landing share over both clocks' phases, never one log. Turnover note: reference/handoffs/designer.md
rewritten (§0 Now, traps), in this branch's commit.
