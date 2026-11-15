# METER-1: the difficulty meter measures what a stage really asks (R-165.261). Opus 5.5 xhigh (engine tools). Written 8:21 PM ET 11-14.
Role card: reference/roles/ENGINE.md (its last sentence: every counter has a test that proves it counts what its name says). Read ONLY:
reference/design/DIFFICULTY.md (whole: the meter's terms, SCALE, the bands), tools/difficulty/score.ts + score.test.ts on origin/t-tools-2,
TOOLS-1's REPORT.md re-score section (origin/t-tools-1), and BOTS.md's tier calibration lines.
Why: on the fixed meter (TOOLS-1: no double-counted swings) 1-6 reads Normal 3.3, EASIER than 1-1 (4), while castBots shows 1-6 is clearly
harder (Normal kid 34/40, expert sealed 22/40 before the petal fix); 1-7 reads 2.7 vs 5.5; the meter has NO term for a chase front or
rolling hazards (1-8, BUILD-18), so the old 1-8 read 28.9. w1Arc16.test's band check is red on 1-6, and it blocks Matt's link #4. The
ruler is wrong, so we fix the ruler, never the data or the band (LAWS 22; the band and targets are DIFFICULTY.md's, Matt's rule).
Do: (1) find, with numbers, which asks the meter under-counts on 1-6 and 1-7 (a liana catch and release, a timed swing, a false liana, a
watched stretch, a still beat); (2) add the missing terms (swing timing, chase front speed vs his run, rolling hazard spacing and two
heights, being watched), each with its source in DIFFICULTY.md's style and a planted test that it counts what its name says; (3) recalibrate
ONLY by DIFFICULTY.md's own method (1-1 anchors SCALE; the testers' tier calibration where it has data); (4) re-score 1-1..1-8 and every
listed stage, before/after table; (5) cross-check against castBots tier results: a stage the bots find harder must not read easier.
If a stage still misses its band after the ruler is right, that is a design finding: report it with the number; never tune a stage here.
Branch: t-meter-1 from origin/t-tools-2@19b45a06. Gates: tsc, the meter's tests, the WHOLE suite (the band tests live there), roadmapcheck.
REPORT reference/qa-reports/METER-1/REPORT.md with the table, "Learned", EXACT NEXT STEP. BOX: report by 10:45 PM ET or 40% real context.
No shell wait loops. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
