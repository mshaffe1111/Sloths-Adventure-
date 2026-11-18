# ART-22P: 2-2's pickups painted to its story (lavender hyacinth / white lily), then the release-speed fix (R-165.278). Opus 5.5 high.
Written 9:48 AM ET 11-18. BOX: hash to the lead by 3:30 PM ET, or 50% REAL context. Hugging Face cap for this packet: $4.
Role card reference/roles/ENGINE.md + reference/methods/hf-art.md (the token never leaves the environment: never in code, commits, files,
messages or memory, law 8; log every job in reference/art/HF-SPEND.md with what it bought). Read STAGE-RULES §4-5b and LESSONS.md once.
PART 1, the art (first):
FACT (FIX-22, 11-15): 2-2 "Petals for the Crown" gathers flowers for the river king's crown, but its pickups are the pink World 1 petal
(src/assets/pickups: petal, petal-folded, bell pink, fruit-*); no painted non-pink pickup exists; 1-2's blooms are code-drawn (not usable).
1. Compare against the shipped painted petal pickup side by side BEFORE generating (size, outline weight, painterly shading, how it reads at
   phone size over water and pads). Make a lavender water-hyacinth petal (and, if it reads better, a white lily petal) in that exact style;
   a few takes, judge at phone size on 2-2's real backdrop, pick one, name why. Cut and size it like the petal (inventory first: add it to
   the master catalog / src/game/art/inventory.ts with world, use, layer, ship size).
2. Wire it by data: stagePlan looks.petal for 2-2 (one line per FIX-22), nothing else changes in 2-2's layout.
3. Checks: tsc, suite once, seedlist 2-2 --check, lockall --intended 2-2 (layout must NOT move: say so with the proof), drawcheck 2-2 both
   ways (D81), artcheck, chunkcheck (asset sizes). Stills 2-2 upright + sideways, Normal + Easy, whole screen, before/after.
PART 2, the release-speed fix (R-165.278): the publish run's `rolled` gate job ran 25 min (the per-stage seedlist --check loop ~21 min for
10 lists; limit now 60). Split that loop across parallel jobs (a matrix over the lists from `registrycheck.ts --lists`) so no gate job runs
over ~15 min with 20 lists; every list still checked, every other step unchanged, tsc stays first (PR #74). Prove the YAML parses and the
matrix expands to every list (print it); the next publish run is the live proof (say so). Note it in reference/methods/gates.md.
Branch t-art-22p from origin/main. Probe scripts relative imports (D83). REPORT reference/qa-reports/ART-22P/REPORT.md (hash, HF spend,
takes judged with the picked one, gates, stills, Polish check, Learned). Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; messages carry REAL context %.
