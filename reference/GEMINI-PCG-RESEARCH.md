# Gemini research on stage generation (Matt, 2026-10-27)

Matt asked Gemini how good 2D platformers and procedural-generation research build, check and vary levels, and pasted the answers
in four parts. They are kept here word for word, so every helper building or checking stages can read them. Read this before
building stages, the stage inspector, the puzzle kit or the new generator.

**What we took from it (Matt approved the approach, 2026-10-27; see the Docs roadmap "Generator upgrade"):**
1. Offline seed curation: generate many layouts per stage on a computer, score them, ship the best.
2. A dead-time limit in seconds (about 2 s Normal, 3 s Easy): only jumps, timing choices and puzzle actions count, never petals on
   flat ground (a petal arc over a gap counts half), with a short safe rest after each burst.
3. Sameness: weighted action strings; compare every 20-second stretch against the world's other stages; reject repeats.
4. Noisy-thumb bots (drift, late lift-off, short flicks, thumb switching) to find death hotspots; reaction latency about
   N(+90 ms, 65 ms) for the Easy kid, smaller for Normal.
5. First-lesson rooms: no enemies, no deadly fall, can't be skipped, the room shows the idea by itself first.
6. **Expressive range analysis (part 3 below): generate a big batch of rolls of each stage (we use 200), score each on a few
   measures (linearity, leniency, density, path shape, action mix), plot them, and check the rolls actually differ (a diversity
   score; Gemini suggests at least 0.35) instead of clustering in one spot. Matt asked for this tool on 2026-10-28.**
