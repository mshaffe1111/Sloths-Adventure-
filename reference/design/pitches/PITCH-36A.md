# PITCH-36A (fixed lens): 3-6, 3-7, 3-8, 3-9 and the hidden stage. Pitcher A, written 6:49 PM ET 11-19 (by `date` in the same command). Base origin/main 6e7b85f8f.
Read: the packet, pitch.md (whole), level.md, LAWS, LESSONS, roles README + DESIGNER card, 2-4.md (the bar, origin/t-design-24), GAME-MAP §3 + §4
World 3 (origin/t-design-game-map), WORLD-3-PLAN (origin/t-plan-w3), 3-1.md + 3-2.md (origin/t-design-31-32), PICKS-33-35 (lead branch 560630bd2),
PITCH-33A for the form. NOT read: t-pitch-36b. Node strings: `npx tsx reference/specs/sims/nodes3639.ts` (all five: "checkCode: no errors").
Every file:line is origin/main unless it names a branch. Numbers marked **closed-form** are NOT flown: the design that follows flies them (rule 24).
**The ladder these five finish** (World 3 = the patience world; its thread is LIGHT): 3-1 light SHOWS the way (stand still) -> 3-2 light
GIVES YOU AWAY -> 3-4 light MAKES the path (moonbeam) -> **3-6 you CARRY the light** (and throw it ahead) -> **3-7 no light helps: LISTEN**
(search by sound) -> **3-8 the liana HIDES you** (the vines' beat) -> **3-9 light is your WEAPON** (the jaguar flees it; the guardian's rule
previewed). Its quiet thread: 3-3 noise calls, 3-5 noise wakes, **3-7 your quiet lets you hear**. The hidden stage is the grotto at speed.
Difficulty (pasted, DIFFICULTY.md:62-63): "**World band** [10w - 11, 10w + 1]" = 19-31; "**Slots:** target(w, s) = 10(w - 1) + T[s], T = [-0.5,
3, 4.5, 3.5, 6, 5, 8, 7, 10]"; "Normal targets; Easy at most 0.6 x Normal" (:61). So **3-6 25** (Easy <= 15), **3-7 28** (<= 16.8), **3-8 27**
(<= 16.2), **3-9 30** (<= 18). The hidden stage has NO slot (T covers stages 1-9; "Guardians are scored on their own", :65): Pushback 1.

