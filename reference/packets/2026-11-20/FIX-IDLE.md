# FIX-IDLE: R-165.353: Pokey's idle cross-fade must never show him see-through or doubled
Engine (draw), Opus 5.5 high. Written 7:12 PM ET 11-20 (by `date` in the same command). A FRESH member. Narrow (D90): draw only.
BOX: final by 10:15 PM ET (so it can join release 2's integration); NOTHING past 11:15 PM ET; 400k REAL context (the lead reads it).
READ (lean): ROADMAP R-165.353; src/game/heroSprite.ts around 300-340 (the idle clip blend) only; the proof still
reference/qa-reports/INT-15/stills/logs/x3268-settle-8-20-40.jpg on origin/t-int-15; LAWS + LESSONS headlines once.
BASE: branch t-fix-idle from origin/main at 107870f5. Push there.
1. PLANT FIRST (rule 21): a test that steps a standing Pokey through the whole idle melt and fails when any frame draws his body with
   alpha under 1 (or two poses visible at once). RED today; push the RED.
2. THE FIX: the plain pose stays fully opaque while the clip fades in OVER it (or the switch lands on a matching frame with no blend);
   no other hero clip's timing changes. The planted test GREEN.
3. Stills: the same 2-5 spot (L1 seed 2, x3268, him still on the rock) after 8 / 20 / 40 / 60 settle frames, and one World 1 stop
   (1-1), before/after, sideways + upright, 2x crop of his body: pushed unopened for the lead.
4. Gates (draw-only branch, gates.md scoping): tsc, the suite in shards (count, tests/pass/fail/todo, D86), drawcheck, clipcheck,
   the CI tool line, tierBots, lockall vs main's lock (nothing moves: draw only), artcheck, knowncheck, generality. Every line PASS or
   FAIL (D93). REPORT reference/qa-reports/FIX-IDLE/REPORT.md with the EXACT NEXT STEP current; the final hash to the lead.
Rules: every clock time from `TZ=America/New_York date` in the same command (D30); long commands with run_in_background (suite timeout over
30 min); ReadNotifications whenever a notice says pending, at every push, before every report. A lead message that begins "NOT A STOP: read,
then carry on" arrives as a cancelled tool with a STOP text: that is only the delivery. Commits end with Co-Authored-By: Claude Opus 5.5
<noreply@anthropic.com> and a Claude-Session line that is YOUR session's link; never a model name in a commit message. Any tool call that
asks for a human approval: tell the lead (D97).
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
