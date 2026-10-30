# 10-8 The Clockwork Gate: World 10's special stage (mock-up, nothing built)

2026-10-30, design helper for the lead. Matt's pick (3:25 PM ET): a puzzle stage inside the fortress machinery, with gears,
counterweights and timed doors: the General's clockwork beaten by patience. World 10 stays stone. **Show first: Matt approves this
before anyone builds it.**

## Where it goes: 10-8, and why

- **10-8 is unbuilt.** It's one of World 10's old-generator ascents (10-2, 10-4, 10-5, 10-8), which gen2-w10 left for later. Nothing
  curated gets thrown away, and gen2-ascent has one fewer ascent to make.
- **It's the doorstep of the fortress.** 10-9 is The Fortress Gate (the last fight before the General). The machine that works that gate
  belongs right before it.
- **Dot is back (10-6 to 10-9)**, so she can explain the locked gate and nudge on struggle, in her own voice.
- **The hold move is already taught** in 10-3 and 10-4, so 10-8 can use it in a new way (riding the great wheel) instead of teaching it.
- **10-8's approved wayside line becomes the reason for the stage:** *"Someone has sewn a hole in the netting shut, very badly. Every
  stitch is in the wrong place."* The way in through the netting is shut, so Pokey goes in through the gate's machinery.
- **Name and goal (new, needs Matt's approval):** "The Clockwork Gate". Goal: *"The gate is a machine. Light its three lamps."* It
  replaces "The Last Steps".

## The idea: the General counts, and so does his gate

The gate opens only when three lamps above it are lit, and a lamp lights when an iron counterweight hangs on its hook. Each weight is
behind one piece of the machine: a counterweight lift, the pendulum's timed doors, the great wheel. None of them can be rushed. Every
piece runs on its own steady count, and the player who watches one cycle before moving always gets through. That's the "beaten by
patience", and it sets up the General's counting in 10-10.

It's built from the puzzle kit we already have (`puzzleKit.ts`: carry, counterweight basket + lift, gates, levers, the reset post,
Easy's silent sparkle). New pieces: a **timed gate** (open on the pendulum's tick, shut on the tock), the **great wheel** (a slowly
turning climbable with pegs), and the **lamp** (a lit/unlit state frame).

## Start to finish (about 3 minutes quick, 5+ careful)