## 3-6 Grandma's Things (relic_hunt 5, right): "Toss the glow cap ahead: what it lights is there"
**One idea:** "Grandma's glow cap lights a little circle and you can't jump while you hold it: toss it ahead, and where it lands the hidden
shelves and her marked ferns appear." A player says: "the one where you throw the glowing mushroom to see where to jump."
**The hook:** in 3-1 he waited for light; here he PUTS it where he needs it. The rule that makes it a game is the one already in code: a
thing in his hands means no jump (puzzlePlay.ts:704: "a press of the other two while carrying is never a jump or a kick"), so every gap is
a small plan: light it, then go, then fetch the light. Grandma's things wait in Hush Ferns, and a fern that hides one shows a carved
fern-stone only in a glowing thing's light (puzzleKit.ts:89-90, `look: 'fernStone'`): the light is also the search.
**Tributes** (lead from Blocks 1-2: Castlevania, Mega Man X; one from anywhere: Adventure)
- **Adventure** (Atari 2600, 1980; the pre-1990 and lesser-known pick). a. Loved: Warren Robinett (Game Developer, Alex Wawro, 5 Mar 2015):
  "I liked the idea of staying in real-time, so I made it so you can only carry one object at a time"
  (https://www.gamedeveloper.com/design/warren-robinett-reflects-on-his-signature-game-i-adventure-i-); the hidden room is "my signature"
  (same page). b. Taught: the key lies in the first room beside its locked gate [S]. c. Ours: one thing in his paws changes what his thumb
  does; the puzzle is when to let go of it. d. Not copied: the dragons, the bat that steals.
- **Castlevania** (NES, 1986, Block 1 #7). a. Loved: Edge (GamesRadar): "A Castlevania castle contained heart-holding candelabras and
  breakable walls" (https://www.gamesradar.com/creating-draculas-castle-castlevania/): the lights themselves hold the treasure. b. Taught:
  the first candle is in the first screen, at whip height [S]. c. Ours: the light is the search; the fern-stone shows only in the cap's
  glow. d. Not copied: the whip, hearts as ammo.
- **Mega Man X** (SNES, 1993, Block 2 #35). a. Loved: GamesRadar (Chris Antista): "hidden secrets that make revisiting levels awesome"
  (https://www.gamesradar.com/mega-man-x-full-access-playthrough/). b. Taught: the first capsule sits in plain sight on the main path [S].
  c. Ours: the first keepsake is on the path, lit by the first carry; the fifth asks for every trick. d. Not copied: armour, bosses.
**The arc** (Normal s; flags and hearts by the live rule, pipeline.ts ROLLED_FLAGS, D49)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | Grandma's cap patch: a clump of glow caps by the entrance, always lit; Dot's teach 800 px+ before beat 1 (rule 6) | Picks one up | "It glows!" |
| 1 | **Teach: carry, then toss** (T g1+, safe) | 18 | (shown) walking with the cap lights a fern: its fern-stone glows; (check) a moss dip 150 px wide whose far rim is a light-only ledge, moss under it | Crouches by the marked fern (keepsake 1, 0.9 s, engine.ts:244); tosses the cap over, the ledge appears, hops, fetches | "Throw the light, then jump!" |
| 2 | Shelves (P f1) | 10 | Light-only ledges over moss, two tosses | Toss, hop, fetch | "Light, jump, grab" |
| 3 | **Toss UP** (P c1^+) | 14 | A dark root wall: the light-only ledge is above; a flick up throws high (THROW.up) | Throws up, climbs to it (hands free), keepsake 2 by the cap where it landed | "Up it goes" |
| 4 | **TEST: the dark gallery** (X f1) + flag, R | 18+6 | Three light-only ledges over thorns; the cap patch before it (a lost cap regrows there) | Toss, jump, fetch x3; a short toss lights the wrong spot | "Careful... now" |
| 5 | **TWIST: wake the worms** (W g1+) + R | 18+6 | A wide gallery of sleeping glowworms (a lamp wakes those it reaches, engine.ts:8828-8837); ferns all round | Tosses the cap among them: the whole gallery wakes and STAYS lit: free hands, two marked ferns at once (keepsake 3) | "I lit the whole cave!" |
| 6 | Mushroom bounce (P b1) | 8 | A springy cap to the upper gallery | Bounces | "Boing" |
| 7 | **COMBINE: the long dark** (C f1+) + flag, R, heart after | 26+6 | Light-only ledges up and over; one glowworm patch to wake on the way; a marked fern on a ledge only a toss UP reveals (keepsake 4) | Chooses: toss ahead, or wake the patch | "I know this" |
| 8 | **SIGNATURE: Grandma's lamp** (S g1+) | 18 | Grandma's old lamp, a hollow giant cap in the wall, dark, in view from beat 7 | Throws his cap into it: the cave lights in her colours, the way to the shrine and her last fern (keepsake 5) | "She made this!" |
| 9 | Exit (E) | 8 | The shrine | Walks in her light | "Thank you, Grandma" |
**Node string** (checkCode: no errors, 13 tokens, mini 6): `A Tg1+<:#dark:+keepsake Pf1>:#dark Pc1^+<:#dark:+keepsake Xf1>:#dark R Wg1+<:#dark:+keepsake R Pb1> Cf1+>:#dark:+keepsake R Sg1+<:#dark:+keepsake E`
**Numbers to fly** (closed-form from THROW, puzzleKit.ts:278-286: fwd vx 480 vy -320, up vx 100 vy -820, g 1500, from 70 px up): a toss
forward lands about 290 px ahead on the flat; a toss up peaks about 290 px over his feet; the cap lights 230 px (puzzleKit.ts:56). So a
lit ledge sits 150-250 px out and the far rim stays in the circle. A lost cap regrows at the last patch (NEW 1); never a heart for a cap.
**Engine** (checked). WIRED: the glowing mushroom (puzzleKit.ts:43-44, :56), the light-only ledge and the fern-stone mark (:87-90), throw
up/forward (:278-286), no jump while carrying (puzzlePlay.ts:704), a lamp wakes glowworms carried or set down (engine.ts:8828-8837), Hush Fern
search (engine.ts:244-245). UNWIRED: all of it lives in the puzzle kit's rooms (kitStage.ts:217), not in a gen2 stage. FOUNDATION: F1
ENG-W3a, F2 ENG-DARK. **NEW 1 ENG-LIGHT** (M, PLAN-W3 D5; gen2/worlds/w3.ts + a lay file): the cap, its patch (regrows a lost cap) and
light-only ledges/marks as gen2 bricks, with the verdict "every light-only ledge is lit by a toss from a stand within its reach", the toss
arcs flown. **NEW 2 bot skill `toss-light`** (S, firsttimer.ts SKILLS): toss to the dark rim, cross, fetch; plant: no toss -> stuck (RED).
**Builds in under 2 h once** F1, F2, ENG-LIGHT and toss-light exist and W3-ART-2's cap is labelled.
**Differs:** 3-1 waits for light, 3-2 hides from it, 3-4 climbs in light that moves by itself; here he moves the light. 2-2 (gather) and
2-3/2-8 (rescue) search in daylight; 1-5's keepsake is a crouch at a fern you can see. Kept GAME-MAP's cap and "no firefly"; added the toss
(the no-jump rule makes it a plan), the fern-stone as the search, Grandma's lamp.

## 3-7 Which Fern? (relic_hunt 6, LEFT): "Walk soft and listen: the right fern rustles"
**One idea:** "Every fern looks the same, but the one hiding Grandma's thing rustles when you walk past it softly; run and your own feet
drown it out." A player says: "the one where you have to tiptoe to hear which fern it is."
**The hook:** 3-6 found things by light; 3-7 takes the light away (no fern-stones) and asks him to use World 3's other sense. It turns
3-5's lesson round: there, his noise was the danger; here, his quiet is the tool. Running LEFT, back out of the grotto, also turns the
camera. The script's own clue (GAME-MAP §4: "crouch by the right fern and it rustles", STORY-REWRITE:387-395) becomes a walk, not a guess.
**Tributes** (lead from Block 1: Pitfall!, Kung-Fu Master; Super Mario Bros. 3 is the one famous title)
- **Pitfall!** (Atari 2600, 1982, Block 1 #1; the pre-1990 pick, NEW reason: the treasure hunt, not the vine). a. Loved: David Crane (Game
  Developer, Christian Nutt): "since you are collecting gold in what might be an African jungle"
  (https://www.gamedeveloper.com/game-platforms/-i-pitfall-i-s-david-crane-on-his-most-famous-game-and-how-atari-2600-dev-worked); Matt's
  list: "an unprecedented sense of vast, jungle-spanning adventure and treasure-hunting". b. Taught: the clock and the screens; experts
  learn to run left [S]. c. Ours: a treasure hunt that runs left on purpose. d. Not copied: the timer, the screens.
- **Kung-Fu Master** (arcade, 1984, Block 1 #4; the lesser-known pick). a. Loved: Ron Alpert (Game Developer, retro game of the day): it
  put "the player into a world of karate chops and leg sweeps from the moment you said 'okay go!'"
  (https://www.gamedeveloper.com/production/retro-game-of-the-day-kung-fu). b. Taught: the first floor walks right-to-left [S]. c. Ours:
  a level that faces the other way from the first step, with the camera led to the left. d. Not copied: the fighting.
- **Super Mario Bros. 3** (NES, 1988, Block 1 #15). a. Loved: GamesRadar (Justin Towell): "In no other Mario game do you crouch on a white
  piece of the background scenery for six seconds with the aim of dropping down behind it. It's not in the instructions"
  (https://www.gamesradar.com/gamings-most-secret-secrets/). b. Taught: never (that is the point). c. Ours: the crouch IS taught (rule 7),
  and the clue is a sound you can learn, so a child finds it too; the hidden stage door is the one secret kept. d. Not copied: the whistle.
**The arc** (Normal s; travel LEFT; flags and hearts by the live rule)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | A fern hall, every fern the same; Dot's teach 800 px+ before beat 1 | Looks | "They're all the same!" |
| 1 | **Teach: walk soft, listen** (T g1+, safe) | 16 | Three ferns; the middle one rustles (sway + a leaf-shiver sound) as he walks by; running past, none do | Walks, hears, crouches (0.9 s): keepsake 1 | "That one moved!" |
| 2 | **A longer row** (P g1+) | 14 | Six ferns; one rustles | Walks the row soft: keepsake 2 | "Shh... there" |
| 3 | Shelves (P f1) | 10 | Floating shelves left | A breath | "Onward" |
| 4 | **TEST: listen between puffs** (X g1+, #spore@puff) + flag, R | 18+6 | A fern row under sleepy mushrooms (3-1's puffs: drowsy if caught) | Hurries between puffs, walks soft at the ferns: keepsake 3 | "Hurry... then hush" |
| 5 | Down a root (P c1_) | 10 | Climb down (straight down always climbs) | Climbs | "Slow" |
| 6 | **TWIST: listen while hanging** (W r1+) + R | 18+6 | Ferns on ledges under the roof; the only way past is 3-2's roof root, the quietest he can be | Creeps; a fern rustles beside his paws; lets go onto its ledge: keepsake 4 | "I heard it from up here!" |
| 7 | **HIDDEN: the guarana fern** (H r1+) | 8 | Off the route: a root to a fern high in a side cave, rustling | Creeps out, crouches: the golden guarana, the Cave Slide's door | "What's this?" |
| 8 | **COMBINE: ferns are cover** (C m1+&) + flag, R, heart after | 24+6 | Two ocelots pace the fern hall (ferns are cover, rule m); one fern rustles | Walks soft fern to fern, freezes in one when a head turns; keepsake 5 | "Hide AND listen" |
| 9 | **SIGNATURE: the singing ferns** (S g1+) | 18 | A great hollow full of ferns: when he stands still, the cave's draught moves them all, except Grandma's, which rustles to its own tune | Waits, picks the one out of time: keepsake 6 | "That one's different!" |
| 10 | Exit (E) | 8 | The shrine at the grotto's side door | Walks out | "All six!" |
**Node string** (checkCode: no errors, 14 tokens, mini 7, creatures): `A Tg1+<:+keepsake Pg1+<:+keepsake Pf1> Xg1+>:#spore@puff:+keepsake R Pc1_< Wr1+<:#dark:+keepsake R Hr1+<:+guarana Cm1+&>:&ocelot*2:+keepsake R Sg1+<:+keepsake E`
**Numbers to fly:** the rustle radius (propose 160 px), the quiet speed (propose: at or under the walk, the same "quiet feet" line 1-7
taught; a run is loud), the rustle's period (propose 1.2 s, so a walk past 320 px of fern hears at least two). Decoy ferns: 3-5 per keepsake.
**Engine** (checked). WIRED: Hush Fern search (engine.ts:244-245), finds (finds.ts:1-6), cover (`m`, nodeLetters.ts:72, key now), the
ocelot (predators/world3.ts), spores (zones.ts), the root creep (rope.ts; 3-2's). FOUNDATION: running LEFT on a real row (ENG-27, packet
reference/packets/2026-11-20/ENG-27.md, built for 2-7), D2 ENG-ROOT (3-2's), F1, D3 ENG-SPORE. **NEW 1 ENG-FERN** (S, PLAN-W3 D6; finds.ts +
a gen2 fern brick): a fern holding a find rustles (sound + a 3-frame sway) when he is within the radius and at or under the quiet speed; no
'rustle' in finds.ts today (PLAN-W3 §1); plant: every fern rustles -> RED; bot skill `listen-walk` (walk past ferns, crouch at a rustle)
inside it. **NEW 2 the find that opens a stage** (S; the guarana writes a save flag the map reads; no hidden-stage code found: `grep -rln
"hiddenStage\|hidden stage" src/game` is empty). **Builds in under 2 h once** ENG-27, ENG-ROOT, ENG-FERN and NEW 2 exist.
**Differs:** 3-6 searches by sight (light); 3-7 by sound; 1-7 hid in bushes from eyes; 2-7 ran left on the river (a ride); this runs left
on foot, slowly. Kept GAME-MAP (left, crouch, rustle, the guarana by hanging); added: quiet decides whether you hear, the puffs as the test,
ferns as cover, the signature's out-of-time fern.

## 3-8 Thorn Vine Swing (vine_runner, right): "On the liana they can't see you"
**One idea:** "The old thorn vines lash anything that moves while they look, but a sloth on a swinging liana is the stillest thing in the
cave: swing and wait while they look, let go the moment they doze." A player says: "the one where you hang on the vine until the thorns
fall asleep."
**The hook:** the rule is already the game's (thornVine.ts:71-73: "a sloth hanging on a liana is the stillest thing in the forest, however
it swings: an old vine does not see him there (3-8: wait on the liana while the vine looks, and leap while it sleeps)"). Every swing level
so far asked WHERE to let go (1-6) or onto WHAT (2-4: a log); this one asks WHEN, on a clock that is not the swing's. Two clocks again, as
2-4, but one of them is a danger, and holding on is the safe choice: the patience world's swing.
**Tributes** (lead from Blocks 1-2: Bionic Commando, Super Castlevania IV; Jungle Hunt as the lesser-known)
- **Bionic Commando** (NES, 1988, Block 1 #11; the pre-1990 pick). a. Loved: Ron Alpert (Game Developer, 29 Mar 2010): "You cannot jump,
  instead you swing Tarzan-style with your bionic arm... A little tricky to learn, but quite fun and rewarding once you get the hang of it"
  (https://www.gamedeveloper.com/production/retro-game-of-the-day-bionic-commando). b. Taught: the first screen has a ledge only the arm
  reaches [S]. c. Ours: the swing is the safe place, and the skill is waiting on it. d. Not copied: the gun, the grapple aim.
- **Super Castlevania IV** (SNES, 1991, Block 2 #29). a. Loved: Ron Alpert (Game Developer): "you could now use it to key onto certain
  anchor points and swing around, somewhat, Indiana Jones style" (https://www.gamedeveloper.com/production/retro-game-of-the-day-super-castlevania-iv).
  b. Taught: the first hook is over a short pit [S]. c. Ours: a swing over danger, in a dark castle-like cave. d. Not copied: the whip.
- **Jungle Hunt** (arcade, 1982, Block 1 #2; NEW reason: ropes out of phase, not the first swing). a. Loved: Sam Loveridge (GamesRadar):
  "a level of ropes the character must swing across, then a crocodile-infested river" (https://www.gamesradar.com/best-atari-2600-games-all-time/).
  b. Taught: the first rope is close and slow [S]. c. Ours: the next liana and the vine between are two rhythms to line up. d. Not copied: the river.
**The arc** (Normal s; flags and hearts by the live rule)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | Lianas over a moss hollow, old vines snoring between them; Dot's teach 800 px+ before beat 1 | Watches one stir, look, doze | "It's waking up..." |
| 1 | **Teach: hold on while it looks** (T s1, safe) | 16 | Two lianas over a SOFT hollow (moss); one vine between, its look long | Swings; it looks (he is unseen); it dozes; lets go, catches | "It can't see me up here!" |
| 2 | **Again, a step on** (P s1) | 12 | Three lianas, two vines, staggered | Waits on each liana for its vine to doze | "Wait... go" |
| 3 | Floor (P g1) | 8 | Moss, petals | A breath | "Phew" |
| 4 | **TEST: over the thorns** (X s1) + flag, R | 18+6 | Four lianas over a thorn gap; vines with shorter sleeps | Waits, leaves on the first sweet spot in the sleep | "Now!" |
| 5 | Up a vine (P c1^) | 10 | Climb (straight up always climbs) | Climbs | "Up" |
| 6 | **TWIST: freeze on the ledge** (W f1) + R | 18+6 | A liana ends at a ledge INSIDE a vine's reach; the next liana beyond it | Lands, freezes while it looks (standing still is safe, thornVine.ts:74), walks on in the sleep | "Don't move..." |
| 7 | Mushroom bounce (P b1) | 8 | A cap up to the high lianas | Bounces | "Boing" |
| 8 | **COMBINE: liana, ledge, liana** (C f1) + flag, R, heart after | 24+6 | Lianas and freeze ledges in turn; two vines on different beats (Easy: one) | Reads both beats | "Hold, freeze, go" |
| 9 | **SIGNATURE: the long breath** (S s1) | 20 | The grotto's great hall: a dozen vines that all breathe together, a long sleep every cycle; a chain of six lianas under them | Hangs at the start until the whole roof sighs to sleep, then one unbroken swing run under them all | "GO GO GO!" |
| 10 | Exit (E) | 8 | The shrine | Lands soft | "Every one asleep" |
**Node string** (checkCode: no errors, 14 tokens, mini 8): `A Ts1<:#thorn@beat Ps1>:#thorn@beat Pg1< Xs1>:#thorn@beat R Pc1^< Wf1<:#thorn@beat R Pb1> Cf1>:#thorn@beat R Ss1>:#thorn@beat E`
(V11 caps `s` at 3 of 8 content nodes, so beats 6 and 8 are written `f`: their ledges; the realised roll lays lianas round them.)
**Numbers to fly:** the swing period is 2.85 s Normal, 3.3 Easy (physics.ts:534, :552); the old maker's vines stir 1.1 s and look 1.8 s
(protoStage.ts:2972); the lash winds up 0.3 s (thornVine.ts VINE.windup). The rule to prove on the real engine: **a vine's sleep >= one
swing period + the leap's air time**, so a player waiting on the liana always meets a sweet spot (sweetFrom -0.15 to sweetTo 0.9,
physics.ts:544-545) inside the sleep. Propose sleep 4.2 s Normal (closed-form: 2.85 + about 0.8 s of leap + margin), 5.0 s Easy.
**Engine** (checked). WIRED: lianas on gen2 (1-6, w1Swing.ts; stageTable.ts:47), the vine's rhythm and "swinging is unseen" (thornVine.ts:
65-74), standing still is unseen (:74), the old maker's thornChain hangs a vine over each leap's band (protoStage.ts:2960-2972).
FOUNDATION: F5 ENG-VINE. **NEW 1 ENG-THORNSWING** (S-M, PLAN-W3 D7): thornChain's lay as a gen2 brick + the verdict above + the signature's
shared offset (one long breath = the same offset and sleep on every vine of a set: data). **NEW 2 bot skill `wait-on-liana`** (S): hold the
swing while any vine in the next leap's band stirs or looks, leave on the first sweet spot in its sleep; plant: leave at once -> lashed
(RED). **Builds in under 2 h once** F5, ENG-THORNSWING and the skill exist.
**Differs:** 1-6 taught where to let go; 2-4 let go onto moving logs (two clocks, both friendly); 3-5 froze on the ground; here the danger
has the clock and the swing is the hiding place. Kept GAME-MAP (thorn vines on a beat, swing on the quiet beat); added: hold on while it
looks (already the code's rule), the freeze ledge (3-5 remixed), the long breath.

## 3-9 The Prowler's Ring (gauntlet, right): "Light drives them off"
**One idea:** "The prowlers and their jaguar circle you in the dark; everything the grotto taught gets you round the ring, and the glow cap
you learned to throw is what makes the jaguar run." A player says: "the one where you scare the jaguar off with the glowing mushroom."
**The hook:** World 3's last word on light. The jaguar flees light in the kit's own data (predators/world3.ts:29-30: `light: { ends:
'flees', seconds: 6 }`), and the Shadow Prowler guardian next cannot step into light (lairProwler.ts:3-4, the moon pools): 3-9 is where
the player learns, in a fair small form, the rule the guardian fight is built on (V, the boss preview, "at X-9 only", NODES.md §8.0).
Gauntlet: nothing new to learn (every piece is 3-1..3-8's), all of it at once, round a ring.
**Tributes** (lead from Block 1: Mega Man 2, Ghosts 'n Goblins; one from anywhere: Smurf: Rescue in Gargamel's Castle, Matt's favourite)
- **Mega Man 2** (NES, 1988, Block 1 #16; the pre-1990 pick; NEW reason: the finale remix). a. Loved / how it was built: Akira Kitamura
  (Game Developer, Christian Nutt, 10 Feb 2016): "the first half of the game would be the robot master stages, and the second would be the
  Wily stages"; "I would use differences in terrain and enemy placement to adjust the difficulty"
  (https://www.gamedeveloper.com/design/classic-i-mega-man-i-design-secrets-that-still-hold-up-today). b. Taught: Wily's stages bring back
  the masters' hazards, now together [S]. c. Ours: every World 3 lesson returns, each turned once, none new. d. Not copied: weapons, boss rush.
- **Ghosts 'n Goblins** (arcade, 1985, Block 1 #6). a. Loved: PC Gamer (Jody Macgregor, in "The 13 hardest PC games"): "One hit robbed you
  of your armor, leaving you in a pair of boxer shorts, and a second hit meant death" (https://www.pcgamer.com/hardest-pc-games/): the badge
  of honour. b. Taught: the graveyard's first zombies rise slowly [S]. c. Ours: the world's hardest stage (target 30), flags by the rule, so it
  is hard, never cruel. d. Not copied: one-hit armour, the second loop.
- **Smurf: Rescue in Gargamel's Castle** (ColecoVision, 1982; the lesser-known pick). a. Loved: Ron Alpert (Game Developer, 20 May 2010):
  "Smurf Rescue was simple, the control was a little loose... but no one cared"
  (https://www.gamedeveloper.com/production/retro-game-of-the-day-smurf-rescue): a simple journey to the villain's lair. b. Taught: the
  first screens are forest, the last the castle [S]. c. Ours: the last stage before the lair; the lair is in view at the end. d. Not copied:
  the rescue, the kill-anything grass.
**The arc** (Normal s; the ring: the route runs round the den, right along the floor, up, back along the roof, over the top; flags and
hearts by the live rule)
| # | Beat (token) | s | What is there (remixes) | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | Pawprints in a ring round a dark den (3-3's footprints); Dot: "Stay in the light" (800 px+) | Looks round | "We're surrounded" |
| 1 | Dark floor (P g1, #dark) | 12 | 3-1: stand still at a rim to wake the drop | Waits, drops | "I remember" |
| 2 | **Over their heads** (P r1&, #dark) | 14 | 3-2: a roof root over a prowler; a glowworm patch half way that would show him | Creeps, waits for the patch to fade | "Not in the glow..." |
| 3 | Up the moonbeam (P c1^) | 12 | 3-4: moonflower steps open where the beam passes | Climbs in the light | "Up we go" |
| 4 | **TEST: thorn swing** (X s1, #thorn@beat) + flag, R | 18+6 | 3-8: lianas past vines on a beat | Waits on the liana, leaves in the sleep | "Hold... go" |
| 5 | **Fern hall** (P m1&) | 14 | 3-7 + 3-5: ferns as cover, two prowlers, moss is silent, stone is loud | Moss to fern to fern | "Shhh" |
| 6 | **TWIST: throw the light** (W f1, #dark) + R | 18+6 | 3-6: light-only ledges; a prowler waits on the far one: the tossed cap lights the ledge AND sends the prowler off (light way) | Tosses, it backs off, jumps, fetches | "Light makes them run!" |
| 7 | Mushroom bounce (P b1) | 8 | Up to the roof | Bounces | "Boing" |
| 8 | **COMBINE: the chime and the root** (C r1&) + flag, R, heart after | 26+6 | 3-3 + 3-2: rings the chime (the prowlers go to look, into the spores) then creeps the root over the empty floor | Rings, waits, creeps | "Off you go" |
| 9 | **PREVIEW: the jaguar** (V g1&, #dark) + R | 16+6 | The jaguar drops from the roof where he WAS (habit drop, world3.ts:26); a cap patch beside him | Picks a cap: the jaguar flees the light for 6 s; he walks past | "It's scared of the light!" |
| 10 | **SIGNATURE: the ring breaks** (S g1&) | 20 | The den's mouth: the jaguar circles; his one cap; the shrine on the far side | Holds the cap high and walks through the ring of eyes; they part | "Out of my way!" |
| 11 | Exit (E) | 8 | The shrine; beyond it, the lair's moonlight | Breathes | "Next: the Shadow Prowler" |
**Node string** (checkCode: no errors, 16 tokens, mini 9, creatures, no teach): `A Pg1<:#dark Pr1&<:#dark:&ocelot*1 Pc1^> Xs1>:#thorn@beat R Pm1&<:&ocelot*2 Wf1>:#dark R Pb1> Cr1&>:#dark:&ocelot*2 R Vg1&<:#dark:&jaguar*1 R Sg1&<:#dark:&jaguar*1 E`
**First appearances:** the jaguar is met here first (the world's last stage, one new creature, as PITCH-33A held it back); its `first:
'trap'` (world3.ts:32) becomes `first: 'light'` for World 3 (data, Pushback 2); the light way is shown on a prowler first (beat 6) with
Dot's line, then on the jaguar (beat 9), so its first meeting is with the tool in reach (rule 7).
**Engine** (checked). WIRED: every piece of 3-1..3-8 once built; the jaguar (world3.ts:25-33: drop habit, flees light 6 s); `beat(def, s,
'light', t)` is tested in the core (predatorCore.test.ts:147). NOT wired: nothing in castPlay.ts sends 'light' (grep: no caller), the same
gap PITCH-33A found for bell and punch noise. **NEW 1 the light way into the cast** (S, 1 h; castPlay.ts: a carried or tossed cap within
its light radius of a creature calls beat 'light'; best folded into ENG-NOISE as "ways into the cast", Pushback 3). **NEW 2 the V job on
gen2** (S; nodeLetters.ts:53 marks V later: a preview beat laid from the guardian's data, here "flees light", with a cap patch beside it).
**Builds in under 2 h once** 3-1..3-8's pieces and NEW 1-2 exist: it lays only bricks other stages proved.
**Differs:** every World 3 stage taught one thing; this asks for all of them, round a ring (the route returns over itself, '@' in spirit,
written as rising and descending nodes so V11 holds). 2-9 (the River King's Court) is World 2's gauntlet in daylight on moving ground;
1-9 is the boa. Kept GAME-MAP (dark + hanging + quiet + prowlers); added: light as the weapon, the jaguar's first meeting, the V preview.

## Hidden stage: The Cave Slide (opened by 3-7's guarana; reached by hanging): "Read the glow, pick the lane"
**One idea:** "Shoot down a dark water chute; the glowworms on its walls wake as your splash reaches them and light the next bend a beat
early: read the light, pick the lane." A player says: "the secret water slide where the glowworms light up just before the rocks."
**The hook:** the patience world, for once at full speed, and still about light: 3-1's waking glowworms become a warning that runs ahead
of him. It is a reward: found by a secret, short, joyful, never a life lost for a miss (the slide's own rules: checkSlide, w7Slide.ts:15, :321).
**Tributes** (Toobin' from anywhere; Block 2: The Lion King; Sonic the Hedgehog 2 is the one famous title)
- **Toobin'** (arcade, 1988; pre-1990, lesser-known). a. Loved: John Harris (Game Developer, 30 May 2008): "Toobin's level order and layout
  can be quite different depending on which forks are taken" (https://www.gamedeveloper.com/design/game-design-essentials-20-atari-games).
  b. Taught: the first river is wide and slow [S]. c. Ours: a river ride with a fork (two lanes that rejoin, one with a find). d. Not
  copied: the hand-and-foot paddle buttons.
- **The Lion King** (SNES/Genesis, 1994, Block 2 #37). a. Loved: GamesRadar (Chris Antista): "The game is probably most famous for its
  Wildebeest Stampede level" (https://www.gamesradar.com/the-top-7-kickass-disney-games/). b. Taught: the stampede warns of each lane
  before it comes [S]. c. Ours: every obstacle warned by light one beat early; Easy wider and slower. d. Not copied: the difficulty spike
  (GamesRadar, Anthony McGlynn: "making sure you'd be a repeat customer").
- **Sonic the Hedgehog 2** (Genesis, 1992, Block 2 #32). a. Loved: GamesRadar (Bradley Russell): beating the special stages "will usually
  gift the player a hidden final level and the 'true' ending" (https://www.gamesradar.com/sonic-2-easter-eggs-references/): the secret pays.
  b. Taught: the first half-pipe has few bombs [S]. c. Ours: the view behind his back (w7SlideRun's own), a golden find at the end. d. Not
  copied: rings as a gate.
**The arc** (Normal s; the slide's seconds; the side-on parts are short)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 8 | Side-on: the guarana's door, a pool; he slips in | Slides in | "Wheee!" |
| 1 | **Teach: the light runs ahead** (T w1) | 14 | A wide chute; each obstacle's wall glowworms wake 1 s before it (Normal; Easy 1.6 s, the dark rule's numbers) | Steers to the dark lane, not the lit rock | "The lights warn me!" |
| 2 | Bends (P w1) | 12 | Gentle bends, petals in the lit lane | Steers | "Fun" |
| 3 | **TEST: rocks and roots** (X w1) + R | 16+4 | Rocks to steer round, low roots to duck (hold down), gaps to flick over, each lit first | Reads and reacts | "Left, duck, jump!" |
| 4 | **TWIST: the dark stretch** (W w1, #dark@splash) + R | 14+4 | Here the worms sleep until his SPLASH reaches them: steer near the wall to light the way ahead | Hugs a wall to see | "Make the light!" |
| 5 | The fork (P w1) | 10 | Two channels round a pillar; the narrow one holds petals | Picks | "That way!" |
| 6 | **COMBINE** (C w1) + R | 16+4 | Rocks, roots and gaps quicker, both light kinds | Reads it all | "Faster!" |
| 7 | **SIGNATURE: the glowworm waterfall** (S w1_) | 10 | The chute drops into a cavern of a million glowworms | Falls into the pool | "Woah..." |
| 8 | Exit (E) | 6 | Side-on: the golden find on an island, the way back to the map | Picks it up | "A secret!" |
**Node string** (checkCode: no errors, 12 tokens, checked as a GRAPH: the slide is not a gen2 roll, so V11's mix does not apply):
`A Tw1>:#dark Pw1> Xw1>:#dark R Ww1>:#dark@splash R Pw1> Cw1>:#dark R Sw1_>:#dark E`. About 2:10 with the side-on parts (the 2-minute rule).
**Engine** (checked). WIRED for 7-4: SlideSim, lanes, steer / flick up / hold down, checkSlide (every row has a reachable clear lane in
time) and the hand-over of input, camera and canvas (w7Slide.ts:1-20, w7SlideRun.ts:1-6). FOUNDATION: **ENG-SLIDE** (L, PLAN-W3 D8: the
slide as a mode any stage opens, with Dot's flight; not this stage's own). **NEW 1 the lit warning** (S-M; w7Slide.ts course data: a row's
light time, and the splash-woken kind for the twist; checkSlide gains "every obstacle lit >= 1 s before it, Easy 1.6"). **NEW 2** is 3-7's
NEW 2 (the find that opens a stage): shared, built once. **Builds in under 2 h once** ENG-SLIDE exists and W3-ART-2's chute is painted.
**Differs:** 7-4's slide is a temple and stone, in daylight; this is water and dark, warned by light. Nothing else in Worlds 1-3 is a ride
behind his back. Kept GAME-MAP (the chute, the guarana under a fern in 3-7, reached by hanging); added the light that runs ahead.

## What the five need, in build order (D40: foundations first; PLAN-W3 §2 names)
1. Already planned foundations: F1 ENG-W3a, F2 ENG-DARK, F5 ENG-VINE, D2 ENG-ROOT, D3 ENG-SPORE, ENG-27 (left), **ENG-NOISE** (PICKS-33-35).
2. **ENG-WAYS** (S, Pushback 3): ENG-NOISE grown to "every way into the cast": bell, punch, landing (exists) AND light. One packet.
3. ENG-LIGHT (M, 3-6) -> bot `toss-light`; ENG-FERN (S, 3-7) + the stage-opening find (S, 3-7 + slide); ENG-THORNSWING (S-M, 3-8) -> bot
   `wait-on-liana`; the V job (S, 3-9); ENG-SLIDE (L) + the lit warning (S-M, slide). Art: W3-ART-2's cap, chute, roof root (PLAN-W3 §3).
4. Order of stages by what they wait on: 3-8 first (F5 + one S-M), then 3-6 (F2 + ENG-LIGHT), 3-7 (ENG-27 + ENG-ROOT + ENG-FERN), 3-9 (all),
   the slide last (ENG-SLIDE, the week after: PLAN-W3 §4).

## Learned
- The kit already holds most of World 3's rules as DATA with no emitter: the jaguar's `light: flees`, the ocelot's bell lure, punch noise.
  Grep `predators/world3.ts` beatenBy and `castPlay.ts` together before calling a behaviour new or wired (3-9's NEW 1 is that gap).
- The puzzle kit (puzzleKit.ts) holds World 3's light pieces (glow cap, light-only ledge, fern-stone mark) for rooms only: ENG-LIGHT is a
  lift into gen2, not new design. Search the kit before the engine.
- Allowed hosts tonight: hardcoregaming101 is a maintenance page; GamesRadar via WebFetch comes back empty: curl + tag strip in scratch
  works (PITCH-33A found the same). Game Developer's "Retro Game of the Day" pages cover many Block 1 games in one short page each.

## Pushback
1. **The hidden stages have no difficulty number.** DIFFICULTY.md's slots stop at stage 9 and guardians are "scored on their own" (:65);
   no line names hidden stages. Proposal for the lead: a hidden stage is scored like the stage that opens it minus a breather step (3-7's
   28 - 4.5 = about 23.5), never a life lost on a miss (a reward). Needs a ruling before the slide's design, not a number typed by me.
2. **The jaguar's `first: 'trap'` (world3.ts:32)** fits 3-3's stalactite, but the picks keep the jaguar out of 3-3 (PICKS-33-35: the prowler
   is lured into spores). If 3-9 meets it first, its first way should be 'light' (data), or the roster test will ask for a trap at 3-9.
3. **Build the cast's "ways" once.** 3-3 (bell), 3-5 (punch), 3-9 (light) each need a way into castPlay.ts that has no caller today. One
   ENG-WAYS packet (S-M) with a planted toy per way, before ENG-LURE, ENG-VINE and 3-9: otherwise three members wire the same seam (D40).
4. **3-6's "no jump while carrying"** is the puzzle kit's rule (puzzlePlay.ts:704). If ENG-LIGHT lifts the cap without that rule, 3-6 loses
   its idea (light becomes a free lamp). The ENG-LIGHT packet must carry it as a done-item.
5. Seven tribute mechanics carry [S] (the exact first-screen teaches): the allowed hosts had no page on them.
