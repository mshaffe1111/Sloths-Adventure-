# PITCH-26A: 2-6, 2-7, 2-8, the FIXED LENS (packet reference/packets/2026-11-18/PITCH-26-28.md, pitch.md step 2b). Pitcher A, started 12:20 PM ET 11-18, written 12:38 PM ET (by date)
Read on origin/main 6e7b85f8: pitch.md, level.md (Building rules), DESIGNER.md, GAME-MAP World 2 rows (origin/t-design-game-map, lines 174-203), the bar (origin/t-design-24:2-4.md),
PLATFORMER-100-MATT.md Blocks 1-2. Node strings: `npx tsx reference/specs/sims/nodes2628a.ts '<2-6>' '<2-7>' '<2-8>'` (gen2's parseCode + checkCode + legs.ts legMarks;
reference/specs/sims/out/nodes2628a.txt: all three "checkCode: no errors"). Targets pasted from DIFFICULTY.md:62-63 on main: "**World band** [10w - 11, 10w + 1]"; "**Slots:** target(w, s) = 10(w - 1) +
T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]" (2-4.md reads T by stage, 2-4 = 10 + 3.5); header :61 "(Normal targets; Easy at most 0.6 x Normal)". World 2 band 9-21.
**Engine facts checked on main** (law 3): lift.ts (basket on a rope, waits at each stop; hand-built 2-7 lays it, w2Stages.ts:638-659, 130 px/s, 1.0 s wait); ride.ts (a path of any
points, `upDown`, `sideToSide`, `smooth` eases a lift; runs out and back); gen2/rideLay.ts (RideWay 'up' = "a lift up to the ledge above", but "a second way over, never yet the only
one", :12-13); gen2/tower.ts + legs.ts (up / down / left legs, `/L` mirrors a right leg; used only in tests: legs.test.ts:20, nodeDials.test.ts:30); W2_RIVERS `back` (dir -1, w2.ts:81) and
bot SKILLS.upstream (tools/inspect/firsttimer.ts:642); risingTide.ts (6-8 only; "never punishes a careful player", :12, w6Stages.test.ts); hand-built 2-8's flood basins + pulley cages
(w2Stages.ts:708, :891). **Followers: not on main** (grep: none); assumed from 2-3 as the packet says. No gen2 lift row in w2.ts; no bot skill for a lift.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 2-6 Up the Bank Houses (ascent ↑): "THE BASKET LIFTS"
**One idea:** "Step into the village's rope baskets and let them carry you up the bank, porch to porch; when two pass, step across." A player says: "the one where the baskets
lift you up the riverbank." **Why it's fun for a sloth on a phone:** the ride does the climbing; his one thumb only decides WHEN to step in and WHEN to step out, so it is all
anticipation, never speed ("wait... wait... now"). A sloth riding a basket is a joke that plays itself. Upright is the natural shape (an ascent shows ~2 storeys); sideways the
whole shaft of the hand-off fits. Slot 6 is World 2's breather after 2-5 (target 15 < 2-5's 16), and the world's first VERTICAL stage: GAME-MAP's change of pace.
**Tributes** (Block 1-2 lead; one from anywhere = post-2005):
- **Mega Man 2** (Capcom 1988; Block 1 #16; pre-1990). a. Loved: "Requiring as much precision as it does patience" (gamesradar, https://www.gamesradar.com/best-nes-games-all-time/).
  b. Taught [S]: its timed platforms show their rhythm before he must stand on them (Heat Man's appearing blocks; not opened). c. Ours: patience as the skill: every lift shows one
  whole cycle from where he decides (rule 8) before he needs it. d. Not copied: blocks that vanish under him, pits that kill.
- **Nebulus / Tower Toppler** (Hewson 1987; Matt's own favourite, lesser-known). a. Loved: Wikipedia only: "ledges... connected by elevators"; the rotation "noted favourably in
  reviews" (https://en.wikipedia.org/wiki/Nebulus_(video_game)). **FAILS the non-Wikipedia rule**: HG101 is down for maintenance today, lemon64 403, the retro hosts refused.
  b. Taught [S]: a lift is a door upward; you step on and it decides. c. Ours: the bank IS the tower; houses dug into it are its doorways (rests). d. Not copied: rotation, the timer.
- **Celeste** (2018; the one famous). a. Loved: "manipulating directional blocks to leap deftly through levels"; it "feels paced like a blockbuster... moments that allow you to
  breath and reflect" (PC Gamer review, https://www.pcgamer.com/celeste-review/). b. Taught [S]: each chapter shows a new block on a safe screen first. c. Ours: the safe first
  basket (beat 1); quiet porches between the rides. d. Not copied: the dash, the zip's launch (RIDE.keep.y = 0: a jump off keeps no up speed, ride.ts:17).
**The beats** (Normal; lifts as lift.ts; "never-stop" = ride.ts upDown on a clock)
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The jetty at the foot of the bank; round doors with lights stacked up the cliff; a basket waits | Looks up | "Everyone lives UP there?" |
| 1 | **The first basket, safe** (T f, soft) | A basket that waits at the bottom (lift wait), rises 1 storey to a porch; ground under it | Steps in, rides, steps off | "It's carrying me!" |
| 2 | Porches (P c) | Bank-house porches joined by climbing vines; petals by the doors | Climbs porch to porch | "Like stairs" |
| 3 | **The basket is away** (P f) | The basket is at the top when he arrives; Dot: it comes back | Waits, then boards | "Come on down... got it" |
| 4 | **TEST: never-stop** (X p) + flag | Bamboo platforms on ropes that ride up and down and never wait (upDown); step on and off while moving | Times both ends | "On... and OFF!" |
| 5 | A bank house (R) | Inside a round door: warm light, a flag, a sleeping neighbour | Breath | "Cosy" |
| 6 | Washing-line bounce (P b) | World 2's spring piece (2-4's) up past a gable | Bounces | "Boing" |
| 7 | **TWIST: the hand-off** (W p) + R | A rising basket passes a never-stop platform at the top of its ride; no porch: the platform is the way on | Steps across mid-ride | "Swap!" |
| 8 | **The relay over the river** (C f) + flag, R | Baskets and never-stops out over the river's edge (deep water below on Normal; Easy: soft) | Basket, step, platform, step, basket | "Don't look down" |
| 9 | **The water wheel** (S f, signature) | The village's great water wheel: buckets on its rim lift him the last cliff; the camera pulls out over the whole bank | Rides the arc | "Up over the whole village!" |
| 10 | Exit (E) | The top village and its shrine | Walks in | "Made it to the top" |
**Node string** (checkCode: no errors; 13 tokens; flow up from the stage row, as 1-4's arc): `A Tf1^<:#soft@lift Pc1^< Pf1^<:#soft@lift Xp1^>:#soft@ride R Pb1^< Wp1^>:#soft@ride R Cf1^>:#water@lift R Sf1^<:#soft@wheel E`
(f = a lift ride, p = a never-stop ride on a clock; f 3 of 7 = the cap; no neighbours share. NEW 1 may want its own letter: the key's call, nodeLetters.ts.)
**Targets:** Normal **15** (10 + T[6th] 5); band 9-21; Easy at most **9.0**. Bite on Normal: the never-stop step-off (meter row "Timed hazard", log2(1 + cycle / window)), deep water in 8.
**Engine.** WIRED: lift.ts (engine steps any `lift` platform), ride.ts upDown + ridePlay.ts, the spring piece, climbing vines, tower lay (tower.ts). EXISTS-UNWIRED: rideLay 'up' in
World 2 (no w2.ts row). **NEW 1 (M, 2-4 h; gen2/rideLay.ts + pipeline.ts reach + w2.ts row):** a lift / never-stop as the ONLY way up a storey (today "never yet the only one"): a
place rule and fairness (time at each stop, a step-off window on a never-stop), plus bot skill `lift` (firsttimer.ts SKILLS) on a planted toy (rule 21). **NEW 2 (S, 1-2 h; ride.ts):**
`loop` paths (after the far end, go on to the first point), so wheel buckets turn one way; buckets are rides with a `shift` each. Art: the wheel (Hugging Face, the lead's call).
**Owed before build (rule 24):** fly the never-stop step-off window and the hand-off on realPlay at 30 fps (both settings); name the script.
**Different:** first vertical stage of World 2; 2-1..2-5 all run right over water. Rides that carry him UP, where 2-1's logs carry him along. **GAME-MAP:** kept (lifts and up-down
platforms); added the hand-off (twist) and the water wheel (signature).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 2-7 The Mailman's Route (sprint ⇄): "THE LONG WAY OUT, THE SHORT WAY HOME"
**One idea:** "Take the mail the long way round to the last door and ring its bell; every door marked PLEASE BE PATIENT swings open, and you race home LEFT, the short way,
through the houses and against the river." A player says: "the one where you go there and back, and the river pushes back." **Why it's fun on a phone:** one thumb turns
round: the same village read twice, the way out learned, the way home a new puzzle made of old places. LADDER MUST (2): **the first run back to the LEFT**, taught at the turn.
**Tributes:**
- **Metroid** (Nintendo 1986; Block 1 #9; pre-1990). a. Loved: "sprawling non-linear levels, silent storytelling"; it "was all too happy to let you get lost" (gamesradar,
  https://www.gamesradar.com/best-nes-games-all-time/). b. Taught [S]: doors you pass early open later, so the way back is new. c. Ours: shut doors on the way out (a PLEASE BE
  PATIENT sign on each), all open after the bell: the way home goes THROUGH them. d. Not copied: getting lost, power-ups, the gun.
- **Pizza Tower** (Tour De Pizza 2023; lesser-known; post-2005). a. Loved: it "stole the hearts of 2D platformer fans"; "each level has a puzzle-focused first half followed by an
  action-packed escape sequence" (gamesradar, https://www.gamesradar.com/games/platformer/pizza-tower-hits-switch-today-and-after-19-months-of-begging-fans-of-the-wario-land-throwback-couldnt-be-happier-my-switch-has-a-purpose-now/);
  "At the end of each level, they activate an escape sequence and must return to the beginning within a time limit" (https://en.wikipedia.org/wiki/Pizza_Tower). Its makers on
  pace: "each level was remade around 2 to 3 times... to ensure there were no gaps to fill" (Game Developer interview, https://www.gamedeveloper.com/design/how-speedy-implementation-high-paced-platformer-pizza-tower).
  b. Taught: the trigger at the far end flips the level. c. Ours: the bell. d. Not copied: the chasing face, the time limit (sprint: no lock, a race for medals).
- **Pac-Land** (Namco 1984; Block 1 #3; lesser-known; an extra). a. Wikipedia only: three sections out to Fairyland, then "Pac-Man return home to his family"
  (https://en.wikipedia.org/wiki/Pac-Land). **FAILS the non-Wikipedia rule** (HG101 down). That the home trip runs LEFT is [S]. c. Ours: the trip home is the reward.
**The beats** (Normal)
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The post jetty; a satchel of letters; the first door, shut, sign PLEASE BE PATIENT | Reads it | "Patient. OK." |
| 1 | **Round, not through** (T w, soft) | The path goes round the shut house over a `ride` river (2-1's logs, soft) | Rides with the current | "The long way" |
| 2 | Banks (P g) | Doors, signs, mailboxes; petals | Runs | "So many doors" |
| 3 | Over a roof (P f) | 2-6's basket over a house that blocks the bank | Rides up and over | "Up and over" |
| 4 | **TEST: the fast river** (X w) + flag, R | `twin` rows, deep water | Hops log to log | "Quick!" |
| 5 | **TWIST: the bell** (W f) + R | The last door is up a basket; the mail bell. He rings it: every door swings open; the camera turns LEFT; Dot's line | Rings | "DING! Everyone's home!" |
| 6 | **First run LEFT, safe** (P g, soft) | Through the first open house: flat, warm, petals inside; nothing hurts (rule 7) | Runs left | "The short way!" |
| 7 | **Upstream** (P w) | The same river, the other way: logs drift AT him (W2_RIVERS `back`; SKILLS.upstream) | Hops against the flow | "The river pushes back!" |
| 8 | Rest (R) + flag | A porch where neighbours wave their letters | Breath | "They got their mail" |
| 9 | **Combine** (C b) + R | Bounces over gables, then upstream logs; the gate that was shut on the way out now open below | Bounce, hop, through | "I know this place" |
| 10 | **The post-boat home** (S w, signature) | The bridge is up (raised for the post-boat); he rides the boat (puzzle-kit#raft) left to the start jetty | Rides | "Full circle" |
| 11 | Exit (E) | The post office, where he began | Walks in | "Delivered" |
**Node string** (checkCode: no errors; 15 tokens; legs rrrrrrrr lllllll): `/R A Tw1<:#soft Pg1< Pf1^<:#soft@lift Xw1>:#water R Wf1^<:#soft@lift R /L Pg1<:#soft Pw1>:#water R Cb1>:#water R Sw1<:#soft E`
(w 3 of 8 = the cap; the left leg starts at a rest, then a soft flat node.)
**Hidden:** the guarana behind the one door that opens only on the way back (GAME-MAP: it opens The Rapids).
**Targets:** Normal **18** (10 + T[7th] 8; the world's second peak); band 9-21; Easy at most **10.8**. Bite: upstream rows (2-4 flew `back` at 73% catches, 2-4.md), deep water.
**Engine.** WIRED: rivers (riverLay.ts, `back` row), lift.ts, the raft, SKILLS.upstream. EXISTS-UNWIRED: the left leg (legs.ts `/L` + mirror; no stage lays it; whether the mirror
flips a river's dir must be checked: the river must keep flowing right, at him). **NEW 1 (M, 3-4 h; a `change` wire: gen2 + engine):** the bell: a trigger that swaps a set of
pieces from their "out" state to their "home" state (doors shut→open, the bridge down→up), laid by data, judged both ways (nothing seals him either way, rule 5). **NEW 2 (S, 1-2 h;
tools/inspect bots):** the bots run a left leg and ring the bell, proven on a planted toy. GAME-MAP's estimate for out-and-back is 6-10 h: over the 2-hour bar, so it must be built
as engine BEFORE the builder starts (pitch.md step 1). Art: the doors' open state, the raised bridge (GAME-MAP "Missing").
**Different:** the only out-and-back in World 2; the first leftward run in the game; upstream used as the whole return. **GAME-MAP:** kept (out, the bell, back LEFT through a
changed river); the change is concrete: doors open (a new route) and the current now runs AT him; the bridge-up became the post-boat ride home.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 2-8 Before the Water Rises (rescue ↑): "UP AHEAD OF THE WATER"
**One idea:** "Free the little ones from the reed cages and lead them UP the bank before the water rises: they climb where you climb." A player says: "the one where the water
comes up and the babies follow you up." **Why it's fun on a phone:** the pressure is under him, not in his thumb: the water creeps (risingTide's rule: a careful player is never
caught) while a line of little ones bobs behind, so every choice feels urgent and is still fair. LADDER MUST (1): **2-3's "bring them home" under a new pressure**: rising water.
**Tributes:**
- **Castlevania III: Dracula's Curse** (Konami 1989; Block 1 #22; pre-1990). a. Loved: "a wild, nonlinear adventure, with branching pathways"; "Sixteen challenging stages, wildly fun
  combat mechanics" (gamesradar, https://www.gamesradar.com/best-nes-games-all-time/). b. Taught: the ones you meet JOIN you: "Trevor... can be assisted by one of three possible
  companions" (https://en.wikipedia.org/wiki/Castlevania_III:_Dracula%27s_Curse). c. Ours: each one freed joins the line; the line is the stage's score. d. Not copied: fighting, swapping.
- **The Lion King** (Virgin/Westwood 1994; Block 2 #37). a. Loved: "probably most famous for its Wildebeest Stampede level" (gamesradar,
  http://www.gamesradar.com/the-top-7-kickass-disney-games/); Matt's list names that stampede a "famous difficulty spike". b. Taught [S]: by repetition. c. Ours: pressure from
  behind (below) is the memory; the spike is the warning: the water holds at every flag and shelf. d. Not copied: death by the herd, the spike.
- **Ori and the Blind Forest** (Moon 2015; the one famous; post-2005). a. Loved: "Challenging and gorgeous"; of its "timed chase segments which must be completed in one go":
  "They are frustrating, and I love them" (PC Gamer, https://www.pcgamer.com/ori-and-the-blind-forest-review/); critics also called the escapes "needlessly punishing"
  (https://en.wikipedia.org/wiki/Ori_and_the_Blind_Forest). b. Taught [S]: the escape uses only moves already learned. c. Ours: the rise uses only 2-3's follow and World 1's climb.
  d. Not copied: one-go runs: the water waits at flags (risingTide hold), and a miss costs one flag, never the stage.
**The beats** (Normal; the water rises from beat 3)
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The low reed basin, the river lapping at the reeds; cages hang over still water | Looks | "It's getting high" |
| 1 | **The first cage** (P g) | A cage opened 2-3's way (the reminder line); still water, nothing rising | Frees one; it hops behind | "Come on, little one" |
| 2 | **Lead it up** (P c) | A short climb; the follower climbs where he climbed | Climbs, looks back | "It's right behind me" |
| 3 | **TEACH: the water turns** (T w, rising) | risingTide's churn and rumble, Dot's warning, then the creep; a careful pace is never caught | Keeps climbing | "Uh oh, it's coming up" |
| 4 | **TEST: two more cages, rising** (X c) + flag, R | Two cages at different heights on the climb | Frees, climbs, frees | "Hurry, but don't slip" |
| 5 | Shelf (R) | Slack water while he stands; the line catches up | Breath | "Phew" |
| 6 | **TWIST: back down for the last one** (D, then W g) + R | The last cage hangs low, near the water: he goes DOWN toward it, frees it, and comes back up with all of them | Down, free, up | "Not without you!" |
| 7 | Bounce (P b) | The spring piece up a gable, the line bouncing after | Bounces | "Boing boing boing" |
| 8 | **Combine: the long climb** (C c) + flag, R | Vines and porches, the water creeping, the whole line behind | Climbs steady | "Almost there" |
| 9 | **High street** (S f, signature) | The water stops at the village's high street; the little ones run into their homes, dry | Watches | "Everyone's safe" |
| 10 | Exit (E) | The shrine | Walks in | "Brought them all home" |
**Node string** (checkCode: no errors; 14 tokens; flow up from the stage row): `A Pg1< Pc1^< Tw1^<:#water Xc1^>:#water R D_ Wg1>:#water R Pb1^>:#water Cc1^>:#water R Sf1^<:#soft E`
(c 3 of 7 = the cap; the cage itself is 2-3's taught piece, so P, not T; the only T is the rising water.)
**Targets:** Normal **17** (10 + T[8th] 7); band 9-21; Easy at most **10.2** (TIDE.easy: "nearly two minutes" close under him, risingTide.ts:6).
**Engine.** WIRED: risingTide.ts (hand-built 6-8: churn, band, creep, hold at flags, restart under the flag); climbs, the spring piece, tower lay. ASSUMED (packet): reed cages and
followers from 2-3. **NEW 1 (M, 3-5 h per GAME-MAP; gen2/pipeline.ts stage dial + engine.ts updateTide reading it):** rising water as a gen2 stage dial for any tower stage, holding at
every rolled flag and shelf; proven: a careful bot never caught on both settings (w6Stages.test.ts's proof, made general). **NEW 2 (S-M, 2 h; the follower code from 2-3):** followers
on a climb and under water: they climb his vines and bounce his springs; one the water reaches is lifted, unhurt, to the last flag (nobody hurt). Bots: a planted toy each (rule 21).
**The hand build it replaces:** w2Stages.ts 2-8 flood basins (:708) and CAGES_28 (:47) (new replaces old).
**Different:** 2-3 leads them along flat ground; 2-8 leads them UP with the water behind; 2-6 rides up, 2-8 climbs up (no lifts: followers on lifts is scope we don't need).
**GAME-MAP:** kept (water from below, free them, bring them up); added the descent for the last one (the twist).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## How the three differ (from 2-1..2-5 and each other)
2-1 logs carry him along; 2-2 pads sink; 2-3 the line behind him; 2-4 vine to log; 2-5 stones on a beat. **2-6** rides carry him UP (time on the clock); **2-7** there and back, the
first LEFT, the river against him; **2-8** climbs with the line, the water from below. Verbs: wait-and-step / turn-and-retrace / lead-and-climb.
## Learned
- The fixed lens pulls hard: every GAME-MAP row became the idea; my additions are twists and signatures, not new ideas (the open pitch will show whether that matters).
- Source the tribute BEFORE choosing it: I fitted games to ideas first and lost 20 minutes; with HG101 down only gamesradar/PC Gamer/Game Developer pages carry quotes.
- The validator teaches the shape: content caps (3 per letter) forced a second ride letter in 2-6 and a rest before the left leg in 2-7 (V5, V11).
## Pushback
1. **The source rule can't be met for most pre-1990 lesser-known games today:** HG101 answers "under maintenance" (every article), lemon64, retrogamer, eurogamer, nintendolife,
   kotaku all 403 from the proxy. Nebulus and Pac-Land (the best fits for 2-6 and 2-7) are Wikipedia-only here, named plainly. Ask: allow one archive host (web.archive.org resets
   today) or accept Wikipedia's quoted magazine reviews for pre-1990 games.
2. **2-7's out-and-back is 6-10 h of engine (GAME-MAP)**: the bell's state swap must be built and proven before 2-7's builder starts, or 2-7 slips.
3. **Followers are not on main**: 2-8 depends on 2-3's follower code AND its climbing extension; 2-8 should not be built before 2-3 ships.
4. **Mirror check**: if legs.ts mirrors a river's direction in a left leg, 2-7's upstream return becomes a downstream ride; it must not (world physics: the river flows one way).
