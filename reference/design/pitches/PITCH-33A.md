# PITCH-33A (fixed lens): 3-3, 3-4, 3-5. Pitcher A, written 6:31 PM ET 11-19 (by `date` in the same command). Base origin/main 6e7b85f8f.
Read: the packet, pitch.md (whole), level.md, 2-4.md (the bar), PICKS-29-32, GAME-MAP §3 and §4 World 3 (origin/t-design-game-map),
WORLD-3-PLAN §1-§2 (origin/t-plan-w3), 3-1.md and 3-2.md (origin/t-design-31-32). NOT read: t-pitch-33b. Node strings: `C33=... C34=...
C35=... npx tsx reference/specs/sims/nodes3335.ts` (the strings below; all three: "checkCode: no errors", 14 tokens each).
**The ladder these three make** (one new thing a stage, as 3-1 dark / 3-2 hang): **3-3 noise CALLS a hunter** (a tool: ring the chime, the
prowler comes to look) -> **3-4 the breather** (no hunter; the beat climbs at you) -> **3-5 noise WAKES a sleeper** (the same noise, now the
danger, and in its twist a tool again). 3-3 sets up 3-5: the player has used noise on purpose before he must hide from it.
Difficulty (pasted, DIFFICULTY.md:62-63 on main): "**World band** [10w - 11, 10w + 1]" = 19-31; "**Slots:** target(w, s) = 10(w - 1) + T[s],
T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]"; Easy "at most 0.6 x Normal" (:61). So 3-3 **24.5** (Easy <= 14.7), 3-4 **23.5** (<= 14.1, the
breather), 3-5 **26** (<= 15.6).

