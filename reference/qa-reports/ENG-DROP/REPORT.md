# ENG-DROP (R-165.562): the run lay lays a DESIGNED drop past its corridor, on a real World 3 row

**Box 1 hand-over, stamped Fri Nov 27 6:51 PM ET (`TZ=America/New_York date`). Branch t-eng-drop on 7a580aefc. WIP, NOT gated, NOT landed.**

## EXACT NEXT STEP (the successor starts here)
1. DONE in box 1: w3Noise.test.ts WHOLE on t-eng-drop, `# tests 11 # pass 11 # fail 0` (`drop-w3noise.txt`; moss 393 px fall, slept,
   sleeper 295 px off; stone woke on [landing], 293 px off; 3-2 seed 2). The first run (`drop-w3noise-first-run.txt`) was 10/11: :329
   "moss: the sleeper lies about 300 px past where he lands (255 px)": off 3-2's cliff he lands about 185 px in, not 140 as off the tower's
   branch, so the toy's SLEEP_T went 0.55 -> 0.6 (the toy's placement for this row; the +-30 px assertion is unchanged).
2. Check the probe's 5 "no top found" rolls (below): the engine's own dropSeen passed them (no swap), the probe's top-finder (gap 8-20 px,
   |dy - 400| <= 12) missed them. Print one (TOP=bank VERBOSE probe) and say whether the cliff top merged with the ground before it.
3. **Ask the lead first (see "For the lead" 1):** on the trial merge the CALL and PUNCH toys are red too, not only moss/stone.
4. The trial-merge proof: DONE in box 1 up to the run. Recipe: a scratch branch from 7a580aefc, `git merge 38c1b2b20` (clean), then
   `git merge t-eng-drop`: ONE conflict, w3Noise.test.ts, resolved as the union (KIT-W3a's PLANTED dropClear test closed with `});`,
   then this branch's four ENG-DROP tests); the resolved file is `trial-union-w3Noise.test.ts.txt` here (copy it over, tsc clean).
   Its w3Noise WHOLE run was started at 6:53 PM with SLEEP_T 0.55 (before the fix above): result in `trial2-w3noise.txt` if box 1
   recorded it. Re-run it with the saved union file (which now has SLEEP_T 0.6): that is the proof on the trial tree.
5. Then packet steps 4-7 as written: the lock (lockall --layouts 16 on 7a580aefc ALONE, then --check on the frozen head ALONE,
   expected 102/102), 3-1's kit rolls before = after, pre-freeze (every importer of pipeline.ts / types.ts / stageTable.ts, by grep,
   with totals; w3.test, w3Level.test, w3Noise, tower.test), `git ls-remote origin refs/heads/t-eng-w3` (it will move for ENG-CATCH-i:
   merge by hash, re-run tsc + generality + tower.test + w3Noise), freeze in a detached worktree, the gates once, land.

## What is built (on t-eng-drop, tsc clean, generalitycheck PASS 26/26 known at each step)
- `SectionTemplate.drop?: number` (types.ts): a section DECLARES a designed drop (px). General: any section, any world.
- pipeline.ts `dropsPast(t)`: on a run (never a tower), a declared drop within the view's reach down (cameraFollow.ts `AHEAD.down`, 560)
  whose exit as laid (exitDyOf, the median lay) is its declared drop within `DROP_TOL` 12 px may exit past the corridor's floor; the
  corridor test in the weighted pick and in the required-section pick both read it. Every section without `drop` takes exactly the old
  test (the exemption is `&& !dropsPast(t)` on the `endY > bottom` side only).
- `fits`: a declared drop is never picked in a tower (`t.drop === undefined || !tower`).
- After it is laid: the run's ground is its landing (`gy = cur.y`, ctop / cbot / baseline from it, as a run leg's), and its own corridor
  is recorded at that ground; the non-routed stray check now reads each section's own corridor (`corridorOf`, set for every run section;
  identical values on any stage with no drop, since gy never moves there).
- FAILURE PATH, by name: `dropSeen(top, floor, platforms)` (exported) on the FINISHED stage, in checkAndRepair: the fall within AHEAD.down;
  no wood across the fall from the lip to `DROP_LAND` (180) px past the landing's near end; the camera's own look from the lip
  (`landingAhead`, the code the screen runs) finds the landing. A miss swaps that section with the why
  `<id>: its designed drop of N px has wood across its fall (x a-b at y c): he lands on that, not the drop` (or `falls N px, past what the
  view shows under him` / `is not what the view looks to from its lip`), never laid blind and never laid as an ordinary section.
  (First version judged at lay time: the probe showed it passed 28 rolls whose fall the finished stage crossed. Moved to checkAndRepair.)
