# PICK-W1: R-165.343: the testers' link plays ALL of World 1, with a stage picker, for release 2 (Matt 11-20 2:39 PM ET)
Engine + UI, Opus 5.5 high. Written 7:57 PM ET 11-20 (by `date` in the same command). A FRESH member. Release 2 (Sat 11-21) waits on you.
BOX: the MOCK-UP stills pushed within 45 min of your start; final hash by 10:30 PM ET, or 380k REAL context (the lead reads it and tells
you, D64/D76); then the EXACT NEXT STEP pushed. NOTHING runs past 10:50 PM ET tonight (all stopped by 11:15 PM). If it will not hold,
say so by 9:30 PM: PICK-W1b finishes Saturday morning from your EXACT NEXT STEP.
Role card reference/roles/ENGINE.md. Read FIRST: reference/LAWS.md + LESSONS.md once (D30: every time you write comes from `date` in the
same command; D40; D57/D87 ReadNotifications whenever a notice says pending, at every push, before every report; long commands in the
BACKGROUND with run_in_background so their end wakes you; D76; D79 whole screen; D86 the full check list; D96 THE FULL SET), then
reference/PLAY-STORE-RULES.md (any screen), PERFORMANCE-RULES.md §1, ROADMAP R-165.343, and the code: src/components/ControlTestGate.tsx
(CTEST_PAGES), src/game/playRecorder.ts:85-95 (CTEST_LEVEL_ID = '1-5', the one stage today), src/components/ctestStretches.ts,
ctestSurvey.test.ts, controlTest.test.ts, ctestCoach.test.ts, ctestCourseGone.test.ts, tools/control-test-collector.gs + tools/README.md:129.
BASE: branch t-pick-w1 from origin/t-int-15 at 0eefc707e (release 2's merged code; only report files after it). Push there.
0. MOCK-UP FIRST (show first): stills of the picker as you will build it, upright AND sideways, at a phone size (390x844 and 844x390),
   2x: the nine World 1 stages by number and name (stagePlan's names: 1-1 Into the Canopy .. 1-9 The Boa's Branches), the setting choice
   kept, tap targets at least 44 px and clear of the phone's insets. Push them, tell the lead the paths. The lead shows Matt; you START
   BUILDING right after the push (lead's ruling under Matt's 11-20 7:52 PM standing direction); if the lead relays a change, take it.
1. The picker: the testers' gate offers 1-1..1-9 (the setting choice kept); the chosen stage is the one played. The single-stage path
   (CTEST_LEVEL_ID and whatever reads it) is DELETED, its tests re-pointed with their assertions kept (new replaces old).
2. The record says which stage: the recorder's row carries the stage id; the survey names the stage ("How was 1-4, Up the Kapok?" style,
   in the page's own voice); the stretch chips are per stage (ctestStretches.ts). A stage with no chips today gets chips DRAFTED by you
   from its design's beats in plain player words, marked DRAFT in the REPORT for the story keeper (the lead runs a short keeper check
   Saturday morning); never a workshop word (playerText.test BANNED).
3. The collector: PREFER no change to tools/control-test-collector.gs (Matt would have to redeploy it): carry the stage inside the data
   the collector already stores. If a sheet column truly needs a collector change, STOP and tell the lead with the exact diff.
4. Planted first (law: plant RED, then fix): a test that picks a stage other than 1-5 and asserts the played stage, the recorder's stage
   field and the survey's stage words; RED on the base, GREEN after.
5. THE FULL SET (reference/methods/gates.md, "THE FULL SET, named"), ONCE on your final head: every gates.yml run line (tsc, artcheck,
   vite build at the deploy base + chunkcheck, knowncheck, generalitycheck, coveragecheck, roadmapcheck, timecheck, clipcheck, kbdcheck,
   drawcheck, registrycheck --lists, paintcheck 0/3 1/3 2/3, the CI tool line, tipwalk, tierBots, buildcheck ALONE) + the suite in shards
   (the line in full: total / pass / fail / todo). clipcheck and kbdcheck MUST cover the picker upright and sideways (add it to their
   screen lists if it is not there). A gate still running at your report is UNRUN. Verdict word per gate: PASS or FAIL (D93).
6. Polish (law 1, STAGE-RULES §5b): FULL-SIZE stills of the real page after the build, upright + sideways, on a fresh save and an old
   save: the picker, a pick going into its stage, the survey naming that stage, the chips. Look at each the way Matt's testers will on a
   phone; fix or name every rough spot.
REPORT reference/qa-reports/PICK-W1/REPORT.md: hash, mock-up paths, each item with its test, DRAFT chips for the keeper, the collector
answer (no change, or the diff), gate table, stills, Polish check, Learned, lessons applied. The integrator merges you; you merge nothing else.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. A lead message that begins "NOT A STOP: read, then carry on" arrives as a cancelled tool with a STOP
text: that is only the delivery; read it and carry on.
