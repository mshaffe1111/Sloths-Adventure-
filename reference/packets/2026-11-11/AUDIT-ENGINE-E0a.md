# AUDIT of E0a (the verdicts and reach, 1-1 only)   to: Critic   model: claude-opus-5-5   effort: high
Assume it is wrong; prove where. Read ENGINE-E0-verdicts.md (E0a) beside this file, roles/CRITIC.md, LESSONS.md D37.
- Run each done-item's check yourself, the lockall pair included (a fresh main lock, then --check --intended 1-1).
- The lockall.ts diff excludes ONLY `verdicts` and `drops` from `gen2`'s hash, nothing else; `falls` on 5-7, 5-9 and W6-W8 stays
  byte-identical (the Drop records go in `drops`, they do not replace `falls`). The gate is as strict as before everywhere else.
- Every reach and band number in reach.ts traces to reach.md / bands.md at t-designer-reach@030a4093 (its `source` line).
- A planted roll fails by each name; reach.unflown appears in notJudged; a 5-7 and a World 7 roll build as before.
- seedlist 1-1 --check: how many proven seeds the verdicts refuse, by name; the re-proven provenSeeds.ts.
- Gates: tsc, the full suite in 3 shards, knowncheck. No tester text. `git status -sb` names the branch.
Return ONE send_message to the lead, 20 lines or fewer, opening "E0a: PASS or REJECT"; each violation as file:line | rule | evidence |
exact fix.

## Lead ruling, 11-11 4:57 AM ET (the Engine's pushback accepted; ADR-001 says the same)
The submission is t-engine-e0a@3bf6c123. Its suite is red by design: the verdicts refuse every 1-1 roll on today's w1 data (126 "1-1
cannot build" + 1 w1.test exitDy), which C1's re-lay fixes. DoD 5 (full suite green) is judged on the E0a+C1 integration branch, not
here. Audit everything else as written, and add:
- Every failure in the suite is one of those two kinds and nothing else (list any other by name: it is a REJECT).
- For each refusal name on today's 1-1 (teach.double-no-gap-after 138, band.out 130, floor.unmarked 112, block.lesser-passes 66): is
  it a REAL flaw in today's 1-1 (prove one by a flight or a drawn case with numbers) or a verdict that is wrong or too strict (prove
  one by a case it refuses that the reach spec allows)? C1 re-lays to these verdicts, so a wrong verdict here costs a whole re-lay.
- gen2.verdicts is Partial because a Normal build never builds Easy: say whether a 1-1 can pass on one setting and fail on the other.
- The Engine's note: stageGenerator.ts:2904 does not pass arcs to validateStage for 1-1; say whether C1's 252-262 px gaps would drop
  pickups as unreachable (prove it either way).
- State the main JS chunk in bytes after `npx vite build` against 4,194,304, and whether E0a's code is in the main chunk.
Return opening "E0a (verdict logic): PASS or REJECT", 20 lines or fewer.
