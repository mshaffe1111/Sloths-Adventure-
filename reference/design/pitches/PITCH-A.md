# PITCH A: 1-9, 2-1 and 2-2 (Pitcher A, DESIGN-19, packet PITCH-19-22; 2026-11-14). DESIGN ONLY: the lead picks, then the tribute check (D58)
Facts are from origin/t-int-9 (file:line). **Sources, said plainly (redo for the lead, 6:42 PM):** this session cannot open ANY web page. WebFetch
fails on en.wikipedia.org, strategywiki.org, tcrf.net, pcgamer.com, web.archive.org, gamesradar.com, gamedeveloper.com and medium.com, and a
curl through the proxy was refused. So every quote is marked: **[Q]** = a verbatim line the extended search tool quoted FROM that page (the
page named; I did not open it myself); **[S]** = a shorter search snippet, used only for a mechanic fact or a "how it taught" line. A claim with
neither was dropped, and the drop is named. Before the tribute check (D58), a session that can open the pages should confirm the [Q] lines.
Matt's 6:23 PM ask, kept on every page: what made the game GREAT (the feel players loved), not just "it had a vine".
**The shelf rule (the lead, 6:30 PM) per level:** 1-9: Mega Man 2 (1988, the classic), Abe's Oddysee and Limbo (lesser-known), none of the
famous few. 2-1: Jungle Hunt (1983, the classic, lesser-known), Bit.Trip Runner (lesser-known), Sonic (the one famous). 2-2: Frogger (1981, the
classic), Wonder Boy (1986, lesser-known), Super Mario Bros. 3 (the one famous). No Pitfall!, Donkey Kong, Crash or DK Jr. as a lead tribute.