7. Jump forgiveness for 30 fps touch (part 3's table): coyote time about 133 ms Normal / 167 ms Easy, jump buffer 133 / 200 ms,
   ledge-landing forgiveness, head-bonk and shin-mantle corner correction (a jump into a face carries over its lip).
8. Puzzle rooms: parts placed relative to their platform; 1-2 steps on Easy, 2-3 on Normal; "stuck" means going back and forth
   with no progress or two failed tries, not a clock; hints under 10 words; never shrink Pokey below about 0.75x; lean the camera
   toward the next part; narrow-and-tall rooms; connect a far switch and gate with something visible and pan to the gate once.
9. Variety rules: a cooldown so the same piece is not used twice within two stages or twice in a world run.
Skipped on purpose: an engine switch, shuffling stages per playthrough, a peek-drag gesture (it clashes with our touch controls).

---
## Part 1 (pasted 2026-10-27 16:50 UTC)

So while I'm waiting for my tokens to regenerate so we can start again, I wanted to look at our level generator. And I went out to Gemini and had to do research on best practices and other things. No, I don't expect this to follow it 100% because I have some rules that I've made that could go against this, such as length and other things. But I want you to look at it and tell me what you think and what seems logical to implement, along with any follow-up questions we have for Gemini.
Designing a procedural 2D platformer on mobile that spans 10 distinct worlds—with each world containing 9 generated levels of unique archetypes before a 10th handcrafted finale—requires a Hybrid Graph-and-Chunk Architecture. Pure tile-by-tile randomness (like standard Perlin noise or basic cellular automata) creates chaotic, unreadable geometry and unsolvable jumps. Instead, top platformers pair human-authored micro-challenges with algorithmic macro-assembly.
Part 1: How the Greatest Platformers Design Levels & Keep Them Fresh
A deep dive into the industry's benchmark handcrafted and procedural 2D platformers reveals four core design philosophies that you must encode directly into your generator's logic.
1. Nintendo’s Kishōtenketsu (4-Act Pacing Structure)
Developed and popularized by Koichi Hayashida and Shigeru Miyamoto across the Super Mario series, Kishōtenketsu is a 4-step structural philosophy that teaches mechanics without text tutorials and prevents repetition within a single level:
 * Ki (Introduction): Present the level's primary mechanic or prop (e.g., a seesaw platform, a wind shutter, or a rising water sluice) in a zero-risk environment. If the player fails the jump, they land on solid ground rather than a bottomless pit or hazard.
 * Shō (Development): Expand on the mechanic by removing the safety net or demanding precision timing (e.g., jumping across two consecutive seesaws over a hazard pit or timing a jump with a spinning pinwheel).
 * Ten (Twist / Combination): Cross-pollinate the primary mechanic with a secondary world element or enemy (e.g., tilting a seesaw while dodging a patrolling enemy or catching an acorn mid-air to drop onto a pressure plate).
 * Ketsu (Conclusion): A final, high-intensity climax test that allows the player to show off complete mastery of the mechanic right before hitting the level goal or unlocking a bonus reward.
2. Donkey Kong Country: Tropical Freeze & Super Mario Bros. Wonder (Contextual Evolution & Ecosystem Identity)
Retro Studios (Tropical Freeze) and Nintendo (Mario Wonder) avoid sterile "floating blocks in the sky" by rooting every platform in the biome's environmental logic.
 * Environmental Cohesion: Platforms are not abstract rectangles; they are swaying canopy branches, sinking mudflat logs, or crumbling stone ruins.
 * The "One-Off Wonder" Rule: To keep worlds fresh across 10 stages, each level introduces a single focal twist (e.g., silhouettes, rhythmic sinking platforms, or low-tide/high-tide shifts) that never overstays its welcome. Your requirement of having 1 unique signature level per world (e.g., a boulder/caiman chase, mudslide, or vertical canopy climb) directly mirrors this philosophy.
3. Celeste (Screen-Level Micro-Pacing & Sight-Readability)
Celeste structures levels as discrete, self-contained "rooms" or "screens."
 * Immediate Sight-Reading: Especially critical on a small mobile screen, the player must be able to look at the immediate viewport and understand the puzzle or platforming sequence within 2 seconds.
 * Safe Anchor Points: Every intense 5-to-10-second platforming burst is bookended by a flat, safe resting platform. This creates a "tension and release" heartbeat that prevents player fatigue—crucial for mobile touch-screen ergonomics.
4. Spelunky & Dead Cells (The Gold Standards of Procedural Platforming)
Neither Spelunky nor Dead Cells generates levels tile-by-tile from scratch.
 * Spelunky's Solution Path & Sub-Chunking: Derek Yu designed Spelunky around a 4x4 grid of rooms. A walker algorithm first carves a guaranteed "Solution Path" from top to bottom. Each room along that path is chosen from a library of handcrafted templates matching the required exits (Left-Right, Left-Bottom, Top-Bottom). Inside each room template, specific sub-blocks (e.g., a 5x3 obstacle area) and probabilistic tiles (e.g., "40% chance of a push-block, 25% chance of spikes") are rolled dynamically so the same template never plays the same way twice.
 * Dead Cells' Concept Graphs: Motion Twin uses a Grammar Graph (node-and-edge layout) to define the mission structure of a biome before placing a single pixel. The graph dictates: [Start] -> [Combat Corridor] -> [Locked Door] (with branch to [Key Room]) -> [Treasure Room] -> [Exit]. Once the graph is set, the engine selects handcrafted room chunks specific to that biome and stitches them together.
Part 2: Engine Architecture, Randomness, Solvability Validation & "Fun" Heuristics
1. Choosing & Structuring the Game Engine for Mobile
For a 2D mobile platformer featuring rich 2D sprite sheets, multi-layer parallax backgrounds, and procedural generation, Godot 4.x or Unity (Universal Render Pipeline 2D) are the industry standards:
 * Godot 4 (TileMapLayer & Resource Data): Extremely lightweight binary size for mobile, instant startup, native 2D pixel/painted-art pipeline, and TileMapPattern / Scene-Tile support that makes chunk instantiation effortless.
 * Unity 2D (Tilemap & ScriptableObjects): Industry-standard mobile profiler, C# Job System / Burst Compiler (allowing heavy graph pathfinding and generation validation to run on background threads in under 15 milliseconds without freezing the mobile UI).
 * Mobile Performance Rules: Never Instantiate() and Destroy() hundreds of sprites at runtime during gameplay. Generate the level data array in memory during the loading screen, bake static geometry colliders into a single merged CompositeCollider2D (Unity) or merged physics polygon (Godot), and use Object Pooling for enemies, projectiles, and interactive props.
2. True Variety: Keeping Randomness Fresh ("Bag" Systems & Poisson Spacing)
Pure Random.Range(0, N) feels terrible to human players because true randomness clusters—it can easily spawn the same seesaw prop 4 times in a row while never spawning a pulley basket.
 * The "Shuffle Bag" (Tetris Randomizer) for Archetypes & Chunks: Instead of rolling a random die for which level type or chunk to use, put all available items into a virtual bag, shuffle them (Fisher-Yates shuffle), and draw them one by one. When a chunk or prop is drawn, its weight drops to 0 until the bag is empty or a cooldown of K rooms has passed.
 * 1D/2D Poisson Disk Sampling for Prop & Enemy Spacing: To ensure interactive pieces (levers, acorns, enemies, bounce mushrooms) are spread out and always usable, enforce a Minimum Exclusion Radius (R_{min}) and Maximum Starvation Distance (R_{max}):
   * No two interactive mechanics of the same category may spawn closer than R_{min} tiles (prevents overlapping clutter where a player accidentally triggers a lever while fighting an enemy).
   * Every chunk along the active path must contain at least one interactive world piece within R_{max} tiles (prevents barren, boring walking hallways).
 * Parametric Sub-Chunk Sockets: Within each chunk, place modular "Sockets" ([Socket_Platform_A], [Socket_Hazard_B], [Socket_Puzzle_Prop]). A single chunk template with 4 sockets, where each socket has 3 valid world-specific prop variations, yields 3^4 = 81 distinct permutations from a single layout.
3. Mathematical Solvability Validation (100% Possible Levels)
You must guarantee that every generated level is 100% beatable under the exact physics of the player's currently unlocked moveset. This is achieved via a Two-Tier Validation System:
Tier A: Kinematic Reachability Parabolic Math (Micro-Validation)
Every platformer character is governed by deterministic kinematics. Given initial jump velocity v_{y0}, gravity g, and maximum horizontal air speed v_x:
 * Maximum Jump Height (H_{max}):
   
 * Time to Apex (t_{apex}):
   
 * Maximum Horizontal Distance across a height difference \Delta y (D_{max}):
   
To ensure the game feels responsive on mobile touch screens, apply a Safety Margin Coefficient (\mu) based on the difficulty setting:
 * Easy Difficulty: \mu = 0.65 (The generator never places a required jump wider than 65% of the player's theoretical maximum jump distance, leaving massive room for late thumb inputs).
 * Normal Difficulty: \mu = 0.82 (Demands cleaner timing while still forgiving minor mobile touch latency).
Tier B: State-Space A^* Kinematic Graph Search (Macro-Validation)
After assembling a level, run an automated Kinematic A^* Pathfinding Agent before the loading screen finishes:
 * Build the Platform Graph: Every standable surface, ladder, vine, or interactive lift is represented as a Node V.
 * Generate Directed Movement Edges (E): For every pair of surfaces (V_a, V_b), test if a valid parabolic trajectory connects them without intersecting solid ceiling/wall tiles. Tag each edge with the required move: Walk, BasicJump, WallJump, Glide, ThrowPropAtSwitch, etc..
 * Simulate State & Inventory: The A^* state is not just position (x, y); it is a tuple:
   
 * Verify Goal Reachability: If the A^* solver can transition from Start_State to Goal_State (where all required cages are freed, puzzle doors opened, or collection quotas met) using only the moves unlocked up to that World and Level, the level is Valid. If not, the generator automatically mutates the blocking chunk or re-rolls the seed in milliseconds.
4. Encoding "Fun" into the Algorithm (Rhythm Groups & Flow Curves)
Academic research on procedural platformers (specifically Gillian Smith et al.'s Launchpad rhythm-based generator) demonstrates that platforming "fun" is musical.
 * Rhythm Groups: Instead of measuring distance in tiles, measure in Time & Action Beats (e.g., Short-Jump (0.4s) -> Run (0.5s) -> Jump (0.4s) -> Rest (1.5s)).
 * Sawtooth Tension Curve: Map a target difficulty curve across the level's chunks matching Kishōtenketsu:
   * Chunks 1–2 (Ki): Tension = 0.2 -> 0.4
   * Chunks 3–4 (Shō): Tension = 0.5 -> 0.7
   * Chunk 5 (Safe Breather / Checkpoint): Tension = 0.1
   * Chunks 6–7 (Ten): Tension = 0.6 -> 0.85
   * Chunk 8 (Ketsu Climax): Tension = 0.95
   * Chunk 9 (Exit Reward): Tension = 0.0
 * Usability Guarantee (Dependency Binding): Never spawn an interactive tool (like a heavy stone, acorn, or pinecone) without binding it to a receptor (a pressure plate, fragile bridge, or seesaw) within the same or immediately adjacent chunk. In your generator, props are spawned as Linked Pairs (Source_Spawner + Target_Receptor), never as isolated orphans.
Part 3: Step-by-Step Blueprint to Build the Generator Engine
Here is the complete architectural model to build your 10-World, 10-Level-per-World mobile platformer generator.
1. The Global Progression Matrix (10 Worlds \times 10 Levels)
Your game has 100 total stages (90 procedurally generated + 10 hardcoded finales). Every stage is governed by a composite difficulty score D(W, L) where W \in [1..10] is the World and L \in [1..9] is the Level:
 * D_{base}(W): Base complexity of the world (scales from 10 in World 1 to 65 in World 10).
 * \alpha \cdot (L - 1): Intra-world skill ramp. Level 1 of a new world drops slightly below the end of the previous world so the player can comfortably learn the new world's mechanic and creature before ramping up through Level 9.
 * \beta_{easy}: Difficulty mode modifier (15 for Easy Mode, 0 for Normal Mode).
How Easy vs. Normal Mode Adapts the Generator (Same Seed, Adapted Rules):
| Parameter | Easy Mode | Normal Mode |
|---|---|---|
| Jump Distance Margin (\mu) | Max 65% of physical jump limit | Max 82% of physical jump limit |
| Platform Widths | +2 tiles wider on all landing pads | Standard chunk widths |
| Hazard Penalty | Bottomless pits replaced with bounce-nets or 1-HP water/vine rescue | Standard pit/hazard penalties |
| Enemy Density & Speed | 60% enemy budget; slower projectile/patrol speeds | 100% enemy budget; full AI reaction speed |
| Puzzle / Collection Quota | 1-step logic (1 lever/plate); collect 70% of spawned items | Multi-step logic (linked pulleys/mirrors); collect 100% of required items |
| Coyote Time & Jump Buffer | 180ms Coyote Time / 180ms Jump Buffer | 100ms Coyote Time / 120ms Jump Buffer |
2. Avoiding Redundancy: The 9-Level World Director ("Mission Deck")
To ensure the 9 generated levels in a world never feel redundant, the World Director builds a constrained 9-Card Mission Deck at the start of each world. Every level in that world draws a distinct Level Archetype with its own Graph Grammar and win condition:
| Level Slot | Recommended Archetype Routing | Core Graph Topology & Generator Rules |
|---|---|---|
| Level 1 | Onboarding / Exploration | Linear left-to-right with safe lower paths; introduces World's new Move & Creature in safe Ki chunks. |
| Level 2 | Collection Quest | Hub-and-spoke or multi-tier horizontal layout; spawns N target items (e.g., golden petals, mangos, fireflies) across micro-branches. |
| Level 3 | Puzzle & Problem Solving | Gated rooms with Lock-and-Key / Switch-and-Door dependency graphs (seesaws, pressure plates, sluice gates, light mirrors). |
| Level 4 | Combat / Gauntlet | Wide arena chunks interspersed with traversal; locks arena gates briefly until wave budget of world creatures is cleared or bypassed. |
| Level 5 | World-Unique Signature Level | 100% unique to this World (e.g., World 1: Canopy Vine Chase; World 2: River Raft/Slide; World 3: Vertical Sinkhole Climb; World 4: Stealth/Disguise). Uses a specialized directional generator rule. |
| Level 6 | Rescue / Freeing | Branching side-chambers holding K trapped critters/cages guarded by environmental puzzles or elite enemies. |
| Level 7 | Vertical / Precision Traversal | Shifts camera bias to vertical/diagonal climbing or wind/current riding; tests mastery of the World's movement mechanic. |
| Level 8 | Hybrid Puzzle-Combat | Combines world props with enemy encounters (e.g., using traps/stones against armored creatures or luring guards). |
| Level 9 | Mastery Gauntlet (Pre-Boss Test) | High-tempo Kishōtenketsu synthesis testing every prop, enemy, and move from the world before the final stage. |
| Level 10 | Hardcoded World Finale | Handcrafted boss battle or cinematic set-piece escape. |
(Note: Slots 2–4 and 6–8 are shuffled per playthrough using constrained rules so two heavy combat or two heavy puzzle levels never sit back-to-back, while Level 1 is always Onboarding, Level 5 is always the Signature Mechanic, and Level 9 is always the Pre-Finale Gauntlet).
3. Data Structures: How to Format Instructions for the Generator
Your generator needs three clean JSON/ScriptableObject configuration files to operate:
A. WorldManifest (Defines the Biome's Toybox)
{
  "world_id": "world_03_mist_cascades",
  "world_index": 3,
  "unlocked_moves": ["walk", "jump", "throw_prop", "wind_glide"],
  "unique_level_archetype": "updraft_vertical_climb",
  "prop_pairs": [
    {
      "pair_id": "stone_basket_lift",
      "source_prop": "heavy_stone",
      "receptor_prop": "counterweight_basket",
      "min_spacing_tiles": 4,
      "max_spacing_tiles": 14
    },
    {
      "pair_id": "wind_shutter_pinwheel",
      "source_prop": "lever_switch",
      "receptor_prop": "bamboo_wind_shutter",
      "min_spacing_tiles": 3,
      "max_spacing_tiles": 10
    }
  ],
  "creatures": [
    { "id": "wind_beetle", "threat_cost": 2, "preferred_terrain": "flat_platform", "min_platform_width": 5 },
    { "id": "cliff_hopper", "threat_cost": 4, "preferred_terrain": "stepped_ledges", "min_platform_width": 3 }
  ]
}

B. ChunkTemplate (Handcrafted Modular Room Blueprints)
Every chunk is a small grid (e.g., 24x16 tiles—roughly 1 to 1.5 mobile screens wide) authored in your level editor with metadata tags:
{
  "chunk_id": "mc_puzzle_04",
  "biome": "world_03_mist_cascades",
  "valid_archetypes": ["puzzle", "freeing", "hybrid"],
  "kishotenketsu_phase": ["sho", "ten"],
  "base_difficulty": 4,
  "connectors": {
    "west": { "y_tile": 6, "height": 4, "type": "ground" },
    "east": { "y_tile": 10, "height": 4, "type": "ledge_jump" },
    "north": null,
    "south": null
  },
  "sockets": [
    { "socket_id": "s1", "x": 8, "y": 6, "role": "prop_source", "allowed_tags": ["heavy_stone", "lever_switch"] },
    { "socket_id": "s2", "x": 16, "y": 10, "role": "prop_receptor", "linked_to": "s1" },
    { "socket_id": "e1", "x": 12, "y": 6, "role": "enemy_patrol", "max_threat": 4 }
  ]
}

4. The 6-Pass Generation Pipeline (How to Put Everything Together)
When the player taps "Play Level" on their phone, execute this 6-pass pipeline in a single deterministic sequence seeded by RunSeed + WorldIndex * 100 + LevelIndex:
Pass 1: Context & Budget Initialization
 * Read (World, Level, DifficultyMode) and calculate the target Difficulty Budget D(W, L).
 * Pull the assigned Archetype from the World Director's 9-Card Mission Deck (e.g., Level 3 = Freeing, Level 5 = World_Unique_Chase).
 * Initialize the World Piece Shuffle Bag containing all props and creatures for the current world so every piece is guaranteed to see play across the world.
Pass 2: Mission Graph Generation (Graph Grammar Rewriting)
Build an abstract node graph representing the flow of rooms before placing any geometry:
 * If Archetype = Puzzle: Generate a backbone chain of 6–8 nodes, then apply the Key-Lock Rewrite Rule—inserting a Gated_Node on the main path and sprouting a side-branch Switch/Key_Node before it.
 * If Archetype = Freeing or Collection: Generate a central spine with 3 to 5 short 1-room branches (Cage_Room or Collectible_Alcove) and set the level exit condition to require all K objectives.
 * If Archetype = Unique_Chase or Slide: Generate a strictly linear, high-velocity directional chain ([Start] -> [Speed_1] -> [Speed_2] -> ... -> [Goal]) with zero backtracking branches and automatic camera scroll rules.
 * Tag each node in the graph with its Kishōtenketsu Phase (Ki, Sho, Ten, Ketsu) and target tension score.
Pass 3: Chunk Selection & Connector Stitching
Iterate through the Mission Graph and select concrete ChunkTemplate blueprints from your library:
 * Filter candidate chunks by:
   * Matching biome == Current World
   * Matching valid_archetypes contains Current Level Archetype
   * Matching connectors align with the previous chunk's exit
   * Matching kishotenketsu_phase and base_difficulty within tolerance
   * chunk_id has not been used in the last 2 levels (History Cooldown Buffer)
 * Stitch the chunks into a unified 2D tile grid. If two connectors have a slight height offset, run a Micro-Bridge Stitcher that inserts 1–2 stepping platforms or a vine/ladder within the player's safe jump margin \mu.
Pass 4: Dynamic Piece Population (Poisson Spacing & Dependency Pairing)
Populate the empty sockets inside each placed chunk:
 * Resolve Linked Puzzle Pairs First: For every prop_receptor socket (e.g., a closed sluice gate, seesaw, or counter-weighted lift), spawn its required prop_source (crank, stone, acorn) in the linked s1 socket.
 * Apply Difficulty Modifiers: If on Easy Mode, widen platforms by 2 tiles at ledge edges, disable secondary hazard sockets, and simplify 2-switch doors into 1-switch doors.
 * Populate Creatures via Threat Budget & Poisson Distance: Iterate across enemy_patrol sockets. Draw creatures from the World Shuffle Bag until the chunk's threat budget is met. Enforce the Poisson distance check: if an enemy socket is within R_{min} = 5 tiles of a puzzle lever or another enemy, skip it so the player always has clean space to interact with props.
Pass 5: Automated Kinematic A^* Validation & Auto-Repair
Run the State-Space A^* Validator across the assembled tilemap:
 * Compute all valid walking, jumping, climbing, and prop-activation edges using the difficulty-scaled safety factor (\mu = 0.65 for Easy, \mu = 0.82 for Normal).
 * Verify that:
   * Every required collectible or trapped cage is reachable from Start.
   * Every prop_source needed to open a gate is reachable before the gate itself.
   * The Goal is reachable after completing all level objectives.
 * Local Self-Healing: If a jump between Platform_A and Platform_B fails reachability, the generator first tries Local Repair—automatically inserting an intermediate helper platform, extending a ledge by 2 tiles, or growing a climbable vine/ladder. If a chunk is still invalid, swap only that single chunk from the pool rather than discarding the entire level.
Pass 6: Visual Polish, Biome Dressing & Mobile Ergonomics
Once the level passes validation:
 * Run an Auto-Tile & Prop Decorator pass to place non-collidable background foliage, decals, lighting shafts, and biome-specific visual cues around the geometry.
 * Place Breadcrumb Guidance (e.g., small trails of collectible seeds, fireflies, or subtle signposts) along the primary trajectories or pointing toward branch rooms so mobile players never get lost on a small viewport.
 * Bake static collision meshes and hand control to the player.
Interactive Generator Pipeline & Solvability Visualizer
To see how these systems work together mathematically, use the interactive simulator below to step through the 6-Pass Generation Pipeline, switch between Level Archetypes (Puzzle, Collection, Freeing, Combat, World-Unique), toggle Easy vs. Normal Mode, and inspect how the Kinematic A^* Parabolic Validator verifies and repairs jumps across your 10-world progression curve.
Summary Checklist of Best Practices for Your Engine
 * Never Generate Tile-by-Tile in Isolation: Build a library of 35–50 small handcrafted chunks per World (24x16 tiles each) with 3–5 parametric prop/enemy sockets inside each chunk. This gives you tens of thousands of solvable, human-feeling combinations per world while respecting your painted art style.
 * Enforce the 9-Card Mission Deck per World: By locking Level 1 (Onboarding), Level 5 (World-Unique Signature Mechanic), and Level 9 (Mastery Synthesis), and shuffling the remaining 6 objective archetypes (Puzzle, Collection, Combat, Freeing, Vertical Traversal, Hybrid) without adjacent repeats, every single level in a world has a distinct purpose.
 * Separate "Layout Seed" from "Difficulty Rules": Easy Mode and Normal Mode should use the exact same generator pipeline, differing only in their Kinematic Margin (\mu = 0.65 vs. 0.82), Platform Edge Padding (+2 tiles), Hazard Forgiveness, and Objective Quotas.
 * Always Validate Before Rendering: Keep your Kinematic A^* Validator decoupled from rendering so it runs on raw tile arrays in under 5 milliseconds during the loading transition—auto-healing any gap that exceeds \mu \cdot D_{max} before the player ever sees the stage.

## Part 2 (pasted 2026-10-27 17:29 UTC)

1. Puzzle Validation Without State-Space Explosion
If you validate carried objects (acorns, stones) or lured creatures using a raw tile-by-tile state-space A^*, the state vector is S = (x_{player}, y_{player}, x_{obj1}, y_{obj1}, \dots, x_{objK}, y_{objK}, \text{switchBitmask}). In a 200-tile level with 4 movable objects, \vert{}S\vert{} \approx 200^5 \times 2^4 \approx 5.12 \times 10^{12} states, which will immediately freeze a mobile browser thread.
Shipped games and PCG researchers avoid this completely by splitting validation into Macro Causal Graphs and Pre-Validated Micro-Rooms (Gadgets):
 * How Shipped Games Do It (The Two-Layer Gadget Approach):
   * Unexplored & Minit / Zelda Dungeon Research (Joris Dormans' Machinations & Cyclic Generation): Dormans solves lock-and-key and multi-step puzzles at the Topological Graph Level before any tiles exist. Using a Graph Grammar, the generator rewrites a single node [Obstacle] into a causal subgraph: [Spawn Key/Object] -> [One-Way Hazard / Carry Path] -> [Lock/Receptor]. Because the grammar rule itself is mathematically sound (it never places a Receptor without spawning its Source in an upstream reachable node), macro-level solvability is guaranteed by construction (O(V + E) where V \le 15 rooms).
   * Spelunky 2 & Dead Cells (Pre-Validated Self-Contained Puzzle Chunks): Physics-heavy interactions—like throwing an acorn onto a high pressure plate, weighting a pulley basket with a heavy stone, or luring a beetle onto a floor switch—are never solved across arbitrary room boundaries by an AI planner at runtime. Instead, the puzzle lives inside a single handcrafted ChunkTemplate (or a locked 2-chunk pair) where the designer has already authored the geometry and socket positions.
 * How Academic Solvers Validate Intra-Room Physics without Exploding (Puzzledice / MIT Game Lab & Summerville et al.):
   * Instead of tracking continuous (x,y) coordinates for carried/thrown props, you collapse the room into Symbolic Affordance Zones (typically 3 to 6 nodes per chunk: Ledge_Left, Pit_Floor, High_Switch_Platform, Door_Exit).
   * Each socket has pre-computed Reachability Tags:
     * CanCarryWalk(Zone_A -> Zone_B): True if path between A and B requires no climbs/wall-jumps that drop held items, and max jump height along the path \le H_{carry\_max} (since heavy stones reduce jump height).
     * CanThrowArc(Zone_A -> Socket_Receptor): Computed once via parabolic intersection: does a throw vector \vec{v}_{throw} originating from Zone_A intersect the bounding box of Socket_Receptor without hitting solid tiles?
     * CanLureCreature(Spawn_Zone -> Switch_Zone): True if a continuous flat or stepped ground path exists with drop heights \le 1 tile and no gaps wider than the creature's AI walk/hop threshold.
   * Softlock / Reset Guarantee (MIT Puzzledice Rule): A puzzle chunk is only valid if either (a) the carried object cannot fall into an inescapable pit (NoPitWithoutRespawn), or (b) destroying/dropping the acorn/stone into a pit triggers an automatic respawn at its source socket (e.g., a shaking tree branch drops a fresh acorn when the active one is lost).
 * Practical Rule for Your Engine: Keep 90% of object/creature puzzles intra-chunk (the acorn tree/spawner, seesaw, or pressure plate live inside the same 24x16 chunk, pre-validated at authoring time or checked with 4-node symbolic zones). Use the Macro Lock-and-Key Graph only for cross-room objectives (e.g., pulling a winch in Room B to raise a rope bridge in Room A, or freeing 3 caged critters in side rooms to open the main branch gate).
2. How Few Handmade Rooms Can You Get Away With? (Spelunky & Dead Cells Benchmarks)
You need far fewer templates than most developers think if your templates use internal parameterization.
 * What Shipped Games Actually Used:
   * Spelunky Classic / HD (Derek Yu): Every level is a 4 \times 4 grid of 16 rooms (each 10 \time[span_0](end_span)s 8 tiles). The solution path only needs 4 topological room types:
     * Type 0: Side rooms (off the main solution path)
     * Type 1: Left + Right exits (horizontal corridor)
     * Type 2: Left + Right + Bottom exits (drop-down point)
     * Type 3: Left + Right + Top exits (landing room from a drop above)
       In Spelunky Classic, Derek Yu shipped with roughly 8 to 10 handmade room templates per room type—meaning an entire biome ran on ~32 to 40 small 10 \times 8 templates!
   * Dead Cells (Sébastien Bénard / Motion Twin): Early Access launched with roughly 40 to 50 room templates per biome, partitioned by graph role (Entrance, Combat_Corridor, Junction_3Way, Shop, Treasure_Room, Exit).
 * The Minimum Viable Library for Your 10-World Game:
   Because each of your 10 worlds has 9 generated levels, a player will traverse roughly 9 \text{ levels} \times 7 \text{ chunks} = 63 \text{ chunks} per world. You can make a world feel completely fresh with just 28 to 35 handmade chunks per world using five specific multiplication tricks:
   * 5x3 Sub-Chunk Obstacle Blocks (Spelunky's Secret Weapon): Inside a 24x16 chunk, leave two 6x4 cutout zones. Author 8 tiny 6x4 sub-blocks per world (e.g., a seesaw gap, a bramble patch, a stepped ledge, a swinging rope). A single room template with two 6x4 slots now has 8 \times 8 = 64 geometric layouts.
   * Probabilistic Tile & Prop Rules: Mark specific tiles in your editor as 50% Solid / 50% Empty or Socket: [Acorn_Plate | Lever_Door | Counterweig[span_1](end_span)ht_Basket].
   * Horizontal Mirroring (Symmetry Flip): For symmetric connector types (West_Mid -> East_Mid or vertical climb rooms), flip the chunk horizontally (X \to \text{Width} - X). Ensure your game's runtime renderer only flips the tile coordinates while keeping your upper-left-lit painted prop sprites unflipped (or using symmetric props) so your lighting direction stays consistent.
   * Connector Height Buckets (3 Standard Doors): Never allow connectors at arbitrary Y heights (which forces you to build hundreds of transition rooms). Standardize every chunk exit to one of 3 canonical heights: Low (y=3), Mid (y=8), or High (y=13). Now any chunk can connect to any other chunk in that bucket.
   * 2-Level Cooldown Queue: Track the last 14 chunk IDs spawned. Never pull the same base chunk_id twice within 2 consecutive levels, and never pick the same 6x4 sub-block configuration twice in the same world run.
3. Measuring Sameness: Expressive Range Analysis (ERA) & Similarity Metrics
Introduced by Gillian Smith and Jim Whitehead (2010) in "Analyzing the Expressive Range of a Level Generator", Expressive Range Analysis (ERA) evaluates a generator not by inspecting one level at a time, but by generating 1,000 levels in a headless batch, scoring each level on two or more structural metrics, and plotting a 2D heatmap histogram. If all 1,000 levels cluster into one tiny bright spot on the heatmap, your generator is suffering from "sameness" regardless of how many random seeds you feed it.
The 4 Core Metrics to Compute Automatically:
 * Linearity (L \in [0, 1]): Fit a least-squares linear regression line y = mx + b through the centerpoints (x_i, y_i) of all standable platforms along the solution path:
   
   * L \approx 1.0: Flat, straight-line level (e.g., a straight sprint or chase).
   * L \approx 0.2: Highly undulating/vertical level with climbs, drops, and switchbacks.
 * Leniency (E \in [-1, 1]): Assign every action along the path a risk weight w_k (e.g., Safe Ground Jump = +1.0, Moving Platform = +0.2, Enemy Patrol = -0.5, Gap over Hazard Pit = -1.0) and average across all M challenges:
   
 * Topological Branching Factor (B): Ratio of off-spine nodes (alcoves, rescue cages, puzzle switch branches) to main-spine nodes:
   
 * Action-String Levenshtein Distance or Normalized Compression Distance (NCD):
   Convert the A^* solution path of each level into a simplified Action String where each character represents an action beat:
   * W = Walk/Run, J = Basic Jump, G = Glide/Special Move, P = Carry/Throw Prop, S = Pull Lever/Switch, C = Combat/Enemy Dodge, V = Climb/Vine.
   * Example Level A: "WJJWPJSCWJGVJ"
   * Example Level B: "WJJWPJSCWJGJJ"
     Compute the Normalized Levenshtein Edit Distance between the action strings of Level A and Level B:
     
     
     Automatic Rejection Threshold: If a newly generated level has D_{sim} < 0.35 compared to any previous level generated in the same World (meaning more than 65% of the player's physical action sequence is identical), reject the seed and re-roll!
4. Rhythm Groups (Launchpad): Turning Beats into Seconds-Based Mobile Rules
In Gillian Smith et al.'s Launchpad generator (IEEE Transactions on Computational Intelligence and AI in Games, 2011), a level is generated in two decoupled tiers:
 * Tier 1 (Rhythm Grammar): Generates a timeline of non-overlapping Rhythm Groups—short bursts of timed actions (e.g., 5\text{s} to 12\text{s} long) separated by flat Rest Pads.
 * Tier 2 (Geometry Synthesis): Translates each action beat into physical coordinates using the character's horizontal speed v_x and jump arc physics (\Delta x = v_x \cdot \Delta t).
How to Convert Rhythm Groups into Seconds-Based Generator Rules:
Given your player's horizontal run speed v_x (in tiles/second or pixels/second):

To keep the player engaged without overwhelming them on a mobile touch screen, enforce two strict time bounds inside every rhythm group:
 * T_{max\_idle} (Starvation Limit): Never allow more than T_{max\_idle} seconds of flat, eventless walking (Walk without a jump, collectible arc, prop interaction, or creature). If a flat span exceeds v_x \cdot T_{max\_idle}, automatically inject a minor beat (a collectible mango/petal arc requiring a low-risk hop, or a visual landmark/breakable prop).
 * T_{min\_recovery} (Rest Pad Guarantee): After every rhythm group of N consecutive challenges, force a flat safe platform of width W_{rest} = v_x \cdot T_{min\_recovery} where zero hazards or enemies can spawn.
Recommended Event Density Table (Casual Kids / Easy vs. Skilled Players / Normal):
| Pacing Metric | Easy Mode (Casual / Kids) | Normal Mode (Skilled Players) | World-Unique Chase / Slide Level |
|---|---|---|---|
| Action Density (Meaningful Jumps/Actions per Sec) | 0.35 – 0.55 actions/sec (1 action every 1.8s – 2.8s) | 0.75 – 1.15 actions/sec (1 action every 0.85s – 1.3s) | 1.10 – 1.40 actions/sec (high-tempo reactive flow) |
| Max Eventless Walk (T_{max\_idle}) | 3.0 seconds max without a hop, item, or prop | 2.0 seconds max without an obstacle or interaction | 1.2 seconds max |
| Rhythm Group Duration | 6 – 8 seconds (3 to 4 actions per burst) | 10 – 14 seconds (8 to 12 actions per burst) | 15 – 20 seconds between safe zones |
| Rest Pad Recovery (T_{min\_recovery}) | 2.0 – 2.5 seconds of safe ground between bursts | 1.0 – 1.2 seconds of safe ground between bursts | 0.8 seconds (brief flat landing) |
5. Touch Controls at 30 FPS: Exact Coyote Time, Jump Buffer & Forgiveness Values
Capacitive mobile touch screens introduce 50ms to 85ms of hardware + browser compositor latency, and players lack physical button edges under their thumbs. Furthermore, at 30 FPS, each frame is 33.33\text{ms} (twice as coarse as a 60 FPS console game like Celeste).
 * Console Baseline (Celeste at 60 FPS / 16.67ms per frame):
   * Coyote Time: 5 frames = 83.3\text{ms}
   * Jump Buffer: 4–5 frames = 66.7\text{ms} – 83.3\text{ms}
   * Corner Correction: 4 pixels (if the top corner of the player's head clips the underside of a ceiling edge during an upward jump, nudge the player horizontally by up to 4px so they clear the ledge instead of bonking their head).
 * Mobile Touch Benchmarks (Oddmar, Rayman Jungle/Fiesta Run, Dadish, Super Mario Run):
   Because touch inputs are slower and 30 FPS quantizes input polling to 33.3\text{ms} steps, console values feel punishingly tight on a web phone game. You must widen the forgiveness windows:
| Forgiveness Mechanic | Console 60 FPS (Celeste) | Your Game: Normal Mode (30 FPS Web Touch) | Your Game: Easy Mode (30 FPS Web Touch) | Implementation Rule at 30 FPS |
|---|---|---|---|---|
| Coyote Time (Jump after leaving ledge) | 83ms (5 frames @ 60fps) | 133ms (4 frames @ 30fps) | 167ms (5 frames @ 30fps) | Use performance.now() delta-time timer (0.14s / 0.17s), NOT raw frame counts, so minor browser frame drops don't eat coyote time. |
| Jump Buffer (Press jump before landing) | 67–83ms (4–5f @ 60fps) | 133ms (4 frames @ 30fps) | 200ms (6 frames @ 30fps) | Store lastJumpTouchTimestamp. On ground collision, if now - lastJumpTouchTimestamp <= bufferMs, fire jump immediately. |
| Ledge-Edge Landing Forgiveness (Foot Extending) | 2–3 px | 25% of tile width (6–8 px on 32px tiles) | 35% of tile width (10–12 px on 32px tiles) | If the player is falling (vy > 0) and their horizontal collider misses a platform edge by \le 8\text{px}, snap them onto the ledge top instead of sliding off into a pit. |
| Head-Bonk & Ledge-Mantle Corner Correction | 4 px | 8 px ceiling nudge + 10 px shin mantle | 12 px ceiling nudge + 14 px shin mantle | If jumping into the side of a platform and the player's feet are within 10–14px of the top surface, automatically step/pop them up onto the ledge. |
| Prop Pickup / Lever Grab Magnet | Exact overlap | 1.25x hitbox radius | 1.6x hitbox radius | Auto-highlight and snap interaction button to nearest acorn/stone/lever within radius so players never fumble positioning on touch. |
> Critical 30 FPS Physics Rule: Because 33.3\text{ms} per frame causes Euler integration (y += vy * dt; vy += g * dt) to lose jump apex height whenever a browser frame stutters to 45\text{ms}, always use Velocity Verlet Integration (y += vy * dt + 0.5 * g * dt * dt) or run a fixed 60\text{Hz} physics substep (2 physics steps per 30fps render frame). This ensures your runtime jump heights match your generator's parabolic math down to the pixel.
> 
6. Teaching Inside Generated Levels: Guaranteeing the Safe Ki Step
When a new mechanic is introduced—whether it's a world move (like a wind glide or vine swing), a puzzle prop (seesaws in Emerald Canopy, bamboo wind shutters in Mist Cascades), or a new creature—you cannot leave its first appearance to the random chunk pool.
Shipped games (Spelunky tutorial/dwelling transitions, Rogue Legacy 2 heirloom rooms, Dead Cells rune rooms) use First-Encounter Injection & Topological Pre-Conditioning:
 * The UnseenMechanics Registry & Slot-1 Override:
   Maintain a world-level list of introduced_mechanics. In Level 1 of each World (or the first level where a new prop pair is drawn), the Mission Graph Grammar forces Node 1 (immediately after the Start Room) to be a dedicated Ki_Teaching_Node.
 * Three Hard Constraints on a Ki_Teaching_Chunk:
   * Zero Lethal Failure State (The Safety Floor Rule): The validator checks every tile underneath the trajectory of the new mechanic. Any pit must have a solid floor no more than 2 tiles deep with an easy step-up back to the start of the obstacle. Zero enemies and zero spikes are permitted inside a Ki chunk (max_threat = 0).
   * Mandatory Causal Gate (Cannot Be Ignored): A player cannot accidentally walk past a Ki lesson. The chunk exit is physically higher than a standard jump (height > H_basic_jump) or blocked by a branch gate, so the player must tilt the seesaw, drop the acorn on the glowing pressure knot, or pull the bamboo wind shutter lever to proceed.
   * Visual Affordance Framing (Self-Demonstrating Environment): Before the player even touches the prop, trigger a deterministic Environmental Micro-Cue:
     * Example (Pressure Plate / Seesaw): As the player enters the Ki screen viewport, a non-threatening background critter (or an acorn dropping automatically from a canopy branch above) lands on a secondary plate or tips one end of a seesaw, visually animating the cause-and-effect link (Weight -> Plate Glows -> Gate Opens).
 * Portrait vs. Landscape Sight-Line Constraint (Crucial for Dual-Orientation Mobile):
   In Portrait Mode, the horizontal viewport is narrow (typically only 10 to 12 tiles wide, compared to 20 to 24 tiles in Landscape).
   * The Single-Viewport Co-Visibility Rule: In any Ki chunk (and all Easy Mode puzzle chunks), the horizontal distance between a prop_source (lever/acorn/stone) and its prop_receptor (gate/basket/shutter) must be \le 8\text{ tiles} (\Delta x \le 8, \Delta y \le 10). This guarantees that even a player holding their phone vertically in Portrait Mode sees the gate open on-screen the exact moment they pull the lever or drop the stone, without needing camera pans.
7. Story Games That Use Procedural Generation (Fixed Story Order + Authored Feel)
Several acclaimed games combine a strict, linear narrative campaign with procedurally generated levels:
 * Hades & Children of Morta (Narrative Event Injection & Story Pockets):
   * How they do it: The world order is fixed, and narrative beats are stored in a priority queue based on story progress. When a level generates, the Mission Graph reserves specific Story Anchor Sockets ([Intro_Vignette_Chunk], [Mid_Level_Encounter_Socket], [Exit_Cutscene_Chunk]).
   * How to apply it: Even though Chunks 2 through 8 of your level are procedurally stitched, Chunk 0 (Level Intro) and Chunk 9 (Level Exit) can pull story-specific dialogue triggers, rescued friend cameos, or villain taunts (e.g., General Claw's lieutenants fleeing into the next stage) that match the exact level index (World 2, Level 4).
 * SteamWorld Dig 2 & Ori's Sequenced Set-Pieces (Hybrid Handcrafted Landmarks in Procedural Wrappers):
   * SteamWorld Dig uses procedural tile/chunk generation for traversal tunnels, but injects 100% handcrafted Anchor Rooms for major story puzzles and relic rooms.
   * How to apply it: In your 9-level generated sequence per world, use Fixed Landmark Chunks at key narrative beats (for example, the room where a major friend is trapped in a cage, or the starting cliff of your World-Unique Chase level) while procedurally generating the 6 to 7 journey chunks that lead up to and escape from that landmark.
 * Moonlighter & Cult of the Lamb (Biome Sub-Themes & Progressive Environmental Storytelling):
   * How they avoid Levels 1–9 looking identical: Instead of giving a World one static visual palette across all 9 levels, divide each 10-level World into 3 Visual Sub-Acts (Palette & Prop Progression):
     * Levels 1–3 (Outer Edge / Morning): Brighter lighting, outer foliage, basic scouting creatures.
     * Levels 4–6 (Deep Interior / Midday or Mist): Denser canopy/deeper caves, Level 5's unique world set-piece (chase/slide/climb), heavier mechanical props.
     * Levels 7–9 (Fortified Lair Approach / Sunset or Storm): Villain banners/cages appear in background layers, elite guards patrol, leading directly into Level 10's Hardcoded Boss Finale.
       This makes the 9 procedural levels feel like a continuous geographical journey through the world rather than 9 reshuffled arenas.
8. Automatic Difficulty Estimation Before Players See the Level
Relying only on static heuristic sums (like counting enemies) misses compound difficulty—for instance, a tiny jump is easy, and a patrolling beetle is easy, but a tiny jump onto a narrow ledge occupied by a patrolling beetle is hard.
Industry teams and PCG researchers (Togelius, Shaker, and Summerville's Super Mario PCG benchmarks) use a Two-Stage Pre-Flight Difficulty Estimator:
Stage A: Fast Structural Risk Scoring (< 1 millisecond)
As soon as your A^* Reachability Graph finds the solution path P = (e_1, e_2, \dots, e_k), compute the Edge Execution Precision Score for every jump/action edge e_i:
 * Jump Distance Utilization Ratio (U_{dist}):
   
   
   (A jump requiring 80\% of max distance is exponentially harder than one requiring 40\%).
 * Landing Target Tightness (U_{land}):
   
   
   (Landing on a 1-tile peg scores near 1.0; landing on a 6-tile wide floor scores 0.0).
 * Temporal Hazard Overlap (U_{time}):
   If the edge trajectory intersects an enemy patrol zone, projectile line, or rhythmic wind shutter, compute the Safe Timing Window (W_{safe} in seconds) within the obstacle's cycle period T_{cycle}:
   
   
   (If a player only has a 0.4\text{s} gap in a 2.0\text{s} cycle, U_{time} = 0.80).
Stage B: Monte Carlo Noisy-Bot Simulation (20 Simulated Runs in ~4–8ms)
Before accepting a level (or during offline seed curation), run 20 fast headless kinematic simulations along the A^* solution path using two synthetic player personas with injected Gaussian Input Noise:
 * The "Casual Kid / Easy Bot":
   * Reaction latency noise: \Delta t_{react} \sim \mathcal{N}(\mu = +90\text{ms}, \sigma = 65\text{ms}) (simulates late or early thumb taps on glass).
   * Jump hold duration noise: t_{hold} \sim \mathcal{N}(t_{optimal}, \sigma = 80\text{ms}).
   * Movement hesitation: stops for 0.4\text{s} before picking up or throwing props.
 * The "Skilled Player / Normal Bot":
   * Reaction latency noise: \Delta t_{react} \sim \mathcal{N}(\mu = +30\text{ms}, \sigma = 30\text{ms}).
   * Jump hold duration noise: \sigma = 35\text{ms}.
The 5 Concrete Numbers You Should Measure & Gate On:
| Metric | How to Calculate It | Target for Easy Levels | Target for Normal Levels | Action if Out of Bounds |
|---|---|---|---|---|
| 1. Noisy-Bot Survival Rate (SR) | \% of the 20 noisy-bot runs that cross each jump edge without falling or taking damage. | Easy Bot SR \ge 85\% on every edge | Normal Bot SR \ge 70\% (Worlds 1–5) to \ge 50\% (Worlds 6–10) | If an edge has SR < \text{threshold} (a Death Hotspot), auto-widen the landing ledge by +1 tile or slow the nearby enemy by 20%. |
| 2. Minimum Required Input Window (W_{min}) | The narrowest timing window (in milliseconds) required for any single jump or hazard dodge in the level. | W_{min} \ge 300\text{ms} (\ge 9 frames at 30fps) | W_{min} \ge 167\text{ms} (\ge 5 frames at 30fps) | Never allow a 1-frame or 2-frame precision requirement on mobile touch! |
| 3. Peak Consecutive Stress (\Sigma_{peak}) | Highest sum of Edge Risk Scores across any single Rhythm Group before a safe Rest Pad. | \le 2.5 | \le 5.5 (scales up from World 1 to World 10) | Insert a flat 4-tile Rest Pad or checkpoint in the middle of the rhythm group. |
| 4. Puzzle Dependency Depth (D_{puzzle}) | Longest causal chain in the Mission Graph (Acorn -> Plate A -> Lift B -> Lever C -> Exit). | 1 to 2 steps max | 2 to 4 steps | Collapse secondary locks on Easy Mode so kids never lose track of what a lever opened. |
| 5. Backtracking Ratio (R_{back}) | \frac{\text{Total Path Distance}}{\text{Direct Start-to-Goal Distance}} | 1.0 – 1.25 | 1.15 – 1.60 | Prevents generated Collection/Freeing levels from turning into tedious walking mazes. |
Because you are generating from fixed seeds, you can run this exact estimator in a Node.js/headless script across 10,000 candidate seeds in a few seconds during development, filter for the top seeds that hit your exact difficulty curve D(W, L) and high Expressive Range diversity (D_{sim} \ge 0.35), and ship a curated table of verified seeds—giving you zero runtime generation lag on old phones while still offering hundreds of unique, mathematically verified playthroughs.


Tell me what you think and if you have any additional follow-ups.

## Part 3 (pasted 2026-10-27 18:05 UTC)

1. Adapting Chunks, Connectors & Sockets to Free-Form Pixel Geometry (Non-Tile)
When platforms are parameterized code-built pieces (splines, rotated polygons, curved tree boughs, stone slabs, or water slides) placed in continuous pixel space rather than a grid, your generator shifts from Grid Indexing to Local Bounding-Box Frames & Relative Anchor Transforms.
How Shipped Non-Tile Games Do It:
 * Rayman Origins / Legends & Rayman Jungle/Fiesta Run (Ubisoft Montpellier — UbiArt Framework): Levels are built from bezier-deformed terrain strips ("friezes") and floating actors in continuous 2D pixel space. Pieces snap together via explicit Anchor Transforms (x, y, \text{angle}, \text{surfaceTangent}). (Source: Michel Ancel & Ubisoft UbiArt GDC 2011 Architecture Presentation).
 * Alto's Adventure / Alto's Odyssey (Snowman / Harry Nesbitt): The terrain generator stitches handcrafted, code-parameterized geometric segments (ramps, chasms, grind lines) in continuous pixel space. Each chunk is defined in local coordinates starting at (0, 0) and ending at (\Delta X, \Delta Y). The stitcher sets the next chunk's world origin directly to the previous chunk's exit anchor: \vec{P}_{next\_origin} = \vec{P}_{prev\_exit}. (Source: Harry Nesbitt, "Generating the World of Alto's Adventure" technical write-up).
 * Launchpad (Smith et al., 2011): Launchpad is not a tile generator; its second tier generates continuous pixel coordinates (x, y, \text{width}) derived directly from the player's parabolic equations of motion, then inserts a parametric "Joiner Platform" between Rhythm Groups. (Source: Smith et al., IEEE TCIAIG 2011).
4 Concrete Steps to Adapt Your Architecture to Pixel Space:
 * Chunk Templates Become Local-Space "Scene Prefabs" with Variable Pixel Widths:
   * Instead of a fixed 24x16 tile array, a ChunkTemplate is a bounding box of variable pixel width W_{px} \in [600\text{px}, 1800\text{px}] and height H_{px}, where all platform polygons/splines are authored relative to the chunk's Entry Anchor at (0, 0).
 * Connectors Become Relative Anchor Frames (Eliminating Height-Bucket Mismatches):
   * In a tile grid, misaligned exit heights cause jagged seams unless you force fixed height buckets. In continuous pixel space, you get a huge advantage: Relative Anchor Translation.
   * Each chunk defines:
     * EntryPort: Local pixel coordinate (0, 0), platform surface width w_{in} (e.g., 120px), and surface angle \theta_{in} = 0^\circ.
     * ExitPort: Local pixel coordinate (\Delta x_{exit}, \Delta y_{exit}), surface width w_{out}, and connector type (Flat_Seamless, Jump_Gap, Drop_Ledge, Vine_Handoff).
   * Stitching Math: When Chunk B follows Chunk A, you do not need Chunk B's entry height to match a fixed world Y. You calculate a Parametric Transition Gap (\delta x, \delta y) sampled from your player's safe jump envelope (e.g., \delta x \in [80\text{px}, 160\text{px}], \delta y \in [-60\text{px}, +40\text{px}]) and set Chunk B's world origin to:
     
   * To prevent the level from drifting infinitely upward or downward over a 2-minute stage, apply a Vertical Corridor Clamp (Y_{world} \in [-800\text{px}, +1200\text{px}]): if the running Y_{world} rises above +800\text{px}, bias the chunk selector toward chunks with negative \Delta y_{exit} (downward drops or slides).
 * Sockets Become Surface-Normalized Parameterized Transforms (t along Surface + Normal Offset):
   * Because your code-built platforms can stretch in pixel length or tilt, hardcoding a socket at (x=340\text{px}, y=120\text{px}) will leave a pressure plate floating in mid-air if a platform parameter changes its length from 300px to 220px.
   * Bind every socket to a Parent Platform ID using a normalized parameter t \in [0.0, 1.0] along the platform's top surface polyline:
     
     
     (For example: t = 0.5, d_normal = 0px always places a pressure plate or patrol beetle dead-center on top of the platform regardless of how wide or tilted the code-built piece is).
 * Continuous Collision & A Validation via Polygon Sweeps:*
   * In pixel space, your Kinematic A^* Validator treats each platform's top walkable polyline segment [(x_1, y_1), (x_2, y_2)] as a graph node.
   * To validate a jump or thrown acorn between Segment_A and Segment_B, sample 8 points along the parabolic trajectory (x(t), y(t)) and run a fast 2D Oriented Bounding Box (OBB) / Line-Segment Intersection check against nearby platform polygons to ensure the player's hitbox (W_{player} \times H_{player}) never clips a ceiling or ledge.
2. Action Strings: Weighting Actions, Comparing Different Lengths (2+ Min Levels), & Thresholds
In a 2-minute platformer stage, a player will execute roughly 80 to 160 actions, and a Collection or Freeing level might take 150 seconds (140 actions) while a Chase level takes 110 seconds (95 actions). Standard unweighted Levenshtein distance fails here because (1) replacing a Hop with a VineSwing costs the same 1.0 edit as replacing a Hop with a Walk, and (2) comparing a 95-character string to a 140-character string penalizes the 45-character length difference even if both levels reuse the exact same sequence of chunks.
A. Weighted Substitution Matrix (Weighted Edit Distance)
In sequence alignment literature (Needleman-Wunsch / Smith-Waterman and weighted edit distance), each action token a_i is assigned a Salience / Cognitive Weight w(a) and a Category Vector:
(Note: The weights below are engineering design estimates calibrated to platformer mechanics, not fixed constants from a single game):
| Token | Action Type | Cognitive / Memorable Salience Weight w(a) | Category |
|---|---|---|---|
| W | Flat Walk / Run (>1.5\text{s}) | 0.2 (Low — background filler) | Locomotion |
| h | Small Hop (low risk, <40\% max jump) | 0.5 | Basic Jump |
| J | Precision / Gap Jump (>50\% max jump) | 1.0 (Baseline unit) | Basic Jump |
| V | World Traversal (Vine Swing / Glide / Bounce) | 2.0 (High kinetic signature) | World Move |
| C | Creature Dodge / Stomp / Bait | 2.2 | Combat/Threat |
| P | Carry / Throw Object (Acorn, Stone) | 2.8 (High puzzle memory) | Puzzle Action |
| S | Trigger Mechanism (Seesaw, Winch, Shutter) | 3.0 (Highest landmark salience) | Puzzle Action |
 * Insertion / Deletion Cost: \text{Cost}_{ins/del}(a) = w(a). (Inserting an extra Walk costs 0.2; inserting a Seesaw puzzle costs 3.0).
 * Substitution Cost: \text{Cost}_{sub}(a, b) = \vert{}w(a) - w(b)\vert{} + \gamma_{cat}(a, b), where \gamma_{cat} = 0.0 if a and b are in the same category (e.g., h vs. J), and \gamma_{cat} = 1.5 if they are in different categories (e.g., J vs. V or P).
B. How to Compare Levels of Different Lengths (Sliding-Window & Normalized Compression)
Never compare two 2-minute levels with a single global string edit distance. Use two complementary metrics:
 * Sliding-Window Substring Alignment (Catches Repeated 20-Second Stretches):
   A player feels "déjà vu" when a 15-to-25-second sequence (roughly W = 18 weighted action beats) in Level B feels identical to a 20-second stretch in Level A—even if Level B is twice as long overall.
   * Slide a window of length W = 18 tokens across Level A and compare it against all windows of length W = 18 in Level B using Weighted Levenshtein Distance normalized by the window's weight sum:
     
 * Action N-Gram TF-IDF Cosine Similarity (Length-Invariant Macro Profile):
   Extract all 3-grams and 4-grams of high-salience actions (after stripping W walks), weight each N-gram by its salience w, and compute the Cosine Similarity between the two levels' N-gram frequency vectors:
   
   
   Because Cosine Similarity measures the angle between frequency distributions, a 2-minute level and a 4-minute level with the exact same mix of action patterns score 1.0 (identical), making it 100% invariant to level length.
C. Similarity Thresholds for 2+ Minute Levels (Engineering Estimates):
 * Macro Cosine Similarity (\text{Sim}_{cosine}): Reject or penalize a level if \text{Sim}_{cosine}(A, B) > \mathbf{0.78} against an adjacent level in the same world (or > \mathbf{0.85} against any level of the same Archetype).
 * Micro Sliding-Window Distance (\min D_{window} over 18-beat windows): Reject if any 18-beat window between two levels in the same world has D_{window} < \mathbf{0.28} (meaning a 20-second sequence is >72\% identical in weighted action rhythm).
3. Touch-Specific Noisy Bot: Modeling Drift, Flicks & Late Lift-Offs
In mobile HCI literature, touchscreen virtual controls suffer from three documented physical failure modes that do not exist on physical gamepads:
 * "Joystick / Thumb Drift" (Absence of Tactile Home Position): Without physical rim stops, a player's thumb sliding left-to-right gradually drifts 15\text{mm}–30\text{mm} across the glass over 10–15 seconds, causing unintended direction reversals or dead-zone entry when trying to change direction (Bianchi-Berthouze et al., Virtual Joystick Control Sensitivity and Usage Patterns in a Large-Scale Touchscreen-Based Mobile Game Study, 2023).
 * Capacitive Lift-Off Latency & Finger Roll: When lifting a thumb off glass to stop on a narrow ledge or release a variable-height jump, the pad of the thumb rolls before breaking capacitive contact, adding a skewed positive tail to release timing (Bi, Li, & Zhai, CHI 2013 — FFitts Law: Modeling Finger Touch with Fitts' Law).
 * Tap vs. Micro-Swipe / Flick Ambiguity: When tapping rapidly under stress, a child's or casual player's finger translates horizontally by 3\text{mm}–8\text{mm} during contact, which naive input handlers misread as a swipe/flick instead of a tap.
How to Model a 4-Channel "Touch-Fumble State Machine" in Your 30 FPS Noisy Bot:
(Note: The probability and pixel/ms distribution parameters below are calibrated simulation estimates designed to reproduce the HCI failure modes above at 30 FPS):
 * Channel 1: Left-Thumb Steering Drift & Reversal Lag (Floating Origin Error):
   * If your game uses a fixed virtual D-pad/slider, model the thumb's physical x-position x_{thumb}(t) drifting outward during continuous movement at v_{drift} \sim \mathcal{N}(+4\text{px/sec}, 2\text{px/sec}).
   * When the A^* plan requires a Direction Reversal (e.g., turning left after landing or dodging backward), add a Thumb Travel Dead-Time:
     
   * Design Takeaway: If you implement a Dynamic / Floating Re-Centering Slider in your actual game (where sliding past the max radius drags the virtual center along with the thumb so reversing direction happens the instant the thumb moves 4\text{px} back), you cut this error in half.
 * Channel 2: Late Lift-Off / Stopping Overshoot (Skidding Off Narrow Ledges):
   * When the bot reaches the target landing coordinate on a platform and tries to release the movement touch (TouchEnd), apply a Log-Normal Release Delay (since you can rarely lift off early by accident, but frequently lift off late):
     
   * During those 1–4 extra frames, the character continues running forward on the platform before friction stops them. If the platform width W_{px} is smaller than \text{LandingSpot} + v_x \cdot \Delta t_{release}, the noisy bot walks right off the far edge of the ledge!
 * Channel 3: Variable-Jump Hold Truncation ("Flick-as-Tap" Short-Hop Error):
   * On touch screens, when a player tries to do a full jump while simultaneously steering, their right thumb sometimes brushes or flicks off the jump zone early.
   * Give the Casual/Kid Bot an 8\% probability per full jump of truncating the jump hold duration to a 2-frame (66ms) tap, reducing jump apex height by \sim 30\%. If a gap along an Easy level requires 100\% of max jump hold time with zero tolerance for a slightly early thumb release, the bot flags it.
 * Channel 4: Multi-Touch "Thumb-Swap" Gap (Jump -> Throw/Interact Delay):
   * Because a player only has one right thumb for action buttons, transitioning from Jump to Throw Prop / Pull Lever mid-air requires lifting and repositioning the thumb by 12\text{mm}–20\text{mm}.
   * Enforce a mandatory 133\text{ms}–200\text{ms} (4 to 6 frames at 30 FPS) minimum gap between a Jump press and a Throw/Interact press in your bot. This immediately catches mid-air puzzle throws that are easy with two shoulder buttons on a controller but physically awkward with one thumb on glass.
4. "Dead Time": What Counts as a Meaningful Beat in PCG Research?
Your instinct is 100% backed by the research: passive pickups (like a flat row of petals or coins on the ground) do NOT count as a rhythm beat.
What the Research Defines as a Beat:
 * Gillian Smith et al., Launchpad: A Rhythm-Based Level Generator for 2-D Platformers (IEEE TCIAIG, 2011):
   Smith explicitly defines rhythm as "the rhythm that players feel in their hands"—meaning a discrete Player Input Action coupled with a state change in velocity or risk. In Launchpad's grammar, the non-rest symbols are strictly: Jump, Wait (timing pause before a moving hazard), Fall/Drop, Spring/Bounce, and Stomper/Enemy Dodge. Walking across flat ground collecting passive items is classified as part of the Move / geometry connector, not an action beat. (Source: Smith et al., 2011).
 * Compton & Mateas (2006) / Dahlskog & Togelius (2012, Design Patterns in Super Mario Bros.):
   In Mario PCG taxonomy, level elements are only counted as active beats if they present a Micro-Challenge (a possibility of trajectory failure, timing delay, or spatial decision).
The 3-Criteria Test for Your Generator's "Dead Time" Timer (T_{idle}):
Only reset your timeSinceLastEvent counter when the player encounters an Active Beat, defined as an event satisfying at least one of these three rules:
 * Kinematics / Input Change: The player must press Jump, Release/Glide, Climb, or change direction to cross a gap, clear a step > \text{walkable slope}, or catch an off-ground collectible arc. (Note: A curved arc of petals high in the air that requires a well-timed jump over a gap counts as a 0.5x minor beat; petals lying on flat ground count as 0.0).
 * Timing / Threat Evaluation: The player's path intersects a dynamic cycle (a patrolling creature, a swinging vine, a puffing wind shutter, a crumbling bridge) that requires reading velocity and choosing when to move.
 * Causal / Cognitive Affordance: The player interacts with a world prop (picking up an acorn, tilting a seesaw, pulling a winch, freeing a cage) or reaches a topological branch decision point.
5. Puzzles for Kids (Ages 7–10): Step Counts, Hint Timing, Wording & Playtest Data
Children aged 7–10 are in Piaget's Concrete Operational Stage (capable of multi-step logical cause-and-effect, spatial conservation, and rule reversibility, unlike ages 3–6, but still developing working-memory capacity under spatial distraction).
Concrete Guidelines & Playtest Findings from Children's UX Research:
 * Nielsen Norman Group (UX Design for Children Ages 3–12, 3rd Ed. by Jakob Nielsen & Raluca Budiu):
   * Age 6–8 vs. 9–12 Split: NN/g usability testing with children shows that 7-to-8-year-olds still exhibit "minefield / exploratory tapping" when stuck for more than 15–20 seconds without feedback, whereas 9-to-10-year-olds will test a hypothesis twice before assuming the game is broken or feeling frustrated.
   * Reading Load: Kids aged 7–10 scan interfaces for visual action cues and frequently skip multi-sentence text boxes entirely. Text hints should be kept under 8 to 12 words per bubble, written at a Grade 2–3 reading level, and paired with an icon or camera nudge. (Source: Nielsen Norman Group — Children's UX Research).
 * PBS KIDS Digital & Sesame Workshop Playtesting Guidelines (Design Principles for Kids):
   * Tiered Scaffolding ("Progressive Prompting"): Both PBS KIDS and academic adaptive-hint studies (Hao et al., An Adaptive Hint System for Puzzle Games, IEEE 2022; Marwan et al., CHI 2020 — Adaptive Immediate Feedback Can Improve Novice Programming Engagement) find that giving away the solution on the first hint lowers player satisfaction (66.3% of players in Hao et al.'s study disliked poorly timed or overly blunt hints, preferring a 2-to-3-step progressive hint).
Recommended Puzzle & Hint Architecture for Ages 7–10:
(Timing thresholds below synthesize PBS/Sesame scaffolding patterns with concrete-operational puzzle design; exact seconds are practical implementation targets):
 * Maximum Causal Step Count (D_{puzzle}):
   * Easy Mode (Target Age 7–8): 1 to 2 causal steps max per room (e.g., Step 1: Grab acorn from branch \to Step 2: Toss onto pressure plate to open gate). Never require holding two rules in working memory across off-screen rooms.
   * Normal Mode (Target Age 9–10+ & Adults): 2 to 3 causal steps within a chunk (e.g., Step 1: Pull lever to drop stone \to Step 2: Load stone into counterweight basket to raise bridge \to Step 3: Cross bridge).
 * Stuck-Detection Triggers (Better Than a Raw Clock Alone):
   Do not start the hint timer the moment the player enters the room (if they are exploring or collecting petals, they aren't stuck). Increment StuckScore only when the player is inside the Puzzle Zone and either:
   * Spends time moving back and forth without changing any puzzle state, OR
   * Repeats a failed action 2 times (e.g., jumping at a high gate that cannot be reached by jumping, or throwing an acorn that misses the plate twice).
 * The 3-Tier Progressive Hint Timeline:
   * Tier 1 — Subtle Visual Affordance (15 seconds of no puzzle progress OR 2 failed jumps at the locked exit):
     * No text. The target prop_source (the lever, stone, or acorn branch) emits a gentle sparkle/pulse and a soft musical chime, and its linked prop_receptor (the plate or winch wire) briefly glints in matching color.
   * Tier 2 — Goal-Directed Companion Thought / Focus (30 seconds of no progress — or tapping a subtle ? icon):
     * Highlight the relationship without spoiling the exact execution. Use a 1-sentence character thought bubble (7–10 words max, concrete verbs) or a 1.2-second camera look-ahead:
     * Good Wording (Concrete, Observational): "That basket looks heavy enough to lift the gate!" or "Maybe an acorn can reach that high switch!"
     * Bad Wording (Abstract or Bossy): "Consider utilizing counterweight physics to alter the platform elevation."
   * Tier 3 — Explicit Action Demonstration (50 seconds of no progress OR second tap on ? icon):
     * Display a faint dotted trajectory arc from the acorn/stone to the plate, or briefly animate a ghost icon showing [Pick Up Stone] -> [Drop in Basket].
6. Framing a Puzzle Room in Portrait Mode Without Shrinking the Characters
This is one of the hardest design problems on mobile: in Landscape (16:9), if your camera shows 1200px horizontally by 675px vertically, rotating to Portrait (9:16) at the same character pixel height only shows 380px horizontally—cutting off two-thirds of a wide puzzle room! Conversely, if you zoom out the camera in Portrait so all 1200px fit across the narrow screen, your character shrinks to 31% of their original size, turning your painted character sprites into unreadable ants and making touch platforming miserable.
How Shipped Games & 2D Camera Systems Solve This (Scroll Back / GDC Camera Taxonomy):
In Itay Keren's landmark GDC 2015 talk Scroll Back: The Theory and Practice of Cameras in Side-Scrollers (creator of Mushroom 11) and in dual-orientation / mobile puzzle platformers (Monument Valley, Oddmar, Cut the Rope, Leo's Fortune), developers combine four camera and layout techniques:
 * Clamped Dynamic Zoom + Multi-Target Framing ("Region-Focus" & "Target-Focus"):
   * Hard Zoom Floor: Never allow the camera in Portrait Mode to zoom out past 0.72x – 0.75x of your baseline character scale (Engineering Rule of Thumb: your protagonist should never drop below 8% to 10% of the screen's shortest dimension in pixel height).
   * Weighted Multi-Focal Framing (Itay Keren's Target-Focus / Position Averaging): Instead of locking the camera center (C_x, C_y) strictly to the player (P_x, P_y), when the player enters a Puzzle Chunk, bind the camer

## Part 4 (pasted 2026-10-27 18:09 UTC)

### 6. Framing a Puzzle Room in Portrait Mode Without Shrinking the Characters

This is one of the hardest design problems on mobile: in Landscape (`16:9`), if your camera shows `1200px` horizontally by `675px` vertically, rotating to Portrait (`9:16`) at the same character pixel height only shows **`380px` horizontally**—cutting off two-thirds of a wide puzzle room! Conversely, if you zoom out the camera in Portrait so all `1200px` fit across the narrow screen, your character shrinks to **`31%` of their original size**, turning your painted character sprites into unreadable ants and making touch platforming miserable.

#### How Shipped Games & 2D Camera Systems Solve This (*Scroll Back* / GDC Camera Taxonomy):
In **Itay Keren's** landmark GDC 2015 talk [*Scroll Back: The Theory and Practice of Cameras in Side-Scrollers*](https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers) (creator of *Mushroom 11*) and in dual-orientation / mobile puzzle platformers (*Monument Valley*, *Oddmar*, *Cut the Rope*, *Leo's Fortune*), developers combine **four camera and layout techniques**:

1. **Clamped Dynamic Zoom + Multi-Target Framing ("Region-Focus" & "Target-Focus"):**
   * **Hard Zoom Floor:** Never allow the camera in Portrait Mode to zoom out past **`0.72x – 0.75x`** of your baseline character scale *(Engineering Rule of Thumb: your protagonist should never drop below `8% to 10%` of the screen's shortest dimension in pixel height)*.
   * **Weighted Multi-Focal Framing (Itay Keren's *Target-Focus* / *Position Averaging*):** Instead of locking the camera center $(C_x, C_y)$ strictly to the player $(P_x, P_y)$, when the player enters a Puzzle Chunk, bind the camera target to the weighted centroid of the **Player** and the **Active Puzzle Step** (the nearest `prop_source` before pickup, and then the `prop_receptor` as soon as the player picks up the acorn/stone):
     $$\vec{C}_{target} = 0.65 \cdot \vec{P}_{player} + 0.35 \cdot \vec{P}_{active\_puzzle\_element}$$
     Now, the moment the player picks up the acorn, the camera smoothly shifts `35%` of its frame toward the pressure plate so both the player and the target plate sit at the left and right thirds of the Portrait screen!
2. **Design Puzzle Chunks on a "Diagonal / Vertical Z-Fold" Rather Than a Wide Horizontal Flat:**
   * Because Portrait screens have **abundant vertical height** (`675px` wide $\times$ `1200px` tall at `0.75x` zoom), never lay out a puzzle room as a flat `1200px` horizontal hallway.
   * **The Square / Vertical Aspect Rule for Puzzle Chunks:** Author all puzzle chunks so that `prop_source` and `prop_receptor` are stacked **diagonally or vertically** within a **`500px wide x 750px tall` "Golden Safe Box"** (e.g., the acorn tree or lever is on a lower ledge at $x=200, y=100$, and the pressure plate / gate is above it at $x=480, y=420$).
   * A `500px x 750px` bounding box fits **100% inside a Landscape screen AND 100% inside a `0.75x`-zoomed Portrait screen simultaneously**—meaning both orientations see the entire puzzle at once without shrinking the character!
3. **1.2-Second "Cue-Focus" Micro-Cut / Tether Elastic Pan (When a Link Exceeds the Screen):**
   * If a world puzzle *must* span wider than `550px` horizontally, use Keren's **Gesture/Cue-Focus** (used in *Ori*, *Hollow Knight*, and *Oddmar*):
   * Perform a **0.8-second spring-smoothed camera pan** toward the locked gate when the player first approaches it, and another brief pan when the switch is triggered, OR connect the switch and gate with a **highly visible continuous physical conduit** (a taut rope pulley, a glowing vine root, or a bamboo water trough running across the background) that visually leads the eye across the scroll boundary.
4. **Look-Ahead Drag / Peek Gesture (Optional Touch Ergonomic Bonus):**
   * Allow the player to swipe a finger on the upper half of the screen (outside the control zones) to elastically peek the camera up to `350px` in any direction while standing still, snapping smoothly back via spring physics when they touch the movement controls.
