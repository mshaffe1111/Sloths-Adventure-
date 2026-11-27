# ENG-CATCH-c (R-165.534; engine, Opus 5.5 xhigh): THE DOWN TOWER'S INVARIANT, proven on the whole seed range. Branch t-eng-catch-c

## EXACT NEXT STEP (box 1 hand-over, written 11:04 AM ET Fri 11-27 by `date`). NOT FROZEN, NOT LANDED, NO GATE RUN
Base: t-eng-catch-c = merge of t-eng-w3 9818cc87d (ENG-CATCH, landed) into ENG-CATCH-b's frozen 861e2a22e (d49de60f0), + this box's WIP
commit (tower.ts, pipeline.ts's one call). tsc 0 on the WIP. No toy written yet; no probe, suite, lock or tierBots run on it.
The WIP (tower.ts; general, no stage id, seed or x):
- `downInvariant(platforms, vines, turns, floorY, width)`: THE named check, one list of DownMiss (towerFalls' blind drops and give-ways,
  towerHandOns' passes, towerLids), read with the vines where clearClimbs hangs them (climbX) and stopVines stops them. towerFalls and
  towerHandOns now map fallMisses / handOnMisses (the same lines, unchanged); handOn returns its `trail` (each way off walked, with dir).
- towerCatches takes `turns` (the column's turn vine ids and storeys; optional, default []); the cover lay is compared by downInvariant.
- `mend()` in layCatches, going down, after reLay: while misses are left (MEND.steps 16 kept, MEND.checks 400 tried), the first remedy
  that leaves FEWER misses is kept (converges): 1. the miss's own piece, if the lay laid it, re-laid (a turn's catch kept across its
  vine, least change first); 2. a run-on of any wood under a fall line the miss names, at its own height (flush under the lip allowed,
  LIP 24); 3. a free bough under the fall line (MEND.widths 180..90, SLIDE kept). Prefilter: fair() and endsLand() (openEnds' reading).
- pipeline.ts layCatches passes the column's turns (`turns.slice(mark.t)`, vine id + storeys) to towerCatches. tsc 0; generalitycheck
  PASS (26 literals, 26 known) on the WIP.
Replay (fast, ms per lay): 55 captured failing lays (every red of the kit tree 1b300ebc3 on seeds 1-40 x both: all five 14 rolls, each
brick alone, shelf-hops alone 34): base 17/55 clean (the 17 are Easy copies of Normal's lines), this WIP 48/55.
The 7 left (all the same class: a dip floor's far end over a storey hole, with the tower's OWN catches stacked in the way):
  shelf-hops n7 x 777-859 y 10527 (C#75 683-863 overhangs the end 4 px, cramping every run-on of C#73 887-1067 under the fall line 883);
  n9 x 789-879 y 10662 (C#75 705-885, 6 px); n2 x 549-647 y 6896 (C#42 708-904 @6927: its run-on to 647 leaves an openEnds end under
  the dip floor); n20 x 495-576 y 10644; n38 and cap-steps n12/n13 'a catch passes its storey' (a catch run on to the wall).
Next step:
1. ReadNotifications. `git fetch origin t-eng-catch-c t-kit-w3a t-eng-w3`; npm ci (--legacy-peer-deps) in the background.
2. Worktrees (each its own; D115): wt-kit = t-kit-w3a 1b300ebc3 (base); wt-diag = 1b300ebc3 + `git apply probe/diag-capture.patch`
   (records every towerCatches call in globalThis.__TC); wt-try = 1b300ebc3 + this branch's tower.ts.
3. Fixtures: in wt-diag, `GEN2_DRAFT=3-1 ROOT=<wt-diag> OUT=<scratch>/fix TAG=<name> KEEP=<brick ids> ROLLS=ALL npx tsx probe/capture.mts`
   for all five, each brick alone (w3-root-down, w3-two-roots, w3-cap-down, w3-cap-steps, w3-shelf-hops), run_in_background, two at a
   time (about 6 min each). Replay: `ROOT=<wt-try> FIX=<scratch>/fix VERBOSE=1 npx tsx probe/replay.mts` (under each roll's setting);
   near.mts prints the wood round (X, Y) of one fixture.
4. Remedy 4 (this box's plan): a run-on or bough refused ONLY by cramped/slotted against the tower's OWN pieces is laid with those
   pieces trimmed back off it (each keeping 60 px and the end it serves, served[k]), kept only if the invariant leaves fewer misses.
   Also remedy 1 for own pieces NEAR the fall line (not only the miss's own piece).
5. Toys (tower.test.ts, synthetic towers, each shape: n7's pass, e2's 454 px bridge, shelf-hops n12's dip floor, n7-hops' stacked
   catches, n8's rule-4 bough): RED on d49de60f0's tower.ts, green on the fix; plus a toy that downInvariant == the stage verdict's lines.
6. PROOF on wt-kit-tree + fix (probe/probe.mts, SEEDS=40): all five together 80/80; each brick alone 80/80; w3.test tower rows.
7. Gates once (the brief): tsc; CI tool line; lock as two runs (`--layouts 16 --out base.json` on t-eng-w3 9818cc87d, `--check
   base.json` on the candidate, counts line; ANY listed stage moves = STOP, send the lead each); suite in 6 shards; tierBots 9/9;
   generalitycheck. Freeze (D115, proven/ writable), send the lead the frozen hash; land on t-eng-w3 (no force), ls-remote, shard totals.
Lessons applied: D115 (probe, base and try each in its own worktree), D119 (no heredoc in a commit call), D128 (stamp from `date`),
D134 (next step pushed and proven by ls-remote), D138 (hand-over ends new work), D140, D154 (the invariant, the whole range), D156.
