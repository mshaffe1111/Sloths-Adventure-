# 5-M fix, Nov 1 2026 (branch fix-5m)

The fixes for Matt's run of Oct 31 ("Missing Meeca. Falling thru floor. Repetitive."). Each has an engine test in
`src/game/meecaFix.test.ts` (or `canvasLost.test.ts`) that fails on main and passes here.

## What was wrong, and the fix

| # | Problem | Root cause | Fix |
|---|---|---|---|
| 1 | Meeca goes in and out (Matt's Pixel) | Not reproduced off the phone (headless draws her every frame at q0/q1/q2, reduced motion, 448x998 at dpr 3: `tools/qa/meecaVisible.cjs`, 0 misses). One real gap found: a baked sprite copy that Chrome took back and then gave back EMPTY (`contextrestored`) was never noticed, so it drew nothing from then on. Her walk/idle/jump/climb frames come from such a copy when the stage starts at the lowest quality. | `canvasLost.ts` watches every baked copy for `contextlost`/`contextrestored`. Plus a soft moonlight on her and a glow at her hands while she carries something, so she reads among the brown soldiers and on dark dirt. |
| 2 | Room 4: two lives lost | (a) Tea tipped from the floor, lift up, she drops into its well, the table is set again and the plank comes DOWN ON HER. (b) A double jump out of the well beside the Butler's arch: the ledge hoist grabbed the arch door's top with the arch wall standing on it, so she was hoisted, pushed off, dropped, hoisted again (Matt's "held, 5 jumps, vx 0"), then slid into the floor. Room 4 is the same on every roll. | A lift waits while anyone is under it (`liftOver`). The hoist needs room above the lip (`lipHasRoom`). |
| 2b | Room 4 unsolvable without hints | Flicker's first nudge waited for 20 s with nothing new done; every cup, tip and reset was "new". | The first nudge comes 20 s after she comes in, however busy (also fixes room 3's late knot hint). |
| 3 | Log pit before every room | One new bag of section kinds per trail, so "logs" came on almost every trail; 4 hops of 94-110 px. | One bag for the whole stage; at most three log crossings a play, each its own shape (level row of wide logs, logs stepping up to a high bank, two long low logs); hops 60-85 px, at most 30 up, logs 140-195 wide. "Too far to jump. The high way, then." as she reaches the bank. |
| 4 | Room 5: dark step when she lands | The steps are lit only by Flicker, who trails her. | Her leap carries the light ahead; a lit step keeps it 1.2 s. |
| 5 | Before room 1 (Easy): wrong-looking route | Nothing said the wall is the room's puzzle. | Placeholder line at the wall (below). |
| 6 | Camera | Scene camera kept a stale y between scenes (289 px one-frame jump at the moonflower, 109 px into the ending); whip pans of 40-93 px a frame into rooms; the sapling left her at its root and put her on the ledge 429 px away in one frame. | Scene y reset; 5-M's view moves at most 900/700 px a second (not for a second after she is put somewhere); the sapling carries her over. Full-run test: no view move over 40 px in a frame, upright or sideways. |
| 6 | Room 2 gate | No words when it opened. | Placeholder open line (below). |
| 6 | Room 3 knot under the HUD sideways | Knot 268 px up. | Knot 220 px up (clear of the sign at 844x390 and 740x360); the throw up aims to be over it as it reaches its height. |
| 6 | Steering ignored at the silk | Caught for 1.25 s + 0.8 s, nothing she did counted. | Steering shakes her loose twice as fast; free in about a second. |
| 6 | Chair lets go after one short steer | A touch flickering in and out of the steer's dead zone counted as several new slides. | A slide the same way again counts only after the thumb was still 0.15 s. |
| 6 | Card needs two taps | A tap while the card settled or the art loaded was dropped. | The tap is kept. (A tap on the app's own "World 5 - Stage 5-M" veil, before the game exists, still does nothing.) |
| 6 | Easy hearts not picked up | A heart is picked up only when hurt; nothing hurts her. | No Easy hearts on 5-M. |

## Lines for Matt (placeholders in the build until he approves)

1. Meeca, at the foot of room 1's high wall: "Too high. There's a way up in here."
2. Meeca, as room 2's gate opens: "The gate's open! Sleep tight, beetles."

## Not fixed

- Meeca's right edge overlaps the painted bank face when she stands flush against room 5's far wall (minor; changing 5-M's body width would move every collision).
- The gully stairs look the same in every section that has one; more variety there needs new art (HF art is menu-only today).

## Stills

- `log-crossings-sideways.jpg`, `log-crossings-upright.jpg`: the three crossing shapes at 844x390 and 448x998.
- `meeca-walk-dpr3-crops.jpg`: her through the camp and onto the first trail at Matt's size, dpr 3, with her light.
- `matt-2331-frames-zoom.jpg`: Matt's clip at 0.2, 4.4, 5.6 and 9.0 s (at 9.0 s she is there, faint, by the post).
