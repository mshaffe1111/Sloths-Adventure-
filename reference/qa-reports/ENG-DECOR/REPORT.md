# ENG-DECOR (R-165.542): no decoration looks like a hazard on a stage where that hazard lives

## EXACT NEXT STEP (box 2)
1. ReadNotifications. `git fetch origin t-eng-decor t-eng-29`; check out t-eng-decor (the fix, uncommitted nothing). Base = origin/t-eng-29
   7387d089a (merge, never rebase, if ENG-CAM29 has landed there since).
2. The lock gate's base: box 1 started `lockall --layouts 16 --out base.json` on a worktree of 7387d089a; if no base.json is in hand,
   re-run it: `git worktree add --detach <scratch>/base origin/t-eng-29`, symlink node_modules,
   `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json` (from the worktree), then on t-eng-decor
   `npx tsx tools/engine/lockall.ts --layouts 16 --check <scratch>/base.json`, with its counts line. ONLY 2-5 and 2-9 may move, and only
   in `proto.dress` (or `dress`). Name every other move and STOP if there is one.
3. `src/game/dressLookalike.test.ts` on its own: box 1 started it (World 2: ~600 listed seeds + 2-6/2-8/2-9 x16, both settings; minutes).
   It must pass, and its PLANT test (the turtle row deleted) must find the turtle on 2-5 and 2-9.
4. seedlist --check for 2-5: `npx tsx tools/engine/seedlist.ts 2-5 --check` (2-9 has no list on this base). If a proven seed's play moves,
   STOP and send it to the lead.
5. tsc + generalitycheck; the CI tool line; the suite in 6 shards (`--test-shard=i/6`, the CLAUDE.md file list); drawcheck.
   Freeze per D115 with src/game/gen2/proven/ writable.
6. Stills (not yet shot): base vs fix, upright 390x844 and sideways 844x390, via a vite dev server per tree and `window.__play(stage, 1)`
   (tools/inspect/camFeel.mjs's way, PW=/opt/node-tools/node_modules/playwright/index.mjs), Pokey placed beside:
   - 2-9 layout 1: the decor turtle at x 10806 beside the snappers 10168-10543 (the quay by the pads);
   - 2-5 layout 1: the decor turtle at x 20151 between the snappers at 19373 and 22863.
   On the fix the same spot shows w2Frog (World 2's new sheet, dressNewData.ts; drawn by dressArt.ts through engine.ts's dress pass).
7. Land on t-eng-29 (merge, no force); send the lead the hash, each shard's totals and the stills.

## What changed (box 1)
- `src/game/artDress.ts`: `HAZARD_LOOKALIKE` (data: `w2Turtle -> family 'turtle', swap 'w2Frog'`; any world adds a row) and
  `clearLookalikes(ds, foes)`: a piece whose family is one of the stage's own enemy types becomes its swap (if the swap is not itself a
  lookalike there) or is left out. No stage id, seed or x.
- `src/game/protoStage.ts` addDress: the rolled sets AND the stage's own set dressing pass through `clearLookalikes` with the stage's
  enemy types. The swap is done before `placeDress`, so the frog (55 units wide, smaller than the turtle's 73) is placed by the same rule.
- `src/game/dressLookalike.test.ts`: the unit cases, the PLANT, and the invariant over every listed seed of every listed stage (and the
  other stages' 16 layouts) in every world whose DRESS_SETS can roll a lookalike, both settings.
- Probe (box 1, node): with the fix, 2-5 and 2-9 layouts 1-8 hold no w2Turtle; 2-6 and 2-8 (snakes, no snappers) keep theirs.
- tsc clean; generalitycheck PASS (26 literals, 26 known) after the code change.

## Candidates for the lead (not in the table: the brief's row only)
- `w2Frog` and `w1TreeFrog` show a frog; frogs are foes in Worlds 6 and 7 only today, so no World 1/2 stage breaches. A row each would
  guard a future frog there. `w7FrogIdol` and `w7JaguarHead` are stone carvings, not animals: left out.
