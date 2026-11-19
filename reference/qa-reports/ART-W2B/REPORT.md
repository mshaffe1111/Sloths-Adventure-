# ART-W2B REPORT: 2-6's painted noria (rim + spokes, buckets dry/spilling, the millrace wall), wired in wheelDraw.ts
Branch t-art-w2b from origin/t-eng-26 fa8a92bf; head in the last message to the lead. Show-first OK from the lead 8:54 PM ET (lip place and short spill: YES; specks: fixed).
## Done-items
1. **Show first:** show-first.jpg (pieces beside World 2's jetty/ladder, the real page both ways, edges 3x on light/dark), spill-edge-3x.jpg (the fix).
2. **Art (HF, ~$1.15 of $4; balance ~$50.2; HF-SPEND.md):** one sandbox 8:24-8:49 PM ET, 15 Qwen-Image-Edit-2511 takes from GEOMETRY paste-ups
   (tools/art/hfw2b/starts.py: 6 spokes at 60 deg, the 120 px trough at 7x) + World 2's wood as the style image. Picks (tools/art/hfw2b/picks.json):
   noria wheel-s37, bucket-s23, spill spillc-s37 (an edit OF the dry take; + its mirror), lip lip-s11. ~$0.29 a piece.
3. **Wired (src/game/wheelDraw.ts):** one sheet src/assets/props/w2-wheel.webp (2460x1256, 311 KB; frames w2WheelData.ts by ship.py, 3 px a unit).
   The noria is ONE frame turned with the wheel, its rotation read off a bucket's floor (a spoke always meets every floor; R160/180/200 scale
   from the R200 frame); every bucket frame's (ax, ay) = the floor's left end/top ON the platform (art = collider); spilling within 55 deg of
   the top, pouring toward the jetty; the millrace wall across the pond (coping 34 px over the water). Placeholder shapes deleted (new replaces
   old); until the sheet loads the bucket floors are filled plain. Preload: stageSheets 'w2-wheel' (any gen2 stage placing a wheel + the fixture).
4. **Catalogued:** 5 rows part W2B (tools/art/hfw2b/catalog.py: world, use, footing/walk line, layer back, ship size, Pokey scale), emitted.
5. **Planted test:** src/game/wheelDraw.test.ts (3): art = collider over a whole turn, both ways, R160/180/200; spokes on floors; spill only
   over the top. With `ay` ignored test 1 went RED; green with the change.
