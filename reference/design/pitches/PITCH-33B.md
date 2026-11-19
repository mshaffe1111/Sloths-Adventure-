# PITCH-33B (OPEN LENS): 3-3, 3-4, 3-5, "send them home, climb the moonlight, go down quiet"
Pitcher B (PITCH-33B.md, pitch.md step 2b on the lead's branch @cdd01e7b), on origin/main 6e7b85f8. Written 6:25 PM ET 11-19 (by `date`).
**Not read:** reference/plans/GAME-MAP.md, any 3-x pitch beyond PICKS-29-32.md, t-pitch-33a, t-pitch-29a/29b. **Read:** the packet, pitch.md (main +
the lead's 2b), level.md, 2-4.md (t-design-24, the bar), PICKS-29-32.md (2-9, 3-1, 3-2 only), PLATFORMER-100-MATT.md Blocks 1-4, INSPIRED-BY.md (grep
only), PITCH-26B.md (t-pitch-26b, the format), DIFFICULTY.md, the code cited below. Node strings: `npx tsx reference/specs/sims/nodes3335b.ts`
(out/nodes3335b.txt: all three "checkCode: no errors"). Sources: every quote below was opened (curl or fetch, 11-19); [S] = not opened.

## The three as one ladder (World 3's dark, used three ways: what you DO in it)
| Level | Story (stagePlan.ts:79-81) | The one idea | The ONE new thing | Ladder musts |
|---|---|---|---|---|
| 3-3 Footprints in a Circle (purge) | "Drive off the prowlers circling in the dark." | Throw a pebble into the sleepy mushrooms: the prowler goes to look, gets a puff of spores and yawns off home to bed | a NOISE he makes somewhere else (the pebble) draws a prowler | (1) MET: noise draws the awake (T) and wakes a sleeper (W); (2) glowworms + glowing prints; (3) stand still (P), hang under (X) |
| 3-4 The Sinkhole (ascent) | "Climb the sinkhole wall toward the moonlight." | The moonbeam swings from wall to wall; where it touches, the moonflowers open into steps: climb in the light | light that MOVES on its own (and makes ground) | (2) the moon is the light; (3) glowworms show the foot (A), hang under the overhang (P) |
| 3-5 Sleeping Vines (stealth) | "The old thorn vines are asleep. Do not wake them." | Go down the quiet way: climb, hang, land on moss; one hard landing and the old vines wake | the sleeping thorn vine (a sleeper that wakes to HIS noise) | (1) USED in full: noise wakes sleepers; (3) stand still while one looks, hang under a row |
3-3 says "be loud, somewhere else"; 3-5 says "be quiet, everywhere": the world's noise rule taught from both ends, with a climb of wonder between.
**Facts checked on main 6e7b85f8 (law 3).** No World 3 gen2 kit (gen2/worlds: w1, w2, w5-w8); the hand builds are protoStage.ts:2431 (3-3, punch and kick
prowlers), :476 buildSinkhole (3-4), :2636 (3-5, vines on a rhythm + bell and pebble). Cast 3: ocelot, jaguar, thornVine, grottoEyes (roster.ts:31); TAUGHT
noise 3, drum 3, landing 2 (roster.ts:43-56: "'noise', the thrown pebble or nut, is World 3's, where noise becomes a world rule"). OCELOT: stalk, sight
240/150/80 tall, `hears: NOISE.dur`, first 'still', beatenBy still (flees 5 s) / trap (chasedOff) / drum (stunned 3 s) / punch / light (world3.ts:12-24).
Cleared (a purge's count) = leaving or gone (castPlay.ts:191-193); 'flees' only goes away for its seconds (core.ts:305-307). A THROWN noise draws a hunter
that hears to the spot, "noticing nobody" (core.ts:320-345), but `thrownNoise` (heroNoise.ts:50) has no caller in the game (grep: tests only): the rule is
written, not wired. The kit's pebble (puzzleKit.ts:55, noisy), its pile (`source`), throws `THROW.up {100,-820}` / `fwd {480,-320}` (:278-280), carrying at
0.68 speed, no jump (:17, :200); gen2 sections can carry a kit room (types.ts:448-541; w8Rooms.ts:92 lays a stone pile). Spores: World 3's zone
(zones.ts:265-291), DROWSY_SPEED 0.5, DROWSY_JUMP 0.95 (:162-167), clear spell >= 3.0 s (:180-185); NOISE: hear 520 px, dur 4.5 s (noise.ts:16-24).
Glowworms wake after GLOW_STILL 0.7 s still (zones.ts:79-81, engine.ts:8826-8862). Landing noise: silent at a fall <= 200 px, then 180-560 px (heroNoise.ts:13-19);
"catching a vine ends a fall with no landing" (:55-60). Vines: sleep/stir/look, lash 0.3 s + 0.45 s, still under 25 px/s or ducking is safe
(thornVine.ts:1-78); a vine listening to a kit noise "sees nothing else" (:67). The moonflower bud: "a light that reaches it opens it ... and open it lights
`r` px round it" (puzzleKit.ts:119-120). World 8's lit-fall rule: "a fall off a bough costs a life on Normal only when the far side of the gap was lit"
(lantern.ts:11-13). Targets, pasted (DIFFICULTY.md:61-63): "Normal targets; Easy at most 0.6 x Normal", "World band [10w - 11, 10w + 1]", "target(w, s) =
10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]" -> World 3 band 19..31.

---
## 3-3 Footprints in a Circle: "Off to Bed"
**One idea:** "Throw a pebble into the sleepy mushrooms: the prowler goes to look, gets a puff of spores, and yawns off home to bed." A player says: "the one
where you throw pebbles so the cats get sleepy."
**Why it's fun for a sloth on a phone:** for two stages the prowlers were something to hide from; now Pokey sends them home, and nobody is hurt. A sloth is
slow, so he never chases: he picks his spot, waits for the circle to bring a prowler round, and lets the cave do it (Abe's way, Undertale's heart). One
thumb: walk to the spot, one press throws (the kit's own controls, puzzleKit.ts:16-18: jump throws up and forward, kick forward), and the funny payoff (a big yawn, a sleepy pad off into the dark) lands every time. The
circling is on screen: the prowlers' paws leave glowing prints in the luminous moss, so each one's circle shows in the dark (rule 10: the name is on
screen; a code-drawn glow, STAGE-RULES §4). Upright: from his shelf the pile, the patch below and the near side of a circle must fit ~425 px (to prove on
stills; the forward throw's landing sets the shelf's place). Sideways: the whole hollow.
**Tributes (B leads from Blocks 3-4; Pac-Man is the one from anywhere)**
- **Pac-Man** (Namco 1980; pre-1990). a. Loved: Iwatani: "I have the simple game design and adorable characteristics of Pac-Man himself to thank for this
  success" (https://www.gamedeveloper.com/audio/postmortem-i-pac-man-i-iwatani-s-rhapsody-in-yellow). b. Taught: "the game explained itself when people saw
  or played it" (same page); the hunters keep a rhythm you can read: "In scatter mode, the ghosts give up the chase for a few seconds and head for their
  respective home corners" (https://www.gamedeveloper.com/design/the-pac-man-dossier). c. Ours: the hunted turns the tables, gently: the circlers are SENT
  HOME, one by one, and the circle itself (their prints) is the readable rhythm. d. Not copied: eating them, the maze, the power pill.
- **Oddworld: Abe's Oddysee** (GT Interactive 1997; Block 3 #52; lesser-known). a. Loved: GamesRadar (Edwin Evans-Thirlwell, 1 Apr 2015): "The oddest thing about
  Oddworld is that nobody's managed to do this kind of game better"; play is "careful negotiation of a bubbling stew of AI variables"
  (https://www.gamesradar.com/uk/oddworld-new-n-tasty-review/); GameSpot: the AI "goes a long way towards making you feel as if you're interacting with an
  actual world and its inhabitants" (https://en.wikipedia.org/wiki/Oddworld:_Abe%27s_Oddysee). b. Taught: one creature at a time: "It begins with the Sligs
  ... They'll shoot the unarmed Abe on sight, but can't jump and may be led astray by thrown bottle caps" (GamesRadar); Abe uses "throwable objects such as
  meat, rocks or grenades to bypass enemies" (Wikipedia). c. Ours: the unarmed hero who wins with a thrown thing and the creatures' own habits. d. Not
  copied: death, guns, grenades, possession.
- **Undertale** (Toby Fox 2015; Block 4 #85; post-2005). a. Loved: "it's entirely possible for the player to make their way through Undertale without
  harming a soul ... The important part was in choosing not to hurt" (Joel Couture, Game Developer, 27 Oct 2015:
  https://www.gamedeveloper.com/design/how-i-undertale-i-makes-you-think-hard-before-killing-monsters). b. Taught: Toriel "served to mock the aggressive
  tutorials found in many contemporary games"; Fox: "if you do things without effort, then it doesn't feel meaningful" (https://www.pcgamer.com/the-making-of-undertale/).
  c. Ours: "drive off" means "send home to bed", and it takes thought, not a blow (the hand build punched them: protoStage.ts:2432-2448). d. Not copied: menus, bullet-hell, the dark routes.
**The arc** (one prowler at a time first; the shelf is the safe place: its edge is above OCELOT's 80 px `tall` sight)
| # | Token | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | A | The hollow's rim; rings of glowing pawprints below; one prowler pads through a spore puff on its own, yawns and wanders off (SHOWN); Dot's teach 800 px+ before beat 1 (rule 6) | Watches | "It fell asleep walking!" |
| 1 | Tf1&:&ocelot*1!:#spore | THE FIRST THROW, SAFE: a high shelf with a pebble pile; below, one prowler circles past a spore patch | Takes a pebble, throws it into the patch; the prowler goes to look; puff; home | "Off you go!" |
| 2 | Pg1&< | Down on the floor in the dark: stand still and the glowworms (3-1) show where the next patch is; a prowler comes round | Freezes as it passes (it loses a still sloth), then throws | "Shh... now." |
| 3 | Xr1&:&ocelot*2! | Two prowlers circling under the roof roots; the pile and the throwing shelf are across the hollow (hands full, he can't hang: the kit's carry rule, so he crosses empty-handed); they never look up (3-2) | Hangs over them to the far shelf, takes a pebble, throws twice | "Right over their heads" |
| 5 | Pc1^ | Up the root wall to a ledge of glowing fungus; petals (after R 4) | Climbs | "Ahh" |
| 6 | Wg1&:&ocelot*1z | TWIST, THE SLEEPER: a prowler asleep across the way; a pebble's noise WAKES it (noise wakes sleepers), then the next draws it to the patch | Wakes it on purpose from far off, then sends it home | "Wake up... and go to bed!" |
| 8 | Cf1&:&ocelot*2! | Two patches on different beats, two prowlers circling at once; throw at the patch that is about to puff (its glow is the warn) (after R 7) | Times the throw to the puff | "Not that one... THAT one" |
| 10 | Sg1&:&ocelot*3! | SIGNATURE, THE GRANDFATHER PUFFBALL: the last three circle a giant puffball in the great hollow; it swells on its own slow beat (a spore zone, no new trigger); climb the stalagmite above it and throw ONE pebble as it swells: all three come to look, FLOOMP, the hollow fills, all three yawn off together (after R 9) | One throw, on the swell | "Goodnight, everybody!" |
| 11 | E | Their prints lead away into the dark; the shrine | Walks off | "Sleep tight" |
**Node string** (checkCode: no errors): `A Tf1&:&ocelot*1!:#spore Pg1&< Xr1&:&ocelot*2! R Pc1^ Wg1&:&ocelot*1z R Cf1&:&ocelot*2! R Sg1&:&ocelot*3! E` (12
tokens; f 2, g 2, r 1, c 1 of 6 content, S outside the mix). **Goal** "Send 8 prowlers home" (10 laid; Easy round(0.6 x 8) = 5, pipeline.ts:423).
**Targets** Normal **24.5** (20 + T[2] 4.5); Easy **<= 14.7**. Meter form: a prowler in reach log2(1 + 1 s / tell 0.5) = 1.58 (DIFFICULTY.md:16); the C beat's
throw-to-puff a timed window, log2(1 + cycle / open window) (:18), flown by the designer (rule 24: a throw at every frame x every phase of the spore clock;
NOISE.dur 4.5 s > the 4.2 s clear gap of a 6.4/2.2 patch, so a prowler already at the patch is always caught, a far one is not: the dial).
**Engine.** WIRED: OCELOT + castPlay (stillness, landing noise), the core lure rule, the kit pebble/pile/throw and gen2 kit rooms, spores, glowworms,
ropes. EXISTS-UNWIRED: `thrownNoise` and TAUGHT.noise 3. BASE (not counted, PICKS-29-32 "Foundations first"): ENG-W3a's World 3 kit. **NEW 1 the cast hears a
thrown pebble and sleeps in spores** (M, 2-3 h; castPlay.ts takes the kit's thrown landings as heroNoise `thrownNoise` -> core `hear`; a new Way 'spore'
(predators/types.ts Way, roster.ts TAUGHT.spore 3), OCELOT.beatenBy.spore `{ ends: 'chasedOff' }` (world3.ts): a cast member in a cloud over DROWSY_MIN
yawns and leaves away from it; toy: one ocelot, one pile, one patch on a stageTable row, cleared; RED with the zone taken out). **NEW 2 bot skill
`lure-to-spores`** (S-M, 1-2 h; tools/inspect/firsttimer.ts SKILLS; planted toy RED without it). Art: the yawn-and-pad-home cel, glowing prints (code glow).
**Different:** 3-1 he makes light by keeping still; 3-2 he hides from what the light shows; 3-3 he ACTS on the dark's hunters for the first time, from a
distance, and 2-9's song is gone (no beat). The hand build's punches go (new replaces old).

---
## 3-4 The Sinkhole: "Climb the Moonlight"
**One idea:** "The moonbeam swings from wall to wall; where it touches, the moonflowers open into steps: climb in the light." A player says: "the one where
the flowers open in the moonlight."
**Why it's fun for a sloth on a phone:** a calm, beautiful climb after the busy hollow (World 3's breather: slot 3.5 < 4.5 and 6). The only question is
WHEN, and the answer is drawn in light: the beam comes, the wall blooms, he climbs; it leaves, the flowers droop shut (a 1.0 s warning) and he waits on
stone. A sloth climbs slowly toward the moon: patience is the skill. Upright (412 x 915) is made for a shaft: the beam, his storey and the next fit (to
prove); sideways the camera must show the storey above before he leaves stone (the risk to shoot first).
**Tributes (Rainbow Islands is the one from anywhere)**
- **Rainbow Islands** (Taito 1987; pre-1990; lesser-known in the West). a. Loved: "The original Rainbow Islands is, without question, one of the greatest
  platform games ever made. The vertical rainbow-fuelled play is unique" (https://www.gamesradar.com/rainbow-islands-revolution-2/). b. Taught: one verb,
  up: rainbows "act as weapons, makeshift platforms, and item collectors", and "the player must get to the top before the sea level rises"
  (https://en.wikipedia.org/wiki/Rainbow_Islands). c. Ours: steps made of light that last only while the light does; the climb is the whole stage. d. Not
  copied: making the steps yourself, the rising sea, the weapons.
- **Sea of Stars** (Sabotage 2023; Block 4 #98; post-2005). a. Loved: GamesRadar: "Observe the way glowing flowers light the way in an underground cavern,
  for example, casting real-time shadows" (https://www.gamesradar.com/sea-of-stars-review/). b. Taught: PC Gamer watched "the shadows rotating and the sun
  and moon swapping places ... Manipulating the time of day will be key to solving puzzles"
  (https://www.pcgamer.com/sea-of-stars-is-a-gorgeous-retro-rpg-from-the-makers-of-the-messenger/). c. Ours: the moon's light moves and the world answers it;
  we don't hand him the moon, we make him wait for it (the patience world). d. Not copied: turning the time yourself, the turn-based fights.
- **Celeste** (2018; Block 4 #89; the famous few, the only one here). a. Loved: "Celeste is a game that feels designed to accommodate people who can't
  complete those games ... the difficulty does relent. You will finish this game" (https://www.pcgamer.com/celeste-review/). b. Taught: "Celeste never stops
  adding modifiers to its simple two-button platforming schematic" (same): each storey here adds one thing to the beam. c. Ours: a mountain climb that is
  hard for Normal and kind on Easy (wider beam, slower swing), every fall soft below a lit gap. d. Not copied: the dash, death as the teacher.
**The arc** (the tower: storeys climb the shaft both ways; turns = roots or the overhang)
| # | Token | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | A | The sinkhole floor, pitch dark; the prowlers' prints lead off (3-3); stand still and the glowworms show the first roots (3-1); far above, the moon's edge | Looks up | "It's so high" |
| 1 | Uc1^ | Root wall to the first ledge (a known climb) | Climbs | "Up we go" |
| 2 | Tp1^:#soft | THE FIRST MOONFLOWERS, SAFE: the beam rests on one wall and three flowers open into steps; moss below (soft) | Hops up them in the light | "They opened for me!" |
| 3 | Pf1^ | Stone ledges and one flower; the beam swings off and the flower droops shut behind him | Waits on stone for it to come back | "Wait for the moon" |
| 5 | Xp1^ | The beam swings wall to wall each storey; cross on the far wall's flowers while it is there (after R 4) | Rides the swing across | "Now this side... now that" |
| 7 | Pc1^ | The overhang: hang under its roots (3-2) to the far wall in the dark, petals in the moss (after R 6) | Creeps across | "Just hang on" |
| 8 | Wp1^ | TWIST, THE MOON RISES: the lit patch now climbs UP the wall; flowers open above him and close below: keep up with the light | Climbs with the light | "Don't let it leave me!" |
| 10 | Cf1^ | Stone and flowers mixed, the beam swinging AND rising, a prowler's eyes on the rim (it never comes down) (after R 9) | Reads the light, picks the stone | "I know this now" |
| 12 | Sp1^ | SIGNATURE, THE FULL MOON: the moon comes over the mouth and the WHOLE wall blooms at once, a stair of flowers to the rim; the camera pulls up to the moon (after R 11) | Climbs out into the moonlight | "The whole wall bloomed!" |
| 13 | E | The rim, the shrine in the moonlight | Walks off | "We made it out" |
**Node string** (checkCode: no errors, trend up): `A Uc1^ Tp1^:#soft Pf1^ R Xp1^ R Pc1^ Wp1^ R Cf1^ R Sp1^ E` (14 tokens; p = beat pieces on a clock, here
the flowers on the beam's clock: 3 of 7, the cap; no neighbours share).
**Targets** Normal **23.5** (20 + T[3] 3.5: the breather); Easy **<= 14.1**. Meter: a flower is a timed platform, log2(1 + sweep period / its open window)
(DIFFICULTY.md:18); stakes: a fall is soft unless the far side was lit when he left (lantern.ts:11-14's rule, Normal only). The built stage's meter decides; the dial is the sweep period.
**Engine.** WIRED: gen2's tower ascent, dark zones + glowworms, ropes, the lit-fall rule (World 8), the moonflower bud's look. **NEW 1 the moonbeam and its
flowers** (M, 3-4 h; zones.ts: a dark-zone light that moves on a clock, `path` {from, to, period, phase}, drawn as a soft slanted shaft (zoneArt.ts); a
moonflower STEP: a platform solid while a light reaches it, opening 0.4 s, a 1.0 s droop warning; engine.ts reads it like a crumble's solidity; laid by the
World 3 kit's tower storeys; toy: one storey, one beam, three flowers on a stageTable row; RED with the beam stopped away). **NEW 2 bot skill
`wait-for-light`** (S, 1 h; firsttimer.ts; toy RED without it; the tower route bots already climb). Art: open/closed moonflower steps against Pokey's 89.1 drawn
height (D41; the 8-x bud is a puzzle output, these are World 3's own wall flowers, rule 9), the moon over the mouth (Hugging Face, the lead's call).
**Different:** 3-1's light is SUMMONED (stand still), 3-4's MOVES on its own and makes the ground; the first ascent of World 3; no creature to beat (a
breather); no lift or wheel carries him: he follows the light.

---
## 3-5 Sleeping Vines: "The Quiet Way Down"
**One idea:** "Go down the quiet way: climb, hang, land on moss; one hard landing and the old vines wake." A player says: "the one where you have to be
quiet past the sleeping vines."
**Why it's fun for a sloth on a phone:** the slow way IS the safe way: every big drop a hurried player takes wakes a vine, and every root a patient sloth
climbs down keeps them snoring. The tension is held breath, not reflex: the thumb's whole job is choosing HOW to go down. The vines are asleep (eyes shut,
a slow "z"), so the danger is plain on screen (rule 10). A woken vine looks (the lash rule as built), and standing still while it looks is safe (3-1's
stillness), so a mistake costs a fright and a wait, a heart only if he keeps moving in reach (Normal's bite). Upright shows down the shaft; sideways the row
of vines; the moss must read as moss at both (to prove).
**Tributes (Metal Gear is the one from anywhere)**
- **Metal Gear** (Konami 1987, MSX2; pre-1990; the original is the lesser-known one). a. Loved: Kojima: a "combat game without fighting ... Thus the idea of a
  'hiding' game was born. 'This could be revolutionary, I thought'" (https://www.gamedeveloper.com/game-platforms/gdc-how-kojima-defied-the-impossible-throughout-i-metal-gear-i-s-history).
  b. Taught: "reworked under Kojima to focus on avoiding enemies ... with an emphasis on evasion similar to Pac-Man (1980)"
  (https://en.wikipedia.org/wiki/Metal_Gear_(video_game)); [S] its sleeping guards. c. Ours: the hero who wins by not being noticed at all. d. Not copied:
  guns, alarms, the base.
- **Oddworld: Abe's Oddysee** (1997; Block 3 #52; lesser-known; a NEW reason, pitch.md step 4: here the tiptoe, in 3-3 the thrown lure). a. Loved: "a bubbling
  stew of AI variables" to negotiate (GamesRadar, above). b. Taught: Abe can "tiptoe to avoid disturbing enemies, adding a stealth element", and "Slogs will
  bark loudly if they hear the player" (Wikipedia, above). c. Ours: tiptoe without a tiptoe button: his noise is how far he falls, so the quiet move is the
  climb, the hang and the moss. d. Not copied: a sneak button, death.
- **Metroid Dread** (MercurySteam/Nintendo 2021; Block 4 #95; post-2005). a. Loved: "Dread captures a sense of uncertainty through its world structure and
  sound design" (https://www.gamesradar.com/metroid-dread-review/). b. Taught: "Make a noise and a ring around Samus' waist appears, pulsing yellow to show
  that the E.M.M.I. is tracking her. It's coming" (https://www.gamesradar.com/metroid-dread-preview-e3-2021/): the noise is SHOWN. c. Ours: a hard landing
  draws a ring of sound in the dark that reaches the vines it wakes (the radius heroNoise already computes), so a child sees why. d. Not copied: the chase,
  the instant death, the terror.
Shelf note: INSPIRED-BY.md #22 "Sound stealth | Thief (1998) | IN | 1-7 and World 3": the moss twist (beat 6) is our nod to its moss [S]; Thief is not one
of the three (B's one-from-anywhere is Metal Gear).
**The arc** (a descent into the vine chasm; every first is safe)
| # | Token | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | A | The lip of the chasm; old vines hang asleep below, snoring; a stone drops from the roof, CLACK, the nearest vine opens an eye, looks, dozes (SHOWN); Dot 800 px+ before beat 1 | Watches | "Shhh..." |
| 1 | Tg1&:&thornvine*1z | THE FIRST VINE, SAFE: a ledge with a big drop beside one sleeping vine (it can't reach the ledge) and a root down beside it | Climbs down the root; (a drop wakes it, it looks, nothing reaches him) | "The slow way's the quiet way" |
| 2 | Dc1_ | Down the roots past two sleepers, close enough to see them breathe | Climbs down | "Don't wake up..." |
| 3 | Pg1< | Steps down a stair of little ledges (each fall under 200 px: silent) and one big one with a root | Small steps, the root at the big one | "Little steps" |
| 5 | Xr1&:&thornvine*3z | A row of three: hang along the roof roots (3-2) between their stems, above their sleeping buds (no landing, no noise; above the bud is out of reach, thornVine.ts inReach); let go only past the last (after R 4) | Creeps over their faces | "Right over them" |
| 7 | Wm1< | TWIST, THE MOSS: thick glowing moss on some ledges: a big drop onto moss makes no sound; the fast way is quiet where the moss grows (after R 6) | Finds the moss, drops | "The moss caught me!" |
| 9 | Cc1_&:&thornvine*2z | Climb, moss, hang in one stretch, two vines close; if one wakes, freeze until it dozes (after R 8) | Chooses each way down | "Climb... drop... hang" |
| 11 | Sc1_&<:&thornvine*4z | SIGNATURE, THE VINE CURTAIN: the longest root in the grotto hangs down past a whole curtain of sleeping vines, faces inches away; he climbs down it, slowly, all the way (after R 10) | Holds his breath to the bottom | "They never woke up" |
| 12 | E | The chasm floor, the shrine; behind him, the snoring | Tiptoes off | "Goodnight, old vines" |
**Node string** (checkCode: no errors): `A Tg1&:&thornvine*1z Dc1_ Pg1< R Xr1&:&thornvine*3z R Wm1< R Cc1_&:&thornvine*2z R Sc1_&<:&thornvine*4z E` (13
tokens; m = the moss carpet, the cover letter's `carpet`; `thornvine` for the roster's `thornVine`: Pushback 1).
**Targets** Normal **26.0** (20 + T[4] 6); Easy **<= 15.6**. Meter: a sleeping vine 0.5, "a choice, no clock" (DIFFICULTY.md:17); a woken one a creature in
reach by its tell (:16); the drops a jump down by its share. Easy: wider moss, vines with shorter reach, a longer stir.
**Engine.** WIRED: thorn vines (look, lash, stillness, `below`), heroNoise's landing noise and its no-landing rule for a hang, ropes, glowworms.
EXISTS-UNWIRED: heroNoise `sound` (a sleeper in reach wakes) reaches only the cast (castPlay.ts:155-163), not the vines (engine.ts stepThornVines); vines
sleep on a clock. **NEW 1 the sleeper vine** (M, 2-4 h; thornVine.ts `sleeper: true`: asleep until a noise in its hearing (his landing over 200 px, a
punch, a thrown landing) wakes it; then stir 1.0 s, look `look` s with today's lash, then asleep again; a landing on a moss-carpet platform makes no noise
(heroNoise landingNoise reads the ground's kind); the sound ring drawn at the landing (Dread's ring, a code-drawn touch); files thornVine.ts, heroNoise.ts,
engine.ts, castPlay.ts hands the landing on; toy: one sleeper by a 300 px drop and a root, the drop wakes it and the climb doesn't; RED with the hand-off
removed). **NEW 2 bot skill `quiet`** (S-M, 1-2 h; near a sleeper climb or hang, never drop over 200 px except onto moss; toy RED without it).
**Different:** the hand build's vines woke on a CLOCK and the answer was a bell or a pebble (protoStage.ts:2636-2660); these sleep until HE is loud, and
the answer is how he moves. First descent in World 3 (3-4 went up); the first stage whose danger is his own noise.

---
## Foundations and order (D40)
All three stand on ENG-W3a (World 3's kit) and W3-ART (PICKS-29-32 "Foundations first"). 3-3's NEW 1 (the cast hears a thrown thing) also serves 3-5's
NEW 1 (one hand-off of noises from the kit to the listeners): build 3-3's first and 3-5 reuses the hand-off. None patches something planned to be replaced.

## Method used, lessons applied, gates
- **Method:** pitch.md (main + step 2b on cdd01e7b); level.md's Building rules 1, 6, 7, 8, 10, 21, 24 read into the beats (one sentence, teach
  800 px+ before, first is safe, one upright screen, the name on screen, bot skills proven on a toy, fly the timing before building).
- **Lessons applied:** D58 (each tribute: loved, taught, ours, not copied, cited), D34/law 3 (every fact file:line on main 6e7b85f8), D30 (times from
  `date`), D40 (foundations named, nothing patched that is planned away), D41 (art against the 89.1 drawn height), D36 (own branch, `git status -sb`).
- **Gates on this head:** `node tools/roadmapcheck.mjs` PASS (after `git fetch --unshallow` + all refs), `node tools/perf/knowncheck.mjs` PASS, `npx tsc
  --noEmit -p .` 0, `npx tsx tools/engine/generalitycheck.ts` PASS, `npx tsx reference/specs/sims/nodes3335b.ts` exit 0.
- **Method update (proposed, pitch.md step 2):** "WebFetch may refuse an allowed host (gamesradar.com: ENOTFOUND, 11-19) where curl through the proxy
  answers 200: fetch with curl and grep the page text, and quote from that." Step 4 for B: see Pushback 2.

## Learned
- Read the CAST's own hear rule before pitching a lure: core.ts rules thrown noise, but nothing in the game calls `thrownNoise`, so a lure stage costs a NEW.
- V11's cap is round(0.4 x content nodes) and S never counts (nodeCode.ts:322-330); marks go in order JOB content move shape find creatures tempo.
- WebFetch could not reach gamesradar.com here (ENOTFOUND) while curl through the proxy got 200: open pages with curl and grep the text for the quote.

## Pushback
1. **The threat dial refuses camelCase cast ids** (nodeCode.ts:91, `/^([a-z][a-z0-9_-]*).../`): `thornVine`, `grottoEyes`, `riverGuard`, `capuchinThief`
   (roster.ts:11-18) can't be named in a node. Ready packet (Engine, S): the dial accepts the roster's ids as written, a test per kind in CASTS; until
   then designers write lower case and the deal can't match them (rule 22: fix the grammar, not the name).
2. **The shelf for B can't satisfy "pre-1990" from Blocks 3-4** (none is older than 1997): every pre-1990 tribute is B's one-from-anywhere, so B can never
   add a modern outsider. Method edit: "for the open lens, the pre-1990 game is the one from anywhere, or a second may come from Blocks 1-2". And Block 3
   holds one stealth game (Abe), used twice here for different reasons; the lead may swap 3-5's for Thief (INSPIRED-BY #22) if the rule allows two outsiders.
3. **The packet's environment:** started in Default (the lead said so at 6:13 PM ET); the allowed hosts answered, so nothing was blocked.
