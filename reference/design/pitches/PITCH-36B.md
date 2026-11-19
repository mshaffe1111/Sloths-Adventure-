# PITCH-36B (OPEN LENS): 3-6, 3-7, 3-8, 3-9 and World 3's hidden stage. Pitcher B. Started 6:30 PM ET 11-19, written 6:51 PM (by `date`).
Blind (D85): reference/plans/GAME-MAP.md, every 3-x pitch past PICKS-29-32.md (so no 3-3..3-5 pitch or pick) and t-pitch-36a were NOT read.
Read: the packet, pitch.md, level.md, 2-4.md (t-design-24), PICKS-29-32.md, PICKS-19-22.md (only to check reused tributes), stagePlan.ts,
DIFFICULTY.md §4, PLATFORMER-100-MATT.md Blocks 3-4, and the engine on origin/main 6e7b85f8 (every fact below cites file:line there).
Node strings: `npx tsx reference/specs/sims/nodes36b.ts`: no errors, all five. Sources: every tribute has a page I OPENED that is not
Wikipedia (URL given); lines I could not open are [S] (Hardcore Gaming 101 was "moving servers" at 6:35 PM ET; realnz.com is off this network).

**The thread: SEE OR BE SEEN.** 3-1 made light by standing still; 3-2 showed that what is lit is seen. The back half asks that one question four
ways: 3-6 hands him a light to CARRY; 3-7 reads the SHADOWS the light throws (and the eyes find whoever holds it); 3-8 rides the grotto's
sleepers by the glow of their own waking eyes; 3-9 throws the light AWAY as bait to break out. The hidden stage is the answer: on a dark river,
stillness is light. **Ladder musts:** (1) every stage dark, lit only by glowworms, the glowcap, the vines' eyes, moonlight at the end;
(2) by 3-9 he has used 3-1's stillness (3-6 beat 6, 3-9 beat 6), 3-2's hang (3-8 beat 8, 3-9 beat 2, the secret), 3-3's drive-off (3-9's rings),
3-4's climb (3-8 beat 9, 3-9 beat 7), 3-5's sleeping vines (3-8, 3-9 beat 5); 3-9 adds no move; (3) one new thing a stage, named below;
(4) the hidden stage is SEEN in 3-7 (a shadow) and REACHED by World 3's moves (stand still, then hang under).

---
## 3-6 Grandma's Things: "Carry the Light" (relic_hunt 5; Normal 25.0, Easy at most 15.0; World 3's breather after 3-5)
**One idea:** "Pick up a glowcap and carry your own light into the dark: Grandma's things glint in it; set it down to climb, throw it ahead to
see where to land." A player says: "the one where you carry a glowing mushroom like a lantern." **New thing:** the light goes WITH him (3-1's came to him).
**Why it is fun for a sloth on a phone:** the cave peels open around him as he walks, the purest lantern-in-a-cave feeling a child can have.
The glowcap is already in the game: World 3's mushroom lights a 230 px ring carried, lying or flying (puzzleKit.ts:43,56; puzzlePlay.ts:613-624),
the darkness is drawn around it (engine.ts:7729-7730) and its light wakes sleeping glowworms (engine.ts:8828-8836). One thumb: a tap picks
up or sets down, the jump press THROWS it up and forward, and with full hands he walks slower and cannot jump or climb (puzzleKit.ts:16-18):
a sloth's own pace, and a small choice every screen: carry it, or put it down to climb. Upright (412 px wide) the 460 px ring fills the screen
edge to edge and the black sits above and ahead; sideways (915 px) the ring is half the screen and the black on both sides is where the throw goes.
**Tributes**
- **Montezuma's Revenge** (Parker Brothers 1984, Robert Jaeger; the pre-1990, from anywhere). a. Loved: the descent hunt. "Montezuma's Revenge
  (1984) sees players searching for treasure by descending in a large pyramid, requiring backtracking and the collection of color-coded keys"
  (https://www.gamedeveloper.com/design/book-excerpt-world-design-for-2d-action-adventures). [S] "Joe has to find a torch if he wants to see
  anything (except enemies) on the lowermost floor. This darkness keeps creeping up with each stage" (https://www.hardcoregaming101.net/montezumas-revenge/,
  down; search-index text). b. Taught: the torch is a thing you find; the dark rooms show nothing until you hold it. c. Ours: the light is a thing
  in his arms, found on the way. d. Not copied: kept forever, keys, one-touch deaths (the glowcap regrows at its patch if lost, puzzleKit.ts:11-12).
