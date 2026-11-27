# ENG-ROOT REPORT (3-2's roof root; R-165.452; the 'lit = seen' seam R-165.529) — t-eng-root-wip, base t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 2, a fresh member)
1. `git fetch origin t-eng-root-wip t-eng-w3 && git switch -c t-eng-root-wip FETCH_HEAD` (the wip head); merge origin/t-eng-w3 if it moved
   (ENG-ASKS-b, ENG-CATCH land there today: MERGE, never rebase).
2. ITEM 3 is WRITTEN, NOT YET TESTED: tools/inspect/firsttimer.ts `rootPlan` (wired before `freezePlan`; ROOT_LOOK 30 px): hanging on a
   look 'root' rope, a lit ring (litRing) within 30 px ahead that a leaper of the cast has in its sight by its facing -> thumb off in the
   dark until clear, then stopReact, then creep on; already lit -> creep on. Its test is item 4's toy (and its plant: rootPlan -> null).
3. ITEM 4: the DRAFT toy is reference/qa-reports/ENG-ROOT/wip/rootRow.test.ts.txt (move it to src/game/gen2/rootRow.test.ts; drop
   its ROOT_PROBE / ROOT_NOROOT / ROOT_NODARK debug lines when done). It follows src/game/gen2/noiseRow.test.ts (toyWorld kit, World 3,
   buildGen2Stage, withTestStage + RealPlay). OPEN BUG FIRST: no roll picks its 'toy-root-row' section (plan = meadows only, errors []);
   ROOT_NOROOT=1 (root piece removed) lays it with the ocelot, ROOT_NODARK=1 does not: the ROOT PIECE stops the section after layLocal
   (layLocal itself lays it: rootLay.test). Suspects: layStage's piece loop / a section check that reads every piece (its w, shape
   'vine', main false), or the stage time estimate. Fix in the pipeline, then: the bot creeps it unseen (firstTimer on the toy id);
   PLANTS (each RED): rootPlan -> null -> leapt at; the root as a `rope` place over a gap -> red; `speed` unset (120) -> the
   creep-timing verdict reads it.
4. ITEM 5 stills (tools/art/kitaudit/shoot.mjs, both ways): Pokey on the root over a prowler with a patch lit; label: "art: World 1's
   painted vine rope (ropeArt.ts drawRopes, look 'root' branch: vineTile, no trees, no posts) until ART-W3's root lands".
5. GATES once on the frozen candidate (D115, src/game/gen2/proven/ writable): tsc; CI tool line; base lock on 13135bf6b then
   `lockall --check` (102 stages, counts, NO listed stage moves); the suite in 6 shards; tierBots 9/9; generalitycheck. Land: merge onto
   origin/t-eng-w3 (no force); the lead gets the hash, each shard's totals, the stills, what 3-2's build can measure.

## Done so far (box 1)
| Item | Commit | Evidence |
|---|---|---|
| 1 Rope.speed (unset = ROPE_SPEED 120; ROOT_SPEED 85, Matt's B) | 27046889 | src/game/rootCreep.test.ts: root 85.0 px/s, unset 120.0, paw cycle per px equal; PLANT engine on 120 -> red ('the root creeps 120.0 px/s') |
| 'lit = seen' seam (R-165.529; the lead's ruling, accepted) | 4cfbde686, ea03d15ad | Prey.lit (the ONE field; ENG-LIGHT's carried light feeds it), zones.ts litRing (fixed / woken / clock window), upOf(def, hero); engine stepCast fills it; litSeen.test: dark at 94 px unseen, lit seen, both settings; PLANT upOf ignoring lit -> 2 red |
| 2 gen2 place `root` | 6b049f2c1 | gen2/types.ts place 'root' (on, at, len, up {normal 190, easy 170}, patches {at, r {90, 60}, normalOnly}); pipeline lays it as a Rope (look 'root', speed ROOT_SPEED, required false, no posts), never main or a landing, patches flip with a mirrored section and a left leg; dark.ts rootPatches: fixed lights (own glow ids) in the dark zone over them, a patch under no dark zone throws by name. rootLay.test 2/2 |

Readers switched: engine.ts creep, stageTime.ts (both), tools/inspect/route.ts (the rope over the span), predators/core.ts leap-escape
check held to min(ROPE_SPEED, ROOT_SPEED) (Easy tell 0.65 s x 85 = 55 px >= clear 36: passes). NOT switched (D40, the hand build 3-2's
new build replaces): w3Sections.ts:238, protoStage.ts:4753 (their ropes have no speed, so ROPE_SPEED is their number). Draw: ropeArt.ts
look 'root' = World 1's vine tile, no trees, no posts; sheetWarm warms it.

## KIT-W3b: what the brick needs (rule 26: the piece is the engine's, its placement the kit's)
KIND `root` (gen2/types.ts): `{ kind: 'root', on: <the floor piece>, at, len, up: { normal: 190, easy: 170 }, patches: [{ at, r: { normal:
90, easy: 60 }, normalOnly? }] }`, piece shape 'vine', w [0, 0] (the length is `len`). The floor piece under it must be WALKABLE its whole
length (the root is clamped to it). Patches only inside the node's `#dark` stretch (else the roll fails by name). T: no patches, a soft
dip under (3-2.md beat 1); W: the root IS the hiding place (no cover brick), ends over the ocelot's stretch; S: the longest root, patches.

## Gates: NOT YET RUN (box 2's step 5). Pushback: 'lit = seen' was missing (sent; accepted). Lessons applied: D134, D138, D140, D148, D40.
