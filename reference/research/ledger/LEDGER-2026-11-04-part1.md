# Research ledger: Matt's 11-04 research, lines 1-389 (part 1 of 2)

Source: `reference/research/MATT-RESEARCH-2026-11-04-full.txt`, lines 1-389, every line read. Checked against the lead's summary
(`reference/research/MATT-RESEARCH-2026-11-04.md`), the plan (`reference/PLAN-TO-80.md`), the rules (`reference/STAGE-RULES.md` §0, §0.5,
§0b, §0c, and §2 where a number lives there), `reference/ROADMAP.md` (R-ids) and `reference/GEMINI-LEDGER.md` (our 10-27 ledger, where it
already decided something). Facts about our game are checked in `src/` (file:line). Written 2026-11-04 by a ledger helper (LEAD-PLAYBOOK
8h). Lines 390 on are part 2's.

What this part covers: lines 1-136 the level generator (stage DNA, map shapes, pacing tags, node spacing, rhythm-first placement, puzzle
blueprints, story and collectible anchors, the three-gate check); 137-178 WebGL and the "four pillars"; 180-269 the four engines, why
platformers fail, touch tuning and the WebGL blueprint; 271-366 bosses (three ways to win, three phases, all ten Guardians, the shared
config); 368-389 sloth biology as moves and a special stage per world.

---

## 1. Missed or flattened (ranked by how much each fights "every stage and world feels the same")

1. **Every stage gets a map shape, and a replay never repeats the last one** (lines 25-29, 97).
   Research: "the generator must first randomize the shape of the level's Node Graph before placing a single platform" (21); four shapes:
   over-under loop-back, parallel high/low split, zig-zag chimney, lock-and-key spoke (26-29); "Force the generator to exclude the previous
   run's Macro Topology" (97).
   Today: the summary lists the four shapes; the plan puts them in Phase B generators only ("Generators get the new grammar: map shapes",
   PLAN-TO-80 Phase B); World 1's slice (Phase A) has no map shape at all; no rule in §0, §0b or §0c names a map shape; the plan's "Not
   taken" drops the last-run memory. Code: World 1-4 stages are left-to-right runs or straight climbs; a high/low fork exists only in the
   old generator (`src/game/stageForks.ts:1-11`, 900-1400 px); a lock-and-key spoke exists in one room (6-7's root door and root-stone,
   `src/game/gen2/worlds/w6Rooms.ts:8,43`); no loop-back anywhere.
   Proposal: **adopt.** Add a §0c rule: every stage carries a map shape tag; no two neighbouring stages share one; the shape is part of a
   world's fingerprint (§0c.7) and of the validator's "like the stage before" check; World 1's rebuild (Phase A) uses at least three of the
   four shapes across its nine stages. This is the single biggest cure for "long hallways" (PLAN-TO-80 "Why it's a 55" #3).

2. **A tempo (BPM) per world, and action pieces placed on the beat by tracing Pokey's real jump** (lines 51-60).
   Research: "The generator picks a tempo (BPM, e.g., 90 BPM for relaxed World 2 stages, 130 BPM for urgent World 5/8 stages) and a
   duration (8 to 14 seconds)" (52); a Ghost Pokey runs the beat timeline with "your game's real gravity... run velocity... jump impulse...
   and wind" (56) and platforms appear "under Ghost Pokey's feet" (59).
   Today: summary item 1 says "rhythm (a beat timeline traced with Pokey's real physics...)" but gives no BPM, no 8-14 s, no world tempo;
   STAGE-RULES §0b.9 is now a DRAFT pointing at the line-522 BPM model (part 2's lines). Code: the music already has a BPM band per world
   (`src/audio/styles.ts:94-220`: W1 126-134, W2 94-102, W3 66-74 in 6/8, W4 84-92, W5 100-108, W6 86-94, W7 64-72, W8 84-92 waltz, W9
   112-120, W10 78-84), and nothing in the level builders reads it (no bpm/tempo in `src/game/gen2/` or the hand-built stage files).
   Proposal: **adopt, tied to the music we already have.** Each world's stage tempo comes from its music's BPM band in styles.ts, so the beat
   the player hears and the beat their thumb plays match. Note the research's 130 for Worlds 5 and 8 clashes with our music (W5 ~104, W8 a
   ~88 lullaby): pick one with Matt (question: "move the music, or move the placements?"). Part 2's line 522 model decides the bar maths.

3. **Hazards go where the player would have gone if they didn't duck or short-hop** (line 59).
   Research: "Wherever the timeline says Duck or Short-Hop, the generator places a hazard (a snapping crocodile, a thorn overhang, or a
   rising spear) along the alternate trajectory that Ghost Pokey avoided!"
   Today: missing from the summary, the plan and the rules. Matt's own complaint is exactly this ("you can outrun them every time",
   PLAN-TO-80 top). R-158.1 (eagle lock-on) and R-154 (branch variants) fix two hazards one by one; nothing makes "the easy line is the
   dangerous one" a rule.
   Proposal: **adopt as a rule** (§0.2 "every hazard must matter" gets teeth): a hazard counts as a beat only if the plain line (hold
   right, full jump) runs into it; the validator's hold-right probe (`tools/validate/play.ts`) flags any hazard the plain line misses.

4. **Puzzle rooms are a separate library of 15-20 blueprints whose layout, order and numbers change per roll** (lines 46-48, 62-68).
   Research: "Action Nodes and Puzzle Nodes should not be generated using the same algorithm" (46); "a library of 15 to 20 Parameterized
   Puzzle Blueprints where the logic graph is valid, but the spatial layout, order of operations, and physical parameters randomize" (62);
   per seed: mirroring, pulley ratio and decay speed (2:1 fast lift vs a root-stone weighting it for good), and "Hazard Layering: In World
   4, a crosswind blows across the return jump; in World 5, the landing platform is a closing orchid on a 3-second cycle" (68).
   Today: summary says "puzzle blueprints (fixed logic, randomized layout)": flattened (no count, no order-of-operations, no ratio, no
   per-world hazard layer). Plan Phase B lists "puzzle blueprints (pulleys, toggle-on-jump platforms, domino branches, seesaws)". Code: the
   kit exists (`src/game/puzzleKit.ts:10-13`: plates, gates, lever, counterweight basket and lift, seesaw, water level...), but each room is
   pinned to one stage (`src/game/gen2/worlds/w6Rooms.ts:324`: seesaw 6-3, dark 6-6, water 6-7) and does not change its order or ratios per
   roll.
   Proposal: **adopt.** §0c.4's "3 templates per pacing tag" gets a puzzle line: a shared library of at least 15 puzzle blueprints, each
   with at least mirror + order + one number that rolls, and each world adds its own hazard layer on top (its wind, its orchids, its dark).

5. **One special stage per world, where the same buttons do something new** (lines 368, 377-389).
   Research: "creating one-off Special Stages per world ensures your 100 levels never feel like a 10x10 reskinned matrix" (368); "every
   World has one bespoke X-S Special Stage... temporary 'Special Moves' and perspective shifts that use your exact same touch buttons in a
   new way" (377), with ideas for all ten (380-389).
   Today: summary "A special stage per world (ideas for each)": flattened. Plan: "Later... a special stage in every world (we have 4-D and
   5-M; add one or two where they earn it)" and R-162.5 (parking lot): watered down, and wrong about what we have. Code: 1-8 chase
   (`src/game/chase.ts:2`), 4-7 Long Drop (`src/game/w4LongDrop.ts:2`), 4-D (`src/game/extraStages.ts:14`), 5-M (`extraStages.ts:43`), 6-8
   Stilt Climb (`src/game/risingTide.ts:2`), 7-4 The Slide (`src/game/w7Slide.ts:2`), 8-4 Lantern Run (`src/game/w8Lantern.ts:2`); planned
   9-2 (R-2.4) and 10-8 (R-2.8). **Only Worlds 2 and 3 have none.** GEMINI-LEDGER A3 already says "one signature stage per world: IN".
   Proposal: **adapt.** Fix the plan's line (we have seven); add R-ids for a World 2 and a World 3 special (the research's 2-S one-log raft
   and 3-S Prowler's shadow run are the candidates) and judge each existing special against the research's bar: do the buttons change
   job? (1-8 and 6-8 do not; 7-4 and 8-4 do.)

6. **Boss phases where the arena changes so the world's own mechanic is needed to reach the boss** (lines 283-286).
   Research: "Phase 2 (66%-34% HP - The Arena Splits): The boss alters the terrain (e.g., floods the floor, drops the ceiling, or activates
   crosswinds). Now the player must use that world's platforming mechanic (vines, seesaws, updrafts) just to reach the boss" (285); "Phase 3
   ... combines two attacks at once, but leaves more environmental traps on screen" (286).
   Today: summary "three phases where the arena changes": flattened. Plan item 7 changes it to health segments by world (2, 3, 4) with "the
   arena's perches, vines and platforms change". Code: every boss already has 3 phases at 70% and 35% (`src/game/bossAI.ts:365-368`); the
   arena change comes at phase 3 only for most (floods, dark, falling rocks, minions: `src/game/bossDefs.ts:328, 471, 836, 1267, 1453, 1595,
   1778, 1995, 2117`); phase 2 changes the arena only for Venom Fang (snakes, `bossDefs.ts:229-233`); nothing makes a phase need the world's
   mechanic, and nothing doubles the traps in the last phase.
   Proposal: **adopt the two tests inside Matt's segment plan**: each new segment must (a) need the world's mechanic to reach the boss and
   (b) the last segment must offer more traps, not just more attacks. Write both into R-161.1's acceptance.

