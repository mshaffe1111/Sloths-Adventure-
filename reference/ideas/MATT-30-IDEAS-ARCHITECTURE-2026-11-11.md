# Matt's 30 level ideas: how each fits the engine (Matt, 11-11, research he brought in; saved as given, summarized)

Matt sent this analysis of the 30 ideas in reference/ideas/MATT-IDEAS-2026-11-11.md. Its claims about our engine are UNVERIFIED (it
assumes PixiJS, "Poki"/"Mika", 2400 px trees and "zero changes" for some systems); the Architect checks each against the real code in
reference/architecture/CAPABILITY.md (R-165.111). Our own rulings still stand where they differ: #13 mirage platforms breaks "what looks
standable must be standable" (parked); #27 mimic forest only with a tell a player can always see, never in World 1 (R-165.97).

## The pattern it proposes
A stage = one Spatial Profile (where nodes go) + one Tempo/Oscillator clock (how nodes move, spawn or pulse in time) + one Rule
Mutator (how Pokey, enemies and pickups behave). Each mechanic is coded once and mixed per stage; bots verify every seed.

## Tier 1, rule mutators on any layout (9)
#4 step-synced forest (world time follows Pokey's speed); #7 slow-moving camouflage; #24 heartbeat slow-motion when hiding or still;
#2 vine-tail convoy (collected things follow him in a line); #15 tempo/echo platforms that turn solid on a beat or a chime; #18
breathing tree (platforms oscillate on the tempo clock); #19 amber static charge (pulls pickups, climb bare trunks); #27 mimic forest
(see our ruling above); #29 pollinator bloom (step on everything to bloom 80% and open the exit).

## Tier 2, generator profiles reusable across worlds (12)
#1 Frogger lane crossing (lanes with timed spawners); #8 sunbeam warmth zones; #9 moth swarm helper; #11 monsoon lagoon with ballast
(swim, sink with a stone); #13 scent ribbons (see our ruling); #16 big/small scale shifting; #17 water-reflection dual world; #21
food-chain lure (predators defeat each other); #23 wildlife photographer stealth; #26 vine-leash escort with Meeca (tie-off anchor and
pendulum, kin of R-165.110); #28 real-time chunk drafting (the card pick, R-165.98); #30 shrinking safe zone arena.

## Tier 3, one-offs for special stages only (9)
#3 territory loops (Qix); #5 Lemmings walker; #6 pinball; #10 claw-lock pendulum; #12 weekly descent (3-phase scripted); #14 cast-shadow
platforms; #20 slingshots; #22 time-loop co-op; #25 rodeo stampede runner (like the Hummingbird and Cave Slide specials).

## Its example mix
1-2 Frogger lanes, slow spawners; 1-4 standard layout + camouflage stealth; 1-6 vertical climb + breathing tree + heartbeat; 2-2
Frogger + vine-tail convoy; 2-5 submerged lagoon + tide clock + echo platforms; 3-3 mimic forest + food chain.
