# Predators: one personality each, and two or three ways to beat every one (EN-P, 2026-11-11)

Matt, 11-11 9:14-9:16 PM ET: "give them unique personalities, so each predator plays differently"; "maximize how to fight predators, so
you just don't have to stomp on them"; "predators are huge in this game, let the best engine build it."

Scope (the lead, 9:19 and 9:23 PM ET, from Matt): EVERY creature that can hurt, block or chase Pokey, each started from what the real
animal does and given a twist that fits its world ("I would love to see from a creative standpoint how Fable handles it"), plus the
creatures we own art for and do not use (§7). The story keeper reviewed this sheet at 9:36 PM ET: PASS on story with four changes, all applied here (the mimic is a blinking log,
never a bush; nobody eats in the sanctuary; the owl is a presence that never guides; piranhas nip and scatter). Matt, 9:42 PM ET, via
the lead: a unique cast per world is approved as §2's table. The story keeper's background (9:19 PM ET) is folded in: ordinary creatures are not evil
and wear no collar: they are hungry, sleepy, nosy, or guarding a nest, and most cannot believe a sloth is what came.

Sources read: `reference/plans/WORLD-MAP.html` and `MAP-REVISIONS.md` §1, §6, §8 (origin/ccr-702d3c49-i33jeq), ROADMAP R-159.1 and
R-159.2, and the code named in §1. Base: origin/t-engine-clock @fd94c3f (clock.ts, stillness.ts, heroNoise.ts, beatBrick.ts, ride.ts).
The kit that carries this out: `src/game/predators/` (pure, tested, not wired into any shipped stage).

## 0. The four rules every creature keeps

1. **One habit, one tell.** A player learns an animal the way he learns a Koopa or a Boo: by what it always does. An animal has the same
   habit in every world it appears in, and no two animals in one world's cast share a habit (§2's casts, held by a test).