- **Wario Land 4** (Nintendo 2001; Block 3, lesser-known). a. Loved: every level hides its own pieces: "Only by collecting all four jewel
  pieces within a passage's stages will you gain access to the boss" (https://www.gamesradar.com/wario-land-4-mario-fatter-arch-nemesis/).
  b. Taught: the first piece is in plain view, the rest a side room off the path. c. Ours: find 1 glints in the very first ring of light;
  finds 2-5 sit one throw or one climb off the path. d. Not copied: the escape timer, transformations.
- **Terraria** (Re-Logic 2011; Block 4, post-2005). a. Loved: "There's a wonderful splendor to dipping your toes into an uncharted grotto"
  (https://www.pcgamer.com/terraria-review/); "How nervously I threw a torch over the edge to find out what new creature was emitting the awful
  growling noise" (https://www.pcgamer.com/terraria-review-2011/). b. Taught: you carry light and place it; throwing one is the player's own
  discovery. c. Ours: THAT moment, by design: the next shelf is black until he throws the light onto it (beat 3). d. Not copied: crafting, digging, a
  pocket of endless torches (one glowcap; a patch regrows it).
**The beats** (Normal; flags and hearts by the live rolled-flag rule, never by this table; no creatures: the breather)
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | Awake glowworms (3-1's light), a glowcap patch; Dot's teach 800 px+ before beat 1 (rule 6) | Looks into the black | "It's so dark in there" |
| 1 | TEACH: carry it (T g +, dark) | A flat dark floor, nothing that hurts; one fern glints in the ring (find 1) | Picks it up, walks, crouches to search (engine.ts:3311) | "I made the dark go away" |
| 2 | Throw it up (P c ^ +, dark) | A shelf he can't climb with full hands | Throws it up onto the shelf, climbs into its light (find 2) | "Light first, then me" |
| 3 | Throw it across (P f +, soft) | Fungus shelves over soft moss (M-07-a, N-10-a/b art) | Throws, hops into the light, picks up (find 3) | "Now I can see where to land" |
| 4 | TEST: the rhythm (X g >, dark) + R | A longer dark of gaps (Easy soft; Normal World 3's pit kind) | Throw, hop, grab, throw | "Toss... hop... grab" |
| 5 | TWIST: wake the roof (W c ^ +, dark) + R | A sleeping glowworm roof over a tall wall | Sets the glowcap under it: the roof wakes (engine.ts:8833-8835) and lights the climb, so he climbs empty-handed (find 4) | "I woke the whole roof!" |
| 6 | COMBINE (C f + >, dark) | Shelves, a climb, a find over a gap only a throw shows (find 5) | All three uses in one stretch | "I know how this works" |
| 7 | Breather (P g) | Ferns, petals in the light | Walks | "Ahh" |
| 8 | SIGNATURE: the long throw (S s) | A black chasm; the shrine's lantern basket on the far side; World 3's liana (w3#liana, in game) | Throws the glowcap across into the basket (puzzlePlay.ts:620 lights it there), swings after it into its light | "I lit my own way across!" |
| 9 | Exit (E) | The shrine, lit | Walks in | "Got them all, Grandma" |
**Node string** (checkCode: no errors; 5 finds, one per `+`): `A Tg1+<:#dark Pc1^+<:#dark Pf1+<:#soft Xg1>:#dark R Wc1^+<:#dark R Cf1+>:#dark Pg1< Ss1< E` (12 tokens).
**Difficulty**, pasted: "**Slots:** target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]" (DIFFICULTY.md:63) = 20 + 5 = **25.0**;
"**World band** [10w - 11, 10w + 1]" (:62) = 19..31; Easy "at most 0.6 x Normal" (:61) = **at most 15.0**.
**Engine.** WIRED: the glowcap (puzzleKit.ts:56, light 230; thrown/set/carried puzzleKit.ts:16-18), its regrowing source (puzzleKit.ts:11-12), the dark drawn
around it (engine.ts:7729), lamps waking glowworms (engine.ts:8828-8836), stillness waking them (engine.ts:8826; GLOW_STILL 0.7 s, zones.ts:79),
the Hush Fern search (engine.ts:3311-3333), Grandma's keepsakes (stagePlan.ts:183), dark zones (zones.ts; gen2 pattern w6Swing.ts:388-465).
EXISTS-UNWIRED: the glowcap outside a puzzle room; the World 3 gen2 kit (ENG-W3a, a foundation before any 3-x build, PICKS-29-32.md).
**NEW 1 (M, 2-4 h):** the glowcap on the open stage: a W3 kit socket that lays a glowcap patch (its source) and a light-aware reach check (a find
or shelf counts as reached only with the light; the throw's landing FLOWN on the real engine first, level.md rule 24); files gen2/worlds/w3.ts,
gen2/pipeline.ts. **NEW 2 (S-M, 1-2 h):** bot skills carry-light, throw-ahead, set-down-to-climb (tools/inspect/firsttimer.ts SKILLS), each on a
planted toy that goes RED without it (rule 21).
**Different:** 3-1's light came when he stood still; here it walks with him. No creatures (3-2..3-5 all had a threat): a hunt, not a sneak.

---
## 3-7 Which Fern?: "The Shadow Tells" (relic_hunt 6; Normal 28.0, Easy at most 16.8; opens the hidden stage)
**One idea:** "All the ferns look alike, but not their shadows: hold your light near them, and the fern with Grandma's thing inside throws its
shape onto the cave wall." A player says: "the one where you look at the shadows on the wall." **New thing:** shadows (the story line says it:
"All ferns look alike", stagePlan.ts:83).
**Why it is fun on a phone:** the cave wall becomes a shadow-puppet show that swings and grows as he walks (the nearer the light, the bigger the
shadow), and a teddy's ears pop out of one fern's shadow: a find a child SEES, not a fern he crouches at one by one. One thumb: walk, a tap sets
the glowcap down where its shadows fall best, hold down to search. The danger: World 3's eyes in the dark pass on their rhythm and he hides in a
fern (engine.ts:8596-8606, `hide = 'fern'`). Upright the wall's shadows rise in the top half over the ground band; sideways 3-4 shadows sit side by side to compare.
**Tributes**
- **Castlevania** (Konami 1986; Matt's #7; pre-1990). a. Loved: a castle packed with things to check: "A Castlevania castle contained heart-holding
  candelabras and breakable walls" and "There are many secrets to exhume from nooks and crannies" (https://www.gamesradar.com/creating-draculas-castle-castlevania/).
  b. Taught: every candle on the path holds something, so you learn to whip each one ([S] "candles contain items", https://www.hardcoregaming101.net/cvbackup/idiot.htm).
  c. Ours: the same urge to check every fern, with a FAIR tell (the shadow) so nobody crouches at forty ferns. d. Not copied: whipping, random drops.
- **Oddworld: Abe's Oddysee** (Oddworld Inhabitants 1997; Block 3, lesser-known; used at 1-9 for "one creature, one readable rule", the reason
  here is new: shadow as cover). a. Loved: "Abe's Oddysee was probably the first time I can remember playing a stealth game. Tiptoeing Abe in
  and out of shadows was just awesome to me" (Brandon Goins, https://www.gamesradar.com/orphan-limbo-meets-aliens/). b. Taught: a dark patch
  beside the first guard [S]. c. Ours: the light that throws the shadows also shows HIM, so he sets it down and reads the wall from the dark.
  d. Not copied: guns, possession.
- **Inside** (Playdead 2016; Block 4, post-2005). a. Loved: "The lighting is beautiful too, from the intimidating spotlights of mechanical
  sentries to flashlight beams slicing through trees" (https://www.pcgamer.com/inside-review/). b. Taught with no words: "If you try to make a run
  for it, he will notice you... So now as a player we know that running isn't always the answer"
  (https://www.gamedeveloper.com/design/inside---teaching-through-level-design). c. Ours: one Dot line, then the wall teaches: the first fern's
  shadow is alone on a bare wall; the next two stand side by side. d. Not copied: its violence, death scenes.
**The beats**
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | A hall of identical ferns, a glowcap patch; Dot 800 px+ before beat 1: the wall shows what a fern hides (keeper words) | Looks at the ferns | "They're all the same!" |
| 1 | TEACH: the shadow (T g +, dark) | One fern, a bare wall behind it | Walks past with the glowcap: a teddy's ears grow out of its shadow; searches (find 1) | "It's a teddy's shadow!" |
| 2 | Move the light (P f +) | Ferns on fungus shelves: their shadows fall high | Sets the glowcap low so the shadows climb into view (find 2) | "Move the light, move the shadow" |
| 3 | The eyes (P m + &) | The eyes pass; ferns are cover | Hides when they come, reads the wall between passes (find 3) | "Hide... now look" |
| 4 | TEST (X g & >, dark) + R | A long fern row, the eyes on a quicker beat | Read, hide, search | "Which one? Quick!" |
| 5 | TWIST: the giant (W c ^ +, dark) + R | A monster shadow rears on the wall: a beetle sitting by the glowcap. The real find's shadow is high, behind a fern on a ledge; and one shadow is an ARCH with no fern in front of it (the secret, below) | Laughs, climbs (find 4) | "Ha! Just a beetle" |
| 6 | COMBINE (C m + & >) | Two halls, the eyes, the beetle's giant shadow as a decoy (find 5) | Everything at once | "I can read the wall" |
| 7 | Breather (P f) | Fungus shelves | Hops | "Phew" |
| 8 | SIGNATURE: the shadow theatre (S g +) | A great curved wall; set the glowcap in the hall's middle and EVERY fern's shadow is thrown at once | Finds the bell among twenty shadows (find 6) | "I found it in the shadow show!" |
| 9 | Exit (E) | The shrine | Walks in | "Six more, Grandma" |
**The secret (ladder must 4):** beat 5's arch shadow marks a crack high in the wall. Standing still beneath it wakes the glowworms above
(engine.ts:8826) and shows a roof root; he hangs under it (3-2's move, ENG-ROOT) to the crack, and the gate opens the way the Thorn Gate does
(App.tsx:932-936: a moment to see it open, then the stage). Never on the main route (secrets go in after the layout check, stageGenerator.ts:3043-3047).
**Node string** (no errors): `A Tg1+<:#dark Pf1+< Pm1+&<:&eyes Xg1&>:&eyes:#dark R Wc1^+<:#dark R Cm1+&>:&eyes:#dark Pf1< Sg1+< E` (12 tokens, 6 finds).
**Difficulty**, pasted as above: 20 + T = 8 → **28.0**; Easy **at most 16.8**.
**Engine.** WIRED: 3-6's glowcap; the eyes and fern cover (engine.ts:8590-8606; watcher.ts stepWatch); the Hush Fern (engine.ts:3311);
stillness wakes glowworms (engine.ts:8826). EXISTS-UNWIRED: 3-2's roof root (ENG-ROOT) for the secret. **NEW 1 (M, 2-4 h):** the shadow wall:
every fern inside a light's reach (puzzlePlay.ts:614 lights(), awake glowworms) draws its shadow on the back wall, projected from the light,
with the hidden find's silhouette (the four keepsakes' alpha, stagePlan.ts:183, cached once, never per frame); file a new w3Shadow.ts + the
engine's draw hook; drawcheck on 3-7 both ways (D81). **NEW 2 (S-M, 1-2 h):** the secret table: today one hard-coded gate (secret.ts:8
SECRET_GATE_LEVEL = '7-7'; stageGenerator.ts:3048; App.tsx:934-936 starts THORNBARK_LEVEL) becomes data (gate stage, kit socket, hidden
stage), 7-7 keeps Thornbark, and generalitycheck stays clean (no '3-7' in engine code).
**Different:** 3-6 read the floor in the light; 3-7 reads the WALL. The first World 3 hunt with a watcher; the stage that hides the grotto's secret.

---
## 3-8 Thorn Vine Swing: "Ride the Sleepers" (vine_runner; Normal 27.0, Easy at most 16.2; the breather before the finale)
**One idea:** "The old thorn vines are the swings: while one sleeps its thorns lie flat and you can hold it; let go before it wakes."
A player says: "the one where you swing on the sleeping thorn vines." **New thing:** a danger you can hold.
**Why it is fun on a phone:** riding a sleeping monster is a thrill a child tells friends about, and hanging is what a sloth does best. The clock
is already the vines' own: asleep, then they stir (an eye cracks open: the warning), then they look (thornVine.ts:1-35; engine.ts:8870), on a
rhythm that never changes, so it is always fair. One thumb: the World 1-2 liana's grab and let-go. The vines' stirring eyes glow amber, so
the warning is also the light. Upright: the vine he holds and the next one's eye in one screen; sideways: three eyes, their rhythm readable.
**Tributes**
- **Frogger** (Konami 1981; Matt's own favourite; used at 2-1 for the river crossing, the reason here is new: the DIVING turtles, a living ride
  that drops you on its own clock). a. Loved and feared: "you see some of the turtles submerging, and you get scared that the ones you are on will
  submerge as well" (https://www.gamedeveloper.com/business/what-makes-frogger-fun-). b. Taught: turtles show themselves going under first.
  c. Ours: every sleeper stirs for a long fixed warning before it looks. d. Not copied: the timer, instant drowning (Easy's sleepers sleep longer).
- **Klonoa: Door to Phantomile** (Namco 1997; Block 3, lesser-known). a. Loved: "take a simple ability – grabbing and throwing enemies – and
  show how to use it a hundred different ways" (https://www.gamesradar.com/klonoa-review/). b. Taught: the first enemies are slow and harmless [S].
  c. Ours: the danger IS the handhold, and the first one can't hurt (its sleep outlasts any ride). d. Not copied: throwing them, the wind ring.
- **Shovel Knight** (Yacht Club 2014; Block 4, post-2005). a. Loved: "jump and then shovel for a downward, pogo stick-like attack" and its nods,
  "The downward attack from DuckTales" (https://www.pcgamer.com/shovel-knight-review/): what threatens you becomes your way across.
  b. Taught: the first targets are harmless [S]. c. Ours: the same order: soft moss under the first sleeper. d. Not copied: attacking, the pogo.
**The beats**
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The thorn-vine hall, vines asleep (3-5 met them); Dot 800 px+ before beat 1 (keeper words: swing while it sleeps, let go when it stirs) | Looks up | "They're asleep..." |
| 1 | TEACH (T s, soft) | One sleeper over a fungus mat, asleep longer than three swings | Grabs, swings, lets go onto the far shelf | "I'm swinging on a sleeping vine!" |
| 2 | Two sleepers (P s) | The second stirs as he reaches it | Waits one more swing on the first, still asleep | "Not yet... now" |
| 3 | 3-5's lesson (P g) | A ledge under a looking vine | Stands still till it dozes | "Shh" |
| 4 | TEST (X s >) + R | Three sleepers over the drop (Easy soft) | Swing, swing, swing before they wake | "Before they wake!" |
| 5 | TWIST: no ledge (W f) + R | Between two sleepers only a fungus shelf under a looking vine | Drops to it, freezes, goes when the next dozes | "Freeze on the mushroom" |
| 6 | COMBINE (C r) + R | A sleeper swings him up to a roof root; he hangs under (3-2) beside the vines' buds (thornVine.ts `below`) | Creeps past sleeping eyes | "I'm right next to their eyes!" |
| 7 | Up and out (P c ^) | The grotto wall (3-4's climb) | Climbs | "Up we go" |
| 8 | SIGNATURE: the Old Vine (S s) | The oldest sleeper: the longest swing in World 3, over a glowworm-lit lake | One huge arc, lets go at the top onto the shrine ledge | "It never even woke up" |
| 9 | Exit (E) | The shrine | | "Thorns? Easy." |
**Node string** (no errors): `A Ts1<:#soft Ps1<:#thornvine@doze Pg1< Xs1>:#thornvine@doze R Wf1<:#thornvine@doze R Cr1>:#thornvine@doze Pc1^< Ss1< E`.
**Difficulty:** 20 + T = 7 → **27.0**; Easy **at most 16.2**.
**Engine.** WIRED: the vines' clock and lash (thornVine.ts; engine.ts:8870-8890), lianas (W2_LIANA; w3#liana art in game), soft floors, 3-2's
roof root, 3-4's climb. **NEW 1 (M, 2-4 h):** the holdable sleeper: a liana bound to a thorn vine's phase (asleep = a liana; stir = it shakes and
glows; look = it drops him: a heart on Normal only if he holds on into the look, none on Easy); its fairness check (a sleep holds at least two full
swings, FLOWN on the real engine, rule 24); files thornVine.ts, the liana step in engine.ts, a W3 kit row. **NEW 2 (S-M, 1-2 h):** bot skill
ride-the-sleeper (let go in the stir; wait while asleep), planted toy RED without it.
**Different:** 3-5 sneaks past sleeping vines; 3-8 rides them. 2-4's swing waits on logs below; here the swing IS the clock. After two slow hunts, air.

---
## 3-9 The Prowler's Ring: "Light Is Their Bait" (gauntlet; FINALE, no new move; Normal 30.0, Easy at most 18.0)
**One idea:** "Break out of the ring by throwing your light where you aren't: every prowler's eyes go to it, and you slip round behind them in the
dark." A player says: "the one where you throw the mushroom and all the prowlers look at it." **New thing:** none. 3-2 taught that what is lit is seen;
3-6 taught the throw; 3-9 puts them together: the light that gave him away now gives THEM away.
**Why it is fun on a phone:** a ring of glinting eyes all round him is World 3's scariest picture, and the trick that beats it is the child's own
idea, set up four stages earlier. One thumb: the throw and the walk. Upright: the ring's near edge and the throw's landing; sideways: the whole ring.
**Tributes**
- **Pac-Man** (Namco 1980; pre-1990, from anywhere). a. Loved: the turn of the tables: Iwatani: "how Pac-Man, who spends most of his time
  avoiding ghosts, is able to turn the tables and chase the ghosts after eating a power cookie"
  (https://www.gamedeveloper.com/audio/postmortem-i-pac-man-i-iwatani-s-rhapsody-in-yellow). b. Taught: the power pellets sit in corners you pass
  anyway. c. Ours: the hunted uses the hunters' own rule; the first bait goes to ONE dozing prowler. d. Not copied: eating them, the maze.
- **Castlevania: Symphony of the Night** (Konami 1997; Block 3, lesser-known to a phone child). a. Loved: the remix: "Just when you think you've
  mastered Dracula's castle, the accursed structure turns your world upside-down"; each secret is "a potential game changer that completely alters your perception
  of the space around you and how you move around it" (https://www.gamesradar.com/castlevania-symphony-night-designed-upside-down/). b. Taught: the same place,
  turned. c. Ours: every beat is a World 3 piece turned (the light that betrayed him is his bait; the roots he hid under are his way behind them).
  d. Not copied: the inverted map, RPG levels.
- **Metroid Dread** (MercurySteam/Nintendo 2021; Block 4, post-2005). a. Loved: "when you're in the territory of an E.M.M.I, and it's chasing
  you across the map with alarming speed and intelligence"; and "a sweet taste of victory by having you encounter a damaged E.M.M.I. first"
  (https://www.gamesradar.com/metroid-dread-makes-power-suits-sexy-and-robots-terrifying-again/); the hunters keep to "their patrol zones"
  (https://www.gamesradar.com/metroid-dread-preview-e3-2021/). b. Taught: a safe win first, then the real hunt. c. Ours: beat 1's dozing prowler
  is that safe win; the rings are zones, the stretches between are quiet. d. Not copied: one-hit kills, chase speed.
**The beats**
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The Prowler's hollow: eyes far off in a circle; a glowcap patch | Looks | "So many eyes" |
| 1 | The safe taste (P g &, dark) | One dozing prowler | Throws the glowcap past it: it wakes, walks to the light and watches it; he slips behind | "It went for the light!" |
| 2 | The old way (P r &) | Two prowlers under a roof root | Hangs under, over them (3-2) | "Like before" |
| 3 | RING 1 (X g & >, dark) + R | Three prowlers close the ring (engine.ts:8203-8248) | Throws across the ring, slips out the dark side, drives them off from behind (3-3's verb) to open it | "They all looked away!" |
| 4 | TWIST: leave the light (W s) + R | The way on is the sleeper hall (3-8), the ring watching the glowcap he leaves | Swings in the dark by the vines' amber eyes | "No light... just go" |
| 5 | Lit rest (R) | Glowworms (stand still, 3-1); a new glowcap | Breathes | "Light again" |
| 6 | RING 2 on a climb (C c ^ & >, dark) | Two prowlers circling below the sinkhole wall (3-4) | Throws the light DOWN to keep them below, climbs | "Stay down there!" |
| 7 | Breather (P f) | Fungus shelves | Hops | |
| 8 | SIGNATURE: the Great Ring (S g &) | Four prowlers round the shrine steps | Throw, slip, stand still for the glowworms to show the steps, hang under the last root; moonlight falls on the shrine | "I tricked the whole ring" |
| 9 | Exit (E) | The shrine: the Shadow Prowler waits beyond (3-10) | | |
**Node string** (no errors; no teach): `A Pg1&<:&prowler*1z:#dark Pr1&<:&prowler*2 Xg1&>:&prowler*3:#dark R Ws1>:#thornvine@doze R Cc1^&>:&prowler*2:#dark Pf1< Sg1&<:&prowler*4 E`.
**Difficulty:** 20 + T = 10 → **30.0** (World 3's hardest, inside 19..31); Easy **at most 18.0**.
**Engine.** WIRED: the ring and its waves ("Prowlers out of the dark! Drive them all off to open the way", engine.ts:809, 8203-8248), ocelots
and jaguars (predatorAI.ts:18), a listener walking to a lure and "noticing nobody" (predatorAI.ts:361-367), 3-6's glowcap, 3-8's sleeper,
3-2's root and blind-upward prowlers. **NEW 1 (S-M, 1-2 h):** a lit glowcap lying still is a lure: prowlers listen to it the way turtles and royal
guards listen to a noise (noise.ts:5-11 lists no prowler today; predatorAI.ts:361's lure branch extended to ocelot and jaguar); planted test:
a prowler walks to a LYING glowcap, never to one he is carrying. **NEW 2 (S, ~1 h):** bot skill bait-and-slip.
**Different:** 3-3 drove prowlers off; 3-9 makes them look away first. The only stage where the light is thrown away and LEFT behind.

---
## The hidden stage: "The Glowworm River" (the keeper names it; opened from 3-7; no slot, proposed Normal ~20)
**Reached:** 3-7 beat 5's arch shadow → stand still (3-1) → hang under the root (3-2) → the crack. **One idea:** "Drift in silence on a raft under a
sky of glowworms: stand still and the stars shine and show what's coming; move, and they dim." A player says: "the secret river with the stars."
**New thing:** the stars go OUT again when he moves (3-1's stay lit). True to life: a glowworm "hangs down up to 30 silk threads along which it
regularly places small sticky droplets" (https://en.wikipedia.org/wiki/Arachnocampa_luminosa, wiki), and [S] the Waitomo glowworms dim in a
"population-wide startle response" to noise (NZ Geographic). A journal page for the child.
**Why it is fun on a phone:** after nine stages of patience, a reward: the raft carries him, and stillness, World 3's whole lesson, is the
control. Doing nothing is how you see. A duck (hold down) is still, so the stars stay; a hop for glow petals dims them (a small choice).
**Tributes**
- **The Legend of Zelda** (Nintendo 1986; pre-1990, from anywhere). a. Loved: "Optional rooms (and sometimes entire paths) branch off from the
  critical path and reward the player with bonuses" (https://www.gamedeveloper.com/design/learning-from-the-masters-level-design-in-i-the-legend-of-zelda-i-).
  b. Taught: secrets are hinted ("eastmost peninsula has the secret", same page). c. Ours: hinted by a shadow, never needed. d. Not copied: bombs.
- **Braid** (Number None 2008; Block 4, lesser-known). a. Loved: its hidden stars: collect them and she "shows up in her own constellation"
  (https://www.gamedeveloper.com/design/braid-deconstructed-a-retrospective). b. Taught: [S] seen by players who look harder. c. Ours: the
  reward IS a sky of stars, found by looking. d. Not copied: time, its puzzles.
- **Ori and the Blind Forest** (Moon Studios 2015; Block 4; this stage's one famous-few title). a. Loved: "a pool of painted light in constant
  motion... one of the most beautiful games I've ever played" (https://www.pcgamer.com/ori-and-the-blind-forest-review/). b. Taught: light
  restores a dark forest. c. Ours: a stage whose job is wonder. d. Not copied: its "end-of-dungeon difficulty spikes" (same review).
**The beats:** 0 Arrive: the crack opens on a black river, a raft at a stone jetty ("Where am I?"). 1 TEACH (T w): on the raft, stand still: the roof
wakes into stars (GLOW_STILL 0.7 s, zones.ts:79) and the river ahead shows; walk, they dim ("Stars, underground!"). 2 (P w) low silk curtains: duck,
stars stay ("Duck and stay still"). 3 (P f) a fungus shelf with glow petals: hop off and back, the stars dim ("Worth it?"). 4 TEST (X g >) + R: a dim
stretch of low rocks: stand still to see them, then duck or hop. 5 TWIST (W w) + R: the river splits; only the deep branch's stars wake ("Follow the
stars"). 6 COMBINE (C r): the raft slides under a low roof; he hangs under a root while it passes beneath, drops back on (3-2). 7 (P c ^): climb from
the landing. 8 SIGNATURE (S w +): the Glowworm Dome: stand still and the whole sky wakes; the reward ("It's the night sky"). 9 Exit.
**Node string** (no errors): `A Tw1<:#water Pw1< Pf1< Xg1>:#water R Ww1<:#water R Cr1>:#water Pc1^< Sw1+< E`.
**Difficulty:** no slot: DIFFICULTY.md §4's slots cover stages 1-9 and guardians "are scored on their own" (:65). Proposed (mine, not pasted):
inside World 3's band 19..31 (:62) at its floor, Normal ~20, Easy at most 12: a reward, not a test. The lead's call.
**Engine.** WIRED: rafts and drift (river.ts, gen2/riverLay.ts, puzzle-kit#raft), glowworm waking (engine.ts:8826-8852), duck, 3-2's root,
World 3's water art (props/pitwater/w3.webp). **NEW 1 (S, ~1 h):** glowworms that dim again after he moves (a zone flag; "still" read against
what he stands on, so riding the raft counts as still); zones.ts + engine.ts stepGlowworms. **NEW 2 (S-M, 1-2 h):** the hidden stage as a stage:
a stageTable row with a hidden id, shown on the map and satchel once found (Satchel.tsx:90-95, Thornbark's pattern), on 3-7's secret table.
**Reward** (the lead's and keeper's call): (a) a keepsake and a journal page (cheap; recommended); (b) a lasting gift like the Thorn Heart (secret.ts:55).
**Different:** the only stage he rides instead of walks; the only one where stillness is the control from start to end; World 3's only river.

---
## Engine sum (at most 2 NEW a level; each proven on a REAL stageTable row, level.md rule 23)
3-6 M + S-M · 3-7 M + S-M · 3-8 M + S-M · 3-9 S-M + S · hidden S + S-M. Foundations first (D40): ENG-W3a (the World 3 kit) and 3-2's ENG-ROOT.
Build order by dependency: 3-6's glowcap socket before 3-7 (shadows read its light) and 3-9 (the bait); 3-8's sleeper before 3-9's beat 4.

## Pushback
1. **The rungs I can't see.** 3-3..3-5 are not picked. If one of them already teaches the glowcap, 3-6's new thing becomes the THROW (still
   new) and nothing else moves. If 3-3's drive-off needs the prowler unaware, the bait in 3-9 is exactly how he gets there; if not, 3-9's rings
   still open by the drive-off.
2. **3-9's bait is a remix by the player's rules but NEW by the engine's:** no prowler listens to anything today (noise.ts:5-11). If the lead
   rules "prowlers look at light" too new for a finale, the same NEW piece works with 3-5's noise (a pebble, if 3-5 teaches it).
3. **"Break out" vs the gauntlet goal:** the goal counts drive-offs ("Drive them all off to open the way", engine.ts:8248). Ask the keeper to word
   3-9's goal as RINGS broken (3), or keep the count and let the bait set up each drive-off.
4. **"Lit = seen" for the eyes:** watcher.ts has no light rule. Ask that 3-2's piece (prowlers see a lit patch) be written for EVERY watcher
   kind (rule 22); then 3-7's eyes see a carried glowcap for free. If not, 3-7 still plays (the eyes' passes + ferns, wired).
5. **The secret gate is one hard-coded stage** (secret.ts:8 '7-7'); a second hidden stage needs 3-7's NEW 2 first, and the hidden stage has no
   difficulty slot (DIFFICULTY.md §4).
6. **The packet's shelf:** "pre-1990 / lesser-known / post-2005" with "lead from Blocks 3-4 (one from anywhere)": Blocks 3-4 start in 1997, so the
   pre-1990 title is always the "one from anywhere". Done that way in all five. Two reused games, each with a new reason: Abe (1-9), Frogger (2-1).

## Learned
- **Read the engine's unwired pieces before inventing:** the glowcap (puzzleKit.ts:56), the Hush Fern (engine.ts:3311), the vines' clock
  (thornVine.ts) and the lure walk (predatorAI.ts:361) were all already built; every idea here is a new USE of one, which is what holds NEW to 2.
- **Write the node string early:** V11 (no letter over 40%, no neighbours alike) pushed 3-8 and the hidden stage to mix in a fungus shelf, a root
  and a climb, which made both better levels.
- **Method update (pitch.md step 2, sources):** WebFetch returned only the title of every GamesRadar page; `curl -sL -A "Mozilla/5.0"` plus a
  sentence grep of the stripped text gave the full article. Hardcore Gaming 101 was down again (as at 5:40 PM 11-18): its search-index text is [S].
- Lessons applied: D30 (every time from `date`), D58 (why players loved it, cited), D73/D85 (the pitch round, blind), D34 (file:line on every
  engine fact), D40 (foundations first: ENG-W3a, ENG-ROOT), D53 (roadmapcheck + knowncheck before the push).
