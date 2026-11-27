# ENG-CATCH-e (R-165.534; engine, Opus 5.5 xhigh): THE DOWN TOWER'S GUARANTEE. Branch t-eng-catch-e

## EXACT NEXT STEP (tail STOPPED, written 12:42 PM ET Fri 11-27 by `date`). CANDIDATE 18a353e4a: RED, NOT LANDED (the lead's order)
RED on 18a353e4a (the lead's report from ENG-CATCH-d, confirmed here on the frozen worktree): src/game/gen2/tower.test.ts:856, ENG-CATCH-b's
toy "going down, a bridge started a hop past a vine's top that misses the end's fall line is no catch: the end gets one of its own",
assertion 'no catch is laid twice' (:869): 3 !== 12 (12 catches laid, 3 distinct). tower.test.ts 44/45. It passes on d49de60f0 and fails
from ENG-CATCH-c box 1's mend on (6d296c1b7 carries it; the guarantee does not change it). Suite shard 4/6: 762 pass, 1 fail (this test).
NO FIX in this lane (the lead: Matt paused new work for the weekly usage limit; the next lead decides the fix box). The fix box re-runs the
gates below on its own candidate.
Gates on 18a353e4a (frozen worktree, base t-eng-w3 51ef0c6ab by hash):
- tsc 0; generalitycheck PASS (26 literals, 26 known); towerMend.test.ts 13/13.
- CI tool line: 355 tests, 354 pass, 0 fail (1 todo: chase bots, ENG-B4, standing).
- LOCK, two runs: `--out base.json` on 51ef0c6ab, 3264 builds of 102 stages; `--check base.json` on 18a353e4a: 102/102 stages unchanged.
- tierBots 9/9.
- Suite: shard 1/6 742 pass 0 fail; shard 4/6 762 pass 1 fail (tower.test.ts:856, above). Shards 2, 3, 5, 6: STOPPED unfinished (the
  lead's stop).
- PROOF (wt-try: bricks de6feebff = t-kit-w3a 39a3c5b52's w3.ts byte for byte; tower.ts and pipeline.ts byte-identical to 18a353e4a's),
  seeds 1-40 x both, probe/proof.mts (every refusal counted and named as it is made; LEAK = a down verdict line in a returned stage),
  logs proof/*.txt: EVERY CONFIG 80/80, LEAKS 0. Normal's rolls refused / tried: all five 3/42 (7%), root-down 0/40, two-roots 0/40,
  cap-down 1/40, cap-steps 1/41, shelf-hops 3/43 (7%; was 74/80). Worst stage: 1 refusal; each refused shape's next roll was clean.
- REPLAY (probe/replay.mts): the three new captures REFUSED by name, 0 leaks. The 58 old reds' re-capture (wt-old = 1b300ebc3 + the diag
  patch, clean apply) was STOPPED at 14 fixtures, not replayed.
- Not done: ENG-DEAL's shelf-hops re-run (ENG-DEAL is not on t-eng-w3; head still 51ef0c6ab).
For the fix box: the toy is tower.test.ts:856; green on d49de60f0 and red from box 1's mend on (ENG-CATCH-d's finding; checked here on
18a353e4a only): bisect the mend's remedies to find which one lays a catch twice. The guarantee (bc94dab78) is independent of it and was ACCEPTED by the lead as the design.

## What this box did (general: no stage id, seed or x)
- THE GUARANTEE (tower.ts towerCatches): a down tower NEVER RETURNS A LAY WITH A MISS. downInvariant runs on the final lay every time; any
  miss left after mend's bounded tries throws `TowerRefusal` ('tower: unmendable miss: <the miss line>', `UNMENDABLE`, `.miss` the line).
- pipeline.ts buildRolledOn: a refusal of Normal's lay (assemble's catch) or of Easy's lay of Normal's plan (ev = not ok, 'on Easy: ...')
  SKIPS THE ROLL (a 'reroll' repair, named) and the search rolls again; every roll refused before any was laid: throws that refusal by
  name; the Easy build of a refused Normal plan that its tower refuses throws "Normal's plan refused on Easy: ..." by name.
- MEND of the three new shapes: NONE KEPT, and why (e11 checked by hand; e19 is the same shape, 2 px over). A 180 px catch walled at x 31
  serving a cap shelf's end (fall line 121); its far end's fall line (235) has nothing for 497 px (to the storey at y 4647). A staircase
  down the wall breaks SLIDE.out 60 (the bough under it is at most catchW 180). Moved off the wall, its left end goes blind. A catch under
  the catch either lies in the turn vine's hop room (top x 254, y 4366, towerLids) or sits less than HEAD under the shelf 254-518. Running
  that shelf on covers its own vine's top. Wider than catchW is the Designer's number. So the guarantee refuses it.
- Result on the final bricks + this engine: seeds 11, 19 and 33 CLEAN on both settings, all five (rep-try-*.log): the refused roll is
  skipped and the next is clean. n33 is cap-steps ALONE (clean with all five on the kit tree).
- TOYS (towerMend.test.ts, 13/13 here): wall-e11, wall-e19, wall-n33 (crop.mts in probe/ here, which reads TRY's refusal) and 'unmendable'
  (an open shelf over 1400 px, the whole tower kept out). Each is RED on 6d296c1b7's tower (toyrun: a lay comes back with its blind drop)
  and green here (refused by name). PLANT: the refusal line removed -> the 4 guarantee tests RED (9 pass, 4 fail).
- NOT DONE: replaying the 58 captured reds (their fixtures were in ENG-CATCH-c/d's scratchpads, gone). The 8 toys cut from them pass here.
- Found: de6feebff CONFLICTS with t-eng-w3 51ef0c6ab in src/game/gen2/worlds/w3.ts (about 300 lines: W3a's tower bricks against KIT-W3b's
  3-2 content). The kit lane's merge; sent to KIT-W3a-e.

## Polish check
Engine-only (the lay and the roll search). No screen changed; the stills are the kit lane's on the landed tree.

## Learned
- A per-shape mend never ends: the guarantee (refuse by name, roll again) is what closes the class. Mend is now an optimisation, measured
  by refusals per 80.
- MY MISS: three capture runs started with a shell '&', against the brief (detached, untracked). They finished; every run since is a
  tracked background task.
Lessons applied: D115 (each run on its own frozen worktree), D119 (no heredoc with a commit), D128 (stamps from `date`), D134, D138, D140,
D154 (the invariant guaranteed, proven on the whole range), D156 (generality with tsc), D159 (lock base by hash).
