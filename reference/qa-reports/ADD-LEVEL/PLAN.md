# ADD-LEVEL PLAN (R-165.187; Engine, Opus 5.5 high; branch t-add-level from b09a9a05). 10:42 AM ET.
1. Read: packet, TODAY.md, LAWS, LESSONS, level.md, ENGINE-NEEDS §3, library13.ts, seedlist.ts, listed/stageTable/reach/flownArcs, stageSheets, limits.json, run.mjs, castBots.
2. libstage.ts --stage <id>: roll N seeds x both settings from the stage's stageTable row (listed.ts kit, worldsData config) = the game's own build;
   CLEAN counts, refusals by kind, graph, beats, cast kinds, modelled seconds. library13.ts stays (its test is 1-3's plan test; no caller moves).
3. registrycheck.ts: per stageTable row: kit resolves, worldsData config, levelSeeds entry, sheets (STAGE_DRAWS or world-wide path), drawcheck
   scenario (limits.json), seed list in provenIndex or row.standIn, judged scope has flown rows or the row is named unflown; gates.yml runs
   seedlist --check for every PROVEN_INDEX list. Misses at birth go to tools/engine/registry.known.json (shrink-only; stale entry fails).
4. addlevel.ts <id>: libstage 24 seeds, seedlist <id> --count N (only with --write), castBots 1-40, prints flight command, registry misses.
   Proof: replay 1-3 in a scratch worktree (its list removed) -> same list hash 18d380ae.
WRITE (new, mine): tools/engine/{libstage,addlevel,registrycheck}.ts, libstage.test.ts, registrycheck.test.ts, registry.known.json,
  reference/qa-reports/ADD-LEVEL/*, reference/handoffs/engine-core.md (turnover).
WRITE (shared, token asked first): .github/workflows/gates.yml (tests + per-list seedlist loop + the gate); tools/perf/knowncheck.mjs (one line:
  the new known list) and reference/ROADMAP.md (R-165.187 Source cites registry.known.json) if the lead approves, else the lead adds them.
READ only: stageTable.ts, limits.json, provenIndex.ts, seed lists, src/ (no src change).
