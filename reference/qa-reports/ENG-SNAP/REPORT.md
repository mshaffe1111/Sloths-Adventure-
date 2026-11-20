# ENG-SNAP (R-165.339): the snapper bots play 2-5 the taught way (bots only)

Engine, packet reference/packets/2026-11-20/ENG-SNAP.md. Branch t-eng-snap from t-build-25 76c05cbc. No level, judge or src/ change:
tools/inspect/firsttimer.ts (the bot), tools/inspect/snapToys.ts (the toy's watcher), tools/inspect/snapperTaught.test.ts (the toys),
.github/workflows/gates.yml (the new toy file on the engine tools' line), run scripts in tools/engine/runs/.

## 1. The toys (rule 21), RED first
`tools/inspect/snapperTaught.test.ts`, on snapToys.ts's awake snapper row (ENG-25's, id 2-89), 6 variants a row, both settings.
- **(a) bonkBrake**: after a bonk the bounce never carries him to its far side. Every tier that bonks (the child made to bonk here with
  letItSnap off, at the child's own thumb; middle N/E, expert, adult N/E): one bonk (no loop), never down on its far side while it is
  dazed, kicked off clean to the shrine, and (all but the adult: see below) never more than its back past its middle (38 px).
- **(b) letItSnap**: the child (N/E) lets it snap at nothing and kicks it in its recovery, no bonk at all; the kid (N/E) never bonks it
  by choice, is never hurt by it, and kicks only in its recovery.
- Planted (a): with bonkBrake off, the child's bounce reaches its far side again. Planted (b): with letItSnap off, child and kid bonk.

| | commit | result |
|---|---|---|
| RED today | 9331722e (1:11 PM ET) | 11 held FAIL, plants pass: toys-red-today.txt (child 2-6 bonks, 103-211 px past, far landings; middle Easy v2 3 bonks / 228 px; adult Normal v6 2 bonks; no tier kicked in its recovery) |
| green | see the final hash | 13/13: toys-green.txt; every run's events: toy-runs.txt (`npx tsx tools/engine/runs/snapbounce.ts`) |
| RED again, bonkBrake off | `SNAP_SKILL_OFF=bonkBrake` | all 7 (a) rows FAIL: toys-red-bonkBrake-off.txt |
| RED again, letItSnap off | `SNAP_SKILL_OFF=letItSnap` | all 4 (b) rows FAIL: toys-red-letItSnap-off.txt |
| the old toys | snapperBonk + snapRide | 24/24: toys-snapperBonk-snapRide.txt |

## 2. What was wrong (every cause traced on a frame trace; all in the bot)
1. **Steered at full run onto its back.** The game's refined controls keep his speed when the thumb lets go in mid-air (engine.ts: only
   Down brakes). The old hop steered toward its middle until there, so he reached it at 268-285 px/s; the bounce carried him on while
   his thumb turned (child 0.18-0.35 s): 2-5's 100-145 px. Now the hop and the bounce are steered by where the coast comes down
   (`steerToLand`, the jump's cutV cut counted), pushing back only when the coast will overshoot.
2. **A dazed snapper is still stomped** (fight.ts stompTest: within its head's half-width + 18 px = 48). The old landing aim (29 px)
   came down on its back again: a second bounce with no plan, the way-on steer took him over it, it woke, he bonked from the far side:
   the loop. Now the bounce comes down 54 px off (inside the kick's 58), and any stomp he did not mean (a hop off the last snap stone
   onto it; a bounce loop on its back) is taken as his bonk (`adoptBonk`, `bonkAir`).
3. **The engine re-checks a landing as a stomp for 0.09 s**: a step in on landing bounced him again. No steer in his last 0.15 s of air.
4. **Thumbs that cannot place a steered hop.** KID's late lift-off runs up to 4 frames (the child and the kid): its shortest steer is
   already a full run. Those thumbs walk up beside it in the quiet and hop straight up (`bonkBeside`).
5. **TURTLE sees only movement** (no seesStill; stillness.ts: still 0.5 s, 0.35 on Easy, and he is lost to it). A child standing still
   at its stand was never told on, and the help ladder put him past it (child Normal v4). On its creak he steps back ("stand back"): it
   tells on that step and snaps on four at the spot he left.
6. **The kick's hesitation** now counts from the stun (it is spent in the bounce's air), and a step that must happen now (the walk in to a
   dazed snapper, the creak step) skips the thumb's measured pause between steers (`rhythm`): a 1 s gap held the step until it woke.

## 3. castBots 2-5, seeds 1-40, both settings (before = BUILD-25 castbots-2-5.txt; after = castbots-2-5.txt, castrows-2-5.jsonl)

FILL

## 4. No other stage moves

FILL

## 5. The gate list on the final head

FILL

## Polish check
Bots only: nothing Matt sees changed. The toys' frame logs (toy-runs.txt) are the "screens" here: every child run reads snap@~90 then
kick in its recovery, every bonker run reads one stun, a landing on his side, a kick while dazed.

## Lessons applied
- Test the measuring tool first (D15): snapperWatch's events were checked against frame traces before any number was trusted; its first
  sign was inverted and fixed before use.
- Check the fact in code (D3): every cause above is the engine's own line (engine.ts refined air, fight.ts stompTest, stillness.ts,
  predators/world2.ts TURTLE), read, not assumed.
- Spread the fix to its pair (D21): the same bounce code serves the accidental stomp (adoption), and the World 1 snake stages were run
  before and after (section 4).
- Engine work for every stage: nothing names a stage, seed or x; all of it is the kit's data and the stage's clock.
- Time from `TZ=America/New_York date` in the same command (D30).

## Learned
FILL
