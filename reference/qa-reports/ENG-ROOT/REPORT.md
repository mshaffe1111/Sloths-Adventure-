# ENG-ROOT REPORT (3-2's roof root; R-165.452; the 'lit = seen' seam R-165.529) — t-eng-root-wip, base t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 4 ENG-ROOT-d; head on t-eng-root-wip = the commit carrying this; FROZEN CANDIDATE a619ea16a, code unchanged after it)
1. GATES running on frozen a619ea16a (scratchpad worktree, src/tools read-only, gen2/proven writable): the 6 suite shards; the LOCK BASE
   `lockall --layouts 16 --out base.json` on t-eng-w3 f79963053. Then, in order: `--layouts 16 --check base.json` on a619ea16a (counts
   line; no listed stage moves, every shipped rope 120); tierBots 9/9; the CI tool line on a619ea16a. DONE on it: tsc 0, generality PASS.
   A fresh member re-runs any gate whose result is not recorded below: it runs ONCE, on a619ea16a (or the head, if only this file moved).
2. LAND: `git fetch origin t-eng-w3`; if it has not moved past f79963053 the merge is a fast-forward; else merge it into the branch (never
   rebase), tsc + `lockall --check` on the merge; push HEAD:t-eng-w3 (no force), ls-remote. Send the lead the hash, the shard totals,
   what 3-2's build can measure and the brick spec (KIT-W3b section below; the watch rule is box 3's).

## Done in box 4 (ENG-ROOT-d)
- MERGE: t-eng-w3 f79963053 was already in the branch (box 3's 65ad413f9); nothing new. tsc 0; CI tool line 355 tests, 354 pass, 0 fail
  (1 todo: the known chase-bot CHILD todo).
- ITEM 2, THE STILLS (dc54e89cf; reference/qa-reports/ENG-ROOT/stills/, 8 jpgs, sent to the lead): tools/engine/rootshoot.mjs <out> <slot>
  + tools/engine/rootBoot.ts, committed, test-only, no shipped path: the boot lists the toy row under a LENT slot id given on the command
  line (3-1 used) and the row's WORLD FINISH hands the page the toy's own roll. Why not a plain replay under the slot: D62 caught it, a
  plan replay is laid by the stage's place in its world (miniIndex 1: root 520 px off and NO ocelot: a world's first stage lays none);
  a STAGE_PLAN[3][96] entry would make the world's list sparse. Every page printed LAID = BUILT (Normal root 14463..16063, ocelot
  patrol 14759..15767; Easy 14369..15969, 14665..15673; speed 85). The slot's own Dot hint card is tapped away before each shot.
  Polish: ocelot readable in all 8, the ring reads in the dark stills; ROUGH: the art is World 1's vine rope (ART-W3), he hangs by ONE
  paw while still, the glowworm hides behind him in the lit stills; FINDING sent: Pokey is as bright in the dark as in the light.
- GENERALITY FAILED on box 1's code (toyRoot.ts:15 ROOT_TOY '3-97' in gen2 engine code; no gate had run): the file is a World 3 test
  harness (read by rootRow/rootBots tests and the stills tool only): renamed src/game/gen2/rootHarness.ts under the rule's own
  *Harness.ts exemption, the rule unchanged (a619ea16a). PASS after.

## Done in box 3 (8e2a62ad0)
- ITEM 1, the toy's placement: Easy 36's ocelot patrolled the WHOLE floor (patrolMinX..MaxX = the piece less 24 px: patchFor cuts the patch
  from the whole free run; the cast walks all of it), past the root's end. NEW general field `Socket.patch` (types.ts: an enemy socket's
  stretch of its piece, 0..1, flips with a mirror; pipeline.ts resolves it to world x on the placed socket and patchFor cuts from it). toyRoot's
  ocelot `patch: [0.26, 0.74]`: patrol 596..1604 of the 2200 floor, its watch (sight.ahead 240) 356..1844, the root 300..1900: 56 px clear.
  A middle-only bound (0.41..0.59) kept it under the lit patch: seen on 14/16. rootRow.test 'the watch rule' (16 rolls; PLANT bound off -> red).
- Bounded, TWO BOT FAULTS showed (box 2's 15/16 was mostly the ocelot being far away): (1) the root's hold never let go: thumbify re-arms the
  late lift-off every frame for KID/ADULT (R-165.59) unless held; NEW `rootHeld` (set where rootPlan or the end hold returns {}) arms it once,
  as the dark's glowStop does. (2) the watch was read at the light's FIRST point with a frozen watcher: on Easy he closed on a slowed ocelot
  (speedOf, def.easy.speed) walking away and came inside its 150 px sight behind halfway through the light (every Easy roll seen 111 frames).
  NEW `rootSeen` (firsttimer.ts): the whole lit stretch, the watcher walking its patrol at its setting's speed, turning at its ends, ROOT_PAD 20.
- THE PROBE IS NOW TESTS (rootBots.test.ts, 3 tests, about 30 s): GREEN 16/16 (8 rolls x both settings) on the root, across, seen 0, hits 0;
  PLANT noRootWait seen on 10/16 (n1 n11 n16 n26 n31 e1 e6 e16 e21 e31); noRootWait + lit off: seen 0 on all 16; pace 85 on
  every roll, PLANT Rope.speed unset -> 120. Plants of the two fixes, each alone: rootHeld off -> red (n1 n26 n36 e1..e31); rootSeen ->
  the old point read -> red (every Easy roll). tsc 0. 'took' no longer asks for the near end (n16 lands mid-root).
- KIT-W3b SPEC ADD (the watch rule, now checkable): bound the watcher with `Socket.patch` so patrolMinX - sight.ahead >= root.x0 and
  patrolMaxX + sight.ahead <= root.x1; leave its patrol room to walk away from the patch (not only the patch's middle).

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

## Gates (box 4, frozen a619ea16a): tsc 0, generality PASS; the rest: the next step above. Pushback: 'lit = seen' was missing (sent; accepted). Lessons applied: D134, D138, D140, D148, D40.