- `DRAFT_TABLE['3-2'] = { kit: 'w3' }` (worlds/stageTable.ts:93; the packet said listed.ts: it lives in stageTable.ts), laid along.
- w3Noise.test.ts: the drop toys (moss, stone) on 3-2's row (`ALONG`), the call / punch toys still on 3-1's; the drop toy declares
  `drop: DROP`; its top is a CLIFF (bank, ground entry), see the root cause below. New tests: the toy laid on 3-2 in view (dropSeen
  undefined, not a tower); PLANTED: the drop undeclared -> laid 0 of 40; a declared drop in 3-1's tower -> laid 0 of 40; dropSeen names
  wood 280 px under the lip and a 700 px fall.

## Root cause found on the way (why a perch top is refused on a run)
The join into a ledge entry lays a soft pit (pitUnder, cur.x -> ox); R-165.246's hole fill (`joinPitFloors` / `pitHoleFill`) then
stretches that floor under the perch to the next earth, which is the drop's own landing bank: 3-2 seed 3, Normal: the pit floor
20497-20832 at y 688 under the top branch 20608-20821 at y 613, the landing 20832-21632 at y 1005. That is wood 75 px under the lip,
across the fall. A walk-off drop on a run is a cliff: with the top a bank (ground entry) the hole fill finds earth at the edge and lays
nothing. (Content, the toy's data, not an engine exemption; dropSeen still refuses any roll where wood crosses the fall.)

## Proof so far (probe: `reference/qa-reports/ENG-DROP/probe/droppick.mts`, 3-2 draft, seeds 1-40, the moss toy)
| top | setting | clean | toy laid | laid + clean | refused by name (swapped) | in view by the probe's finder |
|---|---|---|---|---|---|---|
| branch (perch) | Normal | 40/40 | 0/40 | 0 | 32 x "has wood across its fall" | - |
| branch (perch) | Easy | 40/40 | 0/40 | 0 | 32 x "has wood across its fall" | - |
| bank (cliff) | Normal | 39/40 | 33/40 | 33 | 0 | 28/33 (5 "no top found": step 2) |
| bank (cliff) | Easy | 39/40 | 33/40 | 33 | 0 | 28/33 (5 "no top found": step 2) |
| bank, drop UNDECLARED (the plant) | Normal / Easy | 40/40 | 0/40 | 0 | - | - |

The one unclean roll both settings: `THROW ... no section fits node n# (ketsu): the pool is spent` (3-2's draft pool, inherited; not the toy).
PUSHBACK's own baseline on the same row: picked 0 of 40.

## Step 1 RED, on the trial merge (scratch branch 7a580aefc + 38c1b2b20 = c7ed0b54, never pushed): w3Noise.test.ts WHOLE
`# tests 8 # pass 0 # fail 8` (549 s; `trial-w3noise-RED.txt`). The drop toys: "no roll of 3-1's draft lays the moss toy" (tests 6, 7,
8). ALSO red: tests 1-5, "no roll of 3-1's draft lays the call toy" / "... the punch toy": KIT-W3a's narrowed bricks take the 1000 px
flat floors off 3-1's tower too. Not in this packet's scope; for the lead.

## For the lead
1. The call and punch toys (1000 px flat floors, w3Noise :1-5) are red on the trial merge as well. Recommendation: move them to 3-2's
   row with the drops (they are flat, a run holds them; one line, `stageOf` returns ALONG for every row), proven on both trees. Your call:
   it widens the packet.
2. The drop toy's top is now a bank (a cliff) where it was a branch: the drop, the floor, the sleeper and every assertion are unchanged.

## Not done yet (honest list)
w3Noise WHOLE on t-eng-drop (running at hand-over), the trial-merge proof, the lock, 3-1 before/after, pre-freeze importers, the merge
of a moved t-eng-w3, the freeze, the gates, the landing. Nothing is landed on t-eng-w3.

## Method used / Lessons applied / Method update
- Method: ENGINE.md day one (planted failure first: the undeclared-drop plant), reference/methods/gates.md for what comes next.
- Lessons applied: "A gate must call the same code the screen calls" (D19): dropSeen uses cameraFollow.ts landingAhead and AHEAD.down,
  the screen's own look; check the fact before acting (the probe caught my lay-time check passing crossed falls); never change a rule
  to get around a defect (law 22: the hole fill R-165.246 is untouched; the toy's top is a cliff).
- Method update (proposal): a guarantee judged on a part-built stage must be re-judged on the finished one: later passes (joinPitFloors)
  add wood. Put "judge on the finished stage (checkAndRepair), never at lay time" in level.md / gates.md for any view or fall rule.

## Learned
A run's soft pit before a perch is stretched under it to the next earth: any section that wants open air under a ledge (a drop, a
glide off) must start on a cliff or be refused by name.
