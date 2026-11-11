# The game map: all ten worlds, what makes each one play different, and the work to build it

Designer, started 11-11 5:16 PM ET, for Matt's review (R-165.111 step 2). **A draft: nothing is built from it until Matt has read it and
answered the questions in section 8.** Base: the lead's branch at 2e06602e, the Architect's CAPABILITY.md (t-architect-capability) and
ADR-003 (t-architect-stagekit), the art inventory (t-engine-inventory@621a3d2b), 1-2's packet (t-design-1-2).
Kept as approved: every stage name, mission and story line in src/game/stagePlan.ts, World 1's draft (reference/ideas/W1-PLAN-DRAFT-
2026-11-11.md), the 1-2 packet. Anything new to the story is marked **(new, needs Matt's OK)**. Anything I could not back from a file is
marked **(my judgement)**.

## The answer in one line

**Yes, Worlds 2 and 3 play a lot different from World 1.** World 1 teaches the moves on branches that stand still. In World 2 nothing
stands still: you ride logs and pads that carry you, read traffic in the river lanes, and lead freed animals home. In World 3 the lights
go out and things are asleep: you see only by glowworms, noise wakes the thorns, and Pokey learns to hang upside down from the roof.
Every world after that adds one new move and at least two new rules of its world, and brings the old ones back harder.

---

## 1. The big picture: one ladder to hold in your head

| World | Pokey's new move | New rules of the world (what changes how you play) | Hurry or patience | Hidden stage | Guardian |
|---|---|---|---|---|---|
| 1 Emerald Canopy | the basics: jump, double jump, bounce, punch, rope, climb, swing, hide | classic, one twist per stage: rotting boughs, drop traps, two roads, the pendulum, quiet feet, animals crossing, a boa that copies you | both, taught | Zipline Canopy | Venom Fang |
| 2 Sunlit Riverbank | **ride**: hop on things that move and let them carry you | 1. nothing stands still (drifting logs, sinking pads, rafts) 2. river lanes going both ways 3. bring the freed animals home; first run back to the LEFT | hurry (the rides don't wait) | The Rapids (raft ride) | Crocus Rex |
| 3 Mossy Grotto | **hang under** roots and branches (the sloth's own move) | 1. dark: you see only near light 2. quiet: noise wakes things up 3. the first stage that goes DOWN | patience (slow and quiet) | The Cave Slide | Shadow Prowler |
| 4 Mist Cascades | **leaf glide** | 1. the air moves you (gusts, updrafts) 2. rocks fall on a beat 3. tall stages both ways: climb up, glide down | hurry (keep ahead of the rocks) | Up the Falls (+ Dot's Flight, built) | Sky Sovereign |
| 5 Orchid Sanctuary | **lead on a vine**: tie freed creatures to you, tie the vine off to a post | 1. the clock: orchids close 2. silk that hums: touch a thread and spiders come 3. don't stop: stand still too long and Pokey sits down | hurry | The Wilted Garden (+ Meeca's stage, built) | Tarantula Queen |
| 6 Deep Mangrove | **swim and dive** | 1. the tide raises and lowers the whole stage 2. water is a place, not a pit 3. food chain: lure hunters to what hunts them | patience (wait for the tide) | The Sunken Hollow (dive to find it) | Marsh Reaver |
| 7 Ancient Ruins | **break and push**: the punch now breaks cracked stone | 1. floors fall away 2. the temple is a machine: switches, timed doors, a find that changes the room 3. alone: no Dot, no help from her | hurry | Under the Ruins (+ Thornbark, built) | Stone Idol Golem |
| 8 Twilight Treetops | **swing and fling**: let go at the top of the swing to fly | 1. night: you carry your light (the jar) 2. things are there only when lit 3. swing chains with no ground | patience | The Moth Lights | Night-Wing Monarch |
| 9 Volcanic Jungle | **hot-air ride**: open the leaf over a vent and rise | 1. heat: hot rock hurts if you stand on it 2. lava rises under you 3. crust floors that harden and melt on a beat | hurry | Up the Vent | Magma Drake |
| 10 Stormy Highlands | **hold on**: freeze on the lightning flash (R-2.7) | 1. lightning on a beat 2. thunder gusts tear you off unless you hold 3. every move from Worlds 1-9, three and four at once | patience | Pokey's Own Road (pick-a-card) | General Iron-Claw |

Why the "hurry or patience" column: STAGE-RULES §0b.3 says every mechanic has a hurry and a patience version and worlds alternate, so
two worlds in a row never feel the same speed. The list alternates from World 2 on with one exception: Worlds 4 and 5 are both hurry
worlds. World 5's "don't stop" is the strongest hurry rule in the game, and World 4's rocks are on a beat you can wait out between, so the
two still feel different (**my judgement**).

**Counts:** 113 stages in all. 90 core stages (1-1 done, 89 to lay), 10 guardians, 10 hidden stages (new), and 3 extras already built
(4-D Dot's Flight, 5-M Meeca's stage, S-1 Thornbark). **86 laid by the generator (gen2), 27 hand-made** (10 guardians, 10 hidden, 3
extras, 4 set pieces kept: 4-3 Waterfall Steps, 4-7 The Long Drop, 7-4's slide, 8-4 Lantern Run). 17 of the 27 hand-made ones exist today.

---

## 2. How 100 levels get made from a few blocks (the thought process, in plain words)

Think of it as LEGO. There are five kinds of piece, and a stage is a recipe that says which ones to use.

1. **One engine.** The physics, the controls, hearts, lives, saves and every phone check are the same in every stage. We never build a
   second engine for a new stage type (CAPABILITY.md §1, ADR-003 decision 3). A new stage type is a plug-in on the one engine.
2. **Sections: the bricks.** A section is 5-20 seconds of play: a jump over a pit, a swing, a puzzle room, a stretch of drifting logs.
   Each world has its own box of bricks, painted in its own art. 1-1 alone has about 68 (reference/handoffs/designer.md §2).
3. **Moves: what Pokey can do.** Each is taught once, in a safe spot, and then used for the rest of the game. A stage may only use moves
   taught at or before it (the move ladder, section 3).
4. **Twists: the rules of a world or a stage.** Three kinds (ADR-003):
   - a **direction**: right, left, up or down (the stage travels that way);
   - a **clock**: things that happen on a beat (falling rocks, lanes of traffic, the tide, lightning), always with a warning first;
   - a **rule change**: dark, quiet, heat, wind, sticky silk, a vine you are leading.
5. **The stage brief: the recipe.** One line per stage: mission x direction x clock x rules x moves. For example 2-8 "Before the Water
   Rises" = rescue, bring them home x up x the water clock x nothing stands still x ride + double jump. The generator picks bricks that
   fit the brief, lays a stage, and our bots play it on many rolls to prove it is fair and long enough.

**Why that gives 100 different levels, not 100 copies:** 9 missions x 4 directions x about 12 clocks x about 25 rules is thousands of
recipes; we only need 113. The rule I would hold us to: **two stages side by side in a world must differ in at least two parts of the
recipe** (STAGE-RULES §0b.6 already forbids neighbours sharing a tempo and a camera direction; this makes it a check on the brief,
**my judgement**). The hard part is not the recipes. It is making the bricks: each new twist is engine work, art and a fairness check.

---

## 3. The progression: what is new in each world, and what comes back remixed

**The move ladder** (a stage uses only moves at or above its row):

| Taught in | Move | Comes back in |
|---|---|---|
| 1-1 | run, jump, double jump, bounce | every world |
| 1-3 | claw punch; rope shimmy (on clearing 1-3, skills.ts) | 1-9, 2-5, 3-3, 7-5 (now breaks stone), every gauntlet |
| 1-4 | climb a trunk or vine; rotting boughs | every up stage; 7-2 (vines that snap), 9-7 (crust) |
| 1-6 | swing on a liana (build speed, let go) | 2-4 (onto a moving log), 3-8, 4-4 (in wind), 6-1/6-3, 8-3 (fling) |
| 1-7 | hide in a bush; quiet feet | 3-2/3-5 (sleepers), 4-5, 5-7, 9-4 |
| 2-1 | ride things that move | 2-*, 4-* (updrafts), 6-4, 9-5, 9-7 |
| 2-3 | bring them home (freed animals follow) | 2-8, 4-8, upgraded to the vine in 5-5 |
| 3-2 | hang under | 3-5, 3-9, 6-1, 8-5, 10-6 (under the iron netting) |
| 4-1/4-2 | leaf glide (required from 4-7, skills.ts) | 4-*, 6-6, 8-6, 9-5 (rides the vents) |
| 5-5 | lead on a vine, tie off to a post | 5-9, 6-5, 8-8, 10-7 |
| 6-7 | swim and dive (swim exists in 6-7 today) | 6-8, 6-9, the Sunken Hollow, 10-7 (the moat) |
| 7-5 | punch breaks cracked stone | 7-*, 9-6, 10-7 |
| 8-3 | swing and fling | 8-5, 8-9, 9-3, 10-6 |
| 9-5 | hot-air ride over vents | 9-*, 10-8 |
| 10-3 | hold on (freeze on the flash) | 10-4, 10-8, the General |

**Freshness check** (each world needs at least two new rules that change what your thumb does, not only new art):

| World | New rules | What comes back, harder | Passes? |
|---|---|---|---|
| 1 | the basics, one twist per stage (World 1's draft) | n/a, the first world | n/a |
| 2 | moving ground; river lanes; bring them home; first run left | swing (onto moving logs), drop traps (on snappers), the 1-8 lanes now ridden (or new here, question 1) | yes, 3 |
| 3 | dark; quiet wakes things; first run down; hanging | stealth from 1-7 (sleepers now wake on noise), the pendulum (3-8 past thorns), search | yes, 3 |
| 4 | wind; falling rocks on a beat; tall both ways; gliding | swing (in wind), stealth (the eagle's shadow), rescue (with updrafts) | yes, 3 |
| 5 | the clock; humming silk; don't stop; the vine leash | rescue (now on a vine), search (a chase), stealth (touch, not sight) | yes, 3 |
| 6 | the tide; water is a place; food chain; swim and dive | swing (the tide changes which roots you reach), the firefly light from 3, hanging | yes, 3 |
| 7 | falling floors; the temple machine; alone; breaking | the chase from 1-8 (7-6), climbing (vines snap), pushing (1-6, now to build steps) | yes, 3 |
| 8 | carried light; lit-only things; swing chains; the fling | glide (in the dark), the light meter (8-4), the vine leash (8-8), food chain | yes, 3 |
| 9 | heat; rising lava; crust floors on a beat; vent riding | rising water from 2-8/6-8 as lava, the shadow stealth (the Drake's gaze), crumble (as crust) | yes, 3 |
| 10 | lightning beat; hold on; everything at once | every move; three and four mechanics in one stretch (STAGE-RULES §0b.5) | yes, 2 + the mix |

**Enemies and set pieces, world by world** ("built" = read in the code; the rest is the plan, **my judgement**):

| World | Enemies (built) | New enemy behaviour in this plan | The world's big set piece |
|---|---|---|---|
| 1 | snakes, the boa, eagles (stagePlan.ts 1-3, 1-7, 1-9); marching army ants exist as a type (types.ts:50) | snakes knocked off by traps; the eagle's shadow; ants and nuts crossing in lanes; a boa that copies you | 1-8 The Long Branch |
| 2 | snapping turtles (the river snappers, types.ts:41), caiman, frogs | snap-jaw stones on a beat; animals that follow you home | 2-7's out and back |
| 3 | prowlers (stagePlan.ts 3-3) | prowlers that come to noise; sleeping thorn vines that wake | 3-1's trip down into the dark |
| 4 | eagles, capuchin guards (4-9) | the Sovereign's shadow; guards the wind blows off | 4-7 The Long Drop; 4-D Dot's Flight |
| 5 | spiders, awake and dozing (w5Sections.ts:12) | spiders woken by a touched thread | 5-M Meeca's stage |
| 6 | frog, tayra, ocelot, jaguar, harpy, caiman (w6.ts:78) | something under flat water; hunters lured to the caiman | 6-7's root well (swim and dive) |
| 7 | sentries (w7.ts:109) | sentries a punch can't hurt: drop stone on them | 7-4's slide |
| 8 | boa, harpy, jaguar, ocelot, tayra (World 8's gen2 sections) | night hunters lured into the light | 8-4 Lantern Run |
| 9 | (not checked: the World 9 stages are built by the old generator) | the Drake's gaze that remembers you; hunters lured into geysers | 9-5 Vent Riding |
| 10 | (not checked) | lightning and thunder as the "enemy"; guards on the walls | 10-2 The Thousand Steps |

**How it ramps from 1 to 10** (STAGE-RULES §0.5, §0b.5, §1b; the exact numbers per world are a later talk with Matt, §0.5 says so):
- **Worlds 1-3: one thing at a time.** One twist per stage, each taught safely, a miss lands on ground (§0b.2 part 1). The Normal bot clears
  every jump 70% of the time or more (§1b).
- **Worlds 4-6: pairs.** Two mechanics in one stretch (glide in wind, swing over a tide). Same 70% floor through World 5, 50% from World 6.
- **Worlds 7-9: triples.** Three at once (a falling floor, a timed door and a sentry). Dot is gone in 7; checkpoints closer as stretches get
  harder (respawn within about 2 s of the hard part, §0b.8).
- **World 10: everything.** Three and four at once, the hold rule on top. Hard, never cruel: every danger reads before it bites (§0.5).
- **Easy stays a cruise all the way** (§0.5): the same moves, softened (wider landings, longer warnings, fewer enemies), never removed (§1b).

---

## 4. World by world

Missions in plain words: **sprint** = race to the shrine; **harvest** = gather; **purge** = clear the predators; **ascent** = climb;
**stealth** = sneak; **vine_runner** = swing; **relic_hunt** = search; **rescue** = free; **gauntlet** = fight through. Way: → right,
← left, ↑ up, ↓ down, ⇄ out and back. "Teaches" is empty when the stage teaches nothing new.

### World 1, Emerald Canopy (Act I, The Trail)

**Story beat:** Meeca is taken; Pokey follows her petals north into the canopy (story keeper §5). **Signature:** the basics, on branches
that stand still. **Matt, 11-11:** "world 1 would be more classic with some new twists." The stages below are the lead's draft, kept.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 1-1 Into the Canopy | sprint | → | run to the shrine | none: the basics (done, the new re-lay) | run, jump, double, bounce |
| 1-2 The Petal Trail | harvest | → | gather petals | bounce chain over a thorny floor (in build, t-design-1-2) | |
| 1-3 Branch Snakes | purge | → | clear the snakes | drop traps: shake a vine or cut a tendril to knock snakes off | punch; rope on clearing |
| 1-4 Up the Kapok | ascent | ↑ | climb to the top | rotting boughs that drop and grow back | climb; crumbling |
| 1-5 Where She Walked | harvest | → | gather more | over or under: the risky canopy or the fast root tunnel; secret spots with golden cacao | |
| 1-6 First Lianas | vine_runner | → | swing across | the pendulum: build speed, let go at the top | swing |
| 1-7 A Very Good Bush | stealth | → | sneak past eagles | quiet feet + the eagle's shadow: run between cover, soft landings | hide |
| 1-8 The Long Branch | sprint | → | race to the shrine | animals and rolling nuts cross the branch in lanes (but see question 1) | |
| 1-9 The Boa's Branches | gauntlet | → | fight through | the boa copies your path: lure it off a ledge | |

- **Hidden stage: Zipline Canopy** (treetop vine zipline, the draft). **Opened by** W1's golden guarana cluster, in 1-5's root tunnel
  (R-165.109: one guarana a world opens its hidden stage; 1-5 holds the draft's secret spots).
- **Guardian:** Venom Fang (built, bossDefs.ts).
- **Engine pieces.** Exists: bounce (flown), punch, rope, climb (hand-built stages only; gen2 throws on climbs, CAPABILITY §1), lianas (gen2
  Worlds 6-8), crumble and regrow (gen2), hide, watchers and noise (noise.ts), boss arena (buildBoss), the 1-8 collapse chase (chase.ts).
  New: **up stages in gen2** (kit steps 2-4, 20-30 h; 1-4 needs them), crumble times per piece (1-2 h), drop traps (6-10 h), the root
  tunnel two-road layout (4-8 h), the swing arc flown (Designer 2-4 h), noisy landings (3-5 h) and the eagle's shadow (2-4 h), lanes of
  crossers (8-12 h), a pursuer that copies his path (4-12 h), the zipline (4-6 h), golden finds (R-165.109, 2-6 h).
- **Art.** Has: the richest world (432 best-fit pieces, 104 to stand on, 79 danger looks). Missing for this plan: drop-trap pieces (a log
  hung on a tendril, a fruit vine to shake), root-tunnel walls and roof, crossing animals' rolling nuts (no "nut" in the catalog), the
  zipline vine and Pokey's zipline pose, the golden cacao and guarana cut from Matt's sheet (reference/art-incoming/matt-2026-11-11-seeds/).
- **World 1 is the heaviest engine world** (about 50 h of new pieces, plus the kit), because it teaches the most. Question 1 moves 10 h of
  it to World 2.

### World 2, Sunlit Riverbank

**Story beat:** down to the river village; the river king wants admiring; little ones caught in reed cages; the mailman's long way round;
the water rising (stagePlan.ts:45-53). **Signature: ride.** STAGE-RULES §0.4 already says moving platforms start in World 2.
**New rules:** nothing stands still; river lanes both ways; bring them home; the first run back to the left.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 2-1 Down to the River | sprint | → | race to the village | drifting logs carry you; step off before they go under the reeds | ride |
| 2-2 Petals for the Crown | harvest | → | gather flowers | petals on lily pads that sink when you stand too long; the ferry sluice room (built) | sinking pads |
| 2-3 Stuck in the Reeds | rescue (5) | → | free the little ones | **bring them home**: freed animals hop behind you to the shrine; a fall makes them wait at the last flag (new mission, needs Matt's OK) | bring home |
| 2-4 Over the Water | vine_runner | → | swing across | let go of the vine onto a log that is moving | |
| 2-5 River Snappers | purge | → | chase off the snappers | snap-jaw stones: safe on three beats, snap on the fourth; drop a log on a snapper (1-3's trap comes back) | |
| 2-6 Up the Bank Houses | ascent | ↑ | climb the village | lifts and platforms that ride up and down | |
| 2-7 The Mailman's Route | sprint | ⇄ | the long way round | out to the last door, ring the bell, then race back LEFT through a changed river (doors open, a bridge up) | |
| 2-8 Before the Water Rises | rescue | ↑ | free more | the water rises from below: free them and bring them up ahead of it | |
| 2-9 The River King's Court | gauntlet | → | fight through | the full river: lanes of logs both ways, guards on the rafts | |

- **Hidden stage: The Rapids**, a raft ride where the screen scrolls on its own and you hop raft to raft down the white water (archetype 6,
  auto-scroll). **Opened by** the guarana behind a door in 2-7 that only opens on the way back.
- **Guardian:** Crocus Rex (built).
- **Engine pieces.** Exists: drifting logs you ride (engine.ts:1547, river.ts), lifts (lift.ts), sluices, reed cages, carry and crank, a
  hand-built rising tide (risingTide.ts), side-to-side platforms. New: moving platforms in gen2, up-down and point-to-point (4-8 h);
  sinking pads on a beat (the "beat-solid" family, 4-6 h); riding lanes (reuses 1-8's crossers, 1-3 h, **my judgement**); followers that
  hop behind him, plus the "bring N home" goal (10-16 h + 3-5 h); out and back to the left (the travel mode plus a wire that changes the
  stage, 6-10 h); rising water in gen2 (3-5 h); the auto-scroll camera (4-6 h).
- **Art.** Has: 336 best-fit pieces, 116 to stand on, the most water art (painted river). Missing: lily pads in a sinking state, snap-jaw
  stones (open and shut), the out-and-back changes (an open door, a raised bridge), white-water rapids and raft art for the hidden stage.
  Caiman and frog clips exist (cast).

### World 3, Mossy Grotto

**Story beat:** follow the glowworm light down into the grotto; prowlers circling; Grandma's things hidden in the ferns; the old thorn
vines asleep (stagePlan.ts:56-64). **Signature: hang under.** It is the move R-160.1 calls "the one idea that makes this game play like"
a sloth game, and a grotto roof hung with roots is where it is most natural (**my judgement**; question 2). **New rules:** dark, quiet,
the first trip down.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 3-1 Into the Grotto | sprint | ↓ | reach the shrine | the first stage that goes DOWN; light only from glowworms and fungi | dark (light from sources) |
| 3-2 Glowworm Path | stealth | → | sneak past | hang along the roof roots above the prowlers | hang under |
| 3-3 Footprints in a Circle | purge | → | drive off the prowlers | lure a prowler under a loose stalactite and knock it down (1-3's trap, now a lure) | |
| 3-4 The Sinkhole | ascent | ↑ | climb to the moonlight | sleepy mushrooms puff on a beat as you climb (built: spores, zones.ts) | |
| 3-5 Sleeping Vines | stealth | → | don't wake them | noise wakes the thorn vines: a loud landing or a punch wakes them; hanging and soft landings don't | noise wakes things |
| 3-6 Grandma's Things | relic_hunt (5) | → | search the ferns | carry a firefly jar: it lights a small circle around you | |
| 3-7 Which Fern? | relic_hunt (6) | ← | search more | all ferns look alike; a faint glow trail (Dot's pollen) shows which way she went (new, needs Matt's OK) | |
| 3-8 Thorn Vine Swing | vine_runner | → | swing past the thorns | thorn vines pulse on a beat (built: thornVine.ts); swing on the quiet beat | |
| 3-9 The Prowler's Ring | gauntlet | → | break out | dark + hanging + quiet + prowlers together | |

- **Hidden stage: The Cave Slide**, down an underground water chute (reuses 7-4's slide, w7SlideRun.ts, once it is a reusable mode).
  **Opened by** the guarana under a fern in 3-7, reached by hanging.
- **Guardian:** Shadow Prowler (built).
- **Engine pieces.** Exists: dark zones and a light ring (zones.ts 'dark', lantern.ts), spores, thorn vines, finds in ferns (finds.ts),
  predators that walk to a lure (predatorAI.ts:361), the slide (w7SlideRun.ts). New: hanging under (R-160.1, CAPABILITY puts it at 10-16 h
  plus art); one general light-and-meter piece (4-6 h); noise that wakes sleepers (2-4 h on top of World 1's noisy landings, **my
  judgement**); down stages in gen2 (kit step 4); the slide and Dot's flight moved onto the one engine as modes (10-16 h, CAPABILITY §1);
  the glow trail (3-5 h, **my judgement**).
- **Art.** Thin: 183 best-fit pieces, only 38 to stand on and **0 climb pieces** best-fit to World 3. Missing: Pokey hanging (idle, creep,
  drop), roof roots to hang from, lit rims on every ledge (the dark rule, STAGE-RULES §4), a firefly jar to carry (8-4 has one: B4:w8/pokey-
  jar), loose stalactites, the slide chute in grotto stone. **The thinnest standing art of any world: Hugging Face first here.**

### World 4, Mist Cascades (Act II, The Cost)

**Story beat:** the ledge falls away; Pokey learns the leaf; the Sky Sovereign hunts; Dot's flight through the netting (4-D) after 4-5.
**Signature: glide** (built: skills.ts, glide.ts). **New rules:** the air moves you; rocks fall on a beat; tall stages both ways.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 4-1 The Broken Ledge | ascent | ↑ | climb out of the mist | the leaf is learned on clearing (skills.ts) | glide (on clearing) |
| 4-2 First Glide | sprint | → | glide across the falls | gusts push the leaf left or right (built: wind, zones.ts) | wind |
| 4-3 Waterfall Steps | ascent | ↑ | climb the wet steps | the hand-built set piece, kept; rocks fall on a beat (rockfall.ts) | falling rocks |
| 4-4 Crosswind | vine_runner | → | swing across | swing while the wind pushes you | |
| 4-5 The Sovereign's Dive | stealth | → | stay under cover | the eagle's shadow: move when it passes, freeze under cover when it turns | |
| 4-6 Above the Mist | ascent | ↑ | climb to the nests | the mist hides ledges until you are close; catch ledges under each hop (STAGE-RULES §2) | |
| 4-7 The Long Drop | sprint | ↓ | glide down | the hand-built descent, kept; the first drop only the leaf can cross | |
| 4-8 Nests on the Cliff | rescue | ↑ | free the little ones | bring them home again, now riding updrafts with you | updrafts |
| 4-9 The Aerie | gauntlet | → | fight through | wind blows the guards off their ledges (built) | |

- **Extra (built): 4-D Dot's Flight.** **Hidden stage: Up the Falls**, ride one long updraft up a waterfall shaft, steering left and
  right past rocks (arcade idea 9). **Opened by** the guarana on a far ledge in 4-6, reached only by gliding.
- **Guardian:** Sky Sovereign (built).
- **Engine pieces.** Exists: glide, updrafts (w4Play.ts:84), wind, rockfall with a fairness check, catch ledges, 4-7's descent, 4-D.
  New: the glide arcs flown (Designer 2-4 h); wind, updrafts and rockfall as gen2 bricks (4-8 h, **my judgement**); a steerable rising
  ride (4-8 h). **The lightest engine world**: most of it exists.
- **Art.** 233 best-fit pieces, 51 to stand on, **0 climb pieces** best-fit (it has three climbs). Missing: climb pieces for the cliffs,
  mist that hides and shows ledges, the waterfall shaft for the hidden stage.

### World 5, Orchid Sanctuary

**Story beat:** the loveliest place on the road, and Pokey must not sit; the orchids closing early; the Queen's silk; where Meeca ran;
Meeca's own stage (5-M) after (stagePlan.ts:79-87). **Signature: lead on a vine** (R-165.110, Matt 11-11). **New rules:** the clock;
humming silk; don't stop.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 5-1 The Loveliest Place | sprint | → | run through | don't stop: stand still about 3 s and Pokey sits down to admire it, and loses time (new, needs Matt's OK) | don't stop |
| 5-2 Don't Sit | stealth | → | stay hidden | keep moving AND stay hidden: cover that moves with the breeze | |
| 5-3 Closing Orchids | harvest | → | gather orchids | the orchids close in waves: a clock you can see on each flower | the clock |
| 5-4 Silk Bridges | vine_runner | → | swing on the silk | sticky webs slow you (built: zones.ts webs) | |
| 5-5 Caught in Silk | rescue | → | free the creatures | **the vine leash**: freed creatures tie on behind you; thorns cut the vine and you go back; tie it off to a post while you climb or fight | lead on a vine |
| 5-6 Where She Ran | relic_hunt | ← | follow her messages | Meeca ran back the way she came: a chase to the LEFT, message to message | |
| 5-7 Don't Touch the Silk | stealth | → | keep out of sight | touch a humming thread and the dozing spiders wake (built in gen2 5-7, w5Sections.ts:12): stealth by touch, not sight | humming silk |
| 5-8 Up the Bloom Trees | ascent | ↑ | climb above the webs | the vine leash on a climb: tie off, climb, untie | |
| 5-9 The Queen's Garden | gauntlet | → | fight through | the clock + silk + the leash together (5-9 is gen2 today, w5Arena.ts) | |

- **Extra (built): 5-M Meeca's stage.** **Hidden stage: The Wilted Garden**, a grey dead garden that blooms where Pokey steps; bloom most of it to
  open the way (Matt's 30 ideas #29). **Opened by** the guarana at the end of 5-6's chase.
- **Guardian:** Tarantula Queen (built).
- **Engine pieces.** Exists: webs, Meeca's stage, 5-7 and 5-9 in gen2, spiders that doze until a thread hums (w5Sections.ts:12). New:
  the vine leash with tie-off posts (12-20 h, medium-high risk: rope physics on phones, CAPABILITY §1); a goal clock (4-6 h); the "don't
  stop" stillness rule (2-4 h on the general meter, **my judgement**); counting stepped-on platforms for the bloom (3-5 h). The vine changes Pokey's reach, so every
  stage with it is judged on its own flown arcs (ADR-003 decision 5).
- **Art.** 208 best-fit pieces but only 36 to stand on (the thinnest after World 3). Missing: the vine leash and tie-off posts (the rope
  drawing exists, ropeArt.ts), orchids open/closing/shut, a humming-thread state, the wilted and bloomed garden (a dead-wood set), Pokey
  sitting down.

### World 6, Deep Mangrove

**Story beat:** black water, the roots, hunters with spears, the firefly; Dot leaves mid-world and Flicker joins at 6-6 (story keeper §2).
**Signature: swim and dive** (swimming exists in 6-7's root well, swim.ts). **New rules:** the tide moves the whole stage; water is a
place; the food chain (R-165.95, the lead put it in Worlds 5-6).

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 6-1 The Root Maze | vine_runner | → | swing root to root | two ways through: high roots to swing, low roots to hang under | |
| 6-2 Flat Water | stealth | → | stay hidden | ripples show where something swims under; cross when it is far | |
| 6-3 Root to Root | vine_runner | → | keep swinging | the tide rises and falls: which roots you can reach changes on the beat | the tide |
| 6-4 Low Tide | sprint | → | cross the mudflats | the tide comes in behind you (built: tide zones) | |
| 6-5 The Spear | purge | → | chase the hunters out | food chain: lure the hunters to the caiman's water and let it chase them off | food chain |
| 6-6 Lights in the Roots | sprint | → | follow the light | Flicker's light in the dark roots (the light rule from World 3) | |
| 6-7 Through the Roots | vine_runner | ↓ | raise and lower the water | the built room; swim and dive down the root well | swim and dive |
| 6-8 Stilt Climb | ascent | ↑ | climb out | the tide rises under you (built: risingTide.ts) | |
| 6-9 Blackwater | gauntlet | → | fight through | swim, swing, tide and hunters together | |

- **Hidden stage: The Sunken Hollow**, found by diving to the bottom of 6-7's well (Matt 11-11: "a hidden world reached by swimming
  down to the bottom of a swimming area", R-165.80). The guarana lies at the bottom.
- **Guardian:** Marsh Reaver (built).
- **Engine pieces.** Exists: swim, tide, rising tide, swings, gen2 World 6 (8 stages), the firefly, Flicker. New: water placed anywhere
  (3-5 h), currents (3 h), diving under (10-20 h, high risk: breath, depth, art), predator against predator (6-10 h).
- **Art.** Only 128 best-fit pieces (62 to stand on, 3 danger looks). Missing: underwater rooms for the hidden stage, ripples, the hunters
  (no "hunter" by name in the catalog; check the cast with the Content specialist), a caiman chase pose.

### World 7, Ancient Ruins

**Story beat:** Pokey alone (no Dot in all of World 7, STAGE-RULES §1); the temple door open; ten stone chairs; the photograph; the Golem.
**Signature: break and push** (gives the claw punch a real job, as R-165.81 asks). **New rules:** floors fall; the temple is a machine;
alone.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 7-1 The Open Door | sprint | → | go in | cracked tiles fall if you stand still (built: World 7's tile lesson) | falling floors |
| 7-2 Brown Vines | ascent | ↑ | climb the old walls | brown vines snap a moment after you grab them | |
| 7-3 Ten Chairs | relic_hunt (4) | → | search the courtyard | each relic you find turns a chair and opens a new part of the courtyard | the temple machine |
| 7-4 The Way Up | ascent | ↑ | climb the temple | the floor drops into the slide (the built set piece, kept) | |
| 7-5 Stone Sentries | purge | → | clear the halls | sentries can't be punched: break the cracked pillar onto them | punch breaks stone |
| 7-6 Falling Floors | sprint | ← | run before it crumbles | the collapse chase from 1-8 comes back, through the halls, running LEFT | |
| 7-7 The Photograph | relic_hunt (4) | → | search the ruins | timed stone doors and seed-key gates; the Thorn Gate (built) | timed doors |
| 7-8 The Upper Temple | ascent | ↑ | climb to the top | push blocks to build your own steps; break the ceiling from below | |
| 7-9 The Golem's Hall | gauntlet | → | fight through | falling floors + doors + sentries together | |

- **Extra (built): S-1 Thornbark** through 7-7's Thorn Gate. **Hidden stage: Under the Ruins** (planned in SECRET-LEVELS.md: dark tunnels
  under the net, Pokey pushes a note up to Meeca). **Opened by** the guarana in 7-3's courtyard: picking it up cracks the floor by the
  ten chairs (SECRET-LEVELS: "a cracked floor where a faint sigil still glows").
- **Guardian:** Stone Idol Golem (built).
- **Engine pieces.** Exists: crumbling tiles (gen2 World 7), the slide, gates and plates (puzzleKit.ts), push logs and boulders, the secret
  gate. New: breakable blocks (4-6 h), timed doors (the goal clock from World 5), a find that changes the room (3-6 h), breakable ceilings
  (4-6 h), pushing to crush and to hold switches (4-6 h), vines that snap (2-4 h, **my judgement**), Under the Ruins (16-30 h, mostly art).
- **Art.** 177 best-fit; 107 are made things (fine here: the ruins are built). Missing: cracked and broken states of stone, turning
  chairs, the tunnel set for Under the Ruins (SECRET-LEVELS lists it), brown vines snapped.

### World 8, Twilight Treetops (Act III, The Iron Road)

**Story beat:** the light goes; fireflies show the way; night blooms; the Lantern Run (8-4); Dot back with news of Meeca's window.
**Signature: swing and fling** (the claw-lock pendulum, R-165.79). **New rules:** night, carried light; things there only when lit;
swing chains.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 8-1 As the Light Goes | sprint | → | keep going | dusk to dark across the stage: the light drops as you go | |
| 8-2 Night Blooms | harvest | → | gather night blooms | blooms open only in light; moonlit branches fade in and out on a beat | lit-only things |
| 8-3 Long Swings | vine_runner | → | swing the treetops | let go at the top of the swing to fly far | swing and fling |
| 8-4 Lantern Run | sprint | → | carry the jar | the built special stage, kept (w8Lantern.ts) | |
| 8-5 Next Branch | vine_runner | → | branch to branch | swing chains with no ground: fling, catch, fling | |
| 8-6 Glide by Moonlight | sprint | ↓ | glide tree to tree | glide down through the dark, moonbeams light the landings | |
| 8-7 The Tallest Tree | ascent | ↑ | climb to see | climb with the jar: its light drains, fireflies refill it | |
| 8-8 Night Hunters | purge | → | drive them off | food chain at night: lure the hunters into the owl's light | |
| 8-9 Monarch's Wood | gauntlet | → | fight through | dark + fling + lit-only branches | |

- **Hidden stage: The Moth Lights**: lead a swarm of moths through the dark; they light the way, and lose them and it goes dark (reuses
  World 2's followers and World 3's light). **Opened by** the guarana at the top of 8-7.
- **Guardian:** Night-Wing Monarch (built).
- **Engine pieces.** Exists: the Lantern Run and its jar meter (lantern.ts), the light ring, gen2 World 8 (7 stages), long swings, glide.
  New: the fling (4-8 h, **my judgement**: it changes reach, so the arc is flown first); lit-only platforms (1-3 h on World 2's beat
  family); moths that act (6-10 h).
- **Art.** Only 114 best-fit pieces (42 to stand on). Missing: moonlit/unlit states of branches, moths (none in the catalog by name),
  Pokey's fling pose.

### World 9, Volcanic Jungle

**Story beat:** hot, peppery air; the Drake ("Visitor." then "Intruder."); Pell's dropped thread (stagePlan.ts:125-133). **Signature:
hot-air ride** (built: glide.ts ventLift; HANDOFF: "hot-air lift in World 9"). **New rules:** heat; rising lava; crust floors on a beat.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 9-1 Pepper Air | sprint | → | run through | heat: hot rock warms you if you stand on it; shade cools you | heat |
| 9-2 Rising Heat | ascent | ↑ | climb the ledges | lava rises under you (World 6's tide, now lava) | rising lava |
| 9-3 Ember Canopy | vine_runner | → | swing over glowing rock | vines smoulder and drop a moment after you fling off them | |
| 9-4 The Drake's Doorstep | stealth | → | stay out of sight | the Drake's gaze sweeps like the eagle's shadow, and it remembers you ("Intruder.") | |
| 9-5 Vent Riding | sprint | ↑ | ride the hot air | open the leaf over vents and rise | hot-air ride |
| 9-6 Ash Fields | purge | → | clear the hunters | break boulders onto them, lure them into the geysers (geysers on a beat, built) | |
| 9-7 Lava Steps | ascent | ↑ | climb the steps | crust floors harden and melt on a beat | crust floors |
| 9-8 Pell's Thread | relic_hunt (4) | → | find the thread | the thread runs through the vents: follow it up and down | |
| 9-9 The Drake's Hoard | gauntlet | → | fight through | heat + lava + vents together | |

- **Hidden stage: Up the Vent**, a long ride up a vent shaft where the screen scrolls up on its own (World 2's auto-scroll, World 4's
  rising ride). **Opened by** the guarana where Pell's thread ends in 9-8.
- **Guardian:** Magma Drake (built).
- **Engine pieces.** Exists: geysers (zones.ts), the vent lift, rising tide, crumble and regrow. New: the heat rule (2-4 h on the general
  meter); crust floors (1-3 h on the beat family); lava as rising water (1-2 h); the gaze sweep (2 h on the shadow). **Cheap in engine:
  World 9 is mostly reuse.**
- **Art.** 135 best-fit, but **40 need fixing** (and the skull dressing comes out, R-165.102). Missing: crust states (solid, glowing,
  molten), smouldering vines, the vent shaft.

### World 10, Stormy Highlands Fortress

**Story beat:** the door in the netting "exactly your width"; the thousand steps; thunder; the walls; the General (stagePlan.ts:136-144).
**Signature: hold on** (R-2.7, teach in 10-3 and 10-4). Pokey "holds on to things when it thunders" (story keeper §2): the move is the
story. **New rules:** lightning on a beat; gusts that tear you off unless you hold; everything at once.

| Stage | Mission | Way | Classic job | Twist | Teaches |
|---|---|---|---|---|---|
| 10-1 The Door Made for Him | sprint | → | go through | a quiet stage (journal QUIET_STAGES): a breath before the end | |
| 10-2 The Thousand Steps | ascent | ↑ | climb the steps | lightning rods charge, then strike their column (built: bolts) | |
| 10-3 Thunder | stealth | → | hold on, stay hidden | hold on when the flash comes, or the gust takes you | hold on |
| 10-4 Holding On | ascent | ↑ | keep climbing | hold on during the climb | |
| 10-5 Halfway Up | ascent | ↖ | climb and listen | a switchback climb, running left as it rises (so 10-4 and 10-5 don't feel the same, **my judgement**) | |
| 10-6 The Iron Netting | vine_runner | ← | swing the netting | swing and hang under the netting, running LEFT; Dot and Flicker guide (GAP-MAP) | |
| 10-7 The Walls | purge | → | clear the walls | every World's trick on the walls: break, lure, push, the moat | |
| 10-8 The Last Steps | ascent | ↑ | the last steps | vents, hold, fling: three and four at once | |
| 10-9 The Fortress Gate | gauntlet | → | fight through | everything | |

- **Hidden stage: Pokey's Own Road**: at totems along the way, pick one of three cards (a climbing one, a jumping one, a swinging one) and
  that stretch builds in front of you, from every world's bricks (R-165.98, Matt 11-11: "players build their own path"). **Opened by**
  the guarana in 10-8. Why here first: it is the riskiest piece (12-20 h, high risk, CAPABILITY §1) and needs every world's bricks.
- **Guardian:** General Iron-Claw (built). The hold is his fight's key (R-2.7: "the General's fight needs it").
- **Engine pieces.** Exists: bolts, wind, climbs, the boss. New: the hold rule (4 h) and its control design with hanging (2 h, R-146.5;
  today the hold is the mega punch, touchGestures.ts:12, so R-165.81 decides it first); the card pick (12-20 h).
- **Art.** 135 best-fit, **41 need fixing**, 89 made things (fine: a fortress). Missing: Pokey's brace and blown poses (R-2.7, about $1),
  the card totems.

---

## 5. Engine build order: one world ahead (hours from CAPABILITY.md; mine marked)

The rule (CLAUDE.md, D40): foundations first, then the thing, then polish. **Each world's new pieces are built while the world before it
is being laid**, and a piece that a planned job will replace waits.

| Phase | While this is laid | Engine builds (hours) | Running total |
|---|---|---|---|
| 0 Foundation | 1-1 finishes, 1-2 in build | generator yield up (R-165.120, 4-8 h); kit step 2 travel modes (6-10); kit step 3 verdicts by brief (6-8); kit step 4 gen2 lays up, down and left (8-12); shared brick library across worlds (4-8); help ladder for any stage (4-6); bots for any stage (3-5); one clock wired to the old timers (4-6, **mine**). Steps 2-4 wait for E0a and A2 to merge (ADR-003) | about 51 h |
| A | World 1 (1-3 to 1-9) | World 1's own pieces first (drop traps, crumble times, root tunnel, noisy landings, shadow, lanes, pursuer, zipline, golden finds), then World 2's: moving platforms, sinking pads, followers + "bring home", out and back, rising water, auto-scroll | +52 (W1) +47 (W2) |
| B | World 2 | World 3: hanging (R-160.1), the light meter, sleepers that wake, the slide and Dot's flight as modes on the one engine | +38 |
| C | World 3 | World 4: glide arcs flown, wind/updraft/rockfall bricks, the rising ride | +15 |
| D | World 4 | World 5: the vine leash, the goal clock, don't stop, bloom count | +28 |
| E | World 5 | World 6: water anywhere, currents, diving, predator against predator | +35 |
| F | World 6 | World 7: breakable blocks, the find that changes the room, ceilings, push to crush and hold, snapping vines, Under the Ruins | +29 |
| G | World 7 | World 8: the fling, lit-only platforms, moths | +16 |
| H | World 8 | World 9: heat, crust floors, lava, gaze sweep | +9 |
| I | World 9 | World 10: the hold rule, the card pick | +22 |
| | | **Engine total** | **about 340 h (range about 240-450)** |

**The top three to build next**, in order: (1) **raise the generator's yield** (R-165.120): today gen2 lays a clean 1-1 from a fresh seed
2 times in 120, and every stage after inherits that; (2) **the travel mode, kit steps 2-4** (20-30 h): 1-4 is a climb and gen2 throws on
climbs today (pipeline.ts:332), so World 1 cannot finish without it, and it unlocks every left, up and down stage after; (3) **the
followers / "bring them home" piece** (13-21 h): World 2's rescue stages need it, World 5's vine leash and World 8's moths are built on
it, so it is the most reused new piece in the map.

---

## 6. The work: hours per world, the total, and the timeline

**Where the per-stage number comes from (measured, not guessed):** C1's 1-1 re-lay took **6 h 04 m from start to pass, with two Critic
rounds** (STATE.md, 11-11 1:06 PM ET). 1-2's Designer packets took **1 h 37 m to attempt 4** (3:28 PM start, 5:05 PM ET, not yet passed).
So I use **about 8 h a generated stage** (packet + lay + review). Range 5-10 h: later stages of a world reuse its bricks and go faster;
the first stage with a new piece goes slower. C1 laid on a finished brick pool, so 8 h is the floor for a world whose bricks are new
(**my judgement**). Hidden stages, guardians, art and the lead's play review have no history behind them: **all my judgement**.

| World | Engine | Laying (stages x 8 h) | Hidden stage | Guardian port | Art (Content) | Lead review | **Total** |
|---|---|---|---|---|---|---|---|
| Foundation | 51 | | | | | | **51** |
| 1 | 52 | 8 x 8 = 64 | 16 | 3 | 8 | 3 | **146** |
| 2 | 47 | 72 | 16 | 3 | 8 | 3 | **149** |
| 3 | 38 | 72 | 16 | 3 | 8 | 3 | **140** |
| 4 | 15 | 7 x 8 + 2 kept set pieces x 4 = 64 | 16 | 3 | 8 | 3 | **109** |
| 5 | 28 | 72 | 16 | 3 | 8 | 3 | **130** |
| 6 | 35 | 72 | 16 | 3 | 8 | 3 | **137** |
| 7 | 29 | 8 x 8 + 7-4 kept x 4 = 68 | 16 | 3 | 8 | 3 | **127** |
| 8 | 16 | 8 x 8 + 8-4 kept x 4 = 68 | 16 | 3 | 8 | 3 | **114** |
| 9 | 9 | 72 | 16 | 3 | 8 | 3 | **111** |
| 10 | 22 | 72 | 16 | 3 | 8 | 3 | **124** |
| **All** | **about 340** | **about 700** | **160** | **30** | **80** | **30** | **about 1,340 helper-hours** (range about 950-1,750) |

**Plainly: this is a lot of work.** About half of it is laying stages, not engine. With the team running about five helpers at once
(one Engine one world ahead, two builders laying, Content on art, the Critic), a world is roughly **25-30 hours of wall-clock time**, and
the whole map about **270 hours of the team running**, before Matt's play-throughs (**my judgement**, from the helper-hours divided by five).

**The timeline (phases):**
1. **Now to 1-2 shipping:** finish 1-1 and 1-2; Phase 0 foundation (yield, travel mode, verdicts by brief); fix the app size budget
   (below). In parallel, World 1 pieces that do not touch the kit's files (drop traps, crumble times, crossers: ADR-003 says mechanic pieces
   can run in parallel).
2. **World 1 (1-3 to 1-9, Zipline Canopy):** two builders laying; Engine on World 2's pieces; Content on World 2's and 3's art lists.
3. **Then one world at a time,** each laid while the next one's pieces are built and its art is painted.

**What can run in parallel:** the Designer's packets (one world ahead of the builders); Engine (one world ahead); Content (one to two worlds
ahead: art takes Matt's approval and money); two builders inside a world (**at most two**: they share the world's brick file, w{N}.ts, and
more would collide, **my judgement**). **What cannot:** a world's laying before its travel and pieces exist (D40).

**The risks, biggest first:**
1. **Generator yield (R-165.120).** 2 clean stages in 120 fresh seeds on 1-1. Every stage that needs a seed list pays for that in rolls and
   curation time. If it stays low, the 8 h a stage goes up for every one of 86 generated stages. It is first in the build order for that reason.
2. **App size (R-165.99).** The build is 179 MB against Google Play's 200 MB; ten hidden stages and every new mechanic add art. This must
   be solved (packs or compression) before World 2's art lands, or the map does not fit on the store.
3. **Hugging Face money.** About $65.55 was left on 11-08 with $15 kept in reserve (CLAUDE.md), so about $50 for nine worlds of new art.
   That will not paint it all: Matt's own sheets carry the rest (CLAUDE.md, Polish). The thinnest worlds (3, 5, 8, 10) go first.
4. **Moves that change reach** (hanging, the vine leash, the fling, diving): each one moves every jump check and must be flown and judged
   on its own (ADR-003 decision 5). Each is a medium-to-high risk piece.
5. **The hold button is taken.** Hanging (World 3) and holding on (World 10) both want the hold, which is the mega punch today
   (touchGestures.ts:12). R-165.81 must be decided before World 3's pieces start.
6. **One world ahead can slip.** If a world's pieces are late, its builders wait. The fix is the order above: the next world's pieces start
   while this world is still being laid, never after.

---

## 7. Gen2 or hand-made, in one place

| | Generated (gen2) | Hand-made | Already built |
|---|---|---|---|
| Core stages (90) | 86 | 4 set pieces: 4-3, 4-7, 7-4's slide, 8-4 | 1-1 (gen2, done) + the 4 set pieces |
| Guardians (10) | | 10 (one arena shell from data, buildBoss) | all 10 |
| Hidden stages (10) | | 10 (some reuse a mode: the slide, auto-scroll, the rising ride) | none |
| Extras (3) | | 4-D Dot's Flight, 5-M Meeca, S-1 Thornbark | all 3 |
| **Total 113** | **86** | **27** | **18** |

Puzzle rooms are hand-made bricks inside generated stages (STAGE-RULES §3: two or three per world), not stages of their own.

---

## 8. Questions for Matt (one at a time; my recommendation first)

1. **1-8 The Long Branch: lanes or the collapse chase?**
   - (a) **Keep the branch-collapse chase in 1-8** (built, chase.ts) and debut the crossing lanes in World 2's river. **Recommended**:
     World 1 stays classic, the lanes become World 2's own new thing, and World 1 sheds about 10 h of new engine.
   - (b) Lanes in 1-8 as in the World 1 draft; the river rides them in World 2.
   - (c) Both in 1-8: lanes first, then the branch collapses.
2. **Where does Pokey learn to hang under branches?**
   - (a) **World 3, under the grotto roof. Recommended:** World 1 already teaches eight moves and players are still failing the
     basics in 1-1 (ideas triage: 36 lives to raised pits), and World 3 needs a new move to feel new.
   - (b) 1-9, as the archetype list paced it.
   - (c) World 2, under the docks and bridges.
3. **Bringing the animals home: how soon do they come on a vine?**
   - (a) **Followers in World 2 (they hop behind you), the vine and tie-off posts in World 5. Recommended:** the simple follower is
     cheaper (13-21 h) and safe; the vine is 12-20 h at medium-high risk and changes Pokey's reach.
   - (b) The full vine straight away in World 2.
   - (c) No following in World 2; the vine only, from World 5.
4. **How much of Worlds 2-10 do we rebuild?**
   - (a) Re-lay all 89 on the new kit, keeping rooms, guardians, extras and art.
   - (b) **Re-lay Worlds 2-5; check Worlds 6-10 against this map and re-lay only the stages that miss their twist. Recommended:**
     you played Worlds 1-5 and found them "basically just run and jump" (STAGE-RULES §0); Worlds 6-8 were rebuilt in gen2 later, so
     some stages may already carry their twist. It could save about a quarter of the laying (**my judgement**, not checked yet).
   - (c) Only re-lay the stages whose twist changes.
5. **World 5's "don't stop" rule (stand still too long and Pokey sits down to admire the view)?**
   - (a) **Yes, as World 5's hurry rule. Recommended:** it is the story's own joke ("POKEY. DON'T SIT.", stagePlan.ts:80) turned into
     play; the story keeper checks it first.
   - (b) No; World 5's clock is only the closing orchids.
6. **The pick-a-card road (R-165.98): where does it start?**
   - (a) **World 10's hidden stage first, then card totems in later stages if it plays well. Recommended:** it is the riskiest piece in
     the map (12-20 h, high risk) and works best once every world's bricks exist.
   - (b) A few totems in normal stages from World 3 on.
   - (c) After launch.

---

## 9. Sources, and what I could not back

- Stage names, missions, story lines: src/game/stagePlan.ts:31-146. Skills: src/game/skills.ts. Timed zones per world: src/game/zones.ts
  (spores 3, wind 4, webs 5, tide 6, crumble 7, dark, geysers 9, bolts 10). Guardians: src/game/bossDefs.ts (all 11 built).
- Built specials: chase.ts (1-8), dotFlightStage.ts (4-D), meecaStage.ts (5-M), w7SlideRun.ts (7-4), w8Lantern.ts (8-4), secret.ts (S-1).
- What the engine can do and the hours: CAPABILITY.md §1-§5 (t-architect-capability@72ffb886); the kit: ADR-003 (t-architect-stagekit).
- Generated stages today: gen2/game.ts:86-93 (5-7, 5-9, World 6 x8, World 7 x6, World 8 x7) plus 1-1.
- Art counts: src/game/art/inventory/w1..w10.json on t-engine-inventory@621a3d2b, rows whose best world is that world (world_best),
  by layer; "missing" items are my reading of what each twist needs, for the Content specialist to confirm against the catalog. No
  Hugging Face job was launched.
- Matt's ideas used: the 30 ideas (#2 followers, #8 meter, #9 moths, #11 lagoon, #21 food chain, #28 cards, #29 bloom), the 80s list (3
  mud pits as crust, 4 snap-jaw stones, 9 rising ride, 12 drop traps, 16 a find changes the layout, 23 timed doors, 27 break ceilings),
  the archetypes (1 shadow, 3 flood, 6 raft, 7 sinking pads, 8 push, 9 bounce chain, 10 rotting boughs, 12 pendulum, 16 hollow, 19 race
  back, 22 sound stealth, 24 zipline). Parked ideas stay parked (mirage platforms, shrink/grow, time-only-when-you-move, mimic forest).
- **My judgement, not backed by a file:** every hidden stage's idea except Zipline Canopy, Under the Ruins and the Sunken Hollow; the
  "don't stop" rule; the glow trail; the two-parts-of-the-recipe neighbour rule; hours marked "mine"; the hours for hidden stages,
  guardian ports, art and review; the wall-clock estimate; "at most two builders a world".
