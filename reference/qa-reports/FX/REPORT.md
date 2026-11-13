# FX: flags off mushrooms (rolled pass) + a find spot. t-fx, 2026-11-12, Opus 5.5 high
Status: item 1 done for the ROLLED pass (1-1); section pass open by the lead's ruling (2). Item 2 done. Item 3 moved to D12 (lead).

## Item 1, R-165.156. Root cause: a flag spot was a whole bank top; nothing asked what stood on it
- pipeline.ts: FLAG_FOOT (painted post + Pokey's respawn body, from FLAG_H and the flag frame: x-17..x+74), standsOnFlag, flagRuns
  (a bank's runs clear of pieces standing on it). The rolled pass lays flags only there; rolledFlagBreaches names a flag standing in a
  piece. Matt's flag rule untouched. Planted: flagClear.test.ts (red without the fix). 1-1 before: 39 of 188 Normal flags (16 layouts)
  in a stone/mushroom; after: 0 of 190.
- Lock: 101/102 unchanged; 1-1 (intended): checkpoints, collectibles, proto.dress. Raw roll identical but flags; petals and dress follow
  the flags; platforms, foes, vines, exit identical in all 32 builds.
- 1-1 list RE-RECORDED (lead approved 4:29 PM ET), same filters, in place (--merge order --in-order, 4 parts, --combine): 258 -> 257.
  27252 dropped: on Easy its only legal flag window (x 840-860) has a 54 px stone at 896, so the old flag respawned Pokey inside it;
  now it fails by name. 55341 re-searched. Version 6bf4a846 -> dbbf97db; variants 67+ shift one (calibration uses 1-40).
- FIRST_RUN_11 (9800) lock re-recorded: flags only (Normal 2, Easy 7 moved; plan, pieces, foes, vines, petals, exit identical).
- OPEN (lead's ruling 2): the SECTION pass (flagSpot + span split: 1-2, 1-3, Worlds 5-8) still lays flags in pieces (78 over 2 rolls
  x 2 settings of W5-8). Its fix (in 53a8d2e5's history, reverted at b0a8cf75) moves 16 W5-8 stages' flags and re-lays 15 curated
  seeds that seeds.test.ts pins: 6-2 (3), 6-9, 7-1 (2), 7-3 (2), 7-5, 7-6 (3), 7-9, 8-9 (2). Needs curate.ts: its own packet.
- Also OPEN (found): easyMode.ts capFlagSpans adds Easy-only flags on every stage with no such check: shipped 1-1 Easy 34 of 377.

## Item 2, a find spot
- Socket role findSpot (types.ts); fillSockets records the first laid as proto.findSpot {x, b}; addFinds puts the find 26 px over it
  every roll; no mark = the hashed ledge as before. No stage id. findSpot.test.ts both ways. Lock: nothing moved. D12 told the shape.
- finds.ts:409 w1_note = "Down in the hollow, low against a root." (true only once D12 marks 1-2's hollow).

## Gates (head b0a8cf75 + this report)
tsc PASS; gen2+worlds 493/0; main suite 2595/0; touched 8/0; seedlist 1-1 --check PASS 257 (first run incl.); lock as above;
tierBots 7/0; engine tools 17/0; generality, knowncheck, roadmapcheck, build, chunkcheck PASS. buildcheck FAILS on base and head alike
here (p50 414 vs 402 ms: this container's CPU). Not run: drawcheck, clipcheck, artcheck, kbdcheck (no draw, menu or art change).

## Polish check
- first-run-L18-land.jpg / -port.jpg (here): before, posts behind mossy rocks and a mushroom; after, on open bank (both settings).
- ROUGH, NAMED: the fix clears a piece's STAND box, but W1's painted rocks bulge 0.2-1.4x their width past it (w1CutArt cutBox) and
  the cut is picked after flags (w1Finish): L18 Normal 17985's pennant meets a mound's bulge. Respawn is clean. Root fix: clear the
  DRAWN extent (w1Finish picks a cut missing every flag, or the kit gives the bulge as data). For the section-pass packet.
- The glowing ring by the flag is P11's open item, not this change.

## Lessons applied; method update
D43 (general, no stage id/x), D49 + law 22 (rule untouched; the unfit seed fails by name), base lock first. seed-list.md: re-search a
list in place = 4 `--merge cK --in-order --count 300 --part pK` slices + `--combine p0..p3,order.json`; then re-record FIRST_RUN_11
after proving only the intended part moved. Its "seeds[10] is the first run" is stale (index 17, 9800). Stills: __play(id, layout).
