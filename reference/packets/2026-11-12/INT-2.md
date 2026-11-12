# INT-2: integration for 0.9.7 and Matt's 1-3 test link tonight (the lead, 2026-11-12 11:30 AM ET). Opus 5.5 high. Branch t-int-2.

Why: Matt wants 1-3 on his test link TONIGHT before 10 PM, ahead of 1-2, "rather know where we are than keep guessing". Everything
passed today has to sit on one head first: the merged engine, the 1-1 pass, the render and pit fixes, the audit fixes, 1-2's flight
work, then World 1's creatures and 1-3. The same head is the 0.9.7 candidate.

First, before any tool call: `git fetch origin ccr-702d3c49-i33jeq` and read from it: reference/roles/README.md ("Lean output"),
reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md, reference/TEAM.md "Cost rules", reference/methods/gates.md.

## Step 1, now (target 1:00 PM ET)
Base: origin/t-int-engine@d0276817. Create t-int-2 from it. Merge, in this order, each as its own merge commit:
1. origin/t-11-pass@36a4ef1c (P11, the 1-1 pass; already holds d0276817). Its seed list (258, first run 9800) is lead-approved.
2. origin/t-render-fixes@b8e98fac and origin/t-pit-polish@0e7c3e6b (both passed the lead's look; based on main, not on t-int-engine).
3. origin/ccr-702d3c49-i33jeq (the lead's docs and team tools). For reference/ files both sides changed, keep BOTH sides' rows.
4. **Duplicate R-165.129:** the lead's R-165.129 (Matt's thorn bed / pit-wall band) keeps its number. t-int-engine's R-165.129 ("Eight
   tool-side tests red...") becomes **R-165.139** everywhere on the branch it is named (ROADMAP, known lists, reports, tests, tools).
   `node tools/roadmapcheck.mjs` must pass after.
Then: tsc; the gen2 + worlds suite (P11 stopped it at 55 ok, 0 failed, unfinished); `npx tsx tools/engine/seedlist.ts 1-1 --check`;
the stage lock check (methods/gates.md): ONLY 1-1 may move (P11's approved rebuild). Any other stage moving = stop and report.
Push, confirm with git ls-remote, message the lead (5 lines or fewer).

## Step 2, on the lead's message (about 12:45 PM, then about 1:30 PM)
- origin/t-audit-fixes (AF: PROOF-1's 5 violations) and origin/t-12-fly (F12: 1-2 flown). tsc + their tests + the lock check. Push.
- origin/t-w1-creatures (W1C: World 1's snakes, drop traps, noise, 1-3 laid), only when the lead says it passed the lead's look.
  tsc + its tests + seedlist 1-1 --check + the lock check (1-3 moving is expected then; nothing else). Push.

## Step 3: the full gate once, on the final head
Every check in CLAUDE.md "Checks", in order, nothing skipped (Law 5). Report each: pass, or the breach with its call site. A failure
that comes from a merged branch goes back to its owner through the lead: name the branch and the file; do not rewrite their work.
Also build the test link once (`python3 tools/testlink/build.py "INT-2: 1-3 first look + 1-1 pass + 1-2 + audit fixes"`) to prove
it builds; do NOT publish it (the lead publishes after judging).

## Rules
- Merge conflicts only: you do not fix gameplay, art or rules. Never loosen a fairness rule, threshold or STAGE-RULES number; never
  re-record a seed list; no stage id, seed or x literal into engine code (the generality gate).
- Safe-keeping push at least every 45 min. Stop line: 4:30 PM ET or 40% context, whichever first: push and report what is left.
- Return: reference/qa-reports/INT-2/REPORT.md on the branch (60 lines or fewer: each merge with its commit, conflicts and how each
  was settled, every gate's result, what is left), and a send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 10 lines or
  fewer. No PR.