## Checks (on ad176c94 + docs/stills commits after it; no src change since)
| Check | Result |
|---|---|
| tsc; wheelDraw.test, artUse.test, art/*.test (inventory footing after the walk-line fix) | PASS |
| full suite, 3 shards | PASS: 1447/1448 (1 existing todo) + 1057/1058 (1 existing todo) + 1300/1300 |
| BASE_PATH build + chunkcheck; artcheck; knowncheck; generality; roadmapcheck (after --unshallow) | PASS |
| drawcheck (796 s); clipcheck (422 s, 83 known) | PASS (drawcheck has no wheel scenario: see Perf) |
| kbdcheck; engine tool tests (37); seedlist 1-1 --check (161 seeds) | PASS |
| buildcheck | PASS alone (p95 91/59 ms); RED (p95 205) when run beside the suite + drawcheck: load, not the change |
| tierBots | RED, INHERITED: the same 'child easy variant 1' replay miss on the base t-eng-26 fa8a92bf (run there in its own worktree) |
| lockall --layouts 16 vs main 6e7b85f8 | 102/102 stages unchanged |
## Perf (PERFORMANCE-RULES §1)
Per wheel per frame: 1 save/translate/rotate/restore, 2 + 1 + N drawImage (N=6: 9), no fills, arcs or paths (placeholder: 1 save/restore, 2 arcs,
1 path, 4N fills). Area: up to ~0.70 sideways screens of drawImage (noria 377 px square, wall 2x400x104, buckets) vs the 7.5 limit; shrink
1.5-1.7x (limit 2.5x). TIME (reference/qa-reports/ART-W2B/perf.mjs, headless Chromium = SOFTWARE canvas): painted 3.45 ms vs placeholder
0.22 ms at CPU x1 (15.6 vs 0.82 at x4) = ~5 full-screen layer draws: the rotated 754 px square at 2x is the cost (unrotated ~2.4x cheaper).
On a phone's GPU canvas that is one textured quad; the container can't measure it. **Named, not proven:** time it on a real phone (or
perf-baseline's mid-range) before 2-6 ships; if it shows, the fix is a pre-scaled cached noria per R and dpr (measured only ~13% here).
drawcheck can't see it: its '2-6' scenario is the OLD hand-built 2-6 (no wheel); the 2-6 builder adds the new 2-6 to drawcheck (D51).
## Polish check (stills/*-{up,side}.webp, contact-up.jpg, contact-side.jpg, clip-up.mp4; ?fixture=wheel Normal edge R180 V70 N6)
- Painter: the noria and troughs are World 2's weathered grey-brown wood with rope lashings (beside the jetty in show-first.jpg); they read light
  on the dark painted soil both ways. Rim moss only, no drips on the rim (they would turn with it).
- Art = collider: Pokey's feet sit at the trough's floor line boarding, riding and stepping off (01-board, 02-mid-ride, 03/04 step-off).
- Spokes meet every bucket in every frame; the top two buckets spill toward the jetty; the stream fades under the hull (no splash in mid-air).
- Edges at 3x on light and dark: no grey fringe; the splash crown keyed out (spill-edge-3x.jpg).
- Whole screen (D79): the toy's soil, boughs, bamboo and backdrop are the fixture's (ENG-26b), not 2-6's; the real 2-6 is judged when laid.
- Named: the bucket is drawn BEHIND him (layer back), so he reads in front of the trough's far wall, not inside a front lip; a front lip would
  need a piece layer drawn over him (suggestion). The wall's two halves are the same picture end to end (a double post at the join).
## Pushback: none. HF route note: the lip's place and the short spill were the lead's calls (8:54 PM).
## Suggestions
- ENG (2-6 build): add the laid 2-6 to drawcheck's scenarios and time the wheel on a real phone (Perf above).
- ART: a front-lip strip for the bucket on a 'front' piece layer (he would stand IN it); a 5-spoke noria if any row uses N 5 (TOY 'sparse').
## Unresolved
- Real-phone timing of the painted wheel (Perf). tierBots RED inherited from the base (ENG-26b's line).
- `?fixture=wheel-right` lays NO wheel on this base (stage 2-96, 50 platforms, none with .wheel; probed on the dev page): the right-travel stills
  could not be shot; the way > 0 spill (bucketSpillL) is proven by wheelDraw.test only. For ENG-26b.
## Learned / method update (hf-art.md, proposed)
- A MADE object with exact geometry (spokes that must meet colliders): draw the geometry as a flat paste-up and let Qwen-Image-Edit repaint
  it with the world's own pieces as the 2nd image: the painter matched first time and the geometry held (4/4 wheels kept 6 even spokes).
- A rotating piece: paint no drips, light or shadow that must stay down; put the wet look on the parts that stay level (the buckets).
- Fetch: never `cat` a small file from the sandbox (it lands in context); always sbx.py parts + pull.py.
## Lessons applied: D30 BROKEN TWICE: two of my messages to the lead carried a typed time (8:55 for 8:52, 9:25 for 9:23) and the first correction did too (8:53); each was corrected at once. What stopped it: composing the WHOLE message inside the `date` command and pasting its printout, D41 (sizes vs 89.1), D51/D81 (drawcheck run;
its blind spot named), D57/D87 (ReadNotifications at every push), D59 (no background run left at stop), D63 (clip of board to step-off), D79, law 8.
## Turnover notes: reference/handoffs/engine-core.md 0zo, reference/handoffs/art-director.md 0h (commit 8e626d29f).
