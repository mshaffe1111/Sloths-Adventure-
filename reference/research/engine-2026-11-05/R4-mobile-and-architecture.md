# R4: phone and touch platformers, and level-engine architecture

Researcher 4 of 4, 2026-11-05. Branch `ccr-0d59a91c-oy3imz` (HEAD moved from `8ba25751` to `8baec851` while I worked; both noted
where it matters). Every number is marked **measured** (I ran it, output in section 5) or **estimate**. Every claim about another
game is quoted from a primary source opened in this session (section 7). Every claim about our game cites file:line.

---

## 1. Planned vs actual time

| | |
|---|---|
| Planned | about 75 minutes |
| Started | 02:17 UTC (9:17 PM ET, Nov 4) |
| Finished | 02:47 UTC (9:47 PM ET); actual about 30 minutes, under the 75 planned. The work ran faster than planned because the scripts are quick (the slowest single run, the fun gate, took 2 minutes); I used the rest on two extra measurements (5.5, 5.6) and on re-checking every file:line and quote. The lead should check the result with that in mind. |
| Sources opened | 60 URLs opened and read (59 entries in section 7; 6 of them gave only an abstract or part of the page); 8 more failed to open (listed) |
| Code read | `beatTrace.ts` (all 668 lines), `w1Rhythm.ts` (lines 1-520 and 1000-1349 read; 520-1000 skimmed by grep), `gen2/DESIGN.md` 1-140, `gen2/game.ts` 1-60, `gen2/seeds.ts` 25-75, `engine.ts` 830-860, `stageGenerator.ts` 2835-2880, `protoStage.ts` 495-515, `tools/validate/funcheck.ts` (all), `tools/inspect/firsttimer.ts` header, `tools/qa/touchReplay.ts` header |
| Ran | the fun gate twice (two commits), one stage's build timed per layer, a node's trace timed, a rejection report, a proposer fix experiment, a survival estimate, a palette-coverage count, a roll-distance count |

Honest note: the GDC talks I most wanted (Fumoto's Downwell talk, McEntee's UbiArt talk, Purho's Noita talk) are video only; the GDC
Vault pages and the RPS write-up give their abstracts, not their content, so I cite them only for what those pages say. The Sea of
Thieves talk (Masella, GDC 2019) has its full speaker notes in the slide PDF, which I read end to end.

---

## 2. The big lessons, ranked

1. **Our beat-traced stages carry almost no timing risk, and the gate agrees (measured).** A player with the timing spread Isaksen
   measured in real people (σ 35.9-61.1 ms, Isaksen FDG 2015 §3.1) lands every traced take-off of 1-2 and 1-5 97-100% of runs with
   no fall in the whole stage (section 5.4). Our own fun gate says the same thing in its own words on today's HEAD: 1-1 Normal
   "82% of the beats after the first 30 s cost nothing when missed" (section 5.1). The tracer was built to make every jump safe for a
   clumsy thumb (`beatTrace.ts:325-341`, `:405-427`), and it succeeded: so difficulty cannot come from jump geometry on these
   stages, it has to come from what the beat puts on the avoided lines (`hazardSpots`, `beatTrace.ts:571`), the snap twigs' hold
   (`w1Rhythm.ts:330`), and density. Rayman Jungle Run's IGN review is the reminder of the other side: "You'll fly through some
   stages with nearly impeccable timing... A stage later and you'll be dying left and right." The research needs a *risk budget per
   node* (expected falls), not only a "never unfair" proof. **New**: no ledger row computes expected falls from a measured human
   timing model.

2. **A generator must report why it throws rolls away, by rule (measured).** 94.4% of 1-2 Normal's rejected tries (880 of 932 over
   16 layouts) and 95.0% on Easy (2,228 of 2,346) are one rule: "a clumsy jump (air 1) can't reach 80/90 px up" (section 5.3). The
   proposer (`fitSteps`, `w1Rhythm.ts:169-171`) checks a rise with a full-hold jump; the verifier (`traceNode`,
   `beatTrace.ts:393-397`) also demands the short flick (`TRIES` row 7, `beatTrace.ts:340`; `SHORT_HOLD` 0.8, `:343`). Two models of
   the same jump. Result: two of 1-2's palettes promise rises of 80 and 90 px (`w1Rhythm.ts:606`, `:617`) that **were laid 0 times in
   16 layouts** (section 5.3) while costing 94% of the dice. This is Dead Cells' rule turned into a test: Bénard's generator "tries
   a random room... and tests to see if it complies with the instructions... If it doesn't match, the algorithm tries another" (Dead
   Cells blog); the lesson for us is to *count* those tries per rule and fail a gate when a palette option is never laid. Endrovski,
   Dormans and Bidarra's 2026 survey of 120 developers ranks "Debugging difficulty" third of all PCG concerns (41.7%) and says game
   designers "noted debugging unexpected outputs and unpredictable results as stronger concerns." **New** (section 6, idea 1).

3. **Variety at scale came from many small authored pieces plus a few rules, never from rerolling a few pieces.** Leap Day ships a
   new level every day (seeded from the date, so "Nitrome does not have to support the game and continue updating it in order for
   new levels to be made available each day", Nitrome wiki) from "lots (700-800) level chunks. Within that chunks can decorate to any one of 10 themes and
   enemies can be set to be multiple enemies" (Annal, PocketGamer.biz 2016), each chunk with an enemy slot filled from "a daily enemy
   pool... three to four different enemies each day" and a daily object pool that "dictate[s] what level chunks can and cannot
   appear" (Nitrome wiki). Spelunky: each room type "has typically 8 to 16 templates", plus "obstacle blocks" and "probabilistic
   tiles" ("a '7' is a 33% chance of a spike") (Kazemi, Spelunky Generator Lessons 2). Barrett's herringbone paper puts a number on
   the floor: a "complete stochastic set" needs 16 tiles for 2 edge types, 81 for 3, and "if you thought you wanted about 64... just
   make 81 instead." This is Matt's 2026-10-30 rule ("more pieces"), now with shipped numbers behind it. What is new for us: the
   *pools are themed per day/level* (Leap Day), so a level feels like one idea instead of a grab bag; and the pieces are sized so
   *any piece fits any neighbour* (Barrett), which removes the reroll-until-it-fits loop entirely. Measured on our gen2 (section 5.6):
   a World 8 roll lays about 20-28 sections from only 6-8 distinct ones, and 28 of World 8's 80 authored sections are in no shipped
   roll at all. We have more pieces on disk than the curated rolls use.

4. **Phone platformers reuse each level two or three times on purpose, and say so to the player.** Super Mario Run: 24 World Tour
   courses, each with five pink, then purple, then black coins; "Pink Coins are placed such that they are the easiest of the color
   coins to collect" (Mario Wiki); Toad Rally and Remix 10 are built from "segments from the courses" ("randomly chosen snippets from
   the game's other courses", Mario Wiki, Remix 10). Rayman Fiesta Run: "collecting all 100 Lums in a level reveals an Invasion
   Level, an extra challenging, modified version of the same zone" (IGN). Leo's Fortune: every level has the same three optional
   goals, "collect all the coins..., finish within a certain time limit, and not die" (Steve Paris). The reuse is honest (a
   different goal on the same ground), and the critics still docked it: SMR "the all-too-brief World Tour... I wish there were more
   to the game beyond playing the same levels again and again" (Polygon, quoted on Mario Wiki); Rayman Adventures "you are bound to
   repeat the same levels that are just disguised as being different" (Simbasible). For us: a second goal on a beaten roll (a Meeca
   carving set, a no-fall run) is cheap content; disguising the same roll as a new stage is the failure.

