# Critic: turnover note (rewritten at the end of every task; this one 2026-11-11 4:20 PM ET, the 1-2 packet audit)
First note under this name: the scripts, the gate order with timings, the traps and the PR body template are still in reference/handoffs/release-clerk.md; read it with this.
## Where things stand
- ATTEMPT 2 audited at t-design-1-2@0cd2a2e8: CONTENT REJECT on 1 line (bare step-down runs against the 4 s quiet line), ENGINE REJECT on 3 (the testers' course moves with EARLY_DOUBLE, item 0 has two owners, blooms name 8-2 too). Report: REPORT-attempt2.md. All 20 attempt-1 lines closed.
- Next delta: re-run quiet11.ts and ctest12.ts ideas on the Designer's edits; cites-*-2.txt at the head they name.
- Audited t-design-1-2@f60e6503: CONTENT-1-2-relay.md REJECT (12 lines), ENGINE-1-2-routing.md REJECT (5 lines). Report, JSON and proofs: reference/qa-reports/CRITIC-1-2-packet/ on branch t-critic-1-2-packet.
- The delta audit is next: re-run `probe12b.ts supply` on the Designer's new tables (edit the NEW list to the new tags) and `cites.py` at the head the packets name.
## Tools left behind (reference/qa-reports/CRITIC-1-2-packet/)
- `npx tsx probe12b.ts iso`: 1-1 built with and without a packet's kit rows (the lock question, in 20 s, before any lockall).
- `npx tsx probe12b.ts supply N [stage] [lines]` with ONLY=<graph id>, NOARR=1, XREST=n: rolls a packet's brief with tagged stand-ins and counts, per roll, what the deal asked for that the pool could not answer. It proves tags and counts only, never heights.
- `python3 cites.py <rev> <list>`: every file:line of a packet against a pattern, at the head the packet names (list rows: file|from|to|regex).
## Traps (new)
- The seed list refuses any quiet stretch over 4 s (seedList.ts:22); a run of bare `n` steps measures 6 s and more (quiet11.ts). Check every rhythm's run-out.
- `#ctest` builds on 1-2's stage id (stageGenerator.ts:2862): any rule keyed on '1-2' can move the testers' course, and lockall does not cover it (ctest12.ts).
- STATE.md on the lead's branch moves while a packet is being rewritten: read it again before each verdict (item 0 was dispatched elsewhere mid-audit).
- `npm ci` fails here (no lock file): CI uses `npm install --no-audit --no-fund --legacy-peer-deps`; delete the package-lock.json it writes before committing.
- `npx tsx` runs without node_modules for pure gen2 code and then dies on anything that imports react (flight.ts): install first.
- A designer's probe can pass on a brief that is not the packet's (probe12.ts:31): diff the probe's brief against the packet before trusting it.
- The deal hands out content types by quota, window and neighbours, never by what the pool holds for that job (pipeline.ts:595-618); a job with no section of a dealt type fails the roll (Law 22, pipeline.ts:2686-2688). Check every packet's job-by-type grid against its deal and the kit's windows (w1.ts:49).
- The node code's V3 knows only this stage's teach nodes (nodeCode.ts:138-141), not `manifest.lessons`.
- tierBots: the expert has no Easy bot (tierBots.ts:18-22) and a run carries no hearts; both are the Critic's to add before 1-2's bot run (not started).
## Owed by me
- hearts per run and per piece in tools/inspect/tierBots.ts, and an Easy answer for the expert floor, when the lead says go.
