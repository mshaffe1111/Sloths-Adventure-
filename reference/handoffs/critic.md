# Critic: turnover note (rewritten at the end of every task; this one 2026-11-11 5:32 PM ET)
The scripts, the gate order with timings, the traps and the PR body template are still in reference/handoffs/release-clerk.md; read it with this. A NEW LEAD is coming (the lead, 5:29 PM ET): report to session_01FhBbYMoqqEdVR3qFjTCugy until the new lead messages its id, then only to the new lead.
## The task: the packet audit of stage 1-2 (two packets by the Designer, session_01FhBbYKCku6yT7xx6DqGHwZ, on t-design-1-2)
- reference/packets/2026-11-11/CONTENT-1-2-relay.md and ENGINE-1-2-routing.md. Five attempts audited; every report, the JSON and every proof is on branch t-critic-1-2-packet under reference/qa-reports/CRITIC-1-2-packet/ (REPORT.md attempt 1, REPORT-attempt2.md, -attempt3.md for 3 and 4, -attempt5.md; REPORT.json holds the current verdict and the closed ones).
- WHERE IT STANDS at t-design-1-2@65d31898: CONTENT REJECT on 1 line (sections with a direction are laid mirrored on half their lays: the chain, the note hollow's drop; mirror12.ts) plus 2 small ones (a pasted number, THORN_12 undefined). ENGINE (rewritten for D43, any stage from data) REJECT on 2 lines (two proofs that cannot pass as worded: the "thorn" grep in engine.ts, the '1-2' grep against the old builder before item 7) plus the test fixture left to guess. All earlier lines are closed. The next delta is a short one.
- Rulings of the lead already in the packets, not to be re-opened: Engine work in its own packet; one thorn lesson; Easy thorns set him back, Normal a heart too; the thorn look is ENGINE's still and Matt's hold point; no tip socket without a row; bonus blooms (`fruit`) off the road; the ladder at the first chain grows the lesson's log; the double counts on the gen2-built 1-2 only (`#ctest` must not move); item 0 is t-engine-11-followup's; yield floor 1 in 50 for now; never more than 3 hop steps in a row, 6 a roll; D43.
## Also done: hearts in the tier bots
- Branch t-critic-bots-hearts@dabd303a on t-int-1-1@874f11f6: a run line carries `hearts`, `heartFalls` and `hearts` per piece (tools/inspect/firsttimer.ts, tierBots.ts, tierBots.test.ts, R-165.59/BOTS.md). tierBots.test 8 of 8; calibration-main.jsonl not touched. Not merged anywhere yet: the lead has the head.
## Tools (reference/qa-reports/CRITIC-1-2-packet/; each prints its own usage)
- probe12b.ts (iso | supply | v3): a packet's kit rows against 1-1's builds; its brief rolled with tagged stand-ins; the double rule.
- cites.py + cites-*.txt: every file:line of a packet against a pattern at the head it names.
- quiet11.ts: the quiet stretch at a named section on fresh 1-1 rolls. ctest12.ts (--record, --check, --widen): the testers' control course. ncount12.ts: a repeated beat per roll. mirror12.ts: what the pipeline lays mirrored.
- The Designer's own, which I re-run each round: reference/specs/sims/supply12.ts, quiet12.ts (12 minutes), ncount12.ts, chainlay12.ts, flight.ts.
## Traps
- `npm ci` fails here (no lock file): use `npm install --no-audit --no-fund --legacy-peer-deps` and delete the package-lock.json it writes before any commit.
- A probe can pass on a brief that is not the packet's: diff the two first.
- The deal hands out content types by quota, window and neighbours, never by what the pool holds for the job (pipeline.ts:595-618); a job with no section of the dealt type fails the roll.
- The seed list refuses a quiet stretch over 4 s (seedList.ts:22); the inspector reads no beat at a drop or a walk-off (tools/inspect/route.ts:266).
- `#ctest` builds on 1-2's stage id (stageGenerator.ts:2862); lockall does not cover it.
- Ask of every new section what it is when laid MIRRORED (pipeline.ts:1445-1450; w1.ts:332). I missed this for four attempts.
- A cure for a gate can break a fun rule (STAGE-RULES §0): count the repeated beat after any rhythm change.
- When a packet's gate names one of your scripts, run it as the gate words it.
- The Designer pushes while you audit, and STATE.md on the lead's branch moves: `git ls-remote` and read both again before every verdict.
## Owed
- The delta on the Designer's next head (CONTENT: the mirror rule and its test; ENGINE: the two greps and the fixture).
- tools/inspect/tierBots.ts:6 maps a variant through the 1-1 pick: it should read ENGINE item 1's listed table once item 7 lands (asked of the lead, not yet answered).
- When the builds come: the build audits of t-content-1-2 and t-engine-1-2 per roles/CRITIC.md "Every audit".
