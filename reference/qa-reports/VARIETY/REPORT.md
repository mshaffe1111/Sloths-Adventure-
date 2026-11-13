# VARIETY REPORT (R-165.197/.198/.200). Engine, Opus 5.5 max. t-nodes. 1:52 PM - STOP_TIME, 11-13. Stopped at ~40% context (D55).
**EXACT NEXT STEP (ranked by W1 strings killed, nodeMix on MIXHEAD; "fair" = every ask W1's kit can lay: 12 of 60):**
1. **W1 floor.unmarked** (36 strings; 9 of the 12 fair): the floorless spans sit INSIDE the late sections when the asks change what is
   laid there (joins: log-chain->quiet-arrival 9, quiet-arrival's own end 6, canopy-rungs(-level)->exit 13, stair-test-back->exit 3,
   rests before the seed perch 6). The bare frame on the same seed lays the same log-chain with its catches and PASSES. Diff
   findW1Pits' 'fall' list, bare vs asked, on `A C2> M^:t0.9 R Xb^:1:#water R W:4 R S E` seed 46 (gap 33644..35110):
   `npx tsx reference/qa-reports/VARIETY/tools/gapdump.ts "<code>" 46 33644 35110`. Fix the lay or the marking, never the verdict.
2. **V11/V14 'g'** (31/24): mostly downstream of 1: the repair loop's bans empty an asked slot's pool (every twist-climb section was
   `ban: true` at slot 11 of `A P< C:1:#hurt R X&<:&snake*1! R Wc:#water R S E` seed 9), the slot is filled by its job (ground), 'g'
   passes its cap. Re-measure after 1; then a ban must spare a slot's last section of its dealt type.
3. **Shape '_' on 1-1** (21): 1-1's brief climbs (trend up, endHigh; V19 mustRise and the V19b lift force rises): a fall asked there is
   a brief/ask conflict. Name it at graph time (NODES-2 #3/#4); never lay against V19.
4. **find '+'** (17) / **+seed** (13): no W1 section has a find socket: Content (kit/art), a packet for the lead.
5. **Later** (s v p t x, beat, points): B14/B15's emitters. **Toy kit**: only its ground sections rise or fall, so a string with two
   shape asks cannot keep V11's cap there: give toyLegs.ts a rising and a falling floating section before its number means much.
## Done
0. **Item 0, a9b3698b (patch reference/qa-reports/VARIETY/engine-vault.patch, applies clean on t-b14@cbe090f0).** Root: the ENGINE's
   vault finder (engine.ts vaultSide) sampled from 10 px and stopped at the first miss, so it never saw a cleared vine's bough
   (CLIMB_CLEAR 26, every climbing vine, game-wide) and straight up vaulted the way he faced; at a turn-back he faces away. One finder
   now (src/game/vineTop.ts), read by the engine and the new verdict towerVaults (D19). Planted: vineTop.test.ts (1-4 Easy seed 1's turn,
   real engine: red facing right before, green after; VAULT_GAP 40 inside the real vault's 56). 1-4 itself (t-b14 + patch): 13/13 open
   vines land facing either way. tools/engine/vaultscan.ts, every stage x 16 layouts x 2 settings: 3,906 vault cases fixed, 0 regressed,
   0 moved; 1-1 has none (tierBots untouched).
1. **74290856: asks are a rule where the slot can keep them.** The deal fixes a node whose shape/move ask ONE type of its job lays;
   the pick draws only candidates that lay every ask (the bag's floor ticket and the rating sort outdrew x20); a shape ask never draws a
   section against it while a level one fits. Planted (nodeAsks.test.ts, 2 tests): red before (7/8 seeds named; a '_' node rose), green.
   A supply filter on the deal was tried and REVERTED (unproven: it moved nothing measured).
2. **Variety number (nodeMix, clean with every ask):** W1 at 1-1 W1NUM; legs fixture TOYNUM. Shape kills: SHAPENUM.
## Gates
GATESLINE
## Polish check
No drawing changed. The vault is behaviour: judged on the real engine at 1-4's vines, both facings (above); no stills needed.
## Pushback
Item 0 said "fix the lay at the root": the lay's 26 px clear is right and game-wide (W8's life, 10-29); the root was the engine's finder.
## Method, lessons, Learned
ENGINE.md day one (lock baseline on main first), level.md 12 (planted first), gates.md. Lessons: D19 (verdict and engine share the
finder), D37 (claims proved with pasted real-engine runs), D46 (the plain action lands), D15 (tested the probe: `off` vines, field feet).
**Learned:** a verdict "lets it through" can mean the engine is wrong, not the lay: probe the real engine at the spot before fixing the
lay. A weighted ask (x20) is not a rule while a bag gives every candidate a ticket. Measure a fix before keeping it (the supply filter).
