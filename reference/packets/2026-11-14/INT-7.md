# INT-7: 1-4's fixes (+ the ruler head) on one head for Matt's morning test link; 1-1's easing follows in INT-8 (overnight push; Matt 2:04 AM "We need to push harder").
Opus 5.5 xhigh (integration). Written 4:27 AM ET 11-14 by the lead. Branch t-int-7 from origin/main@73e7bed0 (0.9.8 as released).
Read first: gates.md, release.md (the test link part), LESSONS D29, D59, D61-D64, and BOTH REPORTs: reference/qa-reports/POLISH-5/REPORT.md
(t-polish-5@471bd00, GREEN: ruler, holes, realFalls, 1-2/1-3/1-5 relists; 1-1's easing is not ready, lead 5:15 AM) and reference/qa-reports/FIX-14b/REPORT.md (t-fix-14b; t-fix-14c is HELD: its fork work made castBots worse, lead 5:08 AM). Both must say GREEN on their own heads before you start.
1. Merge origin/t-polish-5@471bd00 (GREEN: the ruler head; it carries t-eng-base's engine work) then origin/t-fix-14b
   (1-4: fig gate head-stop, Matt's art, two vines, pods, flag rim, figPush bot fix; engine.ts:5987-5993, ~2102, ~2136/2153). Resolve every
   conflict by reading BOTH sides' intent (pipeline.ts, verdicts, seed lists, locks); never by taking one side wholesale.
2. Every seed list --check; any list that no longer replays: relist with --merge --in-order (same seeds, same order) and say which.
   tierBots calibration still PASS; first-run lock (1-1) consistent.
3. Full CLAUDE.md Checks on the merged head (buildcheck ALONE). GREEN, or say exactly what is red and stop.
4. Stills + clips for the lead, upright 412x915 AND sideways 915x412, Normal AND Easy, built setting printed: 1-1 (its first-run layout and a hole climb: unchanged gameplay, ruler only), 1-4 (fig gate push + snap + try over, two vines, a pod tell + fall, the fork). The lead
   judges pass/fail before the link is built.
NOT in this build: the underlayer/pole art (waits on Matt's go), 1-6 engine (t-eng-s1/s2), chase (t-b2-chase).
BOX: 90 minutes or 40% context (400k of 1M; the lead quotes it, D64): push, REPORT with EXACT NEXT STEP, stop; never stop with a gate running.
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
