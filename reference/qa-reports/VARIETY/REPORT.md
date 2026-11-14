# VARIETY REPORT (R-165.197/.198/.200). Engine, Opus 5.5 max. t-nodes. 1:52 - 2:45 PM ET, 11-13. Stopped at ~40% context (D55).
**EXACT NEXT STEP** (W1 kills from nodeMix on 74290856; "fair" = every ask W1's kit can lay: 12 of 60 strings):
0. Run the full CLAUDE.md Checks on t-nodes' head (NOT run on 74290856: suite, build + chunkcheck, perf gates, tool tests, tierBots).
1. **W1 floor.unmarked** (36; 9 of the 12 fair): floorless spans INSIDE the late sections when asks change what is laid there (log-chain
   ->quiet-arrival 9, canopy-rungs(-level)->exit 13, the arrival's own end 6, rests before the seed perch 6). The bare frame on the same
   seed lays the same log-chain and passes: diff findW1Pits' 'fall' list bare vs asked, `A C2> M^:t0.9 R Xb^:1:#water R W:4 R S E` seed
   46, gap 33644..35110 (`npx tsx reference/qa-reports/VARIETY/tools/gapdump.ts "<code>" 46 33644 35110`). Fix the lay, never the verdict.
2. **V11/V14 'g'** (31/24): mostly downstream of 1: repair bans emptied an asked slot's pool (all twist-climb sections `ban` at slot 11,
   `A P< C:1:#hurt R X&<:&snake*1! R Wc:#water R S E` seed 9), the slot filled by its job (ground). After 1, a ban spares a slot's last
   section of its dealt type. 3. **'_' on 1-1** (21): 1-1 climbs (V19, V19b lift): name the conflict at graph time, never lay against V19.
4. **find '+'** (17+13): no W1 section has a find socket (Content). **Later** (s v p t x, beat, points): B14/B15. **Toy kit**: only its
   ground sections rise or fall, so two shape asks break V11's cap: give toyLegs.ts a rising and a falling floating section.
## Done
0. **Item 0, a9b3698b** (engine-vault.patch applies clean on t-b14@cbe090f0). Root: the ENGINE's vault finder (engine.ts vaultSide)
   sampled from 10 px and stopped at the first miss: it never saw a cleared vine's bough (CLIMB_CLEAR 26, game-wide), so straight up
   vaulted the way he faced (off the storey above at a turn-back). One finder now, src/game/vineTop.ts, for the engine and the new verdict
   towerVaults (D19). Planted: vineTop.test.ts from 1-4 Easy seed 1's turn, real engine, red facing right before; VAULT_GAP 40 < the real
   vault's 56. On 1-4 (t-b14 + patch): 13/13 open vines land facing either way. tools/engine/vaultscan.ts (102 stages x 16 x 2): 3,906
   vault cases fixed, 0 regressed, 0 moved; 1-1 has none.
1. **74290856: a shape/move ask is a rule where the slot can keep it**: the deal fixes a node whose ask ONE type of its job lays; the pick
   draws only candidates that lay every ask (x20 lost to the bag's floor ticket and the rating sort); a shape ask never draws a section
   against it while a level one fits. Planted (nodeAsks.test.ts x2): red before (7/8 seeds named; a '_' node rose). A deal supply filter
   was tried and REVERTED (moved nothing measured).
2. **Variety number** (clean with every ask, one seed a string): legs fixture 2 -> 3 of 60; W1 at 1-1 1 -> 1. Shape laid/named, toy:
   ^ 10/10 -> 20/0, _ 7/13 -> 16/4; W1: ^ 20/16 -> 23/13, _ 10/26 -> 11/25.
## Gates
74290856: tsc PASS; lockall vs main d8d6a973 102/102 unchanged; seedlist 1-1 --check PASS (257); nodeMix 2/2, nodeAsks VARIETY 2/2;
generality, knowncheck, artcheck PASS. a9b3698b: vineTop 5/5, tower+legs 61/61, vault tests 115/115; full suite running at the stop
(2,364 done, 0 failed). roadmapcheck cannot run here (shallow clone).
## Polish check, pushback
No drawing changed; the vault was judged on the real engine at 1-4's vines, both facings. Pushback: item 0 said "fix the lay"; the lay's
26 px clear is right and game-wide (W8, 10-29); the root was the engine's finder (proof above).
## Method, lessons, Learned
ENGINE.md day one, level.md 12, gates.md. Lessons: D19, D37 (pasted real-engine runs), D46, D15 (`off` vines, field feet in the probe).
**Learned:** "the verdict lets it through" can mean the engine is wrong: probe the real engine at the spot first. A weighted ask is not a
rule while a bag gives every candidate a ticket. Measure a fix before keeping it.
