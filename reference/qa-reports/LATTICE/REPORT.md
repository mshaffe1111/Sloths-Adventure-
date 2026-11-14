# LATTICE: the vine field in the engine (R-165.177), QA build only. Branch t-lattice on t-feel-pair. No PR.
**Built (the lead's 10:37 PM change: the real mechanic, not a throwaway):** `src/game/vineField.ts`. A climb is a field vine when its piece says
`Vine.field` (types.ts), and every number is on that piece (FIELD_FEEL: reach 90, slide 2, twoUp 1.6, twoDown 0.5, push 0.6, pushTwo 1.0).
Matt's rule (engine.ts, the climb): with one hand on a vine, a push toward a field vine in reach that hangs at his height takes it in the other hand. On two hands, a push
toward either keeps that one and lets go of the other. With no vine there, a held push hops him off as on any climb, and a jump leaps off.
One hand: up 220 px/s (unchanged), down slides at 2x. Two hands: up 1.6x, down 0.5x. A short vine runs out under a long one (its hand
lets go). Clusters (`stage.clusters`): his hands under one push it up its vine at 0.6x (1.0x on two hands, no slide). It tears free at
the top and falls. It is snagged, so he cannot climb down through it. No stage id, world or x in the engine (generalitycheck PASS).
**Test bed:** v1's room (Settings > About "Vine field test", `#autostart=1&level=feel-pair`). Its single and pair are swapped for:
five vines 80 apart, 450 tall; six of mixed lengths 150-450 with one 110 px gap (jump); three vines with two clusters.
The sign switches the slide 2x/1.6x. The stopwatch: up one hand / two hands, slide 2x / 1.6x, down two hands.
**Tests:** `vineField.test.ts` (6, planted: each move checked against the same vines with no `field`, so a single climb never steps or
slides). `feelPairRoom.test.ts` (8, real engine by touch, 390 and 1034): the rule both ways, the edge hop-off, the 110 gap (push takes
nothing, jump catches), measured speeds (220, 352 px/s), slide, sign, cluster pushed at 0.6x then torn and gone, no life lost.
**Bugs the touch tests caught and fixed:** (1) up held after the vault onto a bough grabbed the next field vine's top and vaulted again,
hopping him along the bough (now a field vine is not taken from above its top unless he climbs down onto it). (2) A quick push right
after grabbing was lost to the grab's grace and carry (now it steps; a push held through a leap's catch is latched, never a step).
(3) The stopwatch dropped a slide: Exit B leaves him a few px over the floor, not grounded.
**Stills (sideways, one a lane; looked at):** land-1-even-two-hands.jpg, land-2-mixed.jpg, land-3-push.jpg. All three read: he hangs
between two vines, the lengths vary, the cluster sits on his hands.
**Stand-ins, named plainly:** field vines are World 1's painted vine hung straight (vineFieldArt.ts). Clusters are CODE-DRAWN circles.
On two hands Pokey is v1's pair climb pose centred between the vines, which reads as one vine (Matt 10:31 PM). Painted two-vine frames are
R-165.178.
**Not built (lead's scope):** pods, flyer, ants, fruit pickups, the bough lifting a notch per cluster (1-4's pieces).
The draped pair (Vine.pair) stays: 1-4.md beat 13 still uses it.
**Gates:** tsc PASS; unit suite 3135 pass / 0 fail (1 TODO from base); vite build (deploy base) PASS; chunkcheck PASS; artcheck PASS;
knowncheck PASS; generalitycheck PASS; roadmapcheck PASS; seedlist 1-1 PASS (257); tool tests 33/0; tierBots 7/0; drawcheck PASS;
clipcheck PASS (83 known); kbdcheck PASS. **buildcheck FAIL, and the base fails it the same way:** idle, 1-1 p95 478 ms (normal),
against origin/t-feel-pair's own src at 509 ms, budget 150. That is this container or the base, not the field. The lead's call.
**Lessons applied:** D41 (hands 78 px up from his 89.1 drawn height), D40 (no patching the pair: the field replaces the room), engine for
every stage (no ids in vineField.ts), LAWS 5 (every gate run; any not finished is named, never skipped).
**Method update:** the touch rig found all three bugs; script-only (keyboard) stills missed (1). For any new climb move, test by touch
in TouchRig with the finger held through the vault and a push inside 0.3 s of the grab.
