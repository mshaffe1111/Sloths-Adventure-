# Predators: one personality each, and two or three ways to beat every one (EN-P, 2026-11-11)

Matt, 11-11 9:14-9:16 PM ET: "give them unique personalities, so each predator plays differently"; "maximize how to fight predators, so
you just don't have to stomp on them"; "predators are huge in this game, let the best engine build it."

Scope (the lead, 9:19 and 9:23 PM ET, from Matt): EVERY creature that can hurt, block or chase Pokey, each started from what the real
animal does and given a creative twist that fits its world (Matt asked for the design to be bold here), plus the
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
they feel alike. Each world gets a cast of three to five, one habit each (held by `src/game/predatorRoster.test.ts`), and its own star:

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

**The move ladder (the lead, 9:56 PM ET): a way is only there in a world at or after the world that teaches its move.** World 1:
stomp 1-1, punch and drop traps 1-3, kick 1-5, stillness 1-7, the food chain 1-9. World 2: the bell. World 3: thrown noise, the drum. Wind
World 4, the dew drip World 5, break and push World 7, light World 8, geysers World 9. In the kit: `roster.ts` `TAUGHT` and
`inWorld(def, world)`, which every cast is laid through; `predatorRoster.test.ts` fails when a way appears before its move.
The bell stays in World 2 (the lead, 10:06 PM ET): it is built (turtles walk to it, engine.ts:2749) and is the right first taste: a
fixed thing in the world that he rings. World 3 makes noise a rule of the world and teaches throwing.