---------------------------------------------------------------------------------------------------------------------------------------
## 1-9 The Boa's Branches: "You are the bait"
**(a) The one idea.** "The boa strikes at what moves, so make it strike where the forest can chase it off." A player says: "the one where you tease
the big snakes and set the eagle on the last one." Why it's fun for a sloth on a phone: every answer is a sloth's answer. Drop the forest on it, lead
it to what it fears, or the hardest one for a thumb: **lift your thumb off the glass and do nothing** while it stares. No weapon, no speed. 1-6 was
swinging, 1-7 hiding from the sky and 1-8 running. 1-9 is the first level where Pokey **moves a hunter out of his way** with his head. It is World 1's
exam: every tool from 1-3 and 1-7 comes back, picked at a glance.
**What the code gives (checked):** the boa never walks, sees 280 px both ways, rears 0.8 s, strikes 128 px, then is open 0.8 s; it is beaten by a
trap (chased off), a lure (chased off), stillness (it flees after 4 s) or a punch when open (predators/world1.ts:49-70). It fears the eagle:
`foodChain` chases a boa off when an active eagle's eye is over it (predators/core.ts:221-235, run each step at castPlay.ts:176). A lure post works
only while the animal is AFTER him (predators/lure.ts:1-9; stepLures at castPlay.ts:177). So the bait is real code: he must be seen beside the post.
On the phone: 280 px of sight plus 128 px of strike fits an upright screen (about 425 px of stage, level.md World 1 notes). The boa, the tool and
Pokey are on one screen at every beat (rule 8).
**(b) Tributes** (3 series, 3 eras, one after 2005):
- **Mega Man 2 (Capcom, 1988; Matt #16).** a. Loved for the reading puzzle: "Each Robot Master is weak to the weapons of certain other Robot Masters;
  therefore, choosing the order in which the levels are played is a vital component of the gameplay" [Q] (https://en.wikipedia.org/wiki/Mega_Man_2).
  Nintendo Power ranked it the 6th-best game on a Nintendo platform in its final issue [Q] (https://megaman.fandom.com/wiki/Mega_Man_2). b. How it
  teaches: the obvious matchups are easy to spot, and the full cycle shows itself late, in Wily's boss rush; one writer says working it out "solidified
  my fandom" [S] (https://gameinformer.com/b/features/archive/2013/01/10/moments-discovering-mega-man-2-s-boss-order). c. Ours: three tools, each
  taught alone, then beat 8 shows three boas in a row, and the answer is read from what hangs near each one (a load = drop it, a roost = bait it,
  nothing = the stare). d. Not copied: weapons, robots, bosses, the stage select, the look.
- **Oddworld: Abe's Oddysee (Oddworld Inhabitants, 1997; Matt #52).** a. Loved as a thinking platformer. GameSpot's 1997 review (Joe Fielder, 8.4):
  "the puzzles require lots of thinking, and are well constructed and challenging, instead of cheap and frustrating", "the ideal platformer, balancing
  its action and puzzle elements perfectly", and its AI "goes a long way towards making you feel as if you're interacting with an actual world and its
  inhabitants" [Q] (https://www.gamespot.com/reviews/oddworld-abes-oddysee-review/1900-2546477/). DROPPED: my first draft said Abe's creatures
  fight each other and he gets by on "misdirection". No reachable source backs either, so this tribute rests on the thinking-not-fighting design
  alone. b. Frequent checkpoints and unlimited lives keep the hard puzzles from frustrating, per reviewers [Q] (https://en.wikipedia.org/wiki/Oddworld:_Abe%27s_Oddysee).
  No source on its first level; none claimed. c. Ours: every boa is a small puzzle, not a fight, with a flag before each one (1-8.md's flag rule).
  The finale's eagle-on-boa is the puzzle's last step. d. Not copied: possession, chanting, Mudokons, the factory. Nobody is hurt or eaten.
- **Limbo (Playdead, 2010; Matt #78).** a. PC Gamer (Jody Macgregor, 2020) calls the spider "Limbo's one moment of perfection": "There are plenty
  of spiders in games. This was the best." You beat it with the world: a bear trap's teeth cut its legs, and after three it flees [Q]
  (https://www.pcgamer.com/great-moments-in-pc-gaming-defeating-the-spider-in-limbo/). b. It is met again later, closer, in a new way (the cocoon)
  [Q] (same page). Its designer moved a bear trap out of the spider's first scene "because this caused players to focus on the trap, not the spider"
  [S] (https://www.gamedeveloper.com/pc/gdc-europe-i-limbo-i-s-carlsen-on-making-players-your-worst-enemy-and-your-best-friend). c. Ours: one
  hunter met again and again, a little closer each time, always beaten by the forest. Beat 1 shows the boa first and the load second (the load
  creaks only once the boa is in view). d. Not copied: the dark look, death, cutting legs, the boy, the spider. Nothing is hurt.
**(c) The beats** (graph `A T P T X R W R M R L E`; Normal seconds; flags and hearts by STAGE-RULES:105-109 as in 1-8.md)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | Thick mossy boughs; a shed boa skin draped on a bough (the clue); nothing hurts in 1,300 px | Walks in | "Something big lives here" |
| 1 | **The drop, safe** (T; the boa's `first: 'trap'`) | 14 | A boa coiled on a LOWER bough; he walks above it, out of its reach; a fruit load on a vine over it | Shakes the vine: thud, the boa slides away | "The forest can move it" |
| 2 | **Freeze, then drop** (P) + flag | 16 | A boa on HIS bough; the load's handle is inside its sight | Steps in, it rears (head back, tongue): lifts his thumb; it settles; he hits the handle | "Freeze... NOW" |
| 3 | **The roost, safe** (T, new) + Dot | 14 | A harpy's roost (great feathers on a snag) beside a boa below him | Walks into its sight; it rears at him, next to the roost, and shies off | "It's scared of the eagle's place!" |
| 4 | **Bait it** (X) + R, heart | 16 | A boa on his bough with the roost just past its head | Stands where it sees him across the roost, so it lunges by the roost and flees; a miss costs a heart | "I'm the bait" |
| 6 | **TWIST: the long stare** (W) + R, flag | 14 | A boa on the only bough, no load and no roost | Walks into its face and holds still in the OPEN for 4 s until it gives up. The eagle needs green; the boa doesn't | "Don't. Move." |
| 8 | **Read it** (M) + R | 18 | Three boas in a row: one under a load, one by a roost, one bare | Picks each answer at a glance | "I know this one" |
| 10 | **The Old Boa** (L + signature) | 20 | The longest bough to the exit, the biggest boa, the eagle on its rounds overhead (1-7's eye), moss 300 px back | Lets the eagle see him, runs for the moss, holds still; the dive finds the boa, which pours off into the river with a splash | "I set the eagle on it!" |
| 11 | Exit (E) | 8 | The bough down toward the river; the Old Boa swimming away downstream (to World 2) | Walks out | Clever, proud |
Length ~150 s designed. If the bots read under 2:00, a second "read it" set goes in, never padding. First appearances: trap (1-3, re-shown safe at
1), stillness (1-7, shown on a boa at 2), the roost (new, taught safe at 3), the eagle's eye (1-7) at 10.
**(d) Node string sketch:** `A Tx< Px> Tl< Xl> R Wm R Mxl R Lm& E`. Letters: x = trap (nodeLetters.ts:119), m = cover (:120), & = the eagle (1-8.md
key), **l = lure: a NEW letter** (nodeLetters.ts has none). "m" at W is stillness in the open; the builder checks the key for that case (NODES.md §8).
**(e) Difficulty:** Normal **target 9.5** (DIFFICULTY.md:61, pasted: "1-8 7.5 (the chase), 1-9 9.5"), the hardest in World 1. Hard because every boa
is a reading test (x1 per wrong guess), the stare punishes a twitchy thumb, and the finale chains two hunters. **Easy ~5** (at most 0.6 x 9.5 = 5.7):
the boa's EASY row (tell x1.3, cool x1.5: world1.ts:11), "read it" with two boas, the Old Boa's eagle pass on 1-7's free first pass.
**(f) Engine:** WIRED: the boa def (world1.ts:49-70), drop traps (dropTrap.ts; armed under their animal, w1Cast.ts armedTraps), stillness and cover
(stillness.ts:54, w1Cast.ts W1_STILL), the food chain (core.ts:221, castPlay.ts:176), lure posts in play (castPlay.ts:177), the eagle's eye in gen2
(1-7: w1Arc17.ts, w1Cast.ts eagleOver), boa art (8-1's dozing boa stills, reference/prop-sheets/qa-notes/w8/). EXISTS, NOT WIRED: gen2/lureLay.ts
(tested). **NEW 1 (S):** the boa as World 1 cast rows (awake, under a load, beside a roost) in w1Cast.ts W1_CAST_CREATURES / W1_TRAP_PAIRS,
copying the snake rows (w1Cast.ts:30-40). **NEW 2 (S-M):** lure in World 1: lureLay wired into w1.ts with one LureRow `{ fear: 'eagle' }`, the
`l` letter in nodeLetters.ts, bots that stand in sight beside a post. Roost art: World 8 has roost props (prop-sheets hf-batch-w7w8/w8roost); World 1
needs its own look (one Hugging Face piece, sized to his 89.1 px). The level data takes under 2 h once both are in.
**(g) Not a repeat:** 1-6 swing, 1-7 hide from a watcher in cover, 1-8 run from a collapse. 1-9 *moves* a hunter and *uses* one. 1-7's eagle comes
back as the tool, not the threat. Its "never still on a creak" turn stays 1-7's (w1Arc17.ts:4): 1-9's turn is stillness that needs no cover.
**The outline (GAME-MAP.md:158 on t-design-game-map), kept and changed:** kept the gauntlet, the boa and "lure it off". Changed: "the boa copies
your path" goes. The boa never walks (world1.ts:53, hunt speed 0), and a copying pursuer is C1, 4-12 h of new engine for 1-9 alone (GAME-MAP.md:668,
which already says the boa uses drop traps and the lure instead). So the boa stays put and HE makes it leave: the bait idea comes from that.
**Nature check (for the story keeper):** boas ambush and strike at movement (PREDATORS.md:74); harpy eagles hunt in the canopy; a boa fleeing into
water is real (boas swim). Every ending is chased off or flees, never eaten (MAP-REVISIONS.md:181).

---------------------------------------------------------------------------------------------------------------------------------------
## 2-1 Down to the River: "The river does the running"
**(a) The one idea.** "Ride the logs: the river carries you, you choose the moment to hop." A player says: "the one where you surf logs down to the
village." Why it's fun on a phone: for the first time the thumb can **rest** while he moves; the skill is the one tap at the right moment. That is
a new kind of feel after World 1's walking: a gift of speed. Upright the next log or bank is in view before he must hop; the log-coming tell
(riverArt.ts drawLogComing) shows where the next one slides out. Sideways the whole river fits.
**What the code gives (checked):** logs slide out from under one bank and in under the other and never stop (river.ts:1-10). A log carried under a
bank hands him up onto it (engine.ts:1847-1852), so the reeds never hurt: the danger is the water between logs. The teaching river costs no life:
a splash puts him back on the bank (river.ts:40). Rivers flow with or against him (river.ts:20-22, gapFor :120).
**(b) Tributes:**
- **Jungle Hunt (Taito, 1982-83; Matt #2).** a. Remembered as "four unique adventure experiences", vines, the crocodile river, the boulder run
  and the rescue, which repeat harder once all four are survived [Q] (https://strategywiki.org/wiki/Jungle_Hunt; https://archive.org/details/arcade_jungleh).
  Matt's list: "mixed distinct gameplay styles into one side-scrolling framework". A retro blog scores the arcade game 25/30 and likes the swim
  [Q] (http://frgcb.blogspot.com/2020/04/jungle-hunt-taito-1982.html). Honest warning: one retrospective calls it "essentially an endless parade of
  death traps" [Q] (https://retrovolve.com/jungle-hunt-was-a-terrible-waste-of-quarters/). We take the change of scene, not the deaths. No
  period review found that praises the river; none claimed. b. The river comes straight after the last vine, so you meet it fluent [Q] (StrategyWiki
  above). c. Ours: 2-1 opens in the canopy and climbs DOWN to the river (straight down a vine always climbs). The stage changes mode the way its
  title says, and a splash in the first river costs nothing. d. Not copied: the explorer, the knife, crocodile fights, the rescue, the look.
- **Sonic the Hedgehog (Sega, 1991; Matt #28; this pitch's one famous pick).** a. Loved for speed. Computer and Video Games (Dec 1991, 94%) praised
  its speed and detail, and Paul Rand called it faster and brighter than Super Mario World while crediting Mario with more "depth of play". Mean
  Machines (92%) called it "the best platform game on the Megadrive!" [Q, via the fandom wiki's summary of the magazine reviews; scans not opened]
  (https://sonic.fandom.com/wiki/Sonic_the_Hedgehog_(1991)). In playtests "every player went full speed right off the bat" [S]
  (https://nintendowire.com/news/2018/05/15/sonic-designer-yuji-naka-provides-insight-early-days-sonic-hedgehog/). b. No source on its first act's
  teaching; none claimed. c. Ours: a slow sloth gets the rush of speed he could never run, by riding. The finale strings logs so he flies down the
  river without stopping. Rand's "depth" point is why each river asks a different question. d. Not copied: loops, rings, spin, the hedgehog, the look.
- **Bit.Trip Runner (Gaijin Games, 2010; Matt #75).** a. Loved for the music: "All of the obstacles are placed exactly as the rhythm of the song
  dictates it" (Nintendo World Report), and "With the avoidance of each significant obstacle, the music becomes more layered and enthralling"
  (GamesRadar) [Q] (http://www.nintendoworldreport.com/review/23135/bittrip-runner-wii; https://www.gamesradar.com/bittrip-runner-review/). Its flaw:
  it "tolerates absolutely no mistakes from the player, demanding memorization of each level" [Q] (https://www.engadget.com/2010-05-25-review-bit-trip-runner.html),
  with no checkpoints (NWR, GamesRadar). b. No source on its first level; none claimed. c. Ours: beat 8's logs slide out on the stage clock
  (river.ts logClock), so the hops fall into a rhythm, with a flag before the stretch and a free miss in shallow water. Our music has stems
  (src/assets/music *.beat/.bed/.drive/.shine/.top); layering them on clean hops is an idea for later, NOT claimed as wired. d. Not copied: the
  auto-run, the music, the look, the one-mistake restart.
**(c) The beats** (graph `A D T P X R W R M S L E`)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 8 | 1-9's bough; the river far below, the Old Boa's wake | Walks out | "Down there!" |
| 1 | **Down to the river** (D) | 16 | Vines and ledges down the bank (World 1's last look turning to World 2's) | Climbs down | "A new place" |
| 2 | **The first ride, safe** (T) + Dot | 14 | A teaching river (no life), one slow log WITH him, its log-coming tell | Hops on, rides, is handed onto the bank | "It carries me!" |
| 3 | **Log to log** (P) + flag | 14 | Two logs out of step | Hops log to log | "Now... hop" |
| 4 | **Deep water** (X) + R, heart | 16 | A deep river (a heart), narrower logs | Picks his log | "Careful" |
| 6 | **TWIST: against the flow** (W) + R, flag | 16 | A river flowing back toward the start | Runs along the log, hops forward from it | "Wrong way... run!" |
| 8 | **On the beat** (M) + R | 16 | Short rivers and sand bars, logs leaving on the clock | Hops in rhythm | "hop... and hop" |
| 9 | **The twin rivers** (S) | 14 | Two rivers back to back, one with him and one against, a reed islet between | Rides, hops to the islet, takes the counter-log | "Both ways at once!" |
| 10 | **The long float** (L) | 16 | Logs strung down a fast river to the village jetty, hearts at the bank | Hops log to log without stopping | Speed |
| 11 | Exit (E) | 8 | The village (round doors, PLEASE BE PATIENT, the mailman: w2Stages.ts:10-11) | Walks in | "Home of the waiters" |
**(d) Node string sketch:** `A Dr Tw< Pw> Xw R Ww~ R Mwp R Sw Lw E` (w = water, nodeLetters.ts:113; p = beat pieces :117; ~ = flows back).
The twin rivers are World 2's first taste of "river lanes going both ways" (WORLD-MAP.html:197) without the lanes engine.
**(e) Difficulty: PROPOSED Normal 9.0** (not a per-stage target: DIFFICULTY.md gives those for World 1 only, at line 61). The source and my reason:
the slot formula, DIFFICULTY.md:57, pasted: "**Slots:** target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]", gives
2-1 = 10 - 0.5 = **9.5**, with the reason on line 58: "a first stage just under the last world's end". But World 1's own line (:61) already set
1-9 to 9.5, not the formula's 10, so 9.5 here would TIE 1-9, not sit under it. A new world with a new verb (ride) should open gentler than the
last world's exam. So I propose **9.0**, the bottom of World 2's band (DIFFICULTY.md:56, pasted: "**World band** [10w - 11, 10w + 1]", w = 2:
9 to 21). That is just under 1-9 and still in band. The lead rules. **Easy ~5.4** (at most 0.6 x 9.0 = 5.4): slower logs (river.ts speed rows),
more teaching rivers.
**(f) Engine:** WIRED: drifting logs in play (engine.ts:1838-1855), the river rules and recipes (river.ts), river art and the log tell (riverArt.ts,
engine.ts:106), the teaching-river splash (river.ts:40), vines and descents (World 1). MISSING (the foundation, once for all of World 2): **a gen2
World 2 kit**, `src/game/gen2/worlds/w2.ts` + a stageTable.ts row (World 5-8 kits run 271-351 lines). Today 2-1 to 2-3 are hand-built in
w2Stages.ts (1,204 lines), which the kit replaces. **NEW 1 (M):** the river as a gen2 section, a river window between two banks from a socket,
reading river.ts recipes (new `src/game/gen2/riverLay.ts`; the `w` letter already names "drifting logs on a drawn river", nodeLetters.ts:133).
That is 2-1's only NEW block.
**(g) Not a repeat:** nothing hunts him and nothing chases; the new verb is RIDE. 1-8's speed was fear behind him; 2-1's speed is a gift under him.
**The outline (GAME-MAP.md:182), kept and changed:** kept the sprint to the village and the drifting logs. Changed: "step off before they go
under the reeds" is not a danger in play (the bank takes him, engine.ts:1847-1852), so the danger is the water between logs. Added the climb down
(the title) and the twin rivers. Not used: B3 lanes (GAME-MAP.md:641, 8-12 h) and B4 moving platforms (:642). The twin rivers give a taste of
"both ways" from river.ts as it stands, so 2-1 waits only on the kit and the river lay.

---------------------------------------------------------------------------------------------------------------------------------------
## 2-2 Petals for the Crown: "The pond breathes"
**(a) The one idea.** "Pads sink while you stand and come back up when you leave: dance across the pond for the crown's petals." A player says: "the
one where the lily pads go down and come back up." Why it's fun on a phone: it's a rhythm game played on a pond. Go, go, WAIT, go: the skill is
knowing when a pad you sank is back. That is World 2's own theme, patience ("a village of waiters", WORLD-MAP.html:196). It is a harvest stage
(petals), so he crosses the pond back and forth: a puzzle of order, not a dash. Upright every pad's shiver (its warning) is on screen before he lands.
**What the code gives (checked):** a sinking pad is a beatBrick 'gone' whose count runs only while he stands on it and runs back when he leaves
(ride.ts:9, :100-110). Once sunk it stays down 0.6 s after he leaves (RIDE.padRise, ride.ts:23), then rises through its warning. The same brick on
the stage clock sinks on a beat by itself (beatBrick.ts:11). Not wired: nothing calls newPad/stepPad outside ride.ts.
**(b) Tributes:**
- **Frogger (Konami, 1981; Matt's own favourite, INSPIRED-BY.md:7; idea row "Sinking pads | Frogger's diving turtles", :84).** a. Its river is the
  heart: "Turtles are also safe - as long as they're afloat" [Q] (https://www.lemon64.com/review/frogger/356), and "The turtles only float above water
  for a few seconds and then sink so it is good to study the timing for using them" [Q] (https://gamefaqs.gamespot.com/intellivision/576831-frogger/reviews/173019).
  A MobyGames critic: "definitely one of the better arcade games of the time" [Q] (https://www.mobygames.com/game/1540/frogger/reviews/). Studying
  the timing is the love. b. No source on its first-screen teaching; none claimed. c. Ours: the pad's shiver is the tell, it comes BACK up like a
  turtle, and the twist sinks a row together on the pond's beat, as a turtle group dives. d. Not copied: the frog, traffic, the homes, the timer, the look.
- **Super Mario Bros. 3 (Nintendo, 1988; Matt #15; this pitch's one famous pick).** a. Loved for variety: "A particularly engrossing game, packed with
  power-ups, a few mini-games, and some truly devious levels", its level design "unique and varied" [Q] (https://www.nintendolife.com/reviews/nes/super_mario_bros_3).
  Its donut lifts shake when stood on and fall soon after [S] (https://www.mariowiki.com/Donut_Lift). b. Its levels show a thing, then break the
  pattern; in its second level the player "is introduced to slopes and gets to experiment" [S]
  (https://gamedev.net/articles/game-design/game-design-and-theory/super-mario-bros-3-level-design-lessons-part-1-r4682/). c. Ours: beats 1-3 set
  the pattern (weight sinks a pad); the twist breaks it (the pond's own beat sinks them). d. Not copied: donuts, Mario, power-ups, the look.
- **Wonder Boy (Escape / Sega, arcade 1986; Matt #8, the lesser-known pick).** a. Its vitality meter "constantly runs down at a steady pace and can only
  be refilled by collecting fruit throughout the level" [Q] (https://www.retrogames.cz/play_175-SegaMS.php). Sega Does calls it "perhaps the most
  unique feature of the game" [Q] (https://segadoes.com/2014/10/16/wonder-boy/), and another review says it made the game "more tactical and
  interesting" [Q] (https://www.simbasible.com/wonder-boy-game-review/). Honest warning: Infinity Retro says it "adds a sense of urgency" but
  "hinders the game more than it helps it" [Q] (https://infinityretro.com/wonder-boy-review/). So ours drains ONE pad, never the whole level. b. The
  fruit sits along the path from the start, so the meter teaches itself as you run (retrogames.cz above). c. Ours: each pad is a little meter: it
  drains while he stands, he can see it (the shiver), and the petals sit ON the pads, right where he must not linger. Extra crown petals sit on
  risky pads off the path, for the player of 12 and up, never needed. d. Not copied: the meter bar, the skateboard, the hatchet, eggs, the look.
**(c) The beats** (graph `A T P X R W R M R S L E`)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 8 | The village pond garden; far off a giant lily, its crown flower closed | Walks to the edge | "What's that?" |
| 1 | **The first pad, safe** (T) + Dot | 14 | One pad over shallow water: it shivers, sinks, rises again | Stands, feels it go, hops back; watches it return | "It came back!" |
| 2 | **Keep moving** (P) + flag | 14 | Three pads, a petal over each | Hops pad to pad without stopping | "Don't stand" |
| 3 | **There and back** (X) + R, heart | 18 | A petal at the far end of a pad row; the only way out is back over it | Waits on the far bank for the pads to rise, then goes | "Wait... go" |
| 5 | **TWIST: the pond's beat** (W) + R, flag | 16 | A row that sinks and rises TOGETHER on the clock, weight or not | Reads the breath, crosses on the up | "They're breathing" |
| 7 | **Both kinds** (M) + R | 18 | Weight pads, beat pads, a drifting log through (2-1), extra petals on risky pads | Picks a route | "My way" |
| 9 | **The crown lily** (S) | 12 | A giant water lily that never sinks; its flower opens white as he arrives | Stands on it as long as he likes; picks the crown petals | "WHOA, it holds me" |
| 10 | **Across the deep** (L) | 16 | Deep water (a heart), both kinds, to the far bank | All of it | "Almost..." |
| 11 | Exit (E) | 8 | The village bank, petals for the crown | Walks out | Proud |
**(d) Node string sketch:** `A Tp< Pp> Xp R Wp R Mpw R Sw Lp E` (p = beat pieces, nodeLetters.ts:117; w = water). `p` here is the sinking pad.
**(e) Difficulty: PROPOSED Normal 12.5** (not a per-stage target: World 2 has none in DIFFICULTY.md). The source: the same slot formula
(DIFFICULTY.md:57, pasted above) gives 2-2 = 10 + T[1] = 10 + 3 = **13**. I keep the formula's step up from 2-1 (+3.5 from 9.5) and apply it to
my proposed 9.0, for **12.5**: a real climb after the opener, in band (9 to 21, :56). The lead rules. **Easy ~7.5** (at most 0.6 x 12.5 = 7.5):
the pad's count stretched (beatBrick: "Easy stretches every brick on a clock together", beatBrick.ts:4), the twist's row slower, the deep water
only at the finale.
**(f) Engine:** WIRED: lily art (riverArt.ts drawLily), drifting logs, deep water. EXISTS, NOT WIRED: the sinking pad (ride.ts:100-110), the beat
brick 'gone' (beatBrick.ts:11), gen2/rideLay.ts (tested). Needs the World 2 kit (2-1's foundation). **NEW 1 (M):** sinking pads in play: stepPad
run by the engine (engine.ts beside the drift-log loop, ridePlay.ts), plus a pad row in rideLay (gen2/rideLay.ts); the beat pad is the same brick
on the clock. **NEW 2 (S):** the crown lily, a broad lily platform that holds, with its flower opening, sized to Pokey (the lily art at scale, or one
Hugging Face piece if it doesn't scale).
**(g) Not a repeat:** 1-8 was "never stop" because something chased; 2-2 is stop and go because the floor breathes, and the best move is often to
WAIT. Nobody hunts in it.
**The outline (GAME-MAP.md:183 on t-design-game-map), kept and changed:** kept the harvest, the petals and the sinking pads (B5 "things on a beat", GAME-MAP.md:643).
Changed: pads also RISE again (ride.ts:22-23 already does this), so the level is about waiting as well as moving. Added the
pond's-beat twist and the crown lily. Left out: the ferry sluice room (built). One idea per level (rule 1); it can come back as a puzzle room (`Z`)
if the bots read under 2:00.
**Nature check:** the giant Amazon water lily's leaf can reach about 2-3 m and hold the weight of a small child; its flower opens white on the first
evening and pink on the second (https://en.wikipedia.org/wiki/Victoria_amazonica; https://www.smithsonianmag.com/smart-news/how-much-can-a-giant-waterlily-hold-see-one-carry-183-pounds-before-sinking-winning-a-social-media-contest-180987268/).

---------------------------------------------------------------------------------------------------------------------------------------
## The engine both World 2 levels need, ranked (what the lead plans from)
| # | Block | Size | File | Needed by |
|---|---|---|---|---|
| 1 | gen2 World 2 kit (replaces the hand builds; new replaces old) | M-L | src/game/gen2/worlds/w2.ts, stageTable.ts; deletes w2Stages.ts's 2-1..2-3 | every World 2 stage |
| 2 | River as a gen2 section (drift logs between banks, recipes) | M | src/game/gen2/riverLay.ts (new), river.ts | 2-1, 2-2 beat 7, 2-4, 2-7 |
| 3 | Sinking pads in play + a rideLay pad row | M | engine.ts, ridePlay.ts, ride.ts:100-110, gen2/rideLay.ts | 2-2, later ponds |
| 4 | Beat pads (the same brick on the clock) | S | beatBrick.ts:11, beat.ts | 2-2 twist; the 'bites' twin is 2-5's snap stones |
| 5 | The crown lily | S | the World 2 kit's props + art | 2-2 |
| later | Lanes (MISSING), followers (follow.ts, MISSING), lifts via rideLay | M each | - | 2-3, 2-6, the "both ways" river |
Order (D40): 1, then 2 (2-1 builds), then 3 with 4 (2-2 builds), then 5. Neither level is "under 2 hours" until 1 lands: name that to Matt
plainly. After it, each is its blocks plus under 2 h of level data.

## Learned
- Read the engine before the map: the map says "step off before the reeds", but the engine hands him up onto the bank (engine.ts:1847-1852), so
  the reeds were never a danger. A pitch built on the map line would have promised a hazard that does not exist.
- Check the levels before yours in the CODE, not the design list: 1-7's "never still on a creak" turn is already built (w1Arc17.ts:4), which
  ruled out the twist I first drafted for 1-9.
- Proposed level.md rule (for the lead): "A pitch names, for every verb it asks for, the file:line that makes it true in play (not only the def)":
  the boa's lure works only while it is after him (lure.ts), and that one line decided the whole of 1-9's idea.
- Say what the network allows before the research, not after: this session opens no web page, so the honest form is [Q]/[S] marks, with drops
  named, and a hand-off to a session that can open the pages. The lead found this at review; it should have been in the first report.
