# ENG-PLANT-c: the 2-1 river bot fix done right: a refused hop leaves a way on (release 4 TONIGHT)
Engine (bots), Opus 5.5 xhigh. A FRESH member. **BUDGET 1.5 h; REPORT BY 6:00 PM ET; HARD STOP 7:00 PM ET.** Hand over at 320k REAL
context or 28 minutes with an EXACT NEXT STEP. Long runs with run_in_background (castBots --par), NEVER a shell '&'; every run on a
chattr-frozen worktree (D115); no heredoc in a commit chain (D119); every time stamp from `date` (D128). Law 22: no looser test.
READ LEAN: the top of `git show origin/release-0.10.3:reference/qa-reports/ENG-PLANT/REPORT.md` (the :207 trace, the two blind presses,
candidate 2 ea573b4e4 on release-0.10.3-wip-plant); ENG-PLANT-b's attribution (its REPORT on release-0.10.3 or its message via the lead);
D132 (rule 28's baseline is MAIN); LAWS headlines.
BASE: release-0.10.3 (newest head, dfe631913 or later) with ea573b4e4's idea, not its code as is.
WHAT WE KNOW (ENG-PLANT-b, 2-1, rows vs MAIN): the 2-7 merge made 5 rows fail (adult N 12/24/37, child N 27, middle E 9: blind presses off
logs: padPause's flick firsttimer.ts:3224 and the edge press :3584); candidate 2 (under floatSure the flick off a drift log only when
gateSees lands it) clears those 5 but makes 12 new pass -> fail (child N 1/10/13/36/38, child E 31, middle N 24/25, middle E 22/31, expert
N 25/28): refused, he STANDS while the log carries him back, with no way on that ever passes the gate, and the stuck rule rescues him (child
N 1: refuses the bank hop twice at x 19,901, stands 6.2 s and 7.9 s). The GAME's lay is unchanged on 2-1 (only hints moved).
1. The fix: a refused hop must leave a WAY ON: when floatSure refuses, he takes the best move that does pass the gate (ride on to the
   next landing the gate sees; step back to the log or bank behind; wait at a spot from which the log's next pass lands), never stands
   until rescued. General (every river), no stage id. A toy each way: the blind press RED (adult N 12) and the stand-until-rescued RED
   (child N 1), both GREEN after.
2. Rule 28 vs MAIN (D132): castBots on 2-1, 2-2, 2-4, 2-5, 2-7, 1-4, every bot, both settings, seeds 1-40: NO shipped bar-relevant row
   (adult, child, middle, expert) pass -> fail vs main; every moved row explained. If one flips, stop and tell the lead.
3. The plants (ENG-PLANT's REPORT, the lead's rulings): re-planted at the same bars on the FIXED bot, or retired with the full search
   (bankUp, boardHop: no live case anywhere). The CI tool line 0 fail (chaseBots todo aside); tierBots 9/9; push to release-0.10.3 (merge,
   no force); send the lead the hash and the rule 28 table.
REPORT: a new top section in reference/qa-reports/ENG-PLANT/REPORT.md on release-0.10.3. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