5. **One input, many verbs: the level gives the move, not the thumb.** Miyamoto: "layering in the ability to do different styles of
   jump, but having those styles of jump be controlled not through a combination of controls but through special blocks that enable
   Mario to do special jumps at certain times in the level" (Wired 2016); and "If you don't define the gameplay well, you may get
   some people who think if they slide a finger up, that will make Mario jump higher, or that if you touch the touchscreen harder,
   that should make him jump higher" (Financial Post 2016). Rayman Jungle Run groups its 40 levels "into four groups (Jump, Fly,
   Wall Run & Punch) based on a new mechanic that is introduced for each batch" (IGN). Cat Bird: "Rather than having your actual
   move set become more complex, the game throws increasingly complex challenges your way" (TouchArcade). Badland's port proves the
   converse: "Once we changed the gameplay to controlling the 2D movement with the analog stick, all the timing based puzzles broke"
   (Mäki-Patola, GamingBolt). Our levels are tuned to our touch rules, so the touch rules are part of the level spec (section 6,
   idea 5).

6. **Test like Rare: many tiny fast tests, a few golden-path stage tests, and a quarantine for flaky ones.** Sea of Thieves had
   "just over 23 thousand tests" (70% "actor tests", 5% integration), "a unit test typically took up to a tenth of a second... an
   integration test... around 20 seconds", and moved gameplay checks down because higher tests are "slower and less reliable"
   (Masella, GDC 2019 speaker notes). They ran "all our tests... at least once every 20 minutes", retried a failure once before
   turning the build red, and auto-quarantined then auto-deleted tests that kept failing. Our pyramid exists (node trace 3.7 ms,
   stage build 115-200 ms, World 1 fun gate 92-114 s, measured), and the tracer itself is well tested (`src/game/beatTrace.test.ts`,
   e.g. `:148` the clumsy thumb in the real engine, `:199` a layout built to fail). What no test covers is the *proposer*: no test
   file calls `fitSteps` or reads a palette's `jumpDy` (grep of every `*.test.ts` under `src/` and `tools/`; the one `jumpDy` hit,
   `touchJumpHelp.test.ts:340`, is a comment about something else), so the 94% rejection waste and
   the dead palette options are invisible to every gate we run.

7. **Calibrate the bots on people, the way King does, before trusting their numbers.** King's bot predicts a new Candy Crush level's
   difficulty "in less than a minute... compare[d] to the previous 7 days needed with human playtesting on each new episode of 15
   levels", because they fit the bot's success rate to real players' success rate with binomial regression ("We have the level
   difficulty, and we have the bot estimate... we will find a linear pattern, which is an indication that it is playing the game like
   a human", Asadi, GamesIndustry.biz 2024; Gudmundsson et al. 2018). Our first-timer bot's noise, N(+30, 30) ms adult and
   N(+90, 65) ms kid (`tools/inspect/firsttimer.ts:62-64`, `:115-120`), came from Gemini's research (`reference/GEMINI-LEDGER.md:70`,
   F3), not from Matt's or a tester's recordings, though we hold recordings (`tools/qa/touchReplay.ts:1-8`). Section 5.4 shows the
   answer swings from 0.0 to 1.6 expected falls a stage on those two settings alone. **New**.

8. **Make level data small, schema'd and separate from the code that reads it.** LDtk splits a project into "definitions (`defs`)
   and level data (`levels`)" and publishes the JSON schema with a "List of breaking changes"; Tiled lets a project define "custom
   enums and custom classes" so every placed object carries typed fields; Mekorama's "50 levels are less than 14KB. Together!" Our
   World 1 beat stages are TypeScript functions (`layout12`, `w1Rhythm.ts:529`; `layout15`, `:769`) inside a 1,349-line file, and
   1-2's whole design (its node order, its bars recipes, its palettes) is code, not a spec a helper or a check can read. gen2 is
   closer (sections and sockets as data, `gen2/DESIGN.md` B3) and its curated rolls are a generated manifest with per-roll metrics
   (`gen2/seeds.ts:27-75`), which is the right idea.

---

## 3. Phone platformers, per game

Format per game: structure and reuse / how touch shaped the levels / variety / difficulty / what failed. "Quote" lines are verbatim.

