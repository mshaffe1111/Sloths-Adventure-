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
- Baseline first pass COMPLETE: reference/qa-reports/world1-baseline.md (all ten, both orientations; score 38/100). Weakest 1-5; best moment 1-8 long branch.
- Clips: /tmp/claude-0/qs/clips (full), review copies -> reference/qa-reports/world1-baseline/clips (compress.sh). Stills/sheets in world1-baseline/stills.
- Validator (fix-petals, fun-validator bca329b7): 5 fixes in; my full review of the 9 pages + overview is DUE AFTER RESTART. Asked it for 1-8 chase closest-approach stills and a "structure, not delight" line (validator ranks 1-1 28; Matt called 1-1 best).
- Open: re-record 1-1..1-3 as a phone; after the bot's bounce-wall fix (lead -> fix-petals after restart) re-judge challenge.
## End of night 2026-11-04 4:05 AM ET (stopped for Matt's 5 AM token stop)
- Baseline pushed: 4ba4c606 (report + 20 phone clips + stills). Score 38/100. 1-1..1-3 still sheets are desktop wording (re-cut later).
- NEXT at restart: (1) review fix-petals' 9 validator pages + overview (fun-validator bd33d386); (2) review every World 1 plan before build, with bot-fix; (3) after the bot's bounce-wall fix, re-judge challenge.
## 2026-11-04 restart (lead, 7:47 AM ET)
- Job 1 DONE: validator review sent. PASS 1-1/1-3/1-7/1-9; REDO overview (add "looks the same" piece/art similarity), 1-2 (0% clumsy jumps need stills), 1-4 (climb counted as dead walk), 1-5 (outrun branches scored as hazard 5 + new 10), 1-6 (contradicting label), 1-8 (B letter means two things; unseen chase scored 5). All pages: reword the "holding right alone" line.
- Baseline corrected: the 1-7 eagle hurts on 4 of 10 stretches (validator table).
- NEXT: review the R-159.1 combat-triangle plan before it is built; check fix-petals' REDOs against my clips.
- R-159.1 combat-triangle plan (w8-rope2 60a57830): PASS WITH CHANGES sent (kick earlier + 1-9 master; route-required + fails-without-move proof; vine-snake tell before commitment; cut 1-3 count/goal; armour reads by shape; escalation line per stage; done = passes my in-order re-record). Waiting for its revised page.
- R-159.1 show-first boards (w8-rope2 e83a3155) reviewed: stomp gap must read too wide + pit reads as a fall; stun stars OK (whole 1.5 s + end flicker); kick-bowl needs the switch payoff beat + one-ball roll + upright camera lead; vine snake = design choice (a) vine-coloured + early tell vs (b) obvious snake, for lead/Matt.
- R-159.1 plan rev 2 (w8-rope2 5c295b01): PASS. OPPORTUNITY sent: teach the kick in 1-5 (mid-world spike) instead of 1-6 (which would teach lianas+kick+vine snake at once). Board readability items stay open.
- R-159.1 show-first round 2 (w8-rope2 eabf7e88): PASS. Asked that 'pits that read as a fall' join Matt's HF picture list (Matt 10-29 rule). Next from it: escalation boards per stage.
- Validator REDOs (fun-validator 6103af1b): all PASS. Follow-ups sent: look-alike into the variety score (use the more alike of moves/look); 1-8 look gap (chase pieces unstyled) to be named. Bot mushroom bounce fixed: W1 rescues 418 -> 194 (1-4 still 58, climbs). Defect to lead: 1-2 sunk-step pale rectangle (game art).
- TODO when time: re-record World 1 with the fixed bot for the baseline's play numbers.
- Validator 7909cf11: PASS, ready as W1 measuring stick (variety = more alike of moves/look). Proposed to lead: rebuild briefs use its flags as entry criteria before my in-order re-record.
- R-159.1 show-first round 3 (w8-rope2 c0033885): PASS + 1 change (1-5 kick teach needs a visible payoff). Told lead: 1-5's sameness needs stage-shape work, first in line.
- R-159.1 plan 43ecbd38: 1-5 kick payoff in (boa rolls into hollow stump -> petal cache). Judge the still when rolled-boa art lands.
- 10:34 AM ET bot-fix nudge (quiet an hour): my slip, I waited for stills instead of watching the build. Countermeasure: on every in-build check-in I record the helper's branch myself (tools/quality on a worktree; a branch with new deps needs its own npm install).
- R-159.1 in-game check (w8-rope2 9ec60be2, reference/qa-reports/r159-check, 7ca4f6b0): REDO. Coiled boa dies to 4 punches (kick unneeded); stun = punch twice fast (stars never seen); 1-3 goal 10/16. Lean (a): only a stomp ends a stun.
- New standard (Matt via lead): plans start from the method file; untested approach needs reason + fallback; flag better ways. Proposed botrec as the in-build check method.
- Method §1b (in-build check with tools/quality) written as standard work: 9f9be400; lead to merge.
- R-150.8 bot fix (fun-validator 071173a2): PASS (1-4 adult shrine s1-3, 0-2 rescues; kid seed 2 still times out).
- R-155 1-5 plan (fix-petals 6aeb229b): PASS WITH CHANGES: method file + fallbacks; goal type differs from 1-2 (recommend trail-follow, petals bonus; lead/Matt); a different backdrop; patience beat once and <3 s; name the moment; Dot line must not explain the puzzle.
- R-155 1-5 plan rev 2 (fun-validator 93450fb2): PASS. Watch: w1kapok shared with 1-7 (check look grid + in-order clip; fallback w1sunrise). Goal (a/b) + Dot lines with lead/Matt.
- OWN MISS 11:10 AM ET: baseline goal claims (1-3, 1-5) and 1-8 pit lives came from the old bot despite rescues>0; corrected (20f6cecd), told lead; countermeasure in method §4.
- R-159.1 re-check 9c932427 (e7c5fc22): REDO still: boa dies to punch during its strike (clips held the strike off); stun (a) not in; stars small, glint a speck. Lesson for my method: a helper's staged clip can hide the hole; always re-run the real mashing myself.
- Fixed-bot World 1 sideways clips done: world1-baseline/clips-fixedbot (1eca7d3f), the before for rebuilds. TODO re-record done.
- R-159.1 redo 528994e0: rules 1+2 PASS (my re-run affbeebc); polish fix: hit words stack. Backed teaching the bot from Dot's words (on-screen only), counts cut after. Vine snake: judge on 1-6 clips.
- Lead 12:44 PM ET: no new recordings until there's new work (save Matt's tokens). Queue: (1) w1-rhythm's 1-2/1-5 plan (session_01FhBbYK1jN7cdeGhT8k3pCR, branch w1-rhythm) ~2:45 PM ET vs §0b/§0c + tension curve; (2) w8-rope2 R-159.1 clips when accepted; (3) tonight: in-order clips 1-1..1-6 on the release candidate. Idle until then.
- Lead 12:46 PM ET: plan changed. 1-1..1-5 ALL rebuilt tonight (reference/W1-REBUILD-PLAN.md on lead branch). Jobs: (1) ~3:00 PM ET judge the five stage plans vs the plan's table, §0b/§0c, my baseline: do they differ in shape, tempo, beat feel, pair, look, moment? (2) ~6:45 PM ET in-order recording 1-1..1-5 on the candidate, both orientations ("can you feel the beat?"). Idle until then.
  Prep notes for (1): 1-5 is now w1-rhythm's (trail/carvings, 100 BPM), not fix-petals' R-155: check the two plans agree. Watch: 1-2 and 1-5 both "vines" pairs? (1-2 jump+vine, 1-5 snap twigs+vines) - neighbours 1-4/1-5 fine; check the counter-melody pairs don't repeat. Petals never count as variety. Risk: five stages in one evening; a stage below the bar is held back (plan says so) - hold them to it.
