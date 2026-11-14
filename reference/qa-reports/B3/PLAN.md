# B3 PLAN (ENG-B3, t-eng-b3 from t-b2-chase@42d2d7a6; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Written 8:03 AM ET. Box 90 min (to ~9:30 AM ET) or 400k.
Method: reference/methods/stage-piece.md (the chase piece's own), stage-fix.md for the lay, gates.md. Lessons in play: D19, D23, D36, D40, D43, D57, D59, D63, D64.
1. **Owed gates on t-b2-chase@42d2d7a6** (side worktree, never the edited tree; 0t trap): unit suite in 3 shards, tooltests, every seed list
   (registrycheck --lists), registrycheck, tierBots, buildcheck. Running since 8:00 AM.
2. **B5 CHASE-LAY** (gen2/chaseLay.ts, K out of LATER in nodeLetters.ts (HOOKS moved the LATER set there from nodeCode.ts), pipeline.ts
   hook in assemble before the verdicts so they judge what ships, D19):
   - each `K` (pressure) node's sections = one stretch [its x0, its x1]; the node after it is its living fork (nothing there falls);
   - its route ground (main pieces, plain solid: no lift/ride/crumble/hang/creak/room) cut into branch sections (~BRANCH_TILE 222 px),
     marked `chase`, 40 px thick like the old 1-8; GeneratedStage.chase = the stretches;
   - refused by name: chaseLayProblems, plus the lay's own (a stretch over 4,000 px (1-8.md, K dial len), no fork after a stretch,
     two stretches touching); a refused lay is an error in gen2.errors (the roll fails), never a broken chase;
   - flags by rule (STAGE-RULES:105-109 + D49): none inside a stretch, one on every fork, spacing still by ROLLED_FLAGS;
   - planted tests (red without): K lays a chase on two worlds' kits (W1 real kit, the legs fixture); a bad lay refused by name; no flag in a
     stretch; the in-play check (RealPlay: engine drawPlats holds none of its sections; the piece starts on it).
   - lockall 102/102 unchanged (no shipped graph has K); seed list 1-1 --check.
3. **The tint**: C4 baked once per screen size into a cached canvas (one drawImage a frame), bark chips, re-bake on restore (D6);
   contrast.mjs bar unchanged incl. upright; drawcheck.
4. Full CLAUDE.md Checks on my head.
**Pushback (named before starting):** the study sizes B5 alone at 3 h (ENGINE-678.md:52) and the tint was ~1 h+ for B2 twice; with the
owed gates (~45 min CPU) and the full Checks at the end (~50 min CPU on 4 cores) the 90-min box cannot hold 2 + 3 + clips at the bar. Order
by D40 (foundation first): 1, 2 (lay + refusal + flags + in-play check, tested), 4; then 3 only if 2 is green. The laid-chase CLIPS both
ways need a stage that lays K on the real page (no shipped graph has K; 1-8's build is w1Arc08): I will shoot them on a test-graph stage if
time allows, else they are named UNRUN with the exact command. Nothing will be left running at the stop (D59).
