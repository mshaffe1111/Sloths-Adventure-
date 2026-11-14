# INT-9b REPORT (t-int-9, link #3 = 1-7 + everything on t-int-9, old 1-6). Integrator, Opus 5.5 xhigh. 4:29 to 5:41 PM ET 11-14.
## STATUS: PHASE A GREEN. Head origin/t-int-9@09f44c30. Phase B not started (ENG-16F's t-build-16 is NOT GREEN, 5:22 PM).
## Done-items (phase A)
1. ENG-16F tools-only picks: c84ca45f (679424b0; one import conflict, kept ours + PlayerState; BUILD-16d snake imports left to phase B)
   and 92417f14 (clean). NOT taken: 7904cb65 (FAR, new-1-6 data), 045b8a93's 1-6 rows, 8f429a6a + e4322053 (tools-only, arrived
   after the run started; link #3 green without them; told the lead 4:54/5:05; they come with the phase B merge).
2. requiredMove (old 1-6): PASS at 679424b0, RED at fb409960 ('time' vs 'shrine'), A/B same machine, test untouched.
3. 1-1 tier calibration: ENG-16F's (045b8a93) does not replay here (made on main's 1-1; link #3 has POLISH-6/7/8's relisted 1-1).
   Re-ran BOTS.md's command on this head: 0 pass/fail flips in 5 tables, 200/200 at the shrine, 24/200 lines moved; tierBots 7/7
   (b288b3fa; INT-9b/cal/compare.txt).
4. Every gate once on b288b3fa (gates/RESULTS.txt): all 0 except unit 3513/3514. buildcheck re-run alone 0 (the first ran beside my
   8-3 shooter: p95 91 then 104 ms vs 150). roadmap's first try hit the shallow-clone guard; unshallowed, 0.
5. The red: softFalls11.test.ts 8-3 byte pin. Bisect (softfalls83/bisect.txt): green 7df7b8e3, red from 3ad51f04 (INT-9's any-slot
   bank rule). L2 and L3 each: two log banks' bottoms deeper only (L2 to 763.53, L3 to 759.53), all else byte-identical, L1 unmoved.
   Re-pinned per the lead's 5:33/5:38 rulings (09f44c30); whole file 7/7; post-pin tsc, known, roadmap, generality 0.
6. Link #3's game = INT-9's judged build: dist-fb409960-vs-b288b3fa.txt (1049 files, only the build stamp differs).
## Polish check
- 8-3 L2 and L3, the four banks, on the game (__play('8-3', v)), upright 412x915 + sideways 915x412, before/after
  (softfalls83/sheet-*.png): each bank grounded, nothing floating, no visible change (bottoms sit in the dark under the play line).
- 1-1 / 1-4 / 1-7: not re-shot; byte-identical build (item 6), INT-9's judged stills/clips stand.
## Other locks that stop at a first failure (the lead's ask)
grep createHash/'byte for byte' in tests: verdicts.test.ts (h(), :226), stageBackdrops.test.ts (one image), heroNoise, sceneryStrip,
w5Anims, stageQuality, dotGuide, cameraFollow, jumpHeight, variation. All PASSED whole in the run, so every item they loop over was
reached; only a failing loop hides later items, and softFalls11 was the only one.
## Phase B prep (for whoever runs it)
- Dry merge of t-build-16@c84ca45f: 10 conflicts (gates.yml, engine-core.md, listed.ts, flownArcs.ts, stageTable.ts, protoStage.ts,
  stagePlan.ts, firsttimer.ts, pitClimb.test.ts add/add, limits.json). calibration-main.jsonl: re-run on the merged head.
- D70 BUILD-16b petal seal (read on t-build-16): goals.ts, goalInfo.ts, engine.ts, stagePlan.ts PASS. FAIL: DotGuide.tsx:1430 Dot's
  goal.done line reads QUOTA.has(objectiveType): 1-6 (vine_runner, gathers petals) never gets it when its share opens the exit;
  fix with countedGoal + a planted test. Note: levelCheck.ts:986 quota check is harvest-only (can't fire: share from held petals).
  BUILD-16c/16d bot code: not yet reviewed.
## Pushback: none on the packet. One gap in it: phase A's "every gate once" could not see L3 behind L2's failure (now covered above).
## Suggestions (ready packets)
1. GATE-LOOPS: byte-pin tests that loop (softFalls11 MAIN, verdicts h()) collect every failing item and assert once at the end, so a
   red names every moved layout (planted: two moved layouts both named). Owner: Critic (tests/gates).
2. Integrator role card (roles/INTEGRATOR.md) from handoffs/integrator.md (INT-7/8/9's suggestion, still open).
## Unresolved: phase B (items 1-4) waits for t-build-16 GREEN. DotGuide goal.done FAIL is on t-build-16's code, fixed at the merge.
## Lessons applied: D19, D29 (no PR), D30 MISS x3: message times 4:54, 5:05 and 5:41 PM were typed, not pasted (1-3 min ahead of
   date; the "5:41" one went out before a date call read 5:40); D36, D57 (queue read at every push), D67 (no sleep loops), D69, LAWS 5 + 22 (re-pin only on
   the lead's ruling, with the diff and stills).
## Method update (integrator.md): (a) a cherry-picked bot or harness change re-runs the 1-1 calibration on the LINK's own 1-1, never
   copies another branch's jsonl; (b) a red loop test is re-run whole after the fix (first-failure hides later items); (c) buildcheck
   runs with nothing else on the machine, including your own shooter; (d) unshallow (git fetch --unshallow) before roadmapcheck.
## Turnover: handoffs/integrator.md rewritten in this commit.