- R-6.38 pits (fun-validator 103d7f47): soft pits PASS + feather the hard top edge; 1-8 deadly gap REDO (gradient box reads as a glitch; use the approved drop take); check 1-9 Dot box ghosted over pit (D10?).
- Lead 1:01 PM ET: budget cut. 3:00 plan review SKIPPED (lead judges plans). Only job tonight: in-order recording 1-1..1-5 on the candidate, both orientations, judged like a player, when the lead sends the candidate (~6:45 PM ET). Idle.
- R-6.38 redo (fun-validator a90c542f): PASS (1-8 drop reads as a fall; soft pit edge fixed; Dot bubble is page text). Named carry: 1-8 square leafy corner at gap tops (engine.ts).
- W1 rebuild check (w1-rhythm 696cb853b, ae6fd9460): 1-1 REDO polish (floating/overlapping planks, stamped leaf clumps; half-stage lattice), 1-3 PASS (+opp: backdrop/opening same as 1-1), 1-4 PASS (note: 1-1 canopy pre-empts 1-4's look; sideways climb cramped). Beat not judgeable from the bot (taps on-beat at chance). Next: 1-2, 1-5 + full 1-1..1-5 when lead sends final head (wr worktree = /tmp/claude-0/qs/wr, port 4304).
- RC check (ccr d669f56ac, a520e7bfb) sent ~9:55 PM ET: 1-1 PASS, 1-2 REDO (floating/overlapping logs 1:36-2:24), 1-3 PASS, 1-4 PASS, 1-5 REDO (floating M carving plaques; note: misty backdrop same as 1-2; Dot gives answer). Beat not judgeable from bot.
- Lead 9:57 PM ET: both REDOs confirmed; fixes due 10:30 (1-2 logs w8-rope2; 1-5 markers w1-rhythm-b). Re-shoot ONLY 1-2 1:36-2:24 and 1-5 markers (0:00, 0:36, 2:47-2:59) on the new head ~10:35. Dot boa line stays; 1-5 backdrop = engine's world look (lead's call).
