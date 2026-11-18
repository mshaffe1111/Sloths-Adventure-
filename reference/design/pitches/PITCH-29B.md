# PITCH-29B (OPEN LENS): 2-9, 3-1, 3-2. Pitcher B. Started 5:32 PM ET 11-18, written 5:51 PM ET (by `date`). Blind (D85): GAME-MAP.md,
PITCH-29A, every 2-9/3-x pitch or design, BUILD-ROADMAP.md and t-pitch-29a were NOT read. Read: pitch.md, level.md, 2-4.md (t-design-24),
PICKS-19-22/23-25/26-28 (what 2-1..2-8 are and which tributes they used), PLATFORMER-100-MATT.md, DIFFICULTY.md §4, the engine on main.
Every engine fact is from origin/main 6e7b85f8 with file:line. Node strings: `npx tsx reference/specs/sims/nodes29b.ts` (no errors, all three).
Sources: every tribute has at least one page I OPENED that is not Wikipedia (URL given); Wikipedia lines are marked (wiki). Nothing is [S].
Hardcore Gaming 101 answered "under maintenance" at 5:40 PM ET, so none of its pages were usable.

**The thread through all three: the light.** 2-9 ends World 2 at dusk on the river king's drum (his lair is the Moonlit Mire, lairCroc.ts:2);
3-1 goes down into the dark under the roots, where the glowworms show the way; 3-2 turns the glowworms against him: what is lit is seen.

