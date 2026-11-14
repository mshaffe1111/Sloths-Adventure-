# TOOLS-2: Easy is proven on Easy's stage (R-165.251) + the test link can't over-fill or miss changes (R-165.252). Opus 5.5 xhigh (engine tools). Written 6:10 PM ET 11-14.
Role card: reference/roles/ENGINE.md. Read ONLY: reference/ROADMAP.md rows R-165.251 and R-165.252 (lines 739-740), tools/engine/seedlist.ts
and tools/engine/lockall.ts where each builds a stage per setting, grep setTimedSwing over src/ and tools/, tools/testlink/build.py (whole,
~80 lines), LESSONS D19 and D72. TOOLS-1's REPORT on origin/t-tools-1 if it has a section on .251: read that section only.
Why: Easy players may be getting stages our lists never proved (1-6 differs on 3/3 seeds), and link #3 nearly failed to publish.
Branch: t-tools-2 from origin/t-int-9@1c7f6b95. Two separate commits.
(1) R-165.251: ONE shared helper that sets every per-setting engine dial (swing first; grep for any other dial the same way, D19) and every
    tool that builds a stage per setting calls it (seedlist, lockall, castBots, levelCheck, and any other you find: list them). Planted:
    a test RED on today's tools (Easy built with Normal's swing) and GREEN after. Then re-run the Easy lists and Easy locks of every listed
    stage; for each stage say unchanged / changed; any changed Easy list is rebuilt and re-proved (seedlist --check), and roll-pinned
    tests re-run first. Do NOT relist 1-6 (ENG-16G owns it; give the lead the 1-6 Easy diff only).
(2) R-165.252: build.py fails BEFORE publish above 480 files and prints the count; it diffs against tools/testlink/dist-published (a copy
    refreshed only by a new 'build.py --published' step run after a successful publish), never the last local build. Its own test.
Gates (LAWS 5, src/ touched only if the helper lives there): tsc, the WHOLE suite on your head (name the run), engine tool tests, seedlist --check
for every stage whose list moved, roadmapcheck, knowncheck. REPORT reference/qa-reports/TOOLS-2/REPORT.md: the stage-by-stage Easy table,
the planted test names, gate lines, "Learned", EXACT NEXT STEP.
BOX: report by 7:50 PM ET, or at 40% real context (400k). No shell wait loops (D67); read your queue at every push. Report to the lead
session on reference/handoffs/lead.md line 1 (session_01FhBbYN2CVHnFXg7XzqKXpM). Every message carries your context %.
