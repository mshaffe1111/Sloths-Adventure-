# Engine audit B: level generation (gen2), 2026-11-11

Auditor: Adversarial Critic, area B. Base: `t-int-1-1@fa5ad9d1` (86 commits ahead of `origin/main@181d2846`). Branch: `t-audit-engine-b`.
Scope as narrowed by the lead at 5:00 PM ET: gen2 only (`src/game/gen2/`, the reach and verdict rules it lays by, the help ladder's
placement in gen2 stages). The old generators get one line (§5). No game code was changed.

How to read a row: **CONFIRMED** = proved by a failing test on this branch or a run whose command and output are given; **SUSPECT** =
reasoned from quoted lines, not proved. Every test is in `src/game/gen2/audit-b/` (outside the suite's globs, so CI stays as it was) and
fails on purpose. Run one: `npx tsx --test src/game/gen2/audit-b/<file>`. The probes that made the numbers: `audit-b/probes/`.

## Summary

| # | Sev | State | What | Where | Fix size | Replaced soon? |
|---|---|---|---|---|---|---|
| B-01 | HIGH | CONFIRMED | At the double's teach wall a player who never falls gets no help at all: the new ladder counts put-backs only, and it mutes both older helpers | engine.ts:4594, :5062; DotGuide.tsx:1279; w1.ts:149-156 | S-M | No (cross-area A/C) |
| B-02 | HIGH | CONFIRMED | gen2 1-1 cannot lay a stage that keeps its own rules: 0 of 60 fresh seeds clean (2 of 120); the 200 listed seeds span 769..61616. The list is made by throwing 99% away | pipeline.ts layStage / rolledGraph; seedlist.ts:107 | L | No. R-165.112 changes how the list is stored, not this |
| B-03 | HIGH | CONFIRMED, live on main | 13 of 16 shipped rolls of 8-5 and 2 of 16 of 8-6 (Normal) no longer build the stage that was curated; the guard samples 2 rolls a stage | seeds.test.ts:27; seeds.ts:1-5 | S (gate) + M (re-curate) | No |
| B-04 | MED | CONFIRMED | About 13 "hop" rocks a 1-1 stage are under the engine's 50 px wall: a plain walk goes straight through the painted rock | w1.ts:201, :244, :271, :278; pipeline.ts:962, :1619; engine.ts:2327 | S + list rebuild | No |
| B-05 | MED | CONFIRMED | A hop piece (`on`) is never judged: it pushes no ask and is clamped by the DOUBLE's rise. Easy lays 76-80 px stumps over its 63 px band in the first lesson on all 200 seeds | pipeline.ts:962, :861-887, :1542 | S-M | Partly (kit step 3 rewires verdicts) |
| B-06 | MED | CONFIRMED | 19 of 1-1's 73 sections are in no listed plan (12 were laid 0 times in 120 fresh rolls); 22 more W1 sections belong to no stage gen2 builds | w1.ts W1_SECTIONS, `window`, `deal`, `maxPerStage` | M | No |
| B-07 | LOW | CONFIRMED | Two rulers on 1-1 for "can he make this jump": `jumpOK(arcs)` is a box (climb and gap judged apart), `validateStage` is closed form OR arcs | levelCheck.ts:121-126, :141-142, :595 | S | Partly (kit step 3) |
| B-08 | LOW | CONFIRMED (quoted) | Mirroring turns a drop into a rise without re-sizing its gap; five per-section `mirrorable = false` patches stand in for the rule | w1.ts:1393-1400; pipeline.ts:991-996, :1450 | S | No |
| B-09 | LOW | CONFIRMED (quoted) | World-keyed patches in shared pipeline code (`world === 9`, `world !== 8`, `world === 1`); the World 9 branch serves a world gen2 does not build | pipeline.ts:1220, :2202, :2472, :2474, :2724, :2728-2729 | S | Wait: kit step 3-4 |
| B-10 | LOW | CONFIRMED (quoted) | The boundary is said two ways: `judgedOnArcs` = 1-1 only, `scopeOf` = "Easy on any stage"; `askVerdicts` hard-codes `'1-1'` | reach.ts:83, :86-89; verdicts.ts:87, :165 | S | Wait for replacement (kit step 3) |
| B-11 | LOW | CONFIRMED (grep) | reach.ts cites `reference/specs/reach.md` and `bands.md` row by row; neither file is on this branch | reach.ts:2-4; `ls reference/specs` | S | No |
| B-12 | LOW | CONFIRMED (grep) | The fixed first run (ADR-002) is half built: the layout, its lock and its CI check exist; no play path ever picks it | firstRun11.ts:9; verdicts.types.ts:137-155; testlink1_1.ts drawNext | S once Matt rules R-165.52 | Waiting on R-165.52 |
| B-13 | LOW | SUSPECT | `buildRolled` can return null: `best` is set only when a check fails, and a roll can run out its 24 loops without one | pipeline.ts:2810, :2899, :2981-2984 | S | No |
| B-14 | LOW | SUSPECT | Easy can hold a hazard prop Normal could not afford: an animal Normal's spacing dropped is never charged to Easy's section threat | pipeline.ts:2084-2091, :2075-2077 | S | No |

Counts: HIGH 3, MED 3, LOW 8. CONFIRMED 12, SUSPECT 2.

What I checked and found sound is in §3: it is as much use to a later session as the defects.

---

## 1. Findings

### B-01 HIGH, CONFIRMED: no help at the double's teach wall (two fixes fight)
- **Where.** `engine.ts:5062` (`help.putBack(x)`, called only from the soft fall) is the ladder's one input. `engine.ts:4594`:
  `this.stuck.tick(...) && !this.help` mutes the old stuck watch while the ladder exists. `DotGuide.tsx:1279`:
  `helpLadderOn() ? null : run.struggle.step(...)` mutes Dot's struggle line. `w1.ts:149-156` (`riseFace`) lays the double's lesson as a
  128-140 px face with 260-300 px of flat floor before it, "the help's room".
- **What is wrong.** C1 made the rise form THE double lesson on both settings (bands.md §3). A miss there is a jump against a wall on
  solid ground: no fall, no put-back, so no rung ever fires (line at 3, full pad jump at 5, step at 8, offer at 12 all count put-backs).
  The old "Too tall for one jump!" watch reaches its line and is muted by the ladder.
- **Scenario.** 1-1, the first-run layout (seed 4106), `w1-dip-double-teach`, Easy (132 px wall) and Normal (139 px): 15 single jumps
  at the wall, 0 put-backs, no help event, no line; `stuck.told = true`, muted. This is the testers' "stands stuck 20 s at the step"
  (STATE.md, carried) made permanent on the branch that is about to ship.
- **Proof.** `help-stuck-at-wall.test.ts`: fails on both settings with exactly that line.
- **Root fix.** A failed try at a face counts on the ladder the same as a put-back (or the old watch speaks wherever the ladder cannot
  count). S for the count, M with Dot's line and the sweep. Cross-area: the runtime is A's, Dot's queue is C's; flagged here once.

### B-02 HIGH, CONFIRMED: 1-1's builder cannot keep its own rules; the list is what survives the cull
- **Where.** `pipeline.ts` `rolledGraph` / `dealContent` / `layStage` choose with no look-ahead; V19b, the pool and the verdicts are
  judged after the lay (`applyVerdicts`, `rollErrors`). `tools/engine/seedlist.ts:107` scans `want * 200` seeds.
- **What is wrong.** The file's header says "beatable by construction". By measurement about 1 fresh seed in 60 is clean on both
  settings, and 1 in 300 makes the list. This is Matt's 10-30 rule inverted ("more pieces... never by rerolling the same pieces until
  a stage scrapes past"): the 200 listed layouts are the ones that scraped past.
- **Scenario.** Seeds 50001-50120, both settings: 2 clean. Of the 118 refused, by first error: 36 x V19b (the end log is not above
  where the bough window begins); 66 x "pool short" (53 with no bounce, climb or signature section left for a node under
  `maxPerStage: 1` and the deal, 13 with the late rise ending short of V19); 10 x verdicts (`drop.untyped` 5, `floor.unmarked` 3,
  `teach.double-no-gap-after` 2); 6 others.
- **Proof.** `w1-yield.test.ts` (0 of 60 clean; the floor it asks is only 1 in 5). `probes/yield.ts 120` for the table. The list
  itself: 200 seeds, min 769, max 61616 (`provenSeeds.ts`).
- **Why it matters next.** The stage kit (ADR-003) plans to mass-produce stages on this builder. Every new rule multiplies the cull,
  and a kit or engine change that stales the list costs tens of thousands of builds to refill. Sections that correlate with refusal:
  `w1-stair-test-back` (laid 33 times in 120 rolls) and `w1-bank-stair-test-back` (38) are in no listed plan at all.
- **Root fix.** Make the two big rules constructive: (a) V19b in `layStage` as a hard filter on the last third's exits (it already
  tracks `windowY` and `riseTo`: pipeline.ts:1310-1323, but only for the node after a late descent or the signature, then loosens);
  (b) deal the node types against what the pool can still fill before choosing (the deal knows the counts, the bag does not). L.
  R-165.112 (seed chunks) is in flight on the list's storage: note only, not duplicated here.

