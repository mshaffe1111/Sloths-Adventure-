# FIX-INT: fix tonight's 3 unit reds at their roots (Opus 5.5 xhigh, integration). Written 4:38 PM ET by the lead.
Branch t-int-5 from origin/t-int-4 (68ac6074 + GATES-4's tools commit; src = 2bb29f8d). GATES-4 (session_01FhBbYNm5fyveRYFoArEz38) keeps
running the other gates on t-int-4: do not push there. The full log: gates-int4/unit.log on t-int-4 (not ok 2526 / 2766 / 2803).
Matt's test link (1-4 and 1-5 tonight) waits on a green unit suite (LAWS 5). Never weaken a test or a rule to pass (LAWS 22); a test whose
SUBJECT moved (not its rule) is re-pointed at the real subject, with the reason in the commit.
## The reds (each: root cause in one line with file:line, the fix, the test red before and green after)
1. stageQuality.test.ts:50 "World 1 median 180 s" (band 135-175). Find which World 1 stages moved (1-4 and 1-5 joined gen2 today; 1-5 is
   designed 206 s; 1-4 runs under 2:00 for quick players, R-165.206). Decide with evidence: is a stage too long against its OWN design and
   STAGE-RULES (fix the stage), or does this band predate Matt's newer World 1 ratings (DIFFICULTY.md §4, the 2-minute floor)? If the
   latter, DO NOT edit the band: write PUSHBACK.md with the numbers per stage and the rule's source line, message the lead, and go on to 2-3.
2. vineFollowUps.test.ts:163 "found 0 control-test lianas": #ctest now plays 1-3 (INT-3 49df13aa; no lianas). The test's subject is the
   swing stretch, not #ctest: re-point it at the stage that holds that stretch (find it), keep its assertion whole.
3. w1CutArt.test.ts:60 TypeError reading 'filter' on gen2 1-1: find what the merge changed (B14/B15 deleted hand plans in protoStage/
   w1Sections; INT-3's report) and fix the root; the planted case stays.
Then: the unit suite whole on your head (tsc first), and the other CLAUDE.md gates for any file you touched outside tests. Send the lead
"t-int-5 <hash>: unit N/N" the moment it is green. BOX: 60 minutes or 40% context: push, REPORT (20 lines), EXACT NEXT STEP, stop;
never stop with a gate running (D59). Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
