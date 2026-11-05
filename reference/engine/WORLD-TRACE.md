# WORLD-TRACE: every engine-relevant research row the World 1 rulebook does not already cite, classified (designer helper, 11-05)

Matt, 11-05 4:04 PM: "hours and hours of research... nobody wants to use it." This trace shows where each research row went. It covers the 886 rows of `worldtrace/to_classify.tsv` (the engine critic's trace, CRITIC-TRACE.md on engine-critic-spec, minus the 30 rows WORLD-RULEBOOK.md §6 already cites and the 189 rows auto-tagged LATER WORLD by keyword), plus 6 rows moved in from `worldtrace/later.tsv` after a 20-row spot check. Checked by `node tools/engine/worldtrace-check.mjs`.

**Counts:** USED-VIA 365, LATER WORLD 52, NOT TAKEN 354, CONTRADICTED 48, ADOPT 73 (total 892).

**How to read it.** WR:n is a line of reference/engine/WORLD-RULEBOOK.md; ES Ln is reference/engine/ENGINE-SPEC.md (lines 1-2287 as at 3951b0f9). The rulebook adopts by reference the placement rules (ES 270-330), P-1..P-13 and S-1..S-9 (ES 690-731, 766-786, 833-839; the rest of the polish-pass section, ES 732-927, is 1-5 rulings and is NOT counted as adopted), the difficulty dial (ES 624-661), the pacing section (ES 1989-2018), the move ladder M1-M8 (ES 2032-2070), the water rules W1-W12 (ES 1885-1926) and LABELS.md. A row used by one of those, or covered by a §2/§4 rule, is USED-VIA; "partial" marks a row only partly covered. Evidence order for CONTRADICTED: Matt > measured > primary research > Gemini summary.

**Findings for the designer (beyond the ADOPT list):**
- WR:122 rule 10 ("No idea twice in a row") is unsourced and contradicts Smith 2009 §5 as accepted at ES L1883 (one exact repeat of a group before a rest is allowed). Primary research wins; rule 10 should allow that one repeat. Rows: L02:174, :205, :338, P2:176, :327, EG:301, :517, :589.
- The adopted dial's landing-width row (220 → 110 px, never under 90) disagrees with ES G L1844 (pads 3.5-7.0 body widths, Normal's 110 px end withdrawn), which the rulebook does not adopt. One of them must be struck.
- The 39 G rows (ES 1822-1874) are not adopted by the rulebook, yet several bind W1 stages: the four-draw lockout (L1839), the petal goal (L1848), the first-timer clock (L1852), the enemy runway and pair cap (L1842, L1855). They are in the ADOPT list below.

## The table

