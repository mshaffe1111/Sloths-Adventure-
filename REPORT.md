# EN-L report, Engine, 2026-11-11 (final 9:57 PM ET). Branch t-engine-library (base t-engine-yield@729f249d)
The piece library: a stage's hazard, pickups, trend and POOL now come from its brief and are applied by the lay. Nothing the game
ships sets the new fields, so no shipped stage moves. Steps 1 and 3 were built by two parallel builders in worktrees and merged here.
## THE PROOF (step 4): 1-2 rolled from World 1's existing sections, picked by need, plus the chain bricks
`npx tsx tools/engine/library.ts --seeds 120 --par 3 --flown` (tool-side; `library.test.ts` holds it on 12 seeds; `library-where.ts` names the section behind each refusal)
| 120 rolls, seeds 1-120, the Designer's three harvest graphs | Normal | Easy |
|---|---|---|
| builds (no throw) | 120 | 120 |
| **CLEAN (no gen2.errors)** | **0** | **0** |
| clean but for ONE engine item (the thorn bed is not painted: `drop.look-lies`, EN-Y's B item 2) | **73 (61%)** | **67 (56%)** |
| the same with only six twist bricks (`--min`) | 71 (59%) | 66 (55%) |
| pool short | 6 | 6 |
A roll: 14.8 sections, 3.3 of them twist bricks, 12.7 hollows, 85 petals, 8.8 blooms; the end 34 px over the start.
**New sections 1-2 still needs: 11 (9 at the least). Was 42. The target of 8 is NOT met.** Counted:
- **0 of the packet's 17 re-cut "own versions".** Thorns, petals low, blooms, the level trend and 1-1's lines left out are the brief's now.
- **8 chain-hop twist bricks** (authored in library.ts from the Designer's chainlay12 bands; 6 is the least: teach, two signatures, a run, steps down, steps up).
- **1 exit on the ground** (stood in): all three of World 1's exits stand on a high log with nothing under them.
- **1 way-down brick** (a drop and a hop step, the packet's `J N`; laid 106 times in 240 rolls). World 1's library barely comes down: of 140 versions 44 rise, 88 are level, 8 fall.
- **1 note hollow** (required, story): NOT built and not in the rolls.
- Not sections, but data 1-2 needs: 7 TAG edits (`feel: ['canopy']` on the bough rests and exits, which only a no-lethal stage may hold); a corridor row (World 1's has 80 px under the floor: with it 23 pool-shorts of 120, with 320 px 6); Dot's thorn line.
- The packet's other 14 new sections (arrivals, rests, root runs, three forks, the thorn leap) are VARIETY and LOOK, not needed to roll. Matt's "more pieces" rule decides how many; each is now one shape, never a re-cut.
**What refuses the other 39% (Normal, rolls of 120; each traced to its section):** `band.out` bounce-air-test 23 (w1-twin-bounce 4-stair, w1-ledges walls, w1-hop-bounce wall-leap: 1-1's own sections, a few px under their band); `floor.unmarked` 18 and `drop.untyped` 14 (on a 24-roll trace: leap-stones one-gap, twin-bounce 4-stair, bank-stair-fork a, hollow-twoway 360-stump; a different set from the run on World 1's corridor, so the room under the floor moves this and is not understood yet); pool short 6 (descent/climb has ONE section, combine/climb none); V-rules on the deal 10; single-rise 5.
## What this does NOT prove (read this before quoting 61%)
1. **Flown rows.** 1-2's rows are filed under the flown stage's id, as the Designer's supply12 does. On today's engine 1-2 THROWS on every roll (its double is not counted: packet E12 item 5). 61% is "after item 5".
2. **Strict clean is 0%** until the thorn bed is painted (w1Pits reports no `hurt` floor): every roll with a hollow is refused, rightly.
3. **Length is 1-1's, not 1-2's.** Six rolls model 187-227 s typical; six of 1-1's own proven stages model 180-220 s (13-15 sections, 32,000-39,500 px). 1-2's brief aims 135 s: its kit rows need their own chunk count. Not a library fault, not fixed.
4. Not run: the quiet line (listable), the tier bots, a still. No Dot line is said (the teach's tip names no line: words are Content's). `hint.1-2.*` has no socket. The showing piece is a ledge before the first chain, not the packet's log over a hollow.
5. The chain bricks are in a TOOL file. Moving them into World 1's data, with Content's review of each band, is the real authoring that is left.
## Step 1, pickups by brief (DONE; briefPickups.test.ts, 5 tests)
`GraphBrief.petals: 'low'` (no arc over any gap) and `offRoad: 'fruit'` (a pickup socket on a piece marked `main: false` lays a bloom). On 1-1's OWN sections, 12 proven plans, both settings: 2,293 petals none over 50 px up, 441 arcs not laid, 224 blooms on 144 off-road sockets and nowhere else; with no field nothing moves. Two fixes its tests forced, on every stage: the check's repair now removes a `fruit` that cannot stand, and a harvest's top-up never lays a petal inside a stump (both act only on rolls that failed before; the lock holds). NOT proven: `withGoals` 87.5%, a real-play bloom count, `bloomSprite` (art).
## Step 2, sections picked by need (DONE; briefPick.test.ts, 6 tests, each seen failing first)
`GraphBrief.pick`: the pool is the world's whole library less what is parked, what the deal holds no type for, and what the brief refuses; `feel` names no stage there and only EXCLUDES (`pick.refuse`). A socket whose `allow` starts with a refused name stays empty, so a shape never brings another stage's line. No `pick`: the pool is cut as before, section for section (tested). **Not done: the stage ids are still in World 1's `feel` lists** (1-1 keeps its sections and list; they go when 1-1's brief takes `pick` and its list is rebuilt). No stage id, seed or x was added to engine code: the generality gate (on t-engine-fixes, not on this base) gains no entry by reading; it was NOT run here.
Also the lay's (found by the proof, each test-first): hollows by brief wait for the lesson's showing piece (`hazard.untaught` by construction); `pits: 'lesson'` lays hollows only under sections that teach or use the lesson ('hurt' gave 22 a roll, every soft pit); **the trend**: every seam stepped toward World 1's corridor middle, 410 px over its floor, so a "level" 1-2 ended 370 px up. A level stage's seams and picks now lean to its start height: 34 px.
## Step 3, one brick in two worlds' art (DONE as far as the lay; brickSlots.test.ts, 5 tests)
The inventory's engine slot is `ArtRow.engine_slot` (src/game/art/inventory.ts:30), e.g. `landing/platforms solid log`. `SectionPiece.slot` + `WorldManifest.slots`: the lay takes the world's row (style, an art id by the piece's own place); no row fails by name. 41 of 1-1's 73 sections laid as the SAME template under World 1's and World 2's rows on 8 proven plans, same geometry, no art id shared. **Limits:** World 2 has no gen2 kit (it is World 1's geometry with World 2's rows); nothing is DRAWN from `PlacedPiece.art`; boughs and mushrooms have no usable inventory key, so 32 sections (and the chain's caps) are not bricks yet. The inventory (3.6 MB of JSON) came unchanged from t-engine-inventory@621a3d2b and only tests import it.
## Gates on the head
PASS on the head (checked 9:56 PM ET): **tsc** (exit 0); **seedlist 1-1 --check: PASS, 200 seeds, each clean on both settings** (run after step 2, by each
builder, and on the final head); **stage lock 102 of 102 unchanged** against the base (`lockall --layouts 2`, 408 builds; the base was
102 of 102 against main); the tests touched: briefPick 6 of 6, briefPickups 5 of 5, briefPits 2 of 2, brickSlots 5 of 5, library.test 5 of 5.
**gen2 + worlds suites: 393 of 393 pass, 0 fail** (the base's 377 plus 16 new; finished 9:57 PM ET); artcheck PASS; knowncheck PASS (no known-defect list gained an entry).
**Main JS 3,996,883 B: +1,469 B over the base** (3,995,414). chunkcheck FAILS by 2,579 B (the base failed by 1,110; known until the seed-list split, R-165.112).
NOT run: drawcheck, clipcheck, the core suite outside gen2, tierBots, the generality gate (not on this base), any still (nothing that draws ships). roadmapcheck cannot run in this container (a shallow clone).
## Method update
- Worked: measure, then trace each refusal to its section (`library-where.ts`) before changing anything. It found three causes no summary named: my own brick's zero-width gap, the seams' pull to the corridor middle, and no room under the floor.
- Failed: two guesses at the trend (a pick-weight lean alone; appending a way down to every rising section) moved the number 0-40 px and cost 15 minutes. The roll's own heights, section by section, showed the seams in one print. Edit for reference/methods: "a trend or height complaint: print each section's entry and exit height first".
- Fresh containers have no node_modules and `npm ci` fails (bun.lock): `bun install --frozen-lockfile` (4 s).
## Exact next step
1. Engine: paint the thorn bed (w1Pits `hurt`) and count 1-2's double (E12 item 5); then `library.ts` without `--flown` is the real number. 2. Content: move the 8 chain bricks, the way-down and a ground exit into w1.ts (bands reviewed), build the note hollow, add the 7 canopy tags. 3. Engine: a per-stage corridor row and 1-2's kit rows (`pick`, `pits: 'lesson'`, `petals`, `offRoad`), then length (item 3 above) and the quiet line through yield.ts. 4. The descent/climb and combine/climb cells need a second section each.
