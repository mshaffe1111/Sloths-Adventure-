# Matt's direction for the engine (his words; the level designer designs from this, the lead checks against it)

## STANDING RULE, 2026-11-05 ~10:49 AM ET (to the planner, in his words): binds the planner and every engine step

"DO NOT HALF ASS ANYTHING! DO NOT GO FAST OVER DOING IT RIGHT!!! Write that down and do not mess this up."

And just before it: "The answer isn't cutting... It's making it right. Cutting IS NOT RIGHT." Also: "This engine's the most important part
of this game. We cannot mess it up... If this engine fails, the whole game fails."

What it means for the planner, every step:
- **Never cut scope or a check to make a time or a budget.** When something takes longer to do right, the deadline moves, and the lead is
  told early and why. The bar never moves.
- **Never ship a guess.** Every label, rule and number comes from the designer, the research, a measurement of our code, or Matt.
- **Look at every result before it's reported:** every still, every table row, every gate output. Something rough or unproven is named
  plainly, never hidden.
- **Cover the whole game, not one world.** Every world, every piece, every prop.

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
