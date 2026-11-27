# ENG-LATE REPORT: every goal's late "Still {n}" line says the live count, whoever owns its words (R-165.569)
t-eng-late from f4e77273 (t-build-29; src/ and tools/ identical to 7b55f15bf, the lead checked it). Engine tier, xhigh. Start 5:49 PM ET (`date`).

## EXACT NEXT STEP (hand-over 6:14 PM ET, box 1 of ENG-LATE; engine tier, xhigh)
The fix, its tests, the plant, the pre-freeze and THE LOCK are done (below). Left: two gates, then the landing.
1. ReadNotifications. `git fetch origin t-eng-late t-build-29`; `git ls-remote origin refs/heads/t-build-29` must still be f4e77273 (if
   not: merge it by hash and tell the lead). Freeze again in a detached worktree at the CODE head **a467e85b** (the commits after it on
   t-eng-late are report/handoff only): `git worktree add --detach <scratch>/frozen a467e85b`, `ln -s <repo>/node_modules` into it.
2. THE CI TOOL LINE on the frozen head: `.github/workflows/gates.yml` line 157, the whole `npx tsx --test tools/...` line; verdict + `# tests/pass/fail`.
3. THE SUITE in 6 shards on the frozen head (deploy.yml:38): `npx tsx --test --test-shard=i/6 src/audio/*.test.ts src/game/*.test.ts
   src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts`
   for i = 1..6, no more than 3 at a time; each shard's totals. Every red: file:line, run alone on 7b55f15b (worktree) to prove ours or
   inherited (R-165.531, R-165.550 are inherited and owned).
4. LAND: `git checkout t-eng-late && git pull --ff-only`; `git push origin t-eng-late:t-build-29` (a fast-forward from f4e77273; no
   force, never rebase); `git ls-remote origin refs/heads/t-build-29` equal to t-eng-late's head; message the lead the landed hash and
   every counts line (here and steps 2-3).
5. Already raised to the lead (not ours, not fixed here): storyTipScan --check RED on 2-9, inherited (§5).

## 1. Red first (on 7b55f15bf, w5Order.test.ts whole)
- `npx tsx --test src/game/w5Order.test.ts`: **tests 26, pass 25, fail 1.** The red: test 26, "the goal's "Still {n}" line says the
  count as it is when it is read, not as it was when it was sent (5-3, and every goal)", error `'2-9: "Still 9 snappers to chase off" is not counted'`.
