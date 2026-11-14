# INT-4 REPORT (Engine, integration). Head t-int-4 (from t-int-3@c746bba7, + t-int-3@31b8a742 merged). Written 4:08 PM ET (box stop at ~40% context).
**1. RESULTS.txt NOT all 0, so no "GREEN".** gates-2bb29f8d/RESULTS.txt (31b8a742): tsc, build, chunkcheck, artcheck, knowncheck, generality,
roadmap, drawcheck = 0. NOT RUN (INT-3's script died with its session): unit, clipcheck, kbdcheck, tool tests, seed lists, registry,
tierBots, castBots 1-4, buildcheck, stills 1-4/1-5. Told the lead at 4:07 PM.
**3. 1-4 bot split: every named stuck kind was a BOT limit** (plain-player probes in the real engine get through each spot; no level change).
Roots, all fixed in the bot (tools/inspect only, no game code):
- route.ts findRoute cannot trace a tower; the fallback re-traced `buildRoll(levelConfig, seed)`, which for a LISTED stage is not the
  proven variant played, so the bot walked under the storey above ('the way on is 123 px up', x182 y7382). Now: towerRoute.ts follows
  the stage's own gen2.tower.route (turn vines where they stand; a leg climbs at its own vines, or hops up a stair to the next vine's
  foot; no doubling back along one floor), firsttimer.ts uses it before any rebuild.
- 'dip 80 px': a plain jump from the dip lands on top (one-way boughs); gone with the true route.
- KID/ADULT fig pushes: the thumb's late lift-off re-arms every frame (R-165.59 quirk), so tap-tap became one hold; under the gate he hung
  on a field vine for 1200 s, never 'stuck'. Fig taps now skip the thumb model (firsttimer.ts `tapped`).
- figPush pressed down forever when a bunch on a held vine blocked the way down (seed 2): after 0.6 s with no move he pushes across.
- Tower stairs of 60 px ledges over the floor: the bot stops under the step the way goes onto and hops straight up (towers only).
**Result, castBots 1-4 seeds 1-40** (INT-4/castbots-1-4-s1-40.txt, t-int-4@a3b52cbe): 176/360 pass (INT-3: 22/360). expert 30/40, middle 26+26,
child 17+16, adult 15+29, kid 2+15. Left (each a bot fault until a probe says otherwise): kid/adult 'fell back down 3 times' on the top
field's vines (x 446-730, y ~1300-1450); child/middle 'dip 240 px, way on ~320 px down' at the top field's mid ledge (route/Progress
mismatch there); 5 runs 'time goal 0/1' with no rescue (adult N 9,18,30; middle N 22; expert 33): a loop the stuck clock never sees.
**Level flag (not mine to fix):** quick bots finish under 2:00 (adult Easy median 86 s, expert min 101 s). STAGE-RULES §1: check 1-4 with
the stageTime model (engine-core §0j trap 3: judge 2:00 with model AND flyer).
**Gates on t-int-4:** tsc 0; roadmapcheck PASS (after unshallow); knowncheck 0; generality 0; tierBots+castBots+travelBots tests 17/17.
Tools only (LAWS 5 scoped): full suite/build/perf still owed on the integration head before any link.
**Not done:** 2 (stills 1-4/1-5: never shot, nothing judged), 4 (#ctest stays 1-3: not 40/40), limits.json rename (not started).
**Polish check:** none: no screen changed and no still was judged. Named plainly.
**Misses (mine):** no PLAN.md pushed before coding (TODAY.md rule); I pushed WIP onto t-int-3 while INT-3's script could still push there
(its push landed anyway); the lead's force-reset of t-int-3 was denied by my session's permission check, not retried.
**EXACT NEXT STEP:** 1. In a session that STAYS UP, on 2bb29f8d: unit (3 shards), clipcheck, kbdcheck, tool tests, seed lists --check,
registrycheck, tierBots, castBots 1-4, buildcheck (last); write gates-2bb29f8d/RESULTS.txt; all 0 -> "2bb29f8d GREEN" to the lead.
2. Shoot + judge stills 1-4 (Normal, Easy) and 1-5, upright + sideways (INT-3/shoot-14.mjs; STAGE-RULES §5b).
3. Bots: probe the three kinds left above (`castBots.ts --stage 1-4 --seeds N --json`; y via `firstTimer()` .stuck; frames via
`FT_FRAMES=a,b`); then 40 seeds again. 4. limits.json + tools/perf/run.mjs:34: scenario id "ctest-mix14" -> "ctest", then drawcheck.
**Lessons applied:** D15 (tested the measuring tool before trusting it), D19, D23, D53, D55, D57, LAWS 3, LAWS 22.
**Method update (BOTS.md / gates.md):** castBots' stuck lines should carry y: on a tower x alone names nothing. A bot helper that stops the
stuck clock (`busy`) must never hold it forever (seed 2 looped 1200 s). Never start a "last seen" point at NaN (it never updates).
**Learned:** a bot's "can't" on a new kind of stage is first a question about the bot's map (its route), not the level; a gate script must
not die with its session (run it where it outlives the box, or commit results as each gate ends).
