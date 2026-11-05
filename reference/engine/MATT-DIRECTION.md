# Matt's direction for the engine (his words; the level designer designs from this, the lead checks against it)

## 2026-11-05 ~12:05 AM ET
"So how do I make sure that pieces are being used and it's being done in ways that real platformers are built? When we first started
off, we were doing really good. And we really hit a wall the last week or so. But the first stage is the best stage in the game. It
needs tweaked to be able to be created under a generator, but that's how the generator should be designing things. Not having 16
bridges linked where you just jump from them. It should be having a huge set of platforms to pick from, different sizes, laid out
different ways, going up, different branches that you can take, one going higher, one going lower. Everything we do is all or
nothing."

Earlier the same night:
- "the beats were more of how the player played, not so much with the music... you set the jumps up so that a player can get into a
  rhythm, not so much that the rhythm has to go with the song."
- "the whole point was to make the engine not based upon what we already have, but what the best way of doing it."
- On the rebuilt five: "on level 5, it's just run over the cracking logs. Nothing else... You don't mix any platforms into it. It's not
  a variety. Like, at least we used to have the lily pads and everything else."
- "the designer has full say in how the pieces get used and how the engine gets built."

## 2026-11-04 ~11:1x PM ET (said to the planner directly)
"I liked all the pieces... They all looked good. They all played well. They were redundant."
So today's pieces (logs, bridges, boughs, snap twigs, vines, stumps, rotten branches, the climb and the split) are KEPT in the
engine's library, look and feel included. The fault is the mix, not the pieces. The engine's first job is mixing them so no stage
repeats.

## 2026-11-05 ~9:40 AM ET (Matt to the planner)
- "There needs to be various randoms placed into the engine, such as speed of the level, the looks of the level, what's in the level,
  how it branches, if it branches, if there's water."
- "We shouldn't have lily pads on branches."
- "We need all this in the engine so that when we have multiple people making things... 80% of the level is done with the engine. And
  they just need to clean up, not overhaul everything."
The build answer: a stage is data (a spec with its feel profile and node plan); a tagged idea library with an element gate and a real
water zone; pass lines from each stage's profile plus a neighbour feel check; one command per stage.

## 2026-11-05 ~9:15 AM ET (Matt to the designer)
Matt asked whether each stage's feel is explained from the story. Now a rule: every stage spec opens with its story beat and how it
should feel, before any node is laid (1-1: Pokey has just left home, slow but vowing to come; a small, determined start that grows
into the first climb, ending in the high branches with the bootprint clue; the view north stays 1-4's).

## 2026-11-05 ~2:16 AM ET (Matt played the mixer's 1-5 on his phone)
"It played much better. Needs polish.. was kind of ugly... Example" (reference/engine/cp3/matt-1-5-mixer-0216.png, upright).
In the still: a thin grey slab floating over the water with nothing under it (D16); the bank ends in a hard straight cliff; the
foliage band ends in a hard straight line over the pond; a large empty area above the play line.

## 2026-11-05 ~1:05 AM ET (to the lead)
"minimum 2 minutes, but if it goes over 5, I'm okay with that too. It varies. And it should vary the length of stages. 2 minutes is
the minimum."
- Every stage at least 2:00 for a skilled player straight through; no upper cap (over 5:00 is fine); stage lengths vary across a world.

## 2026-11-05 ~12:50 AM ET (to the lead)
"let them know they have Hugging Face if they need to get more stuff. And for platforms and other things, I can run that on Gemini
too. But I would prefer Hugging Face first."
- "this also goes for hills and other little areas to jump up on. So it's not just logs, it's anything that will add to the platform
  type experience." Every platform family gets kinds and sizes: logs, and ground shapes (hills, mounds, rises, steps, ledges,
  little perches).
- New pieces can be made on Hugging Face: a picture list with its cost goes to the lead for approval first (PARTNER: the lead
  approves HF spend; $72 total, about $15 kept in reserve). Gemini only as the fallback for platforms and pieces, run by Matt.

## 2026-11-05 ~12:23 AM ET (to the planner and the lead)
- "same thing goes with enemies... once you introduce them, they can be anywhere": an enemy, once taught, may appear in any world
  where it fits (World 5 aside), like the pieces.