| Time (quick) | Section | What happens |
|---|---|---|
| 0:00-0:15 | **Start** (still 1) | The sewn-shut netting (the wayside line). The gate is ahead, with gears turning behind its bars and three dark lamps. **Dot explains the locked exit** when he first sees it: *"Three lamps. Hang a weight for each."* (new). Nothing hurts here. |
| 0:15-0:55 | **Weight 1: the counterweight** (still 2) | First-lesson room (STAGE-RULES §3): no enemies, no deadly fall, can't be skipped. The room shows the idea by itself first: a weight already hangs on a small hook and holds a little shutter open. Then he carries a weight up the stone steps (a walkable carry path, no jump) and hangs it on the big hook with a tap. The chain runs over a wheel and lifts the shutter to the next hall. The first lamp lights. |
| 0:55-1:30 | **Platforming** | Spike rails and a guard or two on the walls (World 10's painted hazards and soldiers), a flag. Not every minute is a puzzle (§3). |
| 1:30-2:10 | **Weight 2: wait for the tick** (still 3) | The pendulum swings. Two shutters take turns: one opens on the tick, the other on the tock. Carrying the weight he walks slower, so he can't run both on one swing: set the weight down, wait a beat, go. A shutter that closes on him pushes him back (no hurt: puzzles never cost a life). Normal: three shutters and a set-down in the middle. Easy: two, a slower swing. Dot says nothing on entry; after two failed tries: *"Listen to it. Tick... tock..."* (new). |
| 2:10-2:20 | **Rest** | Flag. |
| 2:20-2:55 | **Weight 3: the great wheel** (still 4) | The weight sits on a high ledge he can't climb to. The great wheel turns slowly. Grab a peg (walk into a low one or flick up to it), **keep a thumb down to hold on** (the 10-3/10-4 hold), ride up, lift the thumb at the top ledge. Carrying means no climbing, so he can't ride back down holding it: he **throws it** (a flick toward) into the iron chute, and it rolls down to the third hook by itself. Let go too early and he drops a short way onto a catch ledge (no hurt). |
| 2:55-3:10 | **The gate opens** (still 5) | Three lamps lit. The gate winds itself up, with the gears turning fast for the first time. He walks out toward 10-9. |

**Checkpoints:** every room has a reset post (§3) plus a flag after each lamp (0:55, 2:10, 2:55).

**One-thumb touch, with Jump help Off, On, and On + forward:**
- *Carrying* (the kit's rules): tap by a weight to lift it; slower walk; no jump, climb or swing; a tap sets it down; a flick toward
  throws it. Jump help plays no part while carrying.
- *The wheel:* walk into a low peg, or flick up to a higher one (a single flick, sized for Easy's 70% hold). Any thumb held down keeps the
  grip; lifting the thumb lets go. Steering isn't needed while riding, so "On + forward" (which pushes a second jump forward when
  nothing steers) can't throw him off the peg. The peg grab happens on the first jump.
- *Platforming between rooms:* ordinary World 10 jumps, all playable with all three settings, checked by the bots as usual.

**Easy:** rooms 1-2 steps (room 2 has two shutters; room 3's ledge has a second, lower peg), a slower swing, the silent sparkle on the
weight once he's clearly stuck. **Normal:** 2-3 steps, tighter swing, nothing automatic. Dot never gives the answer on entry.

**Scary:** the size of the machine, the noise; a shutter dropping in front of you; hanging from a turning wheel over a long drop. Nothing
in the machine can kill (puzzles never cost a life); the danger between rooms is the walls' guards and spikes.
**Fun:** working out the beat and walking through on it; riding the great wheel; throwing the last weight down the chute and hearing it
clang onto the hook; the gate finally winding open.

## The stills (mock-ups, upright 390x844 and sideways 844x390, saved at 2x)

Made from the game's own painted art: the fortress hall backdrops (`hall-wide`, `hall-tall`, darkened), World 10's paving and slabs,
the portcullis (shut and open), chains with hooks, braziers as the lamps (green fire), banners, Pokey's standard and carry sheets, Dot.
**The gears, the pendulum and the iron weights are code-drawn stand-ins**, tagged on every still. They're the main new art.

| Still | Shows |
|---|---|
| `w10-1-gate-*.jpg` | The locked gate, three dark lamps, Dot's line |
| `w10-2-weight-*.jpg` | Carrying a weight up the steps to the hook; the chain to the shutter |
| `w10-3-tick-*.jpg` | The pendulum and two timed shutters, Dot counting |
| `w10-4-hold-*.jpg` | Riding the great wheel (**the best one**) |
| `w10-5-open-*.jpg` | Three lamps lit, the gate open |

### Polish check (on the stills, at phone size)

- Painted, not drawn: **not yet.** The gears, the pendulum and the weights are code stand-ins, tagged on every still. They're art 1-3
  below. Everything else is painted.
- Copy-paste: pass in the stills. The paving is two rows of the same piece at different brightness, so the real stage needs the World 10
  ground set.
- Art matches what it is: pass, except that the carry steps in still 2 float (nothing holds them up). The real steps stand on stone
  plinths (STAGE-RULES §6 "nothing floats").
- Light: pass. A dark hall lit by green braziers and the open gate. Pokey stays readable.
- Pokey and Dot on model: pass (the carry pose is the puzzle-kit sheet; the wheel uses the arms-up hang frame).
- Framing: sideways pass. Upright shows a lot of floor at the bottom, and the real camera sits lower (puzzleCamera fits the active piece).
- Text: Dot's lines are under 10 words, all marked new.

## New art (Gemini prompts, ready to paste; magenta key; attach the named reference)

1. **Fortress gears** (attach `w10-4-hold-sideways.jpg` and `src/assets/kits/w10.webp`)
   > Side-view 2D game prop sheet, the same hand-painted storybook style as the attached World 10 kit, solid magenta (#FF00FF)
   > background. Dark iron cogwheels for a grim stone fortress, with rivets, a little rust and worn bright edges on the teeth, evenly lit,
   > face-on (perfectly round). Row 1: three gears, 600 px, 360 px and 220 px across, five spoke holes each. Row 2: the 600 px gear again
   > with eight wooden hand-pegs around its rim (a great wheel to ride). Row 3: two stone axle mounts the gears sit on. Nothing touching.
2. **Pendulum and escapement** (attach the same kit)
   > Same style, magenta background. A tall iron clock pendulum: a rod 600 px long with a heavy round bob stamped with a clawed paw, hung
   > from a pivot block. Separately: an escapement wheel with hooked teeth, 260 px, and the anchor that rocks over it. Evenly lit.
3. **Counterweights, hooks and the chute** (attach `w10-2-weight-sideways.jpg`)
   > Same style, magenta background. Three cast-iron counterweights with a ring on top and a clawed-paw stamp, about 110 x 120 px, small
   > enough for a sloth to hug. A big iron hook on a chain end. An open iron chute (a trough) that slopes down, 500 x 120 px. A wooden
   > counterweight pan hanging from four chains. Evenly lit, nothing touching.
4. **The gate's lamps** (attach `src/assets/w6to10/gemini/w10c-set-dressing.webp`)
   > Same style, magenta background. The attached green-fire iron brazier in three states: cold and empty, a first flicker, fully lit.
   > Same size and position in all three.
5. **The Clockwork Gate wall** (attach `w10-1-gate-sideways.jpg`)
   > Side-view 2D game set piece, same style, magenta background. A huge fortress gate in grey stone, about 900 x 900 px: an iron
   > portcullis in the middle, three empty lamp sockets along the lintel, and big iron gears and chains visible through barred openings on
   > both sides. Evenly lit, the portcullis drawn as a separate piece (shut and wound open) so it can move.

## Performance (PERFORMANCE-RULES §1: 12 ms per frame at q0, no frame over 50 ms)

| Risk | How the design stays under |
|---|---|
| Big gears turning every frame (rotated drawImage of a 600 px picture) | **A gear with n teeth looks the same after 360/n degrees**, so each gear is baked once as a 6-frame strip covering one tooth's turn and played like an animation. No per-frame rotation and no 'high' smoothing (§2.1, §2.8). Only the great wheel the player rides rotates for real (it carries him), one sprite at its drawn size. |
| A dark interior with glowing lamps | The darkness is baked into the backdrop at load, not a per-frame overlay. The lamps' glow is a pre-made light sprite with `lighter` or `source-over` only, never `multiply`/`overlay` (§2.10). No light map (7-4's approach isn't needed here). |
| Chains (long, many links) | One tiled chain strip per chain, not per-link draws. |
| Pendulum and shutters | One sprite each; shutters slide (translate only). |
| Many props in a hall | Rooms are narrow and tall (§3), culled off screen, under 40 draws for scenery per frame. |
| Sheets mid-stage | All of them in `stagePreload.ts` (§3.3). |
| Check | A 10-8 run in `drawcheck.mjs`; the Pixel upright on the wheel room against `perf-baseline.md`. |

## Dependencies to flag

- **The hold move** must ship in 10-3/10-4 before this. If it doesn't, the first wheel here teaches it (a harmless first ride, Dot:
  *"Keep your thumb down to hold on."*, new).
- **The timed gate and the great wheel** are new kit pieces: both need validator rules (§3 "Proof": fails without its weight, can't
  be skipped) and a real-engine play-through test.
