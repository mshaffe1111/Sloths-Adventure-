# The engine going forward (new lead, 2026-11-05, draft 2, supervisor-reviewed)

Sources: three fresh audits made today (gen2 on main; today's work on 8 branches; everything Matt asked for or the research
recommended that is not built), plus R1-R4. File:line evidence is in the lead's audit notes; the claims here are checked against
the code before each one is built.

## The decision
**One engine: gen2.** It already has the right frame:
- hand-designed sections picked by a small generator;
- pieces placed relative to each other, with gaps sized from Pokey's real jump, so a stage can't be built unbeatable;
- Easy as the same stage played kinder;
- local repair before a re-roll;
- a seed per play.

Today's mixer is **not** a second engine. Its good IDEAS move into gen2 as rules and data; its code is retired once they're ported.
No fourth builder is started.

## The five layers (who writes what)
| Layer | What it is | Who writes it | How often |
|---|---|---|---|
| 1. Game plan | data: every move's taught-at, its returns and how often it keeps coming back; each world's elements (ground, tree, water, air), tempo character and difficulty band; slot roles per stage (X-6 change of pace, X-9 boss preview) | designer, Matt approves | once, then kept |
| 2. World kit | data: labelled pieces (catalog.ts, LABELS), a big pool of sections (at least 3:1 to slots, sub-blocks), dial ranges (tempo, floor, branching), Easy rules | designer + section helpers | once per world |
| 3. Stage brief | 7 fields (beat, teaches, trend, ends, look, must, not) plus knobs (branching, water, difficulty), from the story | lead (story) + designer | per stage, minutes |
| 4. Builder | gen2's pipeline, fixed and extended (below) | planner | once, then improved |
| 5. Proof | stage.ts: one command builds a brief and runs every gate on 16 rolls x both settings, then stills | engine-core | once, then extended |
A stage is done when its brief builds, every gate passes, and Matt plays it. A miss is fixed in layers 1-4, never by hand.

## Layer 4: what gen2 must gain (the gaps, in order of what hurts most)
1. **Rolled feel per play** (from the mixer): tempo (hop family, gap share, rise band), floor depth, branching (none, some, lots),
   density. Each is drawn on its own stream in planBudget and read by the place rules. Each one is measured on its own, so we keep
   only the dials that really lift variety.
2. **Difficulty that is actually read.** Today D does nothing: W10's first stage is chosen like W6's (pipeline.ts:814, 237, 248).
   Wire D into the section pick, with a ramp-and-cool cadence inside each stage and a climb across worlds (World 3 is easier than
   World 2 today).