| Row | Class | Reason |
|---|---|---|
| LEDGER-2026-11-02-full.md:42 | USED-VIA | adopted move ladder M1-M8 (L2045) (row: A world's own mechanic returns in later worlds without re-teaching, as the twist for the new world's mechanic) |
| LEDGER-2026-11-02-full.md:72 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: no checker comparing part 3's rhythm with part 2's (row: The twist must break the rhythm just learned; the checker compares part 3 with part 2) |
| LEDGER-2026-11-02-full.md:93 | USED-VIA | WR:51 roll families (hop/jump families per roll) and WR:134 neighbour difference; no leap-vs-precision field (partial) (row: Same pieces feel new by feel alone: long momentum leaps versus small precise apex moves; neighbours alternate) |
| LEDGER-2026-11-02-full.md:100 | NOT TAKEN | ES L1796 leaves wait-and-go tempo beats to be defined or struck; thorn vines and enemy cycles are not in W1's kit (WR:25-29) (row: Two tempos inside one beat (sprint crumbling ledges, stop on a thorn vine); dual clocks (fast floors, slow enemy cycle)) |
| LEDGER-2026-11-02-full.md:109 | LATER WORLD | W2-W10: "different from the world before" compares a world with its predecessor; W1 is the baseline (whole-game fingerprint, ES G L1840) (row: Each world has a named hurry/patience tempo polarity, different from the world before) |
| LEDGER-2026-11-02-full.md:116 | LATER WORLD | W5 silk / later slow fields; LABELS has no W1 slow surface (WR:25-29) (row: Slow-downs come in two kinds (contact, volume); a slow field pushes the player up to a better high route) |
| LEDGER-2026-11-02-full.md:124 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (1-8's chase is a special stage kept as built, ES §B L1497) (row: Every world's X-8 has a moving pressure (chase, rising water, closing light, squall front)) |
| LEDGER-2026-11-02-full.md:136 | LATER WORLD | Acts II-III (W4-W10): outside forces and 3-4-way combinations (ES G L1829) (row: Each act has its own mechanical job: calibrate then flip speed; outside forces; three- and four-way combinations) |
| LEDGER-2026-11-02-full.md:151 | USED-VIA | WR:129-132 rule 12 places each find off the main line by its own rule; tier 3 at the top of the hardest group is already cited (§6, L02:439) (row: An optional hard branch in the twist with the big find at its top; three risk tiers of finds) |
| LEDGER-2026-11-02-full.md:174 | CONTRADICTED | WR:122 "No idea twice in a row" vs Smith 2009 §5, accepted at ES L1883 (critic deep pass #5): one exact repeat before a rest is allowed. Primary research outranks the rulebook's unsourced rule 10; rule 10 should allow one repeat in a practise (row: Allow one exact repeat in part 2 to build the feel; the third use must change) |
| LEDGER-2026-11-02-full.md:180 | NOT TAKEN | petals are placed on the route by the adopted placement rules (ES 270-330); pickup spacing as a tempo lever is not a W1 generator rule (row: Pickup spacing sets the tempo (closer carvings speed a chase); never counts as variety) |
| LEDGER-2026-11-02-full.md:202 | USED-VIA | WR:100 `finale` job: a dense 15-20 s at the exit (ES critic ruling 4 L1795) (row: Let the last group (and X-8's) run 15-20 s dense; 'never T-T' comes from other research) |
| LEDGER-2026-11-02-full.md:205 | CONTRADICTED | same as L02:174: WR:122 forbids an idea twice in a row; Smith §5 (ES L1883) allows one repeat; primary research wins (row: Part 2 may repeat a pattern once for muscle memory, then change) |
| LEDGER-2026-11-02-full.md:269 | USED-VIA | adopted pacing P1-P9 (L1998) (row: Fatigue: stages lack own identity, pacing flattened to even difficulty, same rhythm repeated without new context; more abilities is not the ) |
| LEDGER-2026-11-02-full.md:270 | USED-VIA | adopted move ladder M1-M8 (L2042) (row: Layering: combine known pieces into new challenges with no new rules) |
| LEDGER-2026-11-02-full.md:271 | NOT TAKEN | whole-game structure (ES L1458-1656), not a W1 stage rule; : the whole-game pairs table (ES G L1831); W1's pair is the brief's `pair` field (§6) (row: Four modifiers give 15 combinations; with run and jump, 15 pairs of six) |
| LEDGER-2026-11-02-full.md:272 | NOT TAKEN | whole-game structure (ES L1458-1656), not a W1 stage rule; : world fingerprint of pairs and camera directions (ES L1840); the brief carries `trend` and `pair` per stage (row: Each combination is multiplied by direction (across, up, down) and tempo) |
| LEDGER-2026-11-02-full.md:273 | LATER WORLD | W2-W10 modifiers (slow fields, thorns, squalls); W1's ladder has no patience version (WR:31) (row: Tempo inversion: every modifier has a hurry and a patience version, weighted equally) |
| LEDGER-2026-11-02-full.md:274 | USED-VIA | adopted pacing P1-P9 (L2003); partial: no silk-lingering beat (row: Hurry examples: breaking branches need buffered jumps; sticky silk punishes lingering) |
| LEDGER-2026-11-02-full.md:275 | LATER WORLD | W3 thorn vines, W10 squalls, glowworms; none in W1's kit (row: Patience examples: thorn vines strike when hurried; glowworms light when still; squalls make you stop and grip) |
| LEDGER-2026-11-02-full.md:276 | LATER WORLD | W2-W10 urgency/patience swing; whole-game (no W1 rule) (row: Worlds swing between urgency and patience, doubling the functional variety) |
| LEDGER-2026-11-02-full.md:282 | USED-VIA | WR:51 roll families vary per roll (ES L2113); no leap-vs-precision field (partial) (row: Same tiles feel distinct if one stage asks for momentum leaps and another for apex micro-positioning) |
| LEDGER-2026-11-02-full.md:286 | USED-VIA | adopted pacing P1-P9 (L2003) (row: Snap twig breaks in about 0.15 s: keep sprinting) |
| LEDGER-2026-11-02-full.md:287 | USED-VIA | adopted pacing P1-P9 (L2003); partial: no 0.60 s recover window (row: Creaking limb gives about 0.60 s to recover) |
| LEDGER-2026-11-02-full.md:288 | NOT TAKEN | art parked: counterweight/seesaw (ES L162, L204); not in W1's kit (WR:25-29) (row: Cantilever root tips on a pivot by where he stands, doesn't vanish) |
| LEDGER-2026-11-02-full.md:290 | LATER WORLD | W5 silk and later slow surfaces; no W1 slow surface (row: Two kinds of slow-down: contact (sticky only while on it) and volume (caps speed on entry)) |
| LEDGER-2026-11-02-full.md:297 | NOT TAKEN | catapult and sinking vines need new moves: new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); W1's vines are rope (1-3) and lianas (1-6) only (row: Vines as four instruments: ladder, wide catapult, line sinking toward danger, reacting hazard) |
| LEDGER-2026-11-02-full.md:306 | NOT TAKEN | counting convention of the whole-game pairs table (ES L1320); WR §6 sets a teach stage's pair to its taught moves (row: Run+Jump is always present, so leave it out of the pair count) |
| LEDGER-2026-11-02-full.md:307 | NOT TAKEN | library content; : a 1-5 creaky-limb deck idea for the library (ES L342's node plan is now the engine's roll, WR §3) (row: Run+Branches: stop and you fall; read the path and commit) |
| LEDGER-2026-11-02-full.md:308 | NOT TAKEN | library content; : liana entry speed is physics plus a library idea (ES CP2 L82 vine relay) (row: Run+Vines: a running leap into a vine turns speed into swing size) |
| LEDGER-2026-11-02-full.md:310 | LATER WORLD | W3+ slow zones and glowworms; none in W1 (row: Run+Slow: stutter-step out of drag, or stop dead to light glowworms) |
| LEDGER-2026-11-02-full.md:311 | NOT TAKEN | library content; : a creaky crumbling-tier idea for the library; ES L737 is a 1-5 polish ruling, not a P-/S- rule (row: Jump+Branches: short jumps up stacked crumbling tiers (a crumbling-tier shaft)) |
| LEDGER-2026-11-02-full.md:312 | NOT TAKEN | physics (release carry, ES L1830), not a generator rule (row: Jump+Vines: let go at the 45-degree top of the swing with carried speed) |
| LEDGER-2026-11-02-full.md:314 | LATER WORLD | W5 silk bridge (row: Jump+Slow: buffered hops skim sticky silk (a hop-to-skim silk bridge)) |
| LEDGER-2026-11-02-full.md:315 | USED-VIA | WR:99 `twist` job: two taught moves combined (creaky 1-5 + lianas 1-6); the bail-out idea itself is not yet a library piece (partial) (row: Branches+Vines: bail out from a breaking branch onto a vine) |
| LEDGER-2026-11-02-full.md:317 | LATER WORLD | slowing surfaces: W5 silk / W7 crumbling floors; W1's creaky limb does not slow (row: Branches+Slow: a surface that slows and crumbles; short hops, no walking) |
| LEDGER-2026-11-02-full.md:319 | LATER WORLD | W3 thorns (row: Vines+Slow: thorn vines strike if climbed fast; slow hand over hand) |
| LEDGER-2026-11-02-full.md:321 | USED-VIA | WR §6 `pair` field: the pair acts on one beat (L02:33 cited) (row: The 15 pairs are interactions inside one beat) |
| LEDGER-2026-11-02-full.md:327 | USED-VIA | WR §4 grammar (teach, practise, test, twist) with bursts by time WR:51 (row: Merge Smith's rhythm groups with Hayashida's four steps) |
| LEDGER-2026-11-02-full.md:328 | USED-VIA | adopted placement rules (L278); partial: no cells or portals (row: Cells: stretches between checkpoints or branch points, joined by portals) |
| LEDGER-2026-11-02-full.md:329 | USED-VIA | WR:51 bursts 5-20 s by time (L02:203 cited); no per-group density pattern (partial) (row: Rhythm groups of 5/10/15/20 s with a beat pattern and low/medium/high density) |
| LEDGER-2026-11-02-full.md:333 | USED-VIA | adopted difficulty dial (L652) (row: Part 1: one or two short low-density groups over solid ground or harmless water) |
| LEDGER-2026-11-02-full.md:336 | USED-VIA | WR:97 `rest` job holds a Dot spot; a flag only before a hard section (row: The first rest is a checkpoint and holds the stage's one wayside line) |
| LEDGER-2026-11-02-full.md:337 | USED-VIA | adopted difficulty dial (L643) (row: Part 2: the safety floor goes; chained transfers at medium density) |
| LEDGER-2026-11-02-full.md:338 | CONTRADICTED | same as L02:174: one repeat before the rest (Smith §5, ES L1883) vs WR:122; primary research wins (row: Part 2 may repeat one pattern before the rest, for muscle memory) |
| LEDGER-2026-11-02-full.md:339 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: nothing checks it breaks the rhythm (row: Part 3, the twist: a new context or second mechanic that breaks the learned rhythm) |
| LEDGER-2026-11-02-full.md:341 | USED-VIA | adopted placement rules (L306) (row: Part 3 holds a portal: an optional hard branch to a collectible) |
| LEDGER-2026-11-02-full.md:351 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary (row: Each slot X-1..X-10 has its own job; alternate fast runs, climbs, puzzle/stealth breaks, breathers) |
| LEDGER-2026-11-02-full.md:353 | USED-VIA | WR:93 `arrive` (flat, safe) and WR:36-37 the continuous moss floor (forgiving floors) (row: X-1 arrival: across left to right, low-medium density, forgiving floors) |
| LEDGER-2026-11-02-full.md:354 | USED-VIA | WR:12 `teaches` and the WR:94 `teach` job (row: X-2 teaches the world's mechanic, across with gentle slopes, medium density) |
| LEDGER-2026-11-02-full.md:355 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (W1's 1-3 teaches the rope, WR:31) (row: X-3 tight terrain: confined or rolling, slow-downs or shape traps, tests small positioning) |
| LEDGER-2026-11-02-full.md:357 | USED-VIA | adopted difficulty dial (L628); partial: no X-5 spike/X-6 dip (row: X-5 mid-world spike: many tiers, hazard-driven, high density) |
| LEDGER-2026-11-02-full.md:358 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary (row: X-6 change of pace: a sense flipped, climb or dark/puzzle room, low tempo) |
| LEDGER-2026-11-02-full.md:359 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; hub is not one of W1's map shapes (WR:49) (row: X-7 exploring with branches: non-linear cells and portals, mixed rhythm) |
| LEDGER-2026-11-02-full.md:360 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (1-8 chase kept as built, ES §B L1497) (row: X-8 high-speed layering: rising hazard or autoscroll pressure, 15-20 s groups, 3+ mechanics) |
| LEDGER-2026-11-02-full.md:363 | USED-VIA | WR:134 rule 13 neighbour difference (L02:350 "thinking load" cited) (row: After X-5, X-6 switches the kind of thinking; alternate dexterity with reasoning and stealth) |
| LEDGER-2026-11-02-full.md:369 | NOT TAKEN | whole-game structure (ES L1458-1656), not a W1 stage rule (row: The whole game is one big four-part arc across three acts) |
| LEDGER-2026-11-02-full.md:371 | USED-VIA | adopted move ladder M1-M8 (L2045) (row: An early world's main mechanic returns, without re-teaching, as the twist for the new world's mechanic) |
| LEDGER-2026-11-02-full.md:372 | USED-VIA | WR:31 W1 move ladder; the bail-out twist falls under WR:99 `twist` (partial) (row: W1: run, jump, still vines, basic breaking branches; twist branch-to-vine bail-outs) |
| LEDGER-2026-11-02-full.md:387 | LATER WORLD | W2-W3: the speed flip comes after W1 calibrates (W1's calibration is WR:106-107 teach then practise) (row: Act I calibrates the player's sense of the physics, then flips what he assumes about speed) |
| LEDGER-2026-11-02-full.md:413 | LATER WORLD | W8-W10 (ES G L1829) (row: Act III: earlier mechanics in three- and four-way combinations) |
| LEDGER-2026-11-02-full.md:429 | USED-VIA | adopted difficulty dial (L650); partial: L426, L650-653 unmarked (row: More layering in Acts II-III needs tighter checkpoint spacing) |
| LEDGER-2026-11-02-full.md:431 | USED-VIA | WR:43 a flag before every hard part (the ~2 s back is ES C10 L1757) (row: After a death he is back at the hard part within 2 s) |
| LEDGER-2026-11-02-full.md:435 | USED-VIA | adopted polish pass P-/S- (L781); partial: no word cap (row: One wayside line at the start, halfway or exit; over 15 words splits, so text never covers jumps) |
| LEDGER-2026-11-02-full.md:436 | USED-VIA | adopted placement rules (L304); partial: no three tiers or 'never two big finds' (row: Three risk tiers of collectibles; never two big ones in one stage) |
| LEDGER-2026-11-02-full.md:437 | USED-VIA | WR:132 a find off the main line by its own rule (row: Tier 1, notes: early, a little off the path behind a gentle clue) |
| LEDGER-2026-11-02-full.md:438 | USED-VIA | WR:132 finds off the main line; WR:96 forks give the other way in (row: Tier 2 finds behind another way in or an optional climb) |
| LEDGER-2026-11-04-part1.md:31 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (the ghost-physics half is ES P4 L1137) (row: A tempo (BPM) per world; action pieces placed on the beat by a ghost Pokey running real physics) |
| LEDGER-2026-11-04-part1.md:43 | NOT TAKEN | ES C1 L1748 keeps avoided-line hazards OPEN; W1 has nothing that costs a life before its first danger (WR:40) (row: Put a hazard on the line the player would take if he did not duck or short-hop) |
| LEDGER-2026-11-04-part1.md:52 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Puzzle rooms: a separate library of 15-20 blueprints whose layout, order of steps and numbers roll per seed) |
| LEDGER-2026-11-04-part1.md:65 | NOT TAKEN | special stage, hand-built (ES ruling 5 L1796: the builder is named per stage; specials kept as built, ES §B L1497) (row: One special stage per world where the same buttons do something new) |
| LEDGER-2026-11-04-part1.md:90 | USED-VIA | WR §6 `pair` and WR:49 map shape (row: Each stage's DNA names its primary+secondary mechanic pair and its archetype (ascent, drop, rising hazard, search hub)) |
| LEDGER-2026-11-04-part1.md:100 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); the under-bough hang (R-160.1) is not built yet, so it is not on the ladder from main (WR:31) (row: New sloth verbs: camouflage on moss, moth light, look-around while hanging, belly slide, let-go as the skill) |
| LEDGER-2026-11-04-part1.md:115 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Search rooms: real items in a different subset of 12-18 spots over 3 tiers each roll, with in-world tells) |
| LEDGER-2026-11-04-part1.md:125 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370); (checked, not auto-filled: ES L510) (row: Dead-walk check over 2.5 s should auto-inject a micro feature, not only flag) |
| LEDGER-2026-11-04-part1.md:132 | USED-VIA | adopted placement rules (L304); partial: no script-placed side-node (row: Each collectible gets its own small side-node, placed by the script's words) |
| LEDGER-2026-11-04-part1.md:141 | USED-VIA | WR:97 `rest`: flat ground, a Dot spot, a flag only before a hard part (width not ruled) (row: Rests are real places: 400-600 px flat, with the checkpoint flag and the halfway story line) |
| LEDGER-2026-11-04-part1.md:150 | NOT TAKEN | fixed nodes superseded: the engine rolls sections, no node list (WR:4, WR:21); ~2 s back is ES C10 L1757 (row: Node boxes with flat entry/exit ledges at Low/Mid/High port heights; camera settles on node; sub-1 s respawn) |
| LEDGER-2026-11-04-part1.md:194 | CONTRADICTED | ES L259, L2122: never a reroll, a missed draw is a designer finding (law 22, Matt 11-05: fix the root, never route around it). Matt wins (row: Generator checks repair only the failing node (regenerate it), within 12-15 ms) |
| LEDGER-2026-11-04-part1.md:205 | USED-VIA | WR:4 the engine generates the structure on every roll (row: A new seed every time the stage is selected or replayed) |
| LEDGER-2026-11-04-part1.md:206 | ADOPT | Across a stage's 16 judged rolls at least 3 map shapes appear, where its `branching` knob allows 3 (P1:206); WR:49 rolls the shape but nothing checks coverage (row: Curated 16 rolls are fine but must cover at least 3 map shapes) |
| LEDGER-2026-11-04-part1.md:207 | CONTRADICTED | WR:52 keeps era diversity ≥ 0.35 (STAGE-RULES §2, Matt's rule; ES L1792, L2121); no last-shape exclusion. Matt outranks the Gemini summary (row: Replay must exclude the last run's map shape and be at least 45% different (raise 0.35 to 0.45)) |
| LEDGER-2026-11-04-part1.md:208 | NOT TAKEN | replaced by the game's own lookalike < 0.78 against every engine-built stage (WR:52; ES C14 L1761, "never a new measure" L1792) (row: Stage vs stage at least 45% different; bring the rule text to the validator's numbers) |
| LEDGER-2026-11-04-part1.md:215 | USED-VIA | WR:49 map shape per stage; slot roles are not law (ES L1806) (row: Archetype per stage from its DNA; fixed slot roles become a default, not a law) |
| LEDGER-2026-11-04-part1.md:216 | USED-VIA | WR:97 `rest` (width not ruled) (row: Mid-stage rest (flag, story line) is wide 400-600 px; small pads between groups stay short) |
| LEDGER-2026-11-04-part1.md:217 | CONTRADICTED | ES L1031, L1106-1108, L1845: Matt plays every stage; bots calibrated on touch. Matt wins (row: Research claims bot solving means zero human playtesting needed) |
| LEDGER-2026-11-04-part1.md:275 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (ES L1120, L1883) (row: Every world already has a music BPM band; levels could read it) |
| LEDGER-2026-11-04-part1.md:277 | USED-VIA | adopted pacing P1-P9 (L2015); partial: 0.35 not 45% (row: Pacing tags, 2.5 s dead walk, 45% difference, clumsy thumb exist as measures, not as a generator gate) |
| LEDGER-2026-11-04-part1.md:280 | USED-VIA | adopted move ladder M1-M8 (L2045); partial: orchids, water level, stand-still, slide unused (row: Pieces the research proposes already exist: counterweight, seesaw, water level, fork, closing orchids, hide, stand-still, slide) |
| LEDGER-2026-11-04-part1.md:299 | USED-VIA | adopted move ladder M1-M8 (L2040) (row: Matt's brief: how to introduce the nodes, the tempos, the rhythms; today is okay but boring) |
| LEDGER-2026-11-04-part1.md:301 | USED-VIA | adopted placement rules (L272) (row: No pure random (x,y) scattering: different positions, same feel (procedural oatmeal)) |
| LEDGER-2026-11-04-part1.md:302 | USED-VIA | WR §1-§4: brief, then grammar, then roll, then gates (row: A 4-layer constrained pipeline driven by stage DNA and a seed) |
| LEDGER-2026-11-04-part1.md:303 | USED-VIA | WR:4 the whole structure now rolls per seed; puzzles stay hand-built (ES L1809) (row: 90 stages with fixed DNA; a run seed rebuilds graph, beats, geometry and puzzle on every load) |
| LEDGER-2026-11-04-part1.md:305 | USED-VIA | WR §6 `pair` (row: DNA locks primary and secondary mechanics per stage) |
| LEDGER-2026-11-04-part1.md:306 | USED-VIA | WR:49 map shape (ascent/drop are `trend`, WR:13) (row: Archetype per stage: hybrid, vertical ascent, vertical drop, rising hazard, search hub) |
| LEDGER-2026-11-04-part1.md:307 | USED-VIA | WR:16 `must` and WR:129-133 rule 12 (Dot lines, the find) (row: DNA names the story line's timing and the collectible) |
| LEDGER-2026-11-04-part1.md:308 | USED-VIA | WR:4 a new roll every time (row: A new seed each time the stage is selected or replayed) |
| LEDGER-2026-11-04-part1.md:310 | USED-VIA | WR:51 per-roll bursts and roll families; no beat timeline (partial) (row: Generator 2: a new beat timeline for the action nodes) |
| LEDGER-2026-11-04-part1.md:311 | NOT TAKEN | placement uses the tracer's reach (ES P4 L1137); beat-locking ruled out by ES L1120 (Matt); puzzle permutation deferred (L1809) (row: Generator 3: trace Pokey's jump physics to place platforms on the beats; permute puzzles) |
| LEDGER-2026-11-04-part1.md:312 | USED-VIA | WR:52 the gates against every roll; reachability through the tracer (ES P4) (row: Generator 4: compare with the previous run and prove 100% reachability) |
| LEDGER-2026-11-04-part1.md:313 | USED-VIA | WR:49, WR:126 the map shape rolls per seed (row: Randomize the level's shape before placing a platform, so a replay is not the same hallway) |
| LEDGER-2026-11-04-part1.md:318 | USED-VIA | WR:49 chimney is one of W1's map shapes (row: Zig-zag chimney: nodes alternate short sprints and tall climbs or drops) |
| LEDGER-2026-11-04-part1.md:319 | NOT TAKEN | not a W1 map shape (WR:49); counterweight gate art parked (ES L204) (row: Lock-and-key spoke: a root door or counterweight gate, spokes to fetch the key) |
| LEDGER-2026-11-04-part1.md:320 | USED-VIA | WR §4 section jobs act as the tags; order rules WR:105-134 (row: A Markov pacing filter assigns a tag to each node) |
| LEDGER-2026-11-04-part1.md:321 | USED-VIA | adopted difficulty dial (L652) (row: [I] Intro: wide platforms, a floor that can't kill) |
| LEDGER-2026-11-04-part1.md:323 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; no pulley or light bridge in W1's kit (row: [P] Puzzle nodes: pulleys, light/shadow bridges, water wheels, stealth glowworms) |
| LEDGER-2026-11-04-part1.md:324 | USED-VIA | WR:98 `test` job (row: [T] Tight: high-intensity mechanic pairs) |
| LEDGER-2026-11-04-part1.md:325 | USED-VIA | WR:97 `rest` (width not ruled) (row: [R] Rest: flat 400-600 px, checkpoint flag, story line) |
| LEDGER-2026-11-04-part1.md:326 | USED-VIA | WR:108-109 rules 3-4: a rest after every test and twist; no same job side by side (row: Never T then T or P then P; after T comes R, F or P; a sine-wave tension curve) |
| LEDGER-2026-11-04-part1.md:327 | NOT TAKEN | fixed nodes superseded: the engine rolls sections, no node list (WR:4, WR:21) (row: Node boxes: 1600x900 horizontal, 900x1600 vertical, 250 px join) |
| LEDGER-2026-11-04-part1.md:328 | USED-VIA | adopted placement rules (L278); partial: no 200 px ledge (row: Every node starts and ends on a flat hazard-free 200 px ledge at the port height (Low/Mid/High)) |
| LEDGER-2026-11-04-part1.md:329 | USED-VIA | adopted placement rules (L313) (row: Spaced nodes let the player read one challenge at a time) |
| LEDGER-2026-11-04-part1.md:330 | NOT TAKEN | fixed nodes superseded: the engine rolls sections, no node list (WR:4, WR:21); camera behaviour is engine work, not stage generation (row: The camera pans or locks to the new node's box before the first jump) |
| LEDGER-2026-11-04-part1.md:331 | NOT TAKEN | ES C10 L1757 sets about 2 s back at the hard part; respawn is engine behaviour (row: Sub-1-second respawn onto the node's own safe ledge) |
| LEDGER-2026-11-04-part1.md:332 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; (the rulebook generates action sections only) (row: Action and puzzle nodes are made by different methods) |
| LEDGER-2026-11-04-part1.md:333 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (the physics half is ES P4) (row: Action/flow nodes generated forward from physics and musical rhythm) |
| LEDGER-2026-11-04-part1.md:334 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Puzzle nodes: parameterized spatial templates with rolled variables) |
| LEDGER-2026-11-04-part1.md:336 | NOT TAKEN | worked example, not a rule (row: Worked example "Waltz Cadence": timed run, jump, vine grab, swing sequence) |
| LEDGER-2026-11-04-part1.md:339 | USED-VIA | adopted difficulty dial (L640); partial: pieces from decks (row: Wherever the ghost lands, place a branch, ledge, seesaw root or silk bridge) |
| LEDGER-2026-11-04-part1.md:340 | USED-VIA | WR:35 every piece stands on what holds it + LABELS support table (vine tops attach to solid, ES G L1851); no anchor-length rule (partial) (row: Wherever the ghost grabs a vine, put the anchor one vine-length above) |
| LEDGER-2026-11-04-part1.md:341 | NOT TAKEN | ES C1 L1748 keeps avoided-line hazards OPEN; nothing costs a life in early W1 (WR:40) (row: Wherever the ghost ducks or short-hops, put a hazard on the line it avoided) |
| LEDGER-2026-11-04-part1.md:342 | NOT TAKEN | a claim, not a rule; beat placement ruled out (ES L1120) (row: Claim: every jump possible, spaced for flow, on the beat; a new seed is a new sequence) |
| LEDGER-2026-11-04-part1.md:343 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: 15-20 puzzle blueprints: logic fixed; layout, step order and numbers roll) |
| LEDGER-2026-11-04-part1.md:344 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; no pulley in W1's kit (row: Pulley blueprint: hang on vine A to lift blocker B to cross to exit C) |
| LEDGER-2026-11-04-part1.md:345 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Per seed, mirror the puzzle room) |
| LEDGER-2026-11-04-part1.md:346 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Per seed, roll pulley ratio and decay (fast 2:1 lift vs root-stone hold)) |
| LEDGER-2026-11-04-part1.md:349 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: 12-18 fern alcoves on 3 tiers, joined by rolled vine and sinkhole paths) |
| LEDGER-2026-11-04-part1.md:350 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Real items go in a different subset of alcoves each run) |
| LEDGER-2026-11-04-part1.md:352 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; W1 stages have no search room (row: Empty ferns hold small finds or sleeping vines, never nothing) |
| LEDGER-2026-11-04-part1.md:353 | USED-VIA | WR:130 a Dot line at the first section where it is true; WR:97 every rest has a Dot spot (row: Story lines keep their start/halfway/near timing) |
| LEDGER-2026-11-04-part1.md:354 | USED-VIA | WR:93 `arrive` and WR:130 Dot line placement (row: "start" line attaches to node 1's rest apron) |
| LEDGER-2026-11-04-part1.md:355 | USED-VIA | WR:97 `rest` holds a Dot spot (row: "halfway" line attaches to the rest of node floor(N/2), the mid-stage breather) |
| LEDGER-2026-11-04-part1.md:356 | USED-VIA | WR:130 a Dot line at the first section where what it says is true (a "near" line is true just before the end) (row: "near" line attaches to the entry of node N-1, before the climax) |
| LEDGER-2026-11-04-part1.md:357 | USED-VIA | adopted placement rules (L304); partial: no script-led side-node (row: A collectible gets its own side-node matching the script's description) |
| LEDGER-2026-11-04-part1.md:362 | CONTRADICTED | ES L259: a failing node fails naming the missing piece, never a reroll (law 22). Matt wins (row: Check before load under 12 ms; a failing seed regenerates only the bad node) |
| LEDGER-2026-11-04-part1.md:363 | NOT TAKEN | tooling: the tracer's search (ES P4 L1137) (row: Gate 1: a search over every platform, vine and bounce pod with Pokey's physics) |
| LEDGER-2026-11-04-part1.md:364 | USED-VIA | adopted difficulty dial (L651); partial: +-100 ms not stated (row: Clumsy thumb: timing off by +-100 ms) |
| LEDGER-2026-11-04-part1.md:365 | USED-VIA | adopted difficulty dial (L651); partial: air-control penalty not stated (row: Clumsy thumb: 15% less air control) |
| LEDGER-2026-11-04-part1.md:366 | USED-VIA | adopted placement rules (L310); polish pass P-/S- (L908) (row: Every exit and every collectible reachable under the clumsy model; no frame-perfect jump) |
| LEDGER-2026-11-04-part1.md:367 | NOT TAKEN | runtime replay memory (ES ruling 6 L1797), not a stage rule (row: Store the last run's signature locally) |
| LEDGER-2026-11-04-part1.md:368 | NOT TAKEN | ES ruling 6 L1797 rolls away from the last layout by measure; shape exclusion not taken (ES L2121) (row: Exclude the previous run's map shape on replay) |
| LEDGER-2026-11-04-part1.md:369 | CONTRADICTED | WR:52 diversity ≥ 0.35 (STAGE-RULES §2, Matt's rule; ES L1792, L2121) vs 45%; Matt outranks the Gemini summary (row: At least 45% different from the last run across rhythm groups) |
| LEDGER-2026-11-04-part1.md:370 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370); (filling from the deck is not ruled: ES L510 only checks) (row: Over 2.5 s of flat walking with nothing: auto-add a slope, low hop, critter or bounce pod) |
| LEDGER-2026-11-04-part1.md:371 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: At every take-off the landing is in the camera's view) |
| LEDGER-2026-11-04-part1.md:372 | USED-VIA | adopted placement rules (L305) (row: A breadcrumb trail of fireflies or petals during vertical drops) |
| LEDGER-2026-11-04-part1.md:374 | NOT TAKEN | example tag string, not a rule (row: Example tag string: I, F, P, R:Wayside, T, F) |
| LEDGER-2026-11-04-part1.md:375 | USED-VIA | adopted placement rules (L278); partial: no apron width (row: 250 px flat aprons between nodes (200 px at line 41)) |
| LEDGER-2026-11-04-part1.md:381 | USED-VIA | WR §1 the feel brief is the stage's small config (row: Store a tiny DNA config per stage, not big tile maps) |
| LEDGER-2026-11-04-part1.md:382 | USED-VIA | WR §1 feel brief and knobs (WR:9-19) (row: Example DNA: world, stage, seed, archetype "Loopback", modifiers, narrative anchor) |
| LEDGER-2026-11-04-part1.md:383 | USED-VIA | WR:4 every roll new; WR:16 story pieces kept by `must` (row: Seeded PRNG; replay rolls new; story, pages and difficulty kept) |
| LEDGER-2026-11-04-part1.md:385 | NOT TAKEN | tooling: the tracer with Pokey's physics (ES P4 L1137), not a rule (row: A search-based solver with Pokey's exact physics constants) |
| LEDGER-2026-11-04-part1.md:386 | USED-VIA | adopted difficulty dial (L651); partial: drift penalty not stated (row: Noisy-bot penalty: thumb drift and 15% less air control) |
| LEDGER-2026-11-04-part1.md:387 | CONTRADICTED | ES L259 never a reroll; L1031 Matt plays every stage. Matt wins (row: Unreachable: seed++ and regenerate; zero human playtesting) |
| LEDGER-2026-11-04-part1.md:393 | USED-VIA | WR:108-109 rules 3-4 (row: Never two [T] in a row without an [R] or [P] between) |
| LEDGER-2026-11-04-part1.md:405 | USED-VIA | adopted placement rules (L313) (row: Unfiltered random creates bad sightlines, unavoidable enemies, impossible gaps) |
| LEDGER-2026-11-04-part1.md:416 | USED-VIA | adopted pacing P1-P9 (L2004); partial: rises p90 0.95 of gate's 80 px (L2115), no true-max margin shown (row: Pathfinder must reach exit and collectibles within a 15% safety margin) |
| LEDGER-2026-11-04-part1.md:460 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); specials kept as built (ES §B L1495-1506) (row: Real sloth biology as moves, plus special stages per world, so it isn't a 10x10 reskinned matrix) |
| LEDGER-2026-11-04-part1.md:463 | USED-VIA | adopted difficulty dial (L647) (row: Letting go at the exact right moment is the skill test) |
| LEDGER-2026-11-04-part1.md:464 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); the under-bough hang (R-160.1) is not built; thorny tops are W3 (row: Walk upside-down under branches whose tops are thorns) |
| LEDGER-2026-11-04-part1.md:466 | USED-VIA | adopted water W1-W12 (L1891) (row: Water stages: fast, no oxygen timer, relief zones) |
| LEDGER-2026-11-04-part1.md:468 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); no dark platforms in W1 (row: A burst of sloth moths on the double jump lights dark platforms) |
| LEDGER-2026-11-04-part1.md:471 | NOT TAKEN | special stage, hand-built (ES ruling 5 L1796: the builder is named per stage; specials kept as built, ES §B L1497) (row: One special stage per world, same buttons doing new things) |
| LEDGER-2026-11-04-part1.md:472 | NOT TAKEN | special stage, hand-built (ES ruling 5 L1796: the builder is named per stage; specials kept as built, ES §B L1497); (1-S is a hand-built special) (row: 1-S: rolling seed pod down a hollow trunk) |
| LEDGER-2026-11-04-part1.md:473 | LATER WORLD | 2-S (W2 raft special) (row: 2-S: one-log raft down rapids ahead of a flood wave) |
| LEDGER-2026-11-04-part1.md:477 | LATER WORLD | 6-S (W6) (row: 6-S: Venom Fang as a living vine bridge (coil or stretch)) |
| LEDGER-2026-11-04-part1.md:478 | LATER WORLD | 7-S (W7) (row: 7-S bell hall: hit a bell, invisible platforms go solid for 4 s on a beat) |
| LEDGER-2026-11-04-part1.md:479 | LATER WORLD | 8-S (W8) (row: 8-S constellation relay; borrow the 2 s flash stun) |
| LEDGER-2026-11-04-part1.md:481 | LATER WORLD | 10-S (W10) (row: 10-S The Reach: each broken guardian collar gives an assist on your inputs) |
| LEDGER-2026-11-04-part2.md:18 | NOT TAKEN | whole-game slot order; ES L1806 keeps stages and names, roles vary (row: Same slot order in every world (X-9 gauntlet in all 10, finds at same stage numbers); let each world write its own order) |
| LEDGER-2026-11-04-part2.md:27 | NOT TAKEN | whole-game structure (ES L1458-1656), not a W1 stage rule; : per-world fingerprint and twist (ES G L1840, ruling 4 L1795) (row: One world-wide macro rule per world that changes how progression works, not just obstacles) |
| LEDGER-2026-11-04-part2.md:34 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (ES L1120, sourced to Smith 2009 at L1883) (row: Lock platform, vine and hazard placement to the stage's musical beat (use our music's BPM)) |
| LEDGER-2026-11-04-part2.md:43 | ADOPT | No four take-offs in a row at the same interval (± 0.1 s) on the bot's route (ES L1807, accepted as a gate; P2:43) (row: Fail a stretch that repeats the exact same jump interval four times in a row) |
| LEDGER-2026-11-04-part2.md:52 | USED-VIA | WR:52 gates against every engine-built stage and WR:134 neighbour difference; never a reroll (ES L259, L2122) (row: Order-aware similarity (edit distance) against N-1..N-7; when too close, change map shape, never reroll same pieces) |
| LEDGER-2026-11-04-part2.md:59 | NOT TAKEN | story-level link across stages, not a generator rule (row: Cause and effect: an action in one stage visibly changes a later stage of the same world) |
| LEDGER-2026-11-04-part2.md:63 | USED-VIA | adopted placement rules (L315); difficulty dial (L645); partial: no formations, on-screen count or platform-size spawns (row: Enemy formations (solo, stepping-stone chain, triggered swarm), 1-3 on screen, enemies bound to ledge and chasm sizes) |
| LEDGER-2026-11-04-part2.md:70 | LATER WORLD | W5 webs and spiders (row: Silk tripwire set piece: thread shakes, 3 spiders drop as a moving gate, 1 chaser behind; kick or punch counterplay) |
| LEDGER-2026-11-04-part2.md:77 | USED-VIA | WR §4 jobs in order and WR:115 the moment in the last third; per-section action rates not taken (partial) (row: Stage shape with numbers: 0.4/s intro, 0.83/s flow, spike, zero-action rest, new pairing, max density, slide-out; move spike between stages) |
| LEDGER-2026-11-04-part2.md:87 | USED-VIA | adopted placement rules (L304); partial: no flow or patience roles, no rotation (row: Collectibles get roles (flow reward, branch-switch, patience reward) rotated per world so hiding spots never repeat) |
| LEDGER-2026-11-04-part2.md:92 | NOT TAKEN | behaviour secrets need new verbs (ES L1808); finds are placed by WR:132 (row: Secrets behind sloth behaviour (patience, petal chime, lure enemy, hang under exit), one guaranteed reachable per roll) |
| LEDGER-2026-11-04-part2.md:99 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); nothing like it in W1's kit (row: Stillness for 1.5 s wakes a 400 px radius: glowing platforms solid, hidden enemies shown, thorns retract; brought back in later worlds) |
| LEDGER-2026-11-04-part2.md:108 | USED-VIA | adopted difficulty dial (L643); partial: no enemy-free node share, no tight-stretch rule (row: At least 3 nodes enemy-free, rests 100% sacred, tight stretches checked for animals) |
| LEDGER-2026-11-04-part2.md:122 | LATER WORLD | W2 river (row: River snapper snouts rise as a 1-second bouncy platform) |
| LEDGER-2026-11-04-part2.md:124 | LATER WORLD | W7/W10 soldier enemies; W1 has no enemies (ES §B L1497) (row: Three soldier armours: front shield, spiked helmet, spear, each beaten a different way) |
| LEDGER-2026-11-04-part2.md:128 | LATER WORLD | later-world snakes (W6 swamp); W1 has no enemies (row: False-vine snake that goes stiff into a swing vine when punched) |
| LEDGER-2026-11-04-part2.md:137 | USED-VIA | adopted placement rules (L312); polish pass P-/S- (L908); partial: no steady-late bot (row: Clumsy bot with steady +100 ms takeoff delay and 15% less air speed proves every ledge and collectible reachable) |
| LEDGER-2026-11-04-part2.md:142 | NOT TAKEN | fixed nodes superseded: the engine rolls sections, no node list (WR:4, WR:21); checkpoints before each hard part (WR:43) and ~2 s back (ES C10 L1757) (row: 200 px flat apron at each node's ends; checkpoint at every node start, respawn under 0.8 s) |
| LEDGER-2026-11-04-part2.md:149 | LATER WORLD | W5/W7 jump-toggled platforms (row: Jump-toggled platforms: one jump swaps solid and ghost platforms, a double swaps twice (Worlds 5, 7)) |
| LEDGER-2026-11-04-part2.md:157 | USED-VIA | WR:129-133 rule 12 places each `must` item by its own rule, so a reroll never breaks it (row: Story and collectibles anchored to node slots so a reroll never breaks them) |
| LEDGER-2026-11-04-part2.md:173 | NOT TAKEN | whole-game slot order (ES L1806); X-9 gauntlet is a stage-slot matter for the brief (row: C1: research says never same slot order every world; STAGE-RULES §0b.6 and stagePlan keep X-9 gauntlet in all) |
| LEDGER-2026-11-04-part2.md:176 | CONTRADICTED | WR:122 "No idea twice in a row" vs the accepted repeat-once-before-a-rest (Smith §5, ES L1883); primary research wins; the 3-move count itself is not in the rulebook (row: C4: a 3-move run more than twice in one stage flags; ours allows any non-adjacent repeats) |
| LEDGER-2026-11-04-part2.md:177 | USED-VIA | adopted difficulty dial (L643); partial: no enemy-free node count (row: C5: at least 3 nodes enemy-free, rests sacred; validator checks only route length) |
| LEDGER-2026-11-04-part2.md:178 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: C6: no enemy within 150 px of a blind landing; generator keeps only 120 px) |
| LEDGER-2026-11-04-part2.md:179 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370) (row: C7: dead time over 2.5 s fails; our files say 2.5+2.5, 4 s and 2.0/3.0 s) |
| LEDGER-2026-11-04-part2.md:180 | NOT TAKEN | per-node action rates belong to fixed nodes (WR:21 no node list); WR:93 `arrive` keeps the start flat and safe (row: C8: Node 1 intro 0.4 actions/s; validator allows 0.8/s) |
| LEDGER-2026-11-04-part2.md:181 | NOT TAKEN | fixed nodes superseded: the engine rolls sections, no node list (WR:4, WR:21); WR:43 a flag before every hard part, ~2 s back (ES C10 L1757) (row: C9: invisible checkpoint at every node entrance, respawn under 0.8 s) |
| LEDGER-2026-11-04-part2.md:182 | USED-VIA | WR:47-50 each stage rolls its own structure and map shape (row: C10: research's "every level same shape" contradicts its own L391; our direction varies the shape) |
| LEDGER-2026-11-04-part2.md:183 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (ES L1120 drops music-locked rhythm altogether) (row: C11: research BPMs disagree with our music; if placements lock to a beat it must be the music heard) |
| LEDGER-2026-11-04-part2.md:186 | NOT TAKEN | no adaptive director: ES §C14 L1761 / research note; the difficulty dial (adopted) is fixed per stage (row: C14: adaptive director keeps casual and veteran players engaged; ours says not now) |
| LEDGER-2026-11-04-part2.md:187 | NOT TAKEN | cause and effect absent by ruling (ES L1806); slot roles are per brief (row: C15: cause and effect and slot shuffling are core "structural breakers", not extras) |
| LEDGER-2026-11-04-part2.md:190 | USED-VIA | WR:52 era/lookalike gates against every engine-built stage (ES ruling 1 L1792) (row: C18: compare token streams of levels 1-7; layoutMemory already rolls away per stage) |
| LEDGER-2026-11-04-part2.md:196 | NOT TAKEN | not a rule: a fact about today's code (row: F1: no node graph or StageDNA today; W1 rolls section versions, gen2 picks 16 curated rolls, layout kept until cleared) |
| LEDGER-2026-11-04-part2.md:198 | NOT TAKEN | not a rule: a fact about today's gen2 (row: F3: no nodes; a gen2 stage is about 25-28 sections in a row) |
| LEDGER-2026-11-04-part2.md:231 | NOT TAKEN | whole-game structure (ES L1458-1656), not a W1 stage rule; (ES G L1840 fingerprint); no macro rule ruled for W1 (row: #2 World-wide mutators: a macro rule per world changing progression) |
| LEDGER-2026-11-04-part2.md:238 | NOT TAKEN | whole-game slot shuffle (ES L1806 keeps stages; roles vary) (row: #9 Shuffle slot order per act; never puzzle at X-7 and climb at X-6 everywhere) |
| LEDGER-2026-11-04-part2.md:242 | NOT TAKEN | secrets and tells are a story/find design note; finds placed by WR:132 (row: #13 Secrets never behind unmarked walls; tells tied to story and sloth moves) |
| LEDGER-2026-11-04-part2.md:243 | NOT TAKEN | collectible tells are story dressing in `must` (WR:16); not a generator rule (row: #14 Pink Bell Notes found by Meeca's trail tells (hairpin scratch, petal on thermal, boot-prints)) |
| LEDGER-2026-11-04-part2.md:244 | USED-VIA | adopted placement rules (L306); partial: no look-back or no-ground-chain rule (row: #15 Ledger Pages high above a node start, reached by an unbroken chain of branches or swings) |
| LEDGER-2026-11-04-part2.md:246 | NOT TAKEN | MISSING and not ruled: a pickup idea, not a generator rule (row: #17 Dot's pocket finds by a rustling bush or caught feather as he walks past) |
| LEDGER-2026-11-04-part2.md:247 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); secret gates kept as built (ES §B L1503) (row: #18 Secret stage entrances inside normal stages via sloth behaviour) |
| LEDGER-2026-11-04-part2.md:248 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); (patience unlock) (row: #19 Patience unlock: still 5 s, a vine lowers or door opens) |
| LEDGER-2026-11-04-part2.md:249 | NOT TAKEN | HUD/sound feature, not a generator rule (row: #20 Wrist-petal compass pulses and music box chimes within 300 px of a false wall) |
| LEDGER-2026-11-04-part2.md:250 | NOT TAKEN | enemies and breakable walls: W1 lists no hazards (ES §B L1497); not a generator rule (row: #21 Lure a charger, falling floor or dive into a wall Pokey can't break) |
| LEDGER-2026-11-04-part2.md:251 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); the under-bough hang (R-160.1) is not built (row: #22 Hang under the exit flag's platform to reach a hidden hollow) |
| LEDGER-2026-11-04-part2.md:252 | USED-VIA | WR:132 the golden seed placed by its rule (above a mushroom, beyond a double) and proven reachable (L02:439 cited) (row: #23 Golden seed: a secret on a fixed node spoke, behind a tell, checked reachable every roll) |
| LEDGER-2026-11-04-part2.md:253 | NOT TAKEN | enemy design, not a W1 generator rule (W1 lists no hazards, ES §B L1497) (row: #24 Enemies as moving geometry, timing gates and tools, not roadblocks) |
| LEDGER-2026-11-04-part2.md:255 | NOT TAKEN | enemy telegraphs are animal behaviour, not stage generation (row: #26 One or two predictable reactions to a trigger, 0.5 s telegraph) |
| LEDGER-2026-11-04-part2.md:256 | NOT TAKEN | readability contract is art/animation work (polish P-1, P-8 adopted cover the W1 cases); no measurable generator rule (row: #27 Readability contract: in 0.2 s player knows danger zone, which button, how to use it) |
| LEDGER-2026-11-04-part2.md:257 | NOT TAKEN | combat design, not stage generation (row: #28 Rock-paper-scissors: stomp, punch, kick each beat different enemies) |
| LEDGER-2026-11-04-part2.md:258 | NOT TAKEN | combat design; W1 has no enemies (row: #29 Stomp beats walkers, birds, snappers; high bounce makes enemies stepping stones over pits) |
| LEDGER-2026-11-04-part2.md:259 | NOT TAKEN | combat design (row: #30 A punch stuns 1.5 s so you can pass without killing) |
| LEDGER-2026-11-04-part2.md:260 | NOT TAKEN | combat design (kick-roll is library idea ES CP2 L107) (row: #31 A kicked enemy slides, knocks out the row, triggers far switches) |
| LEDGER-2026-11-04-part2.md:261 | NOT TAKEN | animal behaviour design (ES §Animals L174-175) (row: #32 Each species a signature state machine tied to its world) |
| LEDGER-2026-11-04-part2.md:262 | LATER WORLD | later-world snakes (W6) (row: #33 Snake false vine: tongue flick, punch it stiff 3 s as a swing vine) |
| LEDGER-2026-11-04-part2.md:263 | NOT TAKEN | animal behaviour numbers (boa tell, ES L219), not stage generation (row: #34 Coiled snake hisses 0.4 s then lunges; jump it or kick it off) |
| LEDGER-2026-11-04-part2.md:264 | LATER WORLD | W3 dark caves (row: #35 Cave jaguars creep only when back turned or in dark; freeze in light) |
| LEDGER-2026-11-04-part2.md:265 | LATER WORLD | W3 jaguars (row: #36 Pounce: eyes flash 0.5 s, fixed arc leap; duck under or uppercut) |
| LEDGER-2026-11-04-part2.md:266 | NOT TAKEN | animal behaviour (eagle hide is unused art, ES L156) (row: #37 Eagle shadow tracks 1.2 s, screech, dive, talons stick in the dirt) |
| LEDGER-2026-11-04-part2.md:268 | LATER WORLD | W5 spiders (row: #39 Spider tripwire in 3 beats: pluck, eyes, 3 drop ahead, 1 chaser behind) |
| LEDGER-2026-11-04-part2.md:269 | LATER WORLD | W5 spiders (row: #40 Counterplay: weave through, kick the anchor, punch one to tangle all three) |
| LEDGER-2026-11-04-part2.md:270 | LATER WORLD | W2 river snappers (row: #41 River snappers: snap up when jumped; snout a bouncy platform for 1 s) |
| LEDGER-2026-11-04-part2.md:271 | LATER WORLD | W10 soldiers (row: #42 Front shield blocks punch; kick knocks it off or into water) |
| LEDGER-2026-11-04-part2.md:272 | LATER WORLD | W10 soldiers (row: #43 Spiked helmet: stomp hurts; hit from the side) |
| LEDGER-2026-11-04-part2.md:273 | LATER WORLD | W10 soldiers (row: #44 Spear blocks front; stomp, or lure the thrust into wood) |
| LEDGER-2026-11-04-part2.md:274 | USED-VIA | adopted difficulty dial (L643); partial: no count per other job (row: #45 Enemy count set by the node's job, never random) |
| LEDGER-2026-11-04-part2.md:275 | USED-VIA | adopted difficulty dial (L643); partial: no node share (row: #46 35% rule: at least 3 of 8 nodes enemy-free; rests 0 enemies) |
| LEDGER-2026-11-04-part2.md:276 | USED-VIA | WR:40 nothing costs a life before W1's first danger; W1 lists no enemies, so its precision sections are enemy-free already (row: #47 Pure precision nodes enemy-free: let the environment be the enemy) |
| LEDGER-2026-11-04-part2.md:277 | USED-VIA | adopted placement rules (L315); partial: no count cap (row: #48 1 to 3 enemies on screen; never clusters of one kind on flat ground) |
| LEDGER-2026-11-04-part2.md:278 | NOT TAKEN | enemy room design; W1 has no enemies (row: #49 Solo Specialist: one high-threat enemy on a bridge or switch as the room's puzzle) |
| LEDGER-2026-11-04-part2.md:280 | NOT TAKEN | enemy swarm design; not in W1 (row: #51 Triggered swarm only on a mistake, 5 s escape sprint) |
| LEDGER-2026-11-04-part2.md:281 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: #52 No enemy within 150 px of a blind landing) |
| LEDGER-2026-11-04-part2.md:282 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: #53 Wide flat ledge over 300 px eligible for 1 armoured guard or coiled snake) |
| LEDGER-2026-11-04-part2.md:283 | LATER WORLD | W2-W10 enemy placement (row: #54 Chasm over 250 px eligible for 1 hovering eagle or snapper as a bounce helper) |
| LEDGER-2026-11-04-part2.md:284 | LATER WORLD | W5 silk node (row: #55 Silk node: dormant 3 spiders + 1 chaser wired to a floor tripwire) |
| LEDGER-2026-11-04-part2.md:285 | USED-VIA | WR:52 gates on the grammar generator's output (row: #56 Fingerprint and anti-similarity pipeline on a grammar generator) |
| LEDGER-2026-11-04-part2.md:286 | USED-VIA | WR:52 era/lookalike measure behaviour (ES ruling 1 L1792) (row: #57 Fingerprint each stage as it is generated, by behaviour tokens not tile coordinates) |
| LEDGER-2026-11-04-part2.md:288 | USED-VIA | WR:52 gates and WR:109 no same job side by side catch the J V B repeat (row: #59 Boring example: J V B repeated three times) |
| LEDGER-2026-11-04-part2.md:290 | USED-VIA | WR:52 similarity fails the stage; seed++ is contradicted (never a reroll, ES L2122) (row: #61 Levenshtein vs level 7 over 55%: reject, seed++, scramble map shape) |
| LEDGER-2026-11-04-part2.md:291 | USED-VIA | WR:108 a rest after every test and twist; bursts 5-20 s WR:51 (row: #62 Flow: alternate intense execution and micro-rests) |
| LEDGER-2026-11-04-part2.md:294 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research (row: #65 Lock platforms, vines and hazards to beat, off-beat or half-note) |
| LEDGER-2026-11-04-part2.md:295 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research (row: #66 Swinging vines at exact 4/4 intervals as the first test piece) |
| LEDGER-2026-11-04-part2.md:296 | USED-VIA | WR:50 spike and rest placement rolls per stage (ES ruling 4 L1795); a strict sine wave is not taken (row: #67 Action density across nodes as a strict sine wave) |
| LEDGER-2026-11-04-part2.md:297 | NOT TAKEN | fixed node rates (WR:21 no node list) (row: #68 Node 1: one action every 2.5 s warm-up) |
| LEDGER-2026-11-04-part2.md:298 | NOT TAKEN | fixed node rates (WR:21) (row: #69 Node 2: one action every 1.2 s) |
| LEDGER-2026-11-04-part2.md:299 | USED-VIA | WR:115 the moment (the spike) is the last test in the last third, placed per roll (row: #70 Node 3: the spike, peak tension (may move)) |
| LEDGER-2026-11-04-part2.md:300 | USED-VIA | WR:97 `rest`: flat ground with a Dot spot (row: #71 Node 4: zero action safe ledge where the wayside line plays) |
| LEDGER-2026-11-04-part2.md:302 | USED-VIA | WR:100 `finale` (max density at the exit) (row: #73 Node 7: maximum density, everything together) |
| LEDGER-2026-11-04-part2.md:304 | CONTRADICTED | WR:47 every stage rolls its own structure; "exact same shape" is the opposite. WR follows ES ruling 4 L1795 (measured 0.083 vs 0.35, WR:83) over the Gemini claim (row: #75 Every level follows this exact shape, only the flavour varies) |
| LEDGER-2026-11-04-part2.md:305 | USED-VIA | adopted placement rules (L304); partial: no anti-formula rule (row: #76 Random collectibles get missed; always-highest is formulaic) |
| LEDGER-2026-11-04-part2.md:306 | NOT TAKEN | only the golden-seed glint rule exists (ES CP3 L373, 1-5); a general tease rule is not ruled (row: #77 Every collectible seen or heard from the safe rest just before it) |
| LEDGER-2026-11-04-part2.md:307 | NOT TAKEN | 1-5's glint is its own brief item (ES CP3 L371-374); not a world rule (row: #78 Sightline tease: from the rest, see a page glinting across a chasm) |
| LEDGER-2026-11-04-part2.md:308 | NOT TAKEN | sound feature, not a generator rule (row: #79 Sound tease: music-box chime within 300 px of a hidden note) |
| LEDGER-2026-11-04-part2.md:309 | USED-VIA | adopted placement rules (L306); partial: no rotating roles (row: #80 Collectibles given structural roles in the node graph so spots never repeat) |
| LEDGER-2026-11-04-part2.md:310 | NOT TAKEN | MISSING: a find kind for later swing/slide worlds; W1 finds are by `must` (row: #81 Flow Reward at top of a fast swing or slide, only with unbroken speed) |
| LEDGER-2026-11-04-part2.md:311 | USED-VIA | WR:96 `fork` high and low roads; WR:36-38 a fall lands on the low road (row: #82 Branch-Switch page on a high road of breaking branches; a fall lands safely on the low road) |
| LEDGER-2026-11-04-part2.md:312 | USED-VIA | WR:132 finds off the main line (side pockets, ES L1177) (row: #83 Patience Reward in a dead-end alcove a fast player rushes past) |
| LEDGER-2026-11-04-part2.md:313 | USED-VIA | WR:52 gates (3-grams vs earlier stages); BPM contradicted (ES L1120); tease and sine not taken (partial) (row: #84 Checklist: tokenize, Levenshtein vs previous 7, lock to BPM, sine wave, tease collectibles) |
| LEDGER-2026-11-04-part2.md:325 | USED-VIA | WR:52 gates are the headless validator (row: #96 A headless validator before redesigning levels; rejects boring layouts) |
| LEDGER-2026-11-04-part2.md:326 | USED-VIA | WR:52 era/lookalike read the stage's actions (row: #97 Generator outputs the token string for every required action) |
| LEDGER-2026-11-04-part2.md:327 | CONTRADICTED | as P2:176: WR:122 vs Smith §5 (ES L1883); primary research wins (row: #98 Within one stage, a 3-run more than twice flags) |
| LEDGER-2026-11-04-part2.md:328 | USED-VIA | WR:52 lookalike against every engine-built stage (row: #99 Level N vs N-1..N-7 over 55% similar rejects) |
| LEDGER-2026-11-04-part2.md:329 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370) (row: #100 Dead-time auditor: over 2.5 s with zero inputs fails) |
| LEDGER-2026-11-04-part2.md:330 | ADOPT | No four take-offs in a row at the same interval (± 0.1 s) on the bot's route (ES L1807, accepted as a gate; P2:43) (row: #101 Same jump interval four times in a row fails) |
| LEDGER-2026-11-04-part2.md:331 | USED-VIA | adopted placement rules (L312); polish pass P-/S- (L908); partial: no steady-late bot (row: #102 Noisy bot: 15% less air speed, 100 ms takeoff delay, every find reachable) |
| LEDGER-2026-11-04-part2.md:332 | CONTRADICTED | ES L259, L2122: never a reroll; narrow ranges are a designer finding (law 22). Matt wins (row: #103 Test 500 variations a second, keep only passing seeds) |
| LEDGER-2026-11-04-part2.md:334 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: #105 The landing must be in the camera's view at take-off) |
| LEDGER-2026-11-04-part2.md:335 | NOT TAKEN | whole-game stage count; W1's special stages kept as built (ES §B L1497) (row: #106 Nine generated stages per world, nodes in four parts, tenth a handmade guardian) |
| LEDGER-2026-11-04-part2.md:336 | USED-VIA | WR:49 map shape rolls per stage (row: #107 Roll a map shape first from five, hub for search stages) |
| LEDGER-2026-11-04-part2.md:337 | USED-VIA | WR:109 no same job side by side; WR:108 rest after every test (row: #108 Tag nodes Intro, Flow, Puzzle, Rest, Tight; never two Tight in a row) |
| LEDGER-2026-11-04-part2.md:339 | NOT TAKEN | puzzle machines: puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; counterweight parked (ES L162) (row: #110 1-2 puzzle machines per world: pulleys, jump toggles, light bridges, seesaws, water-wheels) |
| LEDGER-2026-11-04-part2.md:341 | USED-VIA | WR:49 map shape separate from WR:51 roll families (row: #112 Map shape separate from micro-rhythm) |
| LEDGER-2026-11-04-part2.md:342 | USED-VIA | adopted placement rules (L278); partial: no flat apron rule (row: #113 Flat hazard-free 200 px apron at every node's entry and exit) |
| LEDGER-2026-11-04-part2.md:343 | NOT TAKEN | fixed nodes superseded: the engine rolls sections, no node list (WR:4, WR:21); WR:43 a flag before every hard part (row: #114 Invisible checkpoint at every node entrance, respawn under 0.8 s) |
| LEDGER-2026-11-04-part2.md:345 | NOT TAKEN | combat design (row: #116 Phase 4 combat triangle) |
| LEDGER-2026-11-04-part2.md:346 | USED-VIA | adopted difficulty dial (L643); partial: no role spawning (row: #117 Platform-role spawning in 65% of nodes, 35% enemy-free including rests) |
| LEDGER-2026-11-04-part2.md:347 | LATER WORLD | W3 jaguars, W4 eagles, W5 spiders, W6 snakes (row: #118 Species reactions: vine snakes, dark jaguars, eagle shadow, spider curtain) |
| LEDGER-2026-11-04-part2.md:350 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: #121 Landing-zone cheap hits, 150 px) |
| LEDGER-2026-11-04-part2.md:351 | NOT TAKEN | animal behaviour (row: #122 Deterministic AI, 0.5 s telegraph before every strike) |
| LEDGER-2026-11-04-part2.md:353 | NOT TAKEN | Dot lines are approved rows in `must` (WR:16, WR:130); line length is a writing rule (STAGE-RULES), not generation (row: #124 Wayside and Dot lines at node 1, mid rest, pre-exit; split lines over 15 words) |
| LEDGER-2026-11-04-part2.md:357 | USED-VIA | WR:129-133 rule 12 (row: #128 Story and collectibles as anchors on node slots) |
| LEDGER-2026-11-04-part2.md:361 | USED-VIA | WR §4: generatePlan(brief, seed) with WR:109 no same job side by side (row: #132 Spec contract before code: a pure function of StageDNA and seed returning 7 nodes, no two Tight adjacent) |
| LEDGER-2026-11-04-part2.md:365 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); the under-bough hang (R-160.1) is not built (row: #136 Under-branch hanging: hold climb to hang, move, drop, knock hazards below; doubles every branch) |
| LEDGER-2026-11-04-part2.md:366 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31) (row: #137 Stillness resonance: still 1.5 s wakes a 400 px radius) |
| LEDGER-2026-11-04-part2.md:367 | NOT TAKEN | not in W1's kit (WR:25-29); new piece needs art (STAGE-RULES §4) (row: #138 Bending saplings: bridge, or catapult with a jump mid-spring) |
| LEDGER-2026-11-04-part2.md:369 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); (camouflage to Matt, ES L1808) (row: #140 Camouflage: crouch on moss, enemies ignore him; double jump releases moths) |
| LEDGER-2026-11-04-part2.md:370 | NOT TAKEN | counterweight parked art (ES L162); not in W1's kit (row: #141 Counterweight pulleys; bring back in more worlds) |
| LEDGER-2026-11-04-part2.md:371 | LATER WORLD | W5/W7 jump toggles (row: #142 Jump-toggled flora: every jump flips solid and ghost platforms) |
| LEDGER-2026-11-04-part2.md:372 | NOT TAKEN | not in W1's kit; creaky limbs (1-5) break singly (row: #143 Domino branches: each break starts the next after 0.15 s; last hits a switch) |
| LEDGER-2026-11-04-part2.md:374 | LATER WORLD | W5 silk (row: #145 Silk ricochet: taut line reflects an air kick at 1.2x) |
| LEDGER-2026-11-04-part2.md:376 | NOT TAKEN | not in W1's kit (row: #147 Sound ripples outline hidden platforms and wake sound-sensitive enemies) |
| LEDGER-2026-11-04-part2.md:378 | LATER WORLD | W2/W6 water waves (ES §D L1594) (row: #149 Water waves: surface springs, logs ride, a ground-pound lifts a far platform) |
| LEDGER-2026-11-04-part2.md:379 | NOT TAKEN | not in W1's kit; engine feature (row: #150 Background-layer jumps via hollow logs or cannon vines) |
| LEDGER-2026-11-04-part2.md:380 | NOT TAKEN | HUD feature (row: #151 Wrist-petal pulse rate rises near an uncollected find) |
| LEDGER-2026-11-04-part2.md:384 | LATER WORLD | W2, W4, W6, W8 (row: #155 Venom Fang as a hidden zip-line vine in Worlds 2, 4, 6, 8) |
| LEDGER-2026-11-04-part2.md:385 | NOT TAKEN | combat design (row: #156 Enemy bowling: a kicked enemy rolls 550 px/s, knocks others, breaks walls, presses plates) |
| LEDGER-2026-11-04-part2.md:386 | LATER WORLD | W6 snakes (row: #157 Vine snakes: tongue every 2.5 s, stunned 4 s and swingable) |
| LEDGER-2026-11-04-part2.md:388 | LATER WORLD | W3, W7 (row: #159 Look-away sentries in Worlds 3 and 7) |
| LEDGER-2026-11-04-part2.md:392 | NOT TAKEN | adaptive director not ruled (no row in ES); difficulty is the adopted dial (row: #163 Director: 3 deaths widens next ledges; clean play opens an elite high road) |
| LEDGER-CRITICAL-AGENTS.md:34 | USED-VIA | adopted placement rules (L276); polish pass P-/S- (L905) (row: Machines check reach, repeats, density; helpers argue only fun, sameness, cost, risk) |
| LEDGER-CRITICAL-AGENTS.md:53 | USED-VIA | WR §4 jobs teach/test/twist; multi-purpose pieces not ruled (partial) (row: Kishotenketsu arc made optional; favour multi-purpose pieces doing movement, defense and pacing at once) |
| LEDGER-CRITICAL-AGENTS.md:60 | USED-VIA | WR §4 grammar (entry, end, forks by branching); no lock-and-key in W1 (row: Concept graph first: entry/exit, critical-path length, lock-and-key, branching factor, node purposes) |
| LEDGER-CRITICAL-AGENTS.md:62 | USED-VIA | WR:108 a rest after every test and twist (landmarks not ruled) (row: Alternate action sprints with recovery; put landmarks at decision boundaries) |
| LEDGER-CRITICAL-AGENTS.md:63 | USED-VIA | adopted placement rules (L276) (row: Every node and transition bound to measurable acceptance criteria, not prose) |
| LEDGER-CRITICAL-AGENTS.md:64 | NOT TAKEN | ES L259: a failing draw is named for the designer, never auto-repaired (WR:50 gates) (row: On solver failure or critic risk: targeted local repair, relaxation or node swap keeping intent) |
| LEDGER-CRITICAL-AGENTS.md:75 | NOT TAKEN | ES G L1855 caps gap+enemy pairs; W1 has no enemies; multi-node audit not ruled (row: Audit pairwise and multi-node adjacencies: benign pieces side by side become compound bottlenecks) |
| LEDGER-CRITICAL-AGENTS.md:204 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: Check pairs: two pieces fine alone but bad side by side, e.g. a gap onto a patrol) |
| LEDGER-CRITICAL-AGENTS.md:216 | USED-VIA | WR §4 grammar: entry (arrive), exit (end), forks; no unlocks in W1 (row: Concept graph for a sample stage: entry, exit, critical path, unlocks, branches, node jobs) |
| LEDGER-CRITICAL-AGENTS.md:217 | USED-VIA | WR:51 bursts 5-20 s by time (row: Beats: each node's duration, entry state, exit state) |
| LEDGER-CRITICAL-AGENTS.md:218 | USED-VIA | adopted placement rules (L276) (row: Every node and file has a machine-runnable acceptance test, not prose) |
| LEDGER-CRITICAL-AGENTS.md:264 | NOT TAKEN | tooling: global reachability by the tracer and level check (row: Single-pass output is locally fine but fails global reachability; check globally by tool) |
| LEDGER-CRITICAL-AGENTS.md:294 | USED-VIA | WR §4 grammar picks sections and ideas; placement by the tracer (ES P4) (row: Tanagra-style reactive planner picks patterns and beats; a solver places geometry, guaranteeing playability) |
| LEDGER-CRITICAL-AGENTS.md:295 | USED-VIA | WR §1-§4: world rulebook frame, then generated sections; no lock-and-key (row: Dead Cells: hand-authored macro frame and concept graph, then compliant rooms) |
| LEDGER-CRITICAL-AGENTS.md:296 | USED-VIA | WR §4 grammar (teach..twist), bursts (micro) and decks (meso) (row: Kishotenketsu against filler; micro/meso/macro patterns; multi-purpose mechanics) |
| LEDGER-CRITICAL-AGENTS.md:301 | USED-VIA | adopted move ladder M1-M8 (L2040) (row: Every candidate follows Kishotenketsu; ledger says optional, since a fixed arc is itself a felt pattern) |
| LEDGER-CRITICAL-AGENTS.md:302 | NOT TAKEN | multi-purpose components not ruled; a design note (row: Favour multi-purpose components (movement, defense, pacing at once)) |
| LEDGER-CRITICAL-AGENTS.md:305 | USED-VIA | WR §4 grammar (row: Concept graph first: entry/exit, critical path, lock-and-key, branching, node purposes) |
| LEDGER-CRITICAL-AGENTS.md:307 | USED-VIA | WR:108 (landmarks at forks not ruled) (row: Alternate sprints and recovery; a landmark at every fork) |
| LEDGER-CRITICAL-AGENTS.md:308 | USED-VIA | adopted placement rules (L276) (row: Every node and transition has measurable acceptance criteria) |
| LEDGER-CRITICAL-AGENTS.md:309 | NOT TAKEN | ES L259: never a reroll or auto-repair; the miss is a designer finding (row: Local repair from the error instead of random retries) |
| LEDGER-CRITICAL-AGENTS.md:313 | NOT TAKEN | ES G L1855 caps one pair; a general pair check not ruled (row: Audit pairs and multi-node adjacencies; add a general pair check to the validator) |
| LEDGER-CRITICAL-AGENTS.md:318 | USED-VIA | adopted placement rules (L276) (row: Put a deterministic verifier, not LLM debate, on maths and reachability) |
| LEDGER-CRITICAL-AGENTS.md:319 | NOT TAKEN | ES L259, L370: relaxing is designer-only (row: Solver returns a minimal unsat core or relaxes constraints automatically) |
| LEDGER-CRITICAL-AGENTS.md:320 | NOT TAKEN | ES L259: no automatic repair; a failing draw is a designer finding (row: Adaptive pipeline: skill classifier, physics verifier, deterministic local repair, not re-prompting) |
| LEDGER-CRITICAL-AGENTS.md:322 | USED-VIA | WR:52 gates (era, lookalike, window) are the expressive-range filters (row: Pre-filter with expressive-range metrics: linearity, leniency, action density, flow) |
| LEDGER-CRITICAL-AGENTS.md:331 | USED-VIA | WR:52 gates; no local repair (ES L259) (row: All formal checks to zero-token verifiers, expressive-range filters and local repair) |
| LEDGER-ENGINE-GEMINI.md:112 | USED-VIA | WR §1 the brief is the small data spec (row: A stage is a ~20-line data spec compiled by fixed code, not hand-written TypeScript per stage.) |
| LEDGER-ENGINE-GEMINI.md:116 | USED-VIA | WR:49 map shapes; no node boxes (WR:21) (row: Topology pass: node boxes with entry/exit vectors, four map shapes (loop back, split, chimney, hub), split closure.) |
| LEDGER-ENGINE-GEMINI.md:122 | NOT TAKEN | section patterns as data are the library (ES CP2); not a rulebook rule (row: Section patterns as data, beat-relative, with bound platform roles, enemy slots, petal arcs, miss floors, no x/y.) |
| LEDGER-ENGINE-GEMINI.md:127 | NOT TAKEN | W1 hazards none (ES §B L1497); counterpoint timing is later-world enemy design (row: Hazards timed in counterpoint to the player's moves (thrown fruit lands beat 3 while he jumps beat 2).) |
| LEDGER-ENGINE-GEMINI.md:131 | NOT TAKEN | tooling: failure reporting (row: Structured blame log: failing data line, measured value, limit and exact fix, under 15 lines.) |
| LEDGER-ENGINE-GEMINI.md:141 | NOT TAKEN | ES L259/L510: dead time is a failing line, not auto-filled; no auto-healer (row: Local auto-healer: split short landings, fill dead walks over 2.5 s with a hop, swap a repeated seam pattern.) |
| LEDGER-ENGINE-GEMINI.md:147 | USED-VIA | the difficulty dial (adopted, ES 624-661) drives numbers per stage; tension per section not taken (partial) (row: Each node's tension drives its numbers (density, gap share, width), with a planned-vs-measured check.) |
| LEDGER-ENGINE-GEMINI.md:152 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (platform-role table not taken) (row: Animals bound to platform roles in data, with a pairwise threat cap (move × animal × runway).) |
| LEDGER-ENGINE-GEMINI.md:157 | ADOPT | A shimmy-rope section (W1's slow move, 1-3) never runs as an empty corridor: it sits over or beside a faster road, or carries a dodge (EG:157); W1 has the rope, so the slow-zone rule binds 1-3 on (row: Slow zones (mud, silk, shimmy rope, water) never empty corridors: under a faster road or paired with a dodge.) |
| LEDGER-ENGINE-GEMINI.md:165 | NOT TAKEN | cause and effect not ruled (ES L1806) (row: Contain cause-and-effect to bonus spots: a flag in stage s changes only a bonus node in stage s+1.) |
| LEDGER-ENGINE-GEMINI.md:171 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: When the next landing would leave the shared upright/sideways view, fold the path (switchback vine, bounce, lift).) |
| LEDGER-ENGINE-GEMINI.md:174 | NOT TAKEN | replaced by the game's own era/lookalike (WR:52; ES L1792 "never a new measure") (row: Normalized bigram entropy of the move string ≥ 0.68 against two-move ping-pong.) |
| LEDGER-ENGINE-GEMINI.md:176 | NOT TAKEN | combat input timing; W1 has no punch or kick asks (row: Gesture cooldown: ≥267 ms after a double jump or drop before a punch or kick is asked.) |
| LEDGER-ENGINE-GEMINI.md:183 | NOT TAKEN | composite score not ruled; gates are WR:52 (row: Composite flow score: curve fidelity, beat alignment, variety, vertical flow, agency.) |
| LEDGER-ENGINE-GEMINI.md:187 | USED-VIA | adopted placement rules (L304); partial: seed only a glint in 1-5, no 3-seed rule (row: Golden seeds by rule: risky split road, puzzle room, late optional skill branch.) |
| LEDGER-ENGINE-GEMINI.md:203 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (ES L1120; tempo words set no numbers, L2236) (row: Who sets the tempo: Gemini's typed BPM table vs ours, the stage's own music beat.) |
| LEDGER-ENGINE-GEMINI.md:209 | USED-VIA | WR:50 spike, rest and forks placed per roll; WR:134 neighbours differ (row: No fixed tension curve: each stage places spike, rest and pair differently from the stage before.) |
| LEDGER-ENGINE-GEMINI.md:217 | USED-VIA | WR:52 era/lookalike read the look grid as well as moves; WR:25-29 kit (row: Variety must include what he stands on, faces, uses, direction and art, not move letters only.) |
| LEDGER-ENGINE-GEMINI.md:221 | NOT TAKEN | density lines are measured per stage from its own world (ES L1805, deep pass 2 L1880); ES L801's 0.80 is provisional (row: Action density: ours Easy 0.35-0.55, Normal 0.75-1.15; Gemini's Easy top 55% higher.) |
| LEDGER-ENGINE-GEMINI.md:233 | USED-VIA | adopted difficulty dial (L628) (row: Slot order: no fixed relief dips at stages 4 and 7 in every world.) |
| LEDGER-ENGINE-GEMINI.md:235 | USED-VIA | WR:52 the builder reads the game's own measure (ES L253-259) (row: Generator and checker must share one measure; a cap on another metric guarantees nothing.) |
| LEDGER-ENGINE-GEMINI.md:239 | USED-VIA | WR:43 a flag before every hard part (ES C10 L1757) (row: Miss cost: Gemini's "safe" drop is our bite tier (>4 s back); checkpoint at each node entrance.) |
| LEDGER-ENGINE-GEMINI.md:244 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: Enemy runway: Gemini 1.0 s (~285 px) flat before a trigger; ours 150 px from a landing.) |
| LEDGER-ENGINE-GEMINI.md:247 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal (row: Petal goal not fixed 75%; keep 70/15/15 and set the goal from the bots.) |
| LEDGER-ENGINE-GEMINI.md:252 | USED-VIA | WR:49 topology; the 4-draw lockout is ADOPT rule "lockout"; blame and heal not taken (ES L259) (row: Agreed core: formulas file, world profile, ~20-line spec, template library, traced placement, seeds; Gemini adds topology, lockout, blame, h) |
| LEDGER-ENGINE-GEMINI.md:266 | USED-VIA | adopted pacing P1-P9 (L1997); partial: no skilled or first-timer clock (row: Skilled clock 120-150 s; first-timer 180-300 s.) |
| LEDGER-ENGINE-GEMINI.md:269 | USED-VIA | WR:116 rule 8: sections added until the clock reaches the band (row: Skilled length = sum of puzzle time plus groups and rests per node (a length budget).) |
| LEDGER-ENGINE-GEMINI.md:270 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; (puzzle beats are rooms kept as built) (row: One 12-18 s puzzle, in node 4 or 6.) |
| LEDGER-ENGINE-GEMINI.md:272 | ADOPT | The first-timer bot's clock is judged too: 180-300 s (2-5 min) a stage (ES §Stage length L664-667, G L1852); WR:41/65 bind only the quick clock (row: First-timer clock = hesitation × skilled + branch time + miss penalties.) |
| LEDGER-ENGINE-GEMINI.md:273 | NOT TAKEN | constants replaced by the first-timer bots (ES CP2 L221, L227) (row: First-timer constants: hesitation 1.22, branch +25 s, p_miss 0.25, 8 s penalty.) |
| LEDGER-ENGINE-GEMINI.md:274 | NOT TAKEN | Gemini-only ceiling; density band uncalibrated (ES L801) (row: Sustained density over 1.6 actions/s causes thumb fatigue.) |
| LEDGER-ENGINE-GEMINI.md:276 | NOT TAKEN | per-node density formula: no node list (WR:21); no default lines (ES L1805) (row: Density per node rises with tension: ρ = ρmin + (ρmax−ρmin)·T^1.15.) |
| LEDGER-ENGINE-GEMINI.md:277 | NOT TAKEN | as EG:221: density measured per stage (ES L1805) (row: Easy 0.35-0.85, Normal 0.50-1.35 actions/s.) |
| LEDGER-ENGINE-GEMINI.md:278 | NOT TAKEN | fixed tension table: the spike and rest roll per stage (WR:50), rests ≥ 2× beat (WR:97) (row: Fixed node tension table with per-node density and rest seconds.) |
| LEDGER-ENGINE-GEMINI.md:280 | NOT TAKEN | tooling: physics in the tracer (ES P4 L1137) (row: Landing frame ⌊2v/g⌋; double at the apex.) |
| LEDGER-ENGINE-GEMINI.md:281 | NOT TAKEN | tooling: measured reach in the tracer (ES L369) (row: Double reach ≈ 1.75 × single (measured 1.79).) |
| LEDGER-ENGINE-GEMINI.md:282 | USED-VIA | adopted pacing P1-P9 (L2004); partial: not thumb-timing derived (row: Safe reach = air control × max reach − (early press + double delay) × speed.) |
| LEDGER-ENGINE-GEMINI.md:283 | USED-VIA | the difficulty dial (adopted): Easy gap share 0.45-0.80 of jumpOK (C1/C20) (row: Easy safe reach ≈ 0.62 R_max (ours ~0.50-0.53); gen2 Easy margin 0.65.) |
| LEDGER-ENGINE-GEMINI.md:284 | USED-VIA | adopted pacing P1-P9 (L2004) (row: Normal safe reach ≈ 0.78 R_max (ours ~0.72-0.74); gen2 Normal margin 0.82.) |
| LEDGER-ENGINE-GEMINI.md:285 | CONTRADICTED | ES C1 L1748, L1843: gap share is not the difficulty dial; it shapes stride, drawn per roll (L2114, WR:51). C1 was ruled from measurement; measured outranks the Gemini summary (row: Gap share as a linear function of node tension.) |
| LEDGER-ENGINE-GEMINI.md:286 | USED-VIA | adopted pacing P1-P9 (L2004) (row: Single-jump gap share Easy 0.25-0.55, Normal 0.35-0.75 of R_1.) |
| LEDGER-ENGINE-GEMINI.md:287 | USED-VIA | the difficulty dial gap row (doubles via jumpOK, C20); G L1843's numbers are not adopted (row: Double-jump gap share Easy 0.40-0.60, Normal 0.50-0.78 of R_2.) |
| LEDGER-ENGINE-GEMINI.md:288 | NOT TAKEN | width formula not taken; the measured pad band is the rule (see EG:289) (row: Platform width ≥ hitbox + 2·early·speed + buffer·(1−T).) |
| LEDGER-ENGINE-GEMINI.md:289 | USED-VIA | the difficulty dial landing-width row (220→110 px, never under 90, C4); note G L1844 (3.5-7.0 body widths, Normal 110 px end withdrawn) is not adopted: the two disagree and the designer should reconcile (row: Pads 3.5 × sloth (Normal climax, 154 px) to 7.0 × (Easy intro, 308 px).) |
| LEDGER-ENGINE-GEMINI.md:290 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (only the boa number is ruled; snake deck, eagle sky, cat runway not ruled) (row: Animal footprints: snake deck ≥5 W, boa ≥3.5 W from entry, eagle 4 s open sky, cat ≥8 W.) |
| LEDGER-ENGINE-GEMINI.md:291 | NOT TAKEN | per-animal weights not ruled (no ES line) (row: Per-animal hazard weights (snake 1.2, eagle 1.6, cat 1.5…).) |
| LEDGER-ENGINE-GEMINI.md:292 | USED-VIA | adopted difficulty dial (L645) (row: Enemies per minute rise with world: E = E_base(D) + α(D)·(w−1).) |
| LEDGER-ENGINE-GEMINI.md:293 | USED-VIA | adopted difficulty dial (L645); partial: 0-1→4-5 Normal, 0-1→3 Easy taught animals per stage (row: Easy 3.5→6.65/min (~8→15 a stage); Normal 5.5→11.35 (~12→25).) |
| LEDGER-ENGINE-GEMINI.md:294 | NOT TAKEN | enemy time spacing not ruled (MISSING, no ES line or measure) (row: Minimum time between enemies by tension; floors 4.5 s Easy, 2.5 s Normal.) |
| LEDGER-ENGINE-GEMINI.md:295 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (weights not taken) (row: Pairwise threat H_pair = move weight × animal weight × runway ≤ cap.) |
| LEDGER-ENGINE-GEMINI.md:296 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: ≥1.0 s flat runway before an enemy trigger (Easy; Normal low tension).) |
| LEDGER-ENGINE-GEMINI.md:297 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal; (70/15/15 split not ruled) (row: Petal goal 75% of total; 70% shared, 15% high, 15% low.) |
| LEDGER-ENGINE-GEMINI.md:298 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal (row: Encountered 85% on one pass; margin to the goal ~11.8%.) |
| LEDGER-ENGINE-GEMINI.md:301 | CONTRADICTED | WR:122 bans any idea twice in a row and Gemini bans repeats of length 1-4, but Smith §5 (ES L1883) allows one group repeat before a rest; primary research wins over both (row: No adjacent identical substring of length 1-4; no symbol 3 times running.) |
| LEDGER-ENGINE-GEMINI.md:302 | NOT TAKEN | replaced by the game's own era/lookalike (WR:52, ES L1792) (row: Normalized bigram entropy ≥ 0.68.) |
| LEDGER-ENGINE-GEMINI.md:303 | NOT TAKEN | replaced by the game's lookalike < 0.78 and 20 s window (WR:52; ES C14 L1761) (row: Similarity: 0.5 Levenshtein + 0.5 4-gram Jaccard ≤ 0.42.) |
| LEDGER-ENGINE-GEMINI.md:306 | LATER WORLD | W5 silk / later mud and brambles (row: Tier 2 miss: drop into mud or silk, or brambles: 1 HP or a 10 s slow.) |
| LEDGER-ENGINE-GEMINI.md:307 | USED-VIA | WR:43 a flag before every hard part (ES C10 L1757) (row: Tier 3 miss: −1 HP, respawn at the current rhythm group.) |
| LEDGER-ENGINE-GEMINI.md:308 | CONTRADICTED | the adopted dial follows STAGE-RULES §1b bands (ES C17 L1765), not Gemini's D(w,s); Matt's rule wins (row: D(w,s) = 0.12 + 0.055(w−1) + 0.032(s−1) − dips at 4, 7 + bump at 10.) |
| LEDGER-ENGINE-GEMINI.md:309 | LATER WORLD | W2-W10 first stages (drop below the previous world's end, ES C17 L1764); W1 has no previous world (row: A new world drops difficulty by 0.20 at its first stage.) |
| LEDGER-ENGINE-GEMINI.md:310 | NOT TAKEN | flow score not ruled (MISSING); gates are WR:52 (row: Composite flow score F = 100(0.30 curve + 0.25 rhythm + 0.20 variety + 0.15 vertical + 0.10 agency).) |
| LEDGER-ENGINE-GEMINI.md:311 | NOT TAKEN | not ruled; tension per section not used (row: Curve fidelity: measured vs planned tension.) |
| LEDGER-ENGINE-GEMINI.md:312 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (beat alignment) (row: Beat alignment: share of bot take-offs within ±33 ms of a beat.) |
| LEDGER-ENGINE-GEMINI.md:313 | NOT TAKEN | replaced by the game's era/lookalike (WR:52) (row: Variety term = entropy share × (1 − max similarity).) |
| LEDGER-ENGINE-GEMINI.md:314 | USED-VIA | WR:111-114 trend gives the elevation spread; ES variety gate L40 (partial) (row: Vertical flow: fewer stalled frames, more elevation spread.) |
| LEDGER-ENGINE-GEMINI.md:315 | USED-VIA | WR:96 `fork`: both roads walkable to the rejoin (row: Agency: a split or loop with both roads viable; every hazard costs.) |
| LEDGER-ENGINE-GEMINI.md:316 | NOT TAKEN | flow score not ruled (row: Accept at flow ≥80 (L253) or ≥82 (L580).) |
| LEDGER-ENGINE-GEMINI.md:319 | CONTRADICTED | pacing P7 (adopted, ES L2003): Normal crumble 0.5 s, not 0.67 s; Easy OPEN. P7 rests on primary research and calibration, which outranks the Gemini summary (row: Creak delay Easy 1.2 s (36 frames), Normal 0.67 s (20).) |
| LEDGER-ENGINE-GEMINI.md:320 | LATER WORLD | W5 silk; mud later (row: Mud speed ×0.55, silk ×0.45.) |
| LEDGER-ENGINE-GEMINI.md:321 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker (row: Pattern lockout of 4 draws.) |
| LEDGER-ENGINE-GEMINI.md:323 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370); (the 48 px split is not ruled) (row: Short landing ≤48 px split between ledges; flat runs over 2.5 s split with a hop.) |
| LEDGER-ENGINE-GEMINI.md:325 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: Lookahead for a run-and-jump: 1.2 s sideways vs 0.45 s upright.) |
| LEDGER-ENGINE-GEMINI.md:326 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: Safe sightline box 12×12 tiles; camera anchors by direction.) |
| LEDGER-ENGINE-GEMINI.md:327 | NOT TAKEN | camera/HUD placement is engine work (clipcheck owns insets); not a generator rule (row: Gesture collisions above 1.2/s; 267 ms cooldown; thumb hides bottom-right 20%; Pokey at 55% height.) |
| LEDGER-ENGINE-GEMINI.md:332 | USED-VIA | adopted water W1-W12 (L1894); partial: ropes, silk, mud uncovered (row: A 50% slow-down with no extra decisions feels stuck; skilled leap over, clumsy trudge.) |
| LEDGER-ENGINE-GEMINI.md:333 | NOT TAKEN | cause and effect not ruled (ES L1806) (row: Cause-and-effect on the main path means 2^k layouts to check.) |
| LEDGER-ENGINE-GEMINI.md:336 | NOT TAKEN | tooling: batch checks (ES §E L1612) (row: 85 specs, 200 builds (100 stages × 2 settings) checked in batch.) |
| LEDGER-ENGINE-GEMINI.md:337 | USED-VIA | WR:52 gates, WR:65 120-150 s, WR:97 rests; yield 16/16 (partial) (row: Targets: yield ≥85/98%, similarity ≤42%, entropy, rest ≤2.2 s, 120-150 s, 0 blind leaps, flow ≥82.) |
| LEDGER-ENGINE-GEMINI.md:411 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (ES L1120, L1883) (row: Tempo comes from our music, read from the stage's song; keep whole-frames beats inside each world's range.) |
| LEDGER-ENGINE-GEMINI.md:415 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (agrees no song-following; beat-timed hazards not taken) (row: Music changes per session, so no bassline-driven layout; beat-timed hazards still work.) |
| LEDGER-ENGINE-GEMINI.md:417 | NOT TAKEN | tooling: the tracer (ES P2/P4 L1131-1139) (row: Tracer places jumps only; extend to vines, ropes, mushrooms; merge its two copies into one.) |
| LEDGER-ENGINE-GEMINI.md:420 | USED-VIA | WR:49 map shape for topology; WR:25-29 the look (kit) (row: The deck alone did not cure sameness in gen2; topology and the look are the bigger buys.) |
| LEDGER-ENGINE-GEMINI.md:422 | NOT TAKEN | tooling: builder and checker share one measure (ES L253-259) (row: Our checker compares by cosine of 3-move counts plus a look grid; builder caps must use the checker's measure.) |
| LEDGER-ENGINE-GEMINI.md:424 | NOT TAKEN | tooling: physics in the tracer (row: Physics is 1/60 s with two gravities; reach numbers come from the tracer's simulation.) |
| LEDGER-ENGINE-GEMINI.md:426 | NOT TAKEN | animal roster is LABELS (adopted); role table not ruled (row: Monkeys don't attack; role table must use our animals (snake, boa, eagle, cats, spider, frog, caiman, turtle).) |
| LEDGER-ENGINE-GEMINI.md:428 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal (row: Petal goal varies; keep Matt's 70/15/15 split and set the goal from the bots.) |
| LEDGER-ENGINE-GEMINI.md:436 | USED-VIA | adopted polish pass P-/S- (L686) (row: Gemini leaves out the look: add art dressing by node and role, with a look measure in the checker.) |
| LEDGER-ENGINE-GEMINI.md:442 | USED-VIA | WR:50 spike, rest and forks placed per roll; WR:134 neighbours differ (row: One fixed tension curve copied into every spec becomes the pattern; neighbours must place parts differently.) |
| LEDGER-ENGINE-GEMINI.md:445 | USED-VIA | adopted difficulty dial (L635) (row: Every Gemini number is a guess to calibrate on bots and Matt's play, never a target.) |
| LEDGER-ENGINE-GEMINI.md:448 | USED-VIA | WR:96 fork roads both walkable to the rejoin (closure as stated) (row: Closing a loop or split is hand-waved; needs real design before it is promised.) |
| LEDGER-ENGINE-GEMINI.md:452 | USED-VIA | the adopted dial (ES 624-661, re-run under C17 L1765) rejects Gemini's formula (row: Reject Gemini's difficulty formula (world overlap); bandFor and STAGE_HEAT already do the job.) |
| LEDGER-ENGINE-GEMINI.md:466 | USED-VIA | WR §4 constructive grammar; never a reroll (ES L259) (row: Stop generate-and-test loops; compile stages constructively.) |
| LEDGER-ENGINE-GEMINI.md:467 | USED-VIA | WR §1 brief (data) vs §2-§4 rules (code) (row: Split declarative intent (data) from kinematic and topological enforcement (code).) |
| LEDGER-ENGINE-GEMINI.md:468 | NOT TAKEN | Spelunky room grid not a W1 map shape (WR:49) (row: Spelunky: 4×4 room grid with a guaranteed critical path.) |
| LEDGER-ENGINE-GEMINI.md:469 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (≤1 breakable/animal kind a view, ES L2026) (row: Spelunky failure: hazards from neighbouring rooms combine into unavoidable hits.) |
| LEDGER-ENGINE-GEMINI.md:470 | USED-VIA | WR:19 `branching` knob and WR:110 fork counts (row: Dead Cells: concept graph per biome with branching ratio and entrance-exit distance.) |
| LEDGER-ENGINE-GEMINI.md:471 | NOT TAKEN | no buffer-corridor rule; overlap is a fork-road matter (WR:96) (row: Dead Cells failure: 2D branches overlap, fixed with buffer corridors.) |
| LEDGER-ENGINE-GEMINI.md:472 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research (row: Rayman: beat times map to positions; percussion → attacks, melody → jumps, sustains → ropes.) |
| LEDGER-ENGINE-GEMINI.md:473 | USED-VIA | ES L1120: never lock his speed; the rulebook has no auto-run (row: Rayman failure: auto-run locks speed to music; never lock his speed.) |
| LEDGER-ENGINE-GEMINI.md:476 | NOT TAKEN | Downwell's vertical fall-line is not a W1 map shape (WR:49) (row: Downwell: one vertical fall-line with rest caverns at fixed depths.) |
| LEDGER-ENGINE-GEMINI.md:477 | USED-VIA | adopted difficulty dial (L643) (row: Rogue Legacy: point-buy hazard budget scaled by distance from the entrance.) |
| LEDGER-ENGINE-GEMINI.md:478 | USED-VIA | WR:51 each roll draws hop, gap and rise; WR:52 diversity (row: Rogue Legacy failure: static geometry memorized when only enemies vary.) |
| LEDGER-ENGINE-GEMINI.md:480 | USED-VIA | WR:122 no idea twice in a row; WR:108 rest after every hard part (row: Hades: deck without replacement, recent templates banned, relief after intense rooms.) |
| LEDGER-ENGINE-GEMINI.md:481 | USED-VIA | adopted difficulty dial (L650) (row: Ori: escape sequences became memorization spikes when readability dropped.) |
| LEDGER-ENGINE-GEMINI.md:482 | NOT TAKEN | rhythm-first generation not taken (ES L1120-1121, L1796 rhythm names to be defined or struck) (row: Launchpad: rhythm first, then geometry; one rhythm gives dozens of layouts.) |
| LEDGER-ENGINE-GEMINI.md:483 | USED-VIA | WR §4 constructive, never generate-and-cull (ES L259) (row: Launchpad weakness: generate-and-cull at the macro level.) |
| LEDGER-ENGINE-GEMINI.md:484 | NOT TAKEN | ES L259: a failed draw is a designer finding, not a solver backtrack (row: Tanagra: constraint solver; relax or backtrack at the pattern level instead of failing.) |
| LEDGER-ENGINE-GEMINI.md:485 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: Polymorph: difficulty is super-additive (gap then enemy on the landing); pairwise adjacency.) |
| LEDGER-ENGINE-GEMINI.md:486 | USED-VIA | WR:121 decks draw ideas (meso-patterns) as the unit (row: Dahlskog: meso-patterns are the minimum unit; micro slices break.) |
| LEDGER-ENGINE-GEMINI.md:487 | NOT TAKEN | tooling (ASP solver), not a rule (row: ASP (clingo): global rules, every solution valid.) |
| LEDGER-ENGINE-GEMINI.md:488 | NOT TAKEN | tooling: reachability by the tracer (ES P4) (row: WFC fails global reachability without a movement graph.) |
| LEDGER-ENGINE-GEMINI.md:490 | NOT TAKEN | ES L259: no local repair (row: Chunk-level modification beats whole-level (83.5% vs 74.1% first-pass playable).) |
| LEDGER-ENGINE-GEMINI.md:491 | NOT TAKEN | Spelunky table, not a rule (row: Table: Spelunky 10×8 templates with chunk markers; 4×4 walk.) |
| LEDGER-ENGINE-GEMINI.md:492 | USED-VIA | adopted difficulty dial (L643); partial: no concept graph or box solver (row: Table: Dead Cells concept graphs, rooms, bounding-box solver, enemy budget.) |
| LEDGER-ENGINE-GEMINI.md:493 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research (row: Table: Rayman stem timelines, x = v·t.) |
| LEDGER-ENGINE-GEMINI.md:495 | NOT TAKEN | library data (ES CP2 L72), not a rule (row: Table: Downwell/Rogue Legacy slices tagged by exits and spawn slots.) |
| LEDGER-ENGINE-GEMINI.md:496 | NOT TAKEN | rhythm groups as data not taken (ES L1796) (row: Table: Launchpad rhythm-group parameters plus grammar probabilities.) |
| LEDGER-ENGINE-GEMINI.md:497 | NOT TAKEN | research note, not a rule (row: Table: Tanagra fails on solver complexity for 2D branching.) |
| LEDGER-ENGINE-GEMINI.md:498 | NOT TAKEN | research note (row: Table: evolutionary search needs thousands of runs; raw n-grams break topology.) |
| LEDGER-ENGINE-GEMINI.md:499 | NOT TAKEN | tooling: reachability by the tracer (row: Table: WFC exemplar adjacency fails reachability.) |
| LEDGER-ENGINE-GEMINI.md:500 | USED-VIA | WR §4 rules hold during placement (constructive) (row: Enforce constraints before or during placement, not by rejection.) |
| LEDGER-ENGINE-GEMINI.md:501 | USED-VIA | WR:49 map shape; hub not a W1 shape (row: Pass 1 picks a map shape: loop back, high/low split, chimney, hub-and-spoke.) |
| LEDGER-ENGINE-GEMINI.md:503 | USED-VIA | adopted placement rules (L278); partial: no 2D box or direction vector (row: Each node a non-overlapping 2D box with entry and exit vectors.) |
| LEDGER-ENGINE-GEMINI.md:506 | NOT TAKEN | library pattern names (ES CP2 L76-86); not a rule (row: Seed pattern names: Vine_Transfer_Over_Mud, Rotten_Branch_Cascade, Snake_Stomp_Bridge, Eagle_Shadow_Sprint.) |
| LEDGER-ENGINE-GEMINI.md:507 | NOT TAKEN | tooling: the tracer; beat placement ruled out (ES L1120) (row: Pass 3: tracer places platforms, vines, ropes, mushrooms on the beat; add those moves to it.) |
| LEDGER-ENGINE-GEMINI.md:508 | USED-VIA | WR §1 brief + §2 world rules + library (row: Data: WorldProfile, ~20-line StageSpec, ~30 MesoPatterns.) |
| LEDGER-ENGINE-GEMINI.md:509 | USED-VIA | adopted placement rules (L270); partial: no layout engine or role binder (row: Code: graph layout engine, deck shuffler, tracer, pickup and enemy role binder.) |
| LEDGER-ENGINE-GEMINI.md:511 | USED-VIA | WR:49 map, WR:52 lookalike, WR:51 per-roll tempo (row: Variety on three scales: macro topology, meso deck (cross-stage <42%), micro tempo and physics; plus look.) |
| LEDGER-ENGINE-GEMINI.md:512 | NOT TAKEN | gap is not a difficulty lever (ES C1 L1748); the enemy pair cap is the animal-placement ADOPT rule (row: Node tension drives gap-to-reach ratio and enemy adjacency budget.) |
| LEDGER-ENGINE-GEMINI.md:513 | USED-VIA | WR:96 fork roads rejoin (merge as stated; no merge geometry) (row: Weak point: the "elastic bridge" where a loop or split merges.) |
| LEDGER-ENGINE-GEMINI.md:514 | NOT TAKEN | tooling (CSP), not a rule (row: Arch 2: CSP over 80-120 beats with AC-3 and backtracking.) |
| LEDGER-ENGINE-GEMINI.md:516 | NOT TAKEN | pixel closure not ruled; WR:96 both roads walkable to the rejoin (row: Split closure: both roads' dx and dy sums equal, merging at one pixel.) |
| LEDGER-ENGINE-GEMINI.md:517 | CONTRADICTED | as EG:301: Smith §5 (ES L1883) allows one repeat before a rest; WR:122 and Gemini both ban; primary research wins (row: Moves i..i+2 never equal i+3..i+5.) |
| LEDGER-ENGINE-GEMINI.md:518 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370) (row: Dead walk ≤ 2.5 s.) |
| LEDGER-ENGINE-GEMINI.md:520 | NOT TAKEN | tooling (spline topology), not ruled (row: Arch 3: inertial flow-ribbon spline as the topology (chimney bends up, loop folds, split forks).) |
| LEDGER-ENGINE-GEMINI.md:521 | NOT TAKEN | not taken by its own row (copies sameness) (row: Markov tiling learned from the strongest W1-4 patterns (not taken: copies sameness).) |
| LEDGER-ENGINE-GEMINI.md:522 | USED-VIA | adopted placement rules (L278) (row: Seam welding: adjust only the bridge platform between chunks.) |
| LEDGER-ENGINE-GEMINI.md:524 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: Orientation paradox: a leap fair sideways is blind upright, and the reverse.) |
| LEDGER-ENGINE-GEMINI.md:525 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research (row: 4-track lead sheet: kick → jump or bounce, snare → double, hi-hat → run, rest → safe platform.) |
| LEDGER-ENGINE-GEMINI.md:526 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (the song does not set direction; `trend` in the brief does, WR:13) (row: Bassline sets direction: rising → climb, falling → drop, octave split → high/low split.) |
| LEDGER-ENGINE-GEMINI.md:527 | NOT TAKEN | W1 lists no hazards (ES §B L1497); counterpoint enemies not ruled (row: Hazards in call-and-response with his jumps (fruit thrown beat 1 lands beat 3; eagle locks then strikes).) |
| LEDGER-ENGINE-GEMINI.md:529 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: Inscribed safe sightline box; fold the path when it would leave it.) |
| LEDGER-ENGINE-GEMINI.md:530 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171); (the sightline box; counterpoint and fermata not taken) (row: Recommendation: Arch 1 + sightline box + counterpoint; puzzle rooms need a "fermata".) |
| LEDGER-ENGINE-GEMINI.md:539 | USED-VIA | adopted difficulty dial (L635) (row: The coefficients are "original architectural derivations".) |
| LEDGER-ENGINE-GEMINI.md:541 | ADOPT | The first-timer bot's clock is judged too: 180-300 s (2-5 min) a stage (ES §Stage length L664-667, G L1852); WR:41/65 bind only the quick clock; (skilled 120-150 s is already WR:65) (row: Skilled 120-150 s; first-timer 180-300 s.) |
| LEDGER-ENGINE-GEMINI.md:544 | USED-VIA | WR:116 rule 8: sections added until the quick clock reaches the band (row: Length budget: skilled time = sum of puzzle and groups.) |
| LEDGER-ENGINE-GEMINI.md:545 | NOT TAKEN | puzzle beats are rooms kept as built (ES L1809) (row: Puzzle 12-18 s once, node 4 or 6.) |
| LEDGER-ENGINE-GEMINI.md:547 | ADOPT | The first-timer bot's clock is judged too: 180-300 s (2-5 min) a stage (ES §Stage length L664-667, G L1852); WR:41/65 bind only the quick clock (row: First-timer predictor; the bot rules.) |
| LEDGER-ENGINE-GEMINI.md:548 | NOT TAKEN | constants replaced by bots (ES CP2 L221) (row: p_miss 0.25, 8 s penalty → 223.9 s first-timer.) |
| LEDGER-ENGINE-GEMINI.md:549 | NOT TAKEN | as EG:274: Gemini-only, uncalibrated (row: Above 1.6 actions/s thumbs tire and misread.) |
| LEDGER-ENGINE-GEMINI.md:551 | NOT TAKEN | density formula: no node list; no default lines (ES L1805) (row: Density = ρmin + (ρmax−ρmin)·T^1.15, our bounds.) |
| LEDGER-ENGINE-GEMINI.md:552 | NOT TAKEN | ES L1805: no default lines; each stage's lines are measured from its world (ES deep pass 2 L1880) (row: Easy 0.35-0.85, Normal 0.50-1.35 (contradicts ours).) |
| LEDGER-ENGINE-GEMINI.md:553 | USED-VIA | WR:93 `arrive` flat and safe; WR:130 the first Dot line (row: Node 1: safe intro plus a Dot tip, low tension.) |
| LEDGER-ENGINE-GEMINI.md:554 | USED-VIA | WR:95 `practise` after `teach`; petals on the route WR:43 (row: Node 2: repeat with a petal arc.) |
| LEDGER-ENGINE-GEMINI.md:555 | USED-VIA | WR:95 `practise`; animal tricks not ruled (row: Node 3: primary mechanic plus an animal trick or branch type.) |
| LEDGER-ENGINE-GEMINI.md:556 | USED-VIA | WR:96 `fork` high/low; rooms kept as built (row: Node 4: high/low split or puzzle room as mid-stage relief.) |
| LEDGER-ENGINE-GEMINI.md:557 | LATER WORLD | W2-W10 twist: an earlier world's mechanic (WR:99 "W2 on") (row: Node 5: world mutator or second hazard in counterpoint.) |
| LEDGER-ENGINE-GEMINI.md:558 | USED-VIA | WR:98 `test`: taught moves under pressure (row: Node 6: first climax, a multi-move chain (vine → bounce → stomp).) |
| LEDGER-ENGINE-GEMINI.md:559 | USED-VIA | WR:100 `finale` / the moment WR:115 (row: Node 7: mastery combining all.) |
| LEDGER-ENGINE-GEMINI.md:560 | CONTRADICTED | WR:100-101: a dense 15-20 s `finale` (L02:78, primary research) or, by the brief's `ends: quiet`, a quiet `arrival` held to the rest rule (the rulebook's JUDGMENT item 1). Primary research outranks the Gemini cool-down; the quiet exception goes to Matt (row: Node 8: 8.5 s cooldown sprint to the exit; ours wants a few seconds.) |
| LEDGER-ENGINE-GEMINI.md:561 | NOT TAKEN | tooling: physics (row: Per-frame Euler is wrong for our physics.) |
| LEDGER-ENGINE-GEMINI.md:562 | NOT TAKEN | tooling: physics (row: Landing frame and double at apex; keep ours.) |
| LEDGER-ENGINE-GEMINI.md:563 | NOT TAKEN | tooling: bot tries (first-timer bots, ES CP2) (row: Clumsy thumb incl. a mistimed second flick; add an off-apex double to the tracer's tries.) |
| LEDGER-ENGINE-GEMINI.md:564 | NOT TAKEN | tooling: margins explained by jumpOK (ES C20 L2211) (row: Safe-reach formula as the explanation of margins.) |
| LEDGER-ENGINE-GEMINI.md:565 | NOT TAKEN | input timing is engine work (Easy setting), not stage generation (row: Easy: 5 frames early (167 ms) instead of ±100 ms.) |
| LEDGER-ENGINE-GEMINI.md:566 | CONTRADICTED | ES C1 L1748, L1843: gap share shapes stride, not difficulty; drawn per roll. Measured outranks the Gemini summary (row: Gap share linear in tension, inside the level check's cap.) |
| LEDGER-ENGINE-GEMINI.md:567 | USED-VIA | the difficulty dial gap row (row: Starting gap ranges for single and double, to calibrate.) |
| LEDGER-ENGINE-GEMINI.md:568 | USED-VIA | as EG:289 (dial landing width) (row: Tension-scaled platform width floor.) |
| LEDGER-ENGINE-GEMINI.md:569 | USED-VIA | as EG:289 (dial landing width; G L1844 disagrees) (row: Pads 154-308 px against our 90 px floor.) |
| LEDGER-ENGINE-GEMINI.md:570 | NOT TAKEN | role table not ruled; LABELS (adopted) binds animals by element (row: Every animal bound to a platform role in data.) |
| LEDGER-ENGINE-GEMINI.md:571 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (snake deck size not ruled) (row: Snake: flat combat deck ≥5 W, 1.5 W runway.) |
| LEDGER-ENGINE-GEMINI.md:572 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (boa ≥ 3.5 body widths from entry, ES G L1842) (row: Coiled boa as gatekeeper ≥3.5 W from entry, blocking a bridge, rope or seed.) |
| LEDGER-ENGINE-GEMINI.md:573 | NOT TAKEN | eagle sky rule not ruled beyond LABELS' element (open sky) (row: Eagle needs 4 s of open sky; never over breaking branches.) |
| LEDGER-ENGINE-GEMINI.md:574 | NOT TAKEN | cat runway not ruled; cats on the ground by LABELS (row: Stalking cat: ≥8 W runway with a vine or mushroom escape.) |
| LEDGER-ENGINE-GEMINI.md:575 | LATER WORLD | W5 spiders (row: Spider drops on silk above ropes or chimneys.) |
| LEDGER-ENGINE-GEMINI.md:576 | NOT TAKEN | wrong by its own row (capuchins never hurt) (row: Monkey throws fruit from a perch (wrong: capuchins never hurt).) |
| LEDGER-ENGINE-GEMINI.md:577 | USED-VIA | adopted difficulty dial (L645) (row: Enemy rate rises with world.) |
| LEDGER-ENGINE-GEMINI.md:578 | USED-VIA | adopted difficulty dial (L645); partial (row: Easy 3.5→6.65/min, Normal 5.5→11.35/min.) |
| LEDGER-ENGINE-GEMINI.md:579 | NOT TAKEN | enemy time spacing not ruled (row: Time spacing between enemies, floors 4.5 s Easy, 2.5 s Normal.) |
| LEDGER-ENGINE-GEMINI.md:580 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: Pairwise threat cap, numbers to define ourselves.) |
| LEDGER-ENGINE-GEMINI.md:581 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (row: 1.0 s (~285 px) flat runway before an enemy trigger.) |
| LEDGER-ENGINE-GEMINI.md:582 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal; (seed and find counts come from `must`) (row: Petal goal 75%; 3 golden seeds a stage; 1-2 hidden finds; set goals from bots.) |
| LEDGER-ENGINE-GEMINI.md:583 | NOT TAKEN | 70/15/15 split not ruled (ES L826-827 is a 1-5 fork-mark ruling) (row: Petals 70% shared, 15% high road, 15% low road.) |
| LEDGER-ENGINE-GEMINI.md:584 | NOT TAKEN | single-pass yield not ruled (row: Single-pass yield 0.85 of total.) |
| LEDGER-ENGINE-GEMINI.md:585 | NOT TAKEN | forgiveness margin not ruled (row: Forgiveness margin (0.85−0.75)/0.85.) |
| LEDGER-ENGINE-GEMINI.md:588 | USED-VIA | adopted placement rules (L304); partial (row: Seed 1 on the split's risky road, seed 2 in the puzzle room, seed 3 on a late skill branch.) |
| LEDGER-ENGINE-GEMINI.md:589 | CONTRADICTED | as EG:301 (Smith §5 vs WR:122) (row: No adjacent identical substring length 1-4; no symbol 3 running.) |
| LEDGER-ENGINE-GEMINI.md:590 | NOT TAKEN | replaced by the game's era/lookalike (WR:52) (row: Normalized bigram entropy ≥ 0.68.) |
| LEDGER-ENGINE-GEMINI.md:591 | USED-VIA | WR:52 the game's own measure, capped (ES C14 L1761) (row: Don't take Levenshtein/Jaccard; cap our own metric.) |
| LEDGER-ENGINE-GEMINI.md:592 | NOT TAKEN | no builder buffer ruled; the builder reads the checker's measure (ES L253-259) (row: Builder cap with a buffer under the checker's 45-55% zone.) |
| LEDGER-ENGINE-GEMINI.md:593 | NOT TAKEN | 70/15/15 split not ruled (row: Budget table: petals 70/15/15 = 100.) |
| LEDGER-ENGINE-GEMINI.md:594 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal; (margin/unvisited split not ruled) (row: Budget table: goal 75, margin 10, unvisited 15.) |
| LEDGER-ENGINE-GEMINI.md:596 | USED-VIA | adopted placement rules (L284) (row: A miss always costs something, without bottomless-pit rage.) |
| LEDGER-ENGINE-GEMINI.md:598 | LATER WORLD | W5 silk / later mud and brambles (row: Tier 2: drop into mud or silk or brambles (1 HP or 10 s slow).) |
| LEDGER-ENGINE-GEMINI.md:599 | USED-VIA | WR:43 a flag before every hard part (ES C10 L1757) (row: Tier 3: −1 HP, respawn at the current group on climaxes.) |
| LEDGER-ENGINE-GEMINI.md:600 | CONTRADICTED | the adopted dial (ES L628-635): d rises linearly with s inside a world; STAGE_HEAT's stage dips dropped (C17). Breathers come inside each stage from WR:108 (a rest after every test and twist). The designer's measured ruling outranks the Gemini summary (row: A linear difficulty ramp fatigues; stages need breathers (STAGE_HEAT sawtooth).) |
| LEDGER-ENGINE-GEMINI.md:601 | USED-VIA | the adopted dial follows SR §1b (ES C17 L1765) (row: Gemini's D(w,s) contradicts SR §1b.) |
| LEDGER-ENGINE-GEMINI.md:602 | LATER WORLD | W2-W10 first stages (ES C17 L1764) (row: World stage 9 → next world stage 1 drop of 0.20; its own claim is wrong.) |
| LEDGER-ENGINE-GEMINI.md:603 | USED-VIA | adopted difficulty dial (L628) (row: Relief dips at stages 4 and 7 in every world (contradicts ours).) |
| LEDGER-ENGINE-GEMINI.md:604 | NOT TAKEN | flow score not ruled (row: Flow score, after calibrating on Matt's ratings.) |
| LEDGER-ENGINE-GEMINI.md:605 | NOT TAKEN | not ruled (row: Curve fidelity: 1 − mean gap between measured and planned tension.) |
| LEDGER-ENGINE-GEMINI.md:606 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research (row: "On the beat" share of the bot's take-offs.) |
| LEDGER-ENGINE-GEMINI.md:607 | NOT TAKEN | replaced by era/lookalike (WR:52) (row: Variety term min(1, H2/0.75)·(1 − max Sim).) |
| LEDGER-ENGINE-GEMINI.md:608 | USED-VIA | WR:111-114 trend; variety gate L40 (partial) (row: Vertical term: fewer stalled frames, more elevation spread.) |
| LEDGER-ENGINE-GEMINI.md:609 | USED-VIA | WR:96 fork both roads walkable (row: Agency: split or loop with both roads viable; adopt the split check.) |
| LEDGER-ENGINE-GEMINI.md:610 | NOT TAKEN | flow score not ruled (row: Accept at ≥80 with zero hard violations.) |
| LEDGER-ENGINE-GEMINI.md:611 | USED-VIA | WR §1 the brief; lines measured per world (ES L1805) (row: Profile once, spec overrides ~20 lines, patterns beat-relative with no px.) |
| LEDGER-ENGINE-GEMINI.md:613 | NOT TAKEN | tempo/meter fields not taken (ES L1120); WR §2 is W1's profile (row: WorldProfile example: id, name, tempo, frames per beat, meter.) |
| LEDGER-ENGINE-GEMINI.md:614 | LATER WORLD | W4 wind, W10 storm mutators (ES §C L1550-1561) (row: Mutator slot: periodic gust with cycle and telegraph.) |
| LEDGER-ENGINE-GEMINI.md:615 | CONTRADICTED | pacing P7 (adopted, ES L2003): Normal crumble 0.5 s (15 frames), not 20; mud and silk are not W1 surfaces. P7 outranks the Gemini summary (row: Kinematic modifiers: creak delay 36/20 frames; mud ×0.55; silk ×0.45.) |
| LEDGER-ENGINE-GEMINI.md:616 | USED-VIA | LABELS (adopted) element table binds animals per element (row: allowedAnimals roster per world.) |
| LEDGER-ENGINE-GEMINI.md:618 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker (row: lockoutCooldownDraws 4.) |
| LEDGER-ENGINE-GEMINI.md:619 | USED-VIA | WR §1 brief and WR:49 map shape per roll; the seed is the roll (row: StageSpec: id, world, seed, mapShape.) |
| LEDGER-ENGINE-GEMINI.md:620 | USED-VIA | WR §6 `pair` field (row: Primary, secondary and support mechanics: the stage's pair.) |
| LEDGER-ENGINE-GEMINI.md:621 | NOT TAKEN | beat feel not taken (ES L1120 the player's rhythm); `look` and `beat` carry feel (row: rhythmMotifBeats as the stage's beat feel.) |
| LEDGER-ENGINE-GEMINI.md:622 | NOT TAKEN | puzzle and split node indexes: no node list (WR:21); forks roll (WR:125) (row: puzzleBlueprintId, puzzleNodeIndex, splitNodeIndex.) |
| LEDGER-ENGINE-GEMINI.md:623 | NOT TAKEN | cause and effect not ruled (ES L1806) (row: causeEffectOut: a flag in this stage changes the next.) |
| LEDGER-ENGINE-GEMINI.md:624 | NOT TAKEN | cause and effect not ruled (row: causeEffectIn: a required flag opens a bonus shortcut node.) |
| LEDGER-ENGINE-GEMINI.md:625 | NOT TAKEN | example node, not a rule (row: Example node 1: KI tension 0.20, 2 groups, EAST, tier-1 miss.) |
| LEDGER-ENGINE-GEMINI.md:626 | NOT TAKEN | example node, not a rule (row: Example node 2: KI 0.35, EAST_UP, tier 1.) |
| LEDGER-ENGINE-GEMINI.md:627 | NOT TAKEN | example node, not a rule (row: Example node 3: SHO 0.55, SPLIT_E, tier-2 branch drop.) |
| LEDGER-ENGINE-GEMINI.md:628 | NOT TAKEN | example node, not a rule (row: Example node 4: SHO 0.45, PUZZLE_BOX.) |
| LEDGER-ENGINE-GEMINI.md:629 | NOT TAKEN | example node, not a rule (row: Example node 5: TEN 0.75, UP_CHIMNEY.) |
| LEDGER-ENGINE-GEMINI.md:630 | NOT TAKEN | example node, not a rule (row: Example node 6: TEN 0.85, EAST_DOWN.) |
| LEDGER-ENGINE-GEMINI.md:631 | NOT TAKEN | example node, not a rule (row: Example node 7: KETSU 1.00, EAST_FAST, tier-3 group reset.) |
| LEDGER-ENGINE-GEMINI.md:632 | CONTRADICTED | as EG:560: WR:100-101 finale or quiet arrival, not a low-tension close; primary research wins, the quiet exception is Matt's call (row: Example node 8: KETSU 0.25, EAST_EXIT.) |
| LEDGER-ENGINE-GEMINI.md:633 | NOT TAKEN | library header data (ES CP2 L65-67); slope limit not ruled (row: Pattern header: required mechanics, move signature, beats, aspect-safe max slope 28°.) |
| LEDGER-ENGINE-GEMINI.md:634 | NOT TAKEN | library step data (ES CP2 L72) (row: Pattern step: beat, move, platform, role, enemy slot, petal arc.) |
| LEDGER-ENGINE-GEMINI.md:635 | USED-VIA | adopted difficulty dial (L647) (row: Vine step with a 2-beat swing; clashes with our self-swinging lianas.) |
| LEDGER-ENGINE-GEMINI.md:636 | USED-VIA | WR:36-38, WR:119 a fall lands on something; catch boughs in tree sections (row: Pattern miss-floor field: drop onto a rotten catch branch, climb back.) |
| LEDGER-ENGINE-GEMINI.md:637 | USED-VIA | adopted difficulty dial (L643) (row: Internal clash: a 2-beat rest on a 20-frame creaking branch is a fall.) |
| LEDGER-ENGINE-GEMINI.md:638 | NOT TAKEN | tooling: seed streams (row: Hashed seed sub-streams per node, group and pass.) |
| LEDGER-ENGINE-GEMINI.md:639 | USED-VIA | adopted placement rules (L313); partial: chimney as map value, our view sizes (row: Worked topology with splits, chimney switchbacks, view sizes not ours.) |
| LEDGER-ENGINE-GEMINI.md:640 | NOT TAKEN | example breaking its own rule, not a rule (row: Example N1 string breaks its own length-2 repeat ban.) |
| LEDGER-ENGINE-GEMINI.md:642 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker (row: Example N3A reuses a pattern inside its own 4-draw lockout.) |
| LEDGER-ENGINE-GEMINI.md:643 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker (row: Example N3B reuses a pattern 3 draws later, inside the lockout.) |
| LEDGER-ENGINE-GEMINI.md:646 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker; (template ≤ twice a stage, idea ≤ 40%: ES C6 L1753, G L1839) (row: Example N6 draws the same pattern a third time.) |
| LEDGER-ENGINE-GEMINI.md:647 | NOT TAKEN | example, not a rule; enemy spacing not ruled (row: Example N7: 4 enemies in 16.8 s breaks its own ≥6 s spacing.) |
| LEDGER-ENGINE-GEMINI.md:648 | USED-VIA | WR:101 `arrival` is a quiet walk-on held to the rest rule (ends: quiet); a finale otherwise (row: Example N8: 8.5 s victory outro, longer than W1P wants.) |
| LEDGER-ENGINE-GEMINI.md:651 | USED-VIA | WR §1-§4: the brief is data; the engine lays geometry (row: Never have the AI emit raw geometry; cost ∝ repair rounds.) |
| LEDGER-ENGINE-GEMINI.md:653 | NOT TAKEN | tooling: types (row: types.ts: WorldProfile, StageSpec, MesoPattern, BeatTrace, DiagnosticReport.) |
| LEDGER-ENGINE-GEMINI.md:654 | NOT TAKEN | tooling: seed per pass (row: forkSeed per pass so enemy edits never move platforms.) |
| LEDGER-ENGINE-GEMINI.md:655 | USED-VIA | WR:49 map shapes; no box layout (WR:21) (row: topology.ts: 4 shapes × 8 nodes → non-overlapping boxes.) |
| LEDGER-ENGINE-GEMINI.md:656 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker; (entropy not taken; cross-stage lookalike is WR:52) (row: deck.ts: lockout, bigram entropy, cross-stage n-gram repulsion.) |
| LEDGER-ENGINE-GEMINI.md:658 | USED-VIA | adopted placement rules (L270); partial: no roles, seeds or tiers (row: decorator.ts: roles, 70/15/15 arcs, 3 seeds, 3-tier miss floors.) |
| LEDGER-ENGINE-GEMINI.md:660 | NOT TAKEN | tooling: blame log format (row: Blame log JSON: module, location, violation, measured, limit, exact fix.) |
| LEDGER-ENGINE-GEMINI.md:663 | NOT TAKEN | tooling: tracer (ES P4) (row: Auto-heal 1: short landing ≤48 px extended both ways.) |
| LEDGER-ENGINE-GEMINI.md:664 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370); (checked, not auto-filled: ES L510) (row: Auto-heal 2: run over 2.5 s split with a beat hop or mushroom.) |
| LEDGER-ENGINE-GEMINI.md:665 | USED-VIA | WR:122 no idea twice in a row, across seams too (row: Auto-heal 3: repeated 3-move run at a seam → swap in the runner-up pattern.) |
| LEDGER-ENGINE-GEMINI.md:668 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: Upright view gives 0.45 s lookahead vs 1.2 s sideways; measure ours.) |
| LEDGER-ENGINE-GEMINI.md:669 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: Name the both-views sightline box as a px constant.) |
| LEDGER-ENGINE-GEMINI.md:673 | NOT TAKEN | W1 asks no punch or kick; combat tracing not ruled (row: Gesture cooldown in the tracer once combat is traced.) |
| LEDGER-ENGINE-GEMINI.md:688 | USED-VIA | adopted water W1-W12 (L1894); partial: nothing for ropes, silk, mud (row: Sloth velocity paradox: a slow-down with no extra decisions feels like molasses.) |
| LEDGER-ENGINE-GEMINI.md:689 | NOT TAKEN | not ruled (MISSING), no ES line or measure (row: Inverse Velocity-Threat Law as builder rule and validator flag.) |
| LEDGER-ENGINE-GEMINI.md:690 | NOT TAKEN | cause and effect not ruled (row: Cause-and-effect on the main path explodes the layouts to check.) |
| LEDGER-ENGINE-GEMINI.md:691 | NOT TAKEN | cause and effect not ruled (row: Contain it to node-2 or node-4 bonus changes.) |
| LEDGER-ENGINE-GEMINI.md:702 | NOT TAKEN | tooling: batch checks (row: Batch check every stage on both settings.) |
| LEDGER-ENGINE-GEMINI.md:704 | NOT TAKEN | tooling yield; WR:52 gates judge 16 rolls (row: Constructive yield ≥85% raw, ≥98% healed.) |
| LEDGER-ENGINE-GEMINI.md:705 | USED-VIA | WR:52 lookalike vs every engine-built stage; no world-mean line (partial) (row: Similarity ≤42% max pairwise, <32% world mean.) |
| LEDGER-ENGINE-GEMINI.md:707 | ADOPT | Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370); (2.5 s, ES L510; the 2.2 s Gemini number is not taken) (row: Max rest ≤2.2 s; 100% of slow-downs active.) |
| LEDGER-ENGINE-GEMINI.md:708 | ADOPT | The first-timer bot's clock is judged too: 180-300 s (2-5 min) a stage (ES §Stage length L664-667, G L1852); WR:41/65 bind only the quick clock; (skilled band already WR:65) (row: 120-150 s skilled, 180-300 s first-timer.) |
| LEDGER-ENGINE-GEMINI.md:709 | ADOPT | At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171) (row: 0 blind leaps upright or sideways.) |
| LEDGER-ENGINE-GEMINI.md:710 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal; (single-pass yield not ruled) (row: Exactly 85% single-pass petal yield.) |
| LEDGER-ENGINE-GEMINI.md:711 | NOT TAKEN | flow score not ruled (row: Flow ≥82 on all 100 stages.) |
| LEDGER-ENGINE-PAPERS.md:43 | USED-VIA | WR §4 constructive; gates confirm (ES L259, L513); beat placement ruled out (ES L1120) (row: Build by construction under Pokey's simulated feet on the beat; checks confirm rather than select) |
| LEDGER-ENGINE-PAPERS.md:45 | USED-VIA | LABELS (adopted) labels entry/exit, moves and teaching; coverage table not ruled (partial) (row: Library labels entry/exit, difficulty and mechanic; a coverage table of combinations; cap universal connectors) |
| LEDGER-ENGINE-PAPERS.md:50 | USED-VIA | WR:121 decks draw library ideas, traced by the tracer (row: Named multi-beat patterns (staircase, pit, vine chain), each traced, never hand-placed) |
| LEDGER-ENGINE-PAPERS.md:53 | USED-VIA | WR:115 the moment is placed by the grammar; pinning by hand not taken (row: Mixed-initiative: pin the signature moment by hand; the engine fills the rest on the beat) |
| LEDGER-ENGINE-PAPERS.md:56 | USED-VIA | adopted difficulty dial (L626) (row: Difficulty curve as a build input carried by the stage spec, honoured per node) |
| LEDGER-ENGINE-PAPERS.md:93 | NOT TAKEN | coverage table not ruled; the 39 G rows' pool size rule (ES G #7 L1838) is the variety lever (row: Coverage table: every (entry, exit, difficulty) combination must exist, else generation breaks or scrapes by) |
| LEDGER-ENGINE-PAPERS.md:95 | CONTRADICTED | ES L503: Easy's breather pad between nodes stands; the rulebook has no fixed seam (WR:21), so seam likeness is judged by the lookalike gate (WR:52). The measured ES ruling outranks the paper's proposal (row: Cap universal connectors; nothing measures how alike node seams look) |
| LEDGER-ENGINE-PAPERS.md:98 | CONTRADICTED | ES C7 L1754 and WR:29: pieces belong to their world, no other world's piece ever (Matt 11-05, "It can't just be using any piece from any world"). Matt wins (row: Named multi-beat patterns form a layer every world shares) |
| LEDGER-ENGINE-PAPERS.md:100 | NOT TAKEN | pinning not ruled (WR:21: no one writes a plan) (row: Pin chosen pieces, regenerate the rest around them) |
| LEDGER-ENGINE-PAPERS.md:102 | NOT TAKEN | pacing as bars not taken (ES L1120) (row: Re-pace a stage without touching its geometry) |
| LEDGER-ENGINE-PAPERS.md:104 | USED-VIA | the adopted dial (ES 624-661) is the build input; numbers per C1 L1748 (partial) (row: Difficulty curve as a build input, piece by piece) |
| LEDGER-ENGINE-PAPERS.md:106 | NOT TAKEN | tooling: search (row: A search steered by the error instead of random retries) |
| LEDGER-ENGINE-PAPERS.md:109 | USED-VIA | floors WR:64 (old 1-1's per-view caps) and the share cap (ES variety gate L33); dead pieces not reported (partial) (row: Piece-use spread over many rolls finds dead and hogging pieces) |
| LEDGER-ENGINE-PAPERS.md:112 | NOT TAKEN | tooling: gate design rule for gates.md (row: A checker that can only be wrong in the safe direction, written as a gate rule) |
| LEDGER-ENGINE-PAPERS.md:115 | NOT TAKEN | ES C1 L1748 keeps avoided-line hazards OPEN; W1 first stages have none (WR:40) (row: Terrain first, then hazards and enemies by a second pass on the lines Pokey avoids) |
| LEDGER-ENGINE-PAPERS.md:117 | USED-VIA | adopted placement rules (L280); polish pass P-/S- (L775) (row: Adjacency by look, not only by height) |
| LEDGER-ENGINE-PAPERS.md:118 | USED-VIA | WR:64 floors from old 1-1; library seeded from main (ES L2108) (row: Seed the library from levels already judged good) |
| LEDGER-ENGINE-PAPERS.md:154 | USED-VIA | WR:51 bursts by time 5-20 s (not beat-derived) (row: The beat sets each pattern's length (NodeSpec bpm, bars)) |
| LEDGER-ENGINE-PAPERS.md:155 | NOT TAKEN | research mapping, not a rule (row: Tanagra's five single-beat patterns map to ours: platform, gap, enemy, crumble, mushroom spring) |
| LEDGER-ENGINE-PAPERS.md:156 | NOT TAKEN | library design note (ES CP2 L78) (row: Multi-beat patterns with their own rules; a staircase varies one number each step) |
| LEDGER-ENGINE-PAPERS.md:157 | NOT TAKEN | tooling: reachability by the tracer (ES P4) (row: Gap rule: zero width means non-zero height, never a jump over nothing) |
| LEDGER-ENGINE-PAPERS.md:158 | NOT TAKEN | tooling (row: Replace fitSteps' 160 random tries with a small error-steered search) |
| LEDGER-ENGINE-PAPERS.md:159 | NOT TAKEN | pinned nodes not ruled (WR:21) (row: Pinned hand-built nodes; the generator traces the nodes between, matching their exit heights) |
| LEDGER-ENGINE-PAPERS.md:160 | NOT TAKEN | pacing as bars not taken (ES L1120) (row: Pacing edit without geometry: the spec lists each node's bars, the generator retraces) |
| LEDGER-ENGINE-PAPERS.md:161 | USED-VIA | adopted placement rules (L278) (row: Edge labels: each pattern declares entry and exit height and surface) |
| LEDGER-ENGINE-PAPERS.md:162 | NOT TAKEN | coverage check not ruled (row: Coverage check: each world profile's (entry, exit, tier, mechanic pair) has at least 3 patterns) |
| LEDGER-ENGINE-PAPERS.md:163 | CONTRADICTED | ES L503: Easy's breather pad at every seam stands; apron not varied. As EP:95, the measured ruling wins (row: Cap or vary the 200 px apron and count seam repeats) |
| LEDGER-ENGINE-PAPERS.md:164 | USED-VIA | adopted difficulty dial (L643); partial: no per-node target (row: Curve as input: a per-node density target checked against measured density) |
| LEDGER-ENGINE-PAPERS.md:165 | NOT TAKEN | whole-game 200-roll gates (ES G #86 L1853); per-piece spread not ruled (row: Piece-use spread over 200 rolls per world) |
| LEDGER-ENGINE-PAPERS.md:166 | NOT TAKEN | tooling: gates.md rule (row: Safe-direction checker written into gates.md for every new gate) |
| LEDGER-ENGINE-PAPERS.md:167 | ADOPT | Every gate (pacing, flags, dead time) judges both roads of every fork, not only the bot's route (EP:167, EP:242) (row: Single-route checker blind spot: a split stage's other road may go unjudged) |
| LEDGER-ENGINE-PAPERS.md:168 | NOT TAKEN | terrain-then-enemies not ruled; W1 first stages have no enemies (WR:40) (row: Terrain then enemies (hazardSpots after the trace)) |
| LEDGER-ENGINE-PAPERS.md:169 | USED-VIA | WR:64 floors from main's old 1-1 (ES L2108) (row: Seed the library from the rebuilt 1-1 to 1-5 nodes) |
| LEDGER-ENGINE-PAPERS.md:175 | USED-VIA | the difficulty dial's stage risk budget E[lives] (C16), judged by bots (row: A pattern's difficulty tier comes from the clumsy trace and bots, not an obstacle count) |
| LEDGER-ENGINE-PAPERS.md:180 | USED-VIA | WR:4 seeded rolls; pinning not taken (row: Batch, seeded, deterministic output; pinning and pacing edits as spec features) |
| LEDGER-ENGINE-PAPERS.md:190 | USED-VIA | WR:50 spike, rest and forks placed per roll (ES ruling 4 L1795); WFC not taken (row: Anxiety curves plus rhythm metadata plus WFC give variety and difficulty control) |
| LEDGER-ENGINE-PAPERS.md:191 | USED-VIA | adopted placement rules (L272) (row: Pure randomness is unplayable or boring; aim for playable, challenging, interesting) |
| LEDGER-ENGINE-PAPERS.md:192 | NOT TAKEN | fun gate pacing flags are the funcheck gate (CLAUDE.md), not a rulebook rule (row: Fun judged by flow or an anxiety curve) |
| LEDGER-ENGINE-PAPERS.md:200 | USED-VIA | adopted difficulty dial (L626) (row: Anxiety curve as an input: pick a difficulty curve, map it to obstacles) |
| LEDGER-ENGINE-PAPERS.md:201 | USED-VIA | WR:52 variety gates; playability by the level check (row: Two tests: variety under adjacency rules; playable start to finish) |
| LEDGER-ENGINE-PAPERS.md:202 | NOT TAKEN | tooling: reachability (row: Impossible means a gap too wide or a wall too high) |
| LEDGER-ENGINE-PAPERS.md:204 | USED-VIA | WR:108 a rest after every test and twist (row: Rhythm groups: a challenge ending in a short rest) |
| LEDGER-ENGINE-PAPERS.md:205 | NOT TAKEN | portals not in W1's kit (row: Portals switch paths (pipes, moving platforms)) |
| LEDGER-ENGINE-PAPERS.md:207 | USED-VIA | adopted placement rules (L278); partial: not placed around simulated positions (row: ORE: chunks placed around the player's possible positions; joining chunks is hard to tune) |
| LEDGER-ENGINE-PAPERS.md:208 | NOT TAKEN | adaptive help not ruled; WR:43 flags before hard parts (row: Adaptive difficulty: help after deaths, slower hazards, continue points) |
| LEDGER-ENGINE-PAPERS.md:209 | USED-VIA | adopted difficulty dial (L626) (row: Anxiety curve judged on the level without play; curve first) |
| LEDGER-ENGINE-PAPERS.md:210 | USED-VIA | adopted difficulty dial (L651) (row: Validation: each obstacle passable with timing leniency, plus count of distinct levels) |
| LEDGER-ENGINE-PAPERS.md:216 | NOT TAKEN | library data; per-piece tier not ruled (row: Pieces cut from real levels; edge heights drive adjacency; difficulty judged per piece) |
| LEDGER-ENGINE-PAPERS.md:217 | USED-VIA | adopted placement rules (L278) (row: Height bands LOW, MID, TOP; only matching labels may touch) |
| LEDGER-ENGINE-PAPERS.md:218 | USED-VIA | adopted placement rules (L282) (row: Adjacency labels rule out unreachable joins) |
| LEDGER-ENGINE-PAPERS.md:220 | NOT TAKEN | coverage table not ruled (row: 27 combinations; 12 missing; a missing combination breaks generation; add pieces) |
| LEDGER-ENGINE-PAPERS.md:221 | USED-VIA | adopted difficulty dial (L643); partial: no per-piece tier (row: Difficulty v2 counts obstacles; ours should take tier from clumsy trace and bots) |
| LEDGER-ENGINE-PAPERS.md:222 | USED-VIA | never a reroll (ES L259); WR:121 decks; new pieces from art (CLAUDE.md variety rule) (row: Fill missing combinations with new hand-made pieces, never by rerolling) |
| LEDGER-ENGINE-PAPERS.md:224 | NOT TAKEN | library data (row: A pattern may declare several entry heights) |
| LEDGER-ENGINE-PAPERS.md:225 | CONTRADICTED | ES L503 (Easy 2-3 s breather) stands; L799's fixed Normal pad withdrawn by C2 (L1749), so Normal rests are WR:97's 2× local beat. As EP:95 (row: Only 3 all-connector pieces, since more lower variety; cap or vary our apron) |
| LEDGER-ENGINE-PAPERS.md:228 | USED-VIA | WR:11 the arrive section draws from its deck per roll (opening varies) (row: Curve applied after the first piece so the opening position varies) |
| LEDGER-ENGINE-PAPERS.md:230 | USED-VIA | adopted difficulty dial (L655) (row: The curve filters each slot; flat curves keep difficulty while height varies) |
| LEDGER-ENGINE-PAPERS.md:231 | USED-VIA | adopted difficulty dial (L655) (row: Rising and peak curves; our curve is richer, keep it) |
| LEDGER-ENGINE-PAPERS.md:232 | USED-VIA | WR:52 gates judge variety; fun judged by Matt (row: Judge variety and completability, not good or bad; we also judge fun) |
| LEDGER-ENGINE-PAPERS.md:234 | NOT TAKEN | ES L259: no coverage table (row: Runs stopped short when a combination was missing) |
| LEDGER-ENGINE-PAPERS.md:235 | NOT TAKEN | all-pieces-used is a game-level rule (ES G #10 L1850), not a W1 stage rule (row: Variety means all pieces used, and how often they repeat) |
| LEDGER-ENGINE-PAPERS.md:236 | NOT TAKEN | tooling: report (row: Most and least used counts, mean and spread per piece across all rolls) |
| LEDGER-ENGINE-PAPERS.md:237 | NOT TAKEN | tooling: report (hogs via the share cap) (row: High spread means hogs and dead pieces; report both) |
| LEDGER-ENGINE-PAPERS.md:238 | USED-VIA | WR §4 constructive (ES L259) (row: Check after generating and discard failures; ours builds by construction) |
| LEDGER-ENGINE-PAPERS.md:239 | NOT TAKEN | tooling: tracer (row: Landing tested against the jump arc) |
| LEDGER-ENGINE-PAPERS.md:240 | NOT TAKEN | tooling: tracer (row: A platform reachable before the arc's peak counts as reachable) |
| LEDGER-ENGINE-PAPERS.md:242 | ADOPT | Every gate (pacing, flags, dead time) judges both roads of every fork, not only the bot's route (EP:167, EP:242) (row: Checker tests only the lowest path, so other routes go unjudged) |
| LEDGER-ENGINE-PAPERS.md:244 | NOT TAKEN | terrain-then-enemies not ruled (row: Future: terrain first, then a second pass for enemies) |
| LEDGER-ENGINE-PAPERS.md:245 | NOT TAKEN | research note (ORE); not a rule (row: ORE makes new pieces that WFC combines; patterns generated from bars) |
| LEDGER-ENGINE-PAPERS.md:246 | CONTRADICTED | ES C7 L1754, WR:29: no mixing other worlds' tile sets (Matt 11-05, "no lava in the forest"). Matt wins (row: Other games' tile sets; mixing styles) |
| LEDGER-ENGINE-PAPERS.md:247 | USED-VIA | adopted placement rules (L280) (row: Adjacency by look for visual cohesion) |
| LEDGER-ENGINE-PAPERS.md:248 | NOT TAKEN | tooling: gate design (support.py errs toward failing) (row: Checker gives only false negatives; a gate may only err toward failing) |
| LEDGER-ENGINE-PAPERS.md:249 | USED-VIA | adopted placement rules (L276) (row: A new game needs its own validity definition and checker) |
| LEDGER-ENGINE-PAPERS.md:250 | USED-VIA | WR §5 and CP5: Matt plays (fun is judged in play) (row: Fun is subjective; only building and playing shows it) |
| LEDGER-ENGINE-PAPERS.md:252 | NOT TAKEN | tooling (solver) (row: Tanagra: reactive planning plus constraint solving, always playable) |
| LEDGER-ENGINE-PAPERS.md:253 | NOT TAKEN | process note (CP4 pass line), not a generator rule (row: Designers replay a level many times before showing anyone) |
| LEDGER-ENGINE-PAPERS.md:254 | NOT TAKEN | pinning not ruled (row: A small edit forces wide changes elsewhere; pinned nodes plus local retrace) |
| LEDGER-ENGINE-PAPERS.md:255 | NOT TAKEN | mixed-initiative not ruled (row: Mixed-initiative: alternatives fast, regenerate only chosen parts) |
| LEDGER-ENGINE-PAPERS.md:257 | NOT TAKEN | pacing as bars not taken (ES L1120) (row: Change a level's pacing without touching geometry) |
| LEDGER-ENGINE-PAPERS.md:258 | NOT TAKEN | tooling (solver) (row: Geometry relations as constraints so no unplayable level is produced) |
| LEDGER-ENGINE-PAPERS.md:259 | USED-VIA | WR:51 bursts by time from action frequency (ES L496) (row: Beats are the frequency of player actions and model rhythm and pacing) |
| LEDGER-ENGINE-PAPERS.md:260 | USED-VIA | WR:51 bursts 5-20 s (row: Beats are the glue that size and join patterns) |
| LEDGER-ENGINE-PAPERS.md:262 | NOT TAKEN | library design note (row: Patterns as behaviours; the simplest span one beat) |
| LEDGER-ENGINE-PAPERS.md:263 | NOT TAKEN | library design note (row: Multi-beat patterns with extra rules (equal-height staircase); ours varies by choice) |
| LEDGER-ENGINE-PAPERS.md:264 | USED-VIA | adopted difficulty dial (L640); partial: no solver (row: Components carry position and size as constraint variables) |
| LEDGER-ENGINE-PAPERS.md:265 | USED-VIA | WR:51 bursts sized by time (row: Pattern length must match its beat's duration under a movement model) |
| LEDGER-ENGINE-PAPERS.md:266 | NOT TAKEN | library naming note (row: Five single-beat and two multi-beat patterns; name our multi-beat patterns) |
| LEDGER-ENGINE-PAPERS.md:268 | NOT TAKEN | tooling: reachability (row: Gap constraints: zero width means non-zero height and vice versa) |
| LEDGER-ENGINE-PAPERS.md:269 | NOT TAKEN | tooling: solver feedback (row: Solver reports back so planning continues; error-steered search) |
| LEDGER-ENGINE-PAPERS.md:270 | NOT TAKEN | pinning not ruled (row: Designer-modified platforms stay while the rest regenerates) |
| R1-shipped-pipelines.md:30 | USED-VIA | WR:121 decks of designed ideas; sizes roll (WR:128) (row: Shipped hybrids use big whole hand-made units; the generator only picks and orders them, never invents geometry.) |
| R1-shipped-pipelines.md:39 | NOT TAKEN | ES C6 L1753, ruling 8 L1799 deferred: no-repeat only if a run beats the cap; save-wide ledger not ruled (row: No unit repeats inside a level, and the save remembers every unit already shown (SMBF, Shovel Knight).) |
| R1-shipped-pipelines.md:48 | ADOPT | W1's section pool holds at least 14 distinct section types, more whenever a stage only scrapes past the variety gates (ES C24 L1771; CLAUDE.md variety rule, Matt 10-30) (row: Pool several times bigger than one level's slots, cut per level; count distinct eligible pieces per phase against slots.) |
| R1-shipped-pipelines.md:60 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: no per-idea rated difficulty, no in-node cadence (row: Difficulty is a cadence of rated units that ramps and cools at every scale, inside each node and across the stage.) |
| R1-shipped-pipelines.md:68 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: validation still not blocking (row: Teach in three steps: exposition, a safe blocking validation, then challenge.) |
| R1-shipped-pipelines.md:74 | USED-VIA | adopted move ladder M1-M8 (L2050); partial: no Wonder tests, no game-wide uniqueness gate (row: Every stage carries one named surprise, unique across the game, passing Wonder's three tests.) |
| R1-shipped-pipelines.md:80 | NOT TAKEN | process note (grey first) (row: Grey layout first, judged, then art; keep the edit-to-play loop short.) |
| R1-shipped-pipelines.md:86 | USED-VIA | adopted polish pass P-/S- (L689) (row: Finishing is a list of passes, each looking at the whole game for one thing.) |
| R1-shipped-pipelines.md:95 | CONTRADICTED | ES L1090-1091: 1-1 is built right after 1-5 and 1-2 to 1-4 wait on it (Matt, 11-05: "One first, then the rest"). Matt wins (row: Build each world's first stage last, and re-grade early stages after later ones improve.) |
| R1-shipped-pipelines.md:508 | USED-VIA | adopted pacing P1-P9 (L2001); partial: idea 40% cap deferred to a run (row: Hard per-stage no-repeat cap by construction; refuse and name missing pieces; length from units, never a clock.) |
| R1-shipped-pipelines.md:514 | NOT TAKEN | save-wide ledger not ruled (ES C14 L1761) (row: A save-wide ledger: a unit seen anywhere in the save leaves the bag until the world's pool is spent.) |
| R1-shipped-pipelines.md:517 | USED-VIA | LABELS (adopted) 'allowed in' gating by teaching; WR:121 needs taught; no rarity tier (partial) (row: Rarity and position tags on units (Spelunky 2 !rare 5%, !hard only in later stages).) |
| R1-shipped-pipelines.md:519 | USED-VIA | adopted difficulty dial (L638); partial: no subtractive variety, no random variety matrix (row: Ubisoft kit: five-value atomic parameters, safe blocking validation, subtractive variety, random variety matrix.) |
| R1-shipped-pipelines.md:522 | USED-VIA | WR:115 the moment; WR:16 `must`; game-wide uniqueness not ruled (partial) (row: One named surprise per stage with Wonder's three tests, unique across the game, as a 'signature' field.) |
| R1-shipped-pipelines.md:524 | NOT TAKEN | process note (grading) (row: An open grade board per stage, re-graded after later stages improve.) |
| R1-shipped-pipelines.md:527 | USED-VIA | adopted move ladder M1-M8 (L2041); partial: no cooldown list, no secrets count (row: Shovel Knight stage contract: ~26 rooms + 6 secrets, 5 new enemies + 5 objects, no unitaskers, game-wide cooldown list.) |
| R1-shipped-pipelines.md:531 | USED-VIA | WR:31 W1's ladder moves are objects at a place (mushroom, rope, liana, creaky) (row: For a one-thumb game, advanced skill comes from level objects at a place, not input combinations.) |
| R1-shipped-pipelines.md:533 | NOT TAKEN | ES C1 L1748 OPEN; per-idea rating not ruled (row: Rate unit difficulty from bots' measured deaths and time, not the author's guess.) |
| R1-shipped-pipelines.md:536 | NOT TAKEN | process note (row: Grey approval stamp before any art is chosen.) |
| R1-shipped-pipelines.md:543 | USED-VIA | WR §4 a designed grammar path, not socket-shuffling (row: Avoid shuffling prefab rooms with sockets and no designed path.) |
| R1-shipped-pipelines.md:546 | ADOPT | A roll stays until the stage is cleared: a death never re-rolls the layout (R1:546; gen2 today keeps the layout until cleared, ES F1 P2:196) (row: Never re-roll the level when the player dies; keep the layout until cleared.) |
| R1-shipped-pipelines.md:548 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (neighbouring bursts' difficulty not ruled) (row: Neighbouring units with mismatched difficulty make spikes; rate from play and smooth the cadence at joins.) |
| R1-shipped-pipelines.md:550 | USED-VIA | adopted pacing P1-P9 (L2001); partial: ideas may still repeat (40% deferred) (row: Same unit many times because length is filled to a clock from too few units; fix unit count, time follows.) |
| R1-shipped-pipelines.md:553 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: no measured per-node difficulty (row: A flat difficulty after the opening; every shipped method ramps and cools.) |
| R1-shipped-pipelines.md:554 | USED-VIA | WR:29 W1 art only (ES C7 L1754) (row: A sequel or world that looks the same in a screenshot; each world needs its own tiles and ingredients.) |
| R1-shipped-pipelines.md:556 | NOT TAKEN | not a generator rule (creatures hand-made, ES L219) (row: Do not generate enemies or locomotion; keep creatures hand-made with readable tells.) |
| R1-shipped-pipelines.md:557 | USED-VIA | adopted difficulty dial (L651) (row: Designers beat only their own levels; use kid and first-timer bots and outside play first.) |
| R1-shipped-pipelines.md:561 | USED-VIA | WR §1 the brief as data; pieces placed relative to their holders (WR:35) (row: Tools that make small layout fixes expensive; keep units as data placed relative to anchors.) |
| R1-shipped-pipelines.md:564 | NOT TAKEN | process note (cost of generation) (row: Generating does not save effort unless units are made once and used without repeats.) |
| R1-shipped-pipelines.md:567 | USED-VIA | CLAUDE.md variety rule (more pieces); WR:25-29 kit families (row: Running out of ideas with the same pieces; variety needs new pieces (N++ new enemies).) |
| R1-shipped-pipelines.md:568 | USED-VIA | WR:100-101 `finale` or `arrival` before the end; WR:115 the moment (row: A long stage of units loses an earned finish; end on a hand-made set piece or combined test.) |
| R1-shipped-pipelines.md:572 | USED-VIA | ES L1120: rhythm is the player's, not the song (agrees) (row: Do not make the music's beat the frame of every stage; shipped games used rhythm as one stage's twist.) |
| R2-academic-pcg.md:36 | ADOPT | W1's section pool holds at least 14 distinct section types, more whenever a stage only scrapes past the variety gates (ES C24 L1771; CLAUDE.md variety rule, Matt 10-30) (row: Variety is vocabulary, not randomness: draw each beat from a grammar of kinds; gate counts kinds, not pixels.) |
| R2-academic-pcg.md:48 | USED-VIA | WR §4 constructive with WR:52 gates as backstop (row: Build by construction and keep checks as the backstop.) |
| R2-academic-pcg.md:57 | USED-VIA | WR:121 decks pick the idea, numbers roll (WR:128) (row: Choose the pattern first, solve its numbers second, and let numbers flow (Tanagra).) |
| R2-academic-pcg.md:64 | USED-VIA | WR:52 gates as critics; per-node search not ruled (partial) (row: Local grammars overgenerate; global intent needs critics; tagged per-region intent needs search, not more rolls.) |
| R2-academic-pcg.md:72 | USED-VIA | adopted placement rules (L311); partial: no teach-node must-fail gate (row: A mechanic must be required: the bot without it must fail the teach, the full bot pass.) |
| R2-academic-pcg.md:80 | USED-VIA | WR:115 the moment in the last third (late peak); WR:100 finale (row: Difficulty and pacing are curves built to a real arc with a late peak, not a constant or sawtooth.) |
| R2-academic-pcg.md:87 | NOT TAKEN | mixed-initiative and edit stability not ruled (WR:21 no plan) (row: Mixed-initiative beats batch generation; keep values as last time, relax only if impossible.) |
| R2-academic-pcg.md:93 | USED-VIA | adopted difficulty dial (L651) (row: Player studies punished hard levels; beat-locking every take-off feels monotonous.) |
| R2-academic-pcg.md:516 | USED-VIA | WR:51 roll families vary numbers per roll (row: One canopy rhythm admits about 3 million valid geometries; the rhythm tier is not short of options.) |
| R2-academic-pcg.md:518 | USED-VIA | CLAUDE.md variety rule (more pieces) and the kit (WR:25-29) (row: On canopy nodes the tracer rejects nothing; the quality bottleneck is what the palette offers.) |
| R2-academic-pcg.md:522 | ADOPT | W1's section pool holds at least 14 distinct section types, more whenever a stage only scrapes past the variety gates (ES C24 L1771; CLAUDE.md variety rule, Matt 10-30) (row: The space is huge in pixels and tiny in kinds; generator varies numbers, player perceives kinds.) |
| R2-academic-pcg.md:527 | USED-VIA | WR:51 families drawn by measured share (ES L2113) (row: fitSteps biases climb; sample uniformly (count-weighted) from the valid space.) |
| R2-academic-pcg.md:532 | NOT TAKEN | tooling: tracer filters (row: Floor rejections are one predictable rule (MIN_GAP); filter when the candidate is made, not by a full trace.) |
| R2-academic-pcg.md:536 | NOT TAKEN | research note: search not needed today (row: Search is not faster today, but becomes the right tool once constraints get tight (pins, rise targets, kind quotas).) |
| R2-academic-pcg.md:654 | USED-VIA | WR:134 job sequence may not match a neighbour's; per-node kind count not ruled (row: Kind grammar per beat with a kind-count gate per node and an edit-distance floor between same-tag nodes.) |
| R2-academic-pcg.md:658 | NOT TAKEN | ES L1796 wait-and-go to be defined or struck; no W1 stomper (row: A wait verb in the bars (stomper, moving platform): beats that make Pokey stop.) |
| R2-academic-pcg.md:663 | USED-VIA | adopted placement rules (L311); partial: no teach-node gate (row: Limited-agent gate: bot with the taught move switched off must fail the teach node.) |
| R2-academic-pcg.md:671 | NOT TAKEN | tooling: measure node space (row: Measure each node's space (count, valid share, kinds) before rolling.) |
| R2-academic-pcg.md:680 | NOT TAKEN | edit stability not ruled (row: Stability under edits: other nodes keep solved values unless no solution exists.) |
| R2-academic-pcg.md:684 | ADOPT | No four take-offs in a row at the same interval (± 0.1 s) on the bot's route (ES L1807, accepted as a gate; P2:43); (the four-equal-intervals gate; seam cadence kinds not ruled) (row: Rhythm of the rhythm (compound patterns) and designed cadence kinds at each seam, counted by the gate.) |
| R2-academic-pcg.md:689 | NOT TAKEN | QD selection not ruled; misses become piece lists (ES L586) (row: Quality-diversity selection: best roll per niche; ask for empty cells; blocklisted cells become piece-list items.) |
| R2-academic-pcg.md:694 | USED-VIA | WR:52 lookalike across a world's stages (ES ruling 1 L1792) (row: Compression distance of kind strings across different stages of one world.) |
| R2-academic-pcg.md:697 | NOT TAKEN | process note: play-test protocol (row: Play-test protocol: play several levels from one generator; four-choice answer.) |
| R2-academic-pcg.md:704 | NOT TAKEN | tooling (row: Seed the search with nodes that already passed QA.) |
| R2-academic-pcg.md:707 | CONTRADICTED | ES L1120 (Matt, 11-04): rhythm is the player's, not the song (sourced to Smith 2009, L1883); Matt outranks the research; (ES L1120) (row: Place take-offs on the stage tune's own note onsets, so each stage's rhythm differs with its tune.) |
| R3-fun-by-math.md:223 | NOT TAKEN | physics fact used by the tracer, not a rule (row: Standard jump unit: Pokey rises 103 px (2.15 bodies), carries 185 px at full run) |
| R3-fun-by-math.md:265 | USED-VIA | WR:97 rest about 2× the local beat (ES C2 L1749) (row: Fixed 1.0 s rest pad splits every phrase; a rest must be relative to local beat (2x median interval)) |
| R3-fun-by-math.md:272 | NOT TAKEN | density lines measured per stage (ES L1805); not a world rule (row: Normal plays at Easy density; Easy same tempo as Normal; density and difficulty are separate dials) |
| R3-fun-by-math.md:285 | NOT TAKEN | tooling: move-string counting (row: Tools disagree on what a double jump is; doubles counted as singles in move strings) |
| R3-fun-by-math.md:294 | USED-VIA | the difficulty dial's E[lives] row (C16) (row: Per-jump survival floors do not bound a stage; gate the stage sum E[lives]) |
| R3-fun-by-math.md:300 | NOT TAKEN | ES C5 L1752 softens Easy; an Easy-never-harder check is not ruled (row: Easy can be harder than Normal on bots; a 6% kid jump costs only retries, unseen) |
| R3-fun-by-math.md:305 | NOT TAKEN | ES G #69 L1845 deferred: bots calibrated on touch recordings first (row: Adult bot thumb (30 ms) steadier than any measured human (36-61 ms); use about 45 ms) |
| R3-fun-by-math.md:311 | CONTRADICTED | WR:52 gates on diversity ≥ 0.35 from STAGE-RULES §2 (Matt's rule; ES L1792, L2121). R3 finds 0.35 has no research source, which is true, but Matt's rule outranks research; the number stays Matt's, not research's (row: Gemini notes misstate Smith's leniency and linearity; D_sim<0.35 has no source) |
| R3-fun-by-math.md:325 | USED-VIA | adopted pacing P1-P9 (L2015); partial: no single number (row: Three different dead-walk limits: 4 s, 2.0/3.0 s, code 2.5 s) |
| R3-fun-by-math.md:329 | USED-VIA | WR:51 per-roll tempo (ES L2102-2116); WR:52 gates (row: Move-order cosine sits at floor; Matt's sameness lives in tempo, leniency and look) |
| R3-fun-by-math.md:337 | USED-VIA | WR:52 diversity ≥ 0.35 between rolls (the measured 1-1/1-4 sameness) (row: 1-1 and 1-4 barely change between rolls (2 and 7 distinct strings of 16)) |
| R3-fun-by-math.md:342 | USED-VIA | adopted difficulty dial (L644); polish pass P-/S- (L906); partial: 'bots judge it' names no bot (row: Jump bots and first-timer bot disagree on hard stages; no check combines them) |
| R3-fun-by-math.md:595 | USED-VIA | the difficulty dial's E[lives] row (C16) (row: Stage survival budget E[lives]=sum(1-s_i) from bots, ramped world by world) |
| R3-fun-by-math.md:597 | USED-VIA | adopted difficulty dial (L652); partial: per-jump floors 70%/85% instead (L651) (row: Teach, first test and practice at different success targets: 0.97 / 0.85 / 0.95) |
| R3-fun-by-math.md:599 | NOT TAKEN | simulated population not ruled (MISSING) (row: Simulated player population (skill, persistence, boredom, learning): share who quit per stage) |
| R3-fun-by-math.md:601 | NOT TAKEN | Glicko rating not ruled (row: Rate stages like chess players (Glicko-2, phantom matches) to get world difficulty bands) |
| R3-fun-by-math.md:603 | NOT TAKEN | frustration share not ruled; first-timer bots judge time (see the first-timer ADOPT rule) (row: Frustration meter: first-timer stuck share gated per setting (<=0.05 Easy, <=0.10 Normal)) |
| R3-fun-by-math.md:607 | USED-VIA | adopted move ladder M1-M8 (L2041); partial: band from shipped games, not Matt's favourites (row: Novelty band [L,U] from Matt's favourites, not just a similarity cap; too new = odd connections) |
| R3-fun-by-math.md:609 | NOT TAKEN | replaced by era/lookalike (WR:52) (row: Length-calibrated NCD: self 0.09, shuffle 0.62 at our lengths; judge inside that range) |
| R3-fun-by-math.md:610 | NOT TAKEN | ES L1796 rhythm names get a measure or are struck; nPVI not ruled (row: Rhythm regularity by nPVI (regular <20, swing 45-75) and a relative group boundary) |
| R3-fun-by-math.md:611 | NOT TAKEN | process note: Matt picks A or B (row: Rank, don't rate: Matt picks A or B; Kendall tau tells which formula predicts him) |
| R3-fun-by-math.md:613 | NOT TAKEN | library idea (boa kick-roll, ES CP2 L109) (row: Cause-chain moves (shell kick) were the strongest fun correlate; boa roll is ours) |
| R3-fun-by-math.md:615 | NOT TAKEN | tooling: knob elasticities (row: Knob elasticities: measured change in bot success per px or speed unit, hit targets by arithmetic) |
| R3-fun-by-math.md:617 | NOT TAKEN | tooling: bot timing model (row: Bot timing error should worsen with hazard speed (Isaksen 35.9 to 61.1 ms)) |
| R4-mobile-and-architecture.md:28 | NOT TAKEN | ES C1 L1748 OPEN (difficulty placed on purpose); the adopted dial sets the target (row: Traced jumps carry ~no risk; difficulty must be placed on purpose; need a risk budget per node) |
| R4-mobile-and-architecture.md:40 | NOT TAKEN | tooling: rejection reports (row: Generator must report why it rejects rolls, by rule; 94% of 1-2's tries one rule) |
| R4-mobile-and-architecture.md:51 | ADOPT | W1's section pool holds at least 14 distinct section types, more whenever a stage only scrapes past the variety gates (ES C24 L1771; CLAUDE.md variety rule, Matt 10-30); (cross-world sharing withdrawn, ES C7 L1754) (row: Variety at scale from many small authored pieces, themed pools, any piece fits any neighbour) |
| R4-mobile-and-architecture.md:76 | USED-VIA | WR:31 the ladder: verbs come from pieces at a place (row: One input, many verbs: the level gives the move; a new mechanic per batch; touch rules belong to the level) |
| R4-mobile-and-architecture.md:87 | NOT TAKEN | tooling: test pyramid (row: Test pyramid: many fast tests, few stage tests, quarantine flaky ones; proposer untested) |
| R4-mobile-and-architecture.md:98 | NOT TAKEN | ES G #69 L1845 tooling: bot calibration (row: Calibrate bot noise on real recordings (King's regression) before trusting bot numbers) |
| R4-mobile-and-architecture.md:107 | USED-VIA | WR §1 the brief is small data (row: Level data small, schema'd, separate from the code that reads it) |
| R4-mobile-and-architecture.md:547 | NOT TAKEN | tooling: rejection and coverage reports (row: Rejection report plus coverage gate: fail if one rule eats >half the tries or an option is laid 0 times) |
| R4-mobile-and-architecture.md:551 | NOT TAKEN | tooling: one reach predicate (ES P4) (row: One reach predicate shared by proposer and verifier, with a property test) |
| R4-mobile-and-architecture.md:559 | NOT TAKEN | tooling: bot fit (row: Fit first-timer thumb and hold to testers' recorded touches; report the fit) |
| R4-mobile-and-architecture.md:563 | NOT TAKEN | tooling: touch constants in the manifest (row: Touch rules (gesture constants, FORGIVE) pinned into each roll's manifest; a control tweak is a level change) |
| R4-mobile-and-architecture.md:567 | NOT TAKEN | tooling: death strips (row: Plot where the bots end: one strip image per stage of death and stall x) |
| R4-mobile-and-architecture.md:570 | NOT TAKEN | tooling: layer-locked rerolls (row: Layer-locked rerolls (keep nodes, reroll steps; keep steps, reroll surfaces) via per-node RNG streams) |
| R4-mobile-and-architecture.md:574 | NOT TAKEN | second goals not ruled; the second road's marks are a 1-5 note (ES L360) (row: Same ground, second goal, said plainly (colour coins, Invasion, three fixed goals)) |
| R4-mobile-and-architecture.md:577 | USED-VIA | WR:25-29 W1's themed kit; WR:17 `not` narrows each stage (row: Themed pools per stage (two hazards, one surface family), not one grab bag) |
| R4-mobile-and-architecture.md:580 | NOT TAKEN | tooling: flaky-gate policy (row: Flaky-gate policy: retry once, weekly top-failing list, quarantine with owner and deadline) |
| R4-mobile-and-architecture.md:583 | NOT TAKEN | tooling: catalog (row: Readable stage catalog per layout checked in and diffed in CI (Brogue seed catalog)) |
| GEMINI-PCG-RESEARCH.md:8 | NOT TAKEN | the mixer requires every roll to pass, never curates (ES ruling 5 L1796, L259) (row: Offline seed curation: generate many layouts per stage, score them, ship the best) |
| GEMINI-PCG-RESEARCH.md:9 | USED-VIA | adopted pacing P1-P9 (L2015); partial: rest per burst relative (C2) (row: Dead-time limit about 2 s Normal / 3 s Easy; only jumps, timing, puzzles count; petal arc half; short rest after each burst) |
| GEMINI-PCG-RESEARCH.md:11 | USED-VIA | WR:52 the 20 s window < 0.30 against the world's other stages (row: Sameness: weighted action strings; compare every 20 s stretch against the world's other stages; reject repeats) |
| GEMINI-PCG-RESEARCH.md:12 | NOT TAKEN | tooling: bots (ES C16 L1763) (row: Noisy-thumb bots (drift, late lift-off, short flicks, thumb switch) find death hotspots; kid latency N(+90,65 ms)) |
| GEMINI-PCG-RESEARCH.md:14 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: 'can't be skipped' and self-demonstration absent (row: First-lesson rooms: no enemies, no deadly fall, can't be skipped, the room shows the idea by itself first) |
| GEMINI-PCG-RESEARCH.md:15 | USED-VIA | WR:52 diversity ≥ 0.35 between rolls (row: Expressive range: roll ~200 per stage, score linearity, leniency, density, path, action mix; check rolls differ (diversity at least 0.35)) |
| GEMINI-PCG-RESEARCH.md:23 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker; (≤3 stages a template, ES C14 L1761, is the cross-stage half) (row: Variety cooldown: the same piece not used twice within two stages or twice in a world run) |
| GEMINI-PCG-RESEARCH.md:33 | USED-VIA | adopted move ladder M1-M8 (L2040) (row: Kishotenketsu: introduce a mechanic safely, develop it, twist it, end with a mastery climax) |
| GEMINI-PCG-RESEARCH.md:39 | USED-VIA | adopted polish pass P-/S- (L692) (row: Platforms rooted in biome logic; each level one focal twist that never overstays; one signature level per world) |
| GEMINI-PCG-RESEARCH.md:47 | USED-VIA | WR §4 sections chained by the grammar (solution path) (row: Spelunky solution path of templates matching exits with rolled sub-blocks; Dead Cells concept graph before rooms) |
| GEMINI-PCG-RESEARCH.md:57 | USED-VIA | adopted placement rules (L313); partial: no same-kind minimum distance (row: Shuffle bags for chunks/props; Poisson minimum and maximum spacing; parametric sockets) |
| GEMINI-PCG-RESEARCH.md:64 | USED-VIA | pacing P8 (adopted, ES L2004): gaps ≤ 0.8 of the true maximum; path search is the tracer (row: Guarantee solvability: kinematic reach with a margin, then a path search using only unlocked moves) |
| GEMINI-PCG-RESEARCH.md:84 | USED-VIA | WR:51 bursts by time; WR:50 tension placement (partial) (row: Rhythm groups measured in time; sawtooth tension curve over chunks; props spawned as linked pairs) |
| GEMINI-PCG-RESEARCH.md:97 | LATER WORLD | W2-W10 first stages (ES C17 L1765); W1's dial is the adopted one (row: Difficulty D(W,L) per stage; a world's first level a little below the last world's end; Easy modifier) |
| GEMINI-PCG-RESEARCH.md:105 | USED-VIA | adopted pacing P1-P9 (L2004) (row: Jump distance margin: Easy at most 65%, Normal at most 82% of the physical jump limit) |
| GEMINI-PCG-RESEARCH.md:106 | USED-VIA | the difficulty dial: Easy landings wider than Normal (C4) (row: Easy: landing pads two tiles wider than Normal) |
| GEMINI-PCG-RESEARCH.md:107 | USED-VIA | WR:36-38 a fall lands on something (ES C5 L1752: an Easy slip costs a fall to a catch) (row: Easy: bottomless pits replaced with bounce nets or one-heart water/vine rescue) |
| GEMINI-PCG-RESEARCH.md:108 | USED-VIA | adopted difficulty dial (L645) (row: Easy: 60% enemy budget, slower patrols and projectiles) |
| GEMINI-PCG-RESEARCH.md:109 | ADOPT | Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal; (puzzle-step quota not ruled) (row: Quotas: Easy one-step puzzles and 70% collection; Normal multi-step and 100%) |
| GEMINI-PCG-RESEARCH.md:111 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (win conditions per stage are brief/story) (row: World Director: 9-card mission deck, each stage a distinct archetype with its own graph and win condition) |
| GEMINI-PCG-RESEARCH.md:115 | USED-VIA | adopted move ladder M1-M8 (L2040); partial: no rule that each world's first stage teaches its move (row: Level 1 onboarding: linear, safe lower paths; introduces the world's new move and creature safely) |
| GEMINI-PCG-RESEARCH.md:116 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (collection stage archetype) (row: Level 2 collection quest: multi-tier layout with N target items across micro-branches) |
| GEMINI-PCG-RESEARCH.md:117 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Level 3 puzzle: gated rooms with lock-and-key or switch-and-door dependency graphs) |
| GEMINI-PCG-RESEARCH.md:118 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; W1 has no combat gates (row: Level 4 combat/gauntlet: arena chunks between traversal; gates lock until creatures cleared or bypassed) |
| GEMINI-PCG-RESEARCH.md:119 | NOT TAKEN | special stage, hand-built (ES ruling 5 L1796: the builder is named per stage; specials kept as built, ES §B L1497) (row: Level 5 world-unique signature level with its own directional generator rule) |
| GEMINI-PCG-RESEARCH.md:120 | LATER WORLD | 2-3 and 2-8 cage stages (kept as built) (row: Level 6 rescue: side chambers with caged critters guarded by puzzles or elites) |
| GEMINI-PCG-RESEARCH.md:122 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; props against creatures not ruled (row: Level 8 hybrid puzzle-combat: world props used against creatures) |
| GEMINI-PCG-RESEARCH.md:123 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (X-9 is the brief's job) (row: Level 9 mastery gauntlet testing every prop, enemy and move of the world before the finale) |
| GEMINI-PCG-RESEARCH.md:126 | USED-VIA | WR §1 brief + LABELS (adopted) as the world manifest (row: Data formats: world manifest (moves, prop pairs, creatures by terrain) and chunk templates (connectors, phase, difficulty, sockets)) |
| GEMINI-PCG-RESEARCH.md:177 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker; (local repair not taken, ES L259) (row: Six-pass pipeline: budget, mission graph, chunk stitching with history cooldown, sockets, validate with local repair, dress) |
| GEMINI-PCG-RESEARCH.md:226 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; (puzzle validator is a lock gate, ES L1797) (row: Puzzle validation by causal graphs and pre-validated rooms with symbolic zones; softlock respawn) |
| GEMINI-PCG-RESEARCH.md:240 | ADOPT | W1's section pool holds at least 14 distinct section types, more whenever a stage only scrapes past the variety gates (ES C24 L1771; CLAUDE.md variety rule, Matt 10-30); (mirroring not ruled) (row: Few templates suffice: 28-35 chunks per world plus sub-blocks, probabilistic props, mirroring, 3 connector heights, cooldown) |
| GEMINI-PCG-RESEARCH.md:257 | USED-VIA | WR:52 era diversity against same-world stages (row: Expressive range analysis: many headless rolls scored and plotted; reject a level with D_sim under 0.35 to any same-world level) |
| GEMINI-PCG-RESEARCH.md:277 | USED-VIA | WR:97 rest after every burst group; WR:51 bursts; idle injection is the dead-time ADOPT (row: Launchpad rhythm groups: timed bursts with rest pads; inject a beat when idle too long; force rest after bursts) |
| GEMINI-PCG-RESEARCH.md:291 | USED-VIA | adopted pacing P1-P9 (L2015); partial: chase 1.2 s absent (row: Max eventless walk: Easy 3.0 s, Normal 2.0 s, chase 1.2 s) |
| GEMINI-PCG-RESEARCH.md:293 | USED-VIA | WR:97 rest about 2× the local beat (ES C2 L1749, G #83 L1836) (row: Rest pads between bursts: Easy 2.0-2.5 s, Normal 1.0-1.2 s, chase 0.8 s) |
| GEMINI-PCG-RESEARCH.md:311 | USED-VIA | move ladder M1 (adopted, ES L2040) and WR:39 the first use over safe ground (row: Teaching: first appearance never left to random; slot-1 teach node; zero lethal, unskippable, self-demonstrating, source and receptor co-vis) |
| GEMINI-PCG-RESEARCH.md:324 | USED-VIA | WR:16 `must` (clue on the end bank), WR:15 `look`; world sub-acts not ruled (row: Story in procedural games: anchor rooms at stage start and end, landmark chunks, three visual sub-acts per world) |
| GEMINI-PCG-RESEARCH.md:338 | USED-VIA | adopted difficulty dial (L638) (row: Pre-flight difficulty: score each jump by distance, landing tightness, timing overlap; then noisy-bot runs) |
| GEMINI-PCG-RESEARCH.md:370 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR); (per-group stress sum not ruled) (row: Peak consecutive stress per rhythm group: Easy 2.5, Normal 5.5; else insert a rest or checkpoint) |
| GEMINI-PCG-RESEARCH.md:372 | NOT TAKEN | backtracking ratio not ruled (row: Backtracking ratio: Easy 1.0-1.25, Normal 1.15-1.60) |
| GEMINI-PCG-RESEARCH.md:380 | USED-VIA | adopted placement rules (L278) (row: Free-form pixel chunks: entry/exit anchors, joins from the jump envelope, vertical corridor clamp, surface-bound sockets) |
| GEMINI-PCG-RESEARCH.md:413 | NOT TAKEN | token weights live in lookalike.ts (the game's own tool, WR:52); the value is not a rulebook rule (row: Token weight: flat walk W 0.2) |
| GEMINI-PCG-RESEARCH.md:414 | NOT TAKEN | token weights live in lookalike.ts (the game's own tool, WR:52); a weight value is not a rulebook rule (row: Token weight: small hop h 0.5) |
| GEMINI-PCG-RESEARCH.md:415 | NOT TAKEN | token weights live in lookalike.ts (the game's own tool, WR:52); a weight value is not a rulebook rule (row: Token weight: precision gap jump J 1.0) |
| GEMINI-PCG-RESEARCH.md:417 | NOT TAKEN | token weights live in lookalike.ts (the game's own tool, WR:52); a weight value is not a rulebook rule (row: Token weight: creature dodge, stomp or bait C 2.2) |
| GEMINI-PCG-RESEARCH.md:418 | NOT TAKEN | token weights live in lookalike.ts (the game's own tool, WR:52); a weight value is not a rulebook rule (row: Token weight: carry or throw object P 2.8) |
| GEMINI-PCG-RESEARCH.md:419 | NOT TAKEN | as GP:413; no trigger mechanisms in W1's kit (row: Token weight: trigger mechanism (seesaw, winch, shutter) S 3.0) |
| GEMINI-PCG-RESEARCH.md:436 | USED-VIA | adopted difficulty dial (L651) (row: Touch noisy bot: thumb drift, late lift-off overshoot, 8% short hop, thumb-swap gap) |
| GEMINI-PCG-RESEARCH.md:458 | NOT TAKEN | beat-counting weights belong to the fun gate's measure; ES L2015 marks ES 752's numbers Gemini-only estimates (row: Dead time: only real input actions count as beats; flat petals 0, petal arc over a gap 0.5) |
| GEMINI-PCG-RESEARCH.md:518 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: Puzzle chunks in a 500 x 750 px diagonal/vertical box that fits both orientations) |
| GEMINI-LEDGER.md:14 | USED-VIA | WR §4 jobs (teach, practise, test, twist) carry the four steps (row: A1 Kishotenketsu per stage (Ki/Sho/Ten/Ketsu), checked by the inspector's tension curve) |
| GEMINI-LEDGER.md:15 | USED-VIA | adopted polish pass P-/S- (L690) (row: A2 Biome logic: platforms are branches, logs, slabs, never abstract blocks) |
| GEMINI-LEDGER.md:16 | USED-VIA | WR:99 one `twist`, WR:115 the moment; signature stages kept as built (row: A3 One focal twist per stage; one signature stage per world) |
| GEMINI-LEDGER.md:18 | USED-VIA | WR §4 rolled sections over the kit (row: A5 Spelunky/Dead Cells templates and rolled sub-blocks; hand stages' rolls 0.87-1.00 alike) |
| GEMINI-LEDGER.md:19 | NOT TAKEN | pacing.ts measures are the funcheck gate, not a rulebook rule (row: A6 Rhythm groups and sawtooth tension curve measured by pacing.ts) |
| GEMINI-LEDGER.md:20 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; (tools and receptors only in rooms, ES L375-377) (row: A7 Linked pairs: never spawn a tool without its receptor nearby) |
| GEMINI-LEDGER.md:33 | USED-VIA | WR:122 no idea twice in a row (a shuffle bag) + lockout ADOPT (row: C1 Shuffle bags instead of plain random for pieces and props) |
| GEMINI-LEDGER.md:34 | USED-VIA | adopted placement rules (L313); partial: no same-kind minimum distance (row: C2 Poisson spacing: minimum gap between same-kind pieces, maximum gap with nothing) |
| GEMINI-LEDGER.md:35 | USED-VIA | WR:52 diversity between rolls; per-roll draws (ES L2102) (row: C3 Sockets / section versions per stage; 200-roll alike 0.61-0.94 measured) |
| GEMINI-LEDGER.md:36 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker (row: C4 Cooldown: no chunk within 2 levels, no sub-block twice a world; next roll avoids the last one seen) |
| GEMINI-LEDGER.md:37 | USED-VIA | WR:52 era diversity ≥ 0.35 (row: C5 Expressive range analysis: 200-1,000 rolls, heatmaps, diversity D_sim at least 0.35 (era.ts)) |
| GEMINI-LEDGER.md:38 | USED-VIA | WR:52 lookalike reads weighted actions (ES ruling 1 L1792) (row: C6 Weighted action strings (W 0.2 ... S 3) in beats.ts) |
| GEMINI-LEDGER.md:40 | NOT TAKEN | mirroring not ruled (row: C8 Horizontal mirroring of rooms (or flipping piece order)) |
| GEMINI-LEDGER.md:41 | USED-VIA | adopted placement rules (L278) (row: C9 Standard connector heights / relative anchor frames with jump-sized joins) |
| GEMINI-LEDGER.md:42 | NOT TAKEN | the mixer requires all rolls to pass, never curates (ES L1796, L259) (row: C10 Offline seed curation: score thousands of seeds, ship the best) |
| GEMINI-LEDGER.md:48 | NOT TAKEN | tooling: reachability by the tracer (row: D1 Kinematic reachability from the jump physics) |
| GEMINI-LEDGER.md:49 | USED-VIA | adopted pacing P1-P9 (L2004); partial: no Easy 65% margin (row: D2 Per-difficulty jump margins (65% Easy, 82% Normal)) |
| GEMINI-LEDGER.md:50 | NOT TAKEN | ES L259: a failing draw fails, no self-repair (row: D3 Full path search before play; local self-repair of a failing jump) |
| GEMINI-LEDGER.md:51 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: D4 Puzzles checked as symbolic zones (puzzleCheck.ts)) |
| GEMINI-LEDGER.md:52 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; (softlock is a puzzle-room rule) (row: D5 Softlock guarantee: a lost item respawns at its source) |
| GEMINI-LEDGER.md:53 | USED-VIA | adopted polish pass P-/S- (L703); partial: no along-surface binding stated (row: D6 Sockets bound to a platform id plus position along it plus offset) |
| GEMINI-LEDGER.md:59 | NOT TAKEN | as GP:458 (row: E1 Only real actions count as beats; flat petals 0; petal arc over a gap 0.5) |
| GEMINI-LEDGER.md:61 | NOT TAKEN | density measured per stage (ES L1805) (row: E3 Action density 0.75-1.15 Normal, 0.35-0.55 Easy) |
| GEMINI-LEDGER.md:68 | USED-VIA | adopted difficulty dial (L638); polish pass P-/S- (L796); partial: Easy also drops canopies and bursts (L796,L811), so its layout differs (row: F1 Same layout, different rules per difficulty: margins, widths, hazards, enemy budget, quotas) |
| GEMINI-LEDGER.md:69 | USED-VIA | the adopted dial (bands.ts, ES 624-661); numbers re-run (partial) (row: F2 Difficulty score D(world, stage) with an in-world ramp; bands.ts 0-100 score and flags) |
| GEMINI-LEDGER.md:70 | USED-VIA | adopted difficulty dial (L651); polish pass P-/S- (L906) (row: F3 Noisy-thumb kid and adult bots; survival 85% Easy / 70% Normal per jump) |
| GEMINI-LEDGER.md:71 | NOT TAKEN | tooling: first-timer bot (row: F4 Touch failure modes (drift, lift-off, short hop, thumb swap) in the first-timer bot) |
| GEMINI-LEDGER.md:74 | USED-VIA | adopted difficulty dial (L652); partial: unskippable, self-showing and co-visibility absent (row: F7 First lesson rooms: zero lethal, unskippable, self-showing; source and receptor within 8 tiles) |
| GEMINI-LEDGER.md:87 | USED-VIA | the adopted dial and placement rules (Easy reach margins, ES L369 easyHoldCheck) (row: G8 No Easy gap may need a full-hold jump (easyHoldCheck)) |
| GEMINI-LEDGER.md:93 | USED-VIA | WR:16 `must`, WR:131 the clue on the end bank (row: H1 Fixed story order with story anchors at a stage's start and end) |
| GEMINI-LEDGER.md:94 | NOT TAKEN | special stage, hand-built (ES ruling 5 L1796: the builder is named per stage; specials kept as built, ES §B L1497); / rooms kept as built (row: H2 Handcrafted landmark rooms inside generated stages) |
| GEMINI-LEDGER.md:96 | USED-VIA | adopted placement rules (L305) (row: H4 A breadcrumb trail so players don't get lost) |
| GEMINI-LEDGER.md:102 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary (row: I1 9-card mission deck per world; fixed order kept, shuffling dropped) |
| GEMINI-LEDGER.md:103 | NOT TAKEN | gen2 is not the W1 builder (ES ruling 5 L1796) (row: I2 gen2 six-pass pipeline working end to end on a test world) |
| GEMINI-LEDGER.md:104 | USED-VIA | WR §1 brief + LABELS as data (row: I3 JSON world manifests and chunk templates as data) |
| GEMINI-LEDGER.md:112 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only (row: J3 Puzzle rooms fit a 500 x 750 px box) |
| GEMINI-LEDGER.md:119 | USED-VIA | WR:52 roll diversity gate; WR:51 per-roll tempo (row: Summary gap 1: variety, rolls of a stage barely differ (C1, C3, C4, C8, C10)) |
| GEMINI-LEDGER.md:121 | USED-VIA | adopted difficulty dial (L638) (row: Summary gap 3: difficulty-scaled rules so Easy is truly easier) |
| GEMINI-LEDGER.md:122 | NOT TAKEN | pacing numbers in the inspector: funcheck tooling (row: Summary gap 4: pacing numbers in the inspector so fun is measured) |
| GEMINI-VARIETY-2026-11-02.md:14 | USED-VIA | WR:108-109 rules 3-4: no same job side by side, a rest after every test (row: Pacing tags per beat (Tight/Flowing/Relaxed/Cerebral); never two Tight beats back to back) |
| GEMINI-VARIETY-2026-11-02.md:15 | NOT TAKEN | puzzle/search rooms stay hand-built (ES L1809, ruled research); the rulebook generates action sections only; no puzzle-beat share for W1 (rooms kept as built) (row: About 25-30% of beats are puzzle beats (jump as a tool, not a reflex)) |
| GEMINI-VARIETY-2026-11-02.md:16 | USED-VIA | WR:106-107 teach alone, then practise, then test; WR:99 twist combines (row: Teach a thing alone, then use it against another system (two-step)) |
| GEMINI-VARIETY-2026-11-02.md:17 | LATER WORLD | moving platforms taught in 2-7 (ES §B L1498) (row: Moving platform kinds: pendulum, ride-to-start track, pulley, turning log, bobbing float, creature platform, see-saw) |
| GEMINI-VARIETY-2026-11-02.md:19 | USED-VIA | water rules W1-W12 (adopted, ES 1885-1926) (row: Water: no slow drag, in-and-out every 15-20 s, wide clear exits, currents and bubbles, rising/falling water) |
| GEMINI-VARIETY-2026-11-02.md:21 | USED-VIA | WR:96 fork high/low roads; lock-and-key parked (row: Lock-and-key and branch rules: a key off the main path; a fast risky path and a safe path) |
| GEMINI-VARIETY-2026-11-02.md:22 | USED-VIA | adopted placement rules (L296) (row: Reject Celeste's no-lives; keep checkpoints close) |
| MATT-RESEARCH-2026-11-04.md:6 | USED-VIA | WR:49 map shapes, WR:52 gates, WR:108-109 no T-T; aprons and 45% not taken (partial) (row: Stage DNA plus seed; map shapes (loop-back, split, chimney, lock-and-key spoke); physics-traced rhythm; pre-flight checks; never T-T; 200-25) |
| MATT-RESEARCH-2026-11-04.md:17 | NOT TAKEN | new verb: ES L1808 sends new verbs to Matt as one question; not on W1's ladder from main (WR:31); / specials kept / cause and effect not ruled (ES L1806, L1808) (row: Sloth biology as mechanics; a special stage per world; world mutators; stage-to-stage cause and effect; shuffle slot order; secrets by tells) |
| MATT-RESEARCH-2026-11-04.md:21 | ADOPT | Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR) (the 0.5 s tell and 35% enemy-free share not ruled) (row: Enemies: one trick with 0.5 s warning; stomp/punch/kick roles; about 35% nodes enemy-free; none within 150 px of a landing) |
| LEDGER-2026-11-04-part1.md:309 | USED-VIA | WR:4, WR:47-49: the structure and map shape roll per seed (camera path follows the map) [moved from later.tsv] (row: Generator 1: a different 6-8 node graph and camera path per seed) |
| LEDGER-ENGINE-GEMINI.md:504 | ADOPT | A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker [moved from later.tsv] (row: Each node draws 2-4 patterns from a stateful deck; a pattern locked out for 4 draws.) |
| R1-shipped-pipelines.md:90 | USED-VIA | the difficulty dial (adopted): Easy wider landings and longer timed windows; WR:36-38 a fall lands on something [moved from later.tsv] (row: Fairness comes from the generator and from the hero's forgiving tools (climbing, wider timing windows).) |
| GEMINI-LEDGER.md:39 | USED-VIA | WR:52 lookalike < 0.78 and the 20 s window < 0.30 (lookalike.ts) [moved from later.tsv] (row: C7 3-gram cosine across stages (reject over 0.78 adjacent), 18-beat windows (under 0.28), lookalike.ts at 0.30) |
| GEMINI-PCG-RESEARCH.md:124 | NOT TAKEN | special stage, hand-built (ES ruling 5 L1796: the builder is named per stage; specials kept as built, ES §B L1497); (1-10's lair is kept as built, ES §B L1497) [moved from later.tsv] (row: Level 10 hardcoded finale: handcrafted boss battle or set-piece escape) |
| LEDGER-2026-11-02-full.md:130 | NOT TAKEN | stage-slot role: set per stage in its feel brief (WR:9-19), not a world rule; ES L1806 lets slot roles vary; (1-9's preview is the brief's job; the X-9 role is kept, ES L1795) [moved from later.tsv] (row: X-9 previews the boss's attack patterns in a small form) |

## ADOPT candidates

Each proposed rule once, with the rows it comes from. None is added to the rulebook here; the designer rules on each.

1. **Outside `arrive`, `rest` and `arrival`, no stretch over 2.5 s with no action to take fails the roll (ES L510, the code's 2.5 s; P1:370)**  
   Rows: `LEDGER-2026-11-04-part1.md:125`, `LEDGER-2026-11-04-part1.md:370`, `LEDGER-2026-11-04-part2.md:179`, `LEDGER-2026-11-04-part2.md:329`, `LEDGER-ENGINE-GEMINI.md:323`, `LEDGER-ENGINE-GEMINI.md:518`, `LEDGER-ENGINE-GEMINI.md:664`, `LEDGER-ENGINE-GEMINI.md:707`
2. **Across a stage's 16 judged rolls at least 3 map shapes appear, where its `branching` knob allows 3 (P1:206); WR:49 rolls the shape but nothing checks coverage**  
   Rows: `LEDGER-2026-11-04-part1.md:206`
3. **At every take-off on the main route the landing is inside the camera's view, upright and sideways; when it would not be, the path folds (P1:371, EG:171)**  
   Rows: `LEDGER-2026-11-04-part1.md:371`, `LEDGER-2026-11-04-part2.md:334`, `LEDGER-ENGINE-GEMINI.md:171`, `LEDGER-ENGINE-GEMINI.md:325`, `LEDGER-ENGINE-GEMINI.md:326`, `LEDGER-ENGINE-GEMINI.md:524`, `LEDGER-ENGINE-GEMINI.md:529`, `LEDGER-ENGINE-GEMINI.md:530`, `LEDGER-ENGINE-GEMINI.md:668`, `LEDGER-ENGINE-GEMINI.md:669`, `LEDGER-ENGINE-GEMINI.md:709`
4. **No four take-offs in a row at the same interval (± 0.1 s) on the bot's route (ES L1807, accepted as a gate; P2:43)**  
   Rows: `LEDGER-2026-11-04-part2.md:43`, `LEDGER-2026-11-04-part2.md:330`, `R2-academic-pcg.md:684`
5. **Where a W1 stage places an animal: no animal on a gap's landing (the gap+enemy pair is capped), and a flat runway of at least 1.0 s (~285 px) before its trigger (ES G L1842, L1855; not adopted by WR)**  
   Rows: `LEDGER-2026-11-04-part2.md:178`, `LEDGER-2026-11-04-part2.md:281`, `LEDGER-2026-11-04-part2.md:282`, `LEDGER-2026-11-04-part2.md:350`, `LEDGER-CRITICAL-AGENTS.md:204`, `LEDGER-ENGINE-GEMINI.md:152`, `LEDGER-ENGINE-GEMINI.md:244`, `LEDGER-ENGINE-GEMINI.md:290`, `LEDGER-ENGINE-GEMINI.md:295`, `LEDGER-ENGINE-GEMINI.md:296`, `LEDGER-ENGINE-GEMINI.md:469`, `LEDGER-ENGINE-GEMINI.md:485`, `LEDGER-ENGINE-GEMINI.md:571`, `LEDGER-ENGINE-GEMINI.md:572`, `LEDGER-ENGINE-GEMINI.md:580`, `LEDGER-ENGINE-GEMINI.md:581`, `R1-shipped-pipelines.md:548`, `GEMINI-PCG-RESEARCH.md:370`, `MATT-RESEARCH-2026-11-04.md:21`
6. **A shimmy-rope section (W1's slow move, 1-3) never runs as an empty corridor: it sits over or beside a faster road, or carries a dodge (EG:157); W1 has the rope, so the slow-zone rule binds 1-3 on**  
   Rows: `LEDGER-ENGINE-GEMINI.md:157`
7. **Each stage's petal goal is set from the bots: Normal 75-87.5% of the reachable petals, Easy from the first-timer kid bot (ES G #36 L1848); WR:43 places petals but sets no goal**  
   Rows: `LEDGER-ENGINE-GEMINI.md:247`, `LEDGER-ENGINE-GEMINI.md:297`, `LEDGER-ENGINE-GEMINI.md:298`, `LEDGER-ENGINE-GEMINI.md:428`, `LEDGER-ENGINE-GEMINI.md:582`, `LEDGER-ENGINE-GEMINI.md:594`, `LEDGER-ENGINE-GEMINI.md:710`, `GEMINI-PCG-RESEARCH.md:109`
8. **The first-timer bot's clock is judged too: 180-300 s (2-5 min) a stage (ES §Stage length L664-667, G L1852); WR:41/65 bind only the quick clock**  
   Rows: `LEDGER-ENGINE-GEMINI.md:272`, `LEDGER-ENGINE-GEMINI.md:541`, `LEDGER-ENGINE-GEMINI.md:547`, `LEDGER-ENGINE-GEMINI.md:708`
9. **A deck idea is locked out for 4 draws after it is laid, and a template appears in at most 3 of the world's stages (ES G #34 L1839, C14 L1761); WR:122's "no idea twice in a row" is weaker**  
   Rows: `LEDGER-ENGINE-GEMINI.md:321`, `LEDGER-ENGINE-GEMINI.md:618`, `LEDGER-ENGINE-GEMINI.md:642`, `LEDGER-ENGINE-GEMINI.md:643`, `LEDGER-ENGINE-GEMINI.md:646`, `LEDGER-ENGINE-GEMINI.md:656`, `GEMINI-PCG-RESEARCH.md:23`, `GEMINI-PCG-RESEARCH.md:177`, `GEMINI-LEDGER.md:36`, `LEDGER-ENGINE-GEMINI.md:504`
10. **Every gate (pacing, flags, dead time) judges both roads of every fork, not only the bot's route (EP:167, EP:242)**  
   Rows: `LEDGER-ENGINE-PAPERS.md:167`, `LEDGER-ENGINE-PAPERS.md:242`
11. **W1's section pool holds at least 14 distinct section types, more whenever a stage only scrapes past the variety gates (ES C24 L1771; CLAUDE.md variety rule, Matt 10-30)**  
   Rows: `R1-shipped-pipelines.md:48`, `R2-academic-pcg.md:36`, `R2-academic-pcg.md:522`, `R4-mobile-and-architecture.md:51`, `GEMINI-PCG-RESEARCH.md:240`
12. **A roll stays until the stage is cleared: a death never re-rolls the layout (R1:546; gen2 today keeps the layout until cleared, ES F1 P2:196)**  
   Rows: `R1-shipped-pipelines.md:546`
