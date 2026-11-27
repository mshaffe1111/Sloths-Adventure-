# ENG-ASKS: a node code can ask any registered hazard and named clock (R-165.501; AUDIT-W3 finding 1)

## EXACT NEXT STEP (closed, 10:13 PM ET Thu 11-26 by `date`)
ENG-ASKS is DONE: the lead lands the registry through ENG-SPORE-c's frozen d653d3994, which contains the merge 11e2af1a0 and is green on
every gate (the lead's report). There is no next step here. ENG-ASKS-b adds World 3's rows (#dark, #spore, @puff) on the new t-eng-w3.
GATE RECORD (frozen trees in the scratchpad; each heavy run once):
- 11e2af1a0 (9244283f3 + ENG-DARK's a8bc662e5, no conflicts): tsc 0; generalitycheck 0; lockall --check vs a8bc662e5's own lock
  (3264 builds of 102 stages) = 102/102 stages unchanged, exit 0; shards 1-6 = 791 / 572 / 724 / 616 / 629 / 798 pass, 0 fail each; the
  CI tool line (gates.yml:157) 354 pass, 0 fail; tierBots NOT finished (stopped on the lead's word: d653d3994's tierBots 9/9 covers it).
- 9244283f3 (the registry on 88592a9c4): tsc 0; generality 0; lockall --check vs 88592a9c4's lock = 102/102 unchanged, exit 0; shards 1-4
  = 757 / 625 / 580 / 786 pass, 0 fail; shards 5-6, the tool line and tierBots stopped once the merge became the landing.
- Toy hazardAsks.test.ts GREEN 5/5; planted on t-eng-w3's engine files RED 0/5. nodeAsks.test 7/7.

## Box 1's hand-over step (8:40 PM ET Thu 11-26 by `date`, superseded)
STATE at hand-over: base lock RECORDED (3264 builds of 102 stages, `<scratchpad>/lock-base.json`); the candidate's `lockall --check` against
it RUNNING in `<scratchpad>/cand` (log `<scratchpad>/lock-check.log`, last line `lockcheck=<code>`); gates.sh RUNNING: tsc=0,
generality=0, shard1 757 pass 0 fail, shards 2-6, tool line and tierBots to come (`<scratchpad>/g1/summary.txt`). t-eng-w3 is still
88592a9c4 (ENG-DARK-z not landed). NEXT: read both logs; all green -> step 3 below; any red -> name it, fix on t-eng-asks, a new candidate.
(the steps as written in box 1:)
DONE box 1: the toy test `src/game/gen2/hazardAsks.test.ts` GREEN 5/5 on 9244283f3; PLANTED: the same test on t-eng-w3's three engine
files (`git checkout origin/t-eng-w3 -- nodeAsks.ts pipeline.ts types.ts`, then restored from HEAD) RED 0/5. nodeAsks.test 7/7.
RUNNING (background, frozen worktrees in the scratchpad, never the working tree, D115):
1. `<scratchpad>/base` = origin/t-eng-w3 88592a9c4 records `<scratchpad>/lock-base.json` (lock-base.log). When it ends, in
   `<scratchpad>/cand` (= 9244283f3): `npx tsx tools/engine/lockall.ts --layouts 16 --check <scratchpad>/lock-base.json` (no stage may move).
2. `<scratchpad>/gates.sh <scratchpad>/cand <scratchpad>/g1 <scratchpad>/toolline.sh`: tsc=0 and generality=0 already; then shards 1-6,
   the CI tool line (gates.yml:157), tierBots, each line in `<scratchpad>/g1/summary.txt`.
If the scratchpad is lost: re-make both worktrees (`git worktree add --detach <dir> <hash>`, symlink node_modules) and re-run 1 and 2.
3. All green: merge into t-eng-w3 (no force), push, `git ls-remote`, send the lead the hash and each shard's totals.
4. When ENG-DARK-z's 93e05e98d (or its landing) is on origin/t-eng-w3: merge it, add World 3's row to w3.ts manifest
   (`hazards: [{ id: 'dark', zone: 'dark', props: ['darkFrom'] }]`), and a toy roll of '#dark' on World 3's kit.
5. (after 4) Gates once on that candidate: tsc; CI tool line; lockall --check; the suite in 6 shards; tierBots; generalitycheck. Land on t-eng-w3
   (no force); hash + each shard's totals to the lead.

## What is built (box 1)
- `nodeAsks.ts`: `HazardDef` / `HazardLay` (the registry row: id, the built stage's zone kind, the bricks that lay it by section zone kind
  or prop, its named clocks), `hazardRegistry` (the four falls always, then the world's rows; a fall's row adds only clocks),
  `sectionLays`, `hazardNeeds` (refusals by name: '#x is not a registered hazard in this world', '@c is not a clock #x runs on in this
  world', '#x names no zone it is laid as'), `hazardMiss` (pool check 'no section in the pool lays #x' / '@c'; then the fall, then each
  zone over the span, by name). The four falls with no clock read exactly as before.
- `types.ts`: `WorldManifest.hazards?` (world data fills it).
- `pipeline.ts`: the deal (dealContent askServes) types a node asking a registered hazard by the sections that lay it; the section draw
  (askParts) keeps only sections that lay it; dialMisses reads the registry, st.zones and the pool. A node with no such ask draws the
  same stream as before (askServes returns true; askParts pushes nothing).
- `nodeAsks.test.ts`: the two "Later" lines become the by-name refusals; unit lines for every refusal and lay.
- `NODE-KEY.html` regenerated (tools/engine/nodekey.ts) for the two new ELEMENTS rows.
