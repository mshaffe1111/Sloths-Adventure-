# CRITIC-TRACE: every research row against ENGINE-SPEC.md (engine critic, 2026-11-05)

Spec: `reference/engine/ENGINE-SPEC.md` at engine-spec 7f4373c0 ("L" = its line). One row per research row, by the rule in
`tools/engine/trace-rows.mjs`; `node tools/engine/trace-check.mjs` fails if a row is missing, extra or stale. Read by eight readers
(each read the whole spec and its files), then audited by the critic (a 12-row random sample: 9 held, 3 over-credited and corrected,
marked "[critic audit]"). So "used" is an upper bound. "R1-R5" in a MISSING row's note: how much it fights "it's just repetitive".

### reference/research/ledger/LEDGER-2026-11-02-full.md
198 rows: used 25, partial 68, missing 39, contradicted 9, n/a 57

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `LEDGER-2026-11-02-full.md:24` | Y | Each stage is built around one named mechanic pair as its identity; no two stages of a world share pair plus direction | PARTIAL §Stage profile L1213,L1222-1224: story moment, owns and unlike exist; no named mechanic pair per stage, no pair+direction neighbour rule | 1-5's identity is one theme mechanic (creaky, L457), not a pair; the feel check (L1042) compares pieces and shape, not mechanic pairs. |
| `LEDGER-2026-11-02-full.md:33` | Y | A pair counts only when both mechanics act on the same beat, not merely both present in the stage | PARTIAL §C Mixing L1321,L1569-1583: one joined beat per world (or per move's world); the variety gate counts pieces and ideas, never one-beat interactions | Nine joined beats for the whole game (L1573-1583) is far below one-beat pairing as a stage-building rule. |
| `LEDGER-2026-11-02-full.md:42` | Y | A world's own mechanic returns in later worlds without re-teaching, as the twist for the new world's mechanic | PARTIAL §C L1550,L1569-1583: re-teach only a new variant (matches); joined beat once per world; webs, geysers, bolts never leave home (L1302,L1560-1561) | Core moves must keep returning (L1533-1548), but 'as the twist' is only the single joined-beat stage per world. |
| `LEDGER-2026-11-02-full.md:54` | Y | Every node and stage tags its direction (across, up, down); each pair used in two directions; each world has a going-down stretch | PARTIAL §Stage profile L1214; L944: stage arc (rises/descends/level/wave) only; no node direction tag, no per-world direction rule | 1-1 up vs 1-5 down (L944) is the only direction rule; nothing makes worlds 2-10 vary direction. |
| `LEDGER-2026-11-02-full.md:62` | Y | Each world slot has its own camera direction, density and thinking mode; nine stages sharing them feel the same | PARTIAL §feel check L1036-1044; §Stage profile L1218: neighbours compared on branching, up/down, density, kinds; no slot roles, no thinking mode (hands/head/stealth) | Spec keeps every world's stages as they are (L1462); slot-level camera/density/mode never assigned. |
| `LEDGER-2026-11-02-full.md:72` | Y | The twist must break the rhythm just learned; the checker compares part 3 with part 2 | PARTIAL §1-5 plan L347; §Design L1121: a twist job and rhythm patterns are named; nothing checks the twist changes rhythm or mechanics | 1-5's twist is a rotten-branch drop (L347); no rule that it differs from the test node's rhythm. |
| `LEDGER-2026-11-02-full.md:78` | Y | Finale is a 15-20 s dense group of everything the stage taught, ending at the exit | CONTRADICTED L351,L1075: a cool-down node follows the master node before the shrine; no dense-finale rule | The validator already allows it (FINALE_TIGHT_MAX 20, /home/user/mix/tools/validate/core.ts:309); the spec never uses it. |
| `LEDGER-2026-11-02-full.md:86` | Y | Density climbs through the four parts: low at the start, densest group in the last quarter | PARTIAL §Difficulty dial L655; §1-1 profile L1050: a test node may sit higher than a warm-up; no in-stage density-order check | Pace lines (L508-511, L799-800) cap density and runs stage-wide; none orders them through the stage. |
| `LEDGER-2026-11-02-full.md:93` | Y | Same pieces feel new by feel alone: long momentum leaps versus small precise apex moves; neighbours alternate | PARTIAL §feel profile L1037-1038; §Difficulty dial L640-642: gaps and landings set by d only; the profile has no leap-versus-precision field | Would vary neighbouring stages from the same kit at no art cost. |
| `LEDGER-2026-11-02-full.md:100` | Y | Two tempos inside one beat (sprint crumbling ledges, stop on a thorn vine); dual clocks (fast floors, slow enemy cycle) | PARTIAL §Design L1121: a 'wait-and-go' rhythm pattern is named only; no tempo-switch templates or count | One line in the spec; no deck or node uses it. |
| `LEDGER-2026-11-02-full.md:109` | Y | Each world has a named hurry/patience tempo polarity, different from the world before | MISSING | R5: a per-world tempo identity separates worlds that share a library; the world table (L1495-1506) gives moves and hazards, never tempo. |
| `LEDGER-2026-11-02-full.md:116` | Y | Slow-downs come in two kinds (contact, volume); a slow field pushes the player up to a better high route | MISSING | R4: a new two-height node family from existing zones; the spec's forks (L344, L405-412) never put slow ground under the low road. |
| `LEDGER-2026-11-02-full.md:124` | Y | Every world's X-8 has a moving pressure (chase, rising water, closing light, squall front) | MISSING | R4: gives each world a distinct stage kind; the spec keeps only 1-8's chase and 2-8 as built (L1497-1498). |
| `LEDGER-2026-11-02-full.md:130` | Y | X-9 previews the boss's attack patterns in a small form | MISSING | R3: every X-9 is an animal gauntlet today; a per-boss preview gives ten different X-9 stages. |
| `LEDGER-2026-11-02-full.md:136` | Y | Each act has its own mechanical job: calibrate then flip speed; outside forces; three- and four-way combinations | MISSING | R3: the dial d is one straight line over the game (L628); nothing shapes what kind of change each act brings. |
| `LEDGER-2026-11-02-full.md:144` | Y | Difficulty is felt through checkpoint spacing: at most 1-2 hard groups between flags, back at the hard part within 2 s | PARTIAL §Placement rule 3 L296-303,L426-431: a flag before each hard node, at most 4,000 px apart; allows 45 s to the hard node, spacing fixed | 45 s (L300, L303) against the research's 2 s; see notes (c). |
| `LEDGER-2026-11-02-full.md:151` | Y | An optional hard branch in the twist with the big find at its top; three risk tiers of finds | PARTIAL §Placement rule 4 L304-312; L358-359,L828: hard collectibles in hard nodes and fork high roads; finds (note, keepsake, book) not tiered or placed | The spec's tiers are petals versus marks/carvings, not the game's three find kinds. |
| `LEDGER-2026-11-02-full.md:159` | Y | World 10: one world-wide storm rhythm; on the flash hold on; sprint in 5-10 s calm gaps | PARTIAL §moves L1299; §B L1506; §C L1555,L1583: hold on the flash planned (R-2.7), wind returns to W10; no 5-10 s calm-gap rhythm | No rule that the hold works without a new button (be on a climb), as the ledger proposes. |
| `LEDGER-2026-11-02-full.md:167` | Y | Build pieces for pairs with none: crumbling patch in a web, hop-to-skim silk bridge, gust lane over lianas | MISSING | R3: new beats from existing zones; none is in the spec's idea lists (L154-172, L536-545). |
| `LEDGER-2026-11-02-full.md:174` | Y | Allow one exact repeat in part 2 to build the feel; the third use must change | CONTRADICTED L243,L391: every repeat of an idea is a new kind x size; never the same burst twice in a stage | Spec is stricter than the research; low risk to repetition. |
| `LEDGER-2026-11-02-full.md:180` | Y | Pickup spacing sets the tempo (closer carvings speed a chase); never counts as variety | MISSING | R2: a tempo lever only; petals are placed as breadcrumbs (L305) and the profile's petal style (L1038) has no spacing-as-tempo. |
| `LEDGER-2026-11-02-full.md:185` | N | A short 2-4 line retry intro for every boss | n/a: boss scene timing, not stage generation |  |
| `LEDGER-2026-11-02-full.md:190` | N | Losing a companion changes how the game guides (Dot's chatter stops, Flicker's terse cues) | n/a: story and companion dialogue |  |
| `LEDGER-2026-11-02-full.md:202` | Y | Let the last group (and X-8's) run 15-20 s dense; 'never T-T' comes from other research | MISSING | R2: code already has FINALE_TIGHT_MAX 20 (tools/validate/core.ts:309); the spec plans no dense finale and ends on a cool-down (L351). |
| `LEDGER-2026-11-02-full.md:203` | Y | Rhythm groups of 5/10/15/20 s; density low/medium/high by part; stage band kept as the average | PARTIAL §rests L508; L801-803: one stage-wide density band per setting; no per-part density | Easy 0.35-0.55 a second over the whole stage; Normal's density judged on runs only. |
| `LEDGER-2026-11-02-full.md:204` | Y | The finale ends at the exit: walk-out at most about 3 s, or none | CONTRADICTED L351,L1075: a cool-down node after the master; 1-1's n11 is 'one long high branch' to the shrine |  |
| `LEDGER-2026-11-02-full.md:205` | Y | Part 2 may repeat a pattern once for muscle memory, then change | CONTRADICTED L243,L391: no exact repeat inside an idea, never the same burst twice |  |
| `LEDGER-2026-11-02-full.md:206` | Y | Fix mechanic classes: World 7 crumble is breaking, tide and drowsy cloud are slow, geyser lift is wind | MISSING | R2: misclassed mechanics make a stage read as varied; the spec lists crumbling floors as a W7 hazard (L1302) with no class map. |
| `LEDGER-2026-11-02-full.md:207` | Y | Wind has both tempos: a tailwind needs braking, a headwind needs steady push | MISSING | R2: doubles wind's uses where it returns (W4, W8, W10, L1555). |
| `LEDGER-2026-11-02-full.md:208` | Y | A pair is an interaction inside one beat, not two things present anywhere | PARTIAL §C L1321,L1569-1583: one joined beat per world; the gates count presence | Same gap as miss 2 (line 33). |
| `LEDGER-2026-11-02-full.md:209` | N | Never place a before-stage cutscene at X-6 | n/a: story scenes; the game has none |  |
| `LEDGER-2026-11-02-full.md:230` | N | World 10 has no grip input and no wind, only lightning; 10-3/10-4 goal lines promise holding on | n/a: correction of the report's claim about our code, not a design idea | Spec agrees: hold is 'planned' (R-2.7, L1299). |
| `LEDGER-2026-11-02-full.md:231` | N | The report's world names are wrong (Mist Cascades, Ancient Ruins, Stormy Highlands Fortress) | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:232` | N | Webs are plain drag (0.4 run, 0.85 jump), not sticky-only-if-grounded | n/a: correction of the report's claim about our code, not a design idea | Spec names webs only as a W5 hazard (L1302). |
| `LEDGER-2026-11-02-full.md:233` | N | 2-3's reeds are dressing; there is no reed zone | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:234` | N | 2-8 has timed flood basins, not autoscroll rising water | n/a: correction of the report's claim about our code, not a design idea | Spec keeps 2-8 as built (L1498). |
| `LEDGER-2026-11-02-full.md:235` | N | 2-6 is World 1's kapok climb rebuilt on the bank | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:236` | N | 1-9 is fights; the crumble-to-liana bail-out is on 1-6's canopy road | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:237` | N | The glowworm lesson is 3-2's, not 3-1's | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:238` | N | 3-4 holds ropes, hops, thorn shelves and prowlers, no collapsing ledges | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:239` | N | Thorn vines lash at movement in reach; Pokey never climbs one | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:240` | N | The Horn is a story memory scene, not a playable sprint | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:241` | N | 6-3's seesaw is in its puzzle room, weighed with root-stones | n/a: correction of the report's claim about our code, not a design idea | Spec agrees: 'seesaw exists (W6)' (L162). |
| `LEDGER-2026-11-02-full.md:242` | N | The rising spear is a watcher on 6-2; 6-5 is a fight stage | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:243` | N | 7-5's sentries fight with the ocelot's brain | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:244` | N | 7-6 is a sprint, the fastest crumble (0.85 to 0.61 s) | n/a: correction of the report's claim about our code, not a design idea | Spec's Normal crumble dial 0.9 to 0.5 s (L646) spans it. |
| `LEDGER-2026-11-02-full.md:245` | N | 7-2 has brown vines; nothing brittle or shorter | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:246` | N | 8-8's danger is the night harpy, no nets | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:247` | N | No wind outside World 4; World 8's zone is darkness | n/a: correction of the report's claim about our code, not a design idea | Spec plans wind back in W8 and W10 as new work (L1555). |
| `LEDGER-2026-11-02-full.md:248` | N | 9-3 Ember Canopy is a vine stage | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:249` | N | 9-6 is a fight stage; drag exists only for webs and tide | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:250` | N | 9-2 is a climb; no rising-hazard zone kind exists | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:251` | N | No posters or ledger pages; finds are note, keepsake, book, pocket, notch, snail | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:252` | N | The game has no before-stage scenes | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:253` | N | Short boss retry intro exists for World 10 only | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:254` | N | Scene caps are not enforced by any test | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:255` | N | No 15-word bubble split; boxes are capped at 300 characters | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:256` | N | Dot comes back at the start of World 8 | n/a: correction of the report's claim about our code, not a design idea |  |
| `LEDGER-2026-11-02-full.md:269` | Y | Fatigue: stages lack own identity, pacing flattened to even difficulty, same rhythm repeated without new context; more abilities is not the fix | PARTIAL §The variety gate L30-41; §feel check L1036-1044; §Design L1121: repeats and neighbour likeness checked; per-stage mechanical identity unnamed | Per-stage identity is only the story moment and owns (L1213, L1222). |
| `LEDGER-2026-11-02-full.md:270` | Y | Layering: combine known pieces into new challenges with no new rules | §shared library L122-133; §More used L1320-1321 |  |
| `LEDGER-2026-11-02-full.md:271` | Y | Four modifiers give 15 combinations; with run and jump, 15 pairs of six | MISSING | R3: a pair-coverage count per world would force new combinations; the spec counts piece kinds and ideas only. |
| `LEDGER-2026-11-02-full.md:272` | Y | Each combination is multiplied by direction (across, up, down) and tempo | PARTIAL §Stage profile L1214,L1218: a stage arc and a pace word; not per combination |  |
| `LEDGER-2026-11-02-full.md:273` | Y | Tempo inversion: every modifier has a hurry and a patience version, weighted equally | MISSING | R4: doubles each mechanic's uses across worlds; patience ideas (stalactites, sleeping bat, L160-161) are parked items, no hurry/patience rule. |
| `LEDGER-2026-11-02-full.md:274` | Y | Hurry examples: breaking branches need buffered jumps; sticky silk punishes lingering | PARTIAL §CP2 node ideas L80; §Difficulty dial L646: snap-twig dash keeps him moving; no silk-lingering beat |  |
| `LEDGER-2026-11-02-full.md:275` | Y | Patience examples: thorn vines strike when hurried; glowworms light when still; squalls make you stop and grip | PARTIAL §moves L1299; §hazards L1302: hold on the flash planned; thorns and dark listed as hazards, not patience beats; no glowworms |  |
| `LEDGER-2026-11-02-full.md:276` | Y | Worlds swing between urgency and patience, doubling the functional variety | MISSING | R5: world-level tempo alternation directly fights worlds feeling alike; absent from the world table (L1495-1506). |
| `LEDGER-2026-11-02-full.md:282` | Y | Same tiles feel distinct if one stage asks for momentum leaps and another for apex micro-positioning | PARTIAL §feel profile L1037-1038: no leap-versus-precision field; gap and landing set by d (L640-642) |  |
| `LEDGER-2026-11-02-full.md:283` | N | Physics ranges across known games (run, acceleration, take-off, fall speeds) | n/a: player physics constants, not the level engine |  |
| `LEDGER-2026-11-02-full.md:284` | N | Forgiveness windows keep hard combinations from becoming pixel hunts | n/a: player physics (built) | Spec relies on per-jump bot floors instead (L651). |
| `LEDGER-2026-11-02-full.md:285` | N | Coyote time 0.08-0.15 s, also after a support breaks away | n/a: player physics (built) |  |
| `LEDGER-2026-11-02-full.md:286` | Y | Snap twig breaks in about 0.15 s: keep sprinting | PARTIAL §Difficulty dial L646: one crumble delay, 0.9 to 0.5 s Normal; no 0.15 s snap kind | Spec's 1-5 'snap twigs' are creaking limbs (L1147-1148); see notes (c). |
| `LEDGER-2026-11-02-full.md:287` | Y | Creaking limb gives about 0.60 s to recover | §Difficulty dial L646; §CP2 L227-228 | Normal 0.9 to 0.5 s spans 0.60; Easy 1.0 s (L227) and 1.2 to 0.8 s (L646). |
| `LEDGER-2026-11-02-full.md:288` | Y | Cantilever root tips on a pivot by where he stands, doesn't vanish | PARTIAL §unused-art ideas L162,L204: counterweight/seesaw parked as a small build for Matt's pick; in no deck |  |
| `LEDGER-2026-11-02-full.md:289` | N | Jump buffer 0.10-0.15 s, fires on the landing frame | n/a: player physics (built) |  |
| `LEDGER-2026-11-02-full.md:290` | Y | Two kinds of slow-down: contact (sticky only while on it) and volume (caps speed on entry) | MISSING | R3: slow-down variants give later worlds new beats from existing zones; spec names webs only as a W5 hazard (L1302). |
| `LEDGER-2026-11-02-full.md:291` | Y | A wading field pushes the player up to a high route (stilt roots, vines) | MISSING | R4: a world-specific reason for the high/low fork; the spec's forks never use slow ground. |
| `LEDGER-2026-11-02-full.md:292` | N | Half gravity at the top of a held jump | n/a: player physics (R-156) |  |
| `LEDGER-2026-11-02-full.md:293` | N | Cut upward speed to 30-50% on release | n/a: player physics (built) |  |
| `LEDGER-2026-11-02-full.md:294` | N | Fall gravity stronger than rise | n/a: player physics (built) |  |
| `LEDGER-2026-11-02-full.md:295` | Y | Updrafts and leaf glide override top fall speed; some vents required once taught | §moves L1295-1296; §C L1530,L1545; §More used L1311 | Warm air must come back in at least 3 stages each in W8 and W9 (L1545), with required uses (L1311). |
| `LEDGER-2026-11-02-full.md:296` | N | Lift momentum: a moving platform's speed carries into his jump | n/a: player physics (R-152.7), outside the level mixer | The spec's moving-platform ladder (L1543) would need it in the reach model. |
| `LEDGER-2026-11-02-full.md:297` | Y | Vines as four instruments: ladder, wide catapult, line sinking toward danger, reacting hazard | PARTIAL §CP2 L82; §moves L1286,L1289; §B L1499,L1504: climb, liana, rope, thorn swing, long swings; no catapult or sinking line |  |
| `LEDGER-2026-11-02-full.md:306` | Y | Run+Jump is always present, so leave it out of the pair count | §More used L1320; §C L1570 | Spec counts 'core moves besides run and jump', as proposed. |
| `LEDGER-2026-11-02-full.md:307` | Y | Run+Branches: stop and you fall; read the path and commit | §CP2 node ideas L80; §1-5 plan L342,L346 |  |
| `LEDGER-2026-11-02-full.md:308` | Y | Run+Vines: a running leap into a vine turns speed into swing size | PARTIAL §CP2 L82: vine relay; no running-entry use |  |
| `LEDGER-2026-11-02-full.md:309` | Y | Run+Wind: a tailwind needs braking on narrow ledges, a headwind steady push | PARTIAL §C L1555: wind returns to W4, W8, W10; no tail/head variants |  |
| `LEDGER-2026-11-02-full.md:310` | Y | Run+Slow: stutter-step out of drag, or stop dead to light glowworms | MISSING | R3: a shipped patience beat the ladder never lists, so it never returns (W8's caves would fit). |
| `LEDGER-2026-11-02-full.md:311` | Y | Jump+Branches: short jumps up stacked crumbling tiers (a crumbling-tier shaft) | PARTIAL §1-5 plan L344; L737: creaky boughs on runs and canopy entries; no vertical crumbling shaft |  |
| `LEDGER-2026-11-02-full.md:312` | Y | Jump+Vines: let go at the 45-degree top of the swing with carried speed | PARTIAL §CP2 L82: vine relay; release carry is physics (R-152.7, R-156) |  |
| `LEDGER-2026-11-02-full.md:313` | Y | Jump+Wind: a headwind shortens the jump; a glide in an updraft turns gusts into height | §unused-art L163; §moves L1296; §C L1545,L1577 |  |
| `LEDGER-2026-11-02-full.md:314` | Y | Jump+Slow: buffered hops skim sticky silk (a hop-to-skim silk bridge) | MISSING | R2: a W5-only piece; webs appear only as a hazard name (L1302). |
| `LEDGER-2026-11-02-full.md:315` | Y | Branches+Vines: bail out from a breaking branch onto a vine | MISSING | R3: a combo from shipped pieces (on 1-6) that could recur in every tree world; spec has no bail-out beat. |
| `LEDGER-2026-11-02-full.md:316` | Y | Branches+Wind: wind pushes him off a crumbling branch before it breaks | PARTIAL §C L1321,L1538,L1555: creaky and wind both due in W4, W8, W10; nothing makes them meet on one beat |  |
| `LEDGER-2026-11-02-full.md:317` | Y | Branches+Slow: a surface that slows and crumbles; short hops, no walking | MISSING | R2: a crumbling patch inside a web, one piece from existing zones. |
| `LEDGER-2026-11-02-full.md:318` | Y | Vines+Wind: gusts change a hanging vine's angle and period, making timing gates | MISSING | R3: lianas and wind both return in W8/W10 (L1537, L1555); a gust-vine beat varies both. |
| `LEDGER-2026-11-02-full.md:319` | Y | Vines+Slow: thorn vines strike if climbed fast; slow hand over hand | PARTIAL §B L1499; §C L1556,L1576: thorns as hazard and thorn swing; no speed-sensitive climb |  |
| `LEDGER-2026-11-02-full.md:320` | Y | Wind+Slow: gales blow him back unless anchored in mud or roots, or gripping | PARTIAL §moves L1299; §C L1555: hold on the flash planned; no anchor-against-gale beat |  |
| `LEDGER-2026-11-02-full.md:321` | Y | The 15 pairs are interactions inside one beat | PARTIAL §C L1321,L1569-1583: one joined beat per world; no per-beat pair count |  |
| `LEDGER-2026-11-02-full.md:327` | Y | Merge Smith's rhythm groups with Hayashida's four steps | §move ladder L118-119; §CP3 bursts L390-391; §Design L1121 | Teach/test/twist/master jobs and bursts carry it; groups are counted in pieces, not seconds. |
| `LEDGER-2026-11-02-full.md:328` | Y | Cells: stretches between checkpoints or branch points, joined by portals | PARTIAL §mix rule L251; §Placement rule 1 L278-283: nodes with entry/exit joins; flags are not cell edges, no portals |  |
| `LEDGER-2026-11-02-full.md:329` | Y | Rhythm groups of 5/10/15/20 s with a beat pattern and low/medium/high density | PARTIAL §CP3 bursts L390; §Design L1121: bursts of 4-6 pieces and rhythm patterns; no group seconds or per-group density | Normal's run without rest may reach 29 s (L799-800), over the 20 s group. |
| `LEDGER-2026-11-02-full.md:330` | Y | Groups never run into each other: a rest with no hard input between every two | PARTIAL §rests L503,L509; L799: Normal pad only after every second burst; Easy breather between nodes | See notes (c). |
| `LEDGER-2026-11-02-full.md:331` | Y | Every 3-5 minute stage is a four-act showcase for ONE specific mechanic pair | PARTIAL §1-5 plan L457,L520: one theme mechanic taught, tested, mastered; not a pair, not required of every stage |  |
| `LEDGER-2026-11-02-full.md:332` | Y | The four-part plan on all 90 non-boss stages, each under 5 minutes | CONTRADICTED L665: 'No cap: over 5 minutes is fine' (Matt's ruling) | Node jobs carry the four parts (L339-351); 1-5 Easy accepted at 4:21-4:33 (L830). |
| `LEDGER-2026-11-02-full.md:333` | Y | Part 1: one or two short low-density groups over solid ground or harmless water | §1-5 plan L341-342; §1-1 plan L1065-1066; §Difficulty dial L652 |  |
| `LEDGER-2026-11-02-full.md:334` | N | Example: 2-4's first vine hangs over a dry bank | n/a: example of a shipped stage |  |
| `LEDGER-2026-11-02-full.md:335` | N | Example: 6-6's Flicker shows one low step with no drop | n/a: example of a shipped room |  |
| `LEDGER-2026-11-02-full.md:336` | Y | The first rest is a checkpoint and holds the stage's one wayside line | §1-5 plan L345; §1-1 plan L1070 | The 15-word box cap is not in the spec (story side). |
| `LEDGER-2026-11-02-full.md:337` | Y | Part 2: the safety floor goes; chained transfers at medium density | §1-5 plan L346; §Difficulty dial L643 | No medium-density number. |
| `LEDGER-2026-11-02-full.md:338` | Y | Part 2 may repeat one pattern before the rest, for muscle memory | CONTRADICTED L243,L391: repeats must change kind x size; never the same burst twice |  |
| `LEDGER-2026-11-02-full.md:339` | Y | Part 3, the twist: a new context or second mechanic that breaks the learned rhythm | PARTIAL §1-5 plan L347: the twist job is a rotten-branch drop; nothing checks it breaks the rhythm |  |
| `LEDGER-2026-11-02-full.md:340` | Y | Twist templates: crosswind blows vines toward thorns; the landing ledge turns into a breaking branch | MISSING | R3: reusable twist templates across worlds; the spec's twists are single ideas per node. |
| `LEDGER-2026-11-02-full.md:341` | Y | Part 3 holds a portal: an optional hard branch to a collectible | §Placement rule 4 L306-307; §1-5 plan L344,L350; L358-359 | The optional hard roads are forks at n4 and n10, not inside the twist node. |
| `LEDGER-2026-11-02-full.md:342` | N | Portal example: 2-4's page on the highest vine mid-river | n/a: example; ledger pages don't exist |  |
| `LEDGER-2026-11-02-full.md:343` | Y | A short recovery, then a 15-20 s dense group of everything taught, ending at the exit | CONTRADICTED L351,L1075: a cool-down node follows the master | Same as miss 7 (line 78). |
| `LEDGER-2026-11-02-full.md:344` | Y | The finale empowers because the timing was taught; a quick ending into the next stage | PARTIAL §Rules by construction L520: the master uses the taught mechanic; the cool-down node (L351) delays the end |  |
| `LEDGER-2026-11-02-full.md:350` | Y | A world feels repetitive if its stages share tempo, camera direction and thinking load | PARTIAL §feel check L1042-1044: neighbours compared on branching, up/down, density, kinds; no thinking load or camera |  |
| `LEDGER-2026-11-02-full.md:351` | Y | Each slot X-1..X-10 has its own job; alternate fast runs, climbs, puzzle/stealth breaks, breathers | PARTIAL §Stage profile L1218; §whole-game L1462: a pace word per stage; stages kept, no slot-job alternation |  |
| `LEDGER-2026-11-02-full.md:352` | N | Between-stage scenes capped at 6 pictures and under 30 s | n/a: story scenes |  |
| `LEDGER-2026-11-02-full.md:353` | Y | X-1 arrival: across left to right, low-medium density, forgiving floors | PARTIAL §Difficulty dial L631-632: a new world eases in by d; no camera or density per slot |  |
| `LEDGER-2026-11-02-full.md:354` | Y | X-2 teaches the world's mechanic, across with gentle slopes, medium density | PARTIAL §B L1497-1506; §move ladder L114: a teach stage per move named; not tied to X-2 or a direction |  |
| `LEDGER-2026-11-02-full.md:355` | Y | X-3 tight terrain: confined or rolling, slow-downs or shape traps, tests small positioning | MISSING | R3: a slot role gives each world's third stage its own shape; the spec has no slot roles. |
| `LEDGER-2026-11-02-full.md:356` | Y | X-4 wide gaps, air or a vertical drop; brings in vines or wind; 10-15 s groups | MISSING | R3: a slot role per world; absent. |
| `LEDGER-2026-11-02-full.md:357` | Y | X-5 mid-world spike: many tiers, hazard-driven, high density | PARTIAL §Difficulty dial L628,L655: d rises linearly per stage; no X-5 spike then X-6 dip |  |
| `LEDGER-2026-11-02-full.md:358` | Y | X-6 change of pace: a sense flipped, climb or dark/puzzle room, low tempo | MISSING | R4: a slow stage after the spike breaks world-long sameness; the pace word (L1218) has no slot rule. |
| `LEDGER-2026-11-02-full.md:359` | Y | X-7 exploring with branches: non-linear cells and portals, mixed rhythm | PARTIAL §Stage profile L1217; §B L1499,L1503: a branching field; 3-6/3-7/7-7 searches kept as built |  |
| `LEDGER-2026-11-02-full.md:360` | Y | X-8 high-speed layering: rising hazard or autoscroll pressure, 15-20 s groups, 3+ mechanics | MISSING | R4: same as miss 13 (line 124); a moving pressure per world. |
| `LEDGER-2026-11-02-full.md:361` | Y | X-9 pre-boss run shows the boss's attack patterns ahead | MISSING | R3: same as miss 14 (line 130). |
| `LEDGER-2026-11-02-full.md:362` | N | X-10 boss: one-screen arena, dodge a wave, hit the weak spot; short intro and retry | n/a: boss lairs, kept as built (L1462) |  |
| `LEDGER-2026-11-02-full.md:363` | Y | After X-5, X-6 switches the kind of thinking; alternate dexterity with reasoning and stealth | PARTIAL §1-5 plan L349; §C L1541-1542: puzzle beats and stealth stages named; no stage-level alternation | 1-5's n9 puzzle beat lost its push block (L375-377). |
| `LEDGER-2026-11-02-full.md:369` | Y | The whole game is one big four-part arc across three acts | MISSING | R3: the dial is linear (L628); no act-level mechanical shape. |
| `LEDGER-2026-11-02-full.md:370` | Y | The failure to avoid: a world's gimmick taught, then dropped (wind in W4, gone in W5) | PARTIAL §A L1466-1481; §C L1533-1561; gate L1615: moves must return; zone hazards return only in listed worlds, webs/geysers/bolts never | Wind returns in W8 and W10 (L1555), never W5. |
| `LEDGER-2026-11-02-full.md:371` | Y | An early world's main mechanic returns, without re-teaching, as the twist for the new world's mechanic | PARTIAL §C L1550,L1569-1583: no re-teach unless a new variant; joined beat only once per world |  |
| `LEDGER-2026-11-02-full.md:372` | Y | W1: run, jump, still vines, basic breaking branches; twist branch-to-vine bail-outs | PARTIAL §B L1497: W1's moves listed; no bail-out twist |  |
| `LEDGER-2026-11-02-full.md:373` | Y | W2: swing vines, vertical breaking branches; twist rising water and reed drag | PARTIAL §B L1498; §C L1538: creaky returns to W2; no reed drag or rising-water twist |  |
| `LEDGER-2026-11-02-full.md:374` | Y | W3: patience slow-downs, speed-sensitive vines; dark and light, sinkholes; inverted polarity | PARTIAL §B L1499; §C L1535,L1538: dark, spores, thorns; bounce and creaky return; no patience polarity |  |
| `LEDGER-2026-11-02-full.md:375` | Y | W4: wind, leaf glide, vertical branches; dives, freefall; headwind and lift polarity | PARTIAL §B L1500; §C L1538,L1544-1545: wind and glide placed; no headwind/lift polarity per world [critic audit: was "used"] | Polarity is not named. |
| `LEDGER-2026-11-02-full.md:376` | Y | W5: contact slow-downs, timed closing platforms, trap rests, humming threads; impulse polarity | PARTIAL §B L1501: W5 keeps its own kit; contact slow-down not specified |  |
| `LEDGER-2026-11-02-full.md:377` | Y | W6: wading and swimming slow-downs, tipping roots; firefly steps, water-level puzzle | PARTIAL §B L1502; §D L1585-1610: swim and tide; no wading slow-down; tipping roots only parked (L162) |  |
| `LEDGER-2026-11-02-full.md:378` | Y | W7: brittle vines, sequential floors; twist fastest floors against slowest sentries | PARTIAL §B L1503; §C L1580: crumbling floors kept, a push onto a lift; no dual-clock twist |  |
| `LEDGER-2026-11-02-full.md:379` | Y | W8: momentum vines, wind glides; light radius, firefly trail, net traps | §B L1504; §C L1545,L1554-1555 | No net traps. |
| `LEDGER-2026-11-02-full.md:380` | Y | W9: updrafts, ash drag; rising heat, lava steps, ember branches | PARTIAL §B L1505; L1509; §unused-art L169: warm air, heat, lava only in W9; hot rocks parked; no ash drag |  |
| `LEDGER-2026-11-02-full.md:381` | Y | W10: all six together; squalls with grip-and-wait; the General's shifting weak spot | §B L1506; §moves L1299; §C L1555,L1583 | Hold is planned (R-2.7); the weak spot is boss work. |
| `LEDGER-2026-11-02-full.md:387` | Y | Act I calibrates the player's sense of the physics, then flips what he assumes about speed | MISSING | R2: acts are absent; only the move order exists (L1280-1299). |
| `LEDGER-2026-11-02-full.md:388` | Y | W1 in bright daylight with generous safety floors | §Difficulty dial L630-633,L651; §1-1 L1014 |  |
| `LEDGER-2026-11-02-full.md:389` | Y | W2 is the comic, relaxed world that widens the swings | PARTIAL §Difficulty dial L631: a new world eases in; no tone or swing widening |  |
| `LEDGER-2026-11-02-full.md:390` | Y | 2-3: the first slow-down teaches that a vine route above beats wading below | MISSING | R3: same idea as miss 12; a W2 teach that would seed slow-ground forks later. |
| `LEDGER-2026-11-02-full.md:391` | Y | 2-4: vines as catapults over wide river gaps | MISSING | R2: a vine variant; the spec's vine kinds (L1286, L1289) lack it. |
| `LEDGER-2026-11-02-full.md:392` | Y | 2-6 turns the camera vertical: timed jumps up tiered doors and breaking eaves | MISSING | R2: 2-6 reuses W1's climb; the spec keeps worlds 2-10 as they are for now (L1462, L1629). |
| `LEDGER-2026-11-02-full.md:393` | Y | 2-8: rising floodwater turns slow-downs into moving pressure, practice for the boss | MISSING | R3: 2-8 is kept as a built cage stage (L1498); the pressure idea is unused. |
| `LEDGER-2026-11-02-full.md:394` | Y | W3: the first big reversal; the dark replaces W2's forward hurry | PARTIAL §B L1499: dark as W3's hazard; no tempo reversal |  |
| `LEDGER-2026-11-02-full.md:395` | Y | 3-1/3-2: glowworms light safe footing only while he stands still and listens | MISSING | R3: a shipped patience mechanic missing from the move ladder (L1280-1299) and hazard list (L1302), so nothing brings it back. |
| `LEDGER-2026-11-02-full.md:396` | Y | 3-4: breaking branches return as collapsing cave ledges over vertical pits | §C L1538; §unused-art L165 |  |
| `LEDGER-2026-11-02-full.md:397` | Y | Late W3: sprint over crumbling ledges, then slow right down on catching a thorn vine | MISSING | R3: a two-tempo template from W3's own pieces. |
| `LEDGER-2026-11-02-full.md:398` | N | The Horn: an unwinnable crumbling sprint after the boss | n/a: story scene |  |
| `LEDGER-2026-11-02-full.md:399` | Y | 4-2's leaf cuts fall speed; 4-4's wind opposes his run and shortens jumps | §moves L1295; §B L1500 |  |
| `LEDGER-2026-11-02-full.md:400` | Y | 4-5: dives from above; alternate crosswind platforming with ducking under rock overhangs | PARTIAL §unused-art L156; §moves L1291: hiding from the eagle; no crosswind/cover alternation |  |
| `LEDGER-2026-11-02-full.md:401` | Y | 4-D: Dot's fast flight as counterpoint; 4-7 freefall steering through wind | §B L1500 | Kept as built special stages. |
| `LEDGER-2026-11-02-full.md:402` | Y | 5-2: the rest spots are the traps; the wish to rest is used against him | §B L1501 | W5 keeps its own kit. |
| `LEDGER-2026-11-02-full.md:403` | Y | 5-3: platforms that fold shut early on a rhythm | PARTIAL §B L1501: World 5 keeps its own kit; folding-on-a-rhythm platforms are not named [critic audit: was "used"] |  |
| `LEDGER-2026-11-02-full.md:404` | Y | 5-4, 5-5, 5-7: silk only grabs if you stay down; hop on the first landing frame | MISSING | R2: a W5 surface rule; webs appear only as a hazard name (L1302). |
| `LEDGER-2026-11-02-full.md:405` | Y | 5-6: Meeca's carvings placed closer together push a fast chase rhythm | MISSING | R2: pickup spacing as tempo (miss 21). |
| `LEDGER-2026-11-02-full.md:406` | Y | 6-3: seesaw roots tip under his weight | PARTIAL §unused-art L162,L204: 'seesaw exists (W6)'; counterweight parked |  |
| `LEDGER-2026-11-02-full.md:407` | N | 6-5: spears rise out of flat black water | n/a: the report misplaces a shipped 6-2 watcher; keep |  |
| `LEDGER-2026-11-02-full.md:408` | N | When Dot leaves, her chatter stops and Flicker gives short cues | n/a: story and dialogue |  |
| `LEDGER-2026-11-02-full.md:409` | Y | 6-6: invisible root steps shown only in Flicker's glow | §whole-game L1462 | Built; every world keeps its rooms. |
| `LEDGER-2026-11-02-full.md:410` | Y | 6-7: raise and lower the water with a wheel; root-stone on a plate | §whole-game L1462; §D L1598 |  |
| `LEDGER-2026-11-02-full.md:411` | Y | W7 dual-clock timing: fast decaying floors while tracking slow enemy cycles | MISSING | R3: a two-clock twist from W7's floors and sentries. |
| `LEDGER-2026-11-02-full.md:412` | Y | 7-2: withered, shorter vines with stone-crack flowers | MISSING | R1: an optional look and size variant. |
| `LEDGER-2026-11-02-full.md:413` | Y | Act III: earlier mechanics in three- and four-way combinations | PARTIAL §More used L1320-1321; §C L1570: at least 3 core moves per stage; joined beats are two-way, no act escalation |  |
| `LEDGER-2026-11-02-full.md:414` | Y | W8 mixes W2's swings, W3 and W6's dark, W4's glides | §B L1504; §C L1554 |  |
| `LEDGER-2026-11-02-full.md:415` | Y | 8-4: a moving safe zone; the jar's light marks how far is safe | §whole-game L1462 | Built; kept. |
| `LEDGER-2026-11-02-full.md:416` | Y | 8-8: spring net traps on high branches | MISSING | R1: optional. |
| `LEDGER-2026-11-02-full.md:417` | Y | 9-3: superheated branches char and collapse (breaking branches brought back) | PARTIAL §C L1538: creaky must return only in W1, W3, W4, W6, W8, W10; W9 not required |  |
| `LEDGER-2026-11-02-full.md:418` | Y | 9-5: vents turn wind upward; weave between lava plumes | §B L1505; §C L1530,L1545 |  |
| `LEDGER-2026-11-02-full.md:419` | Y | 9-6: deep ash slows run and jump; 9-7 short hops over cooling lava steps | PARTIAL §unused-art L169: hot rocks on a cycle parked; no ash drag |  |
| `LEDGER-2026-11-02-full.md:420` | Y | World 10 adds no new mechanic: all six under one world-wide storm rhythm; a flash warns of a blast | PARTIAL §B L1506; §moves L1299: W10 gets hold as its own move; no world-wide rhythm hazard |  |
| `LEDGER-2026-11-02-full.md:421` | Y | When it flashes, reach rock or a sturdy vine and hold; sprint in the 5-10 s calm gaps | PARTIAL §moves L1299: hold on the flash planned; no calm-gap number |  |
| `LEDGER-2026-11-02-full.md:427` | Y | Difficulty is felt through checkpoint spacing: how many groups you replay after a death | PARTIAL §Placement rule 3 L296-303,L426-431: a flag before each hard node, at most 4,000 px; no replayed-groups count |  |
| `LEDGER-2026-11-02-full.md:428` | N | Celeste (a checkpoint every screen) against DKC Tropical Freeze (sparse) | n/a: a comparison, no rule |  |
| `LEDGER-2026-11-02-full.md:429` | Y | More layering in Acts II-III needs tighter checkpoint spacing | CONTRADICTED L650-653: the placement rules 'never move with d'; the 4,000 px window is fixed (L426) |  |
| `LEDGER-2026-11-02-full.md:430` | Y | Checkpoints on the rests just before the twist and the finale | §Placement rule 3 L296-297; §1-5 plan L345,L350 |  |
| `LEDGER-2026-11-02-full.md:431` | Y | After a death he is back at the hard part within 2 s | CONTRADICTED L300,L303: allows up to 45 s from the checkpoint to the next hard node | See notes (c). |
| `LEDGER-2026-11-02-full.md:432` | N | Boss retries skip the long intro: back in the fight in under 9 s | n/a: boss scene |  |
| `LEDGER-2026-11-02-full.md:433` | N | Scenes 6 pictures or fewer and under 30 s | n/a: story scenes |  |
| `LEDGER-2026-11-02-full.md:434` | N | The halfway scene follows X-5, so no scene before X-6 | n/a: story scenes |  |
| `LEDGER-2026-11-02-full.md:435` | Y | One wayside line at the start, halfway or exit; over 15 words splits, so text never covers jumps | PARTIAL §polish S-8 L781-782; §Stage profile L1229: bubble kept clear of the route, lines pinned to nodes; no word cap |  |
| `LEDGER-2026-11-02-full.md:436` | Y | Three risk tiers of collectibles; never two big ones in one stage | PARTIAL §Placement rule 4 L304-312: breadcrumbs versus hard collectibles; no tiers by find kind |  |
| `LEDGER-2026-11-02-full.md:437` | Y | Tier 1, notes: early, a little off the path behind a gentle clue | PARTIAL §1-1 ruling L1177-1178; §element table L1254: side pockets off the line; find kinds not placed |  |
| `LEDGER-2026-11-02-full.md:438` | Y | Tier 2 finds behind another way in or an optional climb | PARTIAL §Placement rule 4 L306-307; L1177-1178: fork high roads and side pockets; no find tier |  |
| `LEDGER-2026-11-02-full.md:439` | Y | Tier 3 at the top of the hardest twist or finale group, proven reachable by a test | §Placement rule 4 L306-312 | The limited-agent bot check matches 'proven by a test'. |
| `LEDGER-2026-11-02-full.md:440` | N | Reskinned mechanics confuse; every state reads by outline and small motion | n/a: art readability (R-157) |  |
| `LEDGER-2026-11-02-full.md:441` | N | Breaking things: notched underside and a two-frame dust or shake | n/a: art |  |
| `LEDGER-2026-11-02-full.md:442` | N | Safe vines smooth; thorn vines barbed with a breathing pulse | n/a: art |  |
| `LEDGER-2026-11-02-full.md:443` | N | Wind as steady particle streams at the wind's strength | n/a: art |  |
| `LEDGER-2026-11-02-full.md:444` | N | Contact traps look unlike drag fields | n/a: art |  |
| `LEDGER-2026-11-02-full.md:445` | N | Closing: forgiving feel, four-part grammar, alternating types and flipped tempos give lasting variety | n/a: summary of the report |  |
| `LEDGER-2026-11-02-full.md:446` | N | 31 cited sources, some strong, some weak | n/a: source list |  |

### reference/research/ledger/LEDGER-2026-11-04-part1.md
242 rows: used 29, partial 60, missing 40, contradicted 7, n/a 106

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `LEDGER-2026-11-04-part1.md:18` | Y | Every stage gets a map shape (loop-back, high/low split, chimney, spoke); a replay never repeats the last shape | PARTIAL §Stage profile L1214, §CP4 L944, L1042-1044: only an arc word (rises/descends/level/wave) and trend; no loop-back, chimney or spoke topology, no last-shape exclusion | R5 for the missing part: every stage is still a left-to-right run; shape is the ledger's top-ranked cure |
| `LEDGER-2026-11-04-part1.md:31` | Y | A tempo (BPM) per world; action pieces placed on the beat by a ghost Pokey running real physics | PARTIAL §Design L1120-1121, §Stage profile L1218: rhythm patterns per node and pace words; no BPM, no beat timeline, no beat-traced placement | Spec says "the player's rhythm, not the song"; mixer tempo is calm/steady/brisk only (mix spec.ts:24) |
| `LEDGER-2026-11-04-part1.md:43` | Y | Put a hazard on the line the player would take if he did not duck or short-hop | MISSING | R3: hazards that the plain hold-right line never meets make every hazard skippable and stages feel alike |
| `LEDGER-2026-11-04-part1.md:52` | Y | Puzzle rooms: a separate library of 15-20 blueprints whose layout, order of steps and numbers roll per seed | MISSING | R4: spec only wraps push block as a room (L376) and lists room ideas; rooms stay pinned per stage, identical every roll, every world |
| `LEDGER-2026-11-04-part1.md:65` | Y | One special stage per world where the same buttons do something new | PARTIAL §B L1495-1506: specials "kept as built"; no rule every world has one, no W2/W3 special, no buttons-change-job test | Spec lists 2-3/2-8 cages and 3-6/3-7 searches as W2/W3 specials; research says W2 and W3 have none |
| `LEDGER-2026-11-04-part1.md:78` | N | Boss phase 2 changes the arena so the world's mechanic is needed; phase 3 adds traps | n/a: boss fight design; the spec only keeps lairs as built (L1497-1506) |  |
| `LEDGER-2026-11-04-part1.md:90` | Y | Each stage's DNA names its primary+secondary mechanic pair and its archetype (ascent, drop, rising hazard, search hub) | PARTIAL §Stage profile L1208-1230: profile per stage with mechanics taught/allowed/kept out and arc; no locked mechanic pair, no archetype field |  |
| `LEDGER-2026-11-04-part1.md:100` | Y | New sloth verbs: camouflage on moss, moth light, look-around while hanging, belly slide, let-go as the skill | MISSING | R3: new verbs per world are the cheapest cross-world variety; spec's move list (L1278-1299) adds none of them |
| `LEDGER-2026-11-04-part1.md:115` | Y | Search rooms: real items in a different subset of 12-18 spots over 3 tiers each roll, with in-world tells | MISSING | R3: six relic-hunt stages (3-6, 3-7, 5-6, 7-3, 7-7, 9-8) play identically each time; spec keeps searches "as built" (L1499, L1503) |
| `LEDGER-2026-11-04-part1.md:125` | Y | Dead-walk check over 2.5 s should auto-inject a micro feature, not only flag | PARTIAL §Rests L510, §bursts L394: "no dead time over 2.5 s" pass line and 4 of 5 landings step up/down; no auto-inject repair | Spec fails a node rather than repairs (L259); prevention by construction instead |
| `LEDGER-2026-11-04-part1.md:132` | Y | Each collectible gets its own small side-node, placed by the script's words | PARTIAL §Placement rule 4 L304-312, L1177: hard collectibles go in test+ nodes or fork high roads, side pockets; no side-node built from the script's description |  |
| `LEDGER-2026-11-04-part1.md:141` | Y | Rests are real places: 400-600 px flat, with the checkpoint flag and the halfway story line | §CP3 node plan L345, §Rests L500-502, L883 | n5 rest carries Dot's wayside line and flag; canopy-end rest 520-560 px flat (L883) |
| `LEDGER-2026-11-04-part1.md:150` | Y | Node boxes with flat entry/exit ledges at Low/Mid/High port heights; camera settles on node; sub-1 s respawn | PARTIAL §Mix rule L251, §Placement rule 1 L278-283: high/mid/low/two-roads joins; no box sizes, no 200 px flat ledge, no camera lock, no respawn time |  |
| `LEDGER-2026-11-04-part1.md:160` | N | Punch deflects small boss shots; kick pushes arena objects into the boss | n/a: boss combat design |  |
| `LEDGER-2026-11-04-part1.md:169` | N | Tap cuts jump speed 50%; 0.5x gravity at apex for 8 frames; platform speed carried 6 frames | n/a: player jump physics tuning, not stage generation |  |
| `LEDGER-2026-11-04-part1.md:177` | N | Player must never melt into background art (rim light) | n/a: render readability of the hero, not stage generation |  |
| `LEDGER-2026-11-04-part1.md:184` | N | Touch layer: dead zones, edge-swipe suppression, haptics, under-50 ms jump response | n/a: input layer |  |
| `LEDGER-2026-11-04-part1.md:190` | Y | Static hand-made levels without replay change get boring past World 3, so Worlds 2-4 must be rebuilt too | PARTIAL §F L1629, §A L1466: gates report on W2-10 and Table A names why it repeats; W2-10 "not rebuilt now" | Matt's "Worlds 3, 4, 5 all felt the same" is outside this run's build scope |
| `LEDGER-2026-11-04-part1.md:194` | Y | Generator checks repair only the failing node (regenerate it), within 12-15 ms | CONTRADICTED L259: "A node that can't meet them fails with the missing piece named, never a reroll" | Deliberate: spec curates offline over 16 rolls; ledger also took the timing as not taken |
| `LEDGER-2026-11-04-part1.md:205` | Y | A new seed every time the stage is selected or replayed | MISSING | R3: spec never says when a player gets a new roll; layoutMemory behaviour is not in the spec |
| `LEDGER-2026-11-04-part1.md:206` | Y | Curated 16 rolls are fine but must cover at least 3 map shapes | PARTIAL §CP3 pass line L261, L395: 16 rolls x 2 settings must pass every line; no shape coverage across the 16 |  |
| `LEDGER-2026-11-04-part1.md:207` | Y | Replay must exclude the last run's map shape and be at least 45% different (raise 0.35 to 0.45) | MISSING | R3: nothing in spec compares a roll with the one the player just played |
| `LEDGER-2026-11-04-part1.md:208` | Y | Stage vs stage at least 45% different; bring the rule text to the validator's numbers | §Variety gate L41, §shared library L133, §Mix rule L235, §How a stage is made L1042-1044 | Neighbours share at most half their pieces/ideas (at least 50% different), plus a feel check across neighbours |
| `LEDGER-2026-11-04-part1.md:209` | Y | Research stage is 6-8 nodes of 10-15 s (60-120 s); ours needs 10-16 nodes for 2-5 min | §Stage length L664-674, §1-5 node plan L339-351, §1-1 table L1063-1075 | 11 nodes per stage, 2:00 floor, length from nodes and bursts |
| `LEDGER-2026-11-04-part1.md:210` | Y | Rest is one tag placed by the grammar (always after Tight), not a rest after every group (stop-go sameness) | CONTRADICTED L503: on Easy "a breather pad of 2-3 s between every node"; no never-T-then-T rule (n6 test then n7 twist, L346-347) | Exactly the every-group rest the ledger warns makes every stage stop-go |
| `LEDGER-2026-11-04-part1.md:211` | N | Boss phases at 66/33% vs Matt's per-world segments | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:212` | N | Boss phase 1 is a flat teaching arena | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:213` | N | Look-around camera pan 40% while hanging still, no gesture | n/a: camera/input feature |  |
| `LEDGER-2026-11-04-part1.md:214` | Y | One bespoke special stage per world; fix the plan and add W2 and W3 specials | PARTIAL §B L1495-1506: special stages column, kept as built; no W2/W3 addition |  |
| `LEDGER-2026-11-04-part1.md:215` | Y | Archetype per stage from its DNA; fixed slot roles become a default, not a law | PARTIAL §How a stage is made L1037-1041, §Stage profile L1214: per-stage feel profile and arc drive pass lines; no archetype names |  |
| `LEDGER-2026-11-04-part1.md:216` | Y | Mid-stage rest (flag, story line) is wide 400-600 px; small pads between groups stay short | §CP3 node plan L345, §Normal breathes L799, L883 | Wide canopy-end rest 520-560 px; 1.0-1.2 s pads after every second burst on Normal |
| `LEDGER-2026-11-04-part1.md:217` | Y | Research claims bot solving means zero human playtesting needed | CONTRADICTED L1031, L1106-1108: Matt plays every stage; bots only prove it can be finished | Deliberate and matches the ledger's "not taken" |
| `LEDGER-2026-11-04-part1.md:218` | N | Physics at fixed 60 Hz separate from drawing | n/a: game loop (locked at 30 fps) |  |
| `LEDGER-2026-11-04-part1.md:219` | Y | Swimming should be fast (at least run speed), not half a run; change SWIM.speed | PARTIAL §D L1592: "no slow drag: Pokey is fast in water"; no number, no task to change SWIM.speed | Code still 150 px/s, "about half a run" (mix src/game/swim.ts:34-35), the commit L1585 cites |
| `LEDGER-2026-11-04-part1.md:220` | Y | Vine let-go help: keep on Easy, narrow on Normal from World 3 | §The difficulty dial L647 | Timed windows (vines) Normal x1.0 to x0.75, Easy x1.15 to x0.9 of the proven window |
| `LEDGER-2026-11-04-part1.md:221` | N | Coyote/buffer numbers: keep ours (more forgiving) | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:227` | Y | 4-4 Crosswind has no breaking branches, despite the research | §A L1477, §C L1538 | Spec's table agrees: breaking branch absent 1-7 to 5-8; fix "W2-W4 get them" |
| `LEDGER-2026-11-04-part1.md:230` | N | Two world names are wrong in the research | n/a: naming fact |  |
| `LEDGER-2026-11-04-part1.md:232` | N | Ledger pages and wanted posters are not built yet | n/a: story collectible status |  |
| `LEDGER-2026-11-04-part1.md:235` | N | Meeca's World 6 note is in 6-2, not 6-7 | n/a: story fact |  |
| `LEDGER-2026-11-04-part1.md:238` | N | 6-6's story line is Flicker's, at the start | n/a: story fact |  |
| `LEDGER-2026-11-04-part1.md:241` | Y | We have seven special stages (1-8, 4-7, 4-D, 5-M, 6-8, 7-4, 8-4) plus a secret, not two | PARTIAL §B L1497-1506: lists 1-8, 4-7, 5-M, 7-4; omits 4-D, 6-8 Stilt Climb, 8-4 Lantern Run, Thornbark's Hollow | Spec's "kept as built" column is incomplete, so 8-4 and 4-D are not protected |
| `LEDGER-2026-11-04-part1.md:244` | N | 4-D's flaps are limited, not infinite | n/a: existing special stage's controls |  |
| `LEDGER-2026-11-04-part1.md:247` | N | 5-M is not a guarded stealth run | n/a: existing special stage |  |
| `LEDGER-2026-11-04-part1.md:250` | N | Not every boss is wait-for-the-light | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:255` | N | Bosses already have three phases with arena changes | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:258` | N | Golem's weak point moves; his size | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:261` | N | Venom Fang's real tip | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:263` | N | There are eleven boss fights | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:264` | Y | Swimming is slow today (150 vs 285 px/s); there is no breath meter | PARTIAL §D L1585, L1592: calls swimming built and fast; does not note it is half a run today | Spec's claim and code disagree; swim beats will feel slow unless the speed changes |
| `LEDGER-2026-11-04-part1.md:266` | N | Controls: whole-screen gestures or floating pad, not six buttons | n/a: input fact |  |
| `LEDGER-2026-11-04-part1.md:269` | N | Research frame counts are at 60 fps; ours is 30 | n/a: physics fact |  |
| `LEDGER-2026-11-04-part1.md:271` | N | Coyote, buffer, short hop already exist; apex hang and platform carry are gaps | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:274` | N | Stomp and an air kick already exist | n/a: combat fact |  |
| `LEDGER-2026-11-04-part1.md:275` | Y | Every world already has a music BPM band; levels could read it | CONTRADICTED L1120: "the player's rhythm, not the song"; music BPM bands are not used | Matt 11-04 decision; per-world tempo variety is lost with it |
| `LEDGER-2026-11-04-part1.md:277` | Y | Pacing tags, 2.5 s dead walk, 45% difference, clumsy thumb exist as measures, not as a generator gate | PARTIAL §CP3 L262, §Rests L490-511, L1100: fun gate pacing flags and 2.5 s dead time become pass lines; clumsy thumb and landing-in-view not named |  |
| `LEDGER-2026-11-04-part1.md:280` | Y | Pieces the research proposes already exist: counterweight, seesaw, water level, fork, closing orchids, hide, stand-still, slide | PARTIAL §unused-art ideas L154-172, L200-206: existing mechanics checked before ideas join; orchids, water level, stand-still, slide not used |  |
| `LEDGER-2026-11-04-part1.md:284` | N | Internal slips in the research (five vs four shapes, 200 vs 250 apron) | n/a: research consistency |  |
| `LEDGER-2026-11-04-part1.md:286` | N | Research is right about named stages and boss tips | n/a: fact confirmation |  |
| `LEDGER-2026-11-04-part1.md:299` | Y | Matt's brief: how to introduce the nodes, the tempos, the rhythms; today is okay but boring | PARTIAL §CP3 mix rule L232-251, §Design L1120-1121: nodes and rhythm patterns adopted; tempos only as pace words (L1218) |  |
| `LEDGER-2026-11-04-part1.md:300` | N | A big part of the plan will be WebGL | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:301` | Y | No pure random (x,y) scattering: different positions, same feel (procedural oatmeal) | §CP3 mix rule L249-250, L263-264, §Placement L272 | Pieces only from the idea's own list; coherence judged because random soup can pass the gate |
| `LEDGER-2026-11-04-part1.md:302` | Y | A 4-layer constrained pipeline driven by stage DNA and a seed | §How a stage is made L1026-1036, §Stage profile L1208, §CP3 mix rule L232-259 | Profile, node plan, decks, bursts, pieces, then gates |
| `LEDGER-2026-11-04-part1.md:303` | Y | 90 stages with fixed DNA; a run seed rebuilds graph, beats, geometry and puzzle on every load | PARTIAL §Stage profile L1208-1233, §whole-game L1460-1461: DNA per stage as data; no per-load rebuild, no beats, no puzzle roll |  |
| `LEDGER-2026-11-04-part1.md:304` | Y | Story stages keep their identity (2-4 swings, 3-7 fern search, 6-6 dark room) | §whole-game plan L1461-1463, §Stage profile L1222 | Every world keeps its stages, names, specials, rooms; `owns` field |
| `LEDGER-2026-11-04-part1.md:305` | Y | DNA locks primary and secondary mechanics per stage | PARTIAL §Stage profile L1220, §C L1571-1583: taught/allowed/kept-out and one joined beat per world; no per-stage locked pair |  |
| `LEDGER-2026-11-04-part1.md:306` | Y | Archetype per stage: hybrid, vertical ascent, vertical drop, rising hazard, search hub | PARTIAL §Stage profile L1214: arc rises/descends/level/wave; no drop/rising-hazard/search-hub archetypes |  |
| `LEDGER-2026-11-04-part1.md:307` | Y | DNA names the story line's timing and the collectible | §Stage profile L1227-1229 | `dress`, `marks`/`petals`, `dot` lines pinned to nodes |
| `LEDGER-2026-11-04-part1.md:308` | Y | A new seed each time the stage is selected or replayed | MISSING | R3: replay variety within one stage is not specified |
| `LEDGER-2026-11-04-part1.md:309` | Y | Generator 1: a different 6-8 node graph and camera path per seed | PARTIAL §1-5 node plan L336-337: decks change each node's idea per roll; node order and graph are fixed per stage |  |
| `LEDGER-2026-11-04-part1.md:310` | Y | Generator 2: a new beat timeline for the action nodes | PARTIAL §Design L1121: each node draws a rhythm pattern (regular, swing, broken, wait-and-go); no timeline |  |
| `LEDGER-2026-11-04-part1.md:311` | Y | Generator 3: trace Pokey's jump physics to place platforms on the beats; permute puzzles | PARTIAL §P4 L1137-1139, L369, §dial L640: gaps sized by the level check's own jump functions; not on beats; no puzzle permutation |  |
| `LEDGER-2026-11-04-part1.md:312` | Y | Generator 4: compare with the previous run and prove 100% reachability | PARTIAL §P4 L1137-1139, §variety gate L39: reachability proven, both roads walkable; no previous-run comparison |  |
| `LEDGER-2026-11-04-part1.md:313` | Y | Randomize the level's shape before placing a platform, so a replay is not the same hallway | PARTIAL §Stage profile L1214, §CP4 L944: shape is a fixed trend per stage, not rolled per seed | R5 for the missing part: same hallway across rolls and stages |
| `LEDGER-2026-11-04-part1.md:314` | Y | Skeleton: start, intro, halfway rest with wayside line, climax, goal | §1-5 node plan L339-351, §1-1 table L1063-1075 | Warm-up/teach, n5 rest with Dot's wayside line, master fork, cool down to shrine |
| `LEDGER-2026-11-04-part1.md:315` | Y | Graph-rewriting turns the middle into one of the map shapes | MISSING | R5: no stage-level topology in spec; all 102 stages stay forward runs with forks |
| `LEDGER-2026-11-04-part1.md:316` | Y | Over-under loop-back: bottom left-to-right, shaft up, top right-to-left above the start, drop to exit | MISSING | R4: no direction reversal anywhere in spec; 1-4 Up the Kapok is the ledger's candidate |
| `LEDGER-2026-11-04-part1.md:317` | Y | High/low split at node 2: upper harder with collectible, lower puzzle/water; rejoin | §1-5 node plan L344, L350, §Placement rule 4 L306, §CP2 L81 | Two forks per stage plus canopy splits; hard collectibles on the high road |
| `LEDGER-2026-11-04-part1.md:318` | Y | Zig-zag chimney: nodes alternate short sprints and tall climbs or drops | MISSING | R4: vertical stage shape absent; only per-landing up/down (L394) |
| `LEDGER-2026-11-04-part1.md:319` | Y | Lock-and-key spoke: a root door or counterweight gate, spokes to fetch the key | PARTIAL §unused-art ideas L157, L204: root gate idea on Matt's small-builds list; no spoke shape |  |
| `LEDGER-2026-11-04-part1.md:320` | Y | A Markov pacing filter assigns a tag to each node | PARTIAL §1-5 node plan L339-351: a job per node, set by hand per stage; no generated tag grammar |  |
| `LEDGER-2026-11-04-part1.md:321` | Y | [I] Intro: wide platforms, a floor that can't kill | §1-5 node plan L341, §1-1 feel L958, §dial L652 | Warm-up, safe teach steps at miss chance 0.01 or less |
| `LEDGER-2026-11-04-part1.md:322` | Y | [F] Flow nodes: fast vine swings, mud slides, bounce pods, tailwind glides | PARTIAL §CP2 node ideas L82, L105, L163: vine relay, bounce up, updraft ride; no flow job, no mud slide |  |
| `LEDGER-2026-11-04-part1.md:323` | Y | [P] Puzzle nodes: pulleys, light/shadow bridges, water wheels, stealth glowworms | PARTIAL §1-5 node plan L349, L376-377: a puzzle-beat job; push block deferred as a room; no pulleys, light bridges, wheels |  |
| `LEDGER-2026-11-04-part1.md:324` | Y | [T] Tight: high-intensity mechanic pairs | §1-5 node plan L346-350, §C L1569-1583 | Test, twist, master jobs; joined beat per world |
| `LEDGER-2026-11-04-part1.md:325` | Y | [R] Rest: flat 400-600 px, checkpoint flag, story line | §CP3 node plan L345, L883 |  |
| `LEDGER-2026-11-04-part1.md:326` | Y | Never T then T or P then P; after T comes R, F or P; a sine-wave tension curve | PARTIAL §Rests L494, L500-502: fun gate tension flag, rests added; no tag-order rule (n6 test then n7 twist, L346-347) |  |
| `LEDGER-2026-11-04-part1.md:327` | Y | Node boxes: 1600x900 horizontal, 900x1600 vertical, 250 px join | MISSING | R2: helps reading and camera, little direct effect on repetition |
| `LEDGER-2026-11-04-part1.md:328` | Y | Every node starts and ends on a flat hazard-free 200 px ledge at the port height (Low/Mid/High) | PARTIAL §Mix rule L251, §Placement rule 1 L278-283: port heights used; join is a short kit piece, no 200 px flat ledge |  |
| `LEDGER-2026-11-04-part1.md:329` | Y | Spaced nodes let the player read one challenge at a time | §Placement rule 5 L313-320, §Rests L500-505 | Clutter caps per view and breathers |
| `LEDGER-2026-11-04-part1.md:330` | Y | The camera pans or locks to the new node's box before the first jump | MISSING | R1: readability, not repetition |
| `LEDGER-2026-11-04-part1.md:331` | Y | Sub-1-second respawn onto the node's own safe ledge | PARTIAL §Placement rule 3 L296-303, L426-431: flag before each hard node, replay at most 45 s; no respawn time or per-node ledge |  |
| `LEDGER-2026-11-04-part1.md:332` | Y | Action and puzzle nodes are made by different methods | PARTIAL §build findings L375-377: puzzles wrapped as rooms, apart from the mixer; no puzzle-generation method |  |
| `LEDGER-2026-11-04-part1.md:333` | Y | Action/flow nodes generated forward from physics and musical rhythm | PARTIAL §P4 L1137, §Design L1121: physics-checked, rhythm pattern per node; not generated from a rhythm timeline |  |
| `LEDGER-2026-11-04-part1.md:334` | Y | Puzzle nodes: parameterized spatial templates with rolled variables | MISSING | R4: puzzle rooms identical every roll in every world |
| `LEDGER-2026-11-04-part1.md:335` | Y | A tempo per stage (90 BPM relaxed W2, 130 urgent W5/W8); rhythm groups 8-14 s | PARTIAL §Rests L509, §Stage profile L1218: 5-20 s groups and pace words; no BPM |  |
| `LEDGER-2026-11-04-part1.md:336` | Y | Worked example "Waltz Cadence": timed run, jump, vine grab, swing sequence | PARTIAL §Design L1121: named rhythm patterns (swing); no timed sample |  |
| `LEDGER-2026-11-04-part1.md:337` | Y | Worked example "Stutter-Hop": hop, bounce pod, glide, breaking branch, timed | PARTIAL §Design L1121: "broken" rhythm pattern named; no timed sample |  |
| `LEDGER-2026-11-04-part1.md:338` | Y | A ghost Pokey runs the timeline with real gravity, run, jump speed and wind | PARTIAL §P4 L1137-1139, P2 L1131-1132: one shared jump model and real-engine proofs; no ghost run of a beat timeline |  |
| `LEDGER-2026-11-04-part1.md:339` | Y | Wherever the ghost lands, place a branch, ledge, seesaw root or silk bridge | PARTIAL §build findings L369, §dial L640: gaps from jumpOK/heldMaxGap; pieces come from decks, not ghost landings |  |
| `LEDGER-2026-11-04-part1.md:340` | Y | Wherever the ghost grabs a vine, put the anchor one vine-length above | PARTIAL §Element table L1250: a vine hangs from a bough or canopy, never open sky; no anchor-length rule |  |
| `LEDGER-2026-11-04-part1.md:341` | Y | Wherever the ghost ducks or short-hops, put a hazard on the line it avoided | MISSING | R3: same as line 43; hazards don't force the move |
| `LEDGER-2026-11-04-part1.md:342` | Y | Claim: every jump possible, spaced for flow, on the beat; a new seed is a new sequence | PARTIAL §P4 L1139, L906: zero can't-reach rejections, level check 32/32; nothing on the beat |  |
| `LEDGER-2026-11-04-part1.md:343` | Y | 15-20 puzzle blueprints: logic fixed; layout, step order and numbers roll | MISSING | R4: same as line 52 |
| `LEDGER-2026-11-04-part1.md:344` | Y | Pulley blueprint: hang on vine A to lift blocker B to cross to exit C | PARTIAL §unused-art ideas L162, L204: counterweight lift idea on Matt's small-builds list; no blueprint |  |
| `LEDGER-2026-11-04-part1.md:345` | Y | Per seed, mirror the puzzle room | MISSING | R3: cheap way to make a known room feel new on replay; no mirroring anywhere in spec |
| `LEDGER-2026-11-04-part1.md:346` | Y | Per seed, roll pulley ratio and decay (fast 2:1 lift vs root-stone hold) | MISSING | R3: rolled numbers stop a puzzle being solved from memory |
| `LEDGER-2026-11-04-part1.md:347` | Y | Each world layers its hazard on a puzzle (W4 crosswind on return jump, W5 closing orchid) | PARTIAL §C World hazards L1550-1561: world hazards return where the element fits; not layered onto puzzles |  |
| `LEDGER-2026-11-04-part1.md:348` | Y | Search blueprint: find N hidden items in a multi-tier room (3-7, 7-7) | PARTIAL §B L1499, L1503: 3-6/3-7 and 7-7 searches kept as built; no search blueprint |  |
| `LEDGER-2026-11-04-part1.md:349` | Y | 12-18 fern alcoves on 3 tiers, joined by rolled vine and sinkhole paths | MISSING | R3: search stages repeat exactly |
| `LEDGER-2026-11-04-part1.md:350` | Y | Real items go in a different subset of alcoves each run | MISSING | R3: without reassignment a search is solved once and then rote |
| `LEDGER-2026-11-04-part1.md:351` | Y | Tells: one glowworm above the right fern; the Prowler's voice hints | MISSING | R2 |
| `LEDGER-2026-11-04-part1.md:352` | Y | Empty ferns hold small finds or sleeping vines, never nothing | MISSING | R2 |
| `LEDGER-2026-11-04-part1.md:353` | Y | Story lines keep their start/halfway/near timing | §Stage profile L1229, §1-1 Dot lines L1009-1013 | Dot's lines pinned to nodes |
| `LEDGER-2026-11-04-part1.md:354` | Y | "start" line attaches to node 1's rest apron | §Stage profile L1229, §1-1 table L1065 | Dot's run coach line at n1 |
| `LEDGER-2026-11-04-part1.md:355` | Y | "halfway" line attaches to the rest of node floor(N/2), the mid-stage breather | §CP3 node plan L345 | n5 rest (of 11) carries "These petals are fresher" |
| `LEDGER-2026-11-04-part1.md:356` | Y | "near" line attaches to the entry of node N-1, before the climax | PARTIAL §Stage profile L1229, L349: lines pinned per node; no "near" slot rule before the climax |  |
| `LEDGER-2026-11-04-part1.md:357` | Y | A collectible gets its own side-node matching the script's description | PARTIAL §Placement rule 4 L304-312, L1177: placed by node job and side pockets; no script-led side-node |  |
| `LEDGER-2026-11-04-part1.md:358` | Y | 2-4 ledger page on the highest vine at 90% of Pokey's best swing-launch jump | MISSING | R1: one stage's collectible spot; ledger not built |
| `LEDGER-2026-11-04-part1.md:359` | Y | 3-7 ledger page on a dry shelf above the ferns via a climbing spoke | MISSING | R1: one stage's collectible spot |
| `LEDGER-2026-11-04-part1.md:360` | Y | 4-7 ledger page at the bottom of the longest drop, behind the exit chute | MISSING | R1: one stage's collectible spot |
| `LEDGER-2026-11-04-part1.md:361` | N | 6-7: Meeca's note co-spawned with the root-stone on the high shelf | n/a: wrong story fact (note is in 6-2) |  |
| `LEDGER-2026-11-04-part1.md:362` | Y | Check before load under 12 ms; a failing seed regenerates only the bad node | CONTRADICTED L259: a failing node fails with the missing piece named, never a reroll | Deliberate, offline curation; ledger: "already in / not taken" |
| `LEDGER-2026-11-04-part1.md:363` | Y | Gate 1: a search over every platform, vine and bounce pod with Pokey's physics | §P4 L1137-1139, §CP2 L93, L906 | Tracer and level check; vines, ropes, moving logs via realPlay (L1131-1132) |
| `LEDGER-2026-11-04-part1.md:364` | Y | Clumsy thumb: timing off by +-100 ms | PARTIAL §dial L651, L227: per-jump bot floors and first-timer pauses; +-100 ms not stated |  |
| `LEDGER-2026-11-04-part1.md:365` | Y | Clumsy thumb: 15% less air control | PARTIAL §dial L651: bot floors only; air-control penalty not stated |  |
| `LEDGER-2026-11-04-part1.md:366` | Y | Every exit and every collectible reachable under the clumsy model; no frame-perfect jump | §Placement rule 4 L310-312, L908 | Limited-agent bot for hard collectibles; both bots get 13 of 13 marks |
| `LEDGER-2026-11-04-part1.md:367` | Y | Store the last run's signature locally | MISSING | R3: needed for any replay-must-differ rule |
| `LEDGER-2026-11-04-part1.md:368` | Y | Exclude the previous run's map shape on replay | MISSING | R3 |
| `LEDGER-2026-11-04-part1.md:369` | Y | At least 45% different from the last run across rhythm groups | MISSING | R3: spec's "never the same burst twice" (L392) is inside one stage only |
| `LEDGER-2026-11-04-part1.md:370` | Y | Over 2.5 s of flat walking with nothing: auto-add a slope, low hop, critter or bounce pod | PARTIAL §Rests L510, §bursts L394: 2.5 s dead time pass line, 4 of 5 landings step; no auto-add |  |
| `LEDGER-2026-11-04-part1.md:371` | Y | At every take-off the landing is in the camera's view | MISSING | R1: fairness, not repetition; L317 only asks clear space above landings |
| `LEDGER-2026-11-04-part1.md:372` | Y | A breadcrumb trail of fireflies or petals during vertical drops | §Placement rule 4 L305 | Petals show the way and the safe landing |
| `LEDGER-2026-11-04-part1.md:373` | N | The whole pipeline in under 15 ms at stage start | n/a: runtime build budget; spec builds offline |  |
| `LEDGER-2026-11-04-part1.md:374` | Y | Example tag string: I, F, P, R:Wayside, T, F | §1-5 node plan L339-351 | Spec's own job sequence plays the same role |
| `LEDGER-2026-11-04-part1.md:375` | Y | 250 px flat aprons between nodes (200 px at line 41) | PARTIAL §Placement rule 1 L278-279: a short kit piece, never a bare gap; no apron width |  |
| `LEDGER-2026-11-04-part1.md:376` | Y | Acceptance: play 2-4 or 6-7 ten times, get ten different levels with story lines on cue | PARTIAL §1-5 node plan L337, §bursts L395: rolls differ by deck and size, judged on 16 rolls; 2-4/6-7 not rebuilt (L1629) |  |
| `LEDGER-2026-11-04-part1.md:377` | N | Batched GPU drawing | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:378` | N | One atlas, one vertex buffer, one draw call | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:379` | N | WebGL 2 instancing for repeated props | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:380` | N | Physics at fixed 60 Hz separate from drawing | n/a: game loop |  |
| `LEDGER-2026-11-04-part1.md:381` | Y | Store a tiny DNA config per stage, not big tile maps | §Stage profile L1208-1233, §whole-game L1460 | Profile as data in worlds.ts and ladder.ts |
| `LEDGER-2026-11-04-part1.md:382` | Y | Example DNA: world, stage, seed, archetype "Loopback", modifiers, narrative anchor | PARTIAL §Stage profile L1208-1230: profile fields; no seed, archetype or modifiers fields |  |
| `LEDGER-2026-11-04-part1.md:383` | Y | Seeded PRNG; replay rolls new; story, pages and difficulty kept | PARTIAL §difficulty dial L626-633, §Stage profile L1230: difficulty fixed per stage; replay-rolls-new not stated |  |
| `LEDGER-2026-11-04-part1.md:384` | N | Spend 80% of engineering time on four pillars | n/a: process |  |
| `LEDGER-2026-11-04-part1.md:385` | Y | A search-based solver with Pokey's exact physics constants | §P4 L1137-1139 | One model of a jump shared with the tracer |
| `LEDGER-2026-11-04-part1.md:386` | Y | Noisy-bot penalty: thumb drift and 15% less air control | PARTIAL §dial L651: bot floors; drift penalty not stated |  |
| `LEDGER-2026-11-04-part1.md:387` | Y | Unreachable: seed++ and regenerate; zero human playtesting | CONTRADICTED L259, L1031: never a reroll; Matt plays every stage | Deliberate |
| `LEDGER-2026-11-04-part1.md:388` | N | Coyote 0.10 s | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:389` | N | Jump buffer 0.12 s | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:390` | N | Add moving platform or vine speed to the jump for 6 frames | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:391` | Y | Stitch modular nodes of 10-15 s | PARTIAL §bursts L390-391, §Rests L509: nodes of 2-3 bursts, at most 20 s between rests; no 10-15 s node length |  |
| `LEDGER-2026-11-04-part1.md:392` | Y | A library of 15 node templates (chimney, pulley room, wind gap, rest) | §CP2 node ideas L76-86, L102-107, L154-172, L208 | World 1's 14 ideas plus unused-art ideas |
| `LEDGER-2026-11-04-part1.md:393` | Y | Never two [T] in a row without an [R] or [P] between | MISSING | R2: 1-5 lays n6 test then n7 twist back to back (L346-347) |
| `LEDGER-2026-11-04-part1.md:394` | N | Compressed GPU textures | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:395` | N | Object-pool particles and floating text | n/a: performance |  |
| `LEDGER-2026-11-04-part1.md:396` | N | Move list: run, jump, kick, punch, double, climb | n/a: note on controls |  |
| `LEDGER-2026-11-04-part1.md:397` | N | Four engine tracks under one loop | n/a: code architecture |  |
| `LEDGER-2026-11-04-part1.md:398` | N | AABB/SAT collisions and a player state machine | n/a: physics |  |
| `LEDGER-2026-11-04-part1.md:399` | N | Physics in its own fixed step | n/a: physics |  |
| `LEDGER-2026-11-04-part1.md:400` | N | Renderer blind to physics; 1-3 draw calls | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:401` | N | Input engine: multi-touch, zones, haptics, buffering | n/a: input |  |
| `LEDGER-2026-11-04-part1.md:402` | N | Dead zones, edge-swipe suppression | n/a: input |  |
| `LEDGER-2026-11-04-part1.md:403` | N | Generation isolated from play so it never stutters | n/a: built offline |  |
| `LEDGER-2026-11-04-part1.md:404` | N | A jump 50 ms late feels cheap | n/a: input latency |  |
| `LEDGER-2026-11-04-part1.md:405` | Y | Unfiltered random creates bad sightlines, unavoidable enemies, impossible gaps | §P4 L1137-1139, §animals L212-221, §Placement rule 5 L313-320, P3 L1134 |  |
| `LEDGER-2026-11-04-part1.md:406` | Y | Static hand-made levels with no replay change get boring past World 3 | PARTIAL §F L1629: W2-10 reported by gates, not rebuilt |  |
| `LEDGER-2026-11-04-part1.md:407` | N | Background art that blends with hazards or the player | n/a: render readability |  |
| `LEDGER-2026-11-04-part1.md:408` | N | Grounded punch/kick combo | n/a: combat |  |
| `LEDGER-2026-11-04-part1.md:409` | N | In-air punch/kick | n/a: combat |  |
| `LEDGER-2026-11-04-part1.md:410` | N | Climbing punch/kick | n/a: combat |  |
| `LEDGER-2026-11-04-part1.md:411` | N | Coyote 0.12 s | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:412` | N | Input buffer 0.10 s | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:413` | N | Tap cuts upward speed 50% | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:414` | N | 0.5x gravity at the arc's top for 8 frames | n/a: player physics |  |
| `LEDGER-2026-11-04-part1.md:415` | N | Sample sprite batcher | n/a: renderer |  |
| `LEDGER-2026-11-04-part1.md:416` | Y | Pathfinder must reach exit and collectibles within a 15% safety margin | CONTRADICTED L640-641: Normal gaps reach 0.92 and rises 0.95 of the gate's limit at d=1 (past 0.85 from d about 0.81) | Ledger: gen2 uses at most 82% Normal, 65% Easy; spec Easy reaches 0.80 |
| `LEDGER-2026-11-04-part1.md:417` | N | Bosses suffer wait-for-the-light | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:418` | N | Every boss: three ways to deal damage | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:419` | N | Boss way 1: the scripted tip | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:420` | N | Boss way 2: world mechanic in the arena, 2x damage | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:421` | N | Boss way 3: kick vs punch counters | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:422` | N | Punch swats back small boss shots | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:423` | N | Kick breaks armour, pushes objects into the boss | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:424` | N | Dive kick bounces off high targets | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:425` | N | Three boss phases; the arena changes each | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:426` | N | Boss phase 1 teaches on a flat arena | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:427` | N | Boss phase 2 needs the world's mechanic | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:428` | N | Boss phase 3: two attacks and more traps | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:429` | N | Venom Fang arena and three ways | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:430` | N | Crocus Rex arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:431` | N | Rex way 2: kick a log into his jaws | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:432` | N | Rex way 3: seesaw log launch | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:433` | N | Prowler arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:434` | N | Prowler way 2: glowworms light the centre | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:435` | N | Prowler way 3: stand still 3 s | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:436` | N | Sovereign arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:437` | N | Sovereign way 2: updraft kick | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:438` | N | Sovereign way 3: cracked pillar stun | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:439` | N | Queen arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:440` | N | Queen way 2: kick anchor threads | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:441` | N | Queen way 3: projectile tennis | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:442` | N | Reaver arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:443` | N | Reaver way 2: run along his spear | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:444` | N | Reaver way 3: water wheel floods the arena | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:445` | N | Golem arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:446` | N | Golem way 2: climb his arm | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:447` | N | Golem way 3: lure under a cracked ceiling | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:448` | N | Monarch arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:449` | N | Monarch way 2: swinging lantern | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:450` | N | Monarch way 3: wind bell or gust ride | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:451` | N | Drake arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:452` | N | Drake way 2: kick hoard into his mouth | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:453` | N | Drake way 3: smash a vent cap | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:454` | N | Iron-Claw arena and way 1 | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:455` | N | Iron-Claw way 2: tailwind flying kick | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:456` | N | Iron-Claw way 3: clash kick spins him | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:457` | N | One shared boss state machine with four receptors | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:458` | N | Boss config fields: glow, parry, guard-break, bounce, prop hits, climbable part | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:459` | N | One standard window, one counter, one arena prop per boss | n/a: boss design |  |
| `LEDGER-2026-11-04-part1.md:460` | Y | Real sloth biology as moves, plus special stages per world, so it isn't a 10x10 reskinned matrix | PARTIAL §B L1495-1506, §C L1514-1546: each world's own move and specials kept; no new sloth-biology verbs | R4 for the missing verbs: the research's direct answer to "reskinned matrix" |
| `LEDGER-2026-11-04-part1.md:461` | N | Tendon lock: hanging costs nothing, no grip meter | n/a: move rule already in the game |  |
| `LEDGER-2026-11-04-part1.md:462` | N | While hanging he ignores gravity and wind | n/a: move rule already in the game |  |
| `LEDGER-2026-11-04-part1.md:463` | Y | Letting go at the exact right moment is the skill test | §The difficulty dial L647 | Vine windows narrow with d on both settings |
| `LEDGER-2026-11-04-part1.md:464` | Y | Walk upside-down under branches whose tops are thorns | MISSING | R3: a new verb plus a new piece usable in every tree world; not in spec's move list (L1278-1299) |
| `LEDGER-2026-11-04-part1.md:465` | Y | Sloths swim about three times faster than they walk; make Pokey fast in water | PARTIAL §D L1592: "fast in water" with no number; code swim is half a run |  |
| `LEDGER-2026-11-04-part1.md:466` | Y | Water stages: fast, no oxygen timer, relief zones | §D L1588-1596 | Quick in-and-out, 15-20 s under at most, wide exits, currents and bubbles |
| `LEDGER-2026-11-04-part1.md:467` | Y | Hold still on moss or ferns in W3 and W8 so patrols pass over him | PARTIAL §C L1542, §never-packed L539, L156: hide returns 1 in 4 stages, dens and hollow logs; no moss camouflage vs patrols |  |
| `LEDGER-2026-11-04-part1.md:468` | Y | A burst of sloth moths on the double jump lights dark platforms | MISSING | R2: a dark-stage verb for W3, 6-6, W8 |
| `LEDGER-2026-11-04-part1.md:469` | N | Neck turn: hanging still plus a direction pans the camera 40% | n/a: camera feature |  |
| `LEDGER-2026-11-04-part1.md:470` | Y | Belly slide on mud banks (W2), mossy chutes (W4), ash slopes (W9), catching zip-vines | MISSING | R3: one verb gives three worlds a new feel; spec also has no slopes (L596-599) |
| `LEDGER-2026-11-04-part1.md:471` | Y | One special stage per world, same buttons doing new things | PARTIAL §B L1495-1506: specials kept as built; no per-world rule |  |
| `LEDGER-2026-11-04-part1.md:472` | Y | 1-S: rolling seed pod down a hollow trunk | MISSING | R1: World 1 already has its 1-8 chase |
| `LEDGER-2026-11-04-part1.md:473` | Y | 2-S: one-log raft down rapids ahead of a flood wave | MISSING | R3: World 2 has no special; spec counts cages instead |
| `LEDGER-2026-11-04-part1.md:474` | Y | 3-S: Prowler's shadow run with panther physics | MISSING | R3: World 3 has no special; spec counts searches instead |
| `LEDGER-2026-11-04-part1.md:475` | N | 4-D: infinite flap, kick dives, punch brakes | n/a: existing special stage's controls |  |
| `LEDGER-2026-11-04-part1.md:476` | N | 5-M: carving checkpoints, pebble distraction, Flicker's light | n/a: built and Matt-approved special |  |
| `LEDGER-2026-11-04-part1.md:477` | Y | 6-S: Venom Fang as a living vine bridge (coil or stretch) | MISSING | R2: cross-world callback; W6 has 6-8 |
| `LEDGER-2026-11-04-part1.md:478` | Y | 7-S bell hall: hit a bell, invisible platforms go solid for 4 s on a beat | MISSING | R3: ledger says adopt as a World 7 piece; a timed-solid platform kind is absent from the library |
| `LEDGER-2026-11-04-part1.md:479` | Y | 8-S constellation relay; borrow the 2 s flash stun | MISSING | R1: W8 has 8-4 (which spec's specials column omits) |
| `LEDGER-2026-11-04-part1.md:480` | Y | 9-S Pell's thread delivery: shield bounces magma, kick ties thread across lava | MISSING | R1 |
| `LEDGER-2026-11-04-part1.md:481` | Y | 10-S The Reach: each broken guardian collar gives an assist on your inputs | MISSING | R2: late-game twist on old moves; spec's W10 adds only hold |

### reference/research/ledger/LEDGER-2026-11-04-part2.md
242 rows: used 20, partial 77, missing 76, contradicted 12, n/a 57

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `LEDGER-2026-11-04-part2.md:18` | Y | Same slot order in every world (X-9 gauntlet in all 10, finds at same stage numbers); let each world write its own order | CONTRADICTED L1462: "every world keeps its stages, names, special stages..." freezes today's slot plan; no per-world order rule | R5: same template per world is the research's top repetition cause across worlds |
| `LEDGER-2026-11-04-part2.md:27` | Y | One world-wide macro rule per world that changes how progression works, not just obstacles | MISSING | R5: world table L1495-1506 gives own move and hazards only; no rule that changes how a whole world plays |
| `LEDGER-2026-11-04-part2.md:34` | Y | Lock platform, vine and hazard placement to the stage's musical beat (use our music's BPM) | CONTRADICTED L1120: "the player's rhythm, not the song" (Matt 11-04); nodes draw rhythm patterns instead | Deliberate Matt ruling; no beat grid of any kind replaces it |
| `LEDGER-2026-11-04-part2.md:43` | Y | Fail a stretch that repeats the exact same jump interval four times in a row | PARTIAL §Bursts L393; §Design L1121: kind or size band changes every 2 pieces, rhythm pattern per node; no check on time between moves | R4 if missing: measures "I can predict the sequence" directly |
| `LEDGER-2026-11-04-part2.md:47` | Y | Ban the previous stage's 3-4 move runs in the next stage | PARTIAL §Variety gate L41, L133: neighbours share at most half their ideas (a set, no order); no cross-stage move-run ban | R4: sequence-level sameness across stages is unchecked |
| `LEDGER-2026-11-04-part2.md:52` | Y | Order-aware similarity (edit distance) against N-1..N-7; when too close, change map shape, never reroll same pieces | PARTIAL §Variety gate L41; §CP3 L259: unordered idea overlap with neighbour only; failure names a missing piece, no map-shape change | R4: only immediate neighbour compared, no seven-stage window |
| `LEDGER-2026-11-04-part2.md:59` | Y | Cause and effect: an action in one stage visibly changes a later stage of the same world | MISSING | R4: links stages of a world into one place instead of separate rolls |
| `LEDGER-2026-11-04-part2.md:63` | Y | Enemy formations (solo, stepping-stone chain, triggered swarm), 1-3 on screen, enemies bound to ledge and chasm sizes | PARTIAL §Animals L1307, L1564; §Placement 5 L315; §Dial L645: element binding, kinds per view, count per stage; no formations, on-screen count or platform-size spawns | R4: formations give animals varied jobs across stages |
| `LEDGER-2026-11-04-part2.md:70` | Y | Silk tripwire set piece: thread shakes, 3 spiders drop as a moving gate, 1 chaser behind; kick or punch counterplay | MISSING | R2: World 5 signature; spec keeps World 5's own kit (L129, L1501) and specifies nothing in it |
| `LEDGER-2026-11-04-part2.md:77` | Y | Stage shape with numbers: 0.4/s intro, 0.83/s flow, spike, zero-action rest, new pairing, max density, slide-out; move spike between stages | PARTIAL §CP3 node plan L341-351; §Rests L508: node jobs warm-up to cool-down and rests; no per-node action rates, no slide-out | Density is judged stage-wide only (Easy 0.35-0.55) |
| `LEDGER-2026-11-04-part2.md:84` | Y | Nodes 5-6 change the kind of play (run/jump to slow puzzle or pulley climb), not just the obstacle | PARTIAL §1-1 L976-984; §Mixing L1320: 1-1 turns ground to tree, 3+ core moves per stage; no rule every stage changes its main verb | R3 for the missing rule: verb change inside every stage |
| `LEDGER-2026-11-04-part2.md:87` | Y | Collectibles get roles (flow reward, branch-switch, patience reward) rotated per world so hiding spots never repeat | PARTIAL §Placement 4 L304-312; §How a stage L1039: hard ones on high road or test nodes, petal style per profile; no flow or patience roles, no rotation | R3: same hiding logic in every stage otherwise |
| `LEDGER-2026-11-04-part2.md:92` | Y | Secrets behind sloth behaviour (patience, petal chime, lure enemy, hang under exit), one guaranteed reachable per roll | PARTIAL §Unused-art L166, L170; §1-1 L1177: hidden roads, secret tunnel and side pockets as ideas; no behaviour triggers, no guaranteed secret | R3: secrets per world change replay |
| `LEDGER-2026-11-04-part2.md:99` | Y | Stillness for 1.5 s wakes a 400 px radius: glowing platforms solid, hidden enemies shown, thorns retract; brought back in later worlds | MISSING | R3: patience is World 4 only; spec's hold (L1299) is a World 10 flash move, not this |
| `LEDGER-2026-11-04-part2.md:104` | Y | Rule 4 bar: World 1 and World 2 pass 100 seeds in a row with zero repetition warnings before World 3 | PARTIAL §CP3 L261; §F L1629: 16 of 16 rolls, World 1 only; no 100-seed bar, no World 2 proof | Number differs: 16 rolls vs 100 seeds |
| `LEDGER-2026-11-04-part2.md:108` | Y | At least 3 nodes enemy-free, rests 100% sacred, tight stretches checked for animals | PARTIAL §Dial L643: rests and teach steps hold 0 risky pieces; no enemy-free node share, no tight-stretch rule | R2: pacing contrast, minor for repetition |
| `LEDGER-2026-11-04-part2.md:113` | Y | Roll a map shape per stage (linear, loopback, high/low split, chimney, hub for search); neighbours never share a shape | PARTIAL §Stage profile L1214; §CP4 L944; §Feel check L1042: arc rises/descends/level/wave, 1-1 up vs 1-5 down; no topology roll | R5 for the missing topology: research's main "Level 8 never feels like 7" lever |
| `LEDGER-2026-11-04-part2.md:118` | Y | Eagles hovering in wind as stepping stones; stomp chains across a chasm | MISSING | R3: reuses the stomp chain the code already scores; new beat for later worlds |
| `LEDGER-2026-11-04-part2.md:122` | Y | River snapper snouts rise as a 1-second bouncy platform | MISSING | R2: spec only moves the snapper to World 6 (L1566), not this behaviour |
| `LEDGER-2026-11-04-part2.md:124` | Y | Three soldier armours: front shield, spiked helmet, spear, each beaten a different way | MISSING | R2: L174-175 only says unused frames may give a second behaviour |
| `LEDGER-2026-11-04-part2.md:128` | Y | False-vine snake that goes stiff into a swing vine when punched | MISSING | R2: fuses punch and vine, both already known moves |
| `LEDGER-2026-11-04-part2.md:131` | Y | Dot's claw adds 15% hang at a double jump's top; Flicker flies 150 px ahead lighting steps | MISSING | R2: makes Dot-away worlds feel different in the thumb |
| `LEDGER-2026-11-04-part2.md:135` | Y | Wind shadows: walls, boulders and shields block the wind, zero force behind them | MISSING | R2: spec lets wind return (L1556) but adds no variant |
| `LEDGER-2026-11-04-part2.md:137` | Y | Clumsy bot with steady +100 ms takeoff delay and 15% less air speed proves every ledge and collectible reachable | PARTIAL §CP3 L908, L312, L221: bots reach every mark, limited-agent bot, first-timer runs; no steady-late bot | Fairness check, low repetition weight |
| `LEDGER-2026-11-04-part2.md:142` | Y | 200 px flat apron at each node's ends; checkpoint at every node start, respawn under 0.8 s | CONTRADICTED L296-303, L426: checkpoints only before hard nodes, at most 4,000 px apart, replay up to 45 s; joins (L278-279) partly cover aprons | Deliberate: Matt's "checkpoints, reasonable" |
| `LEDGER-2026-11-04-part2.md:146` | N | World 10 step counter HUD, step 1 to 999 across the world | n/a: HUD and story flavour, not stage generation |  |
| `LEDGER-2026-11-04-part2.md:149` | Y | Jump-toggled platforms: one jump swaps solid and ghost platforms, a double swaps twice (Worlds 5, 7) | MISSING | R3: a new piece family for two worlds |
| `LEDGER-2026-11-04-part2.md:151` | N | 8 ms haptic tap on branch crack or vine grab; rising pitch on chains | n/a: feel and audio, not generation |  |
| `LEDGER-2026-11-04-part2.md:155` | N | Profile on the cheapest phone every week | n/a: performance process |  |
| `LEDGER-2026-11-04-part2.md:157` | Y | Story and collectibles anchored to node slots so a reroll never breaks them | §Stage profile L1229; §CP3 node plan L345, L356 | Dot lines pinned to nodes; marks one per node |
| `LEDGER-2026-11-04-part2.md:160` | Y | Triggered swarm in World 3: clean play wakes nobody; a mistake wakes 3-4 and starts a 5-second escape sprint | MISSING | R2: mistake-driven variety; World 3 has no spec beyond hazards L1499 |
| `LEDGER-2026-11-04-part2.md:164` | Y | Fast swimming: max speed x1.8, light gravity, hydro-dash out at 1.4x jump | PARTIAL §D L1592: "Pokey is fast in water", no number; L1585 says swimming is built but swim.ts:35 is still 150 px/s | Code on engine-mixer still "about half a run" |
| `LEDGER-2026-11-04-part2.md:173` | Y | C1: research says never same slot order every world; STAGE-RULES §0b.6 and stagePlan keep X-9 gauntlet in all | CONTRADICTED L1462: spec keeps every world's stages as built | R5: see item 1 |
| `LEDGER-2026-11-04-part2.md:174` | N | C2: research 60 fps fixed tick vs our 30 fps lock | n/a: frame rate and loop, not stage generation |  |
| `LEDGER-2026-11-04-part2.md:175` | Y | C3: Levenshtein over 55% against N-1..N-7 rejects; ours cosine 0.55/0.45 and only flags | PARTIAL §Variety gate L41; §CP3 L259: neighbour shares at most half its ideas (unordered); fails, never rerolls; no edit distance | Spec's 50% idea-share is a different measure from research's 55% |
| `LEDGER-2026-11-04-part2.md:176` | Y | C4: a 3-move run more than twice in one stage flags; ours allows any non-adjacent repeats | PARTIAL §Bursts L391; §CP3 L241-243: no same burst twice, no idea twice in a row, idea at most 40%; no move-sequence count | R3: idea-level only |
| `LEDGER-2026-11-04-part2.md:177` | Y | C5: at least 3 nodes enemy-free, rests sacred; validator checks only route length | PARTIAL §Dial L643: rests and teach steps hold 0 risky pieces; no enemy-free node count |  |
| `LEDGER-2026-11-04-part2.md:178` | Y | C6: no enemy within 150 px of a blind landing; generator keeps only 120 px | MISSING | R1: fairness, not repetition |
| `LEDGER-2026-11-04-part2.md:179` | Y | C7: dead time over 2.5 s fails; our files say 2.5+2.5, 4 s and 2.0/3.0 s | §Rests L510 | Spec settles on "no dead time over 2.5 s", the research's number |
| `LEDGER-2026-11-04-part2.md:180` | Y | C8: Node 1 intro 0.4 actions/s; validator allows 0.8/s | PARTIAL §CP3 node plan L341; §Rests L508: warm-up node exists, Easy 0.35-0.55 stage-wide; no intro-node rate | Normal accepted at 0.80/s stage-wide (L802) |
| `LEDGER-2026-11-04-part2.md:181` | Y | C9: invisible checkpoint at every node entrance, respawn under 0.8 s | CONTRADICTED L296-300, L426: checkpoints before hard nodes only, up to 4,000 px apart, replay up to 45 s | Deliberate (Matt "checkpoints, reasonable") |
| `LEDGER-2026-11-04-part2.md:182` | Y | C10: research's "every level same shape" contradicts its own L391; our direction varies the shape | §How a stage L1037-1043; §CP4 L944 | Spec varies shape per stage profile, as the ledger advises |
| `LEDGER-2026-11-04-part2.md:183` | Y | C11: research BPMs disagree with our music; if placements lock to a beat it must be the music heard | CONTRADICTED L1120: spec drops music-locked rhythm altogether ("not the song") | Matt 11-04 ruling |
| `LEDGER-2026-11-04-part2.md:184` | N | C12: 2048 power-of-two atlases vs our 4096 ceiling | n/a: art and GPU limits |  |
| `LEDGER-2026-11-04-part2.md:185` | Y | C13: no Worlds 2-10 until Worlds 1 and 2 pass 100 seeds with zero repetition warnings | PARTIAL §CP3 L261; §F L1629: 16 rolls on World 1; World 2 not proven first |  |
| `LEDGER-2026-11-04-part2.md:186` | Y | C14: adaptive director keeps casual and veteran players engaged; ours says not now | MISSING | R2: spec's d is fixed per stage (L628); a mastery high road opening would vary replays |
| `LEDGER-2026-11-04-part2.md:187` | Y | C15: cause and effect and slot shuffling are core "structural breakers", not extras | MISSING | R5: neither appears; L1462 keeps stages as built |
| `LEDGER-2026-11-04-part2.md:188` | Y | C16: swimming three times faster (x1.8); code is half a run | PARTIAL §D L1592: fast stated without a number; code unchanged (swim.ts:35 = 150) |  |
| `LEDGER-2026-11-04-part2.md:189` | Y | C17: bending sapling piece already exists; patience is World 4 only | MISSING | R3: built sapling piece and patience spots are absent from the shared library |
| `LEDGER-2026-11-04-part2.md:190` | Y | C18: compare token streams of levels 1-7; layoutMemory already rolls away per stage | PARTIAL §Feel check L1042; §Variety gate L41: neighbour comparison only, not a seven-stage window | R3 |
| `LEDGER-2026-11-04-part2.md:196` | Y | F1: no node graph or StageDNA today; W1 rolls section versions, gen2 picks 16 curated rolls, layout kept until cleared | §CP3 node plan L336-337; §Stage profile L1208-1233 | Spec builds nodes, decks and profiles as data; layout memory not addressed |
| `LEDGER-2026-11-04-part2.md:197` | N | F2: a touched silk thread rouses every spider in reach, not one | n/a: code fact about World 5 spiders; World 5 is the spec's exception (L129) |  |
| `LEDGER-2026-11-04-part2.md:198` | Y | F3: no nodes; a gen2 stage is about 25-28 sections in a row | §Bursts L390; §CP3 L235 | Spec makes stages of 11-12 nodes of 2-3 bursts |
| `LEDGER-2026-11-04-part2.md:199` | Y | F4: gen2 builds only 5-7, 5-9 and Worlds 6-8; the rest hand-built or old generator | PARTIAL §Shared library L126; §F L1629: gen2 sections join the library; Worlds 2-10 only reported, not rebuilt |  |
| `LEDGER-2026-11-04-part2.md:200` | N | F5: enemies do not all die to a stomp (caiman armour, spiders, turtle shell) | n/a: correction of the research's enemy facts; spec makes no stomp claim |  |
| `LEDGER-2026-11-04-part2.md:201` | N | F6: high bounce on a stomp already exists (about 1.8x) | n/a: code fact |  |
| `LEDGER-2026-11-04-part2.md:202` | N | F7: snake is shy, ocelot creeps while back turned | n/a: code fact on enemy behaviour |  |
| `LEDGER-2026-11-04-part2.md:203` | N | F8: moving to PixiJS v8, not WebGL/SpriteJS | n/a: renderer |  |
| `LEDGER-2026-11-04-part2.md:204` | N | F9: physics steps follow frame time; STEP and acc unused; stale comment | n/a: physics loop |  |
| `LEDGER-2026-11-04-part2.md:205` | N | F10: Dot-present ranges differ from code | n/a: story |  |
| `LEDGER-2026-11-04-part2.md:206` | N | F11: retry intros as prefix count in code | n/a: story |  |
| `LEDGER-2026-11-04-part2.md:207` | N | F12: 4-D sits after 4-5, not before 4-7 | n/a: stage-order fact |  |
| `LEDGER-2026-11-04-part2.md:208` | N | F13: 7-1 is a sprint, 7-3 Ten Chairs | n/a: stage-order fact |  |
| `LEDGER-2026-11-04-part2.md:209` | N | F14: World 2 puzzle at 2-3, climb at 2-6 is right | n/a: stage-order fact |  |
| `LEDGER-2026-11-04-part2.md:210` | Y | F15: Dot's pocket finds sit in stage 6 of Worlds 4-9, the same slot every world | MISSING | R3: finds pinned to the same stage number; spec has no rule moving them (L1488 only counts finds' absence) |
| `LEDGER-2026-11-04-part2.md:211` | N | F16: 30 finds plus extras; posters and pages not in code | n/a: collectible count fact |  |
| `LEDGER-2026-11-04-part2.md:212` | Y | F17: seesaw and sluice pieces exist; 6-7 swim is slow | PARTIAL §Unused-art L162; §D L1592: seesaw noted as existing; swim speed number absent |  |
| `LEDGER-2026-11-04-part2.md:213` | Y | F18: a bending-sapling bridge piece already exists (5-M) | MISSING | R3: built piece not in the shared library or unused-art lists |
| `LEDGER-2026-11-04-part2.md:214` | N | F19: World 5 armchairs already trap him in silk (a fake rest) | n/a: World 5 exception world (L129) |  |
| `LEDGER-2026-11-04-part2.md:215` | N | F20: Dot's guide is already an HTML/React overlay | n/a: UI |  |
| `LEDGER-2026-11-04-part2.md:216` | N | F21: haptics already exist | n/a: feel |  |
| `LEDGER-2026-11-04-part2.md:217` | N | F22: boss entrance already plays in-engine | n/a: boss intro |  |
| `LEDGER-2026-11-04-part2.md:218` | N | F23: file names that exist and don't | n/a: code inventory |  |
| `LEDGER-2026-11-04-part2.md:219` | N | F24: memory chapter ids match | n/a: story |  |
| `LEDGER-2026-11-04-part2.md:220` | Y | F25: four special stage kinds: 4-D, 5-M, 7-4 slide, 8-4 Lantern Run | PARTIAL §B L1500, L1504: special stages "kept as built" list 5-M and 7-4 but omit 4-D and 8-4 Lantern Run |  |
| `LEDGER-2026-11-04-part2.md:221` | N | F26: research numbers disagree with themselves | n/a: source consistency note |  |
| `LEDGER-2026-11-04-part2.md:222` | N | F27: Jungle Journal spider line vs TRAITS stomp rule | n/a: text bug |  |
| `LEDGER-2026-11-04-part2.md:230` | Y | #1 Repetition trap: same 10-stage template in same order every world; formula felt by World 4 | CONTRADICTED L1462: every world keeps its stages as built | R5 |
| `LEDGER-2026-11-04-part2.md:231` | Y | #2 World-wide mutators: a macro rule per world changing progression | MISSING | R5: per-world fingerprint beyond pieces |
| `LEDGER-2026-11-04-part2.md:232` | Y | #3 World 3 noise rule: too much noise opens the Prowler's eyes; last 20 s a stealth-freeze test | MISSING | R4: a world rule built from noise.ts pieces |
| `LEDGER-2026-11-04-part2.md:233` | Y | #4 World 5 fake rest platforms and teacup checkpoints that drop into a web room | MISSING | R3: World 5 exception world has no spec content |
| `LEDGER-2026-11-04-part2.md:234` | Y | #5 World 6 companion split: from 6-5 camera tightens around Flicker, play turns to water puzzles | MISSING | R3: world rule tied to Dot leaving |
| `LEDGER-2026-11-04-part2.md:235` | N | #6 World 10 step counter 1 to 999 | n/a: HUD |  |
| `LEDGER-2026-11-04-part2.md:236` | Y | #7 Cause and effect: 2-3 log jam breaks, river rises in 2-4 and 2-8 | MISSING | R4 |
| `LEDGER-2026-11-04-part2.md:237` | Y | #8 7-3 chair set upright opens a secret passage in 7-6 | MISSING | R4 |
| `LEDGER-2026-11-04-part2.md:238` | Y | #9 Shuffle slot order per act; never puzzle at X-7 and climb at X-6 everywhere | CONTRADICTED L1462: stages kept as built | R5 |
| `LEDGER-2026-11-04-part2.md:239` | Y | #10 World 2: search/puzzle early (2-3), climb at 2-6 (keep) | §Whole-game plan L1462 | Kept as built |
| `LEDGER-2026-11-04-part2.md:240` | Y | #11 World 4: vertical freefall late (4-7 The Long Drop) | §B L1500 | "4-7 the long drop" kept |
| `LEDGER-2026-11-04-part2.md:241` | Y | #12 World 7 opens with a quiet observing puzzle room before fast crumbling floors | MISSING | R2: L1503 keeps World 7 as built |
| `LEDGER-2026-11-04-part2.md:242` | Y | #13 Secrets never behind unmarked walls; tells tied to story and sloth moves | PARTIAL §Unused-art L170: secret tunnel through a cracked floor; no general tell rule |  |
| `LEDGER-2026-11-04-part2.md:243` | Y | #14 Pink Bell Notes found by Meeca's trail tells (hairpin scratch, petal on thermal, boot-prints) | PARTIAL §CP3 L354-358; §1-1 L1000: Meeca's marks and low petals along her route; no per-world tells for notes |  |
| `LEDGER-2026-11-04-part2.md:244` | Y | #15 Ledger Pages high above a node start, reached by an unbroken chain of branches or swings | PARTIAL §Placement 4 L306: hard collectibles on a fork's high road; no look-back or no-ground-chain rule |  |
| `LEDGER-2026-11-04-part2.md:245` | N | #16 Wanted Posters placed by soldier logic at named stages | n/a: story collectible not yet in code (R-4.3) |  |
| `LEDGER-2026-11-04-part2.md:246` | Y | #17 Dot's pocket finds by a rustling bush or caught feather as he walks past | MISSING | R1: a tell, not variety |
| `LEDGER-2026-11-04-part2.md:247` | Y | #18 Secret stage entrances inside normal stages via sloth behaviour | PARTIAL §Unused-art L170; §B L1503: secret tunnel idea, 7-7 secret gate kept; no behaviour entrances |  |
| `LEDGER-2026-11-04-part2.md:248` | Y | #19 Patience unlock: still 5 s, a vine lowers or door opens | MISSING | R3: new puzzle piece from existing patience code |
| `LEDGER-2026-11-04-part2.md:249` | Y | #20 Wrist-petal compass pulses and music box chimes within 300 px of a false wall | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:250` | Y | #21 Lure a charger, falling floor or dive into a wall Pokey can't break | MISSING | R3: new puzzle piece |
| `LEDGER-2026-11-04-part2.md:251` | Y | #22 Hang under the exit flag's platform to reach a hidden hollow | MISSING | R2: under-branch hang absent from move table L1280-1299 |
| `LEDGER-2026-11-04-part2.md:252` | Y | #23 Golden seed: a secret on a fixed node spoke, behind a tell, checked reachable every roll | PARTIAL §CP3 L371-374: 1-5's golden seed is an unreachable glint; no guaranteed secret spoke | Same name, different thing |
| `LEDGER-2026-11-04-part2.md:253` | Y | #24 Enemies as moving geometry, timing gates and tools, not roadblocks | PARTIAL §CP2 L107; §Animals L174-175: animal idea "jump it, wait for it, or kick-roll it", second behaviours; no enemy-as-tool rule |  |
| `LEDGER-2026-11-04-part2.md:254` | N | #25 No complex or random AI; predictable enemies | n/a: enemy AI code |  |
| `LEDGER-2026-11-04-part2.md:255` | Y | #26 One or two predictable reactions to a trigger, 0.5 s telegraph | PARTIAL §Animals L219: boa gets "a clear rear-up tell"; no general 0.5 s telegraph rule |  |
| `LEDGER-2026-11-04-part2.md:256` | Y | #27 Readability contract: in 0.2 s player knows danger zone, which button, how to use it | MISSING | R1: species readability, not repetition |
| `LEDGER-2026-11-04-part2.md:257` | Y | #28 Rock-paper-scissors: stomp, punch, kick each beat different enemies | MISSING | R3: L1285 lists the moves only; per-animal counters make stages play differently |
| `LEDGER-2026-11-04-part2.md:258` | Y | #29 Stomp beats walkers, birds, snappers; high bounce makes enemies stepping stones over pits | MISSING | R2: see item 18 |
| `LEDGER-2026-11-04-part2.md:259` | Y | #30 A punch stuns 1.5 s so you can pass without killing | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:260` | Y | #31 A kicked enemy slides, knocks out the row, triggers far switches | PARTIAL §CP2 L107, L109: boa kick-roll and turtle shell kicked into others; no switches, other species |  |
| `LEDGER-2026-11-04-part2.md:261` | Y | #32 Each species a signature state machine tied to its world | PARTIAL §Animals L174-175, L1564: second behaviours from unused frames, element binding; no per-world signature |  |
| `LEDGER-2026-11-04-part2.md:262` | Y | #33 Snake false vine: tongue flick, punch it stiff 3 s as a swing vine | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:263` | Y | #34 Coiled snake hisses 0.4 s then lunges; jump it or kick it off | PARTIAL §Animals L219: boa rear-up tell with a screen-wide run-up; no 0.4 s number, no kick-off |  |
| `LEDGER-2026-11-04-part2.md:264` | Y | #35 Cave jaguars creep only when back turned or in dark; freeze in light | MISSING | R2: light rule for Worlds 3 and 8 |
| `LEDGER-2026-11-04-part2.md:265` | Y | #36 Pounce: eyes flash 0.5 s, fixed arc leap; duck under or uppercut | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:266` | Y | #37 Eagle shadow tracks 1.2 s, screech, dive, talons stick in the dirt | PARTIAL §Unused-art L156, L567: hide from the eagle only; no shadow lock or stuck talons |  |
| `LEDGER-2026-11-04-part2.md:267` | Y | #38 Eagles hover still in wind as stepping stones (4-4, 4-5) | MISSING | R3 |
| `LEDGER-2026-11-04-part2.md:268` | Y | #39 Spider tripwire in 3 beats: pluck, eyes, 3 drop ahead, 1 chaser behind | MISSING | R2: World 5 only |
| `LEDGER-2026-11-04-part2.md:269` | Y | #40 Counterplay: weave through, kick the anchor, punch one to tangle all three | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:270` | Y | #41 River snappers: snap up when jumped; snout a bouncy platform for 1 s | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:271` | Y | #42 Front shield blocks punch; kick knocks it off or into water | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:272` | Y | #43 Spiked helmet: stomp hurts; hit from the side | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:273` | Y | #44 Spear blocks front; stomp, or lure the thrust into wood | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:274` | Y | #45 Enemy count set by the node's job, never random | PARTIAL §Dial L643, L645: risky pieces per burst and taught animals per stage by d, rests and teach hold 0; no count per other job |  |
| `LEDGER-2026-11-04-part2.md:275` | Y | #46 35% rule: at least 3 of 8 nodes enemy-free; rests 0 enemies | PARTIAL §Dial L643: rests and teach steps hold 0 risky pieces; no node share |  |
| `LEDGER-2026-11-04-part2.md:276` | Y | #47 Pure precision nodes enemy-free: let the environment be the enemy | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:277` | Y | #48 1 to 3 enemies on screen; never clusters of one kind on flat ground | PARTIAL §Placement 5 L315: at most 2 kinds of hazard or animal per view; no count cap |  |
| `LEDGER-2026-11-04-part2.md:278` | Y | #49 Solo Specialist: one high-threat enemy on a bridge or switch as the room's puzzle | MISSING | R3: an animal-led node idea |
| `LEDGER-2026-11-04-part2.md:279` | Y | #50 Stepping-stone chain: 2-3 eagles or hanging snakes over a gap, stomp across | MISSING | R3 |
| `LEDGER-2026-11-04-part2.md:280` | Y | #51 Triggered swarm only on a mistake, 5 s escape sprint | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:281` | Y | #52 No enemy within 150 px of a blind landing | MISSING | R1: fairness |
| `LEDGER-2026-11-04-part2.md:282` | Y | #53 Wide flat ledge over 300 px eligible for 1 armoured guard or coiled snake | MISSING | R3: binds animals to piece kinds, so they vary with the layout |
| `LEDGER-2026-11-04-part2.md:283` | Y | #54 Chasm over 250 px eligible for 1 hovering eagle or snapper as a bounce helper | MISSING | R3 |
| `LEDGER-2026-11-04-part2.md:284` | Y | #55 Silk node: dormant 3 spiders + 1 chaser wired to a floor tripwire | MISSING | R1: World 5 only |
| `LEDGER-2026-11-04-part2.md:285` | Y | #56 Fingerprint and anti-similarity pipeline on a grammar generator | §Variety gate L30-41; §CP3 mix rule L232-259 |  |
| `LEDGER-2026-11-04-part2.md:286` | Y | #57 Fingerprint each stage as it is generated, by behaviour tokens not tile coordinates | PARTIAL §CP1 L53-54: measure reads piece kinds a player stands on; ideas and pieces, not move tokens |  |
| `LEDGER-2026-11-04-part2.md:287` | Y | #58 Behaviour tokens: J jump, V vine, B branch, W wind, S slow, C climb, P puzzle | PARTIAL §Move ladder L1309-1321: per-move use counts per stage; no token string |  |
| `LEDGER-2026-11-04-part2.md:288` | Y | #59 Boring example: J V B repeated three times | PARTIAL §Variety gate L34; §Bursts L391: run cap of one piece, no same burst twice; no move-sequence check |  |
| `LEDGER-2026-11-04-part2.md:289` | Y | #60 Any exact 3-4 token run in level 7 forbidden in level 8 | PARTIAL §Variety gate L41, L133: neighbour idea overlap at most half; no run ban | R4 |
| `LEDGER-2026-11-04-part2.md:290` | Y | #61 Levenshtein vs level 7 over 55%: reject, seed++, scramble map shape | PARTIAL §Variety gate L41; §CP3 L259: neighbour overlap only; fails without reroll; no map-shape change | R4 |
| `LEDGER-2026-11-04-part2.md:291` | Y | #62 Flow: alternate intense execution and micro-rests | §Rests L500-511; §Bursts L390; L799 | Rest nodes, Easy breathers, Normal pad after every second burst |
| `LEDGER-2026-11-04-part2.md:292` | Y | #63 A BPM per stage from its world (W2 85, W5 110, W10 130) | CONTRADICTED L1120: rhythm is the player's, not the song |  |
| `LEDGER-2026-11-04-part2.md:293` | Y | #64 Cut every 10-15 s node into bars of 4 beats | PARTIAL §Design L1121: nodes draw a rhythm pattern (regular, swing, broken, wait-and-go); no bars, no node duration |  |
| `LEDGER-2026-11-04-part2.md:294` | Y | #65 Lock platforms, vines and hazards to beat, off-beat or half-note | PARTIAL §Design L1121: rhythm patterns named; no beat grid placements snap to, nothing reads intervals |  |
| `LEDGER-2026-11-04-part2.md:295` | Y | #66 Swinging vines at exact 4/4 intervals as the first test piece | PARTIAL §Design L1121: "regular" pattern named but not specified or built |  |
| `LEDGER-2026-11-04-part2.md:296` | Y | #67 Action density across nodes as a strict sine wave | PARTIAL §CP3 node plan L341-351; §Rests L508: jobs rise and fall; density judged stage-wide only |  |
| `LEDGER-2026-11-04-part2.md:297` | Y | #68 Node 1: one action every 2.5 s warm-up | PARTIAL §CP3 node plan L341, L1065: warm-up/teach nodes; no rate |  |
| `LEDGER-2026-11-04-part2.md:298` | Y | #69 Node 2: one action every 1.2 s | MISSING | R2: per-node rates shape the curve; spec only stage-wide density |
| `LEDGER-2026-11-04-part2.md:299` | Y | #70 Node 3: the spike, peak tension (may move) | §Stage profile L1213; §CP3 node plan L346, L350 | Moment named per stage: 1-1 n9, 1-5 n6/n10 |
| `LEDGER-2026-11-04-part2.md:300` | Y | #71 Node 4: zero action safe ledge where the wayside line plays | §CP3 node plan L345; §Rests L500 | n5 rest with Dot's wayside line; n7b second Dot spot |
| `LEDGER-2026-11-04-part2.md:301` | Y | #72 Nodes 5-6: a completely different mechanical pairing | PARTIAL §1-1 L976-984; §Mixing L1320: one stage's ground-to-tree turn; no every-stage rule |  |
| `LEDGER-2026-11-04-part2.md:302` | Y | #73 Node 7: maximum density, everything together | §CP3 node plan L350 | n10 master |
| `LEDGER-2026-11-04-part2.md:303` | Y | #74 Node 8: cool-down, a slide or glide into the exit | PARTIAL §CP3 node plan L351, L1075: cool-down is bank hops or one long branch; no slide or glide out |  |
| `LEDGER-2026-11-04-part2.md:304` | Y | #75 Every level follows this exact shape, only the flavour varies | §How a stage L1037-1043 | Not taken as written: spec varies shape by profile, as the ledger advises |
| `LEDGER-2026-11-04-part2.md:305` | Y | #76 Random collectibles get missed; always-highest is formulaic | PARTIAL §Placement 4 L304-312: petals on route, hard ones in test nodes or high road; no anti-formula rule |  |
| `LEDGER-2026-11-04-part2.md:306` | Y | #77 Every collectible seen or heard from the safe rest just before it | PARTIAL §CP3 L373: only the golden-seed glint must be visible from n9's route |  |
| `LEDGER-2026-11-04-part2.md:307` | Y | #78 Sightline tease: from the rest, see a page glinting across a chasm | PARTIAL §CP3 L371-374: 1-5's seed glint "too far, for now" |  |
| `LEDGER-2026-11-04-part2.md:308` | Y | #79 Sound tease: music-box chime within 300 px of a hidden note | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:309` | Y | #80 Collectibles given structural roles in the node graph so spots never repeat | PARTIAL §Placement 4 L306; §CP3 L356-358: marks per node, harder ones by job; no rotating roles | R3 |
| `LEDGER-2026-11-04-part2.md:310` | Y | #81 Flow Reward at top of a fast swing or slide, only with unbroken speed | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:311` | Y | #82 Branch-Switch page on a high road of breaking branches; a fall lands safely on the low road | §CP3 node plan L344, L350; §CP3 MISS L434-438 | High road creaky, slip to low road costs nothing on Easy |
| `LEDGER-2026-11-04-part2.md:312` | Y | #83 Patience Reward in a dead-end alcove a fast player rushes past | PARTIAL §1-1 L1177: side pockets off the line; no stop or hang requirement |  |
| `LEDGER-2026-11-04-part2.md:313` | Y | #84 Checklist: tokenize, Levenshtein vs previous 7, lock to BPM, sine wave, tease collectibles | PARTIAL §Variety gate L30-41: piece and idea measures only; no tokens, edit distance, BPM or teases |  |
| `LEDGER-2026-11-04-part2.md:314` | N | #85 Foundation first, validator second, content third | n/a: process order |  |
| `LEDGER-2026-11-04-part2.md:315` | N | #86 Six phases from WebGL core to APK profiling | n/a: process plan |  |
| `LEDGER-2026-11-04-part2.md:316` | N | #87 Phase 1 goal 60 FPS on budget phones | n/a: frame rate |  |
| `LEDGER-2026-11-04-part2.md:317` | N | #88 Separate state from drawing | n/a: code architecture |  |
| `LEDGER-2026-11-04-part2.md:318` | N | #89 Fixed 60 Hz physics tick with accumulator | n/a: physics loop |  |
| `LEDGER-2026-11-04-part2.md:319` | N | #90 2048 atlases, 1-3 batched draw calls | n/a: rendering |  |
| `LEDGER-2026-11-04-part2.md:320` | N | #91 Cache static platforms and parallax as textures | n/a: rendering |  |
| `LEDGER-2026-11-04-part2.md:321` | N | #92 Validators and touch tuning on a stuttering renderer give false data | n/a: performance and test process |  |
| `LEDGER-2026-11-04-part2.md:322` | N | #93 No new objects in the frame loop; pools | n/a: performance |  |
| `LEDGER-2026-11-04-part2.md:323` | N | #94 Unload last world's atlas to stay under texture memory | n/a: memory |  |
| `LEDGER-2026-11-04-part2.md:324` | N | #95 Keep UI and bubbles as HTML over the canvas | n/a: UI |  |
| `LEDGER-2026-11-04-part2.md:325` | Y | #96 A headless validator before redesigning levels; rejects boring layouts | §Variety gate L30; §CP3 L261; §Planner P4 L1137 | Every roll gated, 16 rolls |
| `LEDGER-2026-11-04-part2.md:326` | Y | #97 Generator outputs the token string for every required action | PARTIAL §Move ladder L1309: per-move uses counted on the main path; no token string from the generator |  |
| `LEDGER-2026-11-04-part2.md:327` | Y | #98 Within one stage, a 3-run more than twice flags | PARTIAL §Bursts L391; §CP3 L241: no same burst twice, no idea twice in a row; no 3-move count |  |
| `LEDGER-2026-11-04-part2.md:328` | Y | #99 Level N vs N-1..N-7 over 55% similar rejects | PARTIAL §Variety gate L41: neighbours share at most half their ideas | R4 |
| `LEDGER-2026-11-04-part2.md:329` | Y | #100 Dead-time auditor: over 2.5 s with zero inputs fails | §Rests L510 |  |
| `LEDGER-2026-11-04-part2.md:330` | Y | #101 Same jump interval four times in a row fails | PARTIAL §Bursts L393; §Design L1121: size band changes every 2 pieces; no interval check | R4 |
| `LEDGER-2026-11-04-part2.md:331` | Y | #102 Noisy bot: 15% less air speed, 100 ms takeoff delay, every find reachable | PARTIAL §CP3 L908, L312: bots reach all marks, limited-agent bot; no steady-late bot |  |
| `LEDGER-2026-11-04-part2.md:332` | Y | #103 Test 500 variations a second, keep only passing seeds | CONTRADICTED L259: "fails with the missing piece named, never a reroll" | Deliberate (Matt's 10-30 more-pieces rule) |
| `LEDGER-2026-11-04-part2.md:333` | Y | #104 Perfect-bot bias: validate from 6-8 px inside the ledge | §Dial L640, L651; §Planner P4 L1137 | Gaps at 0.55-0.92 of the check's limit, per-jump bot floors |
| `LEDGER-2026-11-04-part2.md:334` | Y | #105 The landing must be in the camera's view at take-off | PARTIAL §CP3 L262: only via the existing fun gate's "no new flags"; spec names no view rule |  |
| `LEDGER-2026-11-04-part2.md:335` | Y | #106 Nine generated stages per world, nodes in four parts, tenth a handmade guardian | §Move ladder L119; §CP3 node plan L339-351; §B L1462 | Teach-test-twist-master jobs; 11-12 nodes not 6-8; lairs kept |
| `LEDGER-2026-11-04-part2.md:336` | Y | #107 Roll a map shape first from five, hub for search stages | PARTIAL §Stage profile L1214: arc rises/descends/level/wave; no topology, no hub | R5 |
| `LEDGER-2026-11-04-part2.md:337` | Y | #108 Tag nodes Intro, Flow, Puzzle, Rest, Tight; never two Tight in a row | PARTIAL §CP3 node plan L339-351: job column per node; no ban on adjacent hard nodes (1-5 n6 test then n7 twist) |  |
| `LEDGER-2026-11-04-part2.md:338` | Y | #109 Beat pattern first (W2 90, W8 125 BPM), trace jump along it, place pieces under his feet | CONTRADICTED L1120: not the song; placement via the shared tracer (L1137) instead |  |
| `LEDGER-2026-11-04-part2.md:339` | Y | #110 1-2 puzzle machines per world: pulleys, jump toggles, light bridges, seesaws, water-wheels | PARTIAL §Unused-art L162, L167; §C L1541, L1547: counterweight, push block, push and lift returns; no per-world count, toggles or light bridges |  |
| `LEDGER-2026-11-04-part2.md:340` | Y | #111 Sloth modifiers: under-branch hang, fast swim, belly slide, stillness camouflage, glowworm light | PARTIAL §D L1592; §Ladder L1291: fast swim, hide in a bush; no hang, slide, camouflage or glow |  |
| `LEDGER-2026-11-04-part2.md:341` | Y | #112 Map shape separate from micro-rhythm | PARTIAL §Stage profile L1214, L1218: arc and pace are separate fields; arc is height trend, not topology |  |
| `LEDGER-2026-11-04-part2.md:342` | Y | #113 Flat hazard-free 200 px apron at every node's entry and exit | PARTIAL §Placement 1 L278-279: joins are short kit pieces sized to the next move; no flat apron rule |  |
| `LEDGER-2026-11-04-part2.md:343` | Y | #114 Invisible checkpoint at every node entrance, respawn under 0.8 s | CONTRADICTED L296-300, L426: before hard nodes only, up to 4,000 px, replay up to 45 s |  |
| `LEDGER-2026-11-04-part2.md:344` | N | #115 Today's enemies passive, bosses wait for a glowing symbol | n/a: diagnosis of current enemies and bosses |  |
| `LEDGER-2026-11-04-part2.md:345` | Y | #116 Phase 4 combat triangle | MISSING | R3: see #28 |
| `LEDGER-2026-11-04-part2.md:346` | Y | #117 Platform-role spawning in 65% of nodes, 35% enemy-free including rests | PARTIAL §Dial L643, L645: rests hold 0, animals per stage; no role spawning |  |
| `LEDGER-2026-11-04-part2.md:347` | Y | #118 Species reactions: vine snakes, dark jaguars, eagle shadow, spider curtain | MISSING | R2: only the eagle hide (L156) touches it |
| `LEDGER-2026-11-04-part2.md:348` | N | #119 Three ways to beat a guardian | n/a: bosses, kept as built (L1462) |  |
| `LEDGER-2026-11-04-part2.md:349` | N | #120 Environment systems first so enemies have toys | n/a: process order |  |
| `LEDGER-2026-11-04-part2.md:350` | Y | #121 Landing-zone cheap hits, 150 px | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:351` | Y | #122 Deterministic AI, 0.5 s telegraph before every strike | PARTIAL §Animals L219: boa rear-up tell; no general telegraph |  |
| `LEDGER-2026-11-04-part2.md:352` | N | #123 Scene length limits; no before-stage scene at X-6 | n/a: story scenes |  |
| `LEDGER-2026-11-04-part2.md:353` | Y | #124 Wayside and Dot lines at node 1, mid rest, pre-exit; split lines over 15 words | PARTIAL §Stage profile L1229; §CP3 L345: lines pinned to nodes; no 15-word split |  |
| `LEDGER-2026-11-04-part2.md:354` | N | #125 Dot away ranges by stage | n/a: story |  |
| `LEDGER-2026-11-04-part2.md:355` | N | #126 Poster and ledger page stage list | n/a: story collectibles not in code |  |
| `LEDGER-2026-11-04-part2.md:356` | N | #127 Special stages 4-D, 5-M, The Horn, The Reach moments | n/a: story moments; see F25 for the special-stage list |  |
| `LEDGER-2026-11-04-part2.md:357` | Y | #128 Story and collectibles as anchors on node slots | §Stage profile L1229; §CP3 L345, L356 |  |
| `LEDGER-2026-11-04-part2.md:358` | N | #129 Keep memory ids; old saves unlock moved scenes | n/a: story and saves |  |
| `LEDGER-2026-11-04-part2.md:359` | N | #130 RETRY_INTRO_LINES as index array | n/a: story |  |
| `LEDGER-2026-11-04-part2.md:360` | N | #131 Keep data files out of engineering prompts | n/a: process |  |
| `LEDGER-2026-11-04-part2.md:361` | Y | #132 Spec contract before code: a pure function of StageDNA and seed returning 7 nodes, no two Tight adjacent | PARTIAL §Stage profile L1204-1233: stage as data written before its plan; no adjacency rule |  |
| `LEDGER-2026-11-04-part2.md:362` | N | #133 Tests debug; paste 5-line stack | n/a: process |  |
| `LEDGER-2026-11-04-part2.md:363` | Y | #134 Rule 4: Worlds 1 and 2 at 60 FPS and 100 seeds clean before Worlds 2-10 | PARTIAL §CP3 L261; §F L1629: 16 rolls, World 1 only |  |
| `LEDGER-2026-11-04-part2.md:364` | N | #135 Build APK each phase, profile weekly | n/a: process |  |
| `LEDGER-2026-11-04-part2.md:365` | Y | #136 Under-branch hanging: hold climb to hang, move, drop, knock hazards below; doubles every branch | MISSING | R3: absent from the move table L1280-1299; doubles every bough's use |
| `LEDGER-2026-11-04-part2.md:366` | Y | #137 Stillness resonance: still 1.5 s wakes a 400 px radius | MISSING | R3 |
| `LEDGER-2026-11-04-part2.md:367` | Y | #138 Bending saplings: bridge, or catapult with a jump mid-spring | MISSING | R3: bridge half already built (puzzleKit), not in library |
| `LEDGER-2026-11-04-part2.md:368` | Y | #139 Fast swim: x1.8 speed, light gravity, hydro-dash | PARTIAL §D L1592: fast stated, no numbers |  |
| `LEDGER-2026-11-04-part2.md:369` | Y | #140 Camouflage: crouch on moss, enemies ignore him; double jump releases moths | PARTIAL §Ladder L1291; §C L1542; L539: hide in a bush, root-den hide; no moss camouflage or moths |  |
| `LEDGER-2026-11-04-part2.md:370` | Y | #141 Counterweight pulleys; bring back in more worlds | §C L1547; §Unused-art L162 | Lift returns in W7 and W10; counterweight lift idea |
| `LEDGER-2026-11-04-part2.md:371` | Y | #142 Jump-toggled flora: every jump flips solid and ghost platforms | MISSING | R3 |
| `LEDGER-2026-11-04-part2.md:372` | Y | #143 Domino branches: each break starts the next after 0.15 s; last hits a switch | MISSING | R3: a new creaky-branch variant for every tree world |
| `LEDGER-2026-11-04-part2.md:373` | Y | #144 Wind shadows behind walls, boulders and shields | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:374` | Y | #145 Silk ricochet: taut line reflects an air kick at 1.2x | MISSING | R1: parked "Later" |
| `LEDGER-2026-11-04-part2.md:375` | Y | #146 Light-solid bridges and shadow bark; punch a lantern to swing a bridge | MISSING | R2: Worlds 3, 6, 8 variety |
| `LEDGER-2026-11-04-part2.md:376` | Y | #147 Sound ripples outline hidden platforms and wake sound-sensitive enemies | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:377` | Y | #148 Lightning silhouettes in World 10: 0.4 s flash shows thorns and safe steps | PARTIAL §Ladder L1299: hold or freeze on the flash (10-3); no silhouette or fading trail |  |
| `LEDGER-2026-11-04-part2.md:378` | Y | #149 Water waves: surface springs, logs ride, a ground-pound lifts a far platform | PARTIAL §Library additions L543; §D L1594: timed waves and rising tide; no spring surface |  |
| `LEDGER-2026-11-04-part2.md:379` | Y | #150 Background-layer jumps via hollow logs or cannon vines | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:380` | Y | #151 Wrist-petal pulse rate rises near an uncollected find | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:381` | Y | #152 Dot's claw hang; Flicker lights 150 px ahead when Dot is away | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:382` | N | #153 Playable boss intros in-engine | n/a: boss |  |
| `LEDGER-2026-11-04-part2.md:383` | N | #154 Poster cameos: soldiers set a failing trap on the next rest | n/a: story |  |
| `LEDGER-2026-11-04-part2.md:384` | Y | #155 Venom Fang as a hidden zip-line vine in Worlds 2, 4, 6, 8 | MISSING | R2: a recurring cross-world secret |
| `LEDGER-2026-11-04-part2.md:385` | Y | #156 Enemy bowling: a kicked enemy rolls 550 px/s, knocks others, breaks walls, presses plates | PARTIAL §CP2 L107, L109: boa kick-roll, turtle shell into others; no walls or plates |  |
| `LEDGER-2026-11-04-part2.md:386` | Y | #157 Vine snakes: tongue every 2.5 s, stunned 4 s and swingable | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:387` | Y | #158 Projectile batting: 0.15 s punch deflect window | MISSING | R1 |
| `LEDGER-2026-11-04-part2.md:388` | Y | #159 Look-away sentries in Worlds 3 and 7 | MISSING | R2 |
| `LEDGER-2026-11-04-part2.md:389` | Y | #160 Spider curtain: 3-4 spiders at staggered heights; kick top one, Newton's cradle | MISSING | R1: World 5 only |
| `LEDGER-2026-11-04-part2.md:390` | N | #161 Seed-sharing ghost race | n/a: social feature |  |
| `LEDGER-2026-11-04-part2.md:391` | N | #162 Environmental boss finisher at 15% health | n/a: bosses |  |
| `LEDGER-2026-11-04-part2.md:392` | Y | #163 Director: 3 deaths widens next ledges; clean play opens an elite high road | MISSING | R2: spec's d is fixed per stage (L628) |
| `LEDGER-2026-11-04-part2.md:393` | N | #164 Haptics and pitch chains | n/a: feel and audio |  |
| `LEDGER-2026-11-04-part2.md:394` | N | #165 Meeca remix mode with stopwatch | n/a: separate game mode |  |

### reference/research/ledger/LEDGER-CRITICAL-AGENTS.md
135 rows: used 8, partial 18, missing 3, contradicted 0, n/a 106

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `LEDGER-CRITICAL-AGENTS.md:25` | N | Split helper thinking into Designer, Planner and Critic rooms that never share a pass | n/a: helper setup process, not stage generation | Spec's own designer/planner split with CRITIC.md as an input (L1-7) reflects it. |
| `LEDGER-CRITICAL-AGENTS.md:29` | N | Hide the lead's and Matt's opinions from the designer's brief | n/a: helper briefing process | - |
| `LEDGER-CRITICAL-AGENTS.md:31` | N | Critic as a premortem that may pass, not a devil's advocate | n/a: helper briefing process | - |
| `LEDGER-CRITICAL-AGENTS.md:34` | Y | Machines check reach, repeats, density; helpers argue only fun, sameness, cost, risk | §Placement rules L276; §P4 L1137-1139; §CP3 READY L905-908 | Every placement rule carries a machine check; what no machine can judge goes to Matt on the map. |
| `LEDGER-CRITICAL-AGENTS.md:36` | N | One debate round, then stop; disagreements stay written down | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:49` | N | Designer gives three orthogonal options varying linearity, action density and risk-reward | n/a: designer-brief process (options), not a stage rule | Stage-level analogue in the spec is the feel profile and feel check (L1037-1044). |
| `LEDGER-CRITICAL-AGENTS.md:50` | N | Designer insulated from the critic's direct feedback | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:51` | N | Designer blinded to user and peer preferences | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:52` | N | Designer barred from number checks, budget trimming, risk mitigation | n/a: helper process | The spec's designer does issue number rulings (e.g. L178-188), the opposite of this role split. |
| `LEDGER-CRITICAL-AGENTS.md:53` | Y | Kishotenketsu arc made optional; favour multi-purpose pieces doing movement, defense and pacing at once | PARTIAL §move ladder L119; §CP3 node plan L342-350: teach/test/twist/master jobs; no rule asking pieces to do several jobs | Only the hollow-log crawl idea (L156: pass under a hazard or hide) is multi-purpose. |
| `LEDGER-CRITICAL-AGENTS.md:54` | N | Designer first restates the problem as an outsider | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:60` | Y | Concept graph first: entry/exit, critical-path length, lock-and-key, branching factor, node purposes | PARTIAL §CP3 node plan L339-351; §Stage profile L1213-1230: jobs, entry/exit, branching named; no lock-and-key dependencies or critical-path length | Root gate idea (L157) is parked as a small build (L204). |
| `LEDGER-CRITICAL-AGENTS.md:61` | Y | Beats as bounded windows with explicit duration, entry state and exit state | PARTIAL §CP3 L251, L339-351: entry and exit per node; no per-node duration | Duration exists only as burst piece counts (L391) and the stage pace field (L1218). |
| `LEDGER-CRITICAL-AGENTS.md:62` | Y | Alternate action sprints with recovery; put landmarks at decision boundaries | PARTIAL §rests L500-506; §A+B L799: rests and breathers; no landmark-at-fork rule | Nearest: a mark on the fork bank before each split (L826), a collectible, not a landmark. |
| `LEDGER-CRITICAL-AGENTS.md:63` | Y | Every node and transition bound to measurable acceptance criteria, not prose | §Placement rules L276, L282-283; §CP3 pass lines L395-400 | - |
| `LEDGER-CRITICAL-AGENTS.md:64` | Y | On solver failure or critic risk: targeted local repair, relaxation or node swap keeping intent | PARTIAL §CP3 L259, L369-370: fails naming the missing piece, planner reports; no automatic local repair | Relaxing a line is a designer ruling only (L992: not lowered quietly). |
| `LEDGER-CRITICAL-AGENTS.md:65` | N | Planner turns top 5-8 risks into prevent/reduce/trigger/accept actions in a register | n/a: project-risk process | - |
| `LEDGER-CRITICAL-AGENTS.md:66` | N | Planner keeps disagreements visible and gives a measurable first step | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:72` | N | Critic judges the planner's concrete spec, never the designer | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:73` | N | Premortem anchor: spec shipped and failed six months later | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:74` | N | 3-4 critic personas in parallel, one cause per line, no rebuttal | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:75` | Y | Audit pairwise and multi-node adjacencies: benign pieces side by side become compound bottlenecks | MISSING | R2: fairness more than sameness; nearest is the clutter cap (L313-317, two hazard kinds per view); no gap-next-to-animal rule. |
| `LEDGER-CRITICAL-AGENTS.md:76` | N | Each objection cites node, state transition and falsifying input | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:77` | N | Critic may emit VERIFICATION_PASSED when nothing is falsifiable | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:78` | N | Hide raw confidence scores from fellow debaters | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:79` | N | Critic also proposes better, faster, cheaper alternatives | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:86` | N | Blind the designer by a forbidden-file list and check its reads | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:90` | N | No opinion words in the designer's brief | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:93` | N | Three options table on four axes, incl. where a new world's variety comes from | n/a: designer-brief process | - |
| `LEDGER-CRITICAL-AGENTS.md:96` | N | Premortem critics in parallel with a fixed, dated failure premise | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:101` | N | Every objection carries a falsifier; tool-checkable ones get run | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:104` | N | A critic pass is allowed and expected when true | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:106` | N | One round; a Still-disagreed table for the lead | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:108` | N | Consistency-illusion check: same answer, different reasons flagged | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:110` | N | Lead's five-minute proof-of-thought spot check | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:115` | N | Lead's sketch is a spec under attack, not a judge | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:182` | N | Designer brief step: outsider restatement in five lines | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:183` | N | Designer brief step: three approaches that differ in kind, by table | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:186` | N | Designer brief step: one-page spec per option, what makes World 7 unlike World 2 | n/a: brief template | The spec's answer to world difference is the world table (L1495-1506). |
| `LEDGER-CRITICAL-AGENTS.md:188` | N | Designer brief step: don't cost or trim; cite research lines | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:189` | N | Designer brief step: favourite, what would drop it, what was rejected | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:199` | N | Critic brief step: three persona subagents blind to each other | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:202` | N | Critic brief step: merge, cluster, rank, run tool-checkable causes | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:204` | Y | Check pairs: two pieces fine alone but bad side by side, e.g. a gap onto a patrol | MISSING | R2: pair difficulty; placement rules L278-319 check joins and clutter, never a risky pair. |
| `LEDGER-CRITICAL-AGENTS.md:205` | N | Critic brief step: VERIFICATION_PASSED where unfalsifiable | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:206` | N | Critic brief step: better/faster/cheaper alternatives with evidence | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:216` | Y | Concept graph for a sample stage: entry, exit, critical path, unlocks, branches, node jobs | PARTIAL §CP3 node plan L339-351; §Stage profile L1213-1230: no unlock dependencies, no critical-path length | Length is set only as the quick-route clock (L664). |
| `LEDGER-CRITICAL-AGENTS.md:217` | Y | Beats: each node's duration, entry state, exit state | PARTIAL §CP3 L251, L339-351: entry and exit only; no node durations | - |
| `LEDGER-CRITICAL-AGENTS.md:218` | Y | Every node and file has a machine-runnable acceptance test, not prose | §Placement rules L276; §Element table rules L1256-1259; §Gates L1612-1620 | - |
| `LEDGER-CRITICAL-AGENTS.md:219` | N | Planner brief step: risk register answering each critic cause | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:221` | N | Planner brief step: Still-disagreed table | n/a: brief template | - |
| `LEDGER-CRITICAL-AGENTS.md:223` | N | Planner brief step: first job of 2 hours or less with a number | n/a: brief template | The spec's checkpoints follow this shape (L20-28). |
| `LEDGER-CRITICAL-AGENTS.md:230` | N | Weak point: doc has no templates; we write missing parts | n/a: research critique of helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:232` | N | Weak point: temperature, steering and solver knobs aren't ours | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:234` | N | Weak point: critic-never-sees-designer clashes with Matt's ask | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:236` | N | Weak point: don't downgrade the critic's model | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:238` | N | Weak point: same base model everywhere; lean on blinding and tools | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:242` | N | Weak point: many cited numbers are unverifiable | n/a: research critique | - |
| `LEDGER-CRITICAL-AGENTS.md:249` | N | Contradiction: LEAD-SKETCH says the critic must attack | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:250` | N | Contradiction: briefs carry Matt's words and the lead's approach | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:251` | N | Contradiction: one helper designs, builds and self-checks | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:252` | N | Contradiction: lead judges critiques of its own sketch | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:261` | N | Two pathologies, tunneling and sycophancy, fixed by orchestration | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:262` | N | Degeneration-of-thought: self-correction without outside feedback worsens | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:263` | N | Three drivers of degeneration-of-thought | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:264` | Y | Single-pass output is locally fine but fails global reachability; check globally by tool | §variety gate L38-39; §CP3 READY L906-908 | Both roads proven walkable; level check 32/32; both bots reach the shrine. |
| `LEDGER-CRITICAL-AGENTS.md:265` | N | Sycophancy comes from preference training | n/a: model behaviour | - |
| `LEDGER-CRITICAL-AGENTS.md:266` | N | Four sycophancy failure vectors | n/a: model behaviour | - |
| `LEDGER-CRITICAL-AGENTS.md:267` | N | 'Be critical' backfires; steering vectors cut sycophancy | n/a: model behaviour | - |
| `LEDGER-CRITICAL-AGENTS.md:268` | N | Table mapping pathologies to fixes (MAD, blinding, heterogeneous models) | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:269` | N | Definition of real multi-agent debate | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:270` | N | ChatEval protocols: one-by-one, simultaneous talk | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:271` | N | DiMo divergent and logical modes | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:272` | N | Debate accuracy gains on puzzles | n/a: context only | - |
| `LEDGER-CRITICAL-AGENTS.md:273` | N | Strongest-reasoner ceiling | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:274` | N | Speaking order has negligible effect | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:275` | N | Two debate passes worse than one on hard problems | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:276` | N | Role diversity helps up to 3-4 roles | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:277` | N | Good debates keep minority views and give rationale | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:278` | N | Strong-model paradox | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:279` | N | Confident wrong agents override hesitant right ones | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:280` | N | Consistency illusion | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:281` | N | Self-enhancement bias when a participant judges | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:282` | N | Static devil's advocate performs worst | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:283` | N | Prospective hindsight yields more causal explanations | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:284` | N | Klein premortem asks what did go wrong | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:285` | N | Premortem step 1: present the plan non-defensively | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:286` | N | Premortem step 2: vivid dated failure | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:287` | N | Premortem step 3: silent, parallel causes | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:288` | N | Premortem step 4: round-robin, no rebuttal | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:289` | N | Premortem step 5: cluster and dot-vote | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:290` | N | Premortem step 6: owned actions for top risks | n/a: project-risk process | - |
| `LEDGER-CRITICAL-AGENTS.md:291` | N | Premortem step 7: risk register re-audited at midpoint | n/a: project-risk process | - |
| `LEDGER-CRITICAL-AGENTS.md:292` | N | One pass that ideates, plans and critiques at once self-censors | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:293` | N | Disney strategy: outsider, dreamer, realist, critic | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:294` | Y | Tanagra-style reactive planner picks patterns and beats; a solver places geometry, guaranteeing playability | PARTIAL §CP3 L249-251 decks and ideas; L369 gaps sized by the level check; §P4 L1137: no solver | - |
| `LEDGER-CRITICAL-AGENTS.md:295` | Y | Dead Cells: hand-authored macro frame and concept graph, then compliant rooms | PARTIAL §whole-game plan L1458-1506; §Stage profile L1208-1230: macro frame per world and stage; no lock-and-key graph | - |
| `LEDGER-CRITICAL-AGENTS.md:296` | Y | Kishotenketsu against filler; micro/meso/macro patterns; multi-purpose mechanics | PARTIAL §CP3 bursts L390-393 (micro), ideas L74-86 (meso), profile L1208 (macro); no multi-purpose rule | - |
| `LEDGER-CRITICAL-AGENTS.md:297` | N | Briefs as strict functional specs with input/output contracts | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:298` | N | Designer decoding temperature and retrieval feed | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:299` | N | Designer insulated from the critic | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:300` | N | At least three orthogonal design options | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:301` | Y | Every candidate follows Kishotenketsu; ledger says optional, since a fixed arc is itself a felt pattern | §move ladder L119; §CP3 node plan L342-350; §CP4 1-1 plan L1063-1075 | Jobs used per node, not one mandatory arc; 1-1 and 1-5 plans have different shapes. |
| `LEDGER-CRITICAL-AGENTS.md:302` | Y | Favour multi-purpose components (movement, defense, pacing at once) | PARTIAL §unused-art ideas L156: hollow-log crawl only; no rule asking pieces to do two jobs | - |
| `LEDGER-CRITICAL-AGENTS.md:303` | N | Designer banned from number checks | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:304` | N | Planner decoding temperature, JSON schema | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:305` | Y | Concept graph first: entry/exit, critical path, lock-and-key, branching, node purposes | PARTIAL §CP3 node plan L339-351; §Stage profile L1217: no lock-and-key or critical-path length | - |
| `LEDGER-CRITICAL-AGENTS.md:306` | Y | Beats as bounded windows with duration and entry/exit invariants, for every node type | PARTIAL §CP3 L251: entry/exit for every node; no durations | - |
| `LEDGER-CRITICAL-AGENTS.md:307` | Y | Alternate sprints and recovery; a landmark at every fork | PARTIAL §rests L500-506; §A+B L799: no landmark rule | Nearest: fork-bank marks (L826). |
| `LEDGER-CRITICAL-AGENTS.md:308` | Y | Every node and transition has measurable acceptance criteria | §Placement rules L276; §CP3 L395-400 | - |
| `LEDGER-CRITICAL-AGENTS.md:309` | Y | Local repair from the error instead of random retries | PARTIAL §CP3 L259 (never a reroll), L369-370: no automatic repair or node swap | Mix code sizes gaps by binary search on jumpOK (src/game/mixer/w1mix.ts:240, :262). |
| `LEDGER-CRITICAL-AGENTS.md:310` | N | Critic judges the planner's spec, never the designer | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:311` | N | 3-4 critic personas, masked confidence | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:312` | N | Premortem anchor and forensic autopsy | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:313` | Y | Audit pairs and multi-node adjacencies; add a general pair check to the validator | MISSING | R2: no pair-difficulty check anywhere in the spec; clutter cap L313-317 is the nearest. |
| `LEDGER-CRITICAL-AGENTS.md:314` | N | Each objection cites node, transition, falsifier | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:315` | N | VERIFICATION_PASSED halts deliberation | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:316` | N | Role table for the three agents | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:317` | N | Naive debate costs grow quadratically | n/a: helper cost | - |
| `LEDGER-CRITICAL-AGENTS.md:318` | Y | Put a deterministic verifier, not LLM debate, on maths and reachability | §P4 L1137-1139; §Placement rules L276 | - |
| `LEDGER-CRITICAL-AGENTS.md:319` | Y | Solver returns a minimal unsat core or relaxes constraints automatically | PARTIAL §CP3 L259: failure names the missing piece; relaxing is designer-only (L370, L992) | - |
| `LEDGER-CRITICAL-AGENTS.md:320` | Y | Adaptive pipeline: skill classifier, physics verifier, deterministic local repair, not re-prompting | PARTIAL §CP3 READY L906-908: bots and level check verify; no local repair step | - |
| `LEDGER-CRITICAL-AGENTS.md:321` | N | FormalAlign beats GPT-4 judging | n/a: context only | - |
| `LEDGER-CRITICAL-AGENTS.md:322` | Y | Pre-filter with expressive-range metrics: linearity, leniency, action density, flow | §variety gate L30-41; §rests L508-510; §difficulty dial L644 | Splits and two-road share stand in for linearity, E[lives] for leniency, actions a second for density. |
| `LEDGER-CRITICAL-AGENTS.md:323` | N | Debate only when uncertainty is high | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:324` | N | Localized debate only at the divergence node | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:325` | N | Hard cap of 1-2 debate rounds | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:326` | N | Prefix caching cuts token cost | n/a: token cost | - |
| `LEDGER-CRITICAL-AGENTS.md:327` | N | Prefix ordering: static root, artifact log, role suffix | n/a: token cost | - |
| `LEDGER-CRITICAL-AGENTS.md:328` | N | Synthesis: triadic separation | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:329` | N | Strip user-opinion cues; neutral judge | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:330` | N | Parallel premortem across 3-4 personas | n/a: helper process | - |
| `LEDGER-CRITICAL-AGENTS.md:331` | Y | All formal checks to zero-token verifiers, expressive-range filters and local repair | PARTIAL §Gates L1612-1620; §variety gate L30-41: verifiers and filters yes; no local repair | - |
| `LEDGER-CRITICAL-AGENTS.md:332` | N | 66 works cited | n/a: references | - |
| `LEDGER-CRITICAL-AGENTS.md:333` | N | Matt's asks the doc leaves open (templates, alternatives, visible disagreement) | n/a: helper process | - |

### reference/research/ledger/LEDGER-ENGINE-GEMINI.md
371 rows: used 73, partial 144, missing 73, contradicted 8, n/a 73

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `LEDGER-ENGINE-GEMINI.md:112` | Y | A stage is a ~20-line data spec compiled by fixed code, not hand-written TypeScript per stage. | §Stage profile L1204-1233; §How a stage is made L1026-1034; §F L1626 | Profile has ~20 fields, mixer builds the stage; "stage as data" is in the planner's order. |
| `LEDGER-ENGINE-GEMINI.md:116` | Y | Topology pass: node boxes with entry/exit vectors, four map shapes (loop back, split, chimney, hub), split closure. | PARTIAL §Stage profile L1214 (arc), §CP3 L251, L405-412: only rise/descend arc, high/low splits and height joins; no loop back, chimney, hub-and-spoke or 2D boxes | Every stage still runs left to right; the macro shape the research calls the cure for sameness is absent. |
| `LEDGER-ENGINE-GEMINI.md:122` | Y | Section patterns as data, beat-relative, with bound platform roles, enemy slots, petal arcs, miss floors, no x/y. | PARTIAL §CP2 L62-86, §CP3 L249, L390: node ideas list pieces in order with entry/exit; sized in px from shipped ranges (L333), no enemy-slot, arc or miss-floor fields | Ideas-as-data adopted; beat-relative steps not. |
| `LEDGER-ENGINE-GEMINI.md:127` | Y | Hazards timed in counterpoint to the player's moves (thrown fruit lands beat 3 while he jumps beat 2). | MISSING | R4: adds "when" variety to every world; spec only has fixed timed windows L647 and rhythm patterns L1120, nothing times a hazard against them. |
| `LEDGER-ENGINE-GEMINI.md:131` | Y | Structured blame log: failing data line, measured value, limit and exact fix, under 15 lines. | PARTIAL §CP3 L259; §Element table L1259: a node fails "with the missing piece named"; no data line, limit or fix format | Cuts repair cost, not repetition directly. |
| `LEDGER-ENGINE-GEMINI.md:137` | N | Keep every generator module under 150 lines over one frozen types file. | n/a: code organisation and token cost, not stage design | Spec says nothing on module size. |
| `LEDGER-ENGINE-GEMINI.md:141` | Y | Local auto-healer: split short landings, fill dead walks over 2.5 s with a hop, swap a repeated seam pattern. | PARTIAL §Pacing L510: dead time over 2.5 s is a failing line, not auto-filled; no seam swap; L259 fails instead | Spec fixes by designer rulings per roll, not by code. |
| `LEDGER-ENGINE-GEMINI.md:147` | Y | Each node's tension drives its numbers (density, gap share, width), with a planned-vs-measured check. | PARTIAL §Difficulty dial L635-656: one d per stage drives gaps, widths, risk; "job can raise its nodes" L655 unquantified; no planned-vs-measured check | Per-node tension curve absent. |
| `LEDGER-ENGINE-GEMINI.md:152` | Y | Animals bound to platform roles in data, with a pairwise threat cap (move × animal × runway). | PARTIAL §CP2 L107, L219; §C Animals L1563-1567; §Placement L316: element and room-around rules, max 2 hazard kinds per view; no roles, no pairwise cap | Boa's run-up is the only role-like rule. |
| `LEDGER-ENGINE-GEMINI.md:157` | Y | Slow zones (mud, silk, shimmy rope, water) never empty corridors: under a faster road or paired with a dodge. | MISSING | R3: ladder forces ropes ≥1 in 3 stages (L1539); Rope crossing L106 is an empty slow corridor. Only swim's "no slow drag" L1593. |
| `LEDGER-ENGINE-GEMINI.md:161` | N | Visual beat pulse (mushrooms squash on the beat, gust particles flash) for muted players. | n/a: music-sync visual touch; spec L1120 takes rhythm from the player, not the song | Not in spec. |
| `LEDGER-ENGINE-GEMINI.md:165` | Y | Contain cause-and-effect to bonus spots: a flag in stage s changes only a bonus node in stage s+1. | MISSING | R2: cross-stage changes would make replays and neighbours differ; spec has no cause-and-effect at all. |
| `LEDGER-ENGINE-GEMINI.md:168` | Y | Asymmetric late input window (−3/+6 frames) for Bluetooth lag; add a late try to the tracer. | MISSING | R1: fairness of the check, not variety. |
| `LEDGER-ENGINE-GEMINI.md:171` | Y | When the next landing would leave the shared upright/sideways view, fold the path (switchback vine, bounce, lift). | MISSING | R2: folds would add vertical turns; spec only checks clutter and stills in both views (L313, L373). |
| `LEDGER-ENGINE-GEMINI.md:174` | Y | Normalized bigram entropy of the move string ≥ 0.68 against two-move ping-pong. | PARTIAL §CP3 L240-246: idea ping-pong named a failure, caught by the 40% share cap and ≥4 ideas; no move-string entropy | Works on ideas, not moves. |
| `LEDGER-ENGINE-GEMINI.md:176` | Y | Gesture cooldown: ≥267 ms after a double jump or drop before a punch or kick is asked. | MISSING | R1: combat is not traced; boa kick-roll L107 placed without it. |
| `LEDGER-ENGINE-GEMINI.md:178` | N | Frame-harmonic tempos: 1800/BPM a whole number of 30 fps frames. | n/a: music tempo; spec L1120 does not place moves on the song's beat | — |
| `LEDGER-ENGINE-GEMINI.md:181` | N | Mount the GPU layer per node (i−1, i, i+1), ≤3 draw calls a node. | n/a: rendering performance | — |
| `LEDGER-ENGINE-GEMINI.md:183` | Y | Composite flow score: curve fidelity, beat alignment, variety, vertical flow, agency. | MISSING | R2: fun gate gives flags (L262, L490-511), no score; a curve-fidelity term would catch flat pacing. |
| `LEDGER-ENGINE-GEMINI.md:187` | Y | Golden seeds by rule: risky split road, puzzle room, late optional skill branch. | PARTIAL §Placement rule 4 L304-311; §1-5 L371-374: hard collectibles on high road/test nodes; seed only a glint in 1-5, no 3-seed rule | Real seed deferred to the glide stage. |
| `LEDGER-ENGINE-GEMINI.md:203` | Y | Who sets the tempo: Gemini's typed BPM table vs ours, the stage's own music beat. | CONTRADICTED L1120: rhythm is "the player's rhythm, not the song"; neither Gemini's table nor W1P's music beat | Spec types no BPM, but drops the music-beat rule the ledger keeps. |
| `LEDGER-ENGINE-GEMINI.md:209` | Y | No fixed tension curve: each stage places spike, rest and pair differently from the stage before. | MISSING | R5: 1-5 (L339-351) and 1-1 (L1063-1075) both 11 nodes, fork ~n4-5 and n10, rest n5-6, cool down n11; feel check L1042 ignores node order. |
| `LEDGER-ENGINE-GEMINI.md:213` | Y | Pieces per world: ours 12+ templates and 14+ section types per world, not Gemini's 2-3 patterns. | PARTIAL §Shared library L122-134; §CP2 L92, L208; §CP3 L514: more pieces and 14 W1 ideas, but no per-world minimum written | World 2-10 counts unstated. |
| `LEDGER-ENGINE-GEMINI.md:217` | Y | Variety must include what he stands on, faces, uses, direction and art, not move letters only. | §Variety gate L30-41; §Log family L560; §How a stage is made L1042-1043 | Kinds, sizes, splits, climb and art kinds counted; direction of travel not. |
| `LEDGER-ENGINE-GEMINI.md:221` | Y | Action density: ours Easy 0.35-0.55, Normal 0.75-1.15; Gemini's Easy top 55% higher. | §Rests and breathers L508; §Pacing L801 | Easy uses ours; Normal judged vs main's 0.57, 0.80 accepted provisional. |
| `LEDGER-ENGINE-GEMINI.md:224` | Y | Rhythm groups 5-20 s, rests 1.0-1.2/2.0-2.5 s, dense 15-20 s finale ending at the exit. | CONTRADICTED L351, L1075: every stage ends with a cool-down node after the master; rests used L503, L509, L799 | Groups and rests follow ours; the finale-at-exit rule is replaced by Gemini-style cool-down. |
| `LEDGER-ENGINE-GEMINI.md:228` | Y | Difficulty across worlds: reject Gemini's D(w,s) (W2-8 above W4-1); bands overlap neighbours only a little. | PARTIAL §Difficulty dial L628-633: own d keeps W2-8 (0.25) under W4-1 (0.27) but bands overlap neighbours by half; bandFor/STAGE_HEAT dropped | W2-9 equals W4-1 exactly (0.273). |
| `LEDGER-ENGINE-GEMINI.md:233` | Y | Slot order: no fixed relief dips at stages 4 and 7 in every world. | §Difficulty dial L628-633 | No dips adopted (agrees), but no stage-level dips at all (see E136). |
| `LEDGER-ENGINE-GEMINI.md:235` | Y | Generator and checker must share one measure; a cap on another metric guarantees nothing. | §CP3 L253-259, L513; §Planner amendments P4 L1137-1139 | Mixer applies the gate's own lines and asks the tracer itself. |
| `LEDGER-ENGINE-GEMINI.md:239` | Y | Miss cost: Gemini's "safe" drop is our bite tier (>4 s back); checkpoint at each node entrance. | PARTIAL §Placement L296-303; §CP3 rulings L434-438: replay ≤45 s, slip costs a heart on Normal; no 4 s bite line or per-node miss tier | — |
| `LEDGER-ENGINE-GEMINI.md:244` | Y | Enemy runway: Gemini 1.0 s (~285 px) flat before a trigger; ours 150 px from a landing. | PARTIAL §CP2 animals L219: boa only, "flat run-up of at least one screen's width"; no general rule | Stricter than both, for one animal. |
| `LEDGER-ENGINE-GEMINI.md:247` | Y | Petal goal not fixed 75%; keep 70/15/15 and set the goal from the bots. | PARTIAL §CP3 L462, L826-829: marks goal 10/13 Normal, 8/13 Easy by a slack rule, not from bots; no 70/15/15 | — |
| `LEDGER-ENGINE-GEMINI.md:251` | N | Where to start: Gemini says World 4 or 5; ours World 1. | n/a: order of work; spec starts in World 1 (L231, L1624-1629) | — |
| `LEDGER-ENGINE-GEMINI.md:252` | Y | Agreed core: formulas file, world profile, ~20-line spec, template library, traced placement, seeds; Gemini adds topology, lockout, blame, heal. | PARTIAL §Stage profile L1208-1233; §B L1495-1506; §CP2; P4 L1137: core adopted; topology pass, deck lockout >1, blame logs, auto-heal absent | — |
| `LEDGER-ENGINE-GEMINI.md:265` | Y | 6-8 pacing nodes per standard stage. | CONTRADICTED L339-351, L1063-1075: 11 nodes per stage (12 with n7b) | Numbers are Gemini's guesses; low importance alone. |
| `LEDGER-ENGINE-GEMINI.md:266` | Y | Skilled clock 120-150 s; first-timer 180-300 s. | §Stage length L664-667; §1-5 L333 | Floor 2:00, no cap (Matt); 1-5 accepted 4:00-4:12 (L909); no first-timer clock line. |
| `LEDGER-ENGINE-GEMINI.md:267` | N | Skilled frames = 30 × seconds (3600-4500). | n/a: unit choice | — |
| `LEDGER-ENGINE-GEMINI.md:268` | Y | Rhythm groups 6-10 s, rests 1.5-2.2 s. | §Rests and breathers L503, L509; §Pacing L799-800 | Spec uses ours (≤20 s groups Easy, 1.0-1.2 s pads Normal), not Gemini's. |
| `LEDGER-ENGINE-GEMINI.md:269` | Y | Skilled length = sum of puzzle time plus groups and rests per node (a length budget). | PARTIAL §Stage length L666-670: length from node and burst counts; no formula, clock measured after build | — |
| `LEDGER-ENGINE-GEMINI.md:270` | Y | One 12-18 s puzzle, in node 4 or 6. | PARTIAL §1-5 plan L349, L375-377: a "puzzle beat" node n9, push block deferred to a CP4 room; no length or slot rule | — |
| `LEDGER-ENGINE-GEMINI.md:271` | N | Worked arithmetic 16 × (6.2+1.6) + 12 = 136.8 s. | n/a: worked arithmetic | — |
| `LEDGER-ENGINE-GEMINI.md:272` | Y | First-timer clock = hesitation × skilled + branch time + miss penalties. | PARTIAL §CP2 L213-221, L227: first-timer and kid bots run animals and crumble; no first-timer length line | Formula itself unused. |
| `LEDGER-ENGINE-GEMINI.md:273` | Y | First-timer constants: hesitation 1.22, branch +25 s, p_miss 0.25, 8 s penalty. | PARTIAL §CP2 L221, L227: bots used instead of constants | — |
| `LEDGER-ENGINE-GEMINI.md:274` | Y | Sustained density over 1.6 actions/s causes thumb fatigue. | PARTIAL §Pacing L511, L801: Normal judged on longest run, dead time and fun-gate flags vs main; no density ceiling | 0.80 accepted provisionally. |
| `LEDGER-ENGINE-GEMINI.md:275` | N | World BPMs 90-138.46; beat 0.433-0.667 s. | n/a: music tempo values | — |
| `LEDGER-ENGINE-GEMINI.md:276` | Y | Density per node rises with tension: ρ = ρmin + (ρmax−ρmin)·T^1.15. | MISSING | R3: density is one stage-wide band; nothing makes busy and calm stretches differ by plan, the "every 30 s the same" fault. |
| `LEDGER-ENGINE-GEMINI.md:277` | Y | Easy 0.35-0.85, Normal 0.50-1.35 actions/s. | §Rests and breathers L508; §Pacing L801 | Spec keeps ours for Easy (0.35-0.55); Normal provisional at 0.80. |
| `LEDGER-ENGINE-GEMINI.md:278` | Y | Fixed node tension table with per-node density and rest seconds. | PARTIAL §1-5 plan L339-351: ordered jobs (warm-up…master, cool down); no tension, density or rest numbers per node | — |
| `LEDGER-ENGINE-GEMINI.md:279` | Y | Jump arc by per-frame Euler with one gravity and wind. | §Planner amendments P4 L1137-1139 | Spec uses the tracer's own model only, as the ledger advises. |
| `LEDGER-ENGINE-GEMINI.md:280` | Y | Landing frame ⌊2v/g⌋; double at the apex. | §Planner amendments P4 L1137-1139 | Same: one jump model, the tracer's. |
| `LEDGER-ENGINE-GEMINI.md:281` | Y | Double reach ≈ 1.75 × single (measured 1.79). | §CP3 rulings L369; §Difficulty dial L640 | Gaps sized by jumpOK/heldMaxGap, not a ratio. |
| `LEDGER-ENGINE-GEMINI.md:282` | Y | Safe reach = air control × max reach − (early press + double delay) × speed. | PARTIAL §Difficulty dial L640: margins as dial shares of the level check's limit; not derived from thumb timing | — |
| `LEDGER-ENGINE-GEMINI.md:283` | Y | Easy safe reach ≈ 0.62 R_max (ours ~0.50-0.53); gen2 Easy margin 0.65. | PARTIAL §Difficulty dial L640: Easy gap 0.45→0.80 of the level check's limit | Different base (level-check limit, not R_max); top end 0.80 above gen2's 0.65. |
| `LEDGER-ENGINE-GEMINI.md:284` | Y | Normal safe reach ≈ 0.78 R_max (ours ~0.72-0.74); gen2 Normal margin 0.82. | PARTIAL §Difficulty dial L640: Normal gap 0.55→0.92 of the level check's limit | 0.92 top above gen2's 0.82; base differs. |
| `LEDGER-ENGINE-GEMINI.md:285` | Y | Gap share as a linear function of node tension. | PARTIAL §Difficulty dial L640, L655: linear in stage d, not node tension | — |
| `LEDGER-ENGINE-GEMINI.md:286` | Y | Single-jump gap share Easy 0.25-0.55, Normal 0.35-0.75 of R_1. | PARTIAL §Difficulty dial L640: own ranges on the level check's limit | See notes (c). |
| `LEDGER-ENGINE-GEMINI.md:287` | Y | Double-jump gap share Easy 0.40-0.60, Normal 0.50-0.78 of R_2. | PARTIAL §Difficulty dial L640; §CP4 L1055: one gap dial for all jumps; doubles judged once taught | No separate double range. |
| `LEDGER-ENGINE-GEMINI.md:288` | Y | Platform width ≥ hitbox + 2·early·speed + buffer·(1−T). | PARTIAL §Difficulty dial L642: p50 width by d, floor 90 px; not from thumb spread or tension | — |
| `LEDGER-ENGINE-GEMINI.md:289` | Y | Pads 3.5 × sloth (Normal climax, 154 px) to 7.0 × (Easy intro, 308 px). | PARTIAL §Difficulty dial L642; §Pacing L796: Normal 220→110, Easy 260→150, Easy ~300 px | Normal top end 110 px under 154 px. |
| `LEDGER-ENGINE-GEMINI.md:290` | Y | Animal footprints: snake deck ≥5 W, boa ≥3.5 W from entry, eagle 4 s open sky, cat ≥8 W. | PARTIAL §CP2 L107, L219; §C Animals L1563-1567: room around the boa, element per animal; no footprints | — |
| `LEDGER-ENGINE-GEMINI.md:291` | Y | Per-animal hazard weights (snake 1.2, eagle 1.6, cat 1.5…). | MISSING | R1: risk is counted by risky pieces and E[lives] (L643-644), not per animal. |
| `LEDGER-ENGINE-GEMINI.md:292` | Y | Enemies per minute rise with world: E = E_base(D) + α(D)·(w−1). | §Difficulty dial L645 | Taught animals per stage rise with d (which includes world); per stage, not per minute. |
| `LEDGER-ENGINE-GEMINI.md:293` | Y | Easy 3.5→6.65/min (~8→15 a stage); Normal 5.5→11.35 (~12→25). | PARTIAL §Difficulty dial L645: 0-1→4-5 Normal, 0-1→3 Easy taught animals per stage | Far fewer; "animals" may mean kinds. See notes (c). |
| `LEDGER-ENGINE-GEMINI.md:294` | Y | Minimum time between enemies by tension; floors 4.5 s Easy, 2.5 s Normal. | MISSING | R1: only per-view caps (L316); spacing is pacing, little effect on repetition. |
| `LEDGER-ENGINE-GEMINI.md:295` | Y | Pairwise threat H_pair = move weight × animal weight × runway ≤ cap. | MISSING | R2: gap-then-enemy combos are super-additive; spec counts risky pieces singly (L643). |
| `LEDGER-ENGINE-GEMINI.md:296` | Y | ≥1.0 s flat runway before an enemy trigger (Easy; Normal low tension). | PARTIAL §CP2 animals L219: boa only, one screen's width | — |
| `LEDGER-ENGINE-GEMINI.md:297` | Y | Petal goal 75% of total; 70% shared, 15% high, 15% low. | PARTIAL §CP3 L344, L462, L826-829: petal groups per road, marks goal 10/13 (77%) Normal; no 70/15/15 | — |
| `LEDGER-ENGINE-GEMINI.md:298` | Y | Encountered 85% on one pass; margin to the goal ~11.8%. | §CP3 L462, L826-829 | One miss of slack; after (i) every route passes all 13 marks. |
| `LEDGER-ENGINE-GEMINI.md:299` | Y | 100 petals, 70 shared in 3-5 petal arcs along traced jumps. | §Placement rule 4 L305-310 | Petals on routes and jump arcs; no fixed 100. |
| `LEDGER-ENGINE-GEMINI.md:300` | N | Branch petals round(15/K) breaks the 100 total. | n/a: arithmetic slip | — |
| `LEDGER-ENGINE-GEMINI.md:301` | Y | No adjacent identical substring of length 1-4; no symbol 3 times running. | PARTIAL §CP3 L241, L391-397: no idea twice in a row, kind or size changes every 2 pieces, same-piece run ≤9 | Pieces/ideas, not moves. |
| `LEDGER-ENGINE-GEMINI.md:302` | Y | Normalized bigram entropy ≥ 0.68. | PARTIAL §CP3 L240-246: share cap and ≥4 ideas stand in; no entropy | — |
| `LEDGER-ENGINE-GEMINI.md:303` | Y | Similarity: 0.5 Levenshtein + 0.5 4-gram Jaccard ≤ 0.42. | PARTIAL §Variety gate L41; §Shared library L133: neighbours share ≤ half their ideas (set overlap, order ignored) | No sequence similarity. |
| `LEDGER-ENGINE-GEMINI.md:304` | Y | Builder cap sits 3-13% under the checker's rejection line, a safety buffer. | MISSING | R3: pass lines equal the old 1-1's own numbers (L395-400); rolls may scrape past, Matt's "barely squeak past" fault. |
| `LEDGER-ENGINE-GEMINI.md:305` | Y | Tier 1 miss (low tension): drop 3-5 tiles to a safe ledge, lose petals, 5-8 s back, no damage. | PARTIAL §1-5 L342; §CP4 L1073; §CP3 L437: catch boughs, Easy slips free; no recovery-time cap or petal cost | — |
| `LEDGER-ENGINE-GEMINI.md:306` | Y | Tier 2 miss: drop into mud or silk, or brambles: 1 HP or a 10 s slow. | MISSING | R1: one more consequence kind; slow penalties clash with E224. |
| `LEDGER-ENGINE-GEMINI.md:307` | Y | Tier 3 miss: −1 HP, respawn at the current rhythm group. | PARTIAL §Placement L296-303; §CP3 L426-431: flags before hard nodes, ≤4,000 px, replay ≤45 s | Per hard node, not per group. |
| `LEDGER-ENGINE-GEMINI.md:308` | Y | D(w,s) = 0.12 + 0.055(w−1) + 0.032(s−1) − dips at 4, 7 + bump at 10. | PARTIAL §Difficulty dial L628-633: own linear d, no dips or stage-10 bump; replaces bandFor | — |
| `LEDGER-ENGINE-GEMINI.md:309` | Y | A new world drops difficulty by 0.20 at its first stage. | §Difficulty dial L631-633 | Spec drop is 0.091, half a world's climb. See notes (c). |
| `LEDGER-ENGINE-GEMINI.md:310` | Y | Composite flow score F = 100(0.30 curve + 0.25 rhythm + 0.20 variety + 0.15 vertical + 0.10 agency). | MISSING | R2: no score; fun gate flags only (L262, L511). |
| `LEDGER-ENGINE-GEMINI.md:311` | Y | Curve fidelity: measured vs planned tension. | MISSING | R2: spec plans node jobs but never measures whether each node played at its intended intensity. |
| `LEDGER-ENGINE-GEMINI.md:312` | Y | Beat alignment: share of bot take-offs within ±33 ms of a beat. | MISSING | R1: L1120 rhythm patterns are drawn per node but nothing measures they are played. |
| `LEDGER-ENGINE-GEMINI.md:313` | Y | Variety term = entropy share × (1 − max similarity). | MISSING | R1: the variety gate's lines (L30-41) already cover this ground. |
| `LEDGER-ENGINE-GEMINI.md:314` | Y | Vertical flow: fewer stalled frames, more elevation spread. | §Variety gate L40; §CP3 L394, L398 | Climb range, 4 of 5 landings up/down, flat ≤1,351 px. |
| `LEDGER-ENGINE-GEMINI.md:315` | Y | Agency: a split or loop with both roads viable; every hazard costs. | §Variety gate L38-39; §CP3 L434-438 | Both roads walkable end to end (prover); slips cost on Normal. |
| `LEDGER-ENGINE-GEMINI.md:316` | Y | Accept at flow ≥80 (L253) or ≥82 (L580). | MISSING | R1: no score exists to threshold. |
| `LEDGER-ENGINE-GEMINI.md:317` | N | 112.5 BPM is exactly 16 frames a beat. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:318` | Y | W4 gust: tailwind 0.18, headwind −0.14 px/frame², 4-bar cycle, 24-frame telegraph. | PARTIAL §Move ladder L1302; §C hazards L1555: wind named as W4's hazard; no cycle or telegraph numbers | — |
| `LEDGER-ENGINE-GEMINI.md:319` | Y | Creak delay Easy 1.2 s (36 frames), Normal 0.67 s (20). | §Difficulty dial L646; §CP2 L227-228 | Easy 1.2→0.8, Normal 0.9→0.5 s; CP2 Easy 1.0 s. See notes (c). |
| `LEDGER-ENGINE-GEMINI.md:320` | Y | Mud speed ×0.55, silk ×0.45. | MISSING | R1: no mud or silk zones in spec. |
| `LEDGER-ENGINE-GEMINI.md:321` | Y | Pattern lockout of 4 draws. | PARTIAL §CP3 L241, L391, L439: no idea twice in a row (lockout 1); n8 avoids the previous two nodes' ideas | — |
| `LEDGER-ENGINE-GEMINI.md:322` | N | Showcase run claims never actually run; its string breaks its own rules. | n/a: check of Gemini's worked example | — |
| `LEDGER-ENGINE-GEMINI.md:323` | Y | Short landing ≤48 px split between ledges; flat runs over 2.5 s split with a hop. | PARTIAL §Pacing L510: dead time >2.5 s fails; not auto-split | — |
| `LEDGER-ENGINE-GEMINI.md:324` | N | Auto-heal lifts first pass from ~80% to >98%. | n/a: unmeasured claim | — |
| `LEDGER-ENGINE-GEMINI.md:325` | Y | Lookahead for a run-and-jump: 1.2 s sideways vs 0.45 s upright. | MISSING | R1: fairness in upright view, not variety. |
| `LEDGER-ENGINE-GEMINI.md:326` | Y | Safe sightline box 12×12 tiles; camera anchors by direction. | MISSING | R1: spec names both view sizes (L313) but no shared box or anchors. |
| `LEDGER-ENGINE-GEMINI.md:327` | Y | Gesture collisions above 1.2/s; 267 ms cooldown; thumb hides bottom-right 20%; Pokey at 55% height. | MISSING | R1: controls/camera fairness; no spec line. |
| `LEDGER-ENGINE-GEMINI.md:328` | N | 110 BPM = 16.36 frames; 16/17 alternation costs 9.5 px. | n/a: music tempo rounding | — |
| `LEDGER-ENGINE-GEMINI.md:329` | N | Harmonic tempos inside each world's music range. | n/a: music tempo; L1120 | — |
| `LEDGER-ENGINE-GEMINI.md:330` | N | Gemini's world tempos 90-138.46 BPM. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:331` | Y | Bluetooth lag 120-220 ms; window −3/+6 frames. | MISSING | R1: input fairness only. |
| `LEDGER-ENGINE-GEMINI.md:332` | Y | A 50% slow-down with no extra decisions feels stuck; skilled leap over, clumsy trudge. | PARTIAL §D Water L1593: swim "no slow drag"; ropes, silk, mud not covered | — |
| `LEDGER-ENGINE-GEMINI.md:333` | Y | Cause-and-effect on the main path means 2^k layouts to check. | MISSING | R1: spec has no cause-and-effect, so the warning is moot. |
| `LEDGER-ENGINE-GEMINI.md:334` | Y | A 3-5 min stage is 7,000-10,000 px; mount nodes i−1..i+1. | MISSING | R1: spec sizes stages in seconds, not px; mounting is performance. |
| `LEDGER-ENGINE-GEMINI.md:335` | N | Day-1 promise: ~250 lines, 8 hours, <$3, 10/10 first roll. | n/a: build-cost claim | — |
| `LEDGER-ENGINE-GEMINI.md:336` | Y | 85 specs, 200 builds (100 stages × 2 settings) checked in batch. | §E Gates L1612-1620; §F L1626-1629 | Gates 1-6 run as a report over all 102 stages. |
| `LEDGER-ENGINE-GEMINI.md:337` | Y | Targets: yield ≥85/98%, similarity ≤42%, entropy, rest ≤2.2 s, 120-150 s, 0 blind leaps, flow ≥82. | PARTIAL §CP3 L261; §Pacing L510; §Stage length L664; P4 L1139: 16/16 yield, 2.5 s dead time, ≥2:00; no similarity, entropy or flow targets | — |
| `LEDGER-ENGINE-GEMINI.md:411` | Y | Tempo comes from our music, read from the stage's song; keep whole-frames beats inside each world's range. | CONTRADICTED L1120: "the player's rhythm, not the song"; nodes draw rhythm patterns like pieces | Spec and ledger disagree on the beat's source; both cite Matt 11-04. See notes (b). |
| `LEDGER-ENGINE-GEMINI.md:415` | Y | Music changes per session, so no bassline-driven layout; beat-timed hazards still work. | PARTIAL §Design L1120: no song-following (agrees); beat- or rhythm-timed hazards absent | — |
| `LEDGER-ENGINE-GEMINI.md:417` | Y | Tracer places jumps only; extend to vines, ropes, mushrooms; merge its two copies into one. | PARTIAL §Planner amendments P2 L1131-1133, P4 L1137-1139: vines, ropes, pads proven in the real engine; one jump model; tracer not extended | — |
| `LEDGER-ENGINE-GEMINI.md:420` | Y | The deck alone did not cure sameness in gen2; topology and the look are the bigger buys. | PARTIAL §CP3 L336; §Polish pass L686-709; §L1042-1043: decks and look rules adopted; no topology pass | Spec repeats gen2's bet on decks plus look, minus macro shape. |
| `LEDGER-ENGINE-GEMINI.md:422` | Y | Our checker compares by cosine of 3-move counts plus a look grid; builder caps must use the checker's measure. | §CP3 L253-259, L513 | Mixer enforces the variety gate's own lines; the cosine/look-grid checker is not named. |
| `LEDGER-ENGINE-GEMINI.md:424` | Y | Physics is 1/60 s with two gravities; reach numbers come from the tracer's simulation. | §Planner amendments P4 L1137-1139; §CP3 L369 | — |
| `LEDGER-ENGINE-GEMINI.md:426` | Y | Monkeys don't attack; role table must use our animals (snake, boa, eagle, cats, spider, frog, caiman, turtle). | PARTIAL §C Animals L1563-1567: our animals placed by element; no platform-role table | — |
| `LEDGER-ENGINE-GEMINI.md:428` | Y | Petal goal varies; keep Matt's 70/15/15 split and set the goal from the bots. | PARTIAL §CP3 L462, L826-829: goal from a slack rule; no 70/15/15 | — |
| `LEDGER-ENGINE-GEMINI.md:436` | Y | Gemini leaves out the look: add art dressing by node and role, with a look measure in the checker. | §Polish pass L686-745; §S-4 L772-776; §How a stage is made L1042-1043; §Stage profile L1226-1227 | Art kinds in the feel check; no look grid across stages. |
| `LEDGER-ENGINE-GEMINI.md:440` | Y | Gemini is thin on pieces (2-3 per new world); the engine cuts cost per stage, not pieces per world. | §Shared library L122-134; §Log family L556-580; §Ground family L592-621 | More pieces adopted; no per-world minimum written. |
| `LEDGER-ENGINE-GEMINI.md:442` | Y | One fixed tension curve copied into every spec becomes the pattern; neighbours must place parts differently. | MISSING | R5: same as row 209; 1-5 and 1-1 plans share node count, fork slots, rest slot and closing cool-down. |
| `LEDGER-ENGINE-GEMINI.md:445` | Y | Every Gemini number is a guess to calibrate on bots and Matt's play, never a target. | §Difficulty dial L635-636; §Variety gate L30 | "All are estimates, to be tuned on Matt's play"; thresholds from CP1. |
| `LEDGER-ENGINE-GEMINI.md:448` | Y | Closing a loop or split is hand-waved; needs real design before it is promised. | PARTIAL §Variety gate L38-39; §CP3 L378, L461: roads walkable, own height bands, crossings; no closure rule; loops absent | — |
| `LEDGER-ENGINE-GEMINI.md:450` | N | Cost claims (days, dollars, tokens) unmeasured. | n/a: cost/process; spec records real time per stage (L267) | — |
| `LEDGER-ENGINE-GEMINI.md:452` | Y | Reject Gemini's difficulty formula (world overlap); bandFor and STAGE_HEAT already do the job. | PARTIAL §Difficulty dial L628-633: Gemini's rejected, but bandFor/STAGE_HEAT replaced by a linear d with half-band overlap | See notes (b). |
| `LEDGER-ENGINE-GEMINI.md:465` | Y | Diagnosis: move-level variety converges on white noise; every 30 s window has the same mix, direction and pace. | PARTIAL §CP3 L263; §A L1466-1482: notes the gate passes "random soup", adds coherence and the ladder; macro shape and pace still uniform | — |
| `LEDGER-ENGINE-GEMINI.md:466` | Y | Stop generate-and-test loops; compile stages constructively. | §CP3 L259, L513 | "fails with the missing piece named, never a reroll"; rules met by construction. |
| `LEDGER-ENGINE-GEMINI.md:467` | Y | Split declarative intent (data) from kinematic and topological enforcement (code). | §Stage profile L1204-1206; §Whole-game plan L1460 | Profile and element table as data plus gates. |
| `LEDGER-ENGINE-GEMINI.md:468` | Y | Spelunky: 4×4 room grid with a guaranteed critical path. | MISSING | R1: ledger says not taken (side-scroller); correct omission. |
| `LEDGER-ENGINE-GEMINI.md:469` | Y | Spelunky failure: hazards from neighbouring rooms combine into unavoidable hits. | PARTIAL §Placement rule 5 L313-319: ≤2 hazard or animal kinds per view; no combination check | — |
| `LEDGER-ENGINE-GEMINI.md:470` | Y | Dead Cells: concept graph per biome with branching ratio and entrance-exit distance. | PARTIAL §Stage profile L1217 (branching numbers, fork count); §B L1495: no concept graph or hub search stages | — |
| `LEDGER-ENGINE-GEMINI.md:471` | Y | Dead Cells failure: 2D branches overlap, fixed with buffer corridors. | MISSING | R1: lesson for a topology pass the spec lacks. |
| `LEDGER-ENGINE-GEMINI.md:472` | Y | Rayman: beat times map to positions; percussion → attacks, melody → jumps, sustains → ropes. | PARTIAL §Design L1120-1121: node draws a rhythm pattern; no beat-to-move or beat-to-position mapping | — |
| `LEDGER-ENGINE-GEMINI.md:473` | Y | Rayman failure: auto-run locks speed to music; never lock his speed. | §Design L1120 | "the player's rhythm, not the song". |
| `LEDGER-ENGINE-GEMINI.md:474` | N | Celeste: coyote, buffer, corner correction; assist mode in code, not stage data. | n/a: controls and physics, not stage generation | — |
| `LEDGER-ENGINE-GEMINI.md:475` | N | Hand-tuning hundreds of screens costs too much per token. | n/a: cost; spec's "a stage in about an hour" L267 | — |
| `LEDGER-ENGINE-GEMINI.md:476` | Y | Downwell: one vertical fall-line with rest caverns at fixed depths. | MISSING | R1: ledger says not taken. |
| `LEDGER-ENGINE-GEMINI.md:477` | Y | Rogue Legacy: point-buy hazard budget scaled by distance from the entrance. | §Difficulty dial L643-644 | Risk per burst and E[lives] budget by stage d, not by distance. |
| `LEDGER-ENGINE-GEMINI.md:478` | Y | Rogue Legacy failure: static geometry memorized when only enemies vary. | PARTIAL §Variety gate L30-41: pieces vary; nothing checks that geometry, not only enemies, varies between rolls [critic audit: was "used"] | Geometry varies by kind × size, not enemies alone. |
| `LEDGER-ENGINE-GEMINI.md:479` | Y | Kishotenketsu: one mechanic introduced, combined, twisted, mastered. | §Move ladder L118; §Placement L297; §1-5 plan L339-351 | Jobs teach, test, twist, master. |
| `LEDGER-ENGINE-GEMINI.md:480` | Y | Hades: deck without replacement, recent templates banned, relief after intense rooms. | §CP3 L336, L390-392; §Rests L501 | Shuffle-bag decks, no idea twice in a row, rest nodes after tests. |
| `LEDGER-ENGINE-GEMINI.md:481` | Y | Ori: escape sequences became memorization spikes when readability dropped. | §CP2 L213-221; §Difficulty dial L650-653 | Teach before the line, readable tells, first-timer and kid bots. |
| `LEDGER-ENGINE-GEMINI.md:482` | Y | Launchpad: rhythm first, then geometry; one rhythm gives dozens of layouts. | PARTIAL §Design L1120-1121: rhythm pattern drawn per node like pieces; no rule tying many geometries to one rhythm | — |
| `LEDGER-ENGINE-GEMINI.md:483` | Y | Launchpad weakness: generate-and-cull at the macro level. | §CP3 L259 | No reroll. |
| `LEDGER-ENGINE-GEMINI.md:484` | Y | Tanagra: constraint solver; relax or backtrack at the pattern level instead of failing. | MISSING | R2: spec fails a node outright (L259); backtracking would let more ideas fit instead of shrinking decks. |
| `LEDGER-ENGINE-GEMINI.md:485` | Y | Polymorph: difficulty is super-additive (gap then enemy on the landing); pairwise adjacency. | MISSING | R2: no pairwise rule; L317 clears only jump-arc space above landings. |
| `LEDGER-ENGINE-GEMINI.md:486` | Y | Dahlskog: meso-patterns are the minimum unit; micro slices break. | §CP2 L68-86; §CP3 L249, L390 | Node ideas and bursts are the unit. |
| `LEDGER-ENGINE-GEMINI.md:487` | Y | ASP (clingo): global rules, every solution valid. | MISSING | R1: ledger says not taken (cost). |
| `LEDGER-ENGINE-GEMINI.md:488` | Y | WFC fails global reachability without a movement graph. | §Planner amendments P4 L1137-1139 | Reachability asked of the tracer. |
| `LEDGER-ENGINE-GEMINI.md:489` | N | Graph segmentation agrees 86-96% with human rooms. | n/a: map segmentation, not relevant | — |
| `LEDGER-ENGINE-GEMINI.md:490` | Y | Chunk-level modification beats whole-level (83.5% vs 74.1% first-pass playable). | PARTIAL §CP3 L259: failures named per node; no local repair | — |
| `LEDGER-ENGINE-GEMINI.md:491` | Y | Table: Spelunky 10×8 templates with chunk markers; 4×4 walk. | MISSING | R1: restates E4, not taken. |
| `LEDGER-ENGINE-GEMINI.md:492` | Y | Table: Dead Cells concept graphs, rooms, bounding-box solver, enemy budget. | PARTIAL §Stage profile L1217; §Difficulty dial L643-645: branching and risk budget; no concept graph or box solver | Restates E6. |
| `LEDGER-ENGINE-GEMINI.md:493` | Y | Table: Rayman stem timelines, x = v·t. | PARTIAL §Design L1120-1121: rhythm patterns, no stems | Restates E8. |
| `LEDGER-ENGINE-GEMINI.md:494` | N | Table: Celeste screens, camera, coyote, assist. | n/a: controls and camera | Restates E10. |
| `LEDGER-ENGINE-GEMINI.md:495` | Y | Table: Downwell/Rogue Legacy slices tagged by exits and spawn slots. | §CP2 L72; §CP3 L251 | Node ideas carry entry and exit. |
| `LEDGER-ENGINE-GEMINI.md:496` | Y | Table: Launchpad rhythm-group parameters plus grammar probabilities. | PARTIAL §Design L1120-1121 | Restates E18. |
| `LEDGER-ENGINE-GEMINI.md:497` | Y | Table: Tanagra fails on solver complexity for 2D branching. | MISSING | R1: restates E20. |
| `LEDGER-ENGINE-GEMINI.md:498` | Y | Table: evolutionary search needs thousands of runs; raw n-grams break topology. | §CP3 L259 | Constructive, no search. |
| `LEDGER-ENGINE-GEMINI.md:499` | Y | Table: WFC exemplar adjacency fails reachability. | §Planner amendments P4 L1137-1139 | Restates E24. |
| `LEDGER-ENGINE-GEMINI.md:500` | Y | Enforce constraints before or during placement, not by rejection. | §CP3 L253-259, L513 | — |
| `LEDGER-ENGINE-GEMINI.md:501` | Y | Pass 1 picks a map shape: loop back, high/low split, chimney, hub-and-spoke. | PARTIAL §Stage profile L1214 (arc); §CP3 L405-412: splits and up/down arc only; loop back, chimney, hub absent | Biggest macro-variety gap; see notes. |
| `LEDGER-ENGINE-GEMINI.md:502` | Y | Fixed 6-8 node slots Ki/Sho/Ten/Ketsu; ours places parts differently per stage. | MISSING | R5: no rule that neighbours place the curve's parts differently; 1-5 and 1-1 share slot layout. |
| `LEDGER-ENGINE-GEMINI.md:503` | Y | Each node a non-overlapping 2D box with entry and exit vectors. | PARTIAL §CP3 L251; §Placement rule 1 L278-283: entry/exit by height band; no 2D box or direction vector | — |
| `LEDGER-ENGINE-GEMINI.md:504` | Y | Each node draws 2-4 patterns from a stateful deck; a pattern locked out for 4 draws. | PARTIAL §CP3 L390-392, L439; §Difficulty dial L648: 2-3 bursts a node; lockout only "not twice in a row" (2 for n8) | — |
| `LEDGER-ENGINE-GEMINI.md:505` | Y | Claim that the deck prevents 3-4 move repeats; keep the validator's run check. | §CP3 L395-397 | Run caps kept (≤9 same piece, ≤7 kind × size). |
| `LEDGER-ENGINE-GEMINI.md:506` | Y | Seed pattern names: Vine_Transfer_Over_Mud, Rotten_Branch_Cascade, Snake_Stomp_Bridge, Eagle_Shadow_Sprint. | PARTIAL §CP2 L76-86: Vine relay, Rotten-branch drop exist; no snake or eagle pattern | — |
| `LEDGER-ENGINE-GEMINI.md:507` | Y | Pass 3: tracer places platforms, vines, ropes, mushrooms on the beat; add those moves to it. | PARTIAL §P2 L1131-1133: vines and ropes proven in the real engine, not traced | — |
| `LEDGER-ENGINE-GEMINI.md:508` | Y | Data: WorldProfile, ~20-line StageSpec, ~30 MesoPatterns. | §B L1495-1506; §Stage profile L1208-1233; §CP2 L62-107 | No ~30-per-world count. |
| `LEDGER-ENGINE-GEMINI.md:509` | Y | Code: graph layout engine, deck shuffler, tracer, pickup and enemy role binder. | PARTIAL §CP3 L336; P4 L1137; §Placement L270-320: deck, tracer, placement rules; no layout engine or role binder | — |
| `LEDGER-ENGINE-GEMINI.md:510` | Y | A new world = one profile, ~40-line mutator, 2-3 patterns (contradicts our 12+). | §Shared library L122-134; §CP2 L208 | Spec goes for more pieces; no per-world minimum. |
| `LEDGER-ENGINE-GEMINI.md:511` | Y | Variety on three scales: macro topology, meso deck (cross-stage <42%), micro tempo and physics; plus look. | PARTIAL §Variety gate L30-41; §L1042-1043: meso ideas, micro kind × size, look via art kinds; macro topology absent | — |
| `LEDGER-ENGINE-GEMINI.md:512` | Y | Node tension drives gap-to-reach ratio and enemy adjacency budget. | PARTIAL §Difficulty dial L640-655: stage d drives them; node tension not | — |
| `LEDGER-ENGINE-GEMINI.md:513` | Y | Weak point: the "elastic bridge" where a loop or split merges. | PARTIAL §CP3 L344, L461: roads rejoin, crossings; no merge rule | — |
| `LEDGER-ENGINE-GEMINI.md:514` | Y | Arch 2: CSP over 80-120 beats with AC-3 and backtracking. | MISSING | R1: ledger says not taken. |
| `LEDGER-ENGINE-GEMINI.md:515` | Y | Reachability: (dx, dy) within R(move, tempo, difficulty, wind). | §P4 L1137-1139; §CP3 L369 | — |
| `LEDGER-ENGINE-GEMINI.md:516` | Y | Split closure: both roads' dx and dy sums equal, merging at one pixel. | PARTIAL §CP3 L378, L344, L350: roads keep own bands and rejoin; no closure rule | — |
| `LEDGER-ENGINE-GEMINI.md:517` | Y | Moves i..i+2 never equal i+3..i+5. | PARTIAL §CP3 L391-393: never the same burst twice, kind or size changes every 2 pieces | Not move-level. |
| `LEDGER-ENGINE-GEMINI.md:518` | Y | Dead walk ≤ 2.5 s. | §Rests and breathers L510 | — |
| `LEDGER-ENGINE-GEMINI.md:519` | N | Arch 2 cost: ~30 lines a stage, opaque UNSAT, 8-12 days. | n/a: cost | — |
| `LEDGER-ENGINE-GEMINI.md:520` | Y | Arch 3: inertial flow-ribbon spline as the topology (chimney bends up, loop folds, split forks). | MISSING | R2: cheap way to vary macro shape across stages; nothing in spec. |
| `LEDGER-ENGINE-GEMINI.md:521` | Y | Markov tiling learned from the strongest W1-4 patterns (not taken: copies sameness). | MISSING | R1: correctly absent; spec copies the old 1-1's numbers as bars (L30-41), not its transitions. |
| `LEDGER-ENGINE-GEMINI.md:522` | Y | Seam welding: adjust only the bridge platform between chunks. | §Placement rule 1 L278-283 | Join is "a short piece of the same kit, sized to the next idea's first move". |
| `LEDGER-ENGINE-GEMINI.md:523` | N | Arch 3 cost and flaws (15 lines, 3-4 days). | n/a: cost | — |
| `LEDGER-ENGINE-GEMINI.md:524` | Y | Orientation paradox: a leap fair sideways is blind upright, and the reverse. | MISSING | R1: spec checks clutter and stills both ways (L313, L373), no blind-leap line; tracer may cover it via P4. |
| `LEDGER-ENGINE-GEMINI.md:525` | Y | 4-track lead sheet: kick → jump or bounce, snare → double, hi-hat → run, rest → safe platform. | PARTIAL §Design L1120-1121: rhythm patterns per node; no mark-to-move table | — |
| `LEDGER-ENGINE-GEMINI.md:526` | Y | Bassline sets direction: rising → climb, falling → drop, octave split → high/low split. | MISSING | R1: ledger says not taken; L1120 rules the song out. |
| `LEDGER-ENGINE-GEMINI.md:527` | Y | Hazards in call-and-response with his jumps (fruit thrown beat 1 lands beat 3; eagle locks then strikes). | MISSING | R4: same as row 127; "when" variety in every world. |
| `LEDGER-ENGINE-GEMINI.md:528` | N | Song dynamics pp → ff encode the tension curve. | n/a: music | — |
| `LEDGER-ENGINE-GEMINI.md:529` | Y | Inscribed safe sightline box; fold the path when it would leave it. | MISSING | R2: same as row 171. |
| `LEDGER-ENGINE-GEMINI.md:530` | Y | Recommendation: Arch 1 + sightline box + counterpoint; puzzle rooms need a "fermata". | PARTIAL §CP3 L231-259, L375-377: nodes, decks, tracer, puzzle as a room; sightline box and counterpoint absent | — |
| `LEDGER-ENGINE-GEMINI.md:531` | N | Comparison table: inspiration row. | n/a: table header row | — |
| `LEDGER-ENGINE-GEMINI.md:532` | N | Comparison table: data row. | n/a: comparison row restating E44 | — |
| `LEDGER-ENGINE-GEMINI.md:533` | N | Comparison table: code row. | n/a: comparison row restating E45 | — |
| `LEDGER-ENGINE-GEMINI.md:534` | N | Comparison table: cost row. | n/a: cost | — |
| `LEDGER-ENGINE-GEMINI.md:535` | N | Comparison table: variety row. | n/a: comparison row restating E47 | — |
| `LEDGER-ENGINE-GEMINI.md:536` | N | Comparison table: difficulty row. | n/a: comparison row restating E48 | — |
| `LEDGER-ENGINE-GEMINI.md:537` | N | Comparison table: weak points row. | n/a: comparison row restating E49 | — |
| `LEDGER-ENGINE-GEMINI.md:538` | N | Comparison table: build cost row. | n/a: cost | — |
| `LEDGER-ENGINE-GEMINI.md:539` | Y | The coefficients are "original architectural derivations". | §Difficulty dial L635-636 | Spec marks its own numbers as estimates to tune. |
| `LEDGER-ENGINE-GEMINI.md:540` | Y | 6-8 nodes per stage. | CONTRADICTED L339-351, L1063-1075: 11 nodes | Same as F1. |
| `LEDGER-ENGINE-GEMINI.md:541` | Y | Skilled 120-150 s; first-timer 180-300 s. | §Stage length L664-667 | No cap; no first-timer line. |
| `LEDGER-ENGINE-GEMINI.md:542` | N | Skilled frames 3600-4500. | n/a: unit choice | — |
| `LEDGER-ENGINE-GEMINI.md:543` | Y | Groups 6-10 s, rests 1.5-2.2 s (contradicts ours). | §Rests and breathers L503, L509; §Pacing L799 | Spec keeps ours. |
| `LEDGER-ENGINE-GEMINI.md:544` | Y | Length budget: skilled time = sum of puzzle and groups. | PARTIAL §Stage length L666-670: units, no formula | — |
| `LEDGER-ENGINE-GEMINI.md:545` | Y | Puzzle 12-18 s once, node 4 or 6. | PARTIAL §1-5 plan L349, L375-377 | No length rule. |
| `LEDGER-ENGINE-GEMINI.md:546` | N | Worked 136.8 s arithmetic. | n/a: arithmetic | — |
| `LEDGER-ENGINE-GEMINI.md:547` | Y | First-timer predictor; the bot rules. | PARTIAL §CP2 L221, L227: first-timer bots used; no first-timer clock line | — |
| `LEDGER-ENGINE-GEMINI.md:548` | Y | p_miss 0.25, 8 s penalty → 223.9 s first-timer. | PARTIAL §CP2 L221, L227: bots instead | — |
| `LEDGER-ENGINE-GEMINI.md:549` | Y | Above 1.6 actions/s thumbs tire and misread. | PARTIAL §Pacing L801: Normal density ceiling dropped as uncalibrated | — |
| `LEDGER-ENGINE-GEMINI.md:550` | N | BPM 90-138.46. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:551` | Y | Density = ρmin + (ρmax−ρmin)·T^1.15, our bounds. | MISSING | R3: same as F12; density never planned per node. |
| `LEDGER-ENGINE-GEMINI.md:552` | Y | Easy 0.35-0.85, Normal 0.50-1.35 (contradicts ours). | §Rests and breathers L508 | Easy keeps ours. |
| `LEDGER-ENGINE-GEMINI.md:553` | Y | Node 1: safe intro plus a Dot tip, low tension. | §1-5 plan L341; §CP4 1-1 L1065 | Warm-up / teach run with Dot's line. |
| `LEDGER-ENGINE-GEMINI.md:554` | Y | Node 2: repeat with a petal arc. | §1-5 plan L342; §CP4 1-1 L1066 | Teach (expose, then validate). |
| `LEDGER-ENGINE-GEMINI.md:555` | Y | Node 3: primary mechanic plus an animal trick or branch type. | PARTIAL §1-5 L343; §1-1 L1067: rise or practise; no animal or new branch type | — |
| `LEDGER-ENGINE-GEMINI.md:556` | Y | Node 4: high/low split or puzzle room as mid-stage relief. | §1-5 plan L344-345 | Fork at n4, rest at n5. |
| `LEDGER-ENGINE-GEMINI.md:557` | Y | Node 5: world mutator or second hazard in counterpoint. | PARTIAL §B L1495-1506; §C L1550-1561: world hazards named; no node slot or timing | — |
| `LEDGER-ENGINE-GEMINI.md:558` | Y | Node 6: first climax, a multi-move chain (vine → bounce → stomp). | PARTIAL §1-5 L346; §Move ladder L1321: test node; combined beats once a world | — |
| `LEDGER-ENGINE-GEMINI.md:559` | Y | Node 7: mastery combining all. | §1-5 plan L350 | Master fork. |
| `LEDGER-ENGINE-GEMINI.md:560` | Y | Node 8: 8.5 s cooldown sprint to the exit; ours wants a few seconds. | CONTRADICTED L351, L1075: a full cool-down node (bursts, "one long high branch") ends every stage | Sides with Gemini against W1P. |
| `LEDGER-ENGINE-GEMINI.md:561` | Y | Per-frame Euler is wrong for our physics. | §P4 L1137-1139 | — |
| `LEDGER-ENGINE-GEMINI.md:562` | Y | Landing frame and double at apex; keep ours. | §P4 L1137-1139 | — |
| `LEDGER-ENGINE-GEMINI.md:563` | Y | Clumsy thumb incl. a mistimed second flick; add an off-apex double to the tracer's tries. | MISSING | R1: fairness; spec has an Easy flick floor (L183-186) but no second-flick try. |
| `LEDGER-ENGINE-GEMINI.md:564` | Y | Safe-reach formula as the explanation of margins. | PARTIAL §Difficulty dial L640 | — |
| `LEDGER-ENGINE-GEMINI.md:565` | Y | Easy: 5 frames early (167 ms) instead of ±100 ms. | MISSING | R1: tracer tries not in spec. |
| `LEDGER-ENGINE-GEMINI.md:566` | Y | Gap share linear in tension, inside the level check's cap. | PARTIAL §Difficulty dial L640: linear in d, "the gate stays the ceiling" | — |
| `LEDGER-ENGINE-GEMINI.md:567` | Y | Starting gap ranges for single and double, to calibrate. | PARTIAL §Difficulty dial L640 | One dial, own ranges. |
| `LEDGER-ENGINE-GEMINI.md:568` | Y | Tension-scaled platform width floor. | PARTIAL §Difficulty dial L642 | By d. |
| `LEDGER-ENGINE-GEMINI.md:569` | Y | Pads 154-308 px against our 90 px floor. | PARTIAL §Difficulty dial L642; §Pacing L796 | 110-260 px; floor 90 kept. |
| `LEDGER-ENGINE-GEMINI.md:570` | Y | Every animal bound to a platform role in data. | PARTIAL §CP2 L107; §Move ladder L1307: by element and room only | — |
| `LEDGER-ENGINE-GEMINI.md:571` | Y | Snake: flat combat deck ≥5 W, 1.5 W runway. | PARTIAL §C Animals L1564: "snakes in trees" | No deck size. |
| `LEDGER-ENGINE-GEMINI.md:572` | Y | Coiled boa as gatekeeper ≥3.5 W from entry, blocking a bridge, rope or seed. | PARTIAL §CP2 L107, L219: room around it, one-screen run-up | No gatekeeper role. |
| `LEDGER-ENGINE-GEMINI.md:573` | Y | Eagle needs 4 s of open sky; never over breaking branches. | PARTIAL §Move ladder L1307; §C L1564: open sky for harpies; no crumble ban | — |
| `LEDGER-ENGINE-GEMINI.md:574` | Y | Stalking cat: ≥8 W runway with a vine or mushroom escape. | PARTIAL §C Animals L1565: cats on the ground | — |
| `LEDGER-ENGINE-GEMINI.md:575` | Y | Spider drops on silk above ropes or chimneys. | PARTIAL §C Animals L1566: spiders stay W5's | — |
| `LEDGER-ENGINE-GEMINI.md:576` | Y | Monkey throws fruit from a perch (wrong: capuchins never hurt). | MISSING | R1: correctly absent. |
| `LEDGER-ENGINE-GEMINI.md:577` | Y | Enemy rate rises with world. | §Difficulty dial L645 | — |
| `LEDGER-ENGINE-GEMINI.md:578` | Y | Easy 3.5→6.65/min, Normal 5.5→11.35/min. | PARTIAL §Difficulty dial L645 | See notes (c). |
| `LEDGER-ENGINE-GEMINI.md:579` | Y | Time spacing between enemies, floors 4.5 s Easy, 2.5 s Normal. | MISSING | R1: per-view caps only (L316). |
| `LEDGER-ENGINE-GEMINI.md:580` | Y | Pairwise threat cap, numbers to define ourselves. | MISSING | R2: same as F31. |
| `LEDGER-ENGINE-GEMINI.md:581` | Y | 1.0 s (~285 px) flat runway before an enemy trigger. | PARTIAL §CP2 L219: boa only | — |
| `LEDGER-ENGINE-GEMINI.md:582` | Y | Petal goal 75%; 3 golden seeds a stage; 1-2 hidden finds; set goals from bots. | PARTIAL §CP3 L360, L462; §1-5 L371-374: marks goal by slack rule; seed a glint only; no find count | — |
| `LEDGER-ENGINE-GEMINI.md:583` | Y | Petals 70% shared, 15% high road, 15% low road. | PARTIAL §1-5 L344, L350; §CP3 L827-828: a group per road, hardest on the high road; no shares | — |
| `LEDGER-ENGINE-GEMINI.md:584` | Y | Single-pass yield 0.85 of total. | PARTIAL §CP3 L826-829: every route passes all 13 marks (100%) | — |
| `LEDGER-ENGINE-GEMINI.md:585` | Y | Forgiveness margin (0.85−0.75)/0.85. | §CP3 L462, L828 | Goal 10 of 13 met by any route of 13. |
| `LEDGER-ENGINE-GEMINI.md:586` | Y | 70 shared petals in 3-5 petal arcs along traced jumps, teaching where to jump. | §Placement rule 4 L305-310 | "show the way and the safe landing". |
| `LEDGER-ENGINE-GEMINI.md:587` | N | Branch petal rounding breaks the 100 total. | n/a: arithmetic slip | — |
| `LEDGER-ENGINE-GEMINI.md:588` | Y | Seed 1 on the split's risky road, seed 2 in the puzzle room, seed 3 on a late skill branch. | PARTIAL §Placement rule 4 L304-311; §1-5 L371-374 | No seed rule. |
| `LEDGER-ENGINE-GEMINI.md:589` | Y | No adjacent identical substring length 1-4; no symbol 3 running. | PARTIAL §CP3 L241, L391-397 | Pieces/ideas, not moves. |
| `LEDGER-ENGINE-GEMINI.md:590` | Y | Normalized bigram entropy ≥ 0.68. | PARTIAL §CP3 L240-246 | No entropy. |
| `LEDGER-ENGINE-GEMINI.md:591` | Y | Don't take Levenshtein/Jaccard; cap our own metric. | §Variety gate L41; §CP3 L253-259 | Spec caps its own gate measures. |
| `LEDGER-ENGINE-GEMINI.md:592` | Y | Builder cap with a buffer under the checker's 45-55% zone. | MISSING | R3: same as F40; no margin over the old 1-1's numbers. |
| `LEDGER-ENGINE-GEMINI.md:593` | Y | Budget table: petals 70/15/15 = 100. | PARTIAL §1-5 L344, L350 | No shares. |
| `LEDGER-ENGINE-GEMINI.md:594` | Y | Budget table: goal 75, margin 10, unvisited 15. | PARTIAL §CP3 L462, L826-829 | Goal 77% / 62%. |
| `LEDGER-ENGINE-GEMINI.md:595` | Y | Budget table: similarity ≤42%, buffer 3-13%, reject >55%. | MISSING | R3: no buffer; neighbours ≤ half (L41) is the only cap. |
| `LEDGER-ENGINE-GEMINI.md:596` | Y | A miss always costs something, without bottomless-pit rage. | §CP3 L434-438; §P3 L1134-1136; §Placement L284-291 | Slips cost a heart on Normal, never a life. |
| `LEDGER-ENGINE-GEMINI.md:597` | Y | Tier 1: drop 3-5 tiles to moss or water, lose petals, 5-8 s back (ours bites at 4 s). | PARTIAL §1-5 L342; §CP3 L437; §1-1 L1073: catch boughs; no recovery-time line | — |
| `LEDGER-ENGINE-GEMINI.md:598` | Y | Tier 2: drop into mud or silk or brambles (1 HP or 10 s slow). | MISSING | R1: one more consequence kind. |
| `LEDGER-ENGINE-GEMINI.md:599` | Y | Tier 3: −1 HP, respawn at the current group on climaxes. | PARTIAL §Placement L296-303; §CP3 L426-431 | Flags per hard node. |
| `LEDGER-ENGINE-GEMINI.md:600` | Y | A linear difficulty ramp fatigues; stages need breathers (STAGE_HEAT sawtooth). | CONTRADICTED L628-635: d rises linearly with s inside every world; STAGE_HEAT's stage dips dropped | Only in-stage rests remain. |
| `LEDGER-ENGINE-GEMINI.md:601` | Y | Gemini's D(w,s) contradicts SR §1b. | PARTIAL §Difficulty dial L628-633: own formula instead | Half-band overlap; see notes (b). |
| `LEDGER-ENGINE-GEMINI.md:602` | Y | World stage 9 → next world stage 1 drop of 0.20; its own claim is wrong. | §Difficulty dial L631-633 | Spec drop 0.091. |
| `LEDGER-ENGINE-GEMINI.md:603` | Y | Relief dips at stages 4 and 7 in every world (contradicts ours). | §Difficulty dial L628-633 | No fixed dips. |
| `LEDGER-ENGINE-GEMINI.md:604` | Y | Flow score, after calibrating on Matt's ratings. | MISSING | R2: same as row 183. |
| `LEDGER-ENGINE-GEMINI.md:605` | Y | Curve fidelity: 1 − mean gap between measured and planned tension. | MISSING | R2: same as F47. |
| `LEDGER-ENGINE-GEMINI.md:606` | Y | "On the beat" share of the bot's take-offs. | MISSING | R1: same as F48. |
| `LEDGER-ENGINE-GEMINI.md:607` | Y | Variety term min(1, H2/0.75)·(1 − max Sim). | MISSING | R1: gate lines cover it. |
| `LEDGER-ENGINE-GEMINI.md:608` | Y | Vertical term: fewer stalled frames, more elevation spread. | §Variety gate L40; §CP3 L394, L398 | — |
| `LEDGER-ENGINE-GEMINI.md:609` | Y | Agency: split or loop with both roads viable; adopt the split check. | §Variety gate L38-39 | Prover checks both roads. |
| `LEDGER-ENGINE-GEMINI.md:610` | Y | Accept at ≥80 with zero hard violations. | MISSING | R1: no score. |
| `LEDGER-ENGINE-GEMINI.md:611` | Y | Profile once, spec overrides ~20 lines, patterns beat-relative with no px. | PARTIAL §Stage profile L1232-1233: world default with stated overrides; patterns sized in px (L333) | — |
| `LEDGER-ENGINE-GEMINI.md:612` | N | Frame-harmonic tempo 112.5 BPM = 16 frames. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:613` | Y | WorldProfile example: id, name, tempo, frames per beat, meter. | PARTIAL §B L1495-1506: element, kit, own move, hazards, specials; no tempo/deck/mutator fields | — |
| `LEDGER-ENGINE-GEMINI.md:614` | Y | Mutator slot: periodic gust with cycle and telegraph. | PARTIAL §Move ladder L1302; §C L1550-1561: world hazards named, no mutator data | — |
| `LEDGER-ENGINE-GEMINI.md:615` | Y | Kinematic modifiers: creak delay 36/20 frames; mud ×0.55; silk ×0.45. | §Difficulty dial L646; §CP2 L227-228 | Creak yes; mud/silk absent. |
| `LEDGER-ENGINE-GEMINI.md:616` | Y | allowedAnimals roster per world. | §Stage profile L1221; §C Animals L1563-1567 | Taught animals by element. |
| `LEDGER-ENGINE-GEMINI.md:617` | Y | A deck of 8 patterns for W4 (under our 12+). | §CP2 L76-107; §CP2 L208 | World 1 has 14 ideas. |
| `LEDGER-ENGINE-GEMINI.md:618` | Y | lockoutCooldownDraws 4. | PARTIAL §CP3 L241, L391, L439 | Lockout 1 (2 for n8). |
| `LEDGER-ENGINE-GEMINI.md:619` | Y | StageSpec: id, world, seed, mapShape. | PARTIAL §Stage profile L1212-1214: id, name, arc; no mapShape or seed field | — |
| `LEDGER-ENGINE-GEMINI.md:620` | Y | Primary, secondary and support mechanics: the stage's pair. | PARTIAL §Stage profile L1220: taught, allowed, kept out; no named pair | — |
| `LEDGER-ENGINE-GEMINI.md:621` | Y | rhythmMotifBeats as the stage's beat feel. | PARTIAL §Design L1120; §Stage profile L1218 (pace) | No motif field. |
| `LEDGER-ENGINE-GEMINI.md:622` | Y | puzzleBlueprintId, puzzleNodeIndex, splitNodeIndex. | PARTIAL §Stage profile L1217 (fork count); §1-5 L349 | No puzzle field. |
| `LEDGER-ENGINE-GEMINI.md:623` | Y | causeEffectOut: a flag in this stage changes the next. | MISSING | R2: same as row 165. |
| `LEDGER-ENGINE-GEMINI.md:624` | Y | causeEffectIn: a required flag opens a bonus shortcut node. | MISSING | R2: same as row 165. |
| `LEDGER-ENGINE-GEMINI.md:625` | Y | Example node 1: KI tension 0.20, 2 groups, EAST, tier-1 miss. | PARTIAL §1-5 L341: job and entry/exit; no tension, group count, vector or miss tier | — |
| `LEDGER-ENGINE-GEMINI.md:626` | Y | Example node 2: KI 0.35, EAST_UP, tier 1. | PARTIAL §1-5 L342: job only | — |
| `LEDGER-ENGINE-GEMINI.md:627` | Y | Example node 3: SHO 0.55, SPLIT_E, tier-2 branch drop. | PARTIAL §1-5 L344: fork at n4 | — |
| `LEDGER-ENGINE-GEMINI.md:628` | Y | Example node 4: SHO 0.45, PUZZLE_BOX. | PARTIAL §1-5 L349: puzzle beat at n9 | — |
| `LEDGER-ENGINE-GEMINI.md:629` | Y | Example node 5: TEN 0.75, UP_CHIMNEY. | PARTIAL §CP2 L84; §1-5 L343: "The climb" straight up; no chimney node | — |
| `LEDGER-ENGINE-GEMINI.md:630` | Y | Example node 6: TEN 0.85, EAST_DOWN. | PARTIAL §1-5 L347: rotten-branch drop high → low | — |
| `LEDGER-ENGINE-GEMINI.md:631` | Y | Example node 7: KETSU 1.00, EAST_FAST, tier-3 group reset. | PARTIAL §1-5 L350: master with a flag before it | — |
| `LEDGER-ENGINE-GEMINI.md:632` | Y | Example node 8: KETSU 0.25, EAST_EXIT. | PARTIAL §1-5 L351: cool down to shrine | — |
| `LEDGER-ENGINE-GEMINI.md:633` | Y | Pattern header: required mechanics, move signature, beats, aspect-safe max slope 28°. | PARTIAL §CP2 L65-67: entry/exit, moves asked, proven range; no slope limit or duration | — |
| `LEDGER-ENGINE-GEMINI.md:634` | Y | Pattern step: beat, move, platform, role, enemy slot, petal arc. | PARTIAL §CP2 L72, L107: pieces in order, animal ideas; no per-step slots | — |
| `LEDGER-ENGINE-GEMINI.md:635` | Y | Vine step with a 2-beat swing; clashes with our self-swinging lianas. | §Difficulty dial L647 | Vine windows from each piece's proven window. |
| `LEDGER-ENGINE-GEMINI.md:636` | Y | Pattern miss-floor field: drop onto a rotten catch branch, climb back. | PARTIAL §1-5 L342; §1-1 L1073; §P3 L1134: catch boughs; no field | — |
| `LEDGER-ENGINE-GEMINI.md:637` | Y | Internal clash: a 2-beat rest on a 20-frame creaking branch is a fall. | §Difficulty dial L643; §1-5 L345; §Rests L503 | Rests are flat safe ground with 0 risky pieces. |
| `LEDGER-ENGINE-GEMINI.md:638` | Y | Hashed seed sub-streams per node, group and pass. | PARTIAL §CP3 L261; §L1345, L1464: 16 rolls and regression fingerprints; no sub-stream rule | — |
| `LEDGER-ENGINE-GEMINI.md:639` | Y | Worked topology with splits, chimney switchbacks, view sizes not ours. | PARTIAL §Placement rule 5 L313: our view sizes; no chimney | — |
| `LEDGER-ENGINE-GEMINI.md:640` | Y | Example N1 string breaks its own length-2 repeat ban. | PARTIAL §CP3 L393 | Spec's kind/size change every 2 pieces is the nearest guard. |
| `LEDGER-ENGINE-GEMINI.md:641` | N | Example N2 pattern draw with a shortcut. | n/a: worked example row | — |
| `LEDGER-ENGINE-GEMINI.md:642` | Y | Example N3A reuses a pattern inside its own 4-draw lockout. | PARTIAL §CP3 L241, L439 | Spec's lockout is shorter still. |
| `LEDGER-ENGINE-GEMINI.md:643` | Y | Example N3B reuses a pattern 3 draws later, inside the lockout. | PARTIAL §CP3 L241, L439 | Same. |
| `LEDGER-ENGINE-GEMINI.md:644` | N | Example N4 puzzle node row. | n/a: worked example row | — |
| `LEDGER-ENGINE-GEMINI.md:645` | N | Example N5 chimney node row. | n/a: worked example row | — |
| `LEDGER-ENGINE-GEMINI.md:646` | Y | Example N6 draws the same pattern a third time. | PARTIAL §CP3 L243 | "every repeat of an idea is a new kind × size". |
| `LEDGER-ENGINE-GEMINI.md:647` | Y | Example N7: 4 enemies in 16.8 s breaks its own ≥6 s spacing. | MISSING | R1: spec has no time spacing between animals. |
| `LEDGER-ENGINE-GEMINI.md:648` | Y | Example N8: 8.5 s victory outro, longer than W1P wants. | CONTRADICTED L351, L1075: spec's cool-down node is longer still | Same as E96. |
| `LEDGER-ENGINE-GEMINI.md:649` | N | Compiled entities for one group; take-off 16 px from an edge. | n/a: worked example data | — |
| `LEDGER-ENGINE-GEMINI.md:650` | N | Verification trace numbers never run. | n/a: worked example claim | — |
| `LEDGER-ENGINE-GEMINI.md:651` | Y | Never have the AI emit raw geometry; cost ∝ repair rounds. | §How a stage is made L1026-1034; §Stage profile L1204 | Designer writes profiles, mixer builds geometry. |
| `LEDGER-ENGINE-GEMINI.md:652` | N | Every module under 150 lines. | n/a: code organisation | — |
| `LEDGER-ENGINE-GEMINI.md:653` | Y | types.ts: WorldProfile, StageSpec, MesoPattern, BeatTrace, DiagnosticReport. | PARTIAL §Stage profile L1208-1259: profile and element table; no diagnostic format | — |
| `LEDGER-ENGINE-GEMINI.md:654` | Y | forkSeed per pass so enemy edits never move platforms. | MISSING | R1: stability of rolls, not variety. |
| `LEDGER-ENGINE-GEMINI.md:655` | Y | topology.ts: 4 shapes × 8 nodes → non-overlapping boxes. | PARTIAL §Stage profile L1214; §CP3 L405-412: arc and splits only | — |
| `LEDGER-ENGINE-GEMINI.md:656` | Y | deck.ts: lockout, bigram entropy, cross-stage n-gram repulsion. | PARTIAL §Variety gate L41; §CP3 L241, L391: neighbours ≤ half; no repulsion beyond neighbours | — |
| `LEDGER-ENGINE-GEMINI.md:657` | N | beatTracer.ts in ~140 lines. | n/a: code size | — |
| `LEDGER-ENGINE-GEMINI.md:658` | Y | decorator.ts: roles, 70/15/15 arcs, 3 seeds, 3-tier miss floors. | PARTIAL §Placement L270-320: hearts, flags, collectibles, clutter; no roles, seeds or tiers | — |
| `LEDGER-ENGINE-GEMINI.md:659` | Y | bossBuilder: three parallel ways to win. | MISSING | R1: lairs kept as built (L1303, L1462). |
| `LEDGER-ENGINE-GEMINI.md:660` | Y | Blame log JSON: module, location, violation, measured, limit, exact fix. | PARTIAL §CP3 L259; §Element table L1259 | — |
| `LEDGER-ENGINE-GEMINI.md:661` | N | Example fix: move a double jump half a beat or fold with a mushroom. | n/a: worked example | — |
| `LEDGER-ENGINE-GEMINI.md:662` | N | One-prompt repair under 500 tokens. | n/a: cost claim | — |
| `LEDGER-ENGINE-GEMINI.md:663` | Y | Auto-heal 1: short landing ≤48 px extended both ways. | §P4 L1137-1139 | Tracer sizes landings by construction. |
| `LEDGER-ENGINE-GEMINI.md:664` | Y | Auto-heal 2: run over 2.5 s split with a beat hop or mushroom. | PARTIAL §Rests L510: checked, not filled | — |
| `LEDGER-ENGINE-GEMINI.md:665` | Y | Auto-heal 3: repeated 3-move run at a seam → swap in the runner-up pattern. | PARTIAL §CP3 L241, L391: no idea twice in a row across seams; no swap | — |
| `LEDGER-ENGINE-GEMINI.md:666` | N | Auto-heal lifts first pass to 98% at zero tokens. | n/a: unproven claim | — |
| `LEDGER-ENGINE-GEMINI.md:667` | N | Academic generators assume desktop, controller, 60 fps. | n/a: framing | — |
| `LEDGER-ENGINE-GEMINI.md:668` | Y | Upright view gives 0.45 s lookahead vs 1.2 s sideways; measure ours. | MISSING | R1: fairness upright. |
| `LEDGER-ENGINE-GEMINI.md:669` | Y | Name the both-views sightline box as a px constant. | MISSING | R1: views named (L313), no shared box. |
| `LEDGER-ENGINE-GEMINI.md:670` | N | Camera anchor by node direction. | n/a: camera framing at runtime | — |
| `LEDGER-ENGINE-GEMINI.md:671` | N | Double-jump flick then tap read as one drag at high density. | n/a: touch controls | — |
| `LEDGER-ENGINE-GEMINI.md:672` | N | Right thumb hides the bottom-right 20% upright. | n/a: screen layout and controls | — |
| `LEDGER-ENGINE-GEMINI.md:673` | Y | Gesture cooldown in the tracer once combat is traced. | MISSING | R1: same as row 176. |
| `LEDGER-ENGINE-GEMINI.md:674` | N | Upright: Pokey at 55% height, bottom 25% a thumb zone. | n/a: camera framing | — |
| `LEDGER-ENGINE-GEMINI.md:675` | N | 16/17 frame alternation is 33 ms, ~9.5 px. | n/a: music tempo rounding | — |
| `LEDGER-ENGINE-GEMINI.md:676` | N | Tempos only where 1800/BPM is whole. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:677` | N | World 1 tempo 90 BPM (ours 126-134). | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:678` | N | World 2 tempo 94.74. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:679` | N | World 3 tempo 100. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:680` | N | World 4 tempo 112.5. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:681` | N | World 5 tempo 105.88. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:682` | N | Worlds 6-7 tempo 120. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:683` | N | Worlds 8-9 tempo 128.57. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:684` | N | World 10 tempo 138.46. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:685` | N | Bluetooth earbuds lag 120-220 ms; many play muted. | n/a: audio latency | — |
| `LEDGER-ENGINE-GEMINI.md:686` | Y | Asymmetric window: a +200 ms try on Easy. | MISSING | R1: same as row 168. |
| `LEDGER-ENGINE-GEMINI.md:687` | N | Visual beat pulse. | n/a: music-sync visual | — |
| `LEDGER-ENGINE-GEMINI.md:688` | Y | Sloth velocity paradox: a slow-down with no extra decisions feels like molasses. | PARTIAL §D Water L1593: swim fast; nothing for ropes, silk, mud | — |
| `LEDGER-ENGINE-GEMINI.md:689` | Y | Inverse Velocity-Threat Law as builder rule and validator flag. | MISSING | R3: same as row 157. |
| `LEDGER-ENGINE-GEMINI.md:690` | Y | Cause-and-effect on the main path explodes the layouts to check. | MISSING | R1: moot without cause-and-effect. |
| `LEDGER-ENGINE-GEMINI.md:691` | Y | Contain it to node-2 or node-4 bonus changes. | MISSING | R2: same as row 165. |
| `LEDGER-ENGINE-GEMINI.md:692` | Y | A 3-5 min stage is 7,000-10,000 px across 8 nodes. | MISSING | R1: spec sizes by clock; check before use. |
| `LEDGER-ENGINE-GEMINI.md:693` | N | Mounting every tile drops mid-range Android to 15 fps. | n/a: performance | — |
| `LEDGER-ENGINE-GEMINI.md:694` | N | Mount nodes i−1, i, i+1; one atlas; ≤3 draw calls. | n/a: performance | — |
| `LEDGER-ENGINE-GEMINI.md:695` | N | Day-1 plan for World 4 or 5. | n/a: order of work | — |
| `LEDGER-ENGINE-GEMINI.md:696` | N | Day-1 win: 10/10 first roll, similarity 52% → 38%. | n/a: unproven promise | — |
| `LEDGER-ENGINE-GEMINI.md:697` | N | Phase 2: topology, sightline check, decorator. | n/a: build order | — |
| `LEDGER-ENGINE-GEMINI.md:698` | Y | Four puzzle blueprints: counterweight, vine-switch gate, rotten-floor sequence, wind/water redirect. | PARTIAL §Unused-art ideas L157, L162, L204; §CP3 L375-377: counterweight and root gate as small builds | — |
| `LEDGER-ENGINE-GEMINI.md:699` | N | Ten profiles with harmonic BPMs. | n/a: music tempo | — |
| `LEDGER-ENGINE-GEMINI.md:700` | Y | World mutators: W4 wind, W5 water, W6 silk, W7 rolling boulders, W8 firefly sight. | PARTIAL §B L1495-1506; §C L1550-1561: world hazards (wind, webs, tide, crumble, dark); not as mutator data | — |
| `LEDGER-ENGINE-GEMINI.md:701` | Y | Boss victory loops verified by three bot personas. | MISSING | R1: lairs kept as built. |
| `LEDGER-ENGINE-GEMINI.md:702` | Y | Batch check every stage on both settings. | §E Gates L1612-1620; §F L1626-1629 | — |
| `LEDGER-ENGINE-GEMINI.md:703` | N | Pixi container pools; smooth anchor changes. | n/a: rendering | — |
| `LEDGER-ENGINE-GEMINI.md:704` | Y | Constructive yield ≥85% raw, ≥98% healed. | §CP3 L261; §P4 L1139 | 16 of 16 rolls; 0 "can't reach" rejections. |
| `LEDGER-ENGINE-GEMINI.md:705` | Y | Similarity ≤42% max pairwise, <32% world mean. | PARTIAL §Variety gate L41; §L133: neighbours ≤ half only; no all-pairs or world-mean line | Stage s vs s+2 and cross-world unchecked. |
| `LEDGER-ENGINE-GEMINI.md:706` | Y | 0 repeated 3-4 runs; entropy ≥0.68. | PARTIAL §CP3 L395-397 | Run caps only. |
| `LEDGER-ENGINE-GEMINI.md:707` | Y | Max rest ≤2.2 s; 100% of slow-downs active. | PARTIAL §Rests L510: dead time ≤2.5 s; slow-down rule absent | — |
| `LEDGER-ENGINE-GEMINI.md:708` | Y | 120-150 s skilled, 180-300 s first-timer. | §Stage length L664-667 | — |
| `LEDGER-ENGINE-GEMINI.md:709` | Y | 0 blind leaps upright or sideways. | MISSING | R1: no line in spec; may sit in the tracer (P4). |
| `LEDGER-ENGINE-GEMINI.md:710` | Y | Exactly 85% single-pass petal yield. | PARTIAL §CP3 L826-829 | 100% of marks. |
| `LEDGER-ENGINE-GEMINI.md:711` | Y | Flow ≥82 on all 100 stages. | MISSING | R1: no score. |
| `LEDGER-ENGINE-GEMINI.md:712` | N | <1,500 tokens per new stage. | n/a: cost | — |
| `LEDGER-ENGINE-GEMINI.md:713` | N | 51 works cited, thin sourcing. | n/a: bibliography | — |

### reference/research/ledger/LEDGER-ENGINE-PAPERS.md
120 rows: used 42, partial 28, missing 18, contradicted 3, n/a 29

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `LEDGER-ENGINE-PAPERS.md:43` | Y | Build by construction under Pokey's simulated feet on the beat; checks confirm rather than select | §CP3 L259, L513; §P4 L1137-1139 | The beat appears only as a rhythm pattern drawn per node (L1120-1121). |
| `LEDGER-ENGINE-PAPERS.md:45` | Y | Library labels entry/exit, difficulty and mechanic; a coverage table of combinations; cap universal connectors | PARTIAL §CP2 L65-67; §W1 labels L1391-1406: entry/exit, moves, teaches labelled; no difficulty tier, no coverage table; connectors not capped (L503) | - |
| `LEDGER-ENGINE-PAPERS.md:50` | Y | Named multi-beat patterns (staircase, pit, vine chain), each traced, never hand-placed | §CP2 node ideas L74-86, L102-107; §shared library L126-127 | - |
| `LEDGER-ENGINE-PAPERS.md:53` | Y | Mixed-initiative: pin the signature moment by hand; the engine fills the rest on the beat | PARTIAL §Stage profile L1213: each stage names its moment node; the mixer still rolls it from a deck (1-1 n9, L1073); no pinned pieces | - |
| `LEDGER-ENGINE-PAPERS.md:56` | Y | Difficulty curve as a build input carried by the stage spec, honoured per node | §difficulty dial L626-656 | - |
| `LEDGER-ENGINE-PAPERS.md:93` | Y | Coverage table: every (entry, exit, difficulty) combination must exist, else generation breaks or scrapes by | MISSING | R5: decks hold 1-4 ideas per node (L341-351); nothing counts ideas per entry/exit/job cell per world. Nearest: kind counts vs old 1-1 (L88-92). |
| `LEDGER-ENGINE-PAPERS.md:95` | Y | Cap universal connectors; nothing measures how alike node seams look | CONTRADICTED L503,L799: Easy lays a flat breather pad between every node, Normal a pad after every second burst; no seam-likeness count | Identical flat pads at every seam are the all-connector Carmo says lowers variety. |
| `LEDGER-ENGINE-PAPERS.md:98` | Y | Named multi-beat patterns form a layer every world shares | §shared library L122-133; §CP2 L74-86 | - |
| `LEDGER-ENGINE-PAPERS.md:100` | Y | Pin chosen pieces, regenerate the rest around them | MISSING | R4: a hand-made signature moment per stage would make stages memorable; the spec only names the moment (L1213). |
| `LEDGER-ENGINE-PAPERS.md:102` | Y | Re-pace a stage without touching its geometry | PARTIAL §Design L1120-1121: rhythm pattern drawn per node; §profile pace L1218: no per-node bars a designer edits | - |
| `LEDGER-ENGINE-PAPERS.md:104` | Y | Difficulty curve as a build input, piece by piece | §difficulty dial L640-648, L655 | - |
| `LEDGER-ENGINE-PAPERS.md:106` | Y | A search steered by the error instead of random retries | §CP3 rulings L369; §difficulty dial L640 | Gaps sized from jumpOK/heldMaxGap; mix code binary-searches jumpOK (src/game/mixer/w1mix.ts:240, :262). |
| `LEDGER-ENGINE-PAPERS.md:109` | Y | Piece-use spread over many rolls finds dead and hogging pieces | PARTIAL §variety gate L33-34; §CP2 L190-197: commonest share per stage over 16 rolls and a one-off all-world count; no dead-piece report | - |
| `LEDGER-ENGINE-PAPERS.md:112` | Y | A checker that can only be wrong in the safe direction, written as a gate rule | MISSING | R1: correctness of gates, not variety. |
| `LEDGER-ENGINE-PAPERS.md:115` | Y | Terrain first, then hazards and enemies by a second pass on the lines Pokey avoids | MISSING | R1: the spec puts animals inside ideas (L107) and counts them per stage (L645); no two-pass placement rule. |
| `LEDGER-ENGINE-PAPERS.md:117` | Y | Adjacency by look, not only by height | §coherence L130-131; §placement rule 1 L280; §S-4 L775-777 | - |
| `LEDGER-ENGINE-PAPERS.md:118` | Y | Seed the library from levels already judged good | §CP2 L62-63, L88-89; §CP3 L237-240 | - |
| `LEDGER-ENGINE-PAPERS.md:154` | Y | The beat sets each pattern's length (NodeSpec bpm, bars) | PARTIAL §Design L1120-1121; §CP3 L390-391: length comes from burst piece counts, not beat duration | - |
| `LEDGER-ENGINE-PAPERS.md:155` | Y | Tanagra's five single-beat patterns map to ours: platform, gap, enemy, crumble, mushroom spring | §CP1 piece list L53-54; §ground family L614; §unused-art L165 | - |
| `LEDGER-ENGINE-PAPERS.md:156` | Y | Multi-beat patterns with their own rules; a staircase varies one number each step | §CP2 L78 (each bough a different length); §CP3 L240, L393 | - |
| `LEDGER-ENGINE-PAPERS.md:157` | Y | Gap rule: zero width means non-zero height, never a jump over nothing | MISSING | R1: geometry validity is left to the level check code; spec silent. |
| `LEDGER-ENGINE-PAPERS.md:158` | Y | Replace fitSteps' 160 random tries with a small error-steered search | §CP3 rulings L369; §difficulty dial L640 | Same as L106: sizes come from the gate's own limits. |
| `LEDGER-ENGINE-PAPERS.md:159` | Y | Pinned hand-built nodes; the generator traces the nodes between, matching their exit heights | MISSING | R4: no pinning; the spec's hand-built stages are whole special stages kept as built (L1495). |
| `LEDGER-ENGINE-PAPERS.md:160` | Y | Pacing edit without geometry: the spec lists each node's bars, the generator retraces | PARTIAL §Design L1120-1121; §profile pace L1218 | - |
| `LEDGER-ENGINE-PAPERS.md:161` | Y | Edge labels: each pattern declares entry and exit height and surface | §CP2 L65; §CP3 L251; §placement rule 1 L278-283 | - |
| `LEDGER-ENGINE-PAPERS.md:162` | Y | Coverage check: each world profile's (entry, exit, tier, mechanic pair) has at least 3 patterns | MISSING | R5: directly answers 'more pieces'; spec decks can hold one idea (n7 L347, n11 L351). |
| `LEDGER-ENGINE-PAPERS.md:163` | Y | Cap or vary the 200 px apron and count seam repeats | CONTRADICTED L503,L799: universal breather pads added; no seam-likeness count | R4-level: seams look the same in every stage. |
| `LEDGER-ENGINE-PAPERS.md:164` | Y | Curve as input: a per-node density target checked against measured density | PARTIAL §difficulty dial L643; §rests L508-510: stage-level density lines only; no per-node target | - |
| `LEDGER-ENGINE-PAPERS.md:165` | Y | Piece-use spread over 200 rolls per world | PARTIAL §variety gate L33-35: per stage on 16 rolls only | - |
| `LEDGER-ENGINE-PAPERS.md:166` | Y | Safe-direction checker written into gates.md for every new gate | MISSING | R1: gate correctness. |
| `LEDGER-ENGINE-PAPERS.md:167` | Y | Single-route checker blind spot: a split stage's other road may go unjudged | PARTIAL §variety gate L38-39; L1153: both roads proven walkable; pacing and fun gates not stated per road | The high road is judged on Normal's bands only (L819). |
| `LEDGER-ENGINE-PAPERS.md:168` | Y | Terrain then enemies (hazardSpots after the trace) | MISSING | R1: as L115. |
| `LEDGER-ENGINE-PAPERS.md:169` | Y | Seed the library from the rebuilt 1-1 to 1-5 nodes | §CP2 L62-63; §CP3 L237 | - |
| `LEDGER-ENGINE-PAPERS.md:173` | N | Carmo's numbers don't carry over; take its ideas only | n/a: guidance on reading the research | - |
| `LEDGER-ENGINE-PAPERS.md:175` | Y | A pattern's difficulty tier comes from the clumsy trace and bots, not an obstacle count | §difficulty dial L644, L651 | The dial also counts risky pieces per burst (L643). |
| `LEDGER-ENGINE-PAPERS.md:177` | N | The Tanagra text is the demo paper only; fetch FDG 2010 | n/a: research sourcing | - |
| `LEDGER-ENGINE-PAPERS.md:180` | Y | Batch, seeded, deterministic output; pinning and pacing edits as spec features | PARTIAL §CP1 L44; §CP3 L261: seeded 16 rolls; no pinning; pacing only as L1120 | - |
| `LEDGER-ENGINE-PAPERS.md:190` | Y | Anxiety curves plus rhythm metadata plus WFC give variety and difficulty control | PARTIAL §difficulty dial L628; §Design L1120: curve and rhythm used, no WFC (by choice) | - |
| `LEDGER-ENGINE-PAPERS.md:191` | Y | Pure randomness is unplayable or boring; aim for playable, challenging, interesting | §CP3 coherence L263-264; §placement L272-274 | - |
| `LEDGER-ENGINE-PAPERS.md:192` | Y | Fun judged by flow or an anxiety curve | §rests L490-511 (fun gate pacing flags, 'tension flat' L497) | - |
| `LEDGER-ENGINE-PAPERS.md:193` | N | WFC is a constraint solver that backtracks or fails | n/a: background on an algorithm not used | - |
| `LEDGER-ENGINE-PAPERS.md:194` | N | WFC used in Bad North, Townscaper, Caves of Qud | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:195` | N | Terms: level, tile set, tile, cells | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:196` | N | Platformer history | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:197` | N | Side-scrollers rarely use PCG; Spelunky's room templates suit it | n/a: background survey | - |
| `LEDGER-ENGINE-PAPERS.md:198` | N | WFC in grid platformers only | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:199` | N | Thesis argues WFC output is controllable without losing variety | n/a: claim refuted by its own results | - |
| `LEDGER-ENGINE-PAPERS.md:200` | Y | Anxiety curve as an input: pick a difficulty curve, map it to obstacles | §difficulty dial L626-656 | - |
| `LEDGER-ENGINE-PAPERS.md:201` | Y | Two tests: variety under adjacency rules; playable start to finish | §variety gate L30-41; §CP3 READY L906-908 | - |
| `LEDGER-ENGINE-PAPERS.md:202` | Y | Impossible means a gap too wide or a wall too high | §CP3 rulings L366-369 | - |
| `LEDGER-ENGINE-PAPERS.md:203` | N | WFC algorithm steps (Gumin 2016) | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:204` | Y | Rhythm groups: a challenge ending in a short rest | §CP3 bursts L390-392; §A+B L799 | - |
| `LEDGER-ENGINE-PAPERS.md:205` | Y | Portals switch paths (pipes, moving platforms) | §CP3 crossings L461 | Each fork gets a step-down halfway and a climb back up. |
| `LEDGER-ENGINE-PAPERS.md:206` | N | FI-2Pop genetic algorithm, rejected as too much setup | n/a: alternative method not taken | - |
| `LEDGER-ENGINE-PAPERS.md:207` | Y | ORE: chunks placed around the player's possible positions; joining chunks is hard to tune | PARTIAL §placement rule 1 L278-283: kit joins sized to the next move; not placed around simulated positions | - |
| `LEDGER-ENGINE-PAPERS.md:208` | Y | Adaptive difficulty: help after deaths, slower hazards, continue points | MISSING | R1: only fixed Easy and Normal dials (L635-648). |
| `LEDGER-ENGINE-PAPERS.md:209` | Y | Anxiety curve judged on the level without play; curve first | §difficulty dial L626-656 | - |
| `LEDGER-ENGINE-PAPERS.md:210` | Y | Validation: each obstacle passable with timing leniency, plus count of distinct levels | §CP2 L183 (300 ms flick floor); §dial floors L651; §variety gate L30-41 | - |
| `LEDGER-ENGINE-PAPERS.md:211` | N | Godot overlapping WFC add-on, 26 Mario tiles | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:212` | N | Overlapping WFC recombines its input | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:213` | N | Obstacle: difficulty control needs many tile bundles | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:214` | N | No guarantee a tile is used, so a hard bundle may give an easy level | n/a: evidence against a method not used | - |
| `LEDGER-ENGINE-PAPERS.md:215` | N | Tiling WFC: rules from metadata, not examples | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:216` | Y | Pieces cut from real levels; edge heights drive adjacency; difficulty judged per piece | PARTIAL §CP2 L62-67: kept pieces with entry/exit, moves and gap range; no per-piece difficulty tier | - |
| `LEDGER-ENGINE-PAPERS.md:217` | Y | Height bands LOW, MID, TOP; only matching labels may touch | §CP3 L251; §placement rule 1 L278 | - |
| `LEDGER-ENGINE-PAPERS.md:218` | Y | Adjacency labels rule out unreachable joins | §placement rule 1 L282-283 | - |
| `LEDGER-ENGINE-PAPERS.md:219` | N | Difficulty v1 by gap width | n/a: superseded inside the thesis | - |
| `LEDGER-ENGINE-PAPERS.md:220` | Y | 27 combinations; 12 missing; a missing combination breaks generation; add pieces | MISSING | R5: the coverage-table gate; nothing per world counts ideas per cell. |
| `LEDGER-ENGINE-PAPERS.md:221` | Y | Difficulty v2 counts obstacles; ours should take tier from clumsy trace and bots | PARTIAL §difficulty dial L643-644: risky pieces per burst counted, E[lives] by bots; no per-piece tier | - |
| `LEDGER-ENGINE-PAPERS.md:222` | Y | Fill missing combinations with new hand-made pieces, never by rerolling | §CP3 L259; §CP2 L88-89, L196-197 | - |
| `LEDGER-ENGINE-PAPERS.md:223` | N | Filler pieces coloured differently, visual only | n/a: art detail of the thesis | - |
| `LEDGER-ENGINE-PAPERS.md:224` | Y | A pattern may declare several entry heights | §CP2 node ideas L80, L106-107 | 'any -> mid or high', 'mid or high -> same'. |
| `LEDGER-ENGINE-PAPERS.md:225` | Y | Only 3 all-connector pieces, since more lower variety; cap or vary our apron | CONTRADICTED L503,L799: a flat breather between every Easy node and a pad every second Normal burst | R4: the spec makes connectors universal instead of capped. |
| `LEDGER-ENGINE-PAPERS.md:226` | N | Level is 10 slots of 160 x 240 px | n/a: thesis grid detail | - |
| `LEDGER-ENGINE-PAPERS.md:227` | N | Each slot starts with 197 options | n/a: thesis detail | - |
| `LEDGER-ENGINE-PAPERS.md:228` | Y | Curve applied after the first piece so the opening position varies | PARTIAL §CP3 node plan L341: n1 draws from a two-idea deck; build order is fixed | - |
| `LEDGER-ENGINE-PAPERS.md:229` | N | Propagate edges until full | n/a: WFC detail | - |
| `LEDGER-ENGINE-PAPERS.md:230` | Y | The curve filters each slot; flat curves keep difficulty while height varies | §difficulty dial L655; §CP3 node jobs L339-351 | - |
| `LEDGER-ENGINE-PAPERS.md:231` | Y | Rising and peak curves; our curve is richer, keep it | §CP3 node plan L339-351; §difficulty dial L655 | - |
| `LEDGER-ENGINE-PAPERS.md:232` | Y | Judge variety and completability, not good or bad; we also judge fun | §variety gate L30-41; §CP3 L263-264 | - |
| `LEDGER-ENGINE-PAPERS.md:233` | N | Table 3: 11 test rounds | n/a: thesis data | - |
| `LEDGER-ENGINE-PAPERS.md:234` | Y | Runs stopped short when a combination was missing | PARTIAL §CP3 L259: fails naming the missing piece; no coverage table to prevent it | - |
| `LEDGER-ENGINE-PAPERS.md:235` | Y | Variety means all pieces used, and how often they repeat | PARTIAL §variety gate L32-35: kinds, share and run per stage; no all-pieces-used check | - |
| `LEDGER-ENGINE-PAPERS.md:236` | Y | Most and least used counts, mean and spread per piece across all rolls | MISSING | R4: a never-drawn library idea is wasted variety; the spec counts only the commonest share per stage. |
| `LEDGER-ENGINE-PAPERS.md:237` | Y | High spread means hogs and dead pieces; report both | PARTIAL §variety gate L33: hogs via the share cap; dead pieces unreported | - |
| `LEDGER-ENGINE-PAPERS.md:238` | Y | Check after generating and discard failures; ours builds by construction | §CP3 L259, L513 | - |
| `LEDGER-ENGINE-PAPERS.md:239` | Y | Landing tested against the jump arc | §CP3 rulings L369; §P4 L1137 | - |
| `LEDGER-ENGINE-PAPERS.md:240` | Y | A platform reachable before the arc's peak counts as reachable | PARTIAL §P4 L1137: reach delegated to the shared tracer; the spec is silent on this case | - |
| `LEDGER-ENGINE-PAPERS.md:241` | Y | 8.8-23% unplayable with roll-then-filter: evidence for by-construction | §CP3 L259, L513 | - |
| `LEDGER-ENGINE-PAPERS.md:242` | Y | Checker tests only the lowest path, so other routes go unjudged | PARTIAL §variety gate L38-39; L1153: walkability of both roads only | - |
| `LEDGER-ENGINE-PAPERS.md:243` | N | Thesis summary of results | n/a: summary | - |
| `LEDGER-ENGINE-PAPERS.md:244` | Y | Future: terrain first, then a second pass for enemies | MISSING | R1: as L115. |
| `LEDGER-ENGINE-PAPERS.md:245` | Y | ORE makes new pieces that WFC combines; patterns generated from bars | PARTIAL §CP3 L390-393: ideas composed of bursts with sizes rolled; no new patterns generated | - |
| `LEDGER-ENGINE-PAPERS.md:246` | Y | Other games' tile sets; mixing styles | §shared library L122-134 | - |
| `LEDGER-ENGINE-PAPERS.md:247` | Y | Adjacency by look for visual cohesion | §coherence L130-131; §placement rule 1 L280 | - |
| `LEDGER-ENGINE-PAPERS.md:248` | Y | Checker gives only false negatives; a gate may only err toward failing | MISSING | R1: gate correctness. |
| `LEDGER-ENGINE-PAPERS.md:249` | Y | A new game needs its own validity definition and checker | §placement rules L276; §Gates L1612-1620 | - |
| `LEDGER-ENGINE-PAPERS.md:250` | Y | Fun is subjective; only building and playing shows it | §CP3 L263-264; §CP5 L1106-1110 | - |
| `LEDGER-ENGINE-PAPERS.md:251` | N | Thesis references (Sorenson and Pasquier challenge model) | n/a: references | - |
| `LEDGER-ENGINE-PAPERS.md:252` | Y | Tanagra: reactive planning plus constraint solving, always playable | PARTIAL §CP3 L369; §P4 L1137: shared jump model, no constraint solver | - |
| `LEDGER-ENGINE-PAPERS.md:253` | Y | Designers replay a level many times before showing anyone | §CP4 pass line L1101 | - |
| `LEDGER-ENGINE-PAPERS.md:254` | Y | A small edit forces wide changes elsewhere; pinned nodes plus local retrace | MISSING | R2: mix code gives each node its own RNG stream (w1mix.ts:26-27); the spec says nothing. |
| `LEDGER-ENGINE-PAPERS.md:255` | Y | Mixed-initiative: alternatives fast, regenerate only chosen parts | MISSING | R4: as L100. |
| `LEDGER-ENGINE-PAPERS.md:256` | N | Evolutionary methods too slow; grammars lack timing and physics | n/a: background | - |
| `LEDGER-ENGINE-PAPERS.md:257` | Y | Change a level's pacing without touching geometry | PARTIAL §Design L1120-1121; §profile pace L1218 | - |
| `LEDGER-ENGINE-PAPERS.md:258` | Y | Geometry relations as constraints so no unplayable level is produced | PARTIAL §CP3 L369; §P4 L1137-1139: shared gate functions, no solver | - |
| `LEDGER-ENGINE-PAPERS.md:259` | Y | Beats are the frequency of player actions and model rhythm and pacing | §Design L1120-1121; §rests L496 (actions a second) | - |
| `LEDGER-ENGINE-PAPERS.md:260` | Y | Beats are the glue that size and join patterns | PARTIAL §CP3 L251, L390-391: joins by height, size by piece counts, not by beat | - |
| `LEDGER-ENGINE-PAPERS.md:261` | N | ABL is a Java reactive planning language | n/a: tool background | - |
| `LEDGER-ENGINE-PAPERS.md:262` | Y | Patterns as behaviours; the simplest span one beat | §CP2 node ideas L74-86 | - |
| `LEDGER-ENGINE-PAPERS.md:263` | Y | Multi-beat patterns with extra rules (equal-height staircase); ours varies by choice | §CP2 L78; §CP3 L240, L393 | - |
| `LEDGER-ENGINE-PAPERS.md:264` | Y | Components carry position and size as constraint variables | PARTIAL §difficulty dial L640-642: gap, rise, landing as shares of gate limits; no solver | - |
| `LEDGER-ENGINE-PAPERS.md:265` | Y | Pattern length must match its beat's duration under a movement model | PARTIAL §Design L1120; §CP3 L391 | - |
| `LEDGER-ENGINE-PAPERS.md:266` | Y | Five single-beat and two multi-beat patterns; name our multi-beat patterns | §CP2 L74-86, L102-107, L154-172 | - |
| `LEDGER-ENGINE-PAPERS.md:267` | N | Choco constraint library | n/a: tool not taken | - |
| `LEDGER-ENGINE-PAPERS.md:268` | Y | Gap constraints: zero width means non-zero height and vice versa | MISSING | R1: as L157. |
| `LEDGER-ENGINE-PAPERS.md:269` | Y | Solver reports back so planning continues; error-steered search | PARTIAL §CP3 L369-370: sized by the gate's functions, planner reports conflicts; no error-steered search named | - |
| `LEDGER-ENGINE-PAPERS.md:270` | Y | Designer-modified platforms stay while the rest regenerates | MISSING | R4: as L100. |
| `LEDGER-ENGINE-PAPERS.md:271` | N | Tanagra architecture diagram | n/a: tool background | - |
| `LEDGER-ENGINE-PAPERS.md:272` | N | Two garbled spans; fetch the FDG paper | n/a: research sourcing | - |

### reference/research/engine-2026-11-05/R1-shipped-pipelines.md
44 rows: used 8, partial 19, missing 4, contradicted 2, n/a 11

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `R1-shipped-pipelines.md:30` | Y | Shipped hybrids use big whole hand-made units; the generator only picks and orders them, never invents geometry. | PARTIAL §CP3 mix rule L232-250: ideas are designed and ordered, but each idea's sizes and heights are rolled (L249-250, L393), not whole hand-made units | Closest whole units are gen2's W6-8 sections, put in the shared library at L126. |
| `R1-shipped-pipelines.md:39` | Y | No unit repeats inside a level, and the save remembers every unit already shown (SMBF, Shovel Knight). | CONTRADICTED L237: "No idea twice" is withdrawn; only not-twice-in-a-row (L241) and no burst twice (L391) remain; nothing remembers across stages | R5: repeats inside and across stages are the owner's complaint; the spec allows an idea up to 40% (L242). |
| `R1-shipped-pipelines.md:48` | Y | Pool several times bigger than one level's slots, cut per level; count distinct eligible pieces per phase against slots. | PARTIAL §CP3 L259; §shared library L126-128: pool grown across worlds and missing piece named, but no distinct-vs-slots count; 1-5 has about 18 ideas (L208-209) for 22-33 bursts (L390) | Ratio about 0.55-0.8:1 against R1's 1:1 floor and SMBF's about 10:1. |
| `R1-shipped-pipelines.md:60` | Y | Difficulty is a cadence of rated units that ramps and cools at every scale, inside each node and across the stage. | PARTIAL §difficulty dial L628-632, L655; §rests L500-502: per-stage dial, job order and rest nodes; no per-idea rated difficulty, no cadence inside a node | Dial is linear per stage; within-node ramp and cool is not specified or checked. |
| `R1-shipped-pipelines.md:68` | Y | Teach in three steps: exposition, a safe blocking validation, then challenge. | PARTIAL §1-5 node plan L342, L346; §animals L218; §1-1 plan L1066, L1071: expose, validate, test are used; validation is not blocking (catch bough under it, L342) | No check that the validation step must be passed by using the move. |
| `R1-shipped-pipelines.md:74` | Y | Every stage carries one named surprise, unique across the game, passing Wonder's three tests. | PARTIAL §stage profile L1213, L1222; §CP4 L941: one 'moment' per stage and owned moments; no surprise tests or game-wide uniqueness check | Wonder's tests (new ability, before/during link, one phrase) absent. |
| `R1-shipped-pipelines.md:80` | Y | Grey layout first, judged, then art; keep the edit-to-play loop short. | §CP3 L266-267; §CP5 L1107-1110 | Grey-box test link, art after Matt's pick, a stage in an hour. See L536 row for the 1-1 art conflict. |
| `R1-shipped-pipelines.md:86` | Y | Finishing is a list of passes, each looking at the whole game for one thing. | §polish pass L689-733; §whole-game plan E L1612-1620 | P-rules each have a machine check; gates 1-6 run over all 102 stages. |
| `R1-shipped-pipelines.md:90` | Y | Fairness comes from the generator and from the hero's forgiving tools (climbing, wider timing windows). | PARTIAL §1-5 node plan L342; §CP3 MISS rulings L434-438; §1-1 plan L1073: generator-side catches and safe slips only; no hero rescue or forgiveness tool | Spec never mentions coyote time or a rescue move (grep: no 'forgiv', 'coyote', 'rescue'). |
| `R1-shipped-pipelines.md:95` | Y | Build each world's first stage last, and re-grade early stages after later ones improve. | CONTRADICTED L1090-1091: 1-1 is built second, right after 1-5, and 1-2 to 1-4 wait on it; no re-grade of earlier stages | R2: matters for quality drift more than repetition; 1-1 is also the fixed bar (L1092). |
| `R1-shipped-pipelines.md:492` | N | Super Mario Bros. 1985: next-day turnaround per edit, game in about six months. | n/a: production-speed data point |  |
| `R1-shipped-pipelines.md:493` | N | SMBF: 8 chunks per level from 70-100, about 7200 levels, about four years. | n/a: production-speed data point | Its pool figure is traced in the L48 row. |
| `R1-shipped-pipelines.md:494` | N | Shovel Knight Specter: 26+6 rooms per level, most of a year, 4 months of polish. | n/a: production-speed data point | Room budget traced in the L527 row. |
| `R1-shipped-pipelines.md:495` | N | Hollow Knight: 2 days tiles plus 4 days art per area, a week enemy pass. | n/a: production-speed data point |  |
| `R1-shipped-pipelines.md:496` | N | Rayman Jungle Run: 11 designers made most of 40 phone levels in a week. | n/a: production-speed data point |  |
| `R1-shipped-pipelines.md:497` | N | Ori: 8 months for one prologue sequence. | n/a: production-speed data point |  |
| `R1-shipped-pipelines.md:498` | N | N++: over 4,500 levels made, 2,360 shipped. | n/a: production-speed data point |  |
| `R1-shipped-pipelines.md:499` | N | BIT.TRIP BEAT bosses took 2-3 days each and felt rushed. | n/a: production-speed data point |  |
| `R1-shipped-pipelines.md:500` | N | Our World 1 beat stages cost 1,349 and 602 lines of code over about 7.5 hours each. | n/a: our own production cost | Spec answers with a 1-hour-a-stage line (L267, L1103). |
| `R1-shipped-pipelines.md:508` | Y | Hard per-stage no-repeat cap by construction; refuse and name missing pieces; length from units, never a clock. | PARTIAL §CP3 L259; §stage length L669: missing-piece refusal and length-from-units are used; the no-repeat cap is withdrawn (L237) and repeats allowed to 40% (L242) |  |
| `R1-shipped-pipelines.md:514` | Y | A save-wide ledger: a unit seen anywhere in the save leaves the bag until the world's pool is spent. | MISSING | R4: SMBF's fix for cross-stage sameness; spec only caps neighbour overlap at half (L41, L133). Not in mixer code. |
| `R1-shipped-pipelines.md:517` | Y | Rarity and position tags on units (Spelunky 2 !rare 5%, !hard only in later stages). | PARTIAL §World 1 piece labels L1391, L1394-1406: 'allowed in' stage gating via teaching; no rarity tier | Rare units would make a stage feel special; nothing in the spec is rare on purpose. |
| `R1-shipped-pipelines.md:519` | Y | Ubisoft kit: five-value atomic parameters, safe blocking validation, subtractive variety, random variety matrix. | PARTIAL §difficulty dial L638-648; §1-5 node plan L342: numeric dials and expose/validate; no subtractive variety, no random variety matrix | Combined beats are hand-picked per world (L1571-1583), not a matrix. |
| `R1-shipped-pipelines.md:522` | Y | One named surprise per stage with Wonder's three tests, unique across the game, as a 'signature' field. | PARTIAL §stage profile L1213, L1222: 'moment' and 'owns' fields; no three tests, no game-wide uniqueness gate | Same idea as the L74 row. |
| `R1-shipped-pipelines.md:524` | Y | An open grade board per stage, re-graded after later stages improve. | MISSING | R2: old 1-1 is a fixed bar (L1092-1093); known list only shrinks (L1619); nothing re-grades shipped stages. |
| `R1-shipped-pipelines.md:527` | Y | Shovel Knight stage contract: ~26 rooms + 6 secrets, 5 new enemies + 5 objects, no unitaskers, game-wide cooldown list. | PARTIAL §move ladder L114-116; §polish pass L689-733: new-thing budget and checked passes; no 'on cooldown' list, and lengths vary on purpose (L666-667) against SK's consistent length | Secrets only as 'side pockets' in 1-1 (L1177). |
| `R1-shipped-pipelines.md:531` | Y | For a one-thumb game, advanced skill comes from level objects at a place, not input combinations. | PARTIAL §moves L1280-1299: many moves are objects (mushroom, rope, liana, warm air); no rule that advanced moves come from props |  |
| `R1-shipped-pipelines.md:533` | Y | Rate unit difficulty from bots' measured deaths and time, not the author's guess. | PARTIAL §difficulty dial L635, L644, L651: stage risk budget and per-jump floors judged by bots; no per-idea or per-burst rating from play |  |
| `R1-shipped-pipelines.md:536` | Y | Grey approval stamp before any art is chosen. | PARTIAL §CP5 L1107-1110: grey-box before art; but L1195-1196 holds 1-1 from Matt until its squirrel art draws | The polish pass (L677-) also ran on 1-5 before CP5. |
| `R1-shipped-pipelines.md:543` | Y | Avoid shuffling prefab rooms with sockets and no designed path. | §CP3 node plan L336-351; §How a stage is made L1026-1034 | Each stage has a designed node plan with matched entries and exits (L251). |
| `R1-shipped-pipelines.md:546` | Y | Never re-roll the level when the player dies; keep the layout until cleared. | MISSING | R1: spec silent; the game's layoutMemory.ts already does this for its stages; worth one line so the mixer keeps it. |
| `R1-shipped-pipelines.md:548` | Y | Neighbouring units with mismatched difficulty make spikes; rate from play and smooth the cadence at joins. | MISSING | R2: joins are sized to the next first move (L278-279) but difficulty between neighbouring bursts is never compared. |
| `R1-shipped-pipelines.md:550` | Y | Same unit many times because length is filled to a clock from too few units; fix unit count, time follows. | PARTIAL §stage length L669; §1-1 ruling L1181: rule stated; but L381-394 meet a 120 s floor by adding bursts from 2-3-idea decks, so ideas repeat | See notes (b). |
| `R1-shipped-pipelines.md:553` | Y | A flat difficulty after the opening; every shipped method ramps and cools. | PARTIAL §1-5 node plan L339-351; §difficulty dial L655: job order ramps and rests cool; no measured per-node difficulty check |  |
| `R1-shipped-pipelines.md:554` | Y | A sequel or world that looks the same in a screenshot; each world needs its own tiles and ingredients. | PARTIAL §whole-game plan B L1495-1506; §shared library L130-132: own move, hazards and look per world; the shared library mixes art across worlds (L123-128), no screenshot check |  |
| `R1-shipped-pipelines.md:556` | Y | Do not generate enemies or locomotion; keep creatures hand-made with readable tells. | §animals L219; §never-packed L541-542 | Boa rear-up tell; caiman eye-open tell. |
| `R1-shipped-pipelines.md:557` | Y | Designers beat only their own levels; use kid and first-timer bots and outside play first. | §animals L221; §difficulty dial L651-652; §How a stage is made L1031-1032 |  |
| `R1-shipped-pipelines.md:560` | N | Rushing a piece in 2-3 days at the end; plan the pieces first. | n/a: production scheduling | CP2 plans the piece sheet before any stage (L61-97). |
| `R1-shipped-pipelines.md:561` | Y | Tools that make small layout fixes expensive; keep units as data placed relative to anchors. | §Engine first L1204-1206; §F L1626 | Stage profiles and stages as data; joins by height band (L278-279). |
| `R1-shipped-pipelines.md:564` | Y | Generating does not save effort unless units are made once and used without repeats. | PARTIAL §CP3 L267; §CP4 L1103: 1-hour-a-stage target; but units repeat inside a stage (L237-242) |  |
| `R1-shipped-pipelines.md:567` | Y | Running out of ideas with the same pieces; variety needs new pieces (N++ new enemies). | §log family L558-580; §ground family L617-620; §never-packed L530-553 | Also 'spread the pieces most worlds lack' (L196). |
| `R1-shipped-pipelines.md:568` | Y | A long stage of units loses an earned finish; end on a hand-made set piece or combined test. | PARTIAL §1-5 node plan L350; §stage length L668: master fork before the cool-down; no hand-made set piece ending each stage | Finale only per world (L668). |
| `R1-shipped-pipelines.md:572` | Y | Do not make the music's beat the frame of every stage; shipped games used rhythm as one stage's twist. | §Design L1120-1121 | "the player's rhythm, not the song". |
| `R1-shipped-pipelines.md:584` | N | Source list: our repo (gen2, World 1, layoutMemory, STAGE-RULES, ledgers). | n/a: source list entry |  |

### reference/research/engine-2026-11-05/R2-academic-pcg.md
39 rows: used 7, partial 13, missing 5, contradicted 1, n/a 13

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `R2-academic-pcg.md:36` | Y | Variety is vocabulary, not randomness: draw each beat from a grammar of kinds; gate counts kinds, not pixels. | §variety gate L32; §log family L558-560; §CP3 bursts L393 | Kinds and kind x size counted; kind or size changes every 2 pieces. |
| `R2-academic-pcg.md:48` | Y | Build by construction and keep checks as the backstop. | §Planner amendments P4 L1137-1139; §CP3 rules L513 | One tracer model; 'can't reach' rejections 0; the mixer checks every roll. |
| `R2-academic-pcg.md:57` | Y | Choose the pattern first, solve its numbers second, and let numbers flow (Tanagra). | §CP3 mix rule L232, L249-250; §1-5 node plan L336-337 | Idea first, sizes inside. Tanagra's backtracking order is not specified. |
| `R2-academic-pcg.md:64` | Y | Local grammars overgenerate; global intent needs critics; tagged per-region intent needs search, not more rolls. | PARTIAL §variety gate L30-41; §CP3 L259: gates act as critics and refuse rather than reroll; no search for per-node intent | A tagged node plan is exactly Launchpad's 'search' case. |
| `R2-academic-pcg.md:72` | Y | A mechanic must be required: the bot without it must fail the teach, the full bot pass. | PARTIAL §placement rule 4 L311-312; §move ladder L1311, L1317: limited agent only for hard collectibles; 'required' via skills.ts; no teach-node must-fail gate | R2 measured no-hide bot clears all 9 hide layouts. |
| `R2-academic-pcg.md:80` | Y | Difficulty and pacing are curves built to a real arc with a late peak, not a constant or sawtooth. | PARTIAL §difficulty dial L628-656; §rests L500-502: linear dial and job order; no target tension curve, no late-peak check |  |
| `R2-academic-pcg.md:87` | Y | Mixed-initiative beats batch generation; keep values as last time, relax only if impossible. | PARTIAL §How a stage is made L1026-1034: human node plan plus generator loop; no stability under edits |  |
| `R2-academic-pcg.md:93` | Y | Player studies punished hard levels; beat-locking every take-off feels monotonous. | §difficulty dial L651; §Design L1120-1121; §rests L504-505 | Per-jump floors, Easy fewer moves a second, rhythm not locked to the song. |
| `R2-academic-pcg.md:516` | Y | One canopy rhythm admits about 3 million valid geometries; the rhythm tier is not short of options. | PARTIAL §1-5 node plan L336-337: spec varies by ideas, not numbers; never measures a node's geometry space |  |
| `R2-academic-pcg.md:518` | Y | On canopy nodes the tracer rejects nothing; the quality bottleneck is what the palette offers. | §log family L558-580; §ground family L617-620 | Spec grows the palette (3 to 8 log kinds, 4 to 12 ground kinds). |
| `R2-academic-pcg.md:522` | Y | The space is huge in pixels and tiny in kinds; generator varies numbers, player perceives kinds. | §variety gate L32; §log family L560 | Gate counts kind x size. |
| `R2-academic-pcg.md:527` | Y | fitSteps biases climb; sample uniformly (count-weighted) from the valid space. | MISSING | R1: spec's shuffle bag for sizes and heights (L249-250) is not count-weighted sampling. |
| `R2-academic-pcg.md:532` | Y | Floor rejections are one predictable rule (MIN_GAP); filter when the candidate is made, not by a full trace. | §CP3 rulings L369; §Planner amendments P4 L1137-1139 | Gaps sized by the level check's own functions. |
| `R2-academic-pcg.md:536` | Y | Search is not faster today, but becomes the right tool once constraints get tight (pins, rise targets, kind quotas). | MISSING | R2: spec adds tight constraints (L393-394, bands L1214) and 'never a reroll' (L259) but names no pruned search. |
| `R2-academic-pcg.md:654` | Y | Kind grammar per beat with a kind-count gate per node and an edit-distance floor between same-tag nodes. | PARTIAL §variety gate L32; §CP3 bursts L393: stage kind count and kind change every 2 pieces; no per-node kind count, no same-tag distance floor |  |
| `R2-academic-pcg.md:658` | Y | A wait verb in the bars (stomper, moving platform): beats that make Pokey stop. | PARTIAL §Design L1120-1121; §ideas L107, L160: 'wait-and-go' rhythm and wait ideas named; tracer knows only hop/jump/double (P2 L1131) |  |
| `R2-academic-pcg.md:663` | Y | Limited-agent gate: bot with the taught move switched off must fail the teach node. | PARTIAL §placement rule 4 L311-312: limited agent used for hard collectibles only; no teach-node gate | No limited agent in mixer code (grep src/game/mixer, tools/engine). |
| `R2-academic-pcg.md:671` | Y | Measure each node's space (count, valid share, kinds) before rolling. | MISSING | R3: would show before rolling whether a node can vary at all. |
| `R2-academic-pcg.md:680` | Y | Stability under edits: other nodes keep solved values unless no solution exists. | MISSING | R1: regression lock (L1345, L1464) freezes shipped rolls, which is different. |
| `R2-academic-pcg.md:684` | Y | Rhythm of the rhythm (compound patterns) and designed cadence kinds at each seam, counted by the gate. | PARTIAL §Design L1120-1121; §bursts L390-392: rhythm patterns per node and bursts alternate; seams are one join type (L278-279) |  |
| `R2-academic-pcg.md:689` | Y | Quality-diversity selection: best roll per niche; ask for empty cells; blocklisted cells become piece-list items. | PARTIAL §CP3 L259; §New art L586: gaps become piece or picture lists; no niche grid or QD selection | 16 rolls are a test sample, not a selection. |
| `R2-academic-pcg.md:694` | Y | Compression distance of kind strings across different stages of one world. | PARTIAL §variety gate L41; §feel check L1042-1044: neighbour idea share and feel compare only; no whole-world kind-string distance | R5 for the gap: the direct "one stage played six times?" test. |
| `R2-academic-pcg.md:697` | Y | Play-test protocol: play several levels from one generator; four-choice answer. | PARTIAL §CP4 L1092-1093; §CP5 L1107-1108: side by side against the old stage; no several-in-order play, no four-choice answer |  |
| `R2-academic-pcg.md:700` | Y | A jump's difficulty is its spatial and temporal window, free from the tracer. | PARTIAL §Easy rise cap L183-186; §difficulty dial L640, L647: gap share and flick-ms floors; no per-jump landing-window number feeding pacing |  |
| `R2-academic-pcg.md:704` | Y | Seed the search with nodes that already passed QA. | MISSING | R1: spec has no search to seed; old 1-1 is used only for thresholds (L30-31). |
| `R2-academic-pcg.md:707` | Y | Place take-offs on the stage tune's own note onsets, so each stage's rhythm differs with its tune. | CONTRADICTED L1120: "Rhythm: the player's rhythm, not the song (Matt, 11-04)" | R3: would give each stage a distinct rhythm for free; Matt's call stands. |
| `R2-academic-pcg.md:719` | N | Bibliography: Launchpad, IEEE TCIAIG 3(1), 2011. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:729` | N | Bibliography: Withington & Tokarchuk, The Right Variety, FDG 2023. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:733` | N | Bibliography: Shaker et al., 2010 Mario AI Championship level generation track. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:736` | N | Bibliography: Horn et al., comparative evaluation of Mario AI generators, FDG 2014. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:738` | N | Bibliography: Smith & Mateas, answer set programming for PCG, TCIAIG 2011. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:740` | N | Bibliography: Mawhorter & Mateas, occupancy-regulated extension, CIG 2010. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:743` | N | Bibliography: PCG book chapter 3, constructive generation methods. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:745` | N | Bibliography: PCG book chapter 5, grammars and L-systems. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:748` | N | Bibliography: Summerville et al., PCG via machine learning, 2018. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:750` | N | Bibliography: Cooper, Sturgeon-MKIII, FDG 2023. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:753` | N | Bibliography: Sarkar & Cooper, quality-diversity in a VAE latent space, 2021. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:755` | N | Bibliography: Vanparijs, music-driven auto-runner levels, MSc 2022. | n/a: bibliography entry |  |
| `R2-academic-pcg.md:757` | N | Bibliography: On the Evaluation of Procedural Level Generation Systems, arXiv 2024. | n/a: bibliography entry |  |

### reference/research/engine-2026-11-05/R3-fun-by-math.md
60 rows: used 6, partial 12, missing 7, contradicted 1, n/a 34

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `R3-fun-by-math.md:16` | N | Planned time, about 75 minutes | n/a: researcher's time log (process) | header-ish table row |
| `R3-fun-by-math.md:17` | N | Start time of the research session | n/a: researcher's time log (process) | header-ish table row |
| `R3-fun-by-math.md:18` | N | Finish time of the research session | n/a: researcher's time log (process) | header-ish table row |
| `R3-fun-by-math.md:19` | N | Actual time about 44 minutes; bot passes ran fast | n/a: researcher's time log (process) | header-ish table row |
| `R3-fun-by-math.md:20` | N | Where the time went: reading 26 sources, scripts, writing | n/a: researcher's time log (process) | header-ish table row |
| `R3-fun-by-math.md:21` | N | Not done: Glicko-2 stage rating, Celeste jump buffer, knob-elasticity table | n/a: list of unfinished work; the ideas themselves are traced at L601 and L615 | Glicko and elasticities: both MISSING from spec |
| `R3-fun-by-math.md:220` | N | Celeste coyote time is 100 ms; ours 133 ms Normal, 167 ms Easy | n/a: player-physics feel constant, not stage generation | spec never states coyote; level check owns reach |
| `R3-fun-by-math.md:221` | N | Variable jump: Celeste holds speed 0.2 s; ours caps rise at release | n/a: player-physics feel constant |  |
| `R3-fun-by-math.md:222` | N | Apex hang: Celeste half gravity 27% of airtime; ours 0.72 gravity 18% | n/a: player-physics feel constant |  |
| `R3-fun-by-math.md:223` | Y | Standard jump unit: Pokey rises 103 px (2.15 bodies), carries 185 px at full run | §The variety gate L37, §Planner's amendments L1152 | spec's road-gap unit is a Normal flat jump 180 px (157-185 px from PLAN), matching R3's 185 px |
| `R3-fun-by-math.md:224` | N | Input buffers elsewhere: Mario 1-2 frames, Braid 0.23 s; ours 0.133/0.2 s | n/a: input-feel constant |  |
| `R3-fun-by-math.md:265` | Y | Fixed 1.0 s rest pad splits every phrase; a rest must be relative to local beat (2x median interval) | CONTRADICTED L799: spec lays Gemini's fixed 1.0-1.2 s Normal rest pad and judges 'longest run without a rest' (L800, L901) on it; R3 shows such a pad is no longer than an in-burst interval (1.33 s; spec's own 0.80/s = 1.25 s) | relative group boundary never adopted; Normal pacing passes rest on the boundary R3 says cannot see phrases |
| `R3-fun-by-math.md:272` | Y | Normal plays at Easy density; Easy same tempo as Normal; density and difficulty are separate dials | §Rests and breathers L505,L496,L508; §Easy rulings L801-803 | spec cites 'R3 W2': Easy fewer moves a second, not wider gaps; Normal busier density accepted |
| `R3-fun-by-math.md:285` | Y | Tools disagree on what a double jump is; doubles counted as singles in move strings | PARTIAL §How a stage is made L1055, §Planner's amendments L1137: jumps judged single-before/double-after teach and one jump model; no single 'needs a double' rule across tracer, inspector and move counts | ladder counts double as a need (L1536) |
| `R3-fun-by-math.md:294` | Y | Per-jump survival floors do not bound a stage; gate the stage sum E[lives] | §The difficulty dial L644,L651 | both kept: stage E[lives] budget plus per-jump floors; no E[lives] check found in /home/user/mix code (grep) |
| `R3-fun-by-math.md:300` | Y | Easy can be harder than Normal on bots; a 6% kid jump costs only retries, unseen | PARTIAL §Easy's rise cap L178-184, §The difficulty dial L644: Easy rise/gap caps soften that jump shape; no check that Easy is never harder than Normal, free-retry misses uncounted | E[lives] counts lives only |
| `R3-fun-by-math.md:305` | Y | Adult bot thumb (30 ms) steadier than any measured human (36-61 ms); use about 45 ms | MISSING | R2: bots overrate passes, so difficulty lines read easy; affects difficulty calibration, not cross-stage sameness |
| `R3-fun-by-math.md:311` | Y | Gemini notes misstate Smith's leniency and linearity; D_sim<0.35 has no source | MISSING | R1: spec uses none of these metrics, so nothing rests on the error; correction simply not carried |
| `R3-fun-by-math.md:317` | N | Celeste coyote is 100 ms, not Gemini's 83 ms | n/a: physics-feel correction to Gemini notes |  |
| `R3-fun-by-math.md:321` | N | Ledger says no apex hang; physics.ts has one (0.72) | n/a: physics-feel correction to ledger |  |
| `R3-fun-by-math.md:325` | Y | Three different dead-walk limits: 4 s, 2.0/3.0 s, code 2.5 s | PARTIAL §Rests and breathers L510: spec adopts the code's 2.5 s for both settings; STAGE-RULES' 4 s and 2.0/3.0 s lines not retired | one number in spec at least |
| `R3-fun-by-math.md:329` | Y | Move-order cosine sits at floor; Matt's sameness lives in tempo, leniency and look | §The variety gate L32-41; §How a stage is made L1037-1043; §Stage profile L1218,L1226 | spec gates pieces (share, run, new, neighbours) plus per-stage tempo and look and a neighbour feel check; leniency not compared |
| `R3-fun-by-math.md:337` | Y | 1-1 and 1-4 barely change between rolls (2 and 7 distinct strings of 16) | PARTIAL §CP3 design L336-337: decks and shuffle bags make rolls differ; no roll-to-roll distance or distinct-roll count gate | 16 rolls each judged against old 1-1, never against each other |
| `R3-fun-by-math.md:342` | Y | Jump bots and first-timer bot disagree on hard stages; no check combines them | PARTIAL §The difficulty dial L644, §CP3 READY L906-908: both bots run (floors, shrine 4/4) but no combined difficulty number; 'bots judge it' names no bot |  |
| `R3-fun-by-math.md:348` | Y | 'Groups of 5-20 s then a rest' never measured; 8 of 9 stages have 20 s+ phrases | PARTIAL §Rests and breathers L509, §Easy rulings L800,L816: Easy run capped 20 s, Normal at main's 29 s (over 20 s); no 5 s group floor; fixed-pad boundary |  |
| `R3-fun-by-math.md:595` | Y | Stage survival budget E[lives]=sum(1-s_i) from bots, ramped world by world | §The difficulty dial L644; §CP3 rulings L435; L658 | numbers differ from R3's (see notes c); not in mixer code |
| `R3-fun-by-math.md:597` | Y | Teach, first test and practice at different success targets: 0.97 / 0.85 / 0.95 | PARTIAL §The difficulty dial L652: teach at miss <=0.01 (stricter); no first-test 0.85 or practice 0.95 target; per-jump floors 70%/85% instead (L651) |  |
| `R3-fun-by-math.md:599` | Y | Simulated player population (skill, persistence, boredom, learning): share who quit per stage | MISSING | R2: finds where players leave (one 6% jump loses 45% of Easy players); difficulty, not repetition |
| `R3-fun-by-math.md:601` | Y | Rate stages like chess players (Glicko-2, phantom matches) to get world difficulty bands | MISSING | R2: would set each world's real difficulty spread; spec's dial is a formula not checked against measured stage ratings |
| `R3-fun-by-math.md:603` | Y | Frustration meter: first-timer stuck share gated per setting (<=0.05 Easy, <=0.10 Normal) | PARTIAL §CP3 rulings L433, §Easy rulings L804-805: bot loops and fork stalls fixed case by case; no stuck-share line per setting | tools/engine/cp4-stuck.ts prints stuck spots, no gate |
| `R3-fun-by-math.md:605` | Y | Flow share: windows where challenge and success are above the stage's own mean; flat stage scores zero | PARTIAL §The difficulty dial L655, §CP3 design L339-351: node jobs (warm-up, teach, test, twist, master) shape intensity; no measured flow share | R3: a flat stage scoring zero is the D26 'all the same' complaint as a formula |
| `R3-fun-by-math.md:607` | Y | Novelty band [L,U] from Matt's favourites, not just a similarity cap; too new = odd connections | PARTIAL §The variety gate L35, §Length from short bursts L397, §CP3 L263: a novelty floor (new every 572 px) and coherence by Matt's eye; no upper bound or measured band |  |
| `R3-fun-by-math.md:609` | Y | Length-calibrated NCD: self 0.09, shuffle 0.62 at our lengths; judge inside that range | MISSING | R2: the only roll-to-roll and stage-to-stage sequence distance R3 calibrates; spec has no sequence distance at all |
| `R3-fun-by-math.md:610` | Y | Rhythm regularity by nPVI (regular <20, swing 45-75) and a relative group boundary | PARTIAL §Design L1120-1121: each node draws a rhythm type (regular, swing, broken, wait-and-go); no nPVI check, no relative boundary | rhythm type is drawn but never measured, so 'one tempo' can return unseen |
| `R3-fun-by-math.md:611` | Y | Rank, don't rate: Matt picks A or B; Kendall tau tells which formula predicts him | PARTIAL §CP5 L1107, §CP4 1-1 L1092: side-by-side picks used; no Kendall tau of the gate formulas against Matt's ranking |  |
| `R3-fun-by-math.md:613` | Y | Cause-chain moves (shell kick) were the strongest fun correlate; boa roll is ours | §CP2 L109 | spec cites R3 F10 for the turtle line; boa and turtle held until taught (L212-221, L524) |
| `R3-fun-by-math.md:615` | Y | Knob elasticities: measured change in bot success per px or speed unit, hit targets by arithmetic | MISSING | R2: dial values are estimates (L635); elasticities would let each stage hit distinct targets, but not variety itself |
| `R3-fun-by-math.md:617` | Y | Bot timing error should worsen with hazard speed (Isaksen 35.9 to 61.1 ms) | MISSING | R1: bot realism for moving hazards; spec scales timed windows (L647) without speed-dependent bot error |
| `R3-fun-by-math.md:625` | N | Launchpad rhythm generator (Smith et al. 2011) | n/a: source citation | 5-20 s groups echoed in spec L509 |
| `R3-fun-by-math.md:627` | N | Smith dissertation 2012 (leniency, linearity, rhythm) | n/a: source citation |  |
| `R3-fun-by-math.md:630` | N | Horn et al. 2014 generator comparison (NCD, expressive range) | n/a: source citation |  |
| `R3-fun-by-math.md:632` | N | Pedersen et al. 2009 Mario player experience | n/a: source citation | shell-kick fun correlate cited in spec L109 |
| `R3-fun-by-math.md:636` | N | Isaksen et al. 2015 survival analysis | n/a: source citation | basis of E[lives], spec L644 |
| `R3-fun-by-math.md:638` | N | Wilson et al. 2019 85% rule | n/a: source citation |  |
| `R3-fun-by-math.md:640` | N | Roohi et al. 2020 Rovio difficulty and churn | n/a: source citation |  |
| `R3-fun-by-math.md:642` | N | Gudmundsson et al. 2018 King human-like playtesting | n/a: source citation |  |
| `R3-fun-by-math.md:645` | N | Kristensen 2022 thesis, Tactile | n/a: source citation |  |
| `R3-fun-by-math.md:647` | N | Sarkar & Cooper Glicko difficulty curves | n/a: source citation |  |
| `R3-fun-by-math.md:649` | N | Lomas et al. 2013 easier is played longer | n/a: source citation |  |
| `R3-fun-by-math.md:653` | N | Nakamura & Csikszentmihalyi 2002 flow | n/a: source citation |  |
| `R3-fun-by-math.md:656` | N | Swink 2007 Game Feel | n/a: source citation |  |
| `R3-fun-by-math.md:659` | N | Celeste player source code | n/a: source citation |  |
| `R3-fun-by-math.md:665` | N | Shu et al. 2021 experience-driven PCG novelty band | n/a: source citation |  |
| `R3-fun-by-math.md:668` | N | Yannakakis & Martinez 2015 ratings are overrated | n/a: source citation |  |
| `R3-fun-by-math.md:670` | N | Yannakakis & Togelius lecture deck | n/a: source citation |  |
| `R3-fun-by-math.md:672` | N | Patel & Daniele 2003 nPVI | n/a: source citation |  |
| `R3-fun-by-math.md:674` | N | PaceMaker 2024 pacing tool | n/a: source citation |  |
| `R3-fun-by-math.md:676` | N | Linehan et al. 2014 learning curves (abstract) | n/a: source citation |  |
| `R3-fun-by-math.md:678` | N | Yannakakis & Togelius 2011 EDPCG (abstract) | n/a: source citation |  |
| `R3-fun-by-math.md:681` | N | Shaker et al. 2011 Mario AI level track | n/a: source citation |  |

### reference/research/engine-2026-11-05/R4-mobile-and-architecture.md
25 rows: used 4, partial 9, missing 6, contradicted 0, n/a 6

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `R4-mobile-and-architecture.md:13` | N | Planned time about 75 minutes | n/a: researcher's time log (process) | header-ish table row |
| `R4-mobile-and-architecture.md:14` | N | Start time | n/a: researcher's time log (process) | header-ish table row |
| `R4-mobile-and-architecture.md:15` | N | Finish time, 34 minutes actual | n/a: researcher's time log (process) | header-ish table row |
| `R4-mobile-and-architecture.md:16` | N | 65 sources opened, 8 failed | n/a: researcher's time log (process) | header-ish table row |
| `R4-mobile-and-architecture.md:17` | N | Code files read | n/a: researcher's time log (process) | header-ish table row |
| `R4-mobile-and-architecture.md:18` | N | What was run: fun gate, timings, rejection report, survival estimate | n/a: researcher's time log (process) | header-ish table row |
| `R4-mobile-and-architecture.md:28` | Y | Traced jumps carry ~no risk; difficulty must be placed on purpose; need a risk budget per node | PARTIAL §The difficulty dial L643-644, §Placement rules L290: risky pieces per burst and a stage E[lives]; no per-node expected falls from a human-measured timing model | spec does place risk on purpose via the dial |
| `R4-mobile-and-architecture.md:40` | Y | Generator must report why it rejects rolls, by rule; 94% of 1-2's tries one rule | PARTIAL §Planner's amendments L1137-1139, §CP3 mix rule L259: shared predicate, 'can't reach' rejections = 0, failures name the missing piece; no per-rule tally or never-laid-option gate |  |
| `R4-mobile-and-architecture.md:51` | Y | Variety at scale from many small authored pieces, themed pools, any piece fits any neighbour | §CP2 shared library L122-134; §Placement rules L278-283; §The log family L556-560; §The ground and perch family L594 | joins as a small edge set = Wang-edge idea; never-shipped sections not gated |
| `R4-mobile-and-architecture.md:65` | Y | Phone games reuse a level 2-3 times with a different goal, said plainly; disguised reuse fails | PARTIAL §The goal L360-361, §CP3 rulings L826-828: the second fork road's marks are the replay reward; no same-ground second-goal mode (carvings set, no-fall run) |  |
| `R4-mobile-and-architecture.md:76` | Y | One input, many verbs: the level gives the move; a new mechanic per batch; touch rules belong to the level | PARTIAL §move ladder L112-116, §The whole-game plan B L1495, §Stage profile L1220: verbs come from pieces and one new move per stage; touch rules absent from profile |  |
| `R4-mobile-and-architecture.md:87` | Y | Test pyramid: many fast tests, few stage tests, quarantine flaky ones; proposer untested | PARTIAL §Planner's amendments L1136-1139: one jump model removes proposer drift; no sub-second per-node test tier or flaky-gate policy |  |
| `R4-mobile-and-architecture.md:98` | Y | Calibrate bot noise on real recordings (King's regression) before trusting bot numbers | MISSING | R2: expected falls swing 0.0-1.6 on bot noise alone; every bot-judged line (L644, L651) rests on Gemini's guessed noise |
| `R4-mobile-and-architecture.md:107` | Y | Level data small, schema'd, separate from the code that reads it | §Engine first: the stage-profile format L1202-1231; §Element table L1235-1259; §The whole-game plan L1460 | profile, element table, worlds.ts and ladder.ts as data |
| `R4-mobile-and-architecture.md:547` | Y | Rejection report plus coverage gate: fail if one rule eats >half the tries or an option is laid 0 times | PARTIAL §Planner's amendments L1137-1139, §CP2 L141-142: can't-reach = 0 and unused art feeds the library; no gate that shipped rolls actually lay every option | coverage half fights repetition: authored pieces never laid (28 of 80 W8 sections) |
| `R4-mobile-and-architecture.md:551` | Y | One reach predicate shared by proposer and verifier, with a property test | §Planner's amendments L1136-1139; §CP3 rulings L369 | property test over every option not stated |
| `R4-mobile-and-architecture.md:555` | Y | Expected falls per node as a design target: intro 0, spike 0.2-0.4, climax 0.3-0.6 | PARTIAL §The difficulty dial L643,L652,L655: teach <=0.01 miss, rest/teach 0 risky pieces, test above warm-up; no numeric expected falls per node |  |
| `R4-mobile-and-architecture.md:559` | Y | Fit first-timer thumb and hold to testers' recorded touches; report the fit | MISSING | R2: bot-derived goals and floors rest on guessed noise; calibration, not variety |
| `R4-mobile-and-architecture.md:563` | Y | Touch rules (gesture constants, FORGIVE) pinned into each roll's manifest; a control tweak is a level change | MISSING | R1: protects tuned stages from control drift; no profile field for it (L1208-1230) |
| `R4-mobile-and-architecture.md:567` | Y | Plot where the bots end: one strip image per stage of death and stall x | MISSING | R1: debug aid; tools/engine/cp3-stuck.ts, cp4-stuck.ts print stuck x by idea as text, spec never names it |
| `R4-mobile-and-architecture.md:570` | Y | Layer-locked rerolls (keep nodes, reroll steps; keep steps, reroll surfaces) via per-node RNG streams | MISSING | R2: shows what each layer adds to variety; code already has per-node streams (w1mix.ts:26-27, :939), spec silent, no reroll switch |
| `R4-mobile-and-architecture.md:574` | Y | Same ground, second goal, said plainly (colour coins, Invasion, three fixed goals) | PARTIAL §The goal L360-361: second road's marks as replay reward; no second-goal pass over a beaten roll |  |
| `R4-mobile-and-architecture.md:577` | Y | Themed pools per stage (two hazards, one surface family), not one grab bag | §CP3 design L336-337; §Matt's three L1373-1380; §shared library L128-132 | decks per node, core pieces >=50% of landings, theme picks art family |
| `R4-mobile-and-architecture.md:580` | Y | Flaky-gate policy: retry once, weekly top-failing list, quarantine with owner and deadline | MISSING | R1: CI hygiene; spec only has a shrinking known list (L1619) |
| `R4-mobile-and-architecture.md:583` | Y | Readable stage catalog per layout checked in and diffed in CI (Brogue seed catalog) | PARTIAL §1-5's crumbling ledges ruling L1345, §The whole-game plan L1464: regression lock by fingerprint (hash, tools/engine/snapshot.ts); no readable per-layout catalog diff |  |

### reference/GEMINI-PCG-RESEARCH.md
76 rows: used 16, partial 33, missing 11, contradicted 2, n/a 14

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `GEMINI-PCG-RESEARCH.md:8` | Y | Offline seed curation: generate many layouts per stage, score them, ship the best | MISSING | R2: spec instead requires every one of 16 rolls to pass and forbids rerolls (L259); curating for spread would trim repeats only a little. |
| `GEMINI-PCG-RESEARCH.md:9` | Y | Dead-time limit about 2 s Normal / 3 s Easy; only jumps, timing, puzzles count; petal arc half; short rest after each burst | PARTIAL §Rests and breathers L498,L510,L752: one 2.5 s line for both settings, not 2 s Normal / 3 s Easy | L510 calls 2.5 s "the fun gate's own"; pacing.ts TARGETS idle are 3.0 Easy / 2.0 Normal. |
| `GEMINI-PCG-RESEARCH.md:11` | Y | Sameness: weighted action strings; compare every 20 s stretch against the world's other stages; reject repeats | MISSING | R5: spec compares only idea/piece share and unthresholded feel stats between neighbours (L41,L133,L1042); action windows only inside one stage (L492). |
| `GEMINI-PCG-RESEARCH.md:12` | Y | Noisy-thumb bots (drift, late lift-off, short flicks, thumb switch) find death hotspots; kid latency N(+90,65 ms) | §CP2 animal rulings L213-221,L227; §difficulty dial L644,L651; §P3 L1135 | tools/engine cp3-ft.ts and cp4-ft.ts run tools/inspect/firsttimer.ts. |
| `GEMINI-PCG-RESEARCH.md:14` | Y | First-lesson rooms: no enemies, no deadly fall, can't be skipped, the room shows the idea by itself first | PARTIAL §CP2 L218,L228; §CP3 design L342; §dial L652; L739: zero-risk teach kept; "can't be skipped" and self-demonstration absent |  |
| `GEMINI-PCG-RESEARCH.md:15` | Y | Expressive range: roll ~200 per stage, score linearity, leniency, density, path, action mix; check rolls differ (diversity at least 0.35) | MISSING | R4: 16 rolls each judged against old 1-1 floors; nothing checks rolls differ from each other; tools/inspect/era.ts unused by tools/engine. |
| `GEMINI-PCG-RESEARCH.md:18` | N | Touch jump forgiveness at 30 fps: coyote 133/167 ms, buffer 133/200 ms, ledge forgiveness, corner correction | n/a: runtime player physics (physics.ts FORGIVE, already in game), not stage generation | The level check and bots run on this physics. |
| `GEMINI-PCG-RESEARCH.md:20` | Y | Puzzle rooms: parts relative to platforms; 1-2 steps Easy, 2-3 Normal; stuck detection; short hints; narrow tall rooms; camera lean | MISSING | R1: push block deferred to a wrapped puzzle room in CP4 (L376); spec carries none of the room rules. |
| `GEMINI-PCG-RESEARCH.md:23` | Y | Variety cooldown: the same piece not used twice within two stages or twice in a world run | PARTIAL §variety gate L41; §shared library L133; §CP3 L242,L391: neighbours may share up to half their ideas; no two-stage or world-run memory |  |
| `GEMINI-PCG-RESEARCH.md:33` | Y | Kishotenketsu: introduce a mechanic safely, develop it, twist it, end with a mastery climax | §move ladder L119; §placement rule 3 L297; §CP3 design L339-351; §CP4 1-1 L1063-1075 | Node jobs teach/test/twist/master. |
| `GEMINI-PCG-RESEARCH.md:39` | Y | Platforms rooted in biome logic; each level one focal twist that never overstays; one signature level per world | §element table L1235-1259; §polish P-2 L692; §stage profile L1213,L1222; §B L1497 | `moment` and `owns` fields; special stages kept. |
| `GEMINI-PCG-RESEARCH.md:43` | Y | Celeste: screen readable within 2 s; every 5-10 s burst bookended by a flat safe rest | PARTIAL §placement rule 5 L313-319; §Rests L503,L799: rests set; 2-second sight-readability not measured |  |
| `GEMINI-PCG-RESEARCH.md:47` | Y | Spelunky solution path of templates matching exits with rolled sub-blocks; Dead Cells concept graph before rooms | §CP3 mix rule L235-251; §CP3 design L336-337 | Node sequence with entry/exit; decks; sizes rolled inside the idea. |
| `GEMINI-PCG-RESEARCH.md:52` | N | Engine choice (Godot/Unity) and mobile runtime performance: build in loading, merged colliders, pooling | n/a: engine platform and runtime performance, not stage generation |  |
| `GEMINI-PCG-RESEARCH.md:57` | Y | Shuffle bags for chunks/props; Poisson minimum and maximum spacing; parametric sockets | PARTIAL §CP3 mix rule L249-250; §CP3 design L336: bags used; no same-kind minimum spacing beyond view caps (L313-317) and mushroom cap (L454) |  |
| `GEMINI-PCG-RESEARCH.md:64` | Y | Guarantee solvability: kinematic reach with a margin, then a path search using only unlocked moves | §P4 L1137-1139; §variety gate L39; L906; §CP4 L1055; §E gates L1614 | Margin values differ: see row 105. |
| `GEMINI-PCG-RESEARCH.md:84` | Y | Rhythm groups measured in time; sawtooth tension curve over chunks; props spawned as linked pairs | PARTIAL §Rests L490-511; §CP3 design L339-351; §Design L1120: bursts and rests set; no per-node tension target, only the fun gate's flag (L494); no linked props |  |
| `GEMINI-PCG-RESEARCH.md:97` | Y | Difficulty D(W,L) per stage; a world's first level a little below the last world's end; Easy modifier | PARTIAL §difficulty dial L626-633,L638-656: formula and Easy columns; drop goes to previous world's middle, not "slightly below the end" |  |
| `GEMINI-PCG-RESEARCH.md:105` | Y | Jump distance margin: Easy at most 65%, Normal at most 82% of the physical jump limit | CONTRADICTED L640: Normal 0.55→0.92 of jumpOK's limit (0.97 x reach) passes 0.82 of reach beyond d about 0.80 (about 9-4 on) | Easy uses heldMaxGap (70% hold) as base, so not directly comparable. |
| `GEMINI-PCG-RESEARCH.md:106` | Y | Easy: landing pads two tiles wider than Normal | §difficulty dial L642; §ruling A L796 | Easy 260→150 vs Normal 220→110 px; Easy bands about 300 px. |
| `GEMINI-PCG-RESEARCH.md:107` | Y | Easy: bottomless pits replaced with bounce nets or one-heart water/vine rescue | PARTIAL §CP3 miss ruling 5 L437: only fork-road slips are free on Easy; Easy keeps life-costing risk pieces (L643-644) |  |
| `GEMINI-PCG-RESEARCH.md:108` | Y | Easy: 60% enemy budget, slower patrols and projectiles | §difficulty dial L645,L647 | Easy animals 0-1→3 vs Normal 0-1→4-5; timed windows x1.15→x0.9. |
| `GEMINI-PCG-RESEARCH.md:109` | Y | Quotas: Easy one-step puzzles and 70% collection; Normal multi-step and 100% | PARTIAL §marks L360,L462: marks goal 10/13 Normal, 8/13 Easy; no puzzle-step rule | Normal 77% vs research 100%; Easy 62% vs 70%. |
| `GEMINI-PCG-RESEARCH.md:110` | N | Coyote and jump buffer: Easy 180/180 ms, Normal 100/120 ms | n/a: runtime physics; conflicts with research's own L304-305 (133/167, 133/200), which the game uses |  |
| `GEMINI-PCG-RESEARCH.md:111` | Y | World Director: 9-card mission deck, each stage a distinct archetype with its own graph and win condition | PARTIAL §stage profile L1213-1224; L354: per-stage story, moment, unlike; no per-world set of distinct stage archetypes or win conditions | Strongest stage-type lever against repetition across a world. |
| `GEMINI-PCG-RESEARCH.md:115` | Y | Level 1 onboarding: linear, safe lower paths; introduces the world's new move and creature safely | PARTIAL §CP4 1-1 L937-944; §move ladder L1278-1299: 1-1 onboards; no rule that each world's first stage teaches its move |  |
| `GEMINI-PCG-RESEARCH.md:116` | Y | Level 2 collection quest: multi-tier layout with N target items across micro-branches | PARTIAL §marks L354-361; §stage profile L1228: 1-5 relic hunt from stagePlan; no collection-stage archetype rule |  |
| `GEMINI-PCG-RESEARCH.md:117` | Y | Level 3 puzzle: gated rooms with lock-and-key or switch-and-door dependency graphs | PARTIAL §CP3 rulings L375-377: push block deferred to a puzzle room in CP4; no gated-room graph |  |
| `GEMINI-PCG-RESEARCH.md:118` | Y | Level 4 combat/gauntlet: arena chunks between traversal; gates lock until creatures cleared or bypassed | MISSING | R3: a combat-shaped stage would vary stage types; spec has only an "animal on the path" idea (L107) and an animal count (L645). |
| `GEMINI-PCG-RESEARCH.md:119` | Y | Level 5 world-unique signature level with its own directional generator rule | §whole-game plan L1462; §B L1497-1506 | Special stages kept as built, not generated. |
| `GEMINI-PCG-RESEARCH.md:120` | Y | Level 6 rescue: side chambers with caged critters guarded by puzzles or elites | PARTIAL §B L1498: cage stages 2-3 and 2-8 kept as built; no rescue archetype for the engine |  |
| `GEMINI-PCG-RESEARCH.md:121` | Y | Level 7 vertical/precision traversal: vertical camera bias; climbing or wind riding masters the world move | PARTIAL §stage profile L1214; §CP4 L944: arc trend set; no vertical stage slot or camera bias |  |
| `GEMINI-PCG-RESEARCH.md:122` | Y | Level 8 hybrid puzzle-combat: world props used against creatures | PARTIAL §move ladder L1321; §C L1569-1583: joins two moves per world; no prop-plus-creature beat |  |
| `GEMINI-PCG-RESEARCH.md:123` | Y | Level 9 mastery gauntlet testing every prop, enemy and move of the world before the finale | MISSING | R3: "master" is a node job inside a stage (L350); no world-closing synthesis stage. |
| `GEMINI-PCG-RESEARCH.md:124` | Y | Level 10 hardcoded finale: handcrafted boss battle or set-piece escape | §whole-game plan L1462; §B L1497-1506 | Lairs kept as built. |
| `GEMINI-PCG-RESEARCH.md:126` | Y | Data formats: world manifest (moves, prop pairs, creatures by terrain) and chunk templates (connectors, phase, difficulty, sockets) | §stage profile L1208-1233; §element table L1235-1259; §B L1495; §labels L1391-1406 |  |
| `GEMINI-PCG-RESEARCH.md:177` | Y | Six-pass pipeline: budget, mission graph, chunk stitching with history cooldown, sockets, validate with local repair, dress | PARTIAL §CP3 mix rule L232-259; §dial L626; §polish L686-733: no local repair, a failing node fails "never a reroll" (L259); no chunk history cooldown |  |
| `GEMINI-PCG-RESEARCH.md:226` | Y | Puzzle validation by causal graphs and pre-validated rooms with symbolic zones; softlock respawn | PARTIAL §CP3 rulings L375-377: relies on wrapping push block as the shipped puzzle room; no puzzle check or softlock rule stated |  |
| `GEMINI-PCG-RESEARCH.md:240` | Y | Few templates suffice: 28-35 chunks per world plus sub-blocks, probabilistic props, mirroring, 3 connector heights, cooldown | PARTIAL §CP2 L92; L208; §placement rule 1 L278: join heights and rolled sizes kept; no per-world library size target, no mirroring |  |
| `GEMINI-PCG-RESEARCH.md:257` | Y | Expressive range analysis: many headless rolls scored and plotted; reject a level with D_sim under 0.35 to any same-world level | MISSING | R4: spec scores 16 rolls against floors, never spread or same-world distance; era.ts not used. |
| `GEMINI-PCG-RESEARCH.md:277` | Y | Launchpad rhythm groups: timed bursts with rest pads; inject a beat when idle too long; force rest after bursts | §CP3 length ruling L390-392; §Rests L490-511; ruling B L799; §Design L1120 |  |
| `GEMINI-PCG-RESEARCH.md:290` | Y | Action density: Easy 0.35-0.55, Normal 0.75-1.15, chase 1.10-1.40 actions a second | CONTRADICTED L889-892: Easy line moved to the old 1-1's range, 1-5 accepted at 0.61/0.63; Normal not judged on density (L801-803) | Easy 0.35-0.55 was the line first (L508,L797). |
| `GEMINI-PCG-RESEARCH.md:291` | Y | Max eventless walk: Easy 3.0 s, Normal 2.0 s, chase 1.2 s | PARTIAL §Rests L510: one 2.5 s line for both; Normal 2.0 s and chase 1.2 s not used |  |
| `GEMINI-PCG-RESEARCH.md:292` | Y | Rhythm group length: Easy 6-8 s (3-4 actions), Normal 10-14 s (8-12 actions), chase 15-20 s | PARTIAL §Rests L497,L509; ruling B L800: caps longest run (Easy 20 s, Normal 29 s), not group length; bursts 4-6 pieces (L390) |  |
| `GEMINI-PCG-RESEARCH.md:293` | Y | Rest pads between bursts: Easy 2.0-2.5 s, Normal 1.0-1.2 s, chase 0.8 s | PARTIAL §Rests L503; ruling B L799: Normal pad only after every second burst; chase value absent | Easy 2-3 s between nodes; 4-5 s rests (L752). |
| `GEMINI-PCG-RESEARCH.md:294` | N | Touch controls at 30 fps: forgiveness values (section header) | n/a: runtime player physics, built in game (ledger G1-G5) |  |
| `GEMINI-PCG-RESEARCH.md:304` | N | Coyote time 133 ms Normal / 167 ms Easy, timed in ms not frames | n/a: runtime physics (physics.ts FORGIVE) |  |
| `GEMINI-PCG-RESEARCH.md:305` | N | Jump buffer 133 ms Normal / 200 ms Easy | n/a: runtime physics (FORGIVE.buffer) |  |
| `GEMINI-PCG-RESEARCH.md:306` | N | Ledge-landing forgiveness about 8 px Normal / 12 px Easy | n/a: runtime physics (FORGIVE.landPx) |  |
| `GEMINI-PCG-RESEARCH.md:307` | N | Head-bonk nudge and shin mantle so a jump into a face carries over its lip | n/a: runtime physics (engine.ts stepHelp) |  |
| `GEMINI-PCG-RESEARCH.md:308` | N | Pickup and lever magnet 1.25x Normal / 1.6x Easy | n/a: interaction runtime, not stage generation |  |
| `GEMINI-PCG-RESEARCH.md:311` | Y | Teaching: first appearance never left to random; slot-1 teach node; zero lethal, unskippable, self-demonstrating, source and receptor co-visible | PARTIAL §CP2 L218; §CP3 L247-248; L739; §dial L652; §ladder L1446-1448: teach-first and safety kept; mandatory gate, micro-cue and 8-tile co-visibility absent |  |
| `GEMINI-PCG-RESEARCH.md:324` | Y | Story in procedural games: anchor rooms at stage start and end, landmark chunks, three visual sub-acts per world | PARTIAL §CP3 mix rule L233; §stage profile L1226-1229; L997: per-stage anchors and light; no world sub-act progression |  |
| `GEMINI-PCG-RESEARCH.md:338` | Y | Pre-flight difficulty: score each jump by distance, landing tightness, timing overlap; then noisy-bot runs | §difficulty dial L638-656 | Gap share, landing width, timed windows; E[lives] judged by bots. |
| `GEMINI-PCG-RESEARCH.md:368` | Y | Noisy-bot survival per jump edge: Easy at least 85%; Normal at least 70% Worlds 1-5, 50% Worlds 6-10 | §difficulty dial L651; L906 | Identical numbers. |
| `GEMINI-PCG-RESEARCH.md:369` | Y | Minimum input window: Easy at least 300 ms, Normal at least 167 ms | PARTIAL §Easy rise cap L183-186: Easy 300 ms used in CP2 traces; Normal 167 ms and a standing gate absent (L650-653) |  |
| `GEMINI-PCG-RESEARCH.md:370` | Y | Peak consecutive stress per rhythm group: Easy 2.5, Normal 5.5; else insert a rest or checkpoint | PARTIAL §difficulty dial L643: risky pieces per burst (a count), not summed edge risk |  |
| `GEMINI-PCG-RESEARCH.md:371` | Y | Puzzle dependency depth: Easy 1-2 steps, Normal 2-4 | MISSING | R1: no puzzle chains in engine stages yet (L376). |
| `GEMINI-PCG-RESEARCH.md:372` | Y | Backtracking ratio: Easy 1.0-1.25, Normal 1.15-1.60 | PARTIAL §CP3 ruling (i) L826-827: marks placed so no route doubles back; no ratio measured |  |
| `GEMINI-PCG-RESEARCH.md:380` | Y | Free-form pixel chunks: entry/exit anchors, joins from the jump envelope, vertical corridor clamp, surface-bound sockets | §CP3 mix rule L251; §placement rule 1 L278-283; L369; L378; §stage profile L1214 |  |
| `GEMINI-PCG-RESEARCH.md:406` | Y | Action strings: weighted edit distance, 18-beat sliding windows and n-gram cosine to compare levels of different lengths | MISSING | R5: no cross-stage action comparison; only the fun gate's in-stage repeats (L492). |
| `GEMINI-PCG-RESEARCH.md:413` | Y | Token weight: flat walk W 0.2 | PARTIAL §CP3 L262; §Rests L492: inherited inside the fun gate (beats.ts WEIGHT); never stated or used across stages |  |
| `GEMINI-PCG-RESEARCH.md:414` | Y | Token weight: small hop h 0.5 | PARTIAL §CP3 L262; §Rests L492: inherited inside the fun gate (beats.ts WEIGHT); never stated or used across stages |  |
| `GEMINI-PCG-RESEARCH.md:415` | Y | Token weight: precision gap jump J 1.0 | PARTIAL §CP3 L262; §Rests L492: inherited inside the fun gate (beats.ts WEIGHT); never stated or used across stages |  |
| `GEMINI-PCG-RESEARCH.md:416` | Y | Token weight: world traversal (vine, glide, bounce) V 2.0 | PARTIAL §CP3 L262; §Rests L492: inherited inside the fun gate (beats.ts WEIGHT); never stated or used across stages |  |
| `GEMINI-PCG-RESEARCH.md:417` | Y | Token weight: creature dodge, stomp or bait C 2.2 | PARTIAL §CP3 L262; §Rests L492: inherited inside the fun gate (beats.ts WEIGHT); never stated or used across stages |  |
| `GEMINI-PCG-RESEARCH.md:418` | Y | Token weight: carry or throw object P 2.8 | PARTIAL §CP3 L262; §Rests L492: inherited inside the fun gate (beats.ts WEIGHT); never stated or used across stages |  |
| `GEMINI-PCG-RESEARCH.md:419` | Y | Token weight: trigger mechanism (seesaw, winch, shutter) S 3.0 | MISSING | R2: beats.ts WEIGHT has no S letter; engine stages place no mechanisms. |
| `GEMINI-PCG-RESEARCH.md:436` | Y | Touch noisy bot: thumb drift, late lift-off overshoot, 8% short hop, thumb-swap gap | §CP2 L215,L227; §P3 L1135; §dial L651 | Through the first-timer bot, which models these. |
| `GEMINI-PCG-RESEARCH.md:458` | Y | Dead time: only real input actions count as beats; flat petals 0, petal arc over a gap 0.5 | §Rests L498,L510; L752 | "a pad with a petal arc (play, not dead time)". |
| `GEMINI-PCG-RESEARCH.md:470` | N | Puzzles for kids 7-10: step counts, stuck detection, hint timing and wording | n/a: puzzle-room hint and companion UI, not stage mixing (depth is row 371) |  |
| `GEMINI-PCG-RESEARCH.md:496` | N | Framing a puzzle room in portrait without shrinking Pokey (section header) | n/a: camera behaviour |  |
| `GEMINI-PCG-RESEARCH.md:513` | N | Zoom floor 0.72-0.75x and camera weighted toward the active puzzle part | n/a: camera (Matt chose no zoom floor, ledger J1) |  |
| `GEMINI-PCG-RESEARCH.md:518` | Y | Puzzle chunks in a 500 x 750 px diagonal/vertical box that fits both orientations | MISSING | R1: spec lays no puzzle rooms yet (L376). |
| `GEMINI-PCG-RESEARCH.md:522` | N | 0.8 s camera pan to a far gate, or a visible conduit between switch and gate | n/a: camera and puzzle dressing, built in game (ledger J4) |  |
| `GEMINI-PCG-RESEARCH.md:525` | N | Look-ahead peek-drag gesture | n/a: input gesture, decided against |  |

### reference/GEMINI-LEDGER.md
61 rows: used 18, partial 21, missing 6, contradicted 1, n/a 15

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `GEMINI-LEDGER.md:14` | Y | A1 Kishotenketsu per stage (Ki/Sho/Ten/Ketsu), checked by the inspector's tension curve | §move ladder L119; §CP3 design L339-351; L262,L494 | Node jobs; fun gate's "tension flat" cleared. |
| `GEMINI-LEDGER.md:15` | Y | A2 Biome logic: platforms are branches, logs, slabs, never abstract blocks | §polish P-1 L690; P-2 L692; §element table L1235-1259 |  |
| `GEMINI-LEDGER.md:16` | Y | A3 One focal twist per stage; one signature stage per world | §stage profile L1213,L1222; §B L1497 |  |
| `GEMINI-LEDGER.md:17` | Y | A4 Sight-reading in about 2 s; rest pads between 5-10 s bursts | PARTIAL §Rests L503,L799; §placement rule 5 L313-319: rests yes; readability not measured |  |
| `GEMINI-LEDGER.md:18` | Y | A5 Spelunky/Dead Cells templates and rolled sub-blocks; hand stages' rolls 0.87-1.00 alike | §CP3 mix rule L235-251; §CP3 design L336-337 | The alike measure itself is not used on engine stages. |
| `GEMINI-LEDGER.md:19` | Y | A6 Rhythm groups and sawtooth tension curve measured by pacing.ts | §Rests L490-511; §CP3 L262 | tools/engine/cp3-pace16.sh runs the inspector; no per-node tension plan. |
| `GEMINI-LEDGER.md:20` | Y | A7 Linked pairs: never spawn a tool without its receptor nearby | PARTIAL §CP3 rulings L375-377: only via a wrapped puzzle room in CP4; the mixer places no props |  |
| `GEMINI-LEDGER.md:26` | N | B1 Switch to Godot or Unity (decided no) | n/a: engine platform |  |
| `GEMINI-LEDGER.md:27` | N | B2 Build in memory during loading; no mid-play create/destroy; pooling | n/a: runtime performance |  |
| `GEMINI-LEDGER.md:33` | Y | C1 Shuffle bags instead of plain random for pieces and props | §CP3 mix rule L249-250; §CP3 design L336-337 | w1mix.ts draws ideas through a bag. |
| `GEMINI-LEDGER.md:34` | Y | C2 Poisson spacing: minimum gap between same-kind pieces, maximum gap with nothing | PARTIAL §variety lines L397; §placement rule 5 L313-317; L454: maximum via "nothing new" and dead time; no same-kind minimum distance |  |
| `GEMINI-LEDGER.md:35` | Y | C3 Sockets / section versions per stage; 200-roll alike 0.61-0.94 measured | PARTIAL §CP3 design L336-337; L249: decks and rolled sizes; no 200-roll alike measure for engine stages |  |
| `GEMINI-LEDGER.md:36` | Y | C4 Cooldown: no chunk within 2 levels, no sub-block twice a world; next roll avoids the last one seen | PARTIAL §variety gate L41; L133; L242,L391: in-stage and neighbour-half rules; no cross-stage or last-roll memory (layoutMemory) |  |
| `GEMINI-LEDGER.md:37` | Y | C5 Expressive range analysis: 200-1,000 rolls, heatmaps, diversity D_sim at least 0.35 (era.ts) | MISSING | R4: no roll-spread measure; era.ts unused by tools/engine. |
| `GEMINI-LEDGER.md:38` | Y | C6 Weighted action strings (W 0.2 ... S 3) in beats.ts | PARTIAL §CP3 L262; §Rests L492: used only inside the fun gate's pacing and repeats; not for cross-stage sameness |  |
| `GEMINI-LEDGER.md:39` | Y | C7 3-gram cosine across stages (reject over 0.78 adjacent), 18-beat windows (under 0.28), lookalike.ts at 0.30 | MISSING | R5: cross-stage checks are idea share at most half (L41,L133) and an unthresholded feel check (L1042-1044); lookalike.ts unused. |
| `GEMINI-LEDGER.md:40` | Y | C8 Horizontal mirroring of rooms (or flipping piece order) | MISSING | R3: cheap layout variety; w1mix.ts never mirrors an idea's order. |
| `GEMINI-LEDGER.md:41` | Y | C9 Standard connector heights / relative anchor frames with jump-sized joins | §CP3 mix rule L251; §placement rule 1 L278-283 | Joins high, mid, low, two roads. |
| `GEMINI-LEDGER.md:42` | Y | C10 Offline seed curation: score thousands of seeds, ship the best | MISSING | R2: spec requires all 16 rolls to pass; no curated seed table. |
| `GEMINI-LEDGER.md:48` | Y | D1 Kinematic reachability from the jump physics | §P4 L1137-1139; L369 |  |
| `GEMINI-LEDGER.md:49` | Y | D2 Per-difficulty jump margins (65% Easy, 82% Normal) | §difficulty dial L640 | Separate shares, but Normal's top exceeds 82% (see research row 105). |
| `GEMINI-LEDGER.md:50` | Y | D3 Full path search before play; local self-repair of a failing jump | PARTIAL §P4 L1137; §variety gate L39: reach model and prover; no self-repair, a node fails (L259) |  |
| `GEMINI-LEDGER.md:51` | Y | D4 Puzzles checked as symbolic zones (puzzleCheck.ts) | PARTIAL §CP3 rulings L375-377: deferred to wrapping as a puzzle room; the check is not named |  |
| `GEMINI-LEDGER.md:52` | Y | D5 Softlock guarantee: a lost item respawns at its source | MISSING | R1: no carried items in engine stages yet. |
| `GEMINI-LEDGER.md:53` | Y | D6 Sockets bound to a platform id plus position along it plus offset | PARTIAL §polish P-5 L703; §element table L1254: markers sit on standable tops; no along-surface binding stated |  |
| `GEMINI-LEDGER.md:59` | Y | E1 Only real actions count as beats; flat petals 0; petal arc over a gap 0.5 | §Rests L498,L510; L752 |  |
| `GEMINI-LEDGER.md:60` | Y | E2 Max eventless walk 2/3/1.2 s; rest pads 1.0-1.2 s Normal, 2-2.5 s Easy | PARTIAL §Rests L503,L510; ruling B L799: one 2.5 s dead-time line; Normal pad only every second burst |  |
| `GEMINI-LEDGER.md:61` | Y | E3 Action density 0.75-1.15 Normal, 0.35-0.55 Easy | CONTRADICTED L889-892: Easy accepted at 0.61/0.63 under a moved line; Normal judged off density (L801-803) |  |
| `GEMINI-LEDGER.md:62` | Y | E4 Rhythm group length 10-14 s Normal, 6-8 s Easy | PARTIAL §Rests L509; ruling B L800: longest-run caps 20 s / 29 s instead |  |
| `GEMINI-LEDGER.md:68` | Y | F1 Same layout, different rules per difficulty: margins, widths, hazards, enemy budget, quotas | PARTIAL §Easy rise cap L179; §dial L638-648: rules per setting; Easy also drops canopies and bursts (L796,L811), so its layout differs |  |
| `GEMINI-LEDGER.md:69` | Y | F2 Difficulty score D(world, stage) with an in-world ramp; bands.ts 0-100 score and flags | PARTIAL §difficulty dial L626-656: own d formula; bands.ts score and band flags not used on engine stages |  |
| `GEMINI-LEDGER.md:70` | Y | F3 Noisy-thumb kid and adult bots; survival 85% Easy / 70% Normal per jump | §dial L651; §CP2 L221; L906 |  |
| `GEMINI-LEDGER.md:71` | Y | F4 Touch failure modes (drift, lift-off, short hop, thumb swap) in the first-timer bot | §CP2 L215,L227; §P3 L1135 | Through the first-timer bot. |
| `GEMINI-LEDGER.md:72` | Y | F5 Gates: input window 300/167 ms, peak stress 2.5/5.5, puzzle depth, backtracking | PARTIAL §Easy rise cap L183-186; §dial L643: Easy 300 ms used in traces; the others not gated |  |
| `GEMINI-LEDGER.md:73` | N | F6 Kids' hints: short wording, stuck detection, 3-tier hints | n/a: hint UI, not stage generation |  |
| `GEMINI-LEDGER.md:74` | Y | F7 First lesson rooms: zero lethal, unskippable, self-showing; source and receptor within 8 tiles | PARTIAL §CP2 L218; §CP3 L342; §dial L652: zero-lethal teach; unskippable, self-showing and co-visibility absent |  |
| `GEMINI-LEDGER.md:80` | N | G1 Coyote time 133/167 ms in ms | n/a: runtime physics, in game |  |
| `GEMINI-LEDGER.md:81` | N | G2 Jump buffer 133/200 ms | n/a: runtime physics, in game |  |
| `GEMINI-LEDGER.md:82` | N | G3 Ledge-landing forgiveness 8/12 px | n/a: runtime physics, in game |  |
| `GEMINI-LEDGER.md:83` | N | G4 Head-bonk nudge and shin mantle | n/a: runtime physics, in game |  |
| `GEMINI-LEDGER.md:84` | N | G5 Pickup / lever magnet 1.25x / 1.6x | n/a: interaction runtime |  |
| `GEMINI-LEDGER.md:85` | N | G6 Physics stable at 30 fps (Verlet or 60 Hz substep) | n/a: runtime physics |  |
| `GEMINI-LEDGER.md:86` | N | G7 Floating re-centring thumb slider | n/a: touch input |  |
| `GEMINI-LEDGER.md:87` | Y | G8 No Easy gap may need a full-hold jump (easyHoldCheck) | §CP3 rulings L369; §dial L640 | heldMaxGap; tools/engine/cp3-check.ts runs easyHoldCheck. |
| `GEMINI-LEDGER.md:93` | Y | H1 Fixed story order with story anchors at a stage's start and end | §CP3 mix rule L233; §stage profile L1227-1229; L997 |  |
| `GEMINI-LEDGER.md:94` | Y | H2 Handcrafted landmark rooms inside generated stages | PARTIAL §whole-game plan L1462; §B L1497; L376: special stages and puzzle room kept; no landmark slot inside an engine stage |  |
| `GEMINI-LEDGER.md:95` | Y | H3 Each world in three visual sub-acts (morning, deep, lair approach) | PARTIAL §stage profile L1226; L331; L1014: per-stage light; no world sub-act rule |  |
| `GEMINI-LEDGER.md:96` | Y | H4 A breadcrumb trail so players don't get lost | §placement rule 4 L305; L1000 |  |
| `GEMINI-LEDGER.md:102` | Y | I1 9-card mission deck per world; fixed order kept, shuffling dropped | PARTIAL §whole-game plan L1462; L354: order and stagePlan archetype kept; no distinct-archetype rule across a world |  |
| `GEMINI-LEDGER.md:103` | Y | I2 gen2 six-pass pipeline working end to end on a test world | PARTIAL §shared library L127; §F L1629: gen2 sections join the library; gen2's pipeline (repair, layStage) not referenced; W2-10 not rebuilt |  |
| `GEMINI-LEDGER.md:104` | Y | I3 JSON world manifests and chunk templates as data | §stage profile L1208-1233; §B L1495 |  |
| `GEMINI-LEDGER.md:110` | N | J1 Zoom floor 0.72-0.75x (decided no) | n/a: camera |  |
| `GEMINI-LEDGER.md:111` | N | J2 Camera leans 35% toward the active puzzle part | n/a: camera |  |
| `GEMINI-LEDGER.md:112` | Y | J3 Puzzle rooms fit a 500 x 750 px box | MISSING | R1: spec lays no puzzle rooms yet (L376). |
| `GEMINI-LEDGER.md:113` | N | J4 0.8 s pan to a far gate or a visible conduit | n/a: camera and dressing, in game |  |
| `GEMINI-LEDGER.md:114` | N | J5 Peek-drag gesture (decided no) | n/a: input gesture |  |
| `GEMINI-LEDGER.md:119` | Y | Summary gap 1: variety, rolls of a stage barely differ (C1, C3, C4, C8, C10) | PARTIAL §CP3 L249,L336-337; §variety gate L30-41: bags and decks; mirroring, curation, cross-stage cooldown and a roll-spread measure absent |  |
| `GEMINI-LEDGER.md:120` | N | Summary gap 2: movement forgiveness on every stage and difficulty | n/a: runtime physics |  |
| `GEMINI-LEDGER.md:121` | Y | Summary gap 3: difficulty-scaled rules so Easy is truly easier | §difficulty dial L638-656; §Easy rise cap L179-184 |  |
| `GEMINI-LEDGER.md:122` | Y | Summary gap 4: pacing numbers in the inspector so fun is measured | §Rests L490-511; §CP3 L262 |  |
| `GEMINI-LEDGER.md:123` | Y | Summary gap 5: tiered hints and the six-pass generator for Worlds 6-10 | PARTIAL §F L1629; L127: Worlds 6-10 not rebuilt; gen2 sections in the library; hints are not engine work |  |

### reference/research/GEMINI-VARIETY-2026-11-02.md
10 rows: used 3, partial 5, missing 0, contradicted 0, n/a 2

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `GEMINI-VARIETY-2026-11-02.md:14` | Y | Pacing tags per beat (Tight/Flowing/Relaxed/Cerebral); never two Tight beats back to back | PARTIAL §Design L1121; §Stage profile L1218; §1-5 plan L339-351: rhythm patterns, pace words and node jobs; no 'never two tight in a row' rule |  |
| `GEMINI-VARIETY-2026-11-02.md:15` | Y | About 25-30% of beats are puzzle beats (jump as a tool, not a reflex) | PARTIAL §1-5 plan L349; §C L1541: one puzzle node in 1-5, push 'often as a puzzle beat'; no share target | 1-5's n9 puzzle beat lost its push block (L375-377), so 1-5 lays no puzzle beat. |
| `GEMINI-VARIETY-2026-11-02.md:16` | Y | Teach a thing alone, then use it against another system (two-step) | §move ladder L114-119; §animals L218; §More used L1321 |  |
| `GEMINI-VARIETY-2026-11-02.md:17` | Y | Moving platform kinds: pendulum, ride-to-start track, pulley, turning log, bobbing float, creature platform, see-saw | PARTIAL §unused-art L158,L162,L164; §log family L565,L571: bobbing crates, counterweight, slung log, drifting log, all parked or W2; no track or turning log | Spec notes moving platforms appear 17 times in the game (L193) and should spread (L196). |
| `GEMINI-VARIETY-2026-11-02.md:18` | N | Platform speed carries into the jump (lift momentum) | n/a: player physics (R-152.7), not the level mixer | The moving-platform ladder (L1543) would need it in the reach model. |
| `GEMINI-VARIETY-2026-11-02.md:19` | Y | Water: no slow drag, in-and-out every 15-20 s, wide clear exits, currents and bubbles, rising/falling water | §D Water and swims L1585-1596 | Spec cites this row (L1585); its '3-4 body widths' is not from this row (notes b). |
| `GEMINI-VARIETY-2026-11-02.md:20` | Y | Stage types per world (normal, short break, search hub, race, mastery); reshape 2-3 stages per world | PARTIAL §D L1602; §whole-game L1462: only 6-9 reshaped (R-153); other stages kept as built | No other world gets its 2-3 reshaped stage types. |
| `GEMINI-VARIETY-2026-11-02.md:21` | Y | Lock-and-key and branch rules: a key off the main path; a fast risky path and a safe path | PARTIAL §unused-art L157,L204; §CP3 rulings L434-436: risky/safe forks built; lock-and-key only a parked root-gate idea |  |
| `GEMINI-VARIETY-2026-11-02.md:22` | Y | Reject Celeste's no-lives; keep checkpoints close | §Placement rule 3 L296-303 | 'Close' is up to 45 s to the hard node (L300). |
| `GEMINI-VARIETY-2026-11-02.md:23` | N | Physics formulas (buoyancy, spring damping) as a helper's tool | n/a: physics tooling |  |

### reference/research/MATT-RESEARCH-2026-11-04.md
9 rows: used 0, partial 5, missing 0, contradicted 0, n/a 4

| Row | Engine? | Idea | Where the spec uses it | Note |
|---|---|---|---|---|
| `MATT-RESEARCH-2026-11-04.md:6` | Y | Stage DNA plus seed; map shapes (loop-back, split, chimney, lock-and-key spoke); physics-traced rhythm; pre-flight checks; never T-T; 200-250 px aprons | PARTIAL §Stage profile L1208-1233; P4 L1137-1139; L510: DNA, seeded rolls, shared jump model, dead time 2.5 s; no loop-back/chimney/spoke, 45% roll-difference, T-T rule or aprons |  |
| `MATT-RESEARCH-2026-11-04.md:11` | N | WebGL: batched sprites, instancing, fixed-step physics, pools, compressed atlases | n/a: rendering and performance |  |
| `MATT-RESEARCH-2026-11-04.md:13` | N | Separate engine layers; touch forgiveness (coyote, buffer, tap/hold); context actions | n/a: input and physics |  |
| `MATT-RESEARCH-2026-11-04.md:15` | N | Bosses: three ways to win, three phases, shared vulnerability config | n/a: boss design |  |
| `MATT-RESEARCH-2026-11-04.md:17` | Y | Sloth biology as mechanics; a special stage per world; world mutators; stage-to-stage cause and effect; shuffle slot order; secrets by tells | PARTIAL §D L1592-1593; §unused-art L166,L170: fast swimming, hidden roads; no mutators, cause and effect, slot shuffle or in-world tells | World mutators would be R5 for cross-world sameness; absent. |
| `MATT-RESEARCH-2026-11-04.md:21` | Y | Enemies: one trick with 0.5 s warning; stomp/punch/kick roles; about 35% nodes enemy-free; none within 150 px of a landing | PARTIAL §animals L107,L218-220; §Placement rule 5 L315; §dial L645: tells and per-view caps; no enemy-free share, 0.5 s tell or 150 px clearance |  |
| `MATT-RESEARCH-2026-11-04.md:25` | Y | Never repeating: stage as a move string, 3-4 move runs checked, similarity to earlier stages, world tempo, tension curve, rewards seen from a rest | PARTIAL §The variety gate L30-41; §feel check L1042-1044: piece runs and neighbour likeness; no move-string n-grams, world tempo or tension curve | The golden seed seen from n9 (L371-374) is the one 'seen before the challenge' case. |
| `MATT-RESEARCH-2026-11-04.md:27` | N | Order of work: WebGL, validator, node generator, enemies, story, profiling; token rules | n/a: process and ordering |  |
| `MATT-RESEARCH-2026-11-04.md:29` | Y | Thirty ideas (under-branch hanging, jump-toggled platforms, domino branches, wind shadows, water waves, enemy bowling, a pacing director, more) | PARTIAL §animals L109; §unused-art L162; §never-packed L543; §D L1593: shell-kick chains, pulleys, waves, fast swim; most of the thirty absent |  |
