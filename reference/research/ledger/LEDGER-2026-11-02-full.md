# Ledger: the full Gemini variety report of 2026-11-02, line by line

Source: `reference/research/GEMINI-VARIETY-2026-11-02-full.txt` (181 lines, 31 cited sources; line numbers below are that file's). Every line
was read, every table row included. Compared against: the triage `reference/research/GEMINI-VARIETY-2026-11-02.md`, `reference/STAGE-RULES.md`
§0, §0b, §0c, §1, §2 (the pacing, tension and density rows), `reference/PLAN-TO-80.md`, `reference/ROADMAP.md` (R-150 to R-162) and the fun
validator `tools/validate/` (core.ts, evaluate.ts, mechanics.ts, play.ts, funknown.json). Facts about our game checked in `src/` (cited
file:line, checked 2026-11-04 on the work branch).

**The headline finding first.** The triage file's table does not triage this report. It triages a different text: the earlier pasted
summary (moving-platform kinds, water laws, six puzzle types, mission graph, pacing tags Tight/Flowing/Relaxed/Cerebral). None of those
topics is in the full text. I checked the .docx: it holds the same report as the .txt (no moving-platform or puzzle section). Of the full
text's ideas, only three reach the triage file: lift momentum (L17), the slot roles in a flattened form ("stage types per world"), and the
W10 grip fact (L157, in its UPDATE note). The full text reached us another way: the lead wrote STAGE-RULES §0b (rules 1-8) and R-153 to
R-157 from it on 2026-11-02 (7:59 PM ET). So "missing from the triage" is not a miss by itself. A real miss is something that §0b, the
plan, the roadmap AND the validator all leave out or water down. Section 1 lists those.

Status words: **IN** built as the report says; **PART** built in part or in another form; **NOT** not built; **n/a** not a gameplay claim, or
not ours to build.

---

## 1. Missed or flattened (ranked by how much each one fights "every stage and world feels the same")

1. **Each stage is built around ONE named mechanic pair: that pair is its identity.**
   Report: "every three-to-five-minute stage becomes a self-contained four-act showcase for a specific mechanical pairing" (L61); fatigue
   comes when "stages lack distinct per-level identities" (L5).
   Today: §0b.5 counts pairs per world; §0c.2 picks a node by "the mechanic pair it teaches or twists". Nothing says a stage owns one pair,
   and nothing stops two neighbours sharing it. Stages are built from a stage type (stagePlan.ts:31-145) and a draw of pieces
   (w1Sections.ts, §0c). The validator's pairs (mechanics.ts:43-61) only feed "nothing new".
   Proposal: ADOPT. Every stage's plan names its pair, its direction and its tempo. No two stages of a world share pair + direction. The
   validator reads the pair back from the real beats.

2. **A pair is two mechanics acting on the same beat, not two mechanics somewhere in the stage.**
   Report: the table's middle column is the "Emergent Kinesthetic Interaction", e.g. "wind pushes the avatar off a crumbling branch
   before its break timer expires" (L46).
   Today: `sixThings`/`pairsOf` (mechanics.ts:43-61) count a pair when both things appear anywhere in the stage. Run+jump is always
   counted (line 45). Any trunk counts as "vines" (line 47). World 7's crumbling floor counts as "slow" (line 49). So the table can read
   "five pairs" for a stage where nothing ever combines.
   Proposal: ADOPT. A pair counts only when both act inside one rhythm group (the same platform, or within about 5 s). Fix the classes:
   crumble is "branches"; tide and the drowsy cloud are "slow"; geyser lift is "wind" (the report's own classes, L15, L40, L177).

3. **A world's own mechanic must not stop at its world's border; it comes back later as the twist for the new world's mechanic, without
   re-teaching.**
   Report: "A common structural failure... introducing wind in World 4 and abandoning it in World 5. Instead... a mechanic taught as the
   primary focus of an early world should return later in the campaign without retraining to serve as the twist (ten) for a new
   mechanic" (L105).
   Today: §0.1 says "comes back in every later world, harder or combined" (the principle is IN). But the code is exactly the report's
   failure: `zoneRecipes` gives each zone kind to one world only: spores 3, wind 4, webs 5, tide 6, crumbling 7, dark 8, geysers 9,
   lightning 10 (zones.ts:424-433). R-152.4 (the bring-back gate) is blocked until Matt's World 1 rating. "As the twist" and "without
   re-teaching" are in no rule.
   Proposal: ADOPT the sharper wording into §0.1: in each world from 2 on, the twist part of most stages uses an earlier world's mechanic
   against this world's. R-152.4's gate counts zone kinds per world from real stage data.

4. **Direction multiplies every combination: across, up and down.**
   Report: each combination "can be further multiplied by spatial orientation (horizontal, ascending, descending) and temporal pacing"
   (L5).
   Today: §0b.5 has no direction. §0b.6 only says neighbours must not share a camera direction. No stage or node records its direction.
   "Going down" exists as one stage, 4-7 The Long Drop (stagePlan.ts:74).
   Proposal: ADOPT. Every node and stage tags its direction. Each world uses each of its pairs in at least two directions. Each world has
   at least one going-down stretch. This is variety from pieces we already have.

5. **Each slot of a world has its own camera direction, density and kind of thinking, and nine stages that share them feel the same.**
   Report: "a 10-stage World will feel repetitive if all nine platforming levels share the same rhythmic tempo, camera vector, and
   cognitive load" (L73); the slot table gives each slot a camera column and a density column (L80-98).
   Today: §0b.6 kept the slot roles and the neighbour rule (tempo and camera), but not each slot's density, camera or "thinking load"
   (hands vs head vs stealth). Nothing measures any of it. The stage plan already breaks §0b.6: 10-4 Holding On and 10-5 Halfway Up are
   both climbs side by side (stagePlan.ts:139-140). X-2, the report's "across with gentle slopes" teach slot, is a climb in 7-2, 9-2 and
   10-2 (stagePlan.ts:102, 126, 137).
   Proposal: ADOPT. Put slot role, camera direction, density and mode (dexterity / climb / puzzle-or-stealth / breather) on each stage in
   stagePlan.ts. A test fails two neighbours that share camera and tempo.

6. **The twist must break the rhythm the player just learned.**
   Report: "an unexpected recontextualization or multi-mechanic layering that subverts the player's established rhythm" (L69).
   Today: §0b.2 says it in words. The validator has no check that part 3 differs from part 2. §0b.9 only says no two groups in a row
   share both beat type and density.
   Proposal: ADOPT. The validator compares part 3's moves, beat type and mechanics with part 2's, and flags a twist that adds nothing new.

7. **The finale is a 15-20 s dense run of everything the stage taught, and it ends at the exit.**
   Report: Cell 4 "delivers a 15 to 20-second high-density rhythm group that synthesizes the stage's mechanics... culminating at the stage
   flag or exit... ending with a rapid conclusion" (L69).
   Today: §0b.2 says it. But World 1's finish is `fillTo` padding (§0c; 14 "padding" entries in funknown.json); STAGE-RULES §2's tension
   row asks for "an easy walk out" after the climax; and the validator flags any tight stretch over 15 s as "two tight bits in a row"
   (TIGHT_MAX 15, core.ts:254, 288), which is the report's own finale.
   Proposal: ADOPT. Allow a 15-20 s dense last group; set TIGHT_MAX for the last group to 20 s; limit the walk out to about 3 s.

8. **Density climbs through the four parts.**
   Report: part 1 "5 to 10 seconds, low action density" (L65); part 2 "10 to 15 seconds at medium action density" (L67); part 4 "15 to 20
   ... high-density" (L69).
   Today: STAGE-RULES §2's pacing row sets one burst length (10-14 s) and one density band (0.75-1.15 actions a second) for a whole
   Normal stage. The validator checks only that there are 4 groups, one tight window and a gentle intro (core.ts paceFlags), not the order.
   Proposal: ADAPT. The validator checks the groups in order: low at the start, the densest group in the last quarter.

9. **A stage can feel new from feel alone: long momentum leaps versus small precise moves.**
   Report: "Two platforming stages that utilize the exact same tile set of vines and breaking branches will feel fundamentally distinct if
   one demands high-momentum ballistic trajectories while the other tests micro-positioning at the apex of a jump" (L11).
   Today: nothing. No stage records its feel.
   Proposal: ADAPT. Each stage plan names its feel (long run-ups and wide gaps, or small ledges and short hops); neighbours alternate.
   Same pieces, tuned numbers.

10. **Two tempos inside one beat, and two clocks at once.**
    Report: "sprint and jump rapidly across crumbling sinkhole ledges, then immediately decelerate upon catching a thorn vine" (L139);
    World 7's "dual-clock timing: executing rapid micro-adjustments on decaying floors while tracking slow, macro-scale enemy attack cycles"
    (L149).
    Today: §0b.3 works at stage and world level. The validator's "one tempo" flag only asks that hurry and patience each appear once
    somewhere (evaluate.ts, tempoOf mechanics.ts:133).
    Proposal: ADOPT as twist templates (a crumbling run that ends on a watched vine; a crumbling run under a slow sweep, watcher.ts exists).
    The validator counts hurry-to-patience switches inside 10 s.

11. **Each world has a named tempo "polarity".**
    Report: the matrix's "Wind & Slow-Down Polarity" column (L112-132): W3 "Slow-Down (Inverted)", W5 "Slow-Down (Impulse)", W7
    "Slow-Down (Temporal)", W10 "Wind (Lethal Squalls) + Slow-Down (Grip)" and so on.
    Today: §0b.3 says "Worlds alternate between them" but no world is given its polarity; §0c.7's fingerprint has beat mix, camera, pairs
    and pieces, not polarity.
    Proposal: ADOPT into the §0c.7 fingerprint: each world's hurry-to-patience share and its polarity, different from the world before.

12. **Slow-downs come in two kinds, and a slow field pushes the player up to a better route.**
    Report: "differentiating surface-contact slow-downs from volumetric slow-downs" (L15); a wading field forces "the player to seek
    elevated stilt roots or aerial vines" (L15); 2-3 teaches "the value of aerial vine routes over ground wading" (L137).
    Today: §0b.4 gives variants for branches, vines and wind, none for slow-downs. Code has only the volume kind: webs (0.4 run, 0.85 jump,
    zones.ts:205-217), tide (zones.ts:209, 218-221), spores (DROWSY_SPEED 0.5, zones.ts:158). The contact kind exists only as World 5's
    stillness wrap (w5Kit.ts:5-7). No node offers a high route over slow ground.
    Proposal: ADOPT. Add slow-down variants to §0b.4 (sticky-unless-you-hop, wading field, drowsy cloud) and a two-height node template.

13. **Every world's X-8 has a pressure that moves.**
    Report: X-8 "Rising Hazard / Autoscroll Pressure", "High density (15-20 s groups); layers 3+ mechanics" (L94).
    Today: §0b.6 keeps "X-8 everything layered" and drops the moving pressure and the 15-20 s. Built: 1-8's collapsing chase (chase.ts:1-8)
    and 2-8's timed flood basins (w2Sections.ts:990-1018). No other world's X-8 has one.
    Proposal: ADOPT. A moving pressure per world's X-8 (a chase, rising water, a closing light, a squall front), from pieces we have.

14. **X-9 previews the boss's attacks.**
    Report: X-9 "foreshadows Guardian attack patterns" (L96).
    Today: §0b.6 says only "the run-up to the boss". Every X-9 is a fight through the world's animals (stagePlan.ts:42, 53, 64, 76, 87, 98,
    109, 122, 133, 144).
    Proposal: ADOPT. X-9 teaches the boss's tell in a small form. That gives each world's X-9 an identity of its own.

15. **Each act has its own mechanical job.**
    Report: the game is "a macro-level Kishōtenketsu arc divided across three distinct narrative and mechanical Acts" (L105). Act I
    calibrates, then flips speed (L137-139). Act II adds outside forces and takes away guidance (L143-147). Act III does three- and four-way
    combinations (L153).
    Today: the acts are story acts in stagePlan.ts (lines 32, 66, 111). §0b.5 says Worlds 8-10 combine three and four. Acts I and II have no
    mechanical job.
    Proposal: ADAPT. Name each act's job in §0.5 next to the difficulty arc.

16. **Difficulty is felt through how much you replay after a death.**
    Report: "difficulty perception is governed less by the raw precision of individual jumps than by checkpoint density—the number of
    rhythm groups a player must replay upon failure"; tighter spacing in Acts II-III; "respawn within two seconds" (L165).
    Today: §0b.8 says "respawn within about 2 s of the hard part"; §0b.2 puts checkpoints before parts 3 and 4. Nothing measures either
    (no checkpoint check in tools/validate/), and no rule tightens spacing by act.
    Proposal: ADOPT. The validator reports hard groups between flags (at most 1-2) and seconds from respawn to the hard part.

17. **An optional hard branch in the twist, with the big find at the top of the hardest group: three risk tiers.**
    Report: Cell 3 is "the optimal structural location for a Portal, an optional, high-difficulty branching path" (L69); three tiers of
    finds by risk (L173).
    Today: §0b.2 keeps "the optional hard branch with the big collectible". Finds sit one kind per stage (finds.ts:45-47), with no rule
    on where in the stage or how risky. R-150.2 has the risky/safe split path, blocked.
    Proposal: ADAPT. Our three finds (note, keepsake, book) become the three tiers: the note behind a gentle clue, the keepsake on an
    optional climb, the book at the top of the twist's hard branch.

18. **World 10: one world-wide rhythm hazard; "hold on" when it comes.**
    Report: "World 10 layers all six systems under a global rhythmic hazard: The Storm Squall... hold the grip input before the thunder
    hits" with "5-to-10-second calm intervals" (L157).
    Today: PLAN-TO-80 notes we have no grip button. World 10 has lightning columns only (zones.ts:10, 432), no wind. Yet 10-3 and 10-4's
    goal lines promise it: "Hold on through the storm", "Hold on when the thunder comes" (stagePlan.ts:138-139).
    Proposal: ADAPT with no new button: when the flash warns, be on a climb (straight up always holds, §1) or behind rock before the
    sideways blast. That makes our own goal lines true.

19. **Pairs with no piece at all.**
    Report: Jump+Slow ("convert sticky traps into elastic pogo surfaces", L42), Branches+Slow ("a surface that simultaneously dampens
    movement speed while crumbling", L48), Vines+Wind ("wind gusts alter the resting angle and period of hanging vines", L50),
    Wind+Slow (anchor against gales, L54).
    Today: R-154 lists the gust-swung vine as NOT built. The other three are in no rule or roadmap item.
    Proposal: ADOPT the three that need no art: a crumbling patch inside a web; a hop-to-skim silk bridge; a gust lane over lianas.

20. **One exact repeat is allowed in part 2, to build the feel.**
    Report: part 2 is for "optionally repeating a rhythm group pattern before the next rest platform to build muscle memory" (L67).
    Today: §0c.3 rejects it ("Same piece, same numbers, twice = rejected"). See section 2. Low risk to sameness, but our rule is stricter
    than the research it came from.
    Proposal: ADAPT. One exact repeat inside part 2; the third use must change something you feel.

21. **Pickup spacing sets the tempo.**
    Report: 5-6 "accelerates the rhythm-group tempo by spacing Meeca's tree carvings closer together" (L145).
    Today: nothing. §0c.5 rightly says pickups never count as variety; this is a tempo tool, not variety.
    Proposal: ADAPT. Note in §0c.5 that trail spacing may set the tempo, never count as variety.

22. **A short retry intro for every boss.**
    Report: "Guardian boss retries must bypass full narrative intros... two to four lines... under nine seconds" (L165).
    Today: World 10 only (RETRY_INTRO_LINES { 10: 2 }, storyBosses.ts:216).
    Proposal: ADOPT (cheap, not a variety item; it cuts the replay sludge Matt named).

23. **Losing a companion changes how the game guides you.**
    Report: when Dot leaves, "Dot's verbose wayside run-on sentences vanish... Flicker assumes the companion slot with terse, minimalist
    directional cues" (L147).
    Today: who speaks follows the story (wayside.ts:15-19; §1 World 7 rule). PART.
    Proposal: keep. Low impact on sameness.

---

## 2. Where our rules contradict the report

| # | The report says | Our rule or tool says | Proposal |
|---|---|---|---|
| C1 | Finale: "a 15 to 20-second high-density rhythm group" (L69); X-8 "High density (15-20 s groups)" (L94) | Validator: `TIGHT_MAX = 15`, "a tight burst of N s with no let-up (two tight bits in a row; research: never T-T)" (core.ts:254, 288). STAGE-RULES §2 Pacing: "bursts (rhythm groups) 10-14 s with 8-12 actions Normal" | Let the last group (and X-8's) run 15-20 s dense. "Never T-T" comes from the other research, not this one |
| C2 | Groups of "5, 10, 15, or 20 seconds", density low/medium/high by part (L61, L65-69) | §2 Pacing: one band for the whole stage, 10-14 s bursts and 0.75-1.15 actions a second on Normal | Keep §2's band as the stage average; the four parts follow L65-69 |
| C3 | The finale ends "at the stage flag or exit... ending with a rapid conclusion" (L69) | §2 Tension: "the climax near the end, an easy walk out" | Walk out at most about 3 s, or none |
| C4 | Part 2 may repeat a pattern "to build muscle memory and visual consistency" (L67) | §0c.3: "Same piece, same numbers, twice = rejected." The validator flags a 3-move run 3 times back to back (RUN3_BACK, core.ts repeats) and allows two | One exact repeat inside part 2; then change |
| C5 | Breaking things include "crumbling stone floors in World 7" (L177); W9 updrafts are wind (L40, L130); W6 blackwater is a volume slow-down (L15) | Validator: World 7's crumble zone counts as "slow", not "branches" (mechanics.ts:49); tide is not "slow"; geysers are not "wind" (mechanics.ts:46-49) | Fix the classes in `sixThings` |
| C6 | Wind has both tempos: "tailwinds require high turn-acceleration braking... headwinds demand sustained forward input" (L32) | Validator: every wind beat is "patience" (tempoOf, mechanics.ts:133-134) | Read the gust's direction against travel: with him = hurry/brake, against = push |
| C7 | A pair is an "Emergent Kinesthetic Interaction" (L24-54) | §0b.5 / validator: a pair is two things present anywhere in the stage; run+jump always present (mechanics.ts:43-61) | See miss 2 |
| C8 | "Never place a before-stage cutscene at X-6" (L90, L169) | No rule needed: the game has no before-stage scenes (sceneList.ts:53-71) | Nothing to do |

**Our own numbers disagree with each other (found on the way, not the report's):** dead walking is "about 4 s" (§2 Dead time), "2.0 s
Normal" (§2 Pacing) and 2.5 s in the validator (DEAD_WALK, core.ts:142). Rest pads are "1.0-1.2 s Normal" (§2 Pacing) and 2.5 s in the
validator (REST_PAD, core.ts:147). The pacing tags are Tight/Flowing/Relaxed/Cerebral (R-150.1), intro/flow/tight/rest/puzzle (§0c.2) and
I/F/P/T/R (core.ts). **And two of our own code facts are out of date:** R-154 says "a tipping root does NOT exist", but the puzzle kit's
weight seesaw exists (puzzleKit.ts:83, 219-222), is taught in World 1 (protoStage.ts:768 seesawTwist) and stands in 6-3 (w6Rooms.ts:14-17).
R-154 also says fragile platforms break at 1.1 s, but a 0.55 s creaking branch already exists on 1-6's canopy road (protoStage.ts:832).

---

## 3. Facts about our game the report gets wrong (checked in code)

The report knows a lot of our game: stage names (stagePlan.ts:31-145), boss names (bossDefs.ts:177-2074), Dot's and Pokey's lines word for
word (dotLinesData.ts:243, 462; storyWorlds.ts:419), 6-6's dark hollow and 6-7's water room (w6Rooms.ts:6-22), 8-4's lantern
(w8Lantern.ts:1-17), the glowworm rule (engine.ts:7590-7630), World 5's chairs, orchids and humming threads (w5Kit.ts:5-18), 4-D and 5-M
(dotFlightStage.ts:1-15; badges.ts:79), the halfway scene after X-5 (stagePlan.ts:6), notes at X-2 and pocket finds at X-6 (finds.ts:45).
That makes its wrong claims easy to believe. These are wrong:

| # | Line | The report says | What the code says |
|---|---|---|---|
| F1 | 157, 132 | World 10 has a grip input; squalls blow you sideways | No grip input. World 10 has lightning columns only (zones.ts:10, 432); no wind zone outside World 4 (zones.ts:424-433). 10-3 and 10-4's goal lines promise holding on anyway (stagePlan.ts:138-139) |
| F2 | 112-132 | World names "Waterfall Cliffs", "The Ruins", "Stormy Highlands" | Mist Cascades, Ancient Ruins, Stormy Highlands Fortress (worldsData.ts:82, 154, 226) |
| F3 | 15, 42, 122, 145 | Silk is only sticky if you stay grounded; hop on the first landing frame to skim | Webs are a plain drag while inside: 0.4 run, 0.85 jump (zones.ts:205-217). "The silk is only sticky if you stay down" is only a wayside line (dotLinesData.ts:423). The stillness rule is "don't sit" (w5Kit.ts:5-7) |
| F4 | 84, 116, 137 | 2-3's reeds slow you (first slow-down) | Reeds are dressing (W2Look, w2Sections.ts:25-26); 2-3 is a cage rescue on pulleys (w2Sections.ts:648); there is no reed zone (ZoneKind, zones.ts:20) |
| F5 | 94, 116, 137 | 2-8: rising water as autoscroll pressure | Timed flood basins that rise once he steps in and drain when he is out (engine.ts:1556; w2Sections.ts:990-1018) |
| F6 | 36, 116, 137 | 2-6: tiered doors and breaking eaves | 2-6 is World 1's kapok climb rebuilt on the bank (w2Sections.ts:96, protoStage.ts:5365 buildKapok) |
| F7 | 44, 114, 137 | 1-9 chains crumbling limbs into vine grabs | 1-9 is fighting on the move (w1Sections.ts:612; stagePlan.ts:42). The crumble-to-liana bail-out is on 1-6's canopy road (protoStage.ts:829-835; w1Sections.ts:515-518) |
| F8 | 139 | Glowworms on 3-1 and 3-2 | 3-1's sections are spores, drops and vines (w3Sections.ts:44); the glowworm lesson is 3-2's (dotLinesData.ts:214) |
| F9 | 118, 139 | 3-4 The Sinkhole: collapsing cave ledges over pits | 3-4's pieces are ropes, hops, thorn shelves and prowlers (w3Sections.ts:47, 327-328) |
| F10 | 52, 139 | Thorn vines strike if CLIMBED above a speed | They hang beside the route and lash at any movement in reach while their eyes are open (thornVine.ts:5-8, 65-74); Pokey never climbs one |
| F11 | 28, 139 | "The Horn": a scripted crumbling sprint after the Prowler | "The Horn" is a story memory scene after World 3's boss (storyChapters.ts:29), not a playable sprint |
| F12 | 44, 84, 124, 147 | 6-3's seesaw roots tip under him on the way | The seesaw is in 6-3's puzzle room, weighed with root-stones (w6Rooms.ts:14-17) |
| F13 | 147 | 6-5: spears rise out of the black water | The rising spear is a watcher on 6-2 Flat Water (w6.ts:6, 59; w6Ground.ts:3); 6-5 is a fight stage (stagePlan.ts:94) |
| F14 | 126, 149 | 7-5's stone sentries are ultra-slow | Sentries fight with the ocelot's brain in a sentry's look (w7.ts:92-96) |
| F15 | 90 | 7-6 Falling Floors is a slow pace-breaker | 7-6 is a sprint, the game's fastest crumble (stagePlan.ts:106; crumbleTime 0.85 down to 0.61 s, zones.ts:225-227). The report contradicts its own L126 and L149 |
| F16 | 108, 126 | 7-2: shortened brittle vines and stone-crack flowers | Brown vines up the old walls (w7.ts:71-72); nothing brittle or shorter found |
| F17 | 128, 153 | 8-8: spring-loaded net traps | 8-8's danger is the night harpy (w8.ts:9, 65, 90) |
| F18 | 128 | World 8 night tailwinds | No wind outside World 4 (zones.ts:424-433); World 8's zone is darkness (zones.ts:14, 431) |
| F19 | 130, 155 | 9-3: superheated breaking branches | 9-3 Ember Canopy is a vine stage, "Swing over the glowing rock" (stagePlan.ts:127) |
| F20 | 130, 155 | 9-6: deep ash slows run and jump | 9-6 is "Clear the hunters off the ash fields" (stagePlan.ts:130); drag exists only for webs and tide (zones.ts:210-221) |
| F21 | 130 | 9-2: a rising heat hazard | 9-2 is a climb, "Climb the warm ledges" (stagePlan.ts:126); no rising-hazard zone kind exists (zones.ts:20) |
| F22 | 80-98, 114-132, 173 | Wanted Posters and the General's Ledger Pages, "every Ledger placement is verified in code via automated reachability tests" | Neither exists. Our finds are note, keepsake, book, pocket, notch and snail (finds.ts:45-47); finds have a reachability test (finds.test.ts:36-53) |
| F23 | 75, 82-96, 169 | Before-stage scenes at 2-2, 2-7 The Raft, 2-8 Laundry, 3-7, 6-4, 6-9, 7-4, 8-2, 9-8, 9-9, 10-2, 10-7 | The game has no before-stage scenes: openers, halfway, gate, boss, beaten, memories, ending, secret only (sceneList.ts:53-71). "The Raft" is in an old story report as 2-5 (reference/story-report/story-a-report.md:194) |
| F24 | 98, 165 | Boss retries play a 2-4 line short intro | World 10 only (storyBosses.ts:216) |
| F25 | 75, 98, 169 | Caps on scenes (6 pictures, under 30 s; arrival 27 s; boss intro 39 s; 12 pictures after a boss) are "established" | No test enforces them; story.test.ts checks characters per box only (story.test.ts:61, 254) |
| F26 | 67, 169 | Wayside lines over 15 words split into two bubbles | No such split; boxes are capped at 300 characters (story.test.ts:61). 3-8's line is 17 words in one bubble (wayside.ts:112) |
| F27 | 153 | Pokey is alone with Flicker in 8-1; Dot returns before 8-2 | Dot "comes back bleeding at the start of world 8" (wayside.ts:16) |

---

## 4. The full ledger

Columns: **triage** = in GEMINI-VARIETY-2026-11-02.md's table (yes / flattened / missing). **Rules, plan, validator** = where §0b,
PLAN-TO-80, the roadmap or tools/validate carry it, with "full", "flattened" or "no" first. **Code** = IN / PART / NOT / n/a.

### A. The diagnosis and the foundations (L5-7)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 1 | 5 | Fatigue comes from three things: stages with no identity of their own, pacing flattened into one even difficulty, the same action rhythm repeated without a new context. More abilities is not the fix | missing | flattened: §0, §0c cover repeats and pacing; "own identity per stage" is no rule | PART: validator flags repeats, pacing, likeness (evaluate.ts), World 1 only | Adopt (miss 1) |
| 2 | 5 | Layering: combine known pieces for new challenges with no new rules | missing | full: §0.1, §0b.5 | PART | Keep |
| 3 | 5 | Four modifiers give 4 singles, 6 pairs, 4 triples, 1 all-four (15); with run and jump, 15 pairs of six | missing | full: §0b.5 "15 pairs" | PART: pairsOf (mechanics.ts:61) | Keep; see #40 |
| 4 | 5 | Each combination times direction (across, up, down) and tempo | missing | no: §0b.5 has no direction | NOT: no stage records direction; one going-down stage, 4-7 (stagePlan.ts:74) | Adopt (miss 4) |
| 5 | 7 | Tempo inversion: every modifier has a hurry and a patience version, both weighted equally | missing | full: §0b.3 | PART: glowworms (engine.ts:7590-7630), thorn vines (thornVine.ts:5-8), don't sit (w5Kit.ts:5), patience.ts; validator "one tempo" (evaluate.ts) | Keep |
| 6 | 7 | Hurry examples: branches need buffered jumps; sticky silk punishes lingering | missing | full: §0b.3 | PART: don't-sit wraps if still (w5Kit.ts:5-7); branches default to 1.1 s and can be outrun (engine.ts:2437; PLAN-TO-80 "why 55" #1) | R-154 snap twigs |
| 7 | 7 | Patience examples: thorn vines strike only when you hurry; glowworms light only while you stand still; squalls make you stop and grip | missing | full: §0b.3 | PART: thorn vines see movement while looking (thornVine.ts:65-74); glowworms IN (GLOW_STILL 0.7 s, zones.ts:77; engine.ts:7609-7612); squall NOT (zones.ts:432) | Keep; squall #117 |
| 8 | 7 | Worlds swing between urgency and patience; "doubles the functional variety" | missing | full: §0b.3 "Worlds alternate" | NOT measured: validator is per stage and World 1 only (evaluate.ts:80) | Adopt into §0c.7 fingerprint (miss 11) |

### B. Feel (L11-17)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 9 | 11 | Same tiles feel different if one stage asks for long momentum leaps and another for small precise moves at the top of a jump | missing | no | NOT | Adapt (miss 9) |
| 10 | 11 | Ranges across known games: top run 6-18 u/s; ground and air acceleration 13.125-35 u/s²; turn acceleration 30-70 u/s²; take-off 13.75-21 u/s; top fall 17.25 u/s; blowback | missing | no | n/a: ours are px (physics.ts:8-29: maxRun 285, groundAcc 2600, turnBonus 2200, jumpV 640, maxFall 950). Unit-free check: our top fall is 1.48x take-off; the report's titles are 0.82-1.25x (17.25 / 21 to 17.25 / 13.75) | Not taken as targets (units differ); give the fall ratio to R-156 to try by play |
| 11 | 11 | Forgiveness windows so hard combinations don't become pixel hunts | missing | full: §0b.8, §2 | IN: FORGIVE (physics.ts:40-43) | Keep |
| 12 | 13 | Coyote time 0.08-0.15 s (about 5 frames at 60 fps; Celeste 0.1 s), also after a support breaks away | missing | full: §2 (133 / 167 ms) | IN: 0.133 Normal, 0.167 Easy (physics.ts:41-42), early help +0.08 (physics.ts:68); refreshed every grounded frame, so a breaking branch gives it too (engine.ts:2170-2176) | Keep (Easy above the range on purpose) |
| 13 | 13 | Snap twig: breaks in about 0.15 s, keep sprinting | missing | full: §0b.4, R-154 | NOT: default 1.1 s (engine.ts:2437) | R-154 |
| 14 | 13 | Creaking limb: about 0.60 s, time to recover | missing | full: §0b.4, R-154 | PART: a 0.55 s creak on 1-6's canopy road (protoStage.ts:832); W7 tiles 0.85-0.61 s (zones.ts:225-227) | R-154; fix its code fact |
| 15 | 13 | Cantilever root: tips on a pivot by where he stands, doesn't vanish | missing | full: §0b.4; R-154 says it does not exist | PART: the kit seesaw (puzzleKit.ts:83, 219-222), taught in World 1 (protoStage.ts:768), 6-3's room (w6Rooms.ts:14); not a piece on the route | Adapt: the kit seesaw as a run piece |
| 16 | 15 | Jump buffer 0.10-0.15 s, fires on the landing frame | missing | full: §2 | IN: 0.133 Normal, 0.2 Easy (physics.ts:41-42) | Keep |
| 17 | 15 | Two kinds of slow-down: contact (sticky only while you stay on it) and volume (caps speed and jump on entry) | missing | flattened: §0b.4 has no slow-down variants; §0b.7 only says they look different | PART: volume kinds (webs zones.ts:205-217, tide 209, spores 158); contact only as the stillness wrap (w5Kit.ts:5-7) | Adopt (miss 12) |
| 18 | 15 | A wading field pushes the player up to a high route (stilt roots, vines) | missing | no | NOT as a designed choice | Adopt: two-height node (miss 12) |
| 19 | 17 | Half gravity at the top of a held jump | missing | full: §0b.8, R-156 | NOT (no apex term in physics.ts) | R-156 |
| 20 | 17 | Cut upward speed to 30-50% on release | missing | full: §0b.8 | IN: cutV 230 of jumpV 640 = 36% (physics.ts:18-20) | Keep |
| 21 | 17 | Fall gravity stronger than rise | missing | full: §0b.8 | IN: 2500 against 1900 (physics.ts:21-22) | Keep |
| 22 | 17 | Updrafts and leaf glide override the top fall speed (4-2, 9-5) | missing | full: §0b.4 updrafts | PART: leaf glide; vent lift is "a gift, never a must" (zones.ts:139-152) | Adapt: some vents required once taught |
| 23 | 17 | Lift momentum: a moving thing's speed carries into his jump for several frames | yes | full: R-152.7 | NOT (R-152.7's check) | R-152.7 |
| 24 | 17 | Vines as four instruments by anchor length, swing speed and grip: ladder (W1), wide catapult (2-4, 8-3), a line that sinks toward danger if held too long, a hazard that reacts (3-8) | missing | full: §0b.4, R-154 | PART: climb vines, lianas with their own swing size (physics.ts:381), thorn vines; catapult and sinking line NOT (R-154) | R-154 |

### C. The 15 pairs (table L21-54)

The rule for all of these is §0b.5 ("15 pairs; each world shows its own"), and the validator counts a pair when both appear anywhere
(mechanics.ts:43-61). Each row adds: is the interaction itself built, and where.

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 25 | 26 | Run+Jump: arc length from run speed, skid turns, coyote edges; W1's gaps | missing | full | IN; the validator always counts it (mechanics.ts:45), so it never tells a stage apart | Leave run+jump out of the pair count |
| 26 | 28 | Run+Branches: stop and you fall; read the path and commit. Claims The Horn (W3) and 7-6 | missing | full | PART: 1-8's chase (chase.ts:1-8), W7 tiles (zones.ts:221-227); The Horn is a story scene (storyChapters.ts:29) | Keep |
| 27 | 30 | Run+Vines: a running leap into a vine turns speed into swing size; 2-4 | missing | full | IN: the grab takes his speed into the swing (swingGrab with vx, vy, engine.ts:1947-1951) | Keep |
| 28 | 32 | Run+Wind: a tailwind needs braking to stop on narrow ledges, a headwind needs steady push; 4-4 and W10 | missing | full; R-152.1 | PART: gusts push either way in W4 (only 0.4 of it on the ground, R-152.1); W10 has no wind (zones.ts:432) | R-152.1 |
| 29 | 34 | Run+Slow: stutter-step out of drag, or stop dead to light things; 3-2/3-3, 6-6 | missing | full | PART: glowworms in the dark (engine.ts:7609); 6-6's lit steps (w6Rooms.ts:18-22) | Keep |
| 30 | 36 | Jump+Branches: up stacked crumbling tiers, short jumps to catch decaying ledges; 2-6, 7-4 | missing | full | NOT as claimed: 2-6 is the World 1 climb (w2Sections.ts:96); 7-4 is a hand-built climb (w7.ts:156) | Adopt as a climb variant (a crumbling-tier shaft) |
| 31 | 38 | Jump+Vines: let go at the 45° top of the swing with carried speed and apex hang; 8-3 | missing | full; R-152.7, R-156 | PART: liana release (vineReleaseV 560, physics.ts:27); no carry, no apex hang | R-152.7, R-156 |
| 32 | 40 | Jump+Wind: a headwind shortens the jump; a glide in an updraft turns gusts into height; 4-2, 9-5 | missing | full | PART: W4 gusts; vent lift (zones.ts:139-152) | Keep |
| 33 | 42 | Jump+Slow: buffered jumps turn sticky traps into bouncy ones; W5 silk | missing | no piece named anywhere | NOT: webs are plain drag (zones.ts:217) | Adopt: a hop-to-skim silk bridge (miss 19) |
| 34 | 44 | Branches+Vines: bail out from a breaking branch onto a vine, or drop from a vine onto a tipping root; 1-9, 6-3 | missing | full | PART: 1-6's canopy road (0.55 s creak with two lianas over it, protoStage.ts:829-835); 6-3's seesaw is in a room | Keep; bring it to more stages |
| 35 | 46 | Branches+Wind: wind pushes him off a crumbling branch before it breaks, or delays the landing on the next; 4-7, 10-2 | missing | full | NOT measured: W4 has both (fragile in w4Stage45/48/49 tests), nothing checks they meet on one beat | Adopt with the one-beat pair count (miss 2) |
| 36 | 48 | Branches+Slow: a surface that slows you and crumbles: short hops, no walking; 5-2, 9-6 | missing | no piece named | NOT: no zone stacks drag on a fragile platform (zones.ts:210-221) | Adopt: a crumbling patch inside a web (miss 19) |
| 37 | 50 | Vines+Wind: gusts change a hanging vine's angle and period, making timing gates; 8-6, 10-7 | missing | full: R-154 (listed as not built) | NOT (R-154) | R-154 |
| 38 | 52 | Vines+Slow: thorn vines that strike if climbed fast; slow hand over hand; 3-5, 3-8 | missing | full | PART: thorn vines watch for movement beside the route (thornVine.ts:65-74); never climbed | R-154's fast-climb thorn |
| 39 | 54 | Wind+Slow: periodic gales blow him back unless anchored in mud or roots, or gripping rock; 10-4/10-5 | missing | no | NOT (no grip, no W10 wind) | Adapt (miss 18) |
| 40 | 21-54 | The pairs are interactions inside one beat ("Emergent Kinesthetic Interaction") | missing | flattened: presence anywhere in the stage (mechanics.ts:43-61); crumble counted as slow (line 49) | n/a | Adopt (miss 2) |

### D. Inside a stage (L59-69)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 41 | 59 | Merge Smith's rhythm groups (UCSC) with Hayashida's four steps (Nintendo) | missing | full: §0b.1-2 | PART | Keep |
| 42 | 61 | Cells: stretches between checkpoints or branch points, joined by portals | missing | no | NOT: stages are linear | Adapt: flags are cell edges in the validator |
| 43 | 61 | Rhythm groups of 5, 10, 15 or 20 s; a beat pattern (move, jump, wait); density low, medium or high | missing | full: §0b.1 | PART: validator reads 5 s windows (PACE_WIN), groups up to 20 s (GROUP_MAX), tight over 1.15 moves a second (core.ts); no "medium" | Add a medium band |
| 44 | 61 | Groups never run into each other; a rest with no hard input between every two | missing | full: §0b.1 | PART: validator flags over 20 s with no rest; a "rest" is a 5 s window with no move (core.ts pacing), not a rest platform | Adapt: a rest of at least 1 s after every group |
| 45 | 61 | Every 3-5 minute stage is a four-act showcase for ONE specific mechanic pair | missing | flattened: §0b.2 has the four parts, not the one pair | NOT | Adopt (miss 1) |
| 46 | 65 | The four-part plan on all 90 non-boss stages, each under 5 minutes | missing | full: §0b.2, R-155 | PART: hand-built stages are labelled Learn/Develop/Twist/Finish (protoStage.ts:1389-1420; w3Sections.ts:31-52); the 1-5 plan follows it (plans/R-155-1-5.md:39-49) | R-155 |
| 47 | 65 | Part 1: one or two short groups, 5-10 s, low density, over solid ground or harmless water | missing | full: §0b.2; validator "no gentle intro" (INTRO_RATE 0.8 in 15 s) | PART | Keep |
| 48 | 65 | Example: 2-4's first vine hangs over a dry bank | missing | n/a | IN: "Learn over water that costs no life" (w2Sections.ts:747-749) | Keep |
| 49 | 65 | Example: 6-6's Flicker shows one low step with no drop below | missing | n/a | IN: soft floor, never a life (w6Rooms.ts:18-22) | Keep |
| 50 | 67 | The first rest is a checkpoint and the stage's one wayside line, under 15 words a box | missing | flattened: §0b.2 places checkpoints before parts 3 and 4 only | PART: one line a stage (wayside.ts:4); no word cap | Optional |
| 51 | 67 | Part 2: the safety floor goes, 10-15 s groups, medium density; chained transfers (two vines over a river; a shaft of alternating breaking branches) | missing | full: §0b.2 | PART | Keep |
| 52 | 67 | Part 2 may repeat one pattern before the rest, for muscle memory | missing | contradicted: §0c.3 | validator allows 2, flags 3 (RUN3_BACK, core.ts) | Adapt (C4) |
| 53 | 69 | Part 3, the twist: a new context or a second mechanic that breaks the rhythm just learned | missing | flattened: §0b.2 words only; no check | NOT measured | Adopt (miss 6) |
| 54 | 69 | Twist examples: a rhythmic crosswind blows the vines toward thorns; the landing ledge turns into a breaking branch, so buffer a jump back onto the returning vine | missing | no | NOT (no gust-swung vines, R-154) | Use as R-155 twist templates |
| 55 | 69 | Part 3 holds a portal: an optional hard branch to a collectible | missing | full: §0b.2 | PART: finds are one kind per stage (finds.ts:45-47), with no placement rule | Adapt (miss 17) |
| 56 | 69 | Portal example: 2-4's page on the highest vine mid-river, only by a full swing from a raised breaking branch | missing | n/a | NOT (no ledger pages) | Use the idea for 2-4's book |
| 57 | 69 | A short recovery platform, then part 4: a 15-20 s dense group using everything taught, ending at the exit | missing | flattened: §2 "an easy walk out"; validator TIGHT_MAX 15 (core.ts:254) | NOT: World 1 finishes are fillTo padding (14 "padding" entries, funknown.json) | Adopt (miss 7, C1) |
| 58 | 69 | The finale feels empowering because the timing was taught; a quick ending into the next stage | missing | no | n/a | With #57 |

### E. The world's ten slots (L73-101)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 59 | 73 | A world feels repetitive if its stages share one tempo, camera direction and thinking load | missing | flattened: §0b.6 neighbour rule has tempo and camera, not thinking load; nothing measures it | NOT measured | Adopt (miss 5) |
| 60 | 73 | Each slot X-1 to X-10 has its own job; alternate fast forward runs, climbs, puzzle or stealth breaks, story breathers | flattened ("stage types per world") | full: §0b.6, R-153 | PART: stagePlan types (stagePlan.ts:31-145): nine mission types in every world; X-9 always a gauntlet, X-10 the boss | R-153 |
| 61 | 75 | Between-stage scenes capped at 6 pictures and under 30 s, never chained into the halfway scene | missing | no (story) | n/a: no before-stage scenes (sceneList.ts:53-71) | Not taken |
| 62 | 80 | X-1 arrival: across, left to right; low-medium, 5-10 s groups; forgiving floors; after the arrival scene (27 s or less); journal beat 1; posters in late acts (6-1, 7-1) | flattened | flattened: §0b.6 "X-1 arrival" with no camera or density | PART: X-1 is a sprint in 8 of 10 worlds (stagePlan.ts:34, 45, 56, 79, 101, 113, 125, 136); 4-1 a climb, 6-1 vines (68, 90); no posters | Adopt camera and density per slot |
| 63 | 82 | X-2 teaches the world's mechanic: across with gentle slopes, medium density (4-2 First Glide, 5-2 Don't Sit); optional before-stage scene; often Meeca's note (2-2, 3-2, 4-2, 7-2, 8-2) | flattened | flattened: §0b.6 "teach" | PART: notes at stage 2 (FIND_STAGE, finds.ts:45); X-2 is a climb in 7-2, 9-2, 10-2 (stagePlan.ts:102, 126, 137) | Adopt |
| 64 | 84 | X-3 tight terrain: confined or rolling, medium, slow-downs or shape traps (2-3 reeds, 6-3 seesaw); wayside line at halfway; tests small positioning and turning | flattened | flattened: §0b.6 "tight terrain" | PART: 2-3 has no slowing reeds (w2Sections.ts:25-26, 648); 6-3's seesaw room (w6Rooms.ts:14) | Adopt |
| 65 | 86 | X-4 wide gaps, air or a vertical drop: medium-high, 10-15 s groups; brings in vines or wind (2-4, 4-4, 5-4); ledger page 2 or posters | flattened | flattened: §0b.6 "wide gaps / vines / wind" | PART: X-4 is vines in 2, 4, 5 (stagePlan.ts:48, 71, 82), a climb in 1, 3, 7, 10 (37, 59, 104, 139) | Adopt |
| 66 | 88 | X-5 mid-world spike: many tiers, hazard-driven, high density (2-5, 4-5, 9-5); the halfway scene follows | flattened | flattened: §0b.6 "mid-world spike" | PART: halfway after X-5 IN (stagePlan.ts:6; midScene.ts); 1-5 is a harvest 98% alike to 1-1 by look (STATUS 2026-11-04 9:32 AM) | Adopt; R-155 takes 1-5 first |
| 67 | 90 | X-6 change of pace, a sense flipped: climb or dark/puzzle room, low tempo (2-6, 6-6, 7-6); no before-stage scene; Dot's pocket finds (4-6 to 7-6) | flattened | full: §0b.6 "change of pace (slow, dark, puzzle)" | PART: 6-6 IN (w6Rooms.ts:18); 7-6 is the fastest crumble sprint, not slow (stagePlan.ts:106); pockets at stage 6 IN (finds.ts:45) | Keep |
| 68 | 92 | X-7 exploring with branches: non-linear cells and portals, mixed rhythm (3-7, 4-7, 6-7); high-skill ledger pages | flattened | full: §0b.6 "exploring with branches" | PART: 3-7 and 7-7 are searches (stagePlan.ts:62, 107); every stage is linear | R-153, R-150.2 |
| 69 | 94 | X-8 high-speed layering: rising hazard / autoscroll pressure; high density, 15-20 s groups; 3+ mechanics (2-8, 3-8, 5-8) | flattened | flattened: §0b.6 "everything layered" drops the pressure and the 15-20 s | PART: 1-8's chase (chase.ts:1-8), 2-8's flood basins (w2Sections.ts:990-1018); no other world | Adopt (miss 13) |
| 70 | 96 | X-9 pre-boss run: straight to the arena, top non-boss intensity, shows the boss's attack patterns ahead | flattened | flattened: §0b.6 "run-up to the boss" | NOT: every X-9 is a gauntlet of the world's animals (stagePlan.ts:42 ... 144) | Adopt (miss 14) |
| 71 | 98 | X-10 boss: one-screen arena; dodge a hazard wave, then hit the open weak spot; intro 39 s or less with a 2-4 line short retry; defeat and memory 12 pictures or fewer | flattened | full: §0b.6; PLAN-TO-80 A.7-8 (phases, three ways to win) | PART: warn-then-hit-back bosses (worldsData.ts:384; bossDefs.ts); short retry only W10 (storyBosses.ts:216) | Short retry for all (miss 22) |
| 72 | 101 | After X-5's spike and the halfway scene, X-6 switches the kind of thinking; alternate dexterity stages with reasoning and stealth so the hands rest while the head works | flattened | flattened: §0b.6 | PART: 6-6 and 6-7 rooms (w6Rooms.ts) | With #59 |

### F. The campaign (L105-132)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 73 | 105 | The whole game is one big four-part arc across three acts | missing | no (mechanical job per act unnamed) | PART: story acts (stagePlan.ts:32, 66, 111) | Adapt (miss 15) |
| 74 | 105 | The failure to avoid: a world's gimmick taught, then dropped (wind in W4, gone in W5) | missing | full: §0.1; R-152.4 blocked | NOT: each zone kind is one world's (zones.ts:424-433) | Adopt with the gate (miss 3) |
| 75 | 105 | An early world's main mechanic returns later, with no re-teaching, as the twist for the new world's mechanic | missing | flattened: §0.1 "harder or combined"; §0c.7 pairs a brought-back template with the world's own | NOT | Adopt (miss 3) |
| 76 | 114 | W1 Emerald Canopy, Act I: run, jump, still vines, basic breaking branches; twist: branch-to-vine bail-outs (1-9); no tempo polarity; note W1, poster 1-9, ledger W1; Venom Fang teaches telegraph reading and branch positioning | missing | no per-world table | PART: name IN (worldsData.ts:10); 1-9 is fights (w1Sections.ts:612); bail-out on 1-6 (protoStage.ts:829-835); no posters or ledgers; Venom Fang's coil only hurts during wind-up and lunge (bossDefs.ts:174-180) | Use as World 1's pair list |
| 77 | 116 | W2 Sunlit Riverbank: swing vines (2-4), vertical breaking branches (2-6); twist: rising water (2-8), reed drag (2-3); slow: reeds and mud; Crocus Rex jaw-snaps on a muddy bank, head-stomp | missing | no | PART: name IN (worldsData.ts:34); 2-4 vines IN; 2-6 is the W1 climb (w2Sections.ts:96); no reed drag (zones.ts:20); flood basins (w2Sections.ts:990) | Use for W2's rebuild (Phase B) |
| 78 | 118 | W3 Mossy Grotto: patience slow-downs and speed-sensitive vines (3-5, 3-8); twist: dark and light (3-2), sinkholes (3-4); polarity inverted (stop to wake glowworms, go slow past vines); Shadow Prowler, a stealth boss in a dark ring | missing | no | PART: glowworms (engine.ts:7590-7630), thorn vines (thornVine.ts), spores (zones.ts:6); 3-4 has no collapsing ledges (w3Sections.ts:47) | Keep |
| 79 | 120 | W4 Waterfall Cliffs, Act II: wind (4-4), leaf glide (4-2), vertical branches; twist: diving hazards (4-5), freefall (4-7), 4-D; polarity headwind and lift; Sky Sovereign dives from above | missing | no | PART: name is Mist Cascades (worldsData.ts:82); W4 wind IN (zones.ts:426); 4-D IN (dotFlightStage.ts:1-15); the Sovereign hangs above (bossDefs.ts:771) | Keep |
| 80 | 122 | W5 Orchid Sanctuary: contact slow-downs (5-4, 5-5), timed closing platforms (5-3); twist: trap rests (5-2), humming threads (5-7), 5-M; polarity impulse; Tarantula Queen's web spreads | missing | no | PART: orchids, chairs, threads, cocoons, carvings IN (w5Kit.ts:5-18); silk bridges are drag (zones.ts:217); 5-M IN (badges.ts:79) | Hop-to-skim silk (miss 19) |
| 81 | 124 | W6 Deep Mangrove: wading and swimming slow-downs, tipping roots (6-3); twist: Dot leaves at 6-5, firefly steps (6-6), water-level puzzle (6-7); polarity hydrological; Marsh Reaver mud waves and spear | missing | no | PART: tide (zones.ts:11, 218-221), swimming and the rooms (w6Rooms.ts:6-22); Dot leaves after 6-5 (wayside.ts:15-16) | Keep |
| 82 | 126 | W7 Ruins: brittle vines (7-2), sequential floors (7-6); twist: fastest floors against slowest sentries (7-5); polarity "temporal"; Golem's slow telegraphed smashes | missing | no | PART: crumble 0.85-0.61 s (zones.ts:225); sentries fight as ocelots (w7.ts:92-96); Golem "hits very hard and very rarely" (bossDefs.ts:1556) | Dual-clock twist (miss 10) |
| 83 | 128 | W8 Twilight Treetops, Act III: momentum vines (8-3), wind glides (8-6); twist: light radius (8-4), firefly trail (8-6), net traps (8-8); polarity night tailwinds with braking in a small view | missing | no | PART: dark (zones.ts:14, 431), lantern (w8Lantern.ts), moonlight glides (w8.ts:60); no W8 wind; no nets (w8.ts:9, 65) | Keep |
| 84 | 130 | W9 Volcanic Jungle: updrafts (9-5), ash drag (9-6); twist: rising heat (9-2), lava steps (9-7), ember branches (9-3); polarity updraft against ash | missing | no | PART: geysers and vent lift (zones.ts:9, 139-152); no ash drag (stagePlan.ts:130; zones.ts:210-221); 9-3 a vine stage (stagePlan.ts:127) | Use for W9's build (Phase C) |
| 85 | 132 | W10 Stormy Highlands: all six together up the 1,000 steps (10-2 to 10-8); twist: squalls with grip-and-wait (10-3, 10-4); polarity lethal squalls and grip; the General's shifting weak spot | yes (the grip fact) | no; PLAN-TO-80 "Not taken" (no grip) | PART: lightning columns (zones.ts:10, 432); no wind, no grip; goal lines promise holding on (stagePlan.ts:138-139) | Adapt (miss 18) |

### G. The acts, stage by stage (L135-157)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 86 | 137 | Act I calibrates the player's sense of the physics, then flips what he assumes about speed | missing | no | PART | Adapt (miss 15) |
| 87 | 137 | W1 in bright daylight with generous safety floors | missing | full: §0.5 "World 1 is easy and forgiving" | IN | Keep |
| 88 | 137 | W2 is the comic, relaxed world that widens the swings | missing | partly: §0.5 "World 2 brings new elements in subtly" | PART | Keep |
| 89 | 137 | 2-3: the first slow-down teaches that a vine route above beats wading below | missing | no | NOT (#18) | Adopt (miss 12) |
| 90 | 137 | 2-4: vines as catapults over wide river gaps | missing | full: §0b.4 swing-catapult | PART: vines over the river; no catapult (R-154) | R-154 |
| 91 | 137 | 2-6 turns the camera vertical: timed jumps up tiered doors and breaking eaves | missing | no | PART: a climb, the W1 builder (w2Sections.ts:96) | Give 2-6 its own climb pieces (R-153 / Phase B) |
| 92 | 137 | 2-8: rising floodwater turns reed slow-downs into moving pressure, practice for the boss | missing | no | PART: timed basins (w2Sections.ts:990-1018) | With miss 13 |
| 93 | 139 | W3: the first big reversal; the dark replaces W2's forward hurry | missing | full: §0b.3 | IN | Keep |
| 94 | 139 | 3-1 and 3-2: glowworms light safe footing only while he stands still and listens | missing | full: §0b.3 | PART: 3-2's lesson (dotLinesData.ts:214); 3-1 has no glowworm lesson (w3Sections.ts:44) | Keep |
| 95 | 139 | 3-4: breaking branches return as collapsing cave ledges over vertical pits | missing | no | NOT (w3Sections.ts:47) | Adopt as a W1 bring-back in W3 (miss 3) |
| 96 | 139 | Late W3: sprint over crumbling ledges, then slow right down on catching a thorn vine | missing | no | NOT | Adopt (miss 10) |
| 97 | 139 | The Horn: the General's horn shatters the gorge floor, an unwinnable crumbling sprint after the boss | missing | no | NOT: a story scene (storyChapters.ts:29) | Not taken (story) |
| 98 | 143 | 4-2's leaf cuts the fall speed; 4-4's wind opposes his run and shortens his jumps | missing | full: §0.2, R-152.1 | PART: wind pushes, only 0.4 on the ground (R-152.1) | R-152.1 |
| 99 | 143 | 4-5: dives from above; alternate quick platforming in crosswind with ducking under rock overhangs | missing | full: R-158 | PART: watched stretches with cover (watcher.ts; R-158.2) | R-158 |
| 100 | 143 | 4-D: Dot's fast flight as a counterpoint to Pokey's slow climbing; 4-7 freefall steering through wind | missing | partly: PLAN-TO-80 "a special stage in every world" (R-162.5) | IN: 4-D (dotFlightStage.ts:1-15), 4-7 glide-down (w4LongDrop.ts) | Keep |
| 101 | 145 | 5-2: the rest spots (moss, tea chairs) are the traps; the sloth's wish to rest is used against him | missing | no | IN: chairs tug him in (w5Kit.ts:5-8) | Keep; a model for "the world's own idea" |
| 102 | 145 | 5-3: platforms that fold shut early on a rhythm | missing | no | IN: orchids (w5Kit.ts:13) | Keep |
| 103 | 145 | 5-4, 5-5, 5-7: silk only grabs if you stay down; hop on the first frame of landing | missing | no | NOT (zones.ts:217) | Adopt (miss 19) |
| 104 | 145 | 5-6: Meeca's carvings placed closer together push a fast chase rhythm | missing | no | PART: carvings exist (w5Kit.ts:17) | Adapt (miss 21) |
| 105 | 147 | 6-3: seesaw roots tip under his weight | missing | R-154 says not built | PART: the room's seesaw (w6Rooms.ts:14) | #15 |
| 106 | 147 | 6-5: spears rise out of flat black water | missing | no | PART: the rising spear is a watcher on 6-2 (w6.ts:6, 59) | Keep |
| 107 | 147 | When Dot leaves (6-5 to 6-9) the guidance changes: her chatter stops, hurt lines become the petal's quiet warmth, Flicker gives short cues | missing | partly: §1 World 7 rule | PART: who speaks follows the story (wayside.ts:15-19) | Keep (miss 23) |
| 108 | 147 | 6-6: invisible root steps shown only in Flicker's glow; slow edge-walking | missing | no | IN (w6Rooms.ts:18-22) | Keep |
| 109 | 147 | 6-7: raise and lower the water with a wheel; a root-stone on a plate; a root door that swells shut | missing | no | IN (w6Rooms.ts:6-13; the wheel is a lever today) | Keep |
| 110 | 149 | W7 dual-clock timing: fast decaying floors while tracking slow enemy cycles | missing | no | NOT (w7.ts:92-96) | Adopt (miss 10) |
| 111 | 149 | 7-2: withered, shorter vines with stone-crack flowers | missing | no | PART: brown vines (w7.ts:71-72) | Optional |
| 112 | 153 | Act III: earlier mechanics in three- and four-way combinations | missing | full: §0b.5, §0.1 | NOT measured (validator World 1 only) | Count triples once the validator runs past World 1 |
| 113 | 153 | W8 mixes W2's swings, W3 and W6's dark, W4's glides; 8-3's landings pre-lit by fireflies | missing | full: §0.1 | PART | Keep |
| 114 | 153 | 8-4: a moving safe zone; the jar's light marks how far is safe | missing | no | IN mostly: light shrinks, the dark is slow and unsafe; falls are soft (w8Lantern.ts:3-4, 15-17) | Keep |
| 115 | 153 | 8-8: spring net traps on high branches, instant slow and capture | missing | no | NOT (w8.ts:9, 65) | Optional |
| 116 | 155 | 9-3: superheated branches char and collapse on contact | missing | no | NOT (stagePlan.ts:127) | A bring-back of breaking branches for W9 (miss 3) |
| 117 | 155 | 9-5: vents turn wind 90° upward; weave between lava plumes with air turns | missing | full: §0b.4 updrafts | PART (zones.ts:139-152) | #22 |
| 118 | 155 | 9-6 right after the air stage: deep ash slows run and jump; 9-7 short hops over cooling lava steps | missing | no | NOT ash (zones.ts:210-221); 9-7 is a climb (stagePlan.ts:131) | Adopt for W9's build (miss 12) |
| 119 | 157 | W10 adds no new mechanic: all six under one world-wide rhythm, the storm squall; a lightning flash warns of a sideways blast and thunder | missing | no | PART: bolts strike on a warned rhythm (zones.ts:10, 270); no blast | Adapt (miss 18) |
| 120 | 157 | When it flashes, reach rock or a sturdy vine and hold on; sprint in the 5-10 s calm gaps across branches, iron netting (10-6) and wet vines | yes (grip fact) | no | NOT (no grip) | Adapt without a button (miss 18) |

### H. Safeguards (L161-177)

| # | Line | What it says | Triage | Rules, plan, validator | Code | Proposal |
|---|---|---|---|---|---|---|
| 121 | 165 | Difficulty is felt through checkpoint spacing: how many groups you replay after a death | missing | flattened: §0b.8 "tighter checkpoints as stages get harder" | NOT measured | Adopt (miss 16) |
| 122 | 165 | Celeste (a checkpoint every screen) against DKC Tropical Freeze (sparse, exhausting) | flattened: the triage rejects "Celeste-style no lives"; this text never asks for no lives | n/a | n/a | Note: nothing here conflicts with lives |
| 123 | 165 | More layering in Acts II-III needs tighter checkpoint spacing | missing | flattened: §0b.8 | NOT measured | Adopt (miss 16) |
| 124 | 165 | Checkpoints on the rests just before part 3 and part 4 | missing | full: §0b.2 | PART: World 1 beats end in a flag (protoStage.ts:1879-1888); the 1-5 plan (plans/R-155-1-5.md:39-48) | Measure it (miss 16) |
| 125 | 165 | After a death he is back at the hard part within 2 s | missing | full: §0b.8 | NOT measured | Adopt (miss 16) |
| 126 | 165 | Boss retries skip the long intro: 2-4 short lines, back in the fight in under 9 s | missing | no | PART: World 10 only (storyBosses.ts:216) | Adopt (miss 22) |
| 127 | 169 | Scenes 6 pictures or fewer and under 30 s (3 s a line or silent picture); defeat and memory 12 pictures or fewer | missing | no | not enforced (story.test.ts:61, 254 check characters only) | Not for this ledger (story); the story team decides |
| 128 | 169 | The halfway scene follows X-5 in every world, so no before-stage scene at X-6 | missing | n/a | IN halfway after X-5; no before-stage scenes exist (sceneList.ts:53-71) | Nothing to do |
| 129 | 169 | X-2 to X-9: one wayside line at the start, the halfway mark or near the exit; over 15 words splits into two bubbles so text never covers the jumps | missing | no | PART: one line a stage (wayside.ts:4), exchanges of 2-4 bubbles (wayside.ts:18); no 15-word split (3-8's line is 17 words, wayside.ts:112) | Optional: a word cap test |
| 130 | 173 | Three risk tiers of collectibles; never two big ones in the same stage | missing | no | PART: one find kind per stage (finds.ts:45-47) | Adapt (miss 17) |
| 131 | 173 | Tier 1, notes: early (X-2, or 6-7), a little off the path behind a gentle clue (look down while gliding in 4-2; past the third flag in 3-2) | missing | no | IN: notes at stage 2 (finds.ts:45); 3-2's hint is "past the third flag" (finds.ts:418) | Keep |
| 132 | 173 | Tier 2, posters (1-9, 2-6, 3-4, 4-5, 5-4, 6-1, 7-1, 8-9, 9-4, 10-7) and pocket finds (X-6 in W4-7): behind another way in or an optional climb | missing | no | PART: pockets at stage 6 (finds.ts:45); no posters | Keepsakes on an optional climb (miss 17) |
| 133 | 173 | Tier 3, ledger pages (2-4, 3-7, 4-7, 5-7, 6-9, 7-9, 8-7, 9-9; page ten in the finale): at the top of the stage's hardest twist or finale group, each proven reachable by a test | missing | no | NOT (no ledgers); finds have a reachability test (finds.test.ts:36-53) | The book at the top of the twist's branch (miss 17) |
| 134 | 177 | The same mechanics reskinned in ten places confuse; every state must read by outline and small motion, not colour | missing | full: §0b.7, R-157 | PART | R-157 |
| 135 | 177 | Breaking things: notched underside and a two-frame dust or shake on touch | missing | full: §0b.7 | PART: W7 tiles shake (crumbleArt.ts, R-157) | R-157 |
| 136 | 177 | Safe vines smooth; thorn vines with barbs and a slow breathing pulse | missing | full: §0b.7 | PART (R-157) | R-157 |
| 137 | 177 | Wind as steady particle streams (leaves W4, embers W9, slanted rain and lightning W10), moving at the wind's strength | missing | full: §0b.7 | PART: gust streaks move at 2.6x the force (zoneArt.ts drawGust, R-157) | R-157 |
| 138 | 177 | Contact traps (taut shiny threads that quiver when touched) look unlike drag fields (reeds, black water, ash) | missing | full: §0b.7 | PART | R-157 |
| 139 | 177 | Closing: forgiving feel, a four-part stage grammar, alternating stage types and flipped tempos across three acts give lasting variety from a small core | missing | full in parts (§0b) | n/a | Summary only |
| 140 | 181 | 31 cited sources (Smith 2008, Launchpad 2011, Thorson on Celeste, Swink via game-feel sites, Hayashida interviews, DIGRA jump-feel paper, plus some weak ones: a Yarn package, a GitHub skill file, a skills directory, a Reddit thread, a review shop) | missing | n/a | n/a | Trust the academic and developer sources; the numbers about OUR game are checked above, not trusted |

---

**Counts.** 140 ledger rows. Triage column: 3 "yes" (#23, #85, #120), 12 "flattened" (#60, #62-72, #122), 125 "missing" (the triage
covers a different text; see the headline). Against our rules, plan and validator: 50 rows are fully carried, 28 are flattened (watered
down or contradicted) and 39 are in nothing we have (the other 23 are worked examples, story or summary rows with nothing to carry).