### Super Mario Run (Nintendo EPD, 2016)
- **Structure and reuse.** 24 World Tour courses in 6 worlds of 4, plus World ★ (9 courses); the last of each world is a castle or
  an airship (Mario Wiki). Courses have a 60-90 s timer. Each course is reused three times by colour coins (pink, then purple, then
  black, unlocked in that order), again as Toad Rally segments ("This also adds segments from the courses of that World to the Toad
  Rally mode as possible layouts"), and again in Remix 10 ("randomly chosen snippets from the game's other courses...
  Goal Poles, Warp Pipes, and doors serve as the ending of courses. If the segment did not have one of these items, a Goal Pole is
  added"). Remix 10 also inserts "Special Remix Course[s]" ("a course from the game with modifications... a new enemy or element") and
  rare "Secret Course[s]".
- **Touch shaped it.** Quote (Miyamoto, TIME Sept 2016): "we started by wanting to make a Mario game that you play one-handed."
  Quote (Financial Post): "the verticality gave Mario a new feel... vertically oriented areas where you're climbing towers." Auto-run
  came from speedrun videos: "they tend to run all the way through the course without ever stopping" (Wired). The engine helps the
  thumb: "The player vaults over short obstacles and small enemies... If the player jumps to a solid platform but hits the edge...
  they use Edge Climbing" (Mario Wiki). Pause Blocks let the player stop; "The brief moments where the player stops, be that on a
  Pause Block or when Edge Climbing, gave the game a unique rhythm" (Mario Wiki, Development). Enemies were re-cut for auto-run:
  "we took the Bullet Bill characters that usually come at you from the direction that you're heading and... now we have them coming
  at you from behind. The spiny characters... are also little bigger so they're easier to see" (Miyamoto, TIME Dec 2016).
- **Variety.** Special blocks give new jumps (Long Jump, Backflip), and "one of the biggest challenges was deciding what doesn't go
  in" (TIME Dec 2016).
- **Difficulty.** Bubbles instead of lives; colour-coin tiers as the hard mode; tap length sets jump height ("short taps trigger short
  jumps, while longer taps trigger higher ones", TIME Sept 2016).
- **What failed.** Length and replay: "short World Tour length and low replayability" (Mario Wiki, reception); Polygon: "I wish there
  were more to the game beyond playing the same levels again and again." The bosses were called "relics" (IGN, via Mario Wiki).
- **For us.** Our touch is a flick, not a tap; Miyamoto's warning about players who "slide a finger up" expecting a higher jump is
  the exact ambiguity our gesture rules handle (`tools/qa/touchReplay.ts` counts "false jumps" and misreads). A Pause Block is a
  rest pad the player chooses; our rest pads are fixed (the 10-eighth breath every five or six take-offs in `swung`, `w1Rhythm.ts:485-505`).

### Rayman Jungle Run / Fiesta Run / Adventures (Pastagames, Ubisoft Montpellier)
- **Structure.** Jungle Run: 40 levels "split into four groups (Jump, Fly, Wall Run & Punch) based on a new mechanic that is
  introduced for each batch" (IGN 2012); later +20 levels in two themed worlds (TouchArcade 2013). Fiesta Run: "75 themed levels",
  plus Invasion levels, "an extra challenging, modified version of the same zone" (IGN 2013).
- **Tools.** Pastagames had to tame "the very powerful level edition tool for both level and graphic designers to produce levels that
  would be cool and still work on the laggier devices" (Pastagames). The UbiArt talk abstract: "key features that allow designers to
  work at a rapid pace" (GDC Vault, McEntee 2014; video not viewable here). McEntee: "too many right angles or smooth planes can
  prevent players from immersing themselves" (Polygon 2013).
- **Touch shaped it.** One-touch auto-run; in Adventures, swipe to turn, tap to attack and jump. That third verb hurt: "you want to
  jump, but then Rayman attacks and vice versa" (Simbasible).
- **Variety.** One new mechanic per batch of ten; themed worlds; Invasion remixes.
- **Difficulty.** IGN: "your ability to master each stage depends on how comfortable you are with the often trial-by-error design...
  I unlocked the 'collect 100 Lums' achievement and the 'died 20 times in one stage' achievement in back to back stages." Fiesta Run
  sold "helpful gadgets", including "revealing the optimal path... you still have to perform every jump... exactly when the cue pops
  up" (IGN).
- **What failed.** Adventures: "levels cannot be replayed" (TouchArcade 2015) and "bound to repeat the same levels that are just
  disguised as being different" (Simbasible). Jungle Run: "trial-by-error" spikes.

### Leo's Fortune (1337 & Senri, 2014)
- **Structure.** "Each of the twenty main levels set you the same three objectives: you must collect all the coins..., finish within a
  certain time limit, and not die, not even once"; "Leo reappears just a few paces from where he met his untimely end. There's also
  no limit to how many times he can perish" (Steve Paris).
- **Touch shaped it.** Left half drag to move, right half up/down. Programmer Johan Knutzen: "The controls... have a lot of black
  magic hidden within the code... Just making the character move left and right on a flat surface has special cases... In the end we
  had to add special zones to the levels that change how the controls work in order to get that last piece of polish." That is
  level data carrying control tuning.
- **What failed.** "I personally found them more frustrating on an iPhone's smaller screen than on the larger iPad... Thankfully those
  combos are few and far between" (Steve Paris).
- **For us.** Per-zone control tweaks are a real pattern; we already do per-node rules (heart-cost falls, `w1Rhythm.ts:84-85`
  `heartFalls`); a level spec field for "touch assist here" would make it explicit.

### Oddmar (MobGe and Senri, 2018)
- **Structure.** "24 expertly crafted levels of physics-based puzzles and platforming" (MobGe); "24 levels to play through and the
  three challenges in each level" (TouchArcade).
- **Touch.** "Oddmar actually feels a bit better to play with touch controls... Swiping upward to lay down a mushroom to jump,
  especially off of walls, just feels good" (TouchArcade). Swipe-up jump is our flick-up jump.
- **Variety.** Hand-made levels; "the game's coin-collection challenge perfectly strikes the balance between convincing the player to
  collect as many coins as possible without making a single missed coin feel like the end of the world" (TouchArcade), the same
  tension as our petal goal (`w1Rhythm.ts:1053`, `PETAL_SHARE` 0.75).
- **What failed.** Length ("You can likely beat this one in just a few hours"). Art pipeline friction: "level designs are created
  independently from level designer" (Volkan Yenen ArtStation search snippet only; page not opened, so not relied on).

### Alto's Adventure / Odyssey (Snowman, Harry Nesbitt)
- **Structure.** Endless, procedural terrain. Nesbitt: "We're able to focus our efforts on refining a core set of rules that generate a
  seemingly-large experience from a relatively small number of assets" (Game Developer, IGF 2019).
- **Variety and its failure mode.** "We mix a lot of procedural content with hand-crafted sequences... it's also important to ensure
  these bespoke sequences don't draw too much attention to themselves or appear too frequently, as they can quickly become tiresome
  and stand out for the wrong reasons. To combat this, we sprinkled the game with a lot of subtle, understated moments." That is a
  frequency budget for set pieces, which our generators do not have (gen2 has `maxPerStage` per section, `gen2/DESIGN.md` B3; the
  beat stages have none).
- **Music.** "mirroring the game's procedural generation with a soundtrack that wasn't set in a standard time signature... you never
  really memorize it" (Cymet, TNW 2018). Note the contrast: Alto made music unpredictable so it never repeats; we lock jumps to the
  music's beat (`beatTrace.ts:641-657`), which makes the beat itself the repeating unit.
- **Restraint.** Zen Mode showed "there's value in taking things out than adding things in needlessly" (Nesbitt, TNW).

### Badland (Frogmind, 2013)
- **Structure.** "100 single player levels, 100 co-op levels" (GOTY edition); "Our levels were always a bit long for mobile. Many of
  them take between 5 to 15 minutes" (Mäki-Patola, GamingBolt).
- **Touch shaped it.** One touch, physics. "all the timing based puzzles broke" when the port added a stick (GamingBolt); a player
  found the console version "infuriating" and the phone one "so smooth... it felt fair" (Game Developer blog).
- **What failed.** TouchArcade: "similar-seeming inputs don't always produce the intended effects on-screen. As a result, it can be
  hard to locate problem areas or learn your way through a given puzzle." Unpredictable physics hides the lesson.

### Geometry Dash (RobTop, 2013)
- **Structure.** "26 developer-made levels: 22 are auto-scrolling, and 4 are platformer levels"; "Each level has an accompanying
  song... the music often synchronizes with a level's gameplay"; three secret coins per level "requiring the player to take an
  alternate pathway" (Wikipedia).
- **Variety.** Players: "over 150 million online levels" from the editor (Wikipedia). One-person studio content comes from tools.
- **Difficulty.** Six named tiers; a practice mode with player-placed checkpoints (Wikipedia).
- **What failed.** "the difficulty of the gameplay drew some criticism" (Wikipedia). Curation bottleneck: a player in the AMA: "you're
  still rating levels your self. This creates quite a bottleneck" (Reddit AMA question; RobTop's answers did not load).

### Leap Day (Nitrome, 2016): the closest shipped match to what we want
- **Structure.** One auto-run, one-tap level a day, same for every player, seed from the date, 15 checkpoints, two chunks per
  checkpoint, an End Zone at the end; "specific easy level chunks appear at the start... harder ones are more likely appear at the end"
  (Nitrome wiki). "We built lots (700-800) level chunks... We generate a number based off the date and use that with a bunch of
  rules" (Annal, PocketGamer.biz).
- **Variety.** Daily enemy pool (3-4 kinds) and object pool give "an overall gameplay theme to a level, with some recurring elements
  the player has to deal with in different situation, helping each level to feel more unique" (wiki). "Closing these drop off points
  left getting bored so we put a lot of effort into making the days seem as varied as possible" (Annal).
- **Cost.** "It is the first game we have made where every member of the team got involved. Mainly this was in building level chunks
  and play testing... We poured much more time than we budgeted" (Annal).
- **What failed.** End Zones were later restricted to the level's own components, which "unintentionally resulted in some End Zones
  being reused" (wiki).

### Dadish (Thomas K. Young) and Daily Dadish
- **Structure.** Each main game: "50 levels spread across 5 worlds, including a boss level at the end of each world" (Wikipedia);
  Dadish 2 adds "a few new autoscroll levels"; Dadish 3 adds ride-on and water helpers; Daily Dadish: "every day, a level out of the
  366 levels... will become playable for that day only."
- **Variety.** A new helper or vehicle per game. Developers are "Thomas K Young, CatCup Games"; the release timeline shows a new
  50-level game in 2020, 2021, 2022, 2024 and 2025 (Wikipedia); my reading (estimate) is that a fixed move set is what makes that pace possible.
- **What failed.** "some of the easiest bosses ever" and the lost world map (NodeGamers, Dadish 3).

### Mekorama (Martin Magni, 2016)
- 50 dioramas per the press kit ("help an endearing robot stumble home through 50 tiny mechanical dioramas"; Wikipedia says "the 120
  built-in levels"), a tap-to-place editor, levels shared as QR cards; "All 50
  levels are less than 14KB. Together!" (press kit). Critics: camera "clunky" and "frustrating at times" (Wikipedia, citing Pocket
  Gamer and Nintendo Life).

### Cat Bird (Raiyumi, 2017)
- "more than 40 levels"; "Rather than having your actual move set become more complex, the game throws increasingly complex challenges
  your way, oftentimes requiring the use of your unique floating ability"; deaths counted instead of lives (TouchArcade). The glide is
  a touch accommodation: "The touch controls might be excellent, but they'll never compare to a real controller. This mechanic takes
  away that problem entirely" (Pocket Gamer).
- **What failed.** "starting to feel a little tired... Do we really need another one?" (Pocket Gamer): same-genre fatigue, not
  same-level fatigue.

### King of Thieves (ZeptoLab, 2015)
- One-button: "Your Thief... automatically runs left or right. You can tap to trigger a jump... You can also jump off walls to reverse"
  (Telfer, Deconstructing King of Thieves). "Hitting a trap will reset your progress right to the beginning... Reasons for losing are
  always clear to the player, and there is very little friction to restarting." Players build trap levels for each other: content from
  players.
- **What failed.** The randomised-key gate "feels arbitrary"; monetisation over feel (Telfer).

### Downwell (Ojiro Fumoto, 2015)
- Started as "'Spelunky but on your phone'"; "The whole game is designed around maximising the player's use of the gunboots" (RPS on
  the GDC 2016 talk). Portrait, one key mechanic. The talk itself is video only; I did not see it.

### Not found / not covered
- **Pascal's Wager**, **Ori-likes on mobile**: no primary design source found in the time; not covered rather than guessed.

---

## 4. Engine architecture patterns, per source

### Spelunky (Kazemi's Spelunky Generator Lessons, parts 1 and 2)
- A 4x4 room grid; a solution path walked first ("picks a... random number from 1 to 5. On a 1 or 2, the solution path moves left...
  On a 5, the path goes down"), then room types with guaranteed exits, then templates ("Each room type has typically 8 to 16
  templates"), then obstacle blocks, then probabilistic tiles, then mirroring.
- **The debugging lesson.** Kazemi's tool rerolls one layer at a time: "PRESS '1' TO KEEP THE ROOM TYPES, BUT PICK NEW ROOM TEMPLATES...
  '2' TO KEEP THE TYPES AND TEMPLATES, BUT PICK NEW OBSTACLE BLOCKS... '3' TO KEEP EVERYTHING, ONLY PICKING NEW PROBABILISTIC TILES."
  Layer-locked rerolls show what each layer contributes. Our gen2 already gives each slot its own stream ("swapping one section leaves
  the others' rolls alone", `gen2/DESIGN.md` B3); `w1Rhythm.ts` uses one stream `R` per layout (`rng`, `w1Rhythm.ts:99`; held by the builder, `:281`), so changing
  one node's palette reshuffles every later node.

### Dead Cells (Bénard, "Building the Level Design of a procedurally generated Metroidvania", 2017)
- Six steps: fixed world frame; hand rooms in CastleDB "defined by a handful of parameters, mainly the numbers of entrances and exits
  available and the room's purpose"; a concept graph per biome as "a set of instruction to the procedural generation algorithm"; fill
  by rejection ("tries a random room... If it doesn't match, the algorithm tries another room until it finds one"); monster budget from
  combat-tile length ("1 monster for every 5 tiles"); loot. Key philosophy: "having the algorithm involved in the most restrained way
  possible."

### Noita and Herringbone Wang tiles (Noita wiki; Barrett, "Herringbone Wang Tiles")
- Noita's biomes are "a combination of 'Wang tiles' and 'Pixel scenes'" (wiki). Barrett: with a "complete stochastic set" (a tile
  for every edge combination) "the filling algorithm is trivial", left to right, no backtracking, and hand-made "special" large tiles
  are placed first and filled around. Edges as a contract means generation cannot fail.
- **For us.** Our nodes already have an edge contract: every node starts and ends on a flat 200 px apron at a known height
  (`beatTrace.ts:19`, `APRON` `:150`; shared aprons `w1Rhythm.ts:303-307`). That is a one-colour Wang edge. A node library authored
  against that edge (height in/out from a small set) would let nodes be shuffled with no stitching failures.

### Ludoscope / PhantomGrammar (Boris the Brave 2021; Endrovski, Dormans, Bidarra FDG 2026)
- "Unexplored has over 5000 rules... execution of generation is broken up into modules, and each module has a 'recipe'. Recipes are
  sequential series of instructions" (Boris). The UI "provides a graphical representation and contains tools for testing and
  debugging rules." Limitation: "it's often necessary to break down quite simple operations into several steps."
- The 2026 survey of 120 developers: concerns "Lack of artistic control 48.3%, Time investment vs. benefits 44.2%, Debugging difficulty
  41.7%, Unpredictable results 38.3%"; "no designer considered PCG essential to their process"; preferences show "consistent
  prioritization of creative control and process transparency over automation"; many free-text answers named "the 'procedural
  oatmeal' problem, a lack of meaningful variety."

### LDtk and Tiled (docs)
- LDtk: "Project data is stored in JSON files"; "definitions (`defs`) and level data (`levels`)"; a published, versioned format with
  "List of breaking changes (deprecations): if you write your own JSON importer, you should really pay attention."
- Tiled: typed custom properties (bool, color, file, float, int, object, string), project-level "custom enums and custom classes",
  "Tile Property Inheritance" with per-instance overrides.
- **For us.** A schema'd node spec (bars, palette, surfaces, tier, edges, teaching tag) as data would let a check read 1-2's design
  without running it, and let Matt or a helper edit a node without touching a 1,349-line file.

### Sea of Thieves automated testing (Masella, GDC 2019, full speaker notes)
- Test types: unit, "actor tests" ("a unit test for game code... that treated Unreal engine concepts like actors and components as first
  class dependencies"), integration maps, asset audits, screenshot tests ("% of pixels different and a manual test against last
  pinned"), performance, bootflow. Ratio "actor tests to integration tests is about 12 to 1"; "Only 5% of our tests were integration
  tests."
- Speed: unit "up to a tenth of a second", integration "around 20 seconds"; pre-commit target "less than 1 hour", which crept to "half a
  day or more" and forced the pyramid change.
- Flake policy: "the failing test is automatically retried straight away. Only if the same test fails again... do we turn the build
  'red'"; a weekly top-failures list; quarantine, then "If the test is not fixed by a certain amount of time, the test is automatically
  deleted."
- Results: build verification 10 days to 1.5; testers 50 to 17; peak bug count 214 vs "nearly 3000" on Nuts and Bolts.
- Test design: "use polling each frame instead to check for when the state... is what we expect" rather than fixed delays; test the
  behaviour, not the implementation.

### King: Candy Crush playtesting bots (Gudmundsson et al., CIG 2018; Asadi, GamesIndustry.biz 2024; Andelkovic, InfoQ 2019)
- A CNN policy trained on "millions and millions of states and the corresponding actions" to play "most human-like", then a binomial
  regression from bot success to player success; "In CCS we can now estimate the difficulty of a new level in less than a minute...
  This compares to the previous 7 days needed with human playtesting on each new episode of 15 levels." MAE 4.0-6.6% (Table II).
- Production: "95% fewer manual tweaks... 50% faster tweaks" and an auto-tweaker that proposes refinements to designers (Asadi).
- QA bot BAIT walks every screen and flags "missing textures, missing text strings, overlapping graphical elements... due to different
  resolutions/orientations" (InfoQ): our `clipcheck.mjs` does the same job for menus.

### EA SEED (Bergdahl et al., CoG 2020, "Augmenting Automated Game Testing with Deep RL")
- RL agents found a missing collision wall a scripted nav-mesh agent never would; stuck spots were found by plotting "the positions of
  the agents at the end of each training episode... From visual inspection alone it is clear that all five areas of interest could be
  identified." "RL is better suited for modular integration where it can complement rather than replace existing techniques." The
  plot-where-bots-end idea is cheap for us (section 6, idea 6).

### Isaksen, Gopstein, Nealen, "Exploring Game Space Using Survival Analysis" (FDG 2015)
- A one-tap game (Flappy Bird) with a motor-skill player model measured in a user study: precision "σp = 35.9 ms and σp = 61.1 ms",
  reaction "τ = 288 ms", "an average 7.7 actions per second"; difficulty from the decay rate of the score histogram. "getting Mario's
  jump to feel right is more about adjusting parameters than coding accurate physics." Used in section 5.4.

### Anthropic, Claude Code best practices (engineering blog)
- "Claude stops when the work looks done. If it has nothing to run that tells it whether the work actually *is* done, 'looks done' is
  all it has to go on." "Give Claude something it can run that comes back pass or fail." "The check can be... A script that diffs
  output against a fixture." Deterministic enforcement belongs in hooks, CI and tests, not in prose: "If you keep adding emphasis to a
  `CLAUDE.md` line and Claude still misses it, that's a sign the line belongs in a hook."
- **For us.** The repo's biggest files are the ones helpers must edit to build a stage: `engine.ts` 8,530 lines, `protoStage.ts` 7,570,
  `stageGenerator.ts` 3,058 (measured, `wc -l`). The fastest checks that touch a stage take minutes (fun gate 92-114 s, measured;
  drawcheck about 6 min and clipcheck about 4 min per CLAUDE.md). A helper changing one node of 1-2 has no sub-second check that says
  "your node's options are all reachable and laid" (section 6, idea 2).

---

## 5. Measurement on our code, with output

All runs on this container: 4 cores (`nproc`), Node v22.22.0. Scripts are in the scratchpad
(`/tmp/claude-0/-home-user-Sloths-Adventure-/de391798-4931-5f52-9808-d419b5307ca4/scratchpad/r4/`), import the real code read-only,
and edit nothing in the repo. Instrumented runs use a *copy* of `w1Rhythm.ts` in the scratchpad with tally calls added at its six
reject points (`w1Rhythm.ts:207`, `:216`, `:221`, `:224`, `:1014`, `:1039`).

### 5.1 The fun gate, timed (measured), on two commits

`time npx tsx tools/validate/funcheck.ts` at `8ba25751`:
```
✗ new: 1-1 normal "pacing" on 13 of 16 layouts (...); e.g. never tight: no 5 s window asks for more than about one move a second (no burst, no climax)
✗ new: 1-1 normal "nothing bites" on 7 of 16 layouts (1,2,6,8,10,12,16); e.g. 82% of the beats after the first 30 s cost nothing when missed (0 cost a setback, 9 a life)
✗ worse: 1-2 normal "pacing" on 16 layouts, known 1 (...)
✗ new: 1-4 normal "pacing" on 14 of 16 layouts ...   (and the three Easy rows, and 1-1 normal "dead walk" on 3)
FAIL (8 worse or new, 0 to lower or delete; 75 known, 1061 stage-layout flags; 93 s)
real	1m32.075s
```
At `8baec851` (after `27389479` "Pacing ruler: tight is a burst as the research defines it, per setting"):
```
✗ new: 1-1 normal "nothing bites" on 7 of 16 layouts (1,2,6,8,10,12,16); e.g. 82% of the beats after the first 30 s cost nothing when missed (0 cost a setback, 9 a life)
✗ new: 1-1 normal "dead walk" on 3 of 16 layouts (7,11,14); e.g. 3.5 s of walking with nothing to do at x 24670
FAIL (2 worse or new, 0 to lower or delete; 75 known, 1061 stage-layout flags; 114 s)
real	1m56.922s
exit 1
```
So **the branch head fails its own fun gate** (2 new flags on 1-1 Normal), and CI runs this gate (`.github/workflows/gates.yml:33`).
The lead should know before any merge. (I did not change anything; this is the tree as committed.)

### 5.2 One stage's build, per layer (measured, `measure.ts`)
```
1-2 normal bpm 128.2: layout median 100.9 ms (max 341.0), buildRhythmStage median 150.8 ms (max 422.4), one validateStage median 25.9 ms, full generateStage median 326.5 ms (max 474.6); 16 layouts total 5.34 s
1-2 easy   bpm 128.2: layout median 144.2 ms (max 367.7), buildRhythmStage median 201.0 ms (max 740.4), one validateStage median 27.5 ms, full generateStage median 388.6 ms (max 942.4); 16 layouts total 7.16 s
1-5 normal bpm 136:   layout median 80.3 ms, buildRhythmStage median 115.2 ms, one validateStage median 26.8 ms, full generateStage median 341.0 ms; 16 layouts total 5.59 s
1-5 easy   bpm 136:   layout median 75.3 ms, buildRhythmStage median 123.7 ms, one validateStage median 29.4 ms, full generateStage median 348.3 ms; 16 layouts total 5.57 s
```
One node (`nodecost.ts`, 1-2's canopy palette copied from `w1Rhythm.ts:478`, 13 take-offs at 128.2 BPM):
```
fitSteps (rolls until traced, Normal + Easy) 6.79 ms a node (0/200 gave up); one traceNode + checkTrace 3.71 ms
```
The pyramid, measured: a node 4-7 ms, a stage 0.1-0.4 s (the shared post-passes after the beat builder are about half to two thirds of a full
`generateStage`: 1-2 Normal 151 of 327 ms is the builder, 1-5 Normal 115 of 341 ms), World 1 x 16 layouts x 2 settings 92-114 s. A per-node gate would run in milliseconds.

### 5.3 The rejection report: why rolls are thrown away (measured, `reject.ts`, the key idea)
```
== 1-2 Normal, 16 layouts built, 3.4 s: 932 rejected tries ==
   880   94.4%  fit | traceNode: step #: a clumsy jump (air #) can't reach # px up
    50    5.4%  fit | traceNode: step #: the gap is # px: no jump at all (make it a drop, a rise, or a bigger move)
     1    0.1%  fit | traceNode: steps ##: the same gap (# px, a jump, # px up) # times in a row
     1    0.1%  layout | ##: the split's roads can't hold their petals (high #, low #)
== 1-2 Easy, 16 layouts built, 5.4 s: 2346 rejected tries ==
  2228   95.0%  fit | traceNode: step #: a clumsy jump (air #) can't reach # px up
    97    4.1%  fit | traceNode: step #: the gap is # px: no jump at all ...
    15    0.6%  layout | ##: the split's roads can't hold their petals (high #, low #)
     3    0.1%  levelcheck | heart ## at (#, #) is inside platform #
== 1-5 Normal, 16 layouts built, 2.0 s: 16 rejected tries ==
    16  100.0%  fit | traceNode: steps ##: the same gap (# px, a jump, # px up) # times in a row
== 1-5 Easy, 16 layouts built, 2.1 s: 42 rejected tries ==
    42  100.0%  fit | traceNode: steps ##: the same gap ...
```
The same run with the numbers kept (`RAW=1`, 1-2 Normal):
```
462 fit | traceNode: step #: a clumsy jump (air 1) can't reach 80 px up
418 fit | traceNode: step #: a clumsy jump (air 1) can't reach 90 px up
 50 fit | traceNode: step #: the gap is 23 px: no jump at all ...
```
"air 1" with a failure means the short-flick try (`TRIES` row 7, `beatTrace.ts:340`, hold `SHORT_HOLD.normal` 0.8, `:343`). The
proposer's `fits` (`w1Rhythm.ts:169-171`) tests only a full-hold flight.

**Palette coverage** (`coverage.ts`): every jump height each palette offers, and how many times it was laid in 16 layouts:
```
1-2 Normal
  jumpDy [-60/-40/-20/0/20/40]  laid -60:26 -40:36 -20:64 0:89 20:108 40:120
  jumpDy [-60/-50/50/60/80/90]  laid -60:16 -50:25 50:59 60:40 80:0 90:0   NEVER LAID: 80, 90
  jumpDy [-50/-40/40/50/80/90]  laid -50:13 -40:27 40:61 50:69 80:0 90:0   NEVER LAID: 80, 90
  jumpDy [-60/-30/0/30/50]      laid -60:22 -30:44 0:17 30:161 50:147
1-2 Easy: the same two palettes, 80 and 90 NEVER LAID
1-5 Normal
  jumpDy [-60/-50/-40/-30/-20/0/20]  laid -60:0 ...   NEVER LAID: -60   (Easy: -60 laid 3 times)
```
(Counts include steps of rolls that a later layer threw away; rows are the palettes at `w1Rhythm.ts:478`, `:606`, `:617`, `:707`,
`:791`, `:852`, `:860`.) The 80/90 rises are dead options on both settings: a third of the rises those two palettes offer.

**The fix experiment** (`rejectFixed.ts`: the scratchpad copy's `fits` also requires a flight at 0.85 air and, for a jump, at 0.8 hold;
two runs each, wall times are noisy on this machine):
```
BASE   1-2 Normal 932 rejected (4.7-5.7 s)   1-2 Easy 2346 rejected (8.2-8.8 s)   1-5 unchanged (16 / 42)
FIXED  1-2 Normal 413 rejected (5.9-6.6 s)   1-2 Easy  776 rejected (5.7-6.0 s)   1-5 unchanged (16 / 42)
FIXED, numbers kept:  343 "can't reach 80 px up", 66 "gap is 23 px", 1 "exit platform 146 is not reachable", 1 "flower out of reach"
```
Rejected tries fell 56% (Normal) and 67% (Easy); time did not clearly fall (the rolls change, so other layers reject different
layouts). 80 px is still proposed and still refused: my copy of the verifier's rule is still not the verifier's rule. That is the
real finding: **two hand-written models of the same jump drift**; the proposer should call the verifier's own reach predicate (one
function, exported from `beatTrace.ts`), and a test should assert that every palette option is reachable by every `TRIES` row.

### 5.4 Survival estimate on the real traced nodes (measured on the model; the model itself is an estimate) (`survive.ts`)
Every traced take-off of 1-2 and 1-5 (layouts 1-4, Normal) moved by a normal timing error, 400 draws each, half at the engine's 1/60
slice and half at 1/30, success = feet land within the landing ledge plus `FORGIVE.normal.landPx` (8 px), a take-off past the edge
allowed for `FORGIVE.normal.coyote` (0.133 s) of running (`physics.ts:41`). Only timing error; no hold error, no drift, no hazards:
```
1-2 layout 1 (Normal): 93 traced take-offs
  Isaksen sharp (N(0, 36 ms))            chance of no fall all stage 100.0%, expected falls 0.00
  Isaksen loose (N(0, 61 ms))            chance of no fall all stage  97.0%, expected falls 0.03
  our ADULT bot latency N(+30, 30 ms)    chance of no fall all stage 100.0%, expected falls 0.00
  our KID bot latency N(+90, 65 ms)      chance of no fall all stage  19.5%, expected falls 1.58
    hardest: ramp/A  step 7 hop dy -40 gap 37 px  p = 100% / 100% / 100% / 92%
1-2 layouts 2-4: Isaksen loose 98.5% / 97.0% / 98.5%; KID 34.3% / 31.6% / 36.6% (expected falls 1.04 / 1.12 / 0.98)
1-5 layouts 1-4: Isaksen loose 100% / 100% / 99.8% / 99.5%; KID 64.8% / 59.8% / 61.9% / 59.0% (expected falls 0.43-0.52)
```
Reading: for an adult with measured human precision, the traced jumps are essentially free (0.00-0.03 expected falls over 83-113
take-offs). All the risk the model finds is the kid's *late* thumb on short hops onto narrow pads (27-37 px gaps), where a late
take-off runs past the coyote window. That agrees with the gate's "nothing bites" flag; it also says
Normal's challenge has to be put in on purpose (hazards on avoided lines, snap twigs, density), because the geometry contributes ~0.

### 5.5 Roll-to-roll distance (measured, `distance.ts`, `rhythmRollDistance`, `w1Rhythm.ts:1313`)
```
1-2: 28 pairs of rolls 1-8: distance min 0.433 median 0.493 max 0.555; under 0.35: 0; mean parts beat 0.68 height 0.51 piece 0.29
1-5: 28 pairs of rolls 1-8: distance min 0.423 median 0.467 max 0.524; under 0.35: 0; mean parts beat 0.77 height 0.30 piece 0.32
```
Every pair clears `AWAY.min` 0.35 (`layoutMemory.ts:112`). The "piece" part (what he lands on) is the smallest: 1-2's canopy palette
has one surface, `['branch']` (`w1Rhythm.ts:478`), so two rolls look alike under his feet even when the beat differs. Leap Day's daily
pools are the counter-pattern.

### 5.6 The same coverage question on gen2's shipped rolls (measured from `src/game/gen2/seeds.ts`, a Python count)
Every authored `section({ id: ... })` in `src/game/gen2/worlds/*.ts` against the `sections` strings of every curated roll in
`seeds.ts` (16 rolls a stage, 23 gen2 stages):
```
World 6: 41 section({...}) ids, 34 of them in shipped rolls; never shipped: 7: w6-double-gap, w6-drop, w6-landing, w6-mud-gap, w6-rise, w6-root-road, w6-stump-hop
World 7: 36 section({...}) ids, 36 of them in shipped rolls; never shipped: 0
World 8: 80 section({...}) ids, 52 of them in shipped rolls; never shipped: 28: w8-boa-knots, w8-bough-gap, w8-climb-run, w8-dark-boughs,
  w8-dark-climb, w8-dark-gap, w8-dark-long, w8-double-gap, w8-drop, w8-glide-trunk, w8-guard-knots, w8-harpy-leap, w8-hunter-bough,
  w8-knot-hops, w8-monarch-harpies, w8-prowl-bough, w8-rise, w8-roost-climb, w8-roost-curtain-gaps, w8-roost-curtain-leap,
  w8-roost-curtains, w8-roost-dark, w8-roost-hollow-gap, w8-roost-hollows, w8-roost-long, w8-roost-prowl, w8-sunken-fork, w8-trunk-climb
(World 5's sections are not written as section({ id }) in its files, so the count does not see them.)
```
Sections a roll and distinct sections a roll (same file):
```
5-7 27.1 / 13.6   5-9 22.6 / 17.2   6-1 23.4 / 9.8   6-2 23.3 / 7.6   6-4 19.2 / 7.8   6-9 16.4 / 8.1
7-1 24.8 / 12.1   7-5 17.2 / 12.1   8-1 27.7 / 8.3   8-2 24.8 / 7.4   8-6 26.9 / 7.6   8-8 18.2 / 6.0   8-9 20.7 / 6.0
```
Reading: 35% of World 8's authored sections (28 of 80) are in no shipped roll. Why is **not checked** (estimate: several are stealth
"roost" sections, `w8Sections.ts:1062`, and the World 8 gen2 stages are 8-1, 2, 3, 5, 6, 8, 9, `w8Game.ts:18`, so a stage that would
use them may not be built by gen2; `w6-double-gap` `needs: ['double']`, `w6Ground.ts:281-288`). Either way it is art and design
work that players never see. And in 8-8 and 8-9 a roll lays about 20 sections from only 6 distinct ones, each about three times;
Leap Day lays about 28 chunks a level (two per checkpoint for 14 checkpoints, then an End Zone) from a pool of 700-800. This is Matt's "more pieces" rule measured: the pieces
exist on disk; the curated rolls do not use them.

---

## 6. Ideas none of our research mentions

Checked against `reference/research/README.md`, all six ledgers in `reference/research/ledger/`, the 11-04 engine texts,
`GEMINI-PCG-RESEARCH.md`, `GEMINI-LEDGER.md` and `STAGE-RULES.md` (grep counts: "Candy Crush" 0, "Leap Day" 0, "Remix 10" 0,
"Sea of Thieves" 0, "quarantine" 0, "survival analysis" 0, "herringbone" 0, "Ludoscope" 0, "pink coin" 0).

1. **A rejection report and a coverage gate for every generator.** Every reject point tallies its rule (a counter, as in section 5.3).
   A gate fails when (a) one rule eats more than half the tries for a node, or (b) a palette option is laid 0 times over the 16
   shipped layouts. Today it would have caught 1-2's dead 80/90 px rises (`w1Rhythm.ts:606`, `:617`), 1-5's dead -60
   (`:791`), and the 28 World 8 and 7 World 6 sections no curated roll ships (section 5.6). Cost: about an hour (estimate). Source pattern: Dead Cells' reject-and-retry plus Endrovski 2026's "debugging difficulty".
2. **One reach predicate shared by proposer and verifier, with a property test.** Export `reachable(move, dy, easy)` from `beatTrace.ts`
   that runs exactly `TRIES`; `fitSteps.fits` calls it; a test enumerates every palette in `w1Rhythm.ts` x every move and asserts the
   two agree. Section 5.3 shows that a second hand copy still drifts (80 px). This is the sub-second per-node check a helper can run
   (Anthropic: "Give Claude something it can run that comes back pass or fail").
3. **Expected falls per node from a human-measured timing model, as a design target (not only a pass bar).** Use Isaksen's measured
   σ (36-61 ms) for Normal and our kid bot for Easy; put "expected falls" next to each node in the stage report; aim, say, intro 0,
   spike 0.2-0.4, climax 0.3-0.6 on Normal (targets are estimates to tune with Matt). Today the tracer proves "never unfair" and the
   gate says "nothing bites"; this number would tell a builder how much bite each node has before it ships.
4. **Calibrate the bots on the recordings we already have (King's method).** The control-test sheet records touches and Pokey's state
   (`tools/qa/touchReplay.ts:2-14`). Measure each tester's real take-off distance before ledge edges and their flick hold times, fit
   the first-timer's `thumb` and `hold` (`firsttimer.ts:115-120`) to them, and report the fit (King reports MAE 4.0-6.6%). Until
   then every bot-derived goal (petal shares, `w1Rhythm.ts:1053`; Easy goals) rests on Gemini's guessed noise.
5. **Touch rules are part of the level spec.** Badland's port broke "all the timing based puzzles" when the input changed; Leo's
   Fortune added "special zones to the levels that change how the controls work". Pin the gesture-recogniser constants and the
   `FORGIVE` table (`physics.ts:41-42`) into each curated roll's manifest (as gen2's `seeds.ts` pins `kit`), and re-run the stage's
   checks when they change. A control tweak is a level change.
6. **Plot where the bots end.** EA found stuck spots by plotting agents' final positions. Our first-timer bot runs already; write each
   run's death and stall x into one strip image per stage (one PNG, layouts stacked), so a helper and the lead see clusters at a glance
   instead of reading per-jump tables.
7. **Layer-locked rerolls as a debug switch.** Kazemi's Spelunky tool: keep room types, reroll templates; keep templates, reroll
   obstacles; keep all, reroll probabilistic tiles. For the beat stages: keep the node list and bars, reroll steps; keep steps, reroll
   surfaces and hazards. Needs one RNG stream per node and per layer (gen2 already has per-slot streams, `gen2/DESIGN.md` B3;
   `w1Rhythm.ts` shares one `R`).
8. **Same ground, second goal, said plainly.** SMR's colour coins (pink easy, then purple, then black on the same course), Fiesta Run's
   Invasion levels, Leo's Fortune's three fixed goals. A beaten roll of 1-2 can return as "the same trail, Meeca's carvings" or "no
   falls" without new geometry; the failure to avoid is Rayman Adventures' levels "disguised as being different".
9. **Themed pools per stage, not one grab bag.** Leap Day's 3-4 enemies and its object pool per day "give an overall gameplay theme
   to a level". For our worlds: each stage draws a small pool from the world's sections (two hazards, one surface family), so stage
   variety comes from which pool, and node variety from the pool's pieces. This is a structure for Matt's "more pieces" rule.
10. **Flaky-gate policy from Rare.** Retry a failed gate once; publish a weekly "top failing checks" list; quarantine a check that fails
    repeatedly and give it an owner and a deadline. Our known-lists only shrink (`tools/perf/knowncheck.mjs`), which is the debt side;
    nothing tracks checks that flicker.

---

## 7. Source list: every URL actually opened

Phone platformers
1. https://www.wired.com/2016/12/miyamoto-interview-2/ (Miyamoto, Super Mario Run)
2. https://time.com/4482878/super-mario-run-apple-iphone-shigeru-miytamoto/ (Miyamoto, Sept 2016)
3. https://time.com/4594652/super-mario-run-shigeru-miyamoto-interview-iphone-apple-2016/ (Miyamoto, Dec 2016)
4. https://financialpost.com/features/mario-run-shigeru-miyamoto-interview (Miyamoto, Dec 2016)
5. https://www.washingtonpost.com/video-games/2020/09/14/mario-nintendo-creators-miyamoto-koizumi-tezuka-motokura/ (paywalled; first lines only; not cited)
6. https://www.mariowiki.com/Super_Mario_Run (World Tour, Remix 10, Development, Reception sections read)
7. https://www.mariowiki.com/Pink_Coin_(Super_Mario_Run)
8. https://www.polygon.com/2016/12/22/14058636/how-to-get-every-pink-purple-and-black-coin-videos/
9. https://www.pastagames.com/game-keyword/rayman-jungle-run/
10. https://www.ign.com/articles/2012/09/21/rayman-jungle-run-review
11. https://toucharcade.com/2013/04/11/rayman-jungle-run-updated-with-20-new-levels/
12. https://www.ign.com/articles/2013/11/08/rayman-fiesta-run-review
13. https://toucharcade.com/2015/12/11/rayman-adventures-review/
14. https://www.simbasible.com/rayman-adventures-game-review/
15. https://www.gamedeveloper.com/design/video-the-tools-used-to-design-i-rayman-legends-i-
16. https://www.gdcvault.com/play/1020398/Rayman-Legends-The-Design-Process (abstract only)
17. https://chrismcentee.com/portfolio-items/game-level-designer-rayman-legends/
18. https://www.polygon.com/2013/7/12/4517060/rayman-legends-design-philosophy-breathe-life-into-concept-art/
19. http://www.steveparis.net/2014/05/leos-fortune-interview-with-1337-senri.html
20. https://mobge.net/blog-details/3/the-concept-of-oddmar
21. https://toucharcade.com/2018/04/20/oddmar-review-this-game-earns-its-place-in-valhalla/
22. https://www.gamedeveloper.com/business/road-to-the-igf-team-alto-s-i-alto-s-odyssey-i-
23. https://thenextweb.com/news/how-altos-odyssey-transports-players-to-a-whole-new-world
24. https://gamingbolt.com/badland-game-of-the-year-edition-interview-mobile-development-and-neutrality-in-the-console-war
25. https://www.gamedeveloper.com/design/badland-mobile-vs-consoles
26. https://toucharcade.com/2013/04/12/badland-review/
27. https://en.wikipedia.org/wiki/Geometry_Dash
28. https://www.reddit.com/r/geometrydash/comments/1ah10jz/i_am_the_developer_of_geometry_dash_back_for/ (questions only loaded)
29. https://nitrome.fandom.com/wiki/Leap_Day
30. https://www.pocketgamer.biz/leap-day/
31. https://en.wikipedia.org/wiki/Leap_Day_(video_game)
32. https://en.wikipedia.org/wiki/Dadish
33. https://nodegamers.com/dadish-3-review/
34. https://en.wikipedia.org/wiki/Mekorama
35. https://www.mekorama.com/press/
36. https://www.pocketgamer.com/cat-bird/review/
37. https://toucharcade.com/2017/08/25/toucharcade-game-of-the-week-cat-bird/
38. https://mobilefreetoplay.com/deconstructing-king-of-thieves/
39. https://www.rockpapershotgun.com/downwell-creator-on-designing-the-gunboots
40. https://thisgengaming.com/2018/12/29/interview-with-ojiro-fumoto-developer-of-downwell/ (read; no level-design content in the part loaded; not cited)
41. https://www.gdcvault.com/play/1023533/Polishing-the-Boots-Designing-Downwell (abstract only)

Engine architecture, testing, tools
42. http://tinysubversions.com/spelunkyGen/
43. http://tinysubversions.com/spelunkyGen2/
44. https://www.gamedeveloper.com/design/building-the-level-design-of-a-procedurally-generated-metroidvania-a-hybrid-approach-
45. https://noita.wiki.gg/wiki/World_generation
46. https://nothings.org/gamedev/herringbone/herringbone_tiles.html
47. https://www.boristhebrave.com/2021/04/02/phantomgrammar-and-ludoscope/
48. https://www.pcgworkshop.com/archive/endrovski2026developers.pdf (FDG 2026; sections 1-4.3.1 read)
49. https://ldtk.io/docs/game-dev/json-overview/
50. https://doc.mapeditor.org/en/stable/manual/custom-properties/
51. https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf (Sea of Thieves, full speaker notes)
52. https://www.unrealengine.com/events/unreal-fest-europe-2019/automated-testing-at-scale-in-sea-of-thieves (abstract only)
53. https://gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf (King, CIG 2018, full paper)
54. https://www.gamesindustry.biz/how-king-is-using-ai-to-speed-up-development-of-new-candy-crush-levels
55. https://www.infoq.com/articles/candy-crush-QA-AI-saga/
56. https://arxiv.org/abs/2103.15819 and https://arxiv.org/html/2103.15819v1 (EA SEED, CoG 2020, full text)
57. https://www.ea.com/seed/news/automated-game-testing-deep-reinforcement-learning
58. http://www.nealen.net/papers/exploring-game-space-FDG2015.pdf (Isaksen et al., sections 1-4 read)
59. https://www.anthropic.com/engineering/claude-code-best-practices

Failed to open (not used): https://www.forbes.com/sites/davidthier/2016/12/16/super-mario-runs-pink-purple-and-black-coins-will-drive-me-mad/ (403),
https://www.raymanpc.com/wiki/en/Rayman_Fiesta_Run (blocked), https://tcrf.net/Rayman_Jungle_Run (blocked),
https://dl.acm.org/doi/full/10.1145/3723498.3723784 (blocked), https://ieee-cog.org/2020/papers/paper_215.pdf (unreachable; read the arXiv copy),
https://www.mariowiki.com/Purple_Coin_(Super_Mario_Run) and .../Black_Coin_(Super_Mario_Run) (404), https://dadish.fandom.com/wiki/Daily_Dadish (blocked).
