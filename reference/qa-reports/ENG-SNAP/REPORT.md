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

## 3. castBots 2-5, seeds 1-40, both settings

Before = BUILD-25 castbots-2-5.txt / castrows-2-5.jsonl (head 6ba1a4b7); after = castbots-2-5.txt / castrows-2-5.jsonl on a4f966ac
(`npx tsx tools/inspect/castBots.ts --stage 2-5 --seeds 1-40 --setting both --rows ...`); every row before -> after:

| tier | pass | snapper bites | lives | rescues | mean time (s) |
|---|---|---|---|---|---|
| adult easy | 40 -> 40 | 54 -> 54 | 0 -> 0 | 0 -> 0 | 162 -> 165 |
| adult normal | 40 -> 40 | 46 -> 54 | 11 -> 6 | 0 -> 0 | 157 -> 161 |
| child easy | 16 -> 40 | 10 -> 0 | 0 -> 0 | 48 -> 0 | 326 -> 285 |
| child normal | 7 -> 40 | 24 -> 0 | 19 -> 12 | 70 -> 0 | 522 -> 376 |
| expert normal | 40 -> 40 | 0 -> 0 | 4 -> 9 | 0 -> 0 | 199 -> 185 |
| kid easy | 0 -> 4 | 1710 -> 0 | 235 -> 0 | 176 -> 99 | 485 -> 238 |
| kid normal | 0 -> 0 | 776 -> 13 | 332 -> 223 | 462 -> 316 | 767 -> 557 |
| middle easy | 40 -> 40 | 0 -> 1 | 0 -> 0 | 0 -> 0 | 212 -> 198 |
| middle normal | 39 -> 40 | 2 -> 2 | 15 -> 10 | 1 -> 0 | 220 -> 203 |

- **Bar met:** child, middle and expert 40/40 on every setting they play; adult 40/40 both. Kid (no bar, the floor): 0/40 Normal, 4/40
  Easy, its snapper bites 776 -> 13 and 1710 -> 0; its misses are the stones and the count (stranded goal 4-7/8, rescues), not the
  snappers.
- **Named, not hidden:** adult snapper bites 46 -> 54 on Normal (54 -> 54 Easy), scattered both ways seed by seed (17 seeds up, 10 down,
  1-3 each). Expert lives 4 -> 9, every one water at one pre-existing water jump (x 20943-21834, no snapper within 200 px: lives25.ts);
  the base loses its lives at the same jump (L5 x21110/21193, L17 x20943, L23 x21245). The bot's random draws shift with the new code, so
  which seeds die there moves; middle (15 -> 10) and adult (11 -> 6) moved the other way. Not a snapper effect; not changed here.
- **Run 1 regressed and is kept** (castbots-2-5-run1.txt, on 4dff47fd): middle 13/40 and 16/40, expert 18, adult 26/24. On 2-5's real
  ground he bounced on a dazed snapper's back with no steer until the help ladder came (L4: 13 s at 43 px; L6 at 48 px): three bugs in
  the new steer (a lift-off counted that he was not steering; adoption only in a stomp's first 0.2 s; the 6 px dead zone at the stomp
  reach's edge), all fixed and re-run. Then the lead's guard (no reflex beyond the tier's): the creak step now waits stopReact; the
  adult's hop from beside it raised its bites (46 -> 61, concentrated on seeds that had none), so it keeps its steered hop; backing off a
  snapper crept into its bite skips the thumb's rhythm (child Easy L35). Every miss on the way was traced on a frame trace
  (tools/engine/runs/rescue25.ts, bites25.ts, lives25.ts).

## 4. No other stage moves

The kinds a kick ends (predators/*.ts `beatenBy.kick`): snake (World 1: chasedOff), turtle (World 2: chasedOff, when open), riverGuard
(World 2: stunned), tayra and frog (World 6). Stages whose cast names one (gen2/worlds/*Arc*.ts `cast:`): **1-3, 1-4, 1-5** (snake) and
2-5 (turtle). riverGuard, tayra and frog are in no stage's cast today. The new code acts only on a cast animal that keeps a stage clock
(`kitBeat`: World 2's snapper rows), so World 1 must not move:

| stage | before (base 76c05cbc) | after (a4f966ac) |
|---|---|---|
| 1-3 | castbots-1-3-before.txt | castbots-1-3-after.txt: the same numbers on every tier and setting |
| 1-4 | castbots-1-4-before.txt | castbots-1-4-after.txt: the same (kid 24/34, adult 40/40, child 10/13, middle 22/24, expert 25: unchanged, the stage's own) |
| 1-5 | castbots-1-5-before.txt | castbots-1-5-after.txt: the same |

(Compared with the cleared-by keys and tied fail groups put in order: the only differences are the print order of equal counts.)
The after runs for World 1 were made on f042d65b; the commits after it change only the snapper paths (letItSnap's creak, the adult's
bonkBeside), which no World 1 animal reaches (no kitBeat). tierBots (1-1 calibration): in the gate table.

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

## For the lead
- **A possible 2-5 design gap (not mine to fix; bot kept as is):** a REAL child who follows Dot's "stand back, let it snap, then kick"
  literally and stands still out of reach never draws the snap. A tell needs `saw` (src/game/predators/core.ts:588 in rest, :646 in
  hunt); `sees` (core.ts:275-276) is stillness.ts:69-70's `watcherSees` (inSight && (!still || (!covered && seesStill))); TURTLE's sight
  has no seesStill or remembers (predators/world2.ts:13); still for calmIn (0.5 s Normal, 0.35 s Easy) he is invisible, and in hunt it
  gives him up after 2 s. No timer or idle snap: nothing happens until he moves. The bot steps back on the creak (after its own
  reaction), which is what makes it tell. Either Dot's line says "step back when it creaks", or the snapper snaps on four at whatever is
  in front of it.
- The kid's thumb (FT_KID: its late lift-off re-arms every frame with a floor of 1, R-165.59) never lets a steer go, so the kid cannot
  hold a stand anywhere; its floor on 2-5 is the stones and the count, not the snappers.

## Learned (for the next engine member on bots)
1. **Read the engine's air control before steering a bot in the air.** Refined controls keep his speed on a let-go; only Down brakes.
   A bot that steers "toward X until there" arrives at full run. Steer by where the coast comes down, counting the jump's cutV cut.
2. **An animal that is stunned is still stompable,** and the engine re-checks a landing as a stomp for 0.09 s: aim every bounce's
   landing outside stompTest's reach (head half-width + 18 px), with a tolerance smaller than the margin.
3. **Know each tier's thumb before giving it a plan.** KID/ADULT's lift-off re-arms (never let go); the child's lasts up to 4 frames
   (its shortest step is ~50 px); tier thumbs pause between steers (rhythm, up to 1.7 s). A plan that needs a precise stop or a step "now"
   must account for that (`steady`), or choose a move the thumb can make (straight up from beside).
4. **A predator that sees only movement ignores a still bot.** A "wait for it" plan must make the bot be seen, after its own reaction.
5. **A toy that passes is not the stage.** The toy was green on 4dff47fd; 2-5's real ground found three more bugs (run 1). Run the
   stage's castBots before calling a bot fix done, and trace every miss to a frame.
6. **Every new decision gets its tier's reaction time** (the lead's guard): count hesitation from the stimulus (the stun, the snap, the
   creak), never react on the stimulus's first frame.
- Proposed rule (bots/BOTS.md, for the lead): "a bot plan that needs a stop or a step at a moment names the tier thumb facts it relies
  on (lift-off, re-arm, rhythm, turn travel) and is flown on the slowest thumb that will use it."
