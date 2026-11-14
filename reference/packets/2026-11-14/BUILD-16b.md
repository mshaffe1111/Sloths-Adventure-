# BUILD-16b: finish 1-6 "First Lianas" from BUILD-16's handover (R-165.203). Opus 5.5 high (content; a level builder). Written 10:45 AM ET 11-14.
Branch: continue t-build-16 from origin/t-build-16@9b167cf2 (BUILD-16 stopped at 38% context, measured). READ FIRST, IN ORDER:
reference/methods/level.md (Building rules first), reference/design/LEVEL-BAR.md, STAGE-RULES.md, DIFFICULTY.md (:61 targets), then
reference/qa-reports/BUILD-16/REPORT.md on t-build-16: its EXACT NEXT STEP 1-6 is your packet, with the lead's rulings below.
## Lead's rulings (10:36 and 10:40 AM ET)
- Step 1 GO: Normal ~21 swings a run, Easy ~12 or fewer (one liana where Normal lays 2-3); length from walked ground + root hops + rests,
  never more lianas. Re-score after each change (score.ts): targets Normal 6.5, Easy ~3. Floors stay: 2-minute minimum, the 143 s fast
  floor, every beat's first appearance taught. Matches Matt's "shorter swings" (R-165.225).
- Step 1b: goals.ts goalHave reads the petal count from stage/goal DATA (no world number, stage id or goal literal beyond the existing
  goal-type switch); unit test with petals and without (null stays null); generalitycheck; SIDEWAYS stills of the locked exit with Dot's
  sealed line, and the open exit after the last petal.
- Old proto 1-6 cleanup (protoStage.ts, dotTips.ts, old dotLinesData lines) is NOT yours: R-165.238, TIPS packet.
- Step 6, dblPractice LV-3: BEFORE removing it, write in REPORT what it checks and grep whether dblPractice runs in any living stage. If
  it does, RETARGET LV-3 to that stage keeping its intent; remove it only if its only subject is the dead old 1-6 (new replaces old),
  and say so with the grep. Never delete a test just to get green (LAWS 22).
- Beat 4 (liana-to-liana chain) waits for ENG-S5; build and ship 1-6 without it if S5 is not merged when you are green, and say so.
## Proof (D63: interactions judged on CLIPS)
Stills upright + sideways, Normal + Easy, of every beat; clips of the first liana, snake on your vine, the false liana, the gorge,
the sealed and open exit. The seed list + bots (addlevel), w1Arc16 test, full CLAUDE.md Checks (buildcheck ALONE, R-165.207),
plant.sh on a side worktree. Polish check section with each item and its still. "Learned" + proposed rule changes at the end.
BOX: 90 minutes or 40% context (400k of 1M) by the real figure. No until/sleep wait loops (D67). D57, D59, D61-D67.
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