3. **Real routes:** fork nodes in the mission graph (high and low roads that rejoin, the mixer's crossing rules), and climbs allowed
   (today ascents are refused and every route stays in a ~250 px band, pipeline.ts:315).
4. **Length from the section count, not a clock** (the fill at pipeline.ts:851), so stages vary in length. No section twice in a
   stage by default. A placement window per section (boughs in 1-1's last third).
5. **Teaching that holds:**
   - a swap may never remove a section that teaches (today it can, pipeline.ts:855, 1917);
   - themes no longer lock the pool through `teaches` (w6Ground.ts:23);
   - every taught move is REQUIRED somewhere (a bot without the move fails), not just present;
   - taught moves keep returning through later worlds, by the game plan.
6. **What a section can hold:**
   - moving platforms (the engine has 'moving' and 'drift'; gen2 can't place them);
   - water zones, each with a kind (calm swim, deadly, teaching) and quick in-and-out swim beats every 15-20 s, at Matt's 1.25x
     swim speed;
   - secrets and the golden seed as a find pass that is reachable on every roll;
   - today's pieces: slung log, crates and seesaw (built on engine-pieces), the root gate (in progress), and bat, stalactites and
     the secret tunnel from art that's already packed (273 unused pieces).
7. **Placement with meaning** (Matt's 12:15 AM rules):
   - a heart only after real risk;
   - a checkpoint before the hard part, not everywhere;
   - hard collectibles in hard places;
   - enemies set by the node's job, about a third of each stage enemy-free, 1-3 on screen.
   Today hearts are dropped at every second flag after gen2 (stageGenerator.ts:2857).
8. **Support by construction:** trunks under boughs, stumps under logs, rocks never float (today's support.ts and trunkFit, run on
   gen2's output).
9. **Honest curation:** score the FINISHED stage (today curation scores it before hearts and finds are added, curate.ts:70), with a
   rejection report by rule.
10. **Easy as its own profile** (gentler pacing, crumble timing from the bots), so it never reads harder than Normal.

## Matt's decided numbers and rules (the engine honours them; they aren't re-opened)
- Crumble gives way 0.5 s after he lands on Normal, back after 2 s, whole on respawn (12:31 PM). Easy's timing comes from the bots.
- Swim at 1.25x his run (11:25 AM), under the designer's water rules W1-W12 (da0e5ba4: no breath meter, dives of 3 s or less, legs
  of 10-14 s, one kind of water per screen).
- Rocks never float. Floating logs and planks are fine. Lily pads only ON water (10:00 and 10:39 AM).
- Set pieces and hazards come back later as twists, in each world's own art (11:11 AM, "Yes").
- Every stage takes at least 2:00, with no cap and lengths that vary (1:05 AM).
- World 5 plays differently (carvings, Meeca's messages) and keeps its own play.
- Hand-built specials and bosses stay hand-built (11:05 AM).

## Layer 5: the gates every stage passes (stage.ts)
Already built today:
- level check;
- nothing costs a life where the brief says so;
- support (rocks never float);
- elements (World 1 kit only);
- length, quiet stretches, splits and two-road;
- the neighbour check and the check against the stage it replaces;
- kinds count;
- the every-stage lock;
- stills both ways.

To add, as each gap above lands:
- the move-ladder gate (untaught move used, or a taught move dropped too long);
- the move-required gate (the no-move bot fails);
- the heart and flag gates;
- the water gate (kinds, exits, in and out);
- the enemy-share gate;
- the bough share and window gates;
- the difficulty-curve check across a world.
stage.ts isn't the release bar on its own: every release also passes .github/workflows/gates.yml gate by gate (drawcheck, clipcheck,
artcheck, build:store, knowncheck, roadmapcheck and the rest; D42) and PERFORMANCE-RULES §1.

## Order (each step proved before the next builds on it; Matt plays at every star)
Matt: "1-1's our test. Then 1-2 is the second test." Nothing wider is built until both pass.
- **Step 0 (now): 1-1 on gen2.** The World 1 kit, the floor, tempo and branching, trunks, the seed, length by count, no-repeat,
  the window. CHECK on 1-1 itself: each dial alone and all together, 16 rolls (nothing outside World 1 is touched). ★ Matt plays 3 rolls next to old 1-1.
- **Step 1: 1-2 from a brief, built by a fresh cold helper** with the how-to only. It brings its own sections. Its time, cost and
  fix count go against the pass line. ★
- **Step 2: the game plan as data** (the whole ladder W1-W10, elements, water, slot roles) plus the ladder and move-required gates.
- **Step 3: placement with meaning** (hearts, flags, enemies, finds) as pipeline passes, with their gates.
- **Step 4: the rest of World 1** (1-3 to 1-9) from briefs by 2-3 helpers in parallel. ★ at each stage.
- **Step 5: gen2's core faults fixed in the worlds already on gen2** (5-7, 5-9, W6-W8), ONE WORLD AT A TIME:
  - D read, lesson-safe swaps, themes off teaching, honest curation, no-repeat default, Easy never falls back;
  - each world's lock and gates first, and Matt plays it BEFORE it replaces the live stages;
  - World 5's own play is kept.
- **Step 6: water and swimming** (zones, swim beats, 1.25x), then today's pieces and the unused art. ★ at 6-9.
- **Step 7: Worlds 2-4 and 9-10 onto gen2, world by world**, each with its kit, a lock and Matt's play.

## Cost (Matt: under 90% for the week, "that leaves 10 for 5 days"; 67% at 4:23 PM ET, about 1.5%/h since 2:23)
Step 0 is measured to the hour tonight, and its real cost becomes the yardstick for every later step. Estimates are re-made from
it, never guessed. What fits this week: Step 0, Step 1 (1-2), and Step 2's data for World 1. The rest is next week, in this order.

## Art
Existing art first: 273 unused packed pieces plus every world's kit. Hugging Face on the lead's approval, inside what is left ($71.83 per Matt, 11-05) with about $15
kept back, with the spend told to Matt (Matt deferred this to the lead, 11-04 and 11-05 10:42). Next week's polish is new pictures and
backgrounds, as Matt planned (12:40 PM).

## What stops
- No new builder. The mixer, plan.ts and beat-traced World 1 code are retired as their ideas land in gen2.
- ENGINE-SPEC.md (2,747 lines) is superseded by WORLD-RULEBOOK plus this plan; only the sections the rulebook adopts are kept.
- No stage is fixed by hand. No rule is loosened to pass (law 22).
- No step starts before the one before it is proved.

## Risks, said plainly
- Re-proving Worlds 5-8 in Step 5 changes stages players know. It's done world by world, Matt plays each, and nothing ships
  until he says so.
- The section pools are the real cost. Every world needs about 30-40 sections. Helpers write them from the kit and the rulebook,
  and that's where 3-4 helpers in parallel pay off.
- The dials might not lift variety as much as hoped. CHECK 3b measures each one on its own, and we keep only what's proved.
