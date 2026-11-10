# Touch and the Pad: is a tapped jump the same jump? (R-165.60 item 4; decides the coach line, R-165.57)

Flown 2026-11-09 with the game's own `InputEngine` on the real engine (`npx tsx reference/specs/sims/flight.ts <normal|easy> touch`,
and `apex`, `rshare`; saved in `reference/specs/sims/out/`). Tolerance ±2 px. Normal 1-1 and Easy.

## 1. The answer
**No. A Pad player TAPPING Jump twice does not clear the double band, and a tapped Pad jump is not the height of a touch flick.**

| How the jump is pressed | Code | Held by the input | Apex | Highest block climbed |
|---|---|---|---|---|
| Touch flick (the gesture controls) | `TouchController` → `triggerTouchUp(lean, undefined, slant)` | 220 ms after take-off (`MIN_TOUCH_JUMP_HOLD_MS`, inputEngine.ts:13) | 97.2 px | 123 px |
| The Pad pushed up | `padControl.ts:142`, source `pad` → `holdMs` undefined | 220 ms | 97.2 px | 123 px |
| The Pad's Jump button, tapped | `padControl.ts:142, 197`, source `btn` → `PAD_HOP_MS` 80 | 80 ms | **61.7 px** | 87 px |
| Jump held (button or key) | the same press, not let go | as long as held | 97.8 px | 123 px |

A touch flick cannot be shortened: its 220 ms outlasts the cut (after 220 ms he rises at 222 px/s, under `cutV` 230). The button's
80 ms ends while he still rises fast, and the cut drops him to 230 px/s, so a tap is a hop of 63% height.

## 2. Tap, tap against the bands (bands.md)

| The ask | tap, tap | flick, flick | hold, hold |
|---|---|---|---|
| Double rise 128-132 px (Easy's band) | 53% | 100% | 100% |
| Double rise 136-140 px (Normal's band) | 45-37% | 100% | 100% |
| Old double gap 195 / 205 px | 74% / 63% | 99% / 97% | 100% / 99% |
| Double gap test 250 / 262 px (Normal) | 18% / 9% | 72% / 61% | 81% / 71% |
| Single gap from 70 px before the lip | crosses 77 px | 128 px (N), 132 (E) | 137 (N), 141 (E) |

Shares: rises over 11 take-off spots x 15 second-press moments; gaps over 336 tries (take-off from 70 px before the lip to the last
ground frame, second press 3-14 frames later). A tap here is the button down for 2 frames (66 ms).

## 3. What follows
1. **The Pad coach line is wrong for the bands** (CoachOverlay.tsx `COACH_TEXT.pad.jump`: "Tap the Jump button to leap. Tap it again
   in the air for a double jump."). A child who does what it says clears the Easy double rise about half the time. The line that
   matches the engine: **"Press and hold Jump to leap. Press it again in the air for a double jump."** (Words are the story
   keeper's and Content's; the fact is the Designer's.)
2. **Better, on Easy: make a tap a full jump.** With the button's minimum hold at 220 ms the tap column becomes the flick column
   (100% on the rise band). The hop is a skill for Normal; a child does not need it. This is an Engine change to `PAD_HOP_MS` by
   setting, proposed in REPORT.md "Suggestions"; until it ships, line 1 is the fix.
3. The single-jump bands hold for a tapper only near the lip: a tap from 35 px before the lip crosses 112 px (Easy's limit is 114).

## 4. A touch flight harness
Not needed as a new packet: `src/game/touchRig.ts` already drives the real recogniser (`touchGestures.ts`) into the real `InputEngine`
and engine. The flights above enter at `triggerTouchUp`, the one call both the gesture sink and the Pad make, with the hold each
passes. What they do not cover: how long real fingers hold the button (the Analyst's hold-time data decides whether "tap" is the
common press).
