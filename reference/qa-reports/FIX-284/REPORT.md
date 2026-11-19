# FIX-284 REPORT (DRAFT, filled as results land): 2-2's big lily pads to 2 Pokeys with art = floor; every number sized on the fake tap hop re-measured on the real one

Engine (level half), t-fix-284 from t-int-12 ce4ad461; ENG-285b's final model ba6b225b merged (the lead, 2:20 PM ET). Started 1:45 PM ET 11-19.

## 1. Big pad: size and art (show-first OK'd by the lead 2:37 PM ET, all three calls)
Measured (real engine, 2-2 designed roll, Pokey DROPPED onto the pad and landed by physics; stills/pair-*.png):
| | before (ce4ad461) | after |
|---|---|---|
| Pokey | drawn 89.1 tall (heroSprite.ts HERO_UNITS 66 x HERO_SPRITE_SCALE 1.35), ~70 px wide on screen, collider 44 x 48 | same |
| big pad floor (PAD_SIZES.big.w) | 260 px = 2.92 Pokeys | **180 px = 2.02 Pokeys** |
| big pad drawn | 260 x 1.15 = 299 px (3.4 Pokeys tall-units, ~4.3 Pokey widths); painted rim 20 px over the water each side of his floor | 180.7 px (M-03-a's painted top is its widest opaque row, 0.2%-99.6% of the picture: padtop.py) = the floor edge to edge |
| small pad | floor 130, drawn 150 (rim 10 px over the water) | floor 130, drawn 130 |
| crown lily | floor 300, drawn 345 | floor 300, drawn 301 (3.4 Pokeys: still giant; the lead: keep crownW 300) |
| big : small on screen | 299 : 150 = 1.99x | 180 : 130 = 1.38x (both at art = floor) |
| his feet down the painting | (in the dish) | 46% (big), 42% (small): in the dish, never the far rim or the water (padArt.test.ts) |

Code: rideLay PAD_SIZES.big.w 180; riverArt POND_ART carries each stood-on piece's measured `top`, pondBox/pondTopSpan lay it on the
floor (mirrored too), replacing padPiece's blanket `pl.width * 1.15`; a pad's `look` is always its size (beat rows told by `pad.by`),
so the painter never guesses big from width (it read w > 220).
Planted: src/game/padArt.test.ts: RED 2 of 3 on the old 260 / 1.15x, green 3/3 now.

## 2. The hop (ruling A, the lead 2:39 PM ET)
Flown on the real engine at 30 fps through the game's InputEngine (reference/qa-reports/FIX-284/hopReal.ts, .out), press to landing:
| press | frames (s) | along at a run | up |
|---|---|---|---|
| FakeInput bare press (what 2-2.md:9-11, rideLay.ts:256/:260, hopAir.ts used) | 9 (0.30) | 83 | 30 |
| Pad Jump button tap (PAD_HOP_MS 80) | 13 (0.43) | 119 | 62 |
| **touch flick (the default control; MIN_TOUCH_JUMP_HOLD_MS 220)** | **19 (0.63)** | **175** | **97** |
| a jump held to its top (either control) | 20 (0.67) | 184 | 98 |
| a chain of hops at a run, each pressed on landing (every control) | 276 px/s | | |

**Plainly: on touch a flick is a full jump by design (inputEngine.ts:7-13, "a flick must give a full one"). A touch player has no short
hop. Any design that asks a touch player for a short hop is wrong.** The "real tap hop 0.43 s / 106-119 px" in the roadmap row is the
Pad button's tap, the shortest hop any player makes.

PAD_HOP (rideLay.ts) holds the table; src/game/gen2/padHop.test.ts flies every row through InputEngine and holds it to the frame and
the pixel: RED 2/2 with the old 9 f / 83 px row planted, green now.

Every place that read the fake hop, and what moved:
| place | read | now |
|---|---|---|
| rideLay.ts PAD_FAIR.hold (1.0 s) | "land-decide-tap 0.2-0.4 s plus the tap hop's 0.30 s" | number stands: the hop's air time is spent OFF the pad; land-decide-press 0.2-0.4 s + 1 take-off frame |
| rideLay.ts PAD_FAIR.pace (230 px/s) | "a tap hop flies 83 px in 0.30 s (277 px/s, hopAir.ts)" | number stands: a hop chain is 276 px/s on every control (air speed = run speed) |
| rideLay.ts PAD_FAIR.reach (160) | "a held jump flies 184 px (hopAir.ts)" | number stands: PAD_HOP.held.along 184 |
| w2.ts W2_PADS doc | "a tap hop's 83 px edge to edge in the teach" | gaps under the Pad tap's 119 px (touch: 175) |
| realPlay.ts:303 | "the real tap hop is 0.43 s / 106-119 px" | Pad tap 0.43 s / 119 px; touch flick a full jump 0.63 s / 175 px |
| castBots (every 2-2 table so far) | the bots press through FakeInput with their own 0.16-0.20 s holds: a hop no thumb makes | `--input touch|pad|fake` (default fake, unchanged); 2-2 flown on touch and on the Pad below |
| 2-2.md:9-11 (on t-pitch-b, not on this branch) | "a tap hop is 9 frames (0.30 s), 83 px at a run, 30 px up ... pads one tap hop apart (under 83 px)" | replacement text in §6 for whoever owns 2-2.md |
| reference/specs/sims/hopAir.ts (t-pitch-b) | FakeInput press | superseded by hopReal.ts (same flat floor, InputEngine) |
| tools/inspect/lianaRide.test.ts:31-46 (ENG-24) | calls the Pad tap "the real hop" | true for the Pad; left as is (ENG's, and it asserts the Pad's 0.43 s) |
| 2-1 | rideLay is shared, but 2-1 lays no pads (only w2Arc22 places `pads`), and PAD_FAIR's numbers did not change | nothing moved in 2-1 |

2-2's rows against a touch flick (rows.ts): every pad-to-pad hop leaves 5-125 px before he could overshoot the next floor on a full-run
flick from the very edge (tightest: spur22's 50 px gaps, 5 px, a splash-back row). The Pad tap clears every gap but mixWeight/deep's
110-120 px, which the design already asks as held jumps. So no 2-2 row asks a touch player for a short hop.

## 3. Relist
seedlist 2-2 --check: PASS 100/100 on the moved layouts. Relist (`seedlist.ts 2-2 --count 100`): byte-identical, version a8d674dd (the
packed plans do not carry pad widths). 2-1's list: unchanged (no pads).

## 4. castBots 2-2, 1-40 x every bot x both settings
(PENDING)

## 5. Gates
(PENDING)

## 6. 2-2.md replacement text (lines 9-11, for its owner)
**Flown** (reference/qa-reports/FIX-284/hopReal.ts, the real engine through the game's InputEngine): a touch flick is a full jump by
design, 19 frames (0.63 s), 175 px at a run, 97 px up; the Pad button's tap (PAD_HOP_MS) is the shortest hop any player makes, 13 frames
(0.43 s), 119 px, 62 px up; a held jump 20 frames (0.67 s), 184 px, 98 px up; a chain of hops at a run makes 276 px/s on every control.
So a child's pad-to-pad (land, decide, press: about 0.2-0.4 s on the pad; the press leaves the pad the next frame) needs a pad that holds
1.0 s ... pads well inside a Pad tap apart (under 119 px edge to edge, and never so close that a touch flick's 175 px overshoots the next
floor) in the teach, up to a held jump (184 px) after.

## Polish check
(PENDING: finals with the frozen clock)

## Lessons applied
D41 (Pokey's drawn height 89.1, from the code), D19 (the hop test calls the engine through the game's own InputEngine, not a copy),
D59/D87 (every long run in the background; inbox read between steps), D86 (the CLAUDE.md list, every item), D81 (drawcheck 2-2 both ways:
pads redrawn), D40 (ENG-285's model merged first, so the hop work is not built on a model about to change), D30 (times from `date`).
