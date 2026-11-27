# ENG-ROOT REPORT (3-2's roof root; R-165.452; the 'lit = seen' seam R-165.529) — t-eng-root-wip, base t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 3, a fresh member; box 2 ended on the clock, tsc not yet read)
1. `git fetch origin t-eng-root-wip t-eng-w3 && git switch -c t-eng-root-wip FETCH_HEAD`; merge origin/t-eng-w3 if it moved (MERGE, never rebase).
2. ITEM 3 is IN rootBots.test.ts as a PROBE (`test('probe')` prints RUN lines; `probe2` traces one roll; flip skip with sed). Row and kit:
   src/game/gen2/toyRoot.ts (World 3's REAL kit, floor 2200, root 1600, ocelot t 0.5). Last run (8 rolls from 1,6..36 x both settings,
   `n16` = Normal from seed 16): GREEN 15/16 unseen (`e36`: 4 alert frames left, OPEN: trace it with probe2 ['easy', 36]); noRootWait
   (the plant) seen on n16 (44, hit 1) and n31 (134): RED; noRootWait + noLit (cast.step with lit false) seen on none: the light is the cause.
   Pace on the root 85 px/s on every roll. TURN THE PROBE INTO TESTS: (a) skill on: every roll took (hung on it), crossed, seen 0, hits 0;
   (b) noRootWait: seen > 0 on some roll (RED); (c) noRootWait + noLit: seen 0 where (b) was seen; (d) pace 85 +-2; plant `world: (s) =>
   ({ ...s, ropes: s.ropes.map((r) => ({ ...r, speed: undefined })) })` -> pace 120 (the creep-timing verdict reads it); (e) the root over a
   gap only: rootRow.test's 'floor under the root' (a `rope` place over a gap in toyRoot) -> RED. Drop 'took < 120 px' (n16 lands mid-root).
3. Items 5 (stills), 4 (gates), 5 (land) as the box-2 brief: stills say "art: World 1's painted vine rope (ropeArt.ts drawRopes, look 'root')".

## Done in box 2 (b37f9d66e + the wip commit after it)
- ITEM 4's refusal, by name: (1) the POOL, pipeline.ts poolFits:820 -> hangsNeed read the root's shape 'vine' as a CLIMB: now by place,
  a root asks 'rope' (World 3 lists 'rope', taught at 1-3; w3.ts moves). (2) a JUDGE, levelCheck.ts 3b 'rope #1 does not join two ledges':
  a rope over walkable floor its whole length (floorUnder: still pieces, no fragile) joins nothing new: no fault. (3) the ocelot: the toy's
  threat budget (2.4 at sho vs W3's ocelot 3): the row moved to ten/ketsu. rootRow.test 2/2; plants: floorUnder off -> red; hangsNeed by
  shape -> the no-climb kit's roll red.
- BOX-1 BUG: rootPlan sat after intend()'s hanging branch, so it never ran while hanging. Now: hanging -> rootPlan first, then along the
  root to its end. NEW (firsttimer.ts): rootTake (jumps up under a root whose floor a leaper's PATROL + sight reaches, from 10 px in to half
  its length); rootWatched (facing him: sight.ahead + speed.rest x his time in the light; facing away: sight.behind, or its turn at its
  patrol end); the end hold (ROOT_END 40 px before the end, the floor below watched -> hold; the engine lets go at the end itself).
- KIT-W3b spec ADD: the root must START and END outside the ocelot's watch of the floor (patrol ~400 px + sight 240): on the dark floor it
  sees him at its own height lit or not; only on the root (over sight.up 40) does the dark hide him.

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
