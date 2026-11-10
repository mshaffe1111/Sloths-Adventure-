# TASK R-165.60   to: Designer   effort: high   due: <date at dispatch + about 4 h>
## First, before any tool call
Read ALL of these with `git show origin/ccr-ca657d3c-n09zty:<path>` (after the fetch in the packets README): reference/roles/README.md, then reference/roles/DESIGNER.md, then its
knowledge pack in the card's order (your turnover note, reference/handoffs/designer.md, is in it). Push back, suggest, go beyond inside
your WRITE files.
## Objective
Pokey's real reach at 30 fps, measured by flying the real engine, and the gap, rise and help numbers that follow, so the 1-1 lessons
can be re-laid on true numbers.
## Why it matters
The 11-07 outside review's simulation of FEEL.md (reference/consultant/2026-11-07-scripts/sim.py, gaps.py; not the engine) says the
builder rates the single jump about +10 px and the bounce about +14 px too high and the distance 20-50 px short. If true, double-jump
lessons can be crossed with one jump. Nobody has yet measured the engine itself (handoffs/planner.md §2). A child on Easy was stuck 37
minutes with no help stepping in.
## Frozen inputs (do not change)
- The engine (src/game/physics.ts PHYS, the 30 fps loop) is the truth; the pipeline's constants are what's under test.
- The readings to fly: gaps.py's take-off model (L, how far the centre passes the near lip; k, airborne ticks before the jump registers,
  within coyote) and its three far-side landing rule sets (generous, medium, strict), as defined in gaps.py:1-16, checked against the
  engine's real landing code. Where the engine settles a rule, say which reading is the real one.
- Who the game is for (Matt, 11-07; R-165.71): Normal is tuned for players of 12 and up and must be hard enough for adults; Easy is
  for children. Every band and help number is set per setting. Help (R-165.62): on Easy it steps in by itself; on Normal it is
  offered, the player may ignore it, and the stage never changes by itself.
- The lead's decisions 11-07: no lethal drops in 1-1 on either setting (R-165.53; 1-1 is where the controls are learned); a player's first 1-1 run is one fixed layout, replays roll (R-165.52);
  the bounce is taught by the `lesson.bounce` card at the first mushroom (story keeper).
- The PM's word (DESIGNER.md "You never"): you MAY change all of handoffs/designer.md §3.2 (Normal teach 195-205 px, TEST 205-228 px,
  Easy rise twins 110-114 px, and its physics line "a single reaches 175 px (reachJump) plus 21 px") and §3.3 (bounce lip 200-220 px)
  where the flown numbers require it, each change with its evidence. Nothing else in §3 moves.
- handoffs/designer.md §3.10 is superseded WHOLE by STAGE-RULES.md "What may float" (Matt 11-07, R-165.54): boughs and branches are
  attached to something; earth islands and ledges, logs and planks may float; rocks and decor never float. Both its earth clause
  ("waits on Matt's open A/B question") and its boughs clause ("may float with no support") are wrong. Rewrite §3.10 to the ruling.
- Prove the harness before you trust it: realPlay's FakeInput sets a 0.16 s jump buffer per press (realPlay.ts:273) while the
  game keeps a press for pressKeep(): 0.167 s on Normal, 0.233 s on Easy (inputEngine.ts:19, physics.ts:41-42), so FakeInput is short
  on both settings; and RealPlay takes no setting argument (difficulty.ts setDifficulty).
  Set the setting, and state where FakeInput differs from inputEngine.
- "FEEL.md" is in no branch of this repo; gaps.py's 15.8 / 26 / 8 px figures come from it. Take those figures from the engine's
  landing code instead.
## Files
- READ: the card's pack; src/game/realPlay.ts (drives the pad's controls); src/components/CoachOverlay.tsx (COACH_TEXT.pad); the touch
  input code (src/game/touchGestures.ts and what it calls).
- WRITE: reference/specs/reach.md, bands.md, help.md, touch.md; reference/specs/sims/; reference/specs/packets/ENGINE-flight-test.md
  (and ENGINE-touch-harness.md if item 4 needs it); reference/handoffs/designer.md.
## Definition of done (the Critic checks each)
1. reach.md: single, double, bounce and bounce+double rise and level distance, flown in the real engine (realPlay.ts) at 30 fps, under
   the readings above, each with tolerance and the one command that reproduces it; side by side with JUMP_RISE, DOUBLE_RISE,
   BOUNCE_REACH, reachJump and maxGap, with a verdict per constant: confirmed, or wrong by how much.
2. bands.md: gap and rise bands per setting (Easy, Normal) for a single-jump section, a double-teach section (a single running jump
   fails it under the real reading) and a bounce teach (a bounce alone clears it); a table of which w1 sections, gaps and Easy twins move.
3. help.md: when help steps in (failures and seconds), what each step does, for Easy and Normal, with benchmark sources.
4. touch.md: does a pad player TAPPING Jump twice clear the double-teach band, flown in realPlay (decides the coach line, R-165.57)?
   For a touch tap, from the touch input code: is a tapped jump's height the same as the pad's? If proving it needs a touch flight
   harness, hand that over as a ready Engine packet instead (reference/specs/packets/ENGINE-touch-harness.md).
5. The Engine packet for the permanent src/ flight test, ready for the PM: reference/specs/packets/ENGINE-flight-test.md, in the
   shape of reference/methods/dispatch-packet.md.
## Return
Branch t-r165-60-reach from origin/main, pushed (git ls-remote). REPORT.md in the 7 sections, 60 lines or fewer. Last message 10 lines.
## Attempt
1