---
## 2-9 The River King's Court: "The King's Drum" (gauntlet; Normal 20.0; finale, no new mechanic)
**The ONE idea:** "The whole court dances to the king's drum: hop, ride, swing and bop on the beat, and the river carries you to the shrine."
A player says: "the one where everything moves to the drum." **Why it's a finale:** every World 2 toy has had its own clock; here they all
keep ONE beat you can hear. Nothing new to learn; the old toys feel new because they now make a song.
**The number that makes it work (real code, physics.ts:534/552):** a World 2 liana swings in 2.85 s (Easy 3.3). One swing = one bar of four:
**beat 0.7125 s (84 BPM) on Normal, 0.825 s on Easy**, and Easy's stretch (3.3 / 2.85 = 1.158) is the clocks' own `easyStretch` (stageKit.types.ts:52-53,
">= 1: Easy is never faster"). A hop takes 0.63 s (JUMP_AIRTIME, physics.ts:151, closed form; FLY it, rule 24), so a hop on every beat stands
on a pad about 0.08 s, far under a small pad's 1.0 s hold (w2Arc22.ts:7): **on the beat, the pads never sink.** The drum teaches the safe pace.
**Why fun for a sloth on a phone:** one thumb, no new input; the drum says WHEN, so the eye can rest. Upright (~425 px ahead) the next toy and
its beat are in view; sideways the whole phrase. A splash-back miss never stops the drum (Runner), so a child just rejoins the song.
**Tributes** (two from Blocks 3-4, one from anywhere):
- **Rayman Legends** (Ubisoft 2013, Matt's #80; the ONE famous game). a. Loved: "Best of all, each world wraps up with a stage that plays a spoof of a
  popular song... success relies on your ability to jump and kick to the beat of the music" (GamesRadar, https://www.gamesradar.com/rayman-legends-review/).
  b. Taught by nothing new: the world's own moves, already learned, now on the music. c. Ours: World 2's toys, already learned, now on the drum.
  d. Not copied: auto-scrolling, licensed songs, kicking.
- **Bit.Trip Runner** (Gaijin 2010, #75; lesser-known; 2-1's tribute for "the beat": NEW reason here, the song as the reward). a. Loved: "all of the
  levels are meant to be played in rhythm"; "With the avoidance of each significant obstacle, the music becomes more layered"; "Even the music continues
  its driving beat when you crash" (GamesRadar, https://www.gamesradar.com/bittrip-runner-review/). b. Taught by putting the first obstacles on the strong
  beats. c. Ours: the drum never stops for a miss; a second voice joins at each flag (data on the cue, not a system). d. Not copied: auto-run, and its
  "Complete lack of checkpoints" (the same review's reason to avoid): flags by the live rule.
- **Donkey Kong** (Nintendo 1981; the pre-1990 classic, from anywhere). a. Loved: "the whole story... could be told on screen in a way that could be
  instantly grasped"; "Pauline was still near the top of the screen crying for help, and Mario's goal was clear" (Game Developer, The Secret History of
  Donkey Kong, https://www.gamedeveloper.com/business/the-secret-history-of-i-donkey-kong-i-). b. Taught by showing the goal from the first second.
  c. Ours: the king's throne island far across the lake from the arrival on (backdrop), his tail thumping: the drum has a source you can see.
  d. Not copied: barrels at the player, the kidnap. (If the lead counts DK as "Mario", swap in Kung-Fu Master; I only opened its wiki page.)

| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The court's water gate at dusk, lanterns; the drum starts; the throne far off. Dot's teach 800 px+ before beat 1 (rule 6) | Listens | "The whole river is dancing" |
| 1 | **Hear the drum** (T p1, soft) | 2-5's snap stones over splash-back water, biting on four; now the drum plays the count | Hop 1-2-3, wait on BOOM | "I can hear when!" |
| 2 | Logs on the beat (P w1) | A river row whose log+gap / speed = 2 beats: the knock lands on the drum | Boards on the boom | "The logs dance too" |
| 3 | Pads on the beat (P f1) | 2-2's sinking pads, small ones | Hops every beat; they never go down | "Hop-hop-hop, never sink" |
| 4 | **Let go on ONE** (X s1, water) + flag, R | 2-4's liana-to-log relay: the swing is one bar, logs arrive on the bar | Lets go on the first beat of a bar | "Boom, and I'm on" |
| 5 | The guards (P p1 &, C w1) + R | 2-5's snappers snap on the beat, on stones, then riding logs | Bops each just after its snap (they paddle off huffy: the gauntlet's defeats) | "Snap... pop! Off you go" |
| 6 | **TWIST: double time** (W s1, :t0.36) + R | The king roars; the drum doubles; logs come twice a bar, the liana stays a bar | Lets go on every other boom | "Faster!" |
| 7 | Up to the throne (U c^, P f1 &) | 2-6's water wheel, one bucket a bar, up the terrace; then the terrace pond's pads with two guards | Rides up on the beat, hops and bops | "Lifted by the song" |
| 8 | **The grand dance** (S s1) | One 8-bar phrase: stones, log, liana, pads, a guard, liana, every voice in | Plays it through | "I danced through the whole court!" |
| 9 | Exit (E) | The shrine gate; the drum stops dead | Silence before Crocus Rex | "...uh-oh" |

**Node string (checkCode: no errors, 15 tokens, mini 9, creatures):** `A Tp1<:#soft Pw1> Pf1> Xs1>:#water R Pp1&>:&turtle*2 Cw1>:#water R Ws1>:#water:t0.36 R Uc^< Pf1&>:&turtle*2 Ss1>:#water E`
**Difficulty (pasted, DIFFICULTY.md:62-63):** "**World band** [10w - 11, 10w + 1]" = 9..21; "**Slots:** target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]"
-> 10 + 10 = **Normal 20.0** (the world's hardest, inside its band); Easy "at most 0.6 x Normal" (:61) = **at most 12.0**. Easy: the 0.825 s beat, `lashed`/`long`
rows, two guards fewer; never a faster clock (stageKit.types.ts:52-53).
**Engine.** WIRED on main: the one stage clock (clock.ts:2 "the one beat every timed thing in a stage reads"), rides placed by it (ridePlay.ts:2-6),
river logs (gen2/riverLay.ts), sinking pads (w2Arc22.ts), lianas (W2_LIANA), beat bricks that bite (beatBrick.ts:12), the gauntlet goal counts animals
(goals.ts:92), effects played live (conductor.ts:8). BUILT BY EARLIER WORLD 2 PACKETS (not on main yet): the liana over a river (2-4), snap stones in
play + the snapper cast row (2-5), the water wheel (2-6). Not used: followers, the current race, the flood (the finale is about the beat; scope).
**NEW 1 the court's tempo (S-M, 1-2 h; clock.ts, gen2/rideLay.ts rideFaults, the brief):** one beat length on the stage's brief; every clock in the
stage (log rows' (log+gap)/speed, stones, the wheel, the drum) a whole number of beats, its phase on a beat; the lay's check says which row is off, in
words. Toy: a stageTable row with a log row and a stone row on 0.7125 s; RED with one row's speed nudged off the beat.
**NEW 2 the drum you hear (S, ~1 h; audio/cues.ts + conductor.ts, fired from the stage clock):** a live drum hit each beat, the music bed ducked
under it, the court's lanterns pulsing (a small code-drawn touch); a second voice at each flag. Toy: the hit lands within one frame of the clock's beat.
Bots: no new skill (every piece is one they already play by 2-6). Art: the throne island far off (one Hugging Face backdrop piece, the lead's call).
**Differs from 2-1..2-8:** each of those had ONE toy on its own clock (logs, pads, followers, relay, stones, wheel, race, flood); 2-9 is the first
where they share one audible beat, and the first stage of the game with a song you play. Story line kept (stagePlan.ts:74); open lens, no outline read.
**For the story keeper (asks, not lines):** Dot before beat 1 (listen to the drum; hop on the beat); the king's roar at the twist; a line of silence at
the gate; a journal entry: why crocodiles are drawn to drums (or a true fact the keeper prefers).

---
## 3-1 Into the Grotto: "The Roof Road" (sprint; Normal 19.5; TEACHES World 3's signature: hanging under)
**The ONE idea:** "Under the ground the roof is your road: hang under the roots, creep across, and slide down them into the glowing dark."
A player says: "the one where you slide down the roots upside down." **The hook:** a sloth hanging under a branch is the most sloth thing there is;
World 3 makes it the way DOWN. A level root is a slow creep; a sloping root is a slide. Following the lit glowworm threads along the roots is the
story's line made literal ("Follow the glowworm light down into the grotto", stagePlan.ts:77).
**Why fun for a sloth on a phone:** one thumb: up to grab, hold right to creep or slide, down to drop. The slide is speed for the slowest hero.
Upright: the camera leads downhill so the root's lit end (where to let go) is in view; sideways: 150 px over his head is behind the goal sign
(level.md World 1 notes) and he hangs 86 px under a root (rope.ts:10 HANG_DROP), so no root a beat needs runs in the top band: measured in a test (rule 8).
**Kind falls (Pitfall II's insight):** going down, a missed grab lands him on the path below: it costs seconds, never a life.
**Tributes:**
- **Donkey Kong Country Returns** (Retro 2010, #70; the ONE famous game). a. Loved: "Retro recaptures most of Donkey Kong's venerated platforming roots" (Giant
  Bomb, wiki); its makers "introduced surface-clinging to expand gameplay to walls and ceilings" (wiki). Producer Kensuke Tanabe on what players should feel:
  "let the person who is playing feel empowered in the sense that they're the one who made the discovery about what they need to do... a really different
  experience from telling someone to turn right" (Game Developer, https://www.gamedeveloper.com/business/turning-nintendo-the-i-donkey-kong-country-returns-i-interview).
  b. Taught by the look: the grass on the ceiling says "grab". c. Ours: every root he can hang on wears lit glowworms; Dot says "hang on", never "turn right".
  d. Not copied: the grass, the grab button.
- **Limbo** (Playdead 2010, #78; lesser-known by 1-9's precedent; 1-9's for a hunter beaten by the world: NEW reason here, the dark as beauty and one-thumb
  simplicity). a. Loved: "praised for its puzzle design and the simplicity of its controls"; "Journalists praised the dark presentation" (wiki). Its makers:
  "We learned so much just sitting and watching people" (Game Developer, Hanging in Limbo, https://www.gamedeveloper.com/business/hanging-in-limbo). b. Taught
  with no words, by silhouettes. c. Ours: roots in silhouette against glowworm light; a dark that is lovely, not scary. d. Not copied: "you know you can die in an
  instant" (the same interview): 3-1 never kills.
- **Pitfall II: Lost Caverns** (Activision 1984; the pre-1990 classic, from anywhere; Pitfall! was 2-5's, this is another game). a. Loved: "Possibly the first
  big-world game... Pitfall II discards entirely lives, health, and even death... could be played continually until finished" (Game Developer, Game Design
  Essentials: 20 Open World Games, https://www.gamedeveloper.com/design/game-design-essentials-20-open-world-games). b. Taught by going DOWN into caverns.
  c. Ours: a descent where a miss drops him lower, never out; each glowworm grotto a flag. d. Not copied: the maze, eels, scorpions.

| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | The grotto mouth, daylight behind; a great root arching into the dark, its underside threaded with lit glowworms | Looks down | "Ooh... it glows" |
| 1 | **Hang on** (T r1, soft) | A LEVEL root over a moss dip one step deep (a miss walks back up) | Jumps up, hangs, creeps across | "Upside down, like a real sloth!" |
| 2 | The floor (P g1) | Stalagmites, a glowing-mushroom bed (light from the world) | Runs | "Still underground" |
| 3 | **The first slide** (P r1_, soft) | A root sloping down to the next shelf, moss below | Holds right: slides, threads streaking past | "Wheee!" |
| 4 | Let go on the light (X f1) + flag, R | A slide ending over three hanging shelves; the lit one is the way on | Drops at the lit thread | "Right on it" |
| 5 | **Stop and they wake** (P g1<, dark) | The first sleeping glowworms (zones.ts:79-81: 0.7 s still wakes them up to 1,050 px ahead) | Stops; the road lights up ahead | "There's the way!" |
| 6 | Slide what you lit (C r1_) + R | A long slide through that dark | Slides | "I made the light" |
| 7 | Up a root wall (P c1^) | A climb to a lookout over the cavern | Climbs | "So deep" |
| 8 | **TWIST: no floor** (W r1, dark) + R | A long level root over a shaft; a fall lands on the shaft floor and a climb back (time, not a life) | Creeps the whole way | "Don't look down" |
| 9 | **The great root** (P f1, S r1_) | Three last hanging shelves, then the longest slide, cavern roof to the glowworm lake, thousands of lights like stars; camera pulls out | Slides it all | "I slid into the stars!" |

**Node string (checkCode: no errors, 15 tokens, mini 1):** `A Tr1<:#soft Pg1 Pr1_:#soft Xf1> R Pg1<:#dark Cr1_> R Pc1^ Wr1>:#dark R Pf1 Sr1_> E`
**Difficulty (pasted, DIFFICULTY.md:62-63):** band [10w - 11, 10w + 1] = 19..31; target 10(3 - 1) + T[1st] = 20 + (-0.5) = **Normal 19.5** ("a first stage
just under the last world's end", :64: under 2-9's 20.0); Easy "at most 0.6 x Normal" = **at most 11.7**. Easy: every slide over soft ground, the
lit threads awake where Normal makes him stop.
**Engine.** WIRED: shimmy ropes (rope.ts; engine.ts:5482 updateRope; creep ROPE_SPEED 120 px/s, rope.ts:8), taught in 1-3 (dotLinesData.ts:106);
dark zones with lights, awake or sleeping (zones.ts:48-51, drawn engine.ts:7388/7722); stillness wakes sleeping glowworms (engine.ts:8839-8853);
a glowing mushroom wakes them too (engine.ts:8828); the grotto's dressing (w3Art.ts).
**FOUNDATION first (not one of the level's 2; pushback 2):** World 3 has no gen2 kit (gen2/worlds/ holds w1, w2, w5-w8; World 3 is hand-built,
w3Sections.ts). A `w3.ts` kit like ENG-W2's (ground, the grotto's inventory rows, a dark zone as section data, tips, finish, stageTable rows).
**NEW 1 the sloping root (M, 2-4 h; types.ts:485 Rope, rope.ts ropeYAt, engine.ts updateRope, ropeArt.ts, a gen2 root section):** a hang line with a
height at each end (today one `y` plus sag), drawn as a root (`look: 'root'`); creep on the level, slide faster down a slope (capped), slower up one;
ends over ground (ROPE_OVERLAP, rope.ts:18). Toy: a sloped root on a stageTable row: the slide beats the creep's time; flattened, it equals it (RED).
**NEW 2 bot skills (S, ~1 h; tools/inspect/firsttimer.ts SKILLS):** hang-and-creep and slide-then-drop-at-the-lit-end, each on a planted toy (RED with
the skill removed). Art: roots in the grotto's style (inventory first; else Hugging Face, the lead's call).
**Differs:** World 2 went ACROSS on things that move; 3-1 goes DOWN on the roof. 1-3's rope is a level line between ledges; these roots slope, slide and
run over everything. First stage where light is a tool. Story line kept (stagePlan.ts:77).
**For the story keeper:** the teach before beat 1 (hang on: up to grab); a sloth fact (they hang upside down by long curved claws); the stop-and-wake
teach before beat 5 ("Too dark to see. Stand still and listen..." exists, dotTips.ts:121); wonder at the lake.

---
## 3-2 Glowworm Path: "Don't Stop Where They Glow" (stealth; Normal 23.0; World 3's first TURN)
**The ONE idea:** "Stand still and the glowworms wake, and the watching eyes see what is lit: keep moving in the dark, and stop only under the moss."
A player says: "the one where stopping turns the lights on." **The hook (the game's stillness ladder):** 1-7 taught stillness HIDES him; 2-2 that it
SINKS him; 3-1 that it LIGHTS the way; 3-2 that it gives him AWAY. Same wired rule as 3-1 (GLOW_STILL 0.7 s), meaning flipped. Story line exact:
"Something is watching. Keep low and keep moving." (stagePlan.ts:78)
**The eyes:** oilbirds, real cave birds of northern South America that find their way by clicking (the keeper checks the fact): pairs of eyes on the high
ledges; a click-click (calm), a shriek (warn), the gaze sweeps (pass), as 1-7's eagle (watcher.ts:3-8). A pass that finds him in light costs what 1-7's
costs (watcher.ts:6); in the dark it never finds him. Woken glowworms stay lit until the stage starts again (engine.ts:8835/8852 set them; only engine.ts:1065 clears them), so a careless stop leaves a lit patch
he must later cross in the calm: the cost of a stop is a harder way on.
**Why fun for a sloth on a phone:** the decision is only WHERE to stop, made with one thumb. Upright: from a moss curtain the next curtain, the lit patch
and the eyes' ledge fit one screen (rule 8, measured); sideways: the eyes' ledge must sit below the top 150 px.
**Tributes:**
- **Inside** (Playdead 2016, #86; lesser-known by precedent). a. Loved: "the intimidating spotlights of mechanical sentries to flashlight beams slicing through
  trees" (PC Gamer, https://www.pcgamer.com/inside-review/); "the occasional glimpse of natural light feel like a blessing" (GamesRadar,
  https://www.gamesradar.com/inside-review/); "dark, with color used sparingly to highlight both the player and certain parts of the environment" (wiki).
  b. Taught by a first light that sweeps where it can't reach you. c. Ours: light is the danger, and HE makes it by stopping. d. Not copied: the violence
  (PC Gamer: "a masked man guns him down"); nobody is hurt.
- **Metroid Dread** (MercurySteam/Nintendo 2021, #95; post-2005). a. Loved: Sakamoto: the side view "helped create tension, as players can see the E.M.M.I.
  chasing from a distance" (wiki). The warning: "There's a great game buried in here, but you'll need to constantly push through some frustrating
  encounters" (GamesRadar, https://www.gamesradar.com/metroid-dread-review/). b. Taught: a zone you know is watched. c. Ours: the eyes' ledge always in view,
  every pass announced. d. Not copied: the chase and the instant capture GamesRadar found frustrating.
- **Metal Gear** (Konami 1987; the pre-1990 classic, from anywhere). a. Loved: "Each game is designed so that you can play without engaging the enemy. The NES
  originals were the first mainstream stealth games on consoles"; later stealth: "utilize dynamic light sources to make sure your shadow isn't detected"
  (GamesRadar, The sneaky history of stealth games, https://www.gamesradar.com/the-sneaky-history-of-stealth-games/). b. Taught by guards you pass, never fight.
  c. Ours: the eyes are never fought; the stage is played without engaging. d. Not copied: guns, the alert chase.

| # | Beat (token) | What is there | He does | He feels |
|---|---|---|---|---|
| 0 | Arrive (A) | A gallery roofed with sleeping glowworm threads; far up, eyes catch the light. Dot whispers | Creeps in | "Something's up there" |
| 1 | **The moss hides** (T m1<, dark) | No eyes yet: stopping in the open lights a patch; stopping under a moss curtain lights it too, but hides him (wired, hangCover.test.ts) | Tries both | "Under the moss, nobody sees" |
| 2 | Keep moving (P r1) | 3-1's root road through the dark | Creeps on, never stops | "Keep going, keep going" |
| 3 | **The first eyes** (P g1 &<) | One oilbird; its first pass free (DIFFICULTY.md:24) | Walks the dark floor as it looks: unseen | "It can't see me in the dark!" |
| 4 | Cross the light (X m1 &) + flag, R | A pool lit for good between two moss curtains | Waits under the moss, crosses in the calm | "Now... go" |
| 5 | Slide in the dark (P r1_) | A root slide (3-1's) | Slides; downhill keeps him moving | "Whoosh, still dark" |
| 6 | Two eyes (C g1 &) + R | Dark floor, lit pools, moss, two sweeps | Picks where to stop | "Not here... here" |
| 7 | **TWIST: eyes below** (W r1 &) + R | The root road crosses OVER a roost; hanging still wakes the roof's threads (NEW 2) | Creeps without a pause | "Don't stop... don't stop..." |
| 8 | Breathe (P m1<) | A moss gallery | Rests hidden | "Phew" |
| 9 | **The long gallery** (S r1 &) | Roots, dark floor, two lit pools, three eyes; at the end the grotto's heart, where he is safe and every glowworm wakes at once | Plays it all, then stops on purpose | "Now they can shine" |

**Node string (checkCode: no errors, 14 tokens, mini 2, creatures):** `A Tm1<:#dark Pr1> Pg1&<:&oilbird*1 Xm1&>:&oilbird*1:#dark R Pr1_ Cg1&>:&oilbird*2:#dark R Wr1&>:&oilbird*2:#dark R Pm1< Sr1&>:&oilbird*3:#dark E`
**Difficulty (pasted, DIFFICULTY.md:62-63):** band 19..31; 20 + T[2nd] = 20 + 3 = **Normal 23.0**; Easy "at most 0.6 x Normal" = **at most 13.8**. The meter
reads it as watched stretches (DIFFICULTY.md:24); keeping still is restraint (§6, no bits yet). Easy: one eye fewer per stretch, longer calms.
**Engine.** WIRED: the watcher's rhythm and hiding rule (watcher.ts), hanging cover under moss (hangCover.test.ts), dark zones and sleeping glowworms
woken by stillness (zones.ts:79-81, engine.ts:8839-8853), 3-1's roots (its NEW 1), the World 3 kit (foundation).
**NEW 1 the eyes see what is lit (M, 2-3 h; watcher.ts, engine.ts light query):** inside a dark zone a pass sees him only within a woken light's radius (a
glowworm, a glowing mushroom, a lamp); cover still hides him. Toy: dark stretch + watcher: a walk passes unseen; a 0.7 s stop wakes the lights and the
next pass sees him; with the lit rule off he is seen in the dark (RED).
**NEW 2 hanging still counts (S, ~1 h; engine.ts:8844 reads `p.grounded` only) + bot skill "stop only in cover":** global (every dark zone with roots,
the hand-built World 3 stages included, re-checked: rule 22). Toy RED with hanging excluded. Art: the eyes (two glints: a small code touch); the oilbird
burst when it sees him (one Hugging Face job, the lead's call).
**Differs:** 1-7's bush and eagle: stillness saved him; here it betrays him. 3-1 taught the glowworms as a gift; 3-2 makes them a cost. Story line kept.
**For the story keeper:** Dot's teach before beat 1 (stop only under the moss); the first eyes (it can only see what glows); an oilbird journal entry.

---
## Learned
- Read the wired rule before the story: GLOW_STILL (zones.ts:79) gave World 3 two levels from one rule (3-1 light is help, 3-2 light is danger).
- The liana's 2.85 s period gave 2-9 its tempo (one swing = one bar) and Easy's stretch for free: check what a fixed number can BE before adding one.
- Check the earlier picks' tributes first (PICKS-19-22): it saved three reuses (Frogger, Abe's Oddysee, Mario Bros.).
- For pitch.md step 2: Hardcore Gaming 101 was down (11-18 5:40 PM ET); a Wikipedia page's reference list is the fastest way to an allowed-host review.

## Pushback
1. **Hanging is not new to the player:** shimmy was taught at 1-3 ("Ropes can show up from stage 1-4", dotLinesData.ts:121). World 3's signature
   must be new in kind or 3-1 re-teaches 1-3: hence the SLOPING root (slide), the roof as a road over everything, and hanging that wakes the lights.
2. **World 3 has no gen2 kit** (gen2/worlds/ on main: w1, w2, w5-w8). 3-1 and 3-2 cannot build in under 2 hours until a w3.ts kit exists, as 2-1
   needed ENG-W2. Foundation first (D40): the World 3 kit is its own engine packet, before 3-1's.
3. **"Keep low" fights the signature** (stagePlan.ts:78): he hangs HIGH under the roots. This design reads it as "keep your light low"; the keeper may
   prefer "Something is watching. Keep moving in the dark." A keeper call, not mine.
4. **2-9 rests on 2-4, 2-5 and 2-6's engine pieces** (not on main): it builds after them, and its NEW 1 must not re-time rows those stages own.
5. **Glowworms never go back to sleep mid-stage** (engine.ts:8835/8852 set glowWake; only the stage start clears it, engine.ts:1065): 3-2 uses that as its cost; the engine member must confirm a set-back keeps
   (or clears) them on purpose and plant it. **Bit.Trip Runner and Limbo are reused** (2-1, 1-9) with new reasons; **DK 1981** is Mario's debut: if the
   lead counts it as Mario, 2-9 has two famous games; then use Kung-Fu Master (wiki only opened).
6. **Nothing here is flown yet** (rule 24): the beat-pad margin uses JUMP_AIRTIME's closed form; the final designer flies it at 30 fps before laying.
