# ENG-SPORE REPORT (spore puffs as a gen2 zone brick, their light on a clock; 3-1 NEW 2; R-165.449; ADR-004)

**EXACT NEXT STEP (box 3, ENG-SPORE-c, hand-over; head on t-eng-spore-wip = the commit that carries this line).** THE CANDIDATE is
d653d3994 = `git merge --no-ff 11e2af1a0` (t-eng-asks = t-eng-w3 a8bc662e5 + ENG-ASKS's hazard registry, the lead's base change) into
5dd854b15: NO conflicts (engine.ts, pipeline.ts, types.ts, firsttimer.ts auto-merged), plus ENG-DARK-bb's corrected
reference/qa-reports/ENG-DARK/LOCK-1-4-INTENDED.md from bbcc1513c (docs only). No src/tools change after the merge. tsc 0.
DONE on d653d3994 (frozen worktree, chattr -R +i src tools, src/game/gen2/proven writable, R-165.494): planted faults on a copy
ALL 6 CAUGHT (plants-d653d3994.txt); sporeBots + dark + darkBots 58/58 GREEN (darkspore-d653d3994.txt: ENG-DARK's three reds fixed);
generalitycheck PASS (26 literals, 26 known).
castBots 3-1 (seeds 1-20, both, par 2; cast-3-1-seeds1-20-d653d399.jsonl): 180/180 rows IDENTICAL to c20's cast-3-1-x40-b8352246-lane1
(every field; 0 moved, 0 missing): 3-1 unmoved, as expected (no stage lays spore yet). Seeds 21-40 (c20's lane2) NOT run (budget; named).
GATES ON d653d3994, ALL GREEN (box 3 finished them past its box on the same frozen candidate, D138; gates-d653d3994.txt): CI tool line
355 tests 354 pass 0 fail 1 todo (chase bots, OPEN); suite shard 1 814/814 0 fail; 2 733/733 0 fail; 3 604 603 pass 0 fail 1 todo (4-3
wall check); 4 676 675 pass 0 fail 1 todo (boulder wall check); 5 664/664 0 fail; 6 649 648 pass 0 fail 1 todo (R-165.312); KID_RUNS_59
GREEN this run (shard 3 ok 155; no inherited red). tierBots 9/9. lockall --layouts 16 --check vs a fresh lock of frozen a8bc662e5 in one
run, no chunks: 3264 builds of 102 stages (4-D, 5-M in), 102/102 UNCHANGED, exit 0, no intended moves needed (lock-check-d653d3994.txt).
NEXT (the next box, if box 3 has not): ReadNotifications; read box 3's gate results in this file; if all green and ENG-ASKS's hash is on
t-eng-w3 (`git ls-remote origin t-eng-w3` = 11e2af1a0 or a descendant of it that d653d3994's head contains), LAND: `git push origin
t-eng-spore-wip:t-eng-w3` as a fast-forward ONLY (no force; if t-eng-w3 is not an ancestor of the head, stop and tell the lead), ls-remote
confirm, and send the lead the hash, each shard's totals and the lock verdict with its counts. If ENG-ASKS has not landed: wait (the
lead's order: do not land before it). If t-eng-w3 moved past 11e2af1a0 to something not in the head: stop and tell the lead.

**Box 2's next step (done by box 3 above; history) (box 2 hand-over; head on t-eng-spore-wip = the commit that carries this line).** Box 2 did (1)-(2) on the code head
8477445a5 (no src or tools change since): (1) planted faults on a copy tree: ALL 6 CAUGHT (plants-8477445a5.txt; both box-1 misses
caught by their toys); (2) dark.test + darkBots.test + sporeBots.test on a chattr-frozen tree: 55 tests, 52 pass, 3 RED, exactly ENG-DARK's
inherited three (darkspore-8477445a5.txt: 'seamByFacing, the plant', 'noOpenEnd' GREEN half, 'noTurnRoom, the plant'; proven red on the
base e544dc3dd in box 1; ENG-DARK fixes them in its box 24 before its landing; NOT touched here). The lit span is in the Polish check.
NEXT: ReadNotifications. Then (3) WAIT for ENG-DARK's landing: `git ls-remote origin t-eng-w3` past 88592a9c4 (or the lead's word);
at box 2's end it was still 88592a9c4. Then `git fetch origin t-eng-w3 && git merge --no-ff FETCH_HEAD` into t-eng-spore-wip (no force;
name every conflict: expect dark.ts / darkBots.test.ts / firsttimer.ts / engine.ts's light list), and on a NEW frozen tree of the merged
head: sporeBots.test + dark.test + darkBots.test (darkBots must now be ALL GREEN with ENG-DARK's fixes; any red is the merge's) and the
planted faults again on a copy. (4) the full gate set ONCE on that merged frozen head: lockall (`--layouts 16 --check` against main's
lock: any move traced), tierBots 9/9, the suite in shards (run_in_background, timeout 7200000, frozen except src/game/gen2/proven), the CI
tool line (D141), generalitycheck, drawcheck (the light draws). (5) land on t-eng-w3 (merge, no force), ls-remote confirm, the hash and
"What READY-31 can measure" (below) to the lead.

## Box 1 (ENG-SPORE, from e544dc3dd = ENG-DARK's c16 code e5c098072; the lead's catch-ahead base)
### Item 1: the spore puff as a gen2 zone brick
- `src/game/zones.ts`: `SPORE = { period 6.4, warn 1.0, active 2.2 }` is the data (the old generator's `spore()` reads it; its 3-1
  recipe `sporeRecipes(1)[0]` IS SPORE: tested), `SPORE_BOX = { up 220, down 40 }` (the hand build's box, protoStage.ts sporeZone).
- `src/game/gen2/types.ts` SectionZone gains `{ kind: 'spore'; on; period?; warn?; active? }`; `src/game/gen2/pipeline.ts` lays it with
  `sporeZoneOn` (new `src/game/gen2/spore.ts`): the cloud over the piece, the mushroom at its middle, the beat's offset rolled from the
  slot's stream as tide's is, an 'S' beat. The warn is laid AS ASKED (no clamp), so levelCheck's 'warning too short' judges it.
### Item 2: the puff's light on a clock (ADR-004: ONE optional field)
- `Zone.lights[].clock?: LightClock { period, from, len, offset }`; unset = today's light (no reader changes for one without it).
  `sporeClock(zone)`: from = the idle spell, len = warn + active (3.2 s of 6.4). Pure helpers: `clockLitAt` (the window's start, or
  undefined), `clockLitLeft`, `clockGlow` (0..1, a 0.25 s ramp so it never snaps).
- The dark brick (gen2/dark.ts): `glowZone` hangs the puff's clocked light over a landing on a spore shelf in its box (`puffAt`,
  `puffLight`) and NO glowworm there; `darkGaps(stage, setting = 'normal')` keeps a clocked light only when `len >= DARK_AHEAD + rimAir`
  (the drop's fall, or a hop's rise and fall), else names the rim; `darkLandings` judges a clocked landing light as a sleeping one;
  `litAfter` (darkFlags) gives a clocked light its longest dark spell; `RimWatch` reads `lightLitAt` (the window's start).
- The draw (engine.ts, the darkness's light list): `u = clockGlow(...)` for a clocked light: no allocation added per frame.
- The bot (firsttimer.ts): `glowRimsOf` takes clocked rims; `glowGo(rim, lead)` (any other light read bit for bit as before): lit `lead` s AND the window still open for the way
  over + CLOCK_SPARE 0.25 s (the step from a 30 px stand); a clocked light has NO give-up (he waits for it: the light off, forever).
### Item 3: the toy on a REAL row (src/game/gen2/sporeBots.test.ts, 7 tests, GREEN on my tree)
- THE ROW: 3-1 draft roll 1 Normal, the dark DROP rim at the left end of 846-1099 (y 927), 194 px down onto 607-830 (reaching 239 px past
  the rim, nothing between). NOT 240 px: the draft has no clean dark drop at 240 (probes/drops.mts: rolls 1-12, the clean way-down drops
  are 156-194 px; roll 1's 195 px one at 613 has a piece 65 px under it that a running drop lands on; roll 3's 217 px one is a shelf
  under the rim's own piece that a run carries past). 194 px lies in 3-1.md's 160-320 band. The shelf gets its puff from the brick's
  own builders (sporeZoneOn, puffLight) in place of its glowworm, on SPORE's beat.
- GREEN: put 30 px from the rim with the puff dark, the bot stands, goes once lit 1 s, lands in light; litAhead []. Put there as the
  window is closing (lit 2.8 s, 0.4 s left, less than the way down): he waits for the next window and lands in light.
- FLOWN: 128 presses from a stand 30 px out: **53/128 land in light = 41.4% of the cycle; press to touchdown 0.57 s; worst wait
  3.75 s** (3-1.md: 38-42%, 0.53-0.60 s for 160-240 px, worst wait 3.7-4.0 s).
- PLANTS (all RED as they must be): the light off (len 0): the bot waits at the rim the whole 14 s, darkGaps names the rim ('a clocked
  light too short'); no warn (warn 0): levelCheck 'warning of 0s is too short'; the wait removed (noGlowWait): he drops dark, litAhead
  names it. The brick-lay test: the glowworms' dark laid again by DARK_EMIT over the row with the puff laid first hangs the clocked light
  (period 6.4, from 3.2, len 3.2) over the landing, no glowworm, darkGaps keeps it.

## What READY-31 can measure once this lands
A section's `zones: [{ kind: 'spore', on: '<shelf>' }]` in a glowworms' dark: darkGaps(stage, setting) on every roll both settings (a
puff too short for its drop is named), litAhead on every castBots row (a drop made before the puff was lit 1 s, or into a closing
window, is named), levelCheck's spore rules (warn >= 0.9, 3 s awake between clouds). The flown share is sporeBots.test's harness.

## Polish check
- stills/3-1-port-puff-lit.png: the puff's light opens over the shelf, its mossy top and mushrooms readable, the cloud above; Pokey on
  the rim up right. -dark: the shelf is lost but for the petal's glow and a faint glimmer (as a sleeping glowworm's). The cloud and the
  light agree (one offset).
- THE LIT SPAN against the shelf (box 2, the lead's ask; my own arithmetic agrees with the lead's figures): the puff's light at
  (719, 1031), r 190, 90 px over the shelf's top (607-830 at y 1121, 223 px wide). Inside r at the shelf's top: 552-886 (334 px), so
  the WHOLE shelf is inside the light; its ends sit 144 px from it (0.76 r), which is why they read dim; the landing he aims for (x
  792) sits 116 px away (0.61 r). The radius is full only once the light has ramped (0.35 + 0.65 x its glow). The lead APPROVED the
  stills (-dark vs -lit): the lit shelf reads plainly; the petal placement and the dim ends are the level's, not the brick's.
- Rough, named: the draft's petal over the mushroom; the shelf's ends dimmer than its middle. Box 1's first shots had Dot's 'Too dark
  to see' box over the puff: reshot with it tapped away.

## Lessons applied
D115 (runs on a chattr-frozen tree), D119 (no heredoc in a commit chain), D128 (times from `date`), D134 (this next step pushed and
ls-remote-confirmed before the hand-over), D139 (checked against the code: drowsiness, the art and the levelCheck rule already existed;
only the gen2 lay, the clock and the bot's wait were built), D141 (the CI line stays on every candidate: owed at the landing candidate).
