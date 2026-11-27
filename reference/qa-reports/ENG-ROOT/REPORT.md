# ENG-ROOT REPORT (3-2's roof root; R-165.452; the 'lit = seen' seam R-165.529) — t-eng-root-wip, base t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 4, a fresh member; box 3 ENG-ROOT-c handed over on the clock; head on t-eng-root-wip = the commit carrying this)
1. `git fetch origin t-eng-root-wip t-eng-w3 && git switch -c t-eng-root-wip FETCH_HEAD`. t-eng-w3 has MOVED (f79963053 at box 3's end, base
   was 13135bf6b): MERGE it in first (never rebase), then tsc. Item 1 is DONE (below); the src/tool change is FROZEN unless the merge breaks it.
2. ITEM 2, THE STILLS (not started). Method: copy tools/engine/draftshoot.mjs (vite + a boot imported before /src/main.tsx + Pokey pinned in an
   e.render override) to a scratch shooter in the scratchpad; the boot (a file under tools/ so vite serves it, NOT committed) lists the toy:
   `LISTED[id] = { kit: () => rootKit, world: (s) => s }` and `plantSeedList(id, { dict, seeds: [seed], plans: [packed] })` exactly as
   rootBots.test.ts play() does (rootBuilt + packPlan + keptFoes). OPEN QUESTION: the page plays a stage by id through levelConfig(id); the toy
   id 3-97 has no STAGE_PLAN entry. Either give the boot a STAGE_PLAN[3][96] entry from toyRoot's rootCfg, or list it under a World 3 id that
   has a plan entry with HAND_STAGES[id] deleted (readyDraft's pattern) and check the replayed plan builds the same row (print root x0/x1 and the
   ocelot patrol, D62). The pin: `p.hanging = true; this.ropeId = root.id; p.x = X; p.y = root.y + HAND_REACH (70, rope.ts)`, vx/vy 0. Shots:
   Normal e.g. roll 1 (root 14463..16063, patch at its middle) with Pokey (a) in the dark before the patch and (b) IN the lit ring over the
   ocelot; Easy the same; upright 390x844 and sideways 844x390 at 2x. Each still says "art: World 1's painted vine rope (ropeArt.ts drawRopes,
   look 'root') until ART-W3 batch 2's root lands" and names its draw path. Judge as Matt on a phone: the root reads as a root, hands on it, the
   ocelot readable, the ring visible. Send them to the lead.
3. GATES ONCE on the frozen candidate (D115, src/game/gen2/proven/ writable): tsc; the CI tool line; THE LOCK GATE as two runs (D153):
   `npx tsx tools/engine/lockall.ts --layouts 16 --out base.json` on t-eng-w3's head, then `--layouts 16 --check base.json` on the candidate,
   with the counts line (no listed stage moves, every shipped rope 120); the suite in 6 shards; tierBots 9/9; generalitycheck.
4. LAND: merge onto origin/t-eng-w3 (no force, never rebase), re-run tsc and the lock check, ls-remote. To the lead: the hash, each shard's
   totals, the stills, what 3-2's build can measure, and the brick spec below (KIT-W3b's next box builds the brick).

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

## Gates: NOT YET RUN (box 4's step 3; box 3 ran tsc 0 and the root tests only). Pushback: 'lit = seen' was missing (sent; accepted). Lessons applied: D134, D138, D140, D148, D40.
