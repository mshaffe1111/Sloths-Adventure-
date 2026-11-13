# D17-18 report: 1-7 and 1-8 designed (design only; branch t-1718-design from origin/t-int-3 31b8a742)
EXACT NEXT STEP: the lead reads reference/design/1-7.md and 1-8.md, checks the tributes a/b/c (D58), rules the Pushback below; then the engine study starts from the combined table at the end of 1-8.md.
## 1. Done-items
- 1-7.md: 60 lines; one idea, arc table (s / bits / feel), teach then grow, twist, signature, finale, hearts and flags by Matt's rules, Easy, phone both ways, tributes a-d (3), node string, Building blocks EXISTS/NEW (12), Ideas used, Nature check.
- 1-8.md: 60 lines, the same shape (tributes a-d: 4), plus the ONE combined table: 28 NEW blocks across 1-6 (from 1-6.md), 1-7, 1-8 with size, levels and dependencies.
- Facts checked in code before use (D7): stillness.ts:20-87, watcher.ts:25-181, predators/world1.ts:74-96, core.ts:19, :265-276, chase.ts:1-45, roster.ts:45-57, fight.ts:259-261, physics.ts:13, :471, stageClue.ts, storyWorlds.ts:67, MAP-REVISIONS.md lines cited, PREDATORS.md:131, pokeyJournal.ts:55, GAP-MAP.md:78; art names grepped in inventory w1.json and the atlases.
## 2. Polish check
Design only: no stills (nothing built). Each beat names the stills the builder shoots (upright 412x915, sideways 915x412) and the numbers to put in tests.
## 3. Pushback
- RULED (the lead, 4:36 PM; re-tuned 4:34 PM ET): all four accepted. 1-7 Normal 5.5 / Easy ~3 and 1-8 Normal 7.5 / Easy ~4 per DIFFICULTY §4; K3 and the finale's nuts 1.5 s+ apart (one threat at a time); no lure in World 1; give-up stays EXISTS. No NEW block changed, so the combined table stands.
- DIFFICULTY: the packet says each stage harder than the one before; DIFFICULTY.md §4 sets 1-7 at 5.5 (a breather) and 1-8 at 7.5. I followed the packet (1-7 7.5, 1-8 8.5, 1-9 still 9.5); both fit Matt's band rule (STAGE-RULES §1b). §4 needs the lead's edit, or tell me to design 1-7 at 5.5.
- Packet fact "gives up after 2 empty passes is not in watcher.ts": true, but it EXISTS in the kit (`giveUp: 2`, world1.ts; core.ts:265-276 endPass: flees 8 s). Not a NEW block.
- MAP-REVISIONS.md:159 puts Matt's #22 sound stealth "IN: 1-7"; roster.ts:51-57 (the lead, 11-12) has no landing noise before World 2 and thrown noise from World 3. I designed on roster.ts (no noise in 1-7); the map line or the ruling needs one answer.
- 1-8 K3 lays a low nut and a fruit within 1.5 s: on the meter that is overlap (DIFFICULTY §1: "World 1 has no overlap"). It is one hazard's two faces (Matt's #5, Jungle Hunt). If the lead reads World 1 as one threat at a time, K3 keeps only the pair in rhythm (1.5 s+ apart) and Normal drops about 0.5.
- List C's "stageClue.ts:22" is src/components/stageClue.ts, not src/game.
## 4. Suggestions (ready packets)
- NODES owner: add content letters m (cover: bush, moss, hanging moss) and h (World 1's nut hazard) to NODES.md §8 / NODE-KEY.html, with their MUST/NEVER pieces (both designs use them).
- Engine study: one hide rule for the whole game (the crouch in w6.ts/w8.ts zones to stillness), so no player meets two (row in the table).
## 5. Unresolved
- Nothing flown: the nut roll speed, the fruit's arc, the chase camera lead, the stick's dead zone, how long the sweeper's shadow is on an upright screen; every bit is my estimate (score.ts reads the built stage).
- Story conflicts left for the keeper: the acorn journal line (pokeyJournal.ts:55), GAP-MAP.md:78's "Get low" line, list B's guard-b reading (1-8's still fork).
## 6. Method update (level.md)
- Proposed rule for level designers: "Read the kit's data before the map's words: the map says 'stillness anywhere', World 1's eagle sees a still sloth in the open (world1.ts:81), so moss must be COVER." Evidence: two of three lists caught it, one did not.
- Proposed: "Turn every chase beat into a stop budget first ((gap - 24) / front speed); a beat that needs more is unfair, not hard" (list C's, used for every 1-8 beat).
## 7. Turnover note
reference/handoffs/designer.md: the read-first list now points at 1-6/1-7/1-8 designs, the combined table and the two-hide-rules trap (this commit).
**Method used:** reference/methods/level.md (rules 1-18) + D16.md's shape (1-6.md). **Lessons applied:** D7 (facts in code, cites fixed), D41 (89.1 px drawn head for the fruit and the tint), D46 (in-stride chase beats), D49 (flags and hearts by Matt's rule over my table), D30 (times from `date`), D53 (fast gates before push), D58 (tributes a-d with sources).
**Learned:** the kit already holds most of what the map calls new (give-up, still-in-cover, a non-riding sweep for the perch); grep predators/ before calling an eagle behaviour NEW.
