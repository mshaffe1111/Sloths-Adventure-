# ENGINE-NEEDS: what the engine builds in bulk, and in what order (R-165.186, R-165.187). Architect, 2026-11-13, on 343edd27.
Matt 10:26 AM ET: "find which types of elements we do the most, and build them in the engine. In bulk." Map counts: WORLD-MAP.html:183-309,
re-tallied in reference/qa-reports/ENGINE-NEEDS/map-tally.txt (90 stages, same counts as the packet). Code read only; every cite re-grepped last.
Terms: GEN2 = any world's sections lay it from data; ONE-WORLD = only one world's kit; RUNTIME = the game runs it, gen2 cannot lay it;
DORMANT = runs, nothing lays it; LANDING = in flight today (FA, B14, B15). N = stages on the map.

## 1. Truth table
| Piece | N | Status | Proof (file:line) and the gap |
|---|---|---|---|
| up | 20 | LANDING (FA) | today gen2 throws on ascent (gen2/pipeline.ts:422); engine `up` mode exists (stageModes.ts:42) |
| down | 4 | LANDING (FA 1b, only if 1-3 gate) | engine `down` mode (stageModes.ts:51); only 4-7 sets travel 'down' (stagePlan.ts:78) |
| left / out-and-back / switchback | 4+1+1 | RUNTIME / MISSING | engine `left` mode (stageModes.ts:34, read at engine.ts:826); every gen2 graph is flow 'right' (gen2/pipeline.ts:595); no return leg anywhere |
| vine field (two hands, lattice) | 1-4 | LANDING (B14) | crude runtime on t-lattice (vineField.ts, room only); main climbs one straight vine (gen2/types.ts:272) |
| clock | 20 | RUNTIME, partly GEN2; LANDING (B14 pods) | one clock exists (clock.ts:1-14) but the engine gets no named clocks (engine.ts:564); beatBrick/ride unimported |
| dark | 17 | ONE-WORLD (W6, borrowed by W8) | darkZone emitter (gen2/worlds/w6Swing.ts:427); zone kind 'dark' exists (zones.ts:22); jar is 8-4's (engine.ts:719) |
| swing | 11 | GEN2 | PlaceRule 'swing' (gen2/types.ts:270); used by W6, W7, W8 kits. Nothing to build |
| ride | 11 | RUNTIME; ride.ts DORMANT | 'moving'/'drift' platforms (types.ts:292, engine.ts:1702) from old stages; ride.ts:1-9 built, no importer |
| still | 10 | ONE-WORLD (W6; W8 copy) | hide/watch emitters (gen2/worlds/w6.ts:302); world-neutral cast stillness has only W1 rows |
| water | 10 | GEN2 (deadly gaps, tide); pool, rising: RUNTIME | PitKind/flags (gen2/types.ts:267), tide zone (:400); swim only via a room lift; rising water hand-built |
| lure | 8 | DORMANT | foodChain runs (castPlay.ts:142); only W1 kinds registered (predators/registry.ts:10), no lure-target socket |
| crumble | 6 | ONE-WORLD (W7 tiles); LANDING (B15 bough) | 'ruin' style and off-route forced (gen2/pipeline.ts:1460, :1242); whole on respawn (engine.ts:5536) |
| fling | 6 | GEN2 (implicit) | release sized by lianaRelease (gen2/pipeline.ts:237) onto a 'land' perch; no far-fling rule |
| hang | 5 | GEN2 (straight rope only) | PlaceRule 'rope' (gen2/types.ts:273); hanging under roots/netting: MISSING |
| glide | 5 | GEN2 (level pits) | pit jump 'glide' (gen2/types.ts:267); a glide DOWN a drop: MISSING (needs the descent lay) |
| wind | 5 | GEN2 gusts; updraft RUNTIME | SectionZone 'wind' (gen2/types.ts:401); ventLift (zones.ts:148) only from the old generator (stageGenerator.ts:1826) |
| break / push | 5 | MISSING | 'breakable' is a planned type only (stageKit.types.ts:64) |
| trap | 4 | ONE-WORLD (W1); LANDING (B15 limb load) | pair machinery generic; props W1's (gen2/worlds/w1Cast.ts:40) |
| noise | 4 | DORMANT; drum MISSING | landing noise gated by world (castPlay.ts:85); drumNoise has no caller (heroNoise.ts:46) |
| follow | 4 | cages GEN2; following MISSING | rescue lays a cage (gen2/pipeline.ts:2549); no follower in the engine |
| hold | 4 (all W10) | MISSING | bolts runtime only (zones.ts:336); nothing tears his grip |
| leash 3, machine 2, heat 2, drowsy 2, chase 2 | | MISSING / room gates GEN2 / MISSING / MISSING / RUNTIME | tether planned (stageKit.types.ts:84); plate/gate/lever (puzzleKit.ts:66); timed door planned (stageKit.types.ts:66); ZoneKind has no heat (zones.ts:22); chase hand-built (protoStage.ts:6712) |
| hurt 1, roads 1 | | GEN2 (W1 data) | throws without a hurtFloor row (gen2/pipeline.ts:1962); two-road graphs (gen2/types.ts:568, gen2/worlds/w1.ts:1433) |
Under the table: SectionZone has 2 kinds (gen2/types.ts:399-401), the engine runs 8 (zones.ts:22); the cast runtime is world-neutral, W1's data only.
## 2. Ranked bulk list (rank = stages x how soon; W1's 1-6..1-9 and W2 are next). Later, by hand (<=3 stages, or one late world):
leash (W5), drowsy (W5), heat (W9), machine's timed door and relic chair (W7), chase (1-8, 7-6: chase.ts exists), hold (W10 only), drum (3-5).
Sizes from measured jobs: S ~1 h (EN-W 1 h, STATE.md:434,445; LATTICE runtime + room 1 h 14 m, 10:33-11:47 PM 11-12, t-lattice@f302f06e);
M 2-4 h (P13's plumbing 12:07-4:01 PM, STATE.md:508,608); L 6 h+ (the ascent lay: plan 10:05 PM 11-12, 5244cb6f; not landed yet).
Every packet: its lay in a NEW gen2 file, one hook each in gen2/pipeline.ts and gen2/types.ts taken by token (TODAY.md tokens), looks from
world data, planted tests, proven on 2+ worlds' kits, lockall unchanged for every existing stage (ARCHITECT.md:50).
| # | Packet | Serves | Size | WRITE (new files unless marked shared) | Depends on |
|---|---|---|---|---|---|
| 1 | CLOCK-ON: named ClockDefs reach the engine; beat bricks (snap stones, sinking pads) and clocked hazards laid from data | clock 20 (1-8, 2-2, 2-5, 2-9 first) | L | gen2/beatLay.ts; engine.ts (shared: clock at :564); beatBrick.ts | B14's beat clock + pods |
| 1b | REWARDS (R-165.193): a woven-basket ring on the HUD (story keeper: fruit for Meeca's welcome-home table), full basket -> extra life, chain multiplier, finds open hidden stages on the map | every stage | M | gen2-free: hud + save + map | none |
| 2 | STILL: hide + watcher as world-neutral sockets, look by world row; W6/W8 emitters move onto it | still 10 (1-7 first) | M | gen2/stillLay.ts; gen2/worlds/w6.ts, w8.ts (theirs) | none (pipeline hook after FA) |
| 3 | CAST-WORLDS: the predator registry by world; lure targets as sockets; landing noise by world data | lure 8, noise 4, trap 4 (1-7, 1-9 first) | M | predators/registry.ts, predators/world2.ts+, gen2/lureLay.ts | B15 (limb load) |
| 4 | RIDE: ride.ts wired into the engine; logs, pads, lifts as gen2 pieces | ride 11 (5 of W2's 9) | M | gen2/rideLay.ts; ride.ts; engine.ts (shared, after 1) | 1 (ride reads the clock) |
| 5 | TRAVEL-LEFT: gen2 lays flow 'left' (spawn right, exit left); out-and-back's return leg | left 4 + 2-7 + 10-5 | M | gen2/pipeline.ts graph (shared, long hold) | FA (flow field) |
| 6 | ZONES-BY-DATA: SectionZone gains dark, spore, geyser, bolt, web, updraft | dark 17 (zones part), updraft 3, webs, 3-4 spores | M | gen2/zoneLay.ts; zones.ts | 1 for clocked zones |
| 7 | LIGHT: carried and followed light, lit-only ledges as gen2 sockets (8-4's jar generalised) | dark 17 (W3 first) | M | gen2/lightLay.ts; w8LanternRun.ts | 6 |
| 8 | FOLLOW: freed animals follow home (state, path, home) | follow 4 (2-3 first); leash later | M | follow.ts; gen2/followLay.ts | 3 |
| 9 | RISE + POOL: rising water/lava and a calm pool as pieces | water 10 (2-8 first) | M | gen2/waterLay.ts | 1 |
| 10 | HANG-UNDER: hand over hand under a ceiling of roots or netting | hang 5 (3-2 first) | M | hangUnder.ts; gen2/hangLay.ts | none |
| 11 | BREAK-PUSH: cracked stone, push blocks | break 5 (7-2 first) | M | breakable.ts; gen2/breakLay.ts | none |
| 12 | Small: far fling (W8), glide down a drop (4-7, 8-6), crumbling vine (7-5, 9-3) on B15's bough | 6 + 2 + 2 | S each | gen2/pipeline.ts land rule (shared) | FA 1b, B15 |
Side by side: wave A (now, beside FA/B14/B15): ADD-LEVEL (section 3; tools only) and 10, 11 (new runtime files only, hooks later).
Wave B (after FA, B14, B15 push): 1 || 2 || 3: disjoint WRITE lists; pipeline/types hooks in the order 2, 3, 1. Wave C: 4 || 6 || 5
(5 holds pipeline.ts longest: 4 and 6 hook first). Wave D: 7, 8, 9, 12. engine.ts: one holder at a time (1, then 4).

## 3. The 2-hour level: what stands between a finished design and a tested level today
Measured: 1-2 took 4 h 12 m, 1-3 8 h 20 m (LEVEL-LOG.md:9, :8); 1-3's plumbing alone (bots, flown rows, seed list) was P13's ~3 h 50 m.
1-4's design took 22 min (LEVEL-LOG.md:10), so the gap is build + plumbing. By hand today, a new gen2 stage is touched in 9+ places:
the arc file and its feel id (gen2/worlds/w1.ts:75), its row (gen2/worlds/stageTable.ts:32-38), a kit name for a new kit
(gen2/listed.ts:26), flown reach rows from a flight sim (gen2/worlds/flownArcs.ts:20-56), its seed list (provenIndex.ts:5-8, generated),
levelSeeds.ts:9, its sprite sheets (stageSheets.ts:75), drawcheck's scenarios (tools/perf/limits.json:3-14, D51) and run.mjs:36, and a
per-stage COPY of the roll tool (level.md:28; library13.ts:50 hard-codes '1-3'). Two holes: CI checks only 1-1's seed list
(.github/workflows/gates.yml:95), and 1-2 holds no list at all (provenIndex.ts:5-8). Nothing fails when a step is skipped (D51 again).
**Packet ADD-LEVEL (M, ~3-4 h from P13's plumbing; tools only, so it runs now beside FA/B14/B15):**
1. `tools/engine/libstage.ts --stage <id>`: one roll tool for any stage, reading the arc from its stageTable row (retires the copies).
2. `tools/engine/addlevel.ts <id>`: from the row, rolls 24 seeds both settings, records the seed list, runs castBots 1-40, prints the
   flight-sim command for the flown rows, and lists every place below the stage is missing from.
3. `tools/engine/registrycheck.ts` (a gate, planted test): every stageTable row has its sheets, its levelSeeds entry, a drawcheck
   scenario, a seed list or a named stand-in, and flown rows or `reach.unflown`; gates.yml runs `seedlist --check` for EVERY list.
WRITE: those three (+ test), gates.yml (lead's token). Reads only stageTable/limits.json (shared: B14/B15 add 1-4/1-5 rows by hand
today). Done: 1-4 or 1-5's real registration replayed by the tool in one step; a planted missing drawcheck entry fails the gate.
The rest of the 2 hours is pieces: a level built only from GEN2 pieces is design + data + this tool. Section 2 buys that.
## 4. Where the vine field comes back after 1-4 (R-165.177: a teach that grows); for the Designer and Matt, not a map change
- 3-4 (ascent, dark, clock: "sleepy mushrooms puff on a beat as you climb"): the field in the dark, puffs on a beat. Needs 1, 6.
- 5-4 (vine_runner: "sticky webs slow you"): a field where webbed vines are slow to climb; or 5-8 (the leash on a climb). Needs 6.
- 7-5 (ascent: "brown vines snap a moment after you grab them"): the strongest fit: snapping vines force the two-hand hop. Needs 12.
- 10-4 (ascent: "hold on during the climb") or 10-6 (netting, running left): the finale field. Needs hold (later) or 5 + 10.
My pick: 3-4, 7-5, 10-4 (one per act). Pushback: the map gives the field no W2 stage; 2-6 (lifts, ascent) could carry a short one.
