# Designer report: the 1-2 packets (R-165.11), attempt 2, 2026-11-11 4:46 PM ET, branch t-design-1-2, cites at t-int-1-1@53bd446a
**Method used:** reference/methods/dispatch-packet.md; C1's packet as the shape; the packet Critic's method update applied (the
probe runs the packet's OWN brief and prints each job's dealt types against the sections that answer them).
**Lessons applied:** D19 (the built stage, not sockets), D25 (time from C1's measured history, as a range), D32 (tool flags from
arg parsing), D37 (every engine claim run: supply12, chainlay12, finds11), D40 (three pushes, routing last), D41 (art to 89.1 units).
## 1. Done-items
| Asked | Where | Evidence |
|---|---|---|
| Every Critic line fixed (CONTENT 14, ENGINE 6) | DESIGN-1-2-notes.md §9, line by line | both packets rewritten as attempt 2 |
| The lead's nine rulings | notes §3 | in the packets |
| The deal re-probed on the packet's own brief, real pipeline | `FLOWN=1 npx tsx reference/specs/sims/supply12.ts 120` | 720 of 720 rolls build, 0 throws; pool short on 2 / 6 / 3 rolls of 120 (graphs A / B / C); no section never laid; sims/out/supply12-flown.txt |
| The same on today's engine, for the record | `npx tsx reference/specs/sims/supply12.ts 60` | most seeds throw or swap: sims/out/supply12-today.txt |
| Stage brief, graphs, sections, thorny floor, petals, Easy, bots, stills, gates, done-items, what is shared | CONTENT-1-2-relay.md | 51 sections: 13 reused, 13 own, 25 new; 10 done-items by phase |
| The Engine packet | ENGINE-1-2-routing.md | 8 items in 3 pushes, each with file:line, a done-test and its gates |
## 2. Polish check
No screens (packets). Tables checked for broken code spans; times from `date`; every new cite read at 53bd446a.
## 3. Pushback (on my own attempt 1, and on the engine as found)
1. **The level check counts no double jump on 1-2** (levelCheck.ts:132-134: `EARLY_DOUBLE` holds '1-1' only). Neither packet nor
   the audit had it: on 1-2 today every section with a double or bounce-plus-jump block reads as unreachable and is swapped out
   (11 of the pool). It is Engine item 5, beside the Critic's V3 line.
2. **Caches cannot be petals on a harvest stage.** The quota is 87.5% of all petals laid: 4 to 7 petals a roll may sit off the low
   road, and three fork ends are 9. The game already has the answer: a `fruit` pickup counts toward the goal and is not in the
   quota (engine.ts:3002, :3073; goals.ts:51). Engine item 6 lays one for every off-road pickup on a harvest stage. ACCEPTED by the
   lead, 11-11 4:47 PM ET.
3. **A required section is fitted by its phases, a reward node by nothing else** (pipeline.ts:1348): attempt 1's note hollow would
   have fitted no node. It now carries `phases: ['sho', 'ten']`.
4. **Attempt 1's probe ran another brief** (the Critic's line 1 is right). probe12.ts is kept and labelled as what it was.
## 4. Suggestions (ready packets)
- **1-1's sprint-B never rolls clean** (the Critic, beside its task: 28 of 28 "combine: no bounce section left"): the same supply
  run, `npx tsx reference/qa-reports/CRITIC-1-2-packet/probe12b.ts supply 60 1-1`, names the cell; a Content packet adds one
  bounce combine to 1-1 or the graph is dropped and named. It belongs with R-165.120 (the yield).
- **DESIGNER help.md §5** (failures counted through a lost life, one system with assist.ts) before 1-2 reaches testers.
## 5. Unresolved
- Nothing is open with the lead: the three calls attempt 2 left open were accepted 11-11 4:47 PM ET (notes §3). Attempt 2 is
  with the packet Critic.
- Thin supply cells are named in notes §8: eight job-and-type cells hold one section each.
- supply12 proves tags and counts with stand-ins, not heights: the builder's raw builds are the proof of reach.
- Not run by me: the tier bots or stage.ts on a 1-2 that does not build yet. The thorn bed has not been drawn.
- roadmapcheck fails in my container on commits from branches not fetched here; I added no roadmap row.
## 6. Method update
- dispatch-packet.md "Frozen inputs" (with the Critic's wording): the pasted probe uses the packet's OWN brief and prints, for
  every graph, each job's dealt types against the sections that answer them; AND it is run twice, on today's engine and with the
  engine items it waits on stood in, so the packet says what works before and after each push. Proof: the second run found the
  double is not counted on 1-2 and that a required section fits by phase; neither showed on today's engine, where the roll
  throws first.
- roles/DESIGNER.md "Traps": "The engine's kit hands out the same section objects on every call (`w1World()`): a probe that edits
  tags copies each section first." It cost me one wrong run.
## 7. Turnover note
reference/handoffs/designer.md rewritten in this commit.
## Benchmark (the Designer's part)
Attempt 1: about 3:28 PM to 3:51 PM ET (packet), 3:53 to 3:59 PM (Engine packet). Critic's audit back 4:25 PM. Attempt 2: 4:26 PM
to 2026-11-11 4:46 PM ET. One review round so far. What would have saved the round: running the packet's own brief before writing the pool.
