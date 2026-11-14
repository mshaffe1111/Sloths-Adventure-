# A1 SWING-W1 REPORT (ENG-A1; t-a1-swing from origin/t-hooks@994ea4e7; head and gate results below)
**Done (evidence in this folder):** 1. FAR camera MEASURED (farcam.out.txt, the engine's landingAhead+showBoth aim): sideways 1168 wide, SHORT/LONG/FAR all in view, every
grip and point of the swing; upright 440, FAR never in view, LONG/SHORT only at the very front from the foot. Lead (11:24 PM): fix is its own packet after Matt sees
the MOCK (mock/upright-pair.png, sideways-pair.png: real game, 1-8's liana, FAR perch 540 px, same frame, setting printed). 2. GRIP DIAL by data: LianaSwing.grip +
swing rule `grip` (gen2/types.ts), the lay carries it (pipeline swing branch), lianaRelease flies levelCheck gripsOf ('low' = foot, 'high' = SWING.minLen), lianaBand's
cache key + stand-in vine + `dbl`, the built Vine carries it. 3. LEVEL CHECK (lead ruling 11:28 PM, opt-in): Vine.grip (src/game/types.ts) routes flightLandings to
gripLandings = physics pressWindow (the engine's press: sweet/early/late, LETGO_FLIGHTS) at the dial's hold, the double only where the stage allows; no dial = the old
flight, untouched (sl.out.txt: no dial caps at 380 px; low+double links to 580, 0 at 600). 4. W1 rows: gen2/worlds/w1Swing.ts withSwing(kit) (1-4's per-kit move add;
w1.ts keeps ['double']), W1_LIANA_GAP short/long/far, w1Liana/w1Perch, 3 sections; laid on W1 (1-6) + W6 (6-3) kits both settings (lay.out.txt): SHORT 216-341, LONG
340-368, FAR 471-528 px. 5. Planted (w1Swing.test.ts, 6 tests): each of 6 pieces removed goes red (window grips, lay carry, cache key, band vine, level check, built Vine).
6. lockall 102/102 unchanged vs f9671e3b (16 layouts x both settings). generalitycheck 27/27 known (no new literal).
**Gates on the head:** see GATES below (pasted from the run's SUMMARY; anything not listed there is UNRUN).
**Polish check:** mock/upright-pair.png: (a) no landing in view (the problem); (b) 1.5x: only the perch's first ~40 px at the right edge, Pokey ~2/3 size. Rough: the
lives pill reads x9 in (a), x3 in (b) (the mock set lives for (a) only); 1-8's dark level-bottom band shows in both (pre-existing). sideways-pair: FAR perch in view today.
**Camera packet numbers (for the lead):** width to hold him (foot, 400 px) + the landing box, upright: at the swing's bottom SHORT 430 -> 529 px (1.20x), LONG 500 ->
602 (1.37x), FAR 560 -> 665 (1.51x); from the back of the swing (where he decides) FAR 846 (1.92x). Propose: ease out from the catch at LAND_EASE.rate 4.5/s (95% in
~0.67 s, before the first forward sweet spot), back in over ~1.0 s after landing, cap 1.5x, upright only. Lift the level-height cap (engine.ts:1247 roomUsual: 1-8 is
416 px today). Perf: 1.5x both ways = 2.25x the world drawn upright: drawcheck must measure it (PERFORMANCE-RULES §1).
**Pushback:** (a) ENGINE-678 missed that today's level check (swingLandings) capped every liana perch at ~380 px whatever the grip: 1-6's LONG/FAR could never lay.
Fixed here, opt-in. (b) FAR lays to 528, not 1-6.md's 530-560: LIANA.len is 410 (1-6.md's liana is 420) and no row sets a length; the 1-6 builder needs a `len` on
the swing rule (types + 1 pipeline line) or accepts 471-528. (c) LONG (no dial) is still capped at ~370 by the plain check: a LONG row should carry a dial too
(grip 'low' with share 0.5-0.7) once the lead agrees; I left it dial-free so it means "every liana before the dial". (d) gen2 lays a perch between every two lianas
(levelCheck ledge->liana->ledge): 1-6 beat 4's liana-to-liana chain is not layable yet.
**Unresolved:** the camera fix (separate packet); turnover note engine-core.md not rewritten (outside my WRITE: the 4 lines are in "Learned"). Out-of-WRITE files
touched, each by the lead's token: gen2/types.ts, src/game/types.ts, levelCheck.ts, pipeline.ts (lianaRelease, swing lay, lianaBand, band call, Vine build).
**Method used:** stage-piece.md (data first, planted test first, 2+ worlds, lock). Lessons applied: D19 (the check calls the engine's own pressWindow), D7/D24 (every
number measured, scripts in this folder), D36 (gates and lock in their own worktrees), D43 (no stage literal), D46 (no dead-zone landing: the plain flight untouched),
D57 (queue read at every push). **Method update:** stage-piece.md step 6: "never edit src while a dev-server still is being shot: vite reloads mid-shot" (it cost a reshoot).
**Learned:** 1) A reach dial must reach EVERY judge of reach: the window (lianaRelease) and the link (levelCheck) disagreed by 200 px and the plan named only one.
2) Give a check the engine's own function, not a twin (pressWindow), and opt it in by data so locks stay byte-identical. 3) Upright framing is capped by the level's
height before any lead or widen applies. 4) Measure the camera with the pure aim first (seconds), then one real still to prove it.
**EXACT NEXT STEP:** 1. Lead: show Matt mock/upright-pair.png; on his word, the camera packet (numbers above). 2. Lead rules (b)/(c): `len` on the swing rule, LONG
rows with a dial. 3. 1-6 builder: kit = withSwing(w1World()) + its sections from W1_SWING_SECTIONS / w1Liana / w1Perch; read this REPORT's pushback first.
