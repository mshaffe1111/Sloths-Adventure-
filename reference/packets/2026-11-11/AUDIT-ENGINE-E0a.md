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
