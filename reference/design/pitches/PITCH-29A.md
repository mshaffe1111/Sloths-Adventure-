# PITCH-29A: 2-9, 3-1, 3-2, the FIXED LENS (packet reference/packets/2026-11-18/PITCH-29A.md on the lead's branch, pitch.md step 2b). Pitcher A (designer), started 5:47 PM ET 11-18 (by date)
Read: pitch.md, level.md (Building rules), DESIGNER.md, the bar (origin/t-design-24:2-4.md), PICKS-23-25/26-28 (lead's branch), GAME-MAP 174-235 + §3 (origin/t-design-game-map),
PLATFORMER-100-MATT.md Blocks 1-2. Engine facts read on origin/main 6e7b85f8 (file:line below). Node strings: `npx tsx reference/specs/sims/nodes29a.ts` (gen2 parseCode + checkCode,
the same rules nodes2425.ts passes; out/nodes29a.txt: all three "checkCode: no errors"). Targets pasted from DIFFICULTY.md on main: "**World band** [10w - 11, 10w + 1]" (:62); "**Slots:**
target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]" (:63); "(Normal targets; Easy at most 0.6 x Normal)" (:61). Sources: hosts open from here: en.wikipedia.org,
gamedeveloper.com, gamesradar.com, pcgamer.com; HG101 is "under maintenance" (every page), the rest refused. Quotes are from pages I opened (curl, text grepped).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 2-9 The River King's Court (gauntlet →): "COME UP BEHIND THEM"
**One idea:** "The king's guards ride the river lanes facing the way their raft floats: board behind a guard and kick him off; one coming at you, you go over his head." A player
says: "the one where the guards are on the rafts and you sneak up behind them." **Why it's fun on a phone:** one readable rule (look which way the raft floats) turns every lane
into a puzzle you solve at a glance, then a timing you do with one thumb; World 2's final exam asks the river (2-1), the vine drop (2-4) and the bite-on-four (2-5) at once.
**Kept from GAME-MAP** (:190): the full river, lanes of logs both ways, guards on the rafts. **Added:** the facing rule, the vault over an oncoming guard, the court bell on the barge.
**Tributes** (Blocks 1-2 lead; one from anywhere):
- **Kung-Fu Master** (Irem 1984, Block 1 #4; pre-1990, lesser-known today). a. Loved: it "threw the player into a world of karate chops and leg sweeps from the moment you said
  'okay go!'... a blast when it was new and definitely set a standard for action titles" (https://www.gamedeveloper.com/production/retro-game-of-the-day-kung-fu); GamesRadar: "all we
  need to know is that some bastard's kidnapped our girlfriend and it's up to us to punch and kick our way" (https://www.gamesradar.com/123-games-with-untapped-franchise-potential/3/).
  b. Taught [S]: no tutorial; the first floor's grunts walk in from both sides and the first kick teaches it. c. Ours: guards come at him from both ways (the lanes), each with one
  tell (which way he faces), answered with one move. d. Not copied: punching people, waves that never stop, the timer.
- **Super Mario Bros. 3** (Nintendo 1988, Block 1 #15; the one famous). a. Loved: the airship ends each world; Mario leaps "onto a moving airship" and must "deal with gravity,
  the movement of the ship, and the cramped architecture" (https://www.gamedeveloper.com/design/super-mario-bros-3-level-design-lessons-part-1); "Each airship in the game represents
  the last levels of a world" (.../super-mario-bros-3-level-design-lessons-part-3). b. Taught: the cutscene (Toad pleading) frames it; the ship's motion is the twist on moves you know.
  c. Ours: the world ends on the king's own barge, a floor that carries the whole court. d. Not copied: cannons, auto-scroll, a boss on board (Crocus Rex is 2-10).
- **Crossy Road** (Hipster Whale 2014, a phone game; the one from anywhere). a. Loved: "clarity and consistency in all facets... the simple one-touch or swipe interaction"
  (https://www.gamedeveloper.com/design/what-design-lessons-can-we-learn-from-crossy-road-). b. Taught [S]: lanes alternate direction; you read each lane's way before you hop.
  c. Ours: lanes both ways, read in one look on an upright phone, one tap per hop. d. Not copied: endless, top-down, the eagle that punishes waiting (our sandbars are safe until beat 7).
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The water-gate of the court, banners on poles, rafts drifting out; Dot's teach 800 px+ before beat 1: guards look the way they float | Watches a raft pass | "They're all looking one way" |
| 1 | **Teach: behind him, safe** (T w, soft) | One slow `ride` lane WITH him (W2_RIVERS :79, splash-back); a raft whose guard faces right, away | Hops on behind, kicks: the guard splashes and paddles off huffy | "He never saw me!" |
| 2 | Sandbar (P g) | A sandbar between lanes, petals; the next lane's rafts knock out | Reads the lanes | "Two lanes, both my way" |
| 3 | Two lanes, both with him (P w) | `twin` then `deep` with a guard each; plain logs between | Board behind, kick, hop the sandbar, again | "Got the rhythm" |
| 4 | Lily planks (P f) | The court's floating planks before the first left-flowing lane | A breath; Dot's second teach: one coming at you, go over his head | "Uh oh, that one's facing me" |
| 5 | **TEST: the oncoming guard** (X w2) + flag, R | A `back` lane (dir -1, :81): the raft and its guard come AT him, spear out (head-on he blocks, GUARD.reach 78, predatorAI.ts:67) | Double-jumps over the spear, lands behind him, kicks | "Over the top!" |
| 6 | Court garden (P g) | Stone urns, petals; a liana over the next lane | Rest | "Phew" |
| 7 | **TWIST: drop from the vine behind him** (W s) + R | A liana over a lane (2-4's piece): let go so the raft comes under with the guard's back to him | Lands on the raft's back end, kicks | "Dropped right in" |
| 8 | Snap-stone sandbars (P p) | 2-5's stones that bite on four as the bars between lanes | Hops one-two-three | "No standing around" |
| 9 | **COMBINE: lanes both ways, stones between** (C w) + flag, R, heart after | right, left, right lanes, guards on two, snap-stone bars: waiting is counted | Counts the stones while reading the next lane | "Read, count, go!" |
| 10 | Up to the quay (P b, rising) + V | World 2's bounce up the quay; across the water, eyes surface (the boss preview, Crocus Rex) | Bounces up | "Who's THAT?" |
| 11 | **SIGNATURE: the King's Barge** (S w) | A long royal barge drifting with him: three guards in a row facing ahead, the court bell at its bow | Kicks them off from behind one by one (Kung-Fu Master's corridor); rings the bell: the court turns to look, the barge noses into the shrine steps | "I took the king's own boat!" |
| 12 | Exit (E) | The shrine on the steps | Walks up | "The court is mine" |
**Node string (checkCode: no errors, 17 tokens, mini 9, creatures, later):** `A Tw1&<:#soft:&royal_guard*1 Pg1< Pw1&>:&royal_guard*2 Pf1< Xw2&>:#water:&royal_guard*1 R Pg1< Ws1&>:#water:&royal_guard*1 R Pp1> Cw1&>:#water:&royal_guard*2 R Pb1^< V Sw1&<:#water:&royal_guard*3 E`
(w is 4 of 10 content nodes = the cap; without `V` it also passes. Flags and hearts by the live rolled-flag rule, pipeline.ts ROLLED_FLAGS, not this table.)
**Difficulty:** Normal target = 10(2-1) + T[9] = 10 + 10 = **20** (band 9-21, the world's hardest); Easy at most 0.6 x 20 = **12**: Easy gets `ride`/`lashed` lanes, no snap stones on the bars, one guard on the barge.
**Engine** (verified on main 6e7b85f8). WIRED: rivers both ways (W2_RIVERS `back` dir -1, w2.ts:81; riverRecipes stage 9's mixed run, river.ts:149-161), a raft river (river.ts:62-65), the carry
rule for every carrier and rider (engine.ts:842-843), the royal guard (predatorAI.ts:66-67, :398; "Head-on he blocks. Flick sideways to kick, or hit from behind", journal.ts:56), the bounce,
the bell that turns watchers (puzzleKit.ts:85-86, noise.ts). BY 2-4/2-5: the liana over a river, snap stones. **NEW 1 a guard aboard a raft** (M, 3-4 h; predatorAI.ts royal + river.ts/gen2
riverLay.ts row field `guard`, w2.ts row): stands, faces the raft's dir, is carried; kicked from behind he splashes off and paddles to a bank (nobody hurt); no creature rides a drifting log
today (ridePickups.ts carries pickups only). **NEW 2 bot skills** `board-behind` + `vault-guard` (S-M; tools/inspect/firsttimer.ts SKILLS), each on a planted toy RED without it.
`V` (boss preview) is a LATER job (nodeLetters.ts:53): in only if its own packet lands, else dropped. **To fly before laying (rule 24):** the vault over an oncoming guard's 78 px spear from
a `back` raft at 70-90 px/s, both settings; whether the royal guard hears the bell (the turtle branch listens, predatorAI.ts:362) [unverified for `royal`].
**Different from 2-1..2-8:** the first World 2 stage where WHO is on the ride matters, the first with guards, the first ending on a moving floor that carries the cast. 2-1 boards logs, 2-4 boards
from the air, 2-5 counts, 2-7 races, 2-3/2-8 lead followers: 2-9 reads a FACE on a ride. **Hand build it replaces:** w2Stages.ts '2-9' (:39, :48 its 14-guard goal; W2_PUZZLES :58).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 3-1 Into the Grotto (sprint ↓): "STAND STILL, SEE THE WAY DOWN"
**One idea:** "Going down into the dark, stand still at the edge and the glowworms below wake and show you where to drop." A player says: "the one where you wait for the glowworms
to light up the way down." **Why it's fun on a phone:** World 3 is the patience world (GAME-MAP §1), and patience is a sloth's whole nature: the thumb's job is to NOT press, then
drop. The first stage that goes DOWN: falling into the unknown is the thrill, the glowworms turn it from blind to brave. Upright is the natural shape for a shaft.
**Kept from GAME-MAP** (:213): the first stage that goes DOWN; light only from glowworms and fungi; teaches dark. **Added:** stillness is the key to the light (World 3's patience), and
the spore puffs that light the shaft on their beat.
**Tributes:**
- **Metroid** (Nintendo 1986, Block 1 #9; pre-1990). a. Loved: "dark, stark, lonely, and creepy - full of impossibly long corridors and extremely steep drops... the gamer who pressed
  forward would slowly but surely be pulled into" it (https://www.gamedeveloper.com/production/retro-game-of-the-day-metroid); "bleak environments to explore... further into the dark"
  (https://www.gamesradar.com/the-history-of-metroid/). b. Taught [S]: no words; the shafts invite the drop. c. Ours: the steep drop as wonder, never death (soft landings, a lit floor).
  d. Not copied: the dread, the guns, the maze. (26A named Metroid for gating; the reason here is new: the descent's mood.)
- **Pitfall II: Lost Caverns** (Activision 1984, David Crane; one from anywhere; lesser-known). a. Loved: it "discards entirely lives, health, and even death... transported back to the last
  'cross' he touched... remove the requirement of having to be really good to see it all" (https://www.gamedeveloper.com/design/game-design-essentials-20-open-world-games); "explore the
  wilds of Peru" down into the caverns (https://en.wikipedia.org/wiki/Pitfall_II:_Lost_Caverns). b. Taught: the cave goes down screen by screen; crosses mark where you return.
  c. Ours: every drop in the teach is soft (moss, a pool); a flag at each shelf, so the dark costs time, never the run. d. Not copied: the bats, the score loss.
- **Donkey Kong Country** (Rare 1994, Block 2 #39; the one famous). a. Loved: "painstakingly arranged so that the player could 'go first time' past obstacles"
  (https://www.gamesradar.com/the-making-of-donkey-kong-country/); "Squawks, a parrot that carries a lantern" (https://en.wikipedia.org/wiki/Donkey_Kong_Country). b. Taught [S]: Torchlight
  Trouble's light shows the next platform; Blackout Basement's lights blink so you remember and go. c. Ours: the light shows the landing before he needs it (go first time); the puff
  beat is our blink. d. Not copied: a carried light (3-6 carries the fungus cap; Flicker is 6-6, story keeper 11-11), lights that cut out mid-jump.
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The grotto mouth, daylight behind, a mossy lip; Dot 800 px+ before beat 1: stand still and the glowworms wake | Steps in | "It's so dark" |
| 1 | **Teach: stand still, see the drop** (T g, flat) | A ledge over a soft moss pit; sleeping glowworms below (GLOW_STILL 0.7 s, zones.ts:79) | Stands still; they wake one by one; drops onto the lit shelf | "It was there all along!" |
| 2 | First way down (D) | Shelves down a wall, each lit as he stops | Stop, look, drop | "Down we go" |
| 3 | Fungus caps (P f) | Glowing caps (always lit) as stepping stones over a dark stream | Hops cap to cap | "Follow the glow" |
| 4 | **TEST: wake them, then go** (X g) + flag, R | A long dark floor with two gaps: one stop wakes them all ahead | One stop, then a run in the light | "Remember... go!" |
| 5 | Down the hanging roots (D c) | A root curtain to climb down (straight down always climbs) | Climbs down | "Slow and steady" |
| 6 | **TWIST: the puffs light the way** (W f) + R | Sleepy spore clouds (zones 'spore') that glow as they puff on a beat over the next shelves | Drops while a puff lights the landing, not into the cloud (drowsy) | "Wait for the glow... not in it!" |
| 7 | Mushroom bounce (P b) | A big springy cap down to a lower gallery | Bounces | "Boing" |
| 8 | **COMBINE: the long shaft** (C g) + flag, R, heart after | Shelves left and right down a shaft: some woken by stillness, some lit by puffs | Reads which light each shelf needs | "I can do this in the dark" |
| 9 | **SIGNATURE: the glowworm sky** (S g, falling) | At the bottom lip he stands still and the whole cave roof wakes, thousands of glowworms like stars, lighting a long winding drop to the grotto floor | One last stillness, then the long way down under the stars | "There's a sky under the ground!" |
| 10 | Exit (E) | The shrine by the glowing pool | Walks | "Down here is beautiful" |
**Node string (checkCode: no errors, 14 tokens, mini 1):** `A Tg1:#dark D_ Pf1<:#dark Xg1>:#dark R Dc1_ Wf1>:#dark@puff R Pb1< Cg1>:#dark@puff R Sg1_<:#dark E`
**Difficulty:** Normal target = 10(3-1) + T[1] = 20 - 0.5 = **19.5** (band 19-31: just under World 2's end, GEMINI-LEDGER F2); Easy at most **11.7**: Easy's glowworms wake at once (no stop
needed in the teach) and every drop is soft.
**Engine** (verified on main). WIRED: the dark zone with sleeping glowworms that wake when he holds still and stay lit (zones.ts:22, :49, GLOW_STILL :79, GLOW_REACH :81; laid by the hand-built
3-1/3-2, protoStage.ts:1838-1843 glowDark; in gen2 only by the World 6 kit, w6Swing.ts:427), spores (zones.ts 'spore', drowsy :161-175), climbing down, the bounce, gen2's down flow
(pipeline.ts:439 takes travel 'down'). **FOUNDATION, not 3-1's own:** ENG-W3a, the World 3 kit on gen2 (no w3.ts in gen2/worlds today; BUILD-ROADMAP.md:113). **NEW 1 dark + glowworms as
a gen2 zone, reading DOWN** (M, 4-6 h; gen2/worlds/w3.ts row + zones.ts; = BUILD-ROADMAP's ENG-DARK): GLOW_REACH is back 260 / ahead 1050 along x today; a shaft needs the lights below
to wake [check whether it already reads y]; plus a light with a clock (the puff glows on the spore's beat, zones.ts). **NEW 2 bot skill** `still-for-glow` (S; firsttimer.ts: today a stop
is random, standStillMs :167): stops at a dark edge until the landing is lit, planted toy RED without it.
**Different from 2-1..2-8 and 1-x:** the first stage going down, the first where the dark hides the way, the first where NOT moving is the move (1-7's bush hides; here stillness reveals).
**Hand build it replaces:** protoStage.ts '3-1' (:2300; w3Sections.ts) and its pins.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## 3-2 Glowworm Path (stealth →): "PROWLERS NEVER LOOK UP"
**One idea:** "Hang under the roof roots and creep right over the prowlers' heads: they never look up, but they see you in the glow." A player says: "the one where you hang
upside down over the jaguars." **Why it's fun on a phone:** it is the move only a sloth has (GAME-MAP §1: World 3's signature; R-160.1 "the one idea that makes this game play like
no other"), slow on purpose: the thrill is being an arm's length over a predator that has no idea. One rule plus 3-1's light: the dark of the roof is safe, a glowworm patch is not.
**Kept from GAME-MAP** (:214): stealth, hang along the roof roots above the prowlers, teaches HANG UNDER. **Added:** the glow rule (3-1's light now gives him away), the drop into a fern.
**Tributes:**
- **Strider** (Capcom 1989, Block 1 #18; pre-1990, lesser-known today). a. Loved: "climbing walls, walking on ceilings, and battling in zero gravity - gets pretty out-there"
  (https://www.gamesradar.com/capcoms-30-greatest-contributions-gaming/2/); "Hiryu is able to latch onto certain platforms, and climb across walls and ceilings"
  (https://en.wikipedia.org/wiki/Strider_(1989_arcade_game)). b. Taught [S]: the ceiling is just another floor once you jump to it. c. Ours: the roof is a road, held by a sloth's grip.
  d. Not copied: the speed, the sword, the acrobatics.
- **Oddworld: Abe's Oddysee** (Oddworld Inhabitants 1997; the one from anywhere). a. Loved: "Tiptoeing Abe in and out of shadows was just awesome to me" (a developer, on his first stealth game,
  https://www.gamesradar.com/orphan-limbo-meets-aliens/). b. Taught [S]: a guard on screen and a shadow beside him; you learn by being seen once. c. Ours: the glow patches are the light,
  the roof's dark the shadow; the first prowler walks AWAY (rule 7). d. Not copied: death on sight, possession, chanting.
- **Castlevania III: Dracula's Curse** (Konami 1989, Block 1 #22) [S]: Grant clings to walls and ceilings (no page I could open says so; HG101 down). New reason vs 26A (branching):
  a hero who travels upside down. Not copied: switching heroes.
| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The glowworm path, roots hanging from the roof, two eyes far off; Dot 800 px+ before: jump up and hold the root | Looks up | "I could hang up there" |
| 1 | **Teach: hang and creep, safe** (T r, soft) | A low roof root over a soft dip, nothing below | Jumps, grabs, creeps upside down, lets go | "Upside down feels right" |
| 2 | Floor (P g) | Moss floor, petals | Rest | "Easy" |
| 3 | Root over the stream (P r) | A long root over dark water: the roof is the way across | Creeps across | "The roof is a road" |
| 4 | Root curtain (P c) | Climb up to a higher root | Climbs | "Higher" |
| 5 | **TEST: the first prowler** (X r) + flag, R | An ocelot pacing AWAY below a dark root (first enemy safe, rule 7) | Creeps over its head | "It never looked up!" |
| 6 | Stone ledges (P f) | Hops in the dark | Breath | "Phew" |
| 7 | **TWIST: drop behind him** (W m) + R | The root ends over the prowler's patch; a fern below, behind him | Lets go into the fern while its back is turned, then up the next root | "Into the fern... now!" |
| 8 | Fern floor (P g) | A prowler pacing, ferns to stop in (wired cover) | Fern to fern | "Wait for his back" |
| 9 | **COMBINE: the glow patches** (C r) + flag, R, heart after | A long root with glowworm patches on it; two prowlers pacing both ways below | Waits in the dark, creeps through the lit patch while both look away | "Not in the light!" |
| 10 | **SIGNATURE: over the den** (S r) | The longest root, over a den of three prowlers; glowworms wake as he passes and the den stirs | One slow creep over all of them to the shrine ledge | "Right over their heads!" |
| 11 | Exit (E) | The shrine ledge | Drops down | "Nobody saw a thing" |
**Node string (checkCode: no errors, 15 tokens, mini 2, creatures):** `A Tr1<:#soft Pg1> Pr1<:#dark Pc1> Xr1&<:#dark:&ocelot*1 R Pf1< Wm1&>:#dark:&ocelot*1 R Pg1&<:&ocelot*1 Cr1&>:#dark:&ocelot*2 R Sr1&<:#dark:&ocelot*3 E`
(r is 4 of 9 content nodes = the cap; a first string with 5 r failed V11, so the floor beats carry the mix.)
**Difficulty:** Normal target = 20 + T[2] = 20 + 3 = **23**; Easy at most **13.8**: Easy roots lower (a tap catches them), one prowler at a time, wider dark between patches.
**Engine** (verified on main). WIRED: the shimmy rope, hung by gen2 (place `rope`, pipeline.ts:1393, :1693), grabbed rising or falling with Up (engine.ts:5500-5537, p.hanging), taught in 1-3,
followed by the bot (firsttimer.ts:354-356); prowlers pacing a patch (ocelot/jaguar, protoStage.ts:1900; enemyBrain.ts roam); ferns as cover (watcher.ts:18 'grotto'); 3-1's dark (its NEW 1).
**FACT that changes the build:** today a prowler SEES anyone within 170 px up or down (enemyBrain.ts:229 `Math.abs(dy) < 170`), and a rope hangs 146 px over its ledges (rope.ts:16): hanging
over one, he would be seen. **NEW 1 prowlers never look up** (S-M, 2-3 h; enemyBrain.ts roam senses): a hanging hero above is unseen unless a lit glow is within its radius; planted test.
**NEW 2 the roof root** (M; gen2 place `root`: a long rope under the roof with no posts, ends over a ledge, a fern or soft ground, w3.ts row; root art + Pokey's hang pose if the 1-3
shimmy does not read upside down, HF). **Pushback below:** this teaches HANG UNDER on roots with the rope physics we have, not R-160.1's general under-branch move (10-16 h).
**Different:** 1-7 hides on the ground in a bush from a sky eagle; 3-2 hides in the dark of the ROOF from the ground: the first stealth where up is safe. 3-1 taught the light; here light is danger.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Learned
- Read the senses before designing a stealth beat: the GAME-MAP row "hang above the prowlers" fails on main as-is (dy < 170 sees him); one grep found a 2-3 h fix the design depends on.
- The mix cap (V11, 40%) bites a stage built on one move (3-2's roots); give the in-between beats the other letters early, not after the string fails.
- HG101 was down all round (also for 26A): the method's host list should drop it until it returns and name gamedeveloper.com's "Retro Game of the Day" and "Design Essentials" pages as the
  reliable non-Wikipedia source for classics.
## Pushback
1. **3-2's hang:** R-160.1 (hang under any branch, 10-16 h + art, BUILD-ROADMAP ENG-HANG in four jobs) is more than 3-2 needs. A roof root is a long shimmy rope (wired since 1-3); 3-2 needs
   only NEW 1 (prowlers never look up) + NEW 2 (the root lay). Recommend: build 3-2 on roots now; keep R-160.1's under-branch move for World 6/8 (GAME-MAP §3 ladder) as its own job.
   It matters for the ladder: "hang under" in 3-5/3-9/6-1/8-5 must then mean roots (or wait for R-160.1). The lead's call.
2. **3-1 is not buildable on its two NEW alone:** World 3 has no gen2 kit (ENG-W3a, L) and the thinnest standing art (GAME-MAP :231). Both are foundations in BUILD-ROADMAP; 3-1 and 3-2 wait on them.
3. **2-9's goal:** the hand build asks for 14 guards (w2Stages.ts:48); stagePlan says "reach the shrine" (stagePlan.ts:74). I pitched reach-the-shrine with the barge's three required; the
   keeper should rule whether a count stays.
4. **3-2's mission line** "Keep low and keep moving" (stagePlan.ts:78) fights a stage you cross by hanging high: an ask for the story keeper.