2. **The tell always comes first.** Nothing can hurt before its tell has run its full length (never under 0.5 s, R-159.1's "0.5 s
   warning"; longer on Easy). The kit has one door into the phase that hurts, and it only opens from a finished tell.
3. **Never only the stomp, and never cruel.** Every animal has two or three ways to beat it, and every way ends with it stunned,
   giving up and going home, dozing off, or chased off (blown away, tossed, knocked off its branch to stomp off grumpy). Nothing is
   eaten, carried off, burned or killed on screen, and there are no remains anywhere (story keeper, MAP-REVISIONS §8).
4. **Danger looks like danger.** Nothing bites without its tell, and nothing hides as scenery without a blink first.

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

| Thorn vines (sleepers with an eye) | W3: 3-5, 3-8 | Asleep, stir 1.1 s, look 1.7 s; lash 0.3 s after he moves within 105 px while it looks; the stage's first lash only knocks back (thornVine.ts; engine.ts:7995-8060) |
| Fruit bats (the roost) | W8: 8-1 bat run, 8-2 roost | The eagle's rhythm (watcher.ts:45). 8-1: caught = put back at the bough's start, no heart (engine.ts:7768); 8-2: a heart |
| Eaglets | W4: 4-6 nests | A head pops up 1.2 s; moving near the nest while they look blows him back 520 px/s for 0.45 s; never a heart (eaglet.ts:25-35) |
| Moths | W8: 8-4 Lantern Run | Drawn to the jar from 380 px at 85 px/s; each touch takes 0.3 of the light; a punch scatters them (lantern.ts, w8LanternRun.ts:142) |
| Seamstress | W5: 5-4 | He lingers 0.5 s, she looks up 0.8 s, her lace slows him; the full wrap costs a heart (w5Play.ts:381) |
| Butler | W5: 5-2 | Walks a tray of cake; walk into it and he eats and gets sleepy, no heart (w5Play.ts:401 `touchesCake`). **Against canon** (he never eats in the sanctuary): flagged for World 5's re-lay, see §2 |
| Poison Dart Frog (again) | W6, W7 | The one creature with no tell today |

Not creatures (the clock's pieces, outside this sheet): spore mushrooms, teapots, closing orchids, humming threads, web patches.
Not in play at all: `ant_hazard` (a type with no spawner), wasps, bees, fish outside the 2-10 guardian flood, owls (owl.ts is a plant).
Not creatures today: owls, the blinking log, the Drake's gaze and soldiers (planned on the map). Art we own with no stage: §7.

## 2. One personality each: the real animal, then our twist

Habit = the one thing it always does (§5). Tell = what the player sees and hears before it can hurt. An animal keeps its habit in every
world. Times are Normal's. *Italics* = a number that changes from today's code.

| Animal | Habit | The real animal | Our twist: the personality | Tell (seen; heard) and rhythm |
|---|---|---|---|---|
| Golden Tree Snake | **patrol** (shy) | The "flying snake": it flattens its body and glides from tree to tree | It gives ground. It backs along its branch and strikes only when it runs out of branch or you crowd it. Beaten, it flattens and GLIDES off to a lower tree: nobody is hurt | rears and sways; hiss. Back off, rear *0.5 s* (today 0.38), strike, open 0.55 s |
| Boa Constrictor | **ambush** | Senses warmth and movement; a sloth's body runs cool | It strikes at MOVEMENT. To a boa a still sloth is a cool, mossy branch. Red light, green light at arm's length | head draws back, tongue flicks; leaves rattle. Rear *0.8 s* (today 0.6: room to go still), very long strike, head out 0.8 s |
| Harpy Eagle | **sweep** | The real hunter of sloths: it sits high and watches for movement in the canopy | The shadow. "I am never on the ground." It crosses its stretch and takes only what it sees | screech, the shadow waits at the edge 2.0 s, crosses 2.6 s; seen, it dives 0.75 s later |
| Snapping Turtle | **seek** | Sits still with its mouth open and wiggles its tongue as bait; all shell | Nosy and grumpy. It goes to look at any noise, and from the front it is a shell | neck pulls back; a click. Walk to the noise, look 4.5 s; snap tell 0.5 s |
| River King's guard | **guard** | (the turtle, in the King's livery) | Holds its raft and blocks with the spear. Proud; it will not leave its post for anything but the bell | spear lifts; a bark. Lift 0.62 s, jab |
| Spectacled Caiman | **sweep** (in water) | Floats like a log; feels ripples through its jaw; its eyes shine at night | The ripple. Asleep it IS a log (2-6: cross its back on quiet feet). Awake it swims its stretch and snaps at whatever stirs the water | ripples gather, two eyes rise 0.6 s; snap; jaws shut 0.95 s |
| Ocelot (the prowler) | **stalk** | A night stalker that freezes when its prey looks round | Boo in the dark. It creeps while your back is turned, crawls when you face it, loses you when you are still, and comes to noise | crouch, tail twitch; a soft chirr. Crouch *0.5 s*, pounce, open 0.4 s |
| Jaguar | **drop** | Ambushes from above: it drops from a bough onto what passes | It waits on a shelf and comes down where you WERE when it growled, then has to climb all the way back, grumbling | eyes shine, pebbles fall; growl 0.65 s. Drop with a shake, winded 0.95 s |
| Tayra | **charge** | A tireless runner; it stashes green fruit to ripen and guards the stash | It runs its line to the very end, every time, and cannot turn until it skids. You choose where its line ends | stands up tall; chitter *0.5 s*. Dash 235 px/s, skid 0.6 s |
| Night Harpy | **seek** (by ear) | (ours) built on owls: they hunt by sound in the dark | It hunts by ear and hates light. It goes to the last thing it heard; a quiet sloth is not there | head tilts, a hoot; crouch 0.6 s, slide, ground shock, dizzy 1.0 s |
| Poison Dart Frog | **patrol** (on the clock) | Its colour IS its warning; it does not hunt | Hop, hop, rest. It minds its own business and puffs bright before the one hop that stings. Danger that looks like danger | throat flashes on the clock's warn (*new: today it has no tell*) |
| Jumping Spider | **seek** (by touch) | Feels the web's shake; moves in darts and stops | It dozes until a thread hums, then comes in bursts with pauses. Freezing does not hide him here: it feels the silk | crouch 0.7 s, legs draw in; burst 0.45 s, pause 0.32 s |
| Thorn vine | **ambush** (on the clock) | (ours) a sensitive plant: touch-me-nots fold when brushed | A sleeper with one eye. It stirs, looks, sleeps. It lashes only at what moves while it looks | an eye opens during the stir 1.1 s; looks 1.7 s |
| Stone sentry | **guard** | (ours) a temple statue | A doorway that hits back. Cannot be hit; strikes only what comes within reach; turns its head to noise | eyes glow, stone grinds 0.7 s; slam; a long reset |
| Fruit bats (the roost) | **sweep** | Roost by the hundred; one startled bat sets off the lot | One creature made of many. A ripple of wings runs along the roost on a beat; cross while they settle. They shoo, they do not bite (8-1) | a flutter runs through the roost 2.0 s |
| Moths | **seek** (the light) | Fly to light and circle it | They want the jar, not him. They drink its light; a punch scatters them, and darkness loses them | wing dust in the dark before they arrive |
| Eaglets | **patrol** (on the clock) | Nestlings pop up at every sound | A head pops up to look. Move while it looks and the squawk blows him back; never a heart | one head rises 1.2 s |
| Seamstress / Butler (W5) | **guard** / **patrol** | (ours) the Queen's household | She stitches whoever lingers at her seam; the sweet smell off his tray makes Pokey drowsy (he NEVER eats here: the Queen's "Nobody has ever not eaten the cake"). Polite, and a trap | she looks up 0.8 s; he lifts the tray |
| Capuchin thief / lookout / guard | **stalk** / **ambush** / **guard** | Clever, loud, steal food, post lookouts | Thief sneaks a petal and teases; lookout stares, then calls the eagle; guard paces a ledge. Never hurt him | as built (capuchin.ts) |
| Blinking log (W8, new) | **guard** | (ours) potoos and nightjars pass for dead wood all day | A fallen "log" that blinks. Never a bush: bushes are the safe place in every world (1-7). No mimic without the blink | blinks twice, creaks 0.8 s; snap; open 1.0 s |
| The Drake's gaze (9-4) | **sweep** (remembers) | (the guardian's eye, not a body) | "Visitor." then "Intruder." The first time, stillness hides him; once seen, only shade does | the glow turns before the beam; the stage clock |
| Soldier (W10) | **guard** | (the General's wall guard) | Holds the wall and blocks | spear lifts |

**The casts.** Today Worlds 6, 7 and 8 share one list of six animals (gen2/worlds/w6.ts:108-117, w7.ts:82-88, w8.ts:81-91), which is why
they feel alike. Each world gets a cast of three to five, one habit each (held by `roster.test.ts`), and its own star:

| World | Cast (habit) | The star |
|---|---|---|
| 1 Emerald Canopy | snake (patrol), eagle (sweep), boa (ambush) | the boa |
| 2 Sunlit Riverbank | turtle (seek), River King's guard (guard), sleeping caiman (sweep), snake (patrol) | the turtle and its shell |
| 3 Mossy Grotto | ocelot (stalk), jaguar (drop), thorn vine (ambush), grotto eyes (sweep) | the ocelot |
| 4 Mist Cascades | eagle (sweep), capuchin thief (stalk), lookout (ambush), guard (guard), eaglets (patrol) | the capuchins |
| 5 Orchid Sanctuary | spider (seek), seamstress (guard), butler (patrol); new from §7: dangler (drop), orchid mantis (ambush) | the mantis |
| 6 Deep Mangrove | caiman (sweep), tayra (charge), frog (patrol); new from §7: crab (guard), piranha (seek) | the tayra and the caiman |
| 7 Ancient Ruins | stone sentry (guard), boa (ambush), ocelot (stalk); new from §7: beetle (patrol) | the sentry |
| 8 Twilight Treetops | night harpy (seek), jaguar (drop), bats (sweep), blinking log (guard), a dozing boa (ambush); moths in 8-4 only; the owl is nobody's hunter but theirs | the night harpy |
| 9 Volcanic Jungle | the gaze (sweep), tayra (charge), jaguar (drop), night harpy (seek); lava lizard (patrol) when it has art | the gaze |
| 10 Stormy Highlands | soldier (guard), ocelot (stalk), and one of each earlier habit in 10-7 and 10-9 | every lesson at once |

The old swooping `eagle` enemy (old generator only) folds into the Harpy Eagle: the sweep's act IS the dive.

## 3. Ways to beat each (never only the stomp)

Ends: **stunned** (dazed for the seconds, then carries on), **gives up** (loses him and goes home for the seconds), **dozes off**,
**chased off** (leaves for the rest of the stage, on its own legs or wings). "open" = only while it is recovering, stunned or asleep.
**Bold** = the way its world teaches first. A noise lure is the kit's `hears`: it goes to look and notices nobody while it does.

| Animal | Way 1 | Way 2 | Way 3 | More |
|---|---|---|---|---|
| Golden Tree Snake | **punch** (1-3): stunned 2 s, knocked off its branch end | drop trap (shake its vine, drop the hive: the BUZZ chases it, no stings shown): chased off, it glides away | stomp: gives up 5 s (he vaults it) | kick: chased off |
| Boa Constrictor | **drop trap** (1-9): chased off, grumpy | lure: lead the eagle's shadow over it (it fears the eagle): chased off | go still: he is a branch, it gives up 4 s | punch while its head is out (open): stunned 2.5 s |
| Harpy Eagle | **go still in a bush** (1-7): 2 empty passes and it gives up 8 s | noise lure: its shadow goes to the noise 4.5 s | W4: behind a waterfall counts as cover | cannot be hit |
| Snapping Turtle | **kick** (2-5): the shell slides away, chased off, and bowls over what it meets | stomp: stunned 1.8 s (it pulls in) | noise lure: it goes to look 4.5 s, back turned | punch from behind (open): stunned |
| River King's guard | **kick** breaks the block: stunned 2 s | the bell (noise lure): it goes to look 4.5 s | a drifting log bumped into its raft (push): stunned 3 s | cannot be stomped or punched (a guard never can) |
| Spectacled Caiman | **go still** (6-2): the ripple passes, gives up 5 s | punch while its jaws are shut (open): stunned 2.5 s | sap bubble (trap): stunned 4 s | W2: quiet feet and it never wakes |
| Ocelot | **go still** (3-2): it loses him, gives up 5 s | noise-lure it under the loose stalactite (trap, 3-3): chased off | the drum (3-5): stunned 3 s | face it (it crawls); punch: stunned 1.5 s |
| Jaguar | **the stalactite** (trap, 3-3): chased off | the drum: stunned 3 s | punch while it is winded (open): stunned 2 s | W8 light: gives up 6 s; W9 its drop lands on a geyser: chased off |
| Tayra | **lure its charge** to the caiman's water (6-5; it fears the caiman): chased off | stomp over the dash: stunned 2 s | kick: stunned 2 s, bowled back | W9: its line ends on a geyser: chased off |
| Night Harpy | **light** (8-8: the owl's light, the jar): gives up 6 s | noise-lure it under the owl (it fears the owl): chased off | go still: no sound, it loses him 5 s | the drum: stunned 3 s; punch while dizzy (open) |
| Poison Dart Frog | **stomp** between hops: gives up 6 s (it hops off) | kick: chased off (it bounces away) | go still: it settles, gives up 4 s | |
| Jumping Spider | **stomp in the pause**: gives up 5 s | punch in the pause (open): stunned 2 s | pluck a far thread (noise lure): it goes there 4.5 s | a cold dew drip (W5's own tool): dozes off |
| Thorn vine | **go still** while it looks (3-5): it sleeps again | the drum: stunned 3 s | break (a dropped stone): chased off, it curls away | |
| Stone sentry | **break** the cracked pillar beside it (7-2): chased off (eyes dark, it steps back into its niche) | push a block into it (7-8): stunned 6 s | noise lure: it turns its head 4.5 s | cannot be punched or stomped |
| Fruit bats | **go still** as the ripple passes (8-1) | light: they settle, gives up 6 s | | never hit |
| Moths | **punch** scatters them: gives up 3 s | cover the jar (go dark): they lose it | | |
| Eaglets | **go still** while the head is up | cover | | never hit, never hurt |
| Seamstress / Butler | keep moving (her tell calls off) / hop the tray, or pass upwind of it | a cold dew drip on THEM: dozes off (not the leaf drip that wakes Pokey: the two look different) | | never hit |
| Capuchins | thief: punch, it drops the petal and runs; lookout: fruit lures it 6 s, or cover | guard: **wind** blows it off its ledge 1.8 s or down 5 s (4-9) | | never hurt him |
| Blinking log | **light** shows it: gives up 6 s | punch after it snaps (open): stunned 3 s | | |
| Drake's gaze | **go still** (first sight only), then shade | cover | | a world rule, not a body |
| Soldier | break, lure, push, the moat (10-7: every world's trick): stunned or gives up, never down for good | | | |

The triangle (R-159.1) inside this: the **stomp** vaults (a short stun or a give-up, never the strongest answer), the **punch** stuns
but mostly needs the open moment after a miss, the **kick** bowls an animal away and breaks a block. The world's own tool (the trap,
the lure, the drum, light, wind, the tide, stillness) is always the strong answer, so every world changes how you fight.

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
- **Hearing**: a predator is a heroNoise `Listener`: a noise wakes a sleeper, the drum stuns the awake, a kind with `hears` goes to
  look and notices nobody while it does (the noise lure).
- **Being beaten, as data**: `beatenBy` maps each way to stunned / gives up (flees) / dozes off / chased off, with "open" windows.
- **The food chain**: `fears` names the kinds it runs from; one of those awake and near chases it off. Nobody is caught.
- **Easy**: three multipliers and `normalOnly` posts.

The habits, by how many cast places each fills (§2's casts):

| # | Habit | Places | Parameters | Who |
|---|---|---|---|---|
| 1 | sweep | 7 | the stretch, eye speed, `warn`, `onBeat`, `callsOff`, `giveUp` in passes, `seesStill`, `remembers` | eagle (W1, W4), caiman (W2, W6), grotto eyes, bats, the gaze |
| 2 | guard | 7 | `blocks`, reach, no stomp or punch on its list | River King's guard, guard capuchin, seamstress, crab, sentry, blinking log, soldier |
| 3 | patrol | 7 | its beat, `shy`, `onBeat` | snake (W1, W2), eaglets, butler, frog, beetle, lava lizard |
| 4 | seek | 6 | `hears` (seconds it looks), hunt speed, asleep or pacing | turtle, spider, piranha, night harpy (W8, W9), moths |
| 5 | ambush | 6 | sight both ways, long `act.reach`, long `recover`, `onBeat` | boa (W1, W7, W8), thorn vine, lookout, mantis |
| 6 | stalk | 5 | hunt speed, `watched` (speed while he faces it), `engage`, `giveUp`, `hears` | ocelot (W3, W7, W10), thief |
| 7 | drop | 4 | the column under it, `act.aim: 'below'`, climb-back speed | jaguar (W3, W8, W9), dangler |
| 8 | charge | 2 | long `engage`, `act.speed`, runs to the end of its ground | tayra (W6, W9) |

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

## 7. Creatures we own but don't use (art already paid for)

Checked 11-11: the master catalog (origin/t-engine-inventory `reference/art/CATALOG-MASTER.csv`, 9,364 rows), `src/assets/enemies`,
`src/assets/w6to10/creatures` and `bosses`, and who imports each sheet. There is no `src/game/art/inventory.ts` on this base. A sheet
nothing imports is never loaded. Clip names are from each sheet's data; nobody has judged these sheets against the polish bar yet.

| Creature | Art we own (clips) | Fits | The real animal, the twist, and its role |
|---|---|---|---|
| Dangler | `enemies/dangler-anim.webp`, `-poses.webp`: idle, move, tell, attack, hurt, defeated (w5Creatures.ts:6 "in no stage yet") | W5 | A spider on a line, as real orb spiders drop. A **drop** kind and a yo-yo gate: it bobs on the clock, comes down when a thread hums, and climbs back. Pluck a far thread, punch it at the bottom of its bob (it swings away), or a dew drip |
| Orchid Mantis | `enemies/mantis-anim.webp`, `-poses.webp`: idle, move, attack, hurt, plus a DISGUISE pose | W5 | The real one poses as an orchid and waits. W5's theme in one animal: the loveliest flower is the trap. An **ambush** kind whose blink is that it sways AGAINST the breeze. A dew drip (dozes off), a punch after its miss, or keep moving past its reach |
| Dozer | `enemies/dozer-anim.webp`, `-poses.webp`: idle, attack, hurt, no walk | W3 or W5 | A sleeper that never walks: a **guard** asleep across the path. Noise wakes it, it swats, it dozes off again. Quiet feet, stillness, or the drum. (A cake-eating dozer already plays a puzzle part in Meeca's stage, meecaQA.test.ts:83) |
| Beetle | `w6to10/creatures/beetle-anim-0/1.webp`: idle, walk, attack, hurt, defeat (125 frames) | W7 | Dung beetles roll a ball in a straight line by starlight. A **patrol** kind that rolls a giant seed along its beat: the seed blocks him, pushes him, and is a ride if he hops on. Lure it and it rolls the seed where a push puzzle needs it |
| Crab | `w6to10/creatures/crab-anim.webp`: idle, walk, attack, hurt, defeat (78) | W6 | Mangrove crabs wave one big claw and bolt down their holes when the tide comes. A **guard** of a root gap whose tell is the real wave. The tide beats it (it hides while the water is up), a kick flips it, a noise turns it |
| Piranha | `w6to10/creatures/piranha-anim.webp`: idle, attack, hurt, defeat (53) | W6 | Drawn to splashing. A **seek** kind under water: a hard landing in water is a noise and the shoal goes to it; calm strokes pass. They NIP and scatter: a bite is a heart and a push away, never a feeding swarm, a frenzy or bones. Throw the splash elsewhere, or lead them to the caiman's stretch (they fear it) |
| Fruit bat, sleeping | `w6to10/creatures/fruitbat-w8-anim.webp`: doze, sleep (25) | W8 | Not a new creature: the roost's asleep and stirring states, which today are a drawn "z" (batArt.ts:6) |
| Owl | `owl-anim.webp`: one clip (defeat) | W8 | The creature the night hunters fear: its light is what 8-8 lures them into. A presence, not a helper: it never guides, points or speaks, and it looks nothing like the Night-Wing Monarch (a giant bat). Needs perch and wing clips first |
| Howler | `howler-anim.webp`: one clip | W4 or W3 | The loudest animal in the forest. Not a hunter: a NOISE on the clock. Its howl wakes every sleeper in earshot, so you cross before it. Needs a howl clip |
| Lava lizard | `lavalizard-anim.webp`: one clip | W9 | Real ones do push-ups as a warning. A **patrol** kind that shuttles between hot rock and shade; the push-ups are its tell. Needs walk and tell clips |
| Soldier, second batch | `w6to10/creatures/soldier-anim-0/1.webp`: attack a/b, hurt a/b, down a/b (150) | W10 | Ready for the **guard**: two attacks give it two tells |
| Guardian clip sheets | `w6to10/bosses/{drake,golem,ironclaw,monarch,reaver,thornbark}-anim*.webp` (drake: breath, stomp, tail, petrify; golem: beam, quake, slam; monarch: dive, glide, roost, screech) | W6-10 | Unused attack and tell clips for R-161's "three ways to win" a guardian |

So five new animals (dangler, mantis, crab, piranha, beetle) can join their casts on art we already have, each taking a habit its
world's cast is missing; four more need a few clips. Every one still gets Matt's picture approval before it ships.
