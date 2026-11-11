# Method: the game map (a whole-game plan of worlds, moves, twists, engine order and hours)

Written by the Designer, 11-11, for reference/plans/GAME-MAP.md (no method existed; LESSONS: "a job with no method file gets one").

## Steps that worked
1. Read the fixed inputs first and list what is already approved, so the plan keeps it: stagePlan.ts (names, missions, story lines),
   the story keeper's world table (STORY-KEEPER.md §2, §5), the World 1 draft, any packet in build.
2. Read what the engine can do with file:line (the Architect's CAPABILITY.md) and the kit's shape (ADR-003). Use its hours; mark any
   hour of your own as "my judgement".
3. Check the art in the inventory JSON, not from memory: count rows whose world_best is the world, by layer
   (`python3 -I` over src/game/art/inventory/w{N}.json on the inventory branch). Name the thinnest worlds.
4. Give each world ONE new move and at least two new rules that change what the thumb does; run a freshness check table.
5. Write the move ladder (taught in / comes back in) and check every stage uses only moves at or above it.
6. Alternate hurry and patience worlds (STAGE-RULES §0b.3) and vary each stage's way (right/left/up/down) from its neighbours (§0b.6).
7. Hours: per stage from the latest measured benchmark (STATE.md), per piece from CAPABILITY; total per world; then the risks.
8. Open questions as multiple choice, recommendation first, each with its reason.

## Traps
- `git checkout -B` from main loses the lead's newer files (the ideas folder lives on the lead's branch, not main): branch from the
  lead's working branch.
- Long command output is trimmed in this environment: read big files with the Read tool, not `cat`.
- Regex counts over art ids are rough ("rot" matches "grotto"): use the layer column for counts and say which.
- Git's `--date=format:` prints UTC; use `TZ=America/New_York date` for any time written down.

## Updating the map
The map is a draft until Matt answers section 8. After each answer: change the world sections it touches, re-run the freshness and
ladder tables, and re-total the hours. Tick a world as "built" only when its stages pass on main.
