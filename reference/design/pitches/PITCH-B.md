# PITCH-B: 1-9, 2-1 and 2-2 (Pitcher B, blind to Pitcher A; packet PITCH-19-22; written 7:27 PM ET 11-14)
Engine facts read from origin/t-int-9 (file:line below); targets from DIFFICULTY.md on origin/t-1718-design; the map from GAME-MAP.md on
origin/t-design-game-map. Design only: nothing is built. Seconds are designed, not measured; every window marked "fly it" is arithmetic
from two data values and must be flown in the real engine before a level is laid (level.md rule 21).

**Pages opened (this session, Gaming environment):** en.wikipedia.org (9 articles, read as raw wikitext), www.gamesradar.com (Bit.Trip
Runner review), www.gamedeveloper.com ("Hanging in Limbo"). **Would not open:** web.archive.org (timed out twice), tcrf.net and
www.mobygames.com (403), www.hardcoregaming101.net (answers 200 but shows "under maintenance"), gamasutra.com (no answer). [S] marks the one
line I could only read second-hand.

**The shelf, per level** (THE SHELF RULE: a pre-1990 classic, a lesser-known title, at most one of the famous few; one post-2005; all
four blocks of Matt's list used across the three):
| Level | Pre-1990 classic | Lesser-known | Post-2005 | Famous few (max 1) | Blocks |
|---|---|---|---|---|---|
| 1-9 | Mario Bros. (1983, Matt's own) | Oddworld: Abe's Oddysee (1997) | Limbo (2010) | Mario Bros. | favourites, 3, 4 |
| 2-1 | Frogger (1981, Matt's own), Jungle Hunt (1982) | Jungle Hunt, Bit.Trip Runner (2010) | Bit.Trip Runner | none | favourites, 1, 3 |
| 2-2 | Wonder Boy (1986) | Wonder Boy | Celeste (2018) | Celeste | 1, 2 (The Lion King), 4 |
None of Pitfall!, Donkey Kong, Crash or Donkey Kong Jr. leads a level here. Frogger appears in 2-2 only as the contrast (what we don't do).

**The thread across the three:** 1-7 taught him to hide by keeping still. 1-9 asks him to be SEEN on purpose and then go still. 2-2 is the
first place where keeping still is the danger. Each level turns the lesson before it, so World 1 ends and World 2 opens with a surprise.

---
## 1-9 The Boa's Branches (gauntlet, right; the last stage before Venom Fang)
**(a) The one idea:** "Boas strike at whatever moves, so be the bait: show yourself, make it rear where YOU choose, and let the forest
beat it." A player says: "the snake level where you wave at the boa, freeze, and the eagle scares it off." Why it is fun for a sloth on a
phone: his slowness becomes the weapon. The thumb that walks him into a boa's sight is the thumb that lifts to freeze him, and the
heartbeat between the two is the whole game: one thumb, one choice (go or stop). Upright, each boa's question fits one screen: its sight is
280 px each way (world1.ts:52) and an upright screen shows about 425 px (level.md, World 1 notes), so the boa sits mid-screen with its tool
(a hung log, the eagle's roost, a creaky limb) beside it. Sideways, two boas read at once; the rearing head (70 px tall, world1.ts:52)
stays under the HUD band.

**(b) The games** (L what players loved; T how it taught; F how it feels here on a phone; N what we do not copy)
1. **Mario Bros.** (arcade 1983; Matt's own favourite on the Atari 7800, INSPIRED-BY.md). L: Computer and Video Games (1989) called it
   "incredibly good fun", and the Atari 7800 version "slightly better" (https://en.wikipedia.org/wiki/Mario_Bros., Reception). Its heart:
   you can't beat a foe head-on, you make it helpless first, and the window closes: "If the player allows too much time to pass after
   doing this the enemy will flip itself back over and recover" (same page, Gameplay). T: the first foes go down to one bump; a later one
   "can only be flipped when it is touching a platform" (same page): one condition added at a time. F: a boa that strikes and misses
   leaves its head out 0.8 s (world1.ts:60); a punch then dazes it 2.5 s (world1.ts:68), and a freeze in its rear sends it away for 4 s
   (world1.ts:67): two windows he opens himself, timed in his own steps along its bough. N: no kicking, no POW block, no pipes, no
   flipped-over foes; a dazed boa sways and slides off (nobody is hurt).
2. **Oddworld: Abe's Oddysee** (PS1 1997). L: GameSpot: "the ideal platformer, balancing its action and puzzle elements perfectly to make
   the game intelligent, engaging, and, best yet, fun", and its creatures' AI "goes a long way towards making you feel as if you're
   interacting with an actual world and its inhabitants" (https://en.wikipedia.org/wiki/Oddworld:_Abe%27s_Oddysee, Reception). T: each
   creature has one readable rule ("Sligs will shoot on sight, but cannot see through dark areas; Slogs will bark loudly if they hear the
   player... Scrabs will attack anything in their territory, including others of their own kind": same page), and a hero who can't fight
   wins by using the rule. F: the boa has one rule (it sees what moves; it fears the eagle, world1.ts:71), said once in the keeper's words,
   then only shown; every boa beat is a small "use its rule" scene on one screen. N: no possession, no chanting, no guns, no factory.
3. **Limbo** (2010). L: its makers: "it was fun and scary before the spider came in, and it just got worse, or better, when the spider
   came in" (Playdead, https://www.gamedeveloper.com/business/hanging-in-limbo). T: playtesters stared at the bear trap when it shared the
   spider's screen, so it was moved; "the spider's actions would eventually cause this trap to drop to the ground and become a weapon
   against the spider": the player "felt helpless" first, then an "audible cue" gave the answer (Carlsen, GDC Europe, as told on
   https://en.wikipedia.org/wiki/Limbo_(video_game), Development; the Gamasutra original would not open [S]). F: the hung log's handle sits
   INSIDE the boa's sight, so the punch that lets the log go is the movement that makes it rear: it rears straight under its own load, and
   the creak of the load (dropTrap.ts "loose": the tell) is the sound that says "now freeze". N: no gore, no dread, no monochrome.

**(c) The beats** (Normal; R = a rest, folded in)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | Old mossy boughs, a shed skin, a hush; nothing hurts for 1,300 px; the keeper's line on boas 800 px+ before beat 1 (rule 6) | walks | "Something big lives here" |
| 1 | **The first boa, safe** (T) | 16 | A boa on the far half of a bough; its strike (128 px, world1.ts:59) can't reach the near half | walks into its sight; it rears (head back, tongue, leaves rattle; 0.8 s, Easy 1.3); he lifts his thumb; it settles and slides off for 4 s; he crosses. Not freezing only earns a thunk on the bark | "It looked right at me and thought I was a branch" |
| 2 | Freeze, twice (P) + R, flag | 16+8 | Two boas along one long bough, each 4 s window covers its own reach | go, stop; go, stop | "go... stop... go" |
| 3 | **The log comes back** (T, 1-3's trap) + R | 14+6 | A boa under a hung log; the handle inside its sight | punches the handle from outside its 128 px strike: the punch makes it rear, the log lands on it: chased off for good (fly it: the load's creak must end inside the boa's 0.8 s rear) | "It reared right under the log!" |
| 4 | **Make it miss** (T, Mario Bros.) + R, heart | 14+6 | A boa at a bough's end; no log | shows himself, hops back out of 128 px as it rears (it strikes where he WAS: the aim is set when the rear starts, core.ts:245-247); it strikes bark; he steps in and punches its nose inside the 0.8 s its head is out (fly it); walks past while it's dazed | "Missed me. Bop!" |
| 5 | **TWIST: the eagle is on his side** (W) + R, flag | 16+6 | A dead snag with the harpy's nest (a lure post: fear 'eagle'); a boa within its reach; the way past it is a creaky limb (it gives way about 1.1 s after he stands on it: the default, engine.ts:2799), so stopping there is the wrong answer for the first time in the level | keeps walking into its sight: it rears at him inside the roost's reach and flees for good the moment it starts (a post works while it is after him, in its rear or strike: lure.ts:5), so the first roost can't hurt him; he walks on over the limb. "This time, DON'T stop" (fly it: the limb outlasts the walk) | "The snake's scared of the eagle!" |
| 6 | **Your way** (C) + R, heart, flag | 20+8 | Three boas up a branching climb, each with two answers (a log, the roost, a liana landing, a plain freeze) | picks: a child freezes; an expert clears them for good with log and roost (no 4 s timer behind him) | "I did it MY way" |
| 7 | **Two hunters** (L) | 20 | The harpy's eye sweeps the high boughs (1-7's sweep and cover); boas lie along them | hides in cover as the eye passes; every boa the eye crosses flees (core.ts:221 food chain); baits the one the eye can't reach under a log. One threat at a time, 1.5 s+ apart (1-8's rule) | "Hide... NOW go" |
| 8 | **The Old Boa** (S, signature) | 10 | The biggest boa along the last bough to Venom Fang's tree; no tool | must walk inside its reach: it rears with its head swaying at his face (slow motion, NEW 2); he holds; its tongue flicks; it decides he's a branch and pours away into the leaves | "...don't... move." then "YES!" |
| 9 | Exit (E) | 8 | The guardian's tree ahead, her mark (the keeper's words) | walks on | proud, a little shaky |
About 178 s designed (2:00+ for bots is the floor; LEVEL-BAR's count wins). Flags and hearts follow Matt's rules (STAGE-RULES; D49), not this table.

**(d) Node sketch:** `A T P R T R T R W R C R L S E` (letters as 1-8.md uses them: A arrive, T a taught piece, P its use, W the twist,
C the choose stretch, L the last stretch, S the signature, R rests, E exit; the builder maps them to NODES.md §8).

**(e) Difficulty:** Normal **9.5**, pasted: "World 1, from Matt's ratings: ... 1-8 7.5 (the chase), 1-9 9.5" (DIFFICULTY.md:60-61).
**Easy about 5** (at most 0.6 x Normal = 5.7, DIFFICULTY.md:55). Normal bites through the freeze window (tell 0.8 s minus calm 0.5 s =
0.30 s, 9 frames, to stop: world1.ts:57, stillness.ts:21; fly it), the creaky limb that takes freezing away, two hunters in beat 7 and the
Old Boa in reach. Easy: the kit's own EASY row (tell 1.3 s, cool 1.5 s, speed 0.85: world1.ts:11) and calm 0.35 s (stillness.ts:22) give a
0.95 s window, three times Normal's; beat 7's cover never more than 1 s away; Easy never harder in any number (rule 4).

**(f) Engine.** WIRED: the boa (world1.ts:49-72: sight 280, strike 128, tell 0.8, beaten by trap / lure / still / punch, fears the eagle)
and its sprite (boaSprite.ts:24); drop traps (dropTrap.ts); stillness (stillness.ts:20-23); the harpy's sweep and cover (1-7;
W1_EAGLE w1Cast.ts:146); the food chain (core.ts:221, run by castPlay.ts:176); creaky limbs (engine.ts:2799); lianas (w1Swing.ts); slow
motion (engine.ts:745-748, per 1-8.md). DATA, no code: the boa in World 1's cast (no boa row in w1Cast.ts, w1.ts or stageTable.ts today:
git grep), the arc file w1Arc19.ts and its stageTable row. EXISTS, NOT WIRED: lure posts (gen2/lureLay.ts, predators/lure.ts).
**NEW 1 (S, ~1 h):** World 1's lure row "the eagle's roost" (fear 'eagle') through lureProps / lureSocket (lureLay.ts:33, :39) in
gen2/worlds/w1.ts, plus its prop row in the inventory (a dead snag with a nest; if the inventory has none, a Hugging Face job: the lead's
call). **NEW 2 (S, ~1 h):** the freeze moment: when a boa is beaten by 'still' with him inside its strike reach, 0.6 s of slow motion
(castPlay.ts event, engine.ts's existing slow motion). **Bots first (rule 21):** a toy stage where the castBots bot baits, freezes and
punches a missed strike, red with each skill removed, before 1-9 is listed.

**(g) Not a repeat:** 1-6 is momentum on a pendulum (no swing lesson here; a liana is only one answer in beat 6). 1-7 is hiding from the
eagle (stillness as defence, cover, soft feet); 1-9 is being seen on purpose (stillness as the answer he sets off), and the eagle turns from
hunter to ally. 1-8 is never stop with a front behind him; 1-9 is stop and think, one-screen scenes with more than one answer, and no clock
except the window he chose to open.

---
## 2-1 Down to the River (sprint, right; World 2's first stage: the world of rides)
**(a) The one idea:** "When the trees run out, the river is your road: wait for a log, ride it, and step off before it slides under the
reeds." A player says: "the one where you swing down out of the trees and ride logs to the village." Why it is fun: World 1 made him move;
World 2 moves HIM. Riding is the joy of being carried: the thumb only decides WHEN (board, hop, step off), which a child can do with one
thumb, while the 12+ player reads three logs on a beat and a river that runs backwards. Upright: the river is about 800 px bank to bank
(river.ts:152-153: four log-and-gap spans) against 425 px of screen, so a beat's question is always the next log, never the far bank: the
reeds a log slides under come into view 270 px ahead of him (level.md, World 1 notes), 3.9 s before a 70 px/s log reaches them. Sideways:
the whole river at once.

**(b) The games**
1. **Frogger** (arcade 1981; Matt's own favourite). L: distributors found players enjoying its "non-aggressive yet challenging" play
   (Cashbox, 1981, https://en.wikipedia.org/wiki/Frogger, Reception): a game for everyone, which is our game too. T: the road first, then
   "a river with logs, alligators, and turtles, all moving horizontally across the screen in opposite directions"; you lose a frog by
   "riding a log, alligator, or turtle off the side of the screen" (same page). F: our screen edge is the reeds: each log slides in under
   the far bank (river.ts:4-5), and he must step off first; the first river costs nothing (a splash puts him back on the bank,
   w2Stages.ts:6-7). N: no traffic, no frogs, no homes at the top, no alligator jaws (2-5's snap-jaws), and not "the arcade game with the
   most ways to die" (Softline, 1982, same page): two ways, both fair.
2. **Jungle Hunt** (arcade 1982, Matt's list says 1983; Block 1). L: Bill Kunkel, Electronic Games (1983): "the classic formula for successful videogames:
   easy to learn, difficult to master", "an undeniable kick the first few plays" (https://en.wikipedia.org/wiki/Jungle_Hunt, Reception).
   T: one trip that changes what you do: vines first ("pressing the button when two vines are close enough together"), then "After the
   last vine, the explorer dives into a crocodile-infested river" (same page, Gameplay). F: 2-1 opens on the last lianas of World 1, each
   lower than the last, carrying him DOWN out of the canopy onto the riverbank: the old world's move is the bridge into the new world's.
   N: no swimming (he learns in World 6, swim.ts:2), no knife, no crocodiles, no captives, not its right-to-left scroll.
3. **Bit.Trip Runner** (Wii 2010). L: GamesRadar: "all of the levels are meant to be played in rhythm"; "Every difficult slide or
   precarious jump is rewarded with an adreniline boosting musical swell" [sic]; "the fastest level restart in gaming history"
   (https://www.gamesradar.com/bittrip-runner-review/). T: the hero runs by himself and you act on the beat ("Commander Video runs
   automatically", https://en.wikipedia.org/wiki/Bit.Trip_Runner). F: a river already has a beat: a log leaves the bank every
   (log + gap) / speed seconds (river.ts:160), 242 px at 70 px/s = 3.5 s. We let him HEAR it: a soft knock as each log slides out (NEW 2),
   so a child boards "on the knock"; the village drum swells as the last log carries him in. N: he is never auto-run; no score multiplier.

**(c) The beats**
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | The canopy thins; the river glints far below; water sounds | walks to the last bough | "Where did the forest go?" |
| 1 | **Down** (1-6's skill, nothing new) | 20 | Three lianas, each lower; every let-go lands on a wide bank by a plain fall (D46), no pit under the swing | swings down | "Down we go!" |
| 2 | **The first log, safe** (T) | 16 | A slow backwater with him (70 px/s, river.ts:136); a splash costs nothing; the keeper's line 800 px+ before | hears the knock, steps on, rides, steps off on the far bank | "It's carrying me!" |
| 3 | **Off before the reeds** (P) + R, flag | 16+8 | The log heads under the reeds short of the bank; a second log behind | hops log to log | "Off! Off!" |
| 4 | **The river's beat** (T) | 20 | A wider river, three logs on the water, a knock every 3.5 s, a petal on each bank and rock he lands on (never on a log: flowerReach.ts:139) | boards on the knock, hops in time | "knock... hop... knock... hop" |
| 5 | **Now it counts** + R, heart | 14+6 | The first deep river: a heart on Normal (Easy: still a splash) | the same, carefully | "This one's for real" |
| 6 | **TWIST: the river runs back** (W) + R, flag | 20+6 | A river against him (dir -1, as river.ts:138's row; the table's stage-1 row is one river, river.ts:136, and the hand-built 2-1 already adds rivers against him, w2Stages.ts:6-7: rows are data); each log carries him back where he came from | hops forward front end to front end; a pause costs ground | "It's pushing me back!" |
| 7 | **Both ways** (L) | 20 | With, then against, an islet between, logs at 80 px/s (river.ts:139) | everything | "Almost there..." |
| 8 | **The long log** (S, signature) | 12 | The widest, calmest river; one long log (a wider log row: data) | rides it all the way while the camera leads to the village (stilt houses, lanterns, river folk) and the drum swells; steps onto the landing | "WOW, a village!" |
| 9 | Exit (E) | 8 | The village gate (the keeper's words) | walks in | home-ish |
About 176 s designed.

**(d) Node sketch:** `A D T P R T R W R L S E` (D = the descent on lianas; other letters as in 1-9).

**(e) Difficulty:** Normal **9.5**, pasted: "target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, ...]: a first stage just under the last world's
end" (DIFFICULTY.md:57). **Easy about 5** (at most 5.7). Normal: three logs read at once, deep water, the river running back, faster logs
at the end. Easy: every river splashes him back (no life), wider logs, slower drift. **Pushback:** 1-9 is also 9.5 (DIFFICULTY.md:61), so
2-1 ties the last world's end instead of sitting just under it; one of the two moves (the lead's call).

**(f) Engine.** WIRED: drifting logs and their recipes (river.ts:134-160; ridden through engine.ts per GAME-MAP), the no-life first river
and deep rivers (w2Stages.ts:6-7), lianas (w1Swing.ts, and w6Swing.ts to w8Swing.ts for other worlds), flags, hearts, petals. EXISTS, NOT
WIRED: rides in gen2 (gen2/rideLay.ts). **FOUNDATION MISSING (not a level piece):** a gen2 World 2 kit (gen2/worlds/w2.ts; Worlds 1, 5,
6, 7 and 8 have one, World 2 has none; 2-1 and 2-2 are hand-built in w2Stages.ts). **NEW 1 (M, 2-4 h):** the river as a gen2 section: a
socket that lays river.ts's drift window and recipe, with its fairness checks (boarding room, the reeds in view 3.5 s+ before a log goes
under): gen2/rideLay.ts or a riverLay.ts beside it, and w2.ts rows. **NEW 2 (S, ~1 h):** the log's knock: one sound per log leaving the
bank, read from river.ts's own spacing (no new timer: the beat is the river's): river.ts event, audio.ts. **Check first:** whether a jump off
a river log keeps the log's sideways speed, as a jump off a ride does (ride.ts:7-8, RIDE.keep): against the flow it shortens every hop.

**(g) Not a repeat:** 1-6's lianas are only the way down here (no pumping, no let-go-at-the-top lesson). 1-7's stillness: standing still
on a log is how he rides, but the floor moves. 1-8 had a front behind him forcing him on; in 2-1 nothing chases him: the river sets the
pace and he picks the moment. New verb: ride.

---
## 2-2 Petals for the Crown (harvest, right; flowers for the river king's crown)
**(a) The one idea:** "Every lily pad sinks while you stand on it, so never stop: hop pad to pad and pick the flowers on the way." A
player says: "the lily pad level where you can't stand still." Why it is fun: World 1 taught him stillness saves him; 2-2 is the first
place stillness sinks him. It is the playground's "the floor is lava", which every child already knows. One thumb, hop-hop-hop, in a
rhythm the pads set; the 12+ bite is greed (the extra flowers on the smallest pads) and a pad that drifts. Upright: the next two or three
pads, their sizes and the flower fit 425 px (pads one hop apart). Sideways: the whole pond, to plan a route.

**(b) The games**
1. **Wonder Boy** (arcade 1986, Matt's Block 1). L: Clare Edgeley (Computer and Video Games) praised its "simple, addictive gameplay":
   "not as complicated but just as playable" as Super Mario Bros. (https://en.wikipedia.org/wiki/Wonder_Boy_(video_game), Reception).
   T: "the vitality meter, which constantly runs down at a steady pace and can only be refilled by collecting food throughout the level"
   (same page): the meter keeps you moving forward and the food is on the path. F: each pad is a little meter under his feet (it sinks
   while he stands and comes back up after he leaves: ride.ts:9, 100-112) and the flowers are the fruit on the line: the way that keeps him
   afloat is the way that fills the crown. No meter on screen: the pad's dip and ripples ARE the meter. N: no caveman, skateboard, hatchet,
   eggs or countdown bar.
2. **Celeste** (2018; the famous-few pick for 2-2). L: Paste wrote that Thorson "mastered level design" because "the game's difficulty
   came from the need to achieve objectives rather than discern them"; Polygon felt "in complete control" 
   (https://en.wikipedia.org/wiki/Celeste_(video_game), Reception). T: "Systems like strawberries, B-sides, and Assist Mode were designed to allow the player to customize
   the difficulty", and Assist Mode lost the name "Cheat Mode" because it "was too judgmental" (same page, Development). F: big pads and
   small pads read at a glance (two sizes, two sink times): the hard part is the hopping, never working out which pad is which. The
   crown's extra flowers (above the goal) sit on the smallest pads: difficulty the player chooses. Easy's longer sink times are never named
   "easy pads". N: no dash, no mountain, no strawberries.
3. **The Lion King** (SNES/Genesis 1994, Matt's list says 1993; Block 2). L: Entertainment Weekly: the animal play is "so well observed that it's like
   watching a PBS nature documentary"; GamePro: "movie-quality graphics, animations, and sounds" 
   (https://en.wikipedia.org/wiki/The_Lion_King_(video_game), Reception). T (the lesson, from what players did NOT love): GamePro found it "too daunting for beginning
   players and too annoying for experienced ones", and its director said level 2 was made hard on purpose so renters couldn't finish it,
   and "has since apologised" (same page). F: the king's lagoon is a living scene (a heron stalking, fish rings, a frog plopping off a pad
   as he lands: harmless), and 2-2's Normal bite comes from choices (greed, the drifting pad), never from an unreadable pad or an
   imprecise hop. N: no lions, no songs, no stampede (that family is 1-8's).
Not Frogger's diving turtles: they sink on their own clock ("sinking while on top of a diving turtle", Frogger page); ours sink only under
him and always come back (2-5's snap-jaws are the on-a-beat kind).

**(c) The beats**
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | The king's lagoon: still water, pads carrying flowers, a heron; nothing hurts for 1,300 px; the keeper's line on pads 800 px+ before beat 1 | walks the bank | "Pretty..." |
| 1 | **The first pad, safe** (T) | 14 | One big pad at the bank over shallow water (a splash = back on the bank) | stands: it dips, ripples ring, the flowers tip (the warn); steps off: it bobs back up | "It sinks if I stay!" |
| 2 | **The chain** (P) + R, flag | 16+6 | Five pads in a row, a flower on each, a hop apart | hop-hop-hop-hop-hop | "Don't stop, don't stop" |
| 3 | **Big and small** (T) + R | 18+6 | Big pads (slow: a breath) and small (quick); the extra flowers on the small | picks a route | "I can rest on the big ones" |
| 4 | **The river returns** (2-1) + R, heart | 18+6 | A log lane through the pond: the log is a rest that moves | rides, hops onto pads as it carries him past, back on | "Ride... hop... back on" |
| 5 | The sluice room (built, w2Stages.ts:60-61) | 25 | The ferry's sluice puzzle: a thinking breath | works it | "Ah, clever" |
| 6 | **TWIST: the pad that carries you** (W) + R, flag | 18+6 | A big pad drifting across the deep middle, sinking while he stands | hops in place to keep it up (the count falls while he is in the air: ride.ts:110), hops off for a flower and back on | "Keep bouncing!" |
| 7 | **The crown ring** (L) + heart before | 20 | A ring of small pads round the king's rock, a flower on each; the last two reached only from a drifting pad | everything, in one flow | "Almost the whole crown..." |
| 8 | **Bounce to the king** (S, signature) | 10 | The last drifting pad crosses to the king's island; frogs croak in time | bounce-bounce-bounce on the pad as it carries him in; the crown fills | "Made it!" |
| 9 | Exit (E) | 8 | The court; the king admires himself (the keeper's words) | presents the flowers | proud, giggly |
About 189 s designed. The goal count follows the harvest rule (today's hand-built 2-2 asks 80, w2Stages.ts:43-44, or less where the lay
leaves fewer, w2Stages.ts:99-100); every goal flower on the natural path (LESSONS D8).

**(d) Node sketch:** `A T P R T R P R m W R L S E` (m = the built sluice room).

**(e) Difficulty:** Normal **13**, pasted: "target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, ...]" (DIFFICULTY.md:57): 10 + 3.
**Easy about 7** (at most 7.8). Normal: short counts on small pads, deep water costs a heart, the drifting pad, the ring. Easy: every count
stretched ("Easy only stretches the clock", ride.ts:6), the lagoon's water the splash-back kind, the extras still there (the player's
choice).

**(f) Engine.** WIRED: lily pad and river art (riverArt.ts, w2Stages.ts:10), drifting logs (river.ts), petals, the sluice room
(puzzleKit.ts; w2Stages.ts:60-61, hand builder), hearts and flags. EXISTS, NOT WIRED: sinking pads (ride.ts:100-112, newPad / stepPad);
rides in gen2 (rideLay.ts). **FOUNDATION MISSING:** the World 2 kit, as in 2-1. **NEW 1 (M, 2-3 h):** lay sinking pads in gen2: a pad row
in rideLay with two sizes (two counts) and their fairness checks (a pad holds through the landing and one more decision; a sunk pad is back
before he can need it again; nothing strands him, level.md rule 5): gen2/rideLay.ts, w2.ts. **NEW 2 (S, ~1 h):** a pad on a ride path
(ride.ts has both a path for rides and a count for pads, stepPad; one platform with both is the new part) and the sinking look (dip, ripples, tipping flowers): ridePlay.ts, riverArt.ts; the sunk
pad's art is on GAME-MAP's World 2 missing list ("lily pads in a sinking state"): a Hugging Face job, the lead's call.
**ENGINE-WORTHY before building (rule 22):** flowers on pads. flowerReach.ts:139 never re-seats a petal onto a 'fragile', 'drift' or
'moving' platform, and 2-2's flowers sit on pads by design; the petal rules need a pad case for every world with pads (taken on landing;
a petal sinks and rises with its pad).

**(g) Not a repeat:** 1-7 and 1-9 make stillness his friend; 2-2 is the first place it is his enemy. 1-8's "never stop" was a front
chasing him; 2-2's is the floor giving way under his own feet, at his own pace, with big pads and logs to rest on. No swing (1-6). And 2-1,
the stage before, has logs that carry him and never sink; 2-2 has pads that hold still and sink.

---
## Pushback (with evidence)
1. **World 2 has no gen2 kit** (worlds/ holds w1, w5, w6, w7, w8 only). 2-1 and 2-2 cannot be 2-hour levels until it exists, and building
   them on the hand builder (w2Stages.ts) patches what the kit will replace (D40). The kit is a foundation packet of its own. Its size I
   can't measure from my reads: the World 6 kit is w6.ts (318 lines) plus w6Ground.ts (945) over 2 commits on 11-13; its hours are in
   STATE.md / LEVEL-LOG.md, outside this packet (D25: no guessed hours).
2. **2-1 and 1-9 are both 9.5** (DIFFICULTY.md:57, :61): the slot rule says a world's first stage sits just under the last world's end.
3. **1-9's Normal freeze window is 9 frames before he decelerates** (tell 0.8 s, world1.ts:57, minus calm 0.5 s, stillness.ts:21). The
   comment at world1.ts:56 says 0.8 was chosen so going still "fits inside the rear with room to react". Fly it at a walk and a run first;
   if a reacting player can't stop inside it, the tell is a Designer number to re-rule, not a reason to drop the idea.
4. **The map's 1-9 twist (a boa that copies your path) is cut** (GAME-MAP C1); this pitch uses the wired kit, as MAP-REVISIONS.md §5 says
   ("the boa is lured with drop traps and the food chain"), plus the freeze and the punch the boa already has.

## Learned
- A creature's data makes the design: reading the boa's def first turned "outwit the boa" into four exact answers with their windows, and
  found the one number (the 0.3 s freeze) that could break the level. **Proposed building rule for level.md (lead's call):** "Before a
  beat uses a creature, paste its def (sight, tell, reach, beaten-by) into the design doc and work each window in frames at 30 fps; a
  window under 12 frames is flown before the beat is designed further." Evidence: pushback 3.
- Wikipedia's raw wikitext (`index.php?title=X&action=raw`) is the fastest quotable source on this network: the Reception sections carry
  the review lines; HG101 was under maintenance and web.archive.org timed out, so plan on Wikipedia plus GamesRadar and Game Developer.
- Turning the last level's lesson (1-7 hide, 1-9 be seen, 2-2 stillness sinks you) gave each idea its own sentence fast. An opinion until
  LEVEL-LOG shows it builds faster or scores higher.
- Lessons applied: D7 and D24 (every engine fact read in code: the boa, stillness, the river, pads, flower reach), D25 (no guessed hours
  for the kit), D34 and D52 (file:line cites, checked last), D46 (the descent's landings by plain fall), D49 (flags and hearts by Matt's
  rules, not my tables), D53 (fast gates before the push), D55 (context % in every message), D57 (queue read at the push).
