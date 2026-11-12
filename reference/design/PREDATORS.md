# Predators: one personality each, and two or three ways to beat every one (EN-P, 2026-11-11)

Matt, 11-11 9:14-9:16 PM ET: "give them unique personalities, so each predator plays differently"; "maximize how to fight predators, so
you just don't have to stomp on them"; "predators are huge in this game, let the best engine build it."

Sources read: `reference/plans/WORLD-MAP.html` and `MAP-REVISIONS.md` §1, §6, §8 (origin/ccr-702d3c49-i33jeq), ROADMAP R-159.1 and
R-159.2, and the code named in §1. Base: origin/t-engine-clock @fd94c3f (clock.ts, stillness.ts, heroNoise.ts, beatBrick.ts, ride.ts).
The kit that carries this out: `src/game/predators/` (pure, tested, not wired into any shipped stage).

## 0. The three rules every predator keeps

1. **One habit, one tell.** A player learns an animal the way he learns a Koopa or a Boo: by what it always does. An animal has the same
   habit in every world it appears in, and no two animals in one world share a habit (§2's table is checked by a test).
2. **The tell always comes first.** Nothing can hurt before its tell has run its full length (never under 0.5 s, R-159.1's "0.5 s
   warning"; longer on Easy). The kit has one door into the phase that hurts, and it only opens from a finished tell.
3. **Never only the stomp, and never cruel.** Every animal has two or three ways to beat it, and every way ends with it stunned,
   giving up and going home, or chased off. Nothing is eaten, carried off or killed on screen (story keeper, MAP-REVISIONS §8).

## 1. The roster today (what the code does now)

Shared today: every ground animal runs `roam` (enemyBrain.ts:208) then its attack in `stepPredator` (predatorAI.ts:110); the engine
steps them at engine.ts:2745-2792. Every kind can be punched and kicked (fight.ts:81-118 MOVES, :291 resolveMelee); the stomp works by
kind (fight.ts:217-231 TRAITS). **There is no combat triangle in code yet** (R-159.1): a kick differs from a punch only on the turtle
(predatorAI.ts:74 turtleGuard). Easy today: fewer of each kind (easyMode.ts:200 easyKeep) and attack cooldown x1.5 (easyMode.ts:465);
speeds and tells are the same on Easy. Three tells today are under the 0.5 s floor: snake 0.38 s, ocelot 0.38 s, tayra 0.42 s.

| Animal (name in the game) | Worlds and stages today | What it does today (file:line) |
|---|---|---|
| Golden Tree Snake `snake` | W1: 1-3 (asleep ones), 1-9 waves; W2 | Shy: backs away at 30 px/s, strikes within 105 px; rear 0.38 s, strike 0.18 s, open 0.55 s (enemyBrain.ts:53, predatorAI.ts:141-191). Stomp, punch or kick, 1 hit |
| Boa Constrictor `boa` | W1: 1-9; W7, W8 (one asleep in 8-1) | Never walks; rears 0.6 s, strike reaches 128 px, open 0.8 s (enemyBrain.ts:65, predatorAI.ts:281-327). 3 hits, armoured while it strikes |
| Harpy Eagle (the watch) | W1: 1-7; W3 grotto eyes; W4: 4-5; W8: 8-1 bats | Not an enemy: a rhythm. Calm, screech 2.0 s, shadow sweeps 2.6 s, sees within 70 px unless he is in a bush, dive 0.75 s later (watcher.ts:45, :88, :171). Cannot be fought |
| Harpy Eagle `eagle` (the swooper) | old generator only (stageGenerator.ts:649) | Patrols the air, telegraphs 0.8 s, homing dive (engine.ts:2656-2744, harpyDive.ts) |
| Snapping Turtle `turtle` | W2: 2-5 | Walks to a noise (engine.ts:2749); snap 0.5 s tell, reach 46; shell for 1.8 s from the front; a kick slides the shell (predatorAI.ts:65, :74, :331-406) |
| River King's guard (royal turtle) | W2: 2-9 | The turtle with a spear: tell 0.62 s, reach 78, blocks 1.1 s (predatorAI.ts:67) |
| Spectacled Caiman `caiman` | W6 | Creeps at 42 px/s, lunge 0.55 s tell, open 0.95 s (enemyBrain.ts:69, predatorAI.ts:408-453). A stomp only bounces (fight.ts:223) |
| Ocelot `ocelot` (the prowler) | W3; W6, W7, W8; the General's fight | Stalker: chases at 95 px/s, x0.3 while he faces it; windup 0.38 s, leap 90-170 px (enemyBrain.ts:57, predatorAI.ts:196-235) |
| Jaguar `jaguar` | W3; W6, W7, W8 | Spots him at 340 px, windup 0.65 s, long leap, lands with a shake, open 0.95 s (enemyBrain.ts:61, predatorAI.ts:238-277) |
| Tayra `tayra` | W6, W7, W8 | Stands up 0.42 s, dashes 235 px/s for 0.55 s, skids 0.6 s; gives up after 6 s (enemyBrain.ts:73, predatorAI.ts:456-493) |
| Night Harpy `harpy` | W6, W7, W8 (8-8, 8-9) | Crouch 0.6 s, slide, hop and a ground shock to jump, dizzy 1.0 s (predatorAI.ts:59, :496-560) |
| Poison Dart Frog `frog` | W6, W7 | Sits still; touching it costs a heart (engine.ts:2808-2813). No tell |
| Jumping Spider `spider` | W5 | Bursts of 0.45 s with 0.32 s pauses (enemyBrain.ts:88, predatorAI.ts:570-614); W5 crouch tell 0.7 s (w5Kit.ts:384) |
| Stone sentry (an ocelot with `look: 'sentry'`) | W7 | An ocelot in stone art, 3-4 hits (gen2/worlds/w7.ts:92-110) |
| Capuchins: thief, lookout, guard | W4: 4-3, 4-5, 4-8, 4-9 | Never hurt him. Thief snatches a petal; lookout stares 0.9 s then calls the eagle; guard blocks until a gust knocks it down (capuchin.ts:159, :216) |

Not creatures today: owls, mimic bushes, the Drake's gaze and soldiers (planned on the map); `ant_hazard` is in the type list with no
placement; the dangler and the mantis have art and no stage (w5Creatures.ts:6).

## 2. One personality each

Habit = the one thing it always does. Tell = what the player sees and hears before it can hurt. No two animals in a world share a habit.

| Animal | Habit | Personality in one line | Tell (seen, heard) | Rhythm |
|---|---|---|---|---|
| Golden Tree Snake | **patrol** (shy) | Gives ground. It backs off along its branch and only strikes when it has no branch left or you crowd it | rears and sways; hiss | back off, rear 0.5 s, strike, open 0.55 s |
| Boa Constrictor | **ambush** | Strikes at movement. It lies along its bough and watches; a still sloth is a branch to it | head draws back, tongue flicks; a low rattle of leaves | rear 0.6 s, very long strike, head out 0.8 s |
| Harpy Eagle | **sweep** | The shadow. It crosses its stretch on a beat and takes only what it sees move, or sees in the open | screech, then the shadow at the edge | calm, warn 2.0 s, sweep 2.6 s |
| Snapping Turtle | **seek** | Nosy. It walks to any noise to look, and it is all shell from the front | neck pulls back; a click | walk to the noise, look 4.5 s, snap 0.5 s tell |
| River King's guard | **guard** | Holds its spot on the raft and blocks with the spear; only strikes what comes within reach | spear lifts; a bark | block, lift 0.62 s, jab |
| Spectacled Caiman | **sweep** (in water) | The ripple. It swims its stretch of water and snaps at what moves above it; asleep on the bank it is a log (2-6) | ripples gather, eyes surface | swim, eyes 0.6 s, snap, jaws shut 0.95 s |
| Ocelot | **stalk** | Creeps while your back is turned, slows to a crawl when you face it, loses you when you are still | crouch, tail twitch; a soft chirr | creep, crouch 0.5 s, pounce, open 0.4 s |
| Jaguar | **drop** | Waits above on a shelf or bough and comes down where you were when it growled | eyes shine, pebbles fall; growl | growl 0.65 s, drop with a shake, winded 0.95 s, climbs back |
| Tayra | **charge** | Runs its line to the end, every time. It cannot stop or turn until it skids | stands up tall; chitter | stand 0.5 s, dash, skid 0.6 s |
| Night Harpy | **seek** (by sound) | Hunts by ear in the dark and hates light. It goes to the last thing it heard | head tilts, a hoot; crouch | listen, go, crouch 0.6 s, slide and shock, dizzy 1.0 s |
| Poison Dart Frog | **patrol** (on the clock) | Hop, hop, rest. It puffs bright before the hop that stings | throat flashes on the beat's warn | the stage clock: off, warn, on |
| Jumping Spider | **seek** (by touch) | Feels the silk. A touched thread is a noise to it; it comes in bursts with pauses | crouch 0.7 s, legs draw in | burst 0.45 s, pause 0.32 s |
| Stone sentry | **guard** | A statue in the doorway. Cannot be hit; it strikes only what comes within reach | eyes glow, stone grinds | glow 0.7 s, slam, slow reset |
| Mimic bush (W8, new) | **guard** | A bush that blinks. It never moves from its spot | blinks twice, rustles | blink 0.8 s, snap, open 1.0 s |
| Capuchin thief / lookout / guard | **stalk** / **ambush** / **guard** | Thief sneaks a petal; lookout stares, then calls the eagle; guard paces a ledge | as built (capuchin.ts) | as built |
| Sleeping bats (8-1) | **sweep** | The roost stirs on a beat; they push him back, no heart lost | a ripple through the roost | as the eagle |
| The Drake's gaze (9-4) | **sweep** (remembers) | The first time it loses you when you are still; once it has seen you, only shade hides you | the glow turns before the beam | the stage clock |
| Soldier (W10) | **guard** | The General's wall guard | spear lifts | as the River King's guard |

**Who is in which world** (one habit each, test `roster.test.ts`): W1 snake (patrol), boa (ambush), eagle (sweep). W2 turtle (seek),
guard (guard), sleeping caiman (sweep), snake (patrol). W3 ocelot (stalk), jaguar (drop), grotto eyes (sweep). W4 eagle (sweep), thief
(stalk), lookout (ambush), guard capuchin (guard). W5 spider (seek); the dangler (drop) and mantis (ambush) when their art gets a stage.
W6 caiman (sweep), tayra (charge), ocelot (stalk), jaguar (drop), night harpy (seek), frog (patrol). W7 sentry (guard), ocelot, jaguar,
tayra, night harpy, frog, boa (ambush). W8 night harpy, ocelot, jaguar, tayra, boa, mimic bush (guard), bats (sweep). W9 the gaze
(sweep), tayra, jaguar, night harpy. W10 soldier (guard), ocelot, and one of each earlier habit in 10-7 and 10-9.
The old swooping `eagle` enemy folds into the Harpy Eagle: the sweep's act IS the dive.

## 3. Ways to beat each (never only the stomp)

Ends: **stunned** (dazed for the seconds, then carries on), **gives up** (loses him and goes home for the seconds), **chased off**
(leaves for the rest of the stage). "open" = only while it is recovering, stunned or asleep. **Bold** = the way its world teaches first.

| Animal | Way 1 | Way 2 | Way 3 | More |
|---|---|---|---|---|
| Golden Tree Snake | **punch** (1-3): stunned 2 s | drop trap (shake its vine, drop the hive): chased off | stomp: gives up 5 s (he vaults it; it slinks to its end) | kick: chased off |
| Boa Constrictor | **drop trap** (1-9): chased off | lure: lead the eagle's shadow over it, it is chased off (it fears the eagle) | go still: it loses him, gives up 4 s | punch while its head is out (open): stunned 2.5 s |
| Harpy Eagle | **go still in a bush** (1-7): after 2 empty passes it gives up 8 s | lure: a noise pulls its shadow away 4.5 s | W4: under a waterfall counts as cover | cannot be hit |
| Snapping Turtle | **kick** (2-5): the shell slides away, chased off, and bowls over what it meets | stomp: stunned 1.8 s (in its shell) | lure: a noise turns it away 4.5 s, its back is open | punch from behind (open): stunned |
| River King's guard | **kick** breaks the block: stunned 2 s | lure: the bell, it goes to look 4.5 s | stomp: stunned 1.1 s | |
| Spectacled Caiman | **go still** (6-2): the ripple passes, gives up 5 s | punch while its jaws are shut (open): stunned 2.5 s | sap bubble (trap): stunned 4 s | W2: quiet feet, it never wakes |
| Ocelot | **go still** (3-2): it loses him, gives up 5 s | lure it under the loose stalactite (trap, 3-3): chased off | the drum (3-5): stunned 3 s | face it (it crawls); punch: stunned 1.5 s; W8 light: gives up |
| Jaguar | **lure it under the stalactite** (trap, 3-3): chased off | the drum: stunned 3 s | punch while it is winded (open): stunned 2 s | W6 lure to the caiman's water, W9 the geyser: chased off; W8 light: gives up |
| Tayra | **lure its charge** to the caiman's water (6-5): chased off (it fears the caiman) | stomp over the dash: stunned 2 s | kick: stunned 2 s and bowled back | W9: its line ends on a geyser: chased off |
| Night Harpy | **light** (8-8, the owl's light, the jar): gives up 6 s | lure: a noise brings it under the owl, chased off | go still: no sound, it loses him 5 s | the drum: stunned 3 s; punch while dizzy (open) |
| Poison Dart Frog | **stomp** between hops: gives up 6 s | kick: chased off (it bounces away) | go still: it settles, gives up 4 s | |
| Jumping Spider | **stomp in the pause**: gives up 5 s | punch in the pause (open): stunned 2 s | lure: pluck a far thread, it goes there 4.5 s | stillness does NOT hide him here (it feels the silk) |
| Stone sentry | **break** the cracked pillar onto it (7-2): chased off (its eyes go dark, it steps back into its niche) | push a block into it (7-8): stunned 6 s | lure: a noise turns it 4.5 s | cannot be punched or stomped |
| Mimic bush | **light** shows it: gives up 6 s | punch after it snaps (open): stunned 3 s | | |
| Capuchins | thief: punch, it drops the petal and flees; lookout: fruit lures it 6 s, or cover; guard: **wind** blows it off 1.8 s or down 5 s (4-9) | | | never hurt him |
| Drake's gaze | **go still** (first sight only), then shade | cover | | a world rule, not a body |
| Soldier | break, lure, push, the moat (10-7: every world's trick) | | | |

The triangle (R-159.1) inside this: the **stomp** vaults (gives up or a short stun, never the strongest), the **punch** stuns but mostly
needs the open moment after a miss, the **kick** bowls an animal away and breaks a block. The world tools are the strong answers.

## 4. Easy softens, Normal bites

| | Normal | Easy | In the kit |
|---|---|---|---|
| The tell | as §2 | x1.3 (the bosses' rule, engine.ts:3494) | `easy.tell` (never under 1) |
| The beat between attacks | as §2 | x1.5 (easyMode.ts:465) | `easy.cool` (never under 1) |
| Speed (walk, hunt, dash, sweep) | as §2 | x0.85 | `easy.speed` (never over 1) |
| How many | every post | the first of each kind and every other one after (easyMode.ts:200) | `Post.normalOnly`, `postsFor` |
| Clocked kinds (frog, the gaze) | the stage clock | the clock's own `easyStretch` (clock.ts: Easy never faster) | `onBeat` |
| Stillness | calm in 0.5 s | calm in 0.35 s (stillness.ts) | read from stillness.ts |
| Sleepers | 1-3's first snake asleep on both | more sleepers | `Post.asleep` |

`checkPredator` refuses a kind whose Easy is harder than its Normal in any number, as `checkClock` does for clocks.

## 5. The behaviour kit: the smallest set that covers every personality

Shared by every kind (built once, `src/game/predators/core.ts`):
- **The tell gate**: rest, hunt, TELL, act, recover. One door into 'act'; a fuzz test proves no frame hurts without a full tell before it.
- **Sight with stillness**: a box ahead and behind, read through stillness.ts `watcherSees` (movement is seen; still in cover is unseen;
  `seesStill` kinds see a still sloth in the open).
- **Hearing**: a predator is a heroNoise `Listener`: a noise wakes a sleeper, the drum stuns the awake, a kind with `hears` goes to look.
- **Being beaten, as data**: `beatenBy` maps each way to stunned / gives up (flees) / chased off, with "open" windows.
- **The food chain**: `fears` names the kinds it runs from; one of those awake and near chases it off. Nobody is caught.
- **Easy**: three multipliers and `normalOnly` posts.

The habits, by how many animal-in-a-world uses each has (§2):

| # | Habit | Uses | Parameters | Who |
|---|---|---|---|---|
| 1 | sweep | 7 | the stretch, eye speed, `onBeat`, `callsOff`, `giveUp` in passes, `seesStill` | eagle (W1, W4), caiman (W2, W6), grotto eyes, bats, the gaze |
| 2 | stalk | 6 | hunt speed, `watched` (speed while he faces it), `engage`, `giveUp` | ocelot (W3, 6, 7, 8, 10), thief |
| 3 | seek | 6 | `hears` (seconds it looks), hunt speed, asleep or pacing | turtle, spider, night harpy (W6-9) |
| 4 | guard | 5 | `blocks`, reach, no stomp or punch in `beatenBy` | River King's guard, guard capuchin, sentry, mimic bush, soldier |
| 5 | drop | 5 | the column under it, `act.aim: 'below'`, climb-back speed | jaguar (W3, 6, 7, 8, 9); the dangler later |
| 6 | ambush | 4 | sight both ways, long `act.reach`, long `recover` | boa (W1, 7, 8), lookout |
| 7 | charge | 4 | long `engage`, `act.speed`, runs to the end of its ground | tayra (W6-9) |
| 8 | patrol | 4 | its beat, `shy`, `onBeat` | snake (W1, W2), frog (W6, W7) |

Build order tonight is World 1's three first (patrol, sweep, ambush: World 1 is laid first), then the rest in the order above. The
existing modules stay the source of today's shipped play (watcher.ts, predatorAI.ts, capuchin.ts); the kit replaces them one animal at
a time when its world is laid (new replaces old, no switches), each with its own QA.

## 6. What this needs from other lanes

- **Art** (a Hugging Face list for Matt, not in this task): a tell pose per animal where today's is a red ring ("!"): snake rear exists;
  boa head-back, ocelot crouch, tayra stand-up exist as states; new: caiman ripples and eyes, jaguar on a shelf, frog flash, mimic blink,
  and a "gives up / slinks home" and a "dazed" pose for each. No animal needs a hurt or defeated-for-good pose.
- **Words**: none here. Journal lines change when a personality ships (the story keeper writes them).
- **Planned pieces this leans on**: drop traps (B2), food chain and lures (B19), breaking and pushing (B18). The kit takes each as a
  call to `beat(def, s, way, t)`; it does not build them.
