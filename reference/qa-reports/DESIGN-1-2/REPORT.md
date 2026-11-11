# Designer report: the 1-2 packet (R-165.11), 2026-11-11 3:49 PM ET, branch t-design-1-2 on t-int-1-1@5dafe73b
**Method used:** reference/methods/dispatch-packet.md (the packet's parts), C1's packet as the shape, its two audits as the list of
what to prevent; every engine claim read in code or run (D37); every number flown (roles/DESIGNER.md).
**Lessons applied:** D19 (judge what the screen lays, not sockets: the fork-end find), D32 (tool flags read from arg parsing), D37 (one
pasted run per engine claim: probe12, chainlay12), D40 (named what it is built on; §E kept out of Content's files), D41 (art to 89.1 units).
## 1. Done-items (the lead's list)
| Asked | Where | Evidence |
|---|---|---|
| The stage brief (beat, teaches nothing new, feel, length, tempo, deal) | packet "The stage brief" | length floor 140 s against the engine's own 135 s target (notes §2) |
| The graphs in node code | packet "The graphs" | 3 harvest graphs, valid by the engine's checker: sims/out/probe12.txt |
| The section list | packet "The sections" | 44: 16 reused as they are, 10 own versions, 18 new |
| The thorny floor: what hurts, how shown, HF | packet "The thorny floor", notes §5 | painted clumps exist (9 ready, unplaced); HF none needed, 4 prompts named, nothing launched |
| Petals as the goal, rewards, hidden finds | packet "Petals, rewards and hidden finds" | the quota's source read (goals.ts); the low-road rule; caches; the note |
| Easy variant | packet "Easy", chain.md §3 | flown on Easy: sims/out/easy-1-2-chain.txt |
| What the bots must show | done-item 7 | tier-bot flags read from tierBots.ts:168-171 |
| Stills and clips, upright and sideways, Easy and Normal | done-item 8, "Show first" | |
| The gates | done-item 9 | CLAUDE.md's list |
| Definition of done, item by item | 10 items | |
| What is shared, and other stages' locks | packet "What is shared" | lockall and seedlist flags read from the tools |
Also delivered: reference/specs/chain.md (the bounce chain, flown on 1-2, both settings); sims/flight.ts (+ `FLIGHT_STAGE`, `chain`),
chainlay12.ts (gen2 lays a chain in band today: 36 of 36 lays), probe12.ts, finds11.ts; the turnover note rewritten.
## 2. Polish check
No screens were made (a packet). The packet's hold point puts the first thorn hollow in front of Matt before the rest is dressed.
Tables checked for broken code spans; times pasted from `date`.
## 3. Pushback
1. **"Teaches nothing new" holds for moves only.** A thorny floor is a first hazard, and STAGE-RULES §1 says every first appearance
   is taught in a safe spot before it can hurt. The packet adds one thorn lesson (a T node) and no move lesson.
2. **"Sections only" (CAPABILITY, A9) is not the whole cost.** The arcs are flown, but 1-2 on gen2 also needs Engine work: routing
   (7 places), the verdicts' 1-1-only scope, a floor that costs a heart (no such drop type exists), and the note as the find
   (gen2 lays a golden seed). Listed with file:line as the packet's §E; Content can lay and probe sections without it.
3. **1-1's bands were not 1-2's until flown:** the early-stage help fades by stage number. Flown: 1 px lower on doubles, so they hold.
4. **The old brief's story source (story-briefs/1-2.md) is on none of the branches I read** (the lead's, t-int-1-1, engine-spec,
   engine-core): its line cites could not be re-read. The packet takes the story from BRIEF-1-2.md and the code.
## 4. Suggestions (ready packets)
- **ENGINE-1-2-open:** the packet's §E, a-d, as written there (files and lines named). Done when `seedlist 1-2 --check` runs, a
  thorn hollow costs one heart on Normal and none on Easy in a RealPlay test with the real `heartFall`, `drop.look-lies` covers the
  thorn look, and lockall shows only 1-2 moved.
- **CONTENT or INT fix, 1-1:** `offPathFilled` (w1.ts:1504) treats a `find` socket outside the required section as empty, so the
  end of every `gFork` high road gets its petal; w1.test's off-path check reads `collectibles` on built rolls (sims/finds11.ts is
  the red test today: 5 empty ends on seeds 4106, 1025, 1136, each setting). 1-1's list is re-proven after it.
- **DESIGNER help.md §5** before 1-2 reaches testers: 1-2 has thorns and no help for a stuck child.
## 5. Unresolved
- The packet has not been audited cold (D34: its Critic comes next). The six calls for the lead: notes §3.
- Not run by me: tools/engine/stage.ts and era.ts on a gen2 1-2 (it does not build yet); the packet tells the builder to prove them.
- No thorn hollow has been drawn: the clumps' fit as a floor (no tiling strip exists) is judged at the builder's first still.
## 6. Method update
- dispatch-packet.md, add under "Frozen inputs": "A packet for a stage on a new engine path includes one pasted probe build of that
  stage (`buildGen2Stage` with the brief added in memory) and names the first error it stops on." Proof: probe12 found in 3 s that
  1-2 needs harvest graphs, `lessons`, and dies at the first rest; none of it was in the 11-05 brief.
- roles/DESIGNER.md "Traps", add: "The early-stage help is a ramp by stage (`easeAssist`): fly each new stage with `FLIGHT_STAGE`."
## 7. Turnover note
reference/handoffs/designer.md rewritten in this commit (base: t-designer-reach's 11-09 note, so nothing of the reach flight is lost).
## Benchmark (the Designer's part)
Times from `date`: started about 3:28 PM ET (the lead's STATE line); report written 2026-11-11 3:49 PM ET. Slowed by: the specs living on another
branch (t-designer-reach not merged into t-int-1-1), the inventory on a third, and no story brief for 1-2 on any.
