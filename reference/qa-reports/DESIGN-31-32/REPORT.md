# DESIGN-31-32 REPORT (Designer; written 6:13 PM ET 11-19 by `date`; packet reference/packets/2026-11-20/DESIGN-31-32.md on the lead's branch)
**EXACT NEXT STEP:** the lead reads 3-1.md + 3-2.md and sends the engine packets in the order below; the first three can start now.
Status: DONE. Branch t-design-31-32 off origin/main 6e7b85f8f. Docs only (no src/). Done-items 9/9 below. Pushback: yes (3, in the docs).
## Done-items
1. reference/design/3-1.md built-ready, 2-4.md's format: one idea, tributes, beats table (s, what, does, feels), node string, targets, engine, hand build, art, keeper asks.
2. reference/design/3-2.md the same, on Matt's option A (the lead's message 11-19); B/C one line each under Pushback.
3. First appearances taught: 3-1 teaches DARK (every teach drop soft, no wrong side), 3-2 teaches HANG UNDER (first ocelot paces away, dark root).
4. Node strings pass checkCode (`npx tsx reference/specs/sims/nodes3132.ts`: 3-1 14 tokens, 3-2 15 tokens, no errors).
5. Targets pasted from DIFFICULTY.md:61-63: 3-1 Normal 19.5 / Easy at most 11.7; 3-2 Normal 23 / Easy at most 13.8.
6. Every number flown on the real engine through InputEngine (`npx tsx reference/specs/sims/w3flight.ts normal|easy all`; out/w3flight-*.txt). Rig check: tap hop 0.40 s air + take-off frame, 120 px (R-165.284's 0.43 s / 119).
7. Engine list, 2 NEW a stage, with toys and order (below). 8. Hand builds and pinned tests named (file:line in each doc). 9. Art asks (reuse from the whole catalog first, R-165.318; paint only what none fits) and keeper asks in each doc.
## The numbers that decide the build (Normal; Easy where it differs)
- 3-1 stand-still: still 0.10 s after Right is let go; lights wake 0.80 s; fully lit 1.70 s. 0.40 s wakes nothing. Wake reach is x-only: a light 3000 px below wakes.
- 3-1 drops: no fall loses a life at any height (to 1400 px); silent to 200 px; landing 106-117 px past the rim at 160-200 px drops. Soft drop = <=200 px onto floor that cannot hurt.
- 3-1 puffs (6.4/1.0/2.2): a press that sees and lands in light 38-42% of the cycle, worst wait 3.7-4.0 s (drops 160-400 px).
- 3-2 roots: a held jump catches 190 px (feet hang 94 px up), a tap 170 (74 px), a double 250. Creep 120 px/s. Let-go silent from every root.
- 3-2 today's kit ocelot (tall 80): feet 94 -> unseen 0/48; feet 74 (Easy's root) -> seen 48/48: ENG-PROWL is needed for Easy.
- 3-2 lit patch (modelled rule): r 90 = 1.5 s in light, a random-moment crossing passes 21%, clean start within 8.5 s; r 60: 27%, 8.0 s.
## Engine list in ORDER (what must be merged before each build)
1. F1 ENG-W3a (L): w3.ts kit + a '3-1' stageTable row travelling down. NOW. Toy: addlevel READY; plant: travel 'right' -> red.
2. F3 ENG-PROWL = 3-2 NEW 1 (S, creature kit only): sight.up (ocelot 40), lit = seen, the leap act (aim up, tall 130). NOW. Toy: 74 px hanging unseen, lit seen + one heart; plant: sight.up off -> red.
3. F4 W3-ART-1 in parallel, NOW: reuse-first per the docs (catalog by `worlds`); Hugging Face only for the soft fungus mat, lit rims, sleepy-mushroom shelf (3-1).
4. F2 ENG-DARK = 3-1 NEW 1 (M): dark brick; wake bounded in y (420 down / 240 up proposed); 'sky' set; lit-1 s verdict; Easy GLOW_STILL 0.4; bot still-for-glow. After F1 (W1 toy row first).
5. D3 ENG-SPORE = 3-1 NEW 2 (S-M): puff brick + a light on its clock. After F1. -> METER-W3 (dark, spore channels) -> BUILD 3-1.
6. D2 ENG-ROOT = 3-2 NEW 2 (M): roof-root lay over walkable floor, no posts, look 'root', 190/170 px, fixed glow patches r 90/60; bot "creep under a watcher". After F1, F2, F3.
7. W3-ART-2 (roots, patches, thorn bed, lit rims) -> METER-W3 (ocelot, shimmy) -> BUILD 3-2. HANG-SPEC and ART-HANG dropped (Matt: A).
## What Matt must decide
Nothing new. (3-2's hang was answered: A.) For the story keeper, not Matt: 3-2's goal line says "Keep low" in a stage where he hangs high (stagePlan.ts:78).
## Polish check
Docs only: no stills or clips (rule 29: no stage exists yet). Unmeasured and named: how much height each orientation shows (the builder's stills measure it, rule 8).
## Method used / Lessons applied / Method update
Method: methods/level.md (rules 3, 6-8, 17, 21-24), pitch.md step 6, 2-4.md as the format. Lessons: D30 (every stamp from date), D34/D52 (cites checked last), D40 (foundations first),
D41 (Pokey 89.1 px), D49 (flags by the live rule), D58 (tributes), D83 (relative imports), D90 (lean reads). Update proposed for level.md rule 24: "fly WHICH things a rule
reaches, not only when (the wake's reach was x-only), and fly the creature kit's own step function with the engine's measured body heights".
## Learned
- A rule read on flat ground (wake by x) breaks on a new axis (down): fly every reach on the stage's own axis.
- The pitch's "170 px" came from enemyBrain.ts, a brain World 3 doesn't use: grep the kit (PLAN-W3 found it; the flight proved the numbers).
- InputEngine has no 'up' move: Up/Down are triggerTouchClimb; a wrong call is silent (my first rope flight had no Up).
## Pushback (in the docs)
3-1: the wake must be BOUNDED, not extended below; Easy keeps a short stillness (0.4 s) instead of "wake at once". 3-2: the fix is for Easy and the light (sight.up 40), and a seen hanging
Pokey costs nothing until the leap exists; the pitch's waking-as-he-passes signature can't work (hanging never wakes; woken lights stay lit all run).
## Suggestions
- 3-9 idea: a stop on the floor wakes the den's roof for the whole run (engine.ts:1064-1065): the 3-1 habit turned against him, once he knows both.
- timecheck.mjs is still only on t-time-168b (not main): the packet's gate was run from that branch's file.