- On main 49fdc8cb6 (detached worktree): **tests 26, pass 26, fail 0.** Why: main has no GOAL_LINES; 2-9 there sends the stock
  template, `Still 9 predators to defeat before the sanctuary opens`, which the switchboard's `goal.late` row swaps (to `Still 9 predators
  to defeat!`) and marks counted. On t-build-29 the keeper's words (`stagePlan.ts` GOAL_LINES `'2:gauntlet'`, late `Still {n} snappers to
  chase off`) match no switchboard row, so `dotLines.ts` `engineGuideLine` (counted only when `sw?.line.id === 'goal.late'`) laid it as
  `{key: 'engine:Still 9 snappers to chase off', kind: 'info'}`, not counted.
- Worse than the test said: it was also queued as **info** (priority 20, wait 9 s) where main's 2-9 line is the **goal** (priority 35,
  wait 30 s), with a key that carried its number. On a replay of a cleared 2-9 it would still be said (`DotGuide.tsx:330` drops only
  counted lines), and the goal-done clear (`DotGuide.tsx:1439`) would not take it down.

## 2. The fix (general: no stage id, seed or x)
- `src/game/stagePlan.ts` `goalLateCount(text, world)`: is `text` the late line `goalLine` lays in this world for any counted goal,
  whoever owns its words (the stock template or a world's GOAL_LINES)? Its count, or null. The line is recognised by what it IS
  (goalLine's own late words), not by one switchboard row.
- `src/game/dotLines.ts` `engineGuideLine`: the late line is the goal (kind `goal`, move none, key `engine:goal.late`, `counted`), exactly
  the fields the switchboard's row gives (probe: 2-9, 2-5 and 5-3 lines compared whole). The row-id test is gone.
- Failure path: `stagePlan.ts` `uncountedLateLines(table)` names every world's late words with no `{n}`; `goalLine.test.ts` refuses
  each by name (empty today; planted `'9:harvest'` with `Keep collecting!` is named).
- Not counted, on purpose: the locked exit's line (sealed). It is said at once over any line, and a counted line is dropped on a replay
  (`DotGuide.tsx:330`): counted, a replay's sealed door would go unexplained (STAGE-RULES: Dot explains any locked exit). The new test
  holds every stage's sealed line uncounted.

## 3. Proof
- New test (goalLine.test.ts): every listed stage (generateAllLevels + the extra stages), its goal as the engine counts it (goals.ts
  countedGoal) and as its data names it, counts 1, 2, 9, 37, Dot there and away: counted, kind goal, key `engine:goal.late`, and the live
  count replaces the sent one. It walks both owners of the words (the row and a world's own) and fails on fewer than 200 lines. Settings
  (Normal/Easy) do not enter goalLine or engineGuideLine (neither takes one), so the loop covers both by construction.
- RED on the base dotLines (stagePlan's exports added first so the red is the real one): `2-9 gauntlet n=1 Dot: "Still 1 snapper to chase off" is not counted`.
- PLANT: the fix's counted rule put back to the row id: **tests 3, pass 2, fail 1**, the same 2-9 line named. Restored.
- Green: goalLine.test.ts **tests 3, pass 3**; w5Order.test.ts whole **tests 26, pass 26, fail 0**.

## 4. Pre-freeze
- `npx tsc --noEmit -p .` exit 0; `npx tsx tools/engine/generalitycheck.ts` **PASS** (71 engine files, 26 literals, 26 known).
- Every test file importing dotLines.ts or stagePlan.ts (grep of the imports: 42 files) plus stagePlanGoals.test.ts, each run whole:
  **files 43, tests 424, pass 423, fail 0**, 1 TODO (w1Arc19.test.ts R-165.312, owned). Per-file totals: below.
- `git ls-remote origin refs/heads/t-build-29` f4e77273 (the lead's base, unchanged). Frozen head a467e85b, detached worktree.

## 5. Gates on the frozen head (a467e85b)
- **THE LOCK, two runs alone:** base `npx tsx tools/engine/lockall.ts --layouts 16 --out base.json` on 7b55f15bf: `lock: wrote 3264
  builds of 102 stages`, 7m17s, exit 0. Check `--layouts 16 --check base.json` on a467e85b: **PASS, `lock: 102/102 stages unchanged`**,
  7m19s, exit 0 (its `gen2 gained verdicts and drops (not hashed)` line is the tool's usual note, also in INT-14's and VAR-19e's checks).
  A line's counted flag changes no layout, as expected. Log: gates/lock-check-a467e85b.txt.
- **storyTipScan --check: FAIL, INHERITED.** `2-9 seed 1 (normal+easy) | info | That's the king! Now the drum's twice as fast!` (1 laid
  line dropped on Tips over 17 listed stages, 158 laid lines read). The same line and counts alone on 7b55f15bf (gates/storyTipScan-7b55f15b.txt):
  not ours. The line is `w2Arc29.ts:55` `roar`, laid as plain info; BUILD-29's tool line passed storyTipScan on an earlier 2-9 head
  (BUILD-29 REPORT:509), so it came in on t-build-29 since then. Raised to the lead for an R-id; it is 2-9 content (lay it at its source:
  a warning, a story beat or a teach line), not this packet's.
- tipwalk: not run (my change does not touch how a tip is laid or dropped: only a goal late line's kind/key/counted, which no laid hint is).
- CI tool line and the 6 suite shards: NOT RUN in this box (EXACT NEXT STEP 2-3).

## Polish check
No screen changes: the line's words are the keeper's, unchanged; what changes is that its number is the live one when it is read.

## Pushback
- The packet's step 4 base (7b55f15bf) had already moved when I started (two report-only commits): built on f4e77273, told the lead, who confirmed it.

## Method used / Lessons applied
- reference/roles/ENGINE.md day one (planted failure first; lock), methods/gates.md. Lessons: D43 (a fix keyed to one stage or row id:
  this one is keyed to what the line is), D121 (the principle tested where the player hears it: every stage's line through Dot's guide),
  ENG-CATCH-d (every importer of a changed source run whole before the freeze).

## Learned / Method update
- A switchboard row is one owner of a line's words, not the line's identity: anything that keys behaviour (counted, kind) on a row id
  breaks the day a world or stage writes its own words. Proposed for engine-core.md §3 traps.

## Unresolved
- The CI tool line and the suite in 6 shards are not yet run on a467e85b (next box). The landing on t-build-29 waits on them.
- storyTipScan's 2-9 red is inherited and not fixed here (2-9 content; the lead owns its R-id).
