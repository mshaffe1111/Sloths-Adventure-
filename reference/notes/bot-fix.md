# bot-fix: notes (process supervisor)

Last updated: 2026-11-04 11:42 AM ET

## The job
Process supervisor (reference/roles/SUPERVISOR.md; partner: QUALITY-SUPERVISOR.md). 30-minute check-in rounds, arming my own send_later,
on the helpers the lead names; ONE digest per round to the lead (session_019iachLiuwNTAZUBSJWUmR3), green / yellow / red. I check the
work was done right; the quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi) checks it is the right work and fun. Stop arming only
when every helper is idle AND the lead says so. Effort: low to medium.

## Helpers in my rounds (from the lead, 2026-11-04)
- kaizen-gates (release clerk): session_01FhBbYLQLBzxjL4zXFnnnTa
- warmup-5m (WebGL stage 0): session_01FhBbYLYP8Hu1LT843p3UmE
- fix-petals (World 1 validator): session_01FhBbYNRctndrKCxzfkJ8KU
- quality supervisor: session_01FhBbYNn4i5tFfFZiFroKoi
- roadmap-keeper: session_01FhBbYP1yNSfRRofd3CkPwq
- menus A (R-6.40 new game + 3 save slots, added 11-04 11:37): session_01FhBbYKJALSX3wkm52jNTou; 5.5 h from ~11:37, show-first first.
- w8-rope2 (R-159.1 combat triangle, added 11-04 7:51 AM ET): session_01FhBbYMTQ1zFtXBWtxzkoxn, branch w8-rope2. PLAN FIRST: no
  game code (src/) until its plan is approved AND GPU stage 0 is merged; check its src diff against main is empty.

## Per helper, every round (SUPERVISOR.md)
**Standard work (Matt 11-04, in SUPERVISOR.md):** started from its method file? the method's best measured result (time/tokens): beaten or
missed, and why? Miss with no reason: coach. Beat: lead writes it into the method the same day. Digest carries a "standard work" line.
Methods now: warmup-5m -> webgl.md; fix-petals -> validator.md.
**Celebrate wins (Matt 11-04, in SUPERVISOR.md):** a job quicker than expected or better than asked: tell that helper by name what it
beat and by how much, put it at the TOP of the digest, and get the how into its method. Digest order: WINS, then OVERS (cause + fix),
then per helper, then the standard-work line.
**Planned vs actual (Matt 11-04, in SUPERVISOR.md):** every round, per running job: expected (ROADMAP.md estimate or method best) vs
actual; digest LEADS with jobs over / heading over: cause (one line, never "it's hard") + barrier-removal step (one line). Real hours at
each job's end go to the roadmap keeper. Planned times (roadmap keeper 10:42; helper running hours, review/Matt waits not counted): R-3.2 start 9:35, 2 h, end ~11:35;
R-150.8 start 10:25, 1.5 h, end ~11:55, then R-155 1-5 plan (~0.75 h/stage); R-159.1 start 8:00, 9.5 h (7-14), end ~5:30 PM (3-10 PM);
R-6.38 pits (w8-rope2) 3 h. At each job's end: real start + accept times to the roadmap keeper.
Branch contains origin/main (git merge-base --is-ancestor); gates (all of gates.md; drawcheck in a container = "CI at merge", never
"pass"); checkbase on any "after" sheets, newest stills opened myself, upright AND sideways; report has Method used / Lessons applied /
Method update and names rough spots; notes file current; queue read; HF spend inside Matt's list; moving (quiet 60+ min: nudge).
Escalate at once: a law broken, a retirement trigger, a red gate on a release branch, unapproved spend, anything rough that could reach Matt.

