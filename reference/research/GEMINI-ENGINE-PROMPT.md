# Prompt for Gemini (highest setting), 2026-11-04: the stage-building engine

Copy everything below the line into Gemini.

---

I'm building a phone platformer and I need deep, cited research plus original design thinking on ONE question: **what is the best
architecture for a level-building engine that gets about 80% of every stage right by construction, so each new world, stage and
rhythm is only a small change in data?** Please research how shipped games actually do this, think beyond the obvious, and be
concrete enough that a programmer could start building tomorrow. Where you are guessing, say so.

## The game (facts; please don't invent others)
- "Sloths Rainforest Adventures": a 2D side-scrolling platformer for phones (Android via Google Play, also a web build). TypeScript,
  2D Canvas, moving to PixiJS (WebGL). The game loop is locked at 30 fps on purpose. Every stage must play in portrait and landscape.
- Touch only, one thumb: flick up to jump, flick again in the air for a double jump, slide down to drop, plus punch, kick and stomp.
- 10 worlds x 10 stages (stage 10 of each world is a boss). Easy (kids 7-12) and Normal. A stage should take 2-2.5 minutes minimum for
  a skilled player and 3-5 minutes for a first-timer.
- The hero, Pokey, is a sloth; Dot, a hummingbird, gives short tips. Mechanics in the game today: run, jump, double jump, mushroom
  bounces, vines (swing and climb), ropes he hangs under and shimmies along, breaking, creaking and rotten branches, wind (World 4),
  slow-downs (mud, silk), water and swimming, lifts and pulleys, small puzzle rooms, and animals with one trick each (a snake you
  punch to daze then stomp, a coiled boa you must kick, an eagle whose shadow locks on, a stalking cat, spiders, a monkey that throws
  fruit). Collectibles: petals (the stage goal), hidden finds, golden seeds.
- Each stage has its own music. Today we started placing jumps on the music's beat: a "beat tracer" simulates the sloth's real jump
  physics on the stage's BPM and puts each platform where his feet land, then checks a clumsy thumb (late, early, less air control)
  still makes every landing.

## The problem
- The owner played the whole game and rated it 55/100: "as I go through the world, they all play the same. Same patterns, same
  layouts." Our worlds 1-4 were hand-built; worlds 5-10 come from a generator that rolls many random layouts and keeps the ones that
  pass checks ("curation"). Both feel repetitive.
- We build with an AI coding assistant that is paid per token. Every round of "build a stage, test it, it fails, rebuild" is very
  expensive. Five hand-built stages just cost far too much; 85 stages remain. We need stages that come out right the first time.
- We already have a headless checker that turns a stage into a string of moves (J jump, V vine, B branch, W wind, S slow, C climb,
  P puzzle), flags repeated 3-4 move runs, measures similarity to earlier stages (we use about 45-55% as the limit), dead walking
  over 2.5 s, pacing, and whether something actually costs the player when they miss. And a "first-timer" bot that plays the stage.
- Our earlier research recommended: rhythm groups (Smith et al.) with rests between them, a four-part Kishotenketsu arc per stage,
  a BPM per world with placements on beats, a tension-and-release curve over 6-8 nodes, map shapes (loop-back, high/low split,
  chimney, hub and spoke), parameterized puzzle blueprints, world-wide rules ("mutators"), cause-and-effect between stages, enemies
  bound to platform roles, three ways to beat every boss. We agree with most of it. What we lack is the ENGINE that turns it into
  stages without hand-tuning.

## What I want from you
1. **How shipped games really do it, with sources.** For example Spelunky's room templates, Dead Cells' hand-made rooms inside
   generated layouts, Rayman Legends' music levels, Celeste's screen design, Downwell, Rogue Legacy, Super Mario Maker's grammar,
   Hades, Ori, and academic work (Smith's Launchpad, Tanagra, the "Rhythm-Based Level Generation" paper, grammar-based and
   constraint/answer-set generation, wave function collapse for platformers, Mario AI framework). What exactly did each one put in
   data and what in code? What failed for them?
2. **Three truly different architectures** for our engine, plus **one wild card** that neither we nor typical research would
   suggest. For each: how it works, what is data and what is code, how a new world/stage is added, how variety is guaranteed (not
   hoped for), how difficulty and fun are guaranteed by math, its weak points, and its cost to build.
3. **The formulas.** Concrete, with numbers we can start from: stage length from nodes; action density per part of the curve and per
   difficulty; gap sizes as a share of jump reach (Normal vs Easy); enemy spacing and count per minute; pickup placement (we use 70%
   on the shared path, 15% on each road of a split; goal 75%); repetition limits; fall damage; how difficulty should rise across a
   world and across the game; a measurable "fun" or "flow" score if research supports one.
4. **Data formats.** Show example JSON (or similar) for: a world profile, a stage spec (about 20 lines), a section/template, and how
   the generator combines them with a seed. Show one full worked example: one stage spec and what the generator would produce.
5. **How to make the engine cheap for an AI coding assistant to work on.** What to build first, how to test it so problems are
   caught by tests not by people, how to make generation deterministic and explainable, how to keep each piece small.
6. **What our research missed.** At least five ideas, risks or techniques none of the above mentions, especially for a phone
   game with touch controls.
7. **A recommended plan** in phases, with the first small win we can measure in one day, and how we will know the engine is working
   (variety, difficulty, fun, and cost per stage).

Please be honest where something is unproven, cite sources for facts, and prefer ideas that are simple to build and test over
clever ones that are hard to verify.
