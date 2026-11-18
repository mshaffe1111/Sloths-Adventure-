# PITCH-23A: 2-3, 2-4, 2-5 (Pitcher A, high; blind to B). Started 9:50 AM ET 11-18 (`TZ=America/New_York date`); base origin/main 6e7b85f8 (0.9.9)
Method: reference/methods/pitch.md (steps 3-4) and level.md's Building rules; format and bar from 2-1.md / 2-2.md (origin/t-pitch-b). Every quote below is from a
page opened this session (URL given); [S] = from a search snippet or my own knowledge, not opened. Targets from DIFFICULTY.md:62-64 (pasted per level).

## Facts checked on origin/main 6e7b85f8 before use (law 3)
| Piece | State | Where |
|---|---|---|
| World 2 gen2 kit, 2-1 and 2-2 built as designed | WIRED | gen2/worlds/w2.ts:1-25, w2Arc21.ts, w2Arc22.ts; stageTable.ts:60-62 (kits 'w2-21', 'w2-22') |
| River with drifting logs (rows: ride, deep, back, twin, long) and river bot skills `upstream`, `bankUp`, `handed` | WIRED | gen2/riverLay.ts:18-66, w2.ts:78-83; tools/inspect/firsttimer.ts:642 (SKILLS) |
| Splash-back vs deep water | WIRED | w2.ts:6-10 (a `water: true` gap is deep), riverLay RiverRow.safe |
| Sinking pads (weight) and pads on a beat (ClockDef rows), the spur, the crown lily | WIRED | gen2/rideLay.ts:86-131 (rideClock, clocks), w2.ts:91-102 (W2_PADS), w2Arc22.ts:18, :83 (spur22) |
| A jump off a carrier keeps its speed (one carry rule) | WIRED | engine.ts:842-844 (carryVx, RIDE.keep; lead's ruling 11:36 AM ET 11-15) |
| A landing on a drifting log from any fall (so from a liana's let-go too) | WIRED | engine.ts:2785-2795, river.ts:140 (DRIFT_CATCH; Easy +0.1 side) |
| World 2 lianas as data (`w2Liana`, `w2Perch`, gaps = World 1's) | WIRED, but a liana's landing is always a BANK | w2.ts:115-124 (place 'land' lays a bank perch) |
| Rescue cages in gen2 (quota objective, punched open: cageHp 2) | WIRED | gen2/pipeline.ts:3571-3572, engine.ts:4439-4447 (freeCritter: counts, +400, nothing follows) |
| Stillness (keep still in cover) | WIRED | stillness.ts; 1-7, 1-9 |
| **Followers (follow.ts)** | **MISSING**: no follow.ts, no follower anywhere in src/ | `git grep -n "follow\.ts" -- src tools` finds nothing |
| **Snap-jaw stones (beatBrick 'bites')** | **EXISTS-UNWIRED**: the type and brickNow's `hurts` exist (beatBrick.ts:11-31) and one test (beatBrick.test.ts:12); nothing lays or plays one: padPiece hardcodes 'gone' (pieces/padPiece.ts:58, :104) | beatBrick.ts, padPiece.ts |
| Snapping turtle | EXISTS-UNWIRED in gen2: its def is data (predators/world2.ts:11-16: kick, stomp, punch-from-behind; **no `trap`**), its AI and kick-the-shell play (predatorAI.ts:74, :331; snapperCount.test.ts); no World 2 cast rows (gen2 has none: `git grep turtle -- src/game/gen2` is empty) | |
| Drop traps | WIRED for World 1 cast rows (w1Cast.ts:65-88, dropTrap.ts trapFaults, pipeline.ts:4642) | |

---
## 2-3 Stuck in the Reeds: "The parade" (rescue; Normal 14.5, Easy at most 8.7)
**One idea:** "Free the little ones from the reed cages and lead them home: each one you free hops along in your footsteps, so the parade grows behind you."
A player says: "the one where the baby animals follow you home in a line." Why it's fun for a sloth on a phone: no new button. The thumbs do what they already know
(punch a cage, hop, ride); the reward is behind him on the screen, growing: a duckling, then an otter, then two capybara pups, peeping in a row. A child on Easy
plays it for the parade; the 12+ player plays it for the cages that are hard to reach and for keeping the line whole (a hit scares the last one off into the reeds).
**Our own idea (the sloth twist):** the slowest animal in the forest is the calmest. The last little one won't come to a punch: it is hiding, and it only comes out
when he stands still beside it. World 1 taught stillness to hide from hunters (1-7, 1-9); 2-3 turns it round: stillness makes him safe to OTHERS.
**How the followers work (the whole rule, kept small so it is one M piece):** a freed little one replays his own path a short delay behind him (his positions,
recorded), so it can never be stranded and never needs its own pathfinding: anywhere he went, it can go. Over water it SWIMS (otters, capybaras and ducks all
swim: nature-true, and the story keeper can make a joke of the sloth who can't swim yet). On a fall they wait at the last flag (GAME-MAP's rule), which is where
he comes back. On a HIT on Normal the newest one in the line runs into the nearest reeds and hides: he gets it back the shy one's way (stand still beside it, 1.5 s).
Easy: a hit scares no one. At the sanctuary gate they hop home to their mothers (the count: "bring N home", GAME-MAP 2-3).
**Tributes** (shelf: Block 1 pre-1990 + lesser-known, Block 3, outside the list post-2005; no famous few):
- **Choplifter** (Brøderbund 1982; lesser-known today). a. Loved: Softline wrote that seeing the hostages' "hope and excitement, their faith in you" made it "hard to
  play"; the Commodore 64 Home Companion found the hostages made it "alive" (https://en.wikipedia.org/wiki/Choplifter). The people you save are the feeling. b. Taught by
  doing: land, they run to you and board; full, "They will wave the helicopter off and wait for its return"; "Each successive trip is typically more perilous than the last"
  (same page). c. Ours: the first cage sits on the safe bank and the duckling's first hop behind him IS the lesson; cages get harder to reach as the line grows. d. Not
  copied: shooting, hostages dying, the capacity limit and return trips (2-7 owns the first run back left).
- **Oddworld: Abe's Oddysee** (1997; used in 1-9 for "one creature, one readable rule": the reason here is NEW, the one Matt's list names, "dynamic AI followers").
  a. Loved: GameSpot (Joe Fielder) said its AI "goes a long way towards making you feel as if you're interacting with an actual world and its inhabitants"; the makers
  wanted players to "empathize with Abe... care for him" (https://en.wikipedia.org/wiki/Oddworld:_Abe%27s_Oddysee). b. Abe can "command them to follow him, stay put",
  and "Mudokons can be rescued by safely leading them past traps and enemies" (same page). c. Ours: no command button (one thumb): following is automatic, and the
  danger is kind (a scared one hides, it never dies). d. Not copied: GameSpeak, followers killed by traps, the dark industrial tone.
- **Spelunky** (Derek Yu, 2008/2012; post-2005). a. Loved: IGN, "a superb 2D platformer that's as easy to hate as it is to love" (https://en.wikipedia.org/wiki/Spelunky):
  the love quoted is for the game, not the damsel itself (honest gap). b. "damsels in distress trapped in the caves, who can be picked up and carried to an exit.
  Successfully doing so returns health to the player" (same page): an optional rescue with a reward at the door. c. Ours: the sixth cage is the optional one (rescue
  lays goal + 1, pipeline.ts:426), on the hard road; bringing all six home is the 12+ bite and pays a heart at the gate. d. Not copied: carrying, throwing, the damsel trope.
**The arc** (graph `A T P R X P R W R P M R L S E`; Normal seconds; flags and hearts by Matt's rules as gen2 enforces them, pipeline.ts:1748 ROLLED_FLAGS: first 700, span 900-4000, 2300 over deep water)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | The reed beds past the village; peeping from the reeds; Dot's line 800 px+ before beat 1 | Walks in | "Who's crying?" |
| 1 | **First cage, safe** (T) | 14 | A reed cage on the dry bank, a duckling inside | Punches it open (1-3's punch); the duckling hops out and lines up; he walks, it walks; he stops, it stops | "It's following me!" |
| 2 | **The parade swims** (P) | 14 | A splash-back creek with stepping stones (W2 stones) | Hops the stones; the duckling paddles across behind him | "She can swim!" |
| 3 | Bank (R) | 8 | Reeds and petals | Walks; the line peeps | "Good girl" |
| 4 | **Up the mooring post** (X: 1-4's climb, new reason) + flag | 18 | A cage tied high on an old ferry post, a climbing vine to it | Climbs, punches it; the otter pup drops into the water and swims to the line | "Got you!" |
| 5 | **Out to the island** (P) | 18 | A river (2-1's `ride` row) to a reed islet with a cage; logs back the other way (`back`) | Rides out, frees two capybara pups, rides back; the line swims his path | "Everybody on!" |
| 6 | Bank (R) + heart | 8 | | | |
| 7 | **TWIST: the shy one** (W) + flag | 16 | No cage: a pup hiding in a reed clump, eyes only; Dot 800 px+ before: be calm | Punching does nothing; he stands still beside it 1.5 s; it creeps out and joins | "Shh... it's okay" |
| 8 | **The pads** (P) | 14 | 2-2's weight pads across a pool (the line swims under them) | Keeps hopping (2-2's lesson), never stops | "Don't stop, follow me" |
| 9 | **All of it** (M) + flag, heart after | 22 | Deep water (a heart), a cage on a pad islet, a liana over a creek (1-6), the optional sixth cage up the hard road | Picks: five, or all six | "One more..." |
| 10 | **Home stretch** (L) | 16 | Deep river, logs, a reed-hidden scared one if he was hit | Brings the line through whole | "Stay close, stay close" |
| 11 | **Homecoming** (S, signature) | 10 | The sanctuary pool: mothers waiting (duck, otter, capybara) | Walks in; each little one hops off to its mother, one by one; the count fills | "WOW. They're home." |
| 12 | Exit (E) | 6 | The shrine | | Proud |
**Node sketch:** `A Tg1<+cage Pw1>:#soft R Xr1<+cage Pw2>:#soft+cage R Wm1<+shy R Pp1>:#soft Mw2>:#water+cage+cage? R Lw2>:#water R S E` (`+cage` = the node's quota item,
types.ts:630; `+shy` the new hidden one; `m` is the reed clump as cover, nodeLetters.ts `m`; w counted against V11's 40% cap by the builder).
**Phone, both ways:** the line is short (at most 6 pups at about 30 px each, a step behind: 180-200 px of trail), so it fits the 270 px behind him upright; sideways
the whole line. Each cage is in view from where he decides (rule 8): the post's cage from its foot, the islet's from the bank. Stills of the line at 0, 3 and 6.
**Engine** (2 NEW, both to be built and proven on a REAL stage row before the builder starts, rule 23):
- WIRED: cages and freeCritter, the rescue quota, rivers and logs, pads, World 2 lianas, climbing vines, stillness, flags, hearts.
- **NEW 1 followers + "bring N home" (M, 3-4 h):** new src/game/follow.ts (pure: the trail buffer, the delay per place in line, swim when the trail point is over a river or
  pool, wait at the flag on a fall, hop home at the gate); engine.ts freeCritter starts one instead of counting; goals.ts counts arrivals at the gate; draw with the cast's
  existing critter clips (duck, otter, capybara: the hand-built 2-3 already draws them, w2Stages.ts:44). This is GAME-MAP's "10-16 h + 3-5 h" cut to a trail-replay
  follower: no pathing, no physics, so it cannot strand (rule 5) and needs no new bot skill beyond "stand still by the shy one". Bot toy: freeing two and reaching
  the gate counts 2; with follow off, 0.
- **NEW 2 the shy one (S, ~1 h):** a quota item freed by stillness (stillness.ts, 1.5 s within 60 px), also where a hit sends the newest follower. Bot skill `calm`
  on a planted toy (rule 21).
**Different from 2-1 / 2-2 / 2-4 / 2-5:** 2-1 rides, 2-2 keeps moving on pads, 2-3 is the first stage where the reward walks WITH him and the first time stillness helps
someone else; no new move at all, only care. **GAME-MAP kept:** "bring them home", the wait at the flag. **Changed:** "hop behind you" is a path replay that swims, and a hit
(not only a fall) scatters the newest one; Matt's OK for the new mission type is still owed (GAME-MAP 2-3 says so).

---
## 2-4 Over the Water: "Two clocks" (vine_runner; Normal 13.5, Easy at most 8.1)
**One idea:** "Swing out over the river and let go when a log is coming under you; then ride it to the next vine."
A player says: "the one where you drop off the vine onto the logs." Why it's fun: two rhythms the eye can read at once, the vine's swing and the river's logs, and ONE
press when they line up. That press is the whole game, and it feels like skill on the first try (a long slow log is almost always under him). Then the chain: liana,
log, liana from the log, log, a relay down the river with no bank in between. On a phone it is pure one-thumb timing, and sideways the player sees both clocks whole.
**The two clocks, from code:** a World 2 liana's swing is 1-6's, period about 2.85 s (DIFFICULTY.md:20). A log passes a fixed point for logW / speed s: the `long` row,
240 px at 80 px/s, is 3.0 s; the `ride` row 170 / 70 = 2.4 s (w2.ts:79, :83). **Rule for the teach:** logW / speed at or over the swing's period, so EVERY forward
swing has a log under it; past the teach, shorter faster logs (150 / 80 = 1.9 s, `twin`) so some swings miss and he waits for the clocks to line up (the bite).
**These are proposals: fly them on the real engine before laying (rule 24): `reference/specs/sims/swingLog.ts` (the let-go window onto a moving log, by grip and log row).**
**Tributes** (shelf: Block 1 pre-1990, outside the list lesser-known post-2005, Block 2 the one famous):
- **Bionic Commando** (Capcom arcade 1987, NES 1988; pre-1990). a. Loved: EGM, "having to swing instead of jump added unexpected depth to the platform genre"; Nintendo
  Power, "one of its most original action games due to the ability to swing" (https://en.wikipedia.org/wiki/Bionic_Commando_(1988_video_game)). b. Taught by taking the jump
  away: "the player cannot jump. To cross gaps or climb ledges, Ladd must use his bionic arm" (same page). c. Ours: over the river there is no bank to jump to: the swing and
  the release ARE the crossing (Pokey keeps his jump; the river takes the banks away). d. Not copied: the arm, guns, the military setting, the punishing pits.
- **Gibbon: Beyond the Trees** (Broken Rules 2022, Apple Arcade first: a phone game; lesser-known). a. Loved: The Guardian (Keza MacDonald), "short, simple and lovely
  to play" (https://en.wikipedia.org/wiki/Gibbon:_Beyond_the_Trees). b. Hold to swing "building momentum"; "Releasing the button at the right time" launches across the
  gaps (same page). c. Ours: the flow of a chain without a bank, one release per swing, on a phone. d. Not copied: the auto-run, the backflip boost, and what reviewers
  split on: the controls and "repetitive gameplay" (same page): our chain changes every beat (fast, back, knock, the long one).
- **Donkey Kong Country** (Rare 1994; the famous-few slot; 1-6 used it for the rope level, the reason here is NEW: launching onto a target that moves). a. Loved: Total!,
  "addictive, accessible and exciting"; its designer Gregg Mayles: "If you time everything correctly, you can get through the level efficiently and impressively"
  (https://en.wikipedia.org/wiki/Donkey_Kong_Country). b. "blasting out of cannons resembling barrels" (same page); the moving-barrel chains taught one barrel first [S].
  c. Ours: the log is the moving barrel, the liana the cannon; the knock is the timing cue. d. Not copied: barrels, cannons, Kongs, the auto-fire barrels.
**The arc** (graph `A T P R X R W R P M R L S E`; flags and hearts by Matt's rules)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | Riverside trees leaning over the widest river yet; Dot 800 px+ before beat 1 | Walks to the last bank | "No bank over there..." |
| 1 | **First drop, safe** (T) | 16 | One liana over a splash-back river, the `long` log (3.0 s under him, more than a swing) | Swings, lets go when the log is under; lands; the log hands him to the far bank | "I landed on it!" |
| 2 | **Two drops** (P) + flag | 16 | Two lianas, each over a splash-back river, `ride` logs | Lets go onto each | "Swing... drop" |
| 3 | Bank (R) | 8 | Petals, the next river's knock | Listens | "knock... knock" |
| 4 | **Vine from a log** (X, 1-6's catch, new reason: from a moving thing) + heart | 18 | A log carries him under a low liana | Jumps from the log and grabs (the jump keeps the log's speed, engine.ts:842) | "Grab it!" |
| 5 | Bank (R) | 8 | | | |
| 6 | **TWIST: let go on the knock** (W) + flag | 18 | Deep water; the log is still under the far bank when he must let go | Lets go on the knock, trusting the log to slide out under him (two tells: the knock and its nose) | "Trust it..." |
| 7 | **Against the flow** (P) | 14 | A `back` river: the log comes toward him | Drops on early; it carries him back under a liana | "Other way!" |
| 8 | **The relay** (M) + flag, heart after | 22 | Liana, log, liana, log, deep, `twin` logs (1.9 s: some swings miss) | Waits a swing when the clocks don't line up | "Not yet... NOW" |
| 9 | **All of it** (L) | 18 | Fast logs, back logs, the knock drop, no bank between | | "Almost..." |
| 10 | **The big swing** (S, signature) | 12 | The tallest riverside tree, the longest liana, the long log far below; the camera pulls out | Lets go at the top; a long fall onto the long log; rides it into the village landing | "WHEEE" |
| 11 | Exit (E) | 6 | | | |
**Node sketch:** `A Tsw1<:#soft Psw2<:#soft R Xws1< R Wsw1<:#water Pws1>:#water R Msw3>:#water R Lsw2>:#water Ssw1< E` (`sw` = a liana whose landing is a river: the
new section; V11's cap is met by splitting s and w across beats; the builder counts it).
**Phone, both ways:** upright shows about 425 px; the liana's reach plus the log's arrival point fit in it only if the log's tell (its nose under the bank and the knock) is
inside the 270 px ahead (level.md, World 1 notes): the lay checks it. Sideways: both clocks whole. Clip of beats 1, 6 and 10 (the release frames named, D63).
**Engine** (2 NEW):
- WIRED: lianas (w2Liana), rivers and their rows, landing on a drifting log from any fall (DRIFT_CATCH), the carry rule (jumping off a log keeps its speed), the knock.
- **NEW 1 a liana over a river (M, 2-4 h):** gen2 places a liana whose landing is a river window (today place 'land' always lays a bank, w2.ts:123): pipeline.ts place
  kind 'river' + riverLay.ts, with its fairness check: in every N swings at least one release lands on a log with a window of at least X frames on Normal (X and N from
  swingLog.ts; levelCheck heldLandings flies the bank case today, DIFFICULTY.md:19), and the meter's liana-release row read against a moving landing.
- **NEW 2 bot skills (S-M, 1-2 h):** `drop-on-log` (release when a log will be under the landing) and `vine-from-log` (catch a liana from a moving log), each on a planted
  toy that goes red with the skill removed (rule 21).
**Different:** 2-1 boards logs from the bank on foot; 2-4 boards them from the AIR and leaves them for vines: the first stage with no bank between crossings. Unlike 2-5 it
has no hazard but the water. **GAME-MAP kept:** "let go of the vine onto a log that is moving". **Added:** the vine caught from a log, the knock drop, the big swing.

---
## 2-5 River Snappers: "One, two, three, HOP" (purge; Normal 16.0, Easy at most 9.6)
**One idea:** "The snappers' stones bite on the fourth beat: cross on one-two-three, and kick the snappers off their river."
A player says: "the one where the stones snap on four." Why it's fun: a count a child can say out loud ("one, two, three, SNAP"), heard and seen (the jaws part on three),
and the snappers to chase off are the old shell-kick the game already has. Nobody is hurt: a kicked snapper slides off into the river and paddles away ("chasedOff",
predators/world2.ts:14). The 12+ bite: the stones snap in a WAVE, each one beat after the last, so he hops just behind the snap.
**The beat (proposed, fly before laying, rule 24):** one snap stone = a beatBrick 'bites' on a clock of 4 counts at 0.6 s: quiet 1.2 s (counts one, two), jaws parting 0.6 s
(three: the tell, beat.ts beatDef `tell`), shut 0.6 s (four: it holds him but hurts: brickNow `hurts`, beatBrick.ts:31). Stones a tap hop apart: a tap hop is 0.30 s and
83 px (2-2.md, flown by hopAir.ts), so three stones cross inside counts one to three. Easy: every brick on the clock x1.5 (beatBrick.ts:4). The wave: the same clock with
each stone's `shift` one count later (BeatBrick.shift, data).
**Tributes** (shelf: Block 1 pre-1990 (Matt's #1), Block 4-era lesser-known post-2005; a cautionary Block 1 classic; no famous few needed):
- **Pitfall!** (Activision 1982; Matt's #1; 1-6 used it for the vine, the reason here is NEW: the crocodile heads). a. Loved: Blip (1983), "It's also a heck of a lot of
  fun"; Arcade Express, it "may well be the best adventure game yet produced for the VCS" (https://en.wikipedia.org/wiki/Pitfall!). b. Harry crosses "ponds infested with
  crocodiles if their jaws were closed"; David Crane found the first version "almost impossible to play" and changed it until it went "from nearly impossible to an easily
  learned skill" (same page). That is the bar for our first stone. c. Ours: the first stone row is over shallow splash-back water and the jaws snap slowly; the snap is a
  shut stone, never a creature eating him. d. Not copied: crocodiles, tar pits, the 20-minute clock, the instant death.
- **Crypt of the NecroDancer** (Brace Yourself Games 2015; lesser-known; on iOS too). a. Loved: Gaming Age, "a wildly imaginative take on the formula"; its maker Ryan
  Clark: "If you die, you still know it was your fault" (https://en.wikipedia.org/wiki/Crypt_of_the_NecroDancer). b. Each monster has a pattern you learn: "skeletons
  target the player directly, but only move and attack on every other beat" (same page): one creature, one count. c. Ours: one stone, one count, always the same 4; the
  turn is the wave, not a new count. d. Not copied: moving only on the beat (Pokey moves freely), the roguelike, its music.
- **Mega Man** (Capcom 1987; the cautionary one). What players HATED is the lesson: its disappearing blocks are "a series of disappearing blocks you have to memorize", a
  puzzle that "plagued" players (GamesRadar retrospective, https://www.gamesradar.com/the-ultimate-mega-man-retrospective/ [S], search snippet). Ours: no stone ever bites
  without its tell (beat.ts: every 'on' comes out of a 'warn'), and the count never changes inside a stage.
**The arc** (graph `A T P R X R W R P M R L S E`; flags and hearts by Matt's rules)
| # | Beat | s | What is there | He does | He feels |
|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | The snappers' stretch of river; a snap echoes; Dot 800 px+ before beat 1 | Walks in | "What was that?" |
| 1 | **One stone, safe** (T) | 14 | One snap stone over shallow splash-back water, a bank each side | Watches it snap, counts, crosses on one | "One, two, three, SNAP" |
| 2 | **Three in step** (P) + flag | 16 | Three stones all on the same count | Crosses all three on one-two-three | "Go go go, stop" |
| 3 | **The first snapper** (T2: kick, the turtle's `first`) | 14 | A snapper asleep on the bank (first enemy asleep, rule 7); Dot's "Kick the shell!" | Kicks; it slides off and paddles away | "Off you go!" |
| 4 | Bank (R) + heart | 8 | | | |
| 5 | **The log trap** (X: 1-3's drop trap, new reason) | 16 | A snapper under a leaning log on a bank stump | Drops the log; it pops into its shell and slides into the river | "Bonk" |
| 6 | **TWIST: the wave** (W) + flag | 18 | Five stones, each snapping one count after the one before, deep water | Hops just behind the snap, never stops | "Ride the wave!" |
| 7 | **Snappers on the stones** (P) | 16 | A snapper patrolling a bank between stone rows | Kicks it, then crosses on the count | "Two things at once" |
| 8 | **All of it** (M) + heart after | 22 | Wave stones, in-step stones, two snappers, a trap | Chooses the order | "My way" |
| 9 | **The gauntlet** (L) + flag before | 18 | Deep water, the wave both ways (one row back toward him) | | "Almost..." |
| 10 | **The snappers' rock** (S, signature) | 12 | The big snapper on a mid-river rock, its stone ring snapping round it | Crosses the ring on the count, kicks the big one off; the whole river stops snapping | "Quiet. Finally." |
| 11 | Exit (E) | 6 | | | |
**Node sketch:** `A Tp1<:#soft Pp3<:#soft T2g1<&turtle R Xx1<&turtle Wp5>:#water R Pg1<&turtle Mp4>:#water&turtle&turtle R Lp5>:#water Sp1<&turtle E` (`p` beat pieces,
nodeLetters.ts `p`; `x` trap; `&` an animal, V16).
**Goal:** purge with a count: today's hand-built 2-5 asks 14 (w2Stages.ts:42); a designed stage should ask about 6 (every snapper laid on the path, plus one). The lead's call.
**Phone, both ways:** a stone row is 3-5 stones a tap hop apart (about 83 px plus stone width): a row of 3 fits upright with the bank; the wave of 5 needs about 600 px, so
upright he sees the first 3 and the wave's direction from the first two snaps. Sideways all five. The tell is drawn AND heard (the jaws grind on three). Clip of beats 1 and 6.
**Engine** (2 NEW):
- WIRED: beat clocks and rideLay's beat rows (`by: 'beat'`), the turtle's AI and kick-the-shell, drop-trap rules, deep and splash-back water, hearts and flags.
- **NEW 1 snap stones (S-M, 1-3 h):** padPiece plays 'bites' (today it hardcodes 'gone', padPiece.ts:58, :104): solid always, hurts while 'on', through the runtime-piece
  hurt path (engine.ts:2996, :4746); a rideLay row `on: 'bites'` with per-stone `shift`; the fairness check (a stone row is crossable inside its quiet counts with a tap hop,
  flown). Art: a stone in open and shut states (GAME-MAP's missing list): one Hugging Face job, the lead's call; World 2 inventory row, scaled to 89.1 px.
- **NEW 2 World 2's cast rows (S, ~1 h, data):** gen2/worlds/w2Cast.ts like w1Cast.ts: the turtle row, trap posts, and a `trap` ending added to TURTLE.beatenBy
  (predators/world2.ts:14: it has none today, so 1-3's trap cannot beat a snapper until it does). Bot skills `on-the-count` and `kick-the-shell` on planted toys.
**Different:** the first World 2 stage with a creature and the first hazard that hurts while he stands on it (2-2's pads only sink). 2-4 is about the vine's clock, 2-5 about a
COUNT. **GAME-MAP kept:** snap-jaw stones on three-and-one, the drop trap on a snapper. **Changed:** the wave (shifts) as the twist; the goal count down from 14.

---
## Across the three
| | 2-3 | 2-4 | 2-5 |
|---|---|---|---|
| Thumb | punch, hop, stand still | one release per swing | hop on a count, kick |
| New feeling | care (the line behind him) | two clocks lining up | a rhythm said out loud |
| Normal / Easy (target, DIFFICULTY.md:63 slot formula 10(w-1)+T[s], T[2..4] = 4.5, 3.5, 6) | 14.5 / <= 8.7 | 13.5 / <= 8.1 | 16.0 / <= 9.6 |
| NEW engine | follow.ts (M), the shy one (S) | liana-over-river lay (M), bots (S-M) | snap stones (S-M), W2 cast rows (S) |
2-1 and 2-2 sat 0.5 under their slot formula (9.0, 12.5 PROPOSED, PICKS-19-22.md); if the lead keeps that shift: 14.0, 13.0, 15.5. Order to build the engine: 2-5's two
pieces are the smallest (data and one piece mode), 2-4's lay next, 2-3's followers last and longest; none waits on another.

## Pushback
1. **2-3 cannot build in under 2 hours on today's engine.** GAME-MAP sized followers at 10-16 h + 3-5 h; I cut them to a trail-replay follower (M, 3-4 h) that cannot strand,
   but it must be built, drawn and proven on a real stage row by an engine member BEFORE the builder (rule 23). If the lead wants 2-3 next, start follow.ts now.
2. **Snap-jaw stones are not "exists": 'bites' is a type with no player** (padPiece.ts:58, :104 hardcode 'gone'), and the stone art (open / shut) is missing. **The snapper
   cannot be trapped** (no `trap` in TURTLE.beatenBy, predators/world2.ts:14). Both are small, but they are NEW, not wired.
3. **2-4's timing numbers are proposals until flown** (rule 24): a liana's let-go onto a MOVING landing has never been flown (levelCheck heldLandings flies banks).
4. **Matt's OK for "bring them home"** is still owed (GAME-MAP 2-3 says "new mission, needs Matt's OK"); the lead asks before 2-3 is built.

## Learned
- Check the follower and snap-stone claims in code before pitching: the 11-14 list called them "missing or exist-unwired"; on main one is missing and one is a type
  with no player. A pitch that says "exists" for a type with no player would cost a builder a box.
- Sizing a big engine piece down is a design job: a follower that replays the hero's own path needs no pathfinding and can't strand. Say what was cut.
- Research sites that answered from this session: en.wikipedia.org (all), gamesradar.com (the Abe review URL 404s); hardcoregaming101's Oddworld URL 404s.