## Status
- 2026-11-04 11:42 AM ET: day-2 round 7 digest sent. main -> 68b31e66 (0.9.4 PR #62 11:30): APK on Releases v0.9.4-31 (verified), deploy run
  41867948096 in progress at 11:44. No branch contains main yet (merge needed, D23). AT RISK: w8-rope2 holds R-159.1 (QS REDO loop) +
  R-6.38 pits (not started) -> ~8:30 PM back to back; two fixes proposed. warmup-5m R-3.2 gate green 11:25 (1 h 50 run), accept waits
  on the phone check; funcheck not on its branch (needed after ccr merge). fix-petals: notes stale + merge main sent 11:43. menus A: no
  branch yet. Round 8 armed: trig_01WgAtKX4wgjAEbRdoqXfPPi, 12:13.
- 2026-11-04 11:39 AM ET: lead corrected my R-150.8 comparison: start-to-accept 1.2 h vs 1.5 h (~20% faster), not 3x. Owned; corrections sent to the
  keeper (record 1.2 h) and fix-petals (stage-fix.md best-result line: both numbers).
- 2026-11-04 11:37 AM ET: R-150.8 accepted (lead merge 160b9c6e 11:35); real times sent to the roadmap keeper (start ~10:25, report 10:57, accept 11:35;
  ~32 min running vs 1.5 h). Lead added menus A (R-6.40, 5.5 h, from ~11:37, due ~5:07 PM) to the rounds; round 7 prompt updated.
- 2026-11-04 11:35 AM ET: fix-petals R-150.8 final (7b544fe7): gate on 93450fb2 all PASS (2,299/0), sections present, stage-fix.md best result = this
  run. Checked; WIN confirmed to it and the lead. Pending: lead's accept -> real start ~10:25 + accept time to the roadmap keeper.
- 2026-11-04 11:09 AM ET: day-2 round 6 digest sent (first with wins / overs / standard work). WIN fix-petals R-150.8: plan 1.5 h, ~10:25 -> report 10:57
  (~32 min, ~3x), 1-4 rescues 58->19, QS PASS; provisional on its gate (running on 93450fb2) + report sections; told it by name. WIN QS:
  verdicts by 11:01 vs promised 11:35. No overs: warmup-5m R-3.2 report 10:52, gate running (due 11:35); w8-rope2 R-159.1 ~3.1 h of 9.5,
  QS REDO + polish in progress, R-6.38 placing not started. Roadmap keeper gets R-150.8 real times on the lead's accept. Round 7 armed:
  trig_013yiWwJ4iUTvrZ4d1YxJe4E, 11:40.
- 2026-11-04 10:41 AM ET: lead: Matt's celebrate-wins rule added; merged ccr; round 6 prompt carries it (digest order: wins, overs, helpers, standard work).
- 2026-11-04 10:41 AM ET: lead: Matt's planned-vs-actual rule added; merged ccr again; round 6 prompt carries both rules + the estimates.
- 2026-11-04 10:39 AM ET: lead: Matt's standard-work rule added to SUPERVISOR.md; merged ccr into bot-fix; round 6 prompt carries the check.
- 2026-11-04 10:35 AM ET: quality supervisor replied: it was waiting on a show-first still instead of watching the build (owned). Now: QC of w8-rope2's
  R-159.1 code (9ec60be2) on the real screen, then fix-petals' d6dc6e91, then World 1 re-record; verdicts in its notes within the hour.
  Round 6: check its notes have them.
- 2026-11-04 10:34 AM ET: day-2 round 5 digest sent. Round-4 items closed (w8-rope2 HF verified; fix-petals report verified, merged 15aa4de7).
  YELLOW warmup-5m (GPU stage 1 R-3.2 started 10:05; notes stale 8:54: sent 10:34). YELLOW-light w8-rope2 (game code started 10:16,
  allowed per STATUS 850; 7 files +485 vs ccr incl. w1TricksPlay.test; notes 10:02 predate code: sent). YELLOW quality supervisor (quiet
  since 9:32: asked 10:34). GREEN fix-petals (R-150.8, re-merged ccr 10:23). Round 6 armed: trig_01SmRgaodoM2E2sVBzURLjjr, 11:05.
- 2026-11-04 10:21 AM ET: fix-petals GREEN: reference/qa-reports/validator/README.md (c5fff14c) has the full gate on 3495372a (no src/tools change since,
  diffed), CI 41848331105, all report sections. Told it and the lead; ready for the lead's merge.
- 2026-11-04 10:03 AM ET: w8-rope2 GREEN, hold lifted (lead). Both approvals were in ccr STATUS (lines 848 R-159.1 ~$2.32 cap $4; 852 R-6.38 pits ~$0.88
  cap $1.40; combined $5.40) at 58ee7642, the version I read: MY MISS, my grep was head -10 of 22 matches (the oldest). Spend per
  tools/art/combat/jobs.txt: $0.74 done + ~$1.40 running = ~$2.14 of $5.40. PIT-LIST header fixed b71281af. Owned to the lead.
- 2026-11-04 10:02 AM ET: day-2 round 4 digest sent. RED (escalated) w8-rope2: HF takes made (49181d3a "Matt-approved pit list", b5e92ad7, 76498768,
  db520860) but PIT-LIST.md still says "for Matt's NEXT approval; nothing spent" and no approval found in notes/plan/STATUS; asked it
  (10:02) for where approval is recorded + real $ + header fix + no more HF calls until confirmed. Its src diff vs main = only stage 0 via
  ccr (no own game code). YELLOW fix-petals: fun gate built (CI 41848331105 success on 14777165, verified; funknown shrink-only, owner D26);
  still owes tsc/tests/build + report sections (re-asked 10:04). GREEN warmup-5m (stage 0 merged to ccr), QS, roadmap-keeper. Round 5
  armed: trig_01JjaWTNxLcryDAydcRchJYY, 10:33.
- 2026-11-04 09:29 AM ET: day-2 round 3 digest sent. YELLOW fix-petals: validator accepted by QS, but "gates green" has no pasted lines anywhere and the
  branch changes src (firstTimerBot.test, gen2/game.ts KID_RUNS_59 re-measured 8,3,3,5,7,5 median 5, goals.ts, goalsEasy.test); sent
  back 9:29 for a report with the full gate on its latest commit + the three sections. GREEN warmup-5m (waits on merge), w8-rope2 (src
  empty, waiting), quality supervisor. Idle OK: kaizen-gates, roadmap-keeper. Round 4 armed: trig_014uazqPCSZD6wFngDcBRdNJ, 9:59.
- 2026-11-04 09:02 AM ET: fix-petals answered (9:01): pushed 6103af1b = addfefff (bounce-wall bot fix + QS REDOs) + ccr 0f1b6c0c. Checked: contains main
  and ccr 0f1b6c0c; merge changes no src/tools; notes 9:01. It owned the 70-min no-push gap. Flag closed. Round 3: look for the gate
  lines behind its "gates green".
- 2026-11-04 08:56 AM ET: day-2 round 2 digest sent. GREEN warmup-5m (full gate green on 658ff7e1, pasted at 5a5c5b98: ready for the lead's merge;
  roadmapcheck absent on its branch, CI at merge). FLAG fix-petals: no push since 3:53, no reply, no ccr re-merge, session alive, context
  ~729k/980k: 60-min nudge 8:56; RED at round 3 if nothing lands. GREEN w8-rope2 (show-first boards, src diff empty, paste-ups stamped;
  opened stomp-vaults-up + punch-stuns-side), quality supervisor (R-159.1 PASS rev 2). Round 3 armed: trig_014qA75ve4t5GzHDgaB1UMe5, 9:27.
- 2026-11-04 08:27 AM ET: warmup-5m answered both items at 226e5421; checked myself: cause bisected (layer start-up 400-650 ms competed with parallel
  walks), fix 658ff7e1 at the cause, clipcheck alone 2/2 PASS pasted, q1 buffer 1px catch, notes 8:26. Full gate re-running on 658ff7e1:
  check its lines at round 2.
- 2026-11-04 08:23 AM ET: day-2 round 1 digest sent. YELLOW warmup-5m (fix 658ff7e1 8:16, no clipcheck PASS pasted yet, notes stale 4:36: sent the
  two items 8:22). YELLOW fix-petals (no commit since 3:53, no ccr re-merge yet: asked 8:22). GREEN w8-rope2 (src diff empty, plan
  reference/plans/R-159.1-combat-triangle.md, notes), quality supervisor (230a06d0). Idle OK: kaizen-gates, roadmap-keeper (D28 batch).
  Round 2 armed: trig_01UaBWoEAg3cnkDceLSafqah, 8:54 AM ET.
- 2026-11-04 07:51 AM ET: lead added w8-rope2 to the rounds (plan-first; no src until plan approved + GPU stage 0 merged). Round 1 prompt updated.
- 2026-11-04 07:48 AM ET: RESTART (lead, Matt 7:47 AM ET). Rounds every 30 min again. Running: warmup-5m, fix-petals, quality supervisor. Idle:
  kaizen-gates (0.9.4 waits on Matt), roadmap-keeper (a batch coming). Round 1 armed for ~30 min: warmup-5m's clipcheck work, fix-petals'
  re-merge of main + ccr.
- **2026-11-04 04:46 AM ET: STOPPED for the night (Matt's 5:00 AM ET token stop). Nothing armed.** Wrap-up digest sent. All 5 pushed, on main 1dc39cd7,
  notes current. warmup-5m: RED for merge (clipcheck fails 3/3 on its branch, "fresh: world map" .wm-head wait; base passes), honestly
  named by itself (1feedb8e). kaizen-gates: 0.9.4 candidate ready, waiting on the lead and Matt. fix-petals, quality-supervisor: stopped
  with next steps. roadmap-keeper idle.
- **NEXT at restart:** ReadNotifications; re-read SUPERVISOR.md and this file; ask the lead which helpers are in the rounds; arm round 1.
  Round 1 first checks: warmup-5m's clipcheck fix (proof: clipcheck PASS on its branch, alone, from output); fix-petals re-merged
  origin/main + ccr before any work (D23); kaizen-gates' 0.9.4 state (merged or still waiting).
- 2026-11-04 04:14 AM ET: round 3 digest sent. GREEN kaizen-gates (§6 fixed, checked against the diff), fix-petals (stopped for the night 3:53),
  quality-supervisor (W1 baseline 38/100, sections there, end-of-night 4:05), roadmap-keeper (idle). YELLOW warmup-5m: no commit since
  3:25, gate lines not pasted (gate since 3:21); nudged 4:13. Wrap-up armed: trig_016k2MAepX4yH5JuNX5vFk7j, 4:45 AM ET. Nothing after.
- 2026-11-04 03:45 AM ET: kaizen-gates fixed §6 at 2a77d774 (+ 3dda5018 its own notes). Checked myself: diff 1dc39cd7..kaizen-gates in src adds no
  fetch/URL/beacon/socket/XHR, no placeholder words; SaveLoadDialog only drops an unused import; no audio/lifecycle/App file. The "not
  checked" items are named (foldable, HUD notch, airplane, background sound, leave-and-return, kill-at-worst-moment). Accepted; told it.
- 2026-11-04 03:42 AM ET: round 2 digest sent. YELLOW kaizen-gates: sent back for PLAY-STORE §6 in reference/releases/0.9.4.md (checkbase re-run myself
  PASS on 319d8c27; map/HUD/crocus-p5 sheets + w2-p5-fresh-up opened: fine). Flagged its "drawcheck PASS (in the container)" = CI at
  merge per the role. GREEN warmup-5m (report sections all there; gate lines not yet pasted, gate started 3:21), fix-petals (notes fixed
  3:35), quality-supervisor (W1 baseline draft), roadmap-keeper (idle). Round 3 armed: trig_01CaYuyB3SZ3AQjd7Yeutmwd, 4:13 AM ET;
  then wrap-up 4:45.
- 2026-11-04 03:07 AM ET: lead's audit of round 1: two calls rested on stale session status lines. fix-petals and kaizen-gates were OK'd ~2:35 AM ET
  (fix-petals did NOT start early); the clerk's 0.9.4 candidate lives on kaizen-gates (merged roadmap-keeper 3d0cf1e2, gates running),
  not waiting. Owned. Sent fix-petals the notes item at 3:07. Round 2 prompt updated.
- 2026-11-04 03:07 AM ET: round 1 digest sent. All 5 on origin/main 1dc39cd7 with notes files. GREEN warmup-5m, quality-supervisor, kaizen-gates
  (awaiting the lead's OK on 0.9.4; no release-0.9.4 branch yet), roadmap-keeper (idle, done). YELLOW fix-petals: committing validator
  code (db738b37) while its status read "waiting on OK"; notes stale since 2:34. Round 2 armed: trig_01NzQTXcbjWvxRbybswkePjM, 3:38 AM ET.
- 2026-11-04 03:02 AM ET: lead (Matt's token budget): the team stops at 5:00 AM ET today. Rounds until then; the ~4:45 AM ET round is the wrap-up (each
  helper pushed, notes current, idle by 5) with its digest to the lead. Arm NOTHING past 5:00 AM ET; then idle until the lead restarts me.
  Plan: rounds 3:05, 3:35, 4:05; then wrap-up at 4:45 (arm 40 min from the 4:05 round, not 30).
- 2026-11-04 02:34 AM ET: lead OK'd onboarding. Round 1 armed (trig_011og3phdPNcd8K2pPEW9aRF, fires 03:05 AM ET): "started and on the right base".
  Branches (lead, corrected): warmup-5m on warmup-5m (not webgl-0), fix-petals on fun-validator,
  quality-supervisor, release-0.9.4 (or kaizen-gates), roadmap-keeper.
- 2026-11-04 02:33 AM ET: bot-fix restarted from main 1dc39cd7 (the old bot-fix, 912b2fe6, is merged). Onboarding sent to the lead; waiting for its OK.

## My pitfalls
- **Compare like with like: estimates are START-TO-ACCEPT** (the keeper's rule). Report start-to-accept vs plan AND running time
  separately; "faster than planned" only on start-to-accept (11-04: I called R-150.8 "3x" from 32 min running vs 1.5 h; real 1.2 h vs 1.5 h).
- **Approvals and money: check reference/STATUS.md on origin/ccr-0d59a91c-oy3imz FIRST, and read matches from the NEWEST (tail / no head
  cut) before saying "not found"** (11-04 10:04: a head -10 hid the two newest lines, a false RED on w8-rope2).
- GPU stage 0 is merged into the lead branch (ccr), not main: compare a helper's src against ccr to see its OWN code.
- A commit message saying "approved" is not the approval: find Matt's words, date and the list version.
- **Judge from commits, files and the helpers' own messages, never the session status line** (it goes stale; round 1, 11-04, two wrong
  calls). When unsure, ask the helper.
- The clerk can only push kaizen-gates: the release candidate lives there, not on release-0.9.4.
- Never call green what I did not open myself; never take a helper's word for a check (I am audited: 1 in 3 greens re-checked).
- Times and ids pasted from command output, never typed.
- Read ReadNotifications before every digest and before going idle.
