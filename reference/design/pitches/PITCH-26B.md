# PITCH-26B (OPEN LENS): 2-6, 2-7, 2-8, "the river turns, the river flows, the river rises"
Pitcher B (PITCH-26-28.md, pitch.md step 2b), on origin/main 6e7b85f8. Written 12:14 PM ET 11-18. Not read: GAME-MAP.md, any 2-6/2-7/2-8 pitch or design,
t-pitch-26a. Read: the packet (which itself prints A's three GAME-MAP rows: Pushback 1), pitch.md, level.md, 2-4.md (the bar), PICKS-23-25.md (2-3's
followers), the code below. Node strings run: `npx tsx reference/specs/sims/nodes2628b.ts` (all three: "checkCode: no errors").

## The three as one ladder (World 2's river, used three ways)
| Level | The river... | The one idea | Ladder musts |
|---|---|---|---|
| 2-6 Up the Bank Houses (ascent) | TURNS | Ride the village's water wheels up the bank, street by street | none (a tower: storeys already run both ways, w1Arc14.ts:6-7) |
| 2-7 The Mailman's Route (sprint) | FLOWS | Post the letters UP the river against the current, then turn at the weir and ride the current home LEFT, racing the mail boat | (2) TEACHES the first run back to the left (the T sits on the /L leg) |
| 2-8 Before the Water Rises (rescue) | RISES | Free them out along the low marsh, then walk the whole line home LEFT before the flood closes the low road | (1) followers come home under a new pressure; (2) the run left asked in full, leading a line |
**Facts checked on main 6e7b85f8 (law 3):** archetype ascent is laid UP as a zigzag tower (pipeline.ts:439; tower.ts:1-10). Moving floors carry the rider: a lift moves y,
a sway moves x (engine.ts:1842-1857; lift.ts:2 "rope-and-basket lift (2-7)", hand-built only). Carry rule: "a jump off anything that carries him keeps its sideways speed"
(carryRule.test.ts:2). His run is 285 px/s (physics.ts:13 maxRun). A left leg is laid by gen2 (legs.ts:1-12, `/L` marks; legs.test.ts:20) and no shipped stage uses one;
a river on a left leg flows mirrored (pipeline.ts:2884); the look-ahead faces left (cameraFollow.ts:164-165); bots follow a stage's route legs (tools/inspect/towerRoute.ts:2).
World 2 rows: `back` dir -1 70 px/s, `twin` 80, `long` 80 (w2.ts:78-84). A river zone can flood: `flood {y1, seconds, trigger}` (river.ts:53, floodLevel :79); the
hand-built 2-8 basin "rises ... and stops 10 px under the banks" (w2Stages.ts:738). Reed cages on pulleys (w2Stages.ts:891). Followers (2-3, not on main): "walk HIS
recorded path, slower than him (Normal 190 px/s, Easy 230)"; "never climb, ride or fall ... they wait at a climb's foot" (PICKS-23-25.md:8,12, lead branch @088124ad).
No wheel, orbit or noria exists anywhere in src/ (grep, 11-18). Story lines: stagePlan.ts:71-73; the mail carrier's cels: storyCels.ts:75.

