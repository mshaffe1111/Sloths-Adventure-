# ENG-CATCH-e (R-165.534; engine, Opus 5.5 xhigh): THE DOWN TOWER'S GUARANTEE. Branch t-eng-catch-e

## EXACT NEXT STEP (box 3 hand-over, written 12:01 PM ET Fri 11-27 by `date`). CANDIDATE 18a353e4a FROZEN (pushed, ls-remote equal); NOT LANDED
Candidate 18a353e4a = ENG-CATCH-d's 6d296c1b7 + this box (bc94dab78 guarantee, ab059518d toys) merged with t-eng-w3 51ef0c6ab (THE LOCK BASE,
by hash: t-eng-w3's head when this box started, D159). Sent to the lead and KIT-W3a-e. tsc 0; generalitycheck PASS (26 literals, 26 known).
RUNNING past the box (the SAME frozen candidate only, D138), logs in this session's scratchpad:
- PROOF on wt-try (frozen: bricks de6feebff, byte-identical to t-kit-w3a 39a3c5b52 / 2a18464da's, the FINAL pieces; tower.ts and pipeline.ts
  byte-identical to 18a353e4a's), seeds 1-40 x both, probe/proof.mts here (probe.mts + every refusal COUNTED and NAMED as it is made, a
  'name' setter on TowerRefusal's prototype, no engine change; LEAK = a down verdict line in a returned stage): chains (all five, then
  cap-down), (shelf-hops, then two-roots), (cap-steps, then root-down). proof-<config>.log; line 1 is the counts line. Seed 11 alone, all
  five: ok 2/2, refusals 2 in 2 builds (Normal's search refused the e11 shape on Easy's lay, the next roll clean), leaks 0.
- CI tool line on wt-cand (ciline.log).
- LOCK run 1: `lockall.ts --layouts 16 --out base.json` on 51ef0c6ab (wt-base). lock-base.log.
Next:
1. ReadNotifications. Read each proof's first line and its reds. The bar: NO roll in any config ends with a tower miss that is not a
   refusal ('tower: unmendable miss: ...' in the repairs; a seed with no clean roll names it); refusals at most 2 of 80 per config; all five
   together at least 78/80. Any tower blind drop / pass / lid in gen2.errors = the guarantee leaked: STOP, it is not frozen; tell the lead.
2. GATES once on the frozen worktree wt-cand (18a353e4a, src and tools immutable): the CI tool line; LOCK run 2 `lockall.ts --layouts 16
   --check base.json` with the counts line (ANY listed stage moves = STOP, send the lead each); the suite in 6 shards; tierBots 9/9.
3. When ENG-DEAL is on t-eng-w3: merge it into a scratch copy of wt-try and re-run shelf-hops alone (the lead: n13 is ENG-DEAL's node).
4. LAND: merge 18a353e4a onto origin/t-eng-w3 (no force; never rebase; refused: fetch, re-merge, re-check); ls-remote; send the lead the
   landed hash, the six-config counts line and each shard's totals.

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
