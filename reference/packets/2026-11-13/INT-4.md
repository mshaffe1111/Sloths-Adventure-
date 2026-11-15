# INT-4: finish tonight's build and 1-4's bot split (Opus 5.5 xhigh, integration). Written 3:42 PM ET by the lead.
Continue branch t-int-3 from INT-3's head (2bb29f8d + its report e6b12d8e). Your start: reference/qa-reports/INT-3/REPORT.md EXACT NEXT STEP
(frozen) and engine-core.md §0m. INT-3's gate script is still running in its own container and will push gates-2bb29f8d/ (RESULTS.txt,
unit-summary.txt, castbots14.txt) and the 1-4/1-5 stills by itself: fetch and wait for them; NEVER re-run a gate already run on 2bb29f8d.
## Done
1. RESULTS.txt all 0 (a red is fixed at its root, LAWS 22). The moment it is all 0, send the lead one line ("2bb29f8d GREEN"): the lead
   builds Matt's test link from it. Don't wait for item 3 to send that line.
2. Judge stills/1-4-* and 1-5 (Normal, Easy; upright + sideways) against STAGE-RULES §5b; fix what fails or name it plainly.
3. 1-4 bot split on the NEW list (castbots14.txt): per stuck kind ('way on is 123 px up', 'dip 80 px', 'fell back down 8 times', 'dip
   281 px'), one RealPlay probe each: a plain player gets through = bot limit (fix the bot, never the rule; BOTS.md), else a level fault
   fixed at its root (the lay/pieces, for every tower stage, D43). Re-run castBots 1-4 after each fix.
4. #ctest back to 1-4 only at 40/40. After any game-code change: the full CLAUDE.md Checks again on your final head.
Also: rename limits.json scenario "ctest-mix14" (it plays 1-3 now; INT-3's pushback) - you hold limits.json.
BOX: 90 minutes or 40% of your 1,000,000-token window: push, REPORT (30 lines + Learned) with EXACT NEXT STEP, stop. Context % in every
message (5 lines max). Read TODAY.md; read your queue at every push. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