---
## 2-6 Up the Bank Houses: "The Water Wheels"
**One idea:** "Step into a water wheel's bucket at the river and let it carry you up and over to the next street of houses." A player says: "the one where the wheels lift you."
**Why it's fun for a sloth on a phone:** the river village's own machine (a noria: a wheel the current turns, its buckets lifting water to the houses) does the climbing; the
thumb's job is two calm moments, ON and OFF. Boarding at the bottom is 2-1's log step (the bucket comes along the bottom at a log's speed); a missed stop just rides round again
(soft). It never stops, so "nothing stands still"; it's slow, so it's a sloth's lift. Upright: a teach wheel's whole circle and the street lip it serves fit the ~425 px view
(rule 8, to prove on stills). Sideways: the camera rises with the bucket; the top lip must be in view before the step-off (the risk to shoot first).
**Tributes (lead from Blocks 3-4; one from anywhere)**
- **Tower Toppler / Nebulus** (Hewson 1987; pre-1990, lesser-known; Matt's favourites). a. Loved: Orson Scott Card: "As an action game, it's just plain fun"; Zzap!64 Gold Medal
  (https://en.wikipedia.org/wiki/Nebulus_(video_game)); twenty years on Media Molecule still remember it: Alex Evans: "What was that old Amiga game where you were on a frog, and you
  were going around a tower?" Mark Healey: "That was a C64 game. Nebulus." (https://www.gamedeveloper.com/design/the-media-molecule-identity). b. Taught: the goal is the top:
  "Pogo starts from the bottom and finds the way to the top", ledges "connected by elevators" (Wikipedia). c. Ours: the bank IS the tower; its elevators are wheels that never
  stop. d. Not copied: the rotating tower, the toppling, being knocked off.
- **Klonoa: Door to Phantomile** (Namco 1997; Block 3 #53; lesser-known). a. Loved: 1UP: "Klonoa is one of the best platforming games of all time"; Giant Bomb: "Klonoa is
  light-hearted fun"; Game Informer: "the 2.5D mechanic was innovative" (https://www.gamedeveloper.com/console/critical-reception-namco-bandai-s-i-klonoa-i-). b. Taught: [S] its
  windmill village is the first place you walk through. c. Ours: the warmth of a lived-in village climbed THROUGH (in at a door, up inside, out the roof). d. Not copied: grabbing
  and throwing creatures, the bending 2.5D path.
- **Shovel Knight** (Yacht Club 2014; Block 4 #82; post-2005). a. Loved: GamesRadar: "Every level is completely different from the last, with new traps like falling chandeliers
  and spurts of lava being regularly introduced. It's a fun way to drive you to play 'just one more level'" (https://www.gamesradar.com/shovel-knight-review/). b. Taught: "Shovel
  Knight lacks any real tutorial ... no handholding" (same page): each stage meets its gimmick safe, then builds on it. c. Ours: ONE gimmick, the wheel, met safe over soft water,
  then over the top, then as a throw, then the great wheel; Dot says one line before it (we teach; they didn't). d. Not copied: the shovel, the pogo, combat.
**The arc** (tower storeys = streets of bank houses; turns = wheels or a house's inside ladder)
| # | Token | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | A | The millpond at the foot of the bank; the first wheel creaking, dripping; round doors up the bank; Dot's teach 800 px+ before beat 1 (rule 6) | Watches it turn | "It's huge" |
| 1 | Tp1^:#soft | THE FIRST WHEEL, SAFE: one slow wheel over the soft pond; a bucket comes along the bottom like a log | Steps in, rides up, steps off at the top | "It's lifting me!" |
| 2 | Pg1< | The first street: porches, lit windows, washing, petals | Walks, looks down | "We're up!" |
| 3 | Uc1^ | Through a house: in at its door, up its ladder (the tower's climbing turn, dressed), out the roof | Climbs | "In the front, out the top" |
| 4 | Pw1>:#soft | The millrace that feeds the next wheel: logs drift in the channel (2-1's skill) | Hops across | "So that's what turns them" |
| 5 | Xp1^ | OVER THE TOP: a wheel turning away from the street; the porch it serves is only reached past the top, on the way down | Rides up and over, steps off going down | "Over... and off!" |
| 7 | Pf1< | The hanging porches: plank porches on ropes between houses, petals (after R 6) | A breath | "Ahh" |
| 8 | Wp1> | TWIST, THE WHEEL THROWS YOU: a gap no standing jump clears; jump as the bucket crosses the top (moving sideways: the carry rule keeps it) | Times the jump | "It threw me!" |
| 10 | Cb1^ | COMBINE: off a wheel's top onto World 2's bounce, up to the highest street (after R 9) | Rides, drops, bounces | "Up, up, UP" |
| 12 | Sp1^< | SIGNATURE, THE GREAT WHEEL: the village's biggest wheel lifts him the last bank; the camera pulls out over the whole river (2-1..2-5 below) (after R 11) | Rides the whole way up | "I can see everything!" |
| 13 | E | The crest of the bank, the shrine | Walks off | "Top of the world" |
**Node string** (checkCode: no errors): `A Tp1^:#soft Pg1< Uc1^ Pw1>:#soft Xp1^ R Pf1< Wp1> R Cb1^ R Sp1^< E` (14 tokens; p 3 of 8 content, the cap; no neighbours share).
**Targets** (pasted, DIFFICULTY.md on main): "target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]" (:63) -> Normal **15.0**; "World band [10w - 11, 10w + 1]"
(:62) 9..21; "Easy at most 0.6 x Normal" (:61) -> Easy **<= 9.0**. Meter form: a timed step-off is log2(1 + cycle / window) (:18); the dial is the throw's gap (beat 8).
**Engine** (2 NEW). WIRED: the ascent tower lay, moving floors that carry (engine.ts:1842), the carry rule, World 2 rivers (riverLay.ts), bounce, the climbing turn. Kept out on
purpose: the basket lift (lift.ts, exists-unwired) so 2-6 is the wheel's alone. **NEW 1 the water wheel** (M, 3-4 h): src/game/wheel.ts, pure like lift.ts (bucket i's x, y
at time t on a circle, buckets stay level); `Platform.wheel` read in engine.ts:1842's loop (dx AND dy: lift does y, sway does x); a gen2 place kind laying a wheel as a TOWER TURN
(tower.ts turns are vines today) with its fairness (the step-off lip within reach at the top, a miss rides round or splashes soft); a toy on a stageTable row (rule 23). Art: wheel
and bucket by Hugging Face (the lead's call), the bucket 110-130 px wide (a log's 150, Pokey 89.1 px drawn). **NEW 2 bot skill `ride-wheel`** (S-M, 1-2 h; firsttimer.ts SKILLS):
board, step off at the lip, jump at the top for beat 8; a planted toy RED without it (rule 21).
**Fly before build (rule 24; NOT flown here):** rim speed from World 2's logs, 70-80 px/s (w2.ts:78-84), so boarding is 2-1's step; radius 160-200 px -> a turn 13-17 s;
5-6 buckets -> one every 2.6-3.4 s (near the river's 3.9 s beat); beat 8's gap = the flown standing reach + the flown gain of +75 px/s carried.
**Risk:** beat 4 lays a river on a tower storey (riverLay under flow 'up' is unproven); if the toy refuses it, beat 4 becomes stepping stones (Pg), no new piece.
**Different:** 2-1..2-5 ride sideways (logs, pads, vines over logs, biting stones); 2-6 is the first ride UP and the first circle. 2-7 rides the river both ways; 2-8 rides nothing.

---
## 2-7 The Mailman's Route: "Ride the River Home"
**One idea:** "Carry the post up the river against the current, past every door marked PLEASE BE PATIENT; at the weir turn round and let the current carry you home, racing
the mailman's boat." A player says: "the one where you race the post boat back."
**Why it's fun on a phone:** the same river, two feelings. Out, logs come AT him (`back`, dir -1): on a log he makes 285 - 70 px/s and every hop is short and careful. Home,
every log runs his way and he runs ON it: 285 + 80, and the carry rule keeps that in the leap: the longest, fastest jumps in World 2, earned by the slog out. A rival he can SEE
(the mail boat in the river beside him) makes a race a child reads with no clock. The doors: a letter posts itself as he passes each PLEASE BE PATIENT door going out (one thumb
stays on moving); coming home those doors stand open, a reply on each step: the sign's joke pays off (they took their time) and the home leg gets its pickups. Running left is
the same thumb the other way; the view looks ahead to the left (cameraFollow.ts:164-165).
**Tributes**
- **Paperboy** (Atari 1984/85; pre-1990; from anywhere). a. Loved: "You were scored on accuracy - throw a paper to the front door or in a mailbox, and your score would soar";
  "The game was bright, cheery, and inviting in that usual Atari way" (https://www.gamedeveloper.com/production/retro-game-of-the-day-paperboy). b. Taught: the street tells you
  (same page: subscribers' houses friendly, the others dark). c. Ours: the door's sign tells him; posting is automatic on the pass. d. Not copied: throwing, aiming, smashing.
- **Wario Land 4** (Nintendo R&D1 2001; Block 3 #64; lesser-known). a. Loved: "you need to hit the Frog Switch at the end of a stage to open its exit portal, spurring a race
  back to the start against the clock. It's a thrilling finish in itself, but it also forces you to reconsider the level itself"
  (https://www.gamesradar.com/wario-land-4-mario-fatter-arch-nemesis/, opened by download). b. Taught: one switch at the far end marks the moment the run home begins. c. Ours:
  the weir is the switch (the boat sets off); the way home is the same river read the other way, with him now. d. Not copied: the countdown, losing coins, blocked routes.
- **Kirby Super Star Ultra, Gourmet Race** (HAL 2008 DS; Block 3 #68; post-2005). a. Loved: "the fantastic music that accompanies the race", "running across a set number of
  levels against King Dedede" (https://www.gamedeveloper.com/design/kirby-super-star-retrospective). b. Taught: [S] the rival runs the same course in view. c. Ours: the boat
  in view the whole home leg. d. Not copied, from the same page's warning ("the mini-game gets pretty stale after the initial few runs"): the race is one leg of one level, never a mode.
**The arc** (the river flows LEFT, toward the post office: out is upstream, home is downstream)
| # | Token | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | A | The post office jetty; the mail carrier (storyCels.ts:75) hands him the satchel; the first door up the bank | Sets off right | "Off we go" |
| 1 | Pg1> | The bank path, the first PLEASE BE PATIENT doors; each takes its letter as he passes | Runs, posts | "Post! Post!" |
| 2 | Pw1>:#soft | Logs coming AT him (`back`, soft) | Short hops on, off | "Hard going" |
| 3 | Pf1> | Porch walks hung off the bank houses over the water, doors along them | Hops plank to plank | "Nearly at the weir" |
| 4 | Xw1> | The wide water against the current (deep: Dot's water line, w2.ts:66-67), log to log upstream; required | Fights upstream | "Come on..." |
| 5 | R | THE WEIR: the last door; the mail boat at the weir pool sets off home as he arrives; Dot's teach for the turn, 800 px before beat 6 | Turns round | "Race you!" |
| 6 | /L Tg1<:#soft | TEACH, THE FIRST RUN BACK TO THE LEFT: a calm bank running left, the doors he passed now open, replies on the steps; soft water only | Runs home, collects | "Home's this way!" |
| 7 | Pw1> | The first ride WITH the current: a slow log carrying him left; he runs along it | Rides and runs | "It's pushing me!" |
| 8 | Pb1> | A bounce onto the porch walk, the shortcut over the boat's bend | Bounces | "Over them!" |
| 9 | Ww1> | TWIST, LOGS FASTER THAN THE BANK: `twin` with him; every leap long (the out leg's short hops flip to flying) | Leaps log to log | "I'm flying!" |
| 11 | Cs1> | COMBINE: a porch liana; let go onto a log running his way (2-4's drop, with the current) (after R 10) | Swings, drops, rides | "Wheee" |
| 13 | Sw1> | SIGNATURE, THE LONG RIDE HOME: `long`'s 240 px log down the last reach, the boat neck and neck, the village waving (after R 12) | Runs the log | "Neck and neck!" |
| 14 | E | The jetty; the boat bumps in just after (or before) | Walks in | "Beat you!" |
**Node string** (checkCode: no errors): `A Pg1> Pw1>:#soft Pf1> Xw1> R /L Tg1<:#soft Pw1> Pb1> Ww1> R Cs1> R Sw1> E` (15 tokens, legs right then left; w 4 of 9, the cap).
**Targets** (DIFFICULTY.md:61-63 as above): T[7] = 8 -> Normal **18.0**, band 9..21, Easy **<= 10.8**. The dial: the out leg's crossing (beat 4) and the twist's row speed.
**The race never locks** (a sprint's exit never locks: stagePlan.ts:61): beating the boat is the medal; its pace is flown to reach the jetty ~3 s after a steady
Normal bot (Easy ~8 s). No clock on screen.
**Engine** (2 NEW). WIRED: rivers and rows (riverLay.ts, w2.ts:78-84), lianas, bounce, the carry rule, the water warning, the door art (w2Stages.ts:700), the carrier's cels.
EXISTS-UNWIRED (toy-proven, never shipped): the /L leg (legs.ts, legs.test.ts:20), its mirrored river (pipeline.ts:2884), the left look-ahead, route bots (towerRoute.ts).
2-7 is its first real row: the ready gate (rule 23) proves flags, petals, bots and the run lead (cameraFollow.ts:169) on the left leg. **NEW 1 the mail boat pacer** (M, 2-3 h):
a drawn boat that leaves the weir when he passes and runs the home leg at a set pace, compared at E (medal only); reuse the chase's route clock (gen2/chaseLay.ts, a runner
ahead instead of behind); boat art by Hugging Face (the lead's call). **NEW 2 the post** (S, 1 h): a PLEASE BE PATIENT door takes a letter on the pass (a counted collectible
at the door); on the home leg the same doors stand open with a reply (collectible); the sign and letter art. **If the bots can't run the left leg, that is a third NEW:** then
the post drops to petals in letter art (data only).
**Fly before build:** the leap off a log at +80 px/s carried vs standing (both rows); the out leg's `back` crossings at 70 px/s; the boat's pace from the bot's home-leg time.
**Different:** 2-1 rides one way; 2-4 boards from the air; 2-7 is the first stage that turns round, the same river both ways, and the first rival. 2-6 goes up; 2-8 walks.

---
## 2-8 Before the Water Rises: "Walk Them Home"
**One idea:** "Free the little ones out along the low marsh, then walk the whole line home before the rising river closes the low road, or take the long high road round."
A player says: "the one where you lead them home before the flood."
**Why it's fun on a phone:** Choplifter's out-and-back with Abe's line behind you. The out leg grows the line (each cage a small wired puzzle); the home leg is about PACE: too
fast and they straggle (Normal 190 px/s to his 285), too slow and the water takes the short road. Nobody is hurt: the flood only closes the low road (deep water is a wall the
line waits at), and the high road (carved steps, walkable, w2Stages.ts:560 stairs) is always open (rule 5). No commands: the line follows his path, so one thumb leads it.
2-3's heron wanted them STILL; 2-8's water wants them QUICK: the same friends, the opposite lesson.
**Tributes**
- **Choplifter** (Dan Gorlin, Broderbund 1982; pre-1990; from anywhere). a. Loved: Gorlin: "It was also a game that had the reputation of being non-violent." "So between those
  two things, every kid wanted it, and every parent was willing to buy it for them." (https://www.gamedeveloper.com/business/-i-choplifter-i-from-1982-to-2012); the C64 Home
  Companion: "the hostages running across the desert" made it alive (https://en.wikipedia.org/wiki/Choplifter). b. Taught: home is where you start; "the helicopter can only carry up
  to 16 passengers at a time, meaning several trips are necessary" (Wikipedia); Gorlin's rule "Simple to learn, hard to master" (GD). c. Ours: one trip out, one trip home, the
  line paddling and running behind him. d. Not copied: tanks, jets, shooting, the repeat trips.
- **Oddworld: Abe's Oddysee** (Oddworld Inhabitants 1997; Block 3 #52; lesser-known). a. Loved: GamesRadar: Mudokons "instructed to follow you to an exit portal with taps of the
  D-pad"; "The further you push through the 5-10 hour story, the more approaches the game places at your disposal" (https://www.gamesradar.com/oddworld-new-n-tasty-review/,
  opened by download). b. Taught: [S] one worker at a time, then groups. c. Ours: no GameSpeak at all; his pace is the only command. d. Not copied: deaths, the grim ending.
- **Ori and the Blind Forest, the Ginso Tree escape** (Moon Studios 2015; Block 4 #84; post-2005; the one famous-few). a. Loved: PC Gamer: "Ori always knows when to teach you a
  new skill and when to push your mastery of it. The most memorable level in the game is the timed escape from the Ginso Tree in which you have to constantly keep ahead of the
  quickly rising water. It pushed me to execute a lot of a particular jump move that the preceding level made me practice quite a bit." (https://www.pcgamer.com/whats-the-best-level-of-the-decade/,
  opened by download). b. Taught: in the level before (same quote). c. Ours: 2-3 practised the line, 2-7 the run left; 2-8 asks both with the water rising. d. Not copied:
  dying to the water (same page: "I fumbled and died"): ours closes a road, never takes a life or a little one.
**The arc** (home, the village jetty, is LEFT; the cages are out to the right)
| # | Token | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | A | The high jetty, parents waiting; the river high and brown; the low marsh path runs right | Sets off | "Hold on, little ones" |
| 1 | Pg1+:+cage | The first reed cage on the bank (stones into the counter-basket, w2Stages.ts:891) | Frees it; it falls in behind | "Come on!" |
| 2 | Tw1:#soft@flood | TEACH, THE WATER RISES: a dip between banks fills as he watches (soft); the steps beside it stay dry; Dot 800 px before | Leads the line through while it's shallow | "It's getting deeper!" |
| 3 | Pp1+:+cage | A cage past a pond of pads (2-2's pads); the line paddles under | Hops the pads | "They're swimming!" |
| 4 | Xf1+:+cage | The far cage on a reed island: plank hops over a deep channel (required); the line paddles the soft side-channel | Last cage | "Last one!" |
| 5 | R | The last cage opens and the river turns: the flood starts (river.ts:53 trigger); Dot: home, now | Turns round | "Uh-oh" |
| 6 | /L Kg1>:#water@flood | PRESSURE: the low path home, dips filling ahead | Keeps them moving, never too far ahead | "Stay close, stay close" |
| 8 | F[Pf1+\|Pw1] | THE FORK THE WATER DECIDES (after R 7): low = the short marsh road, open only until the flood turns it deep; high (+) = up the steps, along the porches, petals, always dry | Chooses by the water | "Can we make the short way?" |
| 9 | Kg1> | PRESSURE: the reed bank home, water lapping the path | Paces the line | "Nearly..." |
| 11 | Sg1< | SIGNATURE, THE PARADE: the stilt boardwalk to the jetty, all seven behind him; the water rises to lap the boards and stops just under them (as the hand-built basin stops under its banks, w2Stages.ts:738): the flood's drama with no fail (after R 10) | Walks them in | "Everyone made it!" |
| 12 | E | The jetty: each little one runs to its family | Watches | "Home" |
**Node string** (checkCode: no errors): `A Pg1+:+cage Tw1:#soft@flood Pp1+:+cage Xf1+:+cage R /L Kg1>:#water@flood R F[Pf1+|Pw1] Kg1> R Sg1< E` (13 tokens; g 3 of 7, the cap).
**Targets** (DIFFICULTY.md:61-63): T[8] = 7 -> Normal **17.0**, band 9..21, Easy **<= 10.2** (a slower flood, the line at 230 px/s, fewer cages). The dial: the low road's open time.
**Count:** 7 little ones in 3-4 cages ("more" than 2-3's; the hand-built 2-8 asks 7, w2Stages.ts:46). A line of 7 about 50 px apart (~350 px) plus him fits one upright view (rule 8, prove).
**Engine** (2 NEW). WIRED: reed cages, pads (w2.ts:91), the fork F, carved steps, a river zone's flood (river.ts:53, :79) and the hand-built basin (w2Stages.ts:708-748).
BY 2-3: followers (follow.ts). BY 2-7: the /L leg. **NEW 1 the flood in gen2** (M, 2-3 h): a World 2 row for a run's low road that floods from a trigger (the last cage) over
`seconds` and turns deep at its top (Dot's water rule), with the fork's fairness: the high road always open, the low road's open time flown against the line's walk (both settings).
**NEW 2 followers meet the flood** (S-M, 1-2 h, follow.ts): deep water is a wall they wait at (as a climb's foot); one in the water when it turns deep is set on the near bank, never lost.
**Fly before build:** the line's walk from the last cage to the fork at 190 / 230 px/s vs the low road's open time; the boardwalk's lap height vs the flood's stop.
**Different:** 2-3 keeps them still for a heron; 2-8 keeps them moving for the water. 2-7 rides the river home; 2-8 walks it with seven behind him. 2-6 goes up.

---
## Learned
- Read the follower scope before pitching a rescue: "never climb, ride or fall" (PICKS-23-25.md:12) decided 2-8's whole shape (home along the ground, the flood closing a road).
- The carry rule makes direction a feeling: the same river is a slog one way and a flight the other (285 -/+ the log). A level can be one river read twice.
- Research: WebFetch cuts gamesradar and pcgamer pages short; downloading the page and reading its paragraphs opened them. `gamedeveloper.com` without `www.` does not resolve;
  hardcoregaming101.net was in maintenance (11-18).
## Pushback
1. **The open lens leaked.** PITCH-26-28.md's "PITCHER A" paragraph prints GAME-MAP's three rows into the one packet both pitchers read. B's 2-7 shares their out-and-back-left
   shape; I kept it because the story line says it ("Take the long way round the river", stagePlan.ts:72) and it is the ladder's natural teach, but don't score 2-7's SHAPE as an
   open-lens find (the current both ways, the boat and the post are B's). Fix (pitch.md 2b): B's packet is its own file without A's paragraph.
2. **"Bring them UP ahead of the water" (GAME-MAP's 2-8 as printed) conflicts with 2-3's picked scope**: followers "never climb, ride or fall ... they wait at a climb's foot"
   (PICKS-23-25.md:12). Taking them up needs climbing or riding followers: a third NEW on 2-8. B brings them home LEFT along the ground: follow.ts only learns the water.
3. **"The first run back to the left" needs a ruling:** 1-4's tower already lays storeys either way ("which side a storey runs", w1Arc14.ts:6-7). B reads the must as a
   horizontal leg that turns back (`/L` in a run), which no shipped stage has. If the lead reads it otherwise, 2-7 still stands; only the T moves.
4. **The wheel's node letter:** `p` (beat pieces on a clock) is the nearest and 2-5's snap stones use it too; the key may want its own letter (NODES.md, the Architect's).
## Method used, lessons applied, method update
pitch.md (2b open lens), level.md rules 1-2, 5-8, 21, 23-24; 2-4.md as the bar. Lessons: D58 (loved, cited, taught, not copied), D34 (every fact file:line), D49/D60 (targets
pasted from DIFFICULTY.md:61-63), D46 (every way down lands on soft water or a bank), D30 (time from `date`), D36 (own worktree), D53 (fast gates before push), D83 (the sim imports
relative). Method update (pitch.md): 2b, B gets its own packet; step 2's hosts: `www.gamedeveloper.com`, and a page download when the fetch tool truncates; step 3: a pitch
that reuses a system names that system's scope line (what it can't do) before using it.
