# ENG-BOTSIM: can the test bots ask the GAME how a press flies, instead of keeping their own copy of the physics? (a spike; Matt's A, R-165.462)
Engine (architecture spike), Opus 5.5 xhigh. A FRESH member. **BUDGET 3 h; a YES/NO with numbers by the time the lead names; HARD STOP start + 4 h.**
Hand over on the 28-minute clock or at 300k with the EXACT NEXT STEP pushed and ls-remote-confirmed first (D134); a hand-over ends new work (D138).
NEVER a shell '&'; long runs with run_in_background AND timeout 7200000 (CI #85); no heredoc in a commit chain (D119); stamps from `date` (D128).
WHY (Matt 11-25, R-165.461/.462): almost half of Wednesday's helper spend went to the bots' hand-made copy of the jump physics going out of step
with the game: release 4's bot fix took 12 sessions (CI-1..CI-15) and every one was "the judge's model is not the engine": the take-off carry
(CI-10), the press frame's ride, the standing catch's free frames and hold count (CI-11), the thumb's lag spread (CI-12), stops the kid never
lets go of (c11, CI-13, CI-15). 3-1's bots cost 13 + 14 boxes the same way. If the bot's judges asked the real engine instead, that whole class
goes away for World 3 and after.
READ LEAN: LAWS headlines; LESSONS D125-D140; tools/inspect/firsttimer.ts (the judges: hopFlight, takeOffStep, vineFromLog, dropWaits,
lianaWait, padRead: where each predicts a flight or a stand); tools/inspect/physics.ts; the engine's step (src/game/engine.ts, physics.ts) and
RealPlay (realPlay.ts); ENG-PLANT's CI-REDS.md on release-0.10.3-wip-plant-ci (the CI-8..CI-15 traces: each is a test case for you).
BASE: release-0.10.3 at release 4's final head (the lead names it).
1. Can the engine be stepped FORWARD from a copy of the live state for N frames under a candidate input (a press at lag L, held H), without
   touching the live run (a clone, or a snapshot + restore), deterministically? Say how, what it costs per call (ms), and what state it must copy.
2. A PROTOTYPE on ONE judge (vineFromLog's standing catch, CI-11's case, or hopFlight): the judge asks the engine copy "does this press land
   on X / catch Y" over the thumb's lag spread (thumbLags) instead of its own model. Run it on the rows CI-8..CI-15 fixed by hand: does it get
   every one right with NO hand fix? Toy: the CI-11 row (judged catch, the engine missed) is judged right by the prototype on the OLD code.
3. COST: one x40 (kid + adult, one stage) with the prototype judge vs today's: wall time and CPU. The bots must stay usable in CI (gates.yml).
4. THE ANSWER, one page in reference/qa-reports/ENG-BOTSIM/REPORT.md: YES (the plan to move every judge, ordered by how often it broke, sized in
   hours, and what tests it retires) or NO (why, and the cheaper alternative). The lead decides; nothing lands on release or World 3 branches.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times. Never a model name in a commit.
