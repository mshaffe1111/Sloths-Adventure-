# Gemini research: variety, moving platforms, water, puzzles, nodes (Matt pasted it 2026-11-02 evening)

**Read this caution first.** Gemini said its Deep Research tool did NOT run; this is a model-written report, cut off mid-sentence in
"Section 5, Step 3". Citations (e.g. a "Sept 2026" graph-and-chunk paper) and exact numbers are unverified. Use it as a source of ideas
that we prove on our own game with our own tools (LESSONS: check facts; prove with the fixed tool), never as fact. It describes other
games' design principles; we take principles, never copy a specific game's stages, characters or structure one-to-one.

## The lead's triage (each idea: what we do with it)

| Idea from the report | Where we are (checked in code where noted) | Decision | Roadmap |
|---|---|---|---|
| Pacing tags per beat (Tight / Flowing / Relaxed / Cerebral); never two Tight beats back to back | gen2 has no pacing tags (pipeline.ts read 11-02) | ADOPT: this is the rhythm check's vocabulary | R-150.1 |
| ~25-30% of beats are puzzle beats (jump as a tool, not a reflex) | not measured | ADOPT as a target, measured by R-150.4's table | R-150.2/.3 |
| Teach a thing alone, then use it against another system (two-step) | first-time teaching exists (stage rule); second use rarely | ADOPT: matches STAGE-RULES §0.1 | R-152.4 |
| Moving platform kinds: pendulum, ride-to-start track, counterweight pulley, turning wheel/log, bobbing float, creature platform, see-saw | today: sine sliders and W2 basket lifts and drifting logs (engine.ts 1511-1530) | ADOPT 4-5 that fit a jungle: pendulum branch, ride-to-start vine track, pulley baskets, turning mill log, bobbing lily/float; creature platforms later | R-152.5 (expand) |
| Platform speed carries into the jump ("lift momentum") | the engine moves him with the platform; whether its speed carries into a jump is NOT verified | CHECK first, then add if missing | R-152.7 (new) |
| Water: no slow drag, in-and-out every 15-20 s, wide clear exits, currents and bubbles, rising/falling water | swimming not built (R-5.22) | ADOPT as the swimming brief's rules | R-5.22 |
| Stage types per world (normal / short break / search hub / race / mastery) | every stage is a start-to-goal run (puzzle rooms exist inside some) | MATT DECIDED 11-02: reshape 2-3 existing stages per world into other types (no new stages) | R-153 (new) |
| Lock-and-key and branch rules in the generator (a key off the main path; a fast risky path and a safe path) | gen2 has linked source/receptor pairs (pipeline step 4); branches limited | ADOPT into generator variety | R-150.2 |
| Celeste-style no lives, instant respawn | conflicts with lives, continues and Matt's star rule (R-5.23) | REJECT the no-lives part; keep checkpoints close (STAGE-RULES §0.5) | none |
| Physics formulas (buoyancy, spring damping) | n/a | Helper's tool, proven by play, not taken as given | R-5.22, R-152.5 |

---

## The report as Matt pasted it
(Full text kept in the lead session transcript of 2026-11-02 ~7:10 PM ET; the triage above carries every actionable point. Sections: 1 diagnostic audit (five AAA systems), 2 moving platform taxonomy (eight classes + lift momentum), 3 water laws (buoyancy, clear exits, in-and-out), 4 six puzzle architectures (rule discovery, one-key routing, fire/extinguish, enemy baiting, timed fuse, search hub), 5 mission graph vs chunks (lock-and-key insertion, parallel risk branch, standard connectors with 3-4 body-width landing aprons, pacing tag grammar, kinematic reachability check; cut off here).)
