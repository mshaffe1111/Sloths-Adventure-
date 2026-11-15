# BUILD-17b: 1-7 to GREEN for link #3, fixing its shared faults GLOBALLY (R-165.204; Matt 11-14: the engine drives development, never patch for one level). Opus 5.5 xhigh (engine tier: this member does engine work). Written 1:56 PM ET 11-14.
Branch: continue t-build-17 from its head (c318fb0a or later). READ FIRST: level.md rules 21-22, LEAD-PERSONA.md "The engine drives
development", reference/qa-reports/BUILD-17/REPORT.md (EXACT NEXT STEP: the 14 unit reds file by file; its ENGINE-WORTHY list).
1. The 9 real faults, each fixed where it lives, for EVERY stage (planted test each; every earlier stage it moves re-checked):
   (1) the kit eagle's Enemy stands at its zone start next to a flag (pickups.test, levels.test x2): fix the cast lay, not 1-7's data;
   (2) listed stages skip their stage sheet list, so props2 isn't preloaded (stageSheets.test, sheetWarm.test): fix the preload for all
       listed stages (this is a real load-time fault for any gen2 stage);
   (3) one gap without its soft pit (w1Pits.test): find whether it is the shared painter or 1-7's data; fix where it lives;
   (4) the old route checks judge liana gaps (requiredMove, skills, glideStages): teach the checks lianas once (1-6 has the same lianas).
2. The 5 tests that assert the OLD 1-7 (eagleFair, dotBox, movesJournal, artDress, puzzleCamera): new replaces old: retarget each to the
   new 1-7 keeping its intent where the intent still applies; retire only a test whose only subject is the deleted old 1-7, with the
   grep. Never delete a test to get green (LAWS 22).
3. Gates scoped by what you touched (LAWS 5, Matt 11-14): tsc, full unit, every seed list/bots/lock the fixes move, drawcheck (new stage
   draws); the integrator runs the full set. Then REPORT GREEN, with the ENGINE LINES list for the integrator's line review.
No until/sleep wait loops (D67); read the queue at every push (D57). BOX: 90 minutes or 40% context (400k of 1M by the real figure).
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