| Animal | Way 1 | Way 2 | Way 3 | More | Available from |
|---|---|---|---|---|---|
| Golden Tree Snake | **punch** (1-3): mid-branch it is shoved 70 px along and dazed 2 s (not an ending); at its branch end it glides away | drop trap (shake its vine, drop the hive: the BUZZ chases it, no stings shown): it glides away | stomp (he vaults it): it glides away | kick: it glides away. **Every ending is the glide to a lower tree, gone for good (Matt, 11-12, R-165.141)** | 1-3 punch and trap; stomp from 1-1; kick from 1-5 |
| Boa Constrictor | **drop trap** (1-9): chased off, grumpy | lure: lead the eagle's shadow over it (it fears the eagle): chased off | go still: he is a branch, it gives up 4 s | punch while its head is out (open): stunned 2.5 s | 1-9: trap (1-3), stillness (1-7), the eagle is in its world |
| Harpy Eagle | **go still in a bush** (1-7): 2 empty passes and it gives up 8 s | seen in the open: reach a bush and go still before its dive (0.75 s) and it pulls up | from World 3 (so 4-5): a thrown noise pulls its shadow away 4.5 s; W4: behind a waterfall counts as cover | cannot be hit | **W1: stillness and cover only.** The noise lure from World 3, so 4-5 |
| Snapping Turtle | **kick** (2-5): the shell slides away, chased off, and bowls over what it meets | stomp: stunned 1.8 s (it pulls in) | the bell: it goes to look 4.5 s, back turned | punch from behind (open): stunned | W2: all four (the bell is World 2's) |
| River King's guard | **kick** breaks the block: stunned 2 s | the bell (World 2's own noise, rung not thrown): it leaves its post for nothing else, and goes to look 4.5 s | a river trap (a snap-jaw stone, 2-5's lesson, snaps at its raft): stunned 3 s | cannot be stomped or punched (a guard never can) | W2: all three (the bell is World 2's) |
| Spectacled Caiman | **go still** (6-2): the ripple passes, gives up 5 s | punch while its jaws are shut (open): stunned 2.5 s | sap bubble (trap): stunned 4 s | W2: quiet feet and it never wakes | W2 (asleep), W6: all three |
| Ocelot | **go still** (3-2): it loses him, gives up 5 s | noise-lure it under the loose stalactite (trap, 3-3): chased off | the drum (3-5): stunned 3 s | face it (it crawls); punch: stunned 1.5 s | W3: stillness, trap, drum, punch, noise. Light from World 8 |
| Jaguar | **the stalactite** (trap, 3-3): chased off | the drum: stunned 3 s | punch while it is winded (open): stunned 2 s | W8 light: gives up 6 s; W9 its drop lands on a geyser: chased off | W3: trap, drum, punch. Light from W8, the geyser from W9 |
| Tayra | **lure its charge** to the caiman's water (6-5; it fears the caiman): chased off | stomp over the dash: stunned 2 s | kick: stunned 2 s, bowled back | W9: its line ends on a geyser: chased off | W6: all three (the caiman is in its world). Geyser W9; no caiman there |
| Night Harpy | **light** (8-8: the owl's light, the jar): gives up 6 s | noise-lure it under the owl (it fears the owl): chased off | go still: no sound, it loses him 5 s | the drum: stunned 3 s; punch while dizzy (open) | W8: all (the owl is World 8's). W9: no owl, so no lure |
| Poison Dart Frog | **stomp** between hops: gives up 6 s (it hops off) | kick: chased off (it bounces away) | go still: it settles, gives up 4 s | | W6: all three |
| Jumping Spider | **stomp in the pause**: gives up 5 s | punch in the pause (open): stunned 2 s | pluck a far thread (noise lure): it goes there 4.5 s | a cold dew drip (W5's own tool): dozes off | W5: all (noise World 3, dew World 5) |
| Thorn vine | **go still** while it looks (3-5): it sleeps again | the drum: stunned 3 s | drop trap (a loosened stalactite): chased off, it curls away | | W3: all three |
| Stone sentry | **break** the cracked pillar beside it (7-2): chased off (eyes dark, it steps back into its niche) | push a block into it (7-8): stunned 6 s | noise lure: it turns its head 4.5 s | cannot be punched or stomped | W7: break and push are World 7's own |
| Fruit bats | **go still** as the ripple passes (8-1) | light: they settle, gives up 6 s | | never hit | W8 |
| Moths | **punch** scatters them: gives up 3 s | cover the jar (go dark): they lose it | | | 8-4 |
| Eaglets | **go still** while the head is up | cover | | never hit, never hurt | W4 |
| Seamstress / Butler | keep moving (her tell calls off) / hop the tray, or pass upwind of it | a cold dew drip on THEM: dozes off (not the leaf drip that wakes Pokey: the two look different) | | never hit | W5 |
| Capuchins | thief: punch, it drops the petal and runs; lookout: fruit lures it 6 s, or cover | guard: **wind** blows it off its ledge 1.8 s or down 5 s (4-9) | | never hurt him | W4 (wind is World 4's) |
| Blinking log | **light** shows it: gives up 6 s | punch after it snaps (open): stunned 3 s | | | W8 |
| Drake's gaze | **go still** (first sight only), then shade | cover | | a world rule, not a body | W9 |
| Soldier | break, lure, push, the moat (10-7: every world's trick): stunned or gives up, never down for good | | | | W10: everything is taught by then |

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
- **Being beaten, as data**: `beatenBy` maps each way to stunned / gives up (flees) / dozes off / chased off; a way can need the
  "open" moment (recovering, stunned, asleep, paused between bursts) or need to come from behind (the turtle's shell).
- **The food chain**: `fears` names the kinds it runs from; one of those awake and near chases it off. Nobody is caught.
- **Easy**: three multipliers and `normalOnly` posts.

The habits, by how many cast places each fills (§2's casts):

| # | Habit | Places | Parameters | Who |
|---|---|---|---|---|
| 1 | sweep | 7 | the stretch, eye speed, `warn`, `onBeat`, `callsOff`, `giveUp` in passes, `seesStill`, `remembers`, `rides` (its body is its eye) | eagle (W1, W4), caiman (W2, W6), grotto eyes, bats, the gaze |
| 2 | guard | 7 | `blocks`, reach, no stomp or punch on its list | River King's guard, guard capuchin, seamstress, crab, sentry, blinking log, soldier |
| 3 | patrol | 7 | its beat, `shy`, `onBeat` | snake (W1, W2), eaglets, butler, frog, beetle, lava lizard |
| 4 | seek | 6 | `hears` (seconds it looks), hunt speed, asleep or pacing, `gait` (bursts and pauses) | turtle, spider, piranha, night harpy (W8, W9), moths |
| 5 | ambush | 6 | sight both ways, long `act.reach`, long `recover`, `onBeat` | boa (W1, W7, W8), thorn vine, lookout, mantis |
| 6 | stalk | 5 | hunt speed, `watched` (speed while he faces it), `engage`, `giveUp`, `hears` | ocelot (W3, W7, W10), thief |
| 7 | drop | 4 | the column under it, `act.aim: 'below'`, climb-back speed | jaguar (W3, W8, W9), dangler |
| 8 | charge | 2 | long `engage`, `act.speed`, runs to the end of its ground | tayra (W6, W9) |

Built 11-11 (all eight, on one machine, `core.ts`): World 1's three as data (`world1.ts`) and ten later animals (`casts.ts`). The
existing modules stay the source of today's shipped play (watcher.ts, predatorAI.ts, capuchin.ts); the kit replaces them one animal at
a time when its world is laid (new replaces old, no switches), each with its own QA.

## 6. What this needs from other lanes

- **Art** (a Hugging Face list for Matt, not in this task): a tell pose per animal where today's is a red ring ("!"): snake rear exists;
  boa head-back, ocelot crouch, tayra stand-up exist as states; new: caiman ripples and eyes, jaguar on a shelf, frog flash, the log that blinks,
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

## 8. Size against Pokey (measurement and proposal only; no art or code changed)

Pokey is drawn **89.1 units** tall: `HERO_UNITS 66 x HERO_SPRITE_SCALE 1.35` (heroSprite.ts:30, :32). Creatures draw in the same world pass
(engine.ts:6256), so these compare directly. Measured 11-11 from each sheet's frame size x its draw scale (file:line in the "from"
column). A three-toed sloth is about 60 cm, so 1 cm is about 1.5 units; "true" is the real animal at that rate. **FLAG** = today is
more than 25% off the proposal. H x L in units.

| Creature | Drawn today H x L (x Pokey's height) | From | The real animal, and "true" at Pokey's scale | Proposed H x L | |
|---|---|---|---|---|---|
| Golden Tree Snake | 62 x 106-119 (0.70) | goldsnakeAnimData x 0.4 (goldSnake.ts:288) | 1.0-1.3 m long: 150-190 long | 62 x 130: as is, a touch longer | ok |
| Boa Constrictor | 38-48 x 103-109 (0.48) | boaAtlasData x 0.4 (boaSprite.ts:26) | 2-3 m, heavy: 300-450 long | 62 x 190. Today the boa is SMALLER than the tree snake | **FLAG** |
| Harpy Eagle | 73-137 x 101-112 wingspan (calm pass drawn at x0.38, dive x1: engine.ts:7840) | eagleAnimData x 0.44/1.5 (eagleSprite.ts:25) | body 1 m, wings 2 m: 300 across | wings 230 across in the dive: it should loom | **FLAG** |
| Snapping Turtle | 43 x 61 (0.48) | turtleAnimData x 0.262 (turtleArt.ts:175) | shell 40-80 cm: 60-120 | 46 x 70 | ok |
| River King's guard | 73 x 40 (0.82) | guardAnimData x 0.272 (guardArt.ts:40) | (a turtle standing) | 84 x 46: it should look him in the eye | ok |
| Spectacled Caiman | 39 x 132 (0.44) | caimanAtlasData x 0.58 (caimanSprite.ts:21) | 1.4-2.5 m: 210-370 long | 52 x 210: a back he can walk across (2-6) | **FLAG** |
| Ocelot | 44 x 104 (0.49) | ocelotAnimData x 0.40/1.5 (ocelotSprite.ts:28) | body 0.7-1 m, shoulder 45 cm: 62 x 115 | 52 x 115 | ok |
| Jaguar | 60 x 122 (0.67) | jaguarAnimData x 0.48/1.5 (jaguarSprite.ts:28) | body 1.1-1.85 m, shoulder 70 cm: 105 x 165-275 | 86 x 175: Pokey's height at the shoulder | **FLAG** |
| Tayra | 35 x 85 (0.39) | tayraAtlasData x 0.33 (tayraSprite.ts:21) | body 60-70 cm: 36 x 95 | 36 x 90: true already | ok |
| Night Harpy | 45-70 x 60 (0.5-0.78) | harpyAtlasData x 0.42 (harpySprite.ts:21) | (ours) | 95 x 80: a bruiser that shakes the ground stands over him | **FLAG** |
| Poison Dart Frog | 32 x 44 (0.36) | frogAtlasData x 0.38 (frogSprite.ts:20) | 2-5 cm: 3-7 units, unreadable | 34 x 46: stylised 6x; its colour does the work | ok |
| Jumping Spider | 38 x 58-66 (0.43) | spiderAnimData x 0.46/1.6 (w5Creatures.ts:28) | 1-2 cm (the Queen's household is fairy-tale scale) | 42 x 68 | ok |
| Stone sentry | 96 x 56 (1.08) | sentryAnimData x 96/381 (sentrySprite.ts:19) | (a statue) | 135 x 78: a doorway that hits back towers | **FLAG** |
| Fruit bat | hanging 71-90 x 71-127; flying 84 x 148-178 (0.8-1.0) | fruitbatAnimData x 0.33, x 0.4 (batArt.ts:28) | wings 30-50 cm here: 45-75 across | hanging 55; flying 110 across: more bats, each smaller, reads as one roost | **FLAG** |
| Moth | 31-35 x 53-60 (0.37) | 166x96 x 0.32-0.36 (w8LanternRun.ts:317) | the big ones are 25-30 cm: 40 | as is | ok |
| Capuchin | 53-87 x 70 (0.6-0.97) | width fixed 70 (w4Play.ts:1426) | body 35-55 cm: 55-80 | as is | ok |
| Seamstress / Butler | 124 x 117 / 104 x 102 (1.39 / 1.17) | w5Kit.ts:529; w5Creatures.ts:90 | (ours) | as is | ok |
| Thorn vine | 270 x 247 (3.0) | THORN_H 270 (w3Art.ts:202) | (a plant) | as is | ok |
| Eaglets in the nest | 174 x 150, nest and chicks one piece | w4Nests.ts:80 | chicks 30-50 cm | as is | ok |
| Soldier | 91-96 x 62-73 (1.05) | soldierAnimData x 0.5/1.6 (meecaArt.ts:730) | (the General's guard) | 105 x 75 | ok |
| *Unused:* Dangler | idle frame 274-283 x 286-288 px (UP 1.6) | danglerAnimData | an orb spider on its line | 60 x 60: overhead, it must read against leaves | new |
| *Unused:* Orchid Mantis | idle frame 337-342 x 267 px | mantisAnimData | 6 cm; it must pass for a bloom | the height of the W5 bloom it poses as (measure that art first), about 80 | new |
| *Unused:* Crab | idle frame 328-336 x 296-307 px | crab.json | shell 5-10 cm: 8-15 | 46 x 52: small but readable, the claw a third of it | new |
| *Unused:* Piranha | idle frame 334-373 x 292-298 px | piranha.json | 15-35 cm: 25-50 | 30 x 36 each, a shoal of five to seven | new |
| *Unused:* Beetle | idle frame 361-421 x 204-232 px | beetle.json | 8-17 cm: 12-25 | 40 x 70, with a seed as tall as Pokey (90) to ride | new |

Seven flags. The pattern: the big hunters are drawn at half Pokey's height or less (boa 0.48, caiman 0.44, jaguar 0.67), so nothing in
a stage looks like it could hunt a sloth. The crab and the piranha would be drawn at about 0.15 and 0.1 of their sheets: bake them at
game size (the draw budget counts draws shrunk over 2.5x: `shrunkOver2_5x` 32, tools/perf/limits.json).

**The ten guardians** (Matt, 9:42 PM ET: "huge... much, much, much larger than Pokey"). Drawn = frame x `spec.k x def.scale`
(paintedBoss.ts:150; Venom Fang is a rig, venomRig.ts:18). Headroom = sheet px per drawn unit: under 1 means the art is already stretched.

| Guardian | Drawn today H x L (x Pokey) | Headroom today | Proposed H x L (x Pokey) | Headroom then | Needs |
|---|---|---|---|---|---|
| 1 Venom Fang | coil 204 x 306; raised head top about 345 (3.9) | 2.94 | head top 445, coil 265 x 400 (5.0) | 2.3 | nothing new: the only one with art to spare. `climbTop` 270 rises with him (bossDefs.ts:220) |
| 2 Crocus Rex | 163-228 x 460-479 (1.8-2.6) | 0.78 | 270 x 600 (3.0): long and low | 0.6 | new art; arena 1400 to about 1700 |
| 3 Shadow Prowler | 178 x 425 (2.0) | 0.92 | 270 x 640 (3.0) | 0.6 | new art; arena 1500 to about 1800 |
| 4 Sky Sovereign | 182-231 x 272-362 (2.0-2.6) | 0.51 | 330 x 620 wingspan (3.7) | 0.3 | new art at 2-3x; the air camera (`frameAir`) |
| 5 Tarantula Queen | 190 x 337-399 (2.2) | 1.01 | 310 x 600 (3.5) | 0.65 | new art |
| 6 Marsh Reaver | 249 x 381 (2.8) | 0.44 | 360 x 550 (4.0) | 0.3 (0.38 with the unused reaver sheet) | new art |
| 7 Stone Idol Golem | 236 x 271 (2.65) | 0.48 | 450 x 500 (5.0): an idol fills its hall | 0.25 (0.4 with the unused golem sheet, which is over 4096 px) | new art; the level's top (560 units above the floor) |
| 8 Night-Wing Monarch | 138-198 x 330-420 (1.5-2.2) | 0.52 | 300 x 640 wingspan (3.4) | 0.3 | new art |
| 9 Magma Drake | 264 x 474 (2.96) | 0.39 | 400 x 720 (4.5): the biggest animal in the game | 0.26 | new art; arena 1400 to about 1900; portrait cannot show all of him |
| 10 General Iron-Claw | 282 x 370 (3.17) | 0.69 | 360 x 470 (4.0): he looms, and the hand he is offered still reads | 0.55 (0.68 with the unused ironclaw sheets, over 4096 px) | new art |

What a bigger guardian needs, measured:
- **The room.** Every arena has its floor 560 units under the top of the level (stageGenerator.ts:2599-2607; level height 900,
  worldsData.ts:348), and the HUD covers the top 19% of the screen (bossCamera.ts:7). So 5x Pokey (446 units) is the most that fits
  with any air over its head; "filling most of the screen's height" needs taller levels. Longer bodies need 300-500 more arena width.
- **The camera.** Landscape shows 540 units of height (engine.ts:224), more as the fight camera zooms out (to x0.4, bossCamera.ts).
  The limit is Pokey: on an 844 x 390 phone he is 64 px tall, and 26 px at the widest zoom. To keep him at 40 px the zoom stops at
  about x0.62, where a 446-unit guardian is 200 px of the 390: half the screen. Portrait shows at most 720 units of width (bossCamera.ts),
  so a 600-720 long guardian and Pokey do not both fit: raise that cap, or let part of the beast be off screen (it reads as huge).
- **The art.** Eight of the ten are already drawn larger than their sheets (headroom under 1). At these sizes they would be 2 to 4
  times stretched, and soft. Venom Fang alone can grow tonight's art. The unused sheets in `src/assets/w6to10/bosses/` are only 1.25x
  bigger and four are over the 4096 px limit (artcheck.mjs:18), so "huge" is a Hugging Face picture list for Matt ($72 left).
- **The draw budget.** A guardian twice as tall and long covers four times the pixels: the Drake goes from 0.2 to about 0.46 of a
  landscape screen. The limit is 7.5 screens of drawn images a frame, worst today 7.22 (limits.json), and **no guardian fight is among
  drawcheck's seven scenarios**, so today nothing would catch a guardian that breaks it: add one fight as a scenario first. The glow
  some guardians use is a shadow blur (paintedBoss.ts:146), which the main-canvas limit sets at 0.

## 9. Throw to lure (Matt, via the lead, 9:53 PM ET: taught in World 3, the quiet world; used after)

**What exists** (the puzzle kit, in puzzle rooms only):
- `carry` and `throw` are Moves (gen2/types.ts:35). Things to carry: acorn, stone, pinecone, pebble (all noisy), cake, mushroom, mango
  (puzzleKit.ts:49-57). A tap in reach picks one up (puzzlePlay.ts:692-715); carrying, he walks at 0.68 speed (puzzleKit.ts:199).
- The throw is a real arc (puzzleKit.ts:277-285, gravity 1500): a flick up lobs it (lands about 130 px ahead after 1.2 s, 224 px
  high); a sideways flick throws it forward (lands about 295 px ahead after 0.6 s). A tap sets it down, silently.
- A thrown noisy thing lands with a noise that carries 520 px for 4.5 s (puzzlePlay.ts:1077; noise.ts). Three listeners are wired:
  the eagle's shadow circles the noise (engine.ts:7699, watcher.ts:179), a looking thorn vine strikes at it (engine.ts:8016), a
  turtle walks to it and notices nobody (engine.ts:2749). The bell (680 px) is in World 2's bell rooms (w2Stages.ts:1073).

**What the kit has as of tonight**: `heroNoise.thrownNoise(x, y, t)` (520 px) and `bellNoise` (680 px), and one rule in `core.ts` `hear`:
**only a noise made somewhere he is not (thrown, or a rung bell) is a lure.** A kind that `hears` goes to it and notices nobody for its `hears` seconds. His own noise (a landing, a punch, a break) is
where HE is: a hunter at rest comes looking with its eyes open, and nothing is ever blinded by it. A thrown noise also wakes every
sleeper it reaches, so in the quiet world a throw is a choice, not a free pass.

**Who answers a thrown noise** (from World 3 on, by the move ladder): the ocelot (comes to it: lure it under the stalactite, 3-3), the
jaguar no (it only watches its column), the thorn vine (strikes at it), the Harpy Eagle from 4-5 (its shadow goes there), the
capuchin lookout (looks away), the jumping spider (a pebble on a far thread), the tayra no (it charges what it sees), the crab and
the stone sentry (turn to it: walk past behind), the night harpy most of all (it hunts by ear: throw it under the owl's light), the
piranhas (a pebble in the water is a splash). In World 2 the turtle and the River King's guard answer the bell, not a throw.

**What it still needs** (not built):
1. **Out of the puzzle rooms.** Today carry and throw live in the room kit. A laid stage needs pickup spots in its brief (a pebble
   pile or a nut tree at an anchor, the kit's `source` piece, puzzleKit.ts:65) and the thrown landing handed to the cast (`hear`).
2. **Never fruit.** Pebbles and nuts only (the story keeper). The mango is already not noisy, so the data holds the rule.
3. **The hands problem.** There is no spare gesture: while he carries, the jump flick and the kick flick ARE the throws
   (puzzlePlay.ts:675-692), so with a pebble in hand he cannot jump or kick. In a puzzle room that is fine; beside a hunter it is the
   real cost of the tool. My call: keep it (carrying is a commitment; a tap drops it) and watch the testers in World 3.
4. **Aim.** Two fixed arcs. Enough to teach with (he aims by where he stands); a third, longer arc from a hold is the first thing to
   add if testers want range. No aim line: Dot never points, and an arc drawn on screen is the same thing.
5. **Teaching it** (3-2 or 3-3): a pebble pile in the light, one ocelot facing away, one stalactite. The first throw can only go right.
