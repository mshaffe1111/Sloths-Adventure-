# ENG-INT5 REPORT (t-eng-base from t-int-6@f9671e3b; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 xhigh. Box 8:52-9:50 PM ET, ctx ~18%.
**GREEN 3395a0a3** (merges 520f17d6; later commits are this folder only, fast gates 0). **EXACT NEXT STEP:** 1. HOOKS, A1, B1 branch from
t-eng-base's head. 2. LEN-14's fork job (INT-6 REPORT step 2) merges this head first. 3. Nothing left to run here; what builds on it runs its own gates.
## Done (evidence)
- Merged (never rebased), tsc 0 after each: t-feel-cam@90b3e73 (603efc60, clean); t-len-14@2467b5e5 ONLY (e57106c4, clean; `grep -rn
  ROTTEN_FORK src` = 0); t-pieces@69dc3e26 (5a5ec2a3); t-nodes@1829470f (520f17d6).
- Conflicts at the root, nothing dropped: castPlay.ts keeps HEAD's `ground` AND PIECES' `lures` + `data.landing ??`. B14's beatClock block
  kept; PIECES' identical line, its 2nd `import { beatClock }` and 2nd `GeneratedStage.clocks` dropped (PIECES REPORT: "B14's own: skip").
  t-nodes' engine.ts nets to 0 vs the head (the vault patch was in): vineTop.ts byte-identical, VAULT_GAP once, none in pipeline.ts = ONE
  vault finder; HEAD's vineFeel import kept. engine-core.md: all sections kept (t-nodes' as 0p-0s, PIECES' as 0o: letters collided).
  t-pieces' root PLAN.md/REPORT.md moved to qa-reports/PIECES/ (INT-3's rule).
- Lock (lockall --layouts 16, 3,264 builds): head vs base f9671e3b **102/102 unchanged** (gates/lock-head-vs-base.txt): the merges move no
  stage. Head vs 0.9.7 d8d6a973 **99/102** (gates/lockall.log): 1-2, 1-4, 1-5, every one already moved on the base (lock-base-vs-097.txt)
  by INT-3..6's levels since 0.9.7 (1-2: FIX-B's chain cap in w1Arc12.ts, d3c63212; 1-4: B14; 1-5: B15).
- castBots 1-4, seeds 1-40: **242/360**, row for row equal to INT-6's base run (kid 20/27, adult 35/33, child 22/19, middle 27/29, expert
  30). One adult Easy run (99 s) is 1 s under the 100 s floor: the same on the base; the fork job's (INT-6 step 2).
- camFeel 1-4 on the head, 6 moves x 2 orientations: within ~1 css px of FEEL-CAM's measure-after, worst jerk 4.4 (cam/1-4-summary-head.txt).
- Gates ONCE on 3395a0a3 (gates/run.sh = every CLAUDE.md Check + CI step; RESULTS.txt), awaited (D59), ALL 0: tsc; unit 3,365 (3,363 pass,
  0 fail, 2 todo); build + chunkcheck (3.2 MB spare); art; known; generality (27 known); roadmap; kbd; seed lists 1-1..1-5 (257/100/100/
  100/150, 0 refused); registry; tool tests 74; tierBots 7; drawcheck; clipcheck (83 known, none added); buildcheck alone (p95 113/78 ms).
## Polish check (camFeel frames on the head's page, 390x844 + 844x390)
- stills/1-4-grab-up-sheet.jpg: the view glides up with the grab (f10-f20), no cut; Pokey on the trunk, clear of the HUD.
- stills/1-4-off-side-sheet.jpg: ROUGH, not new (FEEL-CAM's named spot 1, lead-passed): after the jump-off he sits at the bottom edge
  ~0.5 s (f24-f31) before the view eases down (f34). Dot's pod card stays up (the harness never taps). Nothing else drawn changes.
## Pushback
- Session clones are SHALLOW with few heads: merge bases were wrong until `git fetch --unshallow`; roadmapcheck failed 8 "commit not on any
  branch" until `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`, then PASS. Root PUSHBACK.md (R-165.62) is still on the base: left.
## Learned / Method update (gates.md "integration"): step 0 = unshallow + fetch every head. A branch that hands holders patches names
the hunks already on the head (PIECES did); the merge drops exactly those and tsc proves no duplicate. **Lessons:** D23, D29, D36, D48, D53,
D55, D57, D59; LAWS 3, 5, 22. **Method:** ENGINE.md day one, gates.md, INT-6's run.sh. **Turnover:** engine-core.md §0o (5a5ec2a3); this.
