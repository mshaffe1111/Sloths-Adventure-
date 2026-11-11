# Designer report: the 1-2 packets (R-165.11), attempt 6, 2026-11-11 5:35 PM ET, branch t-design-1-2, cites at t-int-1-1@53bd446a
**Method used:** reference/methods/dispatch-packet.md; C1's packet as the shape; the packet Critic's method update applied (the
probe runs the packet's OWN brief and prints each job's dealt types against the sections that answer them).
**Lessons applied:** D19 (the built stage, not sockets), D25 (time from C1's measured history, as a range), D32 (tool flags from
arg parsing), D37 (every engine claim run: supply12, chainlay12, finds11), D40 (three pushes, routing last), D41 (art to 89.1 units).
## 1. Done-items
| Asked | Where | Evidence |
|---|---|---|
| Every Critic line fixed (attempt 1: CONTENT 14, ENGINE 6; attempt 2: CONTENT 1, ENGINE 3) | DESIGN-1-2-notes.md §9, line by line | both packets at attempt 3 |
| The quiet-line cure flown before it was written in | `FLOWN=1 npx tsx reference/specs/sims/quiet12.ts 120` | six bare steps down 8.7-11.1 s on 50 of 50; six `N` median 2.1 s, over 4 s on 1 of 41 |
| The lead's nine rulings | notes §3 | in the packets |
| The deal re-probed on the packet's own brief, real pipeline | `FLOWN=1 npx tsx reference/specs/sims/supply12.ts 120` | 720 of 720 rolls build, 0 throws; pool short on 2 / 6 / 3 rolls of 120 (graphs A / B / C); none of the 53 never laid; every test cell holds two; sims/out/supply12-flown.txt |
| The same on today's engine, for the record | `npx tsx reference/specs/sims/supply12.ts 60` | most seeds throw or swap: sims/out/supply12-today.txt |
| Stage brief, graphs, sections, thorny floor, petals, Easy, bots, stills, gates, done-items, what is shared | CONTENT-1-2-relay.md | 53 sections: 11 reused, 17 own, 25 new; 10 done-items by phase |
| The Engine packet | ENGINE-1-2-routing.md | items 1-7 in two pushes (item 0 struck: the follow-up round's), each with file:line, a done-test and its gates |
| The Critic's one attempt-3 line (the hop step, 13 a roll) and the lead's ruling of 5:10 PM ET | CONTENT rule 3, the 14 rhythms, done-item 1; notes §1, §3, §9 | no two `N` side by side; a drop `J` or the kit's `Y` between beats; flown: `J N J N` over 4 s on 0 of 52, a drop between steps up 1 of 47, 4.2 s (`quiet12.ts`, 11 ways down, the full run as printed); counted: median 4 / 2 / 4, max 6, 0 of 360 rolls over 6 (`ncount12.ts`) |
| The Critic's two ENGINE notes; the lead's standing rule D43 (5:24 PM ET) | ENGINE attempt 5 | item 5: pipeline.ts:193 and ctest12.ts `--record` / `--check`; every item for any stage from data, proven on 1-2, each with an "Any stage" proof; a grep check per push; CONTENT names its three data rows |
| The lead's rulings of 4:58 PM ET | both packets, attempt 4 | item 0 struck; yield floor 1 in 50; a quiet test per section (done-item 2b); the rest already met at 89005905 |
## 2. Polish check
No screens (packets). Tables checked for broken code spans; times from `date`; every new cite read at 53bd446a.
## 3. Pushback (on my own attempt 1, and on the engine as found)
1. **The level check counts no double jump on 1-2** (levelCheck.ts:132-134: `EARLY_DOUBLE` holds '1-1' only). Neither packet nor
   the audit had it: on 1-2 today every section with a double or bounce-plus-jump block reads as unreachable and is swapped out
   (11 of the pool). It is Engine item 5, beside the Critic's V3 line.
2. **Caches cannot be petals on a harvest stage.** The quota is 87.5% of all petals laid: 4 to 7 petals a roll may sit off the low
   road, and three fork ends are 9. The game already has the answer: a `fruit` pickup counts toward the goal and is not in the
   quota (engine.ts:3009-3010, :3080; goals.ts:57). Engine item 6 lays one for every off-road pickup where the brief asks. ACCEPTED 4:47 PM ET.
3. **A required section is fitted by its phases, a reward node by nothing else** (pipeline.ts:1348): attempt 1's note hollow would
   have fitted no node. It now carries `phases: ['sho', 'ten']`.
4. **Attempt 1's probe ran another brief** (the Critic's line 1 is right). probe12.ts is kept and labelled as what it was.
## 4. Suggestions (ready packets)
- **1-1's sprint-B never rolls clean** (the Critic, beside its task: 28 of 28 "combine: no bounce section left"): the same supply
  run, `npx tsx reference/qa-reports/CRITIC-1-2-packet/probe12b.ts supply 60 1-1`, names the cell; a Content packet adds one
  bounce combine to 1-1 or the graph is dropped and named. It belongs with R-165.120 (the yield).
- **DESIGNER help.md §5** (failures counted through a lost life, one system with assist.ts) before 1-2 reaches testers.
## 5. Unresolved
- CONTENT attempt 6 PASSED at 3507c3a2 (two builder notes, both in); since then petals low (rule 5, done-item 4). ENGINE attempt 5 (D43, three wording fixes) is with the Critic.
- The ruling's `Y`, `F` and a drop are no beat to the inspector (flown): each is laid between two beats, never last. The first
  mix I flew (`J N J Y`, a jump-down drop) broke the quiet line on 23 of 51 rolls and is not in the packet.
- Petals LOW on the bark (BRIEF-1-2 "must", the story keeper 5:33 PM ET): my "a petal over every cap" was wrong, and the pipeline
  hangs a 3-petal arc over most gaps by itself (pipeline.ts:2178-2185): CONTENT rule 5 and done-item 4, ENGINE item 6 (`petals: 'low'`).
  Bonus blooms stay high (the lead) as a painted growing flower, `flowers-atlas#f76`, never the hibiscus (the story keeper): `bloomSprite`.
- Thin supply cells: notes §8 (eight job-and-type cells hold one section each; the three test cells hold two).
- supply12 proves tags and counts with stand-ins, not heights: the builder's raw builds are the proof of reach. Not run by me: the tier bots or stage.ts on a 1-2 that does not build yet. The thorn bed has not been drawn.
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
to 4:47 PM. The Critic's second audit back 4:57 PM. Attempt 3: to 5:03 PM, attempt 4 to 5:05 PM. The third audit back 5:10 PM. Attempt 5: to 5:24 PM (D43 to 5:30). The fourth audit back 5:31 PM. Attempt 6: to 2026-11-11 5:32 PM ET.
Four review rounds. What would have saved each: 1 running the packet's own brief before writing the pool; 2 checking each run-out
against the quiet line; 3 counting each new beat per roll; 4 asking what each section is mirrored. The brief's "must" list, line by line, would have caught the petals.