### B-03 HIGH, CONFIRMED, live on main: shipped curated rolls are no longer the curated stages
- **Where.** `seeds.test.ts:27`: `const idx = k === 0 ? e.seeds.map((_, i) => i) : [...new Set([0, n - 1])]` ("so the suite stays
  quick"). `seeds.ts:1-5` promises "the seed builds the same stage that was checked. seeds.test.ts guards it."
- **What is wrong.** The guard holds the first stage's 16 rolls and rolls 0 and 15 of every other stage. An engine change after
  curation moved rolls in between and nothing failed.
- **Scenario.** 8-5 Normal, roll 1 (seed 881931): slot 22 plays `w8s-swing-drop-climb` where `w8b-trunk-pair` was curated. Rolls 1, 4,
  5, 11, 12 changed sections; 8 more build the same sections with a different clock (geometry or animals moved). 8-6 Normal: rolls 1
  and 3 changed sections. Those stages were never measured by curation (look-alike, bots, quiet line, bands). They do still pass
  the level check and Easy's hold check (§3), so this is unmeasured quality, not an unbeatable stage.
- **Proof.** `worlds-curated-drift.test.ts` (the guard's own assertion on all 16 rolls): 13 of 16 and 2 of 16 fail. The same file
  run in a worktree of `origin/main@181d2846`: the same two failures, so it is in the live game.
- **Root fix.** Hold every shipped roll to its curated record in a gate outside the quick suite (about 3 minutes a world), with a known
  list that only shrinks (LAWS 5), then re-curate 8-5 and 8-6 or bisect the change that moved them. S + M.

### B-04 MED, CONFIRMED: hop rocks under 50 px are walked through
- **Where.** `engine.ts:2327`: `if (plat.broken || plat.type !== 'solid' || plat.height < 50) continue;` (the side-wall pass).
  `w1.ts:190-191` raised `gLowStumps` to 50 px for exactly this ("a 36-42 px stump was walked through"). Not spread to `gLogHop`
  (`w1.ts:201`, 34-46 px), `gShelf`'s rock (`:244`), `gHighLeaps`' low stumps (`:271`, 34-40), `gBounceWall`'s rock (`:278`), or the
  forks' `'h'` rocks. `pipeline.ts:1619` counts every `on` piece as an `'h'` beat.
- **Scenario.** Any listed seed. Seed 769 Normal, the rock at x 3106 (36 px): hold right, he passes it with his feet 0 px off the
  floor. Over the 200 listed seeds: 2,578 hop pieces under 50 px, 12.9 a stage, 27% of all `'h'` beats.
- **Proof.** `w1-hops.test.ts`, test "B-04": 38 of 109 rocks on the first 3 listed seeds are walked through in the real engine
  (`probes/rocks.ts` on 6 seeds, both settings: 149 of 157 rocks under 50 px, against 1 of 229 at 50 px or more). `probes/onhops.ts`
  for the totals.
- **Why it matters.** He clips through painted rock in the first stage (polish bar 3), the hop the section was written for is not
  there (STAGE-RULES §0.2: "anything the player can ignore is decoration, not a beat"), and its petal hangs over a rock nobody jumps.
- **Root fix.** One rule, not five edits: an `on` piece that is an obstacle is laid 50 px or taller (`pipeline.ts:962`, a floor on
  `h`), or the engine walls a block from a lower height. Then rebuild the list. S + the rebuild. Yokoten: Worlds 5-8 `on` pieces.

### B-05 MED, CONFIRMED: hop pieces are never judged
- **Where.** `pipeline.ts:962`: `h = Math.min(roll(rng, pl.h), riseCap(dblOK, 0.95, budget))`: on 1-1 `dblOK` is true, so the clamp
  is the double teach's 140 / 132 px, not the single band. Asks are pushed for `jump` / `double` / `pit` (`:887`), a bounce lip (`:861`)
  and a seam with a gap (`:1542`) only. A `step` join (dx 0) and a `walk` rise push none either (both are clamped to the single band,
  so those hold).
- **Scenario.** Easy, seed 769, `w1-learn/bs1` at x 2431: a 79 px stump in the stage's first lesson; Easy's single-rise band tops out
  at 63 px (bands.md §2). All 200 listed seeds lay one or more on Easy (1,095 pieces); 156 seeds on Normal (363 pieces over 80 px,
  up to 149 px on fork and perch roads). Flown: a Pad tap clears a 63 px stump from 100% of take-off spots and an 80 px one from 82%.
- **Proof.** `w1-hops.test.ts`, the two "B-05" tests (Easy 200 of 200 seeds, Normal 156 of 200). `probes/stump.ts` for the tap shares.
- **Root fix.** Clamp `on` by the single rise unless the piece is a declared block, and push an ask for every `on` obstacle so
  `band.out` and `arc.single-rise-over` see it. S-M. Kit step 3 rewires the verdicts: fold it in there.

### B-06 MED, CONFIRMED: sections that never ship
- **What.** `W1_SECTIONS` holds 95. 73 serve 1-1; 54 appear in a listed plan. The 19 that never do: w1-second-jump (the double's
  "first test"), w1-stump-stile, w1-log-road, w1-bough-stepup, w1-dropdown-stair, w1-knot-bank, w1-floor-dash, w1-stump-towers,
  w1-canopy-weave, w1-canopy-weave-rise, w1-stilt-logs, w1-bough-log, w1-dipping-boughs-twist, w1-drop-bounce-twist,
  w1-dip-bounce-twist, w1-bounce-bough-combine, w1-stair-test-back, w1-bank-stair-test-back, w1-two-lifts. In 120 fresh rolls 12 of
  them were laid 0 times (their window, type and job leave them no node); the two `-back` tests were laid 33 and 38 times and every
  such roll was refused. 22 more are parked or tagged for 1-3 / 1-5, which gen2 does not build.
- **Proof.** The one-liner in §4; `probes/yield.ts`. STAGE-RULES §6: "a section that never ships is a bug". Bundle headroom is 31 KB.
- **Root fix.** A test: every section with `feel: ['1-1']` is in some listed plan, with a known list that only shrinks; fix or park
  each. M.

### B-07 LOW, CONFIRMED: two rulers for one jump
`levelCheck.ts:141`: "given the flown arcs, they alone decide, never the closed form". `:595`: `(r >= 0 && gap <= r * MARGIN -
TAKEOFF_SLACK) || (opts.arcs && ... dy <= 20 && gap <= arcGap(...))`. `arcGap` (`:121-126`) credits any landing a move climbs with
that move's level gap. Proof: `arcs-box.test.ts`: a thin top 117 px up, 143 px across: `jumpOK(arcs)` says yes; flown, the widest gap a
flick lands at that rise is 116 px. Askers of the box: the stone repair (`pipeline.ts:2645`), the double-teach promise
(`promises11.ts:68`), `blockBreaches`' flown branch (`:2566`). Today `validateStage` re-checks the stone, so nothing ships wrong; it
is a trap for kit step 3. Fix: one function, with the raised-landing figures flown (the Designer's `flight.ts dist` takes a rise). S.

### B-08 LOW, CONFIRMED by quoted lines: mirror patches in place of the rule
`w1.ts:1393-1400`: five `mirrorable = false` lines, each with its symptom ("mirrored, their mid road's step down off the bough was
judged a rise past the band"; "its last stone's drop to the floor (up to 110 px) was judged a rise past the single band"; "a 227 px
rise"; "262 px over the floor"). Cause: `pipeline.ts:991-996` flips a laid section and swaps each ask's take-off and landing, but the
gap was sized for the un-mirrored direction (`gapFor(-dy)`, `:870`). `:1450` already refuses blocks, climbs and non-level exits. The
next section with an inner drop over the band fails rolls the same way until someone adds a sixth line. I measured the shipped rolls
of Worlds 5-8 (728 of the 736 roll x setting builds; 8 World 8 builds my re-lay did not reproduce and were skipped; 2,934 mirrored
jumps): none is past the builder's envelope, so this costs yield, not fairness. Fix: refuse
the flip in `:1450` when any inner non-seam jump's drop exceeds the single-rise band (or re-size after the flip); delete the five. S.

### B-09 LOW, CONFIRMED by quoted lines: world-keyed patches in the shared pipeline
`:1220` and `:2474` `budget.world === 9` (gen2 builds no World 9 stage: GEN2_STAGES is 5-7, 5-9, Worlds 6-8, plus 1-1); `:2202`,
`:2472`, `:2724` `world !== 8` (no water under World 8); `:2728-2729` `world === 1`. Each should be a manifest field (`fillBanks`,
`voidLook`, `floorlessLook`). Kit steps 3-4 rewrite these paths: **wait for replacement** (D40), but carry the list into that packet.

### B-10 to B-12 LOW (see the table)
- **B-10.** `reach.ts:83` `judgedOnArcs = stageId === '1-1'`; `:86-89` `scopeOf` returns `'easy-any'` for any stage on Easy;
  `verdicts.ts:165` trusts `scopeOf`, `:87` hard-codes `scopeOf('1-1', setting)`. Safe only because `applyVerdicts`
  (`pipeline.ts:2753`) asks `judgedOnArcs` first. Wait for kit step 3, which replaces `stageId === '1-1'` with the brief.
- **B-11.** `reach.ts` rows cite reach.md and bands.md "so the Critic can diff this file against the specs"; both live only on
  `t-designer-reach@e97542b4`. Merge the spec with the data, or the source lines point at nothing on main.
- **B-12.** `FIRST_RUN_11` (seed 4106) is read by `verdicts.test.ts` and `tools/engine/seedlist.ts` only. `RunPick` and
  `FirstRunSave` have no implementation; a first-ever run draws from the shuffled list like any other. Either wire it or drop the
  lock until Matt rules R-165.52 (LAWS 7).

### B-13, B-14 LOW, SUSPECT
- **B-13.** `pipeline.ts:2899` `if (!best) best = st;` sits inside `if (!v.ok)`. A roll whose 24 loops all end in `grow(...)`
  (short or thin, never a failed check) falls to `:2981` with `lastMeeting` null, and after the last re-roll `:2984` `return best!`
  hands back null; `applyVerdicts` then throws a TypeError. `provenGen2Stage` catches a throw; `seedListBreaches` does not. Not
  reproduced (it needs a kit that stays short through 24 added sections).
- **B-14.** `pipeline.ts:2084-2088`: on Easy a creature socket whose animal Normal's spacing dropped `continue`s before
  `threat -= c.threat` (`:2091`), so a later threat prop in the same section (`:2075-2077`) can be paid on Easy where Normal had
  nothing left. Easy would then hold a hazard Normal lacks. Not reproduced; needs a section with an enemy socket before a threat prop.

---

## 2. What blocks laying stages in other directions (ADR-003 kit step 4), by line

- `pipeline.ts:375`, `:524`: every graph returns `flow: 'right'`; `:354` throws for an ascent.
- `layStage`: the route only ever advances in x (`:1483` `ox = cur.x + dx`); the runway is laid at x 0 (`:1236`), the shrine after the
  last section (`:1674`); the corridor is a y band only (`:1316`, `:1482`).
- Near and far are x-ordered throughout: `pitSteps` / `backPit` (`:1760-1796`), `catchUnder` (`:1204`), the mirror flip (`:991`),
  flags sorted by x (`:1898-2002`), `OPEN_SECONDS` as an x (`:2006`), `blockBreaches` `from.x >= to.x` (`:2561`).
- `promises11.ts:61-67`: the double gap is searched along platforms sorted by x from the teach's x0.
- `stageMetrics.ts:47-76` `jumpEdges` returns `dir: 1` only; the pipeline's `jumpClearance` rests on it.
- `helpLadder.ts:411-430` `stepPlan`: joins are `a.x1 -> b.x0`, a stair is built leftwards from the lip at the left foot of a rise.

## 3. Checked and sound (numbers, so nobody re-derives them)

- **The flown reach holds on every listed 1-1 layout.** All 9,374 single-jump asks of the 200 listed seeds on both settings, flown
  in the real engine: every one lands with a flick from the band's take-off spot or further back (55 px Normal, 70 px Easy). 0 under.
  (`probes/asks.ts 200`; the tool reproduces reach.md §2 exactly: 128 / 143 / 198 px Normal, 132 Easy, climbs 123 / 117.)
- **The builder's envelope for a raised landing** (closed form x margin, capped by the band) is within 9 px of the flown rule at its
  worst corner (Normal, a 143 px gap rising 10-20 px: a 46 px take-off window against the rule's 55). No listed seed lays that corner.
- **The stage the game plays passes the level check.** 400 builds through `generateStage` (the full path with hearts, trails, finds
  and the petal pass): 0 throw, 0 fall back to another seed, 0 fail `validateAsJudged`. Slowest build 390 ms.
- **Easy against Normal.** On 4,453 jumps present on both settings, Easy's gap is never wider and its flick window never smaller.
  Easy's section plan equals Normal's on all 200 listed seeds and on all 368 shipped rolls of Worlds 5-8. No generator code reads
  the screen's orientation. Each slot, join and socket rolls from its own stream (`rngFor(seed, 11 | 13 | 17, i, ...)`).
- **Shipped Worlds 5-8** (736 roll x setting builds, the stopped sub-auditor's run, re-summarised by me): 0 throw, 0 silent seed
  walk by `provenGen2Stage`, 0 level-check errors, 0 hold-check errors on Easy, 0 under the 120 s floor.
- **The seed list's own check** (`tools/engine/seedlist.ts 1-1 --check`): PASS, 200 seeds, replay equals search.
- **The repair loop's string protocol** (`checkAndRepair` matches levelCheck's messages by regex): every regex still matches.

## 4. Commands behind the numbers
- B-01: `npx tsx --test src/game/gen2/audit-b/help-stuck-at-wall.test.ts`
- B-02: `npx tsx --test src/game/gen2/audit-b/w1-yield.test.ts`; `npx tsx src/game/gen2/audit-b/probes/yield.ts 120`
- B-03: `npx tsx --test src/game/gen2/audit-b/worlds-curated-drift.test.ts` (about 3 minutes)
- B-04, B-05: `npx tsx --test src/game/gen2/audit-b/w1-hops.test.ts`; `npx tsx src/game/gen2/audit-b/probes/onhops.ts`
- B-06: compare `W1_SECTIONS` (feel includes '1-1') with `PROVEN_SEEDS['1-1'].dict` entries that hold no `=`.
- B-07: `npx tsx --test src/game/gen2/audit-b/arcs-box.test.ts`
- §3: `probes/asks.ts 200`, `probes/fullpath.ts`, `probes/mirror.ts 5-` (6-, 7-, 8-), `probes/envelope.ts`.

## 5. The old generators, one line (out of scope by the lead's ruling)
Of 103 levels: gen2 builds 24 (1-1 from the proven list; 5-7, 5-9 and Worlds 6-8's 21 from seeds.ts); protoStage 34 (1-2..1-9,
Worlds 3-4, 5-1..5-5, 6-8, 7-4, 8-4); w2Stages 9; the old stageGenerator 34 (5-6, 5-8, 7-2, 7-8, 8-7, Worlds 9-10, every lair and
the secret); Dot's flight and Meeca's stage 1 each. gen2 replacing Worlds 1-5 is held until after launch (R-142).

## 6. Limits of this audit
- Three sub-auditors were stopped part-way when the scope was narrowed. Used from them: the B-01 test (re-run by me), the 736-build
  table behind B-03 (re-proved by my own test, on this branch and on main) and the builder table in §5 (re-run by me). Nothing else
  of theirs is in this report.
- Not audited: `graphs.ts`, `nodeCode.ts`, `variety.ts` line by line; the Worlds 5-8 kit files beyond the runs above; the help ladder's
  step geometry beyond a read of `stepPlan` (no defect found in the read). B-14 and B-13 are not reproduced.
