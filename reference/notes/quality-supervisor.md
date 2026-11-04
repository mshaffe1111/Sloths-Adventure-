# Quality supervisor notes (read at start and after every memory compression)

Role: reference/roles/QUALITY-SUPERVISOR.md. Lead: session_019iachLiuwNTAZUBSJWUmR3 (reply with send_message). Effort high.
Branch: quality-supervisor (from origin/ccr-0d59a91c-oy3imz). Works beside the process supervisor (bot-fix).

## Why I exist
Matt rated Worlds 1-5 a 55/100 (11-04): plain, repetitive, "a sludge"; branches and eagles outrun; enemies trivial; World 1 the best.
Goal 80-90 by Matt's own rating (reference/PLAN-TO-80.md). World 1 is the slice; nothing rolls out until Matt rates it 80+.

## Job queue
1. DONE: onboarding restatement sent to lead (2026-11-04 2:32 AM ET). Lead OK'd (2026-11-04 ~2:32 AM ET): (a) write methods/quality-review.md; (b) a flat PASS goes up the GAMEPLAN §3 ladder, hiding/misreporting immediate; add a 'Polish check' section to my reports; score out of 100 must have reasons checkable against the clips.
2. After OK: World 1 baseline (1-1..1-9 + Venom Fang), in order, upright + sideways, from the bots/capture in tools/
   (tools/qa, tools/inspect). Report: reference/qa-reports/world1-baseline.md, clips/stills in reference/qa-reports/world1-baseline/.
3. Then: review every World 1 plan before build (fix-petals validator first), every check-in during build, with bot-fix.
4. Write reference/methods/quality-review.md (no method file exists for this job; law 4).

## Pitfalls I guard against
- Judging from bot numbers or lists instead of clips I open myself (D15, D1). Validator must score today's W1 badly before trusted.
- Judging a stage alone (D26). Gates passing is not a PASS.
- Typing commit ids/times ahead (D20): paste from output, report after push. Merge latest base and stamp base commit (D23).
- Read ReadNotifications before every report and before going idle.

## Tools I built (tools/quality/)
- botlog.ts: logs the first-timer bot's real-engine run frame by frame (pad + Pokey's fields). botlog for 1-1..1-9 seed 1 adult (Normal).
- bosslog.ts: the same for the boss bot (bossBot.ts TACTICS), Pokey + boss + brain fields.
- botrec.mjs: replays a log in the real game in a browser (dev server :4301), Pokey (and boss) put back each frame, captions; mp4 + frames.
  Kill helper: never `pkill -f` a pattern that appears in my own command line (it killed my shell 3x); use /tmp/claude-0/qs/stop.sh.
- Working files: /tmp/claude-0/qs (logs, clips). Seed 1 picks: 1-1 stones/highLeaps/bounceRun; 1-5 bounces/creakHigh/bounces; 1-6 bounces/roadHigh/bounces.
## Early findings (to verify on clips)
- Every W1 finish is fillTo(): a shuffle bag of 3 pieces repeated until the 2-minute clock (src/game/w1Sections.ts). Padding by design.
- Venom Fang: boss bot wins Normal in ~20 s, 0-1 hits taken.
- Bot: 1-4 and 1-7 time out at 360 s with 11-19 rescues (bot limits or stage problems: check clips).
## Deadline (lead, 2026-11-04 3:02 AM ET): team stops 5:00 AM ET. No step after 4:40 AM ET that can't finish by 5. By 5: push clips + baseline (DRAFT if unfinished), notes current, one short state message to lead, idle.

## State 2026-11-04 ~3:45 AM ET
- Baseline DRAFT written: reference/qa-reports/world1-baseline.md (1-1..1-9 judged; score 38/100; 1-10 pending its clip). Method: reference/methods/quality-review.md.
- Clips: /tmp/claude-0/qs/clips (full), review copies -> reference/qa-reports/world1-baseline/clips (compress.sh). Stills/sheets in world1-baseline/stills.
- Validator (fix-petals, fun-validator bca329b7): 5 fixes in; my full review of the 9 pages + overview is DUE AFTER RESTART. Asked it for 1-8 chase closest-approach stills and a "structure, not delight" line (validator ranks 1-1 28; Matt called 1-1 best).
- Open: re-record 1-1..1-3 as a phone; after the bot's bounce-wall fix (lead -> fix-petals after restart) re-judge challenge.
