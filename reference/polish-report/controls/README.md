# Build 2: controls that never misread (branch polish-controls, 2026-10-29)

The polish report's Build 2 items CT-1, CT-2, CT-3, CT-4, CT-9, CT-7, CT-6, CT-12 and CT-10, with CT-11 coming free with CT-1. Each one was reproduced headless, fixed, and kept as a regression test in `src/game/controlsB2.test.ts`.

- **CT-5 waits for Matt's call.** Nothing was changed there.
- **CT-8 step 1 and CT-20** belong to another helper.

The phone test for Matt is in `PHONE-TEST.md`.

## How it was tested

- **`src/game/touchRig.ts`** runs the whole touch chain with no screen, on one virtual clock:
  - scripted fingers go into the real recogniser (`touchGestures.ts`);
  - the recogniser drives the real `InputEngine` (its buffers and its minimum jump hold);
  - the real engine reads that at 30 fps.
  - A finger lifted 10 ms before a frame reaches the engine before that frame, as on a phone. `freeze()` runs the clock with the engine stopped, as a hitstop does.
- **`tools/qa/touchReplay.ts`** replays the testers' recorded touches (the Sloths control tests sheet) through the recogniser:
  - all 86 sessions and 30,063 touches, Oct 23-29;
  - what the game told the rules (in the air, on a vine) comes from Pokey's recorded state;
  - `tools/qa/touchReplayDecode.py` decodes the sheet;
  - the decoded file stays out of git (it is testers' touches);
  - `DUMP=<column>` prints the misses to look at, and `TUNE='{...}'` tries other numbers.
- **"Before" in the tables** means the base commit ffebdc0, replayed with the same tool and the same definitions.

### How the replay judges intent

- **Ground flicks:**
  - Pokey is on the ground.
  - The flick rose 18 px or more at 0.4 px/ms or faster, and at least 1.2 times as far up as across.
  - "Clear" means 34 px or more. "Short" means 18-34 px and lifted at once.
- **Vine strokes:**
  - *Quick flick* (should let go): 28-60° over at 0.6 px/ms or faster, or 22-60° at 1 px/ms or faster. This is the report's CT-3 envelope.
  - *Straight climb* (should climb): under 15° off vertical.
  - *Slanted climb* (should climb): 15-28° and slower than 1 px/ms.
- **Watch column, "never rose 12 px, but jumped":** taps, steers and wobbles that jumped. It must not go up.
- **The replay doesn't decide on its own what a borderline stroke "meant".** It measures how closely the rules match the intent the report specified.

## Results: replay of the testers' touches, before → after

| | before | after |
|---|---|---|
| clear ground flicks that missed | 0.3% (11/3731) | 0.2% (6/3731) |
| short ground flicks (18-34 px) that missed | 85.2% (23/27) | 18.5% (5/27) |
| flicks that punched instead | 1 | 0 |
| never rose 12 px, but jumped (watch) | 1.9% (146/7815) | 2.0% (153/7815) |
| straight vine climbs that let go | 32.0% (41/128) | 4.7% (6/128) |
| slanted vine climbs that let go | 75.0% (42/56) | 10.7% (6/56) |
| quick vine flicks that did not let go | 9.1% (50/547) | 6.2% (34/547) |
| resting second thumbs that threw a mega | 58.8% (20/34) | 47.1% (16/34) |
| second thumb's straight flick on a vine let go (CT-5, unchanged) | 89.5% (17/19) | 89.5% (17/19) |

### Every clear gesture misread, per player and grip

This is the clear and short flicks, the three vine kinds and the rests, together.

| who (grip) | before | after |
|---|---|---|
| all | 4.1% (187/4523) | 1.6% (73/4523) |
| all, portrait | 4.3% | 1.7% |
| all, landscape | 2.9% | 0.8% |
| Mike (two thumbs, phone in one hand) | 0.0% (0/47) | 0.0% |
| yana | 0.0% (0/34) | 0.0% |
| Cheddarbob (index finger, small iPhone) | 4.8% (2/42) | 2.4% (1/42) |
| Jane | 11.3% (6/53) | 9.4% (5/53) |
| Steph | 2.5% (18/707) | 1.4% (10/707) |
| Matt | 3.3% (74/2246) | 1.1% (25/2246) |
| Sasa | 0.4% (1/244) | 0.0% |
| Sally (never played before) | 11.2% (37/330) | 5.8% (19/330) |
| Jen (index finger) | 8.1% (26/322) | 0.3% (1/322) |
| others | 4.6% (23/498) | 2.4% (12/498) |

The full tables, with every column per player and portrait vs landscape, are in `replay-before.md` and `replay-after.md`.

### Why these differ from the report's figures

The report's figures (Mike 15%, yana 9.5% and so on) came from what the *live* game did at the time, across older builds. These replays judge *today's* rules and this branch's rules on the same touches. Mike's and yana's misses were mostly fixed before this branch.

### What got worse, and what is left

No player's overall rate went up. Two small cells did:

- **Jen landscape** went from 0 of 15 to 1 of 15.
- **"Others" quick vine flicks** went from 1 to 4 of 32.

All five are strokes about 24-27° over at 0.7-0.9 px/ms. The CT-3 specification makes those climbs: the 28° bucket, which I set at 26.5° to keep the swing card's 27° "up and forward" flick a leap. They are the true borderline. Matt's phone test (step 2) is the referee.

What is left:

- **Jane (9.4%):** mostly one pattern that no CT item covers. She slides deep down (a duck), then flicks up 200-400 px straight away, and the jump is refused while the duck is on. See "New finding" below.
- **Sally (5.8%):**
  - swing pumps that end in a 50-66° whip, which the anti-pumping rule (Matt, 10-26) treats as steering on purpose;
  - long holds that throw a mega, which is by design.
- **Watch column (+7 touches):** almost all from one phone (Sasa's) that reports a finger move only every 200-400 ms. There a 26-30 px jump from one sample to the next can't be timed, so it is taken as a flick. This came with CT-9's 26 px.

## Item by item

The reproduction, the fix, and the proof. Every test below fails on the code before its fix and passes after.

### CT-1 and CT-11: the one-thumb running jump

**Reproduction.** A one-thumb running jump, lifted at once, tried at every phase against the 30 fps frames, carried 93 px in 5 of 12 phases. With the thumb kept down it carried 178 px. A flick that arcs 40 px back toward the palm carried 98 px every time: the arc read as a stop.

**Fix:**
- No ground braking on the frame he takes off.
- The intent lock: while the steering thumb is flicking up, and for 120 ms after its jump, the run keeps its way.

**Proof.**
- Lifted at once: 170 px on 6 of 12 phases and 181 px on the rest (it was 93 px on 5 of 12).
- Thumb kept down: 177-178 px.
- The 40 px arc: 172-178 px (it was 98 px).
- The regression test asks for 165 px or more at every phase.

**Separate finding, not fixed here.** The 170 vs 181 split that remains comes from the run code. At exactly run speed it bleeds 17 px/s every other frame (285, then 268), so take-off speed depends on frame parity.
- Making it steady (`<` to `<=` in the run code) raised the average run speed by about 3% everywhere.
- That broke Meeca's timed sneaking playthroughs (`meecaReal`, 6 tests) and the puzzle kit's test room, so I undid it (30e1485).
- It is the lead's call whether to fix it and re-time those stages.

### CT-2: the Pad, keyboard and controller on a vine

**Reproduction.** The Pad pushed up on a trunk leapt off. On a liana it let go. A 45° push didn't leap.

**Fix:**
- `PadInput` in `padControl.ts`: the Pad's decisions, now testable. `PadController` only draws.
- On a vine, up and down climb (`triggerTouchClimb`). Only Jump, or a push 45° or more over with 38 px of up, leaps, the way it leans.
- Keyboard: Up/W climb on a vine, Space leaps.
- Game controller: the stick or D-pad up climbs, A leaps. Off a vine, everything still jumps.
- A jump released while climbing no longer stops the climb.

**Proof.** Three Pad tests (trunk, liana, leaving) and a keyboard and controller test.

### CT-3: slanted climbing strokes

**Reproduction.** A 22° stroke at 0.3 px/ms let go. So did a climb that bends over at its end.

**Fix.** A leap is a *fresh* flick:
- from any point of the last 120 ms to now, it rose more than 34 px;
- at 0.58 px/ms or faster along its path, and rising at 0.38 px/ms or faster;
- 26.5° or more over (21.5° at 0.95 px/ms);
- and the finger wasn't already climbing slowly in the 60 ms before.

The same lean test applies on lift under 45°.

These numbers were tuned by replay (grid in the commit). The report's 28° / 0.6 / 1.0 / 100 ms moved slightly because two older tests sit exactly on those edges:
- the swing card's 27° flick at 0.89 px/ms;
- a 30° flick at exactly 0.6 px/ms.

One older test changed: `vineFollowUps` no longer expects a 25° flick at 0.6 px/ms to leap. CT-3 makes that a climbing stroke, and its faster speeds still leap.

**Proof.** The CT-3 tests, and the replay table above.

### CT-4: stopping on a trunk

**Reproduction.** He climbed 51 px past where the thumb lifted or eased back. A 10-20° stroke, eased back to stop, dropped him off the side.

**Fix:**
- The grab's climb carry runs down even while up is held, and an explicit stop ends it.
- On a trunk, a steer starts only on a fresh, clearly sideways stroke: 40 px or more, twice as far across as up or down, 0.3 px/ms or faster.
- The hop-off needs that steer held 0.35 s by touch and Pad (0.2 s on keys).
- The Pad steers there only when clearly sideways.
- A climb that starts re-centres the sideways anchor.

My first fix dropped the touch hop-off entirely. That broke a real route: the 1-10 boss bot steps off a trunk sideways, and `bossFair` and `bossReach` failed. So the report's other option is what shipped (commit 751dfb9).

**Proof.** Overshoot 51 → 0 px. Drops off 3 of 4 → 0 of 4. A deliberate sideways stroke still steps off either way.

### CT-9: short quick flicks

**Reproduction:**
- 18, 22, 26 and 36 px flicks punched, or did nothing, from a lone finger on either half and from a second finger.
- The steering thumb's 30 px flick only stopped him.
- A 15 px quick flick punched.

**Fix:**
- One rule at lift for every finger: the last 150 ms rose 18 px or more, at 0.4 px/ms or faster, and at least 1.2 times the sideways travel.
- A tap also needs its quickest moment under 0.35 px/ms, or a rise under 12 px.
- A flick up jumps at 26 px for every finger on the ground (it was 34-41 px).
- The lift rule respects the second jump's 160 ms lock.

**Proof.** The CT-9 tests. In the replay, short flicks missed went 85% → 18.5%.

### CT-7: a resting action thumb

**Reproduction.** Rest 460 ms, then flick 60 px: a mega, and no jump.

**Fix:**
- The mega no longer uses the finger up.
- The hold is 550 ms.
- The finger must be still at that moment, so a flick just starting is no hold.

**Proof.** Rest 460 or 540 ms: no mega, and the flick jumps. Rest 800 ms: the mega, *and* the flick jumps.

### CT-6: the back swipe

**Fix:**
- `backGuard.ts`: while a stage is on, one history entry of our own sits on top. A Back gesture takes it off, the stage pauses, and the entry goes back.
- How to Play's Menu section explains this, and says to keep thumbs a finger's width in from the edges.

Dot speaks the first-stage coach lines from `dotLinesData.ts`, which this build doesn't touch. My first edit to the coach card's sub-text was text nobody sees, so it was undone.

**Proposed Dot line for the lead and Matt**, as a coach follow-up in 1-1: "Keep your thumbs a finger's width from the edges."

**Proof:**
- `backGuard.test.ts` covers this with a fake history.
- In a real browser (Playwright, phone-sized touch viewport, portrait and landscape), Back during 1-1 opened the Pause menu and stayed on the page. After Resume, a second Back paused again.
- Screenshots: `shots/ct6-portrait-2-after-back.jpg` and `shots/ct6-landscape-2-after-back.jpg`.

### CT-12: jump height

**Reproduction:**
- Heights by frame phase were 94-97 px.
- After a 45, 80 or 110 ms hitstop just after the flick, heights were 94, 85 and 75 px.

**Fix.** The 220 ms minimum hold of a touch or Pad jump counts down in the input's per-frame update (game time), from the take-off the engine reports (`noteTakeOff`). It no longer runs on the wall clock from the press. Hitstop and the 0.05 s frame cap live outside `update`, so they no longer run it down.

**Proof.** 97 px at every phase and after every hitstop.

### CT-10: a jump beside a trunk

**Reproduction.** Standing 30 px from a trunk, a flick up and away grabbed the trunk.

**Fix:**
- A ground jump grabs the trunk only if its flick didn't lean away and the steer isn't away.
- In the air, it grabs when moving toward the trunk, or when holding up or down without leaning or steering away.
- The lean counts only while the press is fresh.

**Proof.** Either side of the trunk: straight up and toward both grab; leaning away and steering away both jump.

## New finding, not in the report: a duck, then a big flick up

Jane's grip slides deep down, a duck, and flicks straight up 200-400 px in one stroke. The steering thumb's quick-jump path is off while the duck is on (`steer`, `quick` requires `!this.duckOn`), and coming back up past the anchor reads as leaving the duck, not as a jump. So the jump is lost.

Suggested fix: while ducking, a rise of 60 px or more at 0.6 px/ms or faster, measured from the duck's low point, is a jump. Not built here: it isn't a CT item, and it needs its own replay check.
