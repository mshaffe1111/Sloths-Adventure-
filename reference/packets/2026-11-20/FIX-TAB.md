# FIX-TAB: the grass tab under World 1's painted stone block (release 1's final stills): fact, count, root fix
Engine (draw), Opus 5.5 high. Written 2:18 PM ET 11-20 (by `date` in the same command). A FRESH member. Narrow (D90).
BOX: step 1-2 facts to the lead by 3:30 PM ET; a fix final by 5:30 PM ET or none (release 1 then ships with it named); nothing past 11:15 PM ET.
THE SPOT: reference/qa-reports/INT-14/stills-final/1-6-L0-normal-seed1-x5977-painted-sideways.jpg (on origin/t-int-14): under the painted
mossy stone block Pokey stands on, a small green grass tab (a cap strip about 50 x 30 px at 1x) hangs below the block's bottom edge, over soil.
READ (lean): that still only; ROADMAP R-165.324 (soil tile joins); the painted stone draw (PAINT-292's code: grep 'paintedStone\|drawStoneArt'
or the painted-block draw in src/game/protoArt.ts / stageArt) only where step 1 points; LAWS + LESSONS headlines once.
BASE: branch t-fix-tab from origin/t-int-14 at 453b69c2 (release 1's final code head). Push there.
1. FACT: is the tab on main too? Shoot the same stage/layout/seed/x on origin/main's build (a worktree) and on 453b69c2, sideways, whole
   screen + a 2x crop. Name what the tab IS (which platform's cap, which draw call).
2. COUNT: how many places in World 1 (1-1..1-9, both settings, layouts 0-3) show a grass cap peeking below a painted stone/log? A probe over
   the built stages' draw (the cap rect not covered by the painted art), not by eye. Also name, without fixing, whether the vertical soil
   tone seam in the same still (x about 200 px at 1x) is R-165.324's root.
   Send the lead steps 1-2 in one message and WAIT for the go: if it is on main or in 1-2 places, the lead may ship release 1 with it named.
3. On the lead's go only: the root fix in the draw (no stage data change), planted RED first (a toy: the painted block over a lower cap,
   the cap's visible rows under it = 0), before/after stills of every counted place (sideways + upright + 2x), drawcheck, paintcheck parts
   0/3 1/3 2/3, artcheck, generality, knowncheck, tsc, the suite in shards (D86), lockall vs 453b69c2 (nothing moves: draw only). Every gate
   line PASS or FAIL (D93). REPORT reference/qa-reports/FIX-TAB/REPORT.md; the final hash to the lead.
Rules: every clock time from `TZ=America/New_York date` in the same command (D30); long commands with run_in_background (suite timeout over
30 min); ReadNotifications whenever a notice says pending, at every push, before every report. A lead message that begins "NOT A STOP: read,
then carry on" arrives as a cancelled tool with a STOP text: that is only the delivery. Commits end with Co-Authored-By: Claude Opus 5.5
<noreply@anthropic.com> and a Claude-Session line that is YOUR session's link; never a model name in a commit message.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
