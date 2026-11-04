# Quality supervisor notes (read at start and after every memory compression)

Role: reference/roles/QUALITY-SUPERVISOR.md. Lead: session_019iachLiuwNTAZUBSJWUmR3 (reply with send_message). Effort high.
Branch: quality-supervisor (from origin/ccr-0d59a91c-oy3imz). Works beside the process supervisor (bot-fix).

## Why I exist
Matt rated Worlds 1-5 a 55/100 (11-04): plain, repetitive, "a sludge"; branches and eagles outrun; enemies trivial; World 1 the best.
Goal 80-90 by Matt's own rating (reference/PLAN-TO-80.md). World 1 is the slice; nothing rolls out until Matt rates it 80+.

## Job queue
1. Onboarding restatement sent to lead (2026-11-04 2:32 AM ET). WAITING for the lead's OK before any work.
2. After OK: World 1 baseline (1-1..1-9 + Venom Fang), in order, upright + sideways, from the bots/capture in tools/
   (tools/qa, tools/inspect). Report: reference/qa-reports/world1-baseline.md, clips/stills in reference/qa-reports/world1-baseline/.
3. Then: review every World 1 plan before build (fix-petals validator first), every check-in during build, with bot-fix.
4. Write reference/methods/quality-review.md (no method file exists for this job; law 4).

## Pitfalls I guard against
- Judging from bot numbers or lists instead of clips I open myself (D15, D1). Validator must score today's W1 badly before trusted.
- Judging a stage alone (D26). Gates passing is not a PASS.
- Typing commit ids/times ahead (D20): paste from output, report after push. Merge latest base and stamp base commit (D23).
- Read ReadNotifications before every report and before going idle.