- "look at the library of art and see what we've created that's not been used. Because I'm afraid there's a lot." / "I know we've
  made other enemies and other things that we've never touched, other platforms, other things, and I don't want anything missed."
  The inventory: reference/engine/unused-art/IN-GAME-UNUSED.md (273 packed pieces nothing draws) and NEVER-PACKED.md (art never
  packed, in progress).

## 2026-11-05 ~12:20 AM ET (to the planner)
"intermix the different worlds if you have to with the arts... if you have other stages where putting logs into it makes sense, use
it from world one. Make as much and take as much as we can out of what we have. The only one that really plays differently is world
five. But I can see intermixing art all over the place. Different platforms and different pieces."
- Pieces and art are shared across worlds wherever they fit. World 5 is the one world that plays differently.
- The lily pads Matt remembers are from the control test (the testers' course, protoStage.ts:2423-2426) and World 2; no World 1
  stage on main has them.
- Matt asked the planner to hold new work after this (CP2's trace check paused, ~12:20 AM ET).

## 2026-11-05 ~12:15 AM ET (to the lead)
"the pieces should all fit together. That even if it goes random, they should all fit together. We shouldn't have anything that is
so weird that it feels out of place. Other things to look for is that hearts aren't given out the very first thing. You know, if
you're not going to lose a heart, don't put a heart there. You don't need to gain health back if you're not going to lose a life.
Checkpoints, reasonable. So, we don't have to have checkpoints everywhere if you're not going to use them. Collectibles. Where they
make sense. If we want things to be hard for some collectibles, we need to have them in hard places. It should feel good playing it.
It shouldn't just be a cluttered mess."
- **Fit**: every piece in a world's kit fits with every other, so any roll looks like one place. Nothing out of place.
- **Hearts**: a heart only where the player can have lost one, after real risk. Never at the very start, never where nothing can hurt.
- **Checkpoints**: where they'll be used, before the hard parts. Not everywhere.
- **Collectibles**: where they make sense. A hard-to-get collectible sits in a hard place, so getting it feels earned.
- **Feel**: it should feel good to play. Not a cluttered mess.

## 2026-11-05 ~12:10 AM ET (to the lead)
"The one thing that you're missing is that the levels are built to go along with the story. So they are themed, but a whole world
should have its own pieces. So having themes shouldn't make that big of a difference. And varied is, I just don't want pieces thrown
together. I want it to make sense. Nodes that, you know, make sense."
- Stages follow the story; each stage has its story beat and theme.
- Each WORLD has its own set of pieces (its kit). A stage's theme shapes how it looks and what it's about, but variety comes from
  the world's kit, so the theme alone shouldn't make a big difference.
- Variety must make sense: no pieces thrown together at random. Each node is a coherent idea: its pieces belong together and to the
  place, and lead into each other in a way a player understands.

## 2026-11-04 ~11:5x PM ET (to the planner)
"Maybe the best level was 1-3. I think 1-2 was broken... but it branched out."
So today's 1-3 is a second reference beside the old 1-1, and 1-2's branching shape is kept as a piece. 1-2's known break: drops to
the ledge below respawned him (R-164.1, D33); the planner is asking Matt if there is more.

## The reference: the OLD 1-1 (live on main), Matt's best stage
The generator is aimed at the way the old 1-1 is built, not the rebuilt one. It is the bar every generated stage is measured against.

## How Matt can check it (the checks the lead runs; the designer decides how to meet them)
1. **The old 1-1 measured as the baseline** (first checkpoint): its count of platform kinds and sizes, the spread of sizes, how far
   it climbs and drops, how many places the route splits (higher / lower), the longest run of the same piece in a row, and how
   often something new appears. Every generated stage must match or beat those numbers.
2. **The piece library shown first**: one sheet of every platform and piece the generator can pick, in its sizes and kinds,
   before any stage is built from it. "A huge set of platforms to pick from."
3. **Side-by-side map**: each generated stage's layout drawn as a plain top-down/side map next to the old 1-1's, so the mix, the
   climbs and the high/low splits can be judged in ten seconds.
4. **No all-or-nothing**: a stage fails if one piece makes up most of it, or if the same piece runs many times in a row (the
   thresholds come from the old 1-1's own numbers).
5. **Matt plays it** in grey-box against the old 1-1 / 1-2 before any art.

## 2026-11-05 ~9:45 AM ET (to the planner): the engine before 1-1
"I disagree with finishing 1-1. I think you need to get the engine... You should be able to finish 1-1 quickly if you get the engine
done right... Your job is to ensure this engine works well, not to design all the stages."
So 1-1 is parked (engine-mixer 72fe81a3) and the planner builds the engine first: regression lock on 1-5, stage as data, tagged piece
library, element gate + water zone, profile pass lines + neighbour check, one command per stage. Then 1-1 from data, then 1-2.

## 2026-11-05 ~10:00 AM ET (to the planner, then the lead): floating is allowed; every piece is labelled; pieces belong to their world
"Having floating objects are fine as long as it looks good and plays good. I don't mind having like a Mario type thing that floats.
Sometimes having everything anchored just is too much and it clutters the screen... it needs to somewhat be clean too."
"Somebody needs to go through and label when the objects are used, how they can be used, the props, the platforms, and what levels
they can be used on. It has to have a good cosmetic feel to it. They have to look like they belong in that world. It can't just be
using any piece from any world. And it has to be realistic. You can't have floating lily pads. I don't mind floating logs because
that's more Mario. But the lily pads should be more in the water... that's a priority to get the engine tied to things."
What this means for the engine:
- **The support rule is per piece, not global.** Each piece's label says whether it may float (logs, planks: yes, Mario-style) or must
  sit on what holds it in life (lily pads ON water only; stones in water need a base; roots grow from a trunk or bank). A clean screen
  beats anchoring everything.
- **Every piece and prop is labelled** in the tagged library: what it is, its element (ground / water / tree / air), whether it may
  float, how it can be used (stand, climb, hang, crumble, bounce, hide), which worlds and stages it belongs to, and what it teaches.
  The mixer may only pick a piece labelled for that world, and the element gate rejects a piece out of its element.
- **This is priority one in the engine work** (the planner's step 2-3), ahead of pass lines and the one-command build.

## 2026-11-05 ~10:08 AM ET (to the lead): the engine plans the WHOLE game, not World 1
"When all the special moves come in, how it needs to plan water when we start heading where you can swim. I don't think there's
anything in the engine that calls for water. And they should be quick in and out things. We already did the research on that. And how
to inject once we have special moves and we taught something, that it continues to go through the engine. The engine is the core. This
is where the time needs to be spent. This can't be rushed. It needs to be done right. It needs to be thought through. It needs to be
planned for how the game's going to play out. It can't just be looking at level one. Has to think through how is the whole game playing
and has to account for it. Once this is done, we should be able just to put 3 or 4 helpers on things and tell it to build stages based
upon what this stage is going to feel like, and they should know how to use this engine. And then it should just be cleanup afterwards.
That is your priority, to ensure this engine doesn't fail and we don't have another day like we did yesterday."
"And remember, most of the game works. It's just repetitive. Let's not break everything we've done. Let's build on what we've done
successfully. Continuous improvement."
What this means for the engine (the designer decides how; these are the bars the lead checks):
1. **A whole-game move and element plan, as data the engine reads:** every move (run, jump, double, bounce, climb, hang, swing, punch,
   glide, swim, slide and the rest) with where it is taught, where it first comes back, and how often it keeps coming back in every
   later world (taught once means it keeps running through the engine). Every world's elements (ground, tree, water, air), its kit,
   and its special stages. A gate fails a stage that uses an untaught move, or drops a taught one for too long.
2. **Water and swimming planned from the research** (GEMINI-VARIETY 2026-11-02 row "Water", R-5.22): no slow drag, in and out of the
   water every 15-20 s, wide clear exits, currents and bubbles, rising and falling water. Swimming is built (87f1e2f6, 6-7's root well).
   The engine declares water zones and swim stretches; in World 1 the water is drawing only, and where swimming is taught the engine
   lays swims as quick in-and-out beats.
3. **Build on what works, don't break it:** most of the game works and is only repetitive. The engine reuses the existing stages'
   pieces, sections, special stages, puzzle rooms, bosses and art, and adds variety to them. It's not a rewrite. The 1-5 regression
   lock pattern applies to every world it touches.
4. **Helper-ready:** when done, 3-4 stage helpers can each be handed a stage's feel brief (the lead's story brief plus the profile) and
   build it with the engine alone, with one command and the gates. Then it's cleanup. So the engine ships with its own how-to
   (reference/methods/), proved by one helper building a stage from it cold.
5. **Not rushed:** time goes here. The checkpoints and Matt's 55% ceiling still hold; a checkpoint shows progress, not a finished world.

## 2026-11-05 ~10:19 AM ET (to the lead): nothing is a guess; 1-1 and 1-2 test the ENGINE; fix the engine, never the stage
"There's been a million games that have been made. So we shouldn't have to guess about anything... We have hundreds of thousands of
words with even code put into it from Gemini on how to build things. We've done our own research on how to build things. Nothing's a
guess. This engine needs to be concrete. Needs to be right the first time. And we use 1-1 and then 1-2 as the test. How quick things get
made. If 1-1 takes too long and it still needs a lot of pieces fixed, the engine gets fixed. We don't just go into the stage and fix it.
That's how it has to get done. After the engine gets done, the level designers have the fun job because they get to put together
creatively how the levels get designed with the inputs and just put the polish on it."
"This engine literally is the game... Done right the first time. No redos on this... Nothing guessed. Nothing tunnel visioned."
What the lead holds everyone to:
1. **OPEN is not an end state.** Every rule and number is answered from shipped games (postmortems, talks, papers, code), the Gemini
   research (with its code) or our own research, or by a run on our code. "Designer's judgment" is never a source.
2. **1-1 then 1-2 are the engine's acceptance test.** Recorded for each: wall time and token cost from "stage data written" to "every
   gate green", and the count of fixes needed after the first build. A stage is fixed only by changing its data file (story, profile,
   plan) or the engine. Any stage-specific code or hand edit in the engine fails the test (a check: no stage id in the mixer core). Too
   slow, or too many fixes: the engine is changed and the stage rebuilt from data.
3. **After the engine:** stage helpers (level designers) compose stages creatively from the inputs and polish. They don't build
   machinery.

## 2026-11-05 ~10:32 AM ET (to the lead): no token ceiling today; it takes what it takes
"It takes what it takes today. This needs to be done right. And I'm not going to rush or shortcut token-wise getting this engine
right. This is too important. The whole game is this engine... This engine fails, the game fails. Period. This is, today is make it
or break it."
So: the 55% ceiling is lifted for the engine. Option (A) existed only because of the budget, so the order goes back to right-first:
the critic, then the designer's rulings, then step 6 (the whole-game worlds and ladder data and the gates over 102 stages), then 1-1 from data as the
timed test, then 1-2 from data as the second test, today. The deadlines and checkpoints stay (accountability, not budget); the 1-1
pass line's cost line stays as an engine-quality measure (one third of 1-5's 5.2 h / 9 rounds). Not a licence to waste: every
step still reports its cost, and the meter is still read at each checkpoint.

## 2026-11-05 10:39 AM ET (to the lead, on a floating boulder in a still): rocks never float
"Why does the one picture in the middle have a floating rock over the lily pad? That's the polish." "Rocks can't float. That
doesn't look good in the game. I understand the floating logs, because that's kind of the core mechanism of the platforms. A
platform needs platforms. Rocks shouldn't be floating."
So: every rock, stone, boulder, mound and earth piece is labelled may float = NO, always, in every world; it sits on ground, a bank,
the bed of the water, or its own base. Floating is for platform pieces (logs, planks and the like), under the float cap. The
engine's support check fails a non-floating piece with open air under it.

## 2026-11-05 10:42 AM ET (to the lead): the lead approves Hugging Face for the engine
"If anything needs a Hugging Face approval, you approve it. I've been approving them so far, but if they need it for the engine, it
gets approved."
So: art the engine needs (a missing piece, a platform kind, a world's fit) is approved by the lead without asking Matt. The lead
still checks each picture list (Hugging Face first, unused art before new), keeps the money inside what's left of the $72 with about
$15 in reserve, and tells Matt what was spent.

## 2026-11-05 11:05 AM ET: MATT APPROVED the engine's shape (the designer's critic ruling 5)
One rulebook over all builders: the engine is the stage spec, the labelled library, the whole-game move and water plan, and every gate,
and every builder works under it; each stage names its builder. gen2 keeps its 23 stages, hand-built specials stay hand-built, and the
mixer takes a stage only where it is proved better under that world's regression lock. Every stage, whatever builds it, passes the
same gates (labels, support, rocks never float, the ladder, water, variety via era.ts, look-alikes); a fail is fixed at the root (law 22).

## 2026-11-05 11:11 AM ET: Matt's answers to the designer's two questions
1. "Do the big set pieces (the 1-8 chase, the 1-9 boa, the snake ring) come back later?" Matt: **"Yes."** They are not exempt from the
   ladder: the set piece is not copied, but its idea returns later as a twist in that world's own art (the designer's option c).
2. "Who picks which small extra pieces and art get made?" Matt: **"You."** The lead picks (with the designer's list and reasons as the
   input), inside the Hugging Face money, and tells Matt what was made and spent.

## 2026-11-05 11:12 AM ET (to the lead): bad art is replaced, not patched
"If we have bad art, get rid of the art. Spend the dollar or whatever it takes to get a better background and use that. We do not need
to put time and work trying to fix background pictures when we can just craft one quickly that'll fix it."
So: a background or piece with a defect painted into it (clutter, seams, cut edges, smears) is remade fresh on Hugging Face and the
old one is removed, never inpainted, cross-faded or masked. The lead approves the spend (Hugging Face first), inside what's left of the
$72 with about $15 kept back.

## 2026-11-05 11:25 AM ET: MATT PICKED THE SWIM SPEED: 1.25x his run
"I thought he swam faster than he ran. So I would think that he would swim 1.25 his original speed."
So clean-water swimming is 1.25 times Pokey's run speed (today 0.53x, swim.ts:35), everywhere he swims (W6-W8, W10). The research's
option C, and real sloths do swim faster than they climb. "Suddenly fast" needs long water: 6-9's swim beats are long (3,500-5,000 px).

## 2026-11-05 12:31 PM ET: MATT PICKED THE CRUMBLE: the faster one (0.5 s)
"I like crumbling #2 which looks faster." (the 0.5 s clip, against today's 1.1 s)
So the designer's P7 stands: on Normal a crumbling piece gives way 0.5 s after he lands (Celeste Classic's timing), comes back after
2 s, and a required one is whole on respawn. Its first appearance keeps the calibrated teaching margin (P7). Easy's timing comes from the bots'
calibration, never guessed.

## 2026-11-05 12:40 PM ET (at 60% of the week): core engine now, polish next week
"So some of this may have to get pushed to next week and we get the core engine in there so we can do multiple levels over the next
couple of days and really test it out. The polish that goes on things can all happen next week."
CORE (now): engine-core on main; footingOf + E3 support check; the per-roll tempo fix and the stage-specific code made data; the
W1 gameplay fixes (crumble 0.5 s, 1-5 Easy, 1-1's lost-life spots); step 6 (whole-game ladder and water data + gates); E4/E5 (pass
lines, neighbour check, one command per stage); then 1-1 and 1-2 from data, then more stages over the next days to test it.
POLISH (next week, nothing cut): new art and repaints (1-1 sunrise, creek repaint finish, rotten wood, side branch, kin pieces, keyscan
remakes), render-stone, gen2-water and the swim speed, pieces 5-9 and the crate/seesaw fixes, the picture sheet's presentation,
bootprint re-shoot.
Matt, 12:40 PM ET, clarifying: "when I mean the polish, I mean redoing the pictures and backgrounds and other things like that. We just need to
really focus on getting the engine done and then getting more levels done over the next few days."
So POLISH = new or redone pictures and backgrounds (art). Gameplay pieces (root gate, secret tunnel, bat, stalactites, crate/seesaw
fixes) are engine content: paused today for budget only, they resume as the levels that need them are built over the next days.

## 2026-11-05 01:20 PM ET (to the lead): approve what starts the game; later worlds go on the roadmap
"So anything that we would use to start the game, we can approve it. If it can wait the next week because it's on like a later world,
then it can go in the roadmap."
So: the lead (with the designer) approves what the opening of the game needs now (the engine, World 1, 1-1 and 1-2) without asking
Matt. Anything for a later world goes on ROADMAP with its R-id, held to next week. Applied at once: the belly slide (taught in W2) is held
to the roadmap; the under-bough hang is approved for W1 (Matt's PLAN-TO-80).
