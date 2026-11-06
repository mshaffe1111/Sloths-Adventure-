# engine-render: what's left (stopped 2026-11-05 12:55 PM ET; the lead: polish moves to next week)

- **(b) The green ellipse under the signposts, and the teal strip in the soil.** These are on 1-5's end bank in the designer's
  art-bootprint stills (f57eac78, reference/prop-sheets/qa-notes/hf-art-bootprint/option-b-bank-*.jpg). Not traced yet.
  - The planner's current 1-5 no longer has that end, so reproduce on f57eac78, layout 1, x 45976-46616.
  - Found so far: a code-drawn green moss oval is World 1's `hollowlog` env decor (envPlants.ts hollowlog, rgba(43,160,83,.85)), seen
    on 1-1's start. A probe of fill + ellipse calls found no large green ellipse at 1-5's end, so the signpost oval is likely a sprite.
- **Creek (5bae2dce): needs the designer's ruling.**
  - Pass test (designer): a first-timer never tries to walk on it, both ways.
  - The designer's four points were on the older stills: no surface line or ripples (a dirt floor); a void under it; flat-white shapes
    behind Pokey (the white orchids of the backdrop: the backdrop helper's); a blue splash on brown water.
  - The new body (er-creek1 body-s62-341) and the muddy splash answer the void and the splash; the surface and "would you walk on it"
    still need judging in a W1 stage, both ways.
  - The stills are scratch layout. No more takes until the lead says so.
- **Gates:** not run on the final code. Run tsc, the tests in 3 shards, vite, store, artcheck, drawcheck, clipcheck, funcheck,
  knowncheck and roadmapcheck.
  - 18 tests already fail on engine-mixer's head (the old 1-1/1-5 contracts, the 1-5 boa preload, the vault pit at 17766 on 1-1).
  - Plus my padsOffWater on 1-5, which fails by design until it gets a water zone. All are the planner's.
- footingOf: moved to the planner (the four rules were sent to them, with file:lines).
