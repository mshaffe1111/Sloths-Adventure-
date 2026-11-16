# GATES-4: run the unrun gates on tonight's build and shoot the stills (Opus 5.5 high, runner). Written 4:07 PM ET by the lead.
Why: Matt's test link (1-4 and 1-5 tonight) waits on a fully green head. INT-3's background gate script died when INT-3 stopped (D59), and
INT-4 hit its context line. You only RUN and REPORT; you do not fix game code. Branch t-int-4 (INT-4's last head + REPORT; merge origin/t-int-3's
gates-2bb29f8d/ results if INT-4 has not). Game code on t-int-4 = 2bb29f8d's (INT-4 changed tools/inspect only: confirm with
`git diff --stat 2bb29f8d HEAD -- src/` = empty; if not empty, ALL Checks run again, not only the list below).
## Run, in ONE live session, in the foreground or waited on (NEVER stop with one running: D59), writing each result to gates-int4/RESULTS.txt:
unit suite (the CLAUDE.md tsx --test line), clipcheck, kbdcheck, tool tests (the four engine tool test files + tierBots.test), every seed
list --check (seedlist.ts per listed stage), registrycheck, buildcheck. Already PASS on 2bb29f8d, do not re-run: tsc, build, chunkcheck,
artcheck, knowncheck, generality, roadmap, drawcheck.
Stills: 1-4 and 1-5, Normal and Easy, upright AND sideways, fresh save, at the start, a mid beat and the finale (the B14 shooter INT-3
copied in reference/qa-reports/INT-3/); push them to reference/qa-reports/GATES-4/stills/.
## Report
The moment every result is 0: send the lead "GREEN <hash>". A red: send the lead the gate, the failing case and the first error lines
(5 lines), then keep running the rest; do not fix it. REPORT.md (20 lines): each gate with PASS/FAIL and time, stills list. BOX: 75 minutes.
Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