## 3-3 Footprints in a Circle (purge, right): "Ring the chime, and the prowler walks right under the loose stalactite"
**One idea:** "Ring a chime stone and the prowler comes to look: knock the loose stalactite down on its circle and the crash chases it off."
A player says: "the one where you call the jaguars under the icicle rocks." **The hook:** a sloth does not fight; he arranges the cave.
The prowlers walk in circles (their glowing footprints in the moss show the round); Pokey sits safe on a shelf above and makes them come.
Nobody is hurt: the load never touches them, the crash chases them off (dropTrap.ts:6-8, the story keeper's rule; OCELOT beatenBy
trap: chasedOff, world3.ts:21). 1-3's drop trap was a thing you waited on; here it is a thing you CALL them to.
**Tributes** (lead: Lode Runner, from anywhere; Block 1: DuckTales, Super Mario Bros.)
- **Lode Runner** (Broderbund 1983; lesser-known now). a. Loved: John Harris, Game Developer "20 Difficult Games": "the rather dim-witted
  enemies who by the end are more tools to be taken advantage of than opponents" (https://www.gamedeveloper.com/design/game-design-essentials-20-difficult-games);
  GamesRadar's best of the '80s: "maddeningly addictive" (https://www.gamesradar.com/best-games-80s/). b. Taught: a guard walks to you, you
  dig, it falls in: the enemy's own chase is the lesson [S for the first-level layout]. c. Ours: the prowler's curiosity is the tool; Pokey
  never runs from it, he places it. d. Not copied: digging, gold, being chased.
- **DuckTales** (Capcom 1989, Block 1 #21). a. Loved: GamesRadar (Henry Gilbert, 2013) on the remake keeping the original: "knocking rocks at
  enemies like they're golf balls, just like the old days" (https://www.gamesradar.com/ducktales-remastered-7-reasons-its-remake-done-right/).
  b. Taught: the rock sits beside the first enemy [S]. c. Ours: the room's own stone is the only weapon; the claw punch (1-3) sends it.
  d. Not copied: the pogo, the golf swing.
- **Super Mario Bros.** (Nintendo 1985, Block 1 #5; the one famous title). a. Loved: Miyamoto (GamesRadar, Scott McCrae, 26 Oct 2026):
  "the most interesting thing about the original Super Mario Bros. is the fact that Mario doesn't actually fight Bowser" (https://www.gamesradar.com/platforms/nintendo/nintendos-shigeru-miyamoto-says-the-most-interesting-thing-about-super-mario-bros-is-that-you-dont-actually-fight-bowser/).
  b. Taught: the axe is in plain view past him: you see the answer before you reach it. c. Ours: the signature's great stalactite is in
  view the whole last stretch; the "boss" is beaten by the cave. d. Not copied: the bridge, the fall into lava (nobody is hurt).
**The arc** (Normal s; flags and hearts by the live rule, pipeline.ts ROLLED_FLAGS, D49)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | A moss ring of glowing pawprints; Dot's teach 800 px+ before beat 1 (rule 6) | Reads the round | "Something walks here" |
| 1 | **Teach: chime, then crash** (T x1&, safe) | 18 | Pokey on a shelf over 80 px above an ocelot's round (sight tall 80, unseen); a chime stone hanging by the stalactite | Punches the chime; it pads over and looks up at the ringing (4.5 s, NOISE.dur); punches the stalactite's root | "It came! ...CRASH! It ran!" |
| 2 | Shelves (P f1) | 10 | Caps and ledges along the roof | A breath | "Ha!" |
| 3 | **Ring on the round** (P g1&) | 14 | The chime 600 px from the far end of the circle: rung too early, the ocelot is out of hearing (bell 680, noise.ts:24) | Waits for the footprints to bring it round, then rings | "Wait for it... now" |
| 4 | **TEST: two in one crash** (X x1&) + flag, R | 18+6 | Two ocelots on crossing rounds, one stalactite (scare 170, dropTrap.ts:28) | Rings when both are in hearing; both come; one crash | "Two at once!" |
| 5 | Root curtain (P c1) | 10 | Climb to the upper gallery | Climbs | "Up we go" |
| 6 | **TWIST: be the bait** (W g1&) + R | 18+6 | No chime: a loud landing (a drop over 200 px, heroNoise LOUD) brings it to where HE is (core.ts:323); a root curtain beside the stalactite | Drops loud, climbs out of sight, holds still (still = loses him); it noses under; crash | "I was the bait!" |
| 7 | Floating caps (P f1) | 10 | Cap stepping stones | A breath | "Phew" |
| 8 | **COMBINE: the ring room** (C m1&) + flag, R, heart after | 26+6 | Three rounds, two stalactites, one chime, ferns to freeze in (Easy: two ocelots, `normalOnly` on one) | Chooses the order; freezes in a fern if one turns his way | "Which one first?" |
| 9 | **SIGNATURE: the old drip-bell** (S x1&) | 18 | The cave's great stalactite over the den, in view from beat 8 on; a huge chime the whole cave hears | One ring; every prowler left comes; one blow; the roar and dust; their footprints run out of the cave | "They're all gone!" |
| 10 | Exit (E) | 8 | The shrine where the ring was | Walks the empty ring | "Our cave again" |
**Node string** (checkCode: no errors, 14 tokens, mini 3, creatures): `A Tx1&<:&ocelot*1 Pf1> Pg1&<:&ocelot*1 Xx1&>:&ocelot*2 R Pc1< Wg1&>:&ocelot*1 R Pf1< Cm1&>:&ocelot*3 R Sx1&<:&ocelot*3 E`
**First appearances, each taught:** the chime (beat 1: from a shelf it cannot see, so it cannot fail); the drop trap is 1-3's (Dot names it);
the bait (beat 6, Dot before it: "they come to where you land"). A miss costs: a lure that misses times out (4.5 s) and the round resumes.
**Engine** (checked on origin/main 6e7b85f8f). WIRED: the drop trap (dropTrap.ts: set, loose 0.3 s, falling, down; scare 170 px, chases off),
gen2 traps by data (w1Cast.ts:65 trapsOf), the ocelot (world3.ts:12-24: comes to noise, loses a still sloth, chased off by a trap), the lure
rule (core.ts:320-336: a THROWN noise or a rung BELL draws it to look, noticing nobody), his landing noise into the cast (castPlay.ts:159).
**NOT wired:** nothing emits a bell or a punch noise: bellNoise/punchNoise/thrownNoise have no caller in src/ (git grep, only heroNoise.ts).
FOUNDATION (planned, not 3-3's): F1 ENG-W3a, F3 ENG-PROWL, F4 W3-ART-1. **NEW 1 ENG-LURE** (S-M, 1.5-2 h; gen2/worlds/w3Cast.ts + castPlay.ts):
the chime stone, a struck fixed thing that sends bellNoise into the cast (a punch on it makes ONLY the chime's sound, never his own punch
noise, so it always lures), and the trap post's look 'stalactite' (TrapPost kind; load hangs from the roof). Toy: a W3 row, chime + stalactite
+ ocelot; plant: the chime silent -> the ocelot never comes (RED). **NEW 2 bot skills** (S-M, 1-1.5 h; tools/inspect/firsttimer.ts SKILLS):
`ring-then-drop` (ring when the round is in hearing, punch the root when it stands under) and `bait-and-climb` (loud drop, climb out, hold).
**Builds in under 2 h once** F1, F3, ENG-LURE and the 2 skills exist and W3-ART-2's stalactite (set, falling, fallen) and chime are labelled.
**Differs:** from 3-1 (no creature, light) and 3-2 (he hides from prowlers; here he hunts them); from 1-3 (the trap waited for its animal:
here he calls it); from 2-3/2-9 (chasing off by kick or drum); no World 2 level has him make a hunter come. GAME-MAP kept (purge, lure under
a stalactite); added: the chime (no aiming a throw on a phone), the bait twist, the footprints as the round's readable map. The jaguar
(first: 'trap', world3.ts:31) waits for 3-9: one new creature a world stage at a time.

## 3-4 The Sinkhole (ascent, up): "The sleepy clouds rise up the shaft: tuck into a nook and let each one pass"
**One idea:** "Climb the sinkhole toward the moon between the mushrooms' breaths: their sleepy clouds float UP the shaft, so duck into a nook
and let each one drift past." A player says: "the one where the sleepy clouds float up after you." **The hook:** spores rise like warm air,
so the hazard climbs WITH him; the thumb's job is to stop in the right place (World 3's patience), then go. 3-1's puffs lit the way and
stood still; here they move along his own road. The breather (slot 3.5): no hunter, no thorns; a cloud costs height, never a heart.
**Tributes** (lead: Tower Toppler, from anywhere; Block 1: Jungle Hunt; Block 2: Donkey Kong Country 2)
- **Tower Toppler / Nebulus** (Hewson 1987; Matt's own favourite, lesser-known). a. Loved: Matt (INSPIRED-BY.md:9): "you just go around on
  circles, go into doors, but you had to jump and do platforms while you were doing it"; GamesRadar remembers it from the C64: "In my head it
  looked just as good as Fez looks now" (https://www.gamesradar.com/stunning-game-that-wed-forgotten-all-about-still-looks-stunning-have-a-look-for-yourself-be-stunned/).
  b. Taught: the first things that roll at you are slow and on your floor [S]. c. Ours: the nooks are its doors: step in, let it pass, step
  out higher. d. Not copied: the rotating tower, the timer, the sinking.
- **Jungle Hunt** (Taito 1982, Block 1 #2). a. Loved (GamesRadar, best Atari 2600 games): "a scene where the player must run under boulders and
  jump over rocks", and "simulated depth and excellent color make Jungle Hunt a cartridge worth tracking down"
  (https://www.gamesradar.com/best-atari-2600-games-all-time/). b. Taught: boulders come down the slope at you one at a time, then in pairs
  [S]. c. Ours: things that come along your road on a beat, one, then two columns. d. Not copied: running downhill, the spearmen.
- **Donkey Kong Country 2** (Rare 1995, Block 2 #45; the one famous title): Toxic Tower, a climb up a tower while the slime rises under you
  [S: no allowed-host page found]. c. Ours: only the SIGNATURE rises behind him (the spore tide), and it is slow and kind. d. Not copied: death.
**The arc** (Normal s; travel UP, the up tower 1-4 proved, stageTable.ts:41)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | The sinkhole floor; a coin of moonlight far above; Dot's teach (rule 6) | Looks up | "The moon!" |
| 1 | **Teach: the cloud floats up** (T c1, soft) | 16 | A short root column, one mushroom at its foot; a nook halfway | Watches a puff float up past him; climbs into it once: he slips down to the floor (soft) | "It just made me sleepy" |
| 2 | Ledges (P g1) | 8 | Stone shelves up the wall | Hops | "Easy" |
| 3 | **Nook to nook** (P p1) | 16 | A column, a mushroom at the foot puffing every ~6.4 s, a nook every ~300 px | Climbs, ducks in, lets it pass, climbs | "In... wait... out" |
| 4 | **TEST: outclimb it** (X c1) + flag, R | 16+6 | 400 px with no nook; the cloud rises slower than he climbs | Leaves the nook the moment it puffs and races it to the top | "Go go go!" |
| 5 | Mushroom bounce (P b1) | 8 | A big springy cap up to a shelf | Bounces | "Boing" |
| 6 | **TWIST: two columns** (W p1) + R | 18+6 | Two root columns on different beats, a ledge between them every storey | Crosses to whichever column is quiet | "This one's clear!" |
| 7 | Floating caps (P f1) | 10 | Glowing caps up an alcove | A breath | "Ahh" |
| 8 | **COMBINE: the tall wall** (C c1) + flag, R | 24+6 | Nooks, a race and a column swap in one wall; Easy: the race has a nook | Reads each puff and picks nook, race or swap | "I know this now" |
| 9 | **SIGNATURE: the moon climb** (S p1, #dark) | 20 | Every mushroom below puffs at once: a slow silver spore tide rising up the shaft in the moonlight | Climbs the long moonlit root ahead of it, out of the sinkhole mouth | "Up into the moonlight!" |
| 10 | Exit (E) | 8 | The forest edge at night, the moon | Sits in the moonlight | "We made it out" |
**Node string** (checkCode: no errors, 14 tokens, mini 4): `A Tc1^<:#soft Pg1^ Pp1^< Xc1^> R Pb1^ Wp1^> R Pf1^< Cc1^> R Sp1^<:#dark E`
**First appearances, each taught:** the rising cloud and the slip (beat 1: soft, from low, onto the floor); the nook (beat 3, Dot before it).
**Engine** (checked). WIRED: the up tower on gen2 (1-4, stageTable.ts:41), climbing at 220 px/s (engine.ts:2234-2236), the spore puff with
warn 1.0 / active 2.2 / period 6.4 (zones.ts:266-268) and drowsy, the bounce. **Drowsy does NOT touch a climb today:** it scales the run
speed only (engine.ts:2548-2549; the climb at :2236 never reads it), so a cloud on a column does nothing. FOUNDATION: F1, D3 ENG-SPORE (the
puff as a gen2 brick, shared with 3-1), F4/D9 art (root columns, nooks in grotto stone: PLAN-W3 §3 "the heaviest climb need").
**NEW 1 the rising puff** (S-M, 1.5-2 h; zones.ts a 'rise' shape: the cloud travels up a column at `rise` px/s for `h` px after its warn, its
fairness verdict: a nook within reach of every start, a race length the climb wins by a margin on both settings). **NEW 2 the slip + its bot**
(S-M, 1.5 h; engine.ts climb: in a cloud his grip loosens, he slides down at `slip` px/s to the nearest foothold below, never past a flag,
never a heart; firsttimer.ts skill `nook-wait`). Numbers the design flies (rule 24): rise speed (start ~110 px/s vs 220 climbing), nook
spacing, the race margin. **Builds in under 2 h once** F1, ENG-SPORE, NEW 1-2 and the climb art exist.
**Differs:** 3-1 goes DOWN and its puffs light; 3-2 hangs; 1-4's climb had rotting boughs and the two-vine pair, nothing moving at him;
2-x had no climb with a beat. Kept GAME-MAP (sinkhole, ascent, spores on a beat); added: spores RISE (the nook and the race), the moon climb.

## 3-5 Sleeping Vines (stealth, right): "Land soft, never punch, and freeze if one wakes"
**One idea:** "The old thorn vines are asleep: every loud landing or punch wakes the ones in earshot, so drop short, hang quiet, and if one
wakes, freeze until it dozes off." A player says: "the one where you tiptoe past the sleeping thorn vines." **The hook:** after 3-3, Pokey
KNOWS noise carries; now it is the danger. The rule a child can see: a short drop is silent (200 px or less, heroNoise.ts:20), a long one
and a punch are loud, and a still sloth is never lashed (thornVine.ts:5-7). **The turn:** in the twist he wakes one ON PURPOSE from out of its
reach, freezes while it looks, and walks past while it sleeps deepest: noise as a tool again, 3-3's lesson coming back.
**Tributes** (lead: Mark of the Ninja, from anywhere; Block 1: Pitfall!; Block 2: Super Mario World)
- **Mark of the Ninja** (Klei 2012, lesser-known). a. Loved: Nels Anderson (Game Developer, "five stealth design rules"): the rings show "how
  far a sound such as a smashing light will travel before you destroy it", to "make the systems all very, very understandable"
  (https://www.gamedeveloper.com/design/-i-mark-of-the-ninja-i-s-five-stealth-design-rules). b. Taught: the ring is drawn on every noise
  from the first room. c. Ours: every loud landing shows a soft ripple to its real radius (LOUD.landing: 180 + 0.9 px per px fallen over
  200, up to 560) and each vine it touches opens an eye. d. Not copied: killing, the dark-vision UI.
- **Pitfall!** (Activision 1982, Block 1 #1; reused for a NEW reason, not the vine). a. Loved: one of the first running-and-jumping
  multi-screen games; David Crane on it, Game Developer's Replay interview (https://www.gamedeveloper.com/design/the-replay-interviews-david-crane)
  [S for the crocodiles: no allowed-host page names them]. b. Taught: the crocodiles' jaws open and shut on a fixed beat; you cross on their
  heads while they are shut. c. Ours: the vines' sleep has a fixed beat you can read (thornVine.ts sleep / stir / look); cross in the sleep.
  d. Not copied: the heads as stepping stones.
- **Super Mario World** (Nintendo 1990, Block 2 #27; the one famous title): Rip Van Fish, asleep until you swim close, then it chases [S].
  c. Ours: sleepers you pass close by on purpose, and the joke of almost waking them. d. Not copied: the chase.
**The arc** (Normal s; flags and hearts by the live rule)
| # | Beat (token) | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | A hall of old thorn vines hanging from the roof, snoring (their buds swell and sink); Dot's teach (rule 6) | Tiptoes in | "Shhh..." |
| 1 | **Teach: loud wakes them** (T h1, soft) | 16 | A shelf 300 px up; one vine 400 px off (its reach far short of him) | Drops loud: the ripple reaches it, it opens both eyes, looks, dozes | "Oops! ...phew, it can't reach" |
| 2 | Floor (P g1) | 8 | Moss, petals | Rests | "Quiet feet" |
| 3 | **The quiet way down** (P r1) | 14 | A root over a vine bed (3-2's creep, silent); its end over moss 150 px down | Creeps, lets go soft | "Not a sound" |
| 4 | **TEST: short drops only** (X h1) + flag, R | 18+6 | Shelves down past vines: a stair of 160-200 px drops (silent) beside one tempting 400 px drop (loud) | Takes the stair | "The long way is the quiet way" |
| 5 | Down a root (P c1) | 10 | Climb down (straight down always climbs) | Climbs | "Slow and steady" |
| 6 | **TWIST: wake it yourself** (W h1) + R | 20+6 | A vine guarding a long passage, its sleep short; a high shelf out of its reach | Drops loud out of reach, freezes while it looks, walks through in its long sleep | "I woke it on purpose!" |
| 7 | Caps (P f1) | 10 | Glowing caps | A breath | "Ahh" |
| 8 | **COMBINE: the punch** (C m1) + flag, R, heart after | 24+6 | A loose rock blocks a fern nook: the punch (r 240) wakes the vines near it; ferns to freeze in (Easy: one vine) | Punches, freezes, goes in the deep sleep | "Punch, freeze... go" |
| 9 | **SIGNATURE: the oldest vine** (S r1, #dark) | 20 | Grandma's oldest vine, huge, across the shrine's mouth; a root over it | Creeps over; it opens one great eye at him... and goes back to sleep | "It looked right at me!" |
| 10 | Exit (E) | 8 | The shrine | Lets go soft | "Didn't wake a thing" |
**Node string** (checkCode: no errors, 14 tokens, mini 5): `A Th1<:#soft:#dark Pg1> Pr1<:#dark Xh1>:#dark R Pc1_< Wh1>:#dark R Pf1< Cm1>:#dark R Sr1<:#dark E`
**First appearances, each taught:** noise waking a vine (beat 1: out of reach, cannot fail); the punch as noise (beat 8: Dot's line before
it). The story keeper's own hook is already in the code (thornVine.ts:2-3: "Grandma always said they were asleep. One of them moved.").
**Engine** (checked). WIRED: the vine's sleep / stir / look rhythm, lash only on a MOVING Pokey in reach while it looks (thornVine.ts:1-10),
landing noise silent to 200 px (heroNoise.ts:20, :39-42), his landing noise into the cast (castPlay.ts:159), the creep (rope.ts), cover.
**NOT wired:** punch noise has no caller (punchNoise, heroNoise.ts:44); the thorn vine is no kit PredatorDef (world3.ts:35 lists ocelot,
jaguar). FOUNDATION: F5 **ENG-VINE** (the vine as a kit sleeper, wakes on landing or punch noise: PLAN-W3 §2) and D2 ENG-ROOT.
**NEW 1 the wake resets the beat** (S, 1 h; thornVine.ts data + ENG-VINE's kit def: a heard noise jumps it to `look` now, and after the look
it sleeps a FULL `sleep`: the twist's "wake it on your terms"; toy: wake from out of reach, then a walk-through in the sleep passes; plant: no
reset -> the walk is lashed). **NEW 2 bot skills** (S-M, 1-1.5 h; firsttimer.ts: `quiet-route` (prefer drops <= 200 px, freeze on a stir)
and `wake-from-afar`). Plus the noise ripple (a code-drawn ring, a small touch, STAGE-RULES §4) inside ENG-VINE. **Builds in under 2 h once**
F5, ENG-ROOT and NEW 1-2 exist.
**Differs:** 1-7 hid from eyes (a bush); 3-2 hid from eyes (the dark); 3-5 hides from EARS, and the sleepers cannot move: the danger is what
he does, not where they walk. 3-8 (thorn vines on a swing beat) reuses ENG-VINE afterwards. Kept GAME-MAP (all of it); added: the stair
vs. the long drop, wake-it-yourself, the punch as the combine.

## Learned
- The engine has a whole noise grammar (LOUD, bell lures, still loses him) with only ONE emitter wired (landings, castPlay.ts:159). World 3's
  three noise stages all lean on the missing emitters: wire bell + punch once (rule 22), not per stage.
- The allowed hosts: hardcoregaming101 answers with a maintenance page (11-19 evening); GamesRadar pages come back empty through WebFetch
  but whole through curl + tag strip (scratch only). Search the four hosts first, then curl: it cost me 20 min to find out.
## Pushback
1. **3-4 has no heart risk by design.** It is the breather (T[3] = 3.5); a cloud costs height. If the built meter reads under the band's
   floor (19), the dial is the race margin and nook spacing, never thorns (thorns are 3-5's).
2. **ENG-LURE, ENG-VINE and 3-5's NEW 1 all need the same missing emitters** (bell/punch noise into the cast). Build them ONCE as a
   foundation ("ENG-NOISE", S: bell + punch emitters into castPlay, a planted toy each) before ENG-LURE and ENG-VINE, or two members
   write the same wiring twice (D40).
3. Three tributes carry [S] on the exact mechanic (Pitfall!'s crocodiles, DKC2's Toxic Tower, Rip Van Fish): no allowed host had a page.
