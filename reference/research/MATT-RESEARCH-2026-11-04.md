# Matt's second research batch (pasted 2026-11-04 ~2 AM ET): the points, section by section
(The full text is in the lead session transcript of 2026-11-04. Matt: "I know not all of this can be implemented, but these are ideas.
How to make us feel different, how to fix what we have, and where we can go so it doesn't feel like a 55 to 60 out of 100 game to more
of a 80 to 90." The lead's plan from it: reference/PLAN-TO-80.md.)

1. **Stage DNA + run seed.** Each stage keeps fixed DNA (mechanics, type, story line, collectible); a seed builds a fresh layout in four
   layers: map shape (loop-back, high/low split, zig-zag chimney, lock-and-key spoke), rhythm (a beat timeline traced with Pokey's real
   physics, platforms placed under his simulated feet), puzzle blueprints (fixed logic, randomized layout), and a pre-flight check
   (clumsy-thumb reachability: +-100 ms taps, 15% less air control; at least 45% different from last time; no >2.5 s dead walks;
   landing in view). Pacing tags I/F/P/T/R, never T-T or P-P; 200-250 px flat aprons between nodes.
2. **WebGL.** Batch sprites from atlases into few draw calls; instancing for repeats; fixed-step physics separate from drawing; object
   pools (no new objects in the frame); compressed atlases; unload the last world's textures; keep text bubbles in HTML over the canvas.
3. **Engines and touch.** Separate physics, render, input, generation. Touch forgiveness: coyote ~0.12 s, buffer ~0.10 s, tap = short
   jump, hold = apex hang. Context actions (ground / air / climbing punch and kick).
4. **Bosses: three ways to win.** Keep each script tip as way 1; add an arena trap (way 2) and a punch/kick skill counter (way 3);
   three phases where the arena changes; a shared vulnerability config. Ideas for all ten Guardians.
5. **Sloth biology as mechanics.** Effortless hanging and walking under branches; fast happy swimming; algae/moth camouflage; neck-turn
   look-ahead camera; belly slide on mud. A special stage per world (ideas for each). World mutators (W3 noise wakes the Prowler, W5
   fake rest spots, W6 camera tightens after Dot leaves, W10 a step counter). Stage-to-stage cause and effect. Shuffle slot order.
   Secrets by in-world tells (hairpin scratches, the wrist petal pulsing near a secret, rustling bushes), never blank walls.
6. **Enemies.** Simple, predictable, one trick each with a 0.5 s warning; a stomp/punch/kick triangle (stomp bounces higher, punch
   stuns/deflects, kick breaks shields and bowls); species tricks (snake that looks like a vine, cave cat that moves only when you look
   away, eagle shadow lock-on, a spider curtain on the silk tripwire, snapper snouts as platforms, soldier shields); about 35% of nodes
   enemy-free; 1-3 on screen with roles; none within 150 px of a landing; bind enemies to platform roles.
7. **Never repeating.** Stage as a move string (J V B W S C P); 3-4 move runs checked; similarity to the stages before it; a tempo per
   world; a tension curve across the stage; collectibles seen or heard from a rest before the challenge.
8. **Order.** WebGL first, then a headless validator, then the node generator, then enemies and bosses, then story wiring, then phone
   profiling. Token rules: small specs, tests do the debugging, freeze World 1-2 before scaling.
9. **Thirty ideas.** Under-branch hanging, stillness resonance, bending saplings, fast swimming, camouflage, pulleys, jump-toggled
   platforms, domino branches, wind shadows, silk ricochets, light-solid bridges, sound-ripple sight, lightning-flash memory, water
   waves, background-layer jumps, wrist-petal pulse, Dot vs Flicker assists, playable boss intros, poster cameos, Venom Fang shortcut
   vines, enemy bowling, vine snakes, projectile batting, look-away sentries, spider curtains, seed sharing, boss finishers, a pacing
   director, haptics and rising pitch on chains, a Meeca remix mode.