7. **Each stage's DNA names its mechanic pair and its stage archetype** (lines 11-13, 148-156).
   Research: "Primary & Secondary Mechanics: e.g., Stage 4-4 (Crosswind) locks in Wind + Breaking Branches + Vines" (12); "Stage
   Archetype Mode: Standard_Hybrid, Vertical_Ascent (2-6, 10-2), Vertical_Drop (4-7), Rising_Hazard (2-8), or Search_Hub (3-7)" (13); the DNA
   JSON has "archetype" and "modifiers" (153-154).
   Today: summary "fixed DNA (mechanics, type, story line, collectible)": kept in words, but no rule writes a DNA per stage; §0b.5 talks of
   pairs per world, §0b.6 of slot roles, R-153 of stage types. Code: a stage has one objective type and a name (`src/game/stagePlan.ts:31-
   139`); no field names its mechanic pair or archetype.
   Proposal: **adopt as data.** One DNA line per stage (mechanic pair, archetype, map shape, beat/tempo, story anchor, collectible) in one
   table the validator reads; it is the place the world fingerprint (§0c.7) and the mechanics-in-use table (R-150.4) read from.

8. **Pokey's sloth moves beyond hanging: camouflage, moth light, look-around, belly slide, a let-go that is the skill** (lines 371-375).
   Research: hanging is "effortless invulnerability to gravity and wind. Make letting go at the exact right millisecond the skill test"
   (371); "holding Down/Still on a mossy wall or fern lets Pokey's algae coat blend completely into the foliage so patrolling Night Hunters
   or Stone Sentries pass right over him... releasing a burst of symbiotic sloth-moths on a Double Jump can briefly illuminate dark
   platforms" (373); "holding a directional look pans the camera 40% further" while hanging still (374); belly slide on "steep mud banks
   (World 2), wet mossy chutes (World 4), or ash slopes (World 9)... hooks that can catch overhead zip-vines at high speed" (375).
   Today: summary names them in one line each (flattened: no numbers, no worlds). Plan: only under-branch hanging is in (R-160.1); moth/algae
   camouflage is "Later" (R-162.7); the look-around camera and the belly slide have no R-id at all. GEMINI-LEDGER J5 said NO to a peek
   gesture. Code: hiding in bushes from the eagle exists (`src/game/watcher.ts:13`), a stand-still mechanic exists in World 4
   (`src/game/patience.ts:2-5`), 7-4 is a slide (`src/game/w7Slide.ts:9`), the camera look-ahead is only 90 px by facing
   (`src/game/cameraFollow.ts:21`), the vine let-go has a wide sweet spot with early and late help (`src/game/physics.ts:672`).
   Proposal: **adapt.** Give each an R-id now (law 21). Camouflage is the cheapest new verb (it reuses the bush hide: a mossy wall becomes a
   bush for patrollers); the belly slide reuses 7-4's slide code in Worlds 2/4/9; the look-around only while hanging still, auto after
   about 1 s (no gesture, so J5's clash with whole-screen touch is avoided).

9. **The search room: real items in a different subset of 12-18 hiding spots each roll, with tells** (lines 69-71).
   Research: "12 to 18 distinct fern alcoves across 3 vertical tiers connected by randomized vine and sinkhole paths. On each run, the N real
   items are assigned to a different subset of alcoves (with subtle environmental tells, like a single glowworm humming above the right
   fern or the Prowler's voice hinting at the next one), while empty ferns spawn minor collectibles or sleeping vines."
   Today: missing from summary and plan; R-153 names "search-the-room" as a stage type but nothing about tells or reassignment. Code:
   3-7 asks for 6 of Grandma's things in a "which fern" puzzle room (`src/game/protoStage.ts:303-306`); 7-3 and 7-7 are relic hunts
   (`src/game/stagePlan.ts:103,107`).
   Proposal: **adopt for every relic-hunt stage** (3-6, 3-7, 5-6, 7-3, 7-7, 9-8): tiers, reassignment per roll, one in-world tell per real
   spot, empty spots never blank.

10. **The dead-walk check fixes, not only flags** (line 100).
    Research: ">2.5 seconds of flat horizontal walking with zero vertical change, hazards, or interactive props, auto-inject a micro-terrain
    feature (a small slope, a low branch hop, or a harmless background critter/bounce pod)."
    Today: summary "no >2.5 s dead walks" (flattened: the fix is gone). Validator flags it (`tools/validate/core.ts:141-142`). STAGE-RULES §2
    "Dead time" still says "about 4 s".
    Proposal: **adopt**: gen2's repair pass (DESIGN.md pass 5) gets a dead-walk repair; §2's 4 s number is brought to 2.5 s to match the tool.

11. **Collectibles sit where the script says, as their own small side-node** (lines 80-84).
    Research: inject "a dedicated Portal / Mastery Sub-Node matching the exact description in your script" (80): 2-4's page at "90% of
    Pokey's maximum lift-momentum jump arc" off the highest swing (81), 3-7's on a "[T] Climbing Spoke above the top ceiling of the Fern Hub"
    (82), 4-7's at the lowest point of the drop "behind the main exit chute" (83).
    Today: missing from summary and plan (summary item 7, "collectibles seen or heard from a rest", is part 2's). R-4.3 (ledger pages, Wanted
    posters) is "collectable spots moved to free stages" with no rule for the spot. Code: finds sit in fixed stages by kind
    (`src/game/finds.ts:45-47`).
    Proposal: **adopt** inside R-4.3: every collectible gets a side-node built for it (a hard optional bit), placed by the script's words.

12. **Rests are real places: 400-600 px wide, with a flag and the story line** (lines 36, 74-78).
    Research: "[R] Rest / Breather Node: Flat safe platform (400-600 px wide), checkpoint flag, and Wayside dialogue trigger" (36); "halfway
    attaches to the Rest Platform of Node floor(N/2)" (77).
    Today: missing from summary; §0b.1 "a rest platform (no hard input) sits between every two" groups, no width; §2 Pacing "rest pads
    1.0-1.2 s Normal" (about 285-340 px at full run, `src/game/physics.ts:9`). Code: wayside lines fire at a share of the stage's length
    (`src/game/wayside.ts:325-327, 364`), not on a rest.
    Proposal: **adapt**: the mid-stage rest is a real breather (at least 400 px) with the flag, and the "half" line fires there, so the
    story lands when the player can read it.

13. **Each node has a box, flat entry and exit ledges at the connecting height, and the camera settles on it** (lines 40-44, 113).
    Research: node boxes "1600 px wide x 900 px tall for horizontal nodes; 900 px wide x 1600 px tall for vertical chimney nodes" with "a
    mandatory 250 px Transition Apron" (40); "a flat, hazard-free resting ledge of at least 200 px width at the exact height of the
    connecting edge port (Low, Mid, or High)" (41); "The camera can smoothly pan or lock to the new Node's bounding box" (43); "sub-1-second
    node respawns" (44).
    Today: summary "200-250 px flat aprons between nodes" (kept); box sizes, port heights, camera lock and fast respawn missing. Code: gen2
    joins sections end to end ("end of one block is the start of the next", gen2 DESIGN.md Part A).
    Proposal: **adapt**: Low/Mid/High port heights are a cheap variety lever (a node can be entered high and left low); camera lock is a
    readability win for upright phones; respawn already lands on the last flag (§0b.8 "respawn within about 2 s").

14. **Kick and punch do different jobs against bosses** (lines 276-281).
    Research: "Punch = Fast Combo / Direct Damage / Projectile Deflect... swat back small projectiles (like the Tarantula Queen's web balls or
    Magma Drake's coal chunks)" (278); "Ground Kick: Breaks armor/shields, pushes heavy arena objects (like rocks, logs, or bombs) into the
    boss" (280); "Aerial Dive-Kick... bounce off elevated targets" (281).
    Today: summary "a punch/kick skill counter (way 3)" (flattened). R-159.1 does it for enemies, R-161.x for bosses one by one. Code: the
    boss wind-up is armoured and only a hook or mega punch breaks it (`src/game/bossDefs.ts:5-6`); no deflect anywhere (no "deflect",
    "reflect" or "parry" in src/game).
    Proposal: **adopt** as one rule for every boss: punch can send back the boss's small shots; kick moves an arena object into it.

15. **Two numbers that make the jump feel good: a 50% cut on a tap, and 0.5x gravity at the top for 8 frames** (line 222), **plus platform
    and vine speed added to the take-off for 6 frames** (line 170).
    Today: summary "tap = short jump, hold = apex hang" (numbers gone); R-156 (apex hang, no number) and R-152.7 (platform carry) are open.
    Code: release caps rise at 230 px/s from 640 (`src/game/physics.ts:18-20`); no apex hang; vine let-go already carries swing speed
    (`physics.ts:688-693` tarzanLaunch); a moving platform does not (R-152.7 code fact).
    Proposal: **adopt as starting numbers** in R-156/R-152.7, converted to our 30 fps: 8 frames at 60 fps is about 0.13 s (4 of our frames).
    Feel, not sameness, so ranked low.

16. **Readability: the player must never melt into the background** (line 210).
    Research: "complex background art blends with foreground hazards (e.g., brown player hair against dark brown roots)".
    Today: missing from summary and plan; §0b.7 covers hazards only. Code: a rim light around Pokey for exactly this exists but is off by
    default and behind a switch (`src/game/heroRim.ts:1-7`, `DEFAULT_RIM = false`).
    Proposal: **adopt**: judge the rim on Worlds 6-7 (brown roots, "Brown Vines" 7-2) and either turn it on for good or delete it (CLAUDE.md:
    no switches).

17. **The touch layer: dead zones, edge-swipe suppression, haptics** (lines 201-202), **and the 50 ms rule** (208).
    Research: "If a jump command feels delayed by even 50 milliseconds... the game instantly feels 'cheap'" (208).
    Today: missing from summary; haptics is R-162.10 (later); PERFORMANCE-RULES covers frame time, not input delay.
    Proposal: **adapt**: measure touch-to-jump delay once on Matt's phones (a gate number, under 50 ms plus a frame); edge-swipe suppression
    matters on Android's back gesture (check `src/game/backGuard.ts`).

18. **"Static hand-crafted levels without replay variability cause 100-level campaigns to grow intensely boring past World 3"** (line 209).
    Today: not in the summary; it is Matt's own finding ("Worlds 3, 4, 5 all felt the same", R-150.4). Worlds 1-4 are hand-built.
    Proposal: **adopt as the reason** Phase B starts with Worlds 2-4's hand-built stages, not only the generated worlds.

19. **Generator checks repair only the failing node** (lines 87, 133) and **run in under 12-15 ms** (87, 103).
    Today: summary missing. gen2 already repairs one spot (DESIGN.md Part A: "fixes just that spot"). The time budget does not apply: we curate
    rolls offline (DESIGN.md "We ship only the best rolls... the best 16").
    Proposal: **not taken** (timing) / **already in** (repair).

---

## 2. Where our rules contradict the research

| # | Research (line) | Ours | Proposal |
|---|---|---|---|
| C1 | "Every time the player selects or replays the stage, a new PRNG... seed is rolled" (15); "Replaying the stage rolls a new seed" (158) | "a stage keeps its layout until you clear it... Clearing it forgets the number (Matt's choice, 2026-10-23)" (`src/game/layoutMemory.ts:6-12`) | Keep ours on retries (a stage you are learning stays put); the research's rule applies to replays after a clear, which we already do. |
| C2 | The level is built at load, "in under 12 milliseconds" (158), regenerating a failing node (87) | gen2 ships "the best 16" curated rolls per stage, built offline (gen2 DESIGN.md Part A; GEMINI-LEDGER C10) | Keep curation (every roll is checked by bots and people), but the 16 must cover at least 3 map shapes (miss 1). |
| C3 | Replay must exclude last run's map shape and be "at least 45%" different (97-98) | Plan: "Not taken: storing the player's last run to force a different layout (our curated pool already rotates)" (PLAN-TO-80 "Not taken"); code already stores it: World 1 keeps the last roll and a new roll must be at least 0.35 away (`layoutMemory.ts:15-19`); gen2 never the roll just played (`layoutMemory.ts:20-21`); STAGE-RULES §2 "Variety across rolls... about 0.35" | Correct the plan's line (it is half built); raise 0.35 to 0.45 and add "not the same map shape" when shapes exist. |
| C4 | Stage vs stage: "at least 45%" different (98) | STAGE-RULES §2 "Sameness": cosine "under ~0.78"; the validator uses 0.55 (`tools/validate/core.ts:236-237`) and 0.45 for the stage before (`tools/validate/evaluate.ts:30`) | Our rule text lags our tool; bring §2 to the validator's numbers. |
| C5 | A stage is "6 to 8 nodes" (31) of "10 to 15 seconds" (172): about 60-120 s | §0.5: 2-5 min for a first-timer, never under 2 min for a skilled player | Adapt: keep our length; it means about 10-16 nodes a stage, so the template library (§0c.4) must be bigger than the research's 15. |
| C6 | "forbidden from placing [T] -> [T] or [P] -> [P]... If Node 2 rolled [T], Node 3 must roll [R], [F], or [P]" (37): F after T is fine | §0b.1: "Groups never run into each other: a rest platform (no hard input) sits between every two" | Adapt §0b.1 to the research: rest is one of the tags placed by the grammar (and always after T), not after every group; a rest after every group makes every stage the same stop-go. |
| C7 | Three phases for every boss, at 66% and 33% (283) | PLAN-TO-80 item 7 (Matt's words): segments by world, 2 for W1-3, 3 for W4-7, 4 for W8-10; code: 3 phases at 70% and 35% for all (`src/game/bossAI.ts:365-368`) | Matt's segments stand (his call); keep the research's tests per segment (miss 6). |
| C8 | Phase 1 is a "Flat Arena" that teaches (284) | Plan item 7: "Each segment is a phase: the arena's perches, vines and platforms change" | Compatible if segment 1 is the plain teach; say so in R-161.1. |
| C9 | Look-around: "holding a directional look pans the camera 40% further" (374) | GEMINI-LEDGER J5: "A peek-drag gesture: NO: clashes with our whole-screen touch controls (2026-10-27)" | Adapt: automatic look while hanging still (no gesture). |
| C10 | "one bespoke X-S Special Stage" per world (377) | PLAN-TO-80 Later: "a special stage in every world (we have 4-D and 5-M; add one or two where they earn it)"; R-162.5 parking lot; GEMINI-LEDGER A3: "one signature stage per world: IN" | Our own papers disagree with each other and with the code (seven specials). Fix the plan; add W2 and W3 (miss 5). |
| C11 | Each stage has its own archetype in its DNA (13) | §0b.6: fixed slot roles X-1 to X-10, the same in every world (under review since line 402, part 2) | Adapt: archetype per stage from its DNA; slot roles become a default, not a law. |
| C12 | Rest node "400-600 px wide" (36) | §2 Pacing: "rest pads between bursts" 1.0-1.2 s Normal (GEMINI-LEDGER E2) | Adapt: the mid-stage rest (with the flag and the story line) is the wide one; small pads between groups stay short. |
| C13 | "This guarantees 100% solvability with zero human playtesting required" (165) | Laws 1-2 and §0c.6: "The quality supervisor's in-order recording is the final judge"; Matt's rating is the gate | Not taken: a bot proves it can be finished, never that it is fun. |
| C14 | Physics at a fixed 60 Hz, separate from drawing (144, 195-196) | CLAUDE.md "the loop is locked at 30 fps on purpose"; PLAN-TO-80 kept it; GEMINI-LEDGER G6 (substep) NOT checked | Not taken (re-tunes 100 stages). G6's check (jump height under 33 vs 45 ms frames) is still worth doing. |
| C15 | Swimming: "invert Pokey's land speed: make him an agile, buoyant torpedo" (372) | Code: "about half a run, so the water feels like water" (`src/game/swim.ts:34-35`: 150 px/s vs run 285); R-5.22 (Matt): "a stage where slow Pokey is suddenly fast" | The code contradicts Matt and the research; R-5.22 should change SWIM.speed (at least run speed), not only add a stage. |
| C16 | Vines: "letting go at the exact right millisecond" is the skill (371) | `src/game/physics.ts:663-672`: an early press waits for the sweet spot, a late one leaps as from it (wide help) | Adapt by difficulty: keep the help on Easy, narrow it on Normal from World 3 (§0.5's arc). |
| C17 | Coyote 0.10 s and buffer 0.12 s (168-169), or coyote 0.12 s and buffer 0.10 s (220-221) | `src/game/physics.ts:40-43`: 0.133 / 0.133 Normal, 0.167 / 0.2 Easy | No change: ours is more forgiving than either of the research's own two sets, which disagree with each other. |

---

## 3. Facts about our game the research gets wrong (checked in code)

1. **4-4 Crosswind has no breaking branches.** Research line 12 says it "locks in Wind + Breaking Branches + Vines". The 4-4 builder
   (`src/game/protoStage.ts:4531-5364`) has lianas, gust lanes and loose rocks; the word "fragile" (our breaking platform) does not appear in
   it.
2. **Two world names are wrong.** World 4 is "Mist Cascades" (`src/components/stageClue.ts:48`), not "Waterfall Cliffs" (383); World 7 is
   "Ancient Ruins" (`stageClue.ts:84`, `src/game/finds.ts:196`), not "Temple Ruins" (386).
3. **Ledger Pages and Wanted Posters are not in the game yet.** Lines 9, 14, 81-83 treat them as built. They are planned (R-4.3, from the
   story rewrite). Today's finds are a note (stage 2, in Meeca's pink bell), a keepsake (5), a book (8), Dot's pocket (6), the notch (1-4)
   and the snail (3) (`src/game/finds.ts:45-47`).
4. **Meeca's World 6 note is not in 6-7.** Line 84 puts w6_note "up on the high root shelf, beside her root-stone" in 6-7. w6_note is in
   6-2, "in plain sight. Look for a pink bell" (`src/game/finds.ts:45, 174-177`). The root-stone on 6-7's shelf is real
   (`src/game/gen2/worlds/w6Rooms.ts:8, 43`); it is Dot's, not Meeca's.
5. **6-6's story line is Flicker's, at the start, one line** (`src/game/wayside.ts:164`: `flicker('start', ...)`), not "a
   halfway wayside exchange" (9). The dark room is real (`w6Rooms.ts:324`). The research is right about 2-2 (start), 2-3 (half) and 8-7
   (near) (`wayside.ts:85-86, 208`).
6. **We have seven special stages, not two.** Line 377 says the script has 4-D and 5-M. The game also has 1-8 (`src/game/chase.ts:2`),
   4-7 (`src/game/w4LongDrop.ts:2`), 6-8 (`src/game/risingTide.ts:2`), 7-4 (`src/game/w7Slide.ts:2`) and 8-4 (`src/game/w8Lantern.ts:2`),
   plus the secret Thornbark's Hollow (`src/game/secret.ts:2`). Our own plan repeats the error.
7. **4-D's flaps are limited, not infinite.** Line 383: "Infinite mid-air flap (Jump = flap upward, Kick = tuck wings to dive fast...,
   Punch = rapid hover-brake)". Ours: three flaps in hand, one back every so often; a tap hovers; nectar energy; no dive
   (`src/game/dotFlight.ts:5-15`).
8. **5-M is not a guarded stealth run.** Line 384: punch carves DON'T SIT for a checkpoint, kick throws a pebble at guards, stay inside
   Flicker's moving light. Ours: nothing can hurt her, no guards to distract, she cannot fight; she carves by tracing a circle on a trunk;
   Flicker's light shows the last path's steps (`src/game/meecaPlay.ts:1-14`). The carving, Flicker and Pell are right.
9. **Not every boss is "wait for the light".** Line 271. Sky Sovereign already has the research's own Way 3 (311): her dive slams into a
   rock pillar and leaves her stunned 3.2 s (`src/game/sovereignFight.ts:4-8, 29`), and her back can be stomped (`src/game/bossDefs.ts:788-
   809`). The Prowler can be "CAUGHT IN THE MOON" after a pounce (`bossDefs.ts:542`). Every boss's wind-up can be knocked out by a hook or
   mega punch (`bossDefs.ts:5-6`). Our plan says the same wrong thing ("Bosses are 'wait for the glow'. One way to hurt each one",
   PLAN-TO-80 #5).
10. **Bosses already have three phases with arena changes.** Line 283 ("Never let a boss sit on a flat floor doing the same loop"). Code:
    3 phases at 70% and 35% (`src/game/bossAI.ts:365-368`); floods, darkness, falling rocks and minions at phase 3; Venom Fang's perches crack
    (`bossDefs.ts:227-233`). What is missing is phase 2 changes and the "needs the world's mechanic" test.
11. **The Golem's weak point is not only the chest.** Line 271/325: "waiting for the Golem's chest rune to glow". The glow moves after each
    move: chest, head, back, belt, belly, shoulder (`src/game/bossDefs.ts:1570-1580`). The Queen's moves the same way (`bossDefs.ts:1239-
    1249`). He is 1.8 times scale (`bossDefs.ts:1557`), not "4x Pokey's size", and has no vines on his arms (326).
12. **Venom Fang's tip** is "strikes after a red ring flashes. Jump over the lunge, then punch his head" (`src/game/storyBosses.ts:47`),
    not fangs stuck in bark (291).
13. **There are eleven boss fights**, not ten: Thornbark (`bossDefs.ts:2286`).
14. **Swimming is slow, not fast.** Line 372 assumes we can "invert" land speed. Ours is about half a run (`src/game/swim.ts:34-35`, 150 vs
    285 px/s at `src/game/physics.ts:9`). It is right that there is no breath to watch (`swim.ts:43`).
15. **Our controls are not six buttons without a stick.** Lines 180, 211. Two styles: the whole screen (slide, flick, tap) or a floating
    thumb pad with Jump / Punch / Kick buttons (`src/game/controlPrefs.ts:1-5`). There is no climb button (Up climbs on a trunk,
    `src/game/inputEngine.ts:150`). "Virtual joystick thumb drift" (91) maps to our floating pad.
16. **We run at 30 fps, so its frame counts are off by half.** "5 frames" for 0.10 s (168) and "~7 frames" for 0.12 s (220) are 60 fps
    counts; at our 30 fps (`src/game/frameGovernor.ts:4`) 0.10 s is 3 frames. Line 90 gets it right ("3 frames at 30 fps").
17. **Coyote, buffer and the short hop already exist** (`src/game/physics.ts:18-20, 40-43`; `src/game/engine.ts:2169-2176`), more generous
    than the research's numbers; coyote also covers a branch snapping under him (it starts whenever he leaves the ground,
    `engine.ts:2170-2176`). The apex hang (222) and platform carry (170) are the real gaps (R-156, R-152.7).
18. **Stomp and an air kick already exist** (`src/game/engine.ts:742-745` stomp grace and chain; air kick per R-159.1's code fact).
19. **Every world already has a music tempo** (`src/audio/styles.ts:94-220`). The research's examples (90 for World 2, 130 for Worlds 5 and
    8) fit World 2 (94-102) but not Worlds 5 (100-108) or 8 (84-92, a waltz).
20. **The checks it asks for are mostly built** (as measures, not as a generator gate): I/F/P/T/R pacing (`tools/validate/core.ts:240-
    250`), 2.5 s dead walk (`core.ts:141-142`), 45% difference (`core.ts:236-237`, `evaluate.ts:30`), the clumsy thumb at +-100 ms and 15%
    less air control (`tools/validate/play.ts:8-9`), landing in view (`play.ts:301`).
21. **Pieces it proposes that already exist:** the counterweight basket and lift, seesaw and water level in the puzzle kit
    (`src/game/puzzleKit.ts:10-13`); the high/low fork (`src/game/stageForks.ts:1-11`); closing orchids (`src/game/w5Art.ts:81-89`); wind
    pushing him in the air (R-152.1 code fact); bush hiding (`src/game/watcher.ts:13`); stand-still spots (`src/game/patience.ts:2-5`); a
    slide (`src/game/w7Slide.ts`); a rim light against brown (`src/game/heroRim.ts`, off).
22. **Internal slips in the research:** "one of five distinct spatial topologies" (25) but four are listed (26-29, 111); apron 200 px (41)
    vs 250 px (40, 113); coyote/buffer swapped between 168-169 and 220-221.
23. **Right about our game:** 2-4 Over the Water, 3-7 Which Fern? (6 of Grandma's things), 6-6 Lights in the Roots, 6-7 Through the Roots
    with a water wheel, 7-6 Falling Floors, 7-7 a search, 2-6 and 10-2 climbs, 4-7 a long drop, 2-8 rising water (`src/game/stagePlan.ts:44-
    139`, `src/game/w2Sections.ts:990`); all nine script tips it quotes match `src/game/storyBosses.ts:64-202` word for word.

---

## 4. The full ledger

Status: IN (in the code), PART (some of it), NOT (not in the code). Summary: yes / flattened (there but numbers or the point lost) /
missing.

| # | Line | What it says | In our summary? | In rules or plan? | Code | Proposal |
|---|---|---|---|---|---|---|
| 1 | 1 | Matt: take it seriously; it shows "how to introduce the nodes, the tempos, the rhythms"; today is "okay, but it's boring" | flattened (quotes a later line) | §0b header quotes it | n/a | adopt (it is the brief) |
| 2 | 3 | "This will reshape some of the level designs"; "A big part of the plan will be webgl" | yes (item 2) | PLAN Lane 1 | PART: PixiJS stage 0 (`src/game/gpuLayer.ts:1-12`, pixi.js 8.22.0) | adopt (done) |
| 3 | 5 | No pure random (x, y) scattering: the "Procedural Oatmeal Problem" (different positions, same feel) | missing | §0c.5 says the same of petals | n/a | adopt: quote it in §0c.5 |
| 4 | 6 | A 4-layer constrained pipeline driven by stage DNA + replay seed (Dead Cells, Spelunky 2, Launchpad) | yes | PLAN Phase B | PART: gen2's 6 passes (gen2 DESIGN.md) | adapt (gen2 is the pipeline) |
| 5 | 7 | 90 non-boss stages each with fixed DNA; a run seed (Date.now() or a play-count seed) rebuilds graph, beats, geometry and puzzle on every load | flattened (no seed source) | no | PART: curated 16 rolls (DESIGN.md); layout kept until cleared (`layoutMemory.ts:6-12`) | adapt (C1, C2) |
| 6 | 9 | Story stages keep their identity: 2-4 high river swings, 3-7 fern search, 6-6 dark room with Flicker | missing | no | IN: names and types (`stagePlan.ts:48, 62, 95`) | adopt as DNA (miss 7) |
| 7 | 12 | DNA locks primary and secondary mechanics per stage (4-4: wind + breaking branches + vines) | yes | §0b.5 (pairs per world, not per stage) | NOT per stage; 4-4 has no breaking branches (fact 1) | adopt (miss 7) |
| 8 | 13 | Archetype per stage: Standard_Hybrid, Vertical_Ascent (2-6, 10-2), Vertical_Drop (4-7), Rising_Hazard (2-8), Search_Hub (3-7) | flattened ("type") | §0b.6 slot roles; R-153 | PART: objective types (`types.ts:25-29`) | adopt (miss 7, C11) |
| 9 | 14 | DNA names the story line's timing (start / halfway / near) and the collectible (bell note, poster, pocket, ledger page) | flattened | R-4.3 (collectibles) | PART: wayside timing IN (`wayside.ts:27`); ledger/posters NOT | adopt |
| 10 | 15 | A new seed each time the stage is selected or replayed | flattened | no | PART: new roll only after a clear (`layoutMemory.ts:6-12`) | adapt (C1) |
| 11 | 16 | Generator 1: a different 6-8 node graph and camera path | flattened | PLAN Phase B | NOT | adopt (miss 1) |
| 12 | 17 | Generator 2: a new beat timeline for the action nodes | flattened | §0b.9 DRAFT | NOT | adopt (miss 2) |
| 13 | 18 | Generator 3: trace Pokey's jump physics to place platforms on the beats, permute the puzzles | yes | PLAN Phase B | NOT (gen2 sizes gaps from physics, not from beats) | adopt (miss 2, 4) |
| 14 | 19 | Generator 4: compare with the player's previous run and prove 100% reachability | yes | R-150.1 | PART (`layoutMemory.ts:15-19`; levelCheck) | adapt (C3) |
| 15 | 21 | Randomize the level's shape before placing a platform, so a replay isn't "the same hallway with slightly shifted ledges" | flattened | no rule | NOT | adopt (miss 1) |
| 16 | 23-24 | Skeleton: Start, Ki/Intro, Halfway Rest + Wayside, Ten/Climax, Goal | flattened | §0b.2 four parts | PART: gen2 phases start/ki/sho/ten/ketsu/rest/goal (`gen2/types.ts:31`) | adapt: put the story line on the halfway rest |
| 17 | 25 | Graph-rewriting rules turn the middle into one of "five" shapes (four listed) | yes (four) | PLAN Phase B | NOT | adopt (miss 1) |
| 18 | 26 | Over-under loop-back: bottom left-to-right (nodes 1-3), vine shaft up (4), top right-to-left above the start (5-7) for a gate or collectible, drop to exit | yes | PLAN Phase B | NOT | adopt (World 1 candidate: 1-4 Up the Kapok) |
| 19 | 27 | High/low split at node 2: upper sky/vine route (harder, faster, holds a collectible), lower water/root route (puzzle, wading); rejoin at node 5 | yes | PLAN Phase B | PART: old generator forks (`stageForks.ts:1-11`) | adopt in hand-built and gen2 |
| 20 | 28 | Zig-zag chimney: every node alternates short sprints and tall climbs or drops (right, up, left, up, right) | yes | PLAN Phase B | PART: 4-7 goes back and forth across the cliff (`w4LongDrop.ts:2`) | adopt |
| 21 | 29 | Lock-and-key spoke: node 3 has a root door or counterweight gate; spokes up and down to fetch the key (as in 6-7) | yes | PLAN Phase B | PART: 6-7 root door and root-stone (`w6Rooms.ts:8`) | adopt |
| 22 | 31 | A Markov-chain pacing filter assigns a tag to each of 6-8 nodes | flattened | R-150.1, §0c.2 | PART: tags read back by the validator (`tools/validate/core.ts:240-250`) | adopt for building, not only measuring |
| 23 | 32 | [I] Intro/safe: wide platforms, floor that can't kill | yes | §0b.2 part 1 | PART | adopt |
| 24 | 33 | [F] Flow: fast vine swings, mud slides, bounce pods, tailwind glides | yes | §0c.2 | PART: vines, bounce mushrooms (`physics.ts:24`), glide (`glide.ts`) | adopt; mud slides NOT |
| 25 | 34 | [P] Puzzle: slow; pulleys, light/shadow bridges, water wheels, stealth glowworms | yes | §0c.2 | PART: kit (`puzzleKit.ts:10-13`); light bridges NOT (PLAN WebGL) | adopt |
| 26 | 35 | [T] Tight: high-intensity pairs (breaking branches in crosswinds) | yes | §0c.2 | PART | adopt |
| 27 | 36 | [R] Rest: flat safe platform 400-600 px wide, checkpoint flag, story line | flattened (no width) | §0b.1 (no width); §2 1.0-1.2 s pads | PART | adapt (miss 12, C12) |
| 28 | 37 | Never T then T or P then P; after T comes R, F or P; a sine-wave tension curve whatever the seed | yes | R-150.1 (never two Tight); §0b.1 rest between every group | IN as a flag (validator) | adapt §0b.1 (C6) |
| 29 | 40 | Node boxes: 1600 x 900 px for horizontal, 900 x 1600 for vertical; a 250 px join between boxes | flattened (250 only) | no | NOT | adapt (miss 13) |
| 30 | 41 | Every node starts and ends on a flat hazard-free ledge of at least 200 px at the connecting port's height (Low, Mid or High) | flattened (no port heights) | no | NOT | adopt port heights (miss 13) |
| 31 | 42 | Spaced nodes let the player read one challenge room at a time | missing | §0b.1 (rests) | n/a | adopt |
| 32 | 43 | The camera pans or locks to the new node's box before the first jump | missing | no | PART: puzzle rooms only (`puzzleCamera.ts`, GEMINI J2/J4) | adapt for every node |
| 33 | 44 | Sub-1-second respawn onto the node's own safe ledge | missing | §0b.8 respawn within about 2 s of the hard part | PART: respawn at last flag | adapt: a flag per hard node |
| 34 | 46 | Action and puzzle nodes are made by different methods | missing | no | PART: gen2 has rooms vs sections | adopt (miss 4) |
| 35 | 47 | Action/flow nodes: generated forward from physics and musical rhythm | flattened | §0b.9 DRAFT | NOT | adopt (miss 2) |
| 36 | 48 | Puzzle nodes: parameterized spatial templates with rolled variables | flattened | PLAN Phase B | PART | adopt (miss 4) |
| 37 | 52 | A tempo per stage: e.g. 90 BPM relaxed World 2, 130 BPM urgent Worlds 5 and 8; rhythm groups 8-14 s | missing | §0b.9 DRAFT; §2 bursts 10-14 s | PART: music BPM per world (`src/audio/styles.ts:94-220`), not used by levels | adopt (miss 2) |
| 38 | 53 | Worked example, "Waltz Cadence": run 1.0 s, jump at 1.0, land/run 0.5, jump at 1.5, grab vine at 2.1, swing 1.2, jump at 3.3 | missing | no | NOT | adopt as a template sample |
| 39 | 54 | Worked example, "Stutter-Hop": run 0.4, hop at 0.4, bounce pod at 0.9, glide 1.5, grab breaking branch at 2.4, jump at 2.6 | missing | no | NOT | adopt as a template sample |
| 40 | 55-56 | A Ghost Pokey runs that timeline with the real gravity, run speed, jump speed and wind | flattened | no | PART: physics shared with the level check (`physics.ts:1-3`) | adopt |
| 41 | 59a | Wherever the ghost lands, place a branch, ledge, seesaw root or silk bridge | yes | no | NOT | adopt |
| 42 | 59b | Wherever it grabs a vine, put the vine's anchor one vine-length above | missing | no | PART: chained lianas checked (`protoStage.ts:4533-4538`) | adopt |
| 43 | 59c | Wherever it ducks or short-hops, put a hazard on the line it avoided (croc, thorn overhang, rising spear) | missing | no | NOT | adopt (miss 3) |
| 44 | 60 | Claim: every jump possible, spaced for flow, on the beat; a new seed is a new sequence | flattened | no | n/a | adopt as the test of #41-43 |
| 45 | 62 | 15-20 puzzle blueprints; logic fixed; layout, order of steps and numbers roll | flattened | PLAN Phase B (four kinds named) | PART: kit rooms pinned per stage (`w6Rooms.ts:324`) | adopt (miss 4) |
| 46 | 64 | Pulley blueprint logic: hang on vine A to lift blocker B to cross to exit C | missing | PLAN Phase B "pulleys" | PART: counterweight basket and lift (`puzzleKit.ts:11`) | adopt |
| 47 | 66 | Per seed: mirror it (pulley left/exit high-right vs pulley over a central pit/exit low-right) | missing | GEMINI C8 (mirroring NOT) | PART: sections mirror (`gen2/types.ts:358`, `pipeline.ts:601`); rooms don't | adopt for rooms |
| 48 | 67 | Per seed: pulley ratio and decay (2:1 fast lift you swing through; or a root-stone on a breaking branch you drop to hold it for good) | missing | no | NOT | adopt |
| 49 | 68 | Per world hazard layer: World 4 crosswind on the return jump; World 5 a closing orchid on a 3 s cycle as the landing | missing | §0b.5 pairs | PART: closing orchids exist (`w5Art.ts:81-89`) | adopt (miss 4) |
| 50 | 70 | Search blueprint: find N hidden items in a multi-tier room (3-7, 7-7) | missing | R-153 "search-the-room" | IN: 3-7 needs 6 (`protoStage.ts:303-304`) | adopt (miss 9) |
| 51 | 71a | 12-18 fern alcoves on 3 tiers, joined by rolled vine and sinkhole paths | missing | no | NOT | adopt (miss 9) |
| 52 | 71b | The real items go in a different subset of alcoves each run | missing | no | NOT (checked: positions follow the layout roll) | adopt (miss 9) |
| 53 | 71c | Tells: one glowworm humming above the right fern; the Prowler's voice hinting | missing | no | NOT | adopt (miss 9) |
| 54 | 71d | Empty ferns hold small finds or sleeping vines, never nothing | missing | no | NOT | adopt |
| 55 | 74-75 | Story lines keep their start/halfway/near timing (2-2 start, 2-3 half, 8-7 near) | missing | no | IN (`wayside.ts:85-86, 208`) | keep |
| 56 | 76 | "start" attaches to node 1's rest apron | missing | no | PART: after 2.4 s of play (`wayside.ts:325`) | adapt |
| 57 | 77 | "halfway" attaches to the rest of node floor(N/2), the guaranteed mid-stage breather | missing | no | PART: at 50% of length (`wayside.ts:326`) | adopt (miss 12) |
| 58 | 78 | "near" attaches to the entry of node N-1, before the climax | missing | no | PART: at 85% (`wayside.ts:327`) | adopt |
| 59 | 80 | A collectible gets its own side-node matching the script's description ("until found or replayed") | missing | R-4.3 (no rule) | NOT | adopt (miss 11) |
| 60 | 81 | 2-4 ledger page on the highest vine over the river: at 90% of Pokey's best lift-momentum jump off the fastest swing | missing | R-4.3 | NOT (ledger not built) | adopt |
| 61 | 82 | 3-7 ledger page on a dry shelf above the ferns: a vertical [T] climbing spoke above the hub | missing | R-4.3 | NOT | adopt |
| 62 | 83 | 4-7 ledger page in the moss at the bottom of the longest drop, behind the exit chute | missing | R-4.3 | NOT | adopt |
| 63 | 84 | 6-7: Meeca's note co-spawned with the root-stone on the high shelf | missing | no | wrong: w6_note is in 6-2 (fact 4) | not taken as stated; the "spawn with its key prop" idea is good |
| 64 | 87 | Check before load (<12 ms); a failing seed regenerates only the bad node (<2 ms) with seed+1 | missing | no | PART: gen2 repairs one spot (DESIGN.md); offline | already in / not taken (miss 19) |
| 65 | 89 | Gate 1: a search over every platform, vine and bounce pod with Pokey's physics | flattened | R-150.1 | IN: levelCheck + bots | keep |
| 66 | 90 | Thumb timing off by +-100 ms (3 frames at 30 fps) | yes | R-150.1 | IN (`tools/validate/play.ts:8-9`) | keep |
| 67 | 91 | 15% less air control for thumb drift | yes | R-150.1 | IN (`play.ts:8-9`) | keep |
| 68 | 92 | Pass: every exit and every collectible reachable under the clumsy model; no frame-perfect jump | flattened (collectibles dropped) | R-150.1 | PART: exits yes; collectibles under the clumsy bot not checked | adopt: add collectibles |
| 69 | 94-95 | Store the last run's signature in local storage (example string with shape, node moves, rest) | missing | PLAN "Not taken" | PART: last roll number kept (`layoutMemory.ts:15`) | adapt (C3) |
| 70 | 97 | Exclude the previous run's map shape on replay | missing | PLAN "Not taken" | NOT (no shapes) | adopt (miss 1) |
| 71 | 98 | At least 45% different (normalized edit distance) across rhythm groups from last run | yes | R-150.1 (stage vs stage) | PART: 0.35 vs last roll (`layoutMemory.ts:17-18`) | adapt to 0.45 (C3) |
| 72 | 100 | Over 2.5 s of flat walking with nothing: auto-add a slope, a low branch hop, a critter or a bounce pod | flattened (fix lost) | R-150.1 (flag); §2 says about 4 s | PART: flagged (`tools/validate/core.ts:141-142`) | adopt (miss 10) |
| 73 | 101a | At every take-off, the landing is in the camera's view | yes | R-150.1 | IN as a measure (`play.ts:301`) | keep; make it a gate |
| 74 | 101b | Or a breadcrumb trail of fireflies or petals during vertical drops | missing | GEMINI H4 (petal trails) | PART: petal trails | adopt for drops (4-7, climbs down) |
| 75 | 103 | The whole pipeline in under 15 ms at stage start | missing | no | n/a (offline) | not taken |
| 76 | 112 | Example tag string: I, F, P, R:Wayside, T, F | missing | no | n/a | adopt as a worked example |
| 77 | 113 | 250 px flat aprons (also 200 px at line 41) | yes | no | NOT | adapt (miss 13) |
| 78 | 136 | Claim: play 2-4 or 6-7 ten times and get ten different levels, with every story line on cue | missing | PLAN goal | NOT | adopt as the acceptance test for a rebuilt stage |
| 79 | 138 | Move from immediate canvas drawing to batched GPU drawing | yes | PLAN Lane 1, R-3.1-3.7 | PART: stage 0 (`gpuLayer.ts`) | keep |
| 80 | 142 | One texture atlas, one interleaved vertex buffer, one draw call per frame | yes | PLAN keeps PixiJS (no home-made batcher) | PART: atlases (`atlasLoader.ts`) | keep ours |
| 81 | 143 | WebGL 2 instancing for repeated props, branches, grass, trees | yes | no | NOT | adapt: Pixi's batching covers most; note for R-3.5 |
| 82 | 144 | Physics at a fixed 60 Hz, separate from drawing; same at 30 or 120 fps | yes | PLAN "Not taken" | NOT (30 fps lock) | not taken (C14) |
| 83 | 146-148 | Store a tiny DNA config per stage (<100 tokens), not big tile maps | missing | no | PART: stagePlan entries (`stagePlan.ts:30-139`) | adopt (miss 7) |
| 84 | 149-156 | Example DNA: world, stage, seed, archetype "Loopback", modifiers ["Wind","BreakingBranches"], narrativeAnchor | missing | no | NOT | adopt as the DNA shape |
| 85 | 158 | A deterministic random generator expands the seed; a replay rolls new; story, ledger pages and difficulty kept | flattened | no | PART | adapt (C1) |
| 86 | 160 | Spend 80% of engineering time on four pillars (solver, feel, nodes, GPU memory) | missing | no | n/a | adapt: our 80% is fun (Matt's rating) |
| 87 | 162-163 | A search-based solver with Pokey's exact physics constants | yes | R-150.1 | IN (levelCheck, `physics.ts:1-3`) | keep |
| 88 | 164 | "Noisy-bot" penalty: thumb drift and 15% less air control | yes | R-150.1 | IN | keep |
| 89 | 165 | Unreachable: seed++ and regenerate; "zero human playtesting required" | missing | no | n/a | not taken (C13) |
| 90 | 168 | Coyote 0.10 s ("5 frames") after walking off a ledge or a branch snapping | flattened (~0.12) | §0b.8, GEMINI G1 | IN: 0.133 s (`physics.ts:41`), covers snaps (`engine.ts:2170-2176`) | keep ours (C17) |
| 91 | 169 | Jump buffer 0.12 s ("3 frames before landing"), on a platform or silk bridge | flattened | §0b.8, GEMINI G2 | IN: 0.133 s (`physics.ts:41`) | keep |
| 92 | 170 | Add a moving platform's or swinging vine's speed to the jump for 6 frames | missing | R-152.7 | PART: vines yes (`physics.ts:688-693`), platforms no | adopt (R-152.7) |
| 93 | 172 | Stitch modular nodes of 10-15 s | flattened | §0b.1 groups 5-20 s | PART: gen2 sections | adapt (C5) |
| 94 | 173 | A library of 15 node templates (vertical chimney, counterweight pulley room, wind-blown gap, rest platform) | missing | §0c.4: 12+ per world | PART | keep ours (bigger) |
| 95 | 174 | Never two [T] in a row without an [R] or [P] between | yes | R-150.1 | IN as a flag | keep |
| 96 | 177 | Compressed GPU textures (ETC/ASTC/Basis) to save GPU bandwidth | yes | no (GPU-RENDERER-PLAN silent) | NOT (WebP) | adapt: measure in R-3.6; a new R-id if memory is the limit |
| 97 | 178 | Object-pool every particle, dust cloud and floating text, made at stage load | yes | PERFORMANCE-RULES "No allocations in the frame loop... pools" | PART (GEMINI B2) | keep |
| 98 | 180 | Moves: run, jump, kick, punch, double jump, climb | n/a | n/a | PART (fact 15) | note |
| 99 | 182-192 | Four engine tracks under one loop (physics, render, input/UI, generation) | yes | no | PART: engine.ts is one file | not taken (no rewrite) |
| 100 | 195 | Physics: AABB/SAT collisions, momentum, a layered state machine for the player | missing | no | PART | not taken |
| 101 | 196 | Physics in its own fixed step (or a worker) so a drop to 45 fps doesn't change jumps | missing | GEMINI G6 NOT checked | NOT checked | adopt G6's test |
| 102 | 198-199 | Renderer blind to physics; 1-3 draw calls per frame | yes | R-3.x | PART | keep |
| 103 | 201 | Input engine: multi-touch, button zones, haptics, input buffering | flattened | R-162.10 (haptics) | IN: buffers (`inputEngine.ts:60-61`), haptics (`haptics.ts:48-54`) | keep |
| 104 | 202 | Dead zones, edge-swipe suppression, gesture translation before physics | missing | no | PART: gestures (`controlPrefs.ts:3`); back gesture (`backGuard.ts`) | adapt (miss 17) |
| 105 | 205 | Generation isolated from play so it never stutters | missing | no | IN (built before play; offline curation) | keep |
| 106 | 208 | A jump that feels 50 ms late feels cheap: unbuffered touch or garbage-collection spikes | missing | PERFORMANCE-RULES §1 (frame time) | NOT measured | adopt (miss 17) |
| 107 | 209a | Unfiltered random creates bad sightlines, unavoidable enemies, impossible gaps | missing | §2 checks | IN (checks) | keep |
| 108 | 209b | Static hand-made levels with no replay change get "intensely boring past World 3" | missing | no | n/a | adopt (miss 18) |
| 109 | 210 | Readability: background art that blends with hazards or the player (brown hair on brown roots) | missing | §0b.7 (hazards only) | PART: rim light off (`heroRim.ts:7`) | adopt (miss 16) |
| 110 | 215 | Grounded punch/kick: a quick strike or combo | yes | R-159.1 | IN | keep |
| 111 | 216 | In-air punch/kick: dive kick or air punch that changes horizontal speed | yes | R-159.1 | PART: air kick bounces (R-159.1 code fact) | adopt in R-159.1 |
| 112 | 217 | Climbing punch/kick: wall strike or let go to drop | yes | no | NOT checked | adopt: one R-159.1 line |
| 113 | 220 | Coyote 0.12 s ("~7 frames") | yes | §0b.8 | IN at 0.133 | keep |
| 114 | 221 | Input buffer 0.10 s ("~6 frames") | yes | §0b.8 | IN at 0.133 | keep |
| 115 | 222a | Tap: cut upward speed by 50% at once | flattened | R-156 | PART: capped at 230 of 640 px/s (`physics.ts:18-20`) | keep, tune by feel |
| 116 | 222b | Hold: 0.5x gravity for 8 frames at the top of the arc | flattened | R-156 (no number) | NOT | adopt 0.5x for about 0.13 s (miss 15) |
| 117 | 225-263 | Sample sprite batcher: 2000 sprites, 8 floats a vertex, a fixed index buffer, one drawElements | yes | PLAN keeps PixiJS | n/a | not taken (Pixi does it) |
| 118 | 265-269 | Pathfinder from node 0 with max speed, jump height, gravity and coyote; reach exit and collectibles within a 15% safety margin | yes | R-150.1 | PART: gen2 jumps at most 82% of max on Normal, 65% Easy (DESIGN.md) | keep ours (stricter) |
| 119 | 271 | Bosses suffer "Wait-for-the-Light" / whack-a-mole: no agency, "Simon Says on the boss's schedule" | yes | PLAN #5 | PART wrong (fact 9) | adapt: start from what exists |
| 120 | 272 | Every boss: three ways to deal damage with the existing controls | yes | R-161.1, R-161.2 | PART (Sovereign, Prowler) | adopt |
| 121 | 273 | Way 1: the scripted tip, for casual players | yes | R-161.1 | IN | keep |
| 122 | 274 | Way 2: use the world's own platforming mechanic in the arena to make the boss vulnerable early, often 2x damage | flattened (no 2x) | R-161.1 | PART: Sovereign's pillars (`sovereignFight.ts:4-8`) | adopt the 2x |
| 123 | 275 | Way 3: kick vs punch to break guard, reflect a shot or interrupt mid-move | flattened | R-161.1 | PART: hook/mega punch breaks the wind-up (`bossDefs.ts:5-6`) | adopt (miss 14) |
| 124 | 278 | Punch: fast, low recovery, 2-3 quick hits, swats back small shots (Queen's web balls, Drake's coals) | flattened | R-159.1 (enemies) | NOT (no deflect) | adopt (miss 14) |
| 125 | 279-280 | Kick: heavier; ground kick breaks armour, pushes rocks, logs or bombs into the boss, knocks it off balance | flattened | R-159.1 (enemies) | NOT for bosses | adopt (miss 14) |
| 126 | 281 | Dive kick (jump + double jump + kick) bounces off high targets (Rex's snout, Sovereign mid-swoop) | flattened | no | PART: Sovereign's stomp spot (`bossDefs.ts:809`) | adopt |
| 127 | 283 | Three phases at 100% / 66% / 33%; the arena changes at each; never 3 minutes of the same loop on a flat floor | flattened | PLAN item 7 (segments 2/3/4) | PART: 3 phases at 70/35 (`bossAI.ts:365-368`) | adapt (C7) |
| 128 | 284 | Phase 1: flat arena, teaches the core attack and lets the player try all three ways | flattened | no | PART | adopt (C8) |
| 129 | 285 | Phase 2: the arena splits (flood, ceiling drop, crosswinds); the world's mechanic is needed to reach the boss | flattened | PLAN item 7 | PART: Venom Fang only (`bossDefs.ts:229-233`) | adopt (miss 6) |
| 130 | 286 | Phase 3: two attacks at once, and more traps on screen for a big finish | flattened | R-1.15 (bosses 6-8) | PART: more attacks (chain, `bossAI.ts:621`), not more traps | adopt (miss 6) |
| 131 | 290-293 | Venom Fang: two-tier canopy arena; Way 1 punch his head while fangs stick in bark; Way 2 stand on upper breaking branches till they snap, dropping a dead branch on him; Way 3 dive-kick off his sweeping tail to his head | yes | R-161.1 | PART: cracking perch (`bossDefs.ts:227`), vine, climb; tip differs (fact 12) | adopt (R-161.1) |
| 132 | 295-297 | Crocus Rex: muddy bank, floating logs, a counterweight basket overhead; Way 1 punch the snout when jaws clamp | flattened | R-161.2 | PART: boardwalks, swinging log, rope swing (`bossDefs.ts:317-326`) | adopt |
| 133 | 298 | Rex Way 2 "Feed the King": kick a log or mud-rock into his open jaws to jam them (stun) | flattened | R-161.2 | NOT | adopt |
| 134 | 299 | Rex Way 3: lure him onto a sunken seesaw log; his tail slam launches Pokey for a dive kick on his crown | flattened | R-161.2 | NOT (seesaw exists in the kit) | adopt |
| 135 | 301-303 | Prowler: dark ring, 2 moon pools, sleeping ceiling glowworms; Way 1 stand in a pool, punch his glowing collar | flattened | R-161.2 | IN: two moon pools (`lairProwler.ts:3-5`) | keep |
| 136 | 304 | Prowler Way 2: climb, kick a stalactite or ring a bell; the glowworms light the whole centre for 6 s and burn him out of hiding | flattened | R-161.2 | NOT | adopt |
| 137 | 305 | Prowler Way 3 "Sloth Patience": stand perfectly still in the dark 3 s; he stalks out slowly for a guard-break kick | flattened | R-161.2 | NOT (stillness exists in W4, `patience.ts`) | adopt (the most sloth-like) |
| 138 | 307-309 | Sovereign: aerie with side updrafts and crumbling rock pillars; Way 1 sidestep the dive, punch on recovery | flattened | R-161.2 | IN (`sovereignFight.ts`) | keep |
| 139 | 310 | Sovereign Way 2: ride the updrafts or double-jump off a vine to meet her mid-air with a kick that crashes her | flattened | R-161.2 | PART: gust lane rides the leaf (`sovereignFight.ts:12-13`) | adopt |
| 140 | 311 | Sovereign Way 3: stand by a cracked pillar; she wedges in it, stuck for a 4 s combo | flattened | R-161.2 | IN: 3.2 s stun, 2 slams break it (`sovereignFight.ts:4-8, 26-29`) | already in |
| 141 | 313-315 | Queen: silk web canopy, tether lines, a tea table; Way 1 weave her web spread, punch when she drops | flattened | R-161.2 | IN (tip, `storyBosses.ts:113`) | keep |
| 142 | 316 | Queen Way 2: climb the bloom trees, kick the two anchor threads; the web falls and drops her on the tea table | flattened | R-161.2 | NOT | adopt |
| 143 | 317 | Queen Way 3 "Projectile Tennis": punch her sugar-web ball or teacup back into her face | flattened | R-161.2 | NOT (web shots are lobs, `bossDefs.ts:1291`) | adopt |
| 144 | 319-321 | Reaver: shallow blackwater, a water-wheel valve, two stilt-root pillars; Way 1 jump the wave, duck the spear, punch | flattened | R-161.2 | IN (tip, `storyBosses.ts:128`) | keep |
| 145 | 322 | Reaver Way 2: jump onto his thrust spear, run along it, kick his helmet | flattened | R-161.2 | NOT | adopt |
| 146 | 323 | Reaver Way 3: spin the arena's water wheel (from 6-7) to flood it waist-deep: no mud waves, he slows | flattened | R-161.2 | NOT (the wheel exists in 6-7, `w6Rooms.ts:6`) | adopt (cause and effect from 6-7) |
| 147 | 325-327 | Golem: tall crumbling hall, 4x Pokey, vines on his arms, falling blocks; Way 1 dodge the fist, punch the chest rune | flattened | R-161.2 | PART: rune moves by move (`bossDefs.ts:1570-1580`) | keep |
| 148 | 328 | Golem Way 2 "Shadow of the Colossus": climb the vines on his arm after a slam, dive-kick the rune from his shoulder | flattened | R-161.2 | NOT | adopt (needs art) |
| 149 | 329 | Golem Way 3: lure his stomp under a cracked ceiling (from 7-6 Falling Floors) so a slab cracks his rune | flattened | R-161.2 | PART: phase-3 ceiling rocks (`bossDefs.ts:1595-1600`) | adopt |
| 150 | 331-333 | Monarch: pitch-black canopy, three hanging lantern jars; Way 1 listen, dodge, punch as she banks | flattened | R-161.2 | IN (tip, `storyBosses.ts:162`) | keep |
| 151 | 334 | Monarch Way 2 "Moth-to-a-Flame": hit a lantern so it swings and glows; she hovers at it, open | flattened | R-161.2 | NOT | adopt |
| 152 | 335 | Monarch Way 3: ring a wind bell or ride her wing gust up behind her to her poem perch | flattened | R-161.2 | NOT | adopt |
| 153 | 337-339 | Drake: lava cave, hoard of pots, bells, boots, socks, two thermal vents; Way 1 jump the flame, punch as he rears | flattened | R-1.9 | PART (heat ride in R-1.9) | keep |
| 154 | 340 | Drake Way 2 "Weaponize the Hoard": kick a pot, boot or sock bundle into his mouth as he inhales | flattened | R-1.9 | NOT | adopt into R-1.9 |
| 155 | 341 | Drake Way 3: smash a vent cap so the plume cools his belly to brittle rock, double damage to kicks | flattened | R-1.9 (crust) | PART: "crust" in R-1.9's design | adopt |
| 156 | 343-346 | Iron-Claw: rain-lashed courtyard, wall netting, thunder squalls, collar chains; he adapts to what you used; Way 1 hit the glow | flattened | R-1.10 | IN (tip, `storyBosses.ts:202`) | keep |
| 157 | 347 | Iron-Claw Way 2: grip the netting in a squall as the wind pushes his cape, launch a tailwind flying kick | flattened | R-1.10, R-2.7 (hold rule) | NOT | adopt into R-1.10 |
| 158 | 348 | Iron-Claw Way 3: time a heavy kick to clash with his claw swing; his own speed spins him, back exposed | flattened | R-1.10 | NOT | adopt |
| 159 | 350 | One shared boss state machine with the same 4 "vulnerability receptors" | yes | R-161.1 template | PART: shared bossAI (`bossAI.ts`) | adopt |
| 160 | 351-364 | Config fields: glow time; parry shots with punch; guard-break with kick; bounce with dive kick; hurt by a dropped prop; hurt by a kicked prop; a climbable body part | flattened | no | PART: `vulnerability()` closed/armored/open/stunned (`bossAI.ts:371`) | adopt these seven fields |
| 161 | 366 | 1 standard window + 1 kick/punch counter + 1 arena prop per boss: casuals use the tip, skilled players the arena | yes | R-161 | PART | adopt |
| 162 | 368 | Real sloth biology as moves, and special stages per world, so it isn't "a 10x10 reskinned matrix" | flattened | PLAN Later | PART | adopt (miss 5, 8) |
| 163 | 371a | Tendon lock: hanging costs nothing; no grip meter | yes | R-160.1 | IN (no grip meter exists) | keep |
| 164 | 371b | While hanging he ignores gravity and wind | missing | no | IN on vines: "wind only pushes him in the air: on the vine he is safe" (`protoStage.ts:4536`) | keep; same rule for under-branch hanging |
| 165 | 371c | Letting go at the exact right moment is the skill test | missing | no | PART: forgiving sweet spot (`physics.ts:663-672`) | adapt (C16) |
| 166 | 371d | Walk upside-down under branches whose tops are thorns | yes | R-160.1, R-160.2, R-2.4 | NOT | adopt (in plan) |
| 167 | 372a | Sloths swim three times faster than they walk and hold breath 40 min | yes | R-5.22 | PART: half a run (`swim.ts:34-35`) | adopt (C15) |
| 168 | 372b | Water stages (6-7) become fast, no oxygen timer, relief zones | yes | R-5.22 | PART: no breath (`swim.ts:43`), slow | adopt |
| 169 | 373a | Hold down/still on moss or ferns in Worlds 3 and 8: patrols (Night Hunters, Stone Sentries) pass over him | flattened | R-162.7 (later) | PART: bush hide vs eagle (`watcher.ts:13`) | adopt now (miss 8) |
| 170 | 373b | A burst of sloth moths on the double jump lights dark platforms briefly | flattened | R-162.7 | NOT | adopt for Worlds 3, 6-6, 8 |
| 171 | 374 | Neck turn: hanging still + a direction pans the camera 40% further to scout | flattened | no R-id; GEMINI J5 NO | NOT: look-ahead 90 px by facing (`cameraFollow.ts:21`) | adapt (C9) |
| 172 | 375 | Belly slide: hold down on mud banks (W2), mossy chutes (W4), ash slopes (W9); claws catch overhead zip-vines | flattened | no R-id | PART: 7-4's slide (`w7Slide.ts:9`) | adopt (miss 8) |
| 173 | 377 | One special stage per world (replacing a mid-world slot or as a secret), same buttons doing new things | flattened | PLAN Later, R-162.5 | PART: seven exist (fact 6) | adapt (miss 5) |
| 174 | 380 | 1-S rolling seed pod down a hollow trunk: run = torque, jump hops it, kick crushes thorn walls | flattened | no | NOT (W1 has 1-8 chase) | consider (1-8 is W1's) |
| 175 | 381 | 2-S one-log raft down rapids ahead of Gruntlewick's flood wave: punch paddles, kick tilts to jump snappers and whirlpools | flattened | no | NOT (W2 has no special) | adopt (W2 gap) |
| 176 | 382 | 3-S Prowler's shadow run after "Could I come?": panther physics, punch = shadow dash through grates, climb = wall scramble | flattened | no | NOT (W3 has no special) | adopt (W3 gap) |
| 177 | 383 | 4-D: infinite flap, kick dives, punch brakes | flattened | R-141.1, R-149.12 | PART: limited flaps, tap hovers (`dotFlight.ts:5-15`) | consider for R-141.1 (a dive move) |
| 178 | 384 | 5-M: no attacks; punch carves DON'T SIT as a checkpoint; kick throws a pebble to distract guards; stay in Flicker's light | flattened | no | PART: carving, Flicker; no guards (`meecaPlay.ts:1-14`) | not taken as stated (5-M is built and Matt-approved) |
| 179 | 385 | 6-S Venom Fang as a living vine bridge: punch whistles him to coil (lift) or stretch (tightrope) | flattened | no | NOT (W6 has 6-8) | consider (cause and effect from the W1 boss) |
| 180 | 386 | 7-S Acoustic Bell Hall: invisible platforms; hitting a bell sends a ring that makes them solid for 4 s, on a beat | flattened | PLAN WebGL "light-solid bridges" | NOT (W7 has 7-4) | adopt as a piece in World 7 |
| 181 | 387 | 8-S Flicker's Constellation Relay: jump zips the spark between firefly nodes; punch flashes to stun Night Hunters 2 s | flattened | no | PART: 8-4 Lantern Run (`w8Lantern.ts:2`) | keep 8-4; borrow the stun |
| 182 | 388 | 9-S Pell's thread delivery: shield over his head bounces magma rocks; kick ties thread between posts to cross lava | flattened | R-2.4 (9-2 is the canopy special) | NOT | consider (Pell's thread is 9-8's story) |
| 183 | 389 | 10-S The Reach: lightning rate doubles; each broken guardian collar gives an assist on your inputs (Sovereign updrafts on double jump, Golem shockwave on landing) | flattened | R-2.8 (10-8), R-2.10 | NOT | adopt the assists idea for World 10 |

**Counts:** 183 rows. In our summary: yes 49, flattened 81, missing 52, n/a 1. Missing or flattened: 133 of 183. Rules or plan say "no"
for most of the missing ones; code status: IN 29, PART 83, NOT 60, n/a 10, wrong 1 (row 63).
