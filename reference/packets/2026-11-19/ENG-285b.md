# ENG-285b: finish the judges-fly-the-engine work: the last two drifts (R-165.297), then ONE re-prove of every stage the model moved.
Engine, Opus 5.5 xhigh. Written 8:58 PM ET 11-18 (by `date` in the same command) for Thu 11-19 8:30 AM, first in the engine lane. BOX: drift
fixes pushed by 10:30 AM; final hash by 2:00 PM ET, or 400k REAL context (then the EXACT NEXT STEP pushed). A FRESH member.
Role card reference/roles/ENGINE.md. Read FIRST: LESSONS.md once (D40, D57/D87: call ReadNotifications whenever a notice says pending, at
every push and before every report; long commands in the BACKGROUND; D59, D86, D88), ENG-285's packet (reference/packets/2026-11-19/ENG-285.md)
and REPORT (origin/t-eng-285 925eba15 reference/qa-reports/ENG-285/REPORT.md: the measure table, the EXACT NEXT STEP), BOTS.md
(reference/qa-reports/R-165.59/BOTS.md), the ROADMAP rows R-165.285, .294, .295, .297.
BASE: continue on t-eng-285 @ 925eba15 (pull; push there).
THE LEAD'S RULINGS ON ENG-285's MEASURE (11-18 evening):
1. FIRST the last two drifts (R-165.297, D40: never re-prove on a model about to change): the no-steer air tick (dir 0) modelled as the
   engine does (engine.ts:2587: 0 or 1300, not 520), and the bot's vineFromLog / lianaWait aim (the same clock+lag slip ENG-285 fixed for
   the drop); each planted against RealPlay (extend judgeFliesEngine.test / lianaRide.test). Push them as their own commits and tell the
   lead the hash at once (BUILD-24c, FIX-284 and VAR-19 merge the FINAL model hash before they relist). Then re-run the MEASURE (lock vs
   ce4ad461 and main, every list --check, tierBots) and send the table.
2. The layouts the model moves are INTENDED (the judges now fly the real Pokey): regenerate the lock for exactly the stages the measure
   names and say which. For the SHIPPED gen2 stages whose layouts moved (ENG-285 found 1-6, 1-8, 2-1; re-read after step 1) re-prove
   them: castBots 1-40 x tiers x both (child/middle/expert 40/40 both or each miss traced; 1-6 middle N L39's gorge rescue traced),
   funcheck on each (no flag new or worse vs main; VAR-1/VAR-1b's 1-6 work must hold), and stills of 3 moved layouts per stage, both ways.
3. The red suite test src/game/gen2/seeds.test.ts:40 (a curated World 6 seed's plan moved): re-curate the seed (pick one that passes the
   test's own intent) or re-pin to the new plan with the reason; never loosen.
4. tierBots: if still 200/200 identical, no recommit (say so); else recalibrate per BOTS.md.
5. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (the suite in shards, all of them), plus funcheck, coveragecheck,
   registrycheck, every list --check, lockall vs main --intended <the stages ruled>. A gate still running at report is UNRUN.
6. The 2-4 drop-judge numbers moved (Easy 'back' 82 -> 77% vs bar 85%; Easy lashed wait 0.63 vs bar 0.6): name them for BUILD-24c (it
   re-tunes 2-4 on this model), don't touch 2-4.
REPORT: append an ENG-285b section to reference/qa-reports/ENG-285/REPORT.md (hash, the two drift fixes + plants, the re-measure table,
castBots/funcheck tables, the seeds.test fix, gate table, stills, Learned). Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries
REAL context % and a time from `date` run in the same command.
