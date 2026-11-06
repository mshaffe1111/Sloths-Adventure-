# Release clerk status: release-0.9.5 (gen2 1-1 goes live)

Brief: the lead's plan `reference/notes/release-plan-1-1.md` on ccr-23292c36-550qmt. Branch: `release-0.9.5`, cut from origin/main 68b31e665 (0.9.4).
Never from ccr-0d59a91c-oy3imz, the lead branch or engine-spec (D40).

Last update: 2:55 PM ET, 2026-11-06.

## Done
- 2:46 PM: release-0.9.5 cut from origin/main 68b31e66 and pushed.
- 2:47 PM: dependencies installed (`npm install --legacy-peer-deps`, as CI does; package-lock.json not committed).
- 2:50 PM: roadmapcheck on main: **PASS** (once main is unshallowed). The "7 fails" are not on main. On engine-core 5e221f9d it was 4 fails;
  3 of them (R-165.36's 0dffc84e, 1dbf26e9 on engine-spec, f54181e6 on engine-critic-spec) pass once every origin branch is fetched (the
  checker accepts a commit on any remote branch; CI's fetch-depth 0 fetches them). 1 is real data: `reference/qa-reports/engine-core/NEXT.md`
  is cited by no R-item. I fix it on the merged branch (citation on R-165.1, engine-core's own item), never the checker.
- 2:53 PM: funcheck's known list re-recorded from main (R-165.44). Method: a worktree of origin/main 68b31e66 with engine-core's
  `tools/validate/` copied in (every import resolves on main), then:
  - `npx tsx tools/validate/funcheck.ts` with engine-core's list: FAIL (80 worse or new, 1 to lower; 75 known): the W1-recorded list.
  - `FUNCHECK_WRITE=1 npx tsx tools/validate/funcheck.ts`: wrote 144 entries.
  - run again, unchanged: `PASS (144 known, 1872 stage-layout flags, World 1, 16 layouts, Normal and Easy; 54 s)`, twice the same.
  - Committed with the merge (the file is new to main, so knowncheck treats it as a new list).
  - Question for the lead: funcheck's `REBUILT = ['1-1', '1-4']` gates 1-4 on the truer rules. On main (and on engine-core) 1-4 is main's
    1-4, not a rebuild. I did not change it (it is the gate's config, not its list). Say if 1-4 should come off REBUILT.

## In progress
- The main lock: `npx tsx tools/engine/lockall.ts --layouts 16 --out tools/engine/lockall-main-0.9.4.json` (engine-core's lockall.ts,
  run on main's code), background, started 2:47 PM.

## Gate table (the merged candidate) so far
| # | Gate | Result |
|---|---|---|
| 1 | tsc | NOT RUN (waits on the merge) |
| 2 | tests, 3 shards | NOT RUN |
| 3 | vite build (no asset over 4 MiB) | NOT RUN |
| 4 | npm run build:store | NOT RUN |
| 5 | artcheck | NOT RUN |
| 6 | knowncheck | NOT RUN |
| 7 | clipcheck | NOT RUN |
| 8 | drawcheck | NOT RUN |
| 9 | roadmapcheck | main PASS; engine-core 1 real fail (above) |
| 10 | funcheck | main re-recorded PASS; candidate NOT RUN |
| 11 | lockall --check | baseline recording |

## Questions for the lead
1. Has tester-page passed? (I merge it only on your word, written here or in STATUS.md.)
2. Has engine-chunks passed? (same)
3. funcheck REBUILT and 1-4 (above).
