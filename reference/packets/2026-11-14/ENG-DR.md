# ENG-DR: a stage's data places ANY inventory piece as dressing (hung by its top or standing, at its inventory scale). Opus 5.5 xhigh. Written 8:03 PM ET 11-14.
Role card: reference/roles/ENGINE.md. Read level.md rules 21-22, PERFORMANCE-RULES.md §1 and §8, CLAUDE.md "Inventory first" and "To scale with
Pokey", then ONLY: src/game/art/inventory.ts (how the engine reads the catalog), dressNewData.ts (today's drawable World 1 dressing: hung
ferns, berries, orchids, nests, seed pods), puzzleAtlasData.ts KIT_ART, rollingPiece.ts:60-70 (the one place that loads an inventory
picture today, M-10-d), and BUILD-18's dressing rows in src/game/gen2/worlds/w1Arc18.ts on origin/t-build-18.
Why: Matt's inventory-first rule says the engine reads every picture through the inventory, but no stage can place an inventory picture
as dressing; 1-8's palm crowns and cannonball trunks (BUILD-18 8:16 PM) are the first case, every later level the next.
FIRST (S, a correctness hole on SHIPPED stages): the seed list never runs a row's own finish (tools/engine/seedlist.ts:35 runs
w1Finish only, for a squirrels row), so a seed whose finish (1-7's finish17, 1-8's finish18) throws can be listed and then throw on a
phone. Build each seed with listed.ts FINISH and refuse a throw by name; planted; re-run --check on every listed stage (1-7 included)
and report any seed that now fails. Then:
Build: one dressing row type by inventory id (hung by top / standing on ground / behind the play layer), scaled from the inventory's own
scale field against Pokey's 89.1 px (R-165.107: the scale gate flags out-of-range), packed into an atlas or baked so a frame pays at most a
few drawImage calls (PERFORMANCE §1 pass/fail), any stage, any world. Planted test: a row with an id the inventory lacks fails by name; an
out-of-scale row fails the scale gate. Then 1-8's rows draw: stills of 1-8's nut drops (palm crown overhead) and fruit drops (trunk behind)
upright + sideways; drawcheck on 1-8 + the 1-98 fixture; the WHOLE suite on your head; lock (only stages with dressing rows move).
Branch: t-eng-dr from origin/t-build-18's head at start (git ls-remote), so 1-8's rows are there. REPORT reference/qa-reports/ENG-DR/REPORT.md
with "Learned", EXACT NEXT STEP. BOX 2 h, or 40% real context. No shell wait loops. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
