# World 10 on gen2: where it stopped (2026-10-29 11:00 PM ET, the lead's stop for the night)

Branch gen2-w10. Done: kit, ~60 sections (4 themes + guards + storm watch), swings and rooms merged (gen2-w10-swing 3c105ea),
painted hazards wired (rods, bolts, spike beds, rampart slabs, the storm as 10-3's watcher), soldiers, dressing, all lines approved,
gen2-w8's curate.ts / lookalike.ts taken verbatim for Matt's look-alike rule C. w10.test.ts and the swing builder's tests pass.

NOT done: curation. seeds.ts holds no World 10 rolls, so World 10's gen2 stages cannot be played until it is curated (game.test,
w10Game.test fail until then). The interrupted run had shipped 10-1 16/16 (diversity 0.355); 10-3, 10-6, 10-7, 10-9 not reached.

Next step, exactly:
  npx tsx tools/gen2/curate.ts --stages 10-1,10-3,10-6,10-7,10-9 --rolls 400 --keep 16 --apart-near --apart-cap 0.2 \
    --json /tmp/curate.json --report /tmp/curate.md        (about an hour)
then: commit seeds.ts; tsc; the full suite + gen2 tests; vite build; the band (inspect.ts --worlds 9,10 --firsttimer --gate, seeds
1-3); walks (tools/art/w10/walk.mjs) and stills (tools/art/w10/shots.mjs), upright and sideways; ping the swing builder
(session_01FhBbYNBTbLLgVB5ZHEdm5W) with the hash for its walks and clip; report to the lead.
